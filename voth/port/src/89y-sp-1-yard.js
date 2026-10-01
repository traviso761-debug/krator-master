// ================================================================ SEA PLATFORM: spYard
// A fully aquatic 110 x 110 m container platform (place:'sea', LAND 0,
// SEA 110, local z in [0,110]): a RECLAIMED-LAND MOLE - fill stamped up from
// the seabed to the deck, a vertical quay wall on every side that faces
// water - carrying two warehouses, three blocks of 40' boxes, a light
// rail-mounted gantry over the middle block, a reach stacker and a yard
// office. Seeds 20900-20904 (spYard). Notes: voth/port/notes/seaplatform.md.
//
// WHY A MOLE, NOT A DECK ON PILES. The Long Beach piers the user points at
// (refs/long-beach.png) are reclaimed land. A fill stamp gives true ground
// contact for free (every container, weed and rubble heap lands on portH),
// two moles that abut merge FLUSH through the stamp edge rule (both sides are
// at DECK, so the seam has no trench and no step), the ruin can SUBSIDE (a
// ramp stamp tilts a corner block into the sea) instead of needing broken
// slab geometry, and it costs no columns. A piled neighbour still meets a
// finished face: a joined side keeps a plain wall below the deck line.
//
// SIDES. N = the -z edge (z=0: toward the land / the pier it hangs off),
// S = the +z edge (z=110, open sea), W = -x, E = +x. A side is JOINED when
// (in this order, later wins):
//   1. the layout (PORT_LAYOUT.items) holds another place:'sea' platform
//      whose footprint abuts that side along its whole length, or - N only -
//      the `pier` anchor whose deck head ends 0..12 m short of our z=0 edge
//      and covers at least half our width (then a LINK SPAN bridges the gap);
//   2. opt.nb carries four-sided N/S/E/W entries (the grid layout, when it
//      lands): kind 'seg' joins, anything else leaves the side open. A
//      two-sided coastal nb {W,E} is ignored (a coastal run's neighbour is not
//      beside a sea platform);
//   3. opt.join = {N,S,E,W} booleans override both.
// A joined side has no coping, fenders or lamps; the fill runs to the edge
// and the paving meets the neighbour's. An open side is a finished quay:
// coping, fenders, ladders, bollards, tide line, lamps, corner bollards.
//   d=0 intact   white warehouses, painted boxes, gantry at work, stacker,
//                office lit cyan, lane markings, people
//   d=1 ruined   one corner block (an open-water corner) subsided and
//                awash, walls sunk and leaning; stacks toppled into the
//                sea; the big warehouse's roof down; the gantry collapsed
//                onto the stacks; weeds, trees, rubble
//   d=3 reclaimed a container village on the blocks, two container towers,
//                a market in the warehouse, houses on the gantry, floating
//                gardens and a house raft moored alongside, skiffs, lights
const SP={SLUMP:46,LINK_MAX:12,BAY:12.8,ROW:2.74,SIDES:['N','S','E','W']};
MAT.spYellow=new THREE.MeshStandardMaterial({color:0xd9a12c,roughness:.55,metalness:.3});
MAT.spRoof=new THREE.MeshStandardMaterial({map:TEX.pkRib,color:0xe6e4de,roughness:.6,metalness:.3,side:DS});
MAT.spDrum=new THREE.MeshStandardMaterial({color:0x2f4f6a,roughness:.6,metalness:.2});

// ---------------------------------------------------------------- sides
// The four edges in the local frame: from a to b, outward normal n.
function spSide(k,h,S){
 if(k==='N')return {a:[-h,0],b:[h,0],n:[0,-1]};
 if(k==='S')return {a:[-h,S],b:[h,S],n:[0,1]};
 if(k==='W')return {a:[-h,0],b:[-h,S],n:[-1,0]};
 return {a:[h,0],b:[h,S],n:[1,0]};}
// Which sides are joined (see the header). Works in stamps() too: the scene
// defines PORT_LAYOUT before it collects any stamps.
function spSides(opt){const h=opt.W/2,S=opt.SEA,me={x0:opt.gx-h,x1:opt.gx+h,z0:opt.gz,z1:opt.gz+S};
 const out={N:{j:false},S:{j:false},E:{j:false},W:{j:false}};
 const L=(typeof PORT_LAYOUT!=='undefined'&&PORT_LAYOUT&&PORT_LAYOUT.items)||[];
 const ov=(a0,a1,b0,b1)=>Math.min(a1,b1)-Math.max(a0,b0);
 for(const it of L){if(it.vessel)continue;const R=portRegOf(it.key);if(!R)continue;
  if(it.key===opt.key&&it.d===opt.d&&Math.abs(it.gx-opt.gx)<.01&&Math.abs(it.gz-opt.gz)<.01)continue;
  const F={x0:it.gx-R.W/2,x1:it.gx+R.W/2,z0:it.gz-R.LAND,z1:it.gz+R.SEA};
  if(R.place==='sea'){const oz=ov(me.z0,me.z1,F.z0,F.z1),ox=ov(me.x0,me.x1,F.x0,F.x1);
   if(Math.abs(F.x0-me.x1)<1&&oz>S-1)out.E={j:true,key:it.key};
   if(Math.abs(F.x1-me.x0)<1&&oz>S-1)out.W={j:true,key:it.key};
   if(Math.abs(F.z0-me.z1)<1&&ox>opt.W-1)out.S={j:true,key:it.key};
   if(Math.abs(F.z1-me.z0)<1&&ox>opt.W-1)out.N={j:true,key:it.key};}
  else if(it.key==='pier'&&typeof PP!=='undefined'){const gap=me.z0-(it.gz+PP.END);
   if(gap>-.5&&gap<=SP.LINK_MAX){const px0=it.gx+PP.X0,px1=it.gx+PP.X1;
    if(ov(me.x0,me.x1,px0,px1)>=opt.W*.5)out.N={j:true,key:'pier',
     pier:{x0:Math.max(me.x0,px0)-opt.gx,x1:Math.min(me.x1,px1)-opt.gx,gap:Math.max(0,gap),wz:it.gz+PP.END,wx0:px0,wx1:px1}};}}}
 const nb=opt.nb||{};
 if(nb.N||nb.S)for(const s of SP.SIDES){const k=nb[s]&&nb[s].kind;if(!k)continue;
  if(k==='seg'){if(!out[s].j)out[s]={j:true,key:nb[s].key};}else out[s]={j:false};}
 const J=opt.join||{};
 for(const s of SP.SIDES)if(typeof J[s]==='boolean'&&J[s]!==out[s].j)out[s]=J[s]?Object.assign({},out[s],{j:true}):{j:false};
 return out;}
