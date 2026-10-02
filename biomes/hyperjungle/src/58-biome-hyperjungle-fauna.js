// ================================================================= HYPERJUNGLE — fauna
// What moves in the belt, written against the same contract (BIO.host gives
// terrainH / mask / obstacles / ticks; the trees pass gives canopyH and the
// hero perches). Five kinds, every one an instanced item like any plant:
//   SKY RAYS      big broad-winged soarers in flocks wheeling above the canopy
//                 (shader 'orbit' paths, banked, a slow glide-flap)
//   CANOPY DARTS  small fast flitters in loose groups under the canopy
//                 (shader 'flit' paths in the openings)
//   BUTTERFLIES   hyperjungle-sized, drifting low in the openings and round
//                 the blooms (shader 'flit', painted wings tinted per instance)
//   SPORE MOTES   glowing drift in the damp and along the brook banks
//                 (billboarded additive discs, shader 'flit')
//   STRIDERS      long-legged grazers in herds on the open floor, walked on
//                 the CPU between waypoints (terrain-following, keep-clear,
//                 grazing pauses), legs swung in the shader ('walk')
//   BOUGH SLOTHS  hanging under the hero boughs, static
// Every animal is charged to BIO.cur ('jungle/fauna'); the counts scale with q.
(function(){
const T3=()=>BIO.host.THREE,PAL=HYPERJUNGLE.PAL;
const C=h=>new (T3().Color)(h);
function vary(hex,dh,ds,dl){const c=C(hex),h={};c.getHSL(h);c.setHSL(((h.h+rr(-dh,dh))%1+1)%1,clamp(h.s+rr(-ds,ds),0,1),clamp(h.l+rr(-dl,dl),.03,.97));return c;}
const damp=(x,z)=>fbm(x*.0052+21,z*.0052+13,777,2);            // the floor pass's damp field
const openK=(x,z)=>.38+.62*smooth(.32,.62,fbm(x*.0105+5,z*.0105-9,4242,2));

// ---------------------------------------------------------------- bodies
// +x forward, +y up, unit-ish size; assembled once, vertex-coloured, tinted
// per instance.
function rayGeo(){const T=T3();
 const body=new T.SphereGeometry(.14,7,5).scale(1.9,.55,.75).translate(.05,0,0);
 const head=new T.SphereGeometry(.07,5,4).scale(1.6,.8,.9).translate(.36,.02,0);
 const tail=new T.CylinderGeometry(.01,.03,.55,4).rotateZ(Math.PI/2).translate(-.5,.01,0);
 return BIO.geo.assemble([[body,0x5a5e62,(x,y,z)=>y<0?1.25:1],[head,0x50545a],[tail,0x44484c],
  [BIO.geo.wing(1,.18,-.24,-.12,1.05,.22,.06),0x62666a],[BIO.geo.wing(-1,.18,-.24,-.12,1.05,.22,.06),0x62666a],
  [BIO.geo.wing(1,-.22,-.34,-.40,.28,.10,.02),0x50545a],[BIO.geo.wing(-1,-.22,-.34,-.40,.28,.10,.02),0x50545a]]);}
function dartGeo(){const T=T3();
 const body=new T.SphereGeometry(.09,6,4).scale(1.8,.8,.8);
 const head=new T.SphereGeometry(.055,5,4).translate(.17,.03,0);
 const beak=new T.ConeGeometry(.02,.09,4).rotateZ(-Math.PI/2).translate(.25,.03,0);
 return BIO.geo.assemble([[body,0x6a7a62,(x,y,z)=>y<0?1.3:1],[head,0x5a6a56],[beak,0x3a3a30],
  [BIO.geo.wing(1,.08,-.08,-.04,.42,.14,.05),0x5e6e58],[BIO.geo.wing(-1,.08,-.08,-.04,.42,.14,.05),0x5e6e58],
  [BIO.geo.wing(1,-.12,-.18,-.30,.10,.10,0),0x4e5e4a],[BIO.geo.wing(-1,-.12,-.18,-.30,.10,.10,0),0x4e5e4a]]);}
// butterfly: two textured wing quads (uv 0..1 across each) and a thread body
function flyGeo(){const T=T3();const body=new T.CylinderGeometry(.02,.015,.34,4).rotateZ(Math.PI/2);
 const g=BIO.geo.assemble([[body,0x2a2420],[BIO.geo.wing(1,.16,-.16,-.02,.42,.30,0),0xffffff],[BIO.geo.wing(-1,.16,-.16,-.02,.42,.30,0),0xffffff]]);
 return g;}
function moteGeo(){const T=T3();return new T.CircleGeometry(.5,6);}
function striderGeo(){const T=T3();
 const body=new T.SphereGeometry(.22,9,6).scale(1.9,1.05,1).translate(0,.66,0);
 const rump=new T.SphereGeometry(.16,7,5).scale(1.1,.9,.9).translate(-.34,.64,0);
 const neck=new T.CylinderGeometry(.06,.09,.42,5).rotateZ(-.9).translate(.46,.86,0);
 const head=new T.SphereGeometry(.09,6,5).scale(1.8,.8,.75).translate(.66,1.04,0);
 const ear1=new T.ConeGeometry(.025,.1,3).translate(.58,1.13,.06),ear2=new T.ConeGeometry(.025,.1,3).translate(.58,1.13,-.06);
 const tail=new T.CylinderGeometry(.012,.03,.4,4).rotateZ(1.2).translate(-.62,.6,0);
 const parts=[[body,0x6a6e5a,(x,y,z)=>y<.62?1.28:1],[rump,0x646852],[neck,0x62665a],[head,0x5c6054],[ear1,0x4a4e44],[ear2,0x4a4e44],[tail,0x4a4e44]];
 // a dorsal ridge of three horny plates
 for(let k=0;k<3;k++){const p=new T.ConeGeometry(.045,.14,4).translate(.14-k*.16,.94,0);parts.push([p,0x8a7a58]);}
 [[.28,.13],[.28,-.13],[-.28,.13],[-.28,-.13]].forEach(l=>{const leg=new T.CylinderGeometry(.035,.05,.66,5).translate(l[0],.33,l[1]);parts.push([leg,0x4e5246]);
  const hoof=new T.CylinderGeometry(.045,.04,.05,5).translate(l[0],.025,l[1]);parts.push([hoof,0x2e3028]);});
 return BIO.geo.assemble(parts);}
function slothGeo(){const T=T3();
 const body=new T.SphereGeometry(.24,7,5).scale(1,.75,.8).translate(0,-.38,0);
 const head=new T.SphereGeometry(.11,6,4).translate(.2,-.30,0);
 const a1=new T.CylinderGeometry(.03,.025,.42,4).translate(.1,-.16,.12),a2=new T.CylinderGeometry(.03,.025,.42,4).translate(.1,-.16,-.12);
 const b1=new T.CylinderGeometry(.03,.025,.36,4).translate(-.14,-.2,.1),b2=new T.CylinderGeometry(.03,.025,.36,4).translate(-.14,-.2,-.1);
 return BIO.geo.assemble([[body,0x5a4a38],[head,0x6a5a48],[a1,0x4a3c2e],[a2,0x4a3c2e],[b1,0x4a3c2e],[b2,0x4a3c2e]]);}

// ---------------------------------------------------------------- textures, materials, items
reseed(580001);
HYPERJUNGLE.WINGTEX=BIO.alphaTex(256,(g,S)=>{   // one wing on a transparent canvas: dark rim, veins, eye spots; u 0 = the body root
 g.fillStyle=BIO.tex.grey(215);g.beginPath();g.moveTo(4,S*.5);g.quadraticCurveTo(S*.35,S*.02,S*.96,S*.10);g.quadraticCurveTo(S*.98,S*.55,S*.80,S*.72);g.quadraticCurveTo(S*.55,S*.98,S*.20,S*.90);g.quadraticCurveTo(S*.04,S*.75,4,S*.5);g.closePath();g.fill();
 g.strokeStyle=BIO.tex.grey(60);g.lineWidth=12;g.stroke();
 g.strokeStyle=BIO.tex.grey(120);g.lineWidth=2;for(let k=0;k<7;k++){g.beginPath();g.moveTo(8,S*.5);g.quadraticCurveTo(S*.5,S*(.15+.1*k),S*.9,S*(.12+.1*k));g.stroke();}
 [[.62,.32,22],[.55,.68,16],[.80,.50,12]].forEach(e=>{g.fillStyle=BIO.tex.grey(40);g.beginPath();g.arc(S*e[0],S*e[1],e[2],0,TAU);g.fill();g.fillStyle=BIO.tex.grey(230);g.beginPath();g.arc(S*e[0],S*e[1],e[2]*.45,0,TAU);g.fill();});},[150,150,150]);
HYPERJUNGLE.FAUNAMAT={
 ray:BIO.animMat('ray',{mode:'orbit',flap:{rate:1.1,amp:.09,root:.14},vertexColors:true}),
 dart:BIO.animMat('dart',{mode:'flit',flap:{rate:11,amp:.32,root:.06},vertexColors:true}),
 fly:BIO.animMat('fly',{mode:'flit',flap:{rate:7,amp:.6,root:.02},vertexColors:true,tex:HYPERJUNGLE.WINGTEX,alphaTest:.4}),
 mote:BIO.animMat('mote',{mode:'flit',billboard:true,basic:true,additive:true}),
 strider:BIO.animMat('strider',{mode:'walk',legs:{top:.62,amp:.16},vertexColors:true}),
 sloth:BIO.solidMat(null,0xffffff),
};
BIO.def('ray',rayGeo(),HYPERJUNGLE.FAUNAMAT.ray,{attrs:['aP0','aP1'],label:'Sky rays'});
BIO.def('dart',dartGeo(),HYPERJUNGLE.FAUNAMAT.dart,{attrs:['aP0','aP1'],label:'Canopy darts'});
BIO.def('fly',flyGeo(),HYPERJUNGLE.FAUNAMAT.fly,{attrs:['aP0','aP1'],label:'Butterflies'});
BIO.def('mote',moteGeo(),HYPERJUNGLE.FAUNAMAT.mote,{attrs:['aP0','aP1'],label:'Spore motes'});
BIO.def('strider',striderGeo(),HYPERJUNGLE.FAUNAMAT.strider,{attrs:['aP0','aP1'],label:'Striders (a herd)'});
BIO.def('sloth',slothGeo(),HYPERJUNGLE.FAUNAMAT.sloth,{label:'Bough sloths'});

// ---------------------------------------------------------------- placement helpers
const trunkR=HYPERJUNGLE.trunkR;
function heroesNear(x,z,r){return (HYPERJUNGLE.TREES||[]).filter(T=>Math.hypot(x-T.x,z-T.z)<r+T.crownR);}
// open air: no hero bole within rad of (x,z)
function clearAir(x,z,rad){for(const T of HYPERJUNGLE.TREES||[]){if(Math.hypot(x-T.x,z-T.z)<rad+trunkR(T,T.y0+30)+2)return false;}return true;}
function clearGround(x,z,rad){for(const T of HYPERJUNGLE.TREES||[]){if(Math.hypot(x-T.x,z-T.z)<rad+trunkR(T,T.y0+3)*1.8+3)return false;}
 for(const S of HYPERJUNGLE.SAPLINGS||[]){if(Math.hypot(x-S.x,z-S.z)<rad+2)return false;}return true;}
const REGI=(o)=>{if(typeof REGISTER==='function')REGISTER(o);};

// ---------------------------------------------------------------- the herds (CPU)
// Each strider walks between waypoints inside its herd's disc, turning
// smoothly, grazing between legs; y follows the terrain. The item is baked
// by the host like any other; the tick finds its InstancedMesh on the first
// frame and rewrites the matrices and the gait phases from then on.
const HERDS=[];
function herdTick(dt){const T=T3();if(!HERDS.length)return;
 const mesh=HERDS._mesh||(HERDS._mesh=BIO.baked.find(m=>m.name==='biome:strider'));if(!mesh)return;
 const aP1=mesh.geometry.getAttribute('aP1');if(!aP1)return;
 const M=new T.Matrix4(),P=new T.Vector3(),Q=new T.Quaternion(),S=new T.Vector3(),UP=new T.Vector3(0,1,0);
 dt=Math.min(dt,.1);
 HERDS.forEach(H=>H.animals.forEach(A=>{
  if(A.state==='graze'){A.timer-=dt;if(A.timer<=0){A.state='walk';pickTarget(H,A);}}
  else{const dx=A.tx-A.x,dz=A.tz-A.z,d=Math.hypot(dx,dz);
   if(d<1.5){A.state='graze';A.timer=rr(3,10);}
   else{const want=Math.atan2(dz,dx);let dh=want-A.hdg;dh=Math.atan2(Math.sin(dh),Math.cos(dh));A.hdg+=clamp(dh,-1.6*dt,1.6*dt);
    const v=A.speed*Math.max(.25,1-Math.abs(dh)/2);A.x+=Math.cos(A.hdg)*v*dt;A.z+=Math.sin(A.hdg)*v*dt;A.gait+=v*dt*2.6/A.s;
    if(BIO.mask(A.x,A.z)<=0||!BIO.clearOf(A.x,A.z,3)){A.state='graze';A.timer=1;}}}
  A.y=BIO.terrainH(A.x,A.z);
  P.set(A.x,A.y,A.z);Q.setFromAxisAngle(UP,-A.hdg);S.set(A.s,A.s,A.s);M.compose(P,Q,S);mesh.setMatrixAt(A.i,M);
  aP1.setX(A.i,A.gait);}));
 mesh.instanceMatrix.needsUpdate=true;aP1.needsUpdate=true;}
function pickTarget(H,A){for(let t=0;t<12;t++){const a=rr(0,TAU),d=H.r*Math.sqrt(rng()),x=H.x+Math.cos(a)*d,z=H.z+Math.sin(a)*d;
  if(BIO.mask(x,z)<=0||!BIO.clearOf(x,z,6)||!clearGround(x,z,4))continue;A.tx=x;A.tz=z;return;}A.tx=H.x;A.tz=H.z;}

// ---------------------------------------------------------------- the pass
HYPERJUNGLE.buildFauna=function(R,heroR,q){
 reseed(580101);q=q==null?1:q;R=R||3000;heroR=heroR||1500;
 const st={rays:0,flocks:0,darts:0,dartGroups:0,flies:0,motes:0,swarms:0,striders:0,herds:0,sloths:0};
 const o=BIO.center(),canopy=(x,z)=>HYPERJUNGLE._canopyH?HYPERJUNGLE._canopyH(x,z):120;
 // 1. SKY RAYS: flocks wheeling above the canopy of the hero disc
 const nFlock=Math.round(8*q);
 BIO.scatter(nFlock,150,heroR-150,420,(x,y,z)=>{const rad=rr(90,220);if(!BIO.clearOf(x,z,rad+40))return;
  const cy=canopy(x,z)+rr(30,120),n=ri(5,12),dir=rng()<.5?1:-1,w=dir*TAU/rr(38,70),ecc=rr(.55,1),tint=vary(pick([0x6a6e74,0x7a7060,0x5e6672,0x8a8070]),.02,.1,.08);
  for(let k=0;k<n;k++){const s=rr(6.5,11.5);
   BIO.put('ray',[x,cy+rr(-14,14),z],null,s,tint.clone().offsetHSL(0,0,rr(-.06,.06)),{aP0:[x,cy,z,rad*rr(.85,1.15)],aP1:[w*rr(.92,1.08),rr(0,TAU),rr(4,12),ecc]});st.rays++;}
  st.flocks++;REGI({name:'A flock of sky rays',kind:'fauna',label:'Sky rays',x:x,z:z,y:cy-40,r:rad+30,h:100});},{pad:60});
 // 2. CANOPY DARTS: loose groups flitting through the openings under the canopy
 const nGroups=Math.round(70*q);
 BIO.scatter(nGroups,40,heroR-60,90,(x,y,z)=>{const rad=rr(12,34);if(!clearAir(x,z,rad+4)||!BIO.clearOf(x,z,rad+6))return;
  const cy=y+rr(10,45),n=ri(2,6),tint=vary(pick([0x6a7a62,0x7a6a4a,0x5a7a7a,0x8a7a5a,0x4a6a5a]),.03,.12,.08);
  for(let k=0;k<n;k++){const s=rr(1.2,2.1);
   BIO.put('dart',[x,cy,z],null,s,tint.clone().offsetHSL(0,0,rr(-.08,.08)),{aP0:[x,cy,z,rad*rr(.8,1.2)],aP1:[rr(.35,.7)*(rng()<.5?1:-1),rr(0,TAU),rr(3,9),rr(.5,1)]});st.darts++;}
  st.dartGroups++;});
 // 3. BUTTERFLIES: low, slow, in the openings and round the blooms of the near floor
 BIO.grid(48,0,Math.min(950,heroR),(x,z,d)=>.42*openK(x,z)*q,(x,y,z,d)=>{const rad=rr(3,9);if(!clearGround(x,z,rad))return;
  const n=ri(1,4),tint=vary(pick(PAL.bloom.concat([0x4a8ae0,0xe8d040,0xf0f0e8])),.04,.12,.08);
  for(let k=0;k<n;k++){const s=rr(.8,1.6);
   BIO.put('fly',[x,y+rr(1.2,4),z],null,s,tint.clone().offsetHSL(0,0,rr(-.06,.06)),{aP0:[x,y+rr(1.5,4),z,rad],aP1:[rr(.45,.95)*(rng()<.5?1:-1),rr(0,TAU),rr(.6,2),rr(.5,1)]});st.flies++;}},{patch:.8,patchScale:.02,pad:2});
 // 4. SPORE MOTES: glowing drift in the damp and along the brook banks
 BIO.grid(60,0,Math.min(800,heroR),(x,z,d)=>{const m=BIO.mask(x,z);return (m<1?.9:(damp(x,z)>.55?.5:0))*q;},(x,y,z,d)=>{if(!clearGround(x,z,3))return;
  const rad=rr(3,8),n=ri(30,60),cy=y+rr(1,4),tint=vary(pick([0xd8c860,0xb8e070,0xe0d090,0x90d8a0]),.03,.1,.05);
  for(let k=0;k<n;k++){BIO.put('mote',[x,cy,z],null,rr(.18,.4),tint.clone().offsetHSL(0,0,rr(-.15,.05)),{aP0:[x+rr(-rad,rad)*.5,cy,z+rr(-rad,rad)*.5,rad*rr(.4,1)],aP1:[rr(.25,.7),rr(0,TAU),rr(.6,2.4),rr(.5,1)]});st.motes++;}
  st.swarms++;},{patch:0,pad:2});
 // 5. STRIDER HERDS on the open floor between the boles
 const nHerd=Math.round(9*q);HERDS.length=0;
 BIO.scatter(nHerd,80,heroR-100,260,(x,y,z)=>{const r=rr(30,60);if(!BIO.clearOf(x,z,r+10)||!clearGround(x,z,20))return;
  const H={x:x,z:z,r:r,animals:[]},n=ri(4,9),tint=vary(pick([0x9a9e86,0xa8987a,0x8e9682,0xb0a48c]),.02,.08,.06);   // a stop light: untextured Lambert in bole shade
  for(let k=0;k<n;k++){let ax=x,az=z;for(let t=0;t<10;t++){const a=rr(0,TAU),d=r*.7*Math.sqrt(rng()),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(BIO.mask(px,pz)>0&&BIO.clearOf(px,pz,4)&&clearGround(px,pz,3)){ax=px;az=pz;break;}}
   const s=rr(4.6,6.4),A={i:0,x:ax,z:az,y:BIO.terrainH(ax,az),hdg:rr(0,TAU),speed:rr(1.3,2.1)*s/5.5,s:s,gait:rr(0,TAU),state:'graze',timer:rr(0,6)};
   A.i=BIO.items.strider.count;
   BIO.put('strider',[ax,A.y,az],qEuler(0,-A.hdg,0),s,tint.clone().offsetHSL(rr(-.01,.01),0,rr(-.06,.06)),{aP0:[ax,A.y,az,0],aP1:[A.gait,rr(0,TAU),0,0]});
   H.animals.push(A);st.striders++;}
  HERDS.push(H);st.herds++;REGI({name:'A herd of striders',kind:'fauna',label:'Striders',x:x,z:z,y:y-2,r:r+12,h:14});},{pad:40});
 if(HERDS.length&&!HERDS._ticked){HERDS._ticked=true;BIO.host.ticks(dt=>herdTick(dt));}
 // 6. BOUGH SLOTHS hanging under the big limbs of the near heroes
 (HYPERJUNGLE.TREES||[]).forEach(T=>{if(!T.hero||!T.perch||BIO.lodD(T.x,T.z)>1300)return;
  T.perch.forEach(P=>{if(P.r<1.5||P.y<T.y0+40||rng()>.14*q)return;const s=rr(2,3.4);
   BIO.put('sloth',[P.x+rr(-.3,.3)*P.r,P.y-P.r*.85,P.z+rr(-.3,.3)*P.r],qEuler(0,rr(0,TAU),0),s,vary(pick([0x5a4a38,0x6a5a44,0x4a4034]),.02,.08,.06));st.sloths++;});});
 const d=BIO.defs;
 return{fauna:st,faunaTris:st.rays*d.ray.tris+st.darts*d.dart.tris+st.flies*d.fly.tris+st.motes*d.mote.tris+st.striders*d.strider.tris+st.sloths*d.sloth.tris};};
})();
