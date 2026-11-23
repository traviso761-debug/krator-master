// ================================================================= CORE — simulation 6: the seasons
// PROPOSAL-LONGSONG-PINNACLE.md phase S1 (the owner, 2026-11-11): recipes, yields and herd moves read the season. Opt-in:
// nothing changes until a world calls SIM.calendar(o); a recipe with no `season` and no `seasonRate` makes as it always
// did. The year is core/clock's (KCLOCK.season: the sky model's year, its quarters centred on the solstices and
// equinoxes), read at the sim's own day and hour, so the page's sky and its fields agree.
//
//   SIM.calendar({year:{yearD, startDay, solsticeDay}, latitude, lagD, sharp, wetIn, windows:{name:[from, to]}})
//                                       the world's year (KCLOCK.season's options; KCLOCK.YEAR when no `year`), and
//                                       named windows of it in year days (wrapping: [330, 20] spans the year's turn):
//                                       'harvest', 'sowing', 'summer-pasture'... SIM.calendar(null) turns it off
//   SIM.season(minute?) -> {yearDay, phase, summer, wet, dry, quarter, name, day, year, windows:{name: true}} | null
//   SIM.inSeason(spec, minute?)         spec: a quarter's name, a window's, or a list of them (any of them)
//   SIM.seasonK(o, minute?) -> 0..      the factor a recipe's or a herd's season gives now: `season` (a spec: 0 outside
//                                       it, 1 in it) times `seasonRate` ({quarter or window: factor}, every match
//                                       multiplied; unmatched 1). 1 without a calendar
//   SIM.onSeason(fn(now, before, minute))   called on the first minute of a new quarter, and when a window opens or
//                                       closes (a herd up to its summer pasture, the stores counted at the harvest's end)
// The economy (77-sim-6-economy.js) multiplies each recipe's units by SIM.seasonK and books 'out of season' in its blocked
// report when the factor is 0. Deterministic: no draws.
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.CAL = null;
  var HOOKS = [], last = null;
  function local(day, hour, C){
    if(root.KCLOCK && root.KCLOCK.season) return root.KCLOCK.season(day, hour, C.o);
    var Y=C.o.year||{ yearD:365, startDay:0, solsticeDay:0 }, yd=((Y.startDay+day+hour/24)%Y.yearD+Y.yearD)%Y.yearD;
    var q=Math.floor((((yd-Y.solsticeDay)/Y.yearD+.125)%1+1)%1*4)%4;
    return { yearDay:yd, phase:0, summer:0, wet:.5, dry:.5, quarter:q, name:['summer','autumn','winter','spring'][q] };
  }
  function within(yd, w){ var a=w[0], b=w[1]; return a<=b ? yd>=a && yd<b : yd>=a || yd<b; }
  SIM.calendar = function(o){
    if(o==null){ SIM.CAL=null; last=null; return null; }
    SIM.CAL = { o:{ year:o.year, latitude:o.latitude, lagD:o.lagD, sharp:o.sharp, wetIn:o.wetIn }, windows:Object.assign({}, o.windows||{}) };
    last=null; return SIM.CAL;
  };
  SIM.season = function(minute){
    var C=SIM.CAL; if(!C) return null;
    if(minute==null) minute=SIM.minute();
    var day=Math.floor(minute/1440), hour=(minute%1440)/60, S=local(day, hour, C), yD=(C.o.year||root.KCLOCK&&root.KCLOCK.YEAR||{ yearD:365 }).yearD;
    S.day=day; S.year=Math.floor(((C.o.year||root.KCLOCK&&root.KCLOCK.YEAR||{ startDay:0 }).startDay+day)/yD);
    S.windows={}; Object.keys(C.windows).forEach(function(k){ if(within(S.yearDay, C.windows[k])) S.windows[k]=true; });
    return S;
  };
  SIM.inSeason = function(spec, minute){
    var S=SIM.season(minute); if(!S) return true;
    var L=Array.isArray(spec) ? spec : [spec];
    for(var i=0;i<L.length;i++) if(L[i]===S.name || S.windows[L[i]]) return true;
    return false;
  };
  SIM.seasonK = function(o, minute){
    if(!SIM.CAL || !o || (o.season==null && o.seasonRate==null)) return 1;
    var S=SIM.season(minute);
    if(o.season!=null){ var L=Array.isArray(o.season) ? o.season : [o.season], hit=false;
      for(var i=0;i<L.length;i++) if(L[i]===S.name || S.windows[L[i]]) hit=true;
      if(!hit) return 0; }
    var k=1; if(o.seasonRate) Object.keys(o.seasonRate).forEach(function(n){ if(n===S.name || S.windows[n]) k*=o.seasonRate[n]; });
    return k;
  };
  SIM.onSeason = function(fn){ HOOKS.push(fn); return fn; };
  /* the turn of a quarter or a window, once a minute (a step hook: SIM.step calls it before the economy's rules) */
  function key(S){ return S.name+'|'+Object.keys(S.windows).sort().join(','); }
  SIM.stepHooks = SIM.stepHooks || [];
  SIM.stepHooks.push(function(minute){
    if(!SIM.CAL || !HOOKS.length) return;
    var S=SIM.season(minute), k=key(S);
    if(last===null){ last={ k:k, S:S }; return; }
    if(k!==last.k){ var before=last.S; last={ k:k, S:S }; HOOKS.forEach(function(fn){ fn(S, before, minute); }); }
  });
})(typeof window!=='undefined'?window:globalThis);
