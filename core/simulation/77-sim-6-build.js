// ================================================================= CORE — simulation 6: building on empty lots, and upkeep
// core/simulation/PLAN-POLITICS.md section 4 (the owner, 2026-11-03: "most cities [should] have some fillable empty lots
// even while [the] player is [there], it adds demand for timber, stone, and other construction materials. We could also
// add building maintenance as a demand sink"). Opt-in: nothing here runs until a world calls SIM.build(config), on a
// world with keyed economies (77-sim-6-economy.js). It draws nothing.
//
//   SIM.build({ kinds:{kind: {bill:{good: n}, hours, life? (days a building of it lasts on its bill: its upkeep)}},
//               of?(P) -> the kind a standing building wears as (null: it does not wear), pace? (projects a settlement
//               keeps going at once: 1), crewPer? (then one project for every crewPer builders, at least `pace`),
//               grace? (days of upkeep owed before the first building shows its wear: 30),
//               onBuilt?(lot, project) (the host turns the lot into its building), onStart?(lot, project),
//               growth?:{rate (a year: 0.02), per (people a household: 5), ahead (houses ready or going up beyond the
//               households waiting: 2), settle(lot, s) (the host makes the new household's people, or moves in one
//               waiting elsewhere and returns 'moved'), people?(s), waiting?(s) (households waiting outside the houses: a
//               refugee camp's, counted as demand and housed first)},
//               onFull?(s) -> true when the host opened more lots (a street outside the gate) }) -> SIM.BUILD
//   SIM.buildLot({id, kind, settlement?})   an empty lot: a place of the settlement's (its builders' WORK posts), the
//               kind of building the plan allows there; its recipe is made (`build`: its worked hours are its project's)
//   SIM.buildStep(minute)                   SIM.step's: each hour the upkeep drawn, the projects started (`pace`)
//   SIM.buildWork(lot, hours, minute)       the economy's tick (a lot's builders' worker-hours): the project's work
//   SIM.buildReport(s?) -> {towns: {s: {lots, building, built, projects, upkeep: {day: {good: n}, taken, owed, neglect}}}, events}
//   SIM.buildWorn(place) -> 0 (kept) .. 1 (as worn as off-screen neglect lets a building get: shabby, never a ruin)
//   SIM.buildChanged(s)                     a town's buildings changed (a place's kind): its upkeep counted again
// A good of a bill its town's economy does not keep (timber on a page without the lumber village) is gathered on the spot:
// the project has it, unbooked (`local`), and upkeep skips it.
//
// A PROJECT is a record {id, lot, kind, settlement, bill, got, hours, done, m0, m1, state: building | built}. Its
// materials come out of its town's warehouses as the work goes (booked used, so the books hold; what is wanted anew and
// not there booked short once, the town's want the canoes and the governor answer, not each hour's retry): before each stretch of
// work, what the bill wants for the work so far is drawn; the work done never runs ahead of the share of the bill
// delivered, so a project short of stone waits. Its workers are whoever's work is the lot (the host deals them, a trade
// of builders, one a lot); whenever a project starts or ends the town's builders are spread over its projects evenly (or
// stay, idle, if none is left), and a lot's WORK posts follow its hands (none at a lot waiting its turn); done, the host's onBuilt turns the lot into its building, and the next lot's project starts.
// UPKEEP is a steady sink: every standing building `of` a kind with a `life` wears its whole bill over its life; each hour
// a town draws its buildings' wear a good at a time (the fractions carried), booked used. What it cannot draw is OWED and
// drawn first when the good comes back; while it is owed, the town's buildings show it: a building's wear is whether
// its place falls in the neglected share (owed over `grace` days of upkeep), by a hash of the place, the same buildings
// first every time, and never more than shabby (PLAN-POLITICS.md: no surprise ruins).
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.BUILD = null;
  function hash(){ var h=0x2545F491; for(var i=0;i<arguments.length;i++){ h=Math.imul(h^(arguments[i]|0), 0x85EBCA6B); h^=h>>>13; h=Math.imul(h, 0xC2B2AE35); h^=h>>>16; } return (h>>>0)/4294967296; }
  function strHash(s){ var h=0; s=String(s); for(var i=0;i<s.length;i++) h=Math.imul(h^s.charCodeAt(i), 0x01000193); return h|0; }
  function bump(o, k, n){ o[k]=(o[k]||0)+(n==null?1:n); }
  SIM.build = function(o){ o=o||{};
    var Gr=o.growth||null;
    SIM.BUILD={ cfg:{ kinds:o.kinds||{}, of:o.of||null, pace:o.pace==null?1:o.pace, crewPer:o.crewPer||null, grace:o.grace==null?30:o.grace, onBuilt:o.onBuilt||null, onStart:o.onStart||null,
        growth:Gr ? { rate:Gr.rate==null?0.02:Gr.rate, per:Gr.per==null?5:Gr.per, ahead:Gr.ahead==null?2:Gr.ahead, settle:Gr.settle||null, people:Gr.people||null, waiting:Gr.waiting||null } : null, onFull:o.onFull||null },
      lots:{}, order:[], projects:{}, towns:{}, events:[], n:0 };
    return SIM.BUILD;
  };
  function town(s){ var B=SIM.BUILD, T=B.towns[s]; if(!T) T=B.towns[s]={ lots:[], active:[], built:0, carry:{}, owed:{}, day:{}, taken:{}, short:{}, rate:null, due:0, settled:0, waiting:0 }; return T; }
  /* GROWTH (opt-in `growth`): the town's people grow by `rate` a year, a new household of `per` at a time; it moves into a
     finished house no one lives in (the host's `settle(lot, s)` makes its people); a project starts only while the houses
     ready or going up are fewer than `ahead` plus the households waiting, so building follows demand */
  function ready(s){ var B=SIM.BUILD; return town(s).lots.filter(function(id){ var L=B.lots[id]; return L.state==='built' && !L.settled; }); }
  /* a town's projects at once: `pace`, or one for every `crewPer` of its builders when more have come (2026-11-04: the
     refugees join the crews) */
  function paceOf(s){ var B=SIM.BUILD, T=town(s); return B.cfg.crewPer ? Math.max(B.cfg.pace, Math.floor((T.hands||0)/B.cfg.crewPer)) : B.cfg.pace; }
  function elsewhere(s){ var G=SIM.BUILD.cfg.growth; return G && G.waiting ? Math.max(0, G.waiting(s)|0) : 0; }   /* households waiting outside the houses (a refugee camp) */
  function needMore(s){ var B=SIM.BUILD, G=B.cfg.growth, T=town(s); if(!G) return true; return T.active.length+ready(s).length < G.ahead+Math.floor(T.due)+elsewhere(s); }
  function event(kind, o){ var B=SIM.BUILD, e=Object.assign({ m:SIM.minute(), kind:kind }, o); B.events.push(e); if(B.events.length>5000) B.events.shift(); SIM.logEvent('build '+kind, o); return e; }
  SIM.buildLot = function(o){ var B=SIM.BUILD, P=SIM.R.place[o.id]; if(!B || !P) return null; var s=o.settlement!=null ? o.settlement : P.settlement;
    if(!B.cfg.kinds[o.kind]) throw new Error('SIM.buildLot '+o.id+': unknown kind '+o.kind);
    var L={ id:o.id, kind:o.kind, settlement:s, state:'empty', project:null };
    B.lots[o.id]=L; B.order.push(o.id); town(s).lots.push(o.id); town(s).rate=null;
    SIM.withEcon(s, function(){ SIM.recipe(o.id, { out:[], rate:0, build:true }); });
    return L; };
  function start(s, minute){ var B=SIM.BUILD, T=town(s), id=null;
    for(var i=0;i<T.lots.length;i++){ var L=B.lots[T.lots[i]]; if(L.state==='empty'){ id=L.id; break; } } if(id==null) return null;
    var L2=B.lots[id], K=B.cfg.kinds[L2.kind], P={ id:s+':project:'+(B.n++), lot:id, kind:L2.kind, settlement:s, bill:Object.assign({}, K.bill), got:{}, hours:K.hours||1, done:0, m0:minute, m1:null, state:'building' };
    P.miss={}; Object.keys(P.bill).forEach(function(g){ P.got[g]=0; });
    B.projects[P.id]=P; L2.state='building'; L2.project=P.id; T.active.push(P.id);
    if(B.cfg.onStart) B.cfg.onStart(L2, P);
    event('start', { settlement:s, lot:id, project:P.id, building:P.kind }); return P; }
  /* the share of its bill a project holds (the least of its goods) */
  function held(P){ var f=1; Object.keys(P.bill).forEach(function(g){ if(P.bill[g]>0) f=Math.min(f, P.got[g]/P.bill[g]); }); return f; }
  SIM.buildWork = function(id, h, minute){ var B=SIM.BUILD, L=B && B.lots[id]; if(!L || L.state!=='building' || !(h>0)) return;
    var P=B.projects[L.project], s=L.settlement, f=Math.min(1, (P.done+h)/P.hours);
    SIM.withEcon(s, function(){ Object.keys(P.bill).forEach(function(g){ var want=Math.ceil(P.bill[g]*f)-P.got[g]; if(want<=0) return;
      if(!SIM.ECON.goods[g]){ P.got[g]+=want; bump(P.local||(P.local={}), g, want); return; }   /* a good its town's economy does not keep: gathered on the spot (not booked) */
      var mi=P.miss[g]||0, old=Math.min(mi, want), k1=old>0 ? SIM.economyTake(g, old) : 0; if(k1>0) SIM.economyBook('used', g, k1);
      var k2=want>old ? SIM.supply(g, want-old) : 0;   /* what it wants anew: a draw the economy books (used, and short when unmet: its town's want) */
      P.got[g]+=k1+k2; P.miss[g]=want-k1-k2; if(P.miss[g]>0) bump(town(s).short, g, P.miss[g]); }); });
    P.done=Math.min(P.done+h, held(P)*P.hours);
    if(P.done>=P.hours-1e-9) finish(L, P, minute); };
  function finish(L, P, minute){ var B=SIM.BUILD, T=town(L.settlement);
    P.state='built'; P.m1=minute; P.done=P.hours; L.state='built'; T.built++; T.rate=null; T.active=T.active.filter(function(x){ return x!==P.id; });
    if(B.cfg.onBuilt) B.cfg.onBuilt(L, P);
    var hands=SIM.all('actor').filter(function(a){ return a.work===L.id; }).length;
    var next=needMore(L.settlement) ? start(L.settlement, minute) : null; rebalance(L.settlement);
    event('built', { settlement:L.settlement, lot:L.id, project:P.id, building:P.kind, days:Math.round((minute-P.m0)/144)/10, hands:hands, next:next ? next.lot : null }); }
  /* THE HANDS: every builder of the town (whose work is one of its lots) at a project, the projects' hands kept even
     (a builder at a lot with no project goes to the one with the fewest; nobody moves off a project that has no more than
     its share) */
  function rebalance(s){ var B=SIM.BUILD, T=town(s);
    var mine=SIM.all('actor').filter(function(a){ return a.work!=null && B.lots[a.work] && B.lots[a.work].settlement===s; }), on={}, act={};
    T.active.forEach(function(pid){ var lot=B.projects[pid].lot; act[lot]=1; on[lot]=[]; });
    if(!T.active.length){ var wait=T.lots.filter(function(id){ return B.lots[id].state==='empty'; })[0]; if(wait==null) return; act[wait]=1; on[wait]=[]; }   /* nothing going up: they wait at the next lot */
    var idle=[]; mine.forEach(function(a){ if(act[a.work]) on[a.work].push(a); else idle.push(a); });
    T.hands=mine.length; var share=Math.ceil(mine.length/Math.max(1, Object.keys(on).length));
    Object.keys(on).sort().forEach(function(lot){ while(on[lot].length>share) idle.push(on[lot].pop()); });
    idle.forEach(function(a){ var best=null; Object.keys(on).sort().forEach(function(lot){ if(best==null || on[lot].length<on[best].length) best=lot; });
      on[best].push(a); a.work=best; if(a.mem) a.mem.WORK=best; });
    /* a lot's WORK posts follow its hands (a project's crew, none at a lot waiting its turn), so every post is filled */
    T.lots.forEach(function(id){ var P=SIM.R.place[id], L=B.lots[id]; if(!P || L.state==='built') return; var n=on[id] ? on[id].length : 0;
      if(n) P.activities.WORK=n; else delete P.activities.WORK; });
    if(SIM.placesChanged) SIM.placesChanged(); }
  /* a town's upkeep a day by good: its standing buildings' bills over their lives (counted once, then on a place change) */
  function rate(s){ var B=SIM.BUILD, T=town(s); if(T.rate) return T.rate; var r={}, n=0;
    if(B.cfg.of) SIM.all('place').forEach(function(P){ if(P.settlement!==s || (B.lots[P.id] && B.lots[P.id].state!=='built')) return; var k=B.cfg.of(P), K=k && B.cfg.kinds[k]; if(!K || !(K.life>0)) return;
      n++; Object.keys(K.bill).forEach(function(g){ r[g]=(r[g]||0)+K.bill[g]/K.life; }); });
    T.rate=r; T.buildings=n; return r; }
  SIM.buildStep = function(minute){ var B=SIM.BUILD; if(!B || minute%60) return;
    Object.keys(SIM.R.settlement||{}).sort().forEach(function(s){ var E=SIM.econ(s); if(!E) return; var T=town(s), G=B.cfg.growth;
      if(G && minute>0 && minute%1440===0 && T.lots.length){   /* the day's growth, and the households waiting moved in */
        var n=G.people ? G.people(s) : SIM.all('actor').filter(function(a){ return !a.driven && SIM.settlementOf(a)===s; }).length;
        T.due+=n*G.rate/365/G.per;
        while(T.due>=1 || elsewhere(s)>0){ var R=ready(s); if(!R.length) break; var L=B.lots[R[0]]; L.settled=minute; T.settled++;
          var how=G.settle ? G.settle(L, s) : null; if(how!=='moved') T.due-=1;   /* a household waiting elsewhere moved in first (the host says 'moved'), else a new one */
          event('settled', { settlement:s, lot:L.id, from:how==='moved' ? 'elsewhere' : 'growth' }); }
        T.waiting=Math.floor(T.due)+elsewhere(s); }
      var st=0; while(T.active.length<paceOf(s) && needMore(s)){ if(!start(s, minute)){ if(B.cfg.onFull && T.fullDay!==Math.floor(minute/1440)){ T.fullDay=Math.floor(minute/1440); if(B.cfg.onFull(s)) continue; } break; } st++; }   /* the projects kept going (to demand); the lots out, the host may open more */
      if(st || T.first==null || minute%1440===0){ T.first=minute; rebalance(s); }   /* and daily: a builder who left (a rise, a cell) leaves no empty post */
      var R=rate(s), d=Math.floor(minute/1440); if(T.dayN!==d){ T.dayN=d; T.day={}; }
      SIM.withEcon(s, function(){ Object.keys(R).sort().forEach(function(g){ if(!E.goods[g]) return;
        var c=(T.carry[g]||0)+R[g]/24, n=Math.floor(c); T.carry[g]=c-n; var ow=T.owed[g]||0; if(n+ow<=0) return;
        var k1=ow>0 ? SIM.economyTake(g, ow) : 0; if(k1>0) SIM.economyBook('used', g, k1);   /* the debt first, already counted as want */
        var k2=n>0 ? SIM.supply(g, n) : 0;   /* this hour's wear: a draw the economy books (used, short when unmet) */
        var k=k1+k2; if(k>0){ bump(T.taken, g, k); bump(T.day, g, k); }
        T.owed[g]=ow+n-k; }); }); });
  };
  /* the neglected share of a town's buildings: what it owes over `grace` days of its upkeep, the least of its goods' */
  function neglect(s){ var B=SIM.BUILD, T=town(s), R=rate(s), q=0; Object.keys(T.owed).forEach(function(g){ if(R[g]>0) q=Math.max(q, T.owed[g]/(R[g]*B.cfg.grace)); }); return Math.min(1, q); }
  SIM.buildWorn = function(id){ var B=SIM.BUILD, P=SIM.R.place[id]; if(!B || !P || !B.cfg.of || !B.cfg.of(P)) return 0; var q=neglect(P.settlement); if(!(q>0)) return 0;
    var r=hash(strHash(id), 4111); return r<q ? Math.min(1, (q-r)/Math.max(1e-9, q)+0.25) : 0; };
  SIM.buildChanged = function(s){ if(SIM.BUILD) town(s).rate=null; };
  SIM.buildReport = function(s){ var B=SIM.BUILD; if(!B) return null; var out={ towns:{}, events:B.events.slice() };
    Object.keys(B.towns).sort().forEach(function(k){ if(s!=null && k!==s) return; var T=B.towns[k], R=rate(k);
      out.towns[k]={ lots:T.lots.length, building:T.active.length, built:T.built, buildings:T.buildings||0, hands:T.hands||0, pace:paceOf(k), settled:T.settled, waiting:T.waiting, due:T.due, ready:ready(k).length,
        empty:T.lots.filter(function(id){ return B.lots[id].state==='empty'; }).length, idle:T.lots.every(function(id){ return B.lots[id].state==='built'; }),
        projects:Object.keys(B.projects).map(function(id){ return B.projects[id]; }).filter(function(P){ return P.settlement===k; }).map(function(P){ return Object.assign({}, P, { bill:Object.assign({}, P.bill), got:Object.assign({}, P.got), share:P.done/P.hours }); }),
        upkeep:{ day:Object.assign({}, R), taken:Object.assign({}, T.taken), owed:Object.assign({}, T.owed), neglect:neglect(k) }, short:Object.assign({}, T.short) }; });
    return out; };
})(typeof window!=='undefined'?window:globalThis);
