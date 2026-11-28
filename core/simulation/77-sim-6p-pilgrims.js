// ================================================================= CORE — simulation 6p: pilgrimages and the Great Pilgrim's Market
// core/simulation/PLAN-PILGRIMS.md sections 3 and 4. Opt-in: nothing runs until a world calls SIM.pilgrimage(...) or
// SIM.pilgrimMarket(...). Supports both small internal circuits (Xanadu's Qiblai kora, Theodiga, Gret-Ail launches) and
// multi-stream cross-regional floods (Jimjam's 91-day Double Dark, Solstice, Concordance), at both PRESENTED (embodied
// groups, escorted cohorts, hostel -> core/camp overflow) and ABSTRACT (77-sim-7-lod.js hourly rations, souvenirs and
// offerings) levels, closing 77-sim-7-ledger.js with zero residual, plus the stream-stocked Great Pilgrim's Market for
// rare and far-flung reagents, tech and artifacts. Pure [G data]: no THREE, no DOM.
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.PILGRIMS = null;

  function h32(a, b, c){
    var h = Math.imul((a|0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((b|0) + 0x632be5ab, 0xc2b2ae35) ^ Math.imul((c|0) + 0x27d4eb2f, 0x165667b1);
    h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  }
  function strHash(s){
    var h = 2166136261;
    s = String(s || '');
    for(var i=0; i<s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h | 0;
  }

  function ensureState(){
    return SIM.PILGRIMS || (SIM.PILGRIMS = {
      by:{}, order:[], markets:{}, marketOrder:[], groups:{}, away:{}, lastHour:null, campOcc:{}
    });
  }

  /* ---- window & diplomatic multipliers ---- */
  function windowState(P, minute){
    var lead = P.leadDays == null ? 0 : P.leadDays;
    var thresh = P.floodThreshold == null ? 1.5 : P.floodThreshold;
    var lookMin = minute + Math.round(lead * 1440);
    var mult = P.baseMult, activeWins = [];
    if(SIM.CAL && P.windows){
      var S0 = SIM.season(minute), S1 = SIM.season(lookMin);
      Object.keys(P.windows).forEach(function(w){
        var onNow = S0 && (w === S0.name || S0.windows[w]);
        var onLead = S1 && (w === S1.name || S1.windows[w]);
        if(onNow || onLead){
          mult = Math.max(mult, P.windows[w]);
          activeWins.push(w);
        }
      });
    }
    return { mult:mult, windows:activeWins, flood:mult > P.baseMult && mult >= thresh };
  }

  function streamFactor(P, st){
    var toSett = P.to, hostSett = SIM.R.settlement && SIM.R.settlement[toSett];
    var hostFac = P.faction || (hostSett && hostSett.faction) || null;
    var sFac = st.faction || (st.fromSettlement && SIM.R.settlement && SIM.R.settlement[st.fromSettlement] && SIM.R.settlement[st.fromSettlement].faction) || hostFac;
    if(sFac && toSett && SIM.R.presence){
      var pr = SIM.R.presence[sFac + '@' + toSett];
      if(pr){
        if(pr.status === 'EXPELLED' || pr.status === 'NONE') return 0;
        if(pr.status === 'PERSECUTED') return st.covert ? 0.25 : 0;
      }
    }
    if(hostFac && sFac && hostFac !== sFac && SIM.stance){
      var stn = SIM.stance(hostFac, sFac);
      if(stn === 'hostile') return st.covert ? 0.15 : 0;
      if(stn === 'wary') return 0.6;
    }
    return 1;
  }

  function ensureStreamAccount(P, st, currency){
    if(!SIM.MONEY || !currency || !SIM.MONEY.cur[currency]) return null;
    var id = 'pilgrim:' + P.id + ':' + st.id;
    var A = SIM.acct(id);
    if(!A){
      A = SIM.account({
        id: id,
        owner: st.org || st.faction || st.id,
        kind: st.fromSettlement ? 'household' : 'foreign',
        currency: currency,
        settlement: st.fromSettlement == null ? null : st.fromSettlement,
        name: 'Pilgrim pool (' + st.id + ')'
      });
    }
    return A;
  }

  function fundStreamAccount(P, st, A, need){
    if(!A || !(need > 0) || A.balance >= need) return;
    var short = need - A.balance;
    if(st.fromSettlement && SIM.MONEY){
      var trId = (SIM.MONEY.m1 && SIM.MONEY.m1.treasury ? SIM.MONEY.m1.treasury(st.fromSettlement) : 'treasury:' + st.fromSettlement);
      var tr = SIM.acct(trId);
      if(tr && tr.currency === A.currency && tr.balance > 0){
        SIM.pay(tr.id, A.id, Math.min(short, tr.balance), 'internal pilgrim purse');
        return;
      }
    }
    if(!st.fromSettlement){
      SIM.mint(A.id, short, 'pilgrim purse');
    }
  }

  /* ---- accommodation cascade: preferred -> public hostels -> dynamic overflow camps (core/camp) ---- */
  function syncCampPlaces(P){
    var PG = ensureState(), camps = (P.lodging && P.lodging.overflowCamps) || [];
    for(var i=0; i<camps.length; i++){
      var cid = camps[i], pl = SIM.R.place[cid];
      if(!pl) continue;
      pl.transient = true;
      var occ = (pl.occ && pl.occ.SLEEP) || 0, inbound = PG.campOcc[cid] || 0;
      var shouldOpen = (occ + inbound) > 0;
      if(pl.closed === shouldOpen){
        pl.closed = !shouldOpen;
        if(SIM.placesChanged) SIM.placesChanged();
      }
    }
  }

  function pickLodging(P, st, count){
    var gov = st.governance || {}, L = P.lodging || {};
    function tryKinds(kinds, allowClosedCamp){
      if(!kinds || !kinds.length) return null;
      var cands = SIM.all('place').filter(function(pl){
        if(P.to != null && pl.settlement != null && pl.settlement !== P.to) return false;
        if(kinds.indexOf(pl.kind) < 0 && kinds.indexOf(pl.id) < 0) return false;
        if(!allowClosedCamp && pl.closed) return false;
        return SIM.free(pl, 'SLEEP') >= count;
      });
      if(!cands.length) return null;
      cands.sort(function(a, b){ return SIM.free(b, 'SLEEP') - SIM.free(a, 'SLEEP') || (a.id < b.id ? -1 : 1); });
      return cands[0];
    }
    if(gov.lodgeOnly) return tryKinds(gov.lodgeOnly, false);
    var found = tryKinds(st.lodgePrefer, false) || tryKinds(L.hostelKinds, false);
    if(found) return found;
    var camp = tryKinds(L.overflowCamps, true);
    if(camp && camp.closed){
      camp.closed = false;
      if(SIM.placesChanged) SIM.placesChanged();
    }
    return camp;
  }

  /* ---- registration API ---- */
  SIM.pilgrimage = function(o){
    if(!o || !o.id) throw new Error('SIM.pilgrimage: needs an id');
    if(!o.to) throw new Error('SIM.pilgrimage '+o.id+': needs `to` settlement');
    var PG = ensureState();
    if(PG.by[o.id]) throw new Error('SIM.pilgrimage: duplicate id '+o.id);
    var rec = {
      id: o.id,
      to: o.to,
      faction: o.faction || null,
      windows: o.windows ? Object.assign({}, o.windows) : {},
      baseMult: o.baseMult == null ? 1 : o.baseMult,
      floodThreshold: o.floodThreshold == null ? 1.5 : o.floodThreshold,
      leadDays: o.leadDays == null ? 1 : o.leadDays,
      stayNights: o.stayNights ? o.stayNights.slice() : [1, 3],
      partySize: o.partySize ? o.partySize.slice() : [3, 6],
      maxLiveGroups: o.maxLiveGroups == null ? 24 : o.maxLiveGroups,
      lodging: {
        hostelKinds: (o.lodging && o.lodging.hostelKinds ? o.lodging.hostelKinds.slice() : []),
        overflowCamps: (o.lodging && o.lodging.overflowCamps ? o.lodging.overflowCamps.slice() : []),
        tentCap: (o.lodging && o.lodging.tentCap) == null ? 6 : o.lodging.tentCap
      },
      circuit: (o.circuit || []).map(function(c){ return Object.assign({}, c); }),
      souvenirs: (o.souvenirs || []).slice(),
      souvenirRate: o.souvenirRate == null ? 0.25 : o.souvenirRate,
      offering: o.offering ? Object.assign({}, o.offering) : null,
      streams: (o.streams || []).map(function(s){
        return Object.assign({
          basePerDay: s.basePerDay == null ? 4 : s.basePerDay,
          acc: 0,
          activeHeadcount: 0,
          arrivedTotal: 0,
          souvenirsTaken: 0,
          offeringsPaid: 0
        }, s);
      }),
      stats: { groupsSpawned:0, pilgrimsArrived:0, mealsEaten:0, souvenirsBought:{}, offeringsPaid:0, campPeak:0 }
    };
    PG.by[rec.id] = rec;
    PG.order.push(rec.id);
    syncCampPlaces(rec);
    return rec;
  };

  /* ---- pilgrim role picker & welcome guard for regulated cohorts (e.g. Eternal State) ---- */
  function pickRole(st, idx, salt){
    if(st.mix && st.mix.length){
      var tot = 0, i;
      for(i=0; i<st.mix.length; i++) tot += st.mix[i][1];
      var u = h32(strHash(st.id), idx, salt) * (tot || 1), acc = 0;
      for(i=0; i<st.mix.length; i++){
        acc += st.mix[i][1];
        if(u <= acc) return st.mix[i][0];
      }
      return st.mix[st.mix.length - 1][0];
    }
    return st.role;
  }

  var welcome0 = SIM.welcome;
  SIM.welcome = function(who, place, act){
    if(who && typeof who === 'object' && who.forbidKinds && place && who.forbidKinds[place.kind]) return false;
    return welcome0(who, place, act);
  };

  /* ---- souvenirs & offerings settlement (ledger-clean at both LODs) ---- */
  function settleOfferingAndSouvenirs(P, st, headcount, daySeed){
    if(!(headcount > 0)) return;
    /* 1. Offerings (SIM.money) */
    if(P.offering && SIM.MONEY && P.offering.acct){
      var cur = P.offering.currency, target = SIM.acct(P.offering.acct);
      var src = ensureStreamAccount(P, st, cur);
      var amt = Math.round(headcount * (P.offering.perPersonDay == null ? 1 : P.offering.perPersonDay));
      if(src && target && amt > 0){
        fundStreamAccount(P, st, src, amt);
        var moved = SIM.pay(src.id, target.id, amt, 'pilgrim offering');
        st.offeringsPaid += moved;
        P.stats.offeringsPaid += moved;
      }
    }
    /* 2. Souvenirs (almanacs in Jimjam, prayer-wheels in Qiblai, saffron, votives) */
    if(P.souvenirs.length && (SIM.ECON || SIM.ECONS)){
      var wantTot = Math.floor(headcount * P.souvenirRate + h32(strHash(P.id + ':' + st.id), daySeed, 71));
      if(wantTot > 0){
        var g = P.souvenirs[Math.floor(h32(strHash(st.id), daySeed, 73) * P.souvenirs.length) % P.souvenirs.length];
        var taken = 0;
        SIM.withEcon(P.to, function(){
          if(!SIM.ECON || !SIM.ECON.goods[g]) return;
          var spare = Math.max(0, SIM.stockOf(g) - (P.keepSouvenirFloor == null ? 2 : P.keepSouvenirFloor));
          var n = Math.min(wantTot, spare);
          if(n > 0){
            taken = SIM.economyTake(g, n);
            if(taken > 0) SIM.economyBook('exported', g, taken);
          }
        });
        if(taken > 0){
          /* Internal pilgrim brings souvenir home into origin town's warehouse if that economy tracks the good */
          if(st.fromSettlement && SIM.ECONS && SIM.econ(st.fromSettlement)){
            SIM.withEcon(st.fromSettlement, function(){
              if(SIM.ECON && SIM.ECON.goods[g] && SIM.economyLand(g, taken)){
                SIM.economyBook('imported', g, taken);
              }
            });
          }
          st.souvenirsTaken += taken;
          P.stats.souvenirsBought[g] = (P.stats.souvenirsBought[g] || 0) + taken;
        }
      }
    }
  }

  /* ---- spawning an embodied PRESENTED pilgrim party ---- */
  function spawnCohort(P, st, count, minute, t){
    var PG = ensureState(), gov = st.governance || {};
    if(gov.maxCohorts != null){
      var liveC = Object.keys(PG.groups).filter(function(gid){ var g=PG.groups[gid]; return g.pilg===P.id && g.stream===st.id; }).length;
      if(liveC >= gov.maxCohorts) return null;
    }
    var liveAll = Object.keys(PG.groups).filter(function(gid){ return PG.groups[gid].pilg === P.id; }).length;
    if(liveAll >= P.maxLiveGroups) return null;

    var portId = st.fromPort, P0 = portId ? SIM.R.port[portId] : null;
    if(!P0 && st.fromSettlement){
      /* internal origin on the same nav map: start from an origin place's door */
      var origPlaces = SIM.all('place').filter(function(pl){ return pl.settlement === st.fromSettlement; });
      if(origPlaces.length){
        var op = origPlaces[Math.floor(h32(strHash(st.id), minute, 19) * origPlaces.length)];
        P0 = { id:'orig:'+op.id, x:op.door.x, z:op.door.z, y:op.door.y||0, layer:op.layer||'pedestrian' };
      }
    }
    if(!P0) return null;

    var lodge = pickLodging(P, st, count);
    if(!lodge) return null;

    var gid = 'pilg:' + P.id + ':' + st.id + '#' + (++P.stats.groupsSpawned);
    var members = [], orgId = st.org || (st.faction && SIM.all('org').filter(function(o){ return o.faction===st.faction; })[0] && SIM.all('org').filter(function(o){ return o.faction===st.faction; })[0].id) || null;
    var forbidMap = null;
    if(gov.forbidKinds && gov.forbidKinds.length){
      forbidMap = {};
      gov.forbidKinds.forEach(function(k){ forbidMap[k] = 1; });
    }

    /* optional warden/minder at head of escorted cohort (e.g. Eternal State Six-Ministries minder) */
    if(gov.mode === 'escorted_cohort' && gov.wardenRole && SIM.R.role[gov.wardenRole]){
      var wid = gid + '.warden';
      var wa = SIM.actor({ id:wid, role:gov.wardenRole, org:orgId, faction:st.faction, transient:true, group:gid, home:lodge.id });
      wa.at = [P0.x, P0.z]; wa.pos = { x:P0.x, y:P0.y||0, z:P0.z }; wa.forbidKinds = forbidMap;
      members.push(wid);
    }
    for(var i=0; i<count; i++){
      var rId = pickRole(st, i, minute + P.stats.groupsSpawned);
      if(!rId || !SIM.R.role[rId]) continue;
      var aid = gid + '.' + members.length;
      var a = SIM.actor({ id:aid, role:rId, org:orgId, faction:st.faction, transient:true, group:gid, home:lodge.id });
      a.at = [P0.x, P0.z]; a.pos = { x:P0.x, y:P0.y||0, z:P0.z }; a.forbidKinds = forbidMap;
      members.push(aid);
    }
    if(!members.length) return null;

    var nights = P.stayNights[0] + Math.floor(h32(strHash(gid), minute, 31) * (P.stayNights[1] - P.stayNights[0] + 1));
    var departMin = minute - (minute % 1440) + 1440 * Math.max(1, nights) + 7 * 60;

    /* build sacred circuit stops: lodge check-in -> circuit shrines (weighted by stream circuitBoost) -> lodge rest */
    var stops = [{ act:'SLEEP', place:lodge.id, mins:45 }];
    var shrines = [];
    P.circuit.forEach(function(c){
      if(!c.kinds || !c.kinds.length) return;
      var cands = SIM.all('place').filter(function(pl){
        if(P.to != null && pl.settlement != null && pl.settlement !== P.to) return false;
        if(forbidMap && forbidMap[pl.kind]) return false;
        return c.kinds.indexOf(pl.kind) >= 0 && SIM.offers(pl, c.act) > 0;
      });
      cands.forEach(function(pl){
        var w = c.weight == null ? 1 : c.weight;
        if(st.circuitBoost && st.circuitBoost.kinds && st.circuitBoost.kinds.indexOf(pl.kind) >= 0){
          w *= (st.circuitBoost.mult == null ? 2 : st.circuitBoost.mult);
        }
        shrines.push({ pl:pl, act:c.act, w:w });
      });
    });
    shrines.sort(function(p, q){ return q.w - p.w || (p.pl.id < q.pl.id ? -1 : 1); });
    var nStops = Math.min(shrines.length, gov.mode === 'escorted_cohort' ? 2 : 3);
    for(var s=0; s<nStops; s++){
      stops.push({ act:shrines[s].act, place:shrines[s].pl.id, mins:90 });
    }

    var G = SIM.group({
      id: gid, kind: 'pilgrim', org: orgId, members: members,
      layer: P0.layer || 'pedestrian', mode: st.mode || 'walk', speed: st.speed || SIM.SPEED.walk,
      spread: gov.mode === 'escorted_cohort' ? 0.9 : 1.5
    });

    /* reserve SLEEP beds at lodge for the stay so hostel saturation & camp overflow reflect true occupancy */
    members.forEach(function(id){ SIM.reserve(SIM.R.actor[id], lodge, 'SLEEP'); });
    if((P.lodging.overflowCamps || []).indexOf(lodge.id) >= 0){
      PG.campOcc[lodge.id] = (PG.campOcc[lodge.id] || 0) + members.length;
      P.stats.campPeak = Math.max(P.stats.campPeak, lodge.occ.SLEEP || 0);
    }
    if(st.fromSettlement) PG.away[st.fromSettlement] = (PG.away[st.fromSettlement] || 0) + count;

    var recG = PG.groups[gid] = {
      id: gid, pilg: P.id, stream: st.id, count: count, lodge: lodge.id,
      exit: P0, stops: stops, stopI: 0, phase: 'walk', legArrive: t, until: minute,
      departMin: departMin, escorted: gov.mode === 'escorted_cohort', lastMealDay: Math.floor(minute / 1440) - 1
    };
    st.activeHeadcount += count;
    st.arrivedTotal += count;
    P.stats.pilgrimsArrived += count;
    syncCampPlaces(P);
    advancePilgrimGroup(recG, minute, t);
    SIM.logEvent('pilgrim_arrive', { id:P.id, stream:st.id, group:gid, people:members.length, lodge:lodge.id, escorted:recG.escorted });
    return G;
  }

  function routeGroupTo(recG, targetDoor, act, placeId, t){
    var G = SIM.R.group[recG.id];
    if(!G || !G.members.length) return 0;
    var lead = SIM.R.actor[G.members[0]];
    if(!lead) return 0;
    var from = SIM.pose(lead, t), layer = G.layer || 'pedestrian', spd = G.speed == null ? SIM.SPEED.walk : G.speed;
    var r = SIM.nav && SIM.nav.layers[layer] ? SIM.nav.route(layer, from, targetDoor, { minW:0 }) : null;
    if(!r){
      var dx = targetDoor.x - from.x, dz = targetDoor.z - from.z, len = Math.hypot(dx, dz);
      r = { pts:[[from.x, from.y==null?0:from.y, from.z], [targetDoor.x, targetDoor.y==null?0:targetDoor.y, targetDoor.z]], cum:[0, len], len:len, layer:layer, straight:true };
    }
    var dur = r.len > 0.01 ? r.len / spd : 0, spr = G.spread == null ? 1.4 : G.spread;
    G.members.forEach(function(id, i){
      var a = SIM.R.actor[id]; if(!a) return;
      var row = spr === 0 ? i : Math.floor(i / 2), side = spr === 0 || !i ? 0 : (i % 2 ? 1 : -1) * spr;
      a.activity = act; a.place = placeId || null;
      a.plan = [{ activity:act, place:placeId || null, together:true }]; a.planI = 0;
      a.task = {
        act: act, place: placeId || null, t0: t,
        legs: dur > 0 ? [{ route:r, speed:spd, mode:G.mode||'walk', layer:layer, dur:dur, back:row*2.4, side:side }] : [],
        spot: targetDoor, dur: dur, arrive: t + dur, indoor: false, wander: placeId ? 2.5 : 0, together: G.id
      };
    });
    recG.legArrive = t + dur;
    return dur;
  }

  function cleanupGroup(recG){
    var PG = ensureState(), P = PG.by[recG.pilg];
    var st = P ? P.streams.filter(function(s){ return s.id === recG.stream; })[0] : null;
    var G = SIM.R.group[recG.id];
    if(G){
      G.members.forEach(function(id){
        var a = SIM.R.actor[id];
        if(a){ SIM.release(a); a.present = false; SIM.remove('actor', id); }
      });
      SIM.remove('group', recG.id);
    }
    if((P && P.lodging.overflowCamps || []).indexOf(recG.lodge) >= 0){
      PG.campOcc[recG.lodge] = Math.max(0, (PG.campOcc[recG.lodge] || 0) - (G ? G.members.length : recG.count));
    }
    if(st){
      st.activeHeadcount = Math.max(0, st.activeHeadcount - recG.count);
      if(st.fromSettlement) PG.away[st.fromSettlement] = Math.max(0, (PG.away[st.fromSettlement] || 0) - recG.count);
    }
    delete PG.groups[recG.id];
    if(P) syncCampPlaces(P);
  }

  function advancePilgrimGroup(recG, minute, t){
    var PG = ensureState(), P = PG.by[recG.pilg];
    if(!P){ cleanupGroup(recG); return; }
    var st = P.streams.filter(function(s){ return s.id === recG.stream; })[0];
    var curDay = Math.floor(minute / 1440);

    /* daily meal, offering & souvenir accounting while staying in the shrine settlement */
    if(curDay > recG.lastMealDay && recG.phase !== 'depart'){
      recG.lastMealDay = curDay;
      if(SIM.ECON || SIM.ECONS){
        SIM.withEcon(P.to, function(){
          for(var m=0; m<recG.count; m++) if(SIM.economyMeal()) P.stats.mealsEaten++;
        });
      }
      if(st) settleOfferingAndSouvenirs(P, st, recG.count, curDay);
    }

    if(recG.phase === 'depart'){
      if(t >= recG.legArrive){
        SIM.logEvent('pilgrim_depart', { id:P.id, stream:recG.stream, group:recG.id });
        cleanupGroup(recG);
      }
      return;
    }

    if(minute >= recG.departMin){
      recG.phase = 'depart';
      routeGroupTo(recG, { x:recG.exit.x, z:recG.exit.z, y:recG.exit.y||0 }, 'DEPART', null, t);
      return;
    }

    if(recG.phase === 'walk' && t >= recG.legArrive){
      var curStop = recG.stops[recG.stopI];
      recG.phase = 'dwell';
      recG.until = minute + (curStop ? curStop.mins : 60);
      return;
    }

    if(recG.phase === 'dwell' && minute >= recG.until){
      recG.stopI = (recG.stopI + 1) % recG.stops.length;
      var nextStop = recG.stops[recG.stopI], pl = nextStop ? SIM.R.place[nextStop.place] : SIM.R.place[recG.lodge];
      if(!pl) pl = SIM.R.place[recG.lodge];
      recG.phase = 'walk';
      routeGroupTo(recG, pl.door, nextStop ? nextStop.act : 'WORSHIP', pl.id, t);
      return;
    }

    if(recG.phase === 'walk' && recG.legArrive === t && recG.stops.length){
      var s0 = recG.stops[0], p0 = SIM.R.place[s0.place];
      if(p0) routeGroupTo(recG, p0.door, s0.act, p0.id, t);
    }
  }

  /* ---- hourly driver: runs both PRESENTED spawning and ABSTRACT ledger-exact books ---- */
  function stepHour(minute, t){
    var PG = ensureState(), hr = Math.floor(minute / 60);
    if(PG.lastHour === null) PG.lastHour = hr - 1;
    var spanHrs = Math.min(24, hr - PG.lastHour);
    if(spanHrs < 1) return;
    PG.lastHour = hr;

    PG.order.forEach(function(id){
      var P = PG.by[id], ws = windowState(P, minute), isAbs = SIM.levelOf && SIM.levelOf(P.to) === 'abstract';
      P.currentWindow = ws;
      P.streams.forEach(function(st){
        var fac = streamFactor(P, st);
        var ratePerHr = (st.basePerDay * ws.mult * fac) / 24;
        if(isAbs){
          /* ABSTRACT settlement: exact statistical active headcount, meals, offerings & souvenirs without nav/actors */
          var avgStayDays = (P.stayNights[0] + P.stayNights[1]) * 0.5;
          var targetHead = Math.round(st.basePerDay * ws.mult * fac * avgStayDays);
          if(st.fromSettlement){
            PG.away[st.fromSettlement] = targetHead;
          }
          st.activeHeadcount = targetHead;
          if(minute % 1440 < 60 && targetHead > 0){
            var dSeed = Math.floor(minute / 1440);
            st.arrivedTotal += Math.round(st.basePerDay * ws.mult * fac);
            P.stats.pilgrimsArrived += Math.round(st.basePerDay * ws.mult * fac);
            if(SIM.ECON || SIM.ECONS){
              SIM.withEcon(P.to, function(){
                for(var m=0; m<targetHead; m++) if(SIM.economyMeal()) P.stats.mealsEaten++;
              });
            }
            settleOfferingAndSouvenirs(P, st, targetHead, dSeed);
          }
        } else {
          /* PRESENTED settlement: accumulate arrivals and spawn embodied cohorts */
          st.acc += ratePerHr * spanHrs;
          var minP = P.partySize[0], maxP = P.partySize[1];
          var wantN = st.governance && st.governance.cohortSize ? st.governance.cohortSize :
                      (minP + Math.floor(h32(strHash(st.id), hr, 11) * (maxP - minP + 1)));
          while(st.acc >= wantN){
            st.acc -= wantN;
            if(!spawnCohort(P, st, wantN, minute, t)) break;
          }
        }
      });
    });

    PG.marketOrder.forEach(function(mid){
      refreshMarket(PG.markets[mid], minute);
    });
  }

  /* ---- THE GREAT PILGRIM'S MARKET: rare & far-flung reagents, tech and artifacts ---- */
  SIM.pilgrimMarket = function(o){
    if(!o || !o.id) throw new Error('SIM.pilgrimMarket: needs an id');
    if(!o.pilgrimage) throw new Error('SIM.pilgrimMarket '+o.id+': needs pilgrimage id');
    var PG = ensureState();
    if(PG.markets[o.id]) throw new Error('SIM.pilgrimMarket: duplicate id '+o.id);
    var M = {
      id: o.id,
      pilgrimage: o.pilgrimage,
      settlement: o.settlement || (PG.by[o.pilgrimage] && PG.by[o.pilgrimage].to) || null,
      place: o.place || null,
      minPilgrims: o.minPilgrims == null ? 10 : o.minPilgrims,
      floodOnly: o.floodOnly !== false,
      epochDays: o.epochDays == null ? 7 : o.epochDays,
      currency: o.currency || 'talent',
      hostAcct: o.hostAcct || null,
      treasuryTax: o.treasuryTax == null ? 0.10 : o.treasuryTax,
      pools: o.pools ? JSON.parse(JSON.stringify(o.pools)) : {},
      open: false,
      epoch: null,
      seededStreams: {},
      lots: {},
      lotOrder: [],
      stats: { sales:0, revenue:0, taxPaid:0, byCat:{} }
    };
    PG.markets[M.id] = M;
    PG.marketOrder.push(M.id);
    if(M.place && SIM.R.place[M.place]) SIM.R.place[M.place].closed = true;
    return M;
  };

  function totalPilgrimsIn(P){
    var n = 0;
    P.streams.forEach(function(st){ n += st.activeHeadcount || 0; });
    return n;
  }

  function refreshMarket(M, minute){
    var PG = ensureState(), P = PG.by[M.pilgrimage];
    if(!P) return;
    var ws = windowState(P, minute), tot = totalPilgrimsIn(P);
    var shouldOpen = (!M.floodOnly || ws.flood) && tot >= M.minPilgrims;
    var epoch = Math.floor(minute / (M.epochDays * 1440));

    if(!shouldOpen){
      if(M.open){
        M.open = false; M.seededStreams = {}; M.lots = {}; M.lotOrder = [];
        if(M.place && SIM.R.place[M.place]){ SIM.R.place[M.place].closed = true; if(SIM.placesChanged) SIM.placesChanged(); }
        SIM.logEvent('pilgrim_market_close', { market:M.id });
      }
      return;
    }

    /* Stock lots causally from ONLY the streams whose pilgrims are actually present; newly arriving streams add stalls! */
    var firstOpen = !M.open || M.epoch !== epoch;
    if(firstOpen){
      M.open = true; M.epoch = epoch; M.seededStreams = {}; M.lots = {}; M.lotOrder = [];
      if(M.place && SIM.R.place[M.place]){ SIM.R.place[M.place].closed = false; if(SIM.placesChanged) SIM.placesChanged(); }
    }
    var addedAny = false;
    P.streams.forEach(function(st){
      if(!(st.activeHeadcount > 0) || M.seededStreams[st.id]) return;
      M.seededStreams[st.id] = true;
      var pool = M.pools[st.id];
      if(!pool || !pool.length) return;
      var scale = Math.max(1, st.activeHeadcount / Math.max(1, st.basePerDay));
      for(var i=0; i<pool.length; i++){
        var entry = pool[i];
        var seedVal = SIM.seed == null ? 1 : SIM.seed;
        var roll = h32(seedVal ^ strHash(M.id + ':' + st.id), epoch, i * 17 + 3);
        var chance = Math.min(1, (entry.rarity == null ? 0.75 : entry.rarity) * Math.min(1.5, 0.65 + 0.35 * scale));
        if(roll > chance) continue;
        var q0 = entry.qty ? entry.qty[0] : 1, q1 = entry.qty ? entry.qty[1] : q0;
        var qty = Math.max(1, Math.round((q0 + h32(strHash(entry.id), epoch, i * 31 + 9) * (q1 - q0)) * Math.min(2, 0.5 + 0.5 * scale)));
        var lid = st.id + ':' + entry.id;
        M.lots[lid] = {
          id: lid,
          entryId: entry.id,
          stream: st.id,
          faction: st.faction || null,
          cat: entry.cat || 'reagent',     /* 'reagent' | 'tech' | 'artifact' */
          good: entry.good || null,        /* optional SIM.ECON warehouse commodity */
          item: entry.item || null,        /* optional SIM.ITEMS / actor inventory id */
          qty: qty,
          initialQty: qty,
          price: entry.price == null ? 25 : entry.price,
          covert: !!entry.covert,
          desc: entry.desc || entry.id
        };
        M.lotOrder.push(lid);
        addedAny = true;
      }
    });
    if(firstOpen || addedAny){
      SIM.logEvent('pilgrim_market_open', { market:M.id, epoch:epoch, lots:M.lotOrder.length, pilgrims:tot });
    }
  }

  SIM.pilgrimMarketOffers = function(marketId, opts){
    var PG = ensureState(), M = PG.markets[marketId];
    if(!M) return [];
    refreshMarket(M, SIM.minute());
    if(!M.open) return [];
    var incCovert = !!(opts && opts.covert), cat = opts && opts.cat;
    return M.lotOrder.map(function(id){ return M.lots[id]; }).filter(function(L){
      if(!L || L.qty <= 0) return false;
      if(L.covert && !incCovert) return false;
      if(cat && L.cat !== cat) return false;
      return true;
    });
  };

  /* Buy from the Great Pilgrim's Market: settles money (tax to host + remainder to pilgrim stream's account) and
     delivers `item` to buyer.actor (SIM.give) and/or `good` to host settlement warehouse (booked `imported` so
     SIM.ledger closes with 0.00 residual!) */
  SIM.pilgrimMarketBuy = function(marketId, lotId, qty, buyer){
    var PG = ensureState(), M = PG.markets[marketId];
    if(!M) return { ok:false, why:'unknown market' };
    refreshMarket(M, SIM.minute());
    if(!M.open) return { ok:false, why:'market closed' };
    var L = M.lots[lotId];
    if(!L || L.qty <= 0) return { ok:false, why:'out of stock' };
    buyer = buyer || {};
    if(L.covert && !buyer.covert) return { ok:false, why:'covert lot requires discreet access' };
    var n = Math.min(L.qty, Math.max(1, Math.floor(qty == null ? 1 : qty)));
    var totalCost = Math.round(L.price * n);
    var P = PG.by[M.pilgrimage], st = P.streams.filter(function(s){ return s.id === L.stream; })[0];

    if(SIM.MONEY && buyer.account){
      var bAcc = SIM.acct(buyer.account);
      if(!bAcc) return { ok:false, why:'unknown buyer account' };
      if(bAcc.balance < totalCost) return { ok:false, why:'insufficient funds' };
      var sellerAcc = ensureStreamAccount(P, st, M.currency);
      var tax = M.hostAcct && SIM.acct(M.hostAcct) ? Math.floor(totalCost * M.treasuryTax) : 0;
      var net = totalCost - tax;
      if(bAcc.currency === M.currency){
        if(tax > 0) SIM.pay(bAcc.id, M.hostAcct, tax, 'pilgrim market toll', true);
        if(net > 0 && sellerAcc) SIM.pay(bAcc.id, sellerAcc.id, net, 'pilgrim market sale', true);
      } else {
        if(tax > 0) SIM.exchange(bAcc.id, M.hostAcct, tax, 'pilgrim market toll');
        if(net > 0 && sellerAcc) SIM.exchange(bAcc.id, sellerAcc.id, net, 'pilgrim market sale');
      }
      M.stats.taxPaid += tax;
    }

    L.qty -= n;
    if(buyer.actor && L.item && SIM.give){
      var actObj = typeof buyer.actor === 'string' ? SIM.R.actor[buyer.actor] : buyer.actor;
      if(actObj) SIM.give(actObj, L.item, n);
    }
    if(L.good && M.settlement && (SIM.ECON || SIM.ECONS) && buyer.toWarehouse !== false){
      SIM.withEcon(M.settlement, function(){
        if(SIM.ECON && SIM.ECON.goods[L.good] && SIM.economyLand(L.good, n, buyer.place || M.place)){
          SIM.economyBook('imported', L.good, n);
        }
      });
    }
    M.stats.sales += n;
    M.stats.revenue += totalCost;
    M.stats.byCat[L.cat] = (M.stats.byCat[L.cat] || 0) + n;
    SIM.logEvent('pilgrim_market_buy', { market:M.id, lot:lotId, cat:L.cat, qty:n, cost:totalCost });
    return { ok:true, lot:L.id, cat:L.cat, qty:n, cost:totalCost, remaining:L.qty };
  };

  /* ---- reporting & core/camp tent-count helper ---- */
  SIM.awayPilgrims = function(settlement){
    return (SIM.PILGRIMS && SIM.PILGRIMS.away[settlement]) || 0;
  };

  SIM.pilgrimCampTents = function(placeId){
    var pl = SIM.R.place && SIM.R.place[placeId];
    if(!pl || pl.closed) return 0;
    var occ = (pl.occ && pl.occ.SLEEP) || 0;
    if(occ <= 0) return 0;
    var cap = 6;
    if(SIM.PILGRIMS){
      SIM.PILGRIMS.order.forEach(function(id){
        var P = SIM.PILGRIMS.by[id];
        if((P.lodging.overflowCamps || []).indexOf(placeId) >= 0) cap = P.lodging.tentCap == null ? 6 : P.lodging.tentCap;
      });
    }
    return Math.ceil(occ / cap);
  };

  SIM.pilgrimReport = function(id){
    var PG = SIM.PILGRIMS;
    if(!PG) return {};
    var ids = id ? [id] : PG.order, out = {};
    ids.forEach(function(k){
      var P = PG.by[k]; if(!P) return;
      var streams = {};
      P.streams.forEach(function(s){
        streams[s.id] = { active:s.activeHeadcount, arrived:s.arrivedTotal, souvenirs:s.souvenirsTaken, offerings:s.offeringsPaid };
      });
      out[k] = {
        to: P.to,
        activePilgrims: totalPilgrimsIn(P),
        window: P.currentWindow || windowState(P, SIM.minute()),
        streams: streams,
        stats: JSON.parse(JSON.stringify(P.stats))
      };
    });
    return id ? out[id] : out;
  };

  /* ---- step hook & SIM.level('presented') sync ---- */
  SIM.stepHooks = SIM.stepHooks || [];
  SIM.stepHooks.push(function(minute, t){
    if(!SIM.PILGRIMS) return;
    Object.keys(SIM.PILGRIMS.groups).forEach(function(gid){
      var recG = SIM.PILGRIMS.groups[gid];
      if(recG) advancePilgrimGroup(recG, minute, t);
    });
    stepHour(minute, t);
  });

  if(SIM.level){
    var level0 = SIM.level;
    SIM.level = function(s, lv){
      if(SIM.PILGRIMS && lv === 'abstract'){
        /* clean up embodied pilgrim groups in `s` before lowering to statistical abstract books */
        Object.keys(SIM.PILGRIMS.groups).forEach(function(gid){
          var recG = SIM.PILGRIMS.groups[gid], P = SIM.PILGRIMS.by[recG.pilg];
          if(P && P.to === s) cleanupGroup(recG);
        });
      }
      var res = level0(s, lv);
      if(SIM.PILGRIMS && lv === 'presented'){
        /* materialize active statistical pilgrims into embodied cohorts on raising */
        SIM.PILGRIMS.order.forEach(function(id){
          var P = SIM.PILGRIMS.by[id];
          if(P.to !== s) return;
          var m = SIM.minute(), t = SIM.time();
          P.streams.forEach(function(st){
            var target = st.activeHeadcount || 0;
            st.activeHeadcount = 0;
            var wantN = (st.governance && st.governance.cohortSize) || P.partySize[0] || 4;
            var spawned = 0;
            while(spawned + wantN <= target){
              if(!spawnCohort(P, st, wantN, m, t)) break;
              spawned += wantN;
            }
          });
        });
      }
      return res;
    };
  }

  var init0 = SIM.init;
  SIM.init = function(o){
    SIM.PILGRIMS = null;
    return init0(o);
  };
})(typeof window!=='undefined'?window:globalThis);
