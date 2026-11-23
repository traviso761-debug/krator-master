// ================================================================= HIGHLANDS / REPUBLICAN — Hydropower industrial works
// Water-driven proto-industrial mills and stream engineering of the Iron Republic's alpine cantons (Roketstad / Snou Bruk
// cascade): finery trip-hammer & water-blast forge, vertical reciprocating gang-sawmill, 5-stamp ore-crushing & washing
// battery, cantonal stone-and-log grist & fulling mill, plus modular stream works (stepped diversion weir, elevated timber
// headrace flume, twin-handwheel rack-and-pinion sluice gate).
// Slavic cantonal woodwork throughout: scalloped nalichniki, pierced prichelina eaves with polotentse sun-drops, crossed
// okhlupen'/konyok ridge finials, braided pletenka friezes, turned kubyshka porch columns, and wayside kapliczka hoods.
// Seeds 21401-21469. All rotating wheels and reciprocating mechanisms register in HLANIM (driven by 94-hl-anim.js).

if(typeof globalThis.HLANIM==='undefined')globalThis.HLANIM=[];

const HY_MATS={};
function hnHYMats(){
 if(HY_MATS.oak)return HY_MATS;
 HY_MATS.oak=new THREE.MeshStandardMaterial({color:0x6e533b,roughness:.84,metalness:.04});
 HY_MATS.wetOak=new THREE.MeshStandardMaterial({color:0x433326,roughness:.52,metalness:.06});
 HY_MATS.pine=new THREE.MeshStandardMaterial({color:0xb99362,roughness:.78,metalness:.02});
 HY_MATS.iron=new THREE.MeshStandardMaterial({color:0x2b2928,roughness:.46,metalness:.72});
 HY_MATS.steel=new THREE.MeshStandardMaterial({color:0x7c8288,roughness:.32,metalness:.84});
 HY_MATS.leather=new THREE.MeshStandardMaterial({color:0x583a26,roughness:.82,metalness:.04});
 HY_MATS.glow=new THREE.MeshStandardMaterial({color:0xff6a18,emissive:0xe84808,emissiveIntensity:1.35,roughness:.4});
 return HY_MATS;
}
MAT.hyRaceWater=hStd({color:0x2d5866,roughness:.22,metalness:.12});
MAT.hyFoam=hStd({color:0xdce8ec,roughness:.62,metalness:.02});
MAT.hyGlow=hStd({color:0xff6818,emissive:0xd84208,emissiveIntensity:1.1,roughness:.45});
MAT.hyMagnetite=hStd({color:0x363238,roughness:.68,metalness:.38});
kdef('hHYWater',VBOX,MAT.hyRaceWater);
kdef('hHYFoam',VBOX,MAT.hyFoam);
kdef('hHYGlow',VBOX,MAT.hyGlow);
kdef('hHYOre',new THREE.DodecahedronGeometry(1,0),MAT.hyMagnetite);

function hnHYMerge(geos){
 let nv=0,ni=0;
 for(const g of geos){nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;}
 const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),idx=new Uint32Array(ni);
 let vo=0,io=0;
 for(const g of geos){
  const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv,ix=g.index;
  pos.set(p.array,vo*3);if(n)nor.set(n.array,vo*3);if(u)uv.set(u.array,vo*2);
  if(ix){for(let k=0;k<ix.count;k++)idx[io++]=ix.getX(k)+vo;}
  else{for(let k=0;k<p.count;k++)idx[io++]=vo+k;}
  vo+=p.count;
 }
 const out=new THREE.BufferGeometry();
 out.setAttribute('position',new THREE.BufferAttribute(pos,3));
 out.setAttribute('normal',new THREE.BufferAttribute(nor,3));
 out.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 out.setIndex(new THREE.BufferAttribute(idx,1));
 for(const g of geos)g.dispose();
 return out;
}

/* Stamp world-space hydraulic contact coordinates onto G.userData.hydro for stream placement & verification. */
function hnHYStampHydro(G,o,H){
 const c=VERN.cur,s=(o.scale==null?1:o.scale),by=(o.y==null?0:o.y);
 const wp=loc(c.x,c.z,H.wheelX*s,(H.wheelZ==null?0:H.wheelZ)*s,c.ry);
 const fp=loc(c.x,c.z,H.wheelX*s,(H.flumeZ==null?-8:H.flumeZ)*s,c.ry);
 G.userData.hydro={
  kind:H.kind||'mill',
  wx:wp[0],wz:wp[1],ry:c.ry,baseY:by,
  wheelX:H.wheelX*s,wheelZ:(H.wheelZ==null?0:H.wheelZ)*s,
  hubY:by+H.hubY*s,wheelR:H.wheelR*s,wheelW:(H.wheelW==null?1.35:H.wheelW)*s,
  rimBottomY:by+(H.hubY-H.wheelR)*s,crownTopY:by+(H.hubY+H.wheelR)*s,
  targetWaterY:by+(H.waterY==null?.28:H.waterY)*s,
  flumeWx:fp[0],flumeWz:fp[1],flumeWy:by+(H.flumeY==null?H.hubY+H.wheelR+.16:H.flumeY)*s,
  raceW:(H.raceW==null?2.8:H.raceW)*s
 };
}

/* Overshot / breastshot spoked timber-and-iron waterwheel in local y-z plane, axle along local x from wheelX to shaftEndX.
   Flow along +z turns overshot wheel around +x (w > 0). Merged to 2 meshes (wetOak + iron) for minimal draw calls. */
function hnHYWheel(G,wheelX,hubY,wheelZ,R,W,shaftEndX,nSpokes,nBuckets,omega,cams){
 const M=hnHYMats(),WG=new THREE.Group();
 WG.position.set(wheelX,hubY,wheelZ);
 G.add(WG);
 const woodG=[],ironG=[];
 const axLen=Math.abs(wheelX-shaftEndX)+.7,axMid=(shaftEndX-wheelX)/2;
 woodG.push(new THREE.CylinderGeometry(.24,.24,axLen,10).rotateZ(Math.PI/2).translate(axMid,0,0));
 ironG.push(new THREE.CylinderGeometry(.28,.28,.22,10).rotateZ(Math.PI/2).translate(0,0,0));
 ironG.push(new THREE.CylinderGeometry(.27,.27,.18,10).rotateZ(Math.PI/2).translate(shaftEndX-wheelX,0,0));
 for(const sx of[-W/2+.08,W/2-.08]){
  woodG.push(new THREE.TorusGeometry(R-.14,.11,6,28).rotateY(Math.PI/2).translate(sx,0,0));
  woodG.push(new THREE.TorusGeometry(R*.56,.065,5,24).rotateY(Math.PI/2).translate(sx,0,0));
  ironG.push(new THREE.TorusGeometry(R-.02,.032,5,28).rotateY(Math.PI/2).translate(sx,0,0));
  for(let k=0;k<nSpokes;k++){
   const a=k/nSpokes*TAU;
   const g=new THREE.BoxGeometry(.09,R*1.92,.14).rotateX(a).translate(sx,0,0);
   if(k<nSpokes/2)woodG.push(g);else g.dispose();
  }
 }
 /* Sole drum & angled overshot bucket floats */
 woodG.push(new THREE.CylinderGeometry(R-.24,R-.24,W-.14,24,1,true).rotateZ(Math.PI/2));
 for(let k=0;k<nBuckets;k++){
  const a=k/nBuckets*TAU,rB=R-.11;
  const b1=new THREE.BoxGeometry(W-.16,.055,.36).rotateX(a+.42).translate(0,Math.cos(a)*rB,Math.sin(a)*rB);
  const b2=new THREE.BoxGeometry(W-.18,.045,.2).rotateX(a-.35).translate(0,Math.cos(a)*(rB-.12),Math.sin(a)*(rB-.12));
  woodG.push(b1,b2);
 }
 if(cams&&cams.length){
  for(const cm of cams){
   const cx=cm.x-wheelX,nC=cm.n==null?4:cm.n,cr=cm.r==null?.44:cm.r;
   ironG.push(new THREE.CylinderGeometry(cr,cr,.46,12).rotateZ(Math.PI/2).translate(cx,0,0));
   for(let k=0;k<nC;k++){
    const a=k/nC*TAU+(cm.phase==null?0:cm.phase);
    ironG.push(new THREE.BoxGeometry(.22,.16,.34).rotateX(a).translate(cx,Math.cos(a)*(cr+.11),Math.sin(a)*(cr+.11)));
   }
  }
 }
 mesh(hnHYMerge(woodG),M.wetOak,WG);
 mesh(hnHYMerge(ironG),M.iron,WG);
 HLANIM.push({o:WG,w:omega==null?1.15:omega,axis:'x',hydro:true});
 return WG;
}