// The subsided corner block at d=1: the first corner whose two sides both
// face open water (SE, SW, NE, NW); none if every corner has a neighbour.
// The block tilts along z toward its open N/S face.
function spSlump(opt,sd,corners){if(opt.d!==1)return null;const h=opt.W/2,S=opt.SEA,B=SP.SLUMP,D=PORT.DECK;
 for(const c of (corners||[[1,1],[-1,1],[1,-1],[-1,-1]])){const sx=c[0],sz=c[1];
  if(sd[sx>0?'E':'W'].j||sd[sz>0?'S':'N'].j)continue;
  const x0=sx>0?h-B:-h,x1=sx>0?h:-h+B,z0=sz>0?S-B:0,z1=sz>0?S:B;
  const hi=D-1.3,lo=-2.4;
  return {sx,sz,x0,x1,z0,z1,ya:sz>0?hi:lo,yb:sz>0?lo:hi,in:(x,z)=>x>x0&&x<x1&&z>z0&&z<z1};}
 return null;}

// ---------------------------------------------------------------- stamps
function spStamps(o){const sd=spSides(o);return spMoleStamps(o,spSlump(o,sd)).concat(portEdgeStamps(o,{LAND:0,SEA:o.SEA}));}
// The mole itself (shared by every sp platform): the berth ring, the fill,
// and at d=1 the subsided corner block as a ramp.
function spMoleStamps(o,sl){const d=o.d,h=o.W/2,S=o.SEA,D=PORT.DECK,pv=d>=1?'soil':'pave';
 // a dredged berth round the mole: only its soft ring shows (the fill below
 // covers the hard shape), deepening the water off every face
 const s=[{kind:'dig',x0:-h,z0:0,x1:h,z1:S,y:PORT.BERTH,soft:28}];
 if(!sl)s.push({kind:'fill',x0:-h,z0:0,x1:h,z1:S,y:D,paint:pv});
 else{
  if(sl.sz>0)s.push({kind:'fill',x0:-h,z0:0,x1:h,z1:sl.z0,y:D,paint:pv});
  else s.push({kind:'fill',x0:-h,z0:sl.z1,x1:h,z1:S,y:D,paint:pv});
  if(sl.sx>0)s.push({kind:'fill',x0:-h,z0:sl.z0,x1:sl.x0,z1:sl.z1,y:D,paint:pv});
  else s.push({kind:'fill',x0:sl.x1,z0:sl.z0,x1:h,z1:sl.z1,y:D,paint:pv});
  s.push({kind:'ramp',x0:sl.x0,z0:sl.z0,x1:sl.x1,z1:sl.z1,axis:'z',ya:sl.ya,yb:sl.yb,paint:'mud'});}
 return s;}

// ---------------------------------------------------------------- small geometry
// A world-UV box from a to b (long axis), cross-section w x dp, into the batch.
function spBarGeo(a,b,w,dp){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz)||.01;
 const g=boxUV(w,L,dp,8);
 g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(_UP,new THREE.Vector3(dx/L,dy/L,dz/L))));
 g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);return g;}
function spBar(P,mat,a,b,w,dp,nr){pbAdd(spBarGeo(a,b,w,dp===undefined?w:dp),mat,P,nr);}
// local frame of a rotated prop: (lx,lz) -> [x,z]
function spRot(x,z,yaw){const c=Math.cos(yaw),s=Math.sin(yaw);return (lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];}

// ---------------------------------------------------------------- edges
// Every side: a finished quay if open, a plain face below the deck if joined,
// the link span if the pier is the N neighbour. Returns the wall infos of the
// open sides (ladders for boats and rafts).
function spEdges(G,d,opt,sd,sl,xg){xg=xg||{};const h=opt.W/2,S=opt.SEA,D=PORT.DECK,walls={};
 for(const k of SP.SIDES){const g=spSide(k,h,S);
  if(sd[k].j){
   if(k==='N'&&sd.N.pier){const P=sd.N.pier;
    portQuayWall(G,P.x0,0,P.x1,0,d,{face:g.n,top:D-1.2,cope:false,fenders:0,ladders:0,bollards:0});
    if(P.x0>-h+.5)walls.N0=portQuayWall(G,-h,0,P.x0,0,d,{face:g.n,ladders:0,bollards:14});
    if(P.x1<h-.5)walls.N1=portQuayWall(G,P.x1,0,h,0,d,{face:g.n,ladders:0,bollards:14});}
   else portQuayWall(G,g.a[0],g.a[1],g.b[0],g.b[1],d,{face:g.n,top:D-.6,cope:false,tide:false,fenders:0,ladders:0,bollards:0});
   continue;}
  const gaps=(xg[k]||[]).slice();
  if(sl){if(k===(sl.sz>0?'S':'N'))gaps.push([sl.x0+h,sl.x1+h]);if(k===(sl.sx>0?'E':'W'))gaps.push([sl.z0,sl.z1]);}
  walls[k]=portQuayWall(G,g.a[0],g.a[1],g.b[0],g.b[1],d,{face:g.n,gaps,ladders:36,bollards:18,fenders:12});
  // lamps along the open face, arm over the water
  const yaw=Math.atan2(g.n[0],g.n[1]);
  const len=Math.hypot(g.b[0]-g.a[0],g.b[1]-g.a[1]);
  for(let s=14;s<len-4;s+=27){const x=g.a[0]+(g.b[0]-g.a[0])*s/len-g.n[0]*4.5,z=g.a[1]+(g.b[1]-g.a[1])*s/len-g.n[1]*4.5;
   if(sl&&sl.in(x,z))continue;if(gaps.some(q=>s>q[0]-4&&s<q[1]+4))continue;portLamp(x,D,z,yaw,d);}}
 // heavy corner bollards where two open faces meet
 for(const c of [[-1,-1],[1,-1],[-1,1],[1,1]]){if(sd[c[0]>0?'E':'W'].j||sd[c[1]>0?'S':'N'].j)continue;
  const x=c[0]*(h-2.2),z=c[1]>0?S-2.2:2.2;if(sl&&sl.in(x,z))continue;
  kput('pkBollard',[x,D,z],qEuler(0,rng()*TAU,0),1.7,d>0?new THREE.Color(0x9a6040):null);}
 if(sl)spSlumpWalls(G,d,opt,sl);
 if(sd.N.pier){if(sd.N.pier.gap>.3)spLinkSpan(G,d,opt,sd.N.pier);spClearPierHead(opt,sd.N.pier);}
 return walls;}

