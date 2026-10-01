// ================================================================= FOREST RING — the barrel arcology
// The second reading of SimCity 2000's forest arcology, and deliberately not
// the first one. src/71b-forest.js is a HEXAGON carrying a tower: six columns
// on a hexagonal plan with planted toruses staggered up and inward off them.
// This one is the other half of the same picture — the squat, tree-covered
// DRUM — and everything in it is a circle, because the Canopy already owns the
// hexagonal language and the brief for this type asked for genuine toruses.
//
// THE BARREL. One body of revolution carries the whole building. Its radius is
// 292 m where it meets the ground, swells to 404 m at the waist (y=240) and
// draws back to 336 m at the shoulder (y=600): a barrel standing on end, with
// a 112 m overhang at the belly that puts the whole plinth in its shade. The
// profile is two power curves meeting at the waist —
//
//     r(t) = RW - (RW-RFOOT)*((TW-t)/TW)^1.70        below the waist
//     r(t) = RW - (RW-RSH )*((t-TW)/(1-TW))^1.85     above it
//
// — with exponents above 1 so the curve is FLAT at the waist and steepens at
// both ends. That is what makes it read as a bilge rather than as a cone with
// a kink. 600 m to the shoulder on an 808 m beam is 0.74, and 780 m to the top
// of the lantern is 0.97: a thing standing ON END, which at the first pass's
// 520 m it emphatically was not — it read as an egg whatever the profile did.
// The surface is fluted into 48 staves with a rib on every flute crest, and
// five projecting hoop galleries ring it. Staves and hoops are what a barrel is
// made of, and they are also the right articulation for 600 m of drum: without
// them the belly is a blank field.
//
// THE CROWN, which is the point of the type. Three CIRCULAR toruses of forest,
// concentric with one another, with an inhabited terrace band between each
// pair. All six zones are 44 m wide, so no ring is a token green collar, and
// the OUTERMOST zone is forest rather than architecture — a stepped crown can
// only be seen into from above, so whatever sits at the rim is the only part of
// it a camera on the ground will ever see, and trees at the rim is the reading
// the source image is famous for. Outside in:
//
//     r 354..336   rim gallery, cantilevered off the shoulder     y 600
//     r 336..292   FOREST torus 0                                 y 600
//     r 292..248   LIVING band 0 — two terraces, 16 m each        y 600 -> 632
//     r 248..236   promenade, with band 0's head arcade on it     y 632
//     r 236..204   FOREST torus 1                                 y 632
//     r 204..160   LIVING band 1 — two terraces                   y 632 -> 664
//     r 160..148   promenade, with band 1's head arcade on it     y 664
//     r 148..116   FOREST torus 2                                 y 664
//     r 116.. 72   LIVING band 2 — two terraces                   y 664 -> 696
//     r  72.. 48   the lantern podium and its colonnade           y 696
//     r  48..  0   the lantern: a 30 m glazed drum, a 54 m dome   y 696 -> 780
//
// Each band is a TERRACED BANK, not a wall: every 22 m tread carries a row of
// dwellings backed against the riser above and fronted by a balcony over the
// drop, with a door, three bands of glazing, a parapet, a roof kerb and a roof
// garden on two blocks in five. Each band is headed by an arcade of piers and
// arches on a paved promenade at the rim of the forest above it. So from inside
// torus 0 you look inward at a 16 m storey of housing climbing out of the trees
// to a colonnade, and outward at the same thing in reverse. Eight radial stairs
// cut through all three bands on the same bearings, which is what keeps the
// overhead plan from being six concentric smears.
//
// The consequence of stepping the rings UP as they step IN is that the crown is
// a solid stepped mass, so none of it needs a soffit — the only hole through it
// is the 34 m atrium, which runs the full 678 m from the plaza on the plinth to
// the oculus in the lantern floor, galleried at fourteen levels on the way.
//
// DECAY. One radial sector has come down. The wedge is narrow at the shoulder
// and widens inward and upward (15 deg of arc at the rim, 43 deg at the
// lantern) because the upper terraces were carried by the lower ones and went
// first. The shoulder is notched under it, with teeth of standing fabric round
// the tear and the broken ends of the floor plates sticking into it; the dome
// is cut off at 52% of its height on a jagged line rather than merely
// perforated; and the debris is banked on the plinth below the breach.
TEX.ringLeaf=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),dt=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const n=fbm(x/8.2,y/8.2,2.7,3),n2=fbm(x/2.1,y/2.1,6.3,2);
  const shade=clamp((n2-.46)*3.0,0,1);
  let r=78+n*72+(n2-.5)*38,gg=112+n*102+(n2-.5)*34,b=48+n*44+(n2-.5)*20;
  r=lerp(r,r*.44,shade);gg=lerp(gg,gg*.46,shade);b=lerp(b,b*.48,shade);
  dt[i]=clamp(r,0,255);dt[i+1]=clamp(gg,0,255);dt[i+2]=clamp(b,0,255);dt[i+3]=255;}
 g.putImageData(id,0,0);});
MAT.ringCanopy=new THREE.MeshStandardMaterial({map:TEX.ringLeaf,color:0xffffff,roughness:1,metalness:0,side:DS});
// The forest floor is tinted toward moss rather than to bare earth: what shows
// between the crowns from 1300 m up is the ground, and a brown one turns three
// woods into three stripes of dirt with green speckle on them.
MAT.ringSoil=new THREE.MeshStandardMaterial({map:TEX.ringLeaf,color:0x36411f,roughness:1,metalness:0,side:DS});
MAT.ringSoilR=new THREE.MeshStandardMaterial({map:TEX.ringLeaf,color:0x2b3419,roughness:1,metalness:0,side:DS});
MAT.ringPave=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,
 color:0x8c8375,roughness:1,metalness:0,side:DS});
// A faceted ball reads as a ball however it is textured. Displacing the
// vertices ONCE, at definition time, costs nothing per instance. Icosahedron
// geometry is non-indexed in r128, so coincident vertices are separate entries
// — which is safe here precisely because the displacement is a function of
// position: duplicates move together and the shell stays closed.
// The displacement frequency is deliberately high (2.3 rather than the ~1.2 a
// distant silhouette wants): at 1.2 an 80-triangle icosahedron comes back as a
// smooth egg, and the first pass filled the terrace-level shots with green
// boulders. Three lobes across the ball is what makes it read as foliage when
// the camera is standing under it.
function frLump(geo,seed,amp){const p=geo.attributes.position,v=new THREE.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);
  const n=fbm(v.x*2.3+seed,v.y*2.3+v.z*1.4,seed*2.9,3);
  // the underside is pulled in harder than the top: a crown is a dome sitting
  // on a hollow, not an ellipsoid
  v.multiplyScalar(1+amp*(n-.5)*2-(v.y<0?amp*.42*(-v.y):0));
  p.setXYZ(i,v.x,v.y,v.z);}
 geo.computeVertexNormals();return geo;}
kdef('frBole',new THREE.CylinderGeometry(.16,.42,1,6).translate(0,.5,0),MAT.timber);
// Was four displaced icosahedra at 80/20 triangles; now the shared crossed-quad
// leaf card at 6, unit radius so it drops straight in. See THE LEAF CARD in
// 34-kitdefs.js — this type logged the coarse-canopy complaint against its own
// `frLump` and the fix belongs in shared code, not here.
kdef('frCrown',leafCardGeo(),MAT.leafCard);
kdef('frCrown2',leafCardGeo(),MAT.leafCard);
kdef('frScrub',leafCardGeo(),MAT.leafCard);
kdef('frScrub2',leafCardGeo(),MAT.leafCard);
// A colonnade post at 32 triangles rather than the kit's 480-triangle lathe:
// there are some 900 of them here and nobody counts the balusters.
kdef('frPost',new THREE.CylinderGeometry(.90,1.10,1,8).translate(0,.5,0),MAT.concrete);
kdef('frPostR',new THREE.CylinderGeometry(.90,1.10,1,8).translate(0,.5,0),MAT.concreteR);
// arcShape() fixes its parabola at 24 segments, which comes to 216 triangles an
// arch. This type places 445 of them — the five hoop galleries, the foot, the
// three head arcades — so at the kit's resolution the arches alone were 96 000
// triangles, a seventh of the whole budget, spent on the smoothness of a soffit
// that is never seen from closer than about 30 m. Same shape, same proportions,
// 8 segments: 88 triangles, and 57 000 back for the wheel.
function frArcGeo(W,Hh,t,D,N){const s=new THREE.Shape(),outer=[],inner=[];
 for(let i=0;i<=N;i++){const x=-W/2+W*i/N;outer.push([x,Hh*(1-Math.pow(2*x/W,2))]);}
 const Wi=W-2*t,Hi=Hh-t;
 for(let i=0;i<=N;i++){const x=-Wi/2+Wi*i/N;inner.push([x,Hi*(1-Math.pow(2*x/Wi,2))]);}
 s.moveTo(outer[0][0],0);outer.forEach(p=>s.lineTo(p[0],p[1]));s.lineTo(W/2,0);s.lineTo(Wi/2,0);
 for(let i=N;i>=0;i--)s.lineTo(inner[i][0],inner[i][1]);s.lineTo(-Wi/2,0);s.lineTo(-W/2,0);
 const g=new THREE.ExtrudeGeometry(s,{depth:D,bevelEnabled:false});g.translate(0,0,-D/2);return g;}
// 8 -> 14 segments once the leaf card had paid the budget back (ring/1 went
// from 96% of ceiling to 79%): at 8 the soffits were visibly faceted from
// directly underneath, which is where the foot and the hoop galleries are seen.
kdef('frArch',frArcGeo(20,26,2.6,7,14),MAT.concrete);
kdef('frArchR',frArcGeo(20,26,2.6,7,14),MAT.concreteR);
// The same argument for the doors. The kit's archOpen is arcWindowGeo at 12
// curve segments — 64 triangles — and there are some 680 doorways here, one on
// every terrace dwelling and every house in the wheel town. At 5 segments a
// 3 m door is 28 triangles and nobody can tell from the walkway.
function frDoorGeo(w,h,dep,N){const s=new THREE.Shape();
 s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2-w/2);
 for(let i=1;i<=N;i++){const a=Math.PI*i/N;s.lineTo(Math.cos(a)*w/2,h/2-w/2+Math.sin(a)*w/2);}
 s.lineTo(-w/2,-h/2);
 const g=new THREE.ExtrudeGeometry(s,{depth:dep,bevelEnabled:false});g.translate(0,0,-dep/2);return g;}
kdef('frDoor',frDoorGeo(6,9,1.2,9),MAT.dark);           // 5 -> 9, same reason
// The plan, published by the builder so the target's presets can be DERIVED
// from what was actually placed instead of guessed at. targets/ring/91z-views.js
// reads it; it loads after 90-scene.js, so the builder has already run.
let RINGPLAN=null;

