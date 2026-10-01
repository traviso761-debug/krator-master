// ================================================================ LAND BLOCKS: container housing (shared) + chStack
// Three LAND blocks (place:'land', 110 x 110, LAND 110, SEA 0, local z in
// [-110,0]) of housing built from shipping containers and tanks, each block
// several DISCRETE buildings with alleys between them:
//   chStack  (this file)  tall stacked towers: containers cantilevered and
//                         turned level by level, steel balconies, stairs,
//                         ladders, canopies, one tower on stilts, a radome mast
//   chCourt  (89b)        low compounds round courtyards: awnings, fire pits,
//                         washing lines, solar frames, water tanks, dishes
//   chTank   (89c)        silo and tank houses round a green: wrap decks,
//                         conical roofs, a water tower, tank-and-box houses
// This file also holds the helpers the other two use (every name `ch`).
// Seeds: chStack 20800+d, chCourt 20810+d, chTank 20820+d. The STRUCTURE of
// every building (levels, turns, cantilevers) comes from chPRNG(seed), a
// private stream keyed by building, so the same tower stands in every decay
// and only its fate differs; dressing draws on the builder's rng().
// Decays: 0 lived-in and well kept (bright paint, tidy, gardens, lit windows);
// 1 abandoned (stacks toppled, some burnt, overgrown, dark); 3 reclaimed and
// grown denser (extra storeys, bridges between buildings, rooftop gardens,
// stalls in the alleys, more people and light).
// Sides: all four finished (see chPerimeter): a 4 m paved footway round the
// block, a hedge / fence line with gates at the alley mouths, and on a side
// that meets natural land a kerb (and riprap if the ground falls away); a
// side on open sea gets a quay wall. nb.N is the -z (inland) side, nb.S the
// z=0 side; missing sides are treated as natural land.
const CH={D:PORT.DECK,H:2.59,B:2.44,L20:6.06,L40:12.19,P:2.95,W:110,LAND:110,FOOT:4,CLR:8};

// ---------------------------------------------------------------- materials and kit
MAT.chWin=new THREE.MeshStandardMaterial({color:0x26394a,roughness:.16,metalness:.6,emissive:0x060a10});
MAT.chLit=new THREE.MeshBasicMaterial({color:0xffc27a});           // shown only at night (PORT_NIGHT below)
MAT.chSteel=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.55,metalness:.45});   // instance colour = paint
MAT.chRoof=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.6,metalness:.35,side:DS});
MAT.chGrate=new THREE.MeshStandardMaterial({color:0x5c6064,roughness:.6,metalness:.5});
MAT.chGrateR=new THREE.MeshStandardMaterial({color:0x6a4232,roughness:.85,metalness:.3});
MAT.chSilo=new THREE.MeshStandardMaterial({map:TEX.corrugate,color:0xf2f5f7,roughness:.45,metalness:.55,side:DS});
MAT.chSiloR=new THREE.MeshStandardMaterial({map:TEX.corrugate,color:0xb07a5a,roughness:.85,metalness:.25,side:DS});
MAT.chSiloB=new THREE.MeshStandardMaterial({map:TEX.corrugate,color:0x3a322c,roughness:.95,metalness:.1,side:DS});
MAT.chTankM=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.5,metalness:.4,side:DS});
kdef('chWin',new THREE.BoxGeometry(1,1,.1),MAT.chWin);
kdef('chLit',new THREE.BoxGeometry(1,1,.1),MAT.chLit);
kdef('chBulb',new THREE.BoxGeometry(.2,.2,.2),MAT.chLit);
kdef('chPort',new THREE.CylinderGeometry(1,1,.12,16).rotateX(Math.PI/2),MAT.chWin);    // round window, faces local z
kdef('chBar',new THREE.BoxGeometry(1,1,1),MAT.chSteel);                                // beams, posts, sills (centred)
kdef('chPole',new THREE.CylinderGeometry(1,1,1,6).translate(0,.5,0),MAT.chSteel);       // bottom pivot
kdef('chCone',new THREE.ConeGeometry(1,1,24,1,true).translate(0,.5,0),MAT.chRoof);      // bottom pivot, open
kdef('chTank',new THREE.CylinderGeometry(1,1,1,16).translate(0,.5,0),MAT.chTankM);      // bottom pivot, closed
kdef('chDome',new THREE.SphereGeometry(1,14,10),MAT.pkPaint);
kdef('chSheet',new THREE.BoxGeometry(1,.08,1),MAT.corrugate);                          // roof sheet (centred)
PORT_NIGHT.push(on=>{for(const n of ['chLit','chBulb'])if(KIT.meshes[n])KIT.meshes[n].visible=on;});

