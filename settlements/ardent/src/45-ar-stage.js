/* ================================================================= ARDENT — WebGL stage, KMASK cobble field & Terrain-Draped Cobbles
   [web] Renderer, scene, camera, lights, KMASK.canvas cobbled-wynd & plaza field (zero getImageData), near (8 m) + regional
   (400 m, 52 x 52 km) terrain meshes matching KDRAWN.grid's exact (a, b, d) / (b, c, d) triangulation, seamless terrain-draped
   MAT.cobble street ribbons & plaza meshes (zero VBOX clipping on squares or street bends!), Tolbooth Dueling-Ring bollards &
   cresset, copper/tin RES_ORE outcrops, and KCAMP Silk-Trail Free-Company builders. */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio == null ? 1 : window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xbfcddd, 0.000058);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.45, 64000);

const hemi = new THREE.HemisphereLight(0xdbe8f6, 0x4d463a, 0.68);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1dc, 1.42);
sun.position.set(-2400, 3400, 2100);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xb8cee8, 0.30);
fill.position.set(2100, 1500, -2300);
scene.add(fill);

let NIGHT = false;
const FRAME_HOOKS = [];
const FRAME_HOOKS_PRE = [];
terrainH = function (x, z) { return AR_GROUND.h(x, z); };

tick(function (dt, t) {
  for (let i = 0; i < FRAME_HOOKS_PRE.length; i++) FRAME_HOOKS_PRE[i](dt, t);
  for (let i = 0; i < FRAME_HOOKS.length; i++) FRAME_HOOKS[i](dt, t);
});

