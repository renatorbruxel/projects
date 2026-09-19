# Sales League

> **Stack:** Power BI · DAX · TMDL (PBIP format) · Row-Level Security
> **Pages:** 14 visible · 10 tooltip pages | **Semantic model:** ~30 tables

A gamified seller performance leaderboard with individual scorecards, manager and regional views, structured recovery planning, and formal commitment workflows. Designed to drive competitive performance, seller accountability, and transparent quota attainment visibility across the entire GTM organization.

Access is controlled by multi-tier Row-Level Security — each seller sees only their own data; managers see their team; regional VPs see their region; global admins see everything. Sellers formally opt in to the gamification program via a consent mechanism built into the model.

---

## Report Pages

### 1. Home — Leaderboard
The main leaderboard. All sellers in the user's accessible scope, ranked by current-quarter attainment with tier badges and position-change indicators vs. prior week.

Key visuals:
- Ranked seller list: attainment %, quota, actuals, pipeline coverage
- Tier distribution: % of sellers in each attainment band (Platinum / Gold / Silver / Bronze)
- Position change indicators ▲▼ vs. prior week ranking
- Days remaining in quarter countdown with urgency color coding

### 2. Seller Scorecard
Individual seller performance profile — the primary self-service view for each quota-carrying seller.

Key visuals:
- Quota vs. actuals attainment gauge (current quarter %)
- Pipeline coverage vs. 3x target
- Win rate trend (rolling 4 quarters)
- Funnel hygiene score
- Peer comparison: seller vs. anonymized regional average (peers not identified by name)
- Top 5 open opportunities with stage and expected close date

### 3. Manager View
Team-level scorecard for front-line sales managers. All direct reports in one table with the key signals needed for weekly 1:1 coaching conversations.

Key visuals:
- Team attainment table: seller / quota / actuals / attainment % / pipeline / hygiene
- Team aggregate row: total quota, total actuals, blended team attainment %
- Risk flags: sellers below 80% attainment with less than 2x pipeline coverage
- Team win rate trend vs. regional benchmark

### 4. Regional Manager View
Rollup for regional VPs. Aggregates across all front-line managers in the region.

Key visuals:
- Manager-level attainment summary with team rollup
- Region vs. peer-region comparison (Americas / EMEA / APJ)
- Rolling 12-week bookings trend by manager
- Headcount view: active sellers vs. open territory capacity

### 5. Seller Details
Extended seller profile with full opportunity-level breakdown for the current and prior periods.

Key visuals:
- All open deals: account, stage, value, close date, product line
- Closed-won history with booking date and deal size
- Lost deals with reason codes and competitive context
- Average deal size trend (is the seller moving upmarket or downmarket?)

### 6. Specialist Seller View
Tailored view for product specialists and overlay sellers who carry a different quota structure than direct account executives. Shows specialist-specific KPIs and coverage against overlay quota targets.

### 7. Charts
Visual analytics hub — charts-first layout for trend and distribution analysis across the seller population.

Key visuals:
- Attainment distribution histogram: how is performance distributed?
- Quota vs. actuals scatter: every seller plotted by quota size and attainment
- Win rate vs. average deal size scatter: are bigger deals harder to close?
- Bookings trend by product line (rolling 8 quarters)

### 8. Declaration Form
Formal commitment interface. Each seller selects open opportunities they are committing to close in the current quarter — creating an accountability record compared against actuals at quarter close.

Key elements:
- Deal selector: choose from open pipeline with close date and stage visible
- Total committed value vs. quota: how confident is the seller?
- Submission lock: declarations freeze at quarter midpoint — no revisions after lock date
- Manager approval step: manager countersigns the declaration before it becomes official

### 9. Plan to Recover — Manager
Structured recovery workflow for managers tracking below quota. Guided process for identifying recovery levers and committing to a recovery path.

Key elements:
- Quota gap in dollar and percentage terms with days-remaining context
- Pull-in candidates: late-stage deals from next quarter that could accelerate into the current quarter
- Committed recovery actions: manager logs specific deals and close strategies
- Recovery confidence score: probability-weighted expected recovery value vs. gap

### 10. Plan to Recover — Region
Same recovery planning framework elevated to the regional level. Regional VPs track each manager's recovery commitments and roll them up to the regional recovery plan.

### 11. Book Lost
Lost deal analysis for coaching and competitive strategy refinement. All closed-lost opportunities with structured reason codes, competitive involvement flags, and deal characteristics.

Key visuals:
- Lost deal list: account, value, loss reason, competitor, seller, deal age at loss
- Win/loss ratio trend (rolling 8 quarters)
- Loss reason breakdown: price / product gap / competition / timing / no decision
- Competitive displacement analysis: which competitors are winning and in which segments?

### 12. Access Denied
Displayed when a user's RLS role does not grant access to the requested view (e.g., a seller trying to navigate to another seller's scorecard). Provides a contact link for access requests and explains the data access model.

### 13. Seller Info
Roster management page for ops admins. Shows seller metadata, region assignment, quota type, manager mapping, and active/inactive status. Used to validate the headcount file and flag roster discrepancies.

### 14. Seller with No Opportunities
Zero-coverage alert. Identifies every quota-carrying seller who has no open pipeline — the highest-priority coaching signal. Sorted by quota size (highest-quota, zero-pipeline sellers first).

---

## Data Model & Security Highlights

- **Multi-tier Row-Level Security:** seller / front-line manager / regional VP / global admin roles — implemented via username-based role mapping with dynamic DAX USERPRINCIPALNAME() filters
- **RLS bypass tables:** `(No RLS)` variants of gamification and peer tables provide global views for admin roles and enable anonymized peer comparisons without exposing individual identities
- **Active Player Consent:** sellers formally opt in via a consent table — gamification data for non-consenting sellers is excluded from the leaderboard, respecting data privacy governance
- **Declaration-to-actuals closed loop:** commitment records linked to closed deals at quarter end — enables commitment accuracy scoring and coaching on forecast reliability
- **Gamification engine:** points and badge assignments driven by attainment thresholds, win rate, funnel hygiene score, and activity signals — configurable without DAX changes
- **Quota model flexibility:** handles direct sellers, product specialists, and overlay roles with different quota structures, time phasing, and commission multipliers
- **10 custom tooltip pages:** inline deep-dives on hover for bookings, win rate, funnel hygiene, forecast, and quarterly breakdowns — no page navigation required for the most common drill-down questions
