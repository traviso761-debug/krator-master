// ================================================================= ARCOINDIAN II — the half-cave
// Not a sequence of underground spaces: the use of a deep shelf on the wall of a
// canyon. A gaping hollow bitten into the cliff, its mouth open to the SOUTH so
// the hollow is a winter sun trap and a summer parasol, and the ceiling of the
// half cave is the roof above the roofs.
//
// Arcoindian I is a terraced hill standing on a rock shelf under an overhang.
// This is the other resolution of the same idea: nothing stands on the floor.
// A flattened LENS is slung inside the hollow, keyed into the back wall and
// overhanging the void, and it hangs on a stalk — a vertical shaft of LEARNING
// dropping out of its underside into the gorge, with further shafts continuing
// to the water on the valley floor and a marina at the bottom of them.
//
// THE FIGURES ARE THE BRIEF, so they are constants rather than guesses:
// population 5 000 at 529/ha, surface covered 8.6 ha (21 acres), height
// 280-340 m. The height figure is two numbers because it means two things and
// both are built exactly, from one pair of constants:
//
//   340 m   SILL. The cave floor, and therefore the city, stands 340 m over the
//           water on the floor of the gorge. That is the height of the place.
//   280 m   CROWN - SILL. The hollow's own height, sill to ceiling crown: the
//           section of the half cave itself.
//
//   8.6 ha  The lens's plan (a D against the back wall, 500 m along the cliff
//           by 230 m deep at the axis, clipped by the master joint), plus the
//           garden fan on the open shelf west of it, the shaft footprints and
//           the marina. Integrated on a 4 m lattice after the build, not
//           asserted: see AREA at the foot of this file.
//
// THE SITE. The cliff runs east-west along x; rock is at -z and the gorge at
// +z, which puts the mouth due south, as the sheet asks. The face LEANS OUT
// with height — brow(y) runs from z = -262 at the valley floor to +138 at the
// crown — so the whole cliff overhangs and the shafts dropping out of the lens
// hang free in air all the way down, getting further from the wall as they go.
// The far wall of the canyon stands across the gorge and the transportation
// bridge leaves the cave mouth to reach it.
//
// SHADE IS MODELLED, NOT LIT. Nothing in this kit casts a shadow and the
// hemisphere light's ground colour is a warm brown, so anything under a roof
// comes back lit from below. Arcoindian I answered that by making the shade its
// own darker material; this file does the same and reuses that file's palette
// (MAT.aiShade for the hollow, MAT.aiRock for the weathered face, MAT.aiCut for
// the joint plane) because it is the same cliff and the same civilisation.
// What is new here is the lens: it is the one bright object in the composition,
// because everything else in frame is rock, and its UNDERSIDE is its own
// material three stops down — a 500 m soffit hanging over a void would
// otherwise read as a pale ceiling and the lens would stop looking hung.
//
// THE SECTIONS. KNOWN_ISSUES records four types that attempted a cutaway and
// could not make one read, and one that could: a section needs deep solid
// fabric, and a shell has none. There are two pieces of deep fabric here.
//   SAGITTAL — the massif ends at x = 150 on a master joint, and the joint
//     plane cuts the rock, the rim plateau and the reservoir, three galleries
//     excavated behind the cave, a light well in long section, the access shaft
//     in long section, AND the lens. Because the lens is lenticular in the
//     (z,y) plane the cut face is itself lens-shaped, so the joint hands back
//     the sheet's own section drawing: five bands stacked in a lens, tapering
//     to points front and back. The bands are horizontal planes, so they cannot
//     miss the cut plane the way a random chamber walk does; the access shaft
//     stands ON the plane and crosses every one of them; and every opening in
//     the cut has a four-sided reveal 15 m deep, without which 690 m of rock
//     and 104 m of building both read as card.
//   CORONAL — the hollow IS the coronal cut: all the rock in front of the back
//     wall over 710 m of cliff has been removed, so from the gorge you look at
//     the cliff in section. The lens's nose is left open to make the building
//     half of it read the same way: each of the five bands is an open gallery
//     whose front edge stands where the lens is thick enough to hold it, so the
//     nose is a stagger of five lit storeys rather than one blank prow.
MAT.a2Lens =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xb9af9b,roughness:1,metalness:0,side:DS});
MAT.a2LensR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x7a7162,roughness:1,metalness:0,side:DS});
// THE UNDERSIDE. Its own material, because it is the largest soffit in the kit
// (a 500 x 230 m belly hanging over a 400 m drop) and the launch arcology's
// entry in KNOWN_ISSUES is exactly this: everything facing down comes back warm
// brown off the hemisphere's ground colour. Painting the shade in makes the
// lens read as a mass with a lit top and a dark bottom, which is the whole
// difference between a hung lens and a flat plate.
MAT.a2Under =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x53493b,roughness:1,metalness:0,side:DS});
MAT.a2UnderR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x3d362b,roughness:1,metalness:0,side:DS});
// Rough and almost non-metallic. At roughness .16 / metalness .28 a 1.7-intensity
// sun with no environment map put one flat specular sheet over the whole river
// and it came back as a swimming pool; there is nothing for a smooth metal to
// reflect in this scene, so the shine has to be given up to get the colour.
MAT.a2Water =new THREE.MeshStandardMaterial({color:0x08202b,roughness:.74,metalness:.04,transparent:true,opacity:.96,side:DS});
// A hull, not a box. The marina is the one place a person-scaled object sits at
// the bottom of a 400 m drop and gives it a scale, and six quads is cheaper
// than the box it replaces would have been convincing.
kdef('a2Hull',plymQuadGeo([
  [-.5,0,-.5,  .5,0,-.5,  .34,.5,-.5, -.34,.5,-.5],
  [-.34,.5,-.5, .34,.5,-.5, 0,.5,.5,   0,.5,.5],
  [-.5,0,-.5, -.34,.5,-.5, 0,.5,.5,    0,0,.5],
  [ .5,0,-.5,  0,0,.5,     0,.5,.5,    .34,.5,-.5],
  [-.5,0,-.5,  0,0,.5,     .5,0,-.5,   .5,0,-.5]],2,2),MAT.aiKit);
// Presets are DERIVED from this: targets/arcoindian2/91z-views.js runs after
// 90-scene.js, so the builder has already left its dimensions and its own face,
// roof and lens functions here.
const A2_SITE={};

