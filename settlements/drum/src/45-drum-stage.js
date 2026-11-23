// ================================================================= DRUM — 45: Stage, Textured Ground, Z-Clean Streets & Batching Helpers ([web])
// Creates renderer, scene, camera, PBR-textured valley & city ground, Drim Rivrh channel, zero-overlap stitched radial/concentric streets,
// ceiling/roof/furniture surface textures, and surgical arcology skirt pruning.

const DRUM_SEED = 20261117;
const DRUM_PLAN = DRUM.buildCityPlan(DRUM_SEED);
const DRUM_STAGE4 = DRUM.buildStage4Plans(DRUM_PLAN);

function drumInExcavation(x, z, pad) {
  const p = pad == null ? 0 : pad;
  for (let i = 0; i < DRUM_STAGE4.landmarks.length; i++) {
    const B = DRUM_STAGE4.landmarks[i];
    const ex = B.excavation;
    if (!ex) continue;
    const dx = x - B.lm.x, dz = z - B.lm.z;
    const c = Math.cos(B.lm.ry), s = Math.sin(B.lm.ry);
    const lx = dx * c - dz * s;
    const lz = dx * s + dz * c;
    if (lx >= ex.x0 - p && lx <= ex.x1 + p && lz >= ex.z0 - p && lz <= ex.z1 + p) return ex.y;
  }
  return null;
}

const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio == null ? 1 : window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.04;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xc4bdb0, 0.00018);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.65, 22000);

const hemi = new THREE.HemisphereLight(0xdce2e0, 0x5c4f3e, 0.62);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d6, 1.32);
sun.position.set(-2200, 3200, -1500);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xb8cce8, 0.26);
fill.position.set(1800, 1300, 2100);
scene.add(fill);
let NIGHT = false;

function drumGroundAt(x, z) {
  const exY = drumInExcavation(x, z, 0);
  if (exY !== null) return exY;
  const deg = Math.PI / 180;
  const nx = Math.cos(320 * deg), nz = Math.sin(320 * deg);
  const tx = -nz, tz = nx;
  const dn = x * nx + z * nz;
  const dt = x * tx + z * tz;
  const rc = 615.0 + 18.0 * Math.sin(dt / 280.0);
  const rd = Math.abs(dn - rc);
  if (rd < 28.0) {
    const u = Math.max(0, 1.0 - (rd / 28.0) * (rd / 28.0));
    return -3.6 * u;
  }
  const r = Math.hypot(x, z);
  if (r > 700.0) {
    const t = Math.min(1.0, (r - 700.0) / 1400.0);
    const n = KRAND.fbm(x / 320.0, 0.5, z / 320.0, 3, 6739);
    return t * (16.0 * n + 8.0 * t);
  }
  return 0.0;
}

