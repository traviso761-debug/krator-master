// ================================================================= SKYWATCH — WebGL stage, KMASK road field & Scale Model 5.1 ground meshes
// [web] Renderer, scene, camera, lights, kit-socket preservation, KMASK.canvas road/plaza field, and near (10 m) + regional
// (400 m, 56 x 56 km) terrain meshes matching KDRAWN.grid's exact (a, b, d) / (b, c, d) cell triangulation.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio == null ? 1 : window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xc4d3df, 0.000048);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 68000);

const hemi = new THREE.HemisphereLight(0xd9e8f5, 0x52483e, 0.66);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1dc, 1.38);
sun.position.set(-2800, 3900, 1900);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xbdd4f2, 0.28);
fill.position.set(2200, 1600, -2500);
scene.add(fill);

let NIGHT = false;
const FRAME_HOOKS = [];
const FRAME_HOOKS_PRE = [];
terrainH = function (x, z) { return SW_GROUND.h(x, z); };

tick(function (dt, t) {
  for (let i = 0; i < FRAME_HOOKS_PRE.length; i++) FRAME_HOOKS_PRE[i](dt, t);
  for (let i = 0; i < FRAME_HOOKS.length; i++) FRAME_HOOKS[i](dt, t);
});

/* Preserve Ancients 30-kit.js primitives before 61-jj-helpers.js overwrites globalThis.beam / box / quad / poly */
const SW_ANC_SOCK = {
  beam: typeof beam === 'function' ? beam : null,
  box: typeof box === 'function' ? box : null,
  quad: typeof quad === 'function' ? quad : null,
  plane4: typeof plane4 === 'function' ? plane4 : null,
  decal: typeof decal === 'function' ? decal : null,
  poly: typeof poly === 'function' ? poly : null,
  W: typeof W === 'function' ? W : null,
  pick: typeof pick === 'function' ? pick : null
};

