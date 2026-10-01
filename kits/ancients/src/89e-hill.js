// ================================================================= THE HILL ARCOLOGY — the sinuous terraced city
// A city built INTO a slope, climbing a hill sinuously. It does not run up the
// fall line: it follows the lowest grade it can find, so in plan it snakes, and
// the terrace band that carries it wanders 1 100 m along the contour while it
// climbs 500.
//
// THE DEFINING NUMBER IS 111 GARDEN TERRACES, one per level, and it is exact:
// the loop runs l = 0..110 and nothing culls a level. Everything else is derived
// from it and from one rule of proportion:
//
//   111 levels x 4.5 m of rise      = 499.5 m of terraces
//   + the 4.5 m top level and a 5 m plateau slab -> SUMMIT DECK at y = 560
//   TERRACE WIDTH = half the height = 280 m of along-contour frontage per level
//   SETBACK 9 m a level, so the built flank is 990 m of plan for 499.5 of rise
//     = 26.6 degrees, and the terrace line is y = 885 - 0.5r
//
// PLATE DEPTH is 10-100 m and IRREGULAR ALONG ITS LENGTH: two fbm fields (one at
// ~150 m and ~5 levels of correlation, one at ~420 m and ~17) set a base, and a
// two-term ripple guarantees that NO terrace is a constant-depth ribbon -- the
// measured within-terrace variation is 11-87 m, mean 43. Both figures are
// re-measured at build time and left in HILL_SITE for the presets and the
// hand-back to read, so they are not claims.
//
// THE SECTION IS A STACK OF OVERLAPPING SHELLS, and that is a consequence of
// depth over setback, not a separate piece of modelling: a plate 60 m deep on a
// 9 m setback roofs all but ~13 m of the plate below it. Each terrace's floor IS
// the awning of the terrace under it. The shell tapers from 1.25 m at the back
// to 0.25 m at the lip, so the edge is a knife rather than a fascia board, and
// the PALE surface is the SOFFIT while the deck on top is three material steps
// darker. That inversion is deliberate: from below and from outside -- which is
// where every hero view stands -- what you see is the white curved underside of
// 111 awnings, and from above you see dark decks with planting on them.
//
// NOTHING IN THIS KIT CASTS A SHADOW, and a soffit is the worst case for it (the
// hemisphere's ground colour is 0x6a3a2a, so everything facing down goes warm
// brown). The soffit is therefore painted as a white surface IN SHADE -- a mid
// grey -- rather than left to the lighting, and the deep interior liner behind
// the dwelling fronts is near-black. See KNOWN_ISSUES, the Launch entry.
//
// THE HILL IS PART OF THE TYPE. terrainH() is still flat 0 everywhere in this
// kit, so this builder brings its own landform: a whaleback 3 760 m across and
// 560 m tall, whose natural surface stands 5-90 m ABOVE the terrace line at
// every radius the city occupies. That is what makes the city a CUT rather than
// a cone with steps on it: the ribbon runs in a notch with rock walls on both
// flanks, and those walls are the one thing that gives 27 km of terrace a scale.
//
// THE FOOT is a great antechamber: levels 0-8 are cut away over a 170 m window
// to make an open forecourt 90 m deep flanked by eight levels of overhanging
// awnings, with a five-arch portal at its head and a vaulted hall 130 m deep
// behind that, under the city. A 660 m ramp climbs to it from the plain.
//
// THE ROOF is a flattened summit 1 320 m across carrying twelve Ancient
// buildings: the Cultural centre on the axis, three Skyscraper F in a triangle
// round it, and three offices, three apartment blocks, the Assembly, the
// Amphitheater, the Library and the Hospital in the outer ring. Only buildSkyE
// and buildSkyF take a gy; hillPlace() lifts and turns the other 31 after the
// fact -- see the note on it below.
//
// DECAY. d=0 intact, d=1 a landslip has taken fifteen levels clean out of the
// middle of the ribbon, severing the city, and dumped them on whatever terraces
// happened to lie below the scar -- computed, not placed, because the ribbon
// meanders and the terraces 20 levels down are 600 m sideways.

// ---------------------------------------------------------------- materials
// The hillside gets its own ground texture. TEX.ground is the 40 km painted
// plane and TEX.concrete is board-formed with 0.65 m boards in it, which at
// hill tiling reads as strata; neither is a hillside. Dry ochre soil, olive
// scrub patches, pebbles.
TEX.hillGround=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const soil=fbm(x/26,y/26,2.7,3), patch=fbm(x/11,y/11,8.3,2), grit=fbm(x/2.4,y/2.4,5.1,1);
  let r=150+(soil-.5)*54+(grit-.5)*26, gg=104+(soil-.5)*34+(grit-.5)*18, b=72+(soil-.5)*22;
  const gr=clamp((patch-.48)*2.6,0,1)*.72;                 // scrub taking the slope
  r=lerp(r,86+grit*26,gr);gg=lerp(gg,102+grit*30,gr);b=lerp(b,58,gr);
  if(grit>.79){const s=(grit-.79)*3.4;r+=s*60;gg+=s*54;b+=s*48;}   // pebbles
  d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
MAT.hillSlope =new THREE.MeshStandardMaterial({map:TEX.hillGround,color:0xa39a76,roughness:1,metalness:0,side:DS});
MAT.hillSlopeR=new THREE.MeshStandardMaterial({map:TEX.hillGround,color:0x74905a,roughness:1,metalness:0,side:DS});
// Belt and braces for the dark band at the lip. The hill is a DoubleSide
// surface, so wherever any sliver of it is seen from BELOW its back face takes
// only the hemisphere's ground colour and renders maroon. lxBounce (defined in
// 87-launch.js, which loads first) gives a downward-facing fragment a neutral
// bounce from the same hemisphere term, so a stray underside reads as shaded
// ground rather than as a dark stripe. Terrain never faces down on purpose, so
// nothing else about the hill changes.
lxBounce(MAT.hillSlope,3.2);lxBounce(MAT.hillSlopeR,3.2);   // stronger than the vehicle's: this should read as ground, not shade
// The cut walls are rock, not mud: Arcoindian II's cliff read as smeared brown
// at close range and this one stands right beside every terrace preset. Kept a
// good deal darker than the city so 990 m of contact between the two reads as a
// join rather than as more of the same material.
// SECOND CUT, after the renders: on TEX.concrete, the pale board-formed map, the
// walls came out as light grey bands wherever they faced the sun, and along the
// whole climb they read as a road running beside the terraces. The first thing
// the eye followed up the hill was the excavation, not the city. They are now
// bedded rock, mottled and warm, a few steps darker than the slope above them.
TEX.hillRock=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const bed=fbm(x/90,y/7,4.9,3), blk=fbm(x/19,y/16,6.2,2), grit=fbm(x/2.2,y/2.2,3.7,1);
  let v=.55+(bed-.5)*.55+(blk-.5)*.35+(grit-.5)*.22;
  if(blk>.66)v-=.18;                                          // joints and shadowed blocks
  d[i]=clamp(v*196,0,255);d[i+1]=clamp(v*158,0,255);d[i+2]=clamp(v*118,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
MAT.hillCut   =new THREE.MeshStandardMaterial({map:TEX.hillRock,color:0x8f7a62,roughness:1,metalness:0,side:DS});
MAT.hillCutR  =new THREE.MeshStandardMaterial({map:TEX.hillRock,color:0x74664f,roughness:1,metalness:0,side:DS});
// THE AWNING SOFFIT is the pale one, and it is the one material in this type
// that carries an EMISSIVE term. Nothing casts a shadow here and the hemisphere
// light's ground colour is 0x6a3a2a, so a downward-facing surface is lit by warm
// brown and nothing else: the first cut of this type had 111 white awnings whose
// undersides all rendered chocolate. Painting them darker (the usual fix, see
// the Launch entry in KNOWN_ISSUES) is the wrong direction here, because the
// whole point of the form is a white shell seen from below. A small emissive
// floor gives them a base luminance that the brown cannot swamp, and it costs
// nothing on the sunlit faces because it is a twelfth of the sun's contribution.
MAT.hillSoff  =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xf4eee2,emissive:0x918b7e,roughness:1,metalness:0,side:DS});
MAT.hillSoffR =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xa9a08e,emissive:0x615c51,roughness:1,metalness:0,side:DS});
MAT.hillShell =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xe4dccc,roughness:1,metalness:0,side:DS});
MAT.hillShellR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x968c7e,roughness:1,metalness:0,side:DS});
// A deck is walked on. Three steps darker than the shell, or the whole hill
// comes back as one cream mass in which no terrace can be told from the awning
// over it — Plymouth's lesson, and this type has 111 of them.
MAT.hillDeck  =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x877e6f,roughness:1,metalness:0,side:DS});
MAT.hillDeckR =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x5d5649,roughness:1,metalness:0,side:DS});
// The garden bed laid over the open part of every terrace. THIS is what makes
// 111 of them read as GARDEN terraces from a kilometre away: planting alone is
// instanced dots at that range, and 165 ha of pale deck swallows them.
// Its own texture rather than the hillside's with a green multiply: the slope
// map's blue channel is 72, so anything multiplied through it comes back
// yellow-ochre, and 111 terraces of yellow-ochre read as bare earth.
TEX.hillTurf=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const a=fbm(x/17,y/17,4.4,3), b=fbm(x/3.1,y/3.1,9.2,2), c=fbm(x/48,y/48,2.1,2);
  let r=64+(a-.5)*46+(b-.5)*30+(c-.5)*40, gg=96+(a-.5)*58+(b-.5)*34+(c-.5)*30, bl=42+(a-.5)*26;
  if(b>.70){const t=(b-.70)*3;r+=t*46;gg+=t*40;bl+=t*20;}      // dry tufts
  if(c<.36){r+=18;gg-=8;bl-=6;}                                 // bare patches
  d[i]=r;d[i+1]=gg;d[i+2]=bl;d[i+3]=255;}
 g.putImageData(id,0,0);});
MAT.hillTurf  =new THREE.MeshStandardMaterial({map:TEX.hillTurf,color:0xc8d8b0,roughness:1,metalness:0,side:DS});
MAT.hillTurfR =new THREE.MeshStandardMaterial({map:TEX.hillTurf,color:0x9cb888,roughness:1,metalness:0,side:DS});
MAT.hillWall  =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xcfc5b3,roughness:1,metalness:0,side:DS});
MAT.hillWallR =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x837a6c,roughness:1,metalness:0,side:DS});
MAT.hillPave  =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x88806f,roughness:1,metalness:0,side:DS});
MAT.hillPaveR =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x5c554b,roughness:1,metalness:0,side:DS});
// What a hole in the ruin, or the depth behind a dwelling front, opens onto.
MAT.hillVoid  =new THREE.MeshStandardMaterial({color:0x0b0c0e,roughness:1,metalness:0,side:DS});
// Instanced fabric is white so instanceColor can carry both the decay darkening
// and the per-dwelling tone, exactly as Plymouth's does.
MAT.hillKit   =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xffffff,roughness:1,metalness:0,side:DS});

