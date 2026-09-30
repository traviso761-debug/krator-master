// TARGET: worn — every type in the kit twice: intact (x=-s) and WORN (x=+s, decay 5,
// 69w-worn.js). Worn is the intact structure, whole, weathered: rust bleeding
// from seams and fasteners, streaks under every ledge and sill, flush rusted
// plates where the white skin has gone, and a few tufts on the tall towers only.
// The row table is the kit target's, with the per-row `ds` overrides dropped so
// every row shows exactly DECAYS; there are no ruins, so RUINS is empty.
// Keep ROWS in step with targets/kit/89z-rows.js when a type is added there.
const TITLE='Krator Ancients — worn';
const DECAYS=[0,5];
const GROUND_C=11000;        // z centre of the ground plane and its paint
// skyA, skyD and skyH carry a fourth variant the other types do not: `ds`
// overrides the target's DECAYS for that row alone and `j` is its x, the way
// `t` is the toppled x. Decay 4 is THE PROJECTS — Skyscraper A, the Monolith
// and the Warden rehabilitated and STILL STANDING, the buildings a later people
// reoccupied whole rather than camped in the stump of. Each stands west of its
// own intact tower, so every existing three-variant row shot is unchanged.
const ROWS={skyA:{z:0,s:300,r:280,t:1200,j:-1150},skyB:{z:800,s:300,r:260,t:1200},skyC:{z:1600,s:300,r:280,t:1200},mega:{z:2900,s:700,r:520},fac:{z:4000,s:330,r:330},port:{z:5400,s:540,r:420},
 gov:{z:6500,s:270,r:190},lib:{z:7100,s:220,r:130},bunk:{z:7600,s:220,r:130},off:{z:8100,s:265,r:260},apt:{z:8600,s:520,r:300},amph:{z:9200,s:220,r:130},
 fuel:{z:9600,s:150,r:80},radar:{z:9900,s:150,r:70},dish:{z:10200,s:150,r:80},house:{z:10500,s:120,r:120},lab:{z:10900,s:420,r:200},house2:{z:11400,s:120,r:120},skyD:{z:12100,s:300,r:280,t:1200,j:-1150},skyE:{z:12900,s:300,r:280,t:1200},skyF:{z:13700,s:300,r:280,t:1200},arc:{z:14900,s:800,r:520},robo:{z:15900,s:330,r:280},campus:{z:17100,s:600,r:420},skyG:{z:18100,s:320,r:300,t:1300},skyH:{z:18900,s:300,r:280,t:1200,j:-1150},dc:{z:19700,s:400,r:330},police:{z:20300,s:180,r:110},hosp:{z:20800,s:260,r:170},hotel:{z:21400,s:260,r:170},cult:{z:22500,s:400,r:330},
 perch:{z:24200,s:430,r:330},
 flat:{z:25400,s:300,r:200},
 // Skyscrapers I, J and K (added 2026-09-29): each built in its own dev target
 // (skyi/skyj/skyk) first, then given a row here like A-H.
 skyI:{z:26400,s:300,r:280,t:1200},skyJ:{z:27200,s:300,r:280,t:1200},skyK:{z:28000,s:300,r:280,t:1200}};
const RUINS=[];
const EXTRA_BUILDERS={cult:buildCultural,perch:buildPerch,flat:buildFlatiron,skyI:buildSkyI,skyJ:buildSkyJ,skyK:buildSkyK};
