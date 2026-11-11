// ================================================================= HOST — stage
// The ideal-type host for the SOUTHERN HIGHLANDS: everything a world provides that a biome does not. Renderer,
// lights, haze, the terrain with terrainH(), the local water surface waterH() (a tarn and the bog pools), the
// climate fields the kit asks for, the tick list, the error panel. The ground, the water, the cloud sea and the mist
// are painted later (84-host-ground.js). A real world replaces this whole section with its own; the kit's fragments
// never read anything from it except through BIO.host.
//
// THE MAP (x east, z south, north is -z; origin at the map's centre, R 2600). A 5.2 km piece of the Inner Wall's southern flank as map 5.1
// (Round 3) draws it: one face about 3 km tall from the hyperjungle's floor to a rim at ~3.5 km (5.1 px 758,1030, old canvas 486,700; the
// re-survey, PLAN-STATIONS.md). The page holds the face from the cloud deck to the rim and the plateau behind it (the owner, 2026-11-09:
// "rebuild as band on the 3 km face and move paramo up the rim"). The face is drawn ~1.4x steeper than the model's (2.3 km in 3.5 km, not
// 6 km): the map stays 5.2 km, so the band from the deck to the rim fits on it; KNOWN_ISSUES.md says so.
//   THE CLOUD SEA      the hyperjungle's wet air pooled below the Wall: a level white deck at CLOUD_Y (1250 m) across the north edge;
//                      nothing of the jungle shows through it
//   THE FACE           benched: treads of ~20 degrees and risers of bare rock ~120-200 m apart, wandering across it. The CLOUD FOREST
//                      fills its lower half (the deck to ~2.4 km: 5.1's Cfb band), the ELFIN forest its middle, open paramo ledges and crags
//                      the top below the rim
//   THE RAVINES        three gullies cut down the face from just under the rim to the deck, each with a stream; the cloud pours up them
//   THE RIM            ~3.5 km, wandering east and west round z ~ +700
//   THE PARAMO         the plateau behind the rim (3.5-3.7 km; 5.1's ET, ~1 atm): giant rosettes in tussock, bogs in the hollows, a tarn
//   THE WHORL STONE    a granite tor whose ledges climb it in a spiral: the landmark; CRAGS, smaller tors on the plateau
//   THE DRY SIDE       the plateau's south-east falls a little toward the eastern high desert and dries: spiral aloes, corkscrew cereus
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
const CLOUD_Y=1250;   // the top of the cloud deck
const RIMH=3500,FACEW=3500,FACEDROP=2450;   // the rim's height, the face's horizontal run and its drop to the map's north edge (~1050 m)
// the rim's line (z of the rim's edge for each x): the plateau lies south of it, the face north
function rimZ(x){return 700+170*Math.sin(x*.0011+.4)+80*Math.sin(x*.0034+1.3)+25*Math.sin(x*.011);}
// where the face meets the deck's top (the deck's south edge; 89z bounds the deck by it)
const DECK_Z=rimZ(0)-FACEW*.93;
// the ravines: each runs north down the face from its head just under the rim to its foot in the deck, meandering; x of its floor at z
const RAV=[{x0:-1350,w:110,a:90,f:.0031,ph:.4},{x0:150,w:140,a:120,f:.0024,ph:1.9},{x0:1500,w:100,a:80,f:.0037,ph:3.1}];
RAV.forEach(R=>{R.head=rimZ(R.x0)-260;R.foot=rimZ(R.x0)-FACEW-200;});
function ravX(R,z){return R.x0+R.a*Math.sin(z*R.f+R.ph)+R.a*.35*Math.sin(z*R.f*3.1+R.ph*2);}
// depth and distance of the nearest ravine at a point: it deepens from its head down the face
function ravAt(x,z){let best={d:1e9,dep:0,R:null};
 for(const R of RAV){if(z>R.head+250)continue;const d=Math.abs(x-ravX(R,z)),u=smooth(R.head+250,R.head-300,z),dep=(40+130*smooth(R.head,R.head-1600,z))*u;
  if(d<R.w*2.6&&dep>0&&(!best.R||d/R.w<best.d/best.R.w))best={d,dep,R};}
 return best;}
// the tors on the plateau: x, z, radius, height, terrace step, seed. TOR[0] is the Whorl Stone, its ledges climbing in a spiral
const TOR=[{x:350,z:1650,r:190,h:120,step:9,s:1.3,spiral:1,name:'The Whorl Stone'},{x:-1700,z:1700,r:120,h:46,step:7,s:2.6},{x:1900,z:1900,r:105,h:38,step:6,s:3.9},
 {x:-500,z:2350,r:95,h:30,step:6,s:5.1},{x:-2100,z:1350,r:90,h:28,step:6,s:6.3},{x:1750,z:2450,r:120,h:44,step:7,s:7.7}];