// ---------------------------------------------------------------- kit
// Three new items only. The 2-triangle pane (plyPane), the 2-triangle awning
// (plyAwn) and the stair run (plyStair) are shared kit geometry that already
// does exactly this job; duplicating them per fragment is the mistake
// KNOWN_ISSUES logs against the canopies, and each duplicate is another
// InstancedMesh that is never frustum-culled.
kdef('hiTrough',plymQuadGeo([
  [-.5,0,-.5, .5,0,-.5, .5,1,-.5, -.5,1,-.5],       // inner face
  [-.5,1,-.5, .5,1,-.5, .5,1,.5, -.5,1,.5],         // soil
  [-.5,0,.5, .5,0,.5, .5,1,.5, -.5,1,.5]],3,1),MAT.hillKit);
kdef('hiProp',new THREE.CylinderGeometry(1,1.25,1,6),MAT.hillKit);
kdef('hiBox',new THREE.BoxGeometry(1,1,1),MAT.hillKit);

// ---------------------------------------------------------------- the landform and the route
// One object so the presets, the probe and the builder cannot disagree about a
// dimension. Seed block for this type: 9660-9661 (one per decay state).
const HILLC={NL:111,RISE:4.5,Y0:60,SET:9,RSUM:660,SUMY:560,RTOE:1880,TW:280,
 DP0:10,DP1:100,TH0:2.30,SAMP:420,SPER:52,SDR:3.4,SPH:1.10,SR0:10,SR1:22,
 SLIM:.88,TWR:330,HALLW:170,HALLR:1520,COURTR:1745,RAMPR:2400,CFY:59.4,
 SLIPL:62,SLIPN:15,CORE:[16,28,40,52,62,73,84,95,103]};
const hillRad=l=>HILLC.RSUM+(HILLC.NL-1-l)*HILLC.SET;          // 1650 at the foot, 660 at the rim
const hillLev=r=>(hillRad(0)-r)/HILLC.SET;                      // continuous level from a radius
const hillDeckY=l=>HILLC.Y0+l*HILLC.RISE;                       // 60 .. 555
const hillTLr=r=>HILLC.Y0+hillLev(r)*HILLC.RISE;                // the terrace line, y = 885 - 0.5r
const hillHalf=l=>HILLC.TW*.5/hillRad(l);                       // angular half-frontage
// THE ROUTE. S is the lateral offset in METRES along the contour, so the same
// expression means the same distance whether the band is at r=1650 or r=660 --
// parameterising in radians would make the meander four times as wide at the
// bottom as at the top. The ramp holds S at exactly 0 for the first ten levels:
// the antechamber and its court are cut through those levels and a formal hall
// cannot have walls that skew 30 degrees, so the city leaves the ground on axis
// and starts to wander above the lobby.
function hillS(l){const C=HILLC,t=clamp((l-C.SR0)/C.SR1,0,1);
 return t*t*(3-2*t)*(C.SAMP*Math.sin(TAU*l/C.SPER+C.SPH)+C.SDR*(l-C.SR0));}
const hillAng=l=>HILLC.TH0+hillS(l)/hillRad(l);
// PLATE DEPTH. base is two fbm fields; the ripple is what guarantees every
// terrace varies along its own length even where the base saturates.
function hillDep(l,s){const C=HILLC;
 const f=fbm(s/150+7.1,l/5.5+2.3,9663,3), g=fbm(s/420+1.7,l/17+5.1,9664,2);
 const base=22+66*clamp((f-.5)*1.9+(g-.5)*1.5+.5,0,1);
 return clamp(base+12*Math.sin(s/62+l*1.9)+5*Math.sin(s/27-l*.8),C.DP0,C.DP1);}
// The natural hill. Its profile stands above the terrace line by 0.041r - 22
// before the bulge is added, i.e. 5 m at the rim and 46 at the foot, so the city
// is in a cut everywhere and the bulge and the noise can only deepen it.
function hillNat(r,th){const C=HILLC;
 if(r<=C.RSUM)return C.SUMY;
 const t=clamp((r-C.RSUM)/(C.RTOE-C.RSUM),0,1), env=Math.pow(Math.sin(Math.PI*t),.85);
 const ang=fbm(Math.cos(th)*1.7+3.1,Math.sin(th)*1.7+5.3,9669,2);
 const bul=(12+48*clamp((ang-.34)*2.1,0,1))*env;                      // spurs and re-entrants
 // Relief in three grains: spurs and re-entrants at the scale of the hill, ridges
 // at a few hundred metres, and gullies that run DOWN it — an fbm of bearing
 // alone, so its lines follow the fall line instead of contouring like every
 // other term here. A hill with only radial noise reads as a sand dune, which is
 // exactly what the first cut of this landform did.
 const nz=26*(fbm(r*.0042+Math.cos(th)*2.3,Math.sin(th)*2.3+1.7,9670,3)-.20)
         +11*(fbm(r*.0075+Math.cos(th)*7.1,Math.sin(th)*7.1+4.4,9671,2)-.42);
 const gul=-22*clamp(fbm(Math.cos(th)*9.4+2.2,Math.sin(th)*9.4+7.7,9676,2)*1.7-.72,0,1)
             *Math.pow(env,.5)*(.35+.65*t);
 return Math.max(.3,C.SUMY*(1-t)+bul+Math.max(0,nz)*Math.pow(env,.6)+gul);}
// The floor of the excavated corridor at a radius: the terrace staircase under
// the city, the court floor across the forecourt, then the approach ramp.
function hillFloorR(r){const C=HILLC;
 if(r<=hillRad(0))return hillTLr(r);
 if(r<=C.COURTR)return C.CFY;
 return C.CFY*clamp((C.RAMPR-r)/(C.RAMPR-C.COURTR),0,1);}
// Is a plan point in the ribbon, and how far across it? Signed: 0 on the
// centre line of the city's footprint at this radius, +-1 on its edges, and
// beyond the edges it grows by one per half-frontage (140 m) of ground, so the
// callers' margins (1.1, 1.25, 1.35, 1.6) still mean 14, 35, 49 and 84 m.
//
// SECOND CUT. The first version took the band of the ONE level whose back wall
// stands at this radius. But a plate is up to 100 m deep, so up to eleven higher
// levels reach out over the same radius, and the meander carries the band up to
// ~50 m sideways a level. Away from the hairpins the fronts of most plates lay
// several hundred metres off that one band, and the natural hill -- carved only
// along it -- buried them: the renders showed a pale strip with terraces along
// one edge of it, and a station on level 48 whose lawn was under 40 m of
// hillside. The footprint is now the union of every plate that actually reaches
// this radius at the depth it actually has. It depends on r alone, so it is
// cached per metre.
const HILL_ENVC=new Map();
function hillEnv(r){const C=HILLC,k=Math.round(r);
 if(HILL_ENVC.has(k))return HILL_ENVC.get(k);
 let lo,hi;
 if(k>=hillRad(0)||k<=C.RSUM){const l=k>=hillRad(0)?0:C.NL-1,a=hillAng(l),h=C.TW*.5/Math.max(k,1);lo=a-h;hi=a+h;}
 else{const lev=hillLev(k),l0=Math.max(0,Math.ceil(lev-1e-6)),l1=Math.min(C.NL-1,Math.floor(lev+C.DP1/C.SET));
  lo=1e9;hi=-1e9;
  for(let l=l0;l<=l1;l++){const rl=hillRad(l),a=hillAng(l),need=k-rl;
   for(let i=0;i<=16;i++){const sl=(i/16-.5)*C.TW;
    if(l===l0||hillDep(l,sl)>=need){const t=a+sl/rl;if(t<lo)lo=t;if(t>hi)hi=t;}}}}
 const e=[lo,hi];HILL_ENVC.set(k,e);return e;}
function hillCorr(r,th){const e=hillEnv(r),mid=(e[0]+e[1])*.5,half=Math.max(1e-6,(e[1]-e[0])*.5);
 let dt=th-mid;while(dt>Math.PI)dt-=TAU;while(dt<-Math.PI)dt+=TAU;
 const a=Math.abs(dt);
 if(a<=half)return dt/half;
 return Math.sign(dt)*(1+(a-half)*Math.max(r,1)/(HILLC.TW*.5));}
// The section of one awning: v runs 0 at the back to 1 at the lip. The plate is
// flat over its inner 42% and then curves down, and the whole shell undulates
// gently along its length so no two lips are parallel.
// THE STOREY IS 4.5 m AND THAT GOVERNS EVERY VERTICAL MODULATION HERE. Both the
// undulation and the droop are keyed to the ABSOLUTE along-contour position
// (hillS(l)+s) and to a slowly-varying level term, so that two plates 4.5 m
// apart move together and the clear height between them stays roughly 4.5
// whatever the shells are doing. The first cut keyed both to the LEVEL-LOCAL s
// with a droop of up to 5.8 m: the band shifts ~30 m sideways a level, so
// neighbouring shells undulated out of phase, and a lip drooping 5.8 m in a 4.5 m
// storey came down THROUGH the deck below it. A raycast straight up from a
// terrace hit a soffit at 0.1 m — the shots read as a multi-storey car park and
// no invariant said a word.
function hillAwnY(l,s,v){const ws=hillS(l)+s;
 const dr=.5+4.2*fbm(ws/185+3.3,l*.10+1.7,9668,2);
 return hillDeckY(l)+.9*Math.sin(ws/70)+.45*Math.sin(ws/29)
        -dr*Math.pow(clamp((v-.42)/.58,0,1),1.75);}
// A world point on the city, for the camera presets: level, lateral metres,
// radial offset from the back of the plate, height over the deck.
function hillPt(S,l,s,dr,dy){const r=hillRad(l)+(dr||0),th=hillAng(l)+s/hillRad(l);
 return[S.x+r*Math.cos(th),hillDeckY(l)+(dy||0),S.z+r*Math.sin(th)];}
