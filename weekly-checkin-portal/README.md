# Weekly Check-In Portal

> **Stack:** HTML · CSS · Vanilla JS · AWS (EC2 + Secrets Manager) · docx.js
> **Version:** V83.2 | **Format:** Self-contained single-file application (.html)

A fully operational forecast submission and governance portal used by regional sales leaders to input weekly bookings and revenue figures, generate AI-powered narratives, and submit consolidated forecasts for executive review.

The application is entirely self-contained in a single `.html` file — no build step, no dependencies to install, no server required. Opens directly in any modern browser.

---

## How It Works

Each Friday, regional leaders open the portal, enter their bookings (New ARR) and revenue actuals/forecasts by sub-region and quarter, generate an AI summary of their regional narrative with Risks & Opportunities, and submit for global consolidation. The application tracks each region's submission state in real time and locks narratives independently once a quarter closes.

The version number (V83.2) reflects 80+ weekly production release cycles — the tool evolved continuously based on field feedback.

---

## Application Tabs

### 1. Dashboard
The landing page. Shows the current week's submission status across all regions in a single view — which have submitted, which are pending, and which require revision.

Key elements:
- Region status cards (Americas, EMEA, APJ) with live cycle state: `pending` / `submitted` / `approved` / `revision` / `ready`
- Current week number and quarter context banner
- Data-freshness popover showing when underlying CRM/ERP data was last refreshed
- Global consolidation progress indicator

### 2. Submit Bookings (New ARR)
The primary data entry form for weekly bookings. Built dynamically from the region hierarchy — leaders select their region, then enter figures by sub-region, market, and quarter.

Key elements:
- Dynamic grid: sub-region → market → quarter input cells (built at runtime)
- Current quarter (CQ) and next quarter (NQ) columns
- Historical submission log: last 8 weeks of prior entries for reference
- Forecast scenario selector (Base / Upside / Downside)
- Variance highlight: auto-flags cells that deviate >15% from prior week

### 3. Submit Revenue
Equivalent submission form for revenue / collections. Mirrors the bookings form structure with revenue-specific metrics.

Key elements:
- Revenue actuals vs. forecast input grid by sub-region and quarter
- Quarter-to-date pacing indicator vs. quarterly target
- Variance flag for significant deviations vs. prior submission

### 4. Book & Bill Plan
Book-and-Bill planning inputs — short-cycle deals expected to book and bill within the same quarter, important for in-quarter revenue visibility.

Key elements:
- B&B commitment input by market
- Comparison vs. prior week's B&B plan
- Toggle to include/exclude from the consolidated forecast

### 5. Summary & Narratives ✨
AI-powered narrative generation for each region's weekly story. Leaders review the auto-generated summary, edit as needed, and attach structured Risks & Opportunities.

Key elements:
- **✨ Generate** button per region — calls the AI API with structured data context to draft a business narrative
- Risks & Opportunities table: editable rows with severity and owner fields
- Quarter filter: CQ / NQ / FY scope selector
- Compact / normal view toggle for leadership-facing vs. working views
- **Quarter-locked narratives:** CQ and NQ blocks lock independently once the respective quarter closes — preserving the official submitted record

### 6. Final Submission
The approval and global consolidation workflow. Once all regions have submitted, the global ops lead reviews the consolidated picture and triggers the final submission.

Key elements:
- Per-region approval checkboxes with reviewer name capture
- Lock/unlock controls for individual regional submissions
- Consolidated totals: global bookings, revenue, and B&B forecast
- Final submission trigger with confirmation modal
- Immutable submission timestamp and audit trail

### 7. How to Use
Step-by-step user guide for new regional leaders covering the end-to-end submission flow, data interpretation guidance, and common error scenarios with resolution steps.

### 8. RACI
Responsibility matrix defining who owns each step of the weekly forecast cycle — submission, review, approval, consolidation, and distribution to leadership.

### 9. Admin
Administrative controls for ops and IT owners. Manages data refresh schedules, region enablement flags, cycle configuration, and submission window open/close timing.

---

## Technical Highlights

- **Self-contained:** entire application in one `.html` file — zero npm, zero build pipeline, zero external dependencies at runtime
- **AI integration:** narrative generation via structured API call — prompt includes regional data context and prior narratives for continuity
- **Word export:** live `.docx` generation via lazy-loaded `docx.js` — leaders download a formatted Word report directly from the browser with zero server involvement
- **State management:** pure JavaScript state object tracking the full submission lifecycle (per region, per week, per quarter)
- **Secure backend connectivity:** communicates with an AWS EC2 proxy; credentials managed via AWS Secrets Manager — nothing sensitive is embedded in the file
- **Production-versioned:** V83.2 reflects continuous deployment across 80+ weekly cycles with zero downtime migrations (state-compatible updates)
