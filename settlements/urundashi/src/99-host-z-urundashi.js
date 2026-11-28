/* ================================================================= URUNDASHI HOST CAMERA, SHADOW & INSPECTOR EXTENSIONS
   [web] Runs immediately after core/engine/99-host-take.js: tracks directional sun shadows in 3D across Urundashi's steppe
   bench and Dubnosriba valley, raises orbit maxR for panoramic steppe/ring views, enriches click-to-inspect for instanced lots
   and terrain zones, and displays live population + economy telemetry in the host HUD. */

(function () {
  if (typeof sun !== 'undefined' && sun.shadow && sun.shadow.camera) {
    const c = sun.shadow.camera;
    c.left = -180;
    c.right = 180;
    c.top = 180;
    c.bottom = -180;
    c.near = 20;
    c.far = 1150;
    c.updateProjectionMatrix();
  }

  if (typeof camera !== 'undefined') {
    camera.far = 28000;
    camera.updateProjectionMatrix();
  }
  if (typeof scene !== 'undefined' && scene.fog && scene.fog.isFogExp2) {
    scene.fog.density = 0.00018;
  }

  if (typeof KHOST !== 'undefined') {
    if (KHOST.cam && KHOST.cam.ctl) {
      KHOST.cam.ctl.maxR = 9000;
    }
    KHOST.on(function urundashiShadowFrame() {
      const C = KHOST.cam;
      if (!C || !C.ctl || typeof sun === 'undefined') return;
      const tg = C.ctl.walk ? camera.position : C.ctl.target;
      const ty = isFinite(tg.y) ? tg.y : urundashiH(tg.x, tg.z);
      sun.target.position.set(tg.x, ty, tg.z);
      sun.position.set(tg.x + LIGHTDIR.x * 460, ty + LIGHTDIR.y * 460, tg.z + LIGHTDIR.z * 460);
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
          const tier = UR.tierAt(p.x, p.z);
          return 'Urundashi Terrain (' + tier + ', ' + Math.round(p.y + UR.DATUM) + ' m ASL)\n' +
            p.x.toFixed(1) + ', ' + p.y.toFixed(1) + ', ' + p.z.toFixed(1);
        }
      }
      return baseDescribe ? baseDescribe(first, hits) : '(nothing)';
    };

    SV_TAKE.stats = function () {
      const U = window._urundashi;
      if (!U) return 'records ' + REG.length;
      const s = U.sim;
      return 'Urundashi ' + U.census.total.toLocaleString() + ' (+' + U.ringPeople.toLocaleString() + ' ring)  ·  buildings ' +
        U.totalBuildings + ' (' + U.heroCount + ' hero, ' + U.instancedCount + ' inst, ' + U.vacantCount + ' under construction)' +
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
      if (!part) return EXPORT.world({ build: 'urundashi' });
      return EXPORT.world({ build: 'urundashi', sections: [part] })[part];
    };
  }
})();
