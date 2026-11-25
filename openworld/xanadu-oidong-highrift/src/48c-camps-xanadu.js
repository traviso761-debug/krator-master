// ================================================================= XANADU'S REGIONS — the Sultanate's camps on core/world's KWCAMPS
// [G data] settlements/xanadu/WORKS-PLAN.md sections 3 and 4 (step W2). The pitched camps are core/world's (48w KWCAMPS: the
// Golden Tears' fortified ring, the Great Caravan's halt; Stage 8 T26, 2026-11-24, replacing this region's own 48t and 88t);
// what is the Sultanate's is registered here, so core/world knows no tune: the Tears' camp's people (core/region/data/xan-tune.js
// XAN_TUNE.tears.camp, read in place) and the tune's calendar windows (XAN_TUNE.calendar.windows: 'rift-season' and the rest,
// year days). The camps themselves are the region's WORLD_CAMPS (src/48-world-site.js, SITE_SPEC.camps: baked into
// plan/sites.json by core/world/bake_sites.py, which reads this file through build.py's CAMPS_JS). Read in place by
// openworld/xanadu-lake-shore too. No THREE, no DOM.
KWCAMPS.people('xan-tears',()=>XAN_TUNE.tears.camp.people)
 .calendar('xan-tune',name=>{const W=typeof XAN_TUNE!=='undefined'&&XAN_TUNE.calendar&&XAN_TUNE.calendar.windows[name];return W?[W.slice()]:null;});
