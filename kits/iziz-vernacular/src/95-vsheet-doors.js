// ================================================================= 95. THE KIT SHEET: the doors, once the world is built and baked
// Every door the kit drew (the Vernacular's openings, 69e5, and a kit's own: Highlands' 71c-hl-openings.js, Xanadu's
// 71c-xa-openings.js) is a record in core/door's KDOOR, each leaf an instance of the kit item vDoorLeaf. Here, after the bake
// (90-vsheet-scene.js): IZDOOR.finish drops the doors of a placement that was unwound (KDOOR.prune) and puts each door's walk
// blocks in core/walk (KDOOR.walk: shut = blocked); KDOOR.clearDoorways switches off any other block standing in a doorway
// (an interiors room wall: the ?interiors=1 mode a sheet may add, as Highlands' page has); each door is handed to core/door's
// host (KDOORHOST.posed: IZDOOR poses its leaves), which eases the moving ones on the frame; E opens the one within reach
// (99-vsheet-start.js). The sheets build the kits solid, so their doors are drawn locked: an NPC or a quest (KDOOR.open / close
// by id) or a room behind one unlocks it. (Highlands' 95-hl-doors.js, generalised; Iziz's 95j and Xanadu's 90-xa-doors.js
// did the same through IZDOOR's own tick.)
IZDOOR.finish(KWALK);
window._doorwaysCleared=KDOOR.clearDoorways(KWALK);
for(const D of KDOOR.list)KDOORHOST.posed(D,D=>{IZDOOR._pose(D);IZDOOR._flush();});   // IZDOOR poses every leaf of a door (a pair, a styled leaf's glass)
FRAME_HOOKS.push(dt=>KDOORHOST.tick(dt));
for(const im of IZDOOR.meshes())im.userData.lodSkip=true;   // a page with core/lod keeps its hands off the leaves: they move
window._doors={doors:KDOOR.list.length,locked:KDOOR.list.filter(D=>D.locked).length,blocks:KDOOR.list.reduce((a,D)=>a+D.blocks.length,0),
 panes:(SHEET.panes||['vWinClear','vWinLit']).reduce((a,k)=>a+((KIT.items[k]||[]).length),0),
 voids:(KIT.items.vDarkB||[]).length};   // what is left of vDarkB: furnace and oven mouths, wells, shafts, drains (not openings: README.md)
