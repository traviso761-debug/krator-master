// ================================================================= HOST — skerry channels (WATER.open + farBed), cataracts & shell pools ([draw])
// Implements Matron's Coast hydrology across all 4 stations (PLAN.md sections 1 & 4):
//   - skerry & kelpfront: WATER.open drowned skerry sound & ocean rollers + shore window + WATER.farBed (53-core-water-farbed)
//                         + coastal rain-cataracts (WATER.flow) clipped cleanly at SEA.level via keepFn (100% water-mouths clean!)
//   - skerry, browsewood, kelpfront: shell-dammed coquina pools & mucus-sealed vernal lime-pools (WATER.still)
//   - cloudslope: 6-tread Shell-Cemented Tufa Cataract (WATER.terraces + WATER.drawTerraces) + Misty Plunge Tarn (WATER.still)
//   - WATER.mirrorSwitch attached strictly OFF at page load.
{
 const env=new THREE.Scene(),WENV={environment:null};
 ATMOS.skylight({renderer:renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x3c5442)});
}

const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const W_OUT={station:SKEY,sea:false,farBed:false,stills:0,flows:0,falls:0,skyPonds:0};

function seaBedAt(x,z){
 if(Math.abs(x)<=TERR.R*1.08&&Math.abs(z)<=TERR.R*1.08)return terrainH(x,z);
 return landH(x,z);
}

function makeOvalPoly(cx,cz,rx,rz,nPts,seed){
 const pts=[];
 for(let i=0;i<nPts;i++){
  const a=(i/nPts)*TAU;
  const wob=1.0+0.04*(KRAND.unit(KRAND.hash(seed,i,1))-0.5);
  pts.push([+(cx+Math.cos(a)*rx*wob).toFixed(2),+(cz+Math.sin(a)*rz*wob).toFixed(2)]);
 }
 return pts;
}

let SEA_WATER=null,SEA_DRAW=null;
if(SITE.hasSea){
 const OB=[-12000,-12000,12000,12000];
 const WBOX=[-TERR.R*1.08,-TERR.R*1.08,TERR.R*1.08,TERR.R*1.08];
 const LIME_SHOAL=lin(0x88cfc4).getHex();
 const KELP_TINT=lin(0x466e3c).getHex();

 SEA_WATER=WATER.open({
  name:SKEY==='skerry'?'Drowned 16-Island Skerry Jade Sound':'Southern Kelp-Front Ocean Rollers',
  level:SITE.seaLevel,
  swell:SKEY==='kelpfront'?[[0.30,58,38,0,0.05],[0.15,26,55,1.1,0.04]]:[[0.18,46,42,0,0.04],[0.09,22,64,0.9,0.03]],
  field:SKEY==='kelpfront'?0.32:0.20,
  bounds:OB,
  bed:seaBedAt,
  shore:{
   window:1120,
   cell:7,
   seeds:(x,z)=>seaBedAt(x,z)<SITE.seaLevel-0.1,
   band:46
  },
  tint:{
   box:WBOX,
   cell:10,
   at:(x,z)=>{
    const bed=terrainH(x,z);
    if(bed>=SITE.seaLevel)return null;
    if(SKEY==='kelpfront'&&bed>-9.0){
     return{c:KELP_TINT,a:0.30*smooth(-9.0,-0.5,bed)};
    }
    if(bed>-4.5){
     return{c:LIME_SHOAL,a:0.24*smooth(-4.5,-0.2,bed)};
    }
    return null;
   }
  }
 });

 if(WATER.moveShore)WATER.moveShore(SEA_WATER,0,0);
 if(WATER.farBed)WATER.farBed(SEA_WATER,{ground:seaBedAt,cell:120});

 SEA_DRAW=WATER.draw(SEA_WATER,{
  surf:true,
  breakers:true,
  renderOrder:1,
  roughness:SKEY==='kelpfront'?0.16:0.12,
  metalness:0.05,
  envMapIntensity:0.42,
  ramp:[1.2,14],
  pick:true,
  shallow:lin(SKEY==='kelpfront'?0x367e72:0x2e8a7c),
  deep:lin(0x0c303a)
 });
 SEA_DRAW.mesh.userData.inspectLabel=SEA_WATER.name;
 W_OUT.sea=true;
 W_OUT.farBed=!!SEA_WATER.farBed;
}