function buildArcoindian2(scene,gx,gz,d){reseed(9590+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0;
 const lensM=dd?MAT.a2LensR:MAT.a2Lens, underM=dd?MAT.a2UnderR:MAT.a2Under;
 const deckM=dd?MAT.aiDeckR:MAT.aiDeck, wallM=dd?MAT.aiWallR:MAT.aiWall;
 const BX='aiBox', BXD='aiBoxD';
 const ROCK=[],SHADE=[],CUT=[],RM=[],LNS=[],UND=[],SH=[],DK=[],GRD=[];

 // ---- the numbers ----------------------------------------------------------
 const XW=-1500,XS=150;             // the west taper; the master joint
 const XA=-560;                     // the hollow closes to nothing here
 const CT0=690;                     // the rim plateau over the massif
 const SILL=340,CROWN=620;          // the city 340 m over the water; a 280 m hollow
 const WSY=6;                       // the water surface on the valley floor
 const ZBK=-1250;                   // the plateau runs back to here and grades out
 // The far wall of the canyon. It stands this far out because it has to: the far
 // wall OVERHANGS the gorge too (it is the same cliff seen from the other side),
 // so at lens height its face is already 30 m nearer than at the water, and any
 // camera in the gorge has to fit between the two. 760 leaves ~730 m of open
 // gorge at the lens's own height, which is what the hero and head-on shots need.
 const GFZ=760;
 // THE LENS. 500 m along the cliff, 230 m deep at the axis, 104 m thick at the
 // middle, tapering to points front and back. LWX/DZ/LTH is the one set that
 // lands on 8.6 ha once the master joint has taken the eastern 110 m of it; the
 // integration at the foot of the file is what says so.
 const LCX=10,LWX=250,DZ=248,LTH=52,LYC=455;
 // The reservoir is declared up here with the other numbers because the PLATEAU
 // SURFACE has to know about it. The first cut built a 30 m basin and dropped a
 // water sheet in it, then laid an unbroken tabletop straight over the top of
 // both: a ray cast down the reservoir's own axis stopped on rock at 686 and
 // never reached the water at 683 or the floor at 657. From the plateau shot it
 // looked like a rim wall round a patch of ground, which is exactly what it was.
 const RVX=LCX-250,RVZ=-760,RVR=190,RVD2=30;
 const rvLob=th=>1+.10*Math.sin(th*3.1);
 const inResv=(x,z)=>{const dx=x-RVX,dz=(z-RVZ)/.72;
  return Math.hypot(dx,dz)<RVR*rvLob(Math.atan2(dz,dx))*.97;};
 const NBD=5,BTH=2*LTH/NBD;         // five bands: LIVING / CITY CENTER / DWELLINGS / PUBLIC / CULTURAL
 const BAND=[{n:'Cultural centre',k:'cul'},{n:'Public',k:'pub'},{n:'Dwellings',k:'dwe'},
             {n:'City centre',k:'cty'},{n:'Living',k:'lw'}];
 const bandY=k=>LYC-LTH+k*BTH;      // the floor of band k, 0 at the bottom
 const DECK=LYC+LTH;                // the top deck, 507

 // ---- the rock -------------------------------------------------------------
 const ctop=x=>CT0*clamp(1-Math.pow(clamp((-x-560)/760,0,1),1.5),.06,1);
 // The overhang, as one function: the face leans out 400 m between the valley
 // floor and the crown and then pulls back into a caprock.
 const brow=y=>-262+400*Math.pow(clamp(y/CROWN,0,1),1.55)-46*Math.pow(clamp((y-CROWN)/80,0,1),1.2);
 // Relief cut INTO the rock, keyed to lengths a cliff actually has: gullies,
 // benches at discrete levels, wandering bedding and a fine break-up. Same
 // recipe as Arcoindian I's face, which was tuned until it stopped reading as
 // plywood — the bedding sines are deliberately half the amplitude of the
 // gullies because the board-formed texture already has horizontal lines in it.
 const rel=(x,y)=>4.2*Math.sin(y*.068+x*.0022+fbm(x*.0025,0,7121,2)*7)
   +2.0*Math.sin(y*.24+fbm(x*.0062,0,7122,2)*9)
   +5*Math.round(Math.sin(y*.040+fbm(x*.0031,0,7123,2)*6)*2)/2
   +28*Math.pow(Math.abs(fbm(x*.020,y*.0042,7124,3)-.5)*2,2.1)
   +12*Math.pow(Math.abs(fbm(x*.036,y*.011,7125,2)-.5)*2,1.5)
   +26*fbm(x*.0092,y*.0125,7126,4)+12*fbm(x*.030,y*.020,7127,3);
 const faceZ=(x,y)=>brow(y)-rel(x,y)
   +54*Math.pow(clamp(1-y/210,0,1),1.7)                          // talus banking out at the foot
   +10*Math.pow(clamp((y-ctop(x)*.90)/(ctop(x)*.10+1),0,1),1.2); // the caprock lip
 // THE PLATEAU as a function, not as a surface: every collar, basin, kerb and
 // shrub standing on it has to use the same height the surface uses, noise and
 // all. Arcoindian I buried a whole haul road by using the nominal ctop() for
 // the furniture and the noisy surface for the ground.
 const fall=z=>clamp((z-ZBK)/400,0,1);
 const platY=(x,z)=>{const z0=faceZ(x,ctop(x))+3;
  const v=Math.pow(clamp((z0-z)/(z0-ZBK),0,1),1/.82);
  return ctop(x)*fall(z)+15*(fbm(x*.0043,z*.0043,7128,3)*2-1)*Math.min(1,v*6)*fall(z);};

 // ---- the hollow -----------------------------------------------------------
 // It closes to nothing at XA and is at FULL section where the massif is cut,
 // so the sagittal section shows a cave and not the tail of one.
 const cf=x=>clamp((x-XA)/300,0,1);
 const HR=x=>(CROWN-SILL)*Math.pow(cf(x),.75);
 const ZB=x=>-40-230*Math.pow(cf(x),.8);       // the back wall
 const SCAR={o:null};                          // where the ceiling let go, chosen below
 const scarY=(x,z,s)=>{const I=SCAR.o;if(!I)return 0;
  const k2=clamp((1-Math.hypot(x-I.x,z-I.z)/I.r)*3,0,1);
  return k2*(44+18*(fbm(x*.02,z*.02,7129,2)*2-1))*Math.min(1,s*3);};
 const lipY=x=>SILL+.80*HR(x)*(1+.07*(fbm(x*.0055,.4,7130,3)*2-1));
 const lipZ=x=>faceZ(x,lipY(x))+5;             // 5 m proud of the face: see the brow fringe
 const topY=x=>SILL+.60*HR(x);
 const bez=(x,s)=>{const z0=lipZ(x),y0=lipY(x),z2=ZB(x),y2=topY(x);
  const z1=lerp(z0,z2,.45),y1=SILL+HR(x)*1.28;
  const a=(1-s)*(1-s),b=2*s*(1-s),c=s*s;
  return[a*z0+b*z1+c*z2,a*y0+b*y1+c*y2];};
 // The vault's relief as its own function, so the shell and everything measured
 // against it cannot disagree. Arcoindian I hung three light shafts fifteen
 // metres below its own ceiling by having two answers to "where is the roof",
 // and --assert could not see it.
 const roofN=(x,z,s)=>((fbm(x*.014,z*.014,7131,3)*2-1)*16
   +(fbm(x*.046,z*.046,7132,2)*2-1)*6)*Math.min(1,s*5);
 const roofY=(x,z)=>{if(HR(x)<6)return -1;let p=bez(x,0);
  for(let i=1;i<=20;i++){const q=bez(x,i/20);
   if((z<=p[0]&&z>=q[0])||(z>=p[0]&&z<=q[0])){const t=(z-p[0])/((q[0]-p[0])||1);
    return lerp(p[1],q[1],t)+roofN(x,z,(i-1+t)/20)+scarY(x,z,(i-1+t)/20);}
   p=q;}
  return -1;};

 // ---- the lens -------------------------------------------------------------
 // sx() is the taper along the cliff; the plan is a D whose straight side is the
 // back wall and whose front is elliptical with a little lobing, so the outline
 // is a family with the rock rather than a drawn ellipse.
 const sx=x=>Math.pow(clamp(1-Math.pow(Math.abs(x-LCX)/LWX,2.6),0,1),.5)
   *(1+.055*(fbm((x-LCX)*.0055,0,7133,3)*2-1));
 const lz0=x=>ZB(x)-30;                        // 30 m of it is keyed into the rock
 const lz1=x=>lz0(x)+DZ*sx(x);
 // Half-thickness. Points at both ends, thickest in the middle — the sheet's
 // section, as a formula rather than as a drawn profile.
 const lth=(x,z)=>{const a=lz0(x),b=lz1(x);if(!(b>a+2))return 0;
  const u=(z-a)/(b-a);if(u<=0||u>=1)return 0;
  return LTH*sx(x)*Math.pow(4*u*(1-u),.55);};
 // Where on the FRONT side the lens has thinned to t. This is what stands each
 // band's gallery at its own z: the thin top and bottom bands sit well back and
 // the fat middle ones reach nearly to the nose, which is what makes the prow a
 // stagger of five storeys instead of one blank curve.
 const lensFZ=(x,t)=>{const a=lz0(x),b=lz1(x),s=LTH*sx(x);
  if(!(s>t+.5)||!(b>a+2))return null;
  const u=.5*(1+Math.sqrt(clamp(1-Math.pow(t/s,1/.55),0,1)));
  return a+u*(b-a);};
 const inLens=(x,y,z)=>Math.abs(y-LYC)<lth(x,z)&&x<XS;
 // THE SUN COURT. The mouth is open to the south, so the lens gets a court cut
 // into its top that faces the same way: 160 m wide, open over the nose, and
 // 46 m deep, which is as much as a 104 m lens can give up without cutting
 // through its own belly. It is the winter sun trap at building scale.
 // 62 m deep, which lays THREE of the five bands open on its back wall: a lens
 // cannot give up more than that from the top without cutting through its own
 // belly, and three bands in section facing due south is the coronal drawing.
 const NX0=LCX-82,NX1=LCX+82,NY=LYC-10;
 const nzB=x=>lz1(x)-118;
 const inNotch=(x,z)=>x>NX0&&x<NX1&&z>nzB(x);
 // WHERE THE CEILING LET GO. Chosen here, before the light wells are sited,
 // because roofY() asks scarY() where the roof is and the wells are placed
 // against roofY(). One source, or the shafts hang below their own ceiling.
 const IMP=dd?{x:LCX+rr(-90,50),z:rr(-250,-150),r:78}:null;
 SCAR.o=IMP;
 // THE VALLEY FLOOR, at builder scope: the gorge, the marina, the bridge piers
 // and the fallen span all have to agree about where the bottom is.
 //
 // It carries a CHANNEL, and it has to. The first cut laid a flat floor at
 // y = 2 + 12*fbm — mean 8 — and a water sheet at y = 6, so the river was buried
 // under its own bed everywhere except the few hollows where the noise dipped
 // below six, and came back as one small puddle in a 1.5 km plain. Nothing in
 // --assert can see a water plane that is 2 m under the ground. The channel is
 // a cosine trough on a wandering centreline, cut 22 m below the water, so the
 // water has somewhere to be and the banks have a line to follow.
 const rivC=x=>272+96*(fbm(x*.0016,3.1,7152,3)*2-1);    // the channel centre in z, wandering
 const rivW=x=>176+54*(fbm(x*.0021,8.4,7153,2)*2-1);    // its half-width
 const flr=(x,z)=>{const c=rivC(x),w=rivW(x);
  const t=clamp(Math.abs(z-c)/w,0,1);
  return 4+13*fbm(x*.0022,z*.0022,7147,3)
   -28*Math.pow(1-t*t,1.25)                             // the channel
   +44*Math.pow(clamp((z-GFZ+230)/230,0,1),1.8)         // the far bank rising
   +30*Math.pow(clamp(1-(z+150)/200,0,1),1.7);};        // the talus under the cliff

 // ---- what is cut into the rock behind the hollow ---------------------------
 // Three galleries running back from the cave into the massif, all three
 // reaching the master joint so all three are laid open by it. They are what
 // gives the section something between the plateau and the hollow; without them
 // the joint plane is 300 m of blank rock over a cave.
 const GAL=[{y0:352,y1:406,z0:-566,z1:-292,k:'ind',n:'Industries'},
            {y0:428,y1:480,z0:-528,z1:-292,k:'dwe',n:'Dwellings'},
            {y0:502,y1:552,z0:-492,z1:-292,k:'pub',n:'Public'}];
 const ROOMS=[];
 GAL.forEach((L,li)=>{let x=-330,last=null;
  while(x<XS-30){const w=rr(62,116),x1=Math.min(x+w,XS);
   if(x1-x>36){const zd=rr(.58,1.0);
    last={x0:x,x1:x1,y0:L.y0,y1:L.y1,z0:lerp(L.z1,L.z0,zd),z1:L.z1,k:L.k,n:L.n,lev:li,cut:false};
    ROOMS.push(last);}
   x=x1+rr(15,26);}
  // A gallery that reaches the joint MUST land on it. Left to the walk it does
  // not — the last room stops wherever rr(62,116) put it, and Arcoindian I's
  // first cut showed one chamber on the plane intact and two ruined, purely on
  // the draw. The section is the point of the type; it does not get to be luck.
  if(last){if(XS-last.x1<44){last.x1=XS;last.cut=true;}
   else ROOMS.push({x0:last.x1+rr(16,24),x1:XS,y0:L.y0,y1:L.y1,
     z0:lerp(L.z1,L.z0,rr(.62,1.0)),z1:L.z1,k:L.k,n:L.n,lev:li,cut:true});}});
 // Passages from each gallery forward into the back wall of the hollow.
 const PASS=[];
 ROOMS.forEach(R=>{const px=clamp((R.x0+R.x1)*.5+rr(-14,14),R.x0+13,R.x1-13);
  if(px>XS-26)return;
  PASS.push({x:px,y:R.y0+4,z0:R.z1,z1:ZB(px)+2,w:15,h:14,k:R.k});});
 PASS.push({x:XS,y:436,z0:-292,z1:ZB(XS)+2,w:18,h:16,k:'dwe',half:true});

 // THE ACCESS SHAFT. On the joint plane, from the shelf up through the open
 // hollow, through every band of the lens, back out into the hollow and on up
 // through 110 m of rock to the plateau. It is here because the section needs
 // something that runs ACROSS the levels: five horizontal bands laid open in a
 // cliff are five unrelated slots until one thing ties them together.
 const A2ST={x:XS,z:-214,w:21,y0:SILL+2,y1:CT0-10};

 // ---- light wells ----------------------------------------------------------
 // Dropped from the rim plateau through the roof of the hollow. Lined dark and
 // rimmed with a collar, because a shadowless engine makes a bright patch of any
 // deep void seen from above; and a pale radial-falloff disc is laid on the lens
 // deck under each one, which is what a shaft of daylight looks like from inside
 // when nothing in the scene can cast one.
 const WELL=[];
 for(let i=0;i<5;i++){const wr=rr(11,18);let ok=false,wx=LCX,wz=-200;
  for(let g=0;g<30&&!ok;g++){
   wx=lerp(LCX-LWX*.80,Math.min(LCX+LWX*.80,XS-40),(i+rr(.15,.85))/5);
   wz=rr(ZB(wx)+50,lz1(wx)-70);
   ok=lth(wx,wz)>14&&!inNotch(wx,wz)&&Math.abs(wx-A2ST.x)>40
      &&!WELL.some(w=>Math.hypot(wx-w.x,wz-w.z)<w.r+wr+50);}
  if(ok)WELL.push({x:wx,z:wz,r:wr,y0:roofY(wx,wz)+1});}
 // Two shafts on the joint plane, so the section shows them in long section
 // running 200 m up to daylight rather than as holes in a ceiling.
 WELL.push({x:XS,z:-372,r:15,y0:GAL[2].y1-2,half:true,gal:true});
 const wellY1=W=>platY(W.x,W.z)+2;
 const inWell=(x,z,pad)=>{for(let i=0;i<WELL.length;i++){const W=WELL[i];
   const dx=x-W.x,dz=z-W.z,r2=W.r+(pad||0);if(dx*dx+dz*dz<r2*r2)return W;}return null;};

 // ---- the stalk ------------------------------------------------------------
 // LEARNING drops out of the lens's underside where the lens overhangs the
 // shelf, and three slimmer shafts continue from the foot of it to the water.
 // The whole drop is in free air: the cliff below the sill recedes 130 m by the
 // valley floor, so nothing here needs to dodge the rock — that is the one
 // structural gift an overhanging cliff makes.
 const STZ=-86,STX=LCX-24,STR=27;
 // Carried up to the HIGHEST point of the belly over its own footprint, not to
 // the belly height at its centre: the underside is curved, so a flat top cut at
 // the centre value pokes out at the back and leaves a 23 m gap at the front.
 // The first renders showed exactly that — an open chimney with a black pit in
 // it, seen from every camera under the lens.
 const STY1=LYC-lth(STX,STZ+STR)+7;
 const STY0=176;                    // where LEARNING ends and the water shafts start
 const SUB=[[-34,10],[6,-16],[34,14]];

 // ---- what the joint plane opens -------------------------------------------
 const CUTO=[];                                   // openings in the ROCK's cut face
 ROOMS.forEach(R=>{if(R.cut)CUTO.push([R.z0,R.z1,R.y0,R.y1]);});
 PASS.forEach(P=>{if(P.half)CUTO.push([Math.min(P.z0,P.z1),Math.max(P.z0,P.z1),P.y,P.y+P.h]);});
 WELL.forEach(W=>{if(W.half)CUTO.push([W.z-W.r,W.z+W.r,W.y0,wellY1(W)]);});
 const inCutO=(z,y)=>{for(let i=0;i<CUTO.length;i++){const C=CUTO[i];
   if(z>C[0]+5&&z<C[1]-5&&y>C[2]+4&&y<C[3]-4)return true;}return false;};
 // openings in the LENS's cut face: one per band per bay, plus the access shaft
 const LCUT=[];
 for(let k=0;k<NBD;k++){const y0=bandY(k)+4,y1=bandY(k)+BTH-4;
  const a=lz0(XS),b=lz1(XS);
  const nb=5;
  for(let i=0;i<nb;i++){const z0=lerp(a+14,b-12,i/nb)+3,z1=lerp(a+14,b-12,(i+1)/nb)-3;
   if(lth(XS,(z0+z1)*.5)<Math.max(Math.abs(y0-LYC),Math.abs(y1-LYC))+3)continue;
   LCUT.push([z0,z1,y0,y1]);}}
 // the access shaft, flagged: it is the full height of the lens and its reveals
 // belong to the shaft's own walls, not to a rectangle in a lens-shaped face
 LCUT.push([A2ST.z-A2ST.w*.5,A2ST.z+A2ST.w*.5,LYC-LTH-4,LYC+LTH+4,1]);
 const inLCut=(z,y)=>{for(let i=0;i<LCUT.length;i++){const C=LCUT[i];
   if(z>C[0]+2&&z<C[1]-2&&y>C[2]+2&&y<C[3]-2)return true;}return false;};

 // ---- registry -------------------------------------------------------------
 REGISTER({name:'Arcoindian II — the half-cave ('+STATE(d)+')',x:LCX-60,z:-200,r:620,h:CT0+30});
 REGISTER({name:'Arcoindian II — the hollow',x:LCX-90,z:-130,r:430,y:SILL-12,h:CROWN-SILL+40});
 REGISTER({name:'Arcoindian II — the lens',x:LCX-30,z:-190,r:280,y:LYC-LTH-8,h:2*LTH+18});
 REGISTER({name:'Arcoindian II — the section cut',x:XS-30,z:-320,r:280,h:CT0});
 REGISTER({name:'Arcoindian II — the rim plateau',x:LCX-140,z:-660,r:520,y:CT0-70,h:120});
 REGISTER({name:'Arcoindian II — the gorge and the water',x:LCX-60,z:230,r:520,h:120});

 // ---- the cliff face -------------------------------------------------------
 // The mouth is cut 9 m short of the lip and starts 8 m above the sill:
 // gridSurface drops whole quads, so a hole whose edge is the exact boundary
 // leaks a cell of daylight where the cavern shell does not quite reach. The
 // margins put a rock brow over the mouth and a rock lip along the sill, which
 // is what an undercut shelter has anyway.
 const mouthHole=(x,y)=>HR(x)>14&&y>SILL+8&&y<lipY(x)-9;
 ROCK.push(gridSurface((u,v)=>{const x=lerp(XW,XS,u),y=v*ctop(x);
   return[x,y,faceZ(x,y)];},224,76,{uS:(XS-XW)/74,vS:CT0/66,
   hole:(u,v)=>mouthHole(lerp(XW,XS,u),v*ctop(lerp(XW,XS,u)))}));
 ROCK.push(gridSurface((u,v)=>{const x=lerp(XW,XS,u);
   const z0=faceZ(x,ctop(x))+3,z=lerp(z0,ZBK,Math.pow(v,.82));
   return[x,platY(x,z),z];},148,44,{uS:(XS-XW)/30,vS:40,
   hole:(u,v)=>{const x=lerp(XW,XS,u),z0=faceZ(x,ctop(x))+3,z=lerp(z0,ZBK,Math.pow(v,.82));
    return !!inWell(x,z,0)||inResv(x,z);}}));
 // THE BROW FRINGE. Without it the mouth's top edge is a flight of 7 m stairs
 // cut in the rock, because whole quads are what a hole drops. A 34 m band lying
 // 5 m proud of the face covers the stepped edge with the lip a rock shelter has.
 ROCK.push(gridSurface((u,v)=>{const x=lerp(XA,XS,u),ly=lipY(x),y=ly-16+v*35;
   return[x,y,faceZ(x,y)+5.5-3*Math.abs(v-.45)];},160,4,{uS:(XS-XA)/74,vS:4,
   hole:(u,v)=>HR(lerp(XA,XS,u))<20}));
 // talus banked against the foot of the cliff, largest at the wall
 for(let i=0;i<230;i++){const x=rr(XW+60,XS+120),t=Math.pow(rng(),1.9);
  const bx=faceZ(x,8)+t*170,sc=rr(4,26)*(1-t*.45);
  kput('rubble',[x,sc*.4+(1-t)*(1-t)*22,bx],qEuler(rng()*3,rng()*3,rng()*3),
   [sc*rr(.7,1.5),sc*rr(.5,1),sc*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.10),rr(.12,.32),rr(.11,.24)));}

 // ---- the shell of the hollow ----------------------------------------------
 // One surface: brow lip, over the vault, down the back wall and 8 m under the
 // shelf. The roof's noise is displaced in y and the wall's in z, and both ramp
 // from zero at their seams so the two halves meet exactly.
 const cavPt=(x,v)=>{const h=HR(x);
  if(h<2)return[x,SILL,ZB(x)];
  if(v<=.66){const s=v/.66,p=bez(x,s);
   return[x,p[1]+roofN(x,p[0],s)+scarY(x,p[0],s),p[0]];}
  const s=(v-.66)/.34,y=lerp(topY(x),SILL-8,s);
  return[x,y,ZB(x)+((fbm(x*.013,y*.013,7134,3)*2-1)*18
                    +(fbm(x*.044,y*.044,7135,2)*2-1)*7)*Math.min(1,s*4)];};
 SHADE.push(gridSurface((u,v)=>cavPt(lerp(XA,XS,u),v),136,46,{uS:(XS-XA)/60,vS:9,
   hole:(u,v)=>{const p=cavPt(lerp(XA,XS,u),v);
    return v<.5&&!!inWell(p[0],p[2],-1);}}));
 // THE SHELF: the floor of the hollow, back wall to cliff edge. Its inner edge
 // is clamped against its outer one — at the west end the hollow closes and the
 // back wall runs out IN FRONT of the weathered face, so a surface lerped
 // between the two folds inside out over 200 m of cliff. Clamping leaves a
 // sliver there instead, which is what the tail of a cave is.
 const shelfE=x=>faceZ(x,SILL);
 const shelfI=x=>Math.min(ZB(x)-6,shelfE(x)-5);
 GRD.push(gridSurface((u,v)=>{const x=lerp(XA+18,XS,u);
   const z=lerp(shelfI(x),shelfE(x),v);
   return[x,SILL+(fbm(x*.011,z*.011,7136,3)*2-1)*2.6*Math.min(1,v*5)*Math.min(1,(1-v)*7),z];},
   112,26,{uS:(XS-XA)/60,vS:7}));
 // and its fascia, 90 m down the face, 2 m proud, so the shelf has an underside
 SHADE.push(gridSurface((u,v)=>{const x=lerp(XA+18,XS,u),y=lerp(SILL,SILL-90,v);
   return[x,y,lerp(shelfE(x),faceZ(x,SILL-90)+2,Math.pow(v,.75))];},112,8,{uS:(XS-XA)/60,vS:5}));

 // ---- the master joint -----------------------------------------------------
 // Flatter and less gullied than the weathered face on purpose: a joint plane is
 // a fracture, and it has to read as a cut or the section preset is one more
 // picture of a cliff.
 const cutZ=(y)=>faceZ(XS,y)+2;
 const inCavCut=(y,z)=>{if(y<SILL+10)return false;
  if(z<ZB(XS)+10||z>lipZ(XS)-4)return false;
  const ry=roofY(XS,z);return ry>0&&y<ry-10;};
 // The lens's own footprint on the joint plane. The thickness test MUST be
 // guarded: lth() returns 0 everywhere outside the lens, so the bare
 // |y-LYC| < lth+1.5 was true for a 3 m band at EVERY z, and punched a 3 m slot
 // straight across 900 m of rock at the lens's centreline. It rendered as one
 // thin dark line on the section — the kind of thing that looks like a texture
 // band, survives four invariants and two screenshot rounds, and is only
 // settled by raycasting the face and finding the ray comes out the far side of
 // the massif.
 const inLensCut=(y,z)=>lth(XS,z)>1&&Math.abs(y-LYC)<lth(XS,z)+1.5;
 // THE JOINT PLANE NEVER GOES WEST OF XS. The relief is |noise|, not noise, so
 // the face only ever bulges OUT. Signed noise took it up to 14 m back into the
 // massif, and every cut gallery's floor, ceiling and plate — all of which end
 // at exactly XS, because that is what makes them land on the section — then
 // poked straight through the rock and hung in the air outside it: an 8 m slab
 // running 200 m along the cliff at the lens's own eye level, on a build whose
 // invariants were all green. Only a close camera on the face found it.
 const cutX=(y,z)=>XS+3+Math.abs((fbm(z*.0062,y*.0062,7137,3)*2-1)*11)
   +Math.abs((fbm(z*.021,y*.021,7138,2)*2-1)*5);
 CUT.push(gridSurface((u,v)=>{const y=v*ctop(XS),z=lerp(cutZ(y),-880,Math.pow(u,.85));
   return[cutX(y,z)*Math.min(1,u*6)+XS*(1-Math.min(1,u*6)),y,z];},124,78,{uS:38,vS:CT0/24,
   hole:(u,v)=>{const y=v*ctop(XS),z=lerp(cutZ(y),-880,Math.pow(u,.85));
    return inCavCut(y,z)||inLensCut(y,z)||inCutO(z,y)
      ||(Math.abs(z-A2ST.z)<A2ST.w*.5&&y>A2ST.y0&&y<A2ST.y1);}}));
 // REVEALS. Every opening returns 15 m into the rock — a sill, a head and two
 // cheeks. Without them a plane with rectangles cut in it is a sheet of card,
 // which is precisely the failure that killed three earlier cutaways.
 const RVD=15;
 const reveal=(z0,z1,y0,y1,dep,into)=>{
  for(const zz of [z0,z1])CUT.push(gridSurface((u,v)=>
   [cutX(lerp(y0,y1,u),zz)-v*dep,lerp(y0,y1,u),zz],8,3,{uS:6,vS:3}));
  for(const yy of [y0,y1])CUT.push(gridSurface((u,v)=>
   [cutX(yy,lerp(z0,z1,u))-v*dep,yy,lerp(z0,z1,u)],12,3,{uS:6,vS:3}));};
 CUTO.forEach(C=>reveal(C[0]+5,C[1]-5,C[2]+4,C[3]-4,RVD));
 reveal(A2ST.z-A2ST.w*.5,A2ST.z+A2ST.w*.5,A2ST.y0,A2ST.y1,RVD);
 // blocks along the crest and the spoil of the joint's own failure
 for(let i=0;i<64;i++){const z=rr(-860,cutZ(CT0*.9)),sc=rr(6,22);
  kput('rubble',[XS+rr(-14,16),ctop(XS)-rr(0,10)+sc*.3,z],qEuler(rng()*3,rng()*3,rng()*3),
   [sc*rr(.7,1.6),sc*rr(.5,1),sc*rr(.7,1.6)],new THREE.Color().setHSL(rr(.05,.10),rr(.14,.32),rr(.16,.32)));}
 for(let b=0;b<3;b++){const by=52+b*52,bd=16+b*9;
  CUT.push(gridSurface((u,v)=>[XS+lerp(0,bd,v),by,lerp(cutZ(by),-840,Math.pow(u,.85))],36,3,{uS:24,vS:4}));
  CUT.push(gridSurface((u,v)=>[XS+bd,lerp(by,by-52,v),lerp(cutZ(by),-840,Math.pow(u,.85))],36,4,{uS:24,vS:5}));}
 for(let i=0;i<140;i++){const t=Math.pow(rng(),1.7),z=rr(-860,cutZ(20));
  const sc=rr(4,26)*(1-t*.5);
  kput('rubble',[XS+8+t*200,sc*.4+(1-t)*(1-t)*30,z],qEuler(rng()*3,rng()*3,rng()*3),
   [sc*rr(.7,1.6),sc*rr(.5,1),sc*rr(.7,1.6)],new THREE.Color().setHSL(rr(.05,.10),rr(.14,.34),rr(.14,.30)));}

 // ---- the excavated galleries ----------------------------------------------
 const ZLIT={ind:new THREE.Color(0xffb257),cty:CYAN,cul:CYAN,pub:CYAN,
             dwe:WARM,lw:WARM,lrn:new THREE.Color(0xbfe6ff),mar:new THREE.Color(0xffe0b0)};
 const litOf=k=>(ZLIT[k]||WARM).clone().multiplyScalar(dd?rr(.10,.32):rr(.32,.88));
 const ROOMC=dd?DEAD:new THREE.Color(0x0f1720);
 const lring=(cx,cy,cz,r,n)=>stripRing(cx,cy,cz,r,d,n);
 const stoneC=()=>new THREE.Color().setHSL(rr(.06,.11),rr(.05,.16),dd?rr(.13,.24):rr(.23,.38));
 ROOMS.forEach((R,ri)=>{
  RM.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),R.y0,lerp(R.z0,R.z1,v)],9,9,{uS:8,vS:8}));
  RM.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),R.y1,lerp(R.z0,R.z1,v)],9,9,{uS:8,vS:8,
   hole:(u,v)=>!!inWell(lerp(R.x0,R.x1,u),lerp(R.z0,R.z1,v),-1)}));
  RM.push(gridSurface((u,v)=>[R.x0,lerp(R.y0,R.y1,v),lerp(R.z0,R.z1,u)],9,6,{uS:8,vS:6}));
  if(!R.cut)RM.push(gridSurface((u,v)=>[R.x1,lerp(R.y0,R.y1,v),lerp(R.z0,R.z1,u)],9,6,{uS:8,vS:6}));
  RM.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),lerp(R.y0,R.y1,v),R.z0],9,6,{uS:8,vS:6}));
  const P=PASS.find(p=>p.z0===R.z1&&p.x>R.x0&&p.x<R.x1);
  RM.push(gridSurface((u,v)=>[lerp(R.x0,R.x1,u),lerp(R.y0,R.y1,v),R.z1],12,7,{uS:8,vS:6,
   hole:(u,v)=>{if(!P)return false;const x=lerp(R.x0,R.x1,u),y=lerp(R.y0,R.y1,v);
    return Math.abs(x-P.x)<P.w*.5&&y>P.y&&y<P.y+P.h;}}));
  // FLOOR PLATES: pale over a dark soffit, never the same grey as the void
  // behind them, or the whole section renders as one ramp.
  const st=18,np=Math.max(1,Math.floor((R.y1-R.y0-6)/st));
  for(let p=1;p<=np;p++){const py=R.y0+p*st;if(py>R.y1-5)break;
   const hl=(u,v)=>{const x=lerp(R.x0,R.x1,u),z=lerp(R.z0,R.z1,v);
    return !!inWell(x,z,-1)||(dd&&fbm(u*5+p,v*4,7139+p,3)<.26);};
   const pl=dy=>gridSurface((u,v)=>[lerp(R.x0+3,R.x1-(R.cut?0:3),u),py+dy,lerp(R.z0+3,R.z1-3,v)],
    10,8,{uS:6,vS:6,hole:hl});
   SH.push(pl(0));DK.push(pl(-1.3));
   const nq=Math.max(2,Math.round((R.x1-R.x0)/24));
   for(let q=0;q<nq;q++){const px2=lerp(R.x0+6,R.x1-6,(q+.5)/nq);
    if(rng()<(dd?.55:.28))continue;
    const zc2=rr(R.z0+13,R.z1-13),zl=rr(20,Math.min(90,(R.z1-R.z0)*.55));
    kput(BXD,[px2,py+(st-2)*.5,zc2],null,[1.1,st-3,zl],null);
    if(R.cut)for(let c=0;c<3;c++){const cz=zc2+((c+.5)/3-.5)*zl;
     if(rng()<(dd?.6:.22))continue;
     kput('aiPane',[px2+.9,py+4.0,cz],qFacing([1,0,0]),[5.2,3.2,1],
      rng()<(dd?.06:.5)?litOf(R.k):ROOMC);}}
   if(!dd&&rng()<.7)kput('strip',[(R.x0+R.x1)*.5,py+st-3,rr(R.z0+18,R.z1-18)],
    qEuler(0,Math.PI/2,0),[Math.min(64,(R.z1-R.z0)*.5),1.4,1.4],ZLIT[R.k]||CYAN);}
  if(ri%3===0)REGISTER({name:'Arcoindian II — excavated '+R.n.toLowerCase(),
   x:(R.x0+R.x1)*.5,z:(R.z0+R.z1)*.5,r:Math.max(40,(R.x1-R.x0)*.6),y:R.y0-2,h:R.y1-R.y0+4});
  const nf=Math.round((R.x1-R.x0)/17);
  for(let i=0;i<nf;i++){const fx=rr(R.x0+6,R.x1-6),fz=rr(R.z0+8,R.z1-8);
   if(inWell(fx,fz,4))continue;
   if(R.k==='ind'){const hh=rr(9,Math.min(30,R.y1-R.y0-8));
    kput(dd?'pipeR':'pipe',[fx,R.y0+hh*.5,fz],null,[rr(3,7),hh,rr(3,7)],null);}
   else{const hh=rr(3,7);
    kput(BX,[fx,R.y0+hh*.5,fz],qEuler(0,rng()*TAU,0),[rr(5,13),hh,rr(4,10)],null);}}});
 PASS.forEach(P=>{const za=Math.min(P.z0,P.z1),zb2=Math.max(P.z0,P.z1);
  const hw=P.half?0:P.w*.5;
  RM.push(gridSurface((u,v)=>[P.x+lerp(-hw,P.w*.5,u),P.y,lerp(za,zb2,v)],3,12,{uS:4,vS:12}));
  RM.push(gridSurface((u,v)=>[P.x+lerp(-hw,P.w*.5,u),P.y+P.h,lerp(za,zb2,v)],3,12,{uS:4,vS:12}));
  RM.push(gridSurface((u,v)=>[P.x-hw,lerp(P.y,P.y+P.h,v),lerp(za,zb2,u)],12,3,{uS:12,vS:4}));
  if(!P.half)RM.push(gridSurface((u,v)=>[P.x+P.w*.5,lerp(P.y,P.y+P.h,v),lerp(za,zb2,u)],12,3,{uS:12,vS:4}));
  if(!P.half){kput('aiPortal',[P.x,P.y,ZB(P.x)+1],qFacing([0,0,1]),[P.w/8,P.h/12,1],null);
   for(const s3 of [-1,1])kput(BX,[P.x+s3*(P.w*.5+3),P.y+P.h*.5,ZB(P.x)+3],null,[6,P.h+6,7],null);
   if(!dd)kput('strip',[P.x,P.y+P.h+.6,ZB(P.x)+4],null,[P.w,1.6,1.6],CYAN);}
  const nl=Math.max(2,Math.round((zb2-za)/22));
  for(let i=0;i<nl;i++){const pz=lerp(za+6,zb2-6,(i+.5)/nl);
   if(!dd)kput('strip',[P.x,P.y+P.h-1.6,pz],qEuler(0,Math.PI/2,0),[13,1.3,1.3],CYAN);}});

 // ---- THE LENS -------------------------------------------------------------
 // Two surfaces, top and bottom. They meet by construction wherever the
 // half-thickness reaches zero — the whole front edge and both flanks — so the
 // lens is a closed solid without a single explicit end cap. That is the payoff
 // of writing the form as a thickness rather than as a set of walls.
 const lensHole=(x,z)=>lth(x,z)<=0;
 const NLU=136,NLV=52;
 LNS.push(gridSurface((u,v)=>{const x=lerp(LCX-LWX,XS,u),a=lz0(x),b=lz1(x);
   const z=lerp(a,b,v);return[x,LYC+lth(x,z),z];},NLU,NLV,{uS:(XS-LCX+LWX)/9,vS:DZ/9,
   hole:(u,v)=>{const x=lerp(LCX-LWX,XS,u),z=lerp(lz0(x),lz1(x),v);
    return lensHole(x,z)||inNotch(x,z)||!!inWell(x,z,-2)
      ||(Math.abs(x-A2ST.x)<A2ST.w*.5&&Math.abs(z-A2ST.z)<A2ST.w*.5)
      ||(dd&&SCAR.o&&Math.hypot(x-SCAR.o.x,z-SCAR.o.z)<SCAR.o.r*.42);}}));
 UND.push(gridSurface((u,v)=>{const x=lerp(LCX-LWX,XS,u),a=lz0(x),b=lz1(x);
   const z=lerp(a,b,v);return[x,LYC-lth(x,z),z];},NLU,NLV,{uS:(XS-LCX+LWX)/9,vS:DZ/9,
   hole:(u,v)=>{const x=lerp(LCX-LWX,XS,u),z=lerp(lz0(x),lz1(x),v);
    return lensHole(x,z);}}));
 // RIBS ON THE BELLY. The underside is the single largest surface anyone sees
 // from the gorge — 500 x 250 m of it, hanging over a 430 m drop — and as one
 // smooth dark shell it read as a painted ellipse. Fore-and-aft ribs give it a
 // grain and a direction, and they run the way the load does: back into the
 // rock the lens is keyed into.
 for(let i=0;i<30;i++){const x=lerp(LCX-LWX+16,XS-6,(i+.5)/30);
  const a=lz0(x),b=lz1(x);if(!(b>a+40))continue;
  for(let j=0;j<32;j++){const z=lerp(a+10,b-6,(j+.5)/32),t=lth(x,z);
   if(t<7)continue;
   kput(BXD,[x,LYC-t+1.1,z],null,[4.2,3.0,(b-a-16)/32*1.06],null);}}
 for(let j=0;j<9;j++){const z0f=(j+.5)/9;
  for(let i=0;i<86;i++){const x=lerp(LCX-LWX+16,XS-6,(i+.5)/86);
   const a=lz0(x),b=lz1(x);if(!(b>a+40))continue;
   const z=lerp(a+14,b-10,z0f),t=lth(x,z);
   if(t<9)continue;
   kput(BXD,[x,LYC-t+1.4,z],null,[(LWX+XS-LCX-22)/86*1.06,2.6,5.2],null);}}
 // THE BANDS. Horizontal planes through the lens, so each one lands exactly on
 // the joint plane whatever the PRNG does. Each plate is punched wherever the
 // lens is thinner than its own height, which is what makes the six plates a
 // nest of decreasing lenses rather than six identical shelves — and that nest,
 // seen in the cut, is the sheet's section.
 for(let k=0;k<=NBD;k++){const py=k===NBD?DECK:bandY(k);
  const need=Math.abs(py-LYC);
  const hl=(u,v)=>{const x=lerp(LCX-LWX,XS,u),z=lerp(lz0(x),lz1(x),v);
   if(lth(x,z)<need+1.2)return true;
   if(inWell(x,z,-2))return true;
   if(Math.abs(x-A2ST.x)<A2ST.w*.5&&Math.abs(z-A2ST.z)<A2ST.w*.5)return true;
   if(py>=NY-1&&inNotch(x,z))return true;
   if(dd&&SCAR.o&&Math.hypot(x-SCAR.o.x,z-SCAR.o.z)<SCAR.o.r*(.52-k*.06))return true;
   return dd&&fbm(u*7+k,v*5,7141+k,3)<.16;};
  const pl=dy=>gridSurface((u,v)=>{const x=lerp(LCX-LWX,XS,u);
    return[x,py+dy,lerp(lz0(x),lz1(x),v)];},92,40,{uS:60,vS:26,hole:hl});
  if(k===NBD)GRD.push(pl(0));else SH.push(pl(0));
  DK.push(pl(-1.4));}
 // the lens's cut face, and its reveals: the same rectangles that punch it
 LNS.push(gridSurface((u,v)=>{const a=lz0(XS),b=lz1(XS),z=lerp(a,b,u);
   return[XS,LYC+(v*2-1)*lth(XS,z),z];},72,34,{uS:24,vS:14,
   hole:(u,v)=>{const a=lz0(XS),b=lz1(XS),z=lerp(a,b,u);
    return inLCut(z,LYC+(v*2-1)*lth(XS,z));}}));
 LCUT.forEach(C=>{if(C[4])return;
  const z0=C[0]+2,z1=C[1]-2,y0=C[2]+2,y1=C[3]-2;
  for(const zz of [z0,z1])LNS.push(gridSurface((u,v)=>
   [XS-v*13,lerp(y0,y1,u),zz],6,3,{uS:5,vS:3}));
  for(const yy of [y0,y1])LNS.push(gridSurface((u,v)=>
   [XS-v*13,yy,lerp(z0,z1,u)],8,3,{uS:5,vS:3}));});
 // partitions and cells inside the bands, seen through the cut and the nose
 for(let k=0;k<NBD;k++){const y0=bandY(k),need=Math.abs(y0+BTH*.5-LYC);
  for(let i=0;i<34;i++){const x=rr(LCX-LWX+30,XS-8);
   const z=rr(lz0(x)+18,lz1(x)-14);
   if(lth(x,z)<need+6||inNotch(x,z)||inWell(x,z,6))continue;
   if(Math.abs(x-A2ST.x)<A2ST.w&&Math.abs(z-A2ST.z)<A2ST.w)continue;
   kput(BXD,[x,y0+BTH*.5,z],qEuler(0,rr(-.3,.3),0),[rr(14,44),BTH-3,1.1],null);
   if(rng()<.5)kput(BXD,[x,y0+BTH*.5,z],qEuler(0,Math.PI/2+rr(-.3,.3),0),[rr(12,38),BTH-3,1.1],null);}
  // a run of cells facing the cut, so a band laid open is inhabited
  for(let i=0;i<9;i++){const z=rr(lz0(XS)+20,lz1(XS)-18);
   if(lth(XS,z)<need+5)continue;
   kput('aiPane',[XS-.8,y0+BTH*.45,z],qFacing([1,0,0]),[5.4,3.4,1],
    rng()<(dd?.06:.55)?litOf(BAND[k].k):ROOMC);}
  REGISTER({name:'Arcoindian II — '+BAND[k].n.toLowerCase()+' (band '+(k+1)+')',
   x:LCX-20,z:-200,r:230,y:y0-1,h:BTH+2});}
 // THE NOSE. Each band's gallery stands where the lens has thinned to that
 // band's own half-height, so the five fronts stagger: the fat middle bands
 // reach nearly to the tip and the thin top and bottom ones sit well back. That
 // stagger is what makes the prow read as a section rather than as a shell.
 // Everything is hung ON the surface at the height lensFZ() solved for, not at
 // the band's own floor: a lens's bottom band is only reached at mid-depth, so a
 // slab laid at band 0's floor out at its front edge hangs ten metres below the
 // belly. That is exactly the class of placement error no invariant can see.
 const NSN=140;
 for(let k=0;k<NBD;k++){const ym=bandY(k)+BTH*.5,need=Math.max(9,Math.abs(ym-LYC));
  const up=ym<LYC?1:-1;                       // which way is INTO the lens here
  for(let i=0;i<NSN;i++){const x=lerp(LCX-LWX,XS,(i+.5)/NSN);
   const zf=lensFZ(x,need);if(zf==null)continue;
   if(inNotch(x,zf))continue;
   const nrm=[0,0,1],bw=(LWX+XS-LCX)/NSN*1.08;
   // the walkway ledge along the outline, and a dark reveal band behind it
   kput(BX,[x,ym,zf-1.2],null,[bw,1.3,7],stoneC());
   kput(BXD,[x,ym+up*3.6,zf-2.6],null,[bw,5.4,3],null);
   for(let s2=0;s2<2;s2++){const cy=ym+up*(2.4+s2*4.4);
    if(rng()>(dd?.6:.93))continue;
    kput('aiPane',[x,cy,zf-1.6],qFacing(nrm),[4.4,2.8,1],
     rng()<(dd?.05:.36)?litOf(BAND[k].k):ROOMC);}
   if(rng()<(dd?.05:.13))kput('aiBalc',[x,ym+.4,zf+.6],qFacing(nrm),[5.2,2.2,4.0],stoneC());
   if(i%11===4&&!(dd&&rng()<.4))kput('aiPost',[x,ym+.9,zf+1.6],null,[1.7,up>0?7:2.6,1.7],stoneC());
   if(!dd&&i%17===6)kput('strip',[x,ym+1.9,zf+1.9],qFacing(nrm),[24,1.3,1.3],ZLIT[BAND[k].k]||CYAN);}}
 // THE SUN COURT: floor, back wall, cheeks, and a flight of steps down the
 // middle of it. Open over the nose, facing due south, catching the winter sun
 // the mouth is oriented for.
 {const ncOK=(x,z)=>lth(x,z)>LYC-NY+2;               // the floor needs belly under it
  GRD.push(gridSurface((u,v)=>{const x=lerp(NX0,NX1,u);
   return[x,NY,lerp(nzB(x),lz1(x)-4,v)];},40,26,{uS:20,vS:16,
   hole:(u,v)=>!ncOK(lerp(NX0,NX1,u),lerp(nzB(lerp(NX0,NX1,u)),lz1(lerp(NX0,NX1,u))-4,v))}));
  // THE BACK WALL OF THE COURT is the coronal section face: 62 m of lens fabric
  // standing due south, punched band by band with the same reveal treatment the
  // joint plane gets, so the three bands it crosses read as storeys and not as
  // holes in a retaining wall.
  const NCO=[];
  for(let k=0;k<NBD;k++){const y0=bandY(k)+3.5,y1=bandY(k)+BTH-3.5;
   if(y1<NY+3||y0>DECK-3)continue;
   for(let i=0;i<4;i++)NCO.push([lerp(NX0+16,NX1-16,i/4)+4,lerp(NX0+16,NX1-16,(i+1)/4)-4,
     Math.max(y0,NY+3),Math.min(y1,DECK-3),k]);}
  SH.push(gridSurface((u,v)=>{const x=lerp(NX0,NX1,u);
   return[x,lerp(NY,DECK,v),nzB(x)];},44,14,{uS:20,vS:8,
   hole:(u,v)=>{const x=lerp(NX0,NX1,u),y=lerp(NY,DECK,v);
    return NCO.some(C=>x>C[0]&&x<C[1]&&y>C[2]&&y<C[3]);}}));
  NCO.forEach(C=>{const z0=nzB(LCX);
   for(const xx of [C[0],C[1]])SH.push(gridSurface((u,v)=>
    [xx,lerp(C[2],C[3],u),z0-v*13],6,3,{uS:5,vS:3}));
   for(const yy of [C[2],C[3]])SH.push(gridSurface((u,v)=>
    [lerp(C[0],C[1],u),yy,z0-v*13],8,3,{uS:5,vS:3}));
   DK.push(gridSurface((u,v)=>[lerp(C[0],C[1],u),C[2]-1.3,z0-v*13],8,3,{uS:5,vS:3}));
   for(let i=0;i<4;i++){const px=lerp(C[0]+2,C[1]-2,(i+.5)/4);
    kput('aiPane',[px,C[2]+4.4,z0-1.4],qFacing([0,0,1]),[5.0,3.2,1],
     rng()<(dd?.06:.55)?litOf(BAND[C[4]].k):ROOMC);}});
  for(const sx2 of [NX0,NX1])SH.push(gridSurface((u,v)=>
   [sx2,lerp(NY,DECK,v),lerp(nzB(sx2),lz1(sx2)-4,u)],26,10,{uS:14,vS:7,
   hole:(u,v)=>!ncOK(sx2,lerp(nzB(sx2),lz1(sx2)-4,u))}));
  // the flight down into the court off the top deck
  for(let s2=0;s2<9;s2++){const sy=NY+s2*(DECK-NY)/9;
   const sz=nzB(LCX)+3-s2*3.2;
   GRD.push(gridSurface((u,v)=>[lerp(NX0+10,NX1-10,u),sy,lerp(sz,sz-3.2,v)],18,1,{uS:12,vS:1}));
   SH.push(gridSurface((u,v)=>[lerp(NX0+10,NX1-10,u),lerp(sy,sy-(DECK-NY)/9,v),sz-3.2],18,1,{uS:12,vS:1}));}
  if(!dd)for(let i=0;i<20;i++){const x=rr(NX0+12,NX1-12),z=rr(nzB(x)+18,lz1(x)-24);
   if(!ncOK(x,z))continue;
   kput('figB',[x,NY,z],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
   kput('figH',[x,NY,z],null,1,new THREE.Color(0xc9a17e));}
  for(let i=0;i<30;i++){const x=rr(NX0+10,NX1-10),z=rr(nzB(x)+14,lz1(x)-22);
   if(!ncOK(x,z))continue;
   if(rng()<.6)VEG.tree(x,NY,z,i%3,rr(6,dd?15:10));
   else kput('hedge',[x,NY+.9,z],qEuler(0,rng()*TAU,0),[rr(4,11),1.8,rr(2,4)],
    new THREE.Color().setHSL(rr(.22,.34),rr(.3,.5),dd?rr(.08,.16):rr(.13,.24)));}
  REGISTER({name:'Arcoindian II — the sun court',x:LCX,z:nzB(LCX)+56,r:104,y:NY-6,h:78});}

 // ---- THE ROSETTES on the top deck -----------------------------------------
 // The plan the sheet draws: concentric semicircular rosettes set against the
 // back wall. They are half-round because the wall halves them, not because the
 // building is half of one.
 const ROS=[{x:LCX-168,r:80,k:'res',n:'Residential'},{x:LCX+104,r:68,k:'lw',n:'Living'}];
 ROS.forEach((P,pi)=>{const cz=ZB(P.x)+18;
  REGISTER({name:'Arcoindian II — '+P.n.toLowerCase()+' rosette',x:P.x,z:cz+P.r*.4,r:P.r+10,y:DECK-4,h:46});
  for(let ring=0;ring<3;ring++){const rr2=P.r*(.42+ring*.29);
   const nb=Math.max(8,Math.round(Math.PI*rr2/13));
   for(let i=0;i<nb;i++){const th=(i+.5)/nb*Math.PI;          // a half rosette: 0..PI
    const bx=P.x+Math.cos(th)*rr2,bz=cz+Math.sin(th)*rr2;
    if(lth(bx,bz)<LTH*.55)continue;
    if(dd&&rng()<.3)continue;
    const bh=8+ring*3.4;
    kput(BX,[bx,DECK+bh*.5,bz],qEuler(0,-th+Math.PI/2,0),[Math.PI*rr2/nb*.92,bh,10+ring*2],stoneC());
    for(let s2=0;s2<2;s2++)if(rng()<(dd?.5:.9))
     kput('aiPane',[bx+Math.cos(th)*5.6,DECK+3.2+s2*4.2,bz+Math.sin(th)*5.6],
      qFacing([Math.cos(th),0,Math.sin(th)]),[3.6,2.6,1],
      rng()<(dd?.05:.42)?litOf(P.k):ROOMC);
    if(rng()<(dd?.05:.14))kput('aiBalc',[bx+Math.cos(th)*5.2,DECK+2.2,bz+Math.sin(th)*5.2],
     qFacing([Math.cos(th),0,Math.sin(th)]),[4.6,2.2,3.0],stoneC());}
   if(!dd&&ring===2)lring(P.x,DECK+13,cz,rr2,Math.max(8,Math.round(Math.PI*rr2/12)));}
  // the court at the middle of the rosette
  GRD.push(gridSurface((u,v)=>{const th=u*Math.PI,r2=P.r*.40*(1-v);
    return[P.x+Math.cos(th)*r2,DECK+.3,cz+Math.sin(th)*r2];},22,4,{uS:12,vS:4}));
  for(let i=0;i<12;i++){const th=rng()*Math.PI,r2=rr(6,P.r*.36);
   const tx=P.x+Math.cos(th)*r2,tz=cz+Math.sin(th)*r2;
   if(lth(tx,tz)<LTH*.5)continue;
   VEG.tree(tx,DECK,tz,i%3,rr(5,dd?13:9));}});
 // THE CITY CENTER: a larger half-round amphitheatre against the back wall
 {const CCX=LCX-34,CCZ=ZB(CCX)+6,CCR=118;
  for(let s2=0;s2<7;s2++){const r2=CCR*(1-s2*.12),yy=DECK-s2*3.1;
   GRD.push(gridSurface((u,v)=>{const th=u*Math.PI,r3=lerp(r2,r2-CCR*.12,v);
     return[CCX+Math.cos(th)*r3,yy,CCZ+Math.sin(th)*r3];},40,1,{uS:24,vS:1,
     hole:(u,v)=>{const th=u*Math.PI,r3=lerp(r2,r2-CCR*.12,v);
      return lth(CCX+Math.cos(th)*r3,CCZ+Math.sin(th)*r3)<LTH*.45;}}));
   SH.push(gridSurface((u,v)=>{const th=u*Math.PI,r3=r2-CCR*.12;
     return[CCX+Math.cos(th)*r3,lerp(yy,yy-3.1,v),CCZ+Math.sin(th)*r3];},40,1,{uS:24,vS:1,
     hole:(u,v)=>{const th=u*Math.PI,r3=r2-CCR*.12;
      return lth(CCX+Math.cos(th)*r3,CCZ+Math.sin(th)*r3)<LTH*.45;}}));}
  const nc=Math.round(Math.PI*CCR/11);
  for(let i=0;i<nc;i++){const th=(i+.5)/nc*Math.PI;
   const px=CCX+Math.cos(th)*(CCR+7),pz=CCZ+Math.sin(th)*(CCR+7);
   if(lth(px,pz)<LTH*.42)continue;
   if(dd&&rng()<.34)continue;
   kput('aiPost',[px,DECK,pz],null,[2.3,15.2,2.3],null);
   kput(BX,[px,DECK+15.9,pz],qEuler(0,-th+Math.PI/2,0),[Math.PI*CCR/nc*1.06,1.4,4.2],null);}
  if(!dd){lring(CCX,DECK-19,CCZ,CCR*.30,18);
   for(let i=0;i<20;i++){const th=rng()*Math.PI,r2=rr(10,CCR*.8);
    const px=CCX+Math.cos(th)*r2,pz=CCZ+Math.sin(th)*r2;
    if(lth(px,pz)<LTH*.5)continue;
    const yy=DECK-Math.min(6,Math.floor((1-r2/CCR)/.12))*3.1;
    kput('figB',[px,yy,pz],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
    kput('figH',[px,yy,pz],null,1,new THREE.Color(0xc9a17e));}}
  REGISTER({name:'Arcoindian II — the city centre amphitheatre',x:CCX,z:CCZ+CCR*.4,r:CCR+12,y:DECK-26,h:56});}
 // THE CULTURAL CENTER along the front lip: a colonnaded gallery following the
 // lens's own outline, which is where the plan puts it.
 {let n2=0;
  for(let i=0;i<120;i++){const x=lerp(LCX-LWX+30,XS-6,(i+.5)/120);
   const z=lz1(x)-30;if(lth(x,z)<LTH*.34)continue;
   if(inNotch(x,z))continue;
   n2++;
   if(dd&&rng()<.3)continue;
   kput('aiPost',[x,DECK,z],null,[2.1,13.4,2.1],null);
   kput(BX,[x,DECK+14.1,z],null,[(2*LWX)/120*1.1,1.5,16],null);
   if(rng()<.4)kput(BX,[x,DECK+3.6,z-9],null,[(2*LWX)/120*1.05,7.2,9],stoneC());
   if(!dd&&i%9===3)kput('strip',[x,DECK+13,z+7],qFacing([0,0,1]),[22,1.3,1.3],CYAN);}
  if(n2)REGISTER({name:'Arcoindian II — the cultural centre',x:LCX-10,z:lz1(LCX)-30,r:250,y:DECK-4,h:34});}
 // dwellings and planting spread over the rest of the deck
 for(let i=0;i<(dd?150:210);i++){const x=rr(LCX-LWX+30,XS-8);
  const z=rr(lz0(x)+24,lz1(x)-34);
  if(lth(x,z)<LTH*.5||inNotch(x,z)||inWell(x,z,8))continue;
  if(ROS.some(P=>Math.hypot(x-P.x,z-(ZB(P.x)+18))<P.r+8))continue;
  if(Math.hypot(x-(LCX-34),z-(ZB(LCX-34)+6))<130)continue;
  const roll=rng();
  if(roll<.34){const bh=rr(6,13);
   kput(BX,[x,DECK+bh*.5,z],qEuler(0,rng()*TAU,0),[rr(6,14),bh,rr(5,10)],stoneC());
   for(let s2=0;s2<2;s2++)if(rng()<(dd?.4:.85))
    kput('aiPane',[x,DECK+2.8+s2*4,z+4.6],qFacing([0,0,1]),[3.2,2.4,1],
     rng()<(dd?.05:.4)?litOf('lw'):ROOMC);}
  else if(roll<.74)VEG.tree(x,DECK,z,i%3,rr(5,dd?15:10));
  else kput('hedge',[x,DECK+.9,z],qEuler(0,rng()*TAU,0),[rr(4,10),1.8,rr(1.6,3.4)],
   new THREE.Color().setHSL(rr(.22,.34),rr(.3,.5),dd?rr(.08,.16):rr(.13,.24)));}

 // ---- THE ACCESS SHAFT -----------------------------------------------------
 // Built as its x < XS half so the joint plane lays it open over its full
 // 340 m, from the shelf to the plateau, through every band on the way.
 {const S2=A2ST,H2=S2.y1-S2.y0;
  RM.push(gridSurface((u,v)=>[S2.x-u*S2.w,lerp(S2.y0,S2.y1,v),S2.z-S2.w*.5],4,26,{uS:4,vS:20}));
  RM.push(gridSurface((u,v)=>[S2.x-u*S2.w,lerp(S2.y0,S2.y1,v),S2.z+S2.w*.5],4,26,{uS:4,vS:20}));
  RM.push(gridSurface((u,v)=>[S2.x-S2.w,lerp(S2.y0,S2.y1,v),S2.z+(u-.5)*S2.w],4,26,{uS:4,vS:20}));
  for(let i=0;i*4.8<H2-5;i++){const fy=S2.y0+i*4.8,dir=(i%2)?1:-1;
   if(dd&&rng()<.16)continue;
   kput('aiStair',[S2.x-S2.w*.5,fy,S2.z-dir*S2.w*.34],qFacing([0,0,dir]),[S2.w*.72,4.8,S2.w*.62],
    new THREE.Color(dd?0x6b6459:0xb7b0a2));
   if(i%2===0)kput(BX,[S2.x-S2.w*.5,fy-.7,S2.z],null,[S2.w*.86,1.4,S2.w*.9],
    new THREE.Color(dd?0x6b6459:0xb7b0a2));
   if(!dd&&i%4===0)kput('strip',[S2.x-2,fy+3.8,S2.z],qEuler(0,Math.PI/2,0),[S2.w*.8,1.2,1.2],CYAN);}
  REGISTER({name:'Arcoindian II — the access shaft',x:S2.x-S2.w*.5,z:S2.z,r:S2.w,y:S2.y0-2,h:H2+4});}

 // ---- the light wells ------------------------------------------------------
 WELL.forEach(W=>{const y1=wellY1(W),H=y1-W.y0;
  if(!(H>10))return;
  if(W.half)RM.push(gridSurface((u,v)=>{const th=Math.PI*.5+u*Math.PI;
    return[W.x+Math.cos(th)*W.r,W.y0+v*H,W.z+Math.sin(th)*W.r];},12,20,{uS:6,vS:18}));
  else{
   // THE BORE IS BLACK for its first 55 m. MAT.aiRoom is a mid-brown and the
   // hemisphere light does not care that it is inside 90 m of rock — it lights
   // every surface from every direction — so the first cut's lining rendered as
   // a PALE curved patch seen through the hole in the vault, i.e. three saucers
   // stuck to the ceiling, which is the exact failure Arcoindian I logged four
   // attempts against. Removing the rim did not fix it because the rim was never
   // what you were looking at. A void-black lining is.
   DK.push(lathe({rFn:()=>W.r,H:Math.min(55,H),nu:16,nv:5}).translate(W.x,W.y0,W.z));
   if(H>55)RM.push(lathe({rFn:()=>W.r,H:H-55,nu:16,nv:12}).translate(W.x,W.y0+55,W.z));
   ROCK.push(lathe({rFn:y2=>W.r*(1.30-.10*y2/9),H:9,nu:18,nv:3}).translate(W.x,y1-2,W.z));
   RM.push(lathe({rFn:()=>W.r*1.02,H:11,nu:16,nv:2}).translate(W.x,y1-2,W.z));
   const nr=Math.max(3,Math.round(W.r/3.6));
   for(let i=0;i<nr;i++){const t=(i+.5)/nr-.5;
    if(dd&&rng()<.4)continue;
    beam(BX,[W.x+t*W.r*2,y1+6,W.z-W.r*Math.sqrt(Math.max(0,1-4*t*t))],
         [W.x+t*W.r*2,y1+6,W.z+W.r*Math.sqrt(Math.max(0,1-4*t*t))],1.6,1.6);}
   // NO RIM UNDER THE VAULT. Arcoindian I logged four attempts at one — flared
   // bell, small flare, flush lip, dark lip — and every one read as a saucer
   // stuck to the ceiling, because an unshadowed sun plus the hemisphere's warm
   // ground colour lights anything hanging under a roof. The first cut of this
   // type repeated the mistake and the renders showed the same three flying
   // saucers. There is now nothing below the roof plane at all: the shell's own
   // hole, the dark lining starting 1 m above it, and a bright disc set high in
   // the bore so the hole has something to show when you look up it.
   if(!W.gal)kput('aiPool',[W.x,W.y0+H*.84,W.z],null,[W.r*1.8,1,W.r*1.8],
     new THREE.Color(dd?0x8e887a:0xcfc8b6));}
  // the pool of daylight where the shaft lands
  const py2=W.gal?GAL[2].y0+.5:DECK+.6;
  kput('aiPool',[W.x,py2,W.z],null,[W.r*4.4,1,W.r*4.4],
   new THREE.Color(dd?0x5f5b50:0x9c9686));
  if(!dd)for(let i=0;i<8;i++){const th=i/8*TAU;
   kput('strip',[W.x+Math.cos(th)*W.r*.96,W.y0+H*.5+rr(-H*.3,H*.3),W.z+Math.sin(th)*W.r*.96],
    qEuler(0,-th-Math.PI/2,0),[W.r*.5,1.1,1.1],CYAN.clone().multiplyScalar(.6));}});
 // registered on a FULL well, never on one of the half ones sitting on the joint
 // plane: a half well's only content is a lining inside one merged mesh, which
 // is the closest thing in this kit to a false negative on the occupancy check.
 {const W0=WELL.filter(w=>!w.half)[0];
  if(W0)REGISTER({name:'Arcoindian II — the light wells',x:W0.x,z:W0.z,
   r:W0.r+22,y:W0.y0-6,h:wellY1(W0)-W0.y0+14});}

 // ---- THE STALK: LEARNING, the water shafts and the marina -----------------
 // The lens hangs on this. It drops out of the belly, through nothing, for
 // 260 m, and three slimmer shafts carry on from its foot another 170 m to the
 // water. Nothing supports it from below; it is braced back to the cliff twice,
 // which is the only thing in the composition that touches the rock below the
 // sill.
 {const LH=STY1-STY0;
  const lrFn=y2=>STR*(1.20-.34*Math.pow(y2/LH,.8));
  SH.push(lathe({rFn:lrFn,H:LH,flutes:12,amp:.055,sharp:2,nu:44,nv:26,
   hole:holeFn(dd*.45,7143,null,1.1)}).translate(STX,STY0,STZ));
  DK.push(lathe({rFn:y2=>lrFn(y2)-4.5,H:LH-2,nu:22,nv:10}).translate(STX,STY0,STZ));
  for(let p=1;p*8.4<LH-4;p++)
   kput('slabCR',[STX,STY0+p*8.4,STZ],null,[lrFn(p*8.4)-5,.7,lrFn(p*8.4)-5],new THREE.Color(0x24262a));
  const nrw=Math.floor((LH-10)/8.4);
  for(let j=0;j<nrw;j++){const cy=STY0+6+j*8.4,rr2=lrFn(cy-STY0);
   const nc=Math.round(TAU*rr2/6.2);
   for(let i=0;i<nc;i++){const th=(i+(j%2?.3:.7))/nc*TAU;
    if(rng()>(dd?.6:.9))continue;
    kput('aiPane',[STX+Math.cos(th)*rr2*1.02,cy,STZ+Math.sin(th)*rr2*1.02],
     qFacing([Math.cos(th),0,Math.sin(th)]),[3.8,3.0,1],
     rng()<(dd?.05:.42)?litOf('lrn'):ROOMC);}
   if(!dd&&j%4===1)lring(STX,cy+4,STZ,rr2*1.03,Math.round(TAU*rr2/9));}
  // THE LANDING at shelf level. The first cut was an annulus round the shaft,
  // which floats: the shelf's front edge follows the weathered face and wanders
  // 60 m in z, so a ring of fixed radius is sometimes joined to it and sometimes
  // not. This is a rectangle that starts 26 m BEHIND the furthest-back the shelf
  // edge can be across the landing's own width, so it is always attached.
  const LDW=STR+30,LDZ0=Math.min(shelfE(STX-LDW),shelfE(STX),shelfE(STX+LDW))-26;
  const LDZ1=STZ+STR+24;
  GRD.push(gridSurface((u,v)=>[STX+(u-.5)*LDW*2,SILL+.3,lerp(LDZ0,LDZ1,v)],20,12,{uS:18,vS:12,
   hole:(u,v)=>Math.hypot((u-.5)*LDW*2,lerp(LDZ0,LDZ1,v)-STZ)<STR+1}));
  SH.push(gridSurface((u,v)=>[STX+(u-.5)*LDW*2,SILL+.3-v*8,LDZ1],20,2,{uS:18,vS:2}));
  for(const s4 of [-1,1])SH.push(gridSurface((u,v)=>
   [STX+s4*LDW,SILL+.3-v*8,lerp(LDZ0,LDZ1,u)],12,2,{uS:12,vS:2}));
  for(let i=0;i<22;i++){const t=(i+.5)/22;
   if(dd&&rng()<.3)continue;
   kput(BX,[STX-LDW+t*LDW*2,SILL+1.8,LDZ1-1],null,[LDW*2/22*.92,3,1.6],stoneC());}
  if(!dd)lring(STX,SILL+3.6,STZ,STR+16,24);
  // braces back to the cliff
  for(const by of [STY0+LH*.30,STY0+LH*.70]){
   const zb2=faceZ(STX,by)+4;
   if(zb2<STZ-STR-6){
    beam(BX,[STX-STR*.6,by,STZ],[STX-STR*.6,by+16,zb2],5,7);
    beam(BX,[STX+STR*.6,by,STZ],[STX+STR*.6,by+16,zb2],5,7);
    kput(BX,[STX,by+17,zb2-6],null,[STR*2.2,7,14],null);}}
  REGISTER({name:'Arcoindian II — the learning shaft',x:STX,z:STZ,r:STR+26,y:STY0-4,h:LH+14});
  // THE WATER SHAFTS. They end on the valley floor, which under the overhang is
  // 26 m up on the talus rather than at the water — asking flr() rather than
  // assuming WSY is the difference between three shafts standing on the ground
  // and three shafts buried 18 m in it.
  const lc=[];
  SUB.forEach((S,si)=>{const bx=STX+S[0],bz=STZ+S[1],br=9.5;
   const down=dd&&si===2;
   const y1s=down?rr(70,130):flr(bx,bz)+1;
   SH.push(lathe({rFn:y2=>br*(1.1-.16*y2/(STY0-y1s)),H:STY0-y1s,nu:18,nv:20,
    hole:holeFn(dd*(down?1.0:.4),7145+si,null,1.2)}).translate(bx,y1s,bz));
   for(let j=0;j<Math.floor((STY0-y1s)/9);j++){const cy=y1s+5+j*9;
    if(rng()>(dd?.45:.8))continue;
    kput('aiPane',[bx,cy,bz+br*1.05],qFacing([0,0,1]),[3.4,2.8,1],
     rng()<(dd?.04:.4)?litOf('lrn'):ROOMC);}
   if(!down)lc.push([bx,bz,br]);
   else for(let i=0;i<26;i++){const sc=rr(4,15);
    kput('rubble',[bx+rr(-70,70),sc*.4+WSY,bz+rr(-70,70)],qEuler(rng()*3,rng()*3,rng()*3),
     [sc*rr(.8,1.6),sc*rr(.5,1),sc*rr(.8,1.6)],new THREE.Color().setHSL(rr(.05,.10),rr(.12,.3),rr(.08,.18)));}
   // collars where the shafts leave the foot of LEARNING
   kput(BX,[bx,STY0+3,bz],null,[br*2.6,6,br*2.6],stoneC());});
  // THE PLAZA the shafts land on, up on the talus, and a causeway running south
  // from it down to the water.
  const PLY=flr(STX,STZ)+1.4;
  GRD.push(gridSurface((u,v)=>[STX+(u-.5)*220,PLY,STZ+(v-.5)*150],18,12,{uS:20,vS:14}));
  SH.push(gridSurface((u,v)=>[STX+(u-.5)*220,PLY-v*14,STZ+(v>.5?75:-75)],18,3,{uS:20,vS:3}));
  for(const s5 of [-1,1])SH.push(gridSurface((u,v)=>
   [STX+s5*110,PLY-v*14,STZ+(u-.5)*150],14,3,{uS:16,vS:3}));
  // THE MARINA, on the north bank of the channel. It is placed off rivC()/rivW()
  // rather than off a written z, because the channel wanders +/-96 m and a quay
  // at a fixed offset is a quay in a field half the time.
  const MX=STX,MB=rivC(MX)-rivW(MX),MQY=WSY+5.5;
  const MZ=MB-46;
  GRD.push(gridSurface((u,v)=>[MX+(u-.5)*300,MQY,MB-96+v*100],24,10,{uS:26,vS:12}));
  SH.push(gridSurface((u,v)=>[MX+(u-.5)*300,MQY-v*12,MB+4],24,3,{uS:26,vS:3}));
  // the causeway from the plaza down to the quay
  // A CONTINUOUS ramp. The first cut stepped it in four 24 m slabs over 15 m of
  // fall and came back as disconnected paving hanging in the air; the segments
  // are now 9 m, overlap by 12%, and each carries its own pier down to the
  // ground it crosses.
  {const c0=STZ+72,c1=MB-90,n5=Math.max(6,Math.round((c1-c0)/9));
   for(let i=0;i<n5;i++){const t=(i+.5)/n5,cz=lerp(c0,c1,t),cy=lerp(PLY,MQY,t);
    kput(BX,[STX,cy,cz],null,[38,3.4,(c1-c0)/n5*1.12],null);
    for(const s5 of [-1,1])kput(BX,[STX+s5*19,cy+2.4,cz],null,
     [2,2.8,(c1-c0)/n5*1.12],stoneC());
    const gy5=flr(STX,cz);
    if(cy-gy5>4&&i%2===0)kput('aiPost',[STX,gy5,cz],null,[3.2,cy-gy5,3.2],null);}}
  for(let i=0;i<7;i++){const jx=MX-132+i*44;
   if(dd&&rng()<.3)continue;
   kput(BX,[jx,MQY-1.2,MB+52],null,[7,1.8,104],new THREE.Color(dd?0x6b6459:0xb0a898));
   for(let j=0;j<6;j++){const hz=MB+16+j*16;
    if(rng()<(dd?.75:.3))continue;
    kput('a2Hull',[jx+(j%2?9:-9),WSY-1.4,hz],qEuler(0,(j%2?1:-1)*Math.PI/2,0),[7.5,5,17],
     new THREE.Color().setHSL(rr(.02,.14),rr(.1,.4),dd?rr(.12,.24):rr(.3,.55)));}}
  for(let i=0;i<8;i++){const sx2=MX-126+i*36,sh=rr(10,18);
   if(dd&&rng()<.34)continue;
   kput(BX,[sx2,MQY+sh*.5,MB-62],qEuler(0,rr(-.1,.1),0),[rr(17,30),sh,rr(15,24)],stoneC());
   if(!dd)kput('strip',[sx2,MQY+1+sh,MB-50],null,[18,1.4,1.4],CYAN);}
  // figures() plants at y = 0 and this quay is at y = 11.5, so they are placed
  // by hand rather than through the helper — the same trap Arcbeam shipped.
  for(let i=0;i<(dd?6:22);i++){const fx=MX+rr(-140,140),fz=MB-rr(6,88);
   kput('figB',[fx,MQY,fz],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
   kput('figH',[fx,MQY,fz],null,1,new THREE.Color(0xc9a17e));}
  REGISTER({name:'Arcoindian II — the marina',x:MX,z:MB-40,r:170,y:0,h:60});
  REGISTER({name:'Arcoindian II — the valley plaza',x:STX,z:STZ,r:120,y:PLY-16,h:40});
  if(lc.length)REGISTER({name:'Arcoindian II — the water shafts',x:STX,z:STZ,r:STR+50,y:PLY-4,h:STY0-PLY+10});}

 // ---- the gardens on the open shelf ----------------------------------------
 // The sheet fans them to one side; they go west of the lens, where the hollow
 // runs on for 300 m past the point the lens pinches out. In the deepest shade
 // in the model, which is where a garden under a rock roof belongs.
 // The fan is drawn against the back wall and opens toward the mouth, and every
 // bed is tested against the shelf it stands on rather than assumed onto it:
 // this end of the hollow is where the cave tapers out, so the depth between
 // the back wall and the cliff edge runs from 120 m down to nothing.
 {const GX0=XA+40,GX1=LCX-LWX+30,GAX=(GX0+GX1)*.5;
  const onShelf=(x,z)=>x>GX0&&x<GX1&&z>ZB(x)+10&&z<shelfE(x)-14;
  let ng=0;
  for(let i=0;i<(dd?230:190);i++){const px=rr(GX0,GX1),pz=rr(ZB(px)+10,shelfE(px)-14);
   if(!onShelf(px,pz))continue;
   ng++;
   if(rng()<.58)VEG.tree(px,SILL,pz,i%3,rr(6,dd?18:12));
   else kput('hedge',[px,SILL+.9,pz],qEuler(0,rng()*TAU,0),[rr(6,20),1.9,rr(2,5)],
    new THREE.Color().setHSL(rr(.22,.34),rr(.3,.5),dd?rr(.08,.16):rr(.13,.24)));}
  // the walks: a fan of paths radiating from one point on the back wall
  const FX=GX1+40,FZ=ZB(FX)+8;
  for(let i=0;i<13;i++){const th=Math.PI*(.56+i*.072);
   GRD.push(gridSurface((u,v)=>{const r2=lerp(30,430,u);
     return[FX+Math.cos(th)*r2,SILL+.3,FZ+Math.sin(th)*r2*.22+v*4];},20,1,{uS:20,vS:1,
     hole:(u,v)=>{const r2=lerp(30,430,u);
      return !onShelf(FX+Math.cos(th)*r2,FZ+Math.sin(th)*r2*.22);}}));}
  if(ng)REGISTER({name:'Arcoindian II — the gardens',x:GAX,z:ZB(GAX)+50,r:230,y:SILL-4,h:48});}

 // ---- the rim plateau ------------------------------------------------------
 // LIGHT WELLS, PLAYGROUNDS and a WATER RESERVOIR, as the sheet labels them,
 // plus the track that links them. A bare tabletop with five manholes in it
 // reads as a car park, and the plan is one of the views.
 // THE WATER RESERVOIR. The first cut had pow(1-v) where it wanted pow(v), so
 // the basin was built inside out — a 17 m CONE rising out of the plateau with a
 // sheet of water buried in it. Nothing in --assert can see an inverted basin;
 // the plateau shot showed a bare tabletop with a bump on it.
 {const RVY=platY(RVX,RVZ);
  const rvR=(th,v)=>RVR*(1-v)*rvLob(th);
  GRD.push(gridSurface((u,v)=>{const th=u*TAU;
    return[RVX+Math.cos(th)*rvR(th,v),RVY+1.5-RVD2*Math.pow(v,.55),RVZ+Math.sin(th)*rvR(th,v)*.72];},
    52,10,{uS:40,vS:8}));
  mesh(gridSurface((u,v)=>{const th=u*TAU,r2=rvR(th,v*.92);
    return[RVX+Math.cos(th)*r2,RVY-7,RVZ+Math.sin(th)*r2*.72];},40,3,{uS:24,vS:3}),
   MAT.a2Water,G);
  // a raised rim wall all round and a battered embankment outside it, so the
  // basin reads as an impoundment and not as a puddle in a dent
  for(let i=0;i<56;i++){const th=(i+.5)/56*TAU,rw=RVR*1.03*rvLob(th);
   if(dd&&rng()<.22)continue;
   kput(BX,[RVX+Math.cos(th)*rw,RVY+3.4,RVZ+Math.sin(th)*rw*.72],qEuler(0,-th,0),
    [TAU*RVR/56*.8,7,6],stoneC());}
  SH.push(gridSurface((u,v)=>{const th=u*TAU,rw=RVR*(1.04+v*.14)*rvLob(th);
    return[RVX+Math.cos(th)*rw,RVY+1.5-v*12,RVZ+Math.sin(th)*rw*.72];},52,3,{uS:40,vS:3}));
  // the intake tower standing in it, and its causeway out to the rim
  {const IY=RVY-28.5;
   SH.push(lathe({rFn:y2=>15-3*y2/44,H:44,flutes:10,amp:.06,sharp:2,nu:24,nv:12,
    hole:holeFn(dd*.5,7161,null,1.2)}).translate(RVX+30,IY,RVZ+16));
   kput('slabC',[RVX+30,IY+45,RVZ+16],null,[18,3,18],new THREE.Color(dd?0x6d665c:0xcac4b8));
   for(let j=0;j<5;j++)if(rng()>(dd?.5:.15))
    kput('aiPane',[RVX+30,IY+10+j*7,RVZ+16+13.6],qFacing([0,0,1]),[4,3,1],
     rng()<(dd?.05:.5)?litOf('pub'):ROOMC);
   const c0=RVZ+16+14,c1=RVZ+RVR*.72+8,n6=Math.max(3,Math.round((c1-c0)/18));
   for(let i=0;i<n6;i++){const t=(i+.5)/n6;
    if(dd&&rng()<.25)continue;
    kput(BX,[RVX+30,RVY+1,lerp(c0,c1,t)],null,[11,2.4,(c1-c0)/n6*1.05],null);
    kput('aiPost',[RVX+30,RVY-26,lerp(c0,c1,t)],null,[2.2,27,2.2],null);}
   if(!dd)lring(RVX+30,IY+46.5,RVZ+16,14,14);}
  REGISTER({name:'Arcoindian II — the water reservoir',x:RVX,z:RVZ,r:RVR+16,y:RVY-34,h:56});
  [[LCX+40,-700],[LCX-460,-520]].forEach((P,pi)=>{const px=P[0],pz=P[1],py=platY(px,pz),cr=28;
   GRD.push(gridSurface((u,v)=>{const a=u*TAU,r2=cr*(1-v);
     return[px+Math.cos(a)*r2,py-4.6,pz+Math.sin(a)*r2];},24,4,{uS:12,vS:4}));
   SH.push(gridSurface((u,v)=>{const a=u*TAU;
     return[px+Math.cos(a)*cr,py-4.6*v,pz+Math.sin(a)*cr];},24,2,{uS:12,vS:2}));
   for(let i=0;i<14;i++){const a=i/14*TAU;
    if(dd&&rng()<.4)continue;
    kput(BX,[px+Math.cos(a)*(cr+2.4),py+.8,pz+Math.sin(a)*(cr+2.4)],qEuler(0,-a,0),[7,1.8,1.5],stoneC());}
   if(!dd)lring(px,py-3.8,pz,cr*.6,12);
   REGISTER({name:'Arcoindian II — playground '+(pi+1),x:px,z:pz,r:cr+8,y:py-8,h:16});});
  // the track linking the collars
  const WC=WELL.filter(w=>!w.half).sort((a,b)=>a.x-b.x);
  for(let i=1;i<WC.length;i++){const A2=WC[i-1],B2=WC[i];
   const n2=Math.max(2,Math.round(Math.hypot(B2.x-A2.x,B2.z-A2.z)/28));
   for(let j=0;j<n2;j++){const t=(j+.5)/n2;
    const tx=lerp(A2.x,B2.x,t)+rr(-5,5),tz=lerp(A2.z,B2.z,t)+rr(-5,5);
    const ang=Math.atan2(B2.z-A2.z,B2.x-A2.x);
    kput(BX,[tx,platY(tx,tz)-.6,tz],qEuler(0,-ang,0),[32,.8,14],
     new THREE.Color().setHSL(rr(.06,.10),rr(.10,.20),rr(.10,.17)));}}
  // SPOIL from the wells and the galleries, banked beside the collars, and a
  // wind-break wall along the haul track. The first plateau shot was 1 900 x
  // 1 100 m of empty tabletop with five manholes in it.
  WELL.filter(w=>!w.half).forEach(W=>{
   for(let i=0;i<26;i++){const a3=rng()*TAU,r4=W.r*rr(1.6,4.2),sc=rr(4,15);
    kput('rubble',[W.x+Math.cos(a3)*r4,platY(W.x,W.z)-1+sc*.36,W.z+Math.sin(a3)*r4],
     qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.8,1.7),sc*rr(.4,.9),sc*rr(.8,1.7)],
     new THREE.Color().setHSL(rr(.05,.10),rr(.14,.32),rr(.10,.22)));}
   for(let i=0;i<9;i++){const a3=(i+.5)/9*TAU,r4=W.r*2.4;
    if(dd&&rng()<.35)continue;
    kput(BX,[W.x+Math.cos(a3)*r4,platY(W.x,W.z)+2.4,W.z+Math.sin(a3)*r4],qEuler(0,-a3,0),
     [TAU*r4/9*.8,5,2.2],stoneC());}
   kput(BX,[W.x+W.r*3.0,platY(W.x,W.z)+6,W.z],null,[18,12,26],stoneC());});
  for(let i=0;i<(dd?150:110);i++){const px=rr(XW+420,XS-20),pz=rr(-1140,-160);
   const py=platY(px,pz);
   if(py<40||inWell(px,pz,28))continue;
   if(Math.hypot(px-RVX,(pz-RVZ)/.7)<RVR+16)continue;
   kput('hedge',[px,py+.5,pz],qEuler(0,rng()*TAU,0),[rr(2,5),rr(.8,1.5),rr(1.4,3)],
    new THREE.Color().setHSL(rr(.14,.26),rr(.18,.34),dd?rr(.06,.12):rr(.07,.14)));}}

 // ---- the gorge, the water and the far wall ---------------------------------
 {ROCK.push(gridSurface((u,v)=>{const x=lerp(XW,XS+980,u),z=lerp(-200,GFZ,v);
    return[x,flr(x,z),z];},104,40,{uS:(XS+980-XW)/16,vS:36}));
  mesh(gridSurface((u,v)=>[lerp(XW+40,XS+940,u),WSY,lerp(-130,GFZ-170,v)],28,16,{uS:30,vS:18}),
   MAT.a2Water,G);
  // the far wall of the canyon
  ROCK.push(gridSurface((u,v)=>{const x=lerp(XW,XS+980,u),y=v*760;
    return[x,y,GFZ+52+40*Math.pow(clamp(1-y/200,0,1),1.6)
      -0.14*y-24*fbm(x*.0085,y*.010,7148,4)-11*fbm(x*.028,y*.02,7149,3)];},
    88,30,{uS:(XS+980-XW)/40,vS:760/40}));
  for(let i=0;i<120;i++){const x=rr(XW+60,XS+940),t=Math.pow(rng(),1.8);
   const sc=rr(5,24)*(1-t*.4);
   kput('rubble',[x,flr(x,GFZ-60-t*180)+sc*.35,GFZ-60-t*180],qEuler(rng()*3,rng()*3,rng()*3),
    [sc*rr(.7,1.5),sc*rr(.5,1),sc*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.10),rr(.12,.3),rr(.12,.26)));}
  // parks on the banks: what the shafts drop down to
  for(let i=0;i<(dd?120:100);i++){const x=rr(STX-330,STX+330),z=rr(GFZ-330,GFZ-120);
   VEG.tree(x,flr(x,z),z,i%3,rr(7,dd?18:13));}
  for(let i=0;i<70;i++){const x=rr(STX-300,STX+300),z=rr(-140,-40);
   VEG.tree(x,flr(x,z),z,i%3,rr(6,dd?16:11));}}

 // ---- TRANSPORTATION: the bridge out of the mouth ---------------------------
 {const BZ0=shelfE(LCX-210)-6,BZ1=GFZ+30,BX2=LCX-210,BY=SILL+2;
  // PIERS. The first cut made them r=16 tapering to 10 over 342 m of height,
  // which is a 1:17 slenderness — from the gorge they came back as pencils
  // holding up a ribbon. They are now 34 m across at the foot on a splayed
  // base, paired in the transverse direction with a cross-head, which is what
  // a 924 m viaduct on 340 m legs actually needs.
  const npi=3;
  for(let i=0;i<npi;i++){const t=(i+1)/(npi+1),pz=lerp(BZ0,BZ1,t);
   const gy=flr(BX2,pz),ph=BY-gy;
   if(dd&&i===2)continue;
   for(const s6 of [-1,1]){
    SH.push(gridSurface((u,v)=>{const a=u*TAU;
      const r2=(17-5*Math.pow(v,.7))*(1+.10*Math.cos(a*4))+13*Math.pow(clamp(1-v/.14,0,1),1.7);
      return[BX2+s6*15+Math.cos(a)*r2,gy+v*ph,pz+Math.sin(a)*r2];},22,26,{uS:14,vS:24,
      hole:holeFn(dd*.4,7151+i,null,1.2)}));}
   for(let b=1;b<5;b++)beam(BX,[BX2-15,gy+ph*b/5,pz],[BX2+15,gy+ph*b/5,pz],6,7,stoneC());
   kput(BX,[BX2,BY-4.5,pz],null,[74,7,34],null);}
  // DECK. A 34 x 3 m slab is a ribbon at this span; it now has a 7 m edge beam
  // each side and a rib under every bay, so it reads as a structure in profile.
  const nd=Math.round((BZ1-BZ0)/26),dw=(BZ1-BZ0)/nd*1.04;
  for(let i=0;i<nd;i++){const t=(i+.5)/nd,pz=lerp(BZ0,BZ1,t);
   if(dd&&t>.62&&t<.86)continue;
   kput(BX,[BX2,BY,pz],null,[36,3,dw]);
   for(const s2 of [-1,1]){kput(BX,[BX2+s2*17.5,BY-2.6,pz],null,[4,7,dw],null);
    kput(BX,[BX2+s2*18,BY+3.2,pz],null,[2,3.2,dw],stoneC());}
   if(i%2===0)kput(BX,[BX2,BY-5.6,pz],null,[32,4,3.4],null);
   if(!dd&&i%4===1)kput('strip',[BX2,BY+4.2,pz],qFacing([0,0,1]),[22,1.4,1.4],CYAN);
   }
  // the span that came down, lying on the gorge floor under the gap
  if(dd)for(let i=0;i<22;i++){const pz=lerp(BZ0,BZ1,rr(.60,.88)),sc=rr(6,20);
   kput(BX,[BX2+rr(-50,50),flr(BX2,pz)+sc*.4,pz+rr(-40,40)],qEuler(rr(-.6,.6),rng()*TAU,rr(-.6,.6)),
    [sc*rr(1,2.8),sc*.6,sc*rr(1,2.2)],null);}
  // the portal where it enters the far wall
  kput('aiPortal',[BX2,BY,BZ1-6],qFacing([0,0,-1]),[5,4.6,1],null);
  kput(BX,[BX2,BY+26,BZ1+4],null,[86,54,22],null);
  REGISTER({name:'Arcoindian II — transportation, the bridge',x:BX2,z:(BZ0+BZ1)*.5,r:180,y:0,h:SILL+20});}

 // ---- the ruin -------------------------------------------------------------
 if(SCAR.o){const I=SCAR.o;
  REGISTER({name:'Arcoindian II — the roof fall',x:I.x,z:I.z,r:I.r+40,y:SILL-10,h:CROWN-SILL+60});
  const dkC=()=>new THREE.Color().setHSL(rr(.05,.10),rr(.14,.32),rr(.05,.13));
  const restY=(bx,bz)=>{const t=lth(bx,bz);return t>4?LYC+t:SILL;};
  for(let i=0;i<120;i++){const t=Math.pow(rng(),1.5),a=rng()*TAU;
   const r=I.r*(.16+t*1.35),sc=rr(4,17)*(1-t*.42);
   const bx=I.x+Math.cos(a)*r,bz=I.z+Math.sin(a)*r;
   if(bx>XS)continue;
   kput('rubble',[bx,restY(bx,bz)+sc*.42+(1-t)*(1-t)*14,bz],qEuler(rng()*3,rng()*3,rng()*3),
    [sc*rr(.7,1.6),sc*rr(.4,.8),sc*rr(.7,1.6)],dkC());}
  for(let i=0;i<20;i++){const t=Math.pow(rng(),1.3),a=rng()*TAU;
   const r=I.r*(.1+t*1.2),bx=I.x+Math.cos(a)*r,bz=I.z+Math.sin(a)*r;
   if(bx>XS)continue;
   const L2=rr(18,44)*(1-t*.4);
   kput(BX,[bx,restY(bx,bz)+rr(2,12)*(1-t),bz],
    qEuler(rr(-.9,.9),rng()*TAU,rr(-.9,.9)),[L2,rr(4,11),L2*rr(.5,1.1)],dkC());}
  for(let i=0;i<80;i++){const t=Math.pow(rng(),1.6),sc=rr(4,20)*(1-t*.5);
   kput('rubble',[I.x+rr(-220,180),sc*.4+(1-t)*14+WSY,rr(-60,180)],
    qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.7,1.5),sc*rr(.5,1),sc*rr(.7,1.5)],
    new THREE.Color().setHSL(rr(.05,.10),rr(.14,.32),rr(.06,.15)));}}

 // ---- merge and dress ------------------------------------------------------
 meshMerged(ROCK,MAT.aiRock,G);
 meshMerged(SHADE,MAT.aiShade,G);
 meshMerged(CUT,MAT.aiCut,G);
 meshMerged(RM,MAT.aiRoom,G);
 meshMerged(LNS,lensM,G);
 meshMerged(UND,underM,G);
 meshMerged(SH,wallM,G);
 meshMerged(GRD,deckM,G);
 if(DK.length)meshMerged(DK,MAT.aiVoid,G);
 if(dd){
  // stainsFromLedge() aims each streak radially about the BUILDER's origin,
  // which is nowhere near this city's centre, and this plan is not circular
  // anyway — so the streaks are aimed off the lens's own axis instead.
  const a2Stain=(geos,n,lMax)=>{for(const f of ledgePoints(geos,n,.4)){
    const a=Math.atan2(f.p[2]+200,f.p[0]-LCX),L=rr(5,lMax);
    kput('stain',[f.p[0]+Math.cos(a)*.7,f.p[1]-L*.5,f.p[2]+Math.sin(a)*.7],
     qFacing([Math.cos(a),0,Math.sin(a)]),[rr(1.4,4.2),L,1],null);}};
  mossOnSurface(GRD,0,0,0,130,3.6);mossOnSurface(SH,0,0,0,80,3.2);
  mossOnSurface(ROCK,0,0,0,110,4.2);
  vinesFromLedge(GRD,0,0,0,120,26);a2Stain(SH,130,22);
  for(let i=0;i<140;i++){const x=rr(LCX-LWX+20,XS-6),z=lz1(x)-rr(6,26);
   if(lth(x,z)<6)continue;
   kput('vine',[x,LYC+lth(x,z)-1.2,z],qEuler(rr(-.12,.12),rng()*TAU,rr(-.12,.12)),
    [rr(.9,2),rr(8,38),rr(.9,2)],null);}
  for(let i=0;i<50;i++){const x=rr(LCX-LWX+40,XS-10),z=rr(lz0(x)+30,lz1(x)-30);
   if(lth(x,z)<LTH*.5)continue;
   VEG.tree(x,DECK,z,i%3,rr(6,17));}}

 // ---- the covered surface, measured ----------------------------------------
 // The sheet says 8.6 ha. Integrating the plan on a 4 m lattice rather than
 // trusting the radii is the only way to know whether the taper, the lobing and
 // the master joint actually landed on the figure.
 let ALENS=0,AGARD=0;
 for(let ax=LCX-LWX-8;ax<XS;ax+=4)for(let az=-420;az<40;az+=4){
  if(az>lz0(ax)&&az<lz1(ax))ALENS+=16;}
 for(let ax=XA+40;ax<LCX-LWX+30;ax+=4)for(let az=-340;az<40;az+=4){
  if(az>ZB(ax)+10&&az<shelfE(ax)-14)AGARD+=16;}
 // The quay and the shaft landing are reported separately rather than folded in:
 // 3.9 ha of dock at the bottom of a 430 m drop is not what a sheet means by the
 // surface an arcology covers, and adding it would have flattered the figure by
 // half again.
 const AQUAY=(STR+30)*2*(STR+54)+260*150;
 const AREA=ALENS+AGARD;

 // ---- what the presets are derived from ------------------------------------
 A2_SITE[d]={x:gx,z:gz,d:d,dd:dd,XW:XW,XS:XS,XA:XA,CT0:CT0,SILL:SILL,CROWN:CROWN,
  WSY:WSY,GFZ:GFZ,LCX:LCX,LWX:LWX,DZ:DZ,LTH:LTH,LYC:LYC,DECK:DECK,NBD:NBD,
  NX0:NX0,NX1:NX1,NY:NY,STX:STX,STZ:STZ,STR:STR,STY0:STY0,STY1:STY1,
  ST:{x:A2ST.x,z:A2ST.z,w:A2ST.w,y0:A2ST.y0,y1:A2ST.y1},
  MB:rivC(STX)-rivW(STX),MQY:WSY+5.5,PLY:flr(STX,STZ)+1.4,
  area:AREA,aLens:ALENS,aGard:AGARD,aQuay:AQUAY,lip0:lipY(LCX),zb0:ZB(LCX),
  WELL:WELL.map(w=>({x:w.x,z:w.z,r:w.r,y0:w.y0,y1:wellY1(w),half:!!w.half,gal:!!w.gal})),
  GAL:GAL.map(g=>({y0:g.y0,y1:g.y1,z0:g.z0,z1:g.z1,n:g.n})),
  IMP:SCAR.o?{x:SCAR.o.x,z:SCAR.o.z,r:SCAR.o.r}:null,
  faceZ:(x,y)=>faceZ(x,y),shelfE:x=>shelfE(x),roofY:(x,z)=>roofY(x,z),
  lipY:x=>lipY(x),ZB:x=>ZB(x),lz0:x=>lz0(x),lz1:x=>lz1(x),lth:(x,z)=>lth(x,z),
  bandY:k=>bandY(k),nzB:x=>nzB(x),platY:(x,z)=>platY(x,z)};
 KOFF=[0,0,0];return G;}
