// ================================================================= ISLE DEMO — the kits: which biome kits grow here
// [G data] The open world's kit registry (openworld/little-demo/src/47-world-kits.js says what each entry holds). One
// kit grows here, the Ring Sea isles (biomes/ringisles), but it grows the trees it borrows in their lenders' registries
// (the Throne, swbay, eastabyss, sedesert), so it is one entry per registry: RINGISLES.world() gives each its species,
// its passes (sizes and zones the isles kit's) and make/grow (the lenders' trees through RINGISLES.borrowGrow). Only the
// isles kit lays a floor (RINGISLES.WORLD_FLOOR); a lender's entry has none (floor null: the world's floor skips it).
// The weights: the isles cover the whole demo area (WORLD.kitW is 1 for every entry, 43-world-isles.js), and the zones
// (the climate classes as fields) decide what grows where.
var WORLD_KITS=(function(){
const LOD={hero:[14,90,240],mid:[50,320,900],far:[200,900,2500]};
const lender=name=>({name,global:'RINGISLES.world().'+name,overlay:null,lod:LOD,floor:null});
return[{name:'ringisles',global:'RINGISLES.world().ringisles',overlay:null,lod:LOD,get floor(){return RINGISLES.WORLD_FLOOR;}},
 lender('throne'),lender('swbay'),lender('eastabyss'),lender('sedesert')];})();
// a kit's export object by its expression (a top-level const is not on window: an indirect eval reaches it)
WORLD_KITS.api=k=>k._api||(k._api=(0,eval)(k.global));
// the nursery grows a tree or a floor patch under a field profile; the isle fields (and the rest the isles kit's zones
// read) default to 0 there, so its zones never read an undefined field
(function(){const N0=HOST.nursery,Z={};(WORLD.ISLE_FIELDS||[]).forEach(f=>Z[f]=0);
 HOST.nursery=function(profile,origin){return N0.call(HOST,Object.assign({},Z,profile||{}),origin);};})();
