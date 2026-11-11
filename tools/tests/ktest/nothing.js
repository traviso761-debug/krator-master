/* ktest fixture: a check that measures nothing fails the fixed input too */
const T = require('../../ktest.js')(__filename);
const never = x => false;
T.neg('measures nothing', never, -1, 1);
T.done();
