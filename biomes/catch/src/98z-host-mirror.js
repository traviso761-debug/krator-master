// ================================================================= HOST — the reflections switch (core/water ext/58; the final rebuild, pair 11, 2026-11-09)
// BACKPORT.md section 1: WATER.mirrorSwitch on the station's largest water, OFF at page load (the host panel's button cycles off, probe, live;
// ?mirror=probe or ?mirror=live asks at load). The lake station's terminal lake (one open surface), the oasis's largest spring pool, the fan's
// pool at its toe; the sand sea has none. Centred on the drawn surface's box, at its level. HOST_DRAW is the frame's draw 99 hands KHOST.take.
const MIRROR=(function(){if(typeof WATER==='undefined'||!WATER.mirrorSwitch)return null;let best=null,bs=0;
 for(const k in WATER_DRAW){const m=WATER_DRAW[k].mesh;if(!m||!m.geometry)continue;m.updateMatrixWorld();const g=m.geometry;if(!g.boundingBox)g.computeBoundingBox();
  const b=g.boundingBox.clone().applyMatrix4(m.matrixWorld),s=(b.max.x-b.min.x)*(b.max.z-b.min.z);if(s>bs){bs=s;best={m,b};}}
 if(!best)return null;const b=best.b,cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2,r=Math.max(b.max.x-b.min.x,b.max.z-b.min.z)/2;
 return WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[best.m.material],level:b.max.y,center:[cx,cz],radius:Math.min(r*1.3,TERR.R*1.5),far:TERR.R*2.5,
  tree:o=>o.name==='biome:impTrees',hour:()=>ATMOS.clock?ATMOS.clock.hour:0});})();
window.MIRROR=MIRROR;
const HOST_DRAW=MIRROR?()=>{MIRROR.update();SKY.render();}:()=>SKY.render();
