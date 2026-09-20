"""Rebuild the independent portfolio planning scenario. Python 3.11+, stdlib only.

CRM files remain immutable. Only dimension identities are linked to the educational
source; all dates, amounts, outcomes, targets and operating events below are newly
simulated, never inferred historical snapshots of the Kaggle records.
"""
from __future__ import annotations
import calendar
import csv
import datetime as dt
import hashlib
import json
from pathlib import Path
import random
import sqlite3

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data' / 'planning'
SEED = 20260920
AS_OF = '2026-09-18'
SCENARIO = 'planning-v2-seed-20260920'
STAGES = ['Prospecting', 'Qualification', 'Discovery', 'Proposal', 'Negotiation']

def read_csv(name):
    with (ROOT / 'data/crm/clean' / name).open(encoding='utf-8-sig') as f:
        return list(csv.DictReader(f))

def day(value): return dt.date.fromisoformat(value)
def iso(value): return value.isoformat()
def plus(value, days): return iso(day(value) + dt.timedelta(days=days))
def quarter(value): return f'{value[:4]}-Q{(int(value[5:7])-1)//3+1}'
def month_end(month): return f'2026-{month:02}-{calendar.monthrange(2026, month)[1]}'

def snapshot(opp, date):
    if date < opp['created_date']: return None
    history = [x for x in opp['events'] if x['date'] <= date]
    event = history[-1]
    return dict(opportunity_id=opp['id'], snapshot_date=date, account_id=opp['account_id'],
                seller_id=opp['seller_id'], product=opp['product'], segment=opp['segment'],
                channel=opp['channel'], created_date=opp['created_date'],
                amount=event['amount'], expected_close=event['expected_close'],
                stage=event['stage'], category=event['category'],
                stage_entered=event['stage_entered'], last_activity=event['last_activity'],
                close_date=event['date'] if event['stage'] in ['Won','Lost'] else None,
                loss_reason=opp['loss_reason'] if event['stage']=='Lost' else None)

