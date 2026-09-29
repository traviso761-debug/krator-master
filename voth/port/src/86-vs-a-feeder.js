// ================================================================ VESSELS: container ships (shared kit + vsFeeder)
// Three container ships, all built by one hull-and-deck kit (this file) plus a
// per-ship reclaimed town (this file: the feeder's; 86-vs-b / 86-vs-c: the
// Panamax's and the giant's). Vessel frame (API.md "Vessels"): origin midship
// on the waterline, bow +z at heading 0, keel at -T. Seeds 20500-20599:
// feeder 20500+d, Panamax 20510+d, giant 20520+d.
//   d=0 intact    Ancient Krator: white/grey panelled hull over a coloured
//                 boot-top, white terraced superstructure, clean stacks
//   d=1 ruined    aground and listing (the giant broken in two), hull holed,
//                 rust, stacks collapsed and spilled into the sea, weeds
//   d=3 reclaimed a town piled on the hull (see the boat* references); each
//                 ship its own character: feeder = market ship, Panamax =
//                 terraced garden ship, giant = dense vertical stack town
//
// HOW IT IS BUILT. Everything is placed in the HULL FRAME and handed to a
// PART group (vsCtx): one part for a ship afloat, two for the broken giant.
// A part's matrix is heading * (sink, pitch, roll about its pivot), and it is
// also installed as KXF, so kput items follow the meshes exactly. A second
// frame, the WATER frame (heading only), is for things on the sea: spilled
// containers, skiffs, pontoons. REGISTER goes through C.reg, which applies
// the part matrix (REGISTER itself knows only KOFF).

// ---------------------------------------------------------------- materials (top level: they get the underwater fade)
MAT.vsHull=new THREE.MeshStandardMaterial({map:TEX.panel,roughnessMap:TEX.panelRM,metalnessMap:TEX.panelRM,color:0xf4f3ef,metalness:1,roughness:1,side:DS});
MAT.vsHullG=new THREE.MeshStandardMaterial({map:TEX.panel,roughnessMap:TEX.panelRM,metalnessMap:TEX.panelRM,color:0xb9bec2,metalness:1,roughness:1,side:DS});
MAT.vsBootR=new THREE.MeshStandardMaterial({color:0xa8322a,roughness:.5,metalness:.2,side:DS});
MAT.vsBootB=new THREE.MeshStandardMaterial({color:0x1d4f86,roughness:.5,metalness:.2,side:DS});
MAT.vsBootT=new THREE.MeshStandardMaterial({color:0x167a72,roughness:.5,metalness:.2,side:DS});
MAT.vsBottom=new THREE.MeshStandardMaterial({color:0x5c2622,roughness:.8,metalness:.1,side:DS});
MAT.vsBootRu=new THREE.MeshStandardMaterial({map:TEX.rust,color:0x8a5a4a,roughness:.9,metalness:.2,side:DS});
MAT.vsDeck=new THREE.MeshStandardMaterial({map:TEX.panel,color:0x75807a,roughness:.85,metalness:.2,side:DS});
MAT.vsDeckR=new THREE.MeshStandardMaterial({map:TEX.rust,color:0x9a7a68,roughness:.95,metalness:.1,side:DS});
MAT.vsHatch=new THREE.MeshStandardMaterial({map:TEX.panel,color:0xa9b0ae,roughness:.7,metalness:.25});
MAT.vsRust=new THREE.MeshStandardMaterial({map:TEX.rust,roughnessMap:TEX.rustRM,metalnessMap:TEX.rustRM,color:0xa8968c,metalness:1,roughness:1,side:DS});
MAT.vsVoid=new THREE.MeshBasicMaterial({color:0x0b0b0d,side:DS});   // the dark inside a holed hull, lit or not
MAT.vsSoil=new THREE.MeshStandardMaterial({map:TEX.concrete,color:0x5a4430,roughness:1,metalness:0,side:DS});
MAT.vsGreen=new THREE.MeshStandardMaterial({map:TEX.concrete,color:0x4c6a30,roughness:1,metalness:0,side:DS});

const VS={RP:2.5,TP:2.6,BP:13.4};                     // row pitch, tier pitch, 40 ft bay pitch
const VS_LINE=[0xe8e6e0,0x2d5f8e,0xb04a2c,0x3a7a6a,0xd8a63a,0x8a8c8e,0x5a4a7a,0xc8c4bc,0x1f3f66,0x9a3a30,0xe0dcd2].map(c=>new THREE.Color(c));
const VS_RAIL=new THREE.Color(0x6a5040);
function vsCC(prev){return prev&&rng()<.55?prev:VS_LINE[(rng()*VS_LINE.length)|0];}
function vsPaint(){const H=[0,.03,.08,.12,.3,.45,.52,.58,.9,.95];return new THREE.Color().setHSL(H[(rng()*H.length)|0]+rr(-.02,.02),rr(.3,.6),rr(.45,.66));}
function vsPaintM(){return new THREE.Color().setHSL(rr(0,1),rr(.12,.35),rr(.36,.58)).lerp(new THREE.Color(0x7a5040),rr(.1,.4));}
function vsShackC(){const H=[.05,.09,.13,.55,.6,.95,.33];return new THREE.Color().setHSL(H[(rng()*H.length)|0],rr(.15,.45),rr(.62,.86));}
function vsQ(yaw,pitch,roll){const q=qEuler(0,yaw||0,0);if(pitch||roll)q.multiply(qEuler(pitch||0,0,roll||0));return q;}

// ---------------------------------------------------------------- frames
function vsCtx(G,heading,parts){
 const mk=p=>{const g=new THREE.Group();g.matrixAutoUpdate=false;const m=new THREE.Matrix4().makeRotationY(heading);
  if(p&&(p.roll||p.pitch||p.sink)){const t=new THREE.Matrix4(),pz=p.pz||0;
   m.multiply(t.makeTranslation(0,p.sink||0,pz+(p.dz||0)));m.multiply(t.makeRotationFromEuler(new THREE.Euler(p.pitch||0,0,p.roll||0)));m.multiply(t.makeTranslation(0,0,-pz));}
  g.matrix.copy(m);G.add(g);const q=new THREE.Quaternion();m.decompose(new THREE.Vector3(),q,new THREE.Vector3());
  return {g,m,q,z0:p&&p.z0!=null?p.z0:-1e9,z1:p&&p.z1!=null?p.z1:1e9,roll:(p&&p.roll)||0};};
 const C={G,parts:parts.map(mk),water:mk(null)};
 C.part=z=>{for(const p of C.parts)if(z<p.z1)return p;return C.parts[C.parts.length-1];};
 C.use=p=>{KXF={m:p.m,q:p.q};return p.g;};
 C.at=z=>C.use(C.part(z));
 C.wat=()=>C.use(C.water);
 C.reg=(name,x,z,r,h,y)=>{const v=new THREE.Vector3(x,y||0,z).applyMatrix4(C.part(z).m);REGISTER({name,x:v.x,z:v.z,r,h,y:v.y});};
 return C;}

