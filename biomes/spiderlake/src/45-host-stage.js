// ================================================================= HOST — stage: terrain, hydrology, KSPACE, KHAZ & BIO.init ([web])
// Implements all six surveyed Scale-Model 5.1 Spider Lake stations (PLAN.md section 4; SPIDER_SITES):
//   spillway (default, dist/spiderlake.html):          380 m3/s SW breach cataracts into 9102 Ham-Tsek & 170 m Bridge-Curtains
//   narrows  (dist/spiderlake-narrows.html):           Golden Narrows island stacks, boat-arch curtains & site:spider-lake-weirs
//   pavilion (dist/spiderlake-pavilion.html):          Spindle-willow & crown-cypress Brood-Pavilion woods + mulberry terraces
//   fen      (dist/spiderlake-fen.html):               Hau-Gel 640 m3/s delta, +37-44 C degumming springs & 300 m lake-smoke pillars
//   dolomite (dist/spiderlake-dolomite.html):          NW dolomite bluff, red-porphyry dike & walk-in KSPELEO.CALCITE grotto
//   rampart  (dist/spiderlake-rampart.html):           +2,040 m North secondary-ejecta boulder-collar & Ria hydrological divide
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
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
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z,ry=r.y==null?0:r.y;return dx*dx+dz*dz<=r.r*r.r&&y>=ry-4&&y<=ry+r.h+8;}

const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'spillway';
const SITE=SPIDER_SITES[SKEY]||SPIDER_SITES.spillway;
const STATION_REGION=SITE.name+' ('+SITE.region+')';
const PQ=new URLSearchParams(location.search);

// Interactive live host states (modulated by buttons in 99-host-take.js)
const SPIDER_STATE={
 mode:'clear',
 smudgeActive01:0.0,
 humFreqHz:0.0,
 dayMod6:5,
 smokeBoost:SKEY==='fen'?0.45:(SKEY==='spillway'||SKEY==='narrows'?0.28:0.12),
 fogBoost:0.0,
 grottoCut:false
};

const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
{BIO.INDEX_ITEMS=PQ.get('index')!=='0';BIO.LOD.merge=PQ.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&PQ.get('lodfade')!=='0'?0.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&PQ.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.02;
document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const HAZE_HEX=SKEY==='rampart'?0xcad6dc:SKEY==='fen'?0xcbdad2:SKEY==='dolomite'?0xd0d8da:0xc8d8d6;
const HAZE=new THREE.Color(HAZE_HEX);
scene.fog=new THREE.FogExp2(HAZE.getHex(),SKEY==='fen'?0.00032:SKEY==='rampart'?0.00020:0.00026);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,0.4,18000);
scene.add(new THREE.HemisphereLight(0xe4efe8,0x485648,0.86));
const sun=new THREE.DirectionalLight(0xfff5e2,1.38);
sun.position.set(480,920,-620);
scene.add(sun);
const fill=new THREE.DirectionalLight(0xd6e6ea,0.24);
fill.position.set(-580,380,620);
scene.add(fill);

// ---------------------------------------------------------------- station heightfields & hydrological channels
const TERR={R:760};
const n2=(x,z,f,seed)=>KRAND.fbm(x*f,0.5,z*f,2,seed)-0.5;

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

// River / spillway / inflow polylines per station (strictly 0 on narrows, pavilion, dolomite, rampart)
const FLOW_LINES=(function(){
 if(SKEY==='spillway'){
  // Sole 380 m3/s surface outlet of Spider Lake plunging west from lake lip (x = -18) into 9102 Ham-Tsek gorge
  const pts=[];
  for(let i=0;i<=24;i++){
   const t=i/24,x=-16-458*t,z=10*Math.sin(t*5.2);
   pts.push([x,z]);
  }
  return[{name:'9102 Ham-Tsek Breach Spillway Cataracts (380 m3/s)',pts:pts,w:18,depth:0.95,speed:3.2}];
 }
 if(SKEY==='fen'){
  // Eastern 640 m3/s 9106 Hau-Gel braided delta channels terminating cleanly at Spider Lake bay shoreline
  const main=[],northBraid=[];
  for(let i=0;i<=20;i++){
   const t=i/20;
   const mx=360-385*t,mz=158-225*t+14*Math.sin(t*4.4);
   if((mz+0.35*mx)+32>=-8)main.push([mx,mz]);
   const nx=340-310*t,nz=45-128*t+11*Math.cos(t*4.0);
   if((nz+0.35*nx)+32>=-8)northBraid.push([nx,nz]);
  }
  return[
   {name:'9106 Hau-Gel Main Delta Channel (640 m3/s)',pts:main,w:19,depth:0.85,speed:1.65},
   {name:'Hau-Gel North Warm-Seep Braid',pts:northBraid,w:9.5,depth:0.55,speed:1.25}
  ];
 }
 if(SKEY==='haugel'){
  // NE 9106 Hau-Gel inflow gorge chute (585 m3/s) rushing west from x = +380 into Spider Lake bay at x = -48
  const pts=[];
  for(let i=0;i<=26;i++){
   const t=i/26,x=380-428*t,z=11.0*Math.sin((x+60)*0.012);
   pts.push([x,z]);
  }
  return[{name:'9106 Hau-Gel Upper Inflow Gorge Chute (585 m3/s)',pts:pts,w:16.5,depth:0.95,speed:2.85}];
 }
 return[];
})();

