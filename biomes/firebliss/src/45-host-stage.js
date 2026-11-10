// ================================================================= HOST — stage (every station: the land from the scale model and the SITE, 44z-host-site.js)
// The ideal-type host for THE FIREBLISS RANGE: renderer, lights, haze, the land BEFORE the thermal ground (landH: the geyser kit lays its layout on
// it, 47), the error panel. One stage for every station: a station's 44z names its centre, its tarn, its river, its thermal layout, its hollows and
// its camp, and this fragment makes the land from them. The kits' fragments read none of it except through BIO.host.
// THE LAND (x east, z south, metres from the page's middle; the page a 5.2 km square, R 2600):
//   THE MODEL     the scale model 5.1's heights round the station (FB_MODEL, 44m: 2 km cells, written by build.py from the model's own data), read
//                 with a uniform cubic B-spline: smooth, and never past its cells' range (no ring round a crater's floor or a tarn's bed)
//   THE DETAIL    what 2 km cells cannot hold, by core/rand's noise: hummocks on the floor (a metre or two), more on the slopes, the shore's coves,
//                 a station's own bench (SITE.bench: a tuff or lava bench the river cuts)
//   THE HOLLOWS   dish hollows on the floor (SITE.hollows): where the gas pools on still nights (86)
//   THE RIVER     a Warra (SITE.river): its line graded so it never climbs (KRELIEF.river on this ground), its bed cut into the land with banks
//                 that open into a gorge where the station asks (SITE.river.gorge)
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
const dv=(x,d)=>x==null?d:x;   /* a numeric default (0 is a real value) */
const fbm=(x,z,seed,o)=>KRAND.fbm(x,.5,z,o==null?3:o,seed);   /* core/rand's noise ([0,1]) */
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
/* the draw-call and vertex set (BACKPORT.md section 1): welded items, one mesh a chunk, the cross-fade, chunks off screen dropped; ?index=0 ?lodmerge=0 ?lodfade=0 ?lodcull=0 */
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;document.body.appendChild(renderer.domElement);
// THE LIGHT: high mountain light, a little warm in the valleys' steam; the sky (89) drives these from its colour script
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd2d6d8);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00011);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xc4d0dc,0x8a867c,.82));
const SUN_POS=[-900,1000,600];
const sun=new THREE.DirectionalLight(0xfff0dc,1.25);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc8d4e4,.2);fill.position.set(800,350,-900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:2600};
// THE MODEL: the 5.1 grid round the station, a cubic B-spline over its cells (each cell's weight a smooth bump four cells wide)
const MODEL=(function(){const M=FB_MODEL,n=M.n,H=M.h,cell=M.cell;
 const at=(i,j)=>H[clamp(j,0,n-1)*n+clamp(i,0,n-1)];
 const B=t=>{const t2=t*t,t3=t2*t,s=1-t;return[s*s*s/6,(3*t3-6*t2+4)/6,(-3*t3+3*t2+3*t+1)/6,t3/6];};
 const h=(x,z)=>{const u=M.px+x/cell-M.i0,v=M.py+z/cell-M.j0,i=Math.floor(u),j=Math.floor(v),bu=B(u-i),bv=B(v-j);let s=0;
  for(let b=0;b<4;b++){let r=0;for(let a=0;a<4;a++)r+=bu[a]*at(i-1+a,j-1+b);s+=bv[b]*r;}return s;};
 /* the page's frame of a 5.1 px, and back */
 const page=(px,py)=>[(px-M.px)*cell,(py-M.py)*cell];
 return{h,page,clim:M.clim,vents:(M.vents||[]).map(v=>Object.assign({},v,{at:page(v.px[0],v.px[1])}))};})();
const SITE_ATM=+(1.6*Math.exp(-MODEL.h(0,0)/8000)).toFixed(2);   /* 1.6 atm x e^(-h/8 km): Copper Glacier's figures (PLAN.md section 2) */
// THE DETAIL: hummocks and coves on the gentle floor, rougher on the slopes; the station's bench (a tuff or lava step the river cuts)
const LEVEL=SITE.tarn?SITE.tarn.level:-1e9;
function detail(x,z,h0){const s=MODEL.h(x+40,z)-MODEL.h(x-40,z),t=MODEL.h(x,z+40)-MODEL.h(x,z-40),sl=Math.hypot(s,t)/80;
 const n1=fbm(x*.0022,z*.0022,301,3)-.5,n2=fbm(x*.011,z*.011,302,2)-.5,n3=fbm(x*.045,z*.045,303,2)-.5;
 const floor=SITE.tarn?smooth(LEVEL+90,LEVEL+20,h0):0;   /* the floor near the water: low hummocks, and the shore's coves (n1 moves the line in and out) */
 return n1*(floor*5+(1-floor)*(12+40*clamp(sl,0,.6)))+n2*(1.6+8*clamp(sl,0,.6))+n3*(.5+2.5*clamp(sl,0,.6));}
