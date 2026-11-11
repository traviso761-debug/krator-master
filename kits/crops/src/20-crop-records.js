/* ==================== the Crops kit: the records (plain data, [G data]) ==================== */
/* One row per crop: R(id, name, bucket, warmth [lo,hi], arid [lo,hi], options). The options:
   atm [lo,hi]    air pressure band it takes (default [1,2]: standard and dense)
   reach n        how many aridity bands drier than its rain-fed range irrigation can carry it (default 2; frost-tender and dryland crops less)
   water          'rain' (default), 'paddy' (wants standing water or flooded beds), 'aquatic' (a wet zone only), 'bed' (dark-grown)
   needs          'salt' (a salt zone) or 'heated' (warm ground)
   home [biomes]  where it is native or already drawn: always plausible there, as 'wild'
   homeOnly       true for a dye or fibre that is not a climate crop (animal, mineral, resin): home or traded, nothing else
   also [buckets] other buckets it can stand in for
   grown 'field' (default) | 'underground'   (a dark-grown crop ignores the axes; a works that keeps it takes it)
   form, stores, yield (0.5 / 1 / 2), card (a core/materials/library card id), src ('proposed' or the kit that draws it), colour (a dye)
   stuck  the share of the fruit that sets unripe at the smallest size and stays there (the Cut's measure melon)
   node  a kits/resources node kind (iron, copper, sulfur, oil) a mineral dye needs; works  the works an underground crop needs */
CROPS.LIST = [];
CROPS.BY_ID = {};
CROPS.def = function (id, name, bucket, w, a, o) {
  o = o || {};
  const r = {
    id: id, name: name, bucket: bucket, also: o.also || [], form: o.form || 'plant', grown: o.grown || 'field',
    warmth: w, arid: a, atm: o.atm || [1, 2], reach: o.reach == null ? 2 : o.reach, water: o.water || 'rain',
    needs: o.needs || null, home: o.home || [], homeOnly: !!o.homeOnly, stores: o.stores || ['fresh'],
    yield: o.yield == null ? 1 : o.yield, card: o.card || null, src: o.src || 'proposed', colour: o.colour || null,
    node: o.node || null, works: o.works || null, hazard: o.hazard || null, note: o.note || '',
    stuck: o.stuck == null ? null : o.stuck   /* the Cut's measure melon: the share of its fruit that sets unripe and stays so (2026-10-26) */
  };
  if (CROPS.BY_ID[id]) throw new Error('crops: duplicate id ' + id);
  CROPS.LIST.push(r); CROPS.BY_ID[id] = r; return r;
};
const R = CROPS.def;

