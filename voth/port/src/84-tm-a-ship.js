// ================================================================ SEGMENTS: terminals (tm) - helpers + tmShip
// Agent 3's area: the shipping terminal (tmShip), the passenger terminal
// (tmPass, 84-tm-b-pass.js) and the heliport (tmHeli, 84-tm-c-heli.js). Every
// top-level name carries the `tm` prefix; seeds 20300-20399 (tmShip 20300+d,
// tmPass 20310+d, tmHeli 20320+d). This file also holds the helpers the other
// two use (plans, bands, slabs, spans on a matrix, trucks, the control cab),
// so it must sort first (84-tm-a...).
//
// ---------------------------------------------------------------- materials and kit
MAT.tmPaint=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.8,metalness:0,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});
MAT.tmPad=new THREE.MeshStandardMaterial({map:TEX.concrete,color:0x6a706c,roughness:.9,metalness:.05});
MAT.tmFloor=new THREE.MeshStandardMaterial({color:0xcfc6b4,roughness:.7,metalness:0,emissive:0x2a2418,emissiveIntensity:.35});
// painted line, a flat unit quad (scale x = length, z = width)
kdef('tmLine',new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),MAT.tmPaint);
// a painted ring, flat, unit radius (scale [R,1,R])
kdef('tmRingMk',new THREE.TorusGeometry(1,.028,3,48).rotateX(Math.PI/2),MAT.tmPaint);
// Tractor unit + skeletal trailer, length along local +x, bottom centre at the
// middle of the rig (16.6 m). A 40 ft box sits on the trailer at x -1.9 (see tmTruck).
kdef('tmTruckCab',pkMergeGeo([new THREE.BoxGeometry(2.3,2.6,2.5).translate(6.95,2.4,0),new THREE.BoxGeometry(.6,1.1,2.45).translate(8.3,1.25,0),
 new THREE.BoxGeometry(1.3,1.4,2.3).translate(5.2,2.3,0),new THREE.BoxGeometry(2.1,.25,2.5).translate(6.95,3.8,0)]),MAT.pkPaint);
kdef('tmTruckFrame',pkMergeGeo([new THREE.BoxGeometry(6.6,.42,1.1).translate(5.1,.95,0),new THREE.BoxGeometry(12.8,.34,2.3).translate(-1.9,1.2,0),
 new THREE.BoxGeometry(.9,.9,.7).translate(4.4,1.1,1.05),new THREE.BoxGeometry(.2,1.1,.2).translate(2.9,.55,.9),new THREE.BoxGeometry(.2,1.1,.2).translate(2.9,.55,-.9)]),MAT.pkIron);
kdef('tmWheels',pkMergeGeo((()=>{const a=[];for(const x of [7.4,4.1,2.9,-5.6,-6.8,-8.0])for(const z of [-1.02,1.02])a.push(new THREE.CylinderGeometry(.52,.52,.5,8).rotateX(Math.PI/2).translate(x,.52,z));return a;})()),MAT.pkRubber);
kdef('tmCabGlass',new THREE.BoxGeometry(.08,1.15,2.2).translate(8.12,3.05,0),MAT.darkGlass);

// ---------------------------------------------------------------- plan shapes
// A closed plan u(0..1) -> [x,z]: a superellipse of exponent n centred on
// (cx,cz), half-width ax, reaching azF toward the sea (+z) and azB toward the
// land. n 2 is an ellipse, n 4+ a rounded rectangle.
function tmPlan(cx,cz,ax,azF,azB,n){return u=>{const th=u*TAU,c=Math.cos(th),s=Math.sin(th),r=se(th,n);
 return [cx+ax*r*c,cz+(s>0?azF:azB)*r*s];};}
// the same plan pushed out (k>0) or in (k<0) by k metres
function tmPlanOff(cx,cz,ax,azF,azB,n,k){return tmPlan(cx,cz,ax+k,azF+k,azB+k,n);}
function tmPerim(P){let L=0,q=P(0);for(let i=1;i<=96;i++){const p=P(i/96);L+=Math.hypot(p[0]-q[0],p[1]-q[1]);q=p;}return L;}
// Scale a geometry's UVs (ExtrudeGeometry's are in metres; the kit's textures are 8 m).
function tmUV(g,s){const uv=g.attributes.uv;if(!uv)return g;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*s,uv.getY(i)*s);return g;}
// A vertical band round the plan from y0 up h.
function tmBandGeo(P,y0,h,nu,nv,hole){const L=tmPerim(P);
 return gridSurface((u,v)=>{const p=P(u);return[p[0],y0+v*h,p[1]];},nu,nv||1,{uS:L/8,vS:h/8,hole});}
// A slab of thickness t whose top is at y, cut to the plan.
function tmSlabGeo(P,nu,y,t){const s=new THREE.Shape();
 for(let i=0;i<nu;i++){const p=P(i/nu);if(i)s.lineTo(p[0],-p[1]);else s.moveTo(p[0],-p[1]);}
 const g=new THREE.ExtrudeGeometry(s,{depth:t,bevelEnabled:false,curveSegments:1});
 g.rotateX(-Math.PI/2);g.translate(0,y-t,0);return tmUV(g,1/8);}
