// ================================================================= HOST — the wind and the water on core/atmos and core/water
// core/atmos bound for this stage (its core, presets, export, the wave chunk and the sky's light: build.py CORE_ATMOS).
// THE WIND is ATMOS's: its base is the kit's prevailing wind (NSEMIARID.WIND), slowly veering, times ATMOS.windScale, with
// the gust fronts it sends downwind (ATMOS.windAt). One unit of it is WIND_MS metres a second here. The wind setting
// (the panel's select, or ?wind=calm|breeze|high) sets the scale the weather would: calm 0.4, a breeze 1 (the steppe's
// ordinary afternoon, gusting to ~9 m/s), high 2.6 (a gale gusting past 20 m/s), eased in over a few seconds. What rides
// it: the trumpets' spin (86-host-variants.js reads NSWIND.spin), the seed weather and the seeds the wind tears loose
// (89c-host-seeds.js). In Godot the same numbers are atm_wind (core/atmos/GODOT.md).
// THE WATER is core/water's: the records 45-host-stage.js made (LAKE_W and POOL_W still water, STREAM a flow), drawn here
// with core/atmos's clock and wave chunk, the sky in them core/atmos's skylight (a capture of this page's dome and giant,
// given to the water only).
ATMOS.PRESETS.wind.base=[WIND[0]/Math.hypot(WIND[0],WIND[1]),WIND[1]/Math.hypot(WIND[0],WIND[1])];
ATMOS.init({THREE,scene,camera,hour:()=>14,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:61,err:reportErr,
 viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const NSWIND=(function(){const WIND_MS=6,SCALE={calm:.4,breeze:1,high:2.6};
 const Q=new URLSearchParams(location.search);let mode=SCALE[Q.get('wind')]!=null?Q.get('wind'):'breeze';
 ATMOS.windScale=SCALE[mode];
 const W={WIND_MS,SCALE,get mode(){return mode;},spin:0,
  set(m){if(SCALE[m]!=null)mode=m;},
  // the wind at (x,z) now, in m/s: [vx, vz, speed]
  at(x,z){const w=ATMOS.windAt(ATMOS.clock.t,x,z),vx=w[0]*WIND_MS,vz=w[1]*WIND_MS;return[vx,vz,Math.hypot(vx,vz)];},
  // the mean wind (no gusts), m/s
  mean(){const w=ATMOS.U.wind.value;return Math.hypot(w.x,w.y)*WIND_MS;}};
 // the scale eases toward the setting (the weather's own rate, core/atmos 4-weather); the trumpets' spin angle is the mean
 // wind integrated (an anemometer: about a turn every 2.5 s in a breeze, two a second in a gale)
 ATMOS.hook((t,hr,dt)=>{ATMOS.windScale+=(SCALE[mode]-ATMOS.windScale)*Math.min(1,dt*.4);W.spin+=W.mean()*.42*dt;});
 return W;})();
// the setting, on the panel (99-host-take.js hands it to the host as a control)
const WIND_CONTROL={select:[['breeze','wind: a breeze'],['calm','wind: calm'],['high','wind: high']],id:'windsel',on:v=>NSWIND.set(v)};
if(NSWIND.mode!=='breeze')WIND_CONTROL.select.sort((a,b)=>(b[0]===NSWIND.mode)-(a[0]===NSWIND.mode));
// the water
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));env.add(giant.clone());
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x8a7a62)});}
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
// a steppe stream is narrow (14 m): core/water's bank foam, sized for rivers, whitened most of it; this page's share is less
WATER.PRESETS.flow.foam=[.5,.2];
const WATER_DRAW={
 lake:WATER.drawStill(LAKE_W,{color:lin(0x4a8e86),roughness:.1,metalness:.05,envMapIntensity:.45,opacity:.72,renderOrder:1}),
 pool:WATER.drawStill(POOL_W,{color:lin(0x2a6a6c),roughness:.08,metalness:.05,envMapIntensity:.4,renderOrder:1}),
 stream:WATER.drawFlow(STREAM,{shallow:lin(0x4e8478),deep:lin(0x24564e),color:0xffffff,roughness:.12,metalness:.05,envMapIntensity:.5,step:8,across:4,margin:1.5})};
for(const k in WATER_DRAW){const m=WATER_DRAW[k].mesh;m.userData.probeSkip=true;m.userData.inspectLabel=k==='lake'?LAKE_W.name:k==='pool'?POOL_W.name:STREAM.name;}
