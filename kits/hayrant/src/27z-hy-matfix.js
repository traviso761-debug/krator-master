// ================================================================= MATERIAL REFINEMENTS: library maps on engine fallbacks, screens & dual nephrite/alabaster glow
// Runs immediately after 27-mat.js and 27v-hy-vstack.js:
//   - Re-applies svLibMat onto MAT.plain, MAT.brass, MAT.bone, and MAT.flag (which 27-mat.js reset after its SV_LIB loop)
//     so 100% of kits/resources ore veins and engine hardware carry decoded library textures.
//   - Sets alphaTest on Eternian pierced bronze screens (screen, screenB) and emissive translucency on alabaster, onyx,
//     thin-sawn emerald nephrite/jade, and Ancient talking-head screens (faces).
//   - Tunes roughness/metalness across megabreccia, loess, celadon glaze, kaen-doki terracotta, ancestor metals, and SV_CLOTH.
svLibMat('plain',{rough:.84});
svLibMat('brass',{rough:.36,metal:.78});
svLibMat('bone',{rough:.56});
svLibMat('flag',{rough:.82});
for(const hyK of ['screen','screenB']){
 const m=MAT[hyK];if(!m)continue;
 m.alphaTest=.5;m.side=THREE.DoubleSide;m.transparent=false;
}
for(const hyK of ['onyx','alabaster']){
 const m=MAT[hyK];if(!m||!m.map)continue;
 m.emissive.setHex(0xffffff);m.emissiveMap=m.map;m.emissiveIntensity=.22;
}
if(MAT.jade&&MAT.jade.map){
 MAT.jade.roughness=.24;MAT.jade.metalness=.06;
 MAT.jade.emissive.setHex(0x287850);MAT.jade.emissiveMap=MAT.jade.map;MAT.jade.emissiveIntensity=.16;
}
if(MAT.nephrite){MAT.nephrite.roughness=.28;MAT.nephrite.metalness=.06;}
if(MAT.faces&&MAT.faces.map){MAT.faces.emissive.setHex(0xffffff);MAT.faces.emissiveMap=MAT.faces.map;MAT.faces.emissiveIntensity=.85;}
if(MAT.megabreccia)MAT.megabreccia.roughness=.86;
if(MAT.basalt)MAT.basalt.roughness=.84;
if(MAT.columnar)MAT.columnar.roughness=.78;
if(MAT.ashlar)MAT.ashlar.roughness=.48;
if(MAT.loess)MAT.loess.roughness=.88;
if(MAT.celadon)MAT.celadon.roughness=.34;
if(MAT.glaze)MAT.glaze.roughness=.3;
if(MAT.kaen)MAT.kaen.roughness=.68;
if(MAT.whalebone)MAT.whalebone.roughness=.54;
if(MAT.tarwood)MAT.tarwood.roughness=.44;
if(MAT.totemWood)MAT.totemWood.roughness=.52;
if(MAT.bronze){MAT.bronze.roughness=.38;MAT.bronze.metalness=.72;}
if(MAT.gold){MAT.gold.roughness=.32;MAT.gold.metalness=.82;}
if(MAT.silver){MAT.silver.roughness=.34;MAT.silver.metalness=.78;}
if(MAT.gunmetal){MAT.gunmetal.roughness=.42;MAT.gunmetal.metalness=.68;}
if(MAT.lead){MAT.lead.roughness=.48;MAT.lead.metalness=.54;}
if(MAT.titanium){MAT.titanium.roughness=.32;MAT.titanium.metalness=.76;}
if(MAT.white){MAT.white.roughness=.30;MAT.white.metalness=.26;}
for(const hyCc of ['cyberChassis','cyberChassisB']){
 const m=MAT[hyCc];if(!m)continue;
 m.roughness=.42;m.metalness=.48;
}
for(const hyMz of ['maze','mazeB','mazeC']){
 const m=MAT[hyMz];if(!m)continue;
 m.roughness=.36;m.metalness=.56;
 if(m.map){m.emissive.setHex(0x28565c);m.emissiveMap=m.map;m.emissiveIntensity=.24;}
}
for(const hyCf of ['cyberForm','cyberFormB','cyberFormC']){
 const m=MAT[hyCf];if(!m)continue;
 m.roughness=.52;m.metalness=.18;
 if(m.map){m.emissive.setHex(0x1e444a);m.emissiveMap=m.map;m.emissiveIntensity=.16;}
}
if(MAT.verdigris){MAT.verdigris.roughness=.52;MAT.verdigris.metalness=.45;}
if(MAT.water){MAT.water.roughness=.26;MAT.water.metalness=0;MAT.water.opacity=.94;MAT.water.envMapIntensity=.48;MAT.water.needsUpdate=true;}
for(const hyMk of ['plaid','hemp','hide','netting','chime','flag','sign']){
 if(MAT[hyMk]){
  MAT[hyMk].roughness=hyMk==='chime'?.24:hyMk==='sign'?.56:.74;
  MAT[hyMk].side=THREE.DoubleSide;
 }
}
svAnimHooks();
