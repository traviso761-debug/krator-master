// ================================================================= MATERIAL REFINEMENTS: library maps on engine fallback keys & nephrite/gutskin tuning
// Runs immediately after core/engine/27-mat.js, which overwrote MAT.plain, MAT.brass, MAT.bone and MAT.flag with untextured
// materials after its SV_LIB loop. Re-applying svLibMat here ensures 100% of opaque/lit surfaces—including kits/resources'
// 44r-res-nodes.js veins and nuggets—carry real library textures, and tunes roughness/metalness for columnar basalt, sawn
// emerald nephrite, whalebone, Jomon kaen-doki terracotta, verdigris glaze, sea-green glass and wind-rigged gutskin/kelp/chimes.
svLibMat('plain',{rough:.84});
svLibMat('brass',{rough:.36,metal:.78});
svLibMat('bone',{rough:.56});
svLibMat('flag',{rough:.82});
if(MAT.basalt)MAT.basalt.roughness=.84;
if(MAT.columnar)MAT.columnar.roughness=.78;
if(MAT.ashlar)MAT.ashlar.roughness=.46;
if(MAT.nephrite){MAT.nephrite.roughness=.26;MAT.nephrite.metalness=.06;}
if(MAT.jade){MAT.jade.roughness=.24;MAT.jade.metalness=.06;}
if(MAT.whalebone)MAT.whalebone.roughness=.54;
if(MAT.baleen){MAT.baleen.roughness=.38;MAT.baleen.metalness=.08;}
if(MAT.kaen)MAT.kaen.roughness=.68;
if(MAT.glaze)MAT.glaze.roughness=.32;
if(MAT.tarwood)MAT.tarwood.roughness=.42;
if(MAT.seaglass){MAT.seaglass.roughness=.24;MAT.seaglass.emissive=new THREE.Color(0x0c2820);MAT.seaglass.emissiveIntensity=.22;}
if(MAT.bronze){MAT.bronze.roughness=.38;MAT.bronze.metalness=.78;}
if(MAT.verdigris){MAT.verdigris.roughness=.52;MAT.verdigris.metalness=.45;}
for(const hkMk of ['gutskin','hide','kelp','netting','banner','chime']){
 if(MAT[hkMk]){
  MAT[hkMk].roughness=hkMk==='chime'?.24:hkMk==='gutskin'?.48:.72;
  MAT[hkMk].side=THREE.DoubleSide;
 }
}
if(MAT.gutskin){MAT.gutskin.emissive=new THREE.Color(0x281c08);MAT.gutskin.emissiveIntensity=.18;}
svAnimHooks();
