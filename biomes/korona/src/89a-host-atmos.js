// ================================================================= HOST - the atmosphere (core/atmos), bound
// ATMOS.bindHost (core/atmos/host/89-atmos-c-hostbind.js): core/atmos's one-time init on this page's frame ticks, ground and camera,
// so core/water (the stream, the pools: 89w-host-water.js) and its wave field and skylight can take it. The binding alone draws
// nothing and changes no page value. The hour is the page's sun, fixed (13): the page has no night yet (KNOWN_ISSUES.md).
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>13,seed:(STAGE.seed==null?11:STAGE.seed)+4400,viewH:()=>innerHeight});
