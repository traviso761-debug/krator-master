/* ==================== the Crops kit: materials (fibre) and utility (dye, reagent, fuel) (plain data, [G data]) ==================== */
/* kits/crops/FIBRE.md and DYES.md. A dye that is not a climate crop (animal, mineral, resin) is homeOnly: it is plausible in its
   home biome, or anywhere a settlement trades for it (CROPS.palette, opts.trade). A mineral dye names the resource node it needs. */

/* ---- spinning: cloth thread */
R('cotton', 'Sunboll cotton', 'spinning', [3, 4], [1, 3], {card: 'card.crop.cotton', home: ['swlowlands', 'nwlowlands', 'swbay'], stores: ['dried']});
R('flax', 'Sea-linen flax', 'spinning', [1, 3], [2, 3], {also: ['oil'], atm: [0, 2], card: 'card.crop.flax', home: ['nhighlands', 'shighlands'], stores: ['dried'], note: 'the Hykkousoi sea-linen'});
R('cairn-nettle', 'Cairn nettle', 'spinning', [0, 2], [2, 3], {atm: [0, 1], reach: 0, card: 'card.crop.nettle', home: ['ehighlands']});
R('ramie', 'Silk-nettle ramie', 'spinning', [4, 4], [3, 4], {card: 'card.crop.nettle', home: ['eastabyss', 'nwbay']});
R('mulberry', 'Vale mulberry', 'spinning', [1, 3], [2, 3], {form: 'tree', card: 'card.orchard.broad', home: ['xanadu'], note: 'silk: the leaf feeds the silkworm'});

/* ---- cordage, weaving, sheet, thatch (the existing wild fibres and the proposals) */
R('rope-banana', 'Rope banana', 'cordage', [4, 4], [3, 4], {card: 'card.paddle', home: ['hyperjungle', 'geyser', 'ringisles']});
R('sisal', 'Socotran sisal', 'cordage', [4, 5], [0, 1], {card: 'card.sword', home: ['sedesert', 'crater-drylands']});
R('baobab-bark', 'Baobab bark', 'cordage', [4, 4], [1, 2], {form: 'tree', card: 'card.baobab', home: ['nwbay', 'rift', 'swbay'], src: 'swbay'});
R('rope-puff', 'Rope-puff fibre', 'cordage', [2, 4], [2, 3], {form: 'tree', home: ['throne'], src: 'throne'});
R('mat-reed', 'Mat reed', 'weaving', [3, 4], [3, 4], {also: ['cordage', 'thatch'], water: 'aquatic', card: 'card.reed', home: ['eastabyss', 'nwbay'], src: 'eastabyss'});
R('willow', 'Willow withies', 'weaving', [1, 3], [2, 4], {form: 'tree', card: 'card.weeper', home: ['swlowlands', 'xanadu', 'nwlowlands'], src: 'swlowlands'});
R('pandan', 'Pandanus', 'thatch', [4, 4], [2, 4], {also: ['weaving'], form: 'tree', card: 'card.screwpine', home: ['geyser', 'ringisles', 'nwbay', 'shighlands'], src: 'geyser'});
R('ichu', 'Ichu', 'thatch', [0, 1], [1, 2], {atm: [0, 1], also: ['cordage'], card: 'card.ichu', home: ['ehighlands'], src: 'ehighlands'});
R('thatch-grass', 'Thatch grass', 'thatch', [4, 4], [1, 2], {also: ['weaving'], card: 'card.grass.dry', src: 'abyssal-savannah', home: ['abyssal-savannah'], note: 'the tall grass of the abyssal savannah, to 3 m in the dense air; cut after the rains, before the burns'});
R('mat', 'The mat', 'sheet', [0, 5], [0, 4], {also: ['weaving'], form: 'fungus', grown: 'underground', water: 'bed', works: 'sealed-beds', hazard: 'digests what sleeps on it', home: ['throne'], src: 'throne', stores: ['pressed'], note: 'a slime mould, dried and pressed to a felt-like sheet'});

