"""Build a deterministic download of the public HTML implementation and evidence."""
from pathlib import Path
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / 'downloads/gtm-operating-system-v2.zip'


def source_files():
    files = [ROOT / name for name in ['README.md', 'LICENSE', '.gitignore', '.gitattributes',
                                     'index.html', 'portfolio-deep-dive.html']]
    for name in ['assets', 'data', 'docs', 'scripts', 'tests', 'notebooks']:
        files.extend(p for p in (ROOT / name).rglob('*') if p.is_file()
                     and '__pycache__' not in p.parts and 'browser-artifacts' not in p.parts
                     and p.suffix != '.pyc')
    for name in ['weekly-checkin-portal', 'pipeline-pulse', 'funnel-management',
                 'net-new-tracker', 'sales-league']:
        files.extend(p for p in (ROOT / name).iterdir() if p.is_file()
                     and p.suffix in {'.html', '.md'})
    files.append(ROOT / 'downloads/crm-sales-opportunities-portfolio-v1.zip')
    return sorted(set(files))


def package():
    ARCHIVE.parent.mkdir(exist_ok=True)
    files = source_files()
    with zipfile.ZipFile(ARCHIVE, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in files:
            name = str(path.relative_to(ROOT))
            assert path.exists(), name
            assert not any(part.endswith(('.Report', '.SemanticModel')) for part in path.parts)
            info = zipfile.ZipInfo(name, date_time=(2026, 9, 20, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, path.read_bytes())
    return {'path': str(ARCHIVE.relative_to(ROOT)), 'files': len(files),
            'bytes': ARCHIVE.stat().st_size, 'sha256': hashlib.sha256(ARCHIVE.read_bytes()).hexdigest()}


if __name__ == '__main__':
    print(json.dumps(package()))
