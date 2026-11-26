// ================================================================= KIRSTABAL — the material library on the town's ground keys
// settlements/kirstabal/materials.json names a library set per key; tools/textures/pack.py packs them into settlements/kirstabal/tex/
// and settlements/xanadu/build.py --kit inlines them as KMAT.pack('kirstabal') (88x2-kit-matlib-pack.js). This makes the keys and
// binds them in place (as kits/qiblai's 89q0z does), so one tile of each world-UV map is one tile of its set. No kit piece draws
// them: the town's ground shader samples their maps in world metres (targets/town/90k-ks-world.js). ?mat=proc binds nothing.
for(const k of['ksGrass','ksDirt','ksCobble','ksFlag','ksSand','ksTilled']){MAT[k]=new THREE.MeshStandardMaterial({map:MAT.stone.map,color:0xffffff,roughness:.95,metalness:0,side:DS});vWorldUV(MAT[k],1/3);}
const KS_MATLIB=(typeof KMAT!=='undefined'&&KMAT.bindMat)?KMAT.bindMat('kirstabal',MAT):{};
