// ================================================================= HOST — the universal set, after the bake, the water and the weather (the final rebuild, pair 11, 2026-11-09)
// BACKPORT.md section 1 in the order the modules' "Adopting it" lines give; ringisles' 89zz (a kit that reads others in place) with this page's
// names, on every station (each takes src/'s fragments). Each reads what the page has and does nothing where there is nothing to do:
//   the foliage              BIO.bindAtmosWind (R8: the cards sway in core/atmos's wind and its gust fronts); BIO.setA2C (R7: alpha to coverage)
//   the far trees            BIO.impostorLook and BIO.bakeImpostors: the far living poplars' octahedral impostors (55; ?diet=0 the blobs)
//   the air                  height fog (core/atmos R1) on the station's STAGE.fogH {y0, H}: the reference height y0, the falloff 1/H (the page's own
//                            ShaderChunk fog until now, which read cameraPosition: r128 never uploads it to Lambert); the rain's occlusion map (R10)
//   the sun's shadows        KSHADOW, OFF by default (the owner, 2026-11-03: toggleable; ?shadow=1 turns it on), and only where the ground keeps a
//                            texture unit for its map
//   the horizon              KHORIZON over the station's square: the walls' and the dunes' shadow at a low sun, on the ground where it keeps two
//                            texture units, and on the flora
//   the water as fields      core/water ext/60 (WATER.fields, the shore and depth the eye sees) and core/biome 41's field contract (BIO.env) for
//                            the export and the audits; nothing placed reads them, so nothing moves
// ?hfog=0 the plain fog; ?shadow=1 shadows; ?hz=0 no horizon; ?fields=0 no water fields; ?impgain= ?impwrap= the impostors' light.
const CORE_Q=new URLSearchParams(location.search);
const IMP_GAIN=2.4;   /* the impostors' gain (ebadlands 2.4, oidong and korona 2.6): the bake is ~4x dark; for the GPU verify to set against the near poplars */
(function(){
 if(typeof BIO.bindAtmosWind==='function'){try{BIO.bindAtmosWind();}catch(e){reportErr('wind: '+e.stack);}}
 BIO.setA2C(renderer);
 if(CORE_Q.has('nobake'))return;
 if(BIO.impostorLook)BIO.impostorLook({gain:+(CORE_Q.get('impgain')||IMP_GAIN),wrap:(CORE_Q.has('impwrap')?+CORE_Q.get('impwrap'):1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
})();
window._hfog=null;
if(typeof ATMOS!=='undefined'&&ATMOS.heightFog&&!ATMOS.fog&&CORE_Q.get('hfog')!=='0'){const H=STAGE.fogH||{};
 try{ATMOS.heightFog({ref:H.y0==null?(STAGE.siteH||0):H.y0,falloff:1/(H.H==null?80:H.H),sun:.3,sky:.25});ATMOS.heightFogScene(scene);window._hfog='on';}
 catch(e){reportErr('height fog: '+e.stack);}}
const GROUND_MATS_ALL=[MAT_GROUND];
// a material's texture units, counted from a dry run of its onBeforeCompile on its ShaderLib (the Throne's samplersOf), +1 for the sun's shadow map once on
const LIBOF={MeshLambertMaterial:'lambert',MeshStandardMaterial:'standard',MeshPhysicalMaterial:'physical',MeshPhongMaterial:'phong',MeshBasicMaterial:'basic',MeshToonMaterial:'toon'};
let SHADOW_ON=false;
const samplersOf=m=>{try{const L=THREE.ShaderLib[LIBOF[m.type]],sh=L?{uniforms:{},vertexShader:L.vertexShader,fragmentShader:L.fragmentShader}:{uniforms:{},vertexShader:m.vertexShader||'',fragmentShader:m.fragmentShader||''};
  const f0=typeof KHOOK!=='undefined'?KHOOK.failures.length:0;
  try{if(m.onBeforeCompile)m.onBeforeCompile(sh,renderer);}finally{if(typeof KHOOK!=='undefined')KHOOK.failures.length=f0;}let n=(m.map?1:0)+(m.emissiveMap?1:0)+(m.alphaMap?1:0)+(m.lightMap?1:0)+(m.aoMap?1:0);
  sh.fragmentShader.replace(/uniform\s+sampler(?:2D|Cube)\s+([^;]+);/g,(a,b)=>{n+=b.split(',').length;return a;});return n+(SHADOW_ON&&!(m.isShaderMaterial)?1:0);}catch(e){return 99;}};
const MAXT=renderer.capabilities.maxTextures==null?16:renderer.capabilities.maxTextures;
window._units={ground:samplersOf(MAT_GROUND),max:MAXT};
// THE SUN'S SHADOWS (core/shadow, KSHADOW): one box that follows the view, every placed mesh casting and receiving, not the far apron (45c). Off unless
// ?shadow=1 (their cost is the owner's call: the Throne's station 1 +30-38% a frame on the Arc). r128 declares the shadow map's sampler in every lit
// material once the renderer's shadow map is on, so the ground must keep a unit for it; decided before the rain cover and the horizon
window._shadow=null;
const SHADOW=(function(){if(typeof KSHADOW==='undefined'||!sun||!sun.isDirectionalLight||CORE_Q.get('shadow')!=='1'||CORE_Q.has('nobake')){window._shadow='off';return null;}
 const worst=Math.max(0,...GROUND_MATS_ALL.map(samplersOf));
 if(worst+1>MAXT){window._shadow='skipped: the ground reads '+worst+' of '+MAXT+' texture units';return null;}
 try{const S=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});GROUND_MATS_ALL.forEach(m=>{m.userData.twShadow=true;});
  scene.traverse(o=>{if(o.isMesh&&GROUND_MATS_ALL.indexOf(o.material)>=0)o.receiveShadow=true;});
  const wet=new Set(Object.values(typeof WATER_DRAW!=='undefined'?WATER_DRAW:{}).map(d=>d.mesh));
  scene.children.forEach(c=>{if(c!==APRON&&!(c.userData&&c.userData.farField)&&!(c.isMesh&&GROUND_MATS_ALL.indexOf(c.material)>=0)&&!wet.has(c))S.cast(c);});
  SHADOW_ON=true;window._shadow={grounds:GROUND_MATS_ALL.length,worst:worst+1};return S;}catch(e){reportErr('shadow: '+e.stack);return null;}})();
// the rain's occlusion map (no rain under the crowns) adds a unit to every lit material: a ground at the limit keeps the rain everywhere, as before
window._rainCover=null;
if(typeof ATMOS!=='undefined'&&ATMOS.rainCover&&!ATMOS.raincover){const full=GROUND_MATS_ALL.filter(m=>samplersOf(m)+1>MAXT);
 if(full.length)window._rainCover='skipped: the ground reads '+Math.max(...full.map(samplersOf))+' of '+MAXT+' texture units';
 else{try{ATMOS.rainCover({renderer});window._rainCover='on';}catch(e){reportErr('rain cover: '+e.stack);}}}
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the ground's square (256 a side); the ground where it keeps two units, then the flora
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||CORE_Q.get('hz')==='0'||CORE_Q.has('nobake'))return null;
 try{const t0=performance.now(),R=TERR.R*1.1,H=KHORIZON.bake({box:[-R,-R,R,R],n:256,h:terrainH}),skip=[];
  window._horizon={ms:Math.round(performance.now()-t0),n:H.n};GROUND_MATS_ALL.forEach(m=>{if(samplersOf(m)+2<=MAXT)KHORIZON.shade(m,H);else skip.push(m.name||'the ground');});
  window._horizon.mats=KHORIZON.shadeScene(scene,H,{filter:o=>o!==APRON&&!o.userData.farField&&(Array.isArray(o.material)?o.material:[o.material]).every(m=>m&&GROUND_MATS_ALL.indexOf(m)<0&&samplersOf(m)+2<=MAXT)});
  window._horizon.skipped=skip;return H;}
 catch(e){reportErr('horizon: '+e.stack);return null;}})();
// THE WATER AS FIELDS (core/water ext/60; core/biome 41): one shore for the audit and the field contract, the distance to the water the eye sees
// (WATER.fieldAt), not to a pool's radius; the kits keep their own masks (waterMask: the drawn level), so nothing placed moves. The sand sea has no water
const WATER_F=CORE_Q.get('fields')!=='0'&&WATER.fields&&WATER.surfaces&&WATER.surfaces.length?
 (()=>{try{const R=TERR.R*1.1;return WATER.fields({box:[-R,-R,R,R],cell:12,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall')});}catch(e){reportErr('water fields: '+e.stack);return null;}})():null;
const WATER_FN=WATER_F?WATER.fieldFns(WATER_F):null;
/* the field contract (core/biome/README.md, "The environmental fields"): the Catch's fields mapped to BIO.ENV's names and units */
const ENV=BIO.env?BIO.env({ground:terrainH,water:WATER_FN||undefined,wet:(x,z)=>FIELD.wet(x,z),rock:(x,z)=>FIELD.rock(x,z)}):null;
