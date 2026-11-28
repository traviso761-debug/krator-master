// ================================================================= MATERIAL REFINEMENTS: library maps on engine fallbacks, quartz sheen & harmonics
// Runs immediately after 27-mat.js and 27v-hs-vstack.js:
//   - Re-applies svLibMat onto MAT.plain, MAT.brass, MAT.bone, and MAT.flag (which 27-mat.js reset after its SV_LIB loop)
//     so 100% of kits/resources ore veins and engine hardware carry decoded library textures.
//   - Tunes roughness/metalness/sheen across snow-white milky quartz, rock-crystal prisms, pale pegmatite granite, blue-grey
//     slate, sawn emerald-nephrite lithophones, elliptic bianzhong bronze bells, Ancient Hush-pylon alloy & SV_CLOTH membranes.
svLibMat('plain',{rough:.82});
svLibMat('brass',{rough:.34,metal:.78});
svLibMat('bone',{rough:.58});
svLibMat('flag',{rough:.8});
if(MAT.quartz){
 MAT.quartz.roughness=.26;MAT.quartz.metalness=.04;
 if(MAT.quartz.map){MAT.quartz.emissive.setHex(0xdce6f4);MAT.quartz.emissiveMap=MAT.quartz.map;MAT.quartz.emissiveIntensity=.08;}
}
if(MAT.crystal){
 MAT.crystal.roughness=.16;MAT.crystal.metalness=.06;
 if(MAT.crystal.map){MAT.crystal.emissive.setHex(0xe8f2fc);MAT.crystal.emissiveMap=MAT.crystal.map;MAT.crystal.emissiveIntensity=.14;}
}
if(MAT.alabaster)MAT.alabaster.roughness=.3;
if(MAT.granite)MAT.granite.roughness=.78;
if(MAT.ashlar)MAT.ashlar.roughness=.72;
if(MAT.slate)MAT.slate.roughness=.58;
if(MAT.slateWall)MAT.slateWall.roughness=.68;
if(MAT.paving)MAT.paving.roughness=.76;
if(MAT.cobble)MAT.cobble.roughness=.8;
if(MAT.cypress)MAT.cypress.roughness=.64;
if(MAT.birch)MAT.birch.roughness=.68;
if(MAT.wood)MAT.wood.roughness=.72;
if(MAT.bark)MAT.bark.roughness=.82;
for(const nk of ['nephrite','chimeNephrite','jade']){
 if(MAT[nk]){
  MAT[nk].roughness=.22;MAT[nk].metalness=.06;
  if(MAT[nk].map){MAT[nk].emissive.setHex(0x1f6e4c);MAT[nk].emissiveMap=MAT[nk].map;MAT[nk].emissiveIntensity=.13;}
 }
}
if(MAT.bronze){MAT.bronze.roughness=.34;MAT.bronze.metalness=.74;}
if(MAT.chimeBronze){MAT.chimeBronze.roughness=.28;MAT.chimeBronze.metalness=.78;}
if(MAT.verdigris){MAT.verdigris.roughness=.48;MAT.verdigris.metalness=.48;}
if(MAT.copper){MAT.copper.roughness=.34;MAT.copper.metalness=.74;}
if(MAT.iron){MAT.iron.roughness=.48;MAT.iron.metalness=.6;}
if(MAT.hushWhite){
 MAT.hushWhite.roughness=.32;MAT.hushWhite.metalness=.26;
 if(MAT.hushWhite.map){MAT.hushWhite.emissive.setHex(0xc8dcf0);MAT.hushWhite.emissiveMap=MAT.hushWhite.map;MAT.hushWhite.emissiveIntensity=.09;}
}
if(MAT.hushAlloy){MAT.hushAlloy.roughness=.28;MAT.hushAlloy.metalness=.68;}
if(MAT.water){MAT.water.roughness=.16;MAT.water.metalness=.08;MAT.water.opacity=.92;MAT.water.envMapIntensity=.56;MAT.water.needsUpdate=true;}
for(const hsMk of ['linen','felt','netting','flag','chimeBronze','chimeNephrite']){
 if(MAT[hsMk]){
  if(hsMk==='felt')MAT[hsMk].roughness=.88;
  else if(hsMk==='linen'||hsMk==='flag'||hsMk==='netting')MAT[hsMk].roughness=.76;
  MAT[hsMk].side=THREE.DoubleSide;
 }
}
svAnimHooks();
