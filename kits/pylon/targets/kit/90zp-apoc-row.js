// TARGET: kit — the Post-Apoc set in Pylon's culture pack (PLAN.md section 4: "as it is, through a pylon culture pack").
// The closure KratorPostApoc (settlements/iziz/build.py, kit.json "postApoc": kits/post-apoc's buildings and the pack in
// kits/pylon/apoc/81-pyl-culture.js) builds its own group on its own seeded stream, so nothing here draws from the page's
// rng(); its rooms are planned and furnished by its own furniture glue (the 'post-apoc' interior set, the catalog's scrap and
// post-apoc furniture). One row south of the mixed streets, front (+z) toward the camera; each building is registered so
// the labels and the probe see it. PYL_APOC: the placed records ({key, name, x, z, w, d, h}) for the views (91zp).
const PYL_APOC_KEYS=['dw-tank','lg-tanktower','lg-bulkhead','lg-stack','dw-silo','lg-twinsilo',
 'shop-food','shop-armor','shop-weapon','shop-tinker','shop-general','smithy','warehouse','gen-wind','gen-fuel','watchtower','compound','arena'];
const PYL_APOC=[];
if(typeof KratorPostApoc!=='undefined'&&!window.CITY){const K=KratorPostApoc,z=ROWZ[ROWZ.length-1]+90;
 K.setError(m=>{if(typeof reportErr==='function')reportErr(m);else console.error(m);});K.setInteriors(typeof KratorInteriors!=='undefined');
 const keys=PYL_APOC_KEYS.filter(k=>K.DEFS[k]),D=keys.map(k=>K.declOf(k,{})),ws=D.map(d=>d.w+8);let x=-ws.reduce((a,b)=>a+b,0)/2;const sites=[];
 keys.forEach((k,i)=>{sites.push({key:k,x:x+ws[i]/2,z,ry:0,o:{v:0,culture:'pylon'}});x+=ws[i];});
 const W=K.build(sites,{culture:'pylon'});scene.add(W);
 for(const R of K.REG()){REGISTER({name:'Post-Apoc (Pylon) — '+R.name,x:R.x,z:R.z,r:R.r,h:R.h});REG[REG.length-1].type='apoc:'+R.key;
  const d=D[keys.indexOf(R.key)]||{w:10,d:10,h:8};PYL_APOC.push({key:R.key,name:R.name,x:R.x,z:R.z,w:d.w,d:d.d,h:d.h||R.h});}
 window._registered=REG.length;window._apoc=Object.assign({buildings:PYL_APOC.length},K.furniture());}
