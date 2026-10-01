// TARGET: kit — the 32-type showcase. One row per type, intact west / ruined east.
//
// Theodiga (the dam arcology) is deliberately NOT here. It is the single
// heaviest structure in the kit and is being taken up as its own piece of work,
// so it has its own target: targets/theodiga/. buildDam still ships in this
// file's <script> — only the site is gone — so the two targets cannot drift.
// FOLDING IN THE REHABILITATED VARIANTS (decay 3) — MEASURED, AND IT DOES NOT FIT.
// Set DECAYS to [0,1,2,3] below and the whole `repaired` target collapses into
// this one: SITEX already puts level 3 at x=0, which is the empty middle of
// every row view, and the RUINS line below already greens that site. Placement
// was rendered and is clean at every row width down to s=120 (the houses).
// The ONLY blocker is the ceiling. Measured, not estimated:
//     kit as shipped        5 346 054   (74 type/decay pairs)
//     with decay 3 folded   7 212 766   (107 pairs)  = 1 212 766 OVER 6 000 000
// The `repaired` showcase on its own is 1 774 956 for 31 types; perch, flat and
// cult account for the rest. Nothing has been dropped or thinned to make it
// fit, because that is the user's call, not this file's.
const TITLE='Krator Ancients kit';
const DECAYS=[0,1,2];
const GROUND_C=11000;        // z centre of the ground plane and its paint
// skyA, skyD and skyH carry a fourth variant the other types do not: `ds`
// overrides the target's DECAYS for that row alone and `j` is its x, the way
// `t` is the toppled x. Decay 4 is THE PROJECTS — Skyscraper A, the Monolith
// and the Warden rehabilitated and STILL STANDING, the buildings a later people
// reoccupied whole rather than camped in the stump of. Each stands west of its
// own intact tower, so every existing three-variant row shot is unchanged.
const ROWS={skyA:{z:0,s:300,r:280,t:1200,j:-1150,ds:[0,1,2,4]},skyB:{z:800,s:300,r:260,t:1200},skyC:{z:1600,s:300,r:280,t:1200},mega:{z:2900,s:700,r:520},fac:{z:4000,s:330,r:330},port:{z:5400,s:540,r:420},
 gov:{z:6500,s:270,r:190},lib:{z:7100,s:220,r:130},bunk:{z:7600,s:220,r:130},off:{z:8100,s:265,r:260},apt:{z:8600,s:520,r:300},amph:{z:9200,s:220,r:130},
 fuel:{z:9600,s:150,r:80},radar:{z:9900,s:150,r:70},dish:{z:10200,s:150,r:80},house:{z:10500,s:120,r:120},lab:{z:10900,s:420,r:200},house2:{z:11400,s:120,r:120},skyD:{z:12100,s:300,r:280,t:1200},skyE:{z:12900,s:300,r:280,t:1200},skyF:{z:13700,s:300,r:280,t:1200},arc:{z:14900,s:800,r:520},robo:{z:15900,s:330,r:280},campus:{z:17100,s:600,r:420},skyG:{z:18100,s:320,r:300,t:1300},skyH:{z:18900,s:300,r:280,t:1200},dc:{z:19700,s:400,r:330},police:{z:20300,s:180,r:110},hosp:{z:20800,s:260,r:170},hotel:{z:21400,s:260,r:170},cult:{z:22500,s:400,r:330},
 perch:{z:24200,s:430,r:330},
 flat:{z:25400,s:300,r:200}};
const RUINS=Object.values(ROWS).flatMap(r=>(r.t?[[r.s,r.z,r.r],[r.t,r.z,r.r*1.4]]:[[r.s,r.z,r.r]])
 .concat((r.ds||DECAYS).indexOf(3)<0?[]:[[0,r.z,r.r]])
 .concat(r.j==null?[]:[[r.j,r.z,r.r]]));
const EXTRA_BUILDERS={cult:buildCultural,perch:buildPerch,flat:buildFlatiron};
