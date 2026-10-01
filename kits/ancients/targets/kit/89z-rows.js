// TARGET: kit — the 32-type showcase. One row per type, intact west / ruined east.
//
// Theodiga (the dam arcology) is deliberately NOT here. It is the single
// heaviest structure in the kit and is being taken up as its own piece of work,
// so it has its own target: targets/theodiga/. buildDam still ships in this
// file's <script> — only the site is gone — so the two targets cannot drift.
// THE REHABILITATED VARIANTS (decay 3) ARE FOLDED IN. Every row now carries
// intact (x=-s), ruined (x=+s), toppled (x=t, towers only) AND rehabilitated at
// x=0, the empty middle of every row view, which is why the row presets needed
// no change. This used to be its own target (`repaired`); it was kept apart only
// because it did not fit the 6 000 000 ceiling: measured at 7 212 766 with the
// fold. The user chose to take the fold and accept the overage (the ceiling is a
// target, not a gate), so --assert will report the showcase as OVER.
const TITLE='Krator Ancients kit';
const DECAYS=[0,1,2,3];
// GROUND_C (z centre of the ground plane and its paint) and GROUND_S (its side)
// are set after ROWS, below: the alternates rows run the kit far north.
// skyA, skyD and skyH carry a fourth variant the other types do not: `ds`
// overrides the target's DECAYS for that row alone and `j` is its x, the way
// `t` is the toppled x. Decay 4 is THE PROJECTS — Skyscraper A, the Monolith
// and the Warden rehabilitated and STILL STANDING, the buildings a later people
// reoccupied whole rather than camped in the stump of. Each stands west of its
// own intact tower, so every existing three-variant row shot is unchanged.
const ROWS={skyA:{z:0,s:300,r:280,t:1200,j:-1150,ds:[0,1,2,3,4]},skyB:{z:800,s:300,r:260,t:1200},skyC:{z:1600,s:300,r:280,t:1200},mega:{z:2900,s:700,r:520},fac:{z:4000,s:330,r:330},port:{z:5400,s:540,r:420},
 gov:{z:6500,s:270,r:190},lib:{z:7100,s:220,r:130},bunk:{z:7600,s:220,r:130},off:{z:8100,s:265,r:260},apt:{z:8600,s:520,r:300},amph:{z:9200,s:220,r:130},
 fuel:{z:9600,s:150,r:80},radar:{z:9900,s:150,r:70},dish:{z:10200,s:150,r:80},house:{z:10500,s:120,r:120},lab:{z:10900,s:420,r:200},house2:{z:11400,s:120,r:120},skyD:{z:12100,s:300,r:280,t:1200,j:-1150,ds:[0,1,2,3,4]},skyE:{z:12900,s:300,r:280,t:1200},skyF:{z:13700,s:300,r:280,t:1200},arc:{z:14900,s:800,r:520},robo:{z:15900,s:330,r:280},campus:{z:17100,s:600,r:420},skyG:{z:18100,s:320,r:300,t:1300},skyH:{z:18900,s:300,r:280,t:1200,j:-1150,ds:[0,1,2,3,4]},dc:{z:19700,s:400,r:330},police:{z:20300,s:180,r:110},hosp:{z:20800,s:260,r:170},hotel:{z:21400,s:300,r:170},cult:{z:22500,s:640,r:330},
 perch:{z:24200,s:520,r:330},
 flat:{z:25400,s:380,r:200,t:1200},   // t: the Flatiron topples too (2026-09-29)
 // Skyscrapers I, J and K (added 2026-09-29): each built in its own dev target
 // (skyi/skyj/skyk) first, then given a row here like A-H.
 skyI:{z:26400,s:300,r:280,t:1200},skyJ:{z:27200,s:300,r:280,t:1200},skyK:{z:28000,s:300,r:280,t:1200},
 // The Lighthouse island (a modified Skyscraper J, 2026-09-29): its own sea,
 // shared by the three sites at -320/0/+320; built in targets/lighthouse first.
 lighthouse:{z:28800,s:320,r:300,t:1250}};
