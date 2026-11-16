// ================================================================= HOST — stage (the scablands, STATION 2's NW LOWLANDS HALF: the flood lake's high line over NW lowlands; replaces the kit's 45-host-stage.js)
// biomes/scablands/PLAN.md sections 3 and 7, biomes/nsemiarid/PLAN.md sections 2, 6 and 8: the north basin's flood lake (Lake Lewis) rose in days to
// about 834 m and fell over centuries back to the trough's 430 m; 32,600 km2 of it lay over NW lowlands. Station 2 (stations/highline) is its n semiarid
// share; this is the lowlands' share, in small (R 3 km), on the plan's levels and the same KBASIN lake (kind 'flood', 834 m, age 1000, recession 600).
// The NW lowlands kit is the engine, read in place (biomes/nwlowlands/build.py build(overlay=...)), its flora reading the fields this stage writes:
// its zone on `rock` (crag pines, tussock and saltbush on the scoured ground) and its answer to `bed` and `silt` (young forest on the old lake's silt,
// its stands' height by the years the ground has been dry: src/57-biome-nwlowlands-overlay.js).
// THE MAP (x east, z south, north is -z; origin mid-station, R 3000), the plan's heights:
//   the HILLS       west, ~840-1070 m: NW lowlands' Mediterranean hills (Csa, ~935 m on the survey) the water never reached: the kit's own old forest
//   the HIGH LINE   ~834 m, wandering north-south near x -700 with the ground: the wrack line, the rafted wreckage stranded on it in the trees
//   the OLD BED     east of it, down to ~600 m at the east edge: KBASIN's flood lake, its silt (rhythmites where a bank is cut), its strandlines;
//                   young forest on it now, older toward the line (the line came out first)
//   the SPUR        a low ridge out of the hills across the bed's north, its nose an island: the rising lake poured through the gap between them,
//                   the STRAIT (a KSCOUR course, no falls, its bed ~100 m under the spur's crest), scoured to the flood basalt; its bars and current
//                   ripples spread in the bay north of the spur; erratics (the dam's concrete, basalt) on them
//   a RAIN POND     in a hollow on the bay's bars
const NWQ=new URLSearchParams(location.search),NWQ_ON=k=>NWQ.get(k)!=='0';
const MG=null;   /* no margins station here: the kit's fragments that ask (none of 50, 55, 57, 60) see the plain page */
window.NWLOW_LOOK={monsoon:false,season:NWQ_ON('season'),backlit:NWQ_ON('backlit'),rootcol:NWQ_ON('rootcol'),culm:NWQ_ON('culm'),fung:NWQ_ON('fung'),lobes:NWQ_ON('lobes')};
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('nwlowlands',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
const fbm=(x,z,s,o)=>KRAND.fbm(x,.5,z,o==null?3:o,s);   /* core/rand's noise (the land is a Godot port's: no Math.sin hash) */
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
const regHas=o=>REG.indexOf(o)>=0;

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc8ccc2);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00020);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
scene.add(new THREE.HemisphereLight(0xc8d4d0,0x4a4030,.62));
const sun=new THREE.DirectionalLight(0xfff0d2,1.45);sun.position.set(1100,950,-500);scene.add(sun);   // ESE, over the old bed
const fill=new THREE.DirectionalLight(0xb4cec4,.30);fill.position.set(-800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:3000};
const HL={level:834,trough:430};
// the land before the flood's marks: the hills west falling east into the old basin, a spur out of the hills across the north, the bay behind it
const SPUR_Z=x=>-760+90*Math.sin(x*.0011+.7)+40*Math.sin(x*.0037);
function plainH(x,z){const k=smooth(-300,-2600,x);
 let h=800-.058*x+(36+30*k)*(fbm(x*.0011+3,z*.0011-1,1801,3)-.5)*2+7*(fbm(x*.0042-2,z*.0042+5,1802,2)-.5)*2;
 h+=74*Math.max(0,1-Math.pow(Math.abs(z-SPUR_Z(x))/380,2))*smooth(1250,500,x);   /* the spur */
 h-=92*smooth(-1050,-1700,z)*smooth(900,-200,x)*smooth(-3100,-2200,x);           /* the bay behind it */
 return h;}
