// node settlements/strongbow/layout_dump.js: Strongbow's layout, its area and its checks as JSON on stdout (what strongbow_blueprint.py
// and test-strongbow-town.js read). The arcology's records are the kits/ancients target's, read in place.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
global.window = global;
['core/rand/08-core-rand.js', 'kits/ancients/targets/strongbow/8aw0-strongbow-plan.js', 'settlements/strongbow/src/20-sb-census.js',
 'settlements/strongbow/src/30-sb-layout.js', 'settlements/strongbow/src/31-sb-rules.js']
  .forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const SB_LAYOUT = sbLayout();
if (require.main === module) process.stdout.write(JSON.stringify({ layout: SB_LAYOUT, area: SB.area(SB_LAYOUT), checks: SB.checks(SB_LAYOUT) }));
module.exports = { L: SB_LAYOUT, SB };
