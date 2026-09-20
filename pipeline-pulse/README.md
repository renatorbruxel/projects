# Pipeline Pulse

**Status: existing HTML reference prototype; audit and repair scope.**

[Open HTML](./pipeline-pulse.html) · [Existing hosted demo](https://renatorbruxel.github.io/projects/pipeline-pulse/pipeline-pulse.html) · [Portfolio](../README.md)

Hosted content may precede this local revision.

## Purpose and users

Regional leaders and operations analysts need to judge whether pipeline depth, timing and quality support the plan. This prototype brings coverage, movement, activity and stage aging into a common review interface, illustrating questions for the next sales review.

## Implemented scope

The standalone HTML includes current and historical snapshots, quarter/horizon examples, coverage, activity, movement, hygiene, a deal scatterplot and raw detail. Scatterplot filters operate on the embedded deal sample. Other charts and narratives are fixed scenarios, not live CRM summaries or a replayable 52-week history.

## Architecture and metrics

HTML/CSS/SVG and JavaScript render embedded values and local controls. The page has no connected data backend.

| Metric | Definition to inspect | Important limit |
|---|---|---|
| Pipeline coverage | Open pipeline ÷ quota for the stated horizon | A quota denominator must refer to the same period as the numerator |
| Gap to coverage target | Threshold × quota − pipeline | The 3x threshold is a scenario assumption, not a universal guarantee |
| Week-over-week movement | Current pipeline − prior pipeline | Additions and removals must reconcile to that delta |
| Stage aging | Days in the current stage | Distinct from a past-due close date |
| Median deal size / aging | Median of the filtered deal sample | Sample figures are not full-portfolio statistics |

Annual and rolling multi-quarter views must not be interpreted interchangeably. Fixed cohorts and scenario series do not establish forecast accuracy, calibrated hygiene risk or causal links between activity and revenue. Consult the audit for unresolved reconciliation issues.

## Run and validate

From the repository root:

```bash
python3 -m http.server 8000
```

Open [the local Pipeline Pulse](http://localhost:8000/pipeline-pulse/pipeline-pulse.html). The HTML demonstration requires no paid service or API token.

```bash
python3 tests/run_checks.py
```

The [repository audit](../docs/FINAL_PORTFOLIO_AUDIT.md) records what was actually checked. [Brief alignment](../docs/MASTER_PROMPT_ALIGNMENT.md) records remaining requirements.

## Governance and production evolution

The scenarios are presented as synthetic; their original provenance has not been independently certified. Do not treat them as employee, customer, compensation or financial records. The existing source is not certified as independent of employer material. Review the audit before external release.

Production work would unify dated snapshots, fiscal horizons, quota definitions and activity history; derive chart values and narratives from the same selected data; validate movement reconciliation and empty/filter states.

This example relates to Renato's experience in pipeline progression, forecast categories, funnel health, productivity analysis and executive decision support. Career outcomes in the [portfolio overview](../README.md#professional-evidence) are separate from the prototype's scenario values and are not measured by this code.
