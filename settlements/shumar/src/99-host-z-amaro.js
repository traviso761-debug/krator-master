/* ================================================================= AMARO HOST CAMERA, SHADOW & INSPECTOR EXTENSIONS (Step A2)
   [web] Runs immediately after core/engine/99-host-take.js: tracks directional sun shadows in 3D across Amaro's 263 m
   relief, raises orbit maxR for panoramic plateau views, enriches click-to-inspect for instanced lots, construction sites,
   and canyon tiers, and displays live population + economy telemetry in the host HUD. */

(function () {
  if (typeof sun !== 'undefined' && sun.shadow && sun.shadow.camera) {
    const c = sun.shadow.camera;
    c.left = -175;
    c.right = 175;
    c.top = 175;
    c.bottom = -175;
    c.near = 20;
    c.far = 1250;
    c.updateProjectionMatrix();
  }

  if (typeof KHOST !== 'undefined') {
    if (KHOST.cam && KHOST.cam.ctl) {
      KHOST.cam.ctl.maxR = 9000;
    }
    /* Follow target elevation y so +241 m plateau and 0 m gorge both sit inside the shadow box */
    KHOST.on(function amaroShadowFrame() {
      const C = KHOST.cam;
      if (!C || !C.ctl || typeof sun === 'undefined') return;
      const tg = C.ctl.walk ? camera.position : C.ctl.target;
      const ty = isFinite(tg.y) ? tg.y : amaroH(tg.x, tg.z);
      sun.target.position.set(tg.x, ty, tg.z);
      sun.position.set(tg.x + LIGHTDIR.x * 480, ty + LIGHTDIR.y * 480, tg.z + LIGHTDIR.z * 480);
      sun.target.updateMatrixWorld();
    }, 'view');
  }

  if (typeof SV_TAKE !== 'undefined') {
    const baseDescribe = SV_TAKE.inspect;
    SV_TAKE.inspect = function (first, hits) {
      for (let i = 0; i < hits.length; i++) {
        const h = hits[i];
        const o = h.object;
        if (!o) continue;
        if (o.isInstancedMesh && o.userData && o.userData.recs && h.instanceId != null) {
          const rec = o.userData.recs[h.instanceId];
          if (rec) {
            const p = h.point;
            const d = DEFS[rec.key];
            const title = (d ? d.name : rec.key) + (rec.why ? ' — ' + rec.why : '');
            return title + '\n' + rec.district + ' · caste ' + (rec.caste || 'hearth') + ' · ' + rec.key +
              (rec.people ? ' · pop ' + rec.people : '') + '\n' + p.x.toFixed(1) + ', ' + p.y.toFixed(1) + ', ' + p.z.toFixed(1);
          }
        }
        if (o.userData && o.userData.isGround) {
          const p = h.point;
          const tier = AM.tierAt(p.x, p.z);
          return 'Amaro Terrain (' + tier + ', ' + Math.round(p.y + AM.DATUM) + ' m ASL)\n' +
            p.x.toFixed(1) + ', ' + p.y.toFixed(1) + ', ' + p.z.toFixed(1);
        }
      }
      return baseDescribe ? baseDescribe(first, hits) : '(nothing)';
    };

    SV_TAKE.stats = function () {
      const A = window._amaro;
      if (!A) return 'records ' + REG.length;
      const s = A.sim;
      return 'Greater Amaro ' + A.census.total.toLocaleString() + ' (+' + A.ringPeople.toLocaleString() + ' ring)  ·  buildings ' +
        A.totalBuildings + ' (' + A.heroCount + ' hero, ' + A.instancedCount + ' inst, ' + A.vacantCount + ' under construction)' +
        (s ? '\nsim day ' + s.day + ' (' + s.seasons.join(', ') + ')' : '') +
        (SVIX && SVIX.on ? '  ·  interiors ' + SVIX.pieces : '') +
        (NIGHT.on ? '  ·  night' : '');
    };
  }

  if (typeof window._api === 'object' && window._api && typeof EXPORT !== 'undefined') {
    window._api.exportParts = function () {
      return ['terrain', 'city', 'buckets', 'materials', 'water', 'registry', 'atmos'];
    };
    window._api.export = function (part) {
      if (!part) return EXPORT.world({ build: 'shumar' });
      return EXPORT.world({ build: 'shumar', sections: [part] })[part];
    };
  }
})();
