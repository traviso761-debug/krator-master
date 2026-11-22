/* ==================== kits/lizardmen/settle 90w: a Lizardmen village's world: the ground, the water, the plinths, the views ([draw]) ==================== */
/* Gila's world (settlements/gila/src/90g-gl-world.js) made general for the towns after it (core/simulation/PLAN-LIZARDMEN.md
   step 7). Runs after 90-scene.js and before 91f-furnish.js and 92-world.js, on LZV_SITE (82-lzv-site.js):
   - the near ground drawn from LZV_SITE.nearH as a PlaneGeometry vertex for vertex the KDRAWN grid, shaded by KGROUND's four
     layers from the town's own pack (its materials.json slots `LZV_SPEC.layers`: base, shore, till, yard) with relief; the far
     ground coarse, coloured by height and slope;
   - the water on core/water: the town's lake or sea (`LZV_SPEC.lake`: WATER.open over its baked bed), every brick well, tank and
     salt pan (WATER.still), drawn together on WATER.stillMaterial;
   - SITES from LZV_SITE.sites, the plinths and front-door steps drawn and registered (core/tags, core/walk) inside buildWorld;
   - the views (no apostrophe and no colon in a name: item 30), from the spec's or a default set. */
(function () {
  var G = LZV_SITE, S = G.spec, N = G.near, F = G.far, LOOK = S.look || {}, LY = S.layers || {};
  camera.near = 0.4; camera.far = 75000; camera.updateProjectionMatrix();
  skyCam.far = 75000; skyCam.updateProjectionMatrix();
  SKY.hour = LOOK.hour == null ? 9.6 : LOOK.hour; SKY.dens = LOOK.dens == null ? 1.9 : LOOK.dens; skyApply();
  scene.fog.density = LOOK.fog == null ? 0.000042 : LOOK.fog;
  { var sc = sun.shadow.camera; sc.left = -220; sc.right = 220; sc.top = 220; sc.bottom = -220; sc.near = 10; sc.far = 1200; sc.updateProjectionMatrix(); }
  scene.remove(groundM); if (groundM.geometry) groundM.geometry.dispose();
  var lin = function (h) { return new THREE.Color(h).convertSRGBToLinear(); };

  /* the near ground */
  var nearMesh = (function () {
    var geo = new THREE.PlaneGeometry(N.x1 - N.x0, N.z1 - N.z0, N.nx - 1, N.nz - 1), pos = geo.attributes.position, count = pos.count;
    var col = new Float32Array(count * 3), zones = new Float32Array(count * 4), cx = (N.x0 + N.x1) / 2, cz = (N.z0 + N.z1) / 2;
    var cBase = lin(LOOK.base || 0x6e6844), cShore = lin(LOOK.shore || 0xd8d4c8), cTill = lin(LOOK.till || 0x5c4632), cYard = lin(LOOK.yard || 0x786848), cBed = lin(LOOK.bed || 0x464e44);
    var tmp = new THREE.Color(), i, ix, iz, x, z, y, zw;
    for (i = 0; i < count; i++) {
      ix = i % N.nx; iz = (i / N.nx) | 0; x = N.x0 + ix * N.step; z = N.z0 + iz * N.step; y = G.nearH[iz * N.nx + ix];
      pos.setXYZ(i, x - cx, -z + cz, y); zw = G.zoneAt(x, z);
      zones[i * 4] = zw[0]; zones[i * 4 + 1] = zw[1]; zones[i * 4 + 2] = zw[2]; zones[i * 4 + 3] = zw[3];
      tmp.copy(y < G.lakeY - 0.5 ? cBed : cBase);
      if (zw[1] > 0) tmp.lerp(cTill, zw[1] * 0.72); if (zw[2] > 0) tmp.lerp(cYard, zw[2] * 0.45); if (zw[0] > 0 && y >= G.lakeY - 0.5) tmp.lerp(cShore, zw[0] * 0.85);
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setAttribute('aLzZone', new THREE.BufferAttribute(zones, 4)); geo.computeVertexNormals();
    var mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    KHOOK.add(mat, 'lzv-zones', function (sh) {
      sh.vertexShader = 'attribute vec4 aLzZone;\nvarying vec4 vLzZone;\n' + KHOOK.rep(sh.vertexShader, '#include <begin_vertex>', '#include <begin_vertex>\nvLzZone=aLzZone;', 'lzv-zones');
      sh.fragmentShader = 'varying vec4 vLzZone;\n' + KHOOK.rep(sh.fragmentShader, '#include <color_fragment>', '#include <color_fragment>\n/*KGROUND*/\ndiffuseColor.rgb*=mix(1.0,0.72,vLzZone.w);', 'lzv-zones');
    }, { key: 'lzv-zones' });
    if (typeof KGROUND !== 'undefined') KGROUND.hook(mat, { key: 'lzv-near-' + S.key, at: '/*KGROUND*/', relief: { bump: 0.05, cavity: 0.55, mesh: 0.45, lambert: 1 }, tri: true,
      layers: [KGROUND.layer(S.key, LY.base || 'gBase', { w: '1.0', amt: 0.88, gain: 1.08, tint: 'diffuseColor.rgb*1.55', name: 'ground' }),
        KGROUND.layer(S.key, LY.till || 'gTill', { w: 'vLzZone.y', amt: 0.92, gain: 1.0, tint: 'diffuseColor.rgb*1.35', name: 'tilled field' }),
        KGROUND.layer(S.key, LY.yard || 'gYard', { w: 'vLzZone.z', amt: 0.9, gain: 1.05, name: 'beaten yard' }),
        KGROUND.layer(S.key, LY.shore || 'gShore', { w: 'vLzZone.x', amt: 0.92, gain: 1.0, tint: 'diffuseColor.rgb*1.3', name: 'shore' })] });
    var m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(cx, 0, cz); m.receiveShadow = true;
    m.userData.isGround = true; m.userData.ground = true; m.userData.probeSkip = true; m.userData.inspectLabel = LOOK.label || S.name; m.name = 'terrain-near';
    if (typeof KGROUND !== 'undefined' && KGROUND.cavityMesh) KGROUND.cavityMesh(m);
    scene.add(m); return m;
  })();
  /* the far ground */
  var farMesh = (function () {
    var geo = new THREE.PlaneGeometry(F.x1 - F.x0, F.z1 - F.z0, F.nx - 1, F.nz - 1), pos = geo.attributes.position, count = pos.count, col = new Float32Array(count * 3);
    var cx = (F.x0 + F.x1) / 2, cz = (F.z0 + F.z1) / 2, cBed = lin(0x424a42), cShore = lin(LOOK.farShore || 0xc8c4b6), cLow = lin(LOOK.farLow || 0x6c6642), cMid = lin(LOOK.farMid || 0x5e5a44), cHigh = lin(0x4a4640), cRock = lin(0x343230);
    var tmp = new THREE.Color(), i, ix, iz, x, z, yr, gx, gz, sl, lo = LOOK.farLowTo == null ? G.pin.model + 300 : LOOK.farLowTo, mid = lo + 1000;
    for (i = 0; i < count; i++) {
      ix = i % F.nx; iz = (i / F.nx) | 0; x = F.x0 + ix * F.step; z = F.z0 + iz * F.step; yr = G.farRaw[iz * F.nx + ix];
      pos.setXYZ(i, x - cx, -z + cz, G.farH[iz * F.nx + ix]);
      gx = G.farRaw[iz * F.nx + Math.min(F.nx - 1, ix + 1)] - G.farRaw[iz * F.nx + Math.max(0, ix - 1)]; gz = G.farRaw[Math.min(F.nz - 1, iz + 1) * F.nx + ix] - G.farRaw[Math.max(0, iz - 1) * F.nx + ix];
      sl = Math.hypot(gx, gz) / (2 * F.step);
      if (yr < G.lakeY - 1) tmp.copy(cBed); else if (yr < G.lakeY + 12) tmp.copy(cShore); else if (yr < lo) tmp.copy(cLow); else if (yr < mid) tmp.copy(cMid); else tmp.copy(cHigh);
      if (sl > 0.28) tmp.lerp(cRock, Math.min(1, (sl - 0.28) * 2.5));
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
    var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 4 }));
    m.rotation.x = -Math.PI / 2; m.position.set(cx, 0, cz); m.userData.probeSkip = true; m.userData.lodSkip = true; m.userData.inspectLabel = 'The Rift floor round ' + S.name; m.name = 'terrain-far';
    scene.add(m); return m;
  })();

  /* the water on core/water */
  var water = (function () {
    var out = { lake: null, wells: 0, tanks: 0, cisterns: 0, pans: 0, stills: [] };
    if (S.lake) try {
      var Lk = WATER.open({ name: S.lake.name, level: G.lakeY, field: S.lake.field == null ? 0.08 : S.lake.field, bounds: [F.x0, F.z0, F.x1, F.z1], bed: G.groundH, bedBox: [N.x0, N.z0, N.x1, N.z1], bedCell: 24 });
      var Ld = WATER.draw(Lk, { renderOrder: 1, roughness: 0.1, metalness: 0.06, envMapIntensity: 0.45, surf: false, breakers: false, pick: true,
        shallow: lin(S.lake.shallow || 0x8a9a82), deep: lin(S.lake.deep || 0x2d4d4a) });
      Ld.mesh.userData.inspectLabel = S.lake.label || S.lake.name; Ld.mesh.userData.probeSkip = true; out.lake = { S: Lk, D: Ld };
    } catch (e) { reportErr(S.key + ' lake: ' + (e && e.stack ? e.stack : e)); }
    var disc = function (x, z, r, n) { var P = [], k, a; for (k = 0; k < n; k++) { a = k / n * Math.PI * 2; P.push([x + Math.cos(a) * r, z + Math.sin(a) * r]); } return P; };
    var rect = function (x, z, ry, w, d) { var c = Math.cos(ry), s = Math.sin(ry); return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) { return [x + q[0] * w / 2 * c + q[1] * d / 2 * s, z - q[0] * w / 2 * s + q[1] * d / 2 * c]; }); };
    var fan = function (recs, mo, name, label) {
      var pos = [], nor = [], idx = []; recs.forEach(function (R) { var P = R.poly, o0 = pos.length / 3, cx = 0, cz = 0, k;
        P.forEach(function (p) { cx += p[0]; cz += p[1]; }); cx /= P.length; cz /= P.length; pos.push(cx, R.level, cz); nor.push(0, 1, 0);
        P.forEach(function (p) { pos.push(p[0], R.level, p[1]); nor.push(0, 1, 0); }); for (k = 0; k < P.length; k++) idx.push(o0, o0 + 1 + (k + 1) % P.length, o0 + 1 + k); });
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setIndex(idx); g.computeBoundingSphere();
      var m = new THREE.Mesh(g, WATER.stillMaterial(mo)); m.name = name; m.userData.probeSkip = true; m.userData.lodSkip = true; m.userData.inspectLabel = label; m.renderOrder = 1; scene.add(m); return m; };
    var fresh = [], brine = [];
    G.sites.forEach(function (s) {
      if (s.key === 'gl-well') { var a = WATER.still({ name: 'Well water ' + out.wells, level: s.y + 0.72, poly: disc(s.x, s.z, 0.9, 16) }); fresh.push(a); out.stills.push(a); out.wells++; }
      else if (s.key === 'gl-tank') { var b = WATER.still({ name: 'The great tank of ' + S.name, level: s.y + 1.56, poly: rect(s.x, s.z, s.ry, 11.8, 6.8) }); fresh.push(b); out.stills.push(b); out.tanks++; }
      else if (s.key === 'lz-cistern') { var cs = WATER.still({ name: 'Cistern water ' + out.cisterns, level: s.y + 0.78, poly: rect(s.x, s.z, s.ry, 6.8, 6.8) }); fresh.push(cs); out.stills.push(cs); out.cisterns++; }
      else if (s.key === 'gl-pans') { var c = WATER.still({ name: 'Pan brine ' + out.pans, level: s.y + 0.36, poly: rect(s.x, s.z, s.ry, 27.1, 27.1) }); brine.push(c); out.stills.push(c); out.pans++; } });
    if (fresh.length) out.freshMesh = fan(fresh, { color: lin(0x234440), roughness: 0.06, metalness: 0.14, envMapIntensity: 0.5 }, 'water:fresh-still', 'Well water (the brick wells, cisterns and the tank)');
    if (brine.length) out.brineMesh = fan(brine, { color: lin(0x9ca894), roughness: 0.08, metalness: 0.1, envMapIntensity: 0.45 }, 'water:brine-still', 'Brine in the clay pans');
    return out;
  })();
  window._lzvWater = { lake: !!water.lake, wells: water.wells, tanks: water.tanks, cisterns: water.cisterns, pans: water.pans, stills: water.stills.length };

  /* SITES, and the plinths and steps inside buildWorld (a nested place keeps local y 0) */
  var place0 = place;
  place = function (key, x, z, ry, o) { if (CURREC && (!o || o.y === undefined)) o = Object.assign({ y: 0 }, o || {}); return place0(key, x, z, ry, o); };
  SITES.length = 0; G.sites.forEach(function (r) { SITES.push({ key: r.key, x: r.x, z: r.z, ry: r.ry, o: r.o }); });
  var prevBuild = buildWorld;
  buildWorld = function () {
    var W0 = prevBuild(), PB = {}, keepT = GTARGET, keepSB = SB, tbl = KTAGS.table(), tblF = KTAGS.table();
    GTARGET = PB; resetCM(); SB = null;
    try {
      G.plinths.forEach(function (pl) { var h = pl.y1 - pl.y0; if (h <= 0.02) return;
        W(pl.x, 0, pl.z, pl.ry, function () { box(pl.stone ? 'stoneP' : 'earthR', 0, pl.y0, 0, pl.w + 0.36, h, pl.d + 0.36, hc(pl.stone ? 0x48524a : 0x886d4f)); });
        tbl.push(pl.x, pl.y0, pl.z, pl.ry, pl.w + 0.36, pl.d + 0.36, h); });
      REG.forEach(function (r) { if (r.parent || r.cls !== 'building' || !r.front || !r.front.world) return;
        var fr = r.front.world, fx = Math.sin(fr.yaw), fz = Math.cos(fr.yaw), g0 = G.groundH(fr.x + fx * 1.4, fr.z + fz * 1.4), drop = r.y - g0, n, k, sy, sx, sz;
        if (drop <= 0.22) return; n = Math.min(8, Math.ceil(drop / 0.28));
        for (k = 1; k <= n; k++) { sy = r.y - drop * (k / n); sx = fr.x + fx * 0.45 * k; sz = fr.z + fz * 0.45 * k;
          (function (sx, sy, sz) { W(sx, 0, sz, fr.yaw, function () { box('stoneP', 0, g0 - 0.3, 0, 2.2, sy - (g0 - 0.3), 0.52, hc(0x465048)); }); })(sx, sy, sz);
          if (typeof KWALK !== 'undefined' && KWALK.poly) { var cs = Math.cos(fr.yaw), sn = Math.sin(fr.yaw);
            KWALK.poly({ pts: [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) { return [sx + q[0] * 1.1 * cs + q[1] * 0.28 * sn, sz - q[0] * 1.1 * sn + q[1] * 0.28 * cs, sy]; }), name: 'step', tag: 'step:' + r.key }); } } });
      /* 3D bunds, drystone corner markers, furrows and standing Rift crops across G.fields */
      G.fields.forEach(function (f) {
        var bx = f.box, cx = (bx[0] + bx[2]) / 2, cz = (bx[1] + bx[3]) / 2, fw = bx[2] - bx[0], fd = bx[3] - bx[1];
        var nearS = G.sites.filter(function (s) { return Math.abs(s.x - cx) < fw / 2 + 24 && Math.abs(s.z - cz) < fd / 2 + 24; });
        var clearAt = function (px, pz) {
          for (var qi = 0; qi < nearS.length; qi++) {
            if (Math.abs(px - nearS[qi].x) < nearS[qi].w / 2 + 3.5 && Math.abs(pz - nearS[qi].z) < nearS[qi].d / 2 + 3.5) return false;
          }
          return true;
        };
        var cr = f.crop || 'ashmillet', isWet = cr.indexOf('rice') >= 0 || cr === 'taro';
        var isPod = cr === 'frillpod' || cr === 'bambara' || cr === 'helix-bean';
        var isGrain = cr.indexOf('rice') >= 0 || cr === 'ashmillet' || cr === 'sandpan-fonio';
        /* corner cairns or earthen paddy bunds */
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c2) {
          var kx = cx + c2[0] * (fw / 2 - 0.8), kz = cz + c2[1] * (fd / 2 - 0.8), ky = G.groundH(kx, kz);
          if (clearAt(kx, kz)) box('cyclo', kx, ky - 0.25, kz, 0.72, 1.05, 0.72, hc(0x4e5850));
        });
        if (isWet) {
          var bs;
          for (bs = 0; bs < 4; bs++) {
            var ux = bx[0] + (bs + 0.5) * fw / 4, uz = bx[1] + (bs + 0.5) * fd / 4;
            if (clearAt(ux, bx[1] + 0.6)) box('earthR', ux, G.groundH(ux, bx[1] + 0.6) - 0.24, bx[1] + 0.6, fw / 4 - 0.3, 0.58, 0.68, hc(0x6e583e));
            if (clearAt(ux, bx[3] - 0.6)) box('earthR', ux, G.groundH(ux, bx[3] - 0.6) - 0.24, bx[3] - 0.6, fw / 4 - 0.3, 0.58, 0.68, hc(0x6e583e));
            if (clearAt(bx[0] + 0.6, uz)) box('earthR', bx[0] + 0.6, G.groundH(bx[0] + 0.6, uz) - 0.24, uz, 0.68, 0.58, fd / 4 - 0.3, hc(0x6e583e));
            if (clearAt(bx[2] - 0.6, uz)) box('earthR', bx[2] - 0.6, G.groundH(bx[2] - 0.6, uz) - 0.24, uz, 0.68, 0.58, fd / 4 - 0.3, hc(0x6e583e));
          }
        }
        var nR = 6, nS = 4, segL = (fw - 8) / nS - 1.1, ri, si, rz, sx, gy;
        for (ri = 0; ri < nR; ri++) {
          rz = bx[1] + 5.5 + ri * ((fd - 11) / Math.max(1, nR - 1));
          for (si = 0; si < nS; si++) {
            sx = bx[0] + 4 + (si + 0.5) * ((fw - 8) / nS);
            if (!clearAt(sx, rz)) continue;
            gy = G.groundH(sx, rz);
            box('earth', sx, gy - 0.22, rz, segL, 0.42, 1.45, hc(isWet ? 0x4c3d2c : 0x624a34));
            if (f.kind === 'crop') {
              if (isGrain) {
                var gh = cr.indexOf('rice') >= 0 ? 0.68 : 0.92;
                box('thatch', sx, gy + 0.16, rz, segL * 0.94, gh, 0.85, hc(cr.indexOf('rice') >= 0 ? 0x768c3e : 0xb09248));
                box('reed', sx, gy + 0.16 + gh * 0.92, rz, segL * 0.9, 0.18, 0.52, hc(0xc8aa58));
              } else if (isPod) {
                box('matW', sx, gy + 0.18, rz, segL * 0.92, 0.72, 0.68, hc(0x486e3c));
                box('cane', sx, gy + 0.92, rz, segL * 0.92, 0.08, 0.12, hc(0xb89c62));
              } else {
                box('matW', sx, gy + 0.18, rz, segL * 0.92, 0.46, 1.12, hc(cr === 'taro' ? 0x3b6c4a : 0x526e38));
                if (cr === 'ballmelon' && (ri + si) % 2 === 0) box('cane', sx, gy + 0.24, rz + 0.42, 0.44, 0.34, 0.44, hc(0xc69c46));
              }
            } else if (f.kind === 'tilled') {
              box('matW', sx, gy + 0.18, rz, segL * 0.86, 0.18, 0.46, hc(0x5a7c3e));
            } else if ((ri + si) % 2 === 0) {
              box('reed', sx, gy + 0.16, rz, segL * 0.62, 0.22, 0.58, hc(0x9a8852));
            }
          }
        }
        tblF.push(cx, G.groundH(cx, cz), cz, 0, fw, fd, 1.1);
      });
    } finally { SB = keepSB; GTARGET = keepT; }
    var pg = new THREE.Group(); pg.name = S.key + '-plinths'; flushBuckets(PB, pg, true); WORLD.add(pg);
    if (SVTAGS && tbl.n > 0) SVTAGS.addSet({ 'class': 'infrastructure', kind: 'terrace-plinth', key: 'lzv-plinth', name: 'Footing plinths', tags: { culture: 'lizardmen', types: ['infrastructure'] },
      note: 'basalt and rammed-earth footings seating ' + S.name + '\'s buildings on its ground', frag: 'settlements/' + S.key }, tbl);
    if (SVTAGS && tblF.n > 0) SVTAGS.addSet({ 'class': 'infrastructure', kind: 'field-plot', key: 'lzv-field-plot', name: 'Bunded crop fields', tags: { culture: 'lizardmen', types: ['farm'] },
      note: 'paddy bunds, basalt corner stones, furrows and standing Rift crops across ' + S.name + '\'s fields', frag: 'settlements/' + S.key }, tblF);
    return W0;
  };

  /* the views */
  autoViews = function () {
    var y0 = G.groundH(0, 0), m = G.mouthPt, ym = G.groundH(m[0], m[1]), R = G.outerR, V = {
      'Overview': [-R * 0.9, y0 + R * 0.85, R * 1.25, 40, y0 - 10, -20],
      'The nest hall': [Math.sin(0.55) * 42, y0 + 13, Math.cos(0.55) * 42, 0, y0 + 4.5, 0],
      'The spiral street': [m[0] + G.e2[0] * 18, ym + 22, m[1] + G.e2[1] * 18, 0, y0 + 4, 0] };
    if (G.ley) { var a = G.ley.stoneAt, u = G.ley.unit;
      V['The ley line'] = [a[0] - u[0] * 18 + u[1] * 7, G.groundH(a[0], a[1]) + 8.5, a[1] - u[1] * 18 - u[0] * 7, a[0] + u[0] * 120, G.groundH(a[0] + u[0] * 120, a[1] + u[1] * 120) + 3, a[1] + u[1] * 120]; }
    if (G.fields.length) { var f = G.fields[Math.floor(G.fields.length / 2)].at, yf = G.groundH(f[0], f[1]); V['The fields'] = [f[0] * 0.7, yf + 40, f[1] * 0.7, f[0], yf - 4, f[1]]; }
    (S.views || []).forEach(function (q) { var yq = G.groundH(q.at[0], q.at[1]); V[q.name] = [q.at[0] + q.from[0], yq + q.from[1], q.at[1] + q.from[2], q.at[0], yq + (q.up || 2), q.at[1]]; });
    return V;
  };
  window._lzvMeshes = { near: nearMesh, far: farMesh };
})();
