# Kaggle data foundation — September 20, 2026

The selected dataset is [CRM Sales Opportunities on Kaggle](https://www.kaggle.com/datasets/nilkamalsaha/crm-sales-opportunities-on-google-sheets), version 1, published by nilkamalsaha under CC0. It describes a fictional B2B computer hardware company. [Maven Analytics](https://mavenanalytics.io/data-playground/crm-sales-opportunities) independently lists the dataset as public domain and describes its account, product, sales-team and opportunity scope.

This source fits the portfolio's commercial sales focus better than retail transaction or omnichannel inventory data. A single source preserves shared account, product, opportunity and seller keys across the five intended project views.

## Delivered

- Five byte-preserved original CSVs and their SHA-256 provenance manifest.
- Four clean core tables, weekly close aggregates, a clean-field dictionary and a JSON model.
- A standard-library Python builder, an inspection notebook and a reusable JavaScript adapter.
- A download/inspection page at `data/index.html`, with filtering, pagination, weekly close and seller views.
- Download and inspection links in all seven original HTMLs.
- A versioned ZIP with data, documentation and reproduction code, available without a Kaggle account.

Power BI files are unchanged. The source MD remains the portfolio reference; this update addresses traceable shared data and reproducibility of transformations.

## Validation evidence

The preserved source contains 8,800 unique opportunities, 85 accounts, seven products and 35 registered sellers; 30 sellers occur in the opportunity table. Joining dimensions preserves all 8,800 opportunities and reconciles won value to 10,005,534 source currency units.

Two explicit normalizations were applied: 1,480 `GTXPro` product references and 12 `technolgy` account sectors. There are no unmatched nonempty account, seller or normalized product keys. The 1,425 missing account references and 2,089 unknown open values/dates are retained.

The UI and adapter use the same generated model. Verification covers raw hashes, joins, stage/date consistency, aggregate reconciliation, filter and empty states, dataset-page rendering at desktop/mobile widths and an actual ZIP download from a local HTTP server. Detailed counts are in `data/crm/reports/quality.json`; commands are in the data guide.

## Boundaries of the integration

The dataset explorer is source-backed. The five existing dashboard scenario panels are still their own examples; adding a common dataset does not silently make their current numbers source-backed. A complete migration needs per-panel replacement and explicit handling of missing metrics.

The source has no quotas, historical pipeline snapshots, open opportunity values, authoritative Net New history, ARR/CAC/churn, approved forecasts or submission states. Those facts were not invented. First-observed purchases and weekly actual closes are labeled according to what they measure. Source dates remain 2016–2017, not current-year performance.

The source's original synthetic generator is unavailable; only the transformations from the preserved CSVs are reproducible. The previous audit remains a record of the earlier HTML review, and the full master brief is still only partially satisfied.