/* ---- staple: grain, pulse, tuber, starch-fruit */
R('rice', 'Rice', 'grain', [3, 4], [3, 4], {water: 'paddy', card: 'card.crop', src: 'ringisles', home: ['ringisles'], stores: ['ground', 'dried']});
R('emmer', 'Plain emmer', 'grain', [2, 3], [1, 2], {reach: 1, card: 'card.crop.grainhead', home: ['swlowlands'], stores: ['ground', 'dried']});
R('frostoat', 'Frostoat', 'grain', [1, 2], [2, 3], {atm: [0, 2], reach: 1, card: 'card.crop.grainhead', home: ['nhighlands'], stores: ['ground', 'dried']});
R('ashmillet', 'Ashmillet', 'grain', [4, 5], [0, 2], {card: 'card.crop.grainhead', home: ['crater-drylands'], stores: ['ground', 'dried'], note: 'sown into burn ash; ripens in weeks'});
R('basin-amaranth', 'Basin amaranth', 'grain', [2, 4], [0, 1], {atm: [0, 2], card: 'card.crop.plume', home: ['ebadlands'], stores: ['ground', 'dried']});
R('wild-rice', 'Shore wild-rice', 'grain', [2, 4], [3, 4], {water: 'aquatic', card: 'card.crop.plume', home: ['nwbay'], stores: ['dried']});
R('helix-bean', 'Helix bean', 'pulse', [1, 3], [2, 3], {atm: [0, 2], card: 'card.crop.bean', home: ['shighlands'], stores: ['dried'], note: 'twines up a stake'});
R('tepary-bean', 'Tepary bean', 'pulse', [3, 5], [0, 1], {card: 'card.crop.bean', home: ['sedesert'], stores: ['dried'], note: 'floodwater-sown'});
R('bambara', 'Bambara groundnut', 'pulse', [4, 5], [1, 2], {card: 'card.crop.bean', home: ['swbay'], stores: ['dried']});
R('taro', 'Taro', 'tuber', [4, 4], [3, 4], {water: 'paddy', card: 'card.paddle', src: 'ringisles', home: ['ringisles']});
R('sweet-potato', 'Sweet potato', 'tuber', [3, 4], [1, 3], {card: 'card.crop.yam', src: 'ringisles', home: ['ringisles']});
R('steambed-yam', 'Steambed yam', 'tuber', [4, 5], [3, 4], {needs: 'heated', card: 'card.crop.yam', home: ['geyser'], note: 'planted in the warm crust'});
R('frostroot', 'Frostroot', 'tuber', [0, 1], [1, 2], {atm: [0, 1], reach: 0, card: 'card.crop.clover', home: ['ehighlands'], stores: ['dried'], note: 'freeze-dried like chuno'});
R('murnong', 'Murnong', 'tuber', [2, 3], [1, 2], {reach: 1, card: 'card.crop.rosette', home: ['nwlowlands'], note: 'a yam-daisy'});
R('shade-manioc', 'Shade manioc', 'tuber', [4, 4], [2, 4], {card: 'card.crop.palmate', home: ['hyperjungle'], stores: ['ground', 'dried']});
R('ashroot', 'Ashroot', 'tuber', [3, 4], [2, 4], {reach: 1, card: 'card.crop.umbrella', home: ['throne'], stores: ['pressed'], note: 'a konjac-like corm on ash soil'});
R('stub-cone', 'Stub cone', 'tuber', [4, 4], [0, 2], {reach: 1, form: 'plant', src: 'abyssal-savannah', home: ['abyssal-savannah'], stores: ['ground', 'dried'], note: 'the single cone of the stub lycopsid, pounded for its starch'});
R('breadfruit', 'Breadfruit', 'starch-fruit', [4, 4], [3, 4], {reach: 1, form: 'tree', card: 'card.breadfruit', src: 'ringisles', home: ['ringisles']});
R('banana', 'Banana', 'starch-fruit', [4, 4], [3, 4], {card: 'card.paddle', src: 'ringisles', home: ['ringisles']});
R('plantain', 'Violet plantain', 'starch-fruit', [4, 4], [3, 4], {card: 'card.paddle', src: 'xanadu', home: ['xanadu']});
R('sandpan-fonio', 'Sandpan fonio', 'grain', [4, 5], [0, 2], {reach: 1, card: 'card.crop.plume', src: 'necanyons', home: ['necanyons'], stores: ['ground', 'dried'], note: 'poor sand; ripe eight weeks after the rains'});

/* ---- protein-fat: nut, oil, alga */
R('pinyon', 'Pinyon nuts', 'nut', [2, 3], [1, 2], {form: 'tree', card: 'card.pine', src: 'ebadlands', home: ['ebadlands'], stores: ['dried']});
R('acorn', 'Acorns', 'nut', [2, 3], [2, 3], {form: 'tree', card: 'card.lobed', src: 'nhighlands', home: ['nhighlands', 'ebadlands', 'swlowlands'], stores: ['ground']});
R('wingnut', 'Wingnut', 'nut', [2, 3], [2, 3], {form: 'tree', src: 'xanadu', home: ['xanadu']});
R('mahogany-nut', 'Mahogany nut', 'nut', [4, 4], [3, 4], {form: 'tree', card: 'card.mahogany', src: 'hyperjungle', home: ['hyperjungle']});
R('parasol-nut', 'Parasol pine nuts', 'nut', [4, 5], [0, 1], {form: 'tree', card: 'card.pine.b', src: 'crater-drylands', home: ['crater-drylands'], stores: ['dried']});
R('fireseed', 'Frill-tree fireseed', 'nut', [4, 5], [0, 1], {form: 'tree', card: 'card.pods', src: 'crater-drylands', home: ['crater-drylands'], stores: ['ground']});
R('fern-egg', 'Fern-egg', 'nut', [4, 4], [3, 4], {src: 'eastabyss', home: ['eastabyss'], stores: ['cured']});
/* the north basin's nut trees (biomes/nsemiarid draws them; it is not a zone in CROPS.BIOMES yet, so no home): warm-temperate
   dryland trees, frost-hardy in winter, irrigated a little way past their rain-fed range (2026-11-03, TODO.md "the missing fruit") */
