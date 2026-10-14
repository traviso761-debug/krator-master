// ================================================================= YS CITY — the DRAW pass: the records of 88 built (PLAN.md P3 step 6; GODOT.md item 5)
// Reads PLACE and nothing else decides: the free-standing defs through HYK.place, the hosts through ysPlaceHost (cut,
// sunk, holed for their ways in), the tideline on each, and every pod through HYK.placeOn at the plate and bearing its
// record names. A slot (the foreign quarter, the land quarter's reclaimed Ancients) draws nothing: its builder is not in
// this build yet. The draw code's own scatter (the tideline's weed and specks, the builders' detail) is the lineage's
// stream, reseeded per host here (seeds 32100 + the host's index, below 32400); where things stand came from KRAND.
// draw fn() in a frame at (x, y, z) turned ry, outside any building: the kit items through the group transform, the shell
// buckets through HYK.cur's matrix, the way HYK.place frames a builder (the span helpers draw in the current frame)
function ysInFrame(x,y,z,ry,fn){const G=new THREE.Group();G.position.set(x,y,z);G.rotation.y=ry;G.updateMatrix();G.updateMatrixWorld(true);
 const prev=HYK.cur;HYK.cur={G,x,z,ry,o:{y,scale:1}};KOFF=[0,0,0];useGroupXF(G);try{fn();}catch(e){reportErr('ysInFrame '+e.stack);}endGroupXF();HYK.cur=prev;}
// the drawn terrain's height at (x, z): the port terrain's tensor grid (PORT_ST.grid, 71-port-terrain) interpolated the
// way its mesh is triangulated (each cell split on the diagonal from (i+1, j) to (i, j+1)), so a ribbon laid on it
// follows the triangles and not terrainH's curve between the grid lines (Oct 12 2026: the roads floated over hollows)
function ysMeshH(x,z){const G=typeof PORT_ST!=='undefined'&&PORT_ST.grid;if(!G)return terrainH(x,z);const {xs,zs,H,nx}=G;
 const find=(A,v)=>{let lo=0,hi=A.length-2;if(v<=A[0])return 0;if(v>=A[hi+1])return hi;while(lo<hi){const m=(lo+hi+1)>>1;if(A[m]<=v)lo=m;else hi=m-1;}return lo;};
 const i=find(xs,x),j=find(zs,z);const fx=clamp((x-xs[i])/(xs[i+1]-xs[i]),0,1),fz=clamp((z-zs[j])/(zs[j+1]-zs[j]),0,1);
 const a=H[j*nx+i],b=H[j*nx+i+1],c=H[(j+1)*nx+i],d=H[(j+1)*nx+i+1];
 return fx+fz<=1?a+(b-a)*fx+(c-a)*fz:d+(c-d)*(1-fx)+(b-d)*(1-fz);}
// a plate faces up whatever its polygon's winding: the first face's normal decides, and the indices are reversed if it points down
function ysFaceUp(g){const p=g.attributes.position.array,ix=g.index.array;let ny=0;for(let t=0;t<ix.length&&t<60;t+=3){const a=ix[t]*3,b=ix[t+1]*3,c=ix[t+2]*3;const ux=p[b]-p[a],uy=p[b+1]-p[a+1],uz=p[b+2]-p[a+2],vx=p[c]-p[a],vy=p[c+1]-p[a+1],vz=p[c+2]-p[a+2];ny+=uz*vx-ux*vz;}
 if(ny<0){for(let t=0;t<ix.length;t+=3){const k=ix[t+1];ix[t+1]=ix[t+2];ix[t+2]=k;}g.index.needsUpdate=true;g.computeVertexNormals();}return g;}
