// ================================================================= HOST — build (the ash desert)
// The bones and the hollow came first (86, an obstacle). Then the Throne kit alone (no understory: the plume's ground is
// sparse); then one bake. The shared atmosphere binds after it (89: the ash weather).
window._biome=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=THRONE.build({R:TERR.R-150,quality:q});}catch(e){reportErr('throne: '+e.stack);}
 _mark('throne');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Throne: deep under the plume, the ash desert (ideal type)',x:0,z:0,y:1900,r:TERR.R,h:700});
})();
