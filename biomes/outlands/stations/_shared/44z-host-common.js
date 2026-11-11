// ================================================================= HOST — what every later station shares (stations 2-8; PLAN.md section 9)
// Station 1 (src/45-host-stage.js and its 84-98) is the Fog Wall's own host. Every later station (stations/<name>/) keeps only its LAND and
// its STAGE record in its own 45-host-stage.js; the rest is this folder's (station.json "use"), each fragment driven by STAGE:
//   44z (this)  the renderer, scene, camera and lights, the error panel, the tick list, the registry; STAGEKIT: the field cache and the
//               view helpers a stage uses
//   84          the painted ground (STAGE.paint, the colonies' casts and seams over it) and up to three library layers (STAGE.layers):
//               16 texture units at most, counted by 98's check
//   84b         the rock bodies (STAGE.rocks: KSTACKS records: tors, inselbergs, mesas, fins), one mesh a kind, the flora kept off them
//   85          the land past the map (STAGE.far)       89 the shared sky at the station's site (STAGE.site, STAGE.sky)
//   89z         the atmosphere (STAGE.atmos)            89zw the water (STAGE.water: pools, lakes, flows, the brine's look)
//   89zx        the build: the stage's structures as records, the kit, one bake, the shadows
//   98          the views (STAGE.views) and the colony rule's checks for the station's types, with their negatives
// THE STAGE RECORD (each station's 45-host-stage.js), every key optional unless marked:
//   key, title, hint (marked)        the page's words          site {px, py} (marked: the 4.2x canvas, as station 1; the sky reads it)
//   types (marked), size, share, reach, cell, seeds           the colony types and the colony pass's options (60: OUTL.*)
//   paint(x, z, h, c, f)             the ground's colour at a texel into THREE.Color c; f(name) a cached field there
//   tint {type: hex}                 each colony type's faint cast on its territory
//   layers [{fam, name, amt, gain}], gl(x, z) -> [a, b, c]   the library layers and their weights per vertex
//   rocks, landmarks, probes, far, sky, atmos, water, build, structures(), views(), checks(add), negatives(add), unlike
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y==null?0:r.y)-2&&y<=(r.y==null?0:r.y)+r.h+5;}
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc9ccd2);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00011);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,18000);
const HEMI=new THREE.HemisphereLight(0xb8c6e2,0x8a6a58,.84);scene.add(HEMI);
const SUN_POS=[-900,1100,900];
const sun=new THREE.DirectionalLight(0xfff2e0,1.3);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xdcd4cc,.2);fill.position.set(300,-100,1000);scene.add(fill);
const TERR={R:3400};
// ---------------------------------------------------------------- STAGEKIT: the field cache (station 1's, generalised) and the view helpers
const STAGEKIT={
 // the fields on an N x N lattice over S metres (18 m cells at N 400): fieldsAt(x, z, h, slope) -> {name: 0..1}; every name in `names`
 // a bilinear lookup; the station's FIELD carries them plus the zero fields the kit's roles may ask for and the station has none of
 fields(names,fieldsAt,ground,o){o=o||{};const N=o.N==null?400:o.N,S=o.S==null?TERR.R*2.2:o.S,a={};names.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
  const cs=S/(N-1);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++)a.h[j*N+i]=ground((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
   const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs),0,1);
   const F=fieldsAt(x,z,a.h[k],slope);for(const n of names)a[n][k]=F[n]==null?0:F[n];}
  const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
  const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
   const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
  const FC={N,S,a,at},FIELD={};names.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));
  // the names every kit role or the core's scatter may read (biomes/WORLD.md): 0 where the station has no such ground
  ['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','seep','ore','wadi','pit','band','mast','dry','butte',
   'wadiX','oreX'].forEach(n=>{if(!FIELD[n])FIELD[n]=()=>0;});
  return{FC,FIELD};},
 // 'near' (0..1): within r0 of a spine point 1, past r1 0. The carpet forms (the needle fur) are drawn near the eye's places only: everything
 // a pass puts is a triangle on the page whether or not the runtime LOD shows it, and a carpet over a whole basin is tens of millions
 nearField(P,r0,r1){return(x,z)=>{let b=0;for(const p of P){const d=Math.hypot(x-p[0],z-p[1]);if(d<r1){const w=smooth(r1,r0,d);if(w>b)b=w;}}return b;};},
 gh:(x,z,dy)=>terrainH(x,z)+(dy==null?0:dy),
 look(cx,cz,dyc,tx,tz,dyt){const g=STAGEKIT.gh;return[cx,g(cx,cz,dyc),cz,tx,g(tx,tz,dyt),tz];},
 // the placed form of a key nearest a point (with a filter), or a stand-in at the point
 near(key,x,z,f){let b=null,bd=1e18;for(const I of OUTL.INST||[]){if(I.key!==key||(f&&!f(I)))continue;const d=(I.x-x)**2+(I.z-z)**2;if(d<bd){bd=d;b=I;}}return b||{x,z,y:terrainH(x,z),H:4,cr:2,stand:true};},
 // a camera d metres from a form at azimuth az, dy over the ground (never under the form's foot), looking at ty over its foot
 at(I,d,az,dy,ty){const cx=I.x+Math.cos(az)*d,cz=I.z+Math.sin(az)*d,g=STAGEKIT.gh;return[cx,Math.max(g(cx,cz,dy==null?2:dy),I.y+(dy==null?2:dy)),cz,I.x,I.y+(ty==null?(I.H==null?1.5:I.H)*.5:ty),I.z];},
};
