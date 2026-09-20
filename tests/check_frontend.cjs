// Dependency-free regression checks. A DOM fixture is not visual browser QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const scripts = file => [...fs.readFileSync(path.join(root,file),'utf8').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).join('\n');
const htmlFiles=['index.html','portfolio-deep-dive.html','weekly-checkin-portal/weekly-checkin-portal.html','sales-league/sales-league.html','net-new-tracker/net-new-tracker.html','funnel-management/pipeline-intelligence.html','pipeline-pulse/pipeline-pulse.html'];
for(const file of htmlFiles) new vm.Script(scripts(file),{filename:file});
function fixture(){
 const nodes = new Map(), timers = [], frames=[];
 const node = id => {if(!nodes.has(id)){const classes=new Set();nodes.set(id,{id,style:{},value:'',innerHTML:'',textContent:'',children:[],attributes:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)},appendChild(child){this.children.push(child)},setAttribute(k,v){this.attributes[k]=v},querySelectorAll(){return []},querySelector(){return null}});}return nodes.get(id)};
 const document={getElementById:node,createElement:tag=>({...node('new-'+nodes.size),tag}),querySelectorAll:()=>[],addEventListener:()=>{}};
 const context=vm.createContext({document,window:{addEventListener:()=>{},scrollTo:()=>{}},setTimeout:fn=>timers.push(fn),requestAnimationFrame:fn=>frames.push(fn),performance:{now:()=>0},console});
 return {context,node,timers,flush(){let t=1000,limit=1000;while(frames.length&&limit-->0)frames.shift()(t+=1000);assert.ok(limit>0,'animation completes')}};
}
// The region buttons live in the section header, not inside the body.
{
 const f=fixture();vm.runInContext(scripts('weekly-checkin-portal/weekly-checkin-portal.html'),f.context);
 const body={children:[f.node('bookings-northstar'),f.node('bookings-aurora'),f.node('bookings-summit')]};
 const tabs={querySelectorAll:()=>[]},section={querySelector:()=>body};
 const btn={classList:{add(){}},closest:s=>s==='.region-tabs'?tabs:s==='.form-section'?section:null};
 for(const region of ['aurora','summit','northstar']){
  f.context.selectRegion(btn,'bookings',region);
  for(const child of body.children)assert.equal(child.style.display,child.id==='bookings-'+region?'block':'none');
 }
 const payload='<img src=x onerror="document.body.dataset.executed=1">';
 f.context.sendPrompt(payload);assert.equal(f.node('chat-messages').children[0].textContent,payload);
 assert.equal(f.node('chat-messages').innerHTML,'');
 assert.equal(f.node('chat-messages').children[0].tag,'div');
 const n=f.node('chat-messages').children.length;f.context.clearChat();f.timers.forEach(fn=>fn());
 assert.equal(f.node('chat-messages').children.length,n,'clearing chat cancels pending scripted answers');
}
{
 const f=fixture();vm.runInContext(scripts('sales-league/sales-league.html'),f.context);
 f.context.updateScorecard('david-torres');assert.equal(f.node('coverage-val').textContent,'5.5x');
 assert.match(f.node('coverage-lbl').textContent,/176K/);
 f.context.updateScorecard('sarah-chen');assert.equal(f.node('coverage-val').textContent,'N/A');
 const counts=[...f.node('attainment-distribution').innerHTML.matchAll(/<strong>(\d+)<\/strong>/g)].map(m=>Number(m[1]));
 assert.deepEqual(counts,[0,1,5,5,1]);
}
{
 const f=fixture();vm.runInContext(scripts('net-new-tracker/net-new-tracker.html'),f.context);
 for(const [q,total,pct] of [['Q1','87.0',62],['Q2','99.7',73],['Q3','112.7',85],['Q4','119.9',93]]){
  f.context.updateQuarter(q);f.flush();const chart=f.node('arr-mix-chart').innerHTML;
  assert.ok(chart.includes('$'+total+'M'));assert.equal((chart.match(/<circle /g)||[]).length,3);
  const lengths=[...chart.matchAll(/stroke-dasharray="([\d.]+)/g)].map(m=>Number(m[1]));
  assert.ok(Math.abs(lengths.reduce((a,b)=>a+b,0)-2*Math.PI*62)<1e-8);
  assert.equal(f.node('cov-pct-text').textContent,pct+'%');
  assert.ok(f.node('overview-title').textContent.endsWith(q));
 }
 f.node('f-region').value='Summit';f.node('f-class').value='Net New';f.context.applyFilters();
 assert.equal(f.node('row-count').textContent,'Showing 1 of 15');
 f.context.resetFilters();assert.equal(f.node('row-count').textContent,'Showing 15 of 15');
}
{
 const code=scripts('pipeline-pulse/pipeline-pulse.html');
 const start=code.indexOf('function median('),end=code.indexOf('function updateScatter()',start);
 const f=vm.createContext({});vm.runInContext(code.slice(start,end),f);
 assert.equal(f.median([1,2,4,9]),3);assert.equal(f.median([9,1,2]),2);assert.equal(f.median([]),null);
}
console.log('PASS: 7 HTML script sets; region switching; text-safe chat/reset; coverage boundary; histogram; 4 quarter transitions; combined filters; median. DOM fixture checks only.');
