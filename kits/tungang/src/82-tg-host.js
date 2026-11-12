// ================================================================= THE TUNGANG SET'S HOST API: TG.tg.draw and its kin (API.md)
// What a world calls to draw the Tungang set from its plan's sites (core/city/cavern: KCITY.cavern.lineHold's records), after
// it has carved the rock from the same void plans (TG.tg.plan, through KCITY.cavern.carve(H, {plan: TG.tg.planOf})) and
// registered the sites in core/tags. The draw is DRY, as TG.fg.draw's (80-fg-host.js): fresh buckets flushed into one group.
//   TG.tg.draw(sites, o)   sites [{id, key, x, y, z, ry, state, num, ...}] (a site's x, y, z the foot of its front, ry its facing),
//                          o {scene, label, state (the default), seed}: each site's def at its point; returns the meshes with
//                          .group, .recs, .missing (keys the kit lacks), .tris, .lights (TG.tg's light records: the lamp code
//                          and the wax light, KCAVELIGHT's shape), .furniture (the scaled pieces placed), .missingFurn
//   TG.tg.planOf(site)     the void plan for KCITY.cavern.carve's o.plan (the site's key and state)
//   TG.tg.dims(key)        a key's box {w, d, h}; TG.tg.BOX the boxes
//   TG.tg.proto(key, o)    one def alone at the origin (dry, its own group): verify.py measures the states this way
// The furniture: every tgFurn piece is queued (44-tg-kit.js) at its world point; tgFurnFlush places the queue in a catalog batch
// at the points over the Tungangs' scale and flushes it into a group scaled by it, so each piece stands at its point at 0.94.
function tgFurnFlush(G){const Q=TG.tg.FURN;if(!Q.length||typeof KratorFurniture==='undefined'||!KratorFurniture.batch)return 0;const s=TG.tg.SCALE,FB=KratorFurniture.batch({indexed:true});
 for(const p of Q)FB.place(p.key,p.x/s,p.y/s,p.z/s,p.ry,{variant:p.v,setting:'indoor',seed:1+(KRAND.hash(9300,Math.round(p.x*10),Math.round(p.z*10))%997)});
 const fg=FB.flush(G);fg.scale.setScalar(s);fg.userData.furniture=true;fg.userData.scale=s;
 fg.traverse(m=>{const c=m.geometry&&m.geometry.attributes.color;if(!c||c.userData_lin)return;const A=c.array;if(!(A instanceof Float32Array))return;for(let i=0;i<A.length;i++){const v=A[i];A[i]=v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);}c.needsUpdate=true;m.castShadow=true;m.receiveShadow=true;});
 return Q.length;}
TG.tg.dims=k=>TG.tg.BOX[k]?{w:TG.tg.BOX[k].w,d:TG.tg.BOX[k].d,h:TG.tg.BOX[k].h}:null;
TG.tg.planOf=s=>TG.tg.plan(s.key,{state:s.state});
TG.tg.draw=function(sites,o){o=o||{};const missing={};TG.tg.LIGHTS=[];TG.tg.FURN=[];TG.tg.missing={};TG_COLLECT=1;
 let out;try{out=fgDrawInto(Object.assign({name:'tungang',label:o.label||'A Tungang hold'},o,{scene:null}),()=>(sites||[]).map((r,i)=>{
  if(!DEFS[r.key]||!TG.tg.BOX[r.key]){missing[r.key]=(missing[r.key]==null?0:missing[r.key])+1;return null;}
  /* a site's look varies by a hash of the world seed and its index (core/rand), never by what was drawn before it */
  const v=r.v!=null?r.v|0:KRAND.hash(o.seed==null?9300:o.seed,i,0x7a1)%97;
  const rec=place(r.key,r.x,r.z,r.ry==null?0:r.ry,Object.assign({},r.o||{},{y:r.y==null?0:r.y,v,state:r.state||o.state,num:r.num,loj:r.loj,span:r.span,h:r.h}));
  if(rec){rec.id=r.id;rec.site=r;}return rec;}));}
 finally{TG_COLLECT=0;}
 out.furniture=tgFurnFlush(out.group);out.missingFurn=Object.assign({},TG.tg.missing);
 out.lights=TG.tg.LIGHTS.slice();out.missing=missing;if(o.scene)o.scene.add(out.group);return out;};
TG.tg.proto=function(key,o){return TG.tg.draw([Object.assign({id:'proto:'+key,key,x:0,y:0,z:0,ry:0},o||{})],{label:DEFS[key]?DEFS[key].name:key,probe:false});};
/* the checks verify.py runs (and a world's --assert): every def's drawn pieces inside its box (+.5 m: frames and dress stand
   proud of the front); its void plan inside its box; the lamp code at its door */
TG.tg.check={
 box(recs){const bad=[];for(const r of recs||[]){const B=TG.tg.BOX[r.key];if(!B||!r.bbox)continue;const mn=r.bbox.mn,mx=r.bbox.mx;
  /* the drawn box's centre within reach of the front (its box runs d into the rock; the gate spans its way) and no taller than h */
  let ok=true;const hw=B.w/2+.6,ext=Math.max(hw,B.d+.6)+(r.key==='tg-doors'?(r.site&&r.site.span||6):0);
  if(Math.abs((mn[0]+mx[0])/2-r.x)>ext||Math.abs((mn[2]+mx[2])/2-r.z)>ext||mx[1]-r.y>B.h+(r.key==='tg-night-mouth'?4.6:.6))ok=false;
  if(!ok)bad.push(r.key+' at '+r.x.toFixed(1)+','+r.z.toFixed(1)+' reaches past its box');}return bad;},
 plans(){const bad=[];for(const k in TG.tg.BOX){const B=TG.tg.BOX[k],P=TG.tg.plan(k);for(const v of P){if(v.kind==='stair'){if(Math.abs(v.a[0])>B.w/2||v.b[2]<-B.d-.01)bad.push(k+'.'+v.id+' leaves its box');continue;}
  if(Math.abs(v.x)+v.w/2>B.w/2+.01||v.z-v.d/2<-B.d-.01||v.z+v.d/2>.41||v.y+v.h>B.h+.01)bad.push(k+'.'+v.id+' leaves its box');}
  if(k!=='tg-carriage-house'&&k!=='tg-doors'&&k!=='tg-last-stop'&&!P.some(v=>v.z+v.d/2>.39))bad.push(k+' has no doorway past its front');}return bad;},
 lamps(out){const bad=[];for(const r of out.recs||[]){const B=TG.tg.BOX[r.key];if(!B||!B.code)continue;const st=r.site&&r.site.state;if(st==='abandoned')continue;
  const L=TG.tg.LAMP[B.code],near=(out.lights||[]).some(l=>l.kind===L.kind&&Math.hypot(l.x-r.x,l.z-r.z)<Math.max(4,B.w/2+1.5));if(!near)bad.push(r.key+' at '+r.x.toFixed(1)+','+r.z.toFixed(1)+' has no '+B.code+' lamp at its door');}return bad;}};
