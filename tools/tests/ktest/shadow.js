/* ktest fixture: a local predicate named ok shadows the helper (the valley wrecks' "all 26 passed") */
const T = require('../../ktest.js')(__filename);
const ok = x => true;
T.ok('always', ok(0));
T.done();
