// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES and
// hand their shells to dress()), then the biome, then one bake.
// 89z, after the water (it was 88; the final rebuild, swlowlands' lines): the flora reads the water's own numbers, so the surfaces exist before the first plant.
// THE WATER AS FIELDS (core/water ext/60; core/biome 41; the checklist's line "wet ground and flora read WATER.fieldAt", core/biome/README.md's field
// contract): one shore for the flora, the ground's wet band and the audit. FIELD.wet and FIELD.flow keep the kit's meaning, but their water term is now
// the distance to the water the eye sees (WATER.fieldAt: the lake's shore grid, the river's ribbon), not to the map's shore cells or RIV's line; the wet
// band on the ground (aGM.y, 46) reads the same shore. The fountain and the cascades are not a shore. ?fields=0 for the old lines
const WATER_F=WATER.fields({box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],cell:6,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall'&&q.kind!=='geyser'&&!q.seasonal)});
const WATER_FN=WATER.fieldFns(WATER_F);
/* the wet band's share of the water: 1 at the edge, gone by 40 m */
const WET_SHORE=(x,z)=>smooth(40,1,WATER_FN.shore(x,z));
/* THE FIELD CONTRACT (core/biome/README.md, "The environmental fields"): the kit's five fields mapped onto BIO.ENV's names, units and sources; the
   upland band is the land's (the Vale's 0..1000 m, a station's its own) */
const ENV=BIO.env({ground:terrainH,water:WATER_FN,wet:(x,z)=>FIELD.wet(x,z),bands:Object.assign({flow:60},LAND.bands||{upland:[0,1000]})});
if(XQ_ON('fields')){const W0=FIELD.wet,F0=FIELD.flow;
 FIELD.wet=(x,z)=>{const s=WATER_FN.shore(x,z);return clamp(Math.max(W0(x,z)*smooth(-1,3,s)+(1-smooth(-1,3,s)),.96*smooth(60,8,s)),0,1);};
 FIELD.flow=(x,z)=>{const d=WATER_FN.flow(x,z);return d==null||d!==d?F0(x,z):clamp(smooth(95,8,d),0,1);};}
{const m=window._groundMesh,a=m.geometry.attributes.aGM,p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)a.setY(i,WET_SHORE(p.getX(i),p.getZ(i))*smooth(-2,.5,p.getY(i)-(LAND.waterY||0)));a.needsUpdate=true;}
window._biome=null;
const IMP_GAIN=3.0;   /* the impostors' gain (eastabyss 3.6, swlowlands 2.4, sedesert 2.6): set against the near crowns on 'Over the vale' at this turn */
(function(){
 const t0=performance.now();
 let shells=[];
 if(LAND.dome!==false&&typeof buildTestDome==='function'){try{shells=buildTestDome()||[];}catch(e){reportErr('dome: '+e.stack);}}
 if(typeof XANADU!=='undefined'){
  const qp=+(XQ.get('q')||1);   // ?q=.4 for a quick look
  /* THE FAR BAND'S DIET (GRAPHIC-LOAD.md recommendations 1 and 2; ?diet=0 for the kit's old LOD and blobs): heroes to 900 m with octahedral impostors past that (55),
     the floor's bands to 600 m (unchanged) and 2400 m */
  if(XQ_ON('diet'))Object.assign(XANADU.LOD,{tree:900,farFloor:2400});else XANADU.IMPOSTORS=false;
  try{window._biome=XANADU.build({R:LAND.R==null?TERR.R+300:LAND.R,quality:qp});}catch(e){reportErr('biome: '+e.stack);}
  if(typeof stationBuild==='function'){try{window._station=stationBuild();}catch(e){reportErr('station: '+e.stack);}}   /* a station's own passes (its 87) */
  if(typeof ledgePass==='function'){try{window._ledges=ledgePass();}catch(e){reportErr('ledges: '+e.stack);}}   /* the strata's ledges and talus (87-host-ledges.js) */
  if(shells.length){try{XANADU.dress(shells,{ledges:{moss:1400,plants:700,edges:360,hang:12},soffits:{n:900,mossR:3,hang:10},walls:{n:420}});}catch(e){reportErr('dress: '+e.stack);}}}
 const b=BIO.bake();
 BIO.setA2C(renderer);BIO.setGround(TEX_GROUND,[TERR.X0,TERR.Z1,TERR.X1,TERR.Z0]);   /* R5: the floor's cover takes the ground's colour at its root; the paint's v runs z1..z0 */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(XQ.get('impgain')||IMP_GAIN),wrap:+(XQ.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 {let lo=1e9,hi=-1e9;for(let i=0;i<=32;i++)for(let j=0;j<=32;j++){const h=terrainH(-TERR.R+i*TERR.R/16,-TERR.R+j*TERR.R/16);if(h<lo)lo=h;if(h>hi)hi=h;}   /* the volume spans the ground it covers: a station's floor stands kilometres above 0 */
  REGISTER({name:LAND.label+(LAND.station?'':' (ideal type)'),x:0,z:0,r:TERR.R,y:Math.min(lo,0)-20,h:hi-Math.min(lo,0)+1100});}
})();
// THE SUN'S SHADOWS (core/shadow, KSHADOW; the owner 2026-11-03: "the valley does need shadows", pair 6 takes it): one box that follows the view, 90 to
// 600 m by the eye's height. What casts: the ground receives; the trees' bark, the stand-ins and every lit opaque mesh of the flora cast and receive
// (cast() leaves out the transparent, unlit and shader materials: the cards with alpha cut-outs cast through the depth pass by their map). The cost is
// measured in KNOWN_ISSUES.md (perf_views, Arc 140T). OFF BY DEFAULT (the owner, 2026-11-03: toggleable, off, in every build): the panel's 'shadows'
// button or ?shadow=1 turns them on, and while off they cost nothing. ?shadow=0 not even the switch, ?shadowmap=2048 a smaller map
const SHADOW=(typeof KSHADOW!=='undefined'&&XQ_ON('shadow'))?(function(){const H=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH,size:+(XQ.get('shadowmap')||4096)});
 window._groundMesh.receiveShadow=true;scene.children.forEach(o=>{if(o!==window._groundMesh&&!(o.userData&&(o.userData.farField||o.userData.host)))H.cast(o);});
 scene.traverse(o=>{if(o.isMesh&&o.renderOrder>=1&&o.renderOrder<=3)o.castShadow=false;});   /* the water (renderOrder 1-3) receives, it casts nothing */
 window._shadow=H.state;return H;})():null;
