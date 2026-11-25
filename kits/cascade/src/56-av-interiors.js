// ================================================================= ARCVILLAGE — camera-independent interior records & on-demand decks  [draw]
// 1. Computes and registers KFURN + KTAGS records for every programmed room across the arcology immediately at load
//    (README.md: "Furniture that is not always drawn is data first").
// 2. Opens individual decks (X / [ / ] storey cut-away or walk-in) OR a multi-deck vertical slice (C / Cross-section
//    view) on demand, drawing partitions, doorways, core stairs/lifts, and indexed catalog furniture batches.
(function () {
  'use strict';

  AV.IX = {
    ready: false,
    furnPass: null,
    adapter: null,
    recordsByState: {},
    openGroups: [],
    sectionOpen: false,
    activeSite: 'refurbished'
  };

  AV.initInteriors = function () {
    if (AV.IX.ready) return;
    var AI = KratorAncientsInteriors, IX = KratorInteriors, KF = KratorFurniture;
    AI.IX = IX;
    AI.install(IX);
    AV.installDress(AI);
    AV.IX.adapter = IX.runtimeAdapter(KF, KF.batch({ indexed: true }));
    AV.IX.furnPass = KFURN.create({
      catalog: KFURN.catalogOf(KF),
      interiors: IX,
      on: true,
      tags: TAGS,
      seed: function (o, ctx, R, x, y, z) {
        return ((Math.round(x * 10) * 73856093) ^ (Math.round(z * 10) * 19349663) ^ (Math.round(y * 10) * 83492791)) >>> 0;
      },
      draw: null
    });
    AV.IX.ready = true;
  };

  // Precompute camera-independent room & furniture records for a site (refurbished or intact)
  AV.ensureRecords = function (siteKey) {
    AV.initInteriors();
    if (AV.IX.recordsByState[siteKey]) return AV.IX.recordsByState[siteKey];
    var S = AV.SITES[siteKey];
    if (!S) return null;
    var P = S.plan, AI = KratorAncientsInteriors;
    var culture = P.culture;
    var cultures = culture === 'republican' ? ['republican', 'generic', 'scrap'] : ['ancient', 'generic', 'post-apoc'];
    var byDeck = {}, totalRooms = 0, totalPieces = 0;

    P.decks.forEach(function (dk) {
      var st = AV.storey(P, dk.k, AI);
      var furnished = P.state === 'ruined' && dk.k >= 9
        ? { rooms: [], pieces: 0, adapter: AV.IX.adapter, catalog: AV.IX.adapter }
        : AI.furnishPlan(
          { type: P.id, furnish: true, culture: culture, buildings: [{ id: P.id + '.b' + dk.k, storeys: [st] }] },
          AV.IX.adapter,
          { culture: culture, cultures: cultures, seed: 77 + dk.k * 13 }
        );

      // Register rooms & centerpiece records in KTAGS + KFURN (camera-independent index)
      var recs = [];
      if (siteKey === 'refurbished') {
        st.rooms.forEach(function (R) {
          if (!R.poly || R.kind === 'corridor' || R.kind === 'core') return;
          var c = AI.polyCentroid(R.poly);
          TAGS.add({
            'class': 'part', kind: 'room', key: R.kind, name: R.label || R.id,
            at: [S.x + c[0], R.y, S.z + c[1]],
            tags: { culture: culture, room: R.kind, role: R.category || 'civic', job: R.job || undefined },
            frag: '56-av-interiors.js'
          });
        });
        (furnished.rooms || []).forEach(function (rm) {
          rm.placements.forEach(function (p) {
            var rec = AV.IX.furnPass.place(
              p.key, S.x + p.x, p.y, S.z + p.z, p.ry,
              { v: p.variant | 0, setting: 'indoor', room: rm.R.id },
              [p.x, p.y, p.z, p.ry],
              { building: P.id, room: rm.R.id }
            );
            if (rec) recs.push(rec);
          });
        });
      }
      totalRooms += (furnished.rooms || []).length;
      totalPieces += furnished.pieces || 0;
      byDeck[dk.k] = { storey: st, furnished: furnished, recs: recs };
    });

    var bundle = { siteKey: siteKey, byDeck: byDeck, totalRooms: totalRooms, totalPieces: totalPieces };
    AV.IX.recordsByState[siteKey] = bundle;
    return bundle;
  };

  // Build 3D geometry (slabs, partitions with door gaps/lintels, core stairs/lifts, and furniture batch) for one deck
  AV.drawDeck = function (siteKey, deckIdx, hideCeiling, sharedBatch) {
    var recSet = AV.ensureRecords(siteKey);
    if (!recSet || !recSet.byDeck[deckIdx]) return null;
    var S = AV.SITES[siteKey], P = S.plan;
    var entry = recSet.byDeck[deckIdx], st = entry.storey, furn = entry.furnished;
    var g = new THREE.Group(), M = AV.mats(), B = AV.builder();
    g.name = P.id + '.deck.' + deckIdx;

    var y0 = st.y + 0.03, y1 = st.y + st.h - 0.25, DH = 2.18, TH = 0.15;
    var wallCol = P.culture === 'republican' ? [0.88, 0.85, 0.79] : [0.86, 0.88, 0.89];
    var blocks = [], stairs = [], floorPolys = [];

    function wallSeg(a, b, ya, yb) {
      var dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
      if (len < 0.05 || yb - ya < 0.05) return;
      if (ya < st.y + 0.6) {
        var nq = Math.max(1, Math.ceil(len / 0.5));
        for (var q = 0; q < nq; q++) {
          var f = (q + 0.5) / nq;
          blocks.push([a[0] + dx * f, a[1] + dz * f]);
        }
      }
      var yaw = -Math.atan2(dz, dx);
      B.obox('partWall', (a[0] + b[0]) * 0.5, (ya + yb) * 0.5, (a[1] + b[1]) * 0.5, yaw, len, yb - ya, TH, { col: wallCol, uv: 2.5 });
    }

    // Partitions with doorways & lintels
    (st.walls || []).forEach(function (W) {
      if (!W.pts || W.pts.length < 2) return;
      var top = W.broken ? (W.stub == null ? 0.9 : W.stub) : y1 - y0;
      if (top < 0.1) return;
      var pts = W.pts, d = W.broken ? null : W.door;
      var Slen = [0];
      for (var i = 0; i + 1 < pts.length; i++) {
        Slen.push(Slen[i] + Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]));
      }
      var end = Slen[Slen.length - 1];
      function ptAt(s) {
        var k = 0;
        while (k < pts.length - 2 && Slen[k + 1] < s) k++;
        var segL = (Slen[k + 1] - Slen[k]) || 1, f = (s - Slen[k]) / segL;
        return [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f];
      }
      function runSpan(s0, s1, ya, yb) {
        if (s1 - s0 < 0.04) return;
        var cuts = [s0];
        Slen.forEach(function (v) { if (v > s0 + 0.02 && v < s1 - 0.02) cuts.push(v); });
        cuts.push(s1);
        for (var c = 0; c + 1 < cuts.length; c++) wallSeg(ptAt(cuts[c]), ptAt(cuts[c + 1]), ya, yb);
      }
      if (!d) { runSpan(0, end, y0, y0 + top); return; }
      var sd = 0, best = 1e9;
      for (var j = 0; j + 1 < pts.length; j++) {
        var pa = pts[j], pb = pts[j + 1], dx = pb[0] - pa[0], dz = pb[1] - pa[1], l2 = dx * dx + dz * dz;
        if (!l2) continue;
        var t = Math.max(0, Math.min(1, ((d.at[0] - pa[0]) * dx + (d.at[1] - pa[1]) * dz) / l2));
        var dist = Math.hypot(pa[0] + dx * t - d.at[0], pa[1] + dz * t - d.at[1]);
        if (dist < best) { best = dist; sd = Slen[j] + (Slen[j + 1] - Slen[j]) * t; }
      }
      var g0 = Math.max(0, sd - d.w * 0.5), g1 = Math.min(end, sd + d.w * 0.5);
      runSpan(0, g0, y0, y0 + top);
      runSpan(g1, end, y0, y0 + top);
      if (top > DH + 0.12) runSpan(g0, g1, y0 + DH, y0 + top);
    });

    // Merge floor slabs (and optional ceiling slabs when not looking down a horizontal cut-away) into B ('concrete')
    function absorbSlab(geo, yOff) {
      var g0 = geo.index ? geo.toNonIndexed() : geo;
      var pos = g0.attributes.position, nrm = g0.attributes.normal;
      var slabOpt = { col: [0.80, 0.79, 0.76], uv: 4.0 };
      for (var ti = 0; ti + 2 < pos.count; ti += 3) {
        var P0 = [pos.getX(ti), pos.getY(ti) + yOff, pos.getZ(ti)];
        var P1 = [pos.getX(ti + 1), pos.getY(ti + 1) + yOff, pos.getZ(ti + 1)];
        var P2 = [pos.getX(ti + 2), pos.getY(ti + 2) + yOff, pos.getZ(ti + 2)];
        var N0 = nrm ? [nrm.getX(ti), nrm.getY(ti), nrm.getZ(ti)] : [0, 1, 0];
        B.tri('concrete', P0, P1, P2, N0, slabOpt);
      }
      geo.dispose();
      if (g0 !== geo) g0.dispose();
    }
    (st.parts || []).forEach(function (pt) {
      if (!pt.outline || pt.outline.length < 3) return;
      floorPolys.push(pt.outline);
      var sh = new THREE.Shape(pt.outline.map(function (q) { return new THREE.Vector2(q[0], -q[1]); }));
      var sg = new THREE.ExtrudeGeometry(sh, { depth: 0.24, bevelEnabled: false, curveSegments: 1 });
      sg.rotateX(-Math.PI / 2);
      if (!hideCeiling) {
        absorbSlab(sg.clone(), st.y + st.h - 0.24);
      }
      absorbSlab(sg, st.y - 0.22);
    });

    // Lift doors & switchback stairs inside the 4 inner cylindrical column-towers at this deck height
    P.towers.filter(function (tw) { return tw.ring === 'inner'; }).forEach(function (tw) {
      if (st.y > tw.y1 - 4.0) return;
      tw.shafts.forEach(function (sh) {
        var sx = tw.x + sh.dx, sz = tw.z + sh.dz;
        if (sh.kind === 'lift') {
          B.box(P.culture === 'republican' ? 'iron' : 'bronze', sx - 0.7, sx + 0.7, y0, y0 + 2.2, sz - sh.d * 0.5, sz + sh.d * 0.5, {});
        } else {
          for (var step = 0; step < 8; step++) {
            var f0 = step / 8, f1 = (step + 1) / 8;
            B.box('concrete', sx - 1.1, sx + 1.1, st.y + st.h * f0, st.y + st.h * f1, sz - 1.4 + f0 * 2.4, sz - 1.4 + f1 * 2.4 + 0.15, {});
          }
          stairs.push({ a: [sx, sz - 1.4, st.y], b: [sx, sz + 1.4, st.y + st.h], w: 2.2 });
        }
      });
    });

    var builtWalls = B.finish(g.name + '.walls');
    while (builtWalls.children.length) g.add(builtWalls.children[0]);

    // Indexed catalog furniture batch (per-deck or shared across the multi-deck section stack)
    var pieces = 0;
    if (furn.rooms && furn.rooms.length) {
      KratorFurniture.setDetail(sharedBatch ? 0.4 : 0.55);
      var Bf = sharedBatch || KratorFurniture.batch({ indexed: true });
      var roomsToDraw = furn.rooms;
      if (sharedBatch && roomsToDraw.length > 28) {
        /* In 7-deck macroscopic cross-section mode, prioritize rooms near the N-S / E-W section planes & halls */
        roomsToDraw = roomsToDraw.slice().sort(function (a, b) {
          var pa = a.placements[0] || { x: 0, z: 0 }, pb = b.placements[0] || { x: 0, z: 0 };
          var da = Math.min(Math.abs(pa.z), Math.abs(pa.x)) - (a.recipe ? 30 : 0);
          var db = Math.min(Math.abs(pb.z), Math.abs(pb.x)) - (b.recipe ? 30 : 0);
          return da - db;
        }).slice(0, 28);
      }
      roomsToDraw.forEach(function (rm) {
        rm.placements.forEach(function (p) {
          Bf.place(p.key, p.x, p.y + 0.03, p.z, p.ry, {
            variant: p.variant | 0,
            seed: AV.idHash(p.room || 'av') & 0xffff,
            wealth: rm.R.wealth == null ? 0.6 : rm.R.wealth,
            setting: 'indoor'
          });
          pieces++;
        });
      });
      if (!sharedBatch) {
        var fg = Bf.flush(g);
        if (fg) {
          fg.traverse(function (o) {
            if (o.isMesh) {
              KFURN.linearColours(o.geometry);
              o.userData.probeSkip = true;
            }
          });
        }
      }
    }

    g.position.set(S.x, S.y, S.z);
    g.userData = { siteKey: siteKey, deckIdx: deckIdx, rooms: st.rooms.length, pieces: pieces, blocks: blocks, stairs: stairs, floorPolys: floorPolys, y: st.y };
    return g;
  };

  AV.closeDecks = function () {
    while (AV.IX.openGroups.length) {
      var o = AV.IX.openGroups.pop();
      scene.remove(o.g);
      o.g.traverse(function (m) {
        if (m.geometry && !m.isInstancedMesh) m.geometry.dispose();
      });
    }
    AV.IX.sectionOpen = false;
    AV.walkSync();
  };

  AV.openDeck = function (siteKey, deckIdx, hideCeiling) {
    AV.closeDecks();
    AV.IX.activeSite = siteKey;
    var g = AV.drawDeck(siteKey, deckIdx, hideCeiling !== false, null);
    if (!g) return null;
    if (AV.shadow) AV.shadow.cast(g);
    scene.add(g);
    AV.IX.openGroups.push({ siteKey: siteKey, deckIdx: deckIdx, g: g });
    AV.walkSync();
    return g;
  };

  // Multi-deck stack opened simultaneously during vertical Soleri Cross-Section mode (Work + Civic + Living + Rec!)
  AV.SECTION_DECKS = [0, 1, 2, 4, 5, 7, 11, 12];
  AV.openSectionDecks = function (siteKey) {
    AV.closeDecks();
    AV.IX.activeSite = siteKey || 'refurbished';
    AV.IX.sectionOpen = true;
    var S = AV.SITES[AV.IX.activeSite];
    var sharedBatch = KratorFurniture.batch({ indexed: true });
    AV.SECTION_DECKS.forEach(function (dk) {
      var g = AV.drawDeck(AV.IX.activeSite, dk, false, sharedBatch);
      if (g) {
        scene.add(g);
        AV.IX.openGroups.push({ siteKey: AV.IX.activeSite, deckIdx: dk, g: g });
      }
    });
    if (S) {
      var fgWrap = new THREE.Group();
      fgWrap.name = S.plan.id + '.section.furniture';
      fgWrap.position.set(S.x, S.y, S.z);
      var fg = sharedBatch.flush(fgWrap);
      if (fg) {
        fg.traverse(function (o) {
          if (o.isMesh) {
            KFURN.linearColours(o.geometry);
            o.userData.probeSkip = true;
          }
        });
      }
      scene.add(fgWrap);
      AV.IX.openGroups.push({ siteKey: AV.IX.activeSite, deckIdx: -1, g: fgWrap });
    }
    AV.walkSync();
  };

  // Sync walkable surfaces & partition blockers into KWALK
  AV.walkSync = function () {
    if (typeof KWALK === 'undefined') return;
    var W = KWALK;
    W.clear();
    W.floor({ rect: [-1400, 1400, -1200, 1200], y: 0, name: 'site plain', tag: 'ground' });
    // Central Industrial Hall foundry floor at y = 6.0 m around the cataract & turbine pit (pitX = 18, pitZ = -6..19)
    W.floor({ rect: [-56, 56, -56, -6], y: 6.0, name: 'Central Industrial Hall North Foundry', tag: 'storey' });
    W.floor({ rect: [-56, 56, 19, 56], y: 6.0, name: 'Central Industrial Hall South Apron', tag: 'storey' });
    W.floor({ rect: [-56, -18, -6, 19], y: 6.0, name: 'Central Industrial Hall West Dynamos', tag: 'storey' });
    W.floor({ rect: [18, 56, -6, 19], y: 6.0, name: 'Central Industrial Hall East Dynamos', tag: 'storey' });
    // L2 Mezzanine Machine Galleries at y = 16.2 m
    W.floor({ rect: [-56, 56, -56, -34], y: 16.2, name: 'L2 North Mezzanine Gallery', tag: 'storey' });
    W.floor({ rect: [-56, -34, -34, 24], y: 16.2, name: 'L2 West Mezzanine Gallery', tag: 'storey' });
    W.floor({ rect: [34, 56, -34, 24], y: 16.2, name: 'L2 East Mezzanine Gallery', tag: 'storey' });
    if (AV.IX.sectionOpen) return;
    // Open single-deck interior storey
    AV.IX.openGroups.forEach(function (o) {
      var S = AV.SITES[o.siteKey], u = o.g.userData;
      if (!u) return;
      (u.floorPolys || []).forEach(function (poly, pi) {
        W.poly({
          pts: poly.map(function (p) { return [S.x + p[0], S.z + p[1], u.y]; }),
          name: o.siteKey + ' L' + o.deckIdx + '.' + pi,
          tag: 'storey'
        });
      });
      (u.stairs || []).forEach(function (st) {
        W.strip({
          a: [S.x + st.a[0], S.z + st.a[1], st.a[2]],
          b: [S.x + st.b[0], S.z + st.b[1], st.b[2]],
          w: st.w, name: 'tower stair', tag: 'stair'
        });
      });
      (u.blocks || []).forEach(function (b) {
        var bx = S.x + b[0], bz = S.z + b[1];
        W.block([bx - 0.1, bx + 0.1, bz - 0.1, bz + 0.1, u.y, u.y + 3.0], 'wall');
      });
    });
  };
})();
