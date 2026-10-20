// ================================================================= HOST — stage
// The ideal-type host for the OIDONG VALLEY: everything a world provides that a biome does not. Renderer, lights, haze,
// the terrain with terrainH(), the local water surface waterH() (the chain of still pools), the climate fields the kit
// asks for, the tick list, the error panel. The ground, the water and the mist are painted later (84-host-ground.js). A
// real world replaces this whole section with its own; the kit's fragments never read anything from it except through
// BIO.host.
//
// THE MAP (x east, z south, north is -z; origin at the map's centre, R 2600). A 5.2 km length of the Oidong Valley east
// of the Vale of Xanadu (LORE.md 6.15: the History Monks' country), a chilly enclosed high valley at ~1600 m:
//   THE AXIS           runs east-west, wandering a little; the valley floor is a kilometre wide between the walls
//   THE POOLS          a chain of four still pools on the floor, the Mirror the largest in the west; a stream links them
//   THE FLATS          pale gravel fans off the south wall, an old lake bed's beaches: the raked-looking ground
//   THE WALLS          rise north and south to ranges off the map; crags where they steepen
//   THE HEAD           in the east the floor steps up 70 m: the cataract that feeds the stream, and its mist
//   LONGSONG'S ROCK    a flat-topped knoll north of the axis mid-valley, its east face a cliff: the monastery's site
//                      (settlements/longsong, not built here; nothing is planted on its top)
//   THE PASS           the west edge: the floor runs out of the map toward Xanadu
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
// a shader that fails to compile is only a console error in three.js, and its mesh silently does not draw: the panel
// shows it, so verify.py fails on it
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;document.body.appendChild(renderer.domElement);
// THE LIGHT OF THE VALLEY: about 1 atm at 1600 m, clear cold air, so the zenith is a deep cool blue and the sun white;
// the haze is pale and faintly lilac (the still water throws the sky back up), and the shadows are soft.
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd8dce6);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00014);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xcfdcea,0xa8b0a0,.82));
const sun=new THREE.DirectionalLight(0xfff4e4,1.22);sun.position.set(-1000,900,-700);scene.add(sun);
// the pools' glare and the walls' bounce, from the south-east
const fill=new THREE.DirectionalLight(0xe4e0f0,.22);fill.position.set(700,300,900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:2600};
// the valley's axis: z of the floor's middle for each x
function axisZ(x){return 140*Math.sin(x*.0008+.6)+60*Math.sin(x*.0027+1.9)+18*Math.sin(x*.009);}
// the floor: rising gently east, and up a step at the head (the cataract's face, x 2000..2090)
function floor0(x){return 1580+(x+2600)*.009+70*smooth(2000,2090,x)+40*smooth(2250,2600,x);}
// the pools: x, offset off the axis, radius, name. The levels are computed below from the carved hollows
const POOLS=[{x:-1750,dz:10,r:330,name:'The Mirror'},{x:-700,dz:-40,r:170,name:'The second pool'},{x:350,dz:30,r:230,name:'The lotus pool'},{x:1250,dz:-20,r:150,name:'The upper pool'}];
POOLS.forEach(P=>{P.z=axisZ(P.x)+P.dz;});
// the flats: gravel fans off the south wall, ellipses on the south side of the floor
const FANS=[{x:-1150,dz:300,rx:420,rz:240},{x:150,dz:330,rx:380,rz:220},{x:1000,dz:280,rx:330,rz:200},{x:-2250,dz:260,rx:260,rz:170}];
FANS.forEach(F=>{F.z=axisZ(F.x)+F.dz;});
function fanAt(x,z){let f=0;for(const F of FANS){const u=(x-F.x)/(F.rx*(1+.18*(fbm(x*.003+F.x,z*.003,61,2)-.5))),v=(z-F.z)/F.rz,d=Math.hypot(u,v);f=Math.max(f,smooth(1.05,.6,d));}return f;}
// Longsong's rock: a flat-topped knoll, its east face steep (the hermits' cliff of the blueprint)
const KNOLL={x:600,z:axisZ(600)-330,r:190,h:62,name:"Longsong's rock (the monastery's site, settlements/longsong: not built)"};
function knollAt(x,z){const dx=x-KNOLL.x,dz=z-KNOLL.z,D=Math.hypot(dx,dz);if(D>KNOLL.r*1.7)return{h:0,rock:0,top:0};
 const a=Math.atan2(dz,dx),re=KNOLL.r*(1-.28*Math.max(0,Math.cos(a)))*(1+.08*Math.sin(3*a+1.1)),d=D/re;
 const top=smooth(.78,.6,d),core=smooth(1.0,.55,d),east=Math.max(0,Math.cos(a));
 const h=KNOLL.h*(top+(1-top)*Math.pow(core,mix(.8,2.2,east)))+2*(fbm(x*.04,z*.04,211,2)-.5)*core;
 return{h,rock:smooth(1.15,.95,d)*(1-top*.7),top};}
