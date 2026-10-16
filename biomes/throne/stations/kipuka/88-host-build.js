// ================================================================= HOST — build (the kipuka)
// Two kits on one page (biomes/WORLD.md): the Throne kit first (the young lava, the pioneers, the great ruffs on the
// kipuka's rims, the siphon trees, the lava casts), then its big trees become obstacles, then the HYPERJUNGLE kit plants
// the kipuka themselves (its mask: the 'owned' ground only), then one bake. The siphon trees' mist after the build.
window._biome=null;window._jungle=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=THRONE.build({R:TERR.R-150,quality:q});}catch(e){reportErr('throne: '+e.stack);}
 // the Throne's big trees keep the hyperjungle's trunks off them
 THRONE.TREES.forEach(T=>{const k=THRONE.SPECIES[T.sp].key;if(k==='greatruff'||k==='siphon'||k==='frilltree')OBSTACLES.push({x:T.x,z:T.z,r:k==='greatruff'?T.crownR*.5+T.rb:k==='frilltree'?T.rb*2.5:T.rb*3,y0:T.y0-5,y1:T.y0+T.H});});
 try{MASK=kipukaMask;window._jungle=HYPERJUNGLE.build({R:TERR.R-150,quality:q,heroR:1600,fauna:!Q.has('nofauna')});}catch(e){reportErr('hyperjungle: '+e.stack);}finally{MASK=waterMask;}
 window._mist=makeMist(THRONE.TREES.filter(T=>THRONE.SPECIES[T.sp].key==='siphon').map(T=>[T.x,T.y0+T.H,T.z,T.rb]));
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Throne: the kipuka (ideal type)',x:0,z:0,y:slopeH(0,0)-300,r:TERR.R,h:900});
})();
