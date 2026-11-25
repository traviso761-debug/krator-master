// prefix: mb
/* ================================================================= MIRABILIS — 3D World Assembly ([web])
   Draws the Circuit E6 Escarpment Prefecture at px [350, 726]:
     1. Watertight two-tier terrain (4 m inner mesh [-1200..+1200] with KGROUND DataTexture2DArray + triplanar cliffs,
        and 120 m regional Scale Model 5.1 ring [-14400..+14400] registered in KDRAWN).
     2. Monumental 164.5 m-high Yut ("Moon-Bridge") parabolic ashlar-and-nephrite arch, Weir Packhorse Bridge,
        KCARVE loess cave portals, WOW.dustTowers earth pillars, W3 covered market galleries, and porcelain-insulator
        telegraph catenary line.
     3. Standing Hayrant + Eternian buildings & RES_ORE nodes merged via core/engine (with cut-away interiors, KFURN
        furniture, --night lit embrasures, SVTAGS & KWALK), 5 active KCONS + KCITY.constructMesh rising lots in W6,
        and C1 Ukor-Tera caravan laager tents/wagons via MB_TENTS.
     4. 100% real core/water (Yut-Ma upper/lower WATER.flow, W5 mill-leat WATER.flow, Moon-Bridge & Siru-Spring
        WATER.fall cascades, and 4 mineral/stepwell WATER.still basins).
     5. Western Outer Wall native flora & contoured terrace crops (biomes/wouterwall + kits/crops), animated hoist cars,
        clock jacks & instanced citizens, and EXPORT.world (core/export). */

if (typeof groundM !== 'undefined' && groundM) {
  scene.remove(groundM);
}
camera.far = 32000;
camera.updateProjectionMatrix();
skyCam.far = 32000;
skyCam.updateProjectionMatrix();
scene.fog.density = 0.00011;
{
  var sc = sun.shadow.camera;
  sc.left = -260; sc.right = 260; sc.top = 260; sc.bottom = -260; sc.near = 10; sc.far = 1100;
  sc.updateProjectionMatrix();
}

autoViews = function () { return MB_VIEWS; };

var MB_PLAN = null;
var MB_SIM_PIN = qs.get('hoistPhase') !== null ? +qs.get('hoistPhase') : null;
var MB_SIM_T = MB_SIM_PIN !== null ? MB_SIM_PIN : 42.0;
var MB_WATER_RECS = { flows: [], falls: [], still: [] };
var MB_HOIST_NODES = { carA: null, carB: null, drum: null };
var MB_WHEEL_NODES = [];
var MB_CONS_SITES = [];
var MB_CAMP_NODES = [];
var MB_FLORA_STATS = null;
var MB_CITIZENS = { cap: 96, mesh: null, head: null, cloak: null, actors: [] };

