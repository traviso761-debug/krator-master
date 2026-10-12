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
 const BORE=[],ROCK=[],TOP=[],SHADE=[],CUT=[],RM=[],LNS=[],UND=[],SH=[],DK=[],GRD=[];

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
 // The taper comes down in BENCHES rather than one ramp (see Arcoindian I, which
 // shares the fix): a smooth staircase t - k sin(2 pi n t)/(2 pi n).
 const ctop=x=>{const t=clamp((-x-560)/760,0,1),ts=t-.78*Math.sin(t*TAU*3)/(TAU*3);
  return CT0*clamp(1-Math.pow(ts,1.5),.06,1);};
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
 // RE-ENTRANTS west of the hollow, faded to nothing by x = -640 so the hollow,
 // the shelf, the lens and the bridge are measured off the face they always
 // were. Same treatment as Arcoindian I: amphitheatre bays eaten back into the
 // scarp, deepening toward the rim, fixed constants and no PRNG.
 const BAYS=[[-760,70,84],[-960,88,132],[-1170,66,112],[-1370,84,80]];
 const bay=(x,y)=>{if(x>-640)return 0;
  let s=0;for(const b of BAYS)s+=b[2]*Math.exp(-Math.pow((x-b[0])/b[1],2));
  return s*clamp((-640-x)/110,0,1)*(.62+.38*clamp(y/(ctop(x)+1),0,1));};
 const faceZ=(x,y)=>brow(y)-rel(x,y)-bay(x,y)
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
 // THE WEST FLANK LET GO (ruin only). KNOWN_ISSUES: at distance the ruin read
 // as "intact with an overgrowth pass" -- the roof bite, the block field and
 // the dropped span all read close up, but the SILHOUETTE was the intact one.
 // A lens keyed into rock at the back and hung on one stalk has one obvious
 // way to fail: the cantilevered flank furthest from the stalk shears off.
 // Everything west of a ragged line near x = -96 is gone, and lies on the
 // shelf and in the gorge under where it hung. One predicate, used by every
 // surface and placement on the lens, so nothing is left floating.
 const LFX=LCX-106;
 const lfx=z=>LFX+30*(fbm(z*.018,.7,7171,3)*2-1)+14*(fbm(z*.061,1.9,7172,2)*2-1);
 const lG=(x,z)=>dd>0&&x<lfx(z);
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
  // seated at the LOWEST roof point round its rim, so no rim of shell hangs
  // proud below the bore and no gap opens above a dipping edge
  if(ok){let ry=roofY(wx,wz);for(let k=0;k<8;k++){const a=k/8*TAU,q=roofY(wx+Math.cos(a)*wr,wz+Math.sin(a)*wr);
    if(q>0)ry=Math.min(ry,q);}
   WELL.push({x:wx,z:wz,r:wr,y0:ry-.5});}}
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
 TOP.push(gridSurface((u,v)=>{const x=lerp(XW,XS,u);
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
  kput('aiBlock',[x,sc*.4+(1-t)*(1-t)*22,bx],qEuler(rng()*3,rng()*3,rng()*3),
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

