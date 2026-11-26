// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and
// hand their shells to dress()), then the biome, then one bake.
window._biome=null;
const IMP_GAIN=1.6;   /* measured here against the near boles and crowns (Canopy top, 2026-10-27; nhighlands' 3.6 bleached the pale boles white) */
(function(){
 const t0=performance.now();
 let shells=[];
 if(typeof buildTestTower==='function'){try{shells=buildTestTower()||[];}catch(e){reportErr('tower: '+e.stack);}}
 /* THE FAR BAND'S DIET (GRAPHIC-LOAD.md recommendations 1 and 2, 2026-10-27; ?diet=0 for the spine's static LOD alone, the page
    before): heroes drawn in full within 1200 m of the camera and octahedral impostors past that (and for every far tree past the
    hero disc), their bole dress (brackets, moss, epiphytes, lianas) with them; the young trees to 1800 m; the floor's near band
    to 800 m, its mid band and the fallen trees to 1800 m, its sparse far ring to 2600 m (the litter paint and the far canopy
    carry the rest) */
 const HB=typeof STATION_BUILD!=='undefined'?STATION_BUILD:{};   /* a station's own build options (its 45) */
 if(new URLSearchParams(location.search).get('diet')!=='0')Object.assign(HYPERJUNGLE.LOD,{tree:1200,sap:1800,floor:800,mid:1800,far:2600},HB.lod||{});else HYPERJUNGLE.IMPOSTORS=false;
 try{window._biome=HYPERJUNGLE.build(Object.assign({R:TERR.R-200,quality:+(new URLSearchParams(location.search).get('q')||1),heroR:2000},HB.build||{}));}catch(e){reportErr('biome: '+e.stack);}
 if(shells.length){try{HYPERJUNGLE.dress(shells,{ledges:{moss:2200,plants:900,edges:520,hang:14},soffits:{n:1800,mossR:4,hang:14},walls:{n:520}});}catch(e){reportErr('dress: '+e.stack);}}
 if(typeof stationBuild==='function'){try{window._station=stationBuild();}catch(e){reportErr('station: '+e.stack);}}   /* a station's own passes (its 87) */
 const b=BIO.bake();
 /* the impostors' light matched to the near crowns (the bake is ~4x dark until the core fix owed in HANDOFF-REBUILD.md); ?impgain= ?impwrap= */
 if(BIO.impostorLook){const q=new URLSearchParams(location.search);BIO.impostorLook({gain:+(q.get('impgain')||IMP_GAIN),wrap:+(q.get('impwrap')||1)});}
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
 /* the terrain's horizon on the flora and the tower (83-host-far.js: KHORIZON); not the far field */
 if(GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField});}catch(e){reportErr('horizon: '+e.stack);}}
 /* R5: the floor cover's root colour from the ground's paint (its v runs z1..z0 over the painted square) */
 if(MAT_GROUND&&MAT_GROUND.map){const S=TERR.R*1.1;BIO.setGround(MAT_GROUND.map,[-S,S,S,-S]);}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER(HB.region||{name:'The central hyperjungle (ideal type)',x:0,z:0,r:TERR.R,h:520});
})();