function mbStampGeo(geo, mk) {
  var cnt = geo.attributes.position ? geo.attributes.position.count : 0;
  if (!cnt) return geo;
  var cObj;
  if ((mk === 'celadon' || mk === 'alabaster' || mk === 'sign') && typeof KIT_HAS === 'function' && KIT_HAS(mk)) {
    cObj = new THREE.Color(1, 1, 1);
  } else if (typeof SVPAL !== 'undefined' && SVPAL[mk] && SVPAL[mk].length) {
    cObj = new THREE.Color(SVPAL[mk][0]).convertSRGBToLinear();
  } else {
    cObj = new THREE.Color(0xb8ae9c).convertSRGBToLinear();
  }
  var colArr = new Float32Array(cnt * 3);
  for (var i = 0; i < cnt; i++) {
    colArr[i * 3] = cObj.r; colArr[i * 3 + 1] = cObj.g; colArr[i * 3 + 2] = cObj.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
  if (typeof SV_CUT !== 'undefined' && SV_CUT[mk]) {
    geo.setAttribute('aCut', new THREE.BufferAttribute(new Float32Array(cnt * 4), 4));
  }
  if (typeof SV_CLOTH !== 'undefined' && SV_CLOTH[mk]) {
    geo.setAttribute('aFlut', new THREE.BufferAttribute(new Float32Array(cnt * 3), 3));
  }
  if (mk === 'glow') {
    geo.setAttribute('aFlk', new THREE.BufferAttribute(new Float32Array(cnt).fill(0.25), 1));
  }
  return geo;
}

function mbCompactStaticGroup(grp) {
  grp.updateMatrixWorld(true);
  var invRoot = new THREE.Matrix4().copy(grp.matrixWorld).invert();
  var byMat = {};
  var toRemove = [];
  grp.traverse(function (m) {
    if (!m.isMesh || m.isInstancedMesh || !m.geometry || !m.geometry.attributes.position || Array.isArray(m.material)) return;
    var g = m.geometry;
    var mk = (m.userData && m.userData.mk) || '';
    var key = m.material.uuid + ':' + mk + (g.attributes.color ? ':c' : ':nc');
    if (!byMat[key]) byMat[key] = { mat: m.material, mk: mk, hasCol: !!g.attributes.color, list: [] };
    var relM = new THREE.Matrix4().multiplyMatrices(invRoot, m.matrixWorld);
    byMat[key].list.push({ geo: g, mat4: relM, cast: m.castShadow, recv: m.receiveShadow });
    toRemove.push(m);
  });
  var keys = Object.keys(byMat);
  if (!keys.length) return;
  for (var i = 0; i < toRemove.length; i++) {
    if (toRemove[i].parent) toRemove[i].parent.remove(toRemove[i]);
  }
  var vTmp = new THREE.Vector3(), nTmp = new THREE.Vector3(), nMat = new THREE.Matrix3();
  for (var ki = 0; ki < keys.length; ki++) {
    var B = byMat[keys[ki]];
    var vCount = 0, iCount = 0, cast = false, recv = false;
    for (var li = 0; li < B.list.length; li++) {
      var it = B.list[li], gp = it.geo.attributes.position;
      vCount += gp.count;
      iCount += it.geo.index ? it.geo.index.count : gp.count;
      if (it.cast) cast = true;
      if (it.recv) recv = true;
    }
    var pos = new Float32Array(vCount * 3);
    var nrm = new Float32Array(vCount * 3);
    var uv = new Float32Array(vCount * 2);
    var col = new Float32Array(vCount * 3);
    var idx = vCount > 65535 ? new Uint32Array(iCount) : new Uint16Array(iCount);
    var vOff = 0, iOff = 0;
    for (var lj = 0; lj < B.list.length; lj++) {
      var item = B.list[lj], g2 = item.geo;
      var pA = g2.attributes.position, nA = g2.attributes.normal, uA = g2.attributes.uv, cA = g2.attributes.color;
      nMat.getNormalMatrix(item.mat4);
      for (var v = 0; v < pA.count; v++) {
        vTmp.fromBufferAttribute(pA, v).applyMatrix4(item.mat4);
        pos[(vOff + v) * 3] = vTmp.x; pos[(vOff + v) * 3 + 1] = vTmp.y; pos[(vOff + v) * 3 + 2] = vTmp.z;
        if (nA) {
          nTmp.fromBufferAttribute(nA, v).applyMatrix3(nMat).normalize();
          nrm[(vOff + v) * 3] = nTmp.x; nrm[(vOff + v) * 3 + 1] = nTmp.y; nrm[(vOff + v) * 3 + 2] = nTmp.z;
        } else {
          nrm[(vOff + v) * 3 + 1] = 1;
        }
        if (uA) {
          uv[(vOff + v) * 2] = uA.getX(v); uv[(vOff + v) * 2 + 1] = uA.getY(v);
        }
        col[(vOff + v) * 3] = cA ? cA.getX(v) : 1;
        col[(vOff + v) * 3 + 1] = cA ? cA.getY(v) : 1;
        col[(vOff + v) * 3 + 2] = cA ? cA.getZ(v) : 1;
      }
      if (g2.index) {
        for (var ii = 0; ii < g2.index.count; ii++) idx[iOff++] = g2.index.getX(ii) + vOff;
      } else {
        for (var ii2 = 0; ii2 < pA.count; ii2++) idx[iOff++] = ii2 + vOff;
      }
      vOff += pA.count;
    }
    var mGeo = new THREE.BufferGeometry();
    mGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    mGeo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    mGeo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    mGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    if (B.mk && typeof SV_CUT !== 'undefined' && SV_CUT[B.mk]) {
      mGeo.setAttribute('aCut', new THREE.BufferAttribute(new Float32Array(vCount * 4), 4));
    }
    if (B.mk && typeof SV_CLOTH !== 'undefined' && SV_CLOTH[B.mk]) {
      mGeo.setAttribute('aFlut', new THREE.BufferAttribute(new Float32Array(vCount * 3), 3));
    }
    if (B.mk === 'glow') {
      mGeo.setAttribute('aFlk', new THREE.BufferAttribute(new Float32Array(vCount).fill(0.25), 1));
    }
    mGeo.setIndex(new THREE.BufferAttribute(idx, 1));
    mGeo.computeBoundingSphere();
    var merged = new THREE.Mesh(mGeo, B.mat);
    merged.castShadow = cast;
    merged.receiveShadow = recv;
    merged.userData.mk = B.mk;
    grp.add(merged);
  }
}

function mbRegisterWorldGroup(world, grp, cls, kind, key, name, x, y, z, ry, w, d, h, culture, typesArr, fragPath) {
  grp.position.set(x, y, z);
  grp.rotation.y = ry;
  if (kind !== 'construction_site') mbCompactStaticGroup(grp);
  world.add(grp);
  var tid = null;
  if (SVTAGS) {
    tid = SVTAGS.add({
      'class': cls,
      kind: kind,
      key: key,
      name: name,
      at: [x, y, z],
      ry: ry,
      size: [w, d, h],
      tags: { culture: culture || 'hayrant', types: typesArr || ['infrastructure'] },
      frag: fragPath || 'settlements/mirabilis/src/90z-mb-world.js'
    }).id;
    grp.userData.tid = tid;
  }
  var bb = new THREE.Box3().setFromObject(grp);
  var tris = 0;
  grp.traverse(function (o) {
    if (o.isMesh && o.geometry && o.geometry.attributes.position) {
      tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
    }
  });
  var entry = {
    key: key,
    name: name,
    cls: cls,
    x: x, y: y, z: z, ry: ry,
    tid: tid,
    decl: { w: w, d: d, h: h, budget: 64000 },
    bbox: { mn: [bb.min.x, bb.min.y, bb.min.z], mx: [bb.max.x, bb.max.y, bb.max.z] },
    tris: Math.round(tris),
    front: { x: 0, z: d * 0.5, yaw: 0 },
    doorCount: 0,
    furniture: [],
    children: []
  };
  REG.push(entry);
  return entry;
}

function mbMat(mk, fallbackHex) {
  if (typeof MAT !== 'undefined' && MAT[mk]) return MAT[mk];
  return new THREE.MeshStandardMaterial({ color: fallbackHex == null ? 0x8a8275 : fallbackHex, roughness: 0.88, metalness: 0.04 });
}

function mbBoxMesh(mk, w, h, d, x, y, z, ry) {
  var geo = new THREE.BoxGeometry(w, h, d);
  /* World-unit UVs so PBR stone/timber textures tile cleanly without stretch */
  var pos = geo.attributes.position, nor = geo.attributes.normal, uv = geo.attributes.uv;
  var tile = (typeof SV_TILE0 !== 'undefined' && SV_TILE0[mk]) ? SV_TILE0[mk] : 2.2;
  for (var i = 0; i < pos.count; i++) {
    var nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i));
    var u, v;
    if (ny > 0.5) { u = pos.getX(i) / tile; v = pos.getZ(i) / tile; }
    else if (nx > 0.5) { u = pos.getZ(i) / tile; v = pos.getY(i) / tile; }
    else { u = pos.getX(i) / tile; v = pos.getY(i) / tile; }
    uv.setXY(i, u, v);
  }
  mbStampGeo(geo, mk);
  var m = new THREE.Mesh(geo, mbMat(mk));
  m.userData.mk = mk;
  m.position.set(x, y, z);
  if (ry) m.rotation.y = ry;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function mbCustomMesh(geo, mk, x, y, z) {
  mbStampGeo(geo, mk);
  var m = new THREE.Mesh(geo, mbMat(mk));
  m.userData.mk = mk;
  m.position.set(x || 0, y || 0, z || 0);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/* Terrain vertex colour + 4-channel KGROUND array weights [loess, megabreccia, paving, turf] */
function mbTerrainSample(x, z, y, rgbOut, wOut) {
  var F = MB_GROUND.fieldsAt(x, z);
  var roadW = (MB_PLAN && MB_PLAN.roadMask) ? MB_PLAN.roadMask.roadAt(x, z) : 0;
  var n = 0.93 + 0.13 * MB_GROUND.noise2(x * 0.04, z * 0.04);

  var wLoess = 0, wBreccia = 0, wPaving = 0, wTurf = 0;
  var r, g, b;

  if (F.water) {
    r = 0.22; g = 0.26; b = 0.27;
    wBreccia = 0.85;
  } else if (roadW > 0.30 && !F.water) {
    /* Paved flagstone street & ramp network across flat and sloped approaches alike */
    r = 0.64; g = 0.61; b = 0.55;
    wPaving = 0.95;
  } else if (F.thru || (F.g > 0.55 && y < MB_GROUND.brecciaTopY(x, z) + 8.0)) {
    /* Dark grey-violet Outer Wall impact megabreccia bedrock */
    r = 0.34; g = 0.33; b = 0.36;
    wBreccia = 0.92;
  } else if (F.g > 0.48) {
    /* Sheer golden-buff loess canyon walls with subtle calcrete/paleosol horizontal banding */
    var band = Math.sin(y * 0.42) > 0.72 ? 0.88 : 1.03;
    r = 0.72 * band; g = 0.59 * band; b = 0.41 * band;
    wLoess = 0.95;
  } else if (F.terrace) {
    /* Cultivated contoured agricultural terraces on H1: ploughed furrow stripes + crop-kind verdant/madder/millet hue */
    var furr = Math.sin(z * 1.35) > 0.15 ? 1.04 : 0.92;
    var cTone = Math.floor(Math.abs(z) / 72.0) % 3;
    if (cTone === 0) { r = 0.45 * furr; g = 0.53 * furr; b = 0.30 * furr; }
    else if (cTone === 1) { r = 0.54 * furr; g = 0.46 * furr; b = 0.31 * furr; }
    else { r = 0.40 * furr; g = 0.50 * furr; b = 0.32 * furr; }
    wTurf = 0.84; wLoess = 0.16;
  } else {
    /* Plateau yuan steppe & shaded larch slopes */
    var shade = MB_GROUND.clamp(-F.sunny, 0, 1);
    r = MB_GROUND.lerp(0.66, 0.44, shade);
    g = MB_GROUND.lerp(0.57, 0.49, shade);
    b = MB_GROUND.lerp(0.39, 0.33, shade);
    wLoess = MB_GROUND.lerp(0.68, 0.25, shade);
    wTurf = MB_GROUND.lerp(0.32, 0.75, shade);
  }

  rgbOut[0] = MB_GROUND.clamp(r * n, 0, 1);
  rgbOut[1] = MB_GROUND.clamp(g * n, 0, 1);
  rgbOut[2] = MB_GROUND.clamp(b * n, 0, 1);
  if (wOut) {
    wOut[0] = wLoess; wOut[1] = wBreccia; wOut[2] = wPaving; wOut[3] = wTurf;
  }
}

/* Build two-tier watertight terrain with KGROUND texture-array shader (1 sampler2DArray unit!) */
function mbBuildTerrain(world) {
  KDRAWN.clear();
  var tMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.92,
    metalness: 0.02
  });

  /* Hook per-vertex layer weights aMbW -> vMbW, then attach KGROUND.hook with array:{size:[512,512]} + triplanar cliffs */
  if (typeof KHOOK !== 'undefined' && typeof KGROUND !== 'undefined' && KMAT.mode === 'lib') {
    var glCtx = renderer.getContext();
    var dbgExt = glCtx && glCtx.getExtension ? glCtx.getExtension('WEBGL_debug_renderer_info') : null;
    var glRen = (dbgExt && glCtx.getParameter(dbgExt.UNMASKED_RENDERER_WEBGL)) || '';
    var isSoftGL = /SwiftShader|llvmpipe|Software/i.test(String(glRen));
    if (isSoftGL) renderer.shadowMap.type = THREE.BasicShadowMap;
    KHOOK.add(tMat, 'mb-weights', function (sh) {
      if (sh.vertexShader.indexOf('varying vec4 vMbW;') >= 0) return;
      sh.vertexShader = 'attribute vec4 aMbW;\nvarying vec4 vMbW;\n' +
        sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvMbW = aMbW;');
      sh.fragmentShader = 'varying vec4 vMbW;\n' + sh.fragmentShader;
    });
    KGROUND.hook(tMat, {
      array: { size: [512, 512] },
      blend: 0.20,
      hex: isSoftGL ? false : { rot: 0.6, contrast: 0.6, exp: 7 },
      far: isSoftGL ? false : { d: 70, levels: 2 },
      tri: { from: 0.42, to: 0.76, far: isSoftGL ? 160 : 280 },
      relief: isSoftGL ? null : { bump: 0.05, near: 25, far: 150 },
      layers: [
        KGROUND.layer('hayrant', 'loess', { name: 'loess', w: 'vMbW.x' }),
        KGROUND.layer('hayrant', 'megabreccia', { name: 'megabreccia', w: 'vMbW.y' }),
        KGROUND.layer('hayrant', 'paving', { name: 'paving', w: 'vMbW.z' }),
        KGROUND.layer('hayrant', 'turf', { name: 'turf', w: 'vMbW.w' })
      ]
    });
  }

  var x0 = -1200, z0 = -1200, dx = 6.0, dz = 6.0, nx = 400, nz = 400;
  var stride = nx + 1;
  var nv = stride * (nz + 1);
  var H = new Float32Array(nv);
  var col = new Float32Array(nv * 3);
  var wgts = new Float32Array(nv * 4);
  var nrm = new Float32Array(nv * 3);
  var rgb = [0, 0, 0], w4 = [0, 0, 0, 0];

  for (var iz = 0; iz <= nz; iz++) {
    var z = z0 + iz * dz;
    for (var ix = 0; ix <= nx; ix++) {
      var idx = iz * stride + ix;
      var x = x0 + ix * dx;
      var y = MB_GROUND.h(x, z);
      H[idx] = y;
      mbTerrainSample(x, z, y, rgb, w4);
      col[idx * 3] = rgb[0]; col[idx * 3 + 1] = rgb[1]; col[idx * 3 + 2] = rgb[2];
      wgts[idx * 4] = w4[0]; wgts[idx * 4 + 1] = w4[1]; wgts[idx * 4 + 2] = w4[2]; wgts[idx * 4 + 3] = w4[3];
    }
  }
  /* Compute continuous normals across the full 401x401 grid so 8x8 tile boundaries have zero lighting seams */
  for (var niz = 0; niz <= nz; niz++) {
    var iz0 = niz > 0 ? niz - 1 : 0, iz1 = niz < nz ? niz + 1 : nz;
    var spanZ = (iz1 - iz0) * dz;
    for (var nix = 0; nix <= nx; nix++) {
      var ix0 = nix > 0 ? nix - 1 : 0, ix1 = nix < nx ? nix + 1 : nx;
      var spanX = (ix1 - ix0) * dx;
      var nIdx = niz * stride + nix;
      var dhx = (H[niz * stride + ix1] - H[niz * stride + ix0]) / spanX;
      var dhz = (H[iz1 * stride + nix] - H[iz0 * stride + nix]) / spanZ;
      var invL = 1.0 / Math.sqrt(dhx * dhx + 1.0 + dhz * dhz);
      nrm[nIdx * 3] = -dhx * invL;
      nrm[nIdx * 3 + 1] = invL;
      nrm[nIdx * 3 + 2] = -dhz * invL;
    }
  }

  /* Emit 8x8 spatial tile meshes (50x50 cells = 300x300 m each) so raycasters sphere-cull 62 of 64 tiles */
  var tDiv = 8, tSub = 50, tStride = tSub + 1, tNv = tStride * tStride;
  var tIdxArr = new Uint16Array(tSub * tSub * 6);
  var ptr = 0;
  for (var tz2 = 0; tz2 < tSub; tz2++) {
    for (var tx2 = 0; tx2 < tSub; tx2++) {
      var ta = tz2 * tStride + tx2, td = ta + 1, tb = ta + tStride, tc = tb + 1;
      tIdxArr[ptr++] = ta; tIdxArr[ptr++] = tb; tIdxArr[ptr++] = td;
      tIdxArr[ptr++] = tb; tIdxArr[ptr++] = tc; tIdxArr[ptr++] = td;
    }
  }
  var sharedTileIdx = new THREE.BufferAttribute(tIdxArr, 1);
  for (var ctz = 0; ctz < tDiv; ctz++) {
    for (var ctx = 0; ctx < tDiv; ctx++) {
      var tPos = new Float32Array(tNv * 3);
      var tNrm = new Float32Array(tNv * 3);
      var tUv = new Float32Array(tNv * 2);
      var tCol = new Float32Array(tNv * 3);
      var tW = new Float32Array(tNv * 4);
      var baseX = ctx * tSub, baseZ = ctz * tSub;
      for (var lz = 0; lz <= tSub; lz++) {
        var gz = baseZ + lz;
        var wz0 = z0 + gz * dz;
        for (var lx = 0; lx <= tSub; lx++) {
          var gx = baseX + lx;
          var wx0 = x0 + gx * dx;
          var src = gz * stride + gx;
          var dst = lz * tStride + lx;
          tPos[dst * 3] = wx0; tPos[dst * 3 + 1] = H[src]; tPos[dst * 3 + 2] = wz0;
          tNrm[dst * 3] = nrm[src * 3]; tNrm[dst * 3 + 1] = nrm[src * 3 + 1]; tNrm[dst * 3 + 2] = nrm[src * 3 + 2];
          tUv[dst * 2] = gx / nx; tUv[dst * 2 + 1] = 1.0 - gz / nz;
          tCol[dst * 3] = col[src * 3]; tCol[dst * 3 + 1] = col[src * 3 + 1]; tCol[dst * 3 + 2] = col[src * 3 + 2];
          tW[dst * 4] = wgts[src * 4]; tW[dst * 4 + 1] = wgts[src * 4 + 1];
          tW[dst * 4 + 2] = wgts[src * 4 + 2]; tW[dst * 4 + 3] = wgts[src * 4 + 3];
        }
      }
      var tGeo = new THREE.BufferGeometry();
      tGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3));
      tGeo.setAttribute('normal', new THREE.BufferAttribute(tNrm, 3));
      tGeo.setAttribute('uv', new THREE.BufferAttribute(tUv, 2));
      tGeo.setAttribute('color', new THREE.BufferAttribute(tCol, 3));
      tGeo.setAttribute('aMbW', new THREE.BufferAttribute(tW, 4));
      tGeo.setIndex(sharedTileIdx);
      tGeo.computeBoundingSphere();
      var fineTile = new THREE.Mesh(tGeo, tMat);
      fineTile.receiveShadow = true;
      fineTile.userData.isGround = true;
      fineTile.userData.probeSkip = true;
      fineTile.name = 'terrain:fine:' + ctx + '_' + ctz;
      world.add(fineTile);
    }
  }
  KDRAWN.add(KDRAWN.grid({ x0: x0, z0: z0, dx: dx, dz: dz, nx: nx, nz: nz, h: H }));

  /* Non-overlapping 120 m regional Scale Model 5.1 ring [-14400..+14400] in 4x4 spatial tiles with inner cutout */
  var rx0 = -14400, rz0 = -14400, rcell = 120.0, rnx = 240, rnz = 240, rStride = rnx + 1;
  var rnv = rStride * (rnz + 1);
  var rPos = new Float32Array(rnv * 3);
  var rCol = new Float32Array(rnv * 3);
  var rNrm = new Float32Array(rnv * 3);
  for (var jz = 0; jz <= rnz; jz++) {
    var wz = rz0 + jz * rcell;
    for (var jx = 0; jx <= rnx; jx++) {
      var k = jz * rStride + jx;
      var wx = rx0 + jx * rcell;
      var wy = MB_GROUND.h(wx, wz);
      rPos[k * 3] = wx; rPos[k * 3 + 1] = wy; rPos[k * 3 + 2] = wz;
      mbTerrainSample(wx, wz, wy, rgb, null);
      rCol[k * 3] = rgb[0]; rCol[k * 3 + 1] = rgb[1]; rCol[k * 3 + 2] = rgb[2];
    }
  }
  for (var rjz = 0; rjz <= rnz; rjz++) {
    var rjz0 = rjz > 0 ? rjz - 1 : 0, rjz1 = rjz < rnz ? rjz + 1 : rnz;
    var rSpanZ = (rjz1 - rjz0) * rcell;
    for (var rjx = 0; rjx <= rnx; rjx++) {
      var rjx0 = rjx > 0 ? rjx - 1 : 0, rjx1 = rjx < rnx ? rjx + 1 : rnx;
      var rSpanX = (rjx1 - rjx0) * rcell;
      var rk = rjz * rStride + rjx;
      var rdhx = (rPos[(rjz * rStride + rjx1) * 3 + 1] - rPos[(rjz * rStride + rjx0) * 3 + 1]) / rSpanX;
      var rdhz = (rPos[(rjz1 * rStride + rjx) * 3 + 1] - rPos[(rjz0 * rStride + rjx) * 3 + 1]) / rSpanZ;
      var rInv = 1.0 / Math.sqrt(rdhx * rdhx + 1.0 + rdhz * rdhz);
      rNrm[rk * 3] = -rdhx * rInv; rNrm[rk * 3 + 1] = rInv; rNrm[rk * 3 + 2] = -rdhz * rInv;
    }
  }
  var rIdxAll = [];
  var farMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0.0 });
  var rDiv = 4, rSub = 60, rtStride = rSub + 1, rtNv = rtStride * rtStride;
  for (var rtz = 0; rtz < rDiv; rtz++) {
    for (var rtx = 0; rtx < rDiv; rtx++) {
      var rtPos = new Float32Array(rtNv * 3);
      var rtNrm = new Float32Array(rtNv * 3);
      var rtCol = new Float32Array(rtNv * 3);
      var rtUv = new Float32Array(rtNv * 2);
      var rBaseX = rtx * rSub, rBaseZ = rtz * rSub;
      for (var rlz = 0; rlz <= rSub; rlz++) {
        var rgz = rBaseZ + rlz;
        for (var rlx = 0; rlx <= rSub; rlx++) {
          var rgx = rBaseX + rlx;
          var rSrc = rgz * rStride + rgx;
          var rDst = rlz * rtStride + rlx;
          rtPos[rDst * 3] = rPos[rSrc * 3]; rtPos[rDst * 3 + 1] = rPos[rSrc * 3 + 1]; rtPos[rDst * 3 + 2] = rPos[rSrc * 3 + 2];
          rtNrm[rDst * 3] = rNrm[rSrc * 3]; rtNrm[rDst * 3 + 1] = rNrm[rSrc * 3 + 1]; rtNrm[rDst * 3 + 2] = rNrm[rSrc * 3 + 2];
          rtCol[rDst * 3] = rCol[rSrc * 3]; rtCol[rDst * 3 + 1] = rCol[rSrc * 3 + 1]; rtCol[rDst * 3 + 2] = rCol[rSrc * 3 + 2];
          rtUv[rDst * 2] = rPos[rSrc * 3] / 24.0; rtUv[rDst * 2 + 1] = rPos[rSrc * 3 + 2] / 24.0;
        }
      }
      var rtIdx = [];
      for (var qz = 0; qz < rSub; qz++) {
        var gqz = rBaseZ + qz;
        for (var qx = 0; qx < rSub; qx++) {
          var gqx = rBaseX + qx;
          if (gqx >= 110 && gqx < 130 && gqz >= 110 && gqz < 130) continue;
          var ga = gqz * rStride + gqx, gd = ga + 1, gb = ga + rStride, gc = gb + 1;
          rIdxAll.push(ga, gb, gd, gb, gc, gd);
          var la = qz * rtStride + qx, ld = la + 1, lb = la + rtStride, lc = lb + 1;
          rtIdx.push(la, lb, ld, lb, lc, ld);
        }
      }
      if (!rtIdx.length) continue;
      var rtGeo = new THREE.BufferGeometry();
      rtGeo.setAttribute('position', new THREE.BufferAttribute(rtPos, 3));
      rtGeo.setAttribute('normal', new THREE.BufferAttribute(rtNrm, 3));
      rtGeo.setAttribute('color', new THREE.BufferAttribute(rtCol, 3));
      rtGeo.setAttribute('uv', new THREE.BufferAttribute(rtUv, 2));
      rtGeo.setIndex(rtIdx);
      rtGeo.computeBoundingSphere();
      var farTile = new THREE.Mesh(rtGeo, farMat);
      farTile.receiveShadow = false;
      farTile.userData.isGround = true;
      farTile.userData.probeSkip = true;
      farTile.userData.farField = true;
      farTile.name = 'terrain:regional:' + rtx + '_' + rtz;
      world.add(farTile);
    }
  }
  KDRAWN.add(KDRAWN.mesh(rPos, rIdxAll, null, { cell: 240 }));
}

