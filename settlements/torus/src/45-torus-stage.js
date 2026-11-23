// ================================================================= TORUS — 45: Stage, Living Terrace Farms, Z-Clean Streets & PBR Helpers ([web])
// Creates renderer, scene, dynamic-near camera, 100% PBR-textured materials, 10-level earthen/fieldstone contour terrace farms
// ("terrace farms, with built-over portions"), zero-overlap stitched roads, Tors Rivrh channel, and Scrap Voth Customs Wall.

const TORUS_SEED = 20261118;
const TORUS_PLAN = TORUS.buildCityPlan(TORUS_SEED);
const TORUS_STAGE4 = TORUS.buildStage4Plans(TORUS_PLAN);

const TORUS_EXCAVATIONS = (function () {
  const specs = [
    { id: 'lm_boardhall', x0: -32.2, x1: 32.2, z0: -25.2, z1: 21.2, depth: 4.2 },
    { id: 'lm_emissary', x0: -34.2, x1: 34.2, z0: -26.2, z1: 22.2, depth: 4.2 },
    { id: 'lm_ordinators', x0: -32.2, x1: 32.2, z0: -25.2, z1: 21.2, depth: 4.2 }
  ];
  const out = [];
  for (let i = 0; i < specs.length; i++) {
    const sp = specs[i];
    const lm = TORUS_PLAN.landmarks.find(function (l) { return l.id === sp.id; });
    if (!lm) continue;
    out.push({
      id: sp.id, lm: lm, c: Math.cos(lm.ry), s: Math.sin(lm.ry),
      x0: sp.x0, x1: sp.x1, z0: sp.z0, z1: sp.z1, depth: sp.depth
    });
  }
  return out;
})();

function torusExcavationAt(x, z, pad) {
  const p = pad == null ? 0 : pad;
  for (let i = 0; i < TORUS_EXCAVATIONS.length; i++) {
    const ex = TORUS_EXCAVATIONS[i];
    const dx = x - ex.lm.x, dz = z - ex.lm.z;
    const lx = dx * ex.c - dz * ex.s;
    const lz = dx * ex.s + dz * ex.c;
    if (lx >= ex.x0 - p && lx <= ex.x1 + p && lz >= ex.z0 - p && lz <= ex.z1 + p) return ex;
  }
  return null;
}

function torusGroundAt(x, z) {
  const ex = torusExcavationAt(x, z, 0);
  if (ex) return +(ex.lm.y - ex.depth).toFixed(2);
  return TORUS.groundAt(x, z);
}

const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio == null ? 1 : window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.04;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xc3cab8, 0.00010);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.2, 28000);

// Dynamic near/far plane scaling eliminates 24-bit depth quantization Z-fighting in high overview shots while keeping close/walk views crisp
function torusSyncCameraDepth() {
  const walking = !!(window.KHOST && KHOST.cam && KHOST.cam.ctl && KHOST.cam.ctl.walk);
  let targetNear = 0.60;
  let targetFar = 18000;
  if (!walking) {
    let dist = camera.position.length();
    if (window.KHOST && KHOST.cam && KHOST.cam.ctl && KHOST.cam.ctl.radius > 0) {
      dist = KHOST.cam.ctl.radius;
    }
    if (dist > 700) {
      targetNear = Math.min(9.0, Math.max(2.6, dist * 0.0042));
      targetFar = Math.max(20000, dist * 7.5);
    } else if (dist > 220) {
      targetNear = 1.6;
      targetFar = 18000;
    } else {
      targetNear = 0.68;
      targetFar = 16000;
    }
  }
  if (Math.abs(camera.near - targetNear) > 0.08 || Math.abs(camera.far - targetFar) > 400) {
    camera.near = targetNear;
    camera.far = targetFar;
    camera.updateProjectionMatrix();
  }
}

const hemi = new THREE.HemisphereLight(0xdde6da, 0x56523c, 0.64);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2da, 1.34);
sun.position.set(-2800, 3800, -1900);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xbfd4ec, 0.27);
fill.position.set(2200, 1600, 2400);
scene.add(fill);
let NIGHT = false;

