// ================================================================= ARCUBE — the Apollonian cube
// Soleri groups Arcube with the Hexahedron as the APOLLONIAN generation:
// "characterized by the envelope which is substantially an elementary geometry:
// cube, sphere, pyramid, hexahedron, cylinder", as against the free-form
// Dionysian kind. That is the whole instruction for this type. THE SILHOUETTE IS
// A PURE SOLID AND EVERY PIECE OF INCIDENT IS INSIDE IT. Nothing in this file is
// allowed to break the outline: the relief on the four sloping faces is 0.6 m,
// the galleries stand 9 m proud on a 1 414 m elevation, the light wells are
// RECESSES and stop short of the ridge and the keel, and the two end
// compositions are craters, not additions. What makes the thing read is what has
// been taken OUT of it and how the inside is lit.
//
// THE SHEET, verbatim: population 400 000 · density 2 717/hectare, 1 100/acre ·
// height 1 500 metres · side 1 kilometre · surface covered 140 hectares,
// 346 acres. Three of those four are built exactly and the fourth cannot be:
//
//   SIDE 1 000 m          the cube's edge, ACSIDE below.
//   SURFACE 140 ha        a 1 km cube stood on a horizontal diagonal projects a
//                         rectangle 1 000 x 1 414 m on the ground = 141.4 ha,
//                         which is the sheet's figure to within 1%. Integrated
//                         on a 4 m lattice at the foot of this file, not
//                         asserted.
//   HEIGHT 1 500 m        to the top of the heliport deck. The diamond itself is
//                         1 000 x sqrt(2) = 1 414.2 m tall, so the keel sits
//                         85.8 m over the ground and the deck closes the top.
//   ...THE LEG            1 500 - 1 414 = 86 m of daylight under the keel, not
//                         the third of the height the brief asks for. Those two
//                         cannot both be true of a 1 km cube at 1 500 m total:
//                         a third of 1 500 under a 1 414 m diamond needs 1 914 m
//                         of height, and 500 m of clear air under a 1 500 m
//                         total needs a 707 m cube, which throws the surface
//                         figure away as well. The compromise built here is that
//                         the LEGS are 500 m tall and the clear air is 86:
//                         the six belly legs rise 500 m from their footings to
//                         where the lower faces have climbed far enough out to
//                         meet them, so a third of the height IS leg, and the
//                         keel hangs between them 86 m off the ground.
//
// THE FORM. A cube of side 1 000 rotated 45 degrees about the EAST-WEST axis, so
//   FRONT ELEVATION (looking along x, at either end) is a DIAMOND 1 414 across
//     and 1 414 tall, and
//   SIDE ELEVATION (looking along z) is a RECTANGLE 1 000 wide and 1 414 tall.
// The two elevations disagreeing is the form. Everything below is written in one
// coordinate: q = |z| + |y - CY|, the L1 radius of the diamond, which is exactly
// 707.1 on the envelope and falls to 0 on the cube's own axis. A surface at
// constant q is one of the four sloping faces; an annulus of q in a plane
// x = const is one of the concentric bands of the front elevation. One number
// therefore drives both drawings and they cannot drift apart.
//
// THE FRONT ELEVATION: concentric diamond bands, outermost inward —
//   LIVING-WORKING  q 560..707   dense small cells
//   LIVING          q 430..560   larger cells, balcony galleries
//   CULTURAL CENTER q 300..430   a colonnade of arches round the whole diamond
//   CITY CENTER     q 152..300   terraces and lit halls
//   the VOID        q < 152      a diamond bore 304 m across straight through
//                                1 km of city, open at both ends.
// Each band steps 24-34 m deeper into the mass than the one outside it. NOTHING
// IN THIS KIT CASTS A SHADOW, so a 24 m step viewed head-on is invisible: the
// bands are made legible instead by (1) a different wall texture in each,
// (2) a ring of architecture on every boundary — a cornice, then the arcade,
// then a ring of halls, then the heavy rim of the void — and (3) a CONTINUOUS
// LIGHT STRIP along each boundary, which is a MeshBasicMaterial and therefore
// the one thing in this scene that a flat frontal light cannot wash out. At
// d = 0 the front elevation is four concentric diamonds of cyan light round a
// black hole. That is the drawing.
//
// THE SIDE ELEVATION: RESIDENTIAL over LIVING-WORKING, split on the equator
// cornice at y = 793 — the widest line of the building, 1 000 m long on each
// flank — and cut top to bottom by seven slot LIGHT WELLS, 40 m wide and 55 m
// deep, which run over the equator fold and stop 50 m short of the ridge and the
// keel so the envelope's own edges stay unbroken. The sun in this scene comes
// from the west and above, so the upper faces are lit at 0.65 and the lower ones
// are backfacing: the two-zone split draws itself, and the lower band is carried
// by its emissive window map instead of by diffuse light.
//
// THE MIDLEVEL PLAN: the rectangle 1 000 x 1 414, with CITY CENTER at the west
// end and CULTURAL CENTER at the east (the two end craters), RESIDENTIAL and
// PUBLIC between them, LIGHT WELLS notching both long sides, and VERTICAL
// STRUCTURE at the four corners — four 730 m corner legs standing at the corners
// of that very rectangle and rising to the cube's equator vertices.
//
// WHERE THE TRIANGLES GO. Plymouth got 65 678 windows into 476 k triangles at
// two triangles a pane. This type is an order of magnitude bigger — 400 000
// people against 17 000 homes — so two triangles a pane would be four million.
// The step past it is ZERO triangles a pane: the dwelling grid is a procedural
// wall texture with its own emissive map for the lit cells, applied at a fixed
// 25.6 m tile so a window is 3.2 x 1.9 m everywhere in the model, and the real
// geometry is spent on what a texture cannot do — balconies, galleries,
// cornices, the arcade, the light wells and the structure. The pane instances
// that remain are placed only on the surfaces a preset camera gets close to.
MAT.acMass =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xc9c2b2,roughness:1,metalness:0,side:DS});
MAT.acMassR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x7b7365,roughness:1,metalness:0,side:DS});
// Decks are three steps darker than the walls. Same lesson as Plymouth: without
// the tonal split a kilometre of terrace and the wall behind it come back as one
// cream mass and no ledge can be told from the face it stands on.
MAT.acDeck =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x6d6558,roughness:1,metalness:0,side:DS});
MAT.acDeckR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x4e4a3f,roughness:1,metalness:0,side:DS});
// SHADE IS PAINTED, NOT LIT. The hemisphere's ground colour is a warm brown and
// nothing casts a shadow, so the inside of a 55 m slot and the soffit of a
// 1 400 m overhang both come back sunlit from below. Every downward-facing and
// every enclosed surface in this file is on one of these two materials instead.
MAT.acShade =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x3c382f,roughness:1,metalness:0,side:DS});
MAT.acShadeR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x2c2923,roughness:1,metalness:0,side:DS});
// What is behind an opening. Dark enough that a hole reads as a hole at 2 km.
MAT.acVoid =new THREE.MeshStandardMaterial({color:0x0a0b0d,roughness:1,metalness:0,side:DS});
// White, so instanceColor can carry both the decay darkening and the per-object
// tone. One material, two jobs.
MAT.acKit  =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.acPave =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x6a6053,roughness:1,metalness:0,side:DS});
MAT.acPaveR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x484236,roughness:1,metalness:0,side:DS});

