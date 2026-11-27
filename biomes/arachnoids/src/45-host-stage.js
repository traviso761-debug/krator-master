// ================================================================= HOST — stage: 4-station canyon heightfields, KSTACKS, KRELIEF.slab, KFROST, KTHERM, KSPACE & BIO.init ([web])
// Implements all 4 verified Core Arachnoid Canyons Proper (`own`) stations from PLAN.md section 3:
//   nexus    (default, dist/arachnoids.html):          (998, 290) +660.6 m, 1.47 atm, 3-spoke arch-rift-basalt star-junction, 9102 Ham-Tsek gorge & Tsek-Ma bridge-webs
//   fumarole (dist/arachnoids-fumarole.html):          (1097, 331) +912.6 m, 1.43 atm, +28 C cauldron trough, 9 basalt-weir step-pools & KTHERM fumaroles
//   ledges   (dist/arachnoids-ledges.html):            (984, 283) +1,629.0 m, 1.31 atm, Csa KRELIEF.slab colonnade & outland-tuff benches + KSPELEO.SMOKY Kluft
//   frostrim (dist/arachnoids-frostrim.html):          (919, 281) +4,784.3 m, 0.88 atm, ET -2 C KFROST stone polygons, vitrophyre dike ribs & updraft-sheared rimkrummholz
const {TAU,clamp,lerp,mix,smooth,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];
function REGISTER(o){
 REG.push(o);
 BIO.record(o);
 if(typeof KTAGS!=='undefined'&&KTAGS.page&&o.tagId){
  try{KTAGS.page.add({id:o.tagId,name:o.name,class:o.tagClass||'feature',at:[o.x,o.y==null?0:o.y,o.z],r:o.r,h:o.h,tags:o.tags||{}});}catch(e){}
 }
}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z,ry=r.y==null?0:r.y;return dx*dx+dz*dz<=r.r*r.r&&y>=ry-6&&y<=ry+r.h+10;}

const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'nexus';
const SITE=ARACH_SITES[SKEY]||ARACH_SITES.nexus;
const STATION_REGION=SITE.name+' ('+SITE.region+')';
const PQ=new URLSearchParams(location.search);

// Live weather/microclimate state toggled by [Clear] / [Slot-Mist] / [Rim-Gale] in 99-host-take.js
const ARACH_STATE={
 mode:'Clear',
 mistBoost:0,
 windGain:1.0
};

const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
{BIO.INDEX_ITEMS=PQ.get('index')!=='0';BIO.LOD.merge=PQ.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&PQ.get('lodfade')!=='0'?0.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&PQ.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.0;
document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const HAZE_HEX=SKEY==='nexus'?0xc4d0d2:SKEY==='fumarole'?0xc6d4ce:SKEY==='ledges'?0xd2cfc6:0xcad4dc;
const HAZE=new THREE.Color(HAZE_HEX);
scene.fog=new THREE.FogExp2(HAZE.getHex(),SKEY==='nexus'?0.00032:SKEY==='fumarole'?0.00036:SKEY==='ledges'?0.00022:0.00020);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,0.4,18000);
scene.add(new THREE.HemisphereLight(0xdce6ec,0x484c44,0.84));
const sun=new THREE.DirectionalLight(0xfff2de,1.36);
sun.position.set(440,940,-620);
scene.add(sun);
const fill=new THREE.DirectionalLight(0xd0e0ec,0.22);
fill.position.set(-580,380,620);
scene.add(fill);

// ---------------------------------------------------------------- core/terrain helpers: KTHERM, KRELIEF.slab, KFROST
const TERR={R:720};
const n2=(x,z,f,seed)=>KRAND.fbm(x*f,0.5,z*f,2,seed)-0.5;

// Station 2 (fumarole): KTHERM ground temperature field between ring-fault vents
const THERM=(SKEY==='fumarole'&&typeof KTHERM!=='undefined'&&SITE.vents)?KTHERM.create({
 soil:SITE.tempMeanC,
 vents:SITE.vents,
 detail:{amp:1.4,scale:0.022,seed:5911}
}):null;
const THERM_F=THERM?THERM.bake({box:[-TERR.R,-TERR.R,TERR.R,TERR.R],cell:8}):null;

