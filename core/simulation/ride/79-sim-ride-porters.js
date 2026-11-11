// ================================================================= CORE — simulation ride: porters, a carrier embodied by walkers
// [G data] core/simulation/PLAN-RIDING.md section 5. Opt-in (listed after 78-sim-ride.js). Goods cross a gap between two
// Line segments on an ordinary SIM.trade route on the timer (77-sim-6-trade.js): its books are the route's (exported as
// it leaves, in transit, imported as it lands; SIM.ledger reconciles the leg), exactly as the isle demo's villages' road
// legs. This fragment only EMBODIES the carrier: a crew of actors walks the gap in single file while the carrier is on
// its way, leaving as it departs and arriving as it lands, then stands at the far stop until the carrier goes back.
//
//   SIM.porters({route, carrier:0, crew:[actor ids], layer:'pedestrian', spacing:1.6, secPerMinute:60}) -> P
//        the crew is `driven` (the stepper leaves it alone); each departure bakes its walk from the stop's place door it
//        leaves to the next one's, timed to the carrier's eta (a motion second per world second: minutes * secPerMinute)
//   SIM.portersMinutes(fromPlace, toPlace, speed, layer) -> world minutes the walk takes at a laden pace (the route's
//        `minutes`), from the nav's route (whole minutes, rounded up)
//   SIM.portersStep(minute, t)     the step hook (after SIM.tradeStep in the same step)
//   SIM.portersReport() -> {route: {phase, walking, trips, crew}}
(function(root){
  'use strict';
  var SIM = root.SIM;
  if(!SIM || !SIM.rideSource) throw new Error('core/simulation/ride/79: load 78-sim-ride.js first');
  var nz=function(v,d){ return v==null ? d : v; };
  SIM.PORTERS = { list:[] };
  function doorOf(id){ var P=SIM.R.place[id]; if(!P) throw new Error('SIM.porters: unknown place '+id); var d=P.door||P; return { x:d.x, y:nz(d.y, nz(P.y, 0)), z:d.z }; }
  SIM.portersMinutes = function(a, b, speed, layer){
    var L=SIM.leg(layer||'pedestrian', doorOf(a), doorOf(b), speed, 'walk', 0); if(!L) return null; if(!L.route) SIM.legRoute(L);
    return Math.ceil(L.route.len/speed/60);
  };
  SIM.porters = function(o){
    if(!SIM.TRADE || !SIM.TRADE.routes[o.route]) throw new Error('SIM.porters: unknown trade route '+o.route);
    var R=SIM.TRADE.routes[o.route]; if(R.line!=null) throw new Error('SIM.porters '+o.route+': a timer route (no line): its carrier is the walkers');
    var P={ route:o.route, carrier:nz(o.carrier, 0), crew:(o.crew||[]).slice(), layer:o.layer||'pedestrian', spacing:nz(o.spacing, 1.6), spm:nz(o.secPerMinute, 60),
            phase:null, trips:0, at:null };
    if(!P.crew.length) throw new Error('SIM.porters '+o.route+': a crew');
    P.crew.forEach(function(id){ var a=SIM.R.actor[id]; if(!a) throw new Error('SIM.porters: unknown actor '+id); a.driven='porters'; });
    SIM.PORTERS.list.push(P);
    if(SIM.stepHooks.indexOf(SIM.portersStep)<0) SIM.stepHooks.push(SIM.portersStep);
    return P;
  };
  function bake(P, R, C, minute, t){
    var from=R.stops[C.from].place, to=R.stops[C.to].place, A=doorOf(from), B=doorOf(to), dur=Math.max(1, (C.eta-minute)*P.spm);
    P.crew.forEach(function(id, i){ var a=SIM.R.actor[id];
      var L=SIM.leg(P.layer, A, B, 1, 'walk', 0); if(!L){ SIM.logEvent('portersFail', { route:P.route, from:from, to:to }); return; }
      if(!L.route) SIM.legRoute(L);
      L.speed=L.route.len/dur; L.dur=dur; L.back=i*P.spacing;
      a.task={ act:'CARRY', place:to, t0:t, legs:[L], spot:B, dur:dur, arrive:t+dur, indoor:false, wander:0, failed:false, porters:P.route };
      a.activity='CARRY'; a.present=true; });
    P.trips++; SIM.logEvent('porters', { route:P.route, from:from, to:to, minutes:C.eta-minute, cargo:C.cargo.map(function(c){ return c.good+' '+c.n; }).join(', ') });
  }
  SIM.portersStep = function(minute, t){
    SIM.PORTERS.list.forEach(function(P){ var R=SIM.TRADE.routes[P.route], C=R && R.carriers[P.carrier]; if(!C) return;
      if(C.phase==='sail' && P.phase!=='sail') bake(P, R, C, minute, t);
      if(C.phase==='docked' && P.phase!=='docked' && P.at==null){   /* the first look: the crew stands at the carrier's stop */
        var D=doorOf(R.stops[C.at].place); P.crew.forEach(function(id, i){ var a=SIM.R.actor[id]; a.task=null; a.pos={ x:D.x-i*P.spacing*0.7, y:D.y, z:D.z-1-i*0.3 }; }); }
      P.phase=C.phase; P.at=C.at; });
  };
  SIM.portersReport = function(){ var out={}; SIM.PORTERS.list.forEach(function(P){ var R=SIM.TRADE.routes[P.route], C=R.carriers[P.carrier];
      out[P.route]={ phase:C.phase, walking:C.phase==='sail', trips:P.trips, crew:P.crew.slice(), cargo:C.cargo.slice() }; }); return out; };
})(typeof window!=='undefined'?window:globalThis);
