// ================================================================= HOST — the station: station 3, THE STAIR (PLAN.md section 11, item 3)
// 5.1 px 790,1040: 2,023 m, 1.24 atm, +14 degC (22/5), 3,529 mm, Cfa: mid-face, the rain maximum. Inside the cloud: the face running up south
// toward a lip far above (its line at the map's south edge, 3.3 km), benched, the ravines cut back into it, the lungs climbing them out of the cloud
// sea below toward their mouths, the spiral cloud forest on the treads between. One lung carries a Talovolci lung-stair (73: a placement record,
// the ladder a prop) and a husk lies across a ravine as a bridge. The camera can follow the bore: a ring is a hollow tube (the bore item).
const STN={key:'stair',name:'The Stair',title:'Krator biome — the Cliff Lungs: the Stair',px:[790,1040],
 R:2600,
 rim:{y:3300,z:1700,wander:[[-.00029,70,1.4],[-.00093,35,.3]]},
 scarp:{h:2150,run:3700,power:1.05,benches:{n:5,w:120},ravines:{every:700,w:[70,120],head:[60,160],depth:[45,120]},buttresses:{sp:560,amp:60},
  talus:{h:60,reach:300},rim:{lip:5,w:80},warp:{amp:50},rough:.016,seed:0x1A63},
 plateau:{rise:60,swell:20,bogs:[]},
 deckY:1250,
 lungs:{n:10,world:0x1A63,step:10},
 wind:[.62,.78],
 hour:10,day:0,
 q:.4,
 sky:{pressure:1.24,humidity:.92,cover:.6},
 shigh:true,bells:false,fog:true,stair:true};
