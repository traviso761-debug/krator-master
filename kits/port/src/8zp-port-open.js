// ================================================================= OPENINGS: the port's doors on core/door (the owner, 2026-11-03)
// kits/ancients/src/8zo-anc-open.js (read in place by build.py: DOOR_FILES) draws the kit's windows as panes before room cards
// (the dead cells and panes were black glass) and records the arched doors as locked KDOOR doors. The port's iron door
// (pkDoor, 72-port-kit.js: a painted plate on a shed, a store, a block's foot, the hangar doors) is a door of the same kind:
// the buildings are solid bodies, so each is a shut leaf, locked, recorded '<type>/<decay>.pkDoor.<n>'. A door the ruin threw
// down (laid flat in the rubble) is no door any more and is not recorded (ANC_OPEN.fallen).
if(typeof ANC_DOOR!=='undefined'&&KIT.defs.pkDoor)ANC_DOOR.pkDoor=[1,1,MAT.pkIron];
