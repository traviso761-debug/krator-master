// ================================================================= ATMOS — the shared sky on a biome page, in one call
// [G native] ATMOS.skyBiome(o) is what a biome kit's or a station's host-sky fragment calls in place of its painted dome
// (SKY-PLAN.md section 9, the roll-out after S1): it puts core/atmos's hour on the host
// clock (once the page binds core/atmos), draws ATMOS.sky at the page's site and returns the sky with what the rest of the page needs from it:
//   o.renderer, o.camera, o.scene, o.sun   the page's own (o.sun: its key DirectionalLight)
//   o.site     {px, py} on the scale model (the biome polygon's middle), or {latitude, subGiantLon}
//   o.preset   overrides merged into PRESETS.sky.standard (air, clouds, fogDensity, keys ...)
//   o.hemi     the page's HemisphereLight (default: the first in the scene); o.fills: DirectionalLights that keep their
//              share of the day and go out at night (default: every other DirectionalLight in the scene)
//   o.shade    false: no cloud shadows on the page's materials (default: every lit material, once, via ATMOS.cloudShade)
// The page's clock is the host's (core/host 91-host-loop.js makes it in KHOST.take, after this runs): the sky reads it
// through S.clock, so the page opens at 06:00 on game start's day (the owner) and #hour=, #day=, #time=run move it.
// Returns S (ATMOS.sky's) plus S.view(dt): the per-frame update to subscribe with KHOST.on(S.view,'view'); S.draw for
// KHOST.take's draw; and S.legacy {sky, giant, giantRing}: stand-ins with the old fragment's names, so a water fragment
// that built its skylight scene from the dome (new THREE.Mesh(sky.geometry, sky.material), giant.clone()) keeps working
// unchanged: the stand-in sky is the shared sky's own mesh, the giant and ring are empty (the sky draws both).
(function(){const A=ATMOS;
 A.skyBiome=function(o){const T=o.THREE||(A.T)||window.THREE,scene=o.scene;
  const day0=(()=>{const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash),d=m?+decodeURIComponent(m[1]):0;return isFinite(d)?d:0;})();
  const hc=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;
  const clock={get hour(){const c=hc();return c?c.hour:A.SKY.startHour;},get day(){const c=hc();return day0+(c?c.day||0:0);},get t(){const c=hc();return c?c.t:0;}};
  // the sky needs only three.js and its chunk: a page that binds core/atmos later (its water or atmos fragment calls
  // ATMOS.bindHost or ATMOS.init after this) keeps its own binding, and S.view puts that binding's hour on the clock
  const hourFn=()=>clock.hour;
  if(!A.T){A.T=T;if(!T.ShaderChunk.atmos_sky)T.ShaderChunk.atmos_sky=A.skyGLSL();}
  const onClock=()=>{if(A.h&&A.h.hour!==hourFn)A.h.hour=hourFn;};onClock();
  // the lights the sky drives, found before ATMOS.sky adds its own giantshine light
  let hemi=o.hemi||null;const fills=o.fills||[];if(!hemi||!o.fills)scene.traverse(l=>{if(l.isHemisphereLight&&!hemi)hemi=l;else if(!o.fills&&l.isDirectionalLight&&l!==o.sun)fills.push(l);});
  const base=fills.map(l=>l.intensity);
  const site=o.site||{px:446,py:690},P=A.skyPreset('standard',Object.assign({site},o.preset||{}));
  const S=A.sky(P,{renderer:o.renderer,camera:o.camera,scene,sun:o.sun,hemi,clock,fog:o.fog!==false});
  S.clock=clock;
  S.view=function(dt){onClock();S.update(dt);const k=Math.min(1,S.look.sunI/2);for(let i=0;i<fills.length;i++)fills[i].intensity=base[i]*k;
   if(typeof BIO!=='undefined'&&BIO.setSun)BIO.setSun(S.state.sunDir);};
  S.draw=()=>S.render();
  // S.modes(o): a page whose buttons, views and hooks speak in light modes (day, dawn, night) keeps them on the real hour.
  // o.hours {day, night, dawn?}: the hour each mode jumps the clock to; o.hooks: the page's hook array, each fn(mode) called
  // when the mode changes; o.set(mode): the page's own LIGHT_MODE variable. The mode follows the sun: night below -6 degrees,
  // dawn (when the page has one) up to 8, else day. S.setMode(m) is what the page's setLightMode calls.
  let modes=null,pendingHour=null,curMode=null;
  S.modes=function(mo){modes=mo;return S;};
  // a request moves the clock only when the light it names is not already the light: the pages ask for 'day' on every view
  // without a mode of their own (and on the first one), which must not throw the 06:00 opening forward; 'day' is any light
  // but night, so the Day button only acts at night
  const modeAt=a=>a<-6?'night':(modes.hours.dawn!=null&&a<8?'dawn':'day');
  S.setMode=function(m){if(!modes||modes.hours[m]==null)return;const now=pendingHour!=null?null:modeAt(S.state.sunAlt);
   if(now===m||(m==='day'&&now==='dawn'))return;const c=hc();if(c)c.set(modes.hours[m]);else pendingHour=modes.hours[m];};
  const modeTick=()=>{if(!modes)return;const c=hc();if(c&&pendingHour!=null){c.set(pendingHour);pendingHour=null;S.update(0);}
   const m=modeAt(S.state.sunAlt);if(m===curMode)return;curMode=m;
   if(modes.set)modes.set(m);for(const f of(modes.hooks||[])){try{f(m);}catch(e){console.warn('light hook: '+((e&&e.stack)||e));}}};
  const v0=S.view;S.view=function(dt){v0(dt);modeTick();};
  if(o.shade!==false)A.cloudShadeScene(scene);
  // old night code tints the dome's material and checks its lightness (necanyons' NIGHT, guilin's and necanyons' night check):
  // the shader ignores it, but it is there to be tinted and read
  if(!S.mesh.material.color)S.mesh.material.color=new T.Color(1,1,1);
  const st=new T.Mesh(S.mesh.geometry,S.mesh.material);st.frustumCulled=false;st.userData.probeSkip=true;
  const ge=new T.Object3D(),re=new T.Object3D();ge.userData.probeSkip=re.userData.probeSkip=true;
  S.legacy={sky:st,giant:ge,giantRing:re,giantDir:new T.Vector3(0,0,-1),GIANT_DIST:6000,wallSky:new T.Object3D()};   /* giantDir, GIANT_DIST: where an old water fragment placed its giant clone */
  return S;};
 // ATMOS.cloudShadeScene(scene): the clouds' shadows and the rain's darkening on every lit material in the scene, once
 // (SKY-PLAN.md 11.1). Plants (userData.biome) take porosity 0.4, structures (userData.host) 0.6, the rest 1; the animated
 // fauna are left out (their place comes from their own pose, not the instance matrix)
 A.cloudShadeScene=function(scene){const T=A.T,seen=new Set();scene.traverse(o=>{if(!o.isMesh||!o.material)return;
  for(const m of(Array.isArray(o.material)?o.material:[o.material])){
   if(seen.has(m)||!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial))continue;seen.add(m);
   const k=m.customProgramCacheKey!==T.Material.prototype.customProgramCacheKey?String(m.customProgramCacheKey()):'';if(/^biofauna|^bioanim/.test(k))continue;
   A.cloudShade(m,{porosity:o.userData.biome?.4:o.userData.host?.6:1});}});};
})();