/* Build all real core/water surfaces: Yut-Ma upper & lower reaches, W5 mill-leat, 2 waterfalls & 4 mineral pools */
function mbBuildWater(world) {
  WATER.surfaces.length = 0;
  if (WATER.drawn) WATER.drawn.length = 0;
  MB_WATER_RECS = { flows: [], falls: [], still: [] };

  var fUp = WATER.flow({ name: 'Yut-Ma Upper Gorge', pts: MB_HYD.YUT_UPPER_PTS, width: 17.5, speed: 2.15, densify: 10 });
  MB_WATER_RECS.flows.push(WATER.drawFlow(fUp, { scene: world, step: 8, margin: 1.4, shallow: 0x4b7d76, deep: 0x1a3f42 }));

  var fLow = WATER.flow({ name: 'Yut-Ma Lower Gorge', pts: MB_HYD.YUT_LOWER_PTS, width: 18.5, speed: 2.35, densify: 10 });
  MB_WATER_RECS.flows.push(WATER.drawFlow(fLow, { scene: world, step: 8, margin: 1.4, shallow: 0x487872, deep: 0x183a3e }));

  var fLeat = WATER.flow({ name: 'Yut-Ma Mill Leat', pts: MB_HYD.MILL_LEAT_PTS, width: 2.8, speed: 1.75, densify: 6 });
  MB_WATER_RECS.flows.push(WATER.drawFlow(fLeat, { scene: world, step: 5, margin: 0.5, shallow: 0x568980, deep: 0x214a4c }));

  var fallSpecs = [MB_HYD.MOON_FALL, MB_HYD.SIRU_FALL];
  for (var fi = 0; fi < fallSpecs.length; fi++) {
    var fs = fallSpecs[fi];
    var wf = WATER.fall({ name: fs.name, lip: fs.lip, dir: fs.dir, speed: fs.speed, drop: fs.drop });
    MB_WATER_RECS.falls.push(WATER.drawFall(wf, { scene: world, plungeY: fs.plungeY, spray: false }));
  }

  for (var si = 0; si < MB_HYD.STILL_POOLS.length; si++) {
    var sp = MB_HYD.STILL_POOLS[si];
    var st = WATER.still({ name: sp.name, level: sp.level, poly: sp.poly });
    var dr = WATER.drawStill(st, { scene: world, color: sp.color, roughness: 0.06, metalness: 0.14 });
    MB_WATER_RECS.still.push({ spec: sp, S: st, D: dr });
  }
}

/* Build the monumental 164.5 m-high Yut ("Moon-Bridge") + Weir Bridge + KCARVE cliff portals + Dust Towers +
   Covered Market Galleries + Porcelain-Insulator Telegraph Line + Escarpment Hoist Track & Counterbalanced Cars! */
