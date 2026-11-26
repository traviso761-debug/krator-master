// ================================================================= HOST — the water of station 3, THE CLOUD FOREST (core/water)
// The face's four ravines (45m RAVINES) each carry a stream from its head (150 m under the crest) down the benches to the page's west
// edge: a WATER.flow line on the ravine's floor (45m ravineBed: it never rises downstream), .4 m deep in its .9 m channel, 5 m wide,
// its surface sloping with the bed, white water where the bed steepens (the risers between the benches: the flow's own foam by
// slope). The cloud's fog-drip still shows as wet ground in the rain (89a).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x3a4a30)});}
const lin=c=>(c.isColor?c.clone():new THREE.Color(c)).convertSRGBToLinear();
const STREAM_C=new THREE.Color(0x9ab4a8);
const STREAMS=RBEDS.map((B,k)=>{const P=[],R=TERR.R*1.1-8;
 for(let x=B.x0;x>-R;x-=8){const z=ravineZ(k,x);if(Math.abs(z)>R)continue;P.push([x,z,ravineBed(k,x)-.9+.4]);}
 return P.length>2?WATER.flow({name:'A ravine stream ('+(k+1)+')',pts:P,width:5,speed:1.2}):null;}).filter(Boolean);
const STREAM_DRAW=STREAMS.map(S=>{const D=WATER.drawFlow(S,{shallow:lin(RIVER_COL.clone().lerp(STREAM_C,.55)),deep:lin(RIVER_COL.clone().lerp(STREAM_C,.35)),color:0xffffff,
  roughness:.2,metalness:.05,envMapIntensity:.3,step:6,across:3,margin:.6,chute:.35,depthBias:2,rain:true,renderOrder:2});D.mesh.userData.inspectLabel=S.name;return D;});
