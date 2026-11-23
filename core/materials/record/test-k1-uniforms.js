// node core/materials/record/test-k1-uniforms.js: K1 (GRAPHICS-TERRAIN-PROPOSAL.md 12d; TODO.md "Fewer shader programs").
// The library hooks (25-matlib-host.js), the bind wrapper (26-matlib-bind.js) and world-unit UVs (../opt/69a-world-uv.js)
// pass their numbers as uniforms, so a program is keyed on the hooks' kind. A stand-in three.js keys programs as r128 does
// (Material.prototype.customProgramCacheKey is onBeforeCompile.toString(); getUniforms clones per material), compiles each
// material, and checks: one program per kind, never two texts under one key, and the uniforms hold the numbers the old
// text printed (so the pixels are the same).
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);

function Material(){ this.userData = {}; }
Material.prototype.onBeforeCompile = function(){};
Material.prototype.customProgramCacheKey = function(){ return this.onBeforeCompile.toString(); };
Material.prototype.clone = function(){ const m = new this.constructor(); m.userData = JSON.parse(JSON.stringify(this.userData)); return m; };
function Std(){ Material.call(this); this.isMeshStandardMaterial = true; }
Std.prototype = Object.create(Material.prototype); Std.prototype.constructor = Std;
function Vector2(x, y){ this.x = x; this.y = y; }
function Texture(){ this.repeat = { set(){ } }; }
const THREE = { Material, MeshStandardMaterial: Std, Vector2, Texture, RepeatWrapping: 1, sRGBEncoding: 2, LinearEncoding: 3,
  ShaderChunk: { roughnessmap_fragment: 'float r = texture2D( roughnessMap, vUv ).g;',
                 normal_fragment_maps: 'vec3 a = texture2D( normalMap, vUv ).xyz; vec3 b = texture2D( normalMap, vUv ).xyz;' } };
const ctx = { THREE, console, Math, JSON, location: { search: '', hash: '' }, window: {}, Image: function(){} };
ctx.window = ctx; vm.createContext(ctx);
const here = __dirname, run = f => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
run(path.join(here, '23-mat-record.js')); run(path.join(here, '25-matlib-host.js')); run(path.join(here, '26-matlib-bind.js'));
run(path.join(here, '..', 'opt', '69a-world-uv.js'));
const KMAT = vm.runInContext('KMAT', ctx), vWorldUV = vm.runInContext('vWorldUV', ctx);

const VS = '#include <common>\nvoid main(){\n#include <uv_vertex>\n#include <project_vertex>\n}';
const FS = '#include <common>\nvoid main(){\n#include <map_fragment>\n#include <roughnessmap_fragment>\n#include <normal_fragment_maps>\n#include <lights_fragment_end>\n}';
/* r128's getProgram, reduced: the key, then the hook on the material's own uniforms */
function compile(m){ const sh = { uniforms: {}, vertexShader: VS, fragmentShader: FS }; m.onBeforeCompile(sh, null);
  return { key: m.customProgramCacheKey(), text: sh.vertexShader + '\n//FS\n' + sh.fragmentShader, uniforms: sh.uniforms }; }
function programs(mats){ const P = new Map(); let clash = 0;
  for(const m of mats){ const c = compile(m); if(P.has(c.key) && P.get(c.key) !== c.text) clash++; P.set(c.key, c.text); }
  return { count: P.size, clash }; }
const engineMat = L => { const m = new Std(); m.onBeforeCompile = sh => KMAT.libHooks(sh, L); const k = 'lib' + KMAT.libKey(L);
  m.customProgramCacheKey = () => k; return m; };   /* core/engine 27-mat.js matHook, reduced */

/* 1. the library hooks: one program per kind of hook */
const LS = [0.3, 0.35, 0.6, 0.62].map((s, i) => ({ specular: s, breakup: { mix: 0.4 + i * 0.05, macro: 0.1, cell: 4 + i } }));
T.ok('four library materials of one kind compile one program', programs(LS.map(engineMat)).count === 1, JSON.stringify(programs(LS.map(engineMat))));
T.ok('no key carries two shader texts', programs(LS.map(engineMat)).clash === 0);
T.neg('the old key (values in it) gave one program per value; the kind key collapses them',
  keyOf => new Set(LS.map(keyOf)).size === 1, KMAT.libId, KMAT.libKey);
T.ok('a hook that is off is a kind of its own (specular 0.5, no break-up)',
  programs(LS.map(engineMat).concat([engineMat({ specular: 0.5 }), engineMat({ specular: 0.3 })])).count === 3);
const c0 = compile(engineMat(LS[1]));
T.ok('uKmSpec holds the scale the text printed (0.35 / 0.5 to 3 places)', c0.uniforms.uKmSpec.value === +(0.35 / 0.5).toFixed(3));
T.ok('uKmBreak holds (mix, macro, cell) to 3 places', JSON.stringify(c0.uniforms.uKmBreak.value) === JSON.stringify([0.45, 0.1, 5]));
T.ok('the GLSL prints no value of the material', !/0\.700|0\.450|5\.000/.test(c0.text) && /uKmSpec/.test(c0.text) && /uKmBreak\.z/.test(c0.text));
T.ok('the uniforms are declared before main', /uniform float uKmSpec;[\s\S]*void main/.test(c0.text.split('//FS')[1]) && /uniform vec3 uKmBreak;[\s\S]*void main/.test(c0.text.split('//FS')[1]));
T.neg('two materials keep their own values (uniforms are per material, not shared)',
  pair => pair[0].uniforms.uKmSpec.value !== pair[1].uniforms.uKmSpec.value,
  (() => { const a = compile(engineMat(LS[0])); return [a, a]; })(), [compile(engineMat(LS[0])), compile(engineMat(LS[2]))]);

