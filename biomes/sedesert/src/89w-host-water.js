// ================================================================= HOST — the river and the cataract on core/water
// core/water Phases 3 and 4 (core/water/README.md): the river, the cataract and its plunge pool are the records made in
// 45-host-stage.js (RIVER: a flow line; CATARACT: a fall; FALL.pool: still water), drawn here once core/atmos is bound
// (its clock, its wave chunk, the sky's light): the river as its ribbon (falling with its line, the ripples carried down
// the current, white where the bed steepens and along the banks), the cataract as a curtain that arcs from the lip speed
// with streaks that fall with the water and a churned pool where it lands, the pool on the Abyss floor flat and still.
// The sky in the water is core/atmos's skylight: a capture of this page's dome and giant given to the water only (WENV:
// the page's own materials keep their lighting). Its CPU twins: WATER.heightAt, WATER.flowAt; core/export carries all
// three to Godot (godot/krator/water_import.gd draws them). The pond is still the page's own (45) and core/water's data.
ATMOS.init({THREE,scene,camera,hour:()=>13,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:5151,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6a4a34)});}
const lin=c=>c.clone().convertSRGBToLinear();
const RIVER_DRAW=WATER.drawFlow(RIVER,{shallow:lin(WATER_SHALLOW),deep:lin(WATER_MID),color:0xffffff,roughness:.1,metalness:.05,envMapIntensity:.55,step:8,across:6,margin:1.5});
RIVER_DRAW.mesh.userData.inspectLabel='The river';
const FALL_DRAW=WATER.drawFall(CATARACT,{color:lin(new THREE.Color().setHSL(WHUE,.4,.7)),opacity:.9,rows:44,cols:8,plungeY:FALL.floor-2.9,spray:false,envMapIntensity:.3});
FALL_DRAW.mesh.userData.inspectLabel='The cataract';FALL_DRAW.plunge.userData.inspectLabel='The plunge pool';FALL.mesh=FALL_DRAW.mesh;
const POOL_DRAW=WATER.drawStill(FALL.pool,{color:lin(WATER_DEEP),roughness:.12,metalness:.05,envMapIntensity:.4,renderOrder:1});
POOL_DRAW.mesh.userData.inspectLabel='The plunge pool';
