// node core/materials/record/test-masonry-packs.js: the kits that took GRAPHICS-TERRAIN-PROPOSAL.md M2-M4 (KIT-REBUILD-SURVEY.md's
// masonry and smooth families) carry what their materials.json asks for. For every build with a materials.json, each family
// flagged "m4" has its cavity/wear map written and on disk, "pom" its parallax depth and its height in the colour map's alpha,
// "specAA" its mip variance table (tools/textures/pack.py; a flag added without repacking is caught here). And every key a core/
// engine kit names in BEVEL_KEYS is a key it draws as boxes (a bevel on a key it never draws is a typo).
const fs = require('fs'), path = require('path');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
const BUILDS = [];
for (const top of ['kits', 'settlements']) for (const d of fs.readdirSync(path.join(ROOT, top))) {
  const mj = path.join(ROOT, top, d, 'materials.json');
  if (fs.existsSync(mj)) BUILDS.push(top + '/' + d);
}
function webpHasAlpha(buf) {   /* a VP8X chunk with the alpha flag, or a VP8L with alpha_is_used */
  if (buf.toString('ascii', 12, 16) === 'VP8X') return (buf[20] & 0x10) !== 0;
  if (buf.toString('ascii', 12, 16) === 'VP8L') return ((buf[24] >> 4) & 1) === 1;
  return false;
}
let flagged = 0, kits = new Set();
const bad = { m4: [], pom: [], aa: [] };
for (const b of BUILDS) {
  const M = JSON.parse(fs.readFileSync(path.join(ROOT, b, 'materials.json'), 'utf8')).families || {};
  const pj = path.join(ROOT, b, 'tex', 'pack.json');
  const P = fs.existsSync(pj) ? JSON.parse(fs.readFileSync(pj, 'utf8')).families || {} : {};
  for (const [fam, c] of Object.entries(M)) {
    if (!(c.m4 || c.pom || c.specAA)) continue;
    flagged++; kits.add(b);
    const e = P[fam] || {}, files = e.files || {};
    if (c.m4 && !(files.cwMap && fs.existsSync(path.join(ROOT, b, 'tex', files.cwMap)))) bad.m4.push(b + ':' + fam);
    if (c.pom) { const a = files.map && path.join(ROOT, b, 'tex', files.map);
      if (!(e.pomDepth === c.pom && a && fs.existsSync(a) && webpHasAlpha(fs.readFileSync(a)))) bad.pom.push(b + ':' + fam); }
    if (c.specAA && !(Array.isArray(e.mipVariance) && e.mipVariance.length >= 8)) bad.aa.push(b + ':' + fam);
  }
}
T.ok('the survey\'s masonry and smooth families are flagged in the kits that took them (17 builds: 6 engine kits, 11 Ancients-lineage packs)', kits.size >= 17 && flagged >= 50, kits.size + ' builds, ' + flagged + ' families');
T.ok('every "m4" family has its cavity/wear map written and on disk', bad.m4.length === 0, bad.m4.join(', '));
T.ok('every "pom" family has its depth and the height in its colour map\'s alpha', bad.pom.length === 0, bad.pom.join(', '));
T.ok('every "specAA" family has its mip variance table', bad.aa.length === 0, bad.aa.join(', '));
T.neg('the alpha check sees a colour map without alpha (an RGB WebP is not a height carrier)', buf => webpHasAlpha(buf),
  (() => { for (const b of BUILDS) { const d = path.join(ROOT, b, 'tex'); if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) if (/\.albedo\.webp$/.test(f)) { const x = fs.readFileSync(path.join(d, f)); if (!webpHasAlpha(x)) return x; } } return Buffer.alloc(32); })(),
  (() => { const d = path.join(ROOT, 'kits', 'eternian', 'tex'); return fs.readFileSync(path.join(d, 'block.albedo.webp')); })());

/* the bevel tables: every BEVEL_KEYS key is one the kit draws as boxes */
const BEVEL = [];
for (const k of fs.readdirSync(path.join(ROOT, 'kits'))) {
  const src = path.join(ROOT, 'kits', k, 'src');
  if (!fs.existsSync(src)) continue;
  const text = fs.readdirSync(src).filter(f => f.endsWith('.js')).map(f => fs.readFileSync(path.join(src, f), 'utf8')).join('\n');
  for (const m of text.matchAll(/BEVEL_KEYS\.(\w+)\s*=\s*([\d.]+)/g))
    BEVEL.push({ kit: k, key: m[1], bev: +m[2], boxes: (text.match(new RegExp("\\bbox\\('" + m[1] + "'", 'g')) || []).length });
}
T.ok('five kits name bevel keys (Lizardmen, Eternian, Islanders, Yeti, Tungang)', new Set(BEVEL.map(b => b.kit)).size >= 5, BEVEL.map(b => b.kit + '.' + b.key).join(', '));
T.neg('every bevel key is drawn as boxes by its kit, its chamfer between 1 and 6 cm',
  L => L.every(b => b.boxes > 0 && b.bev >= 0.01 && b.bev <= 0.06),
  BEVEL.concat([{ kit: 'x', key: 'never', bev: 0.03, boxes: 0 }]), BEVEL);
T.done();
