// ================================================================= HOST — build (the isle)
// The isle's layout came first (86: the cones, the snags, the camp, the canoes, each an obstacle). Then the Throne kit
// alone (an island's forest is its own smaller one: no hyperjungle here), with its shallows pass (the kelp, the wrack, the
// lagoon's hyper-mangroves); then the camp's tapping on the spice trees it grew; then one bake.
window._biome=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=THRONE.build({R:TERR.R-150,quality:q,shallows:true,understory:true});}catch(e){reportErr('throne: '+e.stack);}
 _mark('throne');
 try{ISLE.tap();}catch(e){reportErr('tapping: '+e.stack);}
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Throne: a geyser isle (ideal type)',x:DOME.cx,z:DOME.cz,y:SEA-60,r:TERR.R,h:600});
})();
