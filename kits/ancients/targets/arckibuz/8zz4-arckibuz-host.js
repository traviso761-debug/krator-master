/* ================================================================= ARCKIBUZ — [draw] interiors host & settlement culture socket
   Wires AKB_INTERIORS into KratorAncientsInteriors.KIT.arckibuz after src/8zz-interiors.js and before src/90-scene.js.
   Splits each decay site into 6 organ sub-sites in AIK.sites / AIK.byId:
     - d = 0 (Intact):      arckibuz/0/<area> (d: 0, state: 'intact', furnished in 'ancient')
     - d = 1 (Ruined):      arckibuz/1/<area> (d: 1, state: 'ruined', unfurnished socket, 45% broken partitions)
     - d = 3 (Refurbished): inhabited core sub-sites arckibuz/3/{pit,community,housing-n,housing-s,housing-w} built whole
                            (d: 5, state: 'intact') and immediately furnished in 'post-apoc' ('occupied' settlement dress),
                            while arckibuz/3/dormant (East Housing Wing + Deep Production Bay) stays d: 3, state: 'rehab',
                            unfurnished (pieces: 0) with 20% broken partitions ready for settlement expansion.
   Exposes window._api.arckibuzSocket(culture, opts) so any settlement culture can re-dress Arckibuz. */

