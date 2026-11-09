/* node tools/walk_audit/reach_dump.js <dump.json> <key> [n] [--map y] [--all]      or      <dump.json> --summary
   The reachability audit of tools/walk_audit/reach_audit.py again, without a browser, on the walk registry it dumped (--dump): for the n-th
   top-level placement of <key> (0), the floors it owns, reached or not, in the building's local frame (+z its front; metres), and with
   --map y a plan of the flood at height y (# block, . floor at y not reached, o reached, - no floor), 0.4 m a character. A debugging aid
   for a builder adding stairs: which floor is cut off, and where. */
'use strict';
const fs = require('fs'), path = require('path');
eval(fs.readFileSync(path.join(__dirname, '..', '..', 'core', 'walk', '20-core-walk.js'), 'utf8'));
const KW = globalThis.KWALK, args = process.argv.slice(2), D = JSON.parse(fs.readFileSync(args[0], 'utf8')), key = args[1];
const n = args[2] && !args[2].startsWith('--') ? +args[2] : 0, mi = args.indexOf('--map'), mapY = mi >= 0 ? +args[mi + 1] : null, all = args.includes('--all');
const W = KW.create();
for (const f of D.walk.floors) { if (f.kind === 'rect') W.floor(f); else if (f.kind === 'strip') W.strip(f); else W.poly(f); }
for (const b of D.walk.blocks) { const r = W.block(b.box, b.tag); if (b.off) W.setBlock(r, false); }
/* --summary: every top-level building, as reach_audit.py counts them less the climbs (strips, landings, rungs), and a second count that leaves out the floors no one could stand
   on: one with another registered floor less than 1.2 m over its middle (a joist under a deck, a string course under a floor, a tread
   under a landing) */
