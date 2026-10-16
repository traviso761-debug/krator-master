// ================================================================= HOST — build (the glacier)
// The ice, the waters and the caves came first (86: the caves, the towers and the arch are obstacles; the caves' warm floors
// planted). Then the Throne kit alone (its cold passes: the 'cbelt' field); then one bake. The shared atmosphere binds after
// it (89: the snow).
window._biome=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=THRONE.build({R:TERR.R-150,quality:q});}catch(e){reportErr('throne: '+e.stack);}
 _mark('throne');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Throne: the glacier and its ice caves, the north-west flank ~6 km up (ideal type)',x:0,z:0,y:5300,r:TERR.R,h:1400});
})();
