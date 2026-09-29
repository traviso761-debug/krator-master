// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and
// hand their shells to dress()), then the biome, then one bake.
window._biome=null;
(function(){
 const t0=performance.now();
 let shells=[];
 if(typeof buildTestTower==='function'){try{shells=buildTestTower()||[];}catch(e){reportErr('tower: '+e.stack);}}
 let jetty=[];if(typeof buildJetty==='function'){try{jetty=buildJetty()||[];}catch(e){reportErr('jetty: '+e.stack);}}
 try{window._biome=SWBAY.build({R:TERR.R-100,quality:1});}catch(e){reportErr('biome: '+e.stack);}
 if(shells.length){try{SWBAY.dress(shells,{ledges:{moss:2200,plants:900,edges:520,hang:14},soffits:{n:1800,mossR:4,hang:14},walls:{n:520}});}catch(e){reportErr('dress: '+e.stack);}}
 if(jetty.length){try{SWBAY.dress(jetty,{seed:7,ledges:{moss:260,plants:90,edges:60,hang:4,treeH:5,size:1.6,mossR:1.6},soffits:{n:80,mossR:1.4,hang:3},walls:{n:70,hang:3}});}catch(e){reportErr('dress jetty: '+e.stack);}}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The southwest bay (ideal type)',x:CENTER[0],z:CENTER[1],r:TERR.R,h:420});
})();
