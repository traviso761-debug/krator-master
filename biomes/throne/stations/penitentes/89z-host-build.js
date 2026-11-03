// ================================================================= HOST — build (the lee's penitentes)
// The penitentes and the rock steps' boulders came first (86). Then the Throne kit alone (no trees: only its
// cold pass's lichen and cushions); then one bake.
window._biome=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=THRONE.build({R:TERR.R-150,quality:q});}catch(e){reportErr('throne: '+e.stack);}
 _mark('throne');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Throne: the lee\'s penitentes on the east flank, ~5.4 km up (ideal type)',x:0,z:0,y:terrainH(TERR.R,0)-200,r:TERR.R,h:1400});
})();