/* Stone-revetted wheel-pit & optional showcase race + overhead timber penstock launder delivering onto wheel crown. */
function hnHYWheelRace(o,RX,RW,RL,hubY,wheelR,rub,ash,aged){
 const crownY=hubY+wheelR,flumeBedY=crownY+.12,zStart=-RL/2,zCrown=-.35;
 /* Wheel-pit ashlar cheek walls (always built: anchor the wheel bearings on both sheet and real stream) */
 vB('vStone',RX-(RW/2+.36),0,0,.72,1.45,wheelR*2.5,0,ash);
 vB('vStone',RX+(RW/2+.34),0,0,.68,1.25,wheelR*2.3,0,rub);
 /* Timber pillow-block bearing sill on outer cheek wall */
 vB('vWood',RX+(RW/2+.32),1.25,0,.48,Math.max(.3,hubY-1.35),1.5,0,aged);
 vB('vIron',RX+(RW/2+.16),hubY-.16,0,.38,.32,.56,0,hC(0x2b2928));
 if(!o.noFlume){
  /* Overhead timber penstock trough from upstream (-z) onto wheel crown, carried on braced larch bents */
  const fLen=Math.max(4.5,zCrown-zStart),fz=(zStart+zCrown)/2,tw=1.18,th=.58;
  vB('vWood',RX,flumeBedY,fz,tw,.1,fLen,0,aged);
  for(const sx of[-1,1])vB('vWood',RX+sx*(tw/2-.05),flumeBedY+.1,fz,.1,th,fLen,0,aged);
  for(let z=zStart+.8;z<=zCrown-.4;z+=2.4){
   vB('vWood',RX,flumeBedY+th+.1,z,tw+.24,.1,16/100,0,aged);
   for(const sx of[-1,1]){
    vPst('vPostB',RX+sx*.66,0,z,.1,flumeBedY,aged);
    vBeam([RX+sx*.66,flumeBedY*.55,z],[RX-sx*.66,flumeBedY-.08,z],.09,aged);
   }
  }
  /* Sheet of water inside penstock & falling splash jet onto overshot buckets */
  if(!o.dryFlume){
   vB('hHYWater',RX,flumeBedY+.1,fz,tw-.22,.34,fLen-.1,0);
   kput('hHYFoam',[RX,crownY-.18,zCrown+.52],qEuler(.48,0,0),[tw-.28,.18,1.15]);
   kput('hHYFoam',[RX,.42,wheelR*.78],null,[tw*.9,.22,1.6]);
  }
 }
 if(!o.noRace){
  /* Self-contained showcase stone race channel & tailwater strip (omitted when o.noRace=true on a live core/water stream) */
  for(const sx of[-1,1])vB('hRubB',RX+sx*(RW/2+.34),0,0,.68,1.05,RL,0,rub);
  vB('hHYWater',RX,0,0,RW,.28,RL,0);
  vB('hHYFoam',RX,.26,1.6,RW*.74,.06,3.4,0);
  /* Timber footbridge across race upstream of wheel */
  const bz=-RL/2+2.4;
  vB('vWood',RX,1.06,bz,RW+1.5,.14,1.35,0,aged);
  for(const sz of[-.58,.58])hnDeckRail([RX-RW/2-.7,1.2,bz+sz],[RX+RW/2+.7,1.2,bz+sz],1.2,aged,.88);
 }
}

