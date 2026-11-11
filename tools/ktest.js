/* tools/ktest.js: the node test helper (CORE-IMPROVEMENTS.md item 29; the 2026-11-11 survey). Three sessions wrote a
   negative backwards, and a local `ok` predicate shadowed the harness's `ok` while a test kept printing "all 26 passed"
   checking nothing. So this helper:
     - refuses to start when the test file declares its own `ok` (a const, let, var, function or parameter named ok);
     - T.neg(name, check, faulty, fixed): a negative is a pair. The check must FAIL on the faulty input and PASS on the
       fixed one: a negative that passes on the fault is written backwards, one that fails the fix measures nothing;
     - T.done() prints the pass count against the ok( and neg( call sites in the file, and fails when one never ran.

   const T = require('../../tools/ktest.js')(__filename);     // the path from the test to tools/
   T.ok('the ramp reads its own height', Math.abs(h - 3) < 1e-9, 'got ' + h);
   T.neg('a camera under the drawn ground is caught', cam => underDrawn(cam), {y: -2}, {y: 2});
   T.done();                                                   // exit code 1 on any failure or a site that never ran

   ok(name, pass, detail) and neg(name, check, faulty, fixed) return whether they passed; check may throw (a fail).
   T.skip(line) marks a site that may legitimately not run (a branch for another platform), by its line number. */
'use strict';
const fs = require('fs');

function code(src) {   /* the text with comments and string bodies blanked, lines kept */
  return src.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|`(?:\\[\s\S]|[^`\\])*`|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/g,
    m => m.replace(/[^\n]/g, ' '));
}

function lineOf(text, i) { let n = 1; for (let k = 0; k < i; k++) if (text.charCodeAt(k) === 10) n++; return n; }

const SHADOW = [/\b(?:const|let|var)\s+ok\b/g, /\bfunction\s+ok\s*\(/g, /\bok\s*=>/g,
  /\(\s*(?:[\w$]+\s*,\s*)*ok\s*(?:,\s*[\w$]+\s*)*\)\s*=>/g, /\bfunction\s*[\w$]*\s*\(\s*(?:[\w$]+\s*,\s*)*ok\s*[,)]/g];
const SITE = /(?<![\w$])(ok|neg)\s*\(/g;

function shadows(src) {   /* line numbers where the file declares its own ok */
  const c = code(src), out = [];
  for (const re of SHADOW) { re.lastIndex = 0; let m; while ((m = re.exec(c))) out.push(lineOf(c, m.index)); }
  return [...new Set(out)].sort((a, b) => a - b);
}

function sites(src) {   /* line numbers of the ok( and neg( call sites */
  const c = code(src), out = new Set(); let m; SITE.lastIndex = 0;
  while ((m = SITE.exec(c))) {
    const before = c.slice(Math.max(0, m.index - 12), m.index);
    if (/function\s*$/.test(before)) continue;
    out.add(lineOf(c, m.index));
  }
  return out;
}

module.exports = function ktest(file, opt) {
  opt = opt || {};
  const src = fs.readFileSync(file, 'utf8'), base = require('path').basename(file);
  const sh = shadows(src);
  if (sh.length) {
    console.log('FAIL  ktest: ' + base + ' declares its own `ok` (line ' + sh.join(', ') + '): it shadows the helper and checks nothing; rename it');
    process.exitCode = 1;
    if (!opt.noExit) process.exit(1);
  }
  const want = sites(src), ran = new Set(), skipped = new Set();
  let pass = 0, fail = 0;
  const caller = () => {
    const st = (new Error().stack || '').split('\n');
    for (const ln of st.slice(3)) { const m = ln.match(/:(\d+):\d+\)?$/); if (m && ln.indexOf(base) >= 0) return +m[1]; }
    return null;
  };
  const T = {
    ok(name, passed, detail) {
      const l = caller(); if (l) ran.add(l);
      passed = !!passed; passed ? pass++ : fail++;
      console.log((passed ? 'PASS  ' : 'FAIL  ') + name + (!passed && detail != null ? '  (' + detail + ')' : ''));
      return passed;
    },
    neg(name, check, faulty, fixed) {
      const l = caller(); if (l) ran.add(l);
      const run = x => { try { return !!check(x); } catch (e) { return false; } };
      const onFault = run(faulty), onFix = run(fixed);
      const passed = !onFault && onFix;
      passed ? pass++ : fail++;
      console.log((passed ? 'PASS  ' : 'FAIL  ') + name + (passed ? ' (fails the fault, passes the fix)'
        : onFault ? '  (written backwards: the check PASSES on the faulty input)'
          : '  (the check fails the fixed input too: it measures nothing)'));
      return passed;
    },
    skip(line) { skipped.add(line); },
    get counts() { return {pass, fail, sites: want.size, ran: ran.size}; },
    done() {
      const missed = [...want].filter(l => !ran.has(l) && !skipped.has(l)).sort((a, b) => a - b);
      const bad = fail > 0 || missed.length > 0 || sh.length > 0;
      console.log('ktest: ' + base + ': ' + pass + ' passed, ' + fail + ' failed; ' + want.size + ' ok(/neg( call sites in the file, ' +
        (missed.length ? missed.length + ' never ran (line ' + missed.join(', ') + ')' : 'every one ran'));
      if (bad) process.exitCode = 1;
      return !bad;
    }
  };
  return T;
};
module.exports.shadows = shadows;
module.exports.sites = sites;
