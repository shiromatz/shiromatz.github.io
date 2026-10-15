async (page) => {
  const browser = page.context().browser();
  const context = await browser.newContext({ userAgent:`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browser.version()} Safari/537.36` });
  const p = await context.newPage(), sent = [], responses = [];
  const started = new Date().toISOString();
  await context.route('https://fonts.googleapis.com/**', route=>route.fulfill({contentType:'text/css',body:''}));
  await context.route('https://shiromatz.com/**', async route => {
    const url=new URL(route.request().url());
    let file=url.pathname==='/'?'/index.html':url.pathname;
    if(file.endsWith('/'))file+='index.html';
    await route.fulfill({path:file==='/assets/js/analytics.js'?'output/verification-analytics.js':'output/site'+file});
  });
  // The separate service has not been published. Verify Unknown ingestion, never pretend a mocked country is a real edge result.
  await context.route('https://shiromatz-country.vercel.app/**',route=>route.abort());
  p.on('request',request=>{
    if(request.url().startsWith('https://us.i.posthog.com/')&&request.method()==='POST'){
      const body=request.postData()||'',data=new URLSearchParams(body).get('data');
      const decoded=JSON.parse(data?Buffer.from(data,'base64').toString('utf8'):body);
      for(const event of (decoded.batch||(Array.isArray(decoded)?decoded:[decoded]))){
        const v=event.properties;
        if(v.environment!=='verification')throw new Error('Verification must never enter production charts');
        sent.push({event:event.event,timestamp:event.timestamp,page_id:v.page_id,link_id:v.link_id,country:v.access_country_name});
      }
    }
  });
  p.on('response',response=>{if(response.url().startsWith('https://us.i.posthog.com/'))responses.push(response.status());});
  await p.goto('https://shiromatz.com/');await p.waitForTimeout(450);
  await p.locator('.home-link[data-analytics-link="projects"]').click();await p.waitForURL('https://shiromatz.com/projects/');await p.waitForTimeout(450);
  await p.evaluate(()=>document.addEventListener('click',event=>event.preventDefault()));
  await p.locator('[data-analytics-link="tablegame"]').click();
  await p.locator('[data-analytics-link="toefl-speaking"]').click();
  await p.goto('https://shiromatz.com/about/');await p.waitForTimeout(450);
  await p.evaluate(()=>document.addEventListener('click',event=>event.preventDefault()));
  await p.locator('[data-analytics-link="linkedin-profile"]').click();await p.waitForTimeout(1000);
  if(sent.filter(e=>e.event==='$pageview').length!==3||sent.filter(e=>e.event==='profile_link_clicked').length!==4||responses.some(s=>s!==200))throw new Error('Unexpected verification wire result');
  await context.close();
  return {started,finished:new Date().toISOString(),sent,responses,environment:'verification',edge_geolocation_verified:false};
}