// ---------------------------------------------------------------- hull lines
// Station s = z/(L/2) in [-1,1]. bd(s): half-breadth at the deck (fraction of
// B/2), bk(s): at the bilge, yk(s): keel line, yd(s): deck line (forecastle
// sheer). A section runs from the bilge (w=0) up to the deck edge (w=1); the
// exponent pw(s) makes it a round-bilged box amidships and a flared V at the
// ends. Bands are cut by HEIGHT, so the boot-top follows the real waterline.
function vsLines(S){const hb=S.B/2,L2=S.L/2,T=S.T,sm=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
 S.hb=hb;S.L2=L2;
 S.bd=s=>{if(s>S.sb){const t=(s-S.sb)/(1-S.sb);return Math.max(.012,1-Math.pow(t,1.9));}
  if(s<-S.sa){const t=(-S.sa-s)/(1-S.sa);return 1-.17*t*t;}return 1;};
 S.bk=s=>{const f=S.sb-.12,a=S.sa-.08;
  if(s>f){const t=clamp((s-f)/(.97-f),0,1);return .9*Math.pow(Math.max(0,1-Math.pow(t,1.35)),1.3);}
  if(s<-a){const t=clamp((-a-s)/(.88-a),0,1);return .9*(1-.96*Math.pow(t,1.15));}return .9;};
 S.yk=s=>{if(s>.9){const t=(s-.9)/.1;return -T+T*.5*t*t;}if(s<-.68)return -T+T*.84*sm((-.68-s)/.32);return -T;};
 S.yd=s=>S.F+(S.fc||0)*sm((s-.8)/.1);
 S.pw=s=>{const e=Math.max((s-(S.sb-.08))/(1-S.sb+.08),(-(S.sa-.05)-s)/(1-S.sa+.05));return lerp(10,1.5,clamp(e,0,1));};
 S.side=(s,w,sd)=>{const yk=S.yk(s),yd=S.yd(s),bk=S.bk(s)*hb,bd=S.bd(s)*hb;const f=1-Math.pow(1-w,S.pw(s));
  return[sd*(bk+(bd-bk)*f),yk+(yd-yk)*w,s*L2];};
 S.wAt=(s,y)=>clamp((y-S.yk(s))/(S.yd(s)-S.yk(s)),0,1);
 S.ydz=z=>S.yd(z/L2);S.bdz=z=>S.bd(clamp(z/L2,-1,1))*hb;
 // bays: 40 ft bays centred in each container zone
 S.bays=[];for(const [a,b] of S.zones){const n=Math.floor((b-a)/VS.BP+1e-6),c=(a+b)/2;for(let i=0;i<n;i++)S.bays.push((i-(n-1)/2)*VS.BP+c);}
 S.rowsAt=z=>{const w=Math.min(S.bdz(z-6.3),S.bdz(z+6.3),S.bdz(z))*2-2.4;return Math.max(2,Math.min(S.rows,Math.floor(w/VS.RP)));};
 S.yb=S.F+S.hc;                                   // hatch top = first tier's floor
 return S;}

// One band of the shell, both sides, between heights y0 and y1.
function vsSkin(par,S,s0,s1,y0,y1,mat,nu,nv,hole,ins,nr){
 for(const sd of [1,-1]){
  const H=hole?(u,v)=>{const s=lerp(s0,s1,u),w=lerp(S.wAt(s,y0),S.wAt(s,y1),v);return hole(s*S.L2,S.yk(s)+(S.yd(s)-S.yk(s))*w,sd);}:null;
  const g=gridSurface((u,v)=>{const s=lerp(s0,s1,u);const p=S.side(s,lerp(S.wAt(s,y0),S.wAt(s,y1),v),sd);if(ins)p[0]*=ins;return p;},nu,nv,
   {uS:S.L*(s1-s0)/16,vS:Math.max(1,Math.min(y1,S.F+4)-Math.max(y0,-S.T))/8,hole:H});
  pbAdd(g,mat,par,nr);}}
// Fill the section at station sc (a transom, or the torn face of a break).
function vsSection(par,S,sc,mat,y0){const a=S.wAt(sc,y0==null?-1e3:y0);
 pbAdd(gridSurface((u,v)=>{const p=S.side(sc,lerp(a,1,u),1);return[(v*2-1)*p[0],p[1],p[2]];},12,4,{uS:S.B/8,vS:S.F/8}),mat,par);}

