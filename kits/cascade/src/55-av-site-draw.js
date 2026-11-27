// ================================================================= ARCVILLAGE — site ground, aqueduct viaduct, gardens, sluices & barges  [draw]
// Draws the site terrain heightfield (carved canal trenches + outer highland hills), registers the drawn heightfield
// in KDRAWN (harness.SURVEY drawn-ground), builds the monumental Southern Elevated Headrace Aqueduct Viaduct over the
// lower tailrace canal, the East/West Tailrace Sluice Houses & Barge Locks, 4 moored cargo barges, the stone-curbed
// Twin Circular Vegetable & Orchard Gardens (Sheet 1 #1) with raised crop rows from kits/crops, and highland flora.
(function () {
  'use strict';
  var TAU = Math.PI * 2;

  AV.floraHelper = {
    put: function (p) {
      if (typeof BIO === 'undefined' || !BIO.kits || !BIO.kits.nhighlands) return false;
      if (BIO.fn && BIO.fn.reseed && p.seed != null) BIO.fn.reseed(p.seed);
      var dot = p.ref.indexOf('.');
      var kit = p.ref.slice(0, dot), key = p.ref.slice(dot + 1);
      var b = BIO.kitBuilder(kit, key);
      if (!b) return false;
      var T = b.make(p.x, p.y, p.z);
      if (p.scale != null) {
        T.H *= p.scale;
        T.crownR *= p.scale;
        T.rb *= p.scale;
      }
      b.grow(T, 2);
      return T;
    },
    growAll: function (list) {
      var G = new THREE.Group();
      G.name = 'av.flora';
      if (!list || !list.length || typeof BIO === 'undefined' || !BIO.kits || !BIO.kits.nhighlands) return G;
      var saved = BIO.kits, sc = BIO.host.scene, o0 = BIO.owner, rg = BIO.range;
      var planted = 0;
      BIO.owner = null;
      BIO.range = null;
      try {
        list.forEach(function (p) {
          try {
            if (AV.floraHelper.put(p)) {
              planted++;
              if (typeof TAGS !== 'undefined' && TAGS) {
                var spKey = p.ref.split('.')[1];
                TAGS.add({
                  'class': 'flora', key: p.ref, name: 'Highland ' + spKey,
                  at: [p.x, p.y, p.z], size: [4, 4, 9],
                  tags: { biome: 'nhighlands', climate: 'temperate..montane', aridity: 'mild..humid', abyssal: false, riparian: p.zone === 'canal' ? 'yes' : 'both' },
                  frag: '55-av-site-draw.js'
                });
              }
            }
          } catch (e) { /* skip individual bad seed */ }
        });
        BIO.kits = { nhighlands: saved.nhighlands };
        BIO.host.scene = G;
        BIO.bake();
      } finally {
        BIO.kits = saved;
        BIO.host.scene = sc;
        BIO.owner = o0;
        BIO.range = rg;
      }
      G.traverse(function (m) { if (m.isMesh) m.userData.decor = true; });
      G.userData.planted = planted;
      return G;
    }
  };

  // Build heightfield PlaneGeometry & register exact vertex array in KDRAWN.grid
  function makeTerrainPatch(x0, z0, sx, sz, nx, nz, mat) {
    var dx = sx / nx, dz = sz / nz, row = nx + 1;
    var H = new Float32Array((nx + 1) * (nz + 1));
    var geo = new THREE.PlaneGeometry(sx, sz, nx, nz);
    geo.rotateX(-Math.PI / 2);
    geo.translate(x0 + sx * 0.5, 0, z0 + sz * 0.5);
    var pos = geo.attributes.position, uv = geo.attributes.uv;
    var cols = new Float32Array(pos.count * 3);
    for (var iz = 0; iz <= nz; iz++) {
      for (var ix = 0; ix <= nx; ix++) {
        var idx = iz * row + ix;
        var wx = pos.getX(idx), wz = pos.getZ(idx);
        var wy = AV.groundH(wx, wz);
        pos.setY(idx, wy);
        H[idx] = wy;
        uv.setXY(idx, wx / 10.0, wz / 10.0);
        // Multi-scale highland meadow, heather swales, golden sedge, stone canal margins & radial avenues
        var cd = AV.canalDist(wx, wz);
        var dMain = Math.hypot(wx, wz), dInt = Math.hypot(wx + 900, wz + 700), dRui = Math.hypot(wx - 900, wz + 700);
        var nCoarse = KRAND.fbm(wx * 0.0045, wz * 0.0045, 3, 701);
        var nMid = KRAND.fbm(wx * 0.018, wz * 0.018, 2, 733);
        var nFine = KRAND.vnoise(wx * 0.075, wz * 0.075, 1, 769);
        var r = 0.60, g = 0.70, b = 0.50;
        // Radial stone avenues radiating from the 5 non-canal apses out to r = 340 m
        var onAve = false;
        if (dMain >= 184 && dMain <= 350) {
          for (var ak = 1; ak < 8; ak++) {
            if (ak === 2 || ak === 4) continue;
            var aa = ak * (Math.PI / 4), ac = Math.cos(aa), as = Math.sin(aa);
            var along = wx * ac + wz * as, perp = Math.abs(-wx * as + wz * ac);
            if (along > 180 && perp < 6.5) { onAve = true; break; }
          }
        }
        if (cd < 8.5) {
          /* Wet canal stone & shingle margin */
          r = 0.48 + 0.05 * nFine; g = 0.50 + 0.05 * nFine; b = 0.49 + 0.04 * nFine;
        } else if (dMain < 208 || dInt < 222 || dRui < 232 || onAve) {
          /* Paved plaza, courtyard apron & radial stone avenues */
          r = 0.75 + 0.05 * nFine; g = 0.74 + 0.05 * nFine; b = 0.70 + 0.04 * nFine;
        } else if (wy > 18.0) {
          /* Upland rocky heather & crag slopes */
          var rk = Math.min(1, (wy - 18.0) / 38.0);
          r = 0.50 * (1 - rk) + 0.54 * rk + 0.08 * nMid;
          g = 0.58 * (1 - rk) + 0.53 * rk + 0.07 * nMid;
          b = 0.42 * (1 - rk) + 0.49 * rk + 0.06 * nMid;
        } else {
          /* Varied Northern Highlands meadow: lush pasture, warm golden sedge & dark heather patches */
          var sedge = Math.max(0, nCoarse * 2.0 - 0.92);
          var heath = Math.max(0, 0.90 - nCoarse * 2.0);
          r = 0.50 + 0.16 * nMid + 0.06 * nFine + 0.22 * sedge - 0.08 * heath;
          g = 0.62 + 0.15 * nMid + 0.06 * nFine + 0.10 * sedge - 0.12 * heath;
          b = 0.40 + 0.09 * nMid + 0.04 * nFine - 0.04 * sedge - 0.03 * heath;
        }
        cols[idx * 3] = r;
        cols[idx * 3 + 1] = g;
        cols[idx * 3 + 2] = b;
      }
    }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    geo.computeBoundingBox();
    KDRAWN.add(KDRAWN.grid({ x0: x0, z0: z0, dx: dx, dz: dz, nx: nx, nz: nz, h: H }));
    var mesh = new THREE.Mesh(geo, mat);
    mesh.name = 'ground';
    mesh.receiveShadow = true;
    return mesh;
  }

  AV.buildSite = function (seed) {
    var M = AV.mats(), G = new THREE.Group();
    G.name = 'av.site';

    // Fine 4 m inner mesh over the canal & twin-garden zone + 4 non-overlapping outer terrain border patches
    var innerGround = makeTerrainPatch(-520, -520, 1040, 1040, 260, 260, M.turf);
    G.add(innerGround);
    [
      [-2600, -2400, 5200, 1880, 130, 47],
      [-2600, 520, 5200, 1880, 130, 47],
      [-2600, -520, 2080, 1040, 52, 26],
      [520, -520, 2080, 1040, 52, 26]
    ].forEach(function (b) {
      G.add(makeTerrainPatch(b[0], b[1], b[2], b[3], b[4], b[5], M.turf));
    });

    // Build Twin Circular Vegetable & Orchard Gardens, canal quay walls, paths, bridges & crop rows
    var sp = AV.sitePlan(seed == null ? 19690 : seed);
    var B = AV.builder();
    var GD = AV.DIM.GARDENS;

    [GD.west, GD.east].forEach(function (gd) {
      if (typeof TAGS !== 'undefined' && TAGS) {
        TAGS.add({
          'class': 'feature', key: gd.id, name: gd.name,
          at: [gd.cx, 0, gd.cz], size: [gd.r * 2, gd.r * 2, 2.5],
          tags: { culture: 'republican', types: ['farm', 'park'], role: gd.role },
          frag: '55-av-site-draw.js'
        });
      }
      // Central stone fountain & irrigation hub at center of each circular garden
      B.cyl('stone', gd.cx, gd.cz, -0.2, 0.75, 11.5, 11.0, 24, {});
      B.cyl('celadon', gd.cx, gd.cz, 0.70, 1.35, 4.5, 3.8, 16, {});
      // Outer stone retaining curb & 4 radial causeway bridges over the loop canal
      B.cyl('stone', gd.cx, gd.cz, -0.2, 0.45, gd.r + 2.5, gd.r + 2.0, 48, { caps: false });
      for (var br = 0; br < 4; br++) {
        var ba = br * (Math.PI / 2) + (Math.PI / 4);
        var brx = gd.cx + Math.cos(ba) * (gd.r + 11.0), brz = gd.cz + Math.sin(ba) * (gd.r + 11.0);
        B.obox('stone', brx, 0.7, brz, ba + Math.PI / 2, 5.2, 1.1, 16.0, {});
      }
    });

    // Raised curved-sector crop beds with stone curbs, tilled earth, and lush crop ridges!
    sp.beds.forEach(function (bd, idx) {
      var segs = 3;
      for (var k = 0; k < segs; k++) {
        var t0 = bd.a0 + (bd.a1 - bd.a0) * (k / segs), t1 = bd.a0 + (bd.a1 - bd.a0) * ((k + 1) / segs);
        var tm = (t0 + t1) * 0.5, rm = (bd.r0 + bd.r1) * 0.5;
        var arcW = (t1 - t0) * rm, radD = bd.r1 - bd.r0;
        var bx = bd.cx + rm * Math.cos(tm), bz = bd.cz + rm * Math.sin(tm), yaw = tm + Math.PI / 2;
        B.obox('stone', bx, 0.18, bz, yaw, arcW + 0.5, 0.55, radD + 0.5, {});
        B.obox('tilled', bx, 0.44, bz, yaw, arcW - 0.3, 0.18, radD - 0.3, {});
        // Three lush crop ridges per sector bed, tinted by crop family
        var hueShift = ((idx + k) % 4) * 0.06;
        var cCol = bd.role === 'vegetable'
          ? [0.42 + hueShift, 0.68 + hueShift * 0.5, 0.34]
          : [0.58 + hueShift, 0.66, 0.32 + hueShift * 0.4];
        for (var rr = -1; rr <= 1; rr++) {
          var rOff = rr * (radD * 0.28);
          var rx = bd.cx + (rm + rOff) * Math.cos(tm), rz = bd.cz + (rm + rOff) * Math.sin(tm);
          B.obox('turf', rx, 0.68, rz, yaw, arcW - 0.8, 0.48, radD * 0.16, { col: cCol });
        }
      }
    });

    // Paved aprons around the Intact (-900, -700) and Ruined (+900, -700) showcase sites + stone canal bollards
    [[-900, -700], [900, -700]].forEach(function (st) {
      B.cyl('pave', st[0], st[1], -0.25, 0.12, 224.0, 222.0, 16, {});
    });
    // Canal quay revetments, broad stone towpaths & bollards along South Tailrace Spillway (z = 186 .. 462)
    for (var cz = 190; cz <= 456; cz += 22) {
      [-1, 1].forEach(function (sgn) {
        B.box('stone', sgn * 8.4 - 0.9, sgn * 8.4 + 0.9, -3.1, 0.55, cz - 11.2, cz + 11.2, {});
        B.box('stone', sgn * 9.6 - 0.35, sgn * 9.6 + 0.35, 0.4, 1.25, cz - 0.35, cz + 0.35, {});
        B.box('pave', sgn * 16.5 - 7.0, sgn * 16.5 + 7.0, -0.18, 0.18, cz - 11.2, cz + 11.2, {});
      });
    }
    // Pedestrian & towpath stone arch bridge across the lower South Tailrace Canal at z = 230 m
    B.box('stone', -12.5, 12.5, 2.35, 3.15, 226.5, 233.5, {});
    B.box('stone', -15.0, -11.5, -0.2, 2.55, 226.5, 233.5, {});
    B.box('stone', 11.5, 15.0, -0.2, 2.55, 226.5, 233.5, {});
    B.box('iron', -12.5, 12.5, 3.15, 4.15, 226.3, 226.7, {});
    B.box('iron', -12.5, 12.5, 3.15, 4.15, 233.3, 233.7, {});

    // ---- Monumental Southern Elevated Headrace Aqueduct Viaduct (z = 186.2 .. 482.0 m, y_water = 32.3 -> 31.8 m) ----
    var HY = AV.DIM.HYDRO;
    if (typeof TAGS !== 'undefined' && TAGS) {
      TAGS.add({
        'class': 'infrastructure', key: 'av.site.aqueduct.south',
        name: 'Southern Elevated Headrace Aqueduct Viaduct',
        at: [0, HY.aqueductY * 0.5, 332], size: [25.0, 296.0, HY.aqueductY + 4.0],
        tags: { culture: 'republican', state: 'reclaimed', types: ['infrastructure', 'industry'], role: 'aqueduct' },
        frag: '55-av-site-draw.js'
      });
    }
    var pierZs = [];
    for (var pzA = 192.0; pzA <= 478.0; pzA += 26.0) pierZs.push(pzA);
    for (var pi = 0; pi < pierZs.length; pi++) {
      var az = pierZs[pi];
      var slopeOff = ((az - 186.0) / 290.0) * 0.5;
      var bedHere = HY.aqueductBedY + slopeOff;
      // Paired cyclopean stone & board-concrete piers at x = +-10.8 m straddling the 14 m lower tailrace canal!
      [-10.8, 10.8].forEach(function (px) {
        B.box('stone', px - 1.85, px + 1.85, -0.6, 14.5, az - 2.3, az + 2.3, {});
        B.box('concrete', px - 1.55, px + 1.55, 14.3, bedHere + 0.2, az - 1.9, az + 1.9, {});
        B.box('iron', px - 1.95, px + 1.95, 14.1, 14.8, az - 2.4, az + 2.4, {});
      });
      // Transverse soaring arch spanning across the lower tailrace canal between the paired piers (y = 19.5 .. 28.6 m)
      var nArch = 6;
      for (var ai = 0; ai < nArch; ai++) {
        var u0 = ai / nArch, u1 = (ai + 1) / nArch;
        var ang0 = Math.PI * (1 - u0), ang1 = Math.PI * (1 - u1);
        var xA0 = Math.cos(ang0) * 9.4, yA0 = 20.2 + Math.sin(ang0) * 7.8;
        var xA1 = Math.cos(ang1) * 9.4, yA1 = 20.2 + Math.sin(ang1) * 7.8;
        B.beam('stone', [xA0, yA0, az], [xA1, yA1, az], 2.8, 1.8, {});
      }
      B.box('concrete', -12.2, 12.2, bedHere - 1.4, bedHere + 0.1, az - 2.1, az + 2.1, {});

      // Longitudinal viaduct arches along x = +-10.8 m between consecutive piers!
      if (pi + 1 < pierZs.length) {
        var azNext = pierZs[pi + 1], zMid = (az + azNext) * 0.5, zHalf = (azNext - az) * 0.5 - 1.6;
        [-10.8, 10.8].forEach(function (px) {
          for (var li = 0; li < 6; li++) {
            var v0 = li / 6, v1 = (li + 1) / 6;
            var la0 = Math.PI * (1 - v0), la1 = Math.PI * (1 - v1);
            var zL0 = zMid - Math.cos(la0) * zHalf, yL0 = 19.2 + Math.sin(la0) * 8.6;
            var zL1 = zMid - Math.cos(la1) * zHalf, yL1 = 19.2 + Math.sin(la1) * 8.6;
            B.beam('stone', [px, yL0, zL0], [px, yL1, zL1], 1.75, 2.2, {});
          }
        });
      }
    }
    // Continuous elevated stone & riveted-iron Headrace Flume Trough + towpath catwalks (z = 186.2 .. 480.0 m)
    B.box('concrete', -8.8, 8.8, HY.aqueductBedY - 1.1, HY.aqueductBedY + 0.55, 186.2, 480.0, {});
    B.box('stone', -9.2, -5.85, HY.aqueductBedY + 0.4, HY.aqueductY + 1.65, 186.2, 480.0, {});
    B.box('stone', 5.85, 9.2, HY.aqueductBedY + 0.4, HY.aqueductY + 1.65, 186.2, 480.0, {});
    B.box('iron', -9.45, -8.95, HY.aqueductY + 1.6, HY.aqueductY + 2.65, 186.2, 480.0, {});
    B.box('iron', 8.95, 9.45, HY.aqueductY + 1.6, HY.aqueductY + 2.65, 186.2, 480.0, {});
    // Upland Reservoir Intake Headwall & Spillway Bastion at z = 476 .. 488 m (grounded to y = -0.6 m)
    B.box('stone', -14.5, 14.5, -0.6, HY.aqueductY + 3.8, 477.5, 488.0, {});
    B.box('iron', -9.5, 9.5, HY.aqueductY + 3.6, HY.aqueductY + 5.2, 476.8, 482.0, {});

    // ---- Three Sluice-Gate Houses & Barge Locks (sp.sluices) ----
    (sp.sluices || []).forEach(function (sl) {
      if (typeof TAGS !== 'undefined' && TAGS) {
        TAGS.add({
          'class': 'infrastructure', key: sl.id, name: sl.name,
          at: [sl.x, sl.y == null ? 0 : sl.y, sl.z], size: [22.0, 16.0, 14.0],
          tags: { culture: 'republican', state: 'reclaimed', types: ['infrastructure', 'industry'], role: 'sluice' },
          frag: '55-av-site-draw.js'
        });
      }
      if (sl.y != null && sl.y > 10) {
        // South Aqueduct Headgate Sluice-Tower astride the elevated aqueduct at z = 188 m!
        var sy = sl.y;
        [-10.4, 10.4].forEach(function (sx) {
          B.box('stone', sx - 2.2, sx + 2.2, sy - 1.2, sy + 11.2, sl.z - 4.2, sl.z + 4.2, {});
          B.box('white', sx - 1.9, sx + 1.9, sy + 3.0, sy + 10.6, sl.z - 3.8, sl.z + 3.8, {});
        });
        // Gatehouse gallery spanning over the elevated headrace channel (y = sy + 6.4 .. sy + 11.8 m)
        B.box('timber', -12.2, 12.2, sy + 6.4, sy + 10.8, sl.z - 3.6, sl.z + 3.6, {});
        B.box('celadon', -13.0, 13.0, sy + 10.6, sy + 12.2, sl.z - 4.4, sl.z + 4.4, {});
        // Three vertical forged-iron sluice-gate racks & handwheels
        [-3.8, 0.0, 3.8].forEach(function (gx) {
          B.box('iron', gx - 0.35, gx + 0.35, sy + 0.2, sy + 9.5, sl.z - 0.35, sl.z + 0.35, {});
          B.cyl('bronze', gx, sl.z, sy + 7.2, sy + 7.6, 0.95, 0.95, 10, {});
        });
      } else {
        // East & West Tailrace Sluice Houses & Navigable Barge Locks at (x = +-142, z = 0)
        [-9.8, 9.8].forEach(function (sz) {
          B.box('stone', sl.x - 7.5, sl.x + 7.5, -3.2, 6.2, sz - 2.2, sz + 2.2, {});
        });
        // Overhead lock-keeper's control bridge leaving y = -0.8 .. 5.4 m clear over the 14 m canal for barges!
        B.box('iron', sl.x - 5.2, sl.x + 5.2, 5.4, 6.2, -11.6, 11.6, {});
        B.box('timber', sl.x - 4.6, sl.x + 4.6, 6.1, 9.4, -9.2, 9.2, {});
        B.box('glassRep', sl.x - 4.75, sl.x + 4.75, 6.9, 8.6, -6.5, 6.5, {});
        B.box('celadon', sl.x - 5.5, sl.x + 5.5, 9.3, 10.7, -10.2, 10.2, {});
        // Twin lock-gate balance beams & iron winch standards
        [-3.2, 3.2].forEach(function (gz) {
          B.box('iron', sl.x - 6.8, sl.x - 6.1, 0.4, 7.2, gz - 0.35, gz + 0.35, {});
          B.box('iron', sl.x + 6.1, sl.x + 6.8, 0.4, 7.2, gz - 0.35, gz + 0.35, {});
        });
      }
    });

    // ---- Four Moored Industrial & Agricultural Cargo Barges (sp.barges) ----
    var wy = AV.DIM.CANAL_WATER_Y;
    (sp.barges || []).forEach(function (bg) {
      if (typeof TAGS !== 'undefined' && TAGS) {
        TAGS.add({
          'class': 'prop', key: bg.id, name: bg.name,
          at: [bg.x, wy, bg.z], size: [bg.L, bg.B, 3.2],
          tags: { culture: 'republican', types: ['infrastructure', 'industry'], role: bg.cargo },
          frag: '55-av-site-draw.js'
        });
      }
      // Yaw convention: local X along barge length L when yaw = 0, local Z across beam B
      var bYaw = bg.yaw;
      var cY = Math.cos(bYaw), sY = Math.sin(bYaw);
      function BP(lx, ly, lz) { return [bg.x + lx * cY - lz * sY, ly, bg.z + lx * sY + lz * cY]; }

      // Flat-bottomed riveted-iron & pitched-timber canal hull + tapered bow/stern rakes + coaming
      B.obox('dark', bg.x, wy + 0.05, bg.z, bYaw, bg.L * 0.78, 1.55, bg.B, {});
      var bow = BP(bg.L * 0.44, wy + 0.22, 0), stern = BP(-bg.L * 0.44, wy + 0.22, 0);
      B.obox('iron', bow[0], bow[1], bow[2], bYaw, bg.L * 0.16, 1.25, bg.B * 0.76, {});
      B.obox('iron', stern[0], stern[1], stern[2], bYaw, bg.L * 0.16, 1.25, bg.B * 0.82, {});
      B.obox('timber', bg.x, wy + 0.92, bg.z, bYaw, bg.L * 0.82, 0.32, bg.B + 0.22, {});
      // Aft steersman's deckhouse & warm signal lantern
      var cab = BP(-bg.L * 0.30, wy + 1.65, 0), lan = BP(-bg.L * 0.30, wy + 2.65, 0);
      B.obox('timber', cab[0], cab[1], cab[2], bYaw, 3.6, 1.55, bg.B * 0.72, {});
      B.obox('celadon', cab[0], wy + 2.52, cab[2], bYaw, 4.0, 0.28, bg.B * 0.80, {});
      B.obox('repGlow', lan[0], wy + 2.82, lan[2], bYaw, 0.42, 0.45, 0.42, {});

      // Cargo hold load forward of the deckhouse (+0.08 * L)
      var hold = BP(bg.L * 0.10, wy + 1.38, 0);
      if (bg.cargo === 'ore') {
        B.obox('stone', hold[0], hold[1], hold[2], bYaw, bg.L * 0.48, 1.15, bg.B * 0.72, { col: [0.64, 0.34, 0.22] });
        B.obox('stone', hold[0], hold[1] + 0.55, hold[2], bYaw, bg.L * 0.32, 0.65, bg.B * 0.48, { col: [0.72, 0.38, 0.24] });
      } else if (bg.cargo === 'timber') {
        for (var tl = -1; tl <= 1; tl++) {
          var lp = BP(bg.L * 0.10, wy + 1.28, tl * (bg.B * 0.22));
          B.obox('timber', lp[0], lp[1], lp[2], bYaw, bg.L * 0.50, 0.58, 0.62, {});
        }
        var lpTop = BP(bg.L * 0.10, wy + 1.78, 0);
        B.obox('timber', lpTop[0], lpTop[1], lpTop[2], bYaw, bg.L * 0.46, 0.55, bg.B * 0.44, {});
      } else if (bg.cargo === 'ingots') {
        [-0.14, 0.14].forEach(function (uOff) {
          var ip = BP(bg.L * (0.10 + uOff), wy + 1.32, 0);
          B.obox('iron', ip[0], ip[1], ip[2], bYaw, 3.4, 0.85, bg.B * 0.66, {});
          B.obox('bronze', ip[0], ip[1] + 0.52, ip[2], bYaw, 2.8, 0.45, bg.B * 0.52, {});
        });
      } else {
        B.obox('white', hold[0], hold[1], hold[2], bYaw, bg.L * 0.46, 1.05, bg.B * 0.70, { col: [0.84, 0.76, 0.56] });
        B.obox('white', hold[0], hold[1] + 0.52, hold[2], bYaw, bg.L * 0.34, 0.52, bg.B * 0.52, { col: [0.88, 0.80, 0.60] });
      }
    });

    var hardscape = B.finish('av.hardscape');
    G.add(hardscape);

    // Grow northern-highlands orchard, canal & rooftop trees
    var floraGroup = AV.floraHelper.growAll(sp.flora);
    G.add(floraGroup);
    G.userData = {
      crops: sp.crops,
      beds: sp.beds.length,
      sluices: sp.sluices.length,
      barges: sp.barges.length,
      floraPlanted: floraGroup.userData.planted || 0,
      innerGround: innerGround
    };
    return G;
  };
})();
