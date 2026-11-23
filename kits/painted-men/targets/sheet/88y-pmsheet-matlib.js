// ================================================================= 88y. THE MATERIAL LIBRARY (core/materials/PLAN.md): Painted Men sheet bind
// Binds the 16 packed PBR and Tlingit/Pacific-NW frieze families of kits/painted-men/materials.json (shared in place from
// kits/highlands/tex/ by build.py) onto MAT before the rows build. ?mat=proc leaves procedural maps untouched.
const MATLIB_ALIAS={pmFormF:'formF'};
const MATLIB_REPEAT={pmFormF:[4,1],hFrzA:[1,1],hFrzT:[1,1]};
const MATLIB_OLDREP={};for(const k in MATLIB_REPEAT)if(MAT[k]&&MAT[k].map)MATLIB_OLDREP[k]=MAT[k].map.repeat.clone();
const MATLIB_BOUND=KMAT.bindMat('painted-men',MAT,{tile:Object.assign({meadow:3200},KMAT.ANCIENT_TILES),alias:MATLIB_ALIAS});
for(const k in MATLIB_REPEAT){if(!MATLIB_BOUND[k]||!MATLIB_OLDREP[k])continue;const m=MAT[k],o=MATLIB_OLDREP[k],f=MATLIB_REPEAT[k];
 [m.map,m.normalMap,m.roughnessMap].forEach(t=>{if(t)t.repeat.set(o.x*f[0],o.y*f[1]);});}
(function(){const recs={};for(const k in MAT){const m=MAT[k];if(!m||!m.isMeshStandardMaterial)continue;const L=KMAT.packed('painted-men',MATLIB_ALIAS[k]||k);
 recs[k]={id:'painted-men.'+k,family:k,scale:L?L.scale:(m.userData.uvK?[1/m.userData.uvK,1/m.userData.uvK]:[1,1]),tint:true,roughness:1,
  metal:L?(L.metal||0):0,lib:MATLIB_BOUND[k]?L.lib:null,bake:!MATLIB_BOUND[k]&&!!m.map,hook:m.userData.uvK?'world-uv':null,
  note:MATLIB_BOUND[k]?'library set, tint keep '+L.tint:(m.map?'procedural map':'untextured')};}
 KMAT.adapter('painted-men',recs);window._materials=KMAT.table('painted-men');})();
