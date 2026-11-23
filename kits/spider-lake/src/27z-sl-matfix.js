// ================================================================= MATERIAL REFINEMENTS: library maps on engine fallback keys & silk sheen
// Runs immediately after core/engine/27-mat.js, which overwrote MAT.plain, MAT.brass, MAT.bone and MAT.flag with untextured
// materials after its SV_LIB loop. Re-applying svLibMat here ensures 100% of opaque/lit surfaces—including kits/resources'
// 44r-res-nodes.js veins and nuggets—carry real library textures, and tunes roughness/metalness for lacquer, jade, porphyry,
// oiled-silk cocoons and spider-silk cloths.
svLibMat('plain',{rough:.85});
svLibMat('brass',{rough:.36,metal:.78});
svLibMat('bone',{rough:.58});
svLibMat('flag',{rough:.82});
if(MAT.lacquer)MAT.lacquer.roughness=.34;
if(MAT.ebony)MAT.ebony.roughness=.38;
if(MAT.porphyry)MAT.porphyry.roughness=.42;
if(MAT.jade)MAT.jade.roughness=.32;
if(MAT.celadon)MAT.celadon.roughness=.36;
if(MAT.bronze){MAT.bronze.roughness=.38;MAT.bronze.metalness=.78;}
if(MAT.gold){MAT.gold.roughness=.28;MAT.gold.metalness=.88;}
if(MAT.cocoon){MAT.cocoon.roughness=.48;MAT.cocoon.emissive=new THREE.Color(0x3a2408);MAT.cocoon.emissiveIntensity=.35;}
for(const slMk of ['silk','velarium','shamiyana','veil','streamer','brocade']){
 if(MAT[slMk]){MAT[slMk].roughness=.68;MAT[slMk].side=THREE.DoubleSide;}}
svAnimHooks();
