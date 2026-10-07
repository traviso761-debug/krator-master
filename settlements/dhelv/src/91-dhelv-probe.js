// ================================================================= DHELV: THE PROBE (window._api, hostChecks, hostNegatives). verify.py --assert
// runs both; every check has a negative: a broken copy of its input the same check must FAIL (kits/zeijani/PLAN.md section 3).
window._api={REG,DEFS,SITES,ZJ_LIFE,DH,
 footprints(){return REG.filter(r=>!r.parent).map(r=>{const D=r.decl,b=r.bbox;const bw=b.mx[0]-b.mn[0],bd=b.mx[2]-b.mn[2],bh=b.mx[1]-b.mn[1],c=Math.abs(Math.cos(r.ry)),s=Math.abs(Math.sin(r.ry));
  /* a turned site's declared box, turned: its world extent in x and z */
  const W=D.w*c+D.d*s,Dd=D.w*s+D.d*c;
  return {key:r.key,name:r.name,w:+W.toFixed(2),d:+Dd.toFixed(2),h:D.h,bw:+bw.toFixed(2),bd:+bd.toFixed(2),bh:+bh.toFixed(2),ex:+Math.max(0,bw-W).toFixed(2),ez:+Math.max(0,bd-Dd).toFixed(2),eh:+Math.max(0,bh-D.h).toFixed(2),tris:r.tris,budget:D.budget};});},
 nanSweep(){let bad=0;WORLD.traverse(m=>{if(m.geometry&&m.geometry.attributes&&m.geometry.attributes.position){const a=m.geometry.attributes.position.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad++;break;}}});return bad;},
 doors(){return REG.filter(r=>!r.parent).map(r=>({key:r.key,cls:r.cls,front:r.front,doorCount:r.doorCount}));},
 furniture(){const s=ZJF.summary();return {placed:s.placed,keys:s.keys,missing:s.missing,tris:Math.round(ZJF.batch.tris)};},
 tags(){return {audit:ZJTAGS.audit(),records:ZJTAGS.export().records.length};},
 materials(){return window._materials;},
 stream(){return {meshed:DH_STREAM.meshes.size,tris:Math.round(DH_STREAM.tris),chunks:DH_STREAM.keys.length,pending:DH_STREAM.near.length};},
 /* mesh every chunk near a point now (verify's shots: the rock round the view before the screenshot) */
 meshAround(x,y,z){DH_STREAM.tick=0;return dhStream(new THREE.Vector3(x,y,z),true);},
 setNight(v){nightSet(v);},setCut(v){cutSet(v);},setView(...v){setView(...v);}};

const DHP={
 /* the shortest way between two layout nodes (as the layout measures it: plan length), over the edges ok() allows: its nodes */
 path(from,to,ok){const D={},prev={},done={};DH.NODES.forEach(n=>D[n.id]=Infinity);D[from]=0;
  for(;;){let u=null,b=Infinity;for(const id in D)if(!done[id]&&D[id]<b){b=D[id];u=id;}if(u===null||u===to)break;done[u]=1;
   for(const [v,i] of DH.adj[u]){const e=DH.EDGES[i];if(ok&&!ok(e))continue;const d=b+DH.len(e);if(d<D[v]){D[v]=d;prev[v]=u;}}}
  if(D[to]===Infinity)return null;const out=[to];while(out[0]!==from)out.unshift(prev[out[0]]);return out;},
 /* a walker along a node path through a walk registry: steps of 0.2 m, refused where no floor is within 0.6 m or a block stands */
 walk(W,ids){const B=DH.byId,s=B[ids[0]],R={x:s.x,z:s.z,feet:s.y},log=[];
  for(const id of ids.slice(1)){const n=B[id];let ok=true,k=0;while(k++<20000){const dx=n.x-R.x,dz=n.z-R.z,d=Math.hypot(dx,dz);if(d<.15)break;const st=Math.min(.2,d),nx=R.x+dx/d*st,nz=R.z+dz/d*st;
    const f=W.floorBelow(nx,nz,R.feet,.6);if(!f||R.feet-f[0]>.6||W.blocked(nx,f[0],nz,.3,1.7)){ok=false;break;}R.x=nx;R.z=nz;R.feet=f[0];}
   log.push({name:id,ok,feet:+R.feet.toFixed(2),at:[+R.x.toFixed(1),+R.z.toFixed(1)]});if(!ok)break;}return log;},
 /* from the outpost's gate to every district's anchor along the public ways (no secret way) */
 routes(W){const out=[];for(const D of DH.DISTRICTS){if(D.anchor==='o.c')continue;const p=DHP.path('o.gate',D.anchor,e=>e.zone!=='secret');if(!p){out.push({name:D.id,log:[{name:'no path',ok:false}]});continue;}
   out.push({name:D.id,log:DHP.walk(W,p)});}return out;},
 ok(log){return log.length>0&&log.every(s=>s.ok);},
 /* the well floors lit at noon (PLAN.md P5): the sun is up at 12:00, and under each opening (the light well, the three wells) the
    floor sees the sky straight up through the rock at its middle and halfway out (the sky light falls there) */
 lit(C){const keep=SKY.hour;SKY.hour=12;skyApply();const up=LIGHTDIR.y;SKY.hour=keep;skyApply();const bad=[];
  for(const O of DH_LIGHT.openings)for(const [dx,dz] of [[0,0],[.5,0],[-.5,0],[0,.5],[0,-.5]]){const x=O.c[0]+dx*O.r,z=O.c[1]+dz*O.r;if(C.ceilingAt(x,z,O.floor+1)!==null){bad.push(O.name);break;}}
  return {ok:up>.3&&!bad.length,detail:(up>.3?'the sun '+(Math.asin(Math.min(1,up))*180/PI).toFixed(0)+' degrees up at noon':'the sun is down at noon')+(bad.length?'; no sky over '+bad.join(', '):'; '+DH_LIGHT.openings.length+' floors see the sky')};},
 copyWalk(skip){const W=KWALK.create();for(const f of KWALK.floors){if(skip&&skip(f))continue;if(f.kind==='rect')W.floor(f);else if(f.kind==='strip')W.strip(f);else W.poly(f);}for(const b of KWALK.blocks)W.block(b.box,b.tag);return W;}};