/* ---- utility: dye */
R('annatto', 'Sunseed annatto', 'dye', [4, 4], [3, 4], {form: 'shrub', card: 'card.crop.annatto', colour: 'orange', home: ['hyperjungle']});
R('indigo', 'Jungle indigo', 'dye', [4, 4], [2, 4], {form: 'shrub', card: 'card.crop.indigo', colour: 'blue', home: ['hyperjungle']});
R('woad', 'Valley woad', 'dye', [1, 3], [1, 3], {atm: [0, 2], card: 'card.crop.woad', colour: 'blue', home: ['ebadlands', 'nhighlands'], note: 'also Clan woad: the northern clans'});
R('broom', 'Heath broom', 'dye', [0, 2], [1, 3], {atm: [0, 2], form: 'shrub', card: 'card.broom', colour: 'yellow', home: ['nhighlands']});
R('lichen', 'Rosette lichen', 'dye', [0, 3], [1, 3], {atm: [0, 2], colour: 'brown', home: ['shighlands', 'sedesert', 'nwouterwall', 'wouterwall'], src: 'shighlands', note: 'a lichen dye (the colour is not named in the kits)'});
R('rabbitbrush', 'Rabbitbrush flowers', 'dye', [2, 4], [0, 1], {form: 'shrub', colour: 'yellow', home: ['ebadlands'], src: 'ebadlands'});
R('ghost-gum', 'Ghost-gum leaf', 'dye', [2, 4], [0, 2], {form: 'tree', card: 'card.ghostwood', colour: 'gold', home: ['nwlowlands']});
R('alder-bark', 'Grey alder bark', 'dye', [1, 2], [3, 3], {form: 'tree', colour: 'red', also: [], home: ['nhighlands'], src: 'nhighlands', note: 'red and black'});
R('ironbark-tannin', 'Ironbark bark', 'dye', [4, 4], [2, 3], {form: 'tree', colour: 'brown', home: ['nwbay', 'swbay'], src: 'swbay'});
R('purple-fan', 'Purple fan leaves', 'dye', [3, 4], [1, 2], {colour: 'purple', home: ['rift'], src: 'rift'});
R('aril-blue', 'Aril blue', 'dye', [3, 4], [2, 3], {homeOnly: true, colour: 'pale blue', home: ['nwbay'], src: 'nwbay', note: 'the traveller\'s fan arils; the Hykkousoi pale blue, slate with ironbark tannin'});
R('mangrove-red', 'Mangrove bark', 'dye', [4, 4], [3, 4], {form: 'tree', colour: 'red-brown', home: ['swlowlands'], src: 'swlowlands'});
R('flame-streamer', 'Flame-streamer orange', 'dye', [4, 5], [3, 4], {homeOnly: true, water: 'aquatic', colour: 'orange', home: ['geyser'], note: 'the run-off mat pigment'});
R('dragons-blood', 'Dragon\'s blood resin', 'dye', [3, 5], [0, 2], {homeOnly: true, form: 'tree', colour: 'red', home: ['nwbay', 'rift', 'sedesert', 'swbay'], src: 'sedesert'});
R('bay-purple', 'Bay purple', 'dye', [3, 4], [2, 4], {homeOnly: true, colour: 'purple', home: ['swbay'], note: 'a murex-like bay snail: Voth\'s deep purple'});
R('reef-teal', 'Reef teal', 'dye', [4, 4], [3, 4], {homeOnly: true, colour: 'teal', home: ['ringisles'], note: 'a reef sponge or snail'});
R('abyss-lac', 'Abyss lac', 'dye', [4, 4], [3, 4], {homeOnly: true, colour: 'red', home: ['eastabyss'], note: 'scale insects on the jungle trees; red lacquer and carmine'});
R('cochineal', 'Cushion cochineal', 'dye', [0, 1], [1, 2], {atm: [0, 1], homeOnly: true, colour: 'crimson', home: ['ehighlands'], note: 'scale insects on the thorn cushions'});
R('burn-black', 'Burn-black', 'dye', [4, 5], [0, 2], {homeOnly: true, colour: 'black', home: ['crater-drylands'], note: 'lampblack from the last fire, set with frill-tree gall'});
R('fumarole-ochre', 'Fumarole ochre and rust', 'dye', [2, 5], [0, 4], {homeOnly: true, node: 'iron', colour: 'ochre', home: ['throne'], note: 'iron-oxide clays'});
R('hill-terracotta', 'Hill terracotta', 'dye', [2, 4], [1, 3], {homeOnly: true, node: 'iron', colour: 'terracotta', home: ['swlowlands']});
R('falu-red', 'Falu red', 'dye', [0, 3], [1, 3], {atm: [0, 2], homeOnly: true, node: 'iron', colour: 'red', home: ['nhighlands'], note: 'the iron-ochre red of the clans\' mine'});
R('verdigris', 'Verdigris and malachite', 'dye', [0, 5], [0, 4], {homeOnly: true, node: 'copper', colour: 'teal', home: ['eastabyss', 'swlowlands'], note: 'green; azurite blue'});
R('sulfur-yellow', 'Sulfur yellow', 'dye', [0, 5], [0, 4], {homeOnly: true, node: 'sulfur', colour: 'yellow', home: ['geyser', 'ebadlands', 'throne']});
R('tar-black', 'Tar black', 'dye', [0, 5], [0, 4], {homeOnly: true, node: 'oil', colour: 'black', home: ['ringisles']});
R('flametip-tanbark', 'Flametip tanbark', 'dye', [4, 4], [2, 3], {form: 'tree', colour: 'brown', home: ['necanyons'], src: 'necanyons', note: 'the benches\' scrub tree: tans hides, dyes brown'});
R('laterite-ochre', 'Laterite ochre', 'dye', [3, 5], [0, 3], {homeOnly: true, node: 'iron', colour: 'ochre', home: ['abyssal-savannah'], note: 'the red-yellow earth of the abyss rim, washed and burnt to a red; the abyssal people paint with it on umbrella gum'});
R('slickrock-orchil', 'Slickrock orchil', 'dye', [4, 5], [0, 2], {homeOnly: true, colour: 'purple', home: ['necanyons'], note: 'the caps\' orange crust lichens, steeped in stale urine: a red-purple, as orchil is'});

