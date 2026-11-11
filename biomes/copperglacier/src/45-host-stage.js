// ================================================================= HOST — stage (every station: the land from its SITE, 44z-host-site.js)
// The ideal-type host for COPPER GLACIER: renderer, lights, haze, the land with terrainH() and waterH(), the fields the kit reads, the tick list, the
// error panel. One stage for every station: a station's 44z gives its numbers (the bed's profile up the ice, the glacier, the walls, the nunataks, the
// tarn, the caves, the streams) and this fragment makes the land from them. The kit's fragments read none of it except through BIO.host.
// THE LAND, in the glacier's frame (u up the ice, p across it, a = p less the ice's centre line; core/terrain/44g-core-glacier.js, KGLACIER):
//   THE BED     the profile PROF(u) (its gradient by stretch, integrated once), noise in two scales, the walls rising either side past the floor's
//               margin, the nunatak ridges (KRELIEF.range, joined), then KGLACIER's trough, moraines and pond basin (G.bed), and the frost's
//               patterned ground on the flats (KFROST)
//   THE ICE     KGLACIER.iceAt, thinned to nothing where a ridge stands through it, cleared inside an ice cave's shell
//   THE WATER   the tarn (a station's own lake: every ground under its level west of the snout), the pond behind the terminal moraine (KGLACIER's
//               basin), the streams graded so they never climb (the owner's rule) and cut into the ground
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
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
// THE LIGHT: high, clear and cold, the snow and ice throwing it back up; the sky (89) drives these from its colour script
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xccd6e0);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00011);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xb8cce4,0x9aa2aa,.82));
const SUN_POS=[-900,1000,600];
const sun=new THREE.DirectionalLight(0xfff2e0,1.25);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc8d4e4,.2);fill.position.set(800,350,-900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:2600};
// THE GLACIER (core/terrain KGLACIER): the frame, the ice, the trough, the moraines, the pond basin, from the site's numbers
const GS=SITE.glacier;
const G=KGLACIER.create({up:SITE.up,centre:GS.centre,W:GS.W,T:GS.T,snout:GS.snout,edge:GS.edge,trough:GS.trough,lateral:GS.lateral,terminal:GS.terminal,lake:GS.lake,
 seed:KRAND.child(4410,'copperglacier/'+SITE.key)});
const uOf=G.uOf,pOf=G.pOf,upAt=G.at,TERM=G.TERM;
// THE BED'S PROFILE up the ice: its gradient by stretch (eased over 120 m at each change), integrated once over 30 km, then lifted so PROF(at) = h
const PROF=(function(){const P=SITE.prof,Gr=P.grads,u0=-15000,du=10,n=3001,t=new Float32Array(n);
 const S=u=>{let g=Gr[0][1];for(let i=1;i<Gr.length;i++)g+=(Gr[i][1]-Gr[i-1][1])*smooth(Gr[i][0]-60,Gr[i][0]+60,u);return g;};
 let h=0;for(let i=0;i<n;i++){t[i]=h;h+=S(u0+i*du)*du;}
 const f=u=>{const k=clamp((u-u0)/du,0,n-1.001),i=Math.floor(k);return mix(t[i],t[i+1],k-i);};const off=P.h-f(P.at);return u=>f(u)+off;})();
// THE WALLS: past the floor's margin either side of the ice they rise (north and south of the trough, or the aretes of a hanging glacier's valley)
function wallAt(u,a){const Wl=SITE.walls;if(!Wl)return 0;const d=Math.abs(a)-(G.W(u)+Wl.margin);if(d<=0)return 0;const S=a>0?Wl.pos:Wl.neg,t=d/S.span;
 const tt=t<1?Math.pow(t,1.35):1+(t-1)*.4;   /* past one span the wall climbs slower (the far field reads it to 14 km) */
 return S.H*tt*(1+.14*Math.sin(t*TAU*1.6+u*.0021))*(Wl.fade?smooth(Wl.fade[0],Wl.fade[1],u):1);}