function mbBuildInfrastructure(world, plan) {
  MB_HOIST_NODES = { carA: null, carB: null, drum: null };
  MB_WHEEL_NODES.length = 0;

  /* 1. THE YUT ("MOON-BRIDGE"): 106 m viaduct across z = [-246..-140] at x = 0, deck +3088.0 m */
  var mbGrp = new THREE.Group();
  var bSpec = MB_GROUND.MOON_BRIDGE;
  var zMid = 0.5 * (bSpec.z0 + bSpec.z1);
  var totalL = bSpec.z1 - bSpec.z0;
  /* Twin cyclopean megabreccia & basalt chasm piers rising from bedrock (+2926 m) to +3086.2 m (local y relative to deckY) */
  var pierZs = [zMid - 30.5, zMid + 30.5];
  for (var pi = 0; pi < 2; pi++) {
    var pz = pierZs[pi] - zMid;
    /* Lower battered megabreccia plinth (-162..-96 m below deck) */
    mbGrp.add(mbBoxMesh('megabreccia', 15.6, 66.0, 13.4, 0, -129.0, pz, 0));
    /* Middle basalt shaft (-95.9..-34 m below deck) with chambered relieving arch window */
    mbGrp.add(mbBoxMesh('basalt', 14.2, 61.8, 11.6, 0, -65.0, pz, 0));
    /* Upper ashlar pier & nephrite stringcourse (-33.9..-1.6 m below deck) */
    mbGrp.add(mbBoxMesh('ashlar', 13.8, 32.2, 10.4, 0, -17.8, pz, 0));
    mbGrp.add(mbBoxMesh('nephrite', 14.4, 0.55, 11.0, 0, -1.35, pz, 0));
  }
  /* North & South landward approach abutments */
  mbGrp.add(mbBoxMesh('basalt', 14.0, 38.0, 15.0, 0, -20.6, (bSpec.z0 + 7.5) - zMid, 0));
  mbGrp.add(mbBoxMesh('basalt', 14.0, 38.0, 15.0, 0, -20.6, (bSpec.z1 - 7.5) - zMid, 0));

  /* Central 52 m parabolic arch ring (17 stepped non-overlapping voussoirs) + Emerald-Nephrite Keystone */
  var nVous = 17, halfSpan = 25.0, archRise = 30.0;
  for (var vi = 0; vi < nVous; vi++) {
    var u0 = -1 + (2 * vi) / nVous, u1 = -1 + (2 * (vi + 1)) / nVous;
    var um = 0.5 * (u0 + u1);
    var vz = um * halfSpan;
    var vy = -33.5 + archRise * (1 - um * um);
    var dydz = (-2 * archRise * um) / halfSpan;
    var segLen = Math.hypot((u1 - u0) * halfSpan, archRise * ((1 - u1 * u1) - (1 - u0 * u0))) * 0.94;
    var vMesh = mbBoxMesh(vi === 8 ? 'nephrite' : (vi % 2 === 0 ? 'ashlar' : 'columnar'),
      vi === 8 ? 14.3 : 13.4, vi === 8 ? 3.4 : 2.6, segLen, 0, vy, vz, 0);
    vMesh.rotation.x = -Math.atan(dydz);
    mbGrp.add(vMesh);
  }
  /* Spandrel curtain walls above arch ring */
  for (var spSide = -1; spSide <= 1; spSide += 2) {
    mbGrp.add(mbBoxMesh('ashlar', 1.15, 6.2, totalL - 1.0, spSide * 6.15, -4.75, 0, 0));
  }
  /* Roadway deck slab (top flush at local y = 0 -> world +3088.0 m) + stepped wind-parapets + 6 lantern piers */
  mbGrp.add(mbBoxMesh('paving', bSpec.width, 1.55, totalL, 0, -0.78, 0, 0));
  for (var pSide = -1; pSide <= 1; pSide += 2) {
    var pxPar = pSide * (bSpec.width * 0.5 - 0.42);
    mbGrp.add(mbBoxMesh('columnar', 0.78, 1.25, totalL, pxPar, 0.64, 0, 0));
    mbGrp.add(mbBoxMesh('nephrite', 0.92, 0.18, totalL, pxPar, 1.36, 0, 0));
    for (var li = -2; li <= 2; li++) {
      var lz = li * 21.0;
      mbGrp.add(mbBoxMesh('basalt', 1.18, 2.35, 1.18, pxPar, 1.20, lz, 0));
      mbGrp.add(mbBoxMesh('window_lit', 0.62, 0.68, 0.62, pxPar, 2.74, lz, 0));
      mbGrp.add(mbBoxMesh('celadon', 1.12, 0.32, 1.12, pxPar, 3.26, lz, 0));
    }
  }
  mbRegisterWorldGroup(world, mbGrp, 'feature', 'bridge', 'mb_yut_moon_bridge',
    'The Yut (Moon-Bridge over Yut-Ma Gorge)', 0, bSpec.deckY, zMid, 0, bSpec.width + 2, totalL, 166.0, 'hayrant', ['infrastructure']);
  KDRAWN.add(KDRAWN.fromObject(mbGrp));

  /* 2. W5 Gorge Weir Packhorse Stone-Slab Bridge (x = -42, z = [-238..-148], deck +2943.5 -> +2939.5 m) */
  var wb = MB_GROUND.WEIR_BRIDGE;
  var wbGrp = new THREE.Group();
  var wbLen = wb.z1 - wb.z0, wbMid = 0.5 * (wb.z0 + wb.z1);
  var wbSlope = mbBoxMesh('paving', wb.width, 0.72, wbLen, 0, -0.36, 0, 0);
  wbSlope.rotation.x = Math.asin(4.0 / wbLen);
  wbGrp.add(wbSlope);
  for (var wpi = -2; wpi <= 2; wpi++) {
    wbGrp.add(mbBoxMesh('megabreccia', wb.width + 0.6, 12.5, 2.6, 0, -6.98, wpi * 18.0, 0));
  }
  for (var wps = -1; wps <= 1; wps += 2) {
    var wbPar = mbBoxMesh('columnar', 0.44, 0.68, wbLen, wps * (wb.width * 0.5 - 0.24), 0.35, 0, 0);
    wbPar.rotation.x = Math.asin(4.0 / wbLen);
    wbGrp.add(wbPar);
  }
  mbRegisterWorldGroup(world, wbGrp, 'feature', 'bridge', 'mb_weir_bridge',
    'Yut-Ma Gorge Weir Packhorse Bridge', wb.x, wb.deckY, wbMid, 0, wb.width, wbLen, 13.5, 'hayrant', ['infrastructure']);

  /* 3. KCARVE Loess Cliff-Alcove Masonry Collars (W4 yaodong rows & W5 saltpeter cave overhang) */
  for (var ai = 0; ai < MB_GROUND.CAVE_ALCOVES.length; ai++) {
    var alc = MB_GROUND.CAVE_ALCOVES[ai];
    var aGrp = new THREE.Group();
    aGrp.add(mbBoxMesh('brick', alc.w, 0.65, 2.2, 0, alc.h + 0.35, 0, 0));
    aGrp.add(mbBoxMesh('ashlar', 1.4, alc.h, 2.0, -alc.w * 0.5 + 0.7, alc.h * 0.5, 0, 0));
    aGrp.add(mbBoxMesh('ashlar', 1.4, alc.h, 2.0, alc.w * 0.5 - 0.7, alc.h * 0.5, 0, 0));
    aGrp.add(mbBoxMesh('onyx', alc.w - 3.0, alc.h - 0.4, 0.9, 0, (alc.h - 0.4) * 0.5, 0.45, 0));
    mbRegisterWorldGroup(world, aGrp, 'feature', 'cave_alcove', 'mb_loess_alcove',
      'Loess Vaulted Cliff Collar (' + alc.id + ')', alc.x, alc.y, alc.z, alc.ry, alc.w, 2.6, alc.h + 0.8, 'hayrant', ['infrastructure']);
  }

  /* 4. WOW.dustTowers — Stratified Golden-Buff Loess Hoodoo Pillars with Calcrete Ledges & Turf Capstones */
  for (var dti = 0; dti < MB_GROUND.DUST_TOWERS.length; dti++) {
    var dt = MB_GROUND.DUST_TOWERS[dti];
    var dtY = MB_GROUND.h(dt.x, dt.z);
    var dtGrp = new THREE.Group();
    /* Flared talus skirt + 3 eroded loess strata tiers + resistant calcrete ledges + grassy turf cap */
    var skirtG = new THREE.CylinderGeometry(dt.r * 0.92, dt.r * 1.38, dt.h * 0.28, 14);
    dtGrp.add(mbCustomMesh(skirtG, 'loess', 0, dt.h * 0.14 - 1.4, 0));
    var midG = new THREE.CylinderGeometry(dt.r * 0.68, dt.r * 0.94, dt.h * 0.44, 14);
    dtGrp.add(mbCustomMesh(midG, 'loess', 0, dt.h * 0.46 - 1.1, 0));
    var ledge1 = new THREE.CylinderGeometry(dt.r * 0.80, dt.r * 0.76, 0.55, 14);
    dtGrp.add(mbCustomMesh(ledge1, 'silt', 0, dt.h * 0.52 - 0.8, 0));
    var neckG = new THREE.CylinderGeometry(dt.r * 0.54, dt.r * 0.70, dt.h * 0.34, 14);
    dtGrp.add(mbCustomMesh(neckG, 'loess', 0, dt.h * 0.78 - 0.9, 0));
    var capStone = new THREE.CylinderGeometry(dt.r * dt.cap * 0.76, dt.r * 0.58, 1.35, 14);
    dtGrp.add(mbCustomMesh(capStone, 'silt', 0, dt.h - 0.35, 0));
    var turfCap = new THREE.CylinderGeometry(dt.r * dt.cap * 0.70, dt.r * dt.cap * 0.76, 0.62, 14);
    dtGrp.add(mbCustomMesh(turfCap, 'turf', 0, dt.h + 0.58, 0));
    mbRegisterWorldGroup(world, dtGrp, 'feature', 'rock_pillar', 'wow_dust_tower',
      'Cemented Loess Dust Tower (' + dt.id + ')', dt.x, dtY, dt.z, dti * 0.7, dt.r * 2.4, dt.r * 2.4, dt.h + 1.2, 'hayrant', ['infrastructure']);
  }

  /* 5. W3 Kuran Covered Winter Snow/Wind Galleries (along way.kuran_bazaar curbs) */
  var galGrp = new THREE.Group();
  for (var gx = -560; gx <= -310; gx += 36) {
    for (var gs = -1; gs <= 1; gs += 2) {
      var gz = 260 + gs * 6.4;
      var gy = MB_GROUND.h(gx, gz) - MB_GROUND.h(-435, 260);
      galGrp.add(mbBoxMesh('larch', 0.34, 3.3, 0.34, gx + 435 - 7.0, gy + 1.65, gs * 6.4, 0));
      galGrp.add(mbBoxMesh('larch', 0.34, 3.3, 0.34, gx + 435 + 7.0, gy + 1.65, gs * 6.4, 0));
      galGrp.add(mbBoxMesh('shutter', 15.2, 0.36, 2.5, gx + 435, gy + 3.48, gs * 6.4, 0));
      galGrp.add(mbBoxMesh('plaid', 14.4, 0.52, 0.08, gx + 435, gy + 2.95, gs * 5.25, 0));
    }
  }
  mbRegisterWorldGroup(world, galGrp, 'feature', 'arcade', 'mb_winter_gallery',
    'Kuran Bazaar Winter Wind Galleries', -435, MB_GROUND.h(-435, 260), 260, 0, 270, 16, 4.0, 'hayrant', ['infrastructure']);

  /* 5B. Ukor-Tera Pass Arch Portal spanning cleanly over way.ukor_pass_w / way.kuran_bazaar at (-625, 260) */
  var pgArch = new THREE.Group();
  var pgY = MB_GROUND.h(-625, 260);
  for (var ps = -1; ps <= 1; ps += 2) {
    pgArch.add(mbBoxMesh('megabreccia', 4.6, 2.2, 2.8, 0, 1.1, ps * 6.0, 0));
    pgArch.add(mbBoxMesh('basalt', 4.2, 4.2, 2.4, 0, 4.3, ps * 6.0, 0));
    pgArch.add(mbBoxMesh('columnar', 4.5, 0.45, 2.7, 0, 6.55, ps * 6.0, 0));
  }
  pgArch.add(mbBoxMesh('ashlar', 4.2, 1.55, 14.8, 0, 7.55, 0, 0));
  pgArch.add(mbBoxMesh('nephrite', 4.5, 0.28, 15.2, 0, 8.46, 0, 0));
  pgArch.add(mbBoxMesh('celadon', 4.8, 0.55, 15.8, 0, 8.88, 0, 0));
  pgArch.add(mbBoxMesh('window_lit', 0.55, 0.65, 0.55, -2.25, 7.55, -4.6, 0));
  pgArch.add(mbBoxMesh('window_lit', 0.55, 0.65, 0.55, -2.25, 7.55, 4.6, 0));
  mbRegisterWorldGroup(world, pgArch, 'feature', 'gate_arch', 'mb_ukor_pass_arch',
    'Ukor-Tera Pass Toll Archway', -625, pgY, 260, 0, 5.2, 16.0, 9.4, 'hayrant', ['infrastructure']);

  /* 6. Overhead Porcelain-Insulator Telegraph Catenary Line (W1 hy_tube_relay -> W6 hy_escarpment_hoist & hy_beacon_nuraghe) */
  var telGrp = new THREE.Group();
  var poles = plan.telegraphPoles;
  for (var tpi = 0; tpi < poles.length; tpi++) {
    var pl = poles[tpi];
    /* Pole timber + crossarm + 3 celadon-glazed petticoat insulators */
    telGrp.add(mbBoxMesh('larch', 0.32, 7.6, 0.32, pl.x, pl.y + 3.6, pl.z, 0));
    telGrp.add(mbBoxMesh('timber', 0.24, 0.22, 2.2, pl.x, pl.topY - 0.25, pl.z, 0));
    for (var ins = -1; ins <= 1; ins++) {
      telGrp.add(mbBoxMesh('celadon', 0.18, 0.28, 0.18, pl.x, pl.topY, pl.z + ins * 0.82, 0));
    }
    if (tpi + 1 < poles.length) {
      var pn = poles[tpi + 1];
      var cdx = pn.x - pl.x, cdy = pn.topY - pl.topY, cdz = pn.z - pl.z;
      var clen = Math.hypot(cdx, cdy, cdz);
      var cyaw = Math.atan2(cdx, cdz);
      var cpitch = -Math.asin(MB_GROUND.clamp(cdy / Math.max(0.1, clen), -1, 1));
      for (var wr = -1; wr <= 1; wr += 2) {
        var wire = mbBoxMesh('iron', 0.05, 0.05, clen, 0.5 * (pl.x + pn.x), 0.5 * (pl.topY + pn.topY) - 0.18, 0.5 * (pl.z + pn.z) + wr * 0.82, cyaw);
        wire.rotation.x = cpitch;
        telGrp.add(wire);
      }
    }
  }
  mbRegisterWorldGroup(world, telGrp, 'feature', 'telegraph_line', 'mb_porcelain_telegraph',
    'Circuit E6 Porcelain-Insulator Telegraph Line', 0, 0, 0, 0, 540, 120, 12, 'eternian', ['infrastructure']);

  /* 7. Fulcrum Escarpment Inclined Hoist Track & Twin Counterbalanced Freight Cars (W6 -> +2850 m yard) */
  var hs = MB_HYD.HOIST_SPEC;
  var hGrp = new THREE.Group();
  var tDx = hs.botX - hs.topX, tDy = hs.botY - hs.topY;
  var trackLen = Math.hypot(tDx, tDy);
  var trackPitch = Math.atan2(-tDy, tDx);
  var midX = 0.5 * (hs.topX + hs.botX), midY = 0.5 * (hs.topY + hs.botY);

  /* Twin iron-shod larch trestle rails + masonry cliff bents */
  var lanesZ = [hs.laneZ_A, hs.laneZ_B];
  for (var lni = 0; lni < 2; lni++) {
    var lz2 = lanesZ[lni];
    for (var rlOff = -0.85; rlOff <= 0.85; rlOff += 1.7) {
      var rail = mbBoxMesh('iron', trackLen, 0.22, 0.18, midX, midY - 0.35, lz2 + rlOff, 0);
      rail.rotation.z = -trackPitch;
      hGrp.add(rail);
    }
  }
  mbRegisterWorldGroup(world, hGrp, 'feature', 'hoist_track', 'mb_escarpment_rail',
    'Fulcrum Escarpment Counterbalanced Hoistway', 0, 0, 0, 0, 160, 14, 220, 'hayrant', ['infrastructure']);

  function makeHoistCar(name, cargoKey) {
    var cg = new THREE.Group();
    cg.add(mbBoxMesh('larch', 4.6, 0.42, 2.8, 0, 0.35, 0, 0));
    cg.add(mbBoxMesh('iron', 4.8, 1.35, 0.16, 0, 1.24, -1.35, 0));
    cg.add(mbBoxMesh('iron', 4.8, 1.35, 0.16, 0, 1.24, 1.35, 0));
    cg.add(mbBoxMesh(cargoKey, 2.6, 1.45, 1.9, 0, 1.30, 0, 0));
    cg.add(mbBoxMesh('window_lit', 0.38, 0.42, 0.38, 2.1, 1.95, 0, 0));
    world.add(cg);
    if (SVTAGS) {
      var tid = SVTAGS.add({
        'class': 'prop', kind: 'hoist_car', key: 'mb_hoist_car', name: name,
        at: [hs.topX, hs.topY, hs.laneZ_A], ry: 0, size: [4.8, 2.8, 2.2],
        tags: { culture: 'hayrant', types: ['infrastructure'] }, frag: KIT.frag
      }).id;
      cg.userData.tid = tid;
    }
    return cg;
  }
  MB_HOIST_NODES.carA = makeHoistCar('Hoist Car North (Porcelain & Bullion)', 'celadon');
  MB_HOIST_NODES.carB = makeHoistCar('Hoist Car South (Fulcrum Foundry Coal)', 'basalt');

  /* 8. Animated Gorge Overshot Waterwheels beside hy_larch_flume_yard (-335) & hy_nephrite_lapidary (-235) */
  var wheelXs = [-335, -235];
  for (var wxi = 0; wxi < wheelXs.length; wxi++) {
    var wx2 = wheelXs[wxi];
    var wg = new THREE.Group();
    for (var spk = 0; spk < 6; spk++) {
      var spoke = mbBoxMesh('larch', 0.22, 5.4, 0.85, 0, 0, 0, 0);
      spoke.rotation.z = (spk / 6) * Math.PI;
      wg.add(spoke);
    }
    wg.position.set(wx2, 2941.8, -164.0);
    world.add(wg);
    MB_WHEEL_NODES.push(wg);
  }
}