// ---------------------------------------------------------------- small helpers
// A private xorshift stream: a building's STRUCTURE, identical in every decay.
function chPRNG(seed){let s=((seed+1)*2654435761)>>>0||1;return ()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
const CH_PAL=[0xc0392b,0xe2b12f,0x2e7d4f,0x2c5d8f,0xe9e4d8,0xd9722b,0x3b8d8d,0x8e3b5c,0x6d8f3a,0xb9b1a2].map(c=>new THREE.Color(c));
const CH_CHAR=new THREE.Color(0x2a2420),CH_GREY=new THREE.Color(0x8c8378);
function chCol(d,burnt){const c=CH_PAL[(rng()*CH_PAL.length)|0].clone();
 if(burnt)return c.lerp(CH_CHAR,rr(.75,.92));
 if(d===0)return c.lerp(CH_GREY,rr(.04,.22));
 if(d===1)return c.lerp(PK_RUST,rr(.45,.75));
 return rng()<.35?c.lerp(CH_GREY,rr(.05,.2)):c.lerp(PK_RUST,rr(.25,.5));}
function chDoorCol(dd){return new THREE.Color().setHSL(rr(0,1),dd===1?.15:rr(.35,.6),dd===1?.25:rr(.3,.45));}
function chFrameCol(dd){return dd===0?new THREE.Color(0x3c4248):new THREE.Color().setHSL(.06,rr(.35,.5),rr(.22,.32));}
// A beam of kit item `name` from A to B ([x,y,z]), t thick.
function chBeam(name,A,B,t,col){const dx=B[0]-A[0],dy=B[1]-A[1],dz=B[2]-A[2],L=Math.hypot(dx,dy,dz);if(L<.05)return;
 kput(name,[(A[0]+B[0])/2,(A[1]+B[1])/2,(A[2]+B[2])/2],qFacing([dx,dy,dz]),[t,t,L],col||null);}
// A window on a face: glass by day, a warm pane by night if lit. (nx,nz) = face normal.
function chWinAt(px,py,pz,q,w,h,d,lit,burnt,nx,nz){
 if(d===1||burnt){if(rng()<.25)return;kput('cellD',[px,py,pz],q,[w,h,.24],burnt?CH_CHAR:null);return;}
 kput('chWin',[px,py,pz],q,[w,h,1],null);
 kput('chBar',[px+nx*.06,py-h/2-.05,pz+nz*.06],q,[w+.24,.09,.26],null);
 if(lit)kput('chLit',[px+nx*.035,py,pz+nz*.035],q,[w*.9,h*.88,1],null);}
// A small warm lamp on a pole (d=1: dark, leaning).
function chLamp(x,y,z,d,h){h=h||3.6;
 if(d===1){kput('chPole',[x,y,z],qEuler(rr(-.25,.25),0,rr(-.25,.25)),[.07,h,.07],new THREE.Color(0x5a3a2a));return;}
 kput('chPole',[x,y,z],null,[.07,h,.07],new THREE.Color(0x2e3236));kput('chBar',[x,y+h,z],null,[.4,.12,.4],new THREE.Color(0x2e3236));
 kput('dot',[x,y+h-.1,z],null,[.2,.14,.5],WARM);kput('emberB',[x,y+h-.4,z],qEuler(0,rng()*TAU,0),[2.2,1.8,2.2],new THREE.Color().setHSL(.08,1,.3));}
// A string of bulbs between two points (lit only at night), on a thin wire.
function chBulbs(A,B,n,sag){const L=Math.hypot(B[0]-A[0],B[2]-A[2]);if(L<1)return;
 kput('pkLine',[(A[0]+B[0])/2,(A[1]+B[1])/2-sag*.6,(A[2]+B[2])/2],qEuler(0,Math.atan2(-(B[2]-A[2]),B[0]-A[0]),0),[L,1,1],null);
 for(let i=1;i<n;i++){const t=i/n;kput('chBulb',[lerp(A[0],B[0],t),lerp(A[1],B[1],t)-sag*Math.sin(Math.PI*t),lerp(A[2],B[2],t)],null,1,null);}}
// A plank bridge from A to B with rope rails, sagging `sag` (d=3 links).
function chBridge(A,B,w,sag){const n=6,dx=B[0]-A[0],dz=B[2]-A[2],hd=Math.hypot(dx,dz)||1,px=dz/hd*w/2,pz=-dx/hd*w/2;
 const P=t=>[lerp(A[0],B[0],t),lerp(A[1],B[1],t)-sag*Math.sin(Math.PI*t),lerp(A[2],B[2],t)];
 for(let i=0;i<n;i++){const a=P(i/n),b=P((i+1)/n);
  kput('plank',[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],qFacing([b[0]-a[0],b[1]-a[1],b[2]-a[2]]),[w,.12,Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])+.05],null);
  for(const s of [1,-1])chBeam('chBar',[a[0]+s*px,a[1]+1,a[2]+s*pz],[b[0]+s*px,b[1]+1,b[2]+s*pz],.04,new THREE.Color(0x8a7050));}
 for(const s of [1,-1])for(const E of [A,B])kput('chPole',[E[0]+s*px,E[1],E[2]+s*pz],null,[.06,1.1,.06],new THREE.Color(0x6a5040));}
// Guard rail along a straight edge, tiled in ~5 m pieces (the kit rail is 5 m).
function chRail(ax,az,bx,bz,y,d,skip){const L=Math.hypot(bx-ax,bz-az);if(L<.8)return;const n=Math.max(1,Math.round(L/5)),yaw=Math.atan2(-(bz-az),bx-ax);
 const c=d>0?new THREE.Color(0x8a5a3a):new THREE.Color(0x9aa0a6);
 for(let i=0;i<n;i++){if(skip&&rng()<skip)continue;const t=(i+.5)/n;
  kput('pkGuard',[lerp(ax,bx,t),y,lerp(az,bz,t)],d===1?qEuler(rr(-.12,.12),yaw,rr(-.1,.1)):qEuler(0,yaw,0),[L/n/5,1,1],c);}}

// ---------------------------------------------------------------- the container dwelling
// chUnit(x,y,z,yaw,big,d,o): one container fitted out as rooms, bottom centre
// at (x,y,z), long axis along yaw (0 = along x). Windows on both long sides
// (o.solid = 1/-1 blanks one), a door on side o.doorSide (1 = local +z, -1,
// 0 none), a glazed end o.endGlass (1 = +x end, -1), a round port o.port.
// o.lit = chance a window is lit at night, o.burnt, o.rust (rusted skin),
// o.col, o.q (an arbitrary pose: only the box is drawn), o.blind (box only).
function chUnit(x,y,z,yaw,big,d,o){o=o||{};const L=big?CH.L40:CH.L20,c=Math.cos(yaw),s=Math.sin(yaw);
 const P=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c],q=qEuler(0,yaw,0),qe=qEuler(0,yaw+Math.PI/2,0);
 const rust=o.rust!==undefined?o.rust:(d===1||o.burnt||rng()<(d===0?.22:.65));
 kput((big?'pkCont40':'pkCont20')+(rust?'R':''),[x,y,z],o.q||q,1,o.col||chCol(d,o.burnt));
 if(o.blind||o.q)return L;
 const nw=big?3:1,ds=o.doorSide||0,lit=o.lit==null?.5:o.lit,dead=d===1||o.burnt;
 for(const sd of [1,-1]){if(o.solid===sd||o.solid===2)continue;const nx=s*sd,nz=c*sd;
  for(let k=0;k<nw;k++){let u=(k-(nw-1)/2)*L/(nw+.3);
   if(sd===ds&&k===0){const dp=P(big?u:-L*.24,sd*1.27);
    kput('pkDoor',[dp[0],y+1.1,dp[1]],q,[.95,2.1,1],dead?new THREE.Color(0x3a2a22):chDoorCol(d));
    if(!dead&&rng()<.5){const lp=P((big?u:-L*.24)+.9,sd*1.32);kput('dot',[lp[0],y+2.35,lp[1]],q,[.18,.14,.12],WARM);}
    if(big)continue;u=L*.2;}
   const p=P(u,sd*1.25);
   if(o.port&&k===nw-1&&!dead){kput('chPort',[p[0],y+1.4,p[1]],q,[.62,.62,1],null);if(rng()<lit)kput('chLit',[p[0]+nx*.04,y+1.4,p[1]+nz*.04],q,[.8,.8,1],null);continue;}
   chWinAt(p[0],y+1.5,p[1],q,big?rr(1.4,2.5):rr(1.1,1.7),rr(.9,1.25),d,!dead&&rng()<lit,o.burnt,nx,nz);}}
 if(o.endGlass){const e=o.endGlass,p=P(e*(L/2+.03),0);chWinAt(p[0],y+1.3,p[1],qe,2.0,2.1,d,!dead&&rng()<lit,o.burnt,c*e,-s*e);}
 if(o.burnt)for(let i=0;i<2;i++){const sd=i?1:-1,p=P(rr(-L/3,L/3),sd*1.24);kput('stain',[p[0],y+1.6,p[1]],q,[rr(2,4),rr(1.6,2.4),1],null);}
 return L;}

