// ================================================================= YS CITY — the DRAW pass: the records of 88 built (PLAN.md P3 step 6; GODOT.md item 5)
// Reads PLACE and nothing else decides: the free-standing defs through HYK.place, the hosts through ysPlaceHost (cut,
// sunk, holed for their ways in), the tideline on each, and every pod through HYK.placeOn at the plate and bearing its
// record names. A slot (the foreign quarter, the land quarter's reclaimed Ancients) draws nothing: its builder is not in
// this build yet. The draw code's own scatter (the tideline's weed and specks, the builders' detail) is the lineage's
// stream, reseeded per host here (seeds 32100 + the host's index, below 32400); where things stand came from KRAND.
YS_BUILD.push(function(scene){const t0=performance.now();let fail=0;
 const once=k=>{TSTAT.cur=k+'/0';const t=tcur();t.n=(t.n||0)+1;};   // per-placement budgets (91-ys-probe typeStats)
 for(const r of PLACE.blds){once(r.key);const G=HYK.place(scene,r.key,r.x,r.z,r.ry,{y:r.y,v:r.v});if(!G)fail++;else r.drawn=true;}
 TSTAT.cur=null;
 PLACE.hosts.forEach((h,i)=>{const T=YS_HOST_TYPES[h.type];const builder=typeof window[T.builder]==='function'?window[T.builder]:null;
  if(!builder){reportErr('host type '+h.type+' has no builder '+T.builder);return;}
  const host=ysPlaceHost(scene,{key:T.key,builder,x:h.x,z:h.z,y:h.sink,ry:h.ry,d:h.d,cutY:h.cutY,podium:h.podium,cap:h.cap,rAt:h.rAt,name:h.n,
   floors:h.floors,ways:h.ways,sockets:h.sockets||null,ring:h.wealth==='rich'?1:h.wealth==='middle'?2:3});
  if(!host){fail++;return;}
  // the floors table runs to the top of what stands, not on into the sky over a full tower
  h.G=host.G;host.floors=host.floors.filter(f=>f.y<h.top+2);host.full=h.full;host.shaped=h.shaped;host.rec=h;h.drawn=true;
  reseed(32100+i);hykTideline(host);
  for(const p of h.pods){once(p.key);const hp=p.core?Object.create(host,{x:{value:p.cx},z:{value:p.cz},rAt:{value:()=>p.cr}}):host;   /* a socket pod is framed on its own core */
   const G=HYK.placeOn(scene,p.key,hp,{y:p.y,a:p.a,level:p.level,into:p.into});if(G)p.drawn=true;else fail++;}
  TSTAT.cur=null;});
 // the subdivided floors (88a): the partitions as thin shell walls in the interior bucket, both faces; the floors marked
 reseed(32390);const wc=hC(hPick(HPAL.shell),.92);let nw=0;
 for(const P of FLOORS.plans){const cs=Math.cos(P.ry),sn=Math.sin(P.ry);const W=(lx,lz)=>[P.hx+lx*cs+lz*sn,P.hz-lx*sn+lz*cs];const y0=P.y+.3;
  for(const w of P.walls){const f=w.arc?(u,v)=>{const th=u*TAU;const p=W(w.cx+w.r*Math.cos(th),w.cz+w.r*Math.sin(th));return [p[0],y0+v*P.H,p[1]];}
    :(u,v)=>{const r=w.r0+(w.r1-w.r0)*u;const p=W(w.cx+r*Math.cos(w.th),w.cz+r*Math.sin(w.th));return [p[0],y0+v*P.H,p[1]];};
   const nu=w.arc?Math.max(16,Math.round(w.r*1.2)):1;for(const flip of [false,true])hykPutRaw('hkIn',hykSurf(f,nu,1,{col:wc,flip,uS:4,vS:1}),true);nw++;}
  const host=HOSTS.find(x=>x.n===P.host);if(host){const fl=host.floors.find(f=>Math.abs(f.y-P.y)<.6);if(fl){fl.kind='inhabited';fl.use=Math.max(fl.use||0,.5);fl.rooms=P.rooms;}}}
 window._floors={plans:FLOORS.plans.length,rooms:FLOORS.rooms,spots:FLOORS.spots,walls:nw};
 // the Ancients builders draw a host as a dozen plain meshes (skin, lining, ribbons, plinth...), so thirty hosts were two
 // hundred draw calls: every host's static opaque meshes are merged across the city, one mesh per material and layout
 window._cityMerge=ysMergeHostMeshes(scene,PLACE.hosts.filter(h=>h.G).map(h=>h.G));
 window._city={blds:PLACE.blds.length,hosts:HOSTS.length,pods:PLACE.hosts.reduce((s,h)=>s+h.pods.length,0),slots:PLACE.slots.length,fail,ms:Math.round(performance.now()-t0)};
});
// merge the plain meshes under the given groups by material (and attribute layout) into world-space meshes on the scene;
// instanced kit items, transparent and multi-material meshes stay as they are. The accounting is untouched (TSTAT.cur is
// null: the triangles were counted when the builders drew them). Returns {before, after}.
function ysMergeHostMeshes(scene,groups){const by=new Map();let before=0;const cur=TSTAT.cur;TSTAT.cur=null;
 for(const G of groups){G.updateMatrixWorld(true);G.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.geometry||Array.isArray(o.material)||o.material.transparent||o.userData.probeSkip)return;
  const sig=o.material.uuid+'|'+Object.keys(o.geometry.attributes).sort().join(',');if(!by.has(sig))by.set(sig,{mat:o.material,list:[]});by.get(sig).list.push(o);before++;});}
 let after=0;for(const {mat,list} of by.values()){const geos=[];for(const o of list){const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);geos.push(g);o.parent.remove(o);}
  const m=meshMerged(geos,mat,scene);if(m){m.userData.own='hosts';after++;}}
 TSTAT.cur=cur;return {before,after};}
