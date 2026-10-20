// ================================================================= HOST — the night: the light, the fog and the dome by the world hour
// The biome kits' day and night (the geyser's setLightMode, biomes/geyser/src/82-host-sky.js), on the host's world clock
// (core/host 91-host-loop: its hour slider, ?hour=, the clock running): the key light, the sky light, the fill, the fog,
// the dome's tint and the exposure ease from the day's values to the night's over dusk and dawn (core/atmos's clock presets
// when the page has core/atmos, else the same numbers), and at night the giant is the moon: a cold key light from the
// north-east. KHOST.take's sky.hour calls NIGHT.hour(h); the N key flips between noon and midnight (NIGHT.flip).
// Another world reads this fragment in place (settlements/pinnacle-rock: its lamps and fires on core/atmos follow the same
// hour). The day's values are the page's own (45-host-stage.js), read when this fragment runs.
const NIGHT=(function(){
 const day={sunC:sun.color.clone(),sunI:sun.intensity,hemiS:hemi.color.clone(),hemiG:hemi.groundColor.clone(),hemiI:hemi.intensity,fillI:fill.intensity,
  fog:scene.fog.color.clone(),fogD:scene.fog.density,sky:new THREE.Color(0xffffff),exp:renderer.toneMappingExposure,pos:sun.position.clone()};
 const night={sunC:new THREE.Color(0x8aa6c8),sunI:.22,hemiS:new THREE.Color(0x2a3a4a),hemiG:new THREE.Color(0x0c0e0c),hemiI:.32,fillI:.04,
  fog:new THREE.Color(0x1a2228),fogD:day.fogD,sky:new THREE.Color(0x262c3c),exp:1.15,pos:giantDir.clone().multiplyScalar(day.pos.length())};
 const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
 const clockP=()=>typeof ATMOS!=='undefined'&&ATMOS.PRESETS&&ATMOS.PRESETS.clock?ATMOS.PRESETS.clock:{dawn:[5.5,7.2],dusk:[17.2,18.8]};
 // how far into the night the hour is, 0..1 (core/atmos's ATMOS.night: the same curve)
 const at=h=>{const C=clockP();return Math.min(1,Math.max(0,1-ss(C.dawn[0],C.dawn[1],h)+ss(C.dusk[0],C.dusk[1],h)));};
 const S={f:-1,hourNow:12,on:[],at};
 S.set=f=>{if(f===S.f)return;S.f=f;
  sun.color.copy(day.sunC).lerp(night.sunC,f);sun.intensity=day.sunI+(night.sunI-day.sunI)*f;
  // the key light swings from the sun's bearing to the giant's through the dusk (it stays a light from above)
  sun.position.copy(day.pos).lerp(night.pos,ss(.35,.65,f));
  hemi.color.copy(day.hemiS).lerp(night.hemiS,f);hemi.groundColor.copy(day.hemiG).lerp(night.hemiG,f);hemi.intensity=day.hemiI+(night.hemiI-day.hemiI)*f;
  fill.intensity=day.fillI+(night.fillI-day.fillI)*f;
  scene.fog.color.copy(day.fog).lerp(night.fog,f);
  if(sky&&sky.material&&sky.material.color)sky.material.color.copy(day.sky).lerp(night.sky,f);
  renderer.toneMappingExposure=day.exp+(night.exp-day.exp)*f;
  for(const fn of S.on){try{fn(f);}catch(e){reportErr('night: '+(e&&e.message||e));}}};
 S.hour=h=>{S.hourNow=h;S.set(at(h));};
 // the N key: noon to midnight and back, through the host's clock (the slider and every hour-driven thing follow)
 S.flip=()=>{const H=typeof KHOST!=='undefined'&&KHOST.host;const h=S.f>.5?13:0;if(H&&H.clock&&H.clock.set)H.clock.set(h);else S.hour(h);};
 S.hour(12);
 return S;})();
_mark('night');