// the stream: a shallow channel wandering along the axis between the pools (painted dark, not water)
function streamOff(x){return 26*Math.sin(x*.011+.4)+12*Math.sin(x*.031+2.2);}
function streamD(x,z){return Math.abs(z-axisZ(x)-streamOff(x));}
function landH(x,z){const az=axisZ(x),dz=z-az,W=520;
 let h=floor0(x);
 // the floor: long swells, falling a little toward the axis; the flats nearly level, two or three metres up
 const fan=fanAt(x,z);
 h+=mix(6*(fbm(x*.0012+3,z*.0012-1,17,3)-.5)+2.5*(fbm(x*.005-2,z*.005+5,19,2)-.5)+.004*Math.abs(dz),2.5+.006*Math.max(0,dz-200)+.6*(fbm(x*.01,z*.01,23,2)-.5),fan);
 // the walls: rising past the floor's edge in benches and terraces, steepening toward the ranges off the map
 const u=Math.max(0,Math.abs(dz)-W*(1+.12*Math.sin(x*.0016+1)))/1500;
 const bench=1+.14*Math.sin(u*TAU*2.2+x*.0012)*smooth(.1,.4,u);
 h+=560*Math.pow(u,1.35)*bench+90*u*(fbm(x*.0018+7,z*.0018-4,29,3)-.5)+24*Math.pow(u,.5)*(fbm(x*.006,z*.006+9,31,2)-.5);
 // the head: the hanging step's face is rough rock
 h+=12*smooth(2000,2090,x)*(1-smooth(2090,2200,x))*(fbm(x*.02,z*.02,37,2)-.5);
 return h+knollAt(x,z).h;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=landH(x,z);
 for(let i=0;i<POOLS.length;i++){const P=POOLS[i],d=Math.hypot(x-P.x,z-P.z)/(1+.14*(fbm(x*.003+i,z*.003,71+i,2)-.5));if(d<P.r*1.5)h-=7.5*smooth(P.r*1.4,P.r*.3,d);}
 const sd=streamD(x,z);if(sd<24)h-=1.4*smooth(18,2,sd);
 return h;}
POOLS.forEach(P=>{let lo=1e9;for(let k=0;k<24;k++){const a=k/24*TAU;lo=Math.min(lo,terrainH0(P.x+Math.cos(a)*P.r*1.12,P.z+Math.sin(a)*P.r*1.12));}P.l=lo-.35;});
function waterH(x,z){for(let i=0;i<POOLS.length;i++){const P=POOLS[i];if(Math.abs(x-P.x)<P.r*1.5&&Math.abs(z-P.z)<P.r*1.5&&Math.hypot(x-P.x,z-P.z)<P.r*1.5)return P.l;}return -1e9;}
const CATARACT={x:2050,z:axisZ(2050)+streamOff(2050)};

// ---------------------------------------------------------------- the climate fields (cached below; these are the definitions)
// The kit reads the world's fields (biomes/WORLD.md): wet, flow, rock, slope, cold, upland, mist, and one this kit adds:
//   flat   the pale gravel flats, 0..1 (the fans)
// wet is high over the whole floor (the pools' air), lower on the flats and the walls; mist is the cataract's spray.
function fieldsAt(x,z,h,slope){const K=knollAt(x,z),fan=fanAt(x,z),f0=floor0(x);
 const sd=streamD(x,z),stream=smooth(16,3,sd)*smooth(1900,1700,x)*(1-smooth(-200,-2600,x)*0);
 let dw=1e9;for(const P of POOLS)dw=Math.min(dw,Math.hypot(x-P.x,z-P.z)-P.r);
 const dc=Math.hypot(x-CATARACT.x,z-CATARACT.z);
 const mist=clamp(smooth(560,120,dc)*.9+.35*smooth(1750,2300,x)*smooth(1200,0,Math.abs(z-axisZ(x)))+.06*(fbm(x*.002,z*.002,141,2)-.5),0,1);
 const up=clamp((h-f0)/620,0,1);
 const rock=clamp(Math.max(K.rock*.95,smooth(.74,1.0,slope)*.9,smooth(.6,.78,slope)*smooth(.35,.7,up)*.5),0,1);
 const wet=clamp(.66+.3*smooth(70,0,dw)-.48*fan+.26*stream+.22*mist-.35*up-.3*rock+.07*(fbm(x*.0015,z*.0015,131,2)-.5),0,1);
 return{wet,flow:stream,upland:up,canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:0,
  cold:clamp(.42+(h-1560)/1300,0,1),geo:0,barren:0,fog:0,mist,flat:fan*(1-rock)};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','flat'];
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

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[{x:KNOLL.x,z:KNOLL.z,r:150}];   // nothing is planted on Longsong's rock
// the LOD spine: along the axis, the pools, the flats, the rock, the head
const SPINE=[];
for(let x=-2300;x<=2300;x+=450)SPINE.push([x,axisZ(x)]);
POOLS.forEach(P=>SPINE.push([P.x,P.z]));FANS.forEach(F=>SPINE.push([F.x,F.z]));
SPINE.push([KNOLL.x,KNOLL.z+120],[CATARACT.x-150,CATARACT.z],[-600,axisZ(-600)-350],[1500,axisZ(1500)+380]);
// the mask: nothing roots in the water nor on the rock's top
function rootMask(x,z){const d=terrainH(x,z)-waterH(x,z);if(d<.15)return 0;const m=d<.7?(d-.15)/.55:1;return m*(1-knollAt(x,z).top);}
const WBOX=(function(){let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;POOLS.forEach(P=>{x0=Math.min(x0,P.x-P.r*1.5);z0=Math.min(z0,P.z-P.r*1.5);x1=Math.max(x1,P.x+P.r*1.5);z1=Math.max(z1,P.z+P.r*1.5);});return[x0,z0,x1,z1];})();
BIO.init({tags:'oidong',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:19,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:560,far:2400,floor:[180,440]},
 windows:{water:WBOX}});
BIO.setSun([-1000,900,-700]);
