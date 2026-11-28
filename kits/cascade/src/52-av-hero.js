// ================================================================= ARCVILLAGE — 220 m hydropowered industrial arcology hero builder  [draw]
// Draws a complete Arcvillage complex from its [G data] plan record (AV.plan):
//   - Base octagonal bastions, tailrace canal portals, quays, bridges & Great Central Hydropower Industrial Hall
//     (elevated headrace aqueduct at y = 31.8 m, surge headbox, 4 overshot hydro-wheels, 4 bevel-gear towers,
//     overhead line-shafts, twin high-pressure penstocks, 4 scroll-case hydro-dynamos, 2 reciprocating trip-hammers,
//     2 blast cupola smelting furnaces, and an overhead travelling bridge ladle crane)
//   - 8 monumental coffered quarter-sphere carved apses (w 72 m, h 68 m) with 6 stepped living/artisan terrace bowls
//   - 12 cylindrical skyscraper column-towers (4 inner with copper/arc busbars to 198 m, 8 outer to 176.4 m)
//   - Recessed arched waist (y = 72.0 .. 86.4 m), mid-level rings & 8 spoke sky-bridges, cantilevered upper collar
//     (y = 136.8 .. 172.8 m) with Cultural Center vaults, Sky-Pad, Playgrounds & sunken Rooftop Botanical Cloister
//   - 5-tier stepped Faceted Pyramidal Crown (y = 172.8 .. 220.0 m, Sheet 1 #2 motif) with 4 cardinal skylight arches
//   - Three states: Iron Republic refurbished, Ancient intact, and Post-Cataclysm ruined (KRUBBLE mounds, KRUINS).
(function () {
  'use strict';
  var TAU = Math.PI * 2;

  function stainFn(seed, strength) {
    return function (x, y, z, base) {
      var n1 = KRAND.vnoise(x * 0.04, y * 0.035, z * 0.04, seed);
      var n2 = KRAND.vnoise(x * 0.012, y * 0.015, z * 0.012, seed + 13);
      var k = 1.0 - strength * (0.14 + 0.48 * Math.max(0, n1 - 0.4) + 0.28 * Math.max(0, n2 - 0.48));
      return [base[0] * k, base[1] * k * 0.98, base[2] * k * 0.94];
    };
  }

  // Build KRUBBLE heap BufferGeometry into a Group for the ruined state
  function buildRubbleGroup(P, gx, gz) {
    var G = new THREE.Group(), M = AV.mats();
    G.name = P.id + '.rubble';
    var heaps = [];
    (P.debris || []).forEach(function (d, idx) {
      var H = KRUBBLE.heap({
        id: d.id, x: d.x, z: d.z, y0: 0,
        rx: d.rx, rz: d.rz, ry: d.yaw, h: d.h,
        seed: d.seed, lumps: 5, blocks: 14, size: [1.8, 4.8], cover: 4.5
      });
      heaps.push(H);
      var md = KRUBBLE.mesh(H, { cell: 3.5 });
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(md.pos, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(md.uv, 2));
      var nv = md.pos.length / 3, cols = new Float32Array(nv * 3);
      for (var i = 0; i < nv; i++) {
        var oc = 0.45 + 0.55 * (md.occ ? md.occ[i] : 0.8);
        var pt = md.part ? md.part[i] : 0;
        cols[i * 3] = oc * (pt === 1 ? 0.92 : 0.82);
        cols[i * 3 + 1] = oc * (pt === 1 ? 0.90 : 0.79);
        cols[i * 3 + 2] = oc * (pt === 1 ? 0.86 : 0.75);
      }
      geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      geo.setIndex(nv > 65535 ? new THREE.Uint32BufferAttribute(md.idx, 1) : new THREE.Uint16BufferAttribute(md.idx, 1));
      geo.computeVertexNormals();
      geo.computeBoundingBox();
      geo.computeBoundingSphere();
      var mesh = new THREE.Mesh(geo, M.rubble);
      mesh.name = d.id;
      mesh.userData.cap = true;
      mesh.userData.decor = true;
      G.add(mesh);

      // Fallen column drum / structural rib segments seated on y = 0 beside the mound
      var B = AV.builder();
      for (var dr = 0; dr < d.drums; dr++) {
        var ang = d.yaw + (dr - 0.5) * 0.55;
        var fx = d.x + Math.cos(ang) * (d.rx + 4.5 + dr * 6.0);
        var fz = d.z + Math.sin(ang) * (d.rz + 4.5 + dr * 6.0);
        /* Seated cleanly on y = 0: bottom at -0.15 m, height 4.2 m */
        B.obox('concrete', fx, 1.95, fz, ang + 0.4, 8.5, 4.2, 5.2, { col: [0.76, 0.74, 0.70] });
        B.obox('bronze', fx, 4.15, fz, ang + 0.4, 8.8, 0.45, 5.5, { col: [0.65, 0.55, 0.42] });
      }
      var dg = B.finish(d.id + '.wrecks');
      while (dg.children.length) G.add(dg.children[0]);
      if (typeof TAGS !== 'undefined' && TAGS) {
        TAGS.add({
          'class': 'feature', key: d.id, name: 'Collapsed Arcology Rubble Mound ' + (idx + 1),
          at: [gx + d.x, 0, gz + d.z], size: [d.rx * 2, d.rz * 2, d.h],
          tags: { culture: 'ancient', state: 'ruined' }, frag: '52-av-hero.js'
        });
      }
    });
    G.userData.heaps = heaps;
    return G;
  }

  AV.buildHero = function (P, opts) {
    opts = opts || {};
    var gx = opts.x == null ? 0 : opts.x, gz = opts.z == null ? 0 : opts.z, gy = opts.y == null ? 0 : opts.y;
    var D = P.dim, state = P.state;
    var isRep = state === 'refurbished', isRuin = state === 'ruined', isIntact = state === 'intact';
    var B = AV.builder();
    var stOpt = isRuin ? { colFn: stainFn(P.seed + 19, 0.46), col: [0.88, 0.86, 0.82] } : isRep ? { colFn: stainFn(P.seed + 7, 0.16), col: [0.95, 0.94, 0.91] } : { col: [1, 1, 1] };
    var trimMat = isRep ? 'iron' : 'bronze';
    var winMat = isRuin ? 'glassRuin' : isRep ? 'glassRep' : 'glassAnc';
    var glowMat = isRuin ? 'cyanDead' : isRep ? 'repGlow' : 'cyan';

    // Register complex and sub-structures in KTAGS before drawing (README.md rule)
    var tagState = isRep ? 'reclaimed' : isRuin ? 'ruined' : 'intact';
    var tagCulture = isRep ? 'republican' : 'ancient';
    var rootTag = null;
    if (typeof TAGS !== 'undefined' && TAGS) {
      rootTag = TAGS.add({
        'class': 'building',
        key: P.id,
        name: P.name,
        at: [gx, gy, gz],
        size: [D.APOTHEM_CARD * 2, D.APOTHEM_CARD * 2, D.H_TOTAL],
        tags: {
          culture: tagCulture,
          state: tagState,
          types: ['dwelling-multi', 'civic', 'industry', 'market', 'farm', 'park'],
          landmark: true
        },
        frag: '52-av-hero.js'
      });
      REGISTER({ name: P.name, kind: 'building', cls: 'building', x: gx, y: gy, z: gz, r: D.APOTHEM_DIAG, h: D.H_TOTAL, tags: { culture: tagCulture, state: tagState } });
    }
    function tagPart(key, name, x, y, z, w, d, h, role) {
      if (rootTag && typeof TAGS !== 'undefined' && TAGS) {
        TAGS.child(rootTag.id, {
          'class': 'part', key: key, name: name, at: [gx + x, gy + y, gz + z], size: [w, d, h],
          tags: { culture: tagCulture, state: tagState, role: role }, frag: '52-av-hero.js'
        });
      }
    }

    // ---- 1. Ground Plinth, Canal Quays, Bridges & Suspended CITY CENTER Forum (y = -3.2 .. +12.8 m) ----
    // Octagonal ground terrace ring around the central water basin (leaving canal trenches open on E=0, S=2, W=4)
    var bh = D.BASIN_HALF, cw2 = D.CANAL_W * 0.5;
    // Four quadrant ground courts between the E/S/W canals (continuous down to -0.3 m so main body sits on ground)
    var quads = [
      [cw2, 142, cw2, 142],
      [-142, -cw2, cw2, 142],
      [-142, -cw2, -142, -cw2],
      [cw2, 142, -142, -cw2]
    ];
    quads.forEach(function (q) {
      B.box('pave', q[0], q[1], -0.35, 0.35, q[2], q[3], stOpt);
    });
    // North ground court (no canal on North, -z)
    B.box('pave', -cw2 - 0.5, cw2 + 0.5, -0.35, 0.35, -142, -bh, stOpt);
    // Stone quay walls lining the central water basin & canal channels
    B.box('stone', -bh - 2.2, -bh, -3.3, 0.65, -bh - 2.2, -cw2, stOpt);
    B.box('stone', bh, bh + 2.2, -3.3, 0.65, -bh - 2.2, -cw2, stOpt);
    B.box('stone', -bh - 2.2, bh + 2.2, -3.3, 0.65, -bh - 2.2, -bh, stOpt);
    // Three stone footbridges across the E, S, W canals near the central basin, with grounded abutment piers to y = -0.35 m
    B.box('stone', -cw2 - 2.4, cw2 + 2.4, 1.4, 2.2, bh + 6, bh + 12, stOpt);
    B.box('stone', -cw2 - 2.4, -cw2 - 0.2, -0.35, 1.55, bh + 6, bh + 12, stOpt);
    B.box('stone', cw2 + 0.2, cw2 + 2.4, -0.35, 1.55, bh + 6, bh + 12, stOpt);

    B.box('stone', bh + 6, bh + 12, 1.4, 2.2, -cw2 - 2.4, cw2 + 2.4, stOpt);
    B.box('stone', bh + 6, bh + 12, -0.35, 1.55, -cw2 - 2.4, -cw2 - 0.2, stOpt);
    B.box('stone', bh + 6, bh + 12, -0.35, 1.55, cw2 + 0.2, cw2 + 2.4, stOpt);

    B.box('stone', -bh - 12, -bh - 6, 1.4, 2.2, -cw2 - 2.4, cw2 + 2.4, stOpt);
    B.box('stone', -bh - 12, -bh - 6, -0.35, 1.55, -cw2 - 2.4, -cw2 - 0.2, stOpt);
    B.box('stone', -bh - 12, -bh - 6, -0.35, 1.55, cw2 + 0.2, cw2 + 2.4, stOpt);

    // ---- 1b. Great Central Hydropower Industrial Hall Structural Decks & Internal Aqueduct (y = -3.3 .. 48.0 m) ----
    var fh0 = D.FORUM_Y - 0.8, fh1 = D.FORUM_Y, fr = 58.0, pitX = 18.0, pitZ0 = -6.0, pitZ1 = 19.0;
    // L1 Heavy Foundry & Dynamo Powerhouse Floor at y = 6.0 m around the Central Cataract & Wheel Pit
    B.box('concrete', -fr, fr, fh0, fh1, -fr, pitZ0, stOpt);
    B.box('concrete', -fr, fr, fh0, fh1, pitZ1, fr, stOpt);
    B.box('concrete', -fr, -pitX, fh0, fh1, pitZ0, pitZ1, stOpt);
    B.box('concrete', pitX, fr, fh0, fh1, pitZ0, pitZ1, stOpt);
    // Forged-iron safety balustrade & glowing rim around the Central Cataract Pit
    B.box(trimMat, -pitX - 0.6, pitX + 0.6, fh1, fh1 + 1.2, pitZ0 - 0.6, pitZ0, stOpt);
    B.box(trimMat, -pitX - 0.6, pitX + 0.6, fh1, fh1 + 1.2, pitZ1, pitZ1 + 0.6, stOpt);
    B.box(trimMat, -pitX - 0.6, -pitX, fh1, fh1 + 1.2, pitZ0, pitZ1, stOpt);
    B.box(trimMat, pitX, pitX + 0.6, fh1, fh1 + 1.2, pitZ0, pitZ1, stOpt);
    B.box(glowMat, -pitX - 0.7, pitX + 0.7, fh0 + 0.15, fh0 + 0.45, pitZ0 - 0.7, pitZ0 - 0.4, {});

    // Two Tiered Industrial Mezzanine Galleries (y = 16.2 m and y = 26.4 m) overlooking the roaring cataract & wheels
    [16.2, 26.4].forEach(function (gyM, gi) {
      var mIn = 34.0 + gi * 2.0;
      if (isRuin && gi === 1) return;
      B.box('concrete', -fr, fr, gyM - 0.65, gyM, -fr, -mIn, stOpt);
      B.box('concrete', -fr, -mIn, gyM - 0.65, gyM, -mIn, 24.0, stOpt);
      B.box('concrete', mIn, fr, gyM - 0.65, gyM, -mIn, 24.0, stOpt);
      B.box(trimMat, -mIn - 0.5, mIn + 0.5, gyM, gyM + 1.15, -mIn - 0.5, -mIn, stOpt);
      B.box(trimMat, -mIn - 0.5, -mIn, gyM, gyM + 1.15, -mIn, 24.0, stOpt);
      B.box(trimMat, mIn, mIn + 0.5, gyM, gyM + 1.15, -mIn, 24.0, stOpt);
    });
    // Full-height grounded steel/concrete hall columns supporting L1 and both mezzanine galleries (y = -3.3 .. 27.0 m)
    [-54, -36, 36, 54].forEach(function (px) {
      [-52, -36, 0, 22, 44].forEach(function (pz) {
        if (Math.abs(px) < 22 && pz > -10) return;
        var topCol = (isRuin && pz < -30) ? fh1 : (pz > 24 ? fh1 : 26.8);
        B.box('concrete', px - 1.6, px + 1.6, -3.3, topCol, pz - 1.6, pz + 1.6, stOpt);
      });
    });
    tagPart('av.central.hall', isRep ? 'Great Central Assembly and Hydropower Hall' : 'Great Central Ancient Dynamo Hall', 0, D.FORUM_Y, -8, fr * 2, fr * 2, 42.0, 'industry');

    // Internal Elevated Headrace Aqueduct Viaduct (refurbished hydropower replacement only: z = 186.0 .. 16.5 m, y_water = 31.8 m)
    if (P.hydroHall) {
      var HY = D.HYDRO;
      for (var az = 24.0; az <= 180.0; az += 26.0) {
        [-8.4, 8.4].forEach(function (ax) {
          B.box('stone', ax - 1.6, ax + 1.6, -0.45, HY.aqueductBedY + 0.4, az - 2.0, az + 2.0, stOpt);
        });
        B.box('stone', -10.0, 10.0, HY.aqueductBedY - 2.2, HY.aqueductBedY + 0.2, az - 2.2, az + 2.2, stOpt);
      }
      B.box('stone', -7.6, 7.6, HY.aqueductBedY - 0.9, HY.aqueductBedY + 0.1, 16.5, 186.5, stOpt);
      B.box(trimMat, -7.8, -5.9, HY.aqueductBedY, HY.aqueductY + 1.5, 16.5, 186.5, stOpt);
      B.box(trimMat, 5.9, 7.8, HY.aqueductBedY, HY.aqueductY + 1.5, 16.5, 186.5, stOpt);

      // Central Bifurcated Surge Headbox & Cataract Sluice Flume at z = 15.0 .. 24.5 m (grounded by 4 heavy steel legs to y = -3.3 m)
      [-20.5, 20.5].forEach(function (hx) {
        [15.8, 23.8].forEach(function (hz) {
          B.box('concrete', hx - 1.6, hx + 1.6, -3.3, HY.aqueductBedY + 0.4, hz - 1.6, hz + 1.6, stOpt);
        });
      });
      B.box('stone', -22.0, 22.0, HY.aqueductBedY - 1.2, HY.aqueductBedY + 0.1, 15.2, 24.8, stOpt);
      B.box(trimMat, -22.2, 22.2, HY.aqueductBedY, HY.aqueductY + 1.8, 23.4, 25.0, stOpt);
      B.box(trimMat, -22.2, -20.4, HY.aqueductBedY, HY.aqueductY + 1.8, 15.2, 25.0, stOpt);
      B.box(trimMat, 20.4, 22.2, HY.aqueductBedY, HY.aqueductY + 1.8, 15.2, 25.0, stOpt);
      // North face of Surge Headbox with 3 open cataract sluice mouths (main x = -4.8..4.8, chutes x = +-11.8..+-15.0)
      B.box(trimMat, -20.6, -15.2, HY.aqueductBedY, HY.aqueductY + 1.8, 15.0, 16.6, stOpt);
      B.box(trimMat, -11.6, -5.0, HY.aqueductBedY, HY.aqueductY + 1.8, 15.0, 16.6, stOpt);
      B.box(trimMat, 5.0, 11.6, HY.aqueductBedY, HY.aqueductY + 1.8, 15.0, 16.6, stOpt);
      B.box(trimMat, 15.2, 20.6, HY.aqueductBedY, HY.aqueductY + 1.8, 15.0, 16.6, stOpt);
      B.box('iron', -16.5, 16.5, HY.aqueductY + 2.8, HY.aqueductY + 3.6, 15.2, 16.4, stOpt);
    }

    // ---- 2. Eight Carved Stepped Apses & Corner Bastion Piers (y = 0 .. 72.0 m) ----
    P.apses.forEach(function (ap) {
      var th = ap.th, c = Math.cos(th), s = Math.sin(th);
      var yaw = th + Math.PI / 2;
      /* Local apse frame: u across face, w outward along face normal (c, s): x = w*c - u*s, z = w*s + u*c */
      function AP(u, y, w) { return [w * c - u * s, y, w * s + u * c]; }
      var rm = ap.rMouth, hw = ap.hw, ch = ap.crownY;

      // Solid flanking bastion piers on both sides of the apse mouth, rising from -0.35 m to 72.5 m (links into Waist!)
      [-1, 1].forEach(function (sgn) {
        var uPier = sgn * (hw + 16.0);
        var pp = AP(uPier, 36.0, rm - 18.0);
        B.obox('concrete', pp[0], 36.1, pp[2], yaw, 28.0, 72.8, 36.0, stOpt);
        B.obox('white', pp[0], 38.0, pp[2], yaw, 24.0, 62.0, 36.6, stOpt);
      });
      var spMid = AP(0, (ch + 72.4) * 0.5, rm - 6.0);
      B.obox('concrete', spMid[0], (ch + 72.4) * 0.5, spMid[2], yaw, (hw + 30.0) * 2, 72.4 - ch + 2.0, 14.0, stOpt);

      // Structural back-wall behind the apse bowl (excluding ground canal/street portal, plus upper aqueduct arch on South k=2!)
      var bw = ap.rBack;
      var pW = ap.canal ? D.APSE.portalW : D.APSE.gateW, pH = ap.canal ? D.APSE.portalH : D.APSE.gateH;
      [-1, 1].forEach(function (sgn) {
        var uw = (hw - pW * 0.5) * 0.5 + pW * 0.5;
        var pm = AP(sgn * uw, 36.0, bw);
        B.obox('concrete', pm[0], 36.1, pm[2], yaw, hw - pW * 0.5 + 2.0, 72.6, 6.0, stOpt);
      });
      if (ap.aqueduct) {
        /* South Apse: lower lintel between tailrace canal (10.5 m) and aqueduct bed (28.0 m), then upper lintel above aqueduct (40.5..72.4 m)! */
        var lLow = AP(0, (pH + 28.0) * 0.5, bw);
        B.obox('concrete', lLow[0], (pH + 28.0) * 0.5, lLow[2], yaw, pW + 2.0, 28.0 - pH, 6.0, stOpt);
        var lHigh = AP(0, (40.5 + 72.4) * 0.5, bw);
        B.obox('concrete', lHigh[0], (40.5 + 72.4) * 0.5, lHigh[2], yaw, pW + 2.0, 72.4 - 40.5, 6.0, stOpt);
        var aqT = AP(0, 40.5, bw);
        B.obox(trimMat, aqT[0], 40.5, aqT[2], yaw, pW + 3.6, 1.8, 7.6, stOpt);
      } else {
        var lint = AP(0, (pH + 72.4) * 0.5, bw);
        B.obox('concrete', lint[0], (pH + 72.4) * 0.5, lint[2], yaw, pW + 2.0, 72.4 - pH, 6.0, stOpt);
      }
      // Portal bronze/iron arch frame
      var pfL = AP(-pW * 0.5 - 0.8, pH * 0.5, bw), pfR = AP(pW * 0.5 + 0.8, pH * 0.5, bw), pfT = AP(0, pH + 0.8, bw);
      B.obox(trimMat, pfL[0], pH * 0.5, pfL[2], yaw, 1.8, pH + 1.6, 7.2, stOpt);
      B.obox(trimMat, pfR[0], pH * 0.5, pfR[2], yaw, 1.8, pH + 1.6, 7.2, stOpt);
      B.obox(trimMat, pfT[0], pH + 0.8, pfT[2], yaw, pW + 3.6, 1.8, 7.2, stOpt);

      // Coffered Half-Dome / Quarter-Sphere Arch Ribs (Soleri's signature gridded apse shells on Sheet 3 #1!)
      var nMerid = 9, nRings = 6;
      for (var mi = 0; mi < nMerid; mi++) {
        var phi = -Math.PI * 0.46 + (mi / (nMerid - 1)) * Math.PI * 0.92;
        for (var ri = 0; ri < nRings; ri++) {
          if (ap.breached && ri >= 4 && Math.abs(mi - 4) <= 2) continue;
          var e0 = (ri / nRings) * (Math.PI * 0.5), e1 = ((ri + 1) / nRings) * (Math.PI * 0.5);
          var u0 = Math.sin(phi) * Math.cos(e0) * hw, y0 = Math.sin(e0) * ch, w0 = rm - (1 - Math.cos(phi) * Math.cos(e0)) * 28.0;
          var u1 = Math.sin(phi) * Math.cos(e1) * hw, y1 = Math.sin(e1) * ch, w1 = rm - (1 - Math.cos(phi) * Math.cos(e1)) * 28.0;
          if (y0 < pH && Math.abs(u0) < pW * 0.55) continue;
          if (ap.aqueduct && y0 > 26.0 && y0 < 41.0 && Math.abs(u0) < 10.5) continue;
          B.beam('concrete', AP(u0, Math.max(-0.2, y0), w0), AP(u1, y1, w1), 1.9, 2.4, stOpt);
        }
      }
      for (var rj = 1; rj <= nRings; rj++) {
        var el = (rj / nRings) * (Math.PI * 0.48);
        for (var mj = 0; mj < nMerid - 1; mj++) {
          if (ap.breached && rj >= 5 && Math.abs(mj - 4) <= 1) continue;
          var p0 = -Math.PI * 0.46 + (mj / (nMerid - 1)) * Math.PI * 0.92;
          var p1 = -Math.PI * 0.46 + ((mj + 1) / (nMerid - 1)) * Math.PI * 0.92;
          var ym = Math.sin(el) * ch, um = Math.sin((p0 + p1) * 0.5) * Math.cos(el) * hw;
          if (ap.aqueduct && ym > 26.0 && ym < 41.0 && Math.abs(um) < 10.5) continue;
          var A0 = AP(Math.sin(p0) * Math.cos(el) * hw, ym, rm - (1 - Math.cos(p0) * Math.cos(el)) * 28.0);
          var A1 = AP(Math.sin(p1) * Math.cos(el) * hw, ym, rm - (1 - Math.cos(p1) * Math.cos(el)) * 28.0);
          B.beam(rj === nRings ? trimMat : 'concrete', A0, A1, 1.5, 1.9, stOpt);
        }
      }

      // Six Stepped Amphitheater Terrace Decks (split cleanly around the Headrace Aqueduct canyon on South Apse!)
      ap.tiers.forEach(function (tr, ti) {
        if (ap.breached && ti >= 4) return;
        var wMid = (tr.rFront + tr.rBack) * 0.5, dSlab = tr.rFront - tr.rBack + 4.0;
        var segs = tr.aqueductNotch > 0
          ? [[-tr.w * 0.5 - 3.0, -tr.aqueductNotch], [tr.aqueductNotch, tr.w * 0.5 + 3.0]]
          : [[-tr.w * 0.5 - 3.0, tr.w * 0.5 + 3.0]];
        segs.forEach(function (sg) {
          var segW = sg[1] - sg[0], uMid = (sg[0] + sg[1]) * 0.5;
          if (segW < 6.0) return;
          var sc = AP(uMid, tr.y - 0.45, wMid);
          B.obox('concrete', sc[0], tr.y - 0.45, sc[2], yaw, segW, 0.9, dSlab, stOpt);
          var pc = AP(uMid, tr.y + 0.55, tr.rFront - 0.7);
          B.obox('stone', pc[0], tr.y + 0.55, pc[2], yaw, segW - 1.0, 1.1, 1.4, stOpt);
          var tc = AP(uMid, tr.y + 0.92, tr.rFront - 1.5);
          B.obox('turf', tc[0], tr.y + 0.92, tc[2], yaw, Math.max(2.0, segW - 2.5), 0.35, 1.6, {});
          var nBays = tr.aqueductNotch > 0 ? 2 : 6, baySpan = Math.max(4.0, segW - 3.0);
          for (var bi = 0; bi < nBays; bi++) {
            var ub = uMid - baySpan * 0.5 + (bi + 0.5) * (baySpan / nBays);
            var uVal = AV.u(P.seed, 200 + ap.k, ti, bi + (uMid > 0 ? 10 : 0));
            var fc = AP(ub, tr.y + tr.h * 0.5, tr.rFront - 4.2);
            var matF = (isRep && uVal < 0.34) ? 'timber' : 'white';
            B.obox(matF, fc[0], tr.y + 0.45, fc[2], yaw, baySpan / nBays - 0.3, 0.9, 5.6, stOpt);
            B.obox(matF, fc[0], tr.y + tr.h - 0.45, fc[2], yaw, baySpan / nBays - 0.3, 0.9, 5.6, stOpt);
            var gc = AP(ub, tr.y + tr.h * 0.5, tr.rFront - 4.0);
            B.obox(winMat, gc[0], tr.y + tr.h * 0.5, gc[2], yaw, baySpan / nBays - 0.9, tr.h - 1.7, 5.2, {});
            var mc = AP(ub + (baySpan / nBays) * 0.5, tr.y + tr.h * 0.5, tr.rFront - 4.1);
            B.obox('concrete', mc[0], tr.y + tr.h * 0.5, mc[2], yaw, 0.55, tr.h, 5.8, stOpt);
          }
        });
      });
      tagPart(ap.id, ap.face + ' Carved Stepped Apse', (rm - 18) * c, 34, (rm - 18) * s, hw * 2, 38, ch, 'living-terrace');
    });

    // ---- 3. Twelve Cylindrical Skyscraper Column-Towers (4 inner with Hydro-Dynamo Copper Busbars + 8 outer) ----
    P.towers.forEach(function (tw) {
      var tx = tw.x, tz = tw.z, tr = tw.r, ty1 = tw.y1;
      B.cyl('white', tx, tz, -0.4, ty1, tr, tr * 0.97, 24, stOpt);
      for (var bandY = 10.8; bandY + 10.0 < ty1; bandY += 14.4) {
        B.cyl(winMat, tx, tz, bandY, bandY + 9.2, tr + 0.08, tr + 0.08, 24, { caps: false });
      }
      if (tw.ring === 'inner' && tw.busbar) {
        /* Glowing hydro-electric busbar conduits climbing the inner face toward the upper arcology & arc-beacon! */
        var inAng = Math.atan2(-tz, -tx);
        var bx = tx + Math.cos(inAng) * (tr + 0.55), bz = tz + Math.sin(inAng) * (tr + 0.55);
        B.box('bronze', bx - 0.55, bx + 0.55, 5.5, ty1 - 4.0, bz - 0.55, bz + 0.55, stOpt);
        B.box(isRep ? 'repArc' : 'cyan', bx - 0.25, bx + 0.25, 6.0, ty1 - 4.5, bz - 0.25, bz + 0.25, {});
      }
      // 8 full-height board-concrete structural pilasters around the cylinder
      for (var pi = 0; pi < 8; pi++) {
        var pa = (pi / 8) * TAU;
        var px = tx + Math.cos(pa) * (tr + 0.15), pz = tz + Math.sin(pa) * (tr + 0.15);
        B.obox('concrete', px, ty1 * 0.5, pz, pa + Math.PI / 2, 1.9, ty1 + 0.6, 1.6, stOpt);
      }
      // Structural bronze/iron transfer hoops every 18 m + cap drum
      for (var hy = 18.0; hy <= ty1; hy += 18.0) {
        B.cyl(trimMat, tx, tz, hy - 0.65, hy + 0.65, tr + 0.55, tr + 0.55, 24, stOpt);
      }
      B.cyl('concrete', tx, tz, ty1 - 1.5, ty1 + 1.2, tr + 0.7, tr * 0.88, 24, stOpt);
      tagPart(tw.id, (tw.ring === 'inner' ? 'Inner' : 'Outer') + ' Cylindrical Column-Tower ' + (tw.index + 1),
        tx, ty1 * 0.5, tz, tr * 2, tr * 2, ty1, 'vertical-core');
    });

    // ---- 4. Recessed Arched CIRCULATION Transfer Waist (y = 72.0 .. 86.4 m) ----
    var W = D.WAIST;
    var wOuter = AV.regOctPoly(W.rOut + 8.0), wInner = AV.regOctPoly(D.MID.innerR0);
    // Lower transfer deck (71.2 .. 73.2 m) & upper transfer deck (85.2 .. 87.2 m)
    B.ringSlab('concrete', wOuter, wInner, W.y0 - 0.8, W.y0 + 1.4, stOpt);
    B.ringSlab('concrete', wOuter, wInner, W.y1 - 1.2, W.y1 + 1.2, stOpt);
    B.ringSlab(trimMat, AV.regOctPoly(W.rOut + 8.8), AV.regOctPoly(W.rOut + 6.8), W.y0 - 0.4, W.y0 + 0.9, stOpt);
    B.ringSlab(trimMat, AV.regOctPoly(W.rOut + 8.8), AV.regOctPoly(W.rOut + 6.8), W.y1 - 0.4, W.y1 + 0.9, stOpt);
    // Recessed glazed promenade drum & 24 monumental semicircular arches (3 per face, Sheet 3 #1!)
    B.ringSlab('white', AV.regOctPoly(W.rOut - 4.0), AV.regOctPoly(W.rIn), W.y0 + 1.2, W.y1 - 1.0, stOpt);
    B.ringSlab(winMat, AV.regOctPoly(W.rOut - 3.6), AV.regOctPoly(W.rOut - 5.0), W.y0 + 2.8, W.y1 - 2.6, {});
    for (var fk = 0; fk < 8; fk++) {
      var fa = AV.faceAngle(fk), fc = Math.cos(fa), fs = Math.sin(fa), fyaw = fa + Math.PI / 2;
      var rArch = W.rOut + 4.0;
      for (var ai = -1; ai <= 1; ai++) {
        var ua = ai * 32.0;
        // Arch piers
        [-1, 1].forEach(function (ps) {
          var up = ua + ps * 10.5;
          B.obox('concrete', rArch * fc - up * fs, (W.y0 + W.y1) * 0.5, rArch * fs + up * fc, fyaw, 4.8, W.y1 - W.y0, 5.2, stOpt);
        });
        // Arch crown lintel & curved voussoir struts
        var ayTop = W.y1 - 2.2;
        B.obox('concrete', rArch * fc - ua * fs, W.y1 - 1.6, rArch * fs + ua * fc, fyaw, 24.0, 2.8, 5.2, stOpt);
        B.beam('concrete',
          [rArch * fc - (ua - 9.5) * fs, W.y0 + 5.0, rArch * fs + (ua - 9.5) * fc],
          [rArch * fc - ua * fs, ayTop, rArch * fs + ua * fc], 2.2, 3.8, stOpt);
        B.beam('concrete',
          [rArch * fc - (ua + 9.5) * fs, W.y0 + 5.0, rArch * fs + (ua + 9.5) * fc],
          [rArch * fc - ua * fs, ayTop, rArch * fs + ua * fc], 2.2, 3.8, stOpt);
      }
    }
    tagPart('av.waist', 'Arched Circulation Transfer Waist', 0, 79.2, 0, W.rOut * 2, W.rOut * 2, W.y1 - W.y0, 'circulation');

    // ---- 5. Mid-Level Concentric Rings & 8 Radial Spoke Sky-Bridges (y = 86.4 .. 136.8 m) ----
    var MD = D.MID;
    // Inner PUBLIC/COMMERCIAL ring framing the 66 x 66 m LIGHT WELL
    B.ringSlab('white', AV.regOctPoly(MD.innerR1), AV.regOctPoly(MD.innerR0), MD.y0, MD.y1 + 0.8, stOpt);
    for (var wy = MD.y0 + 2.4; wy + 2.5 < MD.y1; wy += 7.2) {
      B.ringSlab(winMat, AV.regOctPoly(MD.innerR0 + 1.2), AV.regOctPoly(MD.innerR0 - 0.15), wy, wy + 3.2, {});
      B.ringSlab(trimMat, AV.regOctPoly(MD.innerR0 + 1.4), AV.regOctPoly(MD.innerR0 - 0.4), wy - 0.4, wy, stOpt);
    }
    // Outer LIVING-WORKING / PROMENADE / RESIDENTIAL octagonal ring
    B.ringSlab('white', AV.regOctPoly(MD.outerR1), AV.regOctPoly(MD.outerR0), MD.y0, MD.y1 + 0.8, stOpt);
    for (var mfk = 0; mfk < 8; mfk++) {
      var mfa = AV.faceAngle(mfk), mfc = Math.cos(mfa), mfs = Math.sin(mfa), mfyaw = mfa + Math.PI / 2;
      var mr = MD.outerR1 + 0.2, faceW = 112.0;
      var bays = AV.midFaceBays(P, mfk);
      bays.forEach(function (b) {
        if (b.broken) return;
        var ub = ((b.f0 + b.f1) * 0.5 - 0.5) * faceW, bw2 = (b.f1 - b.f0) * faceW;
        var bmat = b.timberPatch ? 'timber' : b.lit ? winMat : 'dark';
        B.obox(bmat, mr * mfc - ub * mfs, (b.y0 + b.y1) * 0.5, mr * mfs + ub * mfc, mfyaw, bw2, b.y1 - b.y0, 1.4, {});
      });
      // Promenade cantilevered balcony bands every 14.4 m
      [93.6, 108.0, 122.4].forEach(function (by) {
        B.obox('concrete', (mr + 1.6) * mfc, by, (mr + 1.6) * mfs, mfyaw, faceW + 6.0, 1.1, 3.8, stOpt);
        B.obox(trimMat, (mr + 3.2) * mfc, by + 0.9, (mr + 3.2) * mfs, mfyaw, faceW + 6.2, 0.9, 0.45, stOpt);
      });
    }
    // 8 Radial Spoke Sky-Bridges connecting Inner Ring to Outer Towers
    P.bridges.forEach(function (br) {
      if (!br.intact) return;
      var bth = br.th, bc = Math.cos(bth), bs = Math.sin(bth), byaw = bth + Math.PI / 2;
      var rMid = (br.r0 + br.r1) * 0.5, span = br.r1 - br.r0 + 3.0;
      br.yLevels.forEach(function (by) {
        B.obox('concrete', rMid * bc, by - 0.4, rMid * bs, byaw, br.w, 1.0, span, stOpt);
        B.obox('concrete', rMid * bc, by + 3.8, rMid * bs, byaw, br.w, 0.8, span, stOpt);
        B.obox(winMat, rMid * bc, by + 1.8, rMid * bs, byaw, br.w - 0.8, 3.2, span - 2.0, {});
      });
    });

    // ---- 6. Inverted-Pyramid Cantilevered Upper Collar & Megastruts (y = 136.8 .. 172.8 m) ----
    P.collarStruts.forEach(function (st) {
      if (!st.intact) return;
      B.beam(isRep ? 'iron' : 'concrete', st.a, st.b, 2.8, 3.4, stOpt);
    });
    D.COLLAR.tiers.forEach(function (T) {
      var outP = AV.regOctPoly(T.rOut), inP = AV.regOctPoly(Math.max(D.WELL_HALF + 2.0, T.rIn));
      B.ringSlab('concrete', outP, inP, T.y0 - 0.4, T.y0 + 1.6, stOpt);
      B.ringSlab('white', AV.regOctPoly(T.rOut - 1.2), inP, T.y0 + 1.4, T.y1 - 1.0, stOpt);
      B.ringSlab('concrete', AV.regOctPoly(T.rOut + 1.2), inP, T.y1 - 1.2, T.y1 + 0.5, stOpt);
      B.ringSlab(trimMat, AV.regOctPoly(T.rOut + 1.8), AV.regOctPoly(T.rOut - 0.5), T.y1 - 0.3, T.y1 + 0.8, stOpt);
      // Relief frieze & civic loggia bays around each cantilevered collar tier
      for (var cfk = 0; cfk < 8; cfk++) {
        var cfa = AV.faceAngle(cfk), cfc = Math.cos(cfa), cfs = Math.sin(cfa), cfyaw = cfa + Math.PI / 2;
        var cr = T.rOut - 0.4, cfw = T.rOut * 0.76;
        AV.collarFaceBays(P, T.k, cfk).forEach(function (cb) {
          if (cb.broken) return;
          var cub = ((cb.f0 + cb.f1) * 0.5 - 0.5) * cfw, cbw = (cb.f1 - cb.f0) * cfw;
          var cmat = cb.relief ? 'relief' : cb.celadon ? 'celadon' : cb.lit ? winMat : 'dark';
          B.obox(cmat, cr * cfc - cub * cfs, (cb.y0 + cb.y1) * 0.5, cr * cfs + cub * cfc, cfyaw, cbw, cb.y1 - cb.y0, 2.2, cb.relief ? stOpt : {});
        });
      }
    });
    tagPart('av.collar', 'Inverted-Pyramid Cantilevered Upper Collar', 0, 154.8, 0, 360, 360, 36.0, 'civic-collar');

    // ---- 7. Main Roof Deck (y = 172.8 m): Cultural Center, Sky-Pad, Playgrounds & Botanical Cloister ----
    var RF = D.ROOF, ry = RF.y;
    // Continuous roof deck ring surrounding the 66 x 66 m Light Well
    B.ringSlab('pave', AV.regOctPoly(178.0), AV.regOctPoly(D.WELL_HALF + 1.5), ry - 0.8, ry + 0.3, stOpt);
    // Light-Well rooftop skylight parapet & glow band
    B.ringSlab(trimMat, AV.regOctPoly(D.WELL_HALF + 3.0), AV.regOctPoly(D.WELL_HALF + 1.2), ry + 0.2, ry + 1.6, stOpt);
    B.ringSlab(glowMat, AV.regOctPoly(D.WELL_HALF + 3.2), AV.regOctPoly(D.WELL_HALF + 2.6), ry + 0.5, ry + 0.9, {});
    // Sunken Rooftop Botanical Cloister planting beds
    for (var gbi = 0; gbi < 8; gbi++) {
      if (gbi % 2 === 0) continue; /* leave N/S/E/W skylight avenues clear */
      var gba = gbi * (Math.PI / 4), gbr = 62.0;
      B.obox('stone', gbr * Math.cos(gba), ry + 0.5, gbr * Math.sin(gba), gba + Math.PI / 2, 26.0, 1.0, 18.0, stOpt);
      B.obox('turf', gbr * Math.cos(gba), ry + 1.05, gbr * Math.sin(gba), gba + Math.PI / 2, 24.0, 0.3, 16.0, {});
    }

    // South Vaulted CULTURAL CENTER (3 barrel-vaulted civic shells: Assembly Hall + West/East Lyceums!)
    if (!isRuin) {
      var CC = RF.cultural, vMat = isRep ? 'celadon' : 'white';
      // Central Peoples Assembly shell + flanking shells
      [
        { dx: 0, w: 36, d: 32, h: 14.5 },
        { dx: -33, w: 28, d: 26, h: 10.8 },
        { dx: 33, w: 28, d: 26, h: 10.8 }
      ].forEach(function (sh) {
        var sx = CC.cx + sh.dx, sz = CC.cz;
        B.box('concrete', sx - sh.w * 0.5, sx + sh.w * 0.5, ry, ry + sh.h * 0.55, sz - sh.d * 0.5, sz + sh.d * 0.5, stOpt);
        B.box(winMat, sx - sh.w * 0.44, sx + sh.w * 0.44, ry + 1.2, ry + sh.h * 0.50, sz - sh.d * 0.52, sz + sh.d * 0.52, {});
        // Stepped faceted barrel vault roof
        for (var vs = 0; vs < 4; vs++) {
          var vf0 = vs / 4, vf1 = (vs + 1) / 4;
          var vw = sh.w * (1 - vf0 * 0.55), vy0 = ry + sh.h * (0.52 + vf0 * 0.48), vy1 = ry + sh.h * (0.52 + vf1 * 0.48);
          B.box(vs === 3 ? trimMat : vMat, sx - vw * 0.5, sx + vw * 0.5, vy0, vy1 + 0.3, sz - sh.d * 0.52, sz + sh.d * 0.52, stOpt);
        }
      });
      tagPart('av.cultural', 'Roof Cultural Center and Peoples Assembly Hall', CC.cx, ry + 7, CC.cz, CC.w, CC.d, CC.h, 'civic');
    }

    // North Circular HELIPORT / Sky-Pad
    var SP = RF.skypad;
    B.cyl('concrete', SP.cx, SP.cz, ry - 0.2, ry + SP.h, SP.r * 0.78, SP.r, 24, stOpt);
    B.cyl(trimMat, SP.cx, SP.cz, ry + SP.h - 0.3, ry + SP.h + 0.5, SP.r + 0.6, SP.r + 0.6, 24, stOpt);
    if (!isRuin) {
      B.box(isRep ? 'timber' : 'white', SP.cx - 12.5, SP.cx + 12.5, ry + SP.h, ry + SP.h + 5.2, SP.cz - 9.5, SP.cz + 9.5, stOpt);
      B.box(isRep ? 'celadon' : trimMat, SP.cx - 13.5, SP.cx + 13.5, ry + SP.h + 5.0, ry + SP.h + 6.2, SP.cz - 10.5, SP.cz + 10.5, stOpt);
    }
    tagPart('av.skypad', 'North Sky-Pad and Semaphore Deck', SP.cx, ry + SP.h, SP.cz, SP.r * 2, SP.r * 2, SP.h + 6, 'infrastructure');

    // West & East PLAYGROUNDS / Athletic Courts
    [RF.playWest, RF.playEast].forEach(function (PW, pwi) {
      B.box('stone', PW.cx - PW.w * 0.5, PW.cx + PW.w * 0.5, ry, ry + 1.4, PW.cz - PW.d * 0.5, PW.cz + PW.d * 0.5, stOpt);
      if (!isRuin) {
        B.box(isRep ? 'timber' : 'white', PW.cx - 13.5, PW.cx + 13.5, ry, ry + 6.0, PW.cz - 12.5, PW.cz + 12.5, stOpt);
        B.box(isRep ? 'corrugate' : 'concrete', PW.cx - 14.5, PW.cx + 14.5, ry + 5.8, ry + 7.2, PW.cz - 13.5, PW.cz + 13.5, stOpt);
      }
      tagPart('av.playground.' + (pwi ? 'east' : 'west'), (pwi ? 'East' : 'West') + ' Roof Playground and Athletic Court',
        PW.cx, ry + 3, PW.cz, PW.w, PW.d, PW.h, 'recreation');
    });

    // ---- 8. Five-Tier Stepped Faceted Pyramidal Crown (y = 172.8 .. 220.0 m, Sheet 1 #2 Motif!) ----
    var CR = D.CROWN;
    // 8 great faceted pyramidal hip ribs rising from the roof deck / 4 inner column-towers up to the lantern ring
    for (var rk = 0; rk < 8; rk++) {
      var rth = rk * (Math.PI / 4) + (Math.PI / 8);
      var rTopY = isRuin ? P.crownTiers[2].y1 : CR.yLantern;
      var rTopR = isRuin ? P.crownTiers[2].r1 : CR.rTop;
      B.beam(trimMat,
        [(CR.rBase / Math.cos(Math.PI / 8)) * Math.cos(rth), CR.y0 - 0.4, (CR.rBase / Math.cos(Math.PI / 8)) * Math.sin(rth)],
        [(rTopR / Math.cos(Math.PI / 8)) * Math.cos(rth), rTopY + 0.4, (rTopR / Math.cos(Math.PI / 8)) * Math.sin(rth)],
        2.6, 3.0, stOpt);
    }
    P.crownTiers.forEach(function (ct) {
      if (ct.broken) return;
      var rIn0 = Math.max(CR.oculusR, ct.r0 - 20.0), rIn1 = Math.max(CR.oculusR, ct.r1 - 18.0);
      var skinMat = (isRep && ct.k % 2 === 1) ? 'celadon' : 'white';
      // 8 faceted trapezoidal pyramid plates per tier, with cardinal skylight portals on tiers 0 & 1!
      var pOut0 = AV.regOctPoly(ct.r0), pOut1 = AV.regOctPoly(ct.r1);
      var pIn0 = AV.regOctPoly(rIn0), pIn1 = AV.regOctPoly(rIn1);
      for (var fi = 0; fi < 8; fi++) {
        var fj = (fi + 1) % 8;
        /* Leave open skylight portals on the 4 cardinal faces (fi = 7, 1, 3, 5 -> E, S, W, N) on tier 0 */
        var cardinalFace = (fi % 2 === 1);
        if (ct.k === 0 && cardinalFace) {
          // Glazed arch header only, open portal below so light floods the cloister & light well!
          B.beam(trimMat, [pOut0[fi][0], ct.y1 - 1.0, pOut0[fi][1]], [pOut0[fj][0], ct.y1 - 1.0, pOut0[fj][1]], 2.0, 2.2, stOpt);
          continue;
        }
        // Sloped outer facet quad
        var oa0 = pOut0[fi], ob0 = pOut0[fj], oa1 = pOut1[fi], ob1 = pOut1[fj];
        var mx = (oa0[0] + ob0[0]) * 0.5, mz = (oa0[1] + ob0[1]) * 0.5, ml = Math.hypot(mx, mz) || 1;
        B.quad(skinMat, [oa0[0], ct.y0, oa0[1]], [ob0[0], ct.y0, ob0[1]], [ob1[0], ct.y1 - 1.6, ob1[1]], [oa1[0], ct.y1 - 1.6, oa1[1]],
          [mx / ml * 0.7, 0.7, mz / ml * 0.7], stOpt);
        // Clerestory conservatory glazing band at top of each facet step!
        B.quad('glassClear', [oa1[0], ct.y1 - 1.6, oa1[1]], [ob1[0], ct.y1 - 1.6, ob1[1]], [ob1[0], ct.y1, ob1[1]], [oa1[0], ct.y1, oa1[1]],
          [mx / ml, 0.2, mz / ml], {});
      }
      // Horizontal stepped terrace collar binding the 8 ribs & inner oculus wall
      B.ringSlab('concrete', pOut1, pIn1, ct.y1 - 0.9, ct.y1 + 0.4, stOpt);
      B.ringSlab(trimMat, AV.regOctPoly(ct.r1 + 0.8), AV.regOctPoly(ct.r1 - 0.6), ct.y1 - 0.2, ct.y1 + 0.6, stOpt);
    });

    // Summit Signal Lantern (y = 212.4 .. 220.0 m)
    var LN = P.lantern;
    if (!isRuin) {
      B.cyl(trimMat, 0, 0, LN.y0 - 0.4, LN.y0 + 2.2, LN.r0 + 0.5, LN.r0 * 0.72, 16, stOpt);
      B.cyl(isRep ? 'repArc' : 'cyan', 0, 0, LN.y0 + 2.0, LN.y1 - 2.2, LN.r1 + 1.2, LN.r1 * 0.75, 16, {});
      B.cyl(isRep ? 'celadon' : 'bronze', 0, 0, LN.y1 - 2.4, LN.y1, LN.r1 + 2.2, 0.6, 8, stOpt);
    }
    tagPart('av.crown', 'Stepped Faceted Pyramidal Crown and Summit Lantern', 0, 196.0, 0, CR.rBase * 2, CR.rBase * 2, D.H_TOTAL - CR.y0, 'crown');

    // ---- 8b. Ancient Prime Toroidal Dynamo, Severed/Spliced Power Trunks & Harmonic Relics ----
    var kineticGroup = new THREE.Group();
    kineticGroup.name = P.id + '.kinetics';
    var spinX = [], spinY = [], spinZ = [], hammers = [];
    var arcMat = isRuin ? 'cyanDead' : isRep ? 'repArc' : 'cyan';
    var bucketMat = isRep ? 'timber' : 'bronze';
    var relicGlow = isIntact ? 'cyan' : 'cyanDead';
    var ancOpt = isRuin ? stOpt : { col: [0.97, 0.97, 0.96] };

    function octAt(cx, cz, R, rot) {
      return AV.regOctPoly(R, rot).map(function (q) { return [q[0] + cx, q[1] + cz]; });
    }

    if (P.ancientRelics) {
      var AR = P.ancientRelics;

      // 8b.1 Submerged/Emergent Ancient Octagonal Cryo-Coolant Ring in the Central Basin (y = -3.3 .. +1.05 m)
      if (AR.coolantRing) {
        var cr = AR.coolantRing;
        B.ringSlab('white', octAt(cr.x, cr.z, cr.r + 1.15), octAt(cr.x, cr.z, cr.r - 1.15), -3.3, 0.85, ancOpt);
        B.ringSlab('relief', octAt(cr.x, cr.z, cr.r + 0.75), octAt(cr.x, cr.z, cr.r - 0.75), 0.80, 1.12, ancOpt);
        B.ringSlab(relicGlow, octAt(cr.x, cr.z, cr.r + 0.28), octAt(cr.x, cr.z, cr.r - 0.28), 0.92, 1.18, {});
        for (var cbi = 0; cbi < 8; cbi++) {
          var cba = (cbi / 8) * TAU;
          B.obox('bronze', cr.x + Math.cos(cba) * cr.r, -1.0, cr.z + Math.sin(cba) * cr.r, cba, 2.8, 4.4, 0.85, ancOpt);
        }
        /* In refurbished state, bolted bronze/iron adapter saddles seat the masonry waterwheel pits onto the Ancient ring */
        if (isRep) {
          [-1, 1].forEach(function (sgn) {
            B.box('bronze', sgn * 10.6 - 1.1, sgn * 10.6 + 1.1, 0.65, 1.95, 4.8, 8.2, stOpt);
            B.box('iron', sgn * 13.4 - 2.8, sgn * 13.4 + 2.8, 0.65, 1.65, 5.4, 7.6, stOpt);
          });
        }
        tagPart(cr.id, 'Ancient Basin Cryo-Coolant Ring', cr.x, -0.5, cr.z, cr.r * 2.3, cr.r * 2.3, 4.5, 'infrastructure');
      }

      // 8b.2 Monumental Ancient Prime Toroidal Dynamo (online in intact; shattered in ruined; stabilized & bypassed in refurbished!)
      if (AR.primeDynamo) {
        var pd = AR.primeDynamo;
        // Grounded octagonal Ancient ceramic & geometric-relief containment plinth (y = -3.3 .. 7.52 m)
        B.ringSlab('white', octAt(pd.x, pd.z, pd.plinthR + 0.4), octAt(pd.x, pd.z, 2.2), -3.3, 6.55, ancOpt);
        B.ringSlab('relief', octAt(pd.x, pd.z, pd.plinthR - 0.25), octAt(pd.x, pd.z, 2.0), 6.45, 7.18, ancOpt);
        B.ringSlab('bronze', octAt(pd.x, pd.z, pd.plinthR - 0.95), octAt(pd.x, pd.z, 1.8), 7.12, 7.52, ancOpt);
        B.cyl('white', pd.x, pd.z, -3.3, 7.54, 5.2, 4.8, 16, ancOpt);
        for (var rbi = 0; rbi < 8; rbi++) {
          var rba = (rbi / 8) * TAU;
          B.obox(relicGlow, pd.x + Math.cos(rba) * 4.4, 7.42, pd.z + Math.sin(rba) * 4.4, rba, 3.2, 0.28, 0.36, {});
        }
        // South Crescent Ancient Control Dais overlooking the central basin (z = -10.6 .. -7.5 m, y = 5.5 .. 6.46 m)
        B.box('white', pd.x - 6.6, pd.x + 6.6, 5.5, 6.46, -10.8, -7.5, ancOpt);
        B.box('bronze', pd.x - 6.75, pd.x + 6.75, 6.32, 6.52, -7.65, -7.35, ancOpt);
        B.box(relicGlow, pd.x - 5.4, pd.x + 5.4, 6.40, 6.54, -8.1, -7.85, {});

        // Four Monumental Ancient White-Ceramic & Bronze Containment Yoke Pylons (y = 5.5 .. 27.4 m)
        [-1, 1].forEach(function (sx) {
          [-1, 1].forEach(function (sz) {
            var pxY = pd.x + sx * 7.15, pzY = pd.z + sz * 2.55;
            var pyTop = (isRuin && sx > 0 && sz < 0) ? 19.4 : pd.yTop;
            B.box('white', pxY - 0.95, pxY + 0.95, 5.5, pyTop, pzY - 0.85, pzY + 0.85, ancOpt);
            B.box('relief', pxY - 1.08, pxY + 1.08, 8.8, 14.8, pzY - 0.65, pzY + 0.65, ancOpt);
            B.box('bronze', pxY - 1.18, pxY + 1.18, 11.1, 12.1, pzY - 0.98, pzY + 0.98, ancOpt);
            if (pyTop > 22.0) {
              B.box('bronze', pxY - 1.15, pxY + 1.15, 21.4, 22.2, pzY - 0.95, pzY + 0.95, ancOpt);
            }
          });
          // Heavy Ancient torus-cradle yoke bridge tying the West/East pylon pairs directly into the Toroidal Stator Ring
          B.box('white', pd.x + sx * 5.3 - 0.9, pd.x + sx * 5.3 + 0.9, pd.torusY - 1.1, pd.torusY + 1.1, pd.z - 3.3, pd.z + 3.3, ancOpt);
          B.box('bronze', pd.x + sx * 6.3 - 1.15, pd.x + sx * 6.3 + 1.15, pd.torusY - 1.35, pd.torusY + 1.35, pd.z - 3.45, pd.z + 3.45, ancOpt);
        });
        // Upper Ancient Harmonic Crown Ring at y = 26.2 .. 27.4 m (broken NE quadrant in ruined state)
        if (!isRuin) {
          B.ringSlab('white', octAt(pd.x, pd.z, 7.6), octAt(pd.x, pd.z, 5.6), pd.yTop - 1.2, pd.yTop, ancOpt);
          B.ringSlab('bronze', octAt(pd.x, pd.z, 7.75), octAt(pd.x, pd.z, 7.35), pd.yTop - 0.35, pd.yTop + 0.15, ancOpt);
        } else {
          B.box('white', pd.x - 7.8, pd.x + 1.2, pd.yTop - 1.2, pd.yTop, pd.z - 3.4, pd.z + 3.4, ancOpt);
          B.box('white', pd.x - 1.2, pd.x + 7.8, pd.yTop - 1.2, pd.yTop, pd.z + 1.2, pd.z + 3.4, ancOpt);
        }

        // Grounded Central Vertical Containment Stalk & Lower Torus Cradle (y = 7.2 .. 17.0 m -> 0 floaters in KRUINS!)
        B.cyl('white', pd.x, pd.z, 7.2, pd.torusY - 1.4, 1.35, 0.88, 12, ancOpt);
        B.cyl('bronze', pd.x, pd.z, 9.4, 11.4, 2.25, 1.85, 12, ancOpt);
        B.box('bronze', pd.x - 2.1, pd.x + 2.1, 7.2, 11.2, pd.z - 1.65, pd.z + 1.65, ancOpt);

        // Central Singularity / Magneto-Plasma Core at (pd.x, pd.torusY, pd.z)
        if (isIntact) {
          B.cyl('cyan', pd.x, pd.z, pd.torusY - 2.2, pd.torusY, 0.45, 2.15, 8, {});
          B.cyl('cyan', pd.x, pd.z, pd.torusY, pd.torusY + 2.2, 2.15, 0.45, 8, {});
          // Counter-rotating Ancient bronze & cyan gimballed harmonic rings in intact state!
          var agY = new THREE.Group();
          agY.position.set(pd.x, pd.torusY, pd.z);
          var AB1 = AV.builder();
          AB1.ringSlab('bronze', AV.regOctPoly(3.85), AV.regOctPoly(3.35), -0.32, 0.32, {});
          AB1.ringSlab('cyan', AV.regOctPoly(3.38), AV.regOctPoly(3.12), -0.18, 0.18, {});
          var am1 = AB1.finish(pd.id + '.gimbalY');
          am1.traverse(function (m) { if (m.isMesh) m.userData.decor = true; });
          agY.add(am1);
          kineticGroup.add(agY);
          spinY.push({ g: agY, rate: 0.95 });
        } else {
          /* Quenched, cracked, cold Ancient Singularity Core (cyanDead) wrapped in scorched bronze containment ribs */
          B.cyl('cyanDead', pd.x, pd.z, pd.torusY - 2.1, pd.torusY + 0.1, 0.55, 2.05, 8, {});
          B.cyl('cyanDead', pd.x, pd.z, pd.torusY - 0.1, pd.torusY + 1.95, 2.05, 0.50, 8, {});
          B.obox('bronze', pd.x, pd.torusY, pd.z, 0.28, 4.35, 0.52, 0.68, stOpt);
          B.obox('bronze', pd.x, pd.torusY, pd.z, -0.52, 0.68, 3.85, 0.52, stOpt);
        }

        // Colossal 12.8 m Vertical Ancient Toroidal Stator Ring in the X-Y plane (20 segments; upper-east arc ruptured when !isIntact)
        var nTor = 20;
        for (var ti = 0; ti < nTor; ti++) {
          if (pd.missingSegs && pd.missingSegs.indexOf(ti) >= 0) continue;
          var ta0 = (ti / nTor) * TAU, ta1 = ((ti + 1) / nTor) * TAU, tam = (ta0 + ta1) * 0.5;
          var tx0 = pd.x + Math.cos(ta0) * pd.torusR, ty0 = pd.torusY + Math.sin(ta0) * pd.torusR;
          var tx1 = pd.x + Math.cos(ta1) * pd.torusR, ty1 = pd.torusY + Math.sin(ta1) * pd.torusR;
          var txI0 = pd.x + Math.cos(ta0) * (pd.torusR - 1.05), tyI0 = pd.torusY + Math.sin(ta0) * (pd.torusR - 1.05);
          var txI1 = pd.x + Math.cos(ta1) * (pd.torusR - 1.05), tyI1 = pd.torusY + Math.sin(ta1) * (pd.torusR - 1.05);
          B.beam('white', [tx0, ty0, pd.z], [tx1, ty1, pd.z], 2.15, 2.45, ancOpt);
          B.beam(relicGlow, [txI0, tyI0, pd.z], [txI1, tyI1, pd.z], 0.55, 1.35, {});
          if (ti % 2 === 0) {
            var cxT = pd.x + Math.cos(tam) * pd.torusR, cyT = pd.torusY + Math.sin(tam) * pd.torusR;
            B.beam('bronze', [cxT - Math.sin(tam) * 0.28, cyT + Math.cos(tam) * 0.28, pd.z],
              [cxT + Math.sin(tam) * 0.28, cyT - Math.cos(tam) * 0.28, pd.z], 2.55, 2.85, ancOpt);
          }
        }
        // Sheared bronze & dark crystal coil stubs jutting out of the two ruptured torus faces (!isIntact)
        if (!isIntact) {
          [2 / nTor * TAU, 6 / nTor * TAU].forEach(function (ba, biS) {
            var dirS = biS === 0 ? 1 : -1;
            var bx0 = pd.x + Math.cos(ba) * pd.torusR, by0 = pd.torusY + Math.sin(ba) * pd.torusR;
            var bx1 = bx0 - Math.sin(ba) * dirS * 0.95, by1 = by0 + Math.cos(ba) * dirS * 0.95;
            B.beam('bronze', [bx0, by0, pd.z], [bx1, by1, pd.z], 1.45, 1.65, stOpt);
            B.beam('cyanDead', [bx0, by0, pd.z], [bx1 - Math.sin(ba) * dirS * 0.35, by1 + Math.cos(ba) * dirS * 0.35, pd.z], 0.72, 0.72, {});
          });
        }

        // Careful Iron Republic Shoring Collars, Raking Box-Shores & Two-Tier Engineer Catwalk around the Failed Ancient Dynamo!
        if (isRep) {
          var gapA = [pd.x + Math.cos(2 / nTor * TAU) * pd.torusR, pd.torusY + Math.sin(2 / nTor * TAU) * pd.torusR, pd.z];
          var gapB = [pd.x + Math.cos(6 / nTor * TAU) * pd.torusR, pd.torusY + Math.sin(6 / nTor * TAU) * pd.torusR, pd.z];
          // Bolted forged-iron clamping collars around both fractured torus ends + twin turnbuckle tie-bars across the blown-out gap!
          B.obox('iron', gapA[0], gapA[1], gapA[2], -0.4, 2.95, 2.95, 2.95, stOpt);
          B.obox('iron', gapB[0], gapB[1], gapB[2], 0.3, 2.95, 2.95, 2.95, stOpt);
          B.beam('iron', [gapA[0], gapA[1] + 0.55, pd.z - 0.95], [gapB[0], gapB[1] + 0.55, pd.z - 0.95], 0.32, 0.32, stOpt);
          B.beam('iron', [gapA[0], gapA[1] + 0.55, pd.z + 0.95], [gapB[0], gapB[1] + 0.55, pd.z + 0.95], 0.32, 0.32, stOpt);
          B.beam('bronze', [(gapA[0] + gapB[0]) * 0.5 - 0.6, (gapA[1] + gapB[1]) * 0.5 + 0.55, pd.z - 0.95],
            [(gapA[0] + gapB[0]) * 0.5 + 0.6, (gapA[1] + gapB[1]) * 0.5 + 0.55, pd.z - 0.95], 0.52, 0.52, stOpt);
          // Heavy raking steel box-shores bracing the fractured torus & dead core down onto the octagonal plinth
          B.beam('iron', [pd.x + 5.6, 7.35, pd.z - 2.1], [gapA[0], gapA[1] - 0.4, pd.z - 1.1], 0.58, 0.58, stOpt);
          B.beam('iron', [pd.x + 5.6, 7.35, pd.z + 2.1], [gapA[0], gapA[1] - 0.4, pd.z + 1.1], 0.58, 0.58, stOpt);
          B.beam('iron', [pd.x - 4.4, 7.35, pd.z - 2.1], [gapB[0], gapB[1] - 0.4, pd.z - 1.1], 0.55, 0.55, stOpt);
          B.beam('iron', [pd.x - 2.8, 7.35, pd.z - 1.8], [pd.x - 0.8, pd.torusY - 1.2, pd.z - 0.9], 0.42, 0.42, stOpt);
          B.beam('iron', [pd.x + 2.8, 7.35, pd.z + 1.8], [pd.x + 0.8, pd.torusY - 1.2, pd.z + 0.9], 0.42, 0.42, stOpt);

          // Neat Timber-and-Iron Surveyor & Millwright Inspection Catwalk wrapping the Ancient plinth at y = 9.2 m
          B.box('timber', pd.x - 8.6, pd.x + 8.6, 9.05, 9.35, pd.z - 5.4, pd.z - 3.6, stOpt);
          B.box('timber', pd.x - 8.6, pd.x - 6.8, 9.05, 9.35, pd.z - 3.6, pd.z + 4.6, stOpt);
          B.box('timber', pd.x + 6.8, pd.x + 8.6, 9.05, 9.35, pd.z - 3.6, pd.z + 4.6, stOpt);
          [-8.4, -4.2, 0.0, 4.2, 8.4].forEach(function (cxS) {
            B.box('iron', pd.x + cxS - 0.18, pd.x + cxS + 0.18, 5.6, 10.35, pd.z - 5.35, pd.z - 5.0, stOpt);
          });
          [-8.4, 8.4].forEach(function (sxS) {
            B.box('iron', pd.x + sxS - 0.18, pd.x + sxS + 0.18, 5.6, 10.35, pd.z + 4.15, pd.z + 4.5, stOpt);
            B.box('iron', pd.x + sxS - 0.14, pd.x + sxS + 0.14, 10.15, 10.38, pd.z - 5.35, pd.z + 4.5, stOpt);
            B.box('repGlow', pd.x + sxS - 0.28, pd.x + sxS + 0.28, 10.4, 10.95, pd.z + 4.15, pd.z + 4.55, {});
          });
          B.box('iron', pd.x - 8.5, pd.x + 8.5, 10.15, 10.38, pd.z - 5.4, pd.z - 5.15, stOpt);
          B.box('repGlow', pd.x - 4.2 - 0.28, pd.x - 4.2 + 0.28, 10.4, 10.95, pd.z - 5.45, pd.z - 5.05, {});
          B.box('repGlow', pd.x + 4.2 - 0.28, pd.x + 4.2 + 0.28, 10.4, 10.95, pd.z - 5.45, pd.z - 5.05, {});
          // Timber inspection stair from L1 floor (y = 6.0 m) up to the West catwalk (y = 9.2 m)
          B.beam('timber', [pd.x - 7.7, 5.85, pd.z + 7.2], [pd.x - 7.7, 9.25, pd.z + 4.4], 1.45, 0.32, stOpt);
        }

        tagPart(pd.id, isRep ? 'Failed Ancient Prime Toroidal Dynamo (Stabilized Relic)' : 'Ancient Prime Toroidal Dynamo',
          pd.x, pd.torusY, pd.z, 17.5, 10.5, pd.yTop - 5.5, isRep ? 'monument' : 'industry');
      }

      // 8b.3 Unbolted Ancient Stator Arc Lowered Carefully onto Timber Cribbing Cradle (refurbished only!)
      if (isRep && AR.statorCradle) {
        var sc = AR.statorCradle;
        // Cross-stacked squared timber cribbing sleepers on L1 floor (y = 5.6 .. 7.25 m)
        [-1.6, 0.0, 1.6].forEach(function (dzC) {
          B.obox('timber', sc.x, 6.28, sc.z + dzC, sc.yaw, 5.2, 0.55, 0.55, stOpt);
        });
        [-1.8, -0.6, 0.6, 1.8].forEach(function (dxC) {
          B.obox('timber', sc.x + dxC * Math.cos(sc.yaw), 6.82, sc.z + dxC * Math.sin(sc.yaw), sc.yaw + Math.PI * 0.5, 4.0, 0.55, 0.52, stOpt);
        });
        // Curved 4-segment ruptured Ancient white-ceramic, bronze & cyanDead stator arc cradled concave-up on the cribbing!
        for (var as = 0; as < 4; as++) {
          var aa0 = -2.35 + as * 0.38, aa1 = -2.35 + (as + 1) * 0.38;
          var rArc = 5.4, cyArc = 12.65;
          var u0x = Math.cos(aa0) * rArc, u0y = cyArc + Math.sin(aa0) * rArc;
          var u1x = Math.cos(aa1) * rArc, u1y = cyArc + Math.sin(aa1) * rArc;
          var pA0 = [sc.x + u0x * Math.cos(sc.yaw), u0y, sc.z + u0x * Math.sin(sc.yaw)];
          var pA1 = [sc.x + u1x * Math.cos(sc.yaw), u1y, sc.z + u1x * Math.sin(sc.yaw)];
          B.beam('white', pA0, pA1, 1.95, 2.15, ancOpt);
          B.beam('cyanDead', [pA0[0], pA0[1] + 0.65, pA0[2]], [pA1[0], pA1[1] + 0.65, pA1[2]], 0.52, 0.85, {});
          if (as === 1 || as === 2) {
            B.beam('bronze', pA0, [pA0[0] + (pA1[0] - pA0[0]) * 0.35, pA0[1] + (pA1[1] - pA0[1]) * 0.35, pA0[2] + (pA1[2] - pA0[2]) * 0.35], 2.25, 2.45, stOpt);
          }
        }
        // Forged-iron portable A-frame salvage gantry & chain-fall tackle astride the cribbing cradle (y = 5.6 .. 12.4 m)
        [-2.4, 2.4].forEach(function (gxS) {
          var bxG = sc.x + gxS * Math.cos(sc.yaw), bzG = sc.z + gxS * Math.sin(sc.yaw);
          B.beam('iron', [bxG - Math.sin(sc.yaw) * 1.85, 5.6, bzG + Math.cos(sc.yaw) * 1.85], [bxG, 12.2, bzG], 0.34, 0.34, stOpt);
          B.beam('iron', [bxG + Math.sin(sc.yaw) * 1.85, 5.6, bzG - Math.cos(sc.yaw) * 1.85], [bxG, 12.2, bzG], 0.34, 0.34, stOpt);
        });
        B.beam('iron', [sc.x - 2.6 * Math.cos(sc.yaw), 12.2, sc.z - 2.6 * Math.sin(sc.yaw)],
          [sc.x + 2.6 * Math.cos(sc.yaw), 12.2, sc.z + 2.6 * Math.sin(sc.yaw)], 0.42, 0.52, stOpt);
        B.box('bronze', sc.x - 0.45, sc.x + 0.45, 11.2, 12.0, sc.z - 0.45, sc.z + 0.45, stOpt);
        B.box('iron', sc.x - 0.12, sc.x + 0.12, 8.2, 11.3, sc.z - 0.12, sc.z + 0.12, stOpt);
        B.box('repGlow', sc.x + 2.2 * Math.cos(sc.yaw) - 0.25, sc.x + 2.2 * Math.cos(sc.yaw) + 0.25, 11.4, 11.95, sc.z + 2.2 * Math.sin(sc.yaw) - 0.25, sc.z + 2.2 * Math.sin(sc.yaw) + 0.25, {});
        tagPart(sc.id, 'Unbolted Ancient Stator Arc on Timber Cribbing', sc.x, 8.8, sc.z, 5.8, 4.6, 6.8, 'monument');
      }

      // 8b.4 Four Overhead Ancient Power-Spine Trunks & Republican Hydro-Dynamo Busbar Splice Collars!
      var pdZ = AR.primeDynamo ? AR.primeDynamo.z : -15.8;
      // Severed inner East/West stubs attached to the Ancient Prime Dynamo (continuous in intact; capped & isolated in refurbished!)
      [-1, 1].forEach(function (sx) {
        var stubEnd = isIntact ? sx * 34.8 : (isRep ? sx * 15.6 : sx * 14.4);
        var xA = Math.min(sx * 6.8, stubEnd), xB = Math.max(sx * 6.8, stubEnd);
        B.box('white', xA, xB, 10.85, 12.35, pdZ - 0.88, pdZ + 0.88, ancOpt);
        B.box('bronze', xA, xB, 12.28, 12.55, pdZ - 0.98, pdZ + 0.98, ancOpt);
        B.box(relicGlow, xA, xB, 11.35, 11.85, pdZ - 0.95, pdZ + 0.95, {});
        // Grounded Ancient ceramic-and-bronze support T-pylon under the stub end (guarantees 0 floaters in KRUINS!)
        var pxSt = stubEnd - sx * 1.1;
        B.box('white', pxSt - 0.68, pxSt + 0.68, 5.5, 11.0, pdZ - 0.72, pdZ + 0.72, ancOpt);
        B.box('bronze', pxSt - 0.88, pxSt + 0.88, 10.5, 11.05, pdZ - 1.15, pdZ + 1.15, ancOpt);
        if (isRep) {
          /* Heavy bolted forged-iron blanking flange capping off the dead Ancient dynamo trunk! */
          B.box('iron', stubEnd - 0.38, stubEnd + 0.38, 10.55, 12.75, pdZ - 1.25, pdZ + 1.25, stOpt);
          B.box('bronze', stubEnd - 0.48, stubEnd + 0.48, 11.25, 11.95, pdZ - 0.65, pdZ + 0.65, stOpt);
        }
        if (isIntact) {
          /* In intact Ancient state, north-south manifold links (-16.5..-6.5) bridge cleanly at x = +-34.8 */
          B.box('white', sx * 34.8 - 0.85, sx * 34.8 + 0.85, 10.85, 12.35, -17.2, -5.8, ancOpt);
          B.box('cyan', sx * 34.8 - 0.92, sx * 34.8 + 0.92, 11.35, 11.85, -17.0, -6.0, {});
        }
      });

      (AR.busTrunks || []).forEach(function (tr) {
        var outerGlow = isRuin ? 'cyanDead' : (isRep ? 'repArc' : 'cyan');
        // Grounded Ancient white-ceramic T-pylon at the splice junction (tr.spliceX, tr.spliceZ)
        B.box('white', tr.spliceX - 0.75, tr.spliceX + 0.75, 5.5, 11.1, tr.spliceZ - 0.75, tr.spliceZ + 0.75, ancOpt);
        B.box('bronze', tr.spliceX - 1.05, tr.spliceX + 1.05, 10.6, 11.15, tr.spliceZ - 1.05, tr.spliceZ + 1.05, ancOpt);
        // Outer Ancient hexagonal/box power trunk running from (tr.spliceX, 11.6, tr.spliceZ) into the Inner Column-Tower (tr.towerX, 11.6, tr.towerZ)!
        B.beam('white', [tr.spliceX, tr.y, tr.spliceZ], [tr.towerX, tr.y, tr.towerZ], 1.65, 1.55, ancOpt);
        B.beam(outerGlow, [tr.spliceX, tr.y, tr.spliceZ], [tr.towerX, tr.y, tr.towerZ], 1.78, 0.48, {});
        // Vertical Ancient power-spine riser climbing up the hall-facing skin of the Inner Column-Tower (y = 5.5 .. 46.0 m)!
        var vxT = tr.sgnX * 37.6, vzT = tr.sgnZ * 37.6;
        B.box('white', vxT - 0.85, vxT + 0.85, 5.5, 46.0, vzT - 0.85, vzT + 0.85, ancOpt);
        B.box(outerGlow, vxT - 0.94, vxT + 0.94, 6.2, 45.6, vzT - 0.42, vzT + 0.42, {});

        // In refurbished state, clamp a heavy Forged-Iron & Copper Busbar Splice Collar onto the severed Ancient trunk,
        // fed directly by triple copper busbars from the adjacent water-driven Scroll-Case Hydro-Dynamo (x = +-29.0)!
        if (isRep) {
          B.box('iron', tr.spliceX - 1.35, tr.spliceX + 1.35, 10.45, 12.85, tr.spliceZ - 1.35, tr.spliceZ + 1.35, stOpt);
          B.box('bronze', tr.spliceX - 1.48, tr.spliceX + 1.48, 11.1, 12.2, tr.spliceZ - 0.95, tr.spliceZ + 0.95, stOpt);
          // Triple heavy copper busbars & glowing electric arc conductors bridging from Hydro-Dynamo switchgear (x = sgnX * 33.4, y = 9.2)
          [-0.75, 0.0, 0.75].forEach(function (dzB) {
            B.beam('bronze', [tr.sgnX * 33.2, 9.1, tr.spliceZ + dzB], [tr.spliceX, 11.65, tr.spliceZ + dzB], 0.26, 0.32, stOpt);
          });
          B.beam('repArc', [tr.sgnX * 33.3, 9.35, tr.spliceZ], [tr.spliceX, 11.75, tr.spliceZ], 0.85, 0.36, {});
          tagPart(tr.id + '.splice', 'Hydro-Dynamo to Ancient Trunk Busbar Splice (' + tr.corner + ')',
            tr.spliceX, 10.8, tr.spliceZ, 3.6, 3.2, 5.2, 'infrastructure');
        }
      });

      // 8b.5 Six Peripheral Ancient Harmonic Capacitor / Field-Regulator Monoliths (repurposed with iron collar straps in refurbished)
      (AR.capacitors || []).forEach(function (cpM) {
        B.cyl('white', cpM.x, cpM.z, 5.5, 6.0 + cpM.h, cpM.r, cpM.r * 0.72, 8, ancOpt);
        B.cyl('relief', cpM.x, cpM.z, 6.2, 7.6, cpM.r + 0.14, cpM.r + 0.08, 8, ancOpt);
        B.cyl('bronze', cpM.x, cpM.z, 5.8 + cpM.h, 6.35 + cpM.h, cpM.r * 0.84, cpM.r * 0.42, 8, ancOpt);
        B.box(relicGlow, cpM.x - cpM.r * 0.88, cpM.x + cpM.r * 0.88, 7.8, 5.4 + cpM.h, cpM.z - 0.22, cpM.z + 0.22, {});
        B.box(relicGlow, cpM.x - 0.22, cpM.x + 0.22, 7.8, 5.4 + cpM.h, cpM.z - cpM.r * 0.88, cpM.z + cpM.r * 0.88, {});
        if (isRep) {
          /* Non-destructive strapped iron collar bands mounting Republican pressure gauges, knife-switches & cage-lamps */
          B.cyl('iron', cpM.x, cpM.z, 8.1, 8.45, cpM.r + 0.16, cpM.r + 0.16, 8, stOpt);
          B.cyl('iron', cpM.x, cpM.z, 10.4, 10.75, cpM.r * 0.96, cpM.r * 0.96, 8, stOpt);
          B.box('bronze', cpM.x - 0.75, cpM.x + 0.75, 7.6, 9.1, cpM.z + cpM.r * 0.75, cpM.z + cpM.r * 1.08, stOpt);
          B.box('repGlow', cpM.x - 0.28, cpM.x + 0.28, 9.15, 9.65, cpM.z + cpM.r * 0.82, cpM.z + cpM.r * 1.12, {});
        }
        tagPart(cpM.id, isRep ? 'Ancient Harmonic Monolith (Retrofitted ' + cpM.retrofit + ')' : 'Ancient Harmonic Capacitor Monolith',
          cpM.x, 6.0 + cpM.h * 0.5, cpM.z, cpM.r * 2.4, cpM.r * 2.4, cpM.h + 0.6, 'monument');
      });
    }

    // ---- 9. Iron Republic Hydropower Replacement Machinery & Exterior Additions ----
    if (P.hydroHall) {
      var HH = P.hydroHall;

      // 9a. Grounded Masonry Wheel-Pit Walls, Axle Bearings & Spillway Chutes (y = -3.3 .. 23.8 m)
      [-1, 1].forEach(function (sgn) {
        var xIn = sgn * 11.1, xOut = sgn * 15.7;
        // Inner & outer pit walls grounded directly to the -3.3 m turbine basin bed
        B.box('stone', Math.min(xIn - sgn * 0.5, xIn + sgn * 0.5), Math.max(xIn - sgn * 0.5, xIn + sgn * 0.5), -3.3, 23.2, 6.2, 16.0, stOpt);
        B.box('stone', Math.min(xOut - sgn * 0.7, xOut + sgn * 0.7), Math.max(xOut - sgn * 0.7, xOut + sgn * 0.7), -3.3, 23.2, 6.2, 16.0, stOpt);
        B.box('stone', Math.min(xIn - sgn * 0.5, xIn + sgn * 0.5), Math.max(xIn - sgn * 0.5, xIn + sgn * 0.5), -3.3, 10.6, -4.4, 6.4, stOpt);
        B.box('stone', Math.min(xOut - sgn * 0.7, xOut + sgn * 0.7), Math.max(xOut - sgn * 0.7, xOut + sgn * 0.7), -3.3, 10.6, -4.4, 6.4, stOpt);
        // Cast-iron / bronze pillow-block caps atop the wheel-pit walls
        B.box(trimMat, sgn * 13.4 - 2.9, sgn * 13.4 + 2.9, 20.8, 22.4, 9.1, 10.5, stOpt);
        B.box(trimMat, sgn * 13.4 - 2.9, sgn * 13.4 + 2.9, 7.8, 9.4, 1.5, 2.9, stOpt);
        if (!isRuin) {
          // Inclined headrace flume chute feeding the upper overshot wheel, plus transfer apron to lower wheel
          B.beam(trimMat, [sgn * 13.4, 29.8, 15.6], [sgn * 13.4, 27.6, 10.8], 3.1, 0.75, stOpt);
          B.beam(trimMat, [sgn * 13.4, 15.4, 8.2], [sgn * 13.4, 14.8, 3.4], 3.0, 0.70, stOpt);
          // Horizontal bevel drive axles connecting wheel pits into SW & SE bevel-gear towers
          B.beam(trimMat, [sgn * 15.2, 21.6, 9.8], [sgn * 19.4, 21.6, 9.8], 0.65, 0.65, stOpt);
          B.beam(trimMat, [sgn * 15.2, 8.6, 2.2], [sgn * 19.4, 8.6, 9.8], 0.65, 0.65, stOpt);
        }
      });

      // 9b. Four Giant Overshot Waterwheels (r = 6.2 m, w = 3.0 m, rotating around X!)
      HH.wheels.forEach(function (wh) {
        tagPart(wh.id, 'Overshot Hydro-Wheel (' + wh.side + ' ' + wh.tier + ')', wh.x, wh.y, wh.z, wh.w + 1.0, wh.r * 2, wh.r * 2, 'industry');
        if (isRuin) return;
        var wg = new THREE.Group();
        wg.position.set(wh.x, wh.y, wh.z);
        var WB = AV.builder();
        // Heavy central axle & hub drums along X
        WB.beam(trimMat, [-wh.w * 0.68, 0, 0], [wh.w * 0.68, 0, 0], 0.82, 0.82, {});
        WB.beam(trimMat, [-wh.w * 0.48, 0, 0], [wh.w * 0.48, 0, 0], 1.75, 1.75, {});
        var nSeg = 16, rOut = wh.r, rIn = wh.r - 0.85, hw = wh.w * 0.45;
        for (var i = 0; i < nSeg; i++) {
          var a0 = (i / nSeg) * TAU, a1 = ((i + 1) / nSeg) * TAU, am = (a0 + a1) * 0.5;
          var y0 = Math.cos(a0), z0 = Math.sin(a0), y1 = Math.cos(a1), z1 = Math.sin(a1);
          // Twin shrouded iron/bronze side rims in the Y-Z plane
          [-hw, hw].forEach(function (sx) {
            WB.beam(trimMat, [sx, y0 * rOut, z0 * rOut], [sx, y1 * rOut, z1 * rOut], 0.28, 0.72, {});
            WB.beam(trimMat, [sx, y0 * rIn, z0 * rIn], [sx, y1 * rIn, z1 * rIn], 0.24, 0.42, {});
            if (i % 2 === 0) {
              WB.beam(trimMat, [sx * 0.92, 0, 0], [sx, Math.cos(a0) * rIn, Math.sin(a0) * rIn], 0.24, 0.34, {});
            }
          });
          // Angled overshot water-catching bucket spanning between the two side shrouds
          var by0 = Math.cos(a0) * rIn, bz0 = Math.sin(a0) * rIn;
          var by1 = Math.cos(am) * (rOut + 0.08), bz1 = Math.sin(am) * (rOut + 0.08);
          WB.beam(bucketMat, [-hw + 0.12, (by0 + by1) * 0.5, (bz0 + bz1) * 0.5], [hw - 0.12, (by0 + by1) * 0.5, (bz0 + bz1) * 0.5], 0.22, 1.05, {});
        }
        var wm = WB.finish(wh.id);
        wm.traverse(function (m) { if (m.isMesh) m.userData.decor = true; });
        wg.add(wm);
        kineticGroup.add(wg);
        spinX.push({ g: wg, rate: -(wh.rpm / 7.5) * 0.85 });
      });

      // 9c. Four Vertical Bevel-Gear Drive-Shaft Stanchions (grounded y = -3.3 .. 31.0 m) + Spinning Crown Gears
      HH.gearTowers.forEach(function (gt, gi) {
        var topGt = isRuin ? 14.8 : gt.y1;
        // Four-cornered steel/concrete lattice pier grounded to -3.3 m
        [-1.1, 1.1].forEach(function (dx) {
          [-1.1, 1.1].forEach(function (dz) {
            B.box(trimMat, gt.x + dx - 0.26, gt.x + dx + 0.26, -3.3, topGt, gt.z + dz - 0.26, gt.z + dz + 0.26, stOpt);
          });
        });
        for (var gyB = 2.0; gyB < topGt; gyB += 5.5) {
          B.box(trimMat, gt.x - 1.35, gt.x + 1.35, gyB - 0.22, gyB + 0.22, gt.z - 1.35, gt.z + 1.35, stOpt);
        }
        tagPart(gt.id, 'Vertical Bevel-Gear Drive Tower ' + (gi + 1), gt.x, topGt * 0.5, gt.z, 3.6, 3.6, topGt, 'industry');
        if (isRuin) return;

        var gg = new THREE.Group();
        gg.position.set(gt.x, 0, gt.z);
        var GB = AV.builder();
        GB.cyl(trimMat, 0, 0, 1.0, gt.y1 - 0.4, 0.36, 0.36, 10, {});
        gt.gearY.forEach(function (gy) {
          GB.cyl('bronze', 0, 0, gy - 0.32, gy + 0.32, 2.35, 2.15, 16, { caps: false });
          GB.cyl(trimMat, 0, 0, gy - 0.45, gy + 0.45, 0.85, 0.85, 12, {});
          for (var gs = 0; gs < 8; gs++) {
            var ga = (gs / 8) * TAU;
            GB.beam('bronze', [0, gy, 0], [Math.cos(ga) * 2.2, gy, Math.sin(ga) * 2.2], 0.24, 0.28, {});
          }
          for (var te = 0; te < 12; te++) {
            var ta = (te / 12) * TAU;
            GB.obox(trimMat, Math.cos(ta) * 2.42, gy - 0.18, Math.sin(ta) * 2.42, -ta, 0.34, 0.42, 0.38, {});
          }
        });
        var gm = GB.finish(gt.id + '.gears');
        gm.traverse(function (m) { if (m.isMesh) m.userData.decor = true; });
        gg.add(gm);
        kineticGroup.add(gg);
        spinY.push({ g: gg, rate: (gi % 2 === 0 ? 1.35 : -1.35) });
      });

      // 9d. Overhead Belt-and-Pulley Line-Shafts, Hangers, Drive Belts & Machine Beds (!isRuin)
      if (!isRuin) {
        HH.lineShafts.forEach(function (ls) {
          var sg = new THREE.Group();
          var SB = AV.builder();
          if (ls.axis === 'z') {
            var zm = (ls.z0 + ls.z1) * 0.5;
            sg.position.set(ls.x, ls.y, zm);
            SB.beam(trimMat, [0, 0, ls.z0 - zm], [0, 0, ls.z1 - zm], 0.34, 0.34, {});
            ls.pulleys.forEach(function (pz, pi) {
              var lz = pz - zm;
              for (var ps = 0; ps < 8; ps++) {
                var pa = (ps / 8) * TAU, pa1 = ((ps + 1) / 8) * TAU;
                SB.beam('bronze', [Math.cos(pa) * 1.18, Math.sin(pa) * 1.18, lz], [Math.cos(pa1) * 1.18, Math.sin(pa1) * 1.18, lz], 0.18, 0.42, {});
                if (ps % 2 === 0) SB.beam(trimMat, [0, 0, lz], [Math.cos(pa) * 1.12, Math.sin(pa) * 1.12, lz], 0.14, 0.18, {});
              }
              if (ls.y < 16.0 && pz < -7.0 && Math.abs(pz - (-25.2)) > 2.5) {
                B.box(trimMat, ls.x - 0.25, ls.x + 0.25, 5.6, ls.y + 0.55, pz - 1.35, pz - 0.95, stOpt);
                B.box('dark', ls.x - 1.18, ls.x - 1.02, 7.6, ls.y + 0.1, pz - 0.18, pz + 0.18, {});
                B.box('dark', ls.x + 1.02, ls.x + 1.18, 7.6, ls.y + 0.1, pz - 0.18, pz + 0.18, {});
                var mOff = (pi % 2 === 0 ? 1 : -1) * 2.2;
                B.box(trimMat, ls.x - 1.6, ls.x + 1.6 + mOff, 5.6, 7.2, pz - 1.2, pz + 1.2, stOpt);
                B.box('bronze', ls.x - 0.9, ls.x + 0.9, 7.1, 8.2, pz - 0.7, pz + 0.7, stOpt);
              }
            });
            spinZ.push({ g: sg, rate: (ls.x < 0 ? 2.1 : -2.1) });
          } else {
            var xm = (ls.x0 + ls.x1) * 0.5;
            sg.position.set(xm, ls.y, ls.z);
            SB.beam(trimMat, [ls.x0 - xm, 0, 0], [ls.x1 - xm, 0, 0], 0.36, 0.36, {});
            ls.pulleys.forEach(function (px) {
              var lx = px - xm;
              for (var ps2 = 0; ps2 < 8; ps2++) {
                var qa = (ps2 / 8) * TAU, qa1 = ((ps2 + 1) / 8) * TAU;
                SB.beam('bronze', [lx, Math.cos(qa) * 1.22, Math.sin(qa) * 1.22], [lx, Math.cos(qa1) * 1.22, Math.sin(qa1) * 1.22], 0.18, 0.44, {});
                if (ps2 % 2 === 0) SB.beam(trimMat, [lx, 0, 0], [lx, Math.cos(qa) * 1.15, Math.sin(qa) * 1.15], 0.14, 0.18, {});
              }
            });
            // Tie cross-shaft hangers into the grounded NW & NE gear towers
            B.beam(trimMat, [-38.5, ls.y + 0.4, ls.z], [38.5, ls.y + 0.4, ls.z], 0.45, 0.55, stOpt);
            B.box(trimMat, -38.8, -35.6, 5.6, ls.y + 0.6, ls.z - 0.6, ls.z + 0.6, stOpt);
            B.box(trimMat, 35.6, 38.8, 5.6, ls.y + 0.6, ls.z - 0.6, ls.z + 0.6, stOpt);
            spinX.push({ g: sg, rate: 2.0 });
          }
          var sm = SB.finish(ls.id);
          sm.traverse(function (m) { if (m.isMesh) m.userData.decor = true; });
          sg.add(sm);
          kineticGroup.add(sg);
        });
      }

      // 9e. Twin Diagonal Riveted-Iron Penstocks & Grounded Cradle Piers
      HH.penstocks.forEach(function (ps) {
        var sgn = ps.a[0] < 0 ? -1 : 1;
        B.beam(trimMat, ps.a, ps.b, ps.r * 2, ps.r * 2, stOpt);
        for (var cf = 1; cf <= 4; cf++) {
          var tf = cf / 5;
          var cxP = ps.a[0] + (ps.b[0] - ps.a[0]) * tf, cyP = ps.a[1] + (ps.b[1] - ps.a[1]) * tf, czP = ps.a[2] + (ps.b[2] - ps.a[2]) * tf;
          B.beam('bronze', [cxP - (ps.b[0] - ps.a[0]) * 0.03, cyP - (ps.b[1] - ps.a[1]) * 0.03, czP - (ps.b[2] - ps.a[2]) * 0.03],
            [cxP + (ps.b[0] - ps.a[0]) * 0.03, cyP + (ps.b[1] - ps.a[1]) * 0.03, czP + (ps.b[2] - ps.a[2]) * 0.03], ps.r * 2.32, ps.r * 2.32, stOpt);
          if (cf === 2 || cf === 4) {
            B.box('concrete', cxP - 1.4, cxP + 1.4, 5.5, cyP - ps.r * 0.5, czP - 1.4, czP + 1.4, stOpt);
          }
        }
        // Horizontal distributor header feeding both scroll-case dynamos on each side (seated on L1 at y = 5.5 .. 8.8 m)
        B.box('concrete', sgn * 29.0 - 1.8, sgn * 29.0 + 1.8, 5.5, 6.9, -18.2, -3.2, stOpt);
        B.box(trimMat, sgn * 29.0 - 1.1, sgn * 29.0 + 1.1, 6.8, 8.9, -17.8, -3.5, stOpt);
        tagPart(ps.id, 'High-Pressure Hydro Penstock (' + (sgn < 0 ? 'West' : 'East') + ')', (ps.a[0] + ps.b[0]) * 0.5, 19.0, (ps.a[2] + ps.b[2]) * 0.5, 6.0, 24.0, 24.0, 'infrastructure');
      });

      // 9f. Four Scroll-Case Hydro-Dynamos & Exciter Switchgear Feeding the Ancient Trunk Splices!
      HH.dynamos.forEach(function (dy, di) {
        var sgn = dy.x < 0 ? -1 : 1;
        B.box('concrete', dy.x - 3.6, dy.x + 3.6, 5.5, 6.6, dy.z - 3.4, dy.z + 3.4, stOpt);
        B.cyl(trimMat, dy.x - sgn * 0.8, dy.z, 6.5, 10.2, 2.85, 2.45, 16, stOpt);
        B.box('bronze', dy.x + sgn * 0.6, dy.x + sgn * 3.4, 6.5, 9.8, dy.z - 2.1, dy.z + 2.1, stOpt);
        B.box(trimMat, dy.x + sgn * 3.6, dy.x + sgn * 5.0, 6.4, 10.6, dy.z - 1.8, dy.z + 1.8, stOpt);
        B.box(arcMat, dy.x + sgn * 3.5, dy.x + sgn * 5.1, 8.2, 9.6, dy.z - 1.2, dy.z + 1.2, {});
        tagPart(dy.id, 'Scroll-Case Hydro-Dynamo (' + dy.mw + ' MW, spliced to ' + dy.spliceTo + ')', dy.x, 8.2, dy.z, 7.5, 7.0, 4.8, 'industry');

        var dg = new THREE.Group();
        dg.position.set(dy.x + sgn * 1.9, 8.2, dy.z);
        var DB = AV.builder();
        DB.beam('bronze', [-1.8, 0, 0], [1.8, 0, 0], 1.45, 1.45, {});
        DB.beam(arcMat, [-1.95, 0, 0], [1.95, 0, 0], 0.85, 0.85, {});
        var dm = DB.finish(dy.id + '.rotor');
        dm.traverse(function (m) { if (m.isMesh) m.userData.decor = true; });
        dg.add(dm);
        kineticGroup.add(dg);
        spinX.push({ g: dg, rate: (di % 2 === 0 ? 4.8 : -4.8) });
      });

      // 9g. Two Water-Powered Cam Trip-Hammers & Glowing Forge Billet Anvils (North Foundry Floor, z = -30.5 m)
      HH.tripHammers.forEach(function (th) {
        var sgn = th.x < 0 ? -1 : 1;
        B.box('stone', th.x - 2.1, th.x + 2.1, 5.5, 6.8, th.z - 2.1, th.z + 2.1, stOpt);
        B.box(trimMat, th.x - 1.25, th.x + 1.25, 6.7, 8.1, th.z - 1.25, th.z + 1.25, stOpt);
        B.box(glowMat, th.x - 0.85, th.x + 0.85, 8.08, 8.62, th.z - 0.55, th.z + 0.55, {});
        var fxP = th.x + sgn * 3.8, cxW = th.x + sgn * 5.8;
        B.box(trimMat, Math.min(th.x - sgn * 0.5, cxW + sgn * 1.2), Math.max(th.x - sgn * 0.5, cxW + sgn * 1.2), 5.5, 6.4, th.z - 2.2, th.z + 2.2, stOpt);
        B.box(trimMat, fxP - 0.65, fxP + 0.65, 6.3, 10.6, th.z - 1.75, th.z - 0.95, stOpt);
        B.box(trimMat, fxP - 0.65, fxP + 0.65, 6.3, 10.6, th.z + 0.95, th.z + 1.75, stOpt);
        B.box(trimMat, cxW - 0.65, cxW + 0.65, 6.3, 9.8, th.z - 1.65, th.z - 0.95, stOpt);
        B.box(trimMat, cxW - 0.65, cxW + 0.65, 6.3, 9.8, th.z + 0.95, th.z + 1.65, stOpt);
        // Slanted heavy leather drive belt linking longitudinal line-shaft (x = +-19.2, y = 13.2) down to trip-cam axle (cxW, 8.4, th.z)!
        B.beam('dark', [sgn * 19.2, 13.2, th.z - 0.25], [cxW, 8.4, th.z - 0.25], 0.16, 0.52, {});
        B.beam('dark', [sgn * 19.2, 13.2, th.z + 0.25], [cxW, 8.4, th.z + 0.25], 0.16, 0.52, {});
        tagPart(th.id, 'Water-Powered Forge Trip-Hammer (' + (sgn < 0 ? 'West' : 'East') + ')', th.x + sgn * 2.2, 8.5, th.z, 9.0, 4.8, 6.0, 'industry');

        var cg = new THREE.Group();
        cg.position.set(cxW, 8.4, th.z);
        var CB = AV.builder();
        CB.beam(trimMat, [0, 0, -1.5], [0, 0, 1.5], 0.55, 0.55, {});
        CB.cyl('bronze', 0, 0, -0.45, 0.45, 1.35, 1.35, 12, {});
        for (var cd = 0; cd < 4; cd++) {
          var ca = (cd / 4) * TAU;
          CB.beam(trimMat, [0, 0, 0], [Math.cos(ca) * 1.85, Math.sin(ca) * 1.85, 0], 0.45, 0.65, {});
        }
        var cm = CB.finish(th.id + '.cam');
        cm.traverse(function (m) { if (m.isMesh) m.userData.decor = true; });
        cg.add(cm);
        kineticGroup.add(cg);
        spinZ.push({ g: cg, rate: sgn * 1.9 });

        var hg = new THREE.Group();
        hg.position.set(fxP, 9.6, th.z);
        var HB = AV.builder();
        HB.beam(bucketMat, [sgn * 1.9, 0, 0], [-sgn * 4.1, 0, 0], 0.72, 0.82, {});
        HB.obox(trimMat, -sgn * 3.8, -0.58, 0, 0, 1.35, 1.55, 1.25, {});
        HB.obox(trimMat, 0, 0, 0, 0, 0.95, 1.05, 2.4, {});
        var hm = HB.finish(th.id + '.helve');
        hm.traverse(function (m) { if (m.isMesh) m.userData.decor = true; });
        hg.add(hm);
        var u0 = ((th.phase / (Math.PI * 0.5)) % 1 + 1) % 1;
        var lift0 = u0 < 0.76 ? (u0 / 0.76) : Math.max(0, 1.0 - (u0 - 0.76) / 0.24);
        hg.rotation.z = sgn * (0.04 - 0.30 * lift0);
        kineticGroup.add(hg);
        hammers.push({ g: hg, sgn: sgn, phase: th.phase, t: 0 });
      });

      // 9h. Two Towering Blast Cupola Smelting Furnaces & Molten Tapping Launders (z = -39.0 m, h = 19.5 m)
      HH.cupolas.forEach(function (cp) {
        var sgn = cp.x < 0 ? -1 : 1;
        B.cyl('stone', cp.x, cp.z, 5.5, 10.4, cp.r + 0.95, cp.r + 0.45, 16, stOpt);
        B.cyl(trimMat, cp.x, cp.z, 10.2, 6.0 + cp.h, cp.r, cp.r * 0.74, 16, stOpt);
        B.cyl('bronze', cp.x, cp.z, 5.8 + cp.h, 8.2 + cp.h, cp.r * 0.96, cp.r * 0.45, 12, stOpt);
        for (var bhY = 12.0; bhY <= 5.0 + cp.h; bhY += 3.6) {
          B.cyl('bronze', cp.x, cp.z, bhY - 0.22, bhY + 0.22, cp.r + 0.18, cp.r + 0.18, 16, stOpt);
        }
        B.box(trimMat, Math.min(cp.x, sgn * 35.0), Math.max(cp.x, sgn * 35.0), 15.6, 16.3, cp.z - 2.0, cp.z + 2.0, stOpt);
        B.cyl(glowMat, cp.x, cp.z, 8.1, 8.75, cp.r + 0.52, cp.r + 0.52, 16, {});
        B.box('stone', cp.x - 2.6, cp.x + 2.6, 5.6, 6.45, cp.z + cp.r + 0.2, cp.z + cp.r + 5.8, stOpt);
        B.box(glowMat, cp.x - 0.55, cp.x + 0.55, 6.42, 7.65, cp.z + cp.r - 0.2, cp.z + cp.r + 2.2, {});
        B.box(glowMat, cp.x - 1.85, cp.x + 1.85, 6.44, 6.62, cp.z + cp.r + 1.8, cp.z + cp.r + 5.2, {});
        tagPart(cp.id, 'Blast Cupola Smelting Furnace (' + (sgn < 0 ? 'West' : 'East') + ')', cp.x, 6.0 + cp.h * 0.5, cp.z, cp.r * 2.5, cp.r * 2.5, cp.h + 2.5, 'industry');
      });

      // 9i. Overhead Travelling Foundry Ladle Crane (z = -29.0 m) + Precision Ancient-Dynamo Rigging Bridge (z = -15.8 m)
      if (HH.bridgeCrane) {
        var bc = HH.bridgeCrane;
        [-41.5, 41.5].forEach(function (rx) {
          B.box(trimMat, rx - 0.75, rx + 0.75, bc.y - 1.4, bc.y - 0.1, -46.0, 46.0, stOpt);
        });
        B.box(trimMat, -42.5, 42.5, bc.y - 0.2, bc.y + 1.45, bc.z - 2.1, bc.z - 1.1, stOpt);
        B.box(trimMat, -42.5, 42.5, bc.y - 0.2, bc.y + 1.45, bc.z + 1.1, bc.z + 2.1, stOpt);
        var lxC = bc.ladleX;
        B.box('bronze', lxC - 2.4, lxC + 2.4, bc.y + 1.35, bc.y + 3.1, bc.z - 2.2, bc.z + 2.2, stOpt);
        B.box(trimMat, lxC - 1.15, lxC - 0.85, 17.6, bc.y + 1.4, bc.z - 0.18, bc.z + 0.18, stOpt);
        B.box(trimMat, lxC + 0.85, lxC + 1.15, 17.6, bc.y + 1.4, bc.z - 0.18, bc.z + 0.18, stOpt);
        B.box(trimMat, lxC - 2.45, lxC + 2.45, 17.4, 18.1, bc.z - 0.35, bc.z + 0.35, stOpt);
        B.cyl(trimMat, lxC, bc.z, 14.5, 17.6, 1.85, 2.25, 16, stOpt);
        B.cyl(glowMat, lxC, bc.z, 17.35, 17.68, 2.05, 2.05, 16, {});
        tagPart(bc.id, 'Overhead Foundry Bridge Crane and Molten Ladle', 0, bc.y, bc.z, 85.0, 6.0, 26.0, 'infrastructure');
      }
      if (HH.salvageHoist) {
        var sh = HH.salvageHoist;
        B.box(trimMat, -42.5, 42.5, sh.y - 0.1, sh.y + 1.15, sh.z - 1.4, sh.z - 0.65, stOpt);
        B.box(trimMat, -42.5, 42.5, sh.y - 0.1, sh.y + 1.15, sh.z + 0.65, sh.z + 1.4, stOpt);
        B.box('bronze', sh.hoistX - 2.1, sh.hoistX + 2.1, sh.y + 1.05, sh.y + 2.45, sh.z - 1.55, sh.z + 1.55, stOpt);
        // Locked steel rigging cables holding the upper stabilization yoke of the Failed Ancient Prime Dynamo!
        [-2.2, 2.2].forEach(function (hxR) {
          B.beam('iron', [sh.hoistX + hxR * 0.5, sh.y + 1.1, sh.z], [hxR * 2.4, 27.3, sh.z], 0.16, 0.16, stOpt);
        });
        tagPart(sh.id, 'Ancient Dynamo Stabilization Rigging Bridge', 0, sh.y, sh.z, 85.0, 4.0, 14.0, 'infrastructure');
      }
    }

    // 9j. Iron Republic Exterior Tailrace Paddlewheels, Barge Gantries & Triskele Banners
    if (isRep) {
      P.republican.forEach(function (rp) {
        if (rp.kind === 'waterwheel') {
          B.obox('stone', rp.x, -1.2, rp.z, rp.yaw, rp.w + 1.8, 4.2, 2.6, stOpt);
          var wg2 = new THREE.Group();
          wg2.position.set(rp.x, rp.y, rp.z);
          wg2.rotation.y = rp.yaw;
          var WB2 = AV.builder();
          WB2.cyl('iron', 0, 0, -rp.w * 0.5, rp.w * 0.5, 0.55, 0.55, 12, {});
          for (var sp = 0; sp < 10; sp++) {
            var sa = (sp / 10) * TAU;
            WB2.beam('iron', [0, 0, 0], [Math.cos(sa) * rp.r, Math.sin(sa) * rp.r, 0], 0.28, 0.28, {});
            WB2.obox('timber', Math.cos(sa) * rp.r, Math.sin(sa) * rp.r, 0, 0, 0.35, 1.1, rp.w, {});
          }
          var wm2 = WB2.finish(rp.id);
          wm2.traverse(function (m) { if (m.isMesh) m.userData.decor = true; });
          wg2.add(wm2);
          kineticGroup.add(wg2);
          spinZ.push({ g: wg2, rate: 0.65 });
          tagPart(rp.id, 'Iron Republic Tailrace Paddlewheel (' + rp.face + ')', rp.x, rp.y, rp.z, rp.r * 2, rp.w, rp.r * 2, 'industry');
        } else if (rp.kind === 'gantry') {
          var gc = Math.cos(rp.yaw), gs = Math.sin(rp.yaw);
          B.obox('iron', rp.x, rp.y + rp.h * 0.5, rp.z, rp.yaw, 2.8, rp.h + 0.8, 2.8, stOpt);
          B.beam('iron', [rp.x, rp.y + rp.h, rp.z], [rp.x + gc * rp.boom, rp.y + rp.h + 3.5, rp.z + gs * rp.boom], 0.9, 1.1, stOpt);
          B.beam('iron', [rp.x, rp.y + rp.h * 0.55, rp.z], [rp.x + gc * rp.boom * 0.65, rp.y + rp.h + 2.2, rp.z + gs * rp.boom * 0.65], 0.55, 0.55, stOpt);
          tagPart(rp.id, 'Iron Republic Forged-Iron Gantry Crane', rp.x, rp.y + rp.h * 0.5, rp.z, 6, rp.boom, rp.h + 4, 'infrastructure');
        } else if (rp.kind === 'banner') {
          var bYaw = rp.yaw + Math.PI / 2;
          B.obox('iron', rp.x, rp.y + rp.h * 0.5 + 0.3, rp.z, bYaw, rp.w + 1.0, 0.45, 1.6, stOpt);
          B.obox('repRed', rp.x, rp.y, rp.z, bYaw, rp.w, rp.h, 0.22, {});
          B.obox('repOchre', rp.x, rp.y, rp.z, bYaw, rp.w * 0.36, rp.h * 0.36, 0.32, {});
        }
      });
    }

    var hero = B.finish(P.id);
    hero.position.set(gx, gy, gz);
    if (kineticGroup.children.length) {
      hero.add(kineticGroup);
      tick(function (dt) {
        var d = dt == null ? 0.016 : Math.min(dt, 0.05);
        for (var ix = 0; ix < spinX.length; ix++) spinX[ix].g.rotation.x += d * spinX[ix].rate;
        for (var iy = 0; iy < spinY.length; iy++) spinY[iy].g.rotation.y += d * spinY[iy].rate;
        for (var iz = 0; iz < spinZ.length; iz++) spinZ[iz].g.rotation.z += d * spinZ[iz].rate;
        for (var ih = 0; ih < hammers.length; ih++) {
          var H = hammers[ih];
          H.t += d * 1.9;
          var cyc = (((H.phase + H.t) / (Math.PI * 0.5)) % 1 + 1) % 1;
          var lift = cyc < 0.76 ? (cyc / 0.76) : Math.max(0, 1.0 - (cyc - 0.76) / 0.24);
          H.g.rotation.z = H.sgn * (0.04 - 0.30 * lift);
        }
      });
    }
    if (isRuin) {
      var rub = buildRubbleGroup(P, gx, gz);
      hero.add(rub);
      hero.userData.heaps = rub.userData.heaps;
    }
    hero.userData.plan = P;
    hero.userData.gx = gx;
    hero.userData.gz = gz;
    return hero;
  };
})();