// ---------------------------------------------------------------- the stacked tower
// chPlan(seed,n,o) -> {lv:[{l,y,us:[{lx,lz,big,yaw}],bb:[x0,z0,x1,z1],m:[W,E,S,N]}],base}
// Level by level: one or two containers, turned 90 deg from the level below
// about half the time, slid along their length (the cantilever) and across.
// m = balcony margins of the steel platform under the level on each side.
// o.stilts lifts level 0 onto columns; o.ax0 the first level's axis.
function chPlan(seed,n,o){o=o||{};const R=chPRNG(seed),lv=[];let ax=o.ax0||0;const base=o.stilts?4.4:.3;
 for(let l=0;l<n;l++){
  if(l>0&&R()<.55)ax=1-ax;
  const two=l<n-1&&R()<(l===0?.85:.5),big=R()<(l<2?.8:.5),Lh=(big?CH.L40:CH.L20)/2;
  const sh=l===0?0:(R()*2-1)*Math.min(3.4,Lh-1.4),sa=l===0?0:(R()*2-1)*1.3;const us=[];
  const add=(al,ac,bg)=>us.push(ax?{lx:ac,lz:al,big:bg,yaw:Math.PI/2}:{lx:al,lz:ac,big:bg,yaw:0});
  if(l<(o.wide||0)){add(sh,sa-2.5,big);add(sh+(R()*2-1)*1.5,sa,big);add(sh+(R()<.5?0:(R()*2-1)*(Lh-3.1)),sa+2.5,big&&R()<.7);}
  else if(two){const b2=big&&R()<.6;add(sh,sa-1.25,big);add(sh+(b2?0:(R()*2-1)*(Lh-3.1)),sa+1.25,b2);}else add(sh,sa,big);
  let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;
  for(const u of us){const hl=(u.big?CH.L40:CH.L20)/2,hx=u.yaw?1.22:hl,hz=u.yaw?hl:1.22;
   x0=Math.min(x0,u.lx-hx);x1=Math.max(x1,u.lx+hx);z0=Math.min(z0,u.lz-hz);z1=Math.max(z1,u.lz+hz);}
  const m=[0,1,2,3].map(()=>(l===0&&!o.stilts)?0:(R()<.55?1.3+R()*.9:0));
  if(l>0&&!m.some(v=>v>0))m[(R()*4)|0]=1.5;
  // keep the level (balconies included) inside the lot: o.lim = [x-,x+,z-,z+]
  const lim=o.lim||[13,13,13,13];
  const fit=(lo,hi,a,b,la,lb)=>{if(hi+m[b]-lo+m[a]>la+lb){m[a]=m[b]=0;}if(lo-m[a]<-la)return -la-(lo-m[a]);if(hi+m[b]>lb)return lb-(hi+m[b]);return 0;};
  const sx=fit(x0,x1,0,1,lim[0],lim[1]),sz=fit(z0,z1,3,2,lim[2],lim[3]);
  if(sx||sz){for(const u of us){u.lx+=sx;u.lz+=sz;}x0+=sx;x1+=sx;z0+=sz;z1+=sz;}
  lv.push({l,ax,us,bb:[x0,z0,x1,z1],m,y:base+l*CH.P,r:R()});}
 let ext=0;for(const L of lv){const b=L.bb,m=L.m;ext=Math.max(ext,-(b[0]-m[0]),b[2]+m[1],-(b[1]-m[3]),b[3]+m[2]);}
 return {lv,base,n,stilts:!!o.stilts,ext};}
