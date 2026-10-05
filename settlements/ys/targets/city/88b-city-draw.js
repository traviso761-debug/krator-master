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
   floors:h.floors,ways:h.ways,sockets:h.sockets||null,noPlinth:!!h.noPlinth,ring:h.wealth==='rich'?1:h.wealth==='middle'?2:3});
  if(!host){fail++;return;}
  // the floors table runs to the top of what stands, not on into the sky over a full tower
  h.G=host.G;host.floors=host.floors.filter(f=>f.y<h.top+2);host.full=h.full;host.shaped=h.shaped;host.rec=h;h.drawn=true;
  reseed(32100+i);hykTideline(host);
  for(const p of h.pods){once(p.key);const hp=p.core?Object.create(host,{x:{value:p.cx},z:{value:p.cz},rAt:{value:()=>p.cr}}):host;   /* a socket pod is framed on its own core */
   const G=HYK.placeOn(scene,p.key,hp,{y:p.y,a:p.a,level:p.level,into:p.into});if(G)p.drawn=true;else fail++;}
  TSTAT.cur=null;});
 // the moles (88 ysPlMole): a plate at the datum less 12 cm over the whole polygon (the terrain's fill is 30 cm under
 // it, so nothing built on the mole fights the ground) and, round a walled one, a shell quay wall down to the bed on
 // every edge (hykHarbWall, world frame: HYK.cur is null here), its outward face found from the polygon's centroid
 {reseed(32395);TSTAT.cur='mole quay/0';let nw=0;const col=hC(hPick(HPAL.shellWarm)),wcol=hC(hPick(HPAL.shell));
  for(const m of PLACE.moles){if(!m.plate)continue;const P=m.poly,y=m.y-.12;
   if(P.length===4){hykPutRaw('hkFloor',hykSurf((u,v)=>{const ax=P[0][0]+(P[1][0]-P[0][0])*u,az=P[0][1]+(P[1][1]-P[0][1])*u,bx=P[3][0]+(P[2][0]-P[3][0])*u,bz=P[3][1]+(P[2][1]-P[3][1])*u;return [ax+(bx-ax)*v,y,az+(bz-az)*v];},
     Math.max(2,Math.round(Math.hypot(P[1][0]-P[0][0],P[1][1]-P[0][1])/8)),Math.max(2,Math.round(Math.hypot(P[3][0]-P[0][0],P[3][1]-P[0][1])/8)),{col,uS:Math.hypot(P[1][0]-P[0][0],P[1][1]-P[0][1])/4,vS:Math.hypot(P[3][0]-P[0][0],P[3][1]-P[0][1])/4,flip:ysPlPolyArea(P)<0}));}
   if(!m.wall)continue;const cx=(m.x0+m.x1)/2,cz=(m.z0+m.z1)/2;
   for(let i=0;i<P.length;i++){let a=P[i],b=P[(i+1)%P.length];const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;const dx=b[0]-a[0],dz=b[1]-a[1];if((cx-mx)*(-dz)+(cz-mz)*dx>0){const t=a;a=b;b=t;}   /* the outward face to the right of a->b */
    hykHarbWall([a[0],a[1]],[b[0],b[1]],0,{top:y+.12,col:wcol,batter:.35});nw++;}}
  TSTAT.cur=null;window._moles={plates:PLACE.moles.filter(m=>m.plate).length,walls:nw};}
 // the roads as ribbons (87c LAYOUT.roads): a plate of paving 22 cm over the ground along each run, sampled every 4 m
 // (the heightfield is linear between its 10 m vertices; the lift keeps the ribbon over a hollow); the two street
 // directions and the lanes and highways sit at slightly different lifts so their crossings do not fight
 {TSTAT.cur='roads/0';let n=0;const pc=hC(hPick(HPAL.barnacle),.86),hc=hC(hPick(HPAL.barnacle),.8);
  for(const r of LAYOUT.roads){const dx=r.b[0]-r.a[0],dz=r.b[1]-r.a[1],L=Math.hypot(dx,dz);if(L<6)continue;const tx=dx/L,tz=dz/L;
   const alongU=Math.abs(tx*LAYOUT.U[0]+tz*LAYOUT.U[1])>.9;const lift=r.kind==='highway'?.3:r.kind==='lane'?.18:alongU?.22:.26;const nu=Math.max(2,Math.round(L/4));
   hykPutRaw('hkFloor',hykSurf((u,v)=>{const x=r.a[0]+dx*u-tz*(v-.5)*r.w,z=r.a[1]+dz*u+tx*(v-.5)*r.w;return [x,terrainH(x,z)+lift,z];},nu,2,{col:r.kind==='highway'?hc:pc,uS:L/4,vS:r.w/4}));n++;}
  TSTAT.cur=null;window._roads=n;}
 // the bridge graph (88-city-spans): host to host, landing to landing; host to a mole's edge, a shore landing (a lily
 // pad on a stalk), the Citadel's bridge head or the Winds' stack top; mole to mole and mole to shore as walkways or
 // pontoons (a flight at each end); the Amphitriton's walkway and drawbridge. A bridge longer than 55 m gets piers
 // every ~40 m: fluted stalks from the bed to its underside (hykSpanStalk), none over a mole or the land
 {let nb=0;const land=(h,p)=>{const H=HOSTS.find(x=>x.n===h.n);const l=H&&H.landings.find(l=>Math.abs(Math.atan2(Math.sin(l.a-p.a),Math.cos(l.a-p.a)))<.03&&Math.abs(l.y-p.y)<3);
   if(l)return l;const r=h.rAt(p.y,p.a)+HYK.defs[p.key].w*.8;return {x:h.x+Math.cos(p.a)*r,y:p.y,z:h.z+Math.sin(p.a)*r,r:2.8};};
  const endOf=(E,toward)=>{if(E.host){const h=PLACE.hosts.find(x=>x.n===E.host);return land(h,h.pods[E.pod]);}
   if(E.kind==='citadel'){const d=NAV_EXTRA.find(d=>d.own==='Citadel bridge head');if(d)return {x:(d.x0+d.x1)/2,y:d.y,z:(d.z0+d.z1)/2,r:3.2};}
   if(E.pad){once('hyk_lilypad');const tx=toward.x-E.x,tz=toward.z-E.z;hykSpanLilypad(E.x,E.y,E.z,3.4,{rail:{a0:Math.atan2(tz,tx),gap:1.2},level:'quay',own:'shore landing'});return {x:E.x,y:E.y,z:E.z,r:3.4};}
   return {x:E.x,y:E.y,z:E.z,r:E.r||0};};
  const piers=(br,P0,P1,lv)=>{const L=Math.hypot(P1.x-P0.x,P1.z-P0.z);if(L<55)return 0;const n=Math.floor(L/40);let k=0;const col=hC(hPick(HPAL.shell));
   for(let i=1;i<=n;i++){const t=i/(n+1);const x=P0.x+(P1.x-P0.x)*t,z=P0.z+(P1.z-P0.z)*t;const pt=br.pts[Math.round(t*(br.pts.length-1))];const top=pt[1]-.45;const g=terrainH(x,z);
    if(g>1||ysPlH(x,z)>1||top-(g-.8)<3)continue;hykSpanStalk(x,z,top,g-.8,lv==='L2'?3.0:2.4,{col});k++;}return k;};
  let np=0;for(const S of SPANS.list){try{
   if(S.kind==='bridge'){const la=endOf(S.a,S.b.host?PLACE.hosts.find(x=>x.n===S.b.host):S.b),lb=endOf(S.b,la);
    const dx=lb.x-la.x,dz=lb.z-la.z,dl=Math.hypot(dx,dz)||1;const P0={x:la.x+dx/dl*la.r*.6,y:la.y,z:la.z+dz/dl*la.r*.6},P1={x:lb.x-dx/dl*lb.r*.6,y:lb.y,z:lb.z-dz/dl*lb.r*.6};
    once(S.level==='L2'?'hyk_span_l2':'hyk_span_l1');const br=(S.level==='L2'?hykSpanBridgeL2:hykSpanBridgeL1)(P0,P1,{own:'bridge '+S.na+' – '+S.nb,level:S.level});S.piers=piers(br,P0,P1,S.level);np+=S.piers;S.drawn=true;nb++;}
   else if(S.kind==='drawbridge'){once('hyk_drawbridge');hykSpanDrawbridge(S.A,S.B,{own:'the Amphitriton drawbridge',level:'L1'});S.drawn=true;nb++;}
   else if(S.kind==='walkway'){once('hyk_walkway');hykSpanWalkway(S.A,S.B,{own:'walkway '+S.na+' – '+S.nb,level:'quay'});S.drawn=true;nb++;}
   else if(S.kind==='pontoon'){const A=S.A,B=S.B;const dx=B.x-A.x,dz=B.z-A.z,L=Math.hypot(dx,dz)||1;const tx=dx/L,tz=dz/L;const wet=.55;for(let k=0;k<Math.ceil(L/50);k++)once('hyk_pontoon');   /* its budget per 50 m */
    const A2={x:A.x+tx*6,y:wet,z:A.z+tz*6},B2={x:B.x-tx*6,y:wet,z:B.z-tz*6};hykSpanPontoon(A2,B2,{sea:-.45,own:'pontoon '+S.na+' – '+S.nb,level:'wet'});
    hykSpanStairStraight(A2,{x:A.x,y:A.y,z:A.z},{w:1.6,rails:'both'});hykSpanStairStraight(B2,{x:B.x,y:B.y,z:B.z},{w:1.6,rails:'both'});S.drawn=true;nb++;}
  }catch(e){reportErr('span '+S.kind+' '+e.stack);}}
  TSTAT.cur=null;window._spans={built:nb,of:SPANS.list.length,refused:SPANS.refused.length,piers:np,shore:SPANS.shore,nodes:SPANS.nodes.length};}
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
