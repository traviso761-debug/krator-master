// ================================================================= HOST - the Ring Sea and the streams on core/water (the frontier)
// core/water Phase 3 (core/water/README.md), 2026-10-20. The sea was SEA_MAT, a ShaderMaterial on a 220 x 220 grid with a depth attribute (the
// shared wave field of core/atmos, its own foam); it is WATER.open now, on the CDLOD mesh (fine under the camera, coarse to the horizon), with the
// SHORE GRID baked from terrainH (cell 8 m, flooded from the open sea and the bay): the swell shoals toward the black beaches and the headland,
// a breaker train runs in along the coast and calms at the waterline, the beach is wet where the swash reaches (WATER.wetGround on the ground).
// Level SEA, the page's wave field alone (no trochoids: this coast has no swell kit; the field is the shared one at full strength, as it was).
// The streams are WATER.flow, STREAM_FLOWS (84). waterH (47), the CPU twin the checks read, and terrainH are unchanged.
// The sky in the water is core/atmos's skylight: a capture of this dome and the giant, given to the water only (the page's materials keep their light).
const SEA_ENV=new THREE.Scene(),SEA_HOLD={environment:null};
SEA_ENV.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);SEA_ENV.add(g);}
ATMOS.skylight({renderer,sky:SEA_ENV,scene:SEA_HOLD,ground:()=>new THREE.Color(0x2e4a46),key:()=>LIGHT_MODE});
// the sea lies west of u = -1400: x under 300 whatever z (u = .899 x - .438 z, |z| < 3380), so the box stops there
const SEA_BOX=[-3380,-3380,300,3380];
_mark('sea0');
const SEA_WATER=WATER.open({name:'The Ring Sea',level:SEA,field:1,bounds:SEA_BOX,bed:terrainH,bedBox:SEA_BOX,
 shore:{cell:8,band:100,seeds:[xzOf(BAY.u,BAY.p),xzOf(-3000,0)]}});
const SEA_DRAW=WATER.draw(SEA_WATER,{transparent:true,renderOrder:1,roughness:.2,metalness:.05,envMapIntensity:.35,pick:true,
 shallow:new THREE.Color(0x4a8a80).convertSRGBToLinear(),deep:new THREE.Color(0x1a3a46).convertSRGBToLinear()});
SEA_DRAW.mesh.userData.inspectLabel='The Ring Sea';
// pick: true (core/water, 2026-10-21) casts a click at the sea's own surface (its plane at the level, refined by heightAt, inside the flood); it was an invisible
// flat plane over the box. The probe still skips the sea, as it skipped the plane
SEA_DRAW.mesh.userData.probeSkip=true;
// the black sand drinks the swash: dark where it reaches, the film glistening on its way up and back
WATER.wetGround(MAT_GROUND,{surface:SEA_WATER});
// these streams fall 5% to 12% over their length, brisk: core/water's rapids band (a 1.5% grade to white at 12%, a lowland river's) would mottle them,
// so each stream carries its own band, white only past a 10% grade (the flow's `rapids` option, 2026-10-21; it was a page-wide preset)
const STREAM_DRAWS=STREAM_FLOWS.map(F=>{const d=WATER.drawFlow(F,{rapids:[.1,.3],shallow:new THREE.Color(0x4a6a62).convertSRGBToLinear(),deep:new THREE.Color(0x2a4a46).convertSRGBToLinear(),color:0xffffff,roughness:.25,metalness:.05,envMapIntensity:.4,step:10,across:2,margin:1,renderOrder:1});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel='A stream in a lahar valley';return d;});
_mark('sea');