R('pistachio', 'Pistachios', 'nut', [2, 4], [0, 1], {form: 'tree', reach: 1, src: 'nsemiarid', stores: ['dried', 'roasted'], note: 'the catalog piece is generic_fruit_pistachio'});
R('almond', 'Almonds', 'nut', [2, 4], [1, 2], {form: 'tree', reach: 1, src: 'nsemiarid', stores: ['dried'], note: 'sweet strains only (the wild are bitter); generic_fruit_almond'});
R('coconut', 'Coconut', 'oil', [4, 5], [2, 4], {also: ['nut', 'starch-fruit'], form: 'tree', card: 'card.frond.coconut', src: 'throne', home: ['throne', 'ringisles'], stores: ['dried', 'pressed']});
R('whorl-olive', 'Whorl olive', 'oil', [3, 3], [1, 2], {form: 'tree', card: 'card.orchard.small', src: 'xanadu', home: ['xanadu'], stores: ['pressed', 'brined']});
R('avocado', 'Ashfall avocado', 'oil', [3, 4], [2, 3], {also: ['fruit'], form: 'tree', card: 'card.croptree.glossy', home: ['throne'], note: 'volcanic soil'});
R('lakecake', 'Lakecake', 'alga', [3, 4], [0, 1], {water: 'aquatic', needs: 'salt', home: ['rift'], stores: ['pressed', 'dried'], note: 'skimmed from the lake; no card (the water shader draws it)'});
/* Farside's weeds (biomes/farside, 2026-10-26): the sea's flora come ashore on the wettest coast, eaten as the coast's staple greens */
R('kelp', 'Land kelp (kombu)', 'alga', [3, 4], [3, 4], {also: ['greens'], needs: 'salt', card: 'card.kelp.0', home: ['farside'], src: 'farside', stores: ['dried'], note: 'the blades of the land kelp, cut and dried: the coast staple; the stipes go to the kilns for kelp ash'});
R('wineweed', 'Wine weed (nori)', 'alga', [2, 4], [3, 4], {also: ['greens', 'sheet', 'dye'], colour: 'red', card: 'card.wineweed', home: ['farside'], src: 'farside', stores: ['dried', 'pressed'], note: 'red sheets pressed and dried as nori; boiled down for agar (glue, sizing); its crimson a red dye (proposed)'});
R('sea-lettuce', 'Sea lettuce', 'greens', [3, 4], [3, 4], {needs: 'salt', card: 'card.kelp.1', home: ['farside'], src: 'farside', note: 'the emerald sheets on every wet surface of the kelp coast'});
R('sea-grapes', 'Sea grapes', 'greens', [3, 4], [3, 4], {needs: 'salt', home: ['farside'], src: 'farside', note: 'Caulerpa runners on the kelp forest floor, the bead chains eaten fresh'});

