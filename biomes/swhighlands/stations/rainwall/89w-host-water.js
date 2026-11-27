// ================================================================= HOST — the water (core/water) (station 2, the rain wall)
// The landslide lake (a still behind the dam, its reflections switch off at load: BACKPORT.md's universal set), the seep through the
// dam's toe (a flow, rapids where it steepens) and its falls over the hanging valley's lip (a thread of falls: WATER.fall with spray).
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const LAKE_DRAW=WATER.drawStill(LAKE_STILL,{color:lin(0x18403e),roughness:.1,metalness:0,envMapIntensity:.25,rain:true,renderOrder:1});
const FLOW_DRAWS=FLOWS.map(F=>{const D=WATER.drawFlow(F,{rapids:[.04,.5],shallow:lin(0x76a296),deep:lin(0x24504a),color:0xffffff,roughness:.2,metalness:.05,step:2,across:3,margin:.6,envMapIntensity:.3,renderOrder:2,rain:true});return D;});
const FALL_DRAWS=SEEP_FALLS.map(F=>WATER.drawFall(F,{color:lin(0xd0dcdc),opacity:.85,rows:32,cols:4,margin:1,lipK:.85,spray:'drop',rain:true,envMapIntensity:.25,renderOrder:3}));
