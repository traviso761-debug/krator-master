// ================================================================= HOST — stage
// The ideal-type host for the SOUTHERN HIGHLANDS: everything a world provides that a biome does not. Renderer,
// lights, haze, the terrain with terrainH(), the local water surface waterH() (a tarn and the bog pools), the
// climate fields the kit asks for, the tick list, the error panel. The ground, the water, the cloud sea and the mist
// are painted later (84-host-ground.js). A real world replaces this whole section with its own; the kit's fragments
// never read anything from it except through BIO.host.
//
// THE MAP (x east, z south, north is -z; origin at the map's centre, R 2600). A 5.2 km piece of the Inner Wall's
// southern flank, at the top of the steep scarp that drops north into the hyperjungle (biomes/WORLD.md):
//   THE CLOUD SEA      the hyperjungle's dense, wet air pools below the Wall: a level white deck at CLOUD_Y (1120 m)
//                      covers everything north of the scarp. Nothing of the jungle shows through it.
//   THE SCARP          the north edge falls from the rim (~1400 m) through the deck; the CLOUD FOREST lives on it,
//                      soaked by the cloud that laps up against it every day
//   THE RAVINES        three cut back into the plateau from the scarp, each with a stream; the cloud pours up them, so
//                      the forest follows them far onto the plateau (the screw palms and the tree ferns' home)
//   THE PARAMO         the rolling plateau above the cloud (1400-1600 m): giant rosettes in tussock, bogs in the
//                      hollows, one tarn
//   THE WHORL STONE    a granite tor whose ledges climb it in a spiral: the landmark (everything here spirals, even the
//                      rock's jointing, by the locals' account)
//   CRAGS              smaller tors on the plateau
//   THE DRY SIDE       the south-east falls a little toward the eastern high desert and dries: spiral aloes, corkscrew
//                      cereus, silver rosettes
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
const REG=[];function REGISTER(o){REG.push(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT OF THE WALL: about 1 atm here (the highlands are the most earthlike air on Krator, LORE.md), so the sky is
// a true blue overhead and the sun is white; but the air is wet, and the cloud sea throws light back up from below,
// so the shadows are soft and the haze is pale and cool.
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc8d2d6);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00016);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xb4c8e0,0x8a8a6a,.86));
const sun=new THREE.DirectionalLight(0xfff0dc,1.28);sun.position.set(-1000,900,-700);scene.add(sun);
// the cloud sea's glare, from below the rim in the north
const fill=new THREE.DirectionalLight(0xdce4ec,.26);fill.position.set(200,-120,-1000);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:2600};
const CLOUD_Y=1120;   // the top of the cloud deck
// the scarp's foot of the rim (z of the rim's edge for each x): the plateau lies south of it
function rimZ(x){return -1450+170*Math.sin(x*.0011+.4)+80*Math.sin(x*.0034+1.3)+25*Math.sin(x*.011);}
// the ravines: each runs north from its head on the plateau to the scarp, meandering; x of its floor at z
const RAV=[{x0:-1350,head:-250,w:120,a:90,f:.0031,ph:.4},{x0:150,head:350,w:150,a:120,f:.0024,ph:1.9},{x0:1500,head:-600,w:110,a:80,f:.0037,ph:3.1}];
function ravX(R,z){return R.x0+R.a*Math.sin(z*R.f+R.ph)+R.a*.35*Math.sin(z*R.f*3.1+R.ph*2);}
// depth and distance of the nearest ravine at a point: dep grows from the head to the rim
function ravAt(x,z){let best={d:1e9,dep:0,R:null};
 for(const R of RAV){if(z>R.head+300)continue;const d=Math.abs(x-ravX(R,z)),u=smooth(R.head+300,R.head-500,z),dep=(55+110*smooth(R.head,rimZ(R.x0)-200,z))*u;
  if(d<R.w*2.6&&dep>0&&(!best.R||d/R.w<best.d/best.R.w))best={d,dep,R};}
 return best;}
// the tors: x, z, radius, height, terrace step, seed. TOR[0] is the Whorl Stone, its ledges climbing in a spiral
const TOR=[{x:350,z:1150,r:190,h:120,step:9,s:1.3,spiral:1,name:'The Whorl Stone'},{x:-1700,z:700,r:120,h:46,step:7,s:2.6},{x:1900,z:250,r:105,h:38,step:6,s:3.9},
 {x:-500,z:2000,r:95,h:30,step:6,s:5.1},{x:-2100,z:-650,r:90,h:28,step:6,s:6.3},{x:1750,z:1450,r:120,h:44,step:7,s:7.7}];
