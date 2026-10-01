// ================================================================ LAND BLOCKS (lb): kit, dev layout, SEGMENT lbAuthority
// Land blocks are `place:'land'` segments: a 110 x 110 block (LAND 110, SEA 0,
// local z in [-110, 0]) standing entirely on land BEHIND a coastal segment
// (its z=0 edge meets that segment's -LAND edge) or behind / beside another
// land block. Three fragments share the prefix `lb` and the seed block
// 20700-20799:
//   88-lb-a-authority.js  this file: the lb kit, the dev layout, lbAuthority (20700+d)
//   88-lb-b-stores.js     lbStores, warehouses and silos                   (20710+d)
//   88-lb-c-tanks.js      lbTanks, the fuel-tank farm                      (20720+d)
//
// SIDES. A land block reads opt.nb.{W,E,N,S}: W = -x, E = +x, N = -z (inland),
// S = +z (toward the sea). lbSides(opt) normalises them to a `kind`:
//   'block'  another land block (its registration has place:'land'): a half
//            street (4 m of road with the centre line on the seam, drawn by
//            the W/N block only) and a 4 m pavement - two blocks make one
//            8 m street between them.
//   'seg'    a coastal segment (normally the S side): an 8 m service road
//            with its own centre line; the neighbour's apron continues.
//   'land'   natural land: an 8 m perimeter road, a boundary wall/fence on
//            the edge, a riprap skin on the embankment outside if it falls.
//   'sea'    open water: a quay wall along the edge, dredged outside.
// A missing N defaults to 'land'. When a layout gives no N and no S (the
// pre-grid coastal runs), S is taken as 'sea' so the block still finishes
// its front as a quay; W/E default to 'land'.
const LB={DECK:PORT.DECK,BAND:8,HALF:4};
MAT.lbRoad=new THREE.MeshStandardMaterial({color:0x0f0f0e,roughness:.96,metalness:0,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});
MAT.lbRoadR=new THREE.MeshStandardMaterial({color:0x1e1b17,roughness:1,metalness:0,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});
MAT.lbWater=new THREE.MeshStandardMaterial({color:0x2a6070,roughness:.1,metalness:.4,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-10});
MAT.lbMud=new THREE.MeshStandardMaterial({color:0x1a160f,roughness:1,metalness:0,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-10});
MAT.lbTent=new THREE.MeshStandardMaterial({color:0x3a0804,roughness:.95,metalness:0,side:DS});
MAT.lbChar=new THREE.MeshStandardMaterial({color:0x1d1814,roughness:1,metalness:.1,side:DS});
MAT.lbWhite=new THREE.MeshStandardMaterial({color:0xf2f0ea,roughness:.55,metalness:.05,side:DS});   // smooth white render (terraces, parapets)
const LB_BANNER=[0x5a1008,0xa8741c,0x0c1622,0xd8d0bc,0x380c0a].map(c=>new THREE.Color(c));
const LB_GUARD=new THREE.Color(0x3a0a08);

// ---------------------------------------------------------------- sides
function lbPlace(key){const R=key&&PORT_REG.seg[key];return (R&&R.place)||null;}
function lbSides(opt){const nb=(opt&&opt.nb)||{},legacy=!nb.N&&!nb.S,out={};
 for(const s of ['W','E','N','S']){let N=nb[s];
  if(!N)N=(s==='S'&&legacy)?{kind:'sea',dz:0}:{kind:'land',dz:0};
  let k=N.kind;if(k==='seg'&&lbPlace(N.key)==='land')k='block';
  out[s]=Object.assign({},N,{kind:k});}
 return out;}
// The stamps every land block starts from: the whole footprint flat at deck
// level (soil where the paving is broken), a dredged strip outside any sea side.
function lbBaseStamps(o){const h=o.W/2,L=o.LAND,S=lbSides(o);
 const s=[{kind:'flat',x0:-h,z0:-L,x1:h,z1:0,y:PORT.DECK,soft:30,paint:o.d>=1?'soil':'pave'}];
 const dig=(x0,z0,x1,z1)=>s.push({kind:'dig',x0,z0,x1,z1,y:-12,soft:30,outside:true});
 if(S.W.kind==='sea')dig(-h-40,-L,-h,0);if(S.E.kind==='sea')dig(h,-L,h+40,0);
 if(S.N.kind==='sea')dig(-h,-L-40,h,-L);if(S.S.kind==='sea')dig(-h,0,h,40);
 return s;}
// A side's edge in local coordinates: its two ends (running so the inward
// normal is on the left), the inward normal, and a point at depth t inside.
function lbEdge(side,h,L){
 if(side==='W')return {a:[-h,0],b:[-h,-L],n:[1,0],len:L};
 if(side==='E')return {a:[h,-L],b:[h,0],n:[-1,0],len:L};
 if(side==='N')return {a:[-h,-L],b:[h,-L],n:[0,1],len:2*h};
 return {a:[h,0],b:[-h,0],n:[0,-1],len:2*h};}
function lbAt(E,s,t){const L=E.len,ux=(E.b[0]-E.a[0])/L,uz=(E.b[1]-E.a[1])/L;return [E.a[0]+ux*s+E.n[0]*t,E.a[1]+uz*s+E.n[1]*t];}
// The ground of a block: paving over everything, the side bands (roads,
// pavements, walls, fences, quay walls, lamps) per lbSides. o = {skip(x,z)
// -> true to leave a paving cell out (a bund, a pool), wall:false to leave
// the 'land' boundary wall to the caller (the fortress builds its own)}.
// Returns {S (sides), band:{W,E,N,S} depth each side's band takes}.
function lbGround(G,opt,d,o){o=o||{};const h=opt.W/2,L=opt.LAND,D=LB.DECK,S=lbSides(opt),ruin=d>0;
 portPaving(G,-h,-L,h,0,d,o.skip?{hole:o.skip}:undefined);
 const band={};for(const s of ['W','E','N','S'])band[s]=S[s].kind==='block'?LB.HALF:S[s].kind==='sea'?0:LB.BAND;
 const rm=d>0?MAT.lbRoadR:MAT.lbRoad;
 // road strips: W/E full length, N/S between them, so no two overlap
 const road=(x0,z0,x1,z1)=>{if(x1-x0<.2||z1-z0<.2)return;pbBox(G,rm,(x0+x1)/2,D+.02,(z0+z1)/2,x1-x0,.08,z1-z0,0,8);};
 if(band.W)road(-h,-L,-h+band.W,0);if(band.E)road(h-band.E,-L,h,0);
 const xa=-h+band.W,xb=h-band.E;
 if(band.N)road(xa,-L,xb,-L+band.N);if(band.S)road(xa,-band.S,xb,0);
 const mk=d===1?new THREE.Color(0x8a867c):new THREE.Color(0xf4f2ea);
 for(const s of ['W','E','N','S']){const K=S[s].kind,E=lbEdge(s,h,L);if(K==='sea')continue;
  if(K==='block'){// the kerb between road and pavement
   const p0=lbAt(E,0,LB.HALF),p1=lbAt(E,E.len,LB.HALF);pbBox(G,CONC(d),(p0[0]+p1[0])/2,D+.09,(p0[1]+p1[1])/2,Math.abs(p1[0]-p0[0])+.3,.18,Math.abs(p1[1]-p0[1])+.3,0,8);}
  // centre line: on the seam for a half street (the W and N blocks draw it), mid-band otherwise
  if(K==='block'&&(s==='E'||s==='S'))continue;const t=K==='block'?.12:LB.BAND/2;
  const yaw=Math.atan2(-(E.b[1]-E.a[1]),E.b[0]-E.a[0]);
  for(let u=3;u<E.len-3;u+=6){if(d===1&&rng()<.4)continue;const p=lbAt(E,u,t);kput('pkCope',[p[0],D+.07,p[1]],qEuler(0,yaw,0),[3,.03,.16],mk);}}
 // side treatments
 for(const s of ['W','E','N','S']){const K=S[s].kind,E=lbEdge(s,h,L),yaw=Math.atan2(-(E.b[1]-E.a[1]),E.b[0]-E.a[0]);
  if(K==='sea'){portQuayWall(G,E.a[0],E.a[1],E.b[0],E.b[1],d,{face:[-E.n[0],-E.n[1]],ladders:36,bollards:18});continue;}
  if(K==='land'){
   // embankment: where the ground outside falls away, riprap on it
   const mid=lbAt(E,E.len/2,-6);if(portH(mid[0],mid[1])<D-1.5)portRevetment(G,E.a[0],E.a[1],E.b[0],E.b[1],d,{face:[-E.n[0],-E.n[1]],width:22,top:D+.3,toe:-3});
   if(o.wall!==false)lbBoundary(G,E,d,{gate:o.gate&&o.gate[s]});}
  // lamps along every road band
  if(K!=='sea')for(let u=E.len/8;u<E.len;u+=E.len/4){const p=lbAt(E,u,K==='block'?LB.HALF+.8:LB.BAND-.6);portLamp(p[0],D,p[1],yaw+Math.PI,d);}}
 return {S,band};}
