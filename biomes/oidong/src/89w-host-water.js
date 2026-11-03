// ================================================================= HOST - the pools, the stream and the cataract on core/water
// core/water (core/water/README.md), 2026-10-25, migration phase 4: the four mirror pools are WATER.still (a 48-gon at the pool's level, the colour
// running from the dark middle to the pale rim as a gradient), the stream the dark band in the ground runs along is a WATER.flow from the cataract's foot
// down the valley to the Mirror (the ground keeps its wet band), the 70 m cataract a WATER.fall fitted to the head's step (its foot, its speed from
// the run) with the plunge's spray from core/atmos. The page's own MAT_WATER, discs, canvas ribbon and spray sprites are gone (84-host-ground.js);
// the records (POOLS, CATARACT, streamOff) stay in 45-host-stage.js. CPU twins: WATER.heightAt, WATER.flowAt; BIO.waterH is unchanged.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6a7a5a)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
// ---- the four pools: still water, dark at the middle, pale toward the rim (the old discs' vertex colours)
/* 2026-10-26 (core/water W4): the four pools are ONE mesh (WATER.drawPools keeps each pool's own gradient: four draw calls become one) */
const POOL_STILLS=POOLS.map(P=>{const poly=[],R=P.r*1.5;for(let k=0;k<48;k++){const a=k/48*TAU;poly.push([P.x+Math.cos(a)*R,P.z+Math.sin(a)*R]);}
 return WATER.still({name:P.name,level:P.l,poly,gradient:{centre:lin(0x2e4a44).getHex(),rim:lin(0x7a9a8a).getHex(),power:1}});});
/* the plunge pool at the headwall's toe (45-host-stage.js PLUNGE), a fifth still in the same draw */
{const P=PLUNGE,poly=[],R=P.r*1.4;for(let k=0;k<32;k++){const a=k/32*TAU;poly.push([P.x+Math.cos(a)*R,P.z+Math.sin(a)*R]);}
 POOL_STILLS.push(WATER.still({name:P.name,level:P.l,poly,gradient:{centre:lin(0x2a4440).getHex(),rim:lin(0x8aa49a).getHex(),power:1}}));}
const POOLS_DRAW=WATER.drawPools(POOL_STILLS,{name:'The mirror pools',color:0xffffff,roughness:.04,metalness:.1,envMapIntensity:.5,renderOrder:1,pick:true});
POOLS_DRAW.mesh.userData.inspectLabel='A mirror pool';
// ---- the stream: from the cataract's foot west to the Mirror, along the channel the ground is dipped and painted for, its height the ground's smoothed (a mean over 7 samples) and a hand above
const STREAM_X1=1880,STREAM_X0=-1300,STREAM_STEP=15;   /* from the plunge pool's lip (the headwall's foot, x 1960) west; over each step's riser it runs as a rapid */
const STREAM=(function(){const raw=[];for(let x=STREAM_X1;x>=STREAM_X0;x-=STREAM_STEP){const z=axisZ(x)+streamOff(x);raw.push([x,z,terrainH(x,z)]);}
 const pts=raw.map((p,i)=>{let s=0,n=0;for(let j=Math.max(0,i-3);j<=Math.min(raw.length-1,i+3);j++){s+=raw[j][2];n++;}return[p[0],p[1],s/n+.2];});
 return WATER.flow({name:'The stream',pts,width:9,speed:.9,rapids:[.02,.1]});})();
if(WATER.breakupFlows)WATER.breakupFlows();   /* core/water ext/56: the stream's glint broken up (TODO.md's ride-along, taken per kit) */
const STREAM_DRAW=WATER.drawFlow(STREAM,{shallow:lin(0x5a7a6e),deep:lin(0x2e4a44),color:0xffffff,roughness:.12,metalness:.05,envMapIntensity:.5,step:10,across:6,margin:1,depthBias:2,renderOrder:2,pick:true});
STREAM_DRAW.mesh.userData.inspectLabel='The stream';
// ---- the cataract: the 300 m headwall (scale model 5.1, Gemini's eastern headwall cataract; x 1960..2120), water leaving its lip at the stream's line and
// landing at its toe. A tall fall (core/water README "Tall falls"): the churn sized to the plunge pool (plungeR) and the curtain white to its foot (footK)
const CAT_LIP_X=2122,CAT_W=16,CAT_FOOT_X=1958;
const CATARACT_FALL=(function(){const Z=CATARACT.z,ly=terrainH(CAT_LIP_X,Z)+.3,fy=terrainH(CAT_FOOT_X,Z);
 /* 2026-10-26 (core/water W3, W2): the curtain FOLLOWS the head's face (face: the ground, .5 m over it) instead of arcing ~17 m off it half way down;
   the spray is scaled to the 70 m drop (a mist column of emitters across the foot, spray: 'drop') in place of three at the plunge */
 return WATER.fall({name:'The cataract',lip:[[CAT_LIP_X,Z-CAT_W,ly],[CAT_LIP_X,Z+CAT_W,ly]],dir:[-1,0],drop:ly-fy,foot:[CAT_FOOT_X,Z,fy],fit:true,spread:8,face:terrainH,faceLift:.8,faceN:72});})();
const CATARACT_DRAW=WATER.drawFall(CATARACT_FALL,{color:lin(0xdce8e6),opacity:.9,rowStep:3,cols:12,spray:'drop',plungeR:34,footK:.8,envMapIntensity:.25,renderOrder:3,pick:true});
CATARACT_DRAW.mesh.userData.inspectLabel='The cataract';CATARACT_DRAW.plunge.userData.inspectLabel='The cataract (plunge pool)';
window._water={pools:POOL_STILLS.length,stream:!!STREAM,cataractDrop:CATARACT_FALL.drop,cataractSpeed:CATARACT_FALL.speed};
