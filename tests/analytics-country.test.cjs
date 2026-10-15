const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "../docs/assets/js/analytics-country.js"), "utf8");
const plain = value => JSON.parse(JSON.stringify(value));
const unknown = { access_country_code: "unknown", access_country_name: "Unknown" };
function fixture(options = {}) {
  const sandbox = { window: { setTimeout, clearTimeout }, AbortController, ...options };
  vm.runInNewContext(source, sandbox);
  const helper = sandbox.window.PROFILE_ANALYTICS_COUNTRY;
  return { ...helper, createLookup: (options = {}) => helper.createLookup({ url: "https://shiromatz-country.vercel.app/analytics-country.json", ...options }) };
}
function response(code, ok = true) { return { ok, headers: new Headers(code ? { "X-Analytics-Country": code } : {}) }; }

test("country names are derived from permitted ISO codes, never arbitrary input", () => {
  const country = fixture();
  assert.deepEqual(plain(country.countryProperties("JP")), { access_country_code: "JP", access_country_name: "Japan" });
  assert.deepEqual(plain(country.countryProperties("US")), { access_country_code: "US", access_country_name: "United States" });
  for (const value of [null, undefined, "", "ZZ", "XX", "EU", "UN", "jp", "JP\nPRIVATE", "Tokyo", "192.0.2.1", "__proto__", "constructor", "toString", { code: "JP" }]) {
    assert.deepEqual(plain(country.countryProperties(value)), unknown);
  }
});

test("country labels stay stable regardless of browser locale data or Intl support", () => {
  for (const Intl of [{}, { DisplayNames: class { of() { return "DIFFERENT_BROWSER_LABEL"; } } }]) {
    const country = fixture({ Intl });
    assert.deepEqual(plain(country.countryProperties("JP")), { access_country_code: "JP", access_country_name: "Japan" });
    assert.deepEqual(plain(country.countryProperties("US")), { access_country_code: "US", access_country_name: "United States" });
    assert.deepEqual(plain(country.countryProperties("TR")), { access_country_code: "TR", access_country_name: "Türkiye" });
  }
  const labels = JSON.parse(source.split("Object.freeze(")[1].split(");")[0]);
  assert.equal(Object.keys(labels).length, 249);
  assert.ok(Object.entries(labels).every(([code, name]) => /^[A-Z]{2}$/.test(code) && typeof name === "string" && name.length > 0));
});

test("lookup is lazy, shared in memory and reads only the country response header", async () => {
  let calls = 0, optionsSeen;
  const lookup = fixture().createLookup({ request: async (url, options) => {
    calls++; assert.equal(url, "https://shiromatz-country.vercel.app/analytics-country.json"); optionsSeen = options;
    return response("JP");
  } });
  assert.equal(calls, 0);
  const first = lookup(), second = lookup();
  assert.equal(first, second);
  assert.deepEqual(plain(await first), { access_country_code: "JP", access_country_name: "Japan" });
  assert.equal(await lookup(), await first);
  assert.equal(calls, 1);
  for (const [key, value] of Object.entries({ method: "HEAD", mode: "cors", credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer", redirect: "error" })) {
    assert.equal(optionsSeen[key], value);
  }
  assert.equal(optionsSeen.body, undefined);
  assert.equal(optionsSeen.headers, undefined);
});

test("missing header, HTTP error, rejected and thrown requests settle as Unknown", async () => {
  for (const request of [async () => response(null), async () => response("ZZ"), async () => response("US", false),
    async () => { throw new Error("offline"); }, () => { throw new Error("blocked"); }]) {
    assert.deepEqual(plain(await fixture().createLookup({ request })()), unknown);
  }
});

test("hard deadline settles ignored aborts and late responses cannot change a page's country", async () => {
  let finish, signal;
  const lookup = fixture().createLookup({ timeoutMs: 10, request: (_url, options) => {
    signal = options.signal;
    return new Promise(resolve => { finish = resolve; });
  } });
  assert.deepEqual(plain(await lookup()), unknown);
  assert.equal(signal.aborted, true);
  finish(response("US"));
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(plain(await lookup()), unknown);
});

function lifecycleFixture(visibilityState = "visible") {
  const doc = Object.assign(new EventTarget(), { visibilityState });
  const win = Object.assign(new EventTarget(), { document: doc, setTimeout, clearTimeout });
  return { doc, win, country: fixture({ window: win }) };
}

test("pagehide and hiding the page settle pending lookups immediately", async () => {
  for (const trigger of ["pagehide", "visibilitychange"]) {
    const { country, doc, win } = lifecycleFixture();
    let complete, signal;
    const lookup = country.createLookup({ timeoutMs: 60000, request: (_url, options) => {
      signal = options.signal;
      return new Promise(resolve => { complete = resolve; });
    } });
    const pending = lookup();
    await new Promise(resolve => setImmediate(resolve));
    if (trigger === "pagehide") win.dispatchEvent(new Event("pagehide"));
    else { doc.visibilityState = "hidden"; doc.dispatchEvent(new Event("visibilitychange")); }
    assert.deepEqual(plain(await pending), unknown);
    assert.equal(signal.aborted, true);
    complete(response("US"));
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(plain(await lookup()), unknown);
  }
});

test("already hidden pages do not start a country request", async () => {
  const { country } = lifecycleFixture("hidden");
  let calls = 0;
  assert.deepEqual(plain(await country.createLookup({ request: () => { calls++; return response("US"); } })()), unknown);
  assert.equal(calls, 0);
});

test("visibility changes leave a resolved country untouched and listeners cleaned up", async () => {
  const { country, doc, win } = lifecycleFixture();
  let signal;
  const lookup = country.createLookup({ request: async (_url, options) => { signal = options.signal; return response("US"); } });
  const result = await lookup();
  doc.visibilityState = "hidden";
  doc.dispatchEvent(new Event("visibilitychange"));
  win.dispatchEvent(new Event("pagehide"));
  assert.equal(signal.aborted, false);
  assert.deepEqual(plain(await lookup()), plain(result));
  assert.equal(result.access_country_code, "US");
});
