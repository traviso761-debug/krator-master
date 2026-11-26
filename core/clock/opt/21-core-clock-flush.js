// ================================================================= CORE — clock: the flush at the start of the rains  [G data]
// The copper flush (biomes/hyperjungle/PLAN-LANDS.md section 11, H7): the rust miombo's new leaves come out copper-red at the START
// of the rains, for a few weeks, then turn green. KCLOCK.season gives how far into the wet or the dry a day is; the flush is a
// pulse keyed to the day the wet last rose through one half (the rains' onset, whatever `sharp` is: the wet crosses .5 where the
// sun's cosine crosses 0). Plain numbers, no THREE, no DOM; opt-in (needs 20-core-clock.js first). It sits in opt/ because
// several settlements take every numbered file in core/clock, and their pages must not change. The GDScript twin is
// KSeason.flush in kseason.gd (golden-flush.json; node core/clock/test-flush.js).
//   KCLOCK.flush(day, hour, o) -> {flush (0..1), since (days since the rains began, 0..yearD)}
//   C.flush(o) is not added to a clock: call KCLOCK.flush(C.day, C.hour, o)
//   o: KCLOCK.season's {latitude, lagD, wetIn, year} (sharp does not move the onset), and the pulse's shape in days:
//      rise (5: from nothing to full), hold (18: full), fade (12: back to nothing; the leaves have turned green)
(function(root){
  'use strict';
  var KC=root.KCLOCK;if(!KC||!KC.season)throw new Error('core/clock 21-core-clock-flush.js: load 20-core-clock.js first (KCLOCK)');
  if(KC.flush)return;
  function frac(x){return x-Math.floor(x);}
  function sm(a,b,v){var t=(v-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);}
  KC.flush=function(day,hour,o){o=o||{};var Y=o.year||KC.YEAR,yD=Y.yearD,s=KC.season(day,hour,o),north=o.latitude!=null&&o.latitude>0,lag=o.lagD==null?0:+o.lagD;
    var arg=(s.yearDay-Y.solsticeDay-lag)/yD+(north?.5:0),a0=o.wetIn==='winter'?.25:.75,since=yD*frac(arg-a0);
    var rise=o.rise==null?5:+o.rise,hold=o.hold==null?18:+o.hold,fade=o.fade==null?12:+o.fade;
    return {flush:sm(0,rise,since)*(1-sm(rise+hold,rise+hold+fade,since)),since:since};};
})(typeof window!=='undefined'?window:globalThis);
