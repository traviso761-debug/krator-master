/* ============================== 4. VOTH'S OWN BUILDERS ============================== */
/* [G data] Every structure here is drawn by Voth's own builder (lifted by name into VOTH, build.py/vothlift.py),
   on the edited ground, with Voth's seeds; this file says where, following Voth's own placement rules. The
   primitives each call pushes are kept per group (VC.prims[name] = {step, list}) for the host to draw. */
VC.capture = function (name, step, fn) {
  VOTH.PRIMS.length = 0;
  var r = fn();
  VC.prims[name] = { step: step, list: VOTH.PRIMS.splice(0) };
  return r;
};

/* ---------------------------------------------------------------- step 1-2: islets, landmarks, districts */
VC.buildDistricts = function () {
  var B = VOTH, log = [];
  /* the islets as Voth builds them (60-land.js 20. ISLETS): the shrine islets (A, B), the lighthouse islet (LH), rocks */
  VC.capture('islets', 1, function () { B.buildIslets(); });
  /* the islets' shrine and lighthouse give way to the better models below (their pads stay) */
  VC.prims.islets.list = VC.prims.islets.list.filter(function (q) {
    return !B.ISLES.some(function (I) { return (I[4] === 'light' || I[4] === 'shrine') && Math.hypot(q[1] - I[0], q[3] - I[1]) < I[3] * 0.62 && q[2] > B.terrainHe(I[0], I[1]) + 1.0; });
  });
  VC.capture('islet-buildings', 1, function () {
    var toward = polyCentroid(PLAN.zone);
    B.ISLES.forEach(function (I) {
      if (I[4] !== 'light' && I[4] !== 'shrine') return;
      var y = B.terrainHe(I[0], I[1]), ry = VC.face(I[0], I[1], toward[0], toward[1]);
      if (I[4] === 'light') VC.lighthouseModel(I[0], y, I[1], ry, I[3]); else VC.shrineModel(I[0], y, I[1], ry, I[3]);
    });
  });
  /* landmarks at the owner's markers */
  VC.capture('landmarks', 1, function () {
    PLAN.voth.forEach(function (q) {
      if (q.role === 'shrine' && !q.islet) VC.shrineModel(q.x, B.terrainHe(q.x, q.z), q.z, q.ry, q.rad);
      else if (q.role === 'healing') B.houseOfHealing(q.x, B.terrainHe(q.x, q.z), q.z, q.ry, B.pick(B.TONES), {});
      else if (q.role === 'funeraryTemple') B.funeraryTemple(q.x, B.terrainHe(q.x, q.z), q.z, q.ry, B.MARBLEC[0], {});
      else if (q.role === 'lighthouse' && !q.islet) {      /* a lighthouse off any islet: on a plinth up out of the water */
        var y = Math.max(0, B.terrainHe(q.x, q.z));
        B.BOX(q.x, Math.min(-2, y - 2), q.z, 30, Math.max(4, y + 2) - Math.min(-2, y - 2) + 2, 30, 0, B.shade(0xb4a88e, -0.16));
        VC.lighthouseModel(q.x, Math.max(y, 2), q.z, VC.face(q.x, q.z, polyCentroid(PLAN.zone)[0], polyCentroid(PLAN.zone)[1]), 0);
      }
    });
  });
  /* the monastery: Voth's own call (61-monastery.js), at Voth's spot when the owner's monastery district holds it,
     else at the district's middle, sized to it; gate toward the Temple canton */
  var mon = VC.districts('monastery')[0];
  if (mon) log.push(VC.buildMonastery(mon));          /* 33-vc-country.js: walled round the owner's polygon */
  log.push(VC.cantonDecks());                          /* 33-vc-country.js: the rim cantons' decks laid out again */
  /* the ferry stops' piers are set out first and booked in Voth's PIERS, so the harbour's piers and fishing docks
     and the chinampas all keep clear of them (built with the lines, step 14) */
  VC.ferryPiers();
  /* the harbour next: its piers go into Voth's own PIERS list, which the chinampa pass keeps clear of */
  VC.districts('harbor').forEach(function (d) { log.push(VC.buildHarbor(d)); });
  VC.districts('riverport').forEach(function (d) { log.push(VC.buildRiverPort(d)); });
  /* chinampas: the whole of 55-chinampa.js, in Voth's own zones */
  VC.chin = VC.capture('chinampas', 2, function () { return B.runChinampas(); });
  /* the owner's 'chinampa exclusion' polygons: no bed, canal post, willow or hut there (a primitive goes with its
     centre), and the water there is open again for the ferries */
  var ex = VC.districts('nochin');
  if (ex.length) {
    var CL = VC.prims.chinampas.list, n0 = CL.length, inEx = function (x, z) { return ex.some(function (d) { return inPoly([x, z], d.poly); }); };
    VC.prims.chinampas.list = CL.filter(function (q) { return !inEx(q[1], q[3]); });
    var hit0 = VC.chin.chinHit; VC.chin.chinHit = function (x, z, pad) { return !inEx(x, z) && hit0(x, z, pad); };
    log.push((n0 - VC.prims.chinampas.list.length) + ' chinampa pieces cleared from ' + ex.map(function (d) { return d.name; }).join(', '));
  }
  log.push(VC.chin.count + ' chinampa beds, ' + VC.chin.huts + ' huts');
  VC.log2 = log.join('; ');
};

