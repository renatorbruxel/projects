# Net New Tracker

> **Stack:** Power BI · DAX · TMDL (PBIP format)
> **Pages:** 3 visible | **Semantic model:** ~23 tables

A focused Power BI report that classifies pipeline and closed deals as "Net New" — new logos or incremental revenue from accounts with no prior relationship — and validates those classifications for incentive compensation accuracy.

Net New deals carry higher commission rates and additional quota credit in the GTM compensation model. This report ensures classification integrity, surfaces misclassified opportunities before payout, and supports incentive compensation audit workflows.

---

## Report Pages

### 1. Net New Overview
Executive summary of Net New pipeline and bookings — total volume, percentage of total bookings, regional split, and trend vs. prior quarters.

Key visuals:
- Net New bookings as % of total bookings (trend, rolling 4 quarters)
- Net New pipeline coverage vs. Net New quota target
- Regional breakdown: Americas / EMEA / APJ with sub-region drill-through
- Top Net New deals in the current quarter (account, value, seller, stage)
- Quarter-over-quarter comparison: is the Net New mix improving?

### 2. Net New Details
Opportunity-level drill-through for all Net New classified deals — including account history, classification source, and validation status.

Key visuals:
- Full Net New opportunity list with classification flag and confidence score
- Account prior-history check: has this account transacted in the last 3 years?
- Classification source breakdown: system-generated / seller-declared / manager override
- Disputed classifications pending review: deals flagged for manual validation
- Incentive impact: estimated commission delta vs. standard deal rate

### 3. Classification Rules
Documents and visualizes the business rules engine that determines Net New eligibility — the decision logic applied to every opportunity at point of creation.

Key visuals:
- Classification logic flowchart (new logo / reactivation / expansion / migration paths)
- Rule coverage: % of pipeline classified by each rule branch
- Edge-case handling: partial expansions, dormant account reactivations, product migrations
- Audit log: history of rule changes with effective dates and approver sign-off
- Rule exception rate trend: % of deals requiring manual override (quality signal)

---

## Data Model Highlights

- **Incentive compensation tables:** raw incentive data and unclassified records maintained separately — enabling before/after classification comparison and rollback capability
- **Account history validation:** opportunity ownership and account tables joined to historical closed revenue — determines whether an account qualifies as a true new logo based on configurable lookback windows
- **Business level hierarchy:** consistent rollup from opportunity → seller → region → global across all classification states
- **LATAM exception handling:** dedicated table for deals processed outside the core CRM system — ensures no Net New deals fall through classification coverage
- **Measures isolation:** all DAX measures in a dedicated measures table, separated from fact and dimension tables for maintainability
