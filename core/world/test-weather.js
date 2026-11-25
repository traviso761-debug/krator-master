// node core/world/test-weather.js: Stage 8 V9 (STAGE-8/G-weather.md W2, D33), the open world takes the weather. core/world's host
// (45-world-host.js) is loaded in a fresh vm context per page with core/atmos's real weather (0-core, presets, 4-weather, 9-host, the
// weather binding, the rain cover, the sky host's cloudShade) and a three.js stub; 98's call and 83's ATMOS.init are played by hand.
// Each check has a fault that must fail and a fix that must pass (tools/ktest.js); a fault is 45's own text with its guard broken.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');
const HOST_SRC = read('core', 'world', '45-world-host.js');
const KH = read('core', 'shader', '06-core-khook.js');
const AT = f => read('core', 'atmos', ...f.split('/'));
const ATMOS_CORE = ['89-atmos-0-core.js', '89-atmos-0p-presets.js'].map(AT);
const ATMOS_WX = ['89-atmos-4-weather.js', '89-atmos-9-host.js', 'host/89-atmos-e-weatherhost.js', 'fx/89-atmos-fx-raincover.js'].map(AT);
const ATMOS_SKY = ['host/89-atmos-h-skyhost.js'].map(AT);

// ---------------------------------------------------------------- a three.js stub (what 45 and the weather touch)
function stub() {
  class Material { constructor(o) { this.userData = {}; Object.assign(this, o || {}); this.color = new Color(); } clone() { const m = new this.constructor(); Object.assign(m, this); m.userData = JSON.parse(JSON.stringify(this.userData)); return m; } }
  Material.prototype.customProgramCacheKey = function () { return String(this.onBeforeCompile); }; Material.prototype.onBeforeCompile = function () {};
  class Color {
    constructor(r, g, b) { this.r = 0; this.g = 0; this.b = 0; if (typeof r === 'number' && g == null) this.setHex(r); else if (r != null) { this.r = r; this.g = g; this.b = b; } }
    setHex(h) { this.r = (h >> 16 & 255) / 255; this.g = (h >> 8 & 255) / 255; this.b = (h & 255) / 255; return this; }
    getHex() { return Math.round(this.r * 255) << 16 | Math.round(this.g * 255) << 8 | Math.round(this.b * 255); }
    setRGB(r, g, b) { this.r = r; this.g = g; this.b = b; return this; } copy(c) { this.r = c.r; this.g = c.g; this.b = c.b; return this; } clone() { return new Color(this.r, this.g, this.b); }
    lerp(c, t) { this.r += (c.r - this.r) * t; this.g += (c.g - this.g) * t; this.b += (c.b - this.b) * t; return this; } equals(c) { return c.r === this.r && c.g === this.g && c.b === this.b; }
    multiplyScalar(k) { this.r *= k; this.g *= k; this.b *= k; return this; } convertSRGBToLinear() { return this; }
  }
  class V2 { constructor(x, y) { this.x = x || 0; this.y = y || 0; } set(x, y) { this.x = x; this.y = y; return this; } copy(v) { this.x = v.x; this.y = v.y; return this; } addScaledVector(v, s) { this.x += v.x * s; this.y += v.y * s; return this; } }
  class V3 {
    constructor(x, y, z) { this.x = x || 0; this.y = y || 0; this.z = z || 0; } set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
    clone() { return new V3(this.x, this.y, this.z); } add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; } addScaledVector(v, s) { this.x += v.x * s; this.y += v.y * s; this.z += v.z * s; return this; }
    normalize() { const l = Math.hypot(this.x, this.y, this.z) || 1; this.x /= l; this.y /= l; this.z /= l; return this; }
  }
  class V4 { constructor(x, y, z, w) { this.x = x || 0; this.y = y || 0; this.z = z || 0; this.w = w || 0; } set(x, y, z, w) { this.x = x; this.y = y; this.z = z; this.w = w; return this; } }
  class Obj3 { constructor() { this.children = []; this.position = new V3(); this.userData = {}; this.visible = true; this.up = new V3(0, 1, 0); } add(o) { this.children.push(o); } lookAt() {} updateMatrixWorld() {} updateProjectionMatrix() {} }
  class Mesh extends Obj3 { constructor(g, m) { super(); this.geometry = g; this.material = m; this.isMesh = true; } }
  class BG { constructor() { this.attributes = {}; } setAttribute(k, v) { this.attributes[k] = v; } setIndex(i) { this.index = i; } computeBoundingSphere() {} }
  const Attr = class { constructor(a, n) { this.array = a; this.itemSize = n; } };
  const Lit = flag => class extends Material { constructor(o) { super(o); this[flag] = true; } };
  const renders = { n: 0 };
  return { renders, THREE: {
    Material, Color, Vector2: V2, Vector3: V3, Vector4: V4, Group: Obj3, Object3D: Obj3, Mesh, LineSegments: Mesh, Sprite: Mesh,
    BufferGeometry: BG, InstancedBufferGeometry: BG, BufferAttribute: Attr, Float32BufferAttribute: Attr, InstancedBufferAttribute: Attr,
    MeshBasicMaterial: Lit('isMeshBasicMaterial'), SpriteMaterial: Lit('isSpriteMaterial'), ShaderMaterial: Lit('isShaderMaterial'),
    MeshLambertMaterial: Lit('isMeshLambertMaterial'), MeshStandardMaterial: Lit('isMeshStandardMaterial'),
    AdditiveBlending: 2, DoubleSide: 2, sRGBEncoding: 3001, ACESFilmicToneMapping: 4, UnsignedIntType: 1014, NearestFilter: 1003,
    ShaderChunk: { lights_lambert_vertex: '', lights_fragment_begin: '' },
    WebGLRenderer: class { constructor() { this.domElement = {}; this.info = { autoReset: true, render: { calls: 0, triangles: 0 } }; this.autoClear = true; }
      setPixelRatio() {} setSize() {} getPixelRatio() { return 1; } getRenderTarget() { return null; } setRenderTarget() {} clear() {} render() { renders.n++; } },
    Scene: class extends Obj3 { traverse(fn) { const walk = o => { fn(o); (o.children || []).forEach(walk); }; this.children.forEach(walk); } },
    FogExp2: class { constructor(c, d) { this.color = new Color(c); this.density = d; } },
    PerspectiveCamera: class extends Obj3 { constructor(fov) { super(); this.fov = fov; } },
    OrthographicCamera: class extends Obj3 {},
    HemisphereLight: class extends Obj3 { constructor(c, g, i) { super(); this.color = new Color(c); this.groundColor = new Color(g); this.intensity = i; this.isHemisphereLight = true; } },
    DirectionalLight: class extends Obj3 { constructor(c, i) { super(); this.color = new Color(c); this.intensity = i; this.target = new Obj3(); } },
    DepthTexture: class {}, WebGLRenderTarget: class { constructor(w, h, o) { this.texture = {}; Object.assign(this, o || {}); } }
  } };
}

