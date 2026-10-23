// ================================================================= HOST — the wind and the water on core/atmos and core/water
// core/atmos bound for this stage (its core, presets, export, the wave chunk and the sky's light: build.py CORE_ATMOS).
// THE WIND is ATMOS's: its base is the kit's prevailing wind (NSEMIARID.WIND), slowly veering, times ATMOS.windScale, with
// the gust fronts it sends downwind (ATMOS.windAt). One unit of it is WIND_MS metres a second here. The wind setting
// (the panel's select, or ?wind=calm|breeze|high) sets the scale the weather would: calm 0.4, a breeze 1 (the steppe's
// ordinary afternoon, gusting to ~9 m/s), high 2.6 (a gale gusting past 20 m/s), eased in over a few seconds. What rides
// it: the trumpets' spin (86-host-variants.js reads NSWIND.spin), the seed weather and the seeds the wind tears loose
// (89c-host-seeds.js). In Godot the same numbers are atm_wind (core/atmos/GODOT.md).
// THE WATER is core/water's: the records 45b-host-stage.js made and lists in STAGE_WATER, drawn here
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
// THE FOLIAGE rides it too: the biome core's sway grows with its strength and the foliage leans downwind (BIO.init's
// wind, 1 = the calm breeze: one unit of ATMOS's wind here); the variants' trees read the same uniforms (86)
BIO.host.wind=()=>{const w=ATMOS.U.wind.value;return[w.x,w.y];};
// THE DUST (core/atmos 3d-dust, 2026-10-23): lifted where the wind there passes the threshold, off bare dry ground only:
// the dry steppe, the old bed's silt and the dunes most, nothing off water, the green upland or the stream's banks
const NS_DUST_MASK=(x,z)=>waterH(x,z)>-1e8?0:smooth(.42,.22,FC.at(FC.a.wet,x,z))*(.5+.5*Math.max(FC.at(FC.a.bed,x,z),FC.at(FC.a.dune,x,z)));
ATMOS.dust({color:[.74,.66,.52],mask:NS_DUST_MASK});
// THE FURLERS (2026-10-22) shut as a gust passes and open behind it: each flower reads core/atmos's own gust where it
// stands (atmWind, the shaders' twin of ATMOS.windAt) and closes as the wind there passes its hold (7.2 m/s; a breeze
// gusts to ~9, so a gust front crosses a field as a wave of closing flowers; a gale keeps them shut, a calm open). The
// kit places them open when the host animates them (NSEMIARID.liveGusts, 88-host-build.js). FURLER_HOLD is in m/s
const FURLER_HOLD=7.2;
{const CH=ATMOS.GLSL_WIND+'\nuniform float uAtmT;uniform vec2 uAtmW;uniform float uAtmGA;';
 const SHUT='{vec2 _ip=vec2(0.0);\n#ifdef USE_INSTANCING\n_ip=instanceMatrix[3].xz;\n#endif\n'+
  'float _ws=length(atmWind(uAtmT,_ip,uAtmW,uAtmGA))*'+ATMOS.glf(NSWIND.WIND_MS)+';float _k=smoothstep('+ATMOS.glf(FURLER_HOLD-1.5)+','+ATMOS.glf(FURLER_HOLD+1.5)+',_ws);'+
  'transformed.xz*=mix(1.0,0.28,_k);transformed.y*=mix(1.0,1.78,_k);}';
 scene.traverse(m=>{if(!m.isInstancedMesh||m.name!=='biome:furler')return;const base=m.material,mat=base.clone(),pre=base.onBeforeCompile;
  mat.onBeforeCompile=(sh,r)=>{pre.call(base,sh,r);sh.uniforms.uAtmT=ATMOS.U.time;sh.uniforms.uAtmW=ATMOS.U.wind;sh.uniforms.uAtmGA=ATMOS.U.gustAmp;
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+CH).replace('#include <begin_vertex>','#include <begin_vertex>\n'+SHUT);};
  mat.customProgramCacheKey=()=>'nsemiarid-furler-gust';m.material=mat;m.userData.liveGusts=true;});}
// the setting, on the panel (99-host-take.js hands it to the host as a control)
const WIND_CONTROL={select:[['breeze','wind: a breeze'],['calm','wind: calm'],['high','wind: high']],id:'windsel',on:v=>NSWIND.set(v)};
if(NSWIND.mode!=='breeze')WIND_CONTROL.select.sort((a,b)=>(b[0]===NSWIND.mode)-(a[0]===NSWIND.mode));
// the water
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));env.add(giant.clone());
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x8a7a62)});}
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
// the stage's water (45b-host-stage.js STAGE_WATER: a record and its look, colours sRGB), drawn in its order
const WATER_DRAW={};
for(const e of STAGE_WATER){const L=Object.assign({},e.look);for(const c of ['color','shallow','deep'])if(L[c]!=null)L[c]=lin(L[c]);
 const d=WATER_DRAW[e.key]=e.flow?WATER.drawFlow(e.rec,L):WATER.drawStill(e.rec,L);d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=e.rec.name;}
