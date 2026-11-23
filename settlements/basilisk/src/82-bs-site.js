/* ==================== Basilisk 82: the stone capital's site, platforms, Mound, Dholavira water, dock & manifest ([G data]) ==================== */
/* settlements/basilisk/PLAN.md sections 1-8 (owner's approvals 2026-11-17).
   Pure data and plain functions: no three.js, no DOM.
   1. Decodes BS_GROUND (gen/69g-bs-ground.js, scale model 5.1 round px 766.6,1597.25) and BS_PLAN (gen/81p-bs-plan.js).
   2. Shapes the eastern terminal sea & Tlahn Gill bay bed from the model's water mask (keeping >= 120 m dry sabkha strand
      round the walls and works), carves the 175 x 36 m Lothal dock basin, the seven Dholavira cascading reservoirs, Tlahn Gill
      and its 2.1 km leat into nearH, and registers nearH, farH, the +5 m brick city platform, the +12 m polygonal-basalt Mound
      of Intention and the 700 m basalt ley mole in KDRAWN so terrainH and KDRAWN agree to 0 mm everywhere.
   3. Registers the Great Coil, Ley Way and eight spiral districts on KCITY.create, lays the southern paddy apron ring hamlet on
      KHAMLET.village ('lizardmen', focus 'farming'), seats all 2,325 manifest buildings & vessels through KSPACE with zero
      overlaps (lz-barge floating on WATER.open / dock still water as cls 'vessel'), and lays bunded bamboo-rice & taro paddies. */
