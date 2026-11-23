/* core/region 47s-region-styles: multi-kit architectural unlocks, migrating tradesman apprenticeship, guild blueprint
   purchases and ward/lot style zoning on core/simulation (core/region/MULTI-KIT-SCOPE.md, Rulings #99-101, 2026-11-22). */
KREGION.part('47s-region-styles', function (RH) {
/* ============================== 7h7. ARCHITECTURAL STYLES, TRADESMEN & BLUEPRINTS (Rulings #99-101) ============================== */
/* [G data] Connects KRATOR_KITS (core/kits/10-core-kits.js) to KREGION's towns, builders (47b), money (47m) and migrants (47r):
     RH.simStyles(opt)                    initializes RH.SIM.styles[s] per settlement, wraps RH.kitOf / RH.households / RH.openSpur,
                                            syncs initial tradesmen and installs RH.styleStep on SIM.stepHooks
     RH.syncStyleTradesmen(s)             Ruling #99: counts living adult builders/artisans by homeKit (masters) and
                                            certified local learners (apprentices); flips practitioner-only kits to
                                            standingOnly when masters + apprentices === 0 without disturbing built homes
     RH.styleDay(minute)                  daily co-working apprenticeship: local builders working on the same active
                                            SIM.BUILD lot project alongside a foreign master earn learnedKits[kitId]
                                            after trainDays (default 14)
     RH.buyBlueprint(s, spec)             Ruling #100: pays spec.price from buyerAcct (treasury:<s>) to sellerAcct via
                                            SIM.pay / SIM.exchange (ledger-conserved) and permanently unlocks blueprint
                                            keys or kit tiers
     RH.grantSchematic(s, spec)           Ruling #100 / #84: zero-cost permanent schematic unlock (recovered relics/folios)
     RH.setWardStyle(s, wardId, policy)   Ruling #101: sets ward style policy (pinnedKit, allowedKits, weights, minDoorH)
                                            and optionally re-keys unstarted vacant lots in that ward
     RH.commissionLotStyle(s, id, qkey)   Ruling #101: pins an unstarted vacant lot place to a specific unlocked piece
     RH.styleBooks() / RH.styleChecks(a,b) snapshot and invariant checks across two simulation points */

var BUILDER_TRADES = {
  builder: 1, builders: 1, carpenter: 1, carpentry: 1, mason: 1, masonry: 1, stonemason: 1,
  architect: 1, shipwright: 1, joiner: 1, timberwright: 1, bricklayer: 1, engineer: 1
};

function kitsApi(opt) {
  if (opt && opt.kits) return opt.kits;
  if (RH.SIM && RH.SIM.kitsApi) return RH.SIM.kitsApi;
  if (typeof KRATOR_KITS !== 'undefined') return KRATOR_KITS;
  if (typeof globalThis !== 'undefined' && globalThis.KRATOR_KITS) return globalThis.KRATOR_KITS;
  throw new Error('47s-region-styles: load core/kits/10-core-kits.js first');
}

function isBuilderActor(a, s) {
  if (!a || a.driven || a.present === false || a.ageBand === 'child') return false;
  var craft = a.craft ? String(a.craft).toLowerCase() : '';
  if (craft && BUILDER_TRADES[craft]) return true;
  var job = a.job ? String(a.job).toLowerCase() : '';
  if (job && BUILDER_TRADES[job]) return true;
  var role = a.role ? String(a.role) : '';
  var shortRole = (s != null && role.indexOf(s + '.') === 0) ? role.slice(String(s).length + 1).toLowerCase() : role.toLowerCase();
  if (BUILDER_TRADES[shortRole]) return true;
  if (SIM.BUILD && a.work != null && SIM.BUILD.lots[a.work]) return true;
  return false;
}

function wardOfPlace(P) {
  if (!P || !P.tags) return 'default';
  return P.tags.ward || P.tags.district || 'default';
}

function ensurePlaceKindRow(KK, qkey, defaultKit) {
  var T = RH.TUNE && RH.TUNE.sim;
  if (!T) return null;
  T.kinds = T.kinds || {};
  if (T.kinds[qkey]) return T.kinds[qkey];
  var dm = KK.dims(qkey, 0, defaultKit);
  if (!dm) return null;
  var fam = String(dm.family || '').toLowerCase();
  var types = dm.types || [];
  var hasT = function (sub) {
    for (var i = 0; i < types.length; i++) if (String(types[i]).toLowerCase().indexOf(sub) >= 0) return true;
    return false;
  };
  var row;
  if (hasT('hosp') || hasT('tavern') || fam.indexOf('hosp') >= 0) row = ['tavern', { WORK: 2, EAT: 8, SOCIALIZE: 8 }];
  else if (hasT('commerc') || hasT('shop') || hasT('market') || fam.indexOf('shop') >= 0) row = ['shop', { WORK: 2, BUY: 6 }];
  else if (hasT('ind') || hasT('work') || hasT('craft') || fam.indexOf('work') >= 0) row = ['workshop', { WORK: 3 }];
  else if (dm.tier === 3 || hasT('civic') || hasT('sacred') || fam.indexOf('civic') >= 0) row = ['hall', { WORK: 2, SOCIALIZE: 10 }];
  else row = ['home', {}];
  T.kinds[qkey] = row;
  if (typeof ISLE_DIMS !== 'undefined' && ISLE_DIMS && !ISLE_DIMS[qkey]) {
    var M = KK.manifest().kits[dm.kit];
    var pr = M && M.pieces[dm.rawKey];
    ISLE_DIMS[qkey] = { w: dm.w, d: dm.d, h: dm.h, role: (pr && pr.name) || dm.rawKey };
  }
  return row;
}

function householdsForPiece(KK, key, origFn, defaultKit) {
  if (key && String(key).indexOf(':') > 0) {
    var dm = KK.dims(key, 0, defaultKit);
    if (dm) {
      var rk = dm.rawKey.toLowerCase();
      if (rk.indexOf('longhouse') >= 0 || rk.indexOf('tenement') >= 0 || rk.indexOf('apartment') >= 0 || (dm.w * dm.d >= 180 && dm.tier <= 2)) return 3;
      return 1;
    }
  }
  if (origFn) return origFn(key);
  return 1;
}

function installHostWrappers(KK) {
  if (RH._stylesWrapped) return;
  RH._stylesWrapped = true;

  var origKitOf = RH.kitOf;
  RH.kitOf = function (key) {
    var s = String(key || '');
    if (s.indexOf(':') > 0) {
      var P = KK.parseKey(s, null);
      var BK = RH.TUNE && RH.TUNE.sim && RH.TUNE.sim.build && RH.TUNE.sim.build.byKit;
      if (P.kitId === 'hykkousoi' && BK && BK.hyk && !BK.hykkousoi) return 'hyk';
      return P.kitId;
    }
    return origKitOf ? origKitOf(key) : null;
  };

  var origHouseholds = RH.households;
  RH.households = function (key) {
    var defKit = (RH.TUNE && RH.TUNE.sim && RH.TUNE.sim.culture && RH.TUNE.sim.culture.kit) || 'islanders';
    return householdsForPiece(KK, key, origHouseholds, defKit);
  };

  var origOpenSpur = RH.openSpur;
  if (origOpenSpur) {
    RH.openSpur = function (s) {
      var opened = origOpenSpur(s);
      if (opened && RH.SIM && RH.SIM.styles && RH.SIM.styles[s]) {
        RH.rekeyVacantLots(s, { onlySpurs: true });
      }
      return opened;
    };
  }
}

RH.styleStateOf = function (s) {
  var S = RH.SIM;
  if (!S) return null;
  S.styles = S.styles || {};
  if (!S.styles[s]) {
    var KK = kitsApi();
    var T = RH.TUNE && RH.TUNE.sim;
    var stCfg = (T && T.styles) || {};
    var byTown = (stCfg.foundingByTown && stCfg.foundingByTown[s]) || null;
    var founding = byTown || stCfg.foundingKit || (T && T.culture && T.culture.kit) || 'islanders';
    var minDoor = (stCfg.minDoorByTown && stCfg.minDoorByTown[s] != null) ? stCfg.minDoorByTown[s] : (stCfg.minDoorH == null ? 0 : stCfg.minDoorH);
    S.styles[s] = KK.createStyleState(founding, { minDoorH: minDoor });
  }
  return S.styles[s];
};

RH.simStyles = function (opt) {
  opt = opt || {};
  var S = RH.SIM;
  if (!S) return null;
  var KK = kitsApi(opt);
  S.kitsApi = KK;
  S.styles = S.styles || {};
  S.styleEvents = S.styleEvents || [];
  installHostWrappers(KK);

  var towns = S.order || Object.keys(SIM.R.settlement || {});
  for (var i = 0; i < towns.length; i++) {
    var s = towns[i];
    if (opt.foundingByTown && opt.foundingByTown[s] && !S.styles[s]) {
      S.styles[s] = KK.createStyleState(opt.foundingByTown[s], {
        minDoorH: (opt.minDoorByTown && opt.minDoorByTown[s] != null) ? opt.minDoorByTown[s] : 0
      });
    } else {
      RH.styleStateOf(s);
    }
    RH.syncStyleTradesmen(s);
  }
  if (SIM.stepHooks && SIM.stepHooks.indexOf(RH.styleStep) < 0) SIM.stepHooks.push(RH.styleStep);
  return { settlements: towns.length };
};

RH.syncStyleTradesmen = function (s) {
  var KK = kitsApi(), state = RH.styleStateOf(s);
  if (!state) return null;

  var before = {};
  Object.keys(state.unlocked).forEach(function (k) { before[k] = KK.kitStatus(state, k); });

  var masters = {}, apprentices = {}, wardPrac = {};
  var actors = SIM.all('actor').filter(function (a) { return isBuilderActor(a, s) && SIM.settlementOf(a) === s; });

  for (var i = 0; i < actors.length; i++) {
    var a = actors[i];
    var H = a.home != null ? SIM.R.place[a.home] : null;
    var wardId = wardOfPlace(H);
    if (a.homeKit && KK.has(a.homeKit)) {
      masters[a.homeKit] = (masters[a.homeKit] == null ? 0 : masters[a.homeKit]) + 1;
      wardPrac[a.homeKit] = wardPrac[a.homeKit] || {};
      wardPrac[a.homeKit][wardId] = (wardPrac[a.homeKit][wardId] == null ? 0 : wardPrac[a.homeKit][wardId]) + 1;
    }
    if (a.learnedKits) {
      var lk = Object.keys(a.learnedKits);
      for (var j = 0; j < lk.length; j++) {
        var kid = lk[j];
        if (kid === a.homeKit || !KK.has(kid)) continue;
        apprentices[kid] = (apprentices[kid] == null ? 0 : apprentices[kid]) + 1;
        wardPrac[kid] = wardPrac[kid] || {};
        wardPrac[kid][wardId] = (wardPrac[kid][wardId] == null ? 0 : wardPrac[kid][wardId]) + 1;
      }
    }
  }

  var allKits = {};
  Object.keys(state.unlocked).forEach(function (k) { allKits[k] = 1; });
  Object.keys(masters).forEach(function (k) { allKits[k] = 1; });
  Object.keys(apprentices).forEach(function (k) { allKits[k] = 1; });

  var out = {};
  Object.keys(allKits).sort().forEach(function (kid) {
    var entry = state.unlocked[kid];
    if (entry) entry.wardPractitioners = {};
    var st = KK.updateTradesmen(state, kid, {
      masters: masters[kid] == null ? 0 : masters[kid],
      apprentices: apprentices[kid] == null ? 0 : apprentices[kid]
    });
    var wp = wardPrac[kid] || {};
    Object.keys(wp).forEach(function (w) {
      KK.updateTradesmen(state, kid, { wardId: w, wardCount: wp[w] });
    });
    out[kid] = st;

    var prev = before[kid];
    if ((!prev || !prev.active) && st.active && kid !== state.foundingKit) {
      var ev1 = { m: SIM.minute(), settlement: s, kit: kid, kind: 'unlocked-tradesmen', tier: st.effectiveTier, practitioners: st.practitioners };
      RH.SIM.styleEvents.push(ev1);
      SIM.logEvent('style unlocked', ev1);
    } else if (prev && prev.active && !st.active && st.standingOnly) {
      var ev2 = { m: SIM.minute(), settlement: s, kit: kid, kind: 'dormant-standing-only' };
      RH.SIM.styleEvents.push(ev2);
      SIM.logEvent('style dormant', ev2);
      /* unpinned empty lots queued for a now-dormant kit fall back to an active unlocked style; mid-build & built stay */
      RH.rekeyVacantLots(s, { dormantKit: kid });
    }
  });
  return out;
};

RH.styleStep = function (minute) {
  if (minute > 0 && minute % 1440 === 0) RH.styleDay(minute);
};

/* Ruling #99: Co-working apprenticeship on active construction projects */
RH.styleDay = function (minute) {
  var S = RH.SIM;
  if (!S || !S.styles) return 0;
  var KK = kitsApi();
  var T = RH.TUNE && RH.TUNE.sim;
  var trainDays = (T && T.styles && T.styles.trainDays != null) ? T.styles.trainDays : 14;
  var certified = 0;

  var towns = Object.keys(S.styles).sort();
  for (var i = 0; i < towns.length; i++) {
    var s = towns[i];
    RH.syncStyleTradesmen(s);
    if (!SIM.BUILD) continue;

    /* group active builders by the SIM.BUILD lot they are currently working on */
    var byLot = {};
    SIM.all('actor').forEach(function (a) {
      if (!isBuilderActor(a, s) || a.work == null) return;
      var Lt = SIM.BUILD.lots[a.work];
      if (!Lt || Lt.settlement !== s || Lt.state !== 'building') return;
      (byLot[a.work] || (byLot[a.work] = [])).push(a);
    });

    var needResync = false;
    Object.keys(byLot).sort().forEach(function (lotId) {
      var crew = byLot[lotId];
      if (crew.length < 2) return;
      /* collect master traditions present on this lot's crew */
      var masterKits = {};
      for (var m = 0; m < crew.length; m++) {
        var mk = crew[m].homeKit;
        if (mk && KK.has(mk)) masterKits[mk] = crew[m].id;
      }
      var mList = Object.keys(masterKits).sort();
      if (!mList.length) return;

      for (var c = 0; c < crew.length; c++) {
        var learner = crew[c];
        for (var k = 0; k < mList.length; k++) {
          var kid = mList[k];
          if (learner.homeKit === kid) continue;
          if (learner.learnedKits && learner.learnedKits[kid]) continue;
          learner.styleTraining = learner.styleTraining || {};
          var days = (learner.styleTraining[kid] == null ? 0 : learner.styleTraining[kid]) + 1;
          learner.styleTraining[kid] = days;
          if (days >= trainDays) {
            learner.learnedKits = learner.learnedKits || {};
            learner.learnedKits[kid] = { certifiedAt: minute, lot: lotId, master: masterKits[kid] };
            certified++;
            needResync = true;
            var ev = { m: minute, settlement: s, actor: learner.id, kit: kid, lot: lotId, master: masterKits[kid] };
            S.styleEvents.push(ev);
            SIM.logEvent('style apprentice certified', ev);
          }
        }
      }
    });
    if (needResync) RH.syncStyleTradesmen(s);
  }
  return certified;
};

/* Ruling #100: Purchase a codified guild architectural blueprint folio (conserving SIM.MONEY when enabled) */
RH.buyBlueprint = function (s, spec) {
  spec = spec || {};
  var KK = kitsApi(), state = RH.styleStateOf(s);
  if (!state) return { ok: false, why: 'no-settlement' };
  var price = spec.price == null ? 0 : Math.floor(+spec.price);
  if (price < 0) return { ok: false, why: 'invalid-price' };

  var paid = 0;
  if (price > 0 && SIM.MONEY) {
    var buyerId = spec.buyerAcct || ('treasury:' + s);
    var buyer = SIM.acct(buyerId);
    if (!buyer) return { ok: false, why: 'missing-buyer-account' };
    if (buyer.balance < price) return { ok: false, why: 'insufficient-funds', balance: buyer.balance, price: price };

    var sellerId = spec.sellerAcct || (SIM.acct('foreign:beyond') ? 'foreign:beyond' : null);
    if (!sellerId) {
      sellerId = 'guild:architects:' + buyer.currency;
      if (!SIM.acct(sellerId)) {
        SIM.account({ id: sellerId, owner: 'architects guild', kind: 'foreign', currency: buyer.currency, name: 'foreign architectural guild bourse' });
      }
    }
    var seller = SIM.acct(sellerId);
    if (!seller) return { ok: false, why: 'missing-seller-account' };

    if (buyer.currency === seller.currency) {
      paid = SIM.pay(buyerId, sellerId, price, 'blueprint', true);
      if (paid < price) return { ok: false, why: 'payment-failed' };
    } else {
      var got = SIM.exchange(buyerId, sellerId, price, 'blueprint');
      if (!(got > 0)) return { ok: false, why: 'exchange-failed' };
      paid = price;
    }
  }

  var st = KK.unlockBlueprint(state, spec);
  if (!st) return { ok: false, why: 'invalid-blueprint-spec' };
  var ev = {
    m: SIM.minute(), settlement: s, kit: st.kitId, kind: 'blueprint-bought',
    tier: st.blueprintTier, keys: st.blueprintKeys.slice(), price: price, paid: paid, id: spec.id || null
  };
  RH.SIM.styleEvents.push(ev);
  SIM.logEvent('blueprint unlocked', ev);
  return { ok: true, paid: paid, status: st };
};

/* Ruling #100 / Ruling #84: Unlock a recovered Ancient or monastery schematic at zero coin cost */
RH.grantSchematic = function (s, spec) {
  spec = Object.assign({}, spec || {}, { price: 0 });
  var KK = kitsApi(), state = RH.styleStateOf(s);
  if (!state) return { ok: false, why: 'no-settlement' };
  var st = KK.unlockBlueprint(state, spec);
  if (!st) return { ok: false, why: 'invalid-schematic-spec' };
  var ev = {
    m: SIM.minute(), settlement: s, kit: st.kitId, kind: 'schematic-granted',
    tier: st.blueprintTier, keys: st.blueprintKeys.slice(), source: spec.source || 'relic', id: spec.id || null
  };
  RH.SIM.styleEvents.push(ev);
  SIM.logEvent('schematic unlocked', ev);
  return { ok: true, status: st };
};

function applyPieceToVacantLot(KK, state, s, P, L, qkey) {
  var dm = KK.dims(qkey, 0, state.foundingKit);
  if (!dm) return false;
  ensurePlaceKindRow(KK, dm.qkey, state.foundingKit);
  var hh = RH.households(dm.qkey);
  P.tags.key = dm.qkey;
  P.tags.kit = dm.kit;
  P.tags.hh = hh;
  if (L) {
    L.key = dm.qkey;
    L.kit = dm.kit;
    L.rawKey = dm.rawKey;
    L.doorH = dm.doorH;
    L.access = dm.access;
  }
  if (SIM.BUILD && SIM.BUILD.lots[P.id] && SIM.BUILD.lots[P.id].state === 'empty') {
    var newKind = RH.lotKind(dm.qkey);
    if (SIM.BUILD.cfg.kinds[newKind]) {
      SIM.BUILD.lots[P.id].kind = newKind;
      if (SIM.BUILD.towns[s]) SIM.BUILD.towns[s].rate = null;
    }
  }
  return true;
}

/* Pick an unlocked piece for an unstarted vacant lot in settlement s respecting ward policy, clearance and lot footprint */
RH.pickStyleForLot = function (s, P, L) {
  var KK = kitsApi(), state = RH.styleStateOf(s);
  if (!state || !P) return null;
  var wardId = wardOfPlace(P);
  var cls = (P.tags && P.tags.cls) || P.cls || (L && L.cls) || 'poor';
  var cands = KK.candidates(state, { lotId: P.id, wardId: wardId, cls: cls });
  if (!cands.length) cands = KK.candidates(state, { wardId: wardId });
  if (!cands.length) return null;

  /* filter to footprints that fit the lot's parcel dimensions (with 1.5 m tolerance when L has w/d) */
  if (L && L.w > 0 && L.d > 0) {
    var fitting = cands.filter(function (c) { return c.w <= L.w + 1.5 && c.d <= L.d + 1.5; });
    if (fitting.length) cands = fitting;
  }

  var total = 0;
  for (var i = 0; i < cands.length; i++) total += (cands[i].weight == null ? 1 : cands[i].weight);
  var seed = (RH.TUNE && RH.TUNE.sim && RH.TUNE.sim.seed != null) ? RH.TUNE.sim.seed : 17;
  var salt = L && L.id != null ? L.id : P.k;
  var u = KRAND.unit(KRAND.hash(seed, 407, salt)) * total;
  var pick = cands[0];
  for (var j = 0; j < cands.length; j++) {
    u -= (cands[j].weight == null ? 1 : cands[j].weight);
    if (u <= 0) { pick = cands[j]; break; }
  }
  return pick;
};

RH.rekeyVacantLots = function (s, opt) {
  opt = opt || {};
  var KK = kitsApi(), state = RH.styleStateOf(s);
  if (!state) return 0;
  var changed = 0;
  var places = SIM.all('place').filter(function (P) {
    return P.settlement === s && P.kind === 'lot' && P.tags && P.tags.vacant;
  });
  for (var i = 0; i < places.length; i++) {
    var P = places[i];
    if (SIM.BUILD && SIM.BUILD.lots[P.id] && SIM.BUILD.lots[P.id].state !== 'empty') continue;
    if (state.pinnedLots[P.id] && !opt.dormantKit) continue;
    if (opt.wardId && wardOfPlace(P) !== opt.wardId) continue;
    if (opt.onlySpurs && !P.tags.spur) continue;
    if (opt.dormantKit) {
      var cur = KK.parseKey(P.tags.key, state.foundingKit);
      if (cur.kitId !== opt.dormantKit) continue;
      if (state.pinnedLots[P.id]) KK.pinLot(state, P.id, null);
    }
    var L = RH.SIM.lotRecs && RH.SIM.lotRecs[P.id];
    var pick = RH.pickStyleForLot(s, P, L);
    if (pick && applyPieceToVacantLot(KK, state, s, P, L, pick.qkey)) changed++;
  }
  return changed;
};

/* Ruling #101: Set ward-level style policy and optionally re-key unstarted vacant lots in that ward */
RH.setWardStyle = function (s, wardId, policy) {
  policy = policy || {};
  var KK = kitsApi(), state = RH.styleStateOf(s);
  if (!state) return null;
  var w = KK.setWardPolicy(state, wardId, policy);
  var rekeyed = policy.rekeyVacant === false ? 0 : RH.rekeyVacantLots(s, { wardId: wardId });
  return { ward: w, rekeyedLots: rekeyed };
};

/* Ruling #101: Pin an individual unstarted lot place to an unlocked '<kitId>:<pieceKey>' blueprint */
RH.commissionLotStyle = function (s, lotPlaceId, qkey, opt) {
  opt = opt || {};
  var KK = kitsApi(), state = RH.styleStateOf(s);
  if (!state) return { ok: false, why: 'no-settlement' };
  var P = SIM.R.place[lotPlaceId];
  if (!P || P.settlement !== s || P.kind !== 'lot') return { ok: false, why: 'not-a-vacant-lot' };
  if (SIM.BUILD && SIM.BUILD.lots[lotPlaceId] && SIM.BUILD.lots[lotPlaceId].state !== 'empty') {
    return { ok: false, why: 'already-started-or-built' };
  }
  var parsed = KK.parseKey(qkey, state.foundingKit);
  var K = KK.manifest().kits[parsed.kitId];
  var pr = K && K.pieces[parsed.key];
  if (!pr) return { ok: false, why: 'unknown-piece' };
  if (!KK.pieceUnlocked(state, parsed.kitId, parsed.key, pr)) return { ok: false, why: 'locked-style' };

  var wardId = wardOfPlace(P);
  var ward = state.wards[wardId];
  var reqDoor = Math.max(state.minDoorH == null ? 0 : state.minDoorH, ward ? ward.minDoorH : 0);
  if (pr.doorH < reqDoor) return { ok: false, why: 'door-too-low', doorH: pr.doorH, minDoorH: reqDoor };
  if (ward && ward.access && pr.access !== ward.access) return { ok: false, why: 'access-mismatch' };

  var L = RH.SIM.lotRecs && RH.SIM.lotRecs[lotPlaceId];
  if (!opt.ignoreFit && L && L.w > 0 && L.d > 0) {
    if (pr.w > L.w + 1.5 || pr.d > L.d + 1.5) return { ok: false, why: 'footprint-too-large' };
  }

  KK.pinLot(state, lotPlaceId, parsed.qkey);
  applyPieceToVacantLot(KK, state, s, P, L, parsed.qkey);
  return { ok: true, lot: lotPlaceId, qkey: parsed.qkey, kit: parsed.kitId };
};

RH.styleBooks = function () {
  var KK = kitsApi(), S = RH.SIM || {};
  var towns = {};
  Object.keys(S.styles || {}).sort().forEach(function (s) {
    var st = S.styles[s], kits = {};
    Object.keys(st.unlocked).sort().forEach(function (k) { kits[k] = KK.kitStatus(st, k); });
    var homesByKit = {}, emptyByKit = {};
    SIM.all('place').forEach(function (P) {
      if (P.settlement !== s || !P.tags || !P.tags.key) return;
      var pk = KK.parseKey(P.tags.key, st.foundingKit).kitId;
      if (P.kind === 'home') homesByKit[pk] = (homesByKit[pk] == null ? 0 : homesByKit[pk]) + 1;
      else if (P.kind === 'lot' && (!SIM.BUILD || !SIM.BUILD.lots[P.id] || SIM.BUILD.lots[P.id].state === 'empty')) {
        emptyByKit[pk] = (emptyByKit[pk] == null ? 0 : emptyByKit[pk]) + 1;
      }
    });
    var apprentices = SIM.all('actor').filter(function (a) {
      return !a.driven && SIM.settlementOf(a) === s && a.learnedKits && Object.keys(a.learnedKits).length > 0;
    }).length;
    towns[s] = {
      foundingKit: st.foundingKit,
      kits: kits,
      homesByKit: homesByKit,
      emptyLotsByKit: emptyByKit,
      certifiedApprentices: apprentices
    };
  });
  return {
    minute: SIM.minute(),
    towns: towns,
    events: (S.styleEvents || []).slice(),
    ledger: SIM.ledgerSnap ? SIM.ledgerSnap() : null
  };
};

RH.styleChecks = function (a, b) {
  var KK = kitsApi(), S = RH.SIM || {};
  var out = [], ok = function (name, pass, detail) { out.push({ name: name, ok: !!pass, detail: detail || '' }); };

  /* 1. No unstarted empty lot is queued to build a locked / dormant kit */
  var lockedQueued = [];
  Object.keys(b.towns).forEach(function (s) {
    var st = S.styles[s];
    SIM.all('place').forEach(function (P) {
      if (P.settlement !== s || P.kind !== 'lot' || !P.tags || !P.tags.vacant) return;
      if (SIM.BUILD && SIM.BUILD.lots[P.id] && SIM.BUILD.lots[P.id].state !== 'empty') return;
      var parsed = KK.parseKey(P.tags.key, st.foundingKit);
      var kst = KK.kitStatus(st, parsed.kitId);
      if (!kst.active) lockedQueued.push(P.id + '->' + parsed.qkey);
    });
  });
  ok('every unstarted empty lot is assigned to an active unlocked kit (dormant kits re-keyed)', !lockedQueued.length, lockedQueued.slice(0, 4).join(', '));

  /* 2. Standing homes built under a kit that later went standingOnly remain standing with their beds (Ruling #99) */
  var lostStanding = [];
  Object.keys(b.towns).forEach(function (s) {
    var Tb = b.towns[s], Ta = a && a.towns && a.towns[s];
    Object.keys(Tb.kits).forEach(function (kid) {
      if (!Tb.kits[kid].standingOnly) return;
      var had = Ta && Ta.homesByKit && Ta.homesByKit[kid] != null ? Ta.homesByKit[kid] : 0;
      var now = Tb.homesByKit[kid] == null ? 0 : Tb.homesByKit[kid];
      if (now < had) lostStanding.push(s + ':' + kid + ' (' + now + ' < ' + had + ')');
    });
  });
  ok('already-built homes of dormant (standingOnly) traditions remain standing', !lostStanding.length, lostStanding.join(', '));

  /* 3. Ward physiological door-height rules respected on all multi-kit vacant lots (Ruling #101) */
  var lowDoors = [];
  Object.keys(b.towns).forEach(function (s) {
    var st = S.styles[s];
    SIM.all('place').forEach(function (P) {
      if (P.settlement !== s || P.kind !== 'lot' || !P.tags || !P.tags.key || P.tags.key.indexOf(':') < 0) return;
      var ward = st.wards[wardOfPlace(P)];
      var req = Math.max(st.minDoorH == null ? 0 : st.minDoorH, ward ? ward.minDoorH : 0);
      if (!(req > 0)) return;
      var dm = KK.dims(P.tags.key, 0, st.foundingKit);
      if (dm && dm.doorH < req) lowDoors.push(P.id + ' (' + dm.doorH + 'm < ' + req + 'm)');
    });
  });
  ok('every multi-kit lot meets its settlement and ward door-height clearance', !lowDoors.length, lowDoors.slice(0, 4).join(', '));

  /* 4. Ledger conservation across blueprint purchases and multi-kit construction */
  if (a && a.ledger && b.ledger) {
    var Lg = SIM.ledger(a.ledger, b.ledger);
    ok('money and goods books balance across blueprint purchases and multi-kit building', Lg.ok, Lg.ok ? '' : Lg.problems.slice(0, 2).join('; '));
  }
  return out;
};
});
