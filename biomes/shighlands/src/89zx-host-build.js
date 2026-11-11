// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES), then the kit, then one bake.
// 89zx, after the water (it was 88; the final rebuild, pair 12, korona's move): the trees keep off the water by its own surfaces, so they must
// exist first (89zw). Nothing it builds is read by the sky, the atmosphere or the water, so the move changes no page value of theirs.
window._biome=null;
// THE WATER AS FIELDS (core/water ext/60; the review's third line, the final rebuild): the shore of the water the eye sees (the tarn, the bog
// pools, the ravine streams), baked over the map at 8 m before the first tree, so a tree whose bole would stand in it is not drawn (55: offShore)
// and the host's edge check reads the same field (99). ?fields=0 none of it (the trees as before)
const WATER_F=new URLSearchParams(location.search).get('fields')!=='0'&&WATER.fields&&WATER.surfaces.length?
 WATER.fields({box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],cell:8,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall')}):null;
if(WATER_F)SHIGH.SHORE=(x,z)=>WATER.fieldAt(WATER_F,x,z).shore;
const IMP_GAIN=2.6;   /* the impostors' gain (oidong and korona 2.6): the bake comes out ~4x dark (HANDOFF: a core fix owed); set against the near crowns on the GPU */
// THE SUN'S SHADOWS (core/shadow, KSHADOW; the owner, 2026-11-03): toggleable and OFF by default: the panel's `shadows` button or ?shadow=1 turns
// them on (their cost is the coordinator's GPU run's to measure). In three r128 the map's sampler is declared in every lit material while the map
// is on, so a ground that already reads every texture unit cannot take it (the Throne's isle and vents): window._shadow says what was decided.
window._shadow=null;
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it (for budgeting)
 // the face (2026-11-09) holds far more forest than the old plateau did: the default quality is .76 so the page stays inside its 19.5 M budget
 // (24.7 M at 1); a station sets STATION_Q. ?q=1 the full density
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):(typeof STATION_Q!=='undefined'?STATION_Q:.76);
 // THE FAR BAND'S DIET (GRAPHIC-LOAD.md recommendation 2): the far trees as octahedral impostors (core/biome 34; 55); ?diet=0 the old blobs
 if(Q.get('diet')==='0')SHIGH.IMPOSTORS=false;
 // one mirror-handed coilbark where a camera finds it: the nearest to the deepest cloud forest on the spine
 // (a station names its own: STATION_MIRROR {key, score(x,z), box}; none for a station without trees)
 {const MR=typeof STATION_MIRROR!=='undefined'?STATION_MIRROR:{key:'coilbark',score:(x,z)=>SHIGH.zones(x,z).forest,box:[-2400,-2400,2400,0]};
  if(MR){let bx=0,bz=-1200,bs=-1e9;for(let z=MR.box[1];z<=MR.box[3];z+=40)for(let x=MR.box[0];x<=MR.box[2];x+=40){if(BIO.mask(x,z)<=0)continue;const s=MR.score(x,z)-BIO.lodD(x,z)/400;if(s>bs){bs=s;bx=x;bz=z;}}
   SHIGH.mirrorAt.push({key:MR.key,x:bx,z:bz});}}
 try{window._biome=SHIGH.build({R:TERR.R-150,quality:q});}catch(e){reportErr('biome: '+e.stack);}
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 /* the impostors' light matched to the near crowns; ?impgain= ?impwrap= to tune. Then the species' views (core/biome 34), after every placement;
    the bake waits for the library maps (up to 180 s) */
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||IMP_GAIN),wrap:+(Q.get('impwrap')||1)});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}
 /* R7: leaf and grass cut-outs by alpha-to-coverage when the canvas has MSAA (the alpha test stays without it) */
 if(BIO.setA2C)BIO.setA2C(renderer);
 /* the terrain's horizon on what stands on the land (85-host-far.js baked it; the ground has it already) */
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}catch(e){reportErr('horizon: '+e.stack);}}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 /* the region's volume holds the land on every page: the cloud-deck band (the main page) widened to the ground's sampled range over the disc
    (a station's stage has no deck, CLOUD_Y far below, and its land stands thousands of metres up) */
 {let lo=Infinity,hi=-Infinity;const N=48,R0=TERR.R*.7;for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const x=(i/N*2-1)*R0,z=(j/N*2-1)*R0;if(x*x+z*z>R0*R0)continue;const h=terrainH(x,z);if(isFinite(h)){if(h<lo)lo=h;if(h>hi)hi=h;}}
  const b0=CLOUD_Y-80,b1=CLOUD_Y+620,y0=CLOUD_Y>-1e4&&isFinite(lo)?Math.min(b0,lo):isFinite(lo)?lo:b0,y1=CLOUD_Y>-1e4&&isFinite(hi)?Math.max(b1,hi):isFinite(hi)?hi:b1;
  REGISTER({name:'The southern highlands (ideal type)',x:0,z:0,y:Math.floor(y0),r:TERR.R,h:Math.ceil(y1-y0)});}
 /* the sun's shadows, attached off (the guard first: a dry run of the ground's shader counts its texture units) */
 if(typeof KSHADOW==='undefined'||!KSHADOW.attach){window._shadow='off: no core/shadow';return;}
 const LIBOF={MeshLambertMaterial:'lambert',MeshStandardMaterial:'standard',MeshPhysicalMaterial:'physical',MeshPhongMaterial:'phong'};
 const samplersOf=m=>{try{const L=THREE.ShaderLib[LIBOF[m.type]],sh=L?{uniforms:{},vertexShader:L.vertexShader,fragmentShader:L.fragmentShader}:{uniforms:{},vertexShader:'',fragmentShader:''};
   const f0=typeof KHOOK!=='undefined'?KHOOK.failures.length:0;
   try{if(m.onBeforeCompile)m.onBeforeCompile(sh,renderer);}finally{if(typeof KHOOK!=='undefined')KHOOK.failures.length=f0;}let n=(m.map?1:0)+(m.normalMap?1:0)+(m.roughnessMap?1:0);
   sh.fragmentShader.replace(/uniform\s+sampler(?:2D|Cube)\s+([^;]+);/g,(a,c)=>{n+=c.split(',').length;return a;});return n;}catch(e){return 99;}};
 const MAXT=renderer.capabilities.maxTextures==null?16:renderer.capabilities.maxTextures,worst=samplersOf(MAT_GROUND);
 if(worst+1>MAXT){window._shadow='skipped: the ground reads '+worst+' of '+MAXT+' texture units';return;}
 try{const S=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});   /* off until switched on (?shadow=1 or the panel's button) */
  scene.children.forEach(c=>{if(c.userData&&c.userData.farField)return;if(c.isMesh&&c.material===MAT_GROUND){S.cast(c,{cast:false});return;}S.cast(c);});
  if(FAR&&FAR.mesh)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;
  window.SHADOW=S;window._shadow={attached:true,on:!!(S.enabled&&S.enabled()),ground:worst+1,of:MAXT};}catch(e){reportErr('shadow: '+e.stack);}
})();
