const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('fs');
const path=require('path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const output=process.env.REVIEW_SCREENSHOTS_DIR || require('node:os').tmpdir();
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await context.route('**/*',r=>r.request().url().startsWith(pathToFileURL(root+path.sep).href)?r.continue():r.abort());
 const paths=['index.html','weekly-checkin-portal/weekly-checkin-portal.html','funnel-management/pipeline-intelligence.html','net-new-tracker/net-new-tracker.html','pipeline-pulse/pipeline-pulse.html','sales-league/sales-league.html','portfolio-deep-dive.html'];
 const report=[];
 for(const file of paths){
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
  await page.goto(pathToFileURL(root+path.sep).href+file);
  await page.screenshot({path:path.join(output,'desktop-')+file.split('/').pop()+'.png',fullPage:false});
  await page.setViewportSize({width:390,height:844});
  const narrowOverflow=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
  await page.screenshot({path:path.join(output,'mobile-')+file.split('/').pop()+'.png',fullPage:false});
  await page.setViewportSize({width:1440,height:1000});
  const buttons=await page.locator('button[onclick*="switchTab"],button[onclick*="showTab"]').all();let clicked=0;const narrowTabs=[];
  for(const b of buttons){if(await b.isVisible()){await b.click();clicked++;await page.setViewportSize({width:390,height:844});narrowTabs.push({tab:await b.textContent(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});await page.setViewportSize({width:1440,height:1000});}}
  if(file.startsWith('weekly')){
   await page.locator('nav button').filter({hasText:'Submit Bookings'}).click();
   await page.locator('#tab-bookings .rtab').filter({hasText:'Aurora'}).click();
   await page.locator('nav button').filter({hasText:'CommOps AI'}).click();
   await page.locator('#chat-input').fill('<img src=x onerror="document.body.dataset.auditXss=1">');
   await page.locator('#chat-input').press('Enter');await page.waitForTimeout(700);
  }
  const xss=await page.evaluate(()=>document.body.dataset.auditXss||null);
  await page.screenshot({path:path.join(output,'after-')+file.split('/').pop()+'.png',fullPage:false});
  report.push({path:file,clicked,errors,xss,narrowOverflow,narrowTabs,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  await page.close();
 }
 fs.writeFileSync(path.join(output,'browser-check-results.json'),JSON.stringify(report,null,2)+'\n');
 await browser.close();
 for(const r of report){assert.deepEqual(r.errors,[],r.path);assert.equal(r.xss,null,r.path);assert.equal(r.overflow,false,r.path);assert.equal(r.narrowOverflow.scrollWidth,390,r.path);assert.ok(r.narrowTabs.every(t=>!t.overflow),r.path);}
 console.log('PASS: '+report.length+' HTML pages, '+report.reduce((n,r)=>n+r.clicked,0)+' tab selections; no page errors or document overflow at 390px; text-safe chat.');
})();
