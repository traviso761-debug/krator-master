// ================================================================= HOST — the page: renderer, scene, lights, the error panel, the registry, helpers
// Shared by every station (each station's own 45b-host-stage.js makes the land). The light is the shared sky's
// (89s-host-sky.js sets the sun, the hemisphere and the fog from the colour script at the hour); the values here are
// what the page shows before the first frame. The Catch's floor is a furnace under a clear sky in dense air (~1.55 atm):
// a hard sun, a warm milky horizon, dust in the haze.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   /* BIO.record: the volume as a core/tags record too */
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xd8c8ac,.00011);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,250000);   /* far enough for the far apron (45c) */
const HEMI=new THREE.HemisphereLight(0xd8d4c8,0x8a6a48,.6);scene.add(HEMI);
const sun=new THREE.DirectionalLight(0xfff0d8,1.6);sun.position.set(-900,1300,-500);scene.add(sun);
const fill=new THREE.DirectionalLight(0xd8c0a0,.26);fill.position.set(900,300,900);scene.add(fill);

// ---------------------------------------------------------------- helpers every stage uses
// NOISE: core/rand's (KRAND.fbm: portable to Godot bit for bit), in [0,1]; s the frequency, o the octaves, k the seed
const nz=(x,z,s,o,k)=>KRAND.fbm(x*s,0,z*s,o||3,k||1);
// a ridge noise: 1 on the crest line of the noise's .5 contour, 0 far from it
const ridgeN=(x,z,s,o,k)=>1-Math.abs(2*nz(x,z,s,o,k)-1);
// distance from (x,z) to a polyline [[x,z],...] (and the index of the nearest segment)
function polyD(P,x,z){let m=1e9,mi=0;for(let i=1;i<P.length;i++){const ax=P[i-1][0],az=P[i-1][1],dx=P[i][0]-ax,dz=P[i][1]-az,L=dx*dx+dz*dz||1,
 t=clamp(((x-ax)*dx+(z-az)*dz)/L,0,1),d=Math.hypot(x-ax-dx*t,z-az-dz*t);if(d<m){m=d;mi=i;}}return m;}
