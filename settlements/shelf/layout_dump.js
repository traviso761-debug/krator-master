// node settlements/shelf/layout_dump.js: Shelf's layout, its area, census and checks as JSON on stdout (what shelf_blueprint.py draws from).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
global.window = global;
['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'kits/ancients/cliff/10-cliff-stack.js', 'settlements/shelf/src/30-shelf-layout.js', 'settlements/shelf/src/31-shelf-rules.js']
  .forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const L = SHELF_LAYOUT;
const boxes = L.decks.map(d => Object.assign({ id: d.id }, SHELF.deckBox(L, d), { floorM2: SHELF.deckFloor(L, d) }));
const prof = {}; for (let z = -1500; z < 9000; z += 4) prof[z] = SHELF.groundAt(L, 0, z);
process.stdout.write(JSON.stringify({ layout: L, boxes, area: SHELF.area(L), census: SHELF.census(L), line: SHELF.lineLength(L), checks: SHELF.checks(L), profile: prof }));
