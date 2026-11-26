// ================================================================= HOST — the water of station 4, CUBE'S PLATEAU (core/water)
// The two streams (45m STREAMS_LINE): each a WATER.flow line on its valley's floor (45m SBED: never rising downstream), .4 m deep
// in its .7 m channel, 5 m wide, from its head a kilometre off the ridge to the page's edge, white water where the bed steepens.
// They run on to the plateau's scarp, 12-25 km off, and over it in falls the far field does not draw.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x3a4a30)});}
const lin=c=>(c.isColor?c.clone():new THREE.Color(c)).convertSRGBToLinear();
const STREAM_C=new THREE.Color(0x9ab4a8);
const STREAMS=STREAMS_LINE.map((L,k)=>{const P=[];for(let i=0;i<L.length;i+=2){const p=L[i];if(Math.abs(p[0])>TERR.R*1.1-8||Math.abs(p[1])>TERR.R*1.1-8)continue;P.push([p[0],p[1],SBED[k][i]-.7+.4]);}
 return P.length>2?WATER.flow({name:k?'The south-west stream':'The north-east stream',pts:P,width:5,speed:.9}):null;}).filter(Boolean);
const STREAM_DRAW=STREAMS.map(S=>{const D=WATER.drawFlow(S,{shallow:lin(RIVER_COL.clone().lerp(STREAM_C,.55)),deep:lin(RIVER_COL.clone().lerp(STREAM_C,.35)),color:0xffffff,
  roughness:.2,metalness:.05,envMapIntensity:.3,step:6,across:3,margin:.6,chute:.35,depthBias:2,rain:true,renderOrder:2});D.mesh.userData.inspectLabel=S.name;return D;});
