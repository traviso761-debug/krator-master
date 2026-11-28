// ================================================================= SHROUDHILLS — 23 canonical botanical species & HV harvest records [G data]
// Scanned by tools/check_botany.py (exposes SHROUDHILLS.SPECIES = [...] and SHROUDHILLS.HARVEST = {...}).
// Engine-neutral [G data]: zero THREE, zero DOM, zero canvas; runs in Node (tests/test-shroudhills.js) and Godot.
(function(){
 'use strict';
 var S = SHROUDHILLS;

 S.PAL = {
  mahoganyBark: [0x583c2c, 0x664634, 0x4c3426, 0x6e4e3a],
  kauriBark: [0x827466, 0x928272, 0x746658, 0x9c8c7a],
  rataBark: [0x684838, 0x5c3e30, 0x765240],
  fernBark: [0x3c2e24, 0x48382c, 0x32261e],
  koheLeaf: [0x3c6e34, 0x487c3c, 0x32602c, 0x548842],
  kauriLeaf: [0x385e38, 0x466c40, 0x2e5030, 0x567844],
  rimuLeaf: [0x587236, 0x66803e, 0x4c642e, 0x748842],
  fernLeaf: [0x467e36, 0x548e40, 0x3a6e2e, 0x689444],
  blechnumFlush: [0x7c5c34, 0x8c683c, 0x527a36, 0x68843c],
  giantLeaf: [0x386e32, 0x447c3c, 0x2e602a],
  amber: [0xe69c24, 0xf2b032, 0xd48418, 0xffc448],
  sisterTank: [0x6e7c36, 0x846432, 0x5c7230, 0x964834],
  sisterBract: [0xc8382c, 0xd84c32, 0xb42e26, 0xe26838],
  turfMoss: [0x4c7832, 0x5a883a, 0x3e682a, 0x689242],
  skyOrchid: [0xd62848, 0xe83858, 0xc4203c, 0xf06078],
  torCloakScarlet: [0xd83228, 0xe6482c, 0xc42622],
  torCloakSaffron: [0xe89c24, 0xf2b42e, 0xd4841c],
  torCloakSilver: [0xc8d0cc, 0xd8dedc, 0xb6c0bc],
  torButterwort: [0x82b846, 0x92c652, 0x8c5cc4],
  dewStrand: [0xdce8e6, 0xeef6f4, 0xc8dad8],
  drumGall: [0x74442e, 0x845038, 0x643a28, 0x8c6248],
  saltpeter: [0xebe8df, 0xf4f2ea, 0xdcd8ce],
  antChitin: [0x2a2018, 0x38281c, 0x221a14, 0x463222],
  myrtleLeaf: [0x6c8c6e, 0x7c9c7c, 0x5e7e62],
  mossHang: [0x6a8448, 0x7a9454, 0x5c743e],
  usneaBeard: [0x9eb89c, 0xafc8ac, 0x8ea88c],
  palmBark: [0x8c7c64, 0x7e705a, 0x96866e],
  palmLeaf: [0x4c7832, 0x58863a, 0x426c2c, 0x649042],
  palmOld: [0x7e7838, 0x8c8240],
  coconutNut: [0x6c7a36, 0x867238, 0x5e6e30],
  nikauBark: [0x5e7c58, 0x526e4c, 0x6c8864],
  nikauShaft: [0x72985e, 0x80a66a, 0x648a52],
  pandanLeaf: [0x4a7a34, 0x56883e, 0x3f6c2e, 0x629046],
  pandanFruit: [0xd86e24, 0xe4802c, 0xc85e1e],
  hibiscusLeaf: [0x488438, 0x549242, 0x3e7830],
  hibiscusBloom: [0xecc82c, 0xf4d43a, 0xdcb424],
  kiekieLeaf: [0x447634, 0x50843e, 0x3a682c],
  berryHeath: [0x486e3c, 0x567c46, 0xf0e4e8]
 };

 var HV = function(wood, edible, medicinal, notes, fruit, gather, extra){
  return Object.assign({
   wood: wood || 'none',
   edible: edible || [],
   medicinal: !!medicinal,
   notes: notes || '',
   fruit: fruit || null,
   gather: gather || null
  }, extra || {});
 };

 var TG = function(climate, zone, riparian, o){
  return Object.assign({
   climate: climate,
   aridity: 'humid',
   abyssal: false,
   riparian: riparian || 'no',
   zone: zone
  }, o || {});
 };

 S.HARVEST = {
  shroud_kohekohe: HV('hardwood', [], false, 'dense water-resistant cabinet and spear-shaft hardwood timber', null, null),
  shroud_amber_kauri: HV('timber', [], false, 'spar timber and golden weeping amber resin stalactites for caulking and varnish', 'reagent', 'amber'),
  amberpodocarp: HV('timber, resin', ['rimu-berry'], true, 'pendulous bronze-green rimu cloud podocarp trailing weeping foliage curtains and antiseptic resin', 'reagent', 'rimu-gum'),
  shroud_rata_bridge: HV('none', [], false, 'springy peat-fibre cordage, quilt stuffing and aerial turf insulation', null, 'peat-fibre'),
  shroud_sister_cups: HV('none', [], false, 'sacred twin rainwater cistern reservoir and waterproof leaf reed-wax', null, 'reed-wax'),
  shroud_drum_gall: HV('none', [], false, 'alchemical saltpeter reagent crust precipitated below ant-colony refuse vaults and tannin gall rind', 'reagent', 'saltpeter'),
  shroud_myrtle_smudge: HV('none', [], true, 'medicinal balm and aromatic insect-calming smudge-resin burned in Yonni trail braziers', 'reagent', 'smudge-resin'),
  shroud_cloak_bromeliad: HV('none', [], false, 'fast crimson-dye pigment lake boiled from scarlet rock-rosette bracts', null, 'crimson-dye'),
  saffroncloak: HV('none', [], false, 'spiny golden-saffron lithophyte rosettes on sun-struck granite Cloak-Tor ribs yielding warm yellow dye lake', 'reagent', 'saffron-lake'),
  torcushion: HV('fuel', [], false, 'dense silver-velvet alpine daisy cushions hugging storm-scoured Cloak-Tor domes; dry leaf-tomentum prized as spark-tinder', null, 'silver-felt'),
  torbutterwort: HV('none', [], true, 'glistening chartreuse-and-violet mucilage rosettes on wet Cloak-Tor seepage cracks that soothe burns', 'reagent', 'curd-rennet'),
  shroud_dew_strand: HV('none', [], true, 'wound-sealing mucilage sizing and surgical glue', 'reagent', 'mucilage'),
  shroud_tree_fern: HV('none', ['fiddlehead', 'pith'], false, 'edible steamed fiddlehead crosiers and baked starchy trunk pith', null, 'fiddlehead'),
  ravineblechnum: HV('thatch', ['roasted rhizome'], false, 'shuttlecock rosettes of bronze-flushed fronds carpeting damp ironstone and coal ravine banks', null, 'fern-rhizome'),
  giantleaf: HV('none', ['peeled acid-stalk'], false, 'umbrella-wide pleated rain-catching leaves along cobble torrents; rootstocks yield black-brown net tannin', 'reagent', 'stalk-dye'),
  coconut: HV('timber, thatch, cordage', ['coconuts'], false, 'drift-sown along sheltered Spear-Queen raid-coves; ringed posts, plaited frond thatch, and twisted coir mooring cordage', null, 'coir', { crop: 'coconut' }),
  covepandan: HV('thatch, weaving', ['cooked pandan keys'], false, 'prop-rooted cove screw-palm plaited by Yonni crews into salt-proof sails, boat-mats and fenders', null, 'pandan-plaits', { crop: 'pandan' }),
  covehibiscus: HV('bast, knees, fuel', [], false, 'multi-stemmed coastal hibiscus stripped and retted by Spear-Queen riggers into rot-proof mooring cordage and outrigger knees', null, 'bast-cordage'),
  shroudnikau: HV('thatch', ['palm-heart'], false, 'bulbous-crownshaft feather palm of frost-free coastal gullies and misty lower ravines; waterproof crownshaft water-buckets', null, 'palm-sheath'),
  crimsonorchid: HV('weaving', [], true, 'arching epiphytic crimson-and-gold orchid sprays on Root-Hammock turf and mossy bough forks; golden cane fiber woven into Spear-Queen armbands', null, 'orchid-cane'),
  shroudlichen: HV('none', [], true, 'silver-celadon antibiotic beard-lichen and cloud-moss skeins combing fog from Root-Hammock cables and emergent boughs', 'reagent', 'usnea-moss'),
  kiekievine: HV('weaving, cordage', ['sweet floral-bracts'], false, 'woody trunk-clasping pandan liana spiraling up Shroud-Mahogany boles with tufted strap rosettes and sweet ivory bracts', null, 'kiekie-fibre'),
  canopyberry: HV('fuel', ['snow-berries'], false, 'leathery berry-heath shrubs rooted in suspended 50 cm Root-Hammock peat decks', null, 'wax-berry')
 };

 S.SPECIES = [
  // A. Canopy & Emergent Cloud-Rainforest Trees (4)
  {
   key: 'shroud_kohekohe', name: 'Buttressed Shroud-Mahogany',
   model: 'Dysoxylum spectabile (kohekohe) and Entandrophragma buttressed cloud-mahogany',
   habit: 'tree', H: [24, 36], gather: null,
   what: 'Fluted plank-buttress canopy hardwood with wide horizontal flare-joined bough-forks carrying Sister-Cups and Drum-Galls',
   tags: TG('subtropic..temperate', 'canopy_sea', 'both', { harvest: S.HARVEST.shroud_kohekohe })
  },
  {
   key: 'shroud_amber_kauri', name: 'Weeping Amber-Kauri',
   model: 'Agathis australis (kauri) resin-weeping emergent conifer',
   habit: 'emergent', H: [30, 44], gather: 'amber',
   what: 'Columnar silver-bronze emergent conifer weeping golden resin stalactites from upper bough-crotches (amber = 120)',
   tags: TG('subtropic..temperate', 'shroud_cove', 'no', { harvest: S.HARVEST.shroud_amber_kauri })
  },
  {
   key: 'amberpodocarp', name: 'Weeping Rimu-Podocarp',
   model: 'Dacrydium cupressinum (rimu) weeping cloud-podocarp',
   habit: 'emergent', H: [22, 36], gather: 'rimu-gum',
   what: 'Graceful cloud-forest podocarp trailing long pendulous bronze-olive foliage curtains and red-gold resin tears',
   tags: TG('subtropic..temperate', 'canopy_sea', 'both', { harvest: S.HARVEST.amberpodocarp })
  },
  {
   key: 'shroudnikau', name: 'Shroud Nikau Feather-Palm',
   model: 'Rhopalostylis sapida bulbous-crownshaft cloud-gully palm',
   habit: 'palm', H: [5.5, 11.5], gather: 'palm-sheath',
   what: 'Green-ringed feather palm with a smooth lime-green bulbous crownshaft and stiff ascending V-fronds in frost-free coastal gullies',
   tags: TG('subtropic..temperate', 'shroud_cove', 'yes', { harvest: S.HARVEST.shroudnikau })
  },

  // B. Yonni Spear-Queen Raid-Cove / Matron's Coast Littoral Guild (3)
  {
   key: 'coconut', name: 'Drift-Sown Cove Coconut Palm',
   model: 'Cocos nucifera drift-sown along the sheltered Yonni Spear-Queen Matron\'s Coast littoral',
   habit: 'palm', H: [8.0, 15.5], gather: 'coir',
   what: 'Salt-hardy ringed palms leaning over sheltered Spear-Queen raid-cove strands and low coastal bluffs above high water',
   tags: TG('tropical..subtropic', 'shroud_cove', 'both', { strand: true, harvest: S.HARVEST.coconut })
  },
  {
   key: 'covepandan', name: 'Raid-Cove Screwpine',
   model: 'Pandanus tectorius prop-rooted littoral screw-palm',
   habit: 'palm', H: [3.5, 7.5], gather: 'pandan-plaits',
   what: 'Stilt-rooted ringed screw-palm on cobble-and-sand raid-cove heads, crowned with spiral keeled strap rosettes and orange fruit keys',
   tags: TG('tropical..subtropic', 'shroud_cove', 'both', { strand: true, harvest: S.HARVEST.covepandan })
  },
  {
   key: 'covehibiscus', name: 'Matron\'s Bast-Hibiscus',
   model: 'Hibiscus tiliaceus (hau / purau) coastal cordage tree',
   habit: 'shrub', H: [3.0, 6.8], gather: 'bast-cordage',
   what: 'Scrambling multi-stemmed coastal thicket tree with curved ship-knee stems, heart leaves, and sulfur-gold cup blossoms',
   tags: TG('tropical..subtropic', 'shroud_cove', 'both', { strand: true, harvest: S.HARVEST.covehibiscus })
  },

  // C. Super-Epiphyte Second-Floor Canopy & Khroma-Mira Guild (7)
  {
   key: 'shroud_rata_bridge', name: 'Bridge-Rata and Sky-Turf Span',
   model: 'Metrosideros robusta hemi-epiphytic rata and suspended Astelia peat mat',
   habit: 'bridge', H: [6, 15], gather: 'peat-fibre',
   what: 'Self-grafting horizontal aerial roots spanning 6-15 m neighbor crown gaps, topped by 50 cm suspended peat turf',
   tags: TG('subtropic..temperate', 'canopy_sea', 'no', { harvest: S.HARVEST.shroud_rata_bridge })
  },
  {
   key: 'shroud_sister_cups', name: 'Paired Sister-Cup Cistern',
   model: 'Glomeropitcairnia and Vriesea imperialis giant tank-bromeliads',
   habit: 'cistern', H: [1.8, 3.2], gather: 'reed-wax',
   what: 'Mirror-paired spiral rosette tank-epiphytes sharing an overflow weir and holding 90-320 L of specular amber rainwater in canopy forks',
   tags: TG('subtropic..temperate', 'shroud_cove', 'no', { harvest: S.HARVEST.shroud_sister_cups })
  },
  {
   key: 'shroud_drum_gall', name: 'Myrmecophyte Drum-Gall',
   model: 'Myrmecodia tuberosa ant-plant amplified at 0.75 g with cat-sized Formica shrouda (Khroma-Mira)',
   habit: 'gall', H: [1.3, 2.6], gather: 'saltpeter', hazardKey: 'shroud-ants',
   what: 'Ribbed chambered trunk tuber with 6 Hz slit-drum ostioles, basal white saltpeter nitrate crusts, and cat-sized bronze-black Shroud-Ant sentries',
   tags: TG('subtropic..temperate', 'canopy_sea', 'no', {
    harvest: S.HARVEST.shroud_drum_gall,
    hazard: { kind: 'hunter', role: 'shroud-ants', danger: 0.78, effect: 'corrode', dose: 0.85, falloff: 'smooth', tell: { colour: '#a86420', fx: 'swarm', sound: 'drum-rattle' } }
   })
  },
  {
   key: 'crimsonorchid', name: 'Crimson Cloud-Orchid Spray',
   model: 'Dendrobium and Earina epiphytic cloud-orchids',
   habit: 'epiphyte', H: [0.45, 1.15], gather: 'orchid-cane',
   what: 'Arching sprays of crimson-and-rose sky-orchids rooted on sunlit Root-Hammock peat decks and mossy bough forks',
   tags: TG('subtropic..temperate', 'canopy_sea', 'no', { harvest: S.HARVEST.crimsonorchid })
  },
  {
   key: 'canopyberry', name: 'Epiphytic Sky-Berry Heath',
   model: 'Gaultheria and Astelia aerial peat-turf shrublet',
   habit: 'epiphyte', H: [0.5, 1.1], gather: 'wax-berry',
   what: 'Glossy evergreen berry-heath cushions rooted in suspended 50 cm Root-Hammock sky-turf spans',
   tags: TG('subtropic..temperate', 'canopy_sea', 'no', { harvest: S.HARVEST.canopyberry })
  },
  {
   key: 'shroudlichen', name: 'Bearded Mist-Usnea',
   model: 'Usnea and Weymouthia pendulous fog-combing beard-lichens',
   habit: 'epiphyte', H: [1.2, 4.2], gather: 'usnea-moss',
   what: 'Dripping celadon-silver beard-lichen curtains hanging beneath Root-Hammock cables and emergent podocarp limbs',
   tags: TG('subtropic..temperate', 'canopy_sea', 'no', { harvest: S.HARVEST.shroudlichen })
  },
  {
   key: 'kiekievine', name: 'Climbing Kiekie Pandan-Vine',
   model: 'Freycinetia banksii trunk-clasping pandan liana',
   habit: 'liana', H: [1.2, 3.2], gather: 'kiekie-fibre',
   what: 'Woody climbing pandan vine spiraling up damp Shroud-Mahogany boles with sword-leaf rosettes and sweet fleshy bracts',
   tags: TG('subtropic..temperate', 'canopy_sea', 'yes', { harvest: S.HARVEST.kiekievine })
  },

  // D. Ironstone & Coal-Seam Ravine Understorey & Trail Flora (4)
  {
   key: 'shroud_myrtle_smudge', name: 'Calming Smudge-Myrtle',
   model: 'Lophomyrtus and Leptospermum aromatic cloud-myrtle',
   habit: 'shrub', H: [1.5, 3.0], gather: 'smudge-resin',
   what: 'Aromatic silver-green trail shrub planted by Yonni Spear-Queens along granite footpaths; its resin pacifies nearby Shroud-Ant colonies',
   tags: TG('subtropic..temperate', 'canopy_sea', 'both', { harvest: S.HARVEST.shroud_myrtle_smudge })
  },
  {
   key: 'shroud_tree_fern', name: 'Ironstone Ravine Tree-Fern',
   model: 'Cyathea medullaris (mamaku) black tree-fern',
   habit: 'treefern', H: [3.5, 7.5], gather: 'fiddlehead',
   what: 'Dark scaly-boled shade tree-fern spreading wide emerald-bronze fronds across 8%-light ironstone and coal ravine bottoms',
   tags: TG('subtropic..temperate', 'canopy_sea', 'yes', { harvest: S.HARVEST.shroud_tree_fern })
  },
  {
   key: 'ravineblechnum', name: 'Bronze Crown-Fern',
   model: 'Blechnum discolor and Asplenium bulbiferum ravine ferns',
   habit: 'fern', H: [0.55, 1.45], gather: 'fern-rhizome',
   what: 'Shuttlecock rosettes of copper-bronze and deep emerald fronds carpeting wet ironstone and coal-seam ravine banks',
   tags: TG('subtropic..temperate', 'canopy_sea', 'yes', { harvest: S.HARVEST.ravineblechnum })
  },
  {
   key: 'giantleaf', name: 'Ravine Giant Rain-Rhubarb',
   model: 'Gunnera tinctoria giant stream-margin peltate herb',
   habit: 'herb', H: [1.1, 2.4], gather: 'stalk-dye',
   what: 'Umbrella-wide pleated rain-catching leaves overhanging cobble torrents and ravine splash-zones',
   tags: TG('subtropic..temperate', 'canopy_sea', 'yes', { harvest: S.HARVEST.giantleaf })
  },

  // E. Storm-Washed Granite Cloak-Tor Lithophytes & Carnivores (5)
  {
   key: 'shroud_cloak_bromeliad', name: 'Scarlet Tor-Cloak Bromeliad',
   model: 'Pitcairnia and saxicolous Vriesea scarlet lithophyte mats',
   habit: 'lithophyte', H: [0.8, 2.4], gather: 'crimson-dye',
   what: 'Tight jewel-toned scarlet rosette tapestries clothing treeless storm-washed granite Cloak-Tors',
   tags: TG('temperate..montane', 'cloak_tor', 'no', { harvest: S.HARVEST.shroud_cloak_bromeliad })
  },
  {
   key: 'saffroncloak', name: 'Saffron Spine-Puya',
   model: 'Puya and Dyckia golden-bracted granite lithophyte',
   habit: 'lithophyte', H: [0.75, 1.95], gather: 'saffron-lake',
   what: 'Spiny saffron-gold rock-rosettes banding sun-warmed granite Cloak-Tor ribs and watch-plinth aprons',
   tags: TG('temperate..montane', 'cloak_tor', 'no', { harvest: S.HARVEST.saffroncloak })
  },
  {
   key: 'torcushion', name: 'Silver Cushion-Celmisia',
   model: 'Celmisia and Raoulia silver-tomentose alpine cushion',
   habit: 'cushion', H: [0.25, 0.75], gather: 'silver-felt',
   what: 'Hemispherical silver-velvet cushion domes streamlined against ridge gales on upper granite Cloak-Tors',
   tags: TG('temperate..montane', 'cloak_tor', 'no', { harvest: S.HARVEST.torcushion })
  },
  {
   key: 'torbutterwort', name: 'Tor Midge-Butterwort',
   model: 'Pinguicula and rosette Drosera seepage carnivore',
   habit: 'carnivore', H: [0.15, 0.45], gather: 'curd-rennet',
   what: 'Glistening lime-chartreuse mucilage rosettes with violet flower scapes along wet granite gnamma seepage rims',
   tags: TG('temperate..montane', 'cloak_tor', 'yes', { harvest: S.HARVEST.torbutterwort })
  },
  {
   key: 'shroud_dew_strand', name: 'Silver Mist-Sundew Curtain',
   model: 'Drosera binata and Drosophyllum ridge-squall mucilage strands',
   habit: 'carnivore', H: [0.6, 1.8], gather: 'mucilage',
   what: 'Glistening pearl-tipped carnivorous threads streaming across windward granite Cloak-Tors to snare sea-fog midges',
   tags: TG('temperate..montane', 'cloak_tor', 'no', { harvest: S.HARVEST.shroud_dew_strand })
  }
 ];

 S.byKey = {};
 for (var i = 0; i < S.SPECIES.length; i++) {
  S.byKey[S.SPECIES[i].key] = S.SPECIES[i];
 }
})();
