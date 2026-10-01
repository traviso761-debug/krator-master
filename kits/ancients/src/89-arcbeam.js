// ================================================================= ARCBEAM — the bridge city
// A city thrown across a canyon as a pair of beams.
//
// THE FIGURES ARE THE BRIEF, so they are constants and not guesses: population
// 65 000 at 2 119/ha, height 270 m, span 960 m, 30.5 ha covered, and "in the
// orthogonal frame of main and secondary beams, the main beam is almost 300
// metres deep and 800 metres long". Everything below is sized off those:
//
//   canyon      rim at y=400, floor at y=0, clear GAP=960 rock face to rock face
//   main beam   soffit y=150, deck y=420  -> 270 m deep exactly, 290 m to the
//               parapets, i.e. "almost 300"; the central 800 m (|x| <= 400) is
//               the principal span and the rest is the landing
//   section     96 m wide and 270 m deep -> 1 : 2.8, a slab ON EDGE. The whole
//               type fails if this ever reads as square.
//   plan        two beams on z = +/-130, so the gap between their inner faces is
//               164 m: a slot 270 m deep with a city in the bottom of it.
//   covered     2 x 1120 x 96 = 215 000 m2 of beam plus seven secondary spans
//               and the centre deck -> ~30 ha, which is the sheet's figure.
//
// THE ORTHOGONAL FRAME. Seven secondary spans cross the slot at right angles.
// They are deliberately NOT on a grid: their x spacings run 130/124/196/130/
// 150/152 m and their tops sit at seven different heights between 196 and 412.
// Their upper surfaces are the city's ground — blocks, sunken courts and
// pavilions stand on them — so the slot is a canyon of its own with buildings
// in the bottom of it, overlooked by 270 m of elevation on both sides.
//
// THE ELEVATION is the thing that has to read. It is built in three registers
// at three scales, and the contrast between them is the whole drawing:
//   1. a fine cell fabric, 8.6 x 6.0 m, instanced two triangles at a time;
//   2. floor bands, piers, terrace recesses and light wells at 15-60 m;
//   3. a few SQUARE C AND U FIGURES at 50-70 m, standing 10 m proud of the
//      fabric round a court punched clean through to the dark inner skin.
// Without (3) the elevation is noise; without (1) it is a diagram.
//
// The two beams do not carry the same city: each has its own zone table, so
// DWELLINGS on the north beam looks across the slot at COMMERCIAL on the south.
// At both rims the section runs on into the cliff as INDUSTRIES — the beam is
// built 80 m past the rock face on purpose, so the ruin's rockfall can expose it.
//
// The gorge itself is the dam's canyon (src/77-dam.js) at this scale: bedding
// planes, vertical gullies, a coarse base noise and a talus of fallen blocks,
// plus a plateau that grades down to the plain instead of ending as a mesa.
// MAT.water is transparent with roughness .08, which under this sky turns a
// narrow ribbon at the bottom of a shaded gorge into a stripe of molten orange:
// there is no environment to reflect, so all it can return is the haze. A river
// 520 m down is in shadow — opaque, rough and dark is what it actually looks
// like from the rim.
MAT.abRiver=new THREE.MeshStandardMaterial({color:0x1b3a44,roughness:.62,metalness:.12,side:DS});
kdef('abCell',new THREE.PlaneGeometry(1,1),MAT.dot);      // 2 tris. ~23 000 of them per decay.
kdef('abGlaze',new THREE.PlaneGeometry(1,1),MAT.glass);   // ditto, for the terrace galleries
// Presets are DERIVED from this, not read off a render: 91z-views.js runs after
// 90-scene.js, so both builders have already left their dimensions here.
const AB_SITE={};

