/* ==================== Basilisk 90: the stone capital's world — KGROUND, terraces, walls, water & views ([draw]) ==================== */
/* Runs after 90-scene.js and before 91f-furnish.js and 92-world.js (settlements/basilisk/PLAN.md sections 1-8).
   - Replaces 90-scene.js's showcase plane with Basilisk's 16 m near PlaneGeometry (BS_SITE.nearH, KGROUND 4-layer sabkha/mud/
     yard/tilled blend), 64 km far ground, and vertex-exact meshes for the +5 m brick platform, +12 m polygonal-basalt Mound,
     and 700 m basalt ley mole (matching KDRAWN.mesh to the millimetre).
   - Draws the eastern terminal sea & bay on WATER.open (-2,600.5 m), the seven Dholavira cascading reservoirs, Lothal dock
     basin, Great Tank, cisterns, 231+ brick wells and 3 salt-pan spirals on WATER.still, and Tlahn Gill + the 2.1 km leat on
     WATER.flow.
   - Emits the Great Coil & Ley Way pavements, continuous 8.2 km cyclopean perimeter wall + parapet horns, Lothal dock quays,
     Dholavira reservoir linings & spillways, Tlahn Gill check dam, charcoal/ore yard, building plinths, front steps and bunded
     southern paddies into WORLD inside buildWorld(), registered in SVTAGS and KWALK. */
