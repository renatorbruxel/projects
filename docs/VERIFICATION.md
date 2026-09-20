# Version 2 verification

Validation date: 2026-09-20. Scenario: `planning-v2-seed-20260920`. Metric contract: `2.0.0`.

## Executed checks

| Area | Result | Evidence |
|---|---|---|
| Clean ZIP extraction | Rebuilt CRM, scenario, SQL, HTML and package; all 31 checks passed | `docs/package-verification.json` |
| Data and provenance | 15 passed | `data/planning/data-test-results.json` |
| Shared metrics against independent SQLite calculations and boundary fixtures | 16 passed | `data/planning/model-test-results.json` |
| Browser navigation | 39 views, planning and educational CRM modes | `docs/operating-browser-results.json` |
| Responsive layout | All planning views at 1440 px and 390 px; no page overflow | Browser result file |
| Runtime | No JavaScript errors during the acceptance suite | Browser result file |
| Review workflow | Draft, submit, return with reason, reviewer approval, frozen reload, revision | Browser acceptance code |
| Export cadence | Approved metrics remain frozen while MBR uses its selected cadence | Browser acceptance code |
| Word | Actual OOXML package opened and rendered to five pages; every page visually inspected | Generated browser export and LibreOffice render |
| CSV | Search, empty result and exact filtered export with context | Browser acceptance code |
| Follow-up | Actions persist across review snapshots; preparation events are actual browser timings | Browser acceptance code |
| Copilot | Ten runtime fixtures plus metric, grain, injection and simulated role boundaries | Browser and shared-model suites |
| Numerical boundaries | Zero denominator/churn, unavailable grain, movement closure, forecast baseline, demand cap | Shared-model suite |

Screenshots were inspected for home, executive overview, growth, seller and data views, including desktop and mobile examples. Visual inspection does not constitute a full accessibility audit. Keyboard tab navigation and focus behavior were exercised in Chromium; no cross-browser or screen-reader certification is claimed.

## Reproduction

```bash
python scripts/reproduce.py
python scripts/package_portfolio.py
```

The first command rebuilds the CRM transformation from preserved raw files, generates the independent planning data, executes seven SQLite views, rebuilds eight HTML entry points and runs the 31 checks. The second builds the distributable ZIP. The optional Playwright suite is documented in `tests/README.md`.

The download excludes Power BI projects, private source material, local credentials and browser QA output. Its own ZIP is not recursively embedded; run the packaging command after extraction to restore the site's local download button.

## Scope limits

The result is a static portfolio demonstration. Approval and role controls are browser simulations. This review does not establish real-world forecast lift, causal business outcomes, a production authorization boundary or independently verified professional impact. Original quota implementation source and exact employment dates/measurement workpapers remain unavailable, as recorded in `IMPLEMENTATION_STATUS.md`.
