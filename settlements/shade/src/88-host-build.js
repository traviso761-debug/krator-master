// ================================================================= HOST — build
// The order: 87b places structures and pushes OBSTACLES before the biome grows;
// the places were reserved in the flora mask (45), then one bake collects both.
window._biome=null;
(function(){
 const t0=performance.now();
 for(const o of VIEW_CLEAR)OBSTACLES.push(o);   // keep the preset cameras out of the trees
 try{window._biome=SEDESERT.build({R:TERR.R-100,quality:1});}catch(e){reportErr('biome: '+e.stack);}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
})();
