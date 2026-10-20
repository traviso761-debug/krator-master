// ================================================================= THE KIT'S MATERIALS: what the vendored svLibMat does not know
// 27-mat.js (the Scyvoi engine, vendored) builds every SV_LIB key as one lit standard material. Two kinds want more, set
// here so the engine stays byte for byte the Scyvoi kit's:
//   the pierced bronze screens are keyed cut-outs (core/materials/patterns/eternian/screen-pierced, cards.py): alpha
//   tested and seen from both faces;
//   the onyx and alabaster are lights in the bronze tracery: their own map is their emissive map, so the stone glows
//   from behind (91n-night.js turns the emissive up at night like every lit material).
for(const k of ['screen','screenB']){const m=MAT[k];if(!m)continue;m.alphaTest=.5;m.side=THREE.DoubleSide;m.transparent=false;}
for(const k of ['onyx','alabaster']){const m=MAT[k];if(!m||!m.map)continue;m.emissive.setHex(0xffffff);m.emissiveMap=m.map;m.emissiveIntensity=.22;}
