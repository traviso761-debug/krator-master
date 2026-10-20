// ================================================================= THE KIT'S MATERIALS: what the vendored svLibMat does not know
// 27-mat.js (the Scyvoi engine, vendored) builds every SV_LIB key as one lit standard material. Two kinds want more, set
// here so the engine stays byte for byte the Scyvoi kit's:
//   the pierced bronze screens are keyed cut-outs (core/materials/patterns/eternian/screen-pierced, cards.py): alpha
//   tested and seen from both faces;
//   the onyx and alabaster are lights in the bronze tracery: their own map is their emissive map, so the stone glows
//   from behind (91n-night.js turns the emissive up at night like every lit material).
for(const k of ['screen','screenB']){const m=MAT[k];if(!m)continue;m.alphaTest=.5;m.side=THREE.DoubleSide;m.transparent=false;}
for(const k of ['onyx','alabaster']){const m=MAT[k];if(!m||!m.map)continue;m.emissive.setHex(0xffffff);m.emissiveMap=m.map;m.emissiveIntensity=.22;}
/* the talking heads' faces are screens: their sheet is their own light (the Ancients' terminals, woken by the Machine Talkers) */
if(MAT.faces&&MAT.faces.map){MAT.faces.emissive.setHex(0xffffff);MAT.faces.emissiveMap=MAT.faces.map;MAT.faces.emissiveIntensity=.85;}
/* the canals' water: the vendored material is a mirror (roughness .08) and read the sky pale at a low angle; rougher,
   duller and nearly opaque it reads as deep water (the owner's review, 2026-10-20) */
if(MAT.water){MAT.water.roughness=.3;MAT.water.metalness=0;MAT.water.opacity=.94;MAT.water.envMapIntensity=.45;MAT.water.needsUpdate=true;}
