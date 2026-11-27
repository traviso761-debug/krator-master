// node core/materials/record/test-m234.js: the library hooks of GRAPHICS-TERRAIN-PROPOSAL.md M2-M4 (25-matlib-host.js) and
// what tools/textures/pack.py writes for them: specular anti-aliasing from the normal map's mip variance (M2), the cavity
// and wear masks (M4), parallax occlusion on masonry (M3), and the sine-free break-up hash shared with Godot (K1).
// The hooks are run on three r128's own physical shader text; pack.py on a real library set at a small size.
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
const ctx = { THREE, console, Math, JSON, location: { search: '', hash: '' }, Image: function(){} };
ctx.window = ctx; vm.createContext(ctx);
for (const f of ['23-mat-record.js', '25-matlib-host.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), ctx, { filename: f });
const KMAT = vm.runInContext('KMAT', ctx);
const LIB = THREE.ShaderLib.physical;
const run = L => { const sh = { uniforms: {}, vertexShader: LIB.vertexShader, fragmentShader: LIB.fragmentShader }; KMAT.libHooks(sh, L); return sh; };
const L = { specular: 0.5, breakup: { mix: 0.4, macro: 0.1, cell: 6 }, mipVariance: [0, .01, .02, .03, .04, .05, .06, .07, .08], map: 'data:a', normalMap: 'data:b', cwMap: 'data:c', pomDepth: 0.02 };
const sh = run(L), fs_ = sh.fragmentShader;

/* M2 */
T.ok('M2: the mip variance rides in two vec4 uniforms, 8 levels', sh.uniforms.uKmVar.value.length === 2 && sh.uniforms.uKmVar.value[1].w === 0.07);
T.ok('M2: roughness widened by the variance at the sampled mip, before the normal (WebGL 2 only)',
  /#if __VERSION__ >= 300 && defined\( USE_NORMALMAP \)[\s\S]*roughnessFactor = sqrt\(clamp\(roughnessFactor \* roughnessFactor \+ min\(mix\(kmV0, kmV1, kmF\) \* 1\.5, 0\.45\)/.test(fs_) &&
  fs_.indexOf('roughnessFactor = sqrt') < fs_.indexOf('#include <normal_fragment_begin>'));
T.neg('M2: a family without the table takes no hook (and no key)', l => !/uKmVar/.test(run(l).fragmentShader) && !/\|aa/.test(KMAT.libKey(l)),
  L, Object.assign({}, L, { mipVariance: undefined }));
/* M4 */
T.ok('M4: cavity darkens, wear lifts and polishes, from the two-channel mask on the colour map\'s UVs',
  !!sh.uniforms.uKmCW && /diffuseColor\.rgb \*= mix\(1\.0, kmCw\.r, 0\.85\) \* \(1\.0 \+ 0\.14 \* kmCw\.g\)/.test(fs_) && /roughnessFactor \* \(1\.0 - 0\.18 \* kmCw\.g\)/.test(fs_));
/* M3 */
const main = fs_.slice(fs_.indexOf('void main() {')), after = main.slice(main.indexOf('kmUv = mix(kmCur, kmPrev, kmW); } }'));
T.ok('M3: the march sits at the top of main, derivatives taken before its loop, explicit-gradient samples',
  /void main\(\) \{\nvec2 kmUv = vUv;/.test(fs_) && main.indexOf('dFdx(vUv)') < main.indexOf('for(int kmK') && /textureGrad\(map, kmCur, kmS0, kmS1\)/.test(main));
T.neg('M3: after the march every map reads the shifted UVs (no vUv left in main)', s => !/\bvUv\b/.test(s) && /texture2D\( ?map, kmUv ?\)/.test(s),
  after.replace('texture2D(map, kmUv)', 'texture2D(map, vUv)'), after);
T.ok('M3: the depth is a uniform in metres', sh.uniforms.uKmPom.value === 0.02 && /uniform float uKmPom;/.test(fs_));
T.ok('the key names each hook\'s kind, never a value', KMAT.libKey(L) === '|lib|bu|aa|m4|pom' && KMAT.libKey(Object.assign({}, L, { pomDepth: 0.05, mipVariance: L.mipVariance.map(x => x * 2) })) === '|lib|bu|aa|m4|pom');
/* the hash */
const hJS = (x, y, z) => { let p = [x, y, z].map(v => { v *= 0.1031; return v - Math.floor(v); }); const d = p[0] * (p[2] + 31.32) + p[1] * (p[1] + 31.32) + p[2] * (p[0] + 31.32);
  p = p.map(v => v + d); const s = (p[0] + p[1]) * p[2]; return s - Math.floor(s); };
const G = fs.readFileSync(path.join(ROOT, 'godot', 'shaders', 'lib', 'breakup.gdshaderinc'), 'utf8');
T.neg('the break-up hash is sine-free on the web and in Godot, the same expression', s => !/sin\(/.test(s) && /fract\(p \* 0\.1031\); p \+= dot\(p, p\.zyx \+ 31\.32\); return fract\(\(p\.x \+ p\.y\) \* p\.z\)/.test(s),
  'float kmH(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }', fs_.match(/float kmH\(vec3 p\)\{[^}]*\}/)[0]);
T.ok('Godot\'s km_h is the same hash', /vec3 p = fract\(q \* 0\.1031\); p \+= dot\(p, p\.zyx \+ 31\.32\); return fract\(\(p\.x \+ p\.y\) \* p\.z\)/.test(G) && !/sin\(/.test(G.split('km_h')[1].split('}')[0]));
T.ok('the hash spreads (a value noise needs 0..1 cells that differ)', (() => { const v = []; for (let i = 0; i < 64; i++) v.push(hJS(i, i * 3 + 1, i * 7 + 2));
  const m = v.reduce((a, b) => a + b) / v.length; return m > 0.35 && m < 0.65 && new Set(v.map(x => x.toFixed(6))).size === 64; })());
/* M4 wet margins: from the LOCAL water body, per vertex */
const quay = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 2), new THREE.MeshStandardMaterial()); quay.position.set(0, 0, 0);   /* y -2 .. 2 */
const pier = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 2), new THREE.MeshStandardMaterial()); pier.position.set(50, 0, 0);
const water = (x, z) => x < 20 ? 0.5 : x < 60 ? -1.0 : -1e9;   /* two bodies at two levels */
const wst = KMAT.wetTag([quay, pier], water, { band: 0.6 });
const wetAt = (m, y) => { const P = m.geometry.attributes.position, W = m.geometry.attributes.aWet; for (let i = 0; i < P.count; i++) if (Math.abs(P.getY(i) - y) < 1e-6) return W.getX(i); };
T.ok('wetTag: under its water wet (1), its top dry (0)', wetAt(quay, -2) === 1 && wetAt(quay, 2) === 0 && wst.wet > 0);
T.neg('wetTag reads each body\'s own level, not one global level (the pier\'s water is 1.5 m lower)',
  m => wetAt(m, 2) === 0 && wetAt(m, -2) === 0 && wetAt(m, -2) === 0,
  (() => { const p = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 2)); p.position.set(50, 0, 0); KMAT.wetTag([p], () => 0.5); return p; })(),
  (() => { const p = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 2)); p.position.set(50, 2.5, 0); KMAT.wetTag([p], water); return p; })());
