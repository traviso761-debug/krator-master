// ================================================================= HOST — the sun's shadows (core/shadow, KSHADOW), toggleable
// The owner (2026-11-03): shadows toggleable and OFF by default. ?shadow=1 attaches KSHADOW: one 4096 box following the view
// (90-600 m by the eye's height); the talus, the bombs, the stones, the hair and the station's own structures cast and receive,
// the ground receives (and casts: a scarp's ledge throws on its own talus), the far field and the sky draw their own light.
// The terrain's own shadows at any range are KHORIZON's (84-host-ground.js), on with or without this. Measured in PERF.md.
// Every station takes this fragment (none overrides it).
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')==='1'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;
if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  window._shadow.cast(scene);
  if(FAR&&FAR.mesh)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;}catch(e){reportErr('shadow: '+e.stack);}}
window._shadowOn=SHADOW_ON;