// Sculpt emergent dolomite & secondary-ejecta stacks with summit ledges matching curtain anchor heights
function stackH(stacks,x,z,seedBase){
 let best=-1e9;
 if(!stacks||!stacks.length)return best;
 for(let i=0;i<stacks.length;i++){
  const s=stacks[i],dx=x-s.x,dz=z-s.z,r0=s.r;
  if(Math.abs(dx)>r0*1.75||Math.abs(dz)>r0*1.75)continue;
  const wob=1+0.11*n2(x,z,0.045,seedBase+i*7);
  const d=Math.hypot(dx,dz)/(r0*wob);
  if(d<1.65){
   // Littoral cypress shoal bench (-1.2..+1.6 m) around stack foot + steep karst/breccia tower rising to s.top
   const shoal=mix(-2.4,1.35,smooth(1.62,1.02,d));
   const spire=s.top*Math.pow(smooth(1.18,0.24,d),0.82);
   const crag=1.8*n2(x,z,0.09,seedBase+100+i)*smooth(1.1,0.3,d);
   best=Math.max(best,Math.max(shoal,spire+crag));
  }
 }
 return best;
}

// Sculpt raised travertine spring basins so every thermal pool sits >= +0.10 m above 0.0 m open lake with zero coplanar overlap
function applyThermalPools(h,pools,x,z,seedBase){
 if(!pools||!pools.length)return h;
 let out=h;
 for(let i=0;i<pools.length;i++){
  const P=pools[i],dx=x-P.x,dz=z-P.z;
  if(Math.abs(dx)>P.r*2.4||Math.abs(dz)>P.r*2.4)continue;
  const wob=1+0.06*n2(x,z,0.09,seedBase+i*13);
  const d=Math.hypot(dx,dz)/(P.r*wob);
  if(d<2.15){
   const apron=smooth(2.12,1.12,d);
   const inBowl=smooth(1.03,0.72,d);
   const rimLip=smooth(1.30,1.03,d)*smooth(0.80,1.03,d);
   const crest=P.level+0.18,floor=P.level-0.58;
   const target=mix(crest,floor,inBowl)+0.10*rimLip;
   out=mix(out,target,apron);
  }
 }
 return out;
}

function landSpillway(x,z){
 // East of x = -18: Spider Lake basin (level 0.0) flanked north & south by terraced dolomite/ejecta shores; west of x = -18: plunging 70 m Ham-Tsek gorge
 const az=Math.abs(z+8*n2(x,z,0.005,101));
 let h=0;
 if(x>=-18){
  // Lake channel in center (|z| < 92), rising onto shore benches north & south
  const inLake=smooth(118,56,az);
  const bed=-1.2-11.5*smooth(-18,220,x)*inLake+1.4*n2(x,z,0.025,102);
  const shoreBench=3.4+16.5*smooth(92,225,az)+34.0*smooth(210,480,az)+4.2*n2(x,z,0.008,103);
  // Gentle alkaline degumming terrace on SE shore around (68, 142) and (94, 156)
  let terrace=mix(shoreBench,bed,inLake);
  const dv=Math.hypot((x-80)/52,(z-148)/42);
  if(dv<1.45)terrace=mix(terrace,4.0+0.4*Math.max(0,x-68)*0.03,smooth(1.42,0.75,dv));
  h=terrace;
 }else{
  // Plunging Ham-Tsek breach cataract gorge (x: -18 -> -480 drops from -0.8 m to -58 m) with steep ejecta-over-dolomite gorge walls
  const u=clamp((-18-x)/450,0,1.25);
  const stepDrop=56.0*Math.pow(u,0.86)+2.2*Math.sin(u*22.0)*smooth(0.02,0.15,u)*(1-smooth(52,88,az));
  const thalweg=-0.95-stepDrop;
  const wall=mix(thalweg,20.5+38.0*smooth(68,260,az)+5.5*n2(x,z,0.009,104),smooth(20,62,az));
  h=wall;
 }
 // Incise cataract thalweg cleanly along FLOW_LINES[0]
 const rv=distToPoly(FLOW_LINES[0].pts,x,z);
 if(rv.d<38&&x<-10){
  const bed=mix(-1.1,-57.5,Math.pow(rv.t,0.88))-0.65;
  h=mix(h,Math.min(h,bed),smooth(36,12,rv.d));
 }
 // Emergent stacks (sp-stack-n, sp-stack-s, sp-stack-e1, sp-stack-e2) + gorge curtain buttresses at (-168, +-63)
 h=Math.max(h,stackH(SITE.stacks,x,z,110));
 const gN=Math.hypot(x+168,z+62),gS=Math.hypot(x+162,z-64);
 if(gN<28)h=Math.max(h,19.5*smooth(27,7,gN));
 if(gS<28)h=Math.max(h,21.0*smooth(27,7,gS));
 h=applyThermalPools(h,SITE.thermalPools,x,z,130);
 h+=1.1*n2(x,z,0.024,105);
 return h;
}

