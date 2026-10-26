// ================================================================= HOST — build
// The order a world follows: the sedesert kit first (read in place) at the oases only, under its own mask and with its
// zone fields set by the stage (SED.fields: dune 1 keeps its scrub, cacti and Socotran succulents off the Catch; oasis
// where the springs are), its tree passes cut to the wadi palm and the mesquite (the eastern desert's species that fit a
// salty spring: PLAN.md section 5); its trees become obstacles; then the Catch's own kit; then one bake.
window._biome=null;window._desert=null;
(function(){const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 BIO.host.catch={nebkhas:STAGE.nebkhas||[],bias:STAGE.bias||{}};
 if(STAGE.sedQ>0&&typeof SEDESERT!=='undefined'){
  SEDESERT.PASSES=SEDESERT.PASSES.filter(P=>P.sp===6||P.sp===7);
  SED.on=true;SED.fields=STAGE.sedFields||{};const wm=MASK;MASK=(x,z)=>wm(x,z)*STAGE.sedMask(x,z);
  try{window._desert=SEDESERT.build({R:TERR.R-100,quality:q*STAGE.sedQ,fauna:false});}catch(e){reportErr('sedesert: '+e.stack);}
  finally{MASK=wm;SED.on=false;}
  (SEDESERT.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.6+1,y0:T.y0-3,y1:T.y0+T.H}));}
 _mark('desert');
 try{window._biome=CATCH.build({R:TERR.R-100,quality:q});}catch(e){reportErr('catch: '+e.stack);}
 _mark('catch');
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 (STAGE.registers||[]).forEach(r=>REGISTER(r));
 // the probe's points for what is drawn only in merged buckets (a dead poplar has no leaf instance): one a tree, at its bole
 {const P=[];CATCH.TREES.forEach(T=>{if(T.lv>=1)P.push(T.x,T.y0+1.5,T.z);});const m=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({visible:false}));
  m.userData.probePoints=P;m.userData.probeSkip=false;m.frustumCulled=false;m.name='catch:tree-anchors';scene.add(m);}
 REGISTER({name:STAGE.name+' (a piece of it)',x:0,z:0,y:(STAGE.siteH||0)-200,r:TERR.R,h:1400});
})();
