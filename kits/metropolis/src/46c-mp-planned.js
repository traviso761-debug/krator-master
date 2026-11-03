// ================================================================= METROPOLIS — the designs with plans  [G data]
// The owner, 2026-11-03: a full layout, then the ruin states, for every building, in batches of three. A design given plans gets a family record
// beside the Spindle's and the Ledger's (MP.FAMILY, marked design: true): its storeys and what each is for (the zones, as 40's mpLevels), its core
// (a round one of stairs and lifts, or an atrium ringed by galleries with the lifts standing in it), its skin's radius at a height (envR: the
// plans' and the walls' source; the hero is still the design's own, 54), its facade's bays (42), and its ruin states. MP.families() stays the
// shelled families; MP.planned() is every family with plans. Batch 1: the Telescope, the Cupola, the Spiral. No THREE, no DOM.
MP.PLANNED_KEYS = [];
MP.planned = function () { return Object.keys(MP.FAMILY).map(function (k) { return MP.FAMILY[k]; }); };
MP.families = function () { return Object.keys(MP.FAMILY).map(function (k) { return MP.FAMILY[k]; }).filter(function (F) { return !F.design; }); };
(function () {
  /* the ruin states a design answers: the same seven, its own notes */
  function ruins(o) {
    return Object.assign({
      intact: { note: 'whole, as built' },
      gutted: { glass: 0, strips: 0, breach: 0.1, stain: 0.75, keep: 1, note: 'glass gone, burnt out, streaked' },
      crown: { keep: 0.8, note: 'the top fallen in' },
      broken: { keep: 0.55, note: 'torn through the middle, the upper part in the street' },
      stump: { keep: 0.2, core: 0.3, note: 'the lowest storeys and the core' },
      skeleton: { keep: 0.6, bare: 0.7, note: 'the skin gone above the plant floor; slabs and piers stand' },
      fallen: { keep: 0.08, along: 1, note: 'down: a long mound' }
    }, o || {});
  }
  /* zones as levels with their own storey heights; a zone may give h, else the design's */
  function levels(zones) {
    var L = [], y = 0;
    zones.forEach(function (Z, zi) { for (var i = 0; i < Z.n; i++) { var h = Z.h; L.push({ k: L.length, y: Math.round(y * 1000) / 1000, h: h, use: Z.use, zone: zi, nth: i }); y += h; } });
    return L;
  }
  function round4(n) { return Math.max(1, Math.round(n)); }
  function core(r, last, kind) {
    var c = { kind: 'round', r: r, stepAt: Infinity, rUp: r, shafts: [] };
    if (kind === 'atrium') return c;
    /* a small core (under 6 m) holds a stair and a lift side by side; a larger one the Spindle's four */
    if (r < 6) { c.shafts = [{ id: 'stair.n', kind: 'stair', x: 0, z: -1.45, w: 3.2, d: 2.6, from: 0, to: last }, { id: 'lift.s', kind: 'lift', x: 0, z: 1.45, w: 2.4, d: 2.6, from: 0, to: last }]; return c; }
    c.shafts = [{ id: 'stair.n', kind: 'stair', x: 0, z: -r * 0.46, w: 3.2, d: 2.6, from: 0, to: last }, { id: 'stair.s', kind: 'stair', x: 0, z: r * 0.46, w: 3.2, d: 2.6, from: 0, to: last },
      { id: 'lift.e', kind: 'lift', x: r * 0.49, z: 0, w: 2.4, d: 3, from: 0, to: last }, { id: 'lift.w', kind: 'lift', x: -r * 0.49, z: 0, w: 2.4, d: 3, from: 0, to: last }];
    return c;
  }

  // ---- the Telescope: five octagonal adobe drums, 35.2 m each, stepping in (31, 27, 23, 19, 15 m), a lobby, a cap. Its skin is the
  // octagon's inner circle (cos 22.5 degrees) less the glass's set-back. Its flats are one-bedroom: 48 bays a turn give a flat four windows,
  // too few for a living room and two bedrooms (the Spindle's two-bedroom flats are where it has 72)
  (function () {
    var D = MP.DESIGNS.telescope, st = D.stages, hS = D.height.roof / st.length, h0 = (hS - D.sh) / Math.max(1, Math.round((hS - D.sh) / D.sh)), n0 = round4((hS - D.sh) / D.sh), hk = hS / round4(hS / D.sh), nk = round4(hS / D.sh);
    var zones = [{ use: 'lobby', n: 1, h: D.sh }, { use: 'market', n: 1, h: h0 }, { use: 'clinic', n: 2, h: h0 }, { use: 'offices', n: n0 - 3, h: h0 },
      { use: 'offices', n: 4, h: hk }, { use: 'records', n: 3, h: hk }, { use: 'plant', n: 1, h: hk }, { use: 'school', n: 1, h: hk },
      { use: 'flatsB', n: nk, h: hk }, { use: 'flatsB', n: nk - 1, h: hk }, { use: 'plant', n: 1, h: hk },
      { use: 'hydroponics', n: 4, h: hk }, { use: 'records', n: 3, h: hk }, { use: 'skylobby', n: 2, h: hk }];
    var L = levels(zones), last = L.length - 1;
    MP.FAMILY.telescope = {
      id: 'telescope', name: D.name, kind: D.kind, language: D.language, culture: 'ancient', tris: D.tris, design: true,
      footprint: { shape: 'circle', r: st[0] }, height: D.height, storeys: L.length, levels: L, zones: zones,
      envR: function (y) { var k = Math.max(0, Math.min(st.length - 1, Math.floor(y / hS))); return st[k] * Math.cos(Math.PI / 8) - 1.0; },
      portals: [Math.PI * 5 / 8, Math.PI * 13 / 8], crown: { k: 'cap', r: st[st.length - 1] }, core: core(6.5, last), secScale: 1, mat: 'adobe',
      bays: { low: 48, high: 48, split: Infinity }, fall: Math.PI * 5 / 8,
      ruins: ruins({ crown: { keep: 0.8, note: 'the top drum and its cap fallen in' }, broken: { keep: 0.6, note: 'torn at the third drum' }, stump: { keep: 0.2, core: 0.3, note: 'the first drum' } })
    };
  })();

  // ---- the Cupola: a transit hall (7.2 m) under a scalloped dome, three gallery storeys round an atrium above it to the dome's spring at 24 m;
  // four stair and lift towers stand in the atrium (and the hall), on the diagonals
  (function () {
    var D = MP.DESIGNS.cupola, H = D.height.roof, hs = (H - D.hall) / 3, R = D.r - 0.5, band = 12, rc = R - 0.45 - band - 1.8;
    var zones = [{ use: 'hall', n: 1, h: D.hall }, { use: 'market', n: 1, h: hs }, { use: 'offices', n: 1, h: hs }, { use: 'school', n: 1, h: hs }];
    var L = levels(zones), last = L.length - 1, c = core(rc, last, 'atrium');
    [0, 1, 2, 3].forEach(function (q) { var a = Math.PI / 4 + q * Math.PI / 2, rr = rc - 2.6; c.shafts.push({ id: (q % 2 ? 'lift.' : 'stair.') + q, kind: q % 2 ? 'lift' : 'stair', x: +(Math.cos(a) * rr).toFixed(3), z: +(Math.sin(a) * rr).toFixed(3), w: 3.2, d: 3.2, from: 0, to: last }); });
    c.atrium = true;
    MP.FAMILY.cupola = {
      id: 'cupola', name: D.name, kind: D.kind, language: D.language, culture: 'ancient', tris: D.tris, design: true,
      footprint: { shape: 'circle', r: D.r }, height: D.height, storeys: L.length, levels: L, zones: zones,
      envR: function () { return R; }, band: band, portals: [0, Math.PI / 2, Math.PI, Math.PI * 1.5], crown: { k: 'dome', r: R }, core: c, secScale: 3, mat: 'white',
      bays: { low: 72, high: 72, split: Infinity }, fall: Math.PI / 4,
      ruins: ruins({ gutted: { glass: 0, strips: 0, breach: 0.1, stain: 0.75, keep: 1, note: 'glass gone, the hall burnt out' }, crown: { keep: 0.75, note: 'the dome fallen into the hall' }, broken: { keep: 0.5, note: 'a third of the drum down' }, stump: { keep: 0.3, note: 'the hall\'s walls' }, skeleton: { keep: 0.75, bare: 0.6, note: 'the galleries\' slabs and piers' } })
    };
  })();

  // ---- the Spiral: an adobe cone (30 m to 8 m over 30 m) wound by a ramp; a glass-fronted lobby, then storeys of 4.25 m in the cone, the
  // smallest at the top a stair head under the drum
  (function () {
    var D = MP.DESIGNS.spiral, H = D.height.roof, hs = (H - D.sh) / 6;
    var zones = [{ use: 'lobby', n: 1, h: D.sh }, { use: 'market', n: 1, h: hs }, { use: 'clinic', n: 1, h: hs }, { use: 'school', n: 1, h: hs }, { use: 'records', n: 1, h: hs }, { use: 'plant', n: 1, h: hs }, { use: 'tanks', n: 1, h: hs }];
    var L = levels(zones), last = L.length - 1;
    MP.FAMILY.spiral = {
      id: 'spiral', name: D.name, kind: D.kind, language: D.language, culture: 'ancient', tris: D.tris, design: true,
      footprint: { shape: 'circle', r: D.r0 }, height: D.height, storeys: L.length, levels: L, zones: zones,
      envR: function (y) { return D.r0 + (D.r1 - D.r0) * Math.min(1, Math.max(0, y) / H) - (y < D.sh ? 0.8 : 0.5); },
      portals: [Math.PI], crown: { k: 'dome', r: D.r1 }, core: core(4.4, last), secScale: 1, mat: 'adobe',
      bays: { low: 48, high: 48, split: Infinity }, fall: Math.PI + 0.5,
      ruins: ruins({ crown: { keep: 0.75, note: 'the drum and dome fallen in' }, stump: { keep: 0.3, core: 0.4, note: 'the lobby and the first turn' } })
    };
  })();
  MP.PLANNED_KEYS = ['telescope', 'cupola', 'spiral'];
})();
