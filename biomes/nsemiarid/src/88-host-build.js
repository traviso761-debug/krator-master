// ================================================================= HOST — build
// The order a world follows: its own structures first (none on this stage), then the kit, then one bake. The trees are
// records drawn as VARIANTS (86-host-variants: grown once per species and level, instanced, the level by the camera);
// ?unique=1 builds every tree unique instead.
window._biome=null;
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it (for budgeting)
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1,unique=Q.has('unique')||typeof VARIANTS==='undefined';
 window._variants=!unique;
 NSEMIARID.setWind(WIND);
 NSEMIARID.liveGusts=true;   // the furlers are placed open and shut by core/atmos's gusts (89b-host-atmos.js)
 NSEMIARID.frillLook=Q.get('frill')==='white'?'white':'tint';   // the frill's fins: tinted while green, white ripe (default), or ?frill=white
 try{
  if(unique)window._biome=NSEMIARID.build({R:TERR.R-150,quality:q});
  else{const out={R:TERR.R-150,quality:q};BIO.cur='nsemiarid/trees';Object.assign(out,NSEMIARID.buildTrees(out.R,q,{records:true}));
   BIO.cur='nsemiarid/floor';Object.assign(out,NSEMIARID.buildFloor(out.R,q));BIO.cur=null;window._biome=out;}}
 catch(e){reportErr('biome: '+e.stack);}
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;
 // after the bake (the kit's stores are empty again): grow the variants and draw the records as instances of them
 if(!unique){try{VARIANTS.init();window._instances+=VARIANTS.stats.drawn;}catch(e){reportErr('variants: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:STAGE_GROUND.region,x:0,z:0,r:TERR.R,h:1400});
})();
