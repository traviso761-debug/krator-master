// ================================================================= 88y. THE MATERIAL LIBRARY (core/materials/PLAN.md)
// materials.json names, per MAT key (the vernacular's wood, woodV, stone, plaster, thatch, shingle, cloth, dirt and the
// build's own keys), the library set; tools/textures/pack.py packs them into tex/ and build.py inlines them
// (88x-matlib-pack.js). KMAT.bindMat (core/materials/record/26-matlib-bind.js) swaps the maps in place before the rows
// build anything, so one tile of each procedural map (its world-UV K) becomes one tile of the set. ?mat=proc binds
// nothing: the look before the library. [web]: three.js materials.
const MATLIB_BOUND=KMAT.bindMat('port',MAT,{tile:KMAT.ANCIENT_TILES});
(function(){const recs={};for(const k in MAT){const m=MAT[k];if(!m||!m.isMeshStandardMaterial)continue;const L=KMAT.packed('port',k);
 recs[k]={id:'port.'+k,family:k,scale:L?L.scale:(m.userData.uvK?[1/m.userData.uvK,1/m.userData.uvK]:[1,1]),tint:true,roughness:1,
  metal:L?(L.metal||0):0,lib:MATLIB_BOUND[k]?L.lib:null,bake:!MATLIB_BOUND[k]&&!!m.map,hook:m.userData.uvK?'world-uv':null,
  note:MATLIB_BOUND[k]?'library set, tint keep '+L.tint:(m.map?'procedural map':'untextured')};}
 KMAT.adapter('port',recs);window._materials=KMAT.table('port');})();