// Radius of the lip at (level, lateral metres) — what a camera on a terrace has
// to stand inside of.
const hillLip=(l,s)=>hillRad(l)+hillDep(l,s);
// A point ON the deck surface: frac is the fraction of the plate's own depth, so
// 0 is against the back wall and 1 is the lip, and the height is the awning's
// own, droop included. A preset that guesses a deck height instead of asking
// puts the camera 5 m under a 0.25 m slab.
function hillEyeP(S,l,s,frac,dy){const dp=hillDep(l,s),r=hillRad(l)+dp*frac;
 const th=hillAng(l)+s/hillRad(l);
 return[S.x+r*Math.cos(th),hillAwnY(l,s,frac)+(dy||0),S.z+r*Math.sin(th)];}
// A point in the OPEN part of the terrace: t is the fraction from the dwelling
// front to the lip, so 0 is against the glass and 1 is over the edge. This is
// the one a camera wants. The fraction-of-DEPTH version above is measured from
// the back of the plate, and the back of the plate is 60 m inside the building
// — the first cut of every terrace preset here stood in unlit interior and the
// shots came back as a car park, which no invariant can see.
function hillOpenP(S,l,s,t,dy){const rl=hillRad(l),dp=hillDep(l,s),lp=rl+dp;
 const fr=hillFace(l,s),r=fr+(lp-fr)*t,th=hillAng(l)+s/rl;
 return[S.x+r*Math.cos(th),hillAwnY(l,s,(r-rl)/dp)+(dy||0),S.z+r*Math.sin(th)];}
// WHERE THE SKY STARTS on terrace l: the outermost radius that any plate above
// reaches to. Taking the level immediately above is not enough — a plate six
// levels up can be 60 m deeper than this one and still cantilever past it, and
// the first cut of this type put its camera stations and its garden beds under
// exactly those. The dwelling front is set on this line, so you step out from
// under the deepest thing over your head, not from under the nearest.
// `s` is LEVEL-LOCAL — metres from that level's own centre line — and the band
// walks ~30 m sideways every level, so the plate six levels up covers this
// bearing at a lateral coordinate 180 m from this one. Every cross-level query
// has to convert through the world angle; asking hillDep(l+k, s) reads the wrong
// end of the plate above, which is how the first cut put its terrace stations
// under an awning it had measured as open sky.
function hillFace(l,s){const rl=hillRad(l),lp=rl+hillDep(l,s),th=hillAng(l)+s/rl;
 let m=rl+4;
 for(let k=1;k<=7;k++){const lk=l+k;if(lk>=HILLC.NL)break;
  const rk=hillRad(lk),sk=(th-hillAng(lk))*rk;
  if(Math.abs(sk)>HILLC.TW*.5)continue;
  const v=rk+hillDep(lk,sk);if(v>m)m=v;}
 return clamp(m,rl+4,lp-3.5);}

// PLACING A KIT BUILDING ON THE ROOF. Only buildSkyE and buildSkyF take gy /
// noPlinth; the other 31 builders assume the ground, and several call skyPlinth
// and apron unconditionally, so there is no argument to pass. What there IS, at
// this point in the load, is a pile of plain records: kbake() has not run yet,
// so KIT.items still holds {p,q,s,c} objects in world coordinates, and REG holds
// plain {x,y,z,r,h}. So the builder is run where it wants to run and the result
// is rigid-transformed afterwards: the meshes ride the group it returned, the
// instanced items and the registered volumes are moved one by one.
//
// It also re-points TSTAT.cur, so the roof buildings are charged to their own
// type keys and the hill's own 700 000 budget measures the hill. Three
// Skyscraper F at one decay all land on skyF/0 together, which is the honest
// reading: it is one type's geometry, built three times.
function hillPlace(fn,px,pz,yaw,lift,key){
 const mark={},qy=qEuler(0,yaw,0),r0=REG.length,koff=KOFF.slice(),tc=TSTAT.cur;
 for(const n of KIT.order)mark[n]=KIT.items[n].length;
 TSTAT.cur=key||tc;
 let G=null;try{G=fn();}catch(e){reportErr('hill roof '+(key||'?')+': '+(e&&e.stack||e));}
 TSTAT.cur=tc;KOFF=koff;
 const c=Math.cos(yaw),si=Math.sin(yaw);
 const xf=(x,z)=>[px+(x-px)*c+(z-pz)*si,pz-(x-px)*si+(z-pz)*c];
 for(const n of KIT.order){const it=KIT.items[n];
  for(let i=mark[n];i<it.length;i++){const o=it[i],p=xf(o.p[0],o.p[2]);
   o.p=[p[0],o.p[1]+lift,p[1]];o.q=o.q?o.q.clone().premultiply(qy):qy.clone();}}
 for(let i=r0;i<REG.length;i++){const R=REG[i],p=xf(R.x,R.z);R.x=p[0];R.z=p[1];R.y=(R.y||0)+lift;}
 if(G){const p=xf(G.position.x,G.position.z);
  G.position.set(p[0],G.position.y+lift,p[1]);G.rotation.y+=yaw;}
 return G;}

// What the builder measured, for targets/hill/91z-views.js. One entry per decay.
const HILL_SITE=[];

