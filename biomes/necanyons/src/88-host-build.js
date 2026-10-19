// ================================================================= HOST — build (the necanyons)
// Two kits on one page (biomes/WORLD.md): this kit first, on the rock, the walls' feet and the creek's banks; then its trees
// become obstacles; then the HYPERJUNGLE plants the canyon floor (its mask: off the rock and the walls' feet, out of the
// creek, thinning northward toward Korona); then one bake.
window._biome=null;window._jungle=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=NECANYONS.build({R:TERR.R-60,quality:q});}catch(e){reportErr('necanyons: '+e.stack);}
 _mark('necanyons');
 (NECANYONS.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.6+1,y0:T.y0-3,y1:T.y0+T.H}));
 if(!Q.has('nojungle')){try{MASK=jungleMask;window._jungle=HYPERJUNGLE.build({R:TERR.R-60,quality:q*.7,heroR:900,fauna:!Q.has('nofauna')});}catch(e){reportErr('hyperjungle: '+e.stack);}finally{MASK=waterMask;}}
 _mark('jungle');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The north-eastern canyons (a reach of them)',x:0,z:0,r:TERR.R,h:520});
})();
