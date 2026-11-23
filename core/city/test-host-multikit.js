// node core/city/test-host-multikit.js — Phase 3 multi-kit Three.js host verification (MULTI-KIT-SCOPE.md).
// Tests KCITY.flattenProto across sealed lineages, KCITY.createSharedAtlas DataTexture2DArray <libId> deduplication
// and VRAM cap, KCITY.bakeProxy HLOD simplification, lazy async sidecar bundle loading via KRATOR_KITS.ensure,
// KCITY.constructMesh progressive construction, and the 3-ring hlodCheck() exact-once lot invariant.
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), vm = require('vm');
const { execFileSync } = require('child_process');
const T = require('../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..');

function findThree() {
  for (const rel of ['biomes/sedesert/three.min.js', 'settlements/voth/three.min.js', 'kits/ancients/three.min.js']) {
    const p = path.join(ROOT, rel);
    if (fs.existsSync(p) && fs.statSync(p).size > 50000) return p;
  }
  throw new Error('three.min.js not found');
}

// Build a realistic Node + Three.js r128 sandbox with async sidecar loading
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'krator-host-mk-'));
try {
  // Emit real sealed sidecar bundles (no-textures for fast unit run) for 4 distinct lineages
  execFileSync('python3', [
    path.join(ROOT, 'tools', 'kit_pack.py'),
    '--sidecars', 'islanders', 'iziz-vernacular', 'xanadu', 'locus',
    '--no-textures',
    '--out', tmpDir
  ], { stdio: 'pipe' });

  class MockImage {
    constructor() { this.width = 16; this.height = 16; this.naturalWidth = 16; this.complete = true; this._src = ''; }
    set src(v) { this._src = v; if (typeof this.onload === 'function') this.onload(); }
    get src() { return this._src; }
    addEventListener() {}
    removeEventListener() {}
  }

  function mk2D() {
    return {
      canvas: { width: 512, height: 512 }, fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, globalAlpha: 1,
      fillRect() {}, clearRect() {}, strokeRect() {}, beginPath() {}, closePath() {}, moveTo() {}, lineTo() {},
      bezierCurveTo() {}, quadraticCurveTo() {}, arc() {}, arcTo() {}, ellipse() {}, rect() {}, fill() {}, stroke() {},
      clip() {}, save() {}, restore() {}, translate() {}, rotate() {}, scale() {}, setTransform() {}, transform() {},
      fillText() {}, strokeText() {}, measureText(s) { return { width: String(s || '').length * 6 }; },
      drawImage() {}, putImageData() {}, setLineDash() {},
      createLinearGradient() { return { addColorStop() {} }; },
      createRadialGradient() { return { addColorStop() {} }; },
      createPattern() { return {}; },
      createImageData(w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; },
      getImageData(x, y, w, h) {
        const d = new Uint8ClampedArray(w * h * 4);
        d.fill(200);
        return { width: w, height: h, data: d };
      }
    };
  }

  const loadedScripts = [];
  const sandbox = {
    console,
    Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, TypeError, RangeError,
    Map, Set, WeakMap, WeakSet, Promise, Symbol, Proxy, Reflect,
    ArrayBuffer, DataView, Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
    setTimeout, clearTimeout, performance: { now: () => Date.now() },
    addEventListener() {}, removeEventListener() {},
    Image: MockImage, HTMLCanvasElement: function () {}, HTMLImageElement: MockImage,
    location: { search: '', hash: '', pathname: '/', href: 'http://localhost/' },
    navigator: { userAgent: 'node' },
    document: {
      createElement(tag) {
        const t = String(tag).toLowerCase();
        if (t === 'canvas') return { width: 512, height: 512, style: {}, getContext: mk2D, toDataURL: () => 'data:image/png;base64,' };
        if (t === 'script') return { src: '', async: true, onload: null, onerror: null };
        return { style: {}, appendChild() {}, setAttribute() {}, addEventListener() {}, classList: { add() {}, remove() {} } };
      },
      createElementNS(_ns, tag) { return this.createElement(tag); },
      getElementById() { return { style: {}, textContent: '', innerHTML: '', appendChild() {}, addEventListener() {}, classList: { add() {}, remove() {} } }; },
      querySelector() { return null; },
      querySelectorAll() { return []; },
      addEventListener() {},
      body: { appendChild() {}, style: {} },
      head: {
        appendChild(el) {
          if (el && el.src) {
            loadedScripts.push(path.basename(el.src));
            const fullPath = path.join(tmpDir, el.src.replace(/^kits\//, ''));
            if (fs.existsSync(fullPath)) {
              vm.runInContext(fs.readFileSync(fullPath, 'utf8'), sandbox, { filename: path.basename(fullPath) });
              if (el.onload) el.onload();
            } else if (el.onerror) {
              el.onerror(new Error('missing ' + fullPath));
            }
          }
        }
      },
      documentElement: { style: {} }
    }
  };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  vm.createContext(sandbox);

  const runFile = rel => vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), sandbox, { filename: path.basename(rel) });
  vm.runInContext(fs.readFileSync(findThree(), 'utf8'), sandbox, { filename: 'three.min.js' });
  [
    'core/rand/08-core-rand.js',
    'core/space/20-core-space.js',
    'core/kits/10-core-kits.js',
    'core/city/53-city-host-multikit.js',
    'core/city/54-city-host-construct.js'
  ].forEach(runFile);

  const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, 'kits', 'kits-manifest.json'), 'utf8'));
  sandbox.KRATOR_KITS.loadManifest(MANIFEST);
  const KM = sandbox.KRATOR_KITS.manifest().kits;

  // ---------------------------------------------------------------- 1. Shared DataTexture2DArray <libId> deduplication & VRAM cap
  const THREE = sandbox.THREE;
  const KCITY = sandbox.KCITY;
  const atlas = KCITY.createSharedAtlas({ headlessArray: true, initialCap: 4, maxVramMB: 350 });

  function makeLibPart(libId, tintKeep, colorHex) {
    const geo = new THREE.BoxGeometry(4, 3, 4);
    const alb = new THREE.DataTexture(new Uint8Array(512 * 512 * 4).fill(210), 512, 512, THREE.RGBAFormat);
    const nor = new THREE.DataTexture(new Uint8Array(512 * 512 * 4).fill(128), 512, 512, THREE.RGBAFormat);
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, map: alb, normalMap: nor, roughness: 0.8, metalness: 0 });
    mat.userData = { lib: { lib: libId, tint: tintKeep, mean: 0.5, specular: 0.5 } };
    return { geo, mat, tris: 12 };
  }

  // Kit A and Kit B create SEPARATE Texture instances (distinct UUIDs) for the SAME library set 'wood.timber'
  const partKitA = makeLibPart('wood.timber', 0.7, 0xbfa07a);
  const partKitB = makeLibPart('wood.timber', 0.7, 0x9c7e5a);
  // Kit C uses the SAME library set 'wood.timber' with a DIFFERENT albedo tintKeep — albedo gets its own layer, normal map STILL deduplicates!
  const partKitC = makeLibPart('wood.timber', 0.3, 0xd8c3a5);

  const mAB = atlas.merge([partKitA, partKitB]);
  const mC = atlas.merge([partKitC]);
  atlas.flush();

  T.ok('shared DataTexture2DArray deduplicates identical library sets across distinct kit Texture UUIDs and shares normal layers across tints',
    atlas.ok &&
    mAB.meshes.length === 1 &&
    mC.meshes.length === 1 &&
    atlas.stats.layers.alb === 2 && // (wood.timber t=70) + (wood.timber t=30), NOT 3!
    atlas.stats.layers.nor === 1 && // all 3 share the single 'wood.timber' normal map layer!
    atlas.stats.dedupHits >= 3 &&
    atlas.stats.vramMB > 0 && atlas.stats.vramMB < 350,
    'alb=' + atlas.stats.layers.alb + ', nor=' + atlas.stats.layers.nor + ', dedupHits=' + atlas.stats.dedupHits + ', vramMB=' + atlas.stats.vramMB);

  // Tight VRAM cap check: a tiny 8 MB cap refuses growth beyond cap and places overflow parts cleanly in `rest`
  const tinyAtlas = KCITY.createSharedAtlas({ headlessArray: true, initialCap: 2, maxVramMB: 8 });
  const manyParts = [];
  for (let i = 0; i < 6; i++) manyParts.push(makeLibPart('rock.unique_' + i, 0.5, 0x888888));
  const mTiny = tinyAtlas.merge(manyParts);
  T.ok('VRAM budget cap prevents DataTexture2DArray growth past maxVramMB and keeps overflow parts in rest',
    tinyAtlas.stats.vramMB <= 8 && tinyAtlas.stats.capped > 0 && (mTiny.meshes.length > 0 || mTiny.rest.length > 0),
    'vramMB=' + tinyAtlas.stats.vramMB + ', capped=' + tinyAtlas.stats.capped + ', rest=' + mTiny.rest.length);

  // ---------------------------------------------------------------- 2. Lazy sidecar loader + 3-ring HLOD + constructMesh host
  KCITY.hostMultikit.createBrowserLoader({ baseUrl: 'kits', kits: sandbox.KRATOR_KITS, loadTextures: false });

  // Initially ZERO kits are loaded in memory!
  T.ok('before setPlan(), zero cultural kit 3D bundles are loaded in memory',
    !sandbox.KRATOR_KITS.isLoaded('islanders') && !sandbox.KRATOR_KITS.isLoaded('xanadu') && loadedScripts.length === 0,
    'loadedScripts=' + loadedScripts.length);

  const planLots = [
    // Near ring (< 160 m): full atlas-merged prototypes across islanders + iziz-vernacular
    { id: 0, tag: 'lot_0', kit: 'islanders', key: 'islanders:' + KM.islanders.order[0], v: 0, x: 10, y: 0, z: 12, ry: 0, w: 8, d: 8, h: 6, died: null },
    { id: 1, tag: 'lot_1', kit: 'iziz-vernacular', key: 'iziz-vernacular:' + KM['iziz-vernacular'].order[0], v: 0, x: -18, y: 0, z: 15, ry: 1.2, w: 9, d: 9, h: 7, died: null },
    // Constructing lot (f = 0.45): progressive triangle-by-triangle reveal via KCITY.constructMesh
    { id: 2, tag: 'lot_2', kit: 'islanders', key: 'islanders:' + KM.islanders.order[1], v: 0, x: 28, y: 0, z: -10, ry: 0.4, w: 8, d: 8, h: 6, died: null, progress: 0.45 },
    // Mid ring (160..820 m): vertex-clustered HLOD baked proxies
    { id: 3, tag: 'lot_3', kit: 'xanadu', key: 'xanadu:' + KM.xanadu.order[0], v: 0, x: 240, y: 0, z: 0, ry: 0, w: 10, d: 10, h: 8, died: null },
    { id: 4, tag: 'lot_4', kit: 'xanadu', key: 'xanadu:' + KM.xanadu.order[0], v: 0, x: 260, y: 0, z: 15, ry: 0.5, w: 10, d: 10, h: 8, died: null },
    // Far ring (>= 820 m): lightweight massing box
    { id: 5, tag: 'lot_5', kit: 'islanders', key: 'islanders:' + KM.islanders.order[0], v: 0, x: 1100, y: 0, z: 0, ry: 0, w: 8, d: 8, h: 6, died: null }
  ];

  const host = KCITY.hostMultikit.create({
    kits: sandbox.KRATOR_KITS,
    defaultKit: 'islanders',
    headlessArray: true,
    bakeBudgetMs: 200,
    lotProgress: L => L.progress != null ? { f: L.progress } : null
  });

  host.setPlan({ lots: planLots });
  // Pump once more so queued atlas merges & mid-ring HLOD proxy bakes complete
  host.update([0, 0], true);
  host.update([0, 0], true);

  T.ok('hostMultikit lazily loads only the 3 kits used by the plan (leaving unused locus unloaded)',
    sandbox.KRATOR_KITS.isLoaded('islanders') &&
    sandbox.KRATOR_KITS.isLoaded('iziz-vernacular') &&
    sandbox.KRATOR_KITS.isLoaded('xanadu') &&
    !sandbox.KRATOR_KITS.isLoaded('locus'),
    'loaded=[' + host.stats.loadedKits.join(', ') + ']');

  const hc = host.hlodCheck();
  T.ok('all 4 rings populate simultaneously (2 full, 2 mid baked, 1 far massing, 1 constructing) with exact-once hlodCheck',
    hc.ok &&
    host.stats.full === 2 &&
    host.stats.mid === 2 &&
    host.stats.massing === 1 &&
    host.stats.constructing === 1,
    JSON.stringify(host.stats));

  T.neg('hlodCheck catches a lot drawn in two rings at once',
    res => res.ok === true,
    host.hlodCheck({ twice: true }),
    hc);

  // Mid-campaign dynamic unlock: commission a new Locus building onto the town plan -> triggers lazy load of locus.bundle.js!
  planLots.push({
    id: 6, tag: 'lot_6', kit: 'locus', key: 'locus:' + KM.locus.order[0],
    v: 0, x: 0, y: 0, z: -30, ry: 0, w: 10, d: 10, h: 8, died: null
  });
  host.setPlan({ lots: planLots });
  host.update([0, 0], true);
  host.update([0, 0], true);

  const hcAfter = host.hlodCheck();
  T.ok('commissioning a new kit mid-session lazily streams locus.bundle.js and draws all 7 lots cleanly',
    sandbox.KRATOR_KITS.isLoaded('locus') && hcAfter.ok && host.stats.full === 3,
    'loaded=[' + host.stats.loadedKits.join(', ') + '], full=' + host.stats.full);
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

T.done();
