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
// THE BAND GRADIENT. The front elevation's bands were four near-identical creams,
// so the drawing's two white FRAMES round a darkening interior never came back.
// The same wall maps, tinted progressively down toward the void, and a frame
// concrete a step brighter than any wall, are what put the sheet's figure back:
// white frame, lattice, white frame, then darker and darker to a black bore.
MAT.acBand1 =new THREE.MeshStandardMaterial({map:TEX.acRes,roughnessMap:TEX.concreteRM,color:0x9d9483,emissive:0xffffff,emissiveMap:TEX.acResE,emissiveIntensity:.66,roughness:1,metalness:0,side:DS});
MAT.acBand1R=new THREE.MeshStandardMaterial({map:TEX.acResR,roughnessMap:TEX.concreteRM,color:0x7c7466,roughness:1,metalness:0,side:DS});
MAT.acFrame =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xf1ebdd,roughness:1,metalness:0,side:DS});
MAT.acFrameR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x938a7a,roughness:1,metalness:0,side:DS});
// THE PIERS' OWN WALL. The sheet draws the vertical structure as broad blocks
// with tall SLOT windows — several storeys to a slot, four slots to a bay — and
// that is a different figure from the dwelling grid, so it gets its own map: a
// 32 m tile, four 3.4 m slots 25 m tall with a storey mullion every 3.6 m, and a
// spandrel carrying the floor line between tiers. The lit storeys in a slot come
// from the same h3 lottery in the emissive map, as the dwelling grid's do.
function acPierTex(dec,lit){const S=lit?256:512;
 return canvasTex(S,S,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
  const bw=w/4,sw=bw*.42,sy0=h*.08,sy1=h*.86,st=(sy1-sy0)/7;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   const bi=Math.floor(x/bw),bx=x-bi*bw,sx0=(bw-sw)*.5;
   const inS=bx>sx0&&bx<sx0+sw&&y>sy0&&y<sy1;
   const si=Math.floor((y-sy0)/st),cr=h3(bi*5.13,si*3.37,4.4);
   let v=182+(fbm(x/40,y/40,5.1,3)-.5)*22;
   if(dec)v=v*.6+24+(fbm(x/8,y/60,8.8,2)-.5)*30;
   if(y>sy1+h*.03&&y<sy1+h*.06)v-=40;                   // the floor line
   let r=v,gg=v-3,b=v-9;
   if(inS){const my=(y-sy0)-si*st;
    if(lit){r=gg=b=0;if(!dec&&cr<.34&&my>1.5){const a=.4+cr*1.6;r=250*a;gg=170*a;b=92*a;}}
    else if(my<1.6){r=v*.55;gg=r;b=r;}                   // the storey mullion
    else if(!dec&&cr<.34){const f=.5+cr;r=230*f;gg=166*f;b=96*f;}
    else{const k2=dec?10:22;r=k2;gg=k2+2;b=k2+7;}}
   else if(lit){r=gg=b=0;}
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
TEX.acPier=acPierTex(0,0); TEX.acPierR=acPierTex(1,0); TEX.acPierE=acPierTex(0,1);
MAT.acPier =new THREE.MeshStandardMaterial({map:TEX.acPier,roughnessMap:TEX.concreteRM,emissive:0xffffff,emissiveMap:TEX.acPierE,emissiveIntensity:.7,roughness:1,metalness:0,side:DS});
MAT.acPierR=new THREE.MeshStandardMaterial({map:TEX.acPierR,roughnessMap:TEX.concreteRM,color:0x9a9080,roughness:1,metalness:0,side:DS});
// What the ruin shows where a corner of the cube has sheared away: raw broken
// fabric, darker than the weathered wall and warmer than the shade.
MAT.acBreak=new THREE.MeshStandardMaterial({map:TEX.acWrkR,roughnessMap:TEX.concreteRM,color:0x8a7f6c,roughness:1,metalness:0,side:DS});

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
// THE FRIEZE. The sheet's side elevation carries a row of downward triangles
// under the ridge and another at the equator. A triangular prism, base along its
// local top edge and apex one unit below, extruded 0..1 out of the wall: 8
// triangles an instance, so a kilometre of frieze costs nothing.
kdef('acTri',(function(){const s=new THREE.Shape();s.moveTo(-.5,0);s.lineTo(.5,0);s.lineTo(0,-1);s.lineTo(-.5,0);
 return new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false});})(),MAT.acKit);