// Mullions round a plan, n of them, from y0 up h.
function tmMullions(P,n,y0,h,d,skip){const nm=d>0?'mullR':'mullW';
 for(let i=0;i<n;i++){if(skip&&skip(i))continue;const u=(i+.5)/n,p=P(u),q=P(u+.002);
  const yaw=Math.atan2(-(q[1]-p[1]),q[0]-p[0]);
  if(d===1&&rng()<.25){if(rng()<.5)kput(nm,[p[0],y0+h*.35,p[1]],qEuler(rr(-.5,.5),yaw,rr(-.6,.6)),[.8,h*.7,.8],null);continue;}
  kput(nm,[p[0],y0+h/2,p[1]],qEuler(0,yaw,0),[.7,h,.7],null);}}
// Hedges / planters along a plan (a terrace edge).
function tmHedgeRing(P,n,y,d,skip){for(let i=0;i<n;i++){if(d===1&&rng()<.3)continue;const u=(i+.5)/n,p=P(u),q=P(u+.002);if(skip&&skip(p))continue;
 const yaw=Math.atan2(-(q[1]-p[1]),q[0]-p[0]),L=tmPerim(P)/n*.86;
 kput('planter',[p[0],y+.35,p[1]],qEuler(0,yaw,0),[L,.7,1.1],d>0?new THREE.Color(0x6a5a48):new THREE.Color(0xe8e4dc));
 kput('hedge',[p[0],y+.95,p[1]],qEuler(0,yaw,0),[L*.96,d===1?rr(.6,1.8):.7,d===1?rr(.9,1.8):.9],new THREE.Color().setHSL(rr(.24,.3),.45,d===1?rr(.2,.34):.36));}}
// Night strip along a plan (intact: all lit cyan).
function tmStripRing(P,n,y,d){const L=tmPerim(P)/n*.9;for(let i=0;i<n;i++){const u=(i+.5)/n,p=P(u),q=P(u+.002);const yaw=Math.atan2(-(q[1]-p[1]),q[0]-p[0]);
 const lit=d>0?rng()<.08:true;kput('strip',[p[0],y,p[1]],qEuler(0,yaw,0),[L,1,1],lit?(d>0?WARM:CYAN):DEAD);}}

// ---------------------------------------------------------------- matrices: spans, canopies
// A local frame at point A turned to `yaw` (local +z toward the heading) and
// pitched up by `pitch` (radians), rolled by `roll`. Geometry built along
// +z from 0 is baked through it; kit items go through KXF (tmWith).
function tmM(A,yaw,pitch,roll){const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(-(pitch||0),yaw||0,roll||0,'YXZ'));
 const m=new THREE.Matrix4().compose(new THREE.Vector3(A[0],A[1],A[2]),q,new THREE.Vector3(1,1,1));return {m,q};}
function tmWith(M,fn){const k=KXF;KXF=M;try{fn();}finally{KXF=k;}}
function tmSpanM(A,B){const dx=B[0]-A[0],dy=B[1]-A[1],dz=B[2]-A[2],h=Math.hypot(dx,dz);
 return Object.assign(tmM(A,Math.atan2(dx,dz),Math.atan2(dy,h)),{L:Math.hypot(h,dy)});}
// A span that broke away: hinged at H (lowered `sag`), swung down toward the
// far point F until its far end rests on the ground/seabed. Returns a frame
// whose +z runs from the hinge along the fallen span, and L.
function tmFallM(H,F,sag,roll){const dx=F[0]-H[0],dz=F[2]-H[2],L=Math.hypot(dx,dz,F[1]-H[1]),yaw=Math.atan2(dx,dz);
 const hy=H[1]-(sag||0);let p=-.2;
 for(let k=0;k<3;k++){const hz=L*Math.cos(p),fx=H[0]+Math.sin(yaw)*hz,fz=H[2]+Math.cos(yaw)*hz;
  const gy=Math.max(portH(fx,fz),-40)+.6;p=-Math.asin(clamp((hy-gy)/L,.05,.97));}
 return Object.assign(tmM([H[0],hy,H[2]],yaw,p,roll||0),{L});}
// Bake a geometry through a frame and batch it.
function tmPut(G,g,mat,M,noRepair){g.applyMatrix4(M.m);pbAdd(g,mat,G,noRepair);}

// A covered walkway at grade: portal posts every ~5 m and a shallow barrel
// roof, `w` wide, eaves at h, along the frame's +z for L. d=1 holes and
// leaning posts; d=3 as ruined (the salvage pass patches it).
function tmCanopy(G,d,M,L,o){o=Object.assign({w:4.4,h:3.3,rise:.8,sd:1},o||{});const n=Math.max(1,Math.round(L/5));
 const hole=d>0?holeFn(d,o.sd,null,1.8):null;
 tmPut(G,gridSurface((u,v)=>{const x=(v-.5)*o.w;return[x,o.h+o.rise*(1-Math.pow(2*v-1,2)),u*L];},Math.max(2,n*2),6,
  {uS:L/8,vS:o.w/8,hole:hole?(u,v)=>hole(u*L/30,v*20):null}),SHELL(d),M);
 tmWith(M,()=>{for(let i=0;i<=n;i++){const z=i*L/n;for(const s of [-1,1]){
  if(d===1&&rng()<.15)continue;
  kput(d>0?'postR':'postW',[s*(o.w/2-.2),o.h/2,z],d===1&&rng()<.3?qEuler(rr(-.12,.12),0,rr(-.12,.12)):null,[.13,o.h,.13],null);}
  if(d===0&&i<n)kput('strip',[0,o.h+.1,z+L/n/2],qEuler(0,Math.PI/2,0),[L/n*.7,1,1],CYAN);}});}

