/* ============================== core/kits: UNIVERSAL KIT REGISTRY & STYLE UNLOCKS ============================== */
/* [G data] Engine-neutral multi-kit footprint manifest, qualified key router ('<kitId>:<pieceKey>'), KCITY kit.dims
   adapter, and settlement style-unlock / ward-policy rules (core/region/MULTI-KIT-SCOPE.md, Rulings #99-101).
   Plain data and pure functions: no THREE, no DOM, no browser APIs, so it runs identically in Node, browser and Godot. */
(function (root) {
  'use strict';

  var MANIFEST = { version: 1, kits: {} };
  var LOADED = {};
  var BY_QKEY = {};
  var LOADER = null;

  /* infer a piece's unlock tier (1 vernacular housing/basic, 2 trade/craft/shop, 3 grand civic/palace/monument) */
  function inferTier(p) {
    if (p && p.tier != null) return p.tier;
    var w = p && p.wealth, fam = String((p && p.family) || '').toLowerCase();
    var types = (p && p.types) || [];
    for (var i = 0; i < types.length; i++) {
      var t = String(types[i]).toLowerCase();
      if (t === 'civic' || t === 'palace' || t === 'landmark' || t === 'sacred' || t === 'temple' || t === 'fortress' || t === 'military') return 3;
    }
    if (w === 'civic' || fam === 'civic' || fam === 'palace' || fam === 'sacred' || fam === 'grand' || fam === 'capital') return 3;
    if (fam === 'dwell' || fam === 'dwelling' || fam === 'dwellings' || fam === 'housing' || fam === 'houses' || fam === 'poor' || fam === 'small') {
      if (w === 'rich' || (typeof w === 'number' && w > 0.72)) return 2;
      return 1;
    }
    for (var j = 0; j < types.length; j++) {
      var tj = String(types[j]).toLowerCase();
      if (tj === 'residential' || tj === 'dwelling' || tj === 'house') {
        return (w === 'rich' || (typeof w === 'number' && w > 0.72)) ? 2 : 1;
      }
    }
    return 2;
  }

  /* map KCITY lot classes ('poor', 'middle', 'rich', 'manor', 'shop', 'tavern', 'industrial', 'civic') to piece metadata */
  function matchesClass(p, cls) {
    if (!cls) return true;
    var types = p.types || [], fam = String(p.family || '').toLowerCase(), w = p.wealth;
    var hasType = function (k) {
      for (var i = 0; i < types.length; i++) if (String(types[i]).toLowerCase().indexOf(k) >= 0) return true;
      return false;
    };
    var isRes = hasType('res') || hasType('dwell') || hasType('house') || fam.indexOf('dwell') >= 0 || fam.indexOf('hous') >= 0 || fam === 'poor' || fam === 'mid' || fam === 'rich';
    if (cls === 'poor') return isRes && (w === 'poor' || (typeof w === 'number' && w <= 0.36) || fam === 'poor' || fam === 'small');
    if (cls === 'middle') return isRes && (w === 'middle' || w == null || (typeof w === 'number' && w > 0.30 && w <= 0.72) || fam === 'mid');
    if (cls === 'rich') return isRes && (w === 'rich' || (typeof w === 'number' && w > 0.65) || fam === 'rich');
    if (cls === 'manor') return (isRes || fam === 'palace' || fam === 'estate' || fam === 'grand') && (w === 'rich' || w === 'civic' || (typeof w === 'number' && w >= 0.75) || p.w >= 14);
    if (cls === 'shop') return hasType('commerc') || hasType('shop') || hasType('market') || hasType('trade') || fam.indexOf('trade') >= 0 || fam.indexOf('shop') >= 0 || fam.indexOf('market') >= 0;
    if (cls === 'tavern') return hasType('hosp') || hasType('tavern') || hasType('inn') || fam.indexOf('hosp') >= 0 || p.key.indexOf('tavern') >= 0 || p.key.indexOf('inn') >= 0 || p.key.indexOf('serai') >= 0 || p.key.indexOf('tea') >= 0;
    if (cls === 'industrial') return hasType('ind') || hasType('craft') || hasType('work') || hasType('prod') || fam.indexOf('work') >= 0 || fam.indexOf('ind') >= 0 || fam.indexOf('craft') >= 0;
    if (cls === 'civic') return p.tier === 3 || w === 'civic' || hasType('civic') || hasType('sacred') || fam.indexOf('civic') >= 0 || fam.indexOf('sacred') >= 0;
    return false;
  }

  function qualify(kitId, key) {
    var s = String(key || '');
    if (!kitId) return s;
    var idx = s.indexOf(':');
    if (idx > 0 && s.slice(0, idx) === kitId) return s;
    return kitId + ':' + (idx > 0 ? s.slice(idx + 1) : s);
  }

  function parseKey(qkey, defaultKit) {
    var s = String(qkey || '');
    var idx = s.indexOf(':');
    if (idx > 0) {
      var kid = s.slice(0, idx), raw = s.slice(idx + 1);
      return { kitId: kid, key: raw, qkey: kid + ':' + raw };
    }
    var dk = defaultKit == null ? null : String(defaultKit);
    return { kitId: dk, key: s, qkey: dk ? dk + ':' + s : s };
  }

  function normPiece(kitId, key, raw, kitMeta) {
    var defDoor = (kitMeta && kitMeta.defaultDoorH != null) ? kitMeta.defaultDoorH : 2.2;
    var defAcc = (kitMeta && kitMeta.access) || 'ground';
    var p = {
      qkey: kitId + ':' + key,
      kit: kitId,
      key: key,
      name: raw.name || key,
      w: +(raw.w == null ? 6 : raw.w),
      d: +(raw.d == null ? 6 : raw.d),
      h: +(raw.h == null ? 6 : raw.h),
      fw: raw.fw == null ? undefined : +raw.fw,
      fd: raw.fd == null ? undefined : +raw.fd,
      variants: raw.variants == null ? 1 : (raw.variants | 0) || 1,
      wealth: raw.wealth == null ? 0.5 : raw.wealth,
      family: raw.family || 'misc',
      types: Array.isArray(raw.types) ? raw.types.slice() : (raw.types ? [raw.types] : []),
      doorH: +(raw.doorH == null ? defDoor : raw.doorH),
      access: raw.access || defAcc,
      tier: 2
    };
    p.tier = inferTier({ tier: raw.tier, wealth: p.wealth, family: p.family, types: p.types });
    return p;
  }

  function indexKit(kitId, entry) {
    var K = {
      id: kitId,
      name: entry.name || kitId,
      culture: entry.culture || kitId,
      lineage: entry.lineage || 'unknown',
      pack: entry.pack == null ? null : entry.pack,
      defaultDoorH: entry.defaultDoorH == null ? 2.2 : +entry.defaultDoorH,
      access: entry.access || 'ground',
      pieces: {},
      order: [],
      trades: {}
    };
    var srcPieces = entry.pieces || {};
    var keys = entry.order || Object.keys(srcPieces).sort();
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (!srcPieces[k]) continue;
      var np = normPiece(kitId, k, srcPieces[k], K);
      K.pieces[k] = np;
      K.order.push(k);
      BY_QKEY[np.qkey] = np;
    }
    var srcTrades = entry.trades || {};
    for (var t in srcTrades) {
      if (!Object.prototype.hasOwnProperty.call(srcTrades, t)) continue;
      var arr = srcTrades[t] || [], clean = [];
      for (var j = 0; j < arr.length; j++) {
        var rk = arr[j].indexOf(':') > 0 ? arr[j].split(':')[1] : arr[j];
        if (K.pieces[rk]) clean.push(rk);
      }
      if (clean.length) K.trades[t] = clean;
    }
    MANIFEST.kits[kitId] = K;
    return K;
  }

  function loadManifest(data) {
    if (!data || !data.kits) return MANIFEST;
    MANIFEST.version = data.version == null ? 1 : data.version;
    var kids = Object.keys(data.kits).sort();
    for (var i = 0; i < kids.length; i++) indexKit(kids[i], data.kits[kids[i]]);
    return MANIFEST;
  }

  function register(kitId, api) {
    if (!kitId || !api) return null;
    LOADED[kitId] = api;
    /* if this kit was not in the static manifest yet (or has live dims), backfill its pieces without clobbering trades */
    if (typeof api.dims === 'function') {
      var dm = api.dims() || {};
      var existing = MANIFEST.kits[kitId];
      if (!existing) {
        indexKit(kitId, { id: kitId, name: api.name || kitId, culture: api.culture || kitId, lineage: api.lineage || 'runtime',
          pack: api.pack || null, pieces: dm, trades: api.trades || {} });
      } else {
        var ks = Object.keys(dm).sort();
        for (var i = 0; i < ks.length; i++) {
          var k = ks[i];
          if (!existing.pieces[k]) {
            var np = normPiece(kitId, k, dm[k], existing);
            existing.pieces[k] = np;
            existing.order.push(k);
            BY_QKEY[np.qkey] = np;
          }
        }
      }
    }
    return api;
  }

  function dims(qkey, v, defaultKit) {
    var P = parseKey(qkey, defaultKit);
    var rec = P.kitId ? BY_QKEY[P.qkey] : null;
    if (!rec && !P.kitId) {
      /* fallback scan if caller gave an unqualified key without defaultKit and only one loaded/manifest kit owns it */
      var kits = Object.keys(MANIFEST.kits);
      for (var i = 0; i < kits.length; i++) {
        var cand = MANIFEST.kits[kits[i]].pieces[P.key];
        if (cand) { rec = cand; P = { kitId: kits[i], key: P.key, qkey: cand.qkey }; break; }
      }
    }
    if (!rec) return null;
    var vv = v == null ? 0 : (v | 0);
    return {
      key: P.kitId ? rec.qkey : rec.key,
      qkey: rec.qkey,
      rawKey: rec.key,
      kit: rec.kit,
      v: vv,
      w: rec.w,
      d: rec.d,
      h: rec.h,
      fw: rec.fw,
      fd: rec.fd,
      variants: rec.variants,
      wealth: rec.wealth,
      family: rec.family,
      types: rec.types.slice(),
      doorH: rec.doorH,
      access: rec.access,
      tier: rec.tier
    };
  }

  function kitAdapter(defaultKit) {
    return {
      defaultKit: defaultKit || null,
      dims: function (qkey, v) { return dims(qkey, v, defaultKit); }
    };
  }

  function proto(qkey, v, opt, defaultKit) {
    var P = parseKey(qkey, defaultKit);
    if (!P.kitId || !LOADED[P.kitId] || typeof LOADED[P.kitId].proto !== 'function') return null;
    var vv = v == null ? 0 : (v | 0);
    var g = LOADED[P.kitId].proto(P.key, vv, opt);
    if (g && g.userData) {
      g.userData.kit = P.kitId;
      g.userData.qkey = P.qkey;
      g.userData.rawKey = P.key;
    }
    return g;
  }

  function setLoader(fn) { LOADER = typeof fn === 'function' ? fn : null; }

  function ensure(kitIds, cb) {
    var list = Array.isArray(kitIds) ? kitIds : [kitIds];
    var missing = [];
    for (var i = 0; i < list.length; i++) if (list[i] && !LOADED[list[i]]) missing.push(list[i]);
    if (!missing.length) { if (cb) cb(null, list); return true; }
    if (!LOADER) { if (cb) cb(new Error('KRATOR_KITS: no loader configured for ' + missing.join(', ')), list); return false; }
    var left = missing.length, errOut = null;
    for (var j = 0; j < missing.length; j++) {
      (function (kid) {
        LOADER(kid, function (err) {
          if (err && !errOut) errOut = err;
          left--;
          if (left === 0 && cb) cb(errOut, list);
        });
      })(missing[j]);
    }
    return false;
  }

  /* ---------------------------------------------------------------- Settlement Style Unlocks & Ward Policy (Rulings #99-101) */
  function ensureEntry(state, kitId) {
    if (!state.unlocked[kitId]) {
      state.unlocked[kitId] = {
        kitId: kitId,
        blueprintTier: 0,
        blueprintKeys: [],
        schematics: [],
        masters: 0,
        apprentices: 0,
        wardPractitioners: {},
        everBuilt: false
      };
    }
    return state.unlocked[kitId];
  }

  function createStyleState(foundingKit, opt) {
    opt = opt || {};
    var state = {
      foundingKit: foundingKit || null,
      minDoorH: opt.minDoorH == null ? 0 : +opt.minDoorH,
      unlocked: {},
      wards: {},
      pinnedLots: {}
    };
    if (foundingKit) {
      var e = ensureEntry(state, foundingKit);
      e.blueprintTier = 3;
      e.schematics.push('founding:' + foundingKit);
      e.everBuilt = true;
    }
    return state;
  }

  /* Ruling #99: Migrating knowledgeable tradesmen unlock living vernacular tradition while masters + apprentices > 0.
     If practitioners drop to 0 without local apprentices, standing buildings remain, but new lots cannot draw the kit
     unless permanently unlocked by a blueprint. */
  function updateTradesmen(state, kitId, info) {
    info = info || {};
    var e = ensureEntry(state, kitId);
    if (info.masters != null) e.masters = Math.max(0, info.masters | 0);
    if (info.apprentices != null) e.apprentices = Math.max(0, info.apprentices | 0);
    if (info.wardId != null) {
      var wc = info.wardCount == null ? (e.masters + e.apprentices) : Math.max(0, info.wardCount | 0);
      if (wc > 0) e.wardPractitioners[info.wardId] = wc;
      else delete e.wardPractitioners[info.wardId];
    }
    if (e.masters + e.apprentices > 0) e.everBuilt = true;
    return kitStatus(state, kitId);
  }

  /* Ruling #100: Purchased guild folios or recovered Ancient schematics permanently unlock specific pieces or whole tiers. */
  function unlockBlueprint(state, spec) {
    spec = spec || {};
    var kitId = spec.kitId;
    var keys = spec.keys || [];
    if (!kitId && keys.length) kitId = parseKey(keys[0], state.foundingKit).kitId;
    if (!kitId) return null;
    var e = ensureEntry(state, kitId);
    if (spec.tier != null && spec.tier > e.blueprintTier) e.blueprintTier = Math.min(3, Math.max(0, spec.tier | 0));
    for (var i = 0; i < keys.length; i++) {
      var P = parseKey(keys[i], kitId);
      var target = ensureEntry(state, P.kitId);
      if (target.blueprintKeys.indexOf(P.key) < 0) target.blueprintKeys.push(P.key);
      target.everBuilt = true;
    }
    if (spec.id && e.schematics.indexOf(spec.id) < 0) e.schematics.push(spec.id);
    e.everBuilt = true;
    return kitStatus(state, kitId);
  }

  function kitStatus(state, kitId) {
    var e = state.unlocked[kitId];
    if (!e) return { kitId: kitId, active: false, effectiveTier: 0, tradesmanTier: 0, blueprintTier: 0, blueprintKeys: [], standingOnly: false, practitioners: 0 };
    var prac = e.masters + e.apprentices;
    var tTier = e.masters >= 3 ? 3 : (prac > 0 ? 2 : 0);
    var eff = Math.max(e.blueprintTier, tTier);
    var active = eff > 0 || e.blueprintKeys.length > 0;
    return {
      kitId: kitId,
      active: active,
      effectiveTier: eff,
      tradesmanTier: tTier,
      blueprintTier: e.blueprintTier,
      blueprintKeys: e.blueprintKeys.slice(),
      practitioners: prac,
      standingOnly: !active && !!e.everBuilt
    };
  }

  function pieceUnlocked(state, kitId, rawKey, pieceRec) {
    var st = kitStatus(state, kitId);
    if (!st.active) return false;
    if (st.blueprintKeys.indexOf(rawKey) >= 0) return true;
    var reqTier = pieceRec ? pieceRec.tier : 2;
    return st.effectiveTier >= reqTier;
  }

  /* Ruling #101: Ward-level style policy + per-lot / per-commission style pinning */
  function setWardPolicy(state, wardId, policy) {
    policy = policy || {};
    state.wards[wardId] = {
      wardId: wardId,
      pinnedKit: policy.pinnedKit || null,
      allowedKits: Array.isArray(policy.allowedKits) ? policy.allowedKits.slice() : null,
      weights: Object.assign({}, policy.weights || {}),
      minDoorH: policy.minDoorH == null ? 0 : +policy.minDoorH,
      access: policy.access || null
    };
    return state.wards[wardId];
  }

  function pinLot(state, lotId, qkey) {
    if (qkey == null) { delete state.pinnedLots[lotId]; return null; }
    var P = parseKey(qkey, state.foundingKit);
    state.pinnedLots[lotId] = P.qkey;
    return P.qkey;
  }

  function kitWeightInWard(state, kitId, ward) {
    if (ward && ward.weights && ward.weights[kitId] != null) return Math.max(0, +ward.weights[kitId]);
    var e = state.unlocked[kitId];
    if (!e) return 0;
    if (kitId === state.foundingKit) return 1.0;
    var wPrac = (ward && e.wardPractitioners[ward.wardId] != null) ? e.wardPractitioners[ward.wardId] : (e.masters + e.apprentices);
    var base = e.blueprintTier > 0 ? 0.35 * e.blueprintTier : 0.15;
    return base + 0.25 * Math.min(8, wPrac);
  }

  function candidates(state, query) {
    query = query || {};
    var ward = query.wardId != null ? state.wards[query.wardId] : null;
    var minDoor = Math.max(state.minDoorH || 0, ward ? ward.minDoorH : 0, query.minDoorH == null ? 0 : +query.minDoorH);
    var reqAccess = query.access || (ward ? ward.access : null);

    /* 1. Individual lot / commissioned blueprint override (Ruling #101) */
    if (query.lotId != null && state.pinnedLots[query.lotId]) {
      var P = parseKey(state.pinnedLots[query.lotId], state.foundingKit);
      var rec = BY_QKEY[P.qkey];
      if (rec && pieceUnlocked(state, P.kitId, P.key, rec) && rec.doorH >= minDoor && (!reqAccess || rec.access === reqAccess)) {
        return [Object.assign({}, dims(rec.qkey, 0), { weight: 1 })];
      }
    }

    /* 2. Active kits permitted in this ward */
    var kitIds = Object.keys(state.unlocked).sort();
    if (ward && ward.pinnedKit) kitIds = [ward.pinnedKit];
    else if (ward && ward.allowedKits) {
      kitIds = kitIds.filter(function (k) { return ward.allowedKits.indexOf(k) >= 0; });
    }

    var out = [];
    for (var i = 0; i < kitIds.length; i++) {
      var kid = kitIds[i], K = MANIFEST.kits[kid];
      if (!K) continue;
      var st = kitStatus(state, kid);
      if (!st.active) continue;
      var kw = kitWeightInWard(state, kid, ward);
      if (!(kw > 0)) continue;

      var keys = null;
      if (query.trade) {
        keys = K.trades[query.trade] || [];
      } else {
        keys = K.order;
      }
      for (var j = 0; j < keys.length; j++) {
        var rk = keys[j], pr = K.pieces[rk];
        if (!pr) continue;
        if (!pieceUnlocked(state, kid, rk, pr)) continue;
        if (pr.doorH < minDoor) continue;
        if (reqAccess && pr.access !== reqAccess) continue;
        if (!query.trade && query.cls && !matchesClass(pr, query.cls)) continue;
        var item = dims(pr.qkey, 0);
        item.weight = +(kw / Math.max(1, keys.length)).toFixed(5);
        out.push(item);
      }
    }
    return out;
  }

  /* active kits actually present in a KCITY plan's standing lots: what a lazy [web] or Godot host needs to load */
  function kitsUsedByLots(lots, defaultKit) {
    var seen = {}, out = [];
    var arr = lots || [];
    for (var i = 0; i < arr.length; i++) {
      var L = arr[i];
      if (!L || L.died != null) continue;
      var P = parseKey(L.key, L.kit || defaultKit);
      if (P.kitId && !seen[P.kitId]) { seen[P.kitId] = 1; out.push(P.kitId); }
    }
    return out.sort();
  }

  var API = {
    version: 1,
    manifest: function () { return MANIFEST; },
    loadManifest: loadManifest,
    register: register,
    has: function (kitId) { return !!MANIFEST.kits[kitId] || !!LOADED[kitId]; },
    isLoaded: function (kitId) { return !!LOADED[kitId]; },
    getLoaded: function (kitId) { return LOADED[kitId] || null; },
    listKits: function () { return Object.keys(MANIFEST.kits).sort(); },
    qualify: qualify,
    parseKey: parseKey,
    dims: dims,
    kitAdapter: kitAdapter,
    proto: proto,
    setLoader: setLoader,
    ensure: ensure,
    createStyleState: createStyleState,
    updateTradesmen: updateTradesmen,
    unlockBlueprint: unlockBlueprint,
    kitStatus: kitStatus,
    pieceUnlocked: pieceUnlocked,
    setWardPolicy: setWardPolicy,
    pinLot: pinLot,
    candidates: candidates,
    kitsUsedByLots: kitsUsedByLots
  };

  root.KRATOR_KITS = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
