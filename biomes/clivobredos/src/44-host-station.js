// ================================================================= HOST — the station: station 1, THE MOUTHS (PLAN.md section 11, item 1)
// 5.1 px 790,1048: 3,001 m, 1.10 atm, +9 degC (21/-2), 925 mm, Dfb: the paramo's lip. A 5.2 km map on the crest: the lip running east-west, the
// face falling north through the cloud deck, live mouths and a husk's top on the lip, their wells and collars, the fall-out lawns running away
// south-east, the paramo behind. A station replaces this one file (stations/<name>/44-host-station.js) and the stage reads nothing else of it.
// x east, z south (north is -z), y the altitude in metres, so LUNG.atmAt(y) is the model's air at every point of the stage.
const STN={key:'mouths',name:'The Mouths',title:'Krator biome — the Cliff Lungs: the Mouths',px:[790,1048],
 R:2600,
 /* THE SCARP (core/terrain KRELIEF.scarp, SCARP.md): the rim's line west to east (it runs on past the map, so the far field carries the Wall on),
    the plateau south of it (side 1), the face falling `h` over `run` to the floor under the cloud sea; drop: the plateau is the ground */
 rim:{y:3001,z:-300,wander:[[-.00031,90,.6],[-.00107,40,2.1]]},
 scarp:{h:1850,run:2250,power:1.15,benches:{n:3,w:90},ravines:{every:850,w:[55,95],head:[60,180],depth:[35,95]},buttresses:{sp:640,amp:55},
  talus:{h:70,reach:320},rim:{lip:7,w:70},warp:{amp:40},rough:.014,seed:0x1A6},
 /* the plateau behind the lip: rising gently south, long swells, two bog hollows (the paramo's) */
 plateau:{rise:70,swell:24,bogs:[{x:-900,z:1300,r:240},{x:1300,z:1650,r:200}]},
 deckY:1250,                  /* the cloud sea's mean top: the hyperjungle's air pooled under the Wall */
 lungs:{n:9,world:0x1A6,step:10},
 wind:[.62,.78],             /* the model's crest wind from the north-west: the exhale goes south-east */
 hour:5.9,day:0,             /* game start's day is the spring equinox (KCLOCK.YEAR): "set in spring" */
 q:.62,                      /* the southern highlands' quality on this page (its trees are read in place) */
 sky:{pressure:1.10,humidity:.7,cover:.2},
 shigh:true,bells:false};