function vsHull(C,S,d){const T=S.T,hb=S.hb,L2=S.L2;
 const yb0=-.22*T,yb1=Math.min(.3*T,S.F-1.2);
 const top=d>0?MAT.vsRust:S.mat,boot=d===0?S.boot:MAT.vsBootRu,bot=d>0?MAT.vsBootRu:MAT.vsBottom,deck=d>0?MAT.vsDeckR:MAT.vsDeck;
 const hole=d===1&&S.holes.length?(z,y,sd)=>{for(const h of S.holes){if(h.sd!==sd)continue;const a=(z-h.z)/h.rz,b=(y-h.y)/h.ry;
  if(a*a+b*b<1+.9*(fbm(z*.21,y*.33,h.z,2)-.5))return true;}return false;}:null;
 C.parts.forEach((p,i)=>{const s0=clamp(p.z0/L2,-1,1),s1=clamp(p.z1/L2,-1,1);if(s1<=s0)return;const par=C.use(p);
  const nu=Math.max(6,Math.round(S.nu*(s1-s0)/2));
  vsSkin(par,S,s0,s1,-1e3,yb0,bot,nu,5,null,0,true);
  vsSkin(par,S,s0,s1,yb0,yb1,boot,nu,1,null,0,true);
  vsSkin(par,S,s0,s1,yb1,1e3,top,hole?nu*2:nu,hole?12:5,hole);
  if(hole)vsSkin(par,S,s0,s1,yb1,1e3,MAT.vsVoid,nu,3,null,.955,true);
  pbAdd(gridSurface((u,v)=>{const s=lerp(s0,s1,u);return[(v*2-1)*S.bk(s)*hb,S.yk(s),s*L2];},nu,2,{uS:S.L*(s1-s0)/16,vS:S.B/8}),bot,par,true);
  pbAdd(gridSurface((u,v)=>{const s=lerp(s0,s1,u);return[(v*2-1)*S.bd(s)*hb*.996,S.yd(s)+.03,s*L2];},nu,4,{uS:S.L*(s1-s0)/16,vS:S.B/8}),deck,par);
  if(s0<=-1+1e-6)vsSection(par,S,-1,top);else vsSection(par,S,s0,MAT.vsVoid);
  if(s1<1-1e-6)vsSection(par,S,s1,MAT.vsVoid);});
 // forecastle bulwark and breakwater, the rail round the rest of the deck
 const bp=C.at(L2);
 for(const sd of [1,-1])pbAdd(gridSurface((u,v)=>{const s=lerp(.78,1,u);return[sd*S.bd(s)*hb,S.yd(s)+v*1.8,s*L2];},16,1,{uS:.22*L2/8,vS:.25}),top,bp);
 const zb=S.bays[S.bays.length-1]+8.2,wb=S.bdz(zb);C.at(zb);
 for(const sd of [1,-1])pbBox(C.part(zb).g,top,sd*wb*.45,S.ydz(zb)+2.2,zb+wb*.18,wb*.95,4.4,.5,sd*.38,8);
 for(const p of C.parts){const s0=Math.max(-.97,p.z0/L2),s1=Math.min(.78,p.z1/L2);if(s1<=s0)continue;const par=C.use(p);
  for(const sd of [1,-1])for(const hy of [.55,1.1])pbAdd(gridSurface((u,v)=>{const s=lerp(s0,s1,u);return[sd*(S.bd(s)*hb-.12),S.yd(s)+hy+v*.07,s*L2];},Math.max(4,Math.round(S.nu*(s1-s0)/4)),1),MAT.pkSteel,par);
  for(let z=s0*L2+2;z<s1*L2;z+=6)for(const sd of [1,-1]){if(d===1&&rng()<.25)continue;kput(d>0?'postR':'postW',[sd*(S.bdz(z)-.12),S.ydz(z)+.56,z],null,[.05,1.12,.05],null);}}
 // anchors in their pockets, bollards fore and aft
 {const z=.9*L2;C.at(z);for(const sd of [1,-1]){kput('boxD',[sd*(S.bdz(z)+.1),S.ydz(z)-2.6,z],vsQ(sd*.5),[.5,2.4,1.8],null);
   kput('pkBollard',[sd*(S.bdz(z-10)-2),S.ydz(z-10),z-10],null,1.4,null);}
  const zs=-.9*L2;C.at(zs);for(const sd of [1,-1])kput('pkBollard',[sd*(S.bdz(zs)-2),S.ydz(zs),zs],null,1.4,null);}}

// ---------------------------------------------------------------- superstructure
function vsSE(w,dp,n,N){const P=[];for(let i=0;i<N;i++){const th=i/N*TAU,r=se(th,n);P.push([Math.cos(th)*r*w/2,Math.sin(th)*r*dp/2]);}return P;}
function vsWall(par,mat,P,cx,y0,cz,h,o){o=o||{};const N=P.length,sc=o.sc||1;let per=0;
 for(let i=0;i<N;i++){const a=P[i],b=P[(i+1)%N];per+=Math.hypot(b[0]-a[0],b[1]-a[1]);}
 pbAdd(gridSurface((u,v)=>{const p=P[Math.round(u*N)%N];return[cx+p[0]*sc,y0+v*h,cz+p[1]*sc];},N,o.nv||1,{uS:per/8,vS:h/8,hole:o.hole}),mat,par);}
function vsLid(par,mat,P,cx,y,cz){const s=new THREE.Shape();P.forEach((p,i)=>i?s.lineTo(p[0],-p[1]):s.moveTo(p[0],-p[1]));
 const g=new THREE.ShapeGeometry(s);g.rotateX(-Math.PI/2);g.translate(cx,y,cz);const uv=g.attributes.uv;
 for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/8,uv.getY(i)/8);pbAdd(g,mat,par);}
// The accommodation: a white tower of rounded storeys stepping back in
// terraces at the FRONT (the Ancients' terraced marine form), ribbon windows
// on every storey, and a full-beam bridge deck on top with a mast.
// H = {z, dp, w, n storeys, sh storey height, step (front setback per 2
// storeys), bw bridge width, bdp bridge depth, se superellipse exponent, y0}
function vsHouse(C,S,H,d){const par=C.at(H.z),SH=d===0?MAT.white:MAT.vsRust,WN=d===0?MAT.winIntact:MAT.winDead;
 let y=H.y0!=null?H.y0:S.F;const out={tiers:[]};
 const hole=d===1?(u,v)=>fbm(u*7,v*1.6,H.z*.07+3,2)<.36:null;
 for(let s=0;s<H.n;s+=2){const k=s/2,ns=Math.min(2,H.n-s),h=ns*H.sh;
  const dp=H.dp-k*H.step,w=H.w-k*(H.stepW||0),cz=H.z-(H.dp-dp)/2;const P=vsSE(w,dp,H.se||5,40);
  vsWall(par,SH,P,0,y,cz,h,{nv:ns*3,hole});
  for(let j=0;j<ns;j++)if(!(d===1&&rng()<.3))vsWall(par,WN,P,0,y+j*H.sh+1,cz,1.25,{sc:1+.24/Math.min(w,dp)});
  vsLid(par,SH,P,0,y+h,cz);
  if(d===0)for(let i=0;i<5;i++){const a=rr(0,TAU),r=se(a,H.se||5);kput('dot',[Math.cos(a)*r*w/2*1.02,y+Math.floor(rr(0,ns))*H.sh+1.6,cz+Math.sin(a)*r*dp/2*1.02],vsQ(Math.PI/2-a),[1.1,.9,.3],CYAN);}
  out.tiers.push({y,h,w,dp,cz,P});y+=h;}
 const t=out.tiers[out.tiers.length-1],bz=t.cz+t.dp/2-H.bdp/2,PB=vsSE(H.bw,H.bdp,8,56);
 vsWall(par,SH,PB,0,y,bz,3.4,{hole});
 if(d!==1)vsWall(par,WN,PB,0,y+1.1,bz,1.7,{sc:1.006});
 vsLid(par,SH,PB,0,y,bz);vsLid(par,SH,vsSE(H.bw+.8,H.bdp+.8,8,56),0,y+3.4,bz);
 vsWall(par,SH,vsSE(H.bw+.8,H.bdp+.8,8,56),0,y+3.2,bz,.4);
 out.by=y;out.top=y+3.6;out.bz=bz;
 if(d===0){for(let x=-H.bw*.4;x<=H.bw*.4;x+=2.4)kput('dot',[x,y+1.9,bz+H.bdp/2+.06],null,[1.4,.8,.2],CYAN);}
 // the mast: pole, yard, radar, lights
 const my=out.top,mz=bz-1;
 if(d===1){kput('postR',[1.5,my+.6,mz],qEuler(0,0,Math.PI/2-.2),[.3,9,.3],null);}
 else{kput(d===0?'postW':'postR',[0,my+4.5,mz],null,[.3,9,.3],null);kput(d===0?'boxW':'boxR',[0,my+7,mz],null,[6,.3,.3],null);
  kput(d===0?'boxW':'boxR',[0,my+2.4,mz+1.2],vsQ(rr(0,TAU)),[6,.3,.7],null);
  if(d===0){kput('dot',[-3,my+7.3,mz],null,[.35,.35,.35],new THREE.Color(0xff3a2a));kput('dot',[3,my+7.3,mz],null,[.35,.35,.35],new THREE.Color(0x3aff6a));
   kput('dot',[0,my+9.2,mz],null,[.4,.4,.4],new THREE.Color(0xffffff));}}
 // a free-fall lifeboat on its ramp at the back of the house
 if(d!==1&&!H.noBoat){const lb=H.z-H.dp/2-2.4;kput('boxW',[H.w*.28,y*.35+S.F*.65,lb],vsQ(0,-.5),[2.8,2.6,8.5],new THREE.Color(0xf07a1a));}
 return out;}
