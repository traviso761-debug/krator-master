// ================================================================= HOST — build (Farside)
// Two kits on one page (biomes/WORLD.md): the works first (86: they fill OBSTACLES), then FARSIDE's own (the land kelp, the
// dead at the front, the strand, the floor; its stands become obstacles), then, where the station has a native forest, the
// NWLOWLANDS kit read in place under its own mask (off the invaded coast, the coral, the sand and the rock), its trees
// dressed by FARSIDE with the sea's outriders (wine weed, wrack, fog sponge); then one bake.
window._biome=null;window._native=null;window._nativeDress=null;
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 try{window._biome=FARSIDE.build({R:SR-40,quality:q});}catch(e){reportErr('farside: '+e.stack);}
 _mark('farside');
 // THE SHRUB LOBES (the owner, 2026-10-26: "shrub lobes need texture"): the native kit draws its shrubs' lobes on its plain,
 // untextured solid material (shared with its stems, cones and flower heads); on this page they take their own material with
 // the library's leaf mass (materials.json 'shrub', leaf.understorey: grey, tinted by each shrub's instance colour), set
 // before the bake. The kit's own fix is in biomes/nwlowlands/KNOWN_ISSUES.md.
 {const R=BIO.kits.nwlowlands,d=R&&R.defs&&R.defs.lobe,L=typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('farside','shrub'):null;
  if(d&&L){const t=KMAT.textures(L,{aniso:8});t.map.wrapS=t.map.wrapT=THREE.RepeatWrapping;t.map.repeat.set(3,1.5);
   d.mat=new THREE.MeshLambertMaterial({color:0xffffff,map:t.map,side:THREE.DoubleSide});d.mat.userData.bio={kind:'solid',lib:'leaf.understorey'};}}
 if(STAGE.natives&&typeof NWLOW!=='undefined'){
  try{MASK=nativeMask;window._native=NWLOW.build({R:SR-40,quality:q*(STAGE.natives.q==null?.6:STAGE.natives.q)});}catch(e){reportErr('nwlowlands: '+e.stack);}finally{MASK=waterMask;}
  (NWLOW.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.6+1,y0:T.y0-3,y1:T.y0+T.H}));
  try{window._nativeDress=FARSIDE.dress((NWLOW.TREES||[]).filter(T=>!T.cut&&T.lv>0).map(T=>({x:T.x,z:T.z,y0:T.y0,H:T.H,rb:T.rb,crownR:T.crownR})),{salt:'native',quality:q});}
  catch(e){reportErr('dress the natives: '+e.stack);}}
 _mark('native');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:STAGE.name+' (a piece of it)',x:0,z:0,r:SR,h:700});
})();