if (key === '--summary') {
  const g0 = D.ground == null ? 0 : D.ground, per = {}, seen = new Map(), own = new Map();
  const fb0 = F => { const hw = F.w / 2; return F.kind === 'rect' ? F.rect : F.kind === 'strip' ? [Math.min(F.a[0], F.b[0]) - hw, Math.max(F.a[0], F.b[0]) + hw, Math.min(F.a[1], F.b[1]) - hw, Math.max(F.a[1], F.b[1]) + hw] : F.bbox; };
  const area = F => { if (F.kind === 'rect') return (F.rect[1] - F.rect[0]) * (F.rect[3] - F.rect[2]); if (F.kind === 'strip') return Math.hypot(F.b[0] - F.a[0], F.b[1] - F.a[1]) * F.w;
    let s = 0; const P = F.pts; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s) / 2; };
  const topY = F => F.kind === 'rect' ? F.y : F.kind === 'strip' ? Math.max(F.a[2], F.b[2]) : Math.max(...F.pts.map(p => p[2]));
  const covered = F => { if (F.kind === 'strip') return false; const b = fb0(F), x = (b[0] + b[1]) / 2, z = (b[2] + b[3]) / 2, y = topY(F);
    return W.floorsAt(x, z).some(f => f[1] !== F && f[0] > y + 0.05 && f[0] < y + 1.2); };
  for (const r of D.tops) {
    const b = r.bbox, box = [b.mn[0] - 3, b.mx[0] + 3, b.mn[2] - 3, b.mx[2] + 3], keys = new Set(r.keys), st = [];
    for (const d of r.doors) { st.push([d[0], d[1], d[2]]); const ox = d[0] + Math.sin(d[3]), oz = d[2] + Math.cos(d[3]); st.push([ox, g0, oz]); }
    if (r.front) { const f = r.front; st.push([f.x, f.y, f.z]); const ox = f.x + Math.sin(f.yaw), oz = f.z + Math.cos(f.yaw); st.push([ox, g0, oz]); }
    const R = W.reach(st, { box, ground: () => g0 }), hit = new Set(R.reached);
    for (const F of R.reached.concat(R.unreached)) { const t = F.tag || '', k = t.slice(t.indexOf(':') + 1); if (!keys.has(k)) continue;
      if (!own.has(F)) own.set(F, { key: r.key, top: b.mx[1] }); if (hit.has(F)) seen.set(F, true); else if (!seen.has(F)) seen.set(F, false); }
  }
  /* the climbs themselves (a stair's strip and landing, a ladder's rungs) are left out of these counts: how many there are depends on
     how a flight is registered, not on what is reached */
  const climb = F => F.kind === 'strip' || /^(rung|landing|stair|ladder)$/.test(F.name || '') || /\.rung\d+$/.test(F.name || '');
  const T = { reached: 0, unreached: 0, big: 0, standable: 0, bigStandable: 0 };
  for (const [F, ok] of seen) { if (climb(F)) continue; const o = own.get(F), P = per[o.key] || (per[o.key] = { reached: 0, unreached: 0, big: 0, standable: 0, bigStandable: 0 });
    const big = !ok && area(F) >= 2 && topY(F) <= o.top - 1, cov = covered(F);
    if (ok) { P.reached++; T.reached++; } else { P.unreached++; T.unreached++; if (!cov) { P.standable++; T.standable++; } }
    if (big) { P.big++; T.big++; if (!cov) { P.bigStandable++; T.bigStandable++; } } }
  console.log(JSON.stringify({ total: T, kinds: per }));
  process.exit(0);
}
const tops = D.tops.filter(t => t.key === key), r = tops[n];
if (!r) { console.log('no placement', key, n, 'of', tops.length); process.exit(1); }
const g = D.ground == null ? 0 : D.ground, C = Math.cos(r.ry), S = Math.sin(r.ry);
const loc = (x, z) => { const dx = x - r.x, dz = z - r.z; return [+(dx * C - dz * S).toFixed(2), +(dx * S + dz * C).toFixed(2)]; };
const b = r.bbox, grow = 3, box = [b.mn[0] - grow, b.mx[0] + grow, b.mn[2] - grow, b.mx[2] + grow], keys = new Set(r.keys);
const starts = [];
for (const d of r.doors) { starts.push([d[0], d[1], d[2]]); const ox = d[0] + Math.sin(d[3]), oz = d[2] + Math.cos(d[3]); starts.push([ox, g, oz]); }
if (r.front) { const f = r.front; starts.push([f.x, f.y, f.z]); const ox = f.x + Math.sin(f.yaw), oz = f.z + Math.cos(f.yaw); starts.push([ox, g, oz]); }
const R = W.reach(starts, { box, ground: () => g }), hit = new Set(R.reached);
const mine = F => { const t = F.tag || '', k = t.slice(t.indexOf(':') + 1); return keys.has(k); };
const fb = F => { const hw = F.w / 2; return F.kind === 'rect' ? F.rect : F.kind === 'strip' ? [Math.min(F.a[0], F.b[0]) - hw, Math.max(F.a[0], F.b[0]) + hw, Math.min(F.a[1], F.b[1]) - hw, Math.max(F.a[1], F.b[1]) + hw] : F.bbox; };
const fy = F => F.kind === 'rect' ? F.y : F.kind === 'strip' ? [F.a[2], F.b[2]] : F.pts[0][2];
console.log(key, n, 'at', r.x.toFixed(1), r.z.toFixed(1), 'ry', r.ry.toFixed(2), 'doors', r.doors.map(d => loc(d[0], d[2]).concat(+(d[1] - g).toFixed(2))));
const L = R.reached.concat(R.unreached).filter(mine).sort((p, q) => [].concat(fy(p))[0] - [].concat(fy(q))[0]);
for (const F of L) { if (!all && hit.has(F)) continue; const bb = fb(F), c0 = loc(bb[0], bb[2]), c1 = loc(bb[1], bb[3]);
  console.log((hit.has(F) ? '  reached   ' : '  UNREACHED ') + (F.tag + ' ' + F.name).padEnd(34), 'y', JSON.stringify(fy(F)), 'local x', Math.min(c0[0], c1[0]), '..', Math.max(c0[0], c1[0]), 'z', Math.min(c0[1], c1[1]), '..', Math.max(c0[1], c1[1])); }
console.log('reached', L.filter(F => hit.has(F)).length, 'unreached', L.filter(F => !hit.has(F)).length, 'nodes', R.nodes);
if (mapY != null) {   /* the plan at y, in world axes (x across, z down), around the building */
  const st = .4, seen = new Map(); const R2 = W.reach(starts, { box, ground: () => g });
  /* re-flood to collect the samples' heights: reach() keeps none, so sample each cell's floors near mapY and mark those reached floors */
  const rows = [];
  for (let z = box[2]; z <= box[3]; z += st) { let row = '';
    for (let x = box[0]; x <= box[1]; x += st) { const fs2 = W.floorsAt(x, z).filter(f => Math.abs(f[0] - mapY) < .3);
      if (W.blocked(x, mapY + .05, z, .25, 1.65)) row += '#'; else if (!fs2.length) row += '-'; else row += fs2.some(f => R2.reached.includes(f[1])) ? 'o' : '.'; }
    rows.push(row); }
  console.log('plan at y ' + mapY + ' (world x ' + box[0].toFixed(1) + '..' + box[1].toFixed(1) + ' across, z ' + box[2].toFixed(1) + '..' + box[3].toFixed(1) + ' down)');
  console.log(rows.join('\n'));
}
