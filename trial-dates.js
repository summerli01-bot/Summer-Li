(function(root){
const day=86400000,fmt=d=>d.toISOString().slice(0,10);
function parse(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return null;const d=new Date(s+'T00:00:00Z');return Number.isFinite(+d)&&fmt(d)===s?d:null}
const plusDays=(d,n)=>new Date(+d+n*day);
function months(d,n){const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+n+1,0)).getUTCDate();return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+n,Math.min(d.getUTCDate(),last)))}
const sunday=d=>plusDays(d,(7-d.getUTCDay())%7);
function estimate(site,inbound,activation){const d=parse(inbound);if(!d)return {status:inbound?'invalid':'no-inbound'};
 const mon=plusDays(d,-((d.getUTCDay()+6)%7));
 if(site==='SG'||site==='MY'){const start=plusDays(mon,((d.getUTCDay()+6)%7)>=3?7:0),end=sunday(new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+7,0)));return {start:fmt(start),end:fmt(end),kind:'weekly'}}
 if(site==='TH'){const start=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1)),stop=months(start,6);return {start:fmt(start),end:fmt(plusDays(stop,-1)),stop:fmt(stop),halfEnd:fmt(plusDays(months(stop,6),-1)),kind:'monthly'}}
 if(site==='PH'){const a=parse(activation);if(a)return {start:fmt(a),end:fmt(sunday(months(a,6))),kind:'whitelist'};const sun=plusDays(mon,6);return {start:fmt(mon),startLatest:fmt(sun),end:fmt(sunday(months(mon,6))),endLatest:fmt(sunday(months(sun,6))),kind:'assumed-week'}}
 return {status:'unsupported'};
}
function resolve(site,x){
 const start=parse(x.incentiveStartDate)||parse(x.activationDate),end=parse(x.incentiveEndDate);
 if(end)return {start:start?fmt(start):'',end:fmt(end),kind:'recorded',actualStart:!!start,actualEnd:true};
 if(start){let e;if(site==='SG'||site==='MY')e=sunday(new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+7,0)));else if(site==='TH')e=plusDays(months(start,6),-1);else if(site==='PH')e=sunday(months(start,6));else return {status:'unsupported'};return {start:fmt(start),end:fmt(e),kind:'activation-estimate',actualStart:true,actualEnd:false};}
 return estimate(site,x.firstInboundAfterTrial,x.activationDate);
}
root.FBSTrialDates={estimate,resolve};if(typeof module!=='undefined')module.exports={estimate,resolve};
})(typeof window!=='undefined'?window:globalThis);