// THE STRAIT: a KSCOUR course from the open lake through the gap between the spur and its nose, into the bay; its bed under the lake's level all the way
const COURSE={name:'the strait through the spur',pts:[[760,-120],[420,-470],[190,-780],[-120,-1170],[-500,-1540],[-860,-1850]],
 bed:[772,768,762,752,740,728,716,706],floor:230,walls:230,depth:70,islandL:700,islandW:220,fan:1200};
const SC=KSCOUR.create({seed:417,courses:[COURSE],falls:{count:0},strata:{basaltTop:905,basaltBase:640,seed:13}});
const LOC={};
function baseH(x,z){const P=plainH(x,z),L=SC.locate(x,z,LOC);if(L.k<0)return P;
 const half=COURSE.floor/2,ad=Math.abs(L.d),fl=Math.min(L.bed,P),wallW=120+50*fbm(x*.004,z*.004,1803,2),wt=smooth(half,half+wallW,ad);
 return wt>0?fl+(P-fl)*Math.pow(wt,.8):fl;}
// THE FLOOD LAKE (core/terrain/40-core-basin.js): station 2's lake (stations/highline), the same record: one lake of kind 'flood', today's water the trough's
const BASIN=KBASIN.create({seed:53,wind:[1,.3],age:1000,recession:600,strand:{a:.75},
 lakes:[{name:'the flood lake',kind:'flood',level:HL.level,remnant:HL.trough,member:()=>1}]});
// the order: the scour first (the surge), then the lake's marks over it (its strandlines came after, as it fell)
function landH(x,z){return BASIN.land(x,z,SC.land(x,z,baseH(x,z)));}
// A RAIN POND: the lowest point in a box on the bay's bars, its level the lowest of its rim less 0.5 m, a bowl carved under it
const POND=(function(){let best={x:-700,z:-1900,h:1e9};for(let z=-2300;z<=-1500;z+=40)for(let x=-1300;x<=-400;x+=40){const h=landH(x,z);if(h<best.h)best={x,z,h};}
 const r=30;let lo=1e9;for(const f of [1.2,1.5,1.8])for(let k=0;k<32;k++){const a=k/32*TAU;lo=Math.min(lo,landH(best.x+Math.cos(a)*r*f,best.z+Math.sin(a)*r*f));}
 return{x:best.x,z:best.z,r,level:lo-.5,depth:1.6};})();
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;let h=landH(x,z);
 const d=Math.hypot(x-POND.x,z-POND.z);if(d<POND.r*1.7){const bowl=POND.level-POND.depth*(1-Math.min(1,(d/POND.r)*(d/POND.r)))+.35;h=mix(h,Math.min(h,bowl),smooth(POND.r*1.6,POND.r*.85,d));}
 _tm.x=x;_tm.z=z;_tm.h=h;return h;}
{const P=[],N=40;for(let k=0;k<N;k++){const a=k/N*TAU,cx=Math.cos(a),cz=Math.sin(a);let last=2;for(let r=2;r<POND.r*1.6;r+=1.5){if(terrainH(POND.x+cx*r,POND.z+cz*r)>POND.level+.2)break;last=r;}P.push([POND.x+cx*(last+1.5),POND.z+cz*(last+1.5)]);}POND.poly=P;}
const POND_W=WATER.still({name:'A rain pond on the bay\'s bars',level:POND.level,poly:POND.poly});
function waterH(x,z){if(Math.abs(x-POND.x)<POND.r*1.7&&Math.abs(z-POND.z)<POND.r*1.7&&POND_W.contains(x,z))return POND.level;return -1e9;}

