// ================================================================= 90. THE DOORS: each leaf handed to the host after a bake
// The kit's doors (kits/xanadu/src/71c-xa-openings.js and the Vernacular's openings, 69e5) are records in core/door's KDOOR,
// each leaf an instance of the kit item vDoorLeaf. A page bakes once (the kit's rows: 90-scene.js) or chunk by chunk
// (Erewhon's 90b, which empties the kit's items after each chunk, so a leaf's index is its chunk's): xaDoorsBind(), after
// every bake and before the items are emptied, hands each new door to the host (KDOORHOST.instanced) with the InstancedMesh it
// baked into; the host eases the moving ones on the frame, and E opens the one within reach (99-start.js). Every door here
// is locked (the kit's bodies are solid, and the pages have no core/walk to block), so none moves until a builder draws a
// room behind one; an NPC or a quest calls KDOOR.open / close by id.
window._doors={doors:0,locked:0,panes:0,voids:0};
function xaDoorsBind(){const im=KIT.meshes.vDoorLeaf,W=window._doors;
 for(const k of['vWinClear','vWinLit','xStainedB','xFrostedB','xGlass'])W.panes+=(KIT.items[k]||[]).length;
 W.voids+=(KIT.items.vDarkB||[]).length;   // what is left of vDarkB: wells, shafts, ovens and kilns (71c)
 if(im)im.userData.lodSkip=true;   // core/lod keeps its hands off the leaves: they move
 for(const D of KDOOR.list)if(!D.draw&&im){KDOORHOST.instanced(D,im,D.idx,D.q0,D.ref.s);W.doors++;if(D.locked)W.locked++;}
 return W.doors;}
xaDoorsBind();
FRAME_HOOKS.push(dt=>KDOORHOST.tick(dt));
