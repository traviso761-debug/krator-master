// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and
// hand their shells to dress()), then the biome, then one bake.
window._biome=null;
const IMP_GAIN=3.6;   /* nhighlands' measure; this page's own is set at its look pass (KNOWN_ISSUES.md) */
(function(){
 const t0=performance.now();
 let shells=[];
 if(typeof buildTestTower==='function'){try{shells=buildTestTower()||[];}catch(e){reportErr('tower: '+e.stack);}}
 /* THE FAR BAND'S DIET (GRAPHIC-LOAD.md recommendations 1 and 2, 2026-10-27; ?diet=0 for the spine's static LOD alone, the page
    before): heroes drawn within 900 m of the camera and octahedral impostors past that (and for every far tree), the floor's near
    band to 650 m, its mid band and the near reed beds to 1300 m, its sparse far band to 1100 m (the ground paint carries the rest) */
 if(new URLSearchParams(location.search).get('diet')!=='0')Object.assign(EASTABYSS.LOD,{tree:900,floor:650,mid:1300,far:1100});else EASTABYSS.IMPOSTORS=false;
 try{window._biome=EASTABYSS.build({R:TERR.R-150,quality:+(new URLSearchParams(location.search).get('q')||1)});}catch(e){reportErr('biome: '+e.stack);}
 if(shells.length){try{EASTABYSS.dress(shells,{ledges:{moss:2200,plants:900,edges:520,hang:14},soffits:{n:1800,mossR:4,hang:14},walls:{n:520}});}catch(e){reportErr('dress: '+e.stack);}}
 const b=BIO.bake();
 /* the impostors' light matched to the near crowns (the bake is ~4x dark until the core fix owed in HANDOFF-REBUILD.md); ?impgain= ?impwrap= */
 if(BIO.impostorLook){const q=new URLSearchParams(location.search);BIO.impostorLook({gain:+(q.get('impgain')||IMP_GAIN),wrap:+(q.get('impwrap')||1)});}
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
 /* the terrain's horizon on the flora and the tower (83-host-far.js: KHORIZON, the wall's shadow at a low eastern sun); not the far field */
 if(GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField});}catch(e){reportErr('horizon: '+e.stack);}}
 /* R5: the floor cover's root colour from the ground's paint (its v runs z1..z0 over the painted square) */
 if(MAT_GROUND&&MAT_GROUND.map){const S=TERR.R*1.1;BIO.setGround(MAT_GROUND.map,[-S,S,S,-S]);}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The eastern abyss (ideal type)',x:0,z:0,r:TERR.R,h:420});
})();