// A stretch of quay wall that sank with the ground behind it: pieces that
// follow the ground's fall, lean out, cracked apart, coping knocked askew.
function spSunkWall(G,d,ax,az,bx,bz,n){const L=Math.hypot(bx-ax,bz-az),np=Math.max(1,Math.round(L/7.6)),pl=L/np;
 const tx=(bx-ax)/L,tz=(bz-az)/L,yaw=Math.atan2(n[0],n[1]),lt=[n[1],-n[0]];   // lt = local +x after the yaw
 const sgn=tx*lt[0]+tz*lt[1]>0?1:-1;
 for(let i=0;i<np;i++){const s0=i*pl,s1=s0+pl,cx=ax+tx*(s0+s1)/2,cz=az+tz*(s0+s1)/2;
  const g0=portH(ax+tx*s0-n[0]*1.6,az+tz*s0-n[1]*1.6)+.5,g1=portH(ax+tx*s1-n[0]*1.6,az+tz*s1-n[1]*1.6)+.5;
  const tA=sgn>0?g0:g1,tB=sgn>0?g1:g0,top=(tA+tB)/2,yb=Math.min(portH(cx+n[0]*2,cz+n[1]*2)-2,top-4),H=top-yb;
  const len=pl-rr(.25,.7),slope=Math.atan2(tB-tA,pl),lean=rr(.03,.11);
  const g=boxUV(len,H,2.5,8);g.translate(0,-H/2,-1.25);g.rotateZ(slope);g.rotateX(lean);g.rotateY(yaw);g.translate(cx,top,cz);
  pbAdd(g,CONC(d),G,true);
  const M=new THREE.Matrix4().compose(new THREE.Vector3(cx,top,cz),new THREE.Quaternion().setFromEuler(new THREE.Euler(lean,yaw,slope,'YXZ')),new THREE.Vector3(1,1,1));
  const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(lean,yaw,slope,'YXZ'));
  for(let k=0;k<Math.round(len/5);k++){if(rng()<.35)continue;const u=(k+.5)*len/Math.round(len/5)-len/2;
   const p=new THREE.Vector3(u,.2,-.55).applyMatrix4(M);
   kput('pkCope',[p.x,p.y,p.z],q.clone().multiply(qEuler(rr(-.05,.05),rr(-.06,.06),rr(-.05,.05))),[4.6,.4,1.3],new THREE.Color().setHSL(.08,rr(.04,.1),rr(.42,.56)));}
  if(rng()<.6)kput('stain',[cx+n[0]*.1,top-1.6,cz+n[1]*.1],qFacing([n[0],0,n[1]]),[rr(1.5,3),rr(2,3.5),1],null);}}
// The ruined corner: outer walls sunk, the scarp where the block broke away
// from the mole faced in rough concrete with rubble at its foot, the block's
// paving tilted and half gone, awash at its low edge.
function spSlumpWalls(G,d,opt,sl){const h=opt.W/2,S=opt.SEA,D=PORT.DECK;
 const zE=sl.sz>0?S:0;spSunkWall(G,d,sl.x0,zE,sl.x1,zE,[0,sl.sz]);
 const xE=sl.sx>0?h:-h;spSunkWall(G,d,xE,sl.z0,xE,sl.z1,[sl.sx,0]);
 const o={cope:false,tide:false,fenders:0,ladders:0,bollards:0};
 const zi=sl.sz>0?sl.z0:sl.z1,xi=sl.sx>0?sl.x0:sl.x1;
 portQuayWall(G,sl.x0,zi,sl.x1,zi,d,Object.assign({face:[0,sl.sz]},o));
 portQuayWall(G,xi,sl.z0,xi,sl.z1,d,Object.assign({face:[sl.sx,0]},o));
 for(let i=0;i<22;i++){const t=rng();const onX=rng()<.5;
  const x=onX?lerp(sl.x0,sl.x1,t):xi+sl.sx*rr(.5,4),z=onX?zi+sl.sz*rr(.5,4):lerp(sl.z0,sl.z1,t);
  if(!sl.in(x,z))continue;portRubble(x,portH(x,z),z,rr(1.2,2.6),3);}
 const sd0=rr(0,50);
 pbAdd(gridSurface((u,v)=>{const x=lerp(sl.x0,sl.x1,u),z=lerp(sl.z0,sl.z1,v);return[x,portH(x,z)+.05,z];},23,23,
  {uS:(sl.x1-sl.x0)/16,vS:(sl.z1-sl.z0)/16,hole:(u,v)=>{const x=lerp(sl.x0,sl.x1,u),z=lerp(sl.z0,sl.z1,v);
   return portH(x,z)<-1.4||u<.03||u>.97||v<.03||v>.97||h3(Math.floor(x/4),Math.floor(z/4),sd0)<.3;}}),MAT.pkPaveR,G,true);
 portWeeds(sl.x0+3,sl.z0+3,sl.x1-3,sl.z1-3,40,null);}

// The link span to the Great pier's head: a slab over the gap at deck
// level, paved like the platform, white fascia and a guard rail on its
// exposed ends (the pier deck's own finish), a steel joint plate over the
// pier head's fascia lip and one over our wall. The pier's head guard rail
// and fenders across the span are taken out of the kit (see notes: a shared
// change would let the pier skip them itself).
function spLinkSpan(G,d,opt,P){const D=PORT.DECK,g=P.gap,w=P.x1-P.x0,cx=(P.x0+P.x1)/2;
 pbBox(G,CONC(d),cx,D-.6,-g/2+.15,w,1.2,g+.3,0,8);
 portPaving(G,P.x0,-g+.7,P.x1,0,d,{broken:d===1?.1:0});
 pbBox(G,MAT.pkSteel,cx,D+.19,-g+.15,w,.08,1.5,0,4);
 pbBox(G,MAT.pkSteel,cx,D+.07,.1,w,.06,.9,0,4);
 for(const s of [-1,1]){const x=s>0?P.x1:P.x0;
  pbBox(G,d>0?MAT.rust:MAT.white,x+s*.15,D-.7,-g/2,.3,1.9,g,0,8);
  if(!(d===1&&rng()<.4))kput('pkGuard',[x-s*.3,D,-g/2],qEuler(0,Math.PI/2,0),[g/5,1,1],d>0?new THREE.Color(0x8a5a3a):null);}
 }
// The pier head's guard rail and fenders across the join come out of the kit
// (the pier is built first in any layout that places it before us; a shared
// change - the pier skipping them when a platform abuts - is requested).
function spClearPierHead(opt,P){const x0=opt.gx+P.x0,x1=opt.gx+P.x1;
 for(const nm of ['pkGuard','pkFender']){const A=KIT.items[nm];if(!A)continue;
  KIT.items[nm]=A.filter(o=>!(o.p[0]>x0+.2&&o.p[0]<x1-.2&&Math.abs(o.p[2]-P.wz)<1.2));}}