// Station 3 (ledges): KRELIEF.slab stepped horizontal-colonnade & tuff cliff wall dropping into the +z slot abyss
const LEDGE_SLAB=(SKEY==='ledges'&&typeof KRELIEF!=='undefined'&&typeof KRELIEF.slab==='function')?KRELIEF.slab({
 pts:[[-780,-38],[-260,-22],[220,-34],[780,-18]],
 side:-1,
 h:245,
 run:235,
 power:1.35,
 dip:0.04,
 seed:5921,
 spurs:{sp:185,spread:[0.7,1.3],w:[0.58,0.84],out:[32,96],run:[0.8,1.3],power:[1.1,1.7],dh:[-0.05,0.03],tip:[0.02,0.08]},
 gullies:{back:[28,82]},
 cones:{h:[18,46],reach:[95,190]},
 skirt:{h:0.04,reach:0.32},
 ledges:{n:6,w:0.12,wander:0.028,k:[0.88,1.85]},
 rough:{face:0.028,flute:0.018,crest:0.04}
}):null;

// Station 4 (frostrim): KFROST periglacial sorted stone polygons across the granite/vitrophyre plateau
const FROST=(SKEY==='frostrim'&&typeof KFROST!=='undefined')?KFROST.create({
 seed:5931,
 ground:(x,z)=>0,
 polygons:{
  cell:16,trough:0.30,rim:0.10,width:0.18,
  where:(x,z)=>clamp(smooth(132,68,z)*smooth(320,180,Math.hypot(x*0.7,z)),0,1)
 }
}):null;

// Step-pools on Station 2 (fumarole): strictly monotone downslope
const STEP_POOLS=(SKEY==='fumarole'&&SITE.stepPools)?SITE.stepPools.slice():[];

// Trunk river 9102 Ham-Tsek polylines on Stations 1-3 (0 flows on Station 4 frostrim!)
const FLOW_LINES=(function(){
 if(SKEY==='nexus'){
  // 9102 Ham-Tsek (Q = 1,295 m3/s) breaching the 3-spoke radial basalt dike star-junction from NE to SW
  const pts=[];
  for(let i=0;i<=28;i++){
   const t=i/28;
   const x=380-760*t;
   const z=-210+410*t+18*Math.sin(t*5.4);
   pts.push([x,z]);
  }
  return[{name:'Ham-Tsek River (9102 Radial Shut-In Rapids, 1295 m3/s)',pts:pts,w:17.5,depth:1.35,speed:3.2}];
 }
 if(SKEY==='fumarole'){
  // 9102 Ham-Tsek (Q = 995 m3/s) along the northern cauldron wall + warm sinter step-pool spillway rill
  const main=[],spill=[];
  for(let i=0;i<=26;i++){
   const t=i/26;
   main.push([380-760*t,-116+14*Math.sin(t*4.8)]);
  }
  for(let i=0;i<=12;i++){
   const t=i/12;
   spill.push([88+46*t,-42-68*t]);
  }
  return[
   {name:'Ham-Tsek River (9102 Cauldron Trough, 995 m3/s)',pts:main,w:16.0,depth:1.25,speed:2.5},
   {name:'Basalt-Weir Step-Pool Tailrace',pts:spill,w:4.5,depth:0.55,speed:2.1}
  ];
 }
 if(SKEY==='ledges'){
  // Distant silver ribbon of 9102 Ham-Tsek deep on the slot floor (-164 m) below the Csa ledges
  const abyss=[];
  for(let i=0;i<=22;i++){
   const t=i/22;
   abyss.push([420-840*t,215+16*Math.sin(t*4.2)]);
  }
  return[{name:'Ham-Tsek Abyss Ribbon (970 m Below Ledges)',pts:abyss,w:15.0,depth:1.2,speed:2.6}];
 }
 return[];
})();

