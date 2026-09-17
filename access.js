(()=>{
 const isShare=location.pathname.endsWith('/share.html'),code=(new URLSearchParams(location.search).get('ggp')||'').replace(/^S/i,'');const params=new URLSearchParams(location.hash.slice(1)),incoming=params.get('access');let token='';
 if(isShare){try{if(incoming)sessionStorage.setItem('fbs.share.'+code,incoming);token=sessionStorage.getItem('fbs.share.'+code)||''}catch{token=incoming||''}history.replaceState(null,'',location.pathname+'?ggp=S'+encodeURIComponent(code)+'#growth');window.initialDemoHash='#growth';}
 const native=window.fetch.bind(window);window.fetch=(url,opts={})=>{let s=typeof url==='string'?url:'';if(s.startsWith('/api/')||s.startsWith('https://el-fbs-roster-api.summer-li01.workers.dev/api/')){if(s.startsWith('/api/'))s='https://el-fbs-roster-api.summer-li01.workers.dev'+s;const headers=new Headers(opts.headers||{});if(isShare&&token&& !s.endsWith('/api/events'))headers.set('Authorization','Bearer '+token);return native(s,{...opts,headers,cache:'no-store'});}return native(url,opts)};
 window.FBSAccess={isShare,code,ready:!isShare};
 window.addEventListener('DOMContentLoaded',async()=>{
  if(!isShare)return;const banner=document.createElement('div');banner.id='shareStatus';banner.style.cssText='background:#fff0df;color:#793d22;padding:14px 22px;text-align:center;font-size:14px';banner.textContent='正在核验专属访问链接…';document.body.prepend(banner);
  for(const id of ['projectGgp','skuGgp']){const input=document.getElementById(id);if(input){input.value=code;input.readOnly=true;}}
  for(const id of ['projectSearch','skuQuery']){const b=document.getElementById(id);if(b)b.disabled=true;}
  try{if(!token||!/^\d+$/.test(code))throw Error();const r=await fetch('/api/access',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});const d=await r.json();if(!r.ok||d.ggpCode!=='S'+code)throw Error();window.FBSAccess.ready=true;banner.textContent=`${d.ggpCode} 专属查询 · 数据更新 ${d.updatedAt} · 链接有效至 ${new Date(d.expiresAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false})}（北京时间）。请勿转发；点击查询获取最新已同步记录。`;for(const id of ['projectSearch','skuQuery']){const b=document.getElementById(id);if(b)b.disabled=false;}
  }catch{banner.textContent='此专属链接缺少凭证、已失效或已撤销。请联系客户经理获取新的分享链接。';window.FBSAccess.ready=false;}
  document.querySelector('[data-page="growth"]')?.click();
 });
})();
