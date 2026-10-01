// ================================================================= ARCOINDIAN I — the cliff-topography arcology
// A city built into an overhang bitten out of a cliff face: half constructed,
// half excavated. The rock is not scenery here, it is the site, and half the
// composition is rock.
//
// THE FIGURES ARE THE BRIEF, so they are constants and not guesses: population
// 20 000 at 1 791/ha, surface covered 10.5 ha (25 acres), height 220-450 m.
// The height figure is two numbers because it means two things, and both are
// built exactly:
//
//   220 m   the built city's OWN height. Its lowest terrace foot stands on the
//           rock shelf at y = 230 and the tallest tower tops out at y = 450.
//   450 m   the height of the composition above the ground it is seen from.
//           The plain at the cliff foot is y = 0, so the towers stand 450 m
//           over the transport works that arrive along the foot.
//
//   10.5 ha The plinth (an irregular lobed plan, ~116 m of radius at the front
//           and clipped against the cavern's back wall behind) plus nine
//           terraces stepping down and outward to r = 178 over 252 degrees of
//           arc, plus three satellite pods. Measured after the build, not
//           asserted: see the note at the foot of this file.
//
// THE SITE. The cliff runs east-west along x. Rock is at -z, the plain at +z,
// the plateau on top at y = 620. The face LEANS OUT with height — brow(y) runs
// from z = -120 at the foot to z = +112 at y = 470 — so the whole upper cliff
// overhangs, and the cavern is bitten into the underside of that overhang. The
// city is therefore in shade under a rock roof whose crown is at y = 520, and
// nothing in this kit casts a shadow, so the shade is MODELLED: the cavern
// shell is its own material three stops darker than the outer rock, and the
// city's concrete is a step darker than the kit's. Without that the overhang
// reads as a pale ceiling and the whole point of the type is lost.
//
// THE SECTION. The massif ENDS at x = 150 on a master joint — a near-planar
// face standing 620 m over the plain — and the cavern, the passages, the
// excavated chambers and two of the light wells are all cut by that plane and
// open onto it. That is the sheet's sagittal section, built rather than
// implied: from the east you look at a cut through cliff and city, with the
// cavern gaping in the middle of it and the rest of the city carrying on
// beyond. KNOWN_ISSUES records three types that tried a cutaway and could not
// make one read because they had no deep solid fabric to cut. A city excavated
// in rock has 900 m of it, which is why this one works.
//
// THE EXCAVATED HALF is the part that makes it a type rather than a terrace
// scheme, so it is not a texture on a wall: there are four levels of chambers
// running 330 m back into the massif, a 190 x 208 x 152 m buried CITY CENTER
// hall, eleven passages tying them to the back of the cavern, and fourteen
// light wells dropped from the plateau. Four of those wells come through the
// cavern roof and stand as shafts of daylight over the plinth.
//
// LIGHT WELLS AND THE NO-SHADOW PROBLEM. Plymouth logged it: a deep vertical
// void has no shadow, so from overhead it is a bright patch. Every well here is
// lined in the dark chamber material and rimmed with a raised collar, so from
// the plateau it reads as a black hole in a ring of stonework; and at the
// bottom of each one a pale disc is laid on the chamber floor, which is what a
// shaft of daylight actually looks like from inside when nothing else can cast
// one.
MAT.aiRock =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x8d6146,roughness:1,metalness:0,side:DS});
// The cavern's own shell. Three stops down on the same rock: this is the shade.
MAT.aiShade=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x4a372c,roughness:1,metalness:0,side:DS});
// The cut face at x = 150. A shade lighter and cleaner than the weathered face,
// because a joint plane is fresh rock and has to read as a cut, not as a cliff.
MAT.aiCut  =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xa2795a,roughness:1,metalness:0,side:DS});
MAT.aiVoid =new THREE.MeshStandardMaterial({color:0x0b0c0f,roughness:1,metalness:0,side:DS});
// What an excavated chamber is lined with. Not black: a chamber the eye cannot
// read is the same as no chamber at all, and the section depends on reading it.
MAT.aiRoom =new THREE.MeshStandardMaterial({color:0x453c31,roughness:.94,metalness:.12,side:DS});
// The CITY's concrete, and it is a long way below the kit's 0xd2cec6. Every
// square metre of it is under a rock roof, nothing here casts a shadow, and a
// 1.7-intensity sun turns kit concrete into white paper: the shade has to be
// in the pigment or it is nowhere. Two stops down on the wall, four on the
// deck, which is also what gives a terrace an edge against its own riser.
MAT.aiWall =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xa79d8b,roughness:1,metalness:0,side:DS});
MAT.aiWallR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x6e6659,roughness:1,metalness:0,side:DS});
MAT.aiDeck =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x6c6456,roughness:1,metalness:0,side:DS});
MAT.aiDeckR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x484238,roughness:1,metalness:0,side:DS});
// Near-white, so instanceColor can carry both the decay darkening and the
// per-dwelling tone on one material, but not white: the same shade problem.
MAT.aiKit  =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xc2baa8,roughness:1,metalness:0,side:DS});
// The pool of daylight at the foot of a light well. A flat disc of pale grey
// reads as a sheet of paper dropped on the deck — the first cut did exactly
// that — so it is a radial falloff, additively blended and unlit: it BRIGHTENS
// whatever it lies on instead of painting over it, which is the only way to
// draw a shaft of daylight in an engine that cannot cast one.
TEX.aiPool=canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);
 const gr=g.createRadialGradient(64,64,0,64,64,62);
 for(let i=0;i<=10;i++){const t=i/10;gr.addColorStop(t,'rgba(255,248,232,'+(Math.pow(1-t,1.7)*.50).toFixed(3)+')');}
 g.fillStyle=gr;g.fillRect(0,0,w,h);});
TEX.aiPool.wrapS=TEX.aiPool.wrapT=THREE.ClampToEdgeWrapping;
MAT.aiPool =new THREE.MeshBasicMaterial({map:TEX.aiPool,color:0xffffff,transparent:true,
 blending:THREE.AdditiveBlending,depthWrite:false,side:DS});
kdef('aiPane',new THREE.PlaneGeometry(1,1),MAT.dot);          // 2 tris. ~11 000 of them.
kdef('aiGlz',new THREE.PlaneGeometry(1,1),MAT.glass);
kdef('aiBox',new THREE.BoxGeometry(1,1,1),MAT.aiKit);
kdef('aiBoxD',new THREE.BoxGeometry(1,1,1),MAT.aiVoid);
kdef('aiPost',new THREE.CylinderGeometry(.9,1.06,1,8).translate(0,.5,0),MAT.aiKit);
kdef('aiDrum',new THREE.CylinderGeometry(1,1,1,16),MAT.aiKit);
kdef('aiHex',new THREE.CylinderGeometry(1,1,1,6),MAT.aiKit);
kdef('aiPortal',arcWindowGeo(8,12,1.8),MAT.aiVoid);
kdef('aiPool',new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),MAT.aiPool);
// plymQuadGeo is shared (src/88-plymouth.js). A balcony is a floor, a front and
// two ends; a box apiece would be three times the triangles for a solid nobody
// can see the inside of. Cross-cutting note in KNOWN_ISSUES says reuse beats
// per-fragment purity, so this file reuses it rather than shipping a second one.
kdef('aiBalc',plymQuadGeo([
  [-.5,0,0, .5,0,0, .5,0,1, -.5,0,1],
  [-.5,0,1, .5,0,1, .5,1,1, -.5,1,1],
  [-.5,0,0, -.5,0,1, -.5,1,1, -.5,1,0],
  [ .5,0,0, .5,1,0, .5,1,1, .5,0,1]],2,1),MAT.aiKit);
// A stair run climbing along +z with +x across the going, so qFacing(tangent)
// lays it ALONG a terrace: 11.6 m of rise wants 19 m of going and no terrace
// here is deep enough to take that perpendicular to its own riser.
kdef('aiStair',(function(){const Q=[[-.5,0,0, .5,0,0, .5,1,1, -.5,1,1]];
 for(let i=0;i<16;i++){const t=(i+.5)/16;Q.push([-.5,t,t-.03, .5,t,t-.03, .5,t,t+.03, -.5,t,t+.03]);}
 Q.push([-.5,0,0, -.5,.07,0, -.5,1.07,1, -.5,1,1]);
 Q.push([ .5,0,0, .5,1,1, .5,1.07,1, .5,.07,0]);
 return plymQuadGeo(Q,2,3);})(),MAT.aiKit);
// Presets are DERIVED from this: targets/arcoindian/91z-views.js runs after
// 90-scene.js, so both builders have already left their dimensions here.
const AI_SITE={};

