// ================================================================= INTERIORS HOST — 12 cutaway zones, KFURN, KDOOR & live culture socket
// Connects `[G data]` `AF_INT` (`31-af-interiors.js`) to `KratorInteriors`, `KratorAncientsInteriors`, `KratorFurniture`,
// `KFURN` (`core/furnish`), `KDOOR` + `KDOORHOST` (`core/door`), and `KHOST` cutaway (`99-host-cutaway.js`).
// All placement records are registered in `AF_TAGS` before any interior mesh is drawn; storey meshes & furniture batches
// build lazily on cutaway open and rebuild live when `ARCOFORTE_HOST.socket(culture)` switches the occupying culture.
const AF_INT_HOST = (function initAfInteriorsHost() {
  const IX = KratorInteriors, AI = KratorAncientsInteriors, KF = KratorFurniture;
  AI.install(IX);
  const adapter = IX.runtimeAdapter(KF, KF.batch({ indexed: true }));
  const built = AF_INT.buildPlans(AI, AF_STATE, AF_PLAN);
  const area = AF_INT.areaSummary(AF_PLAN, built);

  const intRoot = new THREE.Group();
  intRoot.name = 'arcoforte:interiors';
  scene.add(intRoot);

  const wallMat = new THREE.MeshStandardMaterial({
    map: TEX.concrete,
    color: AF_STATE === 'ruined' ? 0x7d766d : 0xe2dcd0,
    roughness: 0.88,
    metalness: 0.02,
    side: THREE.DoubleSide
  });
  const doorMat = new THREE.MeshStandardMaterial({
    color: AF_STATE === 'intact' ? 0x9c8252 : 0x7b5838,
    roughness: 0.62,
    metalness: AF_STATE === 'intact' ? 0.45 : 0.12,
    side: THREE.DoubleSide
  });

  /* 1. Register all 12 interior cutaway units and their rooms in AF_TAGS BEFORE drawing */
  built.units.forEach(u => {
    const y0 = u.storeys[0].y;
    const topSt = u.storeys[u.storeys.length - 1];
    const hTot = (topSt.y + topSt.h) - y0;
    const uRec = AF_TAGS.child(AF_DRAWN.rootId, Object.assign({
      id: 'int.' + u.id,
      'class': 'part',
      kind: 'interior_zone',
      key: u.id,
      name: u.name,
      at: [u.x, y0, u.z],
      h: hTot,
      tags: {
        culture: 'ancient',
        types: u.types || ['civic'],
        state: u.kept ? 'intact' : 'ruined',
        sector: undefined
      },
      note: u.sector.toUpperCase() + ' cutaway zone (' + u.storeys.length + ' storeys)'
    }, u.r != null ? { r: u.r } : { size: [u.w == null ? 40 : u.w, u.d == null ? 40 : u.d, hTot] }));
    delete uRec.tags.sector;

    u.storeys.forEach(st => {
      st.rooms.forEach(R => {
        let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
        (R.poly || []).forEach(p => {
          if (p[0] < x0) x0 = p[0];
          if (p[0] > x1) x1 = p[0];
          if (p[1] < z0) z0 = p[1];
          if (p[1] > z1) z1 = p[1];
        });
        if (!isFinite(x0)) { x0 = u.x - 4; x1 = u.x + 4; z0 = u.z - 4; z1 = u.z + 4; }
        AF_TAGS.child(uRec.id, {
          id: R.id,
          'class': 'part',
          kind: 'room',
          key: R.kind,
          name: R.kind + ' — ' + (st.levelName || ('L' + st.level)),
          at: [(x0 + x1) / 2, R.y, (z0 + z1) / 2],
          size: [Math.max(1, x1 - x0), Math.max(1, z1 - z0), R.h != null ? R.h : (st.h != null ? st.h : 3.6)],
          tags: {
            culture: 'ancient',
            types: u.types || ['civic'],
            state: u.kept ? 'intact' : 'ruined',
            room: R.kind
          }
        });
      });
    });
  });

  /* 2. Complex-wide exterior portal doors on core/door + KDOORHOST (interactive via E key!) */
  const extDoors = [
    { id: 'af.door.rotunda_south', at: [0, 70.0, -68.2], yaw: 0, w: 4.4, h: 4.2, pair: true, locked: AF_STATE === 'ruined' },
    { id: 'af.door.harbour_works', at: [0, 5.5, -242.5], yaw: Math.PI, w: 4.0, h: 3.6, pair: true, locked: AF_STATE === 'ruined' },
    { id: 'af.door.auto_vault_gate', at: [0, 5.5, -206.4], yaw: Math.PI, w: 5.2, h: 4.4, pair: true, locked: true },
    { id: 'af.door.city_west_park', at: [-146.2, 84.0, 10.0], yaw: Math.PI / 2, w: 3.6, h: 3.6, pair: true, locked: AF_STATE === 'ruined' },
    { id: 'af.door.city_east_park', at: [146.2, 84.0, 10.0], yaw: -Math.PI / 2, w: 3.6, h: 3.6, pair: true, locked: AF_STATE === 'ruined' },
    { id: 'af.door.linear_customs', at: [0, 84.0, 230.0], yaw: 0, w: 3.8, h: 3.6, pair: true, locked: AF_STATE === 'ruined' }
  ];
  const doorRoot = new THREE.Group();
  doorRoot.name = 'arcoforte:doors';
  scene.add(doorRoot);

  function mountDoorMesh(dRec, parent) {
    const leaves = KDOOR.leaves(dRec);
    const objs = leaves.map((L, li) => {
      const g = new THREE.BoxGeometry(L.size[0], L.size[1], Math.max(0.08, L.size[2]));
      const m = new THREE.Mesh(g, dRec.locked ? MAT.afBronze : doorMat);
      m.position.set(L.p[0], L.p[1], L.p[2]);
      m.rotation.y = dRec.yaw || 0;
      m.name = dRec.id + '.leaf' + li;
      m.userData.door = true;
      m.userData.probeSkip = true;
      parent.add(m);
      return m;
    });
    KDOORHOST.object(dRec, objs);
  }
  extDoors.forEach(spec => {
    const rec = KDOOR.add(spec);
    mountDoorMesh(rec, doorRoot);
  });

  /* 3. Furniture registry (KFURN) & live culture socket */
  let currentSocket = AF_CULTURE_INIT;
  let socketEpoch = 0;
  let furnished = null;
  let furnReg = null;
  let prevFurnIds = [];

  function runFurnishPass(sockKey) {
    const skKey = AF_INT.SOCKETS[sockKey] ? sockKey : 'refurbished';
    prevFurnIds.forEach(id => AF_TAGS.remove(id));
    prevFurnIds = [];
    const prefix = socketEpoch === 0 ? 'furn' : ('furn' + socketEpoch);
    socketEpoch++;

    furnReg = KFURN.create({
      catalog: KFURN.catalogOf(KF),
      interiors: IX,
      on: true,
      idPrefix: prefix,
      seed: o => (o && o.seed != null) ? o.seed : 1,
      tags: AF_TAGS,
      draw: null
    });

    furnished = AF_INT.furnishAll(AI, built, adapter, skKey, 11);
    currentSocket = skKey;

    (furnished.full.rooms || []).forEach(r => {
      const roomRec = r.R;
      const bldId = roomRec && roomRec.building ? ('int.' + roomRec.building) : AF_DRAWN.rootId;
      const rmId = roomRec ? roomRec.id : null;
      const baseSeed = KTAGS.str32(rmId || 'room') & 0xffff;
      (r.placements || []).forEach((p, idx) => {
        const variant = (p.variant != null ? p.variant : p.v) | 0;
        const pSeed = p.seed != null ? p.seed : ((baseSeed + idx * 37) & 0xffff);
        const rec = furnReg.place(p.key, p.x, p.y, p.z, p.ry || 0, {
          v: variant,
          seed: pSeed || 1,
          setting: 'room',
          room: rmId
        }, null, {
          building: bldId,
          room: rmId,
          wealth: furnished.profile.wealth
        });
        if (rec && rec.id) prevFurnIds.push(rec.id);
      });
    });
  }

  runFurnishPass(AF_CULTURE_INIT);

  /* 4. Lazy 3D Storey Geometry & Furniture Builder for Cutaway View */
  const unitViews = {}; /* unitId -> { group, storeys: [Group], furnGroups: [Group], builtSocket } */

  function addWallQuad(buf, a, b, y0, y1, nx, nz) {
    const base = buf.P.length / 3;
    buf.P.push(a[0], y0, a[1], b[0], y0, b[1], b[0], y1, b[1], a[0], y1, a[1]);
    for (let k = 0; k < 4; k++) buf.N.push(nx, 0, nz);
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    buf.U.push(0, y0 / 4, L / 4, y0 / 4, L / 4, y1 / 4, 0, y1 / 4);
    buf.I.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }

  function addWallSeg(buf, a, b, y0, y1) {
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
    if (L < 0.05 || y1 <= y0 + 0.02) return;
    const T = 0.08, ox = -dz / L * T, oz = dx / L * T;
    addWallQuad(buf, [a[0] + ox, a[1] + oz], [b[0] + ox, b[1] + oz], y0, y1, -dz / L, dx / L);
    addWallQuad(buf, [b[0] - ox, b[1] - oz], [a[0] - ox, a[1] - oz], y0, y1, dz / L, -dx / L);
    /* Top cap of cut/partition wall so cutaway slices read cleanly */
    const base = buf.P.length / 3;
    buf.P.push(a[0] + ox, y1, a[1] + oz, b[0] + ox, y1, b[1] + oz, b[0] - ox, y1, b[1] - oz, a[0] - ox, y1, a[1] - oz);
    for (let k = 0; k < 4; k++) buf.N.push(0, 1, 0);
    buf.U.push(0, 0, L / 4, 0, L / 4, 0.1, 0, 0.1);
    buf.I.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }

  function buildFurnitureForStorey(u, st) {
    const Bf = KF.batch({ indexed: true });
    const unitFurn = furnished.byUnit[u.id];
    let count = 0;
    if (unitFurn && unitFurn.rooms) {
      unitFurn.rooms.forEach(r => {
        if (!r.R || r.R.level !== st.level) return;
        const baseSeed = KTAGS.str32(r.R.id || 'room') & 0xffff;
        (r.placements || []).forEach((p, idx) => {
          const variant = (p.variant != null ? p.variant : p.v) | 0;
          const pSeed = p.seed != null ? p.seed : ((baseSeed + idx * 37) & 0xffff);
          Bf.place(p.key, p.x, p.y + 0.03, p.z, p.ry || 0, {
            variant: variant,
            seed: pSeed || 1,
            wealth: furnished.profile.wealth,
            setting: 'indoor'
          });
          count++;
        });
      });
    }
    const fg = Bf.flush();
    fg.name = 'af:furn:' + u.id + ':s' + st.level;
    fg.userData.khost = true; /* Keep opened storey's tall shelves & lamps whole under the cutaway plane */
    fg.traverse(o => {
      if (o.isMesh) {
        KFURN.linearColours(o.geometry);
        o.userData.probeSkip = true;
        o.userData.khost = true;
      }
    });
    fg.userData.pieceCount = count;
    return fg;
  }

  function ensureUnitView(u) {
    let uv = unitViews[u.id];
    if (uv) {
      if (uv.builtSocket !== currentSocket) {
        u.storeys.forEach((st, idx) => {
          const stGrp = uv.storeys[idx];
          if (uv.furnGroups[idx]) {
            stGrp.remove(uv.furnGroups[idx]);
            uv.furnGroups[idx].traverse(o => { if (o.isMesh && o.geometry) o.geometry.dispose(); });
          }
          const nfg = buildFurnitureForStorey(u, st);
          stGrp.add(nfg);
          uv.furnGroups[idx] = nfg;
        });
        uv.builtSocket = currentSocket;
      }
      return uv;
    }

    const grp = new THREE.Group();
    grp.name = 'af:unit:' + u.id;
    intRoot.add(grp);
    const stGroups = [], fGroups = [];

    u.storeys.forEach((st, idx) => {
      const sg = new THREE.Group();
      sg.name = 'af:storey:' + st.id;
      sg.userData.probeSkip = true;

      /* Floor plate slab (with sunlit central atrium cutout on Rotunda levels 1..4) */
      if (st.outline && st.outline.length >= 3) {
        const sh = new THREE.Shape(st.outline.map(p => new THREE.Vector2(p[0], -p[1])));
        if (u.id === 'rotunda' && st.level >= 1 && st.level <= 4) {
          const hole = new THREE.Path();
          hole.absarc(AF_PLAN.dim.ROT_X, -AF_PLAN.dim.ROT_Z, 26.8, 0, Math.PI * 2, true);
          sh.holes.push(hole);
        }
        const sGeo = new THREE.ExtrudeGeometry(sh, { depth: 0.24, bevelEnabled: false, curveSegments: 1 });
        sGeo.rotateX(-Math.PI / 2);
        const slab = new THREE.Mesh(sGeo, MAT.afPave);
        slab.position.y = st.y - 0.22;
        slab.userData.probeSkip = true;
        sg.add(slab);
      }

      /* Partition walls gapped at doorways (or broken masonry stubs in sealed/ruined zones) */
      const buf = { P: [], N: [], U: [], I: [] };
      const y0 = st.y + 0.02, fullTop = st.y + Math.min(st.h - 0.25, 3.6), DH = 2.15;
      (st.walls || []).forEach((W, wi) => {
        if (!W.pts || W.pts.length < 2) return;
        const topY = W.broken ? (st.y + Math.max(0.45, W.stub == null ? 0.95 : W.stub)) : fullTop;
        const P = W.pts, d = W.broken ? null : W.door, S = [0];
        for (let i = 0; i + 1 < P.length; i++) S.push(S[i] + Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]));
        const end = S[S.length - 1];
        const at = s => {
          let i = 0;
          while (i < P.length - 2 && S[i + 1] < s) i++;
          const l = (S[i + 1] - S[i]) || 1, f = (s - S[i]) / l;
          return [P[i][0] + (P[i + 1][0] - P[i][0]) * f, P[i][1] + (P[i + 1][1] - P[i][1]) * f];
        };
        const run = (s0, s1, ya, yb) => {
          if (s1 - s0 < 0.04) return;
          const cuts = [s0];
          S.forEach(v => { if (v > s0 + 0.01 && v < s1 - 0.01) cuts.push(v); });
          cuts.push(s1);
          for (let i = 0; i + 1 < cuts.length; i++) addWallSeg(buf, at(cuts[i]), at(cuts[i + 1]), ya, yb);
        };
        if (!d || !d.at) {
          run(0, end, y0, topY);
          return;
        }
        let sd = 0, best = 1e9, segYaw = 0;
        for (let i = 0; i + 1 < P.length; i++) {
          const a = P[i], b = P[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz;
          if (!l2) continue;
          const t = Math.max(0, Math.min(1, ((d.at[0] - a[0]) * dx + (d.at[1] - a[1]) * dz) / l2));
          const q = Math.hypot(a[0] + dx * t - d.at[0], a[1] + dz * t - d.at[1]);
          if (q < best) {
            best = q;
            sd = S[i] + (S[i + 1] - S[i]) * t;
            segYaw = Math.atan2(-dz, dx);
          }
        }
        const dw = d.w == null ? 1.1 : d.w;
        const g0 = Math.max(0, sd - dw / 2), g1 = Math.min(end, sd + dw / 2);
        run(0, g0, y0, topY);
        run(g1, end, y0, topY);
        if (topY > y0 + DH) run(g0, g1, y0 + DH, topY);

        /* Register interactive interior door in KDOOR once */
        const doorId = 'af.idoor.' + st.id + '.' + wi;
        if (!KDOOR.get(doorId) && dw >= 0.7) {
          const dRec = KDOOR.add({
            id: doorId,
            at: [d.at[0], st.y + 0.02, d.at[1]],
            yaw: segYaw,
            w: Math.min(dw, 1.8),
            h: DH,
            open: 0.35, /* Slightly ajar so cutaway views show open sightlines between rooms */
            locked: !u.kept
          });
          mountDoorMesh(dRec, sg);
        }
      });

      if (buf.I.length) {
        const wg = new THREE.BufferGeometry();
        wg.setAttribute('position', new THREE.Float32BufferAttribute(buf.P, 3));
        wg.setAttribute('normal', new THREE.Float32BufferAttribute(buf.N, 3));
        wg.setAttribute('uv', new THREE.Float32BufferAttribute(buf.U, 2));
        wg.setIndex(buf.I);
        const wm = new THREE.Mesh(wg, wallMat);
        wm.name = 'af:walls:' + st.id;
        wm.userData.probeSkip = true;
        sg.add(wm);
      }

      const fg = buildFurnitureForStorey(u, st);
      sg.add(fg);
      sg.visible = false;
      grp.add(sg);
      stGroups.push(sg);
      fGroups.push(fg);
    });

    uv = unitViews[u.id] = { group: grp, storeys: stGroups, furnGroups: fGroups, builtSocket: currentSocket };
    return uv;
  }

  /* 5. Cutaway callbacks for KHOST (99-host-cutaway.js) */
  const byId = {};
  built.units.forEach(u => { byId[u.id] = u; });

  const cutawayUnits = built.units.map(u => Object.assign({
    id: u.id,
    name: u.name,
    x: u.x,
    z: u.z,
    levels: u.storeys.map(st => ({
      y: st.y,
      h: st.h,
      name: st.levelName,
      sector: st.sector,
      rooms: st.rooms.length
    }))
  }, u.r != null ? { r: u.r } : { w: u.w, d: u.d }));

  function showUnit(cutU, storeyIdx) {
    const u = byId[cutU.id];
    if (!u) return;
    const uv = ensureUnitView(u);
    if (storeyIdx == null) {
      uv.group.visible = false;
      uv.storeys.forEach(sg => { sg.visible = false; });
      return;
    }
    uv.group.visible = true;
    uv.storeys.forEach((sg, idx) => {
      sg.visible = (idx <= storeyIdx);
    });
  }

  function barText(cutU, storeyIdx) {
    const u = byId[cutU.id], L = cutU.levels[storeyIdx];
    const sk = AF_INT.SOCKETS[currentSocket] || AF_INT.SOCKETS.refurbished;
    const secBadge = L.sector === 'living' ? '#e8c488' : L.sector === 'work' ? '#8cc4e8' : L.sector === 'rec' ? '#98dc90' : '#c49a94';
    const uv = unitViews[cutU.id];
    const pcs = (uv && uv.furnGroups[storeyIdx]) ? uv.furnGroups[storeyIdx].userData.pieceCount : 0;
    return ' storey <b>' + (storeyIdx + 1) + '</b>/' + cutU.levels.length +
      ' · <span style="color:' + secBadge + ';font-weight:bold">' + (L.sector || 'work').toUpperCase() + '</span>' +
      ' — ' + L.name +
      ' <span style="opacity:.75">(y ' + L.y.toFixed(1) + ' m · ' + L.rooms + ' rooms · ' + pcs + ' pcs · ' + sk.label + ')</span> ';
  }

  function socket(sockKey) {
    if (!AF_INT.SOCKETS[sockKey]) return false;
    runFurnishPass(sockKey);
    /* If a cutaway unit is currently open, refresh its meshes & cutaway bar immediately */
    if (typeof KHOST !== 'undefined' && KHOST.cut && KHOST.cut.on && KHOST.cut.unit) {
      const u = byId[KHOST.cut.unit.id];
      if (u) {
        ensureUnitView(u);
        showUnit(KHOST.cut.unit, KHOST.cut.storey);
        if (KHOST.cut.paint) KHOST.cut.paint();
      }
    }
    return {
      socket: currentSocket,
      placed: furnReg.placed.length,
      missing: Object.keys(furnReg.missing).length
    };
  }

  if (typeof KWALK !== 'undefined') KDOOR.walk(KWALK);

  const api = {
    built: built,
    area: area,
    cutawayUnits: cutawayUnits,
    showUnit: showUnit,
    barText: barText,
    socket: socket,
    getSocket: () => currentSocket,
    furnSummary: () => furnReg.summary(),
    simPlaces: () => AF_INT.simPlaces(AF_PLAN, built, currentSocket),
    doorsAudit: () => {
      const bad = KDOOR.list.filter(d => !(d.w > 0 && d.h > 0 && isFinite(d.at[0]) && isFinite(d.at[1]) && isFinite(d.at[2])));
      return { doors: KDOOR.list.length, locked: KDOOR.list.filter(d => d.locked).length, bad: bad.map(d => d.id) };
    }
  };
  if (typeof window !== 'undefined') window.ARCOFORTE_HOST = api;
  return api;
})();
