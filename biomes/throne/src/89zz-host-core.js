// ================================================================= HOST — the universal set, after the bake (2026-11-02, the final rebuild; every page)
// BACKPORT.md section 1, in the order the modules' "Adopting it" lines give, on every page of the Throne (src/: no station has its own). Each reads
// what its page has and does nothing where there is nothing to do (a tube with no sky weather, a page with no still):
//   the wind and the cards   BIO.bindAtmosWind (R8: the sway rides the shared atmosphere's gusts), BIO.setA2C (R7: alpha to coverage)
//   the far trees            BIO.impostorLook and BIO.bakeImpostors (the Throne's set, 55, and the hyperjungle's on the kipuka and the frontier)
//   the horizon              KHORIZON over the map (and the far field past it, 83f), on the ground's materials and then the flora
//   the air                  height fog (with each station's numbers, ATMOS_AIR from its 45, else the shoulder's), the rain's occlusion map
//   the reflections          WATER.mirrorSwitch on the page's largest still (MIRROR_STILL from its 89w), off at page load
//   the heat                 the glacier's snow bare on the warm ground (ATMOS.snowBare of KTHERM's snow mask), where the page lies snow
// ?hz=0 no horizon; ?fog=0 the plain fog; ?impgain= ?impwrap= the impostors' light.
const IMP_GAIN=2.2;   /* the impostors' gain (nwbay and swbay 2.2, the hyperjungle 1.6): set against the near crowns on 'From afar' at this turn */
(function(){
 if(BIO.bindAtmosWind)BIO.bindAtmosWind();BIO.setA2C(renderer);
 if(BIO.impostorLook)BIO.impostorLook({gain:+(CORE_Q.get('impgain')||IMP_GAIN),wrap:(CORE_Q.has('impwrap')?+CORE_Q.get('impwrap'):1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}   /* after every placement; waits for the library maps */
})();
const GROUND_MATS_ALL=[typeof MAT_GROUND!=='undefined'?MAT_GROUND:null,typeof MAT_TUBE!=='undefined'?MAT_TUBE:null,typeof GROUND!=='undefined'&&GROUND?GROUND.material:null,
 typeof GROUND_PATCH!=='undefined'&&GROUND_PATCH?GROUND_PATCH.material:null].concat(typeof GROUND_MATS!=='undefined'?GROUND_MATS:[]).filter((m,i,a)=>m&&a.indexOf(m)===i);
// THE AIR (core/atmos/README.md, "Adopting the final rebuild's atmos items"): height fog with the station's numbers, and the rain's occlusion map
// (a station that made its own, as the glacier's 89-host-atmos, keeps it: ATMOS.fog and ATMOS.raincover are then set)
if(typeof ATMOS!=='undefined'&&ATMOS.heightFog&&!ATMOS.fog&&CORE_Q.get('fog')!=='0'){
 try{const A=typeof ATMOS_AIR!=='undefined'?ATMOS_AIR:{falloff:1/900,sun:.35,sky:.35,mist:{density:.0012,below:60,depth:40,noise:.7}};
  ATMOS.heightFog(A);ATMOS.heightFogScene(scene);}catch(e){reportErr('height fog: '+e.stack);}}

// THE HEAT ON THE SNOW: where the page lies snow (the glacier's snowcover), the warm ground round its vents stays bare
if(THERM&&typeof ATMOS!=='undefined'&&ATMOS.snowBare&&typeof STATION_SNOW!=='undefined'&&STATION_SNOW){
 try{ATMOS.snowBare(THERM.snowMask({box:ENV_BOX,cell:8,t0:0,soft:2}));}catch(e){reportErr('snow bare: '+e.stack);}}
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the map (256 a side) and the far field past it; the ground here, the flora after.
// After the air, so the count below sees every layer: a ground takes it only where its fragment shader keeps two texture units free for it (the
// horizon's two maps). Station 1's floor reads fifteen (the paint, the detail, the macro and twelve library layers): the limit is sixteen, so its
// ground keeps the plain light and its flora takes the horizon (window._horizon.skipped names what was left out)
const LIBOF={MeshLambertMaterial:'lambert',MeshStandardMaterial:'standard',MeshPhysicalMaterial:'physical',MeshPhongMaterial:'phong',MeshBasicMaterial:'basic',MeshToonMaterial:'toon'};
const samplersOf=m=>{try{const L=THREE.ShaderLib[LIBOF[m.type]],sh=L?{uniforms:{},vertexShader:L.vertexShader,fragmentShader:L.fragmentShader}:{uniforms:{},vertexShader:m.vertexShader||'',fragmentShader:m.fragmentShader||''};
  const f0=typeof KHOOK!=='undefined'?KHOOK.failures.length:0;   /* a dry run: what it misses is not a real compile's (that one records its own) */
  try{if(m.onBeforeCompile)m.onBeforeCompile(sh,renderer);}finally{if(typeof KHOOK!=='undefined')KHOOK.failures.length=f0;}let n=(m.map?1:0)+(m.emissiveMap?1:0)+(m.alphaMap?1:0)+(m.lightMap?1:0)+(m.aoMap?1:0);
  sh.fragmentShader.replace(/uniform\s+sampler(?:2D|Cube)\s+([^;]+);/g,(a,b)=>{n+=b.split(',').length;return a;});return n+(SHADOW_ON&&!(m.isShaderMaterial)?1:0);}catch(e){return 99;}};   /* +1: the sun's shadow map, in every lit material once it is on (three adds it at compile) */
let SHADOW_ON=false;
// THE SUN'S SHADOWS (core/shadow, KSHADOW; the owner, 2026-11-03): one box that follows the view (90-600 m), every placed mesh casting and receiving.
// In three r128 the shadow map's sampler is declared in EVERY lit material once the renderer's shadow map is on (receiveShadow is only a uniform),
// so a page whose ground already reads all sixteen texture units cannot take it: the isle's and the vents' grounds (window._shadow says why). It is
// decided before the rain cover and the horizon, which then count the map (samplersOf +1). ?shadow=0 none of it
window._shadow=null;
const SHADOW=(function(){if(typeof KSHADOW==='undefined'||typeof sun==='undefined'||!sun||!sun.isDirectionalLight||CORE_Q.get('shadow')==='0'){window._shadow='off';return null;}
 const MAXT=(renderer.capabilities.maxTextures==null?16:renderer.capabilities.maxTextures),worst=Math.max(0,...GROUND_MATS_ALL.map(samplersOf));
 if(worst+1>MAXT){window._shadow='skipped: the ground reads '+worst+' of '+MAXT+' texture units';return null;}
 try{const S=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});GROUND_MATS_ALL.forEach(m=>{m.userData.twShadow=true;});
  scene.traverse(o=>{if(o.isMesh&&GROUND_MATS_ALL.indexOf(o.material)>=0)o.receiveShadow=true;});
  scene.children.forEach(c=>{if(!(c.userData&&c.userData.farField)&&!(c.isMesh&&GROUND_MATS_ALL.indexOf(c.material)>=0))S.cast(c);});
  SHADOW_ON=true;window._shadow={grounds:GROUND_MATS_ALL.length,worst:worst+1};return S;}catch(e){reportErr('shadow: '+e.stack);return null;}})();// the rain's occlusion map (no rain under the trees) adds a texture unit to every lit material: a ground already at the limit (the isle's) keeps the rain everywhere, as before