/* Build the 5 active KCONS rising construction lots in W6 + C1 Ukor-Tera Caravan Halt tents/wagons */
function mbBuildConstructionAndCamp(world, plan) {
  MB_CONS_SITES.length = 0;
  MB_CAMP_NODES.length = 0;

  /* 1. Active KCONS + KCITY.constructMesh sites in W6 */
  for (var i = 0; i < plan.lots.length; i++) {
    var lt = plan.lots[i];
    if (lt.constructing == null) continue;
    var f = lt.constructing;
    var cRoot = new THREE.Group();
    if (typeof KCONS !== 'undefined' && KCONS && KCONS.site) {
      var cSite = KCONS.site({
        w: lt.w, d: lt.d, h: lt.h,
        bill: { logs: 6, blocks: 8, bricks: 6, slabs: 4 }
      });
      cSite.set(f);
      cRoot.add(cSite.group);
    }
    /* Build partial building reveal via KCITY.constructMesh over a dry prototype draw */
    if (typeof KCITY !== 'undefined' && KCITY.flattenProto && KCITY.constructMesh && DEFS[lt.rawKey]) {
      var pGrp = new THREE.Group();
      var prevGB = GB, prevTarget = GTARGET, prevDry = PLACE_DRY;
      GB = {}; GTARGET = GB; PLACE_DRY = 1;
      try {
        place(lt.rawKey, 0, 0, 0, { y: 0, v: lt.v });
        flushBuckets(GB, pGrp, false);
      } finally {
        GB = prevGB; GTARGET = prevTarget; PLACE_DRY = prevDry;
      }
      var flat = KCITY.flattenProto(pGrp, { pack: 'hayrant' });
      if (flat && flat.parts && flat.parts.length) {
        var cm = KCITY.constructMesh(flat.parts);
        cm.set(f);
        cRoot.add(cm.group);
      }
    }
    mbRegisterWorldGroup(world, cRoot, 'building', 'construction_site', lt.rawKey,
      'Rising Construction Lot (' + lt.id + ', ' + Math.round(f * 100) + '%)',
      lt.x, lt.padY, lt.z, lt.ry, lt.w + 2, lt.d + 2, lt.h, lt.kit === 'eternian' ? 'eternian' : 'hayrant', ['industry']);
    MB_CONS_SITES.push({ lot: lt, group: cRoot });
  }

  /* 2. C1 Ukor-Tera Whale-Clan Caravan Halt outside hy_pass_gate (KCAMP.halt records drawn on packed PBR materials) */
  var ch = plan.campHalt;
  var recs = (ch && ch.records) ? ch.records : [];
  for (var ri = 0; ri < recs.length; ri++) {
    var r = recs[ri];
    var parsed = (typeof KCAMP !== 'undefined' && KCAMP.tentParse) ? KCAMP.tentParse(r.key) : { key: r.key };
    var tKey = parsed.key || 'tn-bell-m';
    var tGrp = new THREE.Group();
    if (tKey.indexOf('wagon') >= 0) {
      /* Heavy Hueru-Kuran nephrite-hauling timber wagon with whalebone hoop-tilt */
      tGrp.add(mbBoxMesh('larch', r.w * 0.88, 0.42, r.d * 0.76, 0, 0.72, 0, 0));
      var tiltGeo = new THREE.CylinderGeometry(r.w * 0.42, r.w * 0.44, r.d * 0.74, 9, 1, false, 0, Math.PI);
      tiltGeo.rotateZ(Math.PI * 0.5);
      tiltGeo.rotateY(Math.PI * 0.5);
      tGrp.add(mbCustomMesh(tiltGeo, 'pelt', 0, 0.94, 0));
      for (var wx3 = -1; wx3 <= 1; wx3 += 2) {
        for (var wz3 = -1; wz3 <= 1; wz3 += 2) {
          tGrp.add(mbBoxMesh('iron', 0.22, 0.86, 0.86, wx3 * (r.w * 0.44), 0.43, wz3 * (r.d * 0.28), 0));
        }
      }
    } else {
      /* Fur-and-plaid Whale-Clan bell/marquee pavilion crowned with crossed whalebone finials */
      var rad = Math.min(r.w, r.d) * 0.46;
      var wallH = r.h * 0.48, coneH = r.h * 0.52;
      tGrp.add(mbCustomMesh(new THREE.CylinderGeometry(rad, rad * 1.04, wallH, 10), ri % 2 === 0 ? 'hide' : 'plaid', 0, wallH * 0.5, 0));
      tGrp.add(mbCustomMesh(new THREE.ConeGeometry(rad * 1.08, coneH, 10), ri % 3 === 0 ? 'plaid' : 'pelt', 0, wallH + coneH * 0.5, 0));
      tGrp.add(mbBoxMesh('whalebone', 0.16, 1.15, 0.16, 0, r.h + 0.32, 0, 0.3));
    }
    var cy = MB_GROUND.h(r.x, r.z);
    mbRegisterWorldGroup(world, tGrp, 'building', 'camp_tent', tKey,
      'Ukor-Tera Whale-Clan Halt (' + r.id + ')', r.x, cy, r.z, r.ry == null ? 0 : r.ry, r.w, r.d, r.h, 'hueru-kuran', ['inn']);
    MB_CAMP_NODES.push(tGrp);
  }
  /* Stacked Kuran rough emerald-nephrite trade boulders & Leviathan whalebone arch-ribs in laager center */
  var tradePile = new THREE.Group();
  tradePile.add(mbBoxMesh('nephrite', 2.4, 1.35, 1.6, -1.8, 0.68, 0, 0.2));
  tradePile.add(mbBoxMesh('jade', 1.9, 1.10, 1.4, 1.6, 0.55, 0.6, -0.3));
  tradePile.add(mbBoxMesh('whalebone', 0.35, 3.6, 0.35, 0, 1.8, -1.8, 0.15));
  tradePile.add(mbBoxMesh('window_lit', 0.9, 0.45, 0.9, 0, 0.24, 1.6, 0));
  var py0 = MB_GROUND.h(-758, 296);
  mbRegisterWorldGroup(world, tradePile, 'prop', 'cargo_pile', 'mb_kuran_nephrite_cargo',
    'Hueru-Kuran Nephrite & Whalebone Caravan Cargo', -758, py0, 296, 0, 6, 6, 3.8, 'hueru-kuran', ['market']);
}

