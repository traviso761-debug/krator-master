// ================================================================= JIMJAM — WebGL Stage, KMASK Field & Scale Model 5.1 Ground Meshes
// [web] Renderer, scene, camera, lights, kit-socket preservation (JJ_ANC_SOCK), KMASK.canvas road/plaza/maidan field,
// and near (10 m, 5.4 x 4.9 km) + regional (380 m, 30.4 x 30.4 km Great Trough Lake & rim) terrain meshes matching
// KDRAWN.grid's exact (a, b, d) / (b, c, d) cell triangulation.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xcddae4, 0.000052);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.6, 42000);

const hemi = new THREE.HemisphereLight(0xdceaf8, 0x62503e, 0.70);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d6, 1.44);
sun.position.set(-2800, 3600, 1800);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xc4daf4, 0.26);
fill.position.set(2200, 1600, -2400);
scene.add(fill);

let NIGHT = false;
let DOUBLE_DARK = false;
const FRAME_HOOKS = [];
const FRAME_HOOKS_PRE = [];
terrainH = function (x, z) { return JJ_GROUND.h(x, z); };

tick(function (dt, t) {
  const gY = JJ_GROUND.h(camera.position.x, camera.position.z);
  const clearY = Math.max(0, camera.position.y - gY);
  const wantNear = Math.max(0.6, Math.min(20.0, clearY * 0.040));
  if (Math.abs(wantNear - camera.near) > 0.04) {
    camera.near = wantNear;
    camera.updateProjectionMatrix();
  }
  for (let i = 0; i < FRAME_HOOKS_PRE.length; i++) FRAME_HOOKS_PRE[i](dt, t);
  for (let i = 0; i < FRAME_HOOKS.length; i++) FRAME_HOOKS[i](dt, t);
});

/* Preserve Ancients 30-kit.js primitives before 61-jj-helpers.js overwrites globalThis.beam / box / quad / poly */
const JJ_ANC_SOCK = {
  beam: typeof beam === 'function' ? beam : null,
  box: typeof box === 'function' ? box : null,
  quad: typeof quad === 'function' ? quad : null,
  plane4: typeof plane4 === 'function' ? plane4 : null,
  decal: typeof decal === 'function' ? decal : null,
  poly: typeof poly === 'function' ? poly : null,
  W: typeof W === 'function' ? W : null,
  pick: typeof pick === 'function' ? pick : null
};