// THE HOLLOWS: dishes on the floor (the gas's traps, 86): depth d at the middle, a smooth rim at r
const HOLLOWS=(SITE.hollows||[]).map((o,i)=>Object.assign({i,name:o.name||'A hollow (the gas pools here on still nights)'},o));
function hollowAt(x,z){let k=0,d=0;for(const H of HOLLOWS){const q=Math.hypot(x-H.x,z-H.z)/H.r;if(q<1){const w=(1-q*q)*(1-q*q);if(w*H.d>d){d=w*H.d;k=w;}}}return d;}
function bench(x,z){return SITE.bench?SITE.bench(x,z,smooth):0;}
function land00(x,z){const h=MODEL.h(x,z);return h+detail(x,z,h)+bench(x,z)-hollowAt(x,z);}
// THE PADS: where a party pitches its camp the ground is levelled to its middle's height out to the pad's radius (they choose a flat bench; core/camp
// pitches on ground.ok, which asks for a gentle slope), eased back to the land over a third of it
const PADS=(SITE.camp&&SITE.camp.pad?[{x:SITE.camp.x,z:SITE.camp.z,r:SITE.camp.pad}]:[]).map(P=>Object.assign(P,{y:land00(P.x,P.z)}));
function land0(x,z){let h=land00(x,z);for(const P of PADS){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r*1.35)h=mix(h,P.y,smooth(P.r*1.35,P.r,d));}return h;}
// THE RIVER (a Warra): its line from the site (downstream), its water graded on land0 (KRELIEF.river: the surface never climbs), and from the tarn its
// first surface at the tarn's level. The bed is cut under it; past the bank, the gorge's walls (SITE.river.gorge: the wall's height above the water and
// its slope) or the plain bank's slope.
const RIVER=SITE.river?(function(){const R0=SITE.river,P=[],step=12;
 for(let i=0;i+1<R0.pts.length;i++){const a=R0.pts[i],b=R0.pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/step));
  for(let k=0;k<n;k++){const t=k/n,w=Math.sin(t*Math.PI)*(R0.wander||0)*(fbm(a[0]*.01+k*.07,a[1]*.01,311,1)-.5);
   const nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;P.push([a[0]+(b[0]-a[0])*t+nx*w,a[1]+(b[1]-a[1])*t+nz*w]);}}
 P.push(R0.pts[R0.pts.length-1]);
 const G=KRELIEF.river(P,land0,{depth:R0.depth==null?1.4:R0.depth,sample:8});
 /* the water: from the tarn's level where the river leaves it, falling at least `fall` a metre (never climbing) */
 let prev=R0.from==='tarn'?LEVEL-.25:G[0].y;const pts=G.map((g,i)=>{const y=Math.min(prev,g.y,i?prev-(dv(R0.fall,.0012))*Math.hypot(g.x-G[i-1].x,g.z-G[i-1].z):prev);prev=y;return[g.x,g.z,y];});
 return{name:R0.name,hw:R0.hw,pts,gorge:R0.gorge||null,from:R0.from};})():null;
// where (x,z) lies against the river: bucketed segments (64 m cells), so a lookup reads a handful
const RBK=(function(){const B=new Map(),cs=64,k=(i,j)=>i*65536+j;if(!RIVER)return{at:()=>({d:1e9,y:0,s:0})};
 const P=RIVER.pts,S=[0];for(let i=1;i<P.length;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const pad=RIVER.gorge?RIVER.gorge.reach+40:120;
 for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1];const i0=Math.floor((Math.min(a[0],b[0])-pad)/cs),i1=Math.floor((Math.max(a[0],b[0])+pad)/cs),j0=Math.floor((Math.min(a[1],b[1])-pad)/cs),j1=Math.floor((Math.max(a[1],b[1])+pad)/cs);
  for(let ii=i0;ii<=i1;ii++)for(let jj=j0;jj<=j1;jj++){const kk=k(ii,jj);if(!B.has(kk))B.set(kk,[]);B.get(kk).push(i);}}
 return{S,at(x,z){const L=B.get(k(Math.floor(x/cs),Math.floor(z/cs)));let best={d:1e9,y:0,s:0};if(!L)return best;
  for(const i of L){const a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1),d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)-RIVER.hw;
   if(d<best.d)best={d,y:mix(a[2],b[2],t),s:S[i]+t*Math.sqrt(l2)};}return best;}};})();
function riverCut(x,z,h){if(!RIVER)return h;const r=RBK.at(x,z);if(r.d>(RIVER.gorge?RIVER.gorge.reach:100))return h;
 const g=RIVER.gorge,bedY=r.y-(SITE.river.depth==null?1.4:SITE.river.depth);
 let c;if(r.d<0)c=bedY+.5*smooth(-RIVER.hw,0,r.d);   /* the bed: deepest mid-channel */
 else if(g){const wall=g.k?g.k(r.s):1;c=r.y+.3+Math.max(0,r.d-g.ledge)*g.slope*wall+(r.d<g.ledge?r.d*.06:g.ledge*.06);}   /* a ledge, then the wall */
 else c=r.y+.3+r.d*.18;   /* a plain bank */
 return Math.min(h,c);}
// THE LAND before the thermal ground (the geyser kit lays its layout on it: 47); the river cut into it
function landH(x,z){return riverCut(x,z,land0(x,z));}
