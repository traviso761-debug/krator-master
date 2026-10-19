// ================================================================= HOST — build (Korona)
// Three kits on one page (biomes/WORLD.md): the NECANYONS kit first (read in place), on the rock, the walls' feet and
// the stream's banks: its canyon flora and its carnivores; then KORONA's own (the summit's life, the man-eaters, the
// hollow's floor); their trees become obstacles; then the HYPERJUNGLE plants the gorge floor (its mask: off the rock and
// the walls' feet, out of the stream, thin where the ground is poor); then one bake.
window._biome=null;window._jungle=null;window._korona=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=NECANYONS.build({R:STAGE.R-60,quality:q*(STAGE.necQ==null?1:STAGE.necQ)});}catch(e){reportErr('necanyons: '+e.stack);}
 _mark('necanyons');
 (NECANYONS.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.6+1,y0:T.y0-3,y1:T.y0+T.H}));
 if(typeof KORONA!=='undefined'&&KORONA.build){try{window._korona=KORONA.build({R:STAGE.R-60,quality:q});}catch(e){reportErr('korona: '+e.stack);}
  (KORONA.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.6+1,y0:T.y0-3,y1:T.y0+T.H}));}
 _mark('korona');
 if(!Q.has('nojungle')){try{MASK=jungleMask;window._jungle=HYPERJUNGLE.build({R:STAGE.R-60,quality:q*(STAGE.jungleQ==null?.7:STAGE.jungleQ),heroR:900,fauna:!Q.has('nofauna')});}catch(e){reportErr('hyperjungle: '+e.stack);}finally{MASK=waterMask;}}
 _mark('jungle');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:STAGE.name+' (a piece of it)',x:0,z:0,r:STAGE.R,h:600});
})();
