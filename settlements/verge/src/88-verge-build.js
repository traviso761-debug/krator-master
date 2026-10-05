// ================================================================= VERGE — the build order ([web])
// Structures first (the placement pass 70 reserves and records every plot and street; 72 draws them and pushes
// their OBSTACLES), then the ground (painted with the streets), then each biome kit grows over its own disc round
// everything that is reserved, then one bake. Each step is timed into window._build.
window._biome={};window._build={};
(function(){
 const T=(k,fn)=>{const t0=performance.now();try{fn();}catch(e){reportErr(k+': '+(e&&e.stack||e));}window._build[k]=Math.round(performance.now()-t0);};
 for(const o of VIEW_CLEAR)OBSTACLES.push(o);
 if(typeof VERGE_STRUCTURES==='function')T('structures',VERGE_STRUCTURES);
 T('ground',buildGround);
 const q=QS.has('flora')?+QS.get('flora'):1;
 if(q>0)for(const [name,K] of [['sedesert',typeof SEDESERT!=='undefined'?SEDESERT:null],['eastabyss',typeof EASTABYSS!=='undefined'?EASTABYSS:null]]){
  if(!K){reportErr('biome kit '+name+' is not loaded');continue;}
  const Z=BIOME_ZONES[name];BIO.host.center=Z.center;BIO.host.windows=Z.windows;
  T('biome:'+name,()=>{window._biome[name]=K.build({R:Z.R,quality:q});});}
 T('bake',()=>{const b=BIO.bake();window._instances=b.inst;window._bakeCalls=b.calls;});
 if(typeof VERGE_AFTER_BAKE==='function')T('after',VERGE_AFTER_BAKE);
})();
