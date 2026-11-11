/* ======================== Ancients interiors: the reception ========================
   In the kit's core since 2026-11-08 (opt-in from 2026-11-03, as opt/38-ai-reception.js and kit_bundle.bundle(reception=True)).

   AI.RECIPES.reception: an office's front hall. Frame and rules as every hall recipe (30-ai-recipes.js): origin at the
   floor's centre, x across w, z along d, the door at (0, d/2) on the +z wall, the -z wall the back (glass or wall);
   every put is fit or skip, and AI.audit checks the result.

     the counter   a run of counters (1 to 3, by the width) facing the door across the room, set off the back wall;
                   one or two chairs behind each, papers on the first, a light ring over the run
     the approach  the floor from the door to the counter is kept clear (a carpet on it, walked on); the counter run
                   and the aisles beside it (1.1 m) are the staff's way round
     waiting       in the two wings beside the counter: lounge groups (a low table on a carpet, a divan either side
                   facing it across z), as many as fit along x and, in a deep room, in rows along z; a light ring
                   over each. One group is 3.2 m deep, so a 4.5 m room holds one row and keeps the group whole
     the walls     a notice board (the role `board`) beside the door, facing in (on a shallow room's front wall; a deep
                   room has it on the back wall behind the counter, between archives); banners flanking the counter;
                   a statue each side of the door; planting beds (`bed`, as the plaza's) on the side walls where a
                   wing has room; lamp stems in the corners

   The role `board` is new: this file adds it to each dress that lacks it (ancient: ancients_board, occupied:
   post-apoc_common_board), changing no other role. Default 16 x 6 x 3.4 m; it lays out at 12-20 m wide and 4.5-12 m deep.
   ====================================================================== */