function vsFunnel(C,S,Fn,d){const par=C.at(Fn.z),SH=d===0?MAT.white:MAT.vsRust,P=vsSE(Fn.w,Fn.dp,Fn.se||3.2,28),x=Fn.x||0,y0=Fn.y0!=null?Fn.y0:S.F;
 vsWall(par,SH,P,x,y0,Fn.z,Fn.h);vsWall(par,d===0?S.boot:MAT.vsBootRu,P,x,y0+Fn.h-5.5,Fn.z,2.4,{sc:1.015});
 vsLid(par,MAT.dark,P,x,y0+Fn.h,Fn.z);
 for(const o of [-.22,.22])kput(d===0?'pipe':'pipeR',[x+o*Fn.w,y0+Fn.h+1.2,Fn.z],null,[.45,2.4,.45],null);
 return y0+Fn.h;}
// A deck crane on a pedestal: slewing cab, box jib at `el`, hoist wire.
// Returns the jib tip (hull frame).
function vsCrane(C,S,x,z,d,o){C.at(z);const y0=S.ydz(z),H=o.H||12,yaw=o.yaw||0,el=o.el||0,len=o.len||25;
 const col=d===1?new THREE.Color(0x9a7060):d===3?new THREE.Color(0xe8d49a):o.col||null,P=d>0?'postR':'postW',B=d>0?'boxR':'boxW',St=d>0?'strutR':'strutW';
 kput(P,[x,y0+H/2,z],o.lean?vsQ(0,o.lean,0):null,[1.3,H,1.3],col);
 const cy=y0+H+1.6;kput(B,[x,cy,z],vsQ(yaw,0,o.lean||0),[4.2,3.2,5.2],col);
 const piv=[x+Math.sin(yaw)*1.8,cy+.2,z+Math.cos(yaw)*1.8],dir=[Math.sin(yaw)*Math.cos(el),Math.sin(el),Math.cos(yaw)*Math.cos(el)];
 const tip=[piv[0]+dir[0]*len,piv[1]+dir[1]*len,piv[2]+dir[2]*len];
 for(const s of [-.55,.55]){const ox=Math.cos(yaw)*s,oz=-Math.sin(yaw)*s;beam(St,[piv[0]+ox,piv[1],piv[2]+oz],[tip[0]+ox*.3,tip[1],tip[2]+oz*.3],.5,.7,col);}
 beam(St,[x-Math.sin(yaw)*1.5,cy+4.5,z-Math.cos(yaw)*1.5],[piv[0],piv[1],piv[2]],.35,.35,col);
 kput(B,[x-Math.sin(yaw)*1.5,cy+2.8,z-Math.cos(yaw)*1.5],vsQ(yaw),[.6,3.4,.6],col);
 beam('strutR',[x-Math.sin(yaw)*1.5,cy+4.5,z-Math.cos(yaw)*1.5],tip,.06,.06,null);
 if(o.hook!==false){const hy=o.hookY!=null?o.hookY:tip[1]-6;beam('strutR',tip,[tip[0],hy,tip[2]],.06,.06,null);kput('boxD',[tip[0],hy-.4,tip[2]],null,[.7,.8,.7],null);}
 return tip;}

// ---------------------------------------------------------------- the cargo
function vsHatches(C,S,d){const m=d>0?MAT.vsDeckR:MAT.vsHatch;
 for(const z of S.bays){if(d===3&&S.noHatchAt&&S.noHatchAt(z,S))continue;const nr=S.rowsAt(z),w=nr*VS.RP+.8;const par=C.at(z);
  pbBox(par,m,0,S.F+S.hc/2,z,w,S.hc,12.9,0,8);}
 // lashing bridges in the gaps between neighbouring bays
 for(let i=1;i<S.bays.length;i++){const za=S.bays[i-1],zb=S.bays[i];if(zb-za>VS.BP+.1)continue;const z=(za+zb)/2,par=C.at(z);
  const w=Math.min(S.rowsAt(za),S.rowsAt(zb))*VS.RP;const mt=d>0?MAT.rust:MAT.pkSteel;
  for(const h of [VS.TP,VS.TP*2])pbBox(par,mt,0,S.yb+h,z,w,.14,.9,0,8);
  for(let x=-w/2;x<=w/2+.01;x+=w/4)pbBox(par,mt,x,S.yb+VS.TP,z,.18,VS.TP*2,.18,0,8);
  if(d===0&&i%2)kput('dot',[0,S.yb+VS.TP*2+.4,z],null,[.5,.3,.5],new THREE.Color(0xfff4d8));}}
// Intact: full, clean bays, the odd column one or two short.
function vsStacks(C,S){const q=qEuler(0,Math.PI/2,0);
 for(const z of S.bays){C.at(z);const nr=S.rowsAt(z),nt=S.tiers(z);let col=null;
  for(let r=0;r<nr;r++){const x=(r-(nr-1)/2)*VS.RP;let n=nt;if(rng()<.1)n--;if(rng()<.04)n-=2;
   for(let t=0;t<n;t++){col=vsCC(col);kput('pkCont40',[x,S.yb+t*VS.TP,z],q,1,col);}}}}