/* ---- produce: vegetable, greens, mushroom, fruit, berry, dried-fruit */
R('yucca-stalk', 'Roasted yucca stalk', 'vegetable', [3, 5], [0, 1], {card: 'card.sword', src: 'ebadlands', home: ['ebadlands', 'crater-drylands']});
R('ballmelon', 'Ballmelon', 'vegetable', [4, 4], [1, 2], {src: 'rift', home: ['rift']});
R('frillpod', 'Frillpod', 'vegetable', [4, 4], [2, 3], {card: 'card.pods', src: 'rift', home: ['rift']});
R('fan-palm-heart', 'Fan-palm heart', 'vegetable', [4, 4], [2, 4], {also: ['thatch', 'weaving'], form: 'tree', card: 'card.palm', src: 'necanyons', home: ['necanyons'], note: 'cut from one stem of a clump, which the clump replaces'});
R('fiddlehead', 'Fiddleheads', 'vegetable', [1, 4], [3, 4], {card: 'card.fern.green', home: ['shighlands', 'swlowlands', 'nwlowlands']});
R('greens', 'Greens', 'greens', [2, 4], [2, 3], {card: 'card.broadleaf', src: 'ringisles', home: ['ringisles']});
R('tidewort', 'Tidewort', 'greens', [3, 5], [0, 4], {needs: 'salt', card: 'card.samphire', home: ['eastabyss'], note: 'a samphire-like salt green'});
R('pale-fungi', 'Pale fungi', 'mushroom', [0, 5], [0, 4], {also: ['vegetable'], form: 'fungus', grown: 'underground', water: 'bed', works: 'dark-beds', card: 'card.mushroom.pale', home: ['throne'], stores: ['fresh', 'dried']});
R('mango', 'Mango', 'fruit', [4, 4], [1, 3], {form: 'tree', card: 'card.croptree.glossy', src: 'ringisles', home: ['ringisles']});
R('apricot', 'Vale apricot', 'fruit', [1, 3], [1, 2], {form: 'tree', card: 'card.orchard.broad', home: ['xanadu'], stores: ['fresh', 'dried']});
R('persimmon', 'Frost persimmon', 'fruit', [2, 3], [2, 3], {form: 'tree', card: 'card.orchard.broad', home: ['swlowlands']});
R('pomegranate', 'Crest pomegranate', 'fruit', [3, 4], [0, 2], {form: 'tree', card: 'card.orchard.small', home: ['rift']});
R('guava', 'Stair guava', 'fruit', [4, 5], [2, 4], {form: 'tree', card: 'card.croptree.glossy', home: ['geyser']});
R('citron', 'Limestone citron', 'fruit', [3, 4], [1, 3], {also: ['spice'], form: 'tree', card: 'card.croptree.glossy', home: ['nwbay']});
R('ironplum', 'Ironplum', 'fruit', [3, 4], [2, 4], {form: 'tree', card: 'card.croptree.glossy', home: ['nwlowlands']});
R('tamarillo', 'Cloud tamarillo', 'fruit', [1, 3], [3, 4], {form: 'tree', card: 'card.orchard.broad', home: ['shighlands']});
R('marula', 'Bay marula', 'fruit', [4, 4], [1, 2], {form: 'tree', card: 'card.croptree.glossy', home: ['swbay']});
R('stinkbell', 'Stinkbell', 'fruit', [4, 4], [3, 4], {form: 'tree', card: 'card.croptree.glossy', home: ['hyperjungle']});
R('brine-apple', 'Brine apple', 'fruit', [4, 4], [3, 4], {needs: 'salt', form: 'tree', card: 'card.croptree.glossy', home: ['eastabyss']});
R('crabapple', 'Highland crabapple', 'fruit', [0, 2], [2, 3], {atm: [0, 2], form: 'tree', card: 'card.orchard.broad', home: ['nhighlands']});
R('fig', 'Fig', 'fruit', [3, 4], [0, 2], {form: 'tree', card: 'card.broadleaf', src: 'swlowlands', home: ['swlowlands', 'nwbay'], stores: ['fresh', 'dried']});
R('pitaya', 'Pitaya and tuna', 'fruit', [3, 5], [0, 2], {card: 'card.succulent.spotted', src: 'xanadu', home: ['xanadu', 'sedesert', 'ebadlands']});
R('scalefruit', 'Scalefruit', 'fruit', [4, 4], [3, 4], {form: 'tree', src: 'eastabyss', home: ['eastabyss']});
R('canyon-grape', 'Canyon grape', 'fruit', [2, 3], [1, 2], {form: 'vine', card: 'card.vine', src: 'ebadlands', home: ['ebadlands'], stores: ['fresh', 'dried']});
R('stack-fig', 'Stack fig', 'fruit', [4, 4], [1, 4], {also: ['dried-fruit'], form: 'tree', card: 'card.broadleaf', src: 'necanyons', home: ['necanyons'], stores: ['fresh', 'dried'], note: 'a rock fig: its roots down the walls, the figs on them'});
R('ember-plum', 'Ember plum', 'fruit', [4, 5], [0, 2], {also: ['medicine'], form: 'tree', card: 'card.orchard.broad', src: 'necanyons', home: ['necanyons'], stores: ['fresh', 'dried'], note: 'very sour; dried and pounded against scurvy'});
R('lantern-fruit', 'Lantern fruit', 'fruit', [3, 4], [2, 3], {form: 'tree', src: 'rift', home: ['rift', 'xanadu']});
R('serviceberry', 'Canyon serviceberry', 'berry', [1, 3], [1, 3], {atm: [0, 2], form: 'shrub', card: 'card.orchard.broad', home: ['ebadlands']});
R('sunthorn', 'Gully sunthorn', 'berry', [0, 2], [1, 2], {atm: [0, 1], form: 'shrub', card: 'card.sunthorn', home: ['ehighlands']});
R('rowan', 'Frost rowan', 'berry', [0, 2], [2, 3], {atm: [0, 2], form: 'tree', src: 'nhighlands', home: ['nhighlands', 'nwouterwall']});
R('bilberry', 'Wall bilberry', 'berry', [0, 2], [2, 3], {atm: [0, 2], form: 'shrub', src: 'nhighlands', home: ['nhighlands', 'nwouterwall']});
R('madrone', 'Madrone berries', 'berry', [2, 3], [1, 2], {form: 'tree', src: 'swlowlands', home: ['swlowlands']});
R('arbutus', 'Strawberry-tree berries', 'berry', [3, 3], [1, 2], {form: 'tree', src: 'xanadu', home: ['xanadu']});
R('wadi-date', 'Wadi date', 'dried-fruit', [4, 5], [0, 2], {form: 'tree', card: 'card.palm', src: 'sedesert', home: ['sedesert'], stores: ['dried']});
R('mesquite', 'Mesquite pods', 'dried-fruit', [4, 5], [0, 2], {form: 'tree', card: 'card.acacia', src: 'sedesert', home: ['sedesert', 'crater-drylands'], stores: ['ground', 'dried']});
R('sidr', 'Wadi sidr', 'dried-fruit', [4, 5], [0, 2], {form: 'tree', card: 'card.orchard.small', home: ['sedesert'], stores: ['dried']});
R('carob', 'Kiln carob', 'dried-fruit', [3, 5], [0, 2], {also: ['sweetener'], form: 'tree', card: 'card.orchard.small', home: ['crater-drylands'], stores: ['dried', 'ground']});
R('gatepod', 'Gatepod', 'dried-fruit', [4, 4], [1, 2], {form: 'tree', card: 'card.baobab', src: 'hyperjungle', home: ['hyperjungle', 'swbay', 'nwbay'], stores: ['dried']});
R('bell-date', 'Bell date', 'dried-fruit', [4, 4], [1, 3], {form: 'tree', card: 'card.palm', src: 'rift', home: ['rift'], stores: ['dried']});

