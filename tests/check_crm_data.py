"""Verify the public CRM foundation against independently read raw CSVs."""
from pathlib import Path
from collections import Counter
import csv
import hashlib
import json
import subprocess
import shutil

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data' / 'crm'


def main():
    source = json.loads((DATA/'source.json').read_text())
    data = json.loads((DATA/'portfolio-data.json').read_text())
    for name, meta in source['files'].items():
        assert hashlib.sha256((DATA/'raw'/name).read_bytes()).hexdigest() == meta['sha256']
    with (DATA/'raw/sales_pipeline.csv').open(newline='') as f:
        raw = list(csv.DictReader(f))
    rows = data['opportunities']
    assert len(rows) == len(raw) == len({r['opportunity_id'] for r in rows}) == 8800
    assert Counter(r['deal_stage'] for r in rows) == Counter(r['deal_stage'] for r in raw)
    assert sum(r['close_value'] for r in rows if r['deal_stage'] == 'Won') == sum(int(r['close_value']) for r in raw if r['deal_stage'] == 'Won') == 10005534
    assert sum(r['account_id'] is None for r in rows) == 1425
    assert all(r['close_value'] is None and r['close_date'] is None for r in rows if r['deal_stage'] in ('Engaging','Prospecting'))
    assert all(r['sales_cycle_days'] >= 0 for r in rows if r['sales_cycle_days'] is not None)
    assert sum(r['purchase_type_observed'] == 'First observed purchase' for r in rows) == 94
    with (DATA/'clean/weekly_closed.csv').open(newline='') as f:
        weekly = list(csv.DictReader(f))
    assert sum(int(r['won_deal_value']) for r in weekly) == 10005534
    subprocess.run([shutil.which('node'), str(ROOT/'tests/check_crm_adapter.cjs')], check=True)
    print('PASS: raw provenance hashes; opportunity grain; stage/value reconciliation; nulls; date order; observed purchases; weekly totals.')


if __name__ == '__main__':
    main()
