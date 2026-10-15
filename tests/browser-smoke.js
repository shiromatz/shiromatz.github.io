async (page) => {
  const browser = page.context().browser();
  const actual = browser.version();
  const context = await browser.newContext({ userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${actual} Safari/537.36` });
  const p = await context.newPage();
  const captured = [], countries = [], requests = [], problems = [], checks = [];
  let countryMode = 'ok', releases = [], beacons = 0;
  const check = (condition, label) => { if (!condition) throw new Error(label); checks.push(label); };
  p.on('pageerror', error => problems.push(error.message));
  await context.route('https://fonts.googleapis.com/**', route => route.fulfill({contentType:'text/css',body:''}));
  const serve = async route => {
    const url = new URL(route.request().url());
    requests.push(url.href);
    let file = url.pathname === '/' ? '/index.html' : url.pathname;
    if (file.endsWith('/')) file += 'index.html';
    if (file.startsWith('/pmp-processes-interactive-map')) file = '/index.html';
    await route.fulfill({path:'output/site' + file});
  };
  for (const origin of ['https://shiromatz.com','https://profile-preview.vercel.app','http://localhost:4321']) await context.route(origin + '/**', serve);
  await context.route('https://shiromatz-country.vercel.app/**', async route => {
    countries.push({method:route.request().method(),headers:await route.request().allHeaders()});
    const mode = countryMode;
    if (mode === 'hold') await new Promise(resolve => releases.push(resolve));
    if (mode === 'offline') return route.abort();
    const headers = {'Access-Control-Allow-Origin': mode === 'wrong-origin' ? 'https://other.example' : 'https://shiromatz.com',
      'Access-Control-Expose-Headers': mode === 'unexposed' ? '' : 'X-Analytics-Country',
      'Cache-Control':'private, no-store', 'Vary':'X-Vercel-IP-Country'};
    if (mode !== 'missing') headers['X-Analytics-Country'] = mode === 'invalid' ? 'ZZ' : 'JP';
    try { await route.fulfill({status:mode === 'http-error' ? 503 : 200,headers,contentType:'application/json',body:''}); } catch { /* An aborted held request is expected. */ }
  });
  await context.route('https://us.i.posthog.com/**', async route => {
    const request = route.request();
    if (request.resourceType() === 'ping') beacons++;
    if (request.method() === 'POST') {
      const body = request.postData() || '', data = new URLSearchParams(body).get('data');
      const decoded = JSON.parse(data ? Buffer.from(data,'base64').toString('utf8') : body);
      captured.push(...(decoded.batch || (Array.isArray(decoded) ? decoded : [decoded])));
    }
    await route.fulfill({status:200,contentType:'application/json',body:'{"status":1}'});
  });
  const settle = () => p.waitForTimeout(180);
  await p.goto('https://shiromatz.com/?email=PRIVATE_QUERY&utm_source=PRIVATE_CAMPAIGN#PRIVATE_FRAGMENT', {referer:'https://search.example/private/path?secret=PRIVATE_REFERRER'});
  await settle();
  check(captured.length === 1 && captured[0].event === '$pageview', 'one explicit initial pageview');
  check(captured[0].properties.page_id === 'home' && captured[0].properties.referrer_host === 'search.example', 'page and referring hostname captured');
  check(captured[0].properties.access_country_code === 'JP' && captured[0].properties.access_country_name === 'Japan', 'browser reads exposed cross-origin country header');
  check(countries.length === 1 && countries[0].method === 'HEAD' && countries[0].headers.origin === 'https://shiromatz.com' && !countries[0].headers.cookie && !countries[0].headers.referer, 'country request has Origin but no cookie or referrer');
  check(await p.locator('a[href="/privacy/"]').count() === 1, 'privacy link appears in common layout');
  const pvBefore = captured.filter(e => e.event === '$pageview').length;
  await p.locator('.home-link[data-analytics-link="projects"]').click();
  await p.waitForURL('https://shiromatz.com/projects/');
  await settle();
  check(captured.some(e => e.event === 'profile_link_clicked' && e.properties.link_id === 'projects' && e.properties.page_id === 'home'), 'navigation click retains the source page');
  check(captured.filter(e => e.event === '$pageview').length === pvBefore + 1, 'normal navigation has one destination view');
  check(beacons > 0, 'clicks use immediate beacon delivery');
  for (const [path,group,expected] of [['projects','project',5],['writing','article',17],['about','contact',7]]) {
    await p.goto(`https://shiromatz.com/${path}/`);
    await settle();
    await p.evaluate(() => document.addEventListener('click', event => event.preventDefault()));
    const locator = p.locator(path === 'projects' ? '.project-card' : path === 'writing' ? '.article-card' : '.linklist a');
    const start = captured.length, count = await locator.count(), countryCount = countries.length;
    for (let i=0; i<count; i++) await locator.nth(i).click();
    await settle();
    const clicks = captured.slice(start).filter(e=>e.event==='profile_link_clicked');
    check(count === expected && clicks.length === expected && clicks.every(e=>e.properties.link_group === group), `${path} selected links are counted individually`);
    check(countries.length === countryCount, `${path} clicks share one country request`);
  }
  const beforeIgnored = captured.length;
  await p.evaluate(() => {
    const a = document.createElement('a'); a.href='https://example.com/PRIVATE_TARGET?secret=PRIVATE_TARGET'; a.dataset.analyticsLink='PRIVATE_LINK'; a.textContent='PRIVATE_TEXT'; document.body.append(a); a.click();
  });
  await settle();
  check(captured.length === beforeIgnored, 'unlisted links are excluded');
  const countriesBeforeMiddle = countries.length;
  await p.locator('[data-analytics-link="linkedin-profile"]').dispatchEvent('auxclick',{button:1});
  await settle();
  check(captured.at(-1).properties.link_id === 'linkedin-profile' && countries.length === countriesBeforeMiddle, 'middle click is counted without another lookup');
  for (const mode of ['missing','invalid','http-error','offline','wrong-origin','unexposed']) {
    countryMode=mode;
    await p.goto('https://shiromatz.com/projects/'); await settle();
    check(captured.at(-1).properties.access_country_name === 'Unknown', mode+' falls back to Unknown');
    await p.locator('.sitebar__nav [data-analytics-link="about"]').click(); await p.waitForURL('https://shiromatz.com/about/'); await settle();
    check(await p.locator('h1').textContent() === 'Shiro Matsumoto', mode+' leaves navigation usable');
  }
  countryMode='hold';
  await p.goto('https://shiromatz.com/'); await p.waitForTimeout(1400);
  check(captured.at(-1).properties.access_country_name === 'Unknown', 'hard deadline releases a nonresponding lookup');
  releases.splice(0).forEach(r=>r()); await settle();
  for (const lifecycle of ['pagehide','visibilitychange']) {
    await p.goto('https://shiromatz.com/'); await settle();
    const start=captured.length, beaconStart=beacons;
    await p.evaluate(type => {
      if (type==='pagehide') window.dispatchEvent(new PageTransitionEvent('pagehide'));
      else {Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true});document.dispatchEvent(new Event('visibilitychange'));}
    },lifecycle);
    await settle();
    check(captured.length === start+1 && captured.at(-1).properties.access_country_name === 'Unknown', lifecycle+' settles pending events promptly');
    if (lifecycle==='pagehide') check(beacons>beaconStart,'pagehide sends before Promise callbacks');
    releases.splice(0).forEach(r=>r()); await settle();
    check(captured.length === start+1,lifecycle+' late response does not duplicate delivery');
  }
  countryMode='ok';
  await p.goto('https://shiromatz.com/privacy/'); await settle();
  check(await p.locator('[lang="en"] #privacy-en').count()===1 && await p.locator('[lang="ja"] #privacy-ja').count()===1,'English and Japanese privacy sections rendered');
  check((await p.content()).includes('Google Analytics is not used') && !(await p.content()).match(/gtag\(|googletagmanager|G-S8JJLWE1JX/),'Google Analytics removed from generated page');
  await p.screenshot({path:'output/playwright/privacy-desktop.png',fullPage:true});
  await p.setViewportSize({width:390,height:844});
  check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile privacy has no horizontal overflow');
  await p.screenshot({path:'output/playwright/privacy-mobile.png',fullPage:true});
  for (const path of ['now','cv','writing','about','projects']) {
    await p.goto(`https://shiromatz.com/${path}/`); await settle();
    check(captured.at(-1).properties.page_id===path, path+' page identified');
    check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path+' mobile layout has no overflow');
  }
  await p.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))); await settle();
  check(captured.at(-1).event==='$pageview' && captured.at(-1).properties.page_id==='projects','bfcache restore records a view');
  const beforeIsolation=captured.length, lookupsBefore=countries.length;
  for (const url of ['https://profile-preview.vercel.app/','http://localhost:4321/','https://shiromatz.com/pmp-processes-interactive-map/']) { await p.goto(url); await settle(); }
  check(captured.length===beforeIsolation && countries.length===lookupsBefore,'preview, local and separate project paths load neither SDK events nor country lookup');
  await context.route('**/analytics-country.js',route=>route.abort());
  await p.goto('https://shiromatz.com/'); await settle();
  check(captured.at(-1).properties.access_country_name==='Unknown','missing helper preserves analytics with Unknown');
  await context.route('**/posthog-js-1.438.10.mjs',route=>route.abort());
  await p.goto('https://shiromatz.com/'); await p.locator('.home-link[data-analytics-link="projects"]').click(); await p.waitForURL('https://shiromatz.com/projects/');
  check(true,'blocked SDK does not prevent navigation');
  check(!(JSON.stringify(captured).match(/PRIVATE_|\$ip|latitude|longitude|\$geoip_|\$browser|\$session_id/)),'payload allowlist excludes private URLs, text, location details and unnecessary SDK enrichment');
  check(captured.every(e=>e.properties.service_id==='shiromatz-profile'&&e.properties.environment==='production'&&e.properties.$cookieless_mode===true),'service and cookieless context retained in real SDK payloads');
  check((await context.cookies()).length===0 && await p.evaluate(()=>localStorage.length===0&&sessionStorage.length===0),'no analytics cookies or persistent browser state');
  check(problems.length===0,'no application page exceptions');
  const result={checks,check_count:checks.length,event_count:captured.length,country_request_count:countries.length,beacons,all_posthog_requests_intercepted:true,edge_geolocation_verified:false};
  await context.close();
  return result;
}