// ================================================================= 1. WATER-POWERED FINERY FORGE (hl_rep_hydro_forge)
// Dressed stone wheel-wall + horizontal-log forge hall; overshot wheel drives a 4-cam oak helve trip-hammer pounding a
// glowing iron bloom on a bedded anvil, plus crank-driven twin leather blast-bellows feeding a twin-flue finery hearth.
function buildHlRepHydroForge(G,o){reseed(21401+(o.v|0));
 const W=11,D=13,S=1.2,H=4.0,RX=8.0,RW=2.8,RL=22,hubY=2.34,WR=2.2;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(.92),aged=hC(vPick(HPAL.aged)),rub=hC(vPick(HPAL.rubble)),
  ash=hC(vPick(HPAL.ashlar)),sh=hC(vPick(HPAL.shingle)),tile=hC(vPick(HPAL.roofRed)),
  trim=hC(vPick([HPAL.red,HPAL.ochre,HPAL.white])),iron=hC(0x2b2928);
 vnReg('Water-powered finery forge',0,0,10.5,S+H+6.2);
 vnReg('Finery forge wheel-race',RX,0,3.2,6.0);
 hnHYStampHydro(G,o,{kind:'mill',wheelX:RX,wheelZ:0,hubY,wheelR:WR,wheelW:1.4,waterY:.28,flumeY:hubY+WR+.12,flumeZ:-RL/2,raceW:RW});

 /* Stone plinth + heavy ashlar east wheel-wall (resisting axle vibration) + horizontal-log hall */
 hnSocle(0,0,0,W,S,D,0,rub,ash);
 hnLogBox(0,S,0,W,H,D,0,log,.28);
 vB('vStone',W/2-.18,S,0,.62,H,D-.4,0,ash);
 const top=hnGable(0,S+H,0,D,W,1.18,Math.PI/2,'hGableSc',tile,.72,'hGableLog',log);
 hnBarge(0,S+H,0,D,W,1.18*W/2,Math.PI/2,.72,trim,'horns');
 /* Ventilation ridge monitor over finery hearth */
 vB('vWood',-1.2,top-.45,-1.2,2.8,1.15,4.2,0,aged);
 hnGable(-1.2,top+.7,-1.2,4.2,2.8,.85,Math.PI/2,'vShingleB',sh,.32,'vGableW',aged);

 /* Open arched smithing bay on +z front so animated trip-hammer, glowing bloom, and bellows are clearly visible */
 hnRoom(.6,S,D/2-.9,5.4,3.1,2.2,0);
 for(const sx of[-2.9,3.9])vB('vStone',sx,S,D/2-.05,.65,3.25,.55,0,ash);
 vB('vWood',.5,S+3.1,D/2+.04,7.4,.34,.38,0,aged);
 hnFrieze(0,S+H-.32,D/2+.04,0,W-.8,.44);
 hnForm('hFormT',0,S+H+2.15,D/2+.04,0,2.4,1.15);
 hnSign(-W/2+.2,S+3.2,D/2+.05,0,'anvil',1.05);

 /* West road-side door & scalloped Slavic nalichniki windows + stairs down to yard */
 vnDoor(-W/2,S,2.2,-Math.PI/2,1.25,2.2,'vWood',aged,iron,false);
 vnStairs(-W/2-1.1,0,2.2,-Math.PI/2,1.8,S,4,'vStone',ash);
 for(const z of[-3.6,0])hnNal(-W/2,S+1.15,z,-Math.PI/2,.85,1.1,'lit',trim,{shutters:true});
 hnNal(-3.6,S+1.15,D/2,0,.85,1.1,'lit',trim,{shutters:true});
 for(const x of[-3.2,2.6])hnNal(x,S+1.15,-D/2,Math.PI,.85,1.05,'shut',trim,{});

 /* Twin dressed-stone finery hearth & tall banded iron-strapped chimneys on -z/-x corner */
 vB('hRubB',-2.6,S,-3.2,3.6,2.6,2.8,0,rub);
 vB('vStone',-2.6,S+2.6,-3.2,3.8,.22,3.0,0,ash);
 kput('hHYGlow',[-2.6,S+1.05,-1.72],null,[1.45,.42,.45]);
 hnStoneChimney(-3.4,top-2.4,-3.4,4.2,.95);
 hnStoneChimney(-1.6,top-2.8,-3.4,3.6,.78);

 /* Waterwheel + race + cam-shaft penetrating east ashlar wall */
 hnHYWheelRace(o,RX,RW,RL,hubY,WR,rub,ash,aged);
 hnHYWheel(G,RX,hubY,0,WR,1.42,1.35,8,18,1.25,[{x:2.25,n:4,r:.46},{x:4.1,n:2,r:.36,phase:.8}]);
 /* Lean-to shingle splash hood over axle entry */
 vnShedRoof(W/2+1.05,S+H-.65,0,5.8,2.1,.65,Math.PI/2,'vShingleB',sh,.28);

 /* Animated cam-lifted oak helve trip-hammer + stone-bedded anvil + glowing white-hot iron bloom */
 const M=hnHYMats(),anvilX=1.25,anvilZ=2.15;
 vB('vWood',anvilX,S,anvilZ,1.15,.68,1.15,0,aged);
 vB('vIron',anvilX,S+.68,anvilZ,.78,.44,.48,0,iron);
 kput('hHYGlow',[anvilX,S+1.18,anvilZ],null,[.46,.16,.26]);
 /* Fulcrum hurst frame for helve hammer */
 for(const sz of[-.52,.52])vPst('vPostB',3.45,S,anvilZ+sz,.18,2.45,aged);
 vB('vWood',3.45,S+2.35,anvilZ,.42,.28,1.45,0,aged);
 const HG=new THREE.Group();
 HG.position.set(3.45,S+1.72,anvilZ);
 G.add(HG);
 mesh(hnHYMerge([
  new THREE.BoxGeometry(2.85,.26,.26).translate(-1.05,0,0),
  new THREE.BoxGeometry(.42,.18,.22).translate(.52,.04,0)
 ]),M.oak,HG);
 mesh(hnHYMerge([
  new THREE.BoxGeometry(.44,.68,.38).translate(-2.2,-.28,0),
  new THREE.BoxGeometry(.22,.34,.34).translate(-1.05,0,0),
  new THREE.CylinderGeometry(.09,.09,1.2,8).rotateX(Math.PI/2).translate(0,0,0)
 ]),M.iron,HG);
 HLANIM.push({o:HG,hydro:true,fn:(t)=>{const u=(t*1.55)%1;const lift=u<.74?(u/.74):Math.max(0,1-(u-.74)/.08);HG.rotation.z=.28*lift;}});

 /* Animated twin leather blast-bellows beside finery hearth */
 for(let b=0;b<2;b++){
  const bx=-.45+b*1.05,bz=-2.15;
  vB('vWood',bx,S,bz,.75,.72,1.35,0,aged);
  vB('vIron',bx-.2,S+.82,bz-.78,.14,.14,.65,0,iron);
  const BG=new THREE.Group();
  BG.position.set(bx,S+.92,bz-.55);
  G.add(BG);
  mesh(new THREE.BoxGeometry(.78,.1,1.42).translate(0,.12,.65),M.oak,BG);
  mesh(new THREE.CylinderGeometry(.26,.34,.34,6).scale(1,1,1.7).translate(0,-.04,.68),M.leather,BG);
  const ph=b*.5;
  HLANIM.push({o:BG,hydro:true,fn:(t)=>{BG.rotation.x=-.14+.14*Math.sin((t*1.8+ph)*TAU);}});
 }

 /* Yard props: quench trough, stacked pig-iron bars, magnetite ore bin, charcoal sacks, wayside kapliczka */
 FURNISH('hl_rep_quench_trough',2.9,0,D/2+1.55,0,{v:1});
 FURNISH('hl_rep_anvil',-1.8,0,D/2+1.7,.3,{v:0});
 vB('vWood',-4.4,0,D/2+2.1,2.4,.75,1.6,0,aged);
 for(let k=0;k<6;k++)kput('hHYOre',[-4.9+(k%3)*.52,.65+Math.floor(k/3)*.28,D/2+2.1+((k%2)-.5)*.38],qEuler(k*.4,k*.9,0),[.32,.24,.28]);
 for(let r=0;r<3;r++)for(let j=0;j<4-r;j++)vB('vIron',3.8+j*.26+.12*r,r*.14,D/2+3.1,.22,.13,1.25,0,iron);
 hnSacks(-4.6,0,-D/2-1.5,5);
 hnWoodpile(-W/2-1.4,0,-2.8,Math.PI/2,3.6,1.5);
 hnTotemPole(-W/2-1.8,0,D/2+2.4,.2,3.4,0,true);
 vnFolk(1.4,D/2+3.2,2,1.6);
}

