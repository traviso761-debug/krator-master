// ================================================================= OPENINGS: the village's doors on core/door (the owner, 2026-11-03)
// kits/ancients/src/8zo-anc-open.js (read in place by build.py: DOOR_FILES) draws the kit's windows as panes before room cards
// and records the kit's arched doors as locked KDOOR doors. The village's own door panel (doorD, 71-village.js: a dark box on a
// terrace's riser, the lobby's hexagon of doors, the entrance, the halls) is a door of the same kind: a shut leaf of the
// Ancients' grey alloy on a solid body, a locked record ('<type>/<decay>.doorD.<n>'), not a black plate.
if(KIT.defs.doorD){ANC_DOOR.doorD=[1,1,MAT.ancDoor];KIT.defs.doorD.mat=MAT.ancDoor;}
