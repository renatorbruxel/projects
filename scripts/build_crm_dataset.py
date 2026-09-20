"""Rebuild the shared CRM data package from preserved Kaggle CSVs.

Python 3 standard library only. No network, invented quotas or shifted dates.
"""
from collections import Counter, defaultdict
from datetime import date, timedelta
from pathlib import Path
import csv
import hashlib
import json
import statistics
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data' / 'crm'
RAW = DATA / 'raw'


def read_csv(name):
    with (RAW / name).open(encoding='utf-8-sig', newline='') as stream:
        return list(csv.DictReader(stream))


def write_csv(path, rows, fields=None):
    fields = fields or list(rows[0])
    with path.open('w', encoding='utf-8', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=fields, lineterminator='\n')
        writer.writeheader()
        writer.writerows(rows)


def save_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def summary(rows):
    won = [r for r in rows if r['deal_stage'] == 'Won']
    closed = [r for r in rows if r['deal_stage'] in ('Won', 'Lost')]
    cycles = [r['sales_cycle_days'] for r in won if r['sales_cycle_days'] is not None]
    return {
        'opportunities': len(rows),
        'won_deals': len(won),
        'lost_deals': len(closed) - len(won),
        'open_deals': len(rows) - len(closed),
        'won_deal_value': sum(r['close_value'] for r in won),
        'closed_win_rate': len(won) / len(closed) if closed else None,
        'median_won_cycle_days': statistics.median(cycles) if cycles else None,
        'accounts_observed': len({r['account_id'] for r in rows if r['account_id']}),
        'sellers_with_opportunities': len({r['seller_id'] for r in rows}),
        'missing_account': sum(r['account_id'] is None for r in rows),
    }


