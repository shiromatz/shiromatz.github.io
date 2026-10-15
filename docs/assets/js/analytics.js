(() => {
  const ENVIRONMENT = "production";
  const PROJECT_TOKEN = "phc_qXc3L5CQAD3p2TEu2Du39oRNWKjB9NfxW4bmgDB8rc5u";
  const script = document.currentScript;
  const SDK_URL = new URL("../vendor/posthog-js-1.438.10.mjs", script.src).href;
  const pages = { "/": "home", "/index.html": "home", "/about/": "about", "/projects/": "projects",
    "/writing/": "writing", "/now/": "now", "/cv/": "cv", "/privacy/": "privacy" };
  const pageId = Object.hasOwn(pages, location.pathname) ? pages[location.pathname] : null;
  // Other project sites hosted below shiromatz.com have their own analytics policy.
  if (location.protocol !== "https:" || location.hostname !== "shiromatz.com" || location.port || !pageId) return;
  const pagePath = pageId === "home" ? "/" : `/${pageId}/`;
  const countryHelper = window.PROFILE_ANALYTICS_COUNTRY;
  const countryProperties = countryHelper?.countryProperties ||
    (() => ({ access_country_code: "unknown", access_country_name: "Unknown" }));
  let countryUrl;
  try {
    const candidate = new URL(script.dataset.countryUrl);
    if (candidate.protocol === "https:" && !candidate.port && !candidate.username && !candidate.password &&
      !candidate.search && !candidate.hash && candidate.pathname === "/analytics-country.json") countryUrl = candidate.href;
  } catch { /* Invalid endpoint configuration falls back to Unknown. */ }
  const getCountry = countryHelper && countryUrl ? countryHelper.createLookup({ url: countryUrl }) :
    (() => Promise.resolve(countryProperties()));

  const links = Object.freeze({
    "home": "navigation", "about": "navigation", "projects": "navigation", "writing": "navigation",
    "now": "navigation", "cv": "navigation", "privacy": "navigation",
    "toefl-speaking": "project", "pmp-explorer": "project", "tablegame": "project",
    "interval-camera": "project", "weather-archive": "project",
    "medium-skewed-words": "article", "medium-mc-dropout": "article", "medium-two-oods": "article",
    "medium-quantile-loss": "article", "medium-factor-analysis": "article", "medium-r-colab": "article",
    "medium-cyclic-encoding": "article", "medium-multicollinearity": "article", "medium-ant-problem": "article",
    "medium-hypothesis-tests": "article", "note-weather-warnings": "article", "note-toefl-speaking": "article",
    "note-anki": "article", "note-hypothesis-tests": "article", "note-weather-archive": "article",
    "note-weather-analysis": "article", "note-terms": "article",
    "github-profile": "contact", "linkedin-profile": "contact", "medium-profile": "contact",
    "note-profile": "contact", "yamareco-profile": "contact", "facebook-profile": "contact", "x-profile": "contact",
  });
  // Keep only the referring hostname, never the referring path, query, fragment or credentials.
  let referrerHost = "direct_or_unknown";
  try {
    const referrer = new URL(document.referrer);
    if (["http:", "https:"].includes(referrer.protocol)) {
      referrerHost = referrer.hostname === "shiromatz.com" ? "internal" : referrer.hostname;
    }
  } catch { /* Empty or unavailable referrer is not proof of a direct visit. */ }
  const safeReferrer = referrerHost === "internal" ? "https://shiromatz.com" :
    referrerHost === "direct_or_unknown" ? "" : `https://${referrerHost}`;
  function sanitize(event) {
    const p = event.properties;
    if (!["$pageview", "profile_link_clicked"].includes(event.event) ||
      p.distinct_id !== "$posthog_cookieless" || p.$cookieless_mode !== true ||
      typeof p.$raw_user_agent !== "string") return null;
    if (event.event === "profile_link_clicked" && !Object.hasOwn(links, p.link_id)) return null;
    const safe = {
      token: PROJECT_TOKEN, distinct_id: "$posthog_cookieless", $cookieless_mode: true,
      $raw_user_agent: p.$raw_user_agent, $process_person_profile: false,
      $current_url: `https://shiromatz.com${pagePath}`, $pathname: pagePath, $host: "shiromatz.com",
      $referrer: safeReferrer, $referring_domain: safeReferrer ? referrerHost : "",
      service_id: "shiromatz-profile", environment: ENVIRONMENT,
      schema_version: 1, release: "profile-posthog-v1", page_id: pageId, referrer_host: referrerHost,
      ...countryProperties(p.access_country_code),
    };
    for (const key of ["$lib", "$lib_version"]) if (typeof p[key] === "string") safe[key] = p[key];
    if (event.event === "profile_link_clicked") {
      safe.link_id = p.link_id;
      safe.link_group = links[p.link_id];
    }
    return { ...event, properties: safe };
  }
  let sdk, readyClient, pending = 0, failureReported = false;
  const waitingForCountry = new Set();
  function reportFailure() {
    if (!failureReported) console.warn("Analytics is unavailable; navigation is unaffected.");
    failureReported = true;
  }
  // Deliver already-created events synchronously while the document is leaving.
  window.addEventListener("pagehide", () => {
    if (!readyClient) return;
    for (const deliver of waitingForCountry) {
      try { deliver(readyClient, countryProperties(), { transport: "sendBeacon", send_instantly: true }); }
      catch { reportFailure(); }
    }
  });
  function track(event, properties = {}) {
    if (pending >= 128) return;
    const snapshot = { ...properties };
    sdk ??= import(SDK_URL).then(({ default: posthog }) => {
      posthog.init(PROJECT_TOKEN, {
        api_host: "https://us.i.posthog.com", cookieless_mode: "always",
        persistence: "memory", person_profiles: "never", autocapture: false,
        capture_pageview: false, capture_pageleave: false, capture_performance: false,
        capture_exceptions: false, capture_dead_clicks: false, capture_heatmaps: false,
        rageclick: false, disable_session_recording: true, disable_surveys: true,
        disable_web_experiments: true, disable_conversations: true, disable_product_tours: true,
        disable_external_dependency_loading: true, advanced_disable_flags: true,
        opt_in_site_apps: false, save_referrer: false, save_campaign_params: false,
        internal_or_test_user_hostname: null, disableDeviceModel: true, debug: false,
        request_batching: false, disable_compression: true, before_send: sanitize,
      });
      readyClient = posthog;
      return posthog;
    }).catch(() => { reportFailure(); return null; });
    pending += 1;
    let sent = false;
    const deliver = (client, country, options) => {
      if (!client || sent) return;
      sent = true;
      waitingForCountry.delete(deliver);
      client.capture(event, { ...snapshot, ...country }, options ||
        (event === "profile_link_clicked" ? { transport: "sendBeacon", send_instantly: true } : undefined));
    };
    waitingForCountry.add(deliver);
    void Promise.all([sdk, getCountry()]).then(([client, country]) => deliver(client, country))
      .catch(reportFailure).finally(() => { waitingForCountry.delete(deliver); pending -= 1; });
  }
  function trackLink(event) {
    if (event.defaultPrevented || (event.type === "auxclick" ? event.button !== 1 : event.button !== 0)) return;
    const link = event.target instanceof Element ? event.target.closest("a[data-analytics-link]") : null;
    const id = link?.dataset.analyticsLink;
    if (Object.hasOwn(links, id)) track("profile_link_clicked", { link_id: id });
  }
  document.addEventListener("click", trackLink);
  document.addEventListener("auxclick", trackLink);
  window.addEventListener("pageshow", event => { if (event.persisted) track("$pageview"); });
  track("$pageview");
})();
