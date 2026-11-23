/* ==================== the Crops kit: giant mound-termite hive fungi ([G data]) ==================== */
/* Cultivated inside the air-conditioned red-clay flues of giant (cat-to-wolf-sized) cathedral-mound termites
   strictly in SW Bay's Aw upland savanna (biomes/swbay) and northern Crater Drylands' savanna edge (biomes/crater-drylands
   station `edge`). Termite workers strip grass, standing grain/cotton crops, and timber to build subterranean chewed-comb
   gardens inoculated with monoculture Termitomyces-like mycelium, guarded by wolf-sized mandibulate & nasute soldiers. */

CROPS.def('hive-comb', 'Termite hive-comb', 'mushroom', [3, 5], [0, 3], {
  also: ['reagent', 'medicine'],
  atm: [1, 2],
  form: 'fungus',
  grown: 'underground',
  water: 'bed',
  works: 'termite-hive',
  home: ['swbay', 'crater-drylands'],
  homeOnly: true,
  card: 'card.mushroom.pale',
  src: 'swbay',
  hazard: 'wolf-sized mandibulate and nasute acid-spraying soldier termites guard the live mound chambers',
  stores: ['dried', 'fermented', 'fresh'],
  note: 'spongy amber-white monoculture fungus comb raised by giant mound-termites on chewed savanna grass and raided crop stalks inside cathedral flues; rich protein delicacy, enzymatic ferment starter, and poultice reagent taken by smoking live mounds'
});

CROPS.def('mound-cap', 'Cathedral titan-cap', 'mushroom', [3, 5], [1, 3], {
  also: ['vegetable'],
  atm: [1, 2],
  form: 'fungus',
  home: ['swbay', 'crater-drylands'],
  homeOnly: true,
  card: 'card.mushroom.pale',
  src: 'swbay',
  hazard: 'foraging giant termite soldiers patrol the mound skirt and mob cattle or gatherers',
  stores: ['fresh', 'dried'],
  note: 'Termitomyces titanicus analogue: broad 0.6-1.1 m ivory-and-ochre gilled caps sent up through the clay skirt of live termite cathedrals after the first monsoon rains in SW Bay and northern Crater Drylands'
});
