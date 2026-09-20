/* Optional browser acceptance. npm install --no-save playwright@1.51.1 */
'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.GTM_QA_DIR||path.join(root,'tests/browser-artifacts');fs.mkdirSync(out,{recursive:true});
const pages={wci:'weekly-checkin-portal/weekly-checkin-portal.html',pulse:'pipeline-pulse/pipeline-pulse.html',pipeline:'funnel-management/pipeline-intelligence.html',growth:'net-new-tracker/net-new-tracker.html',sales:'sales-league/sales-league.html',data:'data/index.html',deep:'portfolio-deep-dive.html'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.statusCode=403;return res.end();}try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end('Not found');}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port+'/';const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'}),page=await context.newPage(),errors=[],overflow=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',msg=>{if(msg.type()==='error'&&!msg.text().includes('favicon'))errors.push(msg.text());});
 let tabs=0;
 for(const [name,file] of Object.entries(pages)){
  await page.goto(base+file);await page.locator('h1').waitFor();const ids=await page.locator('[role=tab]').evaluateAll(x=>x.map(e=>e.id));
  for(const id of ids){await page.locator('#'+id).click();assert(await page.locator('#view').innerText());assert(!(await page.locator('#view').innerText()).includes('undefined'));tabs++;}
  await page.locator('#'+ids[0]).click();await page.screenshot({path:path.join(out,name+'-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  for(const id of ids){await page.locator('#'+id).click();if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))overflow.push(name+':'+id);}
  await page.locator('#'+ids[0]).click();await page.screenshot({path:path.join(out,name+'-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('#ctx-mode').selectOption('observed');
  for(const id of ids){await page.locator('#'+id).click();assert(await page.locator('#view').innerText());}
  await page.locator('#ctx-mode').selectOption('planning');
 }
 checks.push({check:'All planning and observed views render',passed:true,tabs});
 await page.goto(base+pages.wci);const all=await page.evaluate(()=>GTM_APP.metrics.actual);
 await page.locator('#ctx-region').selectOption('East');const east=await page.evaluate(()=>GTM_APP.metrics.actual);assert(east>0&&east<all);
 await page.locator('#ctx-region').selectOption('All');assert.equal(await page.evaluate(()=>GTM_APP.metrics.actual),all);
 await page.locator('#ctx-period').selectOption('Q2');assert.notEqual(await page.evaluate(()=>GTM_APP.metrics.actual),all);await page.locator('#ctx-period').selectOption('Q3');
 await page.locator('#ctx-segment').selectOption('Growth');assert.equal(await page.evaluate(()=>GTM_APP.metrics.target),null);await page.locator('#ctx-segment').selectOption('All');
 checks.push({check:'Filters reconcile including All and unsupported quota grain',passed:true});
 await page.locator('#tab-overview').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#tab-inputs').getAttribute('aria-selected'),'true');
 await page.locator('#input-comment').fill('Customer milestones reviewed. Preserve unknown values; no double counting.');await page.locator('#input-ack').check();
 await page.locator('[data-action="save-inputs"]').click();assert((await page.locator('#toast').innerText()).includes('saved'));
 await page.locator('#tab-review').click();await page.locator('[data-action="submit"]').click();assert.equal(await page.evaluate(()=>GTM_APP.reviewPayload().status),'submitted');
 await page.locator('#review-role').selectOption('Reviewer');await page.locator('[data-action="return"]').click();assert((await page.locator('#toast').innerText()).includes('reason'));
 await page.locator('#review-comment').fill('Please quantify the assumptions.');await page.locator('[data-action="return"]').click();assert.equal(await page.evaluate(()=>GTM_APP.reviewPayload().status),'returned');
 await page.locator('[data-action="submit"]').click();await page.locator('#review-role').selectOption('Reviewer');await page.locator('[data-action="approve"]').click();assert.equal(await page.evaluate(()=>GTM_APP.reviewPayload().status),'approved');
 const frozen=await page.evaluate(()=>GTM_APP.reviewPayload());await page.locator('#tab-brief').click();await page.locator('#cadence').selectOption('MBR');assert.equal(await page.evaluate(()=>GTM_APP.reviewPayload().cadence),'MBR');assert.match(await page.evaluate(()=>GTM_APP.reviewPayload().brief),/Monthly review/);assert.equal(await page.evaluate(()=>GTM_APP.reviewPayload().call.bookings),frozen.call.bookings);await page.reload();assert.equal(await page.evaluate(()=>GTM_APP.reviewPayload().call.bookings),frozen.call.bookings);
 await page.locator('#tab-inputs').click();assert(await page.locator('#input-bookings').isDisabled());
 await page.locator('#tab-review').click();const wordPromise=page.waitForEvent('download');await page.locator('[data-action="export-word"]').click();const word=await wordPromise;await word.saveAs(path.join(out,'review.docx'));
 assert(fs.statSync(path.join(out,'review.docx')).size>2000);
 await page.locator('[data-action="revise"]').click();assert.equal(await page.evaluate(()=>GTM_APP.reviewPayload().version),2);
 checks.push({check:'Draft → submitted → returned → approved → frozen reload → revision + Word export',passed:true});
 await page.locator('#tab-brief').click();const wbr=await page.locator('#generated-brief').innerText();await page.locator('#cadence').selectOption('MBR');const mbr=await page.locator('#generated-brief').innerText();await page.locator('#cadence').selectOption('QBR');assert.notEqual(wbr,mbr);assert.notEqual(mbr,await page.locator('#generated-brief').innerText());
 await page.locator('[data-action="start-task"]').click();await page.locator('[data-action="finish-task"]').click();
 await page.locator('summary').filter({hasText:'Add a decision'}).click();await page.locator('#action-title').fill('Test a customer milestone intervention');await page.locator('#action-baseline').fill('Progression within 28 days');await page.locator('[data-action="add-action"]').click();
 const count=await page.locator('table[data-table="actions"] tbody tr').count();await page.locator('#ctx-asOf').selectOption('2026-09-11');assert.equal(await page.locator('table[data-table="actions"] tbody tr').count(),count);
 await page.locator('#ctx-asOf').selectOption('2026-09-18');
 checks.push({check:'Distinct review cadences, preparation events and cross-snapshot actions',passed:true});
 await page.locator('#tab-copilot').click();await page.locator('#question').fill('<img src=x onerror="window.XSS=1"> What are bookings?');await page.locator('#chat-form button[type=submit]').click();assert.equal(await page.evaluate(()=>window.XSS),undefined);assert.equal(await page.locator('.chat.user img').count(),0);assert.equal((await page.evaluate(()=>GTM_APP.runEvaluation())).every(x=>x.pass),true);
 checks.push({check:'Copilot regression and untrusted-text rendering',passed:true});
 await page.goto(base+pages.sales+'?tab=capacity');await page.locator('#cap-hires').fill('8');await page.locator('[data-action="capacity"]').click();assert((await page.locator('#view').innerText()).includes('Combined / reallocation'));
 await page.locator('#cap-demand').fill('1');await page.locator('[data-action="capacity"]').click();const capacityText=await page.locator('table[data-table="capacity"]').innerText();assert(capacityText.includes('$1'));
 await page.goto(base+pages.growth+'?tab=investment');await page.locator('#econ-churn').fill('0');await page.locator('[data-action="economics"]').click();assert.equal(await page.locator('[data-metric="Gross-margin LTV"] .value').innerText(),'N/A');
 checks.push({check:'Capacity demand cap and unit-economics zero-churn boundary',passed:true});
 await page.goto(base+pages.data);await page.locator('#source-search').fill('NO-SUCH-OPPORTUNITY-XYZ');await page.locator('[data-action="apply-search"]').click();assert((await page.locator('#view').innerText()).includes('No records match'));
 await page.locator('[data-action="reset"]').click();const selectedId=await page.locator('table[data-table="source-page"] [data-action="detail"]').first().getAttribute('data-id');await page.locator('#source-search').fill(selectedId);await page.locator('[data-action="apply-search"]').click();const csvPromise=page.waitForEvent('download');await page.locator('[data-action="export-table"]').click();await (await csvPromise).saveAs(path.join(out,'filtered.csv'));assert(fs.readFileSync(path.join(out,'filtered.csv'),'utf8').includes(selectedId));
 checks.push({check:'Search, empty state and exact filtered CSV export',passed:true});
 await page.goto(base+'index.html');await page.screenshot({path:path.join(out,'home-desktop.png'),fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'home-mobile.png'),fullPage:true});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))overflow.push('home');
 assert.deepEqual(errors,[]);assert.deepEqual(overflow,[]);
 const result={tabs,planning_and_observed_modes:true,viewport_checks:[1440,390],checks,errors,overflow};fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1);});
