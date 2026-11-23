// ================================================================= TORUS — 94: Stage 6 Godot World Export Profile ([web])
// Connects Torus's scene, TORUS_TAGS, KHAZ (Feral Domes & Wheel-rim fall zones), torusGroundAt, KDOOR fixtures, KSTAGE, ATMOS, SIM, and KCITY to core/export.

const TORUS_KCITY = TORUS.buildKCity(TORUS_PLAN, TORUS_TAGS);

const TORUS_EXPORT = (function setupTorusExport() {
  KTAGS.page = TORUS_TAGS;

  // Representative tile spanning Terraces T1..T5, Quarantined Feral Ag-Domes, Forest Ring SE Foot/Wheel & Rim Tether-Winch Stations
  const BOX = [80, 80, 520, 520];
  const PROFILE = [
    'items', 'buckets', 'materials', 'textures', 'registry', 'hazards',
    'terrain', 'stage', 'atmos', 'fixtures', 'sim', 'city',
    'interiors?', 'furniture?'
  ];

  if (typeof EXPORT === 'undefined' || !EXPORT) {
    return { BOX: BOX, PROFILE: PROFILE, available: false };
  }

  if (typeof KCITY !== 'undefined' && KCITY && typeof KCITY.registerExport === 'function') {
    KCITY.registerExport();
  }
  TORUS.simExportRegister();
  EXPORT.ground({ terrainH: torusGroundAt, step: 6 });

  function isHidden(m) {
    for (let p = m; p; p = p.parent) {
      if (p.visible === false) return true;
    }
    return false;
  }

  function isLifeMesh(m) {
    for (let p = m; p; p = p.parent) {
      if (p === TORUS_LIFE.group || p.name === 'torus_life_root') return true;
    }
    return false;
  }

  function exportScene(ctx) {
    KTAGS.page = TORUS_TAGS;
    const T = TORUS_TAGS;
    const box = ctx.box || [-1200, -1200, 1200, 1200];
    const vols = [];
    for (let i = 0; i < T.records.length; i++) {
      const r = T.records[i];
      if (!r || !r.at || !r.size || r.removed || r.set) continue;
      const cls = r['class'];
      if (cls === 'flora' || cls === 'life' || cls === 'fixture' || cls === 'part' || cls === 'furniture') continue;
      if (!T.get(r.id)) continue;
      const rad = Math.max(r.size[0], r.size[1]) * 0.5 + 1.5;
      if (r.at[0] + rad < box[0] - 4 || r.at[0] - rad > box[2] + 4 || r.at[2] + rad < box[1] - 4 || r.at[2] - rad > box[3] + 4) continue;
      const ry = r.ry == null ? 0 : r.ry;
      vols.push({
        id: r.id,
        x: r.at[0],
        z: r.at[2],
        c: Math.cos(-ry),
        s: Math.sin(-ry),
        hw: r.size[0] * 0.5 + 1.0,
        hd: r.size[1] * 0.5 + 1.0,
        area: r.size[0] * r.size[1]
      });
    }

    function owner(x, y, z) {
      let best = null;
      for (let i = 0; i < vols.length; i++) {
        const v = vols[i];
        const dx = x - v.x, dz = z - v.z;
        const u = dx * v.c - dz * v.s;
        const w = dx * v.s + dz * v.c;
        if (Math.abs(u) <= v.hw && Math.abs(w) <= v.hd && (!best || v.area < best.area)) {
          best = v;
        }
      }
      return best ? best.id : null;
    }

    const boxMaxR = Math.max(
      Math.hypot(box[0], box[1]),
      Math.hypot(box[2], box[1]),
      Math.hypot(box[2], box[3]),
      Math.hypot(box[0], box[3])
    );
    function isHinterlandOnly(m) {
      if (boxMaxR > 1150) return false;
      for (let p = m; p; p = p.parent) {
        if (p === TORUS_HINTERLAND_GROUP || p.name === 'torus_hinterland_root') return true;
      }
      return false;
    }

    return EXPORT.sceneReader({
      name: 'torus',
      source: 'torus',
      scene: scene,
      tags: T,
      owner: owner,
      skipInstanced: function (m) {
        if (isLifeMesh(m)) return 'citizens (sim section)';
        if (isHinterlandOnly(m)) return 'outside box (hinterland)';
        if (isHidden(m)) return 'hidden';
        return null;
      },
      skipMesh: function (m) {
        if (m.userData && m.userData.ground) return 'ground (terrain section)';
        if (isHinterlandOnly(m)) return 'outside box (hinterland)';
        if (isHidden(m)) return 'hidden';
        return null;
      }
    }).assemble(ctx);
  }

  function exportFixtures(ctx) {
    const T = TORUS_TAGS;
    const recs = [];
    const counts = { door: 0, kdoor: 0, front: 0 };

    // 1. Interactive KDOOR portals/quarantine bulkheads/interior doors inside ctx.box
    for (let i = 0; i < KDOOR.list.length; i++) {
      const D = KDOOR.list[i];
      if (!D || !D.at || !ctx.inBox(D.at[0], D.at[2])) continue;
      const at = [+D.at[0].toFixed(3), +D.at[1].toFixed(3), +D.at[2].toFixed(3)];
      const key = 'door:' + (D.preset || 'hinged');
      recs.push({
        id: 'kdoor/' + D.id,
        uid: KTAGS.uid('fixture', key, at),
        'class': 'fixture',
        kind: 'door',
        key: key,
        parent: null,
        at: at,
        ry: +(D.yaw == null ? 0 : D.yaw).toFixed(4),
        size: [D.w == null ? 1.2 : D.w, D.h == null ? 2.1 : D.h, D.t == null ? 0.16 : D.t],
        tags: { source: 'kdoor', style: D.style || 'plank+ring', open: D.open, locked: !!D.locked },
        host: { wall: 'portal', side: '+z', sill: 0 }
      });
      counts.door++;
      counts.kdoor++;
    }

    // 2. Terrace tankhome, Voth Extension & landmark street-front doors inside ctx.box
    for (let i = 0; i < T.records.length; i++) {
      const r = T.records[i];
      if (!r || (r['class'] !== 'building' && r['class'] !== 'landmark') || r.removed || !r.at || !r.size) continue;
      if (!ctx.inBox(r.at[0], r.at[2])) continue;
      const ry = r.ry == null ? 0 : r.ry;
      const c = Math.cos(ry), s = Math.sin(ry);
      const dz = r.size[1] * 0.5;
      const at = [+(r.at[0] + dz * s).toFixed(3), +r.at[1].toFixed(3), +(r.at[2] + dz * c).toFixed(3)];
      const key = 'door:' + r.key;
      recs.push({
        id: r.id + '/door0',
        uid: KTAGS.uid('fixture', key, at),
        'class': 'fixture',
        kind: 'door',
        key: key,
        parent: r.id,
        at: at,
        ry: +ry.toFixed(4),
        size: [1.0, 2.0, 0.18],
        tags: { source: 'front' },
        host: { wall: 'front', side: '+z', sill: 0 }
      });
      counts.door++;
      counts.front++;
    }

    return {
      format: 'krator-fixtures',
      version: 1,
      build: 'torus',
      records: recs,
      counts: counts
    };
  }

  if (EXPORT.sceneReader) {
    const by = { by: 'torus' };
    const memoScene = function (ctx) {
      return ctx.memo('torus-scene', function () { return exportScene(ctx); });
    };
    EXPORT.register('items', function (ctx) { return memoScene(ctx).items; }, by);
    EXPORT.register('buckets', function (ctx) { return memoScene(ctx).buckets; }, by);
    EXPORT.register('materials', function (ctx) { return memoScene(ctx).materials; }, by);
    EXPORT.register('textures', function (ctx) { return memoScene(ctx).textures; }, by);
    EXPORT.register('fixtures', exportFixtures, by);
    EXPORT.register('stage', function (ctx) {
      if (typeof KSTAGE === 'undefined' || !ctx.box) return null;
      const b = ctx.box;
      const cx = 0.5 * (b[0] + b[2]), cz = 0.5 * (b[1] + b[3]);
      return KSTAGE.capture({
        at: [cx, torusGroundAt(cx, cz) + 55, cz],
        sky: ctx.opt.sky == null ? 256 : ctx.opt.sky,
        skyNear: Math.min(b[2] - b[0], b[3] - b[1]) * 0.5,
        box: b,
        step: ctx.opt.ground == null ? 10 : ctx.opt.ground,
        ground: torusGroundAt
      });
    }, by);
    EXPORT.register('interiors', function () { return null; }, by);
    EXPORT.register('furniture', function () { return null; }, by);
  }

  let cachedVerification = null;
  function verifyExport(boxOpt) {
    if (!boxOpt && cachedVerification) return cachedVerification;
    KTAGS.page = TORUS_TAGS;
    const b = boxOpt || BOX;
    const w = EXPORT.world({ box: b, build: 'torus', sky: 0, ground: 16 });
    const chk = EXPORT.check(w, { uid: KTAGS.uid, profile: PROFILE });
    const packed = EXPORT.glb(w);
    const dv = new DataView(packed.glb.buffer, packed.glb.byteOffset, packed.glb.byteLength);
    const magicOk = packed.glb.byteLength > 28 && dv.getUint32(0, true) === 0x46546C67;
    const res = {
      world: w,
      check: chk,
      glbBytes: packed.glb.byteLength,
      glbNodes: packed.stats.nodes,
      magicOk: magicOk
    };
    if (!boxOpt) cachedVerification = res;
    return res;
  }

  return {
    BOX: BOX,
    PROFILE: PROFILE,
    available: true,
    verify: verifyExport
  };
})();