/* ---------------------------------------------------------------- the shrine and the small lighthouse
   (owner, 2026-10-09: "improve small lighthouse and shrine models to similar quality as other city models including
   sensible doors and windows"). Voth's own vocabulary and palette (TONES, DOMEC, the monastery's door and lancet
   window helpers), its proportions kept: the shrine's dome and four obelisks, the lighthouse's lamp room at 47.5 m. */
VC.shrineModel = function (x, y, z, ry, rad) {
  var B = VOTH, col = B.pick(B.TONES), dk = B.shade(col, -0.14), trim = B.shade(col, -0.22), L = function (lx, lz) { return B.loc(x, z, lx, lz, ry); };
  rad = rad || 37.8;
  /* a stepped platform: two tiers */
  B.BOX(x, y - 1.2, z, rad * 0.86, 2.4, rad * 0.86, ry, dk);
  B.BOX(x, y + 1.2, z, rad * 0.70, 1.0, rad * 0.70, ry, B.shade(col, -0.08));
  var yb = y + 2.2, w = rad * 0.34, d = rad * 0.30, h = 7.5, m = Math.min(w, d);
  /* the cella, its cornice, a drum and the dome with a finial */
  B.BOX(x, yb, z, w, h, d, ry, col);
  B.BOX(x, yb + h - 0.6, z, w * 1.06, 0.9, d * 1.06, ry, trim);
  B.CYL(x, yb + h + 0.3, z, m * 0.42, 2.4, ry, B.shade(col, 0.05));
  B.DOME(x, yb + h + 2.7, z, m * 0.46, m * 0.40, ry, B.pick(B.DOMEC), 'dome');
  B.CONE(x, yb + h + 2.7 + m * 0.40, z, 0.45, 2.6, ry, 0x6c5e4a, 'metal');
  /* its door on the front (local +x, toward the avenue), lancet windows on the other three walls */
  B.monasteryOpenings(x, z, yb, w, d, h, ry, { door: 0x4a3524, frame: B.shade(col, -0.3) });
  /* a portico before the door: four columns on bases, an entablature, a low pediment */
  var px = w * 0.5 + 3.4;
  [-1.5, -0.5, 0.5, 1.5].forEach(function (k) { var p = L(px, k * d * 0.26); B.BOX(p[0], yb, p[1], 1.7, 0.5, 1.7, ry, trim); B.CYL(p[0], yb + 0.5, p[1], 0.55, h - 1.1, 0, B.shade(col, 0.1)); });
  var pe = L(w * 0.5 + 2.0, 0);
  B.BOX(pe[0], yb + h - 0.6, pe[1], 4.4, 0.9, d * 0.95, ry, trim);
  B.FR3(pe[0], yb + h + 0.3, pe[1], 4.0, 1.8, d * 0.9, ry, B.shade(col, 0.04));
  /* steps down from the platform, and a brazier either side of them */
  [[0.35, 1.7], [0.43, 0.6]].forEach(function (st, i) { var sp = L(rad * st[0] + 0.65, 0); B.BOX(sp[0], y - 1.2, sp[1], 1.3, st[1] + 1.2, d * 0.7, ry, B.shade(col, -0.1 - i * 0.04)); });
  [-1, 1].forEach(function (s) { var bp = L(rad * 0.36, s * d * 0.5); B.CYL(bp[0], yb, bp[1], 0.5, 2.2, 0, 0x3a3630, 'metal'); B.CYL(bp[0], yb + 2.2, bp[1], 1.1, 0.5, 0, 0x3a3630, 'metal'); B.BLOB(bp[0], yb + 2.7, bp[1], 0.8, 1.2, 0, 0xe0782a, 'leaf'); });
  /* Voth's four obelisks on the lower tier's corners, capped */
  for (var o = 0; o < 4; o++) { var sa = Math.PI / 4 + o * Math.PI / 2, op = L(Math.cos(sa) * rad * 0.39, Math.sin(sa) * rad * 0.39), oh = B.rr(9, 12);
    B.BOX(op[0], y + 1.2, op[1], 3.6, 0.8, 3.6, ry, trim); B.FR3(op[0], y + 2.0, op[1], 2.8, oh, 2.8, ry + sa, col); B.CONE(op[0], y + 2.0 + oh, op[1], 0.9, 1.6, ry, trim); }
  return { x: x, z: z, y: y, ry: ry };
};
VC.lighthouseModel = function (x, y, z, ry, isleR) {
  var B = VOTH, col = 0xb4a88e, dk = B.shade(col, -0.12), trim = B.shade(col, -0.24), frame = B.shade(col, -0.34), L = function (lx, lz, a) { return B.loc(x, z, lx, lz, a == null ? ry : a); };
  /* an octagonal plinth with its door and steps */
  B.FR8(x, y + 1.8, z, 22, 4.0, 22, ry, dk); B.BOX(x, y + 5.6, z, 22.6, 0.6, 22.6, ry, trim);
  var yb = y + 5.8, ys = yb, stages = [[17.6, 10], [15.6, 10], [13.6, 9.5], [11.8, 8.5]];
  var dp = L(8.9, 0); B.BOX(dp[0], y + 1.8, dp[1], 0.4, 3.6, 2.4, ry, 0x4a3524, 'wood'); B.BOX(dp[0], y + 5.4, dp[1], 0.6, 0.5, 3.2, ry, frame);
  for (var i = 0; i < 3; i++) { var sp = L(11.6 + i * 1.2, 0); B.BOX(sp[0], y + 0.6 - i * 0.6, sp[1], 1.2, 1.2, 3.6, ry, B.shade(dk, -0.05 * i)); }
  /* the tower in four tapering stages, a string course at each, two lancet windows a stage on alternate faces */
  stages.forEach(function (st, k) {
    var w = st[0], hs = st[1];
    B.FR8(x, ys, z, w, hs, w, ry, B.shade(col, (k % 2 ? 0.03 : -0.02)));
    B.BOX(x, ys + hs - 0.4, z, w * 0.9 * 1.04, 0.7, w * 0.9 * 1.04, ry, trim);
    [k % 2 ? 0 : Math.PI / 2, k % 2 ? Math.PI : Math.PI * 1.5].forEach(function (a) { var p = L(w * 0.485, 0, ry + a); B.monasteryWindow(p[0], p[1], ys + hs * 0.35, ry + a, 1.2, 2.4, true, frame, 0x232320); });
    ys += hs;
  });
  /* the gallery: a ring deck on brackets, a railing of posts and rails */
  var gy = y + 43.8;
  B.CYL(x, gy, z, 7.6, 0.8, ry, trim);
  for (var b = 0; b < 8; b++) { var bp = L(5.8, 0, ry + b * Math.PI / 4); B.BOX(bp[0], gy - 1.6, bp[1], 2.2, 1.6, 0.6, ry + b * Math.PI / 4, dk); }
  for (var r = 0; r < 12; r++) { var a2 = r * Math.PI / 6, rp = L(7.2, 0, ry + a2), rq = L(7.2, 0, ry + a2 + Math.PI / 6), mid = [(rp[0] + rq[0]) / 2, (rp[1] + rq[1]) / 2];
    B.CYL(rp[0], gy + 0.8, rp[1], 0.16, 1.3, 0, 0x3a3630, 'metal'); B.BOX(mid[0], gy + 2.0, mid[1], 0.18, 0.18, 3.8, Math.atan2(rq[0] - rp[0], rq[1] - rp[1]), 0x3a3630, 'metal'); }
  /* the lamp room: glazing between eight bars, the lamp's glow is the beacon's (55-vc-host.js) */
  B.CYL(x, gy + 0.8, z, 4.6, 6.2, ry, 0x2c2c28);
  for (var g = 0; g < 8; g++) { var mp = L(4.65, 0, ry + g * Math.PI / 4); B.BOX(mp[0], gy + 0.8, mp[1], 0.4, 6.2, 0.5, ry + g * Math.PI / 4, frame, 'metal'); }
  B.CYL(x, gy + 6.9, z, 5.4, 0.6, ry, trim);
  B.DOME(x, gy + 7.5, z, 5.0, 4.4, 0, 0xd8caa0, 'dome');
  B.CONE(x, gy + 11.9, z, 1.4, 4.4, 0, 0x6c5e4a, 'metal');
  /* the keeper's cottage behind it, where the islet has the room */
  if (!isleR || isleR * 0.43 > 21) {
    var cp = L(-17, 0), cw = 8, cd = 10, ch = 5;
    B.BOX(cp[0], y + 1.8, cp[1], cw, ch, cd, ry, B.shade(col, 0.06));
    B.FR8(cp[0], y + 1.8 + ch, cp[1], cw * 1.08, 3.2, cd * 1.08, ry, B.pick(B.ROOFS), 'roof');
    B.monasteryOpenings(cp[0], cp[1], y + 1.8, cw, cd, ch, ry + Math.PI, { door: 0x4a3524, frame: frame });
    B.BOX(L(-17, cd * 0.32)[0], y + 1.8 + ch, L(-17, cd * 0.32)[1], 1.2, 3.4, 1.2, ry, dk);
  }
  return { x: x, z: z, lampY: y + 47.5 };
};

