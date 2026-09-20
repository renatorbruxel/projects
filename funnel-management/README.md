# Pipeline Intelligence

**Status: existing HTML reference prototype; audit and repair scope.**

[Open HTML](./pipeline-intelligence.html) · [Existing hosted demo](https://renatorbruxel.github.io/projects/funnel-management/pipeline-intelligence.html) · [Portfolio](../README.md)

Hosted content may precede this local revision.

## Purpose and users

A commercial leader or operations analyst needs to separate pipeline volume from timing and conversion risk. This prototype illustrates review of push-outs, pull-ins, overdue opportunities, pacing and velocity, supporting a focused discussion of what to investigate next.

## Implemented scope

The standalone HTML has nine views, including summary, movement, pacing, raw detail, velocity and conversion. Region filtering on the push-out table, raw-data search, sorting and tab navigation operate locally. The figures are embedded examples rather than connected CRM records.

## Architecture and metrics

HTML/CSS/SVG and JavaScript render local fixtures. The page has no connected data backend.

| Metric | Definition in the example | Important limit |
|---|---|---|
| Attainment | Actuals ÷ quarter quota | $61M ÷ $65.8M rounds to 93% |
| Coverage | Open pipeline ÷ full quarter quota | $187M ÷ $65.8M rounds to 2.8x; the 3x threshold is illustrative |
| Gap to quota | Quota − actuals | Distinct from the pipeline creation gap |
| Pipeline velocity | Opportunity count × average contract value × win rate ÷ cycle days | Current inputs produce $49,899/day; segment cohorts are independent examples |
| Stretch pacing | Cumulative actuals against an $80M scenario target | This target differs explicitly from the $65.8M summary quota |

Historical velocity is withheld where comparable formula inputs are unavailable. Raw detail is an illustrative sample, not evidence of a complete reconciliation to all summary figures. No calibrated close probability or causal effect is established by the scenarios.

## Run and validate

From the repository root:

```bash
python3 -m http.server 8000
```

Open [the local Pipeline Intelligence](http://localhost:8000/funnel-management/pipeline-intelligence.html). The HTML demonstration requires no paid service or API token.

```bash
python3 tests/run_checks.py
```

The [repository audit](../docs/FINAL_PORTFOLIO_AUDIT.md) records what was actually checked. [Brief alignment](../docs/MASTER_PROMPT_ALIGNMENT.md) records remaining requirements.

## Governance and production evolution

The scenarios are presented as synthetic; their original provenance has not been independently certified. Do not treat them as employee, customer, compensation or financial records. The existing source is not certified as independent of employer material. Review the audit before external release.

Production work would first establish dated opportunity snapshots, a common grain and currency basis, reconciled detail-to-summary totals and explicit ownership of the coverage denominator.

This example relates to Renato's experience in funnel analysis, forecasting, governed KPI definitions and leadership performance reviews. Career outcomes in the [portfolio overview](../README.md#professional-evidence) are separate from the prototype's scenario values and are not measured by this code.