const wsh = { uniforms: {}, vertexShader: LIB.vertexShader, fragmentShader: LIB.fragmentShader }; KMAT.wetHook(wsh);
T.ok('wetHook: darker and glossier by aWet', /attribute float aWet;/.test(wsh.vertexShader) && /diffuseColor\.rgb \*= mix\(1\.0, 0\.55, vKmWet\)/.test(wsh.fragmentShader));
/* pack.py: one masonry family packed small, as a kit's materials.json asks */
let P = null;
try { P = JSON.parse(cp.execFileSync('python', ['-c', [
  'import sys, json, io', 'sys.path.insert(0, "tools/textures")', 'import pack', 'from PIL import Image',
  'e, files = pack.process("stone", {"lib": "stone.cut.b", "specAA": True, "m4": True, "pom": 0.02}, 128)',
  'a = Image.open(io.BytesIO(files["stone.albedo.webp"])); c = Image.open(io.BytesIO(files["stone.cw.webp"]))',
  'print(json.dumps({"keys": sorted(e["files"]), "mipVariance": e.get("mipVariance"), "pomDepth": e.get("pomDepth"), "albedoMode": a.mode, "cwMode": c.mode,',
  '  "cav": [min(p[0] for p in c.getdata()), max(p[0] for p in c.getdata())], "wear": [min(p[1] for p in c.getdata()), max(p[1] for p in c.getdata())]}))'].join('\n')],
  { cwd: ROOT, encoding: 'utf8' })); } catch (e) { P = { error: String(e.message).slice(0, 300) }; }
T.ok('pack.py writes the cavity/wear map beside the three maps', P.keys && P.keys.join() === 'cwMap,map,normalMap,roughnessMap', JSON.stringify(P).slice(0, 300));
T.ok('pack.py: the mip variance table (a level per halving, rising) and the parallax depth', P.mipVariance && P.mipVariance.length >= 8 && P.mipVariance[0] === 0 && P.mipVariance[7] > P.mipVariance[1] && P.pomDepth === 0.02);
T.ok('pack.py: the height rides in the colour map\'s alpha; cavity and wear both span (two masks, not one)', P.albedoMode === 'RGBA' && P.cwMode === 'RGB' &&
  P.cav[0] < 200 && P.cav[1] === 255 && P.wear[0] === 0 && P.wear[1] > 100);
T.done();
