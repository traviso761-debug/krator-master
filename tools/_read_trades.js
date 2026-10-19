// reads a build's *_TRADES array literal (tools/check_trades.py): prints {name, rows} as JSON
const s = require('fs').readFileSync(process.argv[3], 'utf8');
const m = /const\s+(\w*_TRADES)\s*=\s*\[/.exec(s);
if (!m) { console.error('no table'); process.exit(2); }
let i = m.index + m[0].length - 1, depth = 0, q = null, end = -1;
for (let j = i; j < s.length; j++) {
  const c = s[j];
  if (q) { if (c === '\\') j++; else if (c === q) q = null; continue; }
  if (c === "'" || c === '"' || c === '`') q = c;
  else if (c === '/' && s[j + 1] === '/') { while (j < s.length && s[j] !== '\n') j++; }
  else if (c === '/' && s[j + 1] === '*') { j = s.indexOf('*/', j) + 1; }
  else if (c === '[') depth++;
  else if (c === ']') { if (--depth === 0) { end = j; break; } }
}
console.log(JSON.stringify({ name: m[1], rows: (0, eval)(s.slice(i, end + 1)), span: [m.index, end + 1] }));
