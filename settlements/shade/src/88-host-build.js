// ================================================================= HOST — build
// The order: the places are already reserved in the flora mask (45); no
// structures stand yet (the building kit comes next), so the biome runs, then
// one bake. A structure added later goes BEFORE the biome and pushes OBSTACLES.
window._biome=null;
(function(){
 const t0=performance.now();
 for(const o of VIEW_CLEAR)OBSTACLES.push(o);   // keep the preset cameras out of the trees
 try{window._biome=SEDESERT.build({R:TERR.R-100,quality:1});}catch(e){reportErr('biome: '+e.stack);}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
})();
