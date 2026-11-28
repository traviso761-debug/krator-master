/* ================================================================= ARCOFORTE — interiors: living, work, and recreation ([G data])
   Plans out the interiors across all six zones of Arcoforte so the complex can stand, in refurbished form, as the
   centerpiece of a new settlement (`PLAN.md` section 2):
     - LIVING: sloped-terrace apartments in the 9 Neocliff Bastions, radial atrium apartments in the Domed Rotunda,
               cellular sky-tray dwellings in the 7 Sea-Cliff Skyscrapers, upper live-over-work flats in the Linear City.
     - WORK:   cliff-foot Fishing, Cold-Storage, Sail Loft & Boatyard Hall; City Center vaulted markets, workshops,
               clinic, school & counting houses; Linear City customs & warehouses; Skyscraper Living-Working studios;
               and the sealed/ruined Sub-Cliff Automated Industry Vaults (kept intact only in `?state=intact`).
     - REC:    Domed Rotunda Grand Reception Concourse, Refectory & Observatory; Promenade Mushroom-Pier Belvederes
               (sea-view tavern, bathhouse, reading pavilion, conservatory); 300 m Sky-Crown Cultural Assembly Hall,
               Hanging Sky-Garden & Chart Deck; Linear City travellers tavern; Central Park Amphitheatre.

   Uses `kits/ancients-interiors` plates (`AI.ringPlate`, `AI.barPlate`, `AI.hallPlate`, `AI.gridPlate`) and hall recipes.
   Every room carries `sector` ('living' | 'work' | 'rec' | 'infra') and `kept` (boolean). Pure [G data]: no Three.js, no DOM. */
