// ================================================================= HOST — build (the lava tube)
// The tube, its light, its lava and the life on its walls and roof came first (84, 86). Then the Throne kit alone: its
// skylight zone (siphon trees, lamp caps, ferns and moss in the light), its gully zone on the skylights' rims, and its cave
// pass on the dark floor; then one bake. No weather: under the rock there is none.
window._biome=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=THRONE.build({R:TERR.R-150,quality:q});}catch(e){reportErr('throne: '+e.stack);}
 _mark('throne');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Throne: a lava tube under an old flow on the south-east shoulder (ideal type)',x:0,z:0,y:SURF0-80,r:TERR.R,h:200});
})();
