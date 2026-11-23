// node settlements/flashing-eye/layout_dump.js: the Flashing Eye's layout, its area, its water and its checks as JSON on stdout
// (what flashing_blueprint.py draws from). The ground's profile along the axis comes with it, on a model surface like the spur
// (the section sheet's).
'use strict';
const L = require('./src/30-fe-layout.js'), F = require('./src/31-fe-rules.js');
const model = (u, v) => (u < 0 ? -30 - 0.084 * u : -30 - 0.196 * u) - 0.09 * Math.abs(v);
const profile = [];
for (let u = -2600; u <= 1400; u += 5) profile.push([u, +F.ground(L, u, 0, model(u, 0)).toFixed(2), +model(u, 0).toFixed(2)]);
process.stdout.write(JSON.stringify({ layout: L, area: F.area(L), water: F.water(L), checks: F.checks(L), profile }));
