// ================================================================= HOST — the water on core/water: THE RILLE (station 2)
// The spring's stream (45b: STREAM_FLOW, a WATER.flow from the palagonite parting down the talus and the rille's floor, sinking into the head
// wall's talus), drawn as core/water's ribbon: white where it falls down the wall and the talus, clear and shallow on the floor between the
// fields. Its wet field (WATER.fields) is the kit's pass's (55): the stalks stand only where it reaches. Nothing else holds water here.
const linC=c=>new THREE.Color(c).convertSRGBToLinear();
if(WATER.breakupFlows)WATER.breakupFlows();
const STREAM_DRAW=WATER.drawFlow(STREAM_FLOW,{shallow:linC(0x6a6050),deep:linC(0x2e3430),color:0xffffff,roughness:.16,metalness:.05,envMapIntensity:.45,step:4,across:4,margin:.6,renderOrder:2});
STREAM_DRAW.mesh.userData.inspectLabel=STREAM.name;
window._water={stream:{pts:STREAM.pts.length,drop:+(STREAM.pts[0][2]-STREAM.pts[STREAM.pts.length-1][2]).toFixed(1)},fields:FIELDS.polys.length,mask:FIELDS.hash};
