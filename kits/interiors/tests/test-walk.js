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
/* climbs: core/walk's reach (0.45 m steps on 0.4 m cells, the reachability audit's) gets from each stair's or ladder's foot to the floor
   at its top: a ladder is rung floors, not a strip too steep to step up (2026-11-03) */
{ let climbs = 0, ladders = 0, miss = [];
  for (const S of IX.sets.list) for (const it of S.items) {
    if (it.skip) continue;
    let inst; try { inst = IX.sets.instantiate(it, 4, -3, 0.4, { baseY: 0, register: false }); } catch (e) { continue; }
    const W = KWALK.create(); IX.walk.register(inst, W, { ground: 0 });
    for (const B of inst.buildings) for (const St of B.stairs || []) {
      const f = B.graph.nodes.find(n => n.tag === 'stairfoot' && n.ref === St.id), tp = B.graph.nodes.find(n => n.tag === 'stairtop' && n.ref === St.id); if (!f || !tp) continue;
      climbs++; if (St.kind === 'ladder') ladders++;
      const up = (B.floors || []).filter(F => F.level === St.to).map(F => B.id + '.floor.' + F.level);
      const R = W.reach([[f.x, f.y, f.z]], { ground: () => 0 }), got = R.reached.some(F => up.some(u => (F.name || '').indexOf(u) === 0));
      if (!got) miss.push(S.set + '/' + it.key + ' ' + St.id + ' (' + St.kind + ')');
    }
  }
  if (miss.length) bad('climbs: ' + miss.length + ' of ' + climbs + ' stairs and ladders do not reach the floor at their top: ' + miss.slice(0, 6).join(', '));
  console.log('climbs: ' + climbs + ' stairs and ladders (' + ladders + ' ladders), ' + (climbs - miss.length) + ' reach the floor at their top');
}
/* IX.walk.room (50-shell.js, no THREE; read here from src/): two ROOM() shells side by side, a door between them and a street door into the first; with core/door's
   KDOOR blocking the inner doorway, the second room is reached from the street only once that door is open (the negative:
   shut, it is not), and the first is reached either way */
{
  const kdSrc = fs.readFileSync(path.resolve(__dirname, '../../../core/door/10-core-door.js'), 'utf8');
  if (!IX.walk.room) (0, eval)(fs.readFileSync(path.resolve(__dirname, '../src/50-shell.js'), 'utf8').replace(/\}\)\(KratorInteriors\);\s*$/, '})(global.KratorInteriors);'));
  const KDOOR = new Function('var root={};' + kdSrc.replace("typeof window!=='undefined'?window:globalThis", 'root') + ';return root.KDOOR;')().create();
  const A = IX.normRoom({ id: 'wt.a', poly: [[0, 0], [5, 0], [5, 4], [0, 4]], y: 0, h: 3, doors: [{ at: [2.5, 0], w: 1, to: 'street' }, { at: [5, 2], w: 1, to: 'wt.b' }] });
  const B = IX.normRoom({ id: 'wt.b', poly: [[5.22, 0], [9, 0], [9, 4], [5.22, 4]], y: 0, h: 3, doors: [{ at: [5.22, 2], w: 1, to: 'wt.a', leaf: false }] });
  const W = KWALK.create(), r = IX.walk.room([A, B], W);
  const d = A.doors[1], yaw = Math.atan2(-d.n[0], -d.n[1]);
  const D = KDOOR.add({ id: 'wt.a.d1', at: [d.at[0] - d.n[0] * 0.11, 0, d.at[1] - d.n[1] * 0.11], yaw, w: d.w - 0.04, h: 2.1, t: 0.05 });
  KDOOR.walk(W);
  const start = [[2.5, 0, -1.5]], go = () => { const R = W.reach(start, { ground: () => 0, box: [-3, 12, -4, 7] }), n = R.reached.map(F => F.name); return { a: n.includes('wt.a'), b: n.includes('wt.b') }; };
  const shut = go(); KDOOR.open(D); for (let i = 0; i < 40; i++) KDOOR.step(0.1); const open = go();
  if (!(r.floors === 2 && r.doors === 3 && r.blocks > 20)) bad('IX.walk.room: ' + JSON.stringify(r));
  if (!shut.a || shut.b) bad('IX.walk.room: door shut, reached ' + JSON.stringify(shut) + ' (want a only)');
  if (!open.a || !open.b) bad('IX.walk.room: door open, reached ' + JSON.stringify(open) + ' (want both)');
  console.log('IX.walk.room: ' + r.floors + ' floors, ' + r.blocks + ' wall blocks, ' + r.doors + ' doorways; shut ' + JSON.stringify(shut) + ', open ' + JSON.stringify(open));
}
console.log('elevated bodies (no flight: tower, ledge or crown; the host routes to them): ' + elevated.length + (process.argv[3] === '-v' ? ' ' + elevated.join(', ') : ''));
console.log('items ' + items + ', raised ' + raised + ', entry flights ' + entries + ', failures ' + fails);
process.exit(fails ? 1 : 0);