function hostChecks(){const R=[],add=(name,ok,detail)=>R.push({name,ok:!!ok,detail});
 const placed=REG.filter(r=>!r.parent).length,want=SITES.filter(s=>!ONLYSET||ONLYSET.has(s.key)).length;
 add('layout-placed',placed===want,placed+' of the layout\'s '+want+' sites placed');
 add('cavern-built',CVC.chunks.length>0,CVC.prims.length+' primitives, '+CVC.chunks.length+' chunks, built in '+CV_STATS.ms+' ms; '+DH_STREAM.meshes.size+' meshed near the camera');
 const t0=performance.now(),leaks=CVC.skyLeaks(2);add('cavern-sky',!leaks.length,(leaks.length?leaks.length+' void points in the open air outside every opening, first '+leaks[0].map(v=>typeof v==='number'?v.toFixed(1):v).join(' '):'no void meets the open air but at its openings')+' ('+Math.round(performance.now()-t0)+' ms at 2 m)');
 {const w=DHP.lit(CVC);add('wells-lit-at-noon',w.ok,w.detail);}
 const rt=DHP.routes(KWALK),bad=rt.filter(r=>!DHP.ok(r.log));
 add('walk-ways',rt.length===DH.DISTRICTS.length-1&&!bad.length,bad.length?bad.map(r=>r.name+': '+r.log.filter(s=>!s.ok).map(s=>s.name+' REFUSED @'+s.feet+' '+s.at).join(', ')).join(' | '):rt.map(r=>r.name+' '+r.log.length+' legs').join(', '));
 return R;}
function hostNegatives(){const R=[],add=(name,failed,detail)=>R.push({name,failed:!!failed,detail});
 /* sky: the hall's light well forgotten */
 {const e=CVC.export();e.openings=e.openings.filter(q=>q.id!=='dh.hall.well');const D=KCAVERN.load(e,{ground:(x,z)=>terrainH(x,z)}).build(),L=D.skyLeaks(2);add('cavern-sky: the light well undeclared',L.length>0,L.length+' leaks');}
 /* light: a plug of rock left in the light well's throat */
 {const e=CVC.export(),H=DH.HALL,top=DH.groundY(H.c[0],H.c[1]);e.prims.push({kind:'monolith',id:'probe-plug',owner:'probe',poly:[[H.c[0]-25,H.c[1]-25],[H.c[0]+25,H.c[1]-25],[H.c[0]+25,H.c[1]+25],[H.c[0]-25,H.c[1]+25]],y0:top-6,y1:top+3});
  let D=null;try{D=KCAVERN.load(e,{ground:(x,z)=>terrainH(x,z)}).build();}catch(err){}const w=D?DHP.lit(D):{ok:true,detail:'the plugged copy did not load'};add('wells-lit-at-noon: the light well plugged',!w.ok,w.detail);}
 /* ways: the stone door's passage left out of the walk map: nothing past it is reached */
 {const R0=REG.find(r=>r.key==='zj_stonedoor'),W=DHP.copyWalk(f=>R0&&f.name===R0.tid+'.pass');const r=DHP.routes(W).find(r=>r.name==='hub');add('walk-ways: the stone door\'s passage missing',r&&!DHP.ok(r.log),r?r.log.filter(s=>!s.ok).map(s=>s.name).join(', '):'no route');}
 return R;}
window.hostChecks=hostChecks;window.hostNegatives=hostNegatives;