function buildForestRing(scene,gx,gz,d){reseed(9480+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,skin=CONC(dd),BX=BOXC(d),SL=SLABC(d);
 const PIER=d>0?'frPostR':'frPost',AR=d>0?'frArchR':'frArch',PN=d>0?'paneD':'pane';
 const CAPC=new THREE.Color(d>0?0x6e6058:0xd4d0c8);
 const SH=[],GRD=[],LOAM=[],DK=[];

 // ---- the plan --------------------------------------------------------------
 // A barrel standing on end is taller than it is wide. The first pass was 520 m
 // to the shoulder on an 808 m beam — 0.64 — and came back reading as an egg or
 // a gasometer whatever the profile did. At 600 the barrel alone is 0.74 and
 // the whole mass, lantern included, is 0.97: upright, and the bulge still has
 // to do the work of saying which way up it is.
 const RFOOT=292,RW=404,RSH=336,HB=600,TW=.40,YW=HB*TW;
 // NTER 3 -> 2. At three terraces to a 32 m band the dwellings were 8-10 m
 // blocks on 14.7 m treads and read, correctly, as benches in an amphitheatre.
 // Two terraces gives a 16 m storey and a 22 m tread: blocks with three rows of
 // glazing and room for a walkway in front of the balconies.
 const RPL=520,PLY=18,RAT=34,NBAY=48,NTER=2;
 const CY0=HB,LANY=CY0+96,LANR=72,LDR=48,LANTOP=LANY+84;
 // THE WHEEL. The barrel is the axle. A 160 m wide ring hangs at y=300 — the
 // barrel's own mid-height — with 158 m of open air between its inner rim and
 // the drum, carried on three cones of struts off the hub and twelve pylons
 // stayed back to the shoulder. Nothing touches the ground between the two, so
 // a 1440 m disc is held off an 808 m drum exactly as a wheel is held off its
 // hub. WB is the town on the inner half, WF the wood on the outer half: from
 // outside the rim reads as a green wheel, and from the barrel's galleries you
 // look down on roofs with a wood behind them.
 // WDK is now the depth of the HALF-TORUS section — (WR1-WR0)/2 = 80 m — not a
 // slab thickness. The flat top is the deck; the underside is a true semicircle.
 const WY=300,WR0=560,WR1=720,WDK=(720-560)*.5;
 const WB0=WR0+8,WB1=636,WF0=644,WF1=WR1-6,WST=(WB0+WB1)*.5;
 const NSPOKE=24,NPYL=12;
 const BRf=y=>{const t=clamp(y/HB,0,1);
  if(t<=TW){const u=(TW-t)/TW;return RW-(RW-RFOOT)*Math.pow(u,1.70);}
  const u=(t-TW)/(1-TW);return RW-(RW-RSH)*Math.pow(u,1.85);};
 // r0/r1 are a torus's inner and outer radius; rf/rh a band's foot and head.
 // They interlock — RING[i].r0 === BAND[i].rf and BAND[i].rh === RING[i+1].r1 —
 // so the section is one continuous stepped profile with no gaps to patch, and
 // the six zones are all 44 m wide so no ring is a token green collar.
 //
 // THE OUTERMOST ZONE IS FOREST, at the rim, not architecture. The first pass
 // put a terrace band outside torus 0 and the whole crown vanished from every
 // view below about 35 degrees of elevation: a stepped crown can only be seen
 // into from above, so whatever is at the rim is the only part of it a camera
 // on the ground will ever see. Trees at the rim is also the reading the
 // source image is famous for — a drum with a wood on top.
 const RING=[{r0:292,r1:336,y:CY0},{r0:204,r1:248,y:CY0+32},{r0:116,r1:160,y:CY0+64}];
 const BAND=[{rf:292,rh:248,y0:CY0,y1:CY0+32},
             {rf:204,rh:160,y0:CY0+32,y1:CY0+64},
             {rf:116,rh: 72,y0:CY0+64,y1:LANY}];
 // Where each band's head arcade stands: at the RIM OF THE TORUS ABOVE IT,
 // eight metres inside the top terrace, so the colonnade rings the forest
 // instead of interpenetrating the top row of dwellings — which is what
 // putting it at rh+5 did.
 const RHEAD=[RING[1].r1-8,RING[2].r1-8,LDR+8];
 // the projecting hoop galleries, as fractions of the barrel so the flank keeps
 // its five horizontals whatever HB is set to
 const HOOPY=[HB*.185,YW,HB*.578,HB*.765,HB*.897];
 // The crown's top surface at any radius — used by the debris, the stairs and
 // the breach walls, all of which have to land ON the steps rather than at a
 // height somebody typed in.
 const crownY=rn=>{
  if(rn>=RING[0].r1)return RING[0].y;
  for(let i=0;i<3;i++){const B=BAND[i],R=RING[i];
   if(rn>=R.r0)return R.y;
   if(rn>=B.rh){const t=clamp((B.rf-rn)/(B.rf-B.rh),0,1);
    return B.y0+(B.y1-B.y0)*Math.min(NTER,Math.floor(t*NTER)+1)/NTER;}}
  return LANY;};
 // TANGENT. qEuler(0,-th,0) maps a kit item's local +X straight out along the
 // radius; every ring of wall segments written that way points AT the viewer
 // instead of running along the rim. The tangent is -th-PI/2, and TAN is the
 // only rotation this builder uses for a piece meant to follow a ring.
 const TAN=th=>qEuler(0,-th-Math.PI/2,0);
 const OUT=th=>qFacing([Math.cos(th),0,Math.sin(th)]);
 // A beam with its ROLL fixed. The kit's beam() leaves roll to
 // setFromUnitVectors, so a near-horizontal spoke or chord came out with its
 // cross-section at whatever angle the shortest arc happened to give — a
 // 9 x 11 strut read as a twisted plank. Here local X (the `w` axis, which is
 // the beam's DEPTH exactly as in beam()) is held in the vertical plane through
 // the beam and local Z (`dp`, its width) is horizontal, so every strut in the
 // wheel presents the same face to the same light.
 const _rbX=new THREE.Vector3(),_rbY=new THREE.Vector3(),_rbZ=new THREE.Vector3(),_rbM=new THREE.Matrix4();
 const rbeam=(a,b,w,dp,c)=>{_rbY.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const L=_rbY.length();
  if(!(L>1e-6))return;_rbY.multiplyScalar(1/L);
  _rbZ.set(-_rbY.z,0,_rbY.x);if(_rbZ.lengthSq()<1e-8)_rbZ.set(0,0,1);_rbZ.normalize();
  _rbX.crossVectors(_rbY,_rbZ);_rbM.makeBasis(_rbX,_rbY,_rbZ);
  kput(BX,[(a[0]+b[0])*.5,(a[1]+b[1])*.5,(a[2]+b[2])*.5],
   new THREE.Quaternion().setFromRotationMatrix(_rbM),[w,L,dp],c||null);};
 // THE BRIDGES' BEARINGS, needed before the shell is built because each one now
 // lands at a GATE in the barrel instead of at a balcony on a blank wall. The
 // offset BRO is TAU/48 = 4 of the shell lathe's 192 columns exactly, so every
 // bridge axis is a column boundary and the gate is two whole columns wide:
 // the hole, its frame and its tunnel all agree to the vertex.
 const NBRG=4,BRW=17,BRO=TAU/(NBAY);
 const BRTH=[];for(let k=0;k<NBRG;k++)BRTH.push(k/NBRG*TAU+BRO);
 const GCOL=TAU/192,GHW=GCOL,GY0=WY,GY1=WY+HB/72*3;        // gate: two columns, three rows
 const nearBr=(th,hw)=>{for(let k=0;k<NBRG;k++)if(Math.abs(wrapA(th-BRTH[k]))<hw)return true;return false;};

 // ---- decay: one radial sector of the crown has come down --------------------
 // The wedge is narrow at the shoulder and widens as it goes in and up, because
 // every band was carried by the torus outside it: the inner terraces had the
 // furthest to fall and took the most with them.
 const FRA=2.30,wrapA=a=>{let x=a;while(x>Math.PI)x-=TAU;while(x<-Math.PI)x+=TAU;return x;};
 const wedgeHW=rn=>{const t=clamp((rn-RAT)/(RSH-RAT),0,1);
  return(.13+.28*(1-t))*(1+.40*(fbm(rn*.021,t*3.1,9483,2)-.5));};
 const fell=(th,rn)=>d>0&&Math.abs(wrapA(th-FRA))<wedgeHW(rn);
 const fellXZ=(x,z)=>fell(Math.atan2(z,x),Math.hypot(x,z));
 // The wheel failed separately and on its own bearing — a rim held in tension
 // off a hub loses a whole sector when a spoke cone goes, not a wedge that
 // widens with radius. 1.30 rad round from the crown's breach: far enough
 // (74 degrees) that the two failures never read as one tear down the side of
 // the building, close enough that both are in frame at once from the ruin's
 // own preset. At the first setting of +2.55 the gap was always on the far
 // side of the barrel and no camera in the list ever saw it.
 const WA=FRA-1.30;
 const wgone=th=>d>0&&Math.abs(wrapA(th-WA))<(.33+.26*(fbm(th*2.1,4.4,9494,2)-.5));
 // The notch torn down the shoulder under the crown's breach. Factored out of
 // shellHole so the cutaway floors can be punched through exactly the same
 // sector the shell is: a floor plate that stops short of the tear, or runs
 // past it, is worse than no floor plate at all.
 const notch=(th,y)=>{if(!(d>0)||y<=HB-170)return false;
  const rn=lerp(RSH,RW,clamp((HB-y)/170,0,1));
  return Math.abs(wrapA(th-FRA))<wedgeHW(rn)*1.35*clamp((y-(HB-170))/170,0,1);};
 // The first pass ate the shell at d*.72 on a scale of 1.05, which on an 800 m
 // drum is a rash of 6 m dots: from any distance the ruin was the intact model
 // with one notch in it. 0.96 at scale 0.55 punches patches tens of metres
 // across, which is what a failing 500 m wall actually loses.
 const rot=holeFn(d*.96,9482,null,.55);

 // ---- registry ---------------------------------------------------------------
 REGISTER({name:'Forest Ring ('+STATE(d)+')',x:0,z:0,r:WR1*1.06,h:LANTOP+24});
 REGISTER({name:'Forest Ring — the wheel',x:0,z:0,y:WY-WDK-8,r:WR1+8,h:200});
 REGISTER({name:'Forest Ring — the wheel wood',x:0,z:0,y:WY-6,r:WF1+6,h:48});
 REGISTER({name:'Forest Ring — the wheel town',x:0,z:0,y:WY-6,r:WB1+5,h:46});
 // The barrel starts at the plinth's top surface, not at y=0: registered from
 // the ground it is smaller than the plinth's own cylinder and steals every
 // click on the paving between r=332 and r=434.
 REGISTER({name:'Forest Ring — the barrel',x:0,z:0,y:PLY-2,r:RW+30,h:HB+6});
 REGISTER({name:'Forest Ring — the waist gallery',x:0,z:0,y:YW-12,r:RW+26,h:30});
 REGISTER({name:'Forest Ring — the arcaded foot',x:0,z:0,r:RFOOT+40,h:62});
 REGISTER({name:'Forest Ring — outer forest torus',x:0,z:0,y:RING[0].y-6,r:RING[0].r1+18,h:62});
 REGISTER({name:'Forest Ring — outer terraces',x:0,z:0,y:BAND[0].y0-4,r:BAND[0].rf+6,h:46});
 REGISTER({name:'Forest Ring — middle forest torus',x:0,z:0,y:RING[1].y-6,r:RING[1].r1+6,h:60});
 REGISTER({name:'Forest Ring — middle terraces',x:0,z:0,y:BAND[1].y0-4,r:BAND[1].rf+6,h:46});
 REGISTER({name:'Forest Ring — inner forest torus',x:0,z:0,y:RING[2].y-6,r:RING[2].r1+6,h:58});
 REGISTER({name:'Forest Ring — inner terraces',x:0,z:0,y:BAND[2].y0-4,r:BAND[2].rf+6,h:46});
 REGISTER({name:'Forest Ring — the lantern',x:0,z:0,y:LANY-6,r:LANR+4,h:LANTOP-LANY+22});
 REGISTER({name:'Forest Ring — the atrium',x:0,z:0,y:PLY-2,r:RAT+8,h:LANY-PLY});
 REGISTER({name:'Forest Ring — the plinth',x:0,z:0,y:0,r:RPL,h:PLY+2});

 // ---- local vocabulary -------------------------------------------------------
 const lring=(cx,yy,cz,rn,n)=>{for(let j=0;j<n;j++){const th=(j+.5)/n*TAU;
   const L=TAU*rn/n*.92,on=d>0?(rng()<.10):true;
   kput('strip',[cx+Math.cos(th)*rn,yy,cz+Math.sin(th)*rn],TAN(th),[L,1,1],
    on?(d>0&&rng()<.5?CYAN.clone().multiplyScalar(.5):CYAN):DEAD);}};
 const folk=(cy,r0,r1,n,skip)=>{for(let j=0;j<n;j++){const th=rng()*TAU;
   const rn=Math.sqrt(lerp(r0*r0,r1*r1,rng()));
   const x=Math.cos(th)*rn,z=Math.sin(th)*rn;
   if(fellXZ(x,z)||(skip&&skip(th)))continue;
   kput('figB',[x,cy,z],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
   kput('figH',[x,cy,z],null,1,new THREE.Color(0xc9a17e));}};
 // A rib lying on the surface between two heights, leaning with it. The kit's
 // beam() aims a box from a to b but leaves the roll to setFromUnitVectors, so
 // a near-vertical rib keeps a world-aligned cross-section and the 48 staves
 // would each present a different face. Composing the yaw with a tangential
 // tilt instead keeps the rib 3 m proud and 6 m wide all the way round.
 const stave=(th,y0,y1,f,wd,dp)=>{const r0=BRf(y0)*f,r1=BRf(y1)*f;
  const dr=r1-r0,dy=y1-y0,L=Math.hypot(dr,dy);
  const q=qEuler(0,-th,0).multiply(qAxis(0,0,1,-Math.atan2(dr,dy)));
  kput(BX,[Math.cos(th)*(r0+r1)*.5,(y0+y1)*.5,Math.sin(th)*(r0+r1)*.5],q,[dp,L*1.02,wd],null);};
 // lightness raised with the move to the leaf card: the instance colour now
 // multiplies an sRGB map that already carries its own mid-green
 const leaf=()=>new THREE.Color().setHSL(rr(.17,.34),rr(.26,.50),d>0?rr(.30,.50):rr(.40,.66));
 const bark=()=>new THREE.Color().setHSL(rr(.05,.10),rr(.20,.42),rr(.14,.28));
 // ~130 triangles each: a six-sided bole that stops at 0.72h (at full height
 // its tip poked out of the crown as a bare stub on every tree in the forest),
 // one 80-triangle crown and one or two 20-triangle lobes hung off it.
 const tree=(x,y,z,hh)=>{
  kput('frBole',[x,y,z],qEuler(rr(-.05,.05),rng()*TAU,rr(-.05,.05)),[hh*.115,hh*.72,hh*.115],bark());
  const spire=rng()<.30,s0=hh*(spire?rr(.18,.26):rr(.33,.50)),vf=spire?rr(1.0,1.5):rr(.54,.82);
  kput(rng()<.5?'frCrown':'frCrown2',[x+rr(-.08,.08)*hh,y+hh*(spire?.62:.66),z+rr(-.08,.08)*hh],
   qEuler(rng()*3,rng()*3,rng()*3),[s0*rr(.95,1.3),s0*vf,s0*rr(.95,1.3)],leaf());
  const n=1+(rng()<.6?1:0);
  for(let k=0;k<n;k++){const s=s0*rr(.55,.88);
   kput(rng()<.5?'frScrub':'frScrub2',[x+rr(-.20,.20)*hh,y+hh*(spire?.44+k*.34:.50+k*.30),z+rr(-.20,.20)*hh],
    qEuler(rng()*3,rng()*3,rng()*3),[s*rr(.9,1.4),s*vf*rr(.7,1.1),s*rr(.9,1.4)],leaf());}};
 const scrub=(x,y,z,s)=>kput(rng()<.5?'frScrub':'frScrub2',[x,y+s*.3,z],
  qEuler(rng()*3,rng()*3,rng()*3),[s*rr(.9,1.6),s*rr(.4,.8),s*rr(.9,1.6)],leaf());
 // Soil is mounded by one fbm, sampled both by the loam surface and by every
 // tree, so trunks sit IN the ground instead of hovering over the swells.
 // THE EIGHT RADIAL STAIRS, declared here because the soil has to know where
 // they are. Each band's stair is a SLOT cut through its two treads and risers
 // on the bearing, a whole number of the 176 tread columns wide (the bearings
 // are column boundaries: 176/8 = 22), so the hole, its cheek walls and the
 // flight in it agree exactly. Before this the flights were twelve blocks laid
 // on a straight line from foot to head — which ran UNDER both treads, so from
 // anywhere but the plan they were invisible and nothing connected.
 const NST=8,SCOL=TAU/176,SHA=[3*SCOL,3*SCOL,2*SCOL];
 const stairOff=th=>{const f=th/TAU*NST;return Math.abs(f-Math.round(f))*TAU/NST;};
 const stairTh=(th,i)=>stairOff(th)<SHA[i===undefined?0:i]+.004;
 // A path through each wood to the foot of its stair: the soil runs out to
 // nothing across the stair's own width, so the flight lands on the deck and not
 // in a mound of loam.
 const soilAt=(x,z,i)=>{const s=1.1+2.0*fbm(x*.014,z*.014,9485+i,2);
  if(i>2)return s;
  return s*clamp((stairOff(Math.atan2(z,x))-SHA[i]+.006)/.03,0,1);};
 const plant=(i,r0,r1,y,per,nS)=>{
  const n=Math.max(6,Math.round(Math.PI*(r1*r1-r0*r0)/per));
  for(let j=0;j<n;j++){const th=rng()*TAU,rn=Math.sqrt(lerp(r0*r0,r1*r1,rng()));
   const x=Math.cos(th)*rn,z=Math.sin(th)*rn;
   if(fell(th,rn)||(i<3&&stairOff(th)<SHA[i]+.012))continue;
   const sy=y+soilAt(x,z,i);
   if(rng()<.78)tree(x,sy,z,rr(9,d>0?28:21));else scrub(x,sy,z,rr(2.2,5.6));}
  for(let j=0;j<(nS||0);j++){const th=rng()*TAU,rn=Math.sqrt(lerp(r0*r0,r1*r1,rng()));
   const x=Math.cos(th)*rn,z=Math.sin(th)*rn;
   if(fell(th,rn))continue;
   scrub(x,y+soilAt(x,z,i),z,rr(1.1,3.2));}};
 // The eight radial stairs. Cells and parapets leave a gap on these bearings,
 // so the bands are cut into eight blocks by eight streets rather than being
 // one unbroken ring of housing.

 // ---- the plinth -------------------------------------------------------------
 const plStep=rn=>rn<RFOOT?0:Math.min(3,1+Math.floor(clamp((rn-RFOOT)/(RPL-RFOOT),0,.999)*3));
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(RPL,0,Math.pow(v,.82));
  return[rn*Math.cos(th),PLY-5.2*plStep(rn),rn*Math.sin(th)];},128,24,{uS:52,vS:24}));
 for(let s=1;s<=3;s++){const rn=RFOOT+(RPL-RFOOT)*s/3;
  GRD.push(gridSurface((u,v)=>{const th=u*TAU;
   return[rn*Math.cos(th),PLY-5.2*(s-1)-5.2*v,rn*Math.sin(th)];},96,2,{uS:40,vS:2}));}
 apron(G,0,0,RPL,RPL*1.28,d,PLY-15.6-1.2);
 // 130 000 m2 of paving reads as a sheet of card without something on it: a
 // radial joint on every stave bearing, and low service blocks round the rim.
 for(let k=0;k<NBAY;k++){const th=k/NBAY*TAU;
  for(let s=0;s<3;s++){const a0=RFOOT+(RPL-RFOOT)*s/3+4,a1=RFOOT+(RPL-RFOOT)*(s+1)/3-4;
   if(d>0&&rng()<.34)continue;
   beam(BX,[Math.cos(th)*a0,PLY-5.2*s+.35,Math.sin(th)*a0],
        [Math.cos(th)*a1,PLY-5.2*s+.35,Math.sin(th)*a1],2.6,.7);}}
 for(let j=0;j<26;j++){const th=rng()*TAU,rn=rr(RFOOT+30,RPL-34);
  if(d>0&&rng()<.45)continue;
  const bh=rr(7,22),bw=rr(12,28);
  kput(BX,[Math.cos(th)*rn,PLY-5.2*plStep(rn)+bh*.5,Math.sin(th)*rn],TAN(th),[bw,bh,rr(10,22)],null);
  if(d===0)kput('strip',[Math.cos(th)*rn,PLY-5.2*plStep(rn)+bh+.7,Math.sin(th)*rn],TAN(th),[bw*.7,1,1],CYAN);}

 // ---- the barrel -------------------------------------------------------------
 // The shell is punched three ways: the great arcade at the foot, a band of
 // gallery openings behind every hoop, and the decay. All three are expressed
 // in the SAME bay grid as the flutes (48), and nu is a multiple of it, so an
 // opening is exactly half a bay wide instead of a ragged approximation of one.
 const shellHole=(u,y)=>{
  const th=u*TAU,f=(u*NBAY)%1;
  if(y>19&&y<57&&f>.16&&f<.84)return true;
  for(let i=0;i<HOOPY.length;i++){const hy=HOOPY[i];
   if(y>hy+3&&y<hy+16&&f>.24&&f<.76)return true;}
  if(notch(th,y))return true;
  if(y>GY0&&y<GY1&&nearBr(th,GHW))return true;               // the four bridge gates
  return rot?rot(u,y):false;};
 SH.push(lathe({rFn:BRf,H:HB,flutes:NBAY,amp:.022,sharp:2,nu:192,nv:72,hole:shellHole}));
 // The inner mass, so every one of those openings looks onto something — but
 // NOT across the notch. Left closed there it stood 24 m behind the tear and
 // hid every one of the cutaway floors behind a smooth grey cylinder, which is
 // exactly the "flat grey field" the section was added to fix.
 DK.push(lathe({rFn:y=>BRf(y)*.94,H:HB,nu:96,nv:44,
  hole:(u,y)=>notch(u*TAU,y)}));
 for(let fy=PLY+16;fy<HB-18;fy+=26){
  DK.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(RAT+4,BRf(fy)*.93,v);
   return[rn*Math.cos(th),fy,rn*Math.sin(th)];},72,3,{uS:26,vS:4,
   hole:(u,v)=>fbm(u*9,v*3+fy*.01,9484,2)<(d>0?.36:.13)}));}
 // the 48 staves
 for(let k=0;k<NBAY;k++){const th=k/NBAY*TAU;
  for(let s=0;s<16;s++){const y0=s*HB/16,y1=(s+1)*HB/16;
   if(d>0&&(rng()<.20||(y1>HB-170&&fell(th,BRf((y0+y1)*.5)))))continue;
   if(y1>GY0&&y0<GY1&&nearBr(th,.01))continue;               // not across a gate
   stave(th,y0,y1,1.030,6.0,3.0);}}
 // the window grid, in the flute troughs between the staves
 for(let row=0;row<48;row++){const y=52+row*12.2;if(y>HB-16)break;
  let near=false;for(let i=0;i<HOOPY.length;i++)if(Math.abs(y-HOOPY[i])<13)near=true;
  if(near)continue;
  const rn=BRf(y);
  for(let k=0;k<NBAY;k++)for(let q=0;q<2;q++){const th=(k+(q?.34:.66))/NBAY*TAU;
   if(d>0&&y>HB-170&&fell(th,rn))continue;
   if(rot&&rot(th/TAU,y))continue;
   if(rng()<(d>0?.40:.10))continue;
   // MAT.dot is unlit, so a pale instance colour is a sticker on the wall
   // rather than a window. The unlit ones are the near-black DEAD and the lit
   // ones stay well under 1 so ACES leaves them cyan instead of cream.
   const lit=d>0?rng()<.04:rng()<.52;
   kput('cell',[Math.cos(th)*(rn+.5),y,Math.sin(th)*(rn+.5)],OUT(th),[4.6,3.0,1],
    lit?CYAN.clone().multiplyScalar(rr(.22,.52)):DEAD);}}

 // ---- the bridge gates ----------------------------------------------------------
 // Each bridge used to arrive at a corbelled balcony on a blank stretch of drum:
 // a crossing to nowhere. Now the shell is open two columns wide and three rows
 // high behind every landing, a tunnel runs back through the 24 m of fabric to
 // the inner mass, and the end of it is a glazed screen into the hall. The
 // frame is a pair of jambs and a lintel standing proud of the flutes, because
 // a rectangular hole in a fluted wall with nothing round it reads as damage.
 for(let k=0;k<NBRG;k++){const bt=BRTH[k],ta=bt-GHW,tb=bt+GHW;
  const rIn=y=>BRf(y)*.94-.5,rOut=y=>BRf(y)*1.0056;
  for(const t of [ta,tb])SH.push(gridSurface((u,v)=>{const y=lerp(GY0,GY1,v),rn=lerp(rIn(y),rOut(y),u);
    return[rn*Math.cos(t),y,rn*Math.sin(t)];},3,3,{uS:4,vS:3}));
  SH.push(gridSurface((u,v)=>{const t=lerp(ta,tb,u),rn=lerp(rIn(GY1),rOut(GY1),v);
    return[rn*Math.cos(t),GY1,rn*Math.sin(t)];},2,3,{uS:3,vS:4}));
  SH.push(gridSurface((u,v)=>{const t=lerp(tb,ta,u),rn=lerp(rIn(GY0),rOut(GY0),v);
    return[rn*Math.cos(t),GY0,rn*Math.sin(t)];},2,3,{uS:3,vS:4}));
  const rS=rIn((GY0+GY1)*.5)+.6,wS=2*GHW*rS;
  kput('cell',[Math.cos(bt)*rS,(GY0+GY1)*.5,Math.sin(bt)*rS],OUT(bt),[wS*.96,GY1-GY0-1,1],
   d>0?DEAD:CYAN.clone().multiplyScalar(.30));
  for(let q=0;q<5;q++){const t=lerp(ta,tb,(q+.5)/5);
   kput(d>0?'mullR':'mullW',[Math.cos(t)*(rS+.4),(GY0+GY1)*.5,Math.sin(t)*(rS+.4)],qEuler(0,-t,0),[1.2,GY1-GY0,1.2],null);}
  const rJ=BRf((GY0+GY1)*.5)*1.0056+1.6;
  for(const t of [ta-1.6/rJ,tb+1.6/rJ])
   kput(BX,[Math.cos(t)*rJ,(GY0+GY1+4)*.5,Math.sin(t)*rJ],TAN(t),[3.4,GY1-GY0+4,5.2],null);
  kput(BX,[Math.cos(bt)*rJ,GY1+2.2,Math.sin(bt)*rJ],TAN(bt),[2*GHW*rJ+10,4.4,5.2],CAPC);
  if(d===0){kput('strip',[Math.cos(bt)*(rJ+2.8),GY1+.6,Math.sin(bt)*(rJ+2.8)],TAN(bt),[2*GHW*rJ,1,1],CYAN);
   kput('strip',[Math.cos(bt)*(rIn(GY1)+6),GY1-1.2,Math.sin(bt)*(rIn(GY1)+6)],TAN(bt),[2*GHW*rS*.8,1,1],CYAN);}}

 // ---- the hoop galleries ------------------------------------------------------
 const hoop=(hy,proj,dep,dwell)=>{const r0=BRf(hy),r1=r0+proj;
  SH.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(r0,r1,v);
   return[rn*Math.cos(th),hy-dep,rn*Math.sin(th)];},144,3,{uS:56,vS:3,
   hole:(u,v)=>d>0&&fell(u*TAU,lerp(r0,r1,v))}));
  SH.push(gridSurface((u,v)=>{const th=u*TAU;
   return[r1*Math.cos(th),hy-dep+v*dep,r1*Math.sin(th)];},144,2,{uS:56,vS:2,
   hole:u=>d>0&&fell(u*TAU,r1)}));
  SH.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(r1,r0,v);
   return[rn*Math.cos(th),hy,rn*Math.sin(th)];},144,3,{uS:56,vS:3,
   hole:(u,v)=>d>0&&fell(u*TAU,lerp(r1,r0,v))}));
  for(let k=0;k<NBAY;k++){const th=k/NBAY*TAU;
   if(d>0&&rng()<.24)continue;
   beam(BX,[Math.cos(th)*(r0-1)*1.0,hy-dep-proj*1.4,Math.sin(th)*(r0-1)],
        [Math.cos(th)*r1,hy-dep+.6,Math.sin(th)*r1],3.0,4.2);}
  const np=Math.max(24,Math.round(TAU*r1/10));
  for(let j=0;j<np;j++){const th=(j+.5)/np*TAU;
   if(d>0&&(fell(th,r1)||rng()<.24))continue;
   kput(BX,[Math.cos(th)*r1*1.002,hy+2.0,Math.sin(th)*r1*1.002],TAN(th),[TAU*r1/np*1.06,4.0,2.2],null);}
  if(d===0)lring(0,0+hy+4.4,0,r1*.99,Math.max(18,Math.round(TAU*r1/18)));
  // The openings behind the gallery get an arch and a lit recess on EVERY bay.
  // Left bare they are black rectangles punched in a white wall — the shell
  // hole and the inner mass 24 m behind it, with nothing to say which.
  for(let k=0;k<NBAY;k++){const th=(k+.5)/NBAY*TAU;
   if(d>0&&fell(th,r0))continue;
   // The arch has to FILL the hole. lathe's nv=72 rows are 8.3 m, so the
   // opening behind the gallery is two rows — 16.7 m — and a 12 m arch left a
   // 5 m band of raw black above every one of them.
   if(!(d>0&&rng()<.26))kput(AR,[Math.cos(th)*r0,hy+.4,Math.sin(th)*r0],OUT(th),
    [TAU*r0/NBAY*.52/20,17.6/26,1.5],null);
   if(d===0||rng()<.18)kput('cell',[Math.cos(th)*(r0-5),hy+5,Math.sin(th)*(r0-5)],OUT(th),
    [TAU*r0/NBAY*.42,5,1],CYAN.clone().multiplyScalar(rr(.16,.42)));}
  // dwellings hung under the deep galleries, on the same brackets
  if(dwell)for(let k=0;k<NBAY*2;k++){const th=(k+.5)/(NBAY*2)*TAU;
   if(d>0&&(fell(th,r1)||rng()<.34))continue;
   const bw=TAU*r1/(NBAY*2)*.86,rb=r1-3.5;
   kput(BX,[Math.cos(th)*rb,hy-dep-6,Math.sin(th)*rb],TAN(th),[bw,12,7],null);
   kput(PN,[Math.cos(th)*(rb+3.6),hy-dep-5,Math.sin(th)*(rb+3.6)],OUT(th),[bw*.56,5.0,1],null);
   kput(BX,[Math.cos(th)*(rb+5.4),hy-dep-11,Math.sin(th)*(rb+5.4)],TAN(th),[bw*.8,.6,4.4],CAPC);}
  folk(hy+.2,r0+3,r1-2,proj>12?20:10);};
 hoop(HOOPY[0],7,5,false);
 hoop(HOOPY[1],20,11,true);            // the waist gallery, at the barrel's widest
 hoop(HOOPY[2],7,5,false);
 hoop(HOOPY[3],14,8,true);
 hoop(HOOPY[4],10,6,false);

 // ---- THE WHEEL ----------------------------------------------------------------
 // A HALF-TORUS, not a slab. Flat side up — the deck the town and the wood
 // stand on — and the underside a true semicircle of minor radius 80 swept
 // round a major radius of 640, so the section closes onto the deck at both
 // rims by itself and needs no fascias. Seen from the plinth the ring is a
 // 160 m tube bulging 80 m below its own deck, which is a great deal more than
 // the 22 m slab it replaces, and it is the reason the spokes now land on a
 // curve instead of on a corner.
 const WRC=(WR0+WR1)*.5,WRT=(WR1-WR0)*.5;
 // the y of the tube surface at any radius — used by every strut, rib and
 // bridge that has to touch it
 const wSurf=rn=>WY-WRT*Math.sqrt(clamp(1-Math.pow((rn-WRC)/WRT,2),0,1));
 SH.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(WR1,WR0,v);
  return[rn*Math.cos(th),WY,rn*Math.sin(th)];},224,6,{uS:72,vS:6,hole:u=>wgone(u*TAU)}));
 SH.push(gridSurface((u,v)=>{const th=u*TAU,ph=v*Math.PI;
  const rn=WRC+WRT*Math.cos(ph);
  return[rn*Math.cos(th),WY-WRT*Math.sin(ph),rn*Math.sin(th)];},224,14,
  {uS:72,vS:12,hole:u=>wgone(u*TAU)}));
 // THE SECTION THROUGH THE WHEEL. The cut faces used to be two plain
 // half-discs in the shell's own pale concrete: the tube read as solid, which a
 // 160 m ring carrying a town is not. This tube has the depth a section needs —
 // 80 m under the deck — so the break now shows what it cut: seven floors of
 // pale slab, each with a dark soffit a metre under it, standing a few ragged
 // metres out of the tear, over a dark interior lined 36 m back to a cross wall.
 // The edges are found on the same 224-column grid every wheel surface uses,
 // so the section sits exactly where the shell, deck and loam stop.
 if(d>0){const N=224,i0=Math.floor(WA/TAU*N);let a=i0,b=i0;
  while(a>i0-N/2&&wgone((a-1+.5)/N*TAU))a--;
  while(b<i0+N/2&&wgone((b+1+.5)/N*TAU))b++;
  const WE=[[a/N*TAU,-1],[(b+1)/N*TAU,1]],dA=36/WRC;
  const hc=h=>WRT*Math.sqrt(clamp(1-Math.pow(h/WRT,2),0,1));   // half-chord at depth h
  WE.forEach((E,ei)=>{const tE=E[0],sgn=E[1],tIn=f=>tE+sgn*f*dA;
   // the lining, 1% inside the tube, and the underside of the deck
   DK.push(gridSurface((u,v)=>{const th=tIn(u),ph=v*Math.PI,rn=WRC+WRT*.985*Math.cos(ph);
    return[rn*Math.cos(th),WY-WRT*.985*Math.sin(ph),rn*Math.sin(th)];},4,14,{uS:6,vS:12}));
   DK.push(gridSurface((u,v)=>{const th=tIn(u),rn=lerp(WR0+1,WR1-1,v);
    return[rn*Math.cos(th),WY-1.0,rn*Math.sin(th)];},4,6,{uS:6,vS:6}));
   // the cross wall that closes the view 36 m in
   DK.push(gridSurface((u,v)=>{const ph=u*Math.PI,q=v,th=tIn(1);
    const rn=WRC+WRT*.99*q*Math.cos(ph),yy=WY-1-(WRT-1)*q*Math.sin(ph);
    return[rn*Math.cos(th),yy,rn*Math.sin(th)];},14,4,{uS:18,vS:8}));
   for(let f=1;f<=7;f++){const h=f*9.6,yf=WY-h,c=hc(h+1.2)*.985;
    if(c<6)break;
    const st=rr(2,7)/WRC,sd=9510+f*7+ei*3;
    const tP=u=>lerp(tE-sgn*st,tIn(1),u);
    SH.push(gridSurface((u,v)=>{const th=tP(u),rn=WRC+(v-.5)*2*c;
     return[rn*Math.cos(th),yf,rn*Math.sin(th)];},10,8,{uS:8,vS:8,
     hole:(u,v)=>{const out=st/(st+dA);return u<out&&fbm(v*6+f,u*3,sd,2)<.62*(1-u/out);}}));
    DK.push(gridSurface((u,v)=>{const th=tIn(u),rn=WRC+(.5-v)*2*c;
     return[rn*Math.cos(th),yf-1.1,rn*Math.sin(th)];},6,8,{uS:8,vS:8}));}
   // partitions between the floors, so the storeys read as rooms
   for(let q=0;q<6;q++){const hL=(2+Math.floor(rng()*5))*9.6,cL=hc(hL+1.2)*.985;
    const rn=WRC+rr(-.8,.8)*cL;
    if(cL<8)continue;
    DK.push(gridSurface((u,v)=>{const t2=lerp(tE-sgn*1.5/WRC,tIn(1),u);
     return[rn*Math.cos(t2),WY-hL+v*8.4,rn*Math.sin(t2)];},3,2,{uS:4,vS:2}));}});}
 // meridian ribs following the tube, like the hoops of the barrel turned
 // through ninety degrees. A bare 160 m tube soffit reads as a pipe.
 {const nR=NSPOKE*2;
  for(let k=0;k<nR;k++){const th=(k+.5)/nR*TAU;
   if(wgone(th))continue;
   for(let j=0;j<6;j++){const p0=j/6*Math.PI,p1=(j+1)/6*Math.PI;
    const r0=WRC+WRT*1.012*Math.cos(p0),r1=WRC+WRT*1.012*Math.cos(p1);
    rbeam([Math.cos(th)*r0,WY-WRT*1.012*Math.sin(p0),Math.sin(th)*r0],
         [Math.cos(th)*r1,WY-WRT*1.012*Math.sin(p1),Math.sin(th)*r1],3.0,4.0);}}}
 // THE SPOKES. Three cones: a radial strut in the plane of the deck, one stay
 // rising from 100 m below the hub and one falling from 110 m above it, so the
 // rim is triangulated against both bending directions instead of hanging off a
 // single row of cantilevers.
 // Every strut now terminates ON the tube, at a radius where wSurf() says there
 // is material above it, instead of at the corner of a slab that no longer
 // exists: the radial strut 20 m in from the rim where the section is already
 // 39 m deep, the lower stay 44 m in where it is 66 m deep.
 for(let k=0;k<NSPOKE;k++){const th=k/NSPOKE*TAU,cs=Math.cos(th),sn=Math.sin(th);
  if(wgone(th))continue;
  const snap=d>0&&rng()<.16;
  const rR=WR0+20,rL=WR0+44;
  const rE=snap?lerp(BRf(WY),rR,rr(.22,.62)):rR;
  const yE=snap?WY-26:wSurf(rR)+9;
  rbeam([cs*BRf(WY)*.99,WY-26,sn*BRf(WY)*.99],[cs*rE,yE,sn*rE],9,11);
  if(snap)continue;
  rbeam([cs*BRf(WY-100)*.99,WY-100,sn*BRf(WY-100)*.99],[cs*rL,wSurf(rL)+8,sn*rL],6,7);
  rbeam([cs*BRf(WY+110)*.99,WY+110,sn*BRf(WY+110)*.99],[cs*(WR0+3),WY-2,sn*(WR0+3)],5.5,6.5);}
 // ---- THE BRIDGES ---------------------------------------------------------------
 // Four of them, level, on the quarter bearings — 15 degrees clear of the
 // nearest pylon, which stands every 30 starting at 15. Until these went in the
 // struts were structure only and the 236 houses on the rim were on a ring
 // nobody could reach. Each springs from its own landing corbelled off the
 // barrel at deck level and lands inside the wheel's inner parapet.
 // Offset a half-bay (7.5 deg) off the quarter bearings. On the quarters they
 // shared a bearing with a spoke, and the spoke's upper stay — which descends
 // in the radial-vertical plane — came down the bridge's own centreline and
 // projected, from a camera standing on the deck, as a slab straight down the
 // middle of the view.
 for(let k=0;k<NBRG;k++){const th=k/NBRG*TAU+BRO,cs=Math.cos(th),sn=Math.sin(th);
  const tx=Math.cos(th+Math.PI/2),tz=Math.sin(th+Math.PI/2);
  const rA=BRf(WY)-6,rB=WR0+7;
  // in the ruin one span in four has gone, leaving both ends standing
  const cut=d>0&&rng()<.30,c0=lerp(rA,rB,rr(.30,.42)),c1=lerp(rA,rB,rr(.58,.72));
  const span=(u)=>lerp(rA,rB,u);
  const dead=u=>cut&&span(u)>c0&&span(u)<c1;
  // the landing on the barrel: a corbelled balcony with its own parapet
  SH.push(gridSurface((u,v)=>{const a=th+(u-.5)*.20,rn=lerp(BRf(WY)*1.0056,BRf(WY)+16,v);
   return[Math.cos(a)*rn,WY,Math.sin(a)*rn];},10,3,{uS:6,vS:3}));
  SH.push(gridSurface((u,v)=>{const a=th+(u-.5)*.20,rn=lerp(BRf(WY)+16,BRf(WY)-10,v);
   return[Math.cos(a)*rn,WY-7-5*Math.sin(Math.PI*v),Math.sin(a)*rn];},10,3,{uS:6,vS:3}));
  for(let j=0;j<5;j++){const a=th+(j/4-.5)*.19;
   rbeam([Math.cos(a)*(BRf(WY)-14),WY-30,Math.sin(a)*(BRf(WY)-14)],
        [Math.cos(a)*(BRf(WY)+15),WY-2,Math.sin(a)*(BRf(WY)+15)],2.6,3.4);}
  // the deck and its soffit
  SH.push(gridSurface((u,v)=>{const rn=span(u),w=(v-.5)*BRW;
   return[cs*rn+tx*w,WY,sn*rn+tz*w];},26,3,{uS:22,vS:3,hole:u=>dead(u)}));
  SH.push(gridSurface((u,v)=>{const rn=span(u),w=(.5-v)*BRW;
   return[cs*rn+tx*w,WY-3.4,sn*rn+tz*w];},26,3,{uS:22,vS:3,hole:u=>dead(u)}));
  for(let s=-1;s<=1;s+=2)SH.push(gridSurface((u,v)=>{const rn=span(u),w=s*BRW*.5;
   return[cs*rn+tx*w,WY-3.4*v,sn*rn+tz*w];},26,2,{uS:22,vS:2,hole:u=>dead(u)}));
  // the under-truss: a shallow arch, deepest at mid-span
  for(let s=-1;s<=1;s+=2){const w=s*BRW*.42,nS3=10;
   for(let j=0;j<nS3;j++){const u0=j/nS3,u1=(j+1)/nS3;
    if(dead((u0+u1)*.5))continue;
    const sag=u2=>WY-4-26*Math.sin(Math.PI*u2);
    rbeam([cs*span(u0)+tx*w,sag(u0),sn*span(u0)+tz*w],
         [cs*span(u1)+tx*w,sag(u1),sn*span(u1)+tz*w],2.4,3.0);}
   for(let j=1;j<nS3;j++){const u2=j/nS3;
    if(dead(u2))continue;
    rbeam([cs*span(u2)+tx*w,WY-26*Math.sin(Math.PI*u2)-4,sn*span(u2)+tz*w],
         [cs*span(u2)+tx*w,WY-3.4,sn*span(u2)+tz*w],1.8,2.2);}
   // THE DIAGONALS. Chord and verticals alone are a mechanism, not a truss —
   // the old under-truss was a sagging line of boxes the deck would fold
   // over. One diagonal a panel, running down toward mid-span on each half,
   // triangulates every bay.
   for(let j=0;j<nS3;j++){const u0=j/nS3,u1=(j+1)/nS3;
    if(dead((u0+u1)*.5))continue;
    const lo=u2=>[cs*span(u2)+tx*w,WY-26*Math.sin(Math.PI*u2)-4,sn*span(u2)+tz*w];
    const hi=u2=>[cs*span(u2)+tx*w,WY-3.4,sn*span(u2)+tz*w];
    if(j<nS3/2)rbeam(hi(u0),lo(u1),1.4,1.8);else rbeam(lo(u0),hi(u1),1.4,1.8);}}
  // and the two trusses tied to each other at every panel point, so the pair
  // is a box and not two fences
  for(let j=1;j<10;j++){const u2=j/10;
   if(dead(u2))continue;
   const yl=WY-26*Math.sin(Math.PI*u2)-4,w=BRW*.42;
   rbeam([cs*span(u2)-tx*w,yl,sn*span(u2)-tz*w],[cs*span(u2)+tx*w,yl,sn*span(u2)+tz*w],1.4,1.4);}
  // parapets, lamps and people on the crossing
  {const nP2=Math.round((rB-rA)/7);
   for(let s=-1;s<=1;s+=2)for(let j=0;j<nP2;j++){const u2=(j+.5)/nP2;
    if(dead(u2)||(d>0&&rng()<.22))continue;
    const w=s*BRW*.5;
    kput(BX,[cs*span(u2)+tx*w,WY+1.7,sn*span(u2)+tz*w],qEuler(0,-th,0),
     [(rB-rA)/nP2*1.08,3.4,1.6],null);}
   if(d===0)for(let j=0;j<nP2;j+=2){const u2=(j+.5)/nP2;
    kput('strip',[cs*span(u2),WY+3.6,sn*span(u2)],qEuler(0,-th,0),[(rB-rA)/nP2*.9,1,1],CYAN);}
   for(let j=0;j<(d>0?3:12);j++){const u2=rng();
    if(dead(u2))continue;
    const w=rr(-1,1)*BRW*.36,x=cs*span(u2)+tx*w,z=sn*span(u2)+tz*w;
    kput('figB',[x,WY,z],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
    kput('figH',[x,WY,z],null,1,new THREE.Color(0xc9a17e));}}
  // A portal arch where the bridge meets the rim. OUT(th), not OUT(th+PI/2):
  // qFacing puts local +z along the argument, so arcShape's W lands on the
  // tangent and its depth on the radius — the arch spans ACROSS the bridge and
  // you walk through it, rather than standing athwart the end like a wall.
  kput(AR,[cs*(rB-1),WY,sn*(rB-1)],OUT(th),[BRW*1.15/20,22/26,.9],null);
  if(cut)for(let j=0;j<40;j++){const u2=rr(.30,.72),w=rr(-1,1)*BRW*.7;
   const x=cs*span(u2)+tx*w,z=sn*span(u2)+tz*w,s2=rr(1.4,7);
   kput('rubble',[x,terrainH(KOFF[0]+x,KOFF[2]+z)+s2*.4,z],qEuler(rng()*3,rng()*3,rng()*3),
    [s2*rr(.7,1.5),s2*rr(.5,1),s2*rr(.7,1.5)],
    new THREE.Color().setHSL(rr(.04,.09),rr(.12,.32),rr(.18,.38)));}}

 // THE PYLONS, standing on the inner rim and stayed back to the shoulder.
 for(let k=0;k<NPYL;k++){const th=(k+.5)/NPYL*TAU,cs=Math.cos(th),sn=Math.sin(th);
  if(wgone(th)||(d>0&&rng()<.20))continue;
  const rp=WR0+26,PH=96;
  kput(BX,[cs*rp,WY+PH*.5,sn*rp],TAN(th),[15,PH,13],null);
  kput(BX,[cs*rp,WY+PH*.5,sn*rp],TAN(th),[9,PH*1.02,19],null);
  kput(SL,[cs*rp,WY+PH+2,sn*rp],null,[11,4,11],CAPC);
  rbeam([cs*rp,WY+PH,sn*rp],[cs*BRf(WY+130)*.99,WY+130,sn*BRf(WY+130)*.99],4.4,5);
  rbeam([cs*rp,WY+PH,sn*rp],[cs*(WR1-34),WY,sn*(WR1-34)],4.4,5);
  if(d===0){kput('strip',[cs*rp,WY+PH+4.8,sn*rp],TAN(th),[10,1,1],CYAN);
   kput('finial',[cs*rp,WY+PH+9,sn*rp],null,[3,7,3],null);}}
 // parapets on both rims
 [[WR1,1],[WR0,-1]].forEach(R3=>{const rw=R3[0],sg=R3[1];
  const nP=Math.max(40,Math.round(TAU*rw/11));
  for(let j=0;j<nP;j++){const th=(j+.5)/nP*TAU;
   if(wgone(th)||(d>0&&rng()<.26))continue;
   if(sg<0&&nearBr(th,(BRW*.5+2)/rw))continue;                // open where a bridge lands
   kput(BX,[Math.cos(th)*(rw+sg*1.6),WY+2.7,Math.sin(th)*(rw+sg*1.6)],TAN(th),
    [TAU*rw/nP*1.08,5.4,2.2],null);}
  if(d===0)lring(0,WY+4.6,0,rw+sg*2.6,Math.round(TAU*rw/19));});
 // THE WOOD on the outer half, in a raised bed with its own kerb
 LOAM.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(WF1,WF0,v);
  const x=rn*Math.cos(th),z=rn*Math.sin(th);
  return[x,WY+soilAt(x,z,3),z];},224,6,{uS:58,vS:5,hole:u=>wgone(u*TAU)}));
 LOAM.push(gridSurface((u,v)=>{const th=u*TAU,x=WF0*Math.cos(th),z=WF0*Math.sin(th);
  return[x,lerp(WY-.4,WY+soilAt(x,z,3),v),z];},224,2,{uS:58,vS:1,hole:u=>wgone(u*TAU)}));
 {const nK=Math.round(TAU*WF0/12);
  for(let j=0;j<nK;j++){const th=(j+.5)/nK*TAU,x=WF0*Math.cos(th),z=WF0*Math.sin(th);
   if(wgone(th)||(d>0&&rng()<.28))continue;
   kput(BX,[x,WY+soilAt(x,z,3)-.5,z],TAN(th),[TAU*WF0/nK*1.1,2.0,2.4],CAPC);}}
 // 450 m2 a plant was open woodland, not forest — it was sized when a tree
 // cost 130 triangles. On the leaf card it costs about 40, so the wood is now
 // planted at 240 m2 a plant and three in four a tree: some 1 070 plants for
 // ~20 000 triangles more than the old 570, and the canopy closes.
 {const a0=WF0+5,a1=WF1-5,n=Math.round(Math.PI*(a1*a1-a0*a0)/240);
  for(let j=0;j<n;j++){const th=rng()*TAU,rn=Math.sqrt(lerp(a0*a0,a1*a1,rng()));
   if(wgone(th))continue;
   const x=Math.cos(th)*rn,z=Math.sin(th)*rn;
   if(rng()<.75)tree(x,WY+soilAt(x,z,3),z,rr(9,d>0?26:20));
   else scrub(x,WY+soilAt(x,z,3),z,rr(2.2,6));}
  for(let j=0;j<170;j++){const th=rng()*TAU,rn=Math.sqrt(lerp(a0*a0,a1*a1,rng()));
   if(wgone(th))continue;
   const x=Math.cos(th)*rn,z=Math.sin(th)*rn;
   scrub(x,WY+soilAt(x,z,3),z,rr(1.2,3.4));}}
 // planting trails off the outer rim, 300 m above the ground
 {const nV=Math.round(TAU*WR1/(d>0?16:24));
  for(let j=0;j<nV;j++){const th=rng()*TAU;
   if(wgone(th))continue;
   kput('vine',[Math.cos(th)*WR1*1.004,WY-1,Math.sin(th)*WR1*1.004],
    qEuler(rr(-.12,.12),rng()*TAU,rr(-.12,.12)),[rr(1,2.2),rr(8,d>0?44:20),rr(1,2.2)],null);}}
 // THE TOWN on the inner half: two rows of small ancient buildings facing each
 // other across one circular street. Nothing here is arcology fabric — these
 // are separate little buildings with their own doors, and that is the point:
 // the wheel carries a village, not more of the barrel.
 const townBld=(x,z,th,fs)=>{
  const w=rr(13,22),dp=rr(11,17),h1=rr(8,17),kind=rng();
  kput(BX,[x,WY+h1*.5,z],TAN(th),[w,h1,dp],null);
  kput(SL,[x,WY+h1+1.1,z],null,[Math.max(w,dp)*.58,2.2,Math.max(w,dp)*.58],CAPC);
  if(kind<.26){const h2=rr(6,13);
   kput(SL,[x,WY+h1+h2*.5+1.6,z],null,[w*.30,h2,w*.30],null);
   if(d===0)kput('finial',[x,WY+h1+h2+5,z],null,[2.2,5,2.2],null);}
  const fx=x+Math.cos(th)*fs*(dp*.5+.3),fz=z+Math.sin(th)*fs*(dp*.5+.3);
  const fo=[Math.cos(th)*fs,0,Math.sin(th)*fs];
  if(kind>=.26&&kind<.56){
   for(let s2=-1;s2<=1;s2+=2){
    const tx=Math.cos(th+Math.PI/2)*s2*w*.30,tz=Math.sin(th+Math.PI/2)*s2*w*.30;
    kput(PIER,[fx+Math.cos(th)*fs*2.6+tx,WY,fz+Math.sin(th)*fs*2.6+tz],null,[1.5,h1*.70,1.5],null);}
   kput(BX,[fx+Math.cos(th)*fs*2.6,WY+h1*.74,fz+Math.sin(th)*fs*2.6],TAN(th),[w*.70,1.6,6],CAPC);}
  kput('frDoor',[fx,WY+2.1,fz],qFacing(fo),[.44,.42,.7],null);
  for(let p=0;p<2;p++)
   kput(PN,[fx,WY+h1*(.56+p*.26),fz],qFacing(fo),[w*.34,h1*.15,1],null);
  if(d===0&&rng()<.45)kput('strip',[fx,WY+h1-.9,fz],TAN(th),[w*.58,1,1],CYAN);};
 [[WST-20,1],[WST+20,-1]].forEach(R4=>{const rw=R4[0],fs=R4[1];
  const nB=Math.round(TAU*rw/32);
  for(let j=0;j<nB;j++){const th=(j+.5*(fs>0?0:1))/nB*TAU;
   if(wgone(th))continue;
   // a lane through the row every sixth plot, and the square at each bridge
   // head, where the inner row opens to let the crossing into the street
   if(j%6===3||nearBr(th,(fs>0?30:22)/rw))continue;
   if(d>0&&rng()<.34){if(rng()<.42)rubbleRing(Math.cos(th)*rw,WY,Math.sin(th)*rw,2,12,8,2.6);continue;}
   townBld(Math.cos(th)*rw,Math.sin(th)*rw,th,fs);}});
 if(d===0)lring(0,WY+1.2,0,WST,Math.round(TAU*WST/22));
 // THE GATE SQUARES. The bridge now lands in a square cut through the inner
 // row, paved in the cap stone, with a lamp-post ring and a watch tower on the
 // far side of the street closing the axis — the one landmark on the wheel
 // that can be read from the barrel, so each crossing has something to aim at.
 for(let k=0;k<NBRG;k++){const bt=BRTH[k],cs=Math.cos(bt),sn=Math.sin(bt);
  if(wgone(bt))continue;
  kput(SL,[cs*(WST-8),WY+.15,sn*(WST-8)],TAN(bt),[52,.3,44],CAPC);
  const tr=WST+22,TH=d>0?rr(18,30):44;
  kput(BX,[cs*tr,WY+TH*.5,sn*tr],TAN(bt),[14,TH,14],null);
  kput(SL,[cs*tr,WY+TH+1.2,sn*tr],TAN(bt),[17,2.4,17],CAPC);
  if(d===0){kput(BX,[cs*tr,WY+TH+7.4,sn*tr],TAN(bt),[8,10,8],null);
   kput('finial',[cs*tr,WY+TH+17,sn*tr],null,[3,7,3],null);
   kput('strip',[cs*(tr-7.4),WY+TH-4,sn*(tr-7.4)],TAN(bt),[10,1,1],CYAN);}
  kput('frDoor',[cs*(tr-7.2),WY+4.5,sn*(tr-7.2)],OUT(bt+Math.PI),[.9,1.0,.7],null);
  for(let q=0;q<8;q++){const a=bt+(q-3.5)*.011,rq=WST-8+((q%2)?-16:16);
   if(d>0&&rng()<.4)continue;
   kput(PIER,[Math.cos(a)*rq,WY,Math.sin(a)*rq],null,[.8,7,.8],null);
   if(d===0)kput('strip',[Math.cos(a)*rq,WY+7.4,Math.sin(a)*rq],null,[1.4,1.4,1.4],CYAN);}}
 folk(WY+.2,WST-14,WST+14,d>0?8:40);
 // what came down with the lost sector, on the ground 300 m below it
 if(d>0)for(let j=0;j<210;j++){const th=WA+rr(-.46,.46),rn=rr(WR0-70,WR1+50);
  const x=Math.cos(th)*rn,z=Math.sin(th)*rn,s2=rr(1.8,11);
  kput('rubble',[x,terrainH(KOFF[0]+x,KOFF[2]+z)+s2*.4,z],qEuler(rng()*3,rng()*3,rng()*3),
   [s2*rr(.7,1.6),s2*rr(.5,1),s2*rr(.7,1.6)],
   new THREE.Color().setHSL(rr(.04,.09),rr(.12,.32),rr(.16,.36)));}

 // ---- the arcaded foot --------------------------------------------------------
 // ht 44, so the arch reaches the top of the five-row opening the shell hole
 // punches between y=16.7 and y=58.3 rather than stopping 4 m short of it
 {const rA=BRf(30),ht=44;
  for(let k=0;k<NBAY;k++){const th=k/NBAY*TAU;
   if(d>0&&rng()<.16)continue;
   kput(BX,[Math.cos(th)*rA,PLY+ht*.5,Math.sin(th)*rA],TAN(th),[TAU*rA/NBAY*.34,ht,10],null);}
  for(let k=0;k<NBAY;k++){const th=(k+.5)/NBAY*TAU;
   if(d>0&&rng()<.22)continue;
   kput(AR,[Math.cos(th)*rA,PLY,Math.sin(th)*rA],OUT(th),[TAU*rA/NBAY*.94/20,(ht-4)/26,2.0],null);}
  if(d===0)lring(0,PLY+ht+3,0,rA*1.01,Math.round(TAU*rA/20));}

 // ---- the atrium --------------------------------------------------------------
 SH.push(lathe({rFn:()=>RAT,H:LANY-PLY,nu:72,nv:40,
  hole:holeFn(d*.5,9488,null,1.1)}).translate(0,PLY,0));
 for(let g2=0;g2<14;g2++){const y2=PLY+34+g2*((LANY-PLY-52)/14),n2=26;
  for(let j=0;j<n2;j++){const th=(j+.5)/n2*TAU;
   if(d>0&&rng()<.32)continue;
   kput(BX,[Math.cos(th)*(RAT-2.6),y2,Math.sin(th)*(RAT-2.6)],TAN(th),[TAU*RAT/n2*1.05,1.2,5.2],CAPC);
   kput(BX,[Math.cos(th)*(RAT-5.2),y2+1.7,Math.sin(th)*(RAT-5.2)],TAN(th),[TAU*RAT/n2*1.05,2.4,.6],null);
   if(rng()<(d>0?.16:.66))kput('cell',[Math.cos(th)*(RAT-.4),y2+4.6,Math.sin(th)*(RAT-.4)],
    qFacing([-Math.cos(th),0,-Math.sin(th)]),[TAU*RAT/n2*.82,4.4,1],
    CYAN.clone().multiplyScalar(rr(.34,.80)));}
  // The shaft is 598 m of board-formed concrete lit only by what comes down it,
  // so the galleries carry their own light. It goes UNDER the slab: a window on
  // the shaft wall above a gallery is hidden by that gallery from every camera
  // standing on the plaza, which is the only place anyone looks up from.
  if(d===0||rng()<.22)lring(0,y2-1.2,0,RAT-3.4,22);}
 for(let j=0;j<20;j++){const th=j/20*TAU;
  if(d>0&&rng()<.30)continue;
  kput(PIER,[Math.cos(th)*(RAT-9),PLY,Math.sin(th)*(RAT-9)],null,[2.6,16,2.6],null);}
 kput(SL,[0,PLY+17,0],null,[RAT-6,1.4,RAT-6],CAPC);
 if(d===0)lring(0,PLY+18.4,0,RAT-9,18);
 folk(PLY,4,RAT-12,14);

 // ---- the rim gallery, cantilevered off the shoulder ---------------------------
 {const rg0=RING[0].r1,rg1=RING[0].r1+18,gy=CY0;
  SH.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(rg0,rg1,v);
   return[rn*Math.cos(th),gy,rn*Math.sin(th)];},176,3,{uS:56,vS:3,
   hole:(u,v)=>fell(u*TAU,lerp(rg0,rg1,v))}));
  SH.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(rg1,rg0,v);
   return[rn*Math.cos(th),gy-7*Math.sin(Math.PI*.5*(1-v)),rn*Math.sin(th)];},176,3,{uS:56,vS:3,
   hole:(u,v)=>fell(u*TAU,lerp(rg1,rg0,v))}));
  for(let k=0;k<NBAY*2;k++){const th=(k+.5)/(NBAY*2)*TAU;
   if(fell(th,rg1)||(d>0&&rng()<.22))continue;
   beam(BX,[Math.cos(th)*(rg0-3),gy-19,Math.sin(th)*(rg0-3)],[Math.cos(th)*rg1,gy-1.2,Math.sin(th)*rg1],2.8,3.8);}
  const np=Math.round(TAU*rg1/9);
  for(let j=0;j<np;j++){const th=(j+.5)/np*TAU;
   if(fell(th,rg1)||(d>0&&rng()<.24))continue;
   kput(BX,[Math.cos(th)*rg1*1.003,gy+2.0,Math.sin(th)*rg1*1.003],TAN(th),[TAU*rg1/np*1.06,4.0,2.0],null);}
  if(d===0)lring(0,gy+4.4,0,rg1*.99,Math.round(TAU*rg1/17));
  folk(gy+.1,rg0+3,rg1-3,26);}

 // ---- the three living bands ----------------------------------------------------
 for(let i=0;i<3;i++){const B=BAND[i],dy=(B.y1-B.y0)/NTER;
  for(let k=0;k<NTER;k++){
   const rA=lerp(B.rf,B.rh,k/NTER),rB=lerp(B.rf,B.rh,(k+1)/NTER);
   const yA=B.y0+dy*k,yB=yA+dy;
   // the riser that holds this terrace up, and the tread it carries
   // Both are cut on the stair bearings: the riser right up, the tread for
   // five-sixths of its depth, leaving the last 3.7 m as the landing.
   SH.push(gridSurface((u,v)=>{const th=u*TAU;
    return[rA*Math.cos(th),lerp(yA,yB,v),rA*Math.sin(th)];},176,3,{uS:46,vS:2,
    hole:u=>fell(u*TAU,rA)||stairTh(u*TAU,i)}));
   SH.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(rA,rB,v);
    return[rn*Math.cos(th),yB,rn*Math.sin(th)];},176,6,{uS:46,vS:6,
    hole:(u,v)=>fell(u*TAU,lerp(rA,rB,v))||(stairTh(u*TAU,i)&&v<5/6)}));
   // the dwellings: a row backed against the riser above, fronted by a balcony
   const nC=Math.max(16,Math.round(TAU*rB/15));
   for(let j=0;j<nC;j++){const th=(j+.5*(k%2))/nC*TAU;
    if(fell(th,rB)||stairOff(th)<SHA[i]+8/rB)continue;
    if(d>0&&rng()<.30){if(rng()<.42)rubbleRing(Math.cos(th)*rB,yB,Math.sin(th)*rB,2,10,7,2.2);continue;}
    // cd is sized so the block, its balcony and the balcony rail all land
    // INSIDE the tread: rB + 13 + 4.6 < rB + 22, the terrace depth.
    const hh=dy*rr(.80,.95),cw=TAU*rB/nC*rr(.74,.94),cd=rr(9,13),rc=rB+cd*.5;
    kput(BX,[Math.cos(th)*rc,yB+hh*.5,Math.sin(th)*rc],TAN(th),[cw,hh,cd],null);
    const rf2=rB+cd+.35;
    // rows at .40/.62/.84 of the block, not .26/.52/.78: the lowest row sat
    // across the head of the door below it
    for(let p=0;p<3;p++)
     kput(PN,[Math.cos(th)*rf2,yB+hh*(.40+p*.22),Math.sin(th)*rf2],OUT(th),
      [cw*(p?.50:.30),hh*.14,1],null);
    // arcWindowGeo centres its shape on the origin, so a door placed at the
    // tread level is half buried in it; and archOpen is a SOLID slab, so set
    // just proud of the wall it stands off it like a headstone. Both fixed:
    // half its height up, and sunk until only the dark face shows.
    kput('frDoor',[Math.cos(th)*(rf2-.48),yB+2.1,Math.sin(th)*(rf2-.48)],OUT(th),[.50,.47,.8],null);
    kput(BX,[Math.cos(th)*(rf2+2.4),yB+hh*.52,Math.sin(th)*(rf2+2.4)],TAN(th),[cw*.82,.7,4.8],CAPC);
    kput(BX,[Math.cos(th)*(rf2+4.6),yB+hh*.52+1.3,Math.sin(th)*(rf2+4.6)],TAN(th),[cw*.82,2.2,.6],null);
    // roof parapet, and a roof garden on two blocks in five: this is an
    // arcology, and the planting does not stop at the edge of the wood
    kput(BX,[Math.cos(th)*rc,yB+hh+.6,Math.sin(th)*rc],TAN(th),[cw*1.02,1.2,cd*1.02],CAPC);
    if(rng()<.42)scrub(Math.cos(th)*(rc+rr(-2,2)),yB+hh+1.1,Math.sin(th)*(rc+rr(-2,2)),rr(1.6,3.6));
    if(d===0&&j%3===0)kput('strip',[Math.cos(th)*(rf2+.4),yB+hh-1.1,Math.sin(th)*(rf2+.4)],
     TAN(th),[cw*.86,1,1],CYAN);}
   // the parapet on the terrace edge
   const np=Math.max(20,Math.round(TAU*rA/9));
   for(let j=0;j<np;j++){const th=(j+.5)/np*TAU;
    if(fell(th,rA)||stairOff(th)<SHA[i]+4.6/rA)continue;
    if(d>0&&rng()<.26)continue;
    kput(BX,[Math.cos(th)*rA*1.004,yB+1.6,Math.sin(th)*rA*1.004],TAN(th),[TAU*rA/np*1.06,3.2,1.8],null);}
   if(d===0)lring(0,yB+3.6,0,rA*1.01,Math.max(18,Math.round(TAU*rA/16)));
   folk(yB+.1,rB+13,rA-3,i===0?30:18,th=>stairTh(th,i));}
  // the head arcade, standing at the rim of the torus above
  {const rh=RHEAD[i],nA=Math.max(14,Math.round(TAU*rh/18));
   for(let j=0;j<nA;j++){const th=j/nA*TAU;
    if(fell(th,rh))continue;
    if(d>0&&rng()<.26)continue;
    kput(PIER,[Math.cos(th)*rh,B.y1,Math.sin(th)*rh],null,[2.9,12,2.9],null);
    kput(BX,[Math.cos(th)*rh,B.y1+12.8,Math.sin(th)*rh],TAN(th),[TAU*rh/nA*1.08,3.0,6],null);}
   // Depth 0.62 (4.3 m), not 1.1 (7.7 m). At 7.7 m the colonnade filled the
   // whole 12 m promenade from front to back and there was nowhere on it a
   // camera could stand that was not inside an arch leg.
   for(let j=0;j<nA;j++){const th=(j+.5)/nA*TAU;
    if(fell(th,rh))continue;
    if(d>0&&rng()<.34)continue;
    kput(AR,[Math.cos(th)*rh,B.y1+1,Math.sin(th)*rh],OUT(th),[TAU*rh/nA*.96/20,11/26,.62],null);}
   if(d===0)lring(0,B.y1+13.6,0,rh,Math.max(16,Math.round(TAU*rh/17)));}}

 // ---- the eight radial stairs ----------------------------------------------------
 // One flight per terrace, in the slot the treads and risers leave for it:
 // twenty steps from the foot of each riser up to a 3.7 m landing on the tread
 // above, closed at the sides by cheek walls down to the pitch line, with a rail
 // on posts inside each cheek. Quads, one vertex set each, merged with the
 // shell: 88 triangles a flight.
 const quads=Q=>{const pos=[],uv=[],idx=[];let o=0;
  for(const q of Q){const a=q[0],b=q[1],c=q[2],e=q[3];
   pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],e[0],e[1],e[2]);
   const us=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])/8,vs=Math.hypot(e[0]-a[0],e[1]-a[1],e[2]-a[2])/8;
   uv.push(0,0,us,0,us,vs,0,vs);idx.push(o,o+1,o+2,o,o+2,o+3);o+=4;}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);g.computeVertexNormals();return g;};
 const PP=(rn,th,y)=>[rn*Math.cos(th),y,rn*Math.sin(th)];
 for(let s=0;s<NST;s++){const th0=s/NST*TAU;
  for(let i=0;i<3;i++){const B=BAND[i],dy=(B.y1-B.y0)/NTER,hw=SHA[i];
   if(fell(th0,(B.rf+B.rh)*.5))continue;
   for(let k=0;k<NTER;k++){
    const rA=lerp(B.rf,B.rh,k/NTER),rB=lerp(B.rf,B.rh,(k+1)/NTER),run=(rA-rB)*5/6;
    const yA=B.y0+dy*k,yB=yA+dy,NS=20,ta=th0-hw,tb=th0+hw;
    const Q=[];
    for(let n=0;n<NS;n++){const r0=rA-run*n/NS,r1=rA-run*(n+1)/NS;
     const y0=yA+dy*n/NS,y1=yA+dy*(n+1)/NS;
     Q.push([PP(r0,ta,y0),PP(r0,tb,y0),PP(r0,tb,y1),PP(r0,ta,y1)]);      // riser
     Q.push([PP(r0,ta,y1),PP(r0,tb,y1),PP(r1,tb,y1),PP(r1,ta,y1)]);}     // tread
    SH.push(quads(Q));
    // the cheek walls, from the pitch line up to the landing
    for(const t of [ta,tb])SH.push(gridSurface((u,v)=>{const rn=rA-run*u,ys=yA+dy*u;
      return PP(rn,t,lerp(ys,yB,v));},5,2,{uS:3,vS:2}));
    // the rails and their posts, a metre inside each cheek
    for(const sg of [-1,1]){if(d>0&&rng()<.45)continue;
     const tr=rn=>th0+sg*(hw-1.1/rn),yr=u=>yA+dy*u+dy/NS+1.1;
     rbeam(PP(rA,tr(rA),yr(0)),PP(rA-run,tr(rA-run),yr(1)),.35,.35,CAPC);
     for(let q=0;q<=4;q++){const u=q/4,rn=rA-run*u;
      kput(BX,PP(rn,tr(rn),yr(u)-.55),null,[.3,1.1,.3],null);}}
    if(d===0&&k===0)kput('strip',PP(rA+.6,th0,yA+.5),TAN(th0),[2*hw*rA*.8,1,1],CYAN);}
   // the foot of the flight: a paved apron where the path through the wood
   // meets it, so the first step lands on something built
   kput(SL,PP(B.rf+5,th0,B.y0+.25),TAN(th0),[2*hw*B.rf*.96,.5,10],CAPC);}}

 // ---- the three toruses of forest --------------------------------------------------
 // PWID is the paved promenade under a head arcade, and it is taken off the
 // torus's OUTER edge rather than out of its middle. Struck through the centre
 // (the first attempt) it cut each of the two inner woods into a pair of thin
 // green stripes, which is the one thing the plan view must not show.
 // 10 m, not 13: the promenade is taken out of the two inner toruses only, so
 // every metre of it makes them narrower than the outer one. At 13 they were
 // 23 m of planting against torus 0's 36 and the plan view showed it.
 const PWID=12;
 for(let i=0;i<3;i++){const R=RING[i],ra=i>0?RHEAD[i-1]:-1;
  const pOut=ra>0?R.r1-PWID:R.r1;                  // outer edge of the planting
  LOAM.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(pOut,R.r0,v);
   const x=rn*Math.cos(th),z=rn*Math.sin(th);
   return[x,R.y+soilAt(x,z,i),z];},176,10,{uS:42,vS:7,
   hole:(u,v)=>fell(u*TAU,lerp(pOut,R.r0,v))}));
  // the promenade is cut OUT of the soil, not laid over it: the loam stands
  // 1-3 m proud of the deck, so a path at deck level would be buried
  if(ra>0){SH.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(R.r1,pOut,v);
    return[rn*Math.cos(th),R.y,rn*Math.sin(th)];},176,3,{uS:42,vS:3,
    hole:(u,v)=>fell(u*TAU,lerp(R.r1,pOut,v))}));
   folk(R.y+.1,pOut+2,R.r1-2,d>0?4:22);}
  // The soil stands proud of the deck it lies on, so the bed needs a face at
  // its outer rim. Without it the deck and the loam are two sheets with
  // daylight between them at every grazing angle.
  LOAM.push(gridSurface((u,v)=>{const th=u*TAU,x=pOut*Math.cos(th),z=pOut*Math.sin(th);
   return[x,lerp(R.y-.4,R.y+soilAt(x,z,i),v),z];},176,2,{uS:42,vS:1,
   hole:u=>fell(u*TAU,pOut)}));
  // and a kerb on top of it, so the bed reads as built rather than tipped
  {const nK=Math.round(TAU*pOut/11);
   for(let j=0;j<nK;j++){const th=(j+.5)/nK*TAU,x=pOut*Math.cos(th),z=pOut*Math.sin(th);
    if(fell(th,pOut)||stairTh(th,i))continue;
    if(d>0&&rng()<.28)continue;
    kput(BX,[x,R.y+soilAt(x,z,i)-.5,z],TAN(th),[TAU*pOut/nK*1.1,2.0,2.4],CAPC);}}
  // 170 m2 a plant: dense enough that the canopies close and the plan view
  // reads as three woods rather than three mottled stripes, and no denser —
  // the wheel now wants a sixth of this type's whole triangle budget.
  plant(i,R.r0+4,pOut-4,R.y,[170,165,160][i],[210,140,95][i]);}
 // Planting spills over the terrace edges and hangs down the risers. The drop
 // in this section is at rA, the OUTER edge of every tread — the toruses
 // themselves are flat and have nothing to hang off.
 for(let i=0;i<3;i++){const B=BAND[i];
  for(let k=0;k<NTER;k++){const rA=lerp(B.rf,B.rh,k/NTER),yB=B.y0+(B.y1-B.y0)*(k+1)/NTER;
   const nV=Math.round(TAU*rA/(d>0?15:22));
   for(let j=0;j<nV;j++){const th=rng()*TAU;
    if(fell(th,rA)||stairTh(th))continue;
    kput('vine',[Math.cos(th)*rA*1.008,yB-.8,Math.sin(th)*rA*1.008],
     qEuler(rr(-.12,.12),rng()*TAU,rr(-.12,.12)),[rr(.9,1.9),rr(4,d>0?22:11),rr(.9,1.9)],null);}}}
 {const rg=RING[0].r1+18,nV=Math.round(TAU*rg/(d>0?12:20));
  for(let j=0;j<nV;j++){const th=rng()*TAU;
   if(fell(th,rg))continue;
   kput('vine',[Math.cos(th)*rg*1.004,CY0-2,Math.sin(th)*rg*1.004],
    qEuler(rr(-.12,.12),rng()*TAU,rr(-.12,.12)),[rr(1.0,2.2),rr(8,d>0?46:20),rr(1.0,2.2)],null);}}

 // ---- the lantern: a glazed drum and a ribbed dome on a circular podium ----------
 // The first pass made this a 34 m cap on a 600 m building, which from the air
 // read as a bathroom fitting. It is the hall the whole plan converges on, so
 // it is 144 m across, stands on its own podium at the head of band 2, and the
 // atrium runs down through the middle of it.
 {const DRH=30,DH=LANTOP-LANY-DRH;
  // The podium runs all the way in to the atrium, so the hall inside the drum
  // has a floor and the shaft ends as an oculus in the middle of it rather
  // than as a 24 m gap between the drum wall and the top of the shaft.
  SH.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(LANR,RAT,v);
   return[rn*Math.cos(th),LANY,rn*Math.sin(th)];},112,5,{uS:34,vS:5,
   hole:(u,v)=>fell(u*TAU,lerp(LANR,RAT,v))}));
  {const nO=32;for(let j=0;j<nO;j++){const th=(j+.5)/nO*TAU;
    if(d>0&&rng()<.34)continue;
    kput(BX,[Math.cos(th)*(RAT+1.6),LANY+1.5,Math.sin(th)*(RAT+1.6)],TAN(th),
     [TAU*RAT/nO*1.1,3.0,1.6],null);}
   if(d===0)lring(0,LANY+3.4,0,RAT+2.6,22);}
  SH.push(lathe({rFn:()=>LDR*1.02,H:DRH,nu:64,nv:4,
   hole:holeFn(d*.7,9491,null,1.3)}).translate(0,LANY,0));
  const nM=40;
  for(let j=0;j<nM;j++){const th=j/nM*TAU;
   if(d>0&&fell(th,LDR))continue;
   kput(d>0?'mullR':'mullW',[Math.cos(th)*LDR*1.05,LANY+DRH*.5,Math.sin(th)*LDR*1.05],
    qEuler(0,-th,0),[1.6,DRH,1.6],null);
   if(d===0)kput('pane',[Math.cos(th)*LDR*1.04,LANY+DRH*.52,Math.sin(th)*LDR*1.04],
    OUT(th),[TAU*LDR/nM*.92,DRH*.80,1],null);
   else if(rng()<.22)kput('paneD',[Math.cos(th)*LDR*1.04,LANY+rr(5,DRH-6),Math.sin(th)*LDR*1.04],
    OUT(th),[TAU*LDR/nM*.92,rr(5,12),1],null);}
  // The ruined dome is HALF GONE, not merely perforated: holeFn tops out near
  // a third of the quads at d=1, which on a dome reads as a colander. A jagged
  // cut at 52% of its height is what a fallen dome actually leaves.
  SH.push(lathe({rFn:y2=>LDR*1.02*Math.pow(clamp(1-Math.pow(y2/DH,2.0),0,1),.52)+.8,
   H:DH,cut:d>0?DH*.52:DH,jag:d>0?DH*.15:0,seed:9492,flutes:20,amp:.07,sharp:2,nu:60,nv:14,
   hole:holeFn(d*1.25,9487,null,1.7)}).translate(0,LANY+DRH,0));
  if(d>0)for(let j=0;j<70;j++){const th=rng()*TAU,rn=rr(RAT+3,LANR-4);
   const s2=rr(1.0,5);
   kput('rubble',[Math.cos(th)*rn,LANY+s2*.4,Math.sin(th)*rn],qEuler(rng()*3,rng()*3,rng()*3),
    [s2*rr(.7,1.5),s2*rr(.5,1),s2*rr(.7,1.5)],
    new THREE.Color().setHSL(rr(.05,.09),rr(.1,.3),rr(.2,.42)));}
  if(d===0){kput('finial',[0,LANTOP+11,0],null,[6,14,6],null);lring(0,LANY+DRH+1.6,0,LDR*.98,26);}
  for(let j=0;j<14;j++){const th=j/14*TAU;
   if(d>0&&rng()<.4)continue;
   kput(d>0?'winBigD':'winBigI',[Math.cos(th)*LDR*.94,LANY+DRH+20,Math.sin(th)*LDR*.94],
    OUT(th),[1.6,1.6,1],null);}
  // The colonnade on the podium is band 2's head arcade (RHEAD[2] = LDR+8);
  // it is built with the bands, so there is no second ring of piers here.
  folk(LANY+.1,LDR+2,LANR-2,d>0?6:20);}

 // ---- the ground: groves on the plinth, and the country beyond ---------------------
 // Thinned from 350/430 when the wheel went in. Nine tenths of this grove is
 // under the rim now and reads as shadow whatever is planted in it.
 for(let j=0;j<(d>0?260:210);j++){const th=rng()*TAU;
  const rn=Math.sqrt(lerp(300*300,508*508,rng()));
  const x=Math.cos(th)*rn,z=Math.sin(th)*rn;
  const y0=PLY-5.2*plStep(rn);
  if(rng()<.72)tree(x,y0,z,rr(11,d>0?30:24));else scrub(x,y0,z,rr(2.5,6.5));}
 for(let j=0;j<(d>0?80:55);j++){const th=rng()*TAU;
  const rn=Math.sqrt(lerp(RPL*RPL*1.9,RPL*RPL*3.0,rng()));
  const x=Math.cos(th)*rn,z=Math.sin(th)*rn;
  if(rng()<.6)tree(x,terrainH(KOFF[0]+x,KOFF[2]+z),z,rr(9,d>0?26:20));
  else scrub(x,terrainH(KOFF[0]+x,KOFF[2]+z),z,rr(2,6));}
 folk(PLY-15.6,RPL*.72,RPL*.98,d>0?8:22);

 // ---- the breach ---------------------------------------------------------------------
 if(d>0){
  // the two cut faces of the wedge, and the fill behind them
  for(let s=0;s<2;s++){const sg=s?1:-1;
   SH.push(gridSurface((u,v)=>{const rn=lerp(RSH,RAT,u),th=FRA+sg*wedgeHW(rn);
    return[rn*Math.cos(th),lerp(crownY(rn)-30,crownY(rn),v),rn*Math.sin(th)];},52,5,{uS:22,vS:5}));}
  for(let i=0;i<3;i++){const R=RING[i];
   DK.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(R.r1,R.r0,v);
    return[rn*Math.cos(th),R.y-13-7*fbm(u*9,v*4,9489+i,2),rn*Math.sin(th)];},112,5,{uS:26,vS:5,
    hole:(u,v)=>!fell(u*TAU,lerp(R.r1,R.r0,v))}));}
  // ---- THE SECTION -------------------------------------------------------------
  // What a tear through a solid mass should show: FLOORS. The crown is 96 m of
  // stepped mass with nothing but its own fill inside it, so the breach used to
  // read as a grey scoop. Twelve plates at 8 m centres, cut off exactly where
  // the wedge is and exactly where the stepped top surface comes down to meet
  // them, turn it into a section drawing of a building.
  //
  // These are nearly free. gridSurface allocates every vertex but only indexes
  // the quads that survive the hole predicate, and triOf counts the index — so
  // a plate that keeps a tenth of its annulus costs a tenth of its triangles.
  // The plates go in SH (pale board-formed concrete), NOT in DK with the fill:
  // put in the same near-black as the void behind them they were twelve grey
  // lines on a grey field. A section drawing is pale slabs against dark rooms.
  for(let fy=CY0+6;fy<LANY;fy+=8){
   const cut=(u,v)=>{const th=u*TAU,rn=lerp(RING[0].r1,LANR*.5,v);
    return !fell(th,rn)||crownY(rn)<fy+3;};
   SH.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(RING[0].r1,LANR*.5,v);
    return[rn*Math.cos(th),fy,rn*Math.sin(th)];},144,12,{uS:32,vS:9,hole:cut}));
   // a dark soffit a metre under each plate. Pale-on-pale the twelve floors
   // read as one stepped ramp; it is the band of shadow under each one that
   // makes a section look like a section.
   DK.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(LANR*.5,RING[0].r1,v);
    return[rn*Math.cos(th),fy-1.1,rn*Math.sin(th)];},144,12,{uS:32,vS:9,
    hole:(u,v)=>cut(u,1-v)}));}
  // partition walls on the radials, so the section reads as rooms and not as a
  // stack of shelves
  for(let j=0;j<11;j++){const th=FRA+rr(-.30,.30);
   const r0=rr(LANR,RING[0].r1*.86),r1=Math.min(RING[0].r1,r0+rr(40,120));
   if(!fell(th,r0))continue;
   DK.push(gridSurface((u,v)=>{const rn=lerp(r0,r1,u);
    return[rn*Math.cos(th),lerp(CY0+2,Math.min(crownY(rn)-2,CY0+92),v),rn*Math.sin(th)];},
    10,8,{uS:8,vS:8}));}
  // the same treatment down the shoulder notch: the barrel's own storeys, at
  // 9 m instead of the 26 m the intact floor plates use, so the tear shows a
  // dozen of them stacked
  for(let fy=HB-160;fy<HB-4;fy+=9){
   SH.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(BRf(fy)*.995,RAT+8,v);
    return[rn*Math.cos(th),fy,rn*Math.sin(th)];},144,7,{uS:30,vS:6,
    hole:u=>!notch(u*TAU,fy)}));}
  // rr() hoisted out of the surface callback: gridSurface calls fn once per
  // VERTEX, so a random term inside it burns the stream and shreds the wall.
  for(let j=0;j<9;j++){const th=FRA+rr(-.13,.13),fy=rr(HB-158,HB-20),wh=rr(8,26);
   if(!notch(th,fy))continue;
   const r0=BRf(fy)*.86,r1=BRf(fy)*.995;
   DK.push(gridSurface((u,v)=>{const rn=lerp(r0,r1,u);
    return[rn*Math.cos(th),fy+v*wh,rn*Math.sin(th)];},6,5,{uS:6,vS:6}));}
  // The shoulder notch was a flat grey shape: the shell hole and the inner mass
  // 24 m behind it, with nothing between them to say it has depth. Teeth of
  // standing fabric round the tear and the broken ends of the floor plates
  // sticking into it are what make it read as a hole rather than as a patch.
  for(let j=0;j<150;j++){const y2=rr(HB-170,HB-2);
   const rn=BRf(y2),hw=wedgeHW(lerp(RSH,RW,clamp((HB-y2)/170,0,1)))*1.35
    *clamp((y2-(HB-170))/170,0,1);
   const th=FRA+(rng()<.5?-1:1)*hw*rr(.90,1.04),s2=rr(1.6,6.5);
   kput('rubble',[Math.cos(th)*rn,y2,Math.sin(th)*rn],qEuler(rng()*3,rng()*3,rng()*3),
    [s2*rr(.7,1.5),s2*rr(.6,1.3),s2*rr(.7,1.5)],
    new THREE.Color().setHSL(rr(.05,.09),rr(.08,.26),rr(.22,.46)));}
  for(let fy=HB-166;fy<HB-14;fy+=26){const rn=BRf(fy)*.955;
   for(let j=0;j<9;j++){const th=FRA+rr(-.34,.34);
    if(rng()<.35)continue;
    beam(BX,[Math.cos(th)*rn*.86,fy,Math.sin(th)*rn*.86],
         [Math.cos(th)*rn,fy-rr(0,5),Math.sin(th)*rn],rr(6,16),1.4);}}
  for(let j=0;j<360;j++){const th=FRA+rr(-.45,.45),rn=rr(RAT+18,RSH+6);
   const s2=rr(1.2,7);
   kput('rubble',[Math.cos(th)*rn,crownY(rn)-rr(1,28)+s2*.4,Math.sin(th)*rn],
    qEuler(rng()*3,rng()*3,rng()*3),[s2*rr(.7,1.5),s2*rr(.5,1),s2*rr(.7,1.5)],
    new THREE.Color().setHSL(rr(.04,.09),rr(.12,.32),rr(.13,.28)));}
  // and what came off the shoulder, on the plinth below it
  for(let j=0;j<260;j++){const th=FRA+rr(-.52,.52),rn=rr(RFOOT-30,RPL);
   const s2=rr(1.4,11);
   kput('rubble',[Math.cos(th)*rn,PLY-5.2*plStep(rn)+s2*.4,Math.sin(th)*rn],
    qEuler(rng()*3,rng()*3,rng()*3),[s2*rr(.7,1.6),s2*rr(.5,1),s2*rr(.7,1.6)],
    new THREE.Color().setHSL(rr(.04,.09),rr(.12,.32),rr(.16,.34)));}
  // Rubble and scrub ON the hoop galleries. They are the only up-facing ledges
  // on 520 m of drum, so they are where everything that comes off the shell
  // lands and where the first seeds take: without them the flank of the ruin
  // is a clean white wall with a few holes in it.
  HOOPY.forEach((hy,i)=>{const r1=BRf(hy)+[7,20,7,14,10][i];
   for(let j=0;j<60;j++){const th=rng()*TAU,rn=rr(r1-8,r1-1),s2=rr(.8,4.4);
    kput('rubble',[Math.cos(th)*rn,hy+s2*.4,Math.sin(th)*rn],qEuler(rng()*3,rng()*3,rng()*3),
     [s2*rr(.7,1.5),s2*rr(.5,1),s2*rr(.7,1.5)],
     new THREE.Color().setHSL(rr(.05,.09),rr(.1,.3),rr(.18,.4)));}
   for(let j=0;j<24;j++){const th=rng()*TAU,rn=rr(r1-9,r1-2);
    if(rng()<.35)tree(Math.cos(th)*rn,hy,Math.sin(th)*rn,rr(8,17));
    else scrub(Math.cos(th)*rn,hy,Math.sin(th)*rn,rr(2,5.5));}});}

 // ---- merge and dress ------------------------------------------------------------------
 meshMerged(SH,skin,G);
 meshMerged(LOAM,d>0?MAT.ringSoilR:MAT.ringSoil,G);
 meshMerged(GRD,d>0?MAT.mud:MAT.ringPave,G);
 if(DK.length)meshMerged(DK,MAT.guts,G);
 if(d>0){mossOnSurface(SH,0,0,0,620,5.6);vinesFromLedge(SH,0,0,0,460,30);
  stainsFromLedge(SH,0,0,0,520,26);
  scatterMoss(0,PLY,0,RFOOT*.4,RPL,180,4.4);
  rubbleRing(0,PLY-15.6,0,RPL*.86,RPL*1.14,190,7.5);}
 RINGPLAN={RFOOT,RW,RSH,HB,TW,YW,RPL,PLY,RAT,NBAY,NTER,NST,CY0,
           RING,BAND,RHEAD,HOOPY,LANY,LANR,LDR,LANTOP,FRA,BR:BRf,crownY,
           WY,WR0,WR1,WDK,WB0,WB1,WF0,WF1,WST,WA,NSPOKE,NPYL,NBRG,BRW,BRO};
 KOFF=[0,0,0];return G;}
