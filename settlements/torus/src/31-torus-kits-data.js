// ================================================================= TORUS — 31: Kit Catalogs, Specimens & Census Data ([G data])
// Exact dimensions (w x d x h), depth classes (S=10m, M=12m, L=18m, XL=20-24m), resident capacities, valid core/tags
// metadata, rare Ancient medical crop lines, quarantined feral dome hazards, and Voth 44-trade census mappings.
// Zero THREE, zero DOM.
(function (root) {
  'use strict';

  var TORUS = root.TORUS || (root.TORUS = {});

  function def(kit, key, cls, w, d, h, st, pop, culture, style, types, wealth, job, trades) {
    return {
      kit: kit,
      key: key,
      cls: cls,
      w: w,
      d: d,
      h: h,
      st: st,
      pop: pop,
      culture: culture,
      style: style,
      types: types,
      wealth: wealth,
      job: job,
      trades: trades || []
    };
  }

  // 1. SW Arcology Vassal Kit (kits/sw-arcology/PLAN.md): all 32 definitions (28 base + 4 Torus agro/cider/ag-dome defs)
  var SWA = [
    /* Class S (d = 10 m) */
    def('sw-arcology', 'swa-drum-hut', 'S', 10, 10, 7, 1, 6, 'post-apoc', 'sw-arcology', ['dwelling-single'], 'poor', null, []),
    def('sw-arcology', 'swa-silo-cot', 'S', 10, 10, 9, 2, 8, 'post-apoc', 'sw-arcology', ['dwelling-single'], 'poor', null, []),
    def('sw-arcology', 'swa-tank-shack', 'S', 12, 10, 7, 1, 6, 'post-apoc', 'sw-arcology', ['dwelling-single'], 'poor', null, []),
    def('sw-arcology', 'swa-hopper-stall', 'S', 10, 10, 8, 1, 2, 'post-apoc', 'sw-arcology', ['shop', 'market'], 'poor', 'trading', ['market traders', 'shopkeepers and assistants']),
    def('sw-arcology', 'swa-drum-tinker', 'S', 12, 10, 7, 1, 3, 'post-apoc', 'sw-arcology', ['shop', 'industry'], 'poor', 'pottery', ['smiths and craftsmen']),
    def('sw-arcology', 'swa-pipe-shrine', 'S', 8, 10, 9, 1, 1, 'post-apoc', 'sw-arcology', ['religious'], null, 'worship', ['shrine keepers']),
    def('sw-arcology', 'swa-valve-well', 'S', 8, 10, 6, 1, 0, 'post-apoc', 'sw-arcology', ['infrastructure'], null, null, []),

    /* Class M (d = 12 m) — includes Torus #29 swa-seed-silo & #30 swa-cider-press */
    def('sw-arcology', 'swa-twindrum-house', 'M', 14, 12, 9, 2, 12, 'post-apoc', 'sw-arcology', ['dwelling-multi'], 'middle', null, []),
    def('sw-arcology', 'swa-tank-duplex', 'M', 16, 12, 10, 2, 14, 'post-apoc', 'sw-arcology', ['dwelling-multi'], 'middle', null, []),
    def('sw-arcology', 'swa-silo-stack', 'M', 12, 12, 14, 3, 18, 'post-apoc', 'sw-arcology', ['dwelling-multi'], 'middle', null, []),
    def('sw-arcology', 'swa-drum-smithy', 'M', 14, 12, 9, 2, 4, 'post-apoc', 'sw-arcology', ['industry', 'shop'], 'middle', 'smithing', ['smiths and craftsmen', 'industrial workers']),
    def('sw-arcology', 'swa-still-vat', 'M', 14, 12, 10, 2, 4, 'post-apoc', 'sw-arcology', ['industry'], 'middle', 'brewing', ['brewers', 'weavers and dyers']),
    def('sw-arcology', 'swa-drum-butcher', 'M', 12, 12, 8, 1, 3, 'post-apoc', 'sw-arcology', ['shop', 'industry'], 'middle', 'butchery', ['butchers', 'tanners']),
    def('sw-arcology', 'swa-tank-bakery', 'M', 14, 12, 8, 1, 4, 'post-apoc', 'sw-arcology', ['shop'], 'middle', 'baking', ['bakers']),
    def('sw-arcology', 'swa-drum-tavern', 'M', 16, 12, 10, 2, 8, 'post-apoc', 'sw-arcology', ['tavern', 'inn'], 'middle', 'brewing', ['innkeepers and servers', 'innkeepers and grooms']),
    def('sw-arcology', 'swa-cutter-yard', 'M', 16, 12, 9, 1, 4, 'post-apoc', 'sw-arcology', ['industry'], 'middle', 'quarrying', ['quarrymen and masons', 'miners', 'industrial workers']),
    def('sw-arcology', 'swa-weaver-drums', 'M', 14, 12, 9, 2, 5, 'post-apoc', 'sw-arcology', ['industry', 'shop'], 'middle', 'weaving', ['weavers and dyers']),
    def('sw-arcology', 'swa-apothecary-pod', 'M', 12, 12, 9, 2, 4, 'post-apoc', 'sw-arcology', ['shop', 'civic'], 'middle', 'alchemy', ['healers and nurses', 'teachers and scholars']),
    def('sw-arcology', 'swa-seed-silo', 'M', 12, 12, 13, 2, 3, 'post-apoc', 'sw-arcology', ['farm', 'industry'], 'middle', 'farming', ['granary keepers and millers', 'teachers and scholars', 'mushroom growers']),
    def('sw-arcology', 'swa-cider-press', 'M', 16, 12, 10, 2, 5, 'post-apoc', 'sw-arcology', ['industry', 'farm'], 'middle', 'brewing', ['brewers', 'orchardmen']),

    /* Class L (d = 18 m) — includes Torus #31 swa-herb-dome */
    def('sw-arcology', 'swa-trisilo-tenement', 'L', 20, 18, 16, 4, 36, 'post-apoc', 'sw-arcology', ['dwelling-multi'], 'middle', null, []),
    def('sw-arcology', 'swa-sphere-manor', 'L', 20, 18, 15, 3, 22, 'post-apoc', 'sw-arcology', ['dwelling-single'], 'rich', null, ['household service']),
    def('sw-arcology', 'swa-clarifier-court', 'L', 24, 18, 12, 3, 34, 'post-apoc', 'sw-arcology', ['dwelling-multi'], 'middle', null, []),
    def('sw-arcology', 'swa-tank-barracks', 'L', 26, 18, 11, 2, 36, 'post-apoc', 'sw-arcology', ['military'], 'middle', null, ['town guard']),
    def('sw-arcology', 'swa-silo-granary', 'L', 24, 18, 16, 3, 4, 'post-apoc', 'sw-arcology', ['industry', 'infrastructure'], 'middle', 'milling', ['granary keepers and millers']),
    def('sw-arcology', 'swa-drum-warehouse', 'L', 26, 18, 11, 2, 4, 'post-apoc', 'sw-arcology', ['industry'], 'middle', 'warehousing', ['porters and warehousemen', 'dockers and stevedores']),
    def('sw-arcology', 'swa-bath-boilers', 'L', 22, 18, 11, 2, 4, 'post-apoc', 'sw-arcology', ['civic'], 'middle', 'healing', ['healers and nurses', 'power-house stokers and engineers']),
    def('sw-arcology', 'swa-beetle-kraal', 'L', 26, 18, 9, 1, 6, 'post-apoc', 'sw-arcology', ['farm'], 'poor', 'herding', ['beetle herders', 'elephant bug handlers and station hands', 'dairymen']),
    def('sw-arcology', 'swa-herb-dome', 'L', 20, 18, 11, 1, 4, 'ancient', 'sw-arcology', ['farm', 'civic'], 'rich', 'alchemy', ['healers and nurses', 'teachers and scholars', 'orchardmen', 'mushroom growers']),

    /* Class XL (d = 20-24 m) — includes Torus #32 swa-feral-dome */
    def('sw-arcology', 'swa-salvage-foundry', 'XL', 30, 22, 14, 2, 8, 'post-apoc', 'sw-arcology', ['industry'], 'middle', 'smithing', ['industrial workers', 'power-house stokers and engineers', 'smiths and craftsmen']),
    def('sw-arcology', 'swa-bourse-rotunda', 'XL', 28, 24, 13, 2, 6, 'post-apoc', 'sw-arcology', ['market', 'civic'], 'rich', 'trading', ['market traders', 'guild officers and clerks', 'customs officers and clerks']),
    def('sw-arcology', 'swa-feral-dome', 'XL', 22, 20, 11, 1, 0, 'ancient', 'sw-arcology', ['infrastructure'], null, null, [])
  ];

  // 2. Scrap Voth Set (concentrated in the SE Scrap Voth Extension + customs gates & tithe granaries)
  var VOTH_SCRAP = [
    def('voth-scrap', 'voth_scrap_house_poor', 'S', 11, 8, 6, 1, 6, 'voth', 'scrap-voth', ['dwelling-single'], 'poor', null, []),
    def('voth-scrap', 'voth_scrap_shop', 'S', 9, 10, 7, 1, 3, 'voth', 'scrap-voth', ['shop'], 'middle', 'trading', ['shopkeepers and assistants']),
    def('voth-scrap', 'voth_scrap_tomb', 'S', 6, 10, 7, 1, 1, 'voth', 'scrap-voth', ['funerary', 'religious'], null, 'worship', ['priests and undertakers']),
    def('voth-scrap', 'voth_scrap_watch', 'S', 12, 8, 11, 2, 4, 'voth', 'scrap-voth', ['military'], null, null, ['town guard', 'lighthouse keepers', 'coast guard']),

    def('voth-scrap', 'voth_scrap_house', 'M', 12, 12, 9, 2, 12, 'voth', 'scrap-voth', ['dwelling-single'], 'middle', null, []),
    def('voth-scrap', 'voth_scrap_tavern', 'M', 12, 12, 9, 2, 8, 'voth', 'scrap-voth', ['tavern', 'inn'], 'middle', 'brewing', ['innkeepers and servers']),
    def('voth-scrap', 'voth_scrap_warehouse', 'M', 21, 11, 9, 2, 4, 'voth', 'scrap-voth', ['industry'], 'middle', 'warehousing', ['porters and warehousemen']),
    def('voth-scrap', 'voth_scrap_shrine', 'M', 10, 11, 10, 1, 3, 'voth', 'scrap-voth', ['religious'], 'middle', 'worship', ['temple priests and servants', 'shrine keepers', 'monks and lay brothers']),
    def('voth-scrap', 'voth_scrap_smithy', 'M', 14, 12, 9, 2, 4, 'voth', 'scrap-voth', ['industry', 'shop'], 'middle', 'smithing', ['smiths and craftsmen']),
    def('voth-scrap', 'voth_scrap_bakery', 'M', 14, 12, 8, 1, 4, 'voth', 'scrap-voth', ['shop'], 'middle', 'baking', ['bakers', 'butchers']),
    def('voth-scrap', 'voth_scrap_brewery', 'M', 16, 12, 10, 2, 4, 'voth', 'scrap-voth', ['industry'], 'middle', 'brewing', ['brewers', 'weavers and dyers']),
    def('voth-scrap', 'voth_scrap_workshop', 'M', 14, 12, 9, 2, 5, 'voth', 'scrap-voth', ['industry', 'shop'], 'middle', 'carpentry', ['smiths and craftsmen', 'teachers and scholars', 'guild officers and clerks']),

    def('voth-scrap', 'voth_scrap_manor', 'L', 16, 17, 12, 2, 20, 'voth', 'scrap-voth', ['dwelling-single'], 'rich', null, ['household service', 'envoys and embassy staff']),
    def('voth-scrap', 'voth_scrap_tenement', 'L', 18, 18, 14, 3, 32, 'voth', 'scrap-voth', ['dwelling-multi'], 'middle', null, []),
    def('voth-scrap', 'voth_scrap_bathhouse', 'L', 20, 18, 11, 2, 4, 'voth', 'scrap-voth', ['civic'], 'middle', 'healing', ['healers and nurses']),
    def('voth-scrap', 'voth_scrap_granary', 'L', 22, 18, 13, 3, 4, 'voth', 'scrap-voth', ['industry'], 'middle', 'milling', ['granary keepers and millers', 'customs officers and clerks']),
    def('voth-scrap', 'voth_scrap_barracks', 'L', 24, 18, 11, 2, 34, 'voth', 'scrap-voth', ['military'], 'middle', null, ['soldiers', 'palace and canton staffs']),

    def('voth-scrap', 'voth_scrap_market', 'XL', 27, 24, 9, 1, 4, 'voth', 'scrap-voth', ['market'], 'middle', 'trading', ['market traders', 'shopkeepers and assistants']),
    def('voth-scrap', 'voth_scrap_arena', 'XL', 22, 22, 10, 1, 2, 'voth', 'scrap-voth', ['civic'], 'middle', null, ['town guard'])
  ];

  // 3. Regular Post-Apoc Kit (outer farm-labour ring T6, river grain wharf & chinampa sheds)
  var POST_APOC = [
    def('post-apoc', 'dw-box', 'S', 14, 8, 6, 1, 7, 'post-apoc', 'post-apoc', ['dwelling-single'], 'poor', null, []),
    def('post-apoc', 'dw-silo', 'S', 11, 10, 8, 2, 8, 'post-apoc', 'post-apoc', ['dwelling-single'], 'poor', null, []),
    def('post-apoc', 'dw-tire', 'S', 11, 10, 6, 1, 6, 'post-apoc', 'post-apoc', ['dwelling-single'], 'poor', null, []),
    def('post-apoc', 'dw-bus', 'S', 14, 9, 6, 1, 8, 'post-apoc', 'post-apoc', ['dwelling-single'], 'poor', null, []),
    def('post-apoc', 'dw-tank', 'S', 11, 9, 7, 1, 7, 'post-apoc', 'post-apoc', ['dwelling-single'], 'poor', null, []),
    def('post-apoc', 'dw-bottle', 'S', 12, 10, 6, 1, 6, 'post-apoc', 'post-apoc', ['dwelling-single'], 'poor', null, []),
    def('post-apoc', 'dw-stilt', 'S', 9, 10, 8, 2, 7, 'post-apoc', 'post-apoc', ['dwelling-single'], 'poor', null, []),
    def('post-apoc', 'shop-parts', 'S', 14, 9, 6, 1, 3, 'post-apoc', 'post-apoc', ['shop'], 'poor', 'trading', ['shopkeepers and assistants', 'market traders']),
    def('post-apoc', 'shop-food', 'S', 14, 9, 6, 1, 3, 'post-apoc', 'post-apoc', ['shop'], 'poor', 'baking', ['bakers', 'butchers', 'fishers']),

    def('post-apoc', 'smithy', 'M', 14, 12, 8, 1, 4, 'post-apoc', 'post-apoc', ['industry'], 'poor', 'smithing', ['smiths and craftsmen']),
    def('post-apoc', 'gen-fuel', 'M', 14, 12, 9, 1, 3, 'post-apoc', 'post-apoc', ['infrastructure', 'industry'], 'poor', null, ['power-house stokers and engineers']),
    def('post-apoc', 'gen-wind', 'M', 12, 12, 14, 2, 2, 'post-apoc', 'post-apoc', ['infrastructure'], 'poor', 'milling', ['granary keepers and millers']),
    def('post-apoc', 'shaman', 'M', 12, 12, 8, 1, 3, 'post-apoc', 'post-apoc', ['religious'], 'poor', 'healing', ['healers and nurses', 'shrine keepers']),
    def('post-apoc', 'farmhouse', 'M', 18, 12, 8, 2, 12, 'post-apoc', 'post-apoc', ['farm', 'dwelling-single'], 'poor', 'farming', ['farmhands and ploughmen', 'swineherds and duck keepers', 'orchardmen', 'chinampa growers']),
    def('post-apoc', 'mess', 'M', 20, 12, 8, 1, 10, 'post-apoc', 'post-apoc', ['tavern'], 'poor', 'baking', ['innkeepers and servers']),

    def('post-apoc', 'lg-stack', 'L', 22, 18, 13, 3, 28, 'post-apoc', 'post-apoc', ['dwelling-multi'], 'poor', null, []),
    def('post-apoc', 'lg-twinsilo', 'L', 26, 18, 14, 3, 30, 'post-apoc', 'post-apoc', ['dwelling-multi'], 'middle', null, []),
    def('post-apoc', 'warehouse', 'L', 24, 18, 10, 2, 4, 'post-apoc', 'post-apoc', ['industry'], 'poor', 'warehousing', ['porters and warehousemen', 'river bargemen and quay hands', 'ferrymen', 'shipwrights and boatbuilders', 'coast guard', 'dockers and stevedores']),
    def('post-apoc', 'granary', 'L', 24, 18, 12, 2, 4, 'post-apoc', 'post-apoc', ['industry'], 'poor', 'milling', ['granary keepers and millers']),
    def('post-apoc', 'cages', 'L', 24, 18, 9, 1, 6, 'post-apoc', 'post-apoc', ['farm'], 'poor', 'herding', ['beetle herders', 'swineherds and duck keepers', 'dairymen'])
  ];

  // 4. Eight Surviving Bespoke Micro-Climate Ag-Domes tended by the Tenders across Terraces T1-T3:
  //    aligned directly with the master botanical surveys (biomes/BOTANY-FOOD-CROPS.md & biomes/BOTANY-MEDICINAL-REAGENT-FUEL.md).
  var TENDER_DOMES = [
    {
      id: 'dome_earth_med_1',
      code: 'earthlike_med_febrifuge',
      category: 'earthlike_medicine',
      name: 'Earthlike Pharmacopoeia Dome I (Febrifuges, Analgesics & Stillness Reagents)',
      terrace: 'T1',
      r: 336,
      deg: 142.5,
      cropIds: ['herbs', 'tobacco', 'sky-poppy', 'snow-lotus', 'fumewort', 'bell-pod', 'peyote'],
      cultivars: ['cinchona bark (quinine)', 'Oidong sky-poppy (stillness reagent & blue dye)', 'Oidong bell-pod willow (sleeping draught)', 'snow-lotus (heart & breath physic)', 'siphon-pit fumewort (altitude headache)', 'peyote buttons', 'cured tobacco'],
      use: 'small-batch febrifuges, surgical analgesics & stillness reagents (watched by Ordinators for Oidong monk remedies)',
      ordinatorsWatch: 'standard_tribute'
    },
    {
      id: 'dome_earth_med_2',
      code: 'earthlike_med_tonics',
      category: 'earthlike_medicine',
      name: 'Earthlike Pharmacopoeia Dome II (Tonics, Cardiacs & Antiseptics)',
      terrace: 'T1',
      r: 336,
      deg: 172.5,
      cropIds: ['goldroot', 'rimdew', 'valley-ginseng', 'monks-sage', 'camphor', 'beard-lichen', 'circlelichen', 'sphagnum', 'bench-garlic'],
      cultivars: ['7-year Oidong valley-ginseng', 'camphor laurel crystals', 'polar goldroot (Rhodiola)', 'monk\'s sage (silver wormwood)', 'rimdew cough-syrup sundew', 'circle-lichen antiseptic wash', 'bog-moss sphagnum wound-pads', 'braided bench-garlic'],
      use: 'complete apothecary chest from polar goldroot & 7-year valley-ginseng to rimdew sundew & antiseptic lichens',
      ordinatorsWatch: 'standard_tribute'
    },
    {
      id: 'dome_ancient_medical',
      code: 'unique_ancient_cultivar',
      category: 'unique_ancient_medical',
      name: 'Sanctuary Dome III (Amber-Sap, Ranj & Rainbow-Fan — Unique Ancient Medical Crop)',
      terrace: 'T1',
      r: 336,
      deg: 232.5,
      cropIds: ['amber-sap'],
      cultivars: ['Amber-Sap (unique pre-Cataclysm mycorrhizal Mother Tree; grows nowhere else on Krator)', 'Throne Ranj mycorrhizal wound-resin symbiote', 'Korona Rainbow-Fan pleated reagent rosettes (crimson, teal & gold)'],
      use: 'unique Ancient medical crop growing nowhere else (cellular vitality & trauma recovery; understorey Ranj & Korona Rainbow-Fan reagents; audited gram-for-gram)',
      ordinatorsWatch: 'strict_surveillance'
    },
    {
      id: 'dome_mist_tea',
      code: 'cloud_mist_tea',
      category: 'tea',
      name: 'Cloud-Mist Tea & Giant Lotus Conservatory',
      terrace: 'T2',
      r: 414,
      deg: 142.5,
      cropIds: ['tea', 'ivanchai', 'rainbow-bracket', 'lotus-root'],
      cultivars: ['Xanadu & Oidong mist tea (Camellia sinensis)', 'fermented fireweed (ivanchai)', 'rainbow-bracket long-life shelf-fungi tea', 'Oidong giant lotus root & dried seeds'],
      use: 'artificial cloud-fog tea & lotus benches otherwise locked to Xanadu, Oidong & the Outer Wall',
      ordinatorsWatch: 'standard_tribute'
    },
    {
      id: 'dome_equatorial_cacao',
      code: 'equatorial_cacao',
      category: 'cacao',
      name: 'Equatorial Cacao, Kava & Vanilla Shade-Dome',
      terrace: 'T2',
      r: 414,
      deg: 202.5,
      cropIds: ['cacao', 'coffee', 'kava', 'sugar-cane', 'plantain'],
      cultivars: ['Xanadu trunk-pod cacao', 'Ring-Isles shade coffee & kava root', 'pressed sugar-cane', 'violet plantain shade canopy'],
      use: 'warm hypertropic cacao, coffee & kava tribute prized by Voth\'s court',
      ordinatorsWatch: 'standard_tribute'
    },
    {
      id: 'dome_highland_spice',
      code: 'highland_volcanic_spice',
      category: 'highland_spice',
      name: 'Highland & Volcanic Spice Dome',
      terrace: 'T2',
      r: 414,
      deg: 292.5,
      cropIds: ['saffron', 'clove', 'juniper', 'umbel-seed', 'ember-plum', 'annatto'],
      cultivars: ['Xanadu vale saffron', 'Ring-Isles clove', 'badlands juniper & umbel-seed', 'necanyons antiscorbutic ember-plum', 'sunseed annatto'],
      use: 'high-altitude & volcanic aromatics and antiscorbutic fruit grown in heated mineral beds',
      ordinatorsWatch: 'standard_tribute'
    },
    {
      id: 'dome_dryland_orchard',
      code: 'dryland_oil_nut',
      category: 'out_of_zone_useful',
      name: 'Out-of-Zone Xanadu & Rift Dryland Oil-Orchard Dome',
      terrace: 'T3',
      r: 414 + 78,
      deg: 172.5,
      cropIds: ['whorl-olive', 'pistachio', 'almond', 'apricot', 'citron', 'pomegranate', 'pitaya'],
      cultivars: ['Xanadu whorl-olive (pressed oil & fever-leaf tea)', 'pistachio & sweet almond', 'vale apricot', 'nwbay limestone citron', 'rift crest pomegranate', 'pitaya & tuna'],
      use: 'dehumidified summer-dry conservatory for whorl-olive lamp/anointing oil, nuts & scurvy-preventing citrus',
      ordinatorsWatch: 'standard_tribute'
    },
    {
      id: 'dome_fibre_latex',
      code: 'fibre_dye_latex',
      category: 'out_of_zone_useful',
      name: 'Out-of-Zone Fibre, Dye & Umbrella-Gum Dome',
      terrace: 'T3',
      r: 492,
      deg: 262.5,
      cropIds: ['cotton', 'indigo', 'cave-madder', 'woad', 'annatto', 'umbrella-gum'],
      cultivars: ['long-staple sunboll cotton', 'hyperjungle indigo', 'cave-madder crimson root', 'valley woad', 'sunseed annatto', 'abyssal umbrella-gum binder & gasket latex'],
      use: 'surgical gauze cotton, prestige indigo/madder/woad dyes & waterproof valve-gasket gum',
      ordinatorsWatch: 'standard_tribute'
    }
  ];

  // 5. Quarantined Feral Ag-Domes across Terraces T1-T3 (pre-Cataclysm Throne/Korona/Clivobredos hazard flora from BOTANY-MEDICINAL-REAGENT-FUEL.md, welded shut behind KHAZ zones)
  var FERAL_DOMES = [
    { id: 'feral_dome_alpha', name: 'Quarantined Feral Dome Alpha (Throne Slime-Mat & Spore-Rot)', specimen: 'throne:the-mat', terrace: 'T1', r: 336, deg: 62, hazardKind: 'poison', danger: 0.75 },
    { id: 'feral_dome_beta', name: 'Quarantined Feral Dome Beta (Korona Lace-Fan & Numb-Thorn)', specimen: 'korona:lacefan', terrace: 'T1', r: 336, deg: 108, hazardKind: 'thorn', danger: 0.65 },
    { id: 'feral_dome_gamma', name: 'Quarantined Feral Dome Gamma (Clivobredos Throat-Comb Spore-Poison)', specimen: 'clivobredos:comb', terrace: 'T2', r: 414, deg: 42, hazardKind: 'poison', danger: 0.80 },
    { id: 'feral_dome_delta', name: 'Quarantined Feral Dome Delta (Throne Snare-Plants & Sulphur-Rosette Arrow-Poison)', specimen: 'throne:snareplant', terrace: 'T3', r: 492, deg: 72, hazardKind: 'acid', danger: 0.70 }
  ];

  // 6. Ancient Soleri Farm Hinterland Families (exact dimensions & ruin cuts from kits/metropolis/src/46f-mp-farm.js & 41d-av-farm.js)
  var SOLERI_STATES = ['intact', 'gutted', 'crown', 'broken', 'stump', 'skeleton', 'fallen'];
  var SOLERI_FARM_CUTS = [0.04, 0.34, 0.52, 0.70, 0.82, 0.88, 1.01];
  var SOLERI_AQ_CUTS = [0.08, 0.56, 0.78, 0.92, 0.97, 0.98, 1.01];
  var SOLERI_FARMS = [
    { key: 'pod', name: 'Soleri Growing Pod', w: 52, d: 46, h: 27.0, hex: 26, latticeStep: 53.0, types: ['farm'] },
    { key: 'vault', name: 'Soleri Vault House', w: 100, d: 40, h: 21.6, types: ['farm'] },
    { key: 'stack', name: 'Soleri Growing Stack', w: 64, d: 72, h: 37.5, types: ['farm', 'industry'] },
    { key: 'hall', name: 'Soleri Hub Hall', w: 64, d: 64, h: 27.0, types: ['civic'] },
    { key: 'market', name: 'Soleri Farm Market', w: 76, d: 76, h: 18.0, types: ['market'] },
    { key: 'watertower', name: 'Soleri Water Tower', w: 36, d: 36, h: 54.0, types: ['infrastructure'] },
    { key: 'aqueduct', name: 'Soleri Aqueduct Module', w: 66, d: 5.6, h: 26.2, span: 22, pier: 4.4, clear: 17.6, channelY: 24.4, types: ['infrastructure'] },
    { key: 'pumphouse', name: 'Soleri Intake Pump House', w: 62, d: 32, h: 24.0, types: ['infrastructure', 'industry'] }
  ];
  var SOLERI_BY_KEY = {};
  for (var si = 0; si < SOLERI_FARMS.length; si++) SOLERI_BY_KEY[SOLERI_FARMS[si].key] = SOLERI_FARMS[si];

  // All 44 Voth census trade names (matched 1:1 against tools/trades_census.json)
  var VOTH_CENSUS_TRADES = [
    'bakers', 'butchers', 'weavers and dyers', 'brewers', 'tanners',
    'shipwrights and boatbuilders', 'innkeepers and grooms', 'town guard', 'coast guard',
    'temple priests and servants', 'shrine keepers', 'shopkeepers and assistants',
    'smiths and craftsmen', 'innkeepers and servers', 'porters and warehousemen',
    'industrial workers', 'power-house stokers and engineers', 'household service',
    'soldiers', 'teachers and scholars', 'guild officers and clerks',
    'customs officers and clerks', 'healers and nurses', 'priests and undertakers',
    'lighthouse keepers', 'dockers and stevedores', 'river bargemen and quay hands',
    'fishers', 'market traders', 'farmhands and ploughmen', 'chinampa growers',
    'orchardmen', 'miners', 'quarrymen and masons', 'granary keepers and millers',
    'beetle herders', 'dairymen', 'swineherds and duck keepers', 'mushroom growers',
    'envoys and embassy staff', 'ferrymen', 'elephant bug handlers and station hands',
    'monks and lay brothers', 'palace and canton staffs'
  ];

  var BY_KEY = {};
  var ALL = SWA.concat(VOTH_SCRAP, POST_APOC);
  for (var i = 0; i < ALL.length; i++) BY_KEY[ALL[i].key] = ALL[i];

  TORUS.KITS = {
    swa: SWA,
    vothScrap: VOTH_SCRAP,
    postApoc: POST_APOC,
    all: ALL,
    byKey: BY_KEY,
    tenderDomes: TENDER_DOMES,
    medicalSpecimens: TENDER_DOMES,
    feralDomes: FERAL_DOMES,
    soleriStates: SOLERI_STATES,
    soleriFarmCuts: SOLERI_FARM_CUTS,
    soleriAqCuts: SOLERI_AQ_CUTS,
    soleriFarms: SOLERI_FARMS,
    soleriByKey: SOLERI_BY_KEY,
    vothCensusTrades: VOTH_CENSUS_TRADES
  };
})(typeof window !== 'undefined' ? window : globalThis);