/* ---- flavour and drink */
R('clove', 'Clove', 'spice', [4, 4], [3, 4], {form: 'tree', card: 'card.croptree.glossy', src: 'ringisles', home: ['ringisles'], stores: ['dried']});
R('juniper', 'Juniper berries', 'spice', [1, 3], [0, 2], {form: 'tree', card: 'card.juniper', src: 'ebadlands', home: ['ebadlands'], stores: ['dried']});
R('umbel-seed', 'Umbel seed', 'spice', [2, 3], [0, 2], {src: 'ebadlands', home: ['ebadlands'], stores: ['dried']});
R('saffron', 'Vale saffron', 'spice', [2, 3], [1, 2], {also: ['dye'], card: 'card.crop.saffron', colour: 'saffron', home: ['xanadu'], stores: ['dried']});
R('herbs', 'Herbs (lemongrass, ginger, basil)', 'herb', [3, 4], [2, 3], {card: 'card.crop', src: 'ringisles', home: ['ringisles'], stores: ['fresh', 'dried']});
R('sugar-cane', 'Sugar cane', 'sweetener', [4, 4], [1, 3], {card: 'card.crop', src: 'ringisles', home: ['ringisles'], stores: ['pressed']});
R('coffee', 'Coffee', 'beverage', [3, 4], [3, 4], {form: 'shrub', card: 'card.croptree.glossy', src: 'ringisles', home: ['ringisles'], stores: ['dried']});
R('tea', 'Mist tea', 'beverage', [1, 3], [3, 4], {atm: [0, 2], form: 'shrub', card: 'card.crop.tea', home: ['xanadu', 'oidong'], stores: ['dried']});
R('cacao', 'Cacao', 'beverage', [4, 4], [3, 4], {form: 'tree', card: 'card.croptree.glossy', src: 'xanadu', home: ['xanadu'], stores: ['dried', 'ground']});
R('kava', 'Kava', 'beverage', [4, 4], [3, 4], {form: 'shrub', card: 'card.broadleaf', src: 'ringisles', home: ['ringisles'], stores: ['dried', 'ground']});
R('rattlepod', 'Rattle coffee', 'beverage', [2, 3], [1, 2], {form: 'tree', src: 'swlowlands', home: ['swlowlands'], stores: ['dried']});
R('alecap', 'Alecap', 'beverage', [0, 5], [0, 4], {also: ['vegetable', 'dye'], form: 'fungus', grown: 'underground', water: 'bed', works: 'dark-beds', card: 'card.mushroom.alecap', colour: 'purple', src: 'zeijani', home: ['throne'], stores: ['fermented', 'fresh'], note: 'fermented to a passable beer; the Zeijani beds (zj_farm_alecap)'});