// chTower(G,x,z,plan,d,o) -> {plat:[{y,box:[x0,z0,x1,z1]}], top, bb, standing}
// o: burnt, topple (levels from this index fall), fall [fx,fz], lit, roof
// ('canopy'|'solar'|'garden'|'tank'), front [fx,fz] (the side doors face),
// mast [dx,dz] (a lattice radome mast beside it), people.
function chTower(G,x,z,P,d,o){o=o||{};const D=CH.D,lv=P.lv,n=lv.length,fc=chFrameCol(d);
 const nS=o.topple!=null?Math.max(1,Math.min(o.topple,n)):n,plat=[],fr=o.front||[0,1];
 const pm=d===0?MAT.chGrate:MAT.chGrateR;
 for(let i=0;i<nS;i++){const L=lv[i],y=D+L.y,[x0,z0,x1,z1]=L.bb,m=L.m;
  const px0=x0-m[0],px1=x1+m[1],pz0=z0-m[3],pz1=z1+m[2];
  // doors face the tower's front at ground, a balcony above
  // local +z of a unit is world +z (yaw 0) or world +x (yaw PI/2)
  const pickDoor=u=>{if(i===0&&!P.stilts)return (u.yaw?fr[0]:fr[1])>=0?1:-1;
   return u.yaw?(m[1]>0?1:m[0]>0?-1:0):(m[2]>0?1:m[3]>0?-1:0);};
  L.us.forEach((u,k)=>chUnit(x+u.lx,y,z+u.lz,u.yaw,u.big,d,{burnt:o.burnt,lit:o.lit,doorSide:pickDoor(u),
   endGlass:L.r<.4&&k===0?(L.r<.2?1:-1):0,port:L.r>.8&&!u.big,solid:L.us.length>1?(k===0?1:k===L.us.length-1?-1:2):0}));
  const hasP=m.some(v=>v>0)||(i===0&&P.stilts);
  if(hasP){
   if(!(d===1&&rng()<.3))pbBox(G,pm,x+(px0+px1)/2,y-.1,z+(pz0+pz1)/2,px1-px0,.2,pz1-pz0,0,4);
   else kput('chBar',[x+(px0+px1)/2+rr(-2,2),D+.4,z+(pz0+pz1)/2+rr(-2,2)],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[px1-px0,.2,(pz1-pz0)*.7],new THREE.Color(0x6a4232));
   const sk=d===1?.4:0;
   if(m[0]>0)chRail(x+px0,z+pz0,x+px0,z+pz1,y,d,sk);if(m[1]>0)chRail(x+px1,z+pz0,x+px1,z+pz1,y,d,sk);
   if(m[2]>0)chRail(x+px0,z+pz1,x+px1,z+pz1,y,d,sk);if(m[3]>0)chRail(x+px0,z+pz0,x+px1,z+pz0,y,d,sk);
   if(i>0){const Pb=lv[i-1].bb;   // braces from the overhanging corners back to the level below
    for(const cx of [px0,px1])for(const cz of [pz0,pz1]){if(cx>=Pb[0]&&cx<=Pb[2]&&cz>=Pb[1]&&cz<=Pb[3])continue;
     const tx=clamp(cx,Pb[0],Pb[2]),tz=clamp(cz,Pb[1],Pb[3]);chBeam('chBar',[x+cx,y-.2,z+cz],[x+tx,y-2.5,z+tz],.16,fc);}}
   if(i===0&&P.stilts){const cs=[[px0+.3,pz0+.3],[px1-.3,pz0+.3],[px0+.3,pz1-.3],[px1-.3,pz1-.3],[(px0+px1)/2,pz0+.3],[(px0+px1)/2,pz1-.3]];
    for(const c of cs)kput('chPole',[x+c[0],D,z+c[1]],d===1&&rng()<.3?qEuler(rr(-.06,.06),0,rr(-.06,.06)):null,[.2,y-D-.2,.2],fc);
    for(const e of [[0,4,1,5],[4,2,5,3]]){const a=cs[e[0]],b=cs[e[1]];chBeam('chBar',[x+a[0],D+.3,z+a[1]],[x+b[0],y-.4,z+b[1]],.1,fc);}
    // two flights up from the ground on the south face
    kput('pkStair',[x+px0-.75,D,z+pz0+.2],null,[1.1,(y-D)/4,1],null);kput('pkStair',[x+px0-.75,D+(y-D)/2,z+pz0+2.6],null,[1.1,(y-D)/4,1],null);}}
  plat.push({y,box:[x+px0,z+pz0,x+px1,z+pz1]});
  // stair or ladder up from the level below
  if(i>0){const Lb=lv[i-1],mb=Lb.m,bb=Lb.bb,yb=D+Lb.y;const sd=[0,1,2,3].find(k=>mb[k]>=1.1);
   if(d===1&&rng()<.45){}
   else if(sd!==undefined){const w=Math.min(mb[sd]-.3,1.1);
    if(sd<2){const sx=sd?bb[2]+mb[1]/2:bb[0]-mb[0]/2;kput('pkStair',[x+sx,yb,z+bb[1]+.3],null,[w,CH.P/2,1],null);}
    else{const sz=sd===2?bb[3]+mb[2]/2:bb[1]-mb[3]/2;kput('pkStair',[x+bb[0]+.3,yb,z+sz],qEuler(0,Math.PI/2,0),[w,CH.P/2,1],null);}}
   else{const u=L.us[0];const hl=(u.big?CH.L40:CH.L20)/2;
    kput('pkLadder',[x+u.lx+(u.yaw?-1.4:hl-1),y+.3,z+u.lz+(u.yaw?hl-1:1.4)],u.yaw?qEuler(0,-Math.PI/2,0):null,[1,(CH.P+.6)/10,1],d>0?new THREE.Color(0x8a5a3a):null);}}}
 const T=lv[nS-1],topY=D+T.y+CH.H,[tx0,tz0,tx1,tz1]=T.bb,tcx=x+(tx0+tx1)/2,tcz=z+(tz0+tz1)/2,tw=tx1-tx0,td=tz1-tz0;
 const out={plat,top:topY,bb:[x+tx0,z+tz0,x+tx1,z+tz1],standing:nS};
 if(nS===n){chRoof(G,tcx,topY,tcz,tw,td,T.ax,d,o.roof||'canopy',o);}
 else chTopple(G,x,z,P,nS,d,o);
 if(o.mast)chMast(x+o.mast[0],z+o.mast[1],topY+4,d);
 if(d===1){for(const p of plat)for(let k=0;k<3;k++)kput('vine',[rr(p.box[0],p.box[2]),p.y+CH.H+.2,rng()<.5?p.box[1]:p.box[3]],qEuler(rr(-.1,.1),rng()*TAU,rr(-.1,.1)),[rr(.8,1.5),rr(2,Math.max(2.2,p.y-D+2)),rr(.8,1.5)],null);
  scatterMoss(tcx,topY,tcz,0,Math.min(tw,td)*.4,6,1.4);portRubble(x,D,z,6,10);}
 return out;}