def generate():
    rng = random.Random(SEED)
    sellers=[]
    for i, s in enumerate(read_csv('sales_teams.csv')):
        sellers.append(dict(id=s['seller_id'], name=f'Demo seller {i+1:02}',
            source_dimension_id=s['seller_id'], region=s['regional_office'],
            manager=f"{s['regional_office']} manager {i%2+1}",
            role='Account executive' if i%3 else 'Sales specialist',
            hire_date='2026-07-01' if i>=30 else '2025-01-01',
            employed_until=None, quota_bearing=True, monthly_cost=9000+i%5*1000,
            source_kind='synthetic',scenario_id=SCENARIO))
    accounts=[dict(id=a['account_id'],name=f'Demo account {i+1:03}',
        source_dimension_id=a['account_id'],sector=a['sector'],segment=['Growth','Enterprise','Scale'][i%3],
        parent_id=None if i%11 else 'GROUP-01',history_complete=i%5!=0)
        for i,a in enumerate(read_csv('accounts.csv'))]
    products=[p['product'] for p in read_csv('products.csv')]
    roster=[]
    for s in sellers:
        roster.append(dict(seller_id=s['id'],valid_from=s['hire_date'],valid_to='2026-12-31',
            region=s['region'],manager=s['manager'],quota_bearing=1,employed=1))
    opportunities=[]
    revenue=[]
    activities=[]
    for i in range(480):
        s=sellers[i%len(sellers)]
        start=max(day(s['hire_date']),day('2025-12-01'))
        start=start+dt.timedelta(days=rng.randrange(max(1,(day(AS_OF)-start).days+1)))
        created=iso(start)
        duration=rng.randrange(25,121)
        initial_expected=iso(start+dt.timedelta(days=duration))
        amount=rng.randrange(8,101)*1000
        account=accounts[i%len(accounts)]
        outcome='Won' if rng.random()<(.68 if account['segment']=='Growth' else .52) else 'Lost'
        close_date=plus(created,duration+rng.randrange(-5,25))
        events=[]
        current_amount=None if i in [11,112,239,348] else amount
        expected=None if i in [22,234,458] else initial_expected
        for j,stage in enumerate(STAGES):
            event_date=plus(created,int(duration*j/5))
            if event_date >= close_date: break
            if j==2 and i%7==0 and expected: expected=plus(expected,35)
            if j==3 and i%9==0 and expected: expected=plus(expected,-28)
            if j==3 and i%8==0 and current_amount is not None: current_amount+=3000
            events.append(dict(date=event_date,stage=stage,amount=current_amount,expected_close=expected,
                category='Commit' if j>=4 and i%3!=0 else 'Best Case' if j>=3 else 'Pipeline',
                stage_entered=event_date,last_activity=event_date))
        if current_amount is not None:
            events.append(dict(date=close_date,stage=outcome,amount=current_amount,expected_close=close_date,
                category='Closed',stage_entered=close_date,last_activity=close_date))
        # Deliberate missing values remain missing; they are not a proxy for zero.
        opp=dict(id=f'SIM-{i+1:04}',account_id=None if i%53==0 else account['id'],seller_id=s['id'],
            product=products[i%len(products)],segment=account['segment'],
            channel=['Outbound','Inbound','Partner'][i%3],created_date=created,
            loss_reason=['Price','No decision','Competition','Process'][i%4],
            events=[e for e in events if e['date']<=AS_OF])
        if not opp['events']: continue
        opportunities.append(opp)
        if close_date<=AS_OF and outcome=='Won' and current_amount is not None:
            short=i%5==0
            activation=plus(close_date,3 if short else 14)
            for n,(delay,share) in enumerate([(3,1)] if short else [(14,.6),(44,.4)]):
                revenue.append(dict(id=f'REV-{i+1:04}-{n}',opportunity_id=opp['id'],seller_id=s['id'],
                    booking_date=close_date,activation_date=activation,recognition_date=plus(close_date,delay),
                    amount=round(current_amount*share,2),short_cycle=short,product=opp['product'],segment=opp['segment']))
        for j,e in enumerate(opp['events']):
            activities.append(dict(id=f'ACT-{i+1:04}-{j}',opportunity_id=opp['id'],seller_id=s['id'],
                date=e['date'],type='Discovery' if j%2 else 'Admin',minutes=45 if j%2 else 35,
                qualified_next_step=j%3!=0,segment=opp['segment']))
    dates=[]
    date=day('2026-01-02')
    while iso(date)<=AS_OF:
        dates.append(iso(date));date+=dt.timedelta(days=7)
    snapshots=[s for date in dates for o in opportunities if (s:=snapshot(o,date))]
    quotas=[]
    for s in sellers:
        for m in range(1,13):
            month=f'2026-{m:02}'
            if month<s['hire_date'][:7]: continue
            tenure=m-int(s['hire_date'][5:7])+1 if s['hire_date'][:4]=='2026' else 12
            ramp=min(1,max(0,tenure)/3)
            quotas.append(dict(seller_id=s['id'],month=month,quarter=quarter(month+'-01'),
                amount=round((32000+int(s['id'][1:])%5*6000)*ramp),productive_fte=ramp))
    calls=[]
    for m in range(2,9):
        target=month_end(m);issued=plus(target,-28);prior_month=m-1
        for region in ['Central','East','West']:
            ids={s['id'] for s in sellers if s['region']==region}
            available=[s for o in opportunities if o['seller_id'] in ids and (s:=snapshot(o,issued))]
            closed=[s for s in available if s['stage'] in ['Won','Lost']]
            rate=sum(s['stage']=='Won' for s in closed)/len(closed) if closed else .5
            actual_to_date=sum(s['amount'] or 0 for s in available if s['stage']=='Won' and s['close_date'][:7]==target[:7])
            due=[s for s in available if s['stage'] not in ['Won','Lost'] and s['expected_close'] and s['expected_close'][:7]==target[:7]]
            prediction=actual_to_date+sum((s['amount'] or 0)*rate for s in due)
            actual=sum(s['amount'] or 0 for o in opportunities if o['seller_id'] in ids and (s:=snapshot(o,target)) and s['stage']=='Won' and s['close_date'][:7]==target[:7])
            baseline=sum(s['amount'] or 0 for o in opportunities if o['seller_id'] in ids and (s:=snapshot(o,issued)) and s['stage']=='Won' and s['close_date'][:7]==f'2026-{prior_month:02}')
            calls.append(dict(id=f'FC-{m:02}-{region}',issued_at=issued,target_end=target,horizon_days=28,
                region=region,forecast=round(prediction,4),baseline=baseline,actual=actual,
                training_n=len(closed),training_max_close=max((s['close_date'] for s in closed),default=None),
                historical_win_rate=rate,method='As-of due pipeline × prior closed win rate + month actual to date'))
    subscriptions=[]
    costs=[]
    for i in range(90):
        region=['Central','East','West'][i%3];cohort=1+i%6
        mrr=0
        for m in range(1,10):
            opening=mrr;new=expansion=contraction=churn=0
            if m==cohort: new=400+(i%10)*125
            elif m>cohort and mrr:
                if (i+m)%23==0: churn=mrr
                elif (i+m)%7==0: expansion=100
                elif (i+m)%11==0: contraction=min(75,mrr)
            mrr=opening+new+expansion-contraction-churn
            if m<cohort: continue
            subscriptions.append(dict(id=f'SUB-{i+1:03}-{m:02}',customer_id=f'SAAS-{i+1:03}',region=region,
                month=f'2026-{m:02}',cohort=f'2026-{cohort:02}',segment=['Growth','Enterprise','Scale'][i%3],
                opening_mrr=opening,new_mrr=new,expansion_mrr=expansion,contraction_mrr=contraction,
                churn_mrr=churn,closing_mrr=mrr,channel=['Outbound','Inbound','Partner'][i%3]))
    for m in range(1,10):
        for region in ['Central','East','West']:
            for channel in ['Outbound','Inbound','Partner']:
                costs.append(dict(month=f'2026-{m:02}',region=region,channel=channel,
                    acquisition_cost=10000 if channel=='Outbound' else 6500,source_kind='synthetic'))
    merchants=[];payments=[]
    for i in range(60):
        signed=plus('2026-01-01',i*3);first=plus(signed,3+i%19)
        merchants.append(dict(id=f'MER-{i+1:03}',region=['Central','East','West'][i%3],signed_date=signed,
            first_payment_date=first if i%8 else None,segment=['Growth','Enterprise','Scale'][i%3]))
        if i%8==0: continue
        for j in range(1,11):
            date=plus(first,j*10)
            if date>AS_OF:continue
            amount=round(100+i*13+j*11,2);success=(i+j)%9!=0
            payments.append(dict(id=f'PAY-{i+1:03}-{j}',merchant_id=f'MER-{i+1:03}',date=date,
                status='Succeeded' if success else 'Failed',amount=amount,
                platform_fee=round(amount*.025+.3,2) if success else 0))
    decisions=[dict(id='ACTION-001',title='Review overdue commitments with regional managers',
        owner='Sales manager',due='2026-09-25',status='Open',dependency='Seller Systems',
        alternative='Keep the date and record customer confirmation',outcome='',created='2026-09-11',
        region='All',review_on='2026-09-18',baseline='Overdue exposure at the selected snapshot',
        hypothesis='A documented next step may reduce repeated date changes; effect is unproven.'),
        dict(id='ACTION-002',title='Resolve bookings versus recognized revenue definition',
        owner='Finance partner',due='2026-09-18',status='Done',dependency='GTM Operations',
        alternative='Use one combined sales total (rejected: different recognition dates)',
        outcome='Separate contracts; short-cycle revenue is included once in recognized revenue.',
        created='2026-09-04',region='All',review_on='2026-09-18',baseline='Conflicting definitions',hypothesis='Definition conflict, not missing demand.')]
    data=dict(version='2.0.0',source_kind='synthetic',scenario_id=SCENARIO,seed=SEED,as_of=AS_OF,
        currency='USD',calendar='Calendar quarters, Monday week start',metric_version='2.0.0',
        generated_at='2026-09-20',dates=dates,stages=STAGES,sellers=sellers,accounts=accounts,
        roster=roster,opportunities=opportunities,snapshots=snapshots,quotas=quotas,revenue=revenue,
        activities=activities,forecast_calls=calls,subscriptions=subscriptions,costs=costs,
        merchants=merchants,payments=payments,decisions=decisions,
        assumptions={'stage_probability':{'Prospecting':.1,'Qualification':.25,'Discovery':.45,'Proposal':.65,'Negotiation':.8},
            'category_probability':{'Pipeline':.2,'Best Case':.5,'Commit':.85},
            'margin':.75,'monthly_churn':.02,'overdue_days':0,'stale_days':21},
        source={'url':'https://www.kaggle.com/datasets/nilkamalsaha/crm-sales-opportunities-on-google-sheets',
            'license':'CC0-1.0','use':'Dimension references only. Planning facts generated independently.',
            'observed_dates':'2016–2017','planning_dates':'2026; independent simulated timeline'},
        limitations=['No production authentication or external messaging.',
            'Synthetic outcomes establish functionality, not predictive validity or business impact.',
            'Original quota app source is not in the inspected repository; new resource scenarios are independent.'])
    return data

