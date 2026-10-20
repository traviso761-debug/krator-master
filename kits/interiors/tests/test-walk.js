/* kits/interiors/tests/test-walk.js: IX.walk.register (src/49b-walk.js) on every interior set's items, into a real core/walk.
   For each item: its floors and stairs register; a walker can STEP from the ground outside a street door onto the
   ground floor (a raised base gets an entry flight); every upper storey is reached by its stair (the top is within a
   step of a registered floor); and a negative: the same check fails when the entry flights are left out.
     node tests/test-walk.js dist/interiors-core.js        (run from kits/interiors; reads sets/*.js and core/walk)   */
'use strict';
const fs = require('fs'), path = require('path');
const IX = global.KratorInteriors = require(path.resolve(process.argv[2] || path.join(__dirname, '..', 'dist', 'interiors-core.js')));
const walkSrc = fs.readFileSync(path.resolve(__dirname, '../../../core/walk/20-core-walk.js'), 'utf8');
const KWALK = new Function('var root={};' + walkSrc + ';return root.KWALK||(typeof KWALK!=="undefined"?KWALK:null);')();
const setsDir = path.resolve(__dirname, '../sets');
for (const f of fs.readdirSync(setsDir).filter(f => f.endsWith('.js'))) (0, eval)(fs.readFileSync(path.join(setsDir, f), 'utf8'));
let elevated = [], fails = 0, items = 0, entries = 0, raised = 0;
const bad = (m) => { fails++; if (fails < 25) console.log('FAIL', m); };
function stands(W, x, z, y) { const f = W.floorBelow(x, z, y, 0.6); return f && Math.abs(f[0] - y) < 0.65 ? f : null; }
function check(inst, withEntry) {
  const W = KWALK.create(), r = IX.walk.register(inst, W, { ground: inst.baseY || 0, step: withEntry ? 0.5 : 1e9 });
  const probs = [];
  for (const B of inst.buildings) {
    const f0 = B.floors.find(F => F.level === 0), sd = (B.doors || []).find(d => d.kind === 'street'); if (!f0 || !sd) continue;
    if (r.elevated.includes(B.id)) continue;                     /* entered from a neighbouring body or by the host: no flight drawn */
    const rise = f0.y - (inst.baseY || 0);
    if (rise > 0.5 && rise <= 3.5) {
      const n = IX.walk.outward(B.poly || f0.poly, sd.at), len = Math.max(0.9, rise * 1.4) * 0.9;
      if (!stands(W, sd.at[0] + n[0] * len, sd.at[1] + n[1] * len, inst.baseY || 0)) probs.push(B.id + ': no ground at the foot of the entry');
      /* walking up: samples along the door axis climb with no step over 0.6 */
      let prev = inst.baseY || 0;
      for (let t = len; t >= -0.5; t -= 0.1) { const y = prev + 0.6, f = W.floorBelow(sd.at[0] + n[0] * t, sd.at[1] + n[1] * t, y, 0); const fy = f ? f[0] : null;
        if (fy == null || fy < prev - 0.65 || fy > prev + 0.6) { if (t > -0.2) probs.push(B.id + ': entry broken at ' + t.toFixed(1)); break; } prev = fy; }
    }
    for (const S of B.stairs || []) {
      const tp = B.graph.nodes.find(n => n.tag === 'stairtop' && n.ref === S.id);
      if (tp && !stands(W, tp.x, tp.z, tp.y)) probs.push(S.id + ': top lands on no floor');
    }
  }
  for (const s of W.export().floors.filter(f => f.kind === 'strip' && /\.entry$/.test(f.name || ''))) {
    const a = s.a, b = s.b, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    /* walked like the host's walker: feet on the floor under it, nothing solid in the way (core/walk blocked: r .3, h 1.7) */
    for (let t = 0; t <= L - 0.3; t += 0.1) {      /* up to the doorway; the room's own partitions are the planner's */
      const u = Math.min(1, t / L), x = a[0] + (b[0] - a[0]) * u, z = a[1] + (b[1] - a[1]) * u, f = W.floorBelow(x, z, a[2] + (b[2] - a[2]) * u, 0.6), y = f ? f[0] : a[2];
      const bl = W.blocked(x, y, z, 0.3, 1.7); if (bl) { probs.push(s.name + ': a wall stands in the flight at ' + t.toFixed(1) + ' m'); break; }
    }
  }
  return { r, probs };
}
for (const S of IX.sets.list) for (const it of S.items) {
  if (it.skip) continue; items++;
  let inst; try { inst = IX.sets.instantiate(it, 12, -7, 0.7, { baseY: 3, register: false }); } catch (e) { bad(S.set + '/' + it.key + ' instantiate: ' + e.message); continue; }
  const a = check(inst, true);
  if (!a.r.floors) bad(S.set + '/' + it.key + ': registered no floor');
  a.probs.forEach(p => bad(S.set + '/' + it.key + ' ' + p));
  entries += a.r.entries; a.r.elevated.forEach(e => elevated.push(e));
  if (inst.buildings.some(B => { const r = (B.floors.find(F => F.level === 0) || { y: 3 }).y - 3; return r > 0.5 && r <= 3.5 && (B.doors || []).some(d => d.kind === 'street'); })) {
    raised++;
    if (!check(inst, false).probs.length && inst.buildings.some(B => (B.doors || []).some(d => d.kind === 'street'))) bad(S.set + '/' + it.key + ': negative: without entry flights the raised base still passes');
  }
}
/* doorBlocks: every door opening is filled (shut) and handed to onBlock; setBlock(recs,false) opens exactly that doorway */
{ let doors = 0, shut = 0, openOk = 0, bad2 = 0;
  for (const S of IX.sets.list) for (const it of S.items) {
    if (it.skip) continue;
    let inst; try { inst = IX.sets.instantiate(it, 4, -3, 0.4, { baseY: 0, register: false }); } catch (e) { continue; }
    const W = KWALK.create(), got = [];
    IX.walk.register(inst, W, { ground: 0, doorBlocks: true, onBlock: (recs, info) => got.push([recs, info]) });
    for (const [recs, info] of got) {
      doors++;
      if (!info.door || !recs.length || !recs.every(r => r.box)) { bad2++; continue; }
      const mid = recs[Math.floor(recs.length / 2)].box, cx = (mid[0] + mid[1]) / 2, cz = (mid[2] + mid[3]) / 2, y = mid[4] + 0.01;
      if (W.blocked(cx, y, cz, 0.3, 1.7)) shut++; else bad2++;
      W.setBlock(recs, false); if (!recs.some(r => W.blocked(cx, y, cz, 0.3, 1.7) === r)) openOk++; W.setBlock(recs, true);
    }
  }
  if (!doors || shut !== doors || openOk !== doors || bad2) bad('doorBlocks: ' + doors + ' doors, ' + shut + ' shut, ' + openOk + ' opened, ' + bad2 + ' wrong');
  console.log('doorBlocks: ' + doors + ' doors, all shut by default and opened by setBlock');
}
console.log('elevated bodies (no flight: tower, ledge or crown; the host routes to them): ' + elevated.length + (process.argv[3] === '-v' ? ' ' + elevated.join(', ') : ''));
console.log('items ' + items + ', raised ' + raised + ', entry flights ' + entries + ', failures ' + fails);
process.exit(fails ? 1 : 0);
