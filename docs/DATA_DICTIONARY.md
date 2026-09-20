# Planning data dictionary

All amounts are USD in the synthetic scenario; rates are decimals. Empty CSV fields represent unavailable values. The generator preserves a deterministic scenario identity and labels public source dimensions separately.

| Table | Key / grain | Main fields and meaning |
|---|---|---|
| sellers | id | Synthetic display name, source dimension reference, role, hire/exit dates, loaded monthly cost |
| roster | seller_id × valid_from | Region and manager attribution valid through valid_to; quota-bearing and employment flags |
| accounts | id | Synthetic name, segment, source reference, parent grouping and complete-history indicator |
| snapshots | opportunity_id × snapshot_date | State known on that date; expected close is a plan, close_date is observed in the simulated timeline; amount can be null |
| quotas | seller_id × month | Calendar-month target and productive ramp-adjusted FTE |
| revenue | id | Won contract allocated to recognition dates; short_cycle rows are a subset of revenue |
| activities | id | Synthetic activity date, type, recorded minutes and next-step documentation flag |
| forecast_calls | id | Frozen issuance, target month, 28-day horizon, prior-data rate, baseline and subsequently observed synthetic actual |
| subscriptions | customer_id × month | Opening/new/expansion/contraction/churn/closing MRR; cohort is first acquisition month |
| costs | month × region × channel | Synthetic acquisition spend; independent of hardware CRM bookings |
| merchants | id | Signup, first successful payment and separate segment / region |
| payments | id | One simulated attempt per payment; amount, status and independent platform fee |

`scenario.json` also contains the event history, scenario assumptions and illustrative decision register. Generated facts stop at the declared as-of, except future recognition schedules and planning quotas, which are explicitly prospective. Monthly recurring views use completed months only. The exact CSV headers are authoritative for machine use.
