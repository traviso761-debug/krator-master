// ================================================================= LAUNCH ARCOLOGY — "the city that meant to leave"
// SimCity 2000's Launch Arcology is the one that is also a VEHICLE: a self
// contained city built round a launch structure, designed to leave. So the
// whole builder is one argument between two readings of the same mass, and it
// only works if BOTH are true at once —
//
//   the vehicle : a flared blast skirt over a flame pit, seven bells on a
//                 thrust plug, a hexagonal deflector splitting the efflux into
//                 six radial trenches, sixteen stringers running the full
//                 height of a tapered body, a payload shroud for a crown;
//   the city    : occupied storeys with windows on a 7.4 m pitch, six
//                 projecting terraces with parapets, doors and glazed
//                 galleries, and six umbilical arms that are ALSO the way
//                 anybody gets in or out.
//
// The last of those is the hinge. A launch tower's umbilicals are the only
// things bridging 120 m of open air between the gantry masts and the body, so
// in an arcology they have to be the front door. Once they are, the gantry
// stops being scenery and becomes the city's access spine, and the structure
// reads as inhabited without giving up a single launch feature.
//
// GEOMETRY, bottom to top (metres, y up):
//
//   berm      r 520..668, y 30..0, two ramps up it on the spine bearings
//   apron     r 258..520 at y=30, plan a hexagon softened 25% toward a circle
//   flame pit out to r=240 at y=4, ringed by a wall the trenches break through
//   trenches  six, on the hexagon's CORNERS (bearings 0, 60, ... 300), 92 m
//             wide, 26 m deep, running r 240..478 and ending in a quarter-round
//             deflector scoop that turns the efflux up and crests on the berm
//   deflector a six-faced cone on the axis, one face per trench
//   skirt     rim r=242 at y=44 — HELD 14 m CLEAR OF THE APRON by twelve
//             hold-down clamps, because a thing meant to leave does not rest
//             on its pad; it is held down on it
//   plug      r 0..150 at y=94, carrying seven bells down to y=52
//   body      y 88..600, r 116.8 -> 58, sixteen stringers, cornice bands every
//             32 m, six terraces at 152/228/304/380/456/532
//   collar    a gantry ring r 268..330, three decks at y=316/350/384, carried
//             on six lattice masts at r=364 that run to y=428. The inner radius
//             is set by the SKIRT (242), not by the body (123) — see the plan.
//   shroud    y 600..800 barrel-then-ogive, four panels on explosive-latch
//             bands, a pilot mast to y=838
//
// The masts, the collar and the service-tower ring stand in the scene group G
// and stay upright. Everything from the skirt up lives in a second group P, so
// the ruin can be what it has to be:
//
// THE RUIN (d=1) is an arcology that went, and came back down. P is tilted
// 0.042 rad (2.4 deg) about the horizontal axis normal to bearing 30 deg,
// pivoted on the throat at y=88, which puts the shroud tip 23 m off the axis
// and drops the skirt rim 10 m onto its own apron. Everything else follows
// from that one number: the apron is cratered where the rim came through it,
// the four hold-downs nearest the lean are sheared to stumps, the mast on that
// bearing is buckled at y=210 with its head on the pad, the collar ring is
// gone through a 71 deg sector, the body carries a gash where the ring cut
// into it, the bottom 36 m of the body is crumpled into the throat, and two of
// the four shroud panels are gone — one of them lying 760 m out on the plain.
//
// Everything is measured, nothing is drawn by eye: the lean is applied by one
// quaternion about one pivot, and BWP() reproduces that same transform so the
// umbilical arms and access bridges can be aimed at the body's ACTUAL leaned
// position rather than at where it used to be.
//
// NOTE ON THE SEED BLOCK. The brief asked for the 9500 block on the grounds
// that it was free. It is not: buildOffices in src/42-offices.js already claims
// 9500 and 9501, and build.py rejects the overlap. The 9510 block is taken too,
// by src/88-plymouth.js. This builder therefore claims 9520..9522, and its
// fbm/holeFn noise offsets live in the same block so the two stay together.
// (Spelling a rejected seed call out literally in a comment would be a trap of
// its own — build.py's reseed scan does not skip comments.)
// The apron. Held well DOWN in value: at 0x9c9285 — the first value — a quarter
// of a square kilometre of paving came back the same white as the vehicle
// standing on it, and the skirt, the clamps and the masts all disappeared into
// their own ground. The structure is the white thing; the table is not.
MAT.lxDeck=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x6e665b,roughness:1,metalness:0,side:DS});
MAT.lxDeckR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x4c453c,roughness:1,metalness:0,side:DS});
// The blast-exposed fabric: pit floor, trench, deflector, scoops. Board-formed
// concrete that has had flame on it. MAT.dark would be flat and would lose the
// board grain, which is the one thing that keeps 200 m of trench from reading
// as a painted slot.
// Scorch has to be MUCH darker than it looks on the swatch, and then darker
// again. The trench floor takes the full sun plus a .75 hemisphere and ACES
// lifts what is left, so 0x3c352e rendered as mid-grey paving and 0x231e19 as
// pale concrete. 0x16120e is the third value and the first that reads as
// burnt. Measured off the render each time, never off the swatch.
MAT.lxScorch=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x16120e,roughness:1,metalness:0,side:DS});
MAT.lxScorchR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x0f0c0a,roughness:1,metalness:0,side:DS});
// Grey structural steel: the bells, the gantry decks, the catwalk grating.
// Distinct from SHELL()'s white panelled skin on purpose — the machinery and
// the ground works are not the same thing as the city's cladding.
//
// METALNESS IS HELD AT ~.5, not 1. There is no environment map in this scene,
// so a fully metallic surface has no diffuse term and nothing to reflect: the
// gantry's deck SOFFITS — 60 m annuli seen from directly underneath, which is
// the whole of the "up the body" view — came back as flat brown, picking up
// only the hemisphere's ground colour. Halving the scalar the packed map
// multiplies puts the diffuse back and the soffits read as steel again.
MAT.lxBell=new THREE.MeshStandardMaterial({map:TEX.panel,roughnessMap:TEX.panelRM,metalnessMap:TEX.panelRM,color:0x9a9288,roughness:1,metalness:.5,side:DS});
MAT.lxBellR=new THREE.MeshStandardMaterial({map:TEX.rust,roughnessMap:TEX.rustRM,metalnessMap:TEX.rustRM,color:0x9a836a,roughness:1,metalness:.42,side:DS});
// BOUNCE LIGHT, PAINTED. Everything on this vehicle that faces DOWN — the
// collar soffits, the plug ceiling, the terrace undersides, the skirt's
// inside — sees only the hemisphere light's ground colour (0x6a3a2a) and no
// shadows, so it came back warm brown whatever its albedo: halving lxBell's
// metalness was mitigation, not a fix. This adds, to any surface whose world
// normal points down, a NEUTRAL bounce equal to the LUMINANCE of that same
// ground term times 1.7 — the light a pale apron throws back up. Keying it to
// the hemisphere uniform rather than a constant means it follows setNight()
// with nothing to keep in sync: the ground term dims, and so does the bounce.
// Injected after emissivemap_fragment, where `normal` is final and already
// flipped for back faces, so DoubleSide soffits get it on the side you see.
// (No pow/sqrt here: nothing for SwiftShader to swallow a NaN from.)
// The strength is a UNIFORM, not a literal: three.js keys compiled programs on
// onBeforeCompile's source text, so a literal would make every caller share the
// first caller's value. onBeforeCompile still runs once per material, so each
// material carries its own lxK.
function lxBounce(m,k){const K=k||1.7;m.onBeforeCompile=sh=>{sh.uniforms.lxK={value:K};
 sh.fragmentShader='uniform float lxK;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>',
 '#include <emissivemap_fragment>\n#if NUM_HEMI_LIGHTS > 0\n{vec3 lxN=inverseTransformDirection(normal,viewMatrix);'+
 'float lxL=dot(hemisphereLights[0].groundColor,vec3(.2126,.7152,.0722));'+
 'totalEmissiveRadiance+=diffuseColor.rgb*vec3(.94,1.,1.05)*(lxL*lxK*clamp(-lxN.y,0.,1.));}\n#endif');};return m;}
lxBounce(MAT.lxBell);lxBounce(MAT.lxBellR);
// the vehicle's own copies of the white skin and its plate, so the bounce is
// this type's alone and every other SHELL() in the kit renders as before
MAT.lxSkin=lxBounce(MAT.white.clone());MAT.lxSkinR=lxBounce(MAT.rust.clone());
kdef('lxPlate',new THREE.BoxGeometry(1,1,1),MAT.lxSkin); kdef('lxPlateR',new THREE.BoxGeometry(1,1,1),MAT.lxSkinR);
kdef('lxGrate',new THREE.BoxGeometry(1,1,1),MAT.lxBell); kdef('lxGrateR',new THREE.BoxGeometry(1,1,1),MAT.lxBellR);
kdef('lxPad',new THREE.CylinderGeometry(1,1,1,28),MAT.lxDeck); kdef('lxPadR',new THREE.CylinderGeometry(1,1,1,28),MAT.lxDeckR);
// The key dimensions of each decay level, written by the builder and read by
// targets/launch/91z-views.js. The camera presets are then DERIVED — "stand on
// terrace 3 at bearing 40 deg" resolves through the same rB()/BWP() the
// geometry used, so a preset cannot go stale when a constant moves.
const LXSITE={};

