// ================================================================= QIBLAI — the material library on Qiblai's own materials
// kits/qiblai/materials.json names a library set per Qiblai MAT key; tools/textures/pack.py packs them into kits/qiblai/tex/
// and settlements/xanadu/build.py --kit inlines them as KMAT.pack('qiblai') (88x2-kit-matlib-pack.js). This makes the keys
// and binds them in place, as kits/pylon's 88yp does, so one tile of each world-UV map becomes one tile of its set; the
// Xanadu kit's materials Qiblai draws in are bound by Xanadu's own pack (88y). ?mat=proc binds nothing.
// qAshlar: the dressed ashlar (plinths, terrace platforms, the ring walls' base courses), a 3 m tile, tinted by QSTONE.
MAT.qAshlar=new THREE.MeshStandardMaterial({map:MAT.stone.map,color:0xffffff,roughness:.85,metalness:0,side:DS});vWorldUV(MAT.qAshlar,1/3);
kdef('qAshB',VBOX,MAT.qAshlar);kdef('qCubeA98',QBAT98,MAT.qAshlar);kdef('qCubeA96',XBAT96,MAT.qAshlar);
// the city's ground (settlements/qiblai): the Af country's grass, the blocks' made ground, the lay streets' cobbles, the
// avenues' and the kora's flagstones; the city's ground shader samples their maps in world metres (no kit item draws them)
for(const k of['qGrass','qDirt','qCobble','qFlag']){MAT[k]=new THREE.MeshStandardMaterial({map:MAT.stone.map,color:0xffffff,roughness:.95,metalness:0,side:DS});vWorldUV(MAT[k],1/3);}
const QB_MATLIB=(typeof KMAT!=='undefined'&&KMAT.bindMat)?KMAT.bindMat('qiblai',MAT):{};