// THE NUNATAKS (KRELIEF.range, joined where they meet)
const RIDGES=(SITE.ridges||[]).map(r=>KRELIEF.range({a:r.a,b:r.b,h:r.h,w:r.w,crest:.3,toe:.18,serr:.1,seed:r.seed}));
const ridgeAt=(x,z)=>RIDGES.length?KRELIEF.join(RIDGES.map(f=>f(x,z))):0;
// THE ICE CAVES: shells at the ice's margin (u, aw: a share of the half-width) or at a point; the mouth faces out of the ice and down it
const CAVES=(SITE.caves||[]).map((C,i)=>{let x=C.x,z=C.z,face=C.face;
 if(C.u!=null){const c=upAt(C.u,GS.centre(C.u)+C.aw*G.W(C.u));x=c[0];z=c[1];
  if(face==null){const sg=Math.sign(C.aw),ox=-SITE.up[0]*.94+sg*SITE.up[1]*.34,oz=-SITE.up[1]*.94-sg*SITE.up[0]*.34;face=Math.atan2(oz,ox);}}   /* down the glacier, turned a little out of the ice (a portal faces the outwash, not the moraine wall) */
 else if(face==null)face=-Math.PI/2;   /* the wind's moat opens north, down the plateau */
 return{x,z,R:C.R,H:C.R*.82,face,mouth:.2,name:C.name,u:C.u,aw:C.aw};});   /* the mouth +-36 deg at the foot: a cave, not a canopy */
// THE FROST (KFROST): sorted circles and polygons on the flat moraine ground and the outwash (the `flat` field below; KFROST's where reads the bed's slope)
const FROST=KFROST.create({seed:KRAND.child(4411,'copperglacier/frost/'+SITE.key),ground:(x,z)=>PROF(uOf(x,z)),
 polygons:{cell:3.2,trough:.22,rim:.06,width:.14,where:(x,z)=>{const u=uOf(x,z),a=pOf(x,z)-GS.centre(u),aa=Math.abs(a)-G.W(u);return smooth(30,90,aa)*smooth(SITE.coral[1]+200,SITE.coral[1]-200,PROF(u));}}});
function landH(x,z){const u=uOf(x,z),p=pOf(x,z),a=p-GS.centre(u);
 let h=PROF(u)+26*(fbm(x*.0008,z*.0008,91,3)-.5)+7*(fbm(x*.004,z*.004,92,2)-.5)+wallAt(u,a)+ridgeAt(x,z);
 h=G.bed(x,z,h)+FROST.h(x,z);
 if(GS.pondDeep){const u2=uOf(x,z),p2=pOf(x,z);h-=GS.pondDeep*G.lakeK(u2,p2,p2-GS.centre(u2));}   /* a pond on a slope: KGLACIER's 9 m basin and the site's more */
 for(const C of CAVES){const d=Math.hypot(x-C.x,z-C.z);if(d<C.R*2.6&&C.floor!=null)h=mix(h,C.floor,smooth(C.R*2.5,C.R*1.7,d));}   /* a pad levelled out past the shell, wider than a ground cell (12 m), so the drawn ground lies flat round the cave */
 return h;}
CAVES.forEach(C=>{C.floor=null;C.floor=landH(C.x,C.z);});
// the ice: KGLACIER's, gone where a nunatak stands through it, cleared inside a cave
function iceAt(x,z){let t=G.iceAt(x,z);if(t<=0)return 0;if(RIDGES.length){const r=ridgeAt(x,z);if(r>0)t*=1-smooth(t*.35,t*1.05,r);}
 for(const C of CAVES){const dx=x-C.x,dz=z-C.z,al=dx*Math.cos(C.face)+dz*Math.sin(C.face),pp=-dx*Math.sin(C.face)+dz*Math.cos(C.face),d=Math.hypot(al>0?pp*.5:pp,al>0?al*.3:al);   /* the moat: cleared farther out and wider on the mouth's side (wider than the ground mesh's 12 m cells), so the mouth opens on air */
  if(d<C.R*1.4)t*=smooth(C.R*.9,C.R*1.3,d);}return t;}
function terrainH1(x,z){return landH(x,z)+iceAt(x,z);}   /* a cave meets its ground by its own apron (86: KGLACIER.drawer's apron), not by the ground mesh, whose 12 m cells are as wide as a cave */
// THE TARN (a station's own lake, west of the snout) and the POND (KGLACIER's basin behind the terminal moraine)
const TARN=SITE.tarn?Object.assign({},SITE.tarn):null;
const POND=GS.lake&&GS.terminal?(function(){const u=G.termU(TERM.breach),c=upAt(u+6,TERM.breach);return{level:terrainH1(c[0],c[1])-.6,name:'The pond (behind the terminal moraine)'};})():null;
// THE STREAMS: from a cave's mouth along the ice's margin, or from the pond's breach, down the bed; graded (each step the lower of the ground there less
// 0.8 m and the last surface less a fall), ending where they reach the tarn
const STREAMS=(SITE.streams||[]).map(S=>{const P=[],du=8;let u,side=0,p0=0;
 if(S.from==='breach'){u=G.termU(TERM.breach)+10;p0=TERM.breach;}else{const C=CAVES[+S.from.slice(4)];u=C.u;side=Math.sign(C.aw);}
 let prev=1e9;for(;u>-TERR.R*1.15;u-=du){const p=side?GS.centre(u)+side*(G.W(Math.max(u,GS.snout))+C_OFF(u)):p0,c=upAt(u,p),g=terrainH1(c[0],c[1]);
  const y=Math.min(g-.8,prev-du*.006);if(TARN&&y<TARN.level+.15){P.push([c[0],c[1],TARN.level]);break;}P.push([c[0],c[1],y]);prev=y;}
 return{name:S.name,hw:S.hw,plume:!!S.plume,pts:P};});
