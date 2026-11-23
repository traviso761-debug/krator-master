// ================================================================= THE IZIZ CLUSTER: the sites' spec
// [G data] openworld/PLAN-SITES.md, the third region (the owner, 2026-11-09: Girder, Mav's Refuge and Talia as three
// sites in one region, "with the roads between them"). The towns stay their own pages' (settlements/girder,
// settlements/mavs-refuge, kits/talia); each site plans what stands on the world's ground round its town:
//   Mav's Refuge   the spider riders' web city in the savage hyperjungle: the spider, longcrawler and dragonfly bands
//                  camped in the jungle round it (kits/beast-riders BR_CAMP: each tribe's `lower` ground), a track from
//                  each camp's gate to the town
//   Girder         the outlying Beast Rider village in its four-tower ruin: the raptor and threehorn bands, their tracks
//   Talia          the Talei's city on the SE savannah rim: four farming villages and a ranch on core/hamlet's `iziz` row
//                  (21-hamlet-iziz.js: the Iziz Vernacular's farms and houses), each with a road from its lane end to
//                  the town, joined into a network
//   links          the roads between the towns, through the cut's corridors (Mav's Refuge to Girder 128 km, Girder to
//                  Talia 156 km), laid: the ground is shaped to them; kept inside the cut (keep: routed in 8 km hops along the
//                  corridor, never leaving the polygon)
//   stops          along each link (the owner, 2026-11-11): a caravanserai every 25 km of road (a wagon caravan's day at
//                  20-25 km) and a rest stop halfway between, the Iziz Vernacular's (vern_caravanserai, vern_rest_stop):
//                  each searched up to 5 km along the road for good ground
// Offsets are metres east (x) and south (z) of the town's point; hamlets take a bearing (degrees from north, clockwise)
// and km. KSITES (core/world/48s-world-sites.js) plans it; core/world/bake_sites.py bakes it to plan/sites.json.
var STOPS={every:25000,inn:'vern_caravanserai',rest:'vern_rest_stop',culture:'iziz',look:5000};
var SITE_SPEC={region:'iziz-cluster',world:1048873,
 sites:{
  skukf2qmmq:{road:{r:900,hw:1.6},camps:[
   {tribe:'spider',near:[1600,-900]},{tribe:'longcrawler',near:[-1800,600]},{tribe:'dragonfly',near:[700,2000]}]},
  seed07:{road:{r:500,hw:1.6},camps:[
   {tribe:'raptor',near:[1300,700]},{tribe:'threehorn',near:[-1200,-900]}]},
  sor1zqih8x:{culture:'iziz',road:{r:1500,hw:3,join:true},hamlets:[
   {id:'farm-1',focus:'farming',bearing:40,km:7,pop:300},{id:'farm-2',focus:'farming',bearing:110,km:8,pop:300},
   {id:'farm-3',focus:'farming',bearing:190,km:6.5,pop:300},{id:'farm-4',focus:'farming',bearing:260,km:7.5,pop:300},
   {id:'ranch-1',focus:'ranch',bearing:150,km:12,pop:200}]}},
 links:[['skukf2qmmq','seed07',{hw:3,r:900,keep:true,stops:STOPS}],['seed07','sor1zqih8x',{hw:3,r:1500,keep:true,stops:STOPS}]]};
