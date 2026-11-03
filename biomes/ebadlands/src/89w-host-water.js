// ================================================================= HOST - the river, the acid pools and the tarn on core/water
// core/water Phases 3 and 4 (core/water/README.md), 2026-10-20: RIVER (a flow line), POOL_STILLS and TARN_STILL (still discs: 45-host-stage.js, from the
// land's records) drawn here. The river as core/water's ribbon (the ripples carried down the current, white on the steepening bed and along the banks),
// each pool as its own still surface with its own colour (the pools' acid green, yellow, turquoise), the tarn deep blue-green. The sky in the water is
// core/atmos's skylight, a capture of this page's dome and giant given to the water only. BIO.waterH is the land's.
// The final rebuild (2026-11-02): the river's and the stills' glints broken up (ext/56, the eastabyss look; ?breakup=0), and rain rings on them all
// (the weather's wet ground reads them); THE REFLECTIONS SWITCH (ext/58) on the tarn, the land's largest still: off at page load (the owner,
// 2026-11-01: so the tri counts do not rise), the panel's button or ?mirror=probe|live turns it on (99-host-take.js).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x7a5a44)});}
const RIVER_DRAW=RIVER?WATER.drawFlow(RIVER,{shallow:new THREE.Color(LAND.riverLook?LAND.riverLook[0]:0x5a9ea8).convertSRGBToLinear(),deep:new THREE.Color(LAND.riverLook?LAND.riverLook[1]:0x3a7480).convertSRGBToLinear(),
 color:0xffffff,roughness:.1,metalness:.05,envMapIntensity:.6,step:20,across:4,margin:1.5,renderOrder:1}):null;
if(RIVER_DRAW){RIVER_DRAW.mesh.userData.probeSkip=true;RIVER_DRAW.mesh.userData.inspectLabel=RIVER.name||'The river';}
// one tint per pool: the old fan ran from the pool's colour at the middle to the same lightened .35 toward 0xf0f0d0 at the rim, so a pool is drawn the mean
const POOL_DRAWS=POOL_STILLS.map((S,i)=>{const c=POOL_C[i%POOL_C.length],d=WATER.drawStill(S,{color:c.clone().lerp(new THREE.Color(0xf0f0d0),.15).convertSRGBToLinear(),roughness:.12,metalness:.05,envMapIntensity:.35,renderOrder:1});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel='A sulphur pool';return d;});
const TARN_DRAW=TARN_STILL?WATER.drawStill(TARN_STILL,{color:new THREE.Color(TARN.colour==null?0x2e6070:TARN.colour).convertSRGBToLinear(),roughness:.1,metalness:.05,envMapIntensity:.4,renderOrder:1}):null;
if(TARN_DRAW){TARN_DRAW.mesh.userData.probeSkip=true;TARN_DRAW.mesh.userData.inspectLabel=TARN.name||'The tarn';}
{const WQ=new URLSearchParams(location.search);if(WQ.get('breakup')!=='0'&&WATER.breakupAll){WATER.breakupAll();if(RIVER)WATER.breakupFlows();}}