// ---------------------------------------------------------------- containers
// A stack settled on whatever ground is under it: on the deck it stands
// square; on the subsided block it tilts with the slope and slides downhill,
// and whatever reaches the water floats half sunk.
function spSettle(x,z,n,d,slide){const e=1.5;let px=x,pz=z;
 let gx_=(portH(px-e,pz)-portH(px+e,pz))/(2*e),gz_=(portH(px,pz-e)-portH(px,pz+e))/(2*e);
 if(Math.hypot(gx_,gz_)>.03&&slide){const L=Math.hypot(gx_,gz_),m=rr(1,slide);px+=gx_/L*m;pz+=gz_/L*m;
  gx_=(portH(px-e,pz)-portH(px+e,pz))/(2*e);gz_=(portH(px,pz-e)-portH(px,pz+e))/(2*e);}
 const gy=portH(px,pz),yaw=rr(-.08,.08);
 if(gy<-.6){portContainer(px,rr(-1.7,-.9),pz,yaw+rr(-.4,.4),true,d,null,[rr(-.35,.35),rr(-.3,.3)]);return;}
 const up=new THREE.Vector3(gx_,1,gz_).normalize(),qn=new THREE.Quaternion().setFromUnitVectors(_UP,up);
 for(let t=0;t<n;t++){const q=qn.clone().multiply(qEuler(rr(-.02,.02),yaw+rr(-.03,.03),rr(-.02,.02)));
  kput('pkCont40R',[px+up.x*t*2.6,gy+up.y*t*2.6,pz+up.z*t*2.6],q,1,portContColor(d));}}
// A block of 40' boxes, long axis along x: bays at xs, nRow rows about zc,
// 1..nt high. o.skip(x,z) leaves a slot empty. Returns the stacks [x,z,n].
function spBlock(xs,zc,nRow,nt,d,o){o=o||{};const D=PORT.DECK,out=[];
 for(const x of xs)for(let r=0;r<nRow;r++){const z=zc+(r-(nRow-1)/2)*SP.ROW;if(o.skip&&o.skip(x,z))continue;
  const n=Math.max(0,Math.min(nt,Math.round(rr(.2,nt+.45))));if(!n)continue;
  if(d===1)spSettle(x,z,n,d,o.slide||8);
  else for(let t=0;t<n;t++)portContainer(x+rr(-.05,.05),D+t*2.6,z+rr(-.03,.03),rr(-.008,.008),true,d);
  out.push([x,z,n]);}
 return out;}

// ---------------------------------------------------------------- the warehouse
// spWarehouse(G, x0,z0,x1,z1, h, d, o): a portal-frame warehouse, long along
// z, shallow gable roof in ribbed sheet with a ridge vent, panelled walls on
// a concrete plinth, a clerestory of panes, roller doors and a canopy on the
// o.doorSide face (+1 = +x). o.roofDown (d=1): the roof has fallen in over
// all but the first bays - sheets hang from the eaves to the floor, a few
// trusses stand, the far gable is down, bays of the back wall gone.
function spWarehouse(G,x0,z0,x1,z1,h,d,o){o=Object.assign({doorSide:1,name:'Warehouse',roofDown:false,rise:(x1-x0)*.12,canopy:true},o||{});
 const D=PORT.DECK,w=x1-x0,L=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2,rise=o.rise,sk=SHELL(d),ruin=d>0,ds=o.doorSide;
 const nb=Math.max(2,Math.round(L/6)),bl=L/nb,keep=o.roofDown?Math.max(1,Math.round(nb*.3)):nb;
 for(const s of [-1,1])pbBox(G,CONC(d),cx+s*(w/2-.1),D+.55,cz,.5,1.1,L+.5,0,8);
 for(const zz of [z0,z1])pbBox(G,CONC(d),cx,D+.55,zz,w+.5,1.1,.5,0,8);
 // long walls, bay by bay
 for(const s of [-1,1])for(let i=0;i<nb;i++){const zm=z0+(i+.5)*bl;
  if(o.roofDown&&s===-ds&&i>=keep&&rng()<.4){portRubble(cx+s*(w/2+1.2),D,zm,2.6,6);continue;}
  const top=o.roofDown&&i>=keep&&rng()<.35?h*rr(.45,.85):h;
  pbBox(G,sk,cx+s*w/2,D+top/2,zm,.3,top,bl-.05,0,8);
  if(top===h&&!(d===1&&rng()<.5))kput(d===0?'pane':'paneD',[cx+s*(w/2+.04),D+h-1.2,zm],qEuler(0,Math.PI/2,0),[bl*.8,1.2,1],null);}
 // gables: a wall to the eaves and the triangle over it
 const gable=zz=>{pbBox(G,sk,cx,D+h/2,zz,w,h,.3,0,8);
  pbAdd(gridSurface((u,v)=>[x0+u*w,D+h+v*rise*(1-Math.abs(2*u-1)),zz],8,1,{uS:w/8,vS:rise/8}),sk,G);
  if(d===0)kput('strip',[cx,D+h+.6,zz+(zz>cz?.2:-.2)],null,[w*.5,1,1],CYAN);};
 gable(z0);if(!o.roofDown)gable(z1);else{pbBox(G,sk,cx,D+h*.3,z1,w,h*.6,.3,0,8);portRubble(cx,D,z1+2,6,16);}
 // roof slopes (s=-1 west, +1 east), u from the eave to the ridge
 const zr=o.roofDown?z0+keep*bl:z1,hf=ruin?holeFn(d,rr(0,90),null,1.3):null;
 for(const s of [-1,1])pbAdd(gridSurface((u,v)=>[cx+s*(1-u)*(w/2+.5),D+h+u*rise-.08*(1-u),lerp(z0-.4,zr+(o.roofDown?0:.4),v)],4,Math.max(2,Math.round((zr-z0)/4)),
  {uS:(w/2)/8,vS:(zr-z0)/8,hole:hf?(u,v)=>hf(u*.5+(s>0?.5:0),v*L*.4+h):null}),ruin?MAT.rust:MAT.spRoof,G);
 if(!o.roofDown)pbBox(G,ruin?MAT.rust:MAT.pkPaint,cx,D+h+rise+.25,cz,1.6,.5,L*.9,0,8);
 else{
  // the fallen roof: sheets from the eaves (or a stub of wall) down to the floor, trusses left standing
  for(let i=keep;i<nb;i++){const zm=z0+(i+.5)*bl;
   for(const s of [-1,1]){if(rng()<.25)continue;
    spBar(G,MAT.rust,[cx+s*w/2*rr(.92,1),D+h*rr(.35,.8),zm+rr(-.4,.4)],[cx-s*rr(-1.5,2.5),D+rr(.3,1.4),zm+rr(-.8,.8)],.18,bl-.5);}
   if(rng()<.35){const z=z0+i*bl;spBar(G,MAT.rust,[x0+.2,D+h,z],[cx,D+h+rise,z],.35,.35);spBar(G,MAT.rust,[cx,D+h+rise,z],[x1-.2,D+h,z],.35,.35);}
   if(rng()<.5)portRubble(cx+rr(-w/3,w/3),D,zm,2.5,5);}
  portWeeds(x0+2,zr+1,x1-2,z1-2,50,D);portTrees(x0+4,zr+4,x1-4,z1-4,3,D,4,9);}
 // doors and the canopy on the door side
 for(let i=1;i<nb;i+=2){const zm=z0+(i+.5)*bl;if(o.roofDown&&i>=keep&&rng()<.5)continue;
  kput('pkDoor',[cx+ds*(w/2+.06),D+2.9,zm],qEuler(0,Math.PI/2,0),[Math.min(5.2,bl-1),5.8,1],d===0?new THREE.Color(0x3a5a78):new THREE.Color(0x6a3a2a));}
 if(o.canopy&&h>=8){const cL=o.roofDown?keep*bl:L*.94,cz2=o.roofDown?z0+cL/2:cz;
  pbBox(G,sk,cx+ds*(w/2+2.2),D+6.9,cz2,4.4,.3,cL,0,8);
  if(o.roofDown){const zc=z0+cL+4;spBar(G,MAT.rust,[cx+ds*(w/2+.2),D+6.8,zc],[cx+ds*(w/2+3),D+.3,zc+6],.3,4.4);}}
 if(ruin){scatterMoss(cx,D,cz,2,Math.min(w,L)*.45,14,2);for(let i=0;i<Math.round(L/8);i++)kput('vine',[cx+(rng()<.5?-1:1)*(w/2+.35),D+h+.1,rr(z0,z1)],null,[rr(.8,1.4),rr(3,h*.9),rr(.8,1.4)],null);}
 // volumes: circles of the hall's half width, inside its own footprint
 const r=w*.45,nr=Math.max(1,Math.ceil((L-2*r)/(2*r))+1);
 for(let i=0;i<nr;i++)REGISTER({name:o.name,x:cx,z:nr>1?lerp(z0+r,z1-r,i/(nr-1)):cz,r,h:h+rise,y:D});}