function distToPoly(pts,x,z){
 let best=1e9,bestT=0;
 for(let i=0;i<pts.length-1;i++){
  const ax=pts[i][0],az=pts[i][1],bx=pts[i+1][0],bz=pts[i+1][1];
  const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;
  const t=l2>1e-6?clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1):0;
  const d=Math.hypot(ax+dx*t-x,az+dz*t-z);
  if(d<best){best=d;bestT=(i+t)/(pts.length-1);}
 }
 return{d:best,t:bestT};
}

function segDist(ax,az,bx,bz,x,z){
 const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;
 const t=l2>1e-6?clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1):0;
 return Math.hypot(ax+dx*t-x,az+dz*t-z);
}

// ---------------------------------------------------------------- 4-station analytical canyon & radial-dike heightfields
function landNexus(x,z){
 // Deep slot gorge along FLOW_LINES[0] flanked by tepui sandstone walls (+145..+210 m) and crosscut by 3 radial basalt dike walls!
 const rv=distToPoly(FLOW_LINES[0].pts,x,z);
 const bed=mix(-7.5,-18.5,rv.t);
 // Steep slot canyon profile opening above +65 m into stepped sandstone shoulders
 let wall=158.0*Math.pow(smooth(19.0,155.0,rv.d),0.78)+48.0*smooth(145.0,390.0,rv.d);
 // Horizontal bedding steps on sandstone canyon walls
 wall+=3.2*Math.sin(wall*0.24)+9.5*n2(x,z,0.005,101)+2.4*n2(x,z,0.022,102);
 let h=bed+wall;

 // Three standing radial arch-rift-basalt dike walls slicing across the canyon and breached narrowly at the river shut-in!
 const dikes=SITE.dikes;
 for(let i=0;i<dikes.length;i++){
  const dk=dikes[i];
  const dd=segDist(dk.a[0],dk.a[1],dk.b[0],dk.b[1],x,z);
  const hw=dk.thickM*0.5;
  if(dd<hw*4.2){
   // River breaches the dike cleanly inside rv.d < 20 m, leaving sheer vertical basalt gate piers on both banks (rv.d >= 23 m)!
   const riverGate=smooth(17.5,27.5,rv.d);
   const ribProfile=smooth(hw*3.6,hw*0.55,dd);
   const hexStep=1.1*Math.floor((ribProfile*68.0)/2.2)*0.12;
   const dikeTop=bed+18.0+(dk.heightM*0.72+18.0*smooth(35.0,165.0,rv.d))*ribProfile+hexStep;
   h=mix(h,Math.max(h,dikeTop),ribProfile*riverGate);
  }
 }

 // Level cliff-pier bench at Hum Webgate reserve (-95, 60) at ~+34 m for toll-post capstans & safe camera/walker footing
 const R0=SITE.reserves[0];
 const rd=Math.hypot(x-R0.x,z-R0.z);
 if(rd<R0.r*1.15){
  h=mix(h,34.0+0.6*n2(x,z,0.025,105),smooth(R0.r*1.12,R0.r*0.55,rd));
 }
 // Gentle approach bench near saltpeter alcove portal (-54, 68)
 const ad=Math.hypot(x-SITE.alcove.portal[0],z-SITE.alcove.portal[1]);
 if(ad<24.0){
  h=mix(h,SITE.alcove.floorY+0.4,smooth(23.0,9.0,ad));
 }
 return h;
}