// ================================================================= 2. WATER-POWERED GANG SAWMILL (hl_rep_hydro_sawmill)
// Open-sided Slavic alpine log-and-frame gang-sawmill: overshot wheel + crank-pitman driving an animated vertical
// reciprocating multi-blade steel gang-saw sash slicing a spruce trunk on a railed timber carriage; sloped log-haul
// slipway from the millpond, fresh sawn plank stacks, okhlupen' gable crest.
function buildHlRepHydroSawmill(G,o){reseed(21411+(o.v|0));
 const W=10,D=16,S=1.2,H=3.9,RX=7.4,RW=2.8,RL=24,hubY=2.24,WR=2.1;
 const log=hC(vPick(HPAL.pine)),aged=hC(vPick(HPAL.aged)),fresh=hC(0xd4b07a),rub=hC(vPick(HPAL.rubble)),
  ash=hC(vPick(HPAL.ashlar)),sh=hC(vPick(HPAL.shingle)),trim=hC(vPick([HPAL.white,HPAL.ochre,HPAL.red])),iron=hC(0x2b2928);
 vnReg('Water-powered gang sawmill',0,0,11.5,S+H+5.8);
 vnReg('Gang sawmill wheel-race',RX,0,3.2,5.8);
 hnHYStampHydro(G,o,{kind:'mill',wheelX:RX,wheelZ:0,hubY,wheelR:WR,wheelW:1.35,waterY:.28,flumeY:hubY+WR+.12,flumeZ:-RL/2,raceW:RW});

 /* Raised rubble-and-ashlar basement housing crank pit + heavy timber-post open saw-floor above */
 hnSocle(0,0,0,W,S,D,0,rub,ash);
 /* Enclosed log sawyer's cabin at -x/-z quarter; open colonnaded sawing gallery along the carriage run */
 hnLogBox(-2.4,S,-4.2,4.8,H,6.6,0,log,.25);
 hnNal(-W/2,S+1.1,-4.2,-Math.PI/2,.8,1.05,'lit',trim,{shutters:true});
 vnDoor(-2.4,S,-.9,0,1.05,2.05,'vWood',log,aged,false);
 for(const sx of[-W/2+.22,W/2-.22]){
  for(let z=-D/2+.4;z<=D/2-.3;z+=3.1){
   if(sx<0&&z<-1.0)continue;
   hnTotemPost(sx,S,z,.17,H-.22,0,true);
  }
  vB('vWood',sx,S+H-.22,0,.28,.24,D+.2,0,aged);
  for(let z=-D/2+1.95;z<=D/2-1.2;z+=3.1){
   vBeam([sx,S+H-.18,z-1.1],[sx,S+H-.95,z-1.5],.12,aged);
   vBeam([sx,S+H-.18,z+1.1],[sx,S+H-.95,z+1.5],.12,aged);
  }
 }
 /* Steep shingle gable roof with pierced Slavic prichelina lace, rozetka gable crest & horse-head okhlupen' */
 hnGable(0,S+H,0,D,W,1.15,Math.PI/2,'vShingleB',sh,.78,'hGableLog',log);
 hnBarge(0,S+H,0,D,W,1.15*W/2,Math.PI/2,.78,trim,'lace');
 hnForm('hFormT',0,S+H+2.05,D/2+.04,0,2.3,1.1);
 hnForm('hFormT',0,S+H+2.05,-D/2-.04,Math.PI,2.3,1.1);
 hnSign(-W/2+.15,S+3.1,D/2-.3,-Math.PI/2,'axe',1.0);

 /* Waterwheel + race + lower crank-wheel under saw floor */
 hnHYWheelRace(o,RX,RW,RL,hubY,WR,rub,ash,aged);
 hnHYWheel(G,RX,hubY,0,WR,1.35,1.2,8,16,1.35,[{x:1.4,n:2,r:.42}]);

 /* Railed log-carriage track down the centre of the sawing deck + spruce trunk mid-cut */
 const cx=1.2;
 for(const ox of[-.58,.58])vB('vIron',cx+ox,S,0,.09,.12,D-1.2,0,iron);
 vB('vWood',cx,S+.12,-1.1,1.45,.18,6.8,0,aged);
 kput('hLogX',[cx,S+.62,-1.6],qEuler(0,Math.PI/2,0),[6.4,.38,.38],log);
 /* Freshly sawn planks fanning off the downstream end of the log */
 for(let k=0;k<5;k++)vB('vWood',cx-.32+k*.16,S+.34,2.85,.045,.52,3.4,0,fresh);

 /* Vertical fender-posts & animated reciprocating 5-blade steel gang-saw sash */
 for(const ox of[-.95,.95]){
  vPst('vPostB',cx+ox,S,0,.16,H-.1,aged);
  vB('vIron',cx+ox,S+.6,0,.08,2.7,.14,0,iron);
 }
 const M=hnHYMats(),SG=new THREE.Group(),sashBaseY=S+1.85;
 SG.position.set(cx,sashBaseY,0);
 G.add(SG);
 const sashWood=[
  new THREE.BoxGeometry(1.76,.16,.16).translate(0,.92,0),
  new THREE.BoxGeometry(1.76,.16,.16).translate(0,-.92,0),
  new THREE.BoxGeometry(.14,1.98,.14).translate(-.81,0,0),
  new THREE.BoxGeometry(.14,1.98,.14).translate(.81,0,0),
  new THREE.BoxGeometry(.14,1.35,.12).translate(0,-1.52,0)
 ];
 const sashSteel=[];
 for(let b=-2;b<=2;b++)sashSteel.push(new THREE.BoxGeometry(.022,1.72,.18).translate(b*.22,0,0));
 mesh(hnHYMerge(sashWood),M.oak,SG);
 mesh(hnHYMerge(sashSteel),M.steel,SG);
 HLANIM.push({o:SG,hydro:true,fn:(t)=>{SG.position.y=sashBaseY+Math.sin(t*4.6)*.38;}});

 /* Sloped timber log-haul slipway at -z end with iron haul chain + stacked fresh sticker-dried lumber in +z/-x yard */
 for(const ox of[-.75,.75])vBeam([cx+ox,S+.08,-D/2],[cx+ox,0,-D/2-4.6],.18,aged);
 for(let k=0;k<8;k++){const u=(k+.5)/8;vB('vWood',cx,lerp(S+.04,.04,u),lerp(-D/2,-D/2-4.5,u),1.75,.08,.36,0,aged);}
 kput('hLogX',[cx,.58,-D/2-2.2],qEuler(.25,Math.PI/2,0),[4.2,.34,.34],log);
 vnStairs(-2.6,0,D/2+.9,0,1.9,S,4,'vWood',aged);

 /* Stickered pine plank stacks in the front yard & barked round-log deck */
 for(const [sx,sz,nL] of[[-4.8,D/2+2.6,6],[2.8,D/2+2.9,5]]){
  vB('vStone',sx,0,sz,2.6,.18,3.8,0,rub);
  for(let lv=0;lv<nL;lv++){
   for(let p=0;p<4;p++)vB('vWood',sx-.84+p*.56,.18+lv*.19,sz,.48,.09,3.7,0,fresh);
   for(const oz of[-1.3,0,1.3])vB('vWood',sx,.27+lv*.19,sz+oz,2.4,.06,.08,0,aged);
  }
 }
 for(let k=0;k<4;k++)kput('hLogX',[-6.2,(.32+(k>2?.52:0)),2.0+(k%3)*1.05],qEuler(0,0,0),[4.6,.3,.3],log);
 hnWoodpile(-6.2,0,-3.5,Math.PI/2,3.4,1.4);
 vnFolk(-.8,D/2+3.6,2,1.5);
}

