// ================================================================= NULAB — the material library on the town's ground keys, and Dalab's full sidecar pack
// settlements/nulab/materials.json names a library set per key; tools/textures/pack.py packs them into settlements/nulab/tex/ and
// settlements/xanadu/build.py --kit writes them as KMAT.pack('nulab') (88x2-kit-matlib-pack.js, maps in xanadu.tex.nulab.js under
// sidePacks: true). Then Dalab's 23 d* surfaces (gen/69n3-dalab-pack.js + dist/nulab.tex.dalab.js), bound in place on Dalab's keys
// as Dalab's 88y binds them (including all 8 plane mural aliases, checker, deco panels and dTurfMesh); shared keys (wood, stone,
// plaster) stay on Xanadu's pack. ?mat=proc binds nothing.
for(const k of['nlGrass','nlDirt','nlEarth','nlFlag','nlSand','nlTilled']){MAT[k]=new THREE.MeshStandardMaterial({map:MAT.stone.map,color:0xffffff,roughness:.95,metalness:0,side:DS});vWorldUV(MAT[k],1/3);}
const NL_MATLIB=(typeof KMAT!=='undefined'&&KMAT.bindMat)?KMAT.bindMat('nulab',MAT):{};
const NL_DALAB_ALIAS={dMuralP:'dMural',dMuralP1:'dMural1',dMuralP2:'dMural2',dMuralP3:'dMural3',dMuralP4:'dMural4',dMuralP5:'dMural5',dMuralP6:'dMural6',dMuralP7:'dMural7',vpMosaic:'dMosaic',dTurfMesh:'dTurf'};
const NL_DALAB_MATLIB=(typeof KMAT!=='undefined'&&KMAT.bindMat&&KMAT.packed&&KMAT.packed('dalab','dRammed'))?KMAT.bindMat('dalab',MAT,{tile:Object.assign({dTurfMesh:64},KMAT.ANCIENT_TILES),alias:NL_DALAB_ALIAS}):{};
if(NL_DALAB_MATLIB.dBanner&&MAT.dBanner){MAT.dBanner.alphaTest=.5;MAT.dBanner.needsUpdate=true;}