function C_OFF(u){return 14+6*Math.sin(u*.01);}   /* a margin stream's line: a little out from the ice's edge, wandering */
// where (x,z) lies against the streams: bucketed segments (64 m cells) so a lookup reads a handful
const SBK=(function(){const B=new Map(),cs=64,k=(i,j)=>i*65536+j;STREAMS.forEach((S,si)=>{for(let i=0;i+1<S.pts.length;i++){const a=S.pts[i],b=S.pts[i+1];
 const i0=Math.floor((Math.min(a[0],b[0])-30)/cs),i1=Math.floor((Math.max(a[0],b[0])+30)/cs),j0=Math.floor((Math.min(a[1],b[1])-30)/cs),j1=Math.floor((Math.max(a[1],b[1])+30)/cs);
 for(let ii=i0;ii<=i1;ii++)for(let jj=j0;jj<=j1;jj++){const kk=k(ii,jj);if(!B.has(kk))B.set(kk,[]);B.get(kk).push([si,i]);}}});
 return{at(x,z){const L=B.get(k(Math.floor(x/cs),Math.floor(z/cs)));let best={d:1e9,y:0,hw:1,si:-1};if(!L)return best;
  for(const [si,i] of L){const S=STREAMS[si],a=S.pts[i],b=S.pts[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1),
   d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)-S.hw;if(d<best.d)best={d,y:mix(a[2],b[2],t),hw:S.hw,si};}return best;}};})();
function streamCut(x,z,h){if(!STREAMS.length)return h;const s=SBK.at(x,z);if(s.d>30)return h;
 const bed=s.d<0?s.y-.35-.6*smooth(0,-.7*s.hw,s.d):s.y-.35+.6*smooth(0,6,s.d)+.12*Math.max(0,s.d-6);return Math.min(h,bed);}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){return streamCut(x,z,terrainH1(x,z));}
const pondAt=(x,z)=>POND?G.lakeAt(x,z):0;
function waterH(x,z){
 if(TARN&&uOf(x,z)<GS.snout+400&&iceAt(x,z)<.3&&terrainH(x,z)<TARN.level+.2)return TARN.level;
 if(POND&&pondAt(x,z)>.2&&terrainH(x,z)<POND.level+.2)return POND.level;
 if(STREAMS.length){const s=SBK.at(x,z);if(s.d<0)return s.y;}
 return -1e9;}

