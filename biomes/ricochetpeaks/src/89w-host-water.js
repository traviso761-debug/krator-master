// ================================================================= HOST — annular moat-lakes, boiling fumarole springs, sinter terraces & frozen tarn (core/water; [draw])
// Implements Ricochet Peaks 5-station hydrology (PLAN.md sections 1 & 3):
//   - Station 1 (ringlake):   WATER.open annular sapphire moat-lake (+2.40 m) circling central rebound island + NW snowmelt WATER.flow
//   - Station 2 (notch):      Twin WATER.open boreal crater-lakes on opposite sides of Skippers Notch (+4.20 m West & -9.60 m East)
//   - Station 3 (vents):      WATER.open emerald hot-spring lake (+1.80 m) + 6 boiling WATER.spring pools + 5-step silica WATER.terraces + melt creek
//   - Station 4 (glasssheet): WATER.open melt-sheet tarn (+0.60 m) + rust-gold meteoritic iron-nickel WATER.flow creek
//   - Station 5 (highbowl):   WATER.ice (+1.20 m) frozen Old Rim cryofumarole tarn with black-ice polygon cracks & snowdrifts
//   - WATER.mirrorSwitch attached strictly OFF at page load.
{
 const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));
 {const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer:renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x364a46)});
}

const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const W_OUT={station:SKEY,opens:0,springs:0,terraces:0,ice:0,flows:0};

function makeOpenMask(box,cell,allowFn){
 const nx=Math.max(2,Math.ceil((box[2]-box[0])/cell));
 const nz=Math.max(2,Math.ceil((box[3]-box[1])/cell));
 const data=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++){
  const z=box[1]+(j+0.5)*cell;
  for(let i=0;i<nx;i++){
   const x=box[0]+(i+0.5)*cell;
   data[j*nx+i]=allowFn(x,z)?255:0;
  }
 }
 return{x0:box[0],z0:box[1],cell:cell,nx:nx,nz:nz,data:data};
}

function makeOvalPoly(cx,cz,rx,rz,nPts,seed){
 const pts=[];
 for(let i=0;i<nPts;i++){
  const a=(i/nPts)*TAU;
  const wob=1.0+0.04*(KRAND.unit(KRAND.hash(seed,i,1))-0.5);
  pts.push([cx+Math.cos(a)*rx*wob,cz+Math.sin(a)*rz*wob]);
 }
 return pts;
}