/* 2. world-unit UVs: one program for every K, and for a clone that carries the hook */
const wm = [0.5, 0.25, 1 / 3, 0.125].map(K => vWorldUV(new Std(), K));
wm.push(vWorldUV(new Std(), 1, 2), vWorldUV(new Std(), 1 / 1.5, 1 / 0.735));
T.ok('six world-UV materials (four K, two K/Kv) compile one program', programs(wm).count === 1, JSON.stringify(programs(wm)));
const cl = wm.map(m => { const c = m.clone(); c.onBeforeCompile = m.onBeforeCompile; return c; });   /* kbake: clone() drops the key */
T.ok('their kbake clones share it too (the hook carries its key)', programs(wm.concat(cl)).count === 1 && programs(cl).clash === 0);
T.ok('uWuvK holds K and Kv to 4 places', (() => { const u = compile(wm[2]).uniforms.uWuvK.value, v = compile(wm[5]).uniforms.uWuvK.value;
  return u.x === 0.3333 && u.y === 0.3333 && v.x === +(1 / 1.5).toFixed(4) && v.y === +(1 / 0.735).toFixed(4); })());
T.ok('the vertex text names the uniform, not K', /vUv=uv\*_sw\*uWuvK;/.test(compile(wm[0]).text) && !/0\.5000/.test(compile(wm[0]).text));
/* a page that wraps the hook afterwards (Highlands hlLumaKey, Xanadu's discs) adds text: it must not share the plain program */
const wrap = (m, tag) => { const p = m.onBeforeCompile; m.onBeforeCompile = function(sh, r){ p.call(this, sh, r); sh.fragmentShader += '\n//' + tag; }; return m; };
const wrapped = [wrap(vWorldUV(new Std(), 0.5), 'disc'), wrap(vWorldUV(new Std(), 0.25), 'disc')];
T.ok('a wrapped hook keeps a program of its own, never the plain one\'s key', programs(wm.concat(wrapped)).clash === 0 && programs(wm.concat(wrapped)).count === 3);
T.neg('a wrapped material under the plain key is a clash the check sees',
  mats => programs(mats).clash === 0,
  wm.concat([(() => { const m = wrap(vWorldUV(new Std(), 0.5), 'disc'); m.customProgramCacheKey = () => 'wuv|u'; return m; })()]),
  wm.concat(wrapped));

/* 3. the bind wrapper: after vWorldUV, or on a bare material, the program is the kind's; after an unknown hook, its own */
KMAT.mode = 'lib';
KMAT.pack('t', { wood: { lib: 'wood.x', scale: [2, 2], map: 'data:a', specular: 0.3, breakup: { mix: 0.4, macro: 0.1, cell: 5 } },
                 stone: { lib: 'stone.x', scale: [3, 3], map: 'data:b', specular: 0.35, breakup: { mix: 0.45, macro: 0.12, cell: 7 } },
                 plaster: { lib: 'plaster.x', scale: [2, 2], map: 'data:c', specular: 0.3, breakup: { mix: 0.3, macro: 0.08, cell: 4 } } });
const MAT = { wood: vWorldUV(new Std(), 0.5), stone: vWorldUV(new Std(), 0.25), plaster: new Std() };
const own = new Std(); own.onBeforeCompile = function(sh){ sh.fragmentShader += '\n//own'; }; MAT.glass = own;
KMAT.pack('t2', { glass: { lib: 'glass.x', scale: [1, 1], map: 'data:d', specular: 0.6 } });
const bound = KMAT.bindMat('t', MAT);
KMAT.bindMat('t2', { glass: own });
T.ok('bindMat binds the three families', Object.keys(bound).length === 3);
T.ok('two world-UV bound materials of different K and values share one program', compile(MAT.wood).key === compile(MAT.stone).key && programs([MAT.wood, MAT.stone]).count === 1);
T.ok('a bound material without a world-UV hook is a kind of its own', compile(MAT.plaster).key !== compile(MAT.wood).key);
T.ok('a bound material after an unknown hook keeps its per-material key (its old hook may print values)', /t2\|glass/.test(compile(own).key));
T.ok('the bound wrapper sets both hooks\' uniforms, each from its own record',
  (() => { const a = compile(MAT.wood).uniforms, b = compile(MAT.stone).uniforms;
    return a.uWuvK.value.x === 0.5 && b.uWuvK.value.x === 0.25 && a.uKmSpec.value === 0.6 && b.uKmSpec.value === 0.7 && a.uKmBreak.value[2] === 5 && b.uKmBreak.value[2] === 7; })());
const bc = MAT.wood.clone(); bc.onBeforeCompile = MAT.wood.onBeforeCompile;
T.ok('a kbake clone of a bound material shares its program', compile(bc).key === compile(MAT.wood).key && programs([MAT.wood, MAT.stone, bc]).clash === 0);
T.done();