// ---------------------------------------------------------------- the climate fields (cached below; these are the definitions)
// The kit's own (wet, tropic, dry: the summer drought, flow, upland) and the overlay's (rock, bed, silt, yearsDry; scour, bar, ripple, strand, shore,
// band, island, slope). The hills are the survey's Csa (~935 m, ~850 mm, a summer drought): the kit's Mediterranean zone, wetter in the draws; the old
// bed's silt holds water (the fine lake beds), wetter toward the pond; the scoured rock is dry. No tropic, no river.
const BS={},SS={};
function fieldsAt(x,z,h,slope){const B=BASIN.sample(x,z,h,BS),s=SC.sample(x,z,h,SS),wd=waterH(x,z),near=wd>-1e8&&h-wd<3?1:0,dp=Math.hypot(x-POND.x,z-POND.z)-POND.r;
 const scour=s.scour*(1-s.island),bar=s.bar*(1-s.island),rock=clamp(Math.max(smooth(.42,.75,slope)*.9,scour*(1-bar*.8)*.85),0,1);
 // the silt: KBASIN's (lake sediment under the line), stripped where the surge scoured, buried under the strait's gravel
 const silt=B.silt*(1-scour*.85)*(1-bar*.7);
 const draw=fbm(x*.0021-6,z*.0021+2,1804,2)-.5;
 let wet=mix(.42,.54,silt)+.16*draw+.1*smooth(790,650,h)*silt-.3*rock;   /* the bed wetter low (toward the trough) and in its draws */wet=Math.max(wet,near*.95,smooth(60,4,dp)*.8);
 const dry=clamp(mix(.62,.32,silt)+.25*rock-.3*smooth(60,4,dp),0,1);
 return{wet:clamp(wet,0,1),tropic:0,dry,flow:0,upland:clamp((h-640)/380,0,1),rock,bed:B.bed,silt,yearsDry:B.bed>.5?B.dry:0,
  scour,bar,island:s.island,ripple:s.ripple,strand:B.strand,shore:B.shore,band:B.band,slope};}
const FNAMES=['wet','tropic','dry','flow','upland','rock','bed','silt','yearsDry','scour','bar','island','ripple','strand','shore','band','slope'];
const FC=(function(){const N=440,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));

// ---------------------------------------------------------------- the wreckage (records; drawn by 87-host-erratics.js and 87w-host-wrack.js)
// THE ERRATICS (the coulee's kinds: the dam's broken concrete with its rebar, the flood basalt's boulders) on the strait's bars in the bay, where the
// current dropped its load as it spread, and a few on the high line, rafted; cell-seeded on core/rand, each sunk a fifth to a third
const ERRATICS=(function(){const out=[],C=150,R=TERR.R-150,S={},u=(h,k)=>KRAND.unit(KRAND.hash(h,k)),lr=(a,b,t)=>a+(b-a)*t;
 for(let j=Math.floor(-R/C);j<=Math.floor(R/C);j++)for(let i=Math.floor(-R/C);i<=Math.floor(R/C);i++)for(let n=0;n<2;n++){const h=KRAND.hash(7721,i,j,n);
  const x=(i+u(h,1))*C,z=(j+u(h,2))*C;if(Math.abs(x)>R||Math.abs(z)>R)continue;
  const g=terrainH(x,z),q=SC.sample(x,z,g,S),b=BASIN.sample(x,z,g,{}),p=.4*q.bar+.06*q.scour+(b.band===KBASIN.BAND.high?.06:0);if(!(u(h,3)<p)||q.island>.3||waterH(x,z)>-1e8||g>HL.level)continue;
  const block=u(h,4)<.7,slab=block&&u(h,5)<.3,sx=block?lr(2.5,7,u(h,6)):lr(2,6,u(h,6)),sz=sx*lr(.55,1,u(h,7)),sy=slab?lr(.8,1.5,u(h,8)):block?lr(1.5,4,u(h,8)):sx*lr(.55,.8,u(h,8));
  out.push({id:'erratic:'+i+':'+j+':'+n,kind:block?(slab?'slab':'block'):'boulder',x,z,y:g-sy*lr(.18,.33,u(h,9)),sx,sy,sz,
   yaw:u(h,10)*TAU,pitch:lr(-.3,.3,u(h,11)),roll:lr(-.3,.3,u(h,12)),bars:block?3+Math.floor(u(h,13)*7):0,seed:h});}
 return out;})();