// THE OVAL LIGHT WELL: a raised elliptical collar and the dark throat inside it.
// Scaled [width, height along the slope, projection] like every other piece.
kdef('acOvalRim',(function(){const s=new THREE.Shape();s.absellipse(0,0,.5,.5,0,TAU,false);
 const hl=new THREE.Path();hl.absellipse(0,0,.37,.37,0,TAU,true);s.holes.push(hl);
 return new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false,curveSegments:9});})(),MAT.acKit);
kdef('acOvalIn',new THREE.CylinderGeometry(.39,.39,1,18).rotateX(Math.PI/2).translate(0,0,.5),MAT.acVoid);
// ---------------------------------------------------------------- krShard
// A SHATTERED PIECE, for everything that has fallen onto a plain. Shared by the
// nine types of the arcC quality pass (Arcube, Trigon, Monolith, Crescent,
// Ledge, Wheel, Wing, Drum, Blades); it lives here because this fragment sorts
// first of them, but it is a hoisted function declaration so order is moot.
//
// A box laid on the ground reads as a building set down there, however it is
// tipped. A piece that FELL has a torn outline, and the storeys inside it tear
// back unevenly from the break, so each floor plate stands out past the one over
// it. So: a prism whose outline is a star-shaped polygon (sampled by angle, so a
// fan from the centre is always valid), straight along the edges that were the
// skin and bitten along the edges that were torn, stacked in `layers` storeys
// each bitten further than the one below.
//
// Local frame: x across (w), z along (l), y through the thickness (t), centred
// on the origin. brk = which edges are torn, [+z, +x, -z, -x]. Uses rng(), so it
// is deterministic under the calling builder's reseed. Returns non-indexed,
// flat-shaded geometries by role — top (every layer's upward face), bot, side
// (untorn edges), brk (torn edges) — any of which may be null, and rim: points
// on the torn edges at each storey line with their outward normals and the
// depth of the step there, for the caller's plates, rebar and rubble.
function krShard(o){
 const w=o.w,l=o.l,t=o.t,NL=Math.max(1,o.layers|0||1),brk=o.brk||[1,1,0,0];
 const bite=o.bite==null?.22:o.bite,tile=o.tile||25.6,seg=o.seg||14;
 const hw=w/2,hl=l/2,ca=Math.atan2(hl,hw);
 // side of an angle: 0 +z, 1 +x, 2 -z, 3 -x
 const sideOf=a=>{a=((a%TAU)+TAU)%TAU;if(a<ca||a>=TAU-ca)return 1;if(a<Math.PI-ca)return 0;if(a<Math.PI+ca)return 3;return 2;};
 const span=[[ca,Math.PI-ca],[-ca,ca],[Math.PI+ca,TAU-ca],[Math.PI-ca,Math.PI+ca]];
 const len=[w,l,w,l];
 // the outline's angles: the four corners exactly, and a run along each side
 const A=[];
 for(const s of [1,0,3,2]){const m=Math.max(3,Math.min(16,Math.round(len[s]/seg)));
  for(let i=0;i<m;i++)A.push({a:lerp(span[s][0],span[s][1],i/m),s:s,corner:i===0});}
 const N=A.length;
 // the rectangle's own radius at each angle
 const R0=A.map(v=>{const c=Math.abs(Math.cos(v.a)),s=Math.abs(Math.sin(v.a));
  return Math.min(c>1e-6?hw/c:1e9,s>1e-6?hl/s:1e9);});
 // is vertex i on a torn edge? a corner is torn if either side meeting there is
 const torn=A.map((v,i)=>{if(brk[v.s])return true;if(v.corner){const p=A[(i-1+N)%N].s;return !!brk[p];}return false;});
 // the bite, per vertex per layer, monotone upward: a few deep notches
 const F=[];let f0=A.map((v,i)=>{if(!torn[i])return 0;const deep=rng()<.18?rr(1.4,2.2):1;return bite*rr(.15,1)*deep;});
 // smooth the corners of a torn edge into the straight neighbour a little
 for(let k=0;k<NL;k++){F.push(f0.slice());f0=f0.map((f,i)=>torn[i]?Math.min(.8,f+bite*rr(0,.55)):0);}
 const V=(k,i,y)=>{const r=R0[i]*(1-F[k][i]);return[Math.cos(A[i].a)*r,y,Math.sin(A[i].a)*r];};
 const acc={top:[],bot:[],side:[],brk:[]},rim=[];
 const tri=(key,a,b,c)=>acc[key].push(a,b,c);
 const Y=k=>-t/2+t*k/NL;
 for(let k=0;k<NL;k++){const y0=Y(k),y1=Y(k+1),C1=[0,y1,0];
  if(k===0){const C0=[0,y0,0];for(let i=0;i<N;i++)tri('bot',C0,V(0,i,y0),V(0,(i+1)%N,y0));}
  for(let i=0;i<N;i++){const j=(i+1)%N;
   tri('top',C1,V(k,j,y1),V(k,i,y1));
   const key=(brk[A[i].s]||F[k][i]>0||F[k][j]>0)?'brk':'side';
   const a0=V(k,i,y0),a1=V(k,i,y1),b0=V(k,j,y0),b1=V(k,j,y1);
   tri(key,a0,b1,b0);tri(key,a0,a1,b1);
   if(key==='brk'&&k<NL-1){const m=[(a1[0]+b1[0])/2,y1,(a1[2]+b1[2])/2],ex=b1[0]-a1[0],ez=b1[2]-a1[2],el=Math.hypot(ex,ez)||1;
    const up=[(V(k+1,i,y1)[0]+V(k+1,j,y1)[0])/2,(V(k+1,i,y1)[2]+V(k+1,j,y1)[2])/2];
    rim.push({p:m,n:[ez/el,0,-ex/el],step:Math.hypot(m[0]-up[0],m[2]-up[1]),len:el,k:k});}
   else if(key==='brk'&&k===NL-1){const m=[(a1[0]+b1[0])/2,y1,(a1[2]+b1[2])/2],ex=b1[0]-a1[0],ez=b1[2]-a1[2],el=Math.hypot(ex,ez)||1;
    rim.push({p:m,n:[ez/el,0,-ex/el],step:0,len:el,k:k});}}}
 const geo=L=>{if(!L.length)return null;const pos=[],uv=[];
  for(let i=0;i<L.length;i+=3){const a=L[i],b=L[i+1],c=L[i+2];
   const e1=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],e2=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
   const nx=Math.abs(e1[1]*e2[2]-e1[2]*e2[1]),ny=Math.abs(e1[2]*e2[0]-e1[0]*e2[2]),nz=Math.abs(e1[0]*e2[1]-e1[1]*e2[0]);
   for(const q of [a,b,c]){pos.push(q[0],q[1],q[2]);
    if(ny>=nx&&ny>=nz)uv.push(q[0]/tile,q[2]/tile);else if(nx>=nz)uv.push(q[2]/tile,q[1]/tile);else uv.push(q[0]/tile,q[1]/tile);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;};
 // the rim's outward normal: the outline runs anticlockwise seen from -y, so
 // (ez,-ex) points out; check against the centre and flip if not
 for(const q of rim){if(q.n[0]*q.p[0]+q.n[2]*q.p[2]<0){q.n[0]=-q.n[0];q.n[2]=-q.n[2];}}
 // radius of layer k's outline at angle a, and whether (x,z) is m inside it
 const rAt=(k,a)=>{a=((a-A[0].a)%TAU+TAU)%TAU+A[0].a;let i=0;while(i<N-1&&A[i+1].a<=a)i++;
  const j=(i+1)%N,a1=j?A[j].a:A[0].a+TAU,f=(a-A[i].a)/Math.max(1e-6,a1-A[i].a);
  const pi=V(k,i,0),pj=V(k,j,0);return Math.hypot(lerp(pi[0],pj[0],f),lerp(pi[2],pj[2],f));};
 return{top:geo(acc.top),bot:geo(acc.bot),side:geo(acc.side),brk:geo(acc.brk),rim:rim,NL:NL,
  inside:(x,z,m,k)=>Math.hypot(x,z)<rAt(k==null?NL-1:k,Math.atan2(z,x))-(m||0),
  topY:k=>Y((k==null?NL-1:k)+1),
  // the lowest point of the piece once turned by q (a Quaternion), to bed it
  low:q=>{let m=1e9;const v=new THREE.Vector3();
   for(let i=0;i<N;i++)for(const y of [-t/2,t/2]){const p=V(0,i,y);v.set(p[0],p[1],p[2]).applyQuaternion(q);m=Math.min(m,v.y);}return m;},
  high:q=>{let m=-1e9;const v=new THREE.Vector3();
   for(let i=0;i<N;i++)for(const y of [-t/2,t/2]){const p=V(0,i,y);v.set(p[0],p[1],p[2]).applyQuaternion(q);m=Math.max(m,v.y);}return m;}};}
// krSeam: where a fallen piece meets the plain. Calls fn(x,y,z) at every
// `step`-th vertex of the given (already placed) geometries that lies within h
// of the ground, so the caller can pile its own fragments along the contact
// line and the piece is bedded in what it crushed rather than floating over, or
// sliced by, a flat plain.
function krSeam(geos,h,step,fn){for(const g of geos){if(!g||!g.attributes)continue;const p=g.attributes.position;
 for(let i=0;i<p.count;i+=step){const y=p.getY(i);if(y<h&&y>-h)fn(p.getX(i),y,p.getZ(i));}}}
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
 // THE SIDE ELEVATION'S FIGURE (sheet 7 fig. 3, sheet 8 fig. 1), in the profile
 // parameter t: a frieze of downward triangles on a dark band under the ridge
 // (t TA..FTA), a second one on the equator (FTE..0.5), and under the equator a
 // dark band carrying a row of oval light wells (0.5..FTD). The well at the
 // middle station is not a well: it is the CENTRAL SPINE, the vertical
 // circulation the sheet draws running ridge to piers, SPW m wide.
 const FTA=.036, FTE=.465, FTD=.56, FQ=RD-4, SPW2=30;
 const PIERX=440;                         // the blind corner piers of the envelope
 // THE PIERS. The sheet stands the diamond on three broad inhabited pier-blocks
 // in the front elevation and five in the side one, which is one grid seen two
 // ways: three rows along z, five stations along x. Rows at |z| = 380 rise to
 // meet the lower faces 380-560 m up; the middle row is short, stands under the
 // keel only at three stations, and leaves two 300 m spans of daylight under
 // it — the 86 m of keel clearance the header argues for is kept, it is simply
 // framed now instead of being the whole of the ground floor.
 const PRZ=380, PHX=52, PHZ=90, PCHZ=75;
 const PIERS=[];
 for(const pz of [-PRZ,PRZ])for(const px of [-420,-210,0,210,420])PIERS.push({x:px,z:pz,hx:PHX,hz:PHZ,c:0});
 for(const px of [-420,0,420])PIERS.push({x:px,z:0,hx:PHX,hz:PCHZ,c:1});
 // THE HELIPORT TOWER. Both front elevations draw it beside the upper-left face:
 // the north-west pier carried on up through the mass and out of the upper north
 // face, to a stepped, corbelled crown at 1 300 m. From the west (the sheet's
 // viewpoint) north is on the left.
 const HTX=-420, HTZ=-PRZ, HTTOP=1262;
 // THE RUIN'S FAILURES, all on the SOUTH-EAST: the pier under that corner went,
 // the corner of the cube over it sheared away, and the mass has settled BSAG
 // radians down toward it about a horizontal axis through the surviving piers.
 // QA (arcC): the bite now runs the WHOLE south vertex line, 280 m deep at the
 // west end and 400 m at the east: a gouge that started at x = -150 left both
 // end elevations a whole diamond, and the outline is what a ruin must change.
 const BX0=-HX-20, BRMAX=400, BSAG=dd?.07:0;
 const FAILX=420, FAILZ=PRZ, FAILH=150;

