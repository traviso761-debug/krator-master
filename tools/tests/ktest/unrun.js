/* ktest fixture: a site that never runs (a branch the data never reaches) */
const T = require('../../ktest.js')(__filename);
T.ok('runs', true);
if (process.env.KTEST_NEVER === 'yes') T.ok('never runs', true);
T.done();
