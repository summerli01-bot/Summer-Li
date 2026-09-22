(()=>{
const $=id=>document.getElementById(id),E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const legacy=$('ggp').closest('.field');legacy.hidden=true;legacy.style.display='none';
const label=document.createElement('label');label.className='field full';label.innerHTML='Username（与 Shop ID 二选一）<input id="username" placeholder="例如 xxxxx.ph" autocomplete="off" spellcheck="false">';$('shop').closest('.field').after(label);
$('shop').closest('.field').firstChild.textContent='Shop ID（与 Username 二选一）';$('shop').placeholder='请输入完整店铺 ID';
document.querySelectorAll('#cost .form p.muted').forEach(p=>{if(/GGP/.test(p.textContent))p.remove()});
const hint=document.createElement('p');hint.className='muted';hint.textContent='填写任意一项即可精准查询；同时填写时，两项须属于同一家店铺。';label.after(hint);
const button=document.createElement('button');button.type='button';button.className='btn shop-query-compact';button.textContent='查询店铺资格';label.after(button);button.after(hint);hint.after($('shopLookup'));button.style.gridColumn='1 / -1';
let result=null,version=0,timer;
showLookup=()=>{const p=$('shopLookup');p.className='lookup-panel';p.textContent=result?.matched?'已精准匹配 '+result.username+' · '+result.site+' · 有 Free Trial 名单资格。':({empty:'填写 Shop ID 或 Username，查询 Free Trial 名单资格。',invalid:'请检查完整的店铺 ID 或 Username。',not_found:'未找到完全一致的店铺，请核对拼写或联系客户经理。',conflict:'两项未匹配到同一家店铺，请核对或只填写一项。',ambiguous:'存在重复店铺记录，请同时填写 Shop ID 和 Username 确认。',loading:'正在核验店铺…',error:'查询暂不可用，请稍后重试。'})[result?.status||'empty'];if(result?.status==='error')p.textContent=result.message;};
lookupShop=async()=>{clearTimeout(timer);const seq=++version,shopId=$('shop').value.trim(),username=$('username').value.trim();result={status:'loading'};shopState={status:'empty',matched:false,site:null,ggpStatus:'not_entered'};showLookup();button.disabled=true;try{if(!shopId&&!username)result={status:'empty'};else{const d=await FBSQuery.request('/api/free-trial',{shopId,username},{key:'shop',onStatus:t=>{if(seq===version)$('shopLookup').textContent=t}});if(seq!==version)return;result=d;}if(result.matched){shopState={...result,status:'ready',ggpStatus:'not_entered'};const matchedSite=String(result.site||'').trim().toUpperCase();if([...$('site').options].some(o=>o.value===matchedSite)){$('site').value=matchedSite;shopState.site=matchedSite;}}}catch(err){if(seq!==version)return;result={status:'error',message:FBSQuery.message(err)};}finally{if(seq===version){button.disabled=false;showLookup();$('site').dispatchEvent(new Event('input',{bubbles:true}));}}};
button.onclick=lookupShop;
function changed(){const suffix=$('username').value.trim().match(/\.(my|sg|ph|th)$/i);if(suffix)$('site').value=suffix[1].toUpperCase();version++;clearTimeout(timer);result={status:'empty'};shopState={status:'empty',matched:false,site:null,ggpStatus:'not_entered'};button.disabled=false;showLookup();$('site').dispatchEvent(new Event('input',{bubbles:true}));FBSQuery.cancel('shop')}
$('username').addEventListener('input',changed);
// The original Shop ID listener already schedules lookupShop; invalidate this
// request immediately as well so an older response cannot repopulate the form.
$('shop').addEventListener('input',changed);
[$('shop'),$('username')].forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();lookupShop()}}));

const style=document.createElement('style');style.textContent='#cost .shop-query-compact{grid-column:1/-1;justify-self:start;align-self:center;width:auto;min-height:36px;padding:7px 13px;font-size:13px;line-height:1.4;font-weight:600;border:1px solid #e6aa98;border-radius:8px;background:#fff6f1;color:#b64128;transition:background .15s,border-color .15s}#cost .shop-query-compact:hover{background:#ffe9df;border-color:#d76547}#cost .shop-query-compact:focus-visible{outline:2px solid #ee4d2d;outline-offset:3px}#cost .shop-query-compact:disabled{opacity:.6;cursor:wait}@media(min-width:851px){#cost .form{position:sticky;top:16px;max-height:calc(100dvh - 32px);overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable}}@media(max-width:850px){#cost .form{position:static;max-height:none}}';document.head.append(style);
document.querySelector('[data-page="cost"]').textContent='官方仓费用测算';
document.querySelector('#cost .head h2').nextElementSibling.textContent='填写商品与经营信息，对比每件成本和预计每月节省。';
document.querySelector('#cost>.notice').textContent='本页比较 Free Trial 情景下的基础费用。适用项目、成长进展与额外奖励，请查看“官方仓项目介绍”。';
$('price').closest('.field').firstChild.textContent='单件成交金额 RMB';$('units').closest('.field').firstChild.textContent='预计月销量（件）';
document.querySelector('.hero>p').textContent='了解入仓流程，查询适用激励，比较官方仓成本。';
document.querySelector('.footer span').innerHTML='数据参考日期：2026-09-13<br>测算仅作方案比较，实际资格、费用和奖励以生效政策及账单为准。';
showLookup();
})();