// Ruined: rusted, whole bays toppled, the low side's columns gone overboard
// into a spill field in the water frame.
function vsStacksRuin(C,S){const hb=S.hb;
 for(const z of S.bays){const p=C.part(z),lo=p.roll>0?-1:1;C.use(p);const nr=S.rowsAt(z),nt=S.tiers(z);const fall=rng()<.4;
  for(let r=0;r<nr;r++){const x=(r-(nr-1)/2)*VS.RP;const edge=lo>0?r>=nr-2:r<2;
   let k=fall?Math.floor(rr(1,nt+.99)):rng()<.18?1+((rng()*2)|0):0;if(rng()<.12)k=nt;
   const st=Math.max(0,nt-k);
   for(let t=0;t<st;t++)kput('pkCont40R',[x+rr(-.08,.08),S.yb+t*VS.TP,z],vsQ(Math.PI/2+rr(-.02,.02)),1,portContColor(1));
   for(let j=0;j<nt-st;j++){
    if((edge||fall)&&rng()<(S.spill||.38)){C.wat();kput('pkCont40R',[lo*(hb+rr(3,34)),rr(-2.3,-1.1),z+rr(-14,14)],vsQ(rr(0,TAU),rr(-.35,.35),rr(-.3,.3)),1,portContColor(1));C.use(p);}
    else if(rng()<.7)kput('pkCont40R',[x+lo*rr(.8,4),S.yb+(st+j*.7)*VS.TP-rr(0,1),z+rr(-2,2)],vsQ(Math.PI/2+rr(-.3,.3),rr(-.1,.1),lo*rr(-.9,-.15)),1,portContColor(1));}}}}

// ---------------------------------------------------------------- ruin dressing
function vsRuinDress(C,S,o){o=o||{};const hb=S.hb,L2=S.L2;
 // rust streaks down the shell, vines over the rail, weeds and moss on deck
 for(let i=0;i<S.L*.35;i++){const s=rr(-.85,.75),sd=rng()<.5?1:-1,z=s*L2;C.at(z);const y=S.ydz(z)-rr(.2,1.2);const w=S.wAt(s,y);const p=S.side(s,w,sd);
  kput('stain',[p[0]+sd*.15,p[1]-2.5,p[2]],vsQ(sd*Math.PI/2),[rr(1,3.5),rr(3,8),1],null);
  if(rng()<.45)kput('vine',[p[0]+sd*.2,p[1]+.3,p[2]],qEuler(rr(-.1,.1),0,rr(-.1,.1)),[1,rr(2,S.F*.8),1],null);}
 for(let i=0;i<S.L*.5;i++){const z=rr(-L2*.95,L2*.95);C.at(z);const x=rr(-.9,.9)*S.bdz(z);
  kput(rng()<.6?'moss':'leafCard',[x,S.ydz(z)+.1,z],qEuler(0,rng()*TAU,0),[rr(.5,2.2),rr(.12,.5),rr(.5,2)],new THREE.Color().setHSL(rr(.2,.3),rr(.3,.5),rr(.12,.3)));}
 // trees in the stacks and on the house terraces
 for(let i=0;i<(o.trees||6);i++){const z=S.bays[(rng()*S.bays.length)|0];C.at(z);const nt=S.tiers(z);
  VEG.tree(rr(-.35,.35)*S.B,S.yb+Math.floor(rr(0,nt-1))*VS.TP+VS.TP,z+rr(-4,4),i%3,rr(4,9));}}

// ---------------------------------------------------------------- reclaimed vocabulary
// A plank (or rod, with name 'strutR') from a to b, width w, thickness th.
function vsPlank(a,b,w,th,col,name){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],hd=Math.hypot(dx,dz),L=Math.hypot(hd,dy);if(L<.05)return;
 kput(name||'plank',[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],vsQ(Math.atan2(dx,dz),-Math.atan2(dy,hd)),[w,th,L],col||null);}
// A walkway or bridge: plank deck, two hand ropes, sag s at mid-span.
function vsWalk(a,b,w,o){o=o||{};const sg=o.sag||0,n=sg?6:1,dx=b[0]-a[0],dz=b[2]-a[2],hd=Math.hypot(dx,dz)||1,px=dz/hd*w/2,pz=-dx/hd*w/2;
 const P=t=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-sg*Math.sin(Math.PI*t),lerp(a[2],b[2],t)];
 for(let i=0;i<n;i++){const A=P(i/n),B=P((i+1)/n);vsPlank(A,B,w,.14,o.col);
  if(o.rails!==false)for(const s of [1,-1])vsPlank([A[0]+s*px,A[1]+1,A[2]+s*pz],[B[0]+s*px,B[1]+1,B[2]+s*pz],.05,.05,VS_RAIL,'strutR');}
 if(o.rails!==false)for(const s of [1,-1])for(const E of [a,b])kput('postR',[E[0]+s*px,E[1]+.5,E[2]+s*pz],null,[.06,1,.06],VS_RAIL);}
// A string of warm lamps between two points.
function vsLights(a,b,n,sag){for(let i=1;i<n;i++){const t=i/n;kput('dot',[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-(sag||0)*Math.sin(Math.PI*t),lerp(a[2],b[2],t)],null,[.22,.22,.22],WARM);}}
// A glow at night (FIREKIT: shown only after dark) round a lamp or a fire.
function vsGlow(x,y,z,s){kput('emberB',[x,y,z],qEuler(0,rng()*TAU,0),[s,s*.8,s],new THREE.Color().setHSL(rr(.06,.09),1,.3));}
// The old accommodation, lived in: shacks hung round every tier on plank
// brackets, facing out, and warm lit rooms along the dead window bands.
function vsHouseTown(C,S,hs,H,o){o=o||{};const n=H.se||5;C.at(H.z);
 hs.tiers.forEach((T,ti)=>{const P=t=>{const r=se(t,n);return[Math.cos(t)*r*T.w/2,T.cz+Math.sin(t)*r*T.dp/2];};
  const cnt=Math.round((T.w+T.dp)*(o.dens||.35));
  for(let i=0;i<cnt;i++){const a=rr(0,TAU);if(ti===hs.tiers.length-1&&Math.sin(a)>.5)continue;
   const p=P(a),q=P(a+.01),tx=q[0]-p[0],tz=q[1]-p[1],L=Math.hypot(tx,tz)||1,nx=tz/L,nz=-tx/L;
   const w=rr(2.2,3.4),dp=rr(2,3),x=p[0]+nx*(dp/2+.3),z=p[1]+nz*(dp/2+.3),y=T.y+Math.floor(rr(0,T.h/H.sh))*H.sh+.3,yaw=Math.atan2(nx,nz);
   kput('plank',[x,y-.12,z],vsQ(yaw),[w+.6,.2,dp+.8],null);
   beam('strutR',[p[0],y-2.2,p[1]],[x+nx*dp*.4,y-.2,z+nz*dp*.4],.1,.1,null);
   vsShack(x,y,z,w,dp,2.4,yaw,{lit:.55});}
  for(let i=0;i<(T.w+T.dp)*.3;i++){const a=rr(0,TAU),r=se(a,n);
   kput('dot',[Math.cos(a)*r*T.w/2*1.02,T.y+Math.floor(rr(0,T.h/H.sh))*H.sh+1.6,T.cz+Math.sin(a)*r*T.dp/2*1.02],vsQ(Math.PI/2-a),[1,.8,.3],WARM);}});}
