// ================================================================= MATERIAL REFINEMENTS: library maps on engine fallback keys & PBR tuning
// Runs right after core/engine/27-mat.js (which overwrote MAT.plain, MAT.brass, MAT.bone and MAT.flag with untextured materials).
// Re-applying svLibMat guarantees 100% of opaque/lit surfaces carry decoded library textures, and tunes PBR sheen on kura plaster,
// sootstone socles, Newar kilnbrick, Ria-inherited cobalt/celadon glazes, Arch-nickel hoops, paktong, cast bronze, and dark cedar.
svLibMat('plain',{rough:.84});
svLibMat('brass',{rough:.34,metal:.78});
svLibMat('bone',{rough:.56});
svLibMat('flag',{rough:.78});
if(MAT.kura)MAT.kura.roughness=.72;
if(MAT.sootstone)MAT.sootstone.roughness=.46;
if(MAT.kilnbrick)MAT.kilnbrick.roughness=.64;
if(MAT.ashlar)MAT.ashlar.roughness=.62;
if(MAT.cobalt)MAT.cobalt.roughness=.24;
if(MAT.celadon)MAT.celadon.roughness=.28;
if(MAT.terracotta)MAT.terracotta.roughness=.52;
if(MAT.slate)MAT.slate.roughness=.42;
if(MAT.shingle)MAT.shingle.roughness=.62;
if(MAT.darkcedar)MAT.darkcedar.roughness=.48;
if(MAT.cedar)MAT.cedar.roughness=.52;
if(MAT.carvedwood)MAT.carvedwood.roughness=.46;
if(MAT.lacquer)MAT.lacquer.roughness=.32;
if(MAT.nickel){MAT.nickel.roughness=.24;MAT.nickel.metalness=.88;}
if(MAT.paktong){MAT.paktong.roughness=.28;MAT.paktong.metalness=.82;}
if(MAT.iron){MAT.iron.roughness=.44;MAT.iron.metalness=.66;}
if(MAT.bronze){MAT.bronze.roughness=.34;MAT.bronze.metalness=.8;}
if(MAT.copper){MAT.copper.roughness=.38;MAT.copper.metalness=.56;}
if(MAT.amber)MAT.amber.roughness=.42;
if(MAT.alabaster)MAT.alabaster.roughness=.38;
for(const klMk of ['silk','brocade','flag']){
 if(MAT[klMk]){MAT[klMk].roughness=.66;MAT[klMk].side=THREE.DoubleSide;}
}
svAnimHooks();
