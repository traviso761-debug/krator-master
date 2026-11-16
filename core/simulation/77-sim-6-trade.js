// ================================================================= CORE — simulation 6: trade between settlements
// settlements/isle-demo/PLAN.md sections 5 and 9 (P7a item 6); SCHEMA.md "The three levels". Opt-in: nothing runs until
// a page calls SIM.trade(), on a page whose settlements each keep an economy (77-sim-6-economy.js SIM.economy(config,
// {settlement})). A trade route's carriers go round landings in two or more settlements. LEAVING a landing, a carrier
// buys from that town's warehouses what the next town on its round wants and this one can spare; AT SEA its load is in
// neither town's stock, counted in transit (outbound for the sender, inbound for the receiver); ARRIVING it lands into
// the landing's store (the carts take it on) or else the town's emptiest warehouse. The books: exported by the sender
// as it leaves, imported by the receiver as it lands, so in each town change = made + imported - exported - consumed
// over any span, and every load is in one town, at sea, or in the other.
//
//   SIM.trade({ id, stops:[{settlement, place}, ...] (two or more; the round goes 0, 1, ... and back to 0),
//               cap (units a carrier holds), carriers? (1), minutes? (a passage between landings: the timer),
//               mins? (the stay at a landing: 120), stagger? (minutes between the carriers' first sailings: 0),
//               line? (a SIM.transport id: carrier k is its vehicle k, docked while the vehicle stands at a stop's
//               place; a passage then takes the vehicle's own time), goods?: {settlement: [goods it may send]} (else
//               every good both economies know), keep? (days of its own want a sender keeps: its economy's
//               exports.minDays), want? (days of want a load fills the receiver to: twice its imports.days),
//               most? (units of one good in a load: cap), expect?: {settlement: {good: a day}} (a floor on the receiver's
//               want: its planned use of a good, an imported food's ration, before its people have bought any),
//               share?: {settlement: {good: fraction}} (a TITHE: leaving that settlement, a carrier takes the fraction of
//               what it made of each good since its last sailing, owed and carried over when the stock is short, and
//               nothing for want: the village keeps the rest; PROPOSAL-LONGSONG-PINNACLE.md section 2, phase S3),
//               legs?: [minutes, ...] (a passage per leg, legs[i] from stop i to the next, in place of `minutes`: a
//               caravan's road whose stages differ; PROPOSAL-CATCH.md step C1),
//               provision?: {beasts (a carrier's pack animals), eat: {good: a beast a day}, loss? (the share of the
//               beasts a shortfall kills: .5), home? (the stop that remounts the train: 0), maxDays? (the most days of
//               it a train carries: a longer leg has waters of its own on the way)} (a caravan's beasts: leaving a
//               stop, a carrier draws from that settlement what its beasts eat over the leg ahead, SIM.supply's draw,
//               booked used there and short where the stop has too little; a shortfall kills `loss` of the beasts it
//               leaves unfed, and a carrier's cap is cap x its beasts / `beasts` until it remounts at `home`;
//               PROPOSAL-CATCH.md step C2),
//               halts?: [stop index, ...] (waystations: a carrier rests and provisions there with its cargo aboard,
//               buying and landing nothing; it loads at a trade stop for the next trade stop beyond the halts, and the
//               books' legs run trade stop to trade stop), sells?: [halt index, ...] (halts that also buy from the cargo
//               as it passes: a carrier leaving a trade stop loads for them too, and lands at each what it wants; an
//               oasis town on a caravan road), forHalts?: [good, ...] (goods it loads for the selling halts only, never
//               for the trade stop beyond them: the oases' bread, which the far town gets from behind), closed?: [{legs: [stop index, ...], window}] (a carrier does not set out
//               on those legs while the calendar's `window` is open: it waits where it is, a storm season or a shut col;
//               PROPOSAL-CATCH.md steps C3 and C5) })
//             Each is inert where it is absent: a route without them runs, books and reports as before.
//   SIM.trades(a, b) -> true when settlement a sells to b: one faction, or each faction's relation to the other does
//               not shut trade (`trade` false, 'none' or 'closed'; with no `trade`, a stance of wary or better)
//   SIM.tradeStep(minute, t)                     SIM.step's, after the economies' step
//   SIM.tradeInbound(g, s?) / SIM.tradeOutbound(g, s?)   units of g at sea toward / from settlement s (SIM.ECON's)
//   SIM.tradeReport(id?) -> {id: {stops, carriers:[{k, phase, at, to, cargo, eta}], shipped:{'a>b': {good: n}},
//               landed:{'a>b': {good: n}}, tithed:{'a>b': {good: n}}, owed:{'a:good': n}, voyages, refused, empty}}
// THE WANT. A town's want of a good, a day, is its use plus its unmet draws (the economy's `short`, by the day), over
// the economy's `window` and today so far: a town that has none of a good shows its want by what it could not get.
// A load is each good the receiver wants, fewest days of it first (its warehouses, its sites and what is already at
// sea toward it, over its want), that the sender can spare (its warehoused stock less `keep` days of its own want; a
// good the sender itself fell short of in the window is never sent), as much as fills the receiver to `want` days,
// at most `most` of one good and `cap` in all. Timer carriers keep their timetable through a jump (the step catches
// up voyage by voyage), which the abstract level (SCHEMA.md) runs on. Deterministic: no draws.
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.TRADE = null;
  function stat(o, k, n){ o[k]=(o[k]||0)+(n==null?1:n); }
  SIM.trade = function(o){
    if(!o.stops || o.stops.length<2) throw new Error('SIM.trade '+o.id+': at least two stops');
    if(!(o.cap>0)) throw new Error('SIM.trade '+o.id+': a cap');
    if(o.legs!=null && (o.legs.length!==o.stops.length || !o.legs.every(function(m){ return m>0; }))) throw new Error('SIM.trade '+o.id+': legs, a passage for each stop');
    if(o.line==null && o.legs==null && !(o.minutes>0)) throw new Error('SIM.trade '+o.id+': minutes (a passage) or a line');
    if(o.provision!=null && (o.line!=null || !(o.provision.beasts>0) || !o.provision.eat)) throw new Error('SIM.trade '+o.id+': provision, beasts and what they eat, on the timer');
    var T=SIM.TRADE||(SIM.TRADE={ routes:{}, order:[] });
    if(T.routes[o.id]) throw new Error('SIM.trade '+o.id+': made already');
    var R={ id:o.id, stops:o.stops.map(function(s){ return { settlement:s.settlement, place:s.place }; }), cap:o.cap, carriers:[],
            minutes:o.minutes, mins:o.mins==null ? 120 : o.mins, stagger:o.stagger==null ? 0 : o.stagger, line:o.line==null ? null : o.line,
            goods:o.goods||null, keep:o.keep, want:o.want, most:o.most==null ? o.cap : o.most, expect:o.expect||null, shipped:{}, landed:{}, voyages:0, refused:0, empty:0 };
    if(o.share){ R.share=o.share; R.tithed={}; R.owed={}; R.mark={}; }   /* a tithe road (S3): see the header */
    if(o.legs!=null) R.legs=o.legs.slice();   /* C1: a passage per leg */
    if(o.provision!=null){ var Pv=o.provision; R.provision={ beasts:Pv.beasts, eat:Pv.eat, loss:Pv.loss==null ? .5 : Pv.loss, home:Pv.home==null ? 0 : Pv.home, maxDays:Pv.maxDays==null ? Infinity : Pv.maxDays };
      R.provisioned={}; R.dry={}; R.died=0; R.remounted=0; }   /* C2: the beasts' draw at each stop */
    if(o.halts!=null && o.halts.length){ R.halt={}; o.halts.forEach(function(i){ R.halt[i]=1; }); (o.sells||[]).forEach(function(i){ if(R.halt[i]) R.halt[i]=2; });
      if(Object.keys(R.halt).length>=o.stops.length) throw new Error('SIM.trade '+o.id+': halts, and at least one trade stop'); R.held=0; }   /* C3 */
    if(o.forHalts!=null) R.forHalts=o.forHalts.slice();   /* C3: goods loaded for the selling halts, never for the trade stop */
    if(o.closed!=null && o.closed.length){ R.closed=o.closed.map(function(c){ var m={}; c.legs.forEach(function(i){ m[i]=1; }); return { legs:m, window:c.window }; }); R.waited=0; }   /* C5 */
    for(var k=0;k<(o.carriers==null ? 1 : o.carriers);k++) R.carriers.push({ k:k, phase:null, at:null, to:null, cargo:[], departs:null, eta:null, dock:undefined });
    if(R.provision) R.carriers.forEach(function(C){ C.beasts=R.provision.beasts; });
    T.routes[R.id]=R; T.order.push(R.id); return R;
  };
  function sett(id){ return SIM.R.settlement && SIM.R.settlement[id]; }
  function shut(r){ return r && (r.trade===false || r.trade==='none' || r.trade==='closed'); }
  function opens(fa, fb){ var r=SIM.R.relation[fa+'>'+fb]; if(shut(r)) return false; if(r && r.trade!=null) return true; return SIM.rank(SIM.stance(fa, fb)) >= SIM.rank('wary'); }
  SIM.trades = function(a, b){ var A=sett(a), B=sett(b); if(!A || !B) return false; if(a===b || A.faction===B.faction) return true;
    return opens(A.faction, B.faction) && opens(B.faction, A.faction); };

  /* ---------------------------------------------------------------- the want, read off an economy's days */
  function today(){ return Math.floor(SIM.minute()/1440); }
  function rate(E, g){ var d=today(), m=SIM.minute()%1440, tot=0, days=0;   /* the economy's own window (77-sim-6-economy.js useRate), use and short */
    function of(D){ return ((D.used||{})[g]||0)+((D.short||{})[g]||0); }
    for(var k=Math.max(0, d-E.window); k<d; k++){ if(E.day[k]){ tot+=of(E.day[k]); days++; } }
    var td=E.day[d]; if(td && m>60){ tot+=of(td); days+=m/1440; }
    return days>0 ? tot/days : 0; }
  function fellShort(E, g){ var d=today(); for(var k=Math.max(0, d-E.window); k<=d; k++){ var D=E.day[k]; if(D && D.short && D.short[g]>0) return true; } return false; }
  function stockIn(E, g){ var n=0; E.warehouses.forEach(function(W){ n+=W.stock[g]||0; }); return n; }
  function sitesIn(E, g){ var n=0; E.sites.forEach(function(P){ n+=P.stock[g]||0; }); return n; }
  function atSea(g, key, end){ var T=SIM.TRADE, n=0; if(!T) return 0;
    T.order.forEach(function(id){ var R=T.routes[id]; R.carriers.forEach(function(C){ if(C.to==null && C.dest==null) return;   /* C3: a carrier past a halt is still bound for its trade stop */
      var s=R.stops[end==='to' ? (C.dest!=null ? C.dest : C.to) : (C.orig!=null ? C.orig : C.from)];
      if(!s || s.settlement!==key) return; C.cargo.forEach(function(c){ if(c.good===g) n+=c.n; }); }); });
    return n; }
  SIM.tradeInbound = function(g, s){ if(!SIM.TRADE) return 0; var k=s!=null ? s : SIM.ECON && SIM.ECON.settlement; return k==null ? 0 : atSea(g, k, 'to'); };
  SIM.tradeOutbound = function(g, s){ if(!SIM.TRADE) return 0; var k=s!=null ? s : SIM.ECON && SIM.ECON.settlement; return k==null ? 0 : atSea(g, k, 'from'); };

  /* ---------------------------------------------------------------- a load, leaving; landing, arriving */
  function passage(R, i){ return R.legs ? R.legs[i] : R.minutes; }
  /* C2: leaving stop i, the carrier's beasts draw what they eat over the leg ahead; a shortfall kills `loss` of the unfed */
  function provision(R, C, i){
    var Pv=R.provision, a=R.stops[i].settlement, days=Math.min(passage(R, i)/1440, Pv.maxDays);   /* a train carries at most maxDays: a long leg has waters of its own */
    if(i===Pv.home && C.beasts<Pv.beasts){ R.remounted+=Pv.beasts-C.beasts; C.beasts=Pv.beasts; }   /* remounted at home */
    if(!SIM.ECONS || !SIM.ECONS[a] || C.beasts<=0) return;
    var fed=1;
    SIM.withEcon(a, function(){ Object.keys(Pv.eat).sort().forEach(function(g){ var n=Math.ceil(C.beasts*Pv.eat[g]*days); if(n<=0) return;
      var got=SIM.supply(g, n, false); if(got>0) stat(R.provisioned[a]||(R.provisioned[a]={}), g, got);
      if(got<n){ fed=Math.min(fed, got/n); stat(R.dry[a]||(R.dry[a]={}), g, n-got); } }); });
    if(fed<1){ var dead=Math.round(C.beasts*(1-fed)*Pv.loss); if(dead>0){ C.beasts-=dead; R.died+=dead;
      SIM.logEvent('trade beasts lost', { route:R.id, carrier:C.k, at:a, dead:dead, left:C.beasts }); } }
  }
  function loadFor(R, a, b, capC){
    var EA=SIM.ECONS[a], EB=SIM.ECONS[b], keep=R.keep!=null ? R.keep : EA.exports.minDays, want=R.want!=null ? R.want : 2*EB.imports.days;
    var list=(R.goods && R.goods[a]) || Object.keys(EA.goods), rows=[];
    list.forEach(function(g){ if(!EA.goods[g] || !EB.goods[g] || EA.goods[g].export===false) return;
      var wb=Math.max(rate(EB, g), (R.expect && R.expect[b] && R.expect[b][g]) || 0); if(!(wb>0)) return;   /* `expect`: the receiver's planned use a day, a floor */
      var have=stockIn(EB, g)+sitesIn(EB, g)+atSea(g, b, 'to'), need=Math.ceil(want*wb-have); if(need<=0) return;
      if(fellShort(EA, g)) return;
      var spare=Math.floor(stockIn(EA, g)-keep*rate(EA, g)-(((EA.policy||{})[g]||{}).reserve||0)); if(spare<=0) return;   /* a policy's `reserve` stays */
      rows.push({ good:g, days:have/wb, n:Math.min(need, spare, R.most) }); });
    rows.sort(function(p, q){ return p.days-q.days || (p.good<q.good?-1:1); });
    var left=capC==null ? R.cap : capC, out=[];
    rows.forEach(function(r){ if(left<=0) return; var n=Math.min(r.n, left); if(n>0){ out.push({ good:r.good, n:n }); left-=n; } });
    return out;
  }
  /* C3: leaving a halt, a carrier rests and provisions and sails on with its cargo; leaving a trade stop on a road with
     halts, it loads for the next trade stop and for the selling halts before it, each by its own want */
  function departHalted(R, C, i){
    var n=R.stops.length, j=(i+1)%n, a=R.stops[i].settlement;
    C.from=i; C.to=j; C.at=null; C.phase='sail';
    if(R.halt[i]){ R.held++; if(R.provision) provision(R, C, i); return; }
    var k=j, targets=[]; while(R.halt[k]){ if(R.halt[k]===2) targets.push(k); k=(k+1)%n; } targets.push(k);
    C.cargo=[]; C.orig=i; C.dest=k; R.voyages++;
    if(R.provision) provision(R, C, i);
    var left=R.provision ? Math.floor(R.cap*C.beasts/R.provision.beasts) : R.cap;
    targets.forEach(function(t){ var b=R.stops[t].settlement, key=a+'>'+b;
      if(!SIM.ECONS || !SIM.ECONS[a] || !SIM.ECONS[b] || !SIM.trades(a, b)){ if(t===k){ R.refused++; SIM.logEvent('trade refused', { route:R.id, carrier:C.k, from:a, to:b }); } return; }
      if(left<=0) return;   /* full */
      var rows=loadFor(R, a, b, left);
      if(t===k && R.forHalts) rows=rows.filter(function(w){ return R.forHalts.indexOf(w.good)<0; });   /* goods carried for the halts only */
      SIM.withEcon(a, function(){ rows.forEach(function(w){ var got=SIM.economyTake(w.good, w.n); if(got<=0) return; left-=got;
        SIM.economyBook('exported', w.good, got); C.cargo.push({ good:w.good, n:got, at:t }); stat(R.shipped[key]||(R.shipped[key]={}), w.good, got); }); }); });
    if(!C.cargo.length) R.empty++;
    SIM.logEvent('trade out', { route:R.id, carrier:C.k, from:a, to:R.stops[k].settlement, cargo:C.cargo.map(function(c){ return c.good+' '+c.n; }).join(', ') });
  }
  function arriveHalted(R, C, j){
    var a=R.stops[C.orig!=null ? C.orig : C.from].settlement, b=R.stops[j].settlement, key=a+'>'+b, P=R.stops[j].place, end=!R.halt[j];
    C.at=j; C.phase='docked'; C.to=null;
    var land=C.cargo.filter(function(c){ return end || c.at===j; });
    if(land.length && SIM.ECONS && SIM.ECONS[b]) SIM.withEcon(b, function(){ land.forEach(function(c){ var to=SIM.economyLand(c.good, c.n, P); if(to==null) return;
      SIM.economyBook('imported', c.good, c.n); stat(R.landed[key]||(R.landed[key]={}), c.good, c.n); }); });
    C.cargo=C.cargo.filter(function(c){ return land.indexOf(c)<0; });
    if(end){ if(C.cargo.length) SIM.logEvent('trade unlanded', { route:R.id, carrier:C.k, at:b });   /* no store took it */
      SIM.logEvent('trade in', { route:R.id, carrier:C.k, from:a, to:b, at:P, cargo:land.map(function(c){ return c.good+' '+c.n; }).join(', ') });
      C.cargo=[]; C.orig=null; C.dest=null; }
  }
  function closedNow(R, i, m){ return R.closed.some(function(c){ return c.legs[i] && SIM.inSeason && SIM.inSeason(c.window, m); }); }
  function depart(R, C, i, minute){
    if(R.halt) return departHalted(R, C, i);
    var j=(i+1)%R.stops.length, a=R.stops[i].settlement, b=R.stops[j].settlement, key=a+'>'+b;
    C.from=i; C.to=j; C.at=null; C.phase='sail'; C.cargo=[]; R.voyages++;
    if(R.provision) provision(R, C, i);   /* C2: the beasts water and feed whether or not the stop trades */
    if(!SIM.ECONS || !SIM.ECONS[a] || !SIM.ECONS[b] || !SIM.trades(a, b)){ R.refused++; SIM.logEvent('trade refused', { route:R.id, carrier:C.k, from:a, to:b }); return; }
    /* a tithe: the share of what the sender made since it last sailed, owed when short; then no load for want */
    var capC=R.provision ? Math.floor(R.cap*C.beasts/R.provision.beasts) : R.cap;   /* C2: a train short of beasts carries less */
    var tithe=R.share && R.share[a], want=tithe ? [] : loadFor(R, a, b, capC);
    if(tithe) SIM.withEcon(a, function(){ var E=SIM.ECON, mk=R.mark[a]||(R.mark[a]={}), left=capC;
      Object.keys(tithe).sort().forEach(function(g){ var made=E.made[g]||0, k=a+':'+g, due=(R.owed[k]||0)+(made-(mk[g]||0))*tithe[g]; mk[g]=made;
        var n=Math.min(Math.floor(due), left); n=n>0 ? SIM.economyTake(g, n) : 0; R.owed[k]=due-n; if(n<=0) return; left-=n;
        SIM.economyBook('exported', g, n); C.cargo.push({ good:g, n:n, tithe:true }); stat(R.shipped[key]||(R.shipped[key]={}), g, n); stat(R.tithed[key]||(R.tithed[key]={}), g, n); }); });
    SIM.withEcon(a, function(){ want.forEach(function(w){ var n=SIM.economyTake(w.good, w.n); if(n<=0) return;
      SIM.economyBook('exported', w.good, n); C.cargo.push({ good:w.good, n:n }); stat(R.shipped[key]||(R.shipped[key]={}), w.good, n); }); });
    if(!C.cargo.length) R.empty++;
    SIM.logEvent('trade out', { route:R.id, carrier:C.k, from:a, to:b, cargo:C.cargo.map(function(c){ return c.good+' '+c.n; }).join(', ') });
  }
  function arrive(R, C, j, minute){
    if(R.halt) return arriveHalted(R, C, j);
    var a=R.stops[C.from].settlement, b=R.stops[j].settlement, key=a+'>'+b, P=R.stops[j].place;
    C.at=j; C.phase='docked';
    if(C.cargo.length && SIM.ECONS && SIM.ECONS[b]) SIM.withEcon(b, function(){ C.cargo.forEach(function(c){ var to=SIM.economyLand(c.good, c.n, P); if(to==null) return;
      SIM.economyBook('imported', c.good, c.n); stat(R.landed[key]||(R.landed[key]={}), c.good, c.n); }); });
    SIM.logEvent('trade in', { route:R.id, carrier:C.k, from:a, to:b, at:P, cargo:C.cargo.map(function(c){ return c.good+' '+c.n; }).join(', ') });
    C.cargo=[]; C.to=null;
  }

  /* ---------------------------------------------------------------- the step */
  function stepTimer(R, C, minute){
    if(C.phase==null){ C.at=C.k % R.stops.length; C.phase='docked'; C.departs=minute+R.mins+C.k*R.stagger; }
    for(var guard=0; guard<64; guard++){   /* a jump: voyage after voyage, each at its own minute */
      if(C.phase==='docked' && minute>=C.departs){ var i=C.at;
        if(R.closed && closedNow(R, i, C.departs)){ R.waited++; C.departs+=60; continue; }   /* C5: the leg is shut; wait an hour */
        depart(R, C, i, C.departs); C.eta=C.departs+passage(R, i); continue; }
      if(C.phase==='sail' && minute>=C.eta){ arrive(R, C, C.to, C.eta); C.departs=C.eta+R.mins; C.eta=null; continue; }
      break; }
  }
  function stepLine(R, C, minute, t){
    var p=SIM.vehiclePose(R.line, C.k, t), at=p && p.at!=null ? String(p.at) : null, idx=null;
    for(var s=0;s<R.stops.length;s++) if(String(R.stops[s].place)===at){ idx=s; break; }
    if(C.dock===undefined){ C.dock=idx; C.phase=idx!=null ? 'docked' : 'sail'; C.at=idx; return; }   /* the first look: where it is, no trade */
    if(C.dock===idx) return;
    if(C.dock!=null && C.to==null) depart(R, C, C.dock, minute);
    if(idx!=null && idx===C.to) arrive(R, C, idx, minute);
    else if(idx!=null && C.to==null){ C.at=idx; C.phase='docked'; }
    C.dock=idx;
  }
  SIM.tradeStep = function(minute, t){
    var T=SIM.TRADE; if(!T) return;
    T.order.forEach(function(id){ var R=T.routes[id]; R.carriers.forEach(function(C){ if(R.line!=null) stepLine(R, C, minute, t); else stepTimer(R, C, minute); }); });
  };

  /* ---------------------------------------------------------------- the panel's numbers */
  SIM.tradeReport = function(id){
    var T=SIM.TRADE; if(!T) return null; var out={};
    T.order.forEach(function(k){ if(id!=null && k!==id) return; var R=T.routes[k];
      out[k]={ stops:R.stops.map(function(s){ return s.settlement; }), voyages:R.voyages, refused:R.refused, empty:R.empty,
        shipped:JSON.parse(JSON.stringify(R.shipped)), landed:JSON.parse(JSON.stringify(R.landed)),
        carriers:R.carriers.map(function(C){ return { k:C.k, phase:C.phase, at:C.at!=null ? R.stops[C.at].settlement : null, to:C.to!=null ? R.stops[C.to].settlement : null,
          cargo:C.cargo.map(function(c){ return { good:c.good, n:c.n }; }), eta:C.eta }; }) };
      if(R.share){ out[k].tithed=JSON.parse(JSON.stringify(R.tithed)); out[k].owed=JSON.parse(JSON.stringify(R.owed)); }   /* a tithe road's (only: the others' reports unchanged) */
      if(R.provision){ out[k].provisioned=JSON.parse(JSON.stringify(R.provisioned)); out[k].dry=JSON.parse(JSON.stringify(R.dry)); out[k].died=R.died; out[k].remounted=R.remounted;
        out[k].carriers.forEach(function(c, n){ c.beasts=R.carriers[n].beasts; }); }   /* C2: a caravan's (only) */
      if(R.halt) out[k].held=R.held; if(R.closed) out[k].waited=R.waited; });   /* C3, C5 */
    return id!=null ? out[id] || null : out;
  };
})(typeof window!=='undefined'?window:globalThis);