def build():
    for directory in (DATA/'clean', DATA/'reports', ROOT/'assets', ROOT/'downloads'):
        directory.mkdir(parents=True, exist_ok=True)
    source = json.loads((DATA / 'source.json').read_text())
    for name, info in source['files'].items():
        assert hashlib.sha256((RAW / name).read_bytes()).hexdigest() == info['sha256'], name
    raw_accounts = read_csv('accounts.csv')
    raw_products = read_csv('products.csv')
    raw_sellers = read_csv('sales_teams.csv')
    raw_deals = read_csv('sales_pipeline.csv')
    assert len({r['opportunity_id'] for r in raw_deals}) == len(raw_deals)
    for rows, key in [(raw_accounts, 'account'), (raw_products, 'product'), (raw_sellers, 'sales_agent')]:
        assert len({r[key] for r in rows}) == len(rows), key

    accounts = []
    for index, raw in enumerate(sorted(raw_accounts, key=lambda r: r['account']), 1):
        accounts.append({
            'account_id': f'A{index:03d}', 'account': raw['account'],
            'sector': 'technology' if raw['sector'] == 'technolgy' else raw['sector'],
            'year_established': int(raw['year_established']),
            'annual_revenue_usd_millions': float(raw['revenue']),
            'employees': int(raw['employees']), 'office_location': raw['office_location'],
            'subsidiary_of': raw['subsidiary_of'] or None,
        })
    products = [{'product_id': f'P{i:03d}', 'product': r['product'], 'series': r['series'],
                 'suggested_retail_price': int(r['sales_price'])}
                for i, r in enumerate(sorted(raw_products, key=lambda r: r['product']), 1)]
    sellers = [{'seller_id': f'S{i:03d}', **r}
               for i, r in enumerate(sorted(raw_sellers, key=lambda r: r['sales_agent']), 1)]
    account_lookup = {r['account']: r for r in accounts}
    product_lookup = {r['product']: r for r in products}
    seller_lookup = {r['sales_agent']: r for r in sellers}
    first_won = {}
    for r in raw_deals:
        if r['deal_stage'] == 'Won' and r['account'] and r['close_date']:
            first_won[r['account']] = min(first_won.get(r['account'], r['close_date']), r['close_date'])

    opportunities = []
    for raw in raw_deals:
        product = product_lookup['GTX Pro' if raw['product'] == 'GTXPro' else raw['product']]
        seller = seller_lookup[raw['sales_agent']]
        account = account_lookup.get(raw['account'])
        assert not raw['account'] or account is not None
        stage = raw['deal_stage']
        assert stage in ('Won', 'Lost', 'Engaging', 'Prospecting')
        closed = stage in ('Won', 'Lost')
        close_date = date.fromisoformat(raw['close_date']) if raw['close_date'] else None
        engage_date = date.fromisoformat(raw['engage_date']) if raw['engage_date'] else None
        close_value = int(raw['close_value']) if raw['close_value'] else None
        assert bool(close_date) == closed and (close_value is not None) == closed
        assert not closed or engage_date is not None
        assert close_date is None or engage_date <= close_date
        cycle = (close_date - engage_date).days if close_date and engage_date else None
        purchase = None
        if stage == 'Won' and account:
            purchase = 'First observed purchase' if raw['close_date'] == first_won[raw['account']] else 'Repeat observed purchase'
        opportunities.append({
            'opportunity_id': raw['opportunity_id'],
            'account_id': account['account_id'] if account else None,
            'account': raw['account'] or None,
            'seller_id': seller['seller_id'], 'sales_agent': seller['sales_agent'],
            'manager': seller['manager'], 'regional_office': seller['regional_office'],
            'product_id': product['product_id'], 'product': product['product'],
            'product_series': product['series'],
            'account_sector': account['sector'] if account else None,
            'account_country': account['office_location'] if account else None,
            'deal_stage': stage, 'engage_date': raw['engage_date'] or None,
            'close_date': raw['close_date'] or None, 'close_value': close_value,
            'close_quarter': f'{close_date.year}-Q{(close_date.month-1)//3+1}' if close_date else None,
            'close_month': close_date.strftime('%Y-%m') if close_date else None,
            'close_week_start': (close_date-timedelta(days=close_date.weekday())).isoformat() if close_date else None,
            'sales_cycle_days': cycle, 'purchase_type_observed': purchase,
        })
    opportunities.sort(key=lambda r: r['opportunity_id'])
    total = summary(opportunities)
    assert len(opportunities) == len(raw_deals) == 8800
    assert total['won_deal_value'] == sum(int(r['close_value']) for r in raw_deals if r['deal_stage'] == 'Won')
    quality = {
        'source_version': source['version'], 'rows_before_join': len(raw_deals), 'rows_after_join': len(opportunities),
        'duplicate_opportunity_ids': 0, 'unmatched_nonempty_account_keys': 0,
        'unmatched_seller_keys': 0, 'unmatched_product_keys_after_normalization': 0,
        'missing_source_fields': {key: sum(not r[key] for r in raw_deals) for key in raw_deals[0]},
        'product_alias_rows_fixed': sum(r['product'] == 'GTXPro' for r in raw_deals),
        'account_sector_rows_fixed': sum(r['sector'] == 'technolgy' for r in raw_accounts),
        'stage_counts': dict(sorted(Counter(r['deal_stage'] for r in opportunities).items())),
        'closed_date_range': [min(r['close_date'] for r in opportunities if r['close_date']), max(r['close_date'] for r in opportunities if r['close_date'])],
        'engage_date_range': [min(r['engage_date'] for r in opportunities if r['engage_date']), max(r['engage_date'] for r in opportunities if r['engage_date'])],
        'won_value_reconciles_to_raw': True,
        'missing_accounts_retained': True,
        'open_close_values_remain_null': True,
        'registered_sellers': len(sellers), 'sellers_without_opportunities': len(sellers)-total['sellers_with_opportunities'],
        'purchase_type_counts_won': dict(Counter(r['purchase_type_observed'] or 'Unknown' for r in opportunities if r['deal_stage'] == 'Won')),
        'critical_failures': [],
    }
    compatibility = [
        {'project':'Pipeline Intelligence','direct':'Stage mix, win/loss, product/region performance and sales cycle','missing':'Weekly snapshots, push-outs, pull-ins, original forecast amounts and quota'},
        {'project':'Net New Tracker','direct':'First observed versus repeat purchases within the extract','missing':'Pre-2017 account history, authoritative Net New policy, ARR, CAC, churn and LTV'},
        {'project':'Pipeline Pulse','direct':'Opportunity counts, open stages, seller/region cuts and completed cycle','missing':'Open deal values, close-date revisions, stage-entry history and coverage targets'},
        {'project':'Sales League','direct':'Seller and manager rankings by won value, wins and closed win rate','missing':'Quotas, attainment, compensation eligibility, hire dates and ramp assumptions'},
        {'project':'Weekly Check-In Portal','direct':'Weekly closed-deal totals by seller region and product','missing':'Submission history, approved forecasts, recognized revenue, Book & Bill plans and approvals'},
    ]
    payload = {
        'schema_version':'1.0.0', 'source':source,
        'currency_assumption':'Deal values and list prices are treated as USD for display. The source dictionary explicitly specifies USD millions only for account annual revenue; deal currency is not separately specified.',
        'date_note':'Original 2016–2017 engagement dates and 2017 closes preserved. Open rows have no close quarter or known extraction date.',
        'status_note':'This is the shared downloadable foundation. Existing dashboard scenario panels have not been migrated to these records.',
        'summary':total, 'quality':quality, 'compatibility':compatibility,
        'accounts':accounts, 'products':products, 'sales_teams':sellers, 'opportunities':opportunities,
    }
    for name, rows in [('accounts',accounts),('products',products),('sales_teams',sellers),('opportunities',opportunities)]:
        write_csv(DATA/'clean'/f'{name}.csv', rows)
    weekly = defaultdict(list)
    for row in opportunities:
        if row['close_week_start']:
            weekly[(row['close_week_start'],row['regional_office'])].append(row)
    weekly_rows = [{'week_start':week,'regional_office':region,**summary(rows)} for (week,region),rows in sorted(weekly.items())]
    write_csv(DATA/'clean/weekly_closed.csv',weekly_rows)
    save_json(DATA/'reports/quality.json',quality)
    save_json(DATA/'reports/summary.json',total)
    save_json(DATA/'portfolio-data.json',payload)
    # Compact classic-script bundle works with both file:// and static hosting.
    bundle = json.dumps(payload, ensure_ascii=False, separators=(',',':')).replace('<','\\u003c').replace('\u2028','\\u2028').replace('\u2029','\\u2029')
    (ROOT/'assets/crm-data.js').write_text('/* Generated from preserved Kaggle CSVs; CC0-1.0. See data/crm/source.json. */\nwindow.PORTFOLIO_CRM_DATA = '+bundle+';\n')
    return payload


def package():
    archive = ROOT/'downloads/crm-sales-opportunities-portfolio-v1.zip'
    items = sorted(p for p in DATA.rglob('*') if p.is_file())
    items += [ROOT/'scripts/build_crm_dataset.py',ROOT/'assets/portfolio-crm.js',ROOT/'notebooks/inspect_crm_data.ipynb']
    with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for path in items:
            if not path.exists():
                continue
            info = zipfile.ZipInfo(str(path.relative_to(ROOT)),date_time=(2026,9,20,0,0,0))
            info.compress_type=zipfile.ZIP_DEFLATED
            z.writestr(info,path.read_bytes())
    return archive


if __name__ == '__main__':
    result=build()
    archive=package()
    print(json.dumps({'summary':result['summary'],'quality':result['quality'],'archive':str(archive),'archive_bytes':archive.stat().st_size},indent=2))
