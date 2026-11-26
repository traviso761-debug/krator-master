// ================================================================= HOST - the land's river on core/water (after the hyperjungle's savanna station)
// The river off the rim (45: RIVER, its level from the jungle up) as one WATER.flow ribbon, a point every 40 m: a clear savanna river
// over sand, browner where the gallery shades it; the flow shader whitens it where its bed steepens. No confluence and no falls here
// (one river, no drop over a metre in a metre). The sky in the water is core/atmos's skylight (as src/89w).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x5a4a30)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const RIVER_F=(function(){const R=RIVER,P=[];for(let s=0;s<=R.L.len;s+=40){const i=Math.min(R.L.pts.length-1,Math.round(s/R.L.len*(R.L.pts.length-1))),p=R.L.pts[i];
  if(Math.max(Math.abs(p[0]),Math.abs(p[1]))>TERR.R*1.12)continue;P.push([p[0],p[1],riverY(riverQ(p[0],p[1]).t)]);}
 return WATER.flow({name:'The river',pts:P,width:R.w,speed:1});})();
const RIVER_DRAW=WATER.drawFlow(RIVER_F,{shallow:lin(0x6a6040),deep:lin(0x34301e),color:0xffffff,roughness:.2,metalness:.08,envMapIntensity:.4,step:40,across:4,margin:1});
RIVER_DRAW.mesh.userData.probeSkip=true;RIVER_DRAW.mesh.userData.inspectLabel='The river and its gallery';
