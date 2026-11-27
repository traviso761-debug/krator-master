// ================================================================= XANADU, OIDONG AND THE HIGH RIFT — the lava tubes' spec
// [G data] Route A of the Twins crossing, the Dark-Tube Road (biomes/twins/PLAN.md section 3.1; PLAN-TWINS-CROSSING.md section 3, step
// W3): its four tubes and the south feeder, laid under the world's ground by core/world/42k-world-caverns.js (WTUBES) and drawn by 88k.
// Every point is a scale-model 5.1 pixel (2 km); all of them lie inside this region's present box (px 746-1636 x 1424-1714), though
// only A1's first ~15 km are inside the cut's polygons (the rest is the Twins' bare ground, drawn but not grown).
// Each floor is laid at a DEPTH under the ground, not at a height: the Twins' sculpt is not on the map yet, and the tubes follow
// the ground it leaves. Adding the rest of Route A after the recut north to the Catch is a row here, nothing else.
//   px     the centreline (the Twins plan's itinerary)          seg    {w, h} per span: 12-22 m wide, floor to crown
//   open   the portals (the floor up to the ground: the way in and out) and skylights; halls; chokes (3.5 m, drawn by cell)
//   model  the scale model's tube record each details (region.json `tubes`)
SITE_SPEC.tubes=[
 {id:'A1',route:'A',name:"Al-Nafaq al-Gharbi, the Western Alph Pyroduct (Route A, tube 1)",model:'tube_xanadu_nw_09',
  px:[[938,1496],[952,1489],[966,1479],[978,1468]],seg:[{w:20,h:15},{w:16,h:13},{w:22,h:16}],depth:45,
  open:[{kind:'portal',at:'start',name:"The Vale portal above the Alph's chasm headgate"},{kind:'portal',at:'end',name:'The First Skylight Break'}],
  chokes:{every:9000,p:.5,w:3.5,h:4.5,len:[48,96]},skylights:{every:6000,p:.5,r:[3,6]}},
 {id:'A2',route:'A',name:'The Horn-Underpass (Route A, tube 2)',model:'tube_xanadu_nw_09',
  px:[[982,1466],[994,1467],[1002,1469]],seg:{w:16,h:14},depth:45,
  open:[{kind:'portal',at:'start',name:'The dive-ramp below the sulfur cairns'},{kind:'portal',at:'end',name:'The Saddle-Gasp mouth'}],
  chokes:{every:9000,p:.5,w:3.5,h:4.5,len:[48,96]},skylights:{every:6000,p:.5,r:[3,6]}},
 {id:'A3',route:'A',name:'The Saddle Siphon (Route A, tube 3)',model:'tube_xanadu_nw_09',
  px:[[1006,1468],[1014,1464],[1020,1461]],seg:{w:22,h:18},depth:50,
  open:[{kind:'portal',at:'start',name:'The collapsed lava-trench portal'},{kind:'portal',at:'end',name:'The sheared roof at the listric scarp'}],
  halls:[{px:[1014,1464],name:'The Hall of the Tally-Marks (the overnight cistern)',rx:36,rz:24,h:20,skylight:{r:2.5,name:'the warm roof crack over the cistern'}}],
  chokes:{every:9000,p:.5,w:3.5,h:4.5,len:[48,96]},skylights:{every:6000,p:.5,r:[3,6]}},
 {id:'A4',route:'A',name:'The Stair Conduit (Route A, tube 4)',model:'tube_xanadu_nw_09',
  px:[[1024,1459],[1031,1455.5],[1038,1452]],seg:[{w:16,h:14},{w:20,h:18}],depth:45,
  open:[{kind:'portal',at:'start',name:'The Catch-Leap dive'},{kind:'portal',at:'end',name:'The 18 m basalt arch onto the gravel fan'}],
  chokes:{every:9000,p:.5,w:3.5,h:4.5,len:[48,96]},skylights:{every:6000,p:.5,r:[3,6]}},
 /* the Strongbow branch (the owner, 2026-11-16: "Join the branch to the main line"): the lower galleries of tube_xanadu_se_10 up to
    the SE Twin, then north-west along the model's Saddle fissure dike conduit to the Hall of the Tally-Marks, where it runs into
    A3 underground (WTUBES `join`): the sim's Route A caravans for Strongbow go Hall, feeder, Strongbow. The old end portal under
    the SE Twin is a gasp mid-tube now, the way up onto Route B's trail.
    The gasp moved 1 km south (px 1028,1506 to 1028,1506.5) on the 2026-11-23 re-run's ground: there the mouth sat high on the
    Twin's flank, the ground climbing to it far steeper than 25 % for more than the 600 m a portal's ramp reaches, so the ramp came
    out on the ground below the mouth (floor and roof over it at stations 1745-1758). At its new place the ground climbs to the
    mouth at 25 % from the Strongbow side and falls 9 % beyond it (300 m each way): the plan's checks pass there and a quarter of
    a pixel round it, and the walker steps out onto the ground at the mouth and back down (a node walk on the drawn ground) */
 {id:'A-feeder',route:'A',name:'The south feeder: the lower galleries of tube_xanadu_se_10 and the Saddle dike conduit (the Strongbow branch)',model:'tube_xanadu_se_10',
  px:[[1010,1517],[1019,1511.5],[1028,1506.5],[1024,1485],[1014,1464]],seg:{w:16,h:12},depth:42,join:{tube:'A3',at:'end'},
  open:[{kind:'portal',at:'start',name:'The feeder portal above Strongbow'},{kind:'portal',at:[1028,1506.5],name:'The feeder gasp under the SE Twin (up onto Route B)'}],
  chokes:{every:9000,p:.5,w:3.5,h:4.5,len:[48,96]},skylights:{every:6000,p:.5,r:[3,6]}}];
