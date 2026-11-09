// ================================================================= HOST - the bench's water on core/water
// core/water (core/water/README.md): the seasonal stream is two WATER.flows (45-host-stage.js: each channel's bed plus a hand, never climbing
// downstream): across the bench into the middle ravine's head, and from that ravine's fan down the lower slope. In the rains it goes over the
// cliffs; in the dry season this page shows, the ravine between is dry rock (no WATER.fall: there is no water to fall). The sag pond against the
// north fault's foot is a WATER.still (WATER.drawStill: no shore grid, so no surf). CPU twins: WATER.heightAt; BIO.waterH is waterH (45).
{const WENV={environment:null};
 ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.4,.36,.28])).convertSRGBToLinear(),
  key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
const linC=c=>new THREE.Color(c).convertSRGBToLinear();
const ring=(x,z,r,n,ez)=>{const o=[];for(let k=0;k<n;k++){const a=k/n*TAU;o.push([x+Math.cos(a)*r,z+Math.sin(a)*r*(ez==null?1:ez)]);}return o;};
const flowOf=(name,P,w0,w1)=>WATER.flow({name,pts:P,width:P.map((p,i)=>w0+(w1-w0)*smooth(0,P.length,i)),
 speed:P.map((p,i)=>.4+2*smooth(.01,.12,i+1<P.length?(p[2]-P[i+1][2])/Math.max(1,Math.hypot(P[i+1][0]-p[0],P[i+1][1]-p[1])):0)),rapids:[.03,.12]});
const FLOW_TOP=flowOf('The bench stream',STREAM_TOP,1.8,3),FLOW_LOW=flowOf('The stream below the cliffs',STREAM_LOW,2.6,4.2);
if(WATER.breakupFlows)WATER.breakupFlows();   /* core/water ext/56: the streams' glint broken up */
const STREAM_DRAWS=[[FLOW_TOP,'The bench stream (seasonal; over the cliffs in the rains)'],[FLOW_LOW,'The stream below the cliffs']].map(q=>{
 const D=WATER.drawFlow(q[0],{shallow:linC(0x7a6a48),deep:linC(0x4a4430),color:0xffffff,roughness:.16,metalness:.05,envMapIntensity:.45,step:6,across:4,margin:.8,renderOrder:2});
 D.mesh.userData.inspectLabel=q[1];return D;});
const SAG_S=WATER.still({name:SAG.name,level:SAG.level,poly:ring(SAG.x,SAG.z,SAG.r*.9,18),gradient:{centre:0x3e4630,rim:0x6a6040,power:1.4}});
const SAG_DRAW=WATER.drawStill(SAG_S,{roughness:.1,metalness:.05,envMapIntensity:.5,renderOrder:1});SAG_DRAW.mesh.userData.inspectLabel=SAG.name;
const FAR_STILLS=[];