// ---------------------------------------------------------------- the yard office
// Two storeys of glass between white slabs, a roof terrace with a rail and a
// radio mast; cyan-lit at d=0. Ruined: glass out, vines; reclaimed: a house on
// the roof and planters.
function spOffice(G,x,z,w,dp,d){const D=PORT.DECK,ruin=d>0,fl=3.8,sk=SHELL(d);
 for(let f=0;f<=2;f++)pbBox(G,f?sk:CONC(d),x,D+f*fl+(f?0:.25),z,w+(f?1:0),f?.45:.5,dp+(f?1:0),0,8);
 for(const a of [[-1,-1],[1,-1],[-1,1],[1,1]])pbBox(G,sk,x+a[0]*(w/2-.3),D+fl,z+a[1]*(dp/2-.3),.6,fl*2,.6,0,8);
 pbBox(G,sk,x-w/2+1.6,D+fl,z,3.2,fl*2,dp-1,0,8);                        // stair core
 for(let f=0;f<2;f++){const y=D+f*fl+2;
  for(const s of [-1,1]){for(let u=-dp/2+1.6;u<dp/2-1;u+=2.6){if(ruin&&rng()<.45)continue;
    kput(d===0?'pane':'paneD',[x+s*(w/2-.4),y,z+u],qEuler(0,Math.PI/2,0),[2.4,2.9,1],null);}
   for(let u=-w/2+1.6;u<w/2-1;u+=2.6){if(ruin&&rng()<.45)continue;
    kput(d===0?'pane':'paneD',[x+u,y,z+s*(dp/2-.4)],null,[2.4,2.9,1],null);}}
  if(d===0)for(let k=0;k<4;k++)kput('cell',[x+rr(-w/3,w/3),y+1.2,z+rr(-dp/3,dp/3)],null,[2.2,.12,1],CYAN);}
 const top=D+2*fl+.25;
 for(let u=-w/2+2.5;u<w/2;u+=5)for(const s of [-1,1])if(!(d===1&&rng()<.4))kput('pkGuard',[x+u,top,z+s*(dp/2+.2)],null,[1,1,1],ruin?new THREE.Color(0x8a5a3a):null);
 if(d!==1){kput('pkCol',[x+w/2-1.5,top,z-dp/2+1.5],null,[.12,9,.12],ruin?new THREE.Color(0x9a8a7a):null);
  kput('dot',[x+w/2-1.5,top+9.1,z-dp/2+1.5],null,[.35,.35,.35],new THREE.Color(0xff3522));}
 else{kput('pkCol',[x+w/2-1,top+.2,z-dp/2+2],qEuler(0,.6,Math.PI/2-.1),[.12,9,.12],new THREE.Color(0x8a7060));
  vinesOnRing(x,top,z,Math.min(w,dp)*.55,10,7);mossOnRing(x,top,z,Math.min(w,dp)*.3,8,1.4);}
 if(d>=3){portContainerHouse(G,x+1,top,z+.5,Math.PI/2,d,{levels:1,big:false,noReg:true});
  portGarden(x-2,top,z-2,w*.35,dp*.35,d);}
 REGISTER({name:'Yard office',x,z,r:Math.max(w,dp)*.55,h:2*fl+(d>=3?4:9),y:D});}

