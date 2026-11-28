// ================================================================= CORE — simulation 6d: liturgical observances and decrees
// core/simulation/PLAN-PILGRIMS.md section 2. Opt-in: nothing runs until a world registers an observance with
// SIM.observance(...). A world without observances executes byte-identically.
//
//   SIM.observance({ id, window (a calendar window/cycle name or list of names), settlement?, district?, faction?, org?,
//                    priority? (0), forbidActs?:[ACT..], closeKinds?:[kind..], openKinds?:[kind..] (24 h override),
//                    holdRecipes?:string (reason passed to SIM.recipeHold while active), roleSched?:string (named entry
//                    in role.scheds, or overridden per role via role.when[window]), banners?:string, lamps?:number })
//   SIM.activeObservances(scope?, minute?) -> active records sorted highest priority first
//   SIM.bannersAt(settlement, district?, minute?) -> {banners, lamps, observances:[ids]} for the 3D embodiment
//
// Hooks cleanly onto SIM.isOpen, SIM.welcome and SIM.schedOf, and registers a SIM.onSeason edge listener that calls
// SIM.placesChanged(), applies/releases SIM.recipeHold on scoped producers, and clears `a.wake` on affected actors so
// SIM.WAKE wakes them smoothly (staggered by SIM.lagOf). Pure [G data]: no THREE, no DOM, no RNG draws.
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.DECREES = null;

  var cacheMin = null, cacheActive = [];

  function toMap(arr){
    if(!arr || !arr.length) return null;
    var m = {};
    for(var i=0; i<arr.length; i++) m[arr[i]] = 1;
    return m;
  }

  function districtOf(P){
    if(!P) return null;
    if(P.district != null) return P.district;
    return P.tags && P.tags.district != null ? P.tags.district : null;
  }

  function matchesPlace(D, P){
    if(!P) return false;
    if(D.settlement != null && P.settlement !== D.settlement) return false;
    if(D.district != null && districtOf(P) !== D.district) return false;
    if(D.org != null && P.org !== D.org) return false;
    if(D.faction != null){
      var pf = P.faction || (P.org && SIM.R.org[P.org] && SIM.R.org[P.org].faction) ||
               (P.settlement != null && SIM.R.settlement && SIM.R.settlement[P.settlement] && SIM.R.settlement[P.settlement].faction);
      if(pf !== D.faction) return false;
    }
    return true;
  }

  function matchesActor(D, a){
    if(!a) return false;
    if(D.settlement != null && SIM.settlementOf && SIM.settlementOf(a) !== D.settlement) return false;
    if(D.district != null){
      var H = a.home != null ? SIM.R.place[a.home] : null, W = a.work != null ? SIM.R.place[a.work] : null;
      if(districtOf(H) !== D.district && districtOf(W) !== D.district) return false;
    }
    if(D.org != null && a.org !== D.org) return false;
    if(D.faction != null && a.faction !== D.faction) return false;
    return true;
  }

  function activeAt(minute){
    var DC = SIM.DECREES;
    if(!DC || !DC.order.length || !SIM.CAL) return [];
    var m = minute == null ? SIM.minute() : minute;
    if(m === cacheMin) return cacheActive;
    var S = SIM.season(m), out = [];
    if(S){
      for(var i=0; i<DC.order.length; i++){
        var D = DC.by[DC.order[i]], W = D.windows;
        for(var j=0; j<W.length; j++){
          if(W[j] === S.name || S.windows[W[j]]){ out.push(D); break; }
        }
      }
      out.sort(function(p, q){ return q.priority - p.priority || (p.id < q.id ? -1 : 1); });
    }
    cacheMin = m; cacheActive = out;
    return out;
  }

  SIM.observance = function(o){
    if(!o || !o.id) throw new Error('SIM.observance: needs an id');
    if(!o.window) throw new Error('SIM.observance '+o.id+': needs window');
    var DC = SIM.DECREES || (SIM.DECREES = { by:{}, order:[], held:{} });
    if(DC.by[o.id]) throw new Error('SIM.observance: duplicate id '+o.id);
    var wins = Array.isArray(o.window) ? o.window.slice() : [o.window];
    var rec = {
      id: o.id,
      windows: wins,
      settlement: o.settlement == null ? null : o.settlement,
      district: o.district == null ? null : o.district,
      faction: o.faction == null ? null : o.faction,
      org: o.org == null ? null : o.org,
      priority: o.priority == null ? 0 : o.priority,
      forbid: toMap(o.forbidActs),
      closeK: toMap(o.closeKinds),
      openK: toMap(o.openKinds),
      holdRecipes: o.holdRecipes == null ? null : o.holdRecipes,
      roleSched: o.roleSched == null ? null : o.roleSched,
      banners: o.banners == null ? null : o.banners,
      lamps: o.lamps == null ? null : o.lamps
    };
    DC.by[rec.id] = rec;
    DC.order.push(rec.id);
    cacheMin = null;
    syncHolds(SIM.minute());
    return rec;
  };

  SIM.activeObservances = function(scope, minute){
    var L = activeAt(minute);
    if(!scope) return L.slice();
    return L.filter(function(D){
      if(scope.settlement != null && D.settlement != null && D.settlement !== scope.settlement) return false;
      if(scope.district != null && D.district != null && D.district !== scope.district) return false;
      if(scope.faction != null && D.faction != null && D.faction !== scope.faction) return false;
      return true;
    });
  };

  SIM.bannersAt = function(settlement, district, minute){
    var L = activeAt(minute), banners = null, lamps = 1, ids = [];
    for(var i=0; i<L.length; i++){
      var D = L[i];
      if(D.settlement != null && D.settlement !== settlement) continue;
      if(D.district != null && district != null && D.district !== district) continue;
      if(D.district != null && district == null) continue;
      ids.push(D.id);
      if(banners == null && D.banners != null) banners = D.banners;
      if(D.lamps != null) lamps = Math.min(lamps, D.lamps);
    }
    return { banners:banners, lamps:lamps, observances:ids };
  };

  /* ---- wrap SIM.isOpen: openKinds force 24h vigil opening; closeKinds & forbidActs shut places/activities ---- */
  var isOpen0 = SIM.isOpen;
  SIM.isOpen = function(P, act, hour){
    if(!SIM.DECREES || !P) return isOpen0(P, act, hour);
    var L = activeAt(SIM.minute());
    if(!L.length) return isOpen0(P, act, hour);
    var forcedOpen = false;
    for(var i=0; i<L.length; i++){
      var D = L[i];
      if(!matchesPlace(D, P)) continue;
      if(D.closeK && D.closeK[P.kind]) return false;
      if(act && D.forbid && D.forbid[act]) return false;
      if(D.openK && D.openK[P.kind]) forcedOpen = true;
    }
    if(forcedOpen && !P.closed) return true;
    return isOpen0(P, act, hour);
  };

  /* ---- wrap SIM.schedOf & SIM.desire: role.when[window] or D.roleSched swaps a role's 24h schedule ---- */
  function overrideSchedOf(a, minute){
    if(!SIM.DECREES || !a || a.sched) return null;
    var R = SIM.R.role[a.role];
    if(!R || !R.scheds) return null;
    var L = activeAt(minute);
    for(var i=0; i<L.length; i++){
      var D = L[i];
      if(!matchesActor(D, a)) continue;
      if(R.when){
        for(var w=0; w<D.windows.length; w++){
          var sk = R.when[D.windows[w]];
          if(sk && R.scheds[sk]) return R.scheds[sk];
        }
      }
      if(D.roleSched && R.scheds[D.roleSched]) return R.scheds[D.roleSched];
    }
    return null;
  }

  var schedOf0 = SIM.schedOf;
  SIM.schedOf = function(a, minute){
    var ov = overrideSchedOf(a, minute);
    return ov || schedOf0(a, minute);
  };

  var desire0 = SIM.desire;
  SIM.desire = function(a, minute){
    if(!SIM.DECREES || !a || a.plan || a.sched) return desire0(a, minute);
    var m = minute == null ? SIM.minute() : minute;
    if(a.cmd && m < a.cmd.until) return desire0(a, minute);
    var ml = m - (SIM.lagOf ? SIM.lagOf(a) : 0), ov = overrideSchedOf(a, ml);
    if(!ov) return desire0(a, minute);
    if(a.cmd && m === SIM.minute()) a.cmd = null;
    var h = Math.floor((((ml % 1440) + 1440) % 1440) / 60), act = ov[h] || 'IDLE';
    if(SIM.ITEMS) act = SIM.itemsDesire(a, m, act);
    return SIM.NEED ? SIM.needsDesire(a, m, act) : act;
  };

  /* ---- recipe holds & wake invalidation when calendar windows turn ---- */
  function syncHolds(minute){
    var DC = SIM.DECREES;
    if(!DC || !SIM.recipeHold || (!SIM.ECON && !SIM.ECONS)) return;
    var L = activeAt(minute), wantHold = {};
    SIM.all('place').forEach(function(P){
      for(var i=0; i<L.length; i++){
        var D = L[i];
        if(D.holdRecipes && matchesPlace(D, P)){ wantHold[P.id] = D.holdRecipes; break; }
      }
    });
    Object.keys(DC.held).forEach(function(pid){
      if(!wantHold[pid]){ SIM.recipeHold(pid, null); delete DC.held[pid]; }
    });
    Object.keys(wantHold).forEach(function(pid){
      if(DC.held[pid] !== wantHold[pid]){
        var r = SIM.recipeHold(pid, wantHold[pid]);
        if(r) DC.held[pid] = wantHold[pid];
      }
    });
  }

  function onTurn(now, before, minute){
    if(!SIM.DECREES) return;
    cacheMin = null;
    var L = activeAt(minute);
    syncHolds(minute);
    if(SIM.placesChanged) SIM.placesChanged();
    /* wake actors so SIM.WAKE re-evaluates their schedules and open places (staggered naturally by SIM.lagOf) */
    SIM.all('actor').forEach(function(a){
      if(a.wake != null) a.wake = minute + (SIM.lagOf ? (SIM.lagOf(a) % 15) : 0);
    });
    SIM.logEvent('observance_turn', { active:L.map(function(d){ return d.id; }) });
  }

  if(SIM.onSeason) SIM.onSeason(onTurn);

  var init0 = SIM.init;
  SIM.init = function(o){
    SIM.DECREES = null;
    cacheMin = null; cacheActive = [];
    return init0(o);
  };
})(typeof window!=='undefined'?window:globalThis);