// The boundary on a 'land' side, on the edge line: d=0 a white panel wall
// with a cyan strip and a steel railing; d=1 the same, sections down; d=3
// a salvage palisade of corrugated sheet and posts. o.gate = [s0,s1] gap.
function lbBoundary(G,E,d,o){o=o||{};const D=LB.DECK,yaw=Math.atan2(-(E.b[1]-E.a[1]),E.b[0]-E.a[0]),q=qEuler(0,yaw,0);
 const gap=o.gate||[E.len/2-5,E.len/2+5];const seg=5;
 for(let u=0;u<E.len-.1;u+=seg){const m=u+seg/2;if(m>gap[0]&&m<gap[1])continue;const p=lbAt(E,m,.35);
  if(d===0){pbBox(G,MAT.lbWhite,p[0],D+.7,p[1],seg,1.4,.4,yaw,8);kput('pkGuard',[p[0],D+1.4,p[1]],q,[1,.8,1],null);
   kput('strip',[p[0]+E.n[0]*.22,D+1.15,p[1]+E.n[1]*.22],q,[seg,1,1],CYAN);}
  else if(d===1){if(rng()<.3){portRubble(p[0]+E.n[0]*rr(-2,2),D,p[1]+E.n[1]*rr(-2,2),1.6,4);continue;}
   pbBox(G,MAT.concreteR,p[0],D+.6,p[1],seg,1.2+rr(-.3,.1),.4,yaw+rr(-.03,.03),8);if(rng()<.5)kput('vine',[p[0],D+1.3,p[1]],null,[1,1.3,1],null);}
  else{kput('patchSheet',[p[0],D+1.3,p[1]],qEuler(rr(-.04,.04),yaw,rr(-.03,.03)),[seg+.2,2.6,1],new THREE.Color().setHSL(rr(.02,.1),rr(.2,.4),rr(.35,.55)));
   kput('postR',[p[0]-Math.cos(yaw)*seg/2,D+1.4,p[1]+Math.sin(yaw)*seg/2],null,[.09,2.8,.09],null);}}
 if(d!==1)for(const g of gap){const p=lbAt(E,g,.35);kput(d===0?'postW':'postR',[p[0],D+1.6,p[1]],null,[.35,3.2,.35],null);}}

// ---------------------------------------------------------------- small pieces
// A world-UV bar from a to b (cg's helper when present).
function lbBar(G,mat,a,b,w,dp){pbAdd(cgBarGeo(a,b,w,dp),mat,G);}
// An open cylinder wall (world UVs), bottom at y0.
function lbTube(r,H,seg,y0){const g=new THREE.CylinderGeometry(r,r,H,seg||24,1,true);const uv=g.attributes.uv;
 for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*r*TAU/8,uv.getY(i)*H/8);return g.translate(0,H/2+(y0||0),0);}
function lbDisc(r,y,seg){const g=new THREE.CircleGeometry(r,seg||24);g.rotateX(-Math.PI/2);g.translate(0,y,0);return g;}
// A flag on a pole: pole from y to y+H, a flag flying toward yaw.
function lbFlag(x,y,z,H,yaw,col,d,o){o=o||{};
 if(d===1&&o.fall){kput('postR',[x,y+.2,z],qEuler(0,yaw,Math.PI/2-.06),[.09,H,.09],null);return;}
 kput(d===0?'postW':'postR',[x,y+H/2,z],null,[.09,H,.09],null);
 const fw=o.w||3.6,fh=o.h||2.2,tat=d===1?rr(.35,.7):1;
 kput('pkCloth',[x,y+H-.1-fh/2,z],qEuler(0,yaw,0).multiply(qEuler(rr(-.12,.12),0,Math.PI/2)),[fh,fw*tat,1],col);}
// A tall banner mast: a vertical banner hanging from a cross-yard, facing yaw.
function lbBanner(x,y,z,H,yaw,col,o){o=o||{};const q=qEuler(0,yaw,0),bw=o.w||2.2,bl=o.len||H*.55;
 kput('postR',[x,y+H/2,z],null,[.12,H,.12],new THREE.Color(0x5a4a3a));
 kput('plank',[x,y+H-.6,z],q,[bw+.6,.12,.12],null);
 kput('pkCloth',[x+Math.sin(yaw)*.1,y+H-.66,z+Math.cos(yaw)*.1],q,[bw,bl,1],col);
 kput('pkCloth',[x+Math.sin(yaw)*.12,y+H-.66-bl*.18,z+Math.cos(yaw)*.12],q,[bw*.3,bl*.3,1],o.charge||LB_BANNER[1]);
 if(o.finial!==false)kput('rubble',[x,y+H+.2,z],qEuler(.6,.6,0),[.3,.45,.3],LB_BANNER[1]);}
// A guard: a figure in the house colour with a spear.
function lbGuard(x,y,z,yaw){kput('figB',[x,y,z],qEuler(0,yaw,0),[1.05,1,1.05],LB_GUARD);kput('figH',[x,y,z],null,1,new THREE.Color(0xc9a17e));
 kput('rubble',[x,y+1.78,z],null,[.19,.12,.19],new THREE.Color(0x6a6a6a));
 kput('postR',[x+Math.cos(yaw)*.34,y+1.2,z-Math.sin(yaw)*.34],null,[.03,2.4,.03],new THREE.Color(0x6a5040));}
