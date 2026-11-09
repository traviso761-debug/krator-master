// ================================================================= HOST — build (the isle)
// Several kits on one page (biomes/WORLD.md): the geyser kit first, on the vent's field (its sinter, its trees, its floor,
// its show), then its trees become obstacles; then THIS kit, which grows its own species and, in place, the borrowed
// ones of the Throne, swbay, eastabyss and sedesert, and the gardens' crops on the host's plots; then one bake.
window._biome=null;window._geyser=null;
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it; ?nogeyser=1 leaves the vent bare
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 // ?imp=0: the borrowed kits' far trees as their own blobs instead of octahedral impostors (34-core-impostor.js; the final rebuild)
 if(Q.get('imp')==='0')[typeof THRONE!=='undefined'&&THRONE,typeof SWBAY!=='undefined'&&SWBAY,typeof EASTABYSS!=='undefined'&&EASTABYSS,typeof SEDESERT!=='undefined'&&SEDESERT,
  typeof RIFT!=='undefined'&&RIFT,typeof NWLOW!=='undefined'&&NWLOW,typeof HYPERJUNGLE!=='undefined'&&HYPERJUNGLE].forEach(K=>{if(K)K.IMPOSTORS=false;});
 // the geyser kit's passes run round the vent (GEYSER.build's center, 2026-10-26: it puts the host's centre back itself)
 if(!Q.has('nogeyser')&&!(typeof STATION!=='undefined'&&STATION.geyser===false)){try{window._geyser=GEYSER.build({R:VENT.r*1.6,quality:q,center:[VENT.x,VENT.z]});}catch(e){reportErr('geyser: '+e.stack);}}
 _mark('geyser');
 if(GEYSER.SHOW){GEYSER.SHOW.U.uSun.value.set(...SUN_POS).normalize();_onLight.push(m=>GEYSER.SHOW.setLight(m==='night'?.25:1));}
 (GEYSER.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.rb*2+1.5,y0:T.y0-3,y1:T.y0+T.H}));
 // the borrowed Throne's items this page plants past the core's instance cap (the instance-cap rule, 2026-11-08), given their cap and capWhy here, on
 // the Throne's registry, so the Throne's own files do not change (2026-11-09: the high isle's rainforest and cloud forest, station 2)
 {const D=BIO.kits.throne&&BIO.kits.throne.defs,cap=(k,n,why)=>{if(D&&D[k]&&D[k].cap==null){D[k].cap=n;D[k].capWhy=why;}};
  cap('small',400000,'the Throne\'s small plants borrowed for the high isle\'s windward rainforest and cloud belt (ringisles station 2): 275,677 at 2026-11-09');
  cap('treefrond',500000,'the Throne\'s tree fern fronds, the tree ferns thickened in the high isle\'s cloud belt (ringisles station 2, 87-host-cloud.js): 348,439 at 2026-11-09');}
 try{window._biome=RINGISLES.build({R:TERR.R,quality:q,plots:HOST_PLOTS});}catch(e){reportErr('ringisles: '+e.stack);}
 _mark('ringisles');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
})();
