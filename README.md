# Renato Rodrigo Bruxel — Commercial Excellence & AI/Data Transformation

I connect commercial strategy, forecasting, CRM, governed analytics and workflow automation to help leaders understand performance and act on it. My work spans Commercial Excellence, GTM Operations, sales performance, incentive governance and executive decision support, with hands-on SQL, Power BI, Python and Salesforce experience.

Based in Blumenau, Brazil. [LinkedIn](https://www.linkedin.com/in/renato-rodrigo-bruxel) · [Contact](mailto:renato.bruxel@hotmail.com)

## Professional evidence

The following outcomes come from Renato's supplied professional profile. They describe employment experience, **not results produced or independently verified by these demonstration files**.

| Experience | Supplied evidence |
|---|---|
| AI-assisted executive reporting workflow | 83% reduction in weekly preparation time |
| Leadership review process | 50% shorter review cycle |
| Governed quota and actuals consolidation | Up to 75% faster than the previous multi-week operating cycle |
| Sales incentive governance and quota-setting analytics | Approximately 450 sellers |

My contribution is to establish shared definitions, connect fragmented inputs, identify decision gaps, automate repeatable work and introduce validation and review mechanisms. These prototypes illustrate parts of that approach; they do not establish authorship or production readiness of an employer system.

## Explore the existing prototypes

**Current review status: Needs revision.** Source provenance and production readiness remain unverified; the [final audit](./docs/FINAL_PORTFOLIO_AUDIT.md) records the release conditions.

Start with the [portfolio index](./index.html). Hosted links below point to existing demos and may show an earlier revision until an approved release is published.

| Project | Decision illustrated | What is in this repository | Existing hosted demo |
|---|---|---|---|
| [Weekly Check-In Portal](./weekly-checkin-portal/) | What changed in the forecast, and what requires leadership review? | Standalone HTML workflow and scripted chat prototype | [Open demo](https://renatorbruxel.github.io/projects/weekly-checkin-portal/weekly-checkin-portal.html) |
| [Pipeline Intelligence](./funnel-management/) | Where are slippage, pacing and conversion risks concentrated? | Standalone HTML dashboard | [Open demo](https://renatorbruxel.github.io/projects/funnel-management/pipeline-intelligence.html) |
| [Net New Tracker](./net-new-tracker/) | Which classifications need review, and what do the unit economics imply? | Standalone HTML dashboard | [Open demo](https://renatorbruxel.github.io/projects/net-new-tracker/net-new-tracker.html) |
| [Pipeline Pulse](./pipeline-pulse/) | Does pipeline coverage support the selected planning horizon? | Standalone HTML dashboard | [Open demo](https://renatorbruxel.github.io/projects/pipeline-pulse/pipeline-pulse.html) |
| [Sales League](./sales-league/) | Which seller and team performance gaps merit coaching? | Standalone HTML dashboard | [Open demo](https://renatorbruxel.github.io/projects/sales-league/sales-league.html) |

This review covers the seven HTML pages and their supporting documentation and checks. Power BI files are outside the requested scope and remain unchanged.

## Run and check locally

From the repository root, with Python 3 installed:

```bash
python3 -m http.server 8000
```

Open [the local portfolio](http://localhost:8000/). No paid service, account or API token is required for the HTML demonstration. Stop the server with Ctrl+C.

Run the repository's automated checks with Python 3 and Node.js from the same directory:

```bash
python3 tests/run_checks.py
```

Read the [final audit](./docs/FINAL_PORTFOLIO_AUDIT.md) for the actual checks performed and their limits. Passing automated checks does not certify visual layout, source provenance or production security.

## Architecture and metric scope

Each HTML file contains its own markup, styles, JavaScript and embedded scenario values. Browser controls operate on local state or fixed examples. There is no shared governed dataset connecting the five demos. Some sections are independent illustrative scenarios; their periods and denominators must be read before comparing values.

The examples cover attainment, gap to target, pipeline coverage, movement, classification, velocity and unit economics. Relevant formulas and limitations are documented in each project. Illustrative thresholds are assumptions, not approved commercial or compensation policies.

There is no connected live AI service, AWS backend, durable submission store, Word generation service or enforced authentication/RLS in these HTML prototypes. Workflow buttons are demonstrations; they must not be used to submit business records.

## Governance and next steps

The files present their datasets as synthetic. Original provenance has not been independently certified, and the audit must be consulted before external release. This repository does not claim that all existing material has been proven independent of employer code or data. Do not add confidential records, internal architecture, credentials or personal employee information.

A production evolution would require a documented source contract, reproducible synthetic fixtures, consistent metric definitions, authenticated persistence, access-control tests, narrative evaluation and verified exports. The current work reviews and repairs five existing prototypes. It does not deliver the three new flagship repositories described in the broader brief.

See [master-prompt alignment](./docs/MASTER_PROMPT_ALIGNMENT.md) for completed scope, remaining requirements and release conditions.
