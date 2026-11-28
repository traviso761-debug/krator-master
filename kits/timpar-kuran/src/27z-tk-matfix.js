// ================================================================= MATERIAL REFINEMENTS: library maps on engine fallbacks, tempera sheen & metals
// Runs immediately after 27-mat.js and 27v-tk-vstack.js:
//   - Re-applies svLibMat onto MAT.plain, MAT.brass, MAT.bone, and MAT.flag (which 27-mat.js reset after its SV_LIB loop)
//     so 100% of kits/resources ore veins and engine hardware carry decoded library textures.
//   - Tunes roughness/metalness across wet rainforest red-cypress, salmon-egg-tempera formlines, kaen-doki clay, cold-hammered
//     native copper, Kanopi titanium-ceramic alloy, raided Eternian bronze/celadon, jade adzes, and SV_CLOTH membranes.
svLibMat('plain',{rough:.84});
svLibMat('brass',{rough:.36,metal:.78});
svLibMat('bone',{rough:.58});
svLibMat('flag',{rough:.82});
if(MAT.cypress)MAT.cypress.roughness=.66;
if(MAT.cedar)MAT.cedar.roughness=.74;
if(MAT.silverwood)MAT.silverwood.roughness=.78;
if(MAT.totem)MAT.totem.roughness=.62;
if(MAT.tarwood)MAT.tarwood.roughness=.46;
if(MAT.bark)MAT.bark.roughness=.84;
if(MAT.shingle)MAT.shingle.roughness=.78;
if(MAT.reed)MAT.reed.roughness=.88;
if(MAT.thatch)MAT.thatch.roughness=.86;
if(MAT.megabreccia)MAT.megabreccia.roughness=.86;
if(MAT.cobble)MAT.cobble.roughness=.8;
if(MAT.kaen)MAT.kaen.roughness=.7;
if(MAT.celadon)MAT.celadon.roughness=.32;
for(const tkFk of ['formBlack','formRed','formTeal']){
 if(MAT[tkFk])MAT[tkFk].roughness=.44;
}
if(MAT.copper){MAT.copper.roughness=.32;MAT.copper.metalness=.78;}
if(MAT.bronze){MAT.bronze.roughness=.38;MAT.bronze.metalness=.72;}
if(MAT.verdigris){MAT.verdigris.roughness=.52;MAT.verdigris.metalness=.45;}
if(MAT.iron){MAT.iron.roughness=.48;MAT.iron.metalness=.62;}
if(MAT.kanopiAlloy){MAT.kanopiAlloy.roughness=.3;MAT.kanopiAlloy.metalness=.72;}
if(MAT.kanopiWhite){MAT.kanopiWhite.roughness=.38;MAT.kanopiWhite.metalness=.24;}
if(MAT.jade){
 MAT.jade.roughness=.24;MAT.jade.metalness=.06;
 if(MAT.jade.map){MAT.jade.emissive.setHex(0x226846);MAT.jade.emissiveMap=MAT.jade.map;MAT.jade.emissiveIntensity=.14;}
}
if(MAT.water){MAT.water.roughness=.24;MAT.water.metalness=0;MAT.water.opacity=.92;MAT.water.envMapIntensity=.48;MAT.water.needsUpdate=true;}
for(const tkMk of ['chilkat','attus','inau','hide','netting','flag']){
 if(MAT[tkMk]){
  MAT[tkMk].roughness=tkMk==='inau'?.68:.76;
  MAT[tkMk].side=THREE.DoubleSide;
 }
}
svAnimHooks();