// A shack: corrugated box, tarp roof, a window or two. Returns its roof height.
function vsShack(x,y,z,w,dp,h,yaw,o){o=o||{};kput('shantyBox',[x,y+h/2,z],vsQ(yaw),[w,h,dp],o.col||vsShackC());
 kput('shantyRoof',[x,y+h+.1,z],vsQ(yaw,rr(.05,.2)*(rng()<.5?1:-1)),[w*1.2,1,dp*1.2],null);
 const c=Math.cos(yaw),s=Math.sin(yaw);
 for(const sd of [1,-1]){if(rng()<.3)continue;const lx=rr(-w*.25,w*.25),lz=sd*(dp/2+.04),lit=rng()<(o.lit==null?.45:o.lit);
  kput(lit?'dot':'cellD',[x+lx*c+lz*s,y+h*.55,z-lx*s+lz*c],vsQ(yaw),lit?[.55,.75,.2]:[.8,.8,.2],lit?WARM:null);}
 return y+h+.2;}
// A container turned into a home: painted, windows cut in the long faces
// (o.sides: which local-z faces), a door and awning on the first face.
function vsHome(x,y,z,yaw,big,o){o=o||{};const L=big?12.19:6.06,c=Math.cos(yaw),s=Math.sin(yaw);
 const at=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];
 kput(big?'pkCont40R':'pkCont20R',[x,y,z],vsQ(yaw),1,o.col||vsPaint());
 const nw=big?2:1,sides=o.sides||[1,-1];
 for(const sd of sides)for(let k=0;k<nw;k++){if(rng()<.2)continue;const p=at((k-(nw-1)/2)*L*.42+rr(-.6,.6),sd*1.24),lit=rng()<(o.lit==null?.42:o.lit);
  kput(lit?'dot':'cellD',[p[0],y+1.45,p[1]],vsQ(yaw),lit?[.8,1.2,.3]:[1.1,1,.25],lit?WARM:null);}
 if(o.door!==false&&sides.length){const sd=sides[0],p=at(-L*.3,sd*1.25);kput('pkDoor',[p[0],y+1.05,p[1]],vsQ(yaw),[.95,2.05,1],new THREE.Color().setHSL(rr(0,1),.35,.35));
  if(rng()<.7){const a=at(-L*.3+rr(-.5,.5),sd*1.9);kput('pkAwn',[a[0],y+2.45,a[1]],vsQ(yaw,-sd*.25),[rr(2.4,4),1,1.6],vsPaint());}}
 return y+2.6;}
// A switchback stair against a wall running along z: from (x,y0,z0) up to y1,
// first flight toward dir (+-1 along z), later flights stepped out by xo.
function vsZig(x,y0,y1,z0,dir,xo,w){w=w||1.1;const n=Math.max(1,Math.ceil((y1-y0)/2.7)),rise=(y1-y0)/n,go=rise*1.2;let z=z0;
 for(let i=0;i<n;i++){const xi=x+(i%2)*xo*(w+.1);kput('pkStair',[xi,y0+i*rise,z],vsQ(dir>0?0:Math.PI),[w,rise/2,go/2.4],null);
  z+=dir*go;kput('plank',[x+xo*(w+.1)/2,y0+(i+1)*rise-.07,z+dir*.7],null,[2*w+.3,.14,1.4],null);dir=-dir;}}
// Where is the shore? Casts along the hull frame's x from a few stations and
// returns the nearest point where the ground stands above the sea.
function vsShore(C,S){const v=new THREE.Vector3();let best=null;
 for(const sd of [1,-1])for(const f of [-.28,-.12,.04,.2]){const z=f*S.L;
  for(let dist=S.hb+2;dist<S.hb+80;dist+=2){v.set(sd*dist,0,z).applyMatrix4(C.water.m);const h=terrainH(v.x+KOFF[0],v.z+KOFF[2]);
   if(h>2.5){if(!best||dist<best.dist)best={sd,z,dist,y:h};break;}}}
 return best;}
// The reclaimed hull: painted plates and patches, tyre fenders, a pontoon
// with stairs down the sea side and skiffs moored to it, and the way ashore
// (a gangway if the quay is close, else stairs, a floating walk and a flight
// up the quay wall). Returns the shore record (or null).
function vsReclaimHull(C,S,o){o=o||{};const hb=S.hb,L2=S.L2,PATCH=['patchPlate','patchSheet','patchBoard','patchTarp'];
 for(let i=0;i<S.L*.42;i++){const s=rr(-.62,.5),sd=rng()<.5?1:-1,z=s*L2;C.at(z);const y=rr(S.T*.32,S.F-.8),p=S.side(s,S.wAt(s,y),sd);
  kput(PATCH[(rng()*4)|0],[p[0]+sd*.18,p[1],p[2]],vsQ(sd*Math.PI/2,0,rr(-.15,.15)),[rr(2,7),rr(1.5,4.5),1],rng()<.45?vsPaint():null);}
 for(let z=-L2*.55;z<L2*.45;z+=rr(5,9))for(const sd of [1,-1]){C.at(z);kput('pkTyre',[sd*(S.bdz(z)+.35),rr(.6,2.4),z],vsQ(sd*Math.PI/2),1.2,null);}
 const sh=vsShore(C,S),ps=sh?-sh.sd:1;
 // the pontoon on the sea side, stairs down to it, skiffs along it
 C.wat();const pz0=-L2*.34,pz1=L2*.2,px=ps*(hb+2.2);
 for(let z=pz0;z<pz1;z+=8.4)kput('plank',[px,.32,z+4],null,[3.4,.36,8],null);
 for(let z=pz0+4;z<pz1;z+=16){kput('postR',[px+ps*1.5,1.5,z],null,[.08,2.4,.08],VS_RAIL);kput('dot',[px+ps*1.5,2.8,z],null,[.35,.35,.35],WARM);vsGlow(px+ps*1.5,2.6,z,2);}
 for(const zs of [pz0+6,pz1-18]){C.at(zs);vsZig(ps*(hb+.95),.5,S.ydz(zs)+.05,zs,1,ps,1.1);}
 C.wat();for(let i=0;i<(o.boats||10);i++){const z=rr(pz0,pz1);portSkiff(ps*(hb+6.2+rr(0,2.5)+(i%3)*4.5),z,rr(-.12,.12)+(rng()<.5?0:Math.PI));}
 if(sh){const z=sh.z,sd=sh.sd,gap=sh.dist-hb;C.at(z);const yd=S.ydz(z);
  if(gap<=28){ // a gangway straight across to the quay
   vsWalk([sd*(hb-.5),yd+.15,z],[sd*(sh.dist+2),sh.y+.15,z],2.2,{});
   C.wat();kput('postR',[sd*(hb+gap*.5),(yd+sh.y)/4,z],null,[.2,(yd+sh.y)/2,.2],VS_RAIL);
   C.at(z);kput('plank',[sd*(hb-2),yd+.08,z],null,[3,.16,3.4],null);}
  else{ // stairs down the hull, a floating walk, a flight up the quay wall
   vsZig(sd*(hb+.95),.5,yd+.05,z-9,1,sd,1.1);C.wat();
   vsWalk([sd*(hb+1.5),.4,z-9],[sd*(sh.dist-1.5),.4,z-9],2,{});
   for(let x=hb+4;x<sh.dist-2;x+=5)kput('waterButt',[sd*x,.05,z-9],qEuler(Math.PI/2,0,0),[.6,1.8,.6],null);
   kput('pkStair',[sd*(sh.dist-1.3),.45,z-9],vsQ(0),[1.6,(sh.y-.45)/2,7.5/2.4],null);
   kput('plank',[sd*(sh.dist-1.3),.34,z-10],null,[2.8,.3,2.6],null);}
  C.at(z);portFigures(sd*(hb-3),yd,z,3,2);}
 return sh;}

