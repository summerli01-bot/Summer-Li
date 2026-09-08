import page from './page.mjs';

const headers={'x-content-type-options':'nosniff','referrer-policy':'no-referrer','cache-control':'no-store'};
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{...headers,'content-type':'application/json; charset=utf-8',...extra}});
const limits=new Map();
let cacheKey,rosterPromise;
export function normalizeGgp(value){return String(value??'').normalize('NFKC').toLowerCase().replace(/股份有限公司|有限责任公司|有限公司|集团有限公司|集团|company|corporation|incorporated|limited|ltd|inc|corp|co/gi,'').replace(/[\s\p{P}\p{S}]+/gu,'');}
export function dice(a,b){if(!a||!b)return 0;if(a===b)return 1;if(a.length<2||b.length<2)return 0;const grams=new Map();for(let i=0;i<a.length-1;i++)grams.set(a.slice(i,i+2),(grams.get(a.slice(i,i+2))||0)+1);let n=0;for(let i=0;i<b.length-1;i++){const g=b.slice(i,i+2),c=grams.get(g)||0;if(c){n++;grams.set(g,c-1);}}return 2*n/(a.length+b.length-2);}
export function ggpStatus(input,canonical){if(!String(input??'').trim())return 'not_entered';const a=normalizeGgp(input),b=normalizeGgp(canonical);if(!a||!b)return 'mismatch';if(a===b||dice(a,b)>=.86)return 'match';if((a.length>=4&&b.includes(a))||(b.length>=4&&a.includes(b))||dice(a,b)>=.58)return 'close';return 'mismatch';}
async function loadRoster(env){
 const key=env.ROSTER_REVISION;
 if(!key||!env.ROSTER_PART_COUNT)throw Error('Roster not configured');
 if(cacheKey!==key||!rosterPromise){
  cacheKey=key;
  rosterPromise=(async()=>{
   let encoded='';for(let i=0;i<Number(env.ROSTER_PART_COUNT);i++)encoded+=env['ROSTER_PART_'+i]||'';
   const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
   const text=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
   const rows=JSON.parse(text),map=new Map();
   for(const row of rows){if(!['SG','MY','TH','PH'].includes(row.site)||!/^\d{1,24}$/.test(row.shopId)||map.has(row.shopId))throw Error('Invalid roster');map.set(row.shopId,row);}
   if(!map.size)throw Error('Empty roster');return map;
  })().catch(e=>{rosterPromise=null;throw e;});
 }
 return rosterPromise;
}
function limited(ip){const now=Date.now(),window=Math.floor(now/60000);if(limits.size>5000){for(const[k,v]of limits)if(v.window!==window)limits.delete(k);if(limits.size>5000)return true;}const v=limits.get(ip);if(!v||v.window!==window){limits.set(ip,{window,n:1});return false;}return ++v.n>30;}
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/api/free-trial'){
   if(request.method!=='POST')return json({error:'method_not_allowed'},405,{'allow':'POST'});
   const origin=request.headers.get('origin');if(origin&&origin!==url.origin)return json({error:'forbidden'},403);
   if(limited(request.headers.get('cf-connecting-ip')||'unknown'))return json({error:'too_many_requests'},429,{'retry-after':'60'});
   if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'invalid_content_type'},415);
   try{
    const reader=request.body?.getReader();if(!reader)return json({error:'invalid_input'},400);let bytes=0,parts=[];
    while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.length;if(bytes>2048){await reader.cancel();return json({error:'request_too_large'},413);}parts.push(value);}
    const body=JSON.parse(await new Blob(parts).text());
    if(typeof body.shopId!=='string'||(body.ggp!==undefined&&typeof body.ggp!=='string'))return json({error:'invalid_input'},400);
    const shopId=body.shopId.trim().replace(/^'+/,'').replace(/\.0$/,''),ggp=body.ggp||'';
    if(!/^\d{1,24}$/.test(shopId)||ggp.length>200)return json({error:'invalid_input'},400);
    const roster=await loadRoster(env),match=roster.get(shopId);
    return json({available:true,matched:!!match,...(match?{site:match.site,ggpStatus:ggpStatus(ggp,match.ggp)}:{}),updatedAt:env.ROSTER_UPDATED_AT});
   }catch{return json({available:false,error:'lookup_unavailable'},503);}
  }
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers});
  if(url.pathname==='/'||url.pathname==='/index.html')return new Response(request.method==='HEAD'?null:page,{headers:{...headers,'content-type':'text/html; charset=utf-8','content-security-policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'self'"}});
  if(url.pathname==='/sop.pdf')return env.ASSETS.fetch(request);
  return new Response('Not found',{status:404,headers});
 }
};