// ---------------------------------------------------------------- the gantry
// A light rail-mounted gantry spanning a container block: legs at z=zA and zB
// (rails along x), girders across at ~18 m, a trolley and spreader with a box.
// o.lean (d=1): the far legs buckled; the frame pivots on its near feet and
// its girders lie across the stacks. o.houses (d=3): a house on the girders.
function spGantry(G,xc,zA,zB,d,o){o=Object.assign({lean:0,hg:18,t:.4,houses:false},o||{});
 const D=PORT.DECK,H=new THREE.Group();H.position.set(xc,D,zA);G.add(H);H.rotation.x=o.lean;
 const L=zB-zA,hg=o.hg,ruin=d>0,mw=ruin?MAT.rust:MAT.white,mb=ruin?MAT.rust:(MAT.cgBlue||MAT.pkIron),lx=4.2;
 for(const z of (o.lean?[0]:[0,L])){
  for(const s of [-1,1])spBar(H,mw,[s*lx,1.5,z],[s*lx*.72,hg,z],.9,1.2,true);
  spBar(H,mb,[-lx-1.5,1.4,z],[lx+1.5,1.4,z],1,1.4,true);                       // sill
  spBar(H,mw,[-lx*.72-.5,hg-.3,z],[lx*.72+.5,hg-.3,z],1.3,1.4,true);            // leg-top beam
  spBar(H,mb,[-lx+.3,2.2,z],[lx*.72-.3,hg-1.2,z],.28,.28,true);}              // brace
 if(o.lean){for(const s of [-1,1])spBar(G,MAT.rust,[xc+s*lx,D+.6,zB-1],[xc+s*lx*.4+rr(-2,2),D+.9,zB-9],.9,1.2,true);}
 for(const s of [-1,1])spBar(H,mw,[s*1.8,hg+.6,-2.6],[s*1.8,hg+.6,L+2.6],1.8,1,true);
 const tz=o.t*L;pbAdd(pgeo(boxUV(5,1.6,4.2,8),0,hg+2.2,tz,0),mb,H,true);
 pbAdd(pgeo(boxUV(2.2,2.2,2.4,8),lx*.72-1.3,hg-2.2,tz+2.2,0),mw,H,true);        // cab
 if(!o.lean){const ys=hg-7.5;for(const a of [[-2,-.8],[2,-.8],[-2,.8],[2,.8]])spBar(H,MAT.pkIron,[a[0],hg+1.4,tz+a[1]],[a[0]*1.6,ys+.5,tz+a[1]],.06,.06,true);
  pbAdd(pgeo(boxUV(12.4,.5,2.6,8),0,ys+.25,tz,0),mb,H,true);}
 useGroupXF(H);
 if(!o.lean){kput('pkCont40',[0,hg-10.6,tz],null,1,d===0?new THREE.Color(0x2f5f8a):portContColor(d));}
 if(d===0){kput('dot',[0,hg+3.1,tz],null,[.4,.4,.4],new THREE.Color(0xff3522));for(const s of [-1,1])kput('dot',[s*1.8,hg-.4,L/2],null,[1.6,.25,.5],CYAN);}
 if(typeof KIT.defs.cgBogie!=='undefined')for(const z of (o.lean?[0]:[0,L]))for(const s of [-1,1])kput('cgBogie',[s*lx,0,z],null,[.8,1,1],ruin?new THREE.Color(0x8a5a40):null);
 if(o.houses){kput('plank',[0,hg+1.6,L*.7],null,[5.4,.2,9],null);
  portContainerHouse(G,0,hg+1.7,L*.7,Math.PI/2,d,{levels:1,big:false,noReg:true,lit:.7});
  kput('pkLadder',[lx*.72+.8,hg,L],qEuler(0,Math.PI/2,0),[1,hg/10,1],null);
  for(let z=-2;z<L+2;z+=3)kput('dot',[1.8,hg-.3,z],null,[.3,.3,.3],WARM);}
 endGroupXF();
 REGISTER({name:'Rail gantry',x:xc,z:zA+(o.lean?9:L/2),r:Math.max(L/2+3,lx+2),h:hg+3,y:D});
 return H;}

// ---------------------------------------------------------------- the reach stacker
// A reach stacker facing +x at yaw 0 (boom up over its nose), a box held
// crosswise under the spreader. o.down (d=1): boom dropped, box on its side.
function spStacker(G,x,z,yaw,d,o){o=Object.assign({down:false,load:true},o||{});
 const D=PORT.DECK,R=new THREE.Group();R.position.set(x,D,z);R.rotation.y=yaw;G.add(R);
 const m=d>0?MAT.rust:MAT.spYellow,sink=o.down?-.18:0;
 pbAdd(pgeo(boxUV(8.6,1.3,3.4,8),0,1.55+sink,0,0),m,R,true);
 pbAdd(pgeo(boxUV(1.8,2.4,3.4,8),-4.2,2.4+sink,0,0),m,R,true);                     // counterweight
 pbAdd(pgeo(boxUV(2.2,2.3,1.9,8),-1,3.4+sink,1.1,0),m,R,true);                      // cab
 pbAdd(pgeo(boxUV(2.25,.9,1.95,8),-1,4.1+sink,1.1,0),MAT.pkIron,R,true);            // cab glazing band
 for(const a of [[2.7,1.55,1.05],[2.7,-1.55,1.05],[-2.8,1.5,.85],[-2.8,-1.5,.85]])
  pbAdd(new THREE.CylinderGeometry(a[2],a[2],.8,12).rotateX(Math.PI/2).translate(a[0],a[2]+sink*.5,a[1]),MAT.pkRubber,R,true);
 const ang=o.down?-.04:.32,piv=[-3.4,3.2+sink,0],Lb=12.5,tip=[piv[0]+Lb*Math.cos(ang),piv[1]+Lb*Math.sin(ang),0];
 spBar(R,m,piv,tip,.95,.95,true);spBar(R,MAT.pkSteel,[.8,2.2,0],[2.9,piv[1]+5*Math.sin(ang)+.1,0],.35,.35,true);
 pbAdd(pgeo(boxUV(.6,.6,12.3,8),tip[0]+.2,Math.max(tip[1]-.8,.6),0,0),d>0?MAT.rust:(MAT.cgBlue||MAT.pkIron),R,true);
 useGroupXF(R);
 if(o.load&&!o.down)kput('pkCont40',[tip[0]+.2,tip[1]-3.7,0],qEuler(0,Math.PI/2,0),1,d===0?new THREE.Color(0xb8532e):portContColor(d));
 if(o.down)kput('pkCont40R',[tip[0]+3,1.25,1],qEuler(Math.PI/2*.97,Math.PI/2+.2,0),1,portContColor(1));
 if(d===0)kput('dot',[-1,4.7,1.1],null,[.3,.3,.3],new THREE.Color(0xffb020));
 endGroupXF();
 REGISTER({name:'Reach stacker',x,z,r:6,h:12,y:D});}

