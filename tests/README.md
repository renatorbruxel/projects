# Test entry points

`python scripts/reproduce.py` runs the current data and shared-metric suites. `node tests/operating_browser.cjs` runs the optional browser acceptance with Playwright 1.51.1. The established `python tests/run_checks.py` delegates to the current suite.

Earlier `check_frontend.cjs`, `check_browser.cjs`, `check_crm_adapter.cjs` and `check_dataset_browser.cjs` were written for baseline commit 8870e7c. Their replaced UI fixtures are historical; they are not current acceptance gates. Source-only `check_crm_data.py` remains applicable to the preserved CRM package.