// A raised ENCLOSED walkway (a boarding bridge, an air bridge) along the
// frame's +z for L: floor slab, solid spandrels, a glazed ribbon, a shallow
// barrel roof. o.w width, o.h wall height. Intact: glass panes and a cyan
// strip; d>0: no glass, dead strip, holed roof. Returns nothing.
function tmTube(G,d,M,L,o){o=Object.assign({w:4.4,h:3.2,rise:.9,sd:2,glass:true},o||{});const w=o.w,H=o.h;
 const hole=d>0?holeFn(d,o.sd,null,2):null;
 tmPut(G,boxUV(w,.45,L,8).translate(0,-.22,L/2),CONC(d),M);
 for(const s of [-1,1]){tmPut(G,boxUV(.3,1.05,L,8).translate(s*(w/2-.15),.52,L/2),SHELL(d),M);
  tmPut(G,boxUV(.3,.5,L,8).translate(s*(w/2-.15),H-.25,L/2),SHELL(d),M);}
 tmPut(G,gridSurface((u,v)=>{const a=Math.PI*v;return[Math.cos(a)*w/2,H+Math.sin(a)*o.rise,u*L];},Math.max(2,Math.round(L/5)),6,
  {uS:L/8,vS:w/8,hole:hole?(u,v)=>hole(u*L/25,v*30):null}),SHELL(d),M);
 const n=Math.max(1,Math.round(L/3));
 tmWith(M,()=>{for(let i=0;i<n;i++){const z=(i+.5)*L/n;
  for(const s of [-1,1]){
   if(d===0&&o.glass)kput('pane',[s*(w/2-.15),1.05+(H-1.55)/2,z],qEuler(0,Math.PI/2,0),[L/n-.12,H-1.55,1],null);
   else if(d>=3&&rng()<.35)kput('paneD',[s*(w/2-.15),1.05+(H-1.55)/2,z],qEuler(0,Math.PI/2,0),[L/n-.12,H-1.55,1],null);
   kput(d>0?'mullR':'mullW',[s*(w/2-.15),H/2,i*L/n],null,[.4,H,.4],null);}
  if(d===0)kput('strip',[0,H-.1,z],qEuler(0,Math.PI/2,0),[L/n*.8,1,1],CYAN);}});}

// A square-ish column from the ground (or seabed) at (x,z) up to y.
function tmPier(x,z,y,r,d){const gy=portH(x,z)-1;if(y-gy<=0)return;
 kput('pkCol',[x,gy,z],null,[r,y-gy,r],d>0?new THREE.Color().setHSL(.07,.08,rr(.42,.55)):null);}

