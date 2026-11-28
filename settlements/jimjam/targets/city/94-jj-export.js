// ================================================================= JIMJAM — P5: Godot World Export Profile (core/export) ([web])
// Connects Jimjam's scene, KTAGS, JJ_GROUND, KSTAGE, ATMOS, WATER, KDOOR fixtures, KratorInteriors (ROOM + KFURN),
// SIM (JJ1 simulation), and KCITY/JJ_LAYOUT to core/export (EXPORT.world / EXPORT.check / EXPORT.glb).
const JJ_EXPORT = (function setupJimjamExport() {
  'use strict';

  const T = JJ_PLACE.tags;
  KTAGS.page = T;

  /* Representative 310 x 280 m central monumental & residential tile spanning Raja's Palace, Great Sunray Plaza,
     High Law & Handu Court, Iron Republic Legation, surrounding streets, KDOOR portals, ROOM() interiors & SIM places */
  const BOX = [-190, -140, 120, 140];
  const PROFILE = [
    'items', 'buckets', 'materials', 'textures', 'registry',
    'terrain', 'stage', 'atmos', 'water', 'fixtures',
    'interiors', 'furniture', 'sim', 'city'
  ];

  if (typeof EXPORT === 'undefined' || !EXPORT) {
    return { available: false, BOX: BOX, PROFILE: PROFILE };
  }

  EXPORT.ground({
    terrainH: function (x, z) { return JJ_GROUND.h(x, z); },
    waterH: function () { return JJ_GROUND.lakeY; },
    step: 4
  });

  function isHidden(m) {
    for (let p = m; p; p = p.parent) {
      if (p.visible === false) return true;
    }
    return false;
  }

  function isDynamicSkipGroup(m) {
    for (let p = m; p; p = p.parent) {
      if (!p) break;
      if (p.name === 'jj_life_root' || p.name === 'jj_doors_root' || p.name === 'jj_interiors_furniture_root') return p.name;
    }
    return null;
  }

  function exportScene(ctx) {
    KTAGS.page = T;
    const box = ctx.box || BOX;
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

    return EXPORT.sceneReader({
      name: 'jimjam',
      source: 'jimjam',
      scene: scene,
      tags: T,
      owner: owner,
      skipInstanced: function (m) {
        const dg = isDynamicSkipGroup(m);
        if (dg) return dg;
        if (isHidden(m)) return 'hidden';
        return null;
      },
      skipMesh: function (m) {
        if (m.userData && m.userData.ground) return 'ground (terrain section)';
        const dg = isDynamicSkipGroup(m);
        if (dg) return dg;
        if (isHidden(m)) return 'hidden';
        return null;
      }
    }).assemble(ctx);
  }

  function exportFixtures(ctx) {
    const recs = [];
    const counts = { door: 0, kdoor: 0, front: 0 };

    if (typeof KDOOR !== 'undefined' && KDOOR && KDOOR.list) {
      for (let i = 0; i < KDOOR.list.length; i++) {
        const D = KDOOR.list[i];
        if (!D || !D.at) continue;
        if (ctx && ctx.box && !ctx.inBox(D.at[0], D.at[2])) continue;
        const at = [+D.at[0].toFixed(3), +D.at[1].toFixed(3), +D.at[2].toFixed(3)];
        const key = 'door:' + (D.preset || 'single');
        recs.push({
          id: 'kdoor/' + D.id,
          uid: KTAGS.uid('fixture', key, at),
          'class': 'fixture',
          kind: 'door',
          key: key,
          parent: null,
          at: at,
          ry: +(D.yaw == null ? 0 : D.yaw).toFixed(4),
          size: [D.w == null ? 1.2 : D.w, D.h == null ? 2.1 : D.h, D.t == null ? 0.12 : D.t],
          tags: { source: 'kdoor', style: D.style || 'panel+pull', open: D.open },
          host: { wall: 'portal', side: '+z', sill: 0 }
        });
        counts.door++;
        counts.kdoor++;
      }
    }

    for (let i = 0; i < T.records.length; i++) {
      const r = T.records[i];
      if (!r || (r['class'] !== 'building' && r['class'] !== 'landmark') || r.removed || !r.at || !r.size) continue;
      if (ctx && ctx.box && !ctx.inBox(r.at[0], r.at[2])) continue;
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
        size: [1.1, 2.1, 0.16],
        tags: { source: 'front' },
        host: { wall: 'front', side: '+z', sill: 0 }
      });
      counts.door++;
      counts.front++;
    }

    return {
      format: 'krator-fixtures',
      version: 1,
      build: 'jimjam',
      records: recs,
      counts: counts
    };
  }

  function exportCitySection() {
    const L = JJ_LAYOUT.plan;
    return {
      format: 'krator-city',
      version: 1,
      build: 'jimjam',
      pin: L.pin,
      census: L.census,
      zones: L.zones ? L.zones.length : 11,
      ways: L.ways ? L.ways.length : 0,
      structures: L.structures ? L.structures.length : 0,
      walls: L.walls ? L.walls.length : 0
    };
  }

  const by = { by: 'jimjam' };
  if (EXPORT.sceneReader) {
    const memoScene = function (ctx) {
      return ctx.memo('jimjam-scene', function () { return exportScene(ctx); });
    };
    EXPORT.register('items',     function (ctx) { return memoScene(ctx).items; }, by);
    EXPORT.register('buckets',   function (ctx) { return memoScene(ctx).buckets; }, by);
    EXPORT.register('materials', function (ctx) { return memoScene(ctx).materials; }, by);
    EXPORT.register('textures',  function (ctx) { return memoScene(ctx).textures; }, by);
  }
  EXPORT.register('fixtures', exportFixtures, by);
  EXPORT.register('interiors', function (ctx) {
    return (typeof JJ_INTERIORS !== 'undefined' && JJ_INTERIORS.exportInteriors) ? JJ_INTERIORS.exportInteriors(ctx) : null;
  }, by);
  EXPORT.register('furniture', function (ctx) {
    return (typeof JJ_INTERIORS !== 'undefined' && JJ_INTERIORS.exportFurniture) ? JJ_INTERIORS.exportFurniture(ctx) : null;
  }, by);
  EXPORT.register('sim', function () {
    return (typeof SIM !== 'undefined' && SIM && typeof SIM.export === 'function') ? SIM.export({ log: 100, nav: true }) : null;
  }, by);
  EXPORT.register('city', exportCitySection, { by: 'city' });
  EXPORT.register('stage', function (ctx) {
    if (typeof KSTAGE === 'undefined' || !ctx.box) return null;
    const b = ctx.box;
    const cx = 0.5 * (b[0] + b[2]), cz = 0.5 * (b[1] + b[3]);
    return KSTAGE.capture({
      scene: scene,
      renderer: renderer,
      at: [cx, JJ_GROUND.h(cx, cz) + 45, cz],
      sky: ctx.opt && ctx.opt.sky != null ? ctx.opt.sky : 128,
      box: b,
      step: 8,
      ground: function (x, z) { return JJ_GROUND.h(x, z); }
    });
  }, by);

  function verifyTile() {
    const world = EXPORT.world({ build: 'jimjam', box: BOX, sky: 0 });
    const chk = EXPORT.check(world, { profile: PROFILE });
    return {
      ok: !!(chk.ok && (!world.errors || world.errors.length === 0)),
      problems: chk.problems || [],
      errors: world.errors || [],
      stats: world.stats,
      sections: world.sections
    };
  }

  return {
    available: true,
    BOX: BOX,
    PROFILE: PROFILE,
    verifyTile: verifyTile
  };
})();
