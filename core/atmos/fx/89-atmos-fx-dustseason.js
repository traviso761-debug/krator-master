// ================================================================= ATMOS — fx: the dry season drives the dust (2026-11-09; opt-in)
// [G data] + [web]. The owner (crater-drylands' known issues, 2026-11-09): "the season based core changes": the dust a dry country throws up is
// the dry season's. core/clock's season (KCLOCK.season(...).dry, 0 in the wet .. 1 at the height of the dry) scales what the wind lifts:
//   ATMOS.dustSeasonK(dry, o) -> k     the share of the dry season's dust lifted now (pure): k = wet + (1 - wet) x smoothstep(from, to, dry);
//                                      o {wet (.25: the wet season's share: a gale still raises some), from (.2), to (.8)}
//   ATMOS.dustSeason(o) -> D           the host, once, after ATMOS.dust and ATMOS.airLoad (either may be absent). o:
//        dry ()->0..1                  the season's dryness now (the host's: KCLOCK.season(clock.day, clock.hour).dry, or BIO.SEASON.value)
//        wet, from, to                 dustSeasonK's
//        air                           the air's load to scale (default ATMOS.air, fx/89-atmos-fx-airload.js): its local dust (mg/m3 at full
//                                      lift) becomes base x k every frame, so the fog and KHAZ's dust and sight follow the season; the storm's
//                                      load is the page's own (a storm is weather, not season) and is left as it is
//      D.k                             the share now; D.mask(fn) -> (x, z) -> fn(x, z) x D.k: a dust mask for ATMOS.dust that follows the season.
//                                      The dust's sprites read their mask when they re-bake their height map (the camera moved ~15% of their
//                                      box, about 50 m): a sprite field follows the season then, not every frame. D.base the load it scales
// It only adds: a page that does not list it, or does not call it, is as before. Godot: k is the same arithmetic on the season's dry.
(function(){'use strict';
 if(typeof ATMOS==='undefined')return;var A=ATMOS;   /* core/atmos's top-level const (not on window), as every fx file reads it */
 function smooth(a,b,x){var t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);}
 A.dustSeasonK=function(dry,o){o=o||{};var wet=o.wet==null?.25:o.wet,from=o.from==null?.2:o.from,to=o.to==null?.8:o.to,d=+dry;
  if(!(d===d))d=0;return wet+(1-wet)*smooth(from,to,Math.min(1,Math.max(0,d)));};
 A.dustSeason=function(o){o=o||{};var dry=o.dry||function(){return 1;};
  var D={k:A.dustSeasonK(dry(),o),base:null,air:o.air||A.air||null};
  if(D.air)D.base=D.air.dust;
  D.mask=function(fn){return function(x,z){return fn(x,z)*D.k;};};
  D.tick=function(){D.k=A.dustSeasonK(dry(),o);if(D.air&&D.base!=null)D.air.dust=D.base*D.k;return D.k;};
  D.tick();if(A.hook)A.hook(function(){D.tick();});
  A.dustSeasonNow=D;return D;};
})();
