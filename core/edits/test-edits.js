// node core/edits/test-edits.js: the edit log's contract (core/edits/40-core-edits.js), each check with a negative.
const K = require('./40-core-edits.js');
let fail = 0; const ok = (c, name, d) => { console.log((c ? '  ok   ' : '  FAIL ') + name + (d ? '  (' + d + ')' : '')); if (!c) fail++; };
const clone = o => JSON.parse(JSON.stringify(o));
// a toy world: records with class, key, at, ry, uid
function world(recs) {
  const W = { recs: clone(recs), n: 100 };
  W.find = (t, tol) => K.match(t, W.recs.filter(r => !r.gone), tol);
  W.add = (rec) => { const r = clone(rec); if (r.uid == null) r.uid = 'u' + (W.n++); W.recs.push(r); return r; };
  W.move = (h, at, ry) => { h.at = at.slice(); if (ry != null) h.ry = ry; };
  W.set = (h, path, v, op) => { const p = path.split('.'); let o = h; while (p.length > 1) { const k = p.shift(); o = o[k] = o[k] || {}; } if (op && op.unset) delete o[p[0]]; else o[p[0]] = v; };
  W.remove = (h) => { h.gone = true; };
  W.live = () => W.recs.filter(r => !r.gone).map(r => ({ c: r['class'], k: r.key, at: r.at, ry: r.ry, s: r.size })).sort((a, b) => JSON.stringify(a) < JSON.stringify(b) ? -1 : 1);
  return W;
}
const base = [
  { uid: 'a1', 'class': 'building', key: 'house', at: [0, 0, 0], ry: 0 },
  { uid: 'a2', 'class': 'building', key: 'tower', at: [10, 0, 0], ry: 0 },
  { uid: 'a3', 'class': 'flora', key: 'palm', at: [0.5, 0, 0.5], ry: 0 },
];