// A row of guards from a to b facing yaw.
function lbGuardRow(ax,az,bx,bz,y,n,yaw){for(let i=0;i<n;i++){const t=n>1?i/(n-1):.5;lbGuard(ax+(bx-ax)*t,y,az+(bz-az)*t,yaw);}}
// A brazier on a tripod.
function lbBrazier(x,y,z){kput('pkCol',[x,y,z],null,[.35,.9,.35],new THREE.Color(0x3a3430));firePit('lb',x,y+.9,z,.55);}
// A salvage watchtower: four steel legs braced, a plank deck, a 20 ft
// cabin with a sheet roof, a searchlight, a flag. Footprint 5 x 5 m.
function lbWatchtower(G,x,z,d,o){o=o||{};const D=o.y||LB.DECK,H=o.H||14,yaw=o.yaw||0,c=Math.cos(yaw),s=Math.sin(yaw);
 const P=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];
 for(const a of [[-2.2,-2.2],[2.2,-2.2],[2.2,2.2],[-2.2,2.2]]){const b=P(a[0]*.62,a[1]*.62),g=P(a[0],a[1]);lbBar(G,MAT.rust,[g[0],D,g[1]],[b[0],D+H,b[1]],.34,.34);}
 for(let y=4;y<H;y+=4.5){const k=1-.38*y/H;for(let i=0;i<4;i++){const a=[[-1,-1],[1,-1],[1,1],[-1,1]][i],b=[[1,-1],[1,1],[-1,1],[-1,-1]][i];
  const pa=P(a[0]*2.2*k,a[1]*2.2*k),pb=P(b[0]*2.2*k,b[1]*2.2*k);lbBar(G,MAT.rust,[pa[0],D+y,pa[1]],[pb[0],D+y,pb[1]],.16,.16);}}
 let p=P(0,0);kput('plank',[p[0],D+H+.1,p[1]],qEuler(0,yaw,0),[6.4,.2,4.8],null);
 kput('pkCont20R',[p[0],D+H+.2,p[1]],qEuler(0,yaw,0),[.82,.95,1],new THREE.Color(o.col||0x7a5a3a));
 kput('shantyRoof',[p[0],D+H+2.85,p[1]],qEuler(.05,yaw,0),[6.8,1,5.2],null);
 for(const e of [-1,1]){p=P(e*1.9,1.23);kput('dot',[p[0],D+H+1.6,p[1]],qEuler(0,yaw,0),[1.2,.6,.3],WARM);}
 for(const e of [-1,1]){p=P(0,e*2.4);kput('pkGuard',[p[0],D+H+.2,p[1]],qEuler(0,yaw,0),[1.2,1,1],null);}
 p=P(2.6,1.6);kput('pkCol',[p[0],D+H+.2,p[1]],null,[.2,.6,.2],new THREE.Color(0x303030));kput('dot',[p[0],D+H+.95,p[1]],qEuler(0,yaw+.4,0),[.6,.6,.6],WARM);
 p=P(-2.6,-1.8);lbFlag(p[0],D+H+.2,p[1],7,yaw+1.2,o.flag||LB_BANNER[0],3,{w:3,h:1.8});
 p=P(0,2.6);kput('pkLadder',[p[0],D+H+.2,p[1]],qEuler(0,yaw,0),[1,(H+.4)/10,1],null);
 p=P(0,1);lbGuard(p[0],D+H+.2,p[1],yaw);
 REGISTER({name:'Watchtower',x,z,r:3.2,h:H+3.4,y:D});}
// A salvage curtain wall along a->b (local), outer face toward -n: two
// tiers of rusted containers end to end, a plank wall-walk on top behind a
// parapet of corrugated sheet with merlons; some bays are Ancient concrete
// slabs set on end. gaps = [[s0,s1]] metres along the run left open.
function lbCurtain(G,ax,az,bx,bz,d,o){o=o||{};const D=LB.DECK,L=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/L,uz=(bz-az)/L,yaw=Math.atan2(-uz,ux);
 const n=o.n||[-uz,ux];   // inward normal (walk side)
 const gaps=o.gaps||[];const inGap=(s0,s1)=>gaps.some(g=>s1>g[0]&&s0<g[1]);
 const at=(s,t)=>[ax+ux*s+n[0]*t,az+uz*s+n[1]*t];let nreg=0;
 for(let tier=0;tier<2;tier++){const off=tier?6.1:0;
  for(let s=-off;s<L;s+=12.3){const s0=Math.max(0,s),s1=Math.min(L,s+12.19);if(s1-s0<5.9||inGap(s0,s1))continue;
   const big=s1-s0>11,m=big?(s0+s1)/2:s0+3.03,p=at(m,0);
   if(!tier&&rng()<.18){pbBox(G,MAT.concreteR,p[0],D+2.6,p[1],big?12.1:6,5.2,1.4,yaw,8);continue;}   // an Ancient slab set on end
   portContainer(p[0],D+tier*2.6,p[1],yaw+rr(-.01,.01),big,3,PK_CONT_COL[(rng()*PK_CONT_COL.length)|0].clone().lerp(PK_RUST,rr(.35,.65)));
   if(!tier&&o.reg!==false&&(nreg++)%2===0){const c=at(m,1.4);REGISTER({name:'Curtain wall',x:c[0],z:c[1],r:2.9,h:7.8,y:D});}}}
 // walk, parapet and merlons
 for(let s=0;s<L-.1;s+=4){const s1=Math.min(L,s+4);if(inGap(s,s1))continue;const m=(s+s1)/2;
  let p=at(m,.3);kput('plank',[p[0],D+5.28,p[1]],qEuler(0,yaw,0),[s1-s+.05,.12,3.2],null);
  p=at(m,-1.1);kput('patchSheet',[p[0],D+6.1,p[1]],qEuler(0,yaw,0),[s1-s+.1,1.6,1],new THREE.Color().setHSL(rr(.03,.09),rr(.2,.35),rr(.32,.48)));
  if(((s/4)|0)%2===0){p=at(m,-1.05);kput('shantyBox',[p[0],D+7.3,p[1]],qEuler(0,yaw,0),[1.8,.9,.35],new THREE.Color().setHSL(.06,.25,rr(.32,.42)));}}
}
// A gatehouse across a gap in the curtain: two container towers three
// high, a lintel box across, iron doors swung open, banners, braziers, guards.
// (x,z) the gate centre on the wall line, yaw the wall direction, n inward.
function lbGatehouse(G,x,z,yaw,d,o){o=o||{};const D=LB.DECK,c=Math.cos(yaw),s=Math.sin(yaw),gw=o.gw||9;
 const P=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];     // lx along the wall, lz across (+ = inward)
 for(const e of [-1,1]){const tx=e*(gw/2+1.3);
  for(let t=0;t<3;t++){const p=P(tx,1.8);portContainer(p[0],D+t*2.6,p[1],yaw+Math.PI/2,false,3,new THREE.Color(t%2?0x6a3a28:0x4a4a44));}
  let p=P(tx,1.8);kput('shantyRoof',[p[0],D+7.9,p[1]],qEuler(0,yaw,0),[3.4,1,7],null);
  p=P(tx,-1.3);kput('pkCloth',[p[0],D+7.6,p[1]],qEuler(0,yaw+Math.PI,0),[2,5.6,1],LB_BANNER[0]);
  p=P(tx,6.4);lbBrazier(p[0],D,p[1]);p=P(e*(gw/2+.3),-2.2);lbBrazier(p[0],D,p[1]);
  p=P(e*(gw/2-1),-2.2);lbGuard(p[0],D,p[1],yaw+Math.PI);p=P(e*(gw/2-1.2),5.6);lbGuard(p[0],D,p[1],yaw+Math.PI);
  REGISTER({name:o.name||'Gatehouse',x:P(tx,1.8)[0],z:P(tx,1.8)[1],r:3.2,h:12,y:D});
  // the doors, swung in
  p=P(e*(gw/2-.1)-e*1.2,2.4);kput('pkDoor',[p[0],D+3,p[1]],qEuler(0,yaw+e*1.25,0),[gw/2-.3,6,2],new THREE.Color(0x3a3230));}
 let p=P(0,1.8);kput('pkCont40R',[p[0],D+7.8,p[1]],qEuler(0,yaw,0),[(gw+5.2)/12.19,1,1.1],new THREE.Color(0x5a3a2a));
 for(let k=-1;k<=1;k++){const q=P(k*3.2,.3);kput('pkCloth',[q[0],D+10.2,q[1]],qEuler(0,yaw+Math.PI,0),[2.2,4.6,1],LB_BANNER[(k+1)%3===1?1:0]);
  const q2=P(k*3.2,3.3);kput('pkCloth',[q2[0],D+10.2,q2[1]],qEuler(0,yaw,0),[2.2,4.6,1],LB_BANNER[(k+2)%3]);}
 p=P(-gw/2-1.3,1.8);lbFlag(p[0],D+10.6,p[1],6,yaw,LB_BANNER[0],3,{w:3.4,h:2});p=P(gw/2+1.3,1.8);lbFlag(p[0],D+10.6,p[1],6,yaw,LB_BANNER[1],3,{w:3.4,h:2});
 p=P(0,1.8);lbGuard(p[0],D+10.4,p[1],yaw+Math.PI);}

