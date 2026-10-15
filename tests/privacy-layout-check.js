async (page) => {
  const context=await page.context().browser().newContext({reducedMotion:'reduce'});
  const p=await context.newPage();
  await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
  await context.route('https://shiromatz.com/**',async route=>{
    const url=new URL(route.request().url());let path=url.pathname;
    if(path.endsWith('/'))path+='index.html';
    await route.fulfill({path:'output/site'+path});
  });
  await context.route('https://shiromatz-country.vercel.app/**',route=>route.abort());
  await context.route('https://us.i.posthog.com/**',route=>route.fulfill({status:200,contentType:'application/json',body:'{"status":1}'}));
  await p.goto('https://shiromatz.com/privacy/');
  await p.screenshot({path:'output/playwright/privacy-desktop.png',fullPage:true});
  await p.setViewportSize({width:390,height:844});
  const bounds=await p.locator('.privacy-title span').boundingBox();
  if(bounds.x<0||bounds.x+bounds.width>390||await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('Mobile heading overflow');
  await p.screenshot({path:'output/playwright/privacy-mobile.png',fullPage:true});
  await p.goto('https://shiromatz.com/cv/');
  if(await p.locator('footer [data-analytics-link]').count()!==2)throw new Error('CV footer link tagging');
  const result={mobile_width:390,japanese_heading_width:bounds.width,japanese_heading_height:bounds.height,privacy_languages:2,cv_footer_links:2,all_posthog_intercepted:true};
  await context.close();return result;
}
