// ================================================================= HOST — STATION gills: the water at Alph's head (core/water)
// THE POOL in the amphitheatre's floor, where the Sacred River rises out of its subglacial reservoir (a WATER.still at the pool's level, no surf, no breakers:
// still water); THE RIVER (Ālph) down the chasm's graded bed to the map's edge (a WATER.flow a hand over the bed, its falls at the bed's two steps);
// THE MILKY POOLS in the live gills' floors (WATER.spring, the geyser kit's temperature ramp: warm alkaline brine, milky, steaming on the out-breath: 87).
// The fountain is 89x's. The sky in the water is a capture of the sky, given to the water only (as the Vale's page).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x8a8a86)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const SG=STATION_GILLS;
const POOL=WATER.still({name:'Alph\'s pool',poly:(function(){const p=[];for(let k=0;k<28;k++){const a=k/28*Math.PI*2;p.push([SG.HEAD[0]+Math.cos(a)*SG.HR*.5,SG.HEAD[1]+Math.sin(a)*SG.HR*.5]);}return p;})(),level:SG.POOLY});
const POOL_DRAW=WATER.drawStill(POOL,{color:lin(0x6fb8b0).getHex(),roughness:.08,metalness:.05,envMapIntensity:.5,surf:false,breakers:false,renderOrder:1});
POOL_DRAW.mesh.userData.inspectLabel='Alph\'s pool (Ālph-bi Bhlo: the river forced up here on the out-breath)';
const RIVER=WATER.flow({name:'Ālph, the Sacred River',pts:SG.river.map(p=>[p[0],p[1],p[2]]),width:SG.river.map(p=>p[3]),
 speed:SG.river.map((p,i,A)=>1.4+2.6*smooth(.02,.16,i+1<A.length?Math.max(0,(p[2]-A[i+1][2])/24):0)),rapids:[.03,.16]});
const RIVER_DRAW=WATER.drawFlow(RIVER,{shallow:lin(0x8ad0c8),deep:lin(0x2a6a70),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.5,step:10,across:6,margin:1.2,depthBias:2,renderOrder:2,pick:true});
RIVER_DRAW.mesh.userData.inspectLabel='Ālph, the Sacred River (from its chasm)';
const RIVER_FALLS=WATER.fallsOf(RIVER,{steep:.3,minDrop:5,fit:true}).map(f=>WATER.fall(f));
RIVER_FALLS.forEach(F=>{const D=WATER.drawFall(F,{color:lin(0xe4eeec),opacity:.9,rows:24,cols:6,spray:'drop',envMapIntensity:.25,renderOrder:3});D.mesh.userData.inspectLabel='The chasm\'s falls';if(D.plunge)D.plunge.userData.inspectLabel='The chasm\'s falls';});
// the milky pools: one in each live gill's floor at its middle, at the floor's own height
const GILL_POOLS=SG.L.gills.filter(g=>g.alive).map((g,i)=>{const a=(g.a0+g.a1)/2,x=g.c[0]+Math.cos(a)*g.r,z=g.c[1]+Math.sin(a)*g.r;
 const S=WATER.spring({key:'gills-pool-'+g.id,name:'A milky pool (Bhlo-wāṭar) in '+g.id,x,z,r:Math.min(9,g.w*.22),level:terrainH(x,z)+.25,temp:.45,mineral:'sinter',milky:.85,boil:0,kind:'pool'});
 const D=WATER.drawSpring(S,{THREE,scene,mats:new Map()});D.mesh.userData.inspectLabel=S.name;return{S,D,x,z,y:terrainH(x,z)+.25};});
if(XQ_ON('breakup')){WATER.breakupAll();WATER.breakupFlows();}
window._water={pool:!!POOL_DRAW,river:!!RIVER_DRAW,falls:RIVER_FALLS.length,gillPools:GILL_POOLS.length};
