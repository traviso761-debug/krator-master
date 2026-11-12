// ================================================================= PINNACLE: the sites' spec, what is planned round the rock and on its roads
// [G data] openworld/PLAN-SITES.md, the first site (the owner, 2026-11-09). Pinnacle Rock's town on its mesa stays
// settlements/pinnacle-rock's own; the site plans what stands on the world's ground round it: the nine bands that camp on
// the floor (kits/beast-riders BR_CAMP: each tribe's `lower` ground), each searched from the point the rock's own page
// gives its camp (settlements/pinnacle-rock/src/40-pr-layout.js PASTURE_AT: the camp's middle, in the page's frame, whose
// origin was this region's, map px 1027,681, until the owner moved the rock 41 km west to the savage hyperjungle's edge on
// 2026-11-10: the same offsets round the new spot), and a track from each camp's gate to the rock (core/world ROADS). The
// world seed keeps the old pixel's number (a seed, not a place: changing it would redeal every band).
//   links   (2026-11-11, core/simulation/PROPOSAL-LONGSONG-PINNACLE.md S5: the region grown into corridors) the roads to
//           the bands' raid and trade partners, along the line each corridor was cut on (region.json `cut.corridors`:
//           the Ancient network's route, tools/scale-model/cut_site.py, or the region's own guide on the valley floors):
//             Port Goto      Izani highway izani.17.22                 raid (Iziz's nearby port)
//             Talon          Beast Rider trail trail.1.3               trade
//             Fort Kreia     a guide up onto the NE rim (the network's trunk to Kreia starts at the Crescent, 26 km
//                            south-west, and crosses the Talon trail)  trade
//             Fort Ordo      from Kreia, the trunks by the Sleeping City trade
//             Mav's Refuge   from Talon, the Beast Rider trail trail.0.3 to its old spot, then a guide south-east to the
//                            new (the owner moved it onto the Beesh Baatar, 2026-11-11); and from Fort Ordo on the
//                            Ordo-Nusidi trunk, which passes 3 km from it trade (Girder beyond it: openworld/iziz-cluster)
//             Nusidi         from Mav's Refuge, the Ordo-Nusidi trunk  raid
//             Shade          dirt.coyote along the trough east of the rock to the oasis (moved by the owner to 1085,683,
//                            on that road)                             long-distance trade (the Dasri, until their
//                                                                      northern village is placed)
//             Coyote Canyon  from Shade, dirt.coyote out of the trough's north-east end and up by the basin
//                                                                      long-distance trade (the coyotemen)
//           each leaving its towns from 1.8 km out (r), beyond the ring of the bands' camps round the rock (1.0 to 1.64 km
//           out: from 900 m the Talon road ran through the raptor camp and the Kreia road past the longcrawlers'),
//           laid (the ground is shaped to them), kept inside the cut (routed in 8 km hops along the line), bridged where
//           they cross a named river (core/world 42b, SITE_SPEC.bridges), with an inn every 25 km of road (a caravan's
//           day) and a rest stop halfway between. The Izani highway to Goto takes the Iziz Vernacular's
//           (vern_caravanserai, vern_rest_stop), as in the Iziz cluster; the Beast Riders' trails and the far roads take
//           the Beast Riders kit's (br_bldg_riders_inn, its roadside inn; br_bldg_watch_tower, a rider post), drawn through
//           core/world 88s's `beast-riders` village kit (S7) by core/hamlet's `beast-rider` row below. The coyotemen and the
//           Dasri have no kit: the Pinnacle bands' own posts stand in on their roads (KNOWN_ISSUES.md).
// KSITES (core/world/48s-world-sites.js) plans it; core/world/bake_sites.py bakes it to plan/sites.json.
/* THE CLEARINGS (core/simulation/PROPOSAL-LONGSONG-PINNACLE.md section 3, phase S7; the owner, 2026-11-11): four farming
   villages of the ground tribes in jungle clearings 5 to 9 km from the rock, the town's second stream of food (the floor
   ring is the first, the bands at home the third, their dry-season haul the fourth). core/hamlet's `beast-rider` row: the
   Beast Riders kit's own buildings (CAT: its farmhouses, terrace rows and longhouse blocks, the chief's compound, the
   temple, the mead hall, the shophouse and the bake house, the granary and the beetle pens). The row lives here until a
   second region takes it (core/hamlet reaches 56 pages) */
