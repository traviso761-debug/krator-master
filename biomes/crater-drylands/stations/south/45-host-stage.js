// ================================================================= HOST — stage: STATION 2, THE SOUTH (crater drylands S; PLAN-STATIONS.md, PLAN-LANDS.md 5.3)
// A fork of src/45-host-stage.js for crater drylands S (the scale model's rmuqlgonah5tp: 8,408 km², a 2 km climb from -650 to 1,400 m, BSh
// to a cool kiln; centre px 572, 667). Its page is crater-drylands-s.html: the N/S split's S. A 5.2 km showcase holds one slice of the climb:
//   the land     the plain rising ~260 m to the south, toward Godstep; OLD LAVA FLOWS (FLOWS: titanium basalt, black sand) running north out of
//                the southern edge as lobed tongues a few metres proud; four kopjes (the rose kopje in the north-east), the washes (wash A the
//                gully on the south-west), the seep
//   the fields   wetter on the northern and eastern edges (the se rim's air: wetEdge), cooler with height (the kiln's scrub lower: treeScale .85)
//   the swap     (86-host-south.js) the kit's base everywhere but the flows; the se rim's rust miombo and incense on the wet edges and its
//                rain rose on the kopjes there (biomes/savannarim read in place: SAVRIM.builders and its cousins, with the hyperjungle and
//                sedesert they build on); THE BLACK MALLEE on the old flows only (the prism mallee's kin, violet-black to bronze; the owner's
//                yes, 2026-11-09)
//   STATION      the knobs (89's site, 84's flows and older fires, 88's build, 99's title, views and checks), the season and the copper flush
// THE MAP (x east, z south, north is -z; origin at the map's centre, R 2600).
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;   /* h3, vnoise too: the hyperjungle's fragments (read here for savannarim) take the core's helpers as globals, as its 41 gives them */
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

// ---------------------------------------------------------------- the station (read by src/'s knobs; its build in 86-host-south.js)
const STATION={key:'s',site:{px:572,py:667},oldFires:7,flowAt:(x,z)=>flowAt(x,z),
 title:'Krator biome — the crater drylands S: the south',
 hint:"Crater drylands S, the south (toward Godstep and the se rim): the kiln climbing to the south, old titanium-basalt flows with the black mallee on them, the se rim's rust miombo, incense and rain roses on the wetter northern and eastern edges. L arms a fire: click the ground to light it; F walks",
 build:q=>SOUTH.build(q),views:h=>SOUTH.views(h),dropViews:['The Scyvoi Rock'],checks:(add,o)=>SOUTH.checks(add,o),negatives:(add,o)=>SOUTH.negatives(add,o)};

// ---------------------------------------------------------------- the land
const TERR={R:2600};
// the kopjes: x, z, radius, height, terrace step, seed. KOP[0] is the Scyvoi Rock
const KOP=[{x:900,z:-1150,r:140,h:48,step:7,s:1.3,name:'The rose kopje'},{x:-1400,z:-900,r:120,h:38,step:6,s:2.1},{x:1650,z:300,r:110,h:34,step:6,s:3.3},{x:-300,z:-300,r:90,h:26,step:6,s:4.1}];
// THE OLD FLOWS: titanium-basalt tongues out of the southern edge (Godstep's lava steps lie beyond it), each a line north with a width; a flow
// stands ~3 m proud with a steep lobed edge, its surface black sand and cinder. flowAt(x,z) 0..1 (1 on a flow, 0 off it)
const FLOWS=[{pts:[[-900,2700],[-820,1800],[-950,1100],[-700,500]],w:230,s:1},{pts:[[400,2700],[520,1900],[380,1300],[600,800],[480,350]],w:200,s:2},
 {pts:[[1500,2700],[1350,2100],[1500,1600]],w:170,s:3},{pts:[[-2000,2600],[-1900,2100],[-2150,1700]],w:150,s:4}];
function segD(px,pz,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=L2?Math.max(0,Math.min(1,((px-a[0])*dx+(pz-a[1])*dz)/L2)):0;return[Math.hypot(px-a[0]-t*dx,pz-a[1]-t*dz),t];}
FLOWS.forEach(F=>{const xs=F.pts.map(p=>p[0]),zs=F.pts.map(p=>p[1]),m=F.w*1.4;F.box=[Math.min(...xs)-m,Math.min(...zs)-m,Math.max(...xs)+m,Math.max(...zs)+m];});   /* each flow's box: most points are outside every one */
function flowAt(x,z){let f=0;for(const F of FLOWS){if(x<F.box[0]||x>F.box[2]||z<F.box[1]||z>F.box[3])continue;let best=1e9,end=0;for(let i=0;i<F.pts.length-1;i++){const [d,t]=segD(x,z,F.pts[i],F.pts[i+1]);if(d<best){best=d;end=i===F.pts.length-2?t:0;}}
  const w=F.w*(.8+.4*fbm(x*.004+F.s,z*.004,300+F.s,2))*(1-.35*end*end);f=Math.max(f,smooth(w*1.02,w*.88,best));}return f;}
