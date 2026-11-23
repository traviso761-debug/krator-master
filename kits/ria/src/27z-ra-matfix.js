// ================================================================= MATERIAL REFINEMENTS: library maps on engine fallback keys & glazes
// Runs right after core/engine/27-mat.js (which overwrote MAT.plain, MAT.brass, MAT.bone and MAT.flag with untextured materials).
// Re-applying svLibMat guarantees 100% of opaque/lit surfaces carry decoded library textures, and sets PBR sheen on Babylonian
// polychrome glazes, gilded Prasat roofs, silver-bronze Hongsa sculptures, imperial red porphyry, and magnetized lodestone.
svLibMat('plain',{rough:.84});
svLibMat('brass',{rough:.34,metal:.78});
svLibMat('bone',{rough:.56});
svLibMat('flag',{rough:.78});
if(MAT.cobalt)MAT.cobalt.roughness=.24;
if(MAT.emerald)MAT.emerald.roughness=.26;
if(MAT.saffron)MAT.saffron.roughness=.38;
if(MAT.celadon)MAT.celadon.roughness=.28;
if(MAT.giltroof){MAT.giltroof.roughness=.26;MAT.giltroof.metalness=.78;}
if(MAT.indigoslate)MAT.indigoslate.roughness=.44;
if(MAT.copper){MAT.copper.roughness=.36;MAT.copper.metalness=.54;}
if(MAT.porphyry)MAT.porphyry.roughness=.34;
if(MAT.dolomite)MAT.dolomite.roughness=.46;
if(MAT.alabaster)MAT.alabaster.roughness=.38;
if(MAT.crimson)MAT.crimson.roughness=.32;
if(MAT.teak)MAT.teak.roughness=.48;
if(MAT.gold){MAT.gold.roughness=.24;MAT.gold.metalness=.88;}
if(MAT.bronze){MAT.bronze.roughness=.36;MAT.bronze.metalness=.78;}
if(MAT.silver){MAT.silver.roughness=.26;MAT.silver.metalness=.85;}
if(MAT.lodestone){MAT.lodestone.roughness=.28;MAT.lodestone.metalness=.7;}
for(const raMk of ['silk','brocade','flag']){
 if(MAT[raMk]){MAT[raMk].roughness=.66;MAT[raMk].side=THREE.DoubleSide;}
}
svAnimHooks();