// ---------------------------------------------------------------- the control cab tower
// A tapered board-formed shaft, a service gallery, a faceted outward-leaning
// glass cab, a roof slab and an antenna. o = {H shaft, rb/rt shaft radii,
// c0/c1 cab radii bottom/top, ch cab height, n facets, y base}. The glass is
// pushed to `gl` (one merged transparent mesh per builder).
// d=1: glass gone, mullions missing and bent, the roof slipped off askew,
// the antenna down, shards at the foot. d=3: patched cab, dish, warm light.
function tmCtlTower(G,x,z,d,gl,o){o=Object.assign({H:30,rb:3,rt:2.1,c0:5,c1:6.4,ch:4.2,n:12,y:PORT.DECK},o||{});
 const y0=o.y,yc=y0+o.H,slabC=d>0?new THREE.Color(0x6e665e):new THREE.Color(0xf2efe8);
 pbAdd(lathe({rFn:y=>lerp(o.rb,o.rt,Math.pow(y/o.H,.8)),H:o.H,nu:18,nv:4}).translate(x,y0,z),CONC(d),G);
 kput(SLABC(d),[x,y0+.6,z],null,[o.rb*1.9,1.2,o.rb*1.9],null);
 // the stair/lift slot up the shaft: a dark strip with lit landings
 kput('boxD',[x,y0+o.H/2,z+o.rb*.82],null,[1.2,o.H-2,.6],null);
 for(let y=5;y<o.H-2;y+=5)kput(d===0?'dot':'cellD',[x,y0+y,z+o.rb*.95],null,[.6,.35,.3],d===0?CYAN:null);
 // service gallery
 kput('slab',[x,yc-3.2,z],null,[o.c0*.9,.35,o.c0*.9],slabC);
 for(let k=0;k<16;k++){if(d===1&&rng()<.4)continue;const a=k/16*TAU;kput('pkGuard',[x+Math.cos(a)*o.c0*.86,yc-3.02,z+Math.sin(a)*o.c0*.86],qEuler(0,-a-Math.PI/2,0),[.42,1,1],d>0?new THREE.Color(0x8a5a3a):null);}
 // cab floor, console ring, people
 kput('slab',[x,yc-.35,z],null,[o.c0+.5,.7,o.c0+.5],slabC);
 const fac=(r,y,k)=>{const a=k/o.n*TAU;return[x+Math.cos(a)*r,y,z+Math.sin(a)*r];};
 if(d===0){gl.push(gridSurface((u,v)=>{const a=u*TAU,r=lerp(o.c0,o.c1,v);return[x+Math.cos(a)*r,yc+v*o.ch,z+Math.sin(a)*r];},o.n,1,{}));
  for(let k=0;k<o.n;k++){const a=(k+.5)/o.n*TAU;kput('boxD',[x+Math.cos(a)*(o.c0-1.1),yc+.5,z+Math.sin(a)*(o.c0-1.1)],qEuler(0,-a,0),[.8,1,2.2],null);}
  portFigures(x,yc,z,3,2);}
 if(d>=3){for(let k=0;k<o.n;k++)if(rng()<.55){const a=(k+.5)/o.n*TAU,r=lerp(o.c0,o.c1,.5);
  kput(['patchSheet','patchBoard','patchPlate'][k%3],[x+Math.cos(a)*r,yc+o.ch*.45,z+Math.sin(a)*r],qFacing([Math.cos(a),0,Math.sin(a)]).multiply(qEuler(-.15,0,rr(-.1,.1))),[r*TAU/o.n*1.02,o.ch*rr(.6,1),1],null);}
  kput('shantyBox',[x,yc+1.4,z],qEuler(0,rng()*TAU,0),[o.c0*1.1,2.8,o.c0*.9],null);
  kput('dot',[x+o.c0*.7,yc+2,z],qEuler(0,.6,0),[1.2,1,1],WARM);portFigures(x,yc,z,2,2);}
 for(let k=0;k<o.n;k++){if(d===1&&rng()<.4)continue;const a=fac(o.c0,yc,k),b=fac(o.c1,yc+o.ch,k);
  if(d===1&&rng()<.3){beam('mullR',a,[b[0]+rr(-1.5,1.5),b[1]-rr(1,2.5),b[2]+rr(-1.5,1.5)],.45,.45,null);continue;}
  beam(d>0?'mullR':'mullW',a,b,.45,.45,null);}
 const top=yc+o.ch;
 if(d===1){// the roof slab slipped half off, the antenna fallen across the gallery; shards below
  kput('slab',[x+1.8,top+.1,z-1.2],qEuler(.2,0,-.16),[o.c1+.6,.7,o.c1+.6],slabC);
  kput('pkCol',[x+o.c1,yc-2.8,z],qEuler(0,.7,Math.PI/2*.92),[.14,9,.14],new THREE.Color(0x8a6a50));
  for(let i=0;i<14;i++){const a=rng()*TAU,r=rr(o.rb+1,o.rb+6);kput('rubble',[x+Math.cos(a)*r,y0+.2,z+Math.sin(a)*r],qEuler(rng()*3,rng()*3,rng()*3),[rr(.2,.6),rr(.05,.12),rr(.2,.5)],new THREE.Color(0x8aa0a8));}
  vinesOnRing(x,yc-3,z,o.rt*1.05,6,12);}
 else{kput('slab',[x,top+.35,z],null,[o.c1+.7,.7,o.c1+.7],slabC);
  kput('slab',[x,top+1.1,z],null,[o.c1*.55,.8,o.c1*.55],slabC);
  kput('pkCol',[x,top+1.5,z],null,[.14,9,.14],d>0?new THREE.Color(0xa09890):new THREE.Color(0xf4f2ec));
  kput('dot',[x,top+10.6,z],null,[.5,.5,.5],d===0?new THREE.Color(0xff3a2a):WARM);
  if(d===0)stripRing(x,yc-.8,z,o.c0+.55,d,20);
  if(d>=3){kput('pkDish',[x-o.c1*.4,top+.7,z+1],qEuler(0,rng()*TAU,0),[1.8,1.8,1.8],null);portWashLine(x-o.c1,top+.8,z,x+o.c1,top+.8,z,6);}}
 REGISTER({name:'Control tower',x,z,r:Math.max(o.rb+.5,o.c1*.8),h:top-y0+10,y:y0});
 return {top};}

// ---------------------------------------------------------------- trucks
// A tractor-trailer with a 40 ft box, bottom centre (x,y,z), long axis along
// yaw. o = {box (true), col, side (lying on its side, d=1)}.
function tmTruck(x,y,z,yaw,d,o){o=o||{};let q=qEuler(0,yaw,0),yy=y;
 if(o.side){q=q.multiply(qEuler(1.52,0,0));yy=y+1.25;}
 const col=(o.col||new THREE.Color().setHSL(rr(0,1),rr(.2,.55),rr(.35,.6))).clone();if(d>0)col.lerp(PK_RUST,rr(.4,.7));
 kput('tmTruckCab',[x,yy,z],q,1,col);kput('tmTruckFrame',[x,yy,z],q,1,d>0?new THREE.Color(0x7a4a32):null);
 kput('tmCabGlass',[x,yy,z],q,1,d===1?new THREE.Color(0x222222):null);
 if(!(d===1&&rng()<.4))kput('tmWheels',[x,yy,z],q,1,null);
 if(o.box!==false&&!o.side){const c=Math.cos(yaw),s=Math.sin(yaw);portContainer(x-1.9*c,y+1.38,z+1.9*s,yaw,true,d);}}

