// TARGET: xanadu — rows by family (laid out by xaLayout in 90-scene.js), front (+z) toward the camera.
const TITLE='Xanadu Building Kit';
const XA_VARIANTS=true;   // every def at every variant, v0 first (the old separate variants page is folded in)
const XA_EXTRA=[].filter(S=>VERN.defs[S.key]);   // whole-settlement pieces shown after the rows
const SITES=[];