// The roof of a standing tower.
function chRoof(G,cx,y,cz,w,dp,ax,d,kind,o){const fc=chFrameCol(d);
 if(kind==='canopy'){const hw=w/2+.3,hd=dp/2+.3;
  for(const sx of [-1,1])for(const sz of [-1,1])kput('chBar',[cx+sx*hw,y+1.2,cz+sz*hd],null,[.14,2.4,.14],fc);
  const col=d===0?new THREE.Color().setHSL(rr(0,1),.12,rr(.72,.86)):new THREE.Color().setHSL(.06,.4,rr(.3,.42));
  kput('chSheet',[cx,y+2.55,cz],ax?qEuler(.1,0,0):qEuler(0,0,.1),[w+2.6,1,dp+2.6],col);
  chRail(cx-hw,cz+hd,cx+hw,cz+hd,y,d);chRail(cx-hw,cz-hd,cx+hw,cz-hd,y,d);
  if(d!==1){portFigures(cx,y,cz,d===3?2:1,Math.min(w,dp)*.3);if(rng()<.6)kput('planter',[cx+hw-.6,y+.3,cz],null,[.8,.6,dp*.6],null);
   chBulbs([cx-hw,y+2.3,cz-hd],[cx+hw,y+2.3,cz-hd],8,.3);}}
 else if(kind==='solar'){const nx=Math.max(2,Math.floor(w/1.15)),nz=Math.max(1,Math.floor(dp/2));
  for(let i=0;i<nx;i++)for(let k=0;k<nz;k++){const px=cx+(i+.5-nx/2)*1.12,pz=cz+(k+.5-nz/2)*1.9;
   kput('pkSolar',[px,y+.7,pz],qEuler(.45,0,0),1,null);kput('chBar',[px,y+.3,pz-.3],null,[.06,.6,.06],fc);}}
 else if(kind==='garden'){kput('planter',[cx,y+.3,cz],null,[w*.8,.6,dp*.7],null);
  for(let i=0;i<Math.round(w*dp/5);i++)kput('leafCard',[cx+rr(-w*.35,w*.35),y+.9,cz+rr(-dp*.3,dp*.3)],qEuler(0,rng()*TAU,0),[rr(.5,1),rr(.4,.8),rr(.5,1)],new THREE.Color().setHSL(rr(.2,.34),rr(.4,.6),rr(.4,.62)));
  VEG.tree(cx+rr(-w*.25,w*.25),y+.5,cz,(rng()*3)|0,rr(3,4.5));}
 else if(kind==='tank'){kput('chBar',[cx,y+.8,cz],null,[2.4,1.6,2.4],fc);kput('chTank',[cx,y+1.6,cz],null,[1.2,2.2,1.2],d===0?new THREE.Color(0x2c6a9a):new THREE.Color(0x7a5a44));}
 if(d!==1&&rng()<.6)kput('pkDish',[cx+w*.35,y,cz-dp*.3],qEuler(0,rng()*TAU,0),1,null);
 if(rng()<.5)kput('chPole',[cx-w*.4,y,cz+dp*.35],d===1?qEuler(rr(-.4,.4),0,rr(-.4,.4)):null,[.05,rr(4,7),.05],new THREE.Color(0x9aa0a4));}
// A lattice mast with a radome (image 7 of the container sheet).
function chMast(x,z,h,d){const D=CH.D,fc=d===0?new THREE.Color(0x3f7a4a):new THREE.Color(0x5a4a34),b=1.5,t=.9,H=h-D;
 const lean=d===1?[rr(-.05,.05),rr(-.05,.05)]:[0,0];const L=(sx,sz,f)=>[x+sx*lerp(b,t,f)+lean[0]*H*f,D+H*f,z+sz*lerp(b,t,f)+lean[1]*H*f];
 const C=[[-1,-1],[1,-1],[1,1],[-1,1]];
 for(const c of C)chBeam('chBar',L(c[0],c[1],0),L(c[0],c[1],1),.14,fc);
 const nb=Math.max(2,Math.round(H/3));
 for(let k=0;k<nb;k++){const f0=k/nb,f1=(k+1)/nb;for(let j=0;j<4;j++){const a=C[j],e=C[(j+1)%4];
  chBeam('chBar',L(a[0],a[1],f0),L(e[0],e[1],f1),.07,fc);chBeam('chBar',L(a[0],a[1],f1),L(e[0],e[1],f1),.07,fc);}}
 const T=L(0,0,1);kput('chBar',[T[0],T[1]+.1,T[2]],null,[2.6,.2,2.6],fc);
 if(d===1&&rng()<.6){kput('chDome',[x+rr(4,7),D+1.2,z+rr(-3,3)],qEuler(rr(-.8,.8),0,rr(-.8,.8)),[2.3,1.2,2.3],new THREE.Color(0xb8b0a4));}
 else kput('chDome',[T[0],T[1]+2.3,T[2]],null,2.3,d===0?null:new THREE.Color(0xd8d0c4));
 REGISTER({name:'Radome mast',x,z,r:2.5,h:H+4.6,y:D});}
// d=1: the levels from nS up have fallen. The first leans off the stump, the
// rest lie in the alley and yard downwind of the fall, on their sides or
// propped at an angle, platforms and rails with them.
function chTopple(G,x,z,P,nS,d,o){const D=CH.D,fd=o.fall||[1,0],lv=P.lv,S=lv[nS-1],top=D+S.y+CH.H;
 const yawF=Math.atan2(-fd[1],fd[0]);let first=true;
 const lim=[-55+CH.CLR+3,-110+CH.CLR+3,55-CH.CLR-3,-CH.CLR-3];
 for(let i=nS;i<lv.length;i++)for(const u of lv[i].us){const big=u.big,L=big?CH.L40:CH.L20,col=chCol(1,o.burnt);
  if(first){first=false;
   // leans against the stump's face on the fall side: lower edge on the
   // ground, upper end resting on the face no higher than the stump's top
   // (it used to hang half inside the stump's top level)
   const he=Math.abs(fd[0])*(S.bb[2]-S.bb[0])/2+Math.abs(fd[1])*(S.bb[3]-S.bb[1])/2;
   const th=Math.min(1.1,Math.asin(Math.min(1,(top-D-.4)/L))),off=he+.1+L/2*Math.cos(th);   // origin is the box's base centre
   const sx=x+(S.bb[0]+S.bb[2])/2+fd[0]*off,sz=z+(S.bb[1]+S.bb[3])/2+fd[1]*off;
   kput(big?'pkCont40R':'pkCont20R',[sx,D+L/2*Math.sin(th),sz],qEuler(0,yawF,0).multiply(qEuler(0,0,-th)),1,col);continue;}
  const dist=rr(3,6)+(i-nS)*rr(2.5,4),lat=rr(-4,4);
  const px=clamp(x+u.lx+fd[0]*dist-fd[1]*lat,lim[0],lim[2]),pz=clamp(z+u.lz+fd[1]*dist+fd[0]*lat,lim[1],lim[3]);
  const r=rng(),yw=yawF+rr(-1.2,1.2);let q,py;
  if(r<.4){q=qEuler(0,yw,0);py=D;}
  else if(r<.75){q=qEuler(0,yw,0).multiply(qEuler(Math.PI/2*(rng()<.5?1:-1),0,0));py=D+1.22;}
  else{// propped: one end up on a heap of rubble, the other dug in a little
   const b=rr(.1,.2);q=qEuler(0,yw,0).multiply(qEuler(0,0,b));py=D+L/2*Math.sin(b)-.5;
   portRubble(px+Math.cos(yw)*L*.42,D,pz-Math.sin(yw)*L*.42,3,8);}
  kput(big?'pkCont40R':'pkCont20R',[px,py,pz],q,1,col);
  if(rng()<.5)kput('vine',[px,py+2.4,pz],null,[1.2,2.2,1.2],null);}
 // a fallen balcony and a snapped mast at the stump
 kput('chBar',[x+fd[0]*6,D+.5,z+fd[1]*6],qEuler(rr(-.3,.3),yawF,rr(.2,.5)),[8,.2,3],new THREE.Color(0x6a4232));
 chRail(x+fd[0]*4,z+fd[1]*4-2,x+fd[0]*9,z+fd[1]*9-2,D,1,.3);
 portRubble(x+fd[0]*4,D,z+fd[1]*4,5,14);}

