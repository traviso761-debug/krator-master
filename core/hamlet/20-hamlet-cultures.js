/* ==================== core/hamlet 20: the culture rows (plain data, [G data]) ==================== */
/* core/hamlet/PLAN.md section 3. A culture row says which buildings a village of that culture is made of, so a Voth, Iziz
   or nomad hamlet is another row and the same code. Keys are the building kit's def keys; the host's dims(key) gives
   their footprints. A key the kit does not have yet is listed under `pending` with a declared box: the generator places
   its footprint, and the host draws a stand-in until the kit has the building (PLAN.md section 3 lists them).
     household          people a household
     workShare          the share of a village that works
     slopeMax           the steepest ground a building stands on (rise over run)
     religious, civic, general, food, warehouse   one key each (the warehouse may repeat)
     services           jobs at each of those
     houses             [key, households it holds, weight] by class: poor and middling are drawn by weight; head is the
                        headman's (one)
     works[focus]       [{key, jobs, share}]: the works a focus is staffed by, the jobs each building holds, and the
                        share of the focus's jobs it takes
     focusJobs[focus]   the jobs a focus wants when the resource gives no count (a node never runs out)
     reach[focus]       how far from the village point its works may stand (m): a mine within its node's radius */
KHAMLET.CULTURES = KHAMLET.CULTURES || {};
KHAMLET.CULTURES.islander_east = {
  kit: 'islanders', household: 4.5, workShare: 0.45, slopeMax: 0.35,
  religious: 'ip-shrine', civic: 'ie-hall', general: 'ie-trader',
  food: 'ie-market',                 /* stands in for a small food store (pending: hamlet-store-food) */
  warehouse: 'ie-warehouse',
  services: {religious: 2, civic: 3, general: 2, food: 3, warehouse: 4},
  houses: {
    poor: [['ie-hut-garden', 1, 3], ['ie-house-shared', 2, 3], ['ie-house-uma', 3, 1]],
    middling: [['ie-house-long', 3, 2], ['ie-house-twin', 2, 2], ['ie-house-cross', 2, 1], ['ie-house-clan', 4, 1]],
    head: [['ie-house-chief', 1, 1]],
    middlingShare: 0.35
  },
  works: {
    salt: [{key: 'ie-saltworks', jobs: 12, share: 1}],
    mine: [{key: 'ie-mine', jobs: 20, share: 1}],
    lumber: [{key: 'hamlet-sawpit', jobs: 14, share: 0.7}, {key: 'hamlet-kiln', jobs: 6, share: 0.3}],
    ranch: [{key: 'ie-byre', jobs: 6, share: 0.35}, {key: 'ie-pens', jobs: 4, share: 0.15}, {key: 'hamlet-corral', jobs: 4, share: 0.2},
            {key: 'hamlet-stable', jobs: 6, share: 0.2}, {key: 'hamlet-rookery', jobs: 6, share: 0.1}],
    fishing: [{key: 'ie-fishdock', jobs: 12, share: 0.7}, {key: 'ie-canoeshed', jobs: 8, share: 0.3}],
    farming: [{key: 'ie-farm', jobs: 10, share: 0.85}, {key: 'ie-granary', jobs: 2, share: 0.15}]
  },
  focusJobs: {salt: 110, mine: 120, lumber: 100, ranch: 70, fishing: 100, farming: 140},
  reach: {salt: 300, mine: 400, lumber: 600, ranch: 900, fishing: 250, farming: 700},
  /* the boxes of the buildings the kit does not have yet (PLAN.md section 3; textures listed before they are built) */
  pending: {
    'hamlet-sawpit': {w: 18, d: 12, h: 7, what: 'sawpit and log yard'},
    'hamlet-kiln': {w: 10, d: 10, h: 6, what: 'charcoal kiln'},
    'hamlet-corral': {w: 28, d: 22, h: 2.4, what: 'corral'},
    'hamlet-stable': {w: 20, d: 12, h: 9, what: 'beast rider stable (kits/beast-riders)'},
    'hamlet-rookery': {w: 12, d: 12, h: 16, what: 'beast rider rookery (kits/beast-riders)'},
    'hamlet-store-food': {w: 10, d: 9, h: 9, what: 'a small food store'}
  }
};
KHAMLET.FOCI = ['salt', 'mine', 'lumber', 'ranch', 'fishing', 'farming'];
