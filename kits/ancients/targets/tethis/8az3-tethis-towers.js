/* ================================================================= TETHIS — mushroom, capsule & condenser towers ([draw])
   Draws the 10 vertical towers of Tethis from TETHIS.plan records:
     - T0 (+218 m) & T4 (+166 m): Soleri/Moebius Mushroom Towers with 24 radial lit soffit ribs & mid-stem pods (Ref 3)
     - T1a, T1b, T2a, T2b, T3, T5: Metabolist/Soleri radial plug-in capsule-drum residential & Pharos towers (Ref 4)
     - T6a, T6b: Segmented industrial vapour-condenser columns with T-beam hammerhead cranes (Ref 4)
     - HYK_T0_helix (d=1): 3.5-turn grown nacre helical conch-stair climbing T0's trunk
   Deterministic (uses KRAND streams keyed by tower id; no rng()): listed in DETERMINISTIC in kits/ancients/build.py. */

var TETHIS_TOWERS = (function () {
  'use strict';

  /* ---- 1. Mushroom Tower (T0, T4 — Ref 3) ---- */
  function addMushroomTower(B, t, d, seed) {
    var tx = t.x, tz = t.z, rTr = t.rTrunk, rCap = t.rCap;
    var y0 = t.y0, capY0 = t.capY0, y1 = t.y1, spireTop = t.spireTop;
    var skinMat = d > 0 ? MAT.nvDeckW : MAT.white;
    var concMat = d > 0 ? MAT.concreteR : MAT.concrete;
    var ribMat = d > 0 ? MAT.nvRibbonW : MAT.nvRibbonI;
    var soffMat = d > 0 ? MAT.nvSoffitW : MAT.nvSoffitI;
    var turfMat = d > 0 ? MAT.turfR : MAT.turf;

    /* A. Sea-base flared arched buttress legs for T0 (rises from seabed through P0's inner lagoon!) */
    var shaftY0 = y0 - 4.0;
    if (t.id === 'T0') {
      var sb = TETHIS.seabedAt(tx, tz);
      shaftY0 = 16.0;
      /* Central submerged core caisson rooting into seabed (connects U0 at -19.5..-7.5 m to T0!) */
      var caisson = lathe({
        rFn: function (yy) {
          var foot = yy < 5.0 ? (1.0 + 0.35 * (1.0 - yy / 5.0)) : 1.0;
          return (rTr * 0.74) * foot;
        },
        H: 22.0 - (sb - 1.0), flutes: 12, amp: 0.06, sharp: 1.8, nu: 28, nv: 12
      });
      caisson.translate(tx, sb - 1.0, tz);
      anhPut(B, concMat, caisson);

      /* 6 monumental arched sea-buttress legs framing lagoon boat-gates at y = 0..+18 m (Ref 3 base!) */
      for (var lg = 0; lg < 6; lg++) {
        var aL = (lg / 6.0) * TAU;
        var csL = Math.cos(aL), snL = Math.sin(aL);
        var footR = rTr + 19.0;
        var sbLeg = TETHIS.seabedAt(tx + footR * csL, tz + footR * snL);
        /* Vertical sea-pier up to y = +4 m, then sweeping parabolic buttress into trunk at y = +26 m */
        rbeam(d > 0 ? 'boxCR' : 'boxC',
          [tx + footR * csL, sbLeg - 0.8, tz + footR * snL],
          [tx + (footR - 2.0) * csL, 5.0, tz + (footR - 2.0) * snL], 5.6, 4.6, null);
        rbeam(d > 0 ? 'boxCR' : 'boxW',
          [tx + (footR - 2.0) * csL, 4.2, tz + (footR - 2.0) * snL],
          [tx + (rTr - 1.5) * csL, 26.5, tz + (rTr - 1.5) * snL], 5.2, 4.2, null);
      }
    }

    /* B. Ribbed vertical trunk shaft flaring smoothly into the Mushroom Cap calyx */
    var neckH = (capY0 + 3.0) - shaftY0;
    var trunkGeo = lathe({
      rFn: function (yy) {
        var wy = shaftY0 + yy;
        if (wy < capY0 - 18.0) {
          var baseFlare = yy < 10.0 ? (1.0 + 0.16 * Math.pow(1.0 - yy / 10.0, 2.0)) : 1.0;
          return rTr * baseFlare;
        }
        /* Smooth trumpet flare into mushroom cap underside */
        var uF = clamp((wy - (capY0 - 18.0)) / 21.0, 0, 1);
        return rTr + (rCap * 0.44 - rTr) * Math.pow(uF, 1.85);
      },
      H: neckH, flutes: 16, amp: 0.075, sharp: 2.0, nu: 48, nv: 26
    });
    trunkGeo.translate(tx, shaftY0, tz);
    anhPut(B, skinMat, trunkGeo);

    /* 4 exterior vertical structural buttress-fins + lift-shaft guide rails up the trunk (Ref 3!) */
    for (var lr = 0; lr < 4; lr++) {
      var aR = lr * Math.PI * 0.5 + Math.PI * 0.25;
      var rx = tx + (rTr + 1.4) * Math.cos(aR), rz = tz + (rTr + 1.4) * Math.sin(aR);
      rbeam(d > 0 ? 'boxCR' : 'boxW', [rx, shaftY0 + 2.0, rz], [rx, capY0 - 11.0, rz], 3.4, 2.4, null);
      if (d === 0) {
        for (var wy = shaftY0 + 12.0; wy < capY0 - 18.0; wy += 12.0) {
          kput('nvCapPortI', [tx + (rTr + 2.5) * Math.cos(aR), wy, tz + (rTr + 2.5) * Math.sin(aR)],
            qFacing([Math.cos(aR), 0, Math.sin(aR)]), [1.2, 2.0, 1.0], null);
        }
      }
    }

    /* C. Asymmetric cantilevered mid-stem blister pods + collar galleries (Ref 3: projecting warm-lit observation blisters!) */
    var pods = t.stemPods || [];
    var lobeAngles = [0.45, 2.55, -1.35];
    for (var pi = 0; pi < pods.length; pi++) {
      var pod = pods[pi], py = pod.y, pr = pod.r, pH = pod.st * 4.0;
      /* Slim collar gallery wrapping trunk */
      var collarR = rTr + 5.5;
      var podCollar = new THREE.CylinderGeometry(collarR, collarR * 0.92, pH + 2.2, 36);
      podCollar.translate(tx, py + pH * 0.35, tz);
      anhPut(B, concMat, podCollar);

      /* Asymmetric cantilevered saucer-blister projecting outward on bearing lobeAng (Ref 3!) */
      var lobeAng = lobeAngles[pi % lobeAngles.length];
      var lxP = tx + Math.cos(lobeAng) * (rTr * 0.58), lzP = tz + Math.sin(lobeAng) * (rTr * 0.58);
      var blisterR = pr * 0.68;
      var podSoff = lathe({
        rFn: function (yy) {
          var f = yy / (pH + 4.2);
          if (f < 0.42) return lerp(blisterR * 0.35, blisterR, Math.pow(f / 0.42, 0.65));
          if (f > 0.82) return lerp(blisterR, blisterR * 0.55, (f - 0.82) / 0.18);
          return blisterR;
        },
        H: pH + 4.2, nu: 32, nv: 8
      });
      podSoff.translate(lxP, py - 2.2, lzP);
      anhPut(B, skinMat, podSoff);

      var podGlass = new THREE.CylinderGeometry(blisterR + 0.3, blisterR + 0.3, pH * 0.58, 32, 1, true);
      podGlass.translate(lxP, py + pH * 0.38, lzP);
      anhPut(B, d > 0 ? MAT.nvSubPearlGlow : MAT.nvAmberCore, podGlass);
    }

    /* D. Wide Mushroom Saucer Cap with 24 glowing radial soffit ribs (Ref 3's signature underside!) */
    var rNeck = rCap * 0.36;
    var capSoff = gridSurface(function (u, v) {
      var th = u * TAU;
      var rr = lerp(rNeck, rCap, v);
      var arch = Math.pow(v, 0.68) * 11.5 - (v > 0.88 ? Math.pow((v - 0.88) / 0.12, 1.6) * 2.2 : 0.0);
      return [tx + rr * Math.cos(th), (capY0 - 9.5) + arch, tz + rr * Math.sin(th)];
    }, 72, 10, { uS: 9.0, vS: 4.0 });
    anhPut(B, soffMat, capSoff);

    /* 24 crisp projecting structural radial soffit ribs under the mushroom cap (Ref 3!) */
    for (var rb = 0; rb < 24; rb++) {
      var aRib = (rb / 24.0) * TAU;
      var cB = Math.cos(aRib), sB = Math.sin(aRib);
      rbeam(d > 0 ? 'boxCR' : 'boxW',
        [tx + (rTr - 0.5) * cB, capY0 - 11.0, tz + (rTr - 0.5) * sB],
        [tx + (rCap - 2.0) * cB, capY0 + 1.2, tz + (rCap - 2.0) * sB],
        2.4, 1.6, null);
    }

    /* Concentric stepped ribbon-glazed sky-villa decks on the Mushroom Cap (capY0 .. y1) */
    var capSt = t.capSt, cSto = (y1 - capY0) / capSt;
    for (var cs = 0; cs < capSt; cs++) {
      var cya = capY0 + cs * cSto, cyb = cya + cSto;
      var cro0 = rCap - cs * 4.8, cro1 = rCap - (cs + 1) * 4.8;
      var wGeo = gridSurface(function (u, v) {
        var th = u * TAU, rr = lerp(cro0, cro0 - 0.7, v);
        return [tx + rr * Math.cos(th), lerp(cya, cyb, v), tz + rr * Math.sin(th)];
      }, 64, 1, { uS: Math.round(cro0 * TAU / 16.0), vS: 0.25 });
      anhPut(B, ribMat, wGeo);

      var bGeo = gridSurface(function (u, v) {
        var th = u * TAU, rr = lerp(cro1 - 0.5, cro0 + 1.2, v);
        return [tx + rr * Math.cos(th), cyb + 0.05, tz + rr * Math.sin(th)];
      }, 64, 1, { uS: cro0 * TAU / 12.0, vS: 1.0 });
      anhPut(B, cs >= capSt - 2 ? turfMat : skinMat, bGeo);
    }

    /* Slender perimeter radio/sensor needles rising around the Mushroom Cap outer rim (Ref 3!) */
    var nRimNeedles = t.id === 'T0' ? 8 : 4;
    for (var rn = 0; rn < nRimNeedles; rn++) {
      var aRN = (rn / nRimNeedles) * TAU + 0.22;
      var rRN = rCap - 3.0;
      var nH = rn % 2 === 0 ? 18.0 : 12.0;
      kput(d > 0 ? 'postR' : 'postW',
        [tx + rRN * Math.cos(aRN), capY0 + cSto + nH * 0.5 - 1.0, tz + rRN * Math.sin(aRN)],
        null, [0.42, nH, 0.42], null);
    }

    /* E. Summit Rainwater-Catchment Dish, Orchard Crown, Council Cupola & Spires (y1 .. spireTop) */
    var rCrown = rCap - capSt * 4.8 + 1.0;
    var crownBowl = gridSurface(function (u, v) {
      var th = u * TAU, rr = v * rCrown;
      var dip = -1.6 * (1.0 - v * v);
      return [tx + rr * Math.cos(th), y1 + 0.2 + dip, tz + rr * Math.sin(th)];
    }, 56, 5, { uS: rCrown / 6.0, vS: rCrown / 6.0 });
    anhPut(B, turfMat, crownBowl);

    /* Summit orchard trees around the mushroom crown */
    var rngM = KRAND.stream(KRAND.child(seed, 'mush_trees:' + t.id));
    var nTr = t.id === 'T0' ? 28 : 16;
    for (var kt = 0; kt < nTr; kt++) {
      var aT = (kt / nTr) * TAU + (rngM.next() - 0.5) * 0.16;
      var radT = rCrown * (0.48 + 0.38 * rngM.next());
      var hT = 6.5 + 4.5 * rngM.next();
      VEG.tree(tx + radT * Math.cos(aT), y1 - 0.6, tz + radT * Math.sin(aT), kt % 3, hT);
    }

    /* Central Council Cupola & tall twin sensor/lightning spires (Ref 3 top silhouette!) */
    var rCup = rCrown * 0.36, cupH = (spireTop - y1) * 0.46;
    var cupGeo = lathe({
      rFn: function (yy) {
        var f = clamp(yy / cupH, 0, 1);
        return rCup * Math.sqrt(Math.max(0.02, 1.0 - f * f * 0.92));
      },
      H: cupH, nu: 36, nv: 10
    });
    cupGeo.translate(tx, y1 - 1.4, tz);
    anhPut(B, skinMat, cupGeo);

    var mastH = (spireTop + 8.0) - (y1 + cupH * 0.72);
    var mainMast = new THREE.CylinderGeometry(0.42, 1.75, mastH, 12);
    mainMast.translate(tx, y1 + cupH * 0.72 + mastH * 0.5, tz);
    anhPut(B, skinMat, mainMast);

    var secMast = new THREE.CylinderGeometry(0.28, 0.98, mastH * 0.80, 10);
    secMast.translate(tx + rCup * 0.58, y1 + cupH * 0.52 + mastH * 0.40, tz - rCup * 0.32);
    anhPut(B, skinMat, secMast);
  }

  /* ---- 2. Grown Hykkousoi Helical Conch-Stair around T0 (d = 1) ---- */
  function addConchHelix(B, hx) {
    var y0 = hx.y0, y1 = hx.y1, rIn = 25.4, rOut = hx.r + 3.8, turns = hx.turns;
    var nu = 168;
    /* Swept nacre spiral ramp overlapping T0's 26 m fluted trunk so KRUINS sees continuous solid contact */
    var ramp = gridSurface(function (u, v) {
      var th = u * turns * TAU;
      var y = lerp(y0, y1, u);
      var rr = lerp(rIn, rOut, v);
      var lip = v > 0.84 ? (v - 0.84) / 0.16 * 2.4 : 0.0;
      return [hx.x + rr * Math.cos(th), y + lip, hx.z + rr * Math.sin(th)];
    }, nu, 4, { uS: 28.0, vS: 1.0 });
    var soff = gridSurface(function (u, v) {
      var th = u * turns * TAU;
      var y = lerp(y0, y1, u);
      var rr = lerp(rIn, rOut, v);
      var rib = 0.45 * Math.cos(u * turns * 48.0 * Math.PI);
      return [hx.x + rr * Math.cos(th), y - 1.45 * (1.0 - 0.45 * v) + rib * 0.25, hx.z + rr * Math.sin(th)];
    }, nu, 3, { uS: 28.0, vS: 1.0 });
    anhPut(B, MAT.nvNacre, ramp);
    anhPut(B, MAT.nvNacreCoral, soff);

    /* Conch-pod landings & warm oil lanterns along the spiral */
    for (var k = 0; k <= 14; k++) {
      var uK = k / 14.0, thK = uK * turns * TAU, yK = lerp(y0, y1, uK);
      var lx = hx.x + (rOut - 1.2) * Math.cos(thK), lz = hx.z + (rOut - 1.2) * Math.sin(thK);
      if (k % 2 === 0 && k > 0 && k < 14) {
        kput('nvNacrePod', [lx, yK - 0.8, lz], qEuler(0, -thK, 0), [4.2, 5.8, 4.2], null);
      }
      kput('nvCapPortW', [lx, yK + 1.8, lz], qFacing([Math.cos(thK), 0, Math.sin(thK)]), [0.75, 0.75, 0.75], null);
    }
  }

  /* ---- 3. Metabolist / Soleri Plug-In Capsule Drum Towers (T1a..T5 — Ref 4) ---- */
  function addCapsuleTower(B, t, d, seed) {
    var tx = t.x, tz = t.z, rCore = t.rCore, rDrum = t.rDrum;
    var yBase = t.y0 - 6.5, y1 = t.y1, spireTop = t.spireTop;
    var skinMat = d > 0 ? MAT.nvDeckW : MAT.white;
    var concMat = d > 0 ? MAT.concreteR : MAT.concrete;
    var turfMat = d > 0 ? MAT.turfR : MAT.turf;
    var rng = KRAND.stream(KRAND.child(seed, 'captower:' + t.id));

    /* A. Proud central cylindrical core rising +18 m above top capsule drum (Ref 4's water-header / lift crown!) */
    var proudTop = t.kind === 'capsule_pharos' ? (y1 + 4.0) : (spireTop + 5.0);
    var coreH = proudTop - yBase;
    var coreGeo = lathe({
      rFn: function (yy) {
        var foot = yy < 9.0 ? (1.0 + 0.36 * Math.pow(1.0 - yy / 9.0, 1.6)) : 1.0;
        var neckStep = yy > coreH - 7.0 ? 0.86 : 1.0;
        return rCore * foot * neckStep;
      },
      H: coreH, flutes: 16, amp: 0.035, sharp: 1.8, nu: 32, nv: 22
    });
    coreGeo.translate(tx, yBase, tz);
    anhPut(B, skinMat, coreGeo);

    /* B. Stacked cellular drums studded with radial plug-in dwelling capsules (Ref 4!) */
    var nDrums = t.drums, stD = t.stPerDrum, sto = 3.35;
    var drumH = stD * sto;
    var loggiaH = Math.max(8.0, ((y1 - (t.y0 + 3.0)) - nDrums * drumH) / Math.max(1, nDrums));
    var nCols = Math.max(18, Math.round((TAU * (rDrum - 2.0)) / 9.4));
    var capItem = d > 0 ? 'nvCapModW' : 'nvCapModI';
    var portItem = d > 0 ? 'nvCapPortW' : 'nvCapPortI';

    for (var dr = 0; dr < nDrums; dr++) {
      var dy0 = t.y0 + 4.0 + dr * (drumH + loggiaH);
      var dy1 = dy0 + drumH;
      /* Deep recessed structural inner shadow cylinder so radial capsules project 3.4 m proud in crisp relief (Ref 4!) */
      var rInner = rDrum - 5.8;

      var botPlate = new THREE.CylinderGeometry(rDrum - 2.2, rCore + 1.5, 2.4, 36);
      botPlate.translate(tx, dy0 - 1.0, tz);
      var topPlate = new THREE.CylinderGeometry(rDrum - 1.8, rDrum - 1.8, 1.8, 36);
      topPlate.translate(tx, dy1 + 0.7, tz);
      var innerWall = new THREE.CylinderGeometry(rInner, rInner, drumH + 0.6, 36, 1, true);
      innerWall.translate(tx, dy0 + drumH * 0.5, tz);
      anhPut(B, concMat, [botPlate, topPlate]);
      anhPut(B, MAT.darkSurf, innerWall);

      /* Sky-garden turf ring on top of each drum (loggia terrace!) */
      var loggiaTurf = gridSurface(function (u, v) {
        var th = u * TAU, rr = lerp(rCore + 0.5, rDrum - 2.0, v);
        return [tx + rr * Math.cos(th), dy1 + 1.65, tz + rr * Math.sin(th)];
      }, 36, 2, { uS: rDrum / 4.0, vS: 2.0 });
      anhPut(B, turfMat, loggiaTurf);

      /* Perimeter sky-loggia columns linking drum roof to next drum's soffit */
      if (dr < nDrums - 1) {
        for (var pc = 0; pc < 12; pc++) {
          var aP = (pc / 12.0) * TAU;
          var px = tx + (rInner - 1.0) * Math.cos(aP), pz = tz + (rInner - 1.0) * Math.sin(aP);
          rbeam(d > 0 ? 'postR' : 'postW', [px, dy1 + 1.3, pz], [px, dy1 + loggiaH - 1.5, pz], 1.1, 1.1, null);
        }
      }

      /* Radial plug-in capsules around the drum (projecting 3.4 m proud of dark innerWall -> Ref 4!) */
      for (var st = 0; st < stD; st++) {
        var cy = dy0 + (st + 0.5) * sto;
        var stag = (st % 2) * (0.5 / nCols);
        for (var c = 0; c < nCols; c++) {
          var roll = rng.next();
          if (roll < (d > 0 ? 0.17 : 0.09)) continue;
          var th = ((c / nCols) + stag) * TAU;
          var cs = Math.cos(th), sn = Math.sin(th);
          /* Capsule length is 6.4 m (±3.2 m); placing centre at rInner + 1.8 overlaps innerWall by 1.4 m & projects 5.0 m! */
          var rMid = rInner + 1.8;
          var q = qFacing([cs, 0, sn]);
          var tint = d > 0
            ? new THREE.Color().setHSL(0.08 + 0.03 * rng.next(), 0.15, 0.72 + 0.18 * rng.next())
            : new THREE.Color().setHSL(0.56, 0.04, 0.92 + 0.08 * rng.next());
          kput(capItem, [tx + rMid * cs, cy, tz + rMid * sn], q, [0.94, 0.86, 1.0], tint);

          if (d === 0 || (dr < nDrums - 1 && rng.next() > 0.34)) {
            var rPort = rMid + 3.25;
            kput(portItem, [tx + rPort * cs, cy + 0.1, tz + rPort * sn], q, [1.0, 1.0, 1.0], null);
          }
        }
      }

      /* Hykkousoi nacre barnacle-pods & wind-catchers accreted onto occupied capsule drums (d = 1) */
      if (d > 0 && t.modern.state === 'hyk_accreted' && dr < 2) {
        for (var hp = 0; hp < 6; hp++) {
          var aH = rng.next() * TAU;
          var hy = dy0 + (0.2 + 0.6 * rng.next()) * drumH;
          var hx = tx + (rInner + 0.8) * Math.cos(aH), hz = tz + (rInner + 0.8) * Math.sin(aH);
          kput('nvNacrePod', [hx, hy - 2.4, hz], qEuler(0, -aH, 0), [4.2, 5.8, 4.2], null);
          kput('nvScallop', [hx, hy - 0.4, hz], qFacing([Math.cos(aH), 0, Math.sin(aH)]), [4.8, 2.4, 4.4], null);
        }
      }
    }

    /* C. Special tower crowns: T3 Dew-Spire vanes, T5 Pharos beacon, or standard water-header spire */
    var crownY = y1 + 2.0, mastTop = spireTop;
    if (t.id === 'T3') {
      /* 8 radial dew-condenser vanes / Hykkousoi sea-linen fog-catcher sails */
      var vaneMat = d > 0 ? MAT.nvSailHyk : MAT.glass;
      for (var v = 0; v < 8; v++) {
        var aV = (v / 8.0) * TAU, cV = Math.cos(aV), sV = Math.sin(aV);
        var finG = gridSurface(function (u, w) {
          var rad = lerp(rCore * 0.85, rDrum * 0.88 * (1.0 - 0.45 * w), u);
          return [tx + rad * cV, lerp(crownY - 1.0, spireTop - 1.5, w), tz + rad * sV];
        }, 4, 5, { uS: 2.0, vS: 2.0 });
        anhPut(B, vaneMat, finG);
      }
    } else if (t.kind === 'capsule_pharos') {
      /* West Sea-Gate Pharos Lantern & Hykkousoi Whale-Oil Mirror Beacon (T5) */
      var lantH = (spireTop - crownY) * 0.65;
      var lantCup = new THREE.CylinderGeometry(rCore * 0.85, rCore * 1.15, lantH, 24);
      lantCup.translate(tx, crownY + lantH * 0.5 - 1.0, tz);
      anhPut(B, d > 0 ? MAT.verdigris : MAT.nvSubGlassI, lantCup);

      var domeP = new THREE.SphereGeometry(rCore * 0.92, 20, 10, 0, TAU, 0, Math.PI * 0.5);
      domeP.translate(tx, crownY + lantH - 1.2, tz);
      anhPut(B, d > 0 ? MAT.nvNacre : MAT.white, domeP);

      /* Bright beacon heart */
      var beaconOrb = new THREE.SphereGeometry(4.2, 16, 12);
      beaconOrb.translate(tx, crownY + lantH * 0.45, tz);
      anhPut(B, d > 0 ? MAT.nvSubPearlGlow : MAT.nvSubGlassI, beaconOrb);
      if (d > 0) {
        firePit('tethis_pharos', tx, crownY + lantH * 0.42, tz, 4.5);
      }
    } else {
      var finialMast = new THREE.CylinderGeometry(0.4, 1.5, mastTop - crownY + 3.0, 10);
      finialMast.translate(tx, (crownY - 3.0 + mastTop) * 0.5, tz);
      anhPut(B, skinMat, finialMast);
    }
  }

  /* ---- 4. Segmented Industrial Condenser & Crane Columns (T6a, T6b — Ref 4) ---- */
  function addIndustrialTower(B, t, d) {
    var tx = t.x, tz = t.z, rCore = t.rCore, rDrum = t.rDrum;
    var yBase = t.y0 - 6.0, y1 = t.y1, spireTop = t.spireTop;
    var colMat = d > 0 ? (t.modern.state === 'worn_idle' ? MAT.rust : MAT.concreteR) : MAT.white;
    var pipeMat = d > 0 ? MAT.verdigris : MAT.pipe;

    /* Smooth segmented distillation shaft with horizontal flange rings every 8.5 m (Ref 4!) */
    var H = y1 - yBase;
    var colGeo = lathe({
      rFn: function (yy) {
        var flange = Math.sin((yy / 8.5) * TAU) > 0.82 ? 1.09 : 1.0;
        var foot = yy < 8.0 ? (1.0 + 0.28 * (1.0 - yy / 8.0)) : 1.0;
        return rCore * flange * foot;
      },
      H: H, nu: 32, nv: 36
    });
    colGeo.translate(tx, yBase, tz);
    anhPut(B, colMat, colGeo);

    /* 4 external vertical vapour-riser pipes */
    for (var p = 0; p < 4; p++) {
      var a = p * Math.PI * 0.5 + 0.4;
      var px = tx + (rCore + 1.8) * Math.cos(a), pz = tz + (rCore + 1.8) * Math.sin(a);
      var rPipe = new THREE.CylinderGeometry(1.15, 1.15, H - 6.0, 12);
      rPipe.translate(px, yBase + (H - 6.0) * 0.5 + 2.0, pz);
      anhPut(B, pipeMat, rPipe);
    }

    /* 2 shift-crew service collars */
    for (var c = 0; c < 2; c++) {
      var cy = t.y0 + 22.0 + c * 36.0;
      var collar = new THREE.CylinderGeometry(rDrum * 0.82, rDrum * 0.76, 9.5, 28);
      collar.translate(tx, cy, tz);
      anhPut(B, d > 0 ? MAT.nvRibbonW : MAT.nvRibbonI, collar);
    }

    /* Monumental T-beam rotating hammerhead crane at the summit (Ref 4!) */
    var mastH = spireTop - y1 + 3.0;
    var mast = new THREE.CylinderGeometry(2.6, 3.4, mastH, 14);
    mast.translate(tx, y1 + mastH * 0.5 - 2.0, tz);
    anhPut(B, colMat, mast);

    var boomAng = t.id === 'T6a' ? 0.35 : -0.55;
    var cB = Math.cos(boomAng), sB = Math.sin(boomAng);
    rbeam(d > 0 ? 'strutR' : 'strutW',
      [tx - 24.0 * cB, spireTop - 1.8, tz - 24.0 * sB],
      [tx + 38.0 * cB, spireTop - 1.8, tz + 38.0 * sB],
      3.4, 3.2, null);
  }

  function buildAllTowers(B, P, d, seed) {
    for (var i = 0; i < P.towers.length; i++) {
      var t = P.towers[i];
      if (t.kind === 'mushroom_great' || t.kind === 'mushroom_belvedere') {
        addMushroomTower(B, t, d, seed);
      } else if (t.kind === 'industrial_condenser') {
        addIndustrialTower(B, t, d);
      } else {
        addCapsuleTower(B, t, d, seed);
      }
    }

    /* Hykkousoi T0 helical conch-stair & T1a<->T1b sky-loggia suspension bridge in d = 1 */
    if (d > 0) {
      for (var h = 0; h < P.hykkousoi.length; h++) {
        var hx = P.hykkousoi[h];
        if (hx.kind === 'conch_helical_stair') {
          addConchHelix(B, hx);
        }
      }
      /* Woven sea-linen & timber suspension bridge linking T1a (245,-380) and T1b (145,-380) at sky-loggia y = +102 m */
      var catBridge = gridSurface(function (u, v) {
        var x = lerp(145.0 + 27.0, 245.0 - 30.0, u);
        var sag = -2.4 * Math.sin(u * Math.PI);
        var z = -380.0 + (v - 0.5) * 3.8;
        return [x, 100.2 + sag, z];
      }, 16, 2, { uS: 8.0, vS: 1.0 });
      anhPut(B, MAT.timber, catBridge);
    }
  }

  return {
    buildAllTowers: buildAllTowers
  };
})();
