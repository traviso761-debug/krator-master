// ================================================================= HOST — what every later station shares (stations 2-4; PLAN.md section 7)
// Station 1 (src/45-host-stage.js and its 84-98) is the Narrows' own host. Every later station (stations/<name>/) keeps only its LAND, its kit
// placement and its STAGE record; the rest is this folder's (station.json "use"), each fragment driven by STAGE:
//   44z (this)  the renderer, scene, camera and lights, the error panel, the tick list, the registry; farModel (the model's heights past the
//               map, the station's 44f); STAGEKIT: the field cache and the view helpers a stage uses
//   84          the painted ground (STAGE.paint) and up to three library layers (STAGE.layers): 16 texture units at most, counted by 98
//   84b         the rock bodies (STAGE.rocks: KSTACKS records: the dike ribs, the erratics), one mesh a kind, each registered
//   85          the land past the map (the model's own heights)       86 the people's works (STAGE.works: plain records and boxes)
//   87          the hazards (STAGE.hazards, STAGE.heat, STAGE.flood: core/hazard records)      87b the fauna (STAGE.fauna: kits/fauna)
//   89          the shared sky at the station's site (STAGE.site, STAGE.sky)
//   89z         the atmosphere and the gap's wind (STAGE.down, STAGE.wind, STAGE.banners)
//   89zw        the water (STAGE.water: lakes, flows, pools, terraces; the flood's surface)
//   89zx        the build: the works, the kit (OGATE.build: the station's 60), one bake, the shadows
//   98          the views (STAGE.views) and the checks every station shares, then the stage's own (STAGE.checks), each with a negative
// THE STAGE RECORD (each station's 45-host-stage.js), every key optional unless marked:
//   key, title, hint (marked)        the page's words          site {px, py} (marked: the sky frame's 4.2x canvas: 5.1 minus 272,330)
//   px [x, y] (marked)               the station's 5.1 pixel (the far data's centre: 98 checks it)
//   paint(x, z, h, c, f)             the ground's colour at a texel into THREE.Color c; f(name) a cached field there
//   layers [{fam, name, amt, gain}], gl(x, z) -> [a, b, c]   the library layers and their weights per vertex
//   rocks, landmarks, probes, sky, water, works(box), hazards(rec), heat, flood, fauna, down, wind, banners, views(), checks(add), negatives(add)
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
// THE LIGHT: dense warm air (1.23-1.35 atm) in the trough between airless walls; a humid haze up the gap
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc4ccd0);scene.fog=new THREE.FogExp2(HAZE.getHex(),.000045);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,90000);
const HEMI=new THREE.HemisphereLight(0xbccbe0,0x7a705a,.86);scene.add(HEMI);
const SUN_POS=[900,1300,600];   /* the sun from the south-east, over the east wall */
const sun=new THREE.DirectionalLight(0xfff0dc,1.35);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xdcd8cc,.2);fill.position.set(-300,-100,-1000);scene.add(fill);
const TERR={R:3400};
// the model's grid past the map (OG_FAR, the station's 44f: 2 km cells, bilinear)
const farModel=(x,z)=>{const G=OG_FAR,n=G.h.length,u=clamp(x/G.cell+G.r,0,n-1.001),v=clamp(z/G.cell+G.r,0,n-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,H=G.h;
 return H[j][i]*(1-fu)*(1-fv)+H[j][i+1]*fu*(1-fv)+H[j+1][i]*(1-fu)*fv+H[j+1][i+1]*fu*fv;};
// ---------------------------------------------------------------- STAGEKIT: the field cache (station 1's, generalised) and the view helpers
const STAGEKIT={
 // the fields on an N x N lattice over S metres (18 m cells at N 400): fieldsAt(x, z, h, slope) -> {name: 0..1}; every name in `names`
 // a bilinear lookup; the station's FIELD carries them plus the zero fields the kin's builders and the core's scatter may ask for
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
  ['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','dry','works','road','bank','bankX','bar','floor','swale']
   .forEach(n=>{if(!FIELD[n])FIELD[n]=()=>0;});
  return{FC,FIELD};},
 gh:(x,z,dy)=>terrainH(x,z)+(dy==null?0:dy),
 look(cx,cz,dyc,tx,tz,dyt){const g=STAGEKIT.gh;return[cx,g(cx,cz,dyc),cz,tx,g(tx,tz,dyt),tz];},
 // the placed tree of a key nearest a point, or a stand-in at the point
 nearTree(key,x,z){let b=null,bd=1e18;for(const T of OGATE.TREES||[]){if(T.key!==key)continue;const d=(T.x-x)**2+(T.z-z)**2;if(d<bd){bd=d;b=T;}}return b||{x,z,y:terrainH(x,z),H:12,crownR:5,stand:true};},
 // a camera d metres from a tree at azimuth az, dy over the ground (never under the tree's foot), looking at ty over its foot
 atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(STAGEKIT.gh(cx,cz,dy),T.y+dy),cz,T.x,T.y+(ty==null?T.H*.45:ty),T.z];},
 // a polyline's nearest distance (an index of its points, then the exact segment): for channels, scarps and tracks
 line(P,cell){const S=KSPACE.create({cell:cell==null?60:cell}),q=[];P.forEach((p,k)=>S.insert({k},p[0],p[1],0));
  return{P,near(x,z,r){S.query(x,z,r,q);let b=1e18,k=-1,t=0;for(const o of q){for(const j of [o.k-1,o.k]){if(j<0||j>=P.length-1)continue;const a=P[j],c=P[j+1],dx=c[0]-a[0],dz=c[1]-a[1],L2=dx*dx+dz*dz||1e-9,
     u=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1),ex=a[0]+dx*u-x,ez=a[1]+dz*u-z,d=ex*ex+ez*ez;if(d<b){b=d;k=j;t=u;}}}return{k,t,d:k<0?1e9:Math.sqrt(b)};}};},
};
