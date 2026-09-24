/* Public reference-rate calculator. No seller data. Values are RMB unless stated. */
(()=>{
  const config = {
    MY:{fx:1.62,fbs:705,base:0,threshold:0,add:.15,ops:[1.2,1.4,1.7,3.2,6]},
    PH:{fx:.124,fbs:1025,base:23,threshold:50,add:4.5,ops:[15,17,24,80,260]},
    TH:{fx:.21,fbs:750,base:0,threshold:0,add:1,ops:[5,7,9,35,70]},
    SG:{fx:5.33,fbs:545,base:1.26,threshold:40,add:.15,ops:[1,1.5,2.9,4.1,6.8]}
  };
  function tier(site,cm,kg){
    const limits=site==='SG'?[[20,2],[25,15.5],[50,15.5],[100,15.5]]:
      [[15,.05],[25,1],[50,5],[100,site==='TH'?8:10]];
    const index=limits.findIndex(([side,weight])=>cm<=side&&kg<=weight);
    return index<0?4:index;
  }
  function derive(input){
    const {site:s,l,w,h,weight,price,units,op3pf}=input,r=config[s];
    if(!r||![l,w,h,weight,price,units].every(x=>Number.isFinite(x)&&x>0)||
      !Number.isInteger(units)||!Number.isFinite(op3pf)||op3pf<0)return null;
    const volume=l*w*h/1e6,index=tier(s,Math.max(l,w,h),weight/1000),freight=volume*r.fbs;
    return {s,r,volume,code:['XS','S','M','L','Over'][index],eligible:index<3,
      freight,op:r.ops[index]*r.fx,localOp:r.ops[index],
      // User-defined comparison assumption: 3PF freight = the same FBS volume rate × 85%.
      pfFreight:freight*.85,
      sFreight:(r.base+Math.max(0,Math.ceil((weight-r.threshold)/10))*r.add)*r.fx};
  }
  const range=x=>Array.isArray(x)?x:[x,x];
  function sum(rows,index){return rows.reduce((a,row)=>{
    if(row.values[index]===null)return a;
    const b=range(row.values[index]);return [a[0]+b[0],a[1]+b[1]];
  },[0,0]);}
  function difference(row,index){
    if(row.values[index]===null||row.values[0]===null)return null;
    // A common fee assumption must not become an artificial saving/loss by crossing its endpoints.
    if(row.shared)return [0,0];
    const a=range(row.values[index]),b=range(row.values[0]);return [a[0]-b[1],a[1]-b[0]];
  }
  function compare(rows,index){
    const parts=rows.map(row=>({name:row.name,delta:difference(row,index)}));
    const delta=parts.reduce((a,p)=>p.delta?[a[0]+p.delta[0],a[1]+p.delta[1]]:a,[0,0]);
    const clean=delta.map(x=>Math.abs(x)<1e-9?0:x);
    return {parts,delta:clean,kind:clean[0]>=0?'saving':clean[1]<=0?'extra':'mixed'};
  }
  globalThis.FBSCostAudit={config,tier,derive,sum,difference,compare};
})();
