/* ktest fixture: every check passes, every site runs (tools/tests/test_ktest.py) */
const T = require('../../ktest.js')(__filename);
const pos = x => x > 0;
T.ok('one is positive', pos(1));
for (const x of [2, 3]) T.ok('loop ' + x, pos(x));
T.neg('the check fails a negative and passes a positive', pos, -1, 1);
T.done();