const MAIN_WATER=(function(){
 if(SKEY==='ringlake'){
  // Annular moat-lake circling the central rebound peak island (level +2.40 m)
  const box=[-290,-260,290,260];
  const mask=makeOpenMask(box,4,(x,z)=>{
   const rIn=Math.hypot(x/106.0,z/88.0);
   const rOut=Math.hypot(x/268.0,z/238.0);
   return rIn>0.92&&rOut<1.04&&DRAWN_H(x,z)<2.48;
  });
  const S=WATER.open({
   name:'Yuni-Gate Annular Central-Peak Moat-Lake',
   level:SITE.moat.levelY,
   bounds:box,
   bed:DRAWN_H,
   bedCell:4,
   mask:mask,
   field:0.42
  });
  const D=WATER.draw(S,{
   shallow:0x4aa8b4,
   deep:0x0d3650,
   ramp:[0.4,9.5],
   roughness:0.06,
   metalness:0.06,
   envMapIntensity:0.52,
   surf:false,
   breakers:false,
   pick:true
  });
  W_OUT.opens++;
  return{S:S,material:D.material,mesh:D.mesh};
 }

 if(SKEY==='notch'){
  // 1. West Skippers Doublet Crater Lake (+4.20 m, x < -84)
  const wBox=[-540,-275,-76,275];
  const wMask=makeOpenMask(wBox,5,(x,z)=>x<-84&&Math.abs(z)<260&&DRAWN_H(x,z)<4.35);
  const SW=WATER.open({
   name:'Skippers Doublet West Crater Lake',
   level:SITE.notchSpec.westLakeY,
   bounds:wBox,
   bed:DRAWN_H,
   bedCell:5,
   mask:wMask,
   field:0.48
  });
  const DW=WATER.draw(SW,{
   shallow:0x489ea8,
   deep:0x0e344c,
   ramp:[0.4,10.0],
   roughness:0.07,
   metalness:0.06,
   envMapIntensity:0.50,
   surf:false,
   breakers:false,
   pick:true
  });

  // 2. East North-Crater Boreal Lake (-9.60 m, x > +84)
  const eBox=[76,-275,540,275];
  const eMask=makeOpenMask(eBox,5,(x,z)=>x>84&&Math.abs(z)<260&&DRAWN_H(x,z)<-9.45);
  const SE=WATER.open({
   name:'North Crater Lower Boreal Lake',
   level:SITE.notchSpec.eastLakeY,
   bounds:eBox,
   bed:DRAWN_H,
   bedCell:5,
   mask:eMask,
   field:0.48
  });
  WATER.draw(SE,{
   shallow:0x3e929e,
   deep:0x0b2c44,
   ramp:[0.4,11.0],
   roughness:0.07,
   metalness:0.06,
   envMapIntensity:0.50,
   surf:false,
   breakers:false,
   pick:true
  });
  W_OUT.opens+=2;
  return{S:SW,material:DW.material,mesh:DW.mesh};
 }

 if(SKEY==='vents'){
  // 1. East Hearth Emerald Hot-Spring Crater Lake (+1.80 m)
  const ol=SITE.oasisLake;
  const lBox=[ol.cx-ol.rx-20,ol.cz-ol.rz-20,ol.cx+ol.rx+20,ol.cz+ol.rz+20];
  const lMask=makeOpenMask(lBox,4,(x,z)=>Math.hypot((x-ol.cx)/(ol.rx*1.05),(z-ol.cz)/(ol.rz*1.05))<1.0&&DRAWN_H(x,z)<1.92);
  const SL=WATER.open({
   name:'East Hearth Steaming Emerald Hot-Spring Lake',
   level:ol.levelY,
   bounds:lBox,
   bed:DRAWN_H,
   bedCell:4,
   mask:lMask,
   field:0.36
  });
  const DL=WATER.draw(SL,{
   shallow:0x4cd4bc,
   deep:0x0d5c62,
   ramp:[0.4,8.5],
   roughness:0.05,
   metalness:0.08,
   envMapIntensity:0.54,
   surf:false,
   breakers:false,
   pick:true
  });
  W_OUT.opens++;

  // 2. Six boiling mineral-banded fumarole hot springs (core/water/geyser 52 + 52b)
  const spMats=new Map();
  for(let i=0;i<SITE.vents.length;i++){
   const v=SITE.vents[i];
   const lvl=(i===5?14.2:(i===0?9.8:(6.4+0.6*(i%3))))-0.42;
   const sp=WATER.spring({
    key:v.id,
    name:v.name,
    x:v.x,
    z:v.z,
    r:v.r,
    level:lvl,
    temp:clamp((v.T-35)/42,0.55,0.98),
    mineral:v.mineral||'sinter',
    milky:!!v.milky,
    boil:v.boil==null?1:v.boil,
    steam:1
   });
   WATER.drawSpring(sp,{THREE:THREE,scene:scene,mats:spMats,fog:scene.fog,renderOrder:2});
   W_OUT.springs++;
  }

  // 3. Five-stepped white silica sinter terraces (core/water/ext 53 + 53b)
  const tLine=[];
  for(let i=0;i<=16;i++){
   const u=i/16;
   tLine.push([lerp(-92,-42,u),lerp(-58,-18,u)]);
  }
  const TR=WATER.terraces({
   name:'East Hearth White Silica Sinter Terraces',
   line:tLine,
   levels:[13.4,11.2,9.0,6.8,4.4],
   width:[11,13,15,17,19],
   riser:1.6,
   speed:0.65,
   treadSpeed:0.30
  });
  WATER.drawTerraces(TR,{
   pick:true,
   pool:{
    color:0x7ce2dc,
    roughness:0.05,
    metalness:0.08,
    envMapIntensity:0.55,
    opacity:0.93,
    gradient:{centre:0x22b8b4,rim:0xeafaf8,power:1.08},
    renderOrder:1
   },
   fall:{
    color:0xe8faf8,
    opacity:0.92,
    plungeR:4.2,
    plungeFade:0.75,
    spray:false,
    renderOrder:3
   }
  });
  W_OUT.terraces+=TR.pools.length;
  return{S:SL,material:DL.material,mesh:DL.mesh};
 }

 if(SKEY==='glasssheet'){
  // Melt-Sheet Tarn (+0.60 m) receiving the meteoritic iron-nickel placer creek
  const ms=SITE.meltSheet;
  const tBox=[ms.tarnCx-ms.tarnRx-18,ms.tarnCz-ms.tarnRz-18,ms.tarnCx+ms.tarnRx+18,ms.tarnCz+ms.tarnRz+18];
  const tMask=makeOpenMask(tBox,4,(x,z)=>Math.hypot((x-ms.tarnCx)/(ms.tarnRx*1.06),(z-ms.tarnCz)/(ms.tarnRz*1.06))<1.0&&DRAWN_H(x,z)<0.72);
  const ST=WATER.open({
   name:'Glass-Pan Impact-Melt Tarn',
   level:ms.tarnLevelY,
   bounds:tBox,
   bed:DRAWN_H,
   bedCell:4,
   mask:tMask,
   field:0.35
  });
  const DT=WATER.draw(ST,{
   shallow:0x589aa4,
   deep:0x102838,
   ramp:[0.3,5.5],
   roughness:0.06,
   metalness:0.08,
   envMapIntensity:0.52,
   surf:false,
   breakers:false,
   pick:true
  });
  W_OUT.opens++;
  return{S:ST,material:DT.material,mesh:DT.mesh};
 }

 // Station 5 (highbowl): Frozen cryofumarole crater tarn via WATER.ice + WATER.drawIce (ext/54 + 54b)
 const it=SITE.iceTarn;
 const icePoly=makeOvalPoly(it.cx,it.cz,it.rx*0.95,it.rz*0.95,28,9560);
 const ICE_SURF=WATER.ice({
  name:'Old Rim Frozen Cryofumarole Tarn',
  poly:icePoly,
  level:it.levelY,
  rim:{width:5.5,salt:false},
  drifts:{wind:0.32,spacing:15,chance:0.48,len:[8,20],wid:[2.5,5.0],depth:[0.14,0.38]},
  cracks:{cell:20,jitter:0.8,width:0.038},
  seed:9565
 });
 const DI=WATER.drawIce(ICE_SURF,{cell:2,roughness:[0.10,0.88],envMapIntensity:0.54,pick:true});
 if(DI.mesh)DI.mesh.userData.noSnow=true;
 if(DI.drifts)DI.drifts.userData.noSnow=true;
 W_OUT.ice++;
 return{S:null,material:DI.material,mesh:DI.mesh};
})();

