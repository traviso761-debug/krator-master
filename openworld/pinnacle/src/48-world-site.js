// ================================================================= PINNACLE — the site's spec: what is planned round the rock
// [G data] openworld/PLAN-SITES.md, the first site (the owner, 2026-11-09). Pinnacle Rock's town on its mesa stays
// settlements/pinnacle-rock's own; the site plans what stands on the world's ground round it: the nine bands that camp on
// the floor (kits/beast-riders BR_CAMP: each tribe's `lower` ground), each searched from the point the rock's own page
// gives its camp (settlements/pinnacle-rock/src/40-pr-layout.js PASTURE_AT: the camp's middle, in the page's frame, whose
// origin is this region's: map px 1027,681), and a track from each camp's gate to the rock (core/world ROADS). KSITES
// (core/world/48s-world-sites.js) plans it; core/world/bake_sites.py bakes it to plan/sites.json.
var SITE_SPEC={region:'pinnacle',world:1027681,
 sites:{staiytii0y:{road:{r:700,hw:1.6},camps:[
  {tribe:'threehorn',near:[-1230,200]},{tribe:'hardshell',near:[-870,-500]},{tribe:'longcrawler',near:[-1120,800]},
  {tribe:'staghorn',near:[-860,1350]},{tribe:'raptor',near:[1100,1080]},{tribe:'tiger',near:[1180,480]},
  {tribe:'mammoth',near:[-170,1480]},{tribe:'spider',near:[930,-330]},{tribe:'dragonfly',near:[815,1385]}]}}};
