// ================================================================= HOST — build
// The order a world follows: the sedesert kit first (read in place) at the oases only, under its own mask and with its
// zone fields set by the stage (SED.fields: dune 1 keeps its scrub, cacti and Socotran succulents off the Catch; oasis
// where the springs are), its tree passes cut to the wadi palm and the mesquite (the eastern desert's species that fit a
// salty spring: PLAN.md section 5); its trees become obstacles; then the Catch's own kit; then one bake.
window._biome=null;window._desert=null;window._held=null;
// THE MESQUITE'S FEATHERS HELD TO ITS WOOD (the final rebuild, pair 11, 2026-11-09; the coordinator's GPU verify of 2026-11-08: catch-oasis failed
// the attach audit, biome:feather 120 of 949 cards floating, 1.15% overall against 1.00%). The sedesert kit (read in place, not this turn's to
// edit) scatters each mesquite's feathery clumps in a disc round points on its stems, up to ~.4 of a stem's length out and over half a clump up,
// so some hang in the air beside the wood (its own page has the same: HANDOFF-REBUILD.md, "sedesert's mesquite (wired, not read: its crowns
// float off their limbs)"). While it builds, this page logs the spans its BIO.tube and BIO.beam draw (core/biome's structure log, BIO.segs: a
// tree's stems come before its clumps, so the log is begun again at the first limb after a put) and brings each feather that is further than
// half its size from the nearest span toward it (BIO.snapSeg, BIO.holdTo): on its own line, no new draw, no draw from the stream, so nothing
// else moves. ?hold=0 leaves them where the kit puts them. The fix belongs in sedesert's 55 (BIO.tree round each mesquite, BIO.holdTo on its clumps)
function holdFeathers(on){const out={on:!!on,feathers:0,moved:0};if(!on||typeof BIO.snapSeg!=='function'||typeof BIO.holdTo!=='function')return {done:()=>out};
 const put0=BIO.put,tube0=BIO.tube,beam0=BIO.beam,segs0=BIO.segs,log=[];let fresh=true,inLimb=0;
 const limb=f=>function(){if(!inLimb&&fresh){log.length=0;fresh=false;}inLimb++;try{return f.apply(this,arguments);}finally{inLimb--;}};
 BIO.segs=log;BIO.tube=limb(tube0);BIO.beam=limb(beam0);
 BIO.put=function(name,p,q,s){if(!inLimb){fresh=true;
   if(name==='feather'&&log.length&&p){const sz=Array.isArray(s)?Math.max(s[0],s[1],s[2]):+s,r=BIO.snapSeg(log,p);out.feathers++;
    if(r&&r.d>sz*.5){const a=arguments,h=BIO.holdTo(r.p,p,sz*.5);a[1]=h;out.moved++;return put0.apply(this,a);}}}
  return put0.apply(this,arguments);};
 return {done:()=>{BIO.put=put0;BIO.tube=tube0;BIO.beam=beam0;BIO.segs=segs0;return out;}};}
(function(){const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 BIO.host.catch={nebkhas:STAGE.nebkhas||[],bias:STAGE.bias||{}};
 if(STAGE.sedQ>0&&typeof SEDESERT!=='undefined'){
  SEDESERT.PASSES=SEDESERT.PASSES.filter(P=>P.sp===6||P.sp===7);
  SED.on=true;SED.fields=STAGE.sedFields||{};const wm=MASK,sm=STAGE.sedMask||(()=>1);MASK=(x,z)=>wm(x,z)*sm(x,z);
  const H=holdFeathers(Q.get('hold')!=='0');
  try{window._desert=SEDESERT.build({R:TERR.R-100,quality:q*STAGE.sedQ,fauna:false});}catch(e){reportErr('sedesert: '+e.stack);}
  finally{MASK=wm;SED.on=false;window._held=H.done();}
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
