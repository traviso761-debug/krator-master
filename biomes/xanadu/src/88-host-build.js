// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and
// hand their shells to dress()), then the biome, then one bake.
window._biome=null;
(function(){
 const t0=performance.now();
 let shells=[];
 if(typeof buildTestDome==='function'){try{shells=buildTestDome()||[];}catch(e){reportErr('dome: '+e.stack);}}
 if(typeof XANADU!=='undefined'){
  const qp=+(new URLSearchParams(location.search).get('q')||1);   // ?q=.4 for a quick look
  try{window._biome=XANADU.build({R:TERR.R+300,quality:qp});}catch(e){reportErr('biome: '+e.stack);}
  if(shells.length){try{XANADU.dress(shells,{ledges:{moss:1400,plants:700,edges:360,hang:12},soffits:{n:900,mossR:3,hang:10},walls:{n:420}});}catch(e){reportErr('dress: '+e.stack);}}}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Vale of Xanadu (ideal type)',x:0,z:0,r:TERR.R,h:1100});
})();
