// ================================================================= HOST — Arcoforte upper park pools, linear canal & sluice cascade on core/water
// Runs at 89x (after 89v-host-cove.js and 89w-host-water.js build the 14 km marine surface & cliff springs, before 89z-host-build.js):
// Draws Arcoforte's sheltered Central Park reflection pools (WATER.drawStill), park stream & Linear City canal (WATER.drawFlow),
// and sea-cliff sluice cascade (WATER.drawFall) in world coordinates via ARCOFORTE.waterRecords.
(function buildFcoveArcoforteWater(){
 if(!FCOVE_SCENE||!FCOVE_SCENE.arcoforte||!FCOVE_SCENE.arcoforte.plan)return;
 const AF=FCOVE_LAYOUT.arcoforte,P=FCOVE_SCENE.arcoforte.plan;
 const frame={x:AF.x,z:AF.z,ang:-AF.yaw,y0:AF.y0};
 const WREC=ARCOFORTE.waterRecords(P,WATER,frame);
 const linCol=hex=>new THREE.Color(hex).convertSRGBToLinear();

 WREC.still.forEach(st=>{
  const d=WATER.drawStill(st,{
   color:linCol(0x225a6c),
   roughness:0.12,
   metalness:0.08,
   envMapIntensity:0.38,
   renderOrder:1
  });
  d.mesh.userData.probeSkip=true;
  d.mesh.userData.lodSkip=true;
  d.mesh.userData.inspectLabel=st.name+' (Arcoforte Central Park)';
 });

 WREC.flow.forEach(fl=>{
  const d=WATER.drawFlow(fl,{
   shallow:linCol(0x3c8c9c),
   deep:linCol(0x1c586c),
   color:0xffffff,
   roughness:0.12,
   metalness:0.06,
   envMapIntensity:0.42,
   step:8,
   across:6,
   margin:1.2,
   renderOrder:1
  });
  d.mesh.userData.probeSkip=true;
  d.mesh.userData.lodSkip=true;
  d.mesh.userData.inspectLabel=fl.name+' (Arcoforte)';
 });

 WREC.fall.forEach(fa=>{
  const d=WATER.drawFall(fa,{
   color:linCol(0x9ad4e0),
   opacity:0.86,
   rows:28,
   cols:6,
   plungeY:6.0,
   spray:'drop',
   lipK:0.85,
   footK:0.65,
   envMapIntensity:0.28
  });
  d.mesh.userData.probeSkip=true;
  d.mesh.userData.lodSkip=true;
  d.mesh.userData.inspectLabel=fa.name+' (Arcoforte Cliff Sluice)';
  if(d.plunge){
   d.plunge.userData.probeSkip=true;
   d.plunge.userData.lodSkip=true;
  }
 });
})();
