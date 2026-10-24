// ================================================================= HOST - the dry-season pools on core/water (the savanna)
// core/water Phase 4 (core/water/README.md), 2026-10-20: POOL_STILLS (a WATER.still disc per pool at its own level, 84-host-ground.js) drawn
// as core/water's still surfaces: flat at the level with a faint ripple, the sky in them from core/atmos's skylight (a capture of this
// station's dome and giant, recaptured at each light mode, given to the water only: WENV, the page's own materials keep their lighting).
// Before, each pool was a Lambert disc at .86 opacity: the same colour and opacity, now with the ripple and the sky; night darkens the colour as before.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6a6a44),key:()=>LIGHT_MODE});}
// pick: true (core/water, 2026-10-21): each pool's mesh keeps its ray cast and takes the probe's samples, so the inspector's click and the probe's occupancy of
// the pool's registered volume (84) see the pool itself (there was an invisible flat disc per pool for this, while the water's raycast was off and probeSkip on)
const POOL_DRAWS=POOL_STILLS.map((S,i)=>{const d=WATER.drawStill(S,{color:0x5a6a5a,opacity:.86,roughness:.2,metalness:.05,envMapIntensity:.3,renderOrder:1,pick:true});
 d.mesh.userData.inspectLabel=POOLS[i].name;return d;});
_onLight.push(m=>{for(const d of POOL_DRAWS)d.material.color.setHex(m==='night'?0x101814:0x5a6a5a);});