// THE ALTERNATES (queue item 3, 2026-10-01): 29 from-scratch builders after the
// arco1/arco2 references, built in their own dev targets (alt-towers,
// alt-domestic, alt-civic) and given rows here north of the Lighthouse. Their
// decay 2 is RECLAIMED (the ruin lived in), not toppled, and stands at t=2s,
// the site SITEX gives decay 2. Spacing: each row clears the last by both
// radii plus 300 m. A row is listed only when its builder exists.
const KIT_ALTS=[
 // key       builder                  s    r   name
 ['altBole', 'buildAltBole',         380, 180,'The Bole'],
 ['altStack','buildAltStack',        300, 150,'The Pierced Stack'],
 ['altHotel','buildAltHotel',        300, 150,'The Attraction'],
 ['altFlat', 'buildAltFlat',         260, 130,'The Undulant'],
 ['altPerch','buildAltPerch',        420, 210,'The Rig (perch)'],
 ['altCult', 'buildAltCult',         300, 170,'The Bloom'],
 ['adWave',  'buildAltWaveHouse',     80,  40,'Undulant house'],
 ['adBridge','buildAltBridgeHouse',   80,  40,'Bridge house'],
 ['adFins',  'buildAltFinApartments',190, 110,'Fin apartments'],
 ['adAmph',  'buildAltAmphitheater', 170,  95,'Garden amphitheater'],
 ['adFuel',  'buildAltFuelStation',  110,  55,'Trestle fuel station'],
 ['adRadar', 'buildAltRadar',         90,  45,'Rotor radar'],
 ['adDish',  'buildAltDish',         120,  60,'Flower dish'],
 ['adFac',   'buildAltFactory',      380, 200,'Pilotis works'],
 ['adLab',   'buildAltLab',          230, 120,'Star laboratory'],
 ['adMega',  'buildAltMega',         900, 420,'The Rampart'],
 ['altOffT', 'buildAltOfficeTerrace',170, 110,'Terrace Wedge office'],
 ['altOffS', 'buildAltOfficeStack',  150, 100,'Stacked Piers office'],
 ['altOffF', 'buildAltOfficeFins',   190, 120,'Sail Fins office'],
 ['altPort', 'buildAltStarport',     330, 260,'Saucer Deck starport'],
 ['altBunk', 'buildAltBunker',       170, 110,'Bastion Drum bunker'],
 ['altLib',  'buildAltLibrary',      170, 110,'Reading Star library'],
 ['altGate', 'buildAltGate',         380, 220,'The Horns gate'],
 ['altRobo', 'buildAltRobotics',     230, 160,'Robotics rig'],
 ['altDc',   'buildAltDataCenter',   200, 140,'Perforated Stacks data center'],
 ['altPolice','buildAltPolice',      130,  80,'Watch Cup police'],
 ['altHosp', 'buildAltHospital',     200, 140,'Linked Blocks hospital'],
 ['altCampus','buildAltCampus',      300, 220,'Garden Bowl campus'],
 ['altGov',  'buildAltGovernment',   220, 150,'The Citadel'],
 // The Yuni fork's variants (src/8am-yv-*, built in targets/yuni-variants):
 // decays 0, 1 and 3 only (their decay 2 is not defined), so no `t` site.
 ['yvQuad',  'buildYvQuad',          150,  75,'Quadrangle (the Cloisters)',[0,1,3]],
 ['yvComb',  'buildYvCombShort',     100,  50,'Honeycomb short block',[0,1,3]],
 ['yvTerr',  'buildYvTerrace',       100,  50,'Terrace stack roofed',[0,1,3]],
 ['yvDish',  'buildYvDish',          140,  70,'Dish intact (the Ear)',[0,1,3]],
 ['yvHosp',  'buildYvHospital4',     280, 140,'Hospital four towers',[0,1,3]],
];
const KIT_ALT_NAME={},KIT_ALT_BUILDERS={};
{let z=ROWS.lighthouse.z,rp=ROWS.lighthouse.r;
 for(const[k,fn,s,r,name,ds]of KIT_ALTS){if(typeof self[fn]!=='function')continue;
  z+=rp+r+300;rp=r;ROWS[k]=ds?{z,s,r,ds}:{z,s,r,t:2*s};KIT_ALT_BUILDERS[k]=self[fn];KIT_ALT_NAME[k]=name;}}
// TOWER STUMPS (src/8an-iz-stumps.js, built in targets/iziz-variants): the snapped
// lower storeys of a sibling tower, one per skyscraper family, standing in its
// tower's row 650 m beyond the toppled site (decay 1 only, at x=+s).
const KIT_STUMPS={};
for(const f of'ABCDEFGHIJK'){const T=ROWS['sky'+f],fn=self['buildStump'+f];if(!T||typeof fn!=='function')continue;
 ROWS['stump'+f]={z:T.z,s:(T.t||1200)+650,r:T.r*.8,ds:[1]};KIT_STUMPS['stump'+f]=fn;}
const KIT_Z1=Math.max(...Object.values(ROWS).map(r=>r.z))+1500;
const GROUND_C=(KIT_Z1-9000)/2, GROUND_S=Math.max(40000,KIT_Z1+9000+4000);
const RUINS=Object.values(ROWS).flatMap(r=>(r.t?[[r.s,r.z,r.r],[r.t,r.z,r.r*1.4]]:[[r.s,r.z,r.r]])
 .concat((r.ds||DECAYS).indexOf(3)<0?[]:[[0,r.z,r.r]])
 .concat(r.j==null?[]:[[r.j,r.z,r.r]]));
// SPACING (2026-09-29). With the rehabilitated variant at x=0, a row whose `s`
// was sized for two sites put three structures in it: the Cultural centre's
// 250 m platform and 310 m apron at s=400 laid the rehabilitated Wheel over a
// third of the intact one. cult 400->640, perch 430->520, flat 300->380 and
// hotel 260->300 each give the three sites their own ground; the presets of
// those rows are written off ROWS.<k>.s, so they follow.
const EXTRA_BUILDERS={cult:buildCultural,perch:buildPerch,flat:buildFlatiron,skyI:buildSkyI,skyJ:buildSkyJ,skyK:buildSkyK,lighthouse:buildLighthouse,...KIT_ALT_BUILDERS,...KIT_STUMPS};