function landNarrows(x,z){
 // SW Silk Principality shore bench around site:spider-lake-weirs (-235, 185) + open crater lake (-18 m bed) studded with 5 karst/ejecta island stacks
 const shoreLine=(z-0.68*x)-235+26*n2(x,z,0.004,201);
 const onShore=smooth(-38,48,shoreLine);
 const lakeBed=-14.5+9.5*smooth(85,-25,shoreLine)+2.4*n2(x,z,0.012,202);
 const shoreH=2.2+14.0*smooth(18,190,shoreLine)+28.0*smooth(175,460,shoreLine)+3.5*n2(x,z,0.008,203);
 let h=mix(lakeBed,shoreH,onShore);

 // Shallow littoral bald-cypress shoal rings around stacks & coves (-1.4 .. +0.6 m)
 h=Math.max(h,stackH(SITE.stacks,x,z,210));

 // Reserve flat buildable Silk Principality bench at site:spider-lake-weirs (-235, 185, r = 165)
 if(SITE.reserves&&SITE.reserves.length){
  const R=SITE.reserves[0],rd=Math.hypot(x-R.x,z-R.z);
  if(rd<R.r*1.35){
   h=mix(h,5.8+0.45*n2(x,z,0.02,230),smooth(R.r*1.32,R.r*0.68,rd));
  }
 }
 h+=0.9*n2(x,z,0.025,204);
 return h;
}

function landPavilion(x,z){
 // North (z < -120): sheltered lake cove; center (z = -120..+72): misty willow & cypress bench grove with shallow fen channels;
 // south (z > 72): 3 cut dolomite & porphyry arachniculture spindle-terraces (z = 95, 142, 190 -> y = 18.5, 25.5, 33.0)
 const zWob=z+16*n2(x,z,0.005,301);
 let h=0;
 if(zWob<-118){
  h=-9.5*smooth(-118,-260,zWob)-0.8+1.2*n2(x,z,0.02,302);
 }else{
  // Gentle moist grove bench (+0.6 .. +12 m) laced with shallow littoral cypress backwaters
  const rill=Math.sin(x*0.032+z*0.018+2.4*n2(x,z,0.01,303));
  const slough=smooth(0.76,0.96,Math.abs(rill))*smooth(45,-95,zWob);
  h=1.4+10.5*smooth(-112,68,zWob)-2.1*slough+2.2*n2(x,z,0.012,304);
 }
 // Stepped dry-stone mulberry & spindle-weir terraces on the southern slope
 if(SITE.terraces){
  const xMask=smooth(165,115,Math.abs(x));
  let th=h;
  th=mix(th,18.5,smooth(68,84,z)*xMask);
  th=mix(th,25.5,smooth(116,131,z)*xMask);
  th=mix(th,33.0,smooth(164,179,z)*xMask);
  th+=26.0*smooth(212,390,z);
  h=Math.max(h,th);
 }
 // Rocky cove headlands anchoring pv-curtain-cove ([-108, 20.5, -168] to [68, 21.5, -174])
 const cA=Math.hypot(x+112,z+170),cB=Math.hypot(x-72,z+176);
 if(cA<32)h=Math.max(h,22.0*smooth(31,8,cA)+1.2*n2(x,z,0.08,311));
 if(cB<32)h=Math.max(h,23.0*smooth(31,8,cB)+1.2*n2(x,z,0.08,312));
 return h+0.7*n2(x,z,0.028,305);
}

