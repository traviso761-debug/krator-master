/* ======================== Interior set: Iziz's Ancient civic buildings (settlements/iziz) ========================
   The owner (2026-10-19): "add interiors to all civic and ancient buildings that are currently placed in the city [...] The
   temple just needs an interior at the very top with a stair down to 3 levels of priest offices." The vernacular civic
   buildings are in iziz.js; this set holds the Ancient ones (and the foreign ones the city places), each keyed by the
   VERN.def that draws its interior in Iziz (settlements/iziz src/78t-iziz-temple-ix.js and its neighbours), which is
   placed on the same transform as the shell it fits.
   Local frame = the shell's placement: origin on its base, +z its front, WORLD metres (the shell's own scale already
   applied: the temple is placed at 0.72, so its numbers here are the kit's times 0.72).
   Every item carries `ancient: true`: the city furnishes it (95i-iziz-interiors.js, izixFurnish).
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  const L = [];
  /* the Ancients' squircle (54-mat-concrete.js se): the temple's tiers are r * se(th, 3.5) */
  const se = function (th, n) { return 1 / Math.pow(Math.pow(Math.abs(Math.cos(th)), n) + Math.pow(Math.abs(Math.sin(th)), n), 1 / n); };
  const squircle = function (r, n) { const P = []; for (let i = 0; i < n; i++) { const th = i / n * 2 * Math.PI, k = r * se(th, 3.5); P.push([k * Math.cos(th), k * Math.sin(th)]); } return P; };
  /* the part of a convex polygon with ax*x + az*z <= c */
  const clip = function (P, ax, az, c) {
    const out = [];
    for (let i = 0; i < P.length; i++) {
      const p = P[i], q = P[(i + 1) % P.length], sp = ax * p[0] + az * p[1] - c, sq = ax * q[0] + az * q[1] - c;
      if (sp <= 0) out.push(p);
      if ((sp <= 0) !== (sq <= 0)) { const t = sp / (sp - sq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
    }
    return out;
  };
  const inBox = function (P, x0, x1, z0, z1) {
    P = clip(P, -1, 0, -x0); P = clip(P, 1, 0, x1); P = clip(P, 0, -1, -z0); P = clip(P, 0, 1, z1);
    return P.map(function (p) { return [+p[0].toFixed(3), +p[1].toFixed(3)]; });
  };

  /* ---------------- THE TEMPLE (kits/ancients 77z-iziz-style.js, the pyramid on legs; placed at 0.72 on the temple hill)
     The sanctum is the glass crown on the top terrace (the ramp lands at the terrace's front). From it a stair core goes
     down through three levels of priests' offices in the top two tiers: L1 under the terrace, L2 behind the upper glass band
     (its windows), L3 in the second tier. Each level is a pinwheel of four offices round the stair hall; the offices run
     out to the tier's wall (the squircle at the level's ceiling, less 0.4 m: the walls lean in). The stair is a switchback,
     24 risers a level, its foot on the hall's north side and its top arriving on the north side of the level above.
     Heights: the kit's (tier i from 19.5 + 12.2 i, 10 m, a 2.2 m band) times 0.72. */
  const K = 0.72, CX = 2.2, CZ = 3.0, PT = 0.08;
  const T = {
    K: K, cx: CX, cz: CZ, hole: [-1.25, 1.25, -2.95, 1.85],
    levels: [   /* top down; rFloor: the tier's wall at the floor; rRoom: at the ceiling, less 0.4 */
      { id: 'l1', name: 'upper offices', y: 47.2 * K, h: 6.7 * K, rFloor: 12.77 * K, rRoom: 11.32 * K - 0.4 },
      { id: 'l2', name: 'band offices', y: 40.5 * K, h: 6.7 * K, rFloor: 16.08 * K, rRoom: 12.77 * K - 0.4 },
      { id: 'l3', name: 'lower offices', y: 33.8 * K, h: 6.7 * K, rFloor: 18.09 * K, rRoom: 16.08 * K - 0.4 }],
    sanctum: { y: 53.9 * K, h: 3.6, r: 4.35, glass: 6.6 * K, stone: 7 * K, door: 1.5 },
    terrace: { y: 53.9 * K, r: 11.32 * K },
    ramp: { foot: [0, 37.44, -0.4 * K], top: [0, 11.5 * K, 51.5 * K], w: 9 * K }
  };
  /* P less the quadrant x > x0, z > z0 (a corner inside convex P): the notch the terrace steps climb through */
  const notch = function (P, x0, z0) {
    const inQ = function (p) { return p[0] > x0 && p[1] > z0; }, out = [];
    const cross = function (p, q) { let a = 0, b = 1; for (let k = 0; k < 30; k++) { const m = (a + b) / 2, r = [p[0] + (q[0] - p[0]) * m, p[1] + (q[1] - p[1]) * m]; if (inQ(r) === inQ(p)) a = m; else b = m; }
      return [+(p[0] + (q[0] - p[0]) * a).toFixed(3), +(p[1] + (q[1] - p[1]) * a).toFixed(3)]; };
    for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length];
      if (!inQ(p)) out.push(p);
      if (!inQ(p) && inQ(q)) { out.push(cross(p, q)); out.push([x0, z0]); }
      else if (inQ(p) && !inQ(q)) out.push(cross(p, q)); }
    return out;
  };
  const templeRooms = [];
  T.levels.forEach(function (Lv) {
    const S = squircle(Lv.rRoom, 64), id = function (r) { return '.' + Lv.id + '-' + r; };
    templeRooms.push({ id: Lv.id + '-hall', kind: 'antechamber', poly: rect(2 * CX - 2 * PT, 2 * CZ - 2 * PT), y: Lv.y, h: Lv.h - 0.3, level: Lv.id,
      doors: [{ at: [0, CZ - PT], w: 1.0, to: id('o1'), swing: 'none' }, { at: [CX - PT, 0], w: 1.0, to: id('o2'), swing: 'none' },
        { at: [1.7, -CZ + PT], w: 0.9, to: id('o3'), swing: 'none' }, { at: [-CX + PT, 0], w: 1.0, to: id('o4'), swing: 'none' }],
      fixtures: [{ id: 'stair', kind: 'stair', x: 0, z: -0.55, ry: 0, w: 2.5, d: 4.8, h: Lv.h, reach: false }] });
    /* L1's front office stops short of the terrace steps (the ramp lands at the tier's face, 1.7 m below the terrace, and the
       nine steps climb 2.7 m in: they would cut through the office's front) */
    [['o1', Lv.id === 'l1' ? notch(inBox(S, -99, CX - PT, CZ + PT, 99), -2.0, 5.5) : inBox(S, -99, CX - PT, CZ + PT, 99), [0, CZ + PT]], ['o2', inBox(S, CX + PT, 99, -CZ - PT, 99), [CX + PT, 0]],
      ['o3', inBox(S, -CX - PT, 99, -99, -CZ - PT), [1.7, -CZ - PT]], ['o4', inBox(S, -99, -CX - PT, -99, CZ + PT), [-CX - PT, 0]]]
      .forEach(function (o) {
        templeRooms.push({ id: Lv.id + '-' + o[0], kind: 'study', poly: o[1], y: Lv.y, h: Lv.h - 0.3, level: Lv.id,
          doors: [{ at: o[2], w: o[0] === 'o3' ? 0.9 : 1.0, to: id('hall'), swing: 'in' }] });
      });
  });
  templeRooms.push({ id: 'sanctum', kind: 'shrine', poly: SH.circle(T.sanctum.r, 24), y: T.sanctum.y, h: T.sanctum.h, level: 'sanctum',
    doors: [{ at: [0, T.sanctum.r], w: T.sanctum.door, to: 'street', swing: 'in' }],
    fixtures: [{ id: 'stairwell', kind: 'stairwell', x: 0, z: -0.55, ry: 0, w: 2.6, d: 4.9, h: 1, reach: false }] });
  L.push({ key: 'iziz_temple_ix', name: 'Temple — the sanctum and the priests\' offices', ancient: true, culture: 'iziz', wealth: 0.75,
    types: ['religious', 'civic'], lot: [75, 75], temple: T, rooms: templeRooms,
    note: 'the sanctum in the glass crown and three levels of four offices each round a switchback stair core, in the top two ' +
      'tiers; the lower tiers, the legs and the plaza are not planned' });

  /* ---------------- THE VOTH EMBASSY (settlements/iziz src/75-port-embassy.js, a foreign civic compound by the palace hill)
     Hollow (vnBody): the Hlaalu house's stone ground storey (6 m to its cornice; the plaster blocks above are jittered per
     placement and stay solid behind glass), the service range against the right wall, and the domed audience hall. */
  L.push({ key: 'port_voth_embassy', name: 'Voth Embassy', ancient: true, culture: 'iziz', wealth: 0.8, types: ['civic'], lot: [36, 32],
    bodies: [{ id: 'house', poly: rect(12.5, 9.2, 7.2, -8.6), y: 0.75, levels: [{ h: 5.72 }], wall: 0.5, roof: 'flat',
      doors: [{ at: [4.8, -4.0], w: 1.7 }], program: ['hall', 'study', 'store'] },
      { id: 'service', poly: rect(5.6, 6.4, 13, 4), y: 0.35, levels: [{ h: 3.1 }], wall: 0.4, roof: 'hip', pitch: 0.62,
        doors: [{ at: [10.2, 5.2], w: 1.8 }], program: ['kitchen', 'store'] },
      { id: 'audience', poly: rect(8.4, 7.0, -11, 4.5), y: 0.75, levels: [{ h: 5.2 }], wall: 0.5, roof: 'flat',
        doors: [{ at: [-6.8, 4.5], w: 1.6 }], program: ['hall'] }],
    note: 'the house\'s ground storey (the reception hall and the envoy\'s office), the kitchen range, the domed audience hall; the ' +
      'Velothi tower, the gatehouse and the house\'s upper blocks are solid' });

  /* ---------------- THE ORDER'S CHAPTERHOUSE (settlements/iziz src/76-port-chapterhouse.js, on the temple hill)
     The reading hall: a battered banco block (its faces recede 7 % of the half-width over 8.6 m), hollow with leaning walls
     (69e's batter), the double door in the porch. The wall here is the base wall plus the recess at the eaves, so nothing
     stands where the walls lean in. The tower, the drum halls and the annex stay solid behind their windows. */
  L.push({ key: 'port_order_chapterhouse', name: 'Chapterhouse of the Order of Historians', ancient: true, culture: 'iziz', wealth: 0.75,
    types: ['civic', 'religious'], lot: [40, 34],
    bodies: [{ id: 'reading-hall', poly: rect(22, 11, 0, -8.5), y: 0.45, levels: [{ h: 8.1 }], wall: 1.2, roof: 'flat',
      doors: [{ at: [0, -3.0], w: 2.9 }], program: ['library', 'study', 'library'] }],
    note: 'the reading hall only (the reading room, the archivist\'s study, the stacks)' });

  /* ---------------- THE ARENA (kits/ancients 77z, the elliptical shell; placed at 0.82 on the arena hill)
     The ring between the shell (its 24 openings are the bays' windows) and the wall behind the stands: 24 bays at ground
     level, the four at the portals merged in pairs into gate halls (the gates are double doors in the shell), every
     partition a door, so the ring is one enfilade. Ellipse radii and every share (s) in world metres at 0.82. */
  const AR = { a: 48 * 0.82, b: 40 * 0.82, y: 0.3, h: 5.3, bays: 24, gates: [3, 9, 15, 21], sIn: 0.885, sOut: 0.975, sDoor: 0.93,
    sWall: 1.02, sGate: 1.0, gateW: 3.0, gateH: 3.2 };
  const arenaRooms = [], AP = function (s, th) { return [+(AR.a * s * Math.cos(th)).toFixed(3), +(AR.b * s * Math.sin(th)).toFixed(3)]; };
  const ath = function (k) { return k / AR.bays * 2 * Math.PI; }, KINDS = ['barracks', 'store', 'study', 'workshop', 'shrine', 'hall'];
  /* rooms run from one partition to the next; a gate's partition is left out, so its two bays are one hall */
  const cuts = []; for (let k = 0; k < AR.bays; k++) if (AR.gates.indexOf(k) < 0) cuts.push(k);
  cuts.forEach(function (k0, i) {
    const k1 = i + 1 < cuts.length ? cuts[i + 1] : cuts[0] + AR.bays, ks = []; for (let k = k0; k <= k1; k++) ks.push(k);
    const poly = ks.map(function (k) { return AP(AR.sIn, ath(k)); }).concat(ks.slice().reverse().map(function (k) { return AP(AR.sOut, ath(k)); }));
    const id = 'bay' + (k0 % AR.bays), gate = ks.filter(function (k) { return AR.gates.indexOf(k % AR.bays) >= 0; })[0];
    const prev = 'bay' + cuts[(i + cuts.length - 1) % cuts.length], next = 'bay' + (k1 % AR.bays);
    const doors = [{ at: AP(AR.sDoor, ath(k0)), w: 1.1, to: '.' + prev, swing: 'in' }, { at: AP(AR.sDoor, ath(k1)), w: 1.1, to: '.' + next, swing: 'none' }];
    if (gate != null) doors.push({ at: AP(AR.sOut, ath(gate)), w: AR.gateW, to: 'street', swing: 'in' });
    /* and through the wall behind it, under the stands to the arena's floor (kits/ancients 77z, IZS_HOLLOW.arena) */
    if (gate != null) doors.push({ at: AP(AR.sIn, ath(gate)), w: 2.4, to: 'street', swing: 'none' });
    arenaRooms.push({ id: id, kind: gate != null ? 'antechamber' : KINDS[i % KINDS.length], poly: poly, y: AR.y, h: AR.h, level: 'ring', doors: doors });
  });
  L.push({ key: 'iziz_arena_ix', name: 'Arena — the ring of bays', ancient: true, culture: 'iziz', wealth: 0.6, types: ['civic'], lot: [82, 68],
    arena: AR, rooms: arenaRooms,
    note: 'the ring at ground level between the shell and the wall behind the stands: twenty bays and gate halls; the stands, ' +
      'the floor and the ring above the bays\' ceiling are not planned' });

  /* ---------------- THE TWO GUILDS (settlements/iziz src/77-anc-guilds.js): the Ancient buildings the guilds moved into
     The city places the Salvagers' Guild (the kit's laboratory, "the Reliquary") at 0.5 and the Mercenary Guild (the kit's
     police station, "the Watch") at 0.45; inside the city both shells are built open (IZS_HOLLOW.guilds: the windows and the
     door cut through, no core or ring of rooms). Each interior is the temple's plan of a level: a stair hall (2 CX x 2 CZ,
     the same switchback core: 24 risers a level, the landing on the south) and eight rooms round it out to the shell, cut by
     the hall's walls run on both ways (the owner, 2026-10-19: "split rooms in two"). `tower` holds what 78v draws: per level its floor, its rooms' outline (the shell at
     the level's ceiling, less 0.35: one shell leans in, the other waves) and its wall bands (each band's walls run out to the
     shell at the band's top); the slabs; the front door. World metres in the shell's local frame, +z its front. */
  const PT2 = 0.08, GCX = 2.2, GCZ = 3.0, GHOLE = [-1.25, 1.25, -2.95, 1.85];
  const r3 = function (P) { return P.map(function (p) { return [+p[0].toFixed(3), +p[1].toFixed(3)]; }); };
  /* the hall and the eight rooms of one level: the hall's four walls run on to the shell both ways, so each of the four
     arms beside the hall (o1a north, the front; o2a east; o3a south; o4a west) has a door from the hall, and each corner room
     (o1b north-west, o2b north-east, o3b south-east, o4b south-west) a door from the arm it turns off, IXD from the hall's
     corner. kinds [hall, o1a, o1b, o2a, o2b, o3a, o3b, o4a, o4b]; extra doors per room */
  const IXD = 2.0, SDX = 1.65, SDW = 0.8;   /* the hall's south door: east of the landing, clear of the arm's corner */
  const pinwheel = function (Lv, kinds, extra) {
    const id = function (r) { return '.' + Lv.id + '-' + r; }, S = Lv.outline, out = [], X = GCX, Z = GCZ, P = PT2;
    out.push({ id: Lv.id + '-hall', kind: kinds[0], poly: rect(2 * X - 2 * P, 2 * Z - 2 * P), y: Lv.y, h: Lv.h, level: Lv.id,
      doors: [{ at: [0, Z - P], w: 1.0, to: id('o1a'), swing: 'none' }, { at: [X - P, 0], w: 1.0, to: id('o2a'), swing: 'none' },
        { at: [SDX, -Z + P], w: SDW, to: id('o3a'), swing: 'none' }, { at: [-X + P, 0], w: 1.0, to: id('o4a'), swing: 'none' }],
      fixtures: [{ id: 'stair', kind: 'stair', x: 0, z: -0.55, ry: 0, w: 2.5, d: 4.8, h: Lv.h, reach: false }] });
    /* [id, outline, its door to the hall or to its arm (at, w, to)] */
    [['o1a', inBox(S, -X + P, X - P, Z + P, 99), [[0, Z + P], 1.0, 'hall'], [[-X + P, Z + IXD], 1.0, 'o1b']],
      ['o1b', inBox(S, -99, -X - P, Z + P, 99), [[-X - P, Z + IXD], 1.0, 'o1a']],
      ['o2a', inBox(S, X + P, 99, -Z + P, Z - P), [[X + P, 0], 1.0, 'hall'], [[X + IXD, Z - P], 1.0, 'o2b']],
      ['o2b', inBox(S, X + P, 99, Z + P, 99), [[X + IXD, Z + P], 1.0, 'o2a']],
      ['o3a', inBox(S, -X + P, X - P, -99, -Z - P), [[SDX, -Z - P], SDW, 'hall'], [[X - P, -Z - IXD], 1.0, 'o3b']],
      ['o3b', inBox(S, X + P, 99, -99, -Z - P), [[X + P, -Z - IXD], 1.0, 'o3a']],
      ['o4a', inBox(S, -99, -X - P, -Z + P, Z - P), [[-X - P, 0], 1.0, 'hall'], [[-X - IXD, -Z + P], 1.0, 'o4b']],
      ['o4b', inBox(S, -99, -X - P, -99, -Z - P), [[-X - IXD, -Z - P], 1.0, 'o4a']]]
      .forEach(function (o, i) {
        const doors = o.slice(2).map(function (d) { return { at: d[0], w: d[1], to: id(d[2]), swing: d[2] === 'hall' || o[0].slice(-1) === 'b' ? 'in' : 'none' }; });
        out.push({ id: Lv.id + '-' + o[0], kind: kinds[i + 1], poly: o[1], y: Lv.y, h: Lv.h, level: Lv.id,
          doors: doors.concat((extra && extra[o[0]]) || []) });
      });
    return out;
  };
  /* every level's rooms; the front room of the ground floor takes the street door */
  const guildRooms = function (G, kinds) {
    let R = []; G.levels.forEach(function (Lv, i) { R = R.concat(pinwheel(Lv, kinds[i], i ? null : { o1a: [{ at: G.door.room, w: G.door.roomW || G.door.w, to: 'street', swing: 'in' }] })); });
    return R;
  };

  /* the Watch: the battered hex (R 34 at the foot to 30 at the eaves over 12, its foot 0.8 up on the pad; kits/ancients
     73-police.js), at 0.45. Two storeys: the ground floor on the pad, the upper floor 3.15 up, under the roof slab (5.58). The
     sally-port on the +z face is the front door (POLICE_DOOR: 2.5 wide, open to 2.91). */
  const PS = 0.45, PC30 = Math.cos(Math.PI / 6);
  const pApo = function (y) { return (34 - 4 * (y / PS - 0.8) / 12) * PC30 * PS; };   /* the shell's apothem at height y */
  const hex = function (a) { const P = []; for (let k = 0; k < 6; k++) { const t = k / 3 * Math.PI; P.push([a / PC30 * Math.cos(t), a / PC30 * Math.sin(t)]); } return r3(P); };
  const WATCH = {
    cx: GCX, cz: GCZ, hole: GHOLE, wall: 0xc8c0b4,
    levels: [
      { id: 'g', name: 'ground floor', y: 0.40, h: 2.5, outline: hex(pApo(2.9) - 0.35), bands: [[0.40, 1.65, hex(pApo(1.65) - 0.08)], [1.65, 2.9, hex(pApo(2.9) - 0.08)]] },
      { id: 'u', name: 'upper floor', y: 3.15, h: 2.33, outline: hex(pApo(5.48) - 0.35), bands: [[3.15, 4.3, hex(pApo(4.3) - 0.08)], [4.3, 5.48, hex(pApo(5.48) - 0.08)]] }],
    slabs: [{ y: 0.40, t: 0.04, poly: hex(pApo(0.40) - 0.05) }, { y: 3.15, t: 0.25, poly: hex(pApo(3.15) - 0.05), hole: true },
      { y: 5.58, t: 0.1, poly: hex(pApo(5.58) - 0.02) }],
    door: { x: 0, z: +(pApo(2.85) - 0.03).toFixed(3), ry: 0, w: 2.4, h: 2.45, top: 2.91, room: [0, +(pApo(2.9) - 0.35).toFixed(3)] }
  };
  L.push({ key: 'anc_mercenary_ix', name: 'Mercenary Guild — the Watch', ancient: true, culture: 'iziz', wealth: 0.55,
    types: ['civic', 'military'], lot: [32, 32], tower: WATCH,
    rooms: guildRooms(WATCH, [['antechamber', 'antechamber', 'hall', 'store', 'workshop', 'kitchen', 'store', 'study', 'tavern'],
      ['antechamber', 'study', 'library', 'dormitory', 'dormitory', 'barracks', 'barracks', 'workshop', 'store']]),
    note: 'the hex block\'s two storeys: the vestibule at the door, the contract hall, the armoury and the workshop, the kitchen ' +
      'and its larder, the clerk and the mess; upstairs the guildmaster\'s study, the contract archive, two dormitories and two ' +
      'barrack rooms for the hired blades, the armourer and his store; the tower, the vehicle wing and the yard are not planned' });

  /* the Reliquary: the waved tower (six storeys of 4.4, each r 30 + 2.6 sin(7 th + 0.55 s) + 1.1 sin(3 th - 0.385 s); kits/ancients
     89-lab.js), at 0.5. A storey is 2.2 m here, so a level is two: three levels of 4.4 (floors 0.13, 4.525, 8.925, under the
     roof at 13.2). The front door is the arcade's arch facing the front (LAB_DOOR, 3.3/14 of a turn), its leaves inside the
     skin across their width. */
  const LS = 0.5, LH = 4.4, LTH = 3.3 / 14 * 2 * Math.PI;
  const rW = function (th, s) { return 30 + 2.6 * Math.sin(7 * th + 0.55 * s) + 1.1 * Math.sin(3 * th - 0.385 * s); };
  /* a closed outline at f(th), with a vertex at the door's bearing (the street door stands on it) */
  const wave = function (f) {
    const P = [], N = 96; let put = false;
    for (let i = 0; i < N; i++) { const th = i / N * 2 * Math.PI; if (!put && th > LTH) { P.push([f(LTH) * Math.cos(LTH), f(LTH) * Math.sin(LTH)]); put = true; } P.push([f(th) * Math.cos(th), f(th) * Math.sin(th)]); }
    return r3(P);
  };
  const lvl = function (l, y, h, id, name) {
    const a = 2 * l, b = 2 * l + 1, mid = b * LH * LS;
    return { id: id, name: name, y: y, h: h, outline: wave(function (th) { return Math.min(rW(th, a), rW(th, b)) * LS - 0.35; }),
      bands: [[y, mid, wave(function (th) { return rW(th, a) * LS - 0.08; })], [mid, y + h, wave(function (th) { return rW(th, b) * LS - 0.08; })]] };
  };
  const RELIQ = {
    cx: GCX, cz: GCZ, hole: GHOLE, wall: 0xe8e2d6,
    levels: [lvl(0, 0.13, 4.095, 'g', 'ground floor'), lvl(1, 4.525, 4.1, 'l1', 'first floor'), lvl(2, 8.925, 4.125, 'l2', 'second floor')],
    slabs: [{ y: 0.13, t: 0.13, poly: wave(function (th) { return rW(th, 0) * LS - 0.03; }) },
      { y: 4.525, t: 0.3, poly: wave(function (th) { return rW(th, 2) * LS - 0.03; }), hole: true },
      { y: 8.925, t: 0.3, poly: wave(function (th) { return rW(th, 4) * LS - 0.03; }), hole: true },
      { y: 13.2, t: 0.15, poly: wave(function (th) { return rW(th, 5) * LS - 0.03; }) }]
  };
  {
    let rm = 99; for (let k = -6; k <= 6; k++) rm = Math.min(rm, rW(LTH + k * 0.0055, 0));   /* the skin across the door's 2 m */
    const r = rm * LS - 0.1, ro = Math.min(rW(LTH, 0), rW(LTH, 1)) * LS - 0.35;
    RELIQ.door = { x: +(r * Math.cos(LTH)).toFixed(3), z: +(r * Math.sin(LTH)).toFixed(3), ry: +Math.atan2(Math.cos(LTH), Math.sin(LTH)).toFixed(4),
      w: 1.9, roomW: 1.5, h: 2.15, top: 3.75, room: [+(ro * Math.cos(LTH)).toFixed(3), +(ro * Math.sin(LTH)).toFixed(3)] };
  }
  L.push({ key: 'anc_salvagers_ix', name: 'Salvagers\' Guild — the Reliquary', ancient: true, culture: 'iziz', wealth: 0.6,
    types: ['civic', 'industry'], lot: [36, 36], tower: RELIQ,
    rooms: guildRooms(RELIQ, [['antechamber', 'antechamber', 'hall', 'workshop', 'workshop', 'store', 'store', 'workshop', 'workshop'],
      ['antechamber', 'study', 'library', 'study', 'library', 'store', 'store', 'school', 'school'],
      ['antechamber', 'study', 'hall', 'study', 'dormitory', 'store', 'dormitory', 'kitchen', 'tavern']]),
    note: 'the tower\'s six storeys as three levels: the vestibule and the weighing-in hall at the door, four sorting and mending ' +
      'shops and two vaults; the appraisers\' studies, the archives of finds, two more vaults and the apprentices\' schoolrooms; ' +
      'the guildmaster, the council hall, the steward, the keepers\' dormitories, their store, kitchen and refectory. The dome, ' +
      'the reactor hut and the yard are not planned' });

  IX.sets.add({ set: 'iziz-ancient', title: 'Iziz: the Ancient civic buildings', culture: 'iziz', items: L });
})(KratorInteriors);
