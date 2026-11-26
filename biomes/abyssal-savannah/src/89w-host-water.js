// ================================================================= HOST - the water on core/water
// core/water (core/water/README.md): the stream gully's seasonal stream is a WATER.flow along STREAM (45-host-stage.js: the gully's
// line at its bed plus a hand, never climbing downstream), white where it steepens over the risers; its foot pools and the pan's
// seasonal sheet are WATER.still polygons at their levels; the far floor's lake (the scale model's, at -2,331 m) a WATER.still box
// in the far country. The sky in the water is a capture of the shared sky (ATMOS.skylight), given to the water only.
// CPU twins: WATER.heightAt; BIO.waterH is the host's waterH (45), which reads the same levels.
// STILL WATER TAKES NO BREAKERS (the owner, 2026-11-02): the pools and the pan are WATER.drawStill, which draws no shore grid and so no surf or breakers;
// nothing here is WATER.draw. The reflections switch (WATER.mirrorSwitch, off at load) is on the pan, the largest still near the eye (99-host-take.js).
{const WENV={environment:null};
 ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.4,.36,.28])).convertSRGBToLinear(),
  key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
const linC=c=>new THREE.Color(c).convertSRGBToLinear();
const ring=(x,z,r,n,ez)=>{const o=[];for(let k=0;k<n;k++){const a=k/n*TAU;o.push([x+Math.cos(a)*r,z+Math.sin(a)*r*(ez||1)]);}return o;};
const STREAM_FLOW=WATER.flow({name:'The gully stream',pts:STREAM.pts,width:STREAM.pts.map((p,i)=>3.2+2.6*smooth(0,STREAM.pts.length,i)),
 speed:STREAM.pts.map((p,i)=>.5+2.2*smooth(.02,.16,i+1<STREAM.pts.length?(p[2]-STREAM.pts[i+1][2])/12:0)),rapids:[.04,.16]});
if(WATER.breakupFlows)WATER.breakupFlows();   /* core/water ext/56: the stream's glint broken up (the final rebuild) */
const STREAM_DRAW=WATER.drawFlow(STREAM_FLOW,{shallow:linC(0x7a6a48),deep:linC(0x4a4430),color:0xffffff,roughness:.16,metalness:.05,envMapIntensity:.45,step:6,across:4,margin:.8,renderOrder:2});
STREAM_DRAW.mesh.userData.inspectLabel='The gully stream';
const POOL_W=POOLS.map(P=>WATER.still({name:P.name,level:P.level,poly:ring(P.x,P.z,P.r*.85,14),gradient:{centre:0x3e4630,rim:0x6a6040,power:1.4}}));
const POOL_DRAW=POOL_W.map(S=>{const D=WATER.drawStill(S,{roughness:.1,metalness:.05,envMapIntensity:.5,renderOrder:1});D.mesh.userData.inspectLabel=S.name;return D;});
const PAN_S=WATER.still({name:PAN_WATER.name,level:PAN_WATER.level,poly:ring(PAN_WATER.x,PAN_WATER.z,PAN_WATER.r*.92,24,.8),gradient:{centre:0x8a8a7e,rim:0xc4b896,power:1.2}});
const PAN_DRAW=WATER.drawStill(PAN_S,{roughness:.08,metalness:.05,envMapIntensity:.6,opacity:.82,renderOrder:1});PAN_DRAW.mesh.userData.inspectLabel='The pan (a sheet of water a few weeks a year)';
const FAR_LAKE=WATER.still({name:'The floor lake (far)',level:FAR.lake.level,bounds:[FAR.x0,FAR.z0,FAR.lake.x+FAR.lake.w,FAR.z1]});
{const D=WATER.drawStill(FAR_LAKE,{color:0x6a2c2a,roughness:.12,metalness:.1,envMapIntensity:.6,renderOrder:0});D.mesh.userData.inspectLabel='The floor lake';}