// THE FIELD CACHE: a stage's fields (fieldsAt(x,z,h,slope) -> {name: value}) baked once on an N x N grid over 2.2 R, read
// bilinearly. Placement, the painted ground and the inspector all read the same numbers.
function fieldCache(R,N,ground,fieldsAt,names){const S=R*2.2,a={};names.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++)a.h[j*N+i]=ground((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);names.forEach(n=>a[n][k]=F[n]==null?0:F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 const F={};names.forEach(n=>F[n]=(x,z)=>at(a[n],x,z));return{N,S,a,at,F};}
// the fields every Catch stage gives (BIOME-API.md): the core's (wet, flow, upland, rock, slope, salt), the sedesert kit's
// (canyon, rim, dune, oasis, abyss: read only while that kit builds, 88-host-build.js) and the Catch's own: sand (loose sand
// 0..1), reg (gravel desert), silt (old lake sediment), yard (yardang ground), crust (salt and soda crust), algal (the mats
// at the lake's margin), spring (the oasis's water table: 1 at the pool), trod (trampled ground round the water), bed
// (inside an old lake), strand, dry (the years out of the water / 1000), shade (a wall or a mesa close by), cold
const FNAMES=['wet','flow','upland','rock','slope','salt','canyon','rim','dune','oasis','abyss','sand','reg','silt','yard','crust','algal','spring','trod','bed','strand','dry','cold','soda'];
// THE BINDING every stage ends with: the field cache, the fields handed to the kits, the mask, BIO.init.
// o: {R, N, terrainH, waterH, fieldsAt, seed, spine, lod, rockAt(x,z) -> true on a mesa, keep(x,z) -> 0..1 ground the
// stage bars from every kit (a camp, a portal's apron)}. The sedesert kit (read in place) zones itself from its own fields
// (canyon, rim, dune, oasis, abyss): while it builds (SED.on, 88-host-build.js) it reads the stage's SED.fields instead.
const OBSTACLES=[];
const SED={on:false,fields:{}};
let MASK=null;
function bindStage(o){const FCc=fieldCache(o.R,o.N||420,o.terrainH,o.fieldsAt,FNAMES),FIELD={};
 FNAMES.forEach(n=>FIELD[n]=FCc.F[n]);
 ['dune','canyon','rim','abyss','oasis'].forEach(n=>{const f=FIELD[n];FIELD[n]=(x,z)=>SED.on&&SED.fields[n]?SED.fields[n](x,z):f(x,z);});
 const keep=o.keep||(()=>0),rockAt=o.rockAt||(()=>false);
 // nothing roots under the water, on a mesa, or on ground the stage keeps
 const waterMask=(x,z)=>{if(rockAt(x,z))return 0;const w=o.waterH(x,z);let m=1;if(w>-1e8){const d=o.terrainH(x,z)-w;m=d<.15?0:d<.7?(d-.15)/.55:1;}return m*(1-keep(x,z));};
 MASK=waterMask;
 BIO.init({tags:'catch',THREE:THREE,scene:scene,terrainH:o.terrainH,waterH:o.waterH,mask:(x,z)=>MASK(x,z),
  obstacles:OBSTACLES,ticks:tick,seed:o.seed,origin:o.spine,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
  lod:Object.assign({hero:600,mid:1400,far:3000,floor:[420,1000]},o.lod||{}),windows:{water:[-o.R,-o.R,o.R,o.R]}});
 BIO.setSun([-900,1300,-500]);
 return{FC:FCc,FIELD,waterMask};}
// a preset view: the camera h metres over the ground at (cx,cz), looking at a point th metres over the ground at (tx,tz)
const viewAt=(gh,cx,cz,h,tx,tz,th)=>[cx,gh(cx,cz)+h,cz,tx,gh(tx,tz)+(th==null?1.5:th),tz];
// A SPRING'S POOL (core/water still): a round hollow the spring keeps clear, its level from the land round its rim. The bed
// is carved under it (carve(h, x, z): the ground falls from the bank, 0.4 m over the water at r, to `deep` under it at the
// eye), and the water's polygon lies at 0.97 r, under the bank's slope, so no dry ring shows inside the water's edge.
function makePool(o){const r=o.r,land=o.land,deep=o.deep==null?1.8:o.deep;let lo=1e9;
 for(let k=0;k<24;k++){const a=k/24*TAU;lo=Math.min(lo,land(o.x+Math.cos(a)*r*1.3,o.z+Math.sin(a)*r*1.3));}
 const lv=lo-.5,poly=[];for(let k=0;k<36;k++){const a=k/36*TAU;poly.push([o.x+Math.cos(a)*r*.97,o.z+Math.sin(a)*r*.97]);}
 const rec=WATER.still({name:o.name,level:lv,poly,gradient:o.gradient||{centre:0x1c5450,rim:0x5a7a5a,power:1.4}});
 const P={x:o.x,z:o.z,r,lv,rec,name:o.name,
  d:(x,z)=>Math.hypot(x-o.x,z-o.z),
  carve:(h,x,z)=>{const d=Math.hypot(x-o.x,z-o.z);if(d>r*1.6)return h;const t=d/r,b=lv-deep+(deep+.4)*t*t;return d<r?Math.min(h,b):mix(Math.min(h,b),h,smooth(r,r*1.6,d));},
  contains:(x,z)=>Math.hypot(x-o.x,z-o.z)<r*.97};
 return P;}
// THE CAMPS (host features, not flora): fire rings of blackened stones with an ash bed, and spoil heaps; each a registered
// record before it is drawn. One InstancedMesh of stones for every ring on the page, one of ash discs.
const CAMP_STONES=[],CAMP_ASH=[];
function fireRing(x,z,name,k){const y=terrainH(x,z),n=9;REGISTER({name,key:'camp.firering',x,z,y:y-.5,r:1.6,h:1.5});
 for(let i=0;i<n;i++){const a=i/n*TAU+KRAND.unit(KRAND.hash(7101,k,i))*.3,s=.18+.1*KRAND.unit(KRAND.hash(7102,k,i));CAMP_STONES.push([x+Math.cos(a)*.75,terrainH(x+Math.cos(a)*.75,z+Math.sin(a)*.75),z+Math.sin(a)*.75,s,a]);}
 CAMP_ASH.push([x,y+.02,z]);}
function drawCamps(){if(!CAMP_STONES.length)return;const M4=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new THREE.Vector3(),p=new THREE.Vector3(),e=new THREE.Euler();
 const sg=new THREE.IcosahedronGeometry(1,0);sg.scale(1,.6,.9);const sm=new THREE.InstancedMesh(sg,new THREE.MeshLambertMaterial({color:0x3a3430}),CAMP_STONES.length);
 CAMP_STONES.forEach((c,i)=>{e.set(0,c[4],0);q.setFromEuler(e);M4.compose(p.set(c[0],c[1]+c[3]*.3,c[2]),q,s.set(c[3],c[3],c[3]));sm.setMatrixAt(i,M4);});
 sm.userData.host=true;sm.userData.inspectLabel='A fire ring (the caravans\', blackened stones)';sm.frustumCulled=false;scene.add(sm);
 const ag=new THREE.CircleGeometry(.7,10);ag.rotateX(-Math.PI/2);const am=new THREE.InstancedMesh(ag,new THREE.MeshLambertMaterial({color:0x2a2622,polygonOffset:true,polygonOffsetFactor:-2}),CAMP_ASH.length);
 CAMP_ASH.forEach((c,i)=>{M4.makeTranslation(c[0],c[1],c[2]);am.setMatrixAt(i,M4);});am.userData.host=true;am.userData.inspectLabel='Ash and charcoal (a fire ring\'s bed)';am.frustumCulled=false;scene.add(am);}
// HEIGHT FOG (the owner, 2026-10-26: a uniform haze thick enough to part near dunes from far ones looked like a lake on the plain; desert
// haze is dust, low and warm). The page's own ShaderChunk fog (it read cameraPosition, which r128 never uploads to a Lambert material) is
// replaced by core/atmos's (ATMOS.heightFog, the final rebuild's R1: 89zz-host-core.js) on the same numbers: STAGE.fogH {y0, H} is its
// reference height and 1 / H its falloff. ?hfog=0 the plain fog.