window._rainCover=null;
if(typeof ATMOS!=='undefined'&&ATMOS.rainCover&&!ATMOS.raincover){const MAXT=(renderer.capabilities.maxTextures==null?16:renderer.capabilities.maxTextures),full=GROUND_MATS_ALL.filter(m=>samplersOf(m)+1>MAXT);
 if(full.length)window._rainCover='skipped: the ground reads '+Math.max(...full.map(samplersOf))+' of '+MAXT+' texture units';
 else{try{ATMOS.rainCover({renderer});window._rainCover='on';}catch(e){reportErr('rain cover: '+e.stack);}}}
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||CORE_Q.get('hz')==='0')return null;
 try{const t0=performance.now(),S=TERR.R*1.1,F=typeof FAR!=='undefined'&&FAR?FAR:null,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
   far:F?{h:(x,z)=>{const v=F.G.at(x,z);return v===v?v:0;},box:[-F.R,-F.R,F.R,F.R],n:200}:undefined});
  const MAXT=(renderer.capabilities.maxTextures==null?16:renderer.capabilities.maxTextures),skip=[];
  window._horizon={ms:Math.round(performance.now()-t0),n:H.n};GROUND_MATS_ALL.forEach(m=>{if(samplersOf(m)+2<=MAXT)KHORIZON.shade(m,H);else skip.push(m.name||'the ground');});
  window._horizon.mats=KHORIZON.shadeScene(scene,H,{filter:o=>!o.userData.farField&&(Array.isArray(o.material)?o.material:[o.material]).every(m=>GROUND_MATS_ALL.indexOf(m)<0&&samplersOf(m)+2<=MAXT)});   /* the filter takes the mesh */window._horizon.skipped=skip;return H;}
 catch(e){reportErr('horizon: '+e.stack);return null;}})();