// the tarn and the bogs (hollows in the plateau)
const TARN={x:-700,z:350,r:95};
const BOGS=[{x:-700,z:350,r:330},{x:900,z:-150,r:240},{x:-1550,z:1450,r:260},{x:1200,z:900,r:200},{x:-250,z:-650,r:180}];
function torAt(x,z){let h=0,rock=0,foot=0;
 for(let i=0;i<TOR.length;i++){const K=TOR[i],dx=x-K.x,dz=z-K.z,D=Math.hypot(dx,dz);if(D>K.r*1.6)continue;
  const a=Math.atan2(dz,dx),d=D/(K.r*(1+.14*Math.sin(3*a+K.s)+.08*Math.sin(5*a+2*K.s)+.1*(fbm(x*.01+K.s,z*.01,200+i,2)-.5)));
  const core=smooth(1.0,.45,d),dome=Math.pow(core,.6)*(.82+.18*(1-d*d));let hh=K.h*Math.max(0,dome);
  // the terraces: level treads and steep risers. On the Whorl Stone the tread height rises with the angle round the
  // tor, so the ledges join into one ledge spiralling to the top (right-handed, as everything here)
  const off=K.spiral?((a/TAU+1)%1)*K.step:0,q=(hh+off)/K.step,qt=(Math.floor(q)+smooth(.6,.95,q-Math.floor(q)))*K.step-off;
  hh=mix(hh,Math.max(0,qt),.78*smooth(.05,.3,core));
  hh+=K.h*.08*smooth(1.42,.92,d)*smooth(.6,1.0,d)+2*(fbm(x*.05,z*.05,210+i,2)-.5)*core;
  h=Math.max(h,hh);rock=Math.max(rock,smooth(1.1,.86,d));foot=Math.max(foot,smooth(1.0,1.12,d)*smooth(1.5,1.18,d));}
 return{h,rock,foot};}
function bogAt(x,z){let b=0;for(const B of BOGS){const d=Math.hypot(x-B.x,z-B.z)/(B.r*(1+.25*(fbm(x*.004+B.x,z*.004,77,2)-.5)));b=Math.max(b,smooth(1,.35,d));}return b;}
// the plateau: rising gently to the south, long swells, falling a little to the south-east (the dry side); the scarp
// drops north from the rim through the cloud deck
function plateauH(x,z){return 1420+150*smooth(-1500,2600,z)+55*(fbm(x*.0007+3,z*.0007-1,17,3)-.5)+22*(fbm(x*.0024-5,z*.0024+2,19,2)-.5)
 -110*smooth(600,3200,x*.6+z*.8)-10*bogAt(x,z);}
function landH(x,z){const zr=rimZ(x),t=z-zr;
 let h=plateauH(x,z);
 // the scarp: the rim rounds over, then a long steep face down through the deck to ~700 m at the map's edge
 if(t<260){const u=smooth(260,-900,t);h=mix(h,h-760,Math.pow(u,1.15))+28*(fbm(x*.006,z*.006,23,2)-.5)*u;}
 return h+torAt(x,z).h;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=landH(x,z);const r=ravAt(x,z);
 if(r.R){const w=r.R.w,v=smooth(w*2.4,0,r.d);h-=r.dep*Math.pow(v,1.6);h-=1.8*smooth(9,2,r.d);}
 const dt=Math.hypot(x-TARN.x,z-TARN.z);if(dt<TARN.r*1.8)h-=7*smooth(TARN.r*1.6,TARN.r*.4,dt);
 return h;}
const TARNL=(function(){let lo=1e9;for(let k=0;k<20;k++){const a=k/20*TAU;lo=Math.min(lo,terrainH0(TARN.x+Math.cos(a)*TARN.r*1.12,TARN.z+Math.sin(a)*TARN.r*1.12));}return lo-.4;})();
// the bog pools: small dark pools in the wettest hollows, each its own level (computed below the fields)
const POOLS=[];
function waterH(x,z){if(Math.hypot(x-TARN.x,z-TARN.z)<TARN.r*1.4)return TARNL;
 for(let i=0;i<POOLS.length;i++){const P=POOLS[i];if(Math.abs(x-P.x)<P.r*1.3&&Math.abs(z-P.z)<P.r*1.3&&Math.hypot(x-P.x,z-P.z)<P.r*1.3)return P.l;}
 return -1e9;}

