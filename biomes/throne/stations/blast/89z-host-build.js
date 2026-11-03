// ================================================================= HOST — build (the blast zone)
// The dead forest came first (86: the logs, stumps, standing dead, the blocks). Then the Throne kit: the living forest past the seared
// edge (its cold belt's conifers and gill-corals), the pioneers' lichen on the ash; then one bake.
window._biome=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=THRONE.build({R:TERR.R-150,quality:q});}catch(e){reportErr('throne: '+e.stack);}
 _mark('throne');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Throne: a lateral blast on the north-north-east flank, ~2.5 km up (ideal type)',x:0,z:0,y:terrainH(0,-TERR.R)-200,r:TERR.R,h:1400});
})();