function buildHill(scene,gx,gz,d){reseed(9660+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,C=HILLC,NL=C.NL,TW=C.TW,SET=C.SET,RISE=C.RISE,R0=hillRad(0);
 const shell=dd?MAT.hillShellR:MAT.hillShell, deckM=dd?MAT.hillDeckR:MAT.hillDeck;
 const soffM=dd?MAT.hillSoffR:MAT.hillSoff;
 const wallM=dd?MAT.hillWallR:MAT.hillWall, paveM=dd?MAT.hillPaveR:MAT.hillPave;
 const cutM=dd?MAT.hillCutR:MAT.hillCut, slopeM=dd?MAT.hillSlopeR:MAT.hillSlope;
 // merge buckets, one per material: 27 km of terrace cannot be one mesh a level
 const SO=[],DK=[],WL=[],VD=[],RK=[],GR=[],PV=[],SHL=[],GD=[];
 const tone=()=>new THREE.Color().setHSL(rr(.05,.13),rr(.04,.20),dd?rr(.14,.28):rr(.40,.72));
 const soilC=()=>new THREE.Color().setHSL(rr(.06,.11),rr(.18,.34),dd?rr(.12,.20):rr(.18,.28));
 const leafC=()=>new THREE.Color().setHSL(rr(.20,.34),rr(.28,.52),dd?rr(.30,.52):rr(.40,.66));
 const WARMLIT=new THREE.Color(0xffa957);
 const winC=()=>dd?(rng()<.03?WARMLIT.clone().multiplyScalar(rr(.06,.15))
                             :new THREE.Color(0x070a0f).multiplyScalar(rr(.5,1.8)))
                 :(rng()<.34?WARMLIT.clone().multiplyScalar(rr(.28,.72))
                             :new THREE.Color(0x0a1018).multiplyScalar(rr(.6,1.8)));
 const person=(x,y,z)=>{kput('figB',[x,y,z],qEuler(0,rng()*TAU,0),1,
   new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
  kput('figH',[x,y,z],null,1,new THREE.Color(0xc9a17e));};
 // TANGENT, not radial. qEuler(0,-th,0) points a kit item's local +X straight
 // out along the radius; -th-PI/2 lays it along the contour. stripRing() has
 // this right now but only draws whole rings, and every band here is an arc.
 const TAN=th=>qEuler(0,-th-Math.PI/2,0);
 const FACE=th=>qFacing([Math.cos(th),0,Math.sin(th)]);
 const pol=(r,th,y)=>[r*Math.cos(th),y,r*Math.sin(th)];
 // holeFn multiplies u by ~4.5*scale internally, so a u normalised over a 280 m
 // frontage eats 60 m rectangles. Feed it arc length over 216.
 const hf=holeFn(d*.55,9667,null,1.5);
 const rot=(s,y)=>hf?hf(s/216,y):false;

 // ---- the antechamber, its court and the landslip, all in plan terms --------
 const THALL=hillAng(7);                            // the hall is on the axis of the bottom levels
 const HHW=C.HALLW*.5;
 // s-window of the court on a given level, in that level's own lateral metres.
 // A sliver of terrace narrower than 26 m beside a 170 m court reads as a
 // modelling failure, so where one is left the court is opened to the band edge.
 const courtWin=l=>{const r=hillRad(l);let a=(THALL-hillAng(l))*r-HHW,b=a+C.HALLW;
  if(a<-TW*.5+26)a=-TW*.5-2; if(b>TW*.5-26)b=TW*.5+2;return[a,b];};
 const inCourt=(l,s)=>{if(l>8)return false;const w=courtWin(l);return s>w[0]&&s<w[1];};
 const SL={l0:C.SLIPL,l1:C.SLIPL+C.SLIPN-1,th:hillAng(C.SLIPL+7)};
 const slipHW=l=>.066+.0092*(l-SL.l0);              // widens upward until it severs the band
 const inSlip=(l,th)=>{if(!dd||l<SL.l0||l>SL.l1)return false;
  let dt=th-SL.th;while(dt>Math.PI)dt-=TAU;while(dt<-Math.PI)dt+=TAU;
  return Math.abs(dt)<slipHW(l);};
 // the levels just above the scar keep their plates but they are torn
 const slipTorn=(l,th,r)=>{if(!dd||l<=SL.l1||l>SL.l1+4)return false;
  let dt=th-SL.th;while(dt>Math.PI)dt-=TAU;while(dt<-Math.PI)dt+=TAU;
  return Math.abs(dt)<slipHW(SL.l1)*1.05&&r>hillRad(SL.l1)-6
   &&fbm(r*.06,dt*38,9672,2)<.62;};
 // ---- the vertical circulation cores ---------------------------------------
 const CORE=C.CORE.map((l,i)=>{const s=[-92,54,68,-74,-48,90,86,-58,-36][i],r=hillRad(l)+hillDep(l,s)*.42;
  const th=hillAng(l)+s/hillRad(l);
  return {l,s,r,th,x:r*Math.cos(th),z:r*Math.sin(th),rad:13,
          y0:hillDeckY(l),y1:hillDeckY(l)+52};});
 const inCore=(x,z,pad)=>{for(let i=0;i<CORE.length;i++){const K=CORE[i];
   if(Math.hypot(x-K.x,z-K.z)<K.rad+(pad||0))return true;}return false;};
 // CAMERA STATIONS, searched for rather than written down: on each of four
 // stretches of the climb, the spot with the WIDEST open strip, because a
 // station picked by eye lands behind the dwelling front, and behind the
 // dwelling front is 60 m of unlit interior. Nothing is planted within 17 m of
 // one either: a 12 m tree two metres off the lens fills the frame with one leaf
 // texture and no counter in verify.py reports it.
 const STA=[];
 [12,44,71,97].forEach(l0=>{let best=null;
  for(let l=l0;l<l0+7&&l<NL-1;l++)for(let i=0;i<22;i++){const s=(i/21-.5)*TW*.80;
   if(inCourt(l,s)||inSlip(l,hillAng(l)+s/hillRad(l)))continue;
   const dp=hillDep(l,s),lp=hillRad(l)+dp,fr=hillFace(l,s);
   if(!best||lp-fr>best.open)best={l:l,s:s,open:lp-fr,face:fr,lip:lp,dep:dp};}
  if(best)STA.push(best);});
 // 32 m, not 17: the tree is excluded by its TRUNK position but its canopy is
 // five metres across and the camera stands a third of the way across the open
 // strip rather than in the middle of the clearing.
 const KEEP=STA.map(o=>{const p=hillOpenP({x:0,z:0},o.l,o.s,.5,0);
  return [p[0],p[2],32];});
 const clearOf=(x,z)=>{for(let i=0;i<KEEP.length;i++){const K=KEEP[i];
   if(Math.hypot(x-K[0],z-K[1])<K[2])return false;}return true;};

 // ---- registry --------------------------------------------------------------
 REGISTER({name:'Hill Arcology ('+STATE(d)+')',x:0,z:0,r:C.RTOE,h:C.SUMY+330});
 REGISTER({name:'Hill Arcology — the hill',x:0,z:0,r:C.RTOE-10,h:C.SUMY+4});
 for(let b=0;b<5;b++){const l0=b*22,l1=Math.min(NL-1,l0+21),lm=(l0+l1)>>1;
  const p=hillPt({x:0,z:0},lm,0,hillDep(lm,0)*.5,0);
  REGISTER({name:'Hill Arcology — terraces '+l0+'-'+l1,x:p[0],z:p[2],
   y:hillDeckY(l0)-3,r:Math.max(320,TW*.62+Math.abs(hillS(l1)-hillS(l0))*.6),
   h:hillDeckY(l1)-hillDeckY(l0)+14});}
 {const p=hillPt({x:0,z:0},4,0,-60,0);
  REGISTER({name:'Hill Arcology — the antechamber',x:p[0],z:p[2],y:C.Y0-2,r:120,h:40});
  const q=hillPt({x:0,z:0},0,0,58,0);
  REGISTER({name:'Hill Arcology — the forecourt',x:q[0],z:q[2],y:C.Y0-2,r:110,h:52});}
 REGISTER({name:'Hill Arcology — the summit plateau',x:0,z:0,y:C.SUMY-8,r:C.RSUM,h:22});
 CORE.forEach((K,i)=>REGISTER({name:'Hill Arcology — circulation core '+(i+1),
  x:K.x,z:K.z,y:K.y0,r:K.rad+6,h:K.y1-K.y0+8}));
 if(dd){const rm=hillRad(SL.l0+7),p=pol(rm+30,SL.th,0);
  REGISTER({name:'Hill Arcology — the landslip',x:p[0],z:p[2],
   y:hillDeckY(SL.l0)-30,r:180,h:hillDeckY(SL.l1)-hillDeckY(SL.l0)+70});}

 // ============================================================ THE HILL ITSELF
 // A polar grid with the ribbon's corridor cut out of it. The hole is taken at
 // |corr| < 1.25 -- wider than the terraces, which reach 1.0 -- because the
 // grid quantises the hole edge to a cell (40-70 m at the foot) and the flank
 // strips below have to be able to cover it whichever way it lands.
 // UVs: a tile is ~24 m, so uS is the mid-radius circumference over 24 and vS the
 // radial span over 24. The first cut had vS=150 against uS=300, which is one
 // tile every 8 m radially against one every 26 m round — a 3:1 stretch that
 // turned the whole hill into concentric corduroy.
 {const NU=176,NV=44;
  GR.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(C.RSUM,C.RTOE,Math.pow(v,.86));
    return pol(r,th,hillNat(r,th));},NU,NV,
   {uS:330,vS:51,hole:(u,v)=>{
     // THE DARK BAND. gridSurface tests a quad at its CENTRE, so a quad whose
     // centre lay just outside |corr| 1.25 still reached half a cell (20-35 m)
     // in over the cut at full natural height — an overhang, seen from the
     // terraces as a strip of the hill's own UNDERSIDE, lit only by the
     // hemisphere's ground colour: the dark maroon band along the lip in 'The
     // cut wall'. Testing all four CORNERS drops every quad that reaches over
     // the cut; the flank shoulder, which runs out to |corr| 2.37 at 0.4 m
     // over the hill, covers the seam.
     // Only inside the flank's radial reach (1 760 m): beyond it, near the
     // forecourt and the ramp, dropping a quad opened a hole onto the ground
     // plane, because there is no shoulder there to cover it.
     const th0=u*TAU,r0=lerp(C.RSUM,C.RTOE,Math.pow(v,.86));
     if(Math.abs(hillCorr(r0,th0))<1.25&&hillNat(r0,th0)>hillFloorR(r0)+1.5)return true;
     let inside=false;
     for(let a=-.5;a<=.5;a+=1)for(let b=-.5;b<=.5;b+=1){
      const th=(u+a/NU)*TAU,r=lerp(C.RSUM,C.RTOE,Math.pow(clamp(v+b/NV,0,1),.86)),c=Math.abs(hillCorr(r,th));
      if(r<C.RSUM+8||r>1740)return false;
      if(c<1.3&&hillNat(r,th)>hillFloorR(r)+1.5)inside=true;}
     return inside;}}));
  // the toe skirt, out to the plain, so the 40 km ground plane never shows a seam
  GR.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(C.RTOE,C.RTOE+260,v);
    return pol(r,th,lerp(hillNat(C.RTOE,th),.15,Math.pow(v,.7)));},NU,4,{uS:490,vS:11}));
  // the flattened summit, with a 3 m crown on it so it is not dead level
  PV.push(gridSurface((u,v)=>{const th=u*TAU,r=C.RSUM*(1-Math.pow(v,.8));
    return pol(r,th,C.SUMY+3*(1-v)*(1-v));},112,12,{uS:260,vS:80}));}
 // ---- the flanks of the cut -------------------------------------------------
 // A rock wall rising out of the end of every terrace, then the shoulder of
 // ground between its top and the hill surface. Its inner edge sits 2 m under
 // the terrace line so no gap can open along 990 m of contact, and its outer
 // edge deliberately OVERLAPS the hill grid it meets (both evaluate hillNat, so
 // they agree to within the grid's own interpolation).
 // In two pieces, and the split is not cosmetic: the strip is 130 m wide a side
 // over 2 km, so surfacing all of it as rock laid a pale field down each flank of
 // the city that read from above as more paving than the city has. The steep
 // third is the cut face and is rock; the rest is the shoulder of the hill and is
 // hillside, like the ground it joins.
 const flankP=(sg,u0,u1)=>(u,v)=>{const r=lerp(C.RSUM,1760,Math.pow(v,.9));
   const fl=hillFloorR(r),uu=lerp(u0,u1,u),e=hillEnv(r);
   // from the EDGE of the city's footprint at this radius, not from one
   // level's band: see hillEnv
   // The shoulder (uu > .34) now runs out to |corr| 2.37 rather than 1.9, so
   // it is under every hill quad the lip test below removes; the rock face
   // keeps its old width.
   const off=uu<=.34?uu*.93-.03:lerp(.2862,1.37,(uu-.34)/.66);
   const th=(sg<0?e[0]:e[1])+sg*off*(TW*.5)/r;
   return pol(r,th,Math.max(fl-2,lerp(fl-2,hillNat(r,th)+.4,Math.pow(uu,.5))));};
 for(let sg=-1;sg<=1;sg+=2){
  RK.push(gridSurface(flankP(sg,0,.34),8,54,{uS:10,vS:190}));
  GR.push(gridSurface(flankP(sg,.34,1),12,54,{uS:20,vS:190}));}
 // THE FLOOR OF THE CUT. The stack of overlapping plates closes the section only
 // where each plate is as deep as its neighbours; the footprint above is the
 // union of the DEEPEST, so here and there the ground between two shallow lips
 // would be a hole into nothing. A rock floor 2.5 m under the terrace line, across
 // the whole footprint, is under every plate and is only seen through the gaps.
 RK.push(gridSurface((u,v)=>{const r=lerp(C.RSUM+2,R0-1,v),e=hillEnv(r);
   return pol(r,lerp(e[0],e[1],u),hillTLr(r)-2.5);},24,110,{uS:20,vS:60}));

 // ============================================================ 111 TERRACES
 let dpLo=1e9,dpHi=-1e9,varLo=1e9,varHi=-1e9,opLo=1e9,opHi=-1e9,area=0,nplant=0;
 const AWN={l:52,s:0,over:0};
 // where the route reverses: dS/dl changes sign, the band stops walking sideways
 // and the terraces stack vertically instead. The hairpins are the one place in
 // this type where the section is 20 shells deep, so the presets want them.
 const HAIR=[];
 for(let l=12;l<106;l++){const a=hillS(l)-hillS(l-1),b=hillS(l+1)-hillS(l);
  if(a*b<0&&(HAIR.length===0||l-HAIR[HAIR.length-1]>6))HAIR.push(l);}
 for(let l=0;l<NL;l++){
  const rl=hillRad(l),yl=hillDeckY(l),th0=hillAng(l),nu=34;
  const dep=s=>hillDep(l,s), lipR=s=>rl+dep(s);
  // THE DWELLING FRONT follows hillFace: the outermost line anything above
  // reaches to, so you step out from under the awnings onto open terrace. It is
  // sampled on the shell's own u grid and interpolated, because hillFace costs
  // seven fbm pairs and the bays, the wall, the garden bed and the planting all
  // want it — 250 calls a level became 35.
  const FRT=[];for(let i=0;i<=nu;i++)FRT.push(hillFace(l,(i/nu-.5)*TW));
  const faceR=s=>{const q=clamp((s/TW+.5)*nu,0,nu),i=Math.min(nu-1,Math.floor(q));
   return lerp(FRT[i],FRT[i+1],q-i);};
  // the height of the DECK SURFACE at the dwelling front
  const fy=s=>hillAwnY(l,s,clamp((faceR(s)-rl)/dep(s),0,1));
  const thOf=s=>th0+s/rl;
  const gone=(s,r,y)=>{const th=thOf(s);
   return inCourt(l,s)||inSlip(l,th)||slipTorn(l,th,r)||inCore(r*Math.cos(th),r*Math.sin(th),3)
    ||(dd&&rot(s,y));};
  let dlo=1e9,dhi=-1e9;
  for(let i=0;i<=24;i++){const s=(i/24-.5)*TW,dv=dep(s);
   dlo=Math.min(dlo,dv);dhi=Math.max(dhi,dv);area+=dv*TW/25;
   // The deepest OVERHANG in the city: where the plate above reaches further out
   // than this one does, this terrace is a slot entirely under it, and that is
   // the only place a camera can stand under an awning. The presets ask for it
   // rather than guessing a level.
   if(l>18&&l<102&&Math.abs(s)<100&&!inCourt(l,s)){
    // how far the shells above reach PAST this lip, UNCLAMPED — hillFace stops
    // at lip-3.5 so that there is always a terrace to stand on, which would make
    // this measurement constant
    const th=th0+s/rl;let mx=-999;
    for(let k=1;k<=7&&l+k<NL;k++){const rk=hillRad(l+k),sk=(th-hillAng(l+k))*rk;
     if(Math.abs(sk)>TW*.5)continue;mx=Math.max(mx,rk+hillDep(l+k,sk));}
    const ov=mx-(rl+dv);
    if(ov>AWN.over&&dv>18){AWN.over=ov;AWN.l=l;AWN.s=s;}}}
  dpLo=Math.min(dpLo,dlo);dpHi=Math.max(dpHi,dhi);
  varLo=Math.min(varLo,dhi-dlo);varHi=Math.max(varHi,dhi-dlo);
  // ---- the deck (walked on, darker) and the soffit (the white awning) -------
  DK.push(gridSurface((u,v)=>{const s=(u-.5)*TW;
    return pol(rl+v*dep(s),thOf(s),hillAwnY(l,s,v));},nu,4,
   {uS:TW/8,vS:7,hole:(u,v)=>{const s=(u-.5)*TW;
     return gone(s,rl+v*dep(s),hillAwnY(l,s,v));}}));
  // SAME nv AS THE DECK. The droop is a pow(1.75) curve and a polyline through
  // fewer points cuts its corner from ABOVE, so a 3-row soffit under a 4-row
  // deck rose through it wherever the curve was steep and the deck's brown
  // underside showed as wedges along a third of the city. The shell is 1.25 m
  // thick at the back and tapers to 0.25 at the lip, which is a real form and
  // also less than that error.
  SO.push(gridSurface((u,v)=>{const s=(u-.5)*TW;
    return pol(rl+v*dep(s),thOf(s),hillAwnY(l,s,v)-1.25*(1-.8*Math.pow(v,2.2)));},nu,4,
   {uS:TW/8,vS:7,hole:(u,v)=>{const s=(u-.5)*TW;
     return gone(s,rl+v*dep(s),hillAwnY(l,s,v));}}));
  // ---- the garden bed over the open part of the terrace --------------------
  // Everything between the dwelling front and the trough at the lip is planted.
  // Laid as its own surface rather than left as deck: at a kilometre the
  // instanced planting is a scatter of dots and 165 ha of pale concrete
  // swallows it, and this type's whole claim is that the terraces are GARDENS.
  GD.push(gridSurface((u,v)=>{const s=(u-.5)*TW,fr=faceR(s),lp=lipR(s);
    const r=lerp(fr+.6,lp-2.2,v);
    return pol(r,thOf(s),hillAwnY(l,s,(r-rl)/dep(s))+.30);},nu,3,
   {uS:TW/9,vS:2.4,hole:(u,v)=>{const s=(u-.5)*TW;
     return lipR(s)-faceR(s)<5||gone(s,faceR(s)+2,yl+1);}}));
  // ---- the dwelling front ---------------------------------------------------
  // ON THE DECK SURFACE, not on the nominal level height. The shell waves +/-1.35 m
  // and droops up to 4.7, so a wall built from hillDeckY floats over the deck in
  // one bay and is buried to the sill in the next — which is why the first cut of
  // this city had a dwelling front with no windows in it.
  WL.push(gridSurface((u,v)=>{const s=(u-.5)*TW,r=faceR(s);
    return pol(r+.3*Math.sin(v*Math.PI),thOf(s),fy(s)+v*(RISE-1.1));},nu,2,
   {uS:TW/8,vS:.6,hole:(u,v)=>{const s=(u-.5)*TW;
     return gone(s,faceR(s),yl+v*RISE)||(dd&&rng()<.09);}}));
  if(dd)VD.push(gridSurface((u,v)=>{const s=(u-.5)*TW;
    return pol(faceR(s)-5,thOf(s),fy(s)+v*(RISE-1.2));},20,1,
   {uS:TW/10,vS:.5,hole:u=>{const s=(u-.5)*TW;return gone(s,faceR(s),yl+2);}}));
  // ---- the ends, so the sandwich between two plates is closed ---------------
  // Every enclosed space in this kit that was left open was left open at an end
  // like this one; the two here butt straight into the rock wall of the cut.
  for(let e=0;e<2;e++){const s=(e?.5:-.5)*TW*.999;
   if(inSlip(l,thOf(s)))continue;
   SHL.push(gridSurface((u,v)=>pol(rl+u*dep(s),thOf(s),
     hillAwnY(l,s,u)+v*(RISE+.4)-1.3),6,2,{uS:6,vS:.6}));}
  // the two walls down the sides of the forecourt, which are cut plate ends
  if(l<=8){const w=courtWin(l);
   for(let e=0;e<2;e++){const s=e?w[1]:w[0];
    if(Math.abs(s)>TW*.5)continue;
    WL.push(gridSurface((u,v)=>pol(rl+u*dep(s),thOf(s),
      hillAwnY(l,s,u)+v*(RISE+.4)-1.3),6,2,{uS:6,vS:.6}));
    if(dd)continue;
    for(let q=0;q<3;q++)kput('plyPane',[...pol(rl+dep(s)*(.25+q*.22),thOf(s),
      hillAwnY(l,s,.25+q*.22)+2.1)],
      qFacing([-Math.sin(thOf(s))*(e?-1:1),0,Math.cos(thOf(s))*(e?-1:1)]),[3.4,2.1,1],winC());}}

  // ---- what is ON the terrace ----------------------------------------------
  const nb=Math.round(TW/7);                          // a 7 m bay: one dwelling
  for(let j=0;j<nb;j++){const u=(j+.5)/nb,s=(u-.5)*TW;
   const th=thOf(s),fr=faceR(s),lp=lipR(s),open=lp-fr;
   const fx=fr*Math.cos(th),fz=fr*Math.sin(th),by=fy(s);
   if(gone(s,fr,yl+2))continue;
   const tq=FACE(th);
   // dwelling front: a window, a door on some bays, an awning over some
   if(!(dd&&rng()<.18)){
    kput('plyPane',[fx+Math.cos(th)*.52,by+1.95,fz+Math.sin(th)*.52],tq,[3.6,2.1,1],winC());
    if(rng()<.5)kput('plyPane',[fx+Math.cos(th)*.52-Math.sin(th)*2.5,by+1.5,
      fz+Math.sin(th)*.52+Math.cos(th)*2.5],tq,[1.5,2.4,1],winC());
    if(rng()<(dd?.10:.30))kput('plyAwn',[fx+Math.cos(th)*.62,by+3.05,fz+Math.sin(th)*.62],
      tq,[3.8,1.3,1.9],tone());}
   if(dd&&rng()<.30){const Ls=rr(4,12);
    kput('stain',[fx+Math.cos(th)*.58,by+RISE-Ls*.5,fz+Math.sin(th)*.58],tq,[rr(2,5),Ls,1],null);}
   // the planting trough at the lip: this is the parapet, the planter and the
   // thing that makes a 0.25 m knife edge read as a terrace, all at 6 triangles
   // The trough is PALE, not soil-coloured. Continuous along every lip, it draws
   // 111 white lines down the hill at a kilometre — which is the only thing at
   // that range that says "terraces" rather than "quarry benches", because a
   // 4.5 m riser is two pixels and the deck behind it is in plan.
   if(open>5&&!(dd&&rng()<.22)){
    const tr=lp-2.4,ty=hillAwnY(l,s,(tr-rl)/dep(s));
    kput('hiTrough',[...pol(tr,th,ty)],TAN(th),[TW/nb*1.02,1.5,3.2],
     new THREE.Color().setHSL(rr(.07,.11),rr(.03,.10),dd?rr(.26,.38):rr(.62,.78)));
    for(let q=0;q<2;q++)if(rng()<.78){const p=pol(tr+rr(-1,1),th+rr(-2,2)/tr,ty+1.4);
     kput('leafCard',[p[0],p[1]+1.1,p[2]],qEuler(rr(-.2,.2),rng()*TAU,rr(-.2,.2)),
      [rr(1.6,3.2),rr(1.1,2.2),rr(1.6,3.2)],leafC());nplant++;}}
   // planting spilling OVER the lip
   if(!(dd&&rng()<.15)){const p=pol(lp-.6,th,hillAwnY(l,s,1)-.3);
    kput('vine',[p[0],p[1],p[2]],qEuler(rr(-.16,.16),rng()*TAU,rr(-.16,.16)),
     [rr(.9,1.8),rr(4,dd?16:11),rr(.9,1.8)],null);nplant++;}
   // TREES AND SCRUB, counted off the OPEN AREA rather than off the bay. A fixed
   // count a bay gave a 90 m terrace the same dozen trees as a 10 m one, so the
   // deep terraces — which are the ones you can see into from anywhere — came
   // back as empty concrete fields.
   {const np=clamp(Math.round(open/15),0,5);
    for(let q=0;q<np;q++){const t=rr(.10,.88),r=fr+open*t;
     const p=pol(r,th+rr(-3,3)/r,hillAwnY(l,s,(r-rl)/dep(s)));
     if(!clearOf(p[0],p[2]))continue;
     if(rng()<.34){VEG.tree(p[0],p[1],p[2],(l+j+q)%3,rr(6,dd?15:11));nplant++;}
     else{const sc=rr(1.3,3.6);
      kput('leafCard',[p[0],p[1]+sc*.5,p[2]],qEuler(rng()*3,rng()*TAU,rng()*3),
       [sc*rr(.9,1.6),sc*rr(.55,1.1),sc*rr(.9,1.6)],leafC());nplant++;}}}
   if(open>9&&j%7===3&&!dd&&rng()<.7){const r=fr+open*rr(.2,.5),p=pol(r,th,hillAwnY(l,s,(r-rl)/dep(s)));
    person(p[0],p[1],p[2]);}
   // a prop under the lip where the plate cantilevers a long way past the one
   // below: structure, and the colonnade it makes is most of what reads from
   // underneath
   // The plate below is asked at ITS OWN lateral coordinate, not at this one:
   // the band walks sideways, so `s` means a different place a level down and a
   // prop sized from it stands on nothing.
   if(j%4===2&&l>0&&!(dd&&rng()<.35)){
    const rb=hillRad(l-1),sb=(th-hillAng(l-1))*rb;
    if(Math.abs(sb)<TW*.5){const db=hillDep(l-1,sb),r=lp-4;
     if(r>rb&&r<rb+db){
      const yb=hillAwnY(l-1,sb,(r-rb)/db),yt=hillAwnY(l,s,(r-rl)/dep(s))-1.3;
      if(yt-yb>2.4)kput('hiProp',[...pol(r,th,(yb+yt)*.5)],null,[1.5,yt-yb,1.5],tone());}}}
   // the terrace light line, tangent to the band
   if(!dd&&j%4===0){const r=lp-5;
    kput('strip',[...pol(r,th,hillAwnY(l,s,(r-rl)/dep(s))+.5)],TAN(th),[TW/nb*3.4,1.2,1.2],CYAN);}
   opLo=Math.min(opLo,open);opHi=Math.max(opHi,open);}
  // ---- the stepped route: one flight a level, walking along the band --------
  {const s=((l*37)%220)-110;
   if(!gone(s,lipR(s)-12,yl+2)&&!inCourt(l,s)&&hillDep(l,s)>16){
    const th=thOf(s),r=lipR(s)-13;
    kput('plyStair',[...pol(r,th,hillAwnY(l,s,(r-rl)/dep(s)))],
     qFacing([-Math.cos(th),0,-Math.sin(th)]),[6.5,RISE,10],tone());}}
  // ---- the ruin's rubble, banked against the riser it fell off -------------
  if(dd&&l%2===0){for(let k=0;k<5;k++){const s=rr(-TW*.5,TW*.5);
    if(inCourt(l,s)||inSlip(l,thOf(s)))continue;
    const r=rl+dep(s)*rr(.08,.5),th=thOf(s);
    const p=pol(r,th,hillAwnY(l,s,(r-rl)/dep(s)));const sz=rr(.7,2.6);
    kput('rubble',[p[0],p[1]+sz*.35,p[2]],qEuler(rng()*3,rng()*3,rng()*3),
     [sz*rr(.7,1.5),sz*rr(.5,1),sz*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.09),rr(.1,.35),rr(.3,.55)));}
   for(let k=0;k<4;k++){const s=rr(-TW*.5,TW*.5);
    if(inCourt(l,s)||inSlip(l,thOf(s)))continue;
    const r=rl+dep(s)*rr(.1,.9),th=thOf(s),sz=rr(.6,2.2);
    const p=pol(r,th,hillAwnY(l,s,(r-rl)/dep(s)));
    kput('moss',[p[0],p[1]+sz*.2,p[2]],qEuler(0,rng()*TAU,0),
     [sz*rr(.8,1.5),sz*rr(.2,.4),sz*rr(.8,1.5)],new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.05,.12)));}}
 }

 // ============================================================ THE CORES
 CORE.forEach((K,i)=>{
  const H=K.y1-K.y0, hole=dd?holeFn(.8,9673+i,null,1.6):null;
  SHL.push(lathe({rFn:y=>K.rad*(1-.05*y/H),H:H,flutes:10,amp:.05,sharp:2,nu:30,nv:9,hole:hole})
   .translate(K.x,K.y0,K.z));
  VD.push(lathe({rFn:()=>K.rad*.82,H:H,nu:16,nv:2}).translate(K.x,K.y0,K.z));
  // lid, or it is a tube you can see down
  SHL.push(gridSurface((u,v)=>{const th=u*TAU,r=K.rad*.98*(1-v);
    return[K.x+r*Math.cos(th),K.y0+H+(dd?-1.2:1.6)*(1-v),K.z+r*Math.sin(th)];},30,3,{uS:10,vS:4}));
  // three galleries and a band of openings on each, so a 52 m drum is not a silo
  for(let b=0;b<3;b++){const by=K.y0+H*(.26+b*.24);
   kput(dd?'ringR':'ringW',[K.x,by,K.z],qEuler(Math.PI/2,0,0),[K.rad*1.1,K.rad*1.1,2.6],null);
   for(let q=0;q<16;q++){const th=(q+.5)/16*TAU;
    if(dd&&rng()<.4)continue;
    kput(dd?'winD':'winI',[K.x+Math.cos(th)*(K.rad+.2),by+5.5,K.z+Math.sin(th)*(K.rad+.2)],
     FACE(th),[1.1,1.3,1],null);
    if(!dd&&q%4===0)kput('plyAwn',[K.x+Math.cos(th)*(K.rad+.5),by+3.4,K.z+Math.sin(th)*(K.rad+.5)],
     FACE(th),[3.4,1.2,1.8],tone());}}
  if(!dd){for(let q=0;q<16;q++){const th=(q+.5)/16*TAU,L=TAU*K.rad/16*.9;
    kput('strip',[K.x+Math.cos(th)*K.rad*1.01,K.y0+H-3,K.z+Math.sin(th)*K.rad*1.01],
     TAN(th),[L,1.2,1.2],CYAN);}
   kput('finial',[K.x,K.y0+H+5,K.z],null,[2.6,4.4,2.6],null);}
  else{kput('ringR',[K.x,K.y0+H-2,K.z],qEuler(Math.PI/2,0,0),[K.rad,K.rad,3],null);
   vinesOnRing(K.x,K.y0+H-2,K.z,K.rad,10,14);}});

 // ============================================================ THE ANTECHAMBER
 // Levels 0-8 are cut away over a 170 m window (see courtWin): an open forecourt
 // 95 m deep with eight levels of overhanging awnings down each side, a
 // five-arch portal at its head, and a vaulted hall 130 m deep behind it, under
 // the city. The court floor runs the FULL width of the band and sits 0.6 m
 // below the terrace decks: level 0's plate is at y=60 over the same ground, and
 // two coplanar surfaces z-fight.
 {const thC=THALL,HW=HHW,hy=C.Y0,rM=R0,rB=C.HALLR,aw=HW/rM;
  const vaultY=(u,v)=>hy+9+6*v+19*Math.pow(Math.sin(Math.PI*u),.8);   // crown y = 94
  // the court floor, over the FULL width of the band
  PV.push(gridSurface((u,v)=>{const r=lerp(rM-2,C.COURTR,v);
    const l=clamp(hillLev(r),0,NL-1);
    return pol(r,hillAng(l)+(u-.5)*TW/r,C.CFY);},22,12,{uS:30,vS:20}));
  // the portal wall, with five arched openings in it
  const portHole=(u,y)=>{for(let k=0;k<5;k++){const uk=(k+.5)/5;
    const hw=.068*(y>78?Math.sqrt(clamp(1-Math.pow((y-78)/9,2),0,1)):1);
    if(Math.abs(u-uk)<hw)return true;}return false;};
  const portTop=u=>84+8*Math.pow(Math.sin(Math.PI*clamp(u,0,1)),.6);
  WL.push(gridSurface((u,v)=>{const th=thC+(u-.5)*2*aw;
    return pol(rM,th,lerp(C.CFY,portTop(u),v));},30,14,
   {uS:22,vS:5,hole:(u,v)=>portHole(u,lerp(C.CFY,portTop(u),v))||(dd&&fbm(u*9,v*7,9674,2)<.30)}));
  // reveals: without them 7 m of fabric reads as card. Arcoindian I's lesson.
  const opW=.136*C.HALLW;                                   // 23 m clear per opening
  for(let k=0;k<5;k++){const uk=(k+.5)/5,th=thC+(uk-.5)*2*aw;
   for(let e=-1;e<=1;e+=2)
    kput('hiBox',[...pol(rM-3.6,th+e*.068*2*aw,hy+9.5)],TAN(th),[2.6,19,7.2],tone());
   kput('hiBox',[...pol(rM-3.6,th,hy+27.6)],TAN(th),[opW+5,3.2,7.2],tone());
   if(!dd)kput('strip',[...pol(rM-7.6,th,hy+19)],TAN(th),[opW*.8,1.4,1.4],CYAN);}
  // the hall: floor, barrel vault, back wall, two side walls
  PV.push(gridSurface((u,v)=>pol(lerp(rM,rB,v),thC+(u-.5)*2*aw,hy),20,14,{uS:22,vS:18}));
  SO.push(gridSurface((u,v)=>pol(lerp(rM,rB,v),thC+(u-.5)*2*aw,vaultY(u,v)),28,16,
   {uS:22,vS:18,hole:dd?(u,v)=>fbm(u*7,v*6,9675,2)<.30:null}));
  // The back wall, with nine niches cut into it. A 170 m sheet of pale concrete
  // at the end of a 130 m hall is the same failure as a cliff face with no
  // reveals in it: without a depth cue there is nothing to say how far away it
  // is. The niches are punched out of the wall and lined 6 m behind it.
  const nich=(u,y)=>{const q=(u*9)%1;return q>.30&&q<.70&&y>hy+3&&y<hy+21;};
  WL.push(gridSurface((u,v)=>pol(rB,thC+(u-.5)*2*aw,hy+v*(vaultY(u,1)-hy)),36,10,
   {uS:22,vS:5,hole:(u,v)=>nich(u,hy+v*(vaultY(u,1)-hy))}));
  VD.push(gridSurface((u,v)=>pol(rB-6,thC+(u-.5)*2*aw,hy+v*24),36,4,
   {uS:22,vS:3,hole:(u,v)=>!nich(u,hy+v*24)}));
  for(let k=0;k<9;k++){const th=thC+((k+.5)/9-.5)*2*aw;
   if(!dd)kput('strip',[...pol(rB-2,th,hy+20)],TAN(th),[2*aw*rB/9*.38,1.4,1.4],CYAN);
   if(dd&&rng()<.6)continue;
   kput(dd?'colR':'colW',[...pol(rB-1.2,th,hy)],null,[1.5,12,1.5],null);}
  for(let e=-1;e<=1;e+=2)WL.push(gridSurface((u,v)=>
    pol(lerp(rM,rB,u),thC+e*aw,hy+v*(9+6*u)),16,3,{uS:18,vS:3}));
  // twelve monumental columns in two rows, with capitals
  for(let k=0;k<6;k++)for(let e=-1;e<=1;e+=2){
   const r=lerp(rM-22,rB+18,k/5),th=thC+e*aw*.46;
   if(dd&&rng()<.22){kput('rubble',[...pol(r,th,hy+2.4)],qEuler(rng()*3,rng()*3,rng()*3),[7,4,7],
     new THREE.Color().setHSL(.07,.2,.42));continue;}
   kput(dd?'colR':'colW',[...pol(r,th,hy)],null,[4.6,19,4.6],null);
   kput(dd?'slabCR':'slabC',[...pol(r,th,hy+19.4)],null,[6.4,1.6,6.4],null);}
  // The grand stair up into the city, in the middle of the hall rather than
  // against the back wall — it climbs to a landing at the springing of the vault
  // and the city carries on above that. Eighteen risers of 1.2 m read as a
  // stair; nine of 2.4 read as a stack of slabs.
  for(let k=0;k<18;k++){const r=lerp(rB+34,rB+6,k/17);
   kput(dd?'boxCR':'boxC',[...pol(r,thC,hy+k*1.2+.6)],TAN(thC),[52-k*.8,1.2,3.2],null);}
  for(let e=-1;e<=1;e+=2)for(let k=0;k<6;k++){const r=lerp(rB+34,rB+6,k/5);
   kput(dd?'colR':'colW',[...pol(r,thC+e*(27-k*2.4)/rB,hy+2)],null,[1.8,10+k*1.2,1.8],null);}
  // the court: kerbs, planting and people, in BOTH states — a registered volume
  // whose only contents are merged surfaces has no probe points in it at all.
  for(let k=0;k<16;k++){const r=lerp(rM+14,C.COURTR-18,(k+.5)/16);
   for(let e=-1;e<=1;e+=2){const th=thC+e*(TW*.34)/r;
    if(dd&&rng()<.35)continue;
    kput('hiBox',[...pol(r,th,C.CFY+.5)],TAN(th),[2.6,1,15],tone());
    if(rng()<.62)VEG.tree(...pol(r,th+e*6/r,C.CFY+1),k%3,rr(7,dd?16:12));}}
  if(dd){for(let k=0;k<80;k++){const r=rr(rB+4,C.COURTR-20),th=thC+rr(-1,1)*(TW*.44)/r;
    const sz=rr(.9,4.4);
    kput('rubble',[...pol(r,th,(r<rM?hy:C.CFY)+sz*.35)],qEuler(rng()*3,rng()*3,rng()*3),
     [sz*rr(.7,1.6),sz*rr(.5,1),sz*rr(.7,1.6)],new THREE.Color().setHSL(rr(.05,.09),rr(.1,.3),rr(.3,.52)));}}
  else{for(let k=0;k<7;k++){const th=thC+((k+.5)/7-.5)*1.7*aw;
    kput('strip',[...pol(rB+2,th,hy+26)],TAN(th),[26,1.5,1.5],CYAN);}
   for(let k=0;k<22;k++)person(...pol(rr(rB+6,rM-6),thC+rr(-.9,.9)*aw,hy));
   for(let k=0;k<14;k++)person(...pol(rr(rM+8,C.COURTR-26),thC+rr(-1,1)*aw,C.CFY));}
  // THE APPROACH: a 655 m ramp off the plain at 9 per cent, on its own
  // embankment. Narrow — 96 m at the court and fanning to 150 at the bottom —
  // because the first cut was the full width of the band and read as a runway.
  PV.push(gridSurface((u,v)=>{const r=lerp(C.COURTR,C.RAMPR,v),hw=lerp(48,75,Math.pow(v,.7));
    return pol(r,thC+(u-.5)*2*(hw/r),hillFloorR(r)+.3);},8,18,{uS:14,vS:60}));
  for(let e=-1;e<=1;e+=2)GR.push(gridSurface((u,v)=>{const r=lerp(C.COURTR,C.RAMPR,u);
    const hw=lerp(48,75,Math.pow(u,.7)),fl=hillFloorR(r),th=thC+e*(hw+2.4*fl*v)/r;
    return pol(r,th,lerp(fl+.3,Math.min(fl,hillNat(r,th)),Math.pow(v,.75)));},18,5,{uS:40,vS:14}));
  // a balustrade up both sides of it, which is most of what says "ramp" at
  // 2 km, and a light line down one side
  for(let k=0;k<26;k++){const v=(k+.5)/26,r=lerp(C.COURTR,C.RAMPR,v);
   const hw=lerp(48,75,Math.pow(v,.7)),fl=hillFloorR(r);
   for(let e=-1;e<=1;e+=2){if(dd&&rng()<.35)continue;
    // the ramp runs RADIALLY, so under TAN (local +x tangent, +z radial) its
    // balustrade takes its length on z, not on x
    kput('hiBox',[...pol(r,thC+e*hw/r,fl+1.6)],TAN(thC),[2.2,2.4,(C.RAMPR-C.COURTR)/26*1.03],tone());}
   if(!dd&&k%2===0)kput('strip',[...pol(r,thC-hw/r*.93,fl+3.2)],
     qFacing([-Math.sin(thC),0,Math.cos(thC)]),[18,1.3,1.3],CYAN);}}

 // ============================================================ THE LANDSLIP
 if(dd){
  const rTop=hillRad(SL.l1),rBot=hillRad(SL.l0)+80;
  // the scooped rock the terraces came off
  RK.push(gridSurface((u,v)=>{const r=lerp(rTop-14,rBot,v);
    const dt=(u-.5)*2*slipHW(clamp(hillLev(r),SL.l0,SL.l1));
    return pol(r,SL.th+dt,hillTLr(r)-7-11*Math.sin(Math.PI*v)*Math.cos(dt*7));},16,18,{uS:22,vS:26}));
  // its headwall, and the torn ends of every level it cut through
  RK.push(gridSurface((u,v)=>{const dt=(u-.5)*2*slipHW(SL.l1);
    return pol(rTop-14+v*6,SL.th+dt,lerp(hillTLr(rTop-14)-7,hillDeckY(SL.l1+1)+6,1-v));},14,4,{uS:20,vS:6}));
  for(let l=SL.l0;l<=SL.l1;l++){const rl=hillRad(l);
   for(let e=-1;e<=1;e+=2){const th=SL.th+e*slipHW(l);
    VD.push(gridSurface((u,v)=>pol(rl+u*hillDep(l,(th-hillAng(l))*rl),th,
      hillDeckY(l)+v*(RISE+.3)-1.3),6,2,{uS:6,vS:.6}));}}
  // the debris. Which terraces it landed on is COMPUTED: the band wanders ~30 m
  // a level, so the terraces twenty levels down are 600 m sideways and a
  // level-local drop would put the spoil in mid-air over the hillside.
  let hit=0;
  for(let l=SL.l0-2;l>=0;l--){let dt=SL.th-hillAng(l);
   while(dt>Math.PI)dt-=TAU;while(dt<-Math.PI)dt+=TAU;
   if(Math.abs(dt)>hillHalf(l)+.03)continue;
   hit++;const s=dt*hillRad(l);
   for(let k=0;k<26;k++){const ss=s+rr(-70,70);
    if(Math.abs(ss)>TW*.5)continue;
    const r=hillRad(l)+hillDep(l,ss)*rr(.05,.8),th=hillAng(l)+ss/hillRad(l);
    const p=pol(r,th,hillAwnY(l,ss,clamp((r-hillRad(l))/hillDep(l,ss),0,1)));
    const sz=rr(1.2,5.4);
    kput('rubble',[p[0],p[1]+sz*.4,p[2]],qEuler(rng()*3,rng()*3,rng()*3),
     [sz*rr(.7,1.6),sz*rr(.5,1.1),sz*rr(.7,1.6)],new THREE.Color().setHSL(rr(.05,.09),rr(.08,.3),rr(.28,.5)));}
   if(hit>=6)break;}
  // Slabs off the terraces themselves, lying in the scar and on the slope below
  // it. Rubble alone reads as scree; what says a BUILDING came down is pieces of
  // floor plate the size of a tennis court lying at an angle.
  for(let k=0;k<46;k++){const t=rng();
   const r=lerp(rTop-20,C.RTOE-360,Math.pow(t,.7));
   const th=SL.th+rr(-1,1)*(.055+t*.11);
   const y=Math.abs(hillCorr(r,th))<1.1?hillTLr(r)-9:hillNat(r,th);
   const w=rr(9,34);
   kput(BOXC(1),[r*Math.cos(th),y+rr(.4,3),r*Math.sin(th)],
    qEuler(rr(-.7,.7),rng()*TAU,rr(-.7,.7)),[w,rr(.8,1.6),w*rr(.5,1.2)],
    new THREE.Color().setHSL(rr(.06,.1),rr(.02,.09),rr(.62,.86)));}
  // and the fan that carried on down the bare hillside
  for(let k=0;k<340;k++){const r=rr(hillRad(SL.l0)+40,C.RTOE-160);
   const th=SL.th+rr(-1,1)*(.05+(r-hillRad(SL.l0))*.00019);
   if(Math.abs(hillCorr(r,th))<1.1)continue;
   const y=hillNat(r,th),sz=rr(.8,4.2);
   kput('rubble',[r*Math.cos(th),y+sz*.35,r*Math.sin(th)],qEuler(rng()*3,rng()*3,rng()*3),
    [sz*rr(.7,1.6),sz*rr(.5,1),sz*rr(.7,1.6)],new THREE.Color().setHSL(rr(.05,.09),rr(.08,.3),rr(.26,.48)));}}

 // ============================================================ THE HILLSIDE
 // Planting on the natural slope, rejected where it would stand in the cut. Not
 // sampled off the geometry: upFaces/ledgePoints are area-weighted, and with 111
 // terraces of wildly different size that puts nearly every plant on the one
 // biggest plate. Everything here is scattered per surface, deliberately.
 {const n=dd?3400:2500;
  for(let k=0;k<n;k++){const r=Math.sqrt(lerp(Math.pow(C.RSUM+40,2),Math.pow(C.RTOE+120,2),rng()));
   const th=rng()*TAU;
   if(Math.abs(hillCorr(r,th))<1.6)continue;
   const x=r*Math.cos(th),z=r*Math.sin(th),y=hillNat(r,th);
   const t=clamp((C.RTOE-r)/900,0,1);                       // thins toward the summit
   if(rng()>.35+.65*t)continue;
   if(rng()<.52)VEG.tree(x,y,z,k%3,rr(6,dd?17:13));
   else{const sz=rr(1.6,4.2);
    kput('leafCard',[x,y+sz*.5,z],qEuler(rng()*3,rng()*TAU,rng()*3),
     [sz*rr(.9,1.5),sz*rr(.55,1),sz*rr(.9,1.5)],leafC());}}
  for(let k=0;k<560;k++){const r=Math.sqrt(lerp(Math.pow(C.RSUM,2),Math.pow(C.RTOE+200,2),rng()));
   const th=rng()*TAU;
   if(Math.abs(hillCorr(r,th))<1.35)continue;
   const sz=rr(1.4,7.5);
   kput('rubble',[r*Math.cos(th),hillNat(r,th)+sz*.3,r*Math.sin(th)],
    qEuler(rng()*3,rng()*3,rng()*3),[sz*rr(.7,1.6),sz*rr(.4,.9),sz*rr(.7,1.6)],
    new THREE.Color().setHSL(rr(.055,.095),rr(.08,.28),rr(.3,.52)));}}

 // ============================================================ THE ROOF CITY, LAID OUT
 // Twelve Ancient buildings on the summit. Measured, not eyeballed: the Wheel
 // registers r=250, so the three towers stand at 320 -- their own footprint is
 // r=46*slim, NOT the r=120 of the podium they are not given -- and the office,
 // apartment and civic ring runs 420-500 with its outermost ruin dressing at 650
 // against a 660 m rim. The two rows are compound builders whose three buildings
 // run along local +x, so they are laid tangentially; hillPlace turns them.
 // Laid out HERE, before the plaza is planted, so the planting can keep off the
 // plots. Built at the bottom of the builder, after the merges, because every
 // one of them reseeds and would otherwise take this builder's stream with it.
 const SMY=C.SUMY,X=gx,Z=gz;
 const rowYaw=a=>Math.atan2(-Math.cos(a),-Math.sin(a));
 const tg=a=>[-Math.sin(a),Math.cos(a)];
 const roof=[],PLOT=[[0,0,300]];                       // the Wheel's own plot
 roof.push(['cult',0,0,0,()=>buildCultural(scene,X,Z,d)]);
 for(let k=0;k<3;k++){const a=Math.PI/2+k*TAU/3;
  const tx=Math.cos(a)*C.TWR,tz=Math.sin(a)*C.TWR,hc=[.55,.78,.66][k];
  PLOT.push([tx,tz,52]);
  roof.push(['skyF',tx,tz,0,()=>buildSkyF(scene,X+tx,Z+tz,d,SMY,true,hc,C.SLIM),true]);}
 const rowAt=(a,rad,mid,key,fn,plots)=>{const P=[Math.cos(a)*rad,Math.sin(a)*rad],t=tg(a);
  const O=[P[0]-t[0]*mid,P[1]-t[1]*mid];
  for(const p of plots)PLOT.push([O[0]+t[0]*p[0],O[1]+t[1]*p[0],p[1]]);
  roof.push([key,O[0],O[1],rowYaw(a),()=>fn(X+O[0],Z+O[1])]);};
 rowAt(Math.PI/6,455,162.5,'off',(x,z)=>buildOffices(scene,x,z,d),[[0,96],[190,58],[330,92]]);
 rowAt(Math.PI*5/6,455,180,'apt',(x,z)=>buildApartments(scene,x,z,d),[[0,80],[150,112],[340,102]]);
 {const a=Math.PI*1.5,O=[Math.cos(a)*420,Math.sin(a)*420];PLOT.push([O[0],O[1],200]);
  roof.push(['gov',O[0],O[1],Math.atan2(Math.sin(a),-Math.cos(a)),
   ()=>buildGovernment(scene,X+O[0],Z+O[1],d)]);}
 {const a=Math.PI/2,O=[Math.cos(a)*490,Math.sin(a)*490];PLOT.push([O[0],O[1],150]);
  roof.push(['amph',O[0],O[1],rowYaw(a),()=>buildAmphitheater(scene,X+O[0],Z+O[1],d)]);}
 {const a=Math.PI*7/6,O=[Math.cos(a)*500,Math.sin(a)*500];
  PLOT.push([O[0],O[1],110]);PLOT.push([O[0]-Math.sin(a)*74,O[1]+Math.cos(a)*74,40]);
  roof.push(['lib',O[0],O[1],rowYaw(a),()=>buildLibrary(scene,X+O[0],Z+O[1],d)]);}
 {const a=Math.PI*11/6,O=[Math.cos(a)*500,Math.sin(a)*500];PLOT.push([O[0],O[1],150]);
  roof.push(['hosp',O[0],O[1],rowYaw(a),()=>buildHospital(scene,X+O[0],Z+O[1],d)]);}

 // ============================================================ THE SUMMIT
 // Paving, a rim parapet broken where the ribbon arrives, a belvedere over the
 // head of the city, and the grand stair down onto the top terraces.
 {const SY=C.SUMY,RS=C.RSUM,thTop=hillAng(NL-1);
  for(let k=0;k<112;k++){const th=(k+.5)/112*TAU;
   if(Math.abs(hillCorr(RS,th))<1.15)continue;
   if(dd&&rng()<.3)continue;
   kput('hiBox',[...pol(RS-3,th,SY+1.3)],TAN(th),[TAU*RS/112*1.02,2.6,3.4],tone());}
  // the belvedere: a bastion pushed out over the head of the ribbon
  PV.push(gridSurface((u,v)=>{const th=thTop+(u-.5)*.34,r=lerp(RS-30,RS+52,v);
    return pol(r,th,SY-1.4*v*v);},16,6,{uS:20,vS:12}));
  SO.push(gridSurface((u,v)=>{const th=thTop+(u-.5)*.34,r=lerp(RS+8,RS+52,v);
    return pol(r,th,SY-2.4-9*Math.pow(v,1.6));},16,4,{uS:20,vS:8}));
  for(let k=0;k<12;k++){const th=thTop+((k+.5)/12-.5)*.34;
   kput('hiProp',[...pol(RS+46,th,SY-14)],null,[2.2,26,2.2],tone());}
  // the grand stair off the plateau onto level 110
  for(let k=0;k<5;k++){const r=RS-6+k*3.4;
   kput(dd?'boxCR':'boxC',[...pol(r,thTop,SY-1.1-k*1.1)],TAN(thTop),[70,1.1,3.4],null);}
  if(!dd){for(let k=0;k<26;k++){const th=(k+.5)/26*TAU;
    if(Math.abs(hillCorr(RS,th))<1.15)continue;
    kput('strip',[...pol(RS-6,th,SY+3.1)],TAN(th),[TAU*RS/26*.8,1.4,1.4],CYAN);}
   for(let k=0;k<30;k++){const th=rng()*TAU,r=rr(RS*.4,RS-20);
    person(r*Math.cos(th),SY+3*Math.pow(1-r/RS,2),r*Math.sin(th));}}
  // plaza planting, kept off the building plots laid out above
  for(let k=0;k<(dd?900:700);k++){const th=rng()*TAU,r=Math.sqrt(rng())*(RS-26);
   const x=r*Math.cos(th),z=r*Math.sin(th);
   let bad=Math.abs(hillCorr(RS,th))<1.3&&r>RS-70;
   for(const P of PLOT)if(Math.hypot(x-P[0],z-P[1])<P[2])bad=true;
   if(bad)continue;
   const y=SY+3*Math.pow(1-r/RS,2);
   if(rng()<.42)VEG.tree(x,y,z,k%3,rr(7,dd?18:13));
   else{const sz=rr(1.6,4);
    kput('leafCard',[x,y+sz*.5,z],qEuler(rng()*3,rng()*TAU,rng()*3),
     [sz*rr(.9,1.5),sz*rr(.55,1),sz*rr(.9,1.5)],leafC());}}}

 // ---- bake the merged shells ------------------------------------------------
 meshMerged(SO,soffM,G);meshMerged(SHL,shell,G);meshMerged(DK,deckM,G);
 meshMerged(GD,dd?MAT.hillTurfR:MAT.hillTurf,G);
 meshMerged(WL,wallM,G);meshMerged(VD,MAT.hillVoid,G);
 meshMerged(RK,cutM,G);meshMerged(GR,slopeM,G);meshMerged(PV,paveM,G);

 // ============================================================ THE ROOF CITY, BUILT
 // Each entry is run through hillPlace, which charges it to its own type key and
 // then lifts and turns whatever it emitted. The three Skyscraper F take gy and
 // noPlinth natively so they pass lift 0 and are only re-keyed -- and note that
 // `slim` is a PLAN SCALE: the tray grids are still 96 segments, so three slim
 // towers cost exactly what three fat ones would. That number is measured, not
 // assumed, in the hand-back.
 // The key carries the decay, exactly as 90-scene.js's own does: without it both
 // decay states of a roof building pile into one key and the type reads as twice
 // its own size against its ceiling.
 for(const R of roof)hillPlace(R[4],X+R[1],Z+R[2],R[3],R[5]?0:SMY,R[0]+'/'+d);

 // ---- what was actually built, for the presets and the hand-back ------------
 HILL_SITE[d]={x:gx,z:gz,d:d,C:C,
  NL:NL,H:C.SUMY,TW:TW,levels:NL,
  dep:[dpLo,dpHi],vary:[varLo,varHi],open:[opLo,opHi],deckArea:area,plants:nplant,
  th0:hillAng(0),thTop:hillAng(NL-1),thHall:THALL,
  hall:{r0:C.HALLR,r1:R0,y:C.Y0,top:94,th:THALL,w:C.HALLW,court:C.COURTR},
  core:CORE.map(K=>({x:K.x,z:K.z,y0:K.y0,y1:K.y1,l:K.l,s:K.s,rad:K.rad})),
  sta:STA.map(o=>({l:o.l,s:o.s,open:o.open,face:o.face,lip:o.lip,dep:o.dep})),
  awn:{l:AWN.l,s:AWN.s,over:AWN.over},hair:HAIR.slice(),
  slip:{l0:SL.l0,l1:SL.l1,th:SL.th,r0:hillRad(SL.l1),r1:hillRad(SL.l0),
   y0:hillDeckY(SL.l0),y1:hillDeckY(SL.l1)},
  sum:{y:C.SUMY,r:C.RSUM,twr:C.TWR,slim:C.SLIM,
   tw:[0,1,2].map(k=>{const a=Math.PI/2+k*TAU/3;
    return[Math.cos(a)*C.TWR,Math.sin(a)*C.TWR];})},
  toe:C.RTOE};
 KOFF=[0,0,0];return G;}
