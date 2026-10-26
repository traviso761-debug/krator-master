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
//               want: its planned use of a good, an imported food's ration, before its people have bought any) })
//   SIM.trades(a, b) -> true when settlement a sells to b: one faction, or each faction's relation to the other does
//               not shut trade (`trade` false, 'none' or 'closed'; with no `trade`, a stance of wary or better)
//   SIM.tradeStep(minute, t)                     SIM.step's, after the economies' step
//   SIM.tradeInbound(g, s?) / SIM.tradeOutbound(g, s?)   units of g at sea toward / from settlement s (SIM.ECON's)
//   SIM.tradeReport(id?) -> {id: {stops, carriers:[{k, phase, at, to, cargo, eta}], shipped:{'a>b': {good: n}},
//               landed:{'a>b': {good: n}}, voyages, refused, empty}}
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
    if(o.line==null && !(o.minutes>0)) throw new Error('SIM.trade '+o.id+': minutes (a passage) or a line');
    var T=SIM.TRADE||(SIM.TRADE={ routes:{}, order:[] });
    if(T.routes[o.id]) throw new Error('SIM.trade '+o.id+': made already');
    var R={ id:o.id, stops:o.stops.map(function(s){ return { settlement:s.settlement, place:s.place }; }), cap:o.cap, carriers:[],
            minutes:o.minutes, mins:o.mins==null ? 120 : o.mins, stagger:o.stagger==null ? 0 : o.stagger, line:o.line==null ? null : o.line,
            goods:o.goods||null, keep:o.keep, want:o.want, most:o.most==null ? o.cap : o.most, expect:o.expect||null, shipped:{}, landed:{}, voyages:0, refused:0, empty:0 };
    for(var k=0;k<(o.carriers==null ? 1 : o.carriers);k++) R.carriers.push({ k:k, phase:null, at:null, to:null, cargo:[], departs:null, eta:null, dock:undefined });
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
    T.order.forEach(function(id){ var R=T.routes[id]; R.carriers.forEach(function(C){ if(C.to==null) return; var s=R.stops[end==='to' ? C.to : C.from];
      if(!s || s.settlement!==key) return; C.cargo.forEach(function(c){ if(c.good===g) n+=c.n; }); }); });
    return n; }
  SIM.tradeInbound = function(g, s){ if(!SIM.TRADE) return 0; var k=s!=null ? s : SIM.ECON && SIM.ECON.settlement; return k==null ? 0 : atSea(g, k, 'to'); };
  SIM.tradeOutbound = function(g, s){ if(!SIM.TRADE) return 0; var k=s!=null ? s : SIM.ECON && SIM.ECON.settlement; return k==null ? 0 : atSea(g, k, 'from'); };

  /* ---------------------------------------------------------------- a load, leaving; landing, arriving */
  function loadFor(R, a, b){
    var EA=SIM.ECONS[a], EB=SIM.ECONS[b], keep=R.keep!=null ? R.keep : EA.exports.minDays, want=R.want!=null ? R.want : 2*EB.imports.days;
    var list=(R.goods && R.goods[a]) || Object.keys(EA.goods), rows=[];
    list.forEach(function(g){ if(!EA.goods[g] || !EB.goods[g] || EA.goods[g].export===false) return;
      var wb=Math.max(rate(EB, g), (R.expect && R.expect[b] && R.expect[b][g]) || 0); if(!(wb>0)) return;   /* `expect`: the receiver's planned use a day, a floor */
      var have=stockIn(EB, g)+sitesIn(EB, g)+atSea(g, b, 'to'), need=Math.ceil(want*wb-have); if(need<=0) return;
      if(fellShort(EA, g)) return;
      var spare=Math.floor(stockIn(EA, g)-keep*rate(EA, g)); if(spare<=0) return;
      rows.push({ good:g, days:have/wb, n:Math.min(need, spare, R.most) }); });
    rows.sort(function(p, q){ return p.days-q.days || (p.good<q.good?-1:1); });
    var left=R.cap, out=[];
    rows.forEach(function(r){ if(left<=0) return; var n=Math.min(r.n, left); if(n>0){ out.push({ good:r.good, n:n }); left-=n; } });
    return out;
  }
  function depart(R, C, i, minute){
    var j=(i+1)%R.stops.length, a=R.stops[i].settlement, b=R.stops[j].settlement, key=a+'>'+b;
    C.from=i; C.to=j; C.at=null; C.phase='sail'; C.cargo=[]; R.voyages++;
    if(!SIM.ECONS || !SIM.ECONS[a] || !SIM.ECONS[b] || !SIM.trades(a, b)){ R.refused++; SIM.logEvent('trade refused', { route:R.id, carrier:C.k, from:a, to:b }); return; }
    var want=loadFor(R, a, b);
    SIM.withEcon(a, function(){ want.forEach(function(w){ var n=SIM.economyTake(w.good, w.n); if(n<=0) return;
      SIM.economyBook('exported', w.good, n); C.cargo.push({ good:w.good, n:n }); stat(R.shipped[key]||(R.shipped[key]={}), w.good, n); }); });
    if(!C.cargo.length) R.empty++;
    SIM.logEvent('trade out', { route:R.id, carrier:C.k, from:a, to:b, cargo:C.cargo.map(function(c){ return c.good+' '+c.n; }).join(', ') });
  }
  function arrive(R, C, j, minute){
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
      if(C.phase==='docked' && minute>=C.departs){ var i=C.at; depart(R, C, i, C.departs); C.eta=C.departs+R.minutes; continue; }
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
          cargo:C.cargo.map(function(c){ return { good:c.good, n:c.n }; }), eta:C.eta }; }) }; });
    return id!=null ? out[id] || null : out;
  };
})(typeof window!=='undefined'?window:globalThis);
