// ================================================================= MATERIAL REFINEMENTS: library maps on engine fallbacks, selenite glow & feather sheen
// Runs immediately after 27-mat.js and 27v-pm-vstack.js:
//   - Re-applies svLibMat onto MAT.plain, MAT.brass, MAT.bone, and MAT.flag (which 27-mat.js reset after its SV_LIB loop)
//     so 100% of kits/resources ore veins and engine hardware carry decoded library textures.
//   - Tunes PBR roughness/metalness across danxia sandstone, bentonite plaster, mineral pigments, Koronaobsidian,
//     iridescent Korona bird feathers, and reclaimed Ancient salvage steel.
svLibMat('plain',{rough:.84});
svLibMat('brass',{rough:.38,metal:.74});
svLibMat('bone',{rough:.56});
svLibMat('flag',{rough:.82});

if(MAT.selenite&&MAT.selenite.map){
 MAT.selenite.roughness=.24;
 MAT.selenite.emissive.setHex(0xfff2dc);
 MAT.selenite.emissiveMap=MAT.selenite.map;
 MAT.selenite.emissiveIntensity=.24;
}
if(MAT.danxia)MAT.danxia.roughness=.86;
if(MAT.danxiaBuff)MAT.danxiaBuff.roughness=.84;
if(MAT.danxiaCut)MAT.danxiaCut.roughness=.72;
if(MAT.badland)MAT.badland.roughness=.9;
if(MAT.bentonite)MAT.bentonite.roughness=.88;
if(MAT.plasterOchre)MAT.plasterOchre.roughness=.86;
if(MAT.ochreRed)MAT.ochreRed.roughness=.84;
if(MAT.pipeclay)MAT.pipeclay.roughness=.86;
if(MAT.celadoniteTeal)MAT.celadoniteTeal.roughness=.72;
if(MAT.lignite)MAT.lignite.roughness=.82;
if(MAT.juniper)MAT.juniper.roughness=.78;
if(MAT.canyonOak)MAT.canyonOak.roughness=.76;
if(MAT.mahogany)MAT.mahogany.roughness=.52;
if(MAT.curedBark)MAT.curedBark.roughness=.84;
if(MAT.pitchBasket)MAT.pitchBasket.roughness=.46;
if(MAT.bunchgrass)MAT.bunchgrass.roughness=.92;
if(MAT.obsidian){MAT.obsidian.roughness=.14;MAT.obsidian.metalness=.08;}
if(MAT.salvageRust){MAT.salvageRust.roughness=.66;MAT.salvageRust.metalness=.44;}
if(MAT.salvagePlate){MAT.salvagePlate.roughness=.62;MAT.salvagePlate.metalness=.48;}
if(MAT.iron){MAT.iron.roughness=.54;MAT.iron.metalness=.58;}
if(MAT.bronze){MAT.bronze.roughness=.42;MAT.bronze.metalness=.68;}
if(MAT.water){MAT.water.roughness=.24;MAT.water.metalness=0;MAT.water.opacity=.94;MAT.water.envMapIntensity=.48;MAT.water.needsUpdate=true;}

for(const pmMk of ['feather','featherWarm','wildSilk','hide','herbBundle','flag']){
 if(MAT[pmMk]){
  MAT[pmMk].roughness=(pmMk==='feather'||pmMk==='featherWarm')?.34:pmMk==='wildSilk'?.42:.78;
  MAT[pmMk].metalness=pmMk==='feather'?.14:0;
  MAT[pmMk].side=THREE.DoubleSide;
 }
}
svAnimHooks();