/* the coast inside a district: Voth's traced shoreline every 26 m, moved onto the edited ground's waterline along
   the shore normal. Returns [{p, inl}] in shore order: p on the waterline, inl the unit vector inland. */
VC.coastIn = function (poly) {
  var B = VOTH, out = [];
  for (var s = 0; s < B.SLEN; s += 26) {
    var a = B.shoreIn(s, 0); if (!inPoly(a, poly) && polyEdgeDist(a, poly) > 30) continue;
    var i1 = B.shoreIn(s, 10), o1 = B.shoreIn(s, -10), inl = V.norm(V.sub(i1, o1)), hit = null;
    for (var d = 90; d >= -160; d -= 3) { var q = V.add(a, V.mul(inl, d)); if (baseH(q[0], q[1]) < 0.4) { hit = V.add(a, V.mul(inl, d + 3)); break; } }
    if (hit && inPoly(hit, poly)) out.push({ s: s, p: hit, inl: inl });
  }
  return out;
};
VC.inCanton = function (p, pad) { return VOTH.CANTONS.some(function (c) { return Math.abs(p[0] - c.x) < c.r * 1.08 + (pad || 0) && Math.abs(p[1] - c.z) < c.r * 1.08 + (pad || 0); }); };
VC.pierHit = function (p, w) { return VOTH.PIERS.some(function (q) { return segDist(p, [q.x0, q.z0], [q.x1, q.z1]) < (q.w + (w || 10)) / 2 + 14; }); };
VC.wet = function (p) { return baseH(p[0], p[1]) < -1.5 && !VC.inCanton(p, 12) && !(VC.chin && VC.chin.chinHit(p[0], p[1], 6)) && !(VC.pierHit && VC.pierHit(p)); };

