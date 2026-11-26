/* ================================================================= MATERIAL REFINEMENTS: library maps on engine fallback keys & PBR glaze/metal tuning
   Runs right after core/engine/27-mat.js (which overwrote MAT.plain, MAT.brass, MAT.bone and MAT.flag with untextured materials).
   Re-applying svLibMat guarantees 100% of opaque/lit surfaces carry decoded library textures, and tunes PBR wet-glaze sheen on
   alkaline-teal kashi, Zsolnay pyrogranite, trencadis mosaic, Catalan escata scales, Liikofi abyss-lac coffers, and verdigris-gilt bronze. */
svLibMat('plain',{rough:.84});
svLibMat('brass',{rough:.32,metal:.78});
svLibMat('bone',{rough:.56});
svLibMat('flag',{rough:.76});
if(MAT.buffbrick)MAT.buffbrick.roughness=.68;
if(MAT.rosebrick)MAT.rosebrick.roughness=.64;
if(MAT.bandbrick)MAT.bandbrick.roughness=.62;
if(MAT.stucco)MAT.stucco.roughness=.74;
if(MAT.ganch)MAT.ganch.roughness=.62;
if(MAT.alabaster)MAT.alabaster.roughness=.34;
if(MAT.kashi)MAT.kashi.roughness=.21;
if(MAT.zsolnay)MAT.zsolnay.roughness=.24;
if(MAT.zsolnay_fine)MAT.zsolnay_fine.roughness=.24;
if(MAT.cobalt)MAT.cobalt.roughness=.22;
if(MAT.trencadis)MAT.trencadis.roughness=.23;
if(MAT.escata)MAT.escata.roughness=.3;
if(MAT.claustra){
 MAT.claustra.roughness=.68;
 MAT.claustra.side=THREE.DoubleSide;
 if(MAT.claustra.map){MAT.claustra.alphaTest=.48;MAT.claustra.needsUpdate=true;}
}
if(MAT.bathlens)MAT.bathlens.roughness=.28;
if(MAT.terracotta)MAT.terracotta.roughness=.52;
if(MAT.ashlar)MAT.ashlar.roughness=.64;
if(MAT.ustun)MAT.ustun.roughness=.46;
if(MAT.cedar)MAT.cedar.roughness=.52;
if(MAT.carvedwood)MAT.carvedwood.roughness=.45;
if(MAT.kundal)MAT.kundal.roughness=.3;
if(MAT.lacquer)MAT.lacquer.roughness=.26;
if(MAT.verdigris){MAT.verdigris.roughness=.34;MAT.verdigris.metalness=.58;}
if(MAT.leafscale){MAT.leafscale.roughness=.32;MAT.leafscale.metalness=.64;}
if(MAT.gilt){MAT.gilt.roughness=.22;MAT.gilt.metalness=.88;}
if(MAT.bronze){MAT.bronze.roughness=.32;MAT.bronze.metalness=.8;}
if(MAT.iron){MAT.iron.roughness=.44;MAT.iron.metalness=.66;}
if(MAT.crystal)MAT.crystal.roughness=.2;
for(const tbMk of ['silk','brocade','canvas','flag']){
 if(MAT[tbMk]){MAT[tbMk].roughness=.66;MAT[tbMk].side=THREE.DoubleSide;}
}
svAnimHooks();
