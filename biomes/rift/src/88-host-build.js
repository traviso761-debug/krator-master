// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and
// hand their shells to dress()), then the biome, then one bake.
window._biome=null;
const RIFT_IMPGAIN=3.6;   /* nhighlands' gain to start; measured for this page in PERF.md */
(function(){
 const t0=performance.now();
 let shells=[];
 if(typeof buildTestTower==='function'){try{shells=buildTestTower()||[];}catch(e){reportErr('tower: '+e.stack);}}
 /* THE FAR BAND'S DIET (GRAPHIC-LOAD.md recommendation 2; nhighlands' settings; ?diet=0 for the old ranges and the blob impostors): heroes
    to 800 m (they were drawn to 1.2 km), octahedral impostors beyond, the far floor band to 1.6 km (it ran to 3 km; the ground paint carries
    the rest) */
 const Q=new URLSearchParams(location.search);
 if(Q.get('diet')!=='0'){RIFT.LOD.tree=800;RIFT.LOD.farFloor=1600;}else RIFT.IMPOSTORS=false;
 if(STATION_PAGE.thin)RIFT.thin=STATION_PAGE.thin;if(STATION_PAGE.burnAt)RIFT.burnAt=STATION_PAGE.burnAt;if(STATION_PAGE.wholePage)RIFT.wholePage=true;   /* burnAt: a fire mosaic the floor reads; wholePage: the floor's bands over the whole page */
   /* a station's density by place and species (44s-host-station.js) */
 try{window._biome=RIFT.build({R:TERR.R-150,quality:1});}catch(e){reportErr('biome: '+e.stack);}
 if(STATION_PAGE.build){try{window._station=STATION_PAGE.build();}catch(e){reportErr('station: '+e.stack);}}   /* a station's own passes, before the bake */
 if(shells.length){try{RIFT.dress(shells,{ledges:{moss:2200,plants:900,edges:520,hang:14},soffits:{n:1800,mossR:4,hang:14},walls:{n:520}});}catch(e){reportErr('dress: '+e.stack);}}
 const b=BIO.bake();
 /* the impostors' light matched to the near crowns (measured: the bake renders under a flat ambient without the kit's hooks and comes out
    darker than the drawn crowns, HANDOFF-REBUILD.md "Owed in core"); ?impgain= ?impwrap= to tune. The bake waits for the library maps */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||RIFT_IMPGAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Rift (ideal type)',x:0,z:0,r:TERR.R,h:520});
})();
