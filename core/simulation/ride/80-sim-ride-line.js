// ================================================================= CORE — simulation ride: a line's lojes as books (abstract economy)
// [G data] core/simulation/PLAN-RIDING.md section 8c (the owner, 2026-11-11: "we can have abstract economy for now until we
// actually build the lojes"). Opt-in (listed after 78 and 79). Until a line's settlements are built (places, workers,
// stores), each is BOOKS ONLY: a settlement (77-sim-6-economy.js) with an economy and one store at its station, making
// goods and using them by the hour from its population, with no buildings and no actors. Its goods move on R3's carriers:
// a SIM.trade route bound to each segment's train between two neighbouring stations, a porters' timer route across each
// gap (walked by a crew when asked: 79-sim-ride-porters.js). The ledger (77-sim-7-ledger.js) reconciles every hop.
//
// THROUGH GOODS, with no new trade code: each hop's receiver is given `expect` (SIM.trade's floor on the receiver's want,
// a day) = the net deficit of that loj and every loj beyond it on that side of the line (their use less what they make,
// never below 0: a side that makes enough of a good asks none back), so a good made at one end is drawn hop by hop to the
// lojes that use it, each loj on the way keeping `want` days of what lies beyond it and passing the
// rest on (it sends what it holds over `keep` days of its own use). On each hop a good goes one way only, toward the side
// whose net deficit asks for it (SIM.trade's `goods`), so it does not slosh to and fro. What this cannot say is who owns a load and where it
// is bound: consignments wait until the lojes are built (PLAN-RIDING.md section 5).
//
//   SIM.lineEconomy({ id, faction:'tungang', goods:{good:{}}, lojes:[{id, stop: place id, pop, makes:{good: a day},
//                     uses:{good: a person a day}, stock:{good: n}}] (in order along the line),
//                     links:[{from, to, rail: ride source id} | {from, to, porters:{minutes | speed:0.8, crew?, layer?, stay?}}]
//                     (each between two lojes next to each other in that order), cap:240, keep:1, want:3,
//                     through:true, secPerMinute:60 }) -> L {id, lojes, routes:{linkKey: route}, porters:{linkKey: P}}
//        through:false gives no expect (each hop serves only its receiver's own use: the check's negative)
//   SIM.lineEconomyStep(minute)       the step hook (pushed before the ride hooks): each loj's hour of making and using
//   SIM.lineEconomyReport(id) -> {lojes:{id:{pop, stock, made, used, short, imported, exported}}, start, made}
//   L.start {good: n}, L.made {good: n}: what the lojes held at the start and have made since (conservation's terms)
(function(root){
  'use strict';
  var SIM = root.SIM;
  if(!SIM || !SIM.rideSource) throw new Error('core/simulation/ride/80: load 78-sim-ride.js first');
  var nz=function(v,d){ return v==null ? d : v; };
  SIM.LINEECON = { list:[], byId:{} };
  SIM.lineEconomy = function(o){
    if(!o || o.id==null) throw new Error('SIM.lineEconomy: an id');
    if(SIM.LINEECON.byId[o.id]) throw new Error('SIM.lineEconomy: duplicate id '+o.id);
    var goods=o.goods||{}, gl=Object.keys(goods); if(!gl.length) throw new Error('SIM.lineEconomy '+o.id+': goods');
    var lojes=o.lojes||[]; if(lojes.length<2) throw new Error('SIM.lineEconomy '+o.id+': two lojes or more');
    var fac=o.faction||'tungang', spm=nz(o.secPerMinute, 60), idx={};
    if(!SIM.R.faction[fac]) SIM.faction({ id:fac, name:fac });
    var L={ id:o.id, lojes:[], routes:{}, porters:{}, start:{}, made:{}, acc:{} };
    gl.forEach(function(g){ L.start[g]=0; L.made[g]=0; });
    lojes.forEach(function(J, i){
      var P=SIM.R.place[J.stop]; if(!P) throw new Error('SIM.lineEconomy '+o.id+': loj '+J.id+' has no station place '+J.stop);
      idx[J.id]=i;
      if(!SIM.R.settlement || !SIM.R.settlement[J.id]) SIM.settlement({ id:J.id, faction:fac, name:J.name||J.id });
      P.settlement=J.id;
      SIM.economy({ goods:JSON.parse(JSON.stringify(goods)), window:1 }, { settlement:J.id });
      SIM.store(P.id, { kind:'warehouse', cap:1e12 }); P.stock={};
      gl.forEach(function(g){ var n=nz((J.stock||{})[g], 0); if(n){ P.stock[g]=n; L.start[g]+=n; } });
      var use={}; gl.forEach(function(g){ use[g]=nz(J.pop, 0)*nz((J.uses||{})[g], 0); });
      L.lojes.push({ id:J.id, stop:J.stop, pop:nz(J.pop, 0), makes:J.makes||{}, use:use });
      L.acc[J.id]={ make:{}, use:{} }; });
    /* the through-demand: the net deficit a day (use less making, floored at 0) of a loj and every loj beyond it, each way */
    function beyond(i, dir){ var w={}; gl.forEach(function(g){ w[g]=0; });
      for(var j=i; j>=0 && j<L.lojes.length; j+=dir) gl.forEach(function(g){ w[g]+=L.lojes[j].use[g]-nz(L.lojes[j].makes[g], 0); });
      gl.forEach(function(g){ w[g]=Math.max(0, w[g]); }); return w; }
    (o.links||[]).forEach(function(K){
      var a=idx[K.from], b=idx[K.to]; if(a==null || b==null) throw new Error('SIM.lineEconomy '+o.id+': a link names an unknown loj');
      if(Math.abs(a-b)!==1) throw new Error('SIM.lineEconomy '+o.id+': link '+K.from+'-'+K.to+' joins lojes not next to each other');
      var A=L.lojes[a], B=L.lojes[b], key=A.id+'-'+B.id, dirB=b>a ? 1 : -1, expect=null, toB=beyond(b, dirB), toA=beyond(a, -dirB);
      if(o.through!==false){ expect={}; expect[B.id]=toB; expect[A.id]=toA; }
      /* one way a good: toward the side whose net deficit asks for it (else a producer that sends all over `keep` days buys it
         back under `want` days, and the good sloshes to and fro) */
      var send={}; send[A.id]=gl.filter(function(g){ return toB[g]>0; }); send[B.id]=gl.filter(function(g){ return toA[g]>0; });
      var stops=[{ settlement:A.id, place:A.stop }, { settlement:B.id, place:B.stop }], base={ id:o.id+'.'+key, stops:stops, cap:nz(K.cap, nz(o.cap, 240)),
        keep:nz(o.keep, 1), want:nz(o.want, 3), expect:expect, goods:send };
      if(K.rail!=null){ base.line=K.rail; L.routes[key]=SIM.trade(base); return; }
      var Pr=K.porters||{}; if(!SIM.porters && Pr.crew) throw new Error('SIM.lineEconomy: porters with a crew need 79-sim-ride-porters.js');
      base.minutes=Pr.minutes!=null ? Pr.minutes : SIM.portersMinutes(A.stop, B.stop, nz(Pr.speed, 0.8), Pr.layer||'pedestrian', spm);
      base.mins=nz(Pr.stay, 15); base.cap=nz(Pr.cap, nz(K.cap, 120));
      L.routes[key]=SIM.trade(base);
      if(Pr.crew){ if(!SIM.R.activity.CARRY) SIM.activity({ id:'CARRY' });
        if(!SIM.R.org[fac+'.porters']) SIM.org({ id:fac+'.porters', faction:fac, name:'porters' });
        if(!SIM.R.role.porter) SIM.role({ id:'porter', org:fac+'.porters', sched:[[0, 'CARRY']] });
        var crew=[]; for(var c=0;c<Pr.crew;c++){ var aid=o.id+'.'+key+'.porter'+c; if(!SIM.R.actor[aid]) SIM.actor({ id:aid, role:'porter', settlement:A.id }); crew.push(aid); }
        L.porters[key]=SIM.porters({ route:base.id, crew:crew, layer:Pr.layer||'pedestrian', secPerMinute:spm }); } });
    SIM.LINEECON.list.push(L); SIM.LINEECON.byId[o.id]=L;
    if(SIM.stepHooks.indexOf(SIM.lineEconomyStep)<0) SIM.stepHooks.unshift(SIM.lineEconomyStep);
    return L;
  };
  /* each loj's hour: it makes `makes`/24 and uses pop * `uses`/24 of each good, whole units, the fractions carried */
  SIM.lineEconomyStep = function(minute){
    if(minute%60!==0) return;
    SIM.LINEECON.list.forEach(function(L){ L.lojes.forEach(function(J){ var A=L.acc[J.id];
      Object.keys(J.makes).forEach(function(g){ A.make[g]=nz(A.make[g], 0)+J.makes[g]/24; var n=Math.floor(A.make[g]+1e-9);
        if(n>0){ var k=SIM.produce(J.stop, g, n); A.make[g]-=n; L.made[g]+=k; } });
      Object.keys(J.use).forEach(function(g){ if(!(J.use[g]>0)) return; A.use[g]=nz(A.use[g], 0)+J.use[g]/24; var n=Math.floor(A.use[g]+1e-9);
        if(n>0){ SIM.supply(g, n, false, J.id); A.use[g]-=n; } }); }); });
  };
  SIM.lineEconomyReport = function(id){
    var L=SIM.LINEECON.byId[id]; if(!L) return null; var out={ lojes:{}, start:L.start, made:L.made };
    L.lojes.forEach(function(J){ var E=SIM.econ(J.id), P=SIM.R.place[J.stop];
      out.lojes[J.id]={ pop:J.pop, stock:JSON.parse(JSON.stringify(P.stock)), made:E.made||{}, used:E.used||{}, short:E.short||{}, imported:E.imported||{}, exported:E.exported||{} }; });
    return out;
  };
})(typeof window!=='undefined'?window:globalThis);
