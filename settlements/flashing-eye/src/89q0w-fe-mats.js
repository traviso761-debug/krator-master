// ================================================================= THE FLASHING EYE — the cone's ground sets
// materials.json's families for the cone (feColumnar: rock.columnar, the band's colonnade; feAsh: ground.ash, the cap and the
// rim; feScoria: ground.scoria, the crater's walls and the rampart; feCinder: ground.cinder, the crater's floor and the talus),
// made here as MAT keys before kits/qiblai's 89q0z binds the page's pack ('qiblai', which holds them with the kit's own), so
// KMAT.bindMat gives each its library maps. No kit item draws them: the page's ground shader samples their maps in world
// metres (targets/cone/90fe-world.js). ?mat=proc binds nothing and the ground falls back to the stone map.
for(const [k,t] of[['feColumnar',6],['feAsh',4],['feScoria',4],['feCinder',3]]){MAT[k]=new THREE.MeshStandardMaterial({map:MAT.stone.map,color:0xffffff,roughness:.95,metalness:0,side:DS});vWorldUV(MAT[k],1/t);}
// feRoof (roof.tile: barrel tiles, a grey detail map the piece's red colours): the revamp's red tiled roofs (the owner, 2026-11-23),
// drawn by 89qe's roof shapes; double-sided, so the eaves read from below
MAT.feRoof=new THREE.MeshStandardMaterial({map:MAT.stone.map,color:0xffffff,roughness:.78,metalness:0,side:THREE.DoubleSide});vWorldUV(MAT.feRoof,1/2.4);
