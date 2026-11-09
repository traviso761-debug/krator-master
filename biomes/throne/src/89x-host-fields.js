// ================================================================= HOST — the environmental fields (2026-11-02, the final rebuild; every page)
// core/biome/README.md, "The environmental fields", and the checklist's lines from ChatGPT's review (HANDOFF-REBUILD.md): the flora, the ground's wet
// band and the audits read ONE shore, the water the eye sees (core/water ext/60: WATER.fields, fieldAt), and one temperature, the ground's heat
// between the vents (core/terrain/47-core-therm.js: KTHERM). After the water (89w: its records exist) and before the build (89z, which was 88 for
// this reason), so the plants are placed on these numbers. Each station takes it as it is; the page's own records say what is there:
//   THE SHORE   every water surface but the falls (a station with none, as the ash desert, the caldera and the tube, gets none of this)
//   THE FLORA   BIO.mask gives 0 within .8 m of the water's edge on land and in it (the hosts' waterMask read the level against the ground, not the
//               surface's own edge); FIELD.wet takes the shore's band (.9 at the edge, gone by 40 m) where that is wetter than the kit's own field.
//               The passes that stand in the water on purpose (the brimstone candelabras, the mangroves: noMask) are not masked
//   THE GROUND  a wet band darkens the ground toward the real edge (14 m, the KHOOK layer 'throne-wet' on the ground's materials), of every water
//               but the open sea (its own swash wets the beach: WATER.wetGround on the frontier and the isle)
//   THE HEAT    KTHERM from the page's vents: its fumaroles (STEAM, FUMS), its geysers (GEYSERS) and its hot springs (the WATER.spring records,
//               by their temperature); the soil the scale model's lapse (climate.json: 26 C at the datum, 5.5 C a km, warmer below it: the Ring Sea's shore is 1.5 km under). ENV.temp, the glacier's bare snow (89zz)
//   ENV         BIO.env over the page's ground, the water's fields, the heat and the kit's wet; BIO.envCheck and WATER.edgeAudit run in 99-host-tz-core.js
// ?fields=0: none of the flora's or the ground's changes (the fields are still made for the checks); ?wetband=0 no wet band on the ground.
const ENV_BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],ENV_ON=CORE_Q.get('fields')!=='0';
const ENV_SURF=(typeof WATER!=='undefined'&&WATER.fields&&WATER.surfaces)?WATER.surfaces.filter(q=>q.kind!=='fall'&&!q.seasonal):[];
const WATER_F=ENV_SURF.length?WATER.fields({box:ENV_BOX,cell:6,ground:terrainH,surfaces:ENV_SURF}):null;
const WATER_FN=WATER_F?WATER.fieldFns(WATER_F):null;
const shoreAt=(x,z)=>{if(!WATER_FN)return 1e9;const s=WATER_FN.shore(x,z);return s==null||s!==s?1e9:s;};
const WET_SHORE=(x,z)=>{const s=shoreAt(x,z);return s<0?1:.9*smooth(40,1,s);};
const THERM=(function(){if(typeof KTHERM==='undefined')return null;const V=[];
 const add=(id,x,z,T,reach)=>{if(isFinite(x)&&isFinite(z)&&reach>0)V.push({id,kind:'point',x,z,T,reach,decay:3});};
 if(typeof STEAM!=='undefined')STEAM.forEach((S,i)=>add('steam'+i,S.x,S.z,60+40*(S.s==null?1:S.s),Math.max(12,((S.R==null?8:S.R))*3)));
 if(typeof FUMS!=='undefined')FUMS.forEach((F,i)=>add('fumarole'+i,F.x,F.z,70+25*(F.s==null?1:F.s),40));
 if(typeof GEYSERS!=='undefined')GEYSERS.forEach((G,i)=>add('geyser'+i,G.x,G.z,95,60));
 ENV_SURF.filter(q=>q.thermal).forEach((q,i)=>{const t=q.thermal;add('spring'+i,t.x,t.z,30+65*Math.min(1,t.temp*1.45),t.r*4);});
 if(!V.length)return null;
 return KTHERM.create({soil:(x,z)=>26-.0055*terrainH(x,z),vents:V,detail:{amp:1.5,scale:.02,seed:KRAND.hash(571,514,47)}});})();
const THERM_F=THERM?THERM.bake({box:ENV_BOX,cell:8}):null;
const ENV=BIO.env({ground:terrainH,water:WATER_FN||undefined,therm:THERM_F?KTHERM.fieldFns(THERM_F):undefined,wet:(x,z)=>FIELD.wet(x,z),
 bands:{upland:[1500,2300],flow:60}});
if(ENV_ON&&WATER_FN){
 // the flora: not on the water the eye sees, and the kit's wet field wetter where the water is near
 const M0=BIO.host.mask;BIO.host.mask=(x,z)=>shoreAt(x,z)<.8?0:(M0?M0(x,z):1);
 /* and a tree's bole, its own width clear of it too (55's pass asks after the tree's draws); the candelabras and the mangroves stand in it */
 THRONE.veto=T=>{const S=THRONE.SPECIES[T.sp];return !(S&&(S.key==='brimstone'||S.key==='mangrove'))&&shoreAt(T.x,T.z)<((T.rb==null?.3:T.rb))*1.3+.3;};
 const W0=FIELD.wet;FIELD.wet=(x,z)=>{const s=shoreAt(x,z);return s>1e8?W0(x,z):Math.max(W0(x,z),WET_SHORE(x,z));};
 // the ground: the wet band to the real edge (not of the open sea), a vertex attribute on the ground's meshes (no texture unit: station 1's floor
 // already reads fifteen of sixteen), darkening the paint and the layers toward the water
 (function(){if(CORE_Q.get('wetband')==='0'||typeof KHOOK==='undefined')return;
  const S=ENV_SURF.filter(q=>q.kind!=='open');if(!S.length)return;
  const F=S.length===ENV_SURF.length?WATER_F:WATER.fields({box:ENV_BOX,cell:6,ground:terrainH,surfaces:S}),FN=WATER.fieldFns(F);
  const mats=[typeof MAT_GROUND!=='undefined'?MAT_GROUND:null,typeof GROUND!=='undefined'&&GROUND?GROUND.material:null,
   typeof GROUND_PATCH!=='undefined'&&GROUND_PATCH?GROUND_PATCH.material:null].concat(typeof GROUND_MATS!=='undefined'?GROUND_MATS:[]).filter((m,i,a)=>m&&a.indexOf(m)===i);
  let meshes=0,wet=0;
  scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||mats.indexOf(o.material)<0)return;const P=o.geometry.attributes.position,a=new Float32Array(P.count);o.updateMatrixWorld();
   const v=new THREE.Vector3();for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);const s=FN.shore(v.x,v.z);a[i]=s==null||s!==s?0:s<0?1:smooth(14,0,s);if(a[i]>0)wet++;}
   o.geometry.setAttribute('aTwWet',new THREE.BufferAttribute(a,1));meshes++;});
  if(!wet)return;
  mats.forEach(m=>KHOOK.add(m,'throne-wet',{
   vertex:{head:'attribute float aTwWet;varying float vTwWet;\n',at:[{at:'project_vertex',after:'vTwWet=aTwWet;'}]},
   fragment:{head:'varying float vTwWet;\n',at:[{at:'emissivemap_fragment',before:'diffuseColor.rgb*=mix(1.0,0.62,clamp(vTwWet,0.0,1.0));'}]}},{key:'throne-wet'}));
  window._wetBand={mats:mats.length,meshes,wet};})();}