function landFen(x,z){
 // NW / North: shallow hydrothermal midge-nursery bay (-0.5..-9.5 m, rich in submerged air-bell silk domes!);
 // Center / SE: steaming travertine degumming fen bench (+0.45..+4.2 m) + Hau-Gel 640 m3/s braided inflow delta
 const bayAxis=(z+0.35*x)+32+22*n2(x,z,0.0045,401);
 const onFen=smooth(-42,26,bayAxis);
 // Shallow sunlit benthic midge shelf (-0.45..-2.2 m near shore, -8.5 m further out)
 const bayBed=-0.65-1.6*smooth(-12,-75,bayAxis)-6.8*smooth(-75,-240,bayAxis)+0.55*n2(x,z,0.03,402);
 const fenBench=0.68+2.4*smooth(8,145,bayAxis)+16.0*smooth(155,390,bayAxis)+0.85*n2(x,z,0.016,403);
 let h=mix(bayBed,fenBench,onFen);

 // Incise Hau-Gel delta braids cleanly while keeping thermal pool pads dry & elevated
 for(let i=0;i<FLOW_LINES.length;i++){
  const FL=FLOW_LINES[i],rv=distToPoly(FL.pts,x,z);
  if(rv.d<FL.w*1.65){
   const bed=mix(3.2,-1.4,rv.t)-FL.depth*0.65;
   h=mix(h,Math.min(h,bed),smooth(FL.w*1.6,FL.w*0.55,rv.d));
  }
 }
 // Emergent dolomite stack fn-stack-1 (-145, -92) + delta-mouth headland knoll (-16, -140) anchoring fn-curtain-mouth
 h=Math.max(h,stackH(SITE.stacks,x,z,410));
 const mKnoll=Math.hypot(x+16,z+140);
 if(mKnoll<28)h=Math.max(h,19.2*smooth(27,7,mKnoll)+1.1*n2(x,z,0.08,415));

 // Sculpt all 5 alkaline carbonate degumming spring bowls strictly >= +0.32..+2.18 m above 0.0 m lake datum
 h=applyThermalPools(h,SITE.thermalPools,x,z,420);
 return h;
}

function dikeDist(x,z){
 if(!SITE.dike)return 1e9;
 const D=SITE.dike,dx=D.x1-D.x0,dz=D.z1-D.z0,l2=dx*dx+dz*dz;
 const t=clamp(((x-D.x0)*dx+(z-D.z0)*dz)/l2,0,1);
 return Math.hypot(D.x0+dx*t-x,D.z0+dz*t-z);
}

function landDolomite(x,z){
 // North (z < -62): turquoise Spider Lake bay & dl-stack-1 (128, -136); South (z > -52): cream carbonate-shelf dolomite bluff
 // sliced by purple-red imperial porphyry dike & sheltering the walk-in KSPELEO.CALCITE crystal grotto at portal (18, -26)
 const bluffLine=z+54+18*n2(x,z,0.005,501);
 let h=0;
 if(bluffLine<-8){
  h=-1.2-11.5*smooth(-8,-190,bluffLine)+1.1*n2(x,z,0.022,502);
 }else{
  const cliff=24.0*smooth(-8,28,bluffLine)+38.0*smooth(26,185,bluffLine)+28.0*smooth(180,390,bluffLine);
  h=cliff+3.6*n2(x,z,0.011,503);
 }
 // Bluff headland spur at (48, -82) anchoring dl-curtain-bluff ([48, 20.0, -82] to [124, 20.0, -132])
 const spur=Math.hypot(x-48,z+82);
 if(spur<30)h=Math.max(h,21.2*smooth(29,8,spur)+1.0*n2(x,z,0.08,508));
 h=Math.max(h,stackH(SITE.stacks,x,z,510));

 // Imperial red-porphyry dike rib slicing across the dolomite bench
 const dd=dikeDist(x,z);
 if(dd<SITE.dike.width*1.6&&bluffLine>-22){
  h+=SITE.dike.ridgeH*smooth(SITE.dike.width*1.45,SITE.dike.width*0.28,dd)*smooth(-22,12,bluffLine);
 }

 // Level grotto approach apron at portal (18, -26, floorY = 3.4) while keeping >= 16 m dolomite roof over crystal hall (18, 22)!
 const G=SITE.grotto;
 const dApproach=Math.hypot((x-G.portal[0])/16,(z-(G.portal[1]-10))/16);
 if(dApproach<1.45){
  h=mix(h,2.8,smooth(1.42,0.65,dApproach));
 }
 const dHall=Math.hypot(x-G.hall[0],z-G.hall[1]);
 if(dHall<32){
  h=Math.max(h,22.5+4.5*smooth(32,8,dHall));
 }
 h=applyThermalPools(h,SITE.thermalPools,x,z,520);
 return h+0.8*n2(x,z,0.026,504);
}

