// ================================================================= ROKETSTAD: the Ancients' openings as a guest
// The town's Ancients pieces (82a-82e: the fuel farm, the starport, the launch site, the bunker, the AA towers) take the Ancients
// kit's openings (kits/ancients/src/8zo-anc-open.js, read in place by build.py): their windows a pane before the room card,
// their arched doors locked core/door records. The page hosts its doors already (95-hl-doors.js ticks KDOORHOST, 99-start.js
// takes E), so 8zo comes as a guest: no second tick, E handler or tip.
window.ANC_OPEN_GUEST=true;
