// ================================================================= 95. THE DOORS: every leaf the kit drew, once the world is built
// The kit's doors (kits/highlands/src/71c-hl-openings.js and the Vernacular's openings, 69e5) are records in core/door's
// KDOOR, each leaf an instance of the kit item vDoorLeaf. Here, after the bake (90-scene.js; Roketstad's 90b): IZDOOR.finish
// drops the doors of a placement that was unwound (KDOOR.prune) and puts each door's walk blocks in core/walk (KDOOR.walk:
// shut = blocked); KDOOR.clearDoorways switches off any other block standing in a doorway (an interiors room wall, Roketstad's
// ?interiors=1); each leaf is handed to the host (KDOORHOST.instanced), which eases the moving ones on the frame; E opens the
// one within reach (99-start.js). The kit's bodies are solid, so its doors are drawn locked; with the interiors on
// (?interiors=1) a door that opens onto a furnished room is unlocked (89y-hl-furnish.js), and the walker, the E key, an NPC
// or a quest (KDOOR.open / close by id) opens it.
IZDOOR.finish(KWALK);
window._doorwaysCleared=KDOOR.clearDoorways(KWALK);
{const im=()=>KIT.meshes.vDoorLeaf;for(const D of KDOOR.list)KDOORHOST.instanced(D,im,D.idx,D.q0,D.ref.s);}
FRAME_HOOKS.push(dt=>KDOORHOST.tick(dt));
if(KIT.meshes.vDoorLeaf)KIT.meshes.vDoorLeaf.userData.lodSkip=true;   // core/lod keeps its hands off the leaves: they move
window._doors={doors:KDOOR.list.length,locked:KDOOR.list.filter(D=>D.locked).length,blocks:KDOOR.list.reduce((a,D)=>a+D.blocks.length,0),
 panes:['vWinClear','vWinLit','hStainedB','hFrostedB','hKeelGlass','hArchGlass'].reduce((a,k)=>a+((KIT.items[k]||[]).length),0),
 voids:(KIT.items.vDarkB||[]).length};   // what is left of vDarkB: flues, fireboxes, wells, shafts, trenches, scorch (71c)