function landFumarole(x,z){
 // Broad warm hydrothermal cauldron trough (-8..+22 m) bounded north (z < -150) and south (z > 135) by sheer +190..+225 m dry cliffs
 let h=5.5+4.5*n2(x,z,0.005,201)+1.4*n2(x,z,0.024,202);
 const northCliff=208.0*Math.pow(smooth(-142.0,-315.0,z),0.82);
 const southCliff=214.0*Math.pow(smooth(128.0,305.0,z),0.82);
 h+=northCliff+southCliff;

 // Transverse basalt weir ribs crossing the cauldron floor
 for(let i=0;i<2;i++){
  const dk=SITE.dikes[i];
  const dd=segDist(dk.a[0],dk.a[1],dk.b[0],dk.b[1],x,z);
  if(dd<22.0){
   const rvCheck=distToPoly(FLOW_LINES[0].pts,x,z);
   const breach=smooth(15.0,26.0,rvCheck.d);
   h+=11.5*smooth(20.0,3.5,dd)*breach;
  }
 }

 // Main 9102 Ham-Tsek channel along northern foot (z ~ -116)
 const rv=distToPoly(FLOW_LINES[0].pts,x,z);
 if(rv.d<38.0){
  const bed=mix(-3.2,-11.8,rv.t);
  h=mix(h,bed,smooth(36.0,12.5,rv.d));
 }
 const sv=distToPoly(FLOW_LINES[1].pts,x,z);
 if(sv.d<16.0){
  h-=2.6*smooth(15.0,3.0,sv.d);
 }

 // 9 strictly monotone-descending basalt-weir step-pools with raised sinter rims
 for(let i=0;i<STEP_POOLS.length;i++){
  const P=STEP_POOLS[i];
  const d=Math.hypot(x-P.x,z-P.z)/(P.r*(1.0+0.06*n2(x,z,0.10,210+i)));
  if(d<1.55){
   const pad=smooth(1.52,1.05,d);
   const inBowl=smooth(1.00,0.68,d);
   const onRim=smooth(1.25,1.01,d)*smooth(0.78,1.01,d);
   const target=mix(P.crest,P.floor,inBowl)+0.12*onRim;
   h=mix(h,target,pad);
  }
 }

 // Raised porous white-ochre sinter mounds around fumarole vents
 const V=SITE.vents;
 for(let i=0;i<V.length;i++){
  const v=V[i];
  if(v.kind!=='point')continue;
  const vd=Math.hypot(x-v.x,z-v.z);
  if(vd<24.0){
   const cone=2.4*smooth(22.0,2.8,vd)-0.65*smooth(2.6,0.5,vd);
   h+=cone;
  }
 }

 // Flat placer-washing sandbar bench at Hum reserve (112, -36)
 const R0=SITE.reserves[0],rd=Math.hypot(x-R0.x,z-R0.z);
 if(rd<R0.r*1.15){
  h=mix(h,3.8+0.35*n2(x,z,0.03,230),smooth(R0.r*1.12,R0.r*0.55,rd));
 }
 return h;
}

function landLedges(x,z){
 // Base abyss floor at -168 m; KRELIEF.slab builds tiered horizontal-colonnade & outland-tuff benches up to +80..+135 m!
 let base=-168.0+6.0*n2(x,z,0.004,301);
 let h=LEDGE_SLAB?KRELIEF.shape(LEDGE_SLAB,x,z,base):(base+245.0*smooth(185.0,-65.0,z));
 // Crisp horizontal basalt colonnade steps on mid-wall benches (-10..+85 m)
 if(h>-25.0&&h<95.0){
  const stepH=7.5;
  const quant=Math.floor(h/stepH)*stepH;
  h=mix(h,quant+1.2,0.34*smooth(-22.0,-5.0,h)*smooth(92.0,68.0,h));
 }
 // Radial basalt dike ribs crosscutting the colonnade benches
 for(let i=0;i<SITE.dikes.length;i++){
  const dk=SITE.dikes[i];
  const dd=segDist(dk.a[0],dk.a[1],dk.b[0],dk.b[1],x,z);
  if(dd<18.0&&z<135.0){
   h+=16.5*smooth(17.0,3.2,dd)*smooth(140.0,25.0,z);
  }
 }
 // Abyss river cut at z ~ 215
 const rv=distToPoly(FLOW_LINES[0].pts,x,z);
 if(rv.d<32.0){
  h=mix(h,mix(-162.0,-169.5,rv.t),smooth(30.0,9.0,rv.d));
 }
 // Walkable shelf outside Smoky-Quartz Kluft portal (34, -46)
 const ad=Math.hypot(x-SITE.alcove.portal[0],z-SITE.alcove.portal[1]);
 if(ad<22.0){
  h=mix(h,SITE.alcove.floorY+0.25,smooth(21.0,8.0,ad));
 }
 // Hum cliff-stair landing reserve (-78, 18)
 const R0=SITE.reserves[0],rd=Math.hypot(x-R0.x,z-R0.z);
 if(rd<R0.r*1.1){
  h=mix(h,22.5+0.4*n2(x,z,0.03,310),smooth(R0.r*1.08,R0.r*0.5,rd));
 }
 h+=1.8*n2(x,z,0.025,311);
 return h;
}

