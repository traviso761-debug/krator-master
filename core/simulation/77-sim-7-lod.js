// ================================================================= CORE — simulation 7: the levels a settlement runs at
// SCHEMA.md "The three levels" (settlements/isle-demo/PLAN.md section 9, P7d). Opt-in: nothing changes until a page with
// settlements (77-sim-6-economy.js SIM.settlement) lowers one. A settlement is PRESENTED (the default: everything runs,
// every actor decides and is posed) or ABSTRACT (loaded but away from the window: its books only).
//
//   SIM.level(s, 'abstract' | 'presented')     lower or raise settlement s; SIM.levelOf(s) -> its level
//   SIM.ABSTRACT_DETOUR (1.3)                   an abstract cart's trip: the straight line times this, at its speed
//
// ABSTRACT. SIM.step and SIM.jump skip its actors (no decisions, no routes, no poses). Its economy goes on
// (77-sim-6-economy.js): each producer makes by the workers whose schedule says WORK this hour at their job (a.work, else
// the place they last worked) and its animals at home, each at the efficiency it had when the town was lowered; a
// cart's trip takes the straight line times the detour at its speed, no route, and the load moves when its minutes are
// past; the imports and the trade routes (77-sim-6-trade.js) tick as ever. Its households live by the hour
// (77-sim-6-items.js SIM.itemsAbstractHome): their meals from their stores, a mess's from the warehouses, the stores
// restocked from the warehouses when low, booked as a watched town books them, so the books balance at every level
// (made + imported - exported - consumed = the change, per good and per settlement); each person's day once a day
// (SIM.itemsAbstractDay, at an hour hashed from the person: its clothes and tool worn, a hurt, the material meter; what
// that wants bought at once at the nearest seller in the town, no trip), so the governor learns the treats' and the wear's demand while nobody watches.
// Meals out wait.
// RAISED, every actor is decided afresh where its schedule says it is now (SIM.jump's rule: most of them already there,
// a share still on the way), and a cart on an abstract trip is given its route, part-way along so that it arrives at the
// same minute. Deterministic: raising draws from SIM.rng as SIM.jump does; lowering and the abstract hours draw nothing.
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.ABSTRACT = null;
  SIM.ABSTRACT_DETOUR = 1.3;
  var HOMES = {}, PEOPLE = {};
  function mine(s){ return SIM.all('actor').filter(function(a){ return SIM.settlementOf(a)===s; }); }
  SIM.levelOf = function(s){ return SIM.ABSTRACT && SIM.ABSTRACT[s] ? 'abstract' : 'presented'; };
  SIM.level = function(s, lv){
    if(!SIM.R.settlement || !SIM.R.settlement[s]) throw new Error('SIM.level: no settlement '+s);
    if(lv!=='abstract' && lv!=='presented') throw new Error('SIM.level: abstract or presented, not '+lv);
    if(SIM.levelOf(s)===lv) return lv;
    var minute=SIM.minute(), t=SIM.time();
    if(lv==='abstract'){ lower(s, minute); (SIM.ABSTRACT||(SIM.ABSTRACT={}))[s]=true; }
    else { delete SIM.ABSTRACT[s]; raise(s, minute, t); }
    SIM.logEvent('level', { settlement:s, level:lv });
    return lv;
  };
  /* lowering: each actor's efficiency now; the town's households and their residents */
  function lower(s, minute){
    var res={};
    mine(s).forEach(function(a){ var m=SIM.mood ? SIM.mood(a) : null; a.absEff=m ? m.eff : 1; a.wake=null; if(a.home!=null && !a.transient) res[a.home]=(res[a.home]||0)+1; });
    HOMES[s]=SIM.all('place').filter(function(P){ return P.settlement===s && (P.store || P.mess) && (P.people || res[P.id]); })
      .map(function(P){ P.absMeal=P.absMeal||0; return { P:P, res:res[P.id]||0 }; });
    HOMES[s].last=minute; HOMES[s].hr=Math.floor(minute/60);
    /* the people, by the hour of the day each lives its abstract day at (a hash: the town's buying spread over the day,
       as a watched town's is, not in one draw at midnight) */
    var by=PEOPLE[s]=[]; for(var h=0;h<24;h++) by.push([]);
    mine(s).forEach(function(a){ if(!a.driven && !a.transient) by[Math.floor(SIM.itemHash(a.k|0, 0, 13)*24)].push(a); });
  }
  /* raising: decided afresh where the schedule says (SIM.jump's rule); a cart on an abstract trip given its route */
  function raise(s, minute, t){
    mine(s).forEach(function(a){ a.wake=null;
      if(a.driven){ var T=a.task; if(T && T.abstract && t<T.arrive){ var P=SIM.R.place[T.place], o=T.abstract;
          var R=P ? SIM.plan(a, P, T.act||'HAUL', { x:o.x, y:o.y, z:o.z }, T.t0) : null;
          if(R){ var d=R.arrive-T.arrive; R.t0-=d; R.arrive=T.arrive; a.task=R; } }
        return; }
      if(!a.present || a.plan) return;
      a.wanted=null; if(SIM.NEED) SIM.needsJump(a, minute); if(SIM.ITEMS) SIM.itemsJump(a, minute); SIM.decide(a, minute, t);
      if(a.task && SIM.rng.next() > 0.12){ var d=a.task.dur; a.task.t0 -= d; a.task.arrive -= d; if(SIM.NEED) a.ndFrom=minute; } });
    delete HOMES[s]; delete PEOPLE[s];
  }
  /* the economy's step for an abstract town (inside its turn): the households' hours */
  SIM.lodHour = function(E, minute){
    var L=HOMES[E.settlement]; if(!L || !SIM.ITEMS) return;
    var hrs=(minute-L.last)/60; if(hrs<1) return; L.last=minute;
    L.forEach(function(h){ SIM.itemsAbstractHome(h.P, hrs, E.settlement, h.res); });
    var by=PEOPLE[E.settlement], H=Math.floor(minute/60);   /* each person's yesterday, at its hour */
    if(by) for(var k=L.hr+1; k<=H && k<=L.hr+48; k++) by[k%24].forEach(function(a){ SIM.itemsAbstractDay(a, Math.floor(k/24), E.settlement); });
    L.hr=H;
  };
})(typeof window!=='undefined'?window:globalThis);
