// TARGET: xanadu — rows by family (laid out by xaLayout in 90-scene.js), front (+z) toward the camera.
const TITLE='Xanadu Building Kit';
const XA_VARIANTS=true;
const XA_SKIP=/^xa_cit_/;   // Erewhon's citadel buildings are on the kit's own sheet (kits/xanadu, 2026-11-10) and in Erewhon: not here, under the 6M cap   // every def at every variant, v0 first (the old separate variants page is folded in)
const XA_EXTRA=[].filter(S=>VERN.defs[S.key]);   // whole-settlement pieces shown after the rows
const SITES=[];
