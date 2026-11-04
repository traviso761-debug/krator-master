// ================================================================= HOST — build (the geyser basin)
// Two kits on one page (biomes/WORLD.md): this kit first, on the floor (its sinter, its trees and the dead forest, its
// floor, its show), then its trees become obstacles, then the HYPERJUNGLE plants the plateau, the walls and the coast
// (its mask: off the floor, out of the dead forest, off the beach), then one bake.
window._biome=null;window._jungle=null;
const IMP_GAIN=1.6;   /* the hyperjungle's, measured on its page against its near boles and crowns (its 88) */
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=GEYSER.build({R:TERR.R-100,quality:q});}catch(e){reportErr('geyser: '+e.stack);}
 _mark('geyser');
 if(GEYSER.SHOW){GEYSER.SHOW.U.uSun.value.set(...SUN_POS).normalize();_onLight.push(m=>GEYSER.SHOW.setLight(m==='night'?.25:1));}
 (GEYSER.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.rb*2+1.5,y0:T.y0-3,y1:T.y0+T.H}));
 if(Q.get('diet')==='0')HYPERJUNGLE.IMPOSTORS=false;
 if(!Q.has('nojungle')){try{MASK=jungleMask;window._jungle=HYPERJUNGLE.build({R:TERR.R-60,quality:q,heroR:900,fauna:!Q.has('nofauna')});}catch(e){reportErr('hyperjungle: '+e.stack);}finally{MASK=waterMask;}}
 _mark('jungle');
 if(typeof STATION_BUILD==='function'){try{window._station=STATION_BUILD();}catch(e){reportErr('station: '+e.stack);}}   /* a station's own placement (stations/<name>/), before the one bake */
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;
 /* THE FINAL REBUILD (pair 7, 2026-11-03; BACKPORT.md's universal set). The hyperjungle's far trees are octahedral impostors (core/biome 34: its 55 makes
    them when the fragment is on the page); this kit's own trees all stand within the hero radius (the basin is ~1.3 km across), so none of its own goes far.
    The impostors' light matched to the near crowns (the bake is ~4x dark until the core fix owed in HANDOFF-REBUILD.md): the hyperjungle's own gain;
    ?impgain= ?impwrap=; ?diet=0 the old far blobs */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
 /* the terrain's horizon on the flora (85-host-far.js: KHORIZON); not the far field, not the ground (85 did it) */
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 /* the sun's shadows: 89zz-host-shadow.js, after the sea's weather has hooked the ground (it counts the ground's texture units) */
 window._buildMs=Math.round(performance.now()-t0);
})();
