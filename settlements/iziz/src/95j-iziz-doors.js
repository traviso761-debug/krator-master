// ================================================================= 95j. THE DOORS: every leaf 69e5 drew, once the world and its interiors are built
// IZDOOR.finish (core/door's KDOOR.prune and KDOOR.walk) drops the doors of a placement that was unwound (a kit snapshot restored), then puts each door's walk
// blocks into core/walk (KWALK), after the interiors (95i) wrote their floors, walls and stairs: a shut door blocks the
// walker in the gap the wall left for it, an open one does not. The leaves ease open and shut on the frame hook; the
// key (E, near a door) is the host's (99-start.js), and anyone else (an NPC, a quest, _api) calls IZDOOR.open / close.
IZDOOR.finish(typeof KWALK!=='undefined'?KWALK:null);
// a doorway is open: any other block standing in a leaf's own opening (an interiors room wall whose door gap is narrower or set
// beside the builder's door) is switched off there (the owner, 2026-10-20: the Salvagers' front door was walled behind its leaf)
if(typeof KWALK!=='undefined')window._doorwaysCleared=KDOOR.clearDoorways(KWALK);   // core/door: the doorways' other blocks switched off
FRAME_HOOKS.push(dt=>IZDOOR.tick(dt));
if(typeof IZPATCH!=='undefined')IZPATCH.finish();   // the reclaimed towers' seals (78v), one mesh
for(const im of IZDOOR.meshes())im.userData.lodSkip=true;   // core/lod keeps its hands off the leaves: they move
window._doors={doors:IZDOOR.list.length,locked:IZDOOR.list.filter(D=>D.locked).length,blocks:IZDOOR.list.reduce((a,D)=>a+D.blocks.length,0)};