const JJ_STAGE = (function () {
  const L = JJ_LAYOUT.plan;

  /* 1. Deterministic CPU road, plaza, acropolis & maidan mask on KMASK.canvas (zero getImageData) */
  const roadMask = (function () {
    const mw = 680;
    const mh = 620;
    const x0 = -2600;
    const z0 = -2500;
    const spanX = 5400;
    const spanZ = 4900;
    const scX = mw / spanX;
    const scZ = mh / spanZ;
    const cv = KMASK.canvas(mw, mh);
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, mw, mh);

    function toPx(x) { return (x - x0) * scX; }
    function toPy(z) { return (z - z0) * scZ; }
    function grayHex(v) {
      const b = Math.max(0, Math.min(255, Math.round(v * 255)));
      const h = ('0' + b.toString(16)).slice(-2);
      return '#' + h + h + h;
    }
    function strokePoly(pts, widthM, val) {
      if (!pts || pts.length < 2) return;
      ctx.strokeStyle = grayHex(val);
      ctx.lineWidth = Math.max(1.4, widthM * scX);
      ctx.beginPath();
      ctx.moveTo(toPx(pts[0][0]), toPy(pts[0][1]));
      for (let k = 1; k < pts.length; k++) {
        ctx.lineTo(toPx(pts[k][0]), toPy(pts[k][1]));
      }
      ctx.stroke();
    }
    function fillBox(cx, cz, wM, dM, val) {
      ctx.fillStyle = grayHex(val);
      ctx.fillRect(toPx(cx - wM * 0.5), toPy(cz - dM * 0.5), Math.max(1.5, wM * scX), Math.max(1.5, dM * scZ));
    }

    /* Compacted brick-earth urban ground inside the exact 9-gon walled metropolis + South Cut-Gate Suburb */
    if (L.wallRing && L.wallRing.length) {
      ctx.fillStyle = grayHex(0.42);
      ctx.beginPath();
      ctx.moveTo(toPx(L.wallRing[0].x0), toPy(L.wallRing[0].z0));
      for (let wi = 0; wi < L.wallRing.length; wi++) {
        ctx.lineTo(toPx(L.wallRing[wi].x1), toPy(L.wallRing[wi].z1));
      }
      ctx.closePath();
      ctx.fill();
    }
    fillBox(175, 1105, 1410, 275, 0.38);

    /* Clear the 6 curbed Urban Parks & Royal/Temple Gardens back to 0.0 so they render as emerald lawn! */
    const parks = L.parks || [];
    for (let pi = 0; pi < parks.length; pi++) {
      const pk = parks[pi];
      fillBox((pk.x0 + pk.x1) * 0.5, (pk.z0 + pk.z1) * 0.5, pk.x1 - pk.x0, pk.z1 - pk.z0, 0.0);
    }

    const ways = L.ways || [];
    for (let i = 0; i < ways.length; i++) {
      const w = ways[i];
      if (w.pts && w.pts.length >= 2) {
        strokePoly(w.pts, (w.w == null ? 6.5 : w.w) + 3.0, 1.0);
      }
    }

    /* Paved monumental courts: Solar Acropolis, Palace/Sunray Spine, Lotus Harbour Apron, White-Pass Compound,
       Izani Ruin Forecourt, and Great Pilgrim's Market Fairground */
    fillBox(-745, -90, 310, 330, 0.94);
    fillBox(-18, 20, 210, 250, 0.96);
    fillBox(-680, -1630, 460, 140, 0.92);
    fillBox(340, -1375, 130, 120, 0.88);
    fillBox(860, 740, 140, 125, 0.86);
    fillBox(-165, 1060, 320, 150, 0.92);

    const bytes = cv.data;
    return {
      canvas: cv,
      sample: function (x, z) {
        const fx = (x - x0) * scX - 0.5;
        const fy = (z - z0) * scZ - 0.5;
        if (fx < 0 || fy < 0 || fx >= mw - 1 || fy >= mh - 1) return 0;
        const ix = Math.floor(fx);
        const iy = Math.floor(fy);
        const u = fx - ix;
        const v = fy - iy;
        const o00 = (iy * mw + ix) * 4;
        const o10 = o00 + 4;
        const o01 = o00 + mw * 4;
        const o11 = o01 + 4;
        const b = (bytes[o00] * (1 - u) + bytes[o10] * u) * (1 - v) +
                  (bytes[o01] * (1 - u) + bytes[o11] * u) * v;
        return b / 255.0;
      }
    };
  })();

  function makeGrainTex() {
    const sz = 128;
    const cv = document.createElement('canvas');
    cv.width = sz;
    cv.height = sz;
    const g = cv.getContext('2d');
    const img = g.createImageData(sz, sz);
    const data = img.data;
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const n1 = KRAND.fbm(x * 0.15, y * 0.15, 2.3, 3, 7451);
        const n2 = KRAND.fbm(x * 0.45 + 19, y * 0.45 - 11, 5.3, 2, 7452);
        const v = Math.max(206, Math.min(255, Math.round(238 + (n1 - 0.5) * 34 + (n2 - 0.5) * 18)));
        const k = (y * sz + x) * 4;
        data[k] = v;
        data[k + 1] = v;
        data[k + 2] = Math.min(255, v + 1);
        data[k + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    const tx = new THREE.CanvasTexture(cv);
    tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    tx.encoding = THREE.sRGBEncoding;
    tx.anisotropy = 4;
    tx.needsUpdate = true;
    return tx;
  }

  function nwlowGroundTex(slot, fallback) {
    if (typeof KMAT !== 'undefined' && KMAT.mode === 'lib' && KMAT.packed) {
      const rec = KMAT.packed('nwlowlands', slot);
      if (rec) return KMAT.textures(rec, { aniso: 8 }).map;
    }
    return fallback;
  }

  const grainTex = makeGrainTex();
  const detailTex = nwlowGroundTex('groundDetail', grainTex);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: grainTex,
    roughness: 0.93,
    metalness: 0.01,
    vertexColors: true
  });

  /* Inject world-space detail grain + KGROUND anchor, then bind all 6 biomes/nwlowlands PBR ground layers
     as a single WebGL2 DataTexture2DArray (1 sampler unit!) with Mikkelsen hex-tiling & bump/cavity relief */
  groundMat.onBeforeCompile = function (sh) {
    sh.uniforms.uDetail = { value: detailTex };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 aGL;\nattribute vec3 aGL2;\nvarying vec4 vGL;\nvarying vec3 vGL2;\nvarying vec3 vGWP;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvGL = aGL;\nvGL2 = aGL2;\nvGWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uDetail;\nvarying vec4 vGL;\nvarying vec3 vGL2;\nvarying vec3 vGWP;')
      .replace('#include <map_fragment>', '#include <map_fragment>\n{vec3 dt=mapTexelToLinear(texture2D(uDetail,vGWP.xz*0.165)).rgb;vec3 dt2=mapTexelToLinear(texture2D(uDetail,vGWP.xz*0.022+0.37)).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.82);\n/*KGROUND*/}');
  };

  const hasKGround = typeof KGROUND !== 'undefined' && typeof KGROUND.layer === 'function';
  let kgroundActive = false;
  if (hasKGround) {
    const kgLayer = function (slot, wExpr, amt, gain) {
      return KGROUND.layer('nwlowlands', slot, { w: wExpr, amt: amt, gain: gain, tint: 'diffuse' });
    };
    const kgLayers = [
      kgLayer('ground.rainfloor', 'vGL.x',  0.72, 1.12),
      kgLayer('ground.lawn',      'vGL.y',  0.82, 1.18),
      kgLayer('groundDry',        'vGL.z',  0.70, 1.08),
      kgLayer('groundSand',       'vGL.w',  0.80, 1.06),
      kgLayer('groundMud',        'vGL2.x', 0.82, 0.86),
      kgLayer('groundGravel',     'vGL2.y', 0.85, 1.02)
    ].filter(Boolean);
    if (kgLayers.length) {
      KGROUND.hook(groundMat, {
        array: true,
        layers: kgLayers,
        key: 'jj-nwlowlands-ground',
        relief: { bump: 0.08, cavity: 0.78, mesh: 1 }
      });
      kgroundActive = true;
    }
  }

  function srgbToLin(c) {
    return Math.pow(Math.max(0, Math.min(1, c)), 2.2);
  }

  function clamp01(v) {
    return v < 0 ? 0 : (v > 1 ? 1 : v);
  }

  function inAnyPark(x, z) {
    const parks = L.parks || [];
    for (let i = 0; i < parks.length; i++) {
      const pk = parks[i];
      if (x >= pk.x0 && x <= pk.x1 && z >= pk.z0 && z <= pk.z1) return true;
    }
    return false;
  }

  function inUrbanFootprint(x, z) {
    if (JJ_LAYOUT.wallSignedDist && JJ_LAYOUT.wallSignedDist(x, z) > -6.0) return true;
    if (x > -525 && x < 875 && z > 945 && z < 1245) return true;
    if (x > -950 && x < -470 && z > -1685 && z < -1575) return true;
    return false;
  }

  function groundWeights(x, y, z, ny, isFar, out4, out3, k4, k3) {
    const road = isFar ? 0 : roadMask.sample(x, z);
    const dLake = y - JJ_GROUND.lakeY;
    const dCanal = isFar ? 999 : JJ_GROUND.canal.dist(x, z);
    const n1 = KRAND.fbm(x * 0.006, z * 0.006, 2.7, 2, 5465);
    const isPark = (!isFar && inAnyPark(x, z));
    const inUrban = (!isFar && inUrbanFootprint(x, z));

    let wRain = 0, wLawn = 0, wDry = 0, wSand = 0, wMud = 0, wGravel = 0;
    if (dLake < 2.6) {
      wMud = clamp01(1.0 - Math.abs(dLake) / 1.8) * 0.85;
      wSand = clamp01(1.0 - Math.max(0, dLake - 0.3) / 2.4) * 0.92;
    } else if (isPark) {
      /* Curbed Urban Parks & Formal Royal/Temple Gardens: lush manicured nwlowlands emerald lawn & rainfloor! */
      wLawn = 0.88;
      wRain = 0.38 + 0.16 * n1;
      wGravel = 0.04;
    } else if (road > 0.55) {
      wGravel = clamp01((road - 0.45) / 0.50) * 0.95;
      wDry = 0.22 * (1.0 - wGravel);
    } else if (ny < 0.85) {
      wDry = 0.88;
      wGravel = 0.32;
    } else if (inUrban) {
      /* Dense urban block rear courtyards & side alleys: compacted crushed-brick, laterite gravel & stone earth */
      wGravel = 0.72 + 0.14 * (n1 - 0.5);
      wDry = 0.34 - 0.10 * (n1 - 0.5);
      wLawn = 0.05;
    } else {
      /* Surrounding NW Lowlands monsoon benches, canal meadows, clay banks & paddy hinterland */
      const wetPatch = clamp01(0.45 + (n1 - 0.5) * 1.3 + (dCanal < 90 ? 0.40 : 0));
      wRain = clamp01((wetPatch - 0.52) * 1.8) * 0.72;
      wLawn = clamp01(0.88 - wRain * 0.35);
      wDry = clamp01((0.48 - wetPatch) * 1.6) * 0.65;
      if (!isFar && (Math.hypot(x - 1980, z + 320) < 250 || Math.hypot(x - 1680, z - 1280) < 250)) {
        wDry = 0.82;
        wGravel = 0.48;
        wLawn *= 0.25;
      }
    }
    if (dCanal < 11.0) {
      wMud = Math.max(wMud, 0.78);
      wGravel = Math.max(wGravel, 0.35);
    }
    out4[k4] = wRain;
    out4[k4 + 1] = wLawn;
    out4[k4 + 2] = wDry;
    out4[k4 + 3] = wSand;
    out3[k3] = wMud;
    out3[k3 + 1] = wGravel;
    out3[k3 + 2] = 0;
  }

  function colorVertex(x, y, z, ny, isFar, out, k) {
    const n1 = KRAND.fbm(x * 0.0085, z * 0.0085, 3.3, 3, 5461);
    const n2 = KRAND.fbm(x * 0.035 + 21, z * 0.035 - 17, 6.5, 2, 5462);
    const road = isFar ? 0 : roadMask.sample(x, z);
    const isPark = (!isFar && inAnyPark(x, z));
    const inUrban = (!isFar && inUrbanFootprint(x, z));
    let r = 0.36;
    let g = 0.49;
    let b = 0.29;

    /* 1. Great Trough Lake (+429.78 m ASL = JJ_GROUND.lakeY) bed & slackwater marl strand */
    if (y < JJ_GROUND.lakeY + 1.8) {
      if (y <= JJ_GROUND.lakeY) {
        r = 0.21 + 0.05 * n1;
        g = 0.35 + 0.06 * n1;
        b = 0.41 + 0.06 * n1;
      } else {
        /* Warm yellow-marl & shingle lake strand */
        r = 0.72 + 0.06 * (n1 - 0.5);
        g = 0.65 + 0.05 * (n2 - 0.5);
        b = 0.52 + 0.05 * (n1 - 0.5);
      }
      out[k] = srgbToLin(r);
      out[k + 1] = srgbToLin(g);
      out[k + 2] = srgbToLin(b);
      return;
    }

    if (isPark) {
      /* Rich manicured emerald lawn inside the 6 curbed Urban Parks & Royal/Temple Gardens */
      r = 0.25 + 0.06 * n1 + 0.03 * (n2 - 0.5);
      g = 0.49 + 0.09 * n1 + 0.03 * (n2 - 0.5);
      b = 0.21 + 0.05 * n1;
    } else if (road > 0.52) {
      /* Warm red-and-buff crushed brick & pale marble avenue paving */
      const t = Math.min(1, (road - 0.52) / 0.42);
      const monumental = road > 0.85;
      const cr = (monumental ? 0.76 : 0.65) + 0.05 * (n2 - 0.5);
      const cg = (monumental ? 0.70 : 0.55) + 0.05 * (n2 - 0.5);
      const cb = (monumental ? 0.60 : 0.44) + 0.04 * (n2 - 0.5);
      const ur = 0.59 + 0.05 * (n1 - 0.5);
      const ug = 0.49 + 0.04 * (n1 - 0.5);
      const ub = 0.39 + 0.04 * (n1 - 0.5);
      r = ur * (1 - t) + cr * t;
      g = ug * (1 - t) + cg * t;
      b = ub * (1 - t) + cb * t;
    } else if (ny < 0.84) {
      /* Exposed red-silt and yellow-marl palaeoflood rhythmite strata on bench scarps */
      const band = ((Math.floor((y + n1 * 5) / 3.2) & 1) === 0);
      r = (band ? 0.64 : 0.72) + 0.06 * n1;
      g = (band ? 0.39 : 0.58) + 0.06 * n1;
      b = (band ? 0.28 : 0.41) + 0.05 * n1;
    } else if (inUrban) {
      /* Warm compacted terracotta-buff courtyard earth & crushed brick gravel inside city blocks */
      r = 0.59 + 0.06 * (n1 - 0.5) + 0.04 * (n2 - 0.5);
      g = 0.49 + 0.05 * (n1 - 0.5) + 0.04 * (n2 - 0.5);
      b = 0.39 + 0.04 * (n1 - 0.5) + 0.03 * (n2 - 0.5);
    } else {
      /* Lush 1.51 atm tropical-monsoon turf, paddy green, eastern clay bank & gypsum bench */
      r = 0.33 + 0.09 * n1 + 0.04 * (n2 - 0.5);
      g = 0.49 + 0.11 * n1 + 0.04 * (n2 - 0.5);
      b = 0.26 + 0.06 * n1;

      if (!isFar && Math.hypot(x - 1980, z + 320) < 250) {
        const cl = Math.max(0, 1 - Math.hypot(x - 1980, z + 320) / 250) * 0.75;
        r = r * (1 - cl) + 0.66 * cl;
        g = g * (1 - cl) + 0.39 * cl;
        b = b * (1 - cl) + 0.27 * cl;
      }
      if (!isFar && Math.hypot(x - 1680, z - 1280) < 250) {
        const gy = Math.max(0, 1 - Math.hypot(x - 1680, z - 1280) / 250) * 0.72;
        r = r * (1 - gy) + 0.84 * gy;
        g = g * (1 - gy) + 0.81 * gy;
        b = b * (1 - gy) + 0.74 * gy;
      }
      if (!isFar && JJ_GROUND.canal.dist(x, z) < 9.5) {
        r = 0.34;
        g = 0.36;
        b = 0.35;
      }
    }

    out[k] = srgbToLin(r);
    out[k + 1] = srgbToLin(g);
    out[k + 2] = srgbToLin(b);
  }

  function buildGridMeshes(G, isFar) {
    const nx = G.nx;
    const nz = G.nz;
    const row = nx + 1;
    const nv = row * (nz + 1);
    const fullPos = new Float32Array(nv * 3);
    const fullCol = new Float32Array(nv * 3);
    const fullGL = new Float32Array(nv * 4);
    const fullGL2 = new Float32Array(nv * 3);
    const uvScale = isFar ? 0.012 : 0.085;

    for (let iz = 0; iz <= nz; iz++) {
      const z = G.z0 + iz * G.dz;
      for (let ix = 0; ix <= nx; ix++) {
        const x = G.x0 + ix * G.dx;
        const vi = iz * row + ix;
        let y = G.h[vi];
        if (isFar && x > -2450 && x < 2650 && z > -2350 && z < 2250) {
          y -= 18.0;
        }
        fullPos[vi * 3] = x;
        fullPos[vi * 3 + 1] = y;
        fullPos[vi * 3 + 2] = z;
      }
    }

    const fullIdx = [];
    for (let iz = 0; iz < nz; iz++) {
      for (let ix = 0; ix < nx; ix++) {
        const a = iz * row + ix;
        const d = a + 1;
        const b = a + row;
        const c = b + 1;
        fullIdx.push(a, b, d, b, c, d);
      }
    }
    const tmpGeo = new THREE.BufferGeometry();
    tmpGeo.setAttribute('position', new THREE.BufferAttribute(fullPos, 3));
    tmpGeo.setIndex(fullIdx);
    tmpGeo.computeVertexNormals();
    const fullNorm = tmpGeo.attributes.normal.array;
    for (let vi = 0; vi < nv; vi++) {
      const vx = fullPos[vi * 3], vy = fullPos[vi * 3 + 1], vz = fullPos[vi * 3 + 2], vny = fullNorm[vi * 3 + 1];
      colorVertex(vx, vy, vz, vny, isFar, fullCol, vi * 3);
      groundWeights(vx, vy, vz, vny, isFar, fullGL, fullGL2, vi * 4, vi * 3);
    }

    const tiles = isFar ? 2 : 9;
    const stepX = Math.ceil(nx / tiles);
    const stepZ = Math.ceil(nz / tiles);
    const group = new THREE.Group();
    group.name = isFar ? 'jj-ground-far-group' : 'jj-ground-near-group';
    group.userData.probeSkip = true;
    group.userData.ground = true;
    group.userData.isGround = true;
    group.userData.lodSkip = true;

    for (let tz = 0; tz < tiles; tz++) {
      const iz0 = tz * stepZ;
      const iz1 = Math.min(nz, iz0 + stepZ);
      if (iz0 >= iz1) continue;
      for (let tx = 0; tx < tiles; tx++) {
        const ix0 = tx * stepX;
        const ix1 = Math.min(nx, ix0 + stepX);
        if (ix0 >= ix1) continue;

        const subCols = ix1 - ix0 + 1;
        const subRows = iz1 - iz0 + 1;
        const subNv = subCols * subRows;
        const pos = new Float32Array(subNv * 3);
        const nrm = new Float32Array(subNv * 3);
        const uv = new Float32Array(subNv * 2);
        const col = new Float32Array(subNv * 3);
        const gl4 = new Float32Array(subNv * 4);
        const gl3 = new Float32Array(subNv * 3);

        for (let lj = 0; lj < subRows; lj++) {
          const iz = iz0 + lj;
          for (let li = 0; li < subCols; li++) {
            const ix = ix0 + li;
            const srcVi = iz * row + ix;
            const dstVi = lj * subCols + li;
            const x = fullPos[srcVi * 3];
            const y = fullPos[srcVi * 3 + 1];
            const z = fullPos[srcVi * 3 + 2];
            pos[dstVi * 3] = x;
            pos[dstVi * 3 + 1] = y;
            pos[dstVi * 3 + 2] = z;
            nrm[dstVi * 3] = fullNorm[srcVi * 3];
            nrm[dstVi * 3 + 1] = fullNorm[srcVi * 3 + 1];
            nrm[dstVi * 3 + 2] = fullNorm[srcVi * 3 + 2];
            uv[dstVi * 2] = x * uvScale;
            uv[dstVi * 2 + 1] = z * uvScale;
            col[dstVi * 3] = fullCol[srcVi * 3];
            col[dstVi * 3 + 1] = fullCol[srcVi * 3 + 1];
            col[dstVi * 3 + 2] = fullCol[srcVi * 3 + 2];
            gl4[dstVi * 4] = fullGL[srcVi * 4];
            gl4[dstVi * 4 + 1] = fullGL[srcVi * 4 + 1];
            gl4[dstVi * 4 + 2] = fullGL[srcVi * 4 + 2];
            gl4[dstVi * 4 + 3] = fullGL[srcVi * 4 + 3];
            gl3[dstVi * 3] = fullGL2[srcVi * 3];
            gl3[dstVi * 3 + 1] = fullGL2[srcVi * 3 + 1];
            gl3[dstVi * 3 + 2] = fullGL2[srcVi * 3 + 2];
          }
        }

        const idx = [];
        for (let lj = 0; lj < subRows - 1; lj++) {
          const iz = iz0 + lj;
          for (let li = 0; li < subCols - 1; li++) {
            const ix = ix0 + li;
            if (isFar) {
              const cx = G.x0 + (ix + 0.5) * G.dx;
              const cz = G.z0 + (iz + 0.5) * G.dz;
              if (cx > -2200 && cx < 2400 && cz > -2100 && cz < 2000) continue;
            }
            const a = lj * subCols + li;
            const d = a + 1;
            const b = a + subCols;
            const c = b + 1;
            idx.push(a, b, d, b, c, d);
          }
        }
        if (!idx.length) continue;

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
        geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        geo.setAttribute('aGL', new THREE.BufferAttribute(gl4, 4));
        geo.setAttribute('aGL2', new THREE.BufferAttribute(gl3, 3));
        geo.setIndex(idx);
        geo.computeBoundingSphere();

        const m = new THREE.Mesh(geo, groundMat);
        if (kgroundActive && typeof KGROUND.cavityMesh === 'function') {
          if (!isFar) {
            KGROUND.cavityMesh(m, { rings: [3, 18], depth: [0.5, 4] });
          } else {
            const ao = new Float32Array(subNv);
            geo.setAttribute('aKGAO', new THREE.BufferAttribute(ao, 1));
          }
        }
        m.name = (isFar ? 'jj-ground-far-' : 'jj-ground-near-') + tx + '-' + tz;
        m.userData.probeSkip = true;
        m.userData.ground = true;
        m.userData.isGround = true;
        m.userData.lodSkip = true;
        group.add(m);
      }
    }
    scene.add(group);
    return group;
  }

  const nearGridData = JJ_GROUND.nearGrid();
  const nearMesh = buildGridMeshes(nearGridData, false);
  const farMesh = buildGridMeshes(JJ_GROUND.farGrid(), true);

  /* Exact interpolated Y of the rendered near-ground triangles ((a,b,d) / (b,c,d) split) so 3D paved streets never sink! */
  function drawnH(x, z) {
    const G = nearGridData;
    const fx = (x - G.x0) / G.dx;
    const fz = (z - G.z0) / G.dz;
    if (fx < 0 || fz < 0 || fx >= G.nx || fz >= G.nz) return JJ_GROUND.h(x, z);
    const ix = Math.min(G.nx - 1, Math.floor(fx));
    const iz = Math.min(G.nz - 1, Math.floor(fz));
    const u = fx - ix;
    const v = fz - iz;
    const row = G.nx + 1;
    const a = G.h[iz * row + ix];
    const d = G.h[iz * row + ix + 1];
    const b = G.h[(iz + 1) * row + ix];
    const c = G.h[(iz + 1) * row + ix + 1];
    /* Triangle 1: a(0,0), b(0,1), d(1,0) -> u + v <= 1; Triangle 2: b(0,1), c(1,1), d(1,0) -> u + v > 1 */
    if (u + v <= 1.0) {
      return a + (d - a) * u + (b - a) * v;
    }
    return c + (b - c) * (1.0 - u) + (d - c) * (1.0 - v);
  }

  return {
    roadMask: roadMask,
    nearMesh: nearMesh,
    farMesh: farMesh,
    groundMat: groundMat,
    drawnH: drawnH
  };
})();