// ================================================================= 3. WATER-POWERED ORE STAMP MILL (hl_rep_hydro_stampmill)
// Heavy stone-and-log highland ore-crushing battery: overshot torque wheel turns a long oak cam-barrel lifting and
// dropping 5 staggered iron-shod vertical stamp-pestles in sequence over a coffer mortar-box, discharging crushed
// magnetite slurry down inclined riffled ore-washing buddle tables.
function buildHlRepHydroStampmill(G,o){reseed(21421+(o.v|0));
 const W=12,D=13,S=1.2,H=4.1,RX=8.4,RW=2.8,RL=22,hubY=2.34,WR=2.2;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(.88),aged=hC(vPick(HPAL.aged)),tar=hC(vPick(HPAL.tar)).multiplyScalar(1.2),
  rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),sh=hC(vPick(HPAL.shingle)),
  trim=hC(vPick([HPAL.ochre,HPAL.red,HPAL.white])),iron=hC(0x2b2928);
 vnReg('Water-powered ore stamp mill',0,0,11.0,S+H+6.0);
 vnReg('Stamp mill wheel-race',RX,0,3.2,5.8);
 hnHYStampHydro(G,o,{kind:'mill',wheelX:RX,wheelZ:0,hubY,wheelR:WR,wheelW:1.45,waterY:.28,flumeY:hubY+WR+.12,flumeZ:-RL/2,raceW:RW});

 /* Massive dressed-ashlar foundation block absorbing stamp blows + log upper battery hall */
 hnSocle(0,0,0,W,S,D,0,rub,ash);
 hnLogBox(0,S,-1.6,W,H,D-3.2,0,log,.28);
 /* Deep covered porch along +z exposing the 5-stamp battery & inclined washing tables */
 for(const sx of[-5.2,-1.8,1.8,5.2])hnTotemPost(sx,S,D/2-.35,.18,H-.2,0,true);
 vB('vWood',0,S+H-.22,D/2-.35,W+.2,.24,.32,0,aged);
 hnFrieze(0,S+H-.42,D/2-.18,0,W-.4,.42);
 hnGable(0,S+H,0,D,W,1.18,Math.PI/2,'vShingleB',sh,.74,'hGableLog',log);
 hnBarge(0,S+H,0,D,W,1.18*W/2,Math.PI/2,.74,trim,'horns');
 hnMural('hM_w_kolovrat',0,S+H+1.95,D/2+.04,0,2.5,1.25);
 hnSign(-W/2+.18,S+3.15,D/2-.35,0,'hammer',1.05);

 /* Doors, stairs & Slavic nalichnik windows */
 vnDoor(-4.0,S,D/2-3.2,0,1.2,2.15,'vWood',log,tar,false);
 vnStairs(-4.0,0,D/2+.85,0,1.8,S,4,'vStone',ash);
 for(const z of[-4.2,-.4])hnNal(-W/2,S+1.15,z,-Math.PI/2,.85,1.05,'lit',trim,{shutters:true});
 for(const x of[-3.6,0,3.6])hnNal(x,S+1.15,-D/2,Math.PI,.85,1.05,'shut',trim,{});

 /* Overshot torque wheel + race + spiral 5-station cam-barrel extending across the battery */
 hnHYWheelRace(o,RX,RW,RL,hubY,WR,rub,ash,aged);
 const stampZ=2.15,cams=[];
 /* Wheel is at z=0; counter-gear/cam barrel at z=stampZ driven via iron spur-gear pair inside east bay */
 hnHYWheel(G,RX,hubY,0,WR,1.45,3.8,8,18,1.2,[{x:4.4,n:6,r:.52}]);

 /* Rotating oak cam-barrel across the 5-stamp battery at z = stampZ - .48 */
 const M=hnHYMats(),CB=new THREE.Group();
 CB.position.set(.4,S+1.95,stampZ-.48);
 G.add(CB);
 const cbWood=[new THREE.CylinderGeometry(.24,.24,6.4,12).rotateZ(Math.PI/2)],cbIron=[];
 for(let k=0;k<5;k++){
  const sx=-2.2+k*1.1,a0=(k/5)*TAU;
  cbIron.push(new THREE.CylinderGeometry(.28,.28,.18,10).rotateZ(Math.PI/2).translate(sx,0,0));
  for(const da of[0,Math.PI]){
   const a=a0+da;
   cbIron.push(new THREE.BoxGeometry(.14,.14,.34).rotateX(a).translate(sx,Math.cos(a)*.34,Math.sin(a)*.34));
  }
 }
 mesh(hnHYMerge(cbWood),M.oak,CB);
 mesh(hnHYMerge(cbIron),M.iron,CB);
 HLANIM.push({o:CB,w:1.85,axis:'x',hydro:true});

 /* Heavy oak battery gallows frame, iron-bound coffer mortar-box, and 5 staggered animated iron-shod stamp pestles */
 vB('vWood',.4,S,stampZ,6.2,.95,1.25,0,tar);
 vB('vIron',.4,S+.88,stampZ,5.9,.14,1.3,0,iron);
 for(const sx of[-2.85,3.65])vPst('vPostB',sx,S,stampZ,.2,3.55,aged);
 for(const gy of[S+1.45,S+3.15])vB('vWood',.4,gy,stampZ,6.6,.22,.42,0,aged);
 for(let k=0;k<5;k++){
  const sx=-1.8+k*1.1,ph=k/5,PG=new THREE.Group(),pBaseY=S+.98;
  PG.position.set(sx,pBaseY,stampZ);
  G.add(PG);
  mesh(new THREE.BoxGeometry(.16,2.55,.16).translate(0,1.32,0),M.pine,PG);
  mesh(hnHYMerge([
   new THREE.BoxGeometry(.36,.46,.36).translate(0,.23,0),
   new THREE.BoxGeometry(.32,.16,.38).translate(0,1.02,-.16)
  ]),M.iron,PG);
  HLANIM.push({o:PG,hydro:true,fn:(t)=>{const u=(t*.92+ph)%1;const lift=u<.7?(u/.7):Math.max(0,1-(u-.7)/.08);PG.position.y=pBaseY+.46*lift;}});
 }

 /* Inclined riffled ore-washing buddle / sluice tables descending from mortar-box into settling launder */
 for(const tx of[-.9,1.7]){
  const a=[tx,S+.52,stampZ+.65],b=[tx,.28,D/2+3.6];
  vBeam(a,b,1.15,aged);
  for(const ox of[-.58,.58])vBeam([a[0]+ox,a[1]+.14,a[2]],[b[0]+ox,b[1]+.14,b[2]],.1,aged);
  for(let r=1;r<=6;r++){const u=r/7;vB('vWood',tx,lerp(a[1],b[1],u)+.09,lerp(a[2],b[2],u),1.05,.07,.08,0,tar);}
  kput('hHYWater',[tx,(a[1]+b[1])/2+.06,(a[2]+b[2])/2],qEuler(Math.atan2(a[1]-b[1],b[2]-a[2]),0,0),[.98,.05,Math.hypot(b[1]-a[1],b[2]-a[2])-.2]);
 }
 vB('vWood',.4,0,D/2+4.05,4.2,.48,.95,0,tar);
 vB('hHYWater',.4,0,D/2+4.05,3.9,.38,.72,0);

 /* Coarse magnetite ore hopper behind stamps + raw ore bin & concentrate barrels in yard */
 vB('vWood',.4,S+.95,stampZ-1.45,5.6,1.25,1.1,0,aged);
 for(let k=0;k<8;k++)kput('hHYOre',[-1.7+k*.58,S+2.22,stampZ-1.45+((k%2)-.5)*.25],qEuler(k*.5,k*.7,0),[.28,.22,.26]);
 vB('hRubB',-4.8,0,D/2+2.5,2.8,.82,2.2,0,rub);
 for(let k=0;k<7;k++)kput('hHYOre',[-5.5+(k%4)*.48,.78+Math.floor(k/4)*.26,D/2+2.5+((k%2)-.5)*.45],qEuler(k*.3,k*1.1,0),[.34,.25,.3]);
 hnBarrel(4.4,0,D/2+2.2,.38,.92);hnBarrel(5.2,0,D/2+2.5,.38,.92);
 hnCrate(4.6,0,D/2+3.5,.85,.25);
 vnFolk(-2.4,D/2+3.4,2,1.6);
}

