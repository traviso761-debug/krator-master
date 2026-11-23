// ================================================================= DILIHAN — WebGL Stage, KMASK Field & Scale Model 5.1 Ground Meshes
// [web] Renderer, scene, camera, lights, kit-socket preservation (DL_ANC_SOCK), KMASK.canvas road/plaza/handu field,
// and near (10 m, 4.8 x 4.8 km) + regional (380 m, 30.4 x 30.4 km Cut bowl & -1,608 m salt lake) terrain meshes matching
// KDRAWN.grid's exact (a, b, d) / (b, c, d) cell triangulation.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xcbd7df, 0.000058);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.6, 42000);

const hemi = new THREE.HemisphereLight(0xdceaf6, 0x5c4f41, 0.68);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d8, 1.42);
sun.position.set(-2800, 3600, 1800);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xc4d8f2, 0.26);
fill.position.set(2100, 1500, -2400);
scene.add(fill);

let NIGHT = false;
const FRAME_HOOKS = [];
const FRAME_HOOKS_PRE = [];
terrainH = function (x, z) { return DL_GROUND.h(x, z); };

tick(function (dt, t) {
  /* Dynamically scale camera.near with clearance above terrain so bird's-eye overviews get 30x finer 24-bit depth resolution */
  const gY = DL_GROUND.h(camera.position.x, camera.position.z);
  const clearY = Math.max(0, camera.position.y - gY);
  const wantNear = Math.max(0.6, Math.min(20.0, clearY * 0.042));
  if (Math.abs(wantNear - camera.near) > 0.04) {
    camera.near = wantNear;
    camera.updateProjectionMatrix();
  }
  for (let i = 0; i < FRAME_HOOKS_PRE.length; i++) FRAME_HOOKS_PRE[i](dt, t);
  for (let i = 0; i < FRAME_HOOKS.length; i++) FRAME_HOOKS[i](dt, t);
});

/* Preserve Ancients 30-kit.js primitives before 61-jj-helpers.js overwrites globalThis.beam / box / quad / poly */
const DL_ANC_SOCK = {
  beam: typeof beam === 'function' ? beam : null,
  box: typeof box === 'function' ? box : null,
  quad: typeof quad === 'function' ? quad : null,
  plane4: typeof plane4 === 'function' ? plane4 : null,
  decal: typeof decal === 'function' ? decal : null,
  poly: typeof poly === 'function' ? poly : null,
  W: typeof W === 'function' ? W : null,
  pick: typeof pick === 'function' ? pick : null
};

