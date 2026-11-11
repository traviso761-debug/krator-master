// ================================================================= HOST — the build of a later station
// The order a world follows: its own structures first (STAGE.structures: the camps, huts, fields and stones as records and plain meshes),
// then the kit (OUTL.build: the station's colony types, the decay layer where STAGE.build.decay), then what the stage places after it
// (STAGE.after), then one bake; the shadows attached off.
window._biome=null;
(function(){
 const t0=performance.now(),Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 if(STAGE.structures){try{window._structures=STAGE.structures();}catch(e){reportErr('structures: '+e.stack);}}
 try{window._biome=OUTL.build(Object.assign({R:TERR.R-150,quality:q,pools:(WAT.pools||[]).map(P=>({x:P.x,z:P.z,r:P.r,l:P.l}))},STAGE.build||{}));}catch(e){reportErr('biome: '+e.stack);}
 /* what the stage places after the kit, before the bake (station 7: the House colony on the ruin's own surfaces) */
 if(STAGE.after){try{window._after=STAGE.after();}catch(e){reportErr('after: '+e.stack);}}
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 if(BIO.setA2C)BIO.setA2C(renderer);
 if(GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND&&!(STAGE.hzSkip&&STAGE.hzSkip.has(m))});}catch(e){reportErr('horizon: '+e.stack);}}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 {let lo=Infinity,hi=-Infinity;const N=48,R0=TERR.R*.7;for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const x=(i/N*2-1)*R0,z=(j/N*2-1)*R0;const h=terrainH(x,z);if(isFinite(h)){if(h<lo)lo=h;if(h>hi)hi=h;}}
  REGISTER({name:'The Outlands: '+STAGE.title+' (ideal type)',x:0,z:0,y:Math.floor(lo),r:TERR.R,h:Math.ceil(hi-lo)});}
 if(typeof KSHADOW==='undefined'||!KSHADOW.attach){window._shadow='off: no core/shadow';return;}
 try{const units=KSHADOW.units?KSHADOW.units(MAT_GROUND,renderer):0,MAXT=renderer.capabilities.maxTextures==null?16:renderer.capabilities.maxTextures;
  if(units+1>MAXT){window._shadow='skipped: the ground reads '+units+' of '+MAXT+' texture units';return;}
  const S=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  scene.children.forEach(c=>{if(c.userData&&c.userData.farField)return;if(c.isMesh&&c.material===MAT_GROUND){S.cast(c,{cast:false});return;}S.cast(c);});
  if(FAR&&FAR.mesh)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;
  window.SHADOW=S;window._shadow={attached:true,on:!!(S.enabled&&S.enabled()),ground:units+1,of:MAXT};}catch(e){reportErr('shadow: '+e.stack);}
})();
