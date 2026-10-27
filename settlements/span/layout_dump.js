// node settlements/span/layout_dump.js: Span's layout and its area as JSON on stdout (what span_blueprint.py draws from).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
global.window = global;
['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'settlements/span/src/30-span-layout.js', 'settlements/span/src/31-span-rules.js']
  .forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
process.stdout.write(JSON.stringify({ layout: SPAN_LAYOUT, area: SPAN.area(SPAN_LAYOUT), checks: SPAN.checks(SPAN_LAYOUT) }));
