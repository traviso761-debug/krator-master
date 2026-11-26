// ================================================================= HOST — build (the necanyons)
// Two kits on one page (biomes/WORLD.md): this kit first, on the rock, the walls' feet and the creek's banks; then its trees
// become obstacles; then the HYPERJUNGLE plants the canyon floor (its mask: off the rock and the walls' feet, out of the
// creek, thinning northward toward Korona); then one bake.
window._biome=null;window._jungle=null;
const IMP_GAIN=1.6;   /* the hyperjungle's value, measured against its near crowns (2026-10-27); checked here on the canyon's figs and palms */
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 /* THE FAR BAND'S DIET (GRAPHIC-LOAD.md recommendations 1 and 2, 2026-10-27; ?diet=0 for the spine's static LOD alone, the page
    before): this kit's near and mid trees drawn in full within 950 m of the camera and octahedral impostors past that (and for every
    far tree), its carnivores and ground plants to 650 m; the hyperjungle's heroes to 900 m (its hero disc) and impostors past, its
    young trees, mid floor and fallen trees to 1400 m, its near floor to 650 m and its sparse far ring to 2200 m. A station's own
    options (its 45: STATION_BUILD) on top */
 const HB=typeof STATION_BUILD!=='undefined'?STATION_BUILD:{};
 if(Q.get('diet')!=='0'){Object.assign(NECANYONS.LOD,{tree:950,floor:650,carn:650},HB.lod||{});Object.assign(HYPERJUNGLE.LOD,{tree:900,sap:1400,floor:650,mid:1400,far:2200},HB.jlod||{});}
 else{NECANYONS.IMPOSTORS=false;HYPERJUNGLE.IMPOSTORS=false;}
 try{window._biome=NECANYONS.build(Object.assign({R:TERR.R-60,quality:q},HB.build||{}));}catch(e){reportErr('necanyons: '+e.stack);}
 _mark('necanyons');
 (NECANYONS.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.6+1,y0:T.y0-3,y1:T.y0+T.H}));
 if(!Q.has('nojungle')&&HB.jungle!==false){try{MASK=jungleMask;window._jungle=HYPERJUNGLE.build(Object.assign({R:TERR.R-60,quality:q*.7,heroR:900,fauna:!Q.has('nofauna')},HB.jbuild||{}));}catch(e){reportErr('hyperjungle: '+e.stack);}finally{MASK=waterMask;}}
 _mark('jungle');
 if(typeof stationBuild==='function'){try{window._station=stationBuild();}catch(e){reportErr('station: '+e.stack);}}   /* a station's own passes (its 87) */
 _mark('station');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');
 /* the impostors' light matched to the near crowns (the bake is ~4x dark until the core fix owed in HANDOFF-REBUILD.md); ?impgain= ?impwrap= */
 if(BIO.impostorLook){BIO.impostorLook({gain:+(Q.get('impgain')||IMP_GAIN),wrap:+(Q.get('impwrap')||1)});}
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
 /* the terrain's horizon on the flora and the rock (83-host-far.js: KHORIZON); not the far field */
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER(HB.region||{name:'The north-eastern canyons (a reach of them)',x:0,z:0,r:TERR.R,h:520});
})();
