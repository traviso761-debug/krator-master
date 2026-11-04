// The catalog's names resolved for node tools (core/catalog/README.md): the same lookup as catalog.py, from files.json.
//   const at = require('<root>/core/catalog/catalog-files.js');  at('krator-furniture-core.js') -> its absolute path
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const F = JSON.parse(fs.readFileSync(path.join(__dirname, 'files.json'), 'utf8'));
const ENGINE = new Set(F.engine);
module.exports = f => f === 'krator-symbols.js' ? path.join(ROOT, ...F.symbols.split('/'))
  : ENGINE.has(f) ? path.join(__dirname, f) : path.join(ROOT, 'kits', 'catalog', f);