function landFrostrim(x,z){
 // High ET (+4,784.3 m, 0.88 atm) granite felsenmeer plateau (z < 125) dropping precipitously south of z = 132 into a -220 m radial chasm!
 const lipZ=132.0+18.0*n2(x,z,0.004,401);
 let plateau=16.0+0.035*Math.max(0,-z)+9.5*n2(x,z,0.005,402)+2.2*n2(x,z,0.024,403);
 if(FROST)plateau+=FROST.h(x,z);

 // Standing jet-black glassy obsidian-vitrophyre dike hogback ribs piercing the frost-shattered granite
 for(let i=0;i<SITE.dikes.length;i++){
  const dk=SITE.dikes[i];
  const dd=segDist(dk.a[0],dk.a[1],dk.b[0],dk.b[1],x,z);
  const hw=dk.thickM*0.5;
  if(dd<hw*3.4){
   const sharp=Math.pow(smooth(hw*3.2,hw*0.35,dd),1.25);
   plateau+=dk.heightM*sharp*(1.0+0.12*n2(x,z,0.08,410+i));
  }
 }

 // Sheer 235 m radial chasm drop south of lipZ (z > lipZ)
 const drop=smooth(lipZ-6.0,lipZ+105.0,z);
 let chasm=-218.0+14.0*n2(x,z,0.008,405);
 let h=mix(plateau,chasm,Math.pow(drop,0.82));

 // Hum high-rim cairn reserve (-42, -36)
 const R0=SITE.reserves[0],rd=Math.hypot(x-R0.x,z-R0.z);
 if(rd<R0.r*1.1){
  h=mix(h,18.5+(FROST?FROST.h(x,z)*0.5:0),smooth(R0.r*1.08,R0.r*0.5,rd));
 }
 return h;
}

function land(x,z){
 if(SKEY==='nexus')return landNexus(x,z);
 if(SKEY==='fumarole')return landFumarole(x,z);
 if(SKEY==='ledges')return landLedges(x,z);
 return landFrostrim(x,z);
}