const SW_STAGE = (function () {
  const L = SW_LAYOUT.plan;

  /* 1. Deterministic CPU road & plaza mask on KMASK.canvas (zero getImageData) */
  const roadMask = (function () {
    const mw = 600;
    const mh = 600;
    const x0 = -2400;
    const z0 = -2400;
    const span = 4800;
    const scale = mw / span;
    const cv = KMASK.canvas(mw, mh);
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, mw, mh);

    function toPx(x) { return (x - x0) * scale; }
    function toPy(z) { return (z - z0) * scale; }
    function grayHex(v) {
      const b = Math.max(0, Math.min(255, Math.round(v * 255)));
      const h = ('0' + b.toString(16)).slice(-2);
      return '#' + h + h + h;
    }
    function strokePoly(pts, widthM, val) {
      if (!pts || pts.length < 2) return;
      ctx.strokeStyle = grayHex(val);
      ctx.lineWidth = Math.max(1.5, widthM * scale);
      ctx.beginPath();
      ctx.moveTo(toPx(pts[0][0]), toPy(pts[0][1]));
      for (let k = 1; k < pts.length; k++) {
        ctx.lineTo(toPx(pts[k][0]), toPy(pts[k][1]));
      }
      ctx.stroke();
    }
    function fillCircle(cx, cz, rM, val) {
      ctx.fillStyle = grayHex(val);
      ctx.beginPath();
      ctx.arc(toPx(cx), toPy(cz), Math.max(1.0, rM * scale), 0, Math.PI * 2);
      ctx.fill();
    }

    const ways = (L.ways || []).concat(L.channels || []);
    for (let i = 0; i < ways.length; i++) {
      const w = ways[i];
      if (w.pts && w.pts.length >= 2) {
        strokePoly(w.pts, (w.w == null ? 4.5 : w.w) + 2.4, 1.0);
      }
    }
    /* Paved plazas: Observatory Crag (-620, -280), Pass Toll Square (10, -70), Caravanserai (462, 185), Skarn Yard (694, -196), Silent Moot (380, -1140) */
    fillCircle(-620, -280, 92, 0.90);
    fillCircle(-550, -264, 24, 0.96);
    fillCircle(10, -70, 32, 0.92);
    fillCircle(462, 185, 62, 0.88);
    fillCircle(446, 286, 26, 0.85);
    fillCircle(694, -196, 58, 0.78);
    fillCircle(380, -1140, 34, 0.86);
    for (let ci = 0; ci < SW_GROUND.cisterns.length; ci++) {
      const c = SW_GROUND.cisterns[ci];
      fillCircle(c.x, c.z, Math.max(c.rimW, c.rimD) * 0.68, 0.94);
    }

    const bytes = cv.data;
    return {
      canvas: cv,
      sample: function (x, z) {
        const fx = (x - x0) * scale - 0.5;
        const fy = (z - z0) * scale - 0.5;
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

  /* Subtle world-UV basalt & alpine turf grain CanvasTexture (complete mipmaps + sRGB encoding) */
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
        const n1 = KRAND.fbm(x * 0.16, y * 0.16, 1.7, 3, 7761);
        const n2 = KRAND.fbm(x * 0.48 + 19, y * 0.48 - 11, 4.3, 2, 7762);
        const v = Math.max(204, Math.min(255, Math.round(236 + (n1 - 0.5) * 38 + (n2 - 0.5) * 22)));
        const k = (y * sz + x) * 4;
        data[k] = v;
        data[k + 1] = v;
        data[k + 2] = Math.min(255, v + 2);
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

  const grainTex = makeGrainTex();
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: grainTex,
    roughness: 0.90,
    metalness: 0.02,
    vertexColors: true
  });

  function srgbToLin(c) {
    return Math.pow(Math.max(0, Math.min(1, c)), 2.2);
  }

  function colorVertex(x, y, z, ny, isFar, out, k) {
    const n1 = KRAND.fbm(x * 0.011, z * 0.011, 2.3, 3, 4701);
    const n2 = KRAND.fbm(x * 0.045 + 31, z * 0.045 - 17, 5.9, 2, 4702);
    const road = isFar ? 0 : roadMask.sample(x, z);
    let r = 0.42;
    let g = 0.43;
    let b = 0.44;

    if (road > 0.28) {
      /* Dressed dark basalt & buff limestone road cobbles */
      const t = Math.min(1, (road - 0.28) / 0.52);
      const cr = 0.52 + 0.07 * (n2 - 0.5);
      const cg = 0.49 + 0.06 * (n2 - 0.5);
      const cb = 0.45 + 0.06 * (n2 - 0.5);
      r = r * (1 - t) + cr * t;
      g = g * (1 - t) + cg * t;
      b = b * (1 - t) + cb * t;
    } else if (ny < 0.77) {
      /* Columnar flood basalt cliffs & frost-wedged talus bands */
      const bed = ((Math.floor((y + n1 * 11) / 8.5) & 1) === 0) ? 1.0 : 0.84;
      r = (0.34 + 0.08 * n1) * bed;
      g = (0.35 + 0.08 * n1) * bed;
      b = (0.38 + 0.09 * n1) * bed;
      /* Skarn Contact Zone copper-malachite & calamine-ochre gossan staining (x: 590..960, z: -390..-40) */
      if (!isFar && x > 560 && x < 980 && z > -410 && z < -30) {
        const sk = Math.max(0, 1 - Math.hypot(x - 775, z + 220) / 260);
        r = r * (1 - 0.46 * sk) + 0.34 * sk;
        g = g * (1 - 0.46 * sk) + 0.56 * sk;
        b = b * (1 - 0.46 * sk) + 0.48 * sk;
      }
    } else {
      /* Alpine ground by elevation & aspect (+3,745 m datum) */
      const asl = SW_GROUND.datum + y;
      const snowBand = Math.max(0, Math.min(1, (asl - 3808 + (n1 - 0.5) * 46) / 68));
      const northMeadow = Math.max(0, Math.min(1, (-z - 40) / 380)) * Math.max(0, Math.min(1, (3772 - asl) / 95));
      const leeSteppe = Math.max(0, Math.min(1, (z - 30) / 360)) * Math.max(0, Math.min(1, (3780 - asl) / 110));

      /* Base alpine basalt gravel & golden fescue-sedge turf */
      r = 0.45 + 0.10 * n1 + 0.04 * (n2 - 0.5);
      g = 0.48 + 0.11 * n1 + 0.04 * (n2 - 0.5);
      b = 0.38 + 0.07 * n1;

      if (northMeadow > 0.01) {
        /* Sunny northern slope subalpine sedge, moss & timberline turf */
        const m = northMeadow * 0.78;
        r = r * (1 - m) + (0.36 + 0.09 * n2) * m;
        g = g * (1 - m) + (0.51 + 0.10 * n1) * m;
        b = b * (1 - m) + (0.30 + 0.06 * n2) * m;
      }
      if (leeSteppe > 0.01) {
        /* Southern & leeward tawny yak-pasture tussock */
        const s = leeSteppe * 0.65;
        r = r * (1 - s) + (0.54 + 0.09 * n1) * s;
        g = g * (1 - s) + (0.49 + 0.08 * n1) * s;
        b = b * (1 - s) + (0.35 + 0.06 * n2) * s;
      }
      if (snowBand > 0.02 && ny > 0.85) {
        /* Wind-packed drift snow in high alpine hollows & distant 4,000 m peaks */
        const sn = snowBand * Math.min(1, (ny - 0.85) / 0.11) * 0.88;
        r = r * (1 - sn) + 0.88 * sn;
        g = g * (1 - sn) + 0.91 * sn;
        b = b * (1 - sn) + 0.95 * sn;
      }
    }

    /* Cistern excavated stone basins darken cleanly inside rim */
    if (!isFar) {
      for (let ci = 0; ci < SW_GROUND.cisterns.length; ci++) {
        const c = SW_GROUND.cisterns[ci];
        if (Math.abs(x - c.x) < c.rimW * 0.52 && Math.abs(z - c.z) < c.rimD * 0.52 && y < c.rimY - 0.15) {
          r = 0.22;
          g = 0.26;
          b = 0.30;
        }
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
    const uvScale = isFar ? 0.012 : 0.085;

    for (let iz = 0; iz <= nz; iz++) {
      const z = G.z0 + iz * G.dz;
      for (let ix = 0; ix <= nx; ix++) {
        const x = G.x0 + ix * G.dx;
        const vi = iz * row + ix;
        let y = G.h[vi];
        if (isFar && Math.abs(x) < 2040 && Math.abs(z) < 2040) {
          y -= 18.0;
        }
        fullPos[vi * 3] = x;
        fullPos[vi * 3 + 1] = y;
        fullPos[vi * 3 + 2] = z;
      }
    }

    /* Compute smooth vertex normals across the whole grid first so tile seams have zero normal discontinuity */
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
      colorVertex(fullPos[vi * 3], fullPos[vi * 3 + 1], fullPos[vi * 3 + 2], fullNorm[vi * 3 + 1], isFar, fullCol, vi * 3);
    }

    /* Split near grid into 8x8 spatial tile meshes so Raycaster bounding spheres cull 63/64 of triangles instantly */
    const tiles = isFar ? 2 : 8;
    const stepX = Math.ceil(nx / tiles);
    const stepZ = Math.ceil(nz / tiles);
    const group = new THREE.Group();
    group.name = isFar ? 'sw-ground-far-group' : 'sw-ground-near-group';
    group.userData.probeSkip = true;
    group.userData.ground = true;
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
              if (Math.abs(cx) < 1680 && Math.abs(cz) < 1680) continue;
            }
            /* Exact KDRAWN.grid diagonal split: (a, b, d) and (b, c, d) */
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
        geo.setIndex(idx);
        geo.computeBoundingSphere();

        const m = new THREE.Mesh(geo, groundMat);
        m.name = (isFar ? 'sw-ground-far-' : 'sw-ground-near-') + tx + '-' + tz;
        m.userData.probeSkip = true;
        m.userData.ground = true;
        m.userData.lodSkip = true;
        group.add(m);
      }
    }
    scene.add(group);
    return group;
  }

  const nearMesh = buildGridMeshes(SW_GROUND.nearGrid(), false);
  const farMesh = buildGridMeshes(SW_GROUND.farGrid(), true);

  return {
    roadMask: roadMask,
    nearMesh: nearMesh,
    farMesh: farMesh,
    groundMat: groundMat
  };
})();