/* harbour (Voth's 17. THE WATERFRONT and 30c harbours, along this district's coast): a revetted quay with bollards,
   long piers every ~66 m (Voth: 8 along its 530 m harbour) as far out as open water allows, a shed between each
   pair of piers, cargo on the quay. The warehouses and the little industry come from the lot pass. */
VC.buildHarbor = function (d) {
  var B = VOTH, C = VC.coastIn(d.poly), R = SL.R, piers = 0, fish = 0;
  if (C.length < 2) return 'harbor: no coast found';
  B.reseed(60613);
  VC.capture('harbor:' + d.name, 2, function () {
    var col = 0x8c8579;
    for (var i = 1; i < C.length; i++) {
      var a = C[i - 1].p, b = C[i].p, L = V.dist(a, b); if (L > 60) continue;
      var m = V.lerp(a, b, 0.5), ry = Math.atan2(b[0] - a[0], b[1] - a[1]), q = V.sub(m, V.mul(C[i].inl, 4));
      B.FR8(q[0], -9, q[1], 23, 9 + 3.2, L * 1.05, ry, B.shade(col, -0.12));
      B.BOX(q[0], 3.2, q[1], 23 * 0.96, 0.8, L * 1.03, ry, B.shade(col, -0.26));
      if (B.chance(0.34)) { var bo = V.sub(m, V.mul(C[i].inl, 13)); B.CYL(bo[0], 4, bo[1], 0.5, 1.1, 0, 0x4a4038, 'metal'); }
      R.eachNearSeg(a, b, 14, function (k) { if (R.occ[k] === OCC.FREE) { R.occ[k] = OCC.HARD; R.own[k] = -1; } });
    }
    /* piers, spaced for ships (owner, 2026-10-09: "add more long piers to the harbor district spaced appropriately
       for the ships"): a ship (TUNE.harbour.ship: Voth's SHIPS run 50-68 m by 12-16 m) moors either side of every pier,
       so neighbouring piers stand a pier's width, two beams and three clearances apart, and a pier is at least a ship's
       length and a bit long. The spacing is spent only on a pier that is built: one that cannot be, the next spot tries */
    var Sh = TUNE.harbour.ship, acc = Sh.spacing / 2;
    for (var j = 1; j < C.length; j++) {
      acc += V.dist(C[j - 1].p, C[j].p);
      var root = C[j].p, out = V.mul(C[j].inl, -1), len = B.rr(120, 215), w = B.rr(11, 17), Lp = 0, open = 0;
      if (acc < w + 2 * Sh.beam + 3 * Sh.clear) continue;
      /* Voth's piers run out from the shore whatever the depth; this one stops at land, a canton or another pier, and
         leaves a ship room to manoeuvre (owner, 2026-10-09: "having long piers here makes no sense - no room to
         maneuver"): the open water ahead is measured to whatever is across it, and the pier takes at most a share of
         it, keeping a turning basin clear beyond its tip; where the channel is too narrow for that there is no pier */
      for (var t2 = 10; t2 <= TUNE.harbour.look; t2 += 5) { var op = V.add(root, V.mul(out, t2)); if (baseH(op[0], op[1]) > -0.3 || VC.cantonBlocked(op[0], op[1])) break; open = t2; }
      len = Math.min(len, open * TUNE.harbour.share, open - TUNE.harbour.basin);
      for (var t = 10; t <= len; t += 5) { var tp = V.add(root, V.mul(out, t)); if (baseH(tp[0], tp[1]) > -0.3 || VC.inCanton(tp, 12) || VC.pierHit(tp, w)) break; Lp = t; }
      if (Lp < Sh.len + 15) continue;
      acc = 0;
      var tipP = V.add(root, V.mul(out, Lp));
      B.PIERS.push({ s: C[j].s, x0: root[0], z0: root[1], x1: tipP[0], z1: tipP[1], w: w, ship: true });
      var ry2 = Math.atan2(out[0], out[1]), n = Math.round(Lp / 16);
      for (var k2 = 0; k2 < n; k2++) {
        var c = V.add(root, V.mul(out, (k2 + 0.5) * Lp / n));
        B.BOX(c[0], 3, c[1], w, 1.2, Lp / n * 1.04, ry2, 0x7a6448, 'wood');
        [-1, 1].forEach(function (sd) { var pp = V.add(c, V.mul([out[1], -out[0]], sd * (w / 2 - 0.8))); B.CYL(pp[0], Math.min(-1, baseH(pp[0], pp[1])), pp[1], 0.7, 4 - Math.min(-1, baseH(pp[0], pp[1])), 0, 0x5a4a36, 'wood'); });
      }
      if (B.chance(0.6)) { var cr = V.add(root, V.mul(out, Lp * 0.8)); B.BOX(cr[0], 4.2, cr[1], 3, 14, 3, ry2, 0x5a4a36, 'wood'); B.BOX(cr[0], 17, cr[1], 1.6, 1.6, 16, ry2 + 0.7, 0x5a4a36, 'wood'); }
      piers++;
      /* a warehouse from the kit on the quay behind every other pier, its front to the pier */
      if (piers % 2 === 0) VC.quayWarehouse(V.add(root, V.mul(C[j].inl, B.rr(24, 32))), out, 2);
    }
    /* fishing docks (Voth's 65e buildFishDockPier: 9.5 m decks, 38 m out) in the gaps between the long piers, each
       with a dhow or two moored alongside (owner: "make sure harbor also has fishing docks") */
    /* a fishing dock keeps a dhow's berth (and a little more) clear of every other pier's deck, not a ship's */
    var fishHit = function (r, o, L) { for (var t = 0; t <= L; t += 4) { var q = V.add(r, V.mul(o, t)); if (B.PIERS.some(function (P) { return segDist(q, [P.x0, P.z0], [P.x1, P.z1]) < P.w / 2 + B.LIFE_FISHDOCK_W / 2 + (P.ship ? Sh.beam + Sh.clear : TUNE.fishClear); })) return true; } return false; };
    var accF = 20;
    for (var f = 1; f < C.length; f++) {
      accF += V.dist(C[f - 1].p, C[f].p); if (accF < TUNE.fishGap) continue;
      var fr = C[f].p, fo = V.mul(C[f].inl, -1), fl = 0;
      var fOpen = 0; for (var fo2 = 8; fo2 <= TUNE.harbour.look; fo2 += 6) { var fq = V.add(fr, V.mul(fo, fo2)); if (baseH(fq[0], fq[1]) > -0.3 || VC.cantonBlocked(fq[0], fq[1])) break; fOpen = fo2; }
      var fMax = Math.min(B.LIFE_FISHDOCK_LEN, fOpen - TUNE.harbour.basin * 0.5);
      for (var ft = 8; ft <= fMax; ft += 4) { var fp = V.add(fr, V.mul(fo, ft)); if (baseH(fp[0], fp[1]) > -0.3 || VC.inCanton(fp, 12)) break; fl = ft; }
      if (fl < 22 || fishHit(fr, fo, fl)) continue;
      var fd = B.buildFishDockPier(fr[0], fr[1], fo[0], fo[1], fl); if (!fd) continue;
      B.PIERS.push({ s: C[f].s, x0: fr[0], z0: fr[1], x1: fd.tipX, z1: fd.tipZ, w: B.LIFE_FISHDOCK_W, fish: true });
      accF = 0; fish++;
      var side = [fo[1], -fo[0]], fry = Math.atan2(fo[0], fo[1]);
      [-1, 1].forEach(function (sd) {
        if (!B.chance(0.7)) return;
        var hc = V.add(V.add(fr, V.mul(fo, fl * B.rr(0.45, 0.75))), V.mul(side, sd * (B.LIFE_FISHDOCK_W / 2 + 3.4)));
        B.BOX(hc[0], -1.0, hc[1], 4.2, 2.1, B.rr(12, 15), fry, 0x5e4d3a, 'wood');
        B.BOX(hc[0], 1.1, hc[1], 3.6, 0.4, 11, fry, 0x4a3c2c, 'wood');
        B.CYL(hc[0], 1.1, hc[1], 0.22, B.rr(8, 11), 0, 0x4a3c2c, 'wood');
      });
    }
    /* cargo on the quay */
    for (var cg = 0; cg < Math.min(80, C.length * 2); cg++) {
      var e = C[B.rr(0, C.length - 1) | 0], cp = V.add(e.p, V.mul(e.inl, B.rr(4, 10)));
      B.BOX(cp[0], 3.6, cp[1], B.rr(1.5, 3), B.rr(1.2, 3), B.rr(1.5, 3), B.rr(0, 3), B.pick([0x7a6448, 0x6a5a40, 0x8a7a5a]), 'wood');
    }
  });
  return d.name + ': ' + piers + ' piers and ' + fish + ' fishing docks along ' + Math.round(C.length * 26) + ' m of quay';
};

