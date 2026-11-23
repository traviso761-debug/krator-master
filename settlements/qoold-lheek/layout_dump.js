/* Dump Qoold Lheek's layout, rule checks, KCITY.covered winter network and area summary as JSON for qoold_blueprint.py */
'use strict';
const L = require('./src/30-ql-layout.js');
const Q = require('./src/31-ql-rules.js');
process.stdout.write(JSON.stringify({
  layout: L,
  checks: Q.checks(L),
  net: Q.coveredNet(L),
  area: Q.area(L)
}));