// ---------------------------------------------------------------- a page: o.atmos (core/atmos on it, default true), o.weather (the weather
// fragments listed, default true), o.sky (the shared sky's clouds), o.kits (WORLD_KITS names or entries), o.search, o.src (45's text)
function page(o) {
  o = o || {};
  const S = stub(), errs = [];
  const mk = () => ({ children: [], id: '', appendChild(c) { this.children.push(c); }, setAttribute() {} });
  const bar = mk(), body = mk();
  const ctx = vm.createContext({ console, URLSearchParams, Math, JSON, innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1,
    addEventListener() {}, location: { search: o.search || '' }, reportErr: m => errs.push(String(m)),
    document: { body, querySelector: q => q === '#ui .bar' ? bar : null, createElement: () => mk(),
      getElementById: id => bar.children.find(c => c.id === id) || null } });
  ctx.window = ctx; ctx.THREE = S.THREE;
  const run = (src, name) => vm.runInContext(src, ctx, { filename: name });
  run(KH, 'khook');
  if (o.atmos !== false) { ATMOS_CORE.forEach((s, i) => run(s, 'atmos' + i)); if (o.weather !== false) ATMOS_WX.forEach((s, i) => run(s, 'wx' + i)); ATMOS_SKY.forEach((s, i) => run(s, 'sky' + i)); }
  const kits = (o.kits || ['xanadu']).map(k => typeof k === 'string' ? { name: k } : k);
  ctx.BIO = { host: null, kitName: null, init(h) { this.host = h; }, setSun() {} };
  ctx.WORLD = { FIELDS: [], at: () => ({}), H: () => 0, water: () => -1e9 };
  ctx.WORLD_KITS = kits; if (o.config) ctx.WORLD_CONFIG = o.config;
  run((o.src || HOST_SRC) + '\n;this.HOST=HOST;', '45-world-host.js');
  const HOST = ctx.HOST, A = o.atmos !== false ? run('ATMOS', 'a') : null;
  if (A) {   /* 83-world-water.js's binding */
    A.init({ THREE: S.THREE, scene: HOST.scene, camera: HOST.camera, hour: () => HOST.hour(), onFrame: fn => HOST.TICKS.push(fn), ground: () => 0, seed: 4242, err: m => errs.push(m), viewH: () => 800, pixelRatio: () => 1 });
    if (o.sky) { Object.assign(A.skyUniforms, { uNoise: { value: 1 }, uCloud: { value: 1 }, uCloudH: { value: 1 }, uWind: { value: 1 }, uTime: { value: 1 }, uWet: { value: 0 } }); A.cloudShadeGLSL = () => 'CLOUD'; }
  }
  const MAT = new S.THREE.MeshLambertMaterial();ctx.TERRAIN = { MAT };   /* 81's ground material, and its HOST.shade call */
  if (HOST.shade) HOST.shade(MAT, { porosity: 1 });
  const base = { fog: HOST.scene.fog.density, fogC: HOST.scene.fog.color.getHex(), sun: HOST.sun.intensity, hemi: HOST.hemi.intensity, kids: HOST.scene.children.length };
  const W = typeof HOST.weather === 'function' ? HOST.weather() : undefined;   /* 98-world-start.js, after the LATE modules */
  const frames = (n, dt) => { for (let i = 0; i < n; i++) { HOST.scene.fog.density = base.fog; for (const f of HOST.TICKS) f(dt == null ? .1 : dt, i * .1); } };   /* 98's frame: the haze, then the ticks */
  const names = m => run('KHOOK', 'k').names(m);
  const recs = type => A && A.fx ? A.fx.filter(r => r.type === type) : [];
  return { ctx, HOST, A, W, MAT, bar, base, errs, frames, names, recs, renders: S.renders, THREE: S.THREE };
}
const FAULTS = [];
const mutate = (find, rep) => { FAULTS.push(find); if (HOST_SRC.indexOf(find) < 0) return '/* the fault cannot be made: ' + find + ' is not in 45 */ var HOST={};'; return HOST_SRC.replace(find, rep); };
const modes = P => P.W ? P.W.MODES : [];

