/* ================================================================= TETHIS — main pelagic arcology builder ([draw])
   Builds Tethis from TETHIS.plan records in two states:
     d = 0 (west site): Tethis as the Ancients built it — gleaming white/concrete saucers, gardens, mushroom & capsule towers
     d = 1 (east site): Tethis today, held by the Hykkousoi — upper rings kept dry with grown nacre pods & conch-helix,
                        rib-bridge & rib-drawbridge, flooded pearl sanctuaries below, and cut-off Salvage Island P8.
   Registers every placed object in core/tags (KTAGS.tethis) before drawing. */

var TETHIS_SITE = {};
var TETHIS_HULL = TETHIS.HULL;

function buildTethis(scene, gx, gz, d, opts) { reseed(12600+d); KOFF = [gx, 0, gz];

  var noTerrain = !!(opts && opts.noTerrain);
  var dd = d > 0 ? 1 : 0;
  var seed = 12600;
  var P = TETHIS.plan({ seed: seed });
  if (!noTerrain) TETHISWATER.addSite(dd, gx, gz, P);
  TETHIS_SITE[dd] = { x: gx, z: gz, P: P, hull: P.hull };

  var G = new THREE.Group();
  G.position.set(gx, 0, gz);
  G.name = 'tethis:' + (dd ? 'hykkousoi' : 'intact');
  G.userData.hull = P.hull;
  scene.add(G);

  /* Standalone demo horizon & far-plane fix + lower kit's dry-land ground plane below deepest sea channel (-38 m).
     Skipped when mounted on a host world with { noTerrain: true }. */
  if (!noTerrain) {
    if (typeof camera !== 'undefined' && camera.far < 30000) {
      camera.far = 30000;
      camera.updateProjectionMatrix();
    }
    if (typeof sky !== 'undefined') sky.renderOrder = -1;
    if (typeof skyMat !== 'undefined' && skyMat.fragmentShader.indexOf('pow(h,.55)') >= 0) {
      skyMat.fragmentShader = skyMat.fragmentShader.replace('pow(h,.55)', 'pow(max(h,0.),.55)');
      skyMat.needsUpdate = true;
    }
    if (typeof groundM !== 'undefined' && groundM.position.y > -37.0) {
      groundM.position.y = -37.5;
      MAT.ground.color.setHex(0x466876);
      MAT.ground.map = null;
      MAT.ground.needsUpdate = true;
    }
  }

  /* ---- 1. core/tags: register every placed element BEFORE drawing ---- */
  {
    var T = KTAGS.tethis || (KTAGS.tethis = KTAGS.create({ build: 'ancients-tethis' }));
    var pre = (dd ? 'hykkousoi' : 'intact') + '/';
    var W = function (x, y, z) { return [x + gx, y, z + gz]; };
    var rootCulture = dd ? 'hykkousoi' : 'ancient';
    var rootState = dd ? 'inhabited-ruin' : 'intact';

    var B_ROOT = T.add({
      id: pre + P.id,
      'class': 'building',
      kind: 'arcology',
      key: 'ancients:tethis',
      name: dd ? 'Tethis (Hykkousoi)' : 'Tethis (Ancient)',
      at: [gx, 0, gz],
      r: 730,
      h: P.stats.maxHeight,
      tags: {
        culture: rootCulture,
        types: ['dwelling-multi', 'civic', 'works', 'harbour'],
        state: rootState,
        landmark: true
      }
    });

    for (var ip = 0; ip < P.platforms.length; ip++) {
      var pl = P.platforms[ip];
      T.child(B_ROOT.id, {
        id: pre + pl.id, 'class': 'part', kind: 'saucer', key: pl.id, name: pl.name,
        at: W(pl.x, pl.y0, pl.z), r: pl.rOut, h: pl.h,
        tags: { zone: pl.zone, state: dd ? pl.modern.state : 'intact' }
      });
    }
    for (var is = 0; is < P.satellites.length; is++) {
      var st = P.satellites[is];
      T.child(B_ROOT.id, {
        id: pre + st.id, 'class': 'part', kind: 'satellite-saucer', key: st.id, name: st.name,
        at: W(st.x, st.y0, st.z), r: st.rOut, h: st.h,
        tags: { zone: st.zone, state: dd ? st.modern.state : 'intact' }
      });
    }
    for (var it = 0; it < P.towers.length; it++) {
      var tw = P.towers[it];
      T.child(B_ROOT.id, {
        id: pre + tw.id, 'class': 'part', kind: tw.kind, key: tw.id, name: tw.name,
        at: W(tw.x, tw.y0, tw.z), r: tw.rCap != null ? tw.rCap : tw.rDrum, h: tw.spireTop - tw.y0,
        tags: { zone: tw.zone, state: dd ? tw.modern.state : 'intact' }
      });
    }
    for (var iu = 0; iu < P.submerged.length; iu++) {
      var su = P.submerged[iu];
      T.child(B_ROOT.id, {
        id: pre + su.id, 'class': 'part', kind: 'submerged-rotunda', key: su.id, name: su.name,
        at: W(su.x, su.y0, su.z), r: su.rOut, h: su.y1 - su.y0,
        tags: { zone: su.zone, state: dd ? su.modern.state : 'intact', aquatic: true }
      });
    }
    for (var ib = 0; ib < P.bridges.length; ib++) {
      var br = P.bridges[ib];
      T.child(B_ROOT.id, {
        id: pre + br.id, 'class': 'infrastructure', kind: br.kind, key: br.id,
        at: W(br.pts[0][0], br.y, br.pts[0][1]),
        tags: { state: dd ? br.modernState : 'intact' }
      });
    }
    for (var ij = 0; ij < P.junctions.length; ij++) {
      var jn = P.junctions[ij];
      T.child(B_ROOT.id, {
        id: pre + jn.id, 'class': 'part', kind: 'belvedere-junction', key: jn.id, name: jn.name,
        at: W(jn.x, jn.y, jn.z), r: jn.r, h: 6.0
      });
    }
    if (dd) {
      for (var ih = 0; ih < P.hykkousoi.length; ih++) {
        var hy = P.hykkousoi[ih];
        T.child(B_ROOT.id, {
          id: pre + hy.id, 'class': 'part', kind: hy.kind, key: hy.id,
          at: W(hy.x, hy.y == null ? hy.y0 : hy.y, hy.z), r: hy.r,
          tags: { culture: 'hykkousoi' }
        });
      }
    }
  }

  /* ---- 2. Inspector REGISTER volumes (every volume guaranteed populated with instances) ---- */
  var stateTag = dd ? 'Hykkousoi' : 'Ancient intact';
  for (var rp = 0; rp < P.platforms.length; rp++) {
    var pp = P.platforms[rp];
    REGISTER({ name: pp.id + ' ' + pp.name + ' (' + stateTag + ')', x: pp.x, y: 0, z: pp.z, r: pp.rOut + 6, h: pp.y1 + 12 });
  }
  for (var rs = 0; rs < P.satellites.length; rs++) {
    var ss = P.satellites[rs];
    REGISTER({ name: ss.id + ' ' + ss.name + ' (' + stateTag + ')', x: ss.x, y: ss.y0 - 6, z: ss.z, r: ss.rOut + 4, h: ss.h + 14 });
  }
  for (var rt = 0; rt < P.towers.length; rt++) {
    var tt = P.towers[rt];
    var tr = tt.rCap != null ? tt.rCap : tt.rDrum;
    REGISTER({ name: tt.id + ' ' + tt.name + ' (' + stateTag + ')', x: tt.x, y: tt.y0, z: tt.z, r: tr + 4, h: tt.spireTop - tt.y0 + 6 });
  }
  for (var ru = 0; ru < P.submerged.length; ru++) {
    var uu = P.submerged[ru];
    REGISTER({ name: uu.id + ' ' + uu.name + ' (' + stateTag + ')', x: uu.x, y: uu.y0 - 2, z: uu.z, r: uu.rOut + 4, h: (uu.y1 - uu.y0) + 8 });
  }

  var B = new Map();
  var byId = {};
  P.platforms.concat(P.satellites, P.towers, P.submerged, P.junctions).forEach(function (o) { byId[o.id] = o; });

  /* Seabed height query: uses host opts.ground(wx, wz) when mounted on an open-world bed, else TETHISWATER.localBed */
  var bedAt = (opts && typeof opts.ground === 'function')
    ? function (lx, lz) { return opts.ground(gx + lx, gz + lz); }
    : TETHISWATER.localBed;

  /* Helper to seat any detached wreck geometry cleanly on bedAt so KRUINS low is -0.22 m */
  function seatOnBed(geo, clearance) {
    geo.computeBoundingBox();
    var bb = geo.boundingBox;
    var cx = (bb.min.x + bb.max.x) * 0.5, cz = (bb.min.z + bb.max.z) * 0.5;
    var gUnder = Math.min(
      bedAt(cx, cz),
      bedAt(bb.min.x, bb.min.z),
      bedAt(bb.max.x, bb.max.z),
      bedAt(bb.min.x, bb.max.z),
      bedAt(bb.max.x, bb.min.z)
    );
    var sink = clearance == null ? -0.22 : clearance;
    geo.translate(0, (gUnder + sink) - bb.min.y, 0);
    return geo;
  }

  /* ---- 3. Synthetic Demo Reef-Rock, Carbonate Sand Seabed & Polychrome Coral Scatter ----
     All synthetic terrain/rock/reef PRNG draws use dedicated KRAND child streams (never touching the
     megastructure's rng() stream), and meshMerged(ROCK, ...) + seabed/coral emission sit behind
     if (!(opts && opts.noTerrain)) so turning off the demo shoal never shifts the megastructure's PRNG stream. */
  {
    var ROCK = [];
    var rngRock = KRAND.stream(KRAND.child(seed + dd, 'reef_rock'));
    for (var ri = 0; ri < 28; ri++) {
      var aRk = rngRock.next() * TAU;
      var rRk = 95.0 + rngRock.next() * 540.0;
      var rx = rRk * Math.cos(aRk), rz = rRk * Math.sin(aRk);
      var ry = TETHISWATER.localBed(rx, rz);
      var wRk = 6.5 + rngRock.next() * 11.0, hRk = 1.6 + rngRock.next() * 2.8;
      var rotRk = rngRock.next() * TAU;
      if (!noTerrain && ry > -26.0 && ry < -6.5) {
        var rkGeo = new THREE.DodecahedronGeometry(1.0, 0);
        rkGeo.scale(wRk, hRk, wRk * (0.68 + 0.45 * rngRock.next()));
        rkGeo.rotateY(rotRk);
        rkGeo.translate(rx, ry - hRk * 0.35, rz);
        ROCK.push(rkGeo);
      } else {
        rngRock.next(); /* consume scale-aspect draw unconditionally */
      }
    }

    if (!noTerrain) {
      var R_MAX = 1120.0;
      var bedGeo = gridSurface(function (u, v) {
        var th = u * TAU;
        var rr = Math.pow(v, 1.15) * R_MAX;
        var lx = rr * Math.cos(th), lz = rr * Math.sin(th);
        var rawY = TETHISWATER.localBed(lx, lz);
        /* Smoothly feather outer shoal rim (r = 760..1120 m) down to groundM (-37.55 m) so zero seam shows */
        var feather = clamp((rr - 760.0) / 360.0, 0, 1);
        feather = feather * feather * (3.0 - 2.0 * feather);
        return [lx, lerp(rawY, -37.55, feather), lz];
      }, 96, 60, { uS: 72.0, vS: 48.0 });

      /* Paint vertex colours: luminous carbonate sand on shoals, coral-rose/gold on reef crests, deep sea-slate at outer feather */
      var posA = bedGeo.attributes.position;
      var cols = new Float32Array(posA.count * 3);
      for (var vi = 0; vi < posA.count; vi++) {
        var vx = posA.getX(vi), vy = posA.getY(vi), vz = posA.getZ(vi);
        var vr = Math.hypot(vx, vz);
        var fOuter = clamp((vr - 760.0) / 360.0, 0, 1);
        var fShallow = clamp((vy + 33.0) / 26.0, 0, 1);
        var fReef = clamp((vy + 15.0) / 11.0, 0, 1);
        var nC = KRAND.fbm(vx * 0.026 + 5.1, 0.4, vz * 0.026 - 3.7, 2, 12631);
        var cr = lerp(0.24, 0.90, fShallow) + fReef * (nC > 0.52 ? 0.09 : -0.05);
        var cg = lerp(0.38, 0.87, fShallow) - fReef * (nC > 0.52 ? 0.13 : -0.01);
        var cb = lerp(0.44, 0.76, fShallow) - fReef * 0.10;
        cols[vi * 3] = clamp(lerp(cr, 0.23, fOuter), 0.08, 1.0);
        cols[vi * 3 + 1] = clamp(lerp(cg, 0.38, fOuter), 0.08, 1.0);
        cols[vi * 3 + 2] = clamp(lerp(cb, 0.44, fOuter), 0.08, 1.0);
      }
      bedGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      var bedMesh = mesh(bedGeo, MAT.nvCoralSand, G, 0, 0, 0);
      bedMesh.userData.isSeabed = true;
      bedMesh.userData.probeSkip = true;

      if (ROCK.length) {
        var rockMesh = meshMerged(ROCK, MAT.rock, G);
        if (rockMesh) {
          rockMesh.userData.isSeabed = true;
          rockMesh.userData.probeSkip = true;
        }
      }

      /* Dense polychrome coral gardens: inner reef belt around U0 & U4 + outer shallow coral shoals (Ref 2!) */
      var rngReef = KRAND.stream(KRAND.child(seed + dd, 'coral_scatter'));
      var coralHues = [0.97, 0.03, 0.09, 0.14, 0.48, 0.84];
      for (var ci = 0; ci < 780; ci++) {
        var rcx, rcz;
        if (ci < 360) {
          var aroundU4 = (ci % 4 === 3);
          var angIn = rngReef.next() * TAU;
          var radIn = aroundU4 ? (22.0 + 78.0 * rngReef.next()) : (28.0 + 158.0 * Math.pow(rngReef.next(), 0.82));
          rcx = (aroundU4 ? 195.0 : 0.0) + radIn * Math.cos(angIn);
          rcz = (aroundU4 ? 337.75 : 0.0) + radIn * Math.sin(angIn);
        } else {
          var angC = rngReef.next() * TAU;
          var radC = 85.0 + Math.pow(rngReef.next(), 0.75) * 650.0;
          rcx = radC * Math.cos(angC);
          rcz = radC * Math.sin(angC);
        }
        var by = TETHISWATER.localBed(rcx, rcz);
        if (by < -27.5) continue;
        var sCor = (ci < 360 ? 1.1 : 1.5) + 2.6 * rngReef.next();
        var hue = coralHues[Math.floor(rngReef.next() * coralHues.length)];
        var cTint = new THREE.Color().setHSL(
          (hue + (rngReef.next() - 0.5) * 0.04 + 1.0) % 1.0,
          0.58 + 0.34 * rngReef.next(),
          0.46 + 0.26 * rngReef.next()
        );
        var cKind = ci % 3 === 0 ? 'nvCoralStag' : (ci % 3 === 1 ? 'nvCoralBrain' : 'nvCoralFan');
        kput(cKind, [rcx, by + sCor * 0.26, rcz], qEuler(0, rngReef.next() * TAU, 0),
          [sCor * 1.3, sCor * (cKind === 'nvCoralFan' ? 1.15 : 0.62), sCor * 1.3], cTint);
        if (ci % 4 === 0 && by < -5.0) {
          var kH = Math.min(13.5, Math.abs(by) * 0.68);
          kput('nvKelp', [rcx + 1.4, by, rcz - 1.1], qEuler(0.08, rngReef.next() * TAU, -0.06), [1.5, kH, 1.5], null);
        }
      }
    }
  }

  /* ---- 4. Clustered Fluted Pylons & Submerged / Waterline Ring-Bracing (Ref 1) ---- */
  {
    var byParent = {};
    for (var kp = 0; kp < P.pylons.length; kp++) {
      var py = P.pylons[kp];
      TETHIS_MAT.addPylon(B, py, dd);
      (byParent[py.parent] || (byParent[py.parent] = [])).push(py);
    }
    for (var parKey in byParent) {
      TETHIS_MAT.addPylonRingBracing(byParent[parKey], dd);
    }
  }

  /* ---- 5. Submerged Aquatic Rotundas (U0, U1, U4, U6), Open-Bay Reef Lobes & Subsea Tubes (Ref 2) ---- */
  {
    for (var suIdx = 0; suIdx < P.submerged.length; suIdx++) {
      var u = P.submerged[suIdx];
      var parP = byId[u.parent];
      var uH = u.y1 - u.y0, uMidY = (u.y0 + u.y1) * 0.5;
      var uMat = dd ? (u.modern.state === 'flooded_ruin' ? MAT.rust : MAT.concreteR) : MAT.white;
      var uWinMat = dd
        ? (u.modern.state === 'flooded_habitable' ? MAT.nvSubPearlGlow : MAT.winDead)
        : MAT.nvSubGlassI;

      /* Smooth rounded toroidal pressure-saucer hull */
      var uHull = gridSurface(function (uu, vv) {
        var th = uu * TAU;
        var prof = vv * TAU;
        var rMid = (u.rWell + u.rOut) * 0.5, rTube = (u.rOut - u.rWell) * 0.5;
        var rr = rMid + rTube * Math.cos(prof);
        var yy = uMidY + (uH * 0.52) * Math.sin(prof);
        return [u.x + rr * Math.cos(th), yy, u.z + rr * Math.sin(th)];
      }, 48, 16, { uS: u.rOut * TAU / 12.0, vS: 3.0 });
      anhPut(B, uMat, uHull);

      /* Continuous 360-degree ribbon observation viewport band around outer equator (Ref 2!) */
      var uBand = new THREE.CylinderGeometry(u.rOut + 0.35, u.rOut + 0.35, uH * 0.38, 48, 1, true);
      uBand.translate(u.x, uMidY, u.z);
      anhPut(B, uWinMat, uBand);

      /* Vertical suspension & access caissons rooting U-pod to seabed AND up into parent saucer soffit */
      var nColsU = u.id === 'U0' ? 6 : 4;
      for (var cu = 0; cu < nColsU; cu++) {
        var aU = (cu / nColsU) * TAU + 0.25;
        var rColU = (u.rWell + u.rOut) * 0.5;
        var ux = u.x + rColU * Math.cos(aU), uz = u.z + rColU * Math.sin(aU);
        var sbU = TETHISWATER.localBed(ux, uz);
        rbeam(dd ? 'boxCR' : 'boxC', [ux, sbU - 1.2, uz], [ux, parP.y0 - 1.5, uz], 3.4, 3.4, null);
      }

      /* Radial viewport beacons */
      for (var vp = 0; vp < 12; vp++) {
        var aVP = (vp / 12.0) * TAU;
        var vxP = u.x + (u.rOut + 0.45) * Math.cos(aVP), vzP = u.z + (u.rOut + 0.45) * Math.sin(aVP);
        if (!dd || u.modern.state === 'flooded_habitable') {
          kput(dd ? 'nvCapPortW' : 'nvCapPortI', [vxP, uMidY, vzP],
            qFacing([Math.cos(aVP), 0, Math.sin(aVP)]), [2.0, 1.5, 1.0], null);
        } else {
          kput('boxR', [vxP, uMidY, vzP], qFacing([Math.cos(aVP), 0, Math.sin(aVP)]), [1.8, 1.4, 0.8], null);
        }
      }

      /* 3 Open-Bay Submerged Reef-Observation Saucer Lobes projecting out to r = 166 m into sunlit turquoise bays around P0 (Ref 2!) */
      if (u.id === 'U0') {
        var bayBearings = [Math.PI * 0.5, Math.PI * 1.16, Math.PI * 1.84];
        for (var bl = 0; bl < 3; bl++) {
          var aBl = bayBearings[bl], cBl = Math.cos(aBl), sBl = Math.sin(aBl);
          var lxB = 164.0 * cBl, lzB = 164.0 * sBl, lyB = -9.5, rLobe = 26.0;
          var lobeHull = lathe({
            rFn: function (yy) {
              var f = clamp(yy / 7.2, 0, 1);
              return rLobe * Math.sin(Math.max(0.08, f * Math.PI));
            },
            H: 7.2, nu: 32, nv: 10
          });
          lobeHull.translate(lxB, lyB - 3.6, lzB);
          anhPut(B, uMat, lobeHull);

          var lobeWin = new THREE.CylinderGeometry(rLobe + 0.25, rLobe + 0.25, 2.4, 32, 1, true);
          lobeWin.translate(lxB, lyB, lzB);
          anhPut(B, uWinMat, lobeWin);

          /* Reef footing pier + radial swim-tube linking lobe back to U0 */
          var sbLb = TETHISWATER.localBed(lxB, lzB);
          rbeam(dd ? 'boxCR' : 'boxC', [lxB, sbLb - 1.2, lzB], [lxB, lyB + 1.5, lzB], 3.8, 3.8, null);
          rbeam(dd ? 'boxCR' : 'boxW', [64.0 * cBl, -12.0, 64.0 * sBl], [lxB, lyB - 0.5, lzB], 3.2, 4.2, null);
        }
      }

      /* Hykkousoi Sacred Pearl-Sanctuary & Gene-Scriptorium glow inside U0 / U4 central well (d = 1) */
      if (dd && u.modern.state === 'flooded_habitable') {
        for (var ps = 0; ps < 8; ps++) {
          var aPS = (ps / 8.0) * TAU;
          var pxS = u.x + (u.rWell + 2.5) * Math.cos(aPS), pzS = u.z + (u.rWell + 2.5) * Math.sin(aPS);
          kput('nvNacrePod', [pxS, u.y0 + 1.5, pzS], qEuler(0, -aPS, 0), [3.4, 5.0, 3.4], null);
        }
      }
    }
  }

  /* Helper: Curved Soleri Ribbed Glass Conservatory with planted green roof-spine & warm golden interior core (Ref 1!) */
  function addCurvedConservatory(cx, cz, deckY, rMid, halfWidth, height, a0, aSpan) {
    var glassMat = dd ? MAT.nvConservatoryW : MAT.nvConservatoryI;
    var frameMat = dd ? MAT.nvDeckW : MAT.white;
    var turfMat = dd ? MAT.turfR : MAT.turf;

    /* Glazed curved barrel-shell seated -1.0 m into saucer roof */
    var vaultG = gridSurface(function (u, v) {
      var th = a0 + u * aSpan;
      var prof = v * Math.PI;
      var rr = rMid + halfWidth * Math.cos(prof);
      var yy = deckY - 1.0 + height * Math.sin(prof);
      return [cx + rr * Math.cos(th), yy, cz + rr * Math.sin(th)];
    }, 24, 10, { uS: 8.0, vS: 2.0 });
    anhPut(B, glassMat, vaultG);

    /* Planted flat green roof-cap over the conservatory crown (Ref 1's signature green-topped glasshouses!) */
    var roofCap = gridSurface(function (u, v) {
      var th = a0 + u * aSpan;
      var rr = rMid + (v - 0.5) * (halfWidth * 1.15);
      return [cx + rr * Math.cos(th), deckY - 0.7 + height, cz + rr * Math.sin(th)];
    }, 22, 2, { uS: 8.0, vS: 1.0 });
    anhPut(B, turfMat, roofCap);

    /* Warm golden-amber interior botanical/civic colonnade spine visible through the clear glass (Ref 1!) */
    var coreG = gridSurface(function (u, v) {
      var th = a0 + 0.06 + u * (aSpan - 0.12);
      var prof = v * Math.PI;
      var rr = rMid + (halfWidth * 0.48) * Math.cos(prof);
      var yy = deckY - 0.8 + (height * 0.58) * Math.sin(prof);
      return [cx + rr * Math.cos(th), yy, cz + rr * Math.sin(th)];
    }, 18, 6, { uS: 6.0, vS: 1.0 });
    anhPut(B, dd ? MAT.nvSubPearlGlow : MAT.nvAmberCore, coreG);

    /* 7 crisp exterior structural arch-ribs framing the glazing */
    for (var rb = 0; rb <= 6; rb++) {
      var thR = a0 + (rb / 6.0) * aSpan;
      var csR = Math.cos(thR), snR = Math.sin(thR);
      var ribA = gridSurface(function (u, v) {
        var prof = u * Math.PI;
        var rr = rMid + (halfWidth + 0.35) * Math.cos(prof);
        var yy = deckY - 1.0 + (height + 0.35) * Math.sin(prof);
        var thOff = thR + (v - 0.5) * (0.9 / rMid);
        return [cx + rr * Math.cos(thOff), yy, cz + rr * Math.sin(thOff)];
      }, 10, 1, { uS: 2.0, vS: 0.2 });
      anhPut(B, frameMat, ribA);
      /* Mullion post seated in deck */
      kput(dd ? 'postR' : 'postW', [cx + (rMid + halfWidth * 0.92) * csR, deckY + height * 0.36, cz + (rMid + halfWidth * 0.92) * snR],
        null, [0.55, height * 0.78, 0.55], null);
    }
  }

  /* ---- 6. Main Platforms (P0..P8), Satellite Dishes (S0a..S3a) & Bespoke Zone Architecture ---- */
  {
    for (var pIdx = 0; pIdx < P.platforms.length; pIdx++) {
      var plat = P.platforms[pIdx];
      TETHIS_MAT.addSaucer(B, plat, dd, false);
      var deckY = plat.y1 + 0.1;
      var rngP = KRAND.stream(KRAND.child(seed + dd, 'zone_arch:' + plat.id));

      /* Zone-specific architecture atop each saucer */
      if (plat.id === 'P0') {
        /* 3 Grand Curved Ribbed-Glass Civic Pavilions leaving open waterfront plazas between them! */
        for (var ca = 0; ca < 3; ca++) {
          var a0 = ca * (TAU / 3.0) + 0.95;
          addCurvedConservatory(plat.x, plat.z, deckY, 102.0, 9.5, 10.2, a0, 1.05);
        }
        for (var t0i = 0; t0i < 38; t0i++) {
          var aTr0 = (t0i / 38.0) * TAU + 0.05;
          var rTr0 = 74.0 + 44.0 * rngP.next();
          VEG.tree(plat.x + rTr0 * Math.cos(aTr0), deckY - 0.3, plat.z + rTr0 * Math.sin(aTr0), t0i % 3, 7.0 + 4.5 * rngP.next());
        }
      } else if (plat.id === 'P3') {
        /* Ref 1: Curved Ribbed-Glass Botanical Conservatories with Planted Roofs & Dense Terraced Orchard Groves */
        for (var cv = 0; cv < 3; cv++) {
          var bA0 = cv * (TAU / 3.0) + 0.35;
          addCurvedConservatory(plat.x, plat.z, deckY, 68.0, 12.5, 11.8, bA0, 1.38);
        }
        for (var or = 0; or < 74; or++) {
          var aOr = (or / 74.0) * TAU + (rngP.next() - 0.5) * 0.1;
          var rOr = 35.0 + 58.0 * rngP.next();
          VEG.tree(plat.x + rOr * Math.cos(aOr), deckY - 0.4, plat.z + rOr * Math.sin(aOr), or % 3, 7.5 + 6.5 * rngP.next());
        }
      } else if (plat.id === 'P1' || plat.id === 'P2') {
        /* Residential saucer rooftop courts, Academy rotunda (P2), and courtyard trees */
        if (plat.id === 'P2') {
          var acadDome = new THREE.SphereGeometry(18.0, 28, 12, 0, TAU, 0, Math.PI * 0.5);
          acadDome.translate(plat.x, deckY - 1.0, plat.z + 64.0);
          anhPut(B, dd ? MAT.nvDeckW : MAT.white, acadDome);
        }
        for (var trR = 0; trR < 28; trR++) {
          var aTR = (trR / 28.0) * TAU;
          var rTR = 54.0 + 36.0 * rngP.next();
          VEG.tree(plat.x + rTR * Math.cos(aTR), deckY - 0.3, plat.z + rTR * Math.sin(aTR), trR % 3, 6.5 + 4.5 * rngP.next());
        }
      } else if (plat.id === 'P4') {
        /* Recreation & Thalassotherapy Bath Pavilions + Lagoon Palm/Orchard Trees */
        for (var bp = 0; bp < 2; bp++) {
          var aBP = bp * Math.PI - 0.6;
          var bathVault = new THREE.CylinderGeometry(9.5, 9.5, 34.0, 16, 1, false, 0, Math.PI);
          bathVault.rotateZ(Math.PI / 2);
          bathVault.rotateY(-aBP);
          bathVault.translate(plat.x + 84.0 * Math.cos(aBP), deckY - 0.6, plat.z + 84.0 * Math.sin(aBP));
          anhPut(B, dd ? MAT.nvDeckW : MAT.white, bathVault);
        }
        for (var tr4 = 0; tr4 < 26; tr4++) {
          var aT4 = (tr4 / 26.0) * TAU;
          var rT4 = 78.0 + 20.0 * rngP.next();
          VEG.tree(plat.x + rT4 * Math.cos(aT4), deckY - 0.3, plat.z + rT4 * Math.sin(aT4), tr4 % 3, 6.5 + 5.0 * rngP.next());
        }
      } else if (plat.id === 'P5') {
        /* West Harbour Ship-Canal Mole Towers & Cargo Jib-Cranes */
        [-1, 1].forEach(function (sg) {
          var mx = plat.x - 102.0, mz = plat.z + sg * 26.0;
          var moleT = new THREE.CylinderGeometry(6.5, 8.2, 22.0, 16);
          moleT.translate(mx, plat.y0 + 12.0, mz);
          anhPut(B, dd ? MAT.nvDeckW : MAT.white, moleT);
          /* Harbour jib crane */
          rbeam(dd ? 'strutR' : 'strutW', [mx, deckY - 2.0, mz], [mx + 14.0, deckY + 18.0, mz - sg * 8.0], 1.8, 1.8, null);
        });
      } else if (plat.id === 'P6' || plat.id === 'P8') {
        /* Horizontal Multi-Stage Flash Desalination Drums, Spherical Brine Tanks & Smelter Cranes */
        var isRuinP8 = dd && plat.id === 'P8';
        var eqMat = isRuinP8 ? MAT.rust : (dd ? MAT.verdigris : MAT.white);
        var nTanks = plat.id === 'P6' ? 5 : 4;
        for (var tk = 0; tk < nTanks; tk++) {
          var aTk = (tk / nTanks) * TAU + 0.55;
          var rTk = plat.id === 'P6' ? 76.0 : 48.0;
          var txk = plat.x + rTk * Math.cos(aTk), tzk = plat.z + rTk * Math.sin(aTk);
          if (tk % 2 === 0) {
            var hDrum = new THREE.CylinderGeometry(5.8, 5.8, 22.0, 18);
            hDrum.rotateZ(Math.PI / 2);
            hDrum.rotateY(-aTk + Math.PI / 2);
            hDrum.translate(txk, deckY + 4.2, tzk);
            anhPut(B, eqMat, hDrum);
          } else {
            var sph = new THREE.SphereGeometry(7.2, 18, 12);
            sph.translate(txk, deckY + 5.5, tzk);
            anhPut(B, eqMat, sph);
          }
          /* Support cradle overlapping saucer roof */
          rbeam(isRuinP8 ? 'boxR' : 'boxC', [txk, deckY - 1.5, tzk], [txk, deckY + 4.5, tzk], 5.0, 5.0, null);
        }
        if (plat.id === 'P8') {
          /* Heavy slag crane on P8 — upright intact (d=0), tilted & rusted on Salvage Island (d=1)! */
          var crBase = [plat.x + 28.0, deckY - 2.0, plat.z - 22.0];
          var crTop = isRuinP8
            ? [plat.x + 42.0, deckY + 26.0, plat.z - 12.0]
            : [plat.x + 28.0, deckY + 34.0, plat.z - 22.0];
          rbeam(isRuinP8 ? 'strutR' : 'strutW', crBase, crTop, 3.2, 3.2, null);
          rbeam(isRuinP8 ? 'strutR' : 'strutW', crTop,
            [crTop[0] + 24.0, isRuinP8 ? (deckY + 15.0) : (deckY + 34.0), crTop[2] + 8.0], 2.2, 2.2, null);
        }
      }
    }

    /* Satellite dishes S0a, S0b, S0c (cantilevered off P0 on diagonal struts + calyx stalk, Ref 2!) & S3a (on pylons) */
    for (var sIdx = 0; sIdx < P.satellites.length; sIdx++) {
      var sat = P.satellites[sIdx];
      TETHIS_MAT.addSaucer(B, sat, dd, true);
      if (sat.mount === 'cantilever_strut') {
        var parS = byId[sat.parent];
        var dS = Math.hypot(sat.x - parS.x, sat.z - parS.z);
        var uxS = (sat.x - parS.x) / dS, uzS = (sat.z - parS.z) / dS;
        var pxS = -uzS, pzS = uxS;
        /* Fluted conical calyx stalk under the satellite dish (Ref 2!) */
        var calyx = lathe({
          rFn: function (yy) { return lerp(5.2, sat.rOut * 0.58, Math.pow(yy / 11.0, 0.75)); },
          H: 11.0, flutes: 12, amp: 0.06, sharp: 1.8, nu: 28, nv: 8
        });
        calyx.translate(sat.x, sat.y0 - 10.5, sat.z);
        anhPut(B, dd ? MAT.concreteR : MAT.white, calyx);

        /* Twin heavy diagonal box-struts tying calyx & soffit deep into P0's structural ring */
        [-1, 1].forEach(function (side) {
          rbeam(dd ? 'strutR' : 'strutW',
            [parS.x + uxS * 118.0 + pxS * side * 12.0, parS.y0 + 14.0, parS.z + uzS * 118.0 + pzS * side * 12.0],
            [sat.x + pxS * side * 5.0, sat.y0 - 7.5, sat.z + pzS * side * 5.0],
            3.6, 3.2, null);
        });
        rbeam(dd ? 'boxCR' : 'boxW',
          [parS.x + uxS * 132.0, parS.y1 - 3.5, parS.z + uzS * 132.0],
          [sat.x - uxS * (sat.rOut - 6.0), sat.y0 + 1.5, sat.z - uzS * (sat.rOut - 6.0)],
          2.6, 7.6, null);
      }

      /* Trees & glass conservatory dome on garden/recreation satellites (thetaLength > PI/2 so rim seats solidly into deck!) */
      var sDeckY = sat.y1 + 0.1;
      if (sat.zone === 'garden' || sat.zone === 'recreation') {
        var rMini = sat.rOut * 0.38;
        var miniDome = new THREE.SphereGeometry(rMini, 24, 10, 0, TAU, 0, Math.PI * 0.54);
        miniDome.translate(sat.x, sDeckY + 0.2, sat.z);
        anhPut(B, dd ? MAT.nvConservatoryW : MAT.nvConservatoryI, miniDome);
        var miniCore = new THREE.CylinderGeometry(rMini * 0.65, rMini * 0.72, 2.8, 20);
        miniCore.translate(sat.x, sDeckY + 0.6, sat.z);
        anhPut(B, dd ? MAT.nvSubPearlGlow : MAT.nvAmberCore, miniCore);
        for (var stT = 0; stT < 12; stT++) {
          var aST = (stT / 12.0) * TAU;
          var rST = sat.rOut * 0.62;
          VEG.tree(sat.x + rST * Math.cos(aST), sDeckY - 0.3, sat.z + rST * Math.sin(aST), stT % 3, 5.5 + (stT % 3) * 1.8);
        }
      } else {
        /* S0b Tide-Clock & Astral Dish parabolic reflector */
        var dishG = lathe({
          rFn: function (yy) { return 3.0 + 18.0 * Math.sqrt(clamp(yy / 8.5, 0, 1)); },
          H: 8.5, nu: 32, nv: 8
        });
        dishG.translate(sat.x, sDeckY - 0.5, sat.z);
        anhPut(B, dd ? MAT.verdigris : MAT.white, dishG);
        kput(dd ? 'postR' : 'postW', [sat.x, sDeckY + 6.0, sat.z], null, [1.2, 12.0, 1.2], null);
      }
    }

    /* Hexagonal Belvedere Pylon Junctions J1, J2 (Ref 1 foreground mid-water walkway nodes!) */
    for (var jIdx = 0; jIdx < P.junctions.length; jIdx++) {
      var jn2 = P.junctions[jIdx];
      var jHull = new THREE.CylinderGeometry(jn2.r, jn2.r * 0.55, 6.2, 6);
      jHull.translate(jn2.x, jn2.y - 2.2, jn2.z);
      var jPav = new THREE.CylinderGeometry(jn2.r * 0.55, jn2.r * 0.62, 5.2, 6);
      jPav.translate(jn2.x, jn2.y + 3.2, jn2.z);
      anhPut(B, dd ? MAT.nvDeckW : MAT.white, [jHull, jPav]);
      VEG.tree(jn2.x + 6.0, jn2.y + 0.8, jn2.z, 0, 6.5);
      VEG.tree(jn2.x - 6.0, jn2.y + 0.8, jn2.z + 4.0, 1, 5.8);
    }
  }

  /* ---- 7. All 10 Vertical Towers + Hykkousoi Conch-Helix ---- */
  TETHIS_TOWERS.buildAllTowers(B, P, dd, seed);

  /* ---- 8. Skybridge Balconies, Subsea Tubes & Modern Hykkousoi Spans / Collapsed B_6_8 ---- */
  {
    function addStraightSpan(x0, z0, x1, z1, y0, y1, w, isSubsea) {
      var dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz);
      if (L < 1.0) return;
      var ux = dx / L, uz = dz / L;
      /* Extend 4.5 m into both endpoint structures so KRUINS sees solid union */
      var ax = x0 - ux * 4.5, az = z0 - uz * 4.5;
      var bx = x1 + ux * 4.5, bz = z1 + uz * 4.5;
      var px = -uz, pz = ux;

      if (isSubsea) {
        /* Glazed subsea swim-tube with structural ring-frames & reef-saddle piers */
        var midX = (ax + bx) * 0.5, midZ = (az + bz) * 0.5, midY = (y0 + y1) * 0.5;
        var tubeL = Math.hypot(bx - ax, bz - az);
        var tubeG = new THREE.CylinderGeometry(3.1, 3.1, tubeL, 18, 1, false);
        tubeG.rotateZ(Math.PI / 2);
        tubeG.rotateY(-Math.atan2(bz - az, bx - ax));
        tubeG.translate(midX, midY, midZ);
        anhPut(B, dd ? MAT.concreteR : MAT.nvSubGlassI, tubeG);

        var nPiersS = Math.max(1, Math.floor(L / 85.0));
        for (var sp = 1; sp <= nPiersS; sp++) {
          var fS = sp / (nPiersS + 1);
          var sx = lerp(x0, x1, fS), sz = lerp(z0, z1, fS);
          var sbS2 = TETHISWATER.localBed(sx, sz);
          rbeam(dd ? 'boxCR' : 'boxC', [sx, sbS2 - 1.0, sz], [sx, midY + 0.5, sz], 3.2, 3.2, null);
        }
        return;
      }

      /* Double-deck Soleri balcony bridge: box girder (vertical 3.0 m, horizontal w*0.74) + promenade + twin parapets */
      var deckG = gridSurface(function (u, v) {
        var x = lerp(ax, bx, u) + px * (v - 0.5) * w;
        var z = lerp(az, bz, u) + pz * (v - 0.5) * w;
        var y = lerp(y0, y1, u);
        return [x, y, z];
      }, 16, 2, { uS: L / 10.0, vS: 1.0 });
      anhPut(B, dd ? MAT.nvDeckW : MAT.nvDeckI, deckG);

      rbeam(dd ? 'boxCR' : 'boxC', [ax, y0 - 1.5, az], [bx, y1 - 1.5, bz], 3.0, w * 0.74, null);

      [-0.5, 0.5].forEach(function (side) {
        rbeam(dd ? 'boxCR' : 'boxW',
          [ax + px * side * (w - 0.6), y0 + 0.65, az + pz * side * (w - 0.6)],
          [bx + px * side * (w - 0.6), y1 + 0.65, bz + pz * side * (w - 0.6)],
          1.45, 0.65, null);
      });

      /* Intermediate fluted sea-pier for long spans (> 125 m, Ref 1!) */
      if (L > 125.0) {
        var mxB = (x0 + x1) * 0.5, mzB = (z0 + z1) * 0.5, myB = (y0 + y1) * 0.5;
        var sbM = TETHISWATER.localBed(mxB, mzB);
        TETHIS_MAT.addPylon(B, { x: mxB, z: mzB, r: 3.1, y0: sbM - 3.5, y1: myB - 1.0, barnacleBand: 0.7, ruined: false }, dd);
      }
    }

    for (var bIdx = 0; bIdx < P.bridges.length; bIdx++) {
      var br2 = P.bridges[bIdx];
      var isSub = br2.kind === 'subsea_tube';
      var stB = dd ? br2.modernState : 'intact';

      if (stB === 'intact' || stB === 'intact_kept' || stB === 'flooded_swimway') {
        for (var sg2 = 0; sg2 < br2.pts.length - 1; sg2++) {
          var pA = br2.pts[sg2], pB = br2.pts[sg2 + 1];
          var yA = br2.y, yB = (br2.id === 'B_3_3a' && sg2 === br2.pts.length - 2) ? 15.5 : br2.y;
          addStraightSpan(pA[0], pA[1], pB[0], pB[1], yA, yB, br2.w, isSub);
        }
      } else if (stB === 'hyk_rib_bridge') {
        /* B_6_1: Broken Ancient abutment stubs + Grown Hykkousoi Arched Whalebone/Nacre Rib-Bridge! */
        var q0 = br2.pts[0], q1 = br2.pts[1];
        var dxR = q1[0] - q0[0], dzR = q1[1] - q0[1], LR = Math.hypot(dxR, dzR);
        var uxR = dxR / LR, uzR = dzR / LR, pxR = -uzR, pzR = uxR;
        var stubA = [q0[0] + uxR * 28.0, q0[1] + uzR * 28.0];
        var stubB = [q1[0] - uxR * 28.0, q1[1] - uzR * 28.0];
        addStraightSpan(q0[0], q0[1], stubA[0], stubA[1], br2.y, br2.y, br2.w, false);
        addStraightSpan(stubB[0], stubB[1], q1[0], q1[1], br2.y, br2.y, br2.w, false);
        [stubA, stubB].forEach(function (stPt) {
          var sbSt = TETHISWATER.localBed(stPt[0], stPt[1]);
          TETHIS_MAT.addPylon(B, { x: stPt[0], z: stPt[1], r: 3.0, y0: sbSt - 3.5, y1: br2.y - 0.8, barnacleBand: 0.75, ruined: false }, 1);
        });
        var ribDeck = gridSurface(function (u, v) {
          var x = lerp(stubA[0] - uxR * 3.0, stubB[0] + uxR * 3.0, u) + pxR * (v - 0.5) * (br2.w * 0.86);
          var z = lerp(stubA[1] - uzR * 3.0, stubB[1] + uzR * 3.0, u) + pzR * (v - 0.5) * (br2.w * 0.86);
          var archY = br2.y + 7.5 * Math.sin(u * Math.PI);
          return [x, archY, z];
        }, 20, 2, { uS: 8.0, vS: 1.0 });
        anhPut(B, MAT.timber, ribDeck);
        for (var rk = 0; rk < 11; rk++) {
          var uRk = (rk + 0.5) / 11.0;
          var rxM = lerp(stubA[0], stubB[0], uRk), rzM = lerp(stubA[1], stubB[1], uRk);
          var ryM = br2.y + 7.5 * Math.sin(uRk * Math.PI);
          var ribH = 6.0 + 4.5 * Math.sin(uRk * Math.PI);
          [-1, 1].forEach(function (sd) {
            rbeam('nvRibSeg',
              [rxM + pxR * sd * 4.8, ryM - 1.2, rzM + pzR * sd * 4.8],
              [rxM + pxR * sd * 1.4, ryM + ribH, rzM + pzR * sd * 1.4],
              1.1, 1.1, null);
          });
        }
      } else if (stB === 'hyk_drawbridge') {
        /* B_5_7s: Twin approaches + wide raised counterweighted Hykkousoi rib-drawbridge leaves! */
        var d0 = br2.pts[0], d1 = br2.pts[1];
        var midDX = (d0[0] + d1[0]) * 0.5, gapH = 19.0;
        var leafE = [midDX + gapH, d0[1]], leafW = [midDX - gapH, d1[1]];
        addStraightSpan(d0[0], d0[1], leafE[0], leafE[1], br2.y, br2.y, br2.w, false);
        addStraightSpan(leafW[0], leafW[1], d1[0], d1[1], br2.y, br2.y, br2.w, false);
        [leafE, leafW].forEach(function (lp, li) {
          var sbL = TETHISWATER.localBed(lp[0], lp[1]);
          TETHIS_MAT.addPylon(B, { x: lp[0], z: lp[1], r: 3.0, y0: sbL - 3.5, y1: br2.y + 1.0, barnacleBand: 0.8, ruined: false }, 1);
          var dirX = li === 0 ? -1.0 : 1.0;
          /* rbeam: vertical thickness = 0.95 m, horizontal width = 7.8 m! */
          rbeam('plank', [lp[0] - dirX * 1.5, br2.y + 0.2, lp[1]], [lp[0] + dirX * 15.0, br2.y + 9.5, lp[1]], 0.95, 7.8, null);
          rbeam('nvRibSeg', [lp[0] - dirX * 6.0, br2.y + 5.5, lp[1] + 3.6], [lp[0] + dirX * 13.0, br2.y + 10.5, lp[1] + 3.6], 1.1, 1.1, null);
          rbeam('nvRibSeg', [lp[0] - dirX * 6.0, br2.y + 5.5, lp[1] - 3.6], [lp[0] + dirX * 13.0, br2.y + 10.5, lp[1] - 3.6], 1.1, 1.1, null);
        });
      } else if (stB === 'collapsed') {
        /* B_6_8: Cataclysm-collapsed East Pipe-Bridge isolating P8 (watched by core/ruins!) */
        var c0 = br2.pts[0], c1 = br2.pts[1];
        /* Horizontal broken viaduct deck stubs (3.2 m deep vertically, 11.8 m wide horizontally!) + sheared brine pipes */
        rbeam('boxCR', [c0[0] - 8.0, br2.y - 1.2, c0[1]], [c0[0] + 17.0, br2.y - 3.2, c0[1]], 3.2, br2.w * 0.92, null);
        rbeam('boxCR', [c1[0] - 15.0, br2.y - 2.8, c1[1]], [c1[0] + 8.0, br2.y - 1.2, c1[1]], 3.2, br2.w * 0.92, null);
        [-3.2, 3.2].forEach(function (pzOff) {
          rbeam('pipeR', [c0[0] - 6.0, br2.y - 2.6, c0[1] + pzOff], [c0[0] + 20.5, br2.y - 5.4, c0[1] + pzOff], 1.4, 1.4, null);
          rbeam('pipeR', [c1[0] - 18.0, br2.y - 4.8, c1[1] + pzOff], [c1[0] + 6.0, br2.y - 2.6, c1[1] + pzOff], 1.4, 1.4, null);
        });

        /* 3 fallen girder-and-pipe bridge sections resting cleanly on the shallow seabed (seatOnBed -> low = -0.22 m!) */
        for (var wk = 0; wk < 3; wk++) {
          var fW = 0.25 + wk * 0.25;
          var wx = lerp(c0[0] + 22.0, c1[0] - 20.0, fW);
          var wz = c0[1] + (wk - 1) * 8.5;
          var wGeo = new THREE.BoxGeometry(24.0, 3.4, br2.w * 0.88);
          wGeo.rotateZ((wk === 1 ? -0.16 : 0.20));
          wGeo.rotateY((wk - 1) * 0.32);
          wGeo.translate(wx, 0, wz);
          seatOnBed(wGeo, -0.22);
          anhPut(B, MAT.concreteR, wGeo);
        }
      } else if (stB === 'breached_ruin') {
        /* ST_0_6: Ruptured subsea tube with bronze eel-grille & settled seabed ring section */
        var s0 = br2.pts[0], s1 = br2.pts[1];
        var dxS2 = s1[0] - s0[0], dzS2 = s1[1] - s0[1], LS2 = Math.hypot(dxS2, dzS2);
        var uxS2 = dxS2 / LS2, uzS2 = dzS2 / LS2;
        addStraightSpan(s0[0], s0[1], s0[0] + uxS2 * 56.0, s0[1] + uzS2 * 56.0, br2.y, br2.y, br2.w, true);
        addStraightSpan(s1[0] - uxS2 * 56.0, s1[1] - uzS2 * 56.0, s1[0], s1[1], br2.y, br2.y, br2.w, true);
        var mxT = (s0[0] + s1[0]) * 0.5, mzT = (s0[1] + s1[1]) * 0.5 + 4.0;
        var wTube = new THREE.CylinderGeometry(3.1, 3.1, 24.0, 16);
        wTube.rotateZ(Math.PI / 2 + 0.14);
        wTube.rotateY(0.24);
        wTube.translate(mxT, 0, mzT);
        seatOnBed(wTube, -0.22);
        anhPut(B, MAT.rust, wTube);
      }
    }
  }

  /* ---- 9. Hykkousoi Rim Accretions (Seated on Exact Stepped Saucer Terraces!), Pearl Rafts & Fleet ---- */
  if (dd) {
    for (var hi = 0; hi < P.hykkousoi.length; hi++) {
      var hRec = P.hykkousoi[hi];
      if (hRec.kind === 'conch_helical_stair') continue;
      if (hRec.kind === 'pearl_oyster_lines') {
        for (var ob = 0; ob < hRec.count; ob++) {
          var aOb = (ob / hRec.count) * TAU;
          for (var bStep = 0; bStep < 4; bStep++) {
            var rOb = hRec.r * (0.38 + bStep * 0.18);
            kput('nvBuoyPearl', [hRec.x + rOb * Math.cos(aOb), 0.15, hRec.z + rOb * Math.sin(aOb)],
              null, [1.3, 0.9, 1.3], null);
          }
        }
        continue;
      }
      var hostP = byId[hRec.host];
      var outAng = Math.atan2(hRec.z - hostP.z, hRec.x - hostP.x);
      var isOuter = Math.hypot(hRec.x - hostP.x, hRec.z - hostP.z) >= (hostP.rOut + hostP.rWell) * 0.5;
      var dirSign = isOuter ? 1.0 : -1.0;

      /* Compute the exact stepped facade radius at height hRec.y via P.hull so every pod/balcony seats into its terrace wall! */
      var stepInP = P.hull.stepIn(hostP);
      var wellStepP = P.hull.wellStep(hostP);
      var stAtY = clamp(Math.floor((hRec.y - hostP.y0) / 4.2), 0, hostP.st - 1);
      var radFacade = isOuter
        ? (hostP.rOut - stAtY * stepInP - 2.4)
        : (hostP.rWell + stAtY * wellStepP + 2.4);

      var axH = hostP.x + Math.cos(outAng) * radFacade;
      var azH = hostP.z + Math.sin(outAng) * radFacade;
      var faceQ = qFacing([Math.cos(outAng) * dirSign, 0, Math.sin(outAng) * dirSign]);

      if (hRec.kind === 'scallop_balcony') {
        kput('nvScallop', [axH, hRec.y, azH], faceQ, [hRec.r * 1.05, 3.0, hRec.r * 0.95], null);
      } else if (hRec.kind === 'conch_stair_pod') {
        kput('nvNacrePod', [axH, hRec.y - 2.6, azH], qEuler(0, -outAng, 0), [hRec.r * 0.68, hRec.r * 1.32, hRec.r * 0.68], null);
        kput('nvScallop', [axH, hRec.y + 1.1, azH], faceQ, [hRec.r * 0.88, 2.5, hRec.r * 0.82], null);
      } else {
        kput('nvNacrePod', [axH, hRec.y - 2.0, azH], qEuler(0, -outAng, 0), [hRec.r * 0.76, hRec.r * 1.04, hRec.r * 0.76], null);
      }
    }
  }

  /* Fleet of moored & approaching vessels in lagoons and West Harbour canal (isolated child stream) */
  if (!(opts && opts.noVessels)) {
    var rngBoat = KRAND.stream(KRAND.child(seed + dd, 'vessels'));
    var moorPts = [
      [0, 38], [34, -18], [-36, -16],
      [-390, 24], [-390, -28], [-428, 0], [-515, -6], [-585, 8],
      [195, 312], [-195, 326]
    ];
    for (var bm = 0; bm < moorPts.length; bm++) {
      var bxM = moorPts[bm][0] + (rngBoat.next() - 0.5) * 8.0;
      var bzM = moorPts[bm][1] + (rngBoat.next() - 0.5) * 8.0;
      var hd = rngBoat.next() * TAU;
      var bq = qEuler(0, hd, 0);
      if (dd) {
        var scB = 1.6 + 1.1 * rngBoat.next();
        kput('nvBoatHyk', [bxM, 0.35, bzM], bq, [scB, scB, scB], null);
        kput('nvSailHyk', [bxM, 0.55, bzM], bq, [scB * 1.1, scB * 1.25, scB * 1.1], null);
      } else {
        var scA = 1.8 + 1.2 * rngBoat.next();
        kput('nvBoatAnc', [bxM, 0.35, bzM], bq, [scA, scA, scA], null);
      }
    }
  }

  anhFlush(B, G);
  return G;
}
