# Net New Tracker

**Status: existing HTML reference prototype; audit and repair scope.**

[Open HTML](./net-new-tracker.html) · [Existing hosted demo](https://renatorbruxel.github.io/projects/net-new-tracker/net-new-tracker.html) · [Portfolio](../README.md)

Hosted content may precede this local revision.

## Purpose and users

Commercial operations and incentive-governance reviewers need to understand revenue classification and identify cases requiring review. This prototype combines classification examples, a small deal sample and illustrative unit economics. It does not determine compensation eligibility or approve payouts.

## Implemented scope

The HTML contains overview, detail, rule, unit-economics, market-position and retention views. The quarter selector updates KPI cards, the insight and the three-category ARR mix. Other panels retain their stated periods. Region, class, source and status filters apply to the 15-deal detail sample; selecting a rule-flow category opens that filtered detail view.

## Architecture and metrics

The browser reads embedded quarter fixtures and deal examples. It does not inspect external account history, execute an approval workflow or query an external data model.

| Metric | Definition in the example | Important limit |
|---|---|---|
| Net New share | Net New ARR ÷ total ARR, including unclassified ARR | The mix contains all three categories |
| Target attainment | Net New ARR ÷ Net New target | Q3 $38.2M ÷ $45.0M rounds to 85%; gap rounds to 15% |
| Confirmation share | Confirmed records ÷ sample records for a classification source | A status count, not proof of classification accuracy |
| Revenue-based LTV:CAC | Annual ARPA ÷ annual churn rate ÷ CAC | $47.2K ÷ 2.8% ÷ $249K = 6.8x; gross margin is excluded |
| CAC payback | CAC ÷ monthly ARPA ÷ gross margin | $249K ÷ $3.93K ÷ 72% = 88.0 months |

Quarter aggregates and the detail sample are independent fixtures. Historical payback inputs are unavailable, so the prior unreconciled trend is not presented. Segment examples, retention and market-position assumptions do not establish measured business outcomes. Classification lookbacks and thresholds require a separate approved policy before operational use.

## Run and validate

From the repository root:

```bash
python3 -m http.server 8000
```

Open [the local Net New Tracker](http://localhost:8000/net-new-tracker/net-new-tracker.html). The HTML demonstration requires no paid service or API token.

```bash
python3 tests/run_checks.py
```

The [repository audit](../docs/FINAL_PORTFOLIO_AUDIT.md) records what was actually checked. [Brief alignment](../docs/MASTER_PROMPT_ALIGNMENT.md) records remaining requirements.

## Governance and production evolution

The scenarios are presented as synthetic; their original provenance has not been independently certified. Do not treat them as employee, customer, compensation or financial records. The existing source is not certified as independent of employer material. Review the audit before external release.

Production work would require transaction-relative account history, versioned classification rules, explicit handling of missing history and overrides, reconciled currency/period definitions, authorized review and a durable audit log. Validate the rules against controlled edge cases before any compensation use.

This example relates to Renato's experience in sales incentive governance, quota analytics, performance measurement and data-quality review. Career outcomes in the [portfolio overview](../README.md#professional-evidence) are separate from the prototype's scenario values and are not measured by this code.