// ---------------------------------------------------------------- the block: ground, footways, sides
// chStamps(paints)(opt): the whole footprint flat at deck level (a `land`
// block has no water of its own), painted per decay; a dredge outside any
// side on open sea (W/E via portEdgeStamps, N/S here).
// yards: [[x0,z0,x1,z1,{d:paint}]] repaint parts of it (courtyards, greens).
function chStampsFor(paint,yards){return o=>{const h=o.W/2,L=o.LAND,s=[{kind:'flat',x0:-h,z0:-L,x1:h,z1:0,y:PORT.DECK,soft:30,paint:paint[o.d]||paint[0]}];
 for(const y of (yards||[]))s.push({kind:'flat',x0:y[0],z0:y[1],x1:y[2],z1:y[3],y:PORT.DECK,soft:0,paint:y[4][o.d]||y[4][0]});
 const nb=o.nb||{};
 if(nb.S&&nb.S.kind==='sea')s.push({kind:'dig',x0:-h,x1:h,z0:0,z1:40,y:-12,soft:30,outside:true});
 if(nb.N&&nb.N.kind==='sea')s.push({kind:'dig',x0:-h,x1:h,z0:-L-40,z1:-L,y:-12,soft:30,outside:true});
 return s.concat(portEdgeStamps(o,{LAND:L,SEA:0}));};}
// chPaths(G,d,rects): paved alleys (and the yards' paths) at deck level.
function chPaths(G,d,rects){for(const r of rects)portPaving(G,r[0],r[1],r[2],r[3],d,d===0?{}:{broken:d===1?.3:.12});}
// chPerimeter(G,opt,d,o): the 4 m footway on all four sides, a boundary line
// (hedge, fence or sheet) 4.5 m in with gates at o.gaps[side] ([[a,b],...]
// along x for S/N, along z for W/E), lamps along it, and the outer edge
// finished by what is beyond it (nb kind: seg -> the footway simply
// continues; land -> kerb, and riprap where the ground falls away; sea ->
// quay wall).
function chPerimeter(G,opt,d,o){o=Object.assign({gaps:{},fence:'hedge'},o||{});const D=CH.D,h=opt.W/2,L=opt.LAND,F=CH.FOOT,nb=opt.nb||{};
 const pv=d===0?{}:{broken:d===1?.3:.1};
 portPaving(G,-h,-F,h,0,d,pv);portPaving(G,-h,-L,h,-L+F,d,pv);portPaving(G,-h,-L+F,-h+F,-F,d,pv);portPaving(G,h-F,-L+F,h,-F,d,pv);
 const bi=F+.5;   // boundary line, inside the footway
 const sides={S:{a:[-h+bi,-bi],b:[h-bi,-bi],out:[0,1],edge:[[-h,0],[h,0]]},N:{a:[-h+bi,-L+bi],b:[h-bi,-L+bi],out:[0,-1],edge:[[-h,-L],[h,-L]]},
  W:{a:[-h+bi,-L+bi],b:[-h+bi,-bi],out:[-1,0],edge:[[-h,-L],[-h,0]]},E:{a:[h-bi,-L+bi],b:[h-bi,-bi],out:[1,0],edge:[[h,-L],[h,0]]}};
 for(const sk of ['S','N','W','E']){const S=sides[sk],N=nb[sk]||{kind:'land'},gz=o.gaps[sk]||[];
  const alongX=sk==='S'||sk==='N',s0=alongX?S.a[0]:S.a[1],s1=alongX?S.b[0]:S.b[1];
  // boundary pieces between the gates
  const g=gz.slice().sort((p,q)=>p[0]-q[0]),pcs=[];let c=s0;for(const e of g){if(e[0]>c)pcs.push([c,e[0]]);c=Math.max(c,e[1]);}if(c<s1)pcs.push([c,s1]);
  for(const [a,b] of pcs){if(b-a<1)continue;const P=t=>alongX?[t,S.a[1]]:[S.a[0],t];chBoundary(P(a),P(b),d,o.fence);}
  for(let t=s0+10;t<s1-6;t+=24){if(g.some(e=>t>e[0]-2&&t<e[1]+2))continue;const p=alongX?[t,S.a[1]-S.out[1]*.8]:[S.a[0]-S.out[0]*.8,t];chLamp(p[0],D,p[1],d);}
  const [E0,E1]=S.edge;
  if(N.kind==='sea'){portQuayWall(G,E0[0],E0[1],E1[0],E1[1],d,{face:S.out,fenders:0,ladders:0});}
  else if(N.kind!=='seg'){   // natural land: a kerb on the line, riprap where the ground drops away
   const cx=(E0[0]+E1[0])/2-S.out[0]*.25,cz=(E0[1]+E1[1])/2-S.out[1]*.25;
   pbBox(G,CONC(d),cx,D-.35,cz,alongX?opt.W:.5,.9,alongX?.5:L,0,8);
   let lo=1e9;for(let t=.1;t<1;t+=.2){const px=lerp(E0[0],E1[0],t)+S.out[0]*9,pz=lerp(E0[1],E1[1],t)+S.out[1]*9;lo=Math.min(lo,portH(px,pz));}
   if(lo<D-1.2)portRevetment(G,E0[0],E0[1],E1[0],E1[1],d,{face:S.out,width:22,top:D+.1,toe:lo-3});}}}
