// ================================================================= HOST — stage, for the STATIONS above the scarp (2 the spiral conifers, 3 the fellfield and the ice)
// PLAN-STATIONS.md, "The re-survey on map 5.1" and "Built". This replaces src/45-host-stage.js for a `--station` page (station.json: "drop"
// 45 and map this file in its place) and keeps its contract: TERR, CLOUD_Y, rimZ, RAV, ravX, ravAt, TOR, TARN, TARNL, BOGS, POOLS, torAt,
// bogAt, plateauH, landH, terrainH, terrainH0, waterH, fieldsAt, FNAMES, FC, FIELD, OBSTACLES, SPINE, rootMask and the BIO binding, so src/'s
// host fragments (84 the ground and the mist, 85 the far field, 89zw the water, 89zx the build) run on it unchanged. What differs per station
// is its LAND (stations/<name>/44s-host-land.js, STATION_LAND): the ground, the tors, the tarn, the extra fields and the light.
// No cloud deck stands on these stages (the hyperjungle's deck lies 2.5-4 km below, north of the scarp: the sky's landmark), no ravines and no
// bogs; the tarn is dug as a true bowl (its level above its whole floor: station 1's tarn is not, KNOWN_ISSUES.md).
const L_=STATION_LAND;
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(L_.haze==null?0xc4ced8:L_.haze);scene.fog=new THREE.FogExp2(HAZE.getHex(),L_.fog==null?.00012:L_.fog);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xb4c8e6,0x8a8676,.86));
const SUN_POS=L_.sun||[-1000,950,-500];
const sun=new THREE.DirectionalLight(0xfff4e4,1.3);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xdce4ec,.2);fill.position.set(200,-120,-1000);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:L_.R==null?2600:L_.R};
const CLOUD_Y=-1e5;   /* no deck on the stage: 84's mist finds no deck edge, the root mask no deck floor */
const rimZ=x=>-1e9,RAV=[],BOGS=[],POOLS=[];
const FOG_BAND=[400,100],DECK_Z=-1e9;   /* src/45's names that 84 and 85 read: no cloud band, no deck edge on these stages */
const ravX=(R,z)=>R.x0,ravAt=()=>({d:1e9,dep:0,R:null}),bogAt=()=>0;
const TOR=L_.tors||[];
function torAt(x,z){let h=0,rock=0,foot=0;
 for(let i=0;i<TOR.length;i++){const K=TOR[i],dx=x-K.x,dz=z-K.z,D=Math.hypot(dx,dz);if(D>K.r*1.6)continue;
  const a=Math.atan2(dz,dx),d=D/(K.r*(1+.14*Math.sin(3*a+K.s)+.08*Math.sin(5*a+2*K.s)+.1*(fbm(x*.01+K.s,z*.01,200+i,2)-.5)));
  const core=smooth(1.0,.45,d),dome=Math.pow(core,.6)*(.82+.18*(1-d*d));let hh=K.h*Math.max(0,dome);
  // the terraces (src/45's tors): on a spiral tor the tread climbs with the angle round it, so the ledges join into one ledge spiralling up
  const off=K.spiral?((a/TAU+1)%1)*K.step:0,q=(hh+off)/K.step,qt=(Math.floor(q)+smooth(.6,.95,q-Math.floor(q)))*K.step-off;
  hh=mix(hh,Math.max(0,qt),.78*smooth(.05,.3,core));
  hh+=K.h*.08*smooth(1.42,.92,d)*smooth(.6,1.0,d)+2*(fbm(x*.05,z*.05,210+i,2)-.5)*core;
  h=Math.max(h,hh);rock=Math.max(rock,smooth(1.1,.86,d));foot=Math.max(foot,smooth(1.0,1.12,d)*smooth(1.5,1.18,d));}
 return{h,rock,foot};}
const plateauH=(x,z)=>L_.base(x,z);
function landH(x,z){return L_.base(x,z)+torAt(x,z).h;}
// THE TARN, dug as a bowl: its level is the lowest point of its rim (at 1.15 r) less .3 m; inside r the floor falls to `depth` below it; outside,
// a bank rising at 35% from the level, under the land wherever the land stands higher (so the land is untouched past the bank)
const TARN=L_.tarn||null;
const TARNL=TARN?(function(){let lo=1e9;for(let k=0;k<32;k++){const a=k/32*TAU;lo=Math.min(lo,landH(TARN.x+Math.cos(a)*TARN.r*1.15,TARN.z+Math.sin(a)*TARN.r*1.15));}return lo-.3;})():-1e9;
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=landH(x,z);
 if(TARN){const t=Math.hypot(x-TARN.x,z-TARN.z)/TARN.r;if(t<1.6){const hb=t<1?TARNL-(TARN.depth==null?5:TARN.depth)*(1-t*t)-.3*(1-t):TARNL+.35*(t-1)*TARN.r;h=Math.min(h,hb);}}
 if(L_.carve)h=L_.carve(x,z,h);
 return h;}
function waterH(x,z){if(TARN&&Math.hypot(x-TARN.x,z-TARN.z)<TARN.r*1.12)return TARNL;return -1e9;}

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The kit's names (src/45) with none of the cloud forest's: fog stays low (the station stands above the cloud), no ravines, no bogs. The land
// adds its own (L_.extra: their names, L_.fields(x,z,h,slope,F) fills them): the snowbeds' lingering snow, the scree, the treeline, the ice.
function fieldsAt(x,z,h,slope){const K=torAt(x,z);
 const rock=clamp(Math.max(K.rock*smooth(.1,.35,slope+.2*K.rock),smooth(.62,.92,slope)*.75),0,1);
 const F={wet:clamp(L_.wet==null?.5:L_.wet,0,1),flow:0,upland:1,canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:0,
  cold:clamp((h-(L_.coldFrom==null?3000:L_.coldFrom))/1500,0,1),geo:0,barren:0,fog:clamp(L_.fogAt?L_.fogAt(x,z,h):.05,0,1)};
 if(L_.fields)L_.fields(x,z,h,slope,F,K);
 return F;}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog'].concat(L_.extra||[]);
const FC=(function(){const N=400,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const Lc={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==Lc.x||z!==Lc.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);Lc.x=x;Lc.z=z;Lc.k=j*N+i;Lc.fu=u-i;Lc.fv=v-j;}
  const k=Lc.k,fu=Lc.fu,fv=Lc.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
const SPINE=(L_.spine||[]).slice();
TOR.forEach(K=>SPINE.push([K.x,K.z]));
if(TARN)SPINE.push([TARN.x,TARN.z]);
// the mask: nothing roots in the water, nor where the land says (the ice)
function rootMask(x,z){const h=terrainH(x,z);if(L_.mask&&L_.mask(x,z,h)<=0)return 0;const d=h-waterH(x,z);return d<.15?0:d<.7?(d-.15)/.55:1;}
BIO.init({tags:'shighlands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:L_.seed==null?47:L_.seed,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:L_.lod||{hero:230,mid:560,far:2400,floor:[180,440]},
 windows:TARN?{water:[TARN.x-TARN.r*2,TARN.z-TARN.r*2,TARN.x+TARN.r*2,TARN.z+TARN.r*2]}:{}});
// THE GRAPHICS SET (src/45's lines): the items welded and drawn by index, the LOD merge, fade and cull
{const Q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS);
