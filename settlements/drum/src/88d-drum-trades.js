// ================================================================= DRUM — 88d: Voth Trade Census Mapping ([G data])
// Maps every one of the 44 trades in tools/trades_census.json to the placed building/arcology keys in settlements/drum.
// Checked by `python3 tools/check_trades.py settlements/drum`. Zero THREE, zero DOM.

const DRUM_TRADES = [
  { trade: 'bakers', keys: ['swa-tank-bakery', 'voth_scrap_bakery', 'shop-food'], note: 'split-tank & scrap-stone ovens in Rings 1-3' },
  { trade: 'butchers', keys: ['swa-drum-butcher', 'voth_scrap_bakery', 'shop-food'], note: 'drum slaughterhouses & beetle-meat stalls' },
  { trade: 'weavers and dyers', keys: ['swa-weaver-drums', 'swa-still-vat', 'voth_scrap_brewery'], note: 'vertical-drum dye vats & canvas looms' },
  { trade: 'brewers', keys: ['swa-still-vat', 'voth_scrap_brewery', 'swa-drum-tavern'], note: 'mushroom-mash stills & scrap-Voth breweries' },
  { trade: 'tanners', keys: ['swa-drum-butcher', 'cages'], note: 'chitin-curers & hide vats by the outer ring' },
  { trade: 'shipwrights and boatbuilders', keys: ['drum_river_wharf', 'warehouse'], note: 'barge-wrights & flatboat repair slips on the Drim Rivrh' },
  { trade: 'innkeepers and grooms', keys: ['swa-drum-tavern', 'voth_scrap_tavern'], note: 'caravan tank-inns & pack-beetle yards inside the gates' },
  { trade: 'town guard', keys: ['voth_scrap_watch', 'swa-tank-barracks', 'garrison_fortress'], note: 'Chichani ward-watches & Vinvolk auxiliary posts' },
  { trade: 'coast guard', na: 'inland river settlement on the Drim Rivrh — river watch is kept from drum_river_wharf and voth_scrap_watch' },
  { trade: 'temple priests and servants', keys: ['ordinator_fortress', 'voth_scrap_shrine'], note: 'Sun-cult priests & Ordinator chaplains of the Parabolic Dish' },
  { trade: 'shrine keepers', keys: ['swa-pipe-shrine', 'voth_scrap_shrine', 'shaman'], note: 'street pipe-shrines & Vothic wayside altars' },
  { trade: 'shopkeepers and assistants', keys: ['swa-hopper-stall', 'voth_scrap_shop', 'shop-parts'], note: 'salvage parts booths, ration shops & ring stalls' },
  { trade: 'smiths and craftsmen', keys: ['swa-drum-smithy', 'voth_scrap_smithy', 'smithy', 'swa-drum-tinker'], note: 'fin-forges, wire-drawers & boiler-plate smithies' },
  { trade: 'innkeepers and servers', keys: ['swa-drum-tavern', 'voth_scrap_tavern', 'mess'], note: 'split-drum taprooms, arena-side taverns & shanty messes' },
  { trade: 'porters and warehousemen', keys: ['swa-drum-warehouse', 'voth_scrap_warehouse', 'warehouse'], note: 'Under-Drum hoist-porters & ring bond-warehouses' },
  { trade: 'industrial workers', keys: ['swa-salvage-foundry', 'swa-cutter-yard', 'swa-drum-smithy'], note: 'alloy-smelters, torch-cutters & fin salvage crews' },
  { trade: 'power-house stokers and engineers', keys: ['gen-fuel', 'swa-bath-boilers', 'swa-salvage-foundry'], note: 'boiler-stokers, hoist-winch engineers & fuel-gen tenders' },
  { trade: 'household service', keys: ['swa-sphere-manor', 'voth_scrap_manor', 'garrison_fortress'], note: 'retainers in Horton-sphere manors & Chichani officer quarters' },
  { trade: 'soldiers', keys: ['garrison_fortress', 'voth_scrap_barracks', 'swa-tank-barracks'], note: 'Vothic garrison legionaries & assimilated Vinvolk levies' },
  { trade: 'teachers and scholars', keys: ['swa-apothecary-pod', 'voth_scrap_workshop', 'ordinator_fortress'], note: 'Chichani assimilation tutors, blueprint readers & inquisitorial scribes' },
  { trade: 'guild officers and clerks', keys: ['swa-bourse-rotunda', 'scrap_market_rotunda', 'voth_scrap_workshop'], note: 'Under-Drum Salvage Guild wardens & assay clerks' },
  { trade: 'customs officers and clerks', keys: ['swa-bourse-rotunda', 'voth_scrap_granary', 'garrison_fortress'], note: 'imperial alloy-tithe weighers & gate customs factors' },
  { trade: 'healers and nurses', keys: ['swa-apothecary-pod', 'swa-bath-boilers', 'voth_scrap_bathhouse', 'shaman'], note: 'arena bone-setters, bath-chirurgeons & poultice pods' },
  { trade: 'priests and undertakers', keys: ['voth_scrap_tomb', 'ordinator_fortress'], note: 'ash-urn keepers & funerary chaplains' },
  { trade: 'lighthouse keepers', keys: ['voth_scrap_watch', 'drum_river_wharf'], note: 'heliograph signalers & river-sluice beacon tenders' },
  { trade: 'dockers and stevedores', keys: ['drum_river_wharf', 'swa-drum-warehouse'], note: 'heavy scrap & timber stevedores at the Drim Rivrh quay' },
  { trade: 'river bargemen and quay hands', keys: ['drum_river_wharf', 'warehouse'], note: 'Drim Rivrh flatboat crews & sluice hands' },
  { trade: 'fishers', keys: ['shop-food', 'drum_river_wharf'], note: 'eel-weir & river-net fishers along the Drim Rivrh' },
  { trade: 'market traders', keys: ['scrap_market_rotunda', 'swa-bourse-rotunda', 'voth_scrap_market', 'swa-hopper-stall'], note: 'regional scrap-market factors & Under-Drum bourse dealers' },
  { trade: 'farmhands and ploughmen', keys: ['farmhouse'], note: 'outer-palisade dryland barley & root-plot hands' },
  { trade: 'chinampa growers', keys: ['farmhouse', 'drum_river_wharf'], note: 'reed-bed & river-silt vegetable growers along the Drim bank' },
  { trade: 'orchardmen', keys: ['farmhouse'], note: 'sheltered fin-lee scrub-fruit & thorn-plum tenders' },
  { trade: 'miners', keys: ['quarry_salvage_foundry', 'swa-cutter-yard'], note: 'deep-core concrete & rebar shaft-cutters in the Ruin Quarry' },
  { trade: 'quarrymen and masons', keys: ['quarry_salvage_foundry', 'swa-cutter-yard'], note: 'Ancient curtain-wall masons & Ruin Quarry block-breakers' },
  { trade: 'granary keepers and millers', keys: ['swa-silo-granary', 'voth_scrap_granary', 'granary', 'gen-wind'], note: 'bolted steel grain-silos & wind-millers' },
  { trade: 'beetle herders', keys: ['swa-beetle-kraal', 'cages'], note: 'pack-beetle & meat-beetle kraals in the outer shanty ring' },
  { trade: 'dairymen', keys: ['swa-beetle-kraal'], note: 'kraal curds & beetle-milk tenders' },
  { trade: 'swineherds and duck keepers', keys: ['cages', 'farmhouse'], note: 'outer-ring offal-swine & river-duck pens' },
  { trade: 'mushroom growers', keys: ['drum_arcology', 'swa-still-vat'], note: 'dark-vault mycelium & vat-fungus tenders on Drum Levels 4-6' },
  { trade: 'envoys and embassy staff', keys: ['voth_scrap_manor', 'garrison_fortress'], note: 'Torus factor-envoys & Vothic military legates' },
  { trade: 'ferrymen', keys: ['drum_river_wharf', 'warehouse'], note: 'cable-skiff ferrymen crossing the Drim Rivrh' },
  { trade: 'elephant bug handlers and station hands', keys: ['swa-beetle-kraal', 'scrap_market_rotunda'], note: 'heavy tribute-caravan bug handlers at the SE Voth gate' },
  { trade: 'monks and lay brothers', keys: ['ordinator_fortress', 'voth_scrap_shrine'], note: 'Ordinator lay-brothers & Cloister of Ash novices' },
  { trade: 'palace and canton staffs', keys: ['garrison_fortress', 'voth_scrap_barracks'], note: 'Military Governor praetorium stewards, scribes & orderlies' }
];

if (typeof window !== 'undefined') window.DRUM_TRADES = DRUM_TRADES;
else globalThis.DRUM_TRADES = DRUM_TRADES;
