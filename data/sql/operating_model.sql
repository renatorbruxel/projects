-- SQLite 3. All facts in these views are from the independent synthetic scenario.
-- Composite keys, explicit dates and denominator rules are intentional.
CREATE VIEW seller_performance AS
WITH facts AS (
 SELECT x.seller_id, SUM(CASE WHEN x.stage='Won' AND x.close_date>='2026-07-01' THEN x.amount ELSE 0 END) AS actual,
 SUM(CASE WHEN x.stage NOT IN ('Won','Lost') AND x.expected_close BETWEEN '2026-07-01' AND '2026-09-30' THEN x.amount ELSE 0 END) AS open_pipeline
 FROM snapshots x JOIN roster r ON x.seller_id=r.seller_id AND x.snapshot_date BETWEEN r.valid_from AND r.valid_to
 WHERE x.snapshot_date='2026-09-18' GROUP BY x.seller_id
), plan AS (SELECT seller_id,SUM(amount) AS target FROM quotas WHERE quarter='2026-Q3' GROUP BY seller_id)
SELECT s.id,s.name,r.region,r.manager,COALESCE(f.actual,0) AS actual, p.target,
COALESCE(f.actual,0)/NULLIF(p.target,0) AS attainment, f.open_pipeline,
f.open_pipeline/NULLIF(MAX(p.target-COALESCE(f.actual,0),0),0) AS gap_coverage,
DENSE_RANK() OVER(PARTITION BY r.region ORDER BY COALESCE(f.actual,0)/NULLIF(p.target,0) DESC) AS recognition_rank
FROM sellers s JOIN roster r ON s.id=r.seller_id AND '2026-09-18' BETWEEN r.valid_from AND r.valid_to
LEFT JOIN facts f ON s.id=f.seller_id LEFT JOIN plan p ON s.id=p.seller_id;

CREATE VIEW movement_bridge AS
WITH prior AS (SELECT *,CASE WHEN stage NOT IN ('Won','Lost') AND expected_close BETWEEN '2026-07-01' AND '2026-09-30' THEN COALESCE(amount,0) ELSE 0 END AS balance FROM snapshots WHERE snapshot_date='2026-09-11'),
current AS (SELECT *,CASE WHEN stage NOT IN ('Won','Lost') AND expected_close BETWEEN '2026-07-01' AND '2026-09-30' THEN COALESCE(amount,0) ELSE 0 END AS balance FROM snapshots WHERE snapshot_date='2026-09-18'),
ids AS (SELECT opportunity_id FROM prior UNION SELECT opportunity_id FROM current)
SELECT ids.opportunity_id,p.stage AS previous_stage,c.stage AS current_stage,p.expected_close AS previous_close,c.expected_close AS current_close,
COALESCE(p.balance,0) AS opening,COALESCE(c.balance,0) AS closing,COALESCE(c.balance,0)-COALESCE(p.balance,0) AS delta,
CASE WHEN p.opportunity_id IS NULL THEN 'Created' WHEN c.stage='Won' AND p.stage!='Won' THEN 'Won'
 WHEN c.stage='Lost' AND p.stage!='Lost' THEN 'Lost' WHEN p.balance>0 AND c.balance=0 THEN 'Out of window'
 WHEN p.balance=0 AND c.balance>0 THEN 'Into window' WHEN COALESCE(c.amount,0)!=COALESCE(p.amount,0) THEN 'Value change' ELSE 'Unchanged' END AS movement
FROM ids LEFT JOIN prior p USING(opportunity_id) LEFT JOIN current c USING(opportunity_id);

CREATE VIEW purchase_classification AS
WITH purchases AS (
 SELECT x.*,a.history_complete,a.parent_id,
 MIN(x.close_date) OVER(PARTITION BY x.account_id) AS first_observed_purchase,
 COUNT(*) OVER(PARTITION BY x.account_id,x.close_date) AS same_day_purchases
 FROM snapshots x LEFT JOIN accounts a ON x.account_id=a.id WHERE snapshot_date='2026-09-18' AND stage='Won'
)
SELECT opportunity_id,account_id,close_date,first_observed_purchase,history_complete,same_day_purchases,parent_id,
 CASE WHEN account_id IS NULL OR history_complete=0 OR parent_id IS NOT NULL THEN 'Unknown'
 WHEN close_date=first_observed_purchase THEN 'New in scenario' ELSE 'Expansion in scenario' END AS classification
FROM purchases;

CREATE VIEW forecast_quality AS
SELECT region,COUNT(*) AS n,horizon_days,AVG(forecast-actual) AS bias,AVG(ABS(forecast-actual)) AS mae,
SUM(ABS(forecast-actual))/NULLIF(SUM(ABS(actual)),0) AS wape,
AVG(CASE WHEN actual!=0 THEN ABS((forecast-actual)/actual) END) AS mape,
SUM(CASE WHEN actual=0 THEN 1 ELSE 0 END) AS zero_actual_excluded_from_mape,
SUM(ABS(baseline-actual))/NULLIF(SUM(ABS(actual)),0) AS baseline_wape
FROM forecast_calls WHERE target_end<='2026-09-18' GROUP BY region,horizon_days;

CREATE VIEW recurring_bridge AS
SELECT month,region,SUM(opening_mrr)*12 AS opening_arr,SUM(new_mrr)*12 AS new_arr,SUM(expansion_mrr)*12 AS expansion_arr,
SUM(contraction_mrr)*12 AS contraction_arr,SUM(churn_mrr)*12 AS churn_arr,SUM(closing_mrr)*12 AS closing_arr,
SUM(CASE WHEN opening_mrr>0 THEN closing_mrr ELSE 0 END)/NULLIF(SUM(opening_mrr),0) AS nrr,
(SUM(opening_mrr)-SUM(contraction_mrr)-SUM(churn_mrr))/NULLIF(SUM(opening_mrr),0) AS grr
FROM subscriptions WHERE month<='2026-08' GROUP BY month,region;

CREATE VIEW cohort_retention AS
WITH first AS (SELECT customer_id,MIN(month) AS cohort,MAX(CASE WHEN new_mrr>0 THEN new_mrr ELSE 0 END) AS initial_mrr FROM subscriptions GROUP BY customer_id)
SELECT f.cohort,s.month,COUNT(*) AS original_customers,SUM(CASE WHEN s.closing_mrr>0 THEN 1 ELSE 0 END) AS retained_customers,
SUM(CASE WHEN s.closing_mrr>0 THEN 1.0 ELSE 0 END)/COUNT(*) AS logo_retention,
SUM(s.closing_mrr)/NULLIF(SUM(f.initial_mrr),0) AS value_retention
FROM first f JOIN subscriptions s USING(customer_id) WHERE s.month<='2026-08' GROUP BY f.cohort,s.month;

CREATE VIEW quality_exceptions AS
SELECT opportunity_id,seller_id,snapshot_date,'Missing amount' AS rule,amount AS exposure FROM snapshots WHERE snapshot_date='2026-09-18' AND amount IS NULL
UNION ALL SELECT opportunity_id,seller_id,snapshot_date,'Missing account',amount FROM snapshots WHERE snapshot_date='2026-09-18' AND account_id IS NULL
UNION ALL SELECT opportunity_id,seller_id,snapshot_date,'Missing expected close',amount FROM snapshots WHERE snapshot_date='2026-09-18' AND expected_close IS NULL;