// One straight run of boundary: hedge (clipped at d=0, overgrown at d=1),
// timber-and-wire fence, or corrugated sheet (the reclaimed fence).
function chBoundary(A,B,d,kind){const L=Math.hypot(B[0]-A[0],B[1]-A[1]),yaw=Math.atan2(-(B[1]-A[1]),B[0]-A[0]),D=CH.D;if(L<.5)return;
 const n=Math.max(1,Math.round(L/4));
 if(d===3&&kind!=='hedge')kind='sheet';
 for(let i=0;i<n;i++){const t=(i+.5)/n,x=lerp(A[0],B[0],t),z=lerp(A[1],B[1],t),l=L/n;
  if(kind==='hedge'){if(d===1){kput('hedge',[x,D+rr(.7,1.4),z],qEuler(0,yaw+rr(-.1,.1),0),[l*rr(.8,1.1),rr(1.4,2.8),rr(1,1.8)],null);if(rng()<.3)VEG.tree(x,D,z,(rng()*3)|0,rr(4,8));}
   else kput('hedge',[x,D+.5,z],qEuler(0,yaw,0),[l+.05,1,.8],null);}
  else if(kind==='fence'){if(d===1&&rng()<.35)continue;
   kput('chPole',[x-Math.cos(yaw)*l/2,D,z+Math.sin(yaw)*l/2],d===1?qEuler(rr(-.3,.3),0,rr(-.3,.3)):null,[.07,1.4,.07],new THREE.Color(0x7a6048));
   for(const hy of [.5,.9,1.3])kput('pkLine',[x,D+hy,z],qEuler(0,yaw,0),[l,1,1],null);}
  else{kput('patchSheet',[x,D+1,z],qEuler(0,yaw,0).multiply(qEuler(0,0,rr(-.04,.04))),[l+.3,rr(1.7,2.2),1],new THREE.Color().setHSL(rr(0,1),rr(.1,.4),rr(.5,.8)));
   kput('chPole',[x-Math.cos(yaw)*l/2,D,z+Math.sin(yaw)*l/2],null,[.06,2.1,.06],new THREE.Color(0x5a4a3a));}}}

// ---------------------------------------------------------------- chStack: tall stacked towers
// Four lots round a cross of alleys (a 6 m lane north-south at x=-2, one
// east-west at z=-56). Each lot holds three buildings: a main tower (4-7
// levels) on the alley corner, so the alleys read as narrow streets between
// towers; a lower stack (2-3 levels) on the outer side; a one-box annex; plus
// a garden against the hedge. The NE main tower stands on stilts, the NW one
// has a radome mast. d=1: two main towers and a stack toppled (into the
// alley and the yards), the stilt tower burnt out, trees in the yards.
// d=3: every building a level or two taller, plank bridges across both
// alleys, infill houses in the yards, stalls and bulbs down the alleys.
const CHS={ax:-2,az:-56,aw:6,lots:[
 {t:{x:-19,z:-36,n:6,lim:[13,13,13,12],ax0:0,roof:'canopy',front:[1,0],topple:3,fall:[-1,0]},
  s:{x:-38,z:-20,n:3,ax0:1,roof:'solar',front:[1,0],lim:[8,8,10,11]},ann:[-42,-45,Math.PI/2,0],gdn:[-22,-12.5,14,4],line:[-44,-30,-44,-38]},
 {t:{x:15,z:-37,n:4,lim:[11,13,13,12],ax0:1,roof:'solar',stilts:true,front:[-1,0],burnt:true},
  s:{x:36,z:-20,n:3,ax0:0,roof:'canopy',front:[-1,0],lim:[9,10,10,11]},ann:[42,-45,Math.PI/2,0],gdn:[18,-12.5,14,4],line:[30,-30,30,-44]},
 {t:{x:-19,z:-75,n:7,lim:[13,13,13,12],ax0:1,roof:'tank',front:[1,0],topple:4,fall:[0,1],mast:[-17,-14]},
  s:{x:-39,z:-70,n:3,ax0:1,roof:'garden',front:[1,0],lim:[7,8,10,10]},ann:[-22,-95,0,1],line:[-12,-90,-12,-100]},
 {t:{x:16,z:-75,n:5,lim:[12,13,13,12],ax0:0,roof:'garden',front:[-1,0]},
  s:{x:37,z:-89,n:3,ax0:0,roof:'tank',front:[-1,0],topple:1,fall:[0,1],lim:[10,9,12,9]},ann:[41,-67,Math.PI/2,0],gdn:[15,-98,14,4],line:[30,-60,42,-60]}]};