// ================================================================ vsFeeder: a 140 m feeder with its own deck cranes
// Reclaimed: the MARKET SHIP. The hatch covers are the market floor: stalls
// in two aisles under a patchwork of awnings strung from the two cranes, kept
// as structure with shacks on their cabs; container homes line both rails as
// shopfronts; shacks climb the aft house; a garden on the forecastle; a
// floating market of skiffs along the pontoon; a gangway ashore.
const VS_FEEDER={key:'vsFeeder',name:'Container feeder',L:140,B:22,T:7.5,F:5,sb:.5,sa:.62,fc:2.5,nu:72,rows:8,hc:1.4,
 boot:MAT.vsBootR,mat:MAT.vsHull,zones:[[-42,-14],[-9.2,17.8],[22,49.2]],cranes:[-11.6,19.9],
 tiers:z=>z>35?3:4,
 house:{z:-50.5,dp:13,w:18.5,n:5,sh:2.8,step:1.4,bw:22,bdp:6.5,se:5},
 funnel:{z:-60,w:5.5,dp:4.2,h:19},
 ruin:{parts:[{roll:.19,pitch:.012,sink:-2.2}],holes:6}};

// The common ship: hull, deck gear, house, funnel, hatches; stacks at d<3.
function vsShip(scene,gx,gz,d,opt,S0){
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const S=vsLines(Object.assign({},S0));
 const C=vsCtx(G,opt.heading||0,d===1?S.ruin.parts:[{}]);S.C=C;
 S.holes=[];if(d===1)for(let i=0;i<S.ruin.holes;i++)S.holes.push({z:rr(-.7,.7)*S.L2,y:rr(S.F*.4,S.F*.85),rz:rr(2.5,8),ry:rr(1.2,Math.max(1.6,S.F*.3)),sd:i%2?1:-1});
 if(S.crack!=null&&d===1)S.holes.push({z:S.crack,y:S.F*.5,rz:6,ry:S.F*.9,sd:1},{z:S.crack,y:S.F*.4,rz:5,ry:S.F*.8,sd:-1});
 vsHull(C,S,d);
 if(d===1&&S.crack!=null)for(const p of C.parts){const zc=S.crack+(p.z0>-1e8?.6:-.6);C.use(p);const sc=zc/S.L2;   // torn plating round the break
  for(let i=0;i<22;i++){const sd=rng()<.5?1:-1,pt=S.side(sc,rr(.1,1),sd);kput("plateR",[pt[0]*rr(.7,1.02),pt[1],zc+rr(-1.5,1.5)],qEuler(rr(-1,1),rr(-1,1),rr(-1,1)),[rr(1.5,5),rr(1.5,5),.14],null);}}
 if(!(d===3&&S.noHatch))vsHatches(C,S,d);
 S.hs=vsHouse(C,S,S.house,d);
 if(S.funnel)vsFunnel(C,S,S.funnel,d);
 if(S.extra)S.extra(C,S,d);
 if(d===0){vsStacks(C,S);for(let i=0;i<8;i++){const z=rr(-.8,.8)*S.L2;C.at(z);portFigures(rr(-.3,.3)*S.B,S.ydz(z),z,1,1);}}
 if(d===1){vsStacksRuin(C,S);vsRuinDress(C,S,{trees:S.ruinTrees||6});}
 if(d===3&&S.town)S.town(C,S);
 // registered volumes: the hull in beam-sized pieces, the house
 const nh=Math.max(2,Math.round(S.L/(S.B*1.6)));
 for(let i=0;i<nh;i++){const z=((i+.5)/nh-.5)*S.L*.96;C.reg(S.name+' — hull',0,z,Math.max(S.hb,S.L/nh*.55),S.T+S.F+2,-S.T);}
 C.reg(S.name+(d===3?' — house town':' — superstructure'),0,S.house.z,Math.max(S.house.w,S.house.bw)/2,S.hs.top-S.F+2,S.F);
 if(d<3)C.reg(S.name+' — container stacks',0,(S.bays[0]+S.bays[S.bays.length-1])/2,(S.bays[S.bays.length-1]-S.bays[0])/2+7,S.tiers(0)*VS.TP+S.hc+2,S.F);
 KXF=null;KOFF=[0,0,0];return G;}

function vsFeederExtra(C,S,d){
 const yaws=d===3?[.55,-.6]:[0,0],els=d===3?[.95,.9]:d===1?[-.28,.12]:[.18,.18];
 S.tips=S.cranes.map((z,i)=>vsCrane(C,S,0,z,d,{H:12,len:25,yaw:d===1&&i===0?.5:yaws[i],el:els[i],lean:d===1&&i===0?.12:0,hook:d!==1||i===1}));}
