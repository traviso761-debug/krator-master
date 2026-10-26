// ================================================================= HOST - the river, the acid pools and the tarn on core/water
// core/water Phases 3 and 4 (core/water/README.md), 2026-10-20: RIVER (a flow line, 45-host-stage.js), POOL_STILLS and TARN_STILL
// (still discs) drawn here. The river as core/water's ribbon (the ripples carried down the current, white on the steepening bed and along
// the banks; pale teal, as the old shader showed its vertex colours under the sky mixed in), each pool as its own still surface with its own colour (a draw per pool: the
// pools' acid green, yellow, turquoise), the tarn deep blue-green. The sky in the water is core/atmos's skylight, a capture of this
// page's dome and giant given to the water only (WENV: the page's own materials keep their lighting). BIO.waterH is unchanged.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x7a5a44)});}
const RIVER_DRAW=WATER.drawFlow(RIVER,{shallow:new THREE.Color(0x5a9ea8).convertSRGBToLinear(),deep:new THREE.Color(0x3a7480).convertSRGBToLinear(),color:0xffffff,roughness:.1,metalness:.05,envMapIntensity:.6,step:20,across:4,margin:1.5,renderOrder:1});
RIVER_DRAW.mesh.userData.probeSkip=true;RIVER_DRAW.mesh.userData.inspectLabel='The river';
// one tint per pool: the old fan ran from the pool's colour at the middle to the same lightened .35 toward 0xf0f0d0 at the rim, so a pool is drawn the mean
const POOL_DRAWS=POOL_STILLS.map((S,i)=>{const c=POOL_C[i%POOL_C.length],d=WATER.drawStill(S,{color:c.clone().lerp(new THREE.Color(0xf0f0d0),.15).convertSRGBToLinear(),roughness:.12,metalness:.05,envMapIntensity:.35,renderOrder:1});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel='A sulphur pool';return d;});
const TARN_DRAW=WATER.drawStill(TARN_STILL,{color:new THREE.Color(0x2e6070).convertSRGBToLinear(),roughness:.1,metalness:.05,envMapIntensity:.4,renderOrder:1});
TARN_DRAW.mesh.userData.probeSkip=true;TARN_DRAW.mesh.userData.inspectLabel='The tarn';