const AR_STAGE = (function () {
  const L = AR_LAYOUT.plan;

  /* 1. Deterministic CPU cobbled-wynd, plaza & mountain-road mask on KMASK.canvas (zero getImageData) */
  const roadMask = (function () {
    const mw = 900;
    const mh = 900;
    const x0 = -900;
    const z0 = -900;
    const span = 1800;
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
    function fillRectWorld(rx0, rz0, rx1, rz1, val) {
      ctx.fillStyle = grayHex(val);
      ctx.fillRect(toPx(rx0), toPy(rz0), (rx1 - rx0) * scale, (rz1 - rz0) * scale);
    }
    function fillCircle(cx, cz, rM, val) {
      ctx.fillStyle = grayHex(val);
      ctx.beginPath();
      ctx.arc(toPx(cx), toPy(cz), Math.max(1.0, rM * scale), 0, Math.PI * 2);
      ctx.fill();
    }

    /* Keep roadMask strictly on cobbled wynds, plazas, mountain roads, Thing-Crag & camp rings */

    const ways = L.ways || [];
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < ways.length; i++) {
        const w = ways[i];
        const isCobble = (w.kind === 'cobble_wynd' || w.kind === 'cobble_close');
        if ((pass === 0 && isCobble) || (pass === 1 && !isCobble)) continue;
        const ww = w.w == null ? 4.4 : w.w;
        strokePoly(w.pts, ww + (isCobble ? 3.0 : 2.6), isCobble ? 1.0 : 0.56);
      }
    }

    const plazas = L.plazas || [];
    for (let qi = 0; qi < plazas.length; qi++) {
      const q = plazas[qi];
      fillRectWorld(q.x0 - 3, q.z0 - 3, q.x1 + 3, q.z1 + 3, 1.0);
    }
    fillCircle(AR_GROUND.thingCrag.x, AR_GROUND.thingCrag.z + 10, 88.0, 0.65);
    for (let ci = 0; ci < (L.camps || []).length; ci++) {
      const cp = L.camps[ci];
      fillCircle(cp.center[0], cp.center[1], 22.0, 0.52);
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

  /* Procedural world-UV stone-sett & highland moor grain CanvasTexture (complete mipmaps + sRGB encoding) */
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
        const n1 = KRAND.fbm(x * 0.18, y * 0.18, 1.9, 3, 8301);
        const n2 = KRAND.fbm(x * 0.52 + 17, y * 0.52 - 13, 4.7, 2, 8302);
        const gx = Math.abs(((x * 0.25) % 1) - 0.5);
        const gy = Math.abs((((y + ((x >> 2) & 1) * 2) * 0.25) % 1) - 0.5);
        const seam = (gx < 0.07 || gy < 0.07) ? -14 : 5;
        const v = Math.max(192, Math.min(255, Math.round(234 + (n1 - 0.5) * 36 + (n2 - 0.5) * 22 + seam)));
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
    const n1 = KRAND.fbm(x * 0.012, z * 0.012, 2.3, 3, 5531);
    const n2 = KRAND.fbm(x * 0.048 + 29, z * 0.048 - 19, 5.7, 2, 5532);
    const road = isFar ? 0 : roadMask.sample(x, z);
    let r = 0.36;
    let g = 0.42;
    let b = 0.31;

    const inBurn = !isFar && x > -840 && x < 840 && Math.abs(z - AR_GROUND.burnZ(x)) < 8.2;
    if (inBurn) {
      r = 0.31 + 0.07 * n2;
      g = 0.33 + 0.07 * n2;
      b = 0.35 + 0.08 * n2;
    } else if (road > 0.65) {
      /* Blue-grey Highland granite & warm slate burgh cobble base */
      const t = Math.min(1, (road - 0.65) / 0.30);
      const cr = 0.43 + 0.06 * (n2 - 0.5);
      const cg = 0.43 + 0.06 * (n2 - 0.5);
      const cb = 0.45 + 0.07 * (n2 - 0.5);
      r = 0.43 * (1 - t) + cr * t;
      g = 0.42 * (1 - t) + cg * t;
      b = 0.40 * (1 - t) + cb * t;
    } else if (road > 0.24) {
      /* Packed burgh courtyard earth & schist mountain cart track */
      const t = Math.min(1, (road - 0.24) / 0.36);
      const mr = 0.46 + 0.06 * (n1 - 0.5);
      const mg = 0.44 + 0.06 * (n1 - 0.5);
      const mb = 0.39 + 0.05 * (n1 - 0.5);
      r = r * (1 - t) + mr * t;
      g = g * (1 - t) + mg * t;
      b = b * (1 - t) + mb * t;
    } else if (ny < 0.79) {
      const strata = ((Math.floor((y + n1 * 9) / 7.5) & 1) === 0) ? 1.0 : 0.86;
      r = (0.41 + 0.08 * n1) * strata;
      g = (0.40 + 0.08 * n1) * strata;
      b = (0.41 + 0.08 * n1) * strata;
      if (!isFar && x > -260 && x < 260 && z < -500 && z > -660) {
        const oreW = Math.max(0, 1 - Math.hypot(x, z + 575) / 260);
        r = r * (1 - 0.38 * oreW) + 0.34 * oreW;
        g = g * (1 - 0.38 * oreW) + 0.50 * oreW;
        b = b * (1 - 0.38 * oreW) + 0.43 * oreW;
      }
    } else {
      const asl = AR_GROUND.datum + y;
      const heather = Math.max(0, Math.min(1, (n1 - 0.42) * 2.3)) * Math.max(0, Math.min(1, (asl - 2806) / 42));
      const valleyLush = Math.max(0, Math.min(1, (2808 - asl) / 28));
      const snow = Math.max(0, Math.min(1, (asl - 3090 + (n1 - 0.5) * 55) / 85));

      r = 0.37 + 0.10 * n1 + 0.04 * (n2 - 0.5);
      g = 0.45 + 0.11 * n1 + 0.04 * (n2 - 0.5);
      b = 0.29 + 0.06 * n1;

      if (valleyLush > 0.01) {
        const lv = valleyLush * 0.65;
        r = r * (1 - lv) + (0.31 + 0.07 * n2) * lv;
        g = g * (1 - lv) + (0.47 + 0.09 * n1) * lv;
        b = b * (1 - lv) + (0.26 + 0.05 * n2) * lv;
      }
      if (heather > 0.02) {
        const hw = heather * 0.58;
        r = r * (1 - hw) + (0.44 + 0.07 * n2) * hw;
        g = g * (1 - hw) + (0.33 + 0.06 * n2) * hw;
        b = b * (1 - hw) + (0.39 + 0.07 * n1) * hw;
      }
      if (snow > 0.02 && ny > 0.84) {
        const sn = snow * Math.min(1, (ny - 0.84) / 0.12) * 0.86;
        r = r * (1 - sn) + 0.88 * sn;
        g = g * (1 - sn) + 0.91 * sn;
        b = b * (1 - sn) + 0.95 * sn;
      }
      if (!isFar && Math.abs(x) < 256 && Math.abs(z) < 256) {
        const edge = Math.max(Math.abs(x), Math.abs(z));
        const bw = edge < 246 ? 0.82 : Math.max(0, (256 - edge) / 10) * 0.82;
        const yr = 0.29 + 0.05 * n2;
        const yg = 0.30 + 0.05 * n1;
        const yb = 0.28 + 0.05 * n2;
        r = r * (1 - bw) + yr * bw;
        g = g * (1 - bw) + yg * bw;
        b = b * (1 - bw) + yb * bw;
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
    const uvScale = isFar ? 0.014 : 0.125;

    for (let iz = 0; iz <= nz; iz++) {
      const z = G.z0 + iz * G.dz;
      for (let ix = 0; ix <= nx; ix++) {
        const x = G.x0 + ix * G.dx;
        const vi = iz * row + ix;
        fullPos[vi * 3] = x;
        fullPos[vi * 3 + 1] = G.h[vi];
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
      colorVertex(fullPos[vi * 3], fullPos[vi * 3 + 1], fullPos[vi * 3 + 2], fullNorm[vi * 3 + 1], isFar, fullCol, vi * 3);
    }

    const tiles = isFar ? 2 : 8;
    const stepX = Math.ceil(nx / tiles);
    const stepZ = Math.ceil(nz / tiles);
    const group = new THREE.Group();
    group.name = isFar ? 'ar-ground-far-group' : 'ar-ground-near-group';
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
              if (Math.abs(cx) < 1720 && Math.abs(cz) < 1720) continue;
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
        geo.setIndex(idx);
        geo.computeBoundingSphere();

        const m = new THREE.Mesh(geo, groundMat);
        m.name = (isFar ? 'ar-ground-far-' : 'ar-ground-near-') + tx + '-' + tz;
        m.userData.probeSkip = true;
        m.userData.ground = true;
        m.userData.lodSkip = true;
        group.add(m);
      }
    }
    scene.add(group);
    return group;
  }

  const nearMesh = buildGridMeshes(AR_GROUND.nearGrid(), false);
  const farMesh = buildGridMeshes(AR_GROUND.farGrid(), true);

  /* Resample a 2D polyline to <= stepM spacing so draped street ribbons follow curved terrain & bends smoothly */
  function resampleWay(pts, stepM) {
    const out = [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1];
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (d < 1e-3) continue;
      const n = Math.max(1, Math.ceil(d / stepM));
      for (let k = 0; k < n; k++) {
        const u = k / n;
        out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
      }
    }
    if (pts.length) out.push([pts[pts.length - 1][0], pts[pts.length - 1][1]]);
    return out;
  }

  /* Split a resampled polyline across Ardent Burn so cobble ribbons stop at the bridge abutments */
  function splitAcrossBurn(pts) {
    const chunks = [];
    let cur = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const inChannel = p[0] > -820 && p[0] < 820 && Math.abs(p[1] - AR_GROUND.burnZ(p[0])) < 6.8;
      if (inChannel) {
        if (cur.length >= 2) chunks.push(cur);
        cur = [];
      } else {
        cur.push(p);
      }
    }
    if (cur.length >= 2) chunks.push(cur);
    return chunks;
  }

  /* Build seamless terrain-draped MAT.cobble street ribbons & plaza meshes (zero VBOX corner/triangle clipping!).
     Called from 89zp-ar-place.js after 88y-highlands-matlib.js binds MAT.cobble's PBR rock_wall_12 maps. */
  function buildCobblePaving() {
    const srcMat = (typeof MAT !== 'undefined' && MAT.cobble) ? MAT.cobble : null;
    const cobbleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: srcMat ? srcMat.map : null,
      normalMap: srcMat ? srcMat.normalMap : null,
      roughnessMap: srcMat ? srcMat.roughnessMap : null,
      roughness: 0.92,
      metalness: 0.02,
      vertexColors: true,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -6
    });
    if (cobbleMat.map) {
      cobbleMat.map.wrapS = cobbleMat.map.wrapT = THREE.RepeatWrapping;
    }
    if (cobbleMat.normalMap) {
      cobbleMat.normalMap.wrapS = cobbleMat.normalMap.wrapT = THREE.RepeatWrapping;
    }
    if (cobbleMat.roughnessMap) {
      cobbleMat.roughnessMap.wrapS = cobbleMat.roughnessMap.wrapT = THREE.RepeatWrapping;
    }

    const uvK = 0.33;
    const baseCol = vC(0x888c94);
    const roadCol = vC(0x968c7c);
    const pos = [];
    const col = [];
    const uv = [];
    const idx = [];

    /* 1. Terrain-draped cobbled squares (2.0 m grid cells following AR_GROUND.h(x, z) + 0.065 m) */
    const plazas = L.plazas || [];
    for (let qi = 0; qi < plazas.length; qi++) {
      const q = plazas[qi];
      const x0 = q.x0 - 2.0, z0 = q.z0 - 2.0, x1 = q.x1 + 2.0, z1 = q.z1 + 2.0;
      const nx = Math.max(2, Math.round((x1 - x0) / 2.0));
      const nz = Math.max(2, Math.round((z1 - z0) / 2.0));
      const dx = (x1 - x0) / nx, dz = (z1 - z0) / nz;
      const v0 = pos.length / 3;
      for (let iz = 0; iz <= nz; iz++) {
        const z = z0 + iz * dz;
        const ez = (iz === 0 || iz === nz);
        for (let ix = 0; ix <= nx; ix++) {
          const x = x0 + ix * dx;
          const ex = (ix === 0 || ix === nx);
          const edge = (ex || ez) ? 0.80 : 1.0;
          const vTone = 0.95 + 0.08 * (KRAND.fbm(x * 0.09, z * 0.09, 3.1, 2, 8311) - 0.5);
          pos.push(x, AR_GROUND.h(x, z) + 0.065, z);
          col.push(baseCol.r * edge * vTone, baseCol.g * edge * vTone, baseCol.b * edge * vTone);
          uv.push(x * uvK, z * uvK);
        }
      }
      const row = nx + 1;
      for (let iz = 0; iz < nz; iz++) {
        for (let ix = 0; ix < nx; ix++) {
          const a = v0 + iz * row + ix;
          const d = a + 1;
          const b = a + row;
          const c = b + 1;
          idx.push(a, b, d, b, c, d);
        }
      }
    }

    /* 2. Terrain-draped mitered street & wynd ribbons (5-profile crowned cobbles + kerbs, zero sharp-corner overhangs) */
    const prof = [-1.0, -0.78, 0.0, 0.78, 1.0];
    const ways = L.ways || [];
    for (let wi = 0; wi < ways.length; wi++) {
      const w = ways[wi];
      const isCobble = (w.kind === 'cobble_wynd' || w.kind === 'cobble_close');
      const hw = ((w.w == null ? 4.4 : w.w) + (isCobble ? 1.8 : 0.8)) * 0.5;
      const liftBase = isCobble ? 0.075 : 0.055;
      const cUse = isCobble ? baseCol : roadCol;
      const dense = resampleWay(w.pts || [], 2.0);
      const chunks = splitAcrossBurn(dense);

      for (let ci = 0; ci < chunks.length; ci++) {
        const P = chunks[ci];
        if (P.length < 2) continue;
        const v0 = pos.length / 3;
        for (let i = 0; i < P.length; i++) {
          /* Miter bisector at bends with stretch cap so sharp turns never fold or spike */
          let tx = 0, tz = 0, st = 1.0;
          if (i === 0) {
            tx = P[1][0] - P[0][0]; tz = P[1][1] - P[0][1];
            const L0 = Math.hypot(tx, tz) || 1; tx /= L0; tz /= L0;
          } else if (i === P.length - 1) {
            tx = P[i][0] - P[i - 1][0]; tz = P[i][1] - P[i - 1][1];
            const L1 = Math.hypot(tx, tz) || 1; tx /= L1; tz /= L1;
          } else {
            let ax = P[i][0] - P[i - 1][0], az = P[i][1] - P[i - 1][1];
            let bx = P[i + 1][0] - P[i][0], bz = P[i + 1][1] - P[i][1];
            const La = Math.hypot(ax, az) || 1, Lb = Math.hypot(bx, bz) || 1;
            ax /= La; az /= La; bx /= Lb; bz /= Lb;
            tx = ax + bx; tz = az + bz;
            const Lt = Math.hypot(tx, tz);
            if (Lt > 1e-4) {
              tx /= Lt; tz /= Lt;
              st = Math.min(1.35, 1.0 / Math.max(0.55, tx * ax + tz * az));
            } else {
              tx = bx; tz = bz;
            }
          }
          const nx = -tz, nz = tx;
          for (let pi = 0; pi < 5; pi++) {
            const f = prof[pi];
            const x = P[i][0] + nx * hw * st * f;
            const z = P[i][1] + nz * hw * st * f;
            const crown = (1.0 - f * f) * 0.022;
            const kerb = Math.abs(f) > 0.95 ? 0.76 : 1.0;
            pos.push(x, AR_GROUND.h(x, z) + liftBase + crown, z);
            col.push(cUse.r * kerb, cUse.g * kerb, cUse.b * kerb);
            uv.push(x * uvK, z * uvK);
          }
          if (i > 0) {
            for (let q = 0; q < 4; q++) {
              const A = v0 + (i - 1) * 5 + q;
              const B = A + 5;
              idx.push(A, B, A + 1, A + 1, B, B + 1);
            }
          }
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    geo.computeBoundingSphere();

    const mesh = new THREE.Mesh(geo, cobbleMat);
    mesh.name = 'ar-cobble-paving';
    mesh.renderOrder = 3;
    mesh.userData.probeSkip = true;
    mesh.userData.ground = true;
    mesh.userData.lodSkip = true;
    scene.add(mesh);

    /* Tolbooth First-Blood Dueling-Ring bollards & Bronze Cresset on the central square (zero VBOX floor slabs!) */
    const cKerb = vC(0x949084);
    const cBrz = vC(0xb67b36);
    const cIron = vC(0x2a2826);
    const sq0 = (L.plazas && L.plazas[0]) ? L.plazas[0] : { x0: -24, z0: -28, x1: 24, z1: 20 };
    const ringX = 0.5 * (sq0.x0 + sq0.x1);
    const ringZ = 0.5 * (sq0.z0 + sq0.z1) + 6.5;
    const ringY = AR_GROUND.h(ringX, ringZ);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const bx = ringX + Math.sin(a) * 7.2;
      const bz = ringZ + Math.cos(a) * 7.2;
      const by = AR_GROUND.h(bx, bz);
      kput('hAshlarP', [bx, by + 0.36, bz], null, [0.38, 0.76, 0.38], cKerb);
      kput('hGold', [bx, by + 0.80, bz], null, [0.17, 0.15, 0.17], cBrz);
    }
    const crX = ringX + 9.2;
    const crZ = ringZ + 6.4;
    const crY = AR_GROUND.h(crX, crZ);
    kput('hAshlarP', [crX, crY + 0.36, crZ], null, [0.98, 0.78, 0.98], cKerb);
    kput('vPost', [crX, crY + 0.74, crZ], null, [0.11, 2.45, 0.11], cIron);
    kput('hGoldB', [crX, crY + 3.18, crZ], null, [0.70, 0.38, 0.70], cBrz);
    kput('vEmber', [crX, crY + 3.40, crZ], null, [0.56, 0.18, 0.56], null);
    REG.push({
      name: 'Tolbooth First-Blood Dueling Ring and Bronze Cresset',
      x: ringX, y: ringY, z: ringZ, r: 7.8, h: 3.7,
      cls: 'landmark', key: 'ar_dueling_ring',
      tags: { culture: 'rustic', types: ['civic', 'military'] }
    });

    return mesh;
  }

  /* Place visible copper_ore (malachite-bronze) & tin_ore (cassiterite-granite) RES_ORE outcrops */
  function placeOreNode(node) {
    const s = KRAND.hash(830553, node.id);
    const isCu = node.ore === 'copper_ore';
    const rockC = vC(isCu ? 0x5c6862 : 0x585450);
    const veinC = vC(isCu ? 0x2f8a6e : 0x3a3634);
    const glintC = vC(isCu ? 0xc27438 : 0x9aa2a8);
    const scaleG = node.grade === 'high' ? 1.22 : node.grade === 'medium' ? 1.0 : 0.84;

    for (let k = 0; k < 5; k++) {
      const a = ((s + k * 97) % 360) * Math.PI / 180;
      const r = (k === 0 ? 0 : 1.3 + (k % 3) * 0.75) * scaleG;
      const ox = node.x + Math.cos(a) * r;
      const oz = node.z + Math.sin(a) * r;
      const oy = AR_GROUND.h(ox, oz);
      const bw = (1.9 - k * 0.22) * scaleG;
      const bh = (1.55 - k * 0.18) * scaleG;
      const q = qEuler(((k * 13) % 9 - 4) * 0.04, a, ((k * 7) % 9 - 4) * 0.04);
      kput('hRubB', [ox, oy + bh * 0.32, oz], q, [bw, bh, bw * 0.88], rockC);
      kput('vStone', [ox, oy + bh * 0.68, oz], q, [bw * 0.62, bh * 0.44, bw * 0.56], veinC);
      if (k < 3) {
        kput('hGoldB', [ox + 0.18, oy + bh * 0.84, oz - 0.12], q, [0.36 * scaleG, 0.28 * scaleG, 0.32 * scaleG], glintC);
      }
    }
    REG.push({
      name: (isCu ? 'Malachite Copper Vein (' : 'Cassiterite Tin Lode (') + node.grade + ')',
      x: node.x, y: node.y, z: node.z, r: 3.6 * scaleG, h: 2.2 * scaleG,
      cls: 'feature', key: node.ore,
      tags: { culture: 'generic', types: ['industry'], job: 'mining' }
    });
  }

  /* Place Silk-Trail Free-Company Brons-Togar camp (KCAMP tents, hearth fire, clan bronze disc standard & bronze field guns) */
  function placeCamp(camp) {
    const st = AR_RULES.evaluateBandState(camp);
    const cCanvas = vC(0xd8ccb4);
    const cTrim = vC(st.discTurned ? 0x9e2c22 : 0x2f5e74);
    const cWood = vC(0x5c402c);
    const cBrz = vC(0xc4863c);
    const cIron = vC(0x2d2b29);
    const cStone = vC(0x7c7870);

    const hx = camp.hearth[0];
    const hz = camp.hearth[1];
    const hy = AR_GROUND.h(hx, hz);
    for (let si = 0; si < 8; si++) {
      const a = (si / 8) * Math.PI * 2;
      kput('hRubB', [hx + Math.cos(a) * 1.15, hy + 0.16, hz + Math.sin(a) * 1.15], qEuler(0, a, 0), [0.58, 0.36, 0.44], cStone);
    }
    kput('vWood', [hx, hy + 0.22, hz], qEuler(0, 0.4, 0.2), [1.1, 0.18, 0.22], cWood);
    kput('vWood', [hx, hy + 0.24, hz], qEuler(0, 1.9, -0.2), [1.1, 0.18, 0.22], cWood);
    kput('vEmber', [hx, hy + 0.28, hz], null, [0.92, 0.24, 0.92], null);

    const px = hx + 2.8;
    const pz = hz + 1.4;
    const py = AR_GROUND.h(px, pz);
    kput('vPost', [px, py, pz], null, [0.09, 4.8, 0.09], cWood);
    kput('vWood', [px, py + 4.35, pz], null, [1.25, 0.09, 0.09], cWood);
    kput('hPaint', [px, py + 3.45, pz], null, [0.95, 1.55, 0.05], cTrim);
    kput('hGold', [px, py + 4.65, pz], null, [0.28, 0.28, 0.10], cBrz);

    const tents = camp.tents || [];
    for (let ti = 0; ti < tents.length; ti++) {
      const t = tents[ti];
      const tx = t.x == null ? (t.at ? t.at[0] : hx + 8) : t.x;
      const tz = t.z == null ? (t.at ? t.at[1] : hz) : t.z;
      const ty = AR_GROUND.h(tx, tz);
      const ry = t.ry == null ? Math.atan2(hx - tx, hz - tz) : t.ry;
      const tw = t.kind === 'leader' ? 4.4 : 3.4;
      const td = t.kind === 'leader' ? 4.8 : 3.8;
      const th = t.kind === 'leader' ? 2.65 : 2.15;
      const q = qEuler(0, ry, 0);
      kput('hRubB', [tx, ty - 0.12, tz], q, [tw + 0.3, 0.32, td + 0.3], cStone);
      kput('vGableT', [tx, ty + 0.04, tz], q, [tw, th, td], cCanvas);
      kput('hPaint', [tx, ty + th - 0.08, tz], q, [0.16, 0.16, td + 0.24], cTrim);
      kput('vPost', [tx + Math.sin(ry) * (td * 0.52), ty, tz + Math.cos(ry) * (td * 0.52)], null, [0.07, th + 0.35, 0.07], cWood);
    }

    const nGuns = camp.bronzeGuns == null ? 1 : camp.bronzeGuns;
    for (let gi = 0; gi < nGuns; gi++) {
      const gx = hx + 5.2 + gi * 3.8;
      const gz = hz - 4.4;
      const gy = AR_GROUND.h(gx, gz);
      const gry = -0.35;
      const gq = qEuler(0, gry, 0);
      kput('vWood', [gx, gy + 0.52, gz], gq, [0.58, 0.28, 2.35], cWood);
      kput('vWood', [gx, gy + 0.48, gz + 0.25], gq, [1.56, 0.14, 0.14], cIron);
      for (const s of [-0.74, 0.74]) {
        const wx = gx + s * Math.cos(gry);
        const wz = gz - s * Math.sin(gry);
        kput('hOctW', [wx, gy + 0.48, wz], qEuler(0, gry, Math.PI * 0.5), [0.48, 0.12, 0.48], cWood);
      }
      kput('hGoldB', [gx, gy + 0.78, gz + 0.35], qEuler(-0.14, gry, 0), [0.28, 0.28, 1.95], cBrz);
      if (typeof hlfWorld === 'function') {
        hlfWorld('crate_stack', gx - 1.35, gy, gz - 0.6, gry, { world: camp.id, wealth: 0.5 });
      }
    }

    REG.push({
      name: camp.name + ' (' + st.code + ')',
      x: hx, y: hy, z: hz, r: 16.0, h: 4.8,
      cls: 'landmark', key: camp.id,
      tags: { culture: 'rustic', types: ['military'] }
    });
  }

  return {
    roadMask: roadMask,
    nearMesh: nearMesh,
    farMesh: farMesh,
    groundMat: groundMat,
    buildCobblePaving: buildCobblePaving,
    placeOreNode: placeOreNode,
    placeCamp: placeCamp
  };
})();
