// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and
// hand their shells to dress()), then the biome, then one bake.
window._biome=null;
(function(){
 const t0=performance.now();
 let shells=[];
 if(typeof buildTestTower==='function'){try{shells=buildTestTower()||[];}catch(e){reportErr('tower: '+e.stack);}}
 try{window._biome=SEDESERT.build({R:TERR.R-150,quality:1});}catch(e){reportErr('biome: '+e.stack);}
 if(shells.length){try{SEDESERT.dress(shells,{ledges:{lichen:1400,plants:420,edges:180,hang:9},soffits:{n:400,lichenR:1.5,hang:7},walls:{n:420}});}catch(e){reportErr('dress: '+e.stack);}}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The eastern high desert (ideal type)',x:0,z:0,r:TERR.R,h:1200});
})();
