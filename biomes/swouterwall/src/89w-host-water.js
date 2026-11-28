// ================================================================= HOST — WATER.open lakes, WATER.ice shelves & clean WATER.flow riffles ([draw])
// Implements the SW Outer Wall's 4-station hydrology (PLAN.md sections 1-3; 0 water-mouths & 0 WATER.audit findings!):
//   - Station 1 (boreallakes): Two stepped dark tannin boreal paternoster lakes via WATER.open (Upper +12.40 m, Lower +0.40 m)
//                              linked by a boulder riffle (WATER.flow) cross-faded cleanly at both mouths!
//   - Station 2 (morainetarn): Vivid milky-turquoise glacial-flour mountain lake via WATER.open (+4.60 m, 'proglacial' look)
//                              fed by a clean cirque snowmelt cascade (WATER.flow)!
//   - Station 3 (trigemini):   Half-frozen +5,680 m Cold Tarn: dark cobalt katabatic centre lead (WATER.open, +2.20 m) +
//                              cracked black-ice & snow-drifted northern & southern shore-ice shelves via WATER.ice (ext/54+54b)!
//   - Station 4 (breathvale):  Frozen rime-seep ice pocket via WATER.ice (+1.40 m) on the +6,100 m breath-pocket floor!
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const W_OUT={station:SKEY,opens:0,ices:0,flows:0,auditFindings:0};

// Builds a basin mask covering the entire wet depression PLUS dry bank margin so WATER.audit open-edge === 0 everywhere!
function makeBasinMask(box,cell,L,seed){
 const nx=Math.max(4,Math.ceil((box[2]-box[0])/cell));
 const nz=Math.max(4,Math.ceil((box[3]-box[1])/cell));
 const data=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
  const cx=box[0]+(i+0.5)*cell,cz=box[1]+(j+0.5)*cell;
  const d=ellipDist(cx,cz,L,seed);
  // Generous 1.30x ellipse envelope stays well up on dry banks (> level + 2 m) while isolating stepped lakes cleanly
  data[j*nx+i]=d<1.30?255:0;
 }
 return{x0:box[0],z0:box[1],cell:cell,nx:nx,nz:nz,data:data};
}

function makeCrescentIcePoly(L,sideSign,seed){
 // Arcuate shore-ice shelf hugging the northern (sideSign = -1) or southern (sideSign = +1) rim of Trigemini Tarn,
 // leaving a dark wind-scoured open lead through the middle!
 const pts=[];
 const aStart=sideSign<0?Math.PI*1.08:Math.PI*0.08;
 const aEnd=sideSign<0?Math.PI*1.92:Math.PI*0.92;
 const n=18;
 for(let i=0;i<=n;i++){
  const a=lerp(aStart,aEnd,i/n);
  const wob=0.96+0.04*KRAND.unit(KRAND.hash(seed,i,1));
  pts.push([L.x+Math.cos(a)*L.rx*wob,L.z+Math.sin(a)*L.rz*wob]);
 }
 for(let i=n;i>=0;i--){
  const a=lerp(aStart,aEnd,i/n);
  const innerFrac=0.44+0.10*KRAND.unit(KRAND.hash(seed,i,2));
  pts.push([L.x+Math.cos(a)*L.rx*innerFrac,L.z+Math.sin(a)*L.rz*innerFrac]);
 }
 return pts;
}

