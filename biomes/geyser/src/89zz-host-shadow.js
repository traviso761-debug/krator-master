// ================================================================= HOST — the sun's shadows, last (after the sea's weather has hooked the ground)
// KSHADOW (core/shadow; the owner, 2026-11-03): one 4096 box following the view, 90-600 m by the eye's height; the flora and the ground cast and receive (the
// ground receives only); the springs, the columns, the plumes, the steam, the water and the impostors draw their own light (shader materials: KSHADOW skips
// them). The shadow map takes a texture unit in every lit material, so it is decided here, once every hook is on the ground (89w's weather adds two after
// 85 counted it: the GPU verify, 2026-11-04): skipped where the ground has none left, as on ringisles and the Throne's isle (window._shadow says so).
// ?shadow=0 off (its cost: KNOWN_ISSUES.md)
// The stations' shared base (stations/field) attaches KSHADOW in its own 88 and drops 85, so SHADOW_WANT is not on those pages: skipped there.
(function(){if(typeof SHADOW_WANT==='undefined'||!SHADOW_WANT||new URLSearchParams(location.search).has('nobake'))return;
 const u=samplersOf(MAT_GROUND);window._units.final=u;
 if(u+1>MAXT){window._shadow='skipped: the ground reads '+u+' of '+MAXT+' texture units';return;}
 try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});window._shadow.cast(scene);
  GROUND.forEach(m=>window._shadow.cast(m,{cast:false}));if(typeof FAR!=='undefined'&&FAR)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;}catch(e){reportErr('shadow: '+e.stack);}})();
