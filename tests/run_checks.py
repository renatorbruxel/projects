"""Run focused portfolio regressions with Python 3 and Node.js (no Python packages)."""
from pathlib import Path
from html import unescape
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re
import shutil
import sqlite3
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]

def check(condition, message):
    if not condition:
        raise AssertionError(message)

class LocalLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            if key in attrs:
                self.links.append(attrs[key])

def check_local_links():
    pages = {p: LocalLinks() for p in ROOT.rglob('*.html') if '.git' not in p.parts}
    for p, parser in pages.items():
        parser.feed(p.read_text())
    count = 0
    for p, parser in pages.items():
        for href in parser.links:
            link = urlsplit(href)
            if link.scheme or link.netloc:
                continue
            target = (p.parent / unquote(link.path)).resolve() if link.path else p
            check(target.exists(), f'Missing local target: {p.name}: {href}')
            if link.fragment and target in pages:
                check(unquote(link.fragment) in pages[target].ids,
                      f'Missing anchor: {p.name}: {href}')
            count += 1
    print(f'PASS: {count} local HTML links/assets/anchors resolve. External URLs not checked.')

def main():
    node = shutil.which('node')
    check(node is not None, 'Node.js is required for JavaScript regression checks.')
    subprocess.run([node, str(ROOT/'tests/check_frontend.cjs')], check=True)
    check_local_links()
    source = (ROOT/'portfolio-deep-dive.html').read_text()
    blocks = [unescape(re.sub(r'<[^>]*>', '', x)) for x in re.findall(r'<pre>(.*?)</pre>',source,re.S)]
    sql = next(x for x in blocks if 'WITH prior_revenue AS' in x)
    db = sqlite3.connect(':memory:')
    db.execute('CREATE TABLE closed_won_deals (opportunity_id TEXT, account_id TEXT, account_name TEXT, close_date TEXT, arr_usd REAL)')
    db.executemany('INSERT INTO closed_won_deals VALUES (?,?,?,?,?)',[
        ('D1','A','Demo A','2026-08-01',100),('D2','A','Demo A','2026-08-02',50),
        ('D3','B','Demo B','2019-01-01',100),('D4','B','Demo B','2026-08-01',200),
        ('D5','C','Demo C','2022-01-01',100),('D6','C','Demo C','2026-08-01',200)])
    result={row[0]:row[3] for row in db.execute(sql)}
    check(result=={'D1':'Net New','D2':'Installed Base','D3':'Net New','D4':'Net New','D5':'Net New','D6':'Reactivation'},'Net New deal-relative history regression')
    py = next(x for x in blocks if 'def build_deal_changes_context' in x)
    old=[{'id':str(i),'account':'Demo','amount':100_000} for i in range(10)]
    new=[dict(d,amount=150_000) for d in old]
    scope={'fetch_submissions':lambda region,quarter,week:new if week==38 else old}
    exec(compile(py,'portfolio-example','exec'),scope)
    check(scope['build_deal_changes_context']('Demo','Q3',38)['net_impact_M']==0.5,'Small movements must contribute to net delta')
    forbidden=re.compile(r'ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|AKIA[0-9A-Z]{16}|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----')
    for p in ROOT.rglob('*'):
        if p.is_file() and p.suffix in {'.html','.md','.py','.cjs'} and '.git' not in p.parts:
            try: text=p.read_text()
            except UnicodeError: continue
            check(not forbidden.search(text),f'Potential secret in {p.relative_to(ROOT)}')
    check(abs(147*48200*0.331/47-49899.30638297873)<1e-7,'Velocity arithmetic')
    check(abs(249/(3.93*0.72)-87.9983036471586)<1e-7,'Payback month units')
    print('PASS: HTML code examples: SQLite self-history and dormancy cases; 10 small movements total +0.5M; arithmetic; high-risk secret patterns.')
    print('LIMIT: static/unit checks do not certify rendered accessibility or full master-prompt compliance. Power BI is outside this review.')

if __name__=='__main__':
    main()
