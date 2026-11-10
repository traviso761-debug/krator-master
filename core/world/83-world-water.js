// ================================================================= OPEN WORLD — the water: core/atmos bound, the named rivers on core/water
// [draw] Binds core/atmos (the clock, the shared wave field, the sky's light) for every water this world draws, and draws
// the named rivers as core/water's flow (Phase 3; core/water/README.md "Flow and falls"): each river is WORLD.riverLines'
// line (a point every 40 m down its carved bed, brought back from the carve's warped space, at its water's height: 4.6 m
// over the floor, a pool of up to 2 m held behind a sill, following the floor where it climbs further) made a WATER.flow,
// its ribbon following the line, the ripples carried down the current, white where the bed steepens and along the banks;
// its vertices local to the river's middle (a world a million metres across). WATER.fallsOf finds the line's steep reaches
// (over 35 %, 15 m or more, down the valley's mouth): they stay rapids on the ribbon, not curtains, as no cliff is drawn
// along a named river's corridor; one reach from the valley's head to the lake at Locus. The sea and the lakes are
// 83w-world-seas.js. Until 2026-10-13 one sheet per terrain chunk carried the sea, the lakes and the rivers, each vertex at
// its own level (and the name WATER, now core/water's global).
var RIVERS;LATE.push(()=>{RIVERS=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera;
ATMOS.init({THREE,scene,camera,hour:()=>11.5,onFrame:fn=>HOST.TICKS.push(fn),ground:(x,z)=>WORLD.H(x,z),seed:4242,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>HOST.renderer.getPixelRatio()});
const list=[];
for(const R of WORLD.riverLines(40)){if(R.pts.length<2)continue;
 // the current: 1 m/s on the flat, faster as the bed steepens (the line's own slope), at most 4 m/s
 const sp=R.pts.map((p,i)=>{const q=R.pts[Math.min(i+1,R.pts.length-1)],L=Math.hypot(q[0]-p[0],q[1]-p[1])||1;return Math.min(4,1+40*Math.max(0,(p[2]-q[2])/L));});
 const F=WATER.flow({name:R.name,pts:R.pts,width:R.width*.85,speed:sp}),falls=WATER.fallsOf(F,{steep:.35,minDrop:15});
 const D=WATER.drawFlow(F,{shallow:0x6d9c92,deep:0x1d3c48,roughness:.14,metalness:.08,envMapIntensity:.45,step:20,across:6,margin:6,origin:true,renderOrder:2});
 D.mesh.userData.inspectLabel=R.name;list.push({R,F,D,falls});}
return{list,stats:()=>list.map(e=>({name:e.R.name,points:e.R.pts.length,vertices:e.D.ribbon.count,falls:e.falls.length,drop:+(e.R.pts[0][2]-e.R.pts[e.R.pts.length-1][2]).toFixed(1)}))};
})();});
