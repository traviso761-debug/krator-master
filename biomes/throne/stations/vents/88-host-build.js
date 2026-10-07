// ================================================================= HOST — build (vent country)
// The waters, the glow, the steam and the hollows came first (86: the hollows are obstacles). Then the Throne kit alone
// (no understory: the vent ground is sparse and the acid keeps it so); then one bake. The shared atmosphere binds after
// it (89: the acid fog, and the ash).
window._biome=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=THRONE.build({R:TERR.R-150,quality:q});}catch(e){reportErr('throne: '+e.stack);}
 _mark('throne');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Throne: vent country, the east rift under the plume (ideal type)',x:0,z:0,y:1200,r:TERR.R,h:600});
})();