// Monotone non-rising snowmelt & meteoritic nickel creeks (terminate <= 12 m inside receiving lakes!)
FLOW_LINES.forEach(FL=>{
 const pts=[];
 let yc=FL.levelTop;
 for(let i=0;i<FL.pts.length;i++){
  const px=FL.pts[i][0],pz=FL.pts[i][1];
  const u=i/(FL.pts.length-1);
  const targetY=lerp(FL.levelTop,FL.levelBot,u);
  yc=Math.min(yc,targetY);
  pts.push([px,pz,yc]);
 }
 const isNickel=SKEY==='glasssheet';
 const fw=WATER.flow({
  name:FL.name,
  pts:pts,
  width:FL.w*2,
  speed:FL.speed,
  rapids:[0.016,0.068]
 });
 const fd=WATER.drawFlow(fw,{
  shallow:lin(isNickel?0xb48844:0x66bcc4),
  deep:lin(isNickel?0x3a2a16:0x14485c),
  color:0xffffff,
  roughness:0.08,
  metalness:0.06,
  envMapIntensity:0.50,
  step:4.5,
  across:5,
  margin:1.1,
  endFade:10,
  spray:false,
  renderOrder:2,
  pick:true
 });
 fd.mesh.userData.inspectLabel=FL.name;
 W_OUT.flows++;
});

if(WATER.breakupFlows)WATER.breakupFlows();

if(typeof WATER.mirrorSwitch==='function'&&MAIN_WATER&&MAIN_WATER.S&&MAIN_WATER.S.level!=null){
 WATER.mirrorSwitch({
  THREE:THREE,
  renderer:renderer,
  scene:scene,
  camera:camera,
  sky:SKY,
  materials:[MAIN_WATER.material],
  level:MAIN_WATER.S.level,
  center:[0,0],
  radius:TERR.R,
  far:5500
 });
}

window._water=Object.assign({surfaces:WATER.surfaces.length},W_OUT);
