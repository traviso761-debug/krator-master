// ================================================================= HOST — THE LAND (station 1: the se savannah rim, the incense country)
// biomes/hyperjungle/PLAN-LANDS.md sections 5.2 and 9: station 1, between Talia (px 801,609) and the laterite, ~1,290 mm, Aw/Am/Cfa,
// 1.68 atm. Each station has its own land in this fragment (stations/serim, stations/erim, stations/north). The stage (45) reads LAND for its map:
// the rise (metres over the map along a bearing), the river (a line, its width), the forest's edge (the jungle or the wet face's foot:
// gallery country past it), kopjes (granite domes), the laterite (a share, by noise), the dambos (seasonal wetlands at the valley heads),
// the fires; and the land's passes (87) read its weights. J4 (2026-11-08) built the savannah's base here; J6 (2026-11-08) the incense
// country's own (87e: the zones from the Bowl's side to the wet face).
const LAND={key:'southeast',name:'The se savannah rim (ideal type)',sky:{px:801,py:612,label:'the se savannah rim between Talia and the laterite'},
 title:'Krator biome — the savannah rims: the incense country',hint:'Station 1: the se rim near Talia: incense on the dry slopes, rain dragons and rain bottles, the rust miombo\'s copper flush, the wet face\'s laurels',
 air:{pressure:1.68,humidity:.6},R:3000,
 rise:{dir:[.8,-.6],m:70},                      // rising toward the wet face (north-east) and down toward the Bowl's dry side
 river:{pts:[[3300,-1400],[2200,-900],[1300,-1100],[300,-400],[-700,-600],[-1700,100],[-3300,300]],w:28,depth:2.4},
 edge:{dir:[.8,-.6],at:2300,w:700,kind:'wet face'},   // the Cfa foot (gallery and cloud forest past it): the far field's roof there
 kopjes:[[-1700,-1500,90,26],[-2300,-700,60,18],[-1200,-2300,70,22],[400,1900,55,16]],
 laterite:.25,dambos:[[2100,-1300,260],[-200,1300,200]],
 grass:{redoat:1,blind:.08},palette:{straw:[150,124,76],soil:[136,78,48],green:[86,104,50]},
 trees:{thorn:.55,borassus:.45,gallery:1,kapok:.25,baobab:.3,bone:0,blood:0},
 fires:[{ago:.03,x:-2200,z:1800,frac:.04,veer:.15},{ago:1.3,x:1200,z:1500,frac:.09,veer:.2},{ago:2.7,x:-800,z:-2200,frac:.08,veer:.3},{ago:4.4,x:2300,z:900,frac:.1,veer:.2}],
 wind:[-.6,.8],kinMin:3,
 need:{incense:60,rainrose:6,raindragon:15,rainbottle:10,rustmiombo:60,cloudavocado:15,leanfern:30,cardon:4,frill:4},
 views:{'The incense country':[-1700,30,600,-600,10,-300],'The rust miombo':[600,40,-400,1300,20,-1100],'The wet face\'s foot':[1500,30,-900,2300,40,-1700]},
 // the reach's homes (H1): the Bowl down the rise past the dry slopes (1.5 km beyond the map's dry edge), the crater drylands to the west
 // (Pylon's end, 4 km past the map's west edge)
 home:{bowl:(x,z)=>Math.max(0,x*.8-z*.6+4500),drylands:x=>Math.max(0,x+7000)}};
// the hyperjungle's monsoon look, read in place: its kapoks and baobabs bare in the dry season (its 50 reads HYPERJUNGLE_LOOK)
var HYPERJUNGLE_LOOK={deciduous:[3,5]};