// ---------------------------------------------------------------- bound once, starting clear
T.neg('the host binds the weather once (98 and anything after it asking again get the same state, one binding)', mk => {
  const P = mk(), W2 = P.HOST.weather(), W3 = P.HOST.weather();
  return !!P.W && P.W === W2 && W2 === W3 && P.recs('weatherhost').length === 1 && P.recs('weather').length === 1;
}, () => page({ src: mutate('if(WX.W||WX.off)return WX.W;', 'if(WX.off)return WX.W;') }), () => page());
T.neg('it starts clear: after a minute of frames the fog, its colour, the sun and the sky light are the page\'s own, to the bit', mk => {
  const P = mk(); P.frames(600);
  return P.W.mode === 'clear' && P.HOST.scene.fog.density === P.base.fog && P.HOST.scene.fog.color.getHex() === P.base.fogC && P.HOST.sun.intensity === P.base.sun && P.HOST.hemi.intensity === P.base.hemi;
}, () => page({ src: mutate("?q:'clear';", "?q:'storm';") }), () => page());
{const P = page({ search: '?weather=rain' }); P.frames(100);
 T.ok('?weather=rain opens in the rain: the fog thickens and the sun dims (the binding follows 98\'s haze every frame)', P.W && P.W.mode === 'rain' && P.W.rain > .5 && P.HOST.scene.fog.density > P.base.fog * 2 && P.HOST.sun.intensity < P.base.sun, P.W && [P.W.mode, P.W.rain, P.HOST.scene.fog.density]);}
