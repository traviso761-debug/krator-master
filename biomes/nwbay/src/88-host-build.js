// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and
// hand their shells to dress()), then the biome, then one bake. The karst
// stacks are structures too: the host hands their faces to the dress pass,
// which is where the curtain figs and the hanging gardens come from.
window._biome=null;
(function(){
 const t0=performance.now();
 let shells=[];
 if(typeof buildTestTower==='function'){try{shells=buildTestTower()||[];}catch(e){reportErr('tower: '+e.stack);}}
 let jetty=[];if(typeof buildJetty==='function'){try{jetty=buildJetty()||[];}catch(e){reportErr('jetty: '+e.stack);}}
 try{window._biome=NWBAY.build({R:TERR.R-100,quality:1});}catch(e){reportErr('biome: '+e.stack);}
 if(shells.length){try{NWBAY.dress(shells,{ledges:{moss:2200,plants:900,edges:520,hang:14},soffits:{n:1800,mossR:4,hang:14},walls:{n:520}});}catch(e){reportErr('dress: '+e.stack);}}
 if(jetty.length){try{NWBAY.dress(jetty,{seed:7,ledges:{moss:260,plants:90,edges:60,hang:4,treeH:5,size:1.6,mossR:1.6},soffits:{n:80,mossR:1.4,hang:3},walls:{n:70,hang:3}});}catch(e){reportErr('dress jetty: '+e.stack);}}
 // the stacks: gardens on the ledges and the dome rim, curtain figs and root
 // curtains off the rim (long: the faces are 40-130 m), moss and ferns on the
 // faces, beards under the notch's overhang
 if(typeof STACK_GEOS!=='undefined'&&STACK_GEOS.length){try{NWBAY.dress(STACK_GEOS,{seed:3,karst:true,ledges:{moss:1200,plants:500,edges:560,hang:46,treeH:9,size:2.2,mossR:3},soffits:{n:260,mossR:2,hang:5},walls:{n:1400,hang:30}});}catch(e){reportErr('dress stacks: '+e.stack);}}
 // the sinkholes' walls (above any water): root curtains off the rim, ferns and moss down the faces
 if(typeof SINK_GEOS!=='undefined'&&SINK_GEOS.length){try{NWBAY.dress(SINK_GEOS,{seed:5,karst:true,ledges:{moss:300,plants:160,edges:200,hang:24,treeH:7,size:2,mossR:2.4},soffits:{n:120,mossR:2,hang:4},walls:{n:900,hang:24}});}catch(e){reportErr('dress sinkholes: '+e.stack);}}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The north-west bay (ideal type)',x:CENTER[0],z:CENTER[1],r:TERR.R,h:420});
})();
