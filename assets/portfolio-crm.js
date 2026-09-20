/* Shared read-only adapter for every portfolio HTML. Source: data/crm/source.json. */
(function (root) {
  'use strict';
  const data = root.PORTFOLIO_CRM_DATA;
  if (!data) throw new Error('Load crm-data.js before portfolio-crm.js.');
  function filter(options = {}) {
    return data.opportunities.filter(row =>
      (!options.region || row.regional_office === options.region) &&
      (!options.stage || row.deal_stage === options.stage) &&
      (!options.quarter || row.close_quarter === options.quarter) &&
      (!options.seller || row.seller_id === options.seller) &&
      (!options.search || [row.opportunity_id, row.account, row.sales_agent, row.product]
        .join(' ').toLowerCase().includes(options.search.toLowerCase())));
  }
  function summarize(rows = data.opportunities) {
    const won = rows.filter(row => row.deal_stage === 'Won');
    const lost = rows.filter(row => row.deal_stage === 'Lost');
    return {opportunities: rows.length, won: won.length, lost: lost.length,
      open: rows.length - won.length - lost.length,
      wonValue: won.reduce((sum, row) => sum + row.close_value, 0),
      closedWinRate: won.length + lost.length ? won.length / (won.length + lost.length) : null,
      firstObserved: won.filter(row => row.purchase_type_observed === 'First observed purchase').length,
      repeatObserved: won.filter(row => row.purchase_type_observed === 'Repeat observed purchase').length};
  }
  function grouped(rows, key) {
    const groups = new Map();
    for (const row of rows) {
      if (!row[key]) continue;
      if (!groups.has(row[key])) groups.set(row[key], []);
      groups.get(row[key]).push(row);
    }
    return [...groups].map(([value, members]) => ({[key]: value, ...summarize(members)}));
  }
  function weekly(rows = data.opportunities) {
    return grouped(rows, 'close_week_start').sort((a, b) => a.close_week_start.localeCompare(b.close_week_start));
  }
  function sellers(rows = data.opportunities) {
    return grouped(rows, 'seller_id').map(item => ({...data.sales_teams.find(s => s.seller_id === item.seller_id), ...item}))
      .sort((a, b) => b.wonValue - a.wonValue || a.seller_id.localeCompare(b.seller_id));
  }
  root.PortfolioCRM = Object.freeze({data, filter, summarize, weekly, sellers});
})(typeof window === 'undefined' ? globalThis : window);