// 1. targets: by uid first, by class + key + position within the tolerance, else skipped
{ const L = K.log('t'); K.remove(L, { uid: 'a2', 'class': 'building', at: [999, 0, 999] }, null);
  const W = world(base), r = K.apply(L, W);
  ok(r.applied === 1 && W.recs.find(x => x.uid === 'a2').gone, 'a uid finds its record wherever `at` says');
  const L2 = K.log('t'); K.remove(L2, { 'class': 'building', at: [0.9, 0, 0.9] }, null);
  const W2 = world(base), r2 = K.apply(L2, W2);
  ok(r2.applied === 1 && W2.recs.find(x => x.uid === 'a1').gone && !W2.recs.find(x => x.uid === 'a3').gone, 'by position: the nearest of its class within 1.5 m (not the palm nearer to it)');
  const L3 = K.log('t'); K.remove(L3, { 'class': 'building', at: [4, 0, 4] }, null);
  const W3 = world(base), r3 = K.apply(L3, W3);
  ok(r3.applied === 0 && r3.skipped.length === 1 && r3.skipped[0].reason === 'target not found', '  negative: nothing within 1.5 m is skipped, not applied to the nearest anyway');
  const L4 = K.log('t'); K.remove(L4, { 'class': 'building', key: 'tower', at: [0, 0, 0] }, null);
  ok(K.apply(L4, world(base)).applied === 0, '  negative: a key that differs does not match');
}
// 2. every op and its inverse leave the world as it was
{ const L = K.log('t');
  K.add(L, { 'class': 'building', key: 'shed', at: [20, 0, 5], ry: 1 });
  K.move(L, { uid: 'a2', 'class': 'building', key: 'tower', at: [10, 0, 0] }, [12, 0, 3], 0.5, { at: [10, 0, 0], ry: 0 });
  K.set(L, { uid: 'a1', 'class': 'building', at: [0, 0, 0] }, 'size', [4, 4, 3], undefined);
  K.remove(L, { uid: 'a3', 'class': 'flora', key: 'palm', at: [0.5, 0, 0.5] }, base[2]);
  const W = world(base), before = JSON.stringify(W.live());
  ok(K.apply(L, W).applied === 4 && JSON.stringify(W.live()) !== before, 'four ops apply and change the world');
  const U = K.log('t'); L.ops.slice().reverse().forEach(o => { const inv = K.inverse(o); inv.id = 'u'; U.ops.push(inv); });
  const ur = K.apply(U, W);
  ok(ur.applied === 4 && JSON.stringify(W.live()) === before, 'their inverses, in reverse order, restore it', ur.skipped.map(s => s.reason).join(','));
  let threw = false; try { K.inverse({ op: 'MOVE', target: { 'class': 'building', at: [0, 0, 0] }, at: [1, 0, 1] }); } catch (e) { threw = true; }
  ok(threw, '  negative: a MOVE recorded without `from` refuses to invert');
  threw = false; try { K.inverse({ op: 'REMOVE', target: { 'class': 'building', at: [0, 0, 0] } }); } catch (e) { threw = true; }
  ok(threw, '  negative: a REMOVE recorded without its record refuses to invert');
}
// 3. ids and causes; malformed ops are refused
{ const L = K.log('t'); K.add(L, { 'class': 'flora', key: 'fern', at: [1, 0, 1] }, { cause: 'owner' }); K.remove(L, { 'class': 'flora', at: [1, 0, 1] }, null, { cause: 'sim:fire', thread: 'open' });
  ok(L.ops.map(o => o.id).join() === 'e1,e2' && L.ops[0].cause === 'owner' && L.ops[1].thread === 'open', 'ids in recording order, cause and thread kept');
  let threw = false; try { K.remove(K.log(), { 'class': 'flora' }); } catch (e) { threw = true; }
  ok(threw, '  negative: a target with neither uid nor position is refused');
  const r = K.apply({ ops: [{ id: 'x', op: 'BURN', target: { 'class': 'flora', at: [0, 0, 0] } }] }, world(base));
  ok(r.applied === 0 && r.skipped[0].reason === 'unknown op', '  negative: an unknown op is skipped');
}
// 4. Streetlab's file, read as a log
{ const E = { site: 'voth', kind: 'city-edits', buildings: [{ key: 'house', v: 2, x: 50, z: 60, ry: 1.5 }],
    streets: [{ cls: 'side', pts: [[0, 0], [10, 0], [20, 5]] }, { cls: 'side', pts: [[1, 1]] }], del: [{ x: 0.4, z: -0.3 }, { x: 300, z: 300 }],
    flora: [{ key: 'palm', x: 3, z: 4 }, { key: 'palm', x: 0.5, z: 0.5, del: true }] };
  const L = K.fromStreetlab(E);
  const kinds = L.ops.map(o => o.op + ':' + o.target['class']).join();
  ok(L.build === 'voth' && kinds === 'ADD:infrastructure,ADD:building,REMOVE:building,REMOVE:building,ADD:flora,REMOVE:flora',
     'streets, buildings, deletions and flora become ops, a one-point street dropped', kinds);
  const W = world(base), r = K.apply(L, W);
  ok(r.applied === 5 && r.skipped.length === 1 && W.recs.find(x => x.uid === 'a1').gone && W.recs.find(x => x.uid === 'a3').gone,
     'applied: the deletion near a house removes it, the one at (300, 300) is skipped');
  ok(L.ops.every(o => o.cause === 'import:streetlab'), 'every imported op says where it came from');
  ok(K.fromStreetlab(null, 'x').ops.length === 0, '  negative: no file gives an empty log, not an error');
  /* the city plan's own flora shape (59-vc-flora-edit.js): {del, add}, the kind and a tree's height kept */
  const V = K.fromStreetlab({ site: 'voth', flora: { del: [{ kind: 'tree', key: 'cherry', x: 1, z: 2 }], add: [{ kind: 'plant', key: 'fern', x: 3, y: 1.5, z: 4 }, { kind: 'tree', key: 'dragon', x: 5, y: 0, z: 6, H: 8 }] } });
  ok(V.ops.map(o => o.op + ':' + o.target.key).join() === 'REMOVE:cherry,ADD:fern,ADD:dragon' && V.ops[1].rec.kind === 'plant' && V.ops[1].rec.at[1] === 1.5 && V.ops[2].rec.H === 8,
     'the city plan\'s {del, add} flora: deletions first, the kind, the height on the floor and H kept', V.ops.map(o => o.op + ':' + o.target.key).join());
  ok(K.fromStreetlab({ flora: { del: [], add: [] } }).ops.length === 0, '  negative: an empty {del, add} gives no ops');
}
// 5. a stable form for diffs and hashes
{ const a = K.log('t'); K.add(a, { 'class': 'building', key: 'k', at: [1, 0, 2], tags: { b: 1, a: 2 } });
  const b = K.log('t'); K.add(b, { at: [1, 0, 2], tags: { a: 2, b: 1 }, key: 'k', 'class': 'building' });
  ok(JSON.stringify(K.stable(a)) === JSON.stringify(K.stable(b)), 'the same edits in any key order give the same stable JSON');
  const c = K.log('t'); K.add(c, { 'class': 'building', key: 'k', at: [1, 0, 2.01] });
  ok(JSON.stringify(K.stable(a)) !== JSON.stringify(K.stable(c)), '  negative: a different position gives different JSON');
}
console.log(fail ? fail + ' FAILED' : 'all passed'); process.exit(fail ? 1 : 0);
