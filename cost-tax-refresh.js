(()=>{
const fixed={taxUsd:7.2,taxDuty:8,taxNlvg:10,taxCoupon:0,taxBuyerShip:0};
const $=id=>document.getElementById(id),N=id=>id==='taxFx'?costs[$('site').value].fx:Object.hasOwn(fixed,id)?fixed[id]:FBSCostTax.numeric($(id)?.value),M=v=>Array.isArray(v)?(v[0]===v[1]?'¥'+v[0].toFixed(2):'¥'+v[0].toFixed(2)+'–¥'+v[1].toFixed(2)):v===null?'待确认':'¥'+v.toFixed(2),pc=n=>(n*100).toFixed(2)+'%',E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const form=document.querySelector('#cost .form'), result=$('freeTrialPart');
const sections=[...form.querySelectorAll(':scope>.form-section')];
sections[0].querySelector('h3').textContent='站点与店铺类型';
const optional=document.createElement('details');optional.className='tax-optional';optional.innerHTML='<summary>选填 · 查询店铺 Free Trial 资格</summary><p class="muted">不填也可试算。试算不代表免费期已开通。</p>';
for(const id of ['shop','username']){const el=$(id)?.closest('.field');if(el)optional.append(el)}
for(const sel of ['.shop-query-compact','#shopLookup']){const el=form.querySelector(sel);if(el)optional.append(el)}
const hint=[...sections[0].querySelectorAll('p')].find(x=>x.textContent.includes('填写任意一项'));if(hint)optional.append(hint);
sections[1].querySelector('h3').textContent='01 · 先填产品信息';
sections[2].querySelector('h3').textContent='售价与销量假设';
$('price').parentNode.firstChild.textContent='商品折后价 RMB（券前）';$('price').value='72';
sections[0].querySelector('h3').textContent='02 · 站点与店铺信息';
sections[1].querySelector('.field-grid').append(...sections[2].querySelector('.field-grid').children);
sections[2].remove();
form.prepend(sections[1],sections[0]);sections[0].append(optional);optional.open=true;
const intro=document.createElement('p');intro.className='tax-banner';intro.textContent='不填店铺也能试算；输入店铺信息可进一步核验 Free Trial 资格。';form.prepend(intro);
const tableSource='<a target="_blank" rel="noopener" href="https://shopee.cn/edu/article/25770">卖家大学 · 佣金说明</a>';
// Channel order throughout: FBS, 3PF, SLS. Rates are the user's comparison table (2026-09-24).
const costs={
 MY:{fx:1.62,commission:{mall:[.1512,.1836,.1836],normal:[.1512,.1836,.1836]}},
 SG:{fx:5.33,commission:{mall:[.11,.16,.16],normal:[.11,.16,.16]}},
 TH:{fx:.21,commission:{mall:[.2033,.2461,.2461],normal:[.1819,.2247,.2247]}},
 PH:{fx:.124,commission:{mall:[.06,.09,.12],normal:[.075,.105,.12]}}
};
$('site').value='MY';
const dimensionHint=document.createElement('p');dimensionHint.className='muted';dimensionHint.textContent='尺寸请用包装后厘米（cm），重量用克（g）；本次按 1 单 1 件、实际重量预估操作费分档，仓库按实重与体积重较大值复核。';sections[1].append(dimensionHint);

let last=null;
function render(){
 last=true;
 const s=$('site').value,fx=costs[s].fx,p=N('price'),u=N('units');
 const v=FBSCostAudit.derive({site:s,l:N('l'),w:N('w'),h:N('h'),weight:N('weight'),price:p,units:u,op3pf:N('op3pf')});
 if(!v){result.innerHTML='<h3>请补齐有效的产品信息</h3><p>尺寸、重量和售价须大于 0，月销量须为正整数，3PF 操作费不能为负数。</p>';return}
 const arr=costs[s].commission[$('store').value],op=v.op;
 const rows=[
  {name:'销售佣金',values:arr.map(r=>p*r),formulas:arr.map(r=>`${M(p)} × ${pc(r)}`)},
  {name:'头程 / SLS 跨境物流',values:[v.freight,v.pfFreight,v.sFreight],formulas:[
   `${v.volume.toFixed(6)} m³ × ${v.r.fbs} RMB/m³`,
   `${v.volume.toFixed(6)} m³ × ${v.r.fbs} RMB/m³ × 85%`,
   `(${v.r.base} + max(0, 向上取整((${N('weight')}g − ${v.r.threshold}g) ÷ 10g)) × ${v.r.add}) × ${fx}`]},
  {name:'操作费 · Free Trial 情景',values:[v.eligible?0:op,N('op3pf'),0],formulas:[
   v.eligible?`标准操作费 ${M(op)} − 免费期减免 ${M(op)} = ¥0.00`:`${v.localOp} 当地币 × ${fx}；超出 XS–M，计标准操作费`,
   `${M(N('op3pf'))}/件（输入值）`,'无仓内操作费单列']}
 ];
 const totals=[0,1,2].map(i=>rows.reduce((sum,row)=>sum+row.values[i],0));
 const diffText=n=>Math.abs(n)<1e-9?'相同':(n>0?'少付 ':'多付 ')+M(Math.abs(n));
 const savings=[2,1].map(i=>{
  const delta=totals[i]-totals[0],more=delta < -1e-9;
  const drivers=rows.filter(row=>row.values[0]>row.values[i]+1e-9).map(row=>row.name);
  return `<article class="${more?'more':'less'}"><span>相较 ${i===2?'SLS 跨境直邮':'3PF 三方仓'}</span><b>每件${diffText(delta)}</b><b>${u} 件/月${diffText(delta*u)}</b>${more?`<p>本情景增加费用的项目：${drivers.join('、')}。详见下表。</p>`:''}</article>`;
 }).join('');
 const rowsHtml=rows.map(row=>`<tr><th>${row.name}</th>${row.values.map((n,i)=>`<td><b>${M(n)}</b><small>${row.formulas[i]}</small></td>`).join('')}</tr>`).join('');
 result.innerHTML=`<span class="section-no">03 · FREE TRIAL 情景测算</span><h3>同一件商品，比较三项费用</h3>
 <p class="muted">${E(s)} · ${$('store').value==='mall'?'商城店铺':'普通店铺'} · 商品价 ${M(p)} · ${v.code} · ${u} 件/月。${v.eligible?'假设 Free Trial 有效，FBS 操作费为 0':'超出 XS–M，计 FBS 标准操作费'}。</p>
 <div class="tax-bars">${totals.map((t,i)=>`<div><strong>${['FBS 官方仓','3PF 三方仓','SLS 跨境直邮'][i]}</strong><span class="tax-bar-track"><i style="width:${t/Math.max(...totals)*100}%;background:${i===0?'#ee4d2d':'#aaa397'}"></i></span><b>${M(t)}</b></div>`).join('')}</div>
 <p class="muted">仅比较佣金、头程／SLS 跨境物流、操作费；3PF 头程按官方头程价卡的 85% 估算。不含其他服务费、税费、仓储等，不代表全部成本或利润。</p>
 <div class="tax-dual">${savings}</div>
 <h3>每一笔怎么算？</h3><p class="muted">金额统一为人民币；按 1 单 1 件测算。佣金按本页参考比例计算，不重复加税。</p>
 <div class="tax-table-wrap"><table class="tax-table"><thead><tr><th>每件费用</th><th>FBS 官方仓</th><th>3PF 三方仓</th><th>SLS 跨境直邮</th></tr></thead><tbody>${rowsHtml}<tr class="tax-total"><th>三项费用合计</th>${totals.map(n=>'<td>'+M(n)+'</td>').join('')}</tr></tbody></table></div>
 <details class="tax-optional" open><summary>每件差额来自哪里？</summary><div class="tax-table-wrap"><table class="tax-table"><thead><tr><th>费用项目</th><th>相较 SLS</th><th>相较 3PF</th></tr></thead><tbody>${rows.map(row=>`<tr><th>${row.name}</th>${[2,1].map(i=>`<td>${diffText(row.values[i]-row.values[0])}</td>`).join('')}</tr>`).join('')}<tr class="tax-total"><th>每件合计差额</th>${[2,1].map(i=>`<td>${diffText(totals[i]-totals[0])}</td>`).join('')}</tr></tbody></table></div></details>
 <p class="tax-banner">Free Trial 单独贡献：${v.eligible?`免操作费每件少付 ${M(op)}，按 ${u} 件约 ${M(op*u)}/月。`:'当前分档不计免操作费。'}佣金和物流价差单独计算，不重复归为免费试用优惠。</p>
 <p class="muted">测算口径更新：2026-09-24。物流使用本站参考价卡与固定汇率，SLS 仅计卖家承担的跨境物流藏价；实际发运报价以渠道、货物类型和账单为准。Free Trial 为假设情景，店铺资格及免费期需核验。${tableSource} · <a target="_blank" rel="noopener" href="https://shopee.cn/edu/article/20761">官方仓收费说明</a> · <a target="_blank" rel="noopener" href="https://shopee.cn/edu/article/5091">SLS 物流说明</a></p>
 <details class="tax-optional tax-price-appendix"><summary>04 · 买家看到的价格，为什么不一样？</summary><div class="tax-banner"><strong>同样的耳机、相同基础价，本地履约的展示价可能更有优势。</strong><br>以下仅说明买家前端税费展示，不计入上方三项费用比较。FBS 与 3PF 均属本地履约，进口清关等成本仍需承担。</div>${demoCards()}</details>`;
 if(typeof shopState!=='undefined'&&shopState.matched){const box=document.createElement('p');box.className='tax-banner';const inbound=shopState.firstInboundAfterTrial||'',dates=window.FBSTrialDates?.estimate(shopState.site,inbound,shopState.activationDate||shopState.whitelistDate),name=E(shopState.username||shopState.shopId);let detail;if(!inbound)detail='暂无入仓记录；建议于 2026 年 12 月 31 日前完成入仓。';else{const end=dates?.end?(dates.endLatest&&dates.endLatest!==dates.end?dates.end+' 至 '+dates.endLatest:dates.end):'待核验';detail='首次入仓：'+E(inbound)+' · 预计免操作费到期：'+E(end)+'。'+(dates?.kind==='assumed-week'?'PH 暂按入仓当周开白预估，实际到期日以开白日期为准。':'预计日期按本站规则计算，以实际开通记录为准。')}box.innerHTML='<b>'+name+' · 有 Free Trial 名单资格</b><br>'+detail;result.prepend(box)}
}
const headphones='<img class="jeep-demo" src="assets/jeep-earphones.png" alt="Jeep 耳机用户提供的示意图"><small class="demo-image-caption">图片仅作演示，价格及履约标签以本卡测算为准</small>';
function demoCards(){const usd=N('taxUsd')||7.2,base=10*usd;return ['MY','TH'].map(site=>{const fx=site===$('site').value?N('taxFx'):costs[site].fx,p=base/fx,t=site==='MY'?FBSCostTax.myTax(p,N('taxNlvg')===null?null:N('taxNlvg')/100):FBSCostTax.thTax(p,N('taxDuty')===null?null:N('taxDuty')/100),prefix=site==='MY'?'RM ':'฿';return `<div class="tax-market"><h4>${site==='MY'?'马来西亚 MY':'泰国 TH'} · 约 US$10 耳机</h4><p class="muted">演示基础价 ${M(base)}；1 当地币 = ¥${fx}（假设）。仅对比自动税费加价，未模拟优惠券、运费及卖家调价。</p><div class="tax-banner"><b>本地履约示意价少 ${prefix}${(t.front-p).toFixed(2)} · 比 SLS 展示价低 ${((t.front-p)/t.front*100).toFixed(1)}%</b></div><div class="tax-product-grid">${['SLS','FBS','3PF'].map(ch=>`<article class="tax-product"><h5 class="tax-channel">${ch==='SLS'?'SLS 跨境直邮':ch==='FBS'?'FBS 官方仓':'3PF 三方仓'}</h5>${headphones}<div><span class="tax-pill">${ch==='FBS'?'Fulfilled by Shopee · 假设符合标签规则':ch==='3PF'?'本地三方仓 · 不等于官方仓标签':'跨境直邮'}</span><p>Jeep 耳机 · 价格示意</p><b>${ch==='SLS'&&t.front===null?'税率待确认':prefix+(ch==='SLS'?t.front:p).toFixed(2)}</b><small>${ch==='SLS'?(site==='MY'?(p<=500?'含 10% LVG':'高价值税由月度账单收取'):'商品价 × (1＋类目进口税) × 1.07'):'不按该跨境规则自动加价；进口成本另核'}</small></div></article>`).join('')}</div><p class="muted">${site==='TH'?'TH 的 7% 为 VAT，不能代替类目进口税。示例按进口税 8% 测算，具体以商品实际计税为准。':''} <a target="_blank" href="https://shopee.cn/edu/article/${site==='MY'?'19812':'26731'}">官方规则</a></p></div>`}).join('')}
window.addEventListener('cost-preview-update',render);
form.addEventListener('input',()=>{if(last)setTimeout(()=>render(),5)});
form.addEventListener('change',()=>{if(last)setTimeout(()=>render(),5)});
document.querySelector('#cost>.notice').textContent='本页仅比较佣金、头程／SLS 跨境物流和操作费。3PF 头程＝同体积官方头程 × 85%；买家税费展示单独放在附录，不计入差额。';
const ap=$('appendix');if(ap){ap.querySelector('h2').textContent='附录 · 缩写、VSKU 与 FBS 标签';ap.querySelector('.ap-nav').remove();const wrap=document.createElement('details');wrap.className='tax-optional';wrap.innerHTML='<summary><b>VSKU · 库存共享与组合销售图解</b></summary><p><a class="official-first" href="https://shopee.cn/edu/article/21786" target="_blank" rel="noopener">先看卖家大学：VSKU 映射功能 ↗</a></p><p class="tax-banner"><strong>目前仅支持同个主体不同店铺之间的共用库存。</strong></p>';ap.append(wrap);for(const id of ['ap-share','ap-vsku','ap-how'])if($(id))wrap.append($(id));const tags=document.createElement('details');tags.className='tax-optional';tags.innerHTML=`<summary><b>FBS 商品标签 · 怎样获得 Fulfilled by Shopee？</b></summary><p><a class="official-first" href="https://shopee.cn/edu/article/27359" target="_blank" rel="noopener">先看卖家大学：FBS 商品标签规则 ↗</a></p><p>从 2026 年 5 月 4 日起，系统自动判断，卖家无需申请。<b>有库存＋有销售覆盖</b>，两项一起看。</p><div class="tax-dual"><article><h3>① 至少一个规格有官方仓可售库存</h3><p>库存实时更新；没有官方仓可售库存会移除标签。</p></article><article><h3>② 有货规格覆盖足够多的商品订单</h3><p>MY / SG / PH ≥80% · TH ≥60%。每周日当地时间 02:00 更新。</p></article></div><h4>一个耳机商品，3 个规格</h4><div class="tax-table-wrap"><table class="tax-table"><tr><th>规格</th><th>近30天全渠道日均订单（示例）</th><th>FBS 可售库存</th></tr><tr><td>黑色</td><td>12</td><td>有</td></tr><tr><td>白色</td><td>8</td><td>有</td></tr><tr><td>蓝色</td><td>5</td><td>无</td></tr></table></div><div class="tax-banner"><b>覆盖率＝(12＋8) ÷ (12＋8＋5)＝80%</b><br>达到上述四站覆盖门槛。分子是“有 FBS 库存的规格”的全渠道订单；<b>不是 FBS 订单占比 Pene%</b>。</div><p>近30天该商品完全无订单：有 FBS 可售库存即可按规则获得标签；出现订单后再检查覆盖率。补货断货及周度销售变化可能使标签变动。</p><p>符合条件可获得 FBS 专属券和会场曝光机会；不是固定现金补贴，也不代表每单必定享券。失去标签不等于退出 FBS 筛选。</p><a target="_blank" href="https://shopee.cn/edu/article/27359">卖家大学 · FBS 商品标签规则（2026-04-27）</a>`;ap.append(tags);ap.querySelectorAll('details').forEach(d=>d.open=false)}
const css=document.createElement('style');css.textContent=`#cost .cost-layout>*{min-width:0;max-width:100%}#cost .results,#freeTrialPart{min-width:0;max-width:100%}.tax-table-wrap{max-width:100%}.jeep-demo{display:block;width:100%;aspect-ratio:1;object-fit:cover}.demo-image-caption{padding:5px 10px;font-size:10px!important}.official-first{font-weight:bold;color:#c74225}.tax-price-appendix>summary{font-size:17px}.tax-banner{background:#fff3eb;border-left:3px solid #ee4d2d;padding:12px;font-size:12px}.tax-optional{padding:15px;border:1px solid #e2d7ce;border-radius:12px;background:#fff;margin:14px 0}.tax-optional summary{cursor:pointer;font-weight:700;color:#a94026}.tax-optional .field{margin-top:10px}.tax-dual{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:15px 0}.tax-dual article{background:#f0f6ef;padding:16px;border-radius:12px}.tax-dual article>b{display:block;font-size:22px;color:#2c743d;margin:9px 0}.tax-dual p{font-size:12px}.tax-bars>div{display:grid;grid-template-columns:95px minmax(0,1fr) 115px;align-items:center;gap:10px;margin:14px 0;font-size:12px}.tax-bar-track{display:block;background:#eeeae5;border-radius:4px;overflow:hidden}.tax-dual .more{background:#fff1ea}.tax-dual .more>b{color:#b34127}.tax-dual .uncertain{background:#fff8e8}.tax-dual .uncertain>b{color:#91600e}.tax-bars strong{min-width:90px}.tax-bars i{height:22px;border-radius:4px;display:block}.tax-bars b{white-space:nowrap}.tax-table-wrap{overflow-x:auto}.tax-table{border-collapse:collapse;width:100%;min-width:650px;font-size:12px}.tax-table th,.tax-table td{padding:12px;border:1px solid #e9e0d7;text-align:left;vertical-align:top}.tax-table th{background:#f5ece3}.tax-table td small{display:block;font-size:11px;color:#776c63;line-height:1.65;margin-top:5px}.tax-total{background:#edf4eb;font-weight:bold}.tax-channel{margin:0;padding:10px 12px;background:#fff2e9;color:#b74429;font-size:14px}.tax-product-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.tax-product{border:1px solid #eee0d8;border-radius:8px;overflow:hidden;background:white}.tax-product svg{width:100%;display:block}.tax-product>div{padding:12px}.tax-product b{display:block;color:#ee4d2d;font-size:23px}.tax-product small{display:block;color:#807266;font-size:11px;margin-top:8px}.tax-pill{font-size:10px;color:#ba4328;background:#fff1e8;padding:3px}.tax-product p{font-size:12px}.tax-market{margin-top:25px}.tax-market h4{font-size:18px;margin-bottom:5px}#cost .part h3{margin-top:28px}#cost .form{max-height:calc(100vh - 40px);overflow:auto;top:20px}#appendix .tax-optional{padding:20px}#appendix .ap-glossary-grid{font-size:12px}@media(max-width:850px){#cost .form{max-height:none;overflow:visible;position:static}.tax-product-grid{grid-template-columns:1fr}.tax-product{display:block}.jeep-demo{max-height:200px;object-fit:contain}.tax-product svg{align-self:center}.tax-dual{grid-template-columns:1fr}.tax-bars strong{min-width:75px}.tax-bars>div{gap:6px;grid-template-columns:75px minmax(0,1fr) 100px}.tax-bars b{font-size:11px}}`;document.head.append(css);
$('site').dispatchEvent(new Event('input',{bubbles:true}));
})();
