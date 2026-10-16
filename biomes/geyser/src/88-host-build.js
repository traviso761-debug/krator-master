// ================================================================= HOST — build (the geyser basin)
// Two kits on one page (biomes/WORLD.md): this kit first, on the floor (its sinter, its trees and the dead forest, its
// floor, its show), then its trees become obstacles, then the HYPERJUNGLE plants the plateau, the walls and the coast
// (its mask: off the floor, out of the dead forest, off the beach), then one bake.
window._biome=null;window._jungle=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=GEYSER.build({R:TERR.R-100,quality:q});}catch(e){reportErr('geyser: '+e.stack);}
 _mark('geyser');
 if(GEYSER.SHOW){GEYSER.SHOW.U.uSun.value.set(...SUN_POS).normalize();_onLight.push(m=>GEYSER.SHOW.setLight(m==='night'?.25:1));}
 (GEYSER.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.rb*2+1.5,y0:T.y0-3,y1:T.y0+T.H}));
 if(!Q.has('nojungle')){try{MASK=jungleMask;window._jungle=HYPERJUNGLE.build({R:TERR.R-60,quality:q,heroR:900,fauna:!Q.has('nofauna')});}catch(e){reportErr('hyperjungle: '+e.stack);}finally{MASK=waterMask;}}
 _mark('jungle');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
})();
