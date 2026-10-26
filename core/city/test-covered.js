// node core/city/test-covered.js: KCITY.covered (36-city-covered.js), the covered ways between doors (kits/yeti PLAN.md
// section 3). Loads the file alone, as a build that takes only it does.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = { Math, console };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '36-city-covered.js'), 'utf8'), ctx);
const K = ctx.KCITY;
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };

/* every door and junction reachable from the root over the ways */
function connected(nodes, r) {
  const adj = {};
  for (const w of r.ways) { (adj[w.a] = adj[w.a] || []).push(w.b); (adj[w.b] = adj[w.b] || []).push(w.a); }
  const seen = new Set([nodes.slice().sort((a, b) => a.id < b.id ? -1 : 1)[0].id]), st = [...seen];
  while (st.length) { const n = st.pop(); for (const m of adj[n] || []) if (!seen.has(m)) { seen.add(m); st.push(m); } }
  return nodes.every(n => seen.has(n.id)) && r.junctions.filter(j => j.kind === 'junction').every(j => seen.has(j.id));
}

// four doors on a square, a fifth in the middle of one side: everything joined, the middle one by a junction
const sq = [{ id: 'a', x: 0, z: 0 }, { id: 'b', x: 30, z: 0 }, { id: 'c', x: 30, z: 30 }, { id: 'd', x: 0, z: 30 }, { id: 'e', x: 15, z: -10 }];
const r1 = K.covered(sq, { warmEvery: 0 });
ok(connected(sq, r1), 'five doors joined into one network');
ok(r1.ways.every(w => w.cls === 'covered' && w.section === 'full' && w.w === 1.7), 'ways are cls covered, section full, width 1.7');
ok(r1.junctions.length >= 1 && r1.junctions.every(j => j.kind === 'junction'), 'branches meet the network at junctions (' + r1.junctions.length + ')');
const deg = {}; for (const w of r1.ways) { deg[w.a] = (deg[w.a] || 0) + 1; deg[w.b] = (deg[w.b] || 0) + 1; }
ok(sq.every(n => deg[n.id] === 1), 'every door has exactly one way (its passage mouth)');

// determinism: the same records twice, and from the doors in another order
const r2 = K.covered(sq.slice().reverse(), { warmEvery: 0 });
ok(JSON.stringify(r1) === JSON.stringify(K.covered(sq, { warmEvery: 0 })) && JSON.stringify(r1) === JSON.stringify(r2), 'deterministic, whatever the input order');

// no branch joins within endGap of a door end
const r3 = K.covered([{ id: 'p', x: 0, z: 0 }, { id: 'q', x: 20, z: 0 }, { id: 'r', x: 1, z: 8 }], { warmEvery: 0, endGap: 3 });
const j3 = r3.junctions[0];
ok(j3 && Math.hypot(j3.x, j3.z) >= 3 - 1e-6, 'a branch near a door joins at least endGap along the way (' + (j3 ? j3.x.toFixed(2) : '-') + ')');

// warming domes on a long run
const r4 = K.covered([{ id: 'm', x: 0, z: 0 }, { id: 'n', x: 200, z: 0 }], { warmEvery: 80 });
ok(r4.junctions.filter(j => j.kind === 'warming').length === 2, 'a 200 m run carries two warming domes');

// a blocked straight run goes round by an L
const box = { x0: 8, x1: 12, z0: -2, z1: 8 };
const hit = (ax, az, bx, bz) => { for (let i = 0; i <= 40; i++) { const t = i / 40, x = ax + (bx - ax) * t, z = az + (bz - az) * t; if (x > box.x0 && x < box.x1 && z > box.z0 && z < box.z1) return true; } return false; };
const r5 = K.covered([{ id: 'u', x: 0, z: 0 }, { id: 'v', x: 20, z: 10 }], { warmEvery: 0, blocked: hit });
ok(r5.ways.length === 1 && r5.ways[0].pts.length === 3 && !r5.ways[0].blocked, 'a run through a building goes round it as an L');

// the section and width pass through
ok(K.covered(sq, { section: 'slab', w: 2 }).ways.every(w => w.section === 'slab' && w.w === 2), 'section and width are carried on every way');

console.log(fails ? fails + ' FAILED' : 'all covered-way tests pass');
process.exit(fails ? 1 : 0);