// the tarn and the bogs (hollows in the plateau)
const TARN={x:-700,z:1450,r:95};
const BOGS=[{x:-700,z:1450,r:330},{x:900,z:1350,r:240},{x:-1550,z:2350,r:260},{x:1100,z:2450,r:200},{x:-200,z:2150,r:180}];
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
// the plateau: rising gently south from the rim, long swells, falling a little to the south-east (the dry side)
function plateauH(x,z){return RIMH+120*smooth(rimZ(x),rimZ(x)+2200,z)+55*(fbm(x*.0007+3,z*.0007-1,17,3)-.5)+22*(fbm(x*.0024-5,z*.0024+2,19,2)-.5)
 -90*smooth(1800,3800,x*.6+z*.8)-10*bogAt(x,z);}
// THE FACE: the rim rounds over (a lip of ~120 m), then the face falls FACEDROP over FACEW, steepening down to its middle and easing at the
// deck; BENCHES: the drop quantised into steps of ~150 m (their height wandering with x), each tread eased flat and each riser steep, so the
// face is shelves of forest between bands of bare rock (the kit's cliff rule keeps the risers bare)
function faceDrop(x,z){const t=rimZ(x)-z;if(t<=-200)return 0;const u=clamp(t/FACEW,0,1.2);
 let d=FACEDROP*(.06*smooth(-200,250,t)+.94*Math.pow(clamp(u,0,1),1.08));if(u>1)d+=FACEDROP*.5*(u-1);
 const step=150+35*Math.sin(x*.0013+1.1)+20*(fbm(x*.002,z*.002,29,2)-.5),q=d/step,qt=(Math.floor(q)+smooth(.25,.85,q-Math.floor(q)))*step;
 return mix(d,qt,.55*smooth(150,500,t))+18*(fbm(x*.006,z*.006,23,2)-.5)*smooth(-100,300,t);}
function landH(x,z){return plateauH(x,z)-faceDrop(x,z)+torAt(x,z).h;}
// THE BOG POOLS: small dark pools in the wettest part of each bog but the tarn's, each dug as a dish like the tarn (its level the lowest point of
// its rim less .15 m, its floor .6 m under it): the old pools waited for a natural dip on a tilted plateau and none ever formed. Their spots
// are KRAND's by (bog, try), never by draw order
const POOLS=(function(){const out=[],u=(b,t,k)=>KRAND.unit(KRAND.hash(45031,b,t,k));
 BOGS.forEach((B,b)=>{if(!b)return;let n=0;for(let t=0;t<40&&n<5;t++){const a=u(b,t,1)*TAU,d=B.r*.5*Math.sqrt(u(b,t,2)),x=B.x+Math.cos(a)*d,z=B.z+Math.sin(a)*d,r=4+7*u(b,t,3);
  if(bogAt(x,z)<.8||out.some(P=>Math.hypot(P.x-x,P.z-z)<P.r+r+14))continue;let lo=1e9;
  for(let k=0;k<12;k++){const q=k/12*TAU;lo=Math.min(lo,landH(x+Math.cos(q)*r*1.15,z+Math.sin(q)*r*1.15));}
  out.push({x,z,r,l:lo-.15});n++;}});return out;})();
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// THE TARN, dug as a bowl (the final rebuild's finding: the old tarn's level lay under its own ground at its centre): the level is the lowest
// point of its rim (1.15 r) less .3 m; inside r the floor falls 7 m below it; outside, a bank rising at 35% from the level, under the land
// wherever the land stands higher
const TARNL=(function(){let lo=1e9;for(let k=0;k<32;k++){const a=k/32*TAU;lo=Math.min(lo,landH(TARN.x+Math.cos(a)*TARN.r*1.15,TARN.z+Math.sin(a)*TARN.r*1.15));}return lo-.3;})();
function terrainH0(x,z){let h=landH(x,z);const r=ravAt(x,z);
 if(r.R){const w=r.R.w,v=smooth(w*2.4,0,r.d);h-=r.dep*Math.pow(v,1.6);h-=1.8*smooth(9,2,r.d);}
 const t=Math.hypot(x-TARN.x,z-TARN.z)/TARN.r;if(t<1.6)h=Math.min(h,t<1?TARNL-7*(1-t*t)-.3*(1-t):TARNL+.35*(t-1)*TARN.r);
 for(let i=0;i<POOLS.length;i++){const P=POOLS[i],dx=x-P.x,dz=z-P.z;if(Math.abs(dx)>P.r*2||Math.abs(dz)>P.r*2)continue;const q=Math.hypot(dx,dz)/P.r;
  if(q<2)h=Math.min(h,q<1?P.l-.6*(1-q*q):P.l+.35*(q-1)*P.r);}
 return h;}

