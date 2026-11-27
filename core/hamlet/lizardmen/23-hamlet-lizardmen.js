/* ==================== core/hamlet 23 (opt-in): the Lizardmen row (plain data, [G data]) ==================== */
/* settlements/gila/PLAN.md sections 1 and 7 (step G2; agreed by the owner 2026-11-16). OPT-IN: this file sits in a subfolder
   no build lists unless it asks for it by name, so no other page's bytes change (core/hamlet/lizardmen/README.md). Load it
   after 20-hamlet-cultures.js; it registers at load:
     KHAMLET.CULTURES.lizardmen   the Rift-floor Lizardmen's hamlet row on kits/lizardmen (and Gila's salt pieces gl-pans,
                                  gl-saltstore). No shops or coin (DESIGN.md section 4): general is lz-medicine, civic lz-seer,
                                  religious lz-nest, food lz-granary, warehouse lz-warehouse; castes live in communal dwellings
                                  (a clutch-unit of ~10 per household slot: warrens and longhouses hold 3, lodges 3, makers 1,
                                  an Interpreter's tower 1 as head).
   Keys a host may not carry (gl-pans and gl-saltstore outside Gila; lz-weir, lz-mine and lz-quarry, owed on kits/lizardmen
   KNOWN_ISSUES.md) have pending boxes so KHAMLET.village places them without error and marks rec.pending when dims(key) is null. */
(function () {
  if (typeof KHAMLET === 'undefined' || !KHAMLET.CULTURES || !KHAMLET.FOCI) throw new Error('core/hamlet/lizardmen: load core/hamlet 10 and 20 first');
  KHAMLET.CULTURES.lizardmen = {
    kit: 'lizardmen', household: 10, workShare: 0.55, slopeMax: 0.25,
    religious: 'lz-nest', civic: 'lz-seer', general: 'lz-medicine',
    food: 'lz-granary',
    warehouse: 'lz-warehouse',
    services: { religious: 6, civic: 4, general: 2, food: 4, warehouse: 4 },
    houses: {
      poor: [['lz-makers', 1, 3], ['lz-warren', 3, 2]],
      middling: [['lz-longhouse', 3, 3], ['lz-lodge', 3, 2]],
      head: [['lz-tower', 1, 1]],
      middlingShare: 0.45
    },
    works: {
      salt: [{ key: 'gl-pans', jobs: 12, share: 0.7 }, { key: 'gl-saltstore', jobs: 6, share: 0.3 }],
      farming: [{ key: 'lz-farm', jobs: 12, share: 0.75 }, { key: 'lz-granary', jobs: 4, share: 0.15 }, { key: 'lz-windmill', jobs: 4, share: 0.1 }],
      ranch: [{ key: 'lz-farm', jobs: 10, share: 0.7 }, { key: 'lz-hall-bone', jobs: 8, share: 0.3 }],
      fishing: [{ key: 'lz-weir', jobs: 10, share: 0.75 }, { key: 'lz-hall-reed', jobs: 6, share: 0.25 }],
      mine: [{ key: 'lz-mine', jobs: 14, share: 0.7 }, { key: 'lz-hall-bronze', jobs: 8, share: 0.3 }],
      quarry: [{ key: 'lz-quarry', jobs: 12, share: 0.7 }, { key: 'lz-hall-bronze', jobs: 8, share: 0.3 }]
    },
    focusJobs: { salt: 90, farming: 120, ranch: 72, fishing: 80, mine: 96, quarry: 60 },
    reach: { salt: 350, farming: 600, ranch: 700, fishing: 280, mine: 450, quarry: 350 },
    pending: {
      'gl-pans': { w: 30, d: 30, h: 2.6, what: 'squared-spiral evaporating salt pans (settlements/gila)' },
      'gl-saltstore': { w: 16, d: 13, h: 9.4, what: 'reed salt store on a channelled brick podium (settlements/gila)' },
      'lz-weir': { w: 18, d: 14, h: 5.5, what: 'Rift fishing weir and drying racks (kits/lizardmen KNOWN_ISSUES.md)' },
      'lz-mine': { w: 16, d: 14, h: 7.5, what: 'copper and sulfur mine head (kits/lizardmen KNOWN_ISSUES.md)' },
      'lz-quarry': { w: 20, d: 18, h: 5.0, what: 'basalt quarry pit and splitting yard (kits/lizardmen KNOWN_ISSUES.md)' }
    }
  };
})();
