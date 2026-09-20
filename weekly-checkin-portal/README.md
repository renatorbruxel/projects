# Weekly Check-In Portal

**Status: existing HTML reference prototype; audit and repair scope.**

[Open HTML](./weekly-checkin-portal.html) · [Existing hosted demo](https://renatorbruxel.github.io/projects/weekly-checkin-portal/weekly-checkin-portal.html) · [Portfolio](../README.md)

Hosted content may precede this local revision.

## Purpose and users

Regional contributors and a commercial operations lead need a shared weekly view of forecasts, changes, risks and upside. This prototype illustrates an input-review-consolidation workflow and the information a leadership review could consume.

## Implemented scope

The standalone HTML includes a submission-status dashboard, bookings and revenue forms, Book & Bill planning, narrative examples, final-submission preview, guidance, RACI, administration examples, scripted chat and strategy panels. Tabs, visible form controls and local chat responses demonstrate interface behavior.

Workflow panels use a W33 scenario; strategy panels use separate W38 scenarios. They are not a synchronized operational cycle. Inputs are not durably saved. Save, submit, refresh, approval and export actions are demonstration previews, not completed transactions.

## Architecture and metrics

One HTML file contains styles, JavaScript and embedded fixtures. There is **no connected AI API, AWS/EC2 backend, credential service, Word generator, authentication or persistent submission store** in this public prototype. Chat responses are scripted local examples.

| Concept | Meaning in the prototype | Important limit |
|---|---|---|
| Actual / target / forecast | Distinct commercial reference values | Displayed scenarios do not establish a governed source contract |
| Outlook change | Comparison to a stated prior outlook | Period, scope and currency must match |
| Risks and upside | Scenario inputs supporting a review narrative | They are not calibrated probabilities or validated AI predictions |
| Approval status | Example workflow state | Browser presentation does not enforce authorization or immutability |
| Consolidation | Leadership-facing example totals | Independent panels must not be assumed to reconcile |

A version label is not evidence of production releases, adoption or uptime. The prototype does not prove delivery of the reporting-time improvements cited in Renato's professional profile.

## Run and validate

From the repository root:

```bash
python3 -m http.server 8000
```

Open [the local Weekly Check-In Portal](http://localhost:8000/weekly-checkin-portal/weekly-checkin-portal.html). The HTML demonstration requires no paid service or API token.

```bash
python3 tests/run_checks.py
```

The [repository audit](../docs/FINAL_PORTFOLIO_AUDIT.md) records what was actually checked. [Brief alignment](../docs/MASTER_PROMPT_ALIGNMENT.md) records remaining requirements.

## Governance and production evolution

The scenarios are presented as synthetic; their original provenance has not been independently certified. Do not treat them as employee, customer, compensation or financial records. The existing source is not certified as independent of employer material. Review the audit before external release.

Production work would add a source contract and reproducible fixtures, authenticated persistence, server-side approval and period locking, reconciled totals, traceable narrative generation with human review, and tested document export. Existing interface labels are a design starting point, not evidence that those services exist.

This example relates to Renato's experience in weekly forecasting, commercial performance governance, executive reporting and responsible AI enablement. Career outcomes in the [portfolio overview](../README.md#professional-evidence) are separate from the prototype's scenario values and are not measured by this code.