// ================================================================= 4. CANTONAL WATER GRISTMILL (hl_rep_hydro_gristmill)
// Stone-plinth & saddle-notched horizontal-log izba cantonal grist & fulling mill: vaulted ashlar wheel-arch, overshot
// wheel driving visible oak crown-gear & granite runner millstone hurst, cantilevered gable sack-hoist hood with solar
// rozetka, pierced nalichniki, wool-fulling drying racks, and grain sacks.
function buildHlRepHydroGristmill(G,o){reseed(21431+(o.v|0));
 const W=9.6,D=12.4,S=1.25,H=3.9,H2=2.6,RX=6.9,RW=2.8,RL=22,hubY=2.24,WR=2.1;
 const log=hC(vPick(HPAL.pine)),aged=hC(vPick(HPAL.aged)),cream=hC(vPick(HPAL.stucco)),
  rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),sh=hC(vPick(HPAL.shingle)),
  trim=hC(vPick([HPAL.white,HPAL.red,HPAL.blue])),ochre=hC(HPAL.ochre),iron=hC(0x2b2928);
 vnReg('Cantonal water gristmill',0,0,10.0,S+H+H2+5.6);
 vnReg('Cantonal gristmill race',RX,0,3.2,5.8);
 hnHYStampHydro(G,o,{kind:'mill',wheelX:RX,wheelZ:0,hubY,wheelR:WR,wheelW:1.35,waterY:.28,flumeY:hubY+WR+.12,flumeZ:-RL/2,raceW:RW});

 /* Dressed granite plinth with arched tailrace vault + rendered lower storey + jettied Slavic log upper loft */
 hnSocle(0,0,0,W,S,D,0,rub,ash);
 hnStucco(0,S,0,W,H,D,0,cream,ash);
 hnJetty(0,S+H,0,W,D,0,aged,.38);
 hnLogBox(0,S+H,0,W+.5,H2,D+.5,0,log,.3);
 const yTop=S+H+H2;
 hnGable(0,yTop,0,D+.5,W+.5,1.22,Math.PI/2,'vShingleB',sh,.78,'hGableLog',log);
 hnBarge(0,yTop,0,D+.5,W+.5,1.22*(W+.5)/2,Math.PI/2,.78,trim,'lace');

 /* Cantilevered gable sack-hoist hood (kokoshnik / bochka shelter) with 8-petal solar rozetka & dangling flour sack */
 const hy=yTop+1.9,hz=D/2+.25;
 hnKokoshnik(0,yTop+.25,hz+.35,0,3.2,2.2,'hKeelSc',sh,true);
 vB('vWood',0,hy+.35,hz+.95,.24,.24,2.1,0,aged);
 vBeam([0,hy+.25,hz+1.85],[0,S+2.1,hz+1.85],.035,hC(0xb8a888),'vRope');
 kput('vSack',[0,S+1.85,hz+1.85],null,[.38,.44,.32],hC(0xd2c2a0));
 vnWin(0,yTop+.35,hz+.05,0,1.15,1.45,'shut','vWood',trim);
 hnMural('hM_w_rozetka',0,S+H+1.25,hz+.06,0,2.4,1.2);
 hnFrieze(0,S+H-.22,D/2+.05,0,W-.4,.42);

 /* Carved kryltso miller's porch at +z front + wide cart loading doorway + visible turning millstone hurst inside */
 hnRoom(1.2,S,D/2-.85,3.2,2.65,1.8,0);
 for(const sx of[-.5,2.9])vB('vStone',sx,S,D/2-.04,.46,2.75,.42,0,ash);
 vB('vStone',1.2,S+2.65,D/2-.04,3.8,.32,.44,0,ash);
 vnDoor(-2.2,S,D/2,0,1.25,2.2,'vWood',ash,aged,false);
 vnStairs(-2.2,0,D/2+1.05,0,1.9,S,4,'vStone',ash);
 for(const sx of[-3.15,-1.25])hnTotemPost(sx,S,D/2+.85,.15,2.55,0,true);
 vnGableRoof(-2.2,S+2.6,D/2+.48,2.4,1.4,.78,Math.PI/2,'vShingleB',sh,.28,'vGableW',ochre);

 /* Scalloped Slavic nalichniki on front, west road wall, and rear gable */
 hnNal(3.4,S+1.15,D/2,0,.85,1.1,'lit',trim,{shutters:true});
 for(const z of[-3.6,0,3.6]){
  hnNal(-W/2,S+1.15,z,-Math.PI/2,.85,1.1,'lit',trim,{shutters:true});
  hnNal(-W/2-.25,S+H+.65,z,-Math.PI/2,.78,.95,'glass',trim,{shutters:true});
 }
 for(const x of[-2.4,2.4])hnNal(x,S+1.15,-D/2,Math.PI,.85,1.05,'glass',trim,{});
 hnSign(-W/2+.12,S+3.35,D/2+.04,0,'sheaf',1.05);

 /* Animated vertical runner-stone spindle & wooden lantern pinion visible inside open loading arch */
 const M=hnHYMats(),msX=1.2,msZ=D/2-.95;
 vPst('vPostS',msX,S,msZ,.78,.48,ash);
 vB('vWood',msX,S+.48,msZ,1.72,.58,1.72,0,aged);
 const MG=new THREE.Group();
 MG.position.set(msX,S+1.12,msZ);
 G.add(MG);
 mesh(hnHYMerge([
  new THREE.CylinderGeometry(.68,.68,.26,16),
  new THREE.CylinderGeometry(.32,.32,.52,10).translate(0,.58,0),
  new THREE.BoxGeometry(.95,.1,.14).translate(0,.16,0)
 ]),M.pine,MG);
 mesh(new THREE.CylinderGeometry(.09,.09,1.45,8).translate(0,.62,0),M.iron,MG);
 HLANIM.push({o:MG,w:2.4,axis:'y',hydro:true});
 /* Grain hopper suspended above runner stone */
 vB('vWood',msX,S+1.88,msZ,.88,.55,.88,0,aged);

 /* Overshot waterwheel + race */
 hnHYWheelRace(o,RX,RW,RL,hubY,WR,rub,ash,aged);
 hnHYWheel(G,RX,hubY,0,WR,1.35,1.8,8,16,1.3,[{x:2.3,n:8,r:.56}]);

 /* Spare millstone leaning on plinth, wool-fulling drying racks, flour sacks, log trough */
 FURNISH('hl_rep_millstones',-W/2-.55,0,2.1,Math.PI/2);
 hnDryingRack(-4.8,0,D/2+2.9,0,3.8);
 hnSacks(2.8,0,D/2+2.1,6);
 hnBarrel(4.1,0,D/2+2.4,.36,.88);
 vnFolk(-1.8,D/2+3.3,2,1.4);
}

// ================================================================= 5. STREAM DIVERSION WEIR (hl_hydro_weir)
// Stepped granite-ashlar & larch-crib mountain diversion dam spanning across the stream (local x = span, flow +z):
// ice-breaker upstream cutwaters, lowered central overflow spillway crest with stepped stone apron, timber footbridge
// with Slavic rozetka rail, wayside kapliczka stream-warden shrine post, and side headrace leat intake portal.
function buildHlHydroWeir(G,o){reseed(21441+(o.v|0));
 const span=(o.span==null?18:o.span),spillW=Math.max(6,span*.46),wingW=(span-spillW)/2,crestY=2.35,wingH=3.35;
 const rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),aged=hC(vPick(HPAL.aged)),
  tar=hC(vPick(HPAL.tar)).multiplyScalar(1.2),trim=hC(vPick([HPAL.white,HPAL.ochre,HPAL.red])),iron=hC(0x2b2928);
 vnReg('Stream diversion weir',0,0,span*.58,wingH+3.6);
 hnHYStampHydro(G,o,{kind:'weir',wheelX:0,wheelZ:0,hubY:crestY,wheelR:0,waterY:crestY+.18,flumeY:crestY,flumeZ:0,raceW:spillW});

 /* Left & right dressed-granite wing-wall abutments + larch timber-crib backing */
 for(const sx of[-1,1]){
  const wx=sx*(spillW/2+wingW/2);
  vB('hRubB',wx,0,0,wingW,wingH-.22,4.4,0,rub);
  vB('vStone',wx,wingH-.22,0,wingW+.2,.24,4.6,0,ash);
  /* Upstream sloped granite ice-breaker nose */
  kput('vStone',[sx*(spillW/2+.45),wingH*.46,-2.45],qEuler(.35,Math.PI/4,0),[1.35,wingH*.92,1.35],ash);
  /* Timber crib ties on downstream face */
  for(let y=.55;y<wingH-.4;y+=.75)vB('vWood',wx,y,2.24,wingW-.3,.16,.18,0,tar);
 }
 /* Headrace leat intake arch cut through +x east wing-wall */
 const ix=spillW/2+wingW*.48;
 hnRoom(ix,.45,0,1.95,1.45,4.5,0);
 vB('vStone',ix,1.95,0,2.55,.34,4.65,0,ash);
 vB('vIron',ix,1.15,-2.28,2.05,1.45,.08,0,iron);

 /* Stepped central granite spillway body + downstream energy-dissipating stone apron */
 vB('vStone',0,0,-.45,spillW,crestY,2.5,0,ash);
 for(let st=0;st<4;st++){
  const sy=crestY*(1-(st+1)*.21),sz=1.15+st*.95;
  vB('vStone',0,0,sz,spillW+.2,sy,1.05,0,st%2?rub:ash);
 }
 vB('hRubB',0,0,5.1,spillW+1.6,.34,2.8,0,rub);
 if(!o.noRace){
  /* Impounded upstream headpond sheet, crest nappe, and foaming whitewater chute */
  vB('hHYWater',0,0,-3.4,span-.8,crestY+.16,3.6,0);
  kput('hHYWater',[0,crestY*.62,1.95],qEuler(.46,0,0),[spillW-.3,.22,4.4]);
  for(let st=0;st<4;st++)vB('hHYFoam',0,crestY*(1-(st+1)*.21)+.08,1.35+st*.95,spillW-.4,.14,.62,0);
  vB('hHYWater',0,0,5.2,span-.8,.42,3.0,0);
 }

 /* Timber footbridge spanning the spillway on stone piers with pierced Slavic balustrade & wayside kapliczka */
 const by=wingH+.05,nP=Math.max(2,Math.round(spillW/4.2));
 for(let i=0;i<=nP;i++){
  const px=-spillW/2+spillW*i/nP;
  vB('vStone',px,crestY,-.35,.58,by-crestY,1.65,0,ash);
 }
 vB('vWood',0,by,-.35,span-.4,.18,1.85,0,aged);
 for(const sz of[-1.18,.48]){
  kput('hLaceB',[0,by+.58,sz],null,[span-.6,.88,1],trim);
  vB('vWood',0,by+1.04,sz,span-.4,.1,.14,0,aged);
 }
 vnStairs(-span/2+.9,0,2.85,0,1.6,wingH,6,'vStone',ash);
 hnTotemPole(span/2-1.1,wingH,-1.35,.19,3.1,0,true);
}

