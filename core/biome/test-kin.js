// node core/biome/test-kin.js: kin species (PLAN-LANDS.md H2; BIO.kitBuilder in 20-core-kit.js, BIO.kin in
// 32-core-variants.js). A source kit shaped as the biome kits are (SPECIES, make(sp, x, y, z), grow(T, lv), builders that
// read SP[T.sp] through a closure) is loaded but never built; its cousin is grown from it. Each check with a negative.
require('../shader/06-core-khook.js');require('../shader/06b-core-kcolor.js');
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
let fails = 0; const check = (name, ok, detail) => { console.log((ok ? 'ok   ' : 'FAIL ') + name + (detail ? '  (' + detail + ')' : '')); if (!ok) fails++; };
const ctx = { console, Math, THREE }; vm.createContext(ctx);
for (const f of ['core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/32-core-variants.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8') + (f.endsWith('head.js') ? '\nthis.BIO=BIO;' : ''), ctx, { filename: f });
const BIO = ctx.BIO, errs = [];
BIO.init({ THREE, scene: new THREE.Scene(), seed: 3, err: m => errs.push(m) });

// ---- the source kit, as a page loads it (its fragments run; nothing calls build)
vm.runInContext(`
BIO.kit('srckit');var SRC={};
(function(){const {rr,ri}=BIO.fn;
SRC.SPECIES=[{key:'fern',name:'Tree fern',H:[4,6],rb:[.2,.3],crownR:[2,3],bark:[0x333333],leaf:[0x00aa00],tags:{climate:'tropic',aridity:'humid'}},
 {key:'sigillaria',name:'Seal-tree',H:[20,36],rb:[1.2,2.0],crownR:[6,10],bark:[0x4e5646],leaf:[0x3a7a3c],bloomOn:'trunk',forks:0,pheno:{flush:'wet'},tags:{climate:'hypertropic',aridity:'humid',abyssal:true}}];
const SP=SRC.SPECIES;
BIO.def('pole',new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial());
SRC.built=0;SRC.build=function(){SRC.built++;};
SRC.make=function(sp,x,y,z){const S=SP[sp];return{x,z,y0:y-.5,sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999)};};
SRC.seen=[];
SRC.grow=function(T,lv){const S=SP[T.sp];if(T.boom)throw new Error('boom');
 SRC.seen.push({kit:BIO.kitName,key:S.key,leaf:S.leaf[0],bloomOn:S.bloomOn,forks:S.forks,lv});
 BIO.put('pole',[T.x,T.y0,T.z],null,[T.rb,T.H,T.rb],new THREE.Color(S.leaf[0]));return{trunk:1};};
})();
BIO.kitEnd(SRC);`, ctx);
const SRC = ctx.SRC, before = JSON.stringify(SRC.SPECIES);
check('the source kit is on the page and not built', BIO.kits.srckit && BIO.kits.srckit.api === SRC && SRC.built === 0 && BIO.kitName === '');

// ---- the lookup
const b = BIO.kitBuilder('srckit', 'sigillaria');
check('kitBuilder finds a species and its builder by key', b && b.sp === 1 && b.species === SRC.SPECIES[1] && !b.own);
check('negative: kitBuilder of an unknown kit or key is null', BIO.kitBuilder('nokit', 'sigillaria') === null && BIO.kitBuilder('srckit', 'nope') === null);

// ---- the kin
const K = BIO.kin('srckit.sigillaria', { key: 'rimseal', name: 'Rim seal-tree', scale: .5, colour: { leaf: [0x6a7a3c] }, habit: { bloomOn: 'none', forks: 2 },
  pheno: { drop: 'dry' }, tags: { aridity: 'dry' }, reach: { from: 'abyss', km: 40 } });
const r = K.record;
check('the kin record: key, name, size scaled', r.key === 'rimseal' && r.name === 'Rim seal-tree' && r.H[0] === 10 && r.H[1] === 18 && r.rb[1] === 1 && r.crownR[0] === 3);
check('colour and habit replace the builder\'s fields; pheno merges; other fields carried (reach)',
  r.leaf[0] === 0x6a7a3c && r.bark[0] === 0x4e5646 && r.bloomOn === 'none' && r.forks === 2 && r.pheno.flush === 'wet' && r.pheno.drop === 'dry' && r.reach.km === 40);