/* Build continuous 3D stone-kerbed causeways, horizontal-tread masonry staircases, terrace retaining walls, and walled enclosures */
function mbBuildCausewaysAndEnclosures(world, plan) {
  /* 1. Continuous 3D stone-kerbed causeways & real horizontal-tread masonry staircases along terrace, bench & switchback ways */
  var roadGrp = new THREE.Group();
  var ways = plan.ways || [];
  for (var wi = 0; wi < ways.length; wi++) {
    var wy = ways[wi];
    if (!wy.causeway || wy.cls === 'bridge') continue;
    var rw = wy.w == null ? 6.0 : wy.w;
    var isStair = wy.cls === 'stair';
    for (var wk = 0; wk + 1 < wy.pts.length; wk++) {
      var p0 = wy.pts[wk], p1 = wy.pts[wk + 1];
      var segLen = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
      if (segLen < 1.0) continue;
      var yaw = Math.atan2(p1[0] - p0[0], p1[1] - p0[1]);
      var hasY0 = p0.length > 2 && p0[2] != null;
      var hasY1 = p1.length > 2 && p1[2] != null;
      var segY0 = hasY0 ? p0[2] : (wy.benchY != null ? wy.benchY : MB_GROUND.h(p0[0], p0[1]));
      var segY1 = hasY1 ? p1[2] : (wy.benchY != null ? wy.benchY : MB_GROUND.h(p1[0], p1[1]));

      if (isStair && Math.abs(segY1 - segY0) > 0.45) {
        /* Real architectural stone staircase: horizontal ashlar treads (0 deg!) + flush triangular/wedged masonry cheek-plinths */
        var nSteps = Math.max(6, Math.min(72, Math.round(Math.abs(segY1 - segY0) / 0.30)));
        var stepRun = segLen / nSteps;
        var yFloor = Math.min(segY0, segY1) - (wy.id === 'way.w5.mule_down' ? 14.0 : 0.35);
        var stairGrp = new THREE.Group();
        var smx = 0.5 * (p0[0] + p1[0]), smz = 0.5 * (p0[1] + p1[1]);
        stairGrp.position.set(smx, 0, smz);
        stairGrp.rotation.y = yaw;
        for (var st = 0; st < nSteps; st++) {
          var su = (st + 0.5) / nSteps;
          var sy = MB_GROUND.lerp(segY0, segY1, su);
          var szLoc = (su - 0.5) * segLen;
          var pierH = Math.max(0.45, sy - yFloor);
          /* Grounded masonry step-course extending flush to the lower terrace floor (never hanging sawtooth in mid-air!) */
          stairGrp.add(mbBoxMesh(wy.id === 'way.w5.mule_down' ? 'megabreccia' : 'loess', rw + 0.48, pierH, stepRun + 0.14, 0, yFloor + pierH * 0.5 - 0.08, szLoc, 0));
          stairGrp.add(mbBoxMesh('ashlar', rw + 0.12, 0.26, stepRun + 0.18, 0, sy - 0.05, szLoc, 0));
          if (st % 2 === 0 || nSteps <= 26) {
            var cheekSpan = (st % 2 === 0 && nSteps > 26) ? stepRun * 2.08 : stepRun + 0.18;
            for (var sck = -1; sck <= 1; sck += 2) {
              stairGrp.add(mbBoxMesh('columnar', 0.32, 0.72, cheekSpan, sck * (rw * 0.5 + 0.14), sy + 0.36, szLoc, 0));
            }
          }
        }
        roadGrp.add(stairGrp);
      } else if (!isStair) {
        var nSpan = Math.max(1, Math.ceil(segLen / 7.5));
        var subL = segLen / nSpan;
        for (var si = 0; si < nSpan; si++) {
          var u0 = si / nSpan, u1 = (si + 1) / nSpan;
          var xa = MB_GROUND.lerp(p0[0], p1[0], u0), za = MB_GROUND.lerp(p0[1], p1[1], u0);
          var xb = MB_GROUND.lerp(p0[0], p1[0], u1), zb = MB_GROUND.lerp(p0[1], p1[1], u1);
          var ya = (hasY0 && hasY1) ? MB_GROUND.lerp(segY0, segY1, u0) : (wy.benchY != null ? wy.benchY : MB_GROUND.h(xa, za));
          var yb = (hasY0 && hasY1) ? MB_GROUND.lerp(segY0, segY1, u1) : (wy.benchY != null ? wy.benchY : MB_GROUND.h(xb, zb));
          var mx = 0.5 * (xa + xb), mz = 0.5 * (za + zb), my = 0.5 * (ya + yb);
          var pitch = -Math.asin(MB_GROUND.clamp((yb - ya) / Math.max(0.5, subL), -0.45, 0.45));
          var sp = new THREE.Group();
          sp.position.set(mx, my, mz);
          sp.rotation.order = 'YXZ';
          sp.rotation.y = yaw;
          sp.rotation.x = pitch;
          var skH = wy.cliffSwitchback ? 12.5 : 1.35;
          sp.add(mbBoxMesh('megabreccia', rw + 0.56, skH, subL + 0.38, 0, -skH * 0.5 + 0.02, 0, 0));
          sp.add(mbBoxMesh('paving', rw, 0.16, subL + 0.38, 0, 0.06, 0, 0));
          var kerbH = wy.cliffSwitchback ? 0.68 : 0.20;
          for (var ks = -1; ks <= 1; ks += 2) {
            sp.add(mbBoxMesh('ashlar', 0.34, kerbH, subL + 0.38, ks * (rw * 0.5 + 0.12), kerbH * 0.5 + 0.06, 0, 0));
          }
          roadGrp.add(sp);
        }
      }
    }
  }

  /* 1B. Crisp 3D Terrace Retaining Walls, Flat Overhang Decks (100% covering [-6.5..+2.5] grid bevels!) & Canyon Parapets */
  var stairClearXs = [-65.0, -263.0, -455.0];
  function nearW4Stair(x) {
    for (var sci = 0; sci < stairClearXs.length; sci++) {
      if (Math.abs(x - stairClearXs[sci]) < 13.8) return true;
    }
    return false;
  }
  /* W4 Sunny Amphitheatre: risers span [zFace .. zFace + 9.0]:
     W1(3125.2)->B1(3119.5) at zFace = +36.0; B1->B2(3114.0) at zFace = -6.0;
     B2->B3(3108.5) at zFace = -48.0; B3->B4(3103.0) at zFace = -90.0; Canyon Rim at zFace = -120.0! */
  var w4Walls = [
    { x0: -498, x1: -42, zFace: 36.2, yTop: 3125.25, hDrop: 5.95, canyonRim: false },
    { x0: -496, x1: -42, zFace: -5.8, yTop: 3119.55, hDrop: 5.75, canyonRim: false },
    { x0: -490, x1: -42, zFace: -47.8, yTop: 3114.05, hDrop: 5.75, canyonRim: false },
    { x0: -478, x1: -42, zFace: -89.8, yTop: 3108.55, hDrop: 5.75, canyonRim: false },
    { x0: -468, x1: -42, zFace: -119.8, yTop: 3103.05, hDrop: 9.0, canyonRim: true }
  ];
  for (var w4i = 0; w4i < w4Walls.length; w4i++) {
    var ww = w4Walls[w4i];
    var spanStep = 7.6;
    for (var wx = ww.x0; wx < ww.x1 - 0.5; wx += spanStep) {
      var wxEnd = Math.min(ww.x1, wx + spanStep);
      var wMid = 0.5 * (wx + wxEnd), wLen = wxEnd - wx;
      if (!ww.canyonRim) {
        var onStair = nearW4Stair(wMid);
        /* Horizontal 9.2 m terrace crown deck extending from zFace (+0.2) back to zFace + 9.2 so ZERO 42-deg terrain bevel shows! */
        if (!onStair) {
          roadGrp.add(mbBoxMesh('turf', wLen + 0.16, 0.30, 9.2, wMid, ww.yTop - 0.12, ww.zFace + 4.7, 0));
          roadGrp.add(mbBoxMesh('loess', wLen + 0.16, ww.hDrop, 8.8, wMid, ww.yTop - ww.hDrop * 0.5 - 0.15, ww.zFace + 4.7, 0));
          roadGrp.add(mbBoxMesh(w4i % 2 === 0 ? 'ashlar' : 'loess', wLen + 0.18, ww.hDrop + 0.10, 0.72, wMid, ww.yTop - ww.hDrop * 0.5 - 0.08, ww.zFace + 0.36, 0));
          roadGrp.add(mbBoxMesh('ashlar', wLen + 0.20, 0.34, 0.88, wMid, ww.yTop - 0.12, ww.zFace + 0.38, 0));
          if (Math.round((wx - ww.x0) / spanStep) % 2 === 0) {
            roadGrp.add(mbBoxMesh('columnar', 0.92, ww.hDrop + 0.22, 1.02, wxEnd - 0.46, ww.yTop - ww.hDrop * 0.5, ww.zFace + 0.42, 0));
          }
          roadGrp.add(mbBoxMesh('basalt', wLen + 0.16, 0.84, 0.44, wMid, ww.yTop + 0.42, ww.zFace + 0.36, 0));
          roadGrp.add(mbBoxMesh('ashlar', wLen + 0.20, 0.14, 0.56, wMid, ww.yTop + 0.90, ww.zFace + 0.36, 0));
        } else {
          /* Recessed masonry stair-well rear wall + paved lower landing apron so zero sloped terrain shows around stairs! */
          roadGrp.add(mbBoxMesh('paving', wLen + 0.25, 0.26, 9.4, wMid, ww.yTop - ww.hDrop + 0.14, ww.zFace + 4.5, 0));
          roadGrp.add(mbBoxMesh('turf', wLen + 0.20, 0.28, 3.2, wMid, ww.yTop - 0.12, ww.zFace + 7.8, 0));
          roadGrp.add(mbBoxMesh('ashlar', wLen + 0.22, ww.hDrop + 0.12, 3.2, wMid, ww.yTop - ww.hDrop * 0.5 - 0.10, ww.zFace + 7.7, 0));
        }
      } else {
        roadGrp.add(mbBoxMesh('paving', wLen + 0.16, 0.30, 5.4, wMid, ww.yTop - 0.12, ww.zFace + 2.7, 0));
        roadGrp.add(mbBoxMesh('megabreccia', wLen + 0.16, ww.hDrop, 3.6, wMid, ww.yTop - ww.hDrop * 0.5, ww.zFace + 1.8, 0));
        roadGrp.add(mbBoxMesh('basalt', wLen + 0.16, 1.04, 0.52, wMid, ww.yTop + 0.52, ww.zFace + 0.28, 0));
        roadGrp.add(mbBoxMesh('ashlar', wLen + 0.20, 0.16, 0.66, wMid, ww.yTop + 1.12, ww.zFace + 0.28, 0));
      }
    }
  }

  /* H1 North Yuan: 6 Dead-Level Agricultural Terraces separated by 2.0 m dry-stone basalt field retaining walls! */
  for (var hti = 0; hti < MB_GROUND.H1_TERRACES.length; hti++) {
    var htr = MB_GROUND.H1_TERRACES[hti];
    var zFront = htr.z1;
    var hStep = 22.0;
    for (var hx = htr.x0 + 2.0; hx < htr.x1 - 2.0; hx += hStep) {
      var hxEnd = Math.min(htr.x1 - 2.0, hx + hStep);
      var hMid = 0.5 * (hx + hxEnd), hLen = hxEnd - hx;
      if (hMid > -50.0) continue;
      if (plan.roadMask && (plan.roadMask.roadAt(hMid, zFront) > 0.08 || plan.roadMask.roadAt(hMid, zFront + 3.0) > 0.08)) continue;
      /* Horizontal 8.2 m turf/earth terrace lip overlapping 2.4 m onto terrace tread + 2.25 m dry-stone basalt retaining wall */
      roadGrp.add(mbBoxMesh('turf', hLen + 0.15, 0.26, 8.2, hMid, htr.y - 0.11, zFront + 1.5, 0));
      roadGrp.add(mbBoxMesh('earth', hLen + 0.15, 2.15, 7.8, hMid, htr.y - 1.20, zFront + 1.5, 0));
      roadGrp.add(mbBoxMesh('basalt', hLen + 0.18, 2.35, 0.58, hMid, htr.y - 1.05, zFront + 5.55, 0));
      roadGrp.add(mbBoxMesh('ashlar', hLen + 0.22, 0.16, 0.72, hMid, htr.y + 0.18, zFront + 5.55, 0));
    }
  }

  /* W2 Siru-Spring Stepped Sanctuary Retaining Walls (+3125 -> +3120.5 -> +3115.5 -> +3110.0 m; risers at z = +24, -18, -60) */
  var siruSteps = [
    { x0: 258, x1: 424, zFace: 24.2, yTop: 3125.6, h: 5.3 },
    { x0: 258, x1: 430, zFace: -17.8, yTop: 3120.5, h: 5.2 },
    { x0: 258, x1: 436, zFace: -59.8, yTop: 3115.5, h: 5.7 }
  ];
  for (var ssi = 0; ssi < siruSteps.length; ssi++) {
    var ss = siruSteps[ssi];
    for (var sx2 = ss.x0; sx2 < ss.x1 - 1.0; sx2 += 16.0) {
      var sxEnd = Math.min(ss.x1, sx2 + 16.0), sMid = 0.5 * (sx2 + sxEnd), sLen = sxEnd - sx2;
      if (sMid >= 262.0 && sMid <= 304.0) continue;
      roadGrp.add(mbBoxMesh('turf', sLen + 0.15, 0.30, 8.4, sMid, ss.yTop - 0.14, ss.zFace + 4.2, 0));
      roadGrp.add(mbBoxMesh('loess', sLen + 0.15, ss.h, 8.0, sMid, ss.yTop - ss.h * 0.5 - 0.12, ss.zFace + 4.2, 0));
      roadGrp.add(mbBoxMesh('ashlar', sLen + 0.18, ss.h + 0.1, 0.68, sMid, ss.yTop - ss.h * 0.5, ss.zFace + 0.25, 0));
      roadGrp.add(mbBoxMesh('basalt', sLen + 0.18, 0.76, 0.44, sMid, ss.yTop + 0.38, ss.zFace + 0.25, 0));
    }
  }

  /* W1 -> W6 Stepped Freight Plaza Retaining Walls (x = 260, 393, 521 across z in [98..466]) */
  var eastPlazaSteps = [
    { x: 260.0, z0: 98, z1: 466, yTop: 3126.2, h: 5.0 },
    { x: 393.0, z0: 98, z1: 466, yTop: 3121.4, h: 4.8 },
    { x: 521.0, z0: 98, z1: 466, yTop: 3116.8, h: 5.0 }
  ];
  for (var epi = 0; epi < eastPlazaSteps.length; epi++) {
    var ep = eastPlazaSteps[epi];
    for (var ez2 = ep.z0; ez2 < ep.z1 - 1.0; ez2 += 22.0) {
      var ezEnd = Math.min(ep.z1, ez2 + 22.0), eMid = 0.5 * (ez2 + ezEnd), eLen = ezEnd - ez2;
      if (Math.abs(eMid - 145) < 12 || Math.abs(eMid - 260) < 15 || Math.abs(eMid - 385) < 12) continue;
      roadGrp.add(mbBoxMesh('paving', 5.2, 0.28, eLen + 0.15, ep.x - 2.4, ep.yTop - 0.12, eMid, 0));
      roadGrp.add(mbBoxMesh('ashlar', 0.68, ep.h, eLen + 0.18, ep.x + 0.2, ep.yTop - ep.h * 0.5, eMid, 0));
      roadGrp.add(mbBoxMesh('columnar', 0.44, 0.82, eLen + 0.18, ep.x - 0.1, ep.yTop + 0.41, eMid, 0));
    }
  }

  mbRegisterWorldGroup(world, roadGrp, 'infrastructure', 'roadway', 'mb_terrace_causeways',
    'Stone-Kerbed Terrace Causeways, Stepped Stairs & Retaining Walls', 0, 0, 0, 0, 1800, 1800, 320, 'hayrant', ['infrastructure']);

  /* 2. Walled Kitchen Gardens, Domestic/Artisan Yards & Highland Livestock Pens filling urban block pockets */
  var encs = plan.enclosures || [];
  if (!encs.length) return;
  var encGrp = new THREE.Group();
  for (var ei = 0; ei < encs.length; ei++) {
    var E = encs[ei];
    var eg = new THREE.Group();
    eg.position.set(E.x, E.y, E.z);
    eg.rotation.y = E.ry;
    var hw = E.w * 0.5, hd = E.d * 0.5;
    /* Grounding foundation plinth so enclosure floors never float on gently sloped blocks */
    eg.add(mbBoxMesh('loess', E.w, 1.35, E.d, 0, -0.68, 0, 0));

    if (E.kind === 'garden') {
      /* Low basalt/loess dry-stone garden walls + 2 raised dark-earth planting beds + fur-larch cold-frame */
      var gWh = 0.96, gateW = 2.2, sideW = Math.max(1.2, (E.w - gateW) * 0.5);
      eg.add(mbBoxMesh('basalt', E.w, gWh, 0.34, 0, gWh * 0.5, -hd + 0.17, 0));
      eg.add(mbBoxMesh('basalt', 0.34, gWh, E.d - 0.68, -hw + 0.17, gWh * 0.5, 0, 0));
      eg.add(mbBoxMesh('basalt', 0.34, gWh, E.d - 0.68, hw - 0.17, gWh * 0.5, 0, 0));
      eg.add(mbBoxMesh('basalt', sideW, gWh, 0.34, -hw + sideW * 0.5, gWh * 0.5, hd - 0.17, 0));
      eg.add(mbBoxMesh('basalt', sideW, gWh, 0.34, hw - sideW * 0.5, gWh * 0.5, hd - 0.17, 0));
      eg.add(mbBoxMesh('ashlar', 0.44, gWh + 0.24, 0.44, -gateW * 0.5 - 0.15, (gWh + 0.24) * 0.5, hd - 0.17, 0));
      eg.add(mbBoxMesh('ashlar', 0.44, gWh + 0.24, 0.44, gateW * 0.5 + 0.15, (gWh + 0.24) * 0.5, hd - 0.17, 0));
      eg.add(mbBoxMesh('turf', E.w - 0.8, 0.08, E.d - 0.8, 0, 0.04, 0, 0));
      var bedW = (E.w - 2.4) * 0.46, bedD = E.d - 2.4;
      eg.add(mbBoxMesh('earth', bedW, 0.22, bedD, -bedW * 0.56 - 0.25, 0.18, -0.2, 0));
      eg.add(mbBoxMesh('earth', bedW, 0.22, bedD, bedW * 0.56 + 0.25, 0.18, -0.2, 0));
      eg.add(mbBoxMesh('larch', 1.8, 0.62, 1.2, -hw + 1.4, 0.35, -hd + 1.2, 0));
    } else if (E.kind === 'yard') {
      /* Walled domestic & artisan courtyard: limewashed/loess walls with tile coping, flagstone floor, plaid drying rack & firewood */
      var yWh = 1.56, yWallMk = (E.seed & 1) ? 'loess' : 'lime';
      var yGate = 2.4, ySide = Math.max(1.2, (E.w - yGate) * 0.5);
      eg.add(mbBoxMesh(yWallMk, E.w, yWh, 0.36, 0, yWh * 0.5, -hd + 0.18, 0));
      eg.add(mbBoxMesh('tile', E.w + 0.12, 0.10, 0.48, 0, yWh + 0.05, -hd + 0.18, 0));
      eg.add(mbBoxMesh(yWallMk, 0.36, yWh, E.d - 0.72, -hw + 0.18, yWh * 0.5, 0, 0));
      eg.add(mbBoxMesh(yWallMk, 0.36, yWh, E.d - 0.72, hw - 0.18, yWh * 0.5, 0, 0));
      eg.add(mbBoxMesh(yWallMk, ySide, yWh, 0.36, -hw + ySide * 0.5, yWh * 0.5, hd - 0.18, 0));
      eg.add(mbBoxMesh(yWallMk, ySide, yWh, 0.36, hw - ySide * 0.5, yWh * 0.5, hd - 0.18, 0));
      eg.add(mbBoxMesh('larch', yGate + 0.7, 0.20, 0.44, 0, yWh + 0.10, hd - 0.18, 0));
      eg.add(mbBoxMesh('paving', E.w - 0.8, 0.10, E.d - 0.8, 0, 0.05, 0, 0));
      /* Fur-larch drying frame with madder-plaid or hemp cloth sheet + firewood cord + kaen storage jar */
      eg.add(mbBoxMesh('larch', 0.16, 2.05, 0.16, -1.8, 1.05, -0.6, 0));
      eg.add(mbBoxMesh('larch', 0.16, 2.05, 0.16, 1.8, 1.05, -0.6, 0));
      eg.add(mbBoxMesh('larch', 3.9, 0.12, 0.14, 0, 2.05, -0.6, 0));
      eg.add(mbBoxMesh((E.seed & 2) ? 'plaid' : 'hemp', 3.1, 1.15, 0.06, 0, 1.40, -0.6, 0));
      eg.add(mbBoxMesh('bark', 2.2, 0.85, 0.95, hw - 1.65, 0.48, -hd + 1.1, 0));
      eg.add(mbBoxMesh('kaen', 0.68, 0.82, 0.68, -hw + 1.35, 0.46, -hd + 1.1, 0));
    } else {
      /* Highland yak / sheep / caravan pack-mule pen: split larch post-and-rail corral, corner lean-to shed, trough & hay */
      eg.add(mbBoxMesh('earth', E.w - 0.4, 0.08, E.d - 0.4, 0, 0.04, 0, 0));
      for (var cx2 = -1; cx2 <= 1; cx2 += 2) {
        for (var cz2 = -1; cz2 <= 1; cz2 += 2) {
          eg.add(mbBoxMesh('megabreccia', 0.48, 1.28, 0.48, cx2 * (hw - 0.24), 0.64, cz2 * (hd - 0.24), 0));
        }
      }
      for (var ryRail = 0; ryRail < 2; ryRail++) {
        var railY = 0.48 + ryRail * 0.46;
        eg.add(mbBoxMesh('larch', E.w - 0.6, 0.11, 0.11, 0, railY, -hd + 0.24, 0));
        eg.add(mbBoxMesh('larch', 0.11, 0.11, E.d - 0.6, -hw + 0.24, railY, 0, 0));
        eg.add(mbBoxMesh('larch', 0.11, 0.11, E.d - 0.6, hw - 0.24, railY, 0, 0));
        var pSide = Math.max(1.2, (E.w - 2.8) * 0.5);
        eg.add(mbBoxMesh('larch', pSide, 0.11, 0.11, -hw + pSide * 0.5 + 0.2, railY, hd - 0.24, 0));
        eg.add(mbBoxMesh('larch', pSide, 0.11, 0.11, hw - pSide * 0.5 - 0.2, railY, hd - 0.24, 0));
      }
      /* Corner bark-roofed animal shelter shed + stone water trough + reed hay-rack */
      var shW = Math.min(4.6, E.w * 0.42), shD = Math.min(3.4, E.d * 0.36);
      eg.add(mbBoxMesh('basalt', shW, 1.85, 0.32, -hw + shW * 0.5 + 0.35, 0.94, -hd + 0.42, 0));
      eg.add(mbBoxMesh('larch', 0.20, 1.65, 0.20, -hw + shW + 0.15, 0.84, -hd + shD, 0));
      eg.add(mbBoxMesh('larch', 0.20, 1.65, 0.20, -hw + 0.45, 0.84, -hd + shD, 0));
      eg.add(mbBoxMesh('bark', shW + 0.45, 0.16, shD + 0.55, -hw + shW * 0.5 + 0.35, 1.82, -hd + shD * 0.5 + 0.25, 0));
      eg.add(mbBoxMesh('ashlar', 2.2, 0.52, 0.78, hw - 1.8, 0.30, -hd + 1.2, 0));
      eg.add(mbBoxMesh('reed', 1.6, 0.92, 1.2, hw - 1.7, 0.50, 0.8, 0.2));
    }
    encGrp.add(eg);
  }
  mbRegisterWorldGroup(world, encGrp, 'feature', 'enclosures', 'mb_ward_enclosures',
    'Mirabilis Walled Gardens, Courtyards & Livestock Pens', 0, 0, 0, 0, 1600, 1600, 8, 'hayrant', ['farm', 'dwelling-single']);
}