// ---------------------------------------------------------------- floating things (d=3)
// A floating garden: drum pontoons, a plank deck, planter beds, a shade
// awning on posts, sometimes a tree; moored by a line to (mx,mz).
function spRaft(G,x,z,yaw,L,B,d,mx,mz,o){o=o||{};const P=spRot(x,z,yaw),q=qEuler(0,yaw,0);
 for(const u of [-B/2+.6,0,B/2-.6]){const p=P(0,u);kput('plank',[p[0],.05,p[1]],q,[L,.55,.7],new THREE.Color(0x2f4f6a));}
 let p=P(0,0);kput('plank',[p[0],.42,p[1]],q,[L+.4,.14,B],null);
 if(o.house){portContainerHouse(G,p[0],.5,p[1],yaw,d,{levels:1,big:false,noReg:true});}
 else{const nb=Math.max(2,Math.round(L*B/9));
  for(let i=0;i<nb;i++){const lx=rr(-L/2+1,L/2-1),lz=rr(-B/2+.8,B/2-.8),pp=P(lx,lz),bw=rr(1.2,2.2),bd=rr(.7,1.1);
   kput('planter',[pp[0],.72,pp[1]],q,[bw,.45,bd],null);
   for(let k=0;k<2;k++)kput('leafCard',[pp[0]+rr(-.4,.4),1.15,pp[1]+rr(-.3,.3)],qEuler(0,rng()*TAU,0),[rr(.4,.8),rr(.35,.65),rr(.4,.8)],new THREE.Color().setHSL(rr(.2,.34),rr(.4,.6),rr(.38,.6)));}
  if(rng()<.5){const pp=P(rr(-L/3,L/3),0);VEG.tree(pp[0],.5,pp[1],(rng()*3)|0,rr(2.5,4.2));}
  else{for(const a of [[-1,-1],[1,-1],[-1,1],[1,1]]){const pp=P(a[0]*1.3,a[1]*1);kput('postR',[pp[0],1.5,pp[1]],null,[.04,2,.04],null);}
   const pp=P(0,0);kput('pkAwn',[pp[0],2.5,pp[1]],q,[3,1,2.4],new THREE.Color().setHSL(rng(),rr(.3,.6),rr(.45,.7)));}}
 if(mx!==undefined){const a=P(-L/2,0);kput('pkLine',[(a[0]+mx)/2,.9,(a[1]+mz)/2],qEuler(0,Math.atan2(-(mz-a[1]),mx-a[0]),-.15),[Math.hypot(mx-a[0],mz-a[1]),1,1],null);}}

