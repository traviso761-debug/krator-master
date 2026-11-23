// ================================================================= MATERIAL UPGRADES: wire core/engine's plain/brass/bone/flag to library sets
// core/engine/27-mat.js overwrites MAT.plain, MAT.brass, MAT.bone, and MAT.flag with untextured MeshStandardMaterials after
// looping SV_LIB. Rebuild those four through svLibMat (when KMAT.mode === 'lib') and re-run svAnimHooks() so EVERY building,
// flag, horn, and kits/resources ore outcrop mesh carries real library albedo/normal/roughness maps.
if(KMAT.mode==='lib'){
 svLibMat('plain',{rough:.88,metal:0});
 svLibMat('brass',{rough:.38,metal:.78});
 svLibMat('bone',{rough:.62,metal:0});
 svLibMat('flag',{rough:.88,metal:0});
 svAnimHooks();
}
