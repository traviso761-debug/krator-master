// ================================================================= HOST - the belt's water on core/water
// core/water (core/water/README.md): the seasonal stream is a WATER.flow along STREAM (45-host-stage.js: its line at the bed plus a hand,
// never climbing downstream); the salt flat's brine sheet and the jungle's seep pool are WATER.still polygons at their levels (WATER.drawStill:
// no shore grid, so no surf or breakers: the owner, 2026-11-02); the model's salt lakes in the far country are WATER.still boxes on their cells.
// The sky in the water is a capture of the shared sky (ATMOS.skylight). CPU twins: WATER.heightAt; BIO.waterH is the host's waterH (45).
{const WENV={environment:null};
 ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.4,.36,.28])).convertSRGBToLinear(),
  key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
const linC=c=>new THREE.Color(c).convertSRGBToLinear();
const ring=(x,z,r,n,ez)=>{const o=[];for(let k=0;k<n;k++){const a=k/n*TAU;o.push([x+Math.cos(a)*r,z+Math.sin(a)*r*(ez==null?1:ez)]);}return o;};
const STREAM_FLOW=WATER.flow({name:'The belt stream',pts:STREAM.pts,width:STREAM.pts.map((p,i)=>2.6+2.2*smooth(0,STREAM.pts.length,i)),
 speed:STREAM.pts.map((p,i)=>.4+1.6*smooth(.01,.08,i+1<STREAM.pts.length?(p[2]-STREAM.pts[i+1][2])/12:0)),rapids:[.03,.1]});
if(WATER.breakupFlows)WATER.breakupFlows();   /* core/water ext/56: the stream's glint broken up */
const STREAM_DRAW=WATER.drawFlow(STREAM_FLOW,{shallow:linC(0x7a6a48),deep:linC(0x4a4430),color:0xffffff,roughness:.16,metalness:.05,envMapIntensity:.45,step:6,across:4,margin:.8,renderOrder:2});
STREAM_DRAW.mesh.userData.inspectLabel='The belt stream (seasonal; it dies in the salt flat)';
const PAN_S=WATER.still({name:PAN_WATER.name,level:PAN_WATER.level,poly:ring(PAN_WATER.x,PAN_WATER.z,PAN_WATER.r*.92,24,1/1.3),gradient:{centre:0x9a9a8a,rim:0xd0c6a8,power:1.2}});
const PAN_DRAW=WATER.drawStill(PAN_S,{roughness:.08,metalness:.05,envMapIntensity:.6,opacity:.8,renderOrder:1});PAN_DRAW.mesh.userData.inspectLabel=PAN_WATER.name;
const SEEP_S=WATER.still({name:SEEP.name,level:SEEP.level,poly:ring(SEEP.x,SEEP.z,SEEP.r*.85,16),gradient:{centre:0x2e3a26,rim:0x5a5a3a,power:1.4}});
const SEEP_DRAW=WATER.drawStill(SEEP_S,{roughness:.1,metalness:.05,envMapIntensity:.5,renderOrder:1});SEEP_DRAW.mesh.userData.inspectLabel=SEEP.name;
const FAR_STILLS=FAR_LAKES.map(Lk=>{const S=WATER.still({name:Lk.name,level:Lk.level,bounds:Lk.bounds});
 const D=WATER.drawStill(S,{color:0x8a8478,roughness:.12,metalness:.1,envMapIntensity:.6,renderOrder:0});D.mesh.userData.inspectLabel=Lk.name;return S;});