// Standing KSTACKS radial basalt & vitrophyre dike fins (meshed in 84-host-ground.js)
const DIKE_STACKS=(function(){
 if(typeof KSTACKS==='undefined')return[];
 const specs=SKEY==='nexus'?[
  {id:'nexus-fin-nw',x:-44,z:-34,H:58,r:9.5,e:3.6,ry:0.53,seed:5941},
  {id:'nexus-fin-se',x:46,z:32,H:62,r:10.0,e:3.8,ry:0.53,seed:5942},
  {id:'nexus-fin-ne',x:76,z:-48,H:54,r:9.0,e:3.4,ry:-0.58,seed:5943},
  {id:'nexus-fin-sw',x:-82,z:48,H:52,r:8.8,e:3.4,ry:-0.58,seed:5944}
 ]:SKEY==='fumarole'?[
  {id:'fum-weir-fin1',x:-82,z:-92,H:26,r:6.5,e:3.2,ry:1.36,seed:5945},
  {id:'fum-weir-fin2',x:34,z:-90,H:28,r:6.8,e:3.2,ry:1.37,seed:5946}
 ]:SKEY==='ledges'?[
  {id:'ledge-col-fin1',x:-115,z:42,H:38,r:8.2,e:3.5,ry:0.15,seed:5947},
  {id:'ledge-col-fin2',x:92,z:36,H:42,r:8.6,e:3.6,ry:-0.59,seed:5948}
 ]:[
  {id:'frost-vitro-fin1',x:-88,z:-58,H:16,r:5.2,e:4.4,ry:0.18,seed:5949,vitro:true},
  {id:'frost-vitro-fin2',x:74,z:22,H:18,r:5.5,e:4.6,ry:0.18,seed:5950,vitro:true},
  {id:'frost-vitro-lip',x:28,z:118,H:21,r:6.0,e:4.2,ry:0.03,seed:5951,vitro:true}
 ];
 const out=[];
 for(let i=0;i<specs.length;i++){
  const s=specs[i],y0=land(s.x,s.z)-2.5;
  const B=KSTACKS.make({
   id:s.id,kind:'fin',x:s.x,z:s.z,y0:y0,H:s.H,r:s.r,e:s.e,ry:s.ry,
   taper:0.32,crown:0.86,columns:{w:[1.1,2.1],d:0.32,ent:0.30},seed:s.seed
  });
  B.vitro=!!s.vitro;
  out.push(B);
 }
 return out;
})();

function water(x,z){
 if(SKEY==='nexus'){
  const rv=distToPoly(FLOW_LINES[0].pts,x,z);
  if(rv.d<FLOW_LINES[0].w*0.98)return mix(-7.5,-18.5,rv.t)+1.15;
  return -1e9;
 }
 if(SKEY==='fumarole'){
  for(let i=0;i<STEP_POOLS.length;i++){
   const P=STEP_POOLS[i];
   if(Math.hypot(x-P.x,z-P.z)<P.r*0.97)return P.level;
  }
  const rv=distToPoly(FLOW_LINES[0].pts,x,z);
  if(rv.d<FLOW_LINES[0].w*0.98)return mix(-3.2,-11.8,rv.t)+1.05;
  return -1e9;
 }
 if(SKEY==='ledges'){
  const rv=distToPoly(FLOW_LINES[0].pts,x,z);
  if(rv.d<FLOW_LINES[0].w*0.98)return mix(-162.0,-169.5,rv.t)+1.0;
  return -1e9;
 }
 // Station 4 frostrim: 100% dry/frozen high rim (0 standing water)
 return -1e9;
}

function landH(x,z){
 const r=Math.hypot(x,z);
 if(r<=TERR.R*1.06)return land(x,z);
 let far=0;
 if(SKEY==='nexus'||SKEY==='fumarole'){
  far=185.0+135.0*n2(x,z,0.00055,501)+42.0*n2(x,z,0.0018,502);
 }else if(SKEY==='ledges'){
  far=mix(165.0,-145.0,smooth(-120.0,650.0,z))+110.0*n2(x,z,0.0005,503)+36.0*n2(x,z,0.0018,504);
 }else{
  far=mix(38.0,-195.0,smooth(80.0,780.0,z))+95.0*n2(x,z,0.0005,505)+28.0*n2(x,z,0.0019,506);
 }
 return mix(land(x,z),far,smooth(TERR.R*0.96,TERR.R*1.35,r));
}

const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){
 if(x===_tm.x&&z===_tm.z)return _tm.h;
 let h=land(x,z);
 if(DIKE_STACKS.length&&typeof KSTACKS!=='undefined'&&typeof KSTACKS.topAt==='function'){
  const stTop=KSTACKS.topAt(DIKE_STACKS,x,z);
  if(stTop>h)h=stTop;
 }
 _tm.x=x;_tm.z=z;_tm.h=h;
 return h;
}
function waterH(x,z){return water(x,z);}
function elevASL(x,z){return SITE.elevM+(terrainH(x,z)-SITE.bedY);}

