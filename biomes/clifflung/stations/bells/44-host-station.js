// ================================================================= HOST — the station: station 2, THE BELLS (PLAN.md section 11, item 2)
// 5.1 px 790,1024: 529 m, 1.50 atm, +19 degC (26/13), 2,039 mm, Af: the foot. The foot of the face in the hyperjungle's canopy (read in place): bells
// standing up among the crowns, gaping north, their fringes streaming inward on the draw, the lungs climbing out of sight into the cloud above,
// the talus and the first rings in the Wall's shade. The cold breath preset: a winter dawn, cold mist pouring out of the bells into the canopy.
// The rim lies 3 km south, past the map: the lungs are drawn from where they enter it (LUNG.layout offMap), with no mouth.
const STN={key:'bells',name:'The Bells',title:'Krator biome — the Cliff Lungs: the Bells',px:[790,1024],
 R:2600,
 rim:{y:3300,z:3400,wander:[[-.00029,80,1.1],[-.00101,40,.7]]},
 scarp:{h:2850,run:4600,power:1.25,benches:{n:4,w:110},ravines:{every:750,w:[70,120],head:[60,160],depth:[45,120]},buttresses:{sp:600,amp:70},
  talus:{h:90,reach:520},rim:{lip:5,w:80},warp:{amp:50},rough:.014,seed:0x1A62},
 plateau:{rise:40,swell:20,bogs:[]},
 deckY:1700,deck:false,clipY:-1e9,belt:[900,2600],
 lungs:{n:9,world:0x1A62,step:10,footK:1.0},
 wind:[.62,.78],
 hour:6.6,day:0,
 q:.5,
 sky:{pressure:1.5,humidity:.95,cover:.45},
 shigh:false,jungle:true,bells:true,rootRock:.35};
