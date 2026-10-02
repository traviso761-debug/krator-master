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
    return C;}
  root.KCLOCK={DAY_SECONDS:DAY,make:make};
})(typeof window!=='undefined'?window:globalThis);
