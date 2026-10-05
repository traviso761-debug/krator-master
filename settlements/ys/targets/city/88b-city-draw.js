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
   floors:h.floors,ways:h.ways,sockets:h.sockets||null,noPlinth:true,   /* Travis: no restand plinths at all (they override the streets) */ring:h.wealth==='rich'?1:h.wealth==='middle'?2:3});
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
  for(const m of PLACE.moles){if(!m.plate)continue;const P=m.poly,y=m.y-(m.wall?.05:.12);
   if(m.star){const c=m.star,n=P.length;const ring=u=>{const f=((u%1)+1)%1*n;const i=Math.floor(f)%n,j=(i+1)%n,t=f-Math.floor(f);return [P[i][0]*(1-t)+P[j][0]*t,P[i][1]*(1-t)+P[j][1]*t];};
    const g=hykSurf((u,v)=>{const p=ring(u);return [c[0]+(p[0]-c[0])*v,y,c[1]+(p[1]-c[1])*v];},n*2,3,{col,flip:ysPlPolyArea(P)<0});
    {const pa=g.attributes.position.array,uv=g.attributes.uv.array;for(let i=0;i<uv.length/2;i++){uv[i*2]=pa[i*3]/4;uv[i*2+1]=pa[i*3+2]/4;}g.attributes.uv.needsUpdate=true;}   /* planar metre UVs: a fan's stretch radially */
    hykPutRaw('hkFloor',g);
    for(const f of m.stairs)hykSpanStairStraight(f.A,f.B,{w:2.4,rails:'both'});}
   else if(P.length===4){hykPutRaw('hkFloor',hykSurf((u,v)=>{const ax=P[0][0]+(P[1][0]-P[0][0])*u,az=P[0][1]+(P[1][1]-P[0][1])*u,bx=P[3][0]+(P[2][0]-P[3][0])*u,bz=P[3][1]+(P[2][1]-P[3][1])*u;return [ax+(bx-ax)*v,y,az+(bz-az)*v];},
     Math.max(2,Math.round(Math.hypot(P[1][0]-P[0][0],P[1][1]-P[0][1])/8)),Math.max(2,Math.round(Math.hypot(P[3][0]-P[0][0],P[3][1]-P[0][1])/8)),{col,uS:Math.hypot(P[1][0]-P[0][0],P[1][1]-P[0][1])/4,vS:Math.hypot(P[3][0]-P[0][0],P[3][1]-P[0][1])/4,flip:ysPlPolyArea(P)<0}));}
   if(!m.wall)continue;const cx=(m.x0+m.x1)/2,cz=(m.z0+m.z1)/2;
   for(let i=0;i<P.length;i++){let a=P[i],b=P[(i+1)%P.length];const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;const dx=b[0]-a[0],dz=b[1]-a[1];if((cx-mx)*(-dz)+(cz-mz)*dx>0){const t=a;a=b;b=t;}   /* the outward face to the right of a->b */
    hykHarbWall([a[0],a[1]],[b[0],b[1]],0,{top:m.y,col:wcol,batter:.35});nw++;}}
  TSTAT.cur=null;window._moles={plates:PLACE.moles.filter(m=>m.plate).length,walls:nw};}
 // the roads as ribbons (87c LAYOUT.roads): a plate of paving 22 cm over the ground along each run, sampled every 4 m
 // (the heightfield is linear between its 10 m vertices; the lift keeps the ribbon over a hollow); the two street
 // directions and the lanes and highways sit at slightly different lifts so their crossings do not fight
 {TSTAT.cur='roads/0';let n=0;const pc=hC(hPick(HPAL.barnacle),.86),hc=hC(hPick(HPAL.barnacle),.8);
  for(const r of LAYOUT.roads){const dx=r.b[0]-r.a[0],dz=r.b[1]-r.a[1],L=Math.hypot(dx,dz);if(L<6)continue;const tx=dx/L,tz=dz/L;
   const alongU=Math.abs(tx*LAYOUT.U[0]+tz*LAYOUT.U[1])>.9;const lift=r.kind==='highway'?.3:r.kind==='lane'?.18:alongU?.22:.26;const nu=Math.max(2,Math.round(L/4));
   hykPutRaw('hkFloor',hykSurf((u,v)=>{const x=r.a[0]+dx*u-tz*(v-.5)*r.w,z=r.a[1]+dz*u+tx*(v-.5)*r.w;let y=terrainH(x,z)+lift;if(y>-.4&&y<.4)y=y<0?-.4:.4;return [x,y,z];},nu,2,{col:r.kind==='highway'?hc:pc,uS:L/4,vS:r.w/4}));n++;}
  TSTAT.cur=null;window._roads=n;}
 // the bridge graph (88-city-spans): host to host, landing to landing; host to a mole's edge, a shore landing (a lily
 // pad on a stalk), the Citadel's bridge head or the Winds' stack top; mole to mole and mole to shore as walkways or
 // pontoons (a flight at each end); the Amphitriton's walkway and drawbridge. A bridge longer than 55 m gets piers
 // every ~40 m: fluted stalks from the bed to its underside (hykSpanStalk), none over a mole or the land
 {let nb=0;const land=(h,p)=>{const H=HOSTS.find(x=>x.n===h.n);const l=H&&H.landings.find(l=>Math.abs(Math.atan2(Math.sin(l.a-p.a),Math.cos(l.a-p.a)))<.03&&Math.abs(l.y-p.y)<3);
   if(l)return l;const r=h.rAt(p.y,p.a)+HYK.defs[p.key].w*.8;return {x:h.x+Math.cos(p.a)*r,y:p.y,z:h.z+Math.sin(p.a)*r,r:2.8};};
  const endOf=(E,toward)=>{if(E.host){const h=PLACE.hosts.find(x=>x.n===E.host);return land(h,h.pods[E.pod]);}
   if(E.kind==='amph'){const M=MARKS.filter(m=>m.kind==='door'&&m.key==='hyk_amphitriton'&&m.level==='L2').sort((p,q)=>Math.hypot(p.x-E.x,p.z-E.z)-Math.hypot(q.x-E.x,q.z-E.z))[0];if(M)return {x:M.x+M.nx*1.2,y:M.y,z:M.z+M.nz*1.2,r:0};}
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
   else if(S.kind==='cliffstair'){once('hyk_spiral_stair');const s=CITY.STACKS[S.stack];const col=hykSpanBone(),sc=hC(hPick(HPAL.shell));
    const rAt=(y,a)=>ysStackEdge(s,a)-8*clamp((y-S.gnd)/S.top,0,1)+3;   /* the wall's plan radius at that height, 3 m off for the heightfield's facets */
    hykSpanPad(S.head.x,S.head.y,S.head.z,2.6,{stalk:false,col:sc,rail:{a0:S.a0+Math.PI,gap:2.2},own:'Citadel cliff stair head'});
    const st=hykSpanStairSpiral(S.cx,S.cz,rAt,S.y0,S.y1,{a0:S.a0,dir:S.dir,w:1.3,col});
    const yb=terrainH(S.foot.x,S.foot.z)-.8;hykSpanPad(S.foot.x,S.foot.y+.3,S.foot.z,3.0,{col:sc,ground:yb,rail:{a0:st.a1+Math.PI,gap:2.4},lamp:{a:st.a1+Math.PI/2,cool:true,level:'wet'},own:'Citadel cliff stair foot'});
    const cs=Math.cos(st.a1),sn=Math.sin(st.a1);const f0=[S.cx+(st.r1+.1)*cs,st.y1-.02,S.cz+(st.r1+.1)*sn],f1=[S.foot.x-cs*2.4,S.foot.y+.3,S.foot.z-sn*2.4];
    hykPut('hkShell',hykDeck([f0,[(f0[0]+f1[0])/2,(f0[1]+f1[1])/2,(f0[2]+f1[2])/2],f1],1.4,{col:sc,camber:.04}));S.drawn=true;nb++;}
   else if(S.kind==='pontoon'){const A=S.A,B=S.B;const dx=B.x-A.x,dz=B.z-A.z,L=Math.hypot(dx,dz)||1;const tx=dx/L,tz=dz/L;const wet=.55;for(let k=0;k<Math.ceil(L/50);k++)once('hyk_pontoon');   /* its budget per 50 m */
    const A2={x:A.x+tx*6,y:wet,z:A.z+tz*6},B2={x:B.x-tx*6,y:wet,z:B.z-tz*6};hykSpanPontoon(A2,B2,{sea:-.45,own:'pontoon '+S.na+' – '+S.nb,level:'wet'});
    hykSpanStairStraight(A2,{x:A.x,y:A.y,z:A.z},{w:1.6,rails:'both'});hykSpanStairStraight(B2,{x:B.x,y:B.y,z:B.z},{w:1.6,rails:'both'});S.drawn=true;nb++;}
  }catch(e){reportErr('span '+S.kind+' '+e.stack);}}
  TSTAT.cur=null;window._spans={built:nb,of:SPANS.list.length,refused:SPANS.refused.length,piers:np,shore:SPANS.shore,nodes:SPANS.nodes.length};}
 // the river's water (Travis: the river did not read as running the map): each pool of the terraced bed (84 ysRiverProfile:
 // a flat bed between two rimstone lips) gets a sheet of the sea's water at its lip's height less 10 cm, a ribbon along
 // the centre line 1.8 widths wide (the banks hide its edges); below the sea's level the sea sheet takes over
 {TSTAT.cur='river/0';const pr=ysRiverProfile(),R=CITY.RIVER;const at=s=>{let e=pr.seg[pr.seg.length-1];for(const q of pr.seg)if(s<=q.s0+q.L){e=q;break;}const t=e.L?(s-e.s0)/e.L:0;return [e.a[0]+(e.b[0]-e.a[0])*t,e.a[1]+(e.b[1]-e.a[1])*t,(e.b[0]-e.a[0])/e.L,(e.b[1]-e.a[1])/e.L];};
  let k=0,n=0;while(k<pr.bed.length){let k1=k;while(k1+1<pr.bed.length&&pr.bed[k1+1]===pr.bed[k])k1++;const y=pr.bed[k]+R.rise*.55-.1;
   if(y>.1){const pos=[],idx=[];let q=0;for(let j=k;j<=k1+1&&j<pr.bed.length;j++){const s=Math.min(j*pr.DS,pr.len);const [x,z,tx,tz]=at(s);const w=(R.w0+(R.w1-R.w0)*clamp(s/pr.len,0,1))*.9;
     pos.push(x-tz*w,y,z+tx*w,x+tz*w,y,z-tx*w);if(j>k){idx.push(q-2,q,q-1,q-1,q,q+1);}q+=2;}
    if(idx.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,MAT.pkSea);m.name='river pool';m.userData.probeSkip=true;m.renderOrder=1;scene.add(m);n++;const tc=tcur();if(tc){tc.tris+=idx.length/3;tc.meshes++;}}}
   k=k1+1;}
  TSTAT.cur=null;window._river={pools:n,len:Math.round(pr.len)};}
 // the karst's dressing (Travis's cards, through the library adapter 79z): jungle clumps on every field stack's crown (two
 // crossed quads each, their feet on the crown) and vines hung over the rim of its wall, facing outward; one mesh per
 // card. Not on a landmark's stack (its building takes the top). Positions from KRAND, so the dressing is the same in
 // any engine; ?mat=proc has no cards and draws none
 if(typeof YS_MATLIB!=='undefined'&&YS_MATLIB.cards.clump.length&&typeof KARST!=='undefined'){TSTAT.cur='karst cards/0';const st=KRAND.stream(KRAND.child(KARST.SEED,'dress'));const C=YS_MATLIB.cards;
  const G={};const quad=(key,cx,y0,cz,w,h,phi)=>{const g=G[key]||(G[key]={pos:[],uv:[],nor:[]});const ux=-Math.sin(phi),uz=Math.cos(phi),nx=Math.cos(phi),nz=Math.sin(phi);
   const P=[[cx-ux*w/2,y0,cz-uz*w/2,0,0],[cx+ux*w/2,y0,cz+uz*w/2,1,0],[cx+ux*w/2,y0+h,cz+uz*w/2,1,1],[cx-ux*w/2,y0+h,cz-uz*w/2,0,1]];
   for(const i of [0,1,2,0,2,3]){g.pos.push(P[i][0],P[i][1],P[i][2]);g.uv.push(P[i][3],P[i][4]);g.nor.push(nx,0,nz);}};
  let nc=0,nv=0;for(const s of CITY.STACKS){if(s.flat)continue;const e=s.e||1,a=s.a||0,ca=Math.cos(a),sa=Math.sin(a);
   const n=clamp(Math.round(s.r*e*s.r/350),3,14);for(let k=0;k<n;k++){const t=st.range(0,TAU),rr=Math.sqrt(st.next())*.72;const u=rr*Math.cos(t)*s.r*e,v=rr*Math.sin(t)*s.r;const x=s.x+u*ca-v*sa,z=s.z+u*sa+v*ca;
    const y=terrainH(x,z);if(y<2)continue;const w=st.range(6,13),phi=st.range(0,TAU),key='clump'+st.int(0,C.clump.length-1);quad(key,x,y-.3,z,w,w*1.05,phi);quad(key,x,y-.3,z,w,w*1.05,phi+Math.PI/2);nc++;}
   const m=clamp(Math.round(TAU*s.r*(1+e)/2/28),3,10);for(let k=0;k<m;k++){const phi=st.range(0,TAU);const edge=ysStackEdge(s,phi);const top=terrainH(s.x+Math.cos(phi)*(edge-5),s.z+Math.sin(phi)*(edge-5));if(top<6)continue;
    const r=edge+2.6;const h=st.range(9,18),w=st.range(5,9);quad('vine'+st.int(0,C.vine.length-1),s.x+Math.cos(phi)*r,top-1.5-h,s.z+Math.sin(phi)*r,w,h,phi);nv++;}}
  for(const key in G){const g=G[key];const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(g.pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(g.nor,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(g.uv,2));
   const t=C[key.replace(/\d+$/,'')][+key.match(/\d+$/)[0]];const mat=new THREE.MeshStandardMaterial({map:t,alphaTest:.42,side:THREE.DoubleSide,roughness:.9,metalness:0});if(typeof portUWsh==='function'){mat.onBeforeCompile=portUWsh;mat.customProgramCacheKey=()=>'yscard';}
   const mesh=new THREE.Mesh(geo,mat);mesh.name='karst-'+key;mesh.userData.probeSkip=true;scene.add(mesh);const tc=tcur();if(tc){tc.tris+=g.pos.length/9;tc.meshes++;}}
  TSTAT.cur=null;window._karstCards={clumps:nc,vines:nv,meshes:Object.keys(G).length};}
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