/* Wire single-component KWALK graph across Moon-Bridge, Weir Bridge, hillside stairs, and all 6 wards */
function mbRegisterWalk(plan) {
  if (typeof KWALK === 'undefined') return;
  var nodes = plan.walk.nodes, edges = plan.walk.edges;
  for (var i = 0; i < nodes.length; i++) {
    var nd = nodes[i];
    KWALK.floor({ rect: [nd.x - 1.4, nd.x + 1.4, nd.z - 1.4, nd.z + 1.4], y: nd.y, name: nd.id, tag: 'walk:node' });
  }
  for (var j = 0; j < edges.length; j++) {
    var ed = edges[j], a = nodes[ed.a], b = nodes[ed.b];
    KWALK.strip({ a: [a.x, a.z, a.y], b: [b.x, b.z, b.y], w: Math.max(3.6, ed.w * 0.75), name: ed.id + '.' + j, tag: 'street:' + ed.cls });
  }
}

/* Bind Western Outer Wall flora (biomes/wouterwall + nwouterwall) & H1 contoured terrace crops (WOW.buildCrops) */
function mbBuildFloraAndCrops(world, plan) {
  if (typeof MB_FLORA === 'undefined' || qs.get('flora') === '0') return;
  var BIO = MB_FLORA.BIO, WOW = MB_FLORA.WOW, NWOW = MB_FLORA.NWOW;
  var obs = [];
  for (var i = 0; i < plan.lots.length; i++) {
    var lt = plan.lots[i];
    obs.push({ x: lt.x, z: lt.z, r: Math.hypot(lt.w, lt.d) * 0.56 + 4.5 });
  }
  /* Keep 22 m clear around every camera eye so open-eyes check stays ~0% */
  for (var vk in MB_VIEWS) {
    var vv = MB_VIEWS[vk];
    obs.push({ x: vv[0], z: vv[2], r: 24.0 });
  }

  BIO.host.scene = world;
  BIO.host.terrainH = terrainH;
  BIO.host.waterH = function (x, z) { return MB_GROUND.riverWaterY(x) - 2.0; };
  BIO.host.obstacles = obs;
  BIO.host.mask = function (x, z) {
    /* Exclude walled urban core W1/W3/W6, road raster, Siru pools, C1 camp, and canyon river channel */
    if (x > -645 && x < 265 && z > 52 && z < 540) return 0;
    if (x > 515 && x < 745 && z > 88 && z < 475) return 0;
    if (x > -855 && x < -665 && z > 195 && z < 355) return 0;
    if (MB_GROUND.inCanyonVoid(x, z, 2.5)) return 0;
    if (plan.roadMask && plan.roadMask.roadAt(x, z) > 0.1) return 0;
    for (var vi = 0; vi < obs.length; vi++) {
      var o = obs[vi];
      if ((x - o.x) * (x - o.x) + (z - o.z) * (z - o.z) < o.r * o.r) return 0;
    }
    return 1;
  };

  var fFn = function (x, z) { return MB_GROUND.fieldsAt(x, z); };
  BIO.host.fields = {
    wet: function (x, z) { var f = fFn(x, z); return MB_GROUND.clamp(0.75 - f.streamD * 0.004 + f.spring * 0.35, 0.18, 0.92); },
    flow: function (x, z) { return fFn(x, z).streamD < 36 ? 0.65 : 0.1; },
    cold: function (x, z) { return MB_GROUND.clamp((3220 - fFn(x, z).y) * -0.002 + 0.35, 0.15, 0.75); },
    rock: function (x, z) { return fFn(x, z).rock; },
    upland: function () { return 0.72; },
    slope: function (x, z) { return fFn(x, z).slope; },
    sunny: function (x, z) { return fFn(x, z).sunny; },
    mean: function (x, z) { return fFn(x, z).mean; },
    loess: function (x, z) { return fFn(x, z).loess; },
    cut: function (x, z) { return fFn(x, z).cut; },
    spring: function (x, z) { return fFn(x, z).spring; }
  };

  WOW.AMP = { warm: 13, cold: 13 };
  WOW.lay({ fields: fFn, R: 1120, seed: 350726 });
  WOW.zoneAt = function (x, z) { return WOW.zoneOf(fFn(x, z)); };
  NWOW.AMP = WOW.AMP;
  NWOW.lay({ fields: fFn, R: 1120, seed: 350726 });
  NWOW.zoneAt = function (x, z) { return WOW.nwZone(WOW.zoneAt(x, z)); };
  NWOW.larchK = 1.15;
  NWOW.IMPOSTORS = false;

  var st = WOW.build({ R: 840, quality: 0.08 });
  var cropSt = WOW.buildCrops({
    fields: function (emit) {
      for (var ti = 0; ti < MB_GROUND.H1_TERRACES.length; ti++) {
        var tr = MB_GROUND.H1_TERRACES[ti];
        for (var tx = tr.x0 + 8; tx <= tr.x1 - 8; tx += 10.0) {
          for (var tz = tr.z0 + 6; tz <= tr.z1 - 6; tz += 9.0) {
            if (plan.roadMask && plan.roadMask.roadAt(tx, tz) > 0.1) continue;
            emit(tx, MB_GROUND.h(tx, tz), tz, tr.crop);
          }
        }
      }
      /* Plant highland madder, millet, buckwheat, wallhemp & garlic rows inside urban walled kitchen gardens */
      var encs = plan.enclosures || [];
      for (var ei = 0; ei < encs.length; ei++) {
        var ge = encs[ei];
        if (ge.kind !== 'garden') continue;
        var cs = Math.cos(ge.ry), sn = Math.sin(ge.ry);
        for (var lx = -ge.w * 0.30; lx <= ge.w * 0.30; lx += 6.2) {
          for (var lz = -ge.d * 0.28; lz <= ge.d * 0.25; lz += 6.2) {
            var wx = ge.x + lx * cs + lz * sn;
            var wz = ge.z - lx * sn + lz * cs;
            emit(wx, ge.y + 0.28, wz, ge.crop);
          }
        }
      }
    }
  });
  var bk = BIO.bake();
  MB_FLORA_STATS = { build: st, crops: cropSt, inst: bk.inst, calls: bk.calls };
}

/* Instanced Hayrant (madder-plaid), Eternian (celadon-robed), and Kuran (fur-and-jade) citizens along KWALK edges */
function mbBuildCitizens(world, plan) {
  var C = MB_CITIZENS;
  if (C.mesh) {
    if (C.mesh.parent) C.mesh.parent.remove(C.mesh);
    if (C.head.parent) C.head.parent.remove(C.head);
    C.mesh = null; C.head = null;
  }
  C.actors = [];
  var edges = plan.walk.edges, nodes = plan.walk.nodes;
  if (!edges.length) return;

  var bodyGeo = new THREE.CylinderGeometry(0.19, 0.25, 1.36, 7);
  bodyGeo.translate(0, 0.68, 0);
  var headGeo = new THREE.SphereGeometry(0.16, 8, 6);
  headGeo.translate(0, 1.52, 0);
  C.mesh = new THREE.InstancedMesh(bodyGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }), C.cap);
  C.head = new THREE.InstancedMesh(headGeo, new THREE.MeshLambertMaterial({ color: 0xd4ad8c }), C.cap);
  C.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(C.cap * 3).fill(1), 3);
  C.mesh.frustumCulled = false; C.head.frustumCulled = false;
  C.mesh.name = 'citizens:body'; C.head.name = 'citizens:head';

  var col = new THREE.Color();
  var palette = [0x9e362b, 0x2c4b6e, 0x3b6e5c, 0xc99c3e, 0x6e5a44, 0x295e52];
  for (var i = 0; i < C.cap; i++) {
    var h = KRAND.hash(plan.seed, 0xC171, i, 7);
    var eIdx = h % edges.length;
    var ed = edges[eIdx];
    var speed = 0.85 + ((h >>> 8) % 55) * 0.01;
    var phase = ((h >>> 14) % 1000) * 0.001;
    var dir = (h & 1) ? 1 : -1;
    C.actors.push({ a: nodes[ed.a], b: nodes[ed.b], speed: speed, phase: phase, dir: dir });
    col.setHex(palette[i % palette.length]);
    C.mesh.setColorAt(i, col);
  }
  C.mesh.count = C.cap;
  C.head.count = C.cap;
  C.mesh.instanceColor.needsUpdate = true;
  world.add(C.mesh);
  world.add(C.head);
  mbStepDynamics(MB_SIM_T);
}