const AF_INT = (function () {
  'use strict';
  const PI = Math.PI, D2R = PI / 180;
  const r2 = v => Math.round(v * 100) / 100;
  const cyc = arr => (i => arr[i % arr.length]);
  const rectPoly = (x0, x1, z0, z1) => [[r2(x0), r2(z0)], [r2(x1), r2(z0)], [r2(x1), r2(z1)], [r2(x0), r2(z1)]];

  /* Culture socket profiles: maps a socket name onto the catalog culture, allowed fallback list, and hall-recipe dress */
  const SOCKETS = {
    refurbished: {
      label: 'Refurbished (Ancient + Settler Salvage)',
      culture: 'post-apoc',
      cultures: ['ancient', 'post-apoc', 'scrap', 'generic'],
      dress: 'occupied',
      wealth: 0.58
    },
    ancient: {
      label: 'Intact Ancient',
      culture: 'ancient',
      cultures: ['ancient', 'generic'],
      dress: 'ancient',
      wealth: 0.78
    },
    scrap: {
      label: 'Frontier Scrap Settlers',
      culture: 'scrap',
      cultures: ['scrap', 'post-apoc', 'generic'],
      dress: 'occupied',
      wealth: 0.35
    },
    iziz: {
      label: 'Izani Imperial Refit',
      culture: 'iziz',
      cultures: ['iziz', 'ancient', 'generic'],
      dress: 'iziz',
      wealth: 0.65
    },
    xanadu: {
      label: 'Xanadu Sultanate Refit',
      culture: 'xanadu',
      cultures: ['xanadu', 'ancient', 'generic'],
      dress: 'xanadu',
      wealth: 0.65
    },
    republican: {
      label: 'Highland Republic Refit',
      culture: 'republican',
      cultures: ['republican', 'ancient', 'generic'],
      dress: 'republican',
      wealth: 0.62
    },
    fleetborn: {
      label: 'Fleet-born Caretakers (cFlit-qBon)',
      culture: 'fleetborn',
      cultures: ['fleetborn', 'ancient', 'generic', 'generic-goods'],
      dress: 'fleetborn',
      wealth: 0.56,
      zones: ['bastions', 'ring']
    },
    shorekin: {
      label: 'Shore-kin Harbour & Yard Crew',
      culture: 'shorekin',
      cultures: ['shorekin', 'generic', 'generic-goods'],
      dress: 'shorekin',
      wealth: 0.48,
      zones: ['harbour']
    }
  };

  /* Pure [G data] palettes & part descriptors for Fleet-born (cFlit-qBon) and Shore-kin (Arch local & sea materials ONLY —
     zero nephrite, zero red cypress). Built on demand via KratorFurniture's frame methods without Three.js in this fragment. */
  const PALETTES = {
    fleetborn: {
      catechuRed: 0x9e3426, catechuLight: 0xb84635, catechuDark: 0x6e2016,
      paktong: 0xcad0cc, paktongDark: 0x8e9692,
      lithoStone: 0x3a4046, lithoLight: 0x565e66,
      byssusGold: 0xc89b42, byssusPale: 0xdcb668,
      seaBone: 0xe6dfd0, boneDark: 0xc2b8a4,
      driftSlate: 0x48443e, driftTimber: 0x6e5a46, oilGlow: 0xffb858
    },
    shorekin: {
      araucaria: 0xb89664, araucariaDark: 0x8c6d43,
      mangrove: 0x5c3426, mangroveDark: 0x3e2218,
      travertine: 0xdcd4c2, travertineVein: 0xc2b8a3,
      limewash: 0xf0ece2, slate: 0x2f3538,
      pandanus: 0xc4a45e, coir: 0x8f6e44,
      pitch: 0x1c1a18, iron: 0x44474a, ember: 0xe07830, flame: 0xffb44c
    }
  };

  const ALL_ROOMS = ['hall', 'bedroom', 'dormitory', 'barracks', 'kitchen', 'tavern', 'workshop', 'store',
    'sailloft', 'shrine', 'study', 'library', 'school', 'sickbay', 'chartroom', 'strongroom', 'armoury', 'laundry', 'bath', 'antechamber'];

  const SOCKET_PIECES = [
    /* ---------------- FLEET-BORN (cFlit-qBon) CARETAKER FITTINGS ---------------- */
    {
      key: 'af_fleetborn_hammock_gallery', name: 'Catechu-red slung hammock gallery', culture: 'fleetborn',
      type: 'bed', role: 'bunk', anchor: 'floor', w: 2.04, d: 0.96, h: 1.82,
      clearance: { front: 0.5 }, rooms: ['bedroom', 'dormitory', 'barracks', 'sickbay', 'hall'],
      materials: ['metal', 'cloth', 'rope', 'bone'], task: ['sleeping'],
      parts: [
        ['cy', -0.94, 0, -0.40, 0.035, 1.80, 0, 'paktong', 'metal'],
        ['cy', 0.94, 0, -0.40, 0.035, 1.80, 0, 'paktong', 'metal'],
        ['cy', -0.94, 0, 0.40, 0.035, 1.80, 0, 'paktong', 'metal'],
        ['cy', 0.94, 0, 0.40, 0.035, 1.80, 0, 'paktong', 'metal'],
        ['bx', -0.94, 0.88, 0, 0.14, 0.05, 0.06, 0, 'paktongDark', 'metal'],
        ['bx', 0.94, 0.88, 0, 0.14, 0.05, 0.06, 0, 'paktongDark', 'metal'],
        ['rd', -0.94, 1.74, -0.40, 0.94, 1.74, -0.40, 0.025, 'paktongDark', 'metal'],
        ['rd', -0.94, 1.74, 0.40, 0.94, 1.74, 0.40, 0.025, 'paktongDark', 'metal'],
        ['bx', 0, 0.46, 0, 1.56, 0.10, 0.68, 0, 'catechuRed', 'cloth'],
        ['pl', -0.62, 0.56, 0, 0.28, 0.10, 0.52, 0, 'byssusPale', 'cloth'],
        ['rd', -0.94, 0.64, 0, -0.76, 0.50, 0, 0.018, 'catechuDark', 'rope'],
        ['rd', 0.94, 0.64, 0, 0.76, 0.50, 0, 0.018, 'catechuDark', 'rope'],
        ['bx', 0, 1.24, 0, 1.56, 0.10, 0.68, 0, 'catechuLight', 'cloth'],
        ['pl', -0.62, 1.34, 0, 0.28, 0.10, 0.52, 0, 'seaBone', 'bone'],
        ['rd', -0.94, 1.44, 0, -0.76, 1.28, 0, 0.018, 'catechuDark', 'rope'],
        ['rd', 0.94, 1.44, 0, 0.76, 1.28, 0, 0.018, 'catechuDark', 'rope']
      ]
    },
    {
      key: 'af_fleetborn_dive_rack', name: 'Free-dive stone-weight, bone-goggle & paktong-spear rack', culture: 'fleetborn',
      type: 'rack', anchor: 'wall', surface: false, w: 1.44, d: 0.44, h: 1.90,
      clearance: { front: 0.48 }, rooms: ['bedroom', 'dormitory', 'barracks', 'armoury', 'workshop', 'store', 'hall', 'study', 'bath', 'laundry', 'school'],
      materials: ['timber', 'stone', 'bone', 'metal'], task: ['storage'],
      parts: [
        ['bx', 0, 0.18, -0.19, 1.40, 1.56, 0.06, 0, 'driftTimber', 'wood'],
        ['bx', -0.66, 0, -0.02, 0.06, 1.76, 0.38, 0, 'driftTimber', 'wood'],
        ['bx', 0.66, 0, -0.02, 0.06, 1.76, 0.38, 0, 'driftTimber', 'wood'],
        ['bx', 0, 0.22, 0, 1.36, 0.05, 0.36, 0, 'driftSlate', 'stone'],
        ['bx', 0, 0.88, -0.02, 1.36, 0.04, 0.32, 0, 'paktongDark', 'metal'],
        /* Grooved basalt free-dive descent stone weights */
        ['cy', -0.44, 0.27, 0.02, 0.09, 0.22, 0, 'lithoStone', 'stone'],
        ['cy', -0.15, 0.27, 0.02, 0.09, 0.22, 0, 'lithoLight', 'stone'],
        ['cy', 0.15, 0.27, 0.02, 0.09, 0.22, 0, 'lithoStone', 'stone'],
        ['cy', 0.44, 0.27, 0.02, 0.09, 0.22, 0, 'lithoLight', 'stone'],
        /* Slit sea-bone free-dive goggles */
        ['bx', -0.38, 0.92, 0.02, 0.20, 0.07, 0.10, 0, 'seaBone', 'bone'],
        ['bx', 0, 0.92, 0.02, 0.20, 0.07, 0.10, 0, 'seaBone', 'bone'],
        ['bx', 0.38, 0.92, 0.02, 0.20, 0.07, 0.10, 0, 'boneDark', 'bone'],
        /* Silvery paktong fish & dive spears */
        ['cy', -0.48, 0.28, -0.08, 0.016, 1.60, 0, 'paktong', 'metal'],
        ['cy', -0.20, 0.28, -0.08, 0.016, 1.60, 0, 'paktong', 'metal'],
        ['cy', 0.20, 0.28, -0.08, 0.016, 1.60, 0, 'paktong', 'metal'],
        ['cy', 0.48, 0.28, -0.08, 0.016, 1.60, 0, 'paktong', 'metal']
      ]
    },
    {
      key: 'af_fleetborn_lithophone', name: 'Suspended resonant stone lithophone', culture: 'fleetborn',
      type: 'altar', anchor: 'floor', surface: false, w: 1.56, d: 0.62, h: 1.56,
      clearance: { front: 0.5 }, rooms: ['shrine', 'hall', 'tavern', 'study', 'library', 'school'],
      materials: ['metal', 'stone', 'rope', 'bone'], task: ['praying', 'socializing'],
      parts: [
        ['bx', -0.68, 0, 0, 0.14, 0.08, 0.56, 0, 'lithoStone', 'stone'],
        ['bx', 0.68, 0, 0, 0.14, 0.08, 0.56, 0, 'lithoStone', 'stone'],
        ['cy', -0.68, 0.08, 0, 0.035, 1.44, 0, 'paktong', 'metal'],
        ['cy', 0.68, 0.08, 0, 0.035, 1.44, 0, 'paktong', 'metal'],
        ['bx', 0, 1.48, 0, 1.52, 0.06, 0.10, 0, 'paktongDark', 'metal'],
        /* 7 graduated suspended resonant phonolite chime bars */
        ['bx', -0.48, 0.42, 0, 0.11, 0.94, 0.05, 0, 'lithoStone', 'stone'],
        ['bx', -0.32, 0.48, 0, 0.11, 0.88, 0.05, 0, 'lithoLight', 'stone'],
        ['bx', -0.16, 0.54, 0, 0.11, 0.82, 0.05, 0, 'lithoStone', 'stone'],
        ['bx', 0, 0.60, 0, 0.11, 0.76, 0.05, 0, 'lithoLight', 'stone'],
        ['bx', 0.16, 0.66, 0, 0.11, 0.70, 0.05, 0, 'lithoStone', 'stone'],
        ['bx', 0.32, 0.72, 0, 0.11, 0.64, 0.05, 0, 'lithoLight', 'stone'],
        ['bx', 0.48, 0.78, 0, 0.11, 0.58, 0.05, 0, 'lithoStone', 'stone'],
        ['rd', -0.48, 1.36, 0, -0.48, 1.48, 0, 0.01, 'catechuRed', 'rope'],
        ['rd', 0, 1.36, 0, 0, 1.48, 0, 0.01, 'catechuRed', 'rope'],
        ['rd', 0.48, 1.36, 0, 0.48, 1.48, 0, 0.01, 'catechuRed', 'rope'],
        ['bx', 0, 0.24, 0.18, 0.42, 0.04, 0.10, 0, 'seaBone', 'bone']
      ]
    },
    {
      key: 'af_fleetborn_lithophone_stand', name: 'Gallery resonant stone lithophone stand', culture: 'fleetborn',
      type: 'statue', anchor: 'floor', surface: false, w: 1.18, d: 0.58, h: 1.62,
      clearance: { front: 0.45 }, rooms: ['hall', 'shrine', 'study', 'library', 'antechamber', 'tavern'],
      materials: ['metal', 'stone', 'rope'], task: ['socializing'],
      parts: [
        ['cy', 0, 0, 0, 0.26, 0.10, 0, 'lithoStone', 'stone'],
        ['cy', -0.48, 0.06, 0, 0.03, 1.50, 0, 'paktong', 'metal'],
        ['cy', 0.48, 0.06, 0, 0.03, 1.50, 0, 'paktong', 'metal'],
        ['bx', 0, 1.54, 0, 1.12, 0.06, 0.10, 0, 'paktong', 'metal'],
        ['bx', -0.30, 0.48, 0, 0.12, 0.96, 0.05, 0, 'lithoStone', 'stone'],
        ['bx', -0.10, 0.56, 0, 0.12, 0.88, 0.05, 0, 'lithoLight', 'stone'],
        ['bx', 0.10, 0.64, 0, 0.12, 0.80, 0.05, 0, 'lithoStone', 'stone'],
        ['bx', 0.30, 0.72, 0, 0.12, 0.72, 0.05, 0, 'lithoLight', 'stone']
      ]
    },
    {
      key: 'af_fleetborn_paktong_lamp', name: 'Paktong cleat & sea-oil lamp stand', culture: 'fleetborn',
      type: 'lamp', anchor: 'floor', surface: false, w: 0.46, d: 0.46, h: 1.56,
      clearance: {}, rooms: ALL_ROOMS,
      materials: ['metal', 'stone', 'emissive'], task: [],
      parts: [
        ['cy', 0, 0, 0, 0.20, 0.08, 0, 'lithoStone', 'stone'],
        ['cy', 0, 0.08, 0, 0.03, 1.26, 0, 'paktong', 'metal'],
        ['bx', 0, 0.78, 0, 0.28, 0.04, 0.05, 0, 'paktongDark', 'metal'],
        ['fs', 0, 1.32, 0, 0.08, 0.16, 0.12, 0, 'paktong', 'metal', 12],
        ['bl', 0, 1.48, 0, 0.08, 'oilGlow', 'glow']
      ]
    },
    {
      key: 'af_fleetborn_hanging_lamp', name: 'Hung paktong cleat oil lantern', culture: 'fleetborn',
      type: 'lamp', anchor: 'ceiling', surface: false, w: 0.50, d: 0.50, h: 0.76,
      clearance: {}, rooms: ALL_ROOMS,
      materials: ['metal', 'emissive'], task: [],
      parts: [
        ['cy', 0, 0.68, 0, 0.08, 0.08, 0, 'paktongDark', 'metal'],
        ['cy', 0, 0.24, 0, 0.015, 0.46, 0, 'paktong', 'metal'],
        ['fs', 0, 0.12, 0, 0.22, 0.08, 0.14, 0, 'paktong', 'metal', 12],
        ['bl', 0, 0.09, 0, 0.08, 'oilGlow', 'glow']
      ]
    },
    {
      key: 'af_fleetborn_byssus_curtain', name: 'Spun sea-byssus partition curtain', culture: 'fleetborn',
      type: 'screen', anchor: 'floor', surface: false, w: 1.60, d: 0.32, h: 1.88,
      clearance: { front: 0.3 }, rooms: ['bedroom', 'dormitory', 'hall', 'study', 'tavern', 'bath', 'sickbay', 'antechamber'],
      materials: ['metal', 'cloth', 'stone', 'bone'], task: [],
      parts: [
        ['bx', -0.72, 0, 0, 0.12, 0.06, 0.28, 0, 'lithoStone', 'stone'],
        ['bx', 0.72, 0, 0, 0.12, 0.06, 0.28, 0, 'lithoStone', 'stone'],
        ['cy', -0.72, 0.06, 0, 0.025, 1.80, 0, 'paktong', 'metal'],
        ['cy', 0.72, 0.06, 0, 0.025, 1.80, 0, 'paktong', 'metal'],
        ['rd', -0.76, 1.82, 0, 0.76, 1.82, 0, 0.022, 'paktong', 'metal'],
        ['bx', -0.34, 0.18, 0, 0.64, 1.60, 0.04, 0, 'byssusGold', 'cloth'],
        ['bx', 0.34, 0.18, 0, 0.64, 1.60, 0.04, 0, 'byssusPale', 'cloth'],
        ['bx', 0, 0.22, 0, 1.32, 0.12, 0.05, 0, 'catechuRed', 'cloth']
      ]
    },
    {
      key: 'af_fleetborn_tally_board', name: 'Fleet-born clan tally board (cFlit-qBon)', culture: 'fleetborn',
      type: 'board', anchor: 'wall', surface: false, w: 1.40, d: 0.18, h: 1.44,
      clearance: { front: 0.45 }, rooms: ['hall', 'study', 'chartroom', 'store', 'workshop', 'tavern', 'school', 'library'],
      materials: ['stone', 'metal', 'bone', 'rope'], task: ['reading', 'writing'],
      parts: [
        ['bx', -0.62, 0, -0.05, 0.06, 1.42, 0.08, 0, 'paktongDark', 'metal'],
        ['bx', 0.62, 0, -0.05, 0.06, 1.42, 0.08, 0, 'paktongDark', 'metal'],
        ['bx', 0, 0.44, -0.05, 1.34, 0.96, 0.08, 0, 'driftSlate', 'stone'],
        ['rd', -0.58, 1.18, 0.02, 0.58, 1.18, 0.02, 0.012, 'catechuRed', 'rope'],
        ['rd', -0.58, 0.92, 0.02, 0.58, 0.92, 0.02, 0.012, 'catechuRed', 'rope'],
        ['rd', -0.58, 0.66, 0.02, 0.58, 0.66, 0.02, 0.012, 'catechuRed', 'rope'],
        ['bx', -0.36, 1.12, 0.03, 0.08, 0.12, 0.03, 0, 'seaBone', 'bone'],
        ['bx', 0.06, 1.12, 0.03, 0.08, 0.12, 0.03, 0, 'paktong', 'metal'],
        ['bx', 0.38, 0.86, 0.03, 0.08, 0.12, 0.03, 0, 'seaBone', 'bone'],
        ['bx', -0.18, 0.60, 0.03, 0.08, 0.12, 0.03, 0, 'byssusGold', 'cloth']
      ]
    },
    {
      key: 'af_fleetborn_byssus_banner', name: 'Catechu & spun sea-byssus clan hanging', culture: 'fleetborn',
      type: 'banner', hung: 'top', anchor: 'wall', surface: false, w: 1.06, d: 0.12, h: 1.50,
      clearance: {}, rooms: ['hall', 'tavern', 'shrine', 'bedroom', 'barracks', 'study', 'antechamber'],
      materials: ['cloth', 'metal', 'bone'], task: [],
      parts: [
        ['bx', 0, 1.44, -0.03, 1.04, 0.05, 0.06, 0, 'paktong', 'metal'],
        ['bx', 0, 0.08, -0.03, 0.88, 1.36, 0.04, 0, 'catechuRed', 'cloth'],
        ['bx', 0, 0.28, -0.01, 0.52, 0.92, 0.04, 0, 'byssusGold', 'cloth'],
        ['bl', -0.50, 1.46, -0.03, 0.03, 'seaBone', 'bone'],
        ['bl', 0.50, 1.46, -0.03, 0.03, 'seaBone', 'bone']
      ]
    },
    {
      key: 'af_fleetborn_table', name: 'Paktong-cleated driftwood mess table', culture: 'fleetborn',
      type: 'table', anchor: 'floor', w: 1.76, d: 0.88, h: 0.76,
      clearance: { front: 0.5, back: 0.5 }, rooms: ['hall', 'tavern', 'kitchen', 'sailloft', 'library', 'chartroom', 'workshop'],
      materials: ['timber', 'metal'], task: ['eating', 'socializing'],
      parts: [
        ['bx', 0, 0.70, 0, 1.74, 0.06, 0.86, 0, 'driftTimber', 'wood'],
        ['cy', -0.74, 0, -0.34, 0.04, 0.70, 0, 'paktongDark', 'metal'],
        ['cy', 0.74, 0, -0.34, 0.04, 0.70, 0, 'paktongDark', 'metal'],
        ['cy', -0.74, 0, 0.34, 0.04, 0.70, 0, 'paktongDark', 'metal'],
        ['cy', 0.74, 0, 0.34, 0.04, 0.70, 0, 'paktongDark', 'metal'],
        ['bx', 0, 0.71, 0, 1.76, 0.04, 0.06, 0, 'paktong', 'metal']
      ]
    },
    {
      key: 'af_fleetborn_low_table', name: 'Low basalt & paktong tea slab', culture: 'fleetborn',
      type: 'table', role: 'low_table', anchor: 'floor', w: 1.10, d: 0.58, h: 0.42,
      clearance: { front: 0.4 }, rooms: ['hall', 'tavern', 'bedroom'],
      materials: ['stone', 'metal'], task: ['eating', 'socializing'],
      parts: [
        ['bx', 0, 0.36, 0, 1.08, 0.06, 0.56, 0, 'lithoStone', 'stone'],
        ['bx', -0.42, 0, 0, 0.08, 0.36, 0.46, 0, 'paktongDark', 'metal'],
        ['bx', 0.42, 0, 0, 0.08, 0.36, 0.46, 0, 'paktongDark', 'metal']
      ]
    },
    {
      key: 'af_fleetborn_bench', name: 'Catechu-corded paktong bench', culture: 'fleetborn',
      type: 'bench', anchor: 'floor', w: 1.48, d: 0.44, h: 0.46,
      clearance: { front: 0.45 }, rooms: ALL_ROOMS,
      materials: ['metal', 'cloth', 'timber'], task: ['resting', 'socializing'],
      parts: [
        ['bx', 0, 0.40, 0, 1.46, 0.06, 0.42, 0, 'catechuRed', 'cloth'],
        ['cy', -0.62, 0, -0.16, 0.03, 0.40, 0, 'paktong', 'metal'],
        ['cy', 0.62, 0, -0.16, 0.03, 0.40, 0, 'paktong', 'metal'],
        ['cy', -0.62, 0, 0.16, 0.03, 0.40, 0, 'paktong', 'metal'],
        ['cy', 0.62, 0, 0.16, 0.03, 0.40, 0, 'paktong', 'metal']
      ]
    },
    {
      key: 'af_fleetborn_chair', name: 'Bone-pinned catechu sling chair', culture: 'fleetborn',
      type: 'chair', anchor: 'floor', w: 0.52, d: 0.52, h: 0.84,
      clearance: { front: 0.45 }, rooms: ALL_ROOMS,
      materials: ['timber', 'cloth', 'bone'], task: ['resting'],
      parts: [
        ['bx', 0, 0.42, 0, 0.48, 0.05, 0.46, 0, 'catechuRed', 'cloth'],
        ['bx', 0, 0.46, -0.21, 0.48, 0.38, 0.05, 0, 'byssusGold', 'cloth'],
        ['cy', -0.21, 0, -0.21, 0.025, 0.84, 0, 'driftTimber', 'wood'],
        ['cy', 0.21, 0, -0.21, 0.025, 0.84, 0, 'driftTimber', 'wood'],
        ['cy', -0.21, 0, 0.21, 0.025, 0.44, 0, 'seaBone', 'bone'],
        ['cy', 0.21, 0, 0.21, 0.025, 0.44, 0, 'seaBone', 'bone']
      ]
    },
    {
      key: 'af_fleetborn_desk', name: 'Caretaker chart & soundings desk', culture: 'fleetborn',
      type: 'desk', anchor: 'wall', w: 1.24, d: 0.64, h: 0.78,
      clearance: { front: 0.55 }, rooms: ['study', 'chartroom', 'school', 'library', 'bedroom', 'workshop'],
      materials: ['timber', 'metal', 'stone'], task: ['writing'],
      parts: [
        ['bx', 0, 0.72, 0, 1.22, 0.06, 0.62, 0, 'driftSlate', 'stone'],
        ['bx', -0.54, 0, 0, 0.08, 0.72, 0.60, 0, 'driftTimber', 'wood'],
        ['bx', 0.54, 0, 0, 0.08, 0.72, 0.60, 0, 'driftTimber', 'wood'],
        ['bx', 0, 0.48, -0.28, 1.16, 0.26, 0.06, 0, 'paktongDark', 'metal']
      ]
    },
    {
      key: 'af_fleetborn_chest', name: 'Paktong-bound sea chest', culture: 'fleetborn',
      type: 'storage', role: 'chest', anchor: 'wall', w: 0.94, d: 0.50, h: 0.54,
      clearance: { front: 0.45 }, rooms: ['bedroom', 'dormitory', 'strongroom', 'store', 'sickbay', 'barracks'],
      materials: ['timber', 'metal'], task: ['storage'],
      parts: [
        ['bx', 0, 0, 0, 0.92, 0.48, 0.48, 0, 'driftTimber', 'wood'],
        ['bx', 0, 0.48, 0, 0.94, 0.06, 0.50, 0, 'paktongDark', 'metal'],
        ['bx', -0.32, 0.02, 0, 0.06, 0.52, 0.50, 0, 'paktong', 'metal'],
        ['bx', 0.32, 0.02, 0, 0.06, 0.52, 0.50, 0, 'paktong', 'metal']
      ]
    },
    {
      key: 'af_fleetborn_store_cask', name: 'Corded kelp-oil & salted-catch crocks', culture: 'fleetborn',
      type: 'storage', role: 'store', surface: false, anchor: 'wall', w: 0.88, d: 0.52, h: 0.84,
      clearance: { front: 0.45 }, rooms: ['kitchen', 'store', 'workshop', 'tavern', 'hall'],
      materials: ['stone', 'rope', 'bone'], task: ['storage'],
      parts: [
        ['bx', 0, 0, 0, 0.86, 0.08, 0.50, 0, 'driftTimber', 'wood'],
        ['fs', -0.22, 0.08, 0.02, 0.16, 0.20, 0.62, 0, 'lithoStone', 'stone', 12],
        ['cy', -0.22, 0.70, 0.02, 0.12, 0.12, 0, 'seaBone', 'bone'],
        ['fs', 0.22, 0.08, 0.02, 0.16, 0.20, 0.62, 0, 'catechuDark', 'rope', 12],
        ['cy', 0.22, 0.70, 0.02, 0.12, 0.12, 0, 'seaBone', 'bone']
      ]
    },
    {
      key: 'af_fleetborn_shelf', name: 'Paktong stanchion chart & scroll shelves', culture: 'fleetborn',
      type: 'shelf', role: 'bookcase', anchor: 'wall', w: 1.20, d: 0.42, h: 1.80,
      clearance: { front: 0.45 }, rooms: ['study', 'library', 'chartroom', 'school', 'store', 'sickbay', 'workshop', 'hall'],
      materials: ['metal', 'timber', 'cloth'], task: ['storage', 'reading'],
      parts: [
        ['bx', 0, 0.10, -0.18, 1.18, 1.66, 0.06, 0, 'driftTimber', 'wood'],
        ['cy', -0.56, 0, 0.16, 0.025, 1.80, 0, 'paktong', 'metal'],
        ['cy', 0.56, 0, 0.16, 0.025, 1.80, 0, 'paktong', 'metal'],
        ['bx', 0, 0.42, 0, 1.16, 0.04, 0.38, 0, 'driftTimber', 'wood'],
        ['bx', 0, 0.92, 0, 1.16, 0.04, 0.38, 0, 'driftTimber', 'wood'],
        ['bx', 0, 1.42, 0, 1.16, 0.04, 0.38, 0, 'driftTimber', 'wood'],
        ['bx', -0.24, 0.96, 0, 0.38, 0.28, 0.24, 0, 'byssusGold', 'cloth'],
        ['bx', 0.26, 0.46, 0, 0.36, 0.26, 0.24, 0, 'catechuRed', 'cloth']
      ]
    },
    {
      key: 'af_fleetborn_stove', name: 'Basalt & paktong sea-oil galley hearth', culture: 'fleetborn',
      type: 'stove', role: 'hearth', surface: false, anchor: 'wall', w: 1.16, d: 0.66, h: 0.92,
      clearance: { front: 0.55 }, rooms: ['kitchen', 'tavern', 'hall'],
      materials: ['stone', 'metal', 'emissive'], task: ['cooking'],
      parts: [
        ['bx', 0, 0, 0, 1.14, 0.72, 0.64, 0, 'lithoStone', 'stone'],
        ['bx', 0, 0.72, 0, 1.16, 0.06, 0.66, 0, 'paktongDark', 'metal'],
        ['cy', -0.28, 0.78, 0.04, 0.16, 0.12, 0, 'paktong', 'metal'],
        ['cy', 0.28, 0.78, 0.04, 0.14, 0.04, 0, 'oilGlow', 'glow']
      ]
    },
    {
      key: 'af_fleetborn_counter', name: 'Paktong-trimmed ration & mess counter', culture: 'fleetborn',
      type: 'counter', anchor: 'wall', w: 1.92, d: 0.64, h: 0.94,
      clearance: { front: 0.55 }, rooms: ['tavern', 'hall', 'store', 'kitchen'],
      materials: ['timber', 'metal', 'cloth'], task: ['socializing'],
      parts: [
        ['bx', 0, 0, 0, 1.88, 0.88, 0.58, 0, 'driftTimber', 'wood'],
        ['bx', 0, 0.88, 0, 1.92, 0.06, 0.64, 0, 'paktong', 'metal'],
        ['bx', 0, 0.18, 0.28, 1.68, 0.56, 0.04, 0, 'catechuRed', 'cloth']
      ]
    },
    {
      key: 'af_fleetborn_workbench', name: 'Cordage, bone-carving & spear-rigging bench', culture: 'fleetborn',
      type: 'workstation', role: 'workbench', anchor: 'wall', w: 1.56, d: 0.66, h: 0.86,
      clearance: { front: 0.55 }, rooms: ['workshop', 'sailloft', 'armoury', 'store'],
      materials: ['timber', 'metal', 'bone'], task: [],
      parts: [
        ['bx', 0, 0.76, 0, 1.54, 0.08, 0.64, 0, 'driftTimber', 'wood'],
        ['bx', -0.66, 0, 0, 0.10, 0.76, 0.60, 0, 'paktongDark', 'metal'],
        ['bx', 0.66, 0, 0, 0.10, 0.76, 0.60, 0, 'paktongDark', 'metal'],
        ['bx', -0.36, 0.84, -0.10, 0.24, 0.04, 0.14, 0, 'seaBone', 'bone'],
        ['bx', 0.34, 0.84, 0.04, 0.30, 0.04, 0.18, 0, 'catechuRed', 'cloth']
      ]
    },
    {
      key: 'af_fleetborn_soak_tub', name: 'Basalt & paktong rinse tub', culture: 'fleetborn',
      type: 'vessel', role: 'bathtub', surface: false, anchor: 'floor', w: 1.28, d: 0.70, h: 0.66,
      clearance: { front: 0.45 }, rooms: ['bath', 'laundry', 'workshop'],
      materials: ['stone', 'metal'], task: [],
      parts: [
        ['bx', 0, 0, 0, 1.26, 0.58, 0.68, 0, 'lithoStone', 'stone'],
        ['bx', 0, 0.58, 0, 1.28, 0.06, 0.70, 0, 'paktong', 'metal']
      ]
    },
    {
      key: 'af_fleetborn_basin', name: 'Paktong washbasin', culture: 'fleetborn',
      type: 'vessel', role: 'washbasin', surface: false, anchor: 'wall', w: 0.60, d: 0.46, h: 0.86,
      clearance: { front: 0.45 }, rooms: ['bath', 'laundry', 'kitchen'],
      materials: ['metal', 'stone'], task: [],
      parts: [
        ['bx', 0, 0, -0.04, 0.36, 0.74, 0.36, 0, 'lithoStone', 'stone'],
        ['fs', 0, 0.74, 0, 0.18, 0.26, 0.12, 0, 'paktong', 'metal', 12]
      ]
    },
    {
      key: 'af_fleetborn_privy', name: 'Basalt sea-chute seat', culture: 'fleetborn',
      type: 'vessel', role: 'toilet', surface: false, anchor: 'wall', w: 0.54, d: 0.58, h: 0.76,
      clearance: { front: 0.45 }, rooms: ['bath'],
      materials: ['stone', 'metal'], task: [],
      parts: [
        ['bx', 0, 0, -0.18, 0.52, 0.76, 0.22, 0, 'lithoStone', 'stone'],
        ['bx', 0, 0, 0.04, 0.46, 0.42, 0.44, 0, 'lithoLight', 'stone'],
        ['bx', 0, 0.42, 0.04, 0.48, 0.04, 0.46, 0, 'paktong', 'metal']
      ]
    },

    /* ---------------- SHORE-KIN HARBOUR & YARD-CREW FITTINGS (Arch local & sea materials ONLY) ---------------- */
    {
      key: 'af_shorekin_mangrove_bunk', name: 'Araucaria & mangrove timber crew bunk', culture: 'shorekin',
      type: 'bed', role: 'bunk', anchor: 'floor', w: 2.02, d: 0.96, h: 1.76,
      clearance: { front: 0.5 }, rooms: ['bedroom', 'dormitory', 'barracks', 'sickbay', 'workshop', 'sailloft', 'hall'],
      materials: ['timber', 'rope', 'wicker'], task: ['sleeping'],
      parts: [
        ['bx', -0.94, 0, -0.41, 0.09, 1.76, 0.09, 0, 'mangrove', 'wood'],
        ['bx', 0.94, 0, -0.41, 0.09, 1.76, 0.09, 0, 'mangrove', 'wood'],
        ['bx', -0.94, 0, 0.41, 0.09, 1.76, 0.09, 0, 'mangrove', 'wood'],
        ['bx', 0.94, 0, 0.41, 0.09, 1.76, 0.09, 0, 'mangrove', 'wood'],
        ['bx', 0, 0.38, 0, 1.92, 0.08, 0.88, 0, 'araucaria', 'wood'],
        ['bx', 0, 0.46, 0, 1.82, 0.06, 0.80, 0, 'pandanus', 'wicker'],
        ['bo', -0.68, 0.55, 0, 0.72, 0.07, 1.57, 'coir', 'rope'],
        ['bx', 0, 1.18, 0, 1.92, 0.08, 0.88, 0, 'araucaria', 'wood'],
        ['bx', 0, 1.26, 0, 1.82, 0.06, 0.80, 0, 'pandanus', 'wicker'],
        ['bo', -0.68, 1.35, 0, 0.72, 0.07, 1.57, 'coir', 'rope']
      ]
    },
    {
      key: 'af_shorekin_travertine_screen', name: 'Pierced brucite-travertine vent screen', culture: 'shorekin',
      type: 'rack', anchor: 'wall', surface: false, w: 1.52, d: 0.28, h: 1.84,
      clearance: { front: 0.35 }, rooms: ['workshop', 'store', 'sailloft', 'hall', 'bedroom', 'dormitory', 'kitchen', 'tavern', 'study', 'antechamber'],
      materials: ['stone', 'timber'], task: [],
      parts: [
        ['bx', 0, 0, 0, 1.50, 0.10, 0.26, 0, 'mangrove', 'wood'],
        ['bx', 0, 1.74, 0, 1.50, 0.10, 0.26, 0, 'mangrove', 'wood'],
        ['bx', -0.68, 0.10, 0, 0.12, 1.64, 0.16, 0, 'travertine', 'stone'],
        ['bx', -0.22, 0.10, 0, 0.10, 1.64, 0.14, 0, 'travertineVein', 'stone'],
        ['bx', 0.22, 0.10, 0, 0.10, 1.64, 0.14, 0, 'travertineVein', 'stone'],
        ['bx', 0.68, 0.10, 0, 0.12, 1.64, 0.16, 0, 'travertine', 'stone'],
        ['bx', 0, 0.48, 0, 1.36, 0.10, 0.14, 0, 'travertine', 'stone'],
        ['bx', 0, 0.92, 0, 1.36, 0.10, 0.14, 0, 'travertine', 'stone'],
        ['bx', 0, 1.36, 0, 1.36, 0.10, 0.14, 0, 'travertine', 'stone']
      ]
    },
    {
      key: 'af_shorekin_tally_slate', name: 'Shell-limewash yard tally slate', culture: 'shorekin',
      type: 'shelf', anchor: 'wall', surface: false, w: 1.36, d: 0.22, h: 1.42,
      clearance: { front: 0.45 }, rooms: ['workshop', 'store', 'sailloft', 'study', 'chartroom', 'hall', 'school', 'tavern'],
      materials: ['stone', 'timber', 'plaster'], task: ['reading', 'writing'],
      parts: [
        ['bx', -0.62, 0, -0.04, 0.08, 1.40, 0.08, 0, 'mangrove', 'wood'],
        ['bx', 0.62, 0, -0.04, 0.08, 1.40, 0.08, 0, 'mangrove', 'wood'],
        ['bx', 0, 0.42, -0.04, 1.32, 0.96, 0.06, 0, 'limewash', 'plaster'],
        ['bx', 0, 0.48, -0.01, 1.16, 0.84, 0.04, 0, 'slate', 'stone'],
        ['bx', -0.34, 0.96, 0.02, 0.28, 0.03, 0.02, 0, 'limewash', 'plaster'],
        ['bx', 0.24, 0.74, 0.02, 0.34, 0.03, 0.02, 0, 'limewash', 'plaster'],
        ['bx', 0, 0.40, 0.02, 1.24, 0.05, 0.10, 0, 'araucaria', 'wood']
      ]
    },
    {
      key: 'af_shorekin_pandanus_mat', name: 'Coir & pandanus sleeping mat', culture: 'shorekin',
      type: 'rug', anchor: 'floor', surface: false, w: 1.86, d: 1.16, h: 0.08,
      clearance: {}, rooms: ALL_ROOMS,
      materials: ['wicker', 'rope'], task: ['resting'],
      parts: [
        ['bx', 0, 0, 0, 1.84, 0.03, 1.14, 0, 'coir', 'rope'],
        ['bx', 0, 0.02, 0, 1.72, 0.03, 1.02, 0, 'pandanus', 'wicker'],
        ['bo', -0.72, 0.05, 0, 0.88, 0.03, 1.57, 'pandanus', 'wicker']
      ]
    },
    {
      key: 'af_shorekin_pitch_pot', name: 'Boatyard pitch pot & brucite-travertine brazier', culture: 'shorekin',
      type: 'workstation', role: 'hearth', surface: false, anchor: 'wall', w: 0.70, d: 0.64, h: 0.92,
      clearance: { front: 0.55 }, rooms: ['workshop', 'sailloft', 'store', 'kitchen'],
      materials: ['stone', 'metal', 'timber', 'emissive'], task: ['cooking'],
      parts: [
        ['bx', 0, 0, -0.02, 0.66, 0.42, 0.58, 0, 'travertine', 'stone'],
        ['cy', 0, 0.40, 0.02, 0.21, 0.06, 0, 'ember', 'glow'],
        ['fs', 0, 0.44, 0.02, 0.21, 0.26, 0.36, 0, 'iron', 'metal', 14],
        ['cy', 0, 0.76, 0.02, 0.24, 0.05, 0, 'pitch', 'stone'],
        ['rd', 0.05, 0.78, 0.02, 0.26, 0.90, 0.12, 0.022, 'mangrove', 'wood']
      ]
    },
    {
      key: 'af_shorekin_caulking_bench', name: 'Araucaria boatwright bench, caulking mallets & pitch pot', culture: 'shorekin',
      type: 'workstation', role: 'workbench', anchor: 'wall', w: 1.72, d: 0.70, h: 0.92,
      clearance: { front: 0.55 }, rooms: ['workshop', 'sailloft', 'store', 'armoury'],
      materials: ['timber', 'rope', 'metal'], task: [],
      parts: [
        ['bx', 0, 0.76, 0, 1.70, 0.08, 0.68, 0, 'araucaria', 'wood'],
        ['bx', -0.72, 0, 0, 0.10, 0.76, 0.62, 0, 'mangrove', 'wood'],
        ['bx', 0.72, 0, 0, 0.10, 0.76, 0.62, 0, 'mangrove', 'wood'],
        ['bx', 0, 0.22, -0.04, 1.54, 0.05, 0.46, 0, 'araucariaDark', 'wood'],
        /* Caulking mallets & pitch pot on benchtop + coir coil underneath */
        ['bx', -0.44, 0.84, 0.04, 0.22, 0.07, 0.07, 0.3, 'mangroveDark', 'wood'],
        ['rd', -0.44, 0.86, 0.04, -0.44, 0.86, 0.26, 0.018, 'araucaria', 'wood'],
        ['cy', 0.42, 0.84, -0.06, 0.11, 0.08, 0, 'pitch', 'stone'],
        ['cy', 0, 0.27, 0, 0.22, 0.18, 0, 'coir', 'rope']
      ]
    },
    {
      key: 'af_shorekin_rope_coils', name: 'Stacked coir hawser coils & caulking gear', culture: 'shorekin',
      type: 'storage', role: 'store', surface: false, anchor: 'wall', w: 1.04, d: 0.64, h: 0.82,
      clearance: { front: 0.45 }, rooms: ['workshop', 'store', 'sailloft', 'hall', 'kitchen', 'armoury'],
      materials: ['rope', 'timber'], task: ['storage'],
      parts: [
        ['bx', 0, 0, 0, 1.02, 0.08, 0.62, 0, 'araucariaDark', 'wood'],
        ['cy', -0.24, 0.08, 0.02, 0.22, 0.36, 0, 'coir', 'rope'],
        ['cy', -0.24, 0.44, 0.02, 0.18, 0.28, 0, 'pandanus', 'wicker'],
        ['cy', 0.26, 0.08, 0.02, 0.20, 0.44, 0, 'coir', 'rope'],
        ['bx', 0.26, 0.52, 0.02, 0.24, 0.08, 0.08, 0.4, 'mangrove', 'wood']
      ]
    },
    {
      key: 'af_shorekin_sail_table', name: 'Araucaria & mangrove sail-cutting table', culture: 'shorekin',
      type: 'table', anchor: 'floor', w: 1.84, d: 0.90, h: 0.76,
      clearance: { front: 0.5, back: 0.5 }, rooms: ['sailloft', 'workshop', 'hall', 'tavern', 'kitchen', 'library', 'chartroom'],
      materials: ['timber', 'rope'], task: ['eating', 'socializing'],
      parts: [
        ['bx', 0, 0.68, 0, 1.82, 0.08, 0.88, 0, 'araucaria', 'wood'],
        ['bx', -0.78, 0, -0.34, 0.09, 0.68, 0.09, 0, 'mangrove', 'wood'],
        ['bx', 0.78, 0, -0.34, 0.09, 0.68, 0.09, 0, 'mangrove', 'wood'],
        ['bx', -0.78, 0, 0.34, 0.09, 0.68, 0.09, 0, 'mangrove', 'wood'],
        ['bx', 0.78, 0, 0.34, 0.09, 0.68, 0.09, 0, 'mangrove', 'wood']
      ]
    },
    {
      key: 'af_shorekin_low_table', name: 'Low brucite-travertine & mangrove table', culture: 'shorekin',
      type: 'table', role: 'low_table', anchor: 'floor', w: 1.08, d: 0.56, h: 0.42,
      clearance: { front: 0.4 }, rooms: ['hall', 'tavern', 'bedroom'],
      materials: ['stone', 'timber'], task: ['eating', 'socializing'],
      parts: [
        ['bx', 0, 0.34, 0, 1.06, 0.08, 0.54, 0, 'travertine', 'stone'],
        ['bx', -0.42, 0, 0, 0.09, 0.34, 0.46, 0, 'mangrove', 'wood'],
        ['bx', 0.42, 0, 0, 0.09, 0.34, 0.46, 0, 'mangrove', 'wood']
      ]
    },
    {
      key: 'af_shorekin_bench', name: 'Mangrove & Araucaria yard bench', culture: 'shorekin',
      type: 'bench', anchor: 'floor', w: 1.48, d: 0.42, h: 0.45,
      clearance: { front: 0.45 }, rooms: ALL_ROOMS,
      materials: ['timber', 'rope'], task: ['resting', 'socializing'],
      parts: [
        ['bx', 0, 0.38, 0, 1.46, 0.07, 0.40, 0, 'araucaria', 'wood'],
        ['bx', -0.60, 0, 0, 0.08, 0.38, 0.36, 0, 'mangrove', 'wood'],
        ['bx', 0.60, 0, 0, 0.08, 0.38, 0.36, 0, 'mangrove', 'wood']
      ]
    },
    {
      key: 'af_shorekin_stool', name: 'Coir-lashed mangrove chair', culture: 'shorekin',
      type: 'chair', anchor: 'floor', w: 0.50, d: 0.50, h: 0.80,
      clearance: { front: 0.45 }, rooms: ALL_ROOMS,
      materials: ['timber', 'wicker', 'rope'], task: ['resting'],
      parts: [
        ['bx', 0, 0.40, 0, 0.46, 0.05, 0.46, 0, 'pandanus', 'wicker'],
        ['bx', 0, 0.45, -0.20, 0.46, 0.34, 0.05, 0, 'araucaria', 'wood'],
        ['bx', -0.20, 0, -0.20, 0.05, 0.80, 0.05, 0, 'mangrove', 'wood'],
        ['bx', 0.20, 0, -0.20, 0.05, 0.80, 0.05, 0, 'mangrove', 'wood'],
        ['bx', -0.20, 0, 0.20, 0.05, 0.42, 0.05, 0, 'mangrove', 'wood'],
        ['bx', 0.20, 0, 0.20, 0.05, 0.42, 0.05, 0, 'mangrove', 'wood']
      ]
    },
    {
      key: 'af_shorekin_chest', name: 'Shell-limewashed Araucaria gear chest', culture: 'shorekin',
      type: 'storage', role: 'chest', anchor: 'wall', w: 0.70, d: 0.48, h: 0.54,
      clearance: { front: 0.45 }, rooms: ['bedroom', 'dormitory', 'store', 'strongroom', 'workshop', 'sickbay', 'barracks'],
      materials: ['timber', 'plaster', 'rope'], task: ['storage'],
      parts: [
        ['bx', 0, 0, 0, 0.66, 0.46, 0.44, 0, 'limewash', 'plaster'],
        ['bx', 0, 0.46, 0, 0.70, 0.08, 0.48, 0, 'araucaria', 'wood'],
        ['bx', -0.26, 0, 0, 0.06, 0.48, 0.46, 0, 'mangrove', 'wood'],
        ['bx', 0.26, 0, 0, 0.06, 0.48, 0.46, 0, 'mangrove', 'wood']
      ]
    },
    {
      key: 'af_shorekin_shelf', name: 'Mangrove & Araucaria cordage shelving', culture: 'shorekin',
      type: 'shelf', role: 'bookcase', anchor: 'wall', w: 1.22, d: 0.44, h: 1.78,
      clearance: { front: 0.45 }, rooms: ['store', 'workshop', 'sailloft', 'study', 'library', 'chartroom', 'sickbay', 'school'],
      materials: ['timber', 'rope', 'wicker'], task: ['storage'],
      parts: [
        ['bx', 0, 0.08, -0.19, 1.20, 1.66, 0.06, 0, 'araucariaDark', 'wood'],
        ['bx', -0.56, 0, 0, 0.07, 1.78, 0.40, 0, 'mangrove', 'wood'],
        ['bx', 0.56, 0, 0, 0.07, 1.78, 0.40, 0, 'mangrove', 'wood'],
        ['bx', 0, 0.44, 0, 1.14, 0.05, 0.38, 0, 'araucaria', 'wood'],
        ['bx', 0, 0.94, 0, 1.14, 0.05, 0.38, 0, 'araucaria', 'wood'],
        ['bx', 0, 1.44, 0, 1.14, 0.05, 0.38, 0, 'araucaria', 'wood'],
        ['cy', -0.26, 0.49, 0, 0.14, 0.22, 0, 'coir', 'rope'],
        ['bx', 0.24, 0.99, 0, 0.34, 0.24, 0.26, 0, 'pandanus', 'wicker']
      ]
    },
    {
      key: 'af_shorekin_rack', name: 'Boat-hook, caulking-mallet & coir-line rack', culture: 'shorekin',
      type: 'rack', anchor: 'wall', surface: false, w: 1.38, d: 0.40, h: 1.82,
      clearance: { front: 0.45 }, rooms: ['workshop', 'sailloft', 'store', 'armoury', 'dormitory', 'barracks', 'laundry', 'bath'],
      materials: ['timber', 'rope', 'metal'], task: ['storage'],
      parts: [
        ['bx', 0, 0.20, -0.17, 1.34, 1.50, 0.06, 0, 'araucaria', 'wood'],
        ['bx', -0.62, 0, 0, 0.07, 1.80, 0.36, 0, 'mangrove', 'wood'],
        ['bx', 0.62, 0, 0, 0.07, 1.80, 0.36, 0, 'mangrove', 'wood'],
        ['cy', -0.36, 0.14, 0, 0.02, 1.62, 0, 'araucariaDark', 'wood'],
        ['cy', 0, 0.14, 0, 0.02, 1.62, 0, 'mangrove', 'wood'],
        ['cy', 0.36, 0.14, 0, 0.02, 1.62, 0, 'araucariaDark', 'wood'],
        ['cy', -0.24, 1.12, 0.06, 0.12, 0.10, 0, 'coir', 'rope'],
        ['cy', 0.24, 1.12, 0.06, 0.12, 0.10, 0, 'coir', 'rope']
      ]
    },
    {
      key: 'af_shorekin_desk', name: 'Harbourmaster Araucaria & slate tally desk', culture: 'shorekin',
      type: 'desk', anchor: 'wall', w: 1.22, d: 0.64, h: 0.78,
      clearance: { front: 0.55 }, rooms: ['study', 'chartroom', 'school', 'workshop', 'store'],
      materials: ['timber', 'stone', 'plaster'], task: ['writing'],
      parts: [
        ['bx', 0, 0.70, 0, 1.20, 0.08, 0.62, 0, 'araucaria', 'wood'],
        ['bx', 0, 0.77, -0.06, 0.56, 0.02, 0.38, 0, 'slate', 'stone'],
        ['bx', -0.52, 0, 0, 0.09, 0.70, 0.58, 0, 'mangrove', 'wood'],
        ['bx', 0.52, 0, 0, 0.09, 0.70, 0.58, 0, 'mangrove', 'wood']
      ]
    },
    {
      key: 'af_shorekin_counter', name: 'Brucite-travertine & Araucaria yard counter', culture: 'shorekin',
      type: 'counter', anchor: 'wall', w: 1.88, d: 0.64, h: 0.94,
      clearance: { front: 0.55 }, rooms: ['tavern', 'store', 'workshop', 'hall'],
      materials: ['stone', 'timber', 'plaster'], task: ['socializing'],
      parts: [
        ['bx', 0, 0, 0, 1.82, 0.86, 0.58, 0, 'travertine', 'stone'],
        ['bx', 0, 0.86, 0, 1.88, 0.08, 0.64, 0, 'araucaria', 'wood']
      ]
    },
    {
      key: 'af_shorekin_lamp', name: 'Pierced brucite-travertine oil lantern post', culture: 'shorekin',
      type: 'lamp', anchor: 'floor', surface: false, w: 0.46, d: 0.46, h: 1.52,
      clearance: {}, rooms: ALL_ROOMS,
      materials: ['stone', 'timber', 'emissive'], task: [],
      parts: [
        ['bx', 0, 0, 0, 0.38, 0.10, 0.38, 0, 'mangrove', 'wood'],
        ['cy', 0, 0.10, 0, 0.045, 1.12, 0, 'araucariaDark', 'wood'],
        ['bx', 0, 1.22, 0, 0.28, 0.28, 0.28, 0, 'travertine', 'stone'],
        ['bl', 0, 1.36, 0, 0.08, 'flame', 'glow']
      ]
    },
    {
      key: 'af_shorekin_altar', name: 'Shell-limewash brucite-travertine tide cairn', culture: 'shorekin',
      type: 'altar', anchor: 'floor', surface: false, w: 1.16, d: 0.58, h: 1.18,
      clearance: { front: 0.45 }, rooms: ['shrine', 'hall'],
      materials: ['stone', 'plaster', 'rope'], task: ['praying'],
      parts: [
        ['bx', 0, 0, 0, 1.12, 0.54, 0.54, 0, 'travertine', 'stone'],
        ['bx', 0, 0.54, 0, 0.86, 0.34, 0.42, 0, 'limewash', 'plaster'],
        ['fs', 0, 0.88, 0, 0.22, 0.10, 0.28, 0, 'travertineVein', 'stone', 8]
      ]
    }
  ];

  const PRIM_MAP = {
    bx: 'b' + 'ox',
    cy: 'c' + 'yl',
    rd: 'r' + 'od',
    bm: 'be' + 'am',
    fs: 'frustum',
    bl: 'ball',
    pl: 'pillow',
    bo: 'bolster'
  };

  function runParts(fr, parts) {
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i], op = p[0], fn = fr[PRIM_MAP[op]];
      if (!fn) continue;
      if (op === 'bx' || op === 'pl') {
        fn(p[1], p[2], p[3], p[4], p[5], p[6], p[7], fr.col(p[8]), p[9]);
      } else if (op === 'cy' || op === 'bo') {
        fn(p[1], p[2], p[3], p[4], p[5], p[6], fr.col(p[7]), p[8]);
      } else if (op === 'rd') {
        fn(p[1], p[2], p[3], p[4], p[5], p[6], p[7], fr.col(p[8]), p[9]);
      } else if (op === 'bm') {
        fn(p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], fr.col(p[9]), p[10]);
      } else if (op === 'fs') {
        fn(p[1], p[2], p[3], p[4], p[5], p[6], p[7], fr.col(p[8]), p[9], p[10]);
      } else if (op === 'bl') {
        fn(p[1], p[2], p[3], p[4], fr.col(p[5]), p[6]);
      }
    }
  }

  /* Register Fleet-born and Shore-kin palettes & FURN entries into KratorFurniture and any cached runtimeAdapter */
  function installPieces(KF, cat) {
    const kf = KF || (typeof KratorFurniture !== 'undefined' ? KratorFurniture
      : (typeof globalThis !== 'undefined' ? globalThis.KratorFurniture : null));
    if (kf && !kf._afSocketPieces) {
      kf.FPAL.fleetborn = Object.assign({}, PALETTES.fleetborn);
      kf.FPAL.shorekin = Object.assign({}, PALETTES.shorekin);
      SOCKET_PIECES.forEach(spec => {
        if (kf.FURN_BY_KEY[spec.key]) return;
        const entry = {
          key: spec.key,
          name: spec.name,
          culture: spec.culture,
          tier: 'common',
          wealth: [0.25, 0.85],
          type: spec.type,
          role: spec.role,
          setting: 'indoor',
          rooms: spec.rooms.slice(),
          room: spec.rooms[0],
          w: spec.w,
          d: spec.d,
          h: spec.h,
          variants: 1,
          anchor: spec.anchor || 'floor',
          hung: spec.hung,
          clearance: spec.clearance || {},
          surface: spec.surface !== false,
          materials: spec.materials.slice(),
          task: (spec.task || []).slice(),
          build: function (fr) { runParts(fr, spec.parts); }
        };
        kf.FURNS.push(entry);
        kf.FURN_BY_KEY[entry.key] = entry;
      });
      kf._afSocketPieces = true;
    }
    if (cat && typeof cat.list === 'function') {
      const L = cat.list();
      const have = {};
      for (let i = 0; i < L.length; i++) have[L[i].key] = 1;
      SOCKET_PIECES.forEach(spec => {
        if (have[spec.key]) return;
        L.push({
          key: spec.key,
          name: spec.name,
          culture: spec.culture,
          type: spec.type,
          setting: 'indoor',
          rooms: spec.rooms.slice(),
          anchor: spec.anchor || 'floor',
          clearance: spec.clearance || {},
          tier: 'common',
          wealth: [0.25, 0.85],
          role: spec.role,
          variants: 1,
          surface: spec.surface !== false,
          stretch: false
        });
      });
    }
  }

  /* Register custom culture dresses on KratorAncientsInteriors when available so recipes dress in the socket's culture */
  function installDresses(AI, cat) {
    installPieces(null, cat);
    if (!AI || !AI.DRESS || AI._afDressed) return;
    const pick = (cult, type, fb) => {
      if (cat && cat.list) {
        const hit = cat.list().find(e => e.culture === cult && e.type === type && e.setting !== 'outdoor');
        if (hit) return hit.key;
      }
      return fb;
    };
    ['iziz', 'xanadu', 'republican'].forEach(c => {
      AI.DRESS[c] = Object.assign({}, AI.DRESS.occupied, {
        table: pick(c, 'table', AI.DRESS.occupied.table),
        bench: pick(c, 'bench', AI.DRESS.occupied.bench),
        chair: pick(c, 'chair', AI.DRESS.occupied.chair),
        desk: pick(c, 'desk', AI.DRESS.occupied.desk),
        bookcase: pick(c, 'shelf', AI.DRESS.occupied.bookcase),
        divan: pick(c, 'bed', AI.DRESS.occupied.divan),
        banner: pick(c, 'banner', AI.DRESS.occupied.banner),
        lampStem: pick(c, 'lamp', AI.DRESS.occupied.lampStem)
      });
    });
    AI.DRESS.fleetborn = Object.assign({}, AI.DRESS.occupied, {
      table: 'af_fleetborn_table',
      headTable: 'af_fleetborn_table',
      lowTable: 'af_fleetborn_low_table',
      bench: 'af_fleetborn_bench',
      divan: 'af_fleetborn_bench',
      chair: 'af_fleetborn_chair',
      desk: 'af_fleetborn_desk',
      bookcase: 'af_fleetborn_shelf',
      banner: 'af_fleetborn_byssus_banner',
      hanging: 'af_fleetborn_byssus_banner',
      statue: 'af_fleetborn_lithophone_stand',
      lampStem: 'af_fleetborn_paktong_lamp',
      ceilingLamp: 'af_fleetborn_hanging_lamp',
      counter: 'af_fleetborn_counter',
      servery: 'af_fleetborn_counter',
      stove: 'af_fleetborn_stove',
      workbench: 'af_fleetborn_workbench',
      toolRack: 'af_fleetborn_dive_rack',
      weaponRack: 'af_fleetborn_dive_rack',
      board: 'af_fleetborn_tally_board'
    });
    AI.DRESS.shorekin = Object.assign({}, AI.DRESS.occupied, {
      table: 'af_shorekin_sail_table',
      headTable: 'af_shorekin_sail_table',
      lowTable: 'af_shorekin_low_table',
      bench: 'af_shorekin_bench',
      divan: 'af_shorekin_bench',
      chair: 'af_shorekin_stool',
      desk: 'af_shorekin_desk',
      bookcase: 'af_shorekin_shelf',
      statue: 'af_shorekin_altar',
      lampStem: 'af_shorekin_lamp',
      counter: 'af_shorekin_counter',
      servery: 'af_shorekin_counter',
      stove: 'af_shorekin_pitch_pot',
      workbench: 'af_shorekin_caulking_bench',
      toolRack: 'af_shorekin_rack',
      weaponRack: 'af_shorekin_rack',
      rack: 'af_shorekin_travertine_screen',
      drums: 'af_shorekin_mangrove_bunk',
      pallet: 'af_shorekin_rope_coils',
      sacks: 'af_shorekin_pandanus_mat',
      crate: 'af_shorekin_chest',
      barrel: 'af_shorekin_pitch_pot',
      board: 'af_shorekin_tally_slate'
    });
    AI._afDressed = true;
  }

  function tagStorey(st, sector, kept, levelName, zone) {
    st.sector = sector;
    st.kept = kept;
    st.levelName = levelName;
    if (zone) st.zone = zone;
    st.rooms.forEach(R => {
      R.sector = (R.kind === 'corridor' || R.kind === 'core') ? 'infra' : sector;
      R.kept = kept;
      if (zone) R.zone = zone;
    });
    return st;
  }

  /* Build all 12 cutaway interior units in world coordinates (matching the arcology's local frame) */
  function buildPlans(AI, state, P) {
    const L = P || (state != null ? ARCOFORTE.plan({ state: state }) : ARCOFORTE.plan({}));
    const stMode = L.state;
    const Z = L.zones || {
      harbour: ARCOFORTE.zoneState('harbour'),
      bastions: ARCOFORTE.zoneState('bastions'),
      ring: ARCOFORTE.zoneState('ring'),
      towers_upper: ARCOFORTE.zoneState('towers_upper'),
      vaults: ARCOFORTE.zoneState('vaults'),
      crown: ARCOFORTE.zoneState('crown')
    };
    const D = ARCOFORTE.DIM;
    const units = [];

    function pushUnit(spec) {
      const unitZone = spec.zone || 'ring';
      spec.storeys.forEach(st => {
        if (!st.zone) st.zone = unitZone;
        const stKept = st.kept != null ? st.kept : spec.kept;
        st.kept = stKept;
        const ruinShare = !stKept ? (st.zone === 'vaults' ? 0.48 : 0.42) : 0;
        if (ruinShare > 0) {
          AI.ruinStorey(st, 'af|' + spec.id + '|' + stMode, { frac: ruinShare, place: Math.round(spec.x) + ',' + Math.round(spec.z) });
        }
        st.rooms.forEach(R => {
          R.building = spec.id;
          R.zone = st.zone;
          R.kept = stKept;
          R.culture = 'ancient';
          R.wealth = stKept ? 0.6 : 0.3;
          if (!stKept) R.furnish = false;
        });
      });
      const anyKept = spec.storeys.some(s => s.kept);
      const bld = {
        id: spec.id,
        name: spec.name,
        zone: unitZone,
        sector: spec.sector,
        kept: anyKept,
        storeys: spec.storeys,
        floors: true,
        hollow: null
      };
      const plan = {
        type: 'arcoforte.' + spec.id,
        d: anyKept ? 0 : 1,
        state: anyKept ? 'intact' : 'ruined',
        name: spec.name,
        furnish: anyKept,
        culture: 'ancient',
        wealth: 0.6,
        types: spec.types,
        buildings: [bld]
      };
      units.push(Object.assign({}, spec, {
        zone: unitZone,
        kept: anyKept,
        levels: spec.storeys.map(s => ({
          y: s.y, h: s.h,
          name: s.levelName + ' [' + s.sector.toUpperCase() + ']',
          sector: s.sector,
          zone: s.zone,
          kept: s.kept
        })),
        buildings: [bld],
        plan: plan
      }));
    }

    const keptHarbour = Z.harbour !== 'ruined';
    const keptAuto = Z.vaults === 'intact';
    const keptBastions = Z.bastions !== 'ruined';
    const keptRing = Z.ring !== 'ruined';
    const keptTowersUpper = Z.towers_upper !== 'ruined';
    const keptCrown = Z.crown !== 'ruined';

    /* 1. HARBOUR WORKS (Fishing Industry, Cold Storage, Sail Loft & Boatyard; y = 6.0, 12.0 m) */
    {
      const y0 = D.BENCH + 0.4, h = 5.2;
      const s0 = AI.barPlate({
        id: 'af.hw.s0', level: 0, y: y0, h: h,
        path: u => [-74 + 148 * u, -227], depth: 24, side: 'both', cw: 3.0, roomW: 14,
        kinds: cyc(['workshop', 'store', 'workshop', 'sailloft', 'store']), ends: ['core', null], door: 1.6
      });
      tagStorey(s0, 'work', keptHarbour, 'Fishing & Boatyard Floor', 'harbour');

      const s1 = AI.hallPlate({
        id: 'af.hw.s1', level: 1, y: y0 + 6.0, h: h,
        poly: rectPoly(-56, 56, -238, -216), kind: 'store', doorEdge: 0, doorW: 2.4, furnish: keptHarbour, recipe: 'store-hall'
      });
      tagStorey(s1, 'work', keptHarbour, 'Cold Storage & Fleet Provision Hall', 'harbour');

      pushUnit({
        id: 'harbour_works', name: 'Harbour Fishing & Cold-Storage Works', zone: 'harbour', sector: 'work', kept: keptHarbour,
        x: 0, z: -227, w: 164, d: 30, types: ['industry', 'infrastructure'], storeys: [s0, s1]
      });
    }

    /* 2. SUB-CLIFF AUTOMATED INDUSTRIES (Sealed & ruined unless vaults === 'intact') */
    {
      const y0 = D.BENCH + 0.4, h = 5.6;
      const s0 = AI.hallPlate({
        id: 'af.auto.s0', level: 0, y: y0, h: h,
        poly: rectPoly(-62, 62, -202, -178), kind: 'workshop', doorEdge: 0, doorW: 2.6, furnish: keptAuto, recipe: 'engine-room'
      });
      tagStorey(s0, 'infra', keptAuto, keptAuto ? 'Automated Industry & Transit Plant' : 'Sealed Automated Vaults (Ruined)', 'vaults');

      pushUnit({
        id: 'auto_vaults', name: 'Sub-Cliff Automated Industry Vaults', zone: 'vaults', sector: 'infra', kept: keptAuto,
        x: 0, z: -190, w: 140, d: 30, types: ['industry', 'infrastructure'], storeys: [s0]
      });
    }

    /* 3. LINEAR CITY WEST SPINE (Customs Reception, Craft Workshops & Upper Town Flats) */
    {
      const cx = -(D.LIN_GAP + D.LIN_W / 2);
      const s0 = AI.hallPlate({
        id: 'af.lw.s0', level: 0, y: 84.4, h: 4.2,
        poly: rectPoly(cx - 14, cx + 14, 224, 284), kind: 'hall', doorEdge: 1, doorW: 2.2, furnish: keptBastions, recipe: 'reception'
      });
      tagStorey(s0, 'work', keptBastions, 'Land-Gate Customs & Trade Reception', 'bastions');

      const s1 = AI.barPlate({
        id: 'af.lw.s1', level: 1, y: 89.2, h: 4.0,
        path: u => [cx, 220 + 140 * u], depth: 28, side: 'both', cw: 2.6, roomW: 9.5,
        kinds: cyc(['workshop', 'store', 'study', 'workshop', 'armoury']), ends: ['core', null], door: 1.3
      });
      tagStorey(s1, 'work', keptBastions, 'Artisans, Smithy & Guild Workshops', 'bastions');

      const s2 = AI.barPlate({
        id: 'af.lw.s2', level: 2, y: 94.0, h: 3.8,
        path: u => [cx, 220 + 140 * u], depth: 28, side: 'both', cw: 2.4, roomW: 7.5,
        kinds: cyc(['bedroom', 'kitchen', 'bedroom', 'hall', 'study']), ends: ['core', null], door: 1.1
      });
      tagStorey(s2, 'living', keptBastions, 'Linear Spine Lower Flats', 'bastions');

      const s3 = AI.barPlate({
        id: 'af.lw.s3', level: 3, y: 98.8, h: 3.8,
        path: u => [cx, 220 + 140 * u], depth: 26, side: 'both', cw: 2.4, roomW: 7.5,
        kinds: cyc(['bedroom', 'bedroom', 'kitchen', 'dormitory']), ends: ['core', null], door: 1.1
      });
      tagStorey(s3, 'living', keptBastions, 'Linear Spine Terrace Apartments', 'bastions');

      pushUnit({
        id: 'linear_west', name: 'Linear City West (Customs, Workshops & Flats)', zone: 'bastions', sector: 'work', kept: keptBastions,
        x: cx, z: 290, w: 36, d: 164, types: ['market', 'industry', 'dwelling-multi'], storeys: [s0, s1, s2, s3]
      });
    }

    /* 4. LINEAR CITY EAST SPINE (Caravan Warehouse, Travellers Tavern/Mess & Family Flats) */
    {
      const cx = D.LIN_GAP + D.LIN_W / 2;
      const s0 = AI.hallPlate({
        id: 'af.le.s0', level: 0, y: 84.4, h: 4.2,
        poly: rectPoly(cx - 14, cx + 14, 224, 288), kind: 'store', doorEdge: 3, doorW: 2.4, furnish: keptBastions, recipe: 'store-hall'
      });
      tagStorey(s0, 'work', keptBastions, 'Caravan Freight & Granary Hall', 'bastions');

      const s1 = AI.hallPlate({
        id: 'af.le.s1', level: 1, y: 89.2, h: 4.0,
        poly: rectPoly(cx - 14, cx + 14, 224, 280), kind: 'tavern', doorEdge: 3, doorW: 2.0, furnish: keptBastions, recipe: 'crew-mess'
      });
      tagStorey(s1, 'rec', keptBastions, 'Travellers Tavern & Common Mess', 'bastions');

      const s2 = AI.barPlate({
        id: 'af.le.s2', level: 2, y: 94.0, h: 3.8,
        path: u => [cx, 220 + 140 * u], depth: 28, side: 'both', cw: 2.4, roomW: 7.5,
        kinds: cyc(['bedroom', 'kitchen', 'dormitory', 'bedroom']), ends: ['core', null], door: 1.1
      });
      tagStorey(s2, 'living', keptBastions, 'East Spine Family Apartments', 'bastions');

      const s3 = AI.barPlate({
        id: 'af.le.s3', level: 3, y: 98.8, h: 3.8,
        path: u => [cx, 220 + 140 * u], depth: 26, side: 'both', cw: 2.4, roomW: 7.5,
        kinds: cyc(['bedroom', 'hall', 'kitchen', 'bedroom']), ends: ['core', null], door: 1.1
      });
      tagStorey(s3, 'living', keptBastions, 'East Spine Penthouse Flats', 'bastions');

      pushUnit({
        id: 'linear_east', name: 'Linear City East (Warehouse, Tavern & Flats)', zone: 'bastions', sector: 'living', kept: keptBastions,
        x: cx, z: 290, w: 36, d: 164, types: ['tavern', 'dwelling-multi'], storeys: [s0, s1, s2, s3]
      });
    }

    /* 5. WEST CITY CENTER VAULTED ARCADE (West N-S flank facet at x = -178 m, matching Soleri Plate 1 west wing) */
    {
      const chordPath = u => [-178, -62 + 164 * u];
      const s0 = AI.barPlate({
        id: 'af.cw.s0', level: 0, y: 84.4, h: 5.2, path: chordPath, depth: 30, side: 'both', cw: 3.2, roomW: 11,
        kinds: cyc(['workshop', 'store', 'tavern', 'workshop', 'laundry']), ends: ['core', 'core'], door: 1.4
      });
      tagStorey(s0, 'work', keptRing, 'Park Arcade Market & Trade Stalls', 'ring');

      const s1 = AI.barPlate({
        id: 'af.cw.s1', level: 1, y: 90.4, h: 4.8, path: chordPath, depth: 30, side: 'both', cw: 3.0, roomW: 11,
        kinds: cyc(['sickbay', 'study', 'strongroom', 'sickbay', 'store']), ends: ['core', 'core'], door: 1.3
      });
      tagStorey(s1, 'work', keptRing, 'Settlement Clinic, Apothecary & Offices', 'ring');

      const s2 = AI.barPlate({
        id: 'af.cw.s2', level: 2, y: 96.4, h: 4.8, path: chordPath, depth: 28, side: 'both', cw: 2.8, roomW: 10,
        kinds: cyc(['study', 'library', 'school', 'workshop']), ends: ['core', 'core'], door: 1.3
      });
      tagStorey(s2, 'work', keptRing, 'Guild Chambers & Craft School', 'ring');

      const s3 = AI.barPlate({
        id: 'af.cw.s3', level: 3, y: 102.4, h: 4.8, path: chordPath, depth: 28, side: 'both', cw: 2.8, roomW: 11,
        kinds: cyc(['bath', 'hall', 'tavern', 'shrine']), ends: ['core', 'core'], door: 1.4
      });
      tagStorey(s3, 'rec', keptRing, 'Bathhouse, Social Halls & Skylight Lounge', 'ring');

      pushUnit({
        id: 'city_west', name: 'West City Center (Market, Clinic & Baths)', zone: 'ring', sector: 'work', kept: keptRing,
        x: -178, z: 20, w: 72, d: 172, types: ['civic', 'market', 'tavern'], storeys: [s0, s1, s2, s3]
      });
    }

    /* 6. EAST CITY CENTER VAULTED ARCADE (East N-S flank facet at x = +178 m, matching Soleri Plate 1 east wing) */
    {
      const chordPath = u => [178, -62 + 164 * u];
      const s0 = AI.barPlate({
        id: 'af.ce.s0', level: 0, y: 84.4, h: 5.2, path: chordPath, depth: 30, side: 'both', cw: 3.2, roomW: 11,
        kinds: cyc(['workshop', 'store', 'workshop', 'kitchen', 'store']), ends: ['core', 'core'], door: 1.4
      });
      tagStorey(s0, 'work', keptRing, 'East Park Arcade & Craft Works', 'ring');

      const s1 = AI.barPlate({
        id: 'af.ce.s1', level: 1, y: 90.4, h: 4.8, path: chordPath, depth: 30, side: 'both', cw: 3.0, roomW: 11,
        kinds: cyc(['study', 'strongroom', 'chartroom', 'study']), ends: ['core', 'core'], door: 1.3
      });
      tagStorey(s1, 'work', keptRing, 'Counting House, Registry & Assay', 'ring');

      const s2 = AI.barPlate({
        id: 'af.ce.s2', level: 2, y: 96.4, h: 4.8, path: chordPath, depth: 28, side: 'both', cw: 2.8, roomW: 10.5,
        kinds: cyc(['school', 'library', 'study', 'school']), ends: ['core', 'core'], door: 1.3
      });
      tagStorey(s2, 'work', keptRing, 'Academy, Scriptorium & Archive', 'ring');

      const s3 = AI.barPlate({
        id: 'af.ce.s3', level: 3, y: 102.4, h: 4.8, path: chordPath, depth: 28, side: 'both', cw: 2.8, roomW: 11,
        kinds: cyc(['hall', 'tavern', 'kitchen', 'library']), ends: ['core', 'core'], door: 1.4
      });
      tagStorey(s3, 'rec', keptRing, 'East Commons, Refectory & Club Rooms', 'ring');

      pushUnit({
        id: 'city_east', name: 'East City Center (Counting House, Academy & Commons)', zone: 'ring', sector: 'work', kept: keptRing,
        x: 178, z: 20, w: 72, d: 172, types: ['civic', 'market'], storeys: [s0, s1, s2, s3]
      });
    }

    /* 7 & 8. BATTERED NEOCLIFF DWELLING BASTIONS (West w1 & East e2: 5 stepped residential levels each) */
    [
      { id: 'bastion_west', b: L.bastions.find(x => x.id === 'af.bastion.w1') || L.bastions[5], label: 'West Neocliff Dwelling Bastion' },
      { id: 'bastion_east', b: L.bastions.find(x => x.id === 'af.bastion.e2') || L.bastions[2], label: 'East Neocliff Dwelling Bastion' }
    ].forEach(BS => {
      const B = BS.b, am = B.am, storeys = [];
      for (let lv = 0; lv < 5; lv++) {
        const y = 84.4 + lv * 10.0, t = (y - D.PLATEAU) / (D.Y_RING_TOP - D.PLATEAU);
        const rOuter = (B.rOut0 + (B.rOut1 - B.rOut0) * t) - 4;
        const rInner = B.rIn + 4;
        const p0 = [D.RING_CX + rInner * Math.cos(am), D.RING_CZ + rInner * Math.sin(am)];
        const p1 = [D.RING_CX + rOuter * Math.cos(am), D.RING_CZ + rOuter * Math.sin(am)];
        const st = AI.barPlate({
          id: 'af.' + BS.id + '.s' + lv, level: lv, y: y, h: 3.8,
          path: u => [p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u],
          depth: 30, side: 'both', cw: 2.4, roomW: 7.2,
          kinds: cyc(['bedroom', 'kitchen', 'bedroom', 'hall', 'dormitory', 'study']), ends: ['core', null], door: 1.0
        });
        tagStorey(st, 'living', keptBastions, 'Terrace Dwelling Tier ' + (lv + 1), 'bastions');
        storeys.push(st);
      }
      pushUnit({
        id: BS.id, name: BS.label + ' (Stepped Apartments)', zone: 'bastions', sector: 'living', kept: keptBastions,
        x: B.cx, z: B.cz, r: 46, types: ['dwelling-multi'], storeys: storeys
      });
    });

    /* 9. PROMENADE MUSHROOM-PIER RECREATION BELVEDERE (y = 152.4, 159.0 m on East Promenade) */
    {
      const pv = L.promenade.pavilions[1];
      const s0 = AI.hallPlate({
        id: 'af.prom.s0', level: 0, y: 152.4, h: 4.8,
        poly: rectPoly(pv.x - 13, pv.x + 13, pv.z - 9, pv.z + 9), kind: 'tavern', doorEdge: 0, doorW: 2.0, furnish: keptRing, recipe: 'stern-lounge'
      });
      tagStorey(s0, 'rec', keptRing, 'Mushroom-Pier Belvedere Lounge & Tavern', 'ring');

      const s1 = AI.hallPlate({
        id: 'af.prom.s1', level: 1, y: 159.0, h: 4.8,
        poly: rectPoly(pv.x - 13, pv.x + 13, pv.z - 9, pv.z + 9), kind: 'hall', doorEdge: 0, doorW: 2.0, furnish: keptRing, recipe: 'greenhouse'
      });
      tagStorey(s1, 'rec', keptRing, 'Roof Conservatory & Tea Garden', 'ring');

      pushUnit({
        id: 'promenade_rec', name: 'Promenade Belvedere (Lounge & Conservatory)', zone: 'ring', sector: 'rec', kept: keptRing,
        x: pv.x, z: pv.z, w: 32, d: 24, types: ['tavern', 'civic'], storeys: [s0, s1]
      });
    }

    /* 10. DOMED ROTUNDA ("TOURIST CENTER" & RESIDENTIAL ATRIUM DRUM, R = 40 m) */
    {
      const rx = D.ROT_X, rz = D.ROT_Z, rOut = () => D.ROT_R - 1.8;
      /* L0 (y = 70.4): Grand Pilgrim & Tourist Reception Ring + Central Atrium Plaza */
      const s0 = AI.ringPlate({
        id: 'af.rot.s0', level: 0, y: 70.4, h: 5.6, cx: rx, cz: rz, rOut: rOut, depth: 9.0, cw: 3.0, roomW: 8.5, sym: 12,
        kinds: cyc(['hall', 'tavern', 'store', 'shrine']), core: { r: 14, kind: 'hall', recipe: 'reception' }
      });
      tagStorey(s0, 'rec', keptRing, 'Grand Tourist & Pilgrim Reception Concourse', 'ring');

      /* L1 (y = 78.4): Grand Refectory & Kitchens */
      const s1 = AI.ringPlate({
        id: 'af.rot.s1', level: 1, y: 78.4, h: 5.2, cx: rx, cz: rz, rOut: rOut, depth: 9.0, cw: 2.8, roomW: 8.5, sym: 12,
        kinds: cyc(['kitchen', 'hall', 'tavern', 'store']), core: { r: 14, kind: 'hall', recipe: 'dining-hall' }
      });
      tagStorey(s1, 'rec', keptRing, 'Rotunda Grand Refectory & Feast Ring', 'ring');

      /* L2 (y = 96.4): Administration, Chart & Archive Ring */
      const s2 = AI.ringPlate({
        id: 'af.rot.s2', level: 2, y: 96.4, h: 4.4, cx: rx, cz: rz, rOut: rOut, depth: 9.0, cw: 2.6, roomW: 7.5, sym: 12,
        kinds: cyc(['study', 'library', 'chartroom', 'strongroom'])
      });
      tagStorey(s2, 'work', keptRing, 'Chancery, Harbour Registry & Archives', 'ring');

      /* L3 & L4 (y = 122.4, 152.4): Sunlit Atrium Residential Rings */
      const s3 = AI.ringPlate({
        id: 'af.rot.s3', level: 3, y: 122.4, h: 4.0, cx: rx, cz: rz, rOut: rOut, depth: 9.0, cw: 2.6, roomW: 7.0, sym: 12,
        kinds: cyc(['bedroom', 'kitchen', 'bedroom', 'hall'])
      });
      tagStorey(s3, 'living', keptRing, 'Lower Atrium Residential Ring', 'ring');

      const s4 = AI.ringPlate({
        id: 'af.rot.s4', level: 4, y: 152.4, h: 4.0, cx: rx, cz: rz, rOut: rOut, depth: 9.0, cw: 2.6, roomW: 7.0, sym: 12,
        kinds: cyc(['bedroom', 'dormitory', 'kitchen', 'study'])
      });
      tagStorey(s4, 'living', keptRing, 'Upper Atrium Residential Ring', 'ring');

      /* L5 (y = 186.4): Oculus Dome Observatory & Gallery */
      const s5 = AI.ringPlate({
        id: 'af.rot.s5', level: 5, y: 186.4, h: 5.0, cx: rx, cz: rz, rOut: rOut, depth: 9.0, cw: 2.8, roomW: 8.5, sym: 12,
        kinds: cyc(['library', 'hall', 'shrine', 'study']), core: { r: 13, kind: 'hall', recipe: 'gallery' }
      });
      tagStorey(s5, 'rec', keptRing, 'Oculus Dome Gallery & Observatory', 'ring');

      pushUnit({
        id: 'rotunda', name: 'Domed Rotunda (Concourse, Refectory & Atrium Dwellings)', zone: 'ring', sector: 'rec', kept: keptRing,
        x: rx, z: rz, r: D.ROT_R + 2, types: ['civic', 'inn', 'dwelling-multi'], storeys: [s0, s1, s2, s3, s4, s5]
      });
    }

    /* 11. CENTRAL SEA-CLIFF SKYSCRAPER T3 (Lower trays L0..L2 = 'ring', Upper storeys L3..L5 = 'towers_upper') */
    {
      const T3 = L.towers[3];
      const bar = (id, lv, y, kinds, sec, nm, zn, kp) => {
        const st = AI.barPlate({
          id: id, level: lv, y: y, h: 3.8,
          path: u => [T3.x - 14 + 28 * u, T3.z], depth: 24, side: 'both', cw: 2.4, roomW: 6.8,
          kinds: kinds, ends: ['core', null], door: 1.0
        });
        return tagStorey(st, sec, kp, nm, zn);
      };
      const tStoreys = [
        bar('af.t3.s0', 0, 60.4, cyc(['workshop', 'store', 'study']), 'work', 'Cliff Plinth Transfer & Marine Studios', 'ring', keptRing),
        bar('af.t3.s1', 1, 92.4, cyc(['workshop', 'study', 'library', 'workshop']), 'work', 'Lower Cliff Tray — Living-Working Studios', 'ring', keptRing),
        bar('af.t3.s2', 2, 128.4, cyc(['study', 'bedroom', 'kitchen', 'workshop']), 'work', 'Mid Cliff Tray — Artisan Live-Work Suites', 'ring', keptRing),
        tagStorey(AI.hallPlate({
          id: 'af.t3.s3', level: 3, y: 164.4, h: 4.4,
          poly: rectPoly(T3.x - 13, T3.x + 13, T3.z - 15, T3.z + 11), kind: 'hall', doorEdge: 2, doorW: 2.0, furnish: keptTowersUpper, recipe: 'crew-mess'
        }), 'rec', keptTowersUpper, 'Sea-View Cantilevered Sky-Garden Commons', 'towers_upper'),
        bar('af.t3.s4', 4, 200.4, cyc(['bedroom', 'kitchen', 'bedroom', 'dormitory']), 'living', 'Upper Tower Cellular Apartments', 'towers_upper', keptTowersUpper),
        bar('af.t3.s5', 5, 236.4, cyc(['bedroom', 'hall', 'kitchen', 'study']), 'living', 'High Cliff Lookout Apartments', 'towers_upper', keptTowersUpper)
      ];
      pushUnit({
        id: 'tower_central', name: 'Sea-Cliff Skyscraper 4 (Living-Working & Tower Flats)', zone: 'towers_upper', sector: 'living',
        kept: keptRing || keptTowersUpper, x: T3.x, z: T3.z, w: 36, d: 36, types: ['dwelling-multi', 'industry'], storeys: tStoreys
      });
    }

    /* 12. 300 M COMPLEX SKY-CROWN (Hanging Sky-Garden, Cultural Assembly Hall & Chart Observatory) */
    {
      const cx = L.towers[3].x, cz = L.towers[3].z;
      const s0 = AI.hallPlate({
        id: 'af.cr.s0', level: 0, y: 258.4, h: 5.6,
        poly: rectPoly(cx - 42, cx + 42, cz - 14, cz + 14), kind: 'hall', doorEdge: 2, doorW: 2.6, furnish: keptCrown, recipe: 'greenhouse'
      });
      tagStorey(s0, 'rec', keptCrown, 'Hanging Sky-Garden & Hydroponic Conservatory', 'crown');

      const s1 = AI.hallPlate({
        id: 'af.cr.s1', level: 1, y: 266.4, h: 6.0,
        poly: rectPoly(cx - 38, cx + 38, cz - 14, cz + 14), kind: 'hall', doorEdge: 2, doorW: 2.6, furnish: keptCrown, recipe: 'officers-hall'
      });
      tagStorey(s1, 'rec', keptCrown, 'Cultural Center & Settlement Council Hall', 'crown');

      const s2 = AI.hallPlate({
        id: 'af.cr.s2', level: 2, y: 274.4, h: 5.4,
        poly: rectPoly(cx - 28, cx + 28, cz - 12, cz + 12), kind: 'chartroom', doorEdge: 2, doorW: 2.2, furnish: keptCrown, recipe: 'chart-deck'
      });
      tagStorey(s2, 'work', keptCrown, 'Sea-Watch Observatory, Beacon & Comms Deck', 'crown');

      pushUnit({
        id: 'sky_crown', name: '300 m Sky-Crown (Sky-Gardens, Cultural Hall & Observatory)', zone: 'crown', sector: 'rec', kept: keptCrown,
        x: cx, z: cz, w: 92, d: 34, types: ['civic', 'park'], storeys: [s0, s1, s2]
      });
    }

    return { state: stMode, zones: Z, units: units };
  }

  /* Compute exact architectural floor area (m2) and population/work/rec capacity across the whole complex,
     scaling representative bastion/tower plates across all 9 bastions and 7 skyscrapers, plus explicit room counts. */
  function areaSummary(P, built) {
    const bySector = { living: 0, work: 0, rec: 0, infra: 0 };
    const sampledRooms = { living: 0, work: 0, rec: 0, infra: 0, total: 0 };
    const multOf = {
      harbour_works: 1.5,
      auto_vaults: 2.0,
      linear_west: 1.75,
      linear_east: 1.75,
      city_west: 2.5,
      city_east: 2.5,
      bastion_west: 4 * 2.4,   /* 4 West bastions x 12 storeys / 5 sampled */
      bastion_east: 5 * 2.4,   /* 5 East bastions x 12 storeys / 5 sampled */
      promenade_rec: 6,        /* 6 Mushroom-pier belvederes */
      rotunda: 4.2,            /* 26 storeys / 6 sampled */
      tower_central: 7 * 7.5,  /* 7 Cliff skyscrapers x ~45 storeys / 6 sampled */
      sky_crown: 2.4           /* Full 7-tower span */
    };

    let keptFloor = 0, grossFloor = 0, keptLiving = 0;
    built.units.forEach(u => {
      const mult = multOf[u.id] == null ? 1 : multOf[u.id];
      u.storeys.forEach(st => {
        const stKept = st.kept != null ? st.kept : u.kept;
        st.rooms.forEach(R => {
          sampledRooms[R.sector] = (sampledRooms[R.sector] || 0) + 1;
          sampledRooms.total++;
          const a = R.poly ? (Math.abs(R.poly.reduce((s, p, i) => {
            const q = R.poly[(i + 1) % R.poly.length];
            return s + p[0] * q[1] - q[0] * p[1];
          }, 0)) / 2) : 180;
          const fullA = a * mult;
          bySector[R.sector] = (bySector[R.sector] || 0) + fullA;
          grossFloor += fullA;
          if (stKept) {
            keptFloor += fullA;
            if (R.sector === 'living') keptLiving += fullA;
          }
        });
      });
    });

    /* Soleri's Arcoforte peak benchmark: ~20,000 people (~22 m2 living net per person); refurbished centerpiece holds ~36% active occupancy */
    const peakResidents = Math.round(bySector.living / 11.2);
    const refurbishedResidents = keptLiving <= 0 ? 0 : Math.round(Math.round(keptLiving / 11.2) * 0.36);
    const workSlots = Math.round(bySector.work / 24);
    const recCapacity = Math.round(bySector.rec / 8) + 650; /* includes outdoor Park Amphitheatre */

    return {
      grossM2: Math.round(grossFloor),
      keptM2: Math.round(keptFloor),
      bySectorM2: {
        living: Math.round(bySector.living),
        work: Math.round(bySector.work),
        rec: Math.round(bySector.rec),
        infra: Math.round(bySector.infra)
      },
      sampledUnits: built.units.length,
      sampledRooms: sampledRooms,
      peakPopulation: peakResidents,
      refurbishedPopulation: refurbishedResidents,
      workplaces: workSlots,
      recCapacity: recCapacity
    };
  }

  /* Export plain simulation-ready place records (`home`, `work`, `rec`) for a future settlement on core/simulation */
  function simPlaces(P, built, sockSpec) {
    const places = [];
    const zm = (built && built.zones) || (P && P.zones) || null;
    const zMap = sockSpec != null ? ARCOFORTE.resolveSocketZones(sockSpec, zm) : null;
    const cultFor = zn => {
      if (zMap) return zMap[zn] || 'refurbished';
      if (typeof sockSpec === 'string' && sockSpec) return sockSpec;
      return ARCOFORTE.zoneSocket(zn || 'ring', zm) || 'refurbished';
    };
    built.units.forEach(u => {
      if (!u.kept) return;
      u.storeys.forEach(st => {
        if (!st.kept) return;
        const zn = st.zone || u.zone || 'ring';
        const area = st.rooms.reduce((s, r) => s + (r.poly ? 36 : 0), 0);
        places.push({
          id: 'sim.' + st.id,
          unit: u.id,
          zone: zn,
          name: u.name + ' — ' + st.levelName,
          sector: st.sector,
          activity: st.sector === 'living' ? 'SLEEP' : st.sector === 'work' ? 'WORK' : 'LEISURE',
          culture: cultFor(zn),
          at: [u.x, st.y, u.z],
          capacity: Math.max(8, Math.round(area / (st.sector === 'rec' ? 10 : 18)))
        });
      });
    });
    places.push({
      id: 'sim.af.park.amphitheatre',
      unit: 'park',
      zone: 'ring',
      name: P.park.amphitheatre.name,
      sector: 'rec',
      activity: 'LEISURE',
      culture: cultFor('ring'),
      at: [P.park.amphitheatre.x, P.park.amphitheatre.y, P.park.amphitheatre.z],
      capacity: 650
    });
    return places;
  }

  /* Furnish all kept storeys according to either a single culture string or a per-zone socket map */
  function furnishAll(AI, built, cat, sockSpec, seed) {
    installDresses(AI, cat);
    const spec = sockSpec == null ? ARCOFORTE.socket() : sockSpec;
    const zm = built.zones || null;
    const zSock = ARCOFORTE.resolveSocketZones(spec, zm);
    const baseSeed = seed == null ? 11 : seed;

    /* Group kept storeys by their assigned socket key so identical room shapes still share templates */
    const groups = {};
    const order = [];
    built.units.forEach(u => {
      u.storeys.forEach(st => {
        if (!st.kept) return;
        const zn = st.zone || u.zone || 'ring';
        const skKey = zSock[zn];
        if (!skKey || !SOCKETS[skKey]) return;
        if (!groups[skKey]) { groups[skKey] = []; order.push(skKey); }
        let bEntry = groups[skKey].find(b => b.id === u.id);
        if (!bEntry) {
          bEntry = { id: u.id, name: u.name, zone: u.zone, sector: u.sector, kept: true, storeys: [], floors: true, hollow: null };
          groups[skKey].push(bEntry);
        }
        bEntry.storeys.push(st);
      });
    });

    const allRooms = [];
    let totalPieces = 0, totalTemplates = 0;
    let firstAdapter = cat;
    order.forEach((skKey, gi) => {
      const sk = SOCKETS[skKey];
      const blds = groups[skKey];
      const combinedPlan = {
        type: order.length === 1 ? 'arcoforte' : ('arcoforte.' + skKey),
        d: 0,
        state: 'intact',
        name: 'Arcoforte',
        furnish: blds.length > 0,
        culture: sk.culture,
        wealth: sk.wealth,
        types: ['civic', 'dwelling-multi', 'industry'],
        buildings: blds
      };
      const F = AI.furnishPlan(combinedPlan, cat, {
        culture: sk.culture,
        cultures: sk.cultures,
        wealth: sk.wealth,
        seed: baseSeed + gi * 101
      });
      if (gi === 0 && F.adapter) firstAdapter = F.adapter;
      (F.rooms || []).forEach(r => {
        r.socketKey = skKey;
        r.wealth = sk.wealth;
        r.adapter = F.adapter;
        allRooms.push(r);
      });
      totalPieces += F.pieces || 0;
      totalTemplates += F.templates || 0;
    });

    const primaryKey = typeof spec === 'string' ? (SOCKETS[spec] ? spec : 'refurbished') : (order[0] || 'refurbished');
    const primaryProfile = SOCKETS[primaryKey] || SOCKETS.refurbished;
    const byUnit = {};
    built.units.forEach(u => { byUnit[u.id] = { rooms: [], pieces: 0, zone: u.zone }; });
    allRooms.forEach(r => {
      const uid = r.R && r.R.building;
      if (byUnit[uid]) {
        byUnit[uid].rooms.push(r);
        byUnit[uid].pieces += r.placements.length;
      }
    });
    return {
      socket: spec,
      zones: zSock,
      profile: primaryProfile,
      full: { rooms: allRooms, pieces: totalPieces, templates: totalTemplates, adapter: firstAdapter, catalog: cat },
      byUnit: byUnit
    };
  }

  const API = { SOCKETS, PALETTES, SOCKET_PIECES, installPieces, installDresses, buildPlans, furnishAll, areaSummary, simPlaces };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  return API;
})();
