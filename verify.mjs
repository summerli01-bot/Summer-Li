import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import zlib from 'node:zlib';
import vm from 'node:vm';
import worker from './dist/server/index.js';
const rows=['SG','MY','TH','PH'].map((site,i)=>({site,shopId:String(900000000000001+i),ggp:'Synthetic Fixture '+site}));
const env={ROSTER_PART_COUNT:'1',ROSTER_REVISION:'test',ROSTER_UPDATED_AT:'2026-09-08',ROSTER_PART_0:zlib.gzipSync(JSON.stringify(rows)).toString('base64'),ASSETS:{fetch:async()=>new Response('PDF')}};
let index=0;
const call=(body,extras={})=>worker.fetch(new Request('https://example.test/api/free-trial',{method:'POST',headers:{'content-type':'application/json','cf-connecting-ip':String(++index),...extras},body:JSON.stringify(body)}),env);
for(const site of ['SG','MY','TH','PH']){
 const row=rows.find(r=>r.site===site);const result=await (await call({shopId:row.shopId,ggp:row.ggp})).json();assert.equal(result.site,site);assert.equal(result.ggpStatus,'match');assert.equal(result.ggp,undefined);assert.equal(result.shopId,undefined);
}
assert.equal((await (await call({shopId:'999999999999999'})).json()).matched,false);
assert.equal((await call({shopId:'invalid'})).status,400);
assert.equal((await call({shopId:rows[0].shopId},{origin:'https://foreign.test'})).status,403);
assert.equal((await worker.fetch(new Request('https://example.test/api/free-trial'),env)).status,405);
for(const route of ['/work/private/free_trial_shops.json','/outputs/Shopee_EL_官方仓费用测算_GoogleSheet模板.xlsx','/.env'])assert.equal((await worker.fetch(new Request('https://example.test'+route),env)).status,404);
for(let i=0;i<31;i++){const result=await call({shopId:rows[0].shopId},{'cf-connecting-ip':'rate-test'});assert.equal(result.status,i<30?200:429);}
const html=await (await worker.fetch(new Request('https://example.test/'),env)).text();
for(const row of rows){assert(!html.includes(row.ggp));assert(!html.includes('"shopId":"'+row.shopId+'"'));}
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(script);
const initial=script.slice(0,script.indexOf('installSellerTips();installPrivacyUI();'));
const defaults={site:'SG',store:'mall',l:15,w:10,h:5,weight:350,price:86.4,units:500,op3pf:1.8,shop:'',ggp:''};
const nodes=new Map();const document={querySelector:s=>{if(!nodes.has(s))nodes.set(s,{value:String(defaults[s.slice(1)]??''),textContent:'',className:'',innerHTML:''});return nodes.get(s);}};
const result=vm.runInNewContext(initial+';compute()', {document,Date});assert.equal(result.fTotal,4956.375);assert(Math.abs(result.sTotal-22662.15)<1e-6);assert.equal(result.freeEligible,false);
console.log('Passed: four-site lookup, unknown/invalid input, private response fields, rate limit, private path blocking, page script syntax and default calculator totals.');
