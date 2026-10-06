// ================================================================= HOST — stage
// The ideal-type host for the CRATER DRYLANDS: everything a world provides that a biome does not. Renderer,
// lights, haze, the terrain with terrainH(), the local water surface waterH() (one seep pool), the climate
// fields the kit asks for, the tick list, the error panel. The ground and the water are painted later
// (84-host-ground.js), once the kit has worked out its fire history. A real world replaces this whole
// section with its own; the kit's fragments never read anything from it except through BIO.host.
//
// THE MAP (x east, z south, north is -z; origin at the map's centre, R 2600). A 5.2 km piece of the crater
// floor in the Throne's rain shadow (the scale model's 'crater drylands', ~1.9 atm, hot):
//   the plain          120-200 m: long low swells of red soil under scrub, rising a little to the north
//   KOPJES             granite tors standing out of the plain, 25-85 m: stacked rounded slabs with talus aprons.
//                      The biggest (KOP[0], the Scyvoi Rock) is where the Scyvoi riders live; fire never reaches
//                      their tops, so they are the refuges: aloes, jade, crassula, ferns in the clefts
//   THE WASHES         two dry sandy channels (WASH A west across the south, WASH B down the east to join it):
//                      pale gums and prism mallees along them, the fires often stop at their sand
//   THE SEEP           a spring pool at the Scyvoi Rock's south-east foot, a ring of green round it
// The fires themselves are the kit's (52-biome-craterdry-fire.js): this host only chooses where the recent
// ones were lit (FIRES), so each stage of the mosaic stands somewhere a camera can reach.
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
const REG=[];function REGISTER(o){REG.push(o);}
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

// ---------------------------------------------------------------- the land
const TERR={R:2600};
// the kopjes: x, z, radius, height, terrace step, seed. KOP[0] is the Scyvoi Rock
const KOP=[{x:-700,z:-260,r:250,h:84,step:9,s:1.3,name:'The Scyvoi Rock'},{x:700,z:-950,r:150,h:46,step:7,s:2.1},{x:1350,z:520,r:190,h:58,step:8,s:.7},
 {x:-1550,z:950,r:125,h:34,step:6,s:3.3},{x:250,z:1500,r:115,h:30,step:6,s:4.1},{x:-1650,z:-1450,r:165,h:50,step:7,s:5.2},{x:1750,z:-1600,r:135,h:40,step:7,s:6.6},{x:-150,z:450,r:80,h:24,step:6,s:7.4}];
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
function plainH(x,z){return 150+22*(fbm(x*.0006+3,z*.0006-1,17,3)-.5)+9*(fbm(x*.0023-5,z*.0023+2,19,2)-.5)+40*smooth(-1000,-2700,z)-14*smooth(400,2400,z);}
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
 const wet=clamp(.11+.05*(fbm(x*.0015,z*.0015,131,2)-.5)+.42*wash+.16*K.foot+.85*seep,0,1);
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
const FIRES=[{ago:.05,x:1050,z:350,frac:.045},{ago:.4,x:-150,z:1250,frac:.05},{ago:1.1,x:-950,z:450,frac:.065},
 {ago:1.9,x:1500,z:-650,frac:.06},{ago:3.6,x:450,z:-1250,frac:.065},{ago:5.5,x:-1350,z:1650,frac:.055}];

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: the kopjes, the washes, the recent fires (a little downwind of where they were lit) and a lattice
const SPINE=[];
KOP.forEach(K=>SPINE.push([K.x,K.z]));
FIRES.forEach(F=>SPINE.push([F.x+FIRE_WIND[0]*260,F.z+FIRE_WIND[1]*260]));
for(let x=-1800;x<=1800;x+=1200)SPINE.push([x,zA(x)]);
SPINE.push([xB(-1400),-1400],[SEEP.x,SEEP.z]);
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 obstacles:OBSTACLES,ticks:tick,seed:29,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:280,mid:760,far:2400,floor:[250,620]},
 windows:{water:[SEEP.x-60,SEEP.z-60,SEEP.x+60,SEEP.z+60]}});
BIO.setSun([-1000,900,-700]);
