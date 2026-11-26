// ================================================================= HOST — the reflections switch (core/water ext/58; the final rebuild, 2026-11-03)
// BACKPORT.md section 1: WATER.mirrorSwitch on the station's largest still, OFF at page load (the host panel's button cycles off, probe, live;
// ?mirror=probe or ?mirror=live asks at load). Only where a station has a lake (89w: a pool over 400 m, its own mesh): the basin's Tiers' lake and the
// trenches' salt lake (both arms at one level); the potholes, the melt pools and the hollow's pools are too small to want it. HOST_DRAW is the
// frame's draw every 99 hands KHOST.take.
const MIRROR=(function(){const M=window._lakes;if(!M||!WATER.mirrorSwitch)return null;
 const P=STAGE.pools.filter(p=>p.r>400&&!p.ice);if(!P.length)return null;
 let cx=0,cz=0;P.forEach(p=>{cx+=p.x;cz+=p.z;});cx/=P.length;cz/=P.length;const r=Math.max(...P.map(p=>Math.hypot(p.x-cx,p.z-cz)+p.r));
 return WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[M.material],level:P[0].y,center:[cx,cz],radius:Math.min(r,STAGE.R*1.5),far:STAGE.R*2.5,
  tree:o=>o.name==='biome:impTrees',hour:()=>ATMOS.clock?ATMOS.clock.hour:0});})();
const HOST_DRAW=MIRROR?()=>{MIRROR.update();SKY.draw();}:SKY.draw;
