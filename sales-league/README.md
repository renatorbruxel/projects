# Sales League

**Status: existing HTML reference prototype; audit and repair scope.**

[Open HTML](./sales-league.html) · [Existing hosted demo](https://renatorbruxel.github.io/projects/sales-league/sales-league.html) · [Portfolio](../README.md)

Hosted content may precede this local revision.

## Purpose and users

Sellers, managers and commercial operations need a consistent view of quota, actuals and the actions that may close a performance gap. This prototype illustrates scorecards, regional comparison and coaching conversations. Gamification and recovery scenarios are examples, not validated performance-management policy.

## Implemented scope

The HTML presents a 12-seller fixture with leaderboard, seller scorecard, manager/region examples, opportunity detail, distributions, declaration preview, recovery, roster and capacity scenarios. Seller selection and local comparison controls demonstrate browser interactions.

## Architecture and metrics

HTML/CSS/SVG and JavaScript render local seller fixtures. Anyone opening the HTML can inspect its embedded data; the page has no authenticated seller or manager boundary. Declaration controls do not create a durable commitment, approval record or payout instruction.

| Metric | Definition to inspect | Important limit |
|---|---|---|
| Attainment | Actuals ÷ quota | Regional totals should use summed actuals ÷ summed quotas |
| Gap to target | Target − actuals, with the intended sign stated | Distinguish an unmet gap from an overachievement |
| Coverage | Pipeline ÷ the labeled quota basis | Full quota and remaining quota are different denominators |
| Distribution | Seller counts in mutually exclusive attainment bands | Bands must reconcile to the same eligible seller population |
| Capacity scenario | Headcount × explicit productivity/attainment assumptions | Hiring and ramp outputs are assumptions, not proven forecasts |

Peer averages, tier counts and narrative summaries must use a consistent population. No causal effect of coaching, calibrated recovery probability, fairness certification or compensation recommendation is demonstrated by these fixtures.

## Run and validate

From the repository root:

```bash
python3 -m http.server 8000
```

Open [the local Sales League](http://localhost:8000/sales-league/sales-league.html). The HTML demonstration requires no paid service or API token.

```bash
python3 tests/run_checks.py
```

The [repository audit](../docs/FINAL_PORTFOLIO_AUDIT.md) records what was actually checked. [Brief alignment](../docs/MASTER_PROMPT_ALIGNMENT.md) records remaining requirements.

## Governance and production evolution

The scenarios are presented as synthetic; their original provenance has not been independently certified. Do not treat them as employee, customer, compensation or financial records. The existing source is not certified as independent of employer material. Review the audit before external release.

Production work would require governed eligibility and quota rules, authenticated access, tested server-side authorization/RLS, consent handling, reconciled aggregates and immutable submissions. Capacity recommendations also need explicit productivity, attrition, hiring-date and ramp assumptions.

This example relates to Renato's experience in sales performance management, incentive governance, quota-setting analytics and cross-regional operating reviews. Career outcomes in the [portfolio overview](../README.md#professional-evidence) are separate from the prototype's scenario values and are not measured by this code.
