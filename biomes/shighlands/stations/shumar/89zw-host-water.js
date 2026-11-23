// ================================================================= HOST - Qappu-Narun and the karst tarn on core/water (Station 4: Shumar)
// Replaces src/89zw-host-water.js for `--station shumar`. Draws the western limestone bench's sinkhole tarn (WATER.still) and r287 Qappu-Narun
// ("Crest-Keep River", 68.9 m3/s, PLAN-STATIONS.md) flowing northward (-z) along the canyon floor on WATER.flow, with surface breakup (ext/56).
// src/89zx-host-build.js bakes WATER.fields over WATER.surfaces immediately after this file so every tree keeps off both the tarn and the river.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6e6850)});}
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
const circ=(x,z,r,n)=>{const p=[];for(let k=0;k<n;k++){const a=k/n*TAU;p.push([x+Math.cos(a)*r,z+Math.sin(a)*r]);}return p;};
// ---- the karst sinkhole tarn on the western bench
const TARN_STILL=WATER.still({name:'The tarn',level:TARNL,poly:circ(TARN.x,TARN.z,TARN.r*1.32,64),
 gradient:{centre:lin(0x1d3030).getHex(),rim:lin(0x52624e).getHex(),power:1.2}});
const TARN_DRAW=WATER.drawStill(TARN_STILL,{roughness:.08,metalness:.08,envMapIntensity:.42,renderOrder:1,pick:true});
TARN_DRAW.mesh.userData.inspectLabel='The tarn';
// ---- r287 Qappu-Narun: perennial snowmelt canyon river falling northward (-z) toward Betun-Narun
const QAPPU=(function(){const pts=[],W=[];let y=1e9,s=0,px=0,pz=0;
 for(let z=2520;z>=-2520;z-=16){const x=STATION_LAND.rivX(z),lv=STATION_LAND.rivLevel(z),h=terrainH(x,z);
  y=Math.min(y,Math.max(lv,h+.28));
  if(pts.length)s+=Math.hypot(x-px,z-pz);
  px=x;pz=z;pts.push([x,z,y]);W.push([s,STATION_LAND.rivW(z)]);}
 const F=WATER.flow({name:'Qappu-Narun',pts,width:W,speed:1.65,rapids:[.003,.024]});
 const D=WATER.drawFlow(F,{shallow:lin(0x586a52),deep:lin(0x1f3634),color:0xffffff,roughness:.1,metalness:.06,envMapIntensity:.48,
  step:12,across:7,margin:1.6,depthBias:1.6,renderOrder:2,pick:true});
 D.mesh.userData.inspectLabel='Qappu-Narun';
 REGISTER({name:'Qappu-Narun',cls:'feature',kind:'river',x:STATION_LAND.rivX(0),z:0,y:STATION_LAND.floorY(0)-6,r:95,h:36});
 return{F,D};})();
window._water={tarn:!!TARN_DRAW,pools:0,streams:1,river:'Qappu-Narun'};
if(WATER.breakupAll&&new URLSearchParams(location.search).get('breakup')!=='0'){try{WATER.breakupAll();}catch(e){reportErr('breakup: '+e.stack);}}
