// ================================================================= HOST - the water on core/water
// The fold river, the cave stream and the gorge stream (FLOWS: WATER.flow records along each course at its level, made in
// 45-host-stage.js) as core/water's ribbons (ripples carried down the current, white where the bed steepens and along the banks),
// the gorge's falls (GORGE_FALLS: WATER.fallsOf's slope breaks) as streaked curtains with churned plunge pools, the sink a still
// disc; the sky in the water from core/atmos's skylight (a capture of the shared sky, recaptured at each light mode, given to the
// water only). W1/W2: the curtains reach the ribbon's margin, the ribbons chute where the bed falls, spray scales with each drop;
// every water takes the rain's rings (R9). The river is gin-clear green over its gravels (refs/35-38).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x2c3a2c),key:()=>LIGHT_MODE});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const FLOW_DRAWS=FLOWS.map((F,k)=>{const C=COURSES[k],steep=C.key==='gorge';
 const D=WATER.drawFlow(F,{rapids:steep?[.15,.9]:[.02,.14],shallow:lin(steep?0x6e8078:0x6a9a86),deep:lin(steep?0x2e4a44:0x1e4a42),color:0xffffff,roughness:.2,metalness:.05,
  envMapIntensity:.35,step:steep?4:10,across:steep?3:6,margin:1.2,chute:steep?.6:.5,rain:true,renderOrder:C.join?1:2});   /* a tributary first: the river it joins draws over its end */
 D.mesh.userData.probeSkip=true;D.mesh.userData.inspectLabel=C.name;return D;});
const FALL_DRAWS=GORGE_FALLS.map(F=>{const D=WATER.drawFall(F,{color:lin(0xc8d4d4),opacity:.9,rows:24,cols:5,margin:1.2,lipK:.85,spray:'drop',rain:true,envMapIntensity:.25,renderOrder:3});
 D.mesh.userData.probeSkip=true;D.mesh.userData.inspectLabel='The gorge\'s falls (through the natural bridges)';D.plunge.userData.probeSkip=true;D.plunge.userData.inspectLabel='A plunge pool';return D;});
const SINK_DRAW=WATER.drawStill(SINK_STILL,{color:lin(0x1e3a36),roughness:.14,metalness:0,envMapIntensity:.12,rain:true,renderOrder:1});
SINK_DRAW.mesh.userData.probeSkip=true;SINK_DRAW.mesh.userData.inspectLabel='The sink (the gorge stream goes underground)';
