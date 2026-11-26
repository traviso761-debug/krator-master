// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES), the kit's fire history (84 made it with
// this showcase's recent fires), then the kit, then one bake.
// THE FINAL REBUILD (pair 12, 2026-11-09; PLAN-STATIONS.md, "Core adoption"), each look change with its switch:
//   the field contract (core/biome 41, BIO.env): the kit's own fields mapped to BIO.ENV's names and units, for the export and readers
//   the far living trees on octahedral impostors (core/biome 34, 55's lines; ?diet=0 keeps the blobs), lit by BIO.impostorLook (IMP_GAIN)
//   KHORIZON on what stands (87 baked it; ?hz=0)
//   KSHADOW off by default (the owner, 2026-11-03): ?shadow=1 attaches the sun's shadows
const ENV=BIO.env?BIO.env({ground:terrainH,wet:(x,z)=>FIELD.wet(x,z),rock:(x,z)=>FIELD.rock(x,z),bands:{upland:[130,430],flow:30}}):null;
window._biome=null;
const IMP_GAIN=2.4;   /* the impostors' gain (swlowlands, ebadlands and nsemiarid 2.4): the bake is ~4x dark; to be set against the near crowns on the GPU */
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')==='1'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it (for budgeting)
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 if(Q.get('diet')==='0')CRATERDRY.IMPOSTORS=false;   /* ?diet=0: every far tree keeps its blob (55) */
 try{window._biome=typeof STATION!=='undefined'&&STATION.build?STATION.build(q):CRATERDRY.build({R:TERR.R-150,quality:q});}   /* a station orders its kits itself (stations/<name>/) */catch(e){reportErr('biome: '+e.stack);}
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 /* the flora and the ground cast and receive; the far field, the water and the impostors draw their own light. ?shadow=1 (above) */
 if(SHADOW_ON){try{window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
  window._shadow.cast(scene);window._shadow.cast(GROUND,{cast:false});if(typeof FAR!=='undefined'&&FAR)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;}catch(e){reportErr('shadow: '+e.stack);}}
 window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The crater drylands (ideal type)',x:0,z:0,r:TERR.R,h:600});
})();
