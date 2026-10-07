// ================================================================= 88y. THE MATERIAL LIBRARY ON THE VERNACULAR AND THE ANCIENTS MAT
// materials.json names, per vernacular MAT key (69b-vern-mat.js: wood, woodV, stone, plaster, thatch, shingle, cloth,
// dirt), the library set; tools/textures/pack.py packs them into tex/ and build.py inlines them (69d-matlib-pack.js).
// KMAT.bindMat (core/materials/record/26-matlib-bind.js) swaps the maps in place, so one tile of each procedural map
// (its world-UV K) becomes one tile of the set. ?mat=proc binds nothing: the look before the library.
// [web]: three.js materials.
const IZIZ_MATLIB=KMAT.bindMat('iziz',MAT,{tile:KMAT.ANCIENT_TILES});
(function(){const recs={};for(const k in MAT){const m=MAT[k];if(!m||!m.isMeshStandardMaterial)continue;const L=KMAT.packed('iziz',k);
 recs[k]={id:'iziz.'+k,family:k,scale:L?L.scale:(m.userData.uvK?[1/m.userData.uvK,1/m.userData.uvK]:[1,1]),tint:true,roughness:1,
  metal:L?(L.metal||0):0,lib:IZIZ_MATLIB[k]?L.lib:null,bake:!IZIZ_MATLIB[k]&&!!m.map,hook:m.userData.uvK?'world-uv':null,
  note:IZIZ_MATLIB[k]?'library set, tint keep '+L.tint:(m.map?'procedural map':'untextured')};}
 KMAT.adapter('iziz',recs);window._materials=KMAT.table('iziz');})();