function waterH(x,z){if(Math.hypot(x-TARN.x,z-TARN.z)<TARN.r*1.12)return TARNL;
 for(let i=0;i<POOLS.length;i++){const P=POOLS[i];if(Math.abs(x-P.x)<P.r*1.1&&Math.abs(z-P.z)<P.r*1.1&&Math.hypot(x-P.x,z-P.z)<P.r*1.1)return P.l;}
 return -1e9;}

// ---------------------------------------------------------------- the climate fields (cached below; these are the definitions)
// The kit reads the world's fields (biomes/WORLD.md): wet, flow, rock, slope, cold, upland, oasis, and one this kit adds:
//   fog    how often the ground stands in cloud, 0..1: ~1 on the face at the deck, falling with height above it (FOG_BAND: the cloud forest
//          to ~1.15 km above the deck, ~2.4 km, the elfin band above it, none at the rim), carried up the ravines (the cloud pours up them)
//          and pooled a little in the plateau's bog hollows; this is what makes a cloud forest
// wet is high everywhere but the south-east, which dries toward the desert.
const FOG_BAND=[1950,750];   /* the fog falls from ~1 to 0 between these heights above the deck (85's far field reads it too) */
function fieldsAt(x,z,h,slope){const K=torAt(x,z),r=ravAt(x,z),bog=bogAt(x,z);
 const above=h-CLOUD_Y,rv=r.R?smooth(r.R.w*2.2,r.R.w*.3,r.d)*smooth(r.R.head+250,r.R.head-200,z):0;
 const fog=clamp(smooth(FOG_BAND[0],FOG_BAND[1],above)*.95+rv*.5*smooth(FOG_BAND[0]+350,FOG_BAND[1]+300,above)+bog*.12+.08*(fbm(x*.002,z*.002,141,2)-.5),0,1);
 const dry=smooth(1800,3600,x*.6+z*.8)*smooth(-200,300,z-rimZ(x));
 const rock=clamp(Math.max(K.rock*smooth(.1,.35,slope+.2*K.rock),smooth(.62,.92,slope)*.75),0,1);
 const stream=r.R?smooth(14,3,r.d)*smooth(r.R.head+150,r.R.head-100,z):0;
 const wet=clamp(.62+.3*fog+.3*bog-.55*dry+.06*(fbm(x*.0015,z*.0015,131,2)-.5)+.2*stream,0,1);
 return{wet,flow:Math.max(stream,bog*.6),upland:clamp((h-1200)/2400,0,1),canyon:rv,rim:smooth(-300,0,z-rimZ(x))*smooth(300,0,z-rimZ(x)),rock,dune:0,oasis:bog,slope,abyss:0,salt:0,
  cold:clamp(.35+(h-1400)/3000,0,1),geo:0,barren:0,fog};}
// the slope field's scale: 1.6 on the old rolling stage; 1.0 on the face, so a 30-degree tread is forest ground and only the risers (over
// ~40 degrees) are the kit's bare rock and cliff
const SLOPEK=1.0;
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog'];
const FC=(function(){const N=400,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*SLOPEK,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));


// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: along the rim (the cloud forest's top), down each ravine, across the paramo and to the dry side
const SPINE=[];
for(let x=-2000;x<=2000;x+=800)SPINE.push([x,rimZ(x)-80]);   /* along the rim */
for(let x=-2200;x<=2200;x+=1100)for(const f of[.3,.55,.8])SPINE.push([x,rimZ(x)-FACEW*f]);   /* across the face's bands */
RAV.forEach(R=>{for(let z=R.head;z>R.foot+300;z-=380)SPINE.push([ravX(R,z),z]);});
TOR.forEach(K=>SPINE.push([K.x,K.z]));
BOGS.forEach(B=>SPINE.push([B.x,B.z]));
SPINE.push([1800,2000],[600,2300],[-1100,2000]);
// the mask: nothing roots in the water, nor under the cloud deck (that ground is the hyperjungle's, and not drawn)
function rootMask(x,z){const h=terrainH(x,z);if(h<CLOUD_Y-12)return 0;const d=h-waterH(x,z);return d<.15?0:d<.7?(d-.15)/.55:1;}
BIO.init({tags:'shighlands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:47,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:560,far:2400,floor:[180,440]},
 windows:{water:[TARN.x-180,TARN.z-180,TARN.x+180,TARN.z+180]}});
// THE GRAPHICS SET (BACKPORT.md's universal set, the final rebuild, pair 12; nhighlands' lines): the items' geometry welded and drawn by index
// (core/biome BIO.INDEX_ITEMS; ?index=0 for the soup); one LOD mesh per chunk, small meshes merged up to 1500 triangles and a dithered
// cross-fade over the last 15% of each range (B1/B2: ?lodmerge=0, ?lodfade=0); per-instance range culling for loose instances (?lodcull=0)
{const Q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun([-1000,900,-700]);