def export(data):
    OUT.mkdir(parents=True,exist_ok=True)
    (ROOT/'data/sql').mkdir(parents=True,exist_ok=True)
    content=json.dumps(data,ensure_ascii=False,separators=(',',':'))
    (OUT/'scenario.json').write_text(content,encoding='utf-8')
    (ROOT/'assets/planning-data.js').write_text('window.PLANNING_DATA='+content+';\n',encoding='utf-8')
    db=sqlite3.connect(':memory:')
    for table in ['sellers','accounts','roster','snapshots','quotas','revenue','activities','forecast_calls','subscriptions','costs','merchants','payments']:
        rows=data[table]
        fields=list(rows[0])
        def sql_type(k):
            vals=[r[k] for r in rows if r[k] is not None]
            return 'REAL' if vals and isinstance(vals[0],(int,float,bool)) else 'TEXT'
        db.execute(f'CREATE TABLE {table} ('+', '.join(f'"{k}" {sql_type(k)}' for k in fields)+')')
        db.executemany(f'INSERT INTO {table} VALUES ('+','.join('?' for _ in fields)+')',[[int(r[k]) if isinstance(r[k],bool) else r[k] for k in fields] for r in rows])
        with (OUT/(table+'.csv')).open('w',newline='',encoding='utf-8') as f:
            writer=csv.DictWriter(f,fieldnames=fields+['source_kind','scenario_id'] if 'source_kind' not in fields else fields)
            writer.writeheader()
            for row in rows:writer.writerow(dict(row,source_kind='synthetic',scenario_id=SCENARIO) if 'source_kind' not in fields else row)
    db.executescript((ROOT/'data/sql/operating_model.sql').read_text())
    outputs={}
    db.row_factory=sqlite3.Row
    for view in ['seller_performance','movement_bridge','purchase_classification','forecast_quality','recurring_bridge','cohort_retention','quality_exceptions']:
        outputs[view]=[dict(r) for r in db.execute(f'SELECT * FROM {view}')]
    (OUT/'sql-results.json').write_text(json.dumps(outputs,indent=2),encoding='utf-8')
    (ROOT/'assets/sql-results.js').write_text('window.SQL_RESULTS='+json.dumps(outputs,separators=(',',':'))+';',encoding='utf-8')
    manifest={'version':data['version'],'seed':SEED,'scenario_id':SCENARIO,'as_of':AS_OF,
        'source_kind':'synthetic','generator':'scripts/build_operating_model.py','engine':'SQLite 3 (Python stdlib)',
        'tables':{k:len(data[k]) for k in ['snapshots','sellers','accounts','quotas','revenue','activities','forecast_calls','subscriptions','merchants','payments']},
        'files':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(OUT.glob('*')) if p.name!='manifest.json'}}
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    print(json.dumps({'scenario':SCENARIO,'tables':manifest['tables'],'sql_views':{k:len(v) for k,v in outputs.items()}}))

if __name__=='__main__':export(generate())