// ---------------------------------------------------------------- the copper (kits/resources' data, CG_RES: 44r, written at build time)
// The prospectivity of the nearest data cell (4 km cells: nothing interpolated, as the node field reads it), and each node's outcrop. The copper GROUND
// (what the flora and the ground's malachite read) is the cell's copper where the rock is bare on a skarn station, a disc round each copper node, and
// a faint background on the moraine (the boulders carried off the copper ground).
const CU=(function(){const cells=CG_RES.cells||[];const near=(x,z)=>{let b=null,bd=1e18;for(const c of cells){const d=(c.x-x)*(c.x-x)+(c.z-z)*(c.z-z);if(d<bd){bd=d;b=c;}}return b;};
 const nodes=(CG_RES.nodes||[]).filter(n=>n.kind==='copper'),GR={low:.55,medium:.8,high:1};
 return{cell:near,p:(x,z,f)=>{const c=near(x,z);return c?(c[f||'copper']|0)/255:0;},nodes,
  node:(x,z)=>{let m=0;for(const n of nodes)m=Math.max(m,GR[n.grade]*smooth(140,30,Math.hypot(x-n.x,z-n.z)));return m;}};})();

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The world's (biomes/WORLD.md) and the kit's own: ice (0..1 on the glacier), debris (the dirty snout and the margins' ice), moraine, snow (how much
// lies: the firn, the old snow, the lee), algae (the summer firn's snow algae), copper (the copper ground), flat (the frost's patterned flats), cave,
// tarn (the open water), shore (the wet margin: the streams and the water's edge)
function fieldsAt(x,z,h,slope){const u=uOf(x,z),p=pOf(x,z),a=p-GS.centre(u),it=iceAt(x,z),ice=smooth(.3,3,it),Wu=G.W(u);
 const mor=smooth(3,10,G.moraine(u,p,a)),ridge=ridgeAt(x,z),w=waterH(x,z),under=w>-1e8&&h<w+.2?1:0,s=STREAMS.length?SBK.at(x,z):{d:1e9};
 let cave=0;for(const C of CAVES)cave=Math.max(cave,smooth(C.R*1.05,C.R*.85,Math.hypot(x-C.x,z-C.z)));
 const steep=smooth(.55,.85,slope),rock=clamp(Math.max(steep,mor*.45,(1-ice)*smooth(20,90,ridge)*.95,(1-ice)*smooth(.38,.6,slope)*smooth(200,700,wallAt(u,a))),0,1);
 const n=fbm(x*.004,z*.004,95,2),n2=fbm(x*.02,z*.02,96,2);
 const sl=SITE.snowLine,snowH=smooth(sl[0],sl[1],h);
 const snow=clamp(Math.max(ice*smooth(sl[0]-150,sl[1],h)*(.55+.45*n),(1-ice)*(snowH*(.9-.55*steep)+.25*(n-.5)))*(1-under)*(1-cave),0,1);   /* bare ice below the firn line */
 const debris=ice*clamp(smooth(GS.snout+500,GS.snout+40,u)*.8+smooth(.82,.98,Math.abs(a)/Wu)*.7,0,1)*(1-snowH*.8);
 const algae=SITE.algae*snow*smooth(.4,.7,n2)*(1-steep)*(1-snowH*.35);
 const cu=CU.p(x,z),copper=clamp(Math.max(SITE.skarn?cu*smooth(.15,.55,rock+.25*n2)*(1-ice):0,CU.node(x,z)*(1-ice),cu*.35*mor),0,1);
 const shore=Math.max(smooth(30,2,s.d),w>-1e8&&!under?smooth(1.5,0,h-w):0);
 const flat=(1-ice)*(1-rock)*(1-under)*smooth(.25,.06,slope)*smooth(sl[1]+200,sl[0],h);
 const cold=clamp((h-SITE.coral[0])/Math.max(300,SITE.snowLine[1]-SITE.coral[0]),0,1);
 const wet=clamp(.35+.5*shore+.25*flat*(n2-.3)-.3*rock-.2*steep+.15*(SITE.rain>1500?1:0),0,1);
 return{wet,flow:smooth(10,-1,s.d),upland:clamp((h-PROF(GS.snout))/900,0,1),canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold,geo:0,
  barren:Math.max(ice,under,cave),fog:0,mist:0,ice,debris,moraine:mor,snow,algae,copper,flat,cave,tarn:under,shore};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','ice','debris','moraine','snow','algae','copper','flat','cave','tarn','shore'];
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
const OBSTACLES=CAVES.map(C=>({x:C.x,z:C.z,r:C.R*1.15}));
// the LOD spine: down the ice's centre line, its margins, the snout, the caves, the streams, the nodes
const SPINE=[];for(let u=-2300;u<=2300;u+=500){SPINE.push(upAt(u,GS.centre(u)));if(SITE.walls){SPINE.push(upAt(u,GS.centre(u)+G.W(u)+220),upAt(u,GS.centre(u)-G.W(u)-220));}}
CAVES.forEach(C=>SPINE.push([C.x,C.z]));SPINE.push(upAt(GS.snout-150,GS.centre(GS.snout)));STREAMS.forEach(S=>{for(let i=0;i<S.pts.length;i+=40)SPINE.push([S.pts[i][0],S.pts[i][1]]);});
CU.nodes.forEach(n=>{if(Math.abs(n.x)<TERR.R&&Math.abs(n.z)<TERR.R)SPINE.push([n.x,n.z]);});
if(!SITE.walls)for(let z=-2000;z<=2000;z+=1000)for(let x=-2000;x<=2000;x+=1000)SPINE.push([x,z]);
// the mask: nothing roots on the ice, in the water, in a cave
function rootMask(x,z){if(iceAt(x,z)>.3)return 0;for(const C of CAVES)if(Math.hypot(x-C.x,z-C.z)<C.R*1.7)return 0;   /* the cave and its apron of ice */
 if(STREAMS.length&&SBK.at(x,z).d<2.8)return 0;   /* the stream's ribbon is drawn 2.4 m out under its banks (89w): nothing roots in it */
 if(window._waterShore){const s=window._waterShore(x,z);if(s===s&&s<1.2)return 0;}   /* the water the eye sees (89z: its shore grid laps a little over the land) */
 const w=waterH(x,z);if(w>-1e8){const d=terrainH(x,z)-w;if(d<.7)return d<.15?0:(d-.15)/.55;}return 1;}
BIO.init({tags:'copperglacier',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:23,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:560,far:2400,floor:[180,440]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1]}});
BIO.setSun(SUN_POS);