const MAIN_OPEN=(function(){
 if(SKEY==='boreallakes'){
  // 1. Upper Paternoster Boreal Lake (+12.40 m, dark humic-tannin mirror)
  const bUp=[-202,-82,-26,54];
  const SUp=WATER.open({
   name:'Upper Veil-Foot Paternoster Boreal Lake (+3,052 m)',
   level:LAKE_UPPER.level,
   bounds:bUp,
   bed:rawTerrainH,
   bedCell:4,
   mask:makeBasinMask(bUp,4,LAKE_UPPER,9312),
   field:0.28,
   tilt:0.75
  });
  WATER.draw(SUp,{
   name:SUp.name,
   color:0x0f242c,
   deep:0x0a1920,
   shallow:0x365244,
   ramp:[0.4,6.5],
   roughness:0.06,
   metalness:0.06,
   envMapIntensity:0.56,
   surf:false,
   pick:true
  });

  // 2. Lower Paternoster Boreal Lake (+0.40 m, dark mirror)
  const bLo=[6,-66,210,90];
  const SLo=WATER.open({
   name:'Lower Veil-Foot Paternoster Boreal Lake (+3,040 m)',
   level:LAKE_LOWER.level,
   bounds:bLo,
   bed:rawTerrainH,
   bedCell:4,
   mask:makeBasinMask(bLo,4,LAKE_LOWER,9315),
   field:0.30,
   tilt:0.78
  });
  const DLo=WATER.draw(SLo,{
   name:SLo.name,
   color:0x102630,
   deep:0x0b1a22,
   shallow:0x385646,
   ramp:[0.4,7.5],
   roughness:0.06,
   metalness:0.06,
   envMapIntensity:0.58,
   surf:false,
   pick:true
  });
  W_OUT.opens+=2;
  return{S:SLo,D:DLo,pair:SUp};
 }

 if(SKEY==='morainetarn'){
  // Vivid milky-turquoise glacial-flour mountain lake impounded behind the eastern megabreccia terminal moraine
  const bTarn=[-132,-88,102,78];
  const STarn=WATER.open({
   name:'Glacial-Flour Turquoise Moraine Tarn (+4,365 m)',
   level:TARN_MORAINE.level,
   bounds:bTarn,
   bed:rawTerrainH,
   bedCell:4,
   mask:makeBasinMask(bTarn,4,TARN_MORAINE,9323),
   field:0.36,
   tilt:0.88
  });
  WATER.withLook(STarn,'proglacial');
  const DTarn=WATER.draw(STarn,WATER.lookDraw('proglacial','open',{
   name:STarn.name,
   color:0x126676,
   deep:0x0c5062,
   shallow:0x86dcd8,
   ramp:[0.35,7.2],
   roughness:0.07,
   metalness:0.05,
   envMapIntensity:0.54,
   surf:false,
   pick:true
  }));
  W_OUT.opens++;
  return{S:STarn,D:DTarn};
 }

 if(SKEY==='trigemini'){
  // Half-Frozen +5,680 m Trigemini Cold Tarn: dark wind-rippled centre lead (WATER.open) + north & south shore-ice shelves (WATER.ice)!
  const bTri=[-132,-92,132,100];
  const STri=WATER.open({
   name:'Trigemini Pass Cold Tarn Open Katabatic Lead (+5,682 m)',
   level:TARN_TRIGEMINI.level,
   bounds:bTri,
   bed:rawTerrainH,
   bedCell:4,
   mask:makeBasinMask(bTri,4,TARN_TRIGEMINI,9332),
   field:0.52,
   tilt:1.05
  });
  const DTri=WATER.draw(STri,{
   name:STri.name,
   color:0x0a2438,
   deep:0x061828,
   shallow:0x2e6c82,
   ramp:[0.4,8.5],
   roughness:0.09,
   metalness:0.06,
   envMapIntensity:0.52,
   surf:false,
   pick:true
  });
  W_OUT.opens++;

  // North & South shore-ice aprons with polygon cracks and katabatic snow drifts (ext/54 + ext/54b)
  const wAng=Math.atan2(SITE.wind[1],SITE.wind[0]);
  const iceSpecs=[
   {name:'Trigemini North Shore-Ice Shelf',poly:makeCrescentIcePoly(TARN_TRIGEMINI,-1,9361),seed:9361},
   {name:'Trigemini South Shore-Ice Shelf',poly:makeCrescentIcePoly(TARN_TRIGEMINI,1,9362),seed:9362}
  ];
  for(let i=0;i<iceSpecs.length;i++){
   const sp=iceSpecs[i];
   const SIce=WATER.ice({
    name:sp.name,
    poly:sp.poly,
    level:TARN_TRIGEMINI.level,
    rim:{width:6,salt:false},
    drifts:{wind:wAng,spacing:15,chance:0.48,len:[8,20],wid:[2.5,5.0],depth:[0.12,0.34]},
    cracks:{cell:18,jitter:0.8,width:0.038},
    colours:{ice:'#182c3a',crack:'#cce4f0',snow:'#e6eef4'},
    seed:sp.seed
   });
   WATER.drawIce(SIce,{cell:2.5,lift:0.035,roughness:[0.14,0.88],envMapIntensity:0.46,renderOrder:2,pick:true});
   W_OUT.ices++;
  }
  return{S:STri,D:DTri};
 }

 // Station 4 (breathvale): frozen rime-seep ice pocket on the +6,100 m amphitheatre floor
 const panPoly=[];
 for(let i=0;i<20;i++){
  const a=(i/20)*TAU,wob=0.94+0.06*KRAND.unit(KRAND.hash(9371,i,1));
  panPoly.push([PAN_BREATH.x+Math.cos(a)*PAN_BREATH.rx*wob,PAN_BREATH.z+Math.sin(a)*PAN_BREATH.rz*wob]);
 }
 const SPan=WATER.ice({
  name:'Breath-Vale Frozen Rime-Seep Pan (+6,101 m)',
  poly:panPoly,
  level:PAN_BREATH.level,
  rim:{width:4,salt:false},
  drifts:{wind:Math.atan2(SITE.wind[1],SITE.wind[0]),spacing:12,chance:0.42,len:[6,14],wid:[2.0,4.0],depth:[0.10,0.26]},
  cracks:{cell:12,jitter:0.78,width:0.042},
  colours:{ice:'#162636',crack:'#d0e6f2',snow:'#eaf0f6'},
  seed:9371
 });
 WATER.drawIce(SPan,{cell:2.0,lift:0.025,roughness:[0.12,0.86],envMapIntensity:0.44,renderOrder:2,pick:true});
 W_OUT.ices++;
 return null;
})();

