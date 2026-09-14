(()=>{
const active=new Map();
const message=e=>e?.name==='AbortError'?'查询已中断，请点击查询重试。':e?.name==='TimeoutError'?'连接较慢，重试后仍未完成。请稍后再试或切换网络；这不代表没有资格。':e?.status===429?'查询较频繁，请一分钟后重试。':'暂时连接不上名单服务，请稍后重试或切换网络；这不代表没有资格。';
function cancel(key){active.get(key)?.abort();active.delete(key)}
async function request(url,body,{key=url,onStatus=()=>{},timeout=25000}={}){
 cancel(key);const outer=new AbortController();active.set(key,outer);
 try{for(let attempt=0;attempt<2;attempt++){
 if(outer.signal.aborted)throw new DOMException('Cancelled','AbortError');
 if(navigator.onLine===false)throw new TypeError('Offline');
 onStatus(attempt?'连接较慢，正在自动重试（1/1）…':'正在查询，请保持页面在前台…');
 const controller=new AbortController();let timedOut=false;
 const stop=()=>controller.abort();outer.signal.addEventListener('abort',stop,{once:true});
 const timer=setTimeout(()=>{timedOut=true;controller.abort()},timeout);
 try{const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
 const text=await res.text();
 if(!res.ok){const err=new Error('HTTP');err.status=res.status;throw err}
 if(outer.signal.aborted)throw new DOMException('Cancelled','AbortError');
 return JSON.parse(text);
 }catch(e){if(outer.signal.aborted)throw new DOMException('Cancelled','AbortError');
 const retry=!e.status||[408,502,503,504].includes(e.status);
 if(attempt||!retry||navigator.onLine===false){if(timedOut)throw new DOMException('Timeout','TimeoutError');throw e}
 }finally{clearTimeout(timer);outer.signal.removeEventListener('abort',stop)}
 // At most one retry. No seller results persist in browser storage.
 await new Promise(resolve=>setTimeout(resolve,800));
 }}finally{if(active.get(key)===outer)active.delete(key)}
}
window.FBSQuery={request,cancel,message};
})();