// THE AF GULLY (PLAN-STATIONS.md, station 2: gully galleries on the north-western side, ~2,300 mm, fed from SW Bay's air): a ravine cut ~7 m into
// the plain from the north-west corner, wet and running with the bay's air; the hyperjungle's trees grow along it as a gallery (86)
const GULLY=[[-2700,-700],[-2150,-1000],[-1750,-1500],[-1350,-1750],[-900,-2350],[-700,-2700]];
function gullyD(x,z){if(x>-400||z>-400)return 1e9;let d=1e9;for(let i=0;i<GULLY.length-1;i++)d=Math.min(d,segD(x,z,GULLY[i],GULLY[i+1])[0]);return d;}
// THE LAVA STEP at the southern edge (Godstep's first step; BACKPORT.md's row: tibasalt strata at the southern edge): the ground rises ~30 m on a
// steep face along stepZ(x); the old flows come down off it. Its face is drawn in the tibasalt beds (85-host-step.js)
const stepZ=x=>2120+90*Math.sin(x*.0013+.4)+35*Math.sin(x*.004+1.1)+14*Math.sin(x*.011);
const STEP_H=30;
// the se rim's air on the northern and eastern edges: the wetter ground its trees come in on
function wetEdge(x,z){return Math.max(smooth(-900,-2300,z),smooth(1000,2300,x))*(.75+.25*fbm(x*.002,z*.002,77,2));}
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
function plainH(x,z){return 150+260*smooth(-1600,2600,z)+STEP_H*smooth(-10,9,z-stepZ(x))+3.2*flowAt(x,z)+22*(fbm(x*.0006+3,z*.0006-1,17,3)-.5)+9*(fbm(x*.0023-5,z*.0023+2,19,2)-.5)+40*smooth(-1000,-2700,z)-14*smooth(400,2400,z);}
function landH(x,z){return plainH(x,z)+kopAt(x,z).h;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=landH(x,z);
 {const g=gullyD(x,z);if(g<40)h-=7*smooth(40,4,g)+.6*(fbm(x*.05,z*.05,93,2)-.5)*smooth(20,2,g);}
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
 const rock=clamp(Math.max(K.rock*smooth(.12,.35,slope+.2*K.rock),smooth(.6,.9,slope)*.7,.3*flowAt(x,z)),0,1);   /* a flow: rough basalt, not a refuge */
 const gl=smooth(70,12,gullyD(x,z));
 const wet=clamp(.11+.22*wetEdge(x,z)+.6*gl+.05*(fbm(x*.0015,z*.0015,131,2)-.5)+.42*wash+.16*K.foot+.85*seep,0,1);
 return{wet,flow:Math.max(wash,seep*.8,gl*.85),upland:clamp((h-130)/300,0,1),canyon:0,rim:0,rock,dune:0,oasis:seep,slope,abyss:0,salt:0,
  cold:clamp(.02+(h-150)/1600,0,1),geo:0,barren:0,lava:flowAt(x,z),wetedge:wetEdge(x,z),gully:gl};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','lava','wetedge','gully'];
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
const FIRES=[{ago:.1,x:200,z:-400,frac:.045},{ago:.6,x:-1200,z:300,frac:.05},{ago:1.3,x:1300,z:-600,frac:.055},{ago:2.2,x:-400,z:1400,frac:.05},
 {ago:3.9,x:1100,z:1500,frac:.06},{ago:6,x:-1600,z:-1500,frac:.05}];

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: the kopjes, the washes, the recent fires (a little downwind of where they were lit) and a lattice
const SPINE=[];
KOP.forEach(K=>SPINE.push([K.x,K.z]));
FIRES.forEach(F=>SPINE.push([F.x+FIRE_WIND[0]*260,F.z+FIRE_WIND[1]*260]));
for(let x=-1800;x<=1800;x+=1200)SPINE.push([x,zA(x)]);
SPINE.push([xB(-1400),-1400],[SEEP.x,SEEP.z]);
let MASK=()=>1;   /* the placement mask: 86-host-south.js sets it for each kit it builds; the core's water rule kept */
const WMASK=(x,z)=>{const w=waterH(x,z);if(w<-1e8)return 1;const d=terrainH(x,z)-w;return d<.15?0:d<.7?(d-.15)/.55:1;};
BIO.init({tags:'crater-drylands',mask:(x,z)=>MASK(x,z)*WMASK(x,z),THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 obstacles:OBSTACLES,ticks:tick,seed:29,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:280,mid:760,far:2400,floor:[250,620]},
 windows:{water:[SEEP.x-60,SEEP.z-60,SEEP.x+60,SEEP.z+60]}});
BIO.setSun([-1000,900,-700]);
// the season (the kit's grass, 50; the se rim's miombo carries its own season and flush) and the cooler kiln's scrub, lower (55's make)
BIO.host.seasons=new URLSearchParams(location.search).get('season')!=='0';BIO.host.treeScale=.85;