// ================================================================= 6. TIMBER HEADRACE FLUME (hl_hydro_flume)
// Elevated braced alpine larch penstock trough on cross-braced trestle bents over dressed granite pad-stones, wrought-
// iron tie-rods across yoke caps, leat-tender's catwalk plank & handrail, and flowing water strip along +z.
function buildHlHydroFlume(G,o){reseed(21451+(o.v|0));
 const len=(o.len==null?16:o.len),tH=(o.trestleH==null?3.2:o.trestleH),TW=1.65,TH=.82;
 const aged=hC(vPick(HPAL.aged)),pine=hC(vPick(HPAL.pine)),tar=hC(vPick(HPAL.tar)).multiplyScalar(1.2),
  ash=hC(vPick(HPAL.ashlar)),trim=hC(vPick([HPAL.white,HPAL.ochre])),iron=hC(0x2b2928);
 vnReg('Timber headrace flume',0,0,Math.max(4.5,len*.52),tH+TH+1.8);
 hnHYStampHydro(G,o,{kind:'flume',wheelX:0,wheelZ:0,hubY:tH,wheelR:0,waterY:tH+.54,flumeY:tH,flumeZ:len/2,raceW:TW});

 /* Heavy plank trough + side cheeks + leat-tender inspection catwalk on -x side */
 vB('vWood',0,tH,0,TW+.16,.14,len,0,tar);
 for(const sx of[-1,1])vB('vWood',sx*(TW/2+.02),tH+.14,0,.12,TH,len,0,pine);
 vB('vWood',-(TW/2+.48),tH+.02,0,.72,.1,len,0,aged);
 hnDeckRail([-(TW/2+.82),tH+.12,-len/2+.2],[-(TW/2+.82),tH+.12,len/2-.2],tH+.12,trim,.92);

 /* Trestle bents & oak yoke collars every ~2.6 m */
 const nB=Math.max(2,Math.round(len/2.6));
 for(let i=0;i<=nB;i++){
  const z=-len/2+.4+(len-.8)*i/nB;
  /* Yoke frame clamping trough cheeks + iron tie-rod across top */
  for(const sx of[-1,1])vB('vWood',sx*(TW/2+.14),tH-.08,z,.16,TH+.34,.18,0,aged);
  vB('vWood',0,tH-.24,z,TW+1.55,.22,.24,0,aged);
  vB('vIron',0,tH+TH+.18,z,TW+.44,.06,.06,0,iron);
  if(tH>.45){
   const spread=.62+tH*.18;
   for(const sx of[-1,1]){
    vB('vStone',sx*spread,0,z,.68,.28,.68,0,ash);
    vBeam([sx*spread,.26,z],[sx*(TW/2+.22),tH-.22,z],.18,aged);
   }
   if(tH>1.6){
    const my=tH*.52,mw=lerp(spread,TW/2+.22,.52)*2+.18;
    vB('vWood',0,my,z,mw,.14,.16,0,aged);
    vBeam([-spread*.92,.35,z],[TW/2+.18,tH-.28,z],.11,aged);
    vBeam([spread*.92,.35,z],[-(TW/2+.18),tH-.28,z],.11,aged);
   }
  }
 }
 /* Longitudinal stringer braces between bents */
 for(let i=0;i<nB;i++){
  const z0=-len/2+.4+(len-.8)*i/nB,z1=-len/2+.4+(len-.8)*(i+1)/nB;
  if(tH>1.4)for(const sx of[-1,1]){
   vBeam([sx*(TW/2+.18),tH-.26,z0],[sx*(TW/2+.18),tH-.95,(z0+z1)/2],.11,aged);
   vBeam([sx*(TW/2+.18),tH-.26,z1],[sx*(TW/2+.18),tH-.95,(z0+z1)/2],.11,aged);
  }
 }
 if(!o.dryFlume){
  vB('hHYWater',0,tH+.14,0,TW-.12,.48,len-.06,0);
  vB('hHYFoam',0,tH+.61,0,TW*.52,.04,len*.88,0);
 }
}