var BS_SITE = (function () {
  var SEED = 79010;
  var SABKHA_Y = -2600.0;
  var SEA_Y = BS_GROUND.sea;
  var PLAT_Y = SABKHA_Y + 5.0;
  var MOUND_Y = SABKHA_Y + 12.0;
  var MOLE_Y = SABKHA_Y + 1.0;
  var bsD = function (x, d) { return x == null ? d : x; };
  var sm = function (a, b, v) { var t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  var uv2xz = function (p) { return [p[0], -p[1]]; };
  var uvList = function (L) { return L.map(uv2xz); };

  function decGrid(o) {
    var s = atob(o.b64), n = s.length >> 1, a = new Float32Array(n), i, v;
    for (i = 0; i < n; i++) {
      v = s.charCodeAt(2 * i) | (s.charCodeAt(2 * i + 1) << 8);
      if (v > 32767) v -= 65536;
      a[i] = o.base + v * o.unit;
    }
    return a;
  }
  function decBytes(b64) {
    var s = atob(b64), n = s.length, a = new Uint8Array(n), i;
    for (i = 0; i < n; i++) a[i] = s.charCodeAt(i);
    return a;
  }

  var N = BS_GROUND.near, F = BS_GROUND.far;
  var modelNear = decGrid(N), farRaw = decGrid(F);
  var waterNear = decBytes(N.w64), waterFar = decBytes(F.w64);
  var nearH = new Float32Array(modelNear);
  var farH = new Float32Array(farRaw);

  function bil(G, arr, x, z) {
    var u = Math.min(G.nx - 1.0001, Math.max(0, (x - G.x0) / G.step));
    var v = Math.min(G.nz - 1.0001, Math.max(0, (z - G.z0) / G.step));
    var i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j, k = j * G.nx + i;
    return (arr[k] * (1 - fu) + arr[k + 1] * fu) * (1 - fv) + (arr[k + G.nx] * (1 - fu) + arr[k + G.nx + 1] * fu) * fv;
  }
  function modelH(x, z) {
    if (x >= N.x0 && x <= N.x1 && z >= N.z0 && z <= N.z1) return bil(N, modelNear, x, z);
    return bil(F, farRaw, x, z);
  }

  /* Polygon helpers (2D in x east, z south) */
  function segDist(x, z, a, b) {
    var dx = b[0] - a[0], dz = b[1] - a[1], l2 = Math.max(1e-9, dx * dx + dz * dz);
    var t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2));
    return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz);
  }
  function lineDist(x, z, P) {
    var best = 1e9, i;
    for (i = 0; i + 1 < P.length; i++) best = Math.min(best, segDist(x, z, P[i], P[i + 1]));
    return best;
  }
  function inPoly(P, x, z) {
    var inside = false, i, j = P.length - 1, xi, zi, xj, zj;
    for (i = 0; i < P.length; j = i++) {
      xi = P[i][0]; zi = P[i][1]; xj = P[j][0]; zj = P[j][1];
      if (((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / ((zj - zi) || 1e-12) + xi)) inside = !inside;
    }
    return inside;
  }
  function sdPoly(P, x, z) {
    var d = 1e9, i;
    for (i = 0; i < P.length; i++) d = Math.min(d, segDist(x, z, P[i], P[(i + 1) % P.length]));
    return inPoly(P, x, z) ? d : -d;
  }
  function offsetPoly(P, dist) {
    /* Outward offset of a simple polygon by `dist` metres along bisector normals */
    var area2 = 0, n = P.length, i, a, b, c, e1x, e1z, l1, e2x, e2z, l2, n1x, n1z, n2x, n2z, bx, bz, bl, dot, k;
    for (i = 0; i < n; i++) {
      a = P[i]; b = P[(i + 1) % n];
      area2 += a[0] * b[1] - b[0] * a[1];
    }
    var sg = area2 > 0 ? 1 : -1, out = [];
    for (i = 0; i < n; i++) {
      a = P[(i + n - 1) % n]; b = P[i]; c = P[(i + 1) % n];
      e1x = b[0] - a[0]; e1z = b[1] - a[1]; l1 = Math.hypot(e1x, e1z) || 1; e1x /= l1; e1z /= l1;
      e2x = c[0] - b[0]; e2z = c[1] - b[1]; l2 = Math.hypot(e2x, e2z) || 1; e2x /= l2; e2z /= l2;
      n1x = sg * e1z; n1z = -sg * e1x;
      n2x = sg * e2z; n2z = -sg * e2x;
      bx = n1x + n2x; bz = n1z + n2z; bl = Math.hypot(bx, bz) || 1; bx /= bl; bz /= bl;
      dot = Math.max(0.45, bx * n1x + bz * n1z);
      k = dist / dot;
      out.push([b[0] + bx * k, b[1] + bz * k]);
    }
    return out;
  }

  /* Extract key plan geometries into (x, z) */
  var wallLine = uvList(BS_PLAN.wall.line);
  var wallPoly = wallLine.slice();
  var gateXz = uv2xz(BS_PLAN.wall.gate);
  var moundPoly = uvList(BS_PLAN.precinct.poly);
  var coilStreet = uvList(BS_PLAN.coil.street);
  var firstTurnPoly = uvList(BS_PLAN.coil.first_turn);
  var leyDir = [BS_PLAN.ley.dir[0], -BS_PLAN.ley.dir[1]];
  var leyPerp = [-leyDir[1], leyDir[0]];
  var slotT = BS_PLAN.ley.slot_t;
  var shoreT = BS_PLAN.ley.shore_t;
  var mole0 = BS_PLAN.ley.mole[0], mole1 = BS_PLAN.ley.mole[1];
  var slotXz = [leyDir[0] * slotT, leyDir[1] * slotT];

  /* Earthwork records from BS_PLAN: Lothal dock, charcoal yard, 7 Dholavira reservoirs, Tlahn Gill & leat */
  var dockRaw = BS_PLAN.placed.find(function (r) { return r.key === 'lk-dock'; });
  var dock = (function () {
    var xz = uv2xz(dockRaw.at), ry = dockRaw.ry, c = Math.cos(ry), s = Math.sin(ry), w = 36, d = 175;
    var poly = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) {
      return [xz[0] + q[0] * w / 2 * c + q[1] * d / 2 * s, xz[1] - q[0] * w / 2 * s + q[1] * d / 2 * c];
    });
    var sluiceStart = [xz[0] + (d / 2) * s, xz[1] + (d / 2) * c];
    var sluiceEnd = [sluiceStart[0] + 58 * c + 28 * s, sluiceStart[1] - 58 * s + 28 * c];
    return { x: xz[0], z: xz[1], ry: ry, w: w, d: d, poly: poly, level: SEA_Y, floor: SEA_Y - 2.3, sluice: [sluiceStart, sluiceEnd] };
  })();

  var charcoalRaw = BS_PLAN.placed.find(function (r) { return r.key === 'lk-charcoal'; });
  var charcoal = (function () {
    var xz = uv2xz(charcoalRaw.at);
    return { x: xz[0], z: xz[1], ry: charcoalRaw.ry, w: 40, d: 30 };
  })();

  var reservoirs = BS_PLAN.water.reservoirs.map(function (r) {
    var P = uvList(r.poly), cx = 0, cz = 0, i;
    for (i = 0; i < P.length; i++) { cx += P[i][0]; cz += P[i][1]; }
    cx /= P.length; cz /= P.length;
    return {
      i: r.i, poly: P, outer: offsetPoly(P, 6.5), cx: cx, cz: cz,
      level: SABKHA_Y + r.level_m, rim: SABKHA_Y + r.level_m + 0.85, floor: SABKHA_Y + r.level_m - 2.4, area: r.area
    };
  });

  var checkDamXz = uv2xz(BS_PLAN.water.check_dam);
  var leatRaw = uvList(BS_PLAN.water.leat);
  /* Densify Tlahn Gill (r762) segments first (model pixels are 2 km apart) then clip to NEAR so the wadi flows into the bay */
  var tlahnRaw = (function () {
    var raw = uvList(BS_PLAN.site.rivers.r762.pts), dense = [], i, a, b, L, ns, k, u, px, pz;
    for (i = 0; i + 1 < raw.length; i++) {
      a = raw[i]; b = raw[i + 1]; L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      ns = Math.max(1, Math.ceil(L / 180));
      for (k = 0; k < ns; k++) {
        u = k / ns;
        dense.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
      }
    }
    if (raw.length) dense.push(raw[raw.length - 1]);
    return dense.filter(function (p) {
      return p[0] > N.x0 - 400 && p[0] < N.x1 + 400 && p[1] > N.z0 - 400 && p[1] < N.z1 + 400;
    });
  })();
  var leatPts = (function () {
    var a = leatRaw[0], b = leatRaw[1], out = [], n = 14, i, t, x, z, y;
    for (i = 0; i <= n; i++) {
      t = i / n;
      x = a[0] + (b[0] - a[0]) * t + Math.sin(t * Math.PI) * (-42);
      z = a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * 28;
      y = (SABKHA_Y + 3.2) * (1 - t) + (reservoirs[reservoirs.length - 1].level + 0.15) * t;
      out.push([x, z, y]);
    }
    return out;
  })();

  /* Dry-keep centres outside the wall (salt pans, dock buildings, bronze hall, roadhead) */
  var dryKeeps = BS_PLAN.placed.filter(function (r) {
    return !r.owed && r.cls !== 'vessel' && r.key !== 'lz-weir' && (r.where === 'works' || r.where === 'pans' || r.where === 'gate_road');
  }).map(function (r) { var p = uv2xz(r.at); return [p[0], p[1], r.key === 'gl-pans' ? 58 : 42]; });
  var wetWeirs = BS_PLAN.placed.filter(function (r) { return r.key === 'lz-weir'; }).map(function (r) { return uv2xz(r.at); });
  var wetBarges = BS_PLAN.placed.filter(function (r) { return r.key === 'lz-barge'; }).map(function (r) { return uv2xz(r.at); });

  /* ---------------------------------------------------------------- 1. Grade nearH & farH */
  var pinModelY = modelH(0, 0);
  (function gradeGrids() {
    var ix, iz, x, z, y, wMask, nWarp, sdw, k, dk, d, sdr, tMole, pMole, dl;
    for (iz = 0; iz < N.nz; iz++) {
      z = N.z0 + iz * N.step;
      for (ix = 0; ix < N.nx; ix++) {
        x = N.x0 + ix * N.step;
        y = nearH[iz * N.nx + ix];
        wMask = bil(N, waterNear, x, z) / 255.0;
        nWarp = (KRAND.fbm(x * 0.0014 + 11.3, z * 0.0014 - 7.1, 3) - 0.5) * 0.16;
        wMask = Math.max(0, Math.min(1, wMask + nWarp));

        /* Keep >= 120 m dry sabkha outside the wall and round every terrestrial shore work */
        sdw = sdPoly(wallPoly, x, z);
        if (sdw > -135) wMask *= sm(-135, -210, -sdw < 135 ? sdw : -210);
        if (sdw > -135) wMask = 0;
        for (k = 0; k < dryKeeps.length; k++) {
          dk = dryKeeps[k];
          d = Math.hypot(x - dk[0], z - dk[1]);
          if (d < dk[2] + 36) wMask *= sm(dk[2], dk[2] + 36, d);
        }

        /* Shape Eastern Terminal Sea & Tlahn Gill Bay bed */
        if (wMask > 0.44) {
          y = Math.min(y, SABKHA_Y - sm(0.44, 0.52, wMask) * 0.65 - sm(0.50, 0.92, wMask) * 3.45);
        }

        /* Ensure weirs stand in shallow 0.45 m bay water and barges in >= 1.8 m water */
        for (k = 0; k < wetWeirs.length; k++) {
          d = Math.hypot(x - wetWeirs[k][0], z - wetWeirs[k][1]);
          if (d < 34) y = y + (1 - sm(14, 34, d)) * ((SEA_Y - 0.42) - y);
        }
        for (k = 0; k < wetBarges.length; k++) {
          d = Math.hypot(x - wetBarges[k][0], z - wetBarges[k][1]);
          if (d < 32) y = Math.min(y, SEA_Y - 1.85 * (1 - sm(16, 32, d)));
        }
        /* Ensure sea bed along the 700 m ley mole (from shoreT + 15 to mole1 + 60) is submerged */
        tMole = x * leyDir[0] + z * leyDir[1];
        pMole = Math.abs(x * leyPerp[0] + z * leyPerp[1]);
        if (tMole > shoreT + 10 && tMole < mole1 + 70 && pMole < 80) {
          y = Math.min(y, SEA_Y - 2.1 * sm(shoreT + 10, shoreT + 55, tMole));
        }

        /* Lothal dock basin & north sluice channel (keep nearH depressed under entire 16 m cell band round basin) */
        sdr = sdPoly(dock.poly, x, z);
        if (sdr > -14) {
          y = dock.floor;
        }
        dl = segDist(x, z, dock.sluice[0], dock.sluice[1]);
        if (dl < 18) y = Math.min(y, SEA_Y - 1.6 * (1 - sm(8, 18, dl)));

        /* Seven Dholavira reservoirs: keep nearH depressed across each basin + wall footprint so 16 m cells never poke
           through WATER.still; 90w-bs-world draws the 3D brick-and-basalt containment walls */
        for (k = 0; k < reservoirs.length; k++) {
          sdr = sdPoly(reservoirs[k].poly, x, z);
          if (sdr > -15) {
            y = reservoirs[k].floor;
          }
        }

        /* Leat embankment & Tlahn Gill shallow wadi cut */
        dl = lineDist(x, z, leatPts);
        if (dl < 15 && sdw < -25) {
          var nearIdx = 0, bestLd = 1e9, li;
          for (li = 0; li < leatPts.length; li++) {
            var qd = Math.hypot(x - leatPts[li][0], z - leatPts[li][1]);
            if (qd < bestLd) { bestLd = qd; nearIdx = li; }
          }
          var ly = leatPts[nearIdx][2];
          if (dl < 6) y = Math.max(y, ly - 0.35);
          else y = y + (1 - sm(6, 15, dl)) * ((ly + 0.25) - y);
        }
        if (tlahnRaw.length > 1) {
          dl = lineDist(x, z, tlahnRaw);
          if (dl < 28 && sdw < -60) {
            y -= (1 - sm(10, 28, dl)) * 1.15;
          }
        }

        nearH[iz * N.nx + ix] = y;
      }
    }

    /* Shape farH: lower Eastern Terminal Sea cells where waterFar > 127 so WATER.open reaches the horizon cleanly,
       and sink farH inside NEAR so the 500 m mesh never pokes through the 16 m near mesh */
    for (iz = 0; iz < F.nz; iz++) {
      z = F.z0 + iz * F.step;
      for (ix = 0; ix < F.nx; ix++) {
        x = F.x0 + ix * F.step;
        wMask = waterFar[iz * F.nx + ix] / 255.0;
        if (wMask > 0.5 && farH[iz * F.nx + ix] <= SABKHA_Y + 2.0) {
          farH[iz * F.nx + ix] = SEA_Y - 5.5;
        }
        if (x > N.x0 + F.step && x < N.x1 - F.step && z > N.z0 + F.step && z < N.z1 - F.step) {
          farH[iz * F.nx + ix] -= 18;
        }
      }
    }
  })();

  /* ---------------------------------------------------------------- 2. Crisp architectural terrace meshes for KDRAWN & 90-bs-world */
  /* Ear-clipping / fan triangulation + battered perimeter skirt builder (pure arrays, [G data]) */
  function triPoly2D(P) {
    /* Simple polygon ear-clipper returning flat triangle index triplets [i0, i1, i2, ...] */
    var n = P.length, V = [], i, area = 0;
    for (i = 0; i < n; i++) area += P[i][0] * P[(i + 1) % n][1] - P[(i + 1) % n][0] * P[i][1];
    for (i = 0; i < n; i++) V.push(area > 0 ? i : (n - 1 - i));
    var out = [], guard = 0;
    function cross2(ax, az, bx, bz, cx, cz) { return (bx - ax) * (cz - az) - (bz - az) * (cx - ax); }
    function ptInTri(px, pz, ax, az, bx, bz, cx, cz) {
      var c1 = cross2(ax, az, bx, bz, px, pz), c2 = cross2(bx, bz, cx, cz, px, pz), c3 = cross2(cx, cz, ax, az, px, pz);
      return c1 >= -1e-6 && c2 >= -1e-6 && c3 >= -1e-6;
    }
    while (V.length > 3 && guard++ < n * n + 20) {
      var clipped = false;
      for (i = 0; i < V.length; i++) {
        var i0 = V[(i + V.length - 1) % V.length], i1 = V[i], i2 = V[(i + 1) % V.length];
        var a = P[i0], b = P[i1], c = P[i2];
        if (cross2(a[0], a[1], b[0], b[1], c[0], c[1]) <= 1e-6) continue;
        var ok = true, k;
        for (k = 0; k < V.length; k++) {
          var vi = V[k];
          if (vi === i0 || vi === i1 || vi === i2) continue;
          if (ptInTri(P[vi][0], P[vi][1], a[0], a[1], b[0], b[1], c[0], c[1])) { ok = false; break; }
        }
        if (ok) {
          out.push(i0, i2, i1);
          V.splice(i, 1);
          clipped = true;
          break;
        }
      }
      if (!clipped) break;
    }
    if (V.length === 3) out.push(V[0], V[2], V[1]);
    return out;
  }

  function buildTerraceMesh(topPoly, yTopFn, skirtOut, yBotFn) {
    var outerPoly = offsetPoly(topPoly, skirtOut), n = topPoly.length, pos = [], idx = [], i, nxt;
    for (i = 0; i < n; i++) pos.push(topPoly[i][0], yTopFn(topPoly[i][0], topPoly[i][1], i), topPoly[i][1]);
    for (i = 0; i < n; i++) pos.push(outerPoly[i][0], yBotFn(outerPoly[i][0], outerPoly[i][1], i), outerPoly[i][1]);
    var topIdx = triPoly2D(topPoly);
    for (i = 0; i < topIdx.length; i++) idx.push(topIdx[i]);
    for (i = 0; i < n; i++) {
      nxt = (i + 1) % n;
      idx.push(i, n + i, n + nxt, i, n + nxt, nxt);
    }
    return { pos: pos, idx: idx, topPoly: topPoly, outerPoly: outerPoly };
  }

  /* City +5 m brick platform: covers wallPoly expanded by +7.2 m (seating all 13 watchtowers & lk-slot on +5 m),
     with an entry ramp in front of South Gate (lk-gate stands on -2,600 m sabkha at gateXz, and the Great Coil ramps
     smoothly up +5 m into the Gate Quarter tongue) */
  var cityTopPoly = offsetPoly(wallPoly, 7.2);
  function cityPlatTopY(x, z) {
    /* Keep the immediate 22 m apron round lk-gate at sabkha level, ramping to +5 m over 140 m north up the Coil */
    var dx = x - gateXz[0], dz = z - gateXz[1];
    if (Math.abs(dx) < 34 && dz > -165 && dz < 24) {
      var t = sm(-16, -155, dz);
      return SABKHA_Y + 5.0 * t;
    }
    return PLAT_Y;
  }
  var cityTerrace = (function () {
    /* Subdivide the southern Gate Quarter ramp zone with a fine grid patch so the ramp is smooth, plus the flat city polygon */
    var base = buildTerraceMesh(cityTopPoly, function () { return PLAT_Y; }, 2.6, function () { return SABKHA_Y - 0.35; });
    /* Cut a clean forecourt notch around lk-gate so lk-gate sits at SABKHA_Y with a sloped Coil ramp north into the tongue */
    return base;
  })();

  /* Wait: if cityTerrace is at PLAT_Y everywhere on cityTopPoly, lk-gate at gateXz would sit at PLAT_Y unless cityTopPoly
     steps back north of lk-gate! Let's inset wall[0] and wall[7] (the two gate endpoints) north by 18 m on cityTopPoly
     and add an explicit sloped Great Coil ramp mesh from z = gateXz[1] - 6 (SABKHA_Y) to z = gateXz[1] - 110 (PLAT_Y)! */
  cityTerrace = (function () {
    var P = wallPoly.map(function (p, i) {
      if (i === 0 || i === 7) return [p[0], p[1] - 18];
      return [p[0], p[1]];
    });
    var topP = offsetPoly(P, 7.2);
    /* Keep topP north of gateXz[1] - 9 right at the gate mouth so lk-gate (22 x 12 m at gateXz) stands squarely at SABKHA_Y */
    topP[0][1] = Math.min(topP[0][1], gateXz[1] - 9.5);
    topP[7][1] = Math.min(topP[7][1], gateXz[1] - 9.5);
    var mesh = buildTerraceMesh(topP, function () { return PLAT_Y; }, 2.6, function () { return SABKHA_Y - 0.35; });
    /* Add exterior stone ramp leading up from South Gate roadhead (-2,600 m) through lk-gate or inner ramp?
       Wait: lk-gate's passage is 6.0 m tall from its base! If lk-gate sits at PLAT_Y (-2,595 m) with a monumental 95 m
       battered basalt causeway ramp OUTSIDE the South Gate rising from -2,600 m sabkha (z = gateZ + 105) up to -2,595 m
       at lk-gate (z = gateZ + 8), then:
       1) lk-gate sits flush with the +5 m Gate Quarter platform AND its 8 m wall block reaches +13 m, matching the entire
          city wall walk height (+13 m over sabkha) with ZERO vertical step at the gate pylons!!
       2) Every single building inside the Gate Quarter sits on dead-level -2,595 m platform!
       3) Drover sledges climb the grand external basalt gate ramp from the roadhead wayhalt up into the South Gate! */
    var fullTop = offsetPoly(wallPoly, 8.8);
    mesh = buildTerraceMesh(fullTop, function () { return PLAT_Y; }, 2.6, function () { return SABKHA_Y - 0.35; });
    /* Append the monumental South Gate exterior causeway ramp (width 26 m top, 34 m base, z from gateZ + 7 to gateZ + 112) */
    var gx = gateXz[0], gz0 = gateXz[1] + 6.5, gz1 = gateXz[1] + 112, b = mesh.pos.length / 3;
    mesh.pos.push(
      gx - 13, PLAT_Y, gz0, gx + 13, PLAT_Y, gz0,
      gx + 14, SABKHA_Y, gz1, gx - 14, SABKHA_Y, gz1,
      gx - 17, SABKHA_Y - 0.35, gz0, gx + 17, SABKHA_Y - 0.35, gz0,
      gx + 17, SABKHA_Y - 0.35, gz1 + 3, gx - 17, SABKHA_Y - 0.35, gz1 + 3
    );
    mesh.idx.push(
      b + 0, b + 2, b + 1, b + 0, b + 3, b + 2,
      b + 0, b + 4, b + 7, b + 0, b + 7, b + 3,
      b + 1, b + 2, b + 6, b + 1, b + 6, b + 5,
      b + 3, b + 7, b + 6, b + 3, b + 6, b + 2
    );
    /* Append exterior Tender stair/ramp outside lk-slot (from PLAT_Y at slotT + 6 down to SABKHA_Y + 0.25 at slotT + 38) */
    var s0 = slotT + 5.5, s1 = slotT + 38, b2 = mesh.pos.length / 3;
    var pA = function (t, w) { return [leyDir[0] * t + leyPerp[0] * w, leyDir[1] * t + leyPerp[1] * w]; };
    var r0L = pA(s0, 4.5), r0R = pA(s0, -4.5), r1L = pA(s1, 4.5), r1R = pA(s1, -4.5);
    var b0L = pA(s0, 6.8), b0R = pA(s0, -6.8), b1L = pA(s1 + 2, 6.8), b1R = pA(s1 + 2, -6.8);
    mesh.pos.push(
      r0L[0], PLAT_Y, r0L[1], r0R[0], PLAT_Y, r0R[1],
      r1R[0], SABKHA_Y, r1R[1], r1L[0], SABKHA_Y, r1L[1],
      b0L[0], SABKHA_Y - 0.35, b0L[1], b0R[0], SABKHA_Y - 0.35, b0R[1],
      b1R[0], SABKHA_Y - 0.35, b1R[1], b1L[0], SABKHA_Y - 0.35, b1L[1]
    );
    mesh.idx.push(
      b2 + 0, b2 + 2, b2 + 1, b2 + 0, b2 + 3, b2 + 2,
      b2 + 0, b2 + 4, b2 + 7, b2 + 0, b2 + 7, b2 + 3,
      b2 + 1, b2 + 2, b2 + 6, b2 + 1, b2 + 6, b2 + 5
    );
    return mesh;
  })();

  /* Mound of Intention (+12 m = -2,588 m, +7 m above the +5 m platform), with Ley Way ramp */
  var moundLeyEdgeT = (function () {
    var tEdge = 96, i, a, b, ex, ez, den, tt, ss;
    for (i = 0; i < moundPoly.length; i++) {
      a = moundPoly[i]; b = moundPoly[(i + 1) % moundPoly.length];
      ex = b[0] - a[0]; ez = b[1] - a[1];
      den = leyDir[0] * ez - leyDir[1] * ex;
      if (Math.abs(den) < 1e-9) continue;
      tt = (a[0] * ez - a[1] * ex) / den;
      ss = (a[0] * leyDir[1] - a[1] * leyDir[0]) / den;
      if (tt > 0 && ss >= 0 && ss <= 1) { tEdge = tt; break; }
    }
    return tEdge;
  })();
  var moundTerrace = (function () {
    var mesh = buildTerraceMesh(moundPoly, function () { return MOUND_Y; }, 1.15, function () { return PLAT_Y - 0.2; });
    var pL = function (t, w) { return [leyDir[0] * t + leyPerp[0] * w, leyDir[1] * t + leyPerp[1] * w]; };
    var tEdge = moundLeyEdgeT;
    var m0L = pL(tEdge - 1, 5.2), m0R = pL(tEdge - 1, -5.2);
    var m1L = pL(tEdge + 26, 5.2), m1R = pL(tEdge + 26, -5.2);
    var mb0L = pL(tEdge - 1, 7.2), mb0R = pL(tEdge - 1, -7.2);
    var mb1L = pL(tEdge + 27, 7.2), mb1R = pL(tEdge + 27, -7.2);
    var k = mesh.pos.length / 3;
    mesh.pos.push(
      m0L[0], MOUND_Y, m0L[1], m0R[0], MOUND_Y, m0R[1],
      m1R[0], PLAT_Y, m1R[1], m1L[0], PLAT_Y, m1L[1],
      mb0L[0], PLAT_Y - 0.2, mb0L[1], mb0R[0], PLAT_Y - 0.2, mb0R[1],
      mb1R[0], PLAT_Y - 0.2, mb1R[1], mb1L[0], PLAT_Y - 0.2, mb1L[1]
    );
    mesh.idx.push(
      k + 0, k + 2, k + 1, k + 0, k + 3, k + 2,
      k + 0, k + 4, k + 7, k + 0, k + 7, k + 3,
      k + 1, k + 2, k + 6, k + 1, k + 6, k + 5
    );
    return mesh;
  })();

  /* 700 m Cyclopean Basalt Ley Mole (from shoreT - 35 across the sea to a 39 m-wide seaward T-head sanctuary at mole1 + 5) */
  var moleTerrace = (function () {
    var pM = function (t, w) { return [leyDir[0] * t + leyPerp[0] * w, leyDir[1] * t + leyPerp[1] * w]; };
    var t0 = shoreT - 35, tNeck = mole1 - 40, tHead = mole1 - 34, t1 = mole1 + 5;
    var topP = [
      pM(t0, -4.6), pM(tNeck, -4.6), pM(tHead, -19.5), pM(t1, -19.5),
      pM(t1, 19.5), pM(tHead, 19.5), pM(tNeck, 4.6), pM(t0, 4.6)
    ];
    return buildTerraceMesh(topP, function (x, z, idx) {
      return idx === 0 || idx === 7 ? SABKHA_Y + 0.35 : MOLE_Y;
    }, 3.2, function () { return SEA_Y - 2.4; });
  })();

  KDRAWN.clear();
  var drawnNear = KDRAWN.add(KDRAWN.grid({ x0: N.x0, z0: N.z0, dx: N.step, dz: N.step, nx: N.nx - 1, nz: N.nz - 1, h: nearH }));
  var drawnFar = KDRAWN.add(KDRAWN.grid({ x0: F.x0, z0: F.z0, dx: F.step, dz: F.step, nx: F.nx - 1, nz: F.nz - 1, h: farH }));
  var drawnCity = KDRAWN.add(KDRAWN.mesh(cityTerrace.pos, cityTerrace.idx, null, { cell: 48 }));
  var drawnMound = KDRAWN.add(KDRAWN.mesh(moundTerrace.pos, moundTerrace.idx, null, { cell: 24 }));
  var drawnMole = KDRAWN.add(KDRAWN.mesh(moleTerrace.pos, moleTerrace.idx, null, { cell: 32 }));

  function groundH(x, z) {
    var d = KDRAWN.h(x, z);
    return d !== null ? d : bil(F, farRaw, x, z);
  }
  function baseTerrainH(x, z) {
    var d = drawnNear.h(x, z);
    if (d !== null) return d;
    var df = drawnFar.h(x, z);
    return df !== null ? df : bil(F, farRaw, x, z);
  }
  terrainH = groundH;

  function slopeAt(x, z, e) {
    var s = bsD(e, 10);
    return Math.hypot(groundH(x + s, z) - groundH(x - s, z), groundH(x, z + s) - groundH(x, z - s)) / (2 * s);
  }

  /* ---------------------------------------------------------------- 3. Register Basilisk's street network on KCITY */
  function kitDims(key, v) {
    var D = DEFS[key];
    return D ? { key: key, v: bsD(v, 0), w: D.w, d: D.d, h: bsD(D.h, 8) } : null;
  }
  var allDistricts = BS_PLAN.districts.concat([BS_PLAN.gate_quarter]);
  var districtStreets = allDistricts.map(function (d) { return { id: d.id, pts: uvList(d.street), centre: uv2xz(d.centre), axis: uvList(d.court_axis) }; });
  /* Dressed-basalt paving slabs for the 8 district/gate central courts + the Court of the First Turn (+2.2 cm above PLAT_Y) */
  var courtPlazas = (function () {
    var polys = allDistricts.map(function (d) { return uvList(d.court); }).concat([firstTurnPoly]);
    var pos = [], idx = [], pi, m, base, k;
    for (pi = 0; pi < polys.length; pi++) {
      m = buildTerraceMesh(polys[pi], function () { return PLAT_Y + 0.022; }, 0.35, function () { return PLAT_Y - 0.06; });
      base = pos.length / 3;
      for (k = 0; k < m.pos.length; k++) pos.push(m.pos[k]);
      for (k = 0; k < m.idx.length; k++) idx.push(base + m.idx[k]);
    }
    return { pos: pos, idx: idx };
  })();
  var cityPlan = null, cityErr = null;
  try {
    var L = KCITY.lib, TUNE = {
      cell: 8, rasterHalf: 1840, maxSlope: 0.45, exact: true,
      width: { avenue: 14, main: 7, side: 6, alley: 3.5, highway: 9, lane: 5 },
      lot: { side: 1.4, setback: 1.5, rear: 2.5, inset: 0.8, step: 4 },
      classes: { middle: [['lk-makers', 0]], poor: [['lk-warren', 0]] }, fallback: { middle: 'poor', poor: null }
    };
    var steps = [
      {
        name: 'Basilisk platforms, Mound and district spirals',
        run: function () {
          var SL = L.SL, P = L.plan(), R = SL.R = new L.Raster(TUNE.rasterHalf, TUNE.cell), land = 0;
          R.occ.fill(L.OCC.OUT);
          land += KCITY.site.zoneRaster(R, moundPoly, { dry: SEA_Y + 1, maxSlope: TUNE.maxSlope, h: groundH });
          allDistricts.forEach(function (d) {
            d.bands.forEach(function (bd) {
              land += KCITY.site.zoneRaster(R, uvList(bd.poly), { dry: SEA_Y + 1, maxSlope: TUNE.maxSlope, h: groundH });
            });
          });
          P.zone = wallPoly;
          P.site = [{ id: 0, name: 'Basilisk', type: 'capital', role: 'capital', poly: wallPoly }];
          SL.minSpacing = 7;
          SL.note(0, 'Basilisk: 7 districts + gate quarter + Mound, ' + land + ' cells');
        }
      },
      {
        name: 'the Great Coil, Ley Way and eight spiral streets',
        run: function () {
          var SL = L.SL;
          var wc = SL.addWay('avenue', coilStreet, 1, { tag: 'great-coil' }); wc.kind = 'coil';
          var wl = SL.addWay('highway', [[0, 0], slotXz], 2, { tag: 'ley-way' }); wl.kind = 'ley';
          districtStreets.forEach(function (ds) {
            var wd = SL.addWay('main', ds.pts, 1, { tag: 'spiral-' + ds.id }); wd.kind = 'spiral';
          });
        }
      }
    ];
    cityPlan = KCITY.create({
      name: 'basilisk', tune: TUNE, seed: SEED, rand: 'krand',
      index: { order: 'insertion' }, ground: { h: groundH }, kit: { dims: kitDims }, steps: steps
    }).run();
  } catch (e) {
    cityErr = String(e && e.stack ? e.stack : e);
    reportErr('basilisk KCITY: ' + cityErr);
  }

  /* ---------------------------------------------------------------- 4. Southern paddy ring hamlet on KHAMLET.village */
  var paddyHamlet = null;
  if (typeof KHAMLET !== 'undefined' && KHAMLET.village) {
    paddyHamlet = KHAMLET.village({
      id: 'basilisk.paddy', world: SEED + 17, culture: 'lizardmen', focus: 'farming',
      site: { x: -320, z: 1480 }, link: { x: gateXz[0], z: gateXz[1] + 120 },
      resource: { x: -180, z: 1640, workers: 55 }, popMax: 175,
      dims: function (k) { return kitDims(k, 0); },
      ground: {
        ok: function (x, z) {
          if (x < N.x0 + 140 || x > N.x1 - 140 || z < gateXz[1] + 280 || z > N.z1 - 140) return false;
          if (groundH(x, z) < SEA_Y + 0.35) return false;
          return slopeAt(x, z, 12) <= 0.16;
        }
      }
    });
  }

  /* ---------------------------------------------------------------- 5. Place all manifest items, wall samples, hamlet & paddies */
  var space = KSPACE.create({ cell: 32 }), sites = [], plinths = [], overlapSkips = 0;
  function obbOf(x, z, ry, w, d, pad) {
    var p = bsD(pad, 0), c = Math.cos(ry), s = Math.sin(ry);
    return { x: x, z: z, ux: c, uz: -s, hw: w / 2 + p, hd: d / 2 + p };
  }
  function footStats(x, z, ry, w, d) {
    var c = Math.cos(ry), s = Math.sin(ry), lo = groundH(x, z), hi = lo;
    [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (q) {
      var a = q[0] * w / 2, b = q[1] * d / 2;
      var y = groundH(x + a * c + b * s, z - a * s + b * c);
      if (y < lo) lo = y;
      if (y > hi) hi = y;
    });
    return { lo: lo, hi: hi };
  }

  function addSite(key, x, z, ry, kind, o) {
    var D = DEFS[key];
    if (!D) return null;
    o = o || {};
    var R = obbOf(x, z, ry, D.w, D.d, 0);
    if (!o.allowOverlap && space.some(x, z, Math.hypot(D.w, D.d) / 2 + 36, function (it) {
      return KHAMLET.overlap(R, it.R, bsD(o.pad, 0.04));
    })) {
      overlapSkips++;
      return null;
    }
    if (D.cls !== 'life') space.insert({ R: R, key: key, kind: kind }, x, z, Math.hypot(D.w, D.d) / 2);
    var fs = footStats(x, z, ry, D.w, D.d), y;
    if (D.cls === 'vessel') {
      y = SEA_Y - 0.14;
    } else if (D.cls === 'life') {
      y = groundH(x, z);
    } else if (key === 'lz-weir') {
      y = SEA_Y - 0.22;
    } else {
      y = fs.hi + 0.03;
    }
    var vMod = key.indexOf('lk-') === 0 ? 5 : 3;
    var v = bsD(o.v, KRAND.hash(SEED, KTAGS.str32(key), Math.round(x * 3), Math.round(z * 3)) % vMod);
    var rec = {
      key: key, x: +x.toFixed(2), z: +z.toFixed(2), y: +y.toFixed(3), ry: +ry.toFixed(5),
      w: D.w, d: D.d, h: D.h, kind: kind, where: o.where || kind, caste: o.caste || null,
      band: o.band == null ? null : o.band, flaw: !!o.flaw,
      footLo: +fs.lo.toFixed(3), footHi: +fs.hi.toFixed(3),
      o: Object.assign({ y: +y.toFixed(3), v: v }, o.name ? { name: o.name } : {})
    };
    sites.push(rec);
    if (D.cls !== 'life' && D.cls !== 'vessel' && key !== 'lz-weir') {
      plinths.push({
        key: key, x: rec.x, z: rec.z, ry: rec.ry, w: D.w, d: D.d,
        y0: +(fs.lo - 0.42).toFixed(3), y1: +(y + 0.005).toFixed(3),
        stone: key.indexOf('lk-') === 0 || key === 'lz-seer' || key === 'gl-tank' || key === 'gl-well' || D.caste === 'all'
      });
    }
    return rec;
  }

  /* 5a. Place all 2,325 non-owed manifest records from BS_PLAN */
  var manifestPlaced = 0;
  BS_PLAN.placed.forEach(function (r) {
    if (r.owed) return;
    var xz = uv2xz(r.at);
    var got = addSite(r.key, xz[0], xz[1], r.ry, r.where, {
      where: r.where, caste: r.caste, band: r.band == null ? null : r.band, flaw: !!r.flaw, name: r.role, pad: 0.03
    });
    if (got) manifestPlaced++;
  });

  /* 5b. Place representative lk-wall inner-stair bastions along the 7 wall runs (where clear of watchtowers/slot/buildings)
     so lk-wall is also exercised as a top-level kit piece alongside the continuous 8.2 km cyclopean wall curtain */
  var wallRuns = BS_PLAN.wall.runs.map(function (r) {
    return { i: r.i, a: uv2xz(r.a), b: uv2xz(r.b), len: r.len };
  });
  wallRuns.forEach(function (wr) {
    if (wr.len < 160) return;
    var dx = wr.b[0] - wr.a[0], dz = wr.b[1] - wr.a[1], L = Math.hypot(dx, dz) || 1;
    /* Outward normal of ccw wall in (x, z = -v): in (u, v) ccw has outward normal (dv, -du) -> in (x, z) (-dz, -dx)?
       Check run 0: south tongue foot going east (dx > 0, dz = 0): outward is south (+z = +1)!
       Formula (dz / L ? 0 : ...): let's test (dx=1, dz=0) -> we want (0, +1), which is (-dz, dx) = (0, +1)!
       Test run 3->4: east wall going north (dx ~ -0.26, dz ~ -0.97): (-dz, dx) = (+0.97, -0.26) = east-north-east (OUTWARD)! */
    var outX = -dz / L, outZ = dx / L;
    var ryOut = Math.atan2(outX, outZ);
    [0.28, 0.52, 0.74].some(function (f) {
      var px = wr.a[0] + dx * f, pz = wr.a[1] + dz * f;
      return !!addSite('lk-wall', px, pz, ryOut, 'wall', { where: 'wall', pad: 0.8 });
    });
  });

  /* 5c. Build country, haul & hamlet link roads FIRST so wells, paddy bunds and beasts never block a path */
  var countryWays = BS_PLAN.country.roads.map(function (rd, i) {
    return { id: 'trunk-' + i, w: 9.0, pts: uvList(rd.pts).filter(function (p) { return p[0] > N.x0 - 400 && p[0] < N.x1 + 400 && p[1] > N.z0 - 400 && p[1] < N.z1 + 400; }) };
  });
  countryWays.push({
    id: 'dock-haul', w: 8.0,
    pts: [
      [dock.x - 32, dock.z],
      [charcoal.x - 24, charcoal.z],
      [wallPoly[3][0] + 45, wallPoly[3][1] + 55],
      [reservoirs[0].cx - 120, reservoirs[0].cz + 60],
      [gateXz[0] + 35, gateXz[1] + 150],
      [gateXz[0], gateXz[1] + 112]
    ]
  });
  countryWays.push({
    id: 'salt-haul', w: 6.5,
    pts: [
      [wallPoly[5][0] - 70, wallPoly[5][1] - 35],
      [wallPoly[5][0] - 55, wallPoly[6][1] + 45],
      [gateXz[0] - 65, gateXz[1] + 135],
      [gateXz[0], gateXz[1] + 112]
    ]
  });
  countryWays.push({
    id: 'ley-strand', w: 8.5,
    pts: [[leyDir[0] * (slotT + 6), leyDir[1] * (slotT + 6)], [leyDir[0] * shoreT, leyDir[1] * shoreT]]
  });
  if (paddyHamlet && paddyHamlet.site) {
    countryWays.push({
      id: 'hamlet-link', w: 6.0,
      pts: [[gateXz[0], gateXz[1] + 112], [paddyHamlet.site.x, paddyHamlet.site.z]]
    });
  }
  function clearOfCountryWays(px, pz, rad) {
    var cwI, cw;
    for (cwI = 0; cwI < countryWays.length; cwI++) {
      cw = countryWays[cwI];
      if (cw.pts.length > 1 && lineDist(px, pz, cw.pts) < cw.w * 0.5 + rad) return false;
    }
    if (paddyHamlet && paddyHamlet.ways) {
      for (cwI = 0; cwI < paddyHamlet.ways.length; cwI++) {
        cw = paddyHamlet.ways[cwI];
        if (cw.pts && cw.pts.length > 1 && lineDist(px, pz, cw.pts) < bsD(cw.w, 4.0) * 0.5 + rad) return false;
      }
    }
    return true;
  }

  /* 5d. Place southern paddy hamlet records (keeping hamlet well clear of hamlet paths & link road) */
  var hamletPlaced = 0;
  if (paddyHamlet && !paddyHamlet.error && paddyHamlet.records) {
    paddyHamlet.records.forEach(function (hr) {
      if (!hr.pending && addSite(hr.key, hr.x, hr.z, hr.ry, 'hamlet', { where: 'hamlet', pad: 0.25 })) hamletPlaced++;
    });
    [[18, -14], [-18, -14], [22, 16], [-22, 16], [0, -24]].some(function (off) {
      var wx = paddyHamlet.site.x + off[0], wz = paddyHamlet.site.z + off[1];
      if (!clearOfCountryWays(wx, wz, 4.5)) return false;
      return !!addSite('gl-well', wx, wz, 0, 'hamlet', { where: 'hamlet', pad: 0.25 });
    });
  }

  /* 5e. Bunded bamboo-rice, rice, taro & shade-manioc paddies wrapping the southern & western alluvial apron (never crossing roads) */
  var fields = [];
  (function buildFields() {
    var crops = ['bamboo-rice', 'taro', 'rice', 'shade-manioc'];
    var zones = [
      { x0: -2150, x1: 950, z0: 960, z1: 2450 },
      { x0: -2350, x1: -1060, z0: -480, z1: 960 }
    ];
    var pw = 116, pd = 82, zi, zbox, x, z, h;
    for (zi = 0; zi < zones.length; zi++) {
      zbox = zones[zi];
      for (z = zbox.z0; z + pd < zbox.z1; z += pd + 10) {
        for (x = zbox.x0; x + pw < zbox.x1; x += pw + 10) {
          var cx = x + pw / 2, cz = z + pd / 2;
          if (sdPoly(wallPoly, cx, cz) > -110) continue;
          if (groundH(cx, cz) < SEA_Y + 0.35 || slopeAt(cx, cz, 16) > 0.12) continue;
          var nearRes = reservoirs.some(function (r) { return sdPoly(r.outer, cx, cz) > -68; });
          if (nearRes || lineDist(cx, cz, leatPts) < 50) continue;
          if (!clearOfCountryWays(cx, cz, Math.hypot(pw * 0.45, pd * 0.45) + 6.0)) continue;
          if (space.some(cx, cz, Math.hypot(pw, pd) / 2 + 16, function () { return true; })) continue;
          h = KRAND.hash(SEED, 307, Math.round(cx), Math.round(cz)) % 100;
          if (h < 14) continue;
          fields.push({
            id: 'bs.field.' + fields.length, at: [cx, cz],
            box: [cx - pw * 0.45, cz - pd * 0.45, cx + pw * 0.45, cz + pd * 0.45],
            kind: h < 76 ? 'crop' : h < 93 ? 'tilled' : 'fallow',
            crop: crops[h % crops.length]
          });
        }
      }
    }
  })();

  /* 5f. Burden beasts at the South Gate roadhead, Lothal dock haul road & charcoal yard, and frilled lizards by the paddies */
  var gateRoadWayhalt = sites.find(function (s) { return s.key === 'lz-wayhalt'; });
  if (gateRoadWayhalt) {
    if (clearOfCountryWays(gateRoadWayhalt.x - 16, gateRoadWayhalt.z + 8, 4.5)) {
      addSite('burden', gateRoadWayhalt.x - 16, gateRoadWayhalt.z + 8, 0.4, 'herd', { where: 'gate_road' });
    }
    if (clearOfCountryWays(gateRoadWayhalt.x - 21, gateRoadWayhalt.z + 11, 4.5)) {
      addSite('burden', gateRoadWayhalt.x - 21, gateRoadWayhalt.z + 11, 0.7, 'herd', { where: 'gate_road' });
    }
  }
  if (clearOfCountryWays(charcoal.x + 26, charcoal.z + 12, 4.5)) {
    addSite('burden', charcoal.x + 26, charcoal.z + 12, 1.8, 'herd', { where: 'works' });
  }
  if (clearOfCountryWays(dock.x - 46, dock.z + 98, 4.5)) {
    addSite('burden', dock.x - 46, dock.z + 98, 3.0, 'herd', { where: 'works' });
  }
  for (var fi = 0; fi < 5 && fi < fields.length; fi++) {
    var ff = fields[(fi * 5) % fields.length];
    if (clearOfCountryWays(ff.box[0] - 5, ff.box[1] - 5, 4.0)) {
      addSite(fi % 2 === 0 ? 'frilled' : 'burden', ff.box[0] - 5, ff.box[1] - 5, fi * 1.1, 'herd', { where: 'country' });
    }
  }

  /* ---------------------------------------------------------------- 6. Census, inward-door check, overlap check & zoneAt */
  var HOLDS = {
    'lk-warren': { total: 36, c: { 1: 36 } },
    'lk-insula': { total: 44, c: { 2: 44 } },
    'lk-terrace': { total: 22, c: { 2: 22 } },
    'lk-kilnhouse': { total: 16, c: { 2: 16 } },
    'lk-makers': { total: 10, c: { 2: 10 } },
    'lz-makers': { total: 10, c: { 2: 10 } },
    'lk-bronzehall': { total: 60, c: { 2: 60 } },
    'lk-dockstore': { total: 30, c: { 2: 12, 3: 18 } },
    'lk-boil': { total: 12, c: { 2: 12 } },
    'lk-guildhall': { total: 14, c: { 2: 14 } },
    'lz-hall-bronze': { total: 12, c: { 2: 12 } },
    'lz-hall-reed': { total: 12, c: { 2: 12 } },
    'lz-hall-bone': { total: 12, c: { 2: 12 } },
    'lk-caravanserai': { total: 66, c: { 3: 66 } },
    'lk-longhouse': { total: 33, c: { 3: 33 } },
    'lk-rowhouse': { total: 24, c: { 3: 24 } },
    'lz-longhouse': { total: 33, c: { 3: 33 } },
    'lk-lodge': { total: 38, c: { 4: 23, 6: 15 } },
    'lk-bastion': { total: 34, c: { 4: 20, 6: 14 } },
    'lz-lodge': { total: 30, c: { 4: 18, 6: 12 } },
    'lz-barracks': { total: 30, c: { 4: 18, 6: 12 } },
    'lk-tower': { total: 7, c: { 5: 7 } },
    'lk-archive': { total: 14, c: { 5: 14 } },
    'lz-tower': { total: 7, c: { 5: 7 } },
    'lk-college': { total: 39, c: { 5: 39 } },
    'lz-warren': { total: 28, c: { 1: 28 } }
  };
  var people = { city: 0, hamlet: 0, total: 0, byCaste: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }, byKey: {} };
  var byWhere = {}, inwardChecked = 0, inwardBad = 0, flawCount = 0;
  var distAxisById = {};
  districtStreets.forEach(function (ds) { distAxisById[ds.id] = ds.axis; });

  sites.forEach(function (r) {
    byWhere[r.where] = bsD(byWhere[r.where], 0) + 1;
    people.byKey[r.key] = bsD(people.byKey[r.key], 0) + 1;
    var hd = HOLDS[r.key];
    if (hd) {
      if (r.where === 'hamlet') people.hamlet += hd.total;
      else people.city += hd.total;
      people.total += hd.total;
      for (var ck in hd.c) people.byCaste[ck] += hd.c[ck];
    }
    if (distAxisById[r.where] && r.caste && r.band !== null) {
      var ax = distAxisById[r.where], a = ax[0], b = ax[1];
      var dx = b[0] - a[0], dz = b[1] - a[1], l2 = Math.max(1, dx * dx + dz * dz);
      var t = Math.max(0, Math.min(1, ((r.x - a[0]) * dx + (r.z - a[1]) * dz) / l2));
      var nx = a[0] + dx * t - r.x, nz = a[1] + dz * t - r.z;
      var fx = Math.sin(r.ry), fz = Math.cos(r.ry);
      var dot = fx * nx + fz * nz;
      if (r.flaw) {
        flawCount++;
      } else {
        inwardChecked++;
        if (dot <= 0) inwardBad++;
      }
    }
  });

  var overlapPairs = 0;
  (function checkOverlaps() {
    var B = sites.filter(function (q) { return DEFS[q.key] && DEFS[q.key].cls !== 'life'; }), i, j, a, b;
    for (i = 0; i < B.length; i++) {
      a = B[i];
      for (j = i + 1; j < B.length; j++) {
        b = B[j];
        if (Math.hypot(a.x - b.x, a.z - b.z) > Math.hypot(a.w, a.d) / 2 + Math.hypot(b.w, b.d) / 2 + 1) continue;
        if (KHAMLET.overlap(obbOf(a.x, a.z, a.ry, a.w, a.d, 0), obbOf(b.x, b.z, b.ry, b.w, b.d, 0), -0.06)) overlapPairs++;
      }
    }
  })();

  /* KGROUND zone weights at (x, z) on nearH: [mudStrand, tilledField, roadYard, wetDarken] */
  function zoneAt(x, z) {
    var y = baseTerrainH(x, z), above = y - SEA_Y;
    var wWater = (x >= N.x0 && x <= N.x1 && z >= N.z0 && z <= N.z1) ? bil(N, waterNear, x, z) / 255.0 : 0;
    /* Anaerobic brown mud along the coastal marsh fringe (wWater > 0.08) and Tlahn Gill wadi; pale salt crust inland */
    var wMud = sm(0.06, 0.42, wWater) * (1 - sm(-1.2, -0.1, above < 0 ? above : -1.2));
    if (above < 0.35 && above > -0.6) wMud = Math.max(wMud, 0.82);
    var wTill = 0, wYard = 0, i, bx, d;
    for (i = 0; i < fields.length; i++) {
      bx = fields[i].box;
      if (x >= bx[0] - 10 && x <= bx[2] + 10 && z >= bx[1] - 10 && z <= bx[3] + 10) {
        d = Math.max(bx[0] - x, x - bx[2], bx[1] - z, z - bx[3]);
        wTill = Math.max(wTill, 1 - sm(-2, 10, d));
      }
    }
    for (i = 0; i < countryWays.length; i++) {
      if (countryWays[i].pts.length > 1) {
        d = lineDist(x, z, countryWays[i].pts);
        if (d < countryWays[i].w + 6) wYard = Math.max(wYard, 1 - sm(countryWays[i].w * 0.5, countryWays[i].w + 6, d));
      }
    }
    if (tlahnRaw.length > 1) {
      d = lineDist(x, z, tlahnRaw);
      if (d < 42) wMud = Math.max(wMud, 0.88 * (1 - sm(14, 42, d)));
    }
    var wWet = sm(0.18, 0.55, wWater);
    return [wMud, wTill, wYard, wWet];
  }

  return {
    seed: SEED,
    sabkhaY: SABKHA_Y,
    seaY: SEA_Y,
    platY: PLAT_Y,
    moundY: MOUND_Y,
    moleY: MOLE_Y,
    near: N,
    far: F,
    nearH: nearH,
    farH: farH,
    farRaw: farRaw,
    waterFar: waterFar,
    pin: { px: BS_GROUND.pin, model: +pinModelY.toFixed(2), mound: +groundH(0, 0).toFixed(2), sabkha: +baseTerrainH(-1900, 0).toFixed(2) },
    groundH: groundH,
    baseTerrainH: baseTerrainH,
    zoneAt: zoneAt,
    wallPoly: wallPoly,
    wallRuns: wallRuns,
    gateXz: gateXz,
    slotXz: slotXz,
    slotT: slotT,
    shoreT: shoreT,
    moleRange: [mole0, mole1],
    leyDir: leyDir,
    leyPerp: leyPerp,
    moundLeyEdgeT: +moundLeyEdgeT.toFixed(2),
    moundPoly: moundPoly,
    coilStreet: coilStreet,
    firstTurnPoly: firstTurnPoly,
    districtStreets: districtStreets,
    courtPlazas: courtPlazas,
    cityTerrace: cityTerrace,
    moundTerrace: moundTerrace,
    moleTerrace: moleTerrace,
    dock: dock,
    charcoal: charcoal,
    reservoirs: reservoirs,
    checkDamXz: checkDamXz,
    leatPts: leatPts,
    tlahnPts: tlahnRaw,
    fields: fields,
    countryWays: countryWays,
    paddyHamlet: paddyHamlet ? {
      id: paddyHamlet.id, error: paddyHamlet.error || null,
      records: (paddyHamlet.records || []).filter(function (r) { return !r.pending; }).length,
      placed: hamletPlaced, census: paddyHamlet.census || null
    } : null,
    cityErr: cityErr,
    manifestPlaced: manifestPlaced,
    sites: sites,
    plinths: plinths,
    people: people,
    byWhere: byWhere,
    inwardChecked: inwardChecked,
    inwardBad: inwardBad,
    flawCount: flawCount,
    overlapPairs: overlapPairs,
    overlapSkips: overlapSkips
  };
})();
