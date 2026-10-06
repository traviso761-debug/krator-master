// ================================================================= 88y. THE MATERIAL LIBRARY (core/materials/PLAN.md)
// materials.json names, per MAT key (the vernacular's wood, woodV, stone, plaster, thatch, shingle, cloth, dirt and the
// build's own keys), the library set; tools/textures/pack.py packs them into tex/ and build.py inlines them
// (88x-matlib-pack.js). KMAT.bindMat (core/materials/record/26-matlib-bind.js) swaps the maps in place before the rows
// build anything, so one tile of each procedural map (its world-UV K) becomes one tile of the set. ?mat=proc binds
// nothing: the look before the library. [web]: three.js materials.
// The colour pattern sheets (patterns/highlands) on mesh-UV'd lathes, tents and bands: the glazed fish-scale tile of the
// Temple of the Pantheon's dome and spires and the wall towers (hTile*), the green harlequin dome (hHarlG) and the
// arcology's labyrinth band (hMazeBand, an alias of hMaze). Their procedural maps carry a repeat of their own (9 x 3 round
// the great dome); the set keeps it, scaled by MATLIB_REPEAT so a scale or diamond stays its old size (the sets hold
// about 10 scales across and 20 rows where the painter drew 8 and 12, and 4 diamonds a side where it drew 1). The
// world-UV tile twins of 88-hl-dress.js clone the procedural TEX[key] and stay procedural.
const MATLIB_ALIAS={hMazeBand:'hMaze'};
const MATLIB_REPEAT={hTileD:[.8,.6],hTileS:[.8,.6],hTileT:[.8,.6],hTileW:[.8,.6],hHarlG:[.25,.25],hMazeBand:[1,1]};
const MATLIB_OLDREP={};for(const k in MATLIB_REPEAT)if(MAT[k]&&MAT[k].map)MATLIB_OLDREP[k]=MAT[k].map.repeat.clone();
const MATLIB_BOUND=KMAT.bindMat('highlands',MAT,{tile:KMAT.ANCIENT_TILES,alias:MATLIB_ALIAS});
for(const k in MATLIB_REPEAT){if(!MATLIB_BOUND[k]||!MATLIB_OLDREP[k])continue;const m=MAT[k],o=MATLIB_OLDREP[k],f=MATLIB_REPEAT[k];
 [m.map,m.normalMap,m.roughnessMap].forEach(t=>{if(t)t.repeat.set(o.x*f[0],o.y*f[1]);});}
(function(){const recs={};for(const k in MAT){const m=MAT[k];if(!m||!m.isMeshStandardMaterial)continue;const L=KMAT.packed('highlands',MATLIB_ALIAS[k]||k);
 recs[k]={id:'highlands.'+k,family:k,scale:L?L.scale:(m.userData.uvK?[1/m.userData.uvK,1/m.userData.uvK]:[1,1]),tint:true,roughness:1,
  metal:L?(L.metal||0):0,lib:MATLIB_BOUND[k]?L.lib:null,bake:!MATLIB_BOUND[k]&&!!m.map,hook:m.userData.uvK?'world-uv':null,
  note:MATLIB_BOUND[k]?'library set, tint keep '+L.tint:(m.map?'procedural map':'untextured')};}
 KMAT.adapter('highlands',recs);window._materials=KMAT.table('highlands');})();