function landRampart(x,z){
 // +2,040 m unbroken North secondary-ejecta boulder-collar sealing Spider Lake (south) from Ria Valley headwaters (north): ZERO open water!
 const ridgeZ=z+28*n2(x,z,0.004,601);
 const crest=36.0*Math.exp(-(ridgeZ*ridgeZ)/(2*165*165));
 // Hummocky ballistic megabreccia lobes & impact-ejecta block ridges
 const hummock=14.5*n2(x,z,0.0075,602)+5.8*n2(x,z,0.022,603)+2.2*Math.abs(n2(x,z,0.055,604));
 const flankDrop=-28.0*smooth(140,420,Math.abs(ridgeZ));
 return crest+hummock+flankDrop;
}

function landHaugel(x,z){
 // West (x < -42): sheltered Spider Lake bay (-10.5 m bed) with littoral bald-cypress shoals;
 // East (x >= -42): 585 m3/s 9106 Hau-Gel inflow canyon flanked by steaming sinter benches & steep dry Carnelian secondary-ejecta cliffs!
 const zCenter=11.0*Math.sin((x+60)*0.012);
 const az=Math.abs(z-zCenter+6*n2(x,z,0.006,651));
 let h=0;
 if(x<-42){
  const inBay=smooth(145,58,az);
  const bayBed=-1.1-9.8*smooth(-42,-260,x)*inBay+1.1*n2(x,z,0.022,652);
  const bayShore=2.4+14.5*smooth(82,190,az)+26.0*smooth(185,420,az)+2.8*n2(x,z,0.009,653);
  h=mix(bayShore,bayBed,inBay);
 }else{
  const u=clamp((x+42)/422,0,1.2);
  const benchBase=2.1+6.2*u+1.6*n2(x,z,0.014,654);
  const cliffRise=18.5*smooth(56,112,az)+24.0*smooth(108,245,az)+4.2*n2(x,z,0.011,655);
  h=benchBase+cliffRise;
 }
 // Cut north amber-mulberry bench at z = -96 (x in [-115..+115])
 if(SITE.terraces&&SITE.terraces.length){
  const xm=smooth(130,88,Math.abs(x))*smooth(26,8,Math.abs(z+96));
  h=mix(h,12.5,xm*0.85);
 }
 // Incise monotone 9106 Hau-Gel inflow gorge channel cleanly into Spider Lake bay
 const rv=distToPoly(FLOW_LINES[0].pts,x,z);
 if(rv.d<34){
  const thalweg=mix(8.05,-1.55,rv.t);
  h=mix(h,Math.min(h,thalweg),smooth(32,12,rv.d));
 }
 // Emergent gorge-mouth ejecta stacks + flat reserve bench at (-165, -135) + raised sinter pools
 h=Math.max(h,stackH(SITE.stacks,x,z,660));
 if(SITE.reserves&&SITE.reserves.length){
  const R=SITE.reserves[0],rd=Math.hypot(x-R.x,z-R.z);
  if(rd<R.r*1.35){
   h=mix(h,5.6+0.35*n2(x,z,0.02,668),smooth(R.r*1.32,R.r*0.68,rd));
  }
 }
 h=applyThermalPools(h,SITE.thermalPools,x,z,670);
 return h+0.85*n2(x,z,0.024,656);
}

function land(x,z){
 if(SKEY==='spillway')return landSpillway(x,z);
 if(SKEY==='narrows')return landNarrows(x,z);
 if(SKEY==='pavilion')return landPavilion(x,z);
 if(SKEY==='fen')return landFen(x,z);
 if(SKEY==='dolomite')return landDolomite(x,z);
 if(SKEY==='haugel')return landHaugel(x,z);
 return landRampart(x,z);
}

