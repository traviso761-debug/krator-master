/* ======================== Ancients interiors: the civic types (government, library, bunker, cultural centre) ========================
   Plans for four of the original Ancients kit's buildings, in each builder's own frame (37-ai-kit.js says how). The
   round and hex shells are cut into concentric BANDS of rooms (a ring of rooms with its corridor inside it, the next
   ring inside that corridor, a hall or an open well in the middle), so a 90 m drum is not one room.
   ====================================================================== */
(function (AI) {
  'use strict';
  const TAU = Math.PI * 2;
  const hexR = AI.hexR, cyc = list => (i => list[i % list.length]);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  /* the builders' civDA: the angle between two bearings */
  const da = (a, b) => { const x = ((a - b) % TAU + TAU) % TAU; return Math.min(x, TAU - x); };
  const r3 = v => Math.round(v * 1000) / 1000;
  const circ = (cx, cz, r, n) => { const p = []; n = n || 24; for (let k = 0; k < n; k++) { const t = k / n * TAU; p.push([r3(cx + r * Math.cos(t)), r3(cz + r * Math.sin(t))]); } return p; };

  /* ---------- bands: concentric ring plates on one storey
     o: { id, level, y, h, cx, cz, rOut (number or fn(th)), sym, list: [{ depth, cw, roomW, n?, kinds, gaps: [angles] }],
          core: { r, kind } | null }
     Band 0 runs along the skin; each next band's skin is the last band's corridor. An inner band's rooms take a back
     wall on that corridor. `gaps` leaves the sector at each angle out: a radial passage from corridor to corridor (on
     band 0, from the building's door). The core (or, with core null, an open well) is inside the last corridor. */
  function bands(o) {
    const cx = o.cx || 0, cz = o.cz || 0, sym = o.sym || 1;
    let rO = typeof o.rOut === 'function' ? o.rOut : (() => o.rOut);
    const st = { id: o.id, level: o.level || 0, y: o.y, h: o.h, rooms: [], walls: [], outline: null };
    o.list.forEach(function (b, bi) {
      const id = bi ? o.id + '.b' + bi : o.id, cw = b.cw == null ? 2.4 : b.cw, rOut = rO;
      const rMean = rOut(Math.PI / 6) - b.depth;
      const n = b.n || sym * Math.max(1, Math.round(TAU * rMean / (b.roomW || 6) / sym));
      const gap = {}; (b.gaps || []).forEach(a => { gap[Math.floor((((a % TAU) + TAU) % TAU) / (TAU / n) + 1e-6) % n] = true; });
      const p = AI.ringPlate({ id, level: st.level, y: o.y, h: o.h, cx, cz, rOut, depth: b.depth, cw, n, sym, kinds: b.kinds,
        skip: th => !!gap[Math.floor(th / (TAU / n))], core: bi === o.list.length - 1 ? o.core : null, door: b.door });
      if (!bi) st.outline = p.outline;
      const at = (r, th) => [r3(cx + r * Math.cos(th)), r3(cz + r * Math.sin(th))];
      /* a passage's side: the room before it has no partition there (ringPlate draws each room's own t0 only) */
      Object.keys(gap).forEach(function (i) {
        const t0 = i * TAU / n, prev = (+i - 1 + n) % n; if (gap[prev]) return;
        p.walls.push({ id: id + '.gap' + i, pts: [at(rOut(t0) - b.depth, t0), at(rOut(t0) - 0.05, t0)], y: o.y, h: o.h, rooms: [null, null], door: null, broken: false });
      });
      if (bi) p.rooms.forEach(function (R) {
        if (R.kind === 'corridor' || R.id === id + '.core' || !R.poly) return;
        const half = R.poly.length / 2, back = R.poly.slice(half);
        p.walls.push({ id: R.id + '.bw', pts: back, y: o.y, h: o.h, rooms: [R.id, st.prevCorr], door: null, broken: false });
      });
      st.prevCorr = id + '.corr';
      p.rooms.forEach(R => st.rooms.push(R)); p.walls.forEach(W => st.walls.push(W));
      rO = th => rOut(th) - b.depth - cw - 0.05;
    });
    delete st.prevCorr;
    return st;
  }

  /* ---------------------------------------------------------------- GOVERNMENT, the Assembly (79-government.js)
     Three round tiers `tiers=[[92,84,14],[66,60,14],[42,38,14]]` (base r, top r, h; flutes amp .05 only push the skin
     OUT, so the inner face is the base radius); the intact tiers are hollow skins capped by a slab at each tier top
     (r .99 b, .6 thick: tiers 1 and 2 stand on it, floor 14.3 and 28.3). Two storeys of 7 m per tier (the windows'
     two rows at y+3.5 and y+9.5, the ruin's civRooms y0 .3 step 7), cut in bands round an inner hall; the front
     sector (+z, under the `archOpen` at z 91) is a passage on the ground storey. The petal council chamber stands
     on tier 2's slab (y 42.3) under the glass dome r 19 (H 27, base y 43): one hall r 17. RUIN: the slump at
     COL = 2.45 rad, colW (.32 tier 1, .5 tier 2) wide, above colY (6.5, 1.6) and outside r 43 / 24 (the roofs'
     intact inner discs): tier 1's upper storey and both of tier 2's fall in there. The ruin's liner at .8 r (MAT.guts)
     hides the outer band from inside; the plan keeps it (intact the rooms run to .97 of the skin). */
  AI.KIT.gov = { name: 'Government (the Assembly)', frag: '79-government.js', culture: 'ancient', wealth: 0.75, types: ['civic'],
    buildings: function (d) {
      const T = [[92, 84, 14], [66, 60, 14], [42, 38, 14]];
      const rTop = (i, yl) => 0.97 * (T[i][0] - (T[i][0] - T[i][1]) * yl / 14);   /* the skin at yl into tier i */
      const st = [];
      const front = [Math.PI / 2];
      /* tier 0: six bands; tier 1: four; tier 2: three */
      const plan = [
        [ /* tier 0 */
          s => [{ depth: 7, cw: 2.6, roomW: 5.5, kinds: () => 'study', gaps: s ? [] : front },
                { depth: 10, cw: 2.6, roomW: 8, kinds: cyc(s ? ['library', 'library', 'antechamber'] : ['library', 'antechamber']), gaps: [Math.PI / 2, 0, Math.PI, 1.5 * Math.PI] },
                { depth: 12, cw: 2.6, roomW: 12, kinds: () => 'hall', gaps: [Math.PI / 2, 0, Math.PI, 1.5 * Math.PI] },
                { depth: 9, cw: 2.6, roomW: 7, kinds: cyc(s ? ['library'] : ['antechamber', 'library']), gaps: [Math.PI / 2, Math.PI * 1.5] },
                { depth: 7, cw: 2.6, roomW: 5, kinds: () => 'study', gaps: [Math.PI / 2, Math.PI * 1.5] },
                { depth: 7, cw: 2.6, roomW: 5, kinds: () => s ? 'antechamber' : 'study', gaps: [Math.PI / 2] }],
          s => ({ r: 16, kind: s ? 'library' : 'hall' })],
        [ /* tier 1 */
          s => [{ depth: 7, cw: 2.6, roomW: 5.5, kinds: () => 'study' },
                { depth: 10, cw: 2.6, roomW: 8, kinds: cyc(s ? ['library'] : ['library', 'antechamber']), gaps: [Math.PI / 2, 1.5 * Math.PI] },
                { depth: 10, cw: 2.6, roomW: 12, kinds: () => 'hall', gaps: [Math.PI / 2, 1.5 * Math.PI] },
                { depth: 7, cw: 2.6, roomW: 5, kinds: cyc(s ? ['study'] : ['antechamber', 'study']), gaps: [Math.PI / 2] }],
          s => ({ r: 16, kind: s ? 'library' : 'hall' })],
        [ /* tier 2 */
          s => [{ depth: 7, cw: 2.6, roomW: 5.5, kinds: () => 'study' },
                { depth: 9, cw: 2.6, roomW: 7, kinds: () => 'library', gaps: [Math.PI / 2] },
                { depth: 6, cw: 2.4, roomW: 6, kinds: () => s ? 'study' : 'antechamber', gaps: [Math.PI / 2] }],
          s => ({ r: 8.8, kind: 'antechamber' })]];
      for (let i = 0; i < 3; i++) for (let s = 0; s < 2; s++) {
        const y = 14 * i + 0.3 + 7 * s, top = 7 * (s + 1);   /* the storey's top, in the tier */
        st.push(bands({ id: 'gov.t' + i + (s ? 'u' : 'g'), level: 2 * i + s, y, h: s ? 6.4 : 6.5, rOut: rTop(i, top), sym: 4,
          list: plan[i][0](s), core: plan[i][1](s) }));
      }
      st.push(AI.hallPlate({ id: 'gov.chamber', level: 6, y: 42.3, h: 12, kind: 'hall', poly: circ(0, 0, 17, 32), doorEdge: 8, doorW: 3 }));
      const colY = i => i === 2 ? 1.6 : 6.5;
      return [{ id: 'gov', name: 'the Assembly', storeys: st, floors: true, hollow: [],
        inside: (x, z, y) => { const r = Math.hypot(x, z); if (y >= 42) return r < 19; const i = clamp(Math.floor(y / 14), 0, 2); return r < T[i][0] - (T[i][0] - T[i][1]) * (y - 14 * i) / 14 + 0.5; },
        /* the slump: tier 1 above its first floor, tier 2 from its foot, in the sector round COL outside the intact roof discs */
        collapse: (x, z, y) => {
          if (y >= 42) return false;
          const i = clamp(Math.floor(y / 14), 0, 2), yl = y - 14 * i; if (i === 0 || yl + 3.5 < colY(i)) return false;
          const w = (i === 2 ? 0.5 : 0.32) * (0.62 + 0.38 * clamp((yl + 3.5) / 14, 0, 1)) + 0.04;
          return da(Math.atan2(z, x), 2.45) < w && Math.hypot(x, z) > (i === 2 ? 24 : 43);
        } }];
    } };

  /* ---------------------------------------------------------------- LIBRARY, the Crown (48-library.js)
     The crown: 16 ribs on the profile pts [[34,0],[27,12],[19,25],[15.5,34],[17.5,42],[23,50],[27,54]] (r, y above the
     podium, `rib(y)`), glass at rib - 1.6 over H 44, on a podium (lathe r 42 H 2, slab at y 2) with a dark floor disc
     (slab r 30 at y 2.3, top 2.6). Intact it is glass over an EMPTY floor; the ruin draws three gallery floors
     (civRooms cy 2, y0 3, step 12: y 5, 17, 29, from .5 to .965 of rib - 2.2) round a dark well (lathe (rib - 2) * .5).
     The plan: a sunken reading well (y 2.6, r 14.8, inside the ruin's well), and five gallery rings of stacks and
     carrels at y 5, 11, 17, 23, 29 (6 m; 5, 17, 29 are the ruin's floors), each kept inside the glass at its top and
     outside the ruin's well at its foot, an open core over the well. The light strips at y 20 r 18 (stripRing) pass
     through the y 17 ring's outer rooms 3 m up. The reading-hall wing at x 74: lathe r 15 H 9, flutes 6 amp .35 sharp 1
     (r 15 to 20.25, lobes at multiples of 60 degrees), roof slab at 9.2; the ruin lines a dark core r 9: a reading
     room in the middle and twelve alcoves round it, one storey. */
  const LIBPTS = [[34, 0], [27, 12], [19, 25], [15.5, 34], [17.5, 42], [23, 50], [27, 54]];
  const rib = y => { for (let i = 1; i < LIBPTS.length; i++) if (y <= LIBPTS[i][1]) { const t = (y - LIBPTS[i - 1][1]) / (LIBPTS[i][1] - LIBPTS[i - 1][1]); return LIBPTS[i - 1][0] + (LIBPTS[i][0] - LIBPTS[i - 1][0]) * t; } return LIBPTS[LIBPTS.length - 1][0]; };
  const lobe = th => 15 * (1 + 0.35 * (0.5 + 0.5 * Math.cos(6 * th)));
  AI.KIT.lib = { name: 'Library (the Crown)', frag: '48-library.js', culture: 'ancient', wealth: 0.65, types: ['civic', 'learning'],
    buildings: function (d) {
      const st = [AI.hallPlate({ id: 'lib.well', level: 0, y: 2.6, h: 8, kind: 'library', poly: circ(0, 0, 14.8, 32), doorEdge: 8, doorW: 2.4 })];
      [5, 11, 17, 23, 29].forEach(function (y, k) {
        const rOut = rib(y + 6 - 2) - 1.6 - 0.35, rWell = 0.5 * (rib(y - 2) - 2) + 0.2;
        const cw = k < 1 ? 2.6 : k < 3 ? 2.4 : k < 4 ? 2.2 : 2.0, depth = rOut - rWell - cw;
        const kinds = depth > 6 ? cyc(['library', 'library', 'study']) : depth > 4.5 ? cyc(['library', 'study']) : () => 'study';
        st.push(bands({ id: 'lib.g' + k, level: k + 1, y, h: 5.5, rOut, sym: 1, core: null,
          list: [{ depth, cw, roomW: depth > 6 ? 6.5 : 5.5, kinds }] }));
      });
      const wing = bands({ id: 'lib.wing', level: 0, y: 0.2, h: 8.7, cx: 74, rOut: th => lobe(th) - 0.45, sym: 6,
        list: [{ depth: 4, cw: 2, n: 12, kinds: cyc(['library', 'study']) }], core: { r: 30, kind: 'library' } });
      return [{ id: 'lib', name: 'the Crown', storeys: st, floors: true, hollow: [],
        inside: (x, z, y) => y >= 2 && Math.hypot(x, z) < rib(Math.max(0, y - 2)) - 1.6 },
              { id: 'lib-wing', name: 'the reading hall', storeys: [wing], floors: true, hollow: [],
        inside: (x, z) => Math.hypot(x - 74, z) < lobe(Math.atan2(z, x - 74)) }];
    } };

  /* ---------------------------------------------------------------- BUNKER, the Redoubt (46-bunker.js)
     The casemate: a hex lathe (nu 6) R0 54 at y 10 to R1 46 at y 26 (HM 16), on a berm (hex mound r 78 - 2.2 y to its
     slab at y 10, top 10.2), roofed by a slab r .98 R1 at y 26 (.8 thick: underside 25.6). Intact it is a hollow skin;
     the ruin lines it with MAT.guts at .62 R and .9 R and draws two floors (civRooms y0 .3, step 8) behind the breach.
     Two storeys: y 10.3 and 18.3 (the ruin's floors), three hex bands at .96 of the skin at each storey's top round
     a central hall: stores and the armoury outside, offices and the kitchen inside, round the mess below, barracks above round the
     magazine. The gate (archOpen at y 16.5 on the +z face) opens a passage through the ground storey's bands. RUIN:
     the V breach at BR = pi/6, half-angle .3 (.35 + .65 y / HM), above y 1.5: the outer rooms behind it fall in.
     Left out: the observation cupola (r 5 at its waist, above the roof). */
  AI.KIT.bunk = { name: 'Military bunker (the Redoubt)', frag: '46-bunker.js', culture: 'ancient', wealth: 0.45, types: ['military'],
    buildings: function (d) {
      const R = y => 54 - 8 * (y - 10) / 16, rOut = top => th => 0.96 * hexR(R(top), th);
      const gate = [Math.PI / 2];
      /* five rooms to a face on the outer band, four on the middle, three on the inner (sym 6) */
      const g = bands({ id: 'bunk.g', level: 0, y: 10.3, h: 7.5, rOut: rOut(18.3), sym: 6,
        list: [{ depth: 8, cw: 2.4, n: 30, kinds: (i, n) => { const f = Math.floor(i * 6 / n), k = i % 5; return f === 3 && (k === 1 || k === 3) ? 'armoury' : 'store'; }, gaps: gate },
               { depth: 7, cw: 2.4, n: 24, kinds: (i, n) => { const f = Math.floor(i * 6 / n); return f === 4 ? 'kitchen' : i % 2 ? 'armoury' : 'store'; }, gaps: gate },
               { depth: 6, cw: 2.4, n: 18, kinds: (i, n) => { const f = Math.floor(i * 6 / n); return f === 4 ? 'kitchen' : i % 3 === 1 ? 'store' : 'study'; }, gaps: gate }],
        core: { r: 30, kind: 'mess' } });
      const u = bands({ id: 'bunk.u', level: 1, y: 18.3, h: 7.2, rOut: rOut(25.6), sym: 6,
        list: [{ depth: 8, cw: 2.4, n: 30, kinds: () => 'barracks' },
               { depth: 7, cw: 2.4, n: 24, kinds: cyc(['barracks', 'store']) },
               { depth: 6, cw: 2.4, n: 18, kinds: cyc(['armoury', 'store', 'study']) }],
        core: { r: 30, kind: 'store' } });
      return [{ id: 'bunk', name: 'the Redoubt', storeys: [g, u], floors: true, hollow: [],
        inside: (x, z, y) => y >= 10 && y < 26 && Math.hypot(x, z) < hexR(R(y), Math.atan2(z, x)),
        collapse: (x, z, y) => {
          const ym = clamp(y - 10 + 4, 0, 16);
          return da(Math.atan2(z, x), Math.PI / 6) < 0.3 * (0.35 + 0.65 * ym / 16) + 0.04 && Math.hypot(x, z) > 0.6 * R(y);
        } }];
    } };

  /* ---------------------------------------------------------------- CULTURAL CENTRE, the Wheel (67-cultural.js, row key cult)
     The great hall: a dome gr(y) = 52 (1 - (y/64)^2)^.58 from y 11 (CH 64), glass at gr - 3 intact, the ruin's liner
     at gr - 5; the twelve ring-1 spokes (beam 6 x 3.4 at py + 2, from .42 to .9 of the ring radius) end at r 43.7 in
     its foot. The ground (y 11) is a band of shops and antechambers inside r 43.2 round an open floor of exhibition
     bays (gridPlate); two gallery rings (y 19, 27) of library rooms over it, open in the middle.
     The halls: RINGS = [[104,15,12,30,11],[156,19,16,26,7.4],[208,23,20,21,4]] (ring r, hall r, count, height, base y),
     ring ri turned by (ri % 2) .5 / n; every k % 3 === 1 is a campanile (r .62 bw, 2.05 the height, three window tiers;
     a hall has two). Heights take the builder's least (.88 of nominal: hh0 = bh (.88 + .24 rng)), so the plan fits
     every copy. Rooms keep inside .84 of the drum (the ruin's liner is .86) and clear of the spoke's end (ring 0's
     lower storey is cut by a chord there). The ruin's choices are the builder's rng, replayed here (reseed(9390 + d),
     the strip rings' draws, then per hall: rng() < .28 gone to rubble (26 pieces x 12 draws), hh0, and at d 1
     brk = rng() < (.8 tall, .45) cut at rr(.4, .75)): a hall gone to rubble is dropped, a broken drum loses the
     storeys above its break and the one it cuts falls open. */
  const RINGS = [[104, 15, 12, 30, 11], [156, 19, 16, 26, 7.4], [208, 23, 20, 21, 4]];
  function cultHalls(d) {
    let s = (9390 + d) >>> 0;
    const rng = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    if (d > 0) [30, 24].forEach(n => { for (let k = 0; k < n; k++) if (rng() < 0.10) rng(); });
    const out = [];
    RINGS.forEach(function (R, ri) {
      const [rad, bw, n, bh, py] = R;
      for (let k = 0; k < n; k++) {
        const a2 = (k + (ri % 2) * 0.5) / n * TAU, tall = k % 3 === 1;
        const H = { ri, k, a2, x: Math.cos(a2) * rad, z: Math.sin(a2) * rad, rad, bw: bw * (tall ? 0.62 : 1), tall, py, hmin: bh * (tall ? 2.05 : 1) * 0.88 };
        if (d > 0 && rng() < 0.28) { for (let j = 0; j < 26 * 12; j++) rng(); H.gone = true; out.push(H); continue; }
        const hh0 = bh * (tall ? 2.05 : 1) * (0.88 + rng() * 0.24);
        const brk = d === 1 && rng() < (tall ? 0.8 : 0.45);
        H.hh = brk ? hh0 * (0.4 + 0.35 * rng()) : hh0; H.brk = brk;
        out.push(H);
      }
    });
    return out;
  }
  AI.cultHalls = cultHalls;
  AI.KIT.cult = { name: 'Cultural centre (the Wheel)', frag: '67-cultural.js', culture: 'ancient', wealth: 0.7, types: ['civic', 'culture'],
    buildings: function (d) {
      const gr = y => 52 * Math.pow(clamp(1 - Math.pow(y / 64, 2), 0, 1), 0.58);
      const out = [];
      /* the great hall */
      const g = bands({ id: 'cult.dome', level: 0, y: 11, h: 7.5, rOut: 43.2, sym: 12,
        list: [{ depth: 8, cw: 3, n: 36, kinds: (i) => i % 9 === 1 || i % 9 === 8 ? 'antechamber' : 'shop', gaps: [0.01, Math.PI / 2 + 0.01, Math.PI + 0.01, 1.5 * Math.PI + 0.01] }], core: null });
      const bays = AI.gridPlate({ id: 'cult.dome.floor', level: 0, y: 11, h: 7.5, x0: -22, x1: 22, z0: -22, z1: 22, bay: [10, 7], aisle: 3.4, along: 'x', kinds: () => 'hall' });
      bays.rooms.forEach(R => g.rooms.push(R));
      const st = [g];
      [19, 27].forEach(function (y, k) {
        const rOut = gr(y + 8 - 11) - 5.5;
        st.push(bands({ id: 'cult.gal' + k, level: k + 1, y, h: 7.4, rOut, sym: 12, core: null,
          list: [{ depth: 7, cw: 3, n: 24, kinds: (i) => i % 6 === 0 ? 'antechamber' : 'library' }] }));
      });
      out.push({ id: 'cult', name: 'the great hall', storeys: st, floors: true, hollow: [],
        inside: (x, z, y) => Math.hypot(x, z) < gr(Math.max(0, y - 11)) - 3 });
      /* the halls round it */
      cultHalls(d).forEach(function (H) {
        if (H.gone) return;
        const nr = H.tall ? 3 : 2, sh = H.hmin / nr, spoke = H.rad * 0.1 - 0.3;   /* the spoke's end, from the drum's centre */
        const r = Math.min(0.84 * H.bw, H.ri ? spoke : 99), id = 'cult.h' + H.ri + '-' + H.k;
        const sts = [];
        for (let s = 0; s < nr; s++) {
          const y = H.py + s * sh, h = r3(sh - (s === nr - 1 ? 0.6 : 0.45)), sid = id + '.' + s;
          if (H.brk && y > H.py + H.hh - 1) continue;   /* above the break: gone with the drum */
          let stor;
          if (H.tall) stor = AI.hallPlate({ id: sid, level: s, y, h, kind: s === 0 ? 'antechamber' : 'library', poly: circ(H.x, H.z, r, 24), doorEdge: 0, doorW: 2 });
          else if (H.ri === 0) {
            /* ring 0: one hall a storey; below, the spoke's end cuts a chord off the side toward the dome */
            let poly = circ(H.x, H.z, r, 32);
            if (s === 0) {
              const c = spoke, al = Math.acos(clamp(c / r, -1, 1)), ph = H.a2 + Math.PI; poly = [];
              for (let j = 0; j <= 30; j++) { const t = ph + al + (TAU - 2 * al) * j / 30; poly.push([r3(H.x + r * Math.cos(t)), r3(H.z + r * Math.sin(t))]); }
            }
            stor = AI.hallPlate({ id: sid, level: s, y, h, kind: s === 0 ? 'hall' : 'library', poly, doorEdge: s === 0 ? 15 : 0, doorW: 2.4 });
          } else {
            /* rings 1 and 2: a ring of shops (below) or library rooms (above) round a hall */
            stor = bands({ id: sid, level: s, y, h, cx: H.x, cz: H.z, rOut: r, sym: 6,
              list: [{ depth: H.ri === 1 ? 5.5 : 6.5, cw: 2.4, n: H.ri === 1 ? 12 : 18, kinds: s === 0 ? cyc(['shop', 'shop', 'antechamber']) : () => 'library' }],
              core: { r: 30, kind: s === 0 ? 'hall' : 'library' } });
          }
          sts.push(stor);
        }
        const top = H.brk ? H.py + H.hh : 1e9;
        out.push({ id, name: (H.tall ? 'campanile ' : 'hall ') + H.ri + '-' + H.k, storeys: sts, floors: true, hollow: [],
          inside: (x, z) => Math.hypot(x - H.x, z - H.z) < H.bw,
          collapse: H.brk ? ((x, z, y) => y + sh - 0.5 > top) : undefined });
      });
      return out;
    } };
})(KratorAncientsInteriors);
