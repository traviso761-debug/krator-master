// ================================================================= 88y. THE SHEET'S MATERIAL LIBRARY: the kit's pack on MAT
// materials.json (the kit's: Iziz's rows for the vernacular MAT keys of 69b-vern-mat.js and the shared Ancients MAT) names,
// per MAT key, the library set; tools/textures/pack.py packs them into tex/ and build.py loads them as the page's sidecar
// (88x-matlib-pack.js). KMAT.bindMat (core/materials/record/26-matlib-bind.js) swaps the maps in place, so one tile of each
// procedural map (its world-UV K, or KMAT.ANCIENT_TILES) becomes one tile of the set; ?mat=proc binds nothing (the look before
// the library). Iziz's own bind (settlements/iziz/src/88y-iziz-matlib.js: the city's aliases, the late tables) is the city's;
// this is the kit's part of it. Every bound or procedural MeshStandardMaterial is a KMAT record (window._materials) naming its
// shader-library hook: 'world-uv' where vWorldUV tiles it in metres, 'breakup' where the library's break-up runs, 'glass'.
const VSHEET_MATLIB=KMAT.bindMat('iziz-vernacular',MAT,{tile:KMAT.ANCIENT_TILES});
function vsheetMatHook(m,L){const h=[];if(m.userData.uvK)h.push('world-uv');if(m.userData.lib&&L&&L.breakup)h.push('breakup');
 if(MAT.glass&&(m===MAT.glass||m.onBeforeCompile===MAT.glass.onBeforeCompile))h.push('glass');return h.length?h.join('+'):null;}
(function vsheetMatRecords(){const recs={};
 for(const k in MAT){const m=MAT[k];if(!m||!m.isMeshStandardMaterial)continue;const L=m.userData.lib?KMAT.packed('iziz-vernacular',k):null,K=m.userData.uvK||0;
  recs[k]={id:'iziz-vernacular.'+k,family:k,colour:'#'+m.color.getHexString(),scale:L?L.scale.slice():(K?[1/K,1/K]:[1,1]),tint:true,
   roughness:Math.min(1,m.roughness),metal:Math.min(1,m.metalness),specular:L&&L.specular!=null?L.specular:.5,
   emissive:m.emissive&&m.emissiveIntensity>0&&m.emissive.getHex()?'#'+m.emissive.getHexString():null,doubleSided:m.side===THREE.DoubleSide,
   breakup:L&&L.breakup?L.breakup:null,lib:L?L.lib:null,bake:!L&&!!m.map,hook:vsheetMatHook(m,L),
   note:L?'library set '+L.lib+', tint keep '+(L.tint&&L.tint.keep):(m.map?'procedural map':'untextured')};}
 KMAT.adapter('iziz-vernacular',recs);window._materials=KMAT.table('iziz-vernacular');})();