// ---------------------------------------------------------------- ARACH_PHYS raster field cache
function physAt(x,z,h){
 const fn=ARACH_PHYS.fissureNetAt(x,z,SITE);
 const inv=ARACH_PHYS.inversionAt(x,z,h,SITE);
 const fum=ARACH_PHYS.fumaroleAt(x,z,SITE);
 if(THERM_F&&typeof KTHERM!=='undefined'){
  const kt=KTHERM.fieldAt(THERM_F,x,z);
  fum.groundTempC=+kt.toFixed(2);
  fum.sinterRim01=+clamp(smooth(32.5,41.0,kt)*(1.0-0.35*smooth(61.0,70.0,kt)),0,1).toFixed(4);
  fum.sulfurCrust01=+clamp(smooth(51.0,64.0,kt),0,1).toFixed(4);
  fum.hazardScald=kt>=58.0;
 }
 return{fn:fn,inv:inv,fum:fum};
}

const FNAMES=['wet','flow','upland','canyon','rim','rock','slope','cold','fog','mist','flat','vitro','sinter','therm','nitre','snow'];
const FC=(function(){
 const N=256,S=TERR.R*2.2,a={};
 FNAMES.forEach(nm=>{a[nm]=new Float32Array(N*N);});
 a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  a.h[j*N+i]=terrainH((i/(N-1)-0.5)*S,(j/(N-1)-0.5)*S);
 }
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const x=(i/(N-1)-0.5)*S,z=(j/(N-1)-0.5)*S,k=j*N+i,hh=a.h[k];
  const hx=(a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)])/(2*cs);
  const hz=(a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i])/(2*cs);
  const slope=clamp(Math.hypot(hx,hz),0,1.8);
  const P=physAt(x,z,hh);
  const w=waterH(x,z),inW=(w>-1e8&&w>=hh-0.06)?1:0;
  let fl=0;
  if(FLOW_LINES.length){
   const rv=distToPoly(FLOW_LINES[0].pts,x,z);
   fl=smooth(FLOW_LINES[0].w*2.2,FLOW_LINES[0].w*0.6,rv.d);
  }
  a.wet[k]=inW?1:clamp(P.inv.rh01*0.78+0.35*fl,0,1);
  a.flow[k]=fl;
  a.upland[k]=smooth(SITE.bedY+35,SITE.rimY*0.75,hh);
  a.canyon[k]=1.0-P.inv.skyView01;
  a.rim[k]=smooth(0.55,0.88,P.inv.skyView01);
  a.rock[k]=clamp(Math.max(smooth(0.35,0.75,slope),P.fn.vitrophyre01*0.7),0,1);
  a.slope[k]=clamp(slope,0,1);
  a.cold[k]=P.inv.frost01;
  a.fog[k]=P.inv.mistDensity01;
  a.mist[k]=clamp(P.inv.mistDensity01+0.3*fl,0,1);
  a.flat[k]=clamp(1.0-smooth(0.22,0.58,slope),0,1);
  a.vitro[k]=P.fn.vitrophyre01;
  a.sinter[k]=P.fum.sinterRim01;
  a.therm[k]=P.fum.sulfurCrust01;
  const alcD=SITE.alcove?Math.hypot(x-SITE.alcove.portal[0],z-SITE.alcove.portal[1]):1e9;
  a.nitre[k]=SKEY==='nexus'?smooth(36.0,8.0,alcD):0;
  a.snow[k]=SKEY==='frostrim'?clamp(smooth(0.65,0.88,P.inv.frost01)*(1.0-smooth(0.38,0.78,slope))*(1.0-P.fn.vitrophyre01*0.85)*smooth(0.35,0.75,KRAND.fbm(x*0.02,0.5,z*0.02,2,596)),0,1):0;
 }
 const Lc={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{
  if(x!==Lc.x||z!==Lc.z){
   const u=clamp((x/S+0.5)*(N-1),0,N-1.001),v=clamp((z/S+0.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);
   Lc.x=x;Lc.z=z;Lc.k=j*N+i;Lc.fu=u-i;Lc.fv=v-j;
  }
  const k=Lc.k,fu=Lc.fu,fv=Lc.fv;
  return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;
 };
 return{N:N,S:S,a:a,at:at};
})();
const FIELD={};
FNAMES.forEach(nm=>{FIELD[nm]=(x,z)=>FC.at(FC.a[nm],x,z);});