function water(x,z){
 // Station 6 (rampart): strict hydrological divide -- zero surface water anywhere
 if(!SITE.hasOpenLake)return -1e9;

 // Thermal degumming pools sit cleanly above +0.0 m lake datum inside raised travertine rims
 if(SITE.thermalPools){
  for(let i=0;i<SITE.thermalPools.length;i++){
   const P=SITE.thermalPools[i];
   if(Math.hypot(x-P.x,z-P.z)<=P.r*1.02)return P.level;
  }
 }
 // River / cataract channels
 if(SKEY==='spillway'&&x<-16){
  const rv=distToPoly(FLOW_LINES[0].pts,x,z);
  if(rv.d<FLOW_LINES[0].w*1.05)return mix(-0.2,-56.8,Math.pow(rv.t,0.88));
  return -1e9;
 }
 if(SKEY==='fen'){
  for(let i=0;i<FLOW_LINES.length;i++){
   const FL=FLOW_LINES[i],rv=distToPoly(FL.pts,x,z);
   if(rv.d<FL.w*0.95){
    const flLvl=mix(3.1,0.0,rv.t);
    if(flLvl>0.04)return flLvl;
   }
  }
 }
 if(SKEY==='haugel'){
  const rv=distToPoly(FLOW_LINES[0].pts,x,z);
  if(rv.d<FLOW_LINES[0].w*0.95){
   const flLvl=mix(9.0,0.0,rv.t);
   if(flLvl>0.04)return flLvl;
  }
 }
 // Open +1,460.0 m Spider Lake datum (local y = 0.0)
 const h=land(x,z);
 if(h<0.02)return SITE.lakeLevelLocal;
 return -1e9;
}

function landH(x,z){
 const r=Math.hypot(x,z);
 if(r<=TERR.R*1.06)return land(x,z);
 let far=0;
 if(SKEY==='rampart'){
  // South (+z > 400) drops -580 m down to the shimmering +1,460 m Spider Lake bowl; North (-z < -400) drops into misty Ria Valley headwaters!
  const southLake=smooth(520,2400,z);
  const northRia=smooth(-520,-2600,z);
  const rim=45+95*n2(x,z,0.00055,701)+28*n2(x,z,0.0018,702);
  far=mix(rim,-540+18*n2(x,z,0.0008,703),southLake);
  far=mix(far,-420+55*n2(x,z,0.0007,704),northRia);
 }else if(SKEY==='spillway'){
  // East opens across the 6,240 km2 crater lake ringed by distant +450 m rampart hills; west plunges down Ham-Tsek canyon
  const eastLake=smooth(-60,900,x)*smooth(4200,1800,Math.abs(z));
  const collar=140+165*smooth(2600,9500,r)+85*n2(x,z,0.00048,705);
  const gorgeWest=x<-350?(-65-0.06*(-350-x)+75*smooth(180,950,Math.abs(z))):0;
  far=x<-350?gorgeWest:mix(collar,-14,eastLake*0.88);
 }else{
  // Open Spider Lake bowl surrounded at 6-13 km by the unbroken +580 m secondary-ejecta collar & SE wall peaks
  const collarRing=smooth(2800,8800,r);
  const inBowl=1-collarRing;
  far=mix(210+240*collarRing+110*n2(x,z,0.00045,706),-12,inBowl*0.78);
 }
 return mix(land(x,z),far,smooth(TERR.R*0.96,TERR.R*1.35,r));
}

const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=land(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){return water(x,z);}
function elevASL(x,z){return SITE.baseElevM+terrainH(x,z);}

function nearestThermalPool(x,z){
 if(!SITE.thermalPools||!SITE.thermalPools.length)return{d:1e9,pool:null};
 let bestD=1e9,bestP=null;
 for(let i=0;i<SITE.thermalPools.length;i++){
  const P=SITE.thermalPools[i],d=Math.hypot(x-P.x,z-P.z);
  if(d<bestD){bestD=d;bestP=P;}
 }
 return{d:bestD,pool:bestP};
}

// ---------------------------------------------------------------- pure SPIDER_PHYS field evaluation & raster cache
function physAt(x,z,h,slope){
 const asl=SITE.baseElevM+h;
 const wMs=Math.hypot(SITE.wind[0],SITE.wind[1]);
 const aero=SPIDER_PHYS.aerodynamicsAt({elevM:asl,windSpeedMs:wMs,threadDiaUm:4.2,spanM:180.0,anchorHighM:25.0,curtainDropM:12.0});
 const elevAboveLake=asl-SPIDER_PHYS.CONST.LAKE_DATUM_M;
 const shoreD=SITE.hasOpenLake?(h<=0.2?0:SITE.shoreDistBaseM+Math.max(0,h)*6.5):SITE.shoreDistBaseM;
 const hourNow=SPIDER_STATE.mode==='dawn'?6.75:SPIDER_STATE.mode==='dusk'?19.0:18.5;
 const smoke=SPIDER_PHYS.lakeSmokeAt({
  shoreDistM:shoreD,
  elevAboveLakeM:elevAboveLake,
  seepProximity01:SITE.seepProximity01,
  hour24:hourNow,
  windOnshore01:0.78
 });
 const tp=nearestThermalPool(x,z);
 const ventDist=tp.pool?Math.max(0,tp.d-tp.pool.r*0.35):120.0;
 const brine=SPIDER_PHYS.mvtBrineAt({ventDistM:ventDist,depthBelowRimM:Math.max(4,36-h),zincByte:190,limestoneByte:255});
 return{aero:aero,smoke:smoke,brine:brine,tp:tp};
}