/* ---- utility: reagent and fuel (the Zeijani's dark farms) */
R('umbrella-gum', 'Umbrella gum', 'reagent', [4, 4], [0, 2], {homeOnly: true, form: 'tree', src: 'abyssal-savannah', home: ['abyssal-savannah'], stores: ['dried'], note: 'the gum of the shelf umbrella-tree: a glue and a binder for paint (gum arabic)'});
R('glow-mushroom', 'Glow mushroom', 'reagent', [0, 5], [0, 4], {also: ['fuel'], form: 'fungus', grown: 'underground', water: 'bed', works: 'dark-beds', card: 'card.mushroom.glow', home: ['throne'], src: 'throne', note: 'the alchemist\'s culture and a light and heat source'});
R('lamp-cap', 'Lamp cap', 'fuel', [0, 5], [0, 4], {form: 'fungus', grown: 'underground', water: 'bed', works: 'dark-beds', home: ['throne'], src: 'throne', note: 'carried as a lamp; lasts a few days cut'});

/* ---- utility: fuel plants added to close the survey (MEDICINE-FUEL.md): the hyperjungle had none, the southern highlands one, the geyser basin one */
R('pitch-vine', 'Pitch vine', 'fuel', [4, 4], [3, 4], {also: ['dye'], form: 'vine', card: 'card.vine', colour: 'black', home: ['hyperjungle'], src: 'hyperjungle', note: 'a resin liana: dried, a torch and kindling that burns in the wet; its soot is a black'});
R('kapok-floss', 'Kapok floss', 'fuel', [4, 4], [2, 4], {form: 'tree', home: ['hyperjungle'], src: 'hyperjungle', note: 'tinder and lamp wick'});
R('mahogany-capsule', 'Mahogany capsules', 'fuel', [4, 4], [3, 4], {form: 'tree', card: 'card.mahogany', home: ['hyperjungle'], src: 'hyperjungle', note: 'spent, hard and dry: the jungle charcoal'});
R('prism-resin', 'Prism-gum torch resin', 'fuel', [4, 4], [3, 4], {form: 'tree', card: 'card.prismgum', home: ['hyperjungle'], src: 'hyperjungle'});
R('stilt-lily', 'Stilt-lily fibre', 'fuel', [4, 5], [0, 2], {homeOnly: true, form: 'tree', home: ['necanyons'], src: 'necanyons', note: 'the resinous trunk fibre: torches that burn wet'});