// ---------------------------------------------------------------- the dev layout
// lbLayoutDev(keys, o): one run per decay of the first key's decays. Each run
// is a row of plain quays on the coast (quay110 x keys.length, flush) and,
// behind them, the land blocks `keys` side by side (so neighbouring blocks
// meet on half streets, the run ends meet natural land). o.back = a key to
// put behind the MIDDLE block (its S side meets that block, the middle
// block's N side meets it). Items carry nb W/E/N/S. Registered here, not in
// 70-port-core.js, until the shared grid placement lands.
function lbLayoutDev(keys,o){o=Object.assign({gap:300,nbKey:'quay110'},o||{});
 keys=keys.filter(k=>PORT_REG.seg[k]);if(!keys.length){reportErr('lbLayoutDev: no land block registered');return {items:[],runs:[],stamps:[],vessels:[]};}
 const Q=PORT_REG.seg[o.nbKey]?o.nbKey:null,R0=PORT_REG.seg[keys[0]],runs=[];let x=0;
 R0.decays.forEach((d,r)=>{const items=[],row=[],back=[];let cx=x;
  const qw=Q?PORT_REG.seg[Q].W:110,qL=Q?PORT_REG.seg[Q].LAND:0;
  const n=keys.length,qs=Q?Array(n).fill(Q):[];
  const QR=Q?portRun(qs,d,x,qs.map(()=>0),{run:r,ctx:qs.map(()=>1)}):{items:[],x1:x+n*110};
  for(const it of QR.items)items.push(it);
  keys.forEach((k,i)=>{const w=PORT_REG.seg[k].W;const it={key:k,d,gx:cx+w/2,gz:-qL,slot:i,run:r,lb:true};cx+=w;row.push(it);});
  row.forEach((it,i)=>{const P=row[i-1],N=row[i+1];
   it.nb={W:P?{kind:'seg',dz:0,key:P.key}:{kind:'land',dz:0},E:N?{kind:'seg',dz:0,key:N.key}:{kind:'land',dz:0},
    N:{kind:'land',dz:0},S:Q?{kind:'seg',dz:0,key:Q}:{kind:'land',dz:0}};items.push(it);});
  if(o.back&&PORT_REG.seg[o.back]&&PORT_REG.seg[o.back].decays.indexOf(d)>=0){const M=row[(row.length-1)>>1],RB=PORT_REG.seg[o.back];
   const it={key:o.back,d,gx:M.gx,gz:M.gz-PORT_REG.seg[M.key].LAND,slot:9,run:r,lb:true,back:true,
    nb:{W:{kind:'land',dz:0},E:{kind:'land',dz:0},N:{kind:'land',dz:0},S:{kind:'seg',dz:0,key:M.key}}};
   M.nb.N={kind:'seg',dz:0,key:o.back};items.push(it);back.push(it);}
  runs.push({d,items,x0:x,x1:Math.max(cx,QR.x1)});x=Math.max(cx,QR.x1)+o.gap;});
 const mid=(runs[0].x0+runs[runs.length-1].x1)/2;
 for(const R of runs){R.x0-=mid;R.x1-=mid;for(const it of R.items)it.gx-=mid;}
 return {items:[].concat(...runs.map(R=>R.items)),runs,stamps:[],vessels:portVesselKeys(),focus:keys[0]};}
// Views for lbLayoutDev: an overview, then per run and per block an oblique
// view from the sea side, one from inland, a top view; eye level and night.
function lbViewsDev(){const V={},D=PORT.DECK,runs=PORT_LAYOUT.runs||[];if(!runs.length)return {Empty:[0,300,600,0,0,0]};
 const X0=runs[0].x0,X1=runs[runs.length-1].x1;
 V['Overview']=portCam((X0+X1)/2,0,-80,.25,.5,(X1-X0)*.55+300);
 for(const R of runs){const nm=portDName(R.d);const bl=R.items.filter(it=>it.lb);
  const mx=(R.x0+R.x1)/2;V[nm+' run']=portCam(mx,D,-100,.3,.55,(R.x1-R.x0)*.7+220);
  for(const it of bl){const Rg=PORT_REG.seg[it.key],t=it.key+(it.back?' (back)':'')+' '+nm;const cz=it.gz-Rg.LAND/2;
   V[t]=portCam(it.gx,D+12,cz,.5,.42,200);V[t+' inland']=portCam(it.gx,D+12,cz,Math.PI-.6,.35,190);
   V[t+' top']=[it.gx,330,cz+.2,it.gx,0,cz];}}
 const it0=runs[0].items.find(it=>it.lb);if(it0){V['Eye level']=[it0.gx-30,D+1.7,it0.gz-6,it0.gx,D+6,it0.gz-50];}
 const Rn=runs[runs.length-1],itn=Rn.items.find(it=>it.lb);if(itn)V['Night']=portCam(itn.gx,D+10,itn.gz-55,.6,.4,230,1);
 return V;}

