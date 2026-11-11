/* ktest fixture: a negative written backwards: the faulty input passes the check */
const T = require('../../ktest.js')(__filename);
const pos = x => x > 0;
T.neg('backwards', pos, 1, -1);
T.done();
