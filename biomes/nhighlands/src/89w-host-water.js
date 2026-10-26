// ================================================================= HOST - the stream, its falls and the tarn on core/water
// core/water Phases 3 and 4 (core/water/README.md), 2026-10-20: the stream (STREAM_FLOW, the flow line made in 45-host-stage.js along
// STREAM.P at STREAM.level), its two falls (STREAM_FALLS: WATER.fallsOf's slope breaks, each a curtain that arcs from the lip) and the
// tarn (TARN_STILL, a still disc at its level) are drawn here: the stream as core/water's ribbon (ripples carried down the current, white
// on the cascades and along the banks), the falls as streaked curtains with a churned plunge pool, the tarn flat and still, all with the
// sky in the water from core/atmos's skylight (a capture of this page's dome and giant, recaptured at each light mode, given to the water
// only: WENV, the page's own materials keep their lighting; a forest stream mirrors the banks and canopy, so the ground colour is green).
// The water takes the page's lights (day, dawn, night: 82's setLightMode) as any standard material does; the old shader's own multiplier is gone.
// The mist stays 84's sprites. BIO.waterH and terrainH are unchanged.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x2c3a2c),key:()=>LIGHT_MODE});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
// a mountain stream: its mean grade is 17% (core/water's default rapids run from a 1.5% grade to white at 12%, a lowland river's), so the stream carries its
// own band, the old foam's (white from a 20% grade, full at 100%: the cascades and the two chutes): the flow's `rapids` option (2026-10-21; it was the page-wide preset)
const STREAM_DRAW=WATER.drawFlow(STREAM_FLOW,{rapids:[.2,1],shallow:lin(0x66706c),deep:lin(0x34403f),color:0xffffff,roughness:.22,metalness:.05,envMapIntensity:.35,step:12,across:6,margin:1.2,renderOrder:2});
STREAM_DRAW.mesh.userData.probeSkip=true;STREAM_DRAW.mesh.userData.inspectLabel='The stream';
const FALL_DRAWS=STREAM_FALLS.map((F,k)=>{const D=WATER.drawFall(F,{color:lin(0xc8d4d4),opacity:.9,rows:30,cols:6,spray:false,envMapIntensity:.25,renderOrder:3});
 D.mesh.userData.probeSkip=true;D.mesh.userData.inspectLabel=k?'The waterfall':'The upper fall';D.plunge.userData.probeSkip=true;D.plunge.userData.inspectLabel='The plunge pool';return D;});
const TARN_DRAW=WATER.drawStill(TARN_STILL,{color:lin(0x3a4640),roughness:.12,metalness:.05,envMapIntensity:.45,renderOrder:1});
TARN_DRAW.mesh.userData.probeSkip=true;TARN_DRAW.mesh.userData.inspectLabel='The tarn';
