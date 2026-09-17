(function(){
 const domains={TH:'co.th',VN:'vn',SG:'sg',PH:'ph',MY:'com.my'};
 const mpSkuId=r=>`${r.itemId}_${r.modelId}`;
 const itemLink=r=>domains[r.site]&&/^\d+$/.test(r.shopId)&&/^\d+$/.test(r.itemId)?`https://shopee.${domains[r.site]}/product/${r.shopId}/${r.itemId}`:null;
 const minimumTier=r=>(r.tiers||[]).filter(t=>Number.isFinite(t.qty)&&t.qty>0).sort((a,b)=>a.qty-b.qty||a.doc-b.doc)[0];
 function minimumPlan(rows){return rows.flatMap(r=>{const t=minimumTier(r);return t?[{id:r.id,doc:t.doc,qty:t.qty}]:[]})}
 function exportCSV(rows,choose){
  const records=[['站点','shop id','mt_sku_id','预计备货数量'],...rows.map(r=>[r.site,r.shopId,mpSkuId(r),choose(r).qty])];
  return '\uFEFF'+records.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n')+'\r\n';
 }
 function tierPlan(rows,doc){return rows.flatMap(r=>{const t=(r.tiers||[]).find(t=>t.doc===(r.site==='SG'?45:Number(doc))&&Number.isFinite(t.qty)&&t.qty>0);return t?[{id:r.id,doc:t.doc,qty:t.qty}]:[]})}
 const api={mpSkuId,itemLink,minimumTier,minimumPlan,tierPlan,exportCSV};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else window.NewSkuPlan=api;
})();