/* ---- the High Country (biomes/nwouterwall, PLAN.md section 4, 2026-10-26): the Thule package of *The Lands of Ice and Mice*, the
   Yeti's arctic roots. The Three Gifts (Tiri Gipler) are sweetroot, snow potato and goldroot; a part of every root is buried again and a
   gift left for the spirits (and the vole whose cache was raided). The High Country names are in each note */
R('sweetroot', 'Sweetroot', 'tuber', [0, 1], [0, 2], {atm: [0, 1], reach: 1, card: 'card.crop.thule', src: 'nwouterwall', home: ['nwouterwall'], stores: ['fresh', 'dried'], note: 'sweetvetch (Hedysarum alpinum): a carrot-like taproot to a metre long, a perennial bed 3-7 years to full root, dug in early spring and late autumn (woody in summer); gravel, till and poor soil. The staple: isiit, "the sweet"'});
R('bearroot', 'Bearroot', 'reagent', [0, 1], [0, 2], {atm: [0, 1], hazard: 'poison', src: 'nwouterwall', home: ['nwouterwall'], note: 'Hedysarum mackenzii, sweetroot\'s twin: the same leaves and flowers, a poisonous root; no harvest. Telling them apart is the farmer\'s first skill: beer-isiit, "the bear\'s sweet"'});
R('snowpotato', 'Snow potato', 'tuber', [0, 1], [0, 2], {atm: [0, 1], reach: 0, card: 'card.crop.thule', src: 'nwouterwall', home: ['nwouterwall'], stores: ['fresh', 'dried'], note: 'Claytonia tuberosa (the Eskimo potato): a white taproot near the surface; the seedlings die in frost, so it is grown in stone-walled pockets that hold the day\'s warmth. Isnoo-pa\'a'});
R('goldroot', 'Goldroot', 'herb', [0, 1], [0, 2], {also: ['tuber', 'medicine'], atm: [0, 1], reach: 1, card: 'card.crop.thule', src: 'nwouterwall', home: ['nwouterwall'], stores: ['dried'], note: 'roseroot (Rhodiola rosea): a nest of thick roots that smell of roses dried; the remedy for fatigue and thin air, 4-5 years to harvest; the Yeti\'s trade good. Gooldruut'});
R('bistort', 'Snow bistort', 'grain', [0, 1], [1, 3], {atm: [0, 1], reach: 1, src: 'nwouterwall', home: ['nwouterwall'], stores: ['dried', 'ground'], note: 'alpine bistort (Bistorta vivipara): a spike of bulbils, threshed and cooked like a grain; voles cache them ("mouse nuts")'});
R('mountain-sorrel', 'Mountain sorrel', 'greens', [0, 1], [1, 3], {atm: [0, 1], src: 'nwouterwall', home: ['nwouterwall'], stores: ['fresh', 'fermented'], note: 'Oxyria digyna: sour greens, eaten fresh or fermented'});
R('stonepine', 'Pine nuts', 'nut', [0, 1], [1, 2], {atm: [0, 1], form: 'tree', card: 'card.pine', src: 'nwouterwall', home: ['nwouterwall'], stores: ['dried'], note: 'the Siberian stone pine (Pinus sibirica) and its creeping mat above the tree line: the fat crop, stored for winter'});
R('cloudberry', 'Cloudberry', 'berry', [0, 1], [3, 4], {atm: [0, 1], src: 'nwouterwall', home: ['nwouterwall'], stores: ['fresh', 'cured'], note: 'Rubus chamaemorus, in the alas bogs: frozen, or kept in fat'});
R('crowberry', 'Crowberry', 'berry', [0, 1], [1, 3], {atm: [0, 1], form: 'shrub', src: 'nwouterwall', home: ['nwouterwall'], stores: ['fresh', 'dried'], note: 'Empetrum, on the tundra'});
R('ivanchai', 'Ivan-chai', 'beverage', [0, 2], [1, 3], {also: ['greens'], atm: [0, 2], card: 'card.fireweed', src: 'nwouterwall', home: ['nwouterwall'], stores: ['fermented', 'dried'], note: 'fireweed (Chamerion angustifolium) on the burns and the larch edges: the fermented leaves are the Yeti\'s tea; the young shoots greens'});
/* ---- the Cut (biomes/cut, PLAN.md section 7, 2026-10-26): the hyperbamboo (its shoots; its culms and leaves stand in for weaving and
   thatch), the bamboo rice of a grove's gregarious flowering, the measure melon in its three sizes. The rest of the bowl grows
   nwlowlands' crops, at the warp's fixed sizes */