const FNAMES=['wet','littoral','fen','terrace','rampart','rock','slope','flat','midge','silk','porphyry','dolomite','travertine','mat'];
const FC=(function(){
 const N=260,S=TERR.R*2.2,a={};
 FNAMES.forEach(n=>{a[n]=new Float32Array(N*N);});
 a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  a.h[j*N+i]=terrainH((i/(N-1)-0.5)*S,(j/(N-1)-0.5)*S);
 }
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const x=(i/(N-1)-0.5)*S,z=(j/(N-1)-0.5)*S,k=j*N+i,hh=a.h[k];
  const hx=(a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)])/(2*cs);
  const hz=(a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i])/(2*cs);
  const slope=clamp(Math.hypot(hx,hz),0,1.5);
  const P=physAt(x,z,hh,slope);
  const w=waterH(x,z),inW=(w>-1e8&&w>=hh-0.06)?1:0;
  const nearLake=SITE.hasOpenLake?smooth(6.5,-0.5,hh):0;
  a.wet[k]=inW?1:clamp(Math.max(nearLake*0.88,SKEY==='fen'?0.72:0.28),0,1);
  a.littoral[k]=SITE.hasOpenLake?clamp(smooth(4.2,0.2,Math.abs(hh-0.6)),0,1):0;
  a.fen[k]=SKEY==='fen'?clamp(smooth(5.5,-1.2,hh),0,1):0;
  a.terrace[k]=SKEY==='pavilion'?smooth(14,22,hh):(SITE.hasOpenLake?smooth(5,18,hh)*(1-smooth(0.35,0.65,slope)):0);
  a.rampart[k]=SKEY==='rampart'?1:smooth(1750,1920,SITE.baseElevM+hh);
  a.rock[k]=clamp(smooth(0.32,0.72,slope),0,1);
  a.slope[k]=clamp(slope,0,1);
  a.flat[k]=clamp(1-smooth(0.22,0.56,slope),0,1);
  a.midge[k]=clamp(P.smoke.midgeFluxGm2Day/38.0,0,1);
  a.silk[k]=P.smoke.webSheetDensity01;
  a.porphyry[k]=SKEY==='dolomite'?smooth(SITE.dike.width*1.35,SITE.dike.width*0.3,dikeDist(x,z)):0;
  a.dolomite[k]=(SKEY==='dolomite'||SKEY==='pavilion'||SKEY==='fen')?clamp(0.45+0.55*a.rock[k],0,1):clamp(0.25*a.rock[k],0,1);
  const trav=P.tp.pool?smooth(P.tp.pool.r*2.15,P.tp.pool.r*0.95,P.tp.d):0;
  a.travertine[k]=trav;
  a.mat[k]=P.tp.pool?smooth(P.tp.pool.r*1.95,P.tp.pool.r*1.08,P.tp.d)*smooth(P.tp.pool.r*0.75,P.tp.pool.r*1.06,P.tp.d):0;
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
FNAMES.forEach(n=>{FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z);});

// ---------------------------------------------------------------- KSPACE spatial keep-clear & KHAZ data-driven hazards
const SPACE=KSPACE.create({cell:16});
// 1. Pre-reserve Silk Principality settlement sites (zero buildings, core kept clear for kits/spider-lake)
if(SITE.reserves){
 for(let i=0;i<SITE.reserves.length;i++){
  const R=SITE.reserves[i];
  SPACE.insert({kind:'reserve',id:R.id},R.x,R.z,R.r*0.72);
 }
}
// 2. Pre-reserve thermal degumming spring bowls so zero trees punch through warm carbonate water
if(SITE.thermalPools){
 for(let i=0;i<SITE.thermalPools.length;i++){
  const P=SITE.thermalPools[i];
  SPACE.insert({kind:'thermal-pool',key:P.key},P.x,P.z,P.r+2.2);
 }
}
// 3. Pre-reserve boat-navigation channels under Bridge-Curtain midspans & grotto portal on dolomite
if(SITE.curtainSpans){
 for(let i=0;i<SITE.curtainSpans.length;i++){
  const cs=SITE.curtainSpans[i];
  if(cs.boatArch){
   const mx=0.5*(cs.a[0]+cs.b[0]),mz=0.5*(cs.a[2]+cs.b[2]);
   SPACE.insert({kind:'boat-arch',id:cs.id},mx,mz,18.0);
  }
 }
}
if(SKEY==='dolomite'&&SITE.grotto){
 SPACE.insert({kind:'grotto-portal',id:'grotto'},SITE.grotto.portal[0],SITE.grotto.portal[1],15.0);
}
// 4. Pre-reserve active WATER.flow river & cataract channels (+ bank margin) so ZERO trees ever stand in the river!
function inFlowChannel(x,z,extraM){
 const pad=extraM==null?5.5:extraM;
 for(let i=0;i<FLOW_LINES.length;i++){
  const FL=FLOW_LINES[i],rv=distToPoly(FL.pts,x,z);
  if(rv.d<FL.w+pad)return true;
 }
 return false;
}
FIELD.river=(x,z)=>inFlowChannel(x,z,5.5)?1:0;
FLOW_LINES.forEach((FL,fi)=>{
 for(let i=0;i<FL.pts.length;i++){
  SPACE.insert({kind:'river-channel',id:'flow-'+fi+'-'+i},FL.pts[i][0],FL.pts[i][1],FL.w+5.5);
 }
});

