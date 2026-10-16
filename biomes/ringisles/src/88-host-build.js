// ================================================================= HOST — build (the isle)
// Several kits on one page (biomes/WORLD.md): the geyser kit first, on the vent's field (its sinter, its trees, its floor,
// its show), then its trees become obstacles; then THIS kit, which grows its own species and, in place, the borrowed
// ones of the Throne, swbay, eastabyss and sedesert, and the gardens' crops on the host's plots; then one bake.
window._biome=null;window._geyser=null;
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it; ?nogeyser=1 leaves the vent bare
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 // the geyser kit's passes run round the core's centre: the vent's, while it builds
 if(!Q.has('nogeyser')){const c0=BIO.host.center;BIO.host.center=[VENT.x,VENT.z];try{window._geyser=GEYSER.build({R:VENT.r*1.6,quality:q});}catch(e){reportErr('geyser: '+e.stack);}finally{BIO.host.center=c0;}}
 _mark('geyser');
 if(GEYSER.SHOW){GEYSER.SHOW.U.uSun.value.set(...SUN_POS).normalize();_onLight.push(m=>GEYSER.SHOW.setLight(m==='night'?.25:1));}
 (GEYSER.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.rb*2+1.5,y0:T.y0-3,y1:T.y0+T.H}));
 try{window._biome=RINGISLES.build({R:TERR.R,quality:q,plots:HOST_PLOTS});}catch(e){reportErr('ringisles: '+e.stack);}
 _mark('ringisles');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
})();
