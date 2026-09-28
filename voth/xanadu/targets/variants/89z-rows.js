// TARGET: variants — every def at o.v = 1 and 2, side by side, rows by family (laid out by xaLayout in 90-scene.js).
const TITLE='Xanadu Building Kit — variants';
const XA_VARIANTS=true;   // every def at v = 1 … nv-1 (5 variants for residential and other non-civic defs, 3 for civic)
const XA_EXTRA=[].filter(S=>VERN.defs[S.key]);
const SITES=[];
