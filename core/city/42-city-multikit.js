/* ============================== 7b. MULTI-KIT CHOOSERS, WARD ZONING & BLUEPRINT LOTS ============================== */
/* [G data] Phase 2 of MULTI-KIT-SCOPE.md (Rulings #99-101): connects KCITY (core/city 10-40) to KRATOR_KITS
   (core/kits/10-core-kits.js) so a settlement plan mixes 1..N dynamically unlocked building kits by ward, trade,
   household clearance (Giant minDoorH / mount access), and per-lot player blueprint commissions.
   Plain data and pure functions: no THREE, no DOM, no browser APIs. Existing single-kit KCITY instances are untouched. */
(function () {
  'use strict';
  var K = (typeof KCITY !== 'undefined') ? KCITY : (typeof window !== 'undefined' ? (window.KCITY = window.KCITY || {}) : {});

  var DEFAULT_FALLBACK = {
    manor: 'rich',
    rich: 'middle',
    middle: 'poor',
    shop: 'poor',
    tavern: 'shop',
    industrial: 'poor',
    civic: 'rich',
    poor: null
  };

  function resolveKits(o) {
    if (o && o.kits) return o.kits;
    if (typeof KRATOR_KITS !== 'undefined') return KRATOR_KITS;
    if (typeof globalThis !== 'undefined' && globalThis.KRATOR_KITS) return globalThis.KRATOR_KITS;
    throw new Error('KCITY.multikit: load core/kits/10-core-kits.js first (or pass opts.kits)');
  }

  /* build a ward-encoded class token '<wardId>@<kitId>@<cls>' in TUNE.classes & TUNE.fallback on demand so SL.lineLots
     and SL.salvage (20-city-plan.js) draw and salvage within the ward's unlocked kit without mutating core/city's globals */
  function ensureWardClass(tune, KK, styleState, wardId, kitId, cls, minDoorH, access) {
    var token = wardId + '@' + kitId + '@' + cls;
    if (tune.classes[token]) return tune.classes[token].length ? token : null;

    var cands = KK.candidates(styleState, {
      wardId: wardId,
      cls: cls,
      minDoorH: minDoorH,
      access: access
    }).filter(function (c) { return c.kit === kitId; });

    /* if a kit lacks a narrow sub-class (e.g. 'manor' or 'tavern'), walk DEFAULT_FALLBACK inside the same kit first */
    var cur = cls, guard = 0;
    while (!cands.length && cur && guard < 5) {
      cur = DEFAULT_FALLBACK[cur];
      guard++;
      if (cur) {
        cands = KK.candidates(styleState, {
          wardId: wardId,
          cls: cur,
          minDoorH: minDoorH,
          access: access
        }).filter(function (c) { return c.kit === kitId; });
      }
    }
    if (!cands.length) {
      /* final intra-kit fallback: any unlocked piece of kitId that meets doorH/access */
      cands = KK.candidates(styleState, {
        wardId: wardId,
        minDoorH: minDoorH,
        access: access
      }).filter(function (c) { return c.kit === kitId && c.tier <= 2; });
    }

    tune.classes[token] = cands.map(function (c) { return [c.qkey, 0]; });
    var fb = DEFAULT_FALLBACK[cls];
    tune.fallback[token] = fb ? ensureWardClass(tune, KK, styleState, wardId, kitId, fb, minDoorH, access) : null;
    return tune.classes[token].length ? token : null;
  }

  function pickKitForWard(rs, KK, styleState, wardId, cls, minDoorH, access) {
    var cands = KK.candidates(styleState, {
      wardId: wardId,
      cls: cls,
      minDoorH: minDoorH,
      access: access
    });
    if (!cands.length) {
      cands = KK.candidates(styleState, { wardId: wardId, minDoorH: minDoorH, access: access });
    }
    if (!cands.length) return styleState.foundingKit;

    var byKit = {}, total = 0;
    for (var i = 0; i < cands.length; i++) {
      var k = cands[i].kit, w = cands[i].weight == null ? 1 : cands[i].weight;
      byKit[k] = (byKit[k] == null ? 0 : byKit[k]) + w;
      total += w;
    }
    if (!(total > 0)) return cands[0].kit;
    var x = rs.rnd() * total, chosen = cands[0].kit;
    var ks = Object.keys(byKit).sort();
    for (var j = 0; j < ks.length; j++) {
      x -= byKit[ks[j]];
      if (x <= 0) { chosen = ks[j]; break; }
    }
    return chosen;
  }

  /* tag lot records with parsed {kit, rawKey, qkey, doorH, ward} after any KCITY run or incremental growth pass */
  function stampLotMetadata(plan, KK, styleState, wardAtFn) {
    if (!plan || !plan.lots) return 0;
    var n = 0;
    for (var i = 0; i < plan.lots.length; i++) {
      var L = plan.lots[i];
      if (!L) continue;
      var P = KK.parseKey(L.key, styleState.foundingKit);
      L.key = P.qkey;
      L.kit = P.kitId;
      L.rawKey = P.key;
      var dm = KK.dims(P.qkey, L.v, styleState.foundingKit);
      if (dm) {
        L.doorH = dm.doorH;
        L.access = dm.access;
      }
      if (L.ward == null && wardAtFn) L.ward = wardAtFn([L.x, L.z]);
      /* strip internal '<ward>@<kit>@' prefix from L.cls so downstream census/host readers see canonical 'poor'|'middle'|... */
      if (typeof L.cls === 'string' && L.cls.indexOf('@') >= 0) {
        var parts = L.cls.split('@');
        L.ward = L.ward || parts[0];
        L.cls = parts[parts.length - 1];
      }
      n++;
    }
    return n;
  }

  /* create a multi-kit configuration for KCITY.create({ kit: mk.kit, rules: mk.rules, finish: [mk.finish] }) */
  K.multikit = function (opts) {
    opts = opts || {};
    var KK = resolveKits(opts);
    var founding = opts.foundingKit || (opts.styleState && opts.styleState.foundingKit) || 'islanders';
    var state = opts.styleState || KK.createStyleState(founding, { minDoorH: opts.minDoorH });
    var minDoorH = opts.minDoorH == null ? (state.minDoorH == null ? 0 : state.minDoorH) : +opts.minDoorH;
    var access = opts.access || null;

    var kitAdapter = KK.kitAdapter(founding);

    function defaultWardAt(p) {
      if (opts.wardAt) return opts.wardAt(p) || 'default';
      if (K.cur && K.cur.plan && K.site && K.site.roleAt) {
        return K.site.roleAt(p, K.cur.plan.site || K.cur.plan.districts || [], {
          skip: ['zone', 'wall', 'misc'],
          fallback: function () { return 'default'; }
        });
      }
      return 'default';
    }

    function wrapChooser(wayKind) {
      return function (p, rs) {
        var C = K.cur, tune = C ? C.tune : null;
        var baseChooser = (opts.baseChoosers && opts.baseChoosers[wayKind]) || K.defaults.choosers[wayKind];
        var baseCls = baseChooser(p, rs);
        if (!tune) return baseCls;
        tune.classes = tune.classes || {};
        tune.fallback = tune.fallback || Object.assign({}, DEFAULT_FALLBACK);
        var wardId = String(defaultWardAt(p) || 'default');
        var kitId = pickKitForWard(rs, KK, state, wardId, baseCls, minDoorH, access);
        var tok = ensureWardClass(tune, KK, state, wardId, kitId, baseCls, minDoorH, access);
        if (tok && C && C.items) delete C.items[tok];
        return tok || baseCls;
      };
    }

    var choosers = {
      avenue: wrapChooser('avenue'),
      main: wrapChooser('main'),
      side: wrapChooser('side'),
      alley: wrapChooser('alley')
    };

    function groundOk(bo, info) {
      if (opts.groundOk && !opts.groundOk(bo, info)) return false;
      if (!bo || !info || !info.item) return true;
      var actualWard = String(defaultWardAt(bo.c) || 'default');
      var ward = state.wards[actualWard];
      var P = KK.parseKey(info.item.key, state.foundingKit);
      var dm = KK.dims(P.qkey, info.item.v == null ? 0 : info.item.v, state.foundingKit);
      if (ward) {
        if (ward.pinnedKit && P.kitId !== ward.pinnedKit) return false;
        if (ward.allowedKits && ward.allowedKits.indexOf(P.kitId) < 0) return false;
      }
      var reqDoor = Math.max(minDoorH, ward ? ward.minDoorH : 0);
      if (dm && dm.doorH < reqDoor) return false;
      var reqAcc = access || (ward ? ward.access : null);
      if (reqAcc && dm && dm.access !== reqAcc) return false;
      return true;
    }

    function finishHook(C) {
      stampLotMetadata(C.plan, KK, state, defaultWardAt);
    }

    /* Ruling #101: Commission or re-pin a specific lot in C.plan to an unlocked '<kitId>:<pieceKey>' blueprint.
       Checks unlock eligibility and exact OBB footprint collision against streets and neighbouring standing lots. */
    function commissionLot(C, spec) {
      spec = spec || {};
      C.bind();
      var lot = C.plan && C.plan.lots[spec.lotId];
      if (!lot || lot.died != null) return { ok: false, why: 'missing-or-dead-lot' };
      var P = KK.parseKey(spec.qkey, state.foundingKit);
      var dm = KK.dims(P.qkey, spec.v == null ? 0 : spec.v, state.foundingKit);
      if (!dm) return { ok: false, why: 'unknown-piece' };
      var kRec = KK.manifest().kits[P.kitId] && KK.manifest().kits[P.kitId].pieces[P.key];
      if (!KK.pieceUnlocked(state, P.kitId, P.key, kRec)) return { ok: false, why: 'locked-style' };
      var ward = spec.wardId != null ? state.wards[spec.wardId] : (lot.ward ? state.wards[lot.ward] : null);
      if (ward) {
        if (ward.pinnedKit && P.kitId !== ward.pinnedKit) return { ok: false, why: 'ward-disallows-kit' };
        if (ward.allowedKits && ward.allowedKits.indexOf(P.kitId) < 0) return { ok: false, why: 'ward-disallows-kit' };
      }
      var reqDoor = Math.max(minDoorH, ward ? ward.minDoorH : 0);
      if (dm.doorH < reqDoor) return { ok: false, why: 'door-too-low' };
      var reqAcc = access || (ward ? ward.access : null);
      if (reqAcc && dm.access !== reqAcc) return { ok: false, why: 'access-mismatch' };

      /* verify the new footprint fits without overlapping another standing building or street carriageway */
      var sl = (K.lib && K.lib.SL) || (typeof SL !== 'undefined' ? SL : null);
      var u = lot.bo ? lot.bo.u : [Math.cos(lot.ry), -Math.sin(lot.ry)];
      var v = lot.bo ? lot.bo.v : [-u[1], u[0]];
      var newBo = { c: [lot.x, lot.z], u: u, v: v, hw: dm.w / 2, hd: dm.d / 2 };
      var hit = C.index.lots.hit(newBo, function (other) { return other.id === lot.id || other.died != null; });
      if (hit) return { ok: false, why: 'footprint-clash', clashId: hit.id };
      if (C.tune && C.tune.exact && sl && sl.streetHit && sl.streetHit(newBo)) {
        return { ok: false, why: 'street-clash' };
      }

      if (C.tags && lot.tag && C.tags.remove) {
        C.tags.remove(lot.tag);
        lot.tag = null;
      }
      lot.key = dm.qkey;
      lot.kit = dm.kit;
      lot.rawKey = dm.rawKey;
      lot.v = dm.v;
      lot.w = dm.w;
      lot.d = dm.d;
      lot.h = dm.h;
      lot.doorH = dm.doorH;
      lot.access = dm.access;
      lot.bo = newBo;
      lot.commissioned = true;
      C.index.lots.clear();
      for (var li = 0; li < C.plan.lots.length; li++) {
        var xLot = C.plan.lots[li];
        if (xLot && xLot.died == null && xLot.bo) C.index.lots.add(xLot);
      }
      if (sl && sl.register) sl.register(lot);
      KK.pinLot(state, lot.id, dm.qkey);
      return { ok: true, lot: lot };
    }

    /* Lay out a new street/growth pass at `step` using the CURRENT styleState (e.g. after new tradesmen migrate in or
       blueprints are bought), leaving every already-standing lot from earlier steps untouched (Ruling #99). */
    function growWays(C, spec) {
      spec = spec || {};
      var step = spec.step == null ? 13 : spec.step;
      var waysIn = spec.ways || [];
      C.bind();
      var sl = (K.lib && K.lib.SL) || (typeof SL !== 'undefined' ? SL : null);
      if (!sl) throw new Error('KCITY.multikit.growWays: SL not exposed');
      /* clear cached @-prefixed ward class tables and SL._items so newly unlocked/deactivated kits take effect at once */
      if (C.tune && C.tune.classes) {
        Object.keys(C.tune.classes).forEach(function (k) {
          if (k.indexOf('@') >= 0) {
            delete C.tune.classes[k];
            if (C.tune.fallback) delete C.tune.fallback[k];
          }
        });
      }
      C.items = {};
      sl._items = C.items;
      var madeWays = [], madeLots = [];
      for (var w = 0; w < waysIn.length; w++) {
        var wd = waysIn[w], cls = wd.cls || 'main';
        var way = sl.addWay(cls, wd.pts, step, wd.opt || {});
        madeWays.push(way);
        var ch = choosers[cls] || choosers.main;
        madeLots = madeLots.concat(sl.lineLots(way, 1, ch, step));
        madeLots = madeLots.concat(sl.lineLots(way, -1, ch, step));
      }
      stampLotMetadata(C.plan, KK, state, defaultWardAt);
      if (sl.count) sl.count();
      K.sync(C);
      return { step: step, ways: madeWays.length, lots: madeLots.length };
    }

    function summary(C) {
      var plan = C && C.plan;
      var standing = plan ? plan.lots.filter(function (L) { return L && L.died == null; }) : [];
      var byKit = {}, byWard = {};
      for (var i = 0; i < standing.length; i++) {
        var L = standing[i], kid = L.kit || KK.parseKey(L.key, state.foundingKit).kitId;
        byKit[kid] = (byKit[kid] == null ? 0 : byKit[kid]) + 1;
        var wd = L.ward || 'default';
        byWard[wd] = byWard[wd] || {};
        byWard[wd][kid] = (byWard[wd][kid] == null ? 0 : byWard[wd][kid]) + 1;
      }
      return {
        standingLots: standing.length,
        kitsUsed: Object.keys(byKit).sort(),
        byKit: byKit,
        byWard: byWard
      };
    }

    return {
      styleState: state,
      kit: kitAdapter,
      rules: { choosers: choosers, groundOk: groundOk },
      finish: finishHook,
      commissionLot: commissionLot,
      growWays: growWays,
      summary: summary
    };
  };
})();
