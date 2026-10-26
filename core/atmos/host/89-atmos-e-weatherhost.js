// ================================================================= ATMOS — host: a biome's weather in one call (ATMOS.bindWeather)
// [web] (the owner, 2026-10-26: "make sure all biomes can take appropriate weather from core/atmos"). core/atmos's weather
// (89-atmos-4-weather.js: auto / clear / rain / storm / fog, with ash and snow modes opt-in) needs a host to say what the weather
// does to ITS scene: the fog, the sun, the sky light, wet ground, snow that lies. The Throne's stations each wrote that by hand
// (biomes/throne/stations/glacier/89-host-atmos.js is the model this generalises); a biome now names its climate and gets:
//   modes    the base five always; snowfall and blizzard when o.climate.cold; ashfall and ash when o.climate.ash
//   apply    the fog thickens and greys (white in snow, warm grey in ash), the sun and the sky light dim, both eased by the
//            weather's own state (W.rain, W.fog, W.snow, W.ash): the page's own values are read once and scaled, never lost
//   wet      with core/water on the page, the ground materials it names (o.grounds) darken and shine as the rain wets them
//            (WATER.wetGround(mat, {rain: true}))
//   snow     with core/atmos/fx/89-atmos-fx-snowcover.js on the page and o.climate.cold, snow builds while it snows on every
//            lit material (ATMOS.snowCover + snowOnScene); o.climate.frozen: it never melts (a glacier's, a summit's air)
//   ui       the Weather selector in the host's panel (KHOST.ui when core/host is the page's host, else #ui), once it exists
// It changes nothing until the weather does: the mode starts 'clear' (o.mode), so a page looks as it did and its preset views
// stay what they were; the owner picks rain or snow from the selector, and a view may set ATMOS.W.mode.
//   ATMOS.bindWeather({climate: {wet, cold, frozen, ash}, sun, hemi, fog: scene.fog, grounds: [materials], mode, snowBase,
//                      ui: element}) -> ATMOS.W
// Needs ATMOS.init (core/atmos/host/89-atmos-c-hostbind.js: ATMOS.bindHost) first, and 89-atmos-4-weather.js and
// 89-atmos-9-host.js (the selector) listed by the build. In the SUBFOLDER core/atmos/host/ (builds that pool core/atmos's top
// level are unchanged): a build lists it by path.
(function(){const A=ATMOS;
 A.bindWeather=o=>{o=o||{};const C=o.climate||{},T=A.T,h=A.h||{},scene=h.scene;
  const fog=o.fog||(scene&&scene.fog)||null,sun=o.sun||null,hemi=o.hemi||null;
  // each value's base is the page's own; a page that sets it itself (a night cycle, a light mode) is followed: when the value
  // is not what this binding last wrote, the page changed it, and that becomes the base
  const track=(get,set)=>{let base=get(),last=null;return v=>{const cur=get();if(last===null||cur!==last)base=cur;last=v(base);set(last);};};
  const GREY=new T.Color(0x9aa0a6),WHITE=new T.Color(0xdde4ec),ASHC=new T.Color(0x6a625c),c=new T.Color(),fc=fog?fog.color.clone():null;let fcLast=null;
  const tFogD=fog&&fog.density!=null?track(()=>fog.density,v=>{fog.density=v;}):null,tFogF=fog&&fog.far!=null&&fog.density==null?track(()=>fog.far,v=>{fog.far=v;}):null;
  const tSun=sun?track(()=>sun.intensity,v=>{sun.intensity=v;}):null,tHemi=hemi?track(()=>hemi.intensity,v=>{hemi.intensity=v;}):null;
  const W=A.weather({mode:o.mode||'clear',snow:!!C.cold,ash:!!C.ash,apply:W=>{
   const r=W.rain||0,f=W.fog||0,s=W.snow||0,a=W.ash||0,k=Math.min(1,r*.6+f*.8+s*.9+a*.9);
   if(fog){if(fcLast&&!fog.color.equals(fcLast))fc.copy(fog.color);   /* the page recoloured its fog (dusk, night): follow it */
    c.copy(fc).lerp(GREY,Math.min(1,r*.5+f*.6)).lerp(WHITE,s*.9).lerp(ASHC,a*.8);fog.color.copy(c);fcLast=(fcLast||new T.Color()).copy(c);}
   if(tFogD)tFogD(b=>b*(1+3*r+5*f+6*s*s+5*a*a)+.0006*f*f+.0012*s*s*s);
   if(tFogF)tFogF(b=>b/(1+2*r+4*f+5*s*s+4*a*a));
   if(tSun)tSun(b=>b*(1-.55*k));
   if(tHemi)tHemi(b=>b*(1-.2*k+.1*s));
   if(o.apply)o.apply(W);}});
  if(C.wet!==false&&typeof WATER!=='undefined'&&WATER.wetGround&&o.grounds)o.grounds.forEach(m=>{if(m)WATER.wetGround(m,{rain:true});});
  if(C.cold&&A.snowCover&&!A.snow){A.snowCover({frozen:!!C.frozen,base:o.snowBase||0});if(scene)A.snowOnScene(scene);}
  const ui=()=>{if(document.getElementById('atmosWeather'))return true;const el=o.ui||(typeof KHOST!=='undefined'&&KHOST.ui)||document.getElementById('ui');
   if(!el||!A.weatherUI)return false;A.weatherUI(el);return true;};
  if(!ui())A.hook(()=>{ui();});   /* the host's panel is laid out after this binding: try again each frame until it is there */
  A.rec('weatherhost',{climate:{wet:C.wet!==false,cold:!!C.cold,frozen:!!C.frozen,ash:!!C.ash},modes:W.MODES,mode:W.mode,grounds:(o.grounds||[]).length});
  return W;};
})();
