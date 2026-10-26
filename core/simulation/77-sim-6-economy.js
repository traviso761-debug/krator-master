// ================================================================= CORE — simulation 6: production, stores, carts, imports
// PLAN.md's reserved economy slot; the Voth brief (settlements/voth/SIM-ROADMAP.md 1.6, 2.6: phase E). Opt-in:
// nothing here runs until a world calls SIM.economy(config).
//
//   SIM.economy({ goods:{id:{import?:{route, lot}, minLoad?, export?}}, inputs:{good:{input: per unit}}, every (minutes between ticks),
//                 cart:{cap, load, unload, minLoad, near}, imports:{days, scan}, routes:{name:{port, minutes}},
//                 window (days the turnover is averaged over), meal:{per, foods}, carriers, exports:{minDays, made},
//                 useShort? (the unmet draws count as use: a good nobody could get is wanted) })
//   SIM.store(place, {kind:'site'|'warehouse', cap})      a place's store: place.stock {good: n}
//   SIM.recipe(place, {out:[goods], rate, cap, herd?:{out, rate, tended, share}})   a producer: `rate` units a worker-hour (times the
//                                                           workers' efficiency), each unit of the good in `out` most needed;
//                                                           a herd's `rate` an animal-hour (actors with `herd` = the place, at
//                                                           home and grown (`grownAt` past), times their condition: SIM.mood; `tended`: only while
//                                                           its workers are there; `share`: each of `out` in its share, not
//                                                           the one most needed)
//   SIM.cart(actor)                                        an actor the economy drives (SIM.step leaves it alone)
//   SIM.supply(good, n, whole?) -> n had                   a draw on the warehouses (`whole`: all of n or nothing)
//   SIM.produce(place, good, n) -> n stored                a one-off yield (a slaughter's meat) into a place's store
//   SIM.economyMeal() -> true if the meal was there        a meal cooked out (a tavern, a mess): `meal.per` units of
//                                                           the `meal.foods` the warehouses hold most of
//   SIM.economyDays(good) -> days its stock lasts          SIM.economyReport() -> per good and per site
//
// PRODUCTION (a tick every `every` world minutes): a producer's workers at work (arrived, doing WORK there) times their
// efficiency (SIM.mood: the needs' band and the items' tool and hurt) times `rate` units an hour, each unit of the good
// in its `out` whose city stock lasts fewest days, made only if its `inputs` are in the producer's own store or the
// warehouses, into the producer's store up to its `cap`. CARTS (the brief's pick order): an idle cart goes to the site
// whose stored good is most in demand (fewest days left), then the most stored that no other cart is bound for, then the
// nearest (a good's own `minLoad` worth a trip, else the cart's); loads up to `cap`, takes it to the warehouse with the least of that good among the `near` nearest (all when
// unset; the nearest of equals), unloads, and is idle again. CONSUMPTION: SIM.supply and SIM.economyMeal take from the warehouses (the one holding most first); the
// items module asks them for every purchase and every meal out or at a mess when this module is on (a shop sells from
// the settlement's store: it can be out). TURNOVER: what is used a day, over the last `window` days and today so far;
// DAYS LEFT the warehoused stock over it. IMPORTS: every `imports.scan` minutes, a good whose stock lasts fewer than
// `imports.days` days (counting what the sites hold, not yet hauled) and has an `import` sends for a lot by its route. CARRIERS (`carriers:{route:{kind, org, from:
// [ports], unit:[{role, n}], size:[least, most units], cap (a unit's load), layer, mode, speed, beasts, mount, at (the
// place it unloads at), activity, mins (its stay)}]}`): the lot comes as a group (SIM.fire's itinerary: in by a port,
// to `at`, its stay, out by the same port) that unloads into `at`'s store on arrival (the carts take it on; the
// emptiest warehouse when `at` keeps no store) and, leaving, buys the good the city has most days of (made in the last
// day, over `exports.minDays`), as much as it carries, less what keeps `minDays`, and no more than the last day's
// surplus (made less used) times `exports.days`. A route with no carrier (or no port)
// delivers by timer after its `minutes`. Deterministic: no draws but SIM.fire's (the core's seeded RNG).
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.ECON = null;
  SIM.economy = function(o){
    var E = { goods:{}, inputs:o.inputs||{}, every:o.every||60, cart:Object.assign({ cap:500, load:20, unload:20, minLoad:20 }, o.cart||{}),
              imports:Object.assign({ days:3, scan:60 }, o.imports||{}), routes:o.routes||{}, window:o.window||2, meal:o.meal||null,
              stores:{}, warehouses:[], sites:[], recipes:{}, carts:[], inflight:[], last:null, lastScan:null, dl:null, dlAt:null,
              made:{}, used:{}, imported:{}, exported:{}, short:{}, blocked:{}, day:{}, trips:0, hauled:{}, sent:0,
              carriers:o.carriers||{}, exports:Object.assign({ minDays:6, made:true }, o.exports||{}), fired:0, landed:{} };
    if(o.useShort) E.useShort=true;   /* the unmet draws count as use (useRate): opt-in */
    Object.keys(o.goods||{}).forEach(function(g){ E.goods[g]=Object.assign({ id:g }, o.goods[g]); });
    SIM.ECON = E; return E;
  };
  function stat(o, k, n){ o[k]=(o[k]||0)+(n==null?1:n); }
  function today(){ return Math.floor(SIM.minute()/1440); }
  function dayStat(kind, g, n){ var E=SIM.ECON, d=today(), D=E.day[d]||(E.day[d]={ made:{}, used:{}, imported:{}, exported:{} }); stat(D[kind], g, n); stat(E[kind], g, n); }
  SIM.store = function(id, o){ var E=SIM.ECON, P=SIM.R.place[id]; if(!E || !P) return null; o=o||{};
    P.stock=P.stock||{}; P.cap=o.cap==null?Infinity:o.cap; P.storeKind=o.kind||'site'; E.stores[id]=P;
    if(P.storeKind==='warehouse'){ if(E.warehouses.indexOf(P)<0) E.warehouses.push(P); } else if(E.sites.indexOf(P)<0) E.sites.push(P); return P; };
  SIM.recipe = function(id, o){ var E=SIM.ECON, P=SIM.R.place[id]; if(!E || !P) return null; if(!E.stores[id]) SIM.store(id, { kind:'site', cap:o.cap });
    var outs=(o.out||[]).concat(o.herd ? o.herd.out : []); outs.forEach(function(g){ if(!E.goods[g]) throw new Error('SIM.recipe '+id+': unknown good '+g); });
    E.recipes[id]={ out:(o.out||[]).slice(), rate:o.rate||0, herd:o.herd ? { out:o.herd.out.slice(), rate:o.herd.rate, tended:!!o.herd.tended, share:o.herd.share||null } : null }; return P; };
  /* a one-off yield (a slaughter's meat): into the place's store, up to its cap; -> what went in */
  SIM.produce = function(id, g, n){ var E=SIM.ECON, P=SIM.R.place[id]; if(!E || !P || !E.goods[g] || !(n>0)) return 0; if(!E.stores[id]) SIM.store(id, { kind:'site' });
    var k=Math.max(0, Math.min(Math.floor(n), P.cap-held(P))); if(k<Math.floor(n)) stat(E.blocked, 'full: '+P.kind); if(k){ P.stock[g]=(P.stock[g]||0)+k; dayStat('made', g, k); } return k; };
  SIM.cart = function(a){ var E=SIM.ECON; a.driven=true; a.cart={ phase:'idle' }; E.carts.push(a); return a; };
  function held(P){ var n=0; for(var g in P.stock) n+=P.stock[g]; return n; }
  SIM.stockOf = function(g){ var E=SIM.ECON, n=0; E.warehouses.forEach(function(W){ n+=W.stock[g]||0; }); return n; };
  /* what a good is used a day, over the last `window` whole days and today so far (from its second hour). With
     `useShort` (opt-in) its unmet draws count too, at most once more its use (a shortfall's repeated attempts count each
     time; 77-sim-6-trade.js reads a town's want the same way): a good its buyers could not get is then wanted, its days
     finite, and a producer of several goods makes it */
  function useRate(g){ var E=SIM.ECON, d=today(), m=SIM.minute()%1440, tot=0, sh=0, days=0;
    for(var k=Math.max(0, d-E.window); k<d; k++){ if(E.day[k]){ tot+=E.day[k].used[g]||0; if(E.useShort) sh+=(E.day[k].short||{})[g]||0; days++; } }
    var td=E.day[d]; if(td && m>60){ tot+=td.used[g]||0; if(E.useShort) sh+=(td.short||{})[g]||0; days+=m/1440; }
    if(E.useShort) tot+=tot>0 ? Math.min(sh, tot) : sh;
    return days>0 ? tot/days : 0; }
  SIM.economyUse = useRate;   /* a good's use a day (77-sim-7-stocks.js) */
  SIM.economyDays = function(g){ var r=useRate(g), s=SIM.stockOf(g); return r>0 ? s/r : Infinity; };
  /* the days left, asked many times a minute (each cart, each unit made): computed once a minute */
  function daysOf(g){ var E=SIM.ECON, m=SIM.minute(); if(E.dlAt!==m){ E.dl={}; E.dlAt=m; } var v=E.dl[g]; return v!=null ? v : (E.dl[g]=SIM.economyDays(g)); }
  function byMost(g){ return function(p, q){ return (q.stock[g]||0)-(p.stock[g]||0) || (p.id<q.id?-1:1); }; }
  /* a draw unmet: the running count, and the day's (77-sim-6-trade.js reads a town's want of a good it has none of) */
  function shortStat(g, n){ var E=SIM.ECON, d=today(), D=E.day[d]||(E.day[d]={ made:{}, used:{}, imported:{}, exported:{} }); stat(D.short||(D.short={}), g, n); stat(E.short, g, n); }
  SIM.supply = function(g, n, whole){ var E=SIM.ECON; if(!E || !E.goods[g]) return n;
    if(whole && SIM.stockOf(g)<n){ shortStat(g, n); return 0; }
    var want=n, got=0, W=E.warehouses.filter(function(P){ return (P.stock[g]||0)>0; }).sort(byMost(g));
    for(var i=0;i<W.length && want>0;i++){ var t=Math.min(want, W[i].stock[g]); W[i].stock[g]-=t; want-=t; got+=t; }
    if(got){ dayStat('used', g, got); if(E.dlAt!=null) E.dl[g]=null; } if(got<n) shortStat(g, n-got);
    return got; };
  /* for 77-sim-6-trade.js, on SIM.ECON: a flow booked by the day; n taken from the warehouses (the fullest first), booked
     by the caller; n landed into a place's store (when it keeps one) else the emptiest warehouse -> the store's id */
  SIM.economyBook = function(kind, g, n){ dayStat(kind, g, n); var E=SIM.ECON; if(E.dlAt!=null) E.dl[g]=null; };
  SIM.economyTake = function(g, n){ var E=SIM.ECON, left=n, W=E.warehouses.filter(function(P){ return (P.stock[g]||0)>0; }).sort(byMost(g));
    for(var i=0;i<W.length && left>0;i++){ var k=Math.min(left, W[i].stock[g]); W[i].stock[g]-=k; left-=k; } return n-left; };
  SIM.economyLand = function(g, n, id){ var E=SIM.ECON, W=id!=null && E.stores[id] ? E.stores[id] : emptiest(g); if(!W) return null; W.stock[g]=(W.stock[g]||0)+n; return W.id; };
  SIM.economyMeal = function(){ var E=SIM.ECON, M=E && E.meal; if(!M) return true; var per=M.per||2, left=per;
    var have=M.foods.filter(function(f){ return SIM.stockOf(f)>0; }).sort(function(x, y){ return SIM.stockOf(y)-SIM.stockOf(x) || (x<y?-1:1); });
    for(var i=0;i<have.length && left>0;i++) left-=SIM.supply(have[i], 1);
    for(i=0;i<have.length && left>0;i++) left-=SIM.supply(have[i], left);
    if(left>0) stat(E.short, 'meal'); return left<per; };
  function inputsFor(P, g){ var E=SIM.ECON, need=E.inputs[g]; if(!need) return true;
    return Object.keys(need).every(function(i){ return (P.stock[i]||0)+SIM.stockOf(i) >= need[i]; }); }
  function useInputs(P, g){ var E=SIM.ECON, need=E.inputs[g]; if(!need) return;
    Object.keys(need).forEach(function(i){ var t=Math.min(need[i], P.stock[i]||0); P.stock[i]=(P.stock[i]||0)-t; if(t) dayStat('used', i, t); if(need[i]-t>0) SIM.supply(i, need[i]-t); }); }   /* its own store first: a use too */

  /* ---------------------------------------------------------------- the tick: production */
  /* `units` (with the place's carry under `ck`) of the goods in `outs`, each the one with fewest days left whose inputs
     are there, into the place's store up to its cap. A governed economy (77-sim-6-govern.js) takes the good furthest below
     its target by the governor's last look (its whole supply line: warehouses, sites, carts, at sea, over its target),
     so what piles at the makers' own stores is not made again */
  function pickDays(E, g){ var V=E.govern && E.govern.view[g]; return V ? (V.target>0 ? V.pos/V.target : Infinity) : daysOf(g); }
  function make(P, outs, units, ck){
    var E=SIM.ECON, u0=units + (P[ck]||0), whole=Math.floor(u0); P[ck]=u0-whole;
    for(var u=0; u<whole; u++){
      if(held(P)>=P.cap){ stat(E.blocked, 'full: '+P.kind); P[ck]=0; break; }
      var best=null, bd=Infinity; outs.forEach(function(g){ if(!inputsFor(P, g)) return; var d=pickDays(E, g); if(best==null || d<bd){ bd=d; best=g; } });
      if(!best){ stat(E.blocked, 'inputs: '+P.kind); P[ck]=0; break; }
      useInputs(P, best); P.stock[best]=(P.stock[best]||0)+1; dayStat('made', best, 1);
    }
  }
  /* THE ABSTRACT LEVEL (77-sim-7-lod.js, SIM.level): in a town nobody watches, a worker counts at its job in every hour
     its schedule says WORK, an animal at home, each at the efficiency it had when the town was lowered (absEff); a cart's
     trip takes the straight line times SIM.ABSTRACT_DETOUR at its speed, with no route, and it is where it went */
  function absTown(E){ return !!(SIM.ABSTRACT && E.settlement!=null && SIM.ABSTRACT[E.settlement]); }
  function absWork(E, a, minute, W, H){ var eff=a.absEff==null ? 1 : a.absEff;
    if(a.herd!=null){ if((a.grownAt!=null && a.grownAt>minute) || !a.present) return; if(E.recipes[a.herd] && E.recipes[a.herd].herd) H[a.herd]=(H[a.herd]||0)+eff; return; }
    if(!a.present || a.driven) return; var s=SIM.schedOf(a, minute); if(!s || s[Math.floor((minute%1440)/60)]!=='WORK') return;
    var w=a.work!=null ? a.work : (a.mem && a.mem.WORK); if(w==null || !E.recipes[w]) return; W[w]=(W[w]||0)+eff; }
  function cartAt(a, t){ if(!absTown(SIM.ECON)) return SIM.pose(a, t, { cheap:true }); var P=SIM.R.place[a.place] || SIM.R.place[a.home]; return P ? { x:P.x, y:P.y||0, z:P.z } : { x:0, y:0, z:0 }; }
  function tick(minute, t){
    var E=SIM.ECON, hrs=(minute-E.last)/60; E.last=minute; if(hrs<=0) return;
    var W={}, H={};   /* each producer's workers at work and its animals at home (SIM.recipe's herd), their efficiency summed */
    var abs=absTown(E);   /* a town at the abstract level (77-sim-7-lod.js): its people by their schedules, not their poses */
    SIM.all('actor').forEach(function(a){
      if(abs){ absWork(E, a, minute, W, H); return; }
      if(a.herd!=null){ if(a.grownAt!=null && a.grownAt>minute) return;   /* the young yield nothing until grown */
        if(a.present && a.place===a.herd && E.recipes[a.herd] && E.recipes[a.herd].herd && (!a.task || t>=a.task.arrive)){ var mh=SIM.mood ? SIM.mood(a) : null; H[a.herd]=(H[a.herd]||0)+(mh ? mh.eff : 1); } return; }
      if(a.activity!=='WORK' || !a.place || !E.recipes[a.place] || !a.task || t<a.task.arrive) return;
      var m=SIM.mood ? SIM.mood(a) : null; W[a.place]=(W[a.place]||0)+(m ? m.eff : 1); });
    Object.keys(H).forEach(function(id){ var R=E.recipes[id], Hd=R.herd; if(Hd.tended && !W[id]) return;
      if(Hd.share) Hd.out.forEach(function(g, i){ make(SIM.R.place[id], [g], H[id]*Hd.rate*Hd.share[i]*hrs, 'carryH'+i); });   /* co-products in their shares (a duck's eggs and its meat) */
      else make(SIM.R.place[id], Hd.out, H[id]*Hd.rate*hrs, 'carryH'); });   /* tended: only while its keepers are at work (the milking) */   /* the animals first: the milk the dairy then turns */
    Object.keys(W).forEach(function(id){ var R=E.recipes[id]; if(R.out.length && R.rate) make(SIM.R.place[id], R.out, W[id]*R.rate*hrs, 'carry'); });
  }
  /* ---------------------------------------------------------------- the imports: sent for, delivered */
  function emptiest(g){ return SIM.ECON.warehouses.slice().sort(function(p, q){ return (p.stock[g]||0)-(q.stock[g]||0) || (p.id<q.id?-1:1); })[0]; }
  /* a shipment lands: into the store of the place it is unloaded at (the carts take it on), else the emptiest warehouse */
  function land(s, P){ var E=SIM.ECON, W=P && E.stores[P.id] ? P : emptiest(s.good); s.done=true; if(!W) return; stat(E.landed, s.group && P ? 'carrier' : 'timer');
    W.stock[s.good]=(W.stock[s.good]||0)+s.n; dayStat('imported', s.good, s.n); if(E.dlAt!=null) E.dl[s.good]=null; SIM.logEvent('delivered', { good:s.good, n:s.n, to:W.id, by:s.group||'timer' }); }
  /* its carrier: a group by its route (SIM.fire's itinerary: in by a port, to the place `at`, a stay of `mins`, out by
     the same port), as many units as the lot needs at `cap` a unit within `size` */
  function carry(s, minute, t){ var E=SIM.ECON, C=E.carriers[s.route]; if(!C || !SIM.R.place[C.at] || !(C.from||[]).some(function(p){ return SIM.R.port[p]; })) return null;
    var u=Math.max(C.size[0], Math.min(C.size[1], Math.ceil(s.n/C.cap))), ev={ id:'import.'+s.good+'.'+(++E.fired), fired:0, kind:C.kind, org:C.org, from:C.from, unit:C.unit, size:[u, u],
      layer:C.layer, mode:C.mode, speed:C.speed, beasts:C.beasts, mount:C.mount, to:'same', legs:[{ place:C.at, activity:C.activity||'LODGE', mins:C.mins||0, stop:{ ship:s, cap:u*C.cap } }] };
    var G=SIM.fire(ev, minute, t); return G ? G.id : null; }
  function scanImports(minute, t){
    var E=SIM.ECON;
    Object.keys(E.goods).forEach(function(g){ var im=E.goods[g].import; if(!im) return;
      if(E.inflight.some(function(s){ return s.good===g; })) return;
      var r=useRate(g), near=SIM.stockOf(g)+E.sites.reduce(function(n, P){ return n+(P.stock[g]||0); }, 0)+(SIM.tradeInbound ? SIM.tradeInbound(g) : 0);   /* a lot landed or made, not yet hauled, counts; and one at sea from another town (77-sim-6-trade.js) */
      if(!(r>0) || near/r >= E.imports.days) return;
      var R=E.routes[im.route]||{ minutes:240 }, s={ good:g, n:im.lot, route:im.route, port:R.port||null, sent:minute, eta:minute+R.minutes }; E.sent++;
      s.group=carry(s, minute, t); if(s.group) s.eta=null; E.inflight.push(s);
      SIM.logEvent('import', { good:g, n:im.lot, route:im.route, by:s.group||'timer', days:Math.round(daysOf(g)*10)/10 }); });
    E.inflight = E.inflight.filter(function(s){ if(s.done) return false;
      if(s.group){ if(SIM.R.group[s.group]) return true; land(s, null); return false; }   /* a carrier gone without unloading: the timer's way */
      if(minute<s.eta) return true; land(s, null); return false; });
  }
  /* a carrier's stop (SIM.step's itinerary): on arrival it unloads; leaving, it buys the good the city has most days of
     (made in the last day, and over `exports.minDays`), as much as it carries less what keeps `minDays`, at most the
     last day's surplus times `exports.days` */
  SIM.economyStop = function(G, L, phase, minute){
    var E=SIM.ECON, S=L.stop; if(!E || !S) return;
    if(phase==='arrive' && S.ship && !S.ship.done){ land(S.ship, SIM.R.place[L.place]); return; }
    if(phase!=='leave' || G.cargo) return;
    var d=today(), D=E.day[d-1]||E.day[d]||{ made:{} }, best=null, bd=0;
    Object.keys(E.goods).forEach(function(g){ if(E.goods[g].export===false || (E.exports.made && !(D.made[g]>0))) return; var dl=daysOf(g); if(dl!==Infinity && dl>=E.exports.minDays && dl>bd){ bd=dl; best=g; } });
    if(!best) return; var surplus=Math.max(0, (D.made[best]||0)-((D.used||{})[best]||0))*(E.exports.days||2);   /* no more than the last day's surplus over `days` */
    var n=Math.min(S.cap||0, surplus, Math.floor(SIM.stockOf(best)-E.exports.minDays*useRate(best))); if(n<=0) return;
    var left=n, W=E.warehouses.filter(function(P){ return (P.stock[best]||0)>0; }).sort(byMost(best));
    for(var i=0;i<W.length && left>0;i++){ var k=Math.min(left, W[i].stock[best]); W[i].stock[best]-=k; left-=k; }
    G.cargo={ good:best, n:n-left }; if(E.settlement!=null) G.cargo.settlement=E.settlement; dayStat('exported', best, n-left); if(E.dlAt!=null) E.dl[best]=null; SIM.logEvent('export', { group:G.id, good:best, n:n-left });
  };

  /* ---------------------------------------------------------------- the carts */
  function go(a, P, minute, t){
    if(absTown(SIM.ECON)){ var o=cartAt(a, t), d=Math.hypot(P.x-o.x, P.z-o.z)*SIM.ABSTRACT_DETOUR/(a.speed||SIM.SPEED.cart);
      a.task={ act:'HAUL', place:P.id, t0:t, legs:[], dur:d, arrive:t+d, spot:P.door, indoor:false, abstract:{ x:o.x, y:o.y, z:o.z } }; a.activity='HAUL'; a.place=P.id; a.since=minute; return; }
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
        var here=cartAt(a, t), lg=K.load.good;
        var dist=function(P){ return Math.hypot(P.x-here.x, P.z-here.z); }, Ws=E.warehouses.slice();
        if(C.near) Ws=Ws.sort(function(p, q){ return dist(p)-dist(q) || (p.id<q.id?-1:1); }).slice(0, C.near);   /* the nearest few */
        var Wh=Ws.sort(function(p, q){ return (p.stock[lg]||0)-(q.stock[lg]||0) || dist(p)-dist(q); })[0];
        if(!Wh){ K.phase='idle'; return; }
        delete bound[K.site]; K.site=null; K.wh=Wh.id; K.phase='toWarehouse'; go(a, Wh, minute, t); return; }
      if(K.phase==='toWarehouse'){ var Wp=SIM.R.place[K.wh]; Wp.stock[K.load.good]=(Wp.stock[K.load.good]||0)+K.load.n; stat(E.hauled, K.load.good, K.load.n); E.trips++;
        if(E.dlAt!=null) E.dl[K.load.good]=null; K.load=null; K.phase='unloading'; K.until=minute+C.unload; return; }
      /* idle (or unloaded): the site whose stored good is most in demand, then the most stored nobody is bound for, then the nearest */
      var at=cartAt(a, t), best=null, bk=null;
      E.sites.forEach(function(S){ if(bound[S.id]) return; var top=null, td=Infinity;
        for(var g in S.stock){ var ml=E.goods[g] && E.goods[g].minLoad!=null ? E.goods[g].minLoad : C.minLoad; if(S.stock[g]<ml) continue; var d=daysOf(g); if(top==null || d<td || (d===td && S.stock[g]>S.stock[top])){ top=g; td=d; } }
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
    if(E.lastScan==null || minute-E.lastScan >= E.imports.scan){ E.lastScan=minute; scanImports(minute, t); }
    cartStep(minute, t);
    if(SIM.lodHour && absTown(E)) SIM.lodHour(E, minute);   /* the households' meals and shopping, by the hour (77-sim-7-lod.js) */
  };
  /* the clock jumped: production restarts from now (no output for the hours skipped); the carts go on */
  SIM.economyJump = function(minute){ var E=SIM.ECON; if(!E) return; E.last=minute; E.lastScan=null; };

  /* ---------------------------------------------------------------- the panel's numbers */
  SIM.economyReport = function(){
    var E=SIM.ECON; if(!E) return null; var d=today(), D=E.day[d-1]||E.day[d]||{ made:{}, used:{}, imported:{}, exported:{} };
    var out={ goods:{}, sites:[], carts:{}, inflight:E.inflight.map(function(s){ return { good:s.good, n:s.n, route:s.route, eta:s.eta, by:s.group||null }; }), trips:E.trips, sent:E.sent, landed:Object.assign({}, E.landed), short:Object.assign({}, E.short), blocked:Object.assign({}, E.blocked), minute:SIM.minute() };   /* copies: a report is a snapshot */
    Object.keys(E.goods).forEach(function(g){ out.goods[g]={ stock:SIM.stockOf(g), atSites:E.sites.reduce(function(s, P){ return s+(P.stock[g]||0); }, 0),
      madeDay:D.made[g]||0, usedDay:Math.round(useRate(g)), importedDay:D.imported[g]||0, days:Math.round(SIM.economyDays(g)*10)/10,
      made:E.made[g]||0, used:E.used[g]||0, imported:E.imported[g]||0, hauled:E.hauled[g]||0, short:E.short[g]||0, exportedDay:(D.exported||{})[g]||0, exported:E.exported[g]||0 }; });
    out.carriers = SIM.all('group').filter(function(G){ return /^import\./.test(G.id); }).map(function(G){ return { id:G.id, kind:G.kind, phase:G.phase, people:G.members.length, cargo:G.cargo||null }; });
    E.carts.forEach(function(a){ stat(out.carts, a.cart.phase); });
    out.sites = E.sites.map(function(P){ var b=E.carts.filter(function(a){ return a.cart.site===P.id; }).length; return { id:P.id, kind:P.kind, held:held(P), cap:P.cap, carts:b }; })
      .sort(function(p, q){ return q.held-p.held || (p.id<q.id?-1:1); });
    return out;
  };

  /* ---------------------------------------------------------------- settlements: one economy each (P7a) */
  /* settlements/isle-demo/PLAN.md section 9, P7a items 1, 2 and 5. OPT-IN: a page that never names a settlement runs one
     economy as before (SIM.ECONS stays null, every call below passes straight through). A page that does:
       SIM.settlement({id, faction, name?})           the settlement as a record (kind 'settlement')
       SIM.place({..., settlement: id})                a place belongs to one; an actor to its home's (SIM.settlementOf)
       SIM.economy(config, {settlement: id})           that settlement's own economy: its warehouses, sites, carts,
                                                       recipes, in-flight loads and books, apart from every other's
     Then SIM.store / recipe / produce / cart route to the economy of the place or actor they are given; SIM.supply,
     stockOf, economyMeal, economyDays and economyReport take a settlement as their last argument (or run inside
     SIM.withEcon); SIM.economyStep and economyJump step every economy in turn, in the order they were made. Inside an
     economy's turn SIM.ECON is that economy, so everything above runs unchanged on its own warehouses and books.
       SIM.econ(key)        the settlement's economy (SIM.ECON on an unkeyed page)
       SIM.withEcon(key, fn) fn() with SIM.ECON that settlement's (fn() as it is on an unkeyed page or an unknown key) */
  SIM.ECONS = null;
  SIM.ECON_ORDER = [];
  SIM.settlement = function(o){ if(!SIM.R.settlement){ SIM.R.settlement={}; SIM.order.settlement=[]; }   /* made on first use: an unkeyed page's registry is as it was */
    return SIM.add('settlement', o); };
  SIM.settlementOf = function(x){
    if(x==null) return null;
    if(typeof x!=='object'){ var P=SIM.R.place && SIM.R.place[x]; return P && P.settlement!=null ? P.settlement : null; }
    if(x.settlement!=null) return x.settlement;
    if(x.home!=null){ var Hm=SIM.R.place && SIM.R.place[x.home]; return Hm && Hm.settlement!=null ? Hm.settlement : null; }
    return null; };
  SIM.econ = function(key){ return SIM.ECONS ? (key==null ? null : SIM.ECONS[key] || null) : SIM.ECON; };
  SIM.withEcon = function(key, fn){
    if(!SIM.ECONS || key==null || !SIM.ECONS[key]) return fn();
    var prev=SIM.ECON; SIM.ECON=SIM.ECONS[key];
    try { return fn(); } finally { SIM.ECON=prev; } };
  var economy0=SIM.economy;
  SIM.economy = function(o, opt){
    var key=opt && opt.settlement!=null ? opt.settlement : null;
    if(key==null){ if(SIM.ECONS) throw new Error('SIM.economy: this page keys its economies by settlement; name one'); return economy0(o); }
    var prev=SIM.ECON, E=economy0(o); E.settlement=key;
    if(!SIM.ECONS){ SIM.ECONS={}; SIM.ECON_ORDER=[]; prev=null; route(); }
    if(SIM.ECONS[key]) throw new Error('SIM.economy: settlement '+key+' has an economy already');
    SIM.ECONS[key]=E; SIM.ECON_ORDER.push(key); SIM.ECON=prev || E;   /* SIM.ECON outside a turn: the first made (an "on" flag for the other modules) */
    return E; };
  /* the routed calls, installed when the first keyed economy is made (an unkeyed page keeps the plain ones): by the
     place or actor given, or by a settlement passed last */
  function route(){
    function byPlace(f){ return function(id){ var args=arguments; return SIM.withEcon(SIM.settlementOf(id), function(){ return f.apply(null, args); }); }; }
    function byLast(f, n){ return function(){ var args=Array.prototype.slice.call(arguments, 0, n), key=arguments.length>n ? arguments[n] : null;
      return SIM.withEcon(key, function(){ return f.apply(null, args); }); }; }
    SIM.store=byPlace(SIM.store); SIM.recipe=byPlace(SIM.recipe); SIM.produce=byPlace(SIM.produce);
    var cart0=SIM.cart; SIM.cart = function(a){ return SIM.withEcon(SIM.settlementOf(a), function(){ return cart0(a); }); };
    SIM.supply=byLast(SIM.supply, 3); SIM.stockOf=byLast(SIM.stockOf, 1); SIM.economyMeal=byLast(SIM.economyMeal, 0);
    SIM.economyDays=byLast(SIM.economyDays, 1); SIM.economyReport=byLast(SIM.economyReport, 0);
    var stop0=SIM.economyStop; SIM.economyStop = function(G, L, phase, minute){ return SIM.withEcon(SIM.settlementOf(L.place), function(){ return stop0(G, L, phase, minute); }); };   /* a carrier's stop: the economy of the place it stops at */
    var step0=SIM.economyStep, jump0=SIM.economyJump;
    SIM.economyStep = function(minute, t){ if(!SIM.ECONS) return step0(minute, t);
      SIM.ECON_ORDER.forEach(function(k){ SIM.withEcon(k, function(){ step0(minute, t); }); }); };
    SIM.economyJump = function(minute){ if(!SIM.ECONS) return jump0(minute);
      SIM.ECON_ORDER.forEach(function(k){ SIM.withEcon(k, function(){ jump0(minute); }); }); };
  }
})(typeof window!=='undefined'?window:globalThis);