YS_BUILD.push(function(scene){const t0=performance.now();let fail=0;
 const once=k=>{TSTAT.cur=k+'/0';const t=tcur();t.n=(t.n||0)+1;};   // per-placement budgets (91-ys-probe typeStats)
 for(const r of PLACE.blds){once(r.key);const G=HYK.place(scene,r.key,r.x,r.z,r.ry,{y:r.y,v:r.v,sink:r.sink});   /* sink: the Wet Cells' rock reaches the bed */if(!G)fail++;else r.drawn=true;}
 TSTAT.cur=null;
 PLACE.hosts.forEach((h,i)=>{const T=YS_HOST_TYPES[h.type];const builder=typeof window[T.builder]==='function'?window[T.builder]:null;
  if(!builder){reportErr('host type '+h.type+' has no builder '+T.builder);return;}
  const host=ysPlaceHost(scene,{key:T.key,builder,x:h.x,z:h.z,y:h.sink,ry:h.ry,d:h.d,cutY:h.cutY,podium:h.podium,cap:h.cap,rAt:h.rAt,name:h.n,
   floors:h.floors,ways:h.ways,sockets:h.sockets||null,pods:h.pods,noPlinth:true,   /* Travis: no restand plinths at all (they override the streets) */ring:h.wealth==='rich'?1:h.wealth==='middle'?2:3});
  if(!host){fail++;return;}
  // the floors table runs to the top of what stands, not on into the sky over a full tower
  h.G=host.G;host.floors=host.floors.filter(f=>f.y<h.top+2);host.full=h.full;host.shaped=h.shaped;host.rec=h;host.shelf=!!T.crest;h.drawn=true;   /* shelf: pods stand on trays (62 HYK.placeOn) */
  reseed(32100+i);hykTideline(host);
  for(const p of h.pods){once(p.key);const hp=p.core?Object.create(host,{x:{value:p.cx},z:{value:p.cz},rAt:{value:()=>p.cr}}):host;   /* a socket pod is framed on its own core */
   const G=HYK.placeOn(scene,p.key,hp,{y:p.y,a:p.a,level:p.level,into:p.into});if(G)p.drawn=true;else fail++;}
  TSTAT.cur=null;});
 // the ruins in the east shallows (88 PLACE.ruins; 64b ysPlaceRuin): the kit's builder at its ruined state, on the bed
 for(const r of (PLACE.ruins||[])){if(typeof ysPlaceRuin!=='function'){fail++;continue;}const R=ysPlaceRuin(scene,{key:r.key,builder:r.builder,x:r.x,z:r.z,ry:r.ry,d:r.d,sink:r.sink,name:r.name});if(R){r.drawn=true;r.G=R.G;}else fail++;}
 // the moles (88 ysPlMole): a plate at the datum less 12 cm over the whole polygon (the terrain's fill is 30 cm under
 // it, so nothing built on the mole fights the ground) and, round a walled one, a shell quay wall down to the bed on
 // every edge (hykHarbWall, world frame: HYK.cur is null here), its outward face found from the polygon's centroid
 {reseed(32395);TSTAT.cur='mole quay/0';let nw=0;const nq={bollards:0,ladders:0};
  const feet=[];for(const S of SPANS.list)for(const E of [S.A,S.B,S.kind==='bridge'?S.b:null])if(E&&E.x!=null)feet.push([E.x,E.z]);   /* a span's ends on a mole: no ladder in their way */const col=hC(hPick(HPAL.shellWarm)),wcol=hC(hPick(HPAL.shell));
  for(const m of PLACE.moles){if(!m.plate)continue;const P=m.poly,y=m.y-(m.wall?.05:.12);
   if(m.star){const c=m.star,n=P.length;const ring=u=>{const f=((u%1)+1)%1*n;const i=Math.floor(f)%n,j=(i+1)%n,t=f-Math.floor(f);return [P[i][0]*(1-t)+P[j][0]*t,P[i][1]*(1-t)+P[j][1]*t];};
    const g=hykSurf((u,v)=>{const p=ring(u);return [c[0]+(p[0]-c[0])*v,y,c[1]+(p[1]-c[1])*v];},n*2,3,{col});
    {const pa=g.attributes.position.array,uv=g.attributes.uv.array;for(let i=0;i<uv.length/2;i++){uv[i*2]=pa[i*3]/4;uv[i*2+1]=pa[i*3+2]/4;}g.attributes.uv.needsUpdate=true;}   /* planar metre UVs: a fan's stretch radially */
    hykPutRaw('hkFloor',ysFaceUp(g));
    for(const f of m.stairs)hykSpanStairStraight(f.A,f.B,{w:2.4,rails:'both'});}
   else if(P.length===4){hykPutRaw('hkFloor',ysFaceUp(hykSurf((u,v)=>{const ax=P[0][0]+(P[1][0]-P[0][0])*u,az=P[0][1]+(P[1][1]-P[0][1])*u,bx=P[3][0]+(P[2][0]-P[3][0])*u,bz=P[3][1]+(P[2][1]-P[3][1])*u;return [ax+(bx-ax)*v,y,az+(bz-az)*v];},
     Math.max(2,Math.round(Math.hypot(P[1][0]-P[0][0],P[1][1]-P[0][1])/8)),Math.max(2,Math.round(Math.hypot(P[3][0]-P[0][0],P[3][1]-P[0][1])/8)),{col,uS:Math.hypot(P[1][0]-P[0][0],P[1][1]-P[0][1])/4,vS:Math.hypot(P[3][0]-P[0][0],P[3][1]-P[0][1])/4,flip:false})));}
   if(!m.wall)continue;const cx=(m.x0+m.x1)/2,cz=(m.z0+m.z1)/2;let run=0;
   for(let i=0;i<P.length;i++){let a=P[i],b=P[(i+1)%P.length];const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;const dx=b[0]-a[0],dz=b[1]-a[1];if((cx-mx)*(-dz)+(cz-mz)*dx>0){const t=a;a=b;b=t;}   /* the outward face to the right of a->b */
    hykHarbWall([a[0],a[1]],[b[0],b[1]],0,{top:m.y,col:wcol,batter:.35});nw++;
    // the quay's furniture (Oct 12 2026): a shell bollard every 16 m, .9 m in from the edge, and a bone ladder from under
    // the water up the wall's face every 55 m of the mole's edge, not within 9 m of a pier's or a span's foot
    {const L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,tx=(b[0]-a[0])/L,tz=(b[1]-a[1])/L,nx=-tz,nz=tx;
     for(let s=5;s<L-4;s+=16){const x=a[0]+tx*s-nx*.9,z=a[1]+tz*s-nz*.9;kput('hkPost',[x,m.y+.32,z],null,[.2,.64,.2],wcol);kput('hkBall',[x,m.y+.66,z],null,[.34,.2,.34],wcol);nq.bollards++;}
     for(let s=(55-run%55);s<L-3;s+=55){const x=a[0]+tx*s+nx*.45,z=a[1]+tz*s+nz*.45;
      if(PLACE.blds.some(r=>(r.key==='hyk_pier'||r.key==='hyk_quay')&&Math.hypot(r.x-x,r.z-z)<9)||feet.some(f=>Math.hypot(f[0]-x,f[1]-z)<9))continue;
      ysInFrame(x,0,z,Math.atan2(nx,nz),()=>hykSpanLadder(0,0,-1.1,m.y,{col:wcol}));nq.ladders++;ysPlCount('hyk_ladder');}
     run+=L;}}}
  TSTAT.cur=null;window._moles={plates:PLACE.moles.filter(m=>m.plate).length,walls:nw,bollards:nq.bollards,ladders:nq.ladders};}
 // the roads as ribbons (87c LAYOUT.roads): a plate of paving 8-16 cm over the drawn terrain mesh (ysMeshH) along each
 // run, sampled every 2.5 m; the two street directions and the lanes and highways sit at slightly different lifts so
 // their crossings do not fight
 {TSTAT.cur='roads/0';let n=0;const pc=hC(hPick(HPAL.barnacle),.86),hc=hC(hPick(HPAL.barnacle),.8);
  for(const r of LAYOUT.roads){const dx=r.b[0]-r.a[0],dz=r.b[1]-r.a[1],L=Math.hypot(dx,dz);if(L<6)continue;const tx=dx/L,tz=dz/L;
   const alongU=Math.abs(tx*LAYOUT.U[0]+tz*LAYOUT.U[1])>.9;const lift=r.kind==='highway'?.16:r.kind==='lane'?.08:alongU?.11:.13;const nu=Math.max(2,Math.round(L/2.5));
   hykPutRaw('hkFloor',hykSurf((u,v)=>{const x=r.a[0]+dx*u-tz*(v-.5)*r.w,z=r.a[1]+dz*u+tx*(v-.5)*r.w;let y=Math.max(ysMeshH(x,z),ysMeshH(x+tx*1.25,z+tz*1.25),ysMeshH(x-tx*1.25,z-tz*1.25))+lift;   /* on the drawn mesh, over the higher of the sample and its neighbours half a step either way */if(y>-.4&&y<.4)y=y<0?-.4:.4;return [x,y,z];},nu,2,{col:r.kind==='highway'?hc:pc,uS:L/4,vS:r.w/4}));n++;}
  // the drowned grid's canal streets (Oct 12 2026): the Ancients' paving on the bed, weed-dark, 12 cm over the drawn mesh,
  // in runs broken wherever a host, a ruin's site or a mole stands on it (nothing pokes through a plate or an apron)
  let nc=0;const cc=new THREE.Color(0x56604f),cd=new THREE.Color(0x4a5244);
  const blocked=(x,z)=>{const P={cx:x,cz:z,hw:.1,hd:.1,ry:0,ux:[1,0],uz:[0,1],r:.15};
   if(PLACE.hosts.some(h=>!h.land&&Math.hypot(h.x-x,h.z-z)<h.cap.hw*.85))return true;
   if((PLACE.ruins||[]).some(r=>ysPlHit(P,r.site||r.box)))return true;
   return PLACE.moles.some(m=>x>=m.x0&&x<=m.x1&&z>=m.z0&&z<=m.z1&&ysPlInPoly(m.poly,x,z));};
  for(const r of LAYOUT.streets){if(r.kind!=='canal')continue;const dx=r.b[0]-r.a[0],dz=r.b[1]-r.a[1],L=Math.hypot(dx,dz);if(L<6)continue;const tx=dx/L,tz=dz/L;
   const N=Math.ceil(L/4),ok=[];for(let k=0;k<=N;k++){const x=r.a[0]+dx*k/N,z=r.a[1]+dz*k/N;ok.push(!blocked(x,z)&&ysMeshH(x,z)<-.6);}
   for(let k0=0;k0<N;){if(!ok[k0]||!ok[k0+1]){k0++;continue;}let k1=k0+1;while(k1<N&&ok[k1+1])k1++;
    const u0=k0/N,u1=k1/N,nu=Math.max(2,Math.round((u1-u0)*L/2.5));
    hykPutRaw('hkFloor',hykSurf((u,v)=>{const t=u0+(u1-u0)*u,x=r.a[0]+dx*t-tz*(v-.5)*r.w,z=r.a[1]+dz*t+tx*(v-.5)*r.w;return [x,ysMeshH(x,z)+.12,z];},nu,2,{col:(nc%3?cc:cd),uS:(u1-u0)*L/4,vS:r.w/4}));nc++;k0=k1;}}
  TSTAT.cur=null;window._roads=n;window._canals=nc;}
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
    /* the face as drawn (Oct 12 2026: the analytic wall less 8 m and 3 m out left the stair floating where the heightfield's
       10 m facets lean the face): marching out from 24 m inside the analytic edge, the first radius where the drawn mesh
       falls below the tread, .6 m off it; the analytic estimate where the march finds nothing */
    const rAt0=(y,a)=>ysStackEdge(s,a)-8*clamp((y-S.gnd)/S.top,0,1)+3;
    const rAt=(y,a)=>{const e=ysStackEdge(s,a),c=Math.cos(a),n=Math.sin(a);for(let r=e-24;r<e+16;r+=.4)if(ysMeshH(S.cx+r*c,S.cz+r*n)<y-.25)return r+.6;return rAt0(y,a);};
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
 var YS_RIVER=null;   // the river's core/water flow (below)
 // the river's water (Travis: the river did not read as running the map): each pool of the terraced bed (84 ysRiverProfile:
 // a flat bed between two rimstone lips) gets a sheet of the sea's water at its lip's height less 10 cm, a ribbon along
 // the centre line 1.8 widths wide (the banks hide its edges); below the sea's level the sea sheet takes over
 {TSTAT.cur='river/0';const pr=ysRiverProfile(),R=CITY.RIVER;const at=s=>{let e=pr.seg[pr.seg.length-1];for(const q of pr.seg)if(s<=q.s0+q.L){e=q;break;}const t=e.L?(s-e.s0)/e.L:0;return [e.a[0]+(e.b[0]-e.a[0])*t,e.a[1]+(e.b[1]-e.a[1])*t];};
  // one continuous strip down the river: a vertex pair every sample, across the averaged tangent (no gap at a bend), at
  // the pool's water level; where the bed steps down at a lip the pair is laid twice, at the upper and the lower level,
  // so the surface falls vertically there; it ends where the sea's own sheet takes over
  // the level: the pool's (bed + 55 % of the rise, the lip's height less 25 cm) or, where the heightfield's cells have not
  // carved the valley to the bed, 25 cm over the drawn mesh (ysMeshH) under the strip's middle (the highest of three
  // samples inside the bed's flat, at this sample and its neighbours), so the water is never buried
  const N=pr.bed.length,pos=[],idx=[];let q=0,pools=1;const lvl=k=>pr.bed[k]+R.rise*.55-.25;
  const geo=k=>{const s=Math.min(k*pr.DS,pr.len);const [x,z]=at(s);const [x0,z0]=at(Math.max(0,s-pr.DS)),[x1,z1]=at(Math.min(pr.len,s+pr.DS));let tx=x1-x0,tz=z1-z0;const l=Math.hypot(tx,tz)||1;return {x,z,tx:tx/l,tz:tz/l,w:(R.w0+(R.w1-R.w0)*clamp(s/pr.len,0,1))*.95};};   /* wide enough that its edges bury in the banks (84 ysRiverY: steep by the channel) */
  const mesh=k=>{const g=geo(k),f=.3;return Math.max(ysMeshH(g.x,g.z),ysMeshH(g.x-g.tz*g.w*f,g.z+g.tx*g.w*f),ysMeshH(g.x+g.tz*g.w*f,g.z-g.tx*g.w*f));};   /* sampled inside the bed's flat, not on the banks: at the strip's edge the bank lifted the water to a lid over the valley */
  const floor=k=>{let m=-1e9;for(let j=-1;j<=1;j++){const q2=k+j;if(q2>=0&&q2<N)m=Math.max(m,mesh(q2));}return m+.25;};   /* the drawn mesh, the neighbouring samples only: three either side lifted the water to the ground 30 m upstream */
  const level=k=>Math.max(lvl(k),floor(k));
  // since 2026-10-13 the strip is core/water's FLOW (Phase 3; core/water/README.md "Flow and falls"): the same line, a point
  // every sample at its pool's level, and at each lip a point 0.6 m upstream at the upper level, so the ribbon drops the
  // terrace's rise over 0.6 m (a step the flow shader whitens: its slope is the rapids' far end); the ripples are carried
  // down the current; WATER.heightAt and WATER.flowAt read it, core/export carries it (YS_RIVER)
  const fp=[],fw=[];
  for(let k=0;k<N;k++){if(lvl(k)<=-3)continue;   /* the strip starts 3 m under the sea's sheet at the mouth, so it emerges from under it rather than beginning in the open */const y=level(k),g=geo(k);
   if(fp.length&&pr.bed[k]!==pr.bed[k-1]){fp.push([g.x-g.tx*.6,g.z-g.tz*.6,Math.max(level(k-1),y)]);fw.push(2*g.w);pools++;}fp.push([g.x,g.z,y]);fw.push(2*g.w);}
  if(fp.length>1){YS_RIVER=WATER.flow({name:'The river',pts:fp,width:fw,speed:.7});const c=new THREE.Color(PORT_SEA_COL[0]);
   const D=WATER.drawFlow(YS_RIVER,{scene,shallow:c.clone().lerp(new THREE.Color(0x6aa49a),.45),deep:c,roughness:.14,metalness:.05,envMapIntensity:.45,step:8,across:4,margin:0,renderOrder:1});
   D.mesh.name='river';const tc=tcur();if(tc){tc.tris+=D.ribbon.idx.length/3;tc.meshes++;}}
  TSTAT.cur=null;window._river={pools,len:Math.round(pr.len),flow:fp.length};}
 // (the karst's card dressing, Travis's clump and vine cards, was drawn here until the biome was bound: 89-city-biome.js dresses
 // the faces and plants the tops now; the sets stay in the library)
 window._karstCards={clumps:0,vines:0,meshes:0};
 // the subdivided floors (88a): the partitions as thin shell walls in the interior bucket, both faces; the floors marked
 reseed(32390);const wc=hC(hPick(HPAL.shell),.92);let nw=0;
 for(const P of FLOORS.plans){const cs=Math.cos(P.ry),sn=Math.sin(P.ry);const W=(lx,lz)=>[P.hx+lx*cs+lz*sn,P.hz-lx*sn+lz*cs];const y0=P.y+.3;
  for(const w of P.walls){const f=w.arc?(u,v)=>{const th=u*TAU;const p=W(w.cx+w.r*Math.cos(th),w.cz+w.r*Math.sin(th));return [p[0],y0+v*P.H,p[1]];}
    :(u,v)=>{const r=w.r0+(w.r1-w.r0)*u;const p=W(w.cx+r*Math.cos(w.th),w.cz+r*Math.sin(w.th));return [p[0],y0+v*P.H,p[1]];};
   const nu=w.arc?Math.max(16,Math.round(w.r*1.2)):1;for(const flip of [false,true])hykPutRaw('hkIn',hykSurf(f,nu,1,{col:wc,flip,uS:4,vS:1}),true);nw++;}
  const host=HOSTS.find(x=>x.n===P.host);if(host){const fl=host.floors.find(f=>Math.abs(f.y-P.y)<.6);if(fl){fl.kind='inhabited';fl.use=Math.max(fl.use||0,.5);fl.rooms=P.rooms;}}}
 // the newel stairs between the inhabited floors (88a FLOORS.stairs): a fluted newel up the core's axis and a spiral of
 // treads round it, inside the core's radius, from the upper floor down to the lower (bare: the newel carries it, so none of
 // the open-air spiral's bone brackets, which made 324 stairs cost 2.2 M triangles)
 {const sc=hC(hPick(HPAL.shell),.88);for(const S of FLOORS.stairs){TSTAT.cur='host stairs:'+S.host+'/0';   /* one budget per host's stairs, not one for the city's */
  const w=Math.max(.8,Math.min(1.1,S.r-.55));
   hykPut('hkShell',hykLathe({H:S.y0-S.y1+.4,yBase:S.y1-.2,cx:S.x,cz:S.z,rFn:()=>.3,nu:10,nv:Math.max(2,Math.round((S.y0-S.y1)/3)),flute:{n:6,amp:.08,sharp:1.3},col:sc}),true);
   hykSpanStairSpiral(S.x,S.z,()=>.3,S.y0,S.y1,{w,a0:S.a0,dir:1,col:sc,bare:true});S.drawn=true;}
  TSTAT.cur=null;}
 window._floors={plans:FLOORS.plans.length,rooms:FLOORS.rooms,spots:FLOORS.spots,walls:nw,stairs:FLOORS.stairs.length};
 // the Ancients builders draw a host as a dozen plain meshes (skin, lining, ribbons, plinth...), so thirty hosts were two
 // hundred draw calls: every host's static opaque meshes are merged across the city, one mesh per material and layout;
 // the ruins' with them (their builders are the same lineage's, a dozen plain meshes each)
 window._cityMerge=ysMergeHostMeshes(scene,PLACE.hosts.filter(h=>h.G).map(h=>h.G).concat((PLACE.ruins||[]).filter(r=>r.G).map(r=>r.G)));
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
// the sparse kit items, merged before the bake (Oct 12 2026: the Overview drew 237 calls, ~40 of them InstancedMeshes of a
// handful of Ancient details each: a ruin's window cells, a host's struts, a stain): every kit item with 60 instances or
// fewer becomes geometry merged per material (the colour baked into the vertices, as 88c merges the foreign pass's), except
// the night kit, transparent and multi-material items, and any instance a building owns (its .b: the editor hides those)
function ysMergeSparseKit(parent){const by=new Map();let inst=0,items=0;const m=new THREE.Matrix4(),pos=new THREE.Vector3(),sc=new THREE.Vector3(),q0=new THREE.Quaternion();const WHITE=new THREE.Color(1,1,1);
 for(const n of KIT.order){const def=KIT.defs[n],it=KIT.items[n];if(!def||!it||!it.length||it.length>60)continue;
  if((typeof FIREKIT!=='undefined'&&FIREKIT.indexOf(n)>=0)||!def.mat||def.mat.transparent||Array.isArray(def.mat)||it.some(o=>o.b!=null))continue;
  const M=def.mat;const key=[M.map?M.map.uuid:'nomap',M.type,M.metalness>.5?'metal':'dull',M.side,M.normalMap?M.normalMap.uuid:'',M.emissive?M.emissive.getHex():0,M.alphaTest||0,M.onBeforeCompile?String(M.onBeforeCompile).length:0].join('|');
  if(!by.has(key))by.set(key,{mat:M,geos:[]});const E=by.get(key);const mc=M.color||WHITE;
  for(const o of it){pos.set(o.p[0],o.p[1],o.p[2]);const s=typeof o.s==='number'?sc.set(o.s,o.s,o.s):sc.set(o.s[0],o.s[1],o.s[2]);m.compose(pos,o.q||q0,s);
   const g=def.geo.clone();g.applyMatrix4(m);const nv=g.attributes.position.count;const C=new Float32Array(nv*3);const c=o.c||WHITE;const cr=c.r*mc.r,cg=c.g*mc.g,cb=c.b*mc.b;for(let i=0;i<nv;i++){C[i*3]=cr;C[i*3+1]=cg;C[i*3+2]=cb;}
   g.setAttribute('color',new THREE.BufferAttribute(C,3));E.geos.push(g);inst++;}
  KIT.items[n]=[];items++;}
 let meshes=0;const cur=TSTAT.cur;TSTAT.cur=null;
 for(const E of by.values()){const mat=E.mat.clone();if(E.mat.onBeforeCompile)mat.onBeforeCompile=E.mat.onBeforeCompile;if(E.mat.customProgramCacheKey)mat.customProgramCacheKey=E.mat.customProgramCacheKey;mat.vertexColors=true;if(mat.color)mat.color.set(0xffffff);
  const Mm=meshMerged(E.geos,mat,parent);if(Mm){Mm.userData.own='kit sparse';meshes++;}}
 TSTAT.cur=cur;return {items,instances:inst,meshes};}
{const _ysSparseBake=kbake;kbake=function(parent){try{window._sparseKit=ysMergeSparseKit(parent);}catch(e){reportErr('sparse kit merge '+e.stack);}return _ysSparseBake(parent);};}
