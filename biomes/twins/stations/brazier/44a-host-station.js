// ================================================================= HOST — the station: THE BRAZIER (station 2, Al-Mijmarah; PLAN.md section 6)
// Route B, the Steaming-Stone Dash (PLAN.md section 3.2), at its middle: Oasis 3, the Brazier, on the high inter-Twin col between Fissure Vent
// NW (1007, 1472) and Fissure Vent SE (1024, 1485), where the second half of the guide's fee falls due at the Shrine of the Split Horn (section
// 4.1). Not quite Yellowstonian: an island of warm ground 800 x 500 m along a fault-fissure in the frozen col (-7 C ambient, +14 C in the
// oasis air), sinter-lipped hot pools, two low geyser cones (a 3 m spout every 20 minutes; a spouter that never stops), mud pots, orange and
// black thermophile mats down the runoff, bobby-sock sedge flats, the Hearths' dwarf pocket-hearths (read in place, the cold dress).
// Map 5.1: the site px 1016, 1479 at 4,680 m (0.89 atm, ET/EF).
//   key, title, hint   the page's names          centre, R, step   the square and the field's lattice (m)
//   insets()           the oasis at 2.5 m         site              the 5.1 pixel
//   route()            Route B's line through the oasis (its cairns)   oasis()   the oasis pass (60: TWINS.buildOasis)
//   layers, shareLayers  the ground's KGROUND layers (84): the scree, the sinter, the snow (fifteen units); the mats and the mud read the sinter's map
const STN={key:'brazier',title:'Krator Twins: the Brazier',
 hint:'The Brazier (station 2, Oasis 3 of Route B): a warm island 800 m long on the frozen inter-Twin col at 4,680 m. Sinter-lipped hot pools, a geyser cone that spouts every twenty minutes and a spouter that never stops, mud pots, orange and black mats down the runoff, bobby-sock sedge, the pocket-hearths\' black fans opening at night, and the Shrine of the Split Horn where the guides take their second coin. -7 C outside, +14 C in the oasis. N for night',
 centre:[0,0],R:4800,step:10,site:{px:1016,py:1479},
 insets:()=>[{x:0,z:0,r:470,st:2.5,name:'oasis',label:'The Brazier (the oasis\'s ground, 2.5 m)'}],
 items:['boulder','stone','cushion','sedge'],minimap:'The Brazier (Route B, Oasis 3)',
 route:()=>ROUTE.pts,warm:()=>[],
 oasis:()=>({boxes:[[-480,-480,480,480]],dry:(x,z)=>!OASIS.wet(x,z)&&!nearShrine(x,z),pines:false,wind:[.6,-.3]}),
 budgetTypes:{'twins/oasis':'pass','hearths/field':'pass'},
 layers:[['scree',{w:'vGL.x*(1.0-vGL.y)*(1.0-vGO.x)',amt:.75,gain:1,tint:'vec3(0.62,0.58,0.56)'}],['sinter',{w:'max(vGO.x,vGO.y*0.5)',amt:.85,gain:1,tint:'vec3(1.0)'}],
  ['snow',{w:'vGM.x',amt:.95,gain:1,tint:'vec3(1.0)'}]],
 shareLayers:{mat:{from:'sinter',w:'vGO.y',col:[.56,.22,.05],amt:.75},mud:{from:'sinter',w:'vGO.z',col:[.32,.24,.23],amt:.8}},
 spine:()=>[[0,0],[-250,150],[250,-150],[ROUTE.pts[0][0],ROUTE.pts[0][1]],[ROUTE.pts[ROUTE.pts.length-1][0],ROUTE.pts[ROUTE.pts.length-1][1]]]};