function buildArcoindian(scene,gx,gz,d){reseed(9580+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0;
 const wallM=dd?MAT.aiWallR:MAT.aiWall, deckM=dd?MAT.aiDeckR:MAT.aiDeck;
 const BX='aiBox', BXD='aiBoxD';
 const ROCK=[],SHADE=[],CUT=[],RM=[],SH=[],DK=[],GRD=[];

 // ---- the numbers ----------------------------------------------------------
 const XW=-1560,XS=150;             // the model's west taper; the section cut
 const CT0=620;                     // plateau height over the massif
 const SHELF=226;                   // the rock shelf the city stands on
 const ZBK=-1320;                   // the plateau runs back to here and grades out
 const XA=-560;                     // the cavern closes to nothing here
 const HR0=300,LIPF=.83;            // cavern rise (crown 526) and where the brow lip sits
 const PCX=-130,PCZ=-270;           // the city's centre in plan
 // 100 / 200 / 9 is the one set of radii that lands on the sheet's 10.5 ha. The
 // plinth is r=100 over the front 230 degrees and reaches ~118 behind, where it
 // runs back into the rock; nine terraces step out 11.1 m and down 11.33 m each,
 // which is a 46 degree stack — steep, and correct, because these are terraces
 // cut into a cliff and not a wedding cake. Measured after the build: see AREA.
 const RPL=100,RTE=200,NT=9;        // plinth radius, outermost terrace, terrace count
 // 332 and 230 are not free numbers. The lowest terrace deck is at 230 and the
 // tallest tower is 118 m on a 332 m plinth, so the city's own height is
 // 450 - 230 = 220 m and its top stands 450 m over the plain at the cliff foot.
 // Both of the sheet's height figures, exactly, from the same two constants.
 const PY=332,TY0=230;
 const TST=(PY-TY0)/NT;             // 11.33 m a terrace
 const TWR=[{a:.62,r:26,h:118,k:'cty',n:'City centre'},
            {a:2.74,r:23,h:104,k:'cul',n:'Cultural centre'},
            {a:4.61,r:20,h:92,k:'res',n:'Residential'}];
 const RPLZ=26,RPRM=42;             // the central plaza, and the promenade ring outside it

 // ---- the rock -------------------------------------------------------------
 // ctop tapers the plateau away at the west end so the cliff grades into the
 // plain instead of stopping as a sheer mesa wall.
 const ctop=x=>CT0*clamp(1-Math.pow(clamp((-x-620)/820,0,1),1.5),.07,1);
 // THE OVERHANG, as one function. The nominal face leans out 232 m between the
 // foot and y=470 and then pulls back into a caprock. Everything else — the
 // cavern, the shelf, the lift towers — is measured off this line.
 const brow=y=>-120+232*Math.pow(clamp(y/470,0,1),1.35)-38*Math.pow(clamp((y-470)/150,0,1),1.2);
 // Relief, subtracted from z, i.e. cut INTO the rock. Keyed to lengths a cliff
 // actually has: gullies every ~50 m, benches at four discrete levels (a
 // quantised sine is the one term that reads as rock and not as drapery),
 // bedding that dips and wanders, and a fine break-up at ~33 m.
 // The first cut leaned on bedding sines and came back reading as plywood: the
 // geometric banding and the board-formed texture's own horizontal lines were
 // at the same scale and reinforced each other. The sines are now half the
 // amplitude, the bench step is 5 m rather than 7, and most of the relief is
 // carried by gullies and a four-octave roughness, which have no preferred
 // direction. The texture tiles were tripled at the same time (see uS/vS).
 const rel=(x,y)=>4.5*Math.sin(y*.072+x*.0021+fbm(x*.0024,0,9584,2)*7)
   +2.0*Math.sin(y*.25+fbm(x*.006,0,9585,2)*9)
   +5*Math.round(Math.sin(y*.042+fbm(x*.003,0,9586,2)*6)*2)/2
   +30*Math.pow(Math.abs(fbm(x*.021,y*.004,9587,3)-.5)*2,2.1)
   +13*Math.pow(Math.abs(fbm(x*.038,y*.011,9588,2)-.5)*2,1.5)
   +28*fbm(x*.0095,y*.012,9589,4)+13*fbm(x*.031,y*.021,9591,3);
 const faceZ=(x,y)=>brow(y)-rel(x,y)
   +44*Math.pow(clamp(1-y/190,0,1),1.7)                       // talus banking out at the foot
   +11*Math.pow(clamp((y-ctop(x)*.88)/(ctop(x)*.12+1),0,1),1.2);  // the caprock lip

 // THE PLATEAU, as a function rather than as a surface. Everything standing on
 // the cliff top — the well collars, the haul road, the spoil, the scrub — has
 // to sit on the SAME height the plateau surface uses, including its 16 m of
 // noise. The first cut used the nominal ctop() for the furniture and the noisy
 // surface for the ground, and buried the whole haul road.
 const fall=z=>clamp((z-ZBK)/420,0,1);
 const platY=(x,z)=>{const z0=faceZ(x,ctop(x))+3;
  const v=Math.pow(clamp((z0-z)/(z0-ZBK),0,1),1/.82);
  return ctop(x)*fall(z)+16*(fbm(x*.0042,z*.0042,9601,3)*2-1)*Math.min(1,v*6)*fall(z);};

 // ---- the cavern -----------------------------------------------------------
 // It closes to nothing at XA and is at FULL section where the massif is cut,
 // so the section really does show a cavern and not the tail of one.
 const cf=x=>clamp((x-XA)/240,0,1);
 // The roof fall is chosen in the plan block below, after the PRNG has been
 // used for the chamber layout, so the vault's own bite is read through a
 // holder rather than a constant. Same value, one source.
 const SCAR={o:null};
 const scarY=(x,z,s)=>{const I=SCAR.o;if(!I)return 0;
  const k2=clamp((1-Math.hypot(x-I.x,z-I.z)/I.r)*3,0,1);
  return k2*(46+20*(fbm(x*.02,z*.02,9612,2)*2-1))*Math.min(1,s*3);};
 const HR=x=>HR0*Math.pow(cf(x),.75);
 const ZB=x=>-70-300*Math.pow(cf(x),.8);
 const lipY=x=>SHELF+LIPF*HR(x)*(1+.085*(fbm(x*.0055,.4,9592,3)*2-1));
 const lipZ=x=>faceZ(x,lipY(x))+5;      // 5 m PROUD of the face: see the note below
 const topY=x=>SHELF+.58*HR(x);
 // The roof profile, front lip to back-wall head, as one quadratic Bezier whose
 // control point is placed so the crown lands on SHELF+HR.
 const bez=(x,s)=>{const z0=lipZ(x),y0=lipY(x),z2=ZB(x),y2=topY(x);
  const z1=lerp(z0,z2,.45),y1=SHELF+HR(x)*1.30;
  const a=(1-s)*(1-s),b=2*s*(1-s),c=s*s;
  return[a*z0+b*z1+c*z2,a*y0+b*y1+c*y2];};
 // THE VAULT'S RELIEF, as its own function. The shell adds up to 23 m of noise
 // to the Bezier, and roofY() originally returned the smooth curve — so every
 // light shaft dropped through the vault was placed against a roof that is not
 // where the roof is, and three of them hung fifteen metres below the ceiling
 // like buckets on a string. Nothing in --assert can see that; it took reading
 // the render. Both the surface and everything measured against it now call
 // this, so they cannot disagree again.
 const roofN=(x,z,s)=>((fbm(x*.014,z*.014,9599,3)*2-1)*17
   +(fbm(x*.046,z*.046,9623,2)*2-1)*6)*Math.min(1,s*5);
 // Height of the roof over a point on the floor. Sampled rather than inverted:
 // z(s) is monotone along the roof, so 20 steps and a lerp is exact enough and
 // cannot produce the NaN an analytic inverse would at the ends.
 const roofY=(x,z)=>{if(HR(x)<6)return -1;let p=bez(x,0);
  for(let i=1;i<=20;i++){const q=bez(x,i/20);
   if((z<=p[0]&&z>=q[0])||(z>=p[0]&&z<=q[0])){const t=(z-p[0])/((q[0]-p[0])||1);
    return lerp(p[1],q[1],t)+roofN(x,z,(i-1+t)/20)+scarY(x,z,(i-1+t)/20);}
   p=q;}
  return -1;};
 const inCav=(x,y,z)=>{if(HR(x)<14||y<=SHELF+2||z<=ZB(x)+1||z>=lipZ(x))return false;
  const ry=roofY(x,z);return ry>0&&y<ry-1;};
 // The mouth, as a hole in the cliff face. Same lip curve as the shell.
 const inMouth=(x,y)=>HR(x)>14&&y>SHELF+3&&y<lipY(x);

 // ---- the plan -------------------------------------------------------------
 // "An irregularly shaped set of many terraces." The irregularity is ONE lobing
 // function: the plinth's own outline. Every terrace inherits it and adds a
 // little of its own, so the nine outlines are a family rather than nine
 // unrelated blobs, and terrace 0 IS the plinth edge by construction.
 const RPn=th=>RPL*(1+.21*(fbm(2.3*Math.cos(th),2.3*Math.sin(th),9595,3)*2-1)
   +.07*Math.sin(th*3.3+1.4)-.05*Math.sin(th*5.1));
 // tf() is how far the terrace stack has grown at this bearing: 1 across the
 // front, 0 where the plinth turns and runs back into the rock. It PINCHES the
 // stack out rather than stopping it, so at the flanks the nine risers collapse
 // onto the plinth's own wall and the stack closes itself. An arc that simply
 // ended would leave nine cut terrace ends hanging in the air, which is the
 // sort of thing --assert cannot see and a render shows immediately.
 const tf=th=>{const t=clamp((Math.sin(th)+.62)/.42,0,1);return t*t*(3-2*t);};
 const hasT=th=>tf(th)>.05;
 const RT=(k,th)=>RPn(th)*(1+.17*(k/NT)*(fbm(2.4*Math.cos(th)+k*.7,2.4*Math.sin(th)-k*.4,9596,3)*2-1))
   +k*((RTE-RPL)/NT)*tf(th)*(1+.30*(fbm(1.7*Math.cos(th)+k*1.3,1.7*Math.sin(th),9626,2)*2-1));
 const TY=k=>PY-k*TST;
 // The plinth's own outline: the front lobing, extended back toward the rock,
 // then MARCHED in until it is 18 m INSIDE the cavern's back wall. Buried, not
 // butted: a plinth that stops two metres short of the rock leaves a 100 m slot
 // behind it that no camera can be kept out of. Marching rather than solving is
 // what keeps the two in agreement when the wall's own noise moves.
 const NA=128,RPLAN=new Array(NA);
 for(let i=0;i<NA;i++){const th=i/NA*TAU,s=Math.sin(th);
  let r=RPn(th)+(s>-.40?0:clamp((-.40-s)/.60,0,1)*86);
  for(let g=0;g<60;g++){const x=PCX+Math.cos(th)*r,z=PCZ+Math.sin(th)*r;
   if(z>ZB(x)-18&&x<XS-26)break;
   r-=4;}
  RPLAN[i]=Math.max(40,r);}
 // where the roof let go, and what it landed on
 const IMP=dd?{x:PCX+rr(-24,74),z:PCZ+rr(-16,66),r:64}:null;
 SCAR.o=IMP;
 const Rplinth=th=>{const f=((th%TAU)+TAU)/TAU*NA,i=Math.floor(f);
  return lerp(RPLAN[i%NA],RPLAN[(i+1)%NA],f-i);};
 // How far forward the outermost terrace reaches at each x. The rock shelf has
 // to be at least that wide or the city stands on air, and the shelf's own
 // front edge follows the weathered face, which wanders +/-25 m. Sampling the
 // outline and taking the maximum per x-bin is the only way the two can be made
 // to agree without hand-tuning one against the other.
 const RB0=PCX-230,RBW=16,RBN=Math.ceil(460/RBW)+1,REACH=new Array(RBN).fill(-1e9);
 for(let i=0;i<360;i++){const th=i/360*TAU;if(!hasT(th))continue;
  const r=RT(NT,th),x=PCX+Math.cos(th)*r,z=PCZ+Math.sin(th)*r;
  const b=clamp(Math.round((x-RB0)/RBW),0,RBN-1);
  for(let q=Math.max(0,b-1);q<=Math.min(RBN-1,b+1);q++)if(z>REACH[q])REACH[q]=z;}
 const reachZ=x=>{const f=clamp((x-RB0)/RBW,0,RBN-1.001),i=Math.floor(f);
  return lerp(REACH[i],REACH[i+1],f-i);};
 // The shelf's outer edge: the weathered face where that is far enough forward,
 // and a projecting rock buttress where it is not.
 const shelfE=x=>Math.max(faceZ(x,SHELF),reachZ(x)+18);

 // ---- what is cut into the rock --------------------------------------------
 // Four levels of chambers running back from the cavern, plus the buried CITY
 // CENTER hall. The hall is deliberately the one that reaches the section cut,
 // because a 152 m room laid open in a cliff face is the single image that
 // says "half of this city is excavated".
 const HALL={x0:-46,x1:XS,y0:302,y1:452,z0:-700,z1:-460};
 const LEV=[
  {y0:232,y1:292,z0:-790,z1:-460,k:'ind',n:'Industries',x0:-470,x1:XS},
  {y0:312,y1:374,z0:-734,z1:-460,k:'dwe',n:'Dwellings',x0:-470,x1:-76},
  {y0:386,y1:446,z0:-682,z1:-460,k:'dwe',n:'Dwellings',x0:-470,x1:-76},
  {y0:458,y1:512,z0:-636,z1:-464,k:'mee',n:'Meeting areas',x0:-440,x1:XS}];
 // Rooms along each level, irregular in both length and depth. The pillars
 // between them are what make the section read as excavation rather than as one
 // long slot, so they are never less than 14 m.
 const ROOMS=[];
 LEV.forEach((L,li)=>{let x=L.x0,last=null;
  while(x<L.x1-30){const w=rr(56,104),x1=Math.min(x+w,L.x1);
   if(x1-x>34){const zd=rr(.55,1.0);
    last={x0:x,x1:x1,y0:L.y0,y1:L.y1,z0:lerp(L.z1,L.z0,zd),z1:L.z1,k:L.k,n:L.n,lev:li,cut:false};
    ROOMS.push(last);}
   x=x1+rr(14,26);}
  // A level whose east end reaches the section plane MUST land on it. Left to
  // the walk it does not: the last room stops wherever rr(56,104) put it, and
  // the first cut of this type showed one chamber on the cut in the intact
  // variant and two in the ruin, purely on the draw. The section is the whole
  // point of the type; it does not get to be luck.
  if(L.x1>=XS-1&&last){
   if(L.x1-last.x1<42){last.x1=L.x1;last.cut=true;}
   else ROOMS.push({x0:last.x1+rr(15,24),x1:L.x1,y0:L.y0,y1:L.y1,
     z0:lerp(L.z1,L.z0,rr(.6,1.0)),z1:L.z1,k:L.k,n:L.n,lev:li,cut:true});}});
 ROOMS.push({x0:HALL.x0,x1:HALL.x1,y0:HALL.y0,y1:HALL.y1,z0:HALL.z0,z1:HALL.z1,
             k:'cty',n:'City centre (excavated)',lev:9,cut:true,hall:true});
 const inRoom=(x,y,z)=>{for(let i=0;i<ROOMS.length;i++){const R=ROOMS[i];
   if(x>R.x0-1&&x<R.x1+1&&y>R.y0-1&&y<R.y1+1&&z>R.z0-1&&z<R.z1+1)return R;}return null;};

 // Passages: from the back of the cavern into the rock. One per room that
 // touches the wall, at that room's own mid-height, 14 x 13 in section.
 const PASS=[];
 ROOMS.forEach(R=>{if(R.z1<-400)return;
  const px=clamp((R.x0+R.x1)*.5+rr(-14,14),R.x0+12,R.x1-12);
  if(px>XS-24)return;
  const py=R.hall?R.y0+18:R.y0+4;
  PASS.push({x:px,y:py,z0:R.z1,z1:ZB(px)-2,w:R.hall?22:14,h:R.hall?20:13,k:R.k});});
 // One passage is cut lengthways by the section plane, so the section shows a
 // tunnel in long section as well as the rooms in cross-section.
 PASS.push({x:XS,y:318,z0:HALL.z1,z1:ZB(XS)-2,w:18,h:15,k:'cty',half:true});

 // THE STAIR SHAFT. A vertical circulation shaft on the cut plane, from the
 // industries floor up to the meeting-area level, with a landing at each
 // chamber. It is here because the section needed something that runs ACROSS
 // the levels: without it the cut face is four unrelated windows in 560 000 m2
 // of rock, and it is what tells you the excavated half is one building.
 const STAIR={x:XS,z:-524,w:19,y0:LEV[0].y0+2,y1:LEV[3].y1-4};

 // Light wells. Ten into the buried chambers, four through the cavern roof and
 // down over the plinth. Two of them sit exactly on the cut so the section
 // shows a shaft in long section running 200 m up to daylight.
 const WELL=[];
 ROOMS.forEach(R=>{if(R.lev===0)return;                      // industries wants no daylight
  const n=R.hall?3:(rng()<.5?1:0);
  for(let i=0;i<n;i++){const half=!!R.hall&&i===2;
   const wx=half?XS:(R.hall?lerp(R.x0+26,R.x1-30,(i+.5)/2):rr(R.x0+18,R.x1-18));
   const wz=R.hall?(R.z0+R.z1)*.5+rr(-13,13):rr(R.z0+24,R.z1-24);
   WELL.push({x:Math.min(wx,XS),z:wz,r:rr(8,15),y0:R.y1-2,room:R,half:half});}});
 // The four that come down through the VAULT and stand as shafts of daylight
 // over the plinth. They have to land ON the plinth and NOT on a tower, and
 // the plinth's lobing runs 67 to 133 m, so both are tested rather than
 // assumed — a light pool hanging in the air off the edge of the deck is
 // exactly the class of error --assert cannot see.
 const TPOS=TWR.map(T=>{const rd=Math.min(64,Rplinth(T.a)-T.r-10);
  return[PCX+Math.cos(T.a)*rd,PCZ+Math.sin(T.a)*rd,T.r];});
 for(let i=0;i<4;i++){const wr=rr(10,16);let wx=PCX,wz=PCZ,got=false;
  for(let g=0;g<24&&!got;g++){const a3=(i+rr(.12,.88))/4*TAU;
   const r3=Math.min(rr(26,74),Rplinth(a3)-wr-16);
   if(r3<wr+RPLZ*.6)continue;
   wx=PCX+Math.cos(a3)*r3;wz=PCZ+Math.sin(a3)*r3;
   got=!TPOS.some(t=>Math.hypot(wx-t[0],wz-t[1])<t[2]+wr+14);}
  if(got)WELL.push({x:wx,z:wz,r:wr,y0:roofY(wx,wz)-4,cav:true});}
 const wellY1=W=>platY(W.x,W.z)+2;
 const inWell=(x,z,pad)=>{for(let i=0;i<WELL.length;i++){const W=WELL[i];
   const dx=x-W.x,dz=z-W.z,rr2=W.r+(pad||0);
   if(dx*dx+dz*dz<rr2*rr2)return W;}return null;};

 // ---- what the section plane opens -----------------------------------------
 // Every opening on the cut face, as rectangles in (z,y). The face is punched
 // by the SAME list the chambers are built from, so a room cannot be drawn
 // behind unbroken rock — which is the failure mode that killed the cutaways in
 // the Forest Ring and Arcbeam.
 const CUTO=[];
 ROOMS.forEach(R=>{if(R.cut)CUTO.push([R.z0,R.z1,R.y0,R.y1]);});
 PASS.forEach(P=>{if(P.half)CUTO.push([Math.min(P.z0,P.z1),Math.max(P.z0,P.z1),P.y,P.y+P.h]);});
 WELL.forEach(W=>{if(W.half)CUTO.push([W.z-W.r,W.z+W.r,W.y0,wellY1(W)]);});
 CUTO.push([STAIR.z-STAIR.w*.5,STAIR.z+STAIR.w*.5,STAIR.y0,STAIR.y1]);
 const inCutO=(z,y)=>{for(let i=0;i<CUTO.length;i++){const C=CUTO[i];
   if(z>C[0]+5&&z<C[1]-5&&y>C[2]+4&&y<C[3]-4)return true;}return false;};

 // ---- registry -------------------------------------------------------------
 REGISTER({name:'Arcoindian I — cliff arcology ('+STATE(d)+')',x:PCX,z:PCZ,r:430,h:660});
 REGISTER({name:'Arcoindian I — the overhang',x:-160,z:-150,r:360,y:SHELF-10,h:310});
 REGISTER({name:'Arcoindian I — the courtyard plinth',x:PCX,z:PCZ,r:150,y:PY-18,h:30});
 REGISTER({name:'Arcoindian I — the central plaza and promenade',x:PCX,z:PCZ,r:RPRM+6,y:PY-10,h:26});
 REGISTER({name:'Arcoindian I — the terraces',x:PCX,z:PCZ,r:RTE+10,y:TY0-6,h:PY-TY0+12});
 REGISTER({name:'Arcoindian I — gardens against the rock',x:PCX,z:PCZ-96,r:82,y:PY-6,h:34});
 REGISTER({name:'Arcoindian I — the section cut',x:XS-40,z:-430,r:300,h:CT0});
 REGISTER({name:'Arcoindian I — the cliff foot, transportation',x:PCX,z:-30,r:300,h:110});

 // ---- the cliff face -------------------------------------------------------
 // The mouth is cut 9 m SHORT of the lip and starts 14 m ABOVE the shelf. Both
 // margins are deliberate: gridSurface drops whole quads, so a hole whose edge
 // is the exact boundary leaks up to one cell of daylight where the cavern
 // shell does not quite reach. Shrinking the hole puts a rock brow over the
 // mouth and a rock lip along the front of the shelf, which is what an
 // undercut cliff has anyway.
 const mouthHole=(x,y)=>HR(x)>14&&y>SHELF+9&&y<lipY(x)-9;
 ROCK.push(gridSurface((u,v)=>{const x=lerp(XW,XS,u),y=v*ctop(x);
   return[x,y,faceZ(x,y)];},252,80,{uS:(XS-XW)/78,vS:CT0/70,
   hole:(u,v)=>mouthHole(lerp(XW,XS,u),v*ctop(lerp(XW,XS,u)))}));
 // the plateau, lapping 3 m forward over the face top and grading to the plain
 // at the back of the model
 ROCK.push(gridSurface((u,v)=>{const x=lerp(XW,XS,u);
   const z0=faceZ(x,ctop(x))+3,z=lerp(z0,ZBK,Math.pow(v,.82));
   return[x,platY(x,z),z];},
   160,48,{uS:(XS-XW)/78,vS:16,
   hole:(u,v)=>{const x=lerp(XW,XS,u),z0=faceZ(x,ctop(x))+3,z=lerp(z0,ZBK,Math.pow(v,.82));
    return !!inWell(x,z,0);}}));
 // THE BROW FRINGE. gridSurface drops whole quads, so the mouth's top edge came
 // back as a flight of 7 x 7 m stairs cut in the rock — the single most
 // artificial thing in the first renders. This is a 32 m band of rock lying 5 m
 // proud of the face along the lip, which covers the stepped edge with a lip a
 // real rock shelter has anyway, and gives the brow a shadow line of its own.
 ROCK.push(gridSurface((u,v)=>{const x=lerp(XA,XS,u),ly=lipY(x),y=ly-15+v*33;
   return[x,y,faceZ(x,y)+5.5-3*Math.abs(v-.45)];},170,4,{uS:(XS-XA)/78,vS:4,
   hole:(u,v)=>HR(lerp(XA,XS,u))<20}));
 // talus banked against the foot of the cliff, largest at the wall
 for(let i=0;i<260;i++){const x=rr(XW+80,XS),t=Math.pow(rng(),1.9);
  const bx=faceZ(x,10)+t*150,sc=rr(4,24)*(1-t*.45);
  kput('rubble',[x,sc*.4+(1-t)*(1-t)*20,bx],qEuler(rng()*3,rng()*3,rng()*3),
   [sc*rr(.7,1.5),sc*rr(.5,1),sc*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.10),rr(.12,.32),rr(.11,.24)));}

 // ---- the cavern shell -----------------------------------------------------
 // One surface: brow lip, over the roof, down the back wall and 6 m under the
 // shelf. The roof's noise is displaced in y and the wall's in z, and both ramp
 // from zero at their seams so the two halves meet exactly.
 const cavPt=(x,v)=>{const h=HR(x);
  if(h<2)return[x,SHELF,ZB(x)];
  if(v<=.66){const s=v/.66,p=bez(x,s);
   // A smooth vault reads as a tarpaulin, so roofN() puts two octaves of
   // spalling in it, ramped from zero at the lip so the mouth edge still lands
   // exactly on the face's hole; scarY() bites the roof fall out of the vault
   // ITSELF rather than laying a second sheet of rock over it, which is what
   // went wrong the first time Arcbeam modelled its rockfall.
   return[x,p[1]+roofN(x,p[0],s)+scarY(x,p[0],s),p[0]];}
  const s=(v-.66)/.34,y=lerp(topY(x),SHELF-6,s);
  return[x,y,ZB(x)+((fbm(x*.013,y*.013,9602,3)*2-1)*20
                    +(fbm(x*.044,y*.044,9624,2)*2-1)*7)*Math.min(1,s*4)];};
 SHADE.push(gridSurface((u,v)=>cavPt(lerp(XA,XS,u),v),140,48,{uS:(XS-XA)/62,vS:9,
   hole:(u,v)=>{const p=cavPt(lerp(XA,XS,u),v);
    return v<.5&&!!inWell(p[0],p[2],-1);}}));

 // WHAT IS ON THE PLATEAU. A bare 1 700 x 1 300 m tabletop with fourteen
 // manholes in it reads as a car park, and the plan view is one of the three
 // the sheet draws. A haul track links the collars, spoil banks stand beside
 // the deepest of them, and scrub takes the hollows.
 {const WC=WELL.filter(w=>!w.half&&!w.cav).sort((a,b)=>a.x-b.x);
  for(let i=1;i<WC.length;i++){const A2=WC[i-1],B2=WC[i];
   const n2=Math.max(2,Math.round(Math.hypot(B2.x-A2.x,B2.z-A2.z)/26));
   for(let j=0;j<n2;j++){const t=(j+.5)/n2;
    const tx=lerp(A2.x,B2.x,t)+rr(-5,5),tz=lerp(A2.z,B2.z,t)+rr(-5,5);
    // A MADE road, laid 0.4 m proud in a dark stone. The first cut used the
    // kit's 'stain' decal, but TEX.stain is mostly light, so multiplying it
    // over pale rock barely darkens and 30 m quads with depthWrite off read
    // as ghosts hovering over the plateau.
    const ang=Math.atan2(B2.z-A2.z,B2.x-A2.x);
    kput(BX,[tx,wellY1(A2)-.6,tz],qEuler(0,-ang,0),[30,.8,15],
     new THREE.Color().setHSL(rr(.06,.10),rr(.10,.20),rr(.10,.17)));}}
  WELL.forEach(W=>{if(W.half||W.cav||rng()<.45)return;
   for(let i=0;i<18;i++){const a3=rng()*TAU,r4=W.r*rr(1.5,3.4),sc=rr(3,11);
    kput('rubble',[W.x+Math.cos(a3)*r4,wellY1(W)-1+sc*.35,W.z+Math.sin(a3)*r4],
     qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.8,1.6),sc*rr(.4,.8),sc*rr(.8,1.6)],
     new THREE.Color().setHSL(rr(.05,.10),rr(.14,.32),rr(.10,.22)));}});
  for(let i=0;i<(dd?120:80);i++){const px5=rr(XW+400,XS-20),pz5=rr(-1180,-120);
   const py5=platY(px5,pz5);
   if(py5<40||inWell(px5,pz5,26))continue;
   kput('hedge',[px5,py5+.5,pz5],qEuler(0,rng()*TAU,0),[rr(2,5),rr(.8,1.5),rr(1.4,3)],
    new THREE.Color().setHSL(rr(.14,.26),rr(.18,.34),dd?rr(.06,.12):rr(.07,.14)));}}
 // ---- the rock shelf the city stands on ------------------------------------
 // Its outer edge is shelfE(): the weathered face where that reaches far
 // enough forward, a projecting buttress of rock where it does not. Under that
 // edge a battered skirt runs 80 m down the face, 2 m proud of it, so the
 // buttress has an underside and nothing can look through the join.
 ROCK.push(gridSurface((u,v)=>{const x=lerp(XA+26,XS,u);
   const z=lerp(ZB(x)-10,shelfE(x),v);
   return[x,SHELF+(fbm(x*.01,z*.01,9603,3)*2-1)*3.2*Math.min(1,v*4)*Math.min(1,(1-v)*6),z];},
   118,30,{uS:(XS-XA)/62,vS:7}));
 ROCK.push(gridSurface((u,v)=>{const x=lerp(XA+26,XS,u),y=lerp(SHELF,SHELF-80,v);
   return[x,y,lerp(shelfE(x),faceZ(x,SHELF-80)+2,Math.pow(v,.75))];},118,8,{uS:(XS-XA)/62,vS:5}));

 // ---- the section cut ------------------------------------------------------
 // The massif ends here on a master joint. Flatter and less gullied than the
 // weathered face on purpose: a joint plane is a fracture, and it has to read
 // as a cut or the whole section preset is just another cliff.
 const cutZ=(y,q)=>faceZ(XS,y)+2-q;
 const inCavCut=(y,z)=>{if(y<SHELF+12)return false;
  if(z<ZB(XS)+11||z>lipZ(XS)-4)return false;
  const ry=roofY(XS,z);return ry>0&&y<ry-11;};
 const cutX=(y,z)=>XS+((fbm(z*.0062,y*.0062,9604,3)*2-1)*11
   +(fbm(z*.021,y*.021,9627,2)*2-1)*4.5);
 CUT.push(gridSurface((u,v)=>{const y=v*ctop(XS),z=lerp(cutZ(y,0),-900,Math.pow(u,.85));
   return[cutX(y,z)*Math.min(1,u*6)+XS*(1-Math.min(1,u*6)),y,z];},128,80,{uS:18,vS:CT0/70,
   hole:(u,v)=>{const y=v*ctop(XS),z=lerp(cutZ(y,0),-900,Math.pow(u,.85));
    return inCavCut(y,z)||inCutO(z,y);}}));
 // REVEALS. The chamber openings were rectangles cut in a plane with no
 // thickness, so 900 m of rock read as a sheet of card. Each opening gets four
 // returning faces 17 m deep — a sill, a head and two cheeks — which is what
 // tells the eye how much rock the city is dug out of. They are driven off the
 // SAME rectangles as the holes, so a reveal cannot land where there is no hole.
 const RVD=17;
 CUTO.forEach(C=>{const z0=C[0]+5,z1=C[1]-5,y0=C[2]+4,y1=C[3]-4;
  for(const zz of [z0,z1])CUT.push(gridSurface((u,v)=>
   [cutX(lerp(y0,y1,u),zz)-v*RVD,lerp(y0,y1,u),zz],8,3,{uS:6,vS:3}));
  for(const yy of [y0,y1])CUT.push(gridSurface((u,v)=>
   [cutX(yy,lerp(z0,z1,u))-v*RVD,yy,lerp(z0,z1,u)],12,3,{uS:6,vS:3}));});
 // blocks along the crest, so the plateau does not meet the cut on a drawn line
 for(let i=0;i<70;i++){const z=rr(-880,cutZ(CT0*.9,0)),sc=rr(6,22);
  kput('rubble',[XS+rr(-14,16),ctop(XS)-rr(0,10)+sc*.3,z],qEuler(rng()*3,rng()*3,rng()*3),
   [sc*rr(.7,1.6),sc*rr(.5,1),sc*rr(.7,1.6)],new THREE.Color().setHSL(rr(.05,.10),rr(.14,.32),rr(.16,.32)));}
 // quarry-like benches at its foot, and the spoil of the joint's own failure
 for(let b=0;b<3;b++){const by=40+b*46,bd=16+b*9;
  CUT.push(gridSurface((u,v)=>[XS+lerp(0,bd,v),by,lerp(cutZ(by,0),-860,Math.pow(u,.85))],40,3,{uS:24,vS:4}));
  CUT.push(gridSurface((u,v)=>[XS+bd,lerp(by,by-46,v),lerp(cutZ(by,0),-860,Math.pow(u,.85))],40,4,{uS:24,vS:5}));}
 for(let i=0;i<150;i++){const t=Math.pow(rng(),1.7),z=rr(-880,cutZ(20,0));
  const sc=rr(4,26)*(1-t*.5);
  kput('rubble',[XS+8+t*190,sc*.4+(1-t)*(1-t)*30,z],qEuler(rng()*3,rng()*3,rng()*3),
   [sc*rr(.7,1.6),sc*rr(.5,1),sc*rr(.7,1.6)],new THREE.Color().setHSL(rr(.05,.10),rr(.14,.34),rr(.14,.30)));}

 // ---- the excavated half ---------------------------------------------------
 // Chambers are LINED, not hollowed: six surfaces each, so a room seen through
 // a portal or laid open on the cut has a floor, a ceiling and a back to it.
 // The east wall is omitted on the rooms the section plane takes, which is what
 // makes those rooms open onto the cut instead of being sealed behind it.
 const ZLIT={ind:new THREE.Color(0xffb257),cty:CYAN,cul:CYAN,pub:CYAN,
             res:WARM,dwe:WARM,lw:new THREE.Color(0xbfe6ff),mee:new THREE.Color(0xffe0b0),
             gar:new THREE.Color(0xa8ff9a),rsc:new THREE.Color(0xbfe6ff),ply:WARM};
 const litOf=k=>(ZLIT[k]||WARM).clone().multiplyScalar(dd?rr(.10,.32):rr(.32,.88));
 const ROOMC=dd?DEAD:new THREE.Color(0x0f1720);
 // The shared stripRing() was aiming every segment radially — a ring of light
 // strips came out as a comb of spokes pointing at the camera. It was fixed in
 // 36-decor.js while this type was being built, so this is now a one-line alias
 // rather than the private tangential copy the Forest Tower and Plymouth both
 // had to carry. Keeping the local name means the call sites do not care.
 const lring=(cx,cy,cz,r,n)=>stripRing(cx,cy,cz,r,d,n);
 const wellHole=(x,z)=>!!inWell(x,z,-1);
 ROOMS.forEach((R,ri)=>{
  const gx2=(u,v,f)=>f(lerp(R.x0,R.x1,u),lerp(R.z0,R.z1,v));
  RM.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),R.y0,lerp(R.z0,R.z1,v)],10,10,{uS:8,vS:8}));
  RM.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),R.y1,lerp(R.z0,R.z1,v)],10,10,{uS:8,vS:8,
   hole:(u,v)=>gx2(u,v,wellHole)}));
  RM.push(gridSurface((u,v)=>[R.x0,lerp(R.y0,R.y1,v),lerp(R.z0,R.z1,u)],10,6,{uS:8,vS:6}));
  if(!R.cut)RM.push(gridSurface((u,v)=>[R.x1,lerp(R.y0,R.y1,v),lerp(R.z0,R.z1,u)],10,6,{uS:8,vS:6}));
  RM.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),lerp(R.y0,R.y1,v),R.z0],10,6,{uS:8,vS:6}));
  // the front wall, punched where its passage comes through
  const P=PASS.find(p=>p.z0===R.z1&&p.x>R.x0&&p.x<R.x1);
  RM.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),lerp(R.y0,R.y1,v),R.z1],14,8,{uS:8,vS:6,
   hole:(u,v)=>{if(!P)return false;const x=lerp(R.x0,R.x1,u),y=lerp(R.y0,R.y1,v);
    return Math.abs(x-P.x)<P.w*.5&&y>P.y&&y<P.y+P.h;}}));
  // FLOOR PLATES. Pale concrete over a dark soffit, and never the same grey as
  // the void behind them: cut a stack of floors out of one tone and the whole
  // section renders as one ramp. The plate is the only thing that gives a
  // 152 m room a legible number of storeys.
  const st=R.hall?19:20,np=Math.max(1,Math.floor((R.y1-R.y0-8)/st));
  for(let p=1;p<=np;p++){const py=R.y0+p*st;
   if(py>R.y1-6)break;
   // The hall keeps a FIXED 17% light court down its middle at every level,
   // not a random one: it is where its two wells land, and a preset that has
   // to stand in it needs a slot that is in the same place on every floor.
   const inset=R.hall?.17:.06;
   const hl=(u,v)=>{const x=lerp(R.x0,R.x1,u),z=lerp(R.z0,R.z1,v);
    return wellHole(x,z)||(R.hall&&Math.abs(z-(R.z0+R.z1)*.5)<(R.z1-R.z0)*inset*.5)
     ||(dd&&fbm(u*5+p,v*4,9605+p,3)<.28);};
   const pl=dy=>gridSurface((u,v)=>[lerp(R.x0+3,R.x1-(R.cut?0:3),u),py+dy,lerp(R.z0+3,R.z1-3,v)],
    12,10,{uS:6,vS:6,hole:hl});
   SH.push(pl(0));DK.push(pl(-1.3));
   // partitions across the plate, so a storey is rooms and not a shelf
   const nq=Math.max(2,Math.round((R.x1-R.x0)/22));
   for(let q=0;q<nq;q++){const px2=lerp(R.x0+6,R.x1-6,(q+.5)/nq);
    if(rng()<(dd?.55:.28))continue;
    const zc2=rr(R.z0+14,R.z1-14),zl=rr(22,Math.min(96,(R.z1-R.z0)*.55));
    kput(R.hall?BX:BXD,[px2,py+(st-2)*.5,zc2],null,[1.1,st-3,zl],
     R.hall?new THREE.Color(dd?0x6b6459:0xaaa294):null);
    // cells facing the cut, so a room laid open is inhabited
    if(R.cut)for(let c=0;c<3;c++){const cz=zc2+((c+.5)/3-.5)*zl;
     if(rng()<(dd?.6:.22))continue;
     kput('aiPane',[px2+.9,py+4.2,cz],qFacing([1,0,0]),[5.4,3.4,1],
      rng()<(dd?.06:.5)?litOf(R.k):ROOMC);}}
   if(!dd&&rng()<.7)kput('strip',[(R.x0+R.x1)*.5,py+st-3,rr(R.z0+20,R.z1-20)],
    qEuler(0,Math.PI/2,0),[Math.min(70,(R.z1-R.z0)*.5),1.4,1.4],ZLIT[R.k]||CYAN);
   // A COLONNADE down both edges of the hall's light court, storey by storey.
   // Eight plates and a few partitions in a 196 x 240 x 150 m room left it
   // reading as an empty car park; the piers are what make it a hall.
   if(R.hall){const cz3=(R.z0+R.z1)*.5,ci=(R.z1-R.z0)*inset*.5;
    for(const s4 of [-1,1])for(let q2=0;q2<5;q2++){
     const cx3=lerp(R.x0+16,R.x1-12,(q2+.5)/5);
     if(inWell(cx3,cz3+s4*ci,6))continue;
     kput('aiPost',[cx3,py-st+1,cz3+s4*ci],null,[2.5,st-1.4,2.5],
      new THREE.Color(dd?0x6b6459:0xb2aa9c));
     kput(BX,[cx3,py-1.6,cz3+s4*(ci-1.6)],null,[5.6,2.2,4],
      new THREE.Color(dd?0x6b6459:0xb2aa9c));}}}
  if(ri%3===0||R.hall)REGISTER({name:'Arcoindian I — excavated '+R.n.toLowerCase(),
   x:(R.x0+R.x1)*.5,z:(R.z0+R.z1)*.5,r:Math.max(40,(R.x1-R.x0)*.6),y:R.y0-2,h:R.y1-R.y0+4});
  // industry plant, dwellings furniture: enough silhouette that a chamber is
  // not an empty box when a camera is put inside one
  const nf=R.hall?26:Math.round((R.x1-R.x0)/16);
  for(let i=0;i<nf;i++){const fx=rr(R.x0+6,R.x1-6),fz=rr(R.z0+8,R.z1-8);
   if(inWell(fx,fz,4))continue;
   if(R.k==='ind'){const hh=rr(10,Math.min(34,R.y1-R.y0-8));
    kput(dd?'pipeR':'pipe',[fx,R.y0+hh*.5,fz],null,[rr(3,7),hh,rr(3,7)],null);
    if(rng()<.5)kput(BX,[fx,R.y0+2,fz],null,[rr(8,20),4,rr(8,20)],null);}
   else{const hh=rr(3,7);
    kput(BX,[fx,R.y0+hh*.5,fz],qEuler(0,rng()*TAU,0),[rr(5,14),hh,rr(4,11)],null);}}});

 // the stair shaft, built as its x<XS half so the plane lays it open
 {const S2=STAIR,H2=S2.y1-S2.y0;
  RM.push(gridSurface((u,v)=>[S2.x-u*S2.w,lerp(S2.y0,S2.y1,v),S2.z-S2.w*.5],4,22,{uS:4,vS:18}));
  RM.push(gridSurface((u,v)=>[S2.x-u*S2.w,lerp(S2.y0,S2.y1,v),S2.z+S2.w*.5],4,22,{uS:4,vS:18}));
  RM.push(gridSurface((u,v)=>[S2.x-S2.w,lerp(S2.y0,S2.y1,v),S2.z+(u-.5)*S2.w],4,22,{uS:4,vS:18}));
  // flights and landings: a run every 4.6 m, alternating direction
  for(let i=0;i*4.6<H2-4;i++){const fy=S2.y0+i*4.6,dir=(i%2)?1:-1;
   kput('aiStair',[S2.x-S2.w*.5,fy,S2.z-dir*S2.w*.34],qFacing([0,0,dir]),[S2.w*.72,4.6,S2.w*.62],
    new THREE.Color(dd?0x6b6459:0xb7b0a2));
   if(i%2===0)kput(BX,[S2.x-S2.w*.5,fy-.7,S2.z],null,[S2.w*.86,1.4,S2.w*.9],
    new THREE.Color(dd?0x6b6459:0xb7b0a2));
   if(!dd&&i%3===0)kput('strip',[S2.x-2,fy+3.6,S2.z],qEuler(0,Math.PI/2,0),[S2.w*.8,1.2,1.2],CYAN);}
  REGISTER({name:'Arcoindian I — the stair shaft',x:S2.x-S2.w*.5,z:S2.z,r:S2.w,y:S2.y0-2,h:H2+4});}
 // ---- passages -------------------------------------------------------------
 PASS.forEach(P=>{const za=Math.min(P.z0,P.z1),zb2=Math.max(P.z0,P.z1);
  const hw=P.half?0:P.w*.5;
  RM.push(gridSurface((u,v)=>[P.x+lerp(-hw,P.w*.5,u),P.y,lerp(za,zb2,v)],4,16,{uS:4,vS:12}));
  RM.push(gridSurface((u,v)=>[P.x+lerp(-hw,P.w*.5,u),P.y+P.h,lerp(za,zb2,v)],4,16,{uS:4,vS:12}));
  RM.push(gridSurface((u,v)=>[P.x-hw,lerp(P.y,P.y+P.h,v),lerp(za,zb2,u)],16,4,{uS:12,vS:4}));
  if(!P.half)RM.push(gridSurface((u,v)=>[P.x+P.w*.5,lerp(P.y,P.y+P.h,v),lerp(za,zb2,u)],16,4,{uS:12,vS:4}));
  // the portal where it breaks out into the back of the cavern
  if(!P.half){kput('aiPortal',[P.x,P.y,ZB(P.x)+1],qFacing([0,0,1]),[P.w/8,P.h/12,1],null);
   for(const s3 of [-1,1])kput(BX,[P.x+s3*(P.w*.5+3),P.y+P.h*.5,ZB(P.x)+3],null,[6,P.h+6,7],null);
   if(!dd)kput('strip',[P.x,P.y+P.h+.6,ZB(P.x)+4],null,[P.w,1.6,1.6],CYAN);
   else if(rng()<.3)kput('strip',[P.x,P.y+P.h+.6,ZB(P.x)+4],null,[P.w,1.6,1.6],CYAN.clone().multiplyScalar(.3));
   for(let i=0;i<Math.round(P.w/3.4);i++)
    kput(BX,[P.x+((i+.5)/Math.round(P.w/3.4)-.5)*(P.w+6),P.y+P.h+2,ZB(P.x)+2],null,
     [(P.w+6)/Math.round(P.w/3.4)*1.04,4,5],null);}
  const nl=Math.max(2,Math.round((zb2-za)/22));
  for(let i=0;i<nl;i++){const pz=lerp(za+6,zb2-6,(i+.5)/nl);
   if(!dd)kput('strip',[P.x,P.y+P.h-1.6,pz],qEuler(0,Math.PI/2,0),[14,1.3,1.3],CYAN);
   else if(rng()<.2)kput('strip',[P.x,P.y+P.h-1.6,pz],qEuler(0,Math.PI/2,0),[14,1.3,1.3],
    CYAN.clone().multiplyScalar(.35));}});

 // ---- light wells ----------------------------------------------------------
 // Lined in the chamber material and rimmed with a raised collar, so from the
 // plateau each one is a black hole in a ring of stonework rather than the
 // bright patch a shadowless engine makes of any deep void. At the bottom a
 // pale disc is laid on the floor: that is what a shaft of daylight looks like
 // when nothing in the scene can cast one.
 WELL.forEach((W,wi)=>{const y1=wellY1(W),H=y1-W.y0;
  if(!(H>10))return;
  if(W.half){RM.push(gridSurface((u,v)=>{const th=Math.PI*.5+u*Math.PI;
    return[W.x+Math.cos(th)*W.r,W.y0+v*H,W.z+Math.sin(th)*W.r];},12,20,{uS:6,vS:18}));}
  else RM.push(lathe({rFn:()=>W.r,H:H,nu:16,nv:18}).translate(W.x,W.y0,W.z));
  if(!W.half){
   // the collar on the plateau: an upstand and its own dark reveal
   ROCK.push(lathe({rFn:y2=>W.r*(1.30-.10*y2/9),H:9,nu:18,nv:3}).translate(W.x,y1-2,W.z));
   RM.push(lathe({rFn:()=>W.r*1.02,H:11,nu:16,nv:2}).translate(W.x,y1-2,W.z));
   // a grille of ribs over the mouth, which is the other half of making a hole
   // read as a hole from directly overhead
   const nr=Math.max(3,Math.round(W.r/3.6));
   for(let i=0;i<nr;i++){const t=(i+.5)/nr-.5;
    if(dd&&rng()<.4)continue;
    beam(BX,[W.x+t*W.r*2,y1+6,W.z-W.r*Math.sqrt(Math.max(0,1-4*t*t))],
         [W.x+t*W.r*2,y1+6,W.z+W.r*Math.sqrt(Math.max(0,1-4*t*t))],1.6,1.6);}}
  // A CAVERN well needs a collar on the UNDERSIDE of the vault. Without one it
  // is a grey ellipse in a dark roof and reads as a boulder stuck to the
  // ceiling, which is what the first renders showed.
  // A LIP flush with the vault, not a collar hanging below it. Nothing in this
  // scene casts a shadow, so any surface hung under the roof is lit from
  // outside and from the hemisphere's warm ground colour at once: at 1.6x over
  // 14 m it read as a pendant lamp, at 1.16x over 4.5 m as a bucket. Sitting it
  // mostly ABOVE the roof plane leaves a rimmed hole with a lit bore behind it,
  // which is what a light well looks like from underneath.
  if(W.cav){
   // DARK rim, bright bore. A pale lip under a dark vault is lit from outside
   // by a sun nothing occludes and reads as a saucer stuck to the ceiling
   // whatever its profile; a dark one reads as the hole it is, and the disc set
   // high in the shaft gives the bore something to show when you look up it.
   DK.push(lathe({rFn:()=>W.r*1.05,H:7,nu:22,nv:2}).translate(W.x,W.y0-1.2,W.z));
   kput('aiPool',[W.x,W.y0+(y1-W.y0)*.82,W.z],null,[W.r*1.9,1,W.r*1.9],
    new THREE.Color(dd?0x8e887a:0xcfc8b6));
   if(!dd)lring(W.x,W.y0-.6,W.z,W.r*1.02,Math.max(8,Math.round(TAU*W.r/9)));}
  // the pool of daylight at the foot
  const py2=W.cav?PY+.6:(W.room?W.room.y0+.5:SHELF+.5);
  kput('aiPool',[W.x,py2,W.z],null,[W.r*4.2,1,W.r*4.2],
   new THREE.Color(dd?0x5f5b50:0x9c9686));
  if(!dd)for(let i=0;i<10;i++){const th=i/10*TAU;
   kput('strip',[W.x+Math.cos(th)*W.r*.96,W.y0+H*.5+rr(-H*.3,H*.3),W.z+Math.sin(th)*W.r*.96],
    qEuler(0,-th-Math.PI/2,0),[W.r*.5,1.1,1.1],CYAN.clone().multiplyScalar(.6));}});

 // ---- the courtyard plinth -------------------------------------------------
 // Its outline is the lobing function everything else inherits; at the back it
 // is buried 18 m INTO the cavern's rock wall, because a plinth that stops two
 // metres short of the rock leaves a 100 m slot behind it that no camera can be
 // kept out of.
 const PX2=(th,r)=>PCX+Math.cos(th)*r, PZ2=(th,r)=>PCZ+Math.sin(th)*r;
 // Every parapet, maisonette, balcony and stair is the same kit box, and a few
 // thousand of them in one material came back as a white ziggurat. One warm
 // stone band, spread over lightness, is what turns the stack back into a town.
 const stoneC=()=>new THREE.Color().setHSL(rr(.06,.11),rr(.05,.16),
  dd?rr(.13,.24):rr(.23,.38));
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(RPLZ,Rplinth(th),v);
   return[PX2(th,r),PY,PZ2(th,r)];},128,13,{uS:60,vS:13}));
 SH.push(gridSurface((u,v)=>{const th=u*TAU,r=Rplinth(th);
   return[PX2(th,r),lerp(PY,hasT(th)?TY(1):SHELF-4,v),PZ2(th,r)];},128,8,{uS:60,vS:9}));
 SH.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(Rplinth(th),RPLZ*.5,v);
   return[PX2(th,r),SHELF-4,PZ2(th,r)];},64,6,{uS:30,vS:6}));   // the plinth's own base
 // the sunken plaza and its steps
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=(RPLZ-7)*v;
   return[PX2(th,r),PY-5.4,PZ2(th,r)];},64,5,{uS:22,vS:5}));
 for(let s2=0;s2<4;s2++){const r=RPLZ-s2*1.8,yy=PY-1.35-s2*1.35;
  GRD.push(gridSurface((u,v)=>{const th=u*TAU;return[PX2(th,lerp(r,r-1.8,v)),yy,PZ2(th,lerp(r,r-1.8,v))];},64,1,{uS:22,vS:1}));
  SH.push(gridSurface((u,v)=>{const th=u*TAU;return[PX2(th,r-1.8),lerp(yy,yy-1.35,v),PZ2(th,r-1.8)];},64,1,{uS:22,vS:1}));}
 if(!dd)lring(PCX,PY-4.6,PCZ,RPLZ-9,30);
 // PAVING. A 236 m disc of one concrete reads as a pond from overhead, and the
 // plan is one of the three drawings. Four concentric joint bands and a darker
 // promenade ring give it a grain and mark the ring the sheet labels.
 // The bands go in the WALL material, not the deck's: a joint the same colour
 // as the paving is not a joint. Pale kerb lines on a dark deck.
 for(let b=0;b<5;b++){const rb=RPLZ+6+b*((RPL-RPLZ)/5);
  SH.push(gridSurface((u,v)=>{const th=u*TAU,r=Math.min(rb+v*1.9,Rplinth(th)-1);
    return[PX2(th,r),PY+.24,PZ2(th,r)];},110,1,{uS:50,vS:1,
    hole:(u,v)=>rb>Rplinth(u*TAU)-3}));}
 for(let i=0;i<40;i++){const th=i/40*TAU;
  SH.push(gridSurface((u,v)=>{const r=lerp(RPLZ+4,Rplinth(th)-2,u);
    return[PX2(th+v*.007,r),PY+.24,PZ2(th+v*.007,r)];},12,1,{uS:20,vS:1}));}

 // ---- the three towers -----------------------------------------------------
 // Round, as the plan draws them, and placed so no tower can overhang the
 // plinth however the lobing falls: the radius from the plaza centre is clipped
 // against the plinth's own outline at that bearing.
 const TW=[];
 TWR.forEach((T,ti)=>{
  const rad=Math.min(64,Rplinth(T.a)-T.r-10);
  const tx=PX2(T.a,rad),tz=PZ2(T.a,rad);
  const h=T.h,rFn=y2=>T.r*(1-.11*(y2/h)+.05*Math.sin(Math.PI*y2/h));
  TW.push({x:tx,z:tz,r:T.r,h:h,k:T.k,n:T.n,y0:PY});
  const brk=dd&&ti===1?h*.62:null;                       // the cultural centre has lost its top
  const cutH=brk||h;
  SH.push(lathe({rFn:rFn,H:h,cut:cutH,jag:brk?7:0,flutes:16,amp:.05,sharp:2,nu:56,nv:26,
   seed:9606+ti,hole:holeFn(dd*.7,9607+ti,brk?cutH:null,1.2)}).translate(tx,PY,tz));
  DK.push(lathe({rFn:y2=>rFn(y2)-5,H:cutH-2,nu:28,nv:12}).translate(tx,PY,tz));
  // floor plates, so a hole in a ruined tower looks into storeys
  for(let p=1;p*7.8<cutH-4;p++)
   kput('slabCR',[tx,PY+p*7.8,tz],null,[rFn(p*7.8)-5.6,.7,rFn(p*7.8)-5.6],new THREE.Color(0x24262a));
  // glazing bands and the dwelling fabric between them
  const nby=Math.max(2,Math.round(cutH/26));
  for(let b=0;b<nby;b++){const by=6+b*(cutH-10)/nby;
   const rr2=rFn(by);
   if(!dd)mesh(lathe({rFn:()=>rr2*1.015,H:5.4,nu:36,nv:2}),MAT.glass,G,tx,PY+by,tz);
   else mesh(lathe({rFn:()=>rr2*1.01,H:5.4,nu:24,nv:2}),MAT.aiVoid,G,tx,PY+by,tz);
   const nm=Math.round(TAU*rr2/5.2);
   for(let m=0;m<nm;m++){const th=m/nm*TAU;
    kput(dd?'mullR':'mullW',[tx+Math.cos(th)*rr2*1.03,PY+by+2.7,tz+Math.sin(th)*rr2*1.03],
     qEuler(0,-th,0),[1,5.4,1],null);}
   if(!dd)lring(tx,PY+by+5.9,tz,rr2*1.02,Math.round(TAU*rr2/9));}
  const nc=Math.round(TAU*T.r/6.4),nrw=Math.floor((cutH-10)/4.2);
  for(let j=0;j<nrw;j++){const cy2=8+j*4.2;
   if(cy2>cutH-5)break;
   const rr2=rFn(cy2);
   for(let i=0;i<nc;i++){const th=(i+((j%2)?.3:.7))/nc*TAU;
    if(rng()>(dd?.62:.86))continue;
    kput('aiPane',[tx+Math.cos(th)*rr2*1.02,PY+cy2,tz+Math.sin(th)*rr2*1.02],
     qFacing([Math.cos(th),0,Math.sin(th)]),[3.4,2.6,1],
     rng()<(dd?.04:.34)?litOf(T.k):ROOMC);
    if(rng()<(dd?.012:.03)){
     kput('aiBalc',[tx+Math.cos(th)*rr2,PY+cy2-1.6,tz+Math.sin(th)*rr2],
      qFacing([Math.cos(th),0,Math.sin(th)]),[4.4,2.2,3.0],stoneC());}}}
  // the crown: a gallery, a cap and a lantern
  if(!brk){const rt=rFn(h);
   for(let i=0;i<Math.round(TAU*rt/5);i++){const th=i/Math.round(TAU*rt/5)*TAU;
    kput(BX,[tx+Math.cos(th)*(rt+2.4),PY+h-4,tz+Math.sin(th)*(rt+2.4)],qEuler(0,-th,0),
     [TAU*rt/Math.round(TAU*rt/5)*1.05,5,5.6],stoneC());}
   kput('slabC',[tx,PY+h+1.4,tz],null,[rt*1.14,2.8,rt*1.14],new THREE.Color(dd?0x6d665c:0xcac4b8));
   SH.push(lathe({rFn:y2=>rt*.62*Math.pow(clamp(1-Math.pow(y2/16,2.1),0,1),.55)+.6,H:16,
    flutes:10,amp:.08,sharp:2,nu:26,nv:8,hole:holeFn(dd*.8,9610+ti,null,1.4)}).translate(tx,PY+h+2.8,tz));
   if(!dd){mesh(lathe({rFn:y2=>rt*.58*Math.pow(clamp(1-Math.pow(y2/16,2.1),0,1),.55)+.6,H:16,nu:20,nv:6}),
     MAT.glass,G,tx,PY+h+2.8,tz);
    kput('finial',[tx,PY+h+22,tz],null,[2.6,7,2.6],null);
    lring(tx,PY+h+3.6,tz,rt*.9,Math.round(TAU*rt/8));}}
  REGISTER({name:'Arcoindian I — '+T.n.toLowerCase()+' tower',x:tx,z:tz,r:T.r+8,y:PY-6,h:cutH+26});});
 // the promenade ring: a colonnade round the plaza, skipping anything a tower
 // is standing on
 {const np=Math.round(TAU*RPRM/9);
  for(let i=0;i<np;i++){const th=i/np*TAU,px3=PX2(th,RPRM),pz3=PZ2(th,RPRM);
   if(TW.some(t=>Math.hypot(px3-t.x,pz3-t.z)<t.r+5))continue;
   if(dd&&rng()<.34)continue;
   kput('aiPost',[px3,PY,pz3],null,[2.2,14.1,2.2],null);
   kput(BX,[px3,PY+14.7,pz3],qEuler(0,-th,0),[TAU*RPRM/np*1.05,1.3,3.1],null);}
  if(!dd)lring(PCX,PY+15.8,PCZ,RPRM,Math.round(TAU*RPRM/11));}

 // ---- the terraces ---------------------------------------------------------
 // Nine of them, stepping down and outward over 250 degrees, pinching out to
 // nothing where the plinth turns and runs back to the rock. tf() is what does
 // the pinching: at the flanks the nine risers collapse onto the plinth's own
 // wall, so the stack closes itself instead of showing nine cut ends.
 const CWX=6.4;
 for(let k=1;k<=NT;k++){const y0=TY(k),y1=TY(k-1);
  GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(RT(k-1,th),RT(k,th),v);
    return[PX2(th,r),y0,PZ2(th,r)];},128,3,{uS:60,vS:4,
    hole:(u,v)=>{const th=u*TAU;if(tf(th)<.05)return true;
     const r=lerp(RT(k-1,th),RT(k,th),v);
     // the terraces the roof fall went through
     if(IMP&&Math.hypot(PX2(th,r)-IMP.x,PZ2(th,r)-IMP.z)<IMP.r*(.78-k*.045))return true;
     return dd&&fbm(Math.cos(th)*3+k,Math.sin(th)*3,9611,2)<.19;}}));
  SH.push(gridSurface((u,v)=>{const th=u*TAU,r=RT(k-1,th);
    return[PX2(th,r),lerp(y0,y1,v),PZ2(th,r)];},128,4,{uS:60,vS:5,
    hole:(u,v)=>tf(u*TAU)<.05}));
  // the outermost terrace's fascia, down to the rock shelf
  if(k===NT)SH.push(gridSurface((u,v)=>{const th=u*TAU,r=RT(k,th);
    return[PX2(th,r),lerp(y0,SHELF-3,v),PZ2(th,r)];},128,2,{uS:60,vS:3,
    hole:(u,v)=>tf(u*TAU)<.05}));
  // DWELLINGS on the riser: three storeys in 11.33 m, one home every 6.4 m of
  // frontage. Parameterised by ARC LENGTH, not by angle, or the homes crowd
  // together where the lobing pulls the outline in.
  const per=TAU*RT(k-1,0);
  const nb=Math.max(24,Math.round(per/CWX));
  for(let i=0;i<nb;i++){const th=(i+.5)/nb*TAU;
   if(tf(th)<.06)continue;
   const r=RT(k-1,th),px3=PX2(th,r),pz3=PZ2(th,r),N=[Math.cos(th),Math.sin(th)];
   const q=qFacing([N[0],0,N[1]]);
   for(let s2=0;s2<3;s2++){const cy2=y0+2.0+s2*3.6;
    if(rng()>(dd?.68:.94))continue;
    kput('aiPane',[px3+N[0]*.4,cy2,pz3+N[1]*.4],q,[s2?3.6:2.4,s2?2.3:3.0,1],
     rng()<(dd?.05:.30)?litOf(k>6?'res':'lw'):ROOMC);}
   if(rng()<(dd?.08:.17))kput('aiBalc',[px3+N[0]*.2,y0+5.2,pz3+N[1]*.2],q,[5.0,2.4,3.2],stoneC());
   if(!dd&&i%9===3)kput('strip',[px3+N[0]*1.1,y1-1.6,pz3+N[1]*1.1],q,[CWX*2.4,1.1,1.1],CYAN);
   // parapet on the deck in front
   if(i%2===0&&!(dd&&rng()<.3)){const r2=RT(k,th);
    kput(BX,[PX2(th,r2-1.2),y0+1.5,PZ2(th,r2-1.2)],qEuler(0,-th,0),[per/nb*2.1,3,2.2],stoneC());}
   // a stair run laid ALONG the terrace every so often
   if(i%17===5&&!(dd&&rng()<.5))
    kput('aiStair',[PX2(th,r+5),y0,PZ2(th,r+5)],qFacing([-N[1],0,N[0]]),[5.5,TST,19],stoneC());}
  // maisonettes, planting and people out on the deck
  const nd=26+k*2;
  for(let i=0;i<nd;i++){const th=rng()*TAU;
   if(tf(th)<.2)continue;
   const r=rr(RT(k-1,th)+4,RT(k,th)-3);
   const px3=PX2(th,r),pz3=PZ2(th,r);
   const roll=rng();
   if(roll<.34){const bh=rr(5,9);
    kput(BX,[px3,y0+bh*.5,pz3],qEuler(0,-th+rr(-.2,.2),0),[rr(5,11),bh,rr(4,7)],stoneC());
    for(let s3=-1;s3<=1;s3+=2)for(let c2=0;c2<2;c2++)
     kput('aiPane',[px3+Math.cos(th)*s3*.1+Math.cos(th)*s3*3.4,y0+2.6,pz3+Math.sin(th)*s3*3.4],
      qFacing([Math.cos(th)*s3,0,Math.sin(th)*s3]),[2.6,2.2,1],
      rng()<(dd?.05:.4)?litOf('res'):ROOMC);}
   else if(roll<.72)VEG.tree(px3,y0,pz3,i%3,rr(5,dd?12:8));
   else kput('hedge',[px3,y0+.9,pz3],qEuler(0,rng()*TAU,0),[rr(4,9),1.8,rr(1.6,3)],
    new THREE.Color().setHSL(rr(.22,.34),rr(.3,.5),dd?rr(.08,.16):rr(.13,.24)));}
  if(!dd)for(let i=0;i<7;i++){const th=rng()*TAU;if(tf(th)<.25)continue;
   const r=rr(RT(k-1,th)+6,RT(k,th)-4),px3=PX2(th,r),pz3=PZ2(th,r);
   kput('figB',[px3,y0,pz3],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
   kput('figH',[px3,y0,pz3],null,1,new THREE.Color(0xc9a17e));}}
 // PLAYGROUNDS: two sunken courts bitten out of the wider terraces
 [[2.05,4],[5.05,7]].forEach((P,pi)=>{const th=P[0],k=P[1],y0=TY(k);
  const r=(RT(k-1,th)+RT(k,th))*.5,cx2=PX2(th,r),cz2=PZ2(th,r),cr=13;
  GRD.push(gridSurface((u,v)=>{const a=u*TAU,r2=cr*(1-v);
    return[cx2+Math.cos(a)*r2,y0-4.2,cz2+Math.sin(a)*r2];},24,4,{uS:10,vS:4}));
  SH.push(gridSurface((u,v)=>{const a=u*TAU;
    return[cx2+Math.cos(a)*cr,y0-4.2*v,cz2+Math.sin(a)*cr];},24,2,{uS:10,vS:2}));
  for(let i=0;i<12;i++){const a=i/12*TAU;
   if(dd&&rng()<.4)continue;
   kput(BX,[cx2+Math.cos(a)*(cr+2.2),y0+.7,cz2+Math.sin(a)*(cr+2.2)],qEuler(0,-a,0),[6,1.6,1.4],stoneC());}
  if(!dd)lring(cx2,y0-3.4,cz2,cr*.7,12);
  REGISTER({name:'Arcoindian I — playground '+(pi+1),x:cx2,z:cz2,r:cr+6,y:y0-6,h:14});});

 // ---- gardens and meeting areas on the plinth ------------------------------
 // GARDENS go against the rock face, where the sheet puts them: the back band
 // of the plinth, under the passage portals, in the deepest shade in the model.
 for(let i=0;i<(dd?120:96);i++){const th=rr(Math.PI*.98,Math.PI*2.02);
  if(tf(th)>.30)continue;
  const r=rr(RPRM+14,Rplinth(th)-8),px3=PX2(th,r),pz3=PZ2(th,r);
  if(rng()<.62)VEG.tree(px3,PY,pz3,i%3,rr(6,dd?16:11));
  else kput('hedge',[px3,PY+.9,pz3],qEuler(0,rng()*TAU,0),[rr(5,16),1.9,rr(2,5)],
   new THREE.Color().setHSL(rr(.22,.34),rr(.3,.5),dd?rr(.08,.16):rr(.13,.24)));}
 const MEET=[];
 for(let i=0;i<5;i++){const th=Math.PI*(1.08+i*.19);
  const r=Rplinth(th)*.80,px3=PX2(th,r),pz3=PZ2(th,r);
  // a pavilion standing in a tower is exactly the class of placement error no
  // invariant can see, so it is tested for rather than hoped about
  if(TW.some(t=>Math.hypot(px3-t.x,pz3-t.z)<t.r+20))continue;
  MEET.push([px3,pz3]);
  const hR=y2=>15*Math.pow(clamp(1-Math.pow(y2/21,2.1),0,1),.55)+.6;
  SH.push(lathe({rFn:hR,H:21,flutes:10,amp:.09,sharp:2,nu:24,nv:8,
   hole:holeFn(dd*.8,9613+i,null,1.5)}).translate(px3,PY,pz3));
  if(!dd){kput('finial',[px3,PY+25,pz3],null,[2.2,6,2.2],null);
   for(let j=0;j<8;j++){const a=j/8*TAU;
    kput('winBigI',[px3+Math.cos(a)*hR(7)*1.04,PY+7,pz3+Math.sin(a)*hR(7)*1.04],
     qFacing([Math.cos(a),0,Math.sin(a)]),[1.1,1.1,1],null);}}}
 if(MEET.length)REGISTER({name:'Arcoindian I — meeting areas',x:MEET[0][0],z:MEET[0][1],r:30,y:PY-6,h:40});
 if(!dd)for(let i=0;i<26;i++){const th=rng()*TAU,r=rr(RPLZ+4,Rplinth(th)-10);
  kput('figB',[PX2(th,r),PY,PZ2(th,r)],qEuler(0,rng()*TAU,0),1,
   new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
  kput('figH',[PX2(th,r),PY,PZ2(th,r)],null,1,new THREE.Color(0xc9a17e));}

 // ---- the satellite pods ---------------------------------------------------
 // RESEARCH, out on causeways. They stand on detached stacks of the same rock
 // the cliff is made of, because a 190 m causeway needs something at the far
 // end of it and a pier rising 240 m off the plain would be a bigger structure
 // than the pod it carried.
 // Spaced so no stack stands in front of the station, which the first cut put
 // 104 m directly behind stack II: from any camera out on the plain the whole
 // transport level was hidden behind a 240 m butte.
 const POD=[{x:-430,z:58,ty:252,sr:48,pr:32,nm:'Research pod I'},
            {x:-238,z:142,ty:238,sr:44,pr:29,nm:'Research pod II'},
            {x:80,z:40,ty:258,sr:40,pr:26,nm:'Research pod III'}];
 POD.forEach((P,pi)=>{
  const down=dd&&pi===1;
  // A lathe whose radius varies only with height is a cooling tower, which is
  // exactly what the first cut of these looked like. The stack is therefore a
  // gridSurface with noise in BOTH the bearing and the height: flutes, a
  // shoulder and a fluted talus, so it reads as a weathered stack of the same
  // bedded rock the cliff behind it is made of.
  const stR=(a,t)=>P.sr*(1.34-.46*Math.pow(t,.7))
    *(1+.15*(fbm(2.6*Math.cos(a),2.6*Math.sin(a)+t*3.4,9614+pi,3)*2-1)
       +.06*Math.sin(a*7+t*4)+.05*(fbm(9*Math.cos(a),9*Math.sin(a),9625,2)*2-1))
    +3.8*Math.round(Math.sin(t*27+pi)*2)/2            // bedding benches, as on the cliff
    +26*Math.pow(clamp(1-t/.24,0,1),1.8);
  ROCK.push(gridSurface((u,v)=>{const a=u*TAU;
    return[P.x+Math.cos(a)*stR(a,v),v*P.ty,P.z+Math.sin(a)*stR(a,v)];},
    40,26,{uS:P.sr/7,vS:P.ty/16}));
  // The cap starts on the stack's OWN rim radius, not on a nominal circle: a
  // flat disc laid on a noisy rim leaves a ring of daylight all the way round.
  ROCK.push(gridSurface((u,v)=>{const a=u*TAU,r=lerp(stR(a,1),0,Math.pow(v,.9));
    return[P.x+Math.cos(a)*r,P.ty,P.z+Math.sin(a)*r];},40,5,{uS:14,vS:5}));
  for(let i=0;i<34;i++){const a=rng()*TAU,t=Math.pow(rng(),1.6),r=P.sr*(1.36+t*1.5),sc=rr(3,14)*(1-t*.4);
   kput('rubble',[P.x+Math.cos(a)*r,sc*.4+(1-t)*10,P.z+Math.sin(a)*r],
    qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.7,1.5),sc*rr(.5,1),sc*rr(.7,1.5)],
    new THREE.Color().setHSL(rr(.05,.10),rr(.13,.32),rr(.12,.26)));}
  // the pod: a hexagonal drum in two storeys with a ring gallery
  const PH=P.pr*1.15;
  for(let s2=0;s2<2;s2++){const sy=P.ty-1+s2*(PH*.5),sr2=P.pr*(s2?.86:1);
   SH.push(gridSurface((u,v)=>{const a=u*TAU;
     return[P.x+Math.cos(a)*hexR(sr2,a),lerp(sy,sy+PH*.5,v),P.z+Math.sin(a)*hexR(sr2,a)];},
     36,5,{uS:12,vS:5,hole:holeFn(dd*(down?1.1:.55),9615+pi+s2,null,1.2)}));
   GRD.push(gridSurface((u,v)=>{const a=u*TAU,r=hexR(sr2,a)*(1-v);
     return[P.x+Math.cos(a)*r,sy+PH*.5,P.z+Math.sin(a)*r];},36,4,{uS:12,vS:4}));
   for(let i=0;i<Math.round(TAU*sr2/5.4);i++){const a=(i+.5)/Math.round(TAU*sr2/5.4)*TAU;
    const rr3=hexR(sr2,a);
    if(rng()>(down?.35:dd?.6:.9))continue;
    kput('aiPane',[P.x+Math.cos(a)*rr3*1.02,sy+PH*.26,P.z+Math.sin(a)*rr3*1.02],
     qFacing([Math.cos(a),0,Math.sin(a)]),[4.0,3.2,1],
     rng()<(dd?.04:.4)?litOf('rsc'):ROOMC);}
   if(!dd)lring(P.x,sy+PH*.5+1.2,P.z,sr2*.95,Math.round(TAU*sr2/9));}
  SH.push(lathe({rFn:y2=>P.pr*.55*Math.pow(clamp(1-Math.pow(y2/15,2.0),0,1),.5)+.6,H:15,
   nu:24,nv:7,hole:holeFn(dd*.8,9618+pi,null,1.3)}).translate(P.x,P.ty-1+PH,P.z));
  if(!dd)kput('finial',[P.x,P.ty+PH+17,P.z],null,[2.4,6,2.4],null);
  REGISTER({name:'Arcoindian I — '+P.nm.toLowerCase(),x:P.x,z:P.z,r:P.sr+12,h:P.ty+PH+24});
  // the causeway back to the terraces, aimed at the nearest point of the stack
  const ax=PCX+(P.x-PCX)*.42,az=PCZ+(P.z-PCZ)*.42;
  const th2=Math.atan2(P.z-PCZ,P.x-PCX),rA=RT(NT,th2);
  const A=[PX2(th2,rA-4),TY(NT)+1.5,PZ2(th2,rA-4)],B=[P.x,P.ty+3,P.z];
  const L2=Math.hypot(B[0]-A[0],B[2]-A[2]);
  if(!down){beam(BX,A,B,8,15);
   // A HAUNCH at each end, on the causeway's own axis. The first cut hung four
   // diagonal struts under it at 3.4 x 9; beam() leaves the roll of an inclined
   // member to setFromUnitVectors, so each one presented its flat face and they
   // came back as white flaps flapping off the underside.
   for(const t of [.10,.90])beam(BX,
    [lerp(A[0],B[0],t-.09),lerp(A[1],B[1],t-.09)-9,lerp(A[2],B[2],t-.09)],
    [lerp(A[0],B[0],t+.09),lerp(A[1],B[1],t+.09)-9,lerp(A[2],B[2],t+.09)],7,12);
   for(const s3 of [-1,1]){const nx=-(B[2]-A[2])/L2*s3,nz=(B[0]-A[0])/L2*s3;
    beam(BX,[A[0]+nx*7,A[1]+3.2,A[2]+nz*7],[B[0]+nx*7,B[1]+3.2,B[2]+nz*7],3.2,1.6);}
   if(!dd)for(let i=0;i<Math.round(L2/16);i++){const t=(i+.5)/Math.round(L2/16);
    kput('strip',[lerp(A[0],B[0],t),lerp(A[1],B[1],t)+3.6,lerp(A[2],B[2],t)],
     qFacing([B[0]-A[0],0,B[2]-A[2]]),[12,1.3,1.3],CYAN);}}
  else{beam(BX,A,[lerp(A[0],B[0],.26),lerp(A[1],B[1],.26)-4,lerp(A[2],B[2],.26)],8,15);
   beam(BX,[lerp(A[0],B[0],.78),lerp(A[1],B[1],.78)-3,lerp(A[2],B[2],.78)],B,8,15);
   for(let i=0;i<26;i++){const t=rr(.28,.76),sc=rr(3,11);
    kput(BX,[lerp(A[0],B[0],t)+rr(-26,26),sc*.5+rr(0,6),lerp(A[2],B[2],t)+rr(-26,26)],
     qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(1,3),sc,sc*rr(1,2.4)],null);}}});

 // ---- the cliff foot: transportation ---------------------------------------
 // The sheet has TRANSPORTATION running along the foot and INTER-CITY
 // TRANSPORTATION arriving across the plain. Both are here, and three lift
 // towers climb the 226 m of undercut cliff between them and the lowest
 // terrace — which is the only way anyone gets from one to the other.
 const VZ=-26,VY=30;
 for(let i=0;i<Math.round((XS-XW-260)/58);i++){const vx=XW+180+i*58;
  kput(BX,[vx,VY*.5,VZ],null,[9,VY,11],null);
  if(!dd||rng()>.18)beam(BX,[vx-29,VY,VZ],[vx+29,VY,VZ],5.5,16);}
 for(let i=0;i<Math.round((XS-XW-260)/14);i++){const vx=XW+180+i*14;
  if(dd&&rng()<.3)continue;
  for(const s2 of [-1,1])kput(BX,[vx,VY+3.4,VZ+s2*7],null,[13,2.6,1.6],null);}
 if(!dd)for(let i=0;i<Math.round((XS-XW-260)/44);i++)
  kput('strip',[XW+180+i*44,VY+4.6,VZ+7.6],null,[26,1.4,1.4],CYAN);
 // the station
 {const sx=-96,sz=VZ+42,sw=190,sd2=54;
  GRD.push(gridSurface((u,v)=>[sx+(u-.5)*sw,1.2,sz+(v-.5)*sd2],18,8,{uS:16,vS:8}));
  SH.push(gridSurface((u,v)=>{const a=u*Math.PI;
    return[sx+(v-.5)*sw,1.2+30*Math.sin(a),sz+Math.cos(a)*sd2*.5];},24,20,{uS:14,vS:18,
    hole:holeFn(dd*.85,9620,null,1.4)}));
  // FILLED end walls, not a 4%-wide arch ribbon: the first cut left the vault
  // open at both ends and it read as a length of pipe dropped on the grass.
  for(const s2 of [-1,1])SH.push(gridSurface((u,v)=>{const a=u*Math.PI;
    return[sx+s2*sw*.5,1.2+30*Math.sin(a)*(1-v),sz+Math.cos(a)*sd2*.5*(1-v)];},24,6,{uS:12,vS:6,
    hole:(u,v)=>v>.62&&Math.abs(u-.5)<.22}));
  // a train shed alongside, a platform apron and a signal mast, so the stop
  // reads as a terminus rather than as one hut
  SH.push(gridSurface((u,v)=>{const a=u*Math.PI;
    return[sx-14+(v-.5)*sw*.62,1.2+17*Math.sin(a),sz-sd2*.62+Math.cos(a)*sd2*.28];},18,16,{uS:10,vS:12,
    hole:holeFn(dd*.9,9628,null,1.4)}));
  GRD.push(gridSurface((u,v)=>[sx+(u-.5)*(sw+120),2.0,sz+(v-.5)*(sd2+130)],20,14,{uS:18,vS:14}));
  for(let i=0;i<9;i++){const px4=sx+((i+.5)/9-.5)*(sw+60);
   if(dd&&rng()<.3)continue;
   kput(BX,[px4,2.6,sz+sd2*.5+26],null,[(sw+60)/9*.92,1.2,7],new THREE.Color(dd?0x6b6459:0xb0a898));}
  for(let i=0;i<14;i++){const px3=sx+((i+.5)/14-.5)*sw;
   if(dd&&rng()<.3)continue;
   kput('aiPortal',[px3,1.2,sz+sd2*.5+.6],qFacing([0,0,1]),[.9,.8,1],null);}
  if(!dd)for(let i=0;i<9;i++)kput('strip',[sx+((i+.5)/9-.5)*sw,26,sz],qEuler(0,Math.PI/2,0),[30,1.6,1.6],CYAN);
  REGISTER({name:'Arcoindian I — transportation, the cliff foot',x:sx,z:sz,r:120,h:44});
  // INTER-CITY TRANSPORTATION, arriving across the plain on a high viaduct
  for(let i=0;i<13;i++){const t=(i+.5)/13,iz=lerp(sz+sd2*.6,960,t),iy=lerp(46,54,t);
   kput(BX,[sx+58,iy*.5,iz],null,[10,iy,12],null);
   if(!dd||rng()>.14)beam(BX,[sx+58,iy,iz-38],[sx+58,iy,iz+38],6,18);
   if(!dd&&i%3===1)kput('strip',[sx+58,iy+4.2,iz],qFacing([0,0,1]),[30,1.5,1.5],CYAN);}}
 // the lift towers
 for(let i=0;i<3;i++){const lx=PCX-150+i*130,lz=shelfE(lx)-14;
  const lh=SHELF+4;
  SH.push(gridSurface((u,v)=>{const a=u*TAU,r=13+1.6*Math.cos(a*4);
    return[lx+Math.cos(a)*r,v*lh,lz+Math.sin(a)*r];},22,30,{uS:10,vS:26,
    hole:holeFn(dd*.5,9622+i,null,1.2)}));
  for(let j=2;j*13<lh;j++)kput('slabCR',[lx,j*13,lz],null,[13,.8,13],new THREE.Color(0x24262a));
  for(let j=0;j<Math.floor(lh/9);j++){const ly=6+j*9;
   if(ly>lh-8)break;
   if(rng()>(dd?.5:.9))continue;
   kput('aiPane',[lx,ly,lz+14.2],qFacing([0,0,1]),[4.4,3.4,1],
    rng()<(dd?.05:.4)?litOf('lw'):ROOMC);}
  beam(BX,[lx,lh-3,lz],[PX2(Math.atan2(lz-PCZ,lx-PCX),RT(NT,Math.atan2(lz-PCZ,lx-PCX))-2),TY(NT)+1.2,
    PZ2(Math.atan2(lz-PCZ,lx-PCX),RT(NT,Math.atan2(lz-PCZ,lx-PCX))-2)],4.5,13);
  kput('slabC',[lx,lh+2,lz],null,[17,3,17],new THREE.Color(dd?0x6d665c:0xcac4b8));
  if(!dd)lring(lx,lh+4.4,lz,15,12);}
 if(!dd)figures(PCX,VZ+70,14,110);else figures(PCX,VZ+70,5,110);

 // ---- the ruin -------------------------------------------------------------
 // What kills a city under a rock roof is the roof. A slab has come off the
 // vault — the bite is in the cavern shell itself, not a second surface laid
 // over it — and it is lying on the terraces it went through.
 if(IMP){
  REGISTER({name:'Arcoindian I — the roof fall',x:IMP.x,z:IMP.z,r:IMP.r+30,y:SHELF-10,h:300});
  // SLABS, not boulders. The first cut threw dodecahedra up to 72 m across and
  // the roof fall came back as a heap of pale eggs: a 12-face solid at that
  // size has no edge, and rr(.13,.28) lightness renders near-white under a
  // 1.7-intensity sun with ACES tone mapping. A vault sheds PLATES — flat,
  // angular, tilted where they came to rest — so the big pieces are boxes at
  // random attitudes and everything is four stops darker.
  const fallY=(bx,bz)=>{const th=Math.atan2(bz-PCZ,bx-PCX),r4=Math.hypot(bx-PCX,bz-PCZ);
   let by=PY;for(let k=1;k<=NT;k++)if(r4>RT(k-1,th))by=TY(k);return by;};
  const dkC=()=>new THREE.Color().setHSL(rr(.05,.10),rr(.14,.32),rr(.05,.13));
  for(let i=0;i<130;i++){const t=Math.pow(rng(),1.5),a=rng()*TAU;
   const r=IMP.r*(.18+t*1.4),sc=rr(4,17)*(1-t*.42);
   const bx=IMP.x+Math.cos(a)*r,bz=IMP.z+Math.sin(a)*r;
   kput('rubble',[bx,fallY(bx,bz)+sc*.42+(1-t)*(1-t)*14,bz],qEuler(rng()*3,rng()*3,rng()*3),
    [sc*rr(.7,1.6),sc*rr(.4,.8),sc*rr(.7,1.6)],dkC());}
  for(let i=0;i<22;i++){const t=Math.pow(rng(),1.3),a=rng()*TAU;
   const r=IMP.r*(.12+t*1.25),bx=IMP.x+Math.cos(a)*r,bz=IMP.z+Math.sin(a)*r;
   const L2=rr(18,46)*(1-t*.4);
   kput(BX,[bx,fallY(bx,bz)+rr(2,13)*(1-t),bz],
    qEuler(rr(-.9,.9),rng()*TAU,rr(-.9,.9)),[L2,rr(4,11),L2*rr(.5,1.1)],dkC());}
  // and the dust of it thrown off the shelf onto the plain below
  for(let i=0;i<90;i++){const t=Math.pow(rng(),1.6),sc=rr(4,22)*(1-t*.5);
   kput('rubble',[IMP.x+rr(-190,190),sc*.4+(1-t)*16,rr(-120,150)],
    qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.7,1.5),sc*rr(.5,1),sc*rr(.7,1.5)],
    new THREE.Color().setHSL(rr(.05,.10),rr(.14,.32),rr(.06,.15)));}}

 // ---- merge and dress ------------------------------------------------------
 meshMerged(ROCK,MAT.aiRock,G);
 meshMerged(SHADE,MAT.aiShade,G);
 meshMerged(CUT,MAT.aiCut,G);
 meshMerged(RM,MAT.aiRoom,G);
 meshMerged(SH,wallM,G);
 meshMerged(GRD,deckM,G);
 if(DK.length)meshMerged(DK,MAT.aiVoid,G);
 if(dd){
  // stainsFromLedge() aims each streak radially about the BUILDER's origin,
  // which is 300 m from this city's own centre, so it would lay its decals
  // across the terraces instead of down them. Same maths about PC.
  const aiStain=(geos,n,lMax)=>{for(const f of ledgePoints(geos,n,.4)){
    const a=Math.atan2(f.p[2]-PCZ,f.p[0]-PCX),L=rr(5,lMax);
    kput('stain',[f.p[0]+Math.cos(a)*.7,f.p[1]-L*.5,f.p[2]+Math.sin(a)*.7],
     qFacing([Math.cos(a),0,Math.sin(a)]),[rr(1.4,4.2),L,1],null);}};
  mossOnSurface(GRD,0,0,0,130,3.6);mossOnSurface(SH,0,0,0,90,3.2);
  mossOnSurface(ROCK,0,0,0,110,4.2);
  vinesFromLedge(GRD,0,0,0,130,26);aiStain(SH,150,22);
  for(let i=0;i<150;i++){const th=rng()*TAU;if(tf(th)<.1)continue;
   const k=1+((rng()*NT)|0),r=RT(k-1,th);
   kput('vine',[PX2(th,r+.6),TY(k-1)-1.4,PZ2(th,r+.6)],
    qEuler(rr(-.12,.12),rng()*TAU,rr(-.12,.12)),[rr(.9,2),rr(7,34),rr(.9,2)],null);}
  for(let i=0;i<60;i++){const th=rng()*TAU,r=rr(RPLZ+10,Rplinth(th));
   VEG.tree(PX2(th,r),PY,PZ2(th,r),i%3,rr(6,17));}
  trees(PCX,VZ+60,120,420,34);}
 else trees(PCX,VZ+60,150,400,22);

 // ---- the covered surface, measured ----------------------------------------
 // The sheet says 10.5 ha. Integrating the plan on a 4 m lattice rather than
 // trusting the radii is the only way to know whether the lobing and the
 // pinch-out actually landed on the figure; --eval reads it off _api.
 let AREA=0;
 for(let ax=PCX-240;ax<PCX+240;ax+=4)for(let az=PCZ-240;az<PCZ+240;az+=4){
  const th=Math.atan2(az-PCZ,ax-PCX),r=Math.hypot(ax-PCX,az-PCZ);
  const R=Math.max(Rplinth(th),tf(th)>=.05?RT(NT,th):0);
  if(r<=R)AREA+=16;}
 POD.forEach(P=>{AREA+=3*Math.sqrt(3)*.5*P.pr*P.pr;});

 // ---- what the presets are derived from ------------------------------------
 AI_SITE[d]={x:gx,z:gz,d:d,dd:dd,XW:XW,XS:XS,CT0:CT0,SHELF:SHELF,XA:XA,
  PCX:PCX,PCZ:PCZ,PY:PY,TY0:TY0,NT:NT,RPL:RPL,RTE:RTE,RPLZ:RPLZ,RPRM:RPRM,
  crown:SHELF+HR0,lip0:lipY(0),zb0:ZB(0),area:AREA,
  TW:TW.map(t=>({x:t.x,z:t.z,r:t.r,h:t.h,k:t.k,n:t.n,y0:t.y0})),
  POD:POD.map(p=>({x:p.x,z:p.z,ty:p.ty,pr:p.pr,nm:p.nm})),
  HALL:{x0:HALL.x0,x1:HALL.x1,y0:HALL.y0,y1:HALL.y1,z0:HALL.z0,z1:HALL.z1},
  WELL:WELL.map(w=>({x:w.x,z:w.z,r:w.r,y0:w.y0,y1:wellY1(w),cav:!!w.cav,half:!!w.half})),
  ROOMS:ROOMS.map(r=>({x0:r.x0,x1:r.x1,y0:r.y0,y1:r.y1,z0:r.z0,z1:r.z1,k:r.k,n:r.n,
                       cut:!!r.cut,hall:!!r.hall})),
  IMP:IMP?{x:IMP.x,z:IMP.z,r:IMP.r}:null,
  faceZ:(x,y)=>faceZ(x,y),shelfE:x=>shelfE(x),roofY:(x,z)=>roofY(x,z),
  lipY:x=>lipY(x),ZB:x=>ZB(x),TY:k=>TY(k),RT:(k,th)=>RT(k,th),Rplinth:th=>Rplinth(th)};
 KOFF=[0,0,0];return G;}