function vsFeederTown(C,S){const hb=S.hb,yb=S.yb,H=S.house,hs=S.hs;
 // --- the market: homes along both rails, stalls in two aisles, awnings over
 for(const z of S.bays){C.at(z);const nr=S.rowsAt(z),xw=(nr-1)/2*VS.RP;
  for(const sd of [1,-1]){const lv=1+(rng()<.55?1:0);let y=yb;
   for(let t=0;t<lv;t++)y=vsHome(sd*xw,y,z,Math.PI/2,true,{sides:[-sd,sd],lit:.5});
   kput('plank',[sd*(xw+1.9),yb+VS.TP-.1,z],null,[1.4,.14,11],null);                         // a balcony over the water
   if(lv>1){kput('plank',[sd*(xw-1.9),yb+VS.TP-.05,z],null,[1.3,.14,12.2],null);kput('pkStair',[sd*(xw-1.9),yb,z-6.1-2.9],vsQ(0),[1.1,1.3,1.2],null);
    for(let k=0;k<2;k++)kput('pkCloth',[sd*(xw-1.3),yb+VS.TP+1.9,z+rr(-5,5)],vsQ(Math.PI/2),[rr(1,2),rr(.8,1.6),1],vsPaint());}
   if(lv>1&&rng()<.6)vsShack(sd*xw,y,z+rr(-3,3),rr(2.4,3),rr(3,4.5),2.4,Math.PI/2*(rng()<.5?1:0),{});
   else portGarden(sd*xw,y,z,2,10,3);}
  for(const sd of [1,-1])for(let k=-1;k<=1;k++)portStall(sd*(xw-3.6),yb,z+k*3.8,sd>0?-Math.PI/2:Math.PI/2);
  for(let k=-1;k<=1;k+=2)portStall(0,yb,z+k*3.2,rng()<.5?0:Math.PI);
  // awnings: a sawtooth of cloth on poles
  const aw=(xw-1.4)*2/3;
  for(let j=0;j<3;j++){const x=(j-1)*aw;kput('pkAwn',[x,yb+4.7,z],vsQ(0,0,(j%2?.16:-.16)),[aw*1.02,1,12.6],vsPaint());
   for(const e of [-1,1])for(const f of [-6,6])kput('postR',[x+e*aw/2,yb+2.3,z+f],null,[.1,4.6,.1],VS_RAIL);}
  vsLights([-xw,yb+4.1,z-6.2],[xw,yb+4.1,z-6.2],10,.5);vsLights([-xw,yb+4.1,z+6.2],[xw,yb+4.1,z+6.2],10,.5);
  portFigures(0,yb,z,14,5);vsGlow(0,yb+2.6,z,3.2);}
 C.reg('Market ship — market deck',0,(S.bays[0]+S.bays[S.bays.length-1])/2,(S.bays[S.bays.length-1]-S.bays[0])/2+7,12,S.F);
 // ropes from the raised jibs down to the awnings, a shack on each cab, a basket house hung off one jib
 S.cranes.forEach((z,i)=>{const tp=S.tips[i];C.at(z);
  for(const b of S.bays.filter(bz=>Math.abs(bz-z)<16))for(const x of [-6,0,6])vsPlank(tp,[x,yb+5,b],.04,.04,VS_RAIL,'strutR');
  vsShack(0,S.F+12+3.3,z,3.6,4.2,2.3,rng()*TAU,{lit:.7});
  kput('postR',[0,S.F+12+8,z],null,[.06,4,.06],VS_RAIL);kput('pkCloth',[.7,S.F+12+10,z],vsQ(Math.PI/2),[1.4,.9,1],vsPaint());
  if(i===1){const hy=tp[1]-8;vsShack(tp[0],hy,tp[2],3,3,2.4,.3,{lit:.8});vsPlank(tp,[tp[0],hy+2.6,tp[2]],.05,.05,VS_RAIL,'strutR');}});
 // --- the aft house: shacks climbing its flanks on brackets, a roof village, a garden
 vsHouseTown(C,S,hs,H,{dens:.55});
 for(const T of hs.tiers.slice(0,-1)){portGarden(0,T.y+T.h,T.cz+T.dp/2-1,T.w*.7,1.6,3);for(let i=0;i<4;i++)kput('vine',[rr(-.4,.4)*T.w,T.y+T.h,T.cz+T.dp/2+.2],null,[1,rr(1.5,4),1],null);}
 {let y=hs.top-.2;const bz=hs.bz;
  for(let i=0;i<6;i++){const x=rr(-H.bw*.4,H.bw*.4),z=bz+rr(-2.5,1.5);const y2=vsShack(x,y,z,rr(2.4,3.4),rr(2.4,3.6),2.4,rr(-.2,.2),{});
   if(rng()<.5)vsShack(x+rr(-.4,.4),y2,z,2.4,2.6,2.2,rr(-.3,.3),{});}
  vsGlow(0,y+1.5,bz,4);VEG.tree(-H.bw*.44,y,bz,0,6);VEG.tree(H.bw*.42,y,bz+1,2,5);
  portWashLine(-H.bw/2,bz+2,H.bw/2,bz+2,y+2,12);
  kput('pkDish',[2,y+2.5,bz-2],vsQ(2),1.4,null);kput('waterButt',[-3,y+1.2,bz-2.5],null,[1.3,2.4,1.3],null);}
 const fz=S.funnel.z;C.at(fz);portWashLine(-4,fz+2,-H.w*.3,H.z-H.dp/2,S.F+10,8);portWashLine(3,fz+2,H.w*.3,H.z-H.dp/2,S.F+13,7);
 portFigures(0,hs.top,hs.bz,5,6);
 // the poop deck: a cafe under awnings
 C.at(-66);for(let i=0;i<3;i++){kput('pkAwn',[(i-1)*5,S.F+3,-66],vsQ(0,.12),[4.6,1,5],vsPaint());kput('plank',[(i-1)*5,S.F+.8,-66],null,[1.6,.1,1.6],null);}
 portFigures(0,S.F,-66,6,6);
 // --- the forecastle garden and lookout
 const zf=55;C.at(zf);const yf=S.ydz(zf);portGarden(0,yf,zf,9,6,3);VEG.tree(-2.5,S.ydz(57),57,0,7);VEG.tree(2.5,yf,53.5,2,6);
 vsShack(0,S.ydz(60.5),60.5,2.6,2.6,2.4,.1,{});kput('postR',[0,S.ydz(60.5)+5,60.5],null,[.08,6,.08],VS_RAIL);kput('pkCloth',[.8,S.ydz(60.5)+7.6,60.5],vsQ(Math.PI/2),[1.6,1,1],new THREE.Color(0xc83a2a));
 // --- the hull: pontoon, floating market, gangway ashore
 vsReclaimHull(C,S,{boats:16});
 C.wat();for(let i=0;i<12;i++){const z=rr(-40,20),x=(rng()<.5?1:-1)*(hb+8+rr(0,8));portSkiff(x,z,rr(-.3,.3));
  for(let k=0;k<3;k++)kput('plank',[x+rr(-.3,.3),.45,z+rr(-1.5,1.5)],vsQ(rr(0,TAU)),[rr(.3,.6),rr(.2,.4),rr(.3,.6)],new THREE.Color().setHSL(rr(0,.2),rr(.4,.8),rr(.35,.6)));}
}
Object.assign(VS_FEEDER,{extra:vsFeederExtra,town:vsFeederTown});
function buildVsFeeder(scene,gx,gz,d,opt){reseed(20500+d);return vsShip(scene,gx,gz,d,opt,VS_FEEDER);}
PORT_VESSEL({key:'vsFeeder',name:'Container feeder',cls:'vessel',W:220,LAND:0,SEA:0,decays:[0,1,3],length:140,beam:22,draft:7.5,norepair:true,
 stamps:()=>[],build:buildVsFeeder});
