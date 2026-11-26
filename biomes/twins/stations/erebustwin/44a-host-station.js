// ================================================================= HOST — the station: THE RIME TWIN (station 5, Al-Qaran al-Saghir; PLAN.md section 6)
// The SE Twin's summit (PLAN.md section 2: the Rime Twin, steaming through its glacier), the cross-kit anchor with biomes/geyser's ice
// station: its caldera floor under an ice cap at ~5,420 m, the basalt rim rising to 5,880 m on the north-west, an active pit steaming through
// the ice with bare warm ground round it, Mount Erebus fumarolic ICE TOWERS 6-12 m (hollow chimneys of frozen steam) on the fumaroles across
// the floor and up past the rim, STEAM CAVES melted into the ice's margin and lit blue from within, boiling snow-slush CAULDRONS (86 C) at the
// ice's foot, and the upper mouth of TUBE 10 (tube_xanadu_se_10) melted into the glacier sole under the south-east wall. Map 5.1: the site px
// 1042, 1498, the crater floor's pin at 5,420 m (0.81 atm, EF: -18 C on the ice).
//   key, title, hint   the page's names          centre, R, step   the square and the field's lattice (m)
//   insets()           the vent's warm ground and the steam caves at 2.5 m; tube 10's mouth at 2.5 m
//   layers, shareLayers  the ground's KGROUND layers (84): the scree, the glacier ice, the snow (fifteen units); the ash reads the scree's map
//   tempBias           the summit glacier's -18 C (PLAN.md section 6) against the range's lapse (89a: -11.7 C at 5,420 m)
const STN={key:'erebustwin',title:'Krator Twins: the Rime Twin',
 hint:'The Rime Twin (station 5, the SE Twin\'s summit at 5,420 m): an ice cap in the caldera under a black basalt rim, an active pit steaming through it, fumarolic ice towers 6-12 m high on the vents, steam caves melted into the ice and lit blue from within, boiling slush cauldrons at the ice\'s foot, and the upper mouth of tube 10 under the glacier\'s sole. -18 C on the ice, +14 C in the caves. N for night',
 centre:[0,0],R:4800,step:10,site:{px:1042,py:1498},tempBias:-6.3,
 /* the page opens at 13:36: at this site the gas giant hides the sun from about 9:30 to 12:00 (the shared sky), so the day views keep clear of it */
 viewHour:()=>13.6,
 insets:()=>[{x:RIME.V[0],z:RIME.V[1],r:420,st:2.5,name:'vent',label:'The Rime Twin\'s inner vent and its warm ground (2.5 m)'},
  {x:RIME.tube.x,z:RIME.tube.z,r:60,st:2.5,name:'tube10',label:'The upper mouth of tube 10 (2.5 m)'}],
 items:['boulder','stone'],minimap:'The Rime Twin (the SE Twin\'s summit)',
 route:()=>null,warm:()=>[],
 budgetTypes:{'twins/rime':'pass'},
 layers:[['scree',{w:'vGL.x*(1.0-vGL.y)*(1.0-vGP.x)',amt:.75,gain:1,tint:'vec3(0.62,0.58,0.56)'}],['ice',{w:'vGP.x',amt:.9,gain:1,tint:'vec3(1.0)'}],
  ['snow',{w:'vGM.x',amt:.95,gain:1,tint:'vec3(1.0)'}]],
 shareLayers:{ash:{from:'scree',w:'vGP.w',col:[.16,.15,.14],amt:.8}},
 spine:()=>[[0,0],[RIME.V[0],RIME.V[1]],[RIME.tube.x,RIME.tube.z],[-1500,-1500],[1500,-1200]]};