/* Monotonically descending coastal rain-streams clipped cleanly at SEA.level + 0.20 m via keepFn (100% water-mouths safe!) */
for(let si=0;si<STREAMS.length;si++){
 const ST=STREAMS[si];
 const P=[];
 let yc=1e9;
 const sLvl=SITE.hasSea?SITE.seaLevel:-1e9;

 for(let i=0;i<ST.pts.length;i++){
  const pt=ST.pts[i];
  const gH=terrainH(pt[0],pt[1]);
  if(SITE.hasSea&&gH<=sLvl+0.40){
   if(P.length>0){
    const prev=ST.pts[i-1],prevG=terrainH(prev[0],prev[1]);
    const frac=prevG>sLvl?clamp((prevG-(sLvl+0.40))/Math.max(0.05,prevG-gH),0,1):0;
    const mx=lerp(prev[0],pt[0],frac),mz=lerp(prev[1],pt[1],frac);
    P.push([mx,mz,sLvl+0.20]);
   }
   break;
  }
  const bedY=gH+ST.depth;
  yc=Math.min(yc,bedY);
  if(SITE.hasSea)yc=Math.max(yc,sLvl+0.24);
  P.push([pt[0],pt[1],yc]);
 }

 if(P.length>=2){
  const mEnd=P[P.length-1];
  const keepFn=SITE.hasSea?(x,z)=>{
   const dMouth=Math.hypot(x-mEnd[0],z-mEnd[1]);
   const aboveSea=smooth(sLvl-0.05,sLvl+0.90,terrainH(x,z));
   return clamp(Math.min(dMouth/16.0,aboveSea),0,1);
  }:null;

  const fl=WATER.flow({
   name:ST.name,
   pts:P,
   width:ST.w*2,
   speed:ST.speed,
   rapids:[0.03,0.12]
  });
  if(keepFn)fl.keepAt=keepFn;
  const dr=WATER.drawFlow(fl,Object.assign({
   shallow:lin(0x62a498),
   deep:lin(0x1f4c4c),
   color:0xffffff,
   roughness:0.11,
   metalness:0.05,
   envMapIntensity:0.46,
   step:4,
   across:5,
   margin:0.8,
   depthBias:1.2,
   renderOrder:2,
   pick:true,
   refine:true
  },keepFn?{keep:keepFn}:{}));
  dr.mesh.userData.inspectLabel=ST.name;
  W_OUT.flows++;
 }
}

/* Ground still pools & Station 4 Shell-Cemented Tufa Cataract */
const MAIN_STILL=(function(){
 if(SKEY==='skerry'){
  const sp=WATER.still({
   name:'Shell-Dammed Coquina Emerald Pool',
   level:7.25,
   poly:makeOvalPoly(-68,26,10.5,9.2,16,9401),
   gradient:{centre:0x145458,rim:0x66c4b2,power:1.15,at:[-68,26],radius:11}
  });
  const dp=WATER.drawStill(sp,{roughness:0.06,metalness:0.08,envMapIntensity:0.52,opacity:0.92,renderOrder:2,pick:true});
  W_OUT.stills++;
  return dp;
 }
 if(SKEY==='browsewood'){
  const sp=WATER.still({
   name:'Mucus-Sealed Cathedral Vernal Lime-Pool',
   level:6.05,
   poly:makeOvalPoly(-8,22,12.2,10.6,18,9402),
   gradient:{centre:0x184e4c,rim:0x72bca8,power:1.15,at:[-8,22],radius:13}
  });
  const dp=WATER.drawStill(sp,{roughness:0.05,metalness:0.10,envMapIntensity:0.56,opacity:0.92,renderOrder:2,pick:true});
  W_OUT.stills++;
  return dp;
 }
 if(SKEY==='kelpfront'){
  const sp=WATER.still({
   name:'Coquina Wrack-Bench Tidepool',
   level:5.25,
   poly:makeOvalPoly(18,-62,8.8,7.6,16,9403),
   gradient:{centre:0x1c4a48,rim:0x6ab49c,power:1.15,at:[18,-62],radius:9}
  });
  const dp=WATER.drawStill(sp,{roughness:0.06,metalness:0.08,envMapIntensity:0.52,opacity:0.92,renderOrder:2,pick:true});
  W_OUT.stills++;
  return dp;
 }

 /* Station 4 (cloudslope): 6-tread Shell-Cemented Tufa Cataract + Misty Plunge Tarn */
 const tLine=[];
 for(let i=0;i<=20;i++){
  const x=-42+(96*i)/20;
  tLine.push([x,5.5*Math.sin((x+40)*0.022)]);
 }
 const TR=WATER.terraces({
  name:'White-Pass Shell-Cemented Tufa Cataract',
  line:tLine,
  levels:[26.2,21.6,17.2,12.8,8.6,4.6],
  width:[13,15,17,19,21,23],
  riser:2.0,
  speed:0.85,
  treadSpeed:0.38
 });
 WATER.drawTerraces(TR,{
  pick:true,
  pool:{
   color:0x78d4cc,
   roughness:0.06,
   metalness:0.08,
   envMapIntensity:0.54,
   opacity:0.92,
   gradient:{centre:0x1e7e88,rim:0xdaf4f0,power:1.1},
   renderOrder:1
  },
  fall:{
   color:0xe2f6f6,
   opacity:0.92,
   plungeR:4.8,
   plungeFade:0.75,
   spray:false,
   renderOrder:3
  }
 });
 W_OUT.stills+=TR.pools.length;
 W_OUT.falls+=TR.falls.length;

 const tarn=WATER.still({
  name:'Cloudslope Shell-Tufa Plunge Tarn',
  level:2.85,
  poly:makeOvalPoly(76,0,20.0,14.2,20,9404),
  fountain:[56,0],
  gradient:{centre:0x124852,rim:0x58b8ae,power:1.15,at:[76,0],radius:21}
 });
 const dt=WATER.drawStill(tarn,{roughness:0.06,metalness:0.08,envMapIntensity:0.54,opacity:0.92,renderOrder:1,pick:true});
 W_OUT.stills++;
 return dt;
})();

if(WATER.breakupFlows)WATER.breakupFlows();

if(typeof WATER.mirrorSwitch==='function'&&MAIN_STILL&&MAIN_STILL.S){
 WATER.mirrorSwitch({
  THREE:THREE,
  renderer:renderer,
  scene:scene,
  camera:camera,
  sky:SKY,
  materials:[MAIN_STILL.material],
  level:MAIN_STILL.S.level,
  center:[0,0],
  radius:TERR.R,
  far:4500
 });
}

window._water=Object.assign({surfaces:WATER.surfaces.length},W_OUT);
