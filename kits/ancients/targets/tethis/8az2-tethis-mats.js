/* ================================================================= TETHIS — materials, instanced kit & saucer/pylon geometry ([draw])
   Defines Tethis's Soleri stepped ribbon-glazing maps, warm mushroom-soffit coffers, Hykkousoi nacre/pearl-shell
   materials, shallow coral-sand vertex-coloured seabed material, instanced capsule/nacre/coral/vessel pieces, and
   reusable geometry builders for fluted pylon clusters and bevelled annular saucers.
   Deterministic (no rng()): listed in DETERMINISTIC in kits/ancients/build.py. */

var TETHIS_MAT = (function () {
  'use strict';

  /* ---- 1. Procedural ribbon-fenestration & warm/cyan interior glow textures ---- */
  function makeRibbonTex(worn, emissiveOnly) {
    return canvasTex(256, 256, function (g, w, h) {
      var id = g.createImageData(w, h), d = id.data;
      /* 4 storeys per 256 px tile (64 px = 4.2 m storey): spandrel sill + recessed ribbon window + sun-hood */
      for (var y = 0; y < h; y++) {
        var fy = y % 64;
        var stIdx = Math.floor(y / 64);
        var inWin = fy >= 16 && fy <= 48;
        var inHood = fy >= 11 && fy < 16;
        var inSill = fy > 48 && fy <= 53;
        for (var x = 0; x < w; x++) {
          var i = (y * w + x) * 4;
          var bay = Math.floor(x / 16);
          var fx = x % 16;
          var mull = (fx === 0 || fx === 15);
          var hsh = h3(bay * 3.7 + (worn ? 41.0 : 0.0), stIdx * 5.3, 9.1);
          var n = fbm(x / 28.0, y / 28.0, worn ? 12.4 : 4.2, 2);

          if (emissiveOnly) {
            if (!inWin || mull) {
              d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = 255;
            } else if (!worn) {
              /* Intact Ancient: 72% lit apartments/studios — warm ivory-gold living rooms + soft cyan-white studios */
              var lit = hsh > 0.24;
              var warm = h3(bay * 1.9, stIdx * 2.7, 3.3) > 0.32;
              var br = lit ? (0.55 + 0.45 * h3(bay * 7.1, stIdx * 1.3, 5.5)) : 0.08;
              d[i] = Math.round((warm ? 255 : 145) * br);
              d[i + 1] = Math.round((warm ? 214 : 235) * br);
              d[i + 2] = Math.round((warm ? 148 : 255) * br);
              d[i + 3] = 255;
            } else {
              /* Modern Hykkousoi: warm pearl-oil & amber lamps in occupied bays (~46% lit) */
              var litH = hsh > 0.54;
              var brH = litH ? (0.45 + 0.45 * h3(bay * 4.3, stIdx * 6.1, 2.7)) : 0.0;
              d[i] = Math.round(255 * brH);
              d[i + 1] = Math.round(182 * brH);
              d[i + 2] = Math.round(96 * brH);
              d[i + 3] = 255;
            }
            continue;
          }

          var r, gg, b;
          if (!inWin) {
            /* Architectural spandrel concrete / white alloy band */
            var base = worn ? (168 + (n - 0.5) * 34) : (228 + (n - 0.5) * 18);
            if (inHood) base += 14;
            if (inSill) base -= 20;
            if (fy === 0 || fy === 63) base -= 26;
            r = base + (worn ? 6 : 2);
            gg = base + (worn ? 2 : 1);
            b = base - (worn ? 8 : 3);
          } else if (mull) {
            var mCol = worn ? 124 : 196;
            r = mCol; gg = mCol - 2; b = mCol - 6;
          } else {
            /* Glazed window bay: deep cerulean-slate reflection intact, shell-screened or weathered sea-glass in modern */
            if (!worn) {
              var sky = 0.75 + 0.25 * Math.sin((fy - 16) / 32.0 * Math.PI);
              r = Math.round(44 * sky + hsh * 24);
              gg = Math.round(92 * sky + hsh * 28);
              b = Math.round(132 * sky + hsh * 26);
            } else if (hsh > 0.52) {
              /* Translucent mother-of-pearl / nacre window lattice fitted by Hykkousoi */
              r = Math.round(198 + (n - 0.5) * 24);
              gg = Math.round(186 + (n - 0.5) * 22);
              b = Math.round(166 + (n - 0.5) * 20);
            } else {
              r = 52; gg = 64; b = 70;
            }
          }
          d[i] = clamp(r, 0, 255);
          d[i + 1] = clamp(gg, 0, 255);
          d[i + 2] = clamp(b, 0, 255);
          d[i + 3] = 255;
        }
      }
      g.putImageData(id, 0, 0);
    });
  }

  /* Radial mushroom-cap soffit coffer texture (Ref 3: glowing warm-amber & cyan radial soffit panels) */
  function makeSoffitTex(worn, emissiveOnly) {
    return canvasTex(256, 256, function (g, w, h) {
      var id = g.createImageData(w, h), d = id.data;
      for (var y = 0; y < h; y++) {
        var ringF = (y % 32) / 32.0;
        var ringRib = (y % 32) < 5 || (y % 32) > 28;
        for (var x = 0; x < w; x++) {
          var i = (y * w + x) * 4;
          var radRib = (x % 32) < 6 || (x % 32) > 27;
          var isRib = ringRib || radRib;
          if (emissiveOnly) {
            if (isRib) {
              d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = 255;
            } else if (!worn) {
              /* Warm golden-amber outer coffers + soft cyan inner ring (Ref 3!) */
              var inner = y < 96;
              var pulse = 0.72 + 0.28 * Math.sin(ringF * Math.PI);
              d[i] = Math.round((inner ? 130 : 255) * pulse);
              d[i + 1] = Math.round((inner ? 232 : 196) * pulse);
              d[i + 2] = Math.round((inner ? 255 : 118) * pulse);
              d[i + 3] = 255;
            } else {
              /* Hykkousoi brazier-lit warm amber soffit glow */
              var p2 = 0.42 + 0.25 * Math.sin(ringF * Math.PI);
              d[i] = Math.round(240 * p2);
              d[i + 1] = Math.round(156 * p2);
              d[i + 2] = Math.round(78 * p2);
              d[i + 3] = 255;
            }
          } else {
            var v = isRib ? (worn ? 152 : 218) : (worn ? 188 : 238);
            d[i] = v;
            d[i + 1] = v - (isRib ? 4 : 10);
            d[i + 2] = v - (isRib ? 10 : 26);
            d[i + 3] = 255;
          }
        }
      }
      g.putImageData(id, 0, 0);
    });
  }

  /* Grown Hykkousoi nacre / mother-of-pearl texture: calcified growth ridges + warm rose-ivory iridescence */
  TEX.nvNacre = canvasTex(256, 256, function (g, w, h) {
    var id = g.createImageData(w, h), d = id.data;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var i = (y * w + x) * 4;
        var rib = 0.5 + 0.5 * Math.cos((y / 256.0) * TAU * 18.0 + (fbm(x / 32.0, y / 32.0, 2.1, 2) - 0.5) * 2.2);
        var n = fbm(x / 18.0, y / 18.0, 6.7, 3);
        var v = 208 + rib * 26 + (n - 0.5) * 22;
        /* Subtle rose-peach & seafoam nacre tint */
        var irid = Math.sin((x + y) / 29.0 + n * 4.0);
        d[i] = clamp(v + 10 + irid * 7, 0, 255);
        d[i + 1] = clamp(v + 2 - irid * 3, 0, 255);
        d[i + 2] = clamp(v - 12 + irid * 9, 0, 255);
        d[i + 3] = 255;
      }
    }
    g.putImageData(id, 0, 0);
  });

  TEX.nvRibbonI = makeRibbonTex(false, false);
  TEX.nvRibbonIE = makeRibbonTex(false, true);
  TEX.nvRibbonW = makeRibbonTex(true, false);
  TEX.nvRibbonWE = makeRibbonTex(true, true);
  TEX.nvSoffitI = makeSoffitTex(false, false);
  TEX.nvSoffitIE = makeSoffitTex(false, true);
  TEX.nvSoffitW = makeSoffitTex(true, false);
  TEX.nvSoffitWE = makeSoffitTex(true, true);

  MAT.nvRibbonI = new THREE.MeshStandardMaterial({
    map: TEX.nvRibbonI, emissive: 0xffffff, emissiveMap: TEX.nvRibbonIE, emissiveIntensity: 0.46,
    roughness: 0.42, metalness: 0.18, side: DS
  });
  MAT.nvRibbonW = new THREE.MeshStandardMaterial({
    map: TEX.nvRibbonW, emissive: 0xffffff, emissiveMap: TEX.nvRibbonWE, emissiveIntensity: 0.34,
    roughness: 0.68, metalness: 0.10, side: DS
  });
  MAT.nvSoffitI = new THREE.MeshStandardMaterial({
    map: TEX.nvSoffitI, emissive: 0xffffff, emissiveMap: TEX.nvSoffitIE, emissiveIntensity: 0.62,
    roughness: 0.50, metalness: 0.12, side: DS
  });
  MAT.nvSoffitW = new THREE.MeshStandardMaterial({
    map: TEX.nvSoffitW, emissive: 0xffffff, emissiveMap: TEX.nvSoffitWE, emissiveIntensity: 0.38,
    roughness: 0.72, metalness: 0.08, side: DS
  });

  MAT.nvNacre = new THREE.MeshStandardMaterial({
    map: TEX.nvNacre, color: 0xfbf0e2, roughness: 0.34, metalness: 0.12, side: DS
  });
  MAT.nvNacreCoral = new THREE.MeshStandardMaterial({
    map: TEX.nvNacre, color: 0xe8b89e, roughness: 0.42, metalness: 0.08, side: DS
  });
  MAT.nvDeckI = new THREE.MeshStandardMaterial({
    map: TEX.concrete, roughnessMap: TEX.concreteRM, color: 0xe6e1d6, roughness: 0.85, metalness: 0.04, side: DS
  });
  MAT.nvDeckW = new THREE.MeshStandardMaterial({
    map: TEX.concrete, roughnessMap: TEX.concreteRM, color: 0xc2b9a8, roughness: 0.92, metalness: 0.04, side: DS
  });
  MAT.nvBarnacle = new THREE.MeshStandardMaterial({
    map: TEX.rubbleStone, color: 0x4b564e, roughness: 0.96, metalness: 0.02, side: DS
  });
  MAT.nvCoralSand = new THREE.MeshStandardMaterial({
    map: TEX.rubbleStone, vertexColors: true, roughness: 0.94, metalness: 0.0, side: DS
  });
  MAT.nvSubGlassI = new THREE.MeshStandardMaterial({
    color: 0x56f0ff, emissive: 0x1ca8c8, emissiveIntensity: 0.85, roughness: 0.12, metalness: 0.25,
    transparent: true, opacity: 0.74, side: DS, depthWrite: false
  });
  MAT.nvSubPearlGlow = new THREE.MeshStandardMaterial({
    color: 0xffe8c2, emissive: 0xefb86b, emissiveIntensity: 0.78, roughness: 0.28, metalness: 0.10, side: DS
  });
  MAT.nvConservatoryI = new THREE.MeshStandardMaterial({
    color: 0x5cc4e8, emissive: 0x103c58, emissiveIntensity: 0.35, roughness: 0.08, metalness: 0.25,
    transparent: true, opacity: 0.42, side: DS, depthWrite: false
  });
  MAT.nvConservatoryW = new THREE.MeshStandardMaterial({
    map: TEX.nvNacre, color: 0xf2dfc0, emissive: 0xd89648, emissiveIntensity: 0.22, roughness: 0.36, metalness: 0.08,
    transparent: true, opacity: 0.56, side: DS, depthWrite: false
  });
  MAT.nvAmberCore = new THREE.MeshStandardMaterial({
    color: 0xffdca4, emissive: 0xffad48, emissiveIntensity: 0.72, roughness: 0.35, metalness: 0.10, side: DS
  });
  MAT.nvSubBrace = new THREE.MeshStandardMaterial({
    map: TEX.concrete, color: 0x5c7c84, roughness: 0.92, metalness: 0.05, side: DS
  });
  MAT.nvSailHyk = new THREE.MeshStandardMaterial({
    map: TEX.tarp, color: 0xf2dfc2, roughness: 0.82, metalness: 0.0, side: DS
  });
  MAT.nvBoatAnc = new THREE.MeshStandardMaterial({
    color: 0xf0f4f8, roughness: 0.28, metalness: 0.35, side: DS
  });
  MAT.nvBoatHyk = new THREE.MeshStandardMaterial({
    map: TEX.timber, color: 0xc99668, roughness: 0.78, metalness: 0.08, side: DS
  });
  MAT.nvCoral = new THREE.MeshStandardMaterial({
    map: TEX.rubbleStone, color: 0xffffff, roughness: 0.88, metalness: 0.0, side: DS
  });

  /* ---- 2. Custom instanced kit definitions (kdef) ---- */
  /* Plug-in Metabolist/Soleri dwelling capsule (Ref 4): deep projecting chamfered unit, local +Z radially outward */
  function makeCapsuleGeo() {
    var g = new THREE.BoxGeometry(3.3, 2.95, 6.4);
    var p = g.attributes.position;
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (z > 0) {
        /* Crisp Soleri taper & hooded sun-brow on the outer seaward end */
        x *= 0.84;
        y *= 0.92;
        if (y > 0) z += 0.42;
      }
      p.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals();
    return g;
  }
  kdef('nvCapModI', makeCapsuleGeo(), MAT.white);
  kdef('nvCapModW', makeCapsuleGeo(), MAT.nvDeckW);
  kdef('nvCapPortI', new THREE.CylinderGeometry(0.96, 0.96, 0.42, 12).rotateX(Math.PI / 2), MAT.nvSubGlassI);
  kdef('nvCapPortW', new THREE.CylinderGeometry(0.96, 0.96, 0.42, 12).rotateX(Math.PI / 2), MAT.nvSubPearlGlow);
  kdef('nvSubBrace', new THREE.BoxGeometry(1, 1, 1), MAT.nvSubBrace);

  /* Hykkousoi ribbed nacre barnacle-pod & cantilevered scallop-balcony */
  var nacrePodGeo = lathe({
    rFn: function (y) { return 0.38 + 0.62 * Math.sin(Math.PI * Math.pow(clamp(y, 0, 1), 0.72)); },
    H: 1.0, flutes: 10, amp: 0.09, sharp: 1.6, nu: 20, nv: 10
  });
  kdef('nvNacrePod', nacrePodGeo, MAT.nvNacre);

  var scallopGeo = gridSurface(function (u, v) {
    var a = (u - 0.5) * Math.PI * 1.12;
    var rad = 0.22 + 0.78 * v;
    var rib = 0.06 * Math.cos(u * TAU * 7.0) * v;
    var y = -0.32 * (1.0 - v) * (1.0 - v) + rib + (v > 0.88 ? (v - 0.88) * 2.2 : 0.0);
    return [Math.sin(a) * rad, y, Math.cos(a) * rad];
  }, 16, 8, { uS: 1, vS: 1 });
  kdef('nvScallop', scallopGeo, MAT.nvNacreCoral);

  /* Organic whalebone/nacre structural rib segment */
  kdef('nvRibSeg', new THREE.CylinderGeometry(0.42, 0.58, 1.0, 8), MAT.nvNacre);

  /* Shallow-sea reef corals & giant kelp (skipped by KRUINS via skip predicate) */
  kdef('nvCoralBrain', new THREE.IcosahedronGeometry(1.0, 1), MAT.nvCoral);
  kdef('nvCoralStag', new THREE.CylinderGeometry(1.25, 0.26, 0.52, 9), MAT.nvCoral);
  kdef('nvCoralFan', new THREE.CylinderGeometry(1.1, 0.18, 1.35, 7).scale(1.0, 1.0, 0.22), MAT.nvCoral);
  kdef('nvKelp', new THREE.CylinderGeometry(0.08, 0.18, 1.0, 5).translate(0, 0.5, 0), MAT.vine);

  /* Vessels: sleek Ancient hydrofoil catamaran (d=0) & Hykkousoi outrigger/trireme with lateen shell-sail (d=1) */
  function makeAncBoatGeo() {
    var g = new THREE.ConeGeometry(1.0, 4.6, 6);
    g.rotateX(Math.PI / 2);
    g.scale(0.55, 0.28, 1.0);
    return g;
  }
  function makeHykHullGeo() {
    var g = new THREE.CylinderGeometry(0.45, 0.65, 5.4, 7);
    g.rotateX(Math.PI / 2);
    g.scale(0.85, 0.48, 1.0);
    return g;
  }
  kdef('nvBoatAnc', makeAncBoatGeo(), MAT.nvBoatAnc);
  kdef('nvBoatHyk', makeHykHullGeo(), MAT.nvBoatHyk);
  kdef('nvSailHyk', new THREE.ConeGeometry(1.2, 3.2, 3).translate(0, 1.8, 0), MAT.nvSailHyk);
  kdef('nvBuoyPearl', new THREE.SphereGeometry(0.55, 8, 6), MAT.nvNacre);

  /* ---- 3. Reusable geometry builders for Tethis saucers, pylons & bridges ---- */

  /* Build a fluted Brutalist/Soleri pylon pier from y0 to y1 (Ref 1), with seabed footing pad, submerged collar,
     and waterline wave-deflector collar + barnacle band. Appends geometries into buckets B. */
  function addPylon(B, py, d) {
    var x = py.x, z = py.z, r = py.r, y0 = py.y0, y1 = py.y1;
    var H = y1 - y0;
    if (H <= 1.0) return;
    var skinMat = (d > 0 || py.ruined) ? MAT.concreteR : MAT.concrete;
    var capMat = d > 0 ? MAT.nvDeckW : MAT.white;

    /* Fluted shaft with flared seabed bell-footing and flared top capital corbel */
    var shaft = lathe({
      rFn: function (yy) {
        var foot = yy < 5.5 ? (1.0 + 0.44 * Math.pow(1.0 - yy / 5.5, 1.8)) : 1.0;
        var cap = yy > H - 5.2 ? (1.0 + 0.50 * Math.pow((yy - (H - 5.2)) / 5.2, 1.6)) : 1.0;
        return r * foot * cap;
      },
      H: H, flutes: 12, amp: 0.095, sharp: 1.8, nu: 24, nv: 16
    });
    shaft.translate(x, y0, z);
    anhPut(B, skinMat, shaft);

    /* Waterline barnacle / marine-growth band (-1.8 m .. +2.2 m) */
    if (y0 < -1.8 && y1 > 2.4) {
      var bH = 3.8 * (0.65 + 0.5 * py.barnacleBand);
      var barn = new THREE.CylinderGeometry(r * 1.10, r * 1.14, bH, 16, 1, true);
      barn.translate(x, -1.6 + bH * 0.5, z);
      anhPut(B, MAT.nvBarnacle, barn);
    }

    /* Waterline wave-deflector collar at y = +7.5 m (Ref 1's horizontal pier rings!) */
    if (y1 > 11.0) {
      var col = new THREE.CylinderGeometry(r * 1.36, r * 1.28, 2.0, 18);
      col.translate(x, 7.5, z);
      anhPut(B, capMat, col);
    }
  }

  /* Tie a ring of pylons together with a shallow-submerged wave-brace ring (y = -3.4 m, clear of U0..U6 viewports!)
     and an upper soffit strut ring */
  function addPylonRingBracing(pylonsOfPlat, d) {
    var n = pylonsOfPlat.length;
    if (n < 3) return;
    for (var i = 0; i < n; i++) {
      var a = pylonsOfPlat[i], b = pylonsOfPlat[(i + 1) % n];
      if (a.y0 < -4.5 && b.y0 < -4.5) {
        rbeam('nvSubBrace', [a.x, -3.4, a.z], [b.x, -3.4, b.z], 1.8, 2.2, null);
      }
      var yBr = Math.min(a.y1, b.y1) - 2.2;
      if (yBr > 9.5) {
        rbeam(d > 0 ? 'strutR' : 'strutW', [a.x, yBr, a.z], [b.x, yBr, b.z], 2.2, 2.4, null);
      }
    }
  }

  /* Annular stepped Soleri saucer (Refs 1, 2, 4):
     - Curved bevelled/bullnosed concrete-and-white hull dish underneath (y0 - soffitDrop .. y0),
     - 24 radial structural ribs under the soffit,
     - Stepped concentric ribbon-glazed decks (st storeys), stepping inward on outer rim and outward on inner lagoon well,
     - Optional western ship-canal cut (P5: canalCutDeg = 180, canalWidth = 36),
     - Rooftop landscaped promenade / turf / parapet. */
  function addSaucer(B, p, d, isSat) {
    var cx = p.x, cz = p.z, rOut = p.rOut, rWell = p.rWell == null ? 0 : p.rWell;
    var y0 = p.y0, st = p.st, sto = 4.2, H = st * sto;
    var soffDrop = isSat ? 3.8 : 5.6;
    var nu = isSat ? 40 : 64;
    var HULL = TETHIS.HULL;
    var hasCanal = p.canalWidth != null && p.canalWidth > 0;
    var halfAng = hasCanal ? HULL.canalHalfAng(p) : 0;

    function inCanal(u) {
      return hasCanal && HULL.inCanal(p, u * TAU);
    }

    var hullMat = d > 0 ? (p.modern && p.modern.state === 'salvage_ruin' ? MAT.rust : MAT.nvDeckW) : MAT.white;
    var concMat = d > 0 ? MAT.concreteR : MAT.concrete;
    var ribMat = d > 0 ? MAT.nvRibbonW : MAT.nvRibbonI;
    var deckMat = d > 0 ? MAT.nvDeckW : MAT.nvDeckI;
    var turfMat = d > 0 ? MAT.turfR : MAT.turf;

    /* 1. Curved bullnosed saucer underside dish (from rWell to rOut — exact TETHIS.HULL.soffitY curve) */
    var rInSoff = rWell > 2.0 ? rWell : 0.6;
    var soffGeo = gridSurface(function (u, v) {
      var th = u * TAU;
      var r = lerp(rInSoff, rOut, v);
      return [cx + r * Math.cos(th), HULL.soffitY(p, r), cz + r * Math.sin(th)];
    }, nu, 10, { uS: rOut * TAU / 12.0, vS: (rOut - rInSoff) / 12.0, hole: hasCanal ? function (u) { return inCanal(u); } : null });
    anhPut(B, concMat, soffGeo);

    /* Radial soffit ribs under main saucers */
    var nRibs = isSat ? 12 : 24;
    var rBName = d > 0 ? 'boxCR' : 'boxW';
    for (var rb = 0; rb < nRibs; rb++) {
      var uR = (rb + 0.5) / nRibs;
      if (inCanal(uR)) continue;
      var thR = uR * TAU, cs = Math.cos(thR), sn = Math.sin(thR);
      var rA = rInSoff + 3.0, rB = rOut - 3.5;
      if (rB - rA > 8.0) {
        rbeam(rBName,
          [cx + rA * cs, y0 - soffDrop * 0.42, cz + rA * sn],
          [cx + rB * cs, y0 - soffDrop * 0.25, cz + rB * sn],
          2.2, 1.4, null);
      }
    }

    /* 2. Concentric stepped storeys (Live / Work / Recreation / Garden profiles) */
    var stepIn = HULL.stepIn(p);
    var wellStep = HULL.wellStep(p);

    for (var s = 0; s < st; s++) {
      var ya = y0 + s * sto, yb = ya + sto;
      var ro0 = rOut - s * stepIn;
      var ro1 = rOut - (s + 1) * stepIn;
      var ri0 = rWell > 2.0 ? (rWell + s * wellStep) : 0.0;
      var ri1 = rWell > 2.0 ? (rWell + (s + 1) * wellStep) : 0.0;
      if (ro0 - ri0 < 8.0) break;

      /* Outer vertical/battered ribbon-glazed facade of storey s */
      var wallOut = gridSurface(function (u, v) {
        var th = u * TAU;
        var rr = lerp(ro0, ro0 - 0.55, v);
        return [cx + rr * Math.cos(th), lerp(ya, yb, v), cz + rr * Math.sin(th)];
      }, nu, 1, { uS: Math.round(ro0 * TAU / 16.0), vS: 0.25, hole: hasCanal ? function (u) { return inCanal(u); } : null });
      anhPut(B, ribMat, wallOut);

      /* Outer cantilevered white/concrete balcony slab & parapet nose */
      var balcOut = gridSurface(function (u, v) {
        var th = u * TAU;
        var rr = lerp(Math.max(ri1, ro1 - 0.4), ro0 + 1.1, v);
        return [cx + rr * Math.cos(th), yb + 0.05, cz + rr * Math.sin(th)];
      }, nu, 1, { uS: ro0 * TAU / 10.0, vS: 1.0, hole: hasCanal ? function (u) { return inCanal(u); } : null });
      var balcMat = (p.zone === 'garden' && s >= 1) ? turfMat : deckMat;
      anhPut(B, balcMat, balcOut);

      /* Crisp white/concrete horizontal parapet fascia ring */
      var parOut = gridSurface(function (u, v) {
        var th = u * TAU, rr = ro0 + 1.1;
        return [cx + rr * Math.cos(th), yb - 0.35 + v * 1.25, cz + rr * Math.sin(th)];
      }, nu, 1, { uS: ro0 * TAU / 12.0, vS: 0.2, hole: hasCanal ? function (u) { return inCanal(u); } : null });
      anhPut(B, hullMat, parOut);

      /* Inner lagoon-well facade & stepped terrace (including P4's grand diving amphitheatre steps!) */
      if (rWell > 2.0) {
        var innerWallMat = p.profile === 'amphitheatre_saucer' ? hullMat : ribMat;
        var wallIn = gridSurface(function (u, v) {
          var th = u * TAU, rr = lerp(ri0, ri0 + 0.4, v);
          return [cx + rr * Math.cos(th), lerp(ya, yb, v), cz + rr * Math.sin(th)];
        }, nu, 1, { uS: Math.round(ri0 * TAU / 14.0), vS: 0.25, hole: hasCanal ? function (u) { return inCanal(u); } : null });
        anhPut(B, innerWallMat, wallIn);

        var stepInSlab = gridSurface(function (u, v) {
          var th = u * TAU, rr = lerp(ri0 - 0.6, Math.min(ro1, ri1 + 0.5), v);
          return [cx + rr * Math.cos(th), yb + 0.04, cz + rr * Math.sin(th)];
        }, nu, 1, { uS: ri0 * TAU / 10.0, vS: 1.0, hole: hasCanal ? function (u) { return inCanal(u); } : null });
        anhPut(B, deckMat, stepInSlab);
      }

      /* Close canal cut end-walls on P5 so there is never an open back-face */
      if (hasCanal) {
        [-1, 1].forEach(function (sg) {
          var thC = Math.PI + sg * halfAng;
          var cs = Math.cos(thC), sn = Math.sin(thC);
          var endG = gridSurface(function (u, v) {
            var rr = lerp(ri0, ro0, u);
            return [cx + rr * cs, lerp(y0 - soffDrop * 0.45, yb, v), cz + rr * sn];
          }, 4, 2, { uS: (ro0 - ri0) / 8.0, vS: (yb - y0) / 8.0 });
          anhPut(B, concMat, endG);
        });
      }
    }

    /* 3. Top crown deck (rooftop orchard turf on garden/live/rec saucers; paved works deck on work/infra) */
    var rTopOut = rOut - st * stepIn + 0.6;
    var rTopIn = rWell > 2.0 ? (rWell + st * wellStep - 0.4) : 0.0;
    if (rTopOut > rTopIn + 2.0) {
      var topMat = (p.gardenHa >= 1.5) ? turfMat : deckMat;
      var topCap = gridSurface(function (u, v) {
        var th = u * TAU, rr = lerp(rTopIn, rTopOut, v);
        return [cx + rr * Math.cos(th), y0 + H + 0.08, cz + rr * Math.sin(th)];
      }, nu, 3, { uS: rTopOut * TAU / 12.0, vS: (rTopOut - rTopIn) / 12.0, hole: hasCanal ? function (u) { return inCanal(u); } : null });
      anhPut(B, topMat, topCap);

      /* Inner garden ring strip on residential/civic saucers */
      if (p.gardenHa > 0.3 && p.gardenHa < 1.5 && rTopOut - rTopIn > 12.0) {
        var gMid0 = lerp(rTopIn, rTopOut, 0.28), gMid1 = lerp(rTopIn, rTopOut, 0.72);
        var gBelt = gridSurface(function (u, v) {
          var th = u * TAU, rr = lerp(gMid0, gMid1, v);
          return [cx + rr * Math.cos(th), y0 + H + 0.22, cz + rr * Math.sin(th)];
        }, nu, 1, { uS: gMid1 * TAU / 10.0, vS: 1.0, hole: hasCanal ? function (u) { return inCanal(u); } : null });
        anhPut(B, turfMat, gBelt);
      }
    }

    /* 4. Waterline sea-gate base ring & radial mooring slips (P0, P5, P6) */
    if (p.baseRing) {
      var br = p.baseRing, nGates = br.seaGates == null ? 4 : br.seaGates;
      var gateHole = function (u, v) {
        if (inCanal(u)) return true;
        if (v > 0.68) return false;
        var gu = (u * nGates) % 1.0;
        return gu > 0.32 && gu < 0.68;
      };
      var baseOut = gridSurface(function (u, v) {
        var th = u * TAU;
        return [cx + br.rOut * Math.cos(th), lerp(-3.0, br.y1, v), cz + br.rOut * Math.sin(th)];
      }, 56, 6, { uS: br.rOut * TAU / 10.0, vS: 1.5, hole: gateHole });
      var baseIn = gridSurface(function (u, v) {
        var th = u * TAU;
        return [cx + br.rWell * Math.cos(th), lerp(-3.0, br.y1, v), cz + br.rWell * Math.sin(th)];
      }, 48, 6, { uS: br.rWell * TAU / 10.0, vS: 1.5, hole: gateHole });
      var baseDeck = gridSurface(function (u, v) {
        var th = u * TAU, rr = lerp(br.rWell, br.rOut, v);
        return [cx + rr * Math.cos(th), br.y1, cz + rr * Math.sin(th)];
      }, 56, 2, { uS: br.rOut * TAU / 12.0, vS: 3.0, hole: hasCanal ? function (u) { return inCanal(u); } : null });
      anhPut(B, concMat, [baseOut, baseIn]);
      anhPut(B, deckMat, baseDeck);

      /* Vertical colonnade piers linking baseRing deck (+9..10.5 m) up to main saucer soffit (y0 - soffDrop) */
      for (var kp = 0; kp < 12; kp++) {
        var uP = (kp + 0.15) / 12.0;
        if (inCanal(uP)) continue;
        var thP = uP * TAU, rMid = (br.rWell + br.rOut) * 0.5;
        var px = cx + rMid * Math.cos(thP), pz = cz + rMid * Math.sin(thP);
        rbeam(d > 0 ? 'boxCR' : 'boxW', [px, br.y1 - 0.5, pz], [px, y0 - soffDrop * 0.35, pz], 3.6, 3.6, null);
      }
    }

    /* Radial lagoon mooring slips at y = +1.3 m inside rWell (Ref 4's radial inner fingers!) */
    if (p.slips && rWell >= 18) {
      var nSl = p.slips;
      for (var sl = 0; sl < nSl; sl++) {
        var uS = (sl + 0.5) / nSl;
        if (inCanal(uS)) continue;
        var thS = uS * TAU, csS = Math.cos(thS), snS = Math.sin(thS);
        var rSlipOut = p.baseRing ? p.baseRing.rWell + 2.0 : (p.pylonRing ? p.pylonRing.rad : rWell + 10.0);
        var rSlipIn = Math.max(8.0, rWell - 12.0);
        /* Seated on a submerged timber/concrete pile down to seabed so KRUINS sees every pier held! */
        var sbS = TETHIS.seabedAt(cx + rSlipIn * csS, cz + rSlipIn * snS);
        rbeam(d > 0 ? 'boxCR' : 'boxC',
          [cx + rSlipIn * csS, sbS - 0.6, cz + rSlipIn * snS],
          [cx + rSlipIn * csS, 1.5, cz + rSlipIn * snS], 2.0, 2.0, null);
        rbeam(d > 0 ? 'boxCR' : 'boxW',
          [cx + rSlipIn * csS, 1.1, cz + rSlipIn * snS],
          [cx + rSlipOut * csS, 1.1, cz + rSlipOut * snS], 1.1, 4.0, null);
      }
    }
  }

  return {
    addPylon: addPylon,
    addPylonRingBracing: addPylonRingBracing,
    addSaucer: addSaucer
  };
})();
