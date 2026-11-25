// ================================================================= MATERIAL REFINEMENTS: library maps on engine fallback keys & PBR tuning
// Runs right after core/engine/27-mat.js (which overwrote MAT.plain, MAT.brass, MAT.bone and MAT.flag with untextured materials).
// Re-applying svLibMat guarantees 100% of opaque/lit surfaces carry decoded library textures, and tunes PBR sheen on loess earth,
// white limewash tympana, karst dolomite, kilnbrick, tuned dark basalt, tin-bronze, Kulanewa iron/valge-vask, halite, and mole-felt.
svLibMat('plain',{rough:.84});
svLibMat('brass',{rough:.34,metal:.78});
svLibMat('bone',{rough:.56});
svLibMat('flag',{rough:.76});
if(MAT.loess)MAT.loess.roughness=.86;
if(MAT.rammed)MAT.rammed.roughness=.84;
if(MAT.limewash)MAT.limewash.roughness=.74;
if(MAT.dolomite)MAT.dolomite.roughness=.62;
if(MAT.kilnbrick)MAT.kilnbrick.roughness=.66;
if(MAT.basalt)MAT.basalt.roughness=.42;
if(MAT.ochre)MAT.ochre.roughness=.64;
if(MAT.ironred)MAT.ironred.roughness=.66;
if(MAT.indigo)MAT.indigo.roughness=.32;
if(MAT.terracotta)MAT.terracotta.roughness=.54;
if(MAT.slate)MAT.slate.roughness=.44;
if(MAT.darkcedar)MAT.darkcedar.roughness=.48;
if(MAT.cedar)MAT.cedar.roughness=.52;
if(MAT.carvedwood)MAT.carvedwood.roughness=.46;
if(MAT.bronze){MAT.bronze.roughness=.34;MAT.bronze.metalness=.8;}
if(MAT.copper){MAT.copper.roughness=.38;MAT.copper.metalness=.56;}
if(MAT.iron){MAT.iron.roughness=.44;MAT.iron.metalness=.68;}
if(MAT.nickel){MAT.nickel.roughness=.24;MAT.nickel.metalness=.88;}
if(MAT.halite)MAT.halite.roughness=.34;
if(MAT.amber)MAT.amber.roughness=.36;
if(MAT.reedmat)MAT.reedmat.roughness=.78;
if(MAT.hide)MAT.hide.roughness=.76;
for(const mcMk of ['molefelt','tapestry','flag']){
 if(MAT[mcMk]){MAT[mcMk].roughness=.74;MAT[mcMk].side=THREE.DoubleSide;}
}
svAnimHooks();