// ================================================================ SEGMENT: lbAuthority (the Port Authority)
// The port's administration complex: a white terraced crescent six storeys
// high, concave to the sea, stepping down in planted terraces to a round
// court with a pool; a fluted signal and observation tower rising 80 m from
// the crescent's back; two curved-ended wings framing a plaza of flag masts
// that opens toward the quay. Seeds 20700-20704.
//   d=0 intact   blue-glass bands, cyan light lines, clipped hedges on the
//                terraces, flags, officials in the court
//   d=1 ruined   gutted: glass gone to black, fabric holed; the tower broken
//                at 36 m, its upper shaft lying across the east crescent,
//                whose upper floors collapsed under it; the drum in the
//                court; the pool silted; trees and weeds everywhere
//   d=3 reclaimed THE FORTRESS PALACE: a curtain wall of containers round the
//                block with gatehouses and corner watchtowers, the broken
//                tower crowned with a lookout and a beacon, the collapse
//                filled with container houses, banners on the crescent, a
//                throne-hall court under a great red tent, guards lining
//                the approach, gardens on the terraces and in the plaza
const AU={cx:0,cz:-26,r0:36,r1:60,ph:.78,nL:6,lh:4.2,TX:0,TZ:-79,TH:80,CUT:[.24,.62],CUTK:2};
function lbAuthorityStamps(o){return lbBaseStamps(o);}
// crescent geometry helpers
function lbArcP(r,ph,y){return [AU.cx+r*Math.sin(ph),y,AU.cz-r*Math.cos(ph)];}
function lbArcRanges(k,d){const P=AU.ph;if(d>=1&&k>=AU.CUTK)return [[-P,AU.CUT[0]],[AU.CUT[1],P]];return [[-P,P]];}
function buildLbAuthority(scene,gx,gz,d,opt){reseed(20700+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=LB.DECK,h=opt.W/2,L=opt.LAND,ruin=d>0;
 const pool=(x,z)=>Math.hypot(x-AU.cx,z-(AU.cz-10))<7.5;
 const GI=lbGround(G,opt,d,{skip:(x,z)=>pool(x,z),wall:d<3});
 lbCrescent(G,d);
 lbAuTower(G,d);
 for(const e of [-1,1])lbAuWing(G,e*35,-46,-15,12,d);
 lbAuCourt(G,d);
 // the plaza flag masts along the front
 for(let i=0;i<7;i++){const x=-24+i*8;
  if(d===0)lbFlag(x,D,-13,16,Math.PI/2,i%2?new THREE.Color(0xeaf6fb):new THREE.Color(0x2f6f9a),0,{w:4.2,h:2.6});
  else if(d===1){if(rng()<.55)lbFlag(x,D,-13,16,rng()*TAU,new THREE.Color(0x9a948a),1,{fall:rng()<.5,w:3,h:2});}
  else lbBanner(x,D,-13,14,0,LB_BANNER[i%3===1?1:i%2?4:0],{len:7});}
 if(d===0){portFigures(-15,D,-40,9,5);portFigures(15,D,-40,9,5);portFigures(0,D,-19,14,12);portFigures(-30,D,-10,5,6);
  for(const e of [-1,1]){lbFormal(G,e*18,-19,12,7,d);}
  portTrees(-46,-100,-30,-92,3,D,6,10);portTrees(30,-100,46,-92,3,D,6,10);}
 if(d===1){portWeeds(-h+4,-L+4,h-4,-4,260,D);portTrees(-40,-48,40,-12,9,D,5,12);portTrees(-46,-100,46,-90,6,D,5,11);
  portRubble(24,D,-58,7,30);portRubble(-30,D,-24,3,8);portRubble(10,D,-44,4,12);}
 if(d>=3)lbAuFortress(G,opt,d,GI);
 REGISTER({name:d>=3?'Palace plaza':'Authority plaza',x:0,z:-17,r:8,h:6,y:D});
 KOFF=[0,0,0];return G;}

// The terraced crescent. Six levels; level k's front stands at r0+k*st, the
// back at r1; each level's top is a slab from its front to the back, so the
// strip between two fronts is the open terrace of the level below, behind a
// white parapet. Glass bands between the white bands; the back is white
// with window bands; stepped end walls. d>=1: the collapse sector CUT has
// no levels >= CUTK, glass is dark, fabric holed.
function lbCrescent(G,d){const D=LB.DECK,{r0,r1,nL,lh,ph}=AU,st=(r1-r0-8)/(nL-1),ruin=d>0,sd=rr(0,99);
 const wm=ruin?MAT.concreteR:MAT.lbWhite,gm=d===0?MAT.winIntact:MAT.dark;
 const nuOf=(a,b)=>Math.max(3,Math.round((b-a)/.05));
 const hole=ruin?holeFn(d,sd,null,1.1):null;
 const surf=(mat,a,b,fn,nv,hf)=>pbAdd(gridSurface((u,v)=>fn(a+(b-a)*u,v),nuOf(a,b),nv||1,{uS:(b-a)*r1/8,vS:1,hole:hf?(u,v)=>hf(a+(b-a)*u,v):null}),mat,G);
 const top=D+nL*lh;
 for(let k=0;k<nL;k++){const rk=r0+k*st,y0=D+k*lh,y1=y0+lh;
  for(const [a,b] of lbArcRanges(k,d)){
   const hw=hole?(p,v)=>hole(p*3+k,y0+v*lh):null;
   // glass band, the white band (slab edge + parapet), the slab/terrace
   surf(gm,a,b,(p,v)=>lbArcP(rk+.4,p,y0+v*(lh-.8)),2,d===1?null:null);
   surf(wm,a,b,(p,v)=>lbArcP(rk,p,y1-.8+v*1.9),1,hw);
   surf(wm,a,b,(p,v)=>lbArcP(rk+v*(r1-rk),p,y1),4,ruin?(p,v)=>hole(p*2.3+k*.7,v*40+k*9):null);
   // mullions in front of the glass
   for(let p=a+.035;p<b;p+=.06){if(d===1&&rng()<.35)continue;const P=lbArcP(rk+.25,p,y0+(lh-.8)/2);
    kput(ruin?'mullR':'mullW',[P[0],P[1],P[2]],qEuler(0,-p,0),[.5,lh-.8,.6],null);}
   // hedges behind the parapet on the terrace (d=0), weeds (d=1)
   if(k<nL-1){const rt=rk+1.2;
    for(let p=a+.02;p<b-.02;p+=.05){const P=lbArcP(rt,p,y1);if(d>=3)break;
     if(d===0)kput('hedge',[P[0],y1+.45,P[2]],qEuler(0,-p,0),[2.6,.9,1],new THREE.Color(0x4a7a3a));
     else if(d===1&&rng()<.5)kput('leafCard',[P[0],y1+.6,P[2]],qEuler(0,rng()*TAU,0),[rr(.8,1.8),rr(.6,1.2),rr(.8,1.8)],new THREE.Color().setHSL(rr(.2,.3),.45,rr(.35,.5)));}}}
  // the back wall and its window band
  for(const [a,b] of lbArcRanges(k,d)){
   surf(wm,a,b,(p,v)=>lbArcP(r1,p,y0+v*lh),2,ruin?(p,v)=>hole(p*3+k+50,y0+v*lh):null);
   surf(gm,a,b,(p,v)=>lbArcP(r1+.06,p,y0+1.3+v*(lh-2.4)),1);}
  // stepped end walls at the arc ends (and at the collapse cut)
  const ends=lbArcRanges(k,d).map(r=>r[0]).concat(lbArcRanges(k,d).map(r=>r[1]));
  for(const p of ends){pbAdd(gridSurface((u,v)=>lbArcP(rk+u*(r1-rk),p,y0+v*lh),4,1,{uS:(r1-rk)/8,vS:lh/8}),wm,G);}}
 // parapet of the roof at the back
 for(const [a,b] of lbArcRanges(nL-1,d))surf(wm,a,b,(p,v)=>lbArcP(r1-.1,p,top+v*1.2),1);
 // light lines and the atrium on the central axis
 if(d===0)for(let k=0;k<nL;k++){const rk=r0+k*st;for(let p=-ph+.04;p<ph;p+=.08){const P=lbArcP(rk-.05,p,D+(k+1)*lh-.35);kput('strip',P,qEuler(0,-p,0),[rk*.08,1,1],CYAN);}}
 // the atrium: a glass half-drum on the court side, three storeys
 const A=lbArcP(r0,0,D);const ar=7;
 pbAdd(gridSurface((u,v)=>{const t=Math.PI*u;return [A[0]-ar*Math.cos(t),D+v*3*lh,A[2]+ar*Math.sin(t)];},16,3,{uS:3,vS:2}),d===0?MAT.winIntact:MAT.dark,G);
 pbAdd(lbDisc(ar,D+3*lh,20).translate(A[0],0,A[2]),wm,G);
 for(let i=0;i<=8;i++){const t=Math.PI*i/8;kput(ruin?'mullR':'mullW',[A[0]-ar*Math.cos(t)*1.02,D+1.5*lh,A[2]+ar*Math.sin(t)*1.02],qEuler(0,t,0),[.45,3*lh,.45],null);}
 if(d===0)kput('strip',[A[0],D+3*lh+.3,A[2]+ar],null,[ar*2,1,1],CYAN);
 // ruin: the collapse heap, bare floor edges, vines and stains
 if(d>=1){const pm=(AU.CUT[0]+AU.CUT[1])/2;
  for(let i=0;i<60;i++){const p=rr(AU.CUT[0],AU.CUT[1]),r=rr(r0,r1+4),P=lbArcP(r,p,0);const s=rr(.8,3);
   kput('rubble',[P[0],D+AU.CUTK*lh*rng()*.6+s*.3,P[2]],qEuler(rng()*3,rng()*3,rng()*3),[s*rr(1,1.6),s*rr(.4,.8),s*rr(.8,1.3)],new THREE.Color().setHSL(.08,.05,rr(.33,.48)));}
  for(let i=0;i<8;i++){const p=rr(AU.CUT[0],AU.CUT[1]),a=lbArcP(rr(r0,r1),p,D+AU.CUTK*lh+.4);
   lbBar(G,MAT.concreteR,a,[a[0]+rr(-6,6),D+rr(.5,2),a[2]+rr(-6,6)],rr(3,6),.4);}
  for(let i=0;i<(d===1?70:30);i++){const p=rr(-ph,ph),k=(rng()*nL)|0;if(k>=AU.CUTK&&p>AU.CUT[0]&&p<AU.CUT[1])continue;
   const P=lbArcP(r0+k*st-.1,p,D+(k+1)*lh+1);kput('vine',P,qEuler(0,-p,0),[1,rr(2,lh*1.6),1],null);}
  for(let i=0;i<40;i++){const p=rr(-ph,ph),P=lbArcP(r1+.1,p,D+rr(6,nL*lh));kput('stain',P,qEuler(0,-p+Math.PI,0),[rr(2,4),rr(4,10),1],null);}
  if(d===1)for(let k=0;k<nL-1;k++)for(let i=0;i<3;i++){const p=rr(-ph,ph);if(k>=AU.CUTK&&p>AU.CUT[0]-.03&&p<AU.CUT[1]+.03)continue;
   const P=lbArcP(r0+k*st+rr(1.5,st-.5),p,0);VEG.tree(P[0],D+(k+1)*lh,P[2],i%3,rr(3,6));}}
 // registered volumes: five spans along the arc
 for(let i=0;i<5;i++){const p=-ph+.12+(2*ph-.24)*i/4,P=lbArcP((r0+r1)/2,p,0);
  const cut=d>=1&&p>AU.CUT[0]&&p<AU.CUT[1];REGISTER({name:d>=3?'Palace crescent':d===1?'Crescent (gutted)':'Authority crescent',x:P[0],z:P[2],r:(r1-r0)/2,h:(cut?AU.CUTK:nL)*lh+1,y:D});}}

// The signal and observation tower: fluted shaft from the crescent's back,
// an observation drum at 58 m, a lantern and a signal mast. d=1 broken at
// 36 m, the upper shaft and drum lying east; d=3 the stump crowned.
function lbAuTower(G,d){const D=LB.DECK,x=AU.TX,z=AU.TZ,H=AU.TH,ruin=d>0,wm=ruin?MAT.concreteR:MAT.lbWhite;
 const R=y=>5.2-1.4*y/H;const cut=ruin?36:null;
 const g=lathe({rFn:R,H,cut,jag:cut?3.5:0,flutes:10,amp:.12,sharp:1.6,nu:40,nv:24,hole:holeFn(d,77,cut,1.3)});g.translate(x,D,z);pbAdd(g,wm,G);
 if(ruin){const gi=lathe({rFn:y=>R(y)-.6,H,cut,jag:3,nu:20,nv:6});gi.translate(x,D,z);pbAdd(gi,MAT.guts,G);}
 if(!ruin){// the drum, the lantern, the mast
  const y0=D+58;pbAdd(lbTube(9,5,32,y0).translate(x,0,z),MAT.winIntact,G);
  kput('slab',[x,y0-.3,z],null,[9.6,.7,9.6],new THREE.Color(0xf2f0ea));kput('slab',[x,y0+5.2,z],null,[10.2,.7,10.2],new THREE.Color(0xf2f0ea));
  for(let i=0;i<16;i++){const a=i/16*TAU;kput('mullW',[x+Math.cos(a)*9.05,y0+2.5,z+Math.sin(a)*9.05],qEuler(0,-a,0),[.4,5,.4],null);}
  kput('ringW',[x,y0+5.6,z],qEuler(Math.PI/2,0,0),[10.2,10.2,10.2],null);
  kput('strip',[x,y0+5.3,z+10.25],null,[6,1,1],CYAN);
  pbAdd(lbTube(4.2,6,20,y0+5.6).translate(x,0,z),MAT.lbWhite,G);
  pbAdd(lbTube(2.6,4,16,y0+11.6).translate(x,0,z),MAT.winIntact,G);
  kput('slab',[x,y0+15.8,z],null,[3.2,.5,3.2],new THREE.Color(0xf2f0ea));
  kput('pkCol',[x,y0+16,z],null,[.3,16,.3],new THREE.Color(0xe8e8e8));
  for(const y of [y0+20,y0+26,y0+31.6])kput('dot',[x,y,z],null,[.7,.7,.7],y>y0+30?CG.RED:CYAN);
  kput('ringW',[x,y0+14,z],qEuler(Math.PI/2,0,0),[3.2,3.2,3.2],null);
  for(let i=0;i<10;i++){const a=i/10*TAU;kput('strip',[x+Math.cos(a)*9.1,y0+3.5,z+Math.sin(a)*9.1],qEuler(0,-a+Math.PI/2,0),[5.6,1,1],CYAN);}
  for(let y=12;y<56;y+=11)kput('ringW',[x,D+y,z],qEuler(Math.PI/2,0,0),[R(y)*1.08,R(y)*1.08,R(y)*1.08],null);
  REGISTER({name:'Signal tower',x,z,r:6,h:56,y:D});REGISTER({name:'Observation drum',x,z,r:9.5,h:20,y:D+56});return;}
 // ruined: the upper shaft lies east across the crescent's collapse; the drum in the court
 if(d===1){const Lf=30,a0=lbArcP(46,.3,0);
  const f=lathe({rFn:y=>R(y+40),H:Lf,flutes:10,amp:.12,sharp:1.6,nu:32,nv:10,hole:holeFn(1,79,null,1.3)});
  f.rotateZ(-Math.PI/2+.1);f.rotateY(-.72);f.translate(x+5,D+AU.CUTK*AU.lh+2.2,z+4);pbAdd(f,MAT.concreteR,G);
  const dr=new THREE.Group();dr.position.set(18,D+2.6,-40);dr.rotation.set(.5,.3,.35);G.add(dr);
  pbAdd(lbTube(9,5,32,-2.5),MAT.rust,dr);
  useGroupXF(dr);kput('slab',[0,-2.8,0],null,[9.6,.7,9.6],new THREE.Color(0x9a948a));endGroupXF();
  rubbleRing(18,D,-40,6,14,30,2.4);rubbleRing(x,D,z,5,12,24,2);
  REGISTER({name:'Fallen tower shaft',x:a0[0]-4,z:a0[2]+4,r:10,h:12,y:D+6});REGISTER({name:'Fallen drum',x:18,z:-40,r:9,h:8,y:D});}
 REGISTER({name:d>=3?'Broken tower keep':'Broken signal tower',x,z,r:6,h:cut+4,y:D});}

// A wing: two storeys, 12 m wide, running along z from z0 to z1, its south
// end a half drum. Glass bands, a roof terrace behind a parapet.
function lbAuWing(G,x,z0,z1,w,d){const D=LB.DECK,lh=AU.lh,H=2*lh,ruin=d>0,wm=ruin?MAT.concreteR:MAT.lbWhite,gm=d===0?MAT.winIntact:MAT.dark,r=w/2,zc=z1-r;
 const Lb=zc-z0,sd=rr(0,99),hf=ruin?holeFn(d,sd,null,1.4):null;
 for(let k=0;k<2;k++){const y0=D+k*lh;
  pbBox(G,wm,x,y0+lh-.45,(z0+zc)/2,w+.3,.9,Lb,0,8);
  for(const e of [-1,1])pbBox(G,gm,x+e*r,y0+(lh-.9)/2,(z0+zc)/2,.2,lh-.9,Lb,0,8);
  pbAdd(gridSurface((u,v)=>{const t=Math.PI*u;return [x-r*Math.cos(t),y0+lh-.9+v*.9,zc+r*Math.sin(t)];},12,1,{uS:2,vS:.2}),wm,G);
  pbAdd(gridSurface((u,v)=>{const t=Math.PI*u;return [x-(r-.2)*Math.cos(t),y0+v*(lh-.9),zc+(r-.2)*Math.sin(t)];},12,1,{uS:2,vS:.5}),gm,G);
  for(let zz=z0+2;zz<zc;zz+=3)for(const e of [-1,1]){if(d===1&&rng()<.4)continue;kput(ruin?'mullR':'mullW',[x+e*(r+.12),y0+(lh-.9)/2,zz],null,[.3,lh-.9,.4],null);}}
 pbBox(G,wm,x,D+lh,z0+.2,w,lh*2,.4,0,8);
 // roof slab and parapet
 const rs=gridSurface((u,v)=>[x-r+u*w,D+H,z0+v*(z1-z0)],6,8,{uS:w/8,vS:(z1-z0)/8,hole:(u,v)=>{const px=-r+u*w,pz=z0+v*(z1-z0);return (pz>zc&&Math.hypot(px,pz-zc)>r)||(hf&&hf(u*3,v*40));}});
 pbAdd(rs,wm,G);
 for(const e of [-1,1])pbBox(G,wm,x+e*(r-.15),D+H+.55,(z0+zc)/2,.3,1.1,Lb,0,8);
 pbAdd(gridSurface((u,v)=>{const t=Math.PI*u;return [x-(r-.15)*Math.cos(t),D+H+v*1.1,zc+(r-.15)*Math.sin(t)];},12,1,{uS:2,vS:.2}),wm,G);
 if(d===0){for(let zz=z0+3;zz<zc;zz+=4.5)kput('hedge',[x,D+H+.45,zz],null,[w-3,.9,1.4],new THREE.Color(0x4a7a3a));
  kput('strip',[x-r-.12,D+lh-.3,(z0+zc)/2],qEuler(0,Math.PI/2,0),[Lb,1,1],CYAN);kput('strip',[x+r+.12,D+lh-.3,(z0+zc)/2],qEuler(0,Math.PI/2,0),[Lb,1,1],CYAN);}
 if(d===1){for(let i=0;i<5;i++)kput('vine',[x+(rng()<.5?-r-.2:r+.2),D+H+.5,rr(z0,zc)],null,[1,rr(3,7),1],null);VEG.tree(x+rr(-2,2),D+H,rr(z0+3,zc),1,rr(4,7));}
 if(d>=3){portGarden(x,D+H,(z0+zc)/2,w-3,Lb-4,d);for(let zz=z0+4;zz<zc;zz+=6)kput('dot',[x+(rng()<.5?-r-.15:r+.15),D+1.6,zz],null,[.9,1,.9],WARM);}
 REGISTER({name:d>=3?'Palace wing':'Authority wing',x,z:(z0+z1)/2,r:w/2+.5,h:H+1.2,y:D});
 REGISTER({name:d>=3?'Palace wing':'Authority wing',x,z:z0+w/2,r:w/2+.5,h:H+1.2,y:D});REGISTER({name:d>=3?'Palace wing':'Authority wing',x,z:zc,r:w/2+.5,h:H+1.2,y:D});}

// The round court in the crescent's embrace: a pool with a rim (d=0 water
// and a jet; d=1 silted, reeds; d=3 a garden pool), paving rings.
function lbAuCourt(G,d){const D=LB.DECK,px=AU.cx,pz=AU.cz-10,ruin=d>0;
 pbAdd(lbTube(7.3,.55,40,D-.1).translate(px,0,pz),CONC(d),G);pbAdd(lbTube(7.8,.55,40,D-.1).translate(px,0,pz),CONC(d),G);
 const ring=new THREE.RingGeometry(7.3,7.8,40);ring.rotateX(-Math.PI/2);ring.translate(px,D+.45,pz);pbAdd(ring,CONC(d),G);
 pbAdd(lbDisc(7.3,D+(d===1?.15:.3),40).translate(px,0,pz),d===1?MAT.lbMud:MAT.lbWater,G);
 if(d===0){kput('pkCol',[px,D,pz],null,[.6,1.6,.6],new THREE.Color(0xf2f0ea));kput('finial',[px,D+3.2,pz],null,[.9,1.8,.9],null);
  for(let i=0;i<4;i++){const a=i/4*TAU+TAU/8;lbFlag(px+Math.cos(a)*12,D,pz+Math.sin(a)*12,12,a,new THREE.Color(i%2?0x2f6f9a:0xeaf6fb),0,{w:3,h:1.9});}}
 if(d===1){for(let i=0;i<22;i++){const a=rng()*TAU,r=rng()*6.5;kput('leafCard',[px+Math.cos(a)*r,D+.7,pz+Math.sin(a)*r],qEuler(0,rng()*TAU,0),[rr(.4,.9),rr(.8,1.4),rr(.4,.9)],new THREE.Color().setHSL(rr(.17,.26),.4,rr(.35,.5)));}
  VEG.tree(px+2,D,pz-1,0,9);}
 REGISTER({name:d===1?'Silted pool':'Court pool',x:px,z:pz,r:8,h:2,y:D});}
// A formal garden bed: clipped hedges round a lawn with trees (intact).
function lbFormal(G,x,z,w,dp,d){for(const e of [-1,1]){kput('hedge',[x,LB.DECK+.5,z+e*(dp/2)],null,[w,1,.9],new THREE.Color(0x3f6e34));kput('hedge',[x+e*w/2,LB.DECK+.5,z],null,[.9,1,dp],new THREE.Color(0x3f6e34));}
 kput('boxC',[x,LB.DECK+.05,z],null,[w-1,.12,dp-1],new THREE.Color(0x6a9a4a));
 for(const e of [-1,1])VEG.tree(x+e*w/4,LB.DECK,z,1,rr(5,7));}

// ---- the reclaimed fortress palace (d>=3)
function lbAuFortress(G,opt,d,GI){const D=LB.DECK,h=opt.W/2,L=opt.LAND,S=GI.S,ix=h-10.5,z0=-L+10.5,z1=-10.5;
 const gateAt=s=>S[s].kind!=='land'||s==='S';
 // the curtain: four runs, gates on the S side and on every side that opens to a neighbour
 const runs={S:[ix,z1,-ix,z1],N:[-ix,z0,ix,z0],W:[-ix,z1,-ix,z0],E:[ix,z0,ix,z1]};
 const inward={S:[0,-1],N:[0,1],W:[1,0],E:[-1,0]};
 for(const s of ['S','N','W','E']){const r=runs[s],len=Math.hypot(r[2]-r[0],r[3]-r[1]);const g=gateAt(s)?[[len/2-7,len/2+7]]:[];
  lbCurtain(G,r[0],r[1],r[2],r[3],d,{n:inward[s],gaps:g});
  if(g.length){const yaw=Math.atan2(-(r[3]-r[1]),r[2]-r[0]);lbGatehouse(G,(r[0]+r[2])/2,(r[1]+r[3])/2,yaw,d,{name:s==='S'?'Great gate':'Gatehouse'});}}
 // corner watchtowers (inside the corners, clear of the 8 m band)
 for(const [x,z] of [[-ix+3.5,z0+3.5],[ix-3.5,z0+3.5],[-ix+3.5,z1-3.5],[ix-3.5,z1-3.5]])lbWatchtower(G,x,z,d,{H:15,yaw:Math.atan2(x,-z)});
 // the broken tower: a lookout crown, a beacon, a great banner
 const tx=AU.TX,tz=AU.TZ,ty=D+36;
 kput('plank',[tx,ty+.3,tz],null,[13,.3,13],null);
 for(const a of [[-6,-6],[6,-6],[6,6],[-6,6]])lbBar(G,MAT.rust,[tx+a[0]*.6,ty-6,tz+a[1]*.6],[tx+a[0],ty+.2,tz+a[1]],.3,.3);
 for(let i=0;i<4;i++){const a=i*Math.PI/2;kput('pkGuard',[tx+Math.cos(a)*6.3,ty+.45,tz+Math.sin(a)*6.3],qEuler(0,-a+Math.PI/2,0),[2.4,1,1],null);}
 kput('pkCont20R',[tx-2.5,ty+.45,tz-2],qEuler(0,.3,0),1,new THREE.Color(0x7a4a32));kput('shantyRoof',[tx-2.5,ty+3.2,tz-2],qEuler(.06,.3,0),[7,1,3.6],null);
 kput('cgLattice',[tx+3,ty+.45,tz+2],null,[1,1.3,1],new THREE.Color(0x5a5048));kput('pkDish',[tx+3,ty+13.6,tz+2],qEuler(0,.7,0),2.6,null);
 firePit('lb',tx+2,ty+.5,tz-3,1.1);lbFlag(tx-4,ty+.45,tz+3,14,.3,LB_BANNER[0],3,{w:6,h:3.6});
 lbGuard(tx+4,ty+.45,tz-4,.8);lbGuard(tx-5,ty+.45,tz+1,-2.2);
 // the collapse filled: container houses stacked on the stump floors
 for(let i=0;i<5;i++){const p=AU.CUT[0]+(AU.CUT[1]-AU.CUT[0])*(i+.5)/5,P=lbArcP(AU.r0+10+(i%2)*9,p,0);
  portContainerHouse(G,P[0],D+AU.CUTK*AU.lh,P[2],-p+rr(-.2,.2),d,{levels:1+(i%3),lit:.6});}
 // banners: festooned from every level's parapet on the court side, full
 // height down the back wall toward the land
 const st=(AU.r1-AU.r0-8)/(AU.nL-1),cutp=p=>p>AU.CUT[0]-.03&&p<AU.CUT[1]+.03;
 for(let k=0;k<AU.nL;k++){const rk=AU.r0+k*st;
  for(let p=-AU.ph+.06+(k%2)*.05;p<AU.ph-.04;p+=.1){if(k>=AU.CUTK&&cutp(p))continue;
   const P=lbArcP(rk-.25,p,D+(k+1)*AU.lh+1.1);kput('pkCloth',P,qEuler(0,-p,0),[1.6,3.3,1],LB_BANNER[(k+Math.round(p*10))%2?1:0]);}}
 for(let i=0;i<7;i++){const p=-AU.ph+.1+(2*AU.ph-.2)*i/6;if(cutp(p))continue;const P=lbArcP(AU.r1+.3,p,D+AU.nL*AU.lh+1.2);
  kput('pkCloth',P,qEuler(0,-p+Math.PI,0),[3.4,17,1],LB_BANNER[i%2?1:0]);kput('pkCloth',[P[0],P[1]-3,P[2]],qEuler(0,-p+Math.PI,0),[1.3,4,1],LB_BANNER[i%2?0:2]);}
 // terrace gardens and lit windows
 for(let k=0;k<AU.nL-1;k++){const rk=AU.r0+k*st,y=D+(k+1)*AU.lh;
  for(let p=-AU.ph+.06;p<AU.ph-.04;p+=.07){if(k>=AU.CUTK&&cutp(p))continue;if(rng()<.3)continue;
   const P=lbArcP(rk+1.4,p,0);kput('planter',[P[0],y+.3,P[2]],qEuler(0,-p,0),[2.8,.6,1.1],null);
   for(let j=0;j<2;j++)kput('leafCard',[P[0]+rr(-1,1)*Math.cos(p),y+.95,P[2]+rr(-1,1)*Math.sin(p)],qEuler(0,rng()*TAU,0),[rr(.5,.9),rr(.4,.7),rr(.5,.9)],new THREE.Color().setHSL(rr(.2,.34),rr(.4,.6),rr(.4,.6)));
   if(rng()<.12)VEG.tree(P[0],y,P[2],(rng()*3)|0,rr(3,5));}
  for(let p=-AU.ph+.05;p<AU.ph;p+=.07){if(k>=AU.CUTK&&p>AU.CUT[0]&&p<AU.CUT[1])continue;if(rng()<.5)continue;
   const P=lbArcP(rk+.3,p,D+k*AU.lh+1.9);kput('dot',P,qEuler(0,-p,0),[1.1,1.4,.3],WARM);}}
 // the throne-hall court: a great tent on masts over the court, the dais
 const cx=AU.cx,cz=AU.cz-14,tw=40,td=28;
 const tent=gridSurface((u,v)=>{const x=cx+(u-.5)*tw,z=cz+(v-.5)*td;const pu=Math.abs(Math.sin(Math.PI*u*2)),pv=Math.sin(Math.PI*v);
  return [x,D+8.5+4.5*pv*(.35+.65*pu)-1.2*(1-pv),z];},24,12,{uS:5,vS:3});
 pbAdd(tent,MAT.lbTent,G,true);
 for(const u of [0,.25,.5,.75,1])for(const v of [0,.5,1]){const x=cx+(u-.5)*tw,z=cz+(v-.5)*td;const top=D+8.5+4.5*Math.sin(Math.PI*v)*(.35+.65*Math.abs(Math.sin(Math.PI*u*2)))-1.2*(1-Math.sin(Math.PI*v));
  if(u===.5&&v===.5)continue;
  kput('postR',[x,(D+top+1.4)/2,z],null,[.2,top+1.4-D,.2],new THREE.Color(0x5a4636));
  if(v!==.5)kput('pkCloth',[x,top+1.2,z],qEuler(0,0,Math.PI/2),[1.2,2.4,1],LB_BANNER[1]);}
 // the dais and the throne in front of the atrium
 // the pool floored over with timber: the audience floor
 pbAdd(lbDisc(7.8,D+.6,40).translate(AU.cx,0,AU.cz-10),MAT.timber,G);
 const dz=-51;for(let s=0;s<3;s++)kput('boxCR',[cx,D+.25+s*.5,dz+s*.6],null,[12-s*2.6,.5,6-s*1.2],new THREE.Color().setHSL(.08,.1,.62-s*.05));
 kput('plank',[cx,D+2.1,dz+1.4],null,[1.6,1.2,1.2],new THREE.Color(0xc8962e));kput('plank',[cx,D+3.6,dz+.9],null,[1.8,3.2,.3],new THREE.Color(0xc8962e));
 kput('plank',[cx,D+5.4,dz+.9],null,[.6,.6,.2],new THREE.Color(0xe8c050));
 for(const e of [-1,1]){lbBanner(cx+e*5.3,D+.5,dz+.5,7.5,0,LB_BANNER[0],{len:4.6});lbBrazier(cx+e*3.9,D+1,dz+2.6);}
 lbGuard(cx-2.2,D+1.5,dz+1.8,0);lbGuard(cx+2.2,D+1.5,dz+1.8,0);
 // the approach: a carpet from the great gate to the dais, guards lining it
 {const pz=AU.cz-10,ca=new THREE.Color(0x4a0c06),seg=(za,zb,y)=>kput('plank',[cx,y,(za+zb)/2],null,[3,.06,zb-za],ca);
  seg(dz+3,pz-7.9,D+.05);seg(pz-7.6,pz+7.6,D+.64);seg(pz+7.9,z1,D+.05);}
 const onPool=(x,z)=>Math.hypot(x-AU.cx,z-(AU.cz-10))<7.8;
 for(let z=-46;z<=-13;z+=4)for(const e of [-1,1]){const x=cx+e*3;lbGuard(x,onPool(x,z)?D+.6:D,z,0);}
 portFigures(-14,D,-40,10,5);portFigures(14,D,-40,10,5);portFigures(0,D+.6,-36,6,3);portFigures(-20,D,-30,10,6);portFigures(24,D,-26,8,6);
 // gardens in the plaza, orchards in the side courts
 for(const e of [-1,1]){portGarden(e*16,D,-20.5,12,5,d);portTrees(e*14-5,-44,e*14+5,-34,3,D,4,7);}
 portGarden(-26,D,-90,14,8,d);portGarden(26,D,-92,14,8,d);
 portWashLine(-30,-96,-12,-96,9,7);portWashLine(12,-98,32,-98,9,7);
 // market stalls just inside the great gate, and horse-less carts of salvage
 for(const x of [-20,-12,12,20])portStall(x,D,-14.8,Math.PI,LB_BANNER[(x>0?1:0)].clone().lerp(new THREE.Color(0xffffff),.35));
 portWeeds(-h+10,-L+10,h-10,-10,60,D);}
PORT_SEG({key:'lbAuthority',name:'Port Authority',cls:'seg',W:110,LAND:110,SEA:0,place:'land',decays:[0,1,3],stamps:lbAuthorityStamps,build:buildLbAuthority});
