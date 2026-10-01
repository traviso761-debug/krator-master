// TARGET: repaired — every type at decay level 3: ancient fabric that a later
// people came back to, patched with what they could salvage, and reoccupied.
// One structure per row, on the centre line (SITEX puts level 3 at x=0).
//
// Its own target because a third variant of all 32 types would be +50% scene
// content on a showcase already at 5.8M of a 6M ceiling.
const DECAYS=[3];
const TITLE='Krator Ancients — rehabilitated';
const GROUND_C=11000;        // z centre of the ground plane and its paint
const ROWS={skyA:{z:0,s:300,r:280,t:1200},skyB:{z:800,s:300,r:260,t:1200},skyC:{z:1600,s:300,r:280,t:1200},mega:{z:2900,s:700,r:520},fac:{z:4000,s:330,r:330},port:{z:5400,s:540,r:420},
 gov:{z:6500,s:270,r:190},lib:{z:7100,s:220,r:130},bunk:{z:7600,s:220,r:130},off:{z:8100,s:265,r:260},apt:{z:8600,s:520,r:300},amph:{z:9200,s:220,r:130},
 fuel:{z:9600,s:150,r:80},radar:{z:9900,s:150,r:70},dish:{z:10200,s:150,r:80},house:{z:10500,s:120,r:120},lab:{z:10900,s:420,r:200},house2:{z:11400,s:120,r:120},skyD:{z:12100,s:300,r:280,t:1200},skyE:{z:12900,s:300,r:280,t:1200},skyF:{z:13700,s:300,r:280,t:1200},arc:{z:14900,s:800,r:520},robo:{z:15900,s:330,r:280},campus:{z:17100,s:600,r:420},skyG:{z:18100,s:320,r:300,t:1300},skyH:{z:18900,s:300,r:280,t:1200},dc:{z:19700,s:400,r:330},police:{z:20300,s:180,r:110},hosp:{z:20800,s:260,r:170},hotel:{z:21400,s:260,r:170},cult:{z:22500,s:400,r:330}};
const RUINS=Object.values(ROWS).flatMap(r=>r.t?[[r.s,r.z,r.r],[r.t,r.z,r.r*1.4]]:[[r.s,r.z,r.r]]);
const EXTRA_BUILDERS={cult:buildCultural};
