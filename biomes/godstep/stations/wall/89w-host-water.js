// ================================================================= HOST — the north wall's water on core/water (station 5)
// The records are the model's (45b: WFLOWS, the streams as WATER.flow; WFALLS, WATER.fallsOf's slope breaks where a stream drops off a riser):
// here they are drawn, after 89a has bound core/atmos. Each stream a ribbon falling with its line (ripples carried down the current, white
// water on the steep, rain rings); each fall a curtain that arcs from its lip, streaked and whitening to its plunge pool's churn, with its
// spray (ext: WATER.fallSpray's mist scaled to the drop). In the wet season every stream runs (PLAN.md section 4: "threads in the dry").
// The sky in the water is a capture of the shared sky's dome and the giant (greenstep's way). Glints broken up (ext/56 where loaded).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x4a4a32)});}
const WATER_DRAW=(function(){const lin=h=>new THREE.Color(h).convertSRGBToLinear();
 const flows=WFLOWS.map((F,i)=>{const D=WATER.drawFlow(F,{shallow:lin(0x5a6a50),deep:lin(0x2a3424),color:0xffffff,roughness:.12,metalness:.05,envMapIntensity:.4,step:4,across:4,
   margin:1.2,depthBias:1.5,renderOrder:2,pick:true,rain:true,chute:.9});D.mesh.userData.inspectLabel=F.name;return D;});
 const falls=WFALLS.map((F,k)=>{const D=WATER.drawFall(F,{color:lin(0xd8dcd4),opacity:.88,rows:24,cols:5,margin:1,spray:k<10?'drop':false,envMapIntensity:.25,renderOrder:3});
  if(D&&D.mesh){D.mesh.userData.inspectLabel=(WSTREAMS[F.stream]?WSTREAMS[F.stream].name.split(' (')[0]:'A stream')+': a fall of '+Math.round(F.drop)+' m off a bench';
   /* the probe's point for it: the lip's middle, halfway down (core/water's meshes are probeSkip) */
   const pm=new THREE.Object3D();pm.userData.probePoints=[(F.lip[0][0]+F.lip[1][0])/2,F.lip[0][2]-F.drop/2,(F.lip[0][1]+F.lip[1][1])/2];scene.add(pm);}
  return D;});
 return{flows,falls};})();
window._water={streams:WFLOWS.length,falls:WFALLS.length,drops:WFALLS.map(F=>Math.round(F.drop)),points:WFLOWS.map(F=>F.pts.length)};
