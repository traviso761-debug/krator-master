// ================================================================= PINNACLE — the site's spec: what is planned round the rock
// [G data] openworld/PLAN-SITES.md, the first site (the owner, 2026-11-09). Pinnacle Rock's town on its mesa stays
// settlements/pinnacle-rock's own; the site plans what stands on the world's ground round it: the nine bands that camp on
// the floor (kits/beast-riders BR_CAMP: each tribe's `lower` ground), each searched from the point the rock's own page
// gives its camp (settlements/pinnacle-rock/src/40-pr-layout.js PASTURE_AT: the camp's middle, in the page's frame, whose
// origin was this region's, map px 1027,681, until the owner moved the rock 41 km west to the savage hyperjungle's edge on
// 2026-11-10: the same offsets round the new spot), and a track from each camp's gate to the rock (core/world ROADS). The
// world seed keeps the old pixel's number (a seed, not a place: changing it would redeal every band). KSITES
// (core/world/48s-world-sites.js) plans it; core/world/bake_sites.py bakes it to plan/sites.json.
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
var SITE_SPEC={region:'pinnacle',world:1027681,
 sites:{staiytii0y:{culture:'beast-rider',road:{r:700,hw:1.6},hamlets:[
  {id:'clearing-w',name:'The Threehorn clearing',focus:'farming',bearing:280,km:6,look:2500,pop:240},
  {id:'clearing-sw',name:'The Hardshell clearing',focus:'farming',bearing:215,km:7.5,look:2500,pop:240},
  {id:'clearing-nw',name:'The Staghorn clearing',focus:'farming',bearing:330,km:8,look:2500,pop:240},
  {id:'clearing-s',name:'The Longcrawler clearing',focus:'farming',bearing:170,km:6.5,look:2500,pop:240}],
  camps:[
  {tribe:'threehorn',near:[-1230,200]},{tribe:'hardshell',near:[-870,-500]},{tribe:'longcrawler',near:[-1120,800]},
  {tribe:'staghorn',near:[-860,1350]},{tribe:'raptor',near:[1100,1080]},{tribe:'tiger',near:[1180,480]},
  {tribe:'mammoth',near:[-170,1480]},{tribe:'spider',near:[930,-330]},{tribe:'dragonfly',near:[815,1385]}]}}};
