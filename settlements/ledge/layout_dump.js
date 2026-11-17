// node settlements/ledge/layout_dump.js: Ledge's layout, its area, census and checks as JSON on stdout (what ledge_blueprint.py draws from).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
global.window = global;
['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'settlements/ledge/src/30-ledge-layout.js', 'settlements/ledge/src/31-ledge-rules.js']
  .forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const L = LEDGE_LAYOUT;
const boxes = L.decks.map(d => Object.assign({ id: d.id }, LEDGE.deckBox(L, d), { floorM2: LEDGE.deckFloor(L, d) }));
// the ground on a coarse grid (the sheets' site plan and section)
const grid = []; for (let z = -1500; z <= 1500; z += 25) { const row = []; for (let x = -1500; x <= 1500; x += 25) row.push(Math.round(LEDGE.groundAt(L, x, z) * 10) / 10); grid.push(row); }
process.stdout.write(JSON.stringify({ layout: L, boxes, area: LEDGE.area(L), census: LEDGE.census(L), line: LEDGE.lineLength(L),
  checks: LEDGE.checks(L), ground: { x0: -1500, z0: -1500, step: 25, h: grid } }));
