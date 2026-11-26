// ================================================================= HOST - the falls, the plunge pools and the streams on core/water (the cloud forest)
// 2026-10-26 (the water migration, the last stations). Before: each fall a curtain of the page's own streaked shader (FALL_MAT), each pool a
// Lambert disc, each ravine's stream a Lambert ribbon (84). Now:
//   THE FALLS   a WATER.fall at each step (FALLS, 84): the lip across the ravine just above the step, the arc fitted to land on the old
//               foot (where the spray rises, 85), widening at its foot; all four drawn by WATER.drawFalls in two meshes (the curtains,
//               the plunge discs' churn), where there were four
//   THE POOLS   a WATER.still per plunge pool (POOLS, 47: a 28-gon at its level, its rim just inside the pool's registered volume), all four one mesh (WATER.drawPools), the old colour
//               and opacity, darkened at night as before; they keep their ray cast and the probe's samples (pick), as the discs did
//   THE STREAMS each ravine's stream a WATER.flow per run (it breaks at each fall: the curtain carries it down), its line on the floor
//               + .3 m every 8 m, its width the old ribbon's (2 (.42 w + .8 sin(.05 x))), white only past a 10% grade
// The sky in the water is core/atmos's skylight (this dome and the giant, given to the water only). waterH (47) is unchanged.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x2e3e36),key:()=>LIGHT_MODE});}
// ---- the falls
const FALL_SURF=FALLS.map(F=>{const px=-F.dz,pz=F.dx,hw=F.w/2;
 return WATER.fall({name:F.name,lip:[[F.x-px*hw,F.z-pz*hw,F.y],[F.x+px*hw,F.z+pz*hw,F.y]],dir:[F.dx,F.dz],drop:F.drop,foot:[F.foot[0],F.foot[2],F.foot[1]],fit:true,spread:F.w*.2});});
const FALLS_DRAW=FALL_SURF.length?WATER.drawFalls(FALL_SURF,{name:'The falls of the ravine',rowStep:1.2,renderOrder:2,pick:true,spray:false}):null;
// ---- the pools
const POOL_STILLS=POOLS.map(P=>{const poly=[];for(let k=0;k<28;k++){const a=k/28*TAU;poly.push([P.x+Math.cos(a)*P.r*.97,P.z+Math.sin(a)*P.r*.97]);}
 return WATER.still({name:P.name,level:P.level,poly});});
const POOLS_DRAW=WATER.drawPools(POOL_STILLS,{name:'The plunge pools',color:0x3e5650,opacity:.88,roughness:.2,metalness:.05,envMapIntensity:.3,renderOrder:1,pick:true});
/* one merged mesh holds the four: the probe samples a mesh at its box's centre, so it is given each pool's middle (userData.probePoints) */
POOLS_DRAW.mesh.userData.probePoints=[].concat(...POOLS.map(P=>[P.x,P.level,P.z]));
_onLight.push(m=>{POOLS_DRAW.material.color.setHex(m==='night'?0x0e1414:0x3e5650);});
// ---- the streams
const STREAM_FLOWS=[];
RAVINES.forEach(V=>{let run=[],wid=[];
 const flush=()=>{if(run.length>=3)STREAM_FLOWS.push({V,F:WATER.flow({name:V.name+' (its stream)',pts:run,width:wid,speed:1.2})});run=[];wid=[];};
 for(let x=2120;x>=-2700;x-=8){const c=ravC(V,x);if(Math.abs(c)>TERR.R*1.08||x<-TERR.R*1.08){flush();continue;}
  if(V.steps&&V.steps.some(S=>x<S.x+2&&x>S.x-6)){flush();continue;}
  run.push([x,c,terrainH0(x,c)+.3]);wid.push(2*(V.w*.42+.8*Math.sin(x*.05)));}
 flush();});
const STREAM_DRAWS=STREAM_FLOWS.map(({V,F})=>{const d=WATER.drawFlow(F,{rapids:[.1,.3],shallow:new THREE.Color(0x5a6e68).convertSRGBToLinear(),deep:new THREE.Color(0x2e403c).convertSRGBToLinear(),
  color:0xffffff,roughness:.25,metalness:.05,envMapIntensity:.35,step:8,across:2,margin:1,renderOrder:1});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=V.name+' (its stream)';return d;});