// ---------------------------------------------------------------- vessel alongside
// Offer a registered vessel alongside a straight berth: bow +x (heading PI/2),
// its side 3 m off the face at zf. Only if it fits the segment (length <=
// W-12, beam <= room). Returns true if placed.
function tmVesselAlongside(G,opt,d,zf,room,i){const vk=portVesselFor(opt,i||0);if(!vk)return false;const V=PORT_REG.vessel[vk];
 if(!(V.length<=opt.W-12&&V.beam<=room))return false;portPlaceVessel(G,vk,0,zf+3+V.beam/2,Math.PI/2,d);return true;}

// ================================================================ SEGMENT: tmShip
// The shipping terminal. A 3-storey white customs and operations building
// with rounded ends across the back of the apron, a control tower on the
// quay corner overlooking the berth, an enclosed air-bridge from the
// building's first floor to the tower and a covered walkway at grade down to
// the quay, and a truck marshalling yard with a gate canopy, booths and
// painted lanes on the west half. Seeds 20300-20304.
//   d=0 intact   white, blue ribbon glass, cyan strips, trucks queuing
//   d=1 ruined   the tower cab shattered and its roof slipped, the air-bridge
//                span down on the apron, the canopy holed, trucks rusted and
//                one on its side, the berth silted, weeds and trees
//   d=3 reclaimed the gate canopy a market, container houses in the lanes,
//                a shack in the tower cab, the lost span a plank bridge
const TMS={LAND:100,SEA:50,BX:-8,BZ:-80,BAX:36,BAZ:10,TX:36,TZ:-16};
function tmShipStamps(o){const d=o.d,h=o.W/2;
 const s=[{kind:'flat',x0:-h,z0:-TMS.LAND,x1:h,z1:0,y:PORT.DECK,soft:40,paint:d>=1?'soil':'pave'},
  {kind:'dig',x0:-h,z0:0,x1:h,z1:TMS.SEA,y:d===1?-6:PORT.BERTH,soft:30}];
 if(d===1)s.push({kind:'fill',poly:[[-40,10],[-5,6],[30,14],[44,30],[0,36],[-36,26]],y:-1.2,soft:14,paint:'sand'});
 return s.concat(portEdgeStamps(o,{LAND:TMS.LAND,SEA:TMS.SEA}));}

