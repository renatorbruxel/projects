/* Pure metric contracts. Shared by every page and the Node regression suite. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GTM=api;})(typeof window==='object'?window:globalThis,function(){
'use strict';
const sum=(rows,key)=>rows.reduce((a,r)=>a+(Number(typeof key==='function'?key(r):r[key])||0),0);
const ratio=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&b>0?a/b:null;
const days=(a,b)=>(Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000;
const median=a=>{a=a.filter(Number.isFinite).sort((a,b)=>a-b);return a.length?(a[Math.floor((a.length-1)/2)]+a[Math.ceil((a.length-1)/2)])/2:null;};
const quarter=d=>`${d.slice(0,4)}-Q${Math.floor((Number(d.slice(5,7))-1)/3)+1}`;
const monthsIn=(c)=>{const y=c.mode==='observed'?2017:2026;if(c.period==='FY')return Array.from({length:12},(_,i)=>`${y}-${String(i+1).padStart(2,'0')}`);const q=Number(c.period.replace('Q',''));return [0,1,2].map(i=>`${y}-${String((q-1)*3+i+1).padStart(2,'0')}`);};
const inPeriod=(d,c)=>Boolean(d)&&monthsIn(c).includes(d.slice(0,7));
const defaultContext=()=>({mode:'planning',asOf:'2026-09-18',period:'Q3',region:'All',segment:'All',product:'All',seller:'All',scenario:'Base'});
function roster(data,c){return data.sellers.filter(s=>s.hire_date<=c.asOf&&(!s.employed_until||s.employed_until>=c.asOf)&&(c.region==='All'||s.region===c.region)&&(c.seller==='All'||s.id===c.seller));}
function records(data,crm,c){
 if(c.mode==='observed')return crm.opportunities.map(r=>({...r,id:r.opportunity_id,stage:r.deal_stage,amount:r.close_value,region:r.regional_office,segment:r.account_sector,created_date:r.engage_date,expected_close:null,category:'Unavailable',source_kind:'observed_educational',scenario_id:'kaggle-v1'})).filter(r=>match(r,c));
 const people=new Map(roster(data,{...c,region:'All',seller:'All'}).map(s=>[s.id,s]));
 return data.snapshots.filter(r=>r.snapshot_date===c.asOf).map(r=>({...r,id:r.opportunity_id,region:people.get(r.seller_id)?.region||'Unknown',manager:people.get(r.seller_id)?.manager||'Unknown',source_kind:'synthetic',scenario_id:data.scenario_id})).filter(r=>match(r,c));
}
function match(r,c){return (c.region==='All'||r.region===c.region)&&(c.seller==='All'||r.seller_id===c.seller)&&(c.product==='All'||r.product===c.product)&&(c.segment==='All'||r.segment===c.segment);}
function metrics(data,crm,c){
 const all=records(data,crm,c),won=all.filter(r=>r.stage==='Won'&&inPeriod(r.close_date,c)),lost=all.filter(r=>r.stage==='Lost'&&inPeriod(r.close_date,c));
 const openAll=all.filter(r=>!['Won','Lost'].includes(r.stage));
 const open=c.mode==='observed'?openAll:openAll.filter(r=>inPeriod(r.expected_close,c));
 const people=roster(data,c),ids=new Set(people.map(s=>s.id));
 const target=c.mode==='planning'&&c.product==='All'&&c.segment==='All'?sum(data.quotas.filter(q=>ids.has(q.seller_id)&&monthsIn(c).includes(q.month)),'amount'):null;
 const actual=sum(won,'amount'),pipeline=c.mode==='observed'?null:sum(open,'amount'),gap=target===null?null:Math.max(0,target-actual);
 const probability=data.assumptions.stage_probability,factor={Base:1,Downside:.75,Upside:1.2}[c.scenario]||1;
 const weighted=c.mode==='observed'?null:sum(open,r=>(r.amount||0)*Math.min(1,(probability[r.stage]||0)*factor));
 const cycles=won.filter(r=>r.created_date).map(r=>days(r.created_date,r.close_date));
 return {all,won,lost,open,openAll,actual,target,gap,pipeline,weighted,forecast:weighted===null?null:actual+weighted,
  attainment:ratio(actual,target),coverage:ratio(pipeline,target),gapCoverage:ratio(pipeline,gap),
  winRate:ratio(won.length,won.length+lost.length),cycle:median(cycles),meanWon:ratio(actual,won.length),
  missingAmount:open.filter(r=>r.amount===null).length,undatedOpen:openAll.filter(r=>!r.expected_close).length,
  sellers:people,period:monthsIn(c).join(', '),source:c.mode==='observed'?'CRM educational source v1':'Synthetic planning v2'};
}
function bridge(data,crm,c,previous){
 const before=records(data,crm,{...c,asOf:previous}),after=records(data,crm,c);
 const p=new Map(before.map(r=>[r.id,r])),n=new Map(after.map(r=>[r.id,r]));
 const balance=r=>r&&!['Won','Lost'].includes(r.stage)&&inPeriod(r.expected_close,c)?(r.amount||0):0;
 return [...new Set([...p.keys(),...n.keys()])].map(id=>{
  const a=p.get(id),b=n.get(id),opening=balance(a),closing=balance(b);let type='Unchanged';
  if(!a)type='Created';else if(b?.stage==='Won'&&a.stage!=='Won')type='Won';else if(b?.stage==='Lost'&&a.stage!=='Lost')type='Lost';else if(opening>0&&closing===0)type='Out of window';else if(opening===0&&closing>0)type='Into window';else if(a.amount!==b?.amount)type='Value change';
  return {id,opening,closing,delta:closing-opening,type,previous_stage:a?.stage||'Not created',current_stage:b?.stage||'Absent',previous_close:a?.expected_close||null,current_close:b?.expected_close||null,
   date_shift_days:a?.expected_close&&b?.expected_close?days(a.expected_close,b.expected_close):null,before:a||null,after:b||null};
 });
}
function quality(m,c,config={}){
 return m.all.flatMap(r=>{
  const rules=[];if(r.amount===null)rules.push(['Missing amount','Data steward','High']);
  if(!r.account_id)rules.push(['Missing account','Seller Systems','Medium']);
  if(c.mode==='planning'&&!r.expected_close)rules.push(['Missing expected close','Sales manager','High']);
  if(c.mode==='planning'&&!['Won','Lost'].includes(r.stage)&&r.expected_close&&r.expected_close<c.asOf)rules.push(['Overdue close date','Sales manager','High']);
  if(c.mode==='planning'&&!['Won','Lost'].includes(r.stage)&&r.last_activity&&days(r.last_activity,c.asOf)>(config.staleDays||21))rules.push(['No recent activity','Seller','Medium']);
  return rules.map(([rule,owner,severity])=>({id:r.id,rule,owner,severity,amount:r.amount,date:r.expected_close||r.created_date,quality_scope:'All records at snapshot within region/product/segment/seller filters; no quarter restriction'}));
 });
}
function forecastQuality(rows){
 const valid=rows.filter(r=>r.actual!==null&&Number.isFinite(r.forecast));const zeros=valid.filter(r=>r.actual===0).length;
 return {n:valid.length,bias:valid.length?sum(valid,r=>r.forecast-r.actual)/valid.length:null,
  mae:valid.length?sum(valid,r=>Math.abs(r.forecast-r.actual))/valid.length:null,
  wape:ratio(sum(valid,r=>Math.abs(r.forecast-r.actual)),sum(valid,r=>Math.abs(r.actual))),
  mape:valid.length>zeros?sum(valid.filter(r=>r.actual!==0),r=>Math.abs((r.forecast-r.actual)/r.actual))/(valid.length-zeros):null,
  baselineWape:ratio(sum(valid,r=>Math.abs(r.baseline-r.actual)),sum(valid,r=>Math.abs(r.actual))),zeros};
}
function recurring(data,c){
 const cutoff=c.asOf.slice(0,7);const rows=data.subscriptions.filter(r=>r.month<cutoff&&monthsIn(c).includes(r.month)&&(c.region==='All'||r.region===c.region)&&(c.segment==='All'||r.segment===c.segment));
 const customers=[...new Set(rows.map(r=>r.customer_id))];let opening=0,closing=0,retainedValue=0,retainedLogos=0,openingLogos=0;
 for(const id of customers){const rs=rows.filter(r=>r.customer_id===id).sort((a,b)=>a.month.localeCompare(b.month));opening+=rs[0].opening_mrr;closing+=rs.at(-1).closing_mrr;if(rs[0].opening_mrr>0){openingLogos++;retainedValue+=rs.at(-1).closing_mrr;if(rs.at(-1).closing_mrr>0)retainedLogos++;}}
 const expansion=sum(rows,'expansion_mrr'),contraction=sum(rows,'contraction_mrr'),churn=sum(rows,'churn_mrr'),newMRR=sum(rows,'new_mrr');
 // GRR only includes losses on the opening cohort, even if new customers churn later.
 const openingIds=new Set(customers.filter(id=>rows.find(r=>r.customer_id===id).opening_mrr>0));
 const losses=sum(rows.filter(r=>openingIds.has(r.customer_id)),r=>r.contraction_mrr+r.churn_mrr);
 return {rows,opening,closing,newMRR,expansion,contraction,churn,nrr:ratio(retainedValue,opening),grr:ratio(opening-losses,opening),logoRetention:ratio(retainedLogos,openingLogos),openingLogos,retainedLogos,months:[...new Set(rows.map(r=>r.month))]};
}
function economics({cost,newCustomers,monthlyRevenue,margin,churn}){
 const cac=ratio(cost,newCustomers),grossProfit=monthlyRevenue*margin;
 return {cac,ltv:ratio(grossProfit,churn),payback:cac===null?null:ratio(cac,grossProfit),ltvCac:cac===null?null:ratio(ratio(grossProfit,churn),cac)};
}
function classify({accountId,complete,parentId,date,firstDate,lastPriorDate,reactivationDays=365}){
 if(!accountId||!complete||parentId||!firstDate)return 'Unknown';
 if(date===firstDate)return 'New in scenario';
 if(lastPriorDate&&days(lastPriorDate,date)>reactivationDays)return 'Reactivation in scenario';
 return 'Expansion in scenario';
}
function capacity(data,c,a){
 const sellers=roster(data,c),months=Array.from({length:6},(_,i)=>`2026-${String(i+7).padStart(2,'0')}`);
 return months.map((month,i)=>{
  const baseFte=sum(data.quotas.filter(q=>q.month===month&&sellers.some(s=>s.id===q.seller_id)),'productive_fte');
  const hireOffset=Number(month.slice(5))-a.hireMonth+1;
  const newFte=Math.max(0,a.hires)*Math.min(1,Math.max(0,hireOffset)/Math.max(1,a.rampMonths));
  const availableFte=Math.max(0,baseFte-(i>=a.exitMonth-7?a.exits:0));
  const automation=availableFte*(a.hoursFreed/80),reallocated=Math.max(0,a.reallocate);
  const grossCapacity=(availableFte+newFte+automation+reallocated)*a.productivity;
  const demand=Math.max(0,a.demand),served=Math.min(grossCapacity,demand);
  return {month,baseFte:availableFte,newFte,automationFte:automation,reallocatedFte:reallocated,grossCapacity,demand,served,gap:Math.max(0,demand-served),
   baseCost:sum(sellers,'monthly_cost'),incrementalCost:(hireOffset>0?a.hires*a.hireCost:0)+(a.hoursFreed>0?a.automationCost:0)+reallocated*a.hireCost};
 });
}
function brief(m,c,cadence,bridgeRows=[],actions=[]){
 const amount=n=>n===null?'unavailable':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
 const pending=actions.filter(a=>a.status!=='Done');
 const common=`${c.region} · ${c.period} · ${c.asOf} · ${m.source}. Bookings ${amount(m.actual)} against plan ${amount(m.target)}. Remaining gap ${amount(m.gap)}. Scenario forecast ${amount(m.forecast)} (${c.scenario}; not a calibrated prediction).`;
 const kinds={WBR:`This week: open pipeline changed by ${amount(sum(bridgeRows,'delta'))}. Review overdue commitments and the next customer milestone. Decision: accept the call or return it with evidence.`,MBR:`Monthly review: compare completed-month conversion, cycle, capacity and intervention follow-through. Test whether segment mix, rather than qualification quality, explains the conversion difference. Decision: maintain coverage, coach or reallocate resources.`,QBR:`Quarterly review: assess segment and channel economics, resource constraints and downside/upside assumptions. Decision: hire, release selling time or reprioritize a segment; assess opportunity cost before investment.`};
 return `${common}\n\n${kinds[cadence]}\n\n${pending.length} open follow-ups: ${pending.map(a=>`${a.id} — ${a.owner}; due ${a.due}`).join('; ')||'none'}.\n\nHypothesis: stage delays may reflect customer readiness or process friction. The dataset cannot establish causality. Alternative: validate a matched cohort before changing qualification.\n\nEvidence: snapshots, quotas and movement_bridge; metric contract 2.0.0. Missing values remain unavailable. A human must review the interpretation.`;
}
function answer(question,data,crm,context,role='Analyst'){
 const c={...context};let denied=false;
 if(role==='Regional manager'){if(c.region!=='All'&&c.region!=='East')denied=true;c.region='East';}
 if(role==='Seller'){c.seller='S001';c.region='Central';if(/other seller|all sellers|west|east/i.test(question))denied=true;}
 const scope=`${c.region}; ${c.period}; ${c.asOf}; ${c.mode}; ${c.scenario}`;
 const refuse=(reason)=>({status:'unavailable',text:reason,scope,citations:[],values:{},readOnly:true});
 if(denied)return refuse('Outside the simulated role scope. This UI simulation is not server authorization.');
 if(/ignore.*(instruction|rule)|system prompt|password|token|delete|approve|submit|update|send|secret|override/i.test(question))return refuse('Read-only metric retrieval. Instructions embedded in content cannot change scope or execute actions. Use the separate review workflow.');
 const m=metrics(data,crm,c);let values={},query='';
 if(/pipeline|coverage|gap|sufficien/i.test(question)){values={open_pipeline:m.pipeline,target:m.target,gap:m.gap,gap_coverage:m.gapCoverage};query='seller_performance / snapshots';}
 else if(/bookings|actual|attainment|won/i.test(question)){values={bookings:m.actual,won_deals:m.won.length,attainment:m.attainment};query='seller_performance';}
 else if(/forecast|accuracy|bias|wape/i.test(question)){if(c.mode==='observed')return refuse('No forecast calls or historical snapshots in the observed CRM source.');if(c.product!=='All'||c.segment!=='All'||c.seller!=='All')return refuse('Forecast evaluation is available by region and period only. Product, segment and seller cuts are unavailable.');const f=forecastQuality(data.forecast_calls.filter(r=>r.target_end<=c.asOf&&inPeriod(r.target_end,c)&&(c.region==='All'||r.region===c.region)));values={forecast:m.forecast,wape:f.wape,baseline_wape:f.baselineWape,evaluation_n:f.n};query='forecast_quality';}
 else if(/win rate|conversion|cycle/i.test(question)){values={win_rate:m.winRate,won_n:m.won.length,closed_n:m.won.length+m.lost.length,median_won_cycle_days:m.cycle};query='closed cohort / snapshots';}
 else if(/quality|missing|hygiene/i.test(question)){values={exception_rules:quality(m,c).length,affected_opportunities:new Set(quality(m,c).map(r=>r.id)).size};query='quality_exceptions; all records at snapshot within active dimensional filters; no quarter restriction';}
 else if(/retention|arr|nrr|grr/i.test(question)){if(c.mode==='observed')return refuse('ARR and retention are not present in the hardware CRM. Use the separate synthetic subscription scenario.');if(c.product!=='All'||c.seller!=='All')return refuse('The subscription ledger has no product or seller allocation. Retention at this grain is unavailable.');const r=recurring(data,c);values={closing_arr:r.closing*12,nrr:r.nrr,grr:r.grr};query='recurring_bridge / subscriptions';}
 else return refuse('No governed query matches this question. Supported: bookings, gap/coverage, conversion/cycle, forecast error, data quality and synthetic recurring retention.');
 return {status:'answered',text:Object.entries(values).map(([k,v])=>`${k.replaceAll('_',' ')}: ${v===null?'unavailable':new Intl.NumberFormat('en-US',{maximumFractionDigits:4}).format(v)}`).join('; '),values,scope,citations:[{query,path:context.mode==='observed'?'data/crm/clean/opportunities.csv':'data/sql/operating_model.sql',scenario_id:context.mode==='observed'?'kaggle-v1':data.scenario_id,metric_version:data.metric_version}],readOnly:true};
}
function validateSubmission(value){const errors=[];for(const k of ['bookings','revenue','downside','upside'])if(!Number.isFinite(Number(value[k]))||Number(value[k])<0)errors.push(`${k} must be a non-negative number.`);if(Number(value.downside)>Number(value.bookings)||Number(value.upside)<Number(value.bookings))errors.push('Downside ≤ likely bookings ≤ upside is required.');if(!value.comment?.trim())errors.push('Add a rationale.');if(!value.acknowledged)errors.push('Review and acknowledge source exceptions.');return errors;}
function transition(item,event,comment,actor,now){
 const allowed={draft:['submit'],returned:['submit'],submitted:['approve','return'],approved:['revise']};
 if(!(allowed[item.status]||[]).includes(event))throw Error('Invalid review transition.');
 if(event==='submit'&&validateSubmission(item).length)throw Error(validateSubmission(item).join(' '));
 if(event==='return'&&!comment?.trim())throw Error('A return reason is required.');
 if(['approve','return'].includes(event)&&actor!=='Reviewer')throw Error('Switch to the simulated Reviewer role.');
 const next={...item,status:{submit:'submitted',approve:'approved',return:'returned',revise:'draft'}[event]};
 next.version=(item.version||1)+(event==='revise'?1:0);
 next.history=[...(item.history||[]),{event,actor,date:now,comment:comment||'',version:next.version}];
 return next;
}
return {sum,ratio,days,median,quarter,monthsIn,inPeriod,defaultContext,roster,records,metrics,bridge,quality,forecastQuality,recurring,economics,classify,capacity,brief,answer,validateSubmission,transition,match};
});
