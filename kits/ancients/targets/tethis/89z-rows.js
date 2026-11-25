/* TARGET: tethis — Tethis, the Pelagic Saucer Arcology in the Shallow Sea (intact Ancient west, Hykkousoi modern east). */
const TITLE = 'Tethis — the pelagic saucer arcology';
const GROUND_C = 0;
const GROUND_S = 18000;
const DECAYS = [0, 1];
/* s = 1750: each 1,448 m arcology sits on its own coral shoal with 2,050 m of open shallow sea between them */
const ROWS = {
  tethis: { z: 0, s: 1750, r: 740 }
};
const RUINS = [[-1750, 0, 600], [1750, 0, 760]];
const EXTRA_BUILDERS = { tethis: buildTethis };