// ---------------------------------------------------------------- KSPACE spatial index & KHAZ data-driven hazards
const SPACE=KSPACE.create({cell:16});
if(SITE.reserves){
 for(let i=0;i<SITE.reserves.length;i++){
  const rv=SITE.reserves[i];
  SPACE.insert({kind:'reserve',id:rv.id},rv.x,rv.z,rv.r);
 }
}
for(let i=0;i<STEP_POOLS.length;i++){
 const P=STEP_POOLS[i];
 SPACE.insert({kind:'step-pool',i:i},P.x,P.z,P.r+1.8);
}
for(let i=0;i<DIKE_STACKS.length;i++){
 const B=DIKE_STACKS[i];
 SPACE.insert({kind:'dike-fin',id:B.id},B.x,B.z,Math.max(4.0,B.R*0.55));
}

const HAZARDS=[];
if(typeof KHAZ!=='undefined'&&typeof KTAGS!=='undefined'&&KTAGS.page){
 const regHaz=(id,name,x,z,r,h,haz)=>{
  const y=terrainH(x,z);
  const rec={id:id,name:name,class:'feature',at:[x,y,z],r:r,h:h,tags:{biome:'arachnoids',hazard:KHAZ.make(haz)}};
  KTAGS.page.add(rec);
  HAZARDS.push(rec);
 };
 if(SKEY==='nexus'){
  regHaz('arachnoids:webtrap','Tsek-Ma High-Tensile Bridge-Web Perimeter Snare',0,-2,46,52,{kind:'grab',effect:'hold',danger:0.55,dose:0.25,falloff:'smooth'});
  regHaz('arachnoids:slotflood','Ham-Tsek 1295 m3/s Basalt Shut-In Whitewater Surge',0,0,28,14,{kind:'drown',effect:'drown',danger:0.80,dose:0.40,falloff:'linear'});
 }else if(SKEY==='fumarole'){
  regHaz('arachnoids:fumarole','Ring-Fault +68 C Sulfur-Steam Scalding Fumaroles',-18,48,65,16,{kind:'heat',effect:'burn',danger:0.75,dose:0.35,falloff:'smooth'});
  regHaz('arachnoids:slotflood','Ham-Tsek 995 m3/s Cauldron Trough Torrent',0,-116,24,12,{kind:'drown',effect:'drown',danger:0.70,dose:0.35,falloff:'linear'});
 }else if(SKEY==='ledges'){
  regHaz('arachnoids:updraftdrop','Unguarded 970 m Colonnade Ledge Updraft Drop',0,95,85,180,{kind:'fall',effect:null,danger:0.85,dose:0.50,falloff:'linear'});
 }else{
  regHaz('arachnoids:updraftdrop','2000 m High Frost-Rim Chasm Lip Cross-Gale',0,132,95,220,{kind:'fall',effect:null,danger:0.90,dose:0.55,falloff:'linear'});
 }
}

// ---------------------------------------------------------------- BIO.init host binding
function rootMask(x,z){const d=terrainH(x,z)-waterH(x,z);if(d<0.08)return 0;return d<0.45?(d-0.08)/0.37:1;}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=[];
const SPINE=SKEY==='nexus'?[[-95,60],[0,0],[75,-20],[-54,68]]
 :SKEY==='fumarole'?[[-80,-52],[0,-48],[14,58],[112,-36]]
 :SKEY==='ledges'?[[-78,18],[0,15],[34,-46],[65,25]]
 :[[-42,-36],[0,35],[45,105],[-65,95]];

BIO.init({
 tags:'arachnoids',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:5907,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:220,mid:540,far:2100,floor:[150,390]},
 windows:{water:WBOX}
});
BIO.setSun([440,940,-620]);