const HAZARDS=[];
if(typeof KHAZ!=='undefined'&&typeof KTAGS!=='undefined'&&KTAGS.page){
 const regHaz=(id,name,x,z,r,h,haz)=>{
  const y=terrainH(x,z);
  const rec={id:id,name:name,class:'feature',at:[x,y,z],r:r,h:h,tags:{biome:'spiderlake',hazard:KHAZ.make(haz)}};
  KTAGS.page.add(rec);
  HAZARDS.push(rec);
 };
 if(SKEY==='spillway'){
  regHaz('spiderlake:spillway','Ham-Tsek 380 m3/s Breach Cataract Sweep',-110,0,85,24,{kind:'drown',effect:'drown',danger:0.75,dose:0.35,falloff:'smooth'});
  regHaz('spiderlake:snarecurtain','Peripheral Snare-Curtain Web Sheet (non-lethal 65% slow)',-25,4,68,26,{kind:'grab',effect:'hold',danger:0.25,dose:0.10,falloff:'linear'});
 }else if(SKEY==='narrows'){
  regHaz('spiderlake:snarecurtain','Golden Narrows Outer Funnel-Web Margin (non-lethal 65% slow)',12,-44,75,26,{kind:'grab',effect:'hold',danger:0.22,dose:0.08,falloff:'linear'});
 }else if(SKEY==='pavilion'){
  regHaz('spiderlake:snarecurtain','Canopy Funnel-Sheet Understory Tangler (non-lethal 65% slow)',0,-18,85,18,{kind:'grab',effect:'hold',danger:0.24,dose:0.10,falloff:'linear'});
  regHaz('spiderlake:broodguard','Arachneapolita Brood-Pavilion Guard Drum (< 2.5 m without Hum/smudge)',12,-28,28,16,{kind:'hunter',effect:'bleed',danger:0.30,dose:0.12,falloff:'smooth'});
 }else if(SKEY==='fen'){
  regHaz('spiderlake:thermalbath','Hot Alkaline Carbonate Vent Throat (+44.2 C scald center)',78,58,9.5,4,{kind:'heat',effect:'burn',danger:0.52,dose:0.24,falloff:'smooth'});
 }else if(SKEY==='haugel'){
  regHaz('spiderlake:thermalbath','Hau-Gel Upper Scalding Sinter Terrace Vent (+45.6 C scald center)',44,58,12.5,4,{kind:'heat',effect:'burn',danger:0.58,dose:0.28,falloff:'smooth'});
 }
}

// ---------------------------------------------------------------- BIO.init host binding
function rootMask(x,z){
 if(inFlowChannel(x,z,5.5))return 0;
 const d=terrainH(x,z)-waterH(x,z);
 if(d<0.25)return 0;
 return d<0.75?(d-0.25)/0.50:1;
}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=[];
const SPINE=SKEY==='spillway'?[[-28,-68],[-22,74],[68,142],[142,-88]]
 :SKEY==='narrows'?[[-72,-36],[98,-58],[48,118],[-235,185]]
 :SKEY==='pavilion'?[[-35,-25],[35,-20],[0,95],[0,142]]
 :SKEY==='fen'?[[34,26],[-26,48],[-95,-95],[-145,-92]]
 :SKEY==='dolomite'?[[18,-26],[18,22],[48,-82],[128,-136]]
 :SKEY==='haugel'?[[-58,-64],[-52,68],[44,58],[-14,-82],[88,118]]
 :[[-85,15],[0,0],[95,-18],[0,-110]];

BIO.init({
 tags:'spiderlake',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:5813,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:220,mid:540,far:2100,floor:[150,390]},
 windows:{water:WBOX}
});
BIO.setSun([480,920,-620]);
