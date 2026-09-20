# Commercial operating model version 2

The portfolio preserves five domain modules and the existing public URLs, presented through three case studies. The application is a static HTML/JavaScript reference implementation with source-backed educational CRM views and an independent generated planning scenario.

## Reproduce

Requirements: Python 3.11+ (stdlib), Node.js 18+. No package installation, credentials, external model or paid service is needed for the default path.

```bash
python scripts/reproduce.py
python -m http.server 8000
```

Open `http://localhost:8000`. The first command rebuilds the educational CRM from the preserved raw files, regenerates the scenario, executes seven SQLite views, rebuilds the eight HTML pages and runs independent Python/JavaScript business-rule tests. Browser acceptance is separate:

```bash
npm install --no-save playwright@1.51.1
npx playwright install chromium
node tests/operating_browser.cjs
```

Browser fixtures start a loopback HTTP server in the same process. Generated screenshots and sample exports are local QA artifacts. The committed verification summary states the checks that actually ran.

## Data model

- Preserved CRM source and transformations: `data/crm/`. Original 2016–2017 dates, CC0 license and hashes remain available.
- Independent generated planning: `data/planning/`; seed 20260920; scenario `planning-v2-seed-20260920`.
- Grain: opportunity × weekly snapshot; seller × quota month; effective-dated roster; recognition event; forecast × issue date × region × target month; subscription customer × month; acquisition cost × month × region × channel; merchant; payment attempt.
- The generator references public CRM dimension IDs. Planning names, dates, amounts, employment attributes, quotas, activities and outcomes are newly simulated. It does not infer historical snapshots from the Kaggle final-state table.
- Subscriptions and payments are distinct synthetic universes. Hardware bookings never become ARR, MRR or TPV by relabeling.
- Every generated CSV carries a source classification; scenario identity is in the manifest and parent dataset. Browser CSV exports add active context and metric version.

## Execution and state

`assets/gtm-model.js` contains shared calculations, also tested in Node. `data/sql/operating_model.sql` implements independent reconciliations using windows, temporal joins, cohort definitions and movement precedence. `assets/gtm-app.js` contains views and browser-local workflow. No server, cloud account, API key or CDN is required.

The forecast call follows draft → submitted → approved, or submitted → returned. Invalid inputs cannot be submitted. Return requires a reason; approval requires the simulated Reviewer role. Approval stores a frozen copy. A new version retains the earlier frozen package. This is demonstrator behavior, not tamper-proof enterprise authorization.

Actions persist across modules and review snapshots. Closing an action requires an outcome. WBR, MBR and QBR have distinct questions. Word exports are actual OOXML `.docx` packages, not renamed HTML. CSV exports preserve filtered records and escape spreadsheet-formula prefixes in text.

## Controls and contracts

Same-context cards, tables, narratives and exports use the shared engine. Quotas are only available at supported seller/region/month grain; product and segment cuts return unavailable target ratios. A zero remaining gap produces N/A gap coverage. Missing values are never silently imputed as observed facts.

Revenue recognition and backlog use the same contract schedule; short-cycle Book & Bill is included once. ARR uses recurring-ledger opening balances and events. NRR/GRR exclude new customers from the opening cohort. Forecast backtests use a fixed 28-day horizon and issue-time facts. Candidate and baseline are reported even when the candidate loses.

## Security and limitations

All analytical bundles are public downloadable data. UI role filtering is a simulation, not data security. Browser local storage is local and user-editable; it is not an enterprise audit log or collaborative database. Notifications are previews only. The copilot is deterministic query routing and retrieval, without a live LLM. It refuses unsupported questions and mutations and has explicit regression fixtures.

The original quota shell referenced missing `/src/main.tsx`. Its implementation was not recovered from the inspected `pro` folder, neighboring project listing or targeted filename search. No source from that private application is published. New resource planning covers the reviewed business capability independently.

Professional outcomes are candidate-provided and clearly separate from synthetic results. Exact employment dates and underlying calculation workpapers were not supplied. Those evidence gaps are not manufactured.

## Production evolution

Add authenticated services, persistent workflow storage, protected data adapters, effective authorization, monitored refreshes and model-provider evaluation before using production information. No such capabilities are claimed for this static implementation.

## Relationship to experience

This independent reference implementation demonstrates analytical and operating-model patterns used in commercial performance work. No employer source, records, schemas, screenshots, prompts, customer information or proprietary business logic were copied into it. The educational CRM retains its public provenance. Professional tools are distinguished from the SQLite/browser choices of this portfolio.
