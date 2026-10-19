// ================================================================= PINNACLE ROCK — the Garden's great-houses (P3e)  [G data]
// PRG.plan(o) settles the Garden's mesa (PLAN.md section 1: "The Garden's great-houses stand on it among the pinnacles"):
// the clans' great-houses, two chiefs' compounds and the rock longhouses backed against the pinnacles' feet, on the
// Garden's top among its sixteen pinnacles, round the Heart (the third mesa, no town on it); a path round the Heart's foot
// joining the ways up (the Garden's stair and ramp, the stair up the Heart: the roost plan's ascents) and every house's
// door. Plain records only: no THREE, no DOM.
//
//   o = {K (KSTACKS), rock, garden (the Garden's mesa), heart (the Heart), stacks (the pinnacles on the Garden's top),
//        ascents (the roost plan's: their ends kept clear), climbs (the pinnacles' climbs: their starts kept clear),
//        dims(key, v), tags, seed}
//   -> {houses, path, keep, log}
//
// THE GROUND: the Garden's own cap 8 m in from its rim, 6 m off every pinnacle's foot (a rock longhouse's back 1.2 m off
// it), 10 m off the Heart's foot, 8 m off an ascent's end and a climb's start, and off the path. THE HOUSES are pitched as
// the camps are (largest first, each the first fit on rings out from its place, 3 m clear of every other), each facing the
// Heart; the rock longhouses first, one against each of four pinnacles on the side away from the Heart.
const PRG = (function () {
  'use strict';
  const RIM = 8, STACK = 6, HEART = 10, END = 8, GAP = 3, PATH_W = 4;
  const HOUSES = [['br_bldg_chief_compound', 0], ['br_bldg_chief_compound', 1], ['br_bldg_great_house', 1], ['br_bldg_great_house', 0], ['br_bldg_great_house', 1],
    ['br_bldg_great_house', 0], ['br_bldg_great_house', 1], ['br_bldg_great_house', 0], ['br_bldg_great_house', 1], ['br_bldg_great_house', 0],
    ['br_bldg_great_house', 1], ['br_bldg_great_house', 0]];
  function plan(o) {
    const K = o.K, G = o.garden, H = o.heart, LOG = { short: [] }, tags = o.tags || null, top = G.top;
    const seed = KRAND.child(o.seed == null ? 20261019 : o.seed, 'pinnacle-garden') >>> 0, u = (...k) => KRAND.unit(KRAND.hash(seed, ...k));
    const box = (x, z, ry, w, d) => { const ux = Math.cos(ry), uz = -Math.sin(ry), vx = Math.sin(ry), vz = Math.cos(ry);
      return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(q => [x + ux * w / 2 * q[0] + vx * d / 2 * q[1], z + uz * w / 2 * q[0] + vz * d / 2 * q[1]]); };
    const sep = (A, B) => { for (const Q of [A, B]) for (let j = 0; j < 4; j++) { const a = Q[j], b = Q[(j + 1) % 4], n = [-(b[1] - a[1]), b[0] - a[0]];
      const pa = A.map(q => q[0] * n[0] + q[1] * n[1]), pb = B.map(q => q[0] * n[0] + q[1] * n[1]);
      if (Math.max(...pa) <= Math.min(...pb) + 0.01 || Math.max(...pb) <= Math.min(...pa) + 0.01) return true; } return false; };
    const facing = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
    // the path round the Heart: its foot (every bed within 20 m of it) out 6 m and half the path, smoothed; and a spur from
    // each ascent's top (the Garden's stair and ramp) in to it
    const ring = (() => { const n = 64, r = new Array(n).fill(0); H.beds.filter(b => b.y < H.y0 + 20).forEach(b => { for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2;
        r[k] = Math.max(r[k], K.footR(b, a) + (b.cx - H.x) * Math.cos(a) + (b.cz - H.z) * Math.sin(a)); } });
      return r.map((v, k) => { const a = k / n * Math.PI * 2, R = Math.max(v, r[(k + n - 1) % n], r[(k + 1) % n]) + 6 + PATH_W / 2; return [H.x + Math.cos(a) * R, H.z + Math.sin(a) * R]; }); })();
    const ends = (o.ascents || []).map(A => { const p = A.pts[A.pts.length - 1]; return { id: A.id, x: p[0], y: p[1], z: p[2], body: A.body }; });
    const starts = (o.ascents || []).filter(A => A.body === H.id).map(A => { const p = A.pts[0]; return { id: A.id, x: p[0], z: p[2] }; });
    const ways = [{ id: 'garden-ring', name: 'the path round the Heart', pts: ring, w: PATH_W, closed: true }];
    ends.filter(e => e.body === G.id).forEach(e => { let b = null, bd = 1e9; ring.forEach(q => { const d = Math.hypot(q[0] - e.x, q[1] - e.z); if (d < bd) { bd = d; b = q; } });
      const n = Math.max(2, Math.ceil(bd / 6)), pts = []; for (let k = 0; k <= n; k++) pts.push([e.x + (b[0] - e.x) * k / n, e.z + (b[1] - e.z) * k / n]);
      ways.push({ id: 'garden-from-' + e.id, name: 'the path from ' + e.id.replace('garden-', 'the Garden\'s '), pts, w: PATH_W }); });
    const segD = (q, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dz) / Math.max(1e-9, dx * dx + dz * dz)));
      return Math.hypot(q[0] - a[0] - dx * t, q[1] - a[1] - dz * t); };
    const wayD = q => { let d = 1e9; ways.forEach(W => { const P = W.closed ? W.pts.concat([W.pts[0]]) : W.pts; for (let i = 1; i < P.length; i++) d = Math.min(d, segD(q, P[i - 1], P[i]) - W.w / 2); }); return d; };
    // the ground a house may take
    const keep = [].concat(ends.map(e => [e.x, e.z]), starts.map(s => [s.x, s.z]), (o.climbs || []).filter(c => Math.abs(c.pts[0][1] - top) < 3).map(c => [c.pts[0][0], c.pts[0][2]]));
    const others = o.stacks.concat([H]);
    const ok = (x, z, back) => { const a = K.at(o.rock, x, z); if (!a || a.S !== G || a.d > -RIM || Math.abs(a.top - top) > 2) return false;
      const f = K.foot(others, x, z); if (f && f.d < (f.S === H ? HEART : back ? 1.2 : STACK)) return false;
      if (keep.some(q => Math.hypot(q[0] - x, q[1] - z) < END)) return false; return wayD([x, z]) > 1; };
    // a box against a way: within its half-width and a metre of any of its segments (or crossing one)
    const cross = (a, b, c, d) => { const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]); return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0; };
    const onWay = B => ways.some(W => { const P = W.closed ? W.pts.concat([W.pts[0]]) : W.pts;
      for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i];
        if (B.some(q => segD(q, a, b) < W.w / 2 + 1)) return true;
        for (let j = 0; j < 4; j++) { const c = B[j], d = B[(j + 1) % 4]; if (cross(a, b, c, d) || segD(a, c, d) < W.w / 2 + 1 || segD(b, c, d) < W.w / 2 + 1) return true; }
        if ([a, b].some(p => { let sg = 0; for (let j = 0; j < 4; j++) { const c = B[j], d = B[(j + 1) % 4], cr = (d[0] - c[0]) * (p[1] - c[1]) - (d[1] - c[1]) * (p[0] - c[0]); if (!sg) sg = Math.sign(cr); else if (Math.sign(cr) !== sg) return false; } return true; })) return true; }
      return false; });
    const houses = [], boxes = [];
    const place = (key, v, cx, cz, R, rys, tag) => { const D = o.dims(key, v); if (!D) { LOG.short.push('no ' + key); return null; }
      for (let r = 0; r <= R; r += 3) { const n = r === 0 ? 1 : Math.max(8, Math.round(2 * Math.PI * r / 4));
        for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + u(1, houses.length, r) * 0.7, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
          for (const ry of rys(x, z)) { const B = box(x, z, ry, D.w, D.d), Bg = box(x, z, ry, D.w + 2 * GAP, D.d + 2 * GAP);
            const pts = B.concat(B.map((q, j) => [(q[0] + B[(j + 1) % 4][0]) / 2, (q[1] + B[(j + 1) % 4][1]) / 2]), [[x, z]]);
            if (!pts.every(q => ok(q[0], q[1], tag === 'back'))) continue; if (boxes.some(Q => !sep(Bg, Q)) || onWay(B)) continue;
            const hs = B.map(q => { const t = K.topAt([G], q[0], q[1]); return t > -1e8 ? t : top; });
            const rec = { key, v, x: +x.toFixed(2), z: +z.toFixed(2), y: +Math.max(...hs).toFixed(2), ry: +ry.toFixed(4), w: D.w, d: D.d, h: D.h, tag: null,
              name: key === 'br_bldg_chief_compound' ? 'a chief\'s compound in the Garden' : key === 'br_bldg_longhouse_block' ? 'a rock longhouse against a pinnacle' : 'a clan\'s great-house in the Garden' };
            houses.push(rec); boxes.push(B); return rec; } } }
      LOG.short.push(key + ' #' + v); return null; };
    // the rock longhouses: against four pinnacles (the Garden's edge ones), their backs toward the rock, facing out
    const edge = o.stacks.filter(S => Math.hypot(S.x - G.x, S.z - G.z) > 90).sort((a, b) => Math.atan2(a.z - G.z, a.x - G.x) - Math.atan2(b.z - G.z, b.x - G.x));
    for (let i = 0; i < 4 && edge.length; i++) { const S = edge[Math.floor(i * edge.length / 4)], D = o.dims('br_bldg_longhouse_block', i % 2); if (!D) break;
      const ax = S.x - H.x, az = S.z - H.z, al = Math.hypot(ax, az) || 1, nx = ax / al, nz = az / al, R0 = K.footR(S.beds[0], Math.atan2(nz, nx)) + 1.4 + D.d / 2;
      place('br_bldg_longhouse_block', i % 2, S.x + nx * R0, S.z + nz * R0, 9, (x, z) => { const f = Math.atan2(x - S.x, z - S.z); return [f]; }, 'back'); }
    // the compounds and the great-houses round the Heart, facing it: spread round the ring at even angles
    HOUSES.forEach((Hs, i) => { const a = i / HOUSES.length * Math.PI * 2 + 0.3, Rm = 0.5 * (Math.max(...ring.map(q => Math.hypot(q[0] - H.x, q[1] - H.z))) + 175);
      place(Hs[0], Hs[1], H.x + Math.cos(a) * Rm, H.z + Math.sin(a) * Rm, 60, (x, z) => { const f = facing(x, z, H.x, H.z); return [f, f + Math.PI / 2, f - Math.PI / 2]; }, null); });
    if (tags) {
      houses.forEach(h => { const T = tags.add({ 'class': 'building', kind: 'house', key: h.key, at: [h.x, h.y, h.z], ry: h.ry, size: [h.w, h.d, h.h], note: h.name, src: 'pinnacle-rock' }); if (T) h.tag = T.id; });
      ways.forEach(W => { const m = W.pts[W.pts.length >> 1], T = tags.add({ 'class': 'infrastructure', kind: 'path', key: 'path', at: [m[0], top, m[1]], ry: 0, size: [W.w, 0, 0], note: W.name, src: 'pinnacle-rock' }); if (T) W.tag = T.id; });
    }
    LOG.houses = houses.length + ' houses (' + houses.filter(h => h.key === 'br_bldg_great_house').length + ' great-houses, ' + houses.filter(h => h.key === 'br_bldg_chief_compound').length +
      ' compounds, ' + houses.filter(h => h.key === 'br_bldg_longhouse_block').length + ' rock longhouses), ' + ways.length + ' paths';
    return { houses, ways, keep, log: LOG };
  }
  return { plan, RIM, STACK, HEART, END, GAP, PATH_W };
})();