// `pad` builds the SITE WITHOUT THE VEHICLE — the blast table, trenches,
// deflector, clamps, masts, collar, service towers and tank farm standing
// empty. It is the same ground works from the same seed, so an empty pad and
// an occupied one are the same pad; only group P is skipped.
function buildLaunch(scene,gx,gz,d,pad){reseed(9520+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0;
 const skin=dd?MAT.lxSkinR:MAT.lxSkin,deckM=dd?MAT.lxDeckR:MAT.lxDeck,scorchM=dd?MAT.lxScorchR:MAT.lxScorch,
       bellM=dd?MAT.lxBellR:MAT.lxBell;
 const BX=BOXC(d),PL=dd?'lxPlateR':'lxPlate',GRT=dd?'lxGrateR':'lxGrate',PAD=dd?'lxPadR':'lxPad',
       PN=dd?'paneD':'pane',PIPE=dd?'pipeR':'pipe',COLN=dd?'colR':'colW';
 const SH=[],DKG=[],FLR=[],BEL=[],GRD=[],SCO=[],MND=[],STL=[];
 // qEuler(0,-th,0) points a kit item's local +X straight out along the radius.
 // Anything meant to RUN ALONG a ring — a parapet block, a light strip — needs
 // the tangent instead, or the ring reads as a comb of spokes.
 const TAN=th=>qEuler(0,-th-Math.PI/2,0);
 // BEAM CROSS-SECTIONS, MEASURED. beam(name,a,b,w,dp) scales the kit box to
 // [w, L, dp] and aims local +Y from a to b with setFromUnitVectors. For a
 // HORIZONTAL beam that rotation carries local X onto the VERTICAL and leaves
 // local Z lateral — so w is the beam's DEPTH and dp is its WIDTH, which is the
 // opposite of what it reads like. Checked by composing the same matrix in the
 // page: for a beam along +x, w=9 maps to (0,-9,0) and dp=4.6 to (0,0,4.6).
 // Getting it backwards made the 175 m access bridges 9 m tall and 4.6 m wide
 // (a camera put on one was inside a box) and the apron's expansion joints 2.6 m
 // walls. Square sections are unaffected, which is most of the lattice work.
 const wrapA=a=>{let x=a;while(x>Math.PI)x-=TAU;while(x<-Math.PI)x+=TAU;return x;};
 const litC=(on,lo,hi)=>on?CYAN.clone().multiplyScalar(rr(lo,hi)):DEAD;
 // rubbleRing() tints its blocks up to 55% lightness, which against this
 // palette is a scatter of white popcorn on red dirt — the same complaint the
 // Darco arcology logged. Identical talus maths, held down to 6-16% lightness
 // and biased warm. 13-30% was the first correction and still came back pale:
 // full sun plus a .75 hemisphere plus ACES lifts a mid tone a long way, and
 // the only reliable way to set these numbers is off a render.
 // One debris field in one hue band read as one material: concrete, steel and
 // slag indistinguishable. About one piece in five is now torn PLATE — a flat
 // shard in the grating steel, rust in the ruin — so the metal reads as metal.
 const lxRubble=(cx,cy,cz,rMin,rMax,n,sMax)=>{for(let i=0;i<n;i++){const a=rng()*TAU;
  const q=Math.pow(rng(),2.4),r=rMin+(rMax-rMin)*q,sz=rr(.6,sMax)*(1.25-.55*q);
  if(rng()<.2){kput(GRT,[cx+Math.cos(a)*r,cy+(1-q)*(1-q)*sMax*.55+sz*.15,cz+Math.sin(a)*r],
    qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),[sz*rr(1.4,2.8),sz*.22,sz*rr(.8,1.6)],null);continue;}
  kput('rubble',[cx+Math.cos(a)*r,cy+(1-q)*(1-q)*sMax*.55+sz*.4,cz+Math.sin(a)*r],
   qEuler(rng()*3,rng()*3,rng()*3),[sz*rr(.7,1.5),sz*rr(.5,1),sz*rr(.7,1.5)],
   new THREE.Color().setHSL(rr(.045,.095),rr(.10,.32),rr(.055,.155)));}};

 // ---- the plan --------------------------------------------------------------
 // A hexagon softened 25% toward a circle. The six trenches leave through its
 // CORNERS (where the plan reaches furthest) and the six service spines stand
 // on its EDGE MIDPOINTS, so from overhead the ground works are one figure and
 // not two rings that happen to share a centre.
 const PF=th=>lerp(hexR(1,th),1,.25);
 const TBEAR=k=>k*TAU/6, SBEAR=k=>(k+.5)*TAU/6;
 // THE PROPORTION. The first pass put a 636 m structure on a 1330 m table and
 // it read as a wedding cake on a runway, not as a thing standing on end. The
 // table came in and the body went up: 794 m over a 1130 m berm, which is the
 // ratio at which the six masts read as tall and the shroud reads as far away.
 const APY=30,APR=520,MNDR=668,PITR=240,PITY=4,DEFR=74;
 const HW=46,TS0=240,TS1=478,SCL=68;               // trench half-width, run, scoop reach
 const LA=Math.PI/6;                                // the lean bearing: a spine, not a trench
 // 0.072 rad put the shroud tip 51 m off the axis, which at hero distance read
 // as "slightly off" rather than as a catastrophe. 0.082 (4.7 deg) puts it at
 // 62 m, drops the skirt rim 20 m — 10 m THROUGH its own apron, which is what
 // the crater is for — and is the number at which a viewer sees it immediately.
 const TILT=dd?.082:0;
 // ground height outside the apron, so the scoops' back slopes land ON the berm
 // instead of hanging 20 m over it. The trenches leave through the plan's
 // corners, where PF()===1, so a plain radius is the right argument here.
 const bermY=r=>r<=APR?APY:lerp(APY,0,Math.pow(clamp((r-APR)/(MNDR-APR),0,1),.62));
 // along/across coordinates in a trench's own frame; returns which trench, or -1
 const inTrench=(x,z,pad)=>{for(let k=0;k<6;k++){const a=TBEAR(k),ca=Math.cos(a),sa=Math.sin(a);
   const al=x*ca+z*sa,ac=-x*sa+z*ca;
   if(al>TS0-8&&al<TS1+SCL+74&&Math.abs(ac)<HW+(pad||0))return k;}
  return -1;};
 // where the falling skirt rim came through the apron
 const crushHole=(x,z)=>{if(!dd)return false;const r=Math.hypot(x,z),a=Math.atan2(z,x);
  // Stops short of r=310, where the propellant sphere on this same bearing
  // stands: at 336 the crater dished the apron out from under its legs and
  // left them hanging 8 m over the hole.
  if(r<210||r>302)return false;
  return Math.abs(wrapA(a-LA))<.30*(1+.7*(fbm(a*3.1,r*.012,9522,2)-.5));};

 // ---- the section -----------------------------------------------------------
 const BY0=88,BY1=600,BHH=BY1-BY0;
 // One line for the whole silhouette: a 1.06 power taper from 116.8 to 58, a
 // gaussian BULGE at t=.20 (the lower promenade, where the city is widest) and
 // a gaussian WAIST at t=.55 (the collar, where the gantry has to reach in).
 const bt=y=>clamp((y-BY0)/BHH,0,1);
 const rB=y=>{const t=bt(y);
  return(116-58*Math.pow(t,1.06))
   *(1+.055*Math.exp(-Math.pow((t-.20)/.14,2)))
   *(1-.042*Math.exp(-Math.pow((t-.55)/.12,2)));};
 // Sixteen stringers standing PROUD (the flute only ever adds), plus a slow
 // fbm wobble so a 512 m extrusion is not mechanically round. At 2.6% — the
 // first value — the ribs vanished at any distance over 400 m and the body read
 // as a smooth cone; 4.4% is the point at which the vertical wins back.
 const flut=(a,t)=>1+.044*Math.pow(.5+.5*Math.cos(16*a),1.6)
                    +.013*(fbm(Math.cos(a)*1.5+4,Math.sin(a)*1.5+4,t*2.4+9,2)*2-1);
 const crush=(a,y)=>{if(!dd)return 1;const t=clamp((132-y)/44,0,1);
  return t<=0?1:1-.17*t*t*(.3+.7*fbm(a*2.2,y*.08,9524,3));};
 const BP=(u,y,k)=>{const a=u*TAU,r=rB(y)*(k===undefined?1:k)*flut(a,bt(y))*crush(a,y);
  return[Math.cos(a)*r,y,Math.sin(a)*r];};
 // The lean, as one quaternion about one pivot. BWP() is the SAME transform
 // applied by hand, so anything living in G (a bridge, an umbilical arm, a
 // camera preset) can be aimed at the body's real leaned position.
 const LQ=qAxis(Math.sin(LA),0,-Math.cos(LA),TILT);
 const _lv=new THREE.Vector3();
 const BWP=(u,y,k)=>{const p=BP(u,y,k);if(!dd)return p;
  _lv.set(p[0],p[1]-BY0,p[2]).applyQuaternion(LQ);return[_lv.x,_lv.y+BY0,_lv.z];};
 const SKRO=242,SKY0=44,SKY1=130,PLGY=94;           // skirt rim, rim height, springing, engine deck
 const SY0=600,SY1=800,STIP=838;                    // shroud base, nose, pilot mast
 // The masts stand at r=290 and not closer: their 30 m lattice spans r 275..305,
 // and the skirt rim is at 242 with the hold-down pylons out to 264. A mast at
 // 238 — the first number tried — ran straight through the skirt.
 // THE CLEAR OPENING. CRI was 144, and the vehicle cannot pass through 144.
 // Measured against what actually has to rise through this ring: the body tops
 // out at r=123.5 including its stringers, the widest terrace reaches 137.6 —
 // and the BLAST SKIRT RIM is at 242. The skirt is the governing diameter and
 // it was 98 m too big for its own gantry, so the thing could never have flown.
 // CRI=268 clears it by 26 m. Everything outboard moves with it to keep the
 // ring order along a spine bearing — mast, tank, service tower — at the
 // spacing it had: masts 349..379, tanks 380..428, towers 435..465, all inside
 // an apron grown 430 -> 520 and a berm 566 -> 668. The trench run follows so
 // the scoops still crest ON the berm rather than hanging over it.
 const CY0=316,CY1=404,CRI=268,CRO=330,MSTR=364,MSTY=428;
 const SVR=450,SVY0=186,SVY=SVY0;                             // the service-tower ring
 const TERR=[152,228,304,380,456,532];
 // hoisted out of the terrace loop: LXSITE publishes it to the camera presets,
 // which resolve outside the vehicle block and so cannot see a const declared
 // inside it. The empty-pad build threw `TPR is not defined` on every site —
 // and every invariant still PASSED, because REGISTER runs before the throw.
 const TPR=[17,20,16,13,10,8];

 // ---- decay predicates ------------------------------------------------------
 const rot=holeFn(dd?.46:0,9521,null,1.1);
 // the gash the gantry ring cut into the body as it came down
 // Both edges of the gash are noised, not just its width: with hard y bounds and
 // a +/-0.08 rad wobble it came back as a black rectangle 100 m tall with two
 // dead-straight vertical sides.
 const gashY0=u=>292+38*(fbm(u*4.2+11,1.7,9525,2)-.5);
 const gashY1=u=>420+52*(fbm(u*4.6+29,5.1,9525,2)-.5);
 const bHole=(u,y)=>{if(!dd)return false;
  // holeFn multiplies its first argument by ~5 internally, so feeding it a u
  // normalised over a 730 m perimeter gives holes 150 m across in the
  // circumferential direction and 32 m in the vertical — eaten fabric stretched
  // into stripes. u*4.4 puts both at ~33 m.
  if(rot&&rot(u*4.4,y))return true;
  if(y<gashY0(u)||y>gashY1(u))return false;
  return Math.abs(wrapA(u*TAU-LA))<.30+.34*(fbm(u*6.5,y*.028,9525,3)-.5);};
 const ringGap=a=>dd&&Math.abs(wrapA(a-LA))<.62;
 // TWO OF THE FOUR SHROUD PANELS are gone. The seams sit at 45/135/225/315, so
 // the pair that went is the 180 deg sector centred on 45 deg — a break ON the
 // latch lines, which is the only place a shroud can come apart, with an fbm
 // ragged edge so it is not a clean quadrant.
 const shGone=(u,y)=>{if(!dd)return false;
  const a=u*TAU;if(y<SY0+26)return false;
  return Math.abs(wrapA(a-Math.PI/4))<Math.PI/2*(1+.09*(fbm(u*5,y*.04,9526,2)-.5));};

 // ---- registry --------------------------------------------------------------
 // The lean moves every volume above the pivot, so the registrations follow it
 // through the same displacement the geometry uses.
 const LDX=y=>dd?(y-BY0)*Math.sin(TILT)*Math.cos(LA):0;
 const LDZ=y=>dd?(y-BY0)*Math.sin(TILT)*Math.sin(LA):0;
 const NM=pad?'Launch pad':'Launch Arcology';
 REGISTER({name:NM+' ('+STATE(d)+')',x:0,z:0,r:MNDR*1.12,h:(pad?MSTY:STIP)+20});
 REGISTER({name:NM+' — the blast table',x:0,z:0,r:APR+6,h:APY+16});
 REGISTER({name:NM+' — the flame pit',x:0,z:0,y:PITY-2,r:PITR-4,h:APY+6});
 REGISTER({name:NM+' — the deflector',x:0,z:0,y:PITY,r:DEFR+8,h:50});
 if(!pad){REGISTER({name:'Launch Arcology — the engine bells',x:LDX(80),z:LDZ(80),y:48,r:130,h:66});
 REGISTER({name:'Launch Arcology — the blast skirt',x:LDX(90),z:LDZ(90),y:SKY0-4,r:SKRO+8,h:SKY1-SKY0+10});
 REGISTER({name:'Launch Arcology — the lower city',x:LDX(200),z:LDZ(200),y:134,r:138,h:150});
 REGISTER({name:'Launch Arcology — the mid city',x:LDX(320),z:LDZ(320),y:284,r:118,h:150});
 REGISTER({name:NM+' — the gantry ring',x:0,z:0,y:CY0-18,r:CRO+18,h:CY1-CY0+56});
 REGISTER({name:NM+' — the gantry masts',x:0,z:0,y:APY,r:MSTR+22,h:MSTY-APY+8});
 REGISTER({name:'Launch Arcology — the upper city',x:LDX(490),z:LDZ(490),y:434,r:96,h:170});
 REGISTER({name:'Launch Arcology — the payload shroud',x:LDX(680),z:LDZ(680),y:SY0-4,r:92,h:STIP-SY0+14});}
 REGISTER({name:NM+' — the service towers',x:0,z:0,y:APY,r:SVR+30,h:SVY-APY+30});
 for(let k=0;k<6;k++)REGISTER({name:NM+' — flame trench '+(k+1),
  x:Math.cos(TBEAR(k))*((TS0+TS1)/2),z:Math.sin(TBEAR(k))*((TS0+TS1)/2),y:PITY-2,r:HW+14,h:APY+38});

 // ===========================================================================
 // THE GROUND WORKS  (group G, always upright)
 // ===========================================================================

 // ---- the berm and its two ramps -------------------------------------------
 // The berm's INNER edge follows the hexagonal apron and its OUTER edge is
 // circular. Running PF() all the way out put the toe at 509 on the spine
 // bearings and 566 on the trench bearings, while apron()'s graded skirt is
 // circular and starts at 569 — so on three sixths of the compass there was a
 // 60 m annulus of bare ground plane between them, which on the ruined site is
 // painted green and read as a chartreuse wedge lying on the desert.
 MND.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(APR*PF(th),MNDR,v)*(1+.045*fbm(u*8,1.4,9523,2));
   const x=Math.cos(th)*r,z=Math.sin(th)*r;
   return[x,lerp(APY,0,Math.pow(v,.62))+terrainH(gx+x,gz+z),z];},168,8,{uS:64,vS:6}));
 for(let s=0;s<2;s++){const a=s?SBEAR(4):SBEAR(1);       // bearings 270 and 90
  const ca=Math.cos(a),sa=Math.sin(a);
  GRD.push(gridSurface((u,v)=>{const q=(u*2-1)*34,r=lerp(APR*PF(a)-6,MNDR*PF(a)+18,v);
    return[r*ca-q*sa,lerp(APY+.6,.4,Math.pow(v,.62)),r*sa+q*ca];},14,12,{uS:10,vS:22}));
  for(let i=0;i<14;i++){const t=(i+.5)/14,r=lerp(APR*PF(a)-6,MNDR*PF(a)+18,t);
   const y=lerp(APY+.6,.4,Math.pow(t,.62));
   for(let e=-1;e<=1;e+=2){if(dd&&rng()<.35)continue;
    kput(BX,[r*ca-e*35*sa,y+1.6,r*sa+e*35*ca],qEuler(0,-a,0),[6.4,3.2,2.4],null);}}}

 // ---- the apron -------------------------------------------------------------
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(258,APR,v)*PF(th);
   return[Math.cos(th)*r,APY,Math.sin(th)*r];},228,20,{uS:82,vS:18,
   hole:(u,v)=>{const th=u*TAU,r=lerp(258,APR,v)*PF(th),x=Math.cos(th)*r,z=Math.sin(th)*r;
    return inTrench(x,z,3)>=0||crushHole(x,z);}}));
 // the apron's outer fascia, down onto the berm
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=APR*PF(th);
   return[Math.cos(th)*r,lerp(APY,APY-6,v),Math.sin(th)*r];},228,2,{uS:82,vS:2,
   hole:u=>{const th=u*TAU,r=APR*PF(th);return inTrench(Math.cos(th)*r,Math.sin(th)*r,3)>=0;}}));
 // expansion joints, radial: the one thing that gives 700 000 m2 of paving scale
 for(let k=0;k<48;k++){const a=k/48*TAU;
  if(inTrench(Math.cos(a)*380,Math.sin(a)*380,6)>=0)continue;
  if(dd&&rng()<.3)continue;
  beam(BX,[Math.cos(a)*262,APY+.35,Math.sin(a)*262],[Math.cos(a)*APR*PF(a)*.99,APY+.35,Math.sin(a)*APR*PF(a)*.99],.7,2.6);}

 // ---- the flame pit ---------------------------------------------------------
 // The floor runs all the way to r=0, not to the deflector's foot: the
 // deflector is a SHELL, so an annulus stopping at DEFR leaves a hole under it
 // and the 40 000 m2 ground plane — greened, at y=-0.05 — shows through as a
 // bright sliver round its base. Visible in the first render, not in any count.
 SCO.push(gridSurface((u,v)=>{const th=u*TAU,r=PITR*(1-v);
   return[Math.cos(th)*r,PITY,Math.sin(th)*r];},144,12,{uS:58,vS:14}));
 // Blast scoring on the floor: without it 180 000 m2 of pit is one grey field.
 // The colour is forced DARK — a bare concrete box on a scorched floor reads as
 // a bright white stripe, which is the opposite of scoring.
 {const SCC=new THREE.Color(0x3a332c);
  for(let k=0;k<36;k++){const a=(k+.5)/36*TAU;
   if(dd&&rng()<.3)continue;
   beam(BX,[Math.cos(a)*(DEFR+6),PITY+.3,Math.sin(a)*(DEFR+6)],
            [Math.cos(a)*(PITR-4),PITY+.3,Math.sin(a)*(PITR-4)],.6,2.4,SCC);}}
 // THE CRATER, and the reason it needs a floor of its own. crushHole() punches
 // the apron away where the falling skirt rim came through it; with nothing
 // under the hole you see the scene's 40 km ground plane — greened by RUINS at
 // y = -0.05 — and the crater reads as bright chartreuse rectangles cut in
 // card. This is a dished sector comfortably larger than the hole (which is
 // bounded by r 210..302 and |da| < .405) with a torn lip round it.
 if(dd){
  SCO.push(gridSurface((u,v)=>{const a=LA+(u*2-1)*.60,r=lerp(196,314,v);
    const t=clamp(1-Math.abs(wrapA(a-LA))/.46,0,1)*clamp(Math.sin(Math.PI*v)*1.5,0,1);
    return[Math.cos(a)*r,APY-2.5-16*t,Math.sin(a)*r];},46,26,{uS:22,vS:18}));
  for(let i=0;i<70;i++){const a=LA+rr(-.44,.44),r=rr(204,306);
   const s=rr(1.4,7);
   kput('rubble',[Math.cos(a)*r,APY-rr(2,14)+s*.4,Math.sin(a)*r],qEuler(rng()*3,rng()*3,rng()*3),
    [s*rr(.7,1.5),s*rr(.5,1),s*rr(.7,1.5)],new THREE.Color().setHSL(rr(.04,.09),rr(.08,.28),rr(.16,.38)));}}
 SCO.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(PITR,258,v);
   return[Math.cos(th)*r,lerp(PITY,APY,v),Math.sin(th)*r];},144,4,{uS:58,vS:4,
   hole:u=>{const th=u*TAU;for(let k=0;k<6;k++)if(Math.abs(wrapA(th-TBEAR(k)))<Math.asin(HW/PITR))return true;
    return false;}}));
 // The deflector: a six-faced cone whose FACES are centred on the trenches and
 // whose ridges fall on the spines, so each face is a chute aimed down a trench.
 // hexR is maximal at the corners, so the plan is turned 30 deg to put them
 // between the trenches rather than on them.
 const DEFH=46;                                        // 30 m read as a speed bump
 const defR=(a,t)=>DEFR*hexR(1,a-Math.PI/6)*Math.pow(clamp(1-t,0,1),.62);
 SCO.push(gridSurface((u,v)=>{const a=u*TAU,r=defR(a,v);
   return[Math.cos(a)*r,PITY+DEFH*v,Math.sin(a)*r];},96,14,{uS:36,vS:10}));
 for(let k=0;k<6;k++){const a=SBEAR(k);                 // the ridges, picked out
  for(let i=0;i<7;i++){const t0=i/7,t1=(i+1)/7;
   beam(BX,[Math.cos(a)*defR(a,t0)*1.01,PITY+DEFH*t0,Math.sin(a)*defR(a,t0)*1.01],
            [Math.cos(a)*defR(a,t1)*1.01,PITY+DEFH*t1,Math.sin(a)*defR(a,t1)*1.01],3.4,3.4);}}
 // the pit wall's light ring, and a run of floodlights on brackets
 for(let k=0;k<54;k++){const a=(k+.5)/54*TAU;
  if(Math.abs(wrapA(a-TBEAR(Math.round(a/(TAU/6))%6)))<Math.asin(HW/PITR))continue;
  kput('strip',[Math.cos(a)*(PITR-2),APY-5,Math.sin(a)*(PITR-2)],TAN(a),[TAU*PITR/54*.8,1.6,1.6],
   litC(dd?rng()<.10:true,.45,.9));}

 // ---- the six trenches and their deflector scoops ---------------------------
 // A LINEAR wall, not a power curve: pow(x,.8) rounds the junction between
 // floor and wall and the trench came back reading as a natural gully. Straight
 // sides on a flat floor is what makes it an engineered channel.
 //
 // AND IT IS CUT WIDER THAN ITS OWN HOLE. The apron drops any quad whose centre
 // falls within HW+3 of a trench axis, and the trench surface only reached HW,
 // so a 3 m strip at each lip had no apron and no trench — and the scene's
 // ground plane showed through it as a yellow-green sliver running the length
 // of all six trenches. The channel now runs out to HW+7 and finishes 1.2 m
 // PROUD of the apron, which is where the coping sits anyway.
 const HWT=HW+7, WTOP=APY+1.2;
 const wallY=q=>PITY+(WTOP-PITY)*clamp((Math.abs(q)*HWT-HW*.58)/(HW*.42+7),0,1);
 for(let k=0;k<6;k++){const a=TBEAR(k),ca=Math.cos(a),sa=Math.sin(a);
  const XZ=(s,q)=>[s*ca-q*HWT*sa,s*sa+q*HWT*ca];
  SCO.push(gridSurface((u,v)=>{const q=u*2-1,s=lerp(TS0-6,TS1,v),p=XZ(s,q);
    return[p[0],wallY(q),p[1]];},26,24,{uS:18,vS:36}));
  // the scoop: a quarter-round that turns the efflux up and out, sweeping the
  // trench's own cross-section along with it so the walls do not stop dead
  SCO.push(gridSurface((u,v)=>{const q=u*2-1,t=v,s=TS1+SCL*Math.sin(t*Math.PI/2),
    yb=PITY+58*(1-Math.cos(t*Math.PI/2)),p=XZ(s,q);
    return[p[0],yb+(wallY(q)-PITY)*(1-.5*t),p[1]];},28,12,{uS:18,vS:14}));
  // The back of the scoop is its OUTSIDE, so it is apron concrete, not scorch:
  // in scorch the whole deflector read from overhead as a thin dark sail.
  GRD.push(gridSurface((u,v)=>{const q=u*2-1,s=lerp(TS1+SCL,TS1+SCL+70,v),p=XZ(s,q);
    return[p[0],lerp(PITY+58+(wallY(q)-PITY)*.5,bermY(TS1+SCL+70),Math.pow(v,.8)),p[1]];},26,6,{uS:18,vS:7}));
  // and its two cheeks, from its side edge down to the ground, so the scoop is
  // a MASS with a thickness and not a curved sheet standing on its lip
  for(let e=-1;e<=1;e+=2)GRD.push(gridSurface((u,v)=>{let s2,yt;
    if(u<.5){const t=u*2;s2=TS1+SCL*Math.sin(t*Math.PI/2);
     yt=PITY+58*(1-Math.cos(t*Math.PI/2))+(wallY(e)-PITY)*(1-.5*t);}
    else{const w=(u-.5)*2;s2=lerp(TS1+SCL,TS1+SCL+70,w);
     yt=lerp(PITY+58+(wallY(e)-PITY)*.5,bermY(TS1+SCL+70),Math.pow(w,.8));}
    const p=XZ(s2,e),yb=Math.min(yt,bermY(Math.hypot(p[0],p[1]))-.5);
    return[p[0],lerp(yb,yt,v),p[1]];},28,3,{uS:18,vS:5}));
  // the coping along both lips, and the scoop's own crest
  for(let e=-1;e<=1;e+=2)for(let i=0;i<22;i++){const t=(i+.5)/22,s=lerp(TS0-6,TS1,t),p=XZ(s,e*1.0);
   if(dd&&rng()<.26)continue;
   kput(BX,[p[0],APY+1.4,p[1]],qEuler(0,-a,0),[(TS1-TS0+6)/22*1.05,2.8,4.2],null);}
  for(let i=0;i<9;i++){const t=(i+.5)/9,s=TS1+SCL*Math.sin(t*Math.PI/2),
    yb=PITY+58*(1-Math.cos(t*Math.PI/2));
   for(let e=-1;e<=1;e+=2){const p=XZ(s,e*1.02);
    if(dd&&rng()<.22)continue;
    kput(BX,[p[0],yb+(APY-PITY)*(1-.5*t)+2,p[1]],qEuler(0,-a,0),[9,4,5],null);}}
  // pad lighting down the trench walls, warm rather than the Ancients' cyan
  for(let i=0;i<8;i++){const t=(i+.5)/8,s=lerp(TS0+10,TS1-16,t);
   for(let e=-1;e<=1;e+=2){const p=XZ(s,e*.86);
    kput('strip',[p[0],APY-8,p[1]],qEuler(0,-a,0),[10,2,2],
     (dd?rng()<.08:true)?WARM.clone().multiplyScalar(rr(.4,.9)):DEAD);}}
  if(dd){                                                 // slag and spall
   for(let i=0;i<46;i++){const t=rng(),s=lerp(TS0,TS1+SCL*.6,t),q=rr(-.9,.9),p=XZ(s,q);
    const sz=rr(.8,5.2);
    kput('rubble',[p[0],wallY(q)+sz*.4,p[1]],qEuler(rng()*3,rng()*3,rng()*3),
     [sz*rr(.7,1.5),sz*rr(.4,.9),sz*rr(.7,1.5)],new THREE.Color().setHSL(rr(.03,.09),rr(.05,.22),rr(.03,.09)));}}}

 // ---- twelve hold-down clamps ------------------------------------------------
 // The skirt rim floats 14 m over the apron and these are the only things
 // touching it. That is the whole point of the type: it is held DOWN, not
 // stood up.
 // A clamp, not a bollard. The first pass was a plain box with a stub on it and
 // read as a kerbstone: this one is a battered pylon with an outboard buttress,
 // a pair of JAWS that straddle the rim lug, and a ram behind them, so you can
 // see what is holding the thing down and which way the load goes.
 for(let k=0;k<12;k++){const a=k*TAU/12,ca=Math.cos(a),sa=Math.sin(a);
  const tx=-sa,tz=ca;
  const sheared=dd&&Math.abs(wrapA(a-LA))<.72;
  const hh=sheared?rr(5,11):14;                    // top at y=44, level with the rim
  const RP=256;
  kput(BX,[ca*RP,APY+hh*.5,sa*RP],qEuler(0,-a,0),[24,hh,19],null);
  kput(BX,[ca*RP,APY+hh-1.8,sa*RP],qEuler(0,-a,0),[29,3.6,24],null);
  // The outboard buttress, taking the overturning moment back to the pad.
  // STEPPED boxes rather than one rotated beam: a beam struck between two
  // points at different heights renders as a slab lying at an angle on the
  // apron, which read as debris rather than as structure.
  for(let b3=0;b3<3;b3++){const bh=hh*(.72-b3*.22);
   kput(BX,[ca*(RP+11+b3*7),APY+bh*.5,sa*(RP+11+b3*7)],qEuler(0,-a,0),[17-b3*3,bh,8],null);}
  if(sheared){lxRubble(ca*(RP-4),APY,sa*(RP-4),4,24,18,3.4);
   for(let j=0;j<3;j++)beam(PL,[ca*(RP-3)+tx*rr(-7,7),APY+hh,sa*(RP-3)+tz*rr(-7,7)],
    [ca*(RP-rr(8,20))+tx*rr(-11,11),APY+hh-rr(2,10),sa*(RP-rr(8,20))+tz*rr(-11,11)],4,3.4);}
  else{
   for(let e=-1;e<=1;e+=2){                        // the two jaws
    kput(PL,[ca*(RP-9)+tx*e*6.5,APY+hh+3,sa*(RP-9)+tz*e*6.5],qEuler(0,-a,0),[3.4,10,20],null);
    kput(PL,[ca*(SKRO-1)+tx*e*6.5,APY+hh+7,sa*(SKRO-1)+tz*e*6.5],qEuler(0,-a,0),[3.4,5,9],null);}
   kput(PL,[ca*(RP-4),APY+hh+4,sa*(RP-4)],qEuler(0,-a,0),[16,7,9],null);
   beam(PIPE,[ca*(RP+6),APY+hh+2,sa*(RP+6)],[ca*(RP-6),APY+hh+5,sa*(RP-6)],4,4);
   kput('strip',[ca*(SKRO+2),APY+hh+10,sa*(SKRO+2)],TAN(a),[9,1.4,1.4],litC(dd?rng()<.1:true,.4,.8));}}

 // ---- the lattice: a helper both rings of towers use -------------------------
 // A box lattice of four legs with a horizontal frame at every lift and
 // alternating diagonals. Every member goes through beam(), so a 330 m mast is
 // ~240 instanced boxes and no draw call of its own.
 const lattice=(cx,cz,y0,y1,w,seg,yaw)=>{
  const cy=Math.cos(yaw),sy=Math.sin(yaw);
  const cor=[[-1,-1],[1,-1],[1,1],[-1,1]].map(c=>[cx+(c[0]*cy-c[1]*sy)*w,cz+(c[0]*sy+c[1]*cy)*w]);
  const n=Math.max(1,Math.round((y1-y0)/seg));
  for(let i=0;i<n;i++){const ya=y0+i*seg,yb=Math.min(y1,y0+(i+1)*seg);
   for(let c2=0;c2<4;c2++){const A=cor[c2],B=cor[(c2+1)%4];
    beam(PL,[A[0],ya,A[1]],[A[0],yb,A[1]],2.6,2.6);
    beam(PL,[A[0],yb,A[1]],[B[0],yb,B[1]],1.8,1.8);
    beam(PL,[A[0],ya,A[1]],[B[0],yb,B[1]],1.3,1.3);}}
  return cor;};

 // ---- six gantry masts and the collar ---------------------------------------
 const mastBroke=k=>dd&&Math.abs(wrapA(SBEAR(k)-LA))<.2;
 for(let k=0;k<6;k++){const a=SBEAR(k),ca=Math.cos(a),sa=Math.sin(a);
  const top=mastBroke(k)?210:MSTY;
  lattice(ca*MSTR,sa*MSTR,APY,top,15,15,-a);
  kput(BX,[ca*MSTR,APY+4,sa*MSTR],qEuler(0,-a,0),[42,8,42],null);      // the footing
  for(let y=APY+46;y<top-10;y+=52){                                    // service decks
   kput(GRT,[ca*MSTR,y,sa*MSTR],qEuler(0,-a,0),[40,1.6,40],null);
   for(let e=0;e<4;e++){const th=a+e*Math.PI/2;
    kput(GRT,[ca*MSTR+Math.cos(th)*19,y+2.4,sa*MSTR+Math.sin(th)*19],TAN(th),[38,3.2,1.4],null);}
   if(!dd||rng()<.25)kput('strip',[ca*MSTR,y+3.4,sa*MSTR],TAN(a),[26,1.6,1.6],litC(true,.4,.9));}
  if(mastBroke(k)){                          // the head, down on the pad
   const fa=a+rr(-.3,.3),fr=rr(140,230);
   for(let i=0;i<16;i++){const t=i/16;
    beam(PL,[Math.cos(fa)*(fr+t*110),APY+rr(1,9),Math.sin(fa)*(fr+t*110)],
             [Math.cos(fa)*(fr+(t+1/16)*110)+rr(-9,9),APY+rr(1,9),Math.sin(fa)*(fr+(t+1/16)*110)+rr(-9,9)],3,3);}
   lxRubble(Math.cos(fa)*(fr+55),APY,Math.sin(fa)*(fr+55),8,70,70,4.2);
   continue;}
  // the arm that carries the collar ring in from the mast
  for(let lev=0;lev<3;lev++){const y=CY0+lev*34;
   if(ringGap(a))continue;
   beam(GRT,[ca*(MSTR-14),y,sa*(MSTR-14)],[ca*(CRO+2),y,sa*(CRO+2)],9,5);
   beam(PL,[ca*(MSTR-4),y-26,sa*(MSTR-4)],[ca*(CRO+2),y-3,sa*(CRO+2)],3.4,3.4);}}

 // ---- the collar: three service decks on a ring ------------------------------
 for(let lev=0;lev<3;lev++){const y=CY0+lev*34;
  STL.push(gridSurface((u,v)=>{const a=u*TAU,r=lerp(CRO,CRI,v);
    return[Math.cos(a)*r,y,Math.sin(a)*r];},144,5,{uS:54,vS:7,hole:u=>ringGap(u*TAU)}));
  STL.push(gridSurface((u,v)=>{const a=u*TAU,r=lerp(CRI,CRO,v);
    return[Math.cos(a)*r,y-3.6,Math.sin(a)*r];},144,4,{uS:54,vS:7,hole:u=>ringGap(u*TAU)}));
  STL.push(gridSurface((u,v)=>{const a=u*TAU,r=CRO*(1+.008*Math.sin(Math.PI*v));
    return[Math.cos(a)*r,y-3.6+v*3.6,Math.sin(a)*r];},144,3,{uS:54,vS:2,hole:u=>ringGap(u*TAU)}));
  STL.push(gridSurface((u,v)=>{const a=u*TAU,r=CRI*(1-.008*Math.sin(Math.PI*v));
    return[Math.cos(a)*r,y-3.6+v*3.6,Math.sin(a)*r];},144,3,{uS:54,vS:2,hole:u=>ringGap(u*TAU)}));
  // Radial girders under the deck. A 56 m annular plate with a blank underside
  // is the single biggest surface in the "up the body" view and it read as
  // card; these give it a direction and a depth.
  {const nG=Math.round(TAU*(CRI+CRO)*.5/13);
   for(let j=0;j<nG;j++){const a=(j+.5)/nG*TAU;
    if(ringGap(a))continue;
    beam(GRT,[Math.cos(a)*CRI,y-6.2,Math.sin(a)*CRI],[Math.cos(a)*CRO,y-6.2,Math.sin(a)*CRO],5.6,2.6);}}
  {const nR=Math.round(TAU*CRO/26);
   for(let j=0;j<nR;j++){const a=(j+.5)/nR*TAU;
    if(ringGap(a))continue;
    for(const rr2 of [CRI+16,CRO-14])
     kput(GRT,[Math.cos(a)*rr2,y-8.4,Math.sin(a)*rr2],TAN(a),[TAU*rr2/nR*1.06,3.4,2.2],null);}}
  const nP=Math.round(TAU*CRO/11);
  for(let j=0;j<nP;j++){const a=(j+.5)/nP*TAU;
   if(ringGap(a)||(dd&&rng()<.24))continue;
   kput(GRT,[Math.cos(a)*(CRO+.6),y+2.1,Math.sin(a)*(CRO+.6)],TAN(a),[TAU*CRO/nP*1.06,4.2,1.6],null);
   if(j%3===0)kput(GRT,[Math.cos(a)*(CRI-.6),y+2.1,Math.sin(a)*(CRI-.6)],TAN(a),[TAU*CRI/nP*1.06,4.2,1.6],null);}
  const nL=Math.round(TAU*CRO/18);
  for(let j=0;j<nL;j++){const a=(j+.5)/nL*TAU;
   if(ringGap(a))continue;
   kput('strip',[Math.cos(a)*(CRO-2),y+4.6,Math.sin(a)*(CRO-2)],TAN(a),[TAU*CRO/nL*.8,1.6,1.6],
    litC(dd?rng()<.12:true,.4,.95));}}
 // two derricks on the top deck, and a stair tower between two of the masts
 for(let s=0;s<2;s++){const a=SBEAR(s===0?1:4);
  if(ringGap(a))continue;
  const bx=Math.cos(a)*(CRI+26),bz=Math.sin(a)*(CRI+26);
  kput(GRT,[bx,CY1+2,bz],qEuler(0,-a,0),[20,4,20],null);   // base plate: without
  lattice(bx,bz,CY1,CY1+44,6,11,-a);                        // it the derrick floats
  beam(PL,[bx,CY1+42,bz],[bx+Math.cos(a)*54,CY1+22,bz+Math.sin(a)*54],4,4);
  beam(PL,[bx,CY1+42,bz],[bx-Math.cos(a)*22,CY1+30,bz-Math.sin(a)*22],3,3);
  if(!dd)kput('strip',[bx+Math.cos(a)*54,CY1+20,bz+Math.sin(a)*54],TAN(a),[6,1.6,1.6],
   WARM.clone().multiplyScalar(.8));}

 // ---- six service towers, and the ring road between them --------------------
 for(let k=0;k<6;k++){const a=SBEAR(k),ca=Math.cos(a),sa=Math.sin(a);
  // the two that went down are the one the mast fell across and one opposite,
  // so the ring is not obviously symmetrical from any single view
  const down=dd&&(k===0||k===3);
  if(down){const fa=a+rr(-.25,.25);
   for(let i=0;i<14;i++){const t=i/14;
    beam(PL,[Math.cos(fa)*(SVR-20+t*150),APY+rr(1,7),Math.sin(fa)*(SVR-20+t*150)],
             [Math.cos(fa)*(SVR-20+(t+1/14)*150)+rr(-8,8),APY+rr(1,7),Math.sin(fa)*(SVR-20+(t+1/14)*150)+rr(-8,8)],2.6,2.6);}
   lxRubble(ca*SVR,APY,sa*SVR,6,46,44,3.6);
   continue;}
  // SIX-FOLD SYMMETRY WAS EXACT: from overhead the ground works were a perfect
  // rosette. The service towers are plant, not structure, and were built to
  // different briefs — each stands its own height (160-216 m), and two carry a
  // second jib. The masts that carry the collar stay identical; these need not.
  const SVY=SVY0+[0,-26,14,-10,30,-18][k],jib2=k===2||k===5;
  lattice(ca*SVR,sa*SVR,APY,SVY,11,14,-a);
  kput(BX,[ca*SVR,APY+3,sa*SVR],qEuler(0,-a,0),[32,6,32],null);
  for(let y=APY+40;y<SVY-6;y+=34){
   kput(GRT,[ca*SVR,y,sa*SVR],qEuler(0,-a,0),[30,1.5,30],null);
   for(let e=0;e<4;e++){const th=a+e*Math.PI/2;
    kput(GRT,[ca*SVR+Math.cos(th)*14,y+2.2,sa*SVR+Math.sin(th)*14],TAN(th),[28,3,1.3],null);}
   if(!dd||rng()<.2)kput('strip',[ca*SVR,y+3.2,sa*SVR],TAN(a),[20,1.5,1.5],litC(true,.35,.85));}
  // the jib that swings a load over to the mast
  beam(PL,[ca*SVR,SVY-4,sa*SVR],[ca*(SVR-62),SVY-16,sa*(SVR-62)],3.4,3.4);
  beam(PL,[ca*SVR,SVY+16,sa*SVR],[ca*(SVR-58),SVY-14,sa*(SVR-58)],2.2,2.2);
  lattice(ca*SVR,sa*SVR,SVY,SVY+18,4,9,-a);
  if(jib2){const b2=a+(k===2?.9:-.9);
   beam(PL,[ca*SVR,SVY-30,sa*SVR],[ca*SVR+Math.cos(b2)*54,SVY-44,sa*SVR+Math.sin(b2)*54],3,3);
   beam(PL,[ca*SVR,SVY-6,sa*SVR],[ca*SVR+Math.cos(b2)*50,SVY-42,sa*SVR+Math.sin(b2)*50],1.8,1.8);}
  // the bridge in to the gantry mast, on the same spine
  if(!mastBroke(k)){
   beam(GRT,[ca*(SVR-11),SVY-40,sa*(SVR-11)],[ca*(MSTR+15),SVY-40,sa*(MSTR+15)],1.6,8);
   for(let e=-1;e<=1;e+=2)beam(PL,[ca*(SVR-11)-e*3.6*sa,SVY-36.4,sa*(SVR-11)+e*3.6*ca],
     [ca*(MSTR+15)-e*3.6*sa,SVY-36.4,sa*(MSTR+15)+e*3.6*ca],2.6,1.3);}}

 // ---- the tank farm ----------------------------------------------------------
 // POSITION IN THE FILE IS LOAD-BEARING. This block pushes geometry into STL,
 // so it has to run BEFORE meshMerged(STL,...) at the bottom. Sat after the
 // merge — where it was first written — the three spheres were silently
 // dropped and only their kput fittings appeared: a band ring and a set of
 // legs standing round nothing. No invariant sees this; only a render does.
 // Three spherical propellant tanks in the 56 m lane between the mast ring at
 // 305 and the service towers at 361, each on a skirt of legs with a trunk main
 // running in toward the pit. The apron needed one piece of plant that is
 // obviously not architecture: everything else on the table is either structure
 // or paving, and without these the complex reads as a monument rather than as
 // somewhere a thing is fuelled.
 for(let t2=0;t2<3;t2++){const a=SBEAR(t2*2),ca=Math.cos(a),sa=Math.sin(a),TR=404,TKR=24,TKY=APY+34;
  const burst=dd&&t2===1;                         // one of the three has gone
  REGISTER({name:'Launch Arcology — propellant tank '+(t2+1),x:ca*TR,z:sa*TR,y:APY-2,r:TKR+14,h:76});
  if(!burst){
   STL.push(lathe({rFn:yy=>TKR*Math.sqrt(clamp(1-Math.pow((yy-TKR)/TKR,2),0,1)),H:TKR*2,nu:30,nv:16,
     hole:dd?(u,yy)=>fbm(u*9,yy*.14,9522,3)<.14:null}).translate(ca*TR,TKY,sa*TR));
   for(let j=0;j<10;j++){const th=j/10*TAU;       // the equatorial band and its legs
    kput(GRT,[ca*TR+Math.cos(th)*TKR*1.01,TKY+TKR,sa*TR+Math.sin(th)*TKR*1.01],TAN(th),
     [TAU*TKR/10*1.06,3.0,2.2],null);
    beam(PL,[ca*TR+Math.cos(th)*TKR*.86,APY,sa*TR+Math.sin(th)*TKR*.86],
             [ca*TR+Math.cos(th)*TKR*.99,TKY+TKR*.42,sa*TR+Math.sin(th)*TKR*.99],3.0,3.0);}
   if(!dd)kput('strip',[ca*TR,TKY+TKR*2+2,sa*TR],TAN(a),[10,1.6,1.6],WARM.clone().multiplyScalar(.8));}
  else{
   // split open and folded down: a hemisphere of plate lying on its own legs
   STL.push(gridSurface((u,v)=>{const th=u*TAU,rr2=TKR*Math.sin(v*1.15);
     return[ca*TR+Math.cos(th)*rr2,APY+3+TKR*.30*(1-Math.cos(v*1.15)),sa*TR+Math.sin(th)*rr2];},
     30,10,{uS:14,vS:8,hole:(u,v)=>fbm(u*7,v*4,9522,3)<.30}));
   lxRubble(ca*TR,APY,sa*TR,6,54,50,3.8);
   for(let j=0;j<8;j++){const th=j/8*TAU;
    beam(PL,[ca*TR+Math.cos(th)*TKR*.9,APY,sa*TR+Math.sin(th)*TKR*.9],
             [ca*TR+Math.cos(th)*TKR*rr(1.0,1.5),APY+rr(2,14),sa*TR+Math.sin(th)*TKR*rr(1.0,1.5)],3.0,3.0);}}
  // the trunk main in toward the pit wall, on saddles
  for(let j=0;j<9;j++){const r0=lerp(TR-TKR-4,PITR+16,j/9),r1=lerp(TR-TKR-4,PITR+16,(j+1)/9);
   if(dd&&rng()<.22)continue;
   beam(PIPE,[ca*r0,APY+3.4,sa*r0],[ca*r1,APY+3.4,sa*r1],3.2,3.2);
   kput(BX,[ca*r0,APY+1.2,sa*r0],qEuler(0,-a,0),[6,2.6,7],null);}}

 // ===========================================================================
 // THE VEHICLE  (group P: upright at d=0, leaning at d=1)
 // ===========================================================================
 let rS=null,seamF=null;
 const P=new THREE.Group();
 if(dd){P.quaternion.copy(LQ);
  P.position.set(-BY0*Math.cos(LA)*Math.sin(TILT),BY0*(1-Math.cos(TILT)),-BY0*Math.sin(LA)*Math.sin(TILT));}
 G.add(P);useGroupXF(P);
 if(!pad){

 // ---- the blast skirt -------------------------------------------------------
 const skTear=a=>dd&&Math.abs(wrapA(a-LA))<.42+.18*(fbm(a*3.3,2.1,9527,2)-.5);
 SH.push(gridSurface((u,v)=>{const a=u*TAU,r=lerp(SKRO,rB(SKY1)*flut(a,bt(SKY1)),Math.pow(v,1.12));
   return[Math.cos(a)*r,lerp(SKY0,SKY1,v),Math.sin(a)*r];},160,22,{uS:60,vS:14,
   hole:(u,v)=>skTear(u*TAU)&&v<.72}));
 // the rim: a heavy chamfered ring with the hold-down lugs on it
 SH.push(gridSurface((u,v)=>{const a=u*TAU,r=SKRO*(1+.006*Math.sin(Math.PI*v));
   return[Math.cos(a)*r,SKY0+v*7,Math.sin(a)*r];},160,3,{uS:60,vS:2,hole:u=>skTear(u*TAU)}));
 for(let k=0;k<12;k++){const a=k*TAU/12;
  if(skTear(a))continue;
  kput(PL,[Math.cos(a)*(SKRO+2.4),SKY0+4,Math.sin(a)*(SKRO+2.4)],TAN(a),[15,9,7],null);}
 // THE SKIRT IS THE BIGGEST UNBROKEN SURFACE IN THE SILHOUETTE — 127 m of
 // flare over 86 m of rise, all of it facing the camera on any ground-level
 // view — and sixteen 4.4 m strakes were not enough to stop it reading as a
 // blank white cone. Twenty-four heavier strakes, three circumferential bands
 // and a ring of access hatches between them.
 const skR=(a,v)=>lerp(SKRO,rB(SKY1)*flut(a,bt(SKY1)),Math.pow(v,1.12));
 for(let k=0;k<24;k++){const a=k/24*TAU;
  if(skTear(a))continue;
  for(let i=0;i<6;i++){const v0=i/6,v1=(i+1)/6;
   beam(PL,[Math.cos(a)*skR(a,v0)*1.013,lerp(SKY0,SKY1,v0),Math.sin(a)*skR(a,v0)*1.013],
            [Math.cos(a)*skR(a,v1)*1.013,lerp(SKY0,SKY1,v1),Math.sin(a)*skR(a,v1)*1.013],6.0,6.0);}}
 for(const bv of [.20,.48,.76]){const nb2=Math.round(TAU*skR(0,bv)/11);
  for(let j=0;j<nb2;j++){const a=(j+.5)/nb2*TAU;
   if(skTear(a))continue;
   kput(PL,[Math.cos(a)*skR(a,bv)*1.010,lerp(SKY0,SKY1,bv),Math.sin(a)*skR(a,bv)*1.010],
    TAN(a),[TAU*skR(a,bv)/nb2*1.06,3.4,2.6],null);}}
 for(let k=0;k<24;k++){const a=(k+.5)/24*TAU,bv=.34;
  if(skTear(a)||(dd&&rng()<.3))continue;
  kput(PL,[Math.cos(a)*skR(a,bv)*1.006,lerp(SKY0,SKY1,bv),Math.sin(a)*skR(a,bv)*1.006],
   qFacing([Math.cos(a),0,Math.sin(a)]),[9,7,1.2],null);
  if(!dd&&k%3===0)kput('strip',[Math.cos(a)*skR(a,.62)*1.014,lerp(SKY0,SKY1,.62),Math.sin(a)*skR(a,.62)*1.014],
   TAN(a),[8,1.6,1.6],CYAN.clone().multiplyScalar(rr(.4,.9)));}

 // ---- the thrust plug and its seven bells -----------------------------------
 // The plug is a FULL disc at y=92 running out to r=150, i.e. wider than the
 // body (112.7 at its foot). That is what closes the body's open bottom when
 // you stand in the pit and look up: an annulus stopping at the skin would show
 // you straight up the inside of a 364 m tube. The soffit meets it at r=150.
 BEL.push(gridSurface((u,v)=>{const a=u*TAU,r=lerp(SKRO*.97,150,Math.pow(v,.8));
   return[Math.cos(a)*r,lerp(SKY0+9,PLGY,v),Math.sin(a)*r];},120,8,{uS:44,vS:8,
   hole:(u,v)=>skTear(u*TAU)&&v<.4}));
 BEL.push(gridSurface((u,v)=>{const a=u*TAU,r=150*(1-v);
   return[Math.cos(a)*r,PLGY,Math.sin(a)*r];},96,10,{uS:36,vS:10}));
 for(let k=0;k<36;k++){const a=(k+.5)/36*TAU;         // the plug's rim fascia
  kput(PL,[Math.cos(a)*150,PLGY+2.2,Math.sin(a)*150],TAN(a),[TAU*150/36*1.05,5,3],null);}
 // COFFERING UNDER THE PLUG. From the pit floor this 70 000 m2 disc is the
 // whole ceiling, and blank it read as a flat brown lid. Twenty-four radial
 // beams and three concentric rings give it a structure, and they are what
 // makes the seven bells read as hung from something.
 for(let k=0;k<24;k++){const a=k/24*TAU;
  beam(PL,[Math.cos(a)*14,PLGY-3.4,Math.sin(a)*14],[Math.cos(a)*148,PLGY-3.4,Math.sin(a)*148],5.2,3.0);}
 for(const cr of [46,96,138]){const nc=Math.round(TAU*cr/16);
  for(let k=0;k<nc;k++){const a=(k+.5)/nc*TAU;
   kput(PL,[Math.cos(a)*cr,PLGY-5.6,Math.sin(a)*cr],TAN(a),[TAU*cr/nc*1.06,3.2,2.4],null);}}
 const bell=(cx,cz,r0,r1,yt,yb)=>{
  BEL.push(gridSurface((u,v)=>{const a=u*TAU,r=r0+(r1-r0)*Math.pow(v,2.1);
    return[cx+Math.cos(a)*r,lerp(yt,yb,v),cz+Math.sin(a)*r];},36,10,{uS:14,vS:8}));
  for(let k=0;k<12;k++){const a=k/12*TAU;
   for(let i=0;i<4;i++){const v0=i/4,v1=(i+1)/4;
    const ra=r0+(r1-r0)*Math.pow(v0,2.1),rb2=r0+(r1-r0)*Math.pow(v1,2.1);
    beam(PL,[cx+Math.cos(a)*ra*1.03,lerp(yt,yb,v0),cz+Math.sin(a)*ra*1.03],
             [cx+Math.cos(a)*rb2*1.03,lerp(yt,yb,v1),cz+Math.sin(a)*rb2*1.03],2.2,2.2);}}
  for(let k=0;k<18;k++){const a=k/18*TAU;                 // the mouth ring
   kput(PL,[cx+Math.cos(a)*r1*1.02,yb,cz+Math.sin(a)*r1*1.02],TAN(a),[TAU*r1/18*1.05,3.4,3],null);}
  // the turbopump collar at the throat
  for(let k=0;k<8;k++){const a=k/8*TAU;
   kput(PIPE,[cx+Math.cos(a)*(r0+4),yt-5,cz+Math.sin(a)*(r0+4)],qEuler(0,0,0),[2.2,12,2.2],null);}};
 bell(0,0,10,30,PLGY,52);
 for(let k=0;k<6;k++){const a=k*TAU/6+Math.PI/6;
  bell(Math.cos(a)*86,Math.sin(a)*86,7,24,PLGY,56);}
 for(let k=0;k<24;k++){const a=(k+.5)/24*TAU;             // the throat lighting
  kput('strip',[Math.cos(a)*140,PLGY-3,Math.sin(a)*140],TAN(a),[24,2,2],
   (dd?rng()<.12:true)?WARM.clone().multiplyScalar(rr(.4,.8)):DEAD);}

 // ---- the body --------------------------------------------------------------
 SH.push(gridSurface((u,v)=>BP(u,lerp(BY0,BY1,v),1),176,150,{uS:66,vS:48,
   hole:(u,v)=>bHole(u,lerp(BY0,BY1,v))}));
 // WHAT A HOLE IN THIS BODY LOOKS THROUGH AT. The first pass put a smooth inner
 // drum at 0.80 rB, which is close enough to the skin that the 100 m gash the
 // collar cut read as a black rectangle stuck on the outside — no depth, no
 // interior, nothing to say the thing was inhabited. The core is now pulled
 // right back to 0.52 and the FLOOR PLATES run out to 0.94, so a tear shows a
 // stack of storeys in section, which is the whole point of breaking it open.
 if(dd){
  DKG.push(gridSurface((u,v)=>BP(u,lerp(BY0+3,BY1-3,v),.52),72,64,{uS:26,vS:22}));
  // The plate is PALE and its soffit 1.6 m under it is DARK, in two materials
  // rather than one. A section made entirely of MAT.guts reads as a flat grey
  // lake with no depth in it; the pale/dark banding is the whole of what makes
  // a stack of storeys legible through a tear.
  for(let y=BY0+16;y<BY1-12;y+=9.6){
   FLR.push(gridSurface((u,v)=>{const a=u*TAU,r=rB(y)*flut(a,bt(y))*lerp(.94,.30,v);
     return[Math.cos(a)*r,y,Math.sin(a)*r];},44,2,{uS:16,vS:2,
     hole:(u,v)=>fbm(u*6,v*3+y*.06,9528,3)<.24}));
   DKG.push(gridSurface((u,v)=>{const a=u*TAU,r=rB(y)*flut(a,bt(y))*lerp(.94,.30,v);
     return[Math.cos(a)*r,y-1.6,Math.sin(a)*r];},44,2,{uS:16,vS:2,
     hole:(u,v)=>fbm(u*6,v*3+y*.06+7,9528,3)<.38}));}
  // partitions: radial cross-walls between the core and the skin, so the
  // section reads as rooms rather than as a stack of shelves
  for(let k=0;k<18;k++){const a=k/18*TAU;
   DKG.push(gridSurface((u,v)=>{const y=lerp(BY0+16,BY1-12,u),r=rB(y)*lerp(.92,.54,v);
     return[Math.cos(a)*r,y,Math.sin(a)*r];},40,3,{uS:22,vS:3,
     hole:(u,v)=>fbm(u*7+k,v*2,9528+k,3)<.46}));}}
 // cornice bands every 32 m: 512 m of extrusion read as a stack of things
 for(let y=BY0+20;y<BY1-10;y+=32)
  SH.push(gridSurface((u,w)=>BP(u,y+(2*w-1)*2.2,1.012+.016*Math.sin(Math.PI*w)),152,4,
   {uS:56,vS:3,hole:(u,w)=>bHole(u,y+(2*w-1)*2.2)}));
 // the stringers, on the flute crests — cos(16a) puts those at u = k/16 exactly
 for(let k=0;k<16;k++){const u=k/16;
  for(let y=BY0+4;y<BY1-6;y+=15){
   if(bHole(u,y)||bHole(u,y+15))continue;
   beam(PL,BP(u,y,1.028),BP(u,y+15,1.028),3.6,4.8);}}
 // the occupied storeys
 for(let y=140;y<BY1-8;y+=7.4){
  let near=false;for(let i=0;i<TERR.length;i++)if(Math.abs(y-TERR[i])<8)near=true;
  if(near)continue;
  const n=Math.round(clamp(TAU*rB(y)/7.2,24,120));
  for(let i=0;i<n;i++){const u=(i+((Math.round(y/7.4)%2)?.25:.75))/n;
   if(bHole(u,y))continue;
   if(dd&&rng()<.30)continue;
   const p=BP(u,y,1),a=u*TAU,nx=Math.cos(a),nz=Math.sin(a);
   kput(PN,[p[0]+nx*.9,y,p[2]+nz*.9],qFacing([nx,0,nz]),[4.6,3.4,1],null);
   if(dd?rng()<.05:rng()<.28)
    kput('cell',[p[0]+nx*.25,y,p[2]+nz*.25],qFacing([nx,0,nz]),[4.2,3.0,1],
     litC(true,dd?.10:.30,dd?.30:.80));
   // A balcony on roughly one bay in eighteen. Two boxes each, and they are
   // most of what stops 512 m of window grid reading as an office block: a
   // balcony is the one opening a person is obviously meant to stand in.
   if(i%6===2&&Math.round(y/7.4)%3===0&&!(dd&&rng()<.45)){
    kput(BX,[p[0]+nx*2.6,y-2.0,p[2]+nz*2.6],TAN(a),[6.6,1.1,5.2],null);
    kput(BX,[p[0]+nx*5.0,y-.3,p[2]+nz*5.0],TAN(a),[6.6,2.4,.9],null);}}}
 // ---- the six terraces ------------------------------------------------------
 // The projection is NOT a monotone taper: the second terrace is the city's
 // main promenade and the widest thing on the body, and the ones above it draw
 // in toward the shroud. A straight taper made all six read as one cone.
 for(let ti=0;ti<TERR.length;ti++){const Y=TERR[ti],pr=TPR[ti];
  const hl=u=>bHole(u,Y);
  const tR=(a,f)=>rB(Y)*flut(a,bt(Y))*crush(a,Y)+pr*f;
  SH.push(gridSurface((u,v)=>{const a=u*TAU,r=tR(a,1-v);
    return[Math.cos(a)*r,Y,Math.sin(a)*r];},152,4,{uS:56,vS:5,hole:hl}));
  SH.push(gridSurface((u,v)=>{const a=u*TAU,r=tR(a,v);
    return[Math.cos(a)*r,Y-4.4,Math.sin(a)*r];},152,3,{uS:56,vS:5,hole:hl}));
  SH.push(gridSurface((u,v)=>{const a=u*TAU,r=tR(a,1)*(1+.010*Math.sin(Math.PI*v));
    return[Math.cos(a)*r,Y-4.4+v*4.4,Math.sin(a)*r];},152,3,{uS:56,vS:2,hole:hl}));
  const rOut=rB(Y)+pr;
  {const nP=Math.round(TAU*rOut/9);
   for(let j=0;j<nP;j++){const a=(j+.5)/nP*TAU;
    if(hl(a/TAU)||(dd&&rng()<.24))continue;
    kput(BX,[Math.cos(a)*tR(a,1.01),Y+2.1,Math.sin(a)*tR(a,1.01)],TAN(a),[TAU*rOut/nP*1.06,4.2,2.4],null);}}
  {const nD=Math.round(TAU*rB(Y)/26);
   for(let j=0;j<nD;j++){const a=(j+.35)/nD*TAU;
    if(hl(a/TAU)||(dd&&rng()<.2))continue;
    const p=BP(a/TAU,Y+5,1);
    // the arch is 9 m tall, so its CENTRE has to be 4 m above the deck or the
    // doorway is half buried in the terrace it opens onto
    kput('archOpen',[p[0]+Math.cos(a)*.7,Y+4.0,p[2]+Math.sin(a)*.7],qFacing([Math.cos(a),0,Math.sin(a)]),
     [.92,.86,1.1],null);}}
  {const nL=Math.round(TAU*rOut/17);
   for(let j=0;j<nL;j++){const a=(j+.5)/nL*TAU;
    if(hl(a/TAU))continue;
    kput('strip',[Math.cos(a)*tR(a,.94),Y+4.7,Math.sin(a)*tR(a,.94)],TAN(a),[TAU*rOut/nL*.82,1.6,1.6],
     litC(dd?rng()<.12:true,.4,.95));}}
  // ---- what makes a terrace read as a promenade and not a ledge ------------
  // A kerb trough with planting in it, kiosks backed against the body, and
  // enough people to give the 4 m parapet a scale. The first pass had twenty
  // figures spread over 660 m of ring — statistically none in any frame — and
  // an on-deck shot came back as an empty white floor.
  // THE LANE. The kerb trough sits at 0.78 of the projection and the kiosks
  // back on to the body at 0.14, which leaves a clear walking lane of about
  // 7.5 m between them — and that lane is the only place on the deck a camera
  // (or a person) can stand. At 0.70 / 0.22 it was 4 m wide and an on-deck shot
  // put a kiosk 1.5 m from the lens. Heights are deliberately low too: a 2.4 m
  // hedge and an 8 m kiosk, the first values tried, filled the frame edge to
  // edge from four metres away.
  {const nT=Math.round(TAU*rOut/18);
   for(let j=0;j<nT;j++){const a=(j+.2)/nT*TAU;
    if(hl(a/TAU))continue;
    const r=tR(a,.78);
    kput(BX,[Math.cos(a)*r,Y+.7,Math.sin(a)*r],TAN(a),[TAU*rOut/nT*.50,1.4,4.2],null);
    if(!dd||rng()<.55)kput('hedge',[Math.cos(a)*r,Y+2.0,Math.sin(a)*r],TAN(a),
     [TAU*rOut/nT*.44,1.6,3.0],new THREE.Color().setHSL(rr(.20,.34),rr(.24,.46),dd?rr(.09,.19):rr(.14,.27)));}}
  // Kiosks only on the three WIDE terraces. At pr=10 the kiosk's own depth
  // covers the whole walking lane and there is nowhere on the deck a person —
  // or a camera — could stand; the upper terraces get planting and people only.
  if(pr>=16){const nK=Math.round(TAU*rB(Y)/34);
   for(let j=0;j<nK;j++){const a=(j+.62)/nK*TAU;
    if(hl(a/TAU)||(dd&&rng()<.6))continue;
    const r=tR(a,.14),hk=rr(3.8,6.2);
    kput(BX,[Math.cos(a)*r,Y+hk*.5,Math.sin(a)*r],TAN(a),[rr(7,12),hk,Math.min(6.5,pr*.40)],null);
    if(!dd&&rng()<.55)kput('strip',[Math.cos(a)*(r+3.4),Y+hk+.8,Math.sin(a)*(r+3.4)],TAN(a),
     [8,1.4,1.4],CYAN.clone().multiplyScalar(rr(.5,1)));}}
  for(let j=0;j<(dd?10:46);j++){const a=rng()*TAU;
   if(hl(a/TAU))continue;
   const r=tR(a,rr(.34,.92));
   kput('figB',[Math.cos(a)*r,Y,Math.sin(a)*r],qEuler(0,rng()*TAU,0),1,
    new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
   kput('figH',[Math.cos(a)*r,Y,Math.sin(a)*r],null,1,new THREE.Color(0xc9a17e));}
  // TWO OF THE SIX CARRY A GLAZED GALLERY. Not glassBand(): that helper lays a
  // ledge slab of its own at 1.16x the radius under the glass, which on a
  // terrace that already has a deck hung a 250 m brown disc six metres over the
  // promenade and roofed the whole shot. Built here instead, so the gallery
  // sits on the deck that is already there.
  if(ti===1||ti===4){
   const gy=Y+6,gh=13;
   if(d===0)mesh(lathe({rFn:yy=>rB(gy+yy)*1.045,H:gh,nu:56,nv:4}),MAT.glass,P,0,gy,0);
   SH.push(gridSurface((u,v)=>{const a=u*TAU,r=rB(lerp(gy,gy+gh,v))*flut(a,bt(gy))*1.004;
     return[Math.cos(a)*r,lerp(gy,gy+gh,v),Math.sin(a)*r];},120,4,{uS:44,vS:6,hole:u=>bHole(u,gy)}));
   const nM=Math.round(TAU*rB(gy)/9);
   for(let j=0;j<nM;j++){const a=j/nM*TAU;
    if(hl(a/TAU)||(dd&&rng()<.22))continue;
    kput(dd?'mullR':'mullW',[Math.cos(a)*rB(gy)*1.05,gy+gh*.5,Math.sin(a)*rB(gy)*1.05],
     qEuler(0,-a,0),[1.3,gh,1.3],null);}
   const nS2=Math.round(TAU*rB(gy)/16);
   for(let j=0;j<nS2;j++){const a=(j+.5)/nS2*TAU;
    if(hl(a/TAU))continue;
    kput('strip',[Math.cos(a)*rB(gy)*1.03,gy+gh-1.4,Math.sin(a)*rB(gy)*1.03],TAN(a),
     [TAU*rB(gy)/nS2*.82,1.6,1.6],litC(dd?rng()<.14:true,.5,1));}}}

 // ---- the crown: a payload shroud, not a roof --------------------------------
 // An ogive on four panels, latched to the body by two explosive bands and
 // topped by a pilot mast. Nothing here is habitable and nothing here is a
 // parapet: the point of a shroud is that it is meant to come off.
 // BARREL THEN OGIVE, not one continuous curve. The base radius is 62 against a
 // body that ends at 58 — a 4 m step that reads as a joint; at 70, the first
 // value, the shroud sat on the body like a bulb on a stick. But a single
 // (1-t^2) curve off that base is an EGG, which is what came back: 156 m of
 // blank white dome. A straight-sided barrel to y=660 carrying the latch bands
 // and the ports, with the ogive starting above it, is what makes it read as a
 // shroud — a thing with a joint, a cylinder and a nose.
 const SBAR=660;
 rS=y=>{if(y<=SBAR)return lerp(62,57.5,clamp((y-SY0)/(SBAR-SY0),0,1));
  const t=clamp((y-SBAR)/(SY1-SBAR),0,1);
  return 57.5*Math.pow(clamp(1-t*t,0,1),.55);};
 // The seams between the four panels, as a groove in the radius. At 2.8% deep
 // and 0.05 rad wide they did not survive being seen from 400 m; 5.5% over
 // 0.085 rad reads, and the rib sitting in each one reads with it.
 seamF=a=>{let m=1;for(let k=0;k<4;k++){
   const dA=Math.abs(wrapA(a-(k/4+.125)*TAU));if(dA<.085)m=Math.min(m,1-.055*(1-dA/.085));}
  return m;};
 SH.push(gridSurface((u,v)=>{const a=u*TAU,y=lerp(SY0,SY1,v),r=rS(y)*seamF(a)*(1+.008*Math.cos(12*a));
   return[Math.cos(a)*r,y,Math.sin(a)*r];},128,44,{uS:48,vS:20,
   hole:(u,v)=>shGone(u,lerp(SY0,SY1,v))}));
 // the boat-tail joint down onto the body, and the two latch bands
 SH.push(gridSurface((u,v)=>{const a=u*TAU,r=lerp(rB(BY1)*flut(a,1),62,Math.pow(v,.7));
   return[Math.cos(a)*r,lerp(BY1-9,SY0,v),Math.sin(a)*r];},128,4,{uS:48,vS:3}));
 for(let b=0;b<2;b++){const y=SY0+4+b*13;
  const nb=Math.round(TAU*rS(y)/7);
  for(let j=0;j<nb;j++){const a=(j+.5)/nb*TAU;
   if(shGone(a/TAU,y+10)&&rng()<.6)continue;
   kput(PL,[Math.cos(a)*rS(y)*1.02,y,Math.sin(a)*rS(y)*1.02],TAN(a),[TAU*rS(y)/nb*1.05,4.4,3.2],null);}}
 for(let k=0;k<4;k++){const a=(k/4+.125)*TAU;             // the seam ribs
  for(let i=0;i<20;i++){const y0=lerp(SY0,SY1-6,i/20),y1=lerp(SY0,SY1-6,(i+1)/20);
   if(shGone(a/TAU+.01,y0)||shGone(a/TAU-.01,y0))continue;
   beam(PL,[Math.cos(a)*rS(y0)*1.018,y0,Math.sin(a)*rS(y0)*1.018],
            [Math.cos(a)*rS(y1)*1.018,y1,Math.sin(a)*rS(y1)*1.018],3.0,3.6);}}
 for(let i=0;i<18;i++){const y=SY0+16+i*22;               // sensor ports
  if(y>SY1-30)break;
  for(let k=0;k<3;k++){const a=(k/3+.06*i)*TAU;
   if(shGone(a/TAU,y))continue;
   kput(dd?'ovalD':'ovalI',[Math.cos(a)*rS(y)*1.01,y,Math.sin(a)*rS(y)*1.01],
    qFacing([Math.cos(a),0,Math.sin(a)]),[2.6,2.6,1],null);}}
 // TWENTY STRINGERS AND SEVEN FRAME BANDS. The body earns its verticals from
 // sixteen flutes in the surface itself; the shroud has no flutes, so without
 // these the nose was the one part of an 838 m structure with nothing on it at
 // all — a smooth white dome sitting on a building covered in relief.
 for(let k=0;k<20;k++){const a=(k+.5)/20*TAU;
  for(let i=0;i<16;i++){const y0=lerp(SY0+2,SY1-14,i/16),y1=lerp(SY0+2,SY1-14,(i+1)/16);
   if(shGone(a/TAU,y0))continue;
   if(rS(y1)<3)break;
   beam(PL,[Math.cos(a)*rS(y0)*1.012,y0,Math.sin(a)*rS(y0)*1.012],
            [Math.cos(a)*rS(y1)*1.012,y1,Math.sin(a)*rS(y1)*1.012],2.0,2.6);}}
 for(let i=0;i<7;i++){const y=lerp(SY0+30,SY1-26,i/6),rr2=rS(y);
  if(rr2<5)continue;
  const nb=Math.max(10,Math.round(TAU*rr2/9));
  for(let j=0;j<nb;j++){const a=(j+.5)/nb*TAU;
   if(shGone(a/TAU,y)||(dd&&rng()<.2))continue;
   kput(PL,[Math.cos(a)*rr2*1.016,y,Math.sin(a)*rr2*1.016],TAN(a),[TAU*rr2/nb*1.06,2.4,2.0],null);}}
 // a lit ring at the barrel/ogive joint, so the crown has a signal on it
 {const nr=Math.round(TAU*rS(SBAR)/13);
  for(let j=0;j<nr;j++){const a=(j+.5)/nr*TAU;
   if(shGone(a/TAU,SBAR))continue;
   kput('strip',[Math.cos(a)*rS(SBAR)*1.03,SBAR,Math.sin(a)*rS(SBAR)*1.03],TAN(a),
    [TAU*rS(SBAR)/nr*.78,1.6,1.6],litC(dd?rng()<.08:true,.5,1));}}
 // the payload frame inside: ring frames and longerons, seen once a panel goes
 if(dd){
  for(let i=0;i<8;i++){const y=SY0+10+i*17;
   DKG.push(gridSurface((u,v)=>{const a=u*TAU,r=rS(y)*.78*(1-v*.14);
     return[Math.cos(a)*r,y,Math.sin(a)*r];},40,2,{uS:14,vS:2}));}
  // The payload stack was one smooth lathe — a grey bottle inside the frames.
  // Its skin now comes in panels with whole bays missing (a hash per 3 x 2.5
  // cells, so nothing here draws from the stream), and a spine with six
  // spokes at every frame holds it to the ring frames, so the opened shroud
  // shows a structure with an inside rather than a second, darker shroud.
  DKG.push(gridSurface((u,v)=>{const a=u*TAU,y=lerp(SY0,SY1-24,v);
    return[Math.cos(a)*rS(y)*.62,y,Math.sin(a)*rS(y)*.62];},48,20,{uS:18,vS:12,
    hole:(u,v)=>h3(Math.floor(u*16),Math.floor(v*8),9531)<.38}));
  beam(PL,[0,SY0+4,0],[0,SY1-30,0],7,7);
  for(let i=0;i<8;i++){const y=SY0+10+i*17;
   for(let k=0;k<6;k++){const a=(k+.5*(i%2))/6*TAU;
    beam(PL,[0,y,0],[Math.cos(a)*rS(y)*.78,y,Math.sin(a)*rS(y)*.78],1.6,2.2);}}
  for(let k=0;k<12;k++){const a=k/12*TAU;
   for(let i=0;i<7;i++){const y0=SY0+10+i*17,y1=y0+17;
    beam(PL,[Math.cos(a)*rS(y0)*.78,y0,Math.sin(a)*rS(y0)*.78],
             [Math.cos(a)*rS(y1)*.78,y1,Math.sin(a)*rS(y1)*.78],2,2);}}}
 // the pilot mast
 if(!dd||rng()<.5){
  SH.push(gridSurface((u,v)=>{const a=u*TAU,r=lerp(rS(SY1-2),1.1,Math.pow(v,.8));
    return[Math.cos(a)*r,lerp(SY1-2,STIP,v),Math.sin(a)*r];},24,10,{uS:8,vS:8}));
  if(!dd){kput('finial',[0,STIP+4,0],null,[3.4,8,3.4],null);
   for(let k=0;k<8;k++){const a=k/8*TAU;
    kput('strip',[Math.cos(a)*3.6,STIP-10,Math.sin(a)*3.6],TAN(a),[3,1.2,1.2],CYAN);}}}

 // ---- the umbilical arms: the gantry's reach, and the city's front door ------
 // Placed here, inside P, because the ARM is part of the picture of a vehicle
 // being serviced; the ring it hangs off is outside. The two ends are computed
 // in different frames on purpose — BWP() puts the body end where the leaning
 // body actually is, which is what makes the torn arms in the ruin read.
 endGroupXF();
 for(let k=0;k<6;k++){const a=SBEAR(k),ca=Math.cos(a),sa=Math.sin(a);
  if(mastBroke(k)||ringGap(a))continue;
  for(let lev=0;lev<3;lev++){const y=CY0+lev*34;
   const B=BWP(a/TAU,y,1);
   const inr=Math.hypot(B[0],B[2]);
   beam(GRT,[ca*CRI,y,sa*CRI],[B[0]+ca*3,y+(B[1]-y)*.4,B[2]+sa*3],7,5.4);
   for(let e=-1;e<=1;e+=2)beam(PL,[ca*CRI-e*4*sa,y+3.4,sa*CRI+e*4*ca],
     [B[0]+ca*3-e*4*sa,y+(B[1]-y)*.4+3.4,B[2]+sa*3+e*4*ca],2.8,1.4);
   // the hose bundle, sagging between the ring and the plug head
   if(lev!==1)for(let h=-1;h<=1;h+=2){
    const mx=(ca*CRI+B[0])/2-h*6*sa,mz=(sa*CRI+B[2])/2+h*6*ca;
    beam(PIPE,[ca*(CRI+4)-h*6*sa,y-2,sa*(CRI+4)+h*6*ca],[mx,y-11,mz],2.4,2.4);
    beam(PIPE,[mx,y-11,mz],[B[0]+ca*4-h*6*sa,y+(B[1]-y)*.4-2,B[2]+sa*4+h*6*ca],2.4,2.4);}
   kput(PAD,[ca*(CRI-6),y+1,sa*(CRI-6)],qEuler(Math.PI/2,0,0),[8,7,8],null);
   kput(GRT,[B[0]+ca*4,y+(B[1]-y)*.4,B[2]+sa*4],qEuler(0,-a,0),[12,9,8],null);
   if(!dd)kput('strip',[(ca*CRI+B[0])/2,y+5.2,(sa*CRI+B[2])/2],TAN(a),[inr*.3,1.6,1.6],CYAN);}
  // THE TWO LOWER ACCESS BRIDGES, mast to terrace. The clear span is ~175 m —
  // the masts had to move out to r=300 to clear the skirt — so these are proper
  // Warren trusses with a bottom chord 24 m down, not a deck on props. A deck
  // beam alone at this length reads as a plank and makes the whole complex look
  // like a model.
  for(let bi=0;bi<2;bi++){const y=TERR[bi===0?0:2];
   const B=BWP(a/TAU,y,1);
   const X0=[ca*(MSTR-15),sa*(MSTR-15)],X1=[B[0]+ca*2,B[2]+sa*2];
   const px=t=>lerp(X0[0],X1[0],t),pz=t=>lerp(X0[1],X1[1],t);
   beam(GRT,[X0[0],y,X0[1]],[X1[0],y,X1[1]],1.8,11);
   beam(PL,[X0[0],y-24,X0[1]],[X1[0],y-24,X1[1]],2.6,6.0);
   for(let e=-1;e<=1;e+=2)beam(PL,[X0[0]-e*4.8*sa,y+3.4,X0[1]+e*4.8*ca],
     [X1[0]-e*4.8*sa,y+3.4,X1[1]+e*4.8*ca],2.8,1.4);
   const nS=Math.max(3,Math.round(Math.hypot(X1[0]-X0[0],X1[1]-X0[1])/22));
   for(let j=0;j<=nS;j++){const t=j/nS;
    beam(PL,[px(t),y-1,pz(t)],[px(t),y-23,pz(t)],2.6,2.6);
    if(j<nS)beam(PL,[px(t),y-23,pz(t)],[px(t+1/nS),y-1,pz(t+1/nS)],2.2,2.2);}
   if(!dd)kput('strip',[px(.5),y+4.6,pz(.5)],TAN(a),
    [Math.hypot(X1[0]-X0[0],X1[1]-X0[1])*.4,1.6,1.6],CYAN);}}
 useGroupXF(P);

 // ---- the ruin's dressing on the vehicle ------------------------------------
 // PEELED PLATE ROUND THE GASH. The tear is a hole in a 0.4 m skin; with a
 // clean edge it reads as a rectangle cut out with scissors, however ragged the
 // predicate is. These walk OUT from the centre of the gash at a given height
 // until bHole stops being true — which is the actual edge, wherever the fbm
 // put it — and hang a bent plate off it.
 if(dd)for(let i=0;i<64;i++){const y=rr(298,412);
  for(let sgn=-1;sgn<=1;sgn+=2){
   if(rng()<.42)continue;
   let u=(LA+sgn*.04)/TAU;const st=sgn*.0035;let gu=null;
   for(let s2=0;s2<50;s2++){if(!bHole(u,y))break;gu=u;u+=st;}
   if(gu===null)continue;
   const p=BP(gu,y,1),a=gu*TAU;
   beam(PL,[p[0],y,p[2]],
         [p[0]+Math.cos(a)*rr(3,13)+rr(-5,5),y-rr(4,22),p[2]+Math.sin(a)*rr(3,13)+rr(-5,5)],
    rr(2,6.5),rr(1.4,4));}}
 if(dd){mossOnSurface(SH,0,0,0,150,4.4);
  vinesFromLedge(SH,0,0,0,120,22);
  stainsFromLedge(SH,0,0,0,170,24);}
 endGroupXF();
 }
 if(SH.length)meshMerged(SH,skin,P);
 if(DKG.length)meshMerged(DKG,MAT.guts,P);
 if(FLR.length)meshMerged(FLR,CONC(dd),P);
 if(BEL.length)meshMerged(BEL,bellM,P);

 // ===========================================================================
 // BACK ON THE GROUND
 // ===========================================================================
 meshMerged(GRD,deckM,G);
 meshMerged(SCO,scorchM,G);
 meshMerged(MND,dd?MAT.mud:MAT.rock,G);
 meshMerged(STL,bellM,G);
 // Started WELL INSIDE the berm toe, not just outside it: both are MAT.rock /
 // MAT.mud so the overlap is invisible, whereas a gap is not.
 apron(G,0,0,MNDR*.86,MNDR*1.18,d,10);

 // people and vehicles on the pad
 for(let i=0;i<(dd?10:46);i++){const a=rng()*TAU,r=rr(268,APR-26);
  const x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(inTrench(x,z,10)>=0||crushHole(x,z))continue;
  kput('figB',[x,APY,z],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
  kput('figH',[x,APY,z],null,1,new THREE.Color(0xc9a17e));}
 for(let i=0;i<(dd?6:16);i++){const a=rng()*TAU,r=rr(276,APR-34);
  const x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(inTrench(x,z,16)>=0||crushHole(x,z))continue;
  const hh=rr(4,9);
  kput(dd?'boxR':'boxW',[x,APY+hh*.5,z],qEuler(0,rng()*TAU,0),[rr(8,20),hh,rr(7,15)],null);}
 // perimeter stacks between the trenches: vents for the pit, and mast lighting
 for(let k=0;k<24;k++){const a=(k+.5)/24*TAU,r=APR*PF(a)*.93;
  const x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(inTrench(x,z,22)>=0)continue;
  if(dd&&rng()<.35)continue;
  const hh=rr(16,34);
  kput(COLN,[x,APY,z],null,[3.2,hh,3.2],null);
  kput(PL,[x,APY+hh,z],qEuler(0,-a,0),[7,3,5],null);
  if(!dd||rng()<.15)kput('strip',[x,APY+hh+2.4,z],TAN(a),[6,1.6,1.6],WARM.clone().multiplyScalar(rr(.4,.9)));}

 // ---- what fell --------------------------------------------------------------
 let fallen=null;
 if(dd&&!pad){
  // one of the two lost shroud panels, thrown clear of the berm
  const q0=LA+Math.PI/4-1.05,q1=LA+Math.PI/4+1.05;
  const fg=gridSurface((u,v)=>{const a=lerp(q0,q1,u),y=lerp(SY0+20,SY1-6,v),r=rS(y)*seamF(a);
    return[Math.cos(a)*r,y,Math.sin(a)*r];},44,34,{uS:16,vS:14});
  const fi=gridSurface((u,v)=>{const a=lerp(q0+.02,q1-.02,u),y=lerp(SY0+22,SY1-8,v),r=rS(y)*.965;
    return[Math.cos(a)*r,y,Math.sin(a)*r];},30,22,{uS:11,vS:9});
  fg.computeBoundingBox();const bc=fg.boundingBox.getCenter(new THREE.Vector3());
  fg.translate(-bc.x,-bc.y,-bc.z);fi.translate(-bc.x,-bc.y,-bc.z);
  const FA2=LA+Math.PI*1.13,FR=700;
  const F=new THREE.Group();F.position.set(Math.cos(FA2)*FR,0,Math.sin(FA2)*FR);
  F.rotation.set(.16,FA2+.6,1.44);G.add(F);
  mesh(fg,skin,F);mesh(fi,MAT.guts,F);
  dropFragment(F,0,2.0);
  // fragBox() unions the AABBs of ROTATED boxes, which over-reaches for a piece
  // this long and leaves it hanging. Re-seat it on its own true lowest vertex.
  {F.updateMatrix();const fp=fg.attributes.position.array,fv=new THREE.Vector3();let my=Infinity;
   for(let i=0;i<fp.length;i+=3){fv.set(fp[i],fp[i+1],fp[i+2]).applyMatrix4(F.matrix);if(fv.y<my)my=fv.y;}
   if(isFinite(my))F.position.y+=-1.6-my;F.updateMatrix();}
  fallen=[F.position.x,F.position.y,F.position.z];
  useGroupXF(F);
  for(let k=0;k<4;k++){const a=lerp(q0,q1,(k+.5)/4);
   for(let i=0;i<9;i++){const y0=lerp(SY0+22,SY1-10,i/9),y1=lerp(SY0+22,SY1-10,(i+1)/9);
    beam(PL,[Math.cos(a)*rS(y0)*1.02-bc.x,y0-bc.y,Math.sin(a)*rS(y0)*1.02-bc.z],
             [Math.cos(a)*rS(y1)*1.02-bc.x,y1-bc.y,Math.sin(a)*rS(y1)*1.02-bc.z],2.6,3.0);}}
  endGroupXF();
  lxRubble(F.position.x,0,F.position.z,14,90,70,4.4);
  // A shroud panel is 150 m of ribbed METAL: what comes off it is torn plate
  // and snapped stringer, not boulders, so the debris field gets both.
  for(let i=0;i<34;i++){const a=rng()*TAU,r=rr(22,96),L=rr(6,26);
   const x=F.position.x+Math.cos(a)*r,z=F.position.z+Math.sin(a)*r,b2=rng()*TAU;
   beam(PL,[x,rr(.4,3),z],[x+Math.cos(b2)*L,rr(.4,5),z+Math.sin(b2)*L],rr(1.6,5),rr(1.2,3.4));}
  scatterMoss(F.position.x,0,F.position.z,10,80,40,3);
  // the crater in the apron, and the debris the skirt rim pushed ahead of it
  lxRubble(Math.cos(LA)*276,APY-1,Math.sin(LA)*276,20,106,180,6.5);
  lxRubble(0,PITY,0,PITR*.55,PITR-8,110,5.2);
  scatterMoss(0,APY,0,256,APR-10,150,3.4);
  scatterMoss(0,PITY,0,90,PITR-6,90,3);
  lxRubble(0,0,0,MNDR*.98,MNDR*1.20,150,6);
  trees(0,0,MNDR*1.06,MNDR*1.9,120);
  for(let i=0;i<26;i++){const a=rng()*TAU,r=rr(272,APR-18);
   const x=Math.cos(a)*r,z=Math.sin(a)*r;
   if(inTrench(x,z,10)>=0)continue;
   VEG.tree(x,APY,z,i%3,rr(6,15));}}
 else{trees(0,0,MNDR*1.08,MNDR*1.8,54);
  for(let i=0;i<10;i++){const a=rng()*TAU,r=rr(MNDR*1.02,MNDR*1.15);
   kput('figB',[Math.cos(a)*r,terrainH(gx+Math.cos(a)*r,gz+Math.sin(a)*r),Math.sin(a)*r],
    qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
   kput('figH',[Math.cos(a)*r,terrainH(gx+Math.cos(a)*r,gz+Math.sin(a)*r),Math.sin(a)*r],
    null,1,new THREE.Color(0xc9a17e));}}
 if(dd&&fallen)REGISTER({name:'Launch Arcology — the fallen shroud panel',
   x:fallen[0],z:fallen[2],y:-4,r:110,h:80});

 // What the camera presets are derived from. rB/BWP are the builder's own
 // functions, so a preset asking to stand on terrace 3 at bearing 40 deg
 // resolves through exactly the geometry that was built.
 // Keyed by decay AND by pad, or the four sites would write into two slots and
 // the empty-pad row (built last) would capture every camera preset — which
 // is exactly what happened the first time.
 LXSITE[pad?'p'+d:d]={x:gx,z:gz,d:d,dd:dd,pad:!!pad,APY:APY,APR:APR,MNDR:MNDR,PITR:PITR,PITY:PITY,DEFR:DEFR,
  BY0:BY0,BY1:BY1,SKRO:SKRO,SKY0:SKY0,SKY1:SKY1,PLGY:PLGY,SY0:SY0,SY1:SY1,STIP:STIP,
  CY0:CY0,CY1:CY1,CRI:CRI,CRO:CRO,MSTR:MSTR,MSTY:MSTY,SVR:SVR,SVY:SVY,
  HW:HW,TS0:TS0,TS1:TS1,SCL:SCL,LA:LA,TILT:TILT,TERR:TERR,TPR:TPR,
  rB:rB,rS:rS,BP:BP,BWP:BWP,PF:PF,TBEAR:TBEAR,SBEAR:SBEAR,FALLEN:fallen};
 KOFF=[0,0,0];return G;}
