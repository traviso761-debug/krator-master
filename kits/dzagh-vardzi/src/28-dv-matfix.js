// ================================================================= MATERIAL UPGRADES: library maps + animated whitewater UV flow
// core/engine/27-mat.js overwrites MAT.plain, MAT.brass, MAT.bone, and MAT.flag with untextured MeshStandardMaterials after
// looping SV_LIB. Rebuild those four through svLibMat (when KMAT.mode === 'lib'), animate MAT.flumeWater UV flow with ANIMU.uTime,
// and re-run svAnimHooks() so EVERY building, flume stream, flag, horn, and ore outcrop mesh carries real library maps.
if(KMAT.mode==='lib'){
 svLibMat('plain',{rough:.88,metal:0});
 svLibMat('brass',{rough:.38,metal:.78});
 svLibMat('bone',{rough:.62,metal:0});
 svLibMat('flag',{rough:.88,metal:0});
 if(MAT.flumeWater){
  MAT.flumeWater.roughness=.24;
  matHook(MAT.flumeWater,'flumeflow',sh=>{
   sh.uniforms.uFlowT=ANIMU.uTime;
   sh.vertexShader='uniform float uFlowT;\n'+sh.vertexShader.replace('#include <uv_vertex>',
    '#include <uv_vertex>\n#if defined( USE_MAP ) || defined( USE_NORMALMAP ) || defined( USE_ROUGHNESSMAP )\n vUv+=vec2(-uFlowT*0.85,-uFlowT*1.45);\n#endif');
  });
 }
 svAnimHooks();
}
