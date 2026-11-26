// core/shader/r128.js (node only): the real three.js r128 for a hook's node test (kits/ancients/three.min.js, the pinned copy).
// A stub shader of a few #include lines passed while the page failed (core/water/PRACTICE.md section 2, item 6: the breakup's
// stub had no atmos_waves); a test that compiles against this has the real chunk order.
//   const R = require('../shader/r128.js');
//   R.THREE                     the library (real Material, Color, ShaderLib, ShaderChunk)
//   R.shader(lib)               a fresh {uniforms, vertexShader, fragmentShader} as onBeforeCompile receives it ('standard', 'lambert', ...)
//   R.compile(mat, lib?)        runs mat.onBeforeCompile on its lib's shader (lib from mat.type) -> {vs, fs, uniforms, key}
//   R.resolve(src)              the #includes expanded (three's resolveIncludes), to check a hook's text lands where it should
const path = require('path');
const THREE = require(path.join(__dirname, '..', '..', 'kits', 'ancients', 'three.min.js'));
const LIB = {MeshStandardMaterial: 'standard', MeshPhysicalMaterial: 'physical', MeshLambertMaterial: 'lambert', MeshBasicMaterial: 'basic',
  MeshPhongMaterial: 'phong', MeshToonMaterial: 'toon', PointsMaterial: 'points', SpriteMaterial: 'sprite', MeshDepthMaterial: 'depth'};
const shader = lib => { const L = THREE.ShaderLib[lib]; if (!L) throw new Error('r128: no ShaderLib.' + lib);
  return {uniforms: THREE.UniformsUtils.clone(L.uniforms), vertexShader: L.vertexShader, fragmentShader: L.fragmentShader}; };
const RENDERER = {isStub: true, info: {programs: []}};
const compile = (mat, lib) => { const sh = shader(lib || LIB[mat.type]); mat.onBeforeCompile(sh, RENDERER);
  return {vs: sh.vertexShader, fs: sh.fragmentShader, uniforms: sh.uniforms, key: mat.customProgramCacheKey()}; };
const resolve = src => src.replace(/^[ \t]*#include +<([\w\d./]+)>/gm, (m, k) => { const c = THREE.ShaderChunk[k]; if (c == null) throw new Error('r128: no chunk ' + k); return resolve(c); });
module.exports = {THREE, shader, compile, resolve, LIB, RENDERER};
