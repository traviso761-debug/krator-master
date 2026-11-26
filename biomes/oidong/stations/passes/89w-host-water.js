// ================================================================= HOST - the tarn of the high passes (station 2), on core/water
// One small meltwater pond in a hollow north of the road (45-host-stage.js TARN): a WATER.still, near black in the middle, pale at its rim, mirror-still
// (no surf, no breakers: the owner's rule for still water). The page's reflections switch serves it (99-host-take.js).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x8a8478)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const TARN_STILL=(function(){const P=TARN,poly=[],R=P.r*1.4;for(let k=0;k<40;k++){const a=k/40*TAU;poly.push([P.x+Math.cos(a)*R,P.z+Math.sin(a)*R]);}
 return WATER.still({name:P.name,level:P.l,poly,gradient:{centre:lin(0x1e3038).getHex(),rim:lin(0x7a8e90).getHex(),power:1}});})();
const POOLS_DRAW=WATER.drawPools([TARN_STILL],{name:'The tarn',color:0xffffff,roughness:.03,metalness:.1,envMapIntensity:.6,renderOrder:1,pick:true});
POOLS_DRAW.mesh.userData.inspectLabel='The tarn (meltwater)';
window._water={pools:1};
