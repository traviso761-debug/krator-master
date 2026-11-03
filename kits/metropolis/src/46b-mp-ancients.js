// ================================================================= METROPOLIS — the Ancients kit's buildings: records  [G data]
// The owner, 2026-11-03: bring in from kits/ancients the bunker, Sky A, the honeycomb blocks, the laboratories, and the low and mid rises
// that round them out. Each is the kit's own builder (read in place, kits/metropolis/build.py ANC_BUILDERS), run once, intact, into a hero
// of its own (55-mp-hero-ancients.js); nothing of it is redrawn here. A record says which builder, what to call it, and the numbers the
// stage, the inspector and the cut-away need: the footprint and heights measured off the drawn hero (centred on its plan; MP.ancientSize, 2026-11-03),
// the storey height the cut steps by, its triangle budget (the measured count and 5%), and a scale where the kit drew it too small
// for a working plan (the quality pass, 2026-11-03: the Honeycomb Block's storeys were 2.3 m; the owner wanted the Houses bigger): footprint
// and heights are after it. No plans, shells or impostors yet; no THREE, no DOM.
MP.ANCIENTS = {
  /* the four the owner named */
  bunker: { id: 'bunker', name: 'The Redoubt', fn: 'buildBunker', kind: 'midrise', from: 'Bunker (46-bunker.js)', sh: 4, footprint: { w: 156, d: 158 }, height: { roof: 60, tip: 79 }, tris: 5000 },
  skya: { id: 'skya', name: 'Skyscraper A', fn: 'buildSkyA', kind: 'skyscraper', from: 'Skyscraper A (52-sky-abc.js)', sh: 4, footprint: { w: 219, d: 218 }, height: { roof: 420, tip: 484 }, tris: 107000 },
  comb: { id: 'comb', name: 'The Honeycomb Block', fn: 'buildYvCombShort', kind: 'midrise', from: 'Apartments, honeycomb block, short (8am-yv-b-comb.js)', sh: 3.6, scale: 1.5, footprint: { w: 92, d: 76 }, height: { roof: 28, tip: 30 }, tris: 52000 },
  apartments: { id: 'apartments', name: 'The Apartments', fn: 'buildApartments', kind: 'midrise', from: 'Apartments A, B (the honeycomb wall), C (82-apartments.js)', sh: 3.6, footprint: { w: 418, d: 88 }, height: { roof: 60, tip: 63 }, tris: 134000 },
  lab: { id: 'lab', name: 'The Reliquary', fn: 'buildLab', kind: 'midrise', from: 'Laboratory, the Reliquary, and its reactor hut (89-lab.js)', sh: 4, footprint: { w: 167, d: 104 }, height: { roof: 120, tip: 123 }, tris: 61000 },
  starlab: { id: 'starlab', name: 'The Star Laboratory', fn: 'buildAltLab', kind: 'midrise', from: 'The Star laboratory (8ak-alt-c-works.js)', sh: 4, footprint: { w: 72, d: 100 }, height: { roof: 25, tip: 25 }, tris: 17000 },
  /* the low and mid rises round them */
  offices: { id: 'offices', name: 'The Offices', fn: 'buildOffices', kind: 'midrise', from: 'Office A, the flared ring, and Office B, the lobed tower (42-offices.js)', sh: 4, footprint: { w: 199, d: 138 }, height: { roof: 58, tip: 59 }, tris: 71000 },
  library: { id: 'library', name: 'The Crown Library', fn: 'buildLibrary', kind: 'midrise', from: 'Library, the Crown, and its reading hall (48-library.js)', sh: 4.5, footprint: { w: 149, d: 104 }, height: { roof: 46, tip: 57 }, tris: 22000 },
  police: { id: 'police', name: 'The Watch', fn: 'buildPolice', kind: 'midrise', from: 'Police station, the Watch (73-police.js)', sh: 4, footprint: { w: 160, d: 160 }, height: { roof: 60, tip: 67 }, tris: 12000 },
  quad: { id: 'quad', name: 'The Cloisters', fn: 'buildYvQuad', kind: 'midrise', from: 'Quadrangle, the Cloisters (8am-yv-a-quad.js)', sh: 4, footprint: { w: 121, d: 104 }, height: { roof: 36, tip: 37 }, tris: 58000 },
  houses: { id: 'houses', name: 'The Houses', fn: 'buildHouses', kind: 'midrise', from: 'House A, petal; B, hypar shell; C, lobed cluster (81-houses-abc.js)', sh: 3.5, scale: 1.5, footprint: { w: 146, d: 45 }, height: { roof: 21, tip: 21 }, tris: 23000 },
  stalks: { id: 'stalks', name: 'The Capsule Stalks', fn: 'buildHostStalks', kind: 'midrise', from: 'The Capsule Stalks, plug-in cores (8ap-host-d-stalks.js)', sh: 3.6, footprint: { w: 80, d: 86 }, height: { roof: 66, tip: 69 }, tris: 27000 },
  bellhall: { id: 'bellhall', name: 'The Bell Hall', fn: 'buildHostBellHall', kind: 'midrise', from: 'The Bell Hall: drums, a concave wall and a campanile (8ap-host-e-bellhall.js)', sh: 4.5, footprint: { w: 88, d: 92 }, height: { roof: 40, tip: 79 }, tris: 20000 }
};
MP.ANCIENT_KEYS = ['bunker', 'skya', 'comb', 'apartments', 'lab', 'starlab', 'offices', 'library', 'police', 'quad', 'houses', 'stalks', 'bellhall'];
