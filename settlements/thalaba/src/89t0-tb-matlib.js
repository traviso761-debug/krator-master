// ================================================================= THALABA — the material library on the town's ground keys
// settlements/thalaba/materials.json names a library set per key; tools/textures/pack.py packs them into settlements/thalaba/
// tex/ and settlements/xanadu/build.py --kit inlines them as KMAT.pack('thalaba') (88x2-kit-matlib-pack.js). This makes the
// keys and binds them in place, as kits/qiblai's 89q0z does; no kit item draws them: the town's ground shader samples their
// maps in world metres (targets/town/90q-tb-world.js). ?mat=proc binds nothing.
for(const k of['tGrass','tDirt','tCobble','tField']){MAT[k]=new THREE.MeshStandardMaterial({map:MAT.stone.map,color:0xffffff,roughness:.95,metalness:0,side:DS});vWorldUV(MAT[k],1/3);}
const TB_MATLIB=(typeof KMAT!=='undefined'&&KMAT.bindMat)?KMAT.bindMat('thalaba',MAT):{};
// the Dalab mission's own surfaces (gen/69v-dalab-pack.js: the rammed earth, the reliefs, three murals), bound in place on Dalab's
// keys as Dalab's 88y binds them (its ANCIENT_TILES); only the packed families bind, so Xanadu's shared keys keep the Xanadu pack
const TB_DALAB_MATLIB=(typeof KMAT!=='undefined'&&KMAT.bindMat&&KMAT.packed&&KMAT.packed('dalab','dRammed'))?KMAT.bindMat('dalab',MAT,{tile:KMAT.ANCIENT_TILES}):{};
