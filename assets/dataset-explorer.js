(function () {
  'use strict';
  const api = window.PortfolioCRM;
  const get = id => document.getElementById(id);
  const number = n => new Intl.NumberFormat('en-US').format(n);
  const money = n => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
  const rate = n => n === null ? 'N/A' : (100*n).toFixed(1)+'%';
  let view = 'records', page = 0, shown = [];
  const size = 30;
  function row(parent, values, tag) {
    const tr = document.createElement('tr');
    for (const value of values) {
      const cell = document.createElement(tag);
      cell.textContent = value === null || value === undefined ? 'Unknown' : String(value);
      if (tag === 'th') cell.scope = 'col';
      tr.appendChild(cell);
    }
    parent.appendChild(tr);
  }
  function render() {
    const rows = api.filter({region:get('data-region').value,quarter:get('data-quarter').value,
      stage:get('data-stage').value,search:get('data-search').value.trim()});
    const sum = api.summarize(rows);
    get('metric-rows').textContent = number(sum.opportunities);
    get('metric-value').textContent = money(sum.wonValue);
    get('metric-win').textContent = rate(sum.closedWinRate);
    get('metric-open').textContent = number(sum.open);
    let headers, values;
    if (view === 'weekly') {
      shown = api.weekly(rows);
      headers = ['Week starting','Closed deals','Won','Lost','Won deal value','Closed win rate'];
      values = r => [r.close_week_start,r.opportunities,r.won,r.lost,money(r.wonValue),rate(r.closedWinRate)];
    } else if (view === 'sellers') {
      shown = api.sellers(rows);
      headers = ['Seller','Manager','Region','Opportunities','Won deal value','Closed win rate'];
      values = r => [r.sales_agent,r.manager,r.regional_office,r.opportunities,money(r.wonValue),rate(r.closedWinRate)];
    } else {
      shown = rows;
      headers = ['Opportunity','Account','Seller','Region','Product','Stage','Close date','Close value','Purchase observed'];
      values = r => [r.opportunity_id,r.account,r.sales_agent,r.regional_office,r.product,r.deal_stage,r.close_date,
        r.close_value === null ? 'Unknown' : money(r.close_value),r.purchase_type_observed || 'Not applicable'];
    }
    page = Math.min(page, Math.max(0, Math.ceil(shown.length / size)-1));
    const head = get('data-table').tHead, body = get('data-table').tBodies[0];
    head.replaceChildren(); body.replaceChildren(); row(head,headers,'th');
    for (const item of shown.slice(page*size,(page+1)*size)) row(body,values(item),'td');
    if (!shown.length) {
      const tr=document.createElement('tr'), cell=document.createElement('td');
      cell.colSpan=headers.length;cell.textContent='No records match this selection.';tr.appendChild(cell);body.appendChild(tr);
    }
    get('data-count').textContent = shown.length ? `${number(page*size+1)}–${number(Math.min((page+1)*size,shown.length))} of ${number(shown.length)} rows` : '0 rows';
    get('data-prev').disabled = page === 0;
    get('data-next').disabled = (page+1)*size >= shown.length;
  }
  function setView(button) {
    view=button.dataset.view;page=0;
    document.querySelectorAll('[data-view]').forEach(b=>{const selected=b===button;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
    get('dataset-panel').setAttribute('aria-labelledby',button.id);render();
  }
  ['data-region','data-quarter','data-stage','data-search'].forEach(id=>get(id).addEventListener(id==='data-search'?'input':'change',()=>{page=0;render();}));
  get('data-reset').addEventListener('click',()=>{['data-region','data-quarter','data-stage','data-search'].forEach(id=>get(id).value='');page=0;render();});
  get('data-prev').addEventListener('click',()=>{page--;render();});
  get('data-next').addEventListener('click',()=>{page++;render();});
  const tabs=[...document.querySelectorAll('[data-view]')];
  tabs.forEach((button,index)=>{button.addEventListener('click',()=>setView(button));button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();tabs[next].focus();setView(tabs[next]);}});});
  for (const item of api.data.compatibility) row(get('data-fit'),[item.project,item.direct,item.missing],'td');
  render();
})();
