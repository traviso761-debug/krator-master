// ================================================================= HOST — the river and the cataract on core/water
// core/water Phases 3 and 4 (core/water/README.md): the river, the cataract and its plunge pool are the records made in
// 45-host-stage.js (RIVER: a flow line; CATARACT: a fall; FALL.pool: still water), drawn here once core/atmos is bound
// (its clock, its wave chunk, the sky's light): the river as its ribbon (falling with its line, the ripples carried down
// the current, white where the bed steepens and along the banks), the cataract as a curtain that arcs from the lip speed
// with streaks that fall with the water and a churned pool where it lands, the pool on the Abyss floor flat and still.
// The sky in the water is core/atmos's skylight: a capture of this page's dome and giant given to the water only (WENV:
// the page's own materials keep their lighting). Its CPU twins: WATER.heightAt, WATER.flowAt; core/export carries all
// three to Godot (godot/krator/water_import.gd draws them). The pond (POND_WATER, 45) is core/water's open surface drawn here too (2026-10-20: it was a disc in the page's own shader).
ATMOS.init({THREE,scene,camera,hour:()=>13,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:5151,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6a4a34)});}
const lin=c=>c.clone().convertSRGBToLinear();
// THE WATER SET (the final rebuild, 2026-10-27; nhighlands' and the Rift's lines; ?wset=0 the old cataract): its spray by the drop (W2: 700 m of
// fall throws a cloud, not a puff), the curtain solid at its lip (lipK: from the rim it read as bare rock) and held toward its foot (footK, the
// tall falls' option: it reached the Abyss floor as a ghost); rain rings on the river, the pool and the pond (R9)
const WSET=new URLSearchParams(location.search).get('wset')!=='0';
const RIVER_DRAW=WATER.drawFlow(RIVER,{shallow:lin(WATER_SHALLOW),deep:lin(WATER_MID),color:0xffffff,roughness:.1,metalness:.05,envMapIntensity:.55,step:8,across:6,margin:1.5,rain:WSET});
RIVER_DRAW.mesh.userData.inspectLabel='The river';
const FALL_DRAW=WATER.drawFall(CATARACT,{color:lin(new THREE.Color().setHSL(WHUE,.4,.7)),opacity:.9,rows:44,cols:8,plungeY:FALL.floor-2.9,spray:WSET?'drop':true,lipK:WSET?.85:null,footK:WSET?.6:null,envMapIntensity:.3});
FALL_DRAW.mesh.userData.inspectLabel='The cataract';FALL_DRAW.plunge.userData.inspectLabel='The plunge pool';FALL.mesh=FALL_DRAW.mesh;
const POOL_DRAW=WATER.drawStill(FALL.pool,{color:lin(WATER_DEEP),roughness:.12,metalness:.05,envMapIntensity:.4,renderOrder:1,rain:WSET});
POOL_DRAW.mesh.userData.inspectLabel='The plunge pool';
// the pond on the Abyss: core/water's open surface (CDLOD mesh, three small wind ripples, the bed baked from terrainH, the shallows' tint over it);
// the mid-water and deep tints are the old disc's, the sky is the skylight's
// the old shader mixed the page's flat sky (0xdfe6ec) into the water, .10 plus up to .62 at a grazing view, so the pond read a pale blue-grey from the rim
// (about 110,150,160 sRGB across the view): the tints are that, not the wadi's saturated teal, which the lit surface would show whole
const POND_DRAW=WATER.draw(POND_WATER,{transparent:true,renderOrder:1,roughness:.08,metalness:.05,envMapIntensity:.6,shallow:lin(new THREE.Color(0x5a8e98)),deep:lin(new THREE.Color(0x3a6a78)),rain:WSET});
POND_DRAW.mesh.userData.inspectLabel='The pond';
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26; here, after ATMOS.init): dry: the south-east desert, rain rare; the haze goes
// the colour of dust and the ground never wets. // It starts clear, so the page looks as it did; the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{dry:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
