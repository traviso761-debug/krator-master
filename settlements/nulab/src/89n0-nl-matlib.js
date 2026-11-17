// ================================================================= NULAB — the material library on the town's ground keys, and Dalab's own
// settlements/nulab/materials.json names a library set per key; tools/textures/pack.py packs them into settlements/nulab/tex/ and
// settlements/xanadu/build.py --kit inlines them as KMAT.pack('nulab') (88x2-kit-matlib-pack.js). This makes the keys and binds
// them in place, as Kirstabal's 89k0 does; no kit piece draws them: the town's ground shader samples their maps in world metres
// (targets/town/90n-nl-world.js). Then the Dalab set's own surfaces (gen/69n3-dalab-pack.js, trimmed to the families its pieces
// draw), bound in place on Dalab's keys as Dalab's 88y binds them and Thalaba's 89t0 does; only the packed families bind, so the
// Xanadu pack keeps the shared keys (wood, stone, plaster). ?mat=proc binds nothing.
for(const k of['nlGrass','nlDirt','nlEarth','nlFlag','nlSand','nlTilled']){MAT[k]=new THREE.MeshStandardMaterial({map:MAT.stone.map,color:0xffffff,roughness:.95,metalness:0,side:DS});vWorldUV(MAT[k],1/3);}
const NL_MATLIB=(typeof KMAT!=='undefined'&&KMAT.bindMat)?KMAT.bindMat('nulab',MAT):{};
const NL_DALAB_MATLIB=(typeof KMAT!=='undefined'&&KMAT.bindMat&&KMAT.packed&&KMAT.packed('dalab','dRammed'))?KMAT.bindMat('dalab',MAT,{tile:Object.assign({dTurfMesh:64},KMAT.ANCIENT_TILES),alias:{dMuralP6:'dMural6',dTurfMesh:'dTurf'}}):{};
if(NL_DALAB_MATLIB.dBanner&&MAT.dBanner){MAT.dBanner.alphaTest=.5;MAT.dBanner.needsUpdate=true;}
