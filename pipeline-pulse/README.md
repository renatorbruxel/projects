# Pipeline Pulse

> **Stack:** Power BI · DAX · TMDL (PBIP format)
> **Pages:** 15 visible · 3 hidden (Help, Info, Feedback) | **Semantic model:** ~70 tables

The most comprehensive pipeline intelligence report in the suite. Tracks pipeline sufficiency using a 3x coverage methodology, week-over-week delta changes, funnel hygiene scores, and multi-horizon views spanning the current quarter through the full fiscal year. Designed for daily use by regional managers and weekly executive review cadences.

Built in PBIP format with full source-control decomposition. Includes Power BI Q&A with trained verified answers for natural language pipeline queries.

---

## Report Pages

### 1. The Pulse — Current View
The flagship landing page. Summarizes pipeline health across all regions with a single sufficiency score and traffic-light status per region. Designed to surface the most important signals in under 30 seconds.

Key visuals:
- 3x sufficiency gauge by region: pipeline value / (quota × 3) ratio
- Week-over-week net pipeline change with directional arrows
- Stage distribution waterfall: how is pipeline distributed across stages?
- Call-out tiles: largest new adds, largest drops, most improved region, biggest deterioration

### 2. The Pulse — Historical View
Same layout as the current view, navigable by any prior week. Allows managers to replay pipeline evolution and explain what changed between reviews.

Key visuals:
- Week selector (rolling 52-week lookback)
- Pipeline trend chart: total pipeline vs. 3x coverage requirement line (rolling 12 weeks)
- All current-view visuals rendered for the selected historical week

### 3. Current Quarter Funnel
All opportunities expected to close in the current quarter — summarized by stage, region, and seller.

Key visuals:
- Funnel by stage: count and dollar value at each stage
- Coverage ratio: current quarter pipeline / current quarter quota
- Seller-level pipeline ranking with quota context
- Stage velocity: average days an opportunity spends at each stage

### 4. Detailed Current Quarter Funnel
Opportunity-level drill-through for the current quarter. Every open deal with close date, stage, seller, region, product line, value, and last-activity date.

### 5. Next Quarter Funnel
Early pipeline view for the following quarter — critical for identifying whether sufficient pipeline is being built 8–12 weeks ahead of the revenue target.

Key visuals:
- NQ pipeline vs. 3× NQ quota target
- NQ pipeline build rate trend: how fast is next quarter's pipeline growing week over week?
- Early-stage vs. late-stage split: is pipeline maturing or just being created?

### 6. Detailed Next Quarter Funnel
Opportunity-level view of next quarter pipeline. Same fields as the current quarter detail page with a future-quarter filter.

### 7. Full Year Funnel
FY pipeline aggregated across all open quarters — used in annual business reviews, QBR preparation, and board-facing forecasts.

Key visuals:
- FY pipeline by quarter bucket (CQ, NQ, NQ+2, NQ+3)
- FY coverage vs. remaining quota
- YTD bookings + pipeline-to-close projection vs. FY target

### 8. Detailed Full Year Funnel
Full opportunity list spanning the fiscal year with quarter-bucket filter and product line breakdown.

### 9. 3x Sufficiency Analysis
Deep-dive into the 3x coverage framework. Shows exactly how each region and seller compares to the minimum pipeline requirement across time horizons.

Key visuals:
- Coverage ratio matrix: region × horizon (CQ / NQ / FY) with threshold color coding
- Sellers below 3x threshold (red zone) with manager ownership
- Sufficiency trend: how coverage has evolved over the past 8 weeks
- Gap-to-3x by region in dollar terms — how much pipeline needs to be added to reach threshold

### 10. Activity Management
Tracks seller activity signals — meetings, calls, opportunities touched — as a leading indicator of future pipeline health and a coaching tool for managers.

Key visuals:
- Activity volume by seller vs. peer average (z-score normalized)
- Activity-to-pipeline correlation: sellers with high activity showing pipeline growth
- Inactive opportunities: no activity logged in 14+ days with owner and value
- Activity trend: is the team's overall activity level increasing or declining?

### 11. Week-over-Week Changes
The "what changed" page. Shows every pipeline movement from prior week to current week — adds, removes, value increases/decreases, stage advances, and close date changes.

Key visuals:
- Change event feed sorted by value impact
- Net pipeline change by region: did regions add or lose net pipeline?
- Stage advancement vs. regression: are deals moving forward or backward?
- Top movers: the 10 largest value changes in either direction

### 12. Funnel Hygiene Score
A composite score measuring pipeline data quality. Identifies stale close dates, missing required fields, unlikely stage-to-close-date combinations, and overdue opportunities that inflate coverage metrics.

Key visuals:
- Hygiene score by region and seller (0–100 composite)
- Score component breakdown: stale dates weight / missing data weight / overdue deals weight
- Worst offenders: sellers with lowest hygiene scores ranked for manager action
- Trend: hygiene improvement or deterioration over 8 weeks (is coaching working?)

### 13. Analysis
Free-form analytical workspace with parameterized charts for ad-hoc pipeline investigation. Full filter panel: seller, product, stage, region, territory, date range, deal size band.

### 14. Current Opportunity
Single-deal deep-dive. Enter an opportunity name or account to see its complete history across all weekly snapshots — every stage change, close date revision, value update, and owner change since the opportunity was created.

### 15. Raw Data — Day by Day
Daily-granularity opportunity extract. Shows the state of each opportunity as of each business day — enables custom time-series analysis, exports for external BI tools, or audit workflows outside the report.

---

## Data Model Highlights

- **~70 tables** — the largest semantic model in the suite
- **Multi-snapshot architecture:** current state, weekly snapshots, and prior-day tables — enabling day-over-day and week-over-week comparisons at any dimension intersection
- **Territory mapping:** full geographic hierarchy from individual opportunity through seller, territory, sub-region, region — including ZIP code-level assignment tables and AOP territory overlays
- **Cockpit manual override:** ops team can adjust pipeline figures for known data gaps without modifying source systems — preserves auditability
- **Q&A with Verified Answers:** natural language query interface trained with confirmed answers for the most common executive pipeline questions
- **Data freshness tracking:** dedicated refresh metadata table surfaces last-updated timestamp directly in the report header
- **Self-documenting model:** embedded `Model Measures` and `Model Tables` documentation tables — the semantic model describes itself
