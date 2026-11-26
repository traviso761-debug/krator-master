// ================================================================= HOST — the universal set's host side (the final rebuild, pair 8, 2026-11-03)
// After core/host's shell (90-98: KHOST) and before the page is handed over (99): the reflections switch, whose button goes in the host's panel.
// THE REFLECTIONS (core/water/ext/58; the owner, 2026-11-01): off at page load, for the tri counts; the panel's button or ?mirror=probe|live turns it on.
// The page's largest still is the lagoon inside the reef (the sea's own surface: one water level, 0): the mirror is centred on the bay, its probe sphere at
// the lagoon's far shore (the pale band a single probe gives a near shore, core/water/README.md), the live pass skipped past 3.5 km from it
const MIRROR=(typeof WATER!=='undefined'&&WATER.mirrorSwitch)?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[SEA_DRAW.mesh.material],
 level:SEA,center:[BAY.x,BAY.z],radius:BAY.r*1.6,far:3500,tree:o=>/^biome:impTrees/.test(o.name),hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;
window.MIRROR=MIRROR;
