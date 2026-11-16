// ================================================================= HOST — build
// The order a world follows: its own structures first (none here), then the kit, then one bake.
window._biome=null;
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 OUTL.SEEDS=WADI_SEEDS;
 try{window._biome=OUTL.build({R:TERR.R-150,quality:q,pools:POOLS.map(P=>({x:P.x,z:P.z,r:P.r,l:P.l}))});}catch(e){reportErr('biome: '+e.stack);}
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 if(BIO.setA2C)BIO.setA2C(renderer);
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 {let lo=Infinity,hi=-Infinity;const N=48,R0=TERR.R*.7;for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const x=(i/N*2-1)*R0,z=(j/N*2-1)*R0;const h=terrainH(x,z);if(isFinite(h)){if(h<lo)lo=h;if(h>hi)hi=h;}}
  REGISTER({name:'The Outlands: the fog wall and the gem shoulder (ideal type)',x:0,z:0,y:Math.floor(lo),r:TERR.R,h:Math.ceil(hi-lo)});}
 // the sun's shadows, attached off (?shadow=1 or the panel's button)
 if(typeof KSHADOW==='undefined'||!KSHADOW.attach){window._shadow='off: no core/shadow';return;}
 try{const S=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  scene.children.forEach(c=>{if(c.userData&&c.userData.farField)return;if(c.isMesh&&c.material===MAT_GROUND){S.cast(c,{cast:false});return;}S.cast(c);});
  if(FAR&&FAR.mesh)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;
  window.SHADOW=S;window._shadow={attached:true,on:!!(S.enabled&&S.enabled())};}catch(e){reportErr('shadow: '+e.stack);}
})();