function buildTmShip(scene,gx,gz,d,opt){reseed(20300+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK,h=opt.W/2,gl=[];
 portPaving(G,-h,-TMS.LAND,h,-1.2,d);
 const wall=portQuayWall(G,-h,0,h,0,d);
 portSideClose(G,opt.nb,d,{z0:-TMS.LAND,z1:0});
 tmShipBuilding(G,d,gl);
 const tw=tmCtlTower(G,TMS.TX,TMS.TZ,d,gl,{H:28});
 // ---- the air-bridge: building first floor (y D+4.6) to the tower shaft, on two piers
 const yb=D+4.7,A=[24,yb,-72.6],B=[TMS.TX-2.2,yb,TMS.TZ-2.4],M=tmSpanM(A,B),L=M.L;
 const cut=[0,.36,.7,1],pts=cut.map(t=>[A[0]+(B[0]-A[0])*t,yb,A[2]+(B[2]-A[2])*t]);
 for(let i=0;i<3;i++){const a=pts[i],b=pts[i+1];
  if(d>=1&&i===1){
   if(d===1){const F=tmFallM(a,b,.6,.12);tmTube(G,d,F,F.L*.97,{sd:7});}
   else{// a plank bridge on the old line, roped
    const S=tmSpanM(a,b);tmWith(S,()=>{const n=Math.round(S.L/.6);for(let k=0;k<=n;k++){const z=k/n*S.L,y=-.9*Math.sin(Math.PI*k/n);
     kput('plank',[0,y,z],null,[2.2,.07,.45],null);}
     for(const s of [-1.1,1.1])for(let k=0;k<6;k++){const z0=k/6*S.L,z1=(k+1)/6*S.L;beam('plank',[s,1-.9*Math.sin(Math.PI*k/6),z0],[s,1-.9*Math.sin(Math.PI*(k+1)/6),z1],.05,.05,new THREE.Color(0x6a5a44));}});}
   continue;}
  const S=tmSpanM(a,b);tmTube(G,d,S,S.L,{sd:5+i});}
 for(const t of [.36,.7]){const x=A[0]+(B[0]-A[0])*t,z=A[2]+(B[2]-A[2])*t;
  kput(d>0?'postR':'postW',[x,D+(yb-D-.45)/2,z],null,[.55,yb-D-.45,.55],null);kput(BOXC(d),[x,yb-.7,z],qEuler(0,Math.atan2(B[0]-A[0],B[2]-A[2]),0),[5.2,.5,1.2],null);}
 REGISTER({name:'Air-bridge to the tower',x:(A[0]+B[0])/2,z:(A[2]+B[2])/2,r:8,h:6,y:yb-1});
 REGISTER({name:'Air-bridge (tower end)',x:A[0]+(B[0]-A[0])*.85,z:A[2]+(B[2]-A[2])*.85,r:5,h:6,y:yb-1});
 // ---- the covered walkway at grade: from the entrance down to the quay, then along it
 tmCanopy(G,d,tmSpanM([4,D,-69],[4,D,-9]),60,{sd:11});
 tmCanopy(G,d,tmSpanM([-44,D,-7],[26,D,-7]),70,{w:5,h:3.6,sd:12});
 REGISTER({name:'Covered walkway',x:4,z:-40,r:5,h:5,y:D});
 for(const x of [-30,-8,14])REGISTER({name:'Quay canopy',x,z:-7,r:6,h:5,y:D});
 // ---- the marshalling yard: gate canopy over five lanes, booths, painted lanes and bays
 tmShipYard(G,d);
 // ---- the customs inspection stacks on the east, lamps on the quay
 if(d<3){portContainerStack(15,D,-50,Math.PI/2,3,d===0?3:2,d,{big:true});REGISTER({name:'Inspection stack',x:15,z:-50,r:8,h:8,y:D});}
 portContainerStack(40,D,-40,Math.PI/2,2,2,d,{big:false});REGISTER({name:'Inspection stack',x:40,z:-40,r:6,h:6,y:D});
 for(const x of [-47,-20,20])portLamp(x,D,-2.6,0,d);
 // ---- a vessel alongside if one fits, else buoys
 const placed=tmVesselAlongside(G,opt,d,0,TMS.SEA-10,0);
 if(d===0){if(!placed){portBuoy(-30,34);portBuoy(34,30);}
  portFigures(-10,D,-64,10,24);portFigures(4,D,-38,6,3);portFigures(-10,D,-12,8,26);portFigures(30,D,-24,4,8);}
 if(d===1){
  portWeeds(-h+4,-TMS.LAND+4,h-4,-3,190,D);portTrees(-h+10,-95,-h+30,-66,3,D,5,10);portTrees(10,-64,40,-58,3,D,4,9);
  portTrees(-20,-28,0,-18,2,D,4,8);portRubble(12,D,-60,5,12);portRubble(-36,D,-72,4,10);
  kput('pkSkiff',[-24,-1,20],qEuler(.3,.9,Math.PI*.9),1,new THREE.Color(0x6a4a3a));
  portContainer(8,-1.1,16,.5,true,1,null,[.2,.3]);}
 if(d>=3){
  for(const L of wall.ladders){portSkiff(L[0]+rr(-3,3),L[1]+2.6,Math.PI/2+rr(-.15,.15));if(rng()<.5)portSkiff(L[0]+rr(5,9),L[1]+4.8,Math.PI/2+rr(-.2,.2));}
  for(let i=0;i<4;i++)portSkiff(rr(-h+10,h-10),rr(14,40),rng()*TAU);
  portGarden(34,D,-64,16,8,d);portGarden(-20,D,-66,18,6,d);
  portWashLine(-44,-10,-10,-10,5.5,10);portWashLine(10,-30,10,-60,5,8);
  portFigures(-24,D,-40,22,18);portFigures(10,D,-12,10,20);portWeeds(-h+4,-TMS.LAND+4,h-4,-3,50,D);}
 if(gl.length)meshMerged(gl,MAT.glass,G);
 KOFF=[0,0,0];return G;}

// The customs and operations building: a rounded-ended block, a recessed
// glazed ground floor behind columns, two ribbon-windowed floors, a parapet,
// a plant room and an entrance canopy toward the quay.
function tmShipBuilding(G,d,gl){const D=PORT.DECK,cx=TMS.BX,cz=TMS.BZ,ax=TMS.BAX,az=TMS.BAZ,n=4;
 const P=(k)=>tmPlanOff(cx,cz,ax,az,az,n,k),NU=64,shell=SHELL(d),hole=d>0?holeFn(d,31,null,1.2):null;
 const slabs=[[D+4.6,.5],[D+8.7,.45],[D+12.8,.6]];
 for(const [y,t] of slabs)pbAdd(tmSlabGeo(P(.3),NU,y,t),CONC(d),G);
 // ground floor: recessed dark glass wall behind a colonnade
 pbAdd(tmBandGeo(P(-2.2),D,4.1,NU,1),d>0?MAT.dark:MAT.winIntact,G);
 tmMullions(P(-2.1),40,D,4.1,d);
 for(let i=0;i<22;i++){const p=P(-.4)((i+.5)/22);kput(d>0?'postR':'postW',[p[0],D+2.05,p[1]],null,[.35,4.1,.35],null);}
 // two upper floors: spandrel + ribbon glass, a dark core behind
 for(const y of [D+4.6,D+8.7]){
  pbAdd(tmBandGeo(P(0),y,1.25,NU,2,hole?(u,v)=>hole(u*3,y*8+v*4):null),shell,G);
  pbAdd(tmBandGeo(P(-1.2),y+1.25,2.85,NU,1),MAT.dark,G);
  if(d===0)gl.push(tmBandGeo(P(0),y+1.25,2.85,NU,1));
  tmMullions(P(0),48,y+1.25,2.85,d);
  if(d===0)tmStripRing(P(.1),24,y+1.2,d);}
 pbAdd(tmBandGeo(P(0),D+12.2,1.9,NU,1,hole?(u,v)=>hole(u*3,90+v*4):null),shell,G);   // parapet over the roof slab
 // white sun fins standing off the two long faces, the full height of the upper floors
 for(let i=0;i<80;i++){const u=(i+.5)/80,p=P(.35)(u);if(Math.abs(p[0]-cx)>ax*.8)continue;const q=P(.35)(u+.003);
  const yaw=Math.atan2(-(q[1]-p[1]),q[0]-p[0])+Math.PI/2;if(d===1&&rng()<.3)continue;
  kput(d>0?'plateR':'plateW',[p[0],D+8.7,p[1]],d===1&&rng()<.2?qEuler(rr(-.08,.08),yaw,rr(-.06,.06)):qEuler(0,yaw,0),[.22,8.4,1.1],null);}
 // a glazed stair drum on the sea face, rising over the roof
 const sx=cx-20,sz=cz+az+.8,sr=3.4,sh=16.4;
 pbAdd(lathe({rFn:()=>sr*.92,H:sh,nu:20,nv:1}).translate(sx,D,sz),MAT.dark,G);
 if(d===0)gl.push(lathe({rFn:()=>sr,H:sh,nu:24,nv:1}).translate(sx,D,sz));
 for(let k=0;k<12;k++){const a=k/12*TAU;if(d===1&&rng()<.35)continue;kput(d>0?'mullR':'mullW',[sx+Math.cos(a)*sr,D+sh/2,sz+Math.sin(a)*sr],qEuler(0,-a,0),[.5,sh,.5],null);}
 for(let y=D+2.05;y<D+sh;y+=4.1)kput('slab',[sx,y,sz],null,[sr+.15,.25,sr+.15],d>0?new THREE.Color(0x6e665e):new THREE.Color(0xe8e4dc));
 kput('slab',[sx,D+sh+.3,sz],null,[sr+.5,.6,sr+.5],d>0?new THREE.Color(0x6e665e):new THREE.Color(0xf2efe8));
 if(d===0)stripRing(sx,D+sh-.6,sz,sr+.1,d,12);
 // plant room and a roof garden strip
 const PR=tmPlan(cx+22,cz-1,10,6,6,3);
 pbAdd(tmBandGeo(PR,D+12.8,3.6,32,1),shell,G);pbAdd(tmSlabGeo(PR,32,D+16.8,.4),CONC(d),G);
 if(d===0)for(let x=cx-28;x<cx+8;x+=6)kput('planter',[x,D+13.1,cz+3.5],null,[5,.6,1.4],new THREE.Color(0xe0dcd2));
 if(d===0)for(let x=cx-28;x<cx+8;x+=3)kput('hedge',[x,D+13.6,cz+3.5],null,[2.6,.8,1],new THREE.Color(0x4a7a3a));
 // entrance canopy toward the quay
 kput(d>0?'plateR':'plateW',[12,D+4.3,cz+az+3.4],null,[18,.4,6.8],null);
 for(const x of [4.5,19.5])kput(d>0?'postR':'postW',[x,D+2.1,cz+az+6.2],null,[.3,4.2,.3],null);
 if(d===0)kput('strip',[12,D+4.05,cz+az+6.7],null,[16,1,1],CYAN);
 // the name band: a long cyan-lit slot under the parapet on the quay face
 if(d===0)kput('strip',[cx-6,D+12.9,cz+az+.5],null,[40,1.2,1],CYAN);
 // ruin: rubble and vines at the foot, trees on the roof; reclaimed: roof shacks come from the salvage pass
 if(d===1){for(let i=0;i<10;i++){const p=P(1.5)(rng());portRubble(p[0],D,p[1],2.5,5);}
  for(let i=0;i<16;i++){const p=P(.1)(rng());kput('vine',[p[0],D+13.8,p[1]],qEuler(rr(-.1,.1),rng()*TAU,0),[rr(.9,1.6),rr(4,12),rr(.9,1.6)],null);}
  portTrees(cx-26,cz-5,cx+10,cz+5,4,D+13,4,8);}
 for(const f of [-.6,-.2,.2,.6])REGISTER({name:'Customs and operations',x:cx+f*ax,z:cz,r:az+.5,h:17,y:D});}

// The marshalling yard on the west half: lanes along z from the land edge to
// the quay apron, a gate canopy across them with booths, bays with trucks.
function tmShipYard(G,d){const D=PORT.DECK,x0=-45,x1=-3,nl=5,lw=(x1-x0)/nl,zg=-46;
 // painted lanes (lost in patches at d=1)
 const lc=d>0?new THREE.Color(0x9a948a):new THREE.Color(0xf4f2ea),yc=new THREE.Color(0xe0b840);
 for(let i=0;i<=nl;i++){const x=x0+i*lw;for(let z=-66;z<-12;z+=6){if(d===1&&rng()<.45)continue;
  kput('tmLine',[x,D+.06,z+1.5],qEuler(0,Math.PI/2,0),[i===0||i===nl?6:3,1,.22],i===0||i===nl?yc:lc);}}
 for(let i=0;i<nl;i++){const x=x0+(i+.5)*lw;if(d===1&&rng()<.4)continue;
  kput('tmLine',[x,D+.06,zg+6],null,[lw*.8,1,.4],lc);           // stop line
  for(let k=0;k<3;k++)kput('tmLine',[x+(k-1)*.6,D+.06,-20],qEuler(0,Math.PI/2,0),[3,1,.25],yc);}   // arrows (a hint)
 // the gate canopy: a white slab on two rows of columns, booths between lanes
 const cw=x1-x0+4,cd=10,cy=D+6.2,hole=d>0?holeFn(d,41,null,1):null;
 pbAdd(gridSurface((u,v)=>[x0-2+u*cw,cy+.5*Math.sin(Math.PI*u),zg-cd/2+v*cd],16,4,{uS:cw/8,vS:cd/8,hole:hole?(u,v)=>hole(u*2,v*30):null}),SHELL(d),G);
 pbBox(G,d>0?MAT.rust:MAT.white,(x0+x1)/2,cy-.25,zg+cd/2,cw,.6,.3,0,8);pbBox(G,d>0?MAT.rust:MAT.white,(x0+x1)/2,cy-.25,zg-cd/2,cw,.6,.3,0,8);
 for(let i=0;i<=nl;i++){const x=x0+i*lw;for(const s of [-1,1]){const ph=cy-D+.3*Math.sin(Math.PI*(i/nl));kput(d>0?'postR':'postW',[x,D+ph/2,zg+s*(cd/2-1)],d===1&&rng()<.2?qEuler(rr(-.1,.1),0,rr(-.1,.1)):null,[.3,ph,.3],null);}
  if(i>0&&i<nl){kput(BOXC(d),[x,D+1.4,zg],null,[1.6,2.8,3.2],null);
   kput(d>0?'paneD':'pane',[x,D+1.8,zg+1.62],null,[1.3,1.2,1],null);
   if(d===0)kput('dot',[x,D+2.9,zg+1.7],null,[.8,.3,.3],new THREE.Color(0x40ff90));}}
 if(d===0)for(let i=0;i<nl;i++)kput('strip',[x0+(i+.5)*lw,cy-.6,zg+cd/2+.2],null,[lw*.7,1,1],CYAN);
 REGISTER({name:'Gate canopy',x:(x0+x1)/2-8,z:zg,r:11,h:8,y:D});REGISTER({name:'Gate canopy',x:(x0+x1)/2+8,z:zg,r:11,h:8,y:D});
 // trucks: queuing at the gate and parked in the bays
 const lanes=[0,1,2,3,4].map(i=>x0+(i+.5)*lw);
 if(d===0){[[0,-60],[1,-62],[3,-58],[4,-61],[1,-30],[2,-26],[4,-32]].forEach(([l,z])=>tmTruck(lanes[l],D,z,-Math.PI/2,d));
  portFigures(-24,D,zg,6,16);}
 if(d===1){tmTruck(lanes[0],D,-58,-Math.PI/2+.1,d);tmTruck(lanes[2],D,-30,-Math.PI/2-.15,d,{box:false});
  tmTruck(lanes[3],D,-24,-.9,d,{side:true});portContainer(lanes[3]+4,D,-18,.8,true,1,null,[1.5,.02]);
  tmTruck(lanes[4],D,-62,-Math.PI/2+.05,d);portTrees(x0,-60,x1,-50,3,D,5,9);}
 if(d>=3){// market under the gate canopy; container houses in the bays; a truck turned stall
  for(let i=0;i<nl;i++)for(const s of [-1,1])portStall(lanes[i]+rr(-.6,.6),D,zg+s*2.6,s>0?0:Math.PI);
  for(let i=0;i<6;i++){kput('dot',[x0+4+i*7,cy-.8,zg+rr(-3,3)],null,[.5,.5,.5],WARM);}
  portContainerHouse(G,lanes[0],D,-26,Math.PI/2+rr(-.1,.1),d,{levels:2,big:true});
  portContainerHouse(G,lanes[2]+1,D,-24,Math.PI/2+rr(-.1,.1),d,{levels:1,big:true});
  portContainerHouse(G,lanes[4],D,-28,Math.PI/2+rr(-.1,.1),d,{levels:3,big:false});
  portContainerHouse(G,lanes[1],D,-62,rr(-.1,.1),d,{levels:2,big:true});
  tmTruck(lanes[3],D,-60,-Math.PI/2,d,{box:false});portStall(lanes[3]+2.2,D,-58,Math.PI/2);
  portGarden(lanes[3],D,-26,8,10,d);}}

PORT_SEG({key:'tmShip',name:'Shipping terminal',cls:'seg',W:110,LAND:TMS.LAND,SEA:TMS.SEA,decays:[0,1,3],stamps:tmShipStamps,build:buildTmShip});