const DL_STAGE = (function () {
  const L = DL_LAYOUT.plan;

  /* 1. Deterministic CPU road, plaza & courtyard mask on KMASK.canvas (zero getImageData) */
  const roadMask = (function () {
    const mw = 640;
    const mh = 640;
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
      ctx.lineWidth = Math.max(1.4, widthM * scale);
      ctx.beginPath();
      ctx.moveTo(toPx(pts[0][0]), toPy(pts[0][1]));
      for (let k = 1; k < pts.length; k++) {
        ctx.lineTo(toPx(pts[k][0]), toPy(pts[k][1]));
      }
      ctx.stroke();
    }
    function fillBox(cx, cz, wM, dM, val) {
      ctx.fillStyle = grayHex(val);
      ctx.fillRect(toPx(cx - wM * 0.5), toPy(cz - dM * 0.5), Math.max(1.5, wM * scale), Math.max(1.5, dM * scale));
    }
    function fillRotBox(cx, cz, wM, dM, ry, val) {
      const c = Math.cos(ry);
      const s = Math.sin(ry);
      const hw = wM * 0.5;
      const hd = dM * 0.5;
      const corners = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
      ctx.fillStyle = grayHex(val);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const wx = cx + corners[i][0] * c + corners[i][1] * s;
        const wz = cz - corners[i][0] * s + corners[i][1] * c;
        if (i === 0) ctx.moveTo(toPx(wx), toPy(wz));
        else ctx.lineTo(toPx(wx), toPy(wz));
      }
      ctx.closePath();
      ctx.fill();
    }

    /* Compacted brick-earth & stone urban district ground across the entire walled city before painting streets & plazas */
    fillBox(0, -60, 502, 502, 0.48);       /* Colonia Citadel ([-250..250, -310..190]) */
    fillBox(135, -442, 766, 242, 0.38);    /* Walled North Caravanserai Ward */
    fillBox(516, 285, 508, 1212, 0.38);    /* Walled East & SE Pass Wards */
    fillBox(2, 430, 504, 462, 0.38);       /* Walled South & Governor Precinct Ward */

    const ways = L.ways || [];
    for (let i = 0; i < ways.length; i++) {
      const w = ways[i];
      if (w.pts && w.pts.length >= 2) {
        strokePoly(w.pts, (w.w == null ? 6.0 : w.w) + 2.6, 1.0);
      }
    }
    /* Paved civic squares: Forum (0, -60), Aligned Solstice Sanctuary Plaza (-170, -72, SOL.ry),
       Palace Precinct (260, 294), North Caravanserai (66, -402), Eastern Muster Ground (540, -14), Lower-Town Fork (-400, 20) */
    fillBox(0, -60, 92, 78, 0.96);
    fillRotBox(L.solstice.x, L.solstice.z, 94, 118, L.solstice.ry, 0.96);
    fillBox(260, 294, 148, 138, 0.92);
    fillBox(66, -412, 118, 108, 0.88);
    fillBox(540, -14, 78, 62, 0.86);
    fillBox(-405, 20, 110, 190, 0.84);

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

  /* Subtle world-UV granite, marble & monsoon-earth grain CanvasTexture */
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
        const n1 = KRAND.fbm(x * 0.15, y * 0.15, 2.3, 3, 7441);
        const n2 = KRAND.fbm(x * 0.46 + 17, y * 0.46 - 13, 5.1, 2, 7442);
        const v = Math.max(206, Math.min(255, Math.round(237 + (n1 - 0.5) * 36 + (n2 - 0.5) * 20)));
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

  const grainTex = makeGrainTex();
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: grainTex,
    roughness: 0.88,
    metalness: 0.02,
    vertexColors: true
  });

  function srgbToLin(c) {
    return Math.pow(Math.max(0, Math.min(1, c)), 2.2);
  }

  function colorVertex(x, y, z, ny, isFar, out, k) {
    const n1 = KRAND.fbm(x * 0.009, z * 0.009, 3.1, 3, 6631);
    const n2 = KRAND.fbm(x * 0.038 + 23, z * 0.038 - 19, 6.7, 2, 6632);
    const road = isFar ? 0 : roadMask.sample(x, z);
    const asl = DL_GROUND.datum + y;
    let r = 0.42;
    let g = 0.46;
    let b = 0.36;

    /* 1. Cut Salt Lake SE sump (-1,608 m ASL) & D2 white/rose potash-halite evaporite crust */
    const sz = z < -6200 ? DL_GROUND.saltShoreZ(x) : -99999;
    if (z < sz + 460) {
      const dShore = z - sz;
      if (dShore <= 0) {
        /* Submerged hypersaline lakebed */
        r = 0.24 + 0.05 * n1;
        g = 0.38 + 0.06 * n1;
        b = 0.42 + 0.06 * n1;
      } else {
        /* Crystalline white halite & rose-ochre potash crust */
        const t = Math.min(1, dShore / 460);
        const er = 0.86 - 0.14 * t + 0.05 * (n1 - 0.5);
        const eg = 0.82 - 0.18 * t + 0.04 * (n2 - 0.5);
        const eb = 0.78 - 0.22 * t + 0.04 * (n1 - 0.5);
        r = er;
        g = eg;
        b = eb;
      }
      out[k] = srgbToLin(r);
      out[k + 1] = srgbToLin(g);
      out[k + 2] = srgbToLin(b);
      return;
    }

    if (road > 0.26) {
      /* Warm contact-marble & rose-granite street paving */
      const t = Math.min(1, (road - 0.26) / 0.54);
      const inCol = (x > -255 && x < 255 && z > -315 && z < 195);
      const cr = (inCol ? 0.68 : 0.60) + 0.06 * (n2 - 0.5);
      const cg = (inCol ? 0.63 : 0.56) + 0.05 * (n2 - 0.5);
      const cb = (inCol ? 0.56 : 0.49) + 0.05 * (n2 - 0.5);
      r = r * (1 - t) + cr * t;
      g = g * (1 - t) + cg * t;
      b = b * (1 - t) + cb * t;
    } else if (ny < 0.82) {
      /* Sliced eigenweapon Cut walls (rock.cut.polished) & contact-marble / granite scarp */
      const isColScarp = (!isFar && x > -302 && x < -240 && z > -325 && z < 210);
      const isPolishedCut = (Math.hypot(x, z) > 1950 && ny < 0.78);
      if (isColScarp) {
        /* Veined cream contact-marble & warm granite pluton courses on the 30 m Colonia scarp */
        const band = ((Math.floor((y + n1 * 7) / 4.5) & 1) === 0) ? 1.0 : 0.88;
        r = (0.76 + 0.07 * n1) * band;
        g = (0.72 + 0.07 * n1) * band;
        b = (0.66 + 0.06 * n1) * band;
      } else if (isPolishedCut) {
        /* Mirror-sliced eigenweapon Cut wall: pale polished marble/granite strata in clean section */
        const strata = 0.86 + 0.14 * Math.sin(asl * 0.028 + n1 * 2.4);
        r = (0.64 + 0.08 * n1) * strata;
        g = (0.62 + 0.08 * n1) * strata;
        b = (0.60 + 0.08 * n1) * strata;
      } else {
        /* Granite & skarn rock slopes */
        r = 0.50 + 0.08 * n1;
        g = 0.47 + 0.07 * n1;
        b = 0.43 + 0.07 * n1;
        if (!isFar && Math.hypot(x - DL_GROUND.skarnPad.x, z - DL_GROUND.skarnPad.z) < 280) {
          r = 0.44 + 0.10 * n1;
          g = 0.48 + 0.12 * n2;
          b = 0.39 + 0.08 * n1;
        }
      }
    } else {
      /* Dense-air (1.79 atm) monsoon bench turf, dry rain-shadow Cut floor northwards, and lush irrigated handu apron */
      const dryNorth = Math.max(0, Math.min(1, (-z - 1600) / 4600));
      r = 0.35 + 0.10 * n1 + 0.04 * (n2 - 0.5);
      g = 0.48 + 0.11 * n1 + 0.04 * (n2 - 0.5);
      b = 0.28 + 0.06 * n1;

      if (dryNorth > 0.01) {
        /* Rain-shadow salt-bush & rankgrass floor downslope toward the -1,608 m lake */
        const dn = dryNorth * 0.82;
        r = r * (1 - dn) + (0.60 + 0.08 * n1) * dn;
        g = g * (1 - dn) + (0.57 + 0.07 * n1) * dn;
        b = b * (1 - dn) + (0.48 + 0.06 * n2) * dn;
      }
      if (!isFar && Math.hypot(x - DL_GROUND.brickPad.x, z - DL_GROUND.brickPad.z) < 210) {
        /* NW Red brickearth clay beds */
        const cl = Math.max(0, 1 - Math.hypot(x - DL_GROUND.brickPad.x, z - DL_GROUND.brickPad.z) / 210) * 0.72;
        r = r * (1 - cl) + 0.62 * cl;
        g = g * (1 - cl) + 0.38 * cl;
        b = b * (1 - cl) + 0.26 * cl;
      }
      if (!isFar && DL_GROUND.stream.dist(x, z) < 9.5) {
        /* Wet contact-marble & granite cobbles in the perennial West-Wall spring stream */
        r = 0.28;
        g = 0.35;
        b = 0.37;
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
        if (isFar && Math.abs(x) < 2180 && Math.abs(z) < 2180) {
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
      colorVertex(fullPos[vi * 3], fullPos[vi * 3 + 1], fullPos[vi * 3 + 2], fullNorm[vi * 3 + 1], isFar, fullCol, vi * 3);
    }

    const tiles = isFar ? 2 : 8;
    const stepX = Math.ceil(nx / tiles);
    const stepZ = Math.ceil(nz / tiles);
    const group = new THREE.Group();
    group.name = isFar ? 'dl-ground-far-group' : 'dl-ground-near-group';
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
              if (Math.abs(cx) < 1850 && Math.abs(cz) < 1850) continue;
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
        m.name = (isFar ? 'dl-ground-far-' : 'dl-ground-near-') + tx + '-' + tz;
        m.userData.probeSkip = true;
        m.userData.ground = true;
        m.userData.lodSkip = true;
        group.add(m);
      }
    }
    scene.add(group);
    return group;
  }

  const nearMesh = buildGridMeshes(DL_GROUND.nearGrid(), false);
  const farMesh = buildGridMeshes(DL_GROUND.farGrid(), true);

  return {
    roadMask: roadMask,
    nearMesh: nearMesh,
    farMesh: farMesh,
    groundMat: groundMat
  };
})();
