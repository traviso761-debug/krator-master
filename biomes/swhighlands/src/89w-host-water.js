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
const RIBBON_OPT=steep=>({rapids:steep?[.15,.9]:[.02,.14],shallow:lin(steep?0x6e8078:0x6a9a86),deep:lin(steep?0x2e4a44:0x1e4a42),color:0xffffff,roughness:.2,metalness:.05,
 envMapIntensity:.35,step:steep?4:10,across:steep?3:6,margin:1.2,chute:steep?.6:.5,rain:true});
const FLOW_DRAWS=FLOWS.map((F,k)=>{const C=COURSES[k],steep=C.key==='gorge';
 const D=WATER.drawFlow(F,Object.assign(RIBBON_OPT(steep),{renderOrder:2}));
 D.mesh.userData.probeSkip=true;D.mesh.userData.inspectLabel=C.name;return D;});
/* THE CONFLUENCES (core/water/ext WATER.confluence; the owner, 2026-10-27: a tributary and its river read as one water): one surface over a
   disc round each tributary's mouth, its shore where the ground rises over the level (the carve's rounded corners), one current blended
   from the two (the stream's ripples turn into the river's), foam from the real bank (none across the mouth); both ribbons fade out inside
   it, on the same numbers at its rim. Drawn in the river's water (its ribbon's options) */
const CONFLUENCES=COURSES.filter(C=>C.joined).map(C=>{const k=COURSES.indexOf(C),m=C.join.ci,p=C.pts[C.pts.length-1];
 const CF=WATER.confluence({name:'The mouth of '+C.name.toLowerCase(),flows:[FLOWS[m],FLOWS[k]],at:[p[0],p[1]],ground:terrainH,cell:1});
 const D=WATER.drawConfluence(CF,Object.assign(RIBBON_OPT(false),{renderOrder:2}));WATER.fadeRibbons(CF,[FLOW_DRAWS[m],FLOW_DRAWS[k]]);
 D.mesh.userData.probeSkip=true;D.mesh.userData.inspectLabel=C.name+' (its mouth)';return D;});
const FALL_DRAWS=GORGE_FALLS.map(F=>{const D=WATER.drawFall(F,{color:lin(0xc8d4d4),opacity:.9,rows:24,cols:5,margin:1.2,lipK:.85,spray:'drop',rain:true,envMapIntensity:.25,renderOrder:3});
 D.mesh.userData.probeSkip=true;D.mesh.userData.inspectLabel='The gorge\'s falls (through the natural bridges)';D.plunge.userData.probeSkip=true;D.plunge.userData.inspectLabel='A plunge pool';return D;});
const SINK_DRAW=WATER.drawStill(SINK_STILL,{color:lin(0x1e3a36),roughness:.14,metalness:0,envMapIntensity:.12,rain:true,renderOrder:1});
SINK_DRAW.mesh.userData.probeSkip=true;SINK_DRAW.mesh.userData.inspectLabel='The sink (the gorge stream goes underground)';