(function (AI) {
  'use strict';
  if (!AI.RECIPES || AI.RECIPES.reception) return;
  const PI = Math.PI;
  const AISLE = 1.1;       /* between the counter run's ends and the wings */
  const BOARD = { ancient: 'ancients_board', occupied: 'post-apoc_common_board' };
  for (const k in BOARD) if (AI.DRESS[k] && !('board' in AI.DRESS[k])) AI.DRESS[k].board = BOARD[k];

  /* a waiting group: a carpet, a low table on it, a divan either side facing it across z; returns the divans made */
  function group(c, x, z) {
    const L = c.dims('lowTable'), V = c.dims('divan');
    if (!L || !V) return 0;
    const off = L.d / 2 + 0.35 + V.d / 2;
    const a = c.put('divan', x, z - off, 0), b = c.put('divan', x, z + off, PI);
    if (a == null && b == null) return 0;
    c.put('rug', x, z, 0, { flat: true });
    c.put('lowTable', x, z, 0);
    c.put('ceilingLamp', x, z, 0);
    return (a == null ? 0 : 1) + (b == null ? 0 : 1);
  }

  AI.RECIPES.reception = { name: 'Reception', kind: 'reception', w: 16, d: 6, h: 3.4, min: { counter: 1, chair: 1, divan: 2 }, build(c) {
    const C = c.dims('counter'), CH = c.dims('chair'), V = c.dims('divan'), L = c.dims('lowTable');
    if (!C || !CH) return false;
    const deep = c.d >= 7.5, back = -c.d / 2, front = c.d / 2;
    const BK = c.dims('bookcase'), BD = c.dims('board'), BED = c.dims('bed'), LS = c.dims('lampStem');

    /* ---------- the counter run, facing the door */
    const n = Math.max(1, Math.min(3, Math.floor((c.w - 8) / 4))), cw = C.w + 0.02, runW = n * cw;
    const wallD = deep ? Math.max(BK ? BK.d : 0, BD ? BD.d : 0) + 0.04 + 0.9 : 0.15;
    const chairZ = back + wallD + CH.d / 2, counterZ = chairZ + CH.d / 2 + 0.25 + C.d / 2;
    let made = 0, first = null;
    for (let i = 0; i < n; i++) {
      const x = -runW / 2 + cw / 2 + i * cw, K = c.put('counter', x, counterZ, 0);
      if (K == null) continue;
      made++;
      if (first == null) first = K;
      const seats = C.w >= 2.2 ? [-C.w / 4, C.w / 4] : [0];
      for (const dx of seats) c.put('chair', x + dx, chairZ, 0);
    }
    if (first != null) c.put('books', c.res.placements[first].x - C.w / 4, counterZ, 0, { on: first });
    c.put('ceilingLamp', 0, counterZ, 0);

    /* ---------- the approach: a carpet from the counter to the doorway (walked on) */
    const az0 = counterZ + C.d / 2 + 0.3, az1 = front - 0.3, R = c.dims('rug');
    if (R && az1 - az0 >= R.d) c.put('rug', 0, (az0 + az1) / 2, az1 - az0 >= R.w ? PI / 2 : 0, { flat: true });

    /* ---------- the walls round the counter and the door */
    const ST = c.dims('statue'), stX = 0.8 + 0.2 + 0.3 + (ST ? ST.w / 2 : 0);
    if (ST) for (const s of [-1, 1]) c.put('statue', s * stX, front - 0.3 - ST.d / 2, PI);
    if (deep) {
      /* the staff's wall: the board behind the counter, archives either side of it (to the aisles' ends), else a banner */
      const B = c.wall('board', 'back', 0), bw = B == null ? 0 : BD.w / 2 + 0.2;
      for (const s of [-1, 1]) {
        const got = BK ? c.wallRow('bookcase', 'back', s < 0 ? -(runW / 2 + AISLE) : bw, s < 0 ? -bw : runW / 2 + AISLE, { space: 0.1 }) : [];
        if (!got.length) c.wall('banner', 'back', s * (bw + 0.5));
      }
    } else {
      /* the board on the front wall, beyond a statue, on the seeded side (the other if it does not fit); banners flank the counter */
      if (BD) {
        const side = c.rnd() < 0.5 ? -1 : 1, bx = stX + (ST ? ST.w / 2 : 0) + 0.3 + BD.w / 2;
        if (c.wall('board', 'front', side * bx) == null) c.wall('board', 'front', -side * bx);
      }
      for (const s of [-1, 1]) c.wall('banner', 'back', s * (runW / 2 + AISLE / 2));
    }

    /* ---------- the wings: waiting groups, then planting beds on the side walls, lamps in the corners */
    let divans = 0;
    const lampAt = { '-1': true, '1': true };
    if (V && L) {
      const GW = Math.max(V.w, L.w), GD = L.d + 2 * (0.35 + V.d), x0 = runW / 2 + AISLE, x1 = c.w / 2 - 0.3;
      const zs0 = back + 0.4, zs1 = front - 0.4, rows = Math.max(1, Math.floor((zs1 - zs0 + 0.9) / (GD + 0.9)));
      const planter = BED ? BED.d + 0.04 + 0.8 : Infinity, lampRoom = LS ? LS.w + 0.2 : 0;
      let cols = Math.max(0, Math.floor((x1 - x0 - lampRoom + 1.0) / (GW + 1.0)));
      const used = cols * GW + Math.max(0, cols - 1) * 1.0, bedFits = x1 - x0 - used >= planter;
      const gx1 = bedFits ? x1 - planter : x1 - lampRoom;
      for (const s of [-1, 1]) {
        for (let j = 0; j < cols; j++) for (let r = 0; r < rows; r++) {
          const x = (x0 + gx1) / 2 - used / 2 + GW / 2 + j * (GW + 1.0), z = (zs0 + zs1) / 2 - ((rows - 1) * (GD + 0.9)) / 2 + r * (GD + 0.9);
          divans += group(c, s * x, z);
        }
        if (!bedFits) continue;
        /* the beds between the corner lamps; a room too shallow for both keeps the beds and drops that side's lamps */
        const lg = LS ? LS.d + 0.35 : 0.3, withLamps = c.d - 2 * lg >= BED.w;
        const u0 = withLamps ? back + lg : back + 0.3, u1 = withLamps ? front - lg : front - 0.3;
        if (c.wallRow('bed', s < 0 ? 'left' : 'right', u0, u1, { space: 0.8, vf: i => (i + (s > 0 ? 1 : 0)) % 3 }).length && !withLamps) lampAt[s] = false;
      }
    }
    if (LS) for (const s of [-1, 1]) if (lampAt[s]) for (const z of [back + 0.15 + LS.d / 2, front - 0.15 - LS.d / 2]) c.put('lampStem', s * (c.w / 2 - 0.15 - LS.w / 2), z, 0);
    return made > 0 && divans > 0;
  } };
})(KratorAncientsInteriors);
