/* ==================== the Crops kit: the Vale's wild medicinal plants (plain data, [G data]) ==================== */
/* The Vale of Xanadu's medicinal plants as records (the owner, 2026-11-16, settlements/viridian/PLAN.md question 5: "y").
   The biome kit draws them and tags them medicinal (biomes/xanadu/src/50-biome-xanadu-species.js, HV(..., true, note));
   here they are crops too, so the Order of Viridian Thought's physic garden and dry garden can grow them. Home 'xanadu':
   always plausible in the Vale, wild. Their ranges are the plants' own: the mist belt's (ginkgo, cloud pine, frost willow,
   the beard moss) and the dry spur's (whorl olive, silverscrub).
   OPT-IN: no build lists this file but the kit's own sheet (which reads all of src/) and settlements/viridian; the other
   builds that take the kit name their four files (10, 20, 22, 40), so their pages do not move. */
R('ginkgo-leaf', 'Ginkgo leaf', 'herb', [1, 3], [2, 4], {also: ['medicine', 'beverage'], form: 'tree', src: 'xanadu', home: ['xanadu'], stores: ['dried'],
  note: 'the fan-shaped leaves picked green and dried: the memory tea (the biome kit\'s ginkgo); the roasted kernels are a little food'});
R('cloudpine-resin', 'Cloud-pine resin', 'medicine', [1, 3], [1, 4], {also: ['reagent', 'fuel'], form: 'tree', src: 'xanadu', home: ['xanadu'], stores: ['dried'],
  note: 'bled from scored cloud pines and set in the pot: the resin salve for cuts and chapped hands; the hardened tears burn as torch resin'});
R('frost-willow-bark', 'Frost-willow bark', 'medicine', [0, 3], [2, 4], {also: ['herb'], form: 'tree', src: 'xanadu', home: ['xanadu'], stores: ['dried'],
  note: 'the inner bark stripped in spring and dried in quills: the pain tea (salicin), against fever and the joints\' ache'});
R('beard-moss', 'Beard moss', 'medicine', [1, 3], [3, 4], {form: 'lichen', src: 'xanadu', home: ['xanadu'], stores: ['dried'],
  note: 'the grey beards hanging from the beard trees in the mist: packed into wounds and dried for dressings (as Usnea)'});
R('whorl-olive-leaf', 'Whorl-olive leaf', 'medicine', [2, 3], [1, 3], {also: ['herb'], form: 'tree', src: 'xanadu', home: ['xanadu'], stores: ['dried'],
  note: 'the leaves of the banded olive, steeped: the fever tea; the fruit is the biome kit\'s cured olive'});
R('silverscrub', 'Silverscrub', 'herb', [1, 3], [0, 2], {also: ['medicine', 'fuel'], form: 'shrub', src: 'xanadu', home: ['xanadu'], stores: ['dried'],
  note: 'a silver wormwood of the dry slopes: the bitter tea for the stomach and against worms; its dead wood is kindling'});
