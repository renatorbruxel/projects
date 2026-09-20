"""Independent data, event-timing, accounting and provenance assertions."""
import csv
import hashlib
import importlib.util
import json
from pathlib import Path
import random
ROOT=Path(__file__).resolve().parents[1]
D=json.loads((ROOT/'data/planning/scenario.json').read_text())
spec=importlib.util.spec_from_file_location('generator',ROOT/'scripts/build_operating_model.py')
gen=importlib.util.module_from_spec(spec);spec.loader.exec_module(gen)
results=[]
def check(name,fn):
    assert fn(),name
    results.append({'name':name,'status':'passed'})
check('Generator is byte-for-byte deterministic at the data-object level',lambda:gen.generate()==D)
check('Snapshot grain is unique',lambda:len({(s['opportunity_id'],s['snapshot_date']) for s in D['snapshots']})==len(D['snapshots']))
check('All snapshot opportunity and seller references resolve',lambda:all(s['opportunity_id'] in {o['id'] for o in D['opportunities']} and s['seller_id'] in {p['id'] for p in D['sellers']} for s in D['snapshots']))
check('No snapshot uses future stage, activity or close events',lambda:all(s['stage_entered']<=s['snapshot_date'] and s['last_activity']<=s['snapshot_date'] and (s['close_date'] is None or s['close_date']<=s['snapshot_date']) for s in D['snapshots']))
check('Stored generator events end at the declared as-of',lambda:all(e['date']<=D['as_of'] for o in D['opportunities'] for e in o['events']))
check('Forecast training closes precede or equal issuance',lambda:all(r['training_max_close'] is None or r['training_max_close']<=r['issued_at'] for r in D['forecast_calls']))
check('All forecast horizons equal 28 days',lambda:all((gen.day(r['target_end'])-gen.day(r['issued_at'])).days==28 for r in D['forecast_calls']))
for call in D['forecast_calls']:
    ids={s['id'] for s in D['sellers'] if s['region']==call['region']}
    rows=[s for o in D['opportunities'] if o['seller_id'] in ids and (s:=gen.snapshot(o,call['issued_at']))]
    prior=[s for s in rows if s['stage'] in ['Won','Lost']]
    rate=sum(s['stage']=='Won' for s in prior)/len(prior) if prior else .5
    observed=sum(s['amount'] or 0 for s in rows if s['stage']=='Won' and s['close_date'][:7]==call['target_end'][:7])
    due=[s for s in rows if s['stage'] not in ['Won','Lost'] and s['expected_close'] and s['expected_close'][:7]==call['target_end'][:7]]
    expected=round(observed+sum((s['amount'] or 0)*rate for s in due),4)
    assert abs(expected-call['forecast'])<1e-6,call['id']
results.append({'name':'Every forecast reproduced solely from issue-time events','status':'passed'})
check('Recurring accounting closes at each customer-month',lambda:all(abs(r['opening_mrr']+r['new_mrr']+r['expansion_mrr']-r['contraction_mrr']-r['churn_mrr']-r['closing_mrr'])<1e-7 for r in D['subscriptions']))
check('Recurring balances are non-negative',lambda:all(r['closing_mrr']>=0 for r in D['subscriptions']))
revenue={}
for r in D['revenue']:revenue[r['opportunity_id']]=revenue.get(r['opportunity_id'],0)+r['amount']
latest=[s for s in D['snapshots'] if s['snapshot_date']==D['as_of'] and s['stage']=='Won']
check('Recognition schedule allocates each won contract exactly once',lambda:all(abs(revenue[s['opportunity_id']]-s['amount'])<1e-7 for s in latest))
check('Source nulls are preserved in deliberate planning edge cases',lambda:any(s['amount'] is None for s in D['snapshots']) and any(s['expected_close'] is None for s in D['snapshots']))
check('Quota grain unique and productive FTE bounded',lambda:len({(r['seller_id'],r['month']) for r in D['quotas']})==len(D['quotas']) and all(0<r['productive_fte']<=1 for r in D['quotas']))
manifest=json.loads((ROOT/'data/crm/source.json').read_text())
check('Original Kaggle files retain the documented hashes',lambda:all(hashlib.sha256((ROOT/'data/crm/raw'/name).read_bytes()).hexdigest()==meta['sha256'] for name,meta in manifest['files'].items()))
check('Successful payment fees are separate from TPV and failed attempts',lambda:all((p['platform_fee']==0 if p['status']=='Failed' else 0<p['platform_fee']<p['amount']) for p in D['payments']))
(ROOT/'data/planning/data-test-results.json').write_text(json.dumps({'suite':'Independent source and accounting checks','results':results},indent=2))
print(json.dumps({'passed':len(results),'failed':0}))