// THE WRACK: what the surge rafted through the west notch and the lake stranded at its high line as it began to fall (the dam basins' flotsam kind,
// read in place: biomes/dambasins/src/52-db-flotsam.js, DBF): torn plating, I-beams and containers, thick in a band a few metres under the level (KBASIN's
// band 'high'), in drifts along it, none above it; a few further down on the strandlines. The lowlands' young forest has grown up round it since
const WRACK=DBF.records({x0:-TERR.R+150,x1:TERR.R-150,z0:-TERR.R+150,z1:TERR.R-150,cell:46,field:7,seed:4473,ground:terrainH,
 avoid:(x,z)=>waterH(x,z)>-1e8||SC.sample(x,z,terrainH(x,z),{}).scour>.6,
 accept:(x,z,h)=>{if(h>HL.level)return 0;const s=BASIN.sample(x,z,h,BS);return s.band===KBASIN.BAND.high?.85:s.band===KBASIN.BAND.recession?.002+.025*s.strand:0;}});
// ---------------------------------------------------------------- the host binding
// THE DRAWN GROUND'S STEEPNESS, per cell of the ground mesh (below): the steeper of its two triangles' rise over run, filled once the mesh is made
let DRAWN_STEEP=null;
function drawnSteep(x,z){if(!DRAWN_STEEP)return 0;const N=600,S=TERR.R*2.2,i=Math.floor((x+S/2)/(S/N)),j=Math.floor((z+S/2)/(S/N));return i<0||j<0||i>=N||j>=N?0:DRAWN_STEEP[j*N+i];}
const OBSTACLES=[];
for(const e of ERRATICS)OBSTACLES.push({x:e.x,z:e.z,r:Math.max(e.sx,e.sz)*.6+.5});
for(const r of WRACK){const sz=r.kind==='plate'?Math.max(r.w,r.l):r.L;OBSTACLES.push({x:r.x,z:r.z,r:sz*.5+.4});}
// where the line runs (the views and the checks): its points, one a 150 m row, where the ground (rising west) crosses the level
const LINE=(function(){const P=[];for(let z=-2700;z<=2700;z+=150){let prev=null;for(let x=2900;x>=-2900;x-=10){const h=landH(x,z);if(prev!=null&&prev<HL.level&&h>=HL.level){P.push([x,z]);break;}prev=h;}}return P;})();
const FAN=(function(){const C=SC.courses[0],p=C.pts[C.pts.length-1];return{x:p[0],z:p[1]};})();
const STRAIT=(function(){const C=SC.courses[0],p=C.pts[2];return{x:p[0],z:p[1]};})();
// the LOD spine: along the line, through the strait to its fan, the pond, the bed east and the hills west
const SPINE=LINE.filter((p,i)=>i%6===3).concat([[STRAIT.x,STRAIT.z],[FAN.x,FAN.z],[400,600],[1500,-300]]);   /* none deep in the hills or the bed's far corners: their trees are the far impostors */
BIO.init({tags:'scablands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 mask:(x,z)=>waterH(x,z)>-1e8||drawnSteep(x,z)>1?0:1,   /* nothing rooted in the pond, nor on a drawn cell steeper than 45 degrees (a basalt step the 11 m mesh spans) */
 obstacles:OBSTACLES,ticks:tick,seed:29,origin:SPINE,center:[0,0],fields:FIELD,err:reportErr});
BIO.setSun([1100,950,-500]);
// the runtime LOD's draw-call options (the kit's page's: core/biome README, "The runtime LOD")
BIO.INDEX_ITEMS=NWQ_ON('index');BIO.LOD.merge=NWQ_ON('lodmerge');BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&NWQ_ON('lodfade')?.15:0;BIO.LOD.cull=BIO.LOD.fade>0&&NWQ_ON('lodcull');

