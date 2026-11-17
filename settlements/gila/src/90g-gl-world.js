/* ==================== Gila 90g: the world — KGROUND terrain, core/water lake & wells, plinths, views ([draw]) ==================== */
/* Runs after 90-scene.js and before 91f-furnish.js and 92-world.js (settlements/gila/PLAN.md sections 1, 2, 4, 7).
   - Replaces 90-scene.js's flat placeholder ground with Gila's 20 m near PlaneGeometry (built from GL_SITE.nearH, matching
     KDRAWN.grid vertex for vertex, shaded by KGROUND's four library layers with relief and cavities) and 60 km far ground.
   - Draws Gila's salt lake on WATER.open (-1,723 m, calm salt brine over its baked bed) and every brick well, the great tank
     and every salt-pan spiral on WATER.still.
   - Populates SITES from GL_SITE.sites, draws fitted stone/earth plinths and front-door steps into GB + KWALK + SVTAGS
     inside buildWorld(), and sets Gila's preset views (no apostrophe or colon in any view name: item 30). */
(function () {
  var G = GL_SITE, N = G.near, F = G.far;

  /* 1. Camera reach, 1.96 atm abyssal savanna haze, and wider directional shadow box for the village */
  camera.near = 0.4; camera.far = 75000; camera.updateProjectionMatrix();
  skyCam.far = 75000; skyCam.updateProjectionMatrix();
  SKY.hour = 9.6; SKY.dens = 1.92;
  skyApply();
  scene.fog.density = 0.000042;
  {
    var sc = sun.shadow.camera;
    sc.left = -220; sc.right = 220; sc.top = 220; sc.bottom = -220; sc.near = 10; sc.far = 1200;
    sc.updateProjectionMatrix();
  }

  /* Remove 90-scene's flat 1600 m showcase plane */
  scene.remove(groundM);
  if (groundM.geometry) groundM.geometry.dispose();

  /* 2. Near ground mesh (8 x 9 km at 20 m, exact vertex heights from GL_SITE.nearH) with KGROUND 4-layer height blend + relief */
  var glNearMesh = (function () {
    var Wd = N.x1 - N.x0, Hd = N.z1 - N.z0, nx = N.nx - 1, nz = N.nz - 1;
    var geo = new THREE.PlaneGeometry(Wd, Hd, nx, nz);
    var pos = geo.attributes.position, count = pos.count;
    var col = new Float32Array(count * 3), zones = new Float32Array(count * 4);
    var cx = (N.x0 + N.x1) / 2, cz = (N.z0 + N.z1) / 2;
    var cSav = new THREE.Color(0x6e6844).convertSRGBToLinear();
    var cSalt = new THREE.Color(0xd8d4c8).convertSRGBToLinear();
    var cTill = new THREE.Color(0x5c4632).convertSRGBToLinear();
    var cYard = new THREE.Color(0x786848).convertSRGBToLinear();
    var cBed = new THREE.Color(0x464e44).convertSRGBToLinear();
    var tmp = new THREE.Color(), i, ix, iz, x, z, y, zw;
    for (i = 0; i < count; i++) {
      ix = i % N.nx; iz = (i / N.nx) | 0;
      x = N.x0 + ix * N.step; z = N.z0 + iz * N.step;
      y = G.nearH[iz * N.nx + ix];
      pos.setXYZ(i, x - cx, -z + cz, y);
      zw = G.zoneAt(x, z);
      zones[i * 4] = zw[0]; zones[i * 4 + 1] = zw[1]; zones[i * 4 + 2] = zw[2]; zones[i * 4 + 3] = zw[3];
      tmp.copy(y < G.lakeY - 0.5 ? cBed : cSav);
      if (zw[1] > 0) tmp.lerp(cTill, zw[1] * 0.72);
      if (zw[2] > 0) tmp.lerp(cYard, zw[2] * 0.45);
      if (zw[0] > 0 && y >= G.lakeY - 0.5) tmp.lerp(cSalt, zw[0] * 0.85);
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aGlZone', new THREE.BufferAttribute(zones, 4));
    geo.computeVertexNormals();

    var mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    KHOOK.add(mat, 'gila-zones', function (sh) {
      sh.vertexShader = 'attribute vec4 aGlZone;\nvarying vec4 vGlZone;\n' +
        KHOOK.rep(sh.vertexShader, '#include <begin_vertex>', '#include <begin_vertex>\nvGlZone=aGlZone;', 'gila-zones');
      sh.fragmentShader = 'varying vec4 vGlZone;\n' +
        KHOOK.rep(sh.fragmentShader, '#include <color_fragment>',
          '#include <color_fragment>\n/*KGROUND*/\ndiffuseColor.rgb*=mix(1.0,0.72,vGlZone.w);', 'gila-zones');
    }, { key: 'gila-zones' });

    if (typeof KGROUND !== 'undefined') {
      KGROUND.hook(mat, {
        key: 'gila-near', at: '/*KGROUND*/',
        relief: { bump: 0.05, cavity: 0.55, mesh: 0.45, lambert: 1 },
        tri: true,
        layers: [
          KGROUND.layer('gila', 'gSav', { w: '1.0', amt: 0.88, gain: 1.08, tint: 'diffuseColor.rgb*1.55', name: 'savanna litter' }),
          KGROUND.layer('gila', 'gTill', { w: 'vGlZone.y', amt: 0.92, gain: 1.05, name: 'tilled field' }),
          KGROUND.layer('gila', 'gYard', { w: 'vGlZone.z', amt: 0.9, gain: 1.05, name: 'beaten yard' }),
          KGROUND.layer('gila', 'gSalt', { w: 'vGlZone.x', amt: 0.95, gain: 1.08, name: 'salt crust' })
        ]
      });
    }
    var m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(cx, 0, cz);
    m.receiveShadow = true;
    m.userData.isGround = true;
    m.userData.ground = true;
    m.userData.probeSkip = true;
    m.userData.inspectLabel = 'The spit of Gila (abyssal savanna XV, -1,614 m at the pin)';
    m.name = 'terrain-near';
    if (typeof KGROUND !== 'undefined' && KGROUND.cavityMesh) KGROUND.cavityMesh(m);
    scene.add(m);
    return m;
  })();

  /* 3. Far ground mesh (60 km square at 500 m, sunk under NEAR, coloured by elevation and Rift-wall slope) */
  var glFarMesh = (function () {
    var Wd = F.x1 - F.x0, Hd = F.z1 - F.z0, nx = F.nx - 1, nz = F.nz - 1;
    var geo = new THREE.PlaneGeometry(Wd, Hd, nx, nz);
    var pos = geo.attributes.position, count = pos.count;
    var col = new Float32Array(count * 3);
    var cx = (F.x0 + F.x1) / 2, cz = (F.z0 + F.z1) / 2;
    var cBed = new THREE.Color(0x424a42).convertSRGBToLinear();
    var cSalt = new THREE.Color(0xc8c4b6).convertSRGBToLinear();
    var cLow = new THREE.Color(0x6c6642).convertSRGBToLinear();
    var cMid = new THREE.Color(0x5e5a44).convertSRGBToLinear();
    var cHigh = new THREE.Color(0x4a4640).convertSRGBToLinear();
    var cRock = new THREE.Color(0x343230).convertSRGBToLinear();
    var tmp = new THREE.Color(), i, ix, iz, x, z, yRaw, ySunk, gx, gz, sl;
    for (i = 0; i < count; i++) {
      ix = i % F.nx; iz = (i / F.nx) | 0;
      x = F.x0 + ix * F.step; z = F.z0 + iz * F.step;
      yRaw = G.farRaw[iz * F.nx + ix];
      ySunk = G.farH[iz * F.nx + ix];
      pos.setXYZ(i, x - cx, -z + cz, ySunk);
      gx = G.farRaw[iz * F.nx + Math.min(F.nx - 1, ix + 1)] - G.farRaw[iz * F.nx + Math.max(0, ix - 1)];
      gz = G.farRaw[Math.min(F.nz - 1, iz + 1) * F.nx + ix] - G.farRaw[Math.max(0, iz - 1) * F.nx + ix];
      sl = Math.hypot(gx, gz) / (2 * F.step);
      if (yRaw < G.lakeY - 1) tmp.copy(cBed);
      else if (yRaw < G.lakeY + 12) tmp.copy(cSalt);
      else if (yRaw < -1200) tmp.copy(cLow);
      else if (yRaw < -200) tmp.copy(cMid);
      else tmp.copy(cHigh);
      if (sl > 0.28) tmp.lerp(cRock, Math.min(1, (sl - 0.28) * 2.5));
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    var mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 4 });
    var m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(cx, 0, cz);
    m.userData.probeSkip = true;
    m.userData.lodSkip = true;
    m.userData.inspectLabel = 'The Rift floor and walls round Gila\'s salt lake';
    m.name = 'terrain-far';
    scene.add(m);
    return m;
  })();

  /* 4. Water on core/water:
        - Gila's salt lake: WATER.open at -1,723 m, calm brine over its baked bed
        - Every brick well (gl-well), the great tank (gl-tank) and every salt-pan spiral (gl-pans): WATER.still records,
          drawn together on WATER.stillMaterial (fresh water in wells & tank, pale salt brine in the evaporating pans) */
  var linC = function (h) { return new THREE.Color(h).convertSRGBToLinear(); };
  var glWater = (function () {
    var out = { lake: null, wells: 0, tanks: 0, pans: 0, stills: [] };
    try {
      var lakeS = WATER.open({
        name: 'Gila salt lake', level: G.lakeY, field: 0.08,
        bounds: [F.x0, F.z0, F.x1, F.z1],
        bed: G.groundH, bedBox: [N.x0, N.z0, N.x1, N.z1], bedCell: 24
      });
      var lakeD = WATER.draw(lakeS, {
        renderOrder: 1, roughness: 0.1, metalness: 0.06, envMapIntensity: 0.45,
        surf: false, breakers: false, pick: true,
        shallow: linC(0x8a9a82), deep: linC(0x2d4d4a)
      });
      lakeD.mesh.userData.inspectLabel = 'Gila\'s salt lake (-1,723 m, 2,304 km2)';
      lakeD.mesh.userData.probeSkip = true;
      out.lake = { S: lakeS, D: lakeD };
    } catch (e) {
      reportErr('gila lake: ' + (e && e.stack ? e.stack : e));
    }

    var discPoly = function (x, z, r, n) {
      var P = [], k, a;
      for (k = 0; k < n; k++) { a = k / n * Math.PI * 2; P.push([x + Math.cos(a) * r, z + Math.sin(a) * r]); }
      return P;
    };
    var rectPoly = function (x, z, ry, w, d) {
      var c = Math.cos(ry), s = Math.sin(ry), hw = w / 2, hd = d / 2;
      return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) {
        return [x + q[0] * hw * c + q[1] * hd * s, z - q[0] * hw * s + q[1] * hd * c];
      });
    };
    var fanBatch = function (records, matOpts, name, label) {
      var pos = [], nor = [], idx = [], i, S, P, o0, cx, cz, k;
      for (i = 0; i < records.length; i++) {
        S = records[i]; P = S.poly; o0 = pos.length / 3; cx = 0; cz = 0;
        for (k = 0; k < P.length; k++) { cx += P[k][0]; cz += P[k][1]; }
        cx /= P.length; cz /= P.length;
        pos.push(cx, S.level, cz); nor.push(0, 1, 0);
        for (k = 0; k < P.length; k++) { pos.push(P[k][0], S.level, P[k][1]); nor.push(0, 1, 0); }
        for (k = 0; k < P.length; k++) idx.push(o0, o0 + 1 + (k + 1) % P.length, o0 + 1 + k);
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      g.setIndex(idx); g.computeBoundingSphere();
      var m = new THREE.Mesh(g, WATER.stillMaterial(matOpts));
      m.name = name; m.userData.probeSkip = true; m.userData.lodSkip = true; m.userData.inspectLabel = label;
      m.renderOrder = 1; scene.add(m);
      return m;
    };

    var freshList = [], brineList = [], i, s;
    for (i = 0; i < G.sites.length; i++) {
      s = G.sites[i];
      if (s.key === 'gl-well') {
        var sw = WATER.still({ name: 'Well water ' + out.wells, level: s.y + 0.72, poly: discPoly(s.x, s.z, 0.9, 16) });
        freshList.push(sw); out.stills.push(sw); out.wells++;
      } else if (s.key === 'gl-tank') {
        var st = WATER.still({ name: 'The great tank of Gila', level: s.y + 1.56, poly: rectPoly(s.x, s.z, s.ry, 11.8, 6.8) });
        freshList.push(st); out.stills.push(st); out.tanks++;
      } else if (s.key === 'gl-pans') {
        var sp = WATER.still({ name: 'Evaporating pan brine ' + out.pans, level: s.y + 0.36, poly: rectPoly(s.x, s.z, s.ry, 27.1, 27.1) });
        brineList.push(sp); out.stills.push(sp); out.pans++;
      }
    }
    if (freshList.length) {
      out.freshMesh = fanBatch(freshList, { color: linC(0x234440), roughness: 0.06, metalness: 0.14, envMapIntensity: 0.5 },
        'water:fresh-still', 'Fresh lens water (the brick wells and the great tank)');
    }
    if (brineList.length) {
      out.brineMesh = fanBatch(brineList, { color: linC(0x9ca894), roughness: 0.08, metalness: 0.1, envMapIntensity: 0.45 },
        'water:brine-still', 'Concentrating salt-lake brine in the clay pans');
    }
    return out;
  })();
  window._glWater = {
    lake: !!glWater.lake, wells: glWater.wells, tanks: glWater.tanks, pans: glWater.pans,
    stills: glWater.stills.length
  };

  /* 5. Populate SITES for core/engine's buildWorld(), ensure nested place() calls (lz-farm's beasts) stay at local y = 0
        rather than evaluating terrainH(localX, localZ), and inject terrace plinths + front-door steps outside place()
        so every building's own REG bbox stays exact while zero corners float on the 6.7% slope */
  var glPlace0 = place;
  place = function (key, x, z, ry, o) {
    if (CURREC && (!o || o.y === undefined)) o = Object.assign({ y: 0 }, o || {});
    return glPlace0(key, x, z, ry, o);
  };

  SITES.length = 0;
  for (var si = 0; si < G.sites.length; si++) {
    var sr = G.sites[si];
    SITES.push({ key: sr.key, x: sr.x, z: sr.z, ry: sr.ry, o: sr.o });
  }

  /* Hook buildWorld BEFORE 91f-furnish.js wraps it: at this point in buildWorld(), all SITES have been placed into GB
     (so REG holds their front doors) OR Wait: 90-scene's buildWorld already flushed GB into WORLD! So we emit our
     plinths + door steps into their own bucket map and flush into WORLD, plus register an item-set in SVTAGS and
     walk strips in KWALK! */
  var glPrevBuildWorld = buildWorld;
  buildWorld = function () {
    var W0 = glPrevBuildWorld();
    var PB = {}, keepT = GTARGET;
    GTARGET = PB;
    resetCM();
    var keepSB = SB; SB = null;
    var tbl = KTAGS.table(), i, pl, mk, col, r, fr, gFront, drop, nSteps, k, sy, sx, sz, fx, fz;
    try {
      for (i = 0; i < G.plinths.length; i++) {
        pl = G.plinths[i];
        var h = pl.y1 - pl.y0;
        if (h <= 0.02) continue;
        mk = pl.stone ? 'stoneP' : 'earthR';
        col = pl.stone ? hc(0x48524a) : hc(0x886d4f);
        W(pl.x, 0, pl.z, pl.ry, function () {
          box(mk, 0, pl.y0, 0, pl.w + 0.36, h, pl.d + 0.36, col);
        });
        tbl.push(pl.x, pl.y0, pl.z, pl.ry, pl.w + 0.36, pl.d + 0.36, h);
      }
      /* Stepped stone thresholds from every placed building's front door down to the street */
      for (i = 0; i < REG.length; i++) {
        r = REG[i];
        if (r.parent || r.cls !== 'building' || !r.front || !r.front.world) continue;
        fr = r.front.world;
        fx = Math.sin(fr.yaw); fz = Math.cos(fr.yaw);
        gFront = G.groundH(fr.x + fx * 1.4, fr.z + fz * 1.4);
        drop = r.y - gFront;
        if (drop > 0.22) {
          nSteps = Math.min(8, Math.ceil(drop / 0.28));
          for (k = 1; k <= nSteps; k++) {
            sy = r.y - drop * (k / nSteps);
            sx = fr.x + fx * (0.45 * k);
            sz = fr.z + fz * (0.45 * k);
            W(sx, 0, sz, fr.yaw, function () {
              box('stoneP', 0, gFront - 0.3, 0, 2.2, sy - (gFront - 0.3), 0.52, hc(0x465048));
            });
            if (typeof KWALK !== 'undefined' && KWALK.poly) {
              var cs = Math.cos(fr.yaw), sn = Math.sin(fr.yaw);
              KWALK.poly({
                pts: [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) {
                  return [sx + q[0] * 1.1 * cs + q[1] * 0.28 * sn, sz - q[0] * 1.1 * sn + q[1] * 0.28 * cs, sy];
                }),
                name: 'step', tag: 'step:' + r.key
              });
            }
          }
        }
      }
    } finally {
      SB = keepSB;
      GTARGET = keepT;
    }
    var pg = new THREE.Group();
    pg.name = 'gila-plinths';
    flushBuckets(PB, pg, true);
    WORLD.add(pg);
    if (SVTAGS && tbl.n > 0) {
      SVTAGS.addSet({
        'class': 'infrastructure', kind: 'terrace-plinth', key: 'gl-plinth',
        name: 'Hillside footing plinths', tags: { culture: 'lizardmen', types: ['infrastructure'] },
        note: 'basalt and rammed-earth footings seating Gila\'s buildings on the spit\'s 6.7 % slope',
        frag: 'settlements/gila'
      }, tbl);
    }
    return W0;
  };

  /* 6. Views: NO apostrophe and NO colon in any view name (tools/checks_optin.json "names", item 30).
        Every camera position sits well above KDRAWN.h and clear of every building's volume so `eye:*` passes cleanly. */
  autoViews = function () {
    var y0 = G.groundH(0, 0);
    var mPt = G.mouthPt;
    var ym = G.groundH(mPt[0], mPt[1]);
    var yr = G.groundH(G.reliquary.x, G.reliquary.z);
    var ys = G.groundH(1520, 300);
    var yf = G.groundH(-1040, -980);
    return {
      'Overview': [-420, y0 + 360, 560, 40, y0 - 10, -20],
      'The nest hall': [Math.sin(0.55) * 42, y0 + 13, Math.cos(0.55) * 42, 0, y0 + 4.5, 0],
      'The great tank': (function () {
        var tk = G.sites.find(function (s) { return s.key === 'gl-tank'; }) || { x: 0, z: 60, y: y0, ry: 0 };
        var fx = Math.sin(tk.ry), fz = Math.cos(tk.ry);
        return [tk.x + fx * 22 + fz * 8, tk.y + 11, tk.z + fz * 22 - fx * 8, tk.x, tk.y + 2.2, tk.z];
      })(),
      'The spiral street': [mPt[0] + G.e2[0] * 18, ym + 22, mPt[1] + G.e2[1] * 18, 0, y0 + 4, 0],
      'The ley line': [G.ley.stoneAt[0] - G.ley.unit[0] * 18 + G.ley.unit[1] * 7, G.groundH(G.ley.stoneAt[0], G.ley.stoneAt[1]) + 8.5,
        G.ley.stoneAt[1] - G.ley.unit[1] * 18 - G.ley.unit[0] * 7,
        G.ley.stoneAt[0] + G.ley.unit[0] * 120, G.groundH(G.ley.stoneAt[0] + G.ley.unit[0] * 120, G.ley.stoneAt[1] + G.ley.unit[1] * 120) + 3,
        G.ley.stoneAt[1] + G.ley.unit[1] * 120],
      'The salt works and lake': [1390, ys + 52, 520, 1690, G.lakeY + 2, 290],
      'The crest fields and windmills': [-760, yf + 38, -590, -1120, yf - 6, -1080],
      'The west reliquary': [G.reliquary.x + Math.sin(G.reliquary.ry) * 58 + 14, yr + 22,
        G.reliquary.z + Math.cos(G.reliquary.ry) * 58, G.reliquary.x, yr + 11, G.reliquary.z]
    };
  };
  window._glMeshes = { near: glNearMesh, far: glFarMesh };
})();