function buildArcbeam(scene,gx,gz,d){reseed(9560+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0;
 const skin=CONC(dd),voidM=dd?MAT.guts:MAT.dark,deckM=dd?MAT.mud:MAT.paving;
 const BX=BOXC(d),SL=SLABC(d),PIER=dd?'foPostR':'foPost',AR=dd?'foArchR':'foArch';
 const PN=dd?'paneD':'pane',GLZ=dd?'abCell':'abGlaze';
 const SH=[],DK=[],GRD=[],ROCK=[];
 // rubbleRing() colours its blocks up to 55% lightness, which against this
 // gorge is a scatter of polystyrene. Same talus maths, the rock's own palette.
 const abDebris=(cx,cy,cz,rMin,rMax,n,sMax)=>{for(let i=0;i<n;i++){const a=rng()*TAU;
  const q=Math.pow(rng(),2.4),r=rMin+(rMax-rMin)*q,sz=rr(.6,sMax)*(1.25-.55*q);
  kput('rubble',[cx+Math.cos(a)*r,cy+(1-q)*(1-q)*sMax*.55+sz*.4,cz+Math.sin(a)*r],
   qEuler(rng()*3,rng()*3,rng()*3),[sz*rr(.7,1.5),sz*rr(.5,1),sz*rr(.7,1.5)],
   new THREE.Color().setHSL(rr(.05,.10),rr(.12,.30),rr(.09,.21)));}};
 // HEDGES were the kit's 'hedge' — a green box — and read as flat green bricks
 // at any distance a preset uses. A row of leaf cards along the same footprint,
 // same arguments: one card per ~4 m of run, each with its own small twist.
 // The colour is lifted because it multiplies the leaf texture's own green.
 const _hdir=new THREE.Vector3(),_hsl={};
 const abHedge=(p,q,sc,c)=>{const L=sc[0],H=sc[1],W=sc[2],n=Math.max(1,Math.round(L/4));
  _hdir.set(1,0,0).applyQuaternion(q);c.getHSL(_hsl);
  for(let i=0;i<n;i++){const t=((i+.5)/n-.5)*L;
   kput('leafCard',[p[0]+_hdir.x*t,p[1]-H*.5+H*.62,p[2]+_hdir.z*t],q.clone().multiply(qEuler(0,rr(-.5,.5),0)),
    [L/n*.78,H*.72,W*.62],new THREE.Color().setHSL(_hsl.h,_hsl.s,clamp(_hsl.l*2.5,.28,.62)));}};

 // ---- the numbers ----------------------------------------------------------
 // The gorge is 520 deep against a 960 clear span — 1 : 1.85. The first pass cut
 // it 400 deep and hung the soffit 150 m over the floor, and every shot came
 // back reading as a low viaduct over a sandy valley: the beam has to have more
 // air under it than it has depth of its own, or the crossing does not read.
 // 270 m of void under a 270 m beam is the proportion that works.
 // WX is the NOMINAL rock line, set 33 m back from GAP/2 on purpose. The wall's
 // relief — roughness, gullies and bedding — eats 25-45 m off each face, so with
 // WX at 480 the opening measured 874-908 m by raycast at mid-beam height
 // instead of the sheet's 960. At 513 it measures 940-975, i.e. 960 on average,
 // which is what the figure is supposed to mean.
 const CANY=520,GAP=960,WX=GAP/2+33;       // canyon depth, clear span, rock line
 const BY0=270,BY1=540,BDEP=BY1-BY0;       // soffit, deck, 270 m of depth
 const BZ=130,BW=96;                       // beam centreline, beam width
 const BX1=600,BXE=580;                    // built to 600, dressed to 580 (87 m is buried)
 // 2 600 m of gorge, not 3 400: the length only has to run past the edge of every
 // frame, and a shorter face buys 13 m grid columns instead of 19 for the same
 // triangles, which is the difference between bedding planes and soft folds.
 const LEN=2600,PLX=1040,SKIRT=560;        // gorge length, plateau, the grade to the plain
 const TER=[BY0+32,BY0+72,BY0+114,BY0+158,BY0+200,BY0+242],TBH=14,TDEP=9,BAT=7;
 const SOF=6;                              // the plinth flare at the soffit

 // ---- zones ----------------------------------------------------------------
 // The drawings label the section, so the builder does too: the zone decides the
 // cell density, what is lit and in what colour, which figure gets stamped and
 // whether the terraces run through. INDUSTRIES is deliberately the blankest
 // fabric in the type — it is the only zone with no terrace and no court.
 const ZN_N=[[-BX1,-500,'ind','Industries'],[-500,-352,'res','Residential'],
             [-352,-206,'com','Commercial'],[-206,-58,'dwe','Dwellings'],
             [-58,124,'civ','City centre'],[124,286,'lw','Living-working'],
             [286,432,'nbh','Neighborhood'],[432,500,'cul','Cultural centre'],
             [500,BX1,'ind','Industries']];
 const ZN_S=[[-BX1,-486,'ind','Industries'],[-486,-320,'gar','Gardens'],
             [-320,-140,'dwe','Dwellings'],[-140,46,'pub','Public centre'],
             [46,214,'com','Commercial'],[214,368,'res','Residential'],
             [368,506,'lw','Living-working'],[506,BX1,'ind','Industries']];
 const zoneAt=(x,L)=>{for(let i=0;i<L.length;i++)if(x>=L[i][0]&&x<L[i][1])return L[i];return L[L.length-1];};
 // a slow step in the face plane at every zone change, so the 1120 m elevation
 // is articulated at city scale instead of being one extrusion
 const zStep=(x,L)=>{let o=0;for(let i=1;i<L.length;i++){
   const t=clamp((x-L[i][0]+9)/18,0,1);o+=(((i*7)%5)-2)*4.0*t;}return o;};

 // ---- the face -------------------------------------------------------------
 // rel is metres OUTWARD from the nominal face. Terrace bands cut back 9 m for
 // 14 m of height, which is what puts six hard shadow lines up the elevation;
 // the batter leans the whole face 7 m in over its 270 m; the plinth flares.
 const relOf=(x,y,L)=>{let r=-BAT*(y-BY0)/BDEP+zStep(x,L);
  for(let i=0;i<TER.length;i++)if(y>TER[i]&&y<TER[i]+TBH)r-=TDEP;
  r+=SOF*Math.pow(clamp(1-(y-BY0)/54,0,1),1.6);
  r+=2.2*(fbm(x*.0042,y*.0032,9563,2)*2-1);
  return r;};
 // nz = sd*fo is the outward normal of face (sd, fo); a face point is therefore
 // sd*BZ + nz*(BW/2 + rel), which is the one line the whole elevation hangs off.
 const FZ=(x,y,sd,fo,L)=>sd*BZ+sd*fo*(BW/2+relOf(x,y,L||(sd>0?ZN_N:ZN_S)));

 // ---- registry -------------------------------------------------------------
 REGISTER({name:'Arcbeam — the bridge city ('+STATE(d)+')',x:0,z:0,r:1120,h:CANY+80});
 REGISTER({name:'Arcbeam — north main beam',x:0,z:BZ,r:600,y:BY0-16,h:BDEP+40});
 REGISTER({name:'Arcbeam — south main beam',x:0,z:-BZ,r:600,y:BY0-16,h:BDEP+40});
 REGISTER({name:'Arcbeam — the promenade slot',x:20,z:0,r:96,y:BY0,h:BDEP+30});
 REGISTER({name:'Arcbeam — industries, west cliff',x:-512,z:0,r:150,y:BY0,h:BDEP+30});
 REGISTER({name:'Arcbeam — industries, east cliff',x:512,z:0,r:150,y:BY0,h:BDEP+30});
 REGISTER({name:'Arcbeam — the gorge floor',x:0,z:0,r:470,h:46});

 // ---- the gorge ------------------------------------------------------------
 // rimF runs the rim height out at the ends of the model so the gorge shallows
 // into the plain rather than stopping as a sheer cut face.
 const rimF=z=>clamp(1-Math.pow(clamp((Math.abs(z)-LEN*.5+640)/640,0,1),1.4),.10,1);
 const rimY=z=>CANY*rimF(z);
 // THE WALL. The first pass put its noise at 120-190 m wavelengths, which on a
 // 3 400 m face is four or five soft folds — it came back reading as hanging
 // cloth, not rock. Everything here is therefore keyed to a length a cliff
 // actually has: gullies every ~50 m running almost straight down, a coarse
 // relief at ~110 m, a fine break-up at ~33 m, and bedding at a 84 m and a 24 m
 // period. The profile does the rest: a caprock band standing proud at the top
 // and a talus cone banking into the gorge over the bottom 30%.
 const wallX=(s,z,y)=>{
  const t=clamp(y/CANY,0,1);
  // The bedding dips and wanders: a pure sin(y) gave dead-level bands that read
  // as plywood, so the phase carries a slope in z and two noise terms.
  const strata=9*Math.sin(y*.075+z*.0019+fbm(z*.0022,0,9565,2)*7)
              +3.4*Math.sin(y*.26+fbm(z*.006,0,9579,2)*9);
  // BENCHES. A quantised sine is the one term that reads unambiguously as rock
  // rather than as drapery: it puts hard horizontal ledges across the face at
  // four discrete levels, which no amount of smooth fbm will do.
  const bench=8*Math.round(Math.sin(y*.045+fbm(z*.0028,0,9574,2)*6)*2)/2;
  const gully=24*Math.pow(Math.abs(fbm(z*.020,y*.004,9566,3)-.5)*2,2.1)
             +10*Math.pow(Math.abs(fbm(z*.036,y*.010,9576,2)-.5)*2,1.5);
  const rough=24*fbm(z*.009,y*.012,9567,4)+11*fbm(z*.030,y*.020,9568,3);
  const talus=40*Math.pow(clamp(1-t/.30,0,1),1.7);                    // banks INTO the gorge
  const cap=12*Math.pow(clamp((t-.87)/.13,0,1),1.2);                  // the caprock lip
  return s*(WX-rough-strata-bench-gully-talus+cap);};
 // the ruin's rockfall: a bowl bitten out of the east cliff, which is what lets
 // the buried section of the south beam be seen at all.
 const SCAR=dd?{x:WX,y:CANY*.58,z:-BZ,rz:196,ry:190,dep:116}:null;
 // A SLAB FAILURE, not a bowl. The first cut faded the displacement smoothly from
 // the centre out, which lit as a convex mound pushing out of the cliff — the
 // opposite of what it is. The factor of 4.5 saturates the blend within a fifth
 // of the radius, so there is a hard scarp edge and a fresh, comparatively
 // smooth back face behind it, which is how rock actually comes off a cliff.
 const inScar=(z,y)=>{if(!SCAR)return 0;
  const a=(z-SCAR.z)/SCAR.rz,b=(y-SCAR.y)/SCAR.ry;
  const r=Math.hypot(a,b)*(1+.26*(fbm(z*.014,y*.014,9569,2)*2-1));
  return clamp((1-r)*7,0,1);};
 // The beam does not stop at the rock: it is built 80 m past the face and the
 // face is cut for it, so the section really does run on into the cliff. PHZ is
 // 12 m clear of the widest part of the beam; the portal has no head, because
 // the deck stands 20 m above the plateau and emerges over the rim.
 // bhw is the beam's own outer half-width WITHOUT the terrace recesses — the
 // batter and the plinth flare only — so the cutting can hold a constant 8 m
 // clearance all the way up instead of a slot of daylight at the top and the
 // plinth breaking through the reveal at the bottom.
 const PY0=BY0-14,PCL=8;
 const bhw=y=>BW*.5-BAT*(y-BY0)/BDEP+SOF*Math.pow(clamp(1-(y-BY0)/54,0,1),1.6);
 const inPortal=(z,y)=>y>PY0&&Math.abs(Math.abs(z)-BZ)<bhw(Math.min(y,BY1))+PCL;
 for(const s of [-1,1]){
  // inner face. Its top edge follows rimY, so the grid never climbs past the rim.
  ROCK.push(gridSurface((u,v)=>{const z=-LEN*.5+u*LEN,r=rimY(z),y=v*r;
   let x=wallX(s,z,y);
   if(s>0&&SCAR){const k=inScar(z,y);                                 // the bite, east wall only
    // The failure plane DIPS: 40% of the depth at the foot of the scar and the
    // full depth at its head, so the fresh face is a slope a slab slid off,
    // not a second wall parallel to the first one.
    // The fresh face carries its own bedding: the first cut had only one
    // 45 m noise on it and read as a smooth scoop set into a bedded cliff.
    // Same kinds of term as the wall — a dipping stratum, a quantised bench
    // and a fine break-up — at a shorter period, because it is fresh rock.
    if(k>0){const dp=SCAR.dep*(.40+.60*clamp((y-(SCAR.y-SCAR.ry))/(2*SCAR.ry),0,1));
     const bed=7*Math.sin(y*.11+z*.0026+fbm(z*.011,0,9582,2)*5)
              +6*Math.round(Math.sin(y*.058+fbm(z*.006,0,9583,2)*4)*2)/2
              +9*fbm(z*.034,y*.030,9584,3);
     x=lerp(x,WX+dp+13*fbm(z*.022,y*.022,9581,2)-6+bed,k);}}
   return[x,y,z];},420,80,{uS:LEN/30,vS:CANY/30,      // 240x68 was 11 m columns against 50 m gullies (now 6 m): soft at close range (QA arcA)
   hole:(u,v)=>{const z=-LEN*.5+u*LEN;return inPortal(z,v*rimY(z));}}));
  // the portal linings: a sill and two reveals, so the mouth is a cutting driven
  // into the rock and not a rectangle of missing wall with daylight behind it
  // The cutting runs 24 m past the end of the beam and is then CLOSED, with a
  // back wall and a head over the part that is below the plateau. Without them
  // a low camera looks straight down the portal, past the buried 80 m, and out
  // the far side — the rock is a surface, not a solid, so the hole has to be
  // lined on every face the eye can reach.
  const PX1=BX1+24;
  for(const sd2 of [-1,1]){
   // In the ruin the rockfall has taken the rock these linings were cut into:
   // wherever the scar's face lies behind a lining, that part of the lining is
   // gone, and the buried 87 m of beam stands open in the bowl. Left standing,
   // they were two thin sheets of rock hiding exactly what the scar was for.
   const scarGone=(x,z,y)=>{if(!(s>0&&SCAR))return false;const k=inScar(z,y);
    return k>.25&&x<WX+SCAR.dep*k*(.40+.60*clamp((y-(SCAR.y-SCAR.ry))/(2*SCAR.ry),0,1))-10;};
   ROCK.push(gridSurface((u,v)=>[s*lerp(WX-40,PX1,v),PY0,
    sd2*BZ+(u-.5)*2*(bhw(BY0)+PCL)],6,8,{uS:6,vS:10,
    hole:(u,v)=>scarGone(lerp(WX-40,PX1,(v)),sd2*BZ+(u-.5)*2*(bhw(BY0)+PCL),PY0)}));
   for(const f2 of [-1,1])ROCK.push(gridSurface((u,v)=>{const y=PY0+u*(CANY+4-PY0);
    return[s*lerp(WX-40,PX1,v),y,sd2*BZ+f2*(bhw(Math.min(y,BY1))+PCL)];},14,8,{uS:10,vS:10,
    hole:(u,v)=>{const y=PY0+u*(CANY+4-PY0);
     return scarGone(lerp(WX-40,PX1,v),sd2*BZ+f2*(bhw(Math.min(y,BY1))+PCL),y);}}));
   ROCK.push(gridSurface((u,v)=>{const y=PY0+v*(CANY+4-PY0);
    return[s*PX1,y,sd2*BZ+(u-.5)*2*(bhw(Math.min(y,BY1))+PCL)];},10,10,{uS:8,vS:10}));}
  // No head slab: the plateau surface already runs across the top of the cutting
  // from the rim outward, and a slab at 524 would slice the beam, whose deck is
  // at 540 and stands 20 m proud of the plateau by design.
  // the plateau, falling to the plain over SKIRT metres
  ROCK.push(gridSurface((u,v)=>{const z=-LEN*.5+u*LEN,r=rimY(z);
   const x0=Math.abs(wallX(s,z,r-3)),x=lerp(x0,PLX+SKIRT,Math.pow(v,.85));
   const f=1-clamp((x-PLX)/SKIRT,0,1);
   return[s*x,r*Math.pow(f,.62)+16*fbm(u*9,v*5,9570+s,3)*f,z];},130,22,
   {uS:LEN/30,vS:(PLX+SKIRT-WX)/30}));
  // talus of fallen blocks banked against the foot. Biased hard to the wall and
  // largest there, the same maths rubbleRing() uses, because the toe of a
  // 520 m cliff is the one place the scale of it is legible from the floor.
  for(let k=0;k<230;k++){const z=-LEN*.5+rng()*LEN,t=Math.pow(rng(),1.9);
   const bx=wallX(s,z,10)*(1-t*.18)-s*t*120,sc=rr(4,26)*(1-t*.45);
   kput('rubble',[bx,sc*.4+(1-t)*(1-t)*22,z],qEuler(rng()*3,rng()*3,rng()*3),
    [sc*rr(.7,1.5),sc*rr(.5,1),sc*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.10),rr(.14,.34),rr(.10,.22)));}}
 // The floor is MUD, not rock: on the plan and from the rim the gorge floor and
 // the plateau were the same tan and the gorge read as a crease. A 60 m wash is
 // cut down the middle of it with the water in the bottom of the cut.
 // The noise is multiplied by (1-wash), not added to it, so the channel bed is
 // smooth at y=2 and the banks are rough — a flat river plane at 6 is then
 // always under the banks and over the bed instead of alternately drowning and
 // floating as the noise wanders.
 //
 // NOTHING here may go below y=0. 90-scene.js lays a 40 km ground plane at
 // y=-0.05 in bright Tharnish orange, and the first cut of this wash dropped to
 // -10: every shot came back with a stripe of what looked like lava running down
 // the gorge. It was the planet showing through the floor.
 mesh(gridSurface((u,v)=>{const x=(u-.5)*2*(WX+70),z=-LEN*.5+v*LEN;
  const wash=Math.exp(-Math.pow(x/150,2));
  return[x,14+12*fbm(u*7,v*11,9571,3)*(1-wash)-12*wash,z];},40,64,
  {uS:2*(WX+70)/30,vS:LEN/30}),MAT.mud,G);
 mesh(gridSurface((u,v)=>{const z=-LEN*.5+v*LEN;
  return[(u-.5)*104+52*(fbm(v*5,0,9572,2)*2-1),6,z];},6,56,{uS:4,vS:40}),MAT.abRiver,G);
 // What the rockfall dumped on the floor. There is no second bowl surface: the
 // displacement in the wall grid above IS the scar, and a polar re-parameter-
 // isation of the same shape laid over it only produced two coincident sheets
 // fighting for the same pixels.
 if(SCAR){
  for(let k=0;k<190;k++){const t=Math.pow(rng(),1.6),sc=rr(4,26)*(1-t*.5);
   const z=SCAR.z+rr(-1,1)*SCAR.rz*rr(.3,1.1),x=WX-rr(10,240)*t-20;
   kput('rubble',[x,4+sc*.4+(1-t)*54,z],qEuler(rng()*3,rng()*3,rng()*3),
    [sc*rr(.7,1.6),sc*rr(.5,1),sc*rr(.7,1.6)],new THREE.Color().setHSL(rr(.05,.10),rr(.12,.30),rr(.09,.20)));}}

 // ---- the collapsed bay ----------------------------------------------------
 // One bay of the north beam has gone: both faces, the inner skins and the deck
 // over it. The edges are ragged in x and the failure widens upward, because a
 // bay lets go from the top of its own shear.
 const BAY=dd?{sd:1,x0:118,x1:236,y0:BY0+100}:null;
 const inBay=(x,y,sd)=>{if(!BAY||sd!==BAY.sd)return false;
  const w=24*clamp((y-BAY.y0)/(BY1-BAY.y0),0,1);
  const j=13*(fbm(y*.02,x*.004,9574,3)*2-1);
  return y>BAY.y0+18*(fbm(x*.011,0,9575,2)*2-1)&&x>BAY.x0-w+j&&x<BAY.x1+w+j;};

 // ---- the elevations -------------------------------------------------------
 // One pass per face. Figures and wells are drawn FIRST, because the shell's
 // hole predicate has to know where they are before it is built.
 const ROOMC=dd?DEAD:new THREE.Color(0x101a26);
 const ZLIT={ind:new THREE.Color(0xffb257),civ:CYAN,pub:CYAN,cul:CYAN,com:new THREE.Color(0xfff0c8),
             res:WARM,dwe:WARM,nbh:WARM,lw:new THREE.Color(0xbfe6ff),gar:new THREE.Color(0xa8ff9a)};
 const litOf=k=>(ZLIT[k]||WARM).clone().multiplyScalar(dd?rr(.10,.34):rr(.30,.86));
 for(const sd of [1,-1])for(const fo of [1,-1]){
  const L=sd>0?ZN_N:ZN_S,nz=sd*fo;
  const zAt=(x,y)=>FZ(x,y,sd,fo,L);
  const rot=holeFn(dd*.42,9576+sd*3+fo,null,1.3);

  // --- the large figures ---------------------------------------------------
  // Bars are 9 m, not the 13 of the first pass: at 13 a 48 m figure had a 22 m
  // court and read as a blank panel with a porthole in it. 9 m frames round a
  // 54-88 m figure leave a court of 36-70, which is the proportion the sheets
  // draw. The bar rectangles are stored, not re-derived, so the cell pass can
  // ask exactly which bars exist — a C has three and its open side is plain
  // fabric, not a bar to hang windows 10 m off the wall in front of.
  const BARW=9,PROUD=10;
  const FIG=[];
  {let x=-BXE+76;
   while(x<BXE-76){const Z=zoneAt(x,L);
    if(Z[2]==='ind'){x+=rr(70,120);continue;}                 // industries stays blank
    const w=rr(54,88),h=w*rr(.80,1.10);
    const ty=TER[1+((rng()*(TER.length-2))|0)]+rr(-30,28);
    const cy=clamp(ty,BY0+h*.5+22,BY1-h*.5-16);
    // C opens sideways, U opens upward, O is the closed square ring. The mix is
    // zone-dependent so a run of elevation reads as one district.
    const k=Z[2]==='civ'||Z[2]==='pub'?'O':(rng()<.55?'C':'U');
    const bars=[];
    if(k==='O')bars.push([0,h*.5-BARW*.5,w,BARW],[0,-h*.5+BARW*.5,w,BARW],
                         [-w*.5+BARW*.5,0,BARW,h-BARW*2],[w*.5-BARW*.5,0,BARW,h-BARW*2]);
    else if(k==='C'){const s2=rng()<.5?1:-1;
     bars.push([0,h*.5-BARW*.5,w,BARW],[0,-h*.5+BARW*.5,w,BARW],
               [s2*(w*.5-BARW*.5),0,BARW,h-BARW*2]);}
    else bars.push([0,-h*.5+BARW*.5,w,BARW],
                   [-w*.5+BARW*.5,BARW*.5,BARW,h-BARW],[w*.5-BARW*.5,BARW*.5,BARW,h-BARW]);
    FIG.push({x:x+w*.5,y:cy,w:w,h:h,k:k,zone:Z[2],bars:bars});
    x+=w+rr(30,100);}}
  const inFigCourt=(x,y)=>{for(let i=0;i<FIG.length;i++){const F=FIG[i];
    if(Math.abs(x-F.x)<F.w*.5-BARW&&Math.abs(y-F.y)<F.h*.5-BARW)return F;}return null;};
  const onFigBar=(x,y)=>{for(let i=0;i<FIG.length;i++){const F=FIG[i];
    if(Math.abs(x-F.x)<F.w*.5&&Math.abs(y-F.y)<F.h*.5)return F;}return null;};
  // exactly on a bar, not merely inside the figure's bounding square
  const onBarOnly=(x,y)=>{for(let i=0;i<FIG.length;i++){const F=FIG[i];
    if(Math.abs(x-F.x)>F.w*.5||Math.abs(y-F.y)>F.h*.5)continue;
    for(let b=0;b<F.bars.length;b++){const B=F.bars[b];
     if(Math.abs(x-F.x-B[0])<B[2]*.5&&Math.abs(y-F.y-B[1])<B[3]*.5)return F;}}
   return null;};

  // --- light wells ---------------------------------------------------------
  // 24, not 14, and a third of them run most of the depth: the sheet's elevation
  // is a lattice, and without enough vertical incident 1 120 m of horizontal
  // terrace banding reads as a barcode.
  const WELL=[];
  for(let i=0;i<24;i++){const wx=rr(-BXE+40,BXE-40),Z=zoneAt(wx,L);
   if(Z[2]==='ind')continue;
   if(onFigBar(wx,BY0+BDEP*.5))continue;
   const tall=rng()<.34;
   WELL.push({x:wx,w:rr(9,16),y0:tall?BY0+rr(8,26):rr(BY0+20,BY0+130),
              h:tall?rr(BDEP*.72,BDEP*.92):rr(44,126)});}
  const inWell=(x,y)=>{for(let i=0;i<WELL.length;i++){const W=WELL[i];
    if(Math.abs(x-W.x)<W.w*.5&&y>W.y0&&y<W.y0+W.h)return true;}return false;};

  const holeAt=(x,y)=>inBay(x,y,sd)||!!inFigCourt(x,y)||inWell(x,y)
   ||(rot?rot((x+BX1)/(2*BX1),y):false);

  // --- the shell and the inner skin ---------------------------------------
  // 176 x 68 is 6.4 m per column and 4.0 m per row, which is what it takes for a
  // 14 m terrace recess to come out square rather than as a V-groove and for a
  // 50 m court to have a straight edge.
  SH.push(gridSurface((u,v)=>{const x=lerp(-BX1,BX1,u),y=lerp(BY0,BY1,v);
   return[x,y,zAt(x,y)];},176,68,{uS:2*BX1/30,vS:BDEP/30,
   hole:(u,v)=>holeAt(lerp(-BX1,BX1,u),lerp(BY0,BY1,v))}));
  // The inner skin sits 17 m back. Every hole in the fabric — court, well,
  // decay or the collapsed bay — looks onto it, so the beam is never a card
  // shell, and it costs 2 800 triangles a face to be true.
  DK.push(gridSurface((u,v)=>{const x=lerp(-BX1,BX1,u),y=lerp(BY0,BY1,v);
   return[x,y,sd*BZ+nz*(BW/2+relOf(x,y,L)-17)];},68,24,{uS:60,vS:14,
   hole:(u,v)=>inBay(lerp(-BX1,BX1,u),lerp(BY0,BY1,v),sd)}));

  // --- the figure bars -----------------------------------------------------
  // Each bar is one box standing PROUD of the fabric. The cells that go on it
  // come from the ordinary cell pass, at the bar's own offset — a hand-placed
  // line of six windows on a 60 m bar left the figures as blank pale panels,
  // which was the single worst thing in the first elevation.
  FIG.forEach(F=>{
   const zb=zAt(F.x,F.y)+nz*(PROUD*.5);
   // The bars are WHITE METAL, not concrete. Covered in the same cells as the
   // field they vanished into it; blank they read as missing wallpaper. A
   // different material at a different tone is what makes the figure a figure,
   // and metal frames on a concrete mass is the kit's own vocabulary.
   F.bars.forEach(b=>{
    if(inBay(F.x+b[0],F.y+b[1],sd))return;
    kput(PLATE(d),[F.x+b[0],F.y+b[1],zb],null,[b[2],b[3],PROUD+6],null);
    // one row of slot windows along the bar at a 5.5 m pitch, on its own 9 m
    // face. The ordinary 8.6 x 6.0 cell grid only catches one opening per bar
    // and leaves the frames looking like missing wallpaper; a denser rhythm of
    // narrow slots makes the figure inhabited without dissolving it back into
    // the field, which is the contrast the sheet's elevation lives on.
    const lng=Math.max(b[2],b[3]),nc=Math.max(2,Math.round(lng/5.5));
    for(let i=0;i<nc;i++){const t=(i+.5)/nc-.5;
     if(rng()<(dd?.42:.16))continue;
     const cx=F.x+b[0]+(b[2]>b[3]?t*b[2]*.94:0),cy=F.y+b[1]+(b[3]>=b[2]?t*b[3]*.94:0);
     // ON the bar's outer face, which is (PROUD+6)/2 out from the bar's own
     // centre, not PROUD/2: the first cut buried every one of them inside the
     // box and the frames came back blank a second time.
     kput('abCell',[cx,cy,zb+nz*((PROUD+6)*.5+.4)],qFacing([0,0,nz]),
      b[2]>b[3]?[3.6,5.2,1]:[5.2,3.6,1],
      rng()<(dd?.05:.26)?litOf(F.zone):ROOMC);}});
   // the court behind: floor plates, so the hole is a room and not a window
   for(let p=0;p<4;p++){const py=F.y-F.h*.5+BARW+((p+.5)/4)*(F.h-BARW*2);
    if(inBay(F.x,py,sd))continue;
    kput('boxD',[F.x,py,zAt(F.x,F.y)-nz*9],null,[F.w-BARW*2.2,1.4,17],null);
    // a gallery of cells facing out of the court, so it is occupied at the back
    const ng=Math.max(2,Math.round((F.w-BARW*2)/11));
    for(let i=0;i<ng;i++){if(rng()<(dd?.62:.30))continue;
     kput('abCell',[F.x+((i+.5)/ng-.5)*(F.w-BARW*2.2),py+4.2,zAt(F.x,F.y)-nz*16.4],
      qFacing([0,0,nz]),[7,4,1],rng()<(dd?.10:.5)?litOf(F.zone):ROOMC);}}
   if(!dd)kput('strip',[F.x,F.y+F.h*.5-BARW-1.6,zAt(F.x,F.y)-nz*1.5],qEuler(0,nz>0?0:Math.PI,0),
    [F.w-BARW*2.4,1.5,1.5],ZLIT[F.zone]||CYAN);});

  // --- floor bands, piers, cells, balconies --------------------------------
  const CWX=8.6,CWY=6.0;
  const nx=Math.round(BXE*2/CWX),ny=Math.round(BDEP/CWY);
  // Floor bands run in 34 m segments so they can break at a court instead of
  // ploughing through one; one band every two cells is a 12 m storey group.
  for(let j=2;j<ny-1;j+=2){const y=BY0+j*CWY;
   if(y>BY1-6)continue;
   const nseg=Math.round(BXE*2/34);
   for(let i=0;i<nseg;i++){const x=-BXE+(i+.5)*(BXE*2/nseg);
    if(holeAt(x,y)||onFigBar(x,y))continue;
    if(zoneAt(x,L)[2]==='ind'&&j%4)continue;
    if(dd&&rng()<.14)continue;
    let inTer=false;for(let t=0;t<TER.length;t++)if(y>TER[t]-1&&y<TER[t]+TBH+1)inTer=true;
    if(inTer)continue;
    kput(BX,[x,y,zAt(x,y)+nz*1.1],null,[BXE*2/nseg*1.02,1.5,2.6],null);}}
  for(let i=0;i<nx;i+=2){const x=-BXE+(i+.5)*CWX;
   const Z=zoneAt(x,L);
   for(let t=0;t<TER.length;t++){const y0=t?TER[t-1]+TBH:BY0+8,y1=TER[t];
    if(y1-y0<10)continue;
    if(holeAt(x,(y0+y1)*.5)||onFigBar(x,(y0+y1)*.5))continue;
    if(Z[2]==='ind'&&i%4)continue;
    if(dd&&rng()<.12)continue;
    kput(BX,[x,(y0+y1)*.5,zAt(x,(y0+y1)*.5)+nz*1.4],null,[2.4,y1-y0,3.4],null);}}
  for(let j=0;j<ny;j++){const y=BY0+(j+.5)*CWY;
   let inTer=false;for(let t=0;t<TER.length;t++)if(y>TER[t]&&y<TER[t]+TBH)inTer=true;
   for(let i=0;i<nx;i++){const x=-BXE+(i+((j%2)?.25:.75))*CWX;
    if(holeAt(x,y)||onBarOnly(x,y))continue;           // the bars carry their own slots
    const Z=zoneAt(x,L);
    const dens=Z[2]==='ind'?.26:Z[2]==='gar'?.58:inTer?.92:.80;
    if(rng()>dens*(dd?.86:1))continue;
    const z0=zAt(x,y);
    if(inTer&&!dd&&rng()<.55){                         // the terrace galleries are glazed
     kput(GLZ,[x,y,z0+nz*.5],qFacing([0,0,nz]),[CWX*.86,CWY*.80,1],null);continue;}
    const lit=dd?rng()<.020:rng()<.11;
    kput('abCell',[x,y,z0+nz*.42],qFacing([0,0,nz]),[CWX*.70,CWY*.62,1],
     lit?litOf(Z[2]):ROOMC);
    // a balcony on one cell in thirty: the fabric has to have depth at 60 m
    if(rng()<(dd?.016:.032)){
     kput(BX,[x,y-CWY*.44,z0+nz*2.3],null,[CWX*.86,1.1,4.6],null);
     kput(BX,[x,y-CWY*.44+1.5,z0+nz*4.4],null,[CWX*.86,2.2,.7],null);}}}

  // --- the terraces --------------------------------------------------------
  // The recess is already in relOf; this is the deck that sits in it, its
  // parapet, its planting and the people on it.
  TER.forEach((ty,ti)=>{
   GRD.push(gridSurface((u,v)=>{const x=lerp(-BX1,BX1,u);
    const zi=sd*BZ+sd*fo*(BW/2+relOf(x,ty+3,L)),zo=sd*BZ+sd*fo*(BW/2+relOf(x,ty-3,L));
    return[x,ty,lerp(zi,zo,v)];},190,3,{uS:130,vS:3,
    hole:(u,v)=>{const x=lerp(-BX1,BX1,u);
     return zoneAt(x,L)[2]==='ind'||Math.abs(x)>BXE||inBay(x,ty,sd)||!!inFigCourt(x,ty)
      ||(dd&&fbm(x*.014,ti*2.1,9578,2)<.24);}}));
   const np=Math.round(BXE*2/11);
   for(let i=0;i<np;i++){const x=-BXE+(i+.5)*(BXE*2/np);
    if(zoneAt(x,L)[2]==='ind'||inBay(x,ty,sd)||inFigCourt(x,ty))continue;
    if(dd&&rng()<.34)continue;
    const zo=zAt(x,ty-3);
    kput(BX,[x,ty+1.6,zo+nz*1.2],null,[BXE*2/np*1.04,3.2,1.6],null);
    if(!dd&&i%6===2)kput('strip',[x,ty+3.5,zo+nz*1.6],null,[7,1.4,1.4],CYAN);}
   // gardens and living rooms out on the deck
   for(let i=0;i<(ti%2?26:34);i++){const x=rr(-BXE,BXE);
    if(zoneAt(x,L)[2]==='ind'||inBay(x,ty,sd)||inFigCourt(x,ty))continue;
    const zo=lerp(zAt(x,ty+3),zAt(x,ty-3),rr(.25,.8));
    if(rng()<.5)VEG.tree(x,ty,zo,i%3,rr(6,dd?15:11));
    else abHedge([x,ty+.9,zo],qEuler(0,rr(-.2,.2),0),[rr(5,15),1.8,rr(2,4)],
     new THREE.Color().setHSL(rr(.22,.34),rr(.3,.5),dd?rr(.08,.16):rr(.13,.24)));}
   if(!dd)for(let i=0;i<12;i++){const x=rr(-BXE,BXE);
    if(zoneAt(x,L)[2]==='ind'||inFigCourt(x,ty))continue;
    const zo=lerp(zAt(x,ty+3),zAt(x,ty-3),rr(.3,.8));
    kput('figB',[x,ty,zo],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
    kput('figH',[x,ty,zo],null,1,new THREE.Color(0xc9a17e));}});

  // --- the light wells -----------------------------------------------------
  WELL.forEach(W=>{
   DK.push(gridSurface((u,v)=>{const x=W.x+(u-.5)*W.w,y=W.y0+v*W.h;
    return[x,y,zAt(x,y)-nz*16];},4,10,{uS:2,vS:10}));
   for(let p=0;p<Math.round(W.h/16);p++){const py=W.y0+(p+.5)*16;
    if(inBay(W.x,py,sd))continue;
    kput('boxD',[W.x,py,zAt(W.x,py)-nz*8],null,[W.w*.9,1.2,16],null);
    if(!dd&&rng()<.5)kput('strip',[W.x,py+2.4,zAt(W.x,py)-nz*3],qEuler(0,nz>0?0:Math.PI,0),
     [W.w*.7,1.3,1.3],CYAN);}});
 }

 // ---- soffit, deck and the buried ends -------------------------------------
 for(const sd of [-1,1]){const L=sd>0?ZN_N:ZN_S;
  const zo=(x,y,fo)=>FZ(x,y,sd,fo,L);
  // The soffit is the biggest single surface anyone sees from the canyon floor,
  // so it gets a keel, transverse ribs and a longitudinal spine rather than
  // being 107 000 m2 of blank plate.
  SH.push(gridSurface((u,v)=>{const x=lerp(-BX1,BX1,u);
   return[x,BY0-3.5*Math.sin(Math.PI*v),lerp(zo(x,BY0,-1),zo(x,BY0,1),v)];},180,8,{uS:130,vS:8,
   hole:(u,v)=>inBay(lerp(-BX1,BX1,u),BY0+4,sd)}));
  for(let i=0;i<58;i++){const x=-BX1+(i+.5)*(BX1*2/58);
   if(inBay(x,BY0+4,sd))continue;
   kput(BX,[x,BY0-5.5,sd*BZ],null,[6,4.5,BW+2],null);}
  for(const fo of [-1,1])kput(BX,[0,BY0-4,sd*(BZ+fo*(BW*.5-9))],null,[BX1*2,7,10],null);
  kput(BX,[0,BY0-9,sd*BZ],null,[BX1*2,9,22],null);                  // the keel
  // the deck
  GRD.push(gridSurface((u,v)=>{const x=lerp(-BX1,BX1,u);
   return[x,BY1,lerp(zo(x,BY1,-1),zo(x,BY1,1),v)];},190,6,{uS:130,vS:10,
   hole:(u,v)=>inBay(lerp(-BX1,BX1,u),BY1-2,sd)}));
  // the ends: a cap where the beam runs on into the rock
  for(const s2 of [-1,1])SH.push(gridSurface((u,v)=>{const y=lerp(BY0,BY1,v);
   return[s2*BX1,y,lerp(zo(s2*BX1,y,-1),zo(s2*BX1,y,1),u)];},8,20,{uS:8,vS:16}));
  // parapets, lamps and the roof promenade
  for(const fo of [-1,1]){const nz=sd*fo,np=Math.round(BX1*2/12);
   for(let i=0;i<np;i++){const x=-BX1+(i+.5)*(BX1*2/np);
    if(inBay(x,BY1,sd))continue;
    if(dd&&rng()<.30)continue;
    const z0=zo(x,BY1-2,fo);
    kput(BX,[x,BY1+2.6,z0+nz*.6],null,[BX1*2/np*1.04,5.2,2.4],null);
    if(!dd&&i%5===1)kput('strip',[x,BY1+5.6,z0+nz*1.2],null,[8,1.6,1.6],CYAN);}}
  // GARDENS on the roof: the sheet labels them and they are what stops the top
  // of a 1120 m beam reading as an airstrip.
  for(let i=0;i<(dd?150:120);i++){const x=rr(-BXE,BXE);
   if(inBay(x,BY1,sd))continue;
   const z2=lerp(zo(x,BY1,-1),zo(x,BY1,1),rr(.12,.88));
   if(rng()<.62)VEG.tree(x,BY1,z2,i%3,rr(7,dd?18:13));
   else abHedge([x,BY1+1,z2],qEuler(0,rng()*TAU,0),[rr(6,20),2,rr(3,6)],
    new THREE.Color().setHSL(rr(.22,.34),rr(.3,.5),dd?rr(.08,.16):rr(.13,.24)));}
  // THE ROOF WAS 1 200 x 82 m OF BLANK PAVING with trees dropped on it. Two
  // ranks of rooflights now run the length of each beam either side of the
  // axis — they light the top storeys, and they are what gives the deck a
  // grain from the rim — with a lamp and a bench on the axis between them.
  {const pitch=26,nR=Math.floor(BXE*2/pitch);
   for(let i=0;i<nR;i++){const x=-BXE+(i+.5)*pitch;
    if(inBay(x,BY1,sd))continue;
    for(const f2 of [-1,1]){if(dd&&rng()<.30)continue;
     const zc=sd*BZ+f2*22;
     kput(BX,[x,BY1+.8,zc],null,[11,1.6,6.5],null);
     kput(dd?'abCell':'abGlaze',[x,BY1+1.65,zc],qFacing([0,1,0]),[9.6,5.2,1],dd?DEAD:null);}
    if(i%2===0){kput(BX,[x,BY1+.35,sd*BZ],null,[5,.7,1.4],null);
     if(!dd)kput('strip',[x,BY1+4.2,sd*BZ],null,[1.2,1.2,1.2],CYAN);
     if(!dd||rng()<.4)kput(PIER,[x,BY1,sd*BZ+2.2],null,[.6,4,.6],null);}}}
  // roof pavilions, one per zone that asks for one
  L.forEach(Z=>{if(Z[2]==='ind'||Z[2]==='gar')return;
   const cx=(Z[0]+Z[1])*.5;if(Math.abs(cx)>BXE-40)return;
   if(inBay(cx,BY1,sd))return;
   const hR=y2=>17*Math.pow(clamp(1-Math.pow(y2/30,2.1),0,1),.55)+.5;
   SH.push(lathe({rFn:hR,H:30,flutes:12,amp:.09,sharp:2,nu:26,nv:9,
    hole:holeFn(dd*.8,9580+((cx+600)|0),null,1.5)}).translate(cx,BY1,sd*BZ));
   for(let j=0;j<8;j++){const a=j/8*TAU;
    kput(dd?'winBigD':'winBigI',[cx+Math.cos(a)*hR(8)*1.04,BY1+8,sd*BZ+Math.sin(a)*hR(8)*1.04],
     qFacing([Math.cos(a),0,Math.sin(a)]),[1.1,1.1,1],null);}
   if(!dd)kput('finial',[cx,BY1+34,sd*BZ],null,[2.6,7,2.6],null);});
  if(!dd)for(let i=0;i<40;i++){const x=rr(-BXE,BXE);
   kput('figB',[x,BY1,sd*BZ+rr(-30,30)],qEuler(0,rng()*TAU,0),1,
    new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
   kput('figH',[x,BY1,sd*BZ+rr(-30,30)],null,1,new THREE.Color(0xc9a17e));}}

 // ---- the secondary spans --------------------------------------------------
 // Staggered on purpose: seven tops between 196 and 412 and six different x
 // spacings. A regular frame reads as scaffolding; this reads as a city that
 // grew across its own structure.
 const SZ=BZ+BW*.5+8;                                  // they project 8 m past the outer faces
 // y is the TOP of each span, given as an offset above the soffit so the whole
 // frame moves if the beam does. 46..262 of a 270 m depth, and the x spacings
 // run 130/124/196/130/150/152 — neither axis is on a grid.
 const SEC=[{x:-430,y:BY0+82,w:54,h:40,k:'nbh'},{x:-300,y:BY0+254,w:66,h:50,k:'res'},
            {x:-176,y:BY0+150,w:46,h:34,k:'com'},{x:20,y:BY0+262,w:88,h:58,k:'civ'},
            {x:150,y:BY0+46,w:50,h:36,k:'lw'},{x:300,y:BY0+216,w:58,h:46,k:'cul'},
            {x:452,y:BY0+118,w:44,h:32,k:'dwe'}];
 const SECNAME={nbh:'Neighborhood',res:'Residential',com:'Commercial',civ:'Public centre',
                lw:'Living-working',cul:'Cultural centre',dwe:'Dwellings'};
 const DROP=dd?4:-1;                                   // the span that let go
 SEC.forEach((S,si)=>{
  S.dropped=si===DROP;
  if(!S.dropped)REGISTER({name:'Arcbeam — secondary span, '+SECNAME[S.k],
   x:S.x,z:0,r:SZ+14,y:S.y-S.h-6,h:S.h+58});
  const x0=S.x-S.w*.5,x1=S.x+S.w*.5,y0=S.y-S.h;
  // A span that let go leaves the two lengths still socketed in the beams. Each
  // run is built from zA to zB, so the intact case is one run right across and
  // the dropped case is two stubs torn off at a ragged face just inside the slot.
  const RUNS=S.dropped?[[-SZ,-rr(62,78)],[rr(62,78),SZ]]:[[-SZ,SZ]];
  RUNS.forEach((R,ri)=>{const za=R[0],zb=R[1],rg=S.dropped?(u,v)=>fbm(u*6+ri,v*5,9601+ri,3)<.30:null;
   for(const s2 of [-1,1])
    SH.push(gridSurface((u,v)=>[s2>0?x1:x0,lerp(y0,S.y,v),lerp(za,zb,u)],44,10,{uS:30,vS:8,hole:rg}));
   SH.push(gridSurface((u,v)=>[lerp(x0,x1,u),y0,lerp(za,zb,v)],8,40,{uS:6,vS:30,hole:rg}));
   GRD.push(gridSurface((u,v)=>[lerp(x0,x1,u),S.y,lerp(za,zb,v)],8,40,{uS:6,vS:30,hole:rg}));
   for(const s2 of [-1,1])SH.push(gridSurface((u,v)=>
    [lerp(x0,x1,u),lerp(y0,S.y,v),s2>0?zb:za],8,8,{uS:6,vS:6}));});
  if(S.dropped){
   for(let i=0;i<30;i++){const sc=rr(2,9),s3=rng()<.5?-1:1;
    kput('rubble',[rr(x0,x1),y0-sc*.5+rr(-8,8),s3*rr(70,120)],
     qEuler(rng()*3,rng()*3,rng()*3),[sc,sc*.7,sc],new THREE.Color().setHSL(rr(.05,.10),rr(.12,.30),rr(.13,.26)));}
   for(let i=0;i<10;i++){const s3=rng()<.5?-1:1;
    beam(BX,[S.x+rr(-20,20),y0+rr(0,S.h),s3*rr(66,80)],
     [S.x+rr(-30,30),y0-rr(10,50),s3*rr(40,64)],rr(2,5),rr(2,5));}
   return;}
  // ribs under it, and the haunch where it meets each beam
  for(let i=0;i<26;i++){const z2=-SZ+(i+.5)*(SZ*2/26);
   kput(BX,[S.x,y0-3.5,z2],null,[S.w+2,5,6],null);}
  for(const s2 of [-1,1]){kput(BX,[S.x,y0+S.h*.5,s2*(BZ-BW*.5)],null,[S.w+16,S.h+10,14],null);
   for(let f=0;f<2;f++){const xx=S.x+(f?1:-1)*S.w*.5;
    beam(BX,[xx,y0-2,s2*(BZ-BW*.5-4)],[xx,y0+S.h*.42,s2*(BZ-BW*.5-40)],5,6);}}
  // cells on its two long faces, in the slot where they can be seen
  for(const s2 of [-1,1]){const nz=s2;
   const nyc=Math.round(S.h/6.4),nzc=Math.round(160/8.2);
   for(let j=0;j<nyc;j++)for(let i=0;i<nzc;i++){
    const z2=-80+(i+((j%2)?.25:.75))*(160/nzc),yy=y0+(j+.5)*(S.h/nyc);
    if(rng()>(dd?.62:.80))continue;
    const lit=dd?rng()<.03:rng()<.16;
    kput('abCell',[S.x+s2*(S.w*.5+.5),yy,z2],qFacing([s2,0,0]),[6.6,4.2,1],lit?litOf(S.k):ROOMC);}
   for(let j=1;j<nyc;j+=2)kput(BX,[S.x+s2*(S.w*.5+1.2),y0+j*(S.h/nyc),0],null,[2.4,1.4,164],null);}
  // ---- what stands on top -------------------------------------------------
  // "Their upper surfaces are bases for structures." Blocks, a sunken court and
  // a pavilion, laid out along the slot and never over the beams.
  const nB=3+((rng()*3)|0);
  for(let i=0;i<nB;i++){const z2=rr(-70,70),bw=rr(16,S.w*.72),bh=rr(14,46),bd2=rr(14,34);
   if(Math.abs(z2)<22&&i)continue;
   if(dd&&rng()<.22){rubbleRing(S.x+rr(-8,8),S.y,z2,4,22,26,3.2);continue;}
   kput(BX,[S.x+rr(-6,6),S.y+bh*.5,z2],qEuler(0,rr(-.1,.1),0),[bw,bh,bd2],null);
   const rows=Math.max(1,Math.round(bh/7)),cols=Math.max(1,Math.round(bd2/8));
   for(const s2 of [-1,1])for(let r2=0;r2<rows;r2++)for(let c2=0;c2<cols;c2++){
    if(rng()<(dd?.5:.25))continue;
    kput('abCell',[S.x+s2*(bw*.5+.5),S.y+(r2+.5)*(bh/rows),z2+((c2+.5)/cols-.5)*bd2],
     qFacing([s2,0,0]),[5.6,3.4,1],rng()<(dd?.04:.22)?litOf(S.k):ROOMC);}
   if(!dd&&rng()<.5)kput('strip',[S.x,S.y+bh+.8,z2],qEuler(0,Math.PI/2,0),[bd2*.8,1.5,1.5],ZLIT[S.k]||CYAN);}
  // a sunken court with a colonnade round it
  {const cz=rr(-56,56)*(rng()<.5?1:-1)*.7,cr=Math.min(S.w*.36,22);
   GRD.push(gridSurface((u,v)=>{const th=u*TAU,r2=cr*(1-v);
    return[S.x+Math.cos(th)*r2,S.y-7,cz+Math.sin(th)*r2];},28,4,{uS:12,vS:4}));
   GRD.push(gridSurface((u,v)=>{const th=u*TAU;
    return[S.x+Math.cos(th)*cr,S.y-7*v,cz+Math.sin(th)*cr];},28,2,{uS:12,vS:2}));
   const nc=Math.max(8,Math.round(cr/3.4));
   for(let i=0;i<nc;i++){const th=i/nc*TAU;
    if(dd&&rng()<.4)continue;
    kput(PIER,[S.x+Math.cos(th)*(cr+5),S.y,cz+Math.sin(th)*(cr+5)],null,[2.2,11,2.2],null);}
   if(!dd)stripRing(S.x,S.y-6,cz,cr*.7,d,14);}
  // a pavilion
  {const pz=rr(-72,72);
   const hR=y2=>Math.min(S.w*.34,16)*Math.pow(clamp(1-Math.pow(y2/26,2.1),0,1),.55)+.5;
   SH.push(lathe({rFn:hR,H:26,flutes:10,amp:.09,sharp:2,nu:24,nv:8,
    hole:holeFn(dd*.8,9590+si,null,1.5)}).translate(S.x,S.y,pz));
   if(!dd)kput('finial',[S.x,S.y+30,pz],null,[2.2,6,2.2],null);}
  // planting and people on the span top
  for(let i=0;i<(dd?22:16);i++){const z2=rr(-76,76);
   if(rng()<.55)VEG.tree(S.x+rr(-S.w*.4,S.w*.4),S.y,z2,i%3,rr(6,dd?15:11));
   else abHedge([S.x+rr(-S.w*.4,S.w*.4),S.y+.9,z2],qEuler(0,rng()*TAU,0),
    [rr(4,12),1.8,rr(2,4)],new THREE.Color().setHSL(rr(.22,.34),rr(.3,.5),dd?rr(.08,.16):rr(.13,.24)));}
  if(!dd)for(let i=0;i<10;i++){const z2=rr(-78,78);
   kput('figB',[S.x+rr(-S.w*.4,S.w*.4),S.y,z2],qEuler(0,rng()*TAU,0),1,
    new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
   kput('figH',[S.x+rr(-S.w*.4,S.w*.4),S.y,z2],null,1,new THREE.Color(0xc9a17e));}
  // the rim of the deck
  {const np=Math.round(SZ*2/10);
   for(let i=0;i<np;i++){const z2=-SZ+(i+.5)*(SZ*2/np);
    if(Math.abs(z2)>BZ-BW*.5)continue;
    if(dd&&rng()<.3)continue;
    for(const s2 of [-1,1])kput(BX,[S.x+s2*(S.w*.5-1),S.y+1.8,z2],null,[2.2,3.6,SZ*2/np*1.04],null);}}});

 // ---- the city centre deck -------------------------------------------------
 // The one place the slot is roofed: a plaza carried on the civic span,
 // cantilevered 60 m each way in x on brackets off its flanks.
 // It lands 1 m under the beams' own decks (420) and laps 14 m into them, so the
 // three surfaces read as one continuous ground without two coplanar plates
 // fighting for the same pixels.
 const CCZ=BZ-BW*.5+14;
 const CC={x0:20-105,x1:20+105,y:BY1-1};
 REGISTER({name:'Arcbeam — the city centre',x:20,z:0,r:120,y:CC.y-12,h:84});
 {const CIV=SEC[3];
  GRD.push(gridSurface((u,v)=>[lerp(CC.x0,CC.x1,u),CC.y,lerp(-CCZ,CCZ,v)],
   40,24,{uS:26,vS:22,hole:(u,v)=>{const x=lerp(CC.x0,CC.x1,u);
    return dd&&fbm(x*.02,v*4,9595,3)<.20;}}));
  SH.push(gridSurface((u,v)=>[lerp(CC.x0,CC.x1,u),CC.y-5,lerp(CCZ,-CCZ,v)],
   40,18,{uS:26,vS:18}));
  for(const s2 of [-1,1]){const xx=s2>0?CC.x1:CC.x0;
   for(let i=0;i<12;i++){const z2=-72+(i+.5)*12;
    beam(BX,[CIV.x+s2*CIV.w*.5,CC.y-CIV.h*.55,z2],[xx,CC.y-6,z2],4.4,5.2);}
   SH.push(gridSurface((u,v)=>[xx,CC.y-5+v*7,lerp(-CCZ,CCZ,u)],22,3,{uS:16,vS:3}));}
  // a public hall on the deck, courts round it, and a colonnade on the rim
  SH.push(lathe({rFn:y2=>34*Math.pow(clamp(1-Math.pow(y2/46,2.0),0,1),.55)+1,H:46,flutes:16,amp:.08,
   sharp:2,nu:44,nv:12,hole:holeFn(dd*.75,9596,null,1.4)}).translate(20,CC.y,0));
  if(!dd){mesh(lathe({rFn:y2=>32*Math.pow(clamp(1-Math.pow(y2/46,2.0),0,1),.55)+1,H:46,nu:30,nv:8}),
   MAT.glass,G,20,CC.y,0);kput('finial',[20,CC.y+52,0],null,[4,11,4],null);}
  else mesh(lathe({rFn:y2=>30*Math.pow(clamp(1-Math.pow(y2/40,2.0),0,1),.55)+1,H:40,nu:24,nv:6}),
   MAT.guts,G,20,CC.y,0);
  for(let i=0;i<26;i++){const a=i/26*TAU;
   if(dd&&rng()<.35)continue;
   kput(PIER,[20+Math.cos(a)*48,CC.y,Math.sin(a)*48],null,[2.6,13,2.6],null);}
  if(!dd)stripRing(20,CC.y+14,0,48,d,26);
  for(let i=0;i<34;i++){const x=rr(CC.x0+8,CC.x1-8),z2=rr(-72,72);
   if(Math.hypot(x-20,z2)<56)continue;
   if(dd&&rng()<.3)continue;
   const bh=rr(9,26);
   kput(BX,[x,CC.y+bh*.5,z2],qEuler(0,rng()*TAU,0),[rr(10,24),bh,rr(9,20)],null);}
  for(let i=0;i<(dd?46:34);i++){const x=rr(CC.x0,CC.x1),z2=rr(-76,76);
   if(Math.hypot(x-20,z2)<54)continue;
   if(rng()<.55)VEG.tree(x,CC.y,z2,i%3,rr(6,dd?16:11));
   else abHedge([x,CC.y+.9,z2],qEuler(0,rng()*TAU,0),[rr(5,14),1.8,rr(2,4)],
    new THREE.Color().setHSL(rr(.22,.34),rr(.3,.5),dd?rr(.08,.16):rr(.13,.24)));}
  if(!dd)for(let i=0;i<26;i++){const x=rr(CC.x0,CC.x1),z2=rr(-76,76);
   kput('figB',[x,CC.y,z2],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
   kput('figH',[x,CC.y,z2],null,1,new THREE.Color(0xc9a17e));}}

 // ---- footbridges across the slot ------------------------------------------
 // Light ties at levels the secondary spans do not reach, so the slot is
 // latticed all the way up rather than crossed seven times. Their x positions
 // are FIXED on a 96 m module and their heights walk the terrace list by 5 (co-
 // prime with 6, so all six levels get used): a preset that has to stand in the
 // slot can then be placed in a gap that is known rather than hoped for.
 const FBX0=-444,FBDX=96;
 for(let i=0;i<11;i++){const x=FBX0+i*FBDX,by=TER[(i*5)%TER.length]+(i%3-1)*9;
  if(x>BXE-30)continue;
  if(inBay(x,by,1)||(dd&&rng()<.30))continue;
  beam(BX,[x,by,-BZ+BW*.5],[x,by,BZ-BW*.5],7,3.2);
  for(const s2 of [-1,1])beam(BX,[x+s2*3.6,by+2.6,-BZ+BW*.5],[x+s2*3.6,by+2.6,BZ-BW*.5],1.4,2.8);
  if(!dd)kput('strip',[x,by-1.8,0],qEuler(0,Math.PI/2,0),[150,1.4,1.4],CYAN);}

 // ---- the landings: industries in the cliff --------------------------------
 // The section runs on into the rock. Above it, on the plateau, the surface
 // works of an automated industry nobody has been down to in a very long time.
 for(const s2 of [-1,1]){
  for(const sd of [-1,1]){
   // A dressed rectangular portal frame standing proud of the rock face, on the
   // cutting's own line (bhw + clearance) rather than on a guessed ellipse.
   const zo2=y=>bhw(Math.min(y,BY1))+PCL+5;
   // On the scar side the frame came down with the rock it was keyed into:
   // what stood inside the bite is lying on the talus below it.
   const fGone=(z,y)=>s2>0&&SCAR&&inScar(z,y)>.3;
   const fFall=(z,sc)=>{if(!SCAR)return;
    kput(BX,[s2*(WX-rr(80,200)),rr(17,24),z+rr(-40,40)],qEuler(rr(-1,1),rng()*TAU,rr(-1,1)),sc,null);};
   for(let i=0;i<16;i++){const y=PY0-4+(i+.5)*((BY1+22-PY0)/16);
    for(const f2 of [-1,1]){const zf=sd*BZ+f2*zo2(y),sc=[9,(BY1+22-PY0)/16*1.05,9];
     if(fGone(zf,y)){if(rng()<.6)fFall(zf,sc);continue;}
     kput(BX,[s2*(WX-3),y,zf],null,sc,null);}}
   for(let i=0;i<14;i++){const t=(i+.5)/14;
    const zz=sd*BZ+(t-.5)*2*zo2(PY0),zt=sd*BZ+(t-.5)*2*zo2(BY1);
    if(fGone(zz,PY0-8)){if(rng()<.5)fFall(zz,[9,9,zo2(PY0)*2/14*1.05]);}
    else kput(BX,[s2*(WX-3),PY0-8,zz],null,[9,9,zo2(PY0)*2/14*1.05],null);
    if(fGone(zt,BY1+26)){if(rng()<.5)fFall(zt,[9,9,zo2(BY1)*2/14*1.05]);}
    else kput(BX,[s2*(WX-3),BY1+26,zt],null,[9,9,zo2(BY1)*2/14*1.05],null);}
   if(!dd)for(let i=0;i<7;i++)kput('strip',[s2*(WX-6),BY1+22,sd*BZ+(i/6-.5)*2*zo2(BY1)*.9],
    qEuler(0,Math.PI/2,0),[9,1.6,1.6],CYAN);}
  // SURFACE WORKS. Two compounds per rim, not a scatter: the first pass threw
  // sixteen boxes over 660 m of plateau and from any distance they read as
  // litter dropped on a table. Each compound is a walled yard on the beam's own
  // bearing with silos in ranks, and one conveyor runs from the yard back to the
  // portal rather than three of them heading nowhere.
  for(const sd of [-1,1]){
   const cx=s2*(WX+250),cz=sd*(BZ+250);
   GRD.push(gridSurface((u,v)=>[cx+(u-.5)*300,CANY+1.6,cz+(v-.5)*230],10,8,{uS:10,vS:8}));
   for(let i=0;i<22;i++)                                            // the yard wall
    kput(dd?'boxR':'boxW',[cx+((i%11)/10-.5)*300,CANY+4,cz+(i<11?-1:1)*115],null,[30,8,4],null);
   // Four compounds, four layouts. The first pass stamped the same 3 x 5 block
   // into every yard, mirrored, and from the plan view it read as one rubber
   // stamp used four times. Rank count, file count, pitch, heights and which
   // rank carries the stacks now differ per compound; so does a big shed or a
   // tank row standing in for one rank.
   const pi=(s2>0?2:0)+(sd>0?1:0),NR=[3,2,4,3][pi],NC=[5,4,3,6][pi];
   const pX=[56,70,82,46][pi],pZ=[68,90,52,62][pi],stk=[0,1,2,1][pi];
   const HT=[[34,22,15],[40,18],[26,30,14,20],[16,34,22]][pi];
   for(let r2=0;r2<NR;r2++){const zr=cz+(r2-(NR-1)*.5)*pZ;
    if(pi===1&&r2===1){                                    // a single long shed
     kput(dd?'boxR':'boxW',[cx,CANY+1.6+11,zr],null,[pX*(NC-1)+30,22,40],null);
     if(!dd)kput('strip',[cx,CANY+24,zr+20.5],null,[pX*(NC-1),1.6,1.6],new THREE.Color(0xffb257));
     continue;}
    if(pi===2&&r2===3){                                    // a tank row
     for(let c2=0;c2<NC+2;c2++){if(dd&&rng()<.3)continue;
      kput(dd?'pipeR':'pipe',[cx+(c2-(NC+1)*.5)*pX*.62,CANY+1.6+12,zr],null,[13,24,13],null);}
     continue;}
    for(let c2=0;c2<NC;c2++){
     if(dd&&rng()<.34)continue;
     const xc=cx+(c2-(NC-1)*.5)*pX,hh=HT[r2%HT.length]*rr(.85,1.15);
     kput(dd?'boxR':'boxW',[xc,CANY+1.6+hh*.5,zr],null,[rr(.5,.75)*pX,hh,rr(.4,.6)*pZ],null);
     if(r2===stk)kput(dd?'pipeR':'pipe',[xc,CANY+1.6+hh+13,zr-pZ*.3],null,[3.6,26,3.6],null);
     if(!dd&&rng()<.4)kput('strip',[xc,CANY+2.6+hh,zr],
      qEuler(0,Math.PI/2,0),[18,1.6,1.6],new THREE.Color(0xffb257));}}
   // the conveyor gallery: yard to portal, on trestles
   const ay=CANY+26;
   beam(BX,[s2*(WX+18),ay,sd*(BZ+96)],[cx,ay+4,cz-104],7,8);
   for(let i=1;i<7;i++){const t=i/7;
    const tx=lerp(s2*(WX+18),cx,t),tz=lerp(sd*(BZ+96),cz-104,t);
    kput(BX,[tx,CANY+(ay-CANY)*.5,tz],null,[5,ay-CANY,5],null);}
   kput(dd?'boxR':'boxW',[cx,ay+2,cz-104],null,[26,20,26],null);          // the head house
   kput(dd?'boxR':'boxW',[s2*(WX+18),ay+2,sd*(BZ+96)],null,[22,20,22],null);}
  // The approach plaza is ON the plateau, at rim level, with the last 80 m of
  // each beam standing 20 m proud of it — the deck is above the ground here, not
  // level with it — so the apron is holed where the two beams come out and a
  // flight of steps climbs each flank.
  GRD.push(gridSurface((u,v)=>{const x=s2*lerp(WX-30,WX+360,u);
   return[x,CANY+1.2,lerp(-330,330,v)];},22,30,{uS:24,vS:30,
   hole:(u,v)=>{const x=WX-30+u*390,z2=-330+v*660;
    return Math.abs(Math.abs(z2)-BZ)<BW*.5+5&&x<WX+96;}}));
  for(const sd2 of [-1,1])for(let i=0;i<14;i++){const t=(i+.5)/14;
   if(dd&&rng()<.25)continue;
   kput(BX,[s2*(WX+108),CANY+1+t*19,sd2*(BZ+88-t*38)],null,[30,2.8,5.6],null);}
  for(let i=0;i<22;i++){const x=s2*rr(WX+30,WX+330),z2=rr(-300,300);
   if(Math.abs(Math.abs(z2)-BZ)<70)continue;
   if(rng()<.55)VEG.tree(x,CANY+1.2,z2,i%3,rr(7,dd?18:12));
   else abHedge([x,CANY+2,z2],qEuler(0,rng()*TAU,0),[rr(6,18),2,rr(3,6)],
    new THREE.Color().setHSL(rr(.22,.34),rr(.3,.5),dd?rr(.08,.16):rr(.13,.24)));}
  if(!dd)for(let i=0;i<10;i++){const x=s2*rr(WX+40,WX+300),z2=rr(-260,260);
   kput('figB',[x,CANY+1.2,z2],qEuler(0,rng()*TAU,0),1,
    new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
   kput('figH',[x,CANY+1.2,z2],null,1,new THREE.Color(0xc9a17e));}}

 // ---- the dropped span -----------------------------------------------------
 // The whole of secondary span 4 is on the canyon floor, 196 m down. It used to
 // lie there as ONE 150 m box, perforated but whole, and from every preset it
 // read as a fairly intact white block somebody had set down in the gorge. A
 // span that falls 316 m does not arrive in one piece: it BROKE across its own
 // length on impact. So it is two pieces now, kinked and rolled against each
 // other with a gap full of debris between, and every end is TORN — each face
 // bitten back a different ragged depth — with the floors running on a few
 // metres past the shell as broken stubs, a dark lining inside the walls so a
 // torn end shows a wall with a thickness, and the fabric's own dark cells on
 // both long faces so it reads as a piece of the building and not as a plate.
 let FALL=null;
 if(dd){const S=SEC[DROP],ww=S.w,hh=S.h,LL=150;
  const hA=holeFn(1,9598,null,1.6),hB=holeFn(1,9599,null,1.8);
  const jag=(v,k)=>3+13*fbm(v*4.3+k*1.7,k*.9,9603+k,2);
  const piece=(F,ll,pk)=>{const fg=[],lin=[],fp=[],fs=[];
   const cut=(zl,v,f,x)=>zl>ll*.5-jag(v,f*2+pk*9)+(x||0)||zl<-ll*.5+jag(v,f*2+1+pk*9)-(x||0);
   for(const s3 of [-1,1]){const f=s3>0?0:1;
    fg.push(gridSurface((u,v)=>[s3*ww*.5,(v-.5)*hh,(u-.5)*ll],30,8,{uS:20,vS:6,
     hole:(u,v)=>cut((u-.5)*ll,v,f)||hA(u*ll/216+s3+pk,v*hh)}));
    lin.push(gridSurface((u,v)=>[s3*(ww*.5-.9),(v-.5)*hh,(u-.5)*ll],30,8,{uS:20,vS:6,
     hole:(u,v)=>cut((u-.5)*ll,v,f,-1.5)}));}
   fg.push(gridSurface((u,v)=>[(u-.5)*ww,-hh*.5,(v-.5)*ll],6,28,{uS:5,vS:20,
    hole:(u,v)=>cut((v-.5)*ll,u,2)}));
   fg.push(gridSurface((u,v)=>[(u-.5)*ww,hh*.5,(v-.5)*ll],6,28,{uS:5,vS:20,
    hole:(u,v)=>cut((v-.5)*ll,u,3)||hB(v*ll/216+pk,u*40)}));
   lin.push(gridSurface((u,v)=>[(u-.5)*ww*.96,hh*.5-.9,(v-.5)*ll],6,28,{uS:5,vS:20,
    hole:(u,v)=>cut((v-.5)*ll,u,3,-1.5)}));
   // floor plates, running 2-6 m on past the shell as broken stubs
   for(let p=0;p<3;p++){
    const hl=(u,v)=>cut((v-.5)*ll,u,4+p,4)||fbm(u*4+p,v*7,9602+p,3)<.26;
    const pl=dy=>gridSurface((u,v)=>[(u-.5)*ww*.94,(p-1)*hh*.3+dy,(v-.5)*ll],4,24,
     {uS:3,vS:14,hole:hl});
    fp.push(pl(0));fs.push(pl(-1.1));}
   // cross walls, so the torn end opens on rooms and not on a tube
   for(let q=0;q<Math.floor(ll/16);q++){const zc=-ll*.5+(q+.5)*ll/Math.floor(ll/16);
    if(rng()<.35)continue;
    lin.push(gridSurface((u,v)=>[(u-.5)*ww*.9,(v-.5)*hh*.92,zc],4,3,{uS:4,vS:3,
     hole:(u,v)=>cut(zc,u,5)||fbm(u*3,v*3,9607+q,2)<.30}));}
   meshMerged(fg,skin,F);meshMerged(fp,skin,F);meshMerged(lin.concat(fs),MAT.guts,F);
   return {fg,cut};};
  // piece A where the span landed; piece B snapped off its east end and rolled
  const l1=LL*rr(.52,.60),gap=rr(8,16),l2=LL-l1-4;
  const FA=new THREE.Group();FA.position.set(S.x+rr(-40,40),0,rr(-40,60));
  FA.rotation.set(rr(-.34,.20),rr(.5,1.1),rr(.34,.62));G.add(FA);
  const PA=piece(FA,l1,0);
  const FB=new THREE.Group();G.add(FB);
  {FA.updateMatrix();const ax=new THREE.Vector3(0,0,1).applyQuaternion(FA.quaternion);ax.y=0;ax.normalize();
   const off=l1*.5+gap+l2*.5;
   FB.position.set(FA.position.x+ax.x*off,0,FA.position.z+ax.z*off);
   FB.rotation.set(FA.rotation.x+rr(.10,.26),FA.rotation.y+rr(.28,.52)*(rng()<.5?-1:1),-FA.rotation.z*rr(.3,.8));}
  const PB=piece(FB,l2,1);
  // seat each on its own lowest vertex, as before: fragBox over-reaches badly
  // for a long piece lying at an angle
  const seat=(F,fg)=>{dropFragment(F,4,1.5);F.updateMatrix();const v3=new THREE.Vector3();let my=Infinity;
   for(const g of fg){const p=g.attributes.position.array;
    for(let i=0;i<p.length;i+=3){v3.set(p[i],p[i+1],p[i+2]).applyMatrix4(F.matrix);if(v3.y<my)my=v3.y;}}
   if(isFinite(my))F.position.y+=4-my;F.updateMatrix();};
  seat(FA,PA.fg);seat(FB,PB.fg);
  // the cells and the moss follow each piece through useGroupXF
  const dress=(F,ll,P,pk)=>{useGroupXF(F);
   const nz=Math.round(ll/8.2),ny=Math.round(hh/6.4);
   for(const s3 of [-1,1])for(let j=0;j<ny;j++)for(let i=0;i<nz;i++){
    const zl=-ll*.5+(i+((j%2)?.25:.75))*(ll/nz),yl=-hh*.5+(j+.5)*(hh/ny),u=zl/ll+.5,v=yl/hh+.5;
    if(P.cut(zl,v,s3>0?0:1,-3)||hA(u*ll/216+s3+pk,v*hh)||rng()<.22)continue;
    kput('abCell',[s3*(ww*.5+.35),yl,zl],qFacing([s3,0,0]),[6.6,4.2,1],DEAD);}
   mossOnSurface(P.fg,0,0,0,46,4.2);
   endGroupXF();};
  dress(FA,l1,PA,0);dress(FB,l2,PB,1);
  FALL=[FA.position.x,FA.position.y+hh*.5,FA.position.z];
  const mx=(FA.position.x+FB.position.x)*.5,mz=(FA.position.z+FB.position.z)*.5;
  REGISTER({name:'Arcbeam — the dropped span',x:mx,z:mz,r:150,h:80});
  abDebris(FA.position.x,4,FA.position.z,24,190,170,7);
  abDebris(mx,4,mz,4,60,90,9);                          // the break
  abDebris(FB.position.x,4,FB.position.z,20,120,70,6);
  for(let i=0;i<14;i++){const a=rng()*TAU,r2=rr(40,170);
   beam(BX,[mx+Math.cos(a)*r2,rr(4,14),mz+Math.sin(a)*r2],
    [mx+Math.cos(a)*(r2+rr(20,70)),rr(4,10),mz+Math.sin(a)*(r2+rr(14,60))],
    rr(4,9),rr(4,9));}}

 // ---- the collapsed bay's interior and its debris --------------------------
 if(BAY){REGISTER({name:'Arcbeam — the collapsed bay',x:(BAY.x0+BAY.x1)*.5,z:BZ,r:110,y:BAY.y0-20,h:BDEP});
  // FLOOR PLATES, and the one thing that makes a section read: each plate is
  // PALE — the same concrete as the fabric outside — and carries its own dark
  // soffit 1.2 m under it. Cut the plates out of the same void-grey as the
  // inner skin behind them and a stack of nine storeys renders as one grey
  // crater; pale slab over dark soffit gives nine legible bands instead.
  // The plates are cut by the SAME inBay() predicate as the two outer faces
  // and the inner skins, so the breach is one hole through the whole section
  // rather than four unrelated ones.
  for(let p=0;p<9;p++){const py=BAY.y0+6+p*19;
   if(py>BY1-6)break;
   const hl=(u,v)=>fbm(u*6+p,v*4,9600+p,3)<.34+p*.045
     ||!inBay(lerp(BAY.x0-16,BAY.x1+16,u),py,1);
   const pl=(dy)=>gridSurface((u,v)=>{const x=lerp(BAY.x0-16,BAY.x1+16,u);
    return[x,py+dy,lerp(BZ-BW*.5+12,BZ+BW*.5-12,v)];},16,7,{uS:10,vS:6,hole:hl});
   SH.push(pl(0));DK.push(pl(-1.2));
   // partitions, so the storeys are rooms: dark fins running across the section
   for(let q=0;q<5;q++){const px2=lerp(BAY.x0-10,BAY.x1+10,(q+.5)/5);
    if(!inBay(px2,py+6,1)||rng()<.4)continue;
    kput('boxD',[px2,py+7,BZ+rr(-18,18)],null,[.9,13,rr(16,54)],null);}}
  for(const fo of [-1,1]){const nz=fo;
   for(let i=0;i<30;i++){const x=rr(BAY.x0-24,BAY.x1+24),y=rr(BAY.y0,BY1);
    if(!inBay(x,y,1))continue;
    kput(BX,[x,y,BZ+nz*(BW*.5+relOf(x,y,ZN_N))],null,[rr(3,9),rr(3,14),rr(3,8)],null);}}
  // what came out of it: banked on the deck below, and a fan on the canyon floor
  for(let i=0;i<120;i++){const sc=rr(1.4,8);
   kput('rubble',[rr(BAY.x0-40,BAY.x1+40),BY0-12+sc*.4,BZ+rr(-BW*.5,BW*.5)],
    qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.7,1.5),sc*rr(.5,1),sc*rr(.7,1.5)],
    new THREE.Color().setHSL(rr(.04,.09),rr(.12,.32),rr(.16,.34)));}
  abDebris((BAY.x0+BAY.x1)*.5,4,BZ,30,230,180,6.5);}

 // ---- merge and dress ------------------------------------------------------
 meshMerged(ROCK,MAT.rock,G);
 meshMerged(SH,skin,G);
 meshMerged(GRD,deckM,G);
 if(DK.length)meshMerged(DK,voidM,G);
 if(dd){mossOnSurface(SH,0,0,0,150,5.0);vinesFromLedge(SH,0,0,0,220,30);
  stainsFromLedge(SH,0,0,0,240,26);mossOnSurface(GRD,0,0,0,90,4.2);
  mossOnSurface(ROCK,0,0,0,80,4.0);
  // vegetation taking the terraces and the soffit's lee
  for(let i=0;i<200;i++){const x=rr(-BXE,BXE),sd=rng()<.5?1:-1;
   const ty=TER[(rng()*TER.length)|0];
   kput('vine',[x,ty-1.5,sd*(BZ+BW*.5+2)],qEuler(rr(-.12,.12),rng()*TAU,rr(-.12,.12)),
    [rr(.9,2),rr(8,42),rr(.9,2)],null);}
  abDebris(0,4,0,80,460,150,6);
  trees(0,0,120,470,38);}
 else{trees(0,0,150,460,26);}
 // People on the gorge floor, stood ON it. figures() puts everyone at y=0, and
 // this floor is 14-26 m up with a river in the middle, so the two crowds it
 // used to place were knee-deep in mud or wading. Same wash maths as the floor.
 {const flY=(x,z)=>{const u=x/(2*(WX+70))+.5,v=(z+LEN*.5)/LEN,w=Math.exp(-Math.pow(x/150,2));
   return 14+12*fbm(u*7,v*11,9571,3)*(1-w)-12*w;};
  for(const C of [[1,240,8],[-1,-260,6]])for(let i=0;i<C[2];i++){
   const x=C[0]*rr(190,330),z=C[1]+rr(-70,70),c=new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5));
   kput('figB',[x,flY(x,z),z],qEuler(0,rng()*TAU,0),1,c);
   kput('figH',[x,flY(x,z),z],null,1,new THREE.Color(0xc9a17e));}}

 // ---- what the presets are derived from ------------------------------------
 AB_SITE[d]={x:gx,z:gz,d:d,dd:dd,CANY:CANY,GAP:GAP,WX:WX,BY0:BY0,BY1:BY1,BDEP:BDEP,
  BZ:BZ,BW:BW,BX1:BX1,BXE:BXE,LEN:LEN,PLX:PLX,TER:TER.slice(),
  SEC:SEC.map(s=>({x:s.x,y:s.y,w:s.w,h:s.h,k:s.k,dropped:!!s.dropped})),
  CC:{x0:CC.x0,x1:CC.x1,y:CC.y,cx:20},
  BAY:BAY?{x:(BAY.x0+BAY.x1)*.5,y0:BAY.y0,sd:BAY.sd}:null,
  FALL:FALL,SCAR:SCAR?{x:SCAR.x,y:SCAR.y,z:SCAR.z}:null,
  FZ:(x,y,sd,fo)=>gz*0+FZ(x,y,sd,fo),
  ZN:{n:ZN_N.map(z=>({x0:z[0],x1:z[1],k:z[2],name:z[3]})),
      s:ZN_S.map(z=>({x0:z[0],x1:z[1],k:z[2],name:z[3]}))}};
 KOFF=[0,0,0];return G;}