// ---------------------------------------------------------------- the ground
// One mesh (600 cells of 11 m), painted from the fields' cache, the kit's library layers over it (KGROUND, relief on; masks in 86-host-fields.js).
// The paint: the hills' gold grass and red soil (the kit's Mediterranean palette), the young forest's leaf litter on the silt, the bare silt pale and
// banded where a bank is cut (the rhythmites), the wrack line dark, the strait's scoured basalt grey, its bars' gravel with the ripples' light crests
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=v=>new THREE.Color(v);
 const GOLD=K(0xa89a64),GOLD2=K(0x8e8a5a),OCHRE=K(0x9a7a56),REDSOIL=K(0x9a5a3e),SCRUB=K(0x56664a),LITTER=K(0x4a4e32),LITTER2=K(0x5e5e3c),
  SILT=K(0xc6baa0),CLAY=K(0x9e927a),WRACK=K(0x5e5446),GRAVEL=K(0x8a8478),GRAVEL2=K(0x9e978a),CREST=K(0xbab2a2),TROUGH=K(0x6a645a),BASALT=K(0x4e4740),MUD=K(0x4a4a38);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=KRAND.fbm(x/26,.5,y/26,2,1811)-.5,n2=KRAND.h3(x,y,0,1812)-.5,n3=KRAND.fbm(x/90,.5,y/90,2,1813)-.5,F=k=>FC.at(FC.a[k],wx,wz);
  const hh=FC.at(FC.a.h,wx,wz),silt=F('silt'),sl=F('slope'),sc=F('scour'),bar=F('bar'),wet=F('wet');
  // the hills: golden grass, ochre and red soil where it is bare, scrub where it is wetter
  c.copy(GOLD).lerp(GOLD2,clamp(.5+n*1.8,0,1)).lerp(OCHRE,clamp(n3*2.2,0,.6)).lerp(REDSOIL,smooth(.16,.3,n3)*.8).lerp(SCRUB,smooth(.42,.6,wet)*.55);
  // the old bed: the young forest's litter on the silt, the silt itself pale where the stand opens, banded on a cut bank
  if(silt>.04){t.copy(LITTER).lerp(LITTER2,clamp(.5+n*2,0,1)).lerp(SILT,smooth(.15,.45,n3+.1)*.4);c.lerp(t,smooth(.04,.35,silt)*.9);
   const cut=smooth(.18,.42,sl)*smooth(.1,.4,silt),ph=hh*1.6+.6*Math.sin(wx*.01+wz*.013),band=ph-Math.floor(ph);c.lerp(SILT,cut*.6);c.lerp(CLAY,cut*smooth(.55,.75,band)*.75);}
  c.lerp(WRACK,F('shore')*.5);
  if(sc>.05)c.lerp(BASALT,smooth(.05,.6,sc)*(1-bar*.8)*.8);
  if(bar>.05){t.copy(GRAVEL).lerp(GRAVEL2,clamp(.5+n*2,0,1));c.lerp(t,smooth(.05,.5,bar)*.85);const rp=F('ripple'),b=smooth(.1,.5,bar);c.lerp(CREST,rp*b*.55);c.lerp(TROUGH,(1-rp)*b*.3);}
  c.lerp(MUD,smooth(POND.r+18,POND.r,Math.hypot(wx-POND.x,wz-POND.z))*.7);
  const k=1+n*.10+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(KRAND.fbm(x/9,.5,y/9,2,1814)-.5)*36+(KRAND.h3(x,y,0,1815)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const GL_ON=NWQ_ON('kground')&&typeof KGROUND!=='undefined',KG_RELIEF=GL_ON&&NWQ_ON('kgrelief');
/* MeshStandard under KGROUND, the light per pixel (the kit's page's, 2026-11-04): ?kground=0 the Lambert floor and its paint alone */
const MAT_GROUND=GL_ON?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0x9a9890,roughness:.96,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0x9a9890});
const MAT_MARL=null,GROUND_MESHES=[];   /* no marl gorge on this ground (the kit's 89a asks) */
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec4 aGL;attribute vec3 aGL2;varying vec4 vGL;varying vec3 vGL2;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGL=aGL;vGL2=aGL2;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;varying vec4 vGL;varying vec3 vGL2;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85);\n/*KGROUND*/}');};
// THE GROUND'S LIBRARY LAYERS (core/terrain KGROUND): the kit's own six, each by a documented mask (GLW in 86-host-fields.js): leaf litter under the young
// forest (the kit's rain floor), the lawn of the open glades, the hills' red soil, the bare silt (the kit's sand, pale), mud at the pond, the strait's
// gravel (the kit's shingle) and its scoured basalt (this overlay's basalt set). The relief on: the layers' height bumps the lit normal, the low and the mesh's hollows lose sky light
if(GL_ON){const L=(slot,w,amt,gain)=>KGROUND.layer('nwlowlands',slot,{w,amt,gain,tint:'diffuse'});
 KGROUND.hook(MAT_GROUND,{layers:[L('ground.rainfloor','vGL.x',.6,1.05),L('ground.lawn','vGL.y',.65,1.2),L('groundDry','vGL.z',.6,1.05),L('groundSand','vGL.w',.55,1.0),L('groundMud','vGL2.x',.8,.8),L('groundGravel','vGL2.y',.85,1.0),
  KGROUND.layer('scablands','basalt',{w:'vGL2.z',amt:.9,gain:.9,tint:'diffuse'})].filter(Boolean),   /* the strait's scoured basalt: this overlay's own set (the coulee's vesicular basalt) */
  key:'scablands-highline-nw',relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1}:null});}