R('hyperbamboo', 'Hyperbamboo shoots', 'vegetable', [4, 5], [3, 4], {also: ['weaving', 'thatch'], atm: [2, 2], form: 'grass', card: 'card.bamboo.giant', src: 'cut', home: ['cut'], stores: ['fresh', 'dried'], note: 'the shoots boiled; the culms (60-80 m) are the scaffolds, pipes and bridges of Dilihan; the leaves fodder'});
R('bamboo-rice', 'Bamboo rice', 'grain', [4, 5], [3, 4], {atm: [2, 2], form: 'grass', src: 'cut', home: ['cut'], yield: .5, stores: ['dried', 'ground'], note: 'a rare harvest: once in decades a hyperbamboo grove flowers together and dies, and the valley gathers its seed'});
R('measuremelon', 'Measure melon', 'fruit', [3, 4], [1, 3], {form: 'vine', card: 'card.crop.melon', src: 'cut', home: ['cut'], stores: ['fresh'], stuck: .14, note: 'ripens in exactly three sizes; a share stuck unripe at the smallest for ever. a market measure in Dilihan is so many melons'});
/* ---- the Bowl's halophytes (biomes/sedesert/PLAN-BOWL.md section 4; drawn on its station 2) */
R('glasswort', 'Glasswort (sea asparagus)', 'vegetable', [3, 5], [0, 3], {also: ['oil'], needs: 'salt', card: 'card.samphire', src: 'sedesert', home: ['sedesert'], stores: ['fresh', 'pressed'], note: 'Salicornia: the jointed shoots in spring, an oil seed in autumn when it turns crimson'});
R('tamarisk-manna', 'Tamarisk manna', 'sweetener', [3, 5], [0, 2], {form: 'tree', card: 'card.tamarisk', src: 'sedesert', home: ['sedesert'], stores: ['dried'], yield: 0.5, note: 'the sweet secretion scale insects leave on tamarisk twigs: gathered, not sown'});
R('saxaul', 'Saxaul wood', 'fuel', [3, 5], [0, 1], {form: 'tree', src: 'sedesert', home: ['sedesert'], stores: ['dried'], note: 'Haloxylon: the densest firewood there is, and charcoal'});
R('brine-lamp', 'Brine lamp', 'medicine', [4, 5], [0, 1], {needs: 'salt', card: 'card.brinelamp', src: 'sedesert', home: ['sedesert'], stores: ['dried'], note: "Krator's: the crystal-crusted leaf, steeped, is a salt-and-bitters remedy for heat sickness"});
/* ---- the steppe fringe (biomes/sedesert/PLAN-STEPPE.md; drawn on its station 3) */
R('myrrh', 'Myrrh', 'medicine', [4, 5], [0, 2], {form: 'tree', also: ['fuel'], src: 'sedesert', home: ['sedesert'], stores: ['dried'], note: "Commiphora: the resin bled from the peeling bark; a wound wash and an incense, the merchant houses' second trade"});