function buildChStack(scene,gx,gz,d,opt){reseed(20800+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=CH.D,C=CHS,h=opt.W/2,L=opt.LAND,hw=C.aw/2,F=CH.FOOT;
 chPerimeter(G,opt,d,{fence:'hedge',gaps:{S:[[C.ax-hw,C.ax+hw]],N:[[C.ax-hw,C.ax+hw]],W:[[C.az-hw,C.az+hw]],E:[[C.az-hw,C.az+hw]]}});
 chPaths(G,d,[[C.ax-hw,-L+F,C.ax+hw,-F],[-h+F,C.az-hw,C.ax-hw,C.az+hw],[C.ax+hw,C.az-hw,h-F,C.az+hw]]);
 const T=[];
 C.lots.forEach((lt,i)=>{
  // the main tower and the lower stack: same structure in every decay
  const bld=(B,seed,main)=>{const extra=d===3?(main?1+(i%2):1):0,P=chPlan(seed,B.n+extra,{stilts:B.stilts,ax0:B.ax0,lim:B.lim,wide:main?2:0});
   const burnt=d===1&&!!B.burnt,top=d===1&&B.topple!=null?B.topple:null;
   // a paved forecourt under it
   const lv0=P.lv[0].bb;chPaths(G,d,[[B.x+lv0[0]-3,B.z+lv0[1]-3,B.x+lv0[2]+3,B.z+lv0[3]+3]]);
   const t=chTower(G,B.x,B.z,P,d,{burnt,lit:d===0?.55:.7,roof:d===3&&main&&i!==1?'garden':B.roof,front:B.front,topple:top,fall:B.fall,mast:B.mast});
   const hh=(top!=null?D+P.lv[top-1].y+CH.H:t.top)-D+3;
   REGISTER({name:main?'Container tower':'Container stack',x:B.x,z:B.z,r:P.ext,h:hh,y:D});
   if(d!==1)for(const p of t.plat.slice(1))if(rng()<(d===3?.45:.3))portFigures((p.box[0]+p.box[2])/2,p.y,p.box[3]-.5,1,.4);
   return t;};
  T.push(bld(lt.t,20850+i,true));bld(lt.s,20860+i,false);
  // the annex: one box, or a salvaged house at d=3
  const a=lt.ann,burnt=d===1&&!!lt.t.burnt;
  if(d===3)portContainerHouse(G,a[0],D,a[1],a[2],d,{levels:2,lit:.6,big:!!a[3]});
  else{const ds=a[2]?(a[0]<0?1:-1):(a[1]>-56?-1:1);chUnit(a[0],D,a[1],a[2],!!a[3],d,{burnt,lit:.5,doorSide:ds,endGlass:1});
   REGISTER({name:'Container annex',x:a[0],z:a[1],r:a[3]?6.3:3.3,h:3,y:D});
   if(d===0){const c=Math.cos(a[2]),s=Math.sin(a[2]);kput('pkAwn',[a[0]+s*ds*2.5,D+2.4,a[1]+c*ds*2.5],qEuler(-.2*ds,a[2],0),[a[3]?8:4,1,2.4],new THREE.Color().setHSL(rr(0,1),.45,.62));}}
  // gardens against the hedge, a washing line, benches, a water tank
  const g=lt.gdn,wl=lt.line;
  if(g){if(d===0){portGarden(g[0],D,g[1],g[2],g[3],d);portTrees(g[0]-g[2]/2,g[1]-1,g[0]+g[2]/2,g[1]+1,2,D,4,7);}
   else if(d===3)portGarden(g[0],D,g[1],g[2],g[3],d);else portWeeds(g[0]-g[2]/2,g[1]-g[3]/2,g[0]+g[2]/2,g[1]+g[3]/2,20,D);}
  if(d!==1)portWashLine(wl[0],wl[1],wl[2],wl[3],2.3,d===3?7:5);
  if(d===0){kput('chTank',[wl[0]+1.5,D,wl[1]+1.5],null,[1,2,1],new THREE.Color(0x2c6a9a));
   for(let k=0;k<2;k++)kput('plank',[wl[0]+rr(2,5),D+.45,(wl[1]+wl[3])/2+rr(-2,2)],qEuler(0,rng()*TAU,0),[1.8,.9,.7],null);
   portFigures((wl[0]+wl[2])/2+2,D,(wl[1]+wl[3])/2,3,3);
   const ox=lt.t.x<0?-1:1,oz=i<2?1:-1;   // fruit trees in the open corners of the lot
   portTrees(lt.t.x+ox*14,lt.t.z+oz*9,lt.t.x+ox*24,lt.t.z+oz*15,3,D,4,7);
   portTrees(lt.s.x-6,lt.s.z+oz*8,lt.s.x+6,lt.s.z+oz*11,2,D,4,7);}
  if(d===1){portTrees(lt.t.x-14,lt.t.z-14,lt.t.x+14,lt.t.z+14,4,D,5,11);portTrees(lt.s.x-9,lt.s.z-9,lt.s.x+9,lt.s.z+9,2,D,5,10);
   portWeeds(lt.t.x-17,lt.t.z-17,lt.t.x+17,lt.t.z+17,50,D);}
  if(d===3){const ix=(lt.t.x+lt.s.x)/2,iz=i<2?-47:-66;   // an infill house between the two stacks
   portContainerHouse(G,ix+(i%2?2:-2),D,iz+(i<2?0:-3),0,d,{levels:1+(i%2),lit:.6,big:false});
   portFigures(ix,D,(lt.t.z+lt.s.z)/2,5,6);}});
 // the alleys: people, benches and planters; stalls, bulbs and bridges at d=3
 if(d!==1){portFigures(C.ax,D,-30,d===3?10:5,2);portFigures(C.ax,D,-82,d===3?10:4,2);portFigures(-30,D,C.az,d===3?8:4,18);portFigures(28,D,C.az,d===3?8:3,18);}
 else portFigures(C.ax,D,C.az,2,3);
 if(d===0)for(let x=-40;x<=40;x+=16)if(Math.abs(x-C.ax)>8)kput('planter',[x,D+.3,C.az-hw+.7],null,[3,.6,.9],null);
 if(d===3){
  for(let z=-96;z<=-14;z+=8){if(Math.abs(z-C.az)<6)continue;portStall(C.ax+(z%16?1.6:-1.6),D,z,z%16?-Math.PI/2:Math.PI/2);}
  for(let x=-44;x<=44;x+=11){if(Math.abs(x-C.ax)<6)continue;portStall(x,D,C.az-1.8,0);}
  for(const z of [-22,-44,-68,-90])chBulbs([C.ax-hw-1,D+5.5,z],[C.ax+hw+1,D+5.5,z+6],6,.4);
  for(const x of [-40,-24,12,30])chBulbs([x,D+5.5,C.az-hw-1],[x+10,D+5.5,C.az+hw+1],8,.4);
  // bridges: from a high platform of one tower to the nearest-height one across the alley
  const link=(a,b)=>{const A=T[a],B=T[b];if(A.plat.length<3||B.plat.length<3)return;
   const pa=A.plat[A.plat.length-2];let pb=B.plat[1];for(const p of B.plat)if(Math.abs(p.y-pa.y)<Math.abs(pb.y-pa.y))pb=p;
   const y=(pa.y+pb.y)/2,ca=[(pa.box[0]+pa.box[2])/2,(pa.box[1]+pa.box[3])/2],cb=[(pb.box[0]+pb.box[2])/2,(pb.box[1]+pb.box[3])/2];
   const ex=(bx,c,t)=>[clamp(c[0]+(t[0]-c[0])*9,bx[0],bx[2]),clamp(c[1]+(t[1]-c[1])*9,bx[1],bx[3])];
   const e0=ex(pa.box,ca,cb),e1=ex(pb.box,cb,ca);chBridge([e0[0],y,e0[1]],[e1[0],y,e1[1]],1.4,.35);
   portFigures((e0[0]+e1[0])/2,y-.2,(e0[1]+e1[1])/2,1,.3);};
  link(0,1);link(2,3);link(0,2);link(1,3);
  portWeeds(-h+5,-L+5,h-5,-5,40,D);}
 if(d===1){portWeeds(-h+2,-L+2,h-2,-2,180,D);portTrees(C.ax-2,-100,C.ax+2,-62,2,D,5,9);portRubble(C.ax,D,C.az,4,10);}
 KOFF=[0,0,0];return G;}
PORT_SEG({key:'chStack',name:'Container towers',cls:'seg',W:110,LAND:110,SEA:0,place:'land',decays:[0,1,3],norepair:true,
  stamps:chStampsFor({0:'grass',1:'soil',3:'soil'}),build:buildChStack});
