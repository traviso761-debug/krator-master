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
  // ---- the Terrace: five rings of two storeys (8.4 m a tier) stepping in from 64 m to 40 m round a 28 m court. Its storeys are bands, outside
  // in: rooms at the windows (12 m deep), a corridor, on the wide tiers windowless rooms between and a second corridor with passages across,
  // and a 4.5 m service band on the court where the four stair and lift shafts stand at one radius on every tier (so they line up)
  (function () {
    var D = MP.DESIGNS.terrace, R = D.rings, hT = D.height.roof / R.length, sh = hT / 2, Rc = D.court + 0.5 + 0.45, rS = Rc + 2.25;
    var zones = [{ use: 'lobby', n: 1, h: sh }, { use: 'clinic', n: 1, h: sh }, { use: 'offices', n: 2, h: sh }, { use: 'school', n: 2, h: sh }, { use: 'records', n: 1, h: sh }, { use: 'offices', n: 3, h: sh }];
    var L = levels(zones), last = L.length - 1, sth = [0, 1, 2, 3].map(function (q) { return 2 * Math.PI * (6 * q + 1.5) / 24; });
    var KIND = { lobby: function (i) { return i % 6 === 0 ? 'concourse' : 'stall'; }, clinic: function (i) { return i % 6 === 2 ? 'store' : 'clinic'; }, offices: function (i) { return i % 4 === 3 ? 'meeting' : 'office'; },
      school: function (i) { return i % 7 === 3 ? 'store' : 'classroom'; }, records: function () { return 'stack'; } };
    MP.FAMILY.terrace = {
      id: 'terrace', name: D.name, kind: D.kind, language: D.language, culture: 'ancient', tris: D.tris, design: true,
      footprint: { shape: 'circle', r: R[0] }, height: D.height, storeys: L.length, levels: L, zones: zones,
      envR: function (y) { return R[Math.max(0, Math.min(R.length - 1, Math.floor(y / hT)))] - 0.5; },
      portals: [0, Math.PI / 2, Math.PI, Math.PI * 1.5], crown: { k: 'park', r: R[R.length - 1] }, secScale: 1, mat: 'white', fall: Math.PI / 4,
      core: { kind: 'round', r: Rc, stepAt: Infinity, rUp: Rc, bays: true, shafts: sth.map(function (th, q) { return { id: (q % 2 ? 'lift.' : 'stair.') + q, kind: q % 2 ? 'lift' : 'stair', x: +(Math.cos(th) * rS).toFixed(3), z: +(Math.sin(th) * rS).toFixed(3), w: 2.8, d: 2.8, from: 0, to: last }; }) },
      bays: { low: 100, high: 100, split: Infinity },
      plan: function (F, Lv, lib) {
        var k = Math.min(R.length - 1, Math.floor((Lv.y + 0.1) / hT)), rOut = R[k] - 0.5 - 0.45, W = rOut - Rc, kinds = KIND[Lv.use] || KIND.offices, CW = lib.CW, n0 = F.bays.low / 2;   /* two bays a room on every tier: its windows line up */
        var inner = { d: 4.5, n: 24, kinds: function (i) { return i % 3 ? 'store' : 'plant'; }, door: 'out' }, sh = sth.map(function (th, q) { return { id: (q % 2 ? 'lift.' : 'stair.') + q, th: th, band: 0 }; });
        var bands = W - 12 - 2 * CW - 4.5 >= 5
          ? [{ d: 12, n: n0, kinds: kinds, door: 'in' }, { d: CW, corr: true }, { d: W - 12 - 2 * CW - 4.5, n: 12, kinds: function (i) { return i % 2 ? 'stack' : 'store'; }, door: 'out', passage: function (i) { return i % 3 === 0; } }, { d: CW, corr: true }, inner]
          : [{ d: W - CW - 4.5, n: n0, kinds: kinds, door: 'in' }, { d: CW, corr: true }, inner];
        sh.forEach(function (s) { s.band = bands.length - 1; });
        return lib.rings(F, Lv, { rOut: rOut, rIn: Rc, bands: bands, shafts: sh });
      },
      ruins: ruins({ crown: { keep: 0.8, note: 'the top tier and its park fallen in' }, broken: { keep: 0.6, note: 'a third of the upper tiers down into the court' }, stump: { keep: 0.2, note: 'the ground tier' }, skeleton: { keep: 0.8, bare: 0.6, note: 'the upper tiers\' slabs and piers' } })
    };
  })();

  // ---- the Stalk: a 16 m stalk of lifts and stairs carrying a hotel saucer (two storeys of 3 m in its glazed band at 100.4 m) and an observatory
  // (one hall of 5 m at 147 m). Its storeys: the lobby round the stalk's foot, then the saucers' (the stalk between is all core)
  (function () {
    var D = MP.DESIGNS.stalk, S = D.stalk, sc = D.saucers, s0 = function (y) { return S.r0 + (S.r1 - S.r0) * Math.min(1, y / 170); };
    var hot = sc[0], obs = sc[1], hy = hot.y - hot.t * 0.3, oy = obs.y - obs.t * 0.3;
    var L = [{ k: 0, y: 0, h: 4.5, use: 'lobby', zone: 0, nth: 0 }, { k: 1, y: hy, h: hot.t * 0.25, use: 'hotel', zone: 1, nth: 0 }, { k: 2, y: hy + hot.t * 0.25, h: hot.t * 0.25, use: 'hotel', zone: 1, nth: 1 },
      { k: 3, y: oy, h: obs.t * 0.5, use: 'skylobby', zone: 2, nth: 0 }].map(function (q) { q.y = Math.round(q.y * 1000) / 1000; return q; });
    var c = core(6, L.length - 1);
    MP.FAMILY.stalk = {
      id: 'stalk', name: D.name, kind: D.kind, language: D.language, culture: 'ancient', tris: D.tris, design: true,
      footprint: { shape: 'circle', r: hot.r }, height: D.height, storeys: L.length, levels: L, zones: [{ use: 'lobby', n: 1 }, { use: 'hotel', n: 2 }, { use: 'skylobby', n: 1 }],
      envR: function (y) {
        if (y < 4.5) return S.r0 + 5 - 0.5;
        for (var i = 0; i < sc.length; i++) { var q = sc[i], b0 = q.y - q.t * 0.3, b1 = q.y + q.t * 0.2; if (y >= b0 - 0.5 && y <= b1 + 0.5) return q.r - (Math.min(b1, Math.max(b0, y)) - b0) * 0.25 - 0.4; }
        return s0(y);
      },
      slabR: function (y) { return this.envR(y); }, secR: s0, discs: sc.map(function (q) { return q.r; }),
      portals: [Math.PI / 2, -Math.PI / 2], crown: { k: 'saucer', r: obs.r }, core: c, secScale: 1, mat: 'white', fall: Math.PI / 2 + 0.6,
      bays: { low: 56, high: 56, split: Infinity },
      /* the hotel's storeys in bands: bedrooms at the windows (8 m), a corridor, a ring of restaurant and lounges with passages through it, the
         lift lobby round the core; the rest the round plates */
      plan: function (F, Lv, lib) {
        if (Lv.use !== 'hotel') return lib.PLAN[Lv.use](F, Lv);
        var rOut = F.envR(Lv.y + Lv.h / 2) - 0.45, rc = F.core.r, CW = lib.CW, W = rOut - rc;
        var st = lib.rings(F, Lv, { rOut: rOut, rIn: rc, bands: [{ d: 8, n: 28, kinds: function (i) { return i % 14 === 7 ? 'store' : 'bedroom'; }, door: 'in' }, { d: CW, corr: true },
          { d: W - 8 - 2 * CW, n: 8, kinds: function (i) { return i % 2 ? 'cafe' : 'concourse'; }, door: 'in', passage: function (i) { return i % 4 === 0; } }, { d: CW, corr: true }] });
        /* the core: its own room on the lift lobby, and its floor (no hole) */
        var cp = []; for (var q = 0; q < 24; q++) cp.push(lib.at(rc - 0.05, 2 * Math.PI * q / 24));
        var lob = st.rooms.filter(function (Q) { return Q.kind === 'corridor' && Q.ring && Q.ring.r0 < rc + 0.1; })[0], dp = lib.at(rc, 0);
        st.rooms.push({ id: st.id + '.core', kind: 'core', mpKind: 'core', poly: cp, y: Lv.y, h: Lv.h, level: Lv.k, doors: [{ at: dp, w: 1.6, to: lob.id }], windows: [], furnish: false });
        st.hole = null;
        return st;
      },
      ruins: ruins({ gutted: { glass: 0, strips: 0, breach: 0.1, stain: 0.75, keep: 1, note: 'the saucers\' glass gone' }, crown: { keep: 0.72, note: 'the observatory and the needle down' }, broken: { keep: 0.6, note: 'the stalk snapped over the hotel' }, stump: { keep: 0.2, core: 0.25, note: 'the stalk\'s foot' }, skeleton: { keep: 1, bare: 0.5, note: 'the saucers stripped to their frames' } })
    };
  })();

  // ---- the Swell: four lobes swelling from 13 to 21 m round a 16 m middle, 50 storeys. The middle is the core (four shafts) and a concourse ring;
  // each lobe is a ring of rooms about its own centre over the arc outside the middle, its corridor opening on the concourse; the lobes set their
  // own windows on their skin
  (function () {
    var D = MP.DESIGNS.swell, H = D.height.roof, Lb = D.lobes, lr = function (y) { return Lb.r + Lb.swell * Math.pow(Math.sin(Math.PI * Math.min(1, y / H)), 0.6); }, sh = H / Math.round(H / D.sh);
    var zones = [{ use: 'lobby', n: 1 }, { use: 'market', n: 2 }, { use: 'clinic', n: 3 }, { use: 'offices', n: 15 }, { use: 'plant', n: 1 }, { use: 'records', n: 4 }, { use: 'school', n: 2 }, { use: 'offices', n: 10 }, { use: 'plant', n: 1 }, { use: 'hydroponics', n: 4 }, { use: 'records', n: 4 }, { use: 'offices', n: 2 }, { use: 'skylobby', n: 1 }];
    zones.forEach(function (z) { z.h = sh; });
    var L = levels(zones), last = L.length - 1, rMid = D.core - 0.45;
    var KIND = { lobby: function (i) { return i % 3 ? 'stall' : 'cafe'; }, market: function () { return 'stall'; }, clinic: function (i) { return i % 6 === 2 ? 'store' : 'clinic'; }, offices: function (i) { return i % 4 === 3 ? 'meeting' : 'office'; },
      plant: function () { return 'plant'; }, records: function () { return 'stack'; }, school: function (i) { return i % 7 === 3 ? 'store' : 'classroom'; }, hydroponics: function () { return 'greenhouse'; }, skylobby: function (i) { return i % 2 ? 'stall' : 'concourse'; } };
    var lobeAt = function (q) { var a = Math.PI / 4 + q * Math.PI / 2; return { a: a, cx: Math.cos(a) * Lb.at, cz: Math.sin(a) * Lb.at }; };
    var reach = function (th, y) { var r = rMid; for (var q = 0; q < Lb.n; q++) { var c = lobeAt(q), rl = lr(y) - 0.45, dx = Math.cos(th), dz = Math.sin(th), b = dx * c.cx + dz * c.cz, cc = c.cx * c.cx + c.cz * c.cz - rl * rl, dsc = b * b - cc; if (dsc >= 0) r = Math.max(r, b + Math.sqrt(dsc)); } return r; };
    MP.FAMILY.swell = {
      id: 'swell', name: D.name, kind: D.kind, language: D.language, culture: 'ancient', tris: D.tris, design: true,
      footprint: { shape: 'circle', r: Lb.at + Lb.r + Lb.swell }, height: D.height, storeys: L.length, levels: L, zones: zones,
      envR: function () { return D.core; }, hitR: function (y) { return Lb.at + lr(y); }, slabR: function () { return D.core; },
      portals: [0, Math.PI / 2, Math.PI, Math.PI * 1.5], crown: { k: 'domes', r: D.core }, core: core(6.5, last), secScale: 1, mat: 'white', fall: Math.PI / 4,
      bays: { low: 24, high: 24, split: Infinity },
      plan: function (F, Lv, lib) {
        var ym = Lv.y + Lv.h / 2, kinds = KIND[Lv.use] || KIND.offices;
        var st = lib.sectors(F, Lv, 8, function () { return 'concourse'; }, {});
        /* the concourse is one open ring: its sectors' partitions go */
        st.walls = st.walls.filter(function (W) { return !/\.r\d+\.p0$/.test(W.id) || W.id.indexOf('.l') >= 0; });
        for (var q = 0; q < Lb.n; q++) {
          /* the lobe's arc: out from its own line, while its rooms (at the corridor's inner edge and at the skin) stay outside the middle and
             outside every other lobe (at mid-height the lobes overlap; the floor where they meet is left open) */
          var c = lobeAt(q), ro = lr(ym) - 0.45, rCor = ro - 7 - lib.CW, ok = function (phi) {
            return [rCor, ro].every(function (rho) { var px = c.cx + rho * Math.cos(phi), pz = c.cz + rho * Math.sin(phi); if (Math.hypot(px, pz) < rMid + 0.6) return false;
              for (var j = 0; j < Lb.n; j++) { if (j === q) continue; var cj = lobeAt(j); if (Math.hypot(px - cj.cx, pz - cj.cz) < ro + 0.3) return false; } return true; }); };
          var Aa = 0; while (Aa < Math.PI * 0.95 && ok(c.a + Aa + 0.02) && ok(c.a - Aa - 0.02)) Aa += 0.02;
          if (Aa < 0.3) continue;
          var P = lib.lobe(F, Lv, { id: F.id + '.' + Lv.k + '.l' + q, cx: c.cx, cz: c.cz, r: ro, depth: 7, a0: c.a - Aa, a1: c.a + Aa, kinds: kinds });
          /* the lobe's corridor opens on the concourse sector facing it, at the middle's skin on the lobe's line */
          var corr = P.rooms.filter(function (Q) { return Q.kind === 'corridor'; })[0], best = null, bd = 1e9;
          st.rooms.forEach(function (Q) { if (Q.mpKind !== 'concourse' || !Q.poly) return; var m = Q.poly.reduce(function (s, p) { return [s[0] + p[0], s[1] + p[1]]; }, [0, 0]), th = Math.atan2(m[1], m[0]), d = Math.abs(((th - c.a) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI); if (d < bd) { bd = d; best = Q; } });
          var dp = lib.at(rMid, c.a); corr.doors.push({ at: dp, w: 2.4, to: best.id }); best.doors.push({ at: dp, w: 2.4, to: corr.id });
          st.rooms = st.rooms.concat(P.rooms); st.walls = st.walls.concat(P.walls);
        }
        /* the slab: the middle and the lobes as one outline, by the ray's reach at each angle */
        st.outline = []; var R = 0; for (var i = 0; i < 128; i++) { var th = 2 * Math.PI * i / 128, r = reach(th, ym); R = Math.max(R, r); st.outline.push(lib.at(r, th)); }
        st.R = R + 0.05; st.windowsOwn = true;
        return st;
      },
      ruins: ruins({ crown: { keep: 0.8, note: 'the lobes\' domes and the top storeys fallen' }, broken: { keep: 0.55, note: 'two lobes torn off above the middle' } })
    };
  })();
  // ---- the rect designs (batch 3): rooms round four sides (MP.planLib.rectRings), each storey's rectangle the design's own at its height
  var KINDS = { lobby: function (i) { return i % 4 === 0 ? 'concourse' : 'stall'; }, market: function () { return 'stall'; }, clinic: function (i) { return i % 6 === 2 ? 'store' : 'clinic'; }, offices: function (i) { return i % 4 === 3 ? 'meeting' : 'office'; },
    plant: function () { return 'plant'; }, records: function () { return 'stack'; }, school: function (i) { return i % 7 === 3 ? 'store' : 'classroom'; }, hydroponics: function () { return 'greenhouse'; }, skylobby: function (i) { return i % 3 ? 'cafe' : 'concourse'; },
    arcade: function (i) { return i % 5 === 2 ? 'cafe' : 'stall'; } };
  var kindsOf = function (u) { return KINDS[u] || KINDS.offices; };

  // ---- the Reed: a slab 58 x 24 m turning 50 degrees and widening a quarter to its top. A ring of rooms 7 m deep round a slot of core, its stair
  // and lift on the axis (so they stand inside the slot at every turn)
  (function () {
    var D = MP.DESIGNS.reed, H = D.height.roof, n1 = Math.round((H - D.sh) / D.sh), h1 = (H - D.sh) / n1;
    var rect = function (y) { var t = Math.min(1, Math.max(0, y) / H), s = 1 + D.widen * t; return { hw: D.footprint.w / 2 * s, hd: D.footprint.d / 2 * s, yaw: D.twist * Math.PI / 180 * t }; };
    var zones = [{ use: 'lobby', n: 1, h: D.sh }, { use: 'market', n: 1, h: h1 }, { use: 'clinic', n: 2, h: h1 }, { use: 'offices', n: 20, h: h1 }, { use: 'plant', n: 1, h: h1 }, { use: 'records', n: 4, h: h1 }, { use: 'school', n: 2, h: h1 },
      { use: 'offices', n: n1 - 34, h: h1 }, { use: 'plant', n: 1, h: h1 }, { use: 'hydroponics', n: 3, h: h1 }];
    var L = levels(zones), last = L.length - 1;
    MP.FAMILY.reed = {
      id: 'reed', name: D.name, kind: D.kind, language: D.language, culture: 'ancient', tris: D.tris, design: true,
      footprint: { shape: 'rect', w: D.footprint.w, d: D.footprint.d }, height: D.height, storeys: L.length, levels: L, zones: zones,
      envR: function (y) { var r = rect(y); return Math.min(r.hw, r.hd); }, portals: [], crown: { k: 'garden' }, secScale: 1, mat: 'white', fall: Math.PI / 2,
      core: { kind: 'rects', shafts: [{ id: 'stair', kind: 'stair', x: -2.2, z: 0, w: 3.2, d: 2.6, from: 0, to: last }, { id: 'lift', kind: 'lift', x: 2.2, z: 0, w: 2.4, d: 2.6, from: 0, to: last }] },
      bays: { width: 3, n: 0 },
      plan: function (F, Lv, lib) { var r = rect(Lv.y + Lv.h / 2); return lib.rectRings(F, Lv, { hw: r.hw - 0.8, hd: r.hd - 0.8, yaw: r.yaw, bands: [{ d: 7, roomW: 6, kinds: kindsOf(Lv.use), door: 'in' }, { d: lib.CW, corr: true }], shafts: F.core.shafts }); },
      ruins: ruins({ crown: { keep: 0.82, note: 'the roof garden and the top storeys down' }, broken: { keep: 0.58, note: 'snapped at the twist\'s middle' } })
    };
  })();

  // ---- the Wedge: a black frustum 64 x 56 m narrowing to 40 x 30 m and leaning 8 m in z; its sky lobby a storey of 7.8 m set 3 m in at 122 m.
  // Rooms round four sides (a band of 6 to 10 m, as deep as the storey allows), a core zone in the middle; four shafts where every storey's zone
  // overlaps
  (function () {
    var D = MP.DESIGNS.wedge, H = D.height.roof, T = D.top, sl = D.slot, n1 = Math.round((sl[0] - D.sh) / D.sh), h1 = (sl[0] - D.sh) / n1, n2 = Math.round((H - sl[1]) / D.sh), h2 = (H - sl[1]) / n2;
    var rect = function (y) { var t = Math.min(1, Math.max(0, y) / H); return { cx: 0, cz: D.lean * Math.pow(t, 1.5), hw: D.footprint.w / 2 + (T.hw - D.footprint.w / 2) * t, hd: D.footprint.d / 2 + (T.hd - D.footprint.d / 2) * t }; };
    var zones = [{ use: 'lobby', n: 1, h: D.sh }, { use: 'market', n: 1, h: h1 }, { use: 'clinic', n: 2, h: h1 }, { use: 'offices', n: 18, h: h1 }, { use: 'plant', n: 1, h: h1 }, { use: 'records', n: 4, h: h1 }, { use: 'offices', n: n1 - 26, h: h1 },
      { use: 'skylobby', n: 1, h: sl[1] - sl[0] }, { use: 'offices', n: n2 - 5, h: h2 }, { use: 'plant', n: 1, h: h2 }, { use: 'records', n: 3, h: h2 }, { use: 'offices', n: 1, h: h2 }];
    var L = levels(zones), last = L.length - 1;
    MP.FAMILY.wedge = {
      id: 'wedge', name: D.name, kind: D.kind, language: D.language, culture: 'ancient', tris: D.tris, design: true,
      footprint: { shape: 'rect', w: D.footprint.w, d: D.footprint.d }, height: D.height, storeys: L.length, levels: L, zones: zones,
      envR: function (y) { var r = rect(y); return Math.min(r.hw, r.hd); }, portals: [], crown: { k: 'flat' }, secScale: 1, mat: 'dark', fall: Math.PI / 2,
      core: { kind: 'rects', shafts: [{ id: 'stair.w', kind: 'stair', x: -6, z: 4, w: 3.2, d: 2.6, from: 0, to: last }, { id: 'lift.w', kind: 'lift', x: -2, z: 4, w: 2.4, d: 3, from: 0, to: last },
        { id: 'lift.e', kind: 'lift', x: 2, z: 4, w: 2.4, d: 3, from: 0, to: last }, { id: 'stair.e', kind: 'stair', x: 6, z: 4, w: 3.2, d: 2.6, from: 0, to: last }] },
      bays: { width: 3.2, n: 0 },
      plan: function (F, Lv, lib) {
        var r = rect(Lv.y + Lv.h / 2), sky = Lv.use === 'skylobby', hw = r.hw - 0.6 - (sky ? 3 : 0), hd = r.hd - 0.6 - (sky ? 3 : 0), d = Math.max(6, Math.min(10, Math.min(hw, hd) - 0.45 - lib.CW - 7.5));
        return lib.rectRings(F, Lv, { hw: hw, hd: hd, cx: r.cx, cz: r.cz, bands: [{ d: d, roomW: 6, kinds: kindsOf(Lv.use), door: 'in' }, { d: lib.CW, corr: true }], shafts: F.core.shafts });
      },
      ruins: ruins({ crown: { keep: 0.82, note: 'the top over the sky lobby fallen in' }, broken: { keep: 0.6, note: 'torn just under the sky lobby' } })
    };
  })();

  // ---- the Arcades: a ring of building 84 x 52 m round a 52 x 24 m court; two storeys behind the arcade's glass (3 m in), two above its 13 m
  // arches. Rooms on the street (4 to 6 m) and on the court (the rest), a corridor between; four shafts in the court's band, east and west
  (function () {
    var D = MP.DESIGNS.arcades, H = D.height.roof, hw = D.footprint.w / 2, hd = D.footprint.d / 2, cw = D.court.w / 2, cd = D.court.d / 2, hs = D.sh;
    var zones = [{ use: 'arcade', n: 1, h: hs }, { use: 'clinic', n: 1, h: hs }, { use: 'offices', n: 2, h: hs }];
    var L = levels(zones), last = L.length - 1, hole = { hw: cw + 0.6 + 0.45, hd: cd + 0.6 + 0.45 }, sx = hole.hw + 1.9;
    MP.FAMILY.arcades = {
      id: 'arcades', name: D.name, kind: D.kind, language: D.language, culture: 'ancient', tris: D.tris, design: true,
      footprint: { shape: 'rect', w: D.footprint.w, d: D.footprint.d }, height: D.height, storeys: L.length, levels: L, zones: zones,
      envR: function () { return hd; }, portals: [], crown: { k: 'flat' }, secScale: 1, mat: 'concrete', fall: 0,
      core: { kind: 'rects', shafts: [{ id: 'stair.e', kind: 'stair', x: sx, z: 4, w: 2.6, d: 3.2, from: 0, to: last, face: 1 }, { id: 'lift.e', kind: 'lift', x: sx, z: -4, w: 2.6, d: 2.6, from: 0, to: last, face: 1 },
        { id: 'stair.w', kind: 'stair', x: -sx, z: -4, w: 2.6, d: 3.2, from: 0, to: last, face: 3 }, { id: 'lift.w', kind: 'lift', x: -sx, z: 4, w: 2.6, d: 2.6, from: 0, to: last, face: 3 }] },
      bays: { width: 6, n: 0 },
      plan: function (F, Lv, lib) {
        var low = Lv.k < 2, ohw = hw - (low ? 3 : 0.9) - 0.45, ohd = hd - (low ? 3 : 0.9) - 0.45;
        return lib.rectRings(F, Lv, { hw: ohw, hd: ohd, hole: hole, bands: [{ d: low ? 4 : 6, roomW: 6, kinds: kindsOf(Lv.use), door: 'in' }, { d: lib.CW, corr: true }, { d: null, roomW: 5.2, kinds: function (i) { return Lv.use === 'arcade' ? (i % 3 ? 'stall' : 'cafe') : i % 3 === 1 ? 'meeting' : 'office'; }, door: 'out' }], shafts: F.core.shafts });
      },
      ruins: ruins({ gutted: { glass: 0, strips: 0, breach: 0.1, stain: 0.75, keep: 1, note: 'the arcade\'s glass gone, burnt out' }, crown: { keep: 0.75, note: 'the top storey fallen into the court' }, broken: { keep: 0.5, note: 'one wing down to the arcade' }, stump: { keep: 0.5, note: 'the arcade standing, its arches' }, skeleton: { keep: 1, bare: 0.5, note: 'the upper storeys\' frame' } })
    };
  })();
  MP.PLANNED_KEYS = ['telescope', 'cupola', 'spiral', 'terrace', 'stalk', 'swell', 'reed', 'wedge', 'arcades'];
})();