const TORUS_DRAW = (function () {
  function stdMat(o) {
    const base = { roughness: 0.84, metalness: 0.04, side: THREE.DoubleSide };
    return new THREE.MeshStandardMaterial(Object.assign(base, o));
  }

  // 1. Tactile wood/woven/brushed-metal grain maps for furniture, trim & metallic surfaces
  let _furnMaps = null;
  function getFurnDetailMaps() {
    if (_furnMaps) return _furnMaps;
    const S = 128;
    const data = new Uint8Array(S * S * 4);
    const rgh = new Uint8Array(S * S * 4);
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4;
        const streak = KRAND.fbm(x / 26.0, y / 4.5, 11.7, 3, 9103);
        const weave = ((x + y) & 3) === 0 ? -0.035 : 0.015;
        const pore = KRAND.fbm(x / 5.0, y / 5.0, 3.1, 2, 9109) - 0.5;
        const joint = (y % 16 === 0) ? -0.10 : 0.0;
        const v = Math.max(185, Math.min(255, Math.round(236 + (streak - 0.5) * 34 + pore * 18 + (weave + joint) * 255)));
        const rv = Math.max(110, Math.min(250, Math.round(198 - (streak - 0.5) * 52 + pore * 30)));
        data[i] = v; data[i + 1] = v; data[i + 2] = Math.max(175, v - 4); data[i + 3] = 255;
        rgh[i] = rv; rgh[i + 1] = rv; rgh[i + 2] = rv; rgh[i + 3] = 255;
      }
    }
    const map = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.encoding = THREE.sRGBEncoding;
    map.needsUpdate = true;
    const roughMap = new THREE.DataTexture(rgh, S, S, THREE.RGBAFormat);
    roughMap.wrapS = roughMap.wrapT = THREE.RepeatWrapping;
    roughMap.needsUpdate = true;
    _furnMaps = { map: map, roughnessMap: roughMap };
    return _furnMaps;
  }

  // 2. Running-bond stone flagstone & cobble paving maps
  let _paveMaps = null;
  function getPavingMaps() {
    if (_paveMaps) return _paveMaps;
    const S = 256;
    const data = new Uint8Array(S * S * 4);
    const rgh = new Uint8Array(S * S * 4);
    for (let y = 0; y < S; y++) {
      const row = Math.floor(y / 32);
      const fy = y % 32;
      const xOff = (row % 2) * 32;
      for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4;
        const fx = (x + xOff) % 64;
        const cellX = Math.floor((x + xOff) / 64);
        const joint = (fx < 3 || fy < 3);
        const stoneTone = ((KRAND.hash(9201, cellX, row) % 100) / 100.0 - 0.5) * 34.0;
        const grit = (KRAND.fbm(x / 7.0, y / 7.0, 5.2, 2, 9209) - 0.5) * 26.0;
        let v = joint ? (138 + grit * 0.5) : (214 + stoneTone + grit);
        if (!joint && (fx < 5 || fy < 5)) v -= 14;
        v = Math.max(95, Math.min(252, Math.round(v)));
        const rv = joint ? 246 : Math.max(135, Math.min(240, Math.round(202 - stoneTone * 0.7 + grit)));
        data[i] = v; data[i + 1] = Math.max(90, v - 3); data[i + 2] = Math.max(85, v - 8); data[i + 3] = 255;
        rgh[i] = rv; rgh[i + 1] = rv; rgh[i + 2] = rv; rgh[i + 3] = 255;
      }
    }
    const map = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.encoding = THREE.sRGBEncoding;
    map.needsUpdate = true;
    const roughMap = new THREE.DataTexture(rgh, S, S, THREE.RGBAFormat);
    roughMap.wrapS = roughMap.wrapT = THREE.RepeatWrapping;
    roughMap.needsUpdate = true;
    _paveMaps = { map: map, roughnessMap: roughMap };
    return _paveMaps;
  }

  // 3. Ploughed contour agricultural soil furrows & irrigated tilth maps
  let _furrowMaps = null;
  function getFurrowMaps() {
    if (_furrowMaps) return _furrowMaps;
    const S = 256;
    const data = new Uint8Array(S * S * 4);
    const rgh = new Uint8Array(S * S * 4);
    for (let y = 0; y < S; y++) {
      const ridge = Math.sin((y / 16.0) * Math.PI * 2.0);
      for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4;
        const clod = (KRAND.fbm(x / 6.5, y / 6.5, 8.4, 3, 9311) - 0.5) * 44.0;
        const patch = (KRAND.fbm(x / 38.0, y / 38.0, 2.1, 2, 9319) - 0.5) * 28.0;
        const v = Math.max(105, Math.min(250, Math.round(196 + ridge * 26 + clod + patch)));
        const grn = ridge > 0.25 ? 8 : -4;
        const rv = Math.max(165, Math.min(252, Math.round(226 - ridge * 18 + clod * 0.5)));
        data[i] = Math.max(95, v - 6);
        data[i + 1] = Math.min(252, v + grn);
        data[i + 2] = Math.max(80, v - 22);
        data[i + 3] = 255;
        rgh[i] = rv; rgh[i + 1] = rv; rgh[i + 2] = rv; rgh[i + 3] = 255;
      }
    }
    const map = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.encoding = THREE.sRGBEncoding;
    map.needsUpdate = true;
    const roughMap = new THREE.DataTexture(rgh, S, S, THREE.RGBAFormat);
    roughMap.wrapS = roughMap.wrapT = THREE.RepeatWrapping;
    roughMap.needsUpdate = true;
    _furrowMaps = { map: map, roughnessMap: roughMap };
    return _furrowMaps;
  }

  // 4. Coursed Cyclopean dry-stone agricultural terrace retaining wall maps
  let _stoneWallMaps = null;
  function getFieldstoneMaps() {
    if (_stoneWallMaps) return _stoneWallMaps;
    const S = 256;
    const data = new Uint8Array(S * S * 4);
    const rgh = new Uint8Array(S * S * 4);
    for (let y = 0; y < S; y++) {
      const course = Math.floor(y / 28);
      const cy = y % 28;
      const stag = (course % 2) * 26 + (course % 3) * 11;
      for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4;
        const wob = Math.round((KRAND.fbm(x / 18.0, y / 18.0, 4.7, 2, 9413) - 0.5) * 7.0);
        const cx = (x + stag + wob + S) % 52;
        const blockId = Math.floor((x + stag + wob + S) / 52);
        const mortar = (cy < 3 || cx < 3);
        const moss = (!mortar && cy > 21 && KRAND.fbm(x / 14.0, y / 14.0, 9.2, 2, 9421) > 0.58);
        const bTone = ((KRAND.hash(9431, blockId, course) % 100) / 100.0 - 0.5) * 42.0;
        const grain = (KRAND.fbm(x / 5.0, y / 5.0, 1.9, 2, 9437) - 0.5) * 24.0;
        let r = mortar ? 112 : Math.round(188 + bTone + grain);
        let g = mortar ? 114 : Math.round(184 + bTone + grain);
        let b = mortar ? 104 : Math.round(168 + bTone + grain);
        if (moss) { r = Math.round(r * 0.68); g = Math.round(g * 0.88 + 18); b = Math.round(b * 0.62); }
        data[i] = Math.max(70, Math.min(248, r));
        data[i + 1] = Math.max(74, Math.min(248, g));
        data[i + 2] = Math.max(64, Math.min(242, b));
        data[i + 3] = 255;
        const rv = mortar ? 248 : Math.max(150, Math.min(244, Math.round(212 - bTone * 0.5)));
        rgh[i] = rv; rgh[i + 1] = rv; rgh[i + 2] = rv; rgh[i + 3] = 255;
      }
    }
    const map = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.encoding = THREE.sRGBEncoding;
    map.needsUpdate = true;
    const roughMap = new THREE.DataTexture(rgh, S, S, THREE.RGBAFormat);
    roughMap.wrapS = roughMap.wrapT = THREE.RepeatWrapping;
    roughMap.needsUpdate = true;
    _stoneWallMaps = { map: map, roughnessMap: roughMap };
    return _stoneWallMaps;
  }

  const MATS = {
    ancientStone: stdMat({ color: 0xcbc6b8, roughness: 0.78, metalness: 0.05 }),
    ancientDark: stdMat({ color: 0x767268, roughness: 0.82, metalness: 0.06 }),
    soleriWall: stdMat({ color: 0xd6d1c3, roughness: 0.76, metalness: 0.04 }),
    soleriRuined: stdMat({ color: 0x9b9588, roughness: 0.88, metalness: 0.04 }),
    basalt: stdMat({ color: 0x423f3b, roughness: 0.88, metalness: 0.06 }),
    ashStone: stdMat({ color: 0x968f7f, roughness: 0.84, metalness: 0.04 }),
    porphyry: stdMat({ color: 0x762939, roughness: 0.72, metalness: 0.08 }),
    gold: stdMat({ color: 0xd8aa3e, roughness: 0.30, metalness: 0.84 }),
    bronze: stdMat({ color: 0xa8813e, roughness: 0.42, metalness: 0.72 }),
    tankSteel: stdMat({ color: 0x687076, roughness: 0.56, metalness: 0.56 }),
    rustPlate: stdMat({ color: 0x88543a, roughness: 0.84, metalness: 0.40 }),
    verdigris: stdMat({ color: 0x5c8a74, roughness: 0.60, metalness: 0.25 }),
    timber: stdMat({ color: 0x6e543a, roughness: 0.88, metalness: 0.02 }),
    canvas: stdMat({ color: 0xcbbba0, roughness: 0.92, metalness: 0.0 }),
    floorTile: stdMat({ color: 0xa29a8a, roughness: 0.80, metalness: 0.04 }),
    ceilingSoffit: stdMat({ color: 0xb6afa2, roughness: 0.86, metalness: 0.03 }),
    roofDeck: stdMat({ color: 0x5a636a, roughness: 0.60, metalness: 0.48 }),
    windowPane: stdMat({ color: 0x26343e, roughness: 0.16, metalness: 0.64, emissive: 0x42301a, emissiveIntensity: 0.42 }),
    windowLit: stdMat({ color: 0xffd48c, roughness: 0.24, metalness: 0.10, emissive: 0xffb85c, emissiveIntensity: 0.82 }),
    domeGlass: new THREE.MeshStandardMaterial({ color: 0x9ed4d8, roughness: 0.12, metalness: 0.16, transparent: true, opacity: 0.46, depthWrite: false, side: THREE.DoubleSide }),
    amberGlass: new THREE.MeshStandardMaterial({ color: 0xe6b85c, roughness: 0.14, metalness: 0.18, transparent: true, opacity: 0.52, depthWrite: false, side: THREE.DoubleSide }),
    // Living agricultural terrace materials ("terrace farms, with built-over portions")
    terraceLoam: stdMat({ color: 0x6b5c42, roughness: 0.95, metalness: 0.0, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 }),
    terracePasture: stdMat({ color: 0x58723f, roughness: 0.93, metalness: 0.0, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 }),
    terraceOrchardLoam: stdMat({ color: 0x626e42, roughness: 0.94, metalness: 0.0, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 }),
    terraceGrainTilth: stdMat({ color: 0x867448, roughness: 0.94, metalness: 0.0, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 }),
    fieldstoneWall: stdMat({ color: 0x7d786b, roughness: 0.90, metalness: 0.03 }),
    builtApron: stdMat({ color: 0x928a7a, roughness: 0.85, metalness: 0.03, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 2 }),
    lotPlinth: stdMat({ color: 0x7b7568, roughness: 0.88, metalness: 0.04, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    roadStone: stdMat({ color: 0x888173, roughness: 0.88, metalness: 0.03, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    farmTrack: stdMat({ color: 0x7c6c52, roughness: 0.94, metalness: 0.01, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    cropHerb: stdMat({ color: 0x547044, roughness: 0.93, metalness: 0.0 }),
    cropGrain: stdMat({ color: 0x9c8848, roughness: 0.93, metalness: 0.0 }),
    cropOrchard: stdMat({ color: 0x4f6d3a, roughness: 0.92, metalness: 0.0 }),
    terrain: new THREE.MeshStandardMaterial({
      color: 0xffffff, vertexColors: true, roughness: 0.95, metalness: 0.0,
      polygonOffset: true, polygonOffsetFactor: 3, polygonOffsetUnits: 3
    }),
    warmGlow: new THREE.MeshBasicMaterial({ color: 0xffd282, side: THREE.DoubleSide }),
    water: new THREE.MeshStandardMaterial({ color: 0x2f5662, roughness: 0.15, metalness: 0.38, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })
  };

  function bindPbrMats() {
    const pm = getPavingMaps();
    const fur = getFurrowMaps();
    const fsw = getFieldstoneMaps();
    const fm = getFurnDetailMaps();

    if (typeof MAT !== 'undefined' && MAT) {
      const pairs = [
        ['ancientStone', 'white', 0xcbc6b8],
        ['ancientDark', 'concreteR', 0x78746a],
        ['soleriWall', 'white', 0xd6d1c3],
        ['soleriRuined', 'concreteR', 0x9b9588],
        ['basalt', 'concreteR', 0x48443f],
        ['ashStone', 'concrete', 0x9c9586],
        ['porphyry', 'brick', 0x7c2d3d],
        ['rustPlate', 'rust', 0x965e42],
        ['tankSteel', 'corrugate', 0x768088],
        ['verdigris', 'verdigris', 0x6a9680],
        ['timber', 'timber', 0x7e6144],
        ['canvas', 'tarp', 0xcfc0a2],
        ['ceilingSoffit', 'concrete', 0xbab3a6],
        ['roofDeck', 'corrugate', 0x626b72]
      ];
      for (let i = 0; i < pairs.length; i++) {
        const dst = MATS[pairs[i][0]];
        const src = MAT[pairs[i][1]] || MAT.concrete;
        if (!dst || !src) continue;
        if (src.map) dst.map = src.map;
        if (src.normalMap) {
          dst.normalMap = src.normalMap;
          dst.normalScale = src.normalScale ? src.normalScale.clone() : new THREE.Vector2(1, 1);
        }
        if (src.roughnessMap) {
          dst.roughnessMap = src.roughnessMap;
          dst.roughness = 0.90;
        }
        dst.color.setHex(pairs[i][2]);
        if (typeof dst.color.convertSRGBToLinear === 'function') dst.color.convertSRGBToLinear();
        dst.needsUpdate = true;
      }
    }

    // Bind flagstone/cobble paving maps
    const paveSpecs = [
      ['floorTile', 0xa69e8e],
      ['roadStone', 0x8e8678],
      ['builtApron', 0x9a9282],
      ['farmTrack', 0x827258]
    ];
    for (let pi = 0; pi < paveSpecs.length; pi++) {
      const m = MATS[paveSpecs[pi][0]];
      if (!m) continue;
      m.map = pm.map;
      m.roughnessMap = pm.roughnessMap;
      m.bumpMap = pm.roughnessMap;
      m.bumpScale = 0.024;
      if (typeof MAT !== 'undefined' && MAT && MAT.concrete && MAT.concrete.normalMap) {
        m.normalMap = MAT.concrete.normalMap;
        m.normalScale = new THREE.Vector2(0.55, 0.55);
      }
      m.color.setHex(paveSpecs[pi][1]);
      if (typeof m.color.convertSRGBToLinear === 'function') m.color.convertSRGBToLinear();
      m.needsUpdate = true;
    }

    // Bind furrowed soil & irrigated pasture maps onto agricultural terrace benches & dome beds
    const soilSpecs = [
      ['terraceLoam', 0x7c6a4c],
      ['terracePasture', 0x68864c],
      ['terraceOrchardLoam', 0x707e4c],
      ['terraceGrainTilth', 0x968252],
      ['cropHerb', 0x5c7a4a],
      ['cropGrain', 0xa69050],
      ['cropOrchard', 0x587842]
    ];
    for (let si = 0; si < soilSpecs.length; si++) {
      const m = MATS[soilSpecs[si][0]];
      if (!m) continue;
      m.map = fur.map;
      m.roughnessMap = fur.roughnessMap;
      m.bumpMap = fur.roughnessMap;
      m.bumpScale = 0.032;
      if (typeof MAT !== 'undefined' && MAT && MAT.rubbleK && MAT.rubbleK.normalMap) {
        m.normalMap = MAT.rubbleK.normalMap;
        m.normalScale = new THREE.Vector2(0.75, 0.75);
      }
      m.color.setHex(soilSpecs[si][1]);
      if (typeof m.color.convertSRGBToLinear === 'function') m.color.convertSRGBToLinear();
      m.needsUpdate = true;
    }

    // Bind dry-stone Cyclopean retaining masonry maps onto terrace risers & lot plinths
    ['fieldstoneWall', 'lotPlinth'].forEach(function (wk, idx) {
      const m = MATS[wk];
      if (!m) return;
      m.map = fsw.map;
      m.roughnessMap = fsw.roughnessMap;
      m.bumpMap = fsw.roughnessMap;
      m.bumpScale = 0.035;
      if (typeof MAT !== 'undefined' && MAT && MAT.concreteR && MAT.concreteR.normalMap) {
        m.normalMap = MAT.concreteR.normalMap;
        m.normalScale = new THREE.Vector2(0.85, 0.85);
      }
      m.color.setHex(idx === 0 ? 0x8a8476 : 0x847e70);
      if (typeof m.color.convertSRGBToLinear === 'function') m.color.convertSRGBToLinear();
      m.needsUpdate = true;
    });

    // Bind PBR grit onto hinterland terrain + metallic detail onto gold/bronze/windows/water
    if (MATS.terrain) {
      MATS.terrain.map = fur.map;
      MATS.terrain.roughnessMap = fur.roughnessMap;
      if (typeof MAT !== 'undefined' && MAT && MAT.rubbleK && MAT.rubbleK.normalMap) {
        MATS.terrain.normalMap = MAT.rubbleK.normalMap;
        MATS.terrain.normalScale = new THREE.Vector2(0.75, 0.75);
      }
      MATS.terrain.needsUpdate = true;
    }
    ['gold', 'bronze', 'windowPane', 'windowLit'].forEach(function (mk) {
      const m = MATS[mk];
      if (!m) return;
      m.map = fm.map;
      m.roughnessMap = fm.roughnessMap;
      if (typeof m.color.convertSRGBToLinear === 'function') m.color.convertSRGBToLinear();
      m.needsUpdate = true;
    });
    if (MATS.water) {
      MATS.water.map = fm.map;
      MATS.water.roughnessMap = fm.roughnessMap;
      if (typeof MATS.water.color.convertSRGBToLinear === 'function') MATS.water.color.convertSRGBToLinear();
      MATS.water.needsUpdate = true;
    }
  }

  function bakeGeo(geo, m4, keepOrigUv, uvTile) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.applyMatrix4(m4);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!keepOrigUv || !g.attributes.uv) {
      const tile = uvTile == null ? 6.0 : uvTile;
      const p = g.attributes.position, n = g.attributes.normal;
      const uv = new Float32Array(p.count * 2);
      for (let i = 0; i < p.count; i++) {
        const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
        if (ay >= ax && ay >= az) { uv[i * 2] = p.getX(i) / tile; uv[i * 2 + 1] = p.getZ(i) / tile; }
        else if (ax >= az) { uv[i * 2] = p.getZ(i) / tile; uv[i * 2 + 1] = p.getY(i) / tile; }
        else { uv[i * 2] = p.getX(i) / tile; uv[i * 2 + 1] = p.getY(i) / tile; }
      }
      g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    }
    return g;
  }

  function mergeGeoList(geos) {
    if (!geos || !geos.length) return null;
    let total = 0;
    let hasCol = false;
    let hasUv = false;
    for (let i = 0; i < geos.length; i++) {
      if (!geos[i] || !geos[i].attributes || !geos[i].attributes.position) continue;
      total += geos[i].attributes.position.count;
      if (geos[i].attributes.color) hasCol = true;
      if (geos[i].attributes.uv) hasUv = true;
    }
    if (total === 0) return null;
    const pos = new Float32Array(total * 3);
    const nrm = new Float32Array(total * 3);
    const uv = hasUv ? new Float32Array(total * 2) : null;
    const col = hasCol ? new Float32Array(total * 3) : null;
    let off = 0;
    for (let i = 0; i < geos.length; i++) {
      const g = geos[i];
      if (!g || !g.attributes || !g.attributes.position) continue;
      const p = g.attributes.position.array;
      const n = g.attributes.normal ? g.attributes.normal.array : null;
      const u = g.attributes.uv ? g.attributes.uv.array : null;
      const c = g.attributes.color ? g.attributes.color.array : null;
      const cnt = g.attributes.position.count;
      pos.set(p, off * 3);
      if (n && n.length === cnt * 3) nrm.set(n, off * 3);
      if (uv && u && u.length >= cnt * 2) {
        for (let k = 0; k < cnt * 2; k++) uv[off * 2 + k] = u[k];
      }
      if (col) {
        if (c && c.length >= cnt * 3) {
          for (let k = 0; k < cnt * 3; k++) col[off * 3 + k] = c[k];
        } else {
          col.fill(1.0, off * 3, (off + cnt) * 3);
        }
      }
      off += cnt;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    if (uv) out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    if (col) out.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return out;
  }

  function extractProtoParts(rootObj) {
    rootObj.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(rootObj.matrixWorld).invert();
    const parts = [];
    rootObj.traverse(function (o) {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
      if (Array.isArray(o.material)) return;
      const m4 = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
      if (o.isInstancedMesh) {
        const im4 = new THREE.Matrix4();
        const cm4 = new THREE.Matrix4();
        for (let i = 0; i < o.count; i++) {
          o.getMatrixAt(i, im4);
          cm4.multiplyMatrices(m4, im4);
          parts.push({ geo: bakeGeo(o.geometry, cm4, true, 4.0), mat: o.material });
        }
      } else {
        parts.push({ geo: bakeGeo(o.geometry, m4, true, 6.0), mat: o.material });
      }
    });
    return parts;
  }

  function mergePlacedPrototypes(placements, protoPartsMap, parentGroup, label) {
    const byMat = new Map();
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler(0, 0, 0, 'YXZ');
    const s = new THREE.Vector3(1, 1, 1);
    const v = new THREE.Vector3();
    for (let i = 0; i < placements.length; i++) {
      const pl = placements[i];
      const parts = protoPartsMap.get(pl.protoKey);
      if (!parts) continue;
      e.set(pl.rx == null ? 0 : pl.rx, pl.ry == null ? 0 : pl.ry, pl.rz == null ? 0 : pl.rz);
      q.setFromEuler(e);
      const sc = pl.scale == null ? 1 : pl.scale;
      s.set(sc, sc, sc);
      v.set(pl.x, pl.y == null ? 0 : pl.y, pl.z);
      m4.compose(v, q, s);
      for (let j = 0; j < parts.length; j++) {
        const pt = parts[j];
        let bucket = byMat.get(pt.mat);
        if (!bucket) { bucket = []; byMat.set(pt.mat, bucket); }
        bucket.push(bakeGeo(pt.geo, m4, true, 6.0));
      }
    }
    let meshes = 0;
    byMat.forEach(function (geos, mat) {
      const mg = mergeGeoList(geos);
      if (!mg) return;
      const mesh = new THREE.Mesh(mg, mat);
      mesh.name = label + '_' + meshes;
      parentGroup.add(mesh);
      meshes++;
    });
    return meshes;
  }

  function pruneArcologySkirt(holder, keepRadius, maxPruneY) {
    holder.updateMatrixWorld(true);
    const r2 = keepRadius * keepRadius;
    const toRemove = [];
    const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3();
    const m4 = new THREE.Matrix4();
    holder.traverse(function (o) {
      if (o.isInstancedMesh) {
        const count = o.count;
        let write = 0;
        for (let i = 0; i < count; i++) {
          o.getMatrixAt(i, m4);
          vA.setFromMatrixPosition(m4).applyMatrix4(o.matrixWorld);
          if (vA.y < maxPruneY && (vA.x * vA.x + vA.z * vA.z) > r2) continue;
          if (write !== i) {
            o.setMatrixAt(write, m4);
            if (o.instanceColor) {
              const c = new THREE.Color();
              o.getColorAt(i, c);
              o.setColorAt(write, c);
            }
          }
          write++;
        }
        o.count = write;
        o.instanceMatrix.needsUpdate = true;
        if (o.instanceColor) o.instanceColor.needsUpdate = true;
      } else if (o.isMesh && o.geometry && o.geometry.attributes && o.geometry.attributes.position) {
        const g = o.geometry;
        const pos = g.attributes.position;
        const idx = g.index;
        const triCount = idx ? (idx.count / 3) : (pos.count / 3);
        const keepTris = [];
        let prunedAny = false;
        for (let t = 0; t < triCount; t++) {
          const i0 = idx ? idx.getX(t * 3) : t * 3;
          const i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1;
          const i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
          vA.fromBufferAttribute(pos, i0).applyMatrix4(o.matrixWorld);
          vB.fromBufferAttribute(pos, i1).applyMatrix4(o.matrixWorld);
          vC.fromBufferAttribute(pos, i2).applyMatrix4(o.matrixWorld);
          const cx = (vA.x + vB.x + vC.x) / 3;
          const cy = (vA.y + vB.y + vC.y) / 3;
          const cz = (vA.z + vB.z + vC.z) / 3;
          if (cy < maxPruneY && (cx * cx + cz * cz) > r2) prunedAny = true;
          else keepTris.push(i0, i1, i2);
        }
        if (prunedAny) {
          if (keepTris.length === 0) toRemove.push(o);
          else {
            const ng = g.clone();
            ng.setIndex(keepTris);
            o.geometry = ng;
          }
        }
      }
    });
    for (let i = 0; i < toRemove.length; i++) {
      if (toRemove[i].parent) toRemove[i].parent.remove(toRemove[i]);
    }
  }

  function addTriplanarUvs(g, tile) {
    const t = tile == null ? 6.0 : tile;
    const p = g.attributes.position, n = g.attributes.normal;
    const uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) {
      const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
      if (ay >= ax && ay >= az) { uv[i * 2] = p.getX(i) / t; uv[i * 2 + 1] = p.getZ(i) / t; }
      else if (ax >= az) { uv[i * 2] = p.getZ(i) / t; uv[i * 2 + 1] = p.getY(i) / t; }
      else { uv[i * 2] = p.getX(i) / t; uv[i * 2 + 1] = p.getY(i) / t; }
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    return g;
  }

  function quadSlabGeo(pts, thick, yOverride) {
    const t = thick == null ? 0.36 : thick;
    const x0 = pts[0][0], z0 = pts[0][1], y0 = yOverride == null ? pts[0][2] : yOverride;
    const x1 = pts[1][0], z1 = pts[1][1];
    const x2 = pts[2][0], z2 = pts[2][1];
    const x3 = pts[3][0], z3 = pts[3][1];
    const yb = y0 - t;
    const v = [
      x0, y0, z0, x3, y0, z3, x2, y0, z2, x0, y0, z0, x2, y0, z2, x1, y0, z1,
      x0, yb, z0, x1, yb, z1, x2, yb, z2, x0, yb, z0, x2, yb, z2, x3, yb, z3,
      x0, y0, z0, x1, y0, z1, x1, yb, z1, x0, y0, z0, x1, yb, z1, x0, yb, z0,
      x1, y0, z1, x2, y0, z2, x2, yb, z2, x1, y0, z1, x2, yb, z2, x1, yb, z1,
      x2, y0, z2, x3, y0, z3, x3, yb, z3, x2, y0, z2, x3, yb, z3, x2, yb, z2,
      x3, y0, z3, x0, y0, z0, x0, yb, z0, x3, y0, z3, x0, yb, z0, x3, yb, z3
    ];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3));
    g.computeVertexNormals();
    return addTriplanarUvs(g, 5.0);
  }

  function quadSlabGeoSplit(pts, thick, yOverride) {
    const t = thick == null ? 0.36 : thick;
    const x0 = pts[0][0], z0 = pts[0][1], y0 = yOverride == null ? pts[0][2] : yOverride;
    const x1 = pts[1][0], z1 = pts[1][1];
    const x2 = pts[2][0], z2 = pts[2][1];
    const x3 = pts[3][0], z3 = pts[3][1];
    const yb = y0 - t;
    const topSides = [
      x0, y0, z0, x3, y0, z3, x2, y0, z2, x0, y0, z0, x2, y0, z2, x1, y0, z1,
      x0, y0, z0, x1, y0, z1, x1, yb, z1, x0, y0, z0, x1, yb, z1, x0, yb, z0,
      x1, y0, z1, x2, y0, z2, x2, yb, z2, x1, y0, z1, x2, yb, z2, x1, yb, z1,
      x2, y0, z2, x3, y0, z3, x3, yb, z3, x2, y0, z2, x3, yb, z3, x2, yb, z2,
      x3, y0, z3, x0, y0, z0, x0, yb, z0, x3, y0, z3, x0, yb, z0, x3, yb, z3
    ];
    const bot = [
      x0, yb, z0, x1, yb, z1, x2, yb, z2, x0, yb, z0, x2, yb, z2, x3, yb, z3
    ];
    const gTop = new THREE.BufferGeometry();
    gTop.setAttribute('position', new THREE.BufferAttribute(new Float32Array(topSides), 3));
    gTop.computeVertexNormals();
    addTriplanarUvs(gTop, 5.0);
    const gBot = new THREE.BufferGeometry();
    gBot.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bot), 3));
    gBot.computeVertexNormals();
    addTriplanarUvs(gBot, 5.0);
    return { top: gTop, bottom: gBot };
  }

  function stairFlightGeo(a, b, w) {
    const dx = b[0] - a[0], dz = b[1] - a[1], dy = b[2] - a[2];
    const hLen = Math.max(0.4, Math.hypot(dx, dz));
    const steps = Math.max(4, Math.min(28, Math.round(Math.abs(dy) / 0.24)));
    const ux = dx / hLen, uz = dz / hLen;
    const px = -uz, pz = ux;
    const geos = [];
    const m4 = new THREE.Matrix4();
    const yaw = Math.atan2(ux, uz);
    for (let s = 0; s < steps; s++) {
      const f = (s + 0.5) / steps;
      const sx = a[0] + dx * f;
      const sz = a[1] + dz * f;
      const sy = a[2] + dy * ((s + 1) / steps);
      const stepH = Math.max(0.18, Math.abs(dy) / steps + 0.12);
      const stepD = (hLen / steps) + 0.08;
      m4.makeRotationY(yaw).setPosition(sx, sy - 0.5 * stepH, sz);
      geos.push(bakeGeo(new THREE.BoxGeometry(w, stepH, stepD), m4, false, 4.0));
    }
    const midX = 0.5 * (a[0] + b[0]), midZ = 0.5 * (a[1] + b[1]), midY = 0.5 * (a[2] + b[2]);
    const slope = -Math.atan2(dy, hLen);
    const totalLen = Math.hypot(hLen, dy);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(slope, yaw, 0, 'YXZ'));
    for (let side = -1; side <= 1; side += 2) {
      m4.compose(
        new THREE.Vector3(midX + px * side * (0.5 * w + 0.08), midY + 0.35, midZ + pz * side * (0.5 * w + 0.08)),
        q,
        new THREE.Vector3(1, 1, 1)
      );
      geos.push(bakeGeo(new THREE.BoxGeometry(0.14, 0.75, totalLen), m4, false, 4.0));
    }
    return mergeGeoList(geos);
  }

  // Bind procedural maps immediately; MAT library maps bind once 88y-ancients-matlib.js initializes MAT
  bindPbrMats();

  return {
    MATS: MATS,
    bindPbrMats: bindPbrMats,
    getFurnDetailMaps: getFurnDetailMaps,
    getPavingMaps: getPavingMaps,
    getFurrowMaps: getFurrowMaps,
    getFieldstoneMaps: getFieldstoneMaps,
    addTriplanarUvs: addTriplanarUvs,
    bakeGeo: bakeGeo,
    mergeGeoList: mergeGeoList,
    extractProtoParts: extractProtoParts,
    mergePlacedPrototypes: mergePlacedPrototypes,
    pruneArcologySkirt: pruneArcologySkirt,
    quadSlabGeo: quadSlabGeo,
    quadSlabGeoSplit: quadSlabGeoSplit,
    stairFlightGeo: stairFlightGeo
  };
})();

