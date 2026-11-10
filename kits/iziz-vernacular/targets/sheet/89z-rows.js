// TARGET: sheet — the Iziz Vernacular kit's own sheet (build.py; laid out by 90-vsheet-scene.js), front (+z) toward the camera.
// The rows of Iziz's `vernacular` target (settlements/iziz/targets/vernacular) for the kit's own defs: poor to rich houses, the
// trades, the works, civic, the guilds, the frontier set and the trades round. Iziz's rows of other kits' buildings (the Voth
// embassy and the Order's chapterhouse, Iziz's 75/76-port-*; the two Ancients-reclaimed guilds, 77-anc-guilds.js) stay on
// Iziz's sheet. The bodies are built SOLID here: the hollow bodies and their furniture (69e-vern-hollow.js and Iziz's
// 95i-iziz-interiors.js, which is Iziz's, not the kit's) stay on Iziz's sheet until the interiors pass moves to the kit; a
// ?interiors=1 mode would set VERN.interiors and take kits/interiors and core/furnish as Highlands' page does.
VERN.interiors=false;
const SHEET={title:'Iziz Vernacular Kit',build:'iziz-vernacular',ground:'dirt',groundRepeat:150,haze:.00055,
 owns:k=>/^vern_/.test(k),trades:()=>vernTradesAudit(),
 panes:['vWinClear','vWinLit'],
 budget:{showcase:{tris:4500000,calls:500}},
 rows:[
  {family:'Poor dwellings',keys:['vern_house_poor_a','vern_house_poor_b','vern_house_poor_c']},
  {family:'Middle dwellings',keys:['vern_house_mid_a','vern_house_mid_b','vern_house_mid_c']},
  {family:'Rich dwellings',keys:['vern_house_rich_a','vern_house_rich_b']},
  {family:'Shops and tavern',keys:['vern_shops','vern_tavern']},
  {family:'Workshops and smithy',keys:['vern_workshop_a','vern_workshop_b','vern_smithy']},
  {family:'Market and warehouse',keys:['vern_market','vern_warehouse']},
  {family:'Silos, tank, generator',keys:['vern_silos','vern_tank','vern_generator']},
  {family:'School and hospital',keys:['vern_school','vern_hospital']},
  {family:'Alchemist and barracks',keys:['vern_alchemist','vern_barracks']},
  {family:'Guilds — farmers, beast hunters',keys:['vern_farmers_guild','vern_beast_hunters_guild']},
  {family:'Caravanserai and Forgemasters',keys:['vern_caravanserai','vern_forgemasters_hall']},
  // the frontier set (74b-vern-frontier.js, built for Verge's upper city)
  {family:"Frontier — Governor's House, guard tower, watch, toll",keys:['vern_governor_palace','vern_guard_tower','vern_watch_house','vern_toll_house']},
  {family:'Frontier — palisade, gate, mustering ground',keys:[{key:'vern_palisade',o:{len:6}},'vern_palisade_gate',{key:'vern_palisade',o:{len:6},label:'Palisade (6 m)'},'vern_mustering_ground']},
  // the rest stop: v0 cut into the rock; v1 on the cliff edge, raised 5.4 m so its retaining wall shows above the sheet's ground
  {family:'Frontier — rest stops',keys:[{key:'vern_rest_stop',label:'Rest stop (v0: rock-cut)'},{key:'vern_rest_stop',o:{v:1,y:5.4},label:'Rest stop (v1: cliff platform, raised 5.4 m)'}]},
  // the trades round (2026-10-16; 71a-71c, 73b, 73c): every trade the Voth census has that the set lacked
  {family:'Trades — food',keys:['vern_bakery','vern_butcher','vern_brewery','vern_provisioner']},
  {family:'Trades — cloth, leather, letters',keys:['vern_weaver','vern_tannery','vern_tailor','vern_scribe']},
  {family:'Trades — crafts and salvage',keys:['vern_apothecary','vern_tinker','vern_glassworks','vern_salvage_yard']},
  {family:'Trades — mine, quarry, mill, fungus',keys:['vern_mine','vern_quarry','vern_mill','vern_fungus_shed']},
  {family:'Trades — farm, stock, water',keys:['vern_farmhouse','vern_byre','vern_pens','vern_boatyard','vern_fish_landing']},
 ]};