/* a warehouse from the Voth building kit behind a quay (was Voth's shed(): no doors, no windows), facing the water:
   the first kit warehouse whose footprint fits there */
VC.quayWarehouse = function (c, toWater, step) {
  var R = SL.R, f = V.norm(toWater), items = SL.items('warehouse').slice().sort(function (a, b) { return a.w * a.d - b.w * b.d; });
  for (var i = 0; i < items.length; i++) {
    var it = items[i], cc = V.add(c, V.mul(f, -it.d / 2 + 6)), o = obb(cc, [f[1], -f[0]], it.w / 2 + 1, it.d / 2 + 1);
    if (R.blockedRect(o, 0.3) || SL.clash(o)) continue;
    /* clear of the wall line to come (the wall polygon's west edge, known from the start) */
    if (VC.wallChain && obbCorners(o).concat([cc]).some(function (q) { return VC.wallChain.some(function (w, j) { return j && segDist(q, VC.wallChain[j - 1], w) < TUNE.wall.clear + 8; }); })) continue;
    var L = VC.fixed('warehouse', { key: it.key, v: it.v }, cc, f, step); if (!L) continue;
    L.cls = 'warehouse'; L.civic = false; L.quay = true; return L;
  }
  return null;
};

/* river port (Voth's RPIERS, 30c "river docklands" and 60-land.js): short quays run OUT from the bank, square to the
   current (owner, 2026-10-09: the bank-parallel decks read 90 degrees off), every ~58 m along the bank inside the
   district, 7-10 m wide and 26-40 m out on piles every 12 m; a barge moored alongside every other one (Voth's
   BARGES: parallel to the current), a shed on the bank behind each. */
