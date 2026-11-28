// ================================================================= JIMJAM — Dual-Kit Socket Dispatcher, KFURN & Veil Pylons
// [draw] Restores dual-kit socket dispatch (JJ.cur -> jjSock*, VERN.cur -> JJ_ANC_SOCK) so JJ.place, dil_* and vern_*
// coexist seamlessly; wires indexed KFURN catalog batch; and draws the +-50 deg Veil Elongation Gnomon Pylons.

(function () {
  const jjS = {
    beam: typeof jjSockBeam === 'function' ? jjSockBeam : null,
    box: typeof jjSockBox === 'function' ? jjSockBox : null,
    quad: typeof jjSockQuad === 'function' ? jjSockQuad : null,
    plane4: typeof jjSockPlane4 === 'function' ? jjSockPlane4 : null,
    decal: typeof jjSockDecal === 'function' ? jjSockDecal : null,
    poly: typeof jjSockPoly === 'function' ? jjSockPoly : null
  };
  const anc = typeof JJ_ANC_SOCK !== 'undefined' ? JJ_ANC_SOCK : {};
  ['beam', 'box', 'quad', 'plane4', 'decal', 'poly'].forEach(function (k) {
    const jf = jjS[k];
    const af = anc[k];
    if (!jf && !af) return;
    globalThis[k] = function () {
      const fn = (typeof JJ !== 'undefined' && JJ.cur) ? (jf || af) : (af || jf);
      return fn.apply(this, arguments);
    };
  });
})();

const JJ_CITYGLUE = (function () {
  /* Indexed catalog furniture batch on core/furnish (KFURN + KratorFurniture) */
  let furnApi = {
    on: false,
    placeWorld: function () { return null; },
    flush: function () { return null; },
    summary: function () { return { on: false, placed: 0, missing: {} }; }
  };

  if (typeof KFURN !== 'undefined' && typeof KratorFurniture !== 'undefined') {
    KratorFurniture.setDetail(0.5);
    const T = (KTAGS.page = KTAGS.page || KTAGS.create({ build: 'jimjam' }));
    const R = KFURN.create(Object.assign(
      typeof KFURN.flags === 'function' ? KFURN.flags(false) : { on: true, interiorsOn: false },
      {
        catalog: KFURN.catalogOf(KratorFurniture),
        interiors: typeof KratorInteriors !== 'undefined' ? KratorInteriors : null,
        tags: T,
        seed: function (o, ctx, reg) { return reg.placed.length + 7451; },
        finish: function (rec) {
          rec.x = Math.round(rec.x * 1000) / 1000;
          rec.y = Math.round(rec.y * 1000) / 1000;
          rec.z = Math.round(rec.z * 1000) / 1000;
          rec.ry = Math.round(rec.ry * 10000) / 10000;
        },
        draw: function (rec, ctx) {
          const w = ctx && typeof ctx.wealth === 'number' ? ctx.wealth : 0.72;
          const b = KFURN.drawRec(R, rec, w);
          if (b && b.error && typeof reportErr === 'function') {
            reportErr('JJ_CITYGLUE ' + rec.key + ' ' + b.error);
          }
        }
      }
    ));
    KFURN.useBatch(R, KratorFurniture, typeof KratorInteriors !== 'undefined' ? KratorInteriors : null, { indexed: true });

    furnApi = {
      on: true,
      placeWorld: function (cands, x, y, z, ry, bId, wNum) {
        let key = null;
        const list = Array.isArray(cands) ? cands : [cands];
        for (let i = 0; i < list.length; i++) {
          if (KratorFurniture.has(list[i])) { key = list[i]; break; }
        }
        if (!key) return null;
        return R.place(key, x, y, z, ry || 0, {}, [0, 0, 0, 0], {
          building: bId || 'pilgrim-market',
          wealth: wNum == null ? 0.72 : wNum
        });
      },
      flush: function (targetScene) {
        if (R && typeof R.flush === 'function') R.flush(targetScene);
      },
      summary: function () {
        return R && typeof R.summary === 'function' ? R.summary() : { on: true, placed: R.placed.length, missing: R.missing };
      }
    };
  }

  /* Place the two +-50 deg Veil Elongation Alabaster & Gold Gnomon Pylons on the Solar Acropolis western parapet */
  function placeVeilPylons(sc) {
    const pylons = [
      [-925, -175, Math.PI - 294.04 * Math.PI / 180, 'North Veil +50 deg Elongation Pylon (Az 294 deg over Lake)'],
      [-895, 35,   Math.PI - 194.04 * Math.PI / 180, 'South Veil -50 deg Elongation Pylon (Az 194 deg over Cut)']
    ];
    for (let i = 0; i < pylons.length; i++) {
      const p = pylons[i];
      const y = JJ_GROUND.h(p[0], p[1]);
      if (typeof JJFURN !== 'undefined') {
        JJFURN.place(sc, 'jj_furn_statue', p[0], p[1], p[2], { y: y });
        JJFURN.place(sc, 'jj_furn_brazier', p[0] + 2.4, p[1], 0, { y: y, lit: true });
      }
    }
  }

  return {
    furn: furnApi,
    placeVeilPylons: placeVeilPylons
  };
})();
