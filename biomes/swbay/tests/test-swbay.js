// node biomes/swbay/tests/test-swbay.js: the southwest bay's 26 native species (14 trees in 50 + 12 endemics in 53), checked without a browser
const fs = require('fs'), vm = require('vm'), path = require('path');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
const THREE = require(path.join(ROOT, 'kits/ancients/three.min.js'));

const ctx = {console, Math, JSON}; ctx.globalThis = ctx; ctx.window = ctx; vm.createContext(ctx);
ctx.THREE = THREE;
vm.runInContext('var BIO={kit:function(){},fn:{TAU:Math.PI*2,clamp:function(v,a,b){return v<a?a:v>b?b:v;},lerp:function(a,b,t){return a+(b-a)*t;}},host:{THREE:THREE}};', ctx);

const sp50 = fs.readFileSync(path.join(ROOT, 'biomes/swbay/src/50-biome-swbay-species.js'), 'utf8');
const cut50 = sp50.indexOf('// ---------------------------------------------------------------- leaf textures');
vm.runInContext(sp50.slice(0, cut50) + '\n})();', ctx, {filename: '50-biome-swbay-species.js'});
vm.runInContext(fs.readFileSync(path.join(ROOT, 'biomes/swbay/src/53-biome-swbay-endemic-species.js'), 'utf8'), ctx, {filename: '53-biome-swbay-endemic-species.js'});

const SP = ctx.SWBAY.SPECIES, PL = ctx.SWBAY.PLANTS;
const EXPECTED_TREES = ['prismgum', 'baobab', 'captree', 'fancrown', 'puzzle', 'dragon', 'parasol', 'treefern', 'splay', 'ironbark', 'brackettree', 'coral', 'thorn', 'cherry'];

T.ok('SWBAY.SPECIES preserves its exact 14 tree keys and indices (0..13) for downstream vendors',
  SP.length === 14 && EXPECTED_TREES.every((k, i) => SP[i] && SP[i].key === k),
  SP.map(s => s.key).join(', '));
T.neg('reordering or dropping a vendor tree key is caught',
  A => A.length === 14 && EXPECTED_TREES.every((k, i) => A[i] && A[i].key === k),
  SP.slice(1), SP);

const pkeys = Object.keys(PL);
T.ok('SWBAY.PLANTS defines 12 endemic strand, karst-spring, drip-cap, epiphyte and skarn species (26 total natives)',
  pkeys.length === 12 && (SP.length + pkeys.length) === 26,
  'trees ' + SP.length + ' + endemics ' + pkeys.length);

const validEndemics = P => Object.keys(P).every(k => {
  const rec = P[k], tg = rec && rec.tags, hv = tg && tg.harvest;
  return rec && rec.name && Array.isArray(rec.items) && rec.items.length > 0 &&
    tg && tg.climate && tg.aridity && tg.riparian && Array.isArray(tg.koppen) && tg.koppen.length > 0 &&
    hv && typeof hv.wood === 'string' && Array.isArray(hv.edible) && typeof hv.medicinal === 'boolean' && hv.note && hv.note.length > 15;
});
T.ok('every endemic species carries complete climate, Koppen and harvest records', validEndemics(PL), pkeys.join(', '));
T.neg('an endemic species missing harvest notes or Koppen classes is caught', validEndemics,
  Object.assign({}, PL, {bad: {name: 'Bad', items: ['x'], tags: {climate: 'warm', aridity: 'humid', riparian: 'no', koppen: [], harvest: {wood: 'none', edible: [], medicinal: false, note: ''}}}}), PL);

T.ok('SWBAY.plantOfItem resolves endemic instanced items back to their species record',
  ctx.SWBAY.plantOfItem('dripveil') === PL.dripcap && ctx.SWBAY.plantOfItem('samphire') === PL.chalcosamphire && ctx.SWBAY.plantOfItem('unknown') === null,
  'dripveil -> ' + (ctx.SWBAY.plantOfItem('dripveil') && ctx.SWBAY.plantOfItem('dripveil').name));
T.done();
