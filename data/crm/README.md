# Shared CRM data foundation

**Kaggle source, ready for reuse across the five HTML projects.** This package contains public fictional data, preserved originals, a cleaned model and reproducible checks. It does not contain employer data.

[Explore and download](../index.html) · [Kaggle source](https://www.kaggle.com/datasets/nilkamalsaha/crm-sales-opportunities-on-google-sheets) · [Source manifest](source.json) · [Quality results](reports/quality.json)

## Source, license and provenance

- Dataset: CRM Sales Opportunities, mirrored on Kaggle by `nilkamalsaha`.
- Kaggle dataset version: 1; downloaded September 20, 2026 through the public Kaggle API.
- Dataset license in Kaggle metadata: **CC0: Public Domain**.
- [Maven Analytics](https://mavenanalytics.io/data-playground/crm-sales-opportunities) describes a fictitious B2B computer hardware company and lists the dataset as public domain.
- [CC0 terms](https://creativecommons.org/publicdomain/zero/1.0/) permit copying, modification and redistribution. Attribution is retained here for provenance; no endorsement is implied.
- Raw files are preserved byte for byte. `source.json` records the ZIP checksum and SHA-256 of every original CSV. Corrections and derived fields apply only to the cleaned layer.

The source's synthetic generator is not supplied, so its original records cannot be regenerated from a seed. The transformations from the preserved raw files are reproducible. No added synthetic business facts are included in this package.

## Tables and grain

| File | Grain | Rows | Notes |
|---|---|---:|---|
| `raw/sales_pipeline.csv` | Opportunity | 8,800 | Unmodified source |
| `raw/accounts.csv` | Account | 85 | Firmographics; annual account revenue is in USD millions |
| `raw/sales_teams.csv` | Seller | 35 | 30 have opportunities; five remain in the dimension without activity |
| `raw/products.csv` | Product | 7 | Suggested retail price is not an open opportunity value |
| `raw/data_dictionary.csv` | Source field definition | 21 | Original descriptions |
| `clean/opportunities.csv` | Opportunity | 8,800 | Enriched with stable dimension IDs, date buckets, cycle and observed purchase type |
| `clean/accounts.csv` | Account | 85 | Corrected sector spelling and typed numeric fields |
| `clean/sales_teams.csv` | Seller | 35 | Stable seller IDs; manager and region preserved |
| `clean/products.csv` | Product | 7 | Stable product IDs |
| `clean/weekly_closed.csv` | Observed close week × seller region | Derived | Closed-deal summary, not submitted forecasts or historical snapshots |
| `portfolio-data.json` | Shared model | All tables | Includes metadata, caveats, quality report and project coverage |

For the opportunity table, `opportunity_id` is the primary key. Dimension keys are stable IDs assigned to sorted source names in version 1: `account_id`, `seller_id`, `product_id`. A missing source account retains a null account key. Account headquarters and seller region are different dimensions.

## Transformations and quality

1. Verify all five raw file hashes before processing.
2. Normalize product alias `GTXPro` → `GTX Pro` in 1,480 opportunities.
3. Correct sector spelling `technolgy` → `technology` in 12 accounts.
4. Validate unique dimension and opportunity keys, then perform many-to-one joins without dropping or multiplying rows.
5. Preserve 1,425 missing account references, 500 missing engagement dates and 2,089 missing close dates/values.
6. Confirm close dates and values exist for Won/Lost and remain null for open stages. Check closed dates do not precede engagement.
7. Derive calendar close quarter/month, Monday week start and completed sales cycle; preserve the actual source years.
8. Reconcile won value to the original file: **10,005,534 source currency units** across 4,238 won opportunities. There are 2,473 lost and 2,089 open opportunities.

Dollar displays assume USD consistently with the source's explicit USD account-revenue unit. The source dictionary does not separately specify the currency of `close_value` or `sales_price`; this is a display assumption, not a currency conversion. Account annual revenue in millions must never be summed with deal values in units.

Engagement dates range from October 20, 2016 to December 27, 2017. Closes run from March 1 to December 31, 2017. This does not establish full-year coverage; Q1 closes only appear from March. The extraction/as-of date of open opportunities is unknown. These records must not be relabeled as current 2026 activity.

## Governed definitions

| Metric / field | Definition | Boundary |
|---|---|---|
| Won deal value | Sum of `close_value` where stage = Won | Not ARR, an approved forecast or recognized accounting revenue |
| Closed win rate | Won count / (Won count + Lost count) | Open opportunities excluded; N/A for a zero denominator |
| Open deals | Count of Engaging + Prospecting | Their values are null; no monetary pipeline coverage can be derived |
| Sales cycle days | Close date − engagement date for completed deals | Not days in current stage |
| Close week | Monday date of the week containing close date | Uses actual closes, not submission week |
| First observed purchase | Won deal on the account's earliest won date in this extract | Tied same-day deals are all first observed; pre-extract history unknown |
| Repeat observed purchase | Won deal after that earliest date | No claim about official Net New or compensation classification |

There are 94 first-observed won deals and 4,144 repeat-observed won deals. “94 deals” does not mean 94 new accounts: there are 85 account keys and same-day ties.

## Fit across the HTMLs

| Project | Directly supported | Additional source or labeled simulation required |
|---|---|---|
| Pipeline Intelligence | Funnel stage mix, win/loss, product/region performance, cycle | Snapshot history, push-outs, pull-ins, quota and forecast revisions |
| Net New Tracker | First-observed / repeat purchases within the extract | Prior customer history, official classification policy, ARR, CAC, churn and LTV |
| Pipeline Pulse | Open counts, stage mix, region/seller cuts | Open deal values, stage-entry dates, expected closes and coverage targets |
| Sales League | Seller/manager rankings, won value, closed win rate | Quotas, attainment, compensation eligibility, hiring and ramp history |
| Weekly Check-In Portal | Weekly closed-deal totals by region/product | Submitted outlooks, approvals, recognized revenue, risks/upside and Book & Bill plans |

The portfolio pages link to this shared foundation and its download. **Their existing scenario panels have not been migrated to these records.** The data explorer is calculated directly from this package. A full migration must replace each panel's scenario and explicitly handle the missing inputs above; it cannot be achieved honestly by substituting filenames or renaming a sales metric as ARR.

## Rebuild and reuse

From the repository root, or the root of the extracted dataset package:

```bash
python3 scripts/build_crm_dataset.py
```

Python 3's standard library is sufficient. The script performs the checks, regenerates clean CSV/JSON, creates `assets/crm-data.js` and builds a deterministic ZIP. It makes no network calls. The [inspection notebook](../../notebooks/inspect_crm_data.ipynb) exposes the checks for review.

Any HTML can consume the same adapter:

```html
<script src="assets/crm-data.js"></script>
<script src="assets/portfolio-crm.js"></script>
<script>
  const rows = PortfolioCRM.filter({region: 'West', quarter: '2017-Q4'});
  const metrics = PortfolioCRM.summarize(rows);
  const weekly = PortfolioCRM.weekly(rows);
  const sellers = PortfolioCRM.sellers(rows);
</script>
```

Use `../assets/` when the HTML lives in a project subfolder. The classic-script bundle works when opened locally and on static hosting. The JSON model is also suitable for Python, SQL ingestion or a future API. No Power BI files are changed by this addition.