const GROUND=(function(){const N=600,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,terrainH(p.getX(i),p.getZ(i)));
 g.setAttribute('aGL',new THREE.BufferAttribute(new Float32Array(p.count*4),4));g.setAttribute('aGL2',new THREE.BufferAttribute(new Float32Array(p.count*3),3));
 {const c=S/N,D=DRAWN_STEEP=new Float32Array(N*N),Y=(i,j)=>p.getY(j*(N+1)+i);for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=Y(i,j),b=Y(i+1,j),d=Y(i,j+1),e=Y(i+1,j+1);
  D[j*N+i]=Math.max(Math.hypot(b-a,d-a),Math.hypot(e-d,e-b))/c;}}
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The flood lake\'s high line (NW lowlands)';scene.add(m);GROUND_MESHES.push(m);
 if(KG_RELIEF)KGROUND.cavityMesh(m,{rings:[3,18],depth:[.5,4]});return m;})();
// the height of the DRAWN ground (600 cells of 11 m, split on PlaneGeometry's diagonal): cameras stand on it, the checks read it
function meshH(x,z){const N=600,S=TERR.R*2.2,c=S/N,u=(x+S/2)/c,v=(z+S/2)/c,i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,X=k=>-S/2+k*c;
 const h00=terrainH(X(i),X(j)),h10=terrainH(X(i+1),X(j)),h01=terrainH(X(i),X(j+1)),h11=terrainH(X(i+1),X(j+1));
 return fu+fv<=1?h00+(h10-h00)*fu+(h01-h00)*fv:h11+(h01-h11)*(1-fu)+(h10-h11)*(1-fv);}
const drawnH=meshH;
// ---------------------------------------------------------------- the inspector's volumes
REGISTER({name:'The flood lake\'s high line ('+HL.level+' m: the surge stood here for days; NW lowlands\' share)',x:-700,z:0,y:HL.level-20,r:3000,h:30});
REGISTER({name:'The strait through the spur: the rising lake poured through it and scoured it to the flood basalt',x:STRAIT.x,z:STRAIT.z,y:700,r:500,h:200});
REGISTER({name:'The strait\'s fan: its bars and giant current ripples in the bay',x:FAN.x,z:FAN.z,y:690,r:900,h:90});
for(const e of ERRATICS)REGISTER({name:e.kind==='boulder'?'An erratic: a basalt boulder the flood rolled here':'An erratic: the dam\'s broken concrete, rafted kilometres ('+e.kind+', rebar torn out of it)',x:e.x,z:e.z,y:e.y-1,r:Math.max(e.sx,e.sz)*.75,h:e.sy+3});
