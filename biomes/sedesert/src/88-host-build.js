// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and
// hand their shells to dress()), then the biome, then one bake.
window._biome=null;
const IMP_GAIN=2.6;   /* the impostors' gain (eastabyss 3.6, nwbay and swbay 2.2): the desert's crowns are sparse and pale; checked against the near crowns at this turn */
(function(){
 const t0=performance.now();
 let shells=[];
 if(typeof buildTestTower==='function'){try{shells=buildTestTower()||[];}catch(e){reportErr('tower: '+e.stack);}}
 /* THE FAR BAND'S DIET (GRAPHIC-LOAD.md recommendations 1 and 2; the final rebuild, 2026-10-27; ?diet=0 for the spine's static LOD alone, the
    page before): heroes drawn within 900 m of the camera and octahedral impostors past that (and for every far tree), the floor's near band to
    650 m, its mid band, the reeds and the fallen logs to 1300 m, its sparse far band to 1100 m (the ground paint carries the rest) */
 if(new URLSearchParams(location.search).get('diet')!=='0')Object.assign(SEDESERT.LOD,{tree:900,floor:650,mid:1300,far:1100});else SEDESERT.IMPOSTORS=false;
 try{window._biome=SEDESERT.build({R:TERR.R-150,quality:1});}catch(e){reportErr('biome: '+e.stack);}
 if(shells.length){try{SEDESERT.dress(shells,{ledges:{lichen:1400,plants:420,edges:180,hang:9},soffits:{n:400,lichenR:1.5,hang:7},walls:{n:420}});}catch(e){reportErr('dress: '+e.stack);}}
 try{window._kin=growKin();}catch(e){reportErr('kin: '+e.stack);}   /* the neighbours' species (87-host-kin.js, EXCHANGES.md) */
 const b=BIO.bake();
 /* the impostors' light matched to the near crowns (the bake comes out ~4x dark: HANDOFF-REBUILD.md, a core fix owed); ?impgain= ?impwrap= */
 if(BIO.impostorLook){const q=new URLSearchParams(location.search);BIO.impostorLook({gain:+(q.get('impgain')||IMP_GAIN),wrap:+(q.get('impwrap')||1)});}
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
 if(typeof GROUND_HZ!=='undefined'&&window._horizon)window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField});   /* the land's shadow on what stands on it (core/terrain 45, 2026-10-26) */
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The eastern high desert (ideal type)',x:0,z:0,r:TERR.R,h:1200});
})();
