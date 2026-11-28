// ================================================================= TORUS — 88d: Voth Trade Census Mapping ([G data])
// Maps every one of the 44 trades in tools/trades_census.json to the placed building/landmark keys in settlements/torus.
// Checked by `python3 tools/check_trades.py settlements/torus`. Zero THREE, zero DOM.

const TORUS_TRADES = [
  { trade: 'bakers', keys: ['swa-tank-bakery', 'voth_scrap_bakery', 'shop-food'], note: 'split-tank & scrap-stone ovens across Terraces T1-T9' },
  { trade: 'butchers', keys: ['swa-drum-butcher', 'voth_scrap_bakery', 'shop-food'], note: 'drum slaughterhouses & floodplain kraal butchers' },
  { trade: 'weavers and dyers', keys: ['swa-weaver-drums', 'dome_fibre_latex', 'swa-still-vat', 'voth_scrap_brewery'], note: 'sunboll-cotton looms & indigo/madder dye drums fed by Fibre Dome VIII' },
  { trade: 'brewers', keys: ['lm_ciderhall', 'swa-cider-press', 'swa-still-vat', 'voth_scrap_brewery'], note: 'Great Cider-Press Hall on the Wheel (WY=300m) & Wheel-drip terrace cider vats' },
  { trade: 'tanners', keys: ['swa-drum-butcher', 'cages'], note: 'kraal chitin-curers & leather dressers on T9-T10' },
  { trade: 'shipwrights and boatbuilders', keys: ['lm_river_wharf', 'warehouse'], note: 'grain & cider barge-wrights on the Tors Rivrh quay' },
  { trade: 'innkeepers and grooms', keys: ['swa-drum-tavern', 'voth_scrap_tavern'], note: 'terrace cider-inns & Voth Tithe-Road caravan hostels' },
  { trade: 'town guard', keys: ['swa-tank-barracks', 'voth_scrap_watch', 'lm_boardhall'], note: 'Rinkvolk Assize bailiffs & SE Canton watch posts' },
  { trade: 'coast guard', na: 'inland agricultural arcology on the Tors Rivrh — river customs watch is kept from lm_river_wharf and cgate_north_sea' },
  { trade: 'temple priests and servants', keys: ['lm_ordinators', 'voth_scrap_shrine', 'forest_ring_arcology'], note: 'Tzintzun Sun-cult missionaries & Sacred Wild-Ring shrine keepers' },
  { trade: 'shrine keepers', keys: ['swa-pipe-shrine', 'voth_scrap_shrine', 'shaman'], note: 'terrace pipe-shrines, harvest waysides & Vothic sun-steles' },
  { trade: 'shopkeepers and assistants', keys: ['swa-hopper-stall', 'voth_scrap_shop', 'shop-parts'], note: 'cider-arcade stalls, seed booths & SE Canton shops' },
  { trade: 'smiths and craftsmen', keys: ['swa-drum-smithy', 'voth_scrap_smithy', 'smithy', 'swa-drum-tinker', 'voth_scrap_workshop'], note: 'pruning-hook smiths, winch-riggers & barrel coopers' },
  { trade: 'innkeepers and servers', keys: ['swa-drum-tavern', 'voth_scrap_tavern', 'mess'], note: 'Wheel-Town cider taprooms & terrace taverns' },
  { trade: 'porters and warehousemen', keys: ['swa-drum-warehouse', 'voth_scrap_warehouse', 'warehouse', 'forest_ring_arcology'], note: 'Atrium hoist-porters, Tithe Bond-Store hands & cask stevedores' },
  { trade: 'industrial workers', keys: ['lm_ciderhall', 'swa-cutter-yard', 'swa-drum-smithy'], note: 'hydraulic twin-screw press crews, hoist mechanics & salvage cutters' },
  { trade: 'power-house stokers and engineers', keys: ['swa-bath-boilers', 'gen-fuel', 'dome_mist_tea'], note: 'ag-dome climate-boiler stokers & Atrium hoist engineers' },
  { trade: 'household service', keys: ['swa-sphere-manor', 'voth_scrap_manor', 'lm_emissary'], note: 'retainers in Horton-sphere manors & the Vothic Emissary compound' },
  { trade: 'soldiers', keys: ['voth_scrap_barracks', 'lm_ordinators', 'lm_emissary'], note: 'Chichani treaty-escort troops, Ordinator guards & Rinkvolk levy tithe' },
  { trade: 'teachers and scholars', keys: ['lm_boardhall', 'swa-apothecary-pod', 'swa-herb-dome', 'swa-seed-silo'], note: 'Senior Tenders of the Plant Lore & keepers of the fragmentary botanical manuals' },
  { trade: 'guild officers and clerks', keys: ['lm_boardhall', 'voth_scrap_workshop', 'lm_ciderhall'], note: 'Elected Chairman & Board clerks, Tenders Guild registrars & Cider Assay factors' },
  { trade: 'customs officers and clerks', keys: ['lm_tithe_granary', 'voth_scrap_granary', 'cgate_voth_highway'], note: 'Imperial Food-Tithe talliers & Light Customs Wall gate clerks' },
  { trade: 'healers and nurses', keys: ['dome_earth_med_1', 'dome_earth_med_2', 'dome_ancient_medical', 'swa-apothecary-pod', 'swa-bath-boilers', 'voth_scrap_bathhouse'], note: 'Pharmacopoeia Tenders, Amber-Sap sanctuary keepers & terrace apothecaries' },
  { trade: 'priests and undertakers', keys: ['voth_scrap_tomb', 'lm_ordinators'], note: 'SE Canton ossuary keepers & funerary chaplains' },
  { trade: 'lighthouse keepers', keys: ['voth_scrap_watch', 'lm_river_wharf'], note: 'Wheel-rim fog-lantern & Tors Rivrh barge-beacon tenders' },
  { trade: 'dockers and stevedores', keys: ['lm_river_wharf', 'swa-drum-warehouse'], note: 'cider-tun & grain-sack stevedores on the Tors Rivrh wharf' },
  { trade: 'river bargemen and quay hands', keys: ['lm_river_wharf', 'warehouse'], note: 'Tors Rivrh grain/cider barge crews & lock hands' },
  { trade: 'fishers', keys: ['shop-food', 'lm_river_wharf'], note: 'Tors Rivrh net-fishers & irrigation-canal eel trappers' },
  { trade: 'market traders', keys: ['swa-hopper-stall', 'voth_scrap_shop', 'lm_ciderhall'], note: 'cider, spice & produce factors on the terrace ring roads' },
  { trade: 'farmhands and ploughmen', keys: ['farmhouse', 'swa-seed-silo', 'swa-silo-granary'], note: 'stepped-terrace barley/paddy hands & reclaimed Soleri outpost growers' },
  { trade: 'chinampa growers', keys: ['farmhouse', 'lm_river_wharf'], note: 'T10 floodplain chinampa & canal-bed vegetable growers along the Tors Rivrh' },
  { trade: 'orchardmen', keys: ['forest_ring_arcology', 'lm_ciderhall', 'swa-cider-press', 'dome_dryland_orchard'], note: 'tethered Wheel-rim fruitvine harvesters, Crown mother-orchardists & heirloom terrace growers' },
  { trade: 'miners', keys: ['swa-cutter-yard', 'lm_transit_terminal'], note: 'fallen-Wheel limestone/rebar quarrymen & ruined transit salvage crews' },
  { trade: 'quarrymen and masons', keys: ['swa-cutter-yard', 'lm_transit_terminal'], note: 'basalt terrace-riser masons & Ancient aqueduct repair crews' },
  { trade: 'granary keepers and millers', keys: ['lm_tithe_granary', 'swa-silo-granary', 'voth_scrap_granary', 'granary', 'gen-wind'], note: 'Imperial Tithe Granary wardens & terrace silo-millers' },
  { trade: 'beetle herders', keys: ['swa-beetle-kraal', 'cages'], note: 'T10 pack-beetle & draught-beetle kraal herders' },
  { trade: 'dairymen', keys: ['swa-beetle-kraal', 'cages'], note: 'lower-terrace curd & beetle-dairy tenders' },
  { trade: 'swineherds and duck keepers', keys: ['cages', 'farmhouse'], note: 'cider-pomace swineherds & paddy-terrace duck keepers' },
  { trade: 'mushroom growers', keys: ['swa-seed-silo', 'swa-herb-dome', 'dome_ancient_medical'], note: 'mycorrhizal inoculant & cellar-fungus tenders in the Foot vaults & Ag-Domes' },
  { trade: 'envoys and embassy staff', keys: ['lm_emissary', 'voth_scrap_manor'], note: 'Tzintzun\'s Imperial Emissary, diplomatic chancery & Chichani treaty factors' },
  { trade: 'ferrymen', keys: ['lm_river_wharf', 'warehouse'], note: 'Tors Rivrh cable-ferrymen linking T10 to the northern Soleri fields' },
  { trade: 'elephant bug handlers and station hands', keys: ['swa-beetle-kraal', 'lm_tithe_granary'], note: 'Imperial Food-Tithe caravan bug handlers at the Great Voth Gate' },
  { trade: 'monks and lay brothers', keys: ['lm_emissary', 'lm_ordinators', 'voth_scrap_shrine'], note: 'free-moving Sun-cult missionary brothers & Ordinator lay-scribes' },
  { trade: 'palace and canton staffs', keys: ['lm_boardhall', 'lm_emissary', 'voth_scrap_barracks'], note: 'Board Hall stewards, Emissary household & SE Canton clerks' }
];

if (typeof window !== 'undefined') window.TORUS_TRADES = TORUS_TRADES;
else globalThis.TORUS_TRADES = TORUS_TRADES;