// ---------------------------------------------------------------- the climate fields (cached below; these are the definitions)
// The kit reads the world's fields (biomes/WORLD.md): wet, flow, rock, slope, cold, upland, oasis, and one this kit adds:
//   fog    how often the ground stands in cloud, 0..1: ~1 on the scarp at the deck, falling with height above it, carried
//          up the ravines (the cloud pours up them) and pooled in the bog hollows; this is what makes a cloud forest
// wet is high everywhere but the south-east, which dries toward the desert.
function fieldsAt(x,z,h,slope){const K=torAt(x,z),r=ravAt(x,z),bog=bogAt(x,z);
 const above=h-CLOUD_Y,rv=r.R?smooth(r.R.w*2.2,r.R.w*.3,r.d)*smooth(r.R.head+300,r.R.head-200,z):0;
 const fog=clamp(smooth(420,60,above)*.95+rv*.55*smooth(560,160,above)+bog*.18+.08*(fbm(x*.002,z*.002,141,2)-.5),0,1);
 const dry=smooth(900,2600,x*.6+z*.8);
 const rock=clamp(Math.max(K.rock*smooth(.1,.35,slope+.2*K.rock),smooth(.62,.92,slope)*.75),0,1);
 const stream=r.R?smooth(14,3,r.d)*smooth(r.R.head+200,r.R.head-100,z):0;
 const wet=clamp(.62+.3*fog+.3*bog-.55*dry+.06*(fbm(x*.0015,z*.0015,131,2)-.5)+.2*stream,0,1);
 return{wet,flow:Math.max(stream,bog*.6),upland:clamp((h-1000)/700,0,1),canyon:rv,rim:smooth(-300,0,z-rimZ(x))*smooth(300,0,z-rimZ(x)),rock,dune:0,oasis:bog,slope,abyss:0,salt:0,
  cold:clamp(.35+(h-1200)/1500,0,1),geo:0,barren:0,fog};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog'];
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
// the bog pools: the wettest hollow points of each bog, a few metres across, their level just under the lowest rim
(function(){reseed(45031);for(const B of BOGS){if(B===BOGS[0])continue;let n=0;
 for(let t=0;t<200&&n<6;t++){const a=rr(0,TAU),d=B.r*.55*Math.sqrt(rng()),x=B.x+Math.cos(a)*d,z=B.z+Math.sin(a)*d;if(bogAt(x,z)<.8||FIELD.slope(x,z)>.12)continue;
  if(POOLS.some(P=>Math.hypot(P.x-x,P.z-z)<P.r+rr(14,26)))continue;const r=rr(4,11);let lo=1e9;
  for(let k=0;k<12;k++){const q=k/12*TAU;lo=Math.min(lo,terrainH0(x+Math.cos(q)*r,z+Math.sin(q)*r));}
  const c=terrainH0(x,z);if(lo-c<.05)continue;POOLS.push({x,z,r,l:Math.min(lo-.1,c+.45)});n++;}}})();

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: along the rim (the cloud forest's top), down each ravine, across the paramo and to the dry side
const SPINE=[];
for(let x=-2000;x<=2000;x+=800)SPINE.push([x,rimZ(x)+60]);
RAV.forEach(R=>{for(let z=R.head;z>rimZ(R.x0)-200;z-=320)SPINE.push([ravX(R,z),z]);});
TOR.forEach(K=>SPINE.push([K.x,K.z]));
BOGS.forEach(B=>SPINE.push([B.x,B.z]));
SPINE.push([0,600],[-1000,1100],[1300,1500],[1800,2000],[600,1900]);
// the mask: nothing roots in the water, nor under the cloud deck (that ground is the hyperjungle's, and not drawn)
function rootMask(x,z){const h=terrainH(x,z);if(h<CLOUD_Y-12)return 0;const d=h-waterH(x,z);return d<.15?0:d<.7?(d-.15)/.55:1;}
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:47,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:560,far:2400,floor:[180,440]},
 windows:{water:[TARN.x-180,TARN.z-180,TARN.x+180,TARN.z+180]}});
BIO.setSun([-1000,900,-700]);