// ---------------------------------------------------------------- the dwelling grid
// One tile is 25.6 m square: four 6.4 m frontages by seven 3.66 m storeys for
// the residential wall, two double-width by four double-height for the
// living-working one, and a square 4 x 4 lattice for the diamond faces.
//
// THE DIAMOND FACES NEED THE LATTICE AND THIS IS WHY. gridSurface hands a
// surface the UVs of its own parameters, and there is no parameterisation of a
// diamond annulus standing in a vertical plane whose v is world height: the
// annulus is not a product of a horizontal thing and a vertical one. Parameterise
// it by (perimeter, radius) and the "storey lines" follow the diamond's 45
// degree outline. Rather than fight that, the front elevation is given a wall
// whose cell grid has no up — a square lattice reads as the structural grid of
// the diamond at any angle, which is also what Soleri draws on these faces — and
// the true horizontal storey lines come back as instanced panes, placed in real
// horizontal rows by walking y and solving the annulus for |z|.
function acWallTex(kind,dec){const NB=kind===1?2:4,NS=kind===0?7:4;
 return canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  const bw=w/NB,sh=h/NS;
  const wfr=kind===1?.64:kind===2?.58:.54, hfr=kind===1?.60:kind===2?.58:.50;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   const bi=Math.floor(x/bw),si=Math.floor(y/sh),bx=x-bi*bw,by=y-si*sh;
   const cr=h3(bi*3.17+kind*1.9,si*7.71,2.2);
   let v=(kind===1?172:188)+(fbm(x/44,y/44,3.3,3)-.5)*24+(h3(bi*1.7,si*2.9,1.1)-.5)*12;
   if(dec)v=v*.62+26+(fbm(x/9,y/70,7.7,2)-.5)*30;         // weathered and streaked
   if(by<2.2)v-=36; else if(by<4)v+=7;                     // the floor line
   const ww=bw*wfr,wh=sh*hfr,wx0=(bw-ww)*.5,wy0=sh*(kind===2?.21:.27);
   let r,gg,b;
   if(bx>wx0&&bx<wx0+ww&&by>wy0&&by<wy0+wh){
    if(!dec&&cr<(kind===1?.20:.28)){const f=.50+cr*1.3;r=236*f;gg=170*f;b=94*f;}
    else{const k2=dec?(cr<.34?7:19):24;r=k2;gg=k2+2;b=k2+6;}
    const e=Math.min(bx-wx0,wx0+ww-bx,by-wy0,wy0+wh-by);
    if(e<1.7){r=(r+v)*.5;gg=(gg+v)*.5;b=(b+v)*.5;}         // the reveal catches light
   }else{r=v;gg=v-3;b=v-10;}
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
// The emissive mask. A lit window painted into the albedo is a beige rectangle:
// ACES plus a 1.7-intensity sun leaves it no brighter than the wall round it.
// The same cells drawn on black and hung on emissiveMap are the only way a
// dwelling light out-shines a sunlit concrete face. The cell lottery is the same
// h3() as the albedo above, so the lit cells line up at either resolution.
function acLitTex(kind){const NB=kind===1?2:4,NS=kind===0?7:4;
 return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  const bw=w/NB,sh=h/NS;
  const wfr=kind===1?.64:kind===2?.58:.54,hfr=kind===1?.60:kind===2?.58:.50;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   const bi=Math.floor(x/bw),si=Math.floor(y/sh),bx=x-bi*bw,by=y-si*sh;
   const cr=h3(bi*3.17+kind*1.9,si*7.71,2.2);
   const ww=bw*wfr,wh=sh*hfr,wx0=(bw-ww)*.5,wy0=sh*(kind===2?.21:.27);
   let a=0;
   if(bx>wx0&&bx<wx0+ww&&by>wy0&&by<wy0+wh&&cr<(kind===1?.20:.28))a=.45+cr*1.5;
   D[i]=250*a;D[i+1]=166*a;D[i+2]=88*a;D[i+3]=255;}
  g.putImageData(id,0,0);});}
TEX.acRes=acWallTex(0,0); TEX.acResR=acWallTex(0,1); TEX.acResE=acLitTex(0);
TEX.acWrk=acWallTex(1,0); TEX.acWrkR=acWallTex(1,1); TEX.acWrkE=acLitTex(1);
TEX.acLat=acWallTex(2,0); TEX.acLatR=acWallTex(2,1); TEX.acLatE=acLitTex(2);
// emissiveMap reads the standard uv in r128 (it is aoMap and lightMap that want
// uv2), so it rides the same 25.6 m tiling as the albedo with nothing extra.
// Intensity is kept well under 1: the ember cells in Darco and the warm windows
// in Plymouth both went cream the moment they were pushed past it.
MAT.acRes =new THREE.MeshStandardMaterial({map:TEX.acRes,roughnessMap:TEX.concreteRM,emissive:0xffffff,emissiveMap:TEX.acResE,emissiveIntensity:.62,roughness:1,metalness:0,side:DS});
MAT.acResR=new THREE.MeshStandardMaterial({map:TEX.acResR,roughnessMap:TEX.concreteRM,color:0xa49a8a,roughness:1,metalness:0,side:DS});
MAT.acWrk =new THREE.MeshStandardMaterial({map:TEX.acWrk,roughnessMap:TEX.concreteRM,emissive:0xffffff,emissiveMap:TEX.acWrkE,emissiveIntensity:.78,roughness:1,metalness:0,side:DS});
MAT.acWrkR=new THREE.MeshStandardMaterial({map:TEX.acWrkR,roughnessMap:TEX.concreteRM,color:0x9c9284,roughness:1,metalness:0,side:DS});
MAT.acLat =new THREE.MeshStandardMaterial({map:TEX.acLat,roughnessMap:TEX.concreteRM,emissive:0xffffff,emissiveMap:TEX.acLatE,emissiveIntensity:.62,roughness:1,metalness:0,side:DS});
MAT.acLatR=new THREE.MeshStandardMaterial({map:TEX.acLatR,roughnessMap:TEX.concreteRM,color:0xa09788,roughness:1,metalness:0,side:DS});

// Every instanced piece is modelled in the cell qFacing(normal) hands back: +z
// out of the wall, +x along it, +y up, so a scale is [frontage, height,
// projection] in metres everywhere below.
kdef('acPane',new THREE.PlaneGeometry(1,1),MAT.dot);
kdef('acBox',new THREE.BoxGeometry(1,1,1),MAT.acKit);
kdef('acDim',new THREE.BoxGeometry(1,1,1),MAT.acVoid);
kdef('acBalc',plymQuadGeo([
  [-.5,0,0, .5,0,0, .5,0,1, -.5,0,1],
  [-.5,0,1, .5,0,1, .5,1,1, -.5,1,1],
  [-.5,0,0, -.5,0,1, -.5,1,1, -.5,1,0],
  [ .5,0,0, .5,1,0, .5,1,1, .5,0,1]],2,1),MAT.acKit);
// A louvre bank for the living-working band: four blades on a frame, 8 quads.
kdef('acLouvre',(function(){const Q=[];
 for(let i=0;i<4;i++){const t=.12+i*.24;Q.push([-.5,t,0, .5,t,0, .5,t-.10,1, -.5,t-.10,1]);}
 return plymQuadGeo(Q,2,1);})(),MAT.acKit);
kdef('acCol',new THREE.CylinderGeometry(1,1,1,8),MAT.acKit);
kdef('acPad',new THREE.CylinderGeometry(1,1,1,18),MAT.acKit);
kdef('acArch',arcWindowGeo(6,9,1.2),MAT.acVoid);
// Presets are DERIVED from this: targets/arcube/91z-views.js runs after
// 90-scene.js, so both builders have already left their dimensions here.
const ARC_SITE={};

