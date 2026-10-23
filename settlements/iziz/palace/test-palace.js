#!/usr/bin/env node
/* The palace citadel's layout, headless (no THREE, no DOM): targets/palace/78p-palace-plan.js and 78q-palace-layout.js
   run in node, and the checks the page's furnishing relies on:
     - every storey of every building lays; every closed room has a door (or a portal) that reaches open floor;
     - every stair in the plan finds its next storey (no stair is left with no flights and no landing);
     - nothing but the expected clips is dropped (the slivers between the masses: the great door's and the Aula's guards);
     - the layout is deterministic (two runs give the same JSON).
     node settlements/iziz/palace/test-palace.js            # the checks and a census per storey
     node settlements/iziz/palace/test-palace.js --rooms    # every room, its size and its doors */
const fs = require('fs'), vm = require('vm'), path = require('path');
const T = path.join(__dirname, '..', 'targets', 'palace');
const src = ['78p-palace-plan.js', '78q-palace-layout.js'].map(f => fs.readFileSync(path.join(T, f), 'utf8')).join('\n;\n');
function run() { const g = {}; vm.createContext(g); vm.runInContext(src + '\n;this.IZPAL=IZPAL;', g); return g.IZPAL; }
const IZPAL = run(), L = IZPAL.layout(), L2 = run().layout();
const fails = [];
const strip = o => JSON.stringify(o, (k, v) => (k === 'mass' ? undefined : v));
if (strip(L) !== strip(L2)) fails.push('layout is not deterministic');
const EXPECT_DROP = /Great Door|Imperial Guard of the Aula/;
L.dropped.forEach(d => { if (!EXPECT_DROP.test(d.name)) fails.push('dropped ' + d.b + '/' + d.s + ' #' + d.n + ' ' + d.name + ': ' + d.why); });
let rooms = 0, doors = 0, area = 0, stairs = 0;
const showRooms = process.argv.includes('--rooms');
for (const B of L.buildings) {
  console.log('== ' + B.name + ' (' + B.id + ')');
  B.storeys.forEach((S, i) => {
    const sp = S.spaces.filter(s => !s.gone), closed = sp.filter(s => !s.open && !s.void), cor = sp.filter(s => s.kind === 'corridor');
    rooms += closed.length; doors += S.walls.reduce((n, w) => n + w.doors.length, 0) + S.outer.length + S.portals.length; stairs += S.stairs.length;
    area += sp.reduce((a, s) => a + (s.void ? 0 : s.area), 0);
    console.log('  ' + S.id.padEnd(3) + ' y ' + S.y.toFixed(2).padStart(6) + ' h ' + S.h.toFixed(2) + '  ' + String(closed.length).padStart(3) + ' rooms, '
      + cor.length + ' corridors (' + Math.round(cor.reduce((a, s) => a + s.area, 0)) + ' m2), ' + S.walls.filter(w => w.kind === 'wall').length + ' walls, '
      + S.walls.filter(w => w.kind === 'rail').length + ' rails, ' + S.stairs.length + ' flights' + (S.unreached.length ? '  UNREACHED ' + S.unreached.length : ''));
    S.unreached.forEach(id => fails.push('unreached ' + id + ' (' + S.spaces.find(s => s.id === id).name + ')'));
    S.portals.forEach(P => { if (P.sa < 0 || (!P.ext && P.sb < 0)) fails.push('portal ' + B.id + '/' + S.id + ' ' + P.name + ' has no space on a side'); });
    sp.filter(s => s.stair && !s.gone).forEach(s => {
      const hasUp = S.stairs.some(f => f.space === s.id), hasDown = !!s.from;
      if (!hasUp && !hasDown && !s.shaftTo) fails.push('stair ' + s.id + ' (' + s.name + ') has no flight up or down');
    });
    if (showRooms) sp.forEach(s => console.log('      ' + (s.open ? 'o' : s.void ? 'v' : ' ') + ' ' + String(s.n).padEnd(5) + s.name.slice(0, 44).padEnd(45)
      + s.kind.padEnd(15) + 'd' + s.decor + ' ' + String(Math.round(s.area)).padStart(5) + ' m2  doors ' + s.doors.length));
  });
}
console.log('rooms ' + rooms + ', doors ' + doors + ', flights ' + stairs + ', floor ' + Math.round(area) + ' m2, dropped ' + L.dropped.length + ' (' + L.dropped.map(d => d.name).join('; ') + ')');
console.log('windows drawn by the builder: ' + IZPAL.windows().length);
if (fails.length) { console.log('FAIL (' + fails.length + ')'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
console.log('PASS');
