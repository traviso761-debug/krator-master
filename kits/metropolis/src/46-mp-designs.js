// ================================================================= METROPOLIS — the other fourteen: records  [G data]
// PLAN.md section 4's designs past the Spindle and the Ledger, as records the hero builder (54) draws: intact, close up, without interiors yet (their plans, shells
// and impostors come after the shells' review). Each record: id, name, kind, language, the hero's triangle budget, footprint, heights (roof, tip), the storey height
// and the shape's own numbers. Kept apart from MP.FAMILY (the two with plans and audits) until each has its plans. No THREE, no DOM.
MP.DESIGNS = {
  // ---- skyscrapers
  /* S2 (the owner, 2026-11-03: the Gantry's ribbed slab tossed as dull): five bronze pipes of different heights in a shallow arc, bound by bronze bands (no transit tube
     till a network joins buildings); each pipe its own storeys and a conical cap with a mouth */
  organ: { id: 'organ', name: 'The Organ', kind: 'skyscraper', language: 7, tris: 90000, footprint: { w: 96, d: 34 }, height: { roof: 228, tip: 240 }, sh: 3.75,
    pipes: [[-38, 7, 9, 160], [-19, 1, 10, 198], [0, -2, 11, 228], [19, 1, 10, 208], [38, 7, 9, 180]], bands: [36, 72, 108, 144] },
  wedge: { id: 'wedge', name: 'The Wedge', kind: 'skyscraper', language: 2, tris: 45000, footprint: { w: 64, d: 56 }, height: { roof: 188, tip: 188 }, sh: 3.9,
    top: { hw: 20, hd: 15 }, lean: 8, slot: [122, 129.8] },
  yoke: { id: 'yoke', name: 'The Yoke', kind: 'skyscraper', language: 3, tris: 75000, footprint: { w: 124, d: 46 }, height: { roof: 172, tip: 196 }, sh: 3.9,
    legs: { x: 34, r: 16, swell: 5, y1: 90 }, body: { y: 120, rx: 52, ry: 54 }, arch: 60, /* the arch's 60 m is its height: the body's soffit at 66 m */ tints: [[1, 0.78, 0.76], [0.74, 0.93, 0.84], [0.84, 0.84, 1]] },
  reed: { id: 'reed', name: 'The Reed', kind: 'skyscraper', language: 6, tris: 60000, footprint: { w: 58, d: 24 }, height: { roof: 204, tip: 204 }, sh: 3.8,
    twist: 50, widen: 0.25 },
  telescope: { id: 'telescope', name: 'The Telescope', kind: 'skyscraper', language: 4, tris: 55000, footprint: { w: 62, d: 62 }, height: { roof: 176, tip: 188 }, sh: 4,
    stages: [31, 27, 23, 19, 15], cap: { r: 11, h: 12 } },
  stalk: { id: 'stalk', name: 'The Stalk', kind: 'skyscraper', language: 3, tris: 50000, footprint: { w: 68, d: 68 }, height: { roof: 156, tip: 236 }, sh: 3.6,
    stalk: { r0: 8, r1: 6 }, saucers: [{ y: 104, r: 34, t: 12, use: 'hotel' }, { y: 150, r: 24, t: 10, use: 'observatory' }] },
  swell: { id: 'swell', name: 'The Swell', kind: 'skyscraper', language: 5, tris: 110000, footprint: { w: 80, d: 80 }, height: { roof: 196, tip: 200 }, sh: 3.9,
    core: 16, lobes: { n: 4, at: 21, r: 13, swell: 8 }, balcony: 3, ledges: [10.8, 98, 196] },
  // ---- midrises
  terrace: { id: 'terrace', name: 'The Terrace', kind: 'midrise', language: 1, tris: 40000, footprint: { w: 128, d: 128 }, height: { roof: 42, tip: 42 }, sh: 4.2,
    rings: [64, 58, 52, 46, 40], court: 28, roofAccess: true /* the roof park: the core's head-house */ },
  cupola: { id: 'cupola', name: 'The Cupola', kind: 'midrise', language: 1, tris: 30000, footprint: { w: 104, d: 104 }, height: { roof: 24, tip: 44 }, sh: 4.2,
    r: 52, hall: 7.2, scallops: 12, lantern: 6, floorsY0: 7.2 /* the transit hall fills the first 7.2 m */ },
  crescent: { id: 'crescent', name: 'The Long Curve', kind: 'midrise', language: 1, tris: 40000, footprint: { w: 180, d: 60 }, height: { roof: 36, tip: 36 }, sh: 4,
    R: 150, width: 18, span: 1.2, steps: [36, 28, 20, 12], stepAt: 0.7 },
  terrarium: { id: 'terrarium', name: 'The Terrarium', kind: 'midrise', language: 2, tris: 40000, footprint: { w: 80, d: 80 }, height: { roof: 66, tip: 66 }, sh: 4,
    sphere: { y: 36, r: 30 }, legs: { n: 4, foot: 40, top: 20, y: 18, r: 2.6 }, trees: 26, floorsMaxY: 36 /* the forest under the dome above */ },
  arcades: { id: 'arcades', name: 'The Arcades', kind: 'midrise', language: 6, tris: 30000, footprint: { w: 84, d: 52 }, height: { roof: 26, tip: 26 }, sh: 6.5,
    court: { w: 52, d: 24 }, arch: { every: 12, h: 13 } },
  pods: { id: 'pods', name: 'The Pods', kind: 'midrise', language: 3, tris: 30000, footprint: { w: 120, d: 84 }, height: { roof: 48, tip: 52 }, sh: 3.8,
    pods: [{ x: -34, z: 0, y: 30, r: 22 }, { x: 34, z: 0, y: 30, r: 22 }], tube: { y: 31, r: 3.5 }, dome: { x: 0, z: 36, r: 18, h: 12 } },
  /* M8 (the owner, 2026-11-03: the Sand Block's stepped mass tossed as dull): an adobe cone wound by an outside ramp, five turns to a drum and a dome; dark doorways
     along the ramp */
  spiral: { id: 'spiral', name: 'The Spiral', kind: 'midrise', language: 4, tris: 30000, footprint: { w: 68, d: 68 }, height: { roof: 30, tip: 38 }, sh: 4.5,
    r0: 30, r1: 8, ramp: 4.2, turns: 5, dome: 6 }
};
MP.DESIGN_KEYS = ['organ', 'wedge', 'yoke', 'reed', 'telescope', 'stalk', 'swell', 'terrace', 'cupola', 'crescent', 'terrarium', 'arcades', 'pods', 'spiral'];
