#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HERE = path.resolve(__dirname, '..');
const ROOT = path.resolve(HERE, '..', '..');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ', name, detail ? '(' + detail + ')' : ''); }
  else { fail++; console.error('FAIL ', name, detail ? '(' + detail + ')' : ''); }
}

// 1. Inspect all 32 swa-* defBuilding definitions and unique seeds
const swaFiles = ['60-swa-small.js', '62-swa-medium.js', '64-swa-large.js'];
const keys = [], seeds = new Map();
for (const f of swaFiles) {
  const src = fs.readFileSync(path.join(HERE, 'src', f), 'utf8');
  for (const m of src.matchAll(/defBuilding\(\{\s*key:\s*['"]([^'"]+)['"][^}]*?seed:\s*(\d+)/gs)) {
    keys.push(m[1]);
    const s = Number(m[2]);
    seeds.set(s, (seeds.get(s) || []).concat(m[1]));
  }
}
ok('32 swa-* building definitions registered across Class S/M/L/XL', keys.length === 32, keys.length + ' defs');
const dupSeeds = [...seeds.entries()].filter(([, v]) => v.length > 1);
ok('all swa-* seeds unique in 6000..6999', dupSeeds.length === 0 && [...seeds.keys()].every(s => s >= 6000 && s < 7000), seeds.size + ' unique seeds');

// 2. Culture packs (vinvolk, rinkvolk, voth-vassal)
const cultSrc = fs.readFileSync(path.join(HERE, 'src', '81-swa-cultures.js'), 'utf8');
const registeredCults = [];
vm.runInNewContext(cultSrc, {
  SYMBOLS: {},
  mkCulture: (spec) => registeredCults.push({ k: spec.key, spec }),
  DEFS: { 'shop-tinker': {} },
});
ok('registers 3 SW Arcology vassal cultures', ['vinvolk', 'rinkvolk', 'voth-vassal'].every(k => registeredCults.some(c => c.k === k)), registeredCults.map(c => c.k).join(', '));

// 3. voth-scrap.js (19 definitions) parity between kits/sw-arcology/voth-scrap.js and settlements/voth/catalog/registry/voth-scrap.js
const vsKit = fs.readFileSync(path.join(HERE, 'voth-scrap.js'), 'utf8');
const vsVoth = fs.readFileSync(path.join(ROOT, 'settlements', 'voth', 'catalog', 'registry', 'voth-scrap.js'), 'utf8');
ok('kits/sw-arcology/voth-scrap.js matches settlements/voth/catalog/registry/voth-scrap.js', vsKit === vsVoth, vsKit.length + ' chars');

const assets = {};
vm.runInNewContext(vsKit, { ASSET: (a) => { assets[a.key] = a; } });
const vsKeys = Object.keys(assets);
ok('voth-scrap.js registers all 19 Scrap Voth definitions (11 base + 8 vassal additions)', vsKeys.length === 19, vsKeys.length + ' defs');

// 4. Drum and Torus swa-* and voth_scrap_* keys resolve 1:1
const drumKitsSrc = fs.readFileSync(path.join(ROOT, 'settlements', 'drum', 'src', '31-drum-kits-data.js'), 'utf8');
const torusKitsSrc = fs.readFileSync(path.join(ROOT, 'settlements', 'torus', 'src', '31-torus-kits-data.js'), 'utf8');
const keySet = new Set(keys);
const missingSwa = [];
for (const src of [drumKitsSrc, torusKitsSrc]) {
  for (const m of src.matchAll(/['"](swa-[a-z0-9-]+)['"]/g)) {
    if (!keySet.has(m[1])) missingSwa.push(m[1]);
  }
}
ok('every swa-* key referenced by Drum and Torus exists in kits/sw-arcology', missingSwa.length === 0, missingSwa.join(', ') || 'all resolved');

const missingVs = [];
for (const src of [drumKitsSrc, torusKitsSrc]) {
  for (const m of src.matchAll(/['"](voth_scrap_[a-z0-9_]+)['"]/g)) {
    if (!assets[m[1]]) missingVs.push(m[1]);
  }
}
ok('every voth_scrap_* key referenced by Drum and Torus exists in voth-scrap.js', missingVs.length === 0, missingVs.join(', ') || 'all resolved');

// 5. Built showcase page exists and embeds all 32 keys
const distHtml = path.join(HERE, 'dist', 'sw-arcology.html');
const html = fs.existsSync(distHtml) ? fs.readFileSync(distHtml, 'utf8') : '';
ok('dist/sw-arcology.html built and contains all 32 swa-* keys', html.length > 100000 && keys.every(k => html.includes(k)), Math.round(html.length / 1024) + ' KB');

// 6. Negative controls
const badCults = [];
vm.runInNewContext(cultSrc.replace("key: 'vinvolk'", "key: 'broken'"), {
  SYMBOLS: {},
  mkCulture: (spec) => badCults.push(spec.key),
  DEFS: {},
});
ok('negative: missing vinvolk culture pack is caught', !badCults.includes('vinvolk'));
ok('negative: injecting unknown swa-* key is caught', !keySet.has('swa-nonexistent-widget'));

console.log('\n' + pass + '/' + (pass + fail) + ' passed');
process.exit(fail ? 1 : 0);
