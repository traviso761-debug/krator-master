// ================================================================= CORE — simulation 6: unrest from the happiness pool
// PLAN-MONEY.md M6 (the owner, 2026-11-03, answers 9 and 14): "each fallen household should acquire an unhappiness
// modifier feeding into a collective and per-class happiness pool that is affected by other things (needs not being
// met); the farther below 50% this pool is the more serious unrest becomes ... less serious forms of unrest could demand
// a new ruler or a shipment of needed goods from the faction authorities, leading up to full treason". Opt-in: nothing
// here runs until a world calls SIM.unrest(config), on a world with needs (77-sim-6-needs.js). It draws nothing.
//
//   SIM.unrest({ classOf?(a) (a.cls), smooth? (days: 3), hyst? (points: 5), stages?:{grumble, demand, strike, treason}
//                (the pool below which each begins: 50, 40, 30, 20), byFaction?:{faction: {stages}} (a nation's own),
//                grumble?:{arrest} (0.7), demand?:{goods (2), days (5), keep (3), every (5), grant (0.4), granted:{n, days}, refused:{n, days}},
//                strike?:{after, share, days}, ruler?(s, demand) -> true when the faction grants a new ruler,
//                onTreason?(s, key, event) }) -> SIM.UNREST
//   SIM.unrestStep(minute)       SIM.step's, at midnight
//   SIM.unrestArrest(s)          the arrest odds' multiplier in settlement s (77-sim-6-crime.js reads it)
//   SIM.unrestSpare(s, g)        what s's faction's other settlements could send it of g (over their keep)
//   SIM.unrestReport(s?) -> {towns: {s: {level: {key: pool}, stage: {key: stage}, demands, strikes, treason}}, events}
//
// THE POOL. Each midnight a settlement's happiness pool (SIM.happinessPool: its people's mean happiness, collective `all`
// and by class) is eased into its LEVEL (an average over `smooth` days), and each key's (all, or a class's) STAGE is the
// deepest whose line its level is under: calm, grumble, demand, strike, treason. A stage eases back only once the level
// is `hyst` points above its line. One class may rise while another is content.
// GRUMBLING (a key at grumble or worse): the watch's arrest odds in the town times `grumble.arrest` (people hide their own).
// Assault already grows with unhappiness (77-sim-6-crime.js `assault.below`).
// DEMANDS (one a town at a time, on behalf of every key at demand or worse, none made in the last `demand.every` days):
// to the faction's authorities, for a SHIPMENT of the goods the town fell short of yesterday (the economy's `short`: of the
// goods it lacked, the `goods` the faction could spare most of), else for A NEW RULER. Answered the next midnight: a
// shipment from the faction's other settlements, each sending what it holds over `keep` days of its own use, up to `days`
// days of the asker's normal use (the most it used in a day over the last month; its short draws count every retry), booked
// exported by the sender and imported by the asker, so the books hold; granted when `grant` of what was asked came (two
// days of the five). A new
// ruler is the faction's `ruler` hook's to grant (none yet: refused, there is no political system: PLAN-MONEY.md section
// 3). Granted, the people of the asking keys are cheered (`granted.n` points, a negative modifier, fading over its days);
// refused, they are angrier.
// STRIKES (once a day, by every key at strike or worse, after a demand refused in the last `strike.after` days): the
// workplaces where most of the strikers work (`share` of them) are held for `days` (SIM.recipeHold, reason 'strike'):
// their hours are lost.
// TREASON (a key at treason): an event, once each time the stage is reached, and the world's `onTreason`. A revolution
// (which faction the town turns to, or none) needs the political system: core/simulation PLAN.md Phase 4.
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.UNREST = null;
  var ORDER = ['calm', 'grumble', 'demand', 'strike', 'treason'];
  SIM.unrest = function(o){ o=o||{};
    var d=function(x, v){ return x==null ? v : x; }, D=o.demand||{}, K=o.strike||{};
    SIM.UNREST = { cfg:{ classOf:o.classOf||null, smooth:d(o.smooth, 3), hyst:d(o.hyst, 5),
        stages:Object.assign({ grumble:50, demand:40, strike:30, treason:20 }, o.stages||{}), byFaction:o.byFaction||{},
        grumble:Object.assign({ arrest:0.7 }, o.grumble||{}),
        demand:{ goods:d(D.goods, 2), days:d(D.days, 5), keep:d(D.keep, 3), every:d(D.every, 5), grant:d(D.grant, 0.4), granted:Object.assign({ n:-10, days:10 }, D.granted||{}), refused:Object.assign({ n:5, days:10 }, D.refused||{}) },
        strike:{ after:d(K.after, 5), share:d(K.share, 0.5), days:d(K.days, 1) }, ruler:o.ruler||null, onTreason:o.onTreason||null },
      towns:{}, events:[], n:0 };
    return SIM.UNREST;
  };
  function town(s){ var T=SIM.UNREST.towns[s]; if(!T) T=SIM.UNREST.towns[s]={ level:{}, stage:{}, demands:[], strikes:[], treason:[] }; return T; }
  function stagesOf(s){ var U=SIM.UNREST, S=SIM.R.settlement && SIM.R.settlement[s], F=S && U.cfg.byFaction[S.faction]; return F ? Object.assign({}, U.cfg.stages, F) : U.cfg.stages; }
  function event(kind, o){ var U=SIM.UNREST, e=Object.assign({ m:SIM.minute(), kind:kind }, o); U.events.push(e); if(U.events.length>5000) U.events.shift(); SIM.logEvent('unrest '+kind, o); return e; }
  function members(s, key){ var U=SIM.UNREST; return SIM.all('actor').filter(function(a){ if(a.driven || !a.nd || SIM.settlementOf(a)!==s) return false;
    return key==='all' || (U.cfg.classOf ? U.cfg.classOf(a) : a.cls)===key; }); }
  function cheer(s, key, C, why){ if(!C || !C.n) return; members(s, key).forEach(function(a){ SIM.happinessAdd(a, C.n, C.days, why); }); }
  /* the stage of a level: the deepest line it is under; easing back a stage at a time, each `hyst` over its line */
  function stageOf(lv, was, L, hyst){ var k=0; for(var i=1;i<ORDER.length;i++) if(lv<L[ORDER[i]]) k=i;
    var w=ORDER.indexOf(was||'calm'); if(k>=w) return ORDER[k];
    while(w>k && lv>=L[ORDER[w]]+hyst) w--;
    return ORDER[w]; }
  SIM.unrestArrest = function(s){ var U=SIM.UNREST; if(!U || s==null) return 1; var T=U.towns[s]; if(!T) return 1;
    for(var k in T.stage) if(ORDER.indexOf(T.stage[k])>=1) return U.cfg.grumble.arrest; return 1; };
  function yesterday(s){ var E=SIM.econ(s); return (E && E.day[Math.floor(SIM.minute()/1440)-1]) || {}; }
  /* a town's use of a good a day (its stock over its days of it) */
  function useOf(s, g){ return SIM.withEcon(s, function(){ var r=SIM.economyDays(g), st=SIM.stockOf(g); return r>0 && r<Infinity ? st/r : 0; }); }
  /* a town's normal use of g a day: the most it used in a day over the last month (a town in want uses nothing; its short
     draws count every retry, so they measure the want's persistence, not its size) */
  function normalUse(s, g){ var E=SIM.econ(s), d=Math.floor(SIM.minute()/1440), m=0; if(!E) return 0;
    for(var k=d-30;k<d;k++){ var D=E.day[k]; if(D && D.used && D.used[g]>m) m=D.used[g]; } return Math.max(m, useOf(s, g)); }
  /* what the faction's other settlements could spare of g (over `keep` days of their own use) */
  function spareOf(s, g){ var S=SIM.R.settlement[s], C=SIM.UNREST.cfg.demand, n=0;
    Object.keys(SIM.R.settlement).forEach(function(f){ var E=SIM.econ(f); if(f===s || SIM.R.settlement[f].faction!==S.faction || !E || !E.goods[g]) return;
      n+=Math.max(0, SIM.withEcon(f, function(){ return Math.floor(SIM.stockOf(g)-C.keep*useOf(f, g)); })); }); return n; }
  SIM.unrestSpare = function(s, g){ return SIM.UNREST && SIM.R.settlement && SIM.R.settlement[s] ? spareOf(s, g) : 0; };
  /* the goods the town lacked most yesterday (its economy's short draws), those the faction could spare first: the town
     asks for what its masters hold (bread when its own yams failed) */
  function shortOf(s, n){ var E=SIM.econ(s); if(!E) return []; var sh=yesterday(s).short||{};
    var L=Object.keys(sh).filter(function(g){ return sh[g]>0 && E.goods[g]; }).map(function(g){ return { g:g, n:sh[g], sp:spareOf(s, g) }; });
    return L.sort(function(x, y){ return y.sp-x.sp || y.n-x.n || (x.g<y.g?-1:1); }).slice(0, n).map(function(x){ return x.g; }); }
  function ship(s, D){ var U=SIM.UNREST, C=U.cfg.demand, S=SIM.R.settlement[s], asked=0, came=0; D.sent={};
    D.goods.forEach(function(g){ var need=Math.max(1, Math.ceil(C.days*normalUse(s, g))); asked+=need;
      Object.keys(SIM.R.settlement).sort().forEach(function(f){ if(need<=0 || f===s || SIM.R.settlement[f].faction!==S.faction || !SIM.econ(f)) return;
        var n=SIM.withEcon(f, function(){ var spare=Math.floor(SIM.stockOf(g)-C.keep*useOf(f, g)); if(spare<=0) return 0; var k=SIM.economyTake(g, Math.min(spare, need)); if(k>0) SIM.economyBook('exported', g, k); return k; });
        if(!(n>0)) return; SIM.withEcon(s, function(){ SIM.economyLand(g, n, null); SIM.economyBook('imported', g, n); });
        need-=n; came+=n; D.sent[f+'>'+g]=n; }); });
    D.asked=asked; D.came=came; return came>0 && came>=C.grant*asked; }
  function answer(s, T, D){ var U=SIM.UNREST, ok;
    if(D.kind==='goods') ok=ship(s, D); else { ok=!!(U.cfg.ruler && U.cfg.ruler(s, D)); if(!ok && !U.cfg.ruler) D.why='no political system yet'; }
    D.answer=ok ? 'granted' : 'refused'; D.answered=SIM.minute();
    D.keys.forEach(function(k){ if(k==='all' || D.keys.indexOf('all')<0) cheer(s, k, ok ? U.cfg.demand.granted : U.cfg.demand.refused, 'demand '+D.answer); });
    event('answer', { settlement:s, key:D.key, keys:D.keys, demand:D.id, kind:D.kind, answer:D.answer, goods:D.goods, sent:D.sent||null, why:D.why||null }); }
  function strike(s, T, keys, minute){ var U=SIM.UNREST, C=U.cfg.strike, E=SIM.econ(s), by={}, key=keys.indexOf('all')>=0 ? 'all' : keys.join('+'); if(!E) return;
    var who=keys.indexOf('all')>=0 ? members(s, 'all') : [].concat.apply([], keys.map(function(k){ return members(s, k); }));
    who.forEach(function(a){ var w=a.work; if(w!=null && E.recipes[w]) by[w]=(by[w]||0)+1; });
    var ids=Object.keys(by).sort(function(x, y){ return by[y]-by[x] || (x<y?-1:1); }), n=Math.ceil(ids.length*C.share), held=[];
    ids.slice(0, n).forEach(function(id){ if(E.recipes[id].hold) return; SIM.recipeHold(id, 'strike', minute+C.days*1440); held.push(id); });
    if(!held.length) return; var e={ m:minute, key:key, keys:keys, held:held, until:minute+C.days*1440 }; T.strikes.push(e); event('strike', { settlement:s, key:key, held:held.length, until:e.until }); }
  SIM.unrestStep = function(minute){ var U=SIM.UNREST; if(!U || !SIM.NEED || minute<=0 || minute%1440) return;
    var a=1-Math.exp(-1/Math.max(1e-9, U.cfg.smooth));
    Object.keys(SIM.R.settlement||{}).sort().forEach(function(s){ var P=SIM.happinessPool(s, U.cfg.classOf), T=town(s), L=stagesOf(s);
      if(!P.all.n) return;
      var keys={ all:P.all.mean }; Object.keys(P.byClass).forEach(function(c){ keys[c]=P.byClass[c].mean; });
      T.demands.forEach(function(D){ if(D.answer==null && D.due<=minute) answer(s, T, D); });   /* yesterday's demands, answered */
      Object.keys(keys).sort().forEach(function(k){ var x=keys[k]; if(x==null) return;
        var lv=T.level[k]=T.level[k]==null ? x : T.level[k]+(x-T.level[k])*a, was=T.stage[k]||'calm', st=stageOf(lv, was, L, U.cfg.hyst);
        T.stage[k]=st; if(st!==was){ event('stage', { settlement:s, key:k, from:was, to:st, level:Math.round(lv*10)/10 });
          if(st==='treason'){ var e={ m:minute, key:k, level:lv }; T.treason.push(e); event('treason', { settlement:s, key:k }); if(U.cfg.onTreason) U.cfg.onTreason(s, k, e); } }
      });
      /* one demand a town at a time, for every key at demand or worse (the deepest first); one strike a day, by every key at
         strike or worse, after a refused demand */
      var keysAt=function(i){ return Object.keys(T.stage).filter(function(k){ return ORDER.indexOf(T.stage[k])>=i; }).sort(function(x, y){ return T.level[x]-T.level[y] || (x<y?-1:1); }); };
      var dk=keysAt(2), last=T.demands[T.demands.length-1];
      if(dk.length && (!last || (last.answer!=null && minute-last.m>=U.cfg.demand.every*1440))){ var g=shortOf(s, U.cfg.demand.goods);
        var D={ id:s+':demand:'+(U.n++), m:minute, key:dk[0], keys:dk, kind:g.length ? 'goods' : 'ruler', goods:g, due:minute+1440, answer:null };
        T.demands.push(D); event('demand', { settlement:s, key:D.key, keys:dk, demand:D.id, kind:D.kind, goods:g }); }
      var sk=keysAt(3);
      if(sk.length && T.demands.some(function(D){ return D.answer==='refused' && minute-D.answered<=U.cfg.strike.after*1440; })) strike(s, T, sk, minute);
    });
  };
  SIM.unrestReport = function(s){ var U=SIM.UNREST; if(!U) return null; var out={ towns:{}, events:U.events.slice() };
    Object.keys(U.towns).sort().forEach(function(k){ if(s!=null && k!==s) return; var T=U.towns[k];
      out.towns[k]={ level:Object.assign({}, T.level), stage:Object.assign({}, T.stage), demands:T.demands.map(function(D){ return Object.assign({}, D); }), strikes:T.strikes.slice(), treason:T.treason.slice() }; });
    return out; };
})(typeof window!=='undefined'?window:globalThis);