check('tags merge, with kin: the source', r.tags.kin === 'srckit.sigillaria' && r.tags.aridity === 'dry' && r.tags.climate === 'hypertropic' && r.tags.abyssal === true
  && K.tags === r.tags && r.kin.kit === 'srckit' && r.kin.key === 'sigillaria');
check('the source record is not changed', JSON.stringify(SRC.SPECIES) === before && SRC.SPECIES[1].H[0] === 20 && SRC.SPECIES[1].tags.kin === undefined);

BIO.fn.reseed(7); const T = K.make(10, 2, 30);
check('make: the source\'s record, sized from the kin (H in the kin\'s range) and marked kin', T.sp === 1 && T.H >= 10 && T.H <= 18 && T.rb <= 1 && T.kin === 'srckit.sigillaria', 'H ' + T.H.toFixed(2));
BIO.fn.reseed(7); const T0 = SRC.make(1, 10, 2, 30);
check('negative: the source\'s own make sizes it as the source', T0.H >= 20 && T0.H <= 36 && T0.kin === undefined);
const st = K.grow(T, 2), seen = SRC.seen[SRC.seen.length - 1];
check('grow: the source builder runs in the source kit\'s registry and reads the kin\'s record', st.trunk === 1 && seen.kit === 'srckit' && seen.key === 'rimseal'
  && seen.leaf === 0x6a7a3c && seen.bloomOn === 'none' && seen.forks === 2 && BIO.kitName === '');
check('grow puts into the source kit\'s item, not the current kit\'s', BIO.kits.srckit.items.pole && BIO.kits.srckit.items.pole.count === 1 && !(BIO.kits[''].items.pole));
SRC.grow(T0, 2); const own = SRC.seen[SRC.seen.length - 1];
check('negative: the source grows its own tree with its own record after the kin', own.key === 'sigillaria' && own.leaf === 0x3a7a3c && own.bloomOn === 'trunk' && JSON.stringify(SRC.SPECIES) === before);
let threw = false; try { K.grow(Object.assign({}, T, { boom: true }), 2); } catch (e) { threw = true; }
check('a builder that throws: the source record is put back', threw && SRC.SPECIES[1].key === 'sigillaria' && JSON.stringify(SRC.SPECIES) === before);

// ---- a kit naming its own builder per key (api.builders) is preferred
vm.runInContext(`BIO.kit('ownkit');var OWN={SPECIES:[{key:'reed',name:'Reed',H:[1,2]}],builders:{reed:{make:(x,y,z)=>({x,z,y0:y,own:BIO.kitName}),grow:(T,lv)=>({kit:BIO.kitName})}}};BIO.kitEnd(OWN);`, ctx);
const KO = BIO.kin('ownkit.reed', { scale: 2 });
check('api.builders[key] is taken before make and grow', KO && KO.record.H[1] === 4 && BIO.kitBuilder('ownkit', 'reed').own && KO.make(0, 0, 0).kin === 'ownkit.reed');

// ---- negatives
errs.length = 0;
const bad = [BIO.kin('srckit', {}), BIO.kin('srckit.', {}), BIO.kin('.sigillaria', {}), BIO.kin('nokit.sigillaria', {}), BIO.kin('srckit.nope', {}), BIO.kin(null, {})];
check('negatives: a malformed source, an unknown kit or key give null and say so', bad.every(x => x === null) && errs.length === 6, errs.length + ' errors');
vm.runInContext(`BIO.kit('datakit');var DK={SPECIES:[{key:'moss',name:'Moss',H:[0,1]}]};BIO.kitEnd(DK);`, ctx);
errs.length = 0;
check('negative: a kit with SPECIES but no make and grow has no builder', BIO.kitBuilder('datakit', 'moss') === null && BIO.kin('datakit.moss', {}) === null && errs.length === 1);
errs.length = 0; const KZ = BIO.kin('srckit.sigillaria', { scale: { H: 0, rb: 2 } });
check('negative: a scale <= 0 is refused (that range kept) and said', KZ.record.H[0] === 20 && KZ.record.rb[0] === 2.4 && errs.length === 1, errs[0]);
const KN = BIO.kin('srckit.sigillaria');
check('no delta: the source\'s record, copied, tagged kin', KN.key === 'sigillaria' && KN.record !== SRC.SPECIES[1] && KN.record.H[0] === 20 && KN.tags.kin === 'srckit.sigillaria');

console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