/* ---- utility: medicine (opened 2026-10-19 for necanyons: biomes/necanyons/PLAN.md section 5; the survey's other medicinal plants, MEDICINE-FUEL.md, can move in) */
R('rimdew', 'Rimdew', 'medicine', [3, 4], [3, 4], {card: 'card.carnivore.sundew', src: 'necanyons', home: ['necanyons'], stores: ['fresh', 'dried'], note: 'a sundew: steeped in honey or spirit, a cough and chest syrup that eases cramps; grown in a wet, sunny, nutrient-poor bed'});
R('rock-bottle', 'Rock-bottle sap', 'reagent', [4, 5], [0, 1], {homeOnly: true, form: 'shrub', hazard: 'poison', src: 'necanyons', home: ['necanyons'], note: 'a heart poison: arrows, and to stun fish'});
R('coilbark-split', 'Coilbark splits', 'fuel', [1, 2], [3, 4], {form: 'tree', home: ['shighlands'], src: 'shighlands', note: 'the offcuts of turned work'});
R('dried-reed', 'Dried warm reed', 'fuel', [4, 5], [3, 4], {water: 'aquatic', card: 'card.reed', home: ['geyser'], src: 'geyser'});

/* ---- the Oidong Valley (biomes/oidong, 2026-10-19): the holy plants, the monks' physic and the valley's fibres and dyes. Medicinal
   plants and reagents are common there (the owner); `herb` is their bucket when they are eaten or steeped, `reagent` when they are the
   monks' rites' stuff. The dye is the Order's own blue. */
