// ================================================================= ATMOS — fx: the katabatic wind (a night gale draining downslope) (ATMOS.katabatic)
// biomes/seouterwall's God-Bore (PLAN.md section 2.1, 2026-11-10): two hours after sunset, radiative cooling on a crest and the drainage
// off a high shield send dense cold air down every couloir and through every pass, 80-130 km/h, until after dawn. The page's wind is
// core/atmos's one field (ATMOS.windBase, slowly veering, times ATMOS.windScale, the weather's; travelling gusts on top: atmGust), which
// the foliage, the smoke, the rain, the snow and the cloth all ride (BIO.bindAtmosWind). This turns that BASE toward the gale's direction
// and strength by night and back by day, and raises the gusts with it: nothing else is touched, so every rider follows the gale.
// Opt-in (core/atmos/fx/, listed by path); needs 89-atmos-0-core.js (ATMOS.init/bindHost). No core file is edited: a page without it
// draws what it drew.
//
//   ATMOS.katabatic({from:[x,z], speed (3), on (20: the hour it is full), off (5: the hour it starts to ease, may be past 24), ramp (1 h),
//                    gust (.9: the gust amplitude at full), name})
//        from    where the gale comes FROM (a unit-ish vector in xz: the crest's or the shield's side); it blows toward -from
//        speed   its strength as a multiple of the presets' calm base wind (ATMOS.PRESETS.wind.base): the weather's scale still multiplies it
//        -> K: {rec (the effect record: ATMOS.export lists it), at(hour) (the pure state, as ATMOS.katabaticAt), stop()}
//   ATMOS.katabaticAt(hour, o)   the pure state at an hour: {k (0 day .. 1 the full gale), wind:[x,z] (the base wind it sets, before the
//        weather's scale), gust (the gust amplitude floor)}; o defaults to the bound gale's options. Godot replays this from the record
//   Each frame (an ATMOS.hook, moved to the end of the list on its first frame, so it runs after the weather's, which writes the gust
//   amplitude): windBase = mix(the day's base, -from x speed x calm, k); gustAmp = max(the weather's, gust x k)
(function(){
 'use strict';
 if(typeof ATMOS==='undefined')return;const A=ATMOS;
 const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
 const norm=v=>{const l=Math.hypot(v[0],v[1])||1;return [v[0]/l,v[1]/l];};
 const opts=o=>{o=o||{};return {from:norm(o.from||[0,-1]),speed:o.speed==null?3:o.speed,on:o.on==null?20:o.on,off:o.off==null?5:o.off,ramp:o.ramp==null?1:o.ramp,
  gust:o.gust==null?.9:o.gust,name:o.name==null?'katabatic':o.name};};
 // k at an hour: rising over `ramp` to full at `on`, full to `off` (the next morning: an hour under `on` is read +24), easing over `ramp`
 const kAt=(h,O)=>{const off=O.off<=O.on?O.off+24:O.off,hh=h<O.on-O.ramp?h+24:h;return ss(O.on-O.ramp,O.on,hh)*(1-ss(off,off+O.ramp,hh));};
 A.katabaticAt=function(hour,o){const O=o?opts(o):A._kat?A._kat.O:opts(null),k=kAt(hour,O),P=A.PRESETS&&A.PRESETS.wind,calm=P?Math.hypot(P.base[0],P.base[1])||1:1;
  const day=A._kat?A._kat.day:(P?P.base:[1,0]),g=[-O.from[0]*calm*O.speed,-O.from[1]*calm*O.speed];
  return {k,wind:[day[0]+(g[0]-day[0])*k,day[1]+(g[1]-day[1])*k],gust:O.gust*k};};
 A.katabatic=function(o){if(!A.U||!A.windBase){A.err('katabatic: core/atmos is not bound (ATMOS.bindHost first)');return null;}
  if(A._kat)A._kat.stop();
  const O=opts(o),day=[A.windBase.x,A.windBase.y],rec=A.rec('katabatic',{name:O.name,from:O.from,speed:O.speed,on:O.on,off:O.off,ramp:O.ramp,gust:O.gust,day});
  let moved=false,live=true;
  const fn=(t,hour)=>{if(!live)return;if(!moved){moved=true;const i=A.hooks.indexOf(fn);if(i>=0&&i<A.hooks.length-1){A.hooks.splice(i,1);A.hooks.push(fn);return;}}
   const S=A.katabaticAt(hour);A.windBase.set(S.wind[0],S.wind[1]);if(A.U.gustAmp&&S.gust>A.U.gustAmp.value)A.U.gustAmp.value=S.gust;};
  A.hook(fn);
  const K={rec,O,day,at:h=>A.katabaticAt(h),stop:()=>{live=false;const i=A.hooks.indexOf(fn);if(i>=0)A.hooks.splice(i,1);A.windBase.set(day[0],day[1]);if(A._kat===K)A._kat=null;}};
  A._kat=K;return K;};
})();
