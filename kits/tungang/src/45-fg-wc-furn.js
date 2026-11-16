// prefix: fg
// ================================================================= THE PUEBLO'S ROOMS: what each room holds, by its use (the owner, 2026-11-11: interiors for both great houses)
// core/pueblo places the pieces (KPUEBLO.furnish: against the walls, clear of the door, the hatch and its ladder); this table
// says which catalog pieces a room of each use holds, how many and where. The pieces are the catalog's Fellgang ones
// (kits/catalog/krator-master-furniture-fellgang.js, the pueblo section added 2026-11-11). w and d are each piece's declared
// size, written here so the plan is the same with or without the catalog loaded (a world's bundle); verify.py checks them
// against the catalog. at: 'back' (the back wall), 'wall' (any wall), 'corner', 'centre'. n: [min, max]; p: the chance.
// Plain data ([G data]).
const FG_WC_FURN={
 store:[{key:'fellgang_poor_grain_bin',w:1.4,d:.8,h:.9,at:'wall',n:[1,2],v:2},
  {key:'fellgang_poor_storage_jars',w:.9,d:.7,h:.8,at:'corner',n:[0,2]},
  {key:'fellgang_poor_salvage_bin',w:1.2,d:.7,h:.7,at:'wall',p:.35},
  {key:'fellgang_poor_hide_sacks',w:.9,d:.6,h:.7,at:'wall',n:[0,1]},
  {key:'fellgang_poor_water_jar',w:.5,d:.5,h:.8,at:'corner',p:.3}],
 home:[{key:'fellgang_common_sleeping_platform',w:2,d:1,h:.75,at:'wall',n:[1,1],v:2},
  {key:'fellgang_common_corner_hearth',w:.9,d:.9,h:1.7,at:'corner',n:[1,1]},
  {key:'fellgang_common_mealing_bins',w:1.6,d:.6,h:.5,at:'wall',p:.6},
  {key:'fellgang_common_wall_niche',w:.9,d:.35,h:1.4,at:'wall',n:[0,1],v:2},
  {key:'fellgang_poor_water_jar',w:.5,d:.5,h:.8,at:'corner',p:.6},
  {key:'fellgang_common_felt_loom',w:1.4,d:.6,h:1.8,at:'wall',p:.2,v:2},
  {key:'fellgang_common_chest',w:1,d:.55,h:.72,at:'wall',p:.35},
  {key:'fellgang_poor_stool',w:.5,d:.5,h:.5,at:'centre',n:[0,2],v:2}],
 hero:[{key:'fellgang_court_horned_seat',w:1.2,d:1,h:1.9,at:'back',n:[1,1]},
  {key:'fellgang_common_sleeping_platform',w:2,d:1,h:.75,at:'wall',n:[1,1],v:2},
  {key:'fellgang_court_spear_rack',w:1.6,d:.4,h:2.1,at:'wall',n:[1,1]},
  {key:'fellgang_common_corner_hearth',w:.9,d:.9,h:1.7,at:'corner',n:[1,1]},
  {key:'fellgang_common_war_drum',w:.8,d:.8,h:1.1,at:'corner',p:.6},
  {key:'fellgang_common_chest',w:1,d:.55,h:.72,at:'wall',p:.5}]};
/* the keys and sizes the table names, for verify.py's check against the catalog */
function fgWcFurnKeys(){const o={},T=[FG_WC_FURN,FG_WC_KIVA].concat(typeof FG_BC!=='undefined'?[FG_BC.KIVA]:[]);for(const tb of T)for(const u in tb)for(const it of tb[u])o[it.key]={w:it.w,d:it.d,h:it.h};return o;}
/* the kivas: the round room's benches and drums (the Boast is heard, the hands counted), a small kiva's water jar and stools */
const FG_WC_KIVA={
 great:[{key:'fellgang_common_bench',w:1.8,d:.45,h:.62,n:[4,4]},{key:'fellgang_common_war_drum',w:.8,d:.8,h:1.1,n:[2,2]},{key:'fellgang_common_brazier',w:.7,d:.7,h:1.25,n:[1,1]}],
 small:[{key:'fellgang_poor_water_jar',w:.5,d:.5,h:.8,n:[1,1]},{key:'fellgang_poor_stool',w:.5,d:.5,h:.5,n:[2,3],v:2}]};