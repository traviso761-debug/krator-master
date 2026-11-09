// ================================================================= HOST — stage: STATION 3, THE SAVANNAH EDGE (crater drylands N; PLAN-STATIONS.md)
// A fork of src/45-host-stage.js (everything a world provides; the kit reads it only through BIO.host), for the Aw belt toward SW Bay: the
// scale model's (437,457), 9,140 km² at about -750 m, ~770 mm, 1.76 atm, +29 °C. The kiln opens into grass. What differs from station 1:
//   the land     the plain falls gently to the south-west (toward the bay); three low kopjes, not the Scyvoi Rock's eight; the washes and the
//                seep (a waterhole at the big kopje's foot) as before
//   the fields   wetter: the plain's wet .22 (station 1's .11), so the scrub thins and the grass carries the fire
//   the fires    grass fires every year or two (KFIRE's model, the kit's 52, on twelve recent fires and four older ones, not six and nine):
//                the burns are younger and smaller, so the mosaic is finer and mostly bloom and regrowth
//   STATION      the page's knobs (89-host-sky's site, 84's older fires, 88's build, 99's title, views and checks) and the station's own
//                build: the kit, then termite mounds (KSTACKS) and SW Bay's umbrella thorns and baobabs as kin (BIO.kin; 86-host-edge.js)
// THE MAP (x east, z south, north is -z; origin at the map's centre, R 2600). The fires are lit where a camera can reach every stage.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
// a shader that fails to compile is only a console error in three.js, and its mesh silently does not draw (the ground
// once vanished this way): the panel shows it, so verify.py fails on it
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT OF DENSE AIR (biomes/WORLD.md, "Dense air lights the world differently"): at ~1.9 atm and 0.75 g the
// column overhead is about 2.7x Earth's. The sun is yellow-orange even in the afternoon, the fill is strong and
// blue (more of the light is skylight), the key-to-fill ratio is low, and distance fades fast into a pale haze.
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd4d0c2);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00018);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xa8bcd8,0x7a5a44,.78));
const sun=new THREE.DirectionalLight(0xffd8a4,1.38);sun.position.set(-1000,900,-700);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb8c4dc,.22);fill.position.set(900,400,900);scene.add(fill);

// ---------------------------------------------------------------- the station (read by src/'s knobs; its build in 86-host-edge.js)
const STATION={key:'edge',site:{px:437,py:457},oldFires:4,
 title:'Krator biome — the crater drylands: the savannah edge',
 hint:"The savannah edge (crater drylands N, toward SW Bay): the kiln opens into grass that burns every year or two; SW Bay's umbrella thorns and baobabs stand over it as kin, termite mounds on the open ground, a waterhole under the kopje. L arms a fire: click the ground to light it; F walks",
 build:q=>EDGE.build(q),views:h=>EDGE.views(h),dropViews:['The Scyvoi Rock'],checks:(add,o)=>EDGE.checks(add,o),negatives:(add,o)=>EDGE.negatives(add,o)};

// ---------------------------------------------------------------- the land
const TERR={R:2600};
// the kopjes: x, z, radius, height, terrace step, seed. KOP[0] is the Scyvoi Rock
const KOP=[{x:-650,z:-320,r:140,h:50,step:7,s:1.3,name:'The waterhole kopje'},{x:1250,z:-1150,r:110,h:30,step:6,s:2.1},{x:-1500,z:1200,r:95,h:24,step:6,s:3.3}];
// the washes: A runs west across the south of the map, B comes down the east side and joins it
function zA(x){return 980+240*Math.sin(x*.0011+.5)+80*Math.sin(x*.0031+1.2)+25*Math.sin(x*.009);}
function xB(z){return 1150+190*Math.sin(z*.0013+.3)+60*Math.sin(z*.0041)+18*Math.sin(z*.011);}
const WASHW=16;   // half-width of a wash's sand floor (m); the banks are 12 m more
function washD(x,z){let d=Math.abs(z-zA(x))*.92;const zj=zA(xB(z));if(z<zj+20)d=Math.min(d,Math.abs(x-xB(z))*.92);return d;}
const SEEP={r:17};
{const K=KOP[0],a=.55;SEEP.x=K.x+Math.cos(a)*K.r*1.0;SEEP.z=K.z+Math.sin(a)*K.r*1.0;}
function kopAt(x,z){let h=0,rock=0,foot=0;
 for(let i=0;i<KOP.length;i++){const K=KOP[i],dx=x-K.x,dz=z-K.z,D=Math.hypot(dx,dz);if(D>K.r*1.6)continue;
  const a=Math.atan2(dz,dx),d=D/(K.r*(1+.16*Math.sin(3*a+K.s)+.09*Math.sin(5*a+2*K.s)+.12*(fbm(x*.01+K.s,z*.01,200+i,2)-.5)));
  // the tor: a rounded dome stepped into slabs (steep risers, near-level treads), a talus apron round its foot
  const core=smooth(1.0,.5,d),dome=Math.pow(core,.55)*(.84+.16*(1-d*d));let hh=K.h*Math.max(0,dome);
  const q=hh/K.step,qt=(Math.floor(q)+smooth(.62,.96,q-Math.floor(q)))*K.step;hh=mix(hh,qt,.72*smooth(.05,.3,core));
  hh+=K.h*.1*smooth(1.42,.92,d)*smooth(.6,1.0,d)+2.5*(fbm(x*.05,z*.05,210+i,2)-.5)*core;
  h=Math.max(h,hh);rock=Math.max(rock,smooth(1.12,.88,d));foot=Math.max(foot,smooth(1.0,1.12,d)*smooth(1.5,1.18,d));}
 return{h,rock,foot};}
