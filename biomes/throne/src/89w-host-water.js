// ================================================================= HOST - the acid lake and the hot pools on core/water (station 1)
// 2026-10-26 (the water migration, the last stations): before, the lake and the pools were discs of the page's own ShaderMaterial
// (MAT_WATER, 84: a vertex colour from the middle to the rim, a ripple and a sun glint). Now:
//   THE ACID LAKE  a WATER.still over its 48-gon at PIT.lake, the milky turquoise of Ijen's from the middle (0x58b8a8) to the rim
//                  (0x8ad0b0) as the still surface's gradient (at 60% brightness: the old shader was unlit, the still surface takes the
//                  page's sun and sky light; at full brightness it read near white), with core/water's ripple and the sky in it (core/atmos's skylight,
//                  a capture of this page's dome and giant, given to the water only: WENV, the page's own materials keep their light)
//   THE HOT POOLS  WATER.spring (core/water/geyser): banded from the middle out by temperature, deep blue where it boils, the mats
//                  (green, yellow, orange) reaching in as it cools; the old discs' blue-green with an orange rim, banded. The disc is
//                  the old one's 1.45 r (the level is the lowest of the ring at 1.3 r); temp is divided by 1.45 so the mats begin where
//                  they would on a disc of r. Each pool's steam stays the page's (84).
// waterH (47) is unchanged: the checks and the camera read it. One draw per surface, as before (four).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x4a4640),key:()=>LIGHT_MODE});}
const LAKE_POLY=[];for(let k=0;k<48;k++){const a=k/48*TAU;LAKE_POLY.push([PIT.x+Math.cos(a)*PIT.r*.98,PIT.z+Math.sin(a)*PIT.r*.98]);}
const ACID_LAKE=WATER.still({name:'The acid lake',level:PIT.lake,poly:LAKE_POLY,gradient:{centre:0x356e65,rim:0x537d6a,at:[PIT.x,PIT.z],radius:PIT.r*.98}});
const ACID_DRAW=WATER.drawStill(ACID_LAKE,{roughness:.35,metalness:.05,envMapIntensity:.15,renderOrder:1});
ACID_DRAW.mesh.userData.probeSkip=true;ACID_DRAW.mesh.userData.inspectLabel='The acid lake';
// the springs' uniforms are the page's: the clock on the frame ticks, the light by the light mode (as MAT_WATER's uLight was)
const SPRINGU={uT:{value:0},uSun:{value:new THREE.Vector3(...SUN_POS).normalize()},uSky:{value:new THREE.Color(0xd8d6ce)},uLight:{value:1}};
const POOL_TEMP=[.95,.75,.6],HOT_POOLS=POOLS.map((P,i)=>WATER.spring({key:'s1pool'+i,name:'A hot pool',x:P.x,z:P.z,r:P.r*1.45,level:POOLL[i],temp:POOL_TEMP[i%3]/1.45,boil:POOL_TEMP[i%3]>.9?1:0,steam:0}));
const HOT_DRAWS=HOT_POOLS.map(S=>{const d=WATER.drawSpring(S,{THREE,scene,uniforms:SPRINGU,fog:scene.fog,renderOrder:1});d.mesh.userData.probeSkip=true;return d;});
TICKS.push(dt=>{SPRINGU.uT.value+=dt;});
_onLight.push(m=>{SPRINGU.uLight.value=m==='night'?.18:1;});
// the reflections switch (core/water/ext/58; 89zz-host-core.js installs it, off at page load): the acid lake is the page's largest still
const MIRROR_STILL={materials:[ACID_DRAW.mesh.material],level:PIT.lake,center:[PIT.x,PIT.z],radius:PIT.r,far:2500};
