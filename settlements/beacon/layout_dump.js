// node settlements/beacon/layout_dump.js: the beacon house's layout, its area and its checks as JSON on stdout (what
// beacon_blueprint.py draws from).
'use strict';
const L = require('./src/30-bc-layout.js'), B = require('./src/31-bc-rules.js');
process.stdout.write(JSON.stringify({ layout: L, area: B.area(L), checks: B.checks(L) }));
