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
R('mat', 'The mat', 'sheet', [0, 5], [0, 4], {also: ['weaving'], form: 'fungus', grown: 'underground', water: 'bed', works: 'sealed-beds', hazard: 'digests what sleeps on it', home: ['throne'], src: 'throne', stores: ['pressed'], note: 'a slime mould, dried and pressed to a felt-like sheet'});

/* ---- utility: dye */
R('annatto', 'Sunseed annatto', 'dye', [4, 4], [3, 4], {form: 'shrub', card: 'card.crop.annatto', colour: 'orange', home: ['hyperjungle']});
R('indigo', 'Jungle indigo', 'dye', [4, 4], [2, 4], {form: 'shrub', card: 'card.crop.indigo', colour: 'blue', home: ['hyperjungle']});
R('woad', 'Valley woad', 'dye', [1, 3], [1, 3], {atm: [0, 2], card: 'card.crop.woad', colour: 'blue', home: ['ebadlands', 'nhighlands'], note: 'also Clan woad: the northern clans'});
R('broom', 'Heath broom', 'dye', [0, 2], [1, 3], {atm: [0, 2], form: 'shrub', card: 'card.broom', colour: 'yellow', home: ['nhighlands']});
R('lichen', 'Rosette lichen', 'dye', [0, 3], [1, 3], {atm: [0, 2], colour: 'brown', home: ['shighlands', 'sedesert'], src: 'shighlands', note: 'a lichen dye (the colour is not named in the kits)'});
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

/* ---- utility: reagent and fuel (the Zeijani's dark farms) */
R('glow-mushroom', 'Glow mushroom', 'reagent', [0, 5], [0, 4], {also: ['fuel'], form: 'fungus', grown: 'underground', water: 'bed', works: 'dark-beds', card: 'card.mushroom.glow', home: ['throne'], src: 'throne', note: 'the alchemist\'s culture and a light and heat source'});
R('lamp-cap', 'Lamp cap', 'fuel', [0, 5], [0, 4], {form: 'fungus', grown: 'underground', water: 'bed', works: 'dark-beds', home: ['throne'], src: 'throne', note: 'carried as a lamp; lasts a few days cut'});

/* ---- utility: fuel plants added to close the survey (MEDICINE-FUEL.md): the hyperjungle had none, the southern highlands one, the geyser basin one */
R('pitch-vine', 'Pitch vine', 'fuel', [4, 4], [3, 4], {also: ['dye'], form: 'vine', card: 'card.vine', colour: 'black', home: ['hyperjungle'], src: 'hyperjungle', note: 'a resin liana: dried, a torch and kindling that burns in the wet; its soot is a black'});
R('kapok-floss', 'Kapok floss', 'fuel', [4, 4], [2, 4], {form: 'tree', home: ['hyperjungle'], src: 'hyperjungle', note: 'tinder and lamp wick'});
R('mahogany-capsule', 'Mahogany capsules', 'fuel', [4, 4], [3, 4], {form: 'tree', card: 'card.mahogany', home: ['hyperjungle'], src: 'hyperjungle', note: 'spent, hard and dry: the jungle charcoal'});
R('prism-resin', 'Prism-gum torch resin', 'fuel', [4, 4], [3, 4], {form: 'tree', card: 'card.prismgum', home: ['hyperjungle'], src: 'hyperjungle'});
R('coilbark-split', 'Coilbark splits', 'fuel', [1, 2], [3, 4], {form: 'tree', home: ['shighlands'], src: 'shighlands', note: 'the offcuts of turned work'});
R('dried-reed', 'Dried warm reed', 'fuel', [4, 5], [3, 4], {water: 'aquatic', card: 'card.reed', home: ['geyser'], src: 'geyser'});