KHAMLET.CULTURES['beast-rider']={kit:'beast-riders',household:6,workShare:0.45,slopeMax:0.22,
 religious:'br_bldg_temple',civic:'br_bldg_mead_hall',general:'br_bldg_shophouse',food:'br_bldg_bakehouse',warehouse:'br_bldg_granary',
 services:{religious:1,civic:2,general:2,food:2,warehouse:3},
 houses:{poor:[['br_bldg_terrace_row',2,3],['br_bldg_longhouse_block',3,2]],middling:[['br_bldg_great_house',3,2],['br_bldg_farmhouse',2,1]],
  head:[['br_bldg_chief_compound',1,1]],middlingShare:0.3},
 works:{farming:[{key:'br_bldg_farmhouse',jobs:10,share:0.75},{key:'br_bldg_granary',jobs:4,share:0.1},{key:'br_bldg_beetle_pen',jobs:4,share:0.15}]},
 focusJobs:{farming:90},reach:{farming:460}};
var STOPS={every:25000,inn:'vern_caravanserai',rest:'vern_rest_stop',culture:'iziz',look:5000};
var BR_STOPS={every:25000,inn:'br_bldg_riders_inn',rest:'br_bldg_watch_tower',culture:'beast-rider',look:5000};
/* a link along its corridor's line (region.json cut.corridors, written by cut_site.py from openworld/SITES.json) */
var CORRIDOR=(a,b)=>{const C=((WORLD_DATA.meta.cut||{}).corridors||[]).find(c=>c.from===a&&c.to===b);return C?C.px:null;};
var LINK=(a,b,o)=>[a,b,Object.assign({hw:3,r:1800,keep:true,stops:BR_STOPS,guide:CORRIDOR(a,b)},o||{})];
var SITE_SPEC={region:'pinnacle',world:1027681,bridges:{culture:'iziz'},
 sites:{staiytii0y:{culture:'beast-rider',road:{r:700,hw:1.6},hamlets:[
  {id:'clearing-w',name:'The Threehorn clearing',focus:'farming',bearing:280,km:6,look:2500,pop:240},
  {id:'clearing-sw',name:'The Hardshell clearing',focus:'farming',bearing:215,km:7.5,look:2500,pop:240},
  {id:'clearing-nw',name:'The Staghorn clearing',focus:'farming',bearing:330,km:8,look:2500,pop:240},
  {id:'clearing-s',name:'The Longcrawler clearing',focus:'farming',bearing:170,km:6.5,look:2500,pop:240}],
  camps:[
  {tribe:'threehorn',near:[-1230,200]},{tribe:'hardshell',near:[-870,-500]},{tribe:'longcrawler',near:[-1120,800]},
  {tribe:'staghorn',near:[-860,1350]},{tribe:'raptor',near:[1100,1080]},{tribe:'tiger',near:[1180,480]},
  {tribe:'mammoth',near:[-170,1480]},{tribe:'spider',near:[930,-330]},{tribe:'dragonfly',near:[815,1385]}]},
  /* the partners: their towns are not planned here (their own pages, or none yet); each is a link's end */
  ski7uk8fjc:{},sghb3jlsk5:{},s1kaqxmg10:{},s5c6ysqazg:{},skukf2qmmq:{},s2199308wr:{},soksvzt1h9:{},slfozs6c7z:{}},
 links:[LINK('staiytii0y','ski7uk8fjc',{stops:STOPS}),LINK('staiytii0y','sghb3jlsk5'),LINK('staiytii0y','s1kaqxmg10'),
  LINK('sghb3jlsk5','skukf2qmmq'),LINK('s1kaqxmg10','s5c6ysqazg'),LINK('s5c6ysqazg','skukf2qmmq'),
  LINK('skukf2qmmq','s2199308wr'),LINK('staiytii0y','slfozs6c7z'),LINK('slfozs6c7z','soksvzt1h9')]};