// ---------------------------------------------------------------- the yard
function spYardContent(G,d,opt,sd,sl,walls){const D=PORT.DECK,h=opt.W/2,S=opt.SEA,k=opt.W/110;
 const inSl=(x,z)=>sl&&sl.in(x,z);
 // paving over the whole mole: inset from open faces (the coping stands
 // there), to the very edge on joined sides so it meets the neighbour's
 const px0=sd.W.j?-h:-h+1.2,px1=sd.E.j?h:h-1.2,pz0=sd.N.j?0:1.2,pz1=sd.S.j?S:S-1.2;
 portPaving(G,px0,pz0,px1,pz1,d,{hole:sl?(x,z)=>x>sl.x0-.5&&x<sl.x1+.5&&z>sl.z0-.5&&z<sl.z1+.5:null});
 // warehouses on the west strip, the road, then three blocks and the office
 spWarehouse(G,-47*k,10,-21*k,64,11,d,{name:'Platform warehouse',roofDown:d===1,doorSide:1});
 spWarehouse(G,-47*k,74,-21*k,102,8,d,{name:'Reefer shed',doorSide:1,rise:2.2,canopy:false});
 const bx=[-1.6,11.2,24].map(v=>v*k),bz=[21,48,75];
 if(d===0){                                        // lane markings: the road's centre line, block outlines
  for(let z=10;z<100;z+=6)pbBox(G,MAT.pkCope,-15*k,D+.05,z,.22,.02,3,0,8);
  for(const zc of bz){const x0=bx[0]-6.7,x1=bx[2]+6.7,z0=zc-8.6,z1=zc+8.6;
   pbBox(G,MAT.spYellow,(x0+x1)/2,D+.05,z0,x1-x0,.02,.25,0,8);pbBox(G,MAT.spYellow,(x0+x1)/2,D+.05,z1,x1-x0,.02,.25,0,8);
   pbBox(G,MAT.spYellow,x0,D+.05,zc,.25,.02,z1-z0,0,8);pbBox(G,MAT.spYellow,x1,D+.05,zc,.25,.02,z1-z0,0,8);}}
 // gantry rails either side of the middle block
 const zA=bz[1]-10.8,zB=bz[1]+10.8,rx0=bx[0]-10,rx1=bx[2]+10;
 for(const z of [zA,zB])for(let x=rx0+10;x<rx1;x+=20)kput(typeof KIT.defs.cgRail!=='undefined'?'cgRail':'pkRail',[x,D,z],null,[Math.min(20,rx1-x+10)/20,1,1],d>0?new THREE.Color(0x7a4a32):null);
 const gx0=d===1?bx[1]-2:bx[1]+3;
 if(d<3){
  spBlock(bx,bz[0],6,d===0?4:3,d);
  spBlock(bx,bz[1],6,d===0?4:3,d);
  spBlock(bx,bz[2],6,d===0?3:3,d,{slide:9});
  for(let i=0;i<3;i++)for(const x of [bx[0]+3,bx[2]-3])REGISTER({name:'Container block',x,z:bz[i],r:10*k,h:11,y:D});}
 else{                                             // reclaimed: houses where the outer blocks stood
  spBlock(bx,bz[1],6,2,d,{skip:(x,z)=>Math.abs(x-bx[2])<1&&z>bz[1]});
  for(const x of [bx[0]+3,bx[2]-3])REGISTER({name:'Container block',x,z:bz[1],r:10*k,h:6,y:D});
  const hz=[[16.5,26.5],[69.5,80.5]];
  for(const zz of hz)for(const x of bx)for(const z of zz)if(rng()<.88)
   portContainerHouse(G,x+rr(-1,1),D,z+rr(-.6,.6),rr(-.1,.1),d,{levels:1+((rng()*3)|0)});
  for(const zc of bz){if(zc===bz[1])continue;for(let x=bx[0]-4;x<bx[2]+5;x+=5.5)if(rng()<.55){const z=zc+rr(-1,1);portWashLine(x,z-4,x+rr(3,5),z+4,D+rr(4.5,6.5),5);}}}
 spGantry(G,gx0,zA,zB,d,{lean:d===1?.5:0,houses:d>=3,t:d===0?.42:.6});
 spOffice(G,40*k,17,10,12,d);
 // the east strip: the reach stacker at the south block's end, staged boxes
 if(d===0){spStacker(G,40.5*k,72,Math.PI,d);for(let i=0;i<4;i++)portContainer(40*k,D,84+i*2.8,0,true,0);
  REGISTER({name:'Staged boxes',x:40*k,z:88,r:7,h:3,y:D});}
 else if(d===1){spStacker(G,38*k,33.5,Math.PI*.96,d,{down:true});}
 // trucks in the lanes
 const truck=(x,z,yaw,load)=>{if(typeof KIT.defs.cgTractor==='undefined')return;
  const col=d===1?new THREE.Color(0x8a5a40):null;kput('cgTractor',[x,D,z],qEuler(0,yaw,0),1,col);kput('cgTyres',[x,D,z],qEuler(0,yaw,0),1,null);
  if(load){const c=Math.cos(yaw),s=Math.sin(yaw);portContainer(x+.6*c,D+1.5,z-.6*s,yaw,true,d);}};
 if(d===0){truck(5,34.5,Math.PI,true);truck(-15*k,82,Math.PI/2,true);truck(20,61.5,0,false);}
 if(d===1)truck(2,34.5,Math.PI+.12,false);
 // the ruin: stacks toppled into the sea off the open faces, boxes knocked
 // over on the deck, weeds and trees through the paving
 if(d===1){
  for(const kk of SP.SIDES){if(sd[kk].j)continue;const g=spSide(kk,h,S),n=Math.round(rr(2,5));
   for(let i=0;i<n;i++){const t=rr(.1,.9),x=g.a[0]+(g.b[0]-g.a[0])*t+g.n[0]*rr(3,14),z=g.a[1]+(g.b[1]-g.a[1])*t+g.n[1]*rr(3,14);
    portContainer(x,rr(-1.8,-.7),z,rr(0,TAU),rng()<.7,1,null,[rr(-.4,.4),rr(-.5,.5)]);}}
  portContainer(bx[0]-9,D+1.22,bz[0]+3,.3,true,1,null,[Math.PI/2*.98,.03]);
  portContainer(bx[2]+9,D+1.22,bz[1]-2,1.2,true,1,null,[Math.PI/2*.98,.03]);
  portWeeds(-h+4,4,h-4,S-4,Math.round(260*k),D);
  portTrees(-18*k,8,-12*k,100,4,D,4,9);portTrees(bx[0]-6,30,bx[2]+6,38,3,D,4,8);
  portRubble(30,D,32,4,10);portRubble(-12,D,64,3,8);}
 // people
 if(d===0){portFigures(-15*k,D,50,8,5);portFigures(12,D,34.5,6,12);portFigures(12,D,62,6,14);portFigures(40*k,D,55,5,5);portFigures(0,D,95,6,14);}
 // the reclaimed port
 if(d>=3){
  if(typeof cgContainerTower==='function'){cgContainerTower(G,38*k,D,48,Math.PI/2,d,{levels:5,top:'turbine'});cgContainerTower(G,38*k,D,86,Math.PI/2,d,{levels:6,top:'mast'});}
  else{portContainerHouse(G,38*k,D,48,Math.PI/2,d,{levels:3});portContainerHouse(G,38*k,D,86,Math.PI/2,d,{levels:3});}
  // the market in the lanes and in the warehouse
  for(let x=bx[0]-3;x<bx[2]+4;x+=6.5){portStall(x+rr(-1,1),D,33.2,Math.PI+rr(-.1,.1));if(rng()<.7)portStall(x+rr(-1,1),D,36.3,rr(-.1,.1));}
  for(let x=bx[0]-3;x<bx[2]+4;x+=7.5)portStall(x+rr(-1,1),D,62.5,rr(-.1,.1)+(rng()<.5?Math.PI:0));
  for(let z=16;z<60;z+=7)portStall(-34*k+rr(-1,1),D,z,Math.PI/2+(rng()<.5?Math.PI:0));
  portGarden(-15*k,D,30,6,26,d);portGarden(-15*k,D,78,6,20,d);portGarden(8,D,96,26,8,d);
  // solar on the warehouse's east slope
  for(let z=14;z<60;z+=4.2)for(let u=.25;u<.8;u+=.3){const x=-34*k+(1-u)*13*k,y=D+11+u*3.1+.3;
   kput('pkSolar',[x,y,z],qEuler(0,Math.PI/2,0).multiply(qEuler(.24,0,0)),[1,1,1.6],null);}
  // string lights down the lanes
  for(const z of [34.7,62])for(let x=bx[0]-4;x<bx[2]+5;x+=2.2)kput('dot',[x,D+4.2+.4*Math.sin(x*.7),z],null,[.22,.22,.22],WARM);
  portFigures(10,D,34.5,16,16);portFigures(10,D,62,12,16);portFigures(-34*k,D,37,12,6);portFigures(0,D,95,8,14);
  // afloat: floating gardens and a house raft at the ladders, skiffs
  const lad=[];for(const kk of Object.keys(walls)){const W_=walls[kk];if(W_)for(const L of W_.ladders)lad.push({p:L,n:W_.n});}
  lad.forEach((l,i)=>{const n=l.n,yaw=portYaw(n[1],-n[0]),off=i%3===1?6.5:5;
   const x=l.p[0]+n[0]*off,z=l.p[1]+n[1]*off;
   if(i%3===2)portSkiff(x+n[1]*rr(-4,4),z-n[0]*rr(-4,4),Math.atan2(n[0],n[1])+Math.PI/2+rr(-.2,.2));
   else spRaft(G,x,z,yaw,i%4===1?9:rr(7,10),i%3===1?6.5:rr(4.5,6),d,l.p[0]+n[0]*.4,l.p[1]+n[1]*.4,{house:i%3===1&&i%2===0});
   if(rng()<.6)portSkiff(x+n[1]*rr(7,11),z-n[0]*rr(7,11)+n[1]*0,Math.atan2(n[0],n[1])+rr(-.3,.3));});}}

// ---------------------------------------------------------------- the builder
function buildSpYard(scene,gx,gz,d,opt){reseed(20900+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const sd=spSides(opt),sl=spSlump(opt,sd);
 const walls=spEdges(G,d,opt,sd,sl);
 spYardContent(G,d,opt,sd,sl,walls);
 REGISTER({name:'Sea platform mole',x:0,z:opt.SEA/2,r:opt.SEA/2-8,h:36,y:-30});
 KOFF=[0,0,0];return G;}

PORT_SEG({key:'spYard',name:'Sea platform: container yard',cls:'seg',place:'sea',W:110,LAND:0,SEA:110,decays:[0,1,3],
  stamps:spStamps,build:buildSpYard});
