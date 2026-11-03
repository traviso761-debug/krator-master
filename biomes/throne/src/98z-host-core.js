// ================================================================= HOST — the universal set's host side (2026-11-02, the final rebuild; every page)
// After core/host's shell (90-95: KHOST) and before the page is handed over (99): the reflections switch, whose button goes in the host's panel,
// and the runtime LOD's tick (BIO.LOD cull and fade). 89zz-host-core.js has the rest of the set.
// THE REFLECTIONS (core/water/ext/58; the owner, 2026-11-01): off at page load, for the tri counts; the panel's button or ?mirror=probe|live turns it on
const MIRROR=(typeof WATER!=='undefined'&&WATER.mirrorSwitch&&typeof MIRROR_STILL!=='undefined'&&MIRROR_STILL)?
 WATER.mirrorSwitch(Object.assign({THREE,renderer,scene,camera,sky:SKY,tree:o=>/^biome:impTrees/.test(o.name),hour:()=>ATMOS.clock?ATMOS.clock.hour:0},MIRROR_STILL)):null;
window.MIRROR=MIRROR;
// the runtime LOD: which chunk meshes this camera draws (after the camera is placed, before the draw)
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
