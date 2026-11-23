// ================================================================= DOOR & ROOM-CARD TEXTURE WIRING
// Wire MAT.room (36o-open.js interior backing card) and svHwMat() (door hardware metal) to packed library sets so zero
// door or room-card meshes ever draw as bare untextured MeshStandardMaterials.
if(KMAT.mode==='lib'){
 const rl=KMAT.packed(KIT.pack,'shellrender');
 if(rl&&MAT.room){
  const rt=KMAT.textures(rl,{aniso:TEXANISO});
  MAT.room.map=rt.map;MAT.room.normalMap=rt.normalMap;MAT.room.roughnessMap=rt.roughnessMap;
  MAT.room.userData.lib=rl;matHook(MAT.room,'lib'+KMAT.libKey(rl),sh=>KMAT.libHooks(sh,rl));
 }
 const bl=KMAT.packed(KIT.pack,'brass');
 if(bl&&typeof svHwMat==='function'){
  const hm=svHwMat(),bt=KMAT.textures(bl,{aniso:TEXANISO});
  hm.map=bt.map;hm.normalMap=bt.normalMap;hm.roughnessMap=bt.roughnessMap;
  hm.userData.lib=bl;matHook(hm,'lib'+KMAT.libKey(bl),sh=>KMAT.libHooks(sh,bl));
 }
}