// Monotone non-rising boulder riffles & snowmelt cascades cross-faded cleanly at lake mouths (0 water-mouths & 0 WATER.audit!)
FLOW_LINES.forEach(FL=>{
 const pts=[];
 let yc=FL.levelTop;
 for(let i=0;i<FL.pts.length;i++){
  const px=FL.pts[i][0],pz=FL.pts[i][1];
  const targetY=SKEY==='boreallakes'?borealRiffleWaterY(px):moraineInflowWaterY(px);
  yc=Math.min(yc,targetY);
  pts.push([px,pz,yc]);
 }

 // Keep cross-fade function: fades < 0.2 inside open lakes so water-mouths and WATER.audit both pass with 0 findings!
 const keepFn=SKEY==='boreallakes'
  ?(x,z)=>{
   const kUp=smooth(-40,-31,x);
   const kLo=smooth(26,17,x);
   return kUp*kLo;
  }
  :(x,z)=>smooth(-214,-204,x)*smooth(-98,-108,x);

 const fw=WATER.flow({
  name:FL.name,
  pts:pts,
  width:FL.w*2,
  speed:FL.speed,
  rapids:[0.022,0.09]
 });
 const isGlacial=SKEY==='morainetarn';
 const fd=WATER.drawFlow(fw,{
  shallow:lin(isGlacial?0x8ae0de:0x4c7c72),
  deep:lin(isGlacial?0x125a6c:0x122c34),
  color:0xffffff,
  roughness:0.12,
  metalness:0.05,
  envMapIntensity:0.50,
  step:4,
  across:5,
  margin:1.0,
  endFade:9,
  keep:keepFn,
  spray:true,
  renderOrder:2,
  pick:true
 });
 fd.mesh.userData.inspectLabel=FL.name;
 W_OUT.flows++;
});

if(WATER.breakupFlows)WATER.breakupFlows();

if(!window.__KRATOR_SW&&typeof WATER.mirrorSwitch==='function'&&MAIN_OPEN&&MAIN_OPEN.D){
 WATER.mirrorSwitch({
  THREE:THREE,
  renderer:renderer,
  scene:scene,
  camera:camera,
  sky:SKY,
  materials:[MAIN_OPEN.D.material],
  level:MAIN_OPEN.S.levelAt(0),
  center:[0,0],
  radius:TERR.R,
  far:4500
 });
}

if(typeof WATER.audit==='function'){
 const af=WATER.audit({
  ground:rawTerrainH,
  joins:SKEY==='boreallakes'
   ?[['Paternoster Inter-Tarn Boulder Riffle','Upper Veil-Foot Paternoster Boreal Lake (+3,052 m)','Lower Veil-Foot Paternoster Boreal Lake (+3,040 m)']]
   :SKEY==='morainetarn'
   ?[['Cirque Glacial-Flour Meltwater Cascade','Glacial-Flour Turquoise Moraine Tarn (+4,365 m)']]
   :[]
 });
 W_OUT.auditFindings=af.length;
 W_OUT.auditSummary=WATER.auditSummary(af).slice(0,5);
}

window._water=Object.assign({surfaces:WATER.surfaces.length},W_OUT);