// ================================================================= 7. TWIN-WHEEL SLUICE GATE (hl_hydro_sluice_gate)
// Dressed granite intake lock-chamber (clear waterway along z): upstream angled iron trash-rack screen, twin oak sluice
// paddles in cast-iron guides, twin spoked cast-iron handwheels with vertical rack-and-pinion stems under a pitched
// shingle Slavic kapliczka operator hood with prichelina lace and solar rozetka gable.
function buildHlHydroSluiceGate(G,o){reseed(21461+(o.v|0));
 const GW=3.0,CL=8.4,WH=2.65,HH=2.35;
 const rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),aged=hC(vPick(HPAL.aged)),
  tar=hC(vPick(HPAL.tar)).multiplyScalar(1.2),sh=hC(vPick(HPAL.shingle)),
  trim=hC(vPick([HPAL.red,HPAL.ochre,HPAL.white])),iron=hC(0x2b2928);
 vnReg('Twin-wheel sluice gate',0,0,5.6,WH+HH+2.6);
 hnHYStampHydro(G,o,{kind:'sluice',wheelX:0,wheelZ:0,hubY:WH,wheelR:0,waterY:.68,flumeY:.68,flumeZ:CL/2,raceW:GW});

 /* Dressed granite lock-chamber walls & paved stone invert */
 vB('vStone',0,0,0,GW+2.4,.24,CL,0,ash);
 for(const sx of[-1,1]){
  vB('hRubB',sx*(GW/2+.78),.24,0,1.56,WH-.44,CL,0,rub);
  vB('vStone',sx*(GW/2+.78),WH-.2,0,1.68,.24,CL+.2,0,ash);
  /* Splayed stone wing flares at upstream & downstream mouths */
  for(const sz of[-1,1])kput('vStone',[sx*(GW/2+1.25),(WH-.2)/2,sz*(CL/2+.35)],qEuler(0,sx*sz*.38,0),[1.1,WH,1.4],ash);
 }

 /* Upstream angled wrought-iron trash-rack grille catching driftwood & ice */
 const tz=-CL/2+1.25;
 vB('vIron',0,WH-.22,tz-.35,GW+.3,.12,.14,0,iron);
 for(let x=-GW/2+.18;x<=GW/2-.15;x+=.28)vBeam([x,.24,tz+.32],[x,WH-.22,tz-.35],.045,iron,'vIron');

 /* Central gate slot, cast-iron channel guides, central stone mullion & twin oak sluice boards */
 vB('vStone',0,.24,0,.38,WH-.24,1.1,0,ash);
 for(const gx of[-GW/2+.04,-.21,.21,GW/2-.04])vB('vIron',gx,.24,0,.1,WH+1.05,.18,0,iron);
 for(const sx of[-1,1]){
  const bx=sx*(GW/4+.1),lift=(sx<0?.42:.18);
  vB('vWood',bx,.24+lift,0,GW/2-.28,1.75,.14,0,tar);
  for(const by of[.55,1.25,1.85])vB('vIron',bx,by+lift,0,GW/2-.24,.08,.18,0,iron);
 }

 /* Operator bridge deck, Slavic kubyshka corner posts, shingle kapliczka hood, prichelina lace & rozetka */
 vB('vWood',0,WH+.04,0,GW+3.1,.16,2.8,0,aged);
 for(const sz of[-1.28,1.28])hnDeckRail([-(GW/2+1.4),WH+.2,sz],[GW/2+1.4,WH+.2,sz],WH+.2,trim,.88);
 vnStairs(-(GW/2+1.95),0,1.55,-Math.PI/2,1.3,WH+.04,6,'vStone',ash);
 for(const sx of[-1,1])for(const sz of[-1.1,1.1])hnTotemPost(sx*(GW/2+1.15),WH+.2,sz,.14,HH-.2,0,true);
 vB('vWood',0,WH+HH-.06,0,GW+2.65,.22,2.55,0,aged);
 hnGable(0,WH+HH+.16,0,2.7,GW+2.8,.95,Math.PI/2,'vShingleB',sh,.42,'vGableW',aged);
 hnBarge(0,WH+HH+.16,0,2.7,GW+2.8,.95*(GW+2.8)/2,Math.PI/2,.42,trim,'lace');
 if(KIT.defs.hM_d_sun){
  kput('hM_d_sun',[0,WH+HH+.95,1.42],null,[.95,.95,1]);
  kput('hM_d_sun',[0,WH+HH+.95,-1.42],qEuler(0,Math.PI,0),[.95,.95,1]);
 }

 /* Twin spoked cast-iron handwheels + rack-and-pinion vertical stems on heavy oak headstock beam */
 const M=hnHYMats(),hy=WH+1.18;
 vB('vWood',0,hy-.12,0,GW+.8,.26,.38,0,aged);
 for(const sx of[-1,1]){
  const wx=sx*(GW/4+.1);
  /* Vertical toothed rack stem rising above headstock */
  vB('vIron',wx,.9,0,.09,WH+1.55,.09,0,iron);
  vB('vIron',wx,hy+.08,0,.32,.26,.32,0,iron);
  const HW=new THREE.Group();
  HW.position.set(wx,hy+.26,.28);
  G.add(HW);
  const hwGeos=[
   new THREE.TorusGeometry(.42,.032,6,20),
   new THREE.CylinderGeometry(.08,.08,.16,8).rotateX(Math.PI/2),
   new THREE.CylinderGeometry(.024,.024,.18,6).rotateX(Math.PI/2).translate(0,.42,.09)
  ];
  for(let k=0;k<3;k++)hwGeos.push(new THREE.BoxGeometry(.038,.82,.038).rotateZ(k*Math.PI/3));
  mesh(hnHYMerge(hwGeos),M.iron,HW);
  const dir=sx;
  HLANIM.push({o:HW,hydro:true,fn:(t)=>{HW.rotation.z=Math.sin(t*.65)*dir*.55;}});
 }

 if(!o.noRace){
  vB('hHYWater',0,.24,-CL/4,GW,.76,CL/2,0);
  vB('hHYWater',0,.24,CL/4,GW,.42,CL/2,0);
  vB('hHYFoam',0,.66,.55,GW-.2,.08,1.3,0);
 }
 vnFolk(GW/2+.95,WH+.2,1,1.8);
}

// ================================================================= DEFINITIONS (branch: republican, family: Hydropower)
HL.def({
 key:'hl_rep_hydro_forge',name:'Water-powered finery forge',branch:'republican',family:'Hydropower',
 tags:{type:['industry'],wealth:'middle',lit:false},w:22,d:24,h:12,
 hydro:{kind:'mill',wheelX:8.0,wheelZ:0,hubY:2.34,wheelR:2.2,wheelW:1.42,waterY:.28,flumeY:4.66,flumeZ:-11,raceW:2.8},
 build:buildHlRepHydroForge
});
HL.def({
 key:'hl_rep_hydro_sawmill',name:'Water-powered gang sawmill',branch:'republican',family:'Hydropower',
 tags:{type:['industry'],wealth:'middle',lit:false},w:22,d:26,h:11,
 hydro:{kind:'mill',wheelX:7.4,wheelZ:0,hubY:2.24,wheelR:2.1,wheelW:1.35,waterY:.28,flumeY:4.46,flumeZ:-12,raceW:2.8},
 build:buildHlRepHydroSawmill
});
HL.def({
 key:'hl_rep_hydro_stampmill',name:'Water-powered ore stamp mill',branch:'republican',family:'Hydropower',
 tags:{type:['industry'],wealth:'middle',lit:false},w:24,d:24,h:12,
 hydro:{kind:'mill',wheelX:8.4,wheelZ:0,hubY:2.34,wheelR:2.2,wheelW:1.45,waterY:.28,flumeY:4.66,flumeZ:-11,raceW:2.8},
 build:buildHlRepHydroStampmill
});
HL.def({
 key:'hl_rep_hydro_gristmill',name:'Cantonal water gristmill',branch:'republican',family:'Hydropower',
 tags:{type:['farm','industry'],wealth:'middle',lit:false},w:20,d:24,h:14,
 hydro:{kind:'mill',wheelX:6.9,wheelZ:0,hubY:2.24,wheelR:2.1,wheelW:1.35,waterY:.28,flumeY:4.46,flumeZ:-11,raceW:2.8},
 build:buildHlRepHydroGristmill
});
HL.def({
 key:'hl_hydro_weir',name:'Stream diversion weir',branch:'republican',family:'Hydropower',
 tags:{type:['infrastructure'],wealth:'civic',lit:false},w:22,d:12,h:7,
 hydro:{kind:'weir',wheelX:0,wheelZ:0,hubY:2.35,wheelR:0,waterY:2.53,flumeY:2.35,flumeZ:0,raceW:8.28},
 build:buildHlHydroWeir
});
HL.def({
 key:'hl_hydro_flume',name:'Timber headrace flume',branch:'republican',family:'Hydropower',
 tags:{type:['infrastructure'],wealth:'civic',lit:false},w:8,d:18,h:6,
 hydro:{kind:'flume',wheelX:0,wheelZ:0,hubY:3.2,wheelR:0,waterY:3.74,flumeY:3.2,flumeZ:8,raceW:1.65},
 build:buildHlHydroFlume
});
HL.def({
 key:'hl_hydro_sluice_gate',name:'Twin-wheel sluice gate',branch:'republican',family:'Hydropower',
 tags:{type:['infrastructure'],wealth:'civic',lit:false},w:10,d:10,h:7,
 hydro:{kind:'sluice',wheelX:0,wheelZ:0,hubY:2.65,wheelR:0,waterY:.68,flumeY:.68,flumeZ:4.2,raceW:3.0},
 build:buildHlHydroSluiceGate
});
