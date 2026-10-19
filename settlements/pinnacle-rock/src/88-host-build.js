// ================================================================= HOST — build (Pinnacle Rock: the rock's plants, then the forest)
// Two kits on one page (biomes/WORLD.md), as on the necanyons page: the necanyons kit first, on the walls, their feet and
// the stacks, but not on the mesa's top (the town's ground: PLAN.md, "no trees on the top") except in its 12 m rim band
// and on the Garden's stacks; its trees become obstacles; then the hyperjungle plants the floor (necanyons' jungleMask:
// off the rock and the walls' feet, out of the farms and the bands' grounds, thin on the cleared ground); then one bake.
window._biome=null;window._jungle=null;
// the kit's mask on this page: the water's, and nothing on the mesa's top more than 12 m in from its edge
const topMask=(x,z)=>{const A=KSTACKS.at([MESA_B],x,z);if(!A)return 1;const on=KSTACKS.at(ROCK,x,z);
 if(on&&on.S!==MESA_B)return 1;return A.d>-12?1:0;};
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 MASK=(x,z)=>waterMask(x,z)*topMask(x,z);
 try{window._biome=NECANYONS.build({R:TERR.R-60,quality:q});}catch(e){reportErr('necanyons: '+e.stack);}finally{MASK=waterMask;}
 _mark('necanyons');
 (NECANYONS.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.6+1,y0:T.y0-3,y1:T.y0+T.H}));
 if(!Q.has('nojungle')){try{MASK=jungleMask;window._jungle=HYPERJUNGLE.build({R:TERR.R-60,quality:q*.7,heroR:900,fauna:!Q.has('nofauna')});}catch(e){reportErr('hyperjungle: '+e.stack);}finally{MASK=waterMask;}}
 _mark('jungle');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'Pinnacle Rock (the knoll and its forest)',x:0,z:0,r:TERR.R,h:560});
})();