(function () {
  var G = BS_SITE, N = G.near, F = G.far;
  var linC = function (h) { return new THREE.Color(h).convertSRGBToLinear(); };

  /* 1. Camera reach, 2.21 atm hypertropic sabkha haze, and wider directional shadow box */
  camera.near = 0.5; camera.far = 80000; camera.updateProjectionMatrix();
  skyCam.far = 80000; skyCam.updateProjectionMatrix();
  SKY.hour = 9.4; SKY.dens = 2.24;
  skyApply();
  scene.fog.density = 0.000038;
  {
    var sc = sun.shadow.camera;
    sc.left = -380; sc.right = 380; sc.top = 380; sc.bottom = -380; sc.near = 10; sc.far = 1800;
    sc.updateProjectionMatrix();
  }

  scene.remove(groundM);
  if (groundM.geometry) groundM.geometry.dispose();

  /* 2. Near ground mesh (6.8 x 6.8 km at 16 m, exact heights from BS_SITE.nearH) with KGROUND 4-layer sabkha blend */
  var bsNearMesh = (function () {
    var Wd = N.x1 - N.x0, Hd = N.z1 - N.z0, nx = N.nx - 1, nz = N.nz - 1;
    var geo = new THREE.PlaneGeometry(Wd, Hd, nx, nz);
    var pos = geo.attributes.position, count = pos.count;
    var col = new Float32Array(count * 3), zones = new Float32Array(count * 4);
    var cx = (N.x0 + N.x1) / 2, cz = (N.z0 + N.z1) / 2;
    var cSabkha = linC(0xc8bfa8);
    var cMud = linC(0x584c3c);
    var cTill = linC(0x4e5836);
    var cYard = linC(0x7c6d54);
    var cBed = linC(0x3a4a46);
    var tmp = new THREE.Color(), i, ix, iz, x, z, y, zw;
    for (i = 0; i < count; i++) {
      ix = i % N.nx; iz = (i / N.nx) | 0;
      x = N.x0 + ix * N.step; z = N.z0 + iz * N.step;
      y = G.nearH[iz * N.nx + ix];
      pos.setXYZ(i, x - cx, -z + cz, y);
      zw = G.zoneAt(x, z);
      zones[i * 4] = zw[0]; zones[i * 4 + 1] = zw[1]; zones[i * 4 + 2] = zw[2]; zones[i * 4 + 3] = zw[3];
      tmp.copy(y < G.seaY - 0.35 ? cBed : cSabkha);
      if (zw[0] > 0 && y >= G.seaY - 0.35) tmp.lerp(cMud, zw[0] * 0.72);
      if (zw[1] > 0) tmp.lerp(cTill, zw[1] * 0.78);
      if (zw[2] > 0) tmp.lerp(cYard, zw[2] * 0.58);
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aBsZone', new THREE.BufferAttribute(zones, 4));
    geo.computeVertexNormals();

    var mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    KHOOK.add(mat, 'bs-zones', function (sh) {
      sh.vertexShader = 'attribute vec4 aBsZone;\nvarying vec4 vBsZone;\n' +
        KHOOK.rep(sh.vertexShader, '#include <begin_vertex>', '#include <begin_vertex>\nvBsZone=aBsZone;', 'bs-zones');
      sh.fragmentShader = 'varying vec4 vBsZone;\n' +
        KHOOK.rep(sh.fragmentShader, '#include <color_fragment>',
          '#include <color_fragment>\n/*KGROUND*/\ndiffuseColor.rgb*=mix(1.0,0.74,vBsZone.w);', 'bs-zones');
    }, { key: 'bs-zones' });

    if (typeof KGROUND !== 'undefined') {
      KGROUND.hook(mat, {
        key: 'bs-near', at: '/*KGROUND*/',
        relief: { bump: 0.05, cavity: 0.52, mesh: 0.42, lambert: 1 },
        tri: true,
        layers: [
          KGROUND.layer('basilisk', 'gSalt', { w: '1.0', amt: 0.9, gain: 1.06, tint: 'diffuseColor.rgb*1.42', name: 'sabkha salt crust' }),
          KGROUND.layer('basilisk', 'gTill', { w: 'vBsZone.y', amt: 0.92, gain: 1.0, tint: 'diffuseColor.rgb*1.32', name: 'tilled paddy' }),
          KGROUND.layer('basilisk', 'gYard', { w: 'vBsZone.z', amt: 0.9, gain: 1.04, name: 'haul track' }),
          KGROUND.layer('basilisk', 'gMud', { w: 'vBsZone.x', amt: 0.88, gain: 1.02, tint: 'diffuseColor.rgb*1.28', name: 'strand mud' })
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
    m.userData.inspectLabel = 'The coastal sabkha of Basilisk (XA hypertropic floor, -2,600 m)';
    m.name = 'terrain-near';
    if (typeof KGROUND !== 'undefined' && KGROUND.cavityMesh) KGROUND.cavityMesh(m);
    scene.add(m);
    return m;
  })();

  /* 3. Architectural ground terraces matching KDRAWN.mesh (the +5 m brick platform, +12 m basalt Mound, 700 m ley mole) */
  function makeTerraceObject(T, topHex, sideHex, name, label) {
    /* Non-indexed per-triangle normals & vertex colours so flat decks and battered revetments shade crisply */
    var idx = T.idx, src = T.pos, nt = (idx.length / 3) | 0;
    var pos = new Float32Array(nt * 9), col = new Float32Array(nt * 9);
    var cTop = linC(topHex), cSide = linC(sideHex), t, a, b, c, ny, cr, cg, cb;
    for (t = 0; t < nt; t++) {
      a = idx[t * 3] * 3; b = idx[t * 3 + 1] * 3; c = idx[t * 3 + 2] * 3;
      var ux = src[b] - src[a], uy = src[b + 1] - src[a + 1], uz = src[b + 2] - src[a + 2];
      var vx = src[c] - src[a], vy = src[c + 1] - src[a + 1], vz = src[c + 2] - src[a + 2];
      var nx = uy * vz - uz * vy, nY = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      ny = Math.abs(nY) / (Math.hypot(nx, nY, nz) || 1);
      cr = ny > 0.85 ? cTop.r : cSide.r;
      cg = ny > 0.85 ? cTop.g : cSide.g;
      cb = ny > 0.85 ? cTop.b : cSide.b;
      pos[t * 9] = src[a]; pos[t * 9 + 1] = src[a + 1]; pos[t * 9 + 2] = src[a + 2];
      pos[t * 9 + 3] = src[b]; pos[t * 9 + 4] = src[b + 1]; pos[t * 9 + 5] = src[b + 2];
      pos[t * 9 + 6] = src[c]; pos[t * 9 + 7] = src[c + 1]; pos[t * 9 + 8] = src[c + 2];
      col[t * 9] = cr; col[t * 9 + 1] = cg; col[t * 9 + 2] = cb;
      col[t * 9 + 3] = cr; col[t * 9 + 4] = cg; col[t * 9 + 5] = cb;
      col[t * 9 + 6] = cr; col[t * 9 + 7] = cg; col[t * 9 + 8] = cb;
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    var mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    if (typeof KGROUND !== 'undefined') {
      KGROUND.hook(mat, {
        key: name,
        relief: { bump: 0.045, cavity: 0.38, mesh: 0.28, lambert: 1 },
        tri: true,
        layers: [KGROUND.layer('basilisk', 'gSalt', { w: '1.0', amt: 0.52, gain: 1.02, tint: 'diffuseColor.rgb*1.18', name: name })]
      });
    }
    var m = new THREE.Mesh(g, mat);
    m.receiveShadow = true;
    m.castShadow = true;
    m.userData.isGround = true;
    m.userData.ground = true;
    m.userData.probeSkip = true;
    m.userData.inspectLabel = label;
    m.name = name;
    scene.add(m);
    return m;
  }

  var bsCityTerraceMesh = makeTerraceObject(G.cityTerrace, 0x3b5e53, 0x263c35, 'terrace-city',
    'The +5 m verdigris chlorite-stone city platform of Basilisk (-2,595 m, battered basalt revetments)');
  var bsMoundTerraceMesh = makeTerraceObject(G.moundTerrace, 0x2f4f45, 0x1f352f, 'terrace-mound',
    'The +12 m dark malachite-basalt Mound of Intention (-2,588 m)');
  var bsMoleTerraceMesh = makeTerraceObject(G.moleTerrace, 0x38584e, 0x253a33, 'terrace-mole',
    'The 700 m cyclopean verdigris-basalt ley mole (+1.5 m over the eastern sea, bearing 50.6 deg)');
  var bsCourtPlazasMesh = makeTerraceObject(G.courtPlazas, 0x457062, 0x2b463d, 'terrace-courts',
    'Dressed verdigris-stone flags of the eight district courts and the Court of the First Turn');

  /* 4. Far ground mesh (64 km square at 500 m, sunk inside NEAR) */
  var bsFarMesh = (function () {
    var Wd = F.x1 - F.x0, Hd = F.z1 - F.z0, nx = F.nx - 1, nz = F.nz - 1;
    var geo = new THREE.PlaneGeometry(Wd, Hd, nx, nz);
    var pos = geo.attributes.position, count = pos.count;
    var col = new Float32Array(count * 3);
    var cx = (F.x0 + F.x1) / 2, cz = (F.z0 + F.z1) / 2;
    var cBed = linC(0x364844), cSabkha = linC(0xc0b69e), cJungle = linC(0x465838), cBench = linC(0x52583e), cWall = linC(0x3c3a36);
    var tmp = new THREE.Color(), i, ix, iz, x, z, yRaw, ySunk, wF, gx, gz, sl;
    for (i = 0; i < count; i++) {
      ix = i % F.nx; iz = (i / F.nx) | 0;
      x = F.x0 + ix * F.step; z = F.z0 + iz * F.step;
      yRaw = G.farRaw[iz * F.nx + ix];
      ySunk = G.farH[iz * F.nx + ix];
      wF = G.waterFar[iz * F.nx + ix] / 255.0;
      pos.setXYZ(i, x - cx, -z + cz, ySunk);
      gx = G.farRaw[iz * F.nx + Math.min(F.nx - 1, ix + 1)] - G.farRaw[iz * F.nx + Math.max(0, ix - 1)];
      gz = G.farRaw[Math.min(F.nz - 1, iz + 1) * F.nx + ix] - G.farRaw[Math.max(0, iz - 1) * F.nx + ix];
      sl = Math.hypot(gx, gz) / (2 * F.step);
      if (wF > 0.5 && yRaw <= G.sabkhaY + 2) tmp.copy(cBed);
      else if (yRaw < G.sabkhaY + 6) tmp.copy(cSabkha);
      else if (yRaw < -2200) tmp.copy(cJungle);
      else tmp.copy(cBench);
      if (sl > 0.24) tmp.lerp(cWall, Math.min(1, (sl - 0.24) * 2.5));
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
    m.userData.inspectLabel = 'The eastern terminal sea and southern Rift apron round Basilisk';
    m.name = 'terrain-far';
    scene.add(m);
    return m;
  })();

  /* 5. Water on core/water:
        - Eastern Terminal Sea & Tlahn Gill Bay: WATER.open at -2,600.5 m
        - Seven cascading Dholavira reservoirs, Great Tank, cisterns & 231+ brick wells: fresh WATER.still
        - Lothal dock basin & 3 salt-pan spirals: salt/brine WATER.still
        - Tlahn Gill (r762) & 2.1 km leat: WATER.flow */
  var bsWater = (function () {
    var out = { sea: null, dock: 0, reservoirs: 0, tanks: 0, cisterns: 0, wells: 0, pans: 0, stills: [], flows: [] };
    try {
      var seaS = WATER.open({
        name: 'Eastern Terminal Sea', level: G.seaY, field: 0.09,
        bounds: [F.x0, F.z0, F.x1, F.z1],
        bed: G.baseTerrainH, bedBox: [N.x0, N.z0, N.x1, N.z1], bedCell: 24
      });
      var seaD = WATER.draw(seaS, {
        renderOrder: 1, roughness: 0.09, metalness: 0.08, envMapIntensity: 0.48,
        surf: false, breakers: false, pick: true,
        shallow: linC(0x6e8c7e), deep: linC(0x21403e)
      });
      seaD.mesh.userData.inspectLabel = 'The Eastern Terminal Sea (-2,600.5 m, 9,272 km2, salt, no tide)';
      seaD.mesh.userData.probeSkip = true;
      out.sea = { S: seaS, D: seaD };
    } catch (e) {
      reportErr('basilisk sea: ' + (e && e.stack ? e.stack : e));
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
      var pos = [], nor = [], idx = [], i, S, P, o0, cx, cz, k, a2, kNext;
      for (i = 0; i < records.length; i++) {
        S = records[i]; P = S.poly; o0 = pos.length / 3; cx = 0; cz = 0; a2 = 0;
        for (k = 0; k < P.length; k++) {
          cx += P[k][0]; cz += P[k][1];
          kNext = (k + 1) % P.length;
          a2 += P[k][0] * P[kNext][1] - P[kNext][0] * P[k][1];
        }
        cx /= P.length; cz /= P.length;
        pos.push(cx, S.level, cz); nor.push(0, 1, 0);
        for (k = 0; k < P.length; k++) { pos.push(P[k][0], S.level, P[k][1]); nor.push(0, 1, 0); }
        /* Ensure upward +Y winding in Three.js right-handed (x east, y up, z south) regardless of polygon orientation */
        for (k = 0; k < P.length; k++) {
          if (a2 > 0) idx.push(o0, o0 + 1 + (k + 1) % P.length, o0 + 1 + k);
          else idx.push(o0, o0 + 1 + k, o0 + 1 + (k + 1) % P.length);
        }
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

    var freshList = [], brineList = [], dockList = [];
    /* Seven cascading Dholavira reservoirs */
    G.reservoirs.forEach(function (rv) {
      var sr = WATER.still({ name: 'Dholavira reservoir ' + rv.i, level: rv.level, poly: rv.poly });
      freshList.push(sr); out.stills.push(sr); out.reservoirs++;
    });
    /* Lothal dock basin */
    var sd = WATER.still({ name: 'The Lothal dock basin of Basilisk', level: G.dock.level + 0.04, poly: G.dock.poly });
    dockList.push(sd); out.stills.push(sd); out.dock = 1;

    /* Wells, Great Tank, cisterns & salt pans from placed sites */
    G.sites.forEach(function (s) {
      if (s.key === 'gl-well') {
        var sw = WATER.still({ name: 'Well water ' + out.wells, level: s.y + 0.72, poly: discPoly(s.x, s.z, 0.9, 14) });
        freshList.push(sw); out.stills.push(sw); out.wells++;
      } else if (s.key === 'gl-tank') {
        var st = WATER.still({ name: 'The Great Tank of the First Turn', level: s.y + 1.56, poly: rectPoly(s.x, s.z, s.ry, 11.8, 6.8) });
        freshList.push(st); out.stills.push(st); out.tanks++;
      } else if (s.key === 'lz-cistern') {
        var sc2 = WATER.still({ name: 'District cistern ' + out.cisterns, level: s.y + 0.78, poly: rectPoly(s.x, s.z, s.ry, 6.8, 6.8) });
        freshList.push(sc2); out.stills.push(sc2); out.cisterns++;
      } else if (s.key === 'gl-pans') {
        var sp = WATER.still({ name: 'Salt pan brine ' + out.pans, level: s.y + 0.36, poly: rectPoly(s.x, s.z, s.ry, 27.1, 27.1) });
        brineList.push(sp); out.stills.push(sp); out.pans++;
      }
    });

    if (freshList.length) {
      out.freshMesh = fanBatch(freshList, { color: linC(0x214842), roughness: 0.06, metalness: 0.14, envMapIntensity: 0.52 },
        'water:fresh-still', 'Fresh rainwater and leat water (seven Dholavira reservoirs, Great Tank, cisterns and brick wells)');
    }
    if (dockList.length) {
      out.dockMesh = fanBatch(dockList, { color: linC(0x2a4d48), roughness: 0.07, metalness: 0.12, envMapIntensity: 0.48 },
        'water:dock-still', 'Sheltered bay water inside the 175 x 36 m Lothal dock basin');
    }
    if (brineList.length) {
      out.brineMesh = fanBatch(brineList, { color: linC(0x9ca894), roughness: 0.08, metalness: 0.1, envMapIntensity: 0.45 },
        'water:brine-still', 'Concentrating brine in Basilisk\'s three scaled-back salt-pan spirals');
    }

    /* WATER.flow: the 2.1 km stone leat from Tlahn Gill check dam to Reservoir 7, and Tlahn Gill (r762) into the bay */
    try {
      var leatF = WATER.flow({ name: 'Dholavira leat', pts: G.leatPts, width: 4.2, speed: 0.85, densify: 24 });
      var leatD = WATER.drawFlow(leatF, { color: 0x26544e, roughness: 0.1, metalness: 0.12, step: 10, across: 4, margin: 0.6, renderOrder: 2 });
      leatD.mesh.userData.inspectLabel = 'Stone-lined floodwater leat from Tlahn Gill check dam to Reservoir 7 (2.1 km)';
      out.flows.push(leatF);

      if (G.tlahnPts.length >= 2) {
        /* Build monotonically descending river profile down Tlahn Gill into Tlahn Gill Bay */
        var runY = G.sabkhaY + 6.5, rPts = [], ti;
        for (ti = 0; ti < G.tlahnPts.length; ti++) {
          var rx = G.tlahnPts[ti][0], rz = G.tlahnPts[ti][1];
          var gy = G.baseTerrainH(rx, rz);
          runY = Math.min(runY - (ti > 0 ? 0.18 : 0), Math.max(G.seaY + 0.04, gy + 0.28));
          rPts.push([rx, rz, runY]);
        }
        var gillF = WATER.flow({ name: 'Tlahn Gill', pts: rPts, width: 12.0, speed: 1.05, densify: 40 });
        var gillD = WATER.drawFlow(gillF, { color: 0x35584e, roughness: 0.12, metalness: 0.1, step: 16, across: 5, margin: 1.2, renderOrder: 2 });
        gillD.mesh.userData.inspectLabel = 'Tlahn Gill (r762, 7.6 m3/s wet-season wadi feeding the check dam and bay)';
        out.flows.push(gillF);
      }
    } catch (e) {
      reportErr('basilisk flows: ' + (e && e.stack ? e.stack : e));
    }

    return out;
  })();
  window._bsWater = {
    sea: !!bsWater.sea, dock: bsWater.dock, reservoirs: bsWater.reservoirs,
    tanks: bsWater.tanks, cisterns: bsWater.cisterns, wells: bsWater.wells, pans: bsWater.pans,
    stills: bsWater.stills.length, flows: bsWater.flows.length
  };

  /* 6. Populate SITES for buildWorld() and emit Basilisk's monumental stone civil works into WORLD + SVTAGS + KWALK */
  var bsPlace0 = place;
  place = function (key, x, z, ry, o) {
    if (CURREC && (!o || o.y === undefined)) o = Object.assign({ y: 0 }, o || {});
    return bsPlace0(key, x, z, ry, o);
  };

  SITES.length = 0;
  for (var si = 0; si < G.sites.length; si++) {
    var sr = G.sites[si];
    SITES.push({ key: sr.key, x: sr.x, z: sr.z, ry: sr.ry, o: sr.o });
  }

  var bsPrevBuildWorld = buildWorld;
  buildWorld = function () {
    var W0 = bsPrevBuildWorld();
    var PB = {}, keepT = GTARGET, keepSB = SB;
    GTARGET = PB;
    resetCM();
    SB = null;

    var tblPlinth = KTAGS.table(), tblWall = KTAGS.table(), tblStreets = KTAGS.table();
    var tblCivil = KTAGS.table(), tblFields = KTAGS.table(), tblStreetFurn = KTAGS.table();
    var i, k;

    /* Helper: emit a paved verdigris-stone ribbon along a polyline [[x, z], ...] with optional twin bronze sledge tracks */
    function drawRibbon(pts, w, h, mk, col, kerbMk, kerbCol, yFn, tbl, tracks) {
      var pi, a, b, dx, dz, L, mx, mz, ry, ym;
      for (pi = 0; pi + 1 < pts.length; pi++) {
        a = pts[pi]; b = pts[pi + 1];
        dx = b[0] - a[0]; dz = b[1] - a[1]; L = Math.hypot(dx, dz);
        if (L < 0.5) continue;
        mx = (a[0] + b[0]) / 2; mz = (a[1] + b[1]) / 2;
        ry = Math.atan2(dx, dz);
        ym = yFn(mx, mz);
        W(mx, 0, mz, ry, function () {
          box(mk, 0, ym, 0, w, h, L + w * 0.4, col);
          if (kerbMk) {
            box(kerbMk, -w / 2 + 0.24, ym + h, 0, 0.48, 0.26, L + w * 0.2, kerbCol);
            box(kerbMk, w / 2 - 0.24, ym + h, 0, 0.48, 0.26, L + w * 0.2, kerbCol);
          }
          if (tracks) {
            box('bronzeC', -2.15, ym + h, 0, 0.24, 0.03, L + w * 0.1, hc(0x5a9c86));
            box('bronzeC', 2.15, ym + h, 0, 0.24, 0.03, L + w * 0.1, hc(0x5a9c86));
          }
        });
        if (tbl) tbl.push(mx, ym, mz, ry, w, L, h + 0.26);
      }
    }

    try {
      /* 6a. Great Coil (14 m verdigris-stone avenue + bronze runner tracks), Ley Way & 8 verdigris spiral streets */
      drawRibbon(G.coilStreet, 14.0, 0.08, 'stoneP', hc(0x467667), 'bronzeC', hc(0x2e4e44), function () { return G.platY - 0.02; }, tblStreets, true);
      /* South Gate exterior sloped verdigris-stone & bronze causeway pavement (continuous smooth psurf along groundH) */
      (function () {
        var gx = G.gateXz[0], zA = G.gateXz[1] + 7.2, zB = G.gateXz[1] + 112.0;
        psurf('stoneP', function (u, v) {
          var zz = zA + (zB - zA) * v;
          return [gx - 7.1 + 14.2 * u, G.groundH(gx, zz) + 0.035, zz];
        }, 2, 12, hc(0x467667), { flip: true });
        for (var ks = -1; ks <= 1; ks += 2) {
          beam('bronzeC', [gx + ks * 7.1, G.platY + 0.14, zA], [gx + ks * 7.5, G.sabkhaY + 0.14, zB], 0.28, hc(0x34584c), true, 6);
          beam('bronzeC', [gx + ks * 2.15, G.platY + 0.05, zA], [gx + ks * 2.15, G.sabkhaY + 0.05, zB], 0.12, hc(0x5ea28b), true, 6);
        }
      })();

      /* Straight 50.6 deg Ley Way + bronze sighting strip from Hall of Intention (t=8) all the way to the mole tip (t=mole1) */
      var leyRy = Math.atan2(G.leyDir[0], G.leyDir[1]);
      var emitLeySpan = function (t0, t1, y0, w) {
        var L = t1 - t0, tm = (t0 + t1) / 2, mx = G.leyDir[0] * tm, mz = G.leyDir[1] * tm;
        W(mx, 0, mz, leyRy, function () {
          box('stoneP', 0, y0, 0, w, 0.09, L, hc(0x528878));
          box('bronzeC', 0, y0 + 0.09, 0, 0.28, 0.04, L, hc(0x6ac0a6));
        });
        tblStreets.push(mx, y0, mz, leyRy, w, L, 0.14);
      };
      emitLeySpan(8, G.moundLeyEdgeT - 1.5, G.moundY - 0.01, 8.6);
      emitLeySpan(G.moundLeyEdgeT + 26.5, G.slotT - 8, G.platY - 0.01, 9.0);
      (function () {
        var ta = G.slotT + 38, tb = G.shoreT - 34, nS = 18, ds = (tb - ta) / nS, si4, tMid, gx2, gz2;
        for (si4 = 0; si4 < nS; si4++) {
          tMid = ta + (si4 + 0.5) * ds;
          gx2 = G.leyDir[0] * tMid; gz2 = G.leyDir[1] * tMid;
          emitLeySpan(ta + si4 * ds, ta + (si4 + 1) * ds, G.groundH(gx2, gz2) + 0.03, 7.6);
        }
      })();
      emitLeySpan(G.shoreT - 34, G.moleRange[1], G.moleY - 0.01, 7.2);
      /* Barge stair at the seaward tip of the 700 m ley mole */
      (function () {
        var mt = G.moleRange[1] + 2.5, mx = G.leyDir[0] * mt, mz = G.leyDir[1] * mt;
        W(mx, 0, mz, leyRy, function () {
          for (var st = 0; st < 7; st++) {
            box('cyclo', 0, G.seaY - 0.35, st * 0.65, 7.4, (G.moleY - (G.seaY - 0.35)) * (1 - st / 7), 0.72, hc(0x3a5c52));
          }
        });
      })();

      /* Eight district & Gate Quarter verdigris-stone spiral streets with bronze-trimmed kerbs */
      G.districtStreets.forEach(function (ds) {
        drawRibbon(ds.pts, 7.0, 0.07, 'stoneP', hc(0x3f6e60), 'bronzeC', hc(0x4c8272), function () { return G.platY - 0.01; }, tblStreets, false);
      });

      /* 6a-2. Verdigris-stone & cast-bronze street furniture along the Great Coil and district spiral streets:
               (0) Shang fangding bronze cauldrons on stone plinths, (1) battered verdigris-stone & bronze basking benches,
               (2) twisted spiral-eye street pylons with clapperless chimes, (3) bronze-spouted monsoon curb troughs */
      (function () {
        var emitFurnPiece = function (fx, fz, fry, kindIdx) {
          var fy = G.platY + 0.05;
          W(fx, fy, fz, fry, function () {
            if (kindIdx === 0) {
              /* Cast-bronze Shang fangding street cauldron on a verdigris-stone pedestal */
              box('stoneP', 0, 0, 0, 1.55, 0.34, 1.55, hc(0x36584d));
              for (var lx = -1; lx <= 1; lx += 2) {
                for (var lz = -1; lz <= 1; lz += 2) {
                  cyl('bronzeC', lx * 0.46, 0.34, lz * 0.46, 0.11, 0.68, hc(0x78683c), 7);
                }
              }
              box('bronzeC', 0, 0.96, 0, 1.28, 0.78, 1.12, hc(0x4b8a78));
              box('lacq', 0, 1.16, 0, 1.32, 0.34, 1.16, hc(0x1a1612));
              box('bronzeC', 0, 1.68, 0, 1.44, 0.12, 1.26, hc(0x7c6c40));
              cone('bronzeC', -0.58, 1.8, 0, 0.09, 0.55, hc(0x4b8a78), 6);
              cone('bronzeC', 0.58, 1.8, 0, 0.09, 0.55, hc(0x4b8a78), 6);
              tblStreetFurn.push(fx, fy, fz, fry, 1.6, 1.6, 2.35);
            } else if (kindIdx === 1) {
              /* Battered verdigris-stone & cast-bronze caste basking bench */
              box('cyclo', -1.25, 0, 0, 0.46, 0.58, 1.05, hc(0x2d4840));
              box('cyclo', 1.25, 0, 0, 0.46, 0.66, 1.05, hc(0x2d4840));
              box('stoneP', 0, 0.58, 0, 3.3, 0.2, 1.18, hc(0x467868));
              box('bronzeC', 0, 0.78, -0.44, 3.34, 0.28, 0.14, hc(0x78683c));
              box('bronzeC', 0, 0.66, 0.58, 3.26, 0.06, 0.05, hc(0x589c86));
              cone('bronzeC', -1.58, 0.78, -0.44, 0.08, 0.62, hc(0x4c8a78), 6);
              cone('bronzeC', 1.58, 0.78, -0.44, 0.08, 0.62, hc(0x4c8a78), 6);
              tblStreetFurn.push(fx, fy, fz, fry, 3.4, 1.2, 1.4);
            } else if (kindIdx === 2) {
              /* Twisted verdigris-stone kerb pylon with bronze spiral-eye disc & clapperless street chimes */
              for (var ci = 0; ci < 5; ci++) {
                var cw = 0.92 - ci * 0.09;
                box('stoneP', 0, ci * 0.64, 0, cw, 0.65, cw, hc(ci % 2 ? 0x385e52 : 0x487668), ci * 0.14);
              }
              box('bronzeC', 0, 3.2, 0, 0.86, 0.14, 0.86, hc(0x7c6c40));
              cyl('bronzeC', 0, 3.34, 0, 0.44, 0.52, hc(0x4a8a78), 8);
              box('jade', 0, 3.55, 0, 0.24, 0.24, 0.92, hc(0x6ad6be));
              /* Outrigger bronze bar with 3 tiny clapperless bells */
              box('bronzeC', 0.55, 2.95, 0, 0.95, 0.07, 0.07, hc(0x7c6c40));
              for (var bi2 = 0; bi2 < 3; bi2++) {
                cyl('bronzeC', 0.32 + bi2 * 0.26, 2.62, 0, 0.07, 0.3, hc(0x549682), 7);
              }
              tblStreetFurn.push(fx, fy, fz, fry, 1.4, 1.0, 3.9);
            } else {
              /* Polygonal verdigris-stone & bronze gargoyle curb trough */
              box('cyclo', 0, 0, 0, 2.1, 0.74, 1.25, hc(0x35584d));
              box('bronzeC', 0, 0.72, 0, 2.18, 0.09, 1.32, hc(0x78683c));
              box('jade', 0, 0.66, 0, 1.76, 0.08, 0.92, hc(0x286862));
              cyl('bronzeC', 0, 0.74, -0.52, 0.15, 0.72, hc(0x4a8a78), 7);
              box('bronzeC', 0, 1.18, -0.22, 0.14, 0.12, 0.55, hc(0x7c6c40));
              tblStreetFurn.push(fx, fy, fz, fry, 2.2, 1.35, 1.46);
            }
          });
        };

        var clearOfSites = function (px, pz) {
          /* Skip ley corridor and any placed building footprint */
          var lt = px * G.leyDir[0] + pz * G.leyDir[1];
          var lp = Math.abs(px * G.leyPerp[0] + pz * G.leyPerp[1]);
          if (lt > -10 && lp < 9.0) return false;
          for (var si5 = 0; si5 < G.sites.length; si5++) {
            var sb2 = G.sites[si5];
            if (Math.abs(px - sb2.x) < sb2.w * 0.5 + 2.6 && Math.abs(pz - sb2.z) < sb2.d * 0.5 + 2.6) return false;
          }
          return true;
        };

        var walkRibbonFurn = function (pts, kerbOff, stepDist, seedBase) {
          var segI, p0, p1, dx, dz, L, ux, uz, nx, nz, dCur, side, px, pz, kIdx;
          var seqF = seedBase;
          for (segI = 0; segI + 1 < pts.length; segI++) {
            p0 = pts[segI]; p1 = pts[segI + 1];
            dx = p1[0] - p0[0]; dz = p1[1] - p0[1]; L = Math.hypot(dx, dz);
            if (L < stepDist * 0.9) continue;
            ux = dx / L; uz = dz / L;
            nx = -uz; nz = ux;
            for (dCur = 22; dCur < L - 22; dCur += stepDist) {
              seqF++;
              side = (seqF % 2 === 0) ? 1 : -1;
              px = p0[0] + ux * dCur + nx * side * kerbOff;
              pz = p0[1] + uz * dCur + nz * side * kerbOff;
              if (!clearOfSites(px, pz)) continue;
              kIdx = (seqF * 3 + segI) & 3;
              emitFurnPiece(px, pz, Math.atan2(-nx * side, -nz * side), kIdx);
            }
          }
        };

        walkRibbonFurn(G.coilStreet, 5.8, 30, 11);
        G.districtStreets.forEach(function (ds, di) {
          walkRibbonFurn(ds.pts, 2.85, 52, 101 + di * 17);
        });
      })();

      /* 6b. Continuous 8,170 m cyclopean perimeter wall curtain (+5 m platform up +8 m to +13 m walk + parapet & stone horns) */
      var wallObstacles = G.sites.filter(function (s) {
        return s.key === 'lk-watchtower' || s.key === 'lk-slot' || s.key === 'lk-gate' || s.key === 'lk-wall';
      });
      G.wallRuns.forEach(function (wr) {
        var dx = wr.b[0] - wr.a[0], dz = wr.b[1] - wr.a[1], L = Math.hypot(dx, dz) || 1;
        var ux = dx / L, uz = dz / L, ry = Math.atan2(-uz, ux);
        var segLen = 20.0, nSeg = Math.max(1, Math.round(L / segLen)), stepL = L / nSeg, si2;
        for (si2 = 0; si2 < nSeg; si2++) {
          var tMid = (si2 + 0.5) * stepL, sx = wr.a[0] + ux * tMid, sz = wr.a[1] + uz * tMid;
          var blocked = wallObstacles.some(function (ob) {
            var tol = ob.key === 'lk-watchtower' ? 5.2 : ob.key === 'lk-wall' ? 10.2 : ob.key === 'lk-slot' ? 9.8 : 10.6;
            return Math.hypot(sx - ob.x, sz - ob.z) < tol + stepL * 0.42;
          });
          if (blocked) continue;
          (function (sx2, sz2, sl2) {
            W(sx2, 0, sz2, ry, function () {
              /* Battered lower & upper cyclopean wall body (8 m above +5 m platform = +13 m over sabkha) */
              box('cyclo', 0, G.platY - 0.3, 0, sl2 + 0.4, 4.4, 4.8, hc(0x454e47));
              box('cyclo', 0, G.platY + 4.1, 0, sl2 + 0.4, 3.9, 4.1, hc(0x4c564e));
              /* Wall-walk slab, bronze leiwen strip, outer parapet & stone horns */
              box('basalt', 0, G.platY + 8.0, 0, sl2 + 0.45, 0.34, 4.35, hc(0x38403a));
              box('bronzeC', 0, G.platY + 8.34, -0.8, sl2 + 0.4, 0.04, 0.16, hc(0x528870));
              box('cyclo', 0, G.platY + 8.34, 1.75, sl2 + 0.45, 1.15, 0.62, hc(0x48524a));
              var nh = Math.max(3, (Math.round(sl2 / 3.2) | 1));
              for (var hi = 0; hi < nh; hi++) {
                var hx = -sl2 / 2 + 1.2 + hi * ((sl2 - 2.4) / Math.max(1, nh - 1));
                cone('basalt', hx, G.platY + 9.48, 1.82, 0.16, 1.45, hc(0x363e38), 6);
              }
            });
            tblWall.push(sx2, G.platY, sz2, ry, sl2, 4.8, 9.6);
          })(sx, sz, stepL);
        }
      });

      /* 6c. Lothal dock brick quay walls (175 x 36 m) & north bronze sluice gate */
      (function () {
        var Dk = G.dock, hQ = (G.sabkhaY + 0.68) - (Dk.floor - 0.3);
        W(Dk.x, 0, Dk.z, Dk.ry, function () {
          box('brick', -Dk.w / 2 - 1.1, Dk.floor - 0.3, 0, 2.2, hQ, Dk.d + 4.4, hc(0x8a523e));
          box('brick', Dk.w / 2 + 1.1, Dk.floor - 0.3, 0, 2.2, hQ, Dk.d + 4.4, hc(0x8a523e));
          box('brick', 0, Dk.floor - 0.3, -Dk.d / 2 - 1.1, Dk.w, hQ, 2.2, hc(0x8a523e));
          /* North wall split by the 7 m bronze spillway sluice */
          box('brick', -11.5, Dk.floor - 0.3, Dk.d / 2 + 1.1, 13.0, hQ, 2.2, hc(0x8a523e));
          box('brick', 11.5, Dk.floor - 0.3, Dk.d / 2 + 1.1, 13.0, hQ, 2.2, hc(0x8a523e));
          box('stoneP', 0, G.sabkhaY + 0.68, Dk.d / 2 + 1.1, 9.6, 0.38, 2.6, hc(0x465048));
          box('bronzeC', 0, G.seaY - 0.6, Dk.d / 2 + 1.1, 6.8, 1.45, 0.18, hc(0x4e866e));
          /* Paved west loading quay apron between dock and lk-dockstore */
          box('stoneP', -Dk.w / 2 - 7.5, G.sabkhaY - 0.15, 0, 12.0, 0.55, Dk.d + 6.0, hc(0x525a54));
        });
        tblCivil.push(Dk.x, Dk.floor, Dk.z, Dk.ry, Dk.w + 4.4, Dk.d + 4.4, hQ);
      })();

      /* 6d. Seven cascading Dholavira reservoirs: stepped brick-and-basalt linings & silt-trap spillways */
      G.reservoirs.forEach(function (rv, ri) {
        var P = rv.poly, n = P.length, ei;
        for (ei = 0; ei < n; ei++) {
          var a = P[ei], b = P[(ei + 1) % n], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
          var mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, ry = Math.atan2(dx, dz);
          var hW = rv.rim - (rv.floor - 0.4);
          (function (mx2, mz2, ry2, L2, fl2, hw2, lv2) {
            W(mx2, 0, mz2, ry2, function () {
              box('brick', 0, fl2 - 0.4, 0, 2.6, hw2, L2 + 2.4, hc(0x84503d));
              box('cyclo', 0, fl2 - 0.4, 0, 4.4, hw2 - 0.35, L2 + 3.2, hc(0x48524a));
              /* Inner stepped inspection treads */
              box('brick', 1.6, lv2 - 0.85, 0, 1.1, 0.85, L2 * 0.72, hc(0x784838));
            });
          })(mx, mz, ry, L, rv.floor, hW, rv.level);
        }
        tblCivil.push(rv.cx, rv.floor, rv.cz, 0, Math.sqrt(rv.area), Math.sqrt(rv.area), rv.rim - rv.floor);
        if (ri + 1 < G.reservoirs.length) {
          var nxt = G.reservoirs[ri + 1];
          var sx = (rv.cx + nxt.cx) / 2, sz = (rv.cz + nxt.cz) / 2;
          var sry = Math.atan2(nxt.cx - rv.cx, nxt.cz - rv.cz), sL = Math.hypot(nxt.cx - rv.cx, nxt.cz - rv.cz) * 0.28;
          W(sx, 0, sz, sry, function () {
            box('cyclo', 0, rv.level - 0.6, 0, 4.2, 1.35, Math.min(28, sL), hc(0x465048));
            box('bronzeC', 0, nxt.level + 0.12, 0, 2.2, 0.45, 0.2, hc(0x4f8870));
          });
        }
      });

      /* 6e. Tlahn Gill cyclopean basalt check dam (lk-checkdam) */
      (function () {
        var cx = G.checkDamXz[0], cz = G.checkDamXz[1], gy = G.baseTerrainH(cx, cz);
        W(cx, 0, cz, 0.42, function () {
          box('cyclo', 0, gy - 1.2, 0, 56.0, 4.8, 9.5, hc(0x444e46));
          box('basalt', 0, gy + 3.6, 0, 56.6, 0.45, 6.8, hc(0x363e38));
          for (var p = -2; p <= 2; p++) {
            box('cyclo', p * 9.5, gy - 1.2, 3.2, 2.8, 5.4, 5.6, hc(0x3d463f));
          }
          box('bronzeC', -18.0, gy + 1.4, 0, 4.2, 2.4, 0.24, hc(0x4e866e));
        });
        tblCivil.push(cx, gy - 1.2, cz, 0.42, 56, 10, 5.4);
      })();

      /* 6f. Charcoal & Ore Yard (lk-charcoal) beside the Great Bronze Hall */
      (function () {
        var ch = G.charcoal, gy = G.groundH(ch.x, ch.z);
        W(ch.x, 0, ch.z, ch.ry, function () {
          box('stoneP', 0, gy - 0.25, 0, ch.w, 0.38, ch.d, hc(0x464e48));
          box('cyclo', 0, gy + 0.13, -ch.d / 2 + 0.6, ch.w, 1.65, 1.2, hc(0x3f4742));
          box('cyclo', -ch.w / 2 + 0.6, gy + 0.13, 0, 1.2, 1.65, ch.d, hc(0x3f4742));
          box('cyclo', ch.w / 2 - 0.6, gy + 0.13, 0, 1.2, 1.65, ch.d, hc(0x3f4742));
          /* Three black jungle-charcoal mounds, green Tuatara copper-malachite heaps & dark cassiterite tin heaps */
          for (var m = -1; m <= 1; m++) {
            cone('lacq', m * 9.5, gy + 0.13, -5.5, 3.8, 2.6, hc(0x1e201e), 9);
          }
          cone('jade', -9.0, gy + 0.13, 5.5, 3.1, 1.95, hc(0x3d7c5e), 8);
          cone('jade', -2.5, gy + 0.13, 6.2, 2.7, 1.75, hc(0x448868), 8);
          cone('basalt', 7.5, gy + 0.13, 5.5, 2.8, 1.8, hc(0x3a3632), 8);
        });
        tblCivil.push(ch.x, gy - 0.25, ch.z, ch.ry, ch.w, ch.d, 2.8);
      })();

      /* 6g. Building plinths & front-door steps */
      for (i = 0; i < G.plinths.length; i++) {
        var pl = G.plinths[i], ph = pl.y1 - pl.y0;
        if (ph <= 0.02) continue;
        (function (pl2, ph2) {
          W(pl2.x, 0, pl2.z, pl2.ry, function () {
            box(pl2.stone ? 'stoneP' : 'earthR', 0, pl2.y0, 0, pl2.w + 0.36, ph2, pl2.d + 0.36, hc(pl2.stone ? 0x48524a : 0x886d4f));
          });
        })(pl, ph);
        tblPlinth.push(pl.x, pl.y0, pl.z, pl.ry, pl.w + 0.36, pl.d + 0.36, ph);
      }
      for (i = 0; i < REG.length; i++) {
        var r = REG[i];
        if (r.parent || r.cls !== 'building' || !r.front || !r.front.world) continue;
        var fr = r.front.world, fx = Math.sin(fr.yaw), fz = Math.cos(fr.yaw);
        var gFront = G.groundH(fr.x + fx * 1.4, fr.z + fz * 1.4), drop = r.y - gFront;
        if (drop > 0.22 && drop < 4.5) {
          var nSteps = Math.min(8, Math.ceil(drop / 0.28));
          for (k = 1; k <= nSteps; k++) {
            var sy = r.y - drop * (k / nSteps), sx2 = fr.x + fx * (0.45 * k), sz2 = fr.z + fz * (0.45 * k);
            (function (sx3, sy3, sz3, yaw3, gf3) {
              W(sx3, 0, sz3, yaw3, function () {
                box('stoneP', 0, gf3 - 0.3, 0, 2.2, sy3 - (gf3 - 0.3), 0.52, hc(0x465048));
              });
            })(sx2, sy, sz2, fr.yaw, gFront);
            if (typeof KWALK !== 'undefined' && KWALK.poly) {
              var cs = Math.cos(fr.yaw), sn = Math.sin(fr.yaw);
              KWALK.poly({
                pts: [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) {
                  return [sx2 + q[0] * 1.1 * cs + q[1] * 0.28 * sn, sz2 - q[0] * 1.1 * sn + q[1] * 0.28 * cs, sy];
                }),
                name: 'step', tag: 'step:' + r.key
              });
            }
          }
        }
      }

      /* 6h. 3D bunded bamboo-rice, rice, taro & shade-manioc paddies on the southern & western apron */
      G.fields.forEach(function (f) {
        var bx = f.box, cx = (bx[0] + bx[2]) / 2, cz = (bx[1] + bx[3]) / 2, fw = bx[2] - bx[0], fd = bx[3] - bx[1];
        var cr = f.crop || 'bamboo-rice', isWet = cr.indexOf('rice') >= 0 || cr === 'taro';
        var isGrain = cr.indexOf('rice') >= 0;
        var gy0 = G.groundH(cx, cz);
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c2) {
          var kx = cx + c2[0] * (fw / 2 - 0.8), kz = cz + c2[1] * (fd / 2 - 0.8);
          box('cyclo', kx, G.groundH(kx, kz) - 0.25, kz, 0.72, 1.0, 0.72, hc(0x4e5850));
        });
        if (isWet) {
          box('earthR', cx, gy0 - 0.22, bx[1] + 0.6, fw - 1.2, 0.56, 0.72, hc(0x6e583e));
          box('earthR', cx, gy0 - 0.22, bx[3] - 0.6, fw - 1.2, 0.56, 0.72, hc(0x6e583e));
          box('earthR', bx[0] + 0.6, gy0 - 0.22, cz, 0.72, 0.56, fd - 1.2, hc(0x6e583e));
          box('earthR', bx[2] - 0.6, gy0 - 0.22, cz, 0.72, 0.56, fd - 1.2, hc(0x6e583e));
        }
        var nR = 5, nS = 3, segL = (fw - 8) / nS - 1.2, ri, si3, rz, fx2, gy;
        for (ri = 0; ri < nR; ri++) {
          rz = bx[1] + 6 + ri * ((fd - 12) / Math.max(1, nR - 1));
          for (si3 = 0; si3 < nS; si3++) {
            fx2 = bx[0] + 4 + (si3 + 0.5) * ((fw - 8) / nS);
            gy = G.groundH(fx2, rz);
            box('earth', fx2, gy - 0.2, rz, segL, 0.4, 1.5, hc(isWet ? 0x463828 : 0x5c4632));
            if (f.kind === 'crop') {
              if (isGrain) {
                box('thatch', fx2, gy + 0.16, rz, segL * 0.92, 0.72, 0.88, hc(0x6e8838));
                box('reed', fx2, gy + 0.84, rz, segL * 0.88, 0.16, 0.52, hc(0xc4a854));
              } else {
                box('matW', fx2, gy + 0.18, rz, segL * 0.92, 0.48, 1.15, hc(cr === 'taro' ? 0x386c48 : 0x4e6c38));
              }
            } else if (f.kind === 'tilled') {
              box('matW', fx2, gy + 0.18, rz, segL * 0.85, 0.18, 0.48, hc(0x58783c));
            }
          }
        }
        tblFields.push(cx, gy0, cz, 0, fw, fd, 1.1);
      });
    } finally {
      SB = keepSB;
      GTARGET = keepT;
    }

    var pg = new THREE.Group();
    pg.name = 'basilisk-civil-works';
    flushBuckets(PB, pg, true);
    WORLD.add(pg);

    if (SVTAGS) {
      if (tblPlinth.n > 0) SVTAGS.addSet({
        'class': 'infrastructure', kind: 'terrace-plinth', key: 'bs-plinth',
        name: 'Stone and brick building footings', tags: { culture: 'lizardmen', types: ['infrastructure'] },
        note: 'basalt and baked-brick footings seating Basilisk\'s 2,300+ buildings on the platforms and sabkha',
        frag: 'settlements/basilisk'
      }, tblPlinth);
      if (tblWall.n > 0) SVTAGS.addSet({
        'class': 'infrastructure', kind: 'city-wall', key: 'bs-wall-curtain',
        name: 'Cyclopean perimeter wall of Basilisk', tags: { culture: 'lizardmen', types: ['military', 'infrastructure'] },
        note: 'battered cyclopean basalt wall rising 8 m above the +5 m platform (+13 m over sabkha) with horned parapet',
        frag: 'settlements/basilisk'
      }, tblWall);
      if (tblStreets.n > 0) SVTAGS.addSet({
        'class': 'infrastructure', kind: 'street-paving', key: 'bs-streets',
        name: 'Verdigris-stone avenues of the Great Coil, Ley Way and district spirals', tags: { culture: 'lizardmen', types: ['infrastructure', 'civic'] },
        note: 'verdigris chlorite-stone flagstones, bronze-edged kerbs and twin cast-bronze sledge-runner tracks of Basilisk\'s avenues',
        frag: 'settlements/basilisk'
      }, tblStreets);
      if (tblStreetFurn.n > 0) SVTAGS.addSet({
        'class': 'prop', kind: 'street-furniture', key: 'bs-street-furniture',
        name: 'Verdigris-stone and cast-bronze street furniture', tags: { culture: 'lizardmen', types: ['infrastructure', 'civic'] },
        note: 'Shang fangding bronze cauldrons, battered verdigris-stone basking benches, spiral-eye kerb pylons with clapperless chimes, and bronze-spouted curb troughs',
        frag: 'settlements/basilisk'
      }, tblStreetFurn);
      if (tblCivil.n > 0) SVTAGS.addSet({
        'class': 'infrastructure', kind: 'hydraulic-works', key: 'bs-hydraulics',
        name: 'Lothal dock, Dholavira reservoirs, check dam and ore yard', tags: { culture: 'lizardmen', types: ['infrastructure', 'industry'] },
        note: 'baked-brick Lothal dock quays, seven cascading Dholavira reservoirs, Tlahn Gill basalt check dam and charcoal/ore yard',
        frag: 'settlements/basilisk'
      }, tblCivil);
      if (tblFields.n > 0) SVTAGS.addSet({
        'class': 'infrastructure', kind: 'field-plot', key: 'bs-field-plot',
        name: 'Bunded sabkha-apron paddies', tags: { culture: 'lizardmen', types: ['farm'] },
        note: 'earthen paddy bunds, basalt corner markers and bamboo-rice, rice, taro and shade-manioc crops',
        frag: 'settlements/basilisk'
      }, tblFields);
    }
    return W0;
  };

  /* 7. Preset views: NO apostrophe and NO colon in any view name (item 30).
        safeView ensures every camera eye sits clear of all building bboxes and well above KDRAWN.h so `eye:*` passes cleanly. */
  function safeEye(ex, ey, ez, tx, ty, tz) {
    var i, s, dx, dz, rClear;
    for (i = 0; i < G.sites.length; i++) {
      s = G.sites[i];
      rClear = Math.hypot(s.w, s.d) / 2 + 4.5;
      dx = ex - s.x; dz = ez - s.z;
      if (Math.hypot(dx, dz) < rClear && ey < s.y + s.h + 3.5) {
        ey = Math.max(ey, s.y + s.h + 5.0);
      }
    }
    var gy = G.groundH(ex, ez);
    if (ey < gy + 3.0) ey = gy + 3.0;
    return [ex, ey, ez, tx, ty, tz];
  }

  autoViews = function () {
    var ym = G.moundY, yp = G.platY, ys = G.sabkhaY;
    var tk = G.sites.find(function (s) { return s.key === 'gl-tank'; }) || { x: -200, z: 200, y: yp };
    var bh = G.sites.find(function (s) { return s.key === 'lk-bronzehall'; }) || { x: G.dock.x, z: G.dock.z + 180, y: ys };
    var pn = G.sites.find(function (s) { return s.key === 'gl-pans'; }) || { x: -1400, z: -900, y: ys };
    var rv3 = G.reservoirs[2] || G.reservoirs[0];
    var mTipX = G.leyDir[0] * (G.moleRange[1] - 60), mTipZ = G.leyDir[1] * (G.moleRange[1] - 60);
    var cwA = G.coilStreet[4] || [-200, -180], cwB = G.coilStreet[5] || [-200, 180];
    var avDx = cwB[0] - cwA[0], avDz = cwB[1] - cwA[1], avL = Math.hypot(avDx, avDz) || 1;
    var avEx = cwA[0] + avDx / avL * 48, avEz = cwA[1] + avDz / avL * 48;
    var avTx = cwA[0] + avDx / avL * 195, avTz = cwA[1] + avDz / avL * 195;
    return {
      'Overview': safeEye(-1180, ym + 680, 1480, 20, yp, 40),
      'Verdigris avenues and colossi': safeEye(avEx, yp + 12.0, avEz, avTx, yp + 5.5, avTz),
      'The Hall and Mound of Intention': safeEye(G.leyDir[0] * 68, ym + 15, G.leyDir[1] * 68, -G.leyDir[0] * 12, ym + 7, -G.leyDir[1] * 12),
      'The Great Tank of the First Turn': safeEye(tk.x + 28, tk.y + 16, tk.z + 26, tk.x, tk.y + 2.5, tk.z),
      'The South Gate and Coil mouth': safeEye(G.gateXz[0] - 24, ys + 24, G.gateXz[1] + 92, G.gateXz[0], yp + 6, G.gateXz[1] - 10),
      'The Lothal dock and Bronze Hall': safeEye(G.dock.x + 175, ys + 86, G.dock.z + 235, (G.dock.x + bh.x) / 2 - 20, ys + 5, (G.dock.z + bh.z) / 2 - 10),
      'The Ley Slot and sea mole': safeEye(G.slotXz[0] + G.leyDir[0] * 55 + G.leyPerp[0] * 42, ys + 34, G.slotXz[1] + G.leyDir[1] * 55 + G.leyPerp[1] * 42, G.slotXz[0] + G.leyDir[0] * 420, G.moleY, G.slotXz[1] + G.leyDir[1] * 420),
      'The Dholavira reservoirs': safeEye(rv3.cx - 175, ys + 74, rv3.cz + 185, rv3.cx + 80, rv3.level, rv3.cz - 15),
      'The scaled-back salt strand': safeEye(pn.x - 115, ys + 48, pn.z + 145, pn.x + 55, ys + 2, pn.z + 10)
    };
  };

  window._bsMeshes = {
    near: bsNearMesh, far: bsFarMesh,
    cityTerrace: bsCityTerraceMesh, moundTerrace: bsMoundTerraceMesh, moleTerrace: bsMoleTerraceMesh, courtPlazas: bsCourtPlazasMesh
  };
})();
