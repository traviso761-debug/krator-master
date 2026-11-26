// ================================================================= HOST — build (Farside)
// Two kits on one page (biomes/WORLD.md): the works first (86: they fill OBSTACLES), then FARSIDE's own (the land kelp, the
// dead at the front, the strand, the floor; its stands become obstacles), then, where the station has a native forest, the
// NWLOWLANDS kit read in place under its own mask (off the invaded coast, the coral, the sand and the rock), its trees
// dressed by FARSIDE with the sea's outriders (wine weed, wrack, fog sponge); then one bake.
window._biome=null;window._native=null;window._nativeDress=null;
const IMP_GAIN=1.6;   /* the impostors' light against the near crowns (the bake is ~4x dark until the core fix owed in HANDOFF-REBUILD.md): the hyperjungle's and geyser's gain */
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
 if(Q.get('diet')==='0'&&typeof NWLOW!=='undefined')NWLOW.IMPOSTORS=false;
 if(STAGE.natives&&typeof NWLOW!=='undefined'){
  try{MASK=nativeMask;window._native=NWLOW.build({R:SR-40,quality:q*(STAGE.natives.q==null?.6:STAGE.natives.q)});}catch(e){reportErr('nwlowlands: '+e.stack);}finally{MASK=waterMask;}
  (NWLOW.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.6+1,y0:T.y0-3,y1:T.y0+T.H}));
  try{window._nativeDress=FARSIDE.dress((NWLOW.TREES||[]).filter(T=>!T.cut&&T.lv>0).map(T=>({x:T.x,z:T.z,y0:T.y0,H:T.H,rb:T.rb,crownR:T.crownR})),{salt:'native',quality:q});}
  catch(e){reportErr('dress the natives: '+e.stack);}}
 _mark('native');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;
 /* THE FINAL REBUILD (pair 10, 2026-11-04; BACKPORT.md's universal set). The native forest's far trees are octahedral impostors (core/biome 34:
    nwlowlands' 55 makes them when the fragment is on the page; the front and the fog belt); this kit's own stands keep their stand-ins (a kelp
    stand is two streaky tufts past 1.1 km: cheaper than an impostor). ?impgain= ?impwrap=; ?diet=0 the old far blobs (nwlowlands' own switch) */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}
 /* the terrain's horizon on the flora (47: KHORIZON); not the far field, not the ground (47 did it) */
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==GROUND_MAT});}catch(e){reportErr('horizon: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:STAGE.name+' (a piece of it)',x:0,z:0,r:SR,h:700});
})();
// ================================================================= HOST — the sun's shadows (core/shadow, KSHADOW), OFF at page load
// The owner (2026-11-03): KSHADOW toggleable and off by default. Since 2026-11-08 the page takes core/shadow's own switch (the Throne's way):
// SHADOW_ATTACH() runs once the page is built (99) and attaches it off; core's panel button ('shadows') or ?shadow=1 at load turns it on, ?shadow=0
// none of it. While off no material compiles a shadow variant. The flora and the works cast and receive, the ground receives only; the water,
// the impostors and the far field draw their own light (KSHADOW skips shader materials).
const SHADOW_ATTACH=function(ui){if(typeof KSHADOW==='undefined'||!KSHADOW.attach||/[?&]shadow=0(&|$)/.test(location.search)){window._shadow='off';return null;}
 try{const H=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH,ui});H.cast(scene);
  GROUND.castShadow=false;GROUND.receiveShadow=true;if(FAR){FAR.castShadow=FAR.receiveShadow=false;}window._shadow=H;return H;}catch(e){reportErr('shadow: '+e.stack);return null;}};
