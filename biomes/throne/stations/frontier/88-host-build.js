// ================================================================= HOST — build (the frontier)
// The frontier's layout came first (86: the rows, the stumps, the slash, the traps, each an obstacle). Then the Throne kit
// (the shore, the fields' weeds, the clearings, the forest's edge), then the HYPERJUNGLE kit on the forest ('owned'), then
// one bake.
window._biome=null;window._jungle=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=THRONE.build({R:TERR.R-150,quality:q});}catch(e){reportErr('throne: '+e.stack);}
 _mark('throne');
 THRONE.TREES.forEach(T=>{const k=THRONE.SPECIES[T.sp].key;if(k==='greatruff'||k==='frilltree')OBSTACLES.push({x:T.x,z:T.z,r:T.rb*3,y0:T.y0-5,y1:T.y0+T.H});});
 try{MASK=forestMask;window._jungle=HYPERJUNGLE.build({R:TERR.R-150,quality:q,heroR:1600,fauna:!Q.has('nofauna')});}catch(e){reportErr('hyperjungle: '+e.stack);}finally{MASK=waterMask;}
 _mark('jungle');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Throne: the spice frontier (ideal type)',x:0,z:0,y:SEA-100,r:TERR.R,h:1200});
})();
