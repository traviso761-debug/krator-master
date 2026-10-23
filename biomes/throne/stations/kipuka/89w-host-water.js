// ================================================================= HOST - the streams on core/water (the kipuka)
// core/water Phase 3 (core/water/README.md), 2026-10-20: STREAM_FLOWS (a WATER.flow per run of each stream's open water, 84-host-ground.js)
// drawn as core/water's ribbon: the ripples carried down the current, white where the bed steepens and along the banks, the sky in the
// water from core/atmos's skylight (a capture of this station's dome and giant, recaptured at each light mode, given to the water only:
// WENV, the page's own materials keep their lighting). Night: the page's lights darken the standard material, as the old shader's multiplier did.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x2e4a3a),key:()=>LIGHT_MODE});}
// these streams fall 3% to 12% over their length, brisk but not a cascade: core/water's rapids band (a 1.5% grade to white at 12%, a lowland river's) would mottle
// them all, so each stream carries its own band, white only past a 10% grade (the flow's `rapids` option, 2026-10-21; it was a page-wide preset)
const STREAM_DRAWS=STREAM_FLOWS.map(F=>{const d=WATER.drawFlow(F,{rapids:[.1,.3],shallow:new THREE.Color(0x5a7a62).convertSRGBToLinear(),deep:new THREE.Color(0x2e4a3e).convertSRGBToLinear(),color:0xffffff,roughness:.2,metalness:.05,envMapIntensity:.4,step:10,across:2,margin:1,renderOrder:1});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel='A stream';return d;});
