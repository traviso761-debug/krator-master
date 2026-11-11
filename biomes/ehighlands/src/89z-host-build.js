// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES), then the kit, then one bake. The host
// names this year's flowering stand of vigil spikes (on the dry slope, where the cameras can reach it) before the build.
// 89z, after the water (it was 88; the final rebuild, pair 13, 2026-11-09): the water's fields read its own surfaces, so they must exist first.
// Both of the kit's passes reseed (550041, 600041), so nothing placed moves for the new order.
// THE WATER AS FIELDS (core/water ext/60; core/biome 41): one shore for the audit and the field contract, the distance to the water the eye sees
// (WATER.fieldAt). The kit keeps its own masks (waterH, the fields of 45), so nothing placed moves. ?fields=0 none
const WATER_F=new URLSearchParams(location.search).get('fields')!=='0'&&WATER.fields&&WATER.surfaces.length?
 WATER.fields({box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],cell:8,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall')}):null;
const WATER_FN=WATER_F?WATER.fieldFns(WATER_F):null;
/* the field contract (core/biome/README.md, "The environmental fields"): the plateau's fields mapped to BIO.ENV's names and units */
const ENV=BIO.env?BIO.env({ground:terrainH,water:WATER_FN||undefined,wet:(x,z)=>FIELD.wet(x,z),rock:(x,z)=>FIELD.rock(x,z)}):null;
/* the ground's wet band at the water's edge, as the edge audit reads it (99): the bog and the stream's banks are wet by the fields */
const WET_SHORE=(x,z)=>WATER_FN?smooth(24,1,WATER_FN.shore(x,z)):FIELD.wet(x,z);
const IMP_GAIN=2.6;   /* the impostors' gain (oidong and korona 2.6, ebadlands 2.4): the bake is ~4x dark */
/* THE SUN'S SHADOWS (core/shadow, KSHADOW; the owner, 2026-11-03): toggleable and OFF by default; ?shadow=1 turns them on (their cost is the
   owner's call: the Throne's station 1 +30-38% a frame on the Arc) */
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')==='1'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;
window._biome=null;
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it (for budgeting); ?diet=0 keeps the far blobs (no impostors)
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 if(Q.get('diet')==='0')EHIGH.IMPOSTORS=false;
 EHIGH.setGiant(GIANT_AZ);
 EHIGH.SHORE=WATER_FN&&WATER_FN.shore?WATER_FN.shore:null;   /* the trees keep off the water's drawn shore (55's pass; the edge audit in 99) */
 if(FLOWERING)EHIGH.FLOWERING.push(FLOWERING);
 try{window._biome=EHIGH.build({R:TERR.R-150,quality:q});}catch(e){reportErr('biome: '+e.stack);}
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 BIO.setA2C(renderer);   /* R7: the cut-outs by alpha-to-coverage */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND&&m!==MAT_ICE});}catch(e){reportErr('horizon: '+e.stack);}}
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});window._shadow.cast(scene);
  if(typeof FAR!=='undefined'&&FAR)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;}catch(e){reportErr('shadow: '+e.stack);}}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:STAGE.name+' (ideal type)',x:0,z:0,r:TERR.R,h:STAGE.regH==null?900:STAGE.regH});
})();