function buildArcube(scene,gx,gz,d){reseed(9610+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0;

 // ---- the numbers ------------------------------------------------------------
 const ACSIDE=1000;                       // the sheet's SIDE
 const RD=ACSIDE/Math.SQRT2;              // 707.107  half-diagonal of the diamond
 const HTT=1500;                          // the sheet's HEIGHT, to the heliport deck
 const KY=HTT-2*RD;                       // 85.79    the keel, over open ground
 const CY=KY+RD;                          // 792.89   the equator, the widest line
 const HX=ACSIDE*.5;                      // the cube runs x = -500 .. +500
 // The four band boundaries and how deep each band's face sits inside the end
 // plane. The whole front-elevation composition is 86 m deep in a mass 1 000 m
 // through, which is the most a crater can take without eating the city.
 const BR=[RD,560,430,300,152], DPX=[0,24,52,86];
 const CHAM=6;                            // the ridge and the keel are chamfered
 const TA=CHAM/(2*RD), TK=1-TA;           // ... so the faces run t = TA .. TK
 const NWL=7, WWX=40, WDEP=55;            // light wells: count, width, depth
 const WQ=RD-WDEP*Math.SQRT2;             // 629.2 — the floor of a well, in q
 const WT0=.036, WT1=.964;                // and it stops short of both ends
 const LEGY=500;                          // the belly legs: a third of the height
 const NU=100;                            // columns along x: 10 m, so a 40 m slot
                                          // is exactly four of them at every station

 // ---- the diamond ------------------------------------------------------------
 // [z,y] on the SOUTH side of the diamond of L1 radius q. t runs 0 at the top
 // vertex, .5 at the equator, 1 at the keel; z is mirrored for the north side.
 // |z| + |y - CY| == q identically, which is the invariant the whole file leans
 // on. Arc length along one side from the ridge is 2*sqrt(2)*q*t, i.e. 2 000 m
 // from ridge to keel on the envelope.
 const ZY=(q,t)=>[q*(1-Math.abs(2*t-1)),CY+q*(1-2*t)];
 const ARCL=(q,t)=>2*Math.SQRT2*q*t;
 const TOFY=y=>(1-(y-CY)/RD)*.5;          // the t of a height, on the envelope
 // The outward radial in (z,y) at (t, side) — a unit vector at 45 degrees.
 const RAD=(t,sd)=>[0,(t<.5?1:-1)*Math.SQRT1_2,sd*Math.SQRT1_2];
 // and the tangent, in the direction of increasing t
 const TAN=(t,sd)=>[0,-Math.SQRT1_2,sd*(t<.5?1:-1)*Math.SQRT1_2];
 // Local +X onto a direction: `strip` and every cornice member runs along its
 // own local x, and the diamond's tangent is at 45 degrees in the (y,z) plane.
 const QX=v=>new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0),
   new THREE.Vector3(v[0],v[1],v[2]).normalize());
 // A FULL BASIS, for the light bands on the front elevation: local +x along the
 // diamond's tangent and local +z out of the end face, so a flat pane lies on the
 // face and follows the ring. A 4 m light TUBE at 1 600 m is two pixels and the
 // concentric rings are the whole drawing; a 9 m band is eight, and costs two
 // triangles a segment instead of twelve.
 const QB=(t,sd,ex)=>{const T=TAN(t,sd);
  const zz=new THREE.Vector3(ex,0,0),xx=new THREE.Vector3(T[0],T[1],T[2]).normalize();
  const yy=new THREE.Vector3().crossVectors(zz,xx).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xx,yy,zz));};

 // ---- materials and merge lists ----------------------------------------------
 const resM=dd?MAT.acResR:MAT.acRes, wrkM=dd?MAT.acWrkR:MAT.acWrk;
 const latM=dd?MAT.acLatR:MAT.acLat, masM=dd?MAT.acMassR:MAT.acMass;
 const dekM=dd?MAT.acDeckR:MAT.acDeck, shdM=dd?MAT.acShadeR:MAT.acShade;
 const pavM=dd?MAT.acPaveR:MAT.acPave;
 const RES=[],WRK=[],LAT=[],MAS=[],DEK=[],SHD=[],GRD=[];

 // ---- decay ------------------------------------------------------------------
 // holeFn multiplies its u by 4.5*scale internally, so a u normalised over a
 // 2 000 m profile eats holes hundreds of metres across. Feed it arc length over
 // 216, as Plymouth had to.
 const hfn=holeFn(d*.5,9613,null,1.5);
 const rot=(s,y)=>hfn?hfn(s/216,y):false;
 // THE SPALL. An elliptical bite high on the south face with a noisy edge. It is
 // on an UPPER face on purpose: a hole in a face that slopes up and away is
 // looked INTO and DOWN onto from the ground, so the floor plates behind it read
 // as a section; the same hole in a lower face shows you nothing but soffits.
 const SPX=175,SPW=135,SPT=.225,SPTH=.12;
 const spall=(x,t,sd)=>{if(!dd||sd<0)return false;
  const ex=(x-SPX)/SPW,et=(t-SPT)/SPTH;
  return Math.hypot(ex,et)<1+.42*(fbm(x*.014,t*11,9614,3)-.5)*2;};
 // and the crack down the flank above the leg that failed
 const CRX=468,CRZ=672;
 const crack=(x,t,sd)=>{if(!dd||sd<0||t<.5)return false;
  const w=8+34*(t-.5);
  return Math.abs(x-CRX)<w&&t>.56&&t<.93&&fbm(x*.03,t*14,9615,2)>.36;};
 const gone=(x,t,sd)=>spall(x,t,sd)||crack(x,t,sd);

 // ---- the light wells ---------------------------------------------------------
 const WX=k=>-420+k*140;
 const wellOf=x=>{for(let k=0;k<NWL;k++)if(Math.abs(x-WX(k))<WWX*.5)return k;return -1;};
 const inWell=(x,t)=>t>WT0&&t<WT1&&wellOf(x)>=0;

 // ---- the palette --------------------------------------------------------------
 const tone=()=>new THREE.Color().setHSL(rr(.05,.13),rr(.04,.20),dd?rr(.13,.26):rr(.40,.72));
 const stone=()=>new THREE.Color().setHSL(rr(.06,.10),rr(.02,.10),dd?rr(.15,.25):rr(.46,.62));
 const deck=()=>new THREE.Color().setHSL(rr(.06,.10),rr(.02,.09),dd?rr(.11,.19):rr(.30,.42));
 const leafC=()=>new THREE.Color().setHSL(rr(.18,.34),rr(.16,.42),dd?rr(.12,.26):rr(.20,.34));
 const soilC=new THREE.Color(0x7d5f3c);
 const WARMW=new THREE.Color(0xffa957);
 const winC=p=>dd
   ?(rng()<.014?WARMW.clone().multiplyScalar(rr(.06,.15))
              :new THREE.Color(0x070a0f).multiplyScalar(rr(.5,1.9)))
   :(rng()<p?WARMW.clone().multiplyScalar(rr(.30,.80))
            :new THREE.Color(0x080e16).multiplyScalar(rr(.6,1.9)));
 const lit=(p,q2,s,c)=>{if(dd&&rng()>.08)return;kput('strip',p,q2,s,c||CYAN);};
 const person=(x,y,z)=>{if(dd)return;
  kput('figB',[x,y,z],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
  kput('figH',[x,y,z],null,1,new THREE.Color(0xc9a17e));};
 const plant=(x,y,z,h)=>{kput('trunk',[x,y,z],qEuler(rr(-.05,.05),rng()*TAU,rr(-.05,.05)),
   [h*.16,h*.74,h*.16],new THREE.Color().setHSL(rr(.05,.10),rr(.2,.4),rr(.14,.28)));
  const s0=h*rr(.26,.38);
  kput('leafCard',[x+rr(-.08,.08)*h,y+h*.72,z+rr(-.08,.08)*h],
   qEuler(rr(-.07,.07),rng()*TAU,rr(-.07,.07)),[s0,s0*rr(.7,1.05),s0],leafC());};

 // ---- the registry --------------------------------------------------------------
 REGISTER({name:'Arcube ('+STATE(d)+')',x:0,z:0,r:920,h:HTT+70});
 REGISTER({name:'Arcube — the cube',x:0,z:0,y:KY,r:730,h:2*RD});
 REGISTER({name:'Arcube — residential',x:0,z:0,y:CY,r:715,h:RD});
 REGISTER({name:'Arcube — living-working',x:0,z:0,y:KY,r:715,h:RD});
 REGISTER({name:'Arcube — the city centre',x:-HX+50,z:0,r:330,y:CY-330,h:660});
 REGISTER({name:'Arcube — the cultural centre',x:HX-50,z:0,r:330,y:CY-330,h:660});
 REGISTER({name:'Arcube — the void',x:0,z:0,r:BR[4]+14,y:CY-BR[4]-8,h:2*BR[4]+16});
 REGISTER({name:'Arcube — the heliport',x:0,z:0,r:120,y:HTT-24,h:96});
 REGISTER({name:'Arcube — the keel',x:0,z:0,r:120,y:KY-96,h:130});
 for(let k=0;k<NWL;k+=3)for(const sd of [1,-1])
  REGISTER({name:'Arcube — light well '+(k+1)+(sd>0?' south':' north'),
   x:WX(k),z:sd*500,r:56,y:200,h:1000});
 for(const ex of [-1,1])for(const sz of [-1,1])
  REGISTER({name:'Arcube — vertical structure, '+(ex<0?'west':'east')+(sz<0?' north':' south'),
   x:ex*468,z:sz*672,r:64,h:CY-40});
 REGISTER({name:'Arcube — the ground works',x:0,z:0,r:900,h:26});
 if(dd){REGISTER({name:'Arcube — the spall',x:SPX,z:430,y:900,r:210,h:430});
  REGISTER({name:'Arcube — the fallen leg',x:CRX+120,z:CRZ+190,r:220,h:90});}

 // ============================================================ THE FOUR SLOPING FACES
 // One q-offset function drives everything the envelope does: the storey relief,
 // the recessed loggias and the deep band under the equator. It is a function of
 // ARC LENGTH from the ridge, so the same 36.6 m tile that the wall texture is
 // scaled to is the tile the relief steps on, and the two cannot slide apart.
 //
 // THE LOGGIAS ARE RECESSES, NOT LEDGES. A 9 m balcony running the length of the
 // building projects 9 m past the diamond in the FRONT elevation and serrates the
 // outline at a dozen heights. Cutting the same 9 m inward gives the identical
 // horizontal line — stronger, in fact, because the reveal is painted shade —
 // and costs the silhouette nothing. Apollonian: the incident is inside.
 const TILE=36.6;                       // 7 storeys of 5.23 m slope = 3.7 m of rise
 const qoff=s=>{const b=s/TILE,f=b-Math.floor(b),bi=Math.floor(b);
  const eq=Math.abs(s-ARCL(RD,.5));
  if(eq<TILE*.92&&s>ARCL(RD,.5))return -17;    // the deep band under the equator
  return (bi%4===2?-12.7:0)+(f<.5?0:-.44);};
 const isLog=s=>{const bi=Math.floor(s/TILE);return bi%4===2;};
 // THE CORNER PIERS. The sheet's plan puts VERTICAL STRUCTURE at the four corners
 // of the midlevel rectangle, and the four corner legs stand exactly there — but
 // they are under the mass and invisible from above, so the structure has to be
 // expressed in the envelope as well. The outer 60 m at each end of all four
 // faces is a BLIND pier on mass concrete with no dwelling grid on it: in the
 // plan it is four structural bands at the corners, in the side elevation two
 // piers framing the housing, and it is what the corner legs run up into.
 const PIERX=440;
 const inPier=x=>Math.abs(x)>PIERX;
 // THE TWO CIVIC COURTS. The sheet's plan puts the CITY CENTER at one end of the
 // rectangle and the CULTURAL CENTER at the other, and the two end craters are
 // exactly that — but a crater in a vertical end face cannot be seen from
 // overhead, so from the plan the two ends would read no differently from the
 // middle. Each end therefore also opens a court 127 x 240 m and 24 m deep into
 // the upper faces, inboard of the corner pier: four of them, two a end, and in
 // the plan view they are the two civic ends the drawing asks for. Recessed, like
 // everything else here, so the envelope is untouched.
 const CQX0=305,CQX1=432,CQT0=.13,CQT1=.30,CQQ=RD-34;
 const inCourt=(x,t)=>t>CQT0&&t<CQT1&&Math.abs(x)>CQX0&&Math.abs(x)<CQX1;
 const faceSurf=(sd,up,pier)=>{const t0=up?TA:.5,t1=up?.5:TK;
  const arc=ARCL(RD,t1-t0),nv=54;
  return gridSurface((u,v)=>{const x=lerp(-HX,HX,u),t=lerp(t0,t1,v);
    const s=ARCL(RD,t),p=ZY(RD+(pier?-1.6:qoff(s)),t);
    return[x,p[1],sd*p[0]];},NU,nv,
   {uS:ACSIDE/(pier?12:25.6),vS:arc/(pier?12:TILE),
    hole:(u,v)=>{const x=lerp(-HX,HX,u),t=lerp(t0,t1,v),s=ARCL(RD,t);
     return (inPier(x)!==!!pier)||inWell(x,t)||inCourt(x,t)||gone(x,t,sd)||rot(s,CY+RD*(1-2*t));}});};
 for(const sd of [1,-1]){RES.push(faceSurf(sd,1,0));WRK.push(faceSurf(sd,0,0));
  MAS.push(faceSurf(sd,1,1));MAS.push(faceSurf(sd,0,1));}
 // the pier's own rustication: a deep course every 55 m, which is the only relief
 // it gets and the thing that keeps 700 m of blind concrete from reading as card
 for(const sd of [1,-1])for(const ex of [-1,1])
  for(let t=TA+.02;t<TK-.02;t+=55/(2*Math.SQRT2*RD)){
   const p=ZY(RD,t);
   if(gone(ex*470,t,sd))continue;
   kput('acBox',[ex*470,p[1],sd*(p[0]+1.4)],qFacing([0,0,sd]),[58,3.2,3.4],stone());}
 for(const sd of [1,-1])for(let x=-HX+13;x<HX-12;x+=26){
  if(gone(x,.5,sd))continue;
  const p=ZY(RD,.5);
  kput('acBox',[x,p[1]-1,sd*(p[0]+1.6)],qFacing([0,0,sd]),[26,7,7],stone());
  kput('acBox',[x,p[1]-7.5,sd*(p[0]+3.4)],qFacing([0,0,sd]),[26,4,4],deck());
  if(!dd&&x%78<26)kput('acPane',[x,p[1]-4.4,sd*(p[0]+5.2)],qFacing([0,0,sd]),[24,2.6,1],CYAN);}
 // ---- the civic courts ----------------------------------------------------------
 for(const sd of [1,-1])for(const ex of [-1,1]){
  const x0=ex<0?-CQX1:CQX0,x1=ex<0?-CQX0:CQX1;
  DEK.push(gridSurface((u,v)=>{const p=ZY(CQQ,lerp(CQT0,CQT1,v));
    return[lerp(x0,x1,u),p[1],sd*p[0]];},10,14,{uS:(x1-x0)/25.6,vS:(CQT1-CQT0)*2*Math.SQRT2*RD/25.6}));
  for(const sx of [0,1])SHD.push(gridSurface((u,v)=>{const p=ZY(lerp(RD,CQQ,v),lerp(CQT0,CQT1,u));
    return[sx?x1:x0,p[1],sd*p[0]];},14,3,{uS:12,vS:3}));
  for(const st of [CQT0,CQT1])SHD.push(gridSurface((u,v)=>{const p=ZY(lerp(RD,CQQ,v),st);
    return[lerp(x0,x1,u),p[1],sd*p[0]];},10,3,{uS:12,vS:3}));
  // what stands in them: the great halls of the two civic ends
  const tc=(CQT0+CQT1)*.5;
  for(let j=0;j<5;j++){const t=lerp(CQT0+.022,CQT1-.022,(j+.5)/5),p=ZY(CQQ,t);
   const hh=rr(16,30),wd=rr(46,92);
   if(dd&&rng()<.4)continue;
   kput('acBox',[(x0+x1)*.5+rr(-14,14),p[1]+hh*.42,sd*(p[0]+hh*.42)],qFacing([0,0,sd]),
    [wd,hh,rr(20,34)],stone());
   kput('acPane',[(x0+x1)*.5,p[1]+hh*.5,sd*(p[0]+hh*.5+17)],qFacing([0,0,sd]),[wd*.7,hh*.5,1],winC(.85));
   if(!dd)kput('strip',[(x0+x1)*.5,p[1]+hh+2,sd*(p[0]+hh+2)],null,[wd*.8,14,14],CYAN);
   for(let q2=0;q2<3;q2++)person((x0+x1)*.5+rr(-50,50),p[1]-1,sd*(p[0]-1+rr(-8,8)));}
  const pc=ZY(CQQ,tc);
  if(!dd)kput('finial',[(x0+x1)*.5,pc[1]+26,sd*(pc[0]+26)],null,[9,22,9],null);}

 // ---- what lives in the loggias -------------------------------------------------
 // A dark soffit over each, a pale deck under it, a balustrade on the lip and a
 // light strip along the back. Walked at 30 m so a 1 000 m loggia is 33 bays.
 for(const sd of [1,-1])for(let bi=2;bi*TILE<ARCL(RD,TK);bi+=4){
  const sMid=(bi+.5)*TILE, tMid=sMid/(2*Math.SQRT2*RD);
  if(tMid<TA+.01||tMid>TK-.01)continue;
  const pIn=ZY(RD-12.7,tMid), pT=ZY(RD,tMid-TILE*.5/(2*Math.SQRT2*RD)),
        pB=ZY(RD,tMid+TILE*.5/(2*Math.SQRT2*RD));
  const yT=pT[1],yB=pB[1],zT=sd*pT[0],zB=sd*pB[0],zI=sd*pIn[0],yI=pIn[1];
  const upper=tMid<.5;
  for(let x=-HX+9;x<HX-8;x+=18){
   if(inPier(x)||inWell(x,tMid)||gone(x,tMid,sd))continue;
   const dp=Math.abs(zT-zI)+2;
   kput('acDim',[x,(yT+yI)*.5+3,(zT+zI)*.5],null,[18,3.4,dp],null);      // the soffit
   kput('acBox',[x,(yB+yI)*.5-1.4,(zB+zI)*.5],null,[18,2.8,dp],deck());  // the deck
   kput('acBox',[x,(yB+yI)*.5+1.6,zB-sd*1.2],null,[18,2.4,1.8],stone()); // the lip
   kput('acPane',[x,(yB+yI)*.5+3.4,(zB+zI)*.5-sd*dp*.42],qFacing([0,0,sd]),[16,4.2,1],winC(.55));
   if(!dd&&x%54<18)lit([x,yI+(upper?4:-4),zI+sd*2.2],null,[18,16,16],CYAN);
   if(upper&&rng()<.16)plant(x+rr(-7,7),(yB+yI)*.5,(zB+zI)*.5+sd*rr(-4,4),rr(5,9));
   if(rng()<.13)person(x+rr(-8,8),(yB+yI)*.5,(zB+zI)*.5+sd*rr(-3,3));}}

 // ---- balconies on the field between the loggias ---------------------------------
 // What the texture cannot do. Every other 6.4 m frontage on every sixth storey
 // of the residential faces, which at 45 degrees is a real terraced section
 // rather than a shelf stuck on a wall.
 for(const sd of [1,-1]){
  for(let t=TA+.012;t<.5;t+=TILE*.86/(2*Math.SQRT2*RD)){
   const s=ARCL(RD,t);if(isLog(s))continue;
   const p=ZY(RD,t);
   const nn=RAD(t,sd);
   for(let x=-HX+5;x<HX-4;x+=7.4){
    if(inPier(x)||inWell(x,t)||gone(x,t,sd)||(dd&&rng()<.34))continue;
    kput('acBalc',[x,p[1]-1.6,sd*p[0]],qFacing([0,0,sd]),[5.6,1.5,rr(2.2,3.4)],tone());
    kput('acPane',[x,p[1]+nn[1]*.6,sd*p[0]+nn[2]*.6],qFacing([0,nn[1],nn[2]]),
     [4.4,2.4,1],winC(.30));
    if(rng()<.5){const p2=ZY(RD,t+9/(2*Math.SQRT2*RD));
     kput('acPane',[x,p2[1]+nn[1]*.6,sd*p2[0]+nn[2]*.6],qFacing([0,nn[1],nn[2]]),
      [4.4,2.2,1],winC(.26));}}}
  // and louvre banks on the living-working faces, which are plant, not homes
  for(let t=.5+.014;t<TK;t+=TILE*1.7/(2*Math.SQRT2*RD)){
   const s=ARCL(RD,t);if(isLog(s))continue;
   const p=ZY(RD,t);
   const nw2=RAD(t,sd);
   for(let x=-HX+8;x<HX-7;x+=15){
    if(inPier(x)||inWell(x,t)||gone(x,t,sd)||(dd&&rng()<.4))continue;
    if(rng()<.55)kput('acLouvre',[x,p[1],sd*(p[0]+.4)],qFacing([0,0,sd]),[13,7,2.6],stone());
    else kput('acPane',[x,p[1]+nw2[1]*.6,sd*p[0]+nw2[2]*.6],qFacing([0,nw2[1],nw2[2]]),
     [11,4.2,1],winC(.5));
    if(rng()<.18)kput('acDim',[x,p[1]+nw2[1]*1.2,sd*p[0]+nw2[2]*1.2],qFacing([0,nw2[1],nw2[2]]),
     [7,9,2.4],null);}}}

 // ============================================================ THE LIGHT WELLS
 // Seven slots, 40 m wide and 55 m deep, running over the equator fold from
 // t = .036 to t = .964 — 1 857 m of surface, which in the SIDE elevation is a
 // vertical slot 1 314 m tall. The floor of a slot is the diamond of L1 radius
 // 629.2: offsetting a 90-degree fold inward by 55 m moves its apex by 55*sqrt(2),
 // so the recess is the same diamond, shrunk, and the slot turns the corner at
 // the equator without a seam.
 //
 // Parameterised (u = depth, v = t) rather than the other way round, because a
 // line of constant t is a line of constant HEIGHT: that way the wall texture's
 // storey lines come out horizontal on the side walls of the slot instead of
 // running diagonally down it.
 const wellArc=ARCL(RD,WT1-WT0);
 for(let k=0;k<NWL;k++){const xc=WX(k);
  for(const sd of [1,-1]){
   // the two side walls
   for(const sx of [-1,1]){
    const xw=xc+sx*WWX*.5;
    WRK.push(gridSurface((u,v)=>{const t=lerp(WT0,WT1,v),q=lerp(RD,WQ,u),p=ZY(q,t);
      return[xw,p[1],sd*p[0]];},5,96,{uS:WDEP/25.6,vS:wellArc/TILE,
     hole:(u,v)=>{const t=lerp(WT0,WT1,v);return rot(ARCL(RD,t),CY+RD*(1-2*t))&&u<.5;}}));}
   // the floor, and the two ends where the slot stops short of ridge and keel
   SHD.push(gridSurface((u,v)=>{const t=lerp(WT0,WT1,v),p=ZY(WQ,t);
     return[lerp(xc-WWX*.5,xc+WWX*.5,u),p[1],sd*p[0]];},3,96,{uS:WWX/12,vS:wellArc/12}));
   for(const te of [WT0,WT1]){
    SHD.push(gridSurface((u,v)=>{const q=lerp(RD,WQ,v),p=ZY(q,te);
      return[lerp(xc-WWX*.5,xc+WWX*.5,u),p[1],sd*p[0]];},3,3,{uS:WWX/10,vS:WDEP/10}));}
   // galleries down both side walls, a bridge across every eighth, and the
   // strips that make a 55 m slot read as a slot rather than as a dark stripe
   for(let j=0;j<74;j++){const t=lerp(WT0,WT1,(j+.5)/74),p=ZY(RD,t),pf=ZY(WQ,t);
    const y=p[1],zO=sd*p[0],zF=sd*pf[0],yF=pf[1];
    if(dd&&rng()<.3)continue;
    for(const sx of [-1,1]){
     kput('acBox',[xc+sx*(WWX*.5-2.2),(y+yF)*.5,(zO+zF)*.5],null,[3.4,2.6,Math.abs(zO-zF)+2],deck());
     if(!dd&&j%2===0)kput('strip',[xc+sx*(WWX*.5-4.4),(y+yF)*.5+2,(zO+zF)*.5],
       QX(RAD(t,sd)),[WDEP*.8,13,13],CYAN);
     for(let w2=0;w2<5;w2++){const f=(w2+.5)/5;
      kput('acPane',[xc+sx*(WWX*.5-.6),lerp(y,yF,f)+1.2,lerp(zO,zF,f)],
       qFacing([-sx,0,0]),[8.6,3.4,1],winC(.42));}}
    if(j%8===4)kput('acBox',[xc,(y+yF)*.5-3,(zO+zF)*.5],null,[WWX-5,2.2,Math.abs(zO-zF)*.7],stone());
    // and the street in the bottom of it
    {const nf=RAD(t,sd),fx=xc+rr(-13,13),fy=yF+nf[1]*1.2,fz=zF+nf[2]*1.2;
     const r3=rng();
     if(r3<.30)kput('acBox',[fx,fy+4,fz],qFacing([0,nf[1],nf[2]]),[rr(7,15),9,rr(6,11)],stone());
     else if(r3<.58)plant(fx,fy,fz,rr(6,12));
     else if(r3<.72)kput('acBox',[fx,fy+.9,fz],qFacing([0,nf[1],nf[2]]),[rr(8,17),2,rr(4,8)],deck());
     else person(fx,fy,fz);}}
  }}

 // ============================================================ THE FRONT ELEVATION
 // Two craters, one at each end, 86 m deep in a mass 1 000 m through. Four
 // concentric diamond annuli at four depths, the step between each pair painted
 // shade, and on every boundary a ring of architecture AND a ring of light.
 const ringN=q=>Math.max(10,Math.round(2*Math.SQRT2*q/26));
 for(const ex of [-1,1]){
  for(let i=0;i<4;i++){const xf=ex*(HX-DPX[i]),q0=BR[i],q1=BR[i+1];
   for(const sd of [1,-1]){
    // the band's own face. Its parameterisation is (perimeter, radius) and its
    // texture is therefore the square lattice — see the note at the head of the
    // file for why no other mapping is available on a diamond annulus.
    const g=gridSurface((u,v)=>{const t=u,p=ZY(lerp(q0,q1,v),t);
      return[xf,p[1],sd*p[0]];},72,4,
     {uS:2*Math.SQRT2*(q0+q1)*.5/25.6,vS:(q0-q1)/Math.SQRT2/25.6,
      hole:(u,v)=>dd&&rot(2*Math.SQRT2*lerp(q0,q1,v)*u,CY+lerp(q0,q1,v)*(1-2*u))});
    (i===0?LAT:i===1?RES:i===2?DEK:SHD).push(g);
    // the step back to the next band, painted shade
    if(i<3)SHD.push(gridSurface((u,v)=>{const p=ZY(q1,u);
      return[lerp(xf,ex*(HX-DPX[i+1]),v),p[1],sd*p[0]];},72,2,
     {uS:2*Math.SQRT2*q1/14,vS:(DPX[i+1]-DPX[i])/14}));}
   // ---- the boundary ring: cornice, lights, and one piece of architecture ----
   const n=ringN(q1),xr=ex*(HX-DPX[i]+3.5);
   for(const sd of [1,-1])for(let j=0;j<n;j++){
    const ta=j/n,tb=(j+1)/n,tm=(j+.5)/n;
    const pa=ZY(q1,ta),pb=ZY(q1,tb),pm=ZY(q1,tm);
    if(dd&&rng()<.3)continue;
    beam('acBox',[xr,pa[1],sd*pa[0]],[xr,pb[1],sd*pb[0]],7,7,stone());
    if(!dd)kput('acPane',[ex*(HX-DPX[i]+8),pm[1],sd*pm[0]],QB(tm,sd,ex),
      [2*Math.SQRT2*q1/n*1.02,9,1],CYAN);
    // the CULTURAL CENTER is a colonnade: a ring of deep arches all the way
    // round the diamond, which is the one feature of this elevation that reads
    // head-on with no shadow to help it, because it is a ring of black holes.
    if(i===2)kput('acArch',[ex*(HX-DPX[2]+1),pm[1],sd*pm[0]],qFacing([ex,0,0]),
      [3.2,3.0,2.2],null);
    // and the CITY CENTER boundary carries a ring of halls standing out of the face
    if(i===3){const hh=rr(11,19);
     kput('acBox',[ex*(HX-DPX[3]+hh*.5),pm[1],sd*pm[0]],QB(tm,sd,ex),[2*Math.SQRT2*q1/n*1.5,46,hh],stone());
     kput('acPane',[ex*(HX-DPX[3]+hh+.4),pm[1],sd*pm[0]],QB(tm,sd,ex),[2*Math.SQRT2*q1/n*1.1,22,1],winC(.8));}}
   // ---- true horizontal rows of windows on the band ------------------------
   // The lattice texture has no up. These do: walk world height, solve the
   // annulus for |z| at that height, and lay a row of panes along it.
   for(let y=CY-q0+10;y<CY+q0-9;y+=15){const dy=Math.abs(y-CY);
    const z0=Math.max(0,q1-dy),z1=Math.max(0,q0-dy);
    if(z1-z0<9)continue;
    for(const sd of [1,-1])for(let zz=z0+4;zz<z1-3;zz+=11){
     if(dd&&rng()<.38)continue;
     kput('acPane',[ex*(HX-DPX[i]+.5),y,sd*zz],qFacing([ex,0,0]),[6.6,3.2,1],winC(.34));}}}
  // ---- the rim of the void ---------------------------------------------------
  for(const sd of [1,-1]){const n=ringN(BR[4]);
   for(let j=0;j<n;j++){const tm=(j+.5)/n,pm=ZY(BR[4],tm);
    kput('acBox',[ex*(HX-DPX[3]+7),pm[1],sd*pm[0]],QX(TAN(tm,sd)),
     [2*Math.SQRT2*BR[4]/n*1.04,15,15],stone());}}}

 // ============================================================ THE VOID
 // A diamond bore 304 m across driven the whole 828 m through the middle of the
 // city, open at both ends. Its ceiling is the one true soffit in the model and
 // is painted black; its floor is a V stepped into eight terraces, which makes
 // the heart of a 1 km cube an amphitheatre 304 m wide and 828 m long.
 const VX=HX-DPX[3];
 for(const sd of [1,-1]){
  SHD.push(gridSurface((u,v)=>{const t=lerp(0,.5,v),p=ZY(BR[4],t);
    return[lerp(-VX,VX,u),p[1],sd*p[0]];},40,10,{uS:2*VX/14,vS:2*Math.SQRT2*BR[4]*.5/14}));
  DEK.push(gridSurface((u,v)=>{const t=lerp(.5,1,v),p=ZY(BR[4],t);
    return[lerp(-VX,VX,u),p[1],sd*p[0]];},40,10,{uS:2*VX/14,vS:2*Math.SQRT2*BR[4]*.5/14}));
  // the eight terraces of the floor, laid along the bore as 20 m blocks
  for(let j=0;j<8;j++){const t=.5+(j+.5)/16,p=ZY(BR[4],t);
   for(let x=-VX+10;x<VX-9;x+=20){
    if(dd&&rng()<.22)continue;
    kput('acBox',[x,p[1]-2.2,sd*(p[0]-4)],null,[20,4.4,17],deck());
    if(!dd&&j%2===0&&x%60<20)kput('strip',[x,p[1]+1.4,sd*(p[0]-11)],null,[18,14,14],CYAN);
    if(rng()<.10)person(x+rr(-8,8),p[1]+.4,sd*(p[0]-rr(2,10)));
    if(rng()<.30){const hh=rr(7,17);
     kput('acBox',[x+rr(-6,6),p[1]+hh*.5,sd*(p[0]-rr(5,11))],null,[rr(9,17),hh,rr(8,14)],stone());
     kput('acPane',[x,p[1]+hh*.5,sd*(p[0]-rr(5,11))-sd*7],qFacing([0,0,-sd]),[10,hh*.5,1],winC(.7));}
    else if(rng()<.30)plant(x+rr(-7,7),p[1]-.2,sd*(p[0]-rr(3,12)),rr(6,12));}}
  for(let x=-VX+20;x<VX-19;x+=40){
   kput('acBox',[x,CY+BR[4]*.52,sd*BR[4]*.48],QX([0,-1,sd]),[BR[4]*.72,7,7],deck());
   if(!dd&&x%120<40)kput('acPane',[x,CY+BR[4]*.50,sd*BR[4]*.46],QX([0,-1,sd]),[BR[4]*.6,3,1],CYAN);}
  // galleries on the two side vertices, where the bore is widest
  for(let x=-VX+16;x<VX-15;x+=32){
   if(dd&&rng()<.3)continue;
   kput('acBox',[x,CY-3,sd*(BR[4]-7)],null,[32,3,15],stone());
   for(let w2=0;w2<2;w2++)kput('acPane',[x,CY+6+w2*9,sd*(BR[4]-.6)],qFacing([0,0,-sd]),
     [24,5,1],winC(.6));}}
 // bridges across the void, and the light that says how deep it is
 for(let j=0;j<5;j++){const x=-320+j*160;
  kput('acBox',[x,CY,0],null,[16,4.5,2*BR[4]-6],stone());
  for(const sd of [1,-1])kput('acBox',[x+sd*7,CY+3.4,0],null,[2.2,2.6,2*BR[4]-6],stone());
  if(!dd)kput('strip',[x,CY-3,0],qEuler(0,Math.PI/2,0),[2*BR[4]-20,14,14],CYAN);}

 // ============================================================ THE APEX AND THE KEEL
 // The ridge and the keel are chamfered by 6 m of z, which is all it takes to
 // give a knife edge something to stand on, and costs the silhouette 6 m in
 // 1 414. The heliport deck sits ON the chamfer and its top face is the 1 500 m
 // the sheet asks for; the keel closes the bottom and hangs its spine below.
 const APY=CY+RD-CHAM, KEY=CY-RD+CHAM;
 MAS.push(gridSurface((u,v)=>[lerp(-HX,HX,u),APY,lerp(-CHAM,CHAM,v)],60,2,{uS:ACSIDE/25.6,vS:1}));
 SHD.push(gridSurface((u,v)=>[lerp(-HX,HX,u),KEY,lerp(-CHAM,CHAM,v)],60,2,{uS:ACSIDE/12,vS:1}));
 {const DHW=26;
  kput('acBox',[0,APY+3,0],null,[HX*1.84,6,DHW*2],deck());               // the deck
  for(const sd of [1,-1])kput('acDim',[0,APY-.8,sd*(CHAM+DHW)*.5],null,[HX*1.84,2.2,DHW-CHAM],null);
  for(let j=0;j<5;j++){const px=-380+j*190;
   kput('acPad',[px,APY+6.3,0],null,[17,.7,17],new THREE.Color(dd?0x4a4438:0xb4ac98));
   kput('acDim',[px,APY+6.8,0],null,[7,.3,7],null);
   if(!dd)for(let a2=0;a2<4;a2++)kput('strip',[px+Math.cos(a2*TAU/4)*19,APY+6.6,Math.sin(a2*TAU/4)*19],
     null,[7,11,11],CYAN);}
  // the working deck: hangars at the ends, a control block on the axis, a
  // balustrade and edge lights the whole 920 m, and the stair heads that come up
  // out of the two upper faces
  for(const sx of [-1,1]){
   kput('acBox',[sx*452,APY+10.5,0],null,[64,9,40],stone());
   kput('acPane',[sx*452,APY+10,sx*21],qFacing([0,0,sx]),[50,6,1],winC(.7));
   for(let j=0;j<3;j++){const hx=sx*(300-j*84);
    if(dd&&rng()<.4)continue;
    kput('acBox',[hx,APY+9.5,sx*15],null,[40,7,20],stone());
    kput('acPane',[hx,APY+9,sx*24.6],qFacing([0,0,sx]),[32,4.4,1],winC(.6));}}
  kput('acBox',[60,APY+19,0],null,[26,26,26],stone());
  for(const sx of [-1,1])kput('acPane',[60,APY+24,sx*13.4],qFacing([0,0,sx]),[20,9,1],winC(.9));
  for(let x=-455;x<=455;x+=17)for(const sx of [-1,1]){
   if(dd&&rng()<.35)continue;
   kput('acBox',[x,APY+7.4,sx*25],null,[17,2.8,1.6],stone());
   if(!dd&&x%68<17)kput('acPane',[x,APY+8.2,sx*26],qFacing([0,0,sx]),[15,1.4,1],CYAN);}
  for(let j=0;j<(dd?0:26);j++)person(rr(-430,430),APY+6.3,rr(-22,22));
  // THE MAST. Down in the ruin: a lattice at the top of a 1 500 m mass does not
  // outlast the city that guyed it.
  const MTX=-190,MTH=52;
  if(!dd){for(let s2=0;s2<6;s2++){const y0=APY+6+s2*MTH/6,y1=y0+MTH/6,r0=lerp(7,2,s2/6),r1=lerp(7,2,(s2+1)/6);
    for(let a2=0;a2<4;a2++){const A0=a2/4*TAU+.78,A1=(a2+1)/4*TAU+.78;
     beam('acBox',[MTX+Math.cos(A0)*r0,y0,Math.sin(A0)*r0],[MTX+Math.cos(A0)*r1,y1,Math.sin(A0)*r1],1.3,1.3,stone());
     beam('acBox',[MTX+Math.cos(A0)*r0,y0,Math.sin(A0)*r0],[MTX+Math.cos(A1)*r1,y1,Math.sin(A1)*r1],.8,.8,stone());}}
   kput('strip',[MTX,APY+6+MTH+3,0],null,[4,4,4],CYAN);
   kput('finial',[MTX,APY+6+MTH+8,0],null,[2.4,7,2.4],null);}
  else{for(let s2=0;s2<6;s2++){const t2=s2/6,t3=(s2+1)/6;
    beam('acBox',[MTX+18+t2*MTH*.8,APY+6.6,t2*MTH*.5],[MTX+18+t3*MTH*.8,APY+6.6,t3*MTH*.5],
     lerp(6,2,t2),lerp(6,2,t2),stone());}}}
 // the keel spine, the 960 m beam the whole belly hangs off
 kput('acBox',[0,KEY-11,0],null,[HX*1.92,22,46],stone());
 kput('acDim',[0,KEY-22.6,0],null,[HX*1.9,2,42],null);
 for(let x=-450;x<=450;x+=50){
  kput('acBox',[x,KEY-24.5,0],null,[26,5,58],deck());
  if(!dd&&x%150===0)kput('strip',[x,KEY-27.4,0],null,[42,14,14],CYAN);}

 // ============================================================ VERTICAL STRUCTURE
 // Four CORNER legs at the corners of the midlevel plan, rising 758 m to the
 // cube's equator vertices, and six BELLY legs at 500 m — a third of the height,
 // which is the proportion the brief asks for — standing where the lower faces
 // have climbed out far enough to sit on them. Every shaft is MITRED: its top
 // edge is cut by the plane of the face above it, computed from the same q
 // invariant as the face, so no leg can end in mid-air or bury its head.
 const LEGS=[];
 for(const ex of [-1,1])for(const sz of [-1,1])LEGS.push({x:ex*460,z:sz*672,w:34,dp:34,c:1});
 for(const lx of [-420,0,420])for(const sz of [-1,1])LEGS.push({x:lx,z:sz*414,w:30,dp:30,c:0});
 const faceYat=z=>CY-(RD-Math.abs(z));
 for(let li=0;li<LEGS.length;li++){const L=LEGS[li];
  const broke=dd&&L.c&&L.x>400&&L.z>400;            // the one that failed
  const topCut=broke?300:1;
  // the shaft: a square section swept up, its top edge riding the face above
  const shaft=gridSurface((u,v)=>{const a=u*4,si=Math.floor(a)%4,f=a-Math.floor(a);
    const cx=[-1,1,1,-1],cz=[-1,-1,1,1];
    const px=L.x+lerp(cx[si],cx[(si+1)%4],f)*L.w*lerp(1.25,.86,v);
    const pz=L.z+lerp(cz[si],cz[(si+1)%4],f)*L.dp*lerp(1.25,.86,v);
    const yt=broke?topCut+6*fbm(a*3,7.7,9616,2):faceYat(pz)-2;
    return[px,yt*v,pz];},20,broke?8:26,{uS:L.w*8/25.6,vS:(broke?topCut:700)/25.6});
  WRK.push(shaft);
  // the cap that closes the top, and the footing that closes the bottom
  if(!broke)DEK.push(gridSurface((u,v)=>{const px=L.x+(u-.5)*2*L.w*.86,pz=L.z+(v-.5)*2*L.dp*.86;
    return[px,faceYat(pz)-2,pz];},3,3,{uS:2,vS:2}));
  kput('acBox',[L.x,7,L.z],null,[L.w*2.9,14,L.dp*2.9],stone());
  kput('acBox',[L.x,18,L.z],null,[L.w*2.6,9,L.dp*2.6],stone());
  // the raking strut that carries the keel, on the belly legs only
  if(!L.c&&!broke)beam('acBox',[L.x,16,L.z*1.08],[L.x,KEY-18,0],11,11,stone());
  if(!dd&&!broke)for(let s2=1;s2<5;s2++){const y=s2*(faceYat(L.z)-40)/5;
   kput('strip',[L.x+L.w*1.1,y,L.z],qEuler(0,Math.PI/2,0),[L.dp*1.7,13,13],CYAN);}}
 // ties and diagonals between each corner leg and the belly leg beside it
 for(const ex of [-1,1])for(const sz of [-1,1]){
  const A={x:ex*460,z:sz*672},B={x:ex*420,z:sz*414};
  if(dd&&ex>0&&sz>0)continue;
  for(let s2=1;s2<=4;s2++){const y=s2*95;
   beam('acBox',[A.x,y,A.z],[B.x,y,B.z],7,7,stone());
   if(s2<4)beam('acBox',[A.x,y,A.z],[B.x,y+95,B.z],4.5,4.5,stone());}}
 // and across the belly, station to station
 for(const sz of [-1,1])for(const lx of [-420,0]){
  for(let s2=1;s2<=3;s2++){const y=s2*118;
   beam('acBox',[lx,y,sz*414],[lx+420,y,sz*414],6,6,stone());}}

 // ============================================================ THE GROUND WORKS
 // The whole 1 000 x 1 414 m footprint is under a mass that casts no shadow, so
 // it is PAINTED into shade: the apron under the cube is on the dark material and
 // the paving outside it is not, and the line between them is the building's own
 // plan drawn on the ground.
 SHD.push(gridSurface((u,v)=>[lerp(-HX-40,HX+40,u),.35,lerp(-RD-40,RD+40,v)],26,30,{uS:14,vS:18}));
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(1,1.9,v)*760*(1+.06*fbm(u*7,1.3,9617,2));
   return[Math.cos(th)*r*.78,.15,Math.sin(th)*r];},64,5,{uS:60,vS:10}));
 for(let j=0;j<22;j++){const a=j/22*TAU;
  kput('acBox',[Math.cos(a)*700,1.2,Math.sin(a)*860],qEuler(0,-a,0),[46,2.4,14],deck());}
 // the arrival plaza at the west end, on the axis of the city centre
 for(let s2=0;s2<3;s2++)GRD.push(gridSurface((u,v)=>
   [lerp(-1080+s2*40,-HX-30,u),.6+s2*1.1,lerp(-260+s2*44,260-s2*44,v)],10,10,{uS:24,vS:24}));
 for(let j=0;j<16;j++){const px=-1040+j*36;
  for(const sz of [-1,1]){kput('acCol',[px,23,sz*236],null,[4.6,46,4.6],stone());
   kput('acBox',[px,47.5,sz*236],null,[12,5,12],stone());
   if(!dd&&j%2===0)kput('strip',[px,44,sz*236],null,[12,9,9],CYAN);}}
 {const GX2=-HX-70;
  for(const sz of [-1,1])kput('acBox',[GX2,42,sz*104],null,[26,84,30],stone());
  kput('acBox',[GX2,90,0],qEuler(0,Math.PI/2,0),[236,14,32],stone());
  if(!dd)kput('strip',[GX2,80,0],qEuler(0,Math.PI/2,0),[190,12,12],CYAN);
  for(let j=0;j<7;j++)kput('acArch',[GX2-14,34,-96+j*32],qFacing([-1,0,0]),[3.4,3.2,3],null);}
 for(let j=0;j<(dd?70:120);j++){const px=rr(-1060,-HX-40),pz=rr(-250,250);
  if(rng()<.4)plant(px,.7,pz,rr(9,17));else person(px,.7,pz);}

 // ============================================================ THE RUIN
 if(dd){
  // ---- THE SPALL, and a real interior behind it -----------------------------
  // Four types in this kit have attempted a cutaway and failed for one reason: a
  // section needs deep solid fabric and a shell has none. This mass is 1 000 m
  // through, so the fabric is there — but only if it is MODELLED. What goes in
  // behind the bite is a liner 120 m back, fifteen floor plates spanning the gap,
  // a dark soffit under every one of them, partition fins and two service cores,
  // and the liner is cut by the SAME predicate as the face so the two agree.
  const LQ=120;
  MAS.push(gridSurface((u,v)=>{const x=lerp(SPX-SPW*1.1,SPX+SPW*1.1,u),
     t=lerp(SPT-SPTH*1.1,SPT+SPTH*1.1,v),p=ZY(RD-LQ,t);
    return[x,p[1],p[0]];},34,34,{uS:SPW*2.2/25.6,vS:SPTH*2.2*2*Math.SQRT2*RD/TILE,
    hole:(u,v)=>!spall(lerp(SPX-SPW*1.1,SPX+SPW*1.1,u),lerp(SPT-SPTH*1.1,SPT+SPTH*1.1,v),1)}));
  const spY0=CY+RD*(1-2*(SPT+SPTH)),spY1=CY+RD*(1-2*(SPT-SPTH));
  for(let y=spY0+10;y<spY1-8;y+=22){const t=TOFY(y),et=(t-SPT)/SPTH;
   const hw=SPW*Math.sqrt(Math.max(0,1-et*et));
   const zF=RD-(y-CY),zL=zF-LQ;
   for(let x=SPX-hw+12;x<SPX+hw-11;x+=24){
    if(!spall(x,t,1))continue;
    kput('acBox',[x,y,(zF+zL)*.5],null,[24,1.6,LQ*.92],new THREE.Color(0xb6ac9a));
    kput('acDim',[x,y-1.4,(zF+zL)*.5],null,[23,1.8,LQ*.9],null);
    if(Math.round(x/24)%3===0)kput('acDim',[x,y+11,(zF+zL)*.5],null,[1.8,22,LQ*.86],null);}}
  for(const cxz of [-56,58]){const t=TOFY((spY0+spY1)*.5);
   kput('acBox',[SPX+cxz,(spY0+spY1)*.5,RD-((spY0+spY1)*.5-CY)-LQ*.5],null,
    [18,spY1-spY0-20,20],new THREE.Color(0x8e8474));}
  // what came off it: a smear down the face below the bite, and a fan on the ground
  for(let j=0;j<160;j++){const t=SPT+SPTH+rr(.01,.30),x=SPX+rr(-1,1)*SPW*1.1;
   if(t>.5)continue;const p=ZY(RD,t);
   kput('rubble',[x,p[1]+rr(0,5),p[0]+rr(1,9)],qEuler(rng()*3,rng()*3,rng()*3),
    [rr(2,9),rr(1.4,6),rr(2,9)],new THREE.Color().setHSL(rr(.05,.10),rr(.08,.26),rr(.12,.26)));}
  rubbleRing(SPX,.4,RD+70,30,290,150,7);
  // ---- the leg that failed ----------------------------------------------------
  {const BX=530,BZ=750,BL=459;
   for(let s2=0;s2<6;s2++){const t2=s2/6,t3=(s2+1)/6,gp=s2*7;
    const w2=lerp(62,44,t2);
    beam('acBox',[BX+t2*325+gp,w2*.42+rr(-3,3),BZ+t2*324+gp],
                 [BX+t3*325-6+gp,w2*.42+rr(-3,3),BZ+t3*324-6+gp],w2,w2*1.12,stone());
    // the shaft's own floors, showing in the broken end of each piece
    for(let f2=0;f2<4;f2++)kput('acDim',[BX+t2*325+gp+3,w2*.16+f2*w2*.22,BZ+t2*324+gp+3],
      qEuler(0,-.78,0),[w2*.94,2.4,w2*1.04],null);}
   // and the stump, laid open at the break
   for(let f2=0;f2<5;f2++){const y=252+f2*11;
    kput('acBox',[460,y,672],null,[62,1.8,62],new THREE.Color(0xb6ac9a));
    kput('acDim',[460,y-1.5,672],null,[58,1.6,58],null);}
   rubbleRing(BX+150,2,BZ+140,24,290,140,9);
   for(let j=0;j<46;j++)kput('acBox',[BX+rr(-110,400),rr(2,15),BZ+rr(-110,380)],
     qEuler(rr(-.6,.6),rng()*TAU,rr(-.6,.6)),[rr(10,44),rr(3,10),rr(8,36)],new THREE.Color(0x8b8272));}
  // ---- overgrowth, staining, and the plain coming back ------------------------
  for(const sd of [1,-1]){
   for(let j=0;j<210;j++){const t=rr(TA+.02,.48),x=rr(-HX+10,HX-10);
    if(inWell(x,t)||gone(x,t,sd))continue;
    const p=ZY(RD,t),s2=rr(1.6,6);
    kput('moss',[x,p[1]+s2*.2,sd*p[0]],qEuler(0,rng()*TAU,0),[s2*rr(1,1.7),s2*rr(.24,.44),s2*rr(1,1.7)],
     new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.05,.12)));}
   for(let j=0;j<90;j++){const s=Math.floor(rng()*24)*TILE*4+2*TILE,t=s/(2*Math.SQRT2*RD);
    if(t>TK-.02)continue;const x=rr(-HX+10,HX-10);
    if(inWell(x,t)||gone(x,t,sd))continue;
    const p=ZY(RD-12,t);
    kput('vine',[x,p[1],sd*p[0]],qEuler(rr(-.12,.12),rng()*TAU,rr(-.12,.12)),
     [rr(1,2.2),rr(10,44),rr(1,2.2)],null);}
   // stainsFromLedge() aims its streaks radially off the world origin, which on
   // a rectilinear plan lays them flat across the faces. Per bay, off the face's
   // own normal, the direction is already to hand.
   for(let j=0;j<120;j++){const t=rr(TA+.03,.46),x=rr(-HX+10,HX-10);
    if(inWell(x,t)||gone(x,t,sd))continue;
    const p=ZY(RD,t),n=RAD(t,sd),L=rr(8,34);
    kput('stain',[x,p[1]-L*.4+n[1]*1.4,sd*p[0]+n[2]*1.4],qFacing([0,n[1],n[2]]),[rr(3,9),L,1],null);}}
  for(let j=0;j<120;j++){const x=rr(-HX,HX),z=rr(-RD,RD);
   if(rng()<.5)plant(x,.4,z,rr(6,15));}
  rubbleRing(0,.4,0,760,1020,220,8);
  trees(0,0,820,1500,90);}
 else trees(0,0,860,1500,50);

 // ---- the covered surface, measured -------------------------------------------
 // The sheet says 140 ha. A 1 km cube on its diagonal projects 1 000 x 1 414 m,
 // so this ought to come out at 141.4 — but the legs stand outside nothing and
 // the plaza is not the arcology, so it is integrated over the actual plan of the
 // mass on a 4 m lattice rather than multiplied out.
 let ACAR=0;
 for(let ax=-HX-6;ax<HX+6;ax+=4)for(let az=-RD-6;az<RD+6;az+=4)
  if(Math.abs(ax)<=HX&&Math.abs(az)<=RD)ACAR+=16;

 // ---- what the presets are derived from ----------------------------------------
 ARC_SITE[d]={x:gx,z:gz,d:d,dd:dd,SIDE:ACSIDE,RD:RD,HT:HTT,KY:KY,CY:CY,HX:HX,
  BR:BR.slice(),DPX:DPX.slice(),APY:APY,KEY:KEY,VX:VX,NWL:NWL,WWX:WWX,WDEP:WDEP,WQ:WQ,
  WT0:WT0,WT1:WT1,TA:TA,TK:TK,LEGY:LEGY,area:ACAR,
  WX:k=>-420+k*140,ZY:(q,t)=>ZY(q,t),TOFY:y=>TOFY(y),
  SP:{x:SPX,w:SPW,t:SPT,th:SPTH,y0:CY+RD*(1-2*(SPT+SPTH)),y1:CY+RD*(1-2*(SPT-SPTH))},
  LEG:LEGS.map(L=>({x:L.x,z:L.z,w:L.w,c:L.c,top:CY-(RD-Math.abs(L.z))}))};

 // ---- merge ---------------------------------------------------------------------
 meshMerged(RES,resM,G);
 meshMerged(WRK,wrkM,G);
 meshMerged(LAT,latM,G);
 meshMerged(MAS,masM,G);
 meshMerged(DEK,dekM,G);
 meshMerged(SHD,shdM,G);
 meshMerged(GRD,pavM,G);
 KOFF=[0,0,0];return G;}
