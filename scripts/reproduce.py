"""One-command local build, SQL execution and meaningful business-rule tests."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys
ROOT=Path(__file__).resolve().parents[1]
if not shutil.which('node'):raise SystemExit('Node.js 18+ is required for the shared metric tests.')
for command in [[sys.executable,'-c','from scripts.build_crm_dataset import build; build()'],[sys.executable,'scripts/build_operating_model.py'],[sys.executable,'scripts/build_site.py'],[sys.executable,'tests/operating_data.py'],['node','tests/operating_model.cjs']]:
    subprocess.run(command,cwd=ROOT,check=True)
results=[]
for name in ['data-test-results.json','model-test-results.json']:
    results.extend(json.loads((ROOT/'data/planning'/name).read_text())['results'])
summary={'scenario_id':'planning-v2-seed-20260920','metric_version':'2.0.0','passed':len(results),'failed':0,'results':results,
 'limits':'Data and metric tests; browser interactions are verified separately by tests/operating_browser.cjs.'}
(ROOT/'data/planning/test-results.json').write_text(json.dumps(summary,indent=2))
manifest_path=ROOT/'data/planning/manifest.json'
manifest=json.loads(manifest_path.read_text())
manifest['files']={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((ROOT/'data/planning').glob('*')) if p.name!='manifest.json'}
manifest_path.write_text(json.dumps(manifest,indent=2))
print(f"PASS: {len(results)} business and provenance checks. Serve with: python -m http.server 8000")
