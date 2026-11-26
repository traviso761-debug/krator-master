// ================================================================= HOST — the station: THE FIRST BREATH (station 1, the pyroduct; PLAN.md section 6)
// Route A, the Dark-Tube Road (PLAN.md section 3.1), where it first comes out: the end of tube segment A1 (tube_xanadu_nw_09's caravan
// pyroduct, tools/scale-model/model/data/tubes.json: "Caravan Pyroduct Cross-Range Route", habitable) at the First Skylight Break, the
// open sprint across the frost-shattered scree (Open Sprint 1, the First Breath: ~3.5 km at 4,180-4,290 m), and the dive into the next
// tube, A2 (the Horn-Underpass), down a collapsed lava trench; the NW Twin (Al-Qaran al-Kabir, 6,480 m) smoking 24 km north-north-east.
// Map 5.1: the site px 980, 1467 at 4,240 m (0.94 atm, ET: -4 C outside, +13 C in the tube).
//   key, title, hint   the page's names
//   centre, R, step    the square (x east, z south: its centre on the site) and the field's lattice (m)
//   insets()           finer fields over boxes [{x, z, r, st, name}]: the skylight's collapse and the portal's trench at 2 m
//   site               the 5.1 pixel the frame's origin and the shared sky stand at
//   spine()            the LOD spine (the views' places), read once the frame is made
const STN={key:'pyroduct',title:'Krator Twins: the First Breath',
 hint:'The First Breath (station 1, Route A): the caravan pyroduct comes out at a collapsed skylight 4,300 m up on the Twins\' south-west flank; inside, the warm arched tube (+13 C) with its curb-ledges, lava drips and the guides\' torch brackets; outside, the frozen scree (-4 C) and the 3.5 km sprint between sulphur-painted cairns to the next tube\'s mouth in a collapsed lava trench, the NW Twin 24 km off. N for night',
 centre:[0,0],R:4800,step:10,site:{px:980,py:1467},
 insets:()=>[{x:SKYL.x,z:SKYL.z,r:100,st:2,name:'skylight',label:'The First Skylight Break (ground, 2 m)'},{x:PORT.x-PORT.d[0]*80,z:PORT.z-PORT.d[1]*80,r:150,st:2,name:'portal',label:'The collapsed lava trench to the Horn-Underpass (ground, 2 m)'}],
 items:['boulder','block','obsidian','stone'],minimap:'The First Breath (Route A)',
 /* the kit's pass (88-host-build.js): the cairns along the sprint; the warm collars' boxes (the skylight, the portal's mouth) */
 route:()=>ROUTE.pts.slice(0,-8),warm:()=>[[SKYL.x-45,SKYL.z-45,SKYL.x+45,SKYL.z+45],[PORT.x-50,PORT.z-50,PORT.x+50,PORT.z+50]],
 spine:()=>[[SKYL.x,SKYL.z],[PORT.x,PORT.z],[(SKYL.x+PORT.x)/2,(SKYL.z+PORT.z)/2],[SKYL.x-SKYL.d[0]*500,SKYL.z-SKYL.d[1]*500],[0,0]]};
