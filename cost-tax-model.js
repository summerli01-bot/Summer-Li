(function(root){
const numeric=v=>{if(v===null||v===undefined||String(v).trim()==='')return null;const n=Number(String(v).replace(/,/g,''));return Number.isFinite(n)&&n>=0?n:null};
function myTax(p,r){if(p<=500)return{kind:'低价值商品 LVG',buyerTax:p*.1,front:p*1.1,sellerTax:0,formula:`${p.toFixed(2)} × 10%`};if(r===null)return{kind:'高价值商品 NLVG',buyerTax:0,front:p,sellerTax:null,formula:'需确认类目综合税率'};const base=p/(1+r),tax=base>500?base*r:p*r;return{kind:'高价值商品 NLVG',buyerTax:0,front:p,sellerTax:tax,formula:base>500?`${p.toFixed(2)} ÷ (1 + ${(r*100).toFixed(1)}%) × ${(r*100).toFixed(1)}%`:`税前反推值 ≤ RM500：${p.toFixed(2)} × ${(r*100).toFixed(1)}%`};}
function thTax(p,d){return d===null?{front:null,duty:null,vat:null}:{front:p*(1+d)*1.07,duty:p*d,vat:p*(1+d)*.07};}
const api={numeric,myTax,thTax};if(typeof module!=='undefined')module.exports=api;root.FBSCostTax=api;
})(typeof window!=='undefined'?window:globalThis);