VC.buildRiverPort = function (d) {
  var B = VOTH, R = SL.R, docks = 0;
  B.reseed(655002);
  VC.capture('riverport:' + d.name, 2, function () {
    var last = -1e9;
    for (var u2 = 0; u2 < 8000; u2 += 15) {
      var p = B.riverAt(u2), hb = B.riverHalf(p.x, p.z);
      [1, -1].forEach(function (side) {
        var bank = [p.x + p.nx * hb * side, p.z + p.nz * hb * side], inl = [p.nx * side, p.nz * side];
        /* the district may stop short of the water: a bank whose landward side is in it counts */
        if (!(inPoly(bank, d.poly) || inPoly(V.add(bank, V.mul(inl, 40)), d.poly)) || u2 - last < TUNE.riverDockGap || baseH(bank[0] + inl[0] * 12, bank[1] + inl[1] * 12) < 0.5) return;
        /* the quay's root: the waterline, found along the bank normal on the edited ground */
        var root = null;
        for (var t = 30; t >= -40; t -= 2) { var q = V.add(bank, V.mul(inl, t)); if (baseH(q[0], q[1]) < 0.4) { root = V.add(bank, V.mul(inl, t + 6)); break; } }
        if (!root) return;
        var out = V.mul(inl, -1), L = B.rr(26, 40), w = B.rr(7, 10), rp = Math.atan2(out[0], out[1]), n = Math.max(2, Math.round(L / 12));
        for (var i = 0; i < n; i++) {
          var c = V.add(root, V.mul(out, (i + 0.5) * L / n));
          B.BOX(c[0], 2.6, c[1], w, 1.5, L / n * 1.08, rp, 0x85735a, 'wood');
          [-1, 1].forEach(function (sd) { var o = V.add(c, V.mul([out[1], -out[0]], sd * (w * 0.5 - 1))), bd = Math.min(-1, baseH(o[0], o[1])); B.CYL(o[0], bd, o[1], 0.9, 2.6 - bd, 0, 0x6b5942, 'wood'); });
        }
        B.PIERS.push({ x0: root[0], z0: root[1], x1: root[0] + out[0] * L, z1: root[1] + out[1] * L, w: w, river: true });
        if (docks % 2 === 0) {
          /* a barge moored across the pier head, parallel to the current (Voth's BARGES). The pier is square to the
             current, so a barge alongside it would lie across it (owner, 2026-10-09: the barge clipped the piers): it
             lies off the head instead, a little clear of it, and only where every corner of it floats */
          var tg = [p.tx, p.tz], gl = B.rr(26, 34), gb = B.rr(7, 9), g = V.add(root, V.mul(out, L + gb / 2 + TUNE.bargeClear)), gry = Math.atan2(tg[0], tg[1]), col = 0x5e4d3a;
          var afloat = obbCorners(obb(g, [tg[1], -tg[0]], gb / 2, gl / 2)).concat([g]).every(function (q) { return baseH(q[0], q[1]) < -0.8; });
          if (afloat) {
            B.BOX(g[0], -1.6, g[1], gb, 3.4, gl, gry, col, 'wood'); B.BOX(g[0], 1.8, g[1], gb * 0.9, 0.6, gl * 0.96, gry, B.shade(col, -0.2), 'wood');
            var cb = V.sub(g, V.mul(tg, gl * 0.28)); B.BOX(cb[0], 2.4, cb[1], gb * 0.7, 2.6, gl * 0.26, gry, B.shade(col, 0.08), 'wood');
            /* the boats steer round it as round a pier */
            B.PIERS.push({ x0: g[0] - tg[0] * gl / 2, z0: g[1] - tg[1] * gl / 2, x1: g[0] + tg[0] * gl / 2, z1: g[1] + tg[1] * gl / 2, w: gb, river: true, barge: true });
            VC.barges = (VC.barges || 0) + 1;
          }
        }
        /* the bank behind is the quay's: no lot on it */
        R.eachNearSeg(root, V.add(root, V.mul(inl, 14)), w / 2 + 3, function (k) { if (R.occ[k] === OCC.FREE) R.occ[k] = OCC.HARD; });
        VC.quayWarehouse(V.add(root, V.mul(inl, 30)), out, 2);
        last = u2; docks++;
      });
    }
  });
  /* the audit: no barge's hull may touch a pier (any pier: the river's and the harbour's) */
  var piers = VOTH.PIERS.filter(function (q) { return !q.barge; }), clash = 0, n = 0;
  VOTH.PIERS.forEach(function (b) {
    if (!b.barge) return; n++;
    var u = V.norm([b.x1 - b.x0, b.z1 - b.z0]), c = [(b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2], o = obb(c, [u[1], -u[0]], b.w / 2, Math.hypot(b.x1 - b.x0, b.z1 - b.z0) / 2);
    if (piers.some(function (q) { var L = Math.hypot(q.x1 - q.x0, q.z1 - q.z0) || 1, qu = [(q.x1 - q.x0) / L, (q.z1 - q.z0) / L]; return SL.pen(o, obb([(q.x0 + q.x1) / 2, (q.z0 + q.z1) / 2], [qu[1], -qu[0]], q.w / 2, L / 2)) > 0; })) clash++;
  });
  VC.bargeAudit = { barges: n, clash: clash };
  return d.name + ': ' + docks + ' river quays, ' + n + ' barges moored off their heads' + (clash ? ' (' + clash + ' touching a pier!)' : '');
};

/* ---------------------------------------------------------------- step 5: the wall, built as Voth builds it */
/* a plain gate, whole: Voth's gate-ruin A without its cracks and rubble (65h-showcase.js: twin octagonal towers with
   a coping, a lintel over the passage), its towers set off the way's own width so the road runs between them */
VC.wallGate = function (n, y, col) {
  var B = VOTH, tw = TUNE.wall.gateTower, off = n.towerOff || 15, th = 22, lz = [Math.sin(n.ry), Math.cos(n.ry)];
  [-1, 1].forEach(function (s) {
    var p = [n.gx + lz[0] * off * s, n.gz + lz[1] * off * s], f = B.footing(p[0], p[1], tw / 2, tw / 2, n.ry), y0 = Math.min(y, f.lo);
    B.FR8(p[0], y0, p[1], tw, th + (y - y0), tw, n.ry, col);
    B.BOX(p[0], y + th, p[1], tw * 1.12, 1.6, tw * 1.12, n.ry, B.shade(col, -0.2));
  });
  B.BOX(n.gx, y + th - 7, n.gz, 11, 7, off * 2 + 2, n.ry, B.shade(col, -0.03));
};
VC.buildWall = function () {
  var B = VOTH, W = VC.wall;
  VC.capture('wall', 5, function () {
    W.nodes.forEach(function (n) {
      if (n.kind === 'gate' && n.health <= 0) { n.deleted = true; return; }
      /* a gate on a way stands on the crossing itself: a site search would slide it off the road */
      if (n.kind === 'gate' && n.way) { n.gx = n.x; n.gz = n.z; n.towerOff = ((TUNE.width[n.way.cls] || 10) + TUNE.wall.gatePass) / 2 + TUNE.wall.gateTower / 2; return; }
      var site = n.kind === 'tower' ? B.facadeFindGateSite(n.x, n.z, { fx: 10, fz: 10, maxSlope: 20, ry: n.ry, tag: 'tower' })
                                    : B.facadeFindGateSite(n.x, n.z, { fx: n.named ? 11 : 10, fz: n.named ? 19 : 17, maxSlope: 16, ry: n.ry, tag: 'gate' });
      if (site) { n.gx = site.x; n.gz = site.z; } else { n.skip = true; n.gx = n.x; n.gz = n.z; }
      /* the line was set clear of the avenues: a node the site search moved far off it (the river, a steep bank) keeps
         the wall on its line and gives up its tower; a gate keeps its crossing */
      if (site && Math.hypot(site.x - n.x, site.z - n.z) > 20) { n.gx = n.x; n.gz = n.z; if (n.kind === 'tower') n.noTower = true; }
    });
    var live = W.nodes.filter(function (n) { return (!n.skip || n.kind === 'tower') && !n.deleted; });
    live.forEach(function (n, i) { if (n.square) return; var a = live[Math.max(0, i - 1)], b = live[Math.min(live.length - 1, i + 1)]; n.ry = Math.atan2(b.gx - a.gx, b.gz - a.gz); });
    live.forEach(function (n) {
      if (n.kind === 'tower') { if (n.skip || n.noTower) return; var f = B.footing(n.gx, n.gz, 9, 9, n.ry); B.watchtower(n.gx, f.lo, n.gz, n.ry, n.health, B.pick(B.BASALTC)); return; }
      var pad = VC.levelGate(n), fg = pad != null ? { lo: pad, hi: pad } : B.footing(n.gx, n.gz, 10, 10, n.ry); if (fg.hi - fg.lo > 16) fg.lo = fg.hi - 16;
      var gcol = B.pick(B.BASALTC);
      if (n.name === 'HarborGate') B.harborGate(n.gx, fg.lo, n.gz, n.ry, gcol, {});
      else if (n.name === 'SpiritGate') B.spiritGate(n.gx, fg.lo, n.gz, n.ry, gcol, {});
      else if (n.name === 'RiverGate') B.riverGate(n.gx, fg.lo, n.gz, n.ry, gcol, {});
      else VC.wallGate(n, fg.lo, gcol);
    });
    W.segs = [];
    for (var i = 1; i < live.length; i++) {
      var A = live[i - 1], C = live[i], health = Math.floor((A.health + C.health) / 2);
      if (health <= 0) continue;
      var dx = C.gx - A.gx, dz = C.gz - A.gz, L = Math.hypot(dx, dz); if (L < 2) continue;
      var ux = dx / L, uz = dz / L, iA = A.kind === 'gate' ? 18 : 6, iC = C.kind === 'gate' ? 18 : 6;
      var ax = A.gx + ux * Math.min(iA, L * 0.4), az = A.gz + uz * Math.min(iA, L * 0.4), bx = C.gx - ux * Math.min(iC, L * 0.4), bz = C.gz - uz * Math.min(iC, L * 0.4);
      if (Math.hypot(bx - ax, bz - az) < 4) continue;
      B.wallSegRender(ax, az, bx, bz, health, B.pick(B.BASALTC));
      W.segs.push({ ax: ax, az: az, bx: bx, bz: bz, health: health });
    }
  });
};