R('lotus-root', 'Giant lotus root', 'tuber', [1, 3], [3, 4], {also: ['nut'], water: 'aquatic', card: 'card.lotus', src: 'oidong', home: ['oidong', 'xanadu'], stores: ['fresh', 'dried'], note: 'the giant lotus: its root the staple starch, its seeds dried'});
R('lotus-silk', 'Lotus silk', 'spinning', [1, 3], [3, 4], {water: 'aquatic', card: 'card.lotus', src: 'oidong', home: ['oidong'], stores: ['dried'], note: 'the fibre drawn from the giant lotus stems, spun fine: the monks\' cloth'});
R('cherry', 'Valley cherry', 'fruit', [1, 3], [2, 3], {form: 'tree', card: 'card.blossom', src: 'oidong', home: ['oidong'], stores: ['fresh', 'dried']});
R('bodhi-fig', 'Sacred fig', 'fruit', [1, 3], [2, 4], {form: 'tree', card: 'card.broadleaf', src: 'oidong', home: ['oidong'], note: 'small purple figs; the tree is never felled'});
R('bell-pod', 'Bell-pod beads', 'berry', [1, 2], [3, 4], {also: ['reagent'], form: 'tree', src: 'oidong', home: ['oidong'], stores: ['fresh', 'dried'], hazard: 'the bells: one is sleep, two is a day lost', note: 'the beads sweet; the coral bells dried, the monks\' sleeping draught'});
R('bamboo', 'Jade bamboo', 'weaving', [1, 3], [3, 4], {also: ['cordage', 'sheet', 'vegetable'], card: 'fibre.bamboo.lattice', src: 'oidong', home: ['oidong'], note: 'canes, baskets, pipes and pens; pulped for paper; the shoots boiled'});
R('chalice-grass', 'Chalice-rim grass', 'sheet', [1, 2], [3, 4], {homeOnly: true, form: 'tree', src: 'oidong', home: ['oidong'], note: 'the pale grass of the chalice trees\' rims, cut for the finest paper'});
R('maple-syrup', 'Paper-maple syrup', 'sweetener', [1, 2], [3, 4], {form: 'tree', src: 'oidong', home: ['oidong'], stores: ['pressed']});
R('peyote', 'Peyote buttons', 'reagent', [1, 2], [1, 2], {atm: [0, 2], src: 'oidong', home: ['oidong'], stores: ['dried'], hazard: 'the seeing: a day of visions', note: 'dried buttons from the gravel flats; the monks\' seeing reagent'});
R('sky-poppy', 'Sky poppy', 'reagent', [0, 2], [2, 3], {also: ['dye', 'herb'], atm: [0, 2], colour: 'blue', src: 'oidong', home: ['oidong'], stores: ['dried'], hazard: 'the seed: sleep', note: 'the seed a sleeping draught and a reagent of the stillness rites; the leaves the vat of the Order\'s blue'});
R('snow-lotus', 'Snow lotus', 'herb', [0, 1], [2, 3], {atm: [0, 1], reach: 0, src: 'oidong', home: ['oidong'], stores: ['dried'], note: 'the valley\'s strongest medicine, for the heart and the breath; the whole plant dried'});
R('valley-ginseng', 'Valley ginseng', 'herb', [1, 2], [3, 4], {also: ['reagent'], src: 'oidong', home: ['oidong'], stores: ['dried'], note: 'a tonic root dug after seven years'});
R('monks-sage', 'Monk\'s sage', 'herb', [1, 2], [1, 2], {atm: [0, 2], also: ['fuel'], card: 'card.sage', src: 'oidong', home: ['oidong'], stores: ['dried'], note: 'a silver wormwood: incense and a bitter for the stomach'});
R('moon-cap', 'Moon caps', 'mushroom', [1, 2], [3, 4], {also: ['reagent'], form: 'fungus', src: 'oidong', home: ['oidong'], stores: ['fresh', 'dried'], hazard: 'dreams', note: 'pink pleated parasols; a mild dream mushroom'});
R('rainbow-bracket', 'Rainbow bracket', 'herb', [1, 2], [3, 4], {form: 'fungus', src: 'oidong', home: ['oidong'], stores: ['dried'], note: 'banded shelf fungi on the old trunks: the long-life tea'});
R('camphor', 'Camphor crystals', 'reagent', [1, 3], [2, 4], {also: ['herb'], form: 'tree', src: 'oidong', home: ['oidong'], stores: ['dried'], note: 'steamed out of the camphor laurel\'s wood: the monks\' liniment, a reagent that clears the head'});
R('cedar-incense', 'Temple-cedar incense', 'fuel', [1, 2], [2, 4], {form: 'tree', src: 'oidong', home: ['oidong'], note: 'cedar shavings burned as incense; the heartwood is the temple timber'});
/* ---- Farside (biomes/farside, 2026-10-26): the coast's materials from the sea's flora. Kelp ash is the third source of the alkali salts
   beside the Catch's nodes (biomes/catch/PLAN.md 6a: potash and alkali salts, kits/resources); the State taxes it, with the lime */
R('kelp-ash', 'Kelp ash (potash and soda)', 'reagent', [3, 4], [3, 4], {homeOnly: true, home: ['farside'], src: 'farside', stores: ['dried'], note: 'the stipes and blades burned in the kelp kilns: potash and soda for the glassmakers and soapmakers, iodine'});
R('coral-lime', 'Spray-coral lime', 'reagent', [3, 4], [3, 4], {homeOnly: true, home: ['farside'], src: 'farside', note: 'the spray coral burned in the lime kilns on the terraces: mortar and the Farside whitewash'});
R('eelgrass', 'Strand eelgrass', 'thatch', [2, 4], [3, 4], {also: ['weaving'], needs: 'salt', card: 'card.seagrass', home: ['farside'], src: 'farside', stores: ['dried'], note: 'the dead leaf raked from the windrows: thatch, packing, mattresses'});

/* ---- the High Country (biomes/nwouterwall, PLAN.md sections 4 and 5, 2026-10-26): its fibres, dyes and fuel. The kingdom's cloth is
   combed from its own animals (qiviut); larch bark gives a red-brown, silverthorn a yellow, birch tar a black; the lichen dye is the
   Rosette lichen's (home here too) */