T.neg('a mode the region does not offer (a blizzard on Xanadu\'s shore) opens clear', mk => mk().W.mode === 'clear',
  () => page({ search: '?weather=blizzard', src: mutate('q&&modes.indexOf(q)>=0?q:', 'q?q:') }), () => page({ search: '?weather=blizzard' }));

// ---------------------------------------------------------------- the region's climate, as its kits say
const NOKITS = mutate('k.climate||WX_KIT_CLIMATE[k.name]||{}', '{}');
T.neg('a cold region (Oidong and the High Rift) offers snowfall and the blizzard, a warm one (Xanadu) does not', mk => {
  const C = mk(), W = page({ kits: ['xanadu'] });
  return modes(C).indexOf('blizzard') >= 0 && modes(C).indexOf('snowfall') >= 0 && modes(C).indexOf('ash') < 0 && modes(W).indexOf('blizzard') < 0;
}, () => page({ kits: ['oidong', 'highrift'], src: NOKITS }), () => page({ kits: ['oidong', 'highrift'] }));
T.neg('one ash kit (the Throne\'s air) makes the region offer ashfall and the ash storm', mk => modes(mk()).indexOf('ash') >= 0 && modes(mk()).indexOf('ashfall') >= 0,
  () => page({ kits: ['ringisles', 'throne'], src: NOKITS }), () => page({ kits: ['ringisles', 'throne'] }));
{const D = page({ kits: ['sedesert'] }), M = page({ kits: ['sedesert', 'eastabyss'] }), r = P => (P.recs('weatherhost')[0] || {}).climate || {};
 T.ok('a region is dry only if every kit is (sedesert alone: dry, no wet ground; with the east abyss: wet)', r(D).dry === true && r(D).wet === false && r(M).dry === false && r(M).wet === true, [JSON.stringify(r(D)), JSON.stringify(r(M))]);}
{const P = page({ kits: [{ name: 'xanadu', climate: { cold: true } }] }), Q = page({ kits: ['xanadu'], config: { climate: { ash: true } } });
 T.ok('a kit\'s own WORLD_KITS climate, and the region\'s WORLD_CONFIG.climate, say otherwise', modes(P).indexOf('blizzard') >= 0 && modes(Q).indexOf('ash') >= 0 && modes(Q).indexOf('blizzard') < 0, [modes(P).join(), modes(Q).join()]);}

// ---------------------------------------------------------------- what the binding does to the page
{const P = page();
 T.ok('the terrain is the binding\'s ground (WATER.wetGround through it), the selector sits in the bar, the rain cover rides the camera',
  (P.recs('weatherhost')[0] || {}).grounds === 1 && P.bar.children.some(c => c.id === 'atmosWeather') && !!P.HOST.wx.cover && P.A.raincover === P.HOST.wx.cover,
  [JSON.stringify(P.recs('weatherhost')[0] || null), P.bar.children.length, !!(P.HOST.wx && P.HOST.wx.cover)]);
 const n0 = P.renders.n; P.frames(2, .016); P.HOST.camera.position.set(25, 0, 0); P.frames(1, .016);
 T.ok('...re-rendered when the camera has moved 20 m, not every frame', P.renders.n === n0 + 2, [n0, P.renders.n]);}

