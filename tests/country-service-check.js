async (page) => {
  const browser=page.context().browser();
  const context=await browser.newContext({userAgent:`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browser.version()} Safari/537.36`});
  const p=await context.newPage(),events=[],countryRequests=[],statuses=[];
  const serve=async route=>{const url=new URL(route.request().url());let file=url.pathname==='/'?'/index.html':url.pathname;if(file.endsWith('/'))file+='index.html';await route.fulfill({path:'output/site'+file});};
  await context.route('https://shiromatz.com/**',serve);
  await context.route('https://other.example/**',serve);
  await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
  await context.route('https://us.i.posthog.com/**',async route=>{
    if(route.request().method()==='POST'){const body=route.request().postData()||'',data=new URLSearchParams(body).get('data');const parsed=JSON.parse(data?Buffer.from(data,'base64').toString('utf8'):body);events.push(...(parsed.batch||(Array.isArray(parsed)?parsed:[parsed])));}
    await route.fulfill({status:200,contentType:'application/json',body:'{"status":1}'});
  });
  p.on('request',async request=>{if(request.url().startsWith('https://shiromatz-country.vercel.app/')){const h=await request.allHeaders();countryRequests.push({method:request.method(),origin:h.origin,referrer:!!h.referer,cookie:!!h.cookie});}});
  p.on('response',response=>{if(response.url().startsWith('https://shiromatz-country.vercel.app/'))statuses.push(response.status());});
  await p.goto('https://shiromatz.com/projects/');
  await p.waitForTimeout(1600);
  const event=events.find(e=>e.event==='$pageview');
  if(!event||event.properties.access_country_code!=='US'||event.properties.access_country_name!=='United States')throw new Error('Real independent country result was not applied');
  if(countryRequests.length!==1||countryRequests[0].origin!=='https://shiromatz.com'||countryRequests[0].referrer||countryRequests[0].cookie||statuses[0]!==200)throw new Error('Country request privacy or CORS failure');
  await p.goto('https://other.example/');
  const blocked=await p.evaluate(async()=>{try{await fetch('https://shiromatz-country.vercel.app/analytics-country.json',{method:'HEAD',credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',redirect:'error'});return false;}catch{return true;}});
  if(!blocked)throw new Error('Disallowed origin could read the country response');
  const result={edge_country:event.properties.access_country_code,edge_country_name:event.properties.access_country_name,applied_to_page:event.properties.page_id,allowed_origin_request:countryRequests[0],disallowed_origin_blocked:blocked,country_http_status:statuses[0],posthog_intercepted:true,actual_country_endpoint:true};
  await context.close();return result;
}
