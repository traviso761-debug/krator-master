// ================================================================= CORE — simulation 6: production, stores, carts, imports
// PLAN.md's reserved economy slot; the Voth brief (settlements/streetlab/SIM-ROADMAP.md 1.6, 2.6: phase E). Opt-in:
// nothing here runs until a world calls SIM.economy(config).
//
//   SIM.economy({ goods:{id:{import?:{route, lot}}}, inputs:{good:{input: per unit}}, every (minutes between ticks),
//                 cart:{cap, load, unload, minLoad, near}, imports:{days, scan}, routes:{name:{port, minutes}},
//                 window (days the turnover is averaged over), meal:{per, foods} })
//   SIM.store(place, {kind:'site'|'warehouse', cap})      a place's store: place.stock {good: n}
//   SIM.recipe(place, {out:[goods], rate, cap})            a producer: `rate` units a worker-hour (times the workers'
//                                                           efficiency), each unit of the good in `out` most needed
//   SIM.cart(actor)                                        an actor the economy drives (SIM.step leaves it alone)
//   SIM.supply(good, n, whole?) -> n had                   a draw on the warehouses (`whole`: all of n or nothing)
//   SIM.economyMeal() -> true if the meal was there        a meal cooked out (a tavern, a mess): `meal.per` units of
//                                                           the `meal.foods` the warehouses hold most of
//   SIM.economyDays(good) -> days its stock lasts          SIM.economyReport() -> per good and per site
//
// PRODUCTION (a tick every `every` world minutes): a producer's workers at work (arrived, doing WORK there) times their
// efficiency (SIM.mood: the needs' band and the items' tool and hurt) times `rate` units an hour, each unit of the good
// in its `out` whose city stock lasts fewest days, made only if its `inputs` are in the producer's own store or the
// warehouses, into the producer's store up to its `cap`. CARTS (the brief's pick order): an idle cart goes to the site
// whose stored good is most in demand (fewest days left), then the most stored that no other cart is bound for, then the
// nearest; loads up to `cap`, takes it to the warehouse with the least of that good among the `near` nearest (all when
// unset; the nearest of equals), unloads, and is idle again. CONSUMPTION: SIM.supply and SIM.economyMeal take from the warehouses (the one holding most first); the
// items module asks them for every purchase and every meal out or at a mess when this module is on (a shop sells from
// the settlement's store: it can be out). TURNOVER: what is used a day, over the last `window` days and today so far;
// DAYS LEFT the warehoused stock over it. IMPORTS: every `imports.scan` minutes, a good whose stock lasts fewer than
// `imports.days` days and has an `import` sends for a lot by its route; it arrives after the route's `minutes` at the
// warehouse with the least of it (a shipment in flight is logged; its ship, barge or caravan is drawn in a later
// session). Deterministic: no draws.
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.ECON = null;
  SIM.economy = function(o){
    var E = { goods:{}, inputs:o.inputs||{}, every:o.every||60, cart:Object.assign({ cap:500, load:20, unload:20, minLoad:20 }, o.cart||{}),
              imports:Object.assign({ days:3, scan:60 }, o.imports||{}), routes:o.routes||{}, window:o.window||2, meal:o.meal||null,
              stores:{}, warehouses:[], sites:[], recipes:{}, carts:[], inflight:[], last:null, lastScan:null, dl:null, dlAt:null,
              made:{}, used:{}, imported:{}, short:{}, blocked:{}, day:{}, trips:0, hauled:{}, sent:0 };
    Object.keys(o.goods||{}).forEach(function(g){ E.goods[g]=Object.assign({ id:g }, o.goods[g]); });
    SIM.ECON = E; return E;
  };
  function stat(o, k, n){ o[k]=(o[k]||0)+(n==null?1:n); }
  function today(){ return Math.floor(SIM.minute()/1440); }
  function dayStat(kind, g, n){ var E=SIM.ECON, d=today(), D=E.day[d]||(E.day[d]={ made:{}, used:{}, imported:{} }); stat(D[kind], g, n); stat(E[kind], g, n); }
  SIM.store = function(id, o){ var E=SIM.ECON, P=SIM.R.place[id]; if(!E || !P) return null; o=o||{};
    P.stock=P.stock||{}; P.cap=o.cap==null?Infinity:o.cap; P.storeKind=o.kind||'site'; E.stores[id]=P;
    if(P.storeKind==='warehouse'){ if(E.warehouses.indexOf(P)<0) E.warehouses.push(P); } else if(E.sites.indexOf(P)<0) E.sites.push(P); return P; };
  SIM.recipe = function(id, o){ var E=SIM.ECON, P=SIM.R.place[id]; if(!E || !P) return null; if(!E.stores[id]) SIM.store(id, { kind:'site', cap:o.cap });
    o.out.forEach(function(g){ if(!E.goods[g]) throw new Error('SIM.recipe '+id+': unknown good '+g); }); E.recipes[id]={ out:o.out.slice(), rate:o.rate }; return P; };
  SIM.cart = function(a){ var E=SIM.ECON; a.driven=true; a.cart={ phase:'idle' }; E.carts.push(a); return a; };
  function held(P){ var n=0; for(var g in P.stock) n+=P.stock[g]; return n; }
  SIM.stockOf = function(g){ var E=SIM.ECON, n=0; E.warehouses.forEach(function(W){ n+=W.stock[g]||0; }); return n; };
  /* what a good is used a day, over the last `window` whole days and today so far (from its second hour) */
  function useRate(g){ var E=SIM.ECON, d=today(), m=SIM.minute()%1440, tot=0, days=0;
    for(var k=Math.max(0, d-E.window); k<d; k++){ if(E.day[k]){ tot+=E.day[k].used[g]||0; days++; } }
    var td=E.day[d]; if(td && m>60){ tot+=td.used[g]||0; days+=m/1440; }
    return days>0 ? tot/days : 0; }
  SIM.economyDays = function(g){ var r=useRate(g), s=SIM.stockOf(g); return r>0 ? s/r : Infinity; };
  /* the days left, asked many times a minute (each cart, each unit made): computed once a minute */
  function daysOf(g){ var E=SIM.ECON, m=SIM.minute(); if(E.dlAt!==m){ E.dl={}; E.dlAt=m; } var v=E.dl[g]; return v!=null ? v : (E.dl[g]=SIM.economyDays(g)); }
  function byMost(g){ return function(p, q){ return (q.stock[g]||0)-(p.stock[g]||0) || (p.id<q.id?-1:1); }; }
  SIM.supply = function(g, n, whole){ var E=SIM.ECON; if(!E || !E.goods[g]) return n;
    if(whole && SIM.stockOf(g)<n){ stat(E.short, g, n); return 0; }
    var want=n, got=0, W=E.warehouses.filter(function(P){ return (P.stock[g]||0)>0; }).sort(byMost(g));
    for(var i=0;i<W.length && want>0;i++){ var t=Math.min(want, W[i].stock[g]); W[i].stock[g]-=t; want-=t; got+=t; }
    if(got){ dayStat('used', g, got); if(E.dlAt!=null) E.dl[g]=null; } if(got<n) stat(E.short, g, n-got);
    return got; };
  SIM.economyMeal = function(){ var E=SIM.ECON, M=E && E.meal; if(!M) return true; var per=M.per||2, left=per;
    var have=M.foods.filter(function(f){ return SIM.stockOf(f)>0; }).sort(function(x, y){ return SIM.stockOf(y)-SIM.stockOf(x) || (x<y?-1:1); });
    for(var i=0;i<have.length && left>0;i++) left-=SIM.supply(have[i], 1);
    for(i=0;i<have.length && left>0;i++) left-=SIM.supply(have[i], left);
    if(left>0) stat(E.short, 'meal'); return left<per; };
  function inputsFor(P, g){ var E=SIM.ECON, need=E.inputs[g]; if(!need) return true;
    return Object.keys(need).every(function(i){ return (P.stock[i]||0)+SIM.stockOf(i) >= need[i]; }); }
  function useInputs(P, g){ var E=SIM.ECON, need=E.inputs[g]; if(!need) return;
    Object.keys(need).forEach(function(i){ var t=Math.min(need[i], P.stock[i]||0); P.stock[i]=(P.stock[i]||0)-t; if(need[i]-t>0) SIM.supply(i, need[i]-t); }); }

  /* ---------------------------------------------------------------- the tick: production */
  function tick(minute, t){
    var E=SIM.ECON, hrs=(minute-E.last)/60; E.last=minute; if(hrs<=0) return;
    var W={};   /* each producer's workers at work, their efficiency summed */
    SIM.all('actor').forEach(function(a){ if(a.activity!=='WORK' || !a.place || !E.recipes[a.place] || !a.task || t<a.task.arrive) return;
      var m=SIM.mood ? SIM.mood(a) : null; W[a.place]=(W[a.place]||0)+(m ? m.eff : 1); });
    Object.keys(W).forEach(function(id){
      var P=SIM.R.place[id], R=E.recipes[id], units=W[id]*R.rate*hrs + (P.carry||0), whole=Math.floor(units); P.carry=units-whole;
      for(var u=0; u<whole; u++){
        if(held(P)>=P.cap){ stat(E.blocked, 'full: '+P.kind); P.carry=0; break; }
        var best=null, bd=Infinity; R.out.forEach(function(g){ if(!inputsFor(P, g)) return; var d=daysOf(g); if(best==null || d<bd){ bd=d; best=g; } });
        if(!best){ stat(E.blocked, 'inputs: '+P.kind); P.carry=0; break; }
        useInputs(P, best); P.stock[best]=(P.stock[best]||0)+1; dayStat('made', best, 1);
      }
    });
  }
  /* ---------------------------------------------------------------- the imports: sent for, delivered */
  function scanImports(minute){
    var E=SIM.ECON;
    Object.keys(E.goods).forEach(function(g){ var im=E.goods[g].import; if(!im) return;
      if(E.inflight.some(function(s){ return s.good===g; }) || daysOf(g) >= E.imports.days) return;
      var R=E.routes[im.route]||{ minutes:240 }; E.sent++;
      E.inflight.push({ good:g, n:im.lot, route:im.route, port:R.port||null, sent:minute, eta:minute+R.minutes });
      SIM.logEvent('import', { good:g, n:im.lot, route:im.route, days:Math.round(daysOf(g)*10)/10 }); });
    E.inflight = E.inflight.filter(function(s){ if(minute<s.eta) return true;
      var W=E.warehouses.slice().sort(function(p, q){ return (p.stock[s.good]||0)-(q.stock[s.good]||0) || (p.id<q.id?-1:1); })[0];
      if(W){ W.stock[s.good]=(W.stock[s.good]||0)+s.n; dayStat('imported', s.good, s.n); if(E.dlAt!=null) E.dl[s.good]=null; SIM.logEvent('delivered', { good:s.good, n:s.n, to:W.id }); }
      return false; });
  }

  /* ---------------------------------------------------------------- the carts */
  function go(a, P, minute, t){
    var from=SIM.pose(a, t, { cheap:true }), T=SIM.plan(a, P, 'HAUL', { x:from.x, y:from.y, z:from.z }, t);
    a.task=T; a.activity='HAUL'; a.place=P.id; a.since=minute;
  }
  function cartStep(minute, t){
    var E=SIM.ECON, C=E.cart, bound={};
    E.carts.forEach(function(a){ if(a.cart.site) bound[a.cart.site]=1; });
    E.carts.forEach(function(a){
      var K=a.cart;
      if(a.task && t<a.task.arrive) return;                                                     /* on the way */
      if(K.until!=null && minute<K.until) return;                                               /* loading, unloading, waiting */
      K.until=null;
      if(K.phase==='toSite'){ var S=SIM.R.place[K.site], g=K.good, n=Math.min(C.cap, S.stock[g]||0); S.stock[g]-=n; K.load={ good:g, n:n }; K.phase='loading'; K.until=minute+C.load; return; }
      if(K.phase==='loading'){
        var here=SIM.pose(a, t, { cheap:true }), lg=K.load.good;
        var dist=function(P){ return Math.hypot(P.x-here.x, P.z-here.z); }, Ws=E.warehouses.slice();
        if(C.near) Ws=Ws.sort(function(p, q){ return dist(p)-dist(q) || (p.id<q.id?-1:1); }).slice(0, C.near);   /* the nearest few */
        var Wh=Ws.sort(function(p, q){ return (p.stock[lg]||0)-(q.stock[lg]||0) || dist(p)-dist(q); })[0];
        if(!Wh){ K.phase='idle'; return; }
        delete bound[K.site]; K.site=null; K.wh=Wh.id; K.phase='toWarehouse'; go(a, Wh, minute, t); return; }
      if(K.phase==='toWarehouse'){ var Wp=SIM.R.place[K.wh]; Wp.stock[K.load.good]=(Wp.stock[K.load.good]||0)+K.load.n; stat(E.hauled, K.load.good, K.load.n); E.trips++;
        if(E.dlAt!=null) E.dl[K.load.good]=null; K.load=null; K.phase='unloading'; K.until=minute+C.unload; return; }
      /* idle (or unloaded): the site whose stored good is most in demand, then the most stored nobody is bound for, then the nearest */
      var at=SIM.pose(a, t, { cheap:true }), best=null, bk=null;
      E.sites.forEach(function(S){ if(bound[S.id]) return; var top=null, td=Infinity;
        for(var g in S.stock){ if(S.stock[g]<C.minLoad) continue; var d=daysOf(g); if(top==null || d<td || (d===td && S.stock[g]>S.stock[top])){ top=g; td=d; } }
        if(top==null) return; var key=[Math.min(99, Math.floor(td)), -held(S), Math.hypot(S.x-at.x, S.z-at.z)];
        if(!bk || key[0]<bk[0] || (key[0]===bk[0] && (key[1]<bk[1] || (key[1]===bk[1] && key[2]<bk[2])))){ bk=key; best={ S:S, g:top }; } });
      if(!best){ K.phase='idle'; K.until=minute+30; return; }
      K.site=best.S.id; K.good=best.g; bound[K.site]=1; K.phase='toSite'; go(a, best.S, minute, t);
    });
  }

  /* SIM.step's last act, once a minute */
  SIM.economyStep = function(minute, t){
    var E=SIM.ECON; if(!E) return;
    if(E.last==null) E.last=minute;
    if(minute-E.last >= E.every) tick(minute, t);
    if(E.lastScan==null || minute-E.lastScan >= E.imports.scan){ E.lastScan=minute; scanImports(minute); }
    cartStep(minute, t);
  };
  /* the clock jumped: production restarts from now (no output for the hours skipped); the carts go on */
  SIM.economyJump = function(minute){ var E=SIM.ECON; if(!E) return; E.last=minute; E.lastScan=null; };

  /* ---------------------------------------------------------------- the panel's numbers */
  SIM.economyReport = function(){
    var E=SIM.ECON; if(!E) return null; var d=today(), D=E.day[d-1]||E.day[d]||{ made:{}, used:{}, imported:{} };
    var out={ goods:{}, sites:[], carts:{}, inflight:E.inflight.map(function(s){ return { good:s.good, n:s.n, route:s.route, eta:s.eta }; }), trips:E.trips, sent:E.sent, short:Object.assign({}, E.short), blocked:Object.assign({}, E.blocked), minute:SIM.minute() };   /* copies: a report is a snapshot */
    Object.keys(E.goods).forEach(function(g){ out.goods[g]={ stock:SIM.stockOf(g), atSites:E.sites.reduce(function(s, P){ return s+(P.stock[g]||0); }, 0),
      madeDay:D.made[g]||0, usedDay:Math.round(useRate(g)), importedDay:D.imported[g]||0, days:Math.round(SIM.economyDays(g)*10)/10,
      made:E.made[g]||0, used:E.used[g]||0, imported:E.imported[g]||0, hauled:E.hauled[g]||0, short:E.short[g]||0 }; });
    E.carts.forEach(function(a){ stat(out.carts, a.cart.phase); });
    out.sites = E.sites.map(function(P){ var b=E.carts.filter(function(a){ return a.cart.site===P.id; }).length; return { id:P.id, kind:P.kind, held:held(P), cap:P.cap, carts:b }; })
      .sort(function(p, q){ return q.held-p.held || (p.id<q.id?-1:1); });
    return out;
  };
})(typeof window!=='undefined'?window:globalThis);