// ---------------------------------------------------------------- a page without the weather draws as now
T.neg('a page whose build lists no weather is unchanged: no binding, nothing added to the scene, the ground\'s hook untouched, the light its own', mk => {
  const P = mk(); P.frames(100);
  return P.W === null && P.HOST.scene.children.length === P.base.kids && P.names(P.MAT).length === 0 && P.MAT.onBeforeCompile === P.THREE.Material.prototype.onBeforeCompile &&
    P.HOST.scene.fog.density === P.base.fog && P.HOST.sun.intensity === P.base.sun && P.HOST.wx.queue.length === 0 && P.errs.length === 0;
}, () => page({ weather: false, src: mutate("const wxReady=()=>typeof ATMOS!=='undefined'&&", 'const wxReady=()=>true||') }), () => page({ weather: false }));
{let err = null, P = null; try { P = page({ atmos: false }); } catch (e) { err = e; }
 T.ok('...and a page with no core/atmos at all builds, its weather null', !err && P.W === null && P.errs.length === 0, err && err.message);}

// ---------------------------------------------------------------- the cloud shadows: only with the shared sky's clouds
const ALWAYS = mutate("const wxClouds=()=>typeof ATMOS!=='undefined'&&", 'const wxClouds=()=>true||');
const shaded = P => P.names(P.MAT).some(n => /^atmos-cloudshade-/.test(n));
T.neg('the ground takes cloudShade only where the shared sky\'s clouds are (this world\'s own sky has none: unchanged)', mk => {
  const no = mk(), sky = page({ sky: true });
  return !shaded(no) && shaded(sky) && no.errs.length === 0;
}, () => page({ src: ALWAYS }), () => page());
{const P = page({ sky: true }), leaf = new P.THREE.MeshLambertMaterial();if (P.HOST.shade) P.HOST.shade(leaf, { porosity: .4 });
 T.ok('a plant material asked for after the binding is shaded at once (the ground, asked for before, when it bound)', P.names(leaf).indexOf('atmos-cloudshade-0.4') >= 0 && shaded(P), P.names(leaf));}
T.neg('...never twice (a material, or a clone of one, that has its shade keeps its own), never an unlit one', mk => {
  const P = mk(), done = new P.THREE.MeshLambertMaterial(), basic = new P.THREE.MeshBasicMaterial(), leaf = new P.THREE.MeshLambertMaterial();
  P.A.cloudShade(done, { porosity: .4 }); P.HOST.shade(done, { porosity: .6 }); P.HOST.shade(basic, { porosity: .6 }); P.HOST.shade(leaf, { porosity: .6 });
  const clone = done.clone(); clone.onBeforeCompile = done.onBeforeCompile; P.HOST.shade(clone, { porosity: .6 });   /* 84's worldMat: a clone handed the composed hook */
  return P.names(leaf).indexOf('atmos-cloudshade-0.6') >= 0 && P.names(done).indexOf('atmos-cloudshade-0.6') < 0 && P.names(clone).indexOf('atmos-cloudshade-0.6') < 0 && P.names(basic).length === 0;
}, () => page({ sky: true, src: mutate('if(!wxClouds()||hasShade(m))return;', 'if(!wxClouds())return;') }), () => page({ sky: true }));

// ---------------------------------------------------------------- the callers
{const S98 = read('core', 'world', '98-world-start.js'), S81 = read('core', 'world', '81-world-terrain.js'), S84 = read('core', 'world', '84-world-nursery.js');
 const i = S98.indexOf('for(const f of LATE)f();'), j = S98.indexOf('HOST.weather()');
 T.ok('98 binds the weather once the LATE modules are laid out (ATMOS.init and the terrain\'s material before it), before the first frame', i >= 0 && j > i && j < S98.indexOf('requestAnimationFrame(frame)'), [i, j]);
 T.ok('81 asks for the ground\'s shade, 84 for every plant material the flora and the floor draw', /HOST\.shade\(MAT,/.test(S81) && /HOST\.shade\(w,/.test(S84));}
T.ok('every fault above is made from 45\'s own text (none is a page that merely failed to load)', FAULTS.length === 7 && FAULTS.every(f => HOST_SRC.indexOf(f) >= 0), FAULTS.filter(f => HOST_SRC.indexOf(f) < 0));
T.done();
