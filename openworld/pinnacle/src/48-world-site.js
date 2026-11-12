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
//             Mav's Refuge   from Talon, Beast Rider trail trail.0.3   trade (Girder beyond it: openworld/iziz-cluster)
//             Nusidi         from Mav's Refuge, Izani highway 20.24    raid
//             Fort Ordo      from Kreia, the trunks by the Sleeping City trade
//             Coyote Canyon  dirt.coyote, on the north half of the trough's floor east of the rock (the Shade road on
//                            its south half, 10 km apart: one turns north-east, the other south-east, and they never
//                            cross; on the trough's north wall the road had switchbacked)
//                                                                      long-distance trade (the coyotemen)
//             Shade          a guide: the trough east, the gap north of the crater's east wall, then south down the
//                            Nomad Country's floor                     long-distance trade (the Dasri, until their
//                                                                      northern village is placed)
//           each leaving its towns from 1.8 km out (r), beyond the ring of the bands' camps round the rock (1.0 to 1.64 km
//           out: from 900 m the Talon road ran through the raptor camp and the Kreia road past the longcrawlers'),
//           laid (the ground is shaped to them), kept inside the cut (routed in 8 km hops along the line), bridged where
//           they cross a named river (core/world 42b, SITE_SPEC.bridges), with a caravanserai every 25 km of road (a
//           caravan's day) and a rest stop halfway between: the Iziz Vernacular's (vern_caravanserai, vern_rest_stop),
//           the kit the Izani highways' stops take in the Iziz cluster. The Beast Riders have a roadside inn
//           (br_bldg_riders_inn) but core/world 88s draws a stop only from a village kit (xanadu, iziz): KNOWN_ISSUES.md
// KSITES (core/world/48s-world-sites.js) plans it; core/world/bake_sites.py bakes it to plan/sites.json.
var STOPS={every:25000,inn:'vern_caravanserai',rest:'vern_rest_stop',culture:'iziz',look:5000};
/* a link along its corridor's line (region.json cut.corridors, written by cut_site.py from openworld/SITES.json) */
var CORRIDOR=(a,b)=>{const C=((WORLD_DATA.meta.cut||{}).corridors||[]).find(c=>c.from===a&&c.to===b);return C?C.px:null;};
var LINK=(a,b,o)=>[a,b,Object.assign({hw:3,r:1800,keep:true,stops:STOPS,guide:CORRIDOR(a,b)},o||{})];
var SITE_SPEC={region:'pinnacle',world:1027681,bridges:{culture:'iziz'},
 sites:{staiytii0y:{road:{r:700,hw:1.6},camps:[
  {tribe:'threehorn',near:[-1230,200]},{tribe:'hardshell',near:[-870,-500]},{tribe:'longcrawler',near:[-1120,800]},
  {tribe:'staghorn',near:[-860,1350]},{tribe:'raptor',near:[1100,1080]},{tribe:'tiger',near:[1180,480]},
  {tribe:'mammoth',near:[-170,1480]},{tribe:'spider',near:[930,-330]},{tribe:'dragonfly',near:[815,1385]}]},
  /* the partners: their towns are not planned here (their own pages, or none yet); each is a link's end */
  ski7uk8fjc:{},sghb3jlsk5:{},s1kaqxmg10:{},s5c6ysqazg:{},skukf2qmmq:{},s2199308wr:{},soksvzt1h9:{},slfozs6c7z:{}},
 links:[LINK('staiytii0y','ski7uk8fjc'),LINK('staiytii0y','sghb3jlsk5'),LINK('staiytii0y','s1kaqxmg10'),
  LINK('sghb3jlsk5','skukf2qmmq'),LINK('skukf2qmmq','s2199308wr'),LINK('s1kaqxmg10','s5c6ysqazg'),
  LINK('staiytii0y','soksvzt1h9'),LINK('staiytii0y','slfozs6c7z')]};