// Build outer Soleri hinterland terrain, Tors Rivrh, 10-level living agricultural terrace cascade, built-over cantons, stitched roads & Customs Wall
(function buildTorusTerraceStage() {
  const deg = Math.PI / 180;
  const m4 = new THREE.Matrix4();
  const hl = TORUS_PLAN.hinterland;

  function normDeg(d) {
    const x = d % 360;
    return x < 0 ? x + 360 : x;
  }
  function angDiff(a, b) {
    const d = Math.abs(normDeg(a) - normDeg(b));
    return d > 180 ? 360 - d : d;
  }
  function inArc(d, d0, d1) {
    const x = normDeg(d), a = normDeg(d0), b = normDeg(d1);
    return a <= b ? (x >= a && x <= b) : (x >= a || x <= b);
  }

  // Lookup helper for working Soleri hinterland fields so the valley ground mesh tints cultivated fields naturally without Z-fighting boxes!
  const workFields = (hl && hl.hinterlandFields) ? hl.hinterlandFields.filter(function (f) { return !f.ruined; }) : [];
  function inWorkingHinterlandField(r, d) {
    if (r < 1160) return null;
    for (let i = 0; i < workFields.length; i++) {
      const f = workFields[i];
      if (r >= f.rIn && r <= f.rOut && inArc(d, f.deg0, f.deg1)) return f;
    }
    return null;
  }

  // 1. Outer Hinterland Valley Ground Mesh (6.8 km x 6.8 km, omits interior r < 1104m so it never overlaps the 10-terrace cascade!)
  const N = 180, EXT = 3400;
  const nv = (N + 1) * (N + 1);
  const pos = new Float32Array(nv * 3);
  const uv = new Float32Array(nv * 2);
  const col = new Float32Array(nv * 3);
  const idx = [];
  for (let j = 0; j <= N; j++) {
    const z = -EXT + (2 * EXT * j) / N;
    for (let i = 0; i <= N; i++) {
      const x = -EXT + (2 * EXT * i) / N;
      const r = Math.hypot(x, z);
      const y = r < 1118 ? -4.5 : TORUS.groundAt(x, z);
      const vIdx = j * (N + 1) + i;
      const k = vIdx * 3;
      pos[k] = x; pos[k + 1] = y; pos[k + 2] = z;
      uv[vIdx * 2] = x / 10.0;
      uv[vIdx * 2 + 1] = z / 10.0;

      const n = KRAND.fbm(x / 160, 0.4, z / 160, 3, 7741);
      const d = normDeg(Math.atan2(z, x) / deg);
      let cr = 0.56 + 0.08 * n, cg = 0.62 + 0.08 * n, cb = 0.42 + 0.05 * n;
      if (TORUS.inRiverCorridor(x, z, 6)) {
        cr = 0.36; cg = 0.44; cb = 0.32;
      } else {
        const wf = inWorkingHinterlandField(r, d);
        if (wf) {
          if (wf.kind === 'working_pod_orchard' || wf.kind === 'reclaimed_heirloom_orchard') {
            cr = 0.44 + 0.05 * n; cg = 0.64 + 0.06 * n; cb = 0.34 + 0.04 * n;
          } else {
            cr = 0.72 + 0.06 * n; cg = 0.63 + 0.05 * n; cb = 0.38 + 0.04 * n;
          }
        }
      }
      col[k] = Math.pow(Math.max(0, cr), 2.2);
      col[k + 1] = Math.pow(Math.max(0, cg), 2.2);
      col[k + 2] = Math.pow(Math.max(0, cb), 2.2);
    }
  }
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const x = -EXT + (2 * EXT * (i + 0.5)) / N;
      const z = -EXT + (2 * EXT * (j + 0.5)) / N;
      if (Math.hypot(x, z) < 1098) continue; // Clean hole under the 10-terrace cascade: zero coplanar terrain triangles!
      const a = j * (N + 1) + i, b = a + 1, c = a + N + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const gGround = new THREE.BufferGeometry();
  gGround.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  gGround.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  gGround.setAttribute('color', new THREE.BufferAttribute(col, 3));
  gGround.setIndex(idx);
  gGround.computeVertexNormals();
  const groundMesh = new THREE.Mesh(gGround, TORUS_DRAW.MATS.terrain);
  groundMesh.userData.probeSkip = true;
  groundMesh.userData.ground = true;
  groundMesh.userData.khost = true;
  scene.add(groundMesh);

  // 2. Tors Rivrh Water Channel (bearing 318 deg, centerDist 1095 m, width 52 m — y = -1.15m cleanly above -1.8m river bed)
  const nx = Math.cos(318 * deg), nz = Math.sin(318 * deg);
  const tx = -nz, tz = nx;
  const wGeos = [];
  for (let s = 0; s < 72; s++) {
    const t0 = -3200 + (6400 * s) / 72, t1 = -3200 + (6400 * (s + 1)) / 72, tm = 0.5 * (t0 + t1);
    const dn = 1095.0 + 26.0 * Math.sin(tm / 420.0);
    const wx = dn * nx + tm * tx, wz = dn * nz + tm * tz;
    const ang = Math.atan2(-(dn * nz + t1 * tz - (dn * nz + t0 * tz)), (dn * nx + t1 * tx - (dn * nx + t0 * tx)));
    m4.makeRotationY(ang).setPosition(wx, -1.05, wz);
    wGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry((t1 - t0) + 1.5, 0.36, 52.0), m4, false, 8.0));
  }

  // 3. Living 10-Level Contour Agricultural Terrace Cascade ("Terrace Farms, with Built-Over Portions", T1 +44m -> T10 +1m)
  const loamBenchGeos = [], pastureBenchGeos = [], orchardBenchGeos = [], grainBenchGeos = [];
  const fieldstoneRiserGeos = [], builtApronGeos = [], waterCanalGeos = [], timberSluiceGeos = [];
  const terraces = TORUS_PLAN.agTerraces;
  const builtSectors = TORUS_PLAN.builtSectors || [];

  function isBuiltOverSector(tCode, dm) {
    for (let i = 0; i < builtSectors.length; i++) {
      const bs = builtSectors[i];
      if (bs.terrace === tCode && inArc(dm, bs.deg0, bs.deg1)) return bs;
    }
    return null;
  }

  // Central Barrel Foot Earthen Core (r = 0..296m, y = +43.6m so it sits 40cm under 71c-ring's y=44.0m atrium floor without Z-fighting!)
  const coreCyl = new THREE.CylinderGeometry(295.0, 298.0, 43.6, 72);
  m4.identity().setPosition(0, 21.8, 0);
  fieldstoneRiserGeos.push(TORUS_DRAW.bakeGeo(coreCyl, m4, false, 6.0));

  for (let t = 0; t < terraces.length; t++) {
    const tr = terraces[t];
    const nextElev = (t + 1 < terraces.length) ? terraces[t + 1].elev : 0.0;
    const dropH = Math.max(1.2, tr.elev - nextElev);
    const segs = 144;
    const widthR = tr.rOut - tr.rIn;
    const rMid = 0.5 * (tr.rIn + tr.rOut);

    for (let k = 0; k < segs; k++) {
      const d0 = (360 * k) / segs, d1 = (360 * (k + 1)) / segs, dm = 0.5 * (d0 + d1);
      const mx = rMid * Math.cos(dm * deg), mz = rMid * Math.sin(dm * deg);
      if (t >= 8 && TORUS.inRiverCorridor(mx, mz, 2)) continue;
      const yaw = -dm * deg;
      // Exact chord width without overlapping neighbor segment tops (eliminates radial wedge Z-fighting!)
      const arcMid = 2.0 * rMid * Math.sin(((d1 - d0) * 0.5) * deg) + 0.12;
      const arcOut = 2.0 * tr.rOut * Math.sin(((d1 - d0) * 0.5) * deg) + 0.24;

      // Skip bench box where a subterranean F-1 landmark collar frames an open basement excavation
      if (!torusExcavationAt(mx, mz, 22.0)) {
        m4.makeRotationY(yaw).setPosition(mx, tr.elev - 0.5 * dropH, mz);
        const benchBox = TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(widthR - 0.15, dropH, arcMid), m4, false, 7.0);
        // Primary terrace surface IS rich irrigated agricultural soil/pasture by microclimate band!
        if (t <= 2) {
          (k % 3 === 0 ? pastureBenchGeos : loamBenchGeos).push(benchBox);
        } else if (t <= 5) {
          (k % 2 === 0 ? orchardBenchGeos : pastureBenchGeos).push(benchBox);
        } else if (t <= 7) {
          (k % 3 === 0 ? loamBenchGeos : grainBenchGeos).push(benchBox);
        } else {
          (k % 2 === 0 ? pastureBenchGeos : orchardBenchGeos).push(benchBox);
        }

        // Built-Over Portions: where a village hamlet or SE Voth Extension canton occupies this sector,
        // lay a raised stone-paved terrace apron (+0.18m above soil, inset clear of ring roads) with dressed stone kerbs!
        const bs = isBuiltOverSector(tr.code, dm);
        if (bs) {
          const apronIn = tr.rIn + 9.5, apronOut = tr.rOut - 9.5;
          if (apronOut > apronIn + 6.0) {
            const apronR = 0.5 * (apronIn + apronOut);
            const apronW = apronOut - apronIn;
            const apronArc = 2.0 * apronR * Math.sin(((d1 - d0) * 0.5) * deg) + 0.08;
            m4.makeRotationY(yaw).setPosition(apronR * Math.cos(dm * deg), tr.elev + 0.10, apronR * Math.sin(dm * deg));
            builtApronGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(apronW, 0.22, apronArc), m4, false, 5.0));
          }
        }
      }

      // Battered Cyclopean dry-stone retaining wall along outer edge of every agricultural terrace bench
      const rx = tr.rOut * Math.cos(dm * deg), rz = tr.rOut * Math.sin(dm * deg);
      m4.makeRotationY(yaw).setPosition(rx, nextElev + 0.5 * dropH, rz);
      fieldstoneRiserGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(2.6, dropH, arcOut), m4, false, 4.5));
      // Low dry-stone coping lip (+0.28m) along the outer terrace brow (broken open at radial stair spokes!)
      let onSpoke = false;
      for (let sk = 0; sk < 24; sk++) {
        const sDeg = 7.5 + 15.0 * sk;
        if (t < 3 && (sk % 2 === 1)) continue;
        if (angDiff(dm, sDeg) < (6.2 / tr.rOut) / deg) { onSpoke = true; break; }
      }
      if (!onSpoke) {
        m4.makeRotationY(yaw).setPosition((tr.rOut - 0.9) * Math.cos(dm * deg), tr.elev + 0.16, (tr.rOut - 0.9) * Math.sin(dm * deg));
        fieldstoneRiserGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(1.4, 0.32, arcOut * 0.96), m4, false, 4.0));
      }

      // Contour stone-lined irrigation leat & timber sluices along the inner toe of each farm terrace (away from roads & built-over sectors)
      if (!onSpoke && !torusExcavationAt(mx, mz, 24.0)) {
        const canalR = tr.rIn + 6.4;
        const arcCanal = 2.0 * canalR * Math.sin(((d1 - d0) * 0.5) * deg) * 0.94;
        m4.makeRotationY(yaw).setPosition(canalR * Math.cos(dm * deg), tr.elev + 0.14, canalR * Math.sin(dm * deg));
        waterCanalGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(1.6, 0.24, arcCanal), m4, false, 5.0));
        if (k % 12 === 0) {
          m4.makeRotationY(yaw).setPosition(canalR * Math.cos(dm * deg), tr.elev + 0.42, canalR * Math.sin(dm * deg));
          timberSluiceGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(2.2, 0.75, 0.45), m4, false, 2.5));
        }
      }
    }
  }

  // Frame flush stone collars & subterranean pit walls around the 3 F-1 terrace landmarks (top at lm.y - 0.06m so ZERO Z-fighting with F0!)
  for (let ei = 0; ei < TORUS_EXCAVATIONS.length; ei++) {
    const ex = TORUS_EXCAVATIONS[ei];
    const lm = ex.lm;
    const wIn = ex.x1 - ex.x0, dIn = ex.z1 - ex.z0;
    const cxL = 0.5 * (ex.x0 + ex.x1), czL = 0.5 * (ex.z0 + ex.z1);
    const collarPad = 26.0;
    function addExBox(list, lx, ly, lz, bw, bh, bd, tile) {
      const wx = lm.x + lx * ex.c + lz * ex.s;
      const wz = lm.z - lx * ex.s + lz * ex.c;
      m4.makeRotationY(lm.ry).setPosition(wx, lm.y + ly, wz);
      list.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(bw, bh, bd), m4, false, tile || 5.0));
    }
    addExBox(builtApronGeos, cxL, -2.46, ex.z0 - 0.5 * collarPad, wIn + 2 * collarPad, 4.8, collarPad, 5.0);
    addExBox(builtApronGeos, cxL, -2.46, ex.z1 + 0.5 * collarPad, wIn + 2 * collarPad, 4.8, collarPad, 5.0);
    addExBox(builtApronGeos, ex.x0 - 0.5 * collarPad, -2.46, czL, collarPad, 4.8, dIn, 5.0);
    addExBox(builtApronGeos, ex.x1 + 0.5 * collarPad, -2.46, czL, collarPad, 4.8, dIn, 5.0);
    addExBox(fieldstoneRiserGeos, cxL, -(ex.depth + 0.50), czL, wIn + 3.0, 0.9, dIn + 3.0, 4.5);
  }

  // 4. Zero-Overlap Stitched Road Network: Radial Spokes Continuous (+0.24m), Ring Paths Clipped Cleanly Between Spokes (+0.24m)
  const roadGeos = [], trackGeos = [];
  const spokeRoads = TORUS_PLAN.roads.filter(function (r) { return r.kind !== 'terrace_ring'; });

  function hitsSpokeAt(r, dm) {
    for (let i = 0; i < spokeRoads.length; i++) {
      const sp = spokeRoads[i];
      if (r < sp.r0 - 6.0 || r > sp.r1 + 6.0) continue;
      const halfAngDeg = ((0.5 * sp.width + 0.8) / r) / deg;
      if (angDiff(dm, sp.deg) < halfAngDeg) return true;
    }
    return false;
  }

  for (let i = 0; i < TORUS_PLAN.roads.length; i++) {
    const rd = TORUS_PLAN.roads[i];
    if (rd.kind === 'terrace_ring') {
      const r = rd.r, y = TORUS.groundAt(r, 0);
      const ringSegs = 192;
      for (let k = 0; k < ringSegs; k++) {
        const dm = (360 * (k + 0.5)) / ringSegs;
        if (hitsSpokeAt(r, dm)) continue; // Stitched gap at radial spoke intersections -> zero road-on-road Z-fighting!
        const mx = r * Math.cos(dm * deg), mz = r * Math.sin(dm * deg);
        if (TORUS.inRiverCorridor(mx, mz, 4) || torusExcavationAt(mx, mz, 2.5)) continue;
        const segLen = 2.0 * r * Math.sin((180.0 / ringSegs) * deg);
        m4.makeRotationY(-dm * deg).setPosition(mx, y + 0.14, mz);
        roadGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(rd.width, 0.24, segLen), m4, false, 4.5));
      }
    } else {
      const a = rd.deg * deg;
      for (let t = 0; t < terraces.length; t++) {
        const tr = terraces[t];
        const s0 = Math.max(rd.r0, tr.rIn + 4.2), s1 = Math.min(rd.r1, tr.rOut - 4.2);
        if (s1 <= s0 + 1.5) continue;
        const rm = 0.5 * (s0 + s1);
        const mx = rm * Math.cos(a), mz = rm * Math.sin(a);
        if (TORUS.inRiverCorridor(mx, mz, 4) || torusExcavationAt(mx, mz, 3.0)) continue;
        m4.makeRotationY(-a + 0.5 * Math.PI).setPosition(mx, tr.elev + 0.14, mz);
        roadGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(rd.width, 0.24, s1 - s0), m4, false, 4.5));
      }
      // Outer customs approach segment from T10 (r=1120) to Customs Gate (r=1140)
      if (rd.r1 > 1122) {
        const rmOut = 1131.0;
        const ox = rmOut * Math.cos(a), oz = rmOut * Math.sin(a);
        if (!TORUS.inRiverCorridor(ox, oz, 4)) {
          m4.makeRotationY(-a + 0.5 * Math.PI).setPosition(ox, 0.20, oz);
          roadGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(rd.width, 0.32, 17.5), m4, false, 4.5));
        }
      }
    }
  }

  // Physical stepped stone flights climbing each terrace riser along the 12 radial avenues
  const arcStairs = TORUS_STAGE4.arcology.stairs;
  for (let si = 0; si < arcStairs.length; si++) {
    const st = arcStairs[si];
    if (st.level === 0 && st.render) {
      roadGeos.push(TORUS_DRAW.stairFlightGeo(st.a, st.b, st.w));
    }
  }

  // Hinterland farm service lanes connecting Customs Gates to the 4 working Soleri Pod Farm & Orchard Arrays
  const farmLanes = (hl && hl.farmLanes) ? hl.farmLanes : [];
  for (let fl = 0; fl < farmLanes.length; fl++) {
    const ln = farmLanes[fl];
    const dx = ln.to[0] - ln.from[0], dz = ln.to[1] - ln.from[1];
    const len = Math.hypot(dx, dz);
    const nSeg = Math.max(4, Math.ceil(len / 28.0));
    const yaw = Math.atan2(dx, dz);
    for (let s = 0; s < nSeg; s++) {
      const f = (s + 0.5) / nSeg;
      const lx = ln.from[0] + dx * f, lz = ln.from[1] + dz * f;
      if (TORUS.inRiverCorridor(lx, lz, 8)) continue;
      const ly = TORUS.groundAt(lx, lz);
      m4.makeRotationY(yaw).setPosition(lx, ly + 0.16, lz);
      trackGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(ln.width, 0.28, (len / nSeg) - 0.15), m4, false, 5.0));
    }
  }

  // 5. Torus Light Customs & Granary Wall (r = 1140 m) + 6 Articulated Scrap Voth Gatehouses
  const wallR = TORUS_PLAN.site.customsWallR;
  const cWallGeos = [], cGateBasalt = [], cGatePorphyry = [], cGateGold = [];
  for (let i = 0; i < 160; i++) {
    const dm = (360 * (i + 0.5)) / 160;
    if (dm >= 298 && dm <= 338) continue;
    let nearGate = false;
    for (let g = 0; g < TORUS_PLAN.gates.length; g++) {
      if (angDiff(dm, TORUS_PLAN.gates[g].deg) < 1.15) nearGate = true;
    }
    if (nearGate) continue;
    const wx = wallR * Math.cos(dm * deg), wz = wallR * Math.sin(dm * deg);
    const wy = TORUS.groundAt(wx, wz);
    const segArc = 2.0 * wallR * Math.sin((180.0 / 160) * deg) + 0.12;
    m4.makeRotationY(-dm * deg).setPosition(wx, wy + 2.75, wz);
    cWallGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(3.8, 5.5, segArc), m4, false, 5.0));
    // Wall-walk parapet crenellations
    if (i % 2 === 0) {
      m4.makeRotationY(-dm * deg).setPosition((wallR + 1.35) * Math.cos(dm * deg), wy + 6.0, (wallR + 1.35) * Math.sin(dm * deg));
      cGateBasalt.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(0.9, 1.0, segArc * 0.68), m4, false, 4.0));
    }
  }
  for (let g = 0; g < TORUS_PLAN.gates.length; g++) {
    const gt = TORUS_PLAN.gates[g];
    const ga = gt.deg * deg, yaw = -ga + 0.5 * Math.PI;
    for (let s = -1; s <= 1; s += 2) {
      const txG = gt.x + s * 5.8 * (-Math.sin(ga)), tzG = gt.z + s * 5.8 * Math.cos(ga);
      m4.makeRotationY(yaw).setPosition(txG, 4.9, tzG);
      cGateBasalt.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(4.6, 9.8, 10.8), m4, false, 4.5));
      m4.makeRotationY(yaw).setPosition(txG, 9.9, tzG);
      cGatePorphyry.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(5.2, 0.85, 11.4), m4, false, 4.0));
    }
    m4.makeRotationY(yaw).setPosition(gt.x, 7.6, gt.z);
    cWallGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(16.2, 2.8, 10.2), m4, false, 4.5));
    m4.makeRotationY(yaw).setPosition(gt.x, 9.2, gt.z);
    cGatePorphyry.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(16.8, 0.65, 10.8), m4, false, 4.0));
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0.25 * Math.PI, 'YXZ'));
    m4.compose(new THREE.Vector3(gt.x + 5.3 * Math.cos(ga), 7.7, gt.z + 5.3 * Math.sin(ga)), q, new THREE.Vector3(1, 1, 1));
    cGateGold.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(1.5, 1.5, 0.35), m4, false, 2.0));
  }

  function addStageMesh(list, mat, skipProbe, keepInCutaway, name) {
    if (!list.length) return;
    const mg = TORUS_DRAW.mergeGeoList(list);
    if (!mg) return;
    const m = new THREE.Mesh(mg, mat);
    if (name) m.name = name;
    if (skipProbe) m.userData.probeSkip = true;
    if (keepInCutaway) m.userData.khost = true;
    scene.add(m);
  }

  addStageMesh(wGeos, TORUS_DRAW.MATS.water, true, true, 'torus_river_water');
  addStageMesh(loamBenchGeos, TORUS_DRAW.MATS.terraceLoam, true, true, 'torus_terrace_loam');
  addStageMesh(pastureBenchGeos, TORUS_DRAW.MATS.terracePasture, true, true, 'torus_terrace_pasture');
  addStageMesh(orchardBenchGeos, TORUS_DRAW.MATS.terraceOrchardLoam, true, true, 'torus_terrace_orchard_soil');
  addStageMesh(grainBenchGeos, TORUS_DRAW.MATS.terraceGrainTilth, true, true, 'torus_terrace_grain_tilth');
  addStageMesh(fieldstoneRiserGeos, TORUS_DRAW.MATS.fieldstoneWall, true, true, 'torus_terrace_fieldstone_risers');
  addStageMesh(builtApronGeos, TORUS_DRAW.MATS.builtApron, true, true, 'torus_terrace_built_aprons');
  addStageMesh(waterCanalGeos, TORUS_DRAW.MATS.water, true, true, 'torus_terrace_irrigation_leats');
  addStageMesh(timberSluiceGeos, TORUS_DRAW.MATS.timber, true, true, 'torus_terrace_sluices');
  addStageMesh(roadGeos, TORUS_DRAW.MATS.roadStone, true, true, 'torus_terrace_roads');
  addStageMesh(trackGeos, TORUS_DRAW.MATS.farmTrack, true, true, 'torus_hinterland_farm_lanes');
  addStageMesh(cWallGeos, TORUS_DRAW.MATS.ancientStone, false, true, 'torus_customs_wall');
  addStageMesh(cGateBasalt, TORUS_DRAW.MATS.basalt, false, true, 'torus_customs_gates_basalt');
  addStageMesh(cGatePorphyry, TORUS_DRAW.MATS.porphyry, false, true, 'torus_customs_gates_porphyry');
  addStageMesh(cGateGold, TORUS_DRAW.MATS.gold, false, true, 'torus_customs_gates_gold');
})();
