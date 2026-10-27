// ================================================================= CORE — the world clock: motion time and world time
// One clock for a whole world (GODOT-PLAN.md, Phase 1, "The world clock"). The host's frame loop owns it and steps
// it with the real seconds since its last frame; everything else reads it. Two axes, kept apart on purpose:
//   t     MOTION time, seconds since load: wind, particles, flags, walking, KSCHED timelines. A fast day never
//         makes anything move faster.
//   hour  WORLD time, 0..24, with a day count: the sky and sun, light schedules, weather's auto mode, SIM.step()
//         once per simulated minute, life schedules.
// One world day is 72 real minutes (Travis, Oct 2026): 20 world hours per real hour, a world hour every 3 minutes.
// The preview pages hold the hour still by default (running:false); the viewer can run time and set the hour.
// No THREE, no DOM, no wall clock. One shared object, KCLOCK. Godot: WorldClock.gd, the same fields and step().
//
//   KCLOCK.DAY_SECONDS                      4320: real seconds in one world day
//   KCLOCK.make({hour:12, day:0, dayLength:DAY_SECONDS, running:false, scale:1}) -> C
//   C.step(dt)      dt real seconds (negative or NaN count as 0; capped at 0.1). t += dt*scale; if running, the hour
//                   advances 24*dt*scale/dayLength and wraps into the next day. Returns C.
//   C.set(hour)     jump to an hour (wrapped into 0..24); the day is kept
//   C.run(on)       start or hold world time; motion time runs either way
//   C.fixed         a number pins t there and makes dt 0 (repeatable shots); null runs
//   C.t, C.dt, C.hour, C.day, C.running, C.scale, C.dayLength   read them directly
//   C.rate()        world hours per real hour (20 for a 72-minute day)
//   C.state() / C.load(s)   the clock as plain data (a saved game, the export) and back
//
// THE SEASON (biomes/hyperjungle/PLAN-LANDS.md, core gap H7): where the clock's day falls in the sky model's year
// (core/atmos/sky/89-atmos-e-skymodel.js: yearD, startDay, solsticeDay; day 0 is game start's date, as skyState's
// dayCount). Plain numbers, no THREE; the GDScript twin is kseason.gd beside this file (golden-season.json).
//   KCLOCK.YEAR                             {yearD:365, startDay:259, solsticeDay:350}: ATMOS.SKY's (test-clock.js checks)
//   KCLOCK.season(day, hour, o) -> {yearDay, phase, summer, wet, dry, quarter, name}
//   C.season(o)                             the same at the clock's day and hour
//     yearDay  0..yearD, fractional       phase  0..1 of the local year, 0 at midsummer
//     summer   -1..1, cos(phase): +1 at midsummer, -1 at midwinter (astronomical, no lag)
//     wet      0..1, how far into the wet season (the monsoon follows the sun: wet in summer); dry = 1 - wet
//     quarter  0..3 and name 'summer' | 'autumn' | 'winter' | 'spring', each centred on its solstice or equinox
//   o: {latitude (deg; > 0 north, which turns the year half round; omitted: south, as Krator's sites), lagD (days the
//       wet runs behind the sun: a river's flood after the rains; 0), sharp (> 0 squares the wet toward two seasons,
//       wet = 0.5 + 0.5 tanh(sharp summer) / tanh(sharp); 0 the plain cosine), wetIn ('summer' or 'winter': a
//       Mediterranean year rains in winter), year ({yearD, startDay, solsticeDay}: KCLOCK.YEAR)}
(function(root){
  var DAY=72*60;
  function wrap(h){h=h%24;return h<0?h+24:h;}
  function make(o){
    o=o||{};
    var C={t:0,dt:0,hour:wrap(o.hour!=null?o.hour:12),day:o.day|0,dayLength:o.dayLength>0?o.dayLength:DAY,
      running:!!o.running,scale:o.scale!=null?o.scale:1,fixed:null};
    C.step=function(dt){
      var real=+dt;if(!(real>0))real=0;if(real>.1)real=.1;
      if(C.fixed!=null){C.dt=0;C.t=C.fixed;return C;}
      C.dt=real*C.scale;C.t+=C.dt;
      if(C.running&&C.dt>0){var h=C.hour+24*C.dt/C.dayLength;while(h>=24){h-=24;C.day++;}C.hour=h;}
      return C;};
    C.set=function(h){C.hour=wrap(+h||0);return C;};
    C.run=function(on){C.running=on===undefined?!C.running:!!on;return C;};
    C.rate=function(){return 24*3600/C.dayLength;};
    C.state=function(){return{t:C.t,hour:C.hour,day:C.day,dayLength:C.dayLength,running:C.running,scale:C.scale};};
    C.load=function(s){for(var k in s)if(k in C&&typeof C[k]!=='function')C[k]=s[k];C.hour=wrap(C.hour);return C;};
    C.season=function(o){return season(C.day,C.hour,o);};
    return C;}
  var YEAR={yearD:365,startDay:259,solsticeDay:350},NAMES=['summer','autumn','winter','spring'],TAU=2*Math.PI;
  function frac(x){return x-Math.floor(x);}
  function season(day,hour,o){
    o=o||{};var Y=o.year||YEAR,yD=Y.yearD,t=(+day||0)+(hour==null?0:+hour)/24;
    var yd=yD*frac((Y.startDay+t)/yD),north=o.latitude!=null&&o.latitude>0,lag=o.lagD==null?0:+o.lagD,sh=o.sharp==null?0:+o.sharp;
    var ph=frac((yd-Y.solsticeDay)/yD+(north?.5:0)),lw=Math.cos(TAU*frac((yd-Y.solsticeDay-lag)/yD+(north?.5:0)));
    if(o.wetIn==='winter')lw=-lw;
    var wet=sh>0?.5+.5*Math.tanh(sh*lw)/Math.tanh(sh):.5+.5*lw,q=Math.floor(frac(ph+.125)*4)%4;
    return{yearDay:yd,phase:ph,summer:Math.cos(TAU*ph),wet:wet,dry:1-wet,quarter:q,name:NAMES[q]};}
  root.KCLOCK={DAY_SECONDS:DAY,YEAR:YEAR,make:make,season:season};
})(typeof window!=='undefined'?window:globalThis);