function plainH(x,z){return 150-38*smooth(-2200,2600,(z-x)*.707)+22*(fbm(x*.0006+3,z*.0006-1,17,3)-.5)+9*(fbm(x*.0023-5,z*.0023+2,19,2)-.5)+40*smooth(-1000,-2700,z)-14*smooth(400,2400,z);}
function landH(x,z){return plainH(x,z)+kopAt(x,z).h;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=landH(x,z);
 const d=washD(x,z);if(d<WASHW+14)h-=3.4*smooth(WASHW+14,WASHW*.6,d)+.5*(fbm(x*.03,z*.03,88,2)-.5)*smooth(WASHW+4,WASHW*.3,d);
 const ds=Math.hypot(x-SEEP.x,z-SEEP.z);if(ds<SEEP.r*2.2)h-=1.6*smooth(SEEP.r*1.9,SEEP.r*.5,ds);
 return h;}
const SEEPL=(function(){let lo=1e9;for(let k=0;k<16;k++){const a=k/16*TAU;lo=Math.min(lo,terrainH0(SEEP.x+Math.cos(a)*SEEP.r*1.25,SEEP.z+Math.sin(a)*SEEP.r*1.25));}return lo-.35;})();
function waterH(x,z){if(Math.hypot(x-SEEP.x,z-SEEP.z)<SEEP.r*1.4)return SEEPL;return -1e9;}

// ---------------------------------------------------------------- the climate fields (cached below; these are the definitions)
// The kit reads the world's fields (biomes/WORLD.md): wet, flow, rock, slope, cold, upland. The drylands are hot
// (cold ~0) and dry (wet ~.12 on the plain), wetter in the washes, at the kopjes' feet (their run-off) and at the seep.
function fieldsAt(x,z,h,slope){const K=kopAt(x,z),d=washD(x,z),ds=Math.hypot(x-SEEP.x,z-SEEP.z);
 const wash=smooth(WASHW+10,WASHW*.5,d),seep=smooth(SEEP.r*5,SEEP.r*1.2,ds);
 const rock=clamp(Math.max(K.rock*smooth(.12,.35,slope+.2*K.rock),smooth(.6,.9,slope)*.7),0,1);
 const wet=clamp(.22+.05*(fbm(x*.0015,z*.0015,131,2)-.5)+.42*wash+.16*K.foot+.85*seep,0,1);
 return{wet,flow:Math.max(wash,seep*.8),upland:clamp((h-130)/300,0,1),canyon:0,rim:0,rock,dune:0,oasis:seep,slope,abyss:0,salt:0,
  cold:clamp(.02+(h-150)/4000,0,1),geo:0,barren:0};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren'];
const FC=(function(){const N=400,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
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

// ---------------------------------------------------------------- the recent fires (the showcase's choice)
// Where the last six fires were lit, how long ago (years) and how much of the map each took (a fraction of the
// disc). The kit lights older ones itself at random. The prevailing wind is the foehn off the Throne (south-east),
// so every burn runs out north-west from its ignition: FIRE_WIND is the direction the wind blows TOWARD.
const FIRE_WIND=[-.56,-.83];
const FIRES=[{ago:.05,x:1050,z:350,frac:.035},{ago:.3,x:-200,z:1250,frac:.04},{ago:.55,x:-1300,z:-500,frac:.035},{ago:.8,x:300,z:-600,frac:.04},
 {ago:1.0,x:-950,z:450,frac:.04},{ago:1.3,x:1500,z:-650,frac:.04},{ago:1.6,x:-1700,z:1700,frac:.035},{ago:1.9,x:800,z:1700,frac:.04},
 {ago:2.3,x:450,z:-1350,frac:.04},{ago:2.8,x:-400,z:-1700,frac:.035},{ago:3.4,x:1800,z:600,frac:.04},{ago:4.2,x:-1900,z:300,frac:.035}];

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: the kopjes, the washes, the recent fires (a little downwind of where they were lit) and a lattice
const SPINE=[];
KOP.forEach(K=>SPINE.push([K.x,K.z]));
FIRES.forEach(F=>SPINE.push([F.x+FIRE_WIND[0]*260,F.z+FIRE_WIND[1]*260]));
for(let x=-1800;x<=1800;x+=1200)SPINE.push([x,zA(x)]);
SPINE.push([xB(-1400),-1400],[SEEP.x,SEEP.z]);
BIO.init({tags:'crater-drylands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 obstacles:OBSTACLES,ticks:tick,seed:29,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:280,mid:760,far:2400,floor:[250,620]},
 windows:{water:[SEEP.x-60,SEEP.z-60,SEEP.x+60,SEEP.z+60]}});
BIO.setSun([-1000,900,-700]);
// THE SEASON (PLAN-STATIONS.md: the dry season's straw, the wet season's flush): the kit's grass takes core/biome's season (50), bound to the
// clock in 99-host-zseason.js. ?season=0 for none
BIO.host.seasons=new URLSearchParams(location.search).get('season')!=='0';