if (typeof KratorAncientsInteriors !== 'undefined' && typeof AKB_INTERIORS !== 'undefined' && typeof interiorBegin === 'function') {
  (function () {
    const AI = KratorAncientsInteriors;
    AI.KIT.arckibuz = AKB_INTERIORS.entry(AI);

    /* Ensure every settlement culture bundled for arckibuz has a complete recipe dress */
    if (AI.DRESS) {
      if (!AI.DRESS['post-apoc']) AI.DRESS['post-apoc'] = Object.assign({}, AI.DRESS.occupied);
      ['iziz', 'pylon', 'nomad', 'eastabyss', 'xanadu'].forEach(c => {
        if (!AI.DRESS[c]) AI.DRESS[c] = Object.assign({}, AI.DRESS.occupied);
      });
    }

    const AREAS = ['pit', 'community', 'housing-n', 'housing-s', 'housing-w', 'dormant'];
    let filterMode = null; /* null | 'inhabited' | 'dormant' */

    const origKitPlan = AI.kitPlan;
    AI.kitPlan = function (type, d, o) {
      const P = origKitPlan.call(AI, type, d, o);
      if (type !== 'arckibuz' || !filterMode) return P;
      if (filterMode === 'inhabited') {
        P.buildings = P.buildings.filter(b => b.area !== 'dormant');
        P.state = 'intact';
        P.furnish = false; /* furnished immediately in 'post-apoc' right after interiorPass */
      } else if (filterMode === 'dormant') {
        P.buildings = P.buildings.filter(b => b.area === 'dormant');
        P.state = 'rehab';
        P.furnish = false;
      }
      return P;
    };

    function splitSiteByArea(S, prefix, stateTitle, areaList) {
      const subs = [];
      for (let ai = 0; ai < areaList.length; ai++) {
        const area = areaList[ai];
        const bs = S.plan.buildings.filter(b => b.area === area);
        if (!bs.length) continue;
        const ids = new Set(bs.map(b => b.id));
        const ys = new Map();
        let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
        for (let bi = 0; bi < bs.length; bi++) {
          const b = bs[bi];
          for (let si = 0; si < b.storeys.length; si++) {
            const st = b.storeys[si];
            const yKey = Math.round(st.y * 10);
            if (!ys.has(yKey)) ys.set(yKey, { id: st.id, y: st.y, h: st.h, b: b.id });
            for (let qi = 0; qi < st.outline.length; qi++) {
              const q = st.outline[qi];
              if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0];
              if (q[1] < z0) z0 = q[1]; if (q[1] > z1) z1 = q[1];
            }
          }
        }
        const recs = S.recs.filter(r => ids.has(String(r.building).replace(/^arckibuz\./, '')));
        const fRooms = S.furniture ? S.furniture.rooms.filter(r => ids.has(r.R.building)) : [];
        const tplSet = new Set(fRooms.map(r => r.template));
        const F = S.furniture ? Object.assign({}, S.furniture, {
          pieces: recs.length,
          templates: tplSet.size,
          rooms: fRooms
        }) : null;
        const AREA_CLIP_BOX = {
          'pit':       [-150, 236, -94, 148],
          'community': [-94,  94,  -72,  72],
          'housing-n': [-76,  76,  -66, -24],
          'housing-s': [-76,  76,   24,  66],
          'housing-w': [-94, -34,  -38,  38],
          'dormant':   [ 34,  94,  -80,  38]
        };
        const label = AKB_INTERIORS.AREA_LABELS[area] || area;
        subs.push(Object.assign({}, S, {
          id: prefix + '/' + area,
          name: 'Arckibuz (' + stateTitle + ') — ' + label,
          box: AREA_CLIP_BOX[area] || [x0, x1, z0, z1],
          storeys: [...ys.values()].sort((a, b) => a.y - b.y),
          plan: Object.assign({}, S.plan, { buildings: bs }),
          recs,
          furniture: F,
          group: null,
          rooms: bs.reduce((n, b) => n + b.storeys.reduce((k, st) => k + st.rooms.length, 0), 0)
        }));
      }
      const idx = AIK.sites.indexOf(S);
      if (idx >= 0) AIK.sites.splice(idx, 1, ...subs);
      delete AIK.byId[S.id];
      for (let i = 0; i < subs.length; i++) AIK.byId[subs[i].id] = subs[i];
      return subs;
    }

    const origPass = interiorPass;
    interiorPass = function (m, G) {
      if (!m || m.k !== 'arckibuz') return origPass(m, G);

      if (m.d === 0 || m.d === 1) {
        origPass(m, G);
        const S = AIK.byId['arckibuz/' + m.d];
        if (S) {
          splitSiteByArea(S, 'arckibuz/' + m.d, m.d === 0 ? 'intact' : 'ruin', AREAS);
          AIK.furnished = AIK.sites.filter(s => s.furniture && s.furniture.pieces > 0).length;
          AIK.pieces = AIK.sites.reduce((n, s) => n + (s.furniture ? s.furniture.pieces : 0), 0);
        }
        return;
      }

      if (m.d === 3) {
        /* 1. Refurbished inhabited organs: whole partitions & doors (d = 5, state = 'intact'), furnished in 'post-apoc' */
        filterMode = 'inhabited';
        try {
          origPass({ k: 'arckibuz', d: 5, gx: m.gx, gz: m.gz, mark: m.mark }, G);
        } finally {
          filterMode = null;
        }
        const S5 = AIK.byId['arckibuz/5'];
        if (S5) {
          aikSocket('arckibuz/5', 'post-apoc', { cultures: null, seed: 3 });
          splitSiteByArea(S5, 'arckibuz/3', 'refurbished', AREAS.filter(a => a !== 'dormant'));
        }

        /* 2. Bulkheaded expansion wing: d = 3, state = 'rehab', 20% broken partitions, unfurnished socket (pieces = 0) */
        filterMode = 'dormant';
        try {
          origPass({ k: 'arckibuz', d: 3, gx: m.gx, gz: m.gz, mark: {} }, G);
        } finally {
          filterMode = null;
        }
        const S3 = AIK.byId['arckibuz/3'];
        if (S3) {
          splitSiteByArea(S3, 'arckibuz/3', 'dormant socket', ['dormant']);
        }

        AIK.furnished = AIK.sites.filter(s => s.furniture && s.furniture.pieces > 0).length;
        AIK.pieces = AIK.sites.reduce((n, s) => n + (s.furniture ? s.furniture.pieces : 0), 0);
      }
    };

    /* Re-dress Arckibuz's refurbished sub-sites (and optionally the dormant expansion wing) in any settlement culture. */
    function akbSocketAll(culture, opts) {
      const o = opts || {};
      const cReq = culture || 'post-apoc';
      const useCult = cReq === 'pylon' ? 'iziz' : cReq;
      const useList = cReq === 'ancient' ? ['ancient'] : (cReq === 'pylon' ? ['pylon', 'iziz', 'generic', 'scrap'] : null);
      const targets = AIK.sites.filter(s => s.id.indexOf('arckibuz/3/') === 0 && (o.includeDormant || s.state === 'intact'));
      let total = 0;
      for (let i = 0; i < targets.length; i++) {
        const S = targets[i];
        if (o.includeDormant && S.state !== 'intact') S.state = 'intact';
        total += aikSocket(S.id, useCult, { cultures: useList, seed: o.seed == null ? 3 : o.seed });
      }
      AIK.furnished = AIK.sites.filter(s => s.furniture && s.furniture.pieces > 0).length;
      AIK.pieces = AIK.sites.reduce((n, s) => n + (s.furniture ? s.furniture.pieces : 0), 0);
      if (typeof AIK_CLIP !== 'undefined' && AIK_CLIP.site && AIK_CLIP.site.id.indexOf('arckibuz/3/') === 0) {
        aikOpen(AIK_CLIP.site.id, AIK_CLIP.storey);
      }
      return total;
    }

    const bindApi = () => {
      if (typeof window !== 'undefined' && window._api && !window._api.arckibuzSocket) {
        window._api.arckibuzSocket = akbSocketAll;
      }
    };
    Promise.resolve().then(bindApi);
    if (typeof tick === 'function') tick(bindApi);
  })();
}
