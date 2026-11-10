// ================================================================= HOST — the station: CATCH-LOOKOUT SPRING (station 6, Manzar al-Masid; PLAN.md section 6)
// Route B's last oasis (Oasis 5: PLAN.md section 3.2), the north-east gate of the Twins: a 70 C alkaline-chloride spring on a faulted
// titanium-basalt ledge, its water stepping down the bench in travertine soaking basins toward the fault scarp's lip; over the lip the lower
// bench and, past the range's last fall, the Catch's pale salt-and-sand floor toward Stair (1106, 1442: 100 km). Caravans wash the alkali dust
// from their eyes here and refill their skins before the descent; Route B goes down the scarp's breach. Wind-flagged dwarf agate-pines on
// the warm margins (PLAN.md section 5.1), sedge and cushions. Map 5.1: the site px 1056, 1462 at 3,690 m (1.01 atm, BSk/ET: +2 C, +17 C in
// the oasis's air).
const STN={key:'catchlookout',title:'Krator Twins: Catch-Lookout Spring',
 hint:'Catch-Lookout Spring (station 6, Oasis 5 of Route B): the last warm ground before the Catch, on a basalt ledge at 3,690 m. A 70 C alkaline spring steps down the bench in travertine basins where the caravans soak and wash the alkali from their eyes; wind-flagged dwarf agate-pines, sedge and cushions on the warm ground; from the lookout cairn on the scarp\'s lip, the Catch\'s pale floor far below. +2 C outside, +17 C by the pools. N for night',
 centre:[0,0],R:4800,step:10,site:{px:1056,py:1462},tempBias:2.4,
 insets:()=>[{x:60,z:0,r:420,st:2.5,name:'oasis',label:'Catch-Lookout Spring (the bench\'s ground, 2.5 m)'}],
 items:['boulder','stone','cushion','sedge'],minimap:'Catch-Lookout Spring (Route B, Oasis 5)',
 route:()=>ROUTE.pts,warm:()=>[],
 oasis:()=>({boxes:[[-500,-460,520,460]],dry:(x,z)=>!OASIS.wet(x,z)&&!TERR_W.wet(x,z)&&!nearCairn(x,z),pines:true,wind:[-.9,.4]}),
 budgetTypes:{'twins/oasis':'pass'},
 layers:[['scree',{w:'vGL.x*(1.0-vGL.y)*(1.0-vGO.x)',amt:.75,gain:1,tint:'vec3(0.62,0.58,0.56)'}],['travertine',{w:'max(vGO.x,vGO.y*0.5)',amt:.85,gain:1,tint:'vec3(1.0)'}],
  ['snow',{w:'vGM.x',amt:.95,gain:1,tint:'vec3(1.0)'}]],
 shareLayers:{mat:{from:'travertine',w:'vGO.y',col:[.5,.26,.07],amt:.7}},
 spine:()=>[[0,0],[LIP.c[0],LIP.c[1]],[BREACH.x,BREACH.z],[ROUTE.pts[0][0],ROUTE.pts[0][1]],[ROUTE.pts[ROUTE.pts.length-1][0],ROUTE.pts[ROUTE.pts.length-1][1]]]};