/* Step hoist counterweight cars, gorge waterwheels & citizen walkers at time t */
function mbStepDynamics(t) {
  var hs = MB_HYD.hoistState(t);
  var cs = MB_HYD.clockState(t);
  if (MB_HOIST_NODES.carA && MB_HOIST_NODES.carB) {
    MB_HOIST_NODES.carA.position.set(hs.carA.x, hs.carA.y, hs.carA.z);
    MB_HOIST_NODES.carA.rotation.z = -hs.pitch;
    MB_HOIST_NODES.carB.position.set(hs.carB.x, hs.carB.y, hs.carB.z);
    MB_HOIST_NODES.carB.rotation.z = -hs.pitch;
  }
  for (var wi = 0; wi < MB_WHEEL_NODES.length; wi++) {
    MB_WHEEL_NODES[wi].rotation.z = cs.millWheelPitch + wi * 0.8;
  }
  var C = MB_CITIZENS;
  if (C.mesh && C.actors.length) {
    var M = new THREE.Matrix4(), P = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3(1, 1, 1), Y = new THREE.Vector3(0, 1, 0);
    for (var i = 0; i < C.actors.length; i++) {
      var ac = C.actors[i];
      var len = Math.max(1.0, Math.hypot(ac.b.x - ac.a.x, ac.b.z - ac.a.z));
      var cyc = (ac.phase + (t * ac.speed) / (len * 2.0)) % 1.0;
      var u = cyc < 0.5 ? cyc * 2.0 : 2.0 - cyc * 2.0;
      var x = MB_GROUND.lerp(ac.a.x, ac.b.x, u);
      var z = MB_GROUND.lerp(ac.a.z, ac.b.z, u);
      var y = (Math.abs(x) < 8 && z >= -246 && z <= -140) ? MB_GROUND.MOON_BRIDGE.deckY : MB_GROUND.lerp(ac.a.y, ac.b.y, u);
      var yaw = Math.atan2(ac.b.x - ac.a.x, ac.b.z - ac.a.z) + (cyc < 0.5 ? 0 : Math.PI);
      P.set(x, y, z);
      Q.setFromAxisAngle(Y, yaw);
      M.compose(P, Q, S);
      C.mesh.setMatrixAt(i, M);
      C.head.setMatrixAt(i, M);
    }
    C.mesh.instanceMatrix.needsUpdate = true;
    C.head.instanceMatrix.needsUpdate = true;
  }
}

/* Lossless PBR hardware-instancing of repeat street-frontage infill lots directly from flushBuckets(GB):
   every single repeat building keeps 100% of its beams, shingles, and real MAT[mk] PBR normal/albedo maps! */
var MB_INSTANCED_GROUPS = [];
function mbBuildInstancedInfill(world, infillLots) {
  MB_INSTANCED_GROUPS.length = 0;
  if (!infillLots.length) return;

  var buckets = {};
  for (var i = 0; i < infillLots.length; i++) {
    var lt = infillLots[i];
    var bKey = lt.rawKey;
    if (!buckets[bKey]) buckets[bKey] = { rawKey: lt.rawKey, lots: [] };
    buckets[bKey].lots.push(lt);

    /* Register every instanced infill lot in SVTAGS and REG so census & tag audits cover 100% of the town */
    var def = DEFS[lt.rawKey];
    var tid = null;
    if (SVTAGS && def) {
      var rawTypes = (def.tags && Array.isArray(def.tags.types) && def.tags.types.length) ? def.tags.types : ['dwelling-single'];
      tid = SVTAGS.add({
        'class': 'building',
        kind: def.kind || 'dwelling',
        key: lt.rawKey,
        name: (def.name || lt.rawKey) + ' (' + lt.id + ')',
        at: [lt.x, lt.padY, lt.z],
        ry: lt.ry,
        size: [lt.w, lt.d, lt.h],
        tags: { culture: lt.kit === 'eternian' ? 'eternian' : 'hayrant', types: rawTypes },
        frag: lt.kit === 'eternian' ? 'kits/eternian' : 'kits/hayrant'
      }).id;
    }
    REG.push({
      key: lt.rawKey, name: lt.id, cls: 'building',
      x: lt.x, y: lt.padY, z: lt.z, ry: lt.ry, tid: tid,
      decl: { w: lt.w, d: lt.d, h: lt.h, budget: 32000 },
      bbox: {
        mn: [lt.x - lt.w * 0.5, lt.padY, lt.z - lt.d * 0.5],
        mx: [lt.x + lt.w * 0.5, lt.padY + lt.h, lt.z + lt.d * 0.5]
      },
      tris: 0, front: { x: 0, z: lt.d * 0.5, yaw: 0 },
      doorCount: 0, furniture: [], children: []
    });
  }

  var M = new THREE.Matrix4(), P = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3(1, 1, 1), Y = new THREE.Vector3(0, 1, 0);
  var infillRoot = new THREE.Group();
  infillRoot.name = 'mirabilis:instanced-infill';

  var bKeys = Object.keys(buckets).sort();
  var SHELL_MATS = {
    megabreccia: 1, basalt: 1, columnar: 1, ashlar: 1, corbel: 1, loess: 1, silt: 1,
    lime: 1, brick: 1, block: 1, blockB: 1, blockC: 1, stone: 1, paving: 1,
    tile: 1, celadon: 1, kaen: 1, terracotta: 1, larch: 1, timber: 1, shutter: 1,
    tarwood: 1, bark: 1, turf: 1, whalebone: 1, plaid: 1, hemp: 1, hide: 1, pelt: 1,
    nephrite: 1, jade: 1, alabaster: 1
  };
  function mbTrimInfillGeo(pg, mk, rawKey) {
    var idx = pg.index, pos = pg.attributes.position;
    if (!idx || !pos) return pg;
    var minCrossSq = rawKey === 'hy_hearth_tavern' ? 0.0004 : (SHELL_MATS[mk] ? 0.022 : 0.08);
    var src = idx.array, n = idx.count, kept = [];
    for (var i = 0; i < n; i += 3) {
      var a = src[i], b = src[i + 1], c = src[i + 2];
      var ax = pos.getX(a), ay = pos.getY(a), az = pos.getZ(a);
      var ux = pos.getX(b) - ax, uy = pos.getY(b) - ay, uz = pos.getZ(b) - az;
      var vx = pos.getX(c) - ax, vy = pos.getY(c) - ay, vz = pos.getZ(c) - az;
      var cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
      if (cx * cx + cy * cy + cz * cz >= minCrossSq) {
        kept.push(a, b, c);
      }
    }
    if (!kept.length) return null;
    if (kept.length < n) {
      var arr = pos.count > 65535 ? new Uint32Array(kept) : new Uint16Array(kept);
      pg.setIndex(new THREE.BufferAttribute(arr, 1));
    }
    return pg;
  }

  for (var bi = 0; bi < bKeys.length; bi++) {
    var B = buckets[bKeys[bi]];
    if (!DEFS[B.rawKey]) continue;
    var pGrp = new THREE.Group();
    var prevGB = GB, prevTarget = GTARGET, prevDry = PLACE_DRY;
    GB = {}; GTARGET = GB; PLACE_DRY = 1;
    try {
      place(B.rawKey, 0, 0, 0, { y: 0, v: 0 });
      flushBuckets(GB, pGrp, false);
    } finally {
      GB = prevGB; GTARGET = prevTarget; PLACE_DRY = prevDry;
    }
    var partMeshes = [];
    pGrp.traverse(function (m) {
      if (!m.isMesh || !m.geometry || !m.geometry.attributes.position) return;
      var mk = m.userData && m.userData.mk;
      if (mk === 'water' || mk === 'puya' || mk === 'planks' || mk === 'rope' || mk === 'room' || mk === 'glow') return;
      partMeshes.push(m);
    });
    for (var mi = 0; mi < partMeshes.length; mi++) {
      var pm = partMeshes[mi];
      var pmk = (pm.userData && pm.userData.mk) || '';
      var pg = mbTrimInfillGeo(pm.geometry, pmk, B.rawKey);
      if (!pg) continue;
      /* Disable origin-anchored uCut discard on instanced meshes (SITES hero pieces keep full uCut) */
      if (pg.attributes.aCut) {
        var acArr = pg.attributes.aCut.array;
        for (var ci = 3; ci < acArr.length; ci += 4) acArr[ci] = 0;
        pg.attributes.aCut.needsUpdate = true;
      }
      pg.computeBoundingSphere();
      var im = new THREE.InstancedMesh(pg, pm.material, B.lots.length);
      for (var li = 0; li < B.lots.length; li++) {
        var L = B.lots[li];
        P.set(L.x, L.padY, L.z);
        Q.setFromAxisAngle(Y, L.ry);
        M.compose(P, Q, S);
        im.setMatrixAt(li, M);
      }
      im.instanceMatrix.needsUpdate = true;
      im.castShadow = false;
      im.receiveShadow = pm.receiveShadow;
      im.frustumCulled = false;
      im.name = 'infill:' + B.rawKey + ':' + (pmk || mi);
      infillRoot.add(im);
      MB_INSTANCED_GROUPS.push(im);
    }
  }
  world.add(infillRoot);
}

/* Populate SITES and wrap buildWorld so Mirabilis builds cleanly through core/engine */
{
  var _mbBaseBuildWorld = buildWorld;
  buildWorld = function () {
    if (typeof KWALK !== 'undefined') KWALK.clear();
    MB_PLAN = MB_CITY.make({
      seed: 350726,
      dims: function (k) {
        var d = DEFS[k];
        return d ? { w: d.w, d: d.d, h: d.h } : null;
      }
    });

    SITES.length = 0;
    var infillLots = [];
    var seenHeroKey = {};
    /* Keep all 10 mixed-avenue cornice pairs and the first instance of every unique Hayrant & Eternian key
       in full-detail SITES (furnished interiors, operable doors, --cut roofs); PBR-instance repeat infill lots! */
    for (var li = 0; li < MB_PLAN.lots.length; li++) {
      var lt = MB_PLAN.lots[li];
      if (lt.constructing != null || !DEFS[lt.rawKey]) continue;
      var isHero = lt.avenuePair != null || !seenHeroKey[lt.rawKey];
      if (isHero) {
        seenHeroKey[lt.rawKey] = true;
        SITES.push({
          key: lt.rawKey,
          x: lt.x,
          z: lt.z,
          ry: lt.ry,
          o: { y: lt.padY, v: lt.v == null ? 0 : lt.v, name: lt.id }
        });
      } else {
        infillLots.push(lt);
      }
    }
    /* Push geological RES_ORE nodes (iron, gold, silver, tin, saltpeter) */
    for (var oi = 0; oi < MB_PLAN.oreNodes.length; oi++) {
      var nd = MB_PLAN.oreNodes[oi];
      if (!DEFS[nd.key]) continue;
      SITES.push({
        key: nd.key,
        x: nd.x,
        z: nd.z,
        ry: oi * 0.9,
        o: { y: nd.y, v: oi % 2, name: nd.id }
      });
    }

    var w = _mbBaseBuildWorld.apply(this, arguments);
    var world = w || WORLD;

    /* Strip static kit-sheet box('water') meshes so 100% of visible water is real core/water */
    var staleWater = [];
    world.traverse(function (m) {
      if (m.isMesh && m.userData && m.userData.mk === 'water') staleWater.push(m);
    });
    for (var sw = 0; sw < staleWater.length; sw++) {
      if (staleWater[sw].parent) staleWater[sw].parent.remove(staleWater[sw]);
      if (staleWater[sw].geometry) staleWater[sw].geometry.dispose();
    }

    mbBuildInstancedInfill(world, infillLots);
    mbBuildTerrain(world);
    mbBuildWater(world);
    mbBuildInfrastructure(world, MB_PLAN);
    mbBuildConstructionAndCamp(world, MB_PLAN);
    mbBuildCausewaysAndEnclosures(world, MB_PLAN);
    mbRegisterWalk(MB_PLAN);
    mbBuildFloraAndCrops(world, MB_PLAN);
    mbBuildCitizens(world, MB_PLAN);
    mbStepDynamics(MB_SIM_T);

    if (typeof EXPORT !== 'undefined' && EXPORT.section) {
      EXPORT.section('city', function () {
        return {
          settlement: 'Mirabilis',
          pin: [350, 726],
          census: MB_PLAN.census,
          sim: MB_HYD.SIM_LEDGER,
          roadMask: KMASK.export(MB_PLAN.roadMask.canvas)
        };
      });
    }
    if (typeof nightRebuild === 'function') nightRebuild();
    return world;
  };
}

FRAME_HOOKS.push(function (dt) {
  if (MB_SIM_PIN === null) {
    MB_SIM_T = (MB_SIM_T + Math.min(0.1, dt == null ? 0.016 : dt)) % 1600.0;
  }
  mbStepDynamics(MB_SIM_T);
});
