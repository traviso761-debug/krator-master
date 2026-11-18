// ================================================================= THE SLABFIELDS — station 3's site: the Halves (PLAN.md sections 3.5, 5 and 13)  [G data]
// Scale model 5.1 after edit 7 (tools/scale-model/edit_517.py: slab_halves_n, slab_halves_se, patera_halves, spr_slab_halves_patera). An ideal type of its
// place (R 2600 m): the model's numbers, not its pixels. One slab cut by a NW-SE fault and pulled apart (Hi'iaka Montes' way): the north-west half
// (crest 4,674 m) and the south-east half (crest 4,875 m), both with their cliffs facing north, and in the gap between them the patera (10 km across,
// 250 m deep) with its warm pool, and beyond it the pit chain along the split fault. On the model the halves stand 10-15 km from the patera's middle and
// the pits 8 km out; the page brings the south-east half's cliff and torn west end to its south-east corner, two pits to the bench south-west of the
// patera's wall, and the north-west half to 9 km across the water (NOTES.md). Page metres: x east, z south, the origin the page's centre.
// Plain data: no THREE, no DOM; the stage (stations/halves/45-host-stage.js) draws the land from it.
SLAB_SITES.halves={key:'halves',name:'The Halves',station:3,px:[1722,1376],world:[3444000,2752000],sky:{px:1450,py:1046},
 // the patera's cell (5.1 px 1722,1374, read 2026-11-17 through smodel.page): its lake at 3,062 m (the model's floor), Dsc, tm 7, tw 20, tc -6, th 28,
 // tl -14 degC; the gap's bench north of it 3,214 m; the halves' cells 4,034 and 4,235 m (crests 4,674 and 4,875 m in edit 517's report). Rain the
 // shore's 173 mm (PLAN.md section 5)
 base:3310,atm:1.06,koppen:'Dsc',rain:173,temp:{mean:7,warm:20,cold:-6,high:28,low:-14},snow:[4650,5000],
 // THE PATERA: its centre 4 km north of the page's middle; rim 5 km out (the model's 2.5 px) at 3,312 m, three steps down 200 m to its floor (3,108 m: the old lava lake's crust), the pool's
 // shore 3 km out (lake_r 1.5 px), level 3,102 m, 40 m deep
 patera:{c:[0,-4000],r:5000,floor:3108,level:3102,shore:3000,bed:3062,wall:{steps:3,tread:24,riser:6,warp:60}},
 // THE HALVES: each a KRELIEF.slab along a rim that turns its corners (14 km long, 10 km deep): the west end, the north cliff, the east end; the torn end
 // is the one facing the gap. h over the bench under it (the crest the model's); the ramp falls 9.1 degrees (0.16 a metre) behind the rims
 halves:[
  {id:'slab_halves_se',name:'The Halves\' south-east half',pts:[[650,12200],[650,3400],[760,2700],[1100,2350],[1800,2200],[14650,2200],[15000,2550],[15000,12200]],h:1550,crest:4875,base:3435,run:520,dip:.16,
   talus:{h:110,reach:300},apron:{c:[2600,1000],r:[1300,700],foot:90}},
  {id:'slab_halves_n',name:'The Halves\' north-west half',pts:[[-15000,-6200],[-15000,-14200],[-14600,-14600],[-1500,-14600],[-1100,-14200],[-1000,-13600],[-1000,-6200]],h:1420,crest:4674,base:3234,run:520,dip:.16,
   talus:{h:110,reach:300},apron:null}],
 // THE PIT CHAIN along the split fault, south-west of the patera: collapse pits 1-2 km across and 150-300 m deep on the model (sub-grid), each with a seep
 // at its floor's foot; the page's are smaller (the chain's young end)
 pits:[{c:[-1500,1350],r:420,depth:170,steps:2},{c:[-2350,2250],r:300,depth:120,steps:2}],
 // the springs: warm (14-22 degC, CO2) on the pool's south shore; one seep in each pit
 springs:{n:5,dead:2,r:[3,7],temp:[14,22]},
 blocks:{n:30,big:5,r:[6,22],bigR:[26,46],H:[5,18],bigH:[14,30]},
 gas:{springs:2,voids:2,pits:true},
 far:{bench:3310,out:20000}};