R('qiviut', 'Qiviut', 'spinning', [0, 1], [0, 2], {homeOnly: true, atm: [0, 1], src: 'nwouterwall', home: ['nwouterwall'], stores: ['dried'], note: 'the musk ox\'s underwool, combed in spring: the finest and warmest wool there is'});
R('woolly-willow', 'Woolly willow withies', 'weaving', [0, 1], [2, 4], {also: ['fuel'], atm: [0, 1], form: 'shrub', src: 'nwouterwall', home: ['nwouterwall'], note: 'Salix lanata on the stream banks and the tundra: withies, and the fat catkins\' down'});
R('cottongrass', 'Cottongrass down', 'fuel', [0, 1], [3, 4], {also: ['sheet'], atm: [0, 1], card: 'card.cottongrass', src: 'nwouterwall', home: ['nwouterwall'], stores: ['dried'], note: 'Eriophorum in the alas bogs: wicks for the lamps, and padding'});
R('sphagnum', 'Bog moss', 'sheet', [0, 2], [3, 4], {atm: [0, 2], src: 'nwouterwall', home: ['nwouterwall'], stores: ['dried'], note: 'sphagnum, red and green, cut in the alases: dressing, nappies, insulation, and the fibre of moss pycrete where there is no timber'});
R('beard-lichen', 'Larch beard', 'medicine', [0, 1], [1, 3], {atm: [0, 1], src: 'nwouterwall', home: ['nwouterwall'], stores: ['dried'], note: 'beard lichens (Bryoria, Usnea) hanging on the larch: a wound dressing, and the caribou\'s winter fodder'});
R('larch-bark', 'Fur-larch bark', 'dye', [0, 1], [1, 2], {atm: [0, 2], form: 'tree', colour: 'red-brown', src: 'nwouterwall', home: ['nwouterwall', 'wouterwall'], note: 'the bark\'s tannin: a red-brown, and the tanner\'s bark; the larch\'s gum is chewed'});
R('silverthorn', 'Silverthorn', 'berry', [0, 2], [0, 2], {also: ['dye'], atm: [0, 2], form: 'shrub', card: 'card.seabuckthorn', colour: 'yellow', src: 'nwouterwall', home: ['nwouterwall'], stores: ['fresh', 'cured'], note: 'sea buckthorn in the forest-steppe\'s gullies: the berries against the winter\'s scurvy, a yellow dye'});
R('birch-tar', 'Birch tar', 'dye', [0, 1], [1, 3], {also: ['fuel'], atm: [0, 1], form: 'shrub', colour: 'black', src: 'nwouterwall', home: ['nwouterwall', 'wouterwall'], note: 'dry-distilled from the snow birch\'s bark: glue, waterproofing and a black'});

/* ---- the loess bench (biomes/wouterwall, PLAN.md section 4, 2026-11-10): the Hayrant's rope and sacking */
R('cave-madder', 'Cave madder', 'dye', [1, 2], [0, 2], {also: ['medicine'], atm: [0, 2], form: 'vine', colour: 'red', src: 'wouterwall', home: ['wouterwall'], stores: ['dried'], note: "Indian madder (Rubia cordifolia), scrambling over the terraces' risers and the gully walls: its roots dug in the third autumn for the Hayrant's red; with the larch's red-brown, the birch tar's black and the lichen's brown they weave a plaid"});
R('wallhemp', 'Wallhemp', 'cordage', [1, 2], [1, 3], {also: ['spinning', 'oil'], atm: [0, 2], card: 'card.crop.nettle', src: 'wouterwall', home: ['wouterwall'], stores: ['dried'], note: 'hemp (Cannabis sativa) on the lower terraces: retted in the spring brooks for rope and coarse sacking; its seed pressed for lamp oil in the cave houses'});

/* ---- the Cut (biomes/cut, PLAN.md section 7, 2026-10-26) */
R('rankgrass', 'Rankgrass', 'thatch', [4, 5], [0, 1], {needs: 'salt', form: 'grass', card: 'card.rankgrass', src: 'cut', home: ['cut'], note: 'a salt grass seeding in straight lines along the field of the warp; grazing on the flats, salt-tolerant thatch'});
R('circlelichen', 'Circle lichen', 'herb', [1, 2], [0, 4], {also: ['medicine', 'dye'], colour: 'orange', atm: [0, 2], form: 'lichen', src: 'cut', home: ['cut'], stores: ['dried'], note: 'perfect circles on the bare cut faces; scraped and steeped as an antiseptic wash (as Usnea); boiled, the orange circles dye wool yellow to orange (as Xanthoria)'});
