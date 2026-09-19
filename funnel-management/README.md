# Funnel Management

> **Stack:** Power BI · DAX · TMDL (PBIP format)
> **Pages:** 7 visible · 9 hidden/tooltip | **Semantic model:** ~60 tables

A Power BI report tracking pipeline movement dynamics — specifically how opportunities are being pushed to later quarters (push-outs) or pulled forward (pull-ins), alongside weekly actuals pacing and overdue opportunity governance.

Built in the PBIP (Power BI Project) format for full source-control compatibility — the semantic model is decomposed into TMDL files and the report layout into JSON, both version-controlled in Git.

---

## Report Pages

### 1. Funnel Summary
The main landing page. Executive-level overview of current pipeline health across all regions — total pipeline, push-out and pull-in volume vs. prior week, and actuals-to-date vs. target.

Key visuals:
- Pipeline waterfall by stage
- Push vs. pull balance by region (current week vs. 4-week average)
- Current quarter coverage ratio with color-coded threshold bands
- Top accounts with movement in the current week

### 2. Push & Pull Dynamics
Detailed breakdown of push-out and pull-in behavior — which accounts moved, when, by how much, and which sellers or managers are driving it.

Key visuals:
- Push/pull volume trend (rolling 8 weeks)
- Scatter: deal size vs. push frequency (repeat pushers highlighted)
- Manager-level push rate ranking — accountability signal for coaching conversations
- Movement reason code distribution

### 3. Actuals Weekly Pacing
Tracks bookings actuals against the weekly pacing curve required to hit the quarterly target. Early warning system for quarters falling behind the required run rate.

Key visuals:
- Actuals vs. required pacing curve (line chart with ±10% tolerance bands)
- Days remaining in quarter vs. gap to close
- Weekly booking trend with 4-week moving average
- Region-level pacing scorecard: on track / at risk / behind

### 4. Push-Out Analysis — Current Quarter
Focused view on all opportunities originally forecasted for the current quarter that have since been pushed out. Designed for pipeline recovery conversations.

Key visuals:
- Full list of pushed-out opportunities with account, value, new close date, and seller
- Push-out total value vs. prior week delta
- Time-in-stage for pushed deals (are they getting stuck?)
- Recovery probability scoring based on historical push-out conversion rates

### 5. Pull-In Analysis — Current Quarter
Opportunities originally forecasted for a future quarter that have been accelerated into the current quarter — representing potential upside to the quarterly plan.

Key visuals:
- Pull-in list with original close date vs. revised date
- Pull-in value vs. remaining quota gap (can pull-ins close the gap?)
- Historical pull-in conversion rate (% of pull-ins that actually close in the pulled quarter)

### 6. Overdue Opportunities
All open opportunities with a close date in the past — a pipeline hygiene signal indicating stale records that distort coverage ratios and forecast accuracy.

Key visuals:
- Overdue opportunity list with age in days past due date
- Overdue pipeline value by region and seller
- Trend: overdue pipeline as % of total pipeline (rolling 12 weeks)
- Manager accountability table sorted by overdue value owned

### 7. Raw Data
Full opportunity-level extract for self-service analysis. All fields used in the report, filterable by region, seller, stage, product, and date range. Supports export.

---

## Data Model Highlights

- **~60 tables** — multi-snapshot design enabling point-in-time comparisons at any week
- **Snapshot architecture:** current funnel, weekly snapshots, and prior-day state tables — enabling WoW and DoD delta calculations across any dimension
- **Cross-source integration:** funnel data joined to actuals, weekly targets, bookings, and Book-and-Bill tables across a common account/opportunity key
- **Currency normalization:** multi-currency pipeline converted to USD reporting currency via a dedicated `Currency` table with weekly exchange rates
- **Conversion rate modeling:** dedicated `Conversion Rate` and `WinRate_Mode` tables for probability-weighted pipeline calculations
- **Q&A enabled:** natural language queries supported across the full semantic model
