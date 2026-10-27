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
/* THE MOUTHS (core/water drawFlow mouths): at each tributary's end on its river, a round hole in both foams, so the river's bank foam does not
   cross the mouth and the two foam borders end on one arc (the owner, 2026-10-26) */
const MOUTHS=COURSES.filter(C=>C.joined).map(C=>{const p=C.pts[C.pts.length-1];return{main:C.join.ci,trib:COURSES.indexOf(C),m:[p[0],p[1],(C.w[1]+2.5+1.2)*1.6]};   /* r: the tributary's ribbon half width (water, hold, margin), and room for the soft edge */});
const mouthsOf=k=>MOUTHS.filter(M=>M.main===k||M.trib===k).map(M=>M.trib===k?M.m.concat([0]):M.m);   /* the tributary keeps its side fade */
const FLOW_DRAWS=FLOWS.map((F,k)=>{const C=COURSES[k],steep=C.key==='gorge';
 const D=WATER.drawFlow(F,{rapids:steep?[.15,.9]:[.02,.14],shallow:lin(steep?0x6e8078:0x6a9a86),deep:lin(steep?0x2e4a44:0x1e4a42),color:0xffffff,roughness:.2,metalness:.05,
  envMapIntensity:.35,step:steep?4:10,across:steep?3:6,margin:1.2,chute:steep?.6:.5,rain:true,endFade:C.joined?{len:3.5,foam:-100,keepFoam:true,flow:C.joined.flowTo,turn:30,turnK:.6}:null,   /* it ends at the river's water edge (WATER.join tuck 1): its water fades clear over the last 3.5 m, its foam border runs on into the river's foam (the owner, 2026-10-26) */
  mouths:mouthsOf(k),renderOrder:C.joined&&C.joined.order==='after'?3:2});   /* WATER.join: a tributary after the river, its water over the river's bank foam at the mouth */
 D.mesh.userData.probeSkip=true;D.mesh.userData.inspectLabel=C.name;return D;});
const FALL_DRAWS=GORGE_FALLS.map(F=>{const D=WATER.drawFall(F,{color:lin(0xc8d4d4),opacity:.9,rows:24,cols:5,margin:1.2,lipK:.85,spray:'drop',rain:true,envMapIntensity:.25,renderOrder:3});
 D.mesh.userData.probeSkip=true;D.mesh.userData.inspectLabel='The gorge\'s falls (through the natural bridges)';D.plunge.userData.probeSkip=true;D.plunge.userData.inspectLabel='A plunge pool';return D;});
const SINK_DRAW=WATER.drawStill(SINK_STILL,{color:lin(0x1e3a36),roughness:.14,metalness:0,envMapIntensity:.12,rain:true,renderOrder:1});
SINK_DRAW.mesh.userData.probeSkip=true;SINK_DRAW.mesh.userData.inspectLabel='The sink (the gorge stream goes underground)';
// THE MOUTHS' POOLS (core/water WATER.join pool): a round still pool at each tributary's end, at the river's level, drawn UNDER both ribbons
// in the river's colours: it rounds the two land corners the ribbons' straight edges leave at the mouth (the owner, 2026-10-26)
const POOL_DRAWS=COURSES.filter(C=>C.joined&&C.joined.pool).map(C=>{const P=C.joined.pool;
 const S=WATER.still({name:'The mouth of '+C.name.toLowerCase().replace(/^the /,'the '),level:P.level-.06,gradient:{centre:0x1e4a42,rim:0x2a5a50,power:1.2},   /* just under both ribbons: it shows only in the corners they leave */
  poly:Array.from({length:40},(_,k)=>{const a=k/40*TAU;return[P.x+Math.cos(a)*P.r,P.z+Math.sin(a)*P.r];})});
 const D=WATER.drawStill(S,{color:lin(0x1e4a42),roughness:.2,metalness:.05,envMapIntensity:.35,rain:true,renderOrder:1});
 D.mesh.userData.probeSkip=true;D.mesh.userData.inspectLabel=C.name+' (its mouth)';return D;});