const DRUM_DRAW = (function () {
  function stdMat(o) {
    const base = { roughness: 0.84, metalness: 0.05, side: THREE.DoubleSide };
    return new THREE.MeshStandardMaterial(Object.assign(base, o));
  }

  // Deterministic tactile grain + roughness maps for vertex-coloured furniture & brushed metals
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

  const MATS = {
    ancientStone: stdMat({ color: 0xc8c3b6, roughness: 0.78, metalness: 0.05 }),
    ancientDark: stdMat({ color: 0x6f6b63, roughness: 0.84, metalness: 0.08 }),
    basalt: stdMat({ color: 0x3c3935, roughness: 0.88, metalness: 0.06 }),
    ashStone: stdMat({ color: 0x948d7d, roughness: 0.85, metalness: 0.04 }),
    porphyry: stdMat({ color: 0x742838, roughness: 0.70, metalness: 0.08 }),
    gold: stdMat({ color: 0xd8aa3e, roughness: 0.32, metalness: 0.82 }),
    bronze: stdMat({ color: 0xa8813e, roughness: 0.42, metalness: 0.72 }),
    rustPlate: stdMat({ color: 0x8a5438, roughness: 0.82, metalness: 0.42 }),
    tankSteel: stdMat({ color: 0x6a7278, roughness: 0.58, metalness: 0.54 }),
    verdigris: stdMat({ color: 0x5c8872, roughness: 0.62, metalness: 0.25 }),
    timber: stdMat({ color: 0x72583d, roughness: 0.88, metalness: 0.02 }),
    canvas: stdMat({ color: 0xc9b998, roughness: 0.92, metalness: 0.0 }),
    sand: stdMat({ color: 0xc9b48a, roughness: 0.92, metalness: 0.0 }),
    floorTile: stdMat({ color: 0x968f80, roughness: 0.80, metalness: 0.04 }),
    ceilingSoffit: stdMat({ color: 0xb2aba0, roughness: 0.86, metalness: 0.03 }),
    roofDeck: stdMat({ color: 0x586066, roughness: 0.62, metalness: 0.48 }),
    windowPane: stdMat({ color: 0x26323c, roughness: 0.16, metalness: 0.65, emissive: 0x42301b, emissiveIntensity: 0.42 }),
    windowLit: stdMat({ color: 0xffd28a, roughness: 0.25, metalness: 0.10, emissive: 0xffb85c, emissiveIntensity: 0.82 }),
    roadInner: stdMat({ color: 0x827c70, roughness: 0.90, metalness: 0.03, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    roadOuter: stdMat({ color: 0x6f614d, roughness: 0.94, metalness: 0.01, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    boursePave: stdMat({ color: 0x968e7e, roughness: 0.82, metalness: 0.04 }),
    plazaPave: stdMat({ color: 0x8e8676, roughness: 0.86, metalness: 0.03, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 2 }),
    cityEarth: stdMat({ color: 0x7a6c56, roughness: 0.95, metalness: 0.0, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 }),
    lotPlinth: stdMat({ color: 0x767064, roughness: 0.88, metalness: 0.04, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    terrain: new THREE.MeshStandardMaterial({
      color: 0xffffff, vertexColors: true, roughness: 0.96, metalness: 0.0,
      polygonOffset: true, polygonOffsetFactor: 3, polygonOffsetUnits: 3
    }),
    warmGlow: new THREE.MeshBasicMaterial({ color: 0xffcf7c, side: THREE.DoubleSide }),
    water: new THREE.MeshStandardMaterial({ color: 0x2f5058, roughness: 0.16, metalness: 0.38 })
  };

  function bakeGeo(geo, m4, keepOrigUv, uvTile) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.applyMatrix4(m4);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!keepOrigUv || !g.attributes.uv) {
      const tile = uvTile == null ? 8.0 : uvTile;
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
        let v = joint ? (142 + grit * 0.5) : (214 + stoneTone + grit);
        if (!joint && (fx < 5 || fy < 5)) v -= 14;
        v = Math.max(95, Math.min(252, Math.round(v)));
        const rv = joint ? 245 : Math.max(135, Math.min(240, Math.round(202 - stoneTone * 0.7 + grit)));
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

  function bindPbrMats() {
    if (typeof MAT === 'undefined' || !MAT) return;
    const pairs = [
      ['ancientStone', 'white', 0xc9c3b6],
      ['ancientDark', 'concreteR', 0x767269],
      ['basalt', 'concreteR', 0x48443f],
      ['ashStone', 'concrete', 0x9c9586],
      ['porphyry', 'brick', 0x7c2d3d],
      ['rustPlate', 'rust', 0x986044],
      ['tankSteel', 'corrugate', 0x788188],
      ['verdigris', 'verdigris', 0x6b9780],
      ['timber', 'timber', 0x806346],
      ['canvas', 'tarp', 0xcfc0a0],
      ['sand', 'rubbleK', 0xc8b288],
      ['ceilingSoffit', 'concrete', 0xbab3a6],
      ['roofDeck', 'corrugate', 0x606970],
      ['cityEarth', 'rubbleK', 0x857760],
      ['lotPlinth', 'concreteR', 0x7c766a]
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

    // Bind running-bond stone flagstone & cobble paving maps onto all street, plaza, bourse & interior tile materials!
    const pm = getPavingMaps();
    const paveSpecs = [
      ['floorTile', 0xa69e8e],
      ['roadInner', 0x8e8678],
      ['roadOuter', 0x786954],
      ['boursePave', 0xa29a8a],
      ['plazaPave', 0x989080]
    ];
    for (let pi = 0; pi < paveSpecs.length; pi++) {
      const m = MATS[paveSpecs[pi][0]];
      if (!m) continue;
      m.map = pm.map;
      m.roughnessMap = pm.roughnessMap;
      m.bumpMap = pm.roughnessMap;
      m.bumpScale = 0.024;
      if (MAT.concrete && MAT.concrete.normalMap) {
        m.normalMap = MAT.concrete.normalMap;
        m.normalScale = new THREE.Vector2(0.55, 0.55);
      }
      m.color.setHex(paveSpecs[pi][1]);
      if (typeof m.color.convertSRGBToLinear === 'function') m.color.convertSRGBToLinear();
      m.needsUpdate = true;
    }

    // Bind PBR surface grit + normal/roughness onto terrain (preserving vertex colours!)
    const terrSrc = MAT.rubbleK || MAT.concrete;
    if (terrSrc && MATS.terrain) {
      if (terrSrc.normalMap) {
        MATS.terrain.normalMap = terrSrc.normalMap;
        MATS.terrain.normalScale = new THREE.Vector2(0.85, 0.85);
      }
      if (terrSrc.roughnessMap) MATS.terrain.roughnessMap = terrSrc.roughnessMap;
      const fm = getFurnDetailMaps();
      MATS.terrain.map = fm.map;
      MATS.terrain.needsUpdate = true;
    }

    // Brushed metallic relief on gold, bronze, window frames & river water
    const fm = getFurnDetailMaps();
    ['gold', 'bronze', 'windowPane', 'windowLit'].forEach(function (mk) {
      const m = MATS[mk];
      if (!m) return;
      m.map = fm.map;
      m.roughnessMap = fm.roughnessMap;
      if (typeof m.color.convertSRGBToLinear === 'function') m.color.convertSRGBToLinear();
      m.needsUpdate = true;
    });
    if (typeof TEX !== 'undefined' && TEX.concreteRM && MATS.water) {
      MATS.water.roughnessMap = TEX.concreteRM;
      MATS.water.bumpMap = TEX.concreteRM;
      MATS.water.bumpScale = 0.04;
      MATS.water.needsUpdate = true;
    }
  }

  function mergeGeoList(geos) {
    if (!geos || !geos.length) return null;
    let total = 0;
    let hasCol = false;
    let hasUv = false;
    for (let i = 0; i < geos.length; i++) {
      total += geos[i].attributes.position.count;
      if (geos[i].attributes.color) hasCol = true;
      if (geos[i].attributes.uv) hasUv = true;
    }
    const pos = new Float32Array(total * 3);
    const nrm = new Float32Array(total * 3);
    const col = hasCol ? new Float32Array(total * 3) : null;
    const uv = hasUv ? new Float32Array(total * 2) : null;
    let off = 0;
    for (let i = 0; i < geos.length; i++) {
      const g = geos[i];
      const p = g.attributes.position.array;
      const n = g.attributes.normal ? g.attributes.normal.array : null;
      const c = g.attributes.color ? g.attributes.color.array : null;
      const u = g.attributes.uv ? g.attributes.uv.array : null;
      const cnt = g.attributes.position.count;
      pos.set(p, off * 3);
      if (n && n.length === cnt * 3) nrm.set(n, off * 3);
      if (col) {
        if (c && c.length >= cnt * 3) {
          for (let k = 0; k < cnt * 3; k++) col[off * 3 + k] = c[k];
        } else {
          col.fill(1.0, off * 3, (off + cnt) * 3);
        }
      }
      if (uv && u && u.length >= cnt * 2) uv.set(u.subarray(0, cnt * 2), off * 2);
      off += cnt;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    if (col) out.setAttribute('color', new THREE.BufferAttribute(col, 3));
    if (uv) out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    return out;
  }

  // Extrudes a 4-corner horizontal floor polygon [[x,z,y], ...] downward by thick.
  // Optional soffitGeos array receives the underside ceiling triangles so ceilings have their own bright ribbed concrete material!
  function slabPolyGeo(pts, thick, soffitGeos) {
    const th = thick == null ? 0.35 : thick;
    const P = [], N = [], U = [];
    const SP = [], SN = [], SU = [];
    function triTo(tP, tN, tU, a, b, c, nx, ny, nz, scale) {
      const arr = [a, b, c];
      const sc = scale == null ? 8.0 : scale;
      for (let k = 0; k < 3; k++) {
        tP.push(arr[k][0], arr[k][1], arr[k][2]);
        tN.push(nx, ny, nz);
        tU.push(arr[k][0] / sc, arr[k][2] / sc);
      }
    }
    const T = pts.map(function (p) { return [p[0], p[2], p[1]]; });
    const B = pts.map(function (p) { return [p[0], p[2] - th, p[1]]; });
    triTo(P, N, U, T[0], T[2], T[1], 0, 1, 0, 6.0);
    triTo(P, N, U, T[0], T[3], T[2], 0, 1, 0, 6.0);
    if (soffitGeos) {
      triTo(SP, SN, SU, B[0], B[1], B[2], 0, -1, 0, 4.0);
      triTo(SP, SN, SU, B[0], B[2], B[3], 0, -1, 0, 4.0);
      const sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.Float32BufferAttribute(SP, 3));
      sg.setAttribute('normal', new THREE.Float32BufferAttribute(SN, 3));
      sg.setAttribute('uv', new THREE.Float32BufferAttribute(SU, 2));
      soffitGeos.push(sg);
    } else {
      triTo(P, N, U, B[0], B[1], B[2], 0, -1, 0, 6.0);
      triTo(P, N, U, B[0], B[2], B[3], 0, -1, 0, 6.0);
    }
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      const dx = T[j][0] - T[i][0], dz = T[j][2] - T[i][2], len = Math.hypot(dx, dz) || 1;
      const nx = dz / len, nz = -dx / len;
      triTo(P, N, U, B[i], T[j], T[i], nx, 0, nz, 6.0);
      triTo(P, N, U, B[i], B[j], T[j], nx, 0, nz, 6.0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    return g;
  }

  // Zero-overlap vertex-stitched polar annular sector / street ribbon (top at yTop, skirt down to yBot)
  function polarSectorGeo(rIn, rOut, deg0, deg1, steps, yTop, yBot) {
    const deg = Math.PI / 180;
    const P = [], N = [], U = [];
    function tri(a, b, c, nx, ny, nz) {
      const arr = [a, b, c];
      for (let k = 0; k < 3; k++) {
        P.push(arr[k][0], arr[k][1], arr[k][2]);
        N.push(nx, ny, nz);
        U.push(arr[k][0] / 8.0, arr[k][2] / 8.0);
      }
    }
    for (let s = 0; s < steps; s++) {
      const a0 = (deg0 + ((deg1 - deg0) * s) / steps) * deg;
      const a1 = (deg0 + ((deg1 - deg0) * (s + 1)) / steps) * deg;
      const p00 = [rIn * Math.cos(a0), yTop, rIn * Math.sin(a0)];
      const p10 = [rOut * Math.cos(a0), yTop, rOut * Math.sin(a0)];
      const p11 = [rOut * Math.cos(a1), yTop, rOut * Math.sin(a1)];
      const p01 = [rIn * Math.cos(a1), yTop, rIn * Math.sin(a1)];
      const xm = 0.25 * (p00[0] + p10[0] + p11[0] + p01[0]);
      const zm = 0.25 * (p00[2] + p10[2] + p11[2] + p01[2]);
      if (DRUM.inRiverCorridor(xm, zm, 3.0)) continue;
      if (drumInExcavation(xm, zm, 2.0) !== null) continue;
      tri(p00, p01, p11, 0, 1, 0);
      tri(p00, p11, p10, 0, 1, 0);
      if (yBot != null && yBot < yTop) {
        const b00 = [p00[0], yBot, p00[2]], b01 = [p01[0], yBot, p01[2]];
        const b10 = [p10[0], yBot, p10[2]], b11 = [p11[0], yBot, p11[2]];
        const am = 0.5 * (a0 + a1);
        tri(b10, p11, p10, Math.cos(am), 0, Math.sin(am));
        tri(b10, b11, p11, Math.cos(am), 0, Math.sin(am));
        tri(b01, p00, p01, -Math.cos(am), 0, -Math.sin(am));
        tri(b01, b00, p00, -Math.cos(am), 0, -Math.sin(am));
      }
    }
    if (!P.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    return g;
  }

  // Zero-overlap stitched radial street strip from r0 to r1 along azimuth degAz
  function radialRoadGeo(r0, r1, degAz, width, yTop, yBot) {
    const a = degAz * (Math.PI / 180);
    const ca = Math.cos(a), sa = Math.sin(a);
    const hw = 0.5 * width;
    const nSeg = Math.max(1, Math.ceil((r1 - r0) / 14.0));
    const P = [], N = [], U = [];
    function tri(pA, pB, pC, nx, ny, nz) {
      const arr = [pA, pB, pC];
      for (let k = 0; k < 3; k++) {
        P.push(arr[k][0], arr[k][1], arr[k][2]);
        N.push(nx, ny, nz);
        U.push(arr[k][0] / 8.0, arr[k][2] / 8.0);
      }
    }
    for (let s = 0; s < nSeg; s++) {
      const ra = r0 + ((r1 - r0) * s) / nSeg;
      const rb = r0 + ((r1 - r0) * (s + 1)) / nSeg;
      const rm = 0.5 * (ra + rb);
      const xm = rm * ca, zm = rm * sa;
      if (DRUM.inRiverCorridor(xm, zm, 3.0)) continue;
      if (drumInExcavation(xm, zm, 2.0) !== null) continue;
      const p00 = [ra * ca + hw * sa, yTop, ra * sa - hw * ca];
      const p10 = [ra * ca - hw * sa, yTop, ra * sa + hw * ca];
      const p11 = [rb * ca - hw * sa, yTop, rb * sa + hw * ca];
      const p01 = [rb * ca + hw * sa, yTop, rb * sa - hw * ca];
      tri(p00, p11, p10, 0, 1, 0);
      tri(p00, p01, p11, 0, 1, 0);
      if (yBot != null && yBot < yTop) {
        const b00 = [p00[0], yBot, p00[2]], b01 = [p01[0], yBot, p01[2]];
        const b10 = [p10[0], yBot, p10[2]], b11 = [p11[0], yBot, p11[2]];
        tri(b00, p01, p00, sa, 0, -ca);
        tri(b00, b01, p01, sa, 0, -ca);
        tri(b11, p10, p11, -sa, 0, ca);
        tri(b11, b10, p10, -sa, 0, ca);
      }
    }
    if (!P.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    return g;
  }

  function stripRampGeo(a, b, w) {
    const dx = b[0] - a[0], dz = b[1] - a[1], dy = b[2] - a[2];
    const run = Math.hypot(dx, dz) || 1;
    const yaw = Math.atan2(dx, dz);
    const steps = Math.max(4, Math.min(28, Math.round(Math.abs(dy) / 0.24)));
    const geos = [];
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0, 'YXZ'));
    const s = new THREE.Vector3(1, 1, 1);
    const v = new THREE.Vector3();
    for (let i = 0; i < steps; i++) {
      const t = (i + 0.5) / steps;
      const treadLen = (run / steps) + 0.04;
      const riserH = Math.max(0.22, Math.abs(dy) / steps + 0.12);
      const yTop = a[2] + dy * ((i + 1) / steps);
      v.set(a[0] + dx * t, yTop - 0.5 * riserH, a[1] + dz * t);
      m4.compose(v, q, s);
      geos.push(bakeGeo(new THREE.BoxGeometry(w, riserH, treadLen), m4));
    }
    return mergeGeoList(geos);
  }

  function extractProtoParts(rootObj) {
    rootObj.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(rootObj.matrixWorld).invert();
    const parts = [];
    rootObj.traverse(function (o) {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
      if (Array.isArray(o.material)) return;
      const m4 = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
      const g = bakeGeo(o.geometry, m4, true);
      parts.push({ geo: g, mat: o.material });
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
        bucket.push(bakeGeo(pt.geo, m4, true));
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
    const deg = Math.PI / 180;
    const toRemove = [];
    const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3();
    const m4 = new THREE.Matrix4();
    function angDiffDeg(a, b) {
      const d = Math.abs(((a % 360) + 360) % 360 - b);
      return d > 180 ? 360 - d : d;
    }
    function rfBaseAt(y) {
      const t = Math.max(0, Math.min(1, y / 66.0));
      return 104.0 + 92.0 * Math.pow(1.0 - t, 2.1) + 50.0 * Math.pow(t, 2.1);
    }
    function nearStructuralFin(x, z, y) {
      const rad = Math.hypot(x, z);
      if (rad > rfBaseAt(Math.max(0, y)) + 1.8) return false;
      for (let f = 0; f < 12; f++) {
        const fDeg = 20.0 + f * 30.0;
        if (f === 0 && y < 18.0) continue;
        const fa = fDeg * deg;
        const along = x * Math.cos(fa) + z * Math.sin(fa);
        if (along < 80.0) continue;
        const perp = Math.abs(-x * Math.sin(fa) + z * Math.cos(fa));
        if (perp <= 4.35) return true;
      }
      return false;
    }

    holder.traverse(function (o) {
      if (o.isInstancedMesh) {
        const isVoid = (typeof MAT !== 'undefined' && o.material === MAT.drVoid);
        const count = o.count;
        let write = 0;
        for (let i = 0; i < count; i++) {
          o.getMatrixAt(i, m4);
          vA.setFromMatrixPosition(m4).applyMatrix4(o.matrixWorld);
          const radI = Math.hypot(vA.x, vA.z);
          const thI = ((Math.atan2(vA.z, vA.x) / deg) + 360) % 360;
          if (vA.y < 65.8) {
            const inQuarry = (!isVoid && vA.y < 24.0 && radI >= 240.0 && radI <= 495.0 && angDiffDeg(thI, 20.0) < 24.0);
            if (!inQuarry) continue;
          } else if (vA.y < maxPruneY && radI > keepRadius) {
            continue;
          }
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
        const isCourtSurf = (typeof MAT !== 'undefined' && (
          o.material === MAT.drPaveR || o.material === MAT.drLawnR ||
          o.material === MAT.drPave || o.material === MAT.drLawn ||
          o.material === MAT.drScar || o.material === MAT.drVoid
        ));
        const isFinMat = (typeof MAT !== 'undefined' && (
          o.material === MAT.drConcR || o.material === MAT.drConc ||
          o.material === MAT.drSlotR || o.material === MAT.drSlot
        ));
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
          const rad = Math.hypot(cx, cz);
          const thDeg = ((Math.atan2(cz, cx) / deg) + 360) % 360;
          let drop = false;

          if (cy < 65.5) {
            if (isCourtSurf) {
              drop = true;
            } else if (rad >= 242.0 && rad <= 495.0 && angDiffDeg(thDeg, 20.0) < 24.0) {
              drop = false;
            } else if (rad > 85.6) {
              drop = !(isFinMat && nearStructuralFin(cx, cz, cy) && nearStructuralFin(vA.x, vA.z, vA.y) && nearStructuralFin(vB.x, vB.z, vB.y));
            } else if (rad > 78.0) {
              if (angDiffDeg(thDeg, 20.0) < 29.0) {
                drop = true;
              } else {
                for (let bk = 1; bk <= 10; bk++) {
                  const bDeg = 35.0 + 30.0 * bk;
                  if (angDiffDeg(thDeg, bDeg) < 3.4 && (cy % 4.4) < 3.6) { drop = true; break; }
                }
              }
            }
          } else if (cy < maxPruneY && rad > keepRadius) {
            drop = true;
          }

          if (drop) prunedAny = true;
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

  return {
    MATS: MATS,
    bindPbrMats: bindPbrMats,
    getFurnDetailMaps: getFurnDetailMaps,
    bakeGeo: bakeGeo,
    mergeGeoList: mergeGeoList,
    slabPolyGeo: slabPolyGeo,
    polarSectorGeo: polarSectorGeo,
    radialRoadGeo: radialRoadGeo,
    stripRampGeo: stripRampGeo,
    extractProtoParts: extractProtoParts,
    mergePlacedPrototypes: mergePlacedPrototypes,
    pruneArcologySkirt: pruneArcologySkirt
  };
})();

// Build PBR-textured valley floor, non-overlapping intra-wall ground, Drim Rivrh channel, and zero-overlap stitched street ribbons
(function buildDrumStageTerrain() {
  const N = 160, EXT = 1600;
  const nv = (N + 1) * (N + 1);
  const pos = new Float32Array(nv * 3);
  const col = new Float32Array(nv * 3);
  const uv = new Float32Array(nv * 2);
  const idx = [];
  const deg = Math.PI / 180;
  function surfaceMeshY(x, z) {
    const nx = Math.cos(320 * deg), nz = Math.sin(320 * deg);
    const tx = -nz, tz = nx;
    const dn = x * nx + z * nz;
    const dt = x * tx + z * tz;
    const rc = 615.0 + 18.0 * Math.sin(dt / 280.0);
    const rd = Math.abs(dn - rc);
    if (rd < 28.0) {
      const u = Math.max(0, 1.0 - (rd / 28.0) * (rd / 28.0));
      return -3.6 * u;
    }
    const r = Math.hypot(x, z);
    // Recess underlying coarse terrain inside the walled city (r < 644 m) to -0.24 m so city earth (-0.065 m),
    // streets (-0.008..+0.018 m), and building podiums (+0.055 m) have zero Z-fighting!
    if (r < 644.0) return -0.24;
    if (r < 668.0) {
      const s = (r - 644.0) / 24.0;
      return -0.24 * (1.0 - s);
    }
    if (r > 700.0) {
      const t = Math.min(1.0, (r - 700.0) / 1400.0);
      const n = KRAND.fbm(x / 320.0, 0.5, z / 320.0, 3, 6739);
      return t * (16.0 * n + 8.0 * t);
    }
    return 0.0;
  }
  for (let j = 0; j <= N; j++) {
    const z = -EXT + (2 * EXT * j) / N;
    for (let i = 0; i <= N; i++) {
      const x = -EXT + (2 * EXT * i) / N;
      const y = surfaceMeshY(x, z);
      const k = (j * (N + 1) + i) * 3;
      const ku = (j * (N + 1) + i) * 2;
      pos[k] = x; pos[k + 1] = y; pos[k + 2] = z;
      uv[ku] = x / 10.0; uv[ku + 1] = z / 10.0;
      const r = Math.hypot(x, z);
      const a = ((Math.atan2(z, x) / deg) + 360) % 360;
      const n = KRAND.fbm(x / 85, 0.3, z / 85, 3, 6731);
      let cr = 0.44 + 0.06 * n, cg = 0.40 + 0.05 * n, cb = 0.31 + 0.04 * n;
      if (y < -0.6) { cr = 0.32; cg = 0.31; cb = 0.26; }
      else if (r <= 646) { cr = 0.46 + 0.05 * n; cg = 0.41 + 0.04 * n; cb = 0.33 + 0.03 * n; }
      else { cr = 0.41 + 0.07 * n; cg = 0.43 + 0.06 * n; cb = 0.28 + 0.04 * n; }
      if (r >= 216 && r <= 518 && Math.min(Math.abs(a - 20), 360 - Math.abs(a - 20)) <= 30) {
        cr = 0.54 + 0.05 * n; cg = 0.51 + 0.05 * n; cb = 0.46 + 0.04 * n;
      }
      col[k] = Math.pow(Math.max(0, cr), 2.2);
      col[k + 1] = Math.pow(Math.max(0, cg), 2.2);
      col[k + 2] = Math.pow(Math.max(0, cb), 2.2);
    }
  }
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const xm = -EXT + (2 * EXT * (i + 0.5)) / N;
      const zm = -EXT + (2 * EXT * (j + 0.5)) / N;
      if (drumInExcavation(xm, zm, 18.0) !== null) continue;
      const a = j * (N + 1) + i, b = a + 1, c = a + N + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const ground = new THREE.Mesh(g, DRUM_DRAW.MATS.terrain);
  ground.userData.probeSkip = true;
  ground.userData.ground = true;
  ground.userData.khost = true;
  scene.add(ground);

  // Continuous, non-overlapping PBR-textured intra-wall city earth disc (r = 204..644 m at y = -0.065 m)
  const earthBands = [];
  for (let rb = 0; rb < 14; rb++) {
    const ra = 204.0 + (440.0 * rb) / 14;
    const rc = 204.0 + (440.0 * (rb + 1)) / 14;
    const eg = DRUM_DRAW.polarSectorGeo(ra, rc, 0, 360, 120, -0.065, null);
    if (eg) earthBands.push(eg);
  }
  if (earthBands.length) {
    const cityEarthMesh = new THREE.Mesh(DRUM_DRAW.mergeGeoList(earthBands), DRUM_DRAW.MATS.cityEarth);
    cityEarthMesh.userData.probeSkip = true;
    cityEarthMesh.userData.khost = true;
    scene.add(cityEarthMesh);
  }

  // Non-overlapping rotated ground collars (yTop = -0.045 m) + subterranean pit retaining walls around the 3 F-1 excavations
  const collarGeos = [], pitWallGeos = [];
  for (let li = 0; li < DRUM_STAGE4.landmarks.length; li++) {
    const B = DRUM_STAGE4.landmarks[li];
    const ex = B.excavation;
    if (!ex) continue;
    const c = Math.cos(B.lm.ry), s = Math.sin(B.lm.ry);
    const pad = 34.0;
    // Left/Right span full [z0-pad .. z1+pad]; Front/Back span strictly [x0 .. x1] so the 4 corners NEVER overlap!
    const strips = [
      [ex.x0 - 0.5 * pad, 0, pad, (ex.z1 - ex.z0) + 2 * pad],
      [ex.x1 + 0.5 * pad, 0, pad, (ex.z1 - ex.z0) + 2 * pad],
      [(ex.x0 + ex.x1) * 0.5, ex.z0 - 0.5 * pad, ex.x1 - ex.x0, pad],
      [(ex.x0 + ex.x1) * 0.5, ex.z1 + 0.5 * pad, ex.x1 - ex.x0, pad]
    ];
    for (let st = 0; st < strips.length; st++) {
      const lx = strips[st][0], lz = strips[st][1], sw = strips[st][2], sd = strips[st][3];
      const wx = B.lm.x + lx * c + lz * s, wz = B.lm.z - lx * s + lz * c;
      const m4c = new THREE.Matrix4().makeRotationY(B.lm.ry).setPosition(wx, -0.145, wz);
      collarGeos.push(DRUM_DRAW.bakeGeo(new THREE.BoxGeometry(sw, 0.20, sd), m4c));
    }
    const ph = Math.abs(ex.y);
    const pw = [
      [ex.x0 - 0.3, (ex.z0 + ex.z1) * 0.5, 0.6, (ex.z1 - ex.z0) + 1.2],
      [ex.x1 + 0.3, (ex.z0 + ex.z1) * 0.5, 0.6, (ex.z1 - ex.z0) + 1.2],
      [(ex.x0 + ex.x1) * 0.5, ex.z0 - 0.3, ex.x1 - ex.x0, 0.6],
      [(ex.x0 + ex.x1) * 0.5, ex.z1 + 0.3, ex.x1 - ex.x0, 0.6]
    ];
    for (let p = 0; p < pw.length; p++) {
      const lx = pw[p][0], lz = pw[p][1], sw = pw[p][2], sd = pw[p][3];
      const wx = B.lm.x + lx * c + lz * s, wz = B.lm.z - lx * s + lz * c;
      const m4p = new THREE.Matrix4().makeRotationY(B.lm.ry).setPosition(wx, -0.5 * ph - 0.04, wz);
      pitWallGeos.push(DRUM_DRAW.bakeGeo(new THREE.BoxGeometry(sw, ph, sd), m4p));
    }
  }
  if (collarGeos.length) {
    const collarMesh = new THREE.Mesh(DRUM_DRAW.mergeGeoList(collarGeos), DRUM_DRAW.MATS.cityEarth);
    collarMesh.userData.probeSkip = true;
    collarMesh.userData.khost = true;
    scene.add(collarMesh);
  }
  if (pitWallGeos.length) {
    const pitMesh = new THREE.Mesh(DRUM_DRAW.mergeGeoList(pitWallGeos), DRUM_DRAW.MATS.basalt);
    pitMesh.userData.probeSkip = true;
    pitMesh.userData.khost = true;
    scene.add(pitMesh);
  }

  // Drim Rivrh water ribbon along NW flank (bearing 320 deg, dist 615 m)
  const nx = Math.cos(320 * deg), nz = Math.sin(320 * deg);
  const tx = -nz, tz = nx;
  const wGeos = [];
  const segs = 64;
  for (let s = 0; s < segs; s++) {
    const t0 = -1500 + (3000 * s) / segs, t1 = -1500 + (3000 * (s + 1)) / segs;
    const tm = 0.5 * (t0 + t1);
    const dn = 615.0 + 18.0 * Math.sin(tm / 280.0);
    const wx = dn * nx + tm * tx, wz = dn * nz + tm * tz;
    const ang = Math.atan2(-(dn * nz + t1 * tz - (dn * nz + t0 * tz)), (dn * nx + t1 * tx - (dn * nx + t0 * tx)));
    const m4 = new THREE.Matrix4().makeRotationY(ang).setPosition(wx, -1.35, wz);
    wGeos.push(DRUM_DRAW.bakeGeo(new THREE.BoxGeometry(t1 - t0, 0.36, 42.0), m4));
  }
  const waterMesh = new THREE.Mesh(DRUM_DRAW.mergeGeoList(wGeos), DRUM_DRAW.MATS.water);
  waterMesh.userData.probeSkip = true;
  waterMesh.userData.khost = true;
  scene.add(waterMesh);

  // Single non-overlapping Scrap-Market plaza sector (deg 52..92, r = 228..490, yTop = -0.032 m)
  const plazaGeo = DRUM_DRAW.polarSectorGeo(228.0, 490.0, 52.0, 92.0, 24, -0.032, -0.18);
  if (plazaGeo) {
    const plazaMesh = new THREE.Mesh(plazaGeo, DRUM_DRAW.MATS.plazaPave);
    plazaMesh.userData.probeSkip = true;
    plazaMesh.userData.khost = true;
    scene.add(plazaMesh);
  }

  // Zero-overlap vertex-stitched Ring Streets (yTop = -0.008 m) & Radial Spokes (yTop = +0.018 m)
  const innerGeos = [], outerGeos = [];
  for (let i = 0; i < DRUM_PLAN.roads.length; i++) {
    const rd = DRUM_PLAN.roads[i];
    if (rd.kind === 'ring') {
      const r = rd.r, hw = 0.5 * rd.width;
      const rg = DRUM_DRAW.polarSectorGeo(r - hw, r + hw, 0, 360, 144, -0.008, -0.14);
      if (rg) {
        if (r < 402) innerGeos.push(rg); else outerGeos.push(rg);
      }
    } else {
      const totalLen = rd.r1 - rd.r0;
      if (totalLen <= 2) continue;
      const sg = DRUM_DRAW.radialRoadGeo(rd.r0, rd.r1, rd.deg, rd.width, 0.018, -0.12);
      if (sg) {
        if (rd.r0 < 402) innerGeos.push(sg); else outerGeos.push(sg);
      }
    }
  }
  if (innerGeos.length) {
    const mIn = new THREE.Mesh(DRUM_DRAW.mergeGeoList(innerGeos), DRUM_DRAW.MATS.roadInner);
    mIn.userData.probeSkip = true;
    mIn.userData.khost = true;
    scene.add(mIn);
  }
  if (outerGeos.length) {
    const mOut = new THREE.Mesh(DRUM_DRAW.mergeGeoList(outerGeos), DRUM_DRAW.MATS.roadOuter);
    mOut.userData.probeSkip = true;
    mOut.userData.khost = true;
    scene.add(mOut);
  }
})();
