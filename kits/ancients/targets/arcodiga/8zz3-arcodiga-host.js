// ================================================================= ARCODIGA — interiors host & culture socket
// Connects ADG_INTERIORS (8av1-arcodiga-interiors.js) to the Ancients kit's interiors pass (src/8zz-interiors.js):
//   - Splits each site into 6 organ sub-sites (wing, spine, crest, ribs, dormant, works) so the "Interior" cut-away
//     clips one organ at a time and steps through its storey heights with `[` and `]`.
//   - Intact (d=0): all 6 organs whole and furnished in `ancient`.
//   - Ruined (d=1): all 6 organs broken-partition sockets (unfurnished).
//   - Refurbished centerpiece (d=3): the 5 active organs (wing, spine, crest, ribs, works) are built whole (d=5,
//     operable core/door leaves) and furnished in the settlement refurbishment socket (`post-apoc` / `occupied` by
//     default, or `?culture=<name>`), while `dormant` (outer Living-Working ribs) stays a `rehab` socket behind bulkheads.
//   - Exposes `window._api.arcodigaSocket(culture, opts)` so any settlement culture (`republican`, `iziz`, `eternian`,
//     `xanadu`, `pylon`, `post-apoc`, `ancient`) can re-dress the refurbished centerpiece live.

if (typeof KratorAncientsInteriors !== 'undefined' && typeof ADG_INTERIORS !== 'undefined' && typeof interiorBegin === 'function') {
  (function () {
    const AI = KratorAncientsInteriors;
    const AREA_ORDER = ['wing', 'spine', 'crest', 'ribs', 'dormant', 'works'];
    const AREA_NAME = {
      wing: 'Stiffening Wing (Highways, Research & Learning)',
      spine: 'Axial City Center & Commercial Spine',
      crest: 'Crest Promenade & VTOL Airport',
      ribs: 'Living-Working Buttresses & Central Prows',
      dormant: 'Outer Living-Working Ribs (Dormant Sector)',
      works: 'Power House & Automated Industries'
    };
    const AREA_BOX = {
      wing: [-1040, 1040, 108, 302],
      spine: [-54, 54, -460, 212],
      crest: [-620, 620, -565, -20],
      ribs: [-510, 510, -268, 125],
      dormant: [-720, 720, -268, 125],
      works: [-400, 400, -108, 105]
    };

    /* Register occupied/refurbished hall-recipe dresses for every bundled settlement culture */
    const SETTLEMENT_CULTURES = ['post-apoc', 'republican', 'iziz', 'eternian', 'xanadu', 'pylon'];
    if (AI.DRESS) {
      for (const c of SETTLEMENT_CULTURES) {
        if (!AI.DRESS[c]) AI.DRESS[c] = Object.assign({}, AI.DRESS.occupied, ADG_INTERIORS.DRESS_REFURB);
      }
    }

    let activeCulture = 'post-apoc';
    try {
      if (typeof location !== 'undefined' && location.search) {
        const m = /[?&]culture=([a-z-]+)/i.exec(location.search);
        if (m && (m[1] === 'ancient' || SETTLEMENT_CULTURES.indexOf(m[1]) >= 0)) activeCulture = m[1];
      }
    } catch (e) { /* ignore */ }

    AI.KIT.arcodiga = ADG_INTERIORS.entry(AI, { culture: 'ancient' });

    function splitIntoOrgans(S, prefix, labelSuffix) {
      const idx = AIK.sites.indexOf(S);
      if (idx < 0) return [];
      const subs = [];
      for (const area of AREA_ORDER) {
        const bs = S.plan.buildings.filter(b => b.area === area);
        if (!bs.length) continue;
        const ids = new Set(bs.map(b => b.id)), ys = new Map();
        let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
        for (const b of bs) {
          for (const st of b.storeys) {
            if (!ys.has(st.y)) ys.set(st.y, { id: st.id, y: st.y, h: st.h, b: b.id });
            for (const q of st.outline) {
              x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]);
              z0 = Math.min(z0, q[1]); z1 = Math.max(z1, q[1]);
            }
          }
        }
        const ab = AREA_BOX[area];
        if (ab) {
          x0 = Math.min(x0, ab[0]); x1 = Math.max(x1, ab[1]);
          z0 = Math.min(z0, ab[2]); z1 = Math.max(z1, ab[3]);
        }
        const recs = S.recs.filter(r => ids.has(String(r.building).slice('arcodiga.'.length)));
        const F = S.furniture ? Object.assign({}, S.furniture, {
          pieces: recs.length,
          rooms: S.furniture.rooms.filter(r => ids.has(r.R.building))
        }) : null;
        const subId = prefix + '/' + area;
        subs.push(Object.assign({}, S, {
          id: subId,
          name: 'Arcodiga (' + labelSuffix + ') — ' + AREA_NAME[area],
          box: [x0, x1, z0, z1],
          storeys: Array.from(ys.values()).sort((a, b) => a.y - b.y),
          plan: Object.assign({}, S.plan, { buildings: bs }),
          recs: recs,
          furniture: F,
          group: null,
          rooms: bs.reduce((n, b) => n + b.storeys.reduce((k, st) => k + st.rooms.length, 0), 0)
        }));
      }
      AIK.sites.splice(idx, 1, ...subs);
      delete AIK.byId[S.id];
      for (const sub of subs) AIK.byId[sub.id] = sub;
      return subs;
    }

    const origKitPlan = AI.kitPlan;
    let modeFilter = null;
    AI.kitPlan = function (t, d, o) {
      if (t !== 'arcodiga' || !modeFilter) return origKitPlan.call(AI, t, d, o);
      const prevEntry = AI.KIT.arcodiga;
      AI.KIT.arcodiga = ADG_INTERIORS.entry(AI, modeFilter);
      try {
        const P = origKitPlan.call(AI, t, modeFilter.planDecay, o);
        P.furnish = modeFilter.furnish;
        P.state = modeFilter.state;
        P.culture = modeFilter.culture;
        return P;
      } finally {
        AI.KIT.arcodiga = prevEntry;
      }
    };

    const origPass = interiorPass;
    interiorPass = function (m, G) {
      if (!m || m.k !== 'arcodiga') { return origPass(m, G); }
      const c0 = G.children.length;
      if (m.d === 0) {
        origPass(m, G);
        const S0 = AIK.byId['arcodiga/0'];
        if (S0) splitIntoOrgans(S0, 'arcodiga/0', 'intact');
      } else if (m.d === 1) {
        origPass(m, G);
        for (let i = c0; i < G.children.length; i++) {
          if (G.children[i].isMesh) G.children[i].userData.interiorFloors = true;
        }
        const S1 = AIK.byId['arcodiga/1'];
        if (S1) splitIntoOrgans(S1, 'arcodiga/1', 'ruin');
      } else if (m.d === 3) {
        /* 1. Active refurbished organs: whole partitions (d=5), operable door leaves, furnished in activeCulture */
        const origFurnishPlan = AI.furnishPlan;
        AI.furnishPlan = function (plan, adapter, opts) {
          return origFurnishPlan.call(AI, plan, adapter, Object.assign({}, opts || {},
            activeCulture === 'ancient' ? { seed: 1 } : { culture: activeCulture, all: true, seed: 1 }));
        };
        try {
          for (const area of ['wing', 'spine', 'crest', 'ribs', 'works']) {
            modeFilter = { area: area, culture: activeCulture, furnish: true, state: 'intact', planDecay: 5 };
            origPass({ k: 'arcodiga', d: 5, gx: m.gx, gz: m.gz, mark: {} }, G);
            const S5 = AIK.byId['arcodiga/5'];
            if (S5) splitIntoOrgans(S5, 'arcodiga/3', 'refurbished');
          }
        } finally {
          modeFilter = null;
          AI.furnishPlan = origFurnishPlan;
        }
        /* 2. Dormant outer Living-Working ribs: rehab state (20% weathered partitions), unfurnished expansion socket */
        modeFilter = { area: 'dormant', culture: 'ancient', furnish: false, state: 'rehab', planDecay: 3 };
        try {
          origPass({ k: 'arcodiga', d: 3, gx: m.gx, gz: m.gz, mark: {} }, G);
          const S3 = AIK.byId['arcodiga/3'];
          if (S3) splitIntoOrgans(S3, 'arcodiga/3', 'sealed socket');
        } finally {
          modeFilter = null;
        }
      }
    };

    /* Live settlement culture re-socketing helper attached once window._api exists */
    tick(function installSocketOnce() {
      if (window._api && window._api.interiors && !window._api.arcodigaSocket) {
        window._api.arcodigaSocket = function (culture, opts) {
          opts = opts || {};
          if (AI.DRESS && !AI.DRESS[culture]) {
            AI.DRESS[culture] = Object.assign({}, AI.DRESS.occupied, ADG_INTERIORS.DRESS_REFURB);
          }
          const areas = ['wing', 'spine', 'crest', 'ribs', 'works'].concat(opts.unsealDormant ? ['dormant'] : []);
          let total = 0;
          for (const a of areas) {
            const id = 'arcodiga/3/' + a;
            if (AIK.byId[id]) total += aikSocket(id, culture, opts);
          }
          return { culture: culture, organs: areas.length, pieces: total };
        };
      }
    });
  })();
}
