// ================================================================= HOST — the station: THE VALLEY OF THE IRON SHROUD (station 4, Wadi al-Kafan; PLAN.md section 6)
// Trap F1 (PLAN.md section 4.2), the first of the guides' two dead-end frozen vales: a glacial box-canyon 6 km long cut into the shaded fault
// blocks north-west of Route A's first sprint, walled by 600 m of columned titanium basalt. Its mouth is wide and gentle, and a lukewarm iron
// seep (+12 C) at the mouth promises a warm spring round the bend; 4 km in the floor rises over a 35 m reverse moraine lip into a sealed cold
// sink where, two hours after dusk, the summit ice's air pours over the headwall and pools behind the moraine (-34 C by dawn). The rimed
// wreckage of forty betrayals lies on its blue ice; the hanging glacier's seracs lean over the headwall; up the east wall the Guide's Needle,
// a 0.7 m chimney with iron rungs, by which the stiffed guide climbs out in the night and pulls the ladder up.
// Map 5.1: the site px 968, 1442 at 4,720 m (0.88 atm, EF/ET). The frame's origin is the site: the vale's middle.
//   key, title, hint   the page's names          centre, R, step   the square and the field's lattice (m)
//   insets()           the seep at the mouth and the moraine's lip at 2.5 m
//   layers             the ground's KGROUND layers (84): the scree, the glacier ice, the snow (fifteen units)
const STN={key:'shroudvale',title:'Krator Twins: the Valley of the Iron Shroud',
 hint:'The Valley of the Iron Shroud (station 4, Trap F1): a dead-end glacial box-canyon 6 km long under 600 m walls of columned black basalt. A lukewarm iron seep at its wide mouth promises an oasis; 4 km in, the floor climbs a 35 m moraine lip into a sealed basin of blue ice where the night air pools at -34 C, littered with the rimed wreckage of betrayed caravans. Up the east wall, the Guide\'s Needle. N for night',
 centre:[0,0],R:4800,step:10,site:{px:968,py:1442},
 insets:()=>[{x:SEEP.x,z:SEEP.z,r:60,st:2,name:'seep',label:'The iron seep at the vale\'s mouth (ground, 2 m)'},
  {x:vAt(MOR.u,0)[0],z:vAt(MOR.u,0)[1],r:240,st:2.5,name:'moraine',label:'The moraine lip (ground, 2.5 m)'}],
 items:['boulder','stone','plank','iceblock'],minimap:'The Valley of the Iron Shroud (Trap F1)',
 route:()=>null,warm:()=>[],
 budgetTypes:{'twins/vale':'pass'},
 layers:[['scree',{w:'vGL.x*(1.0-vGL.y)*(1.0-vGP.x)',amt:.75,gain:1,tint:'vec3(0.62,0.58,0.56)'}],['ice',{w:'vGP.x',amt:.9,gain:1,tint:'vec3(1.0)'}],
  ['snow',{w:'vGM.x',amt:.95,gain:1,tint:'vec3(1.0)'}]],
 spine:()=>[[0,0],vAt(-2600,0),vAt(MOR.u,0),vAt(2200,0),vAt(2900,0)]};
