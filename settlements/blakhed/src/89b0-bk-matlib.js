// ================================================================= BLAKHED — the material library on the town's ground keys
// settlements/blakhed/materials.json names a library set per key; tools/textures/pack.py packs them into settlements/blakhed/tex/
// and settlements/xanadu/build.py --kit inlines them as KMAT.pack('blakhed') (88x2-kit-matlib-pack.js). This makes the keys and binds
// them in place (as Kirstabal's 89k0 does), so one tile of each world-UV map is one tile of its set. No kit piece draws them: the
// town's ground shader samples their maps in world metres (targets/town/90b-bk-world.js). ?mat=proc binds nothing.
for(const k of['bkTurf','bkDirt','bkFlag','bkTilled','bkPeat','bkYard','bkRuts','bkShingle']){MAT[k]=new THREE.MeshStandardMaterial({map:MAT.stone.map,color:0xffffff,roughness:.95,metalness:0,side:DS});vWorldUV(MAT[k],1/3);}
const BK_MATLIB=(typeof KMAT!=='undefined'&&KMAT.bindMat)?KMAT.bindMat('blakhed',MAT):{};
