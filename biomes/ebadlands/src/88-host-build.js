// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and hand their shells to dress()), then
// the kit, then the dressing on the structures, then one bake. The trees are records drawn as VARIANTS (86-host-variants:
// grown once per species and level, instanced, the level by the camera); ?unique=1 builds every tree unique instead.
window._biome=null;window._dress=null;
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it (for budgeting)
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1,unique=Q.has('unique')||typeof VARIANTS==='undefined';
 window._variants=!unique;
 let shells=[];
 if(typeof buildArcade==='function'){try{shells=buildArcade()||[];}catch(e){reportErr('arcade: '+e.stack);}}
 try{
  if(unique)window._biome=EBADLANDS.build({R:TERR.R-150,quality:q});
  else{const out={R:TERR.R-150,quality:q};BIO.cur='badlands/trees';Object.assign(out,EBADLANDS.buildTrees(out.R,q,{records:true}));
   BIO.cur='badlands/floor';Object.assign(out,EBADLANDS.buildFloor(out.R,q));BIO.cur=null;window._biome=out;}}
 catch(e){reportErr('biome: '+e.stack);}
 if(shells.length){try{window._dress=EBADLANDS.dress(shells,{ledges:{n:360,plants:180,edges:150,hang:5.5},soffits:{n:220,hang:4.5},walls:{n:260,hang:3}});}catch(e){reportErr('dress: '+e.stack);}}
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;
 // after the bake (the kit's stores are empty again): grow the variants and draw the records as instances of them
 if(!unique){try{VARIANTS.init();window._instances+=VARIANTS.stats.drawn;}catch(e){reportErr('variants: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The eastern badlands (ideal type)',x:0,z:0,r:TERR.R,h:2200});
})();
