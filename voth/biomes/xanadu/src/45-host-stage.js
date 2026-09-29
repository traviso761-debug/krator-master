// ================================================================= HOST — stage
// The ideal-type host for XANADU, the Vale in the East Rift Highlands: an
// enclosed mountain lake, longer east-west than north-south, and the vale on
// its south shore where the sacred river comes down from a chasm in the
// mountains. Renderer, lights, fog, the terrain with terrainH(), the five
// climate fields the biome asks for (wet / salt / upland / flow / mist), the
// lake, the river as its own water ribbon, the painted ground, the tick list,
// the error panel. A real world replaces this whole section with its own; the
// biome fragments never read anything from it except through BIO.host.
//
// THE MAP is the Vale of Xanadu scale model, read off the map image as a grid
// of classes (8 px cells, 5.5 m a pixel, 44 m a cell; x east, z SOUTH, origin
// at the image's centre):
//   L  the lake (north; it runs on off the map to the north, east and west)
//   S  the shore plain
//   F  the green slopes and the vale floor (terrace country on the map)
//   B  the brown uplands: the promontory the palace will stand on, the ridge
//      and the eastern plateau round the vale (the Mediterranean ground)
//   G  the grey cliffs under the mountains
//   W  the high mountains to the south (and, as thin lines on the map, the
//      escarpments between the slopes and the uplands: cleaned out below)
// The sacred river is traced off the map's blue line: it rises at a chasm at
// the cliff foot in the south-west, runs east along the foot of the cliffs in a
// gorge, turns north through the vale and meets the lake at the dockyard. The
// lake drains over a cataract off the map to the south-east (painted on the sky).
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
// THE LAKE COLOUR. One hue drives the water and the biome's accents (the
// shallows, the mosses' tinge, the bloom complement). A glacial jade here.
var XANADU_LAKE={hue:0.49};
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc4cfc8);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00017);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,15000);
scene.add(new THREE.HemisphereLight(0xcad6d0,0x4a4638,.64));
const sun=new THREE.DirectionalLight(0xfff0d8,1.42);sun.position.set(-1200,950,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb4cfd2,.30);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the map
const MAPG={MS:5.5,CS:8,NX:145,NY:127,CX:580,CY:506,
 rle:["L145","L145","L145","L145","L145","L145","L145","L145","S1L144","S4L141","S6L139","S7L138","S9L136","S11L134","S13L132","S15L130","S17L128","S18L127","S19L126","S20L125","S21L124","S23L53S3L66","S34L39S10L62","S36L35S6F3S4L61","S37L34S2F7S4L61","S38L32S3F5S5L62","S38L32S3F3S5L64","S39L32S9L65","S40L26S1L5S1L2S3L67","S41L24S3L77","S42L18S9L76","F1S44L14S10L76","F3S46L9S10L77","F4S64L77","F5S63L77","F13S56L76","F16S34F3S16L76","F18S30F10S12L75","F20S27F13S10L75","F22S25F15S8L75","F24S16F23S8L74","F28S7F30S6L74","F52B3F11S6L73","F49B8F10S6L72","F46W1B12F9S6L71","F45W1B14F9S5L71","F44W2B15F8S6L70","F43W2B16F9S6L69","F42W3B16F9S7L68","F42W3B16F9S8L67","F41W3B17F10S8L66","F40W3B18F10S10L59S5","F40W2B19F11S10L56S7","F39W2B20F11S11L54S8","F37W3B20F12S21L29S3L10S10","F37W2B21F12S23L25S25","F36W3B21F12S25L22S26","F36W3B20F13S28L17S28","F36W3B19F14S31L12S30","F36W3B16F17S37L5S31","F36W2B16F18S73","F35W3B15F19S73","F35W3B13F22S72","F34W4B13F23S20F7S44","F34W2B14F24S19F14S38","F6W4F22W3B15F25S17F18S5F5S25","W1F3W11F14W5B16F25S13F33S24","W18F10W4B18F25S13F35S22","W10B6W6F5W3B20F25S12F38S20","B20W3F3W3B21F25S11F18B4F18S19","B21W7B22F25S11F18B6F20S15","B21W6B23F25S9F19B7W1F21S13","B23W3B23F26S8F19B9W1F21S3F1S8","G1B48F26S8F17B5G2B4W2F25S7","G3B46F26S8F11B9G5B3W3F25S6","G5B44F26S8F6B1F3B10G6B3W3F26S4","G7B29G3B10F26S8F6B14G7B3W3F27S2","G10B26G4B10F25S7F6B16G6B5W2F28","G14B21G4B12F25S6F6B16G6B5W2F28","G18B13G8B12F25S7F5B16G5B7W1F28","G19B11G10B12F23S7F6B16G5B6W2F28","G19B9G13B12F21S7F8B16G4B6W2F28","G18B10G13B13F20S6F9B17G3B6W2F28","G19B9G13B13F21S3F16B11G4B7W2F27","G19B9G13B13F41B11G2B8W2F27","G19B8G14B13F42B21W2F26","G19B8G14B13F45B18W2F26","G20B6G15B12F47B18W2F25","G20B5G16B12F48B17W2F25","G21B4G16B12F48B17W2F25","W2G19B4G17B12F47B17W2F25","W3G19B2G18B13F45B19W2F24","W4G38B13F45B19W3F23","W4G39B13F44B20W2F23","W5G4W1G35B12F43B20W3F22","W12G18W3G13B11F42B22W2F22","W13G16W5G14B10F40B23W2F22","W14G14W6G15B10F37B26W2F21","W15G11W8G16B10F33B30W3F19","W16G9W9G17B9F31B32W5F17","W18G4W11G19B9F27B38W3F16","W33G19B10F25B41W2F15","W33G20B10F23B43W2F14","W33G22B9F20B45W3F13","W33G22B10F17B48W2F13","W34G22B10F14B50W3F12","W34G17B15F11B11G6B37W3F11","W35G8B43G10B2G2B32W3F10","W35G7B43G18B7G4B19W6F6","W35G7B42G20B4G8B19W5F5","W35G8B5G1B17G3B7G3B4G34B21W4F3","W35G16B1G2B10G7B3G44B23W4","W35G84B24W2","W36G84B25","W39G53W5G9W3G12B4G2B18","W40G46W14G3W9G17B16","W44G41W29G16B15","W46G37W35G13B14","W48G34W40G10B13","W49G32W43G15B6","W51G7W2G20W48G12B5","W62G16W51G12B4","W65G4W62G12B2","W138G6B1","W138G7","W140G5","W141G4"]};
const TERR={R:3200,X0:-3500,X1:3500,Z0:-3300,Z1:3300};
// cell (i,j) <-> world
const cellX=i=>(i*MAPG.CS+MAPG.CS/2-MAPG.CX)*MAPG.MS, cellZ=j=>(j*MAPG.CS+MAPG.CS/2-MAPG.CY)*MAPG.MS;
const CELLM=MAPG.CS*MAPG.MS;
// px on the map image -> world
const px2w=(u,v)=>[(u-MAPG.CX)*MAPG.MS,(v-MAPG.CY)*MAPG.MS];
const MAP=(function(){const NX=MAPG.NX,NY=MAPG.NY,N=NX*NY;
 const cls=new Array(N);MAPG.rle.forEach((row,j)=>{let i=0;row.replace(/([A-Z])(\d+)/g,(m,c,n)=>{for(let k=0;k<+n;k++)cls[j*NX+(i++)]=c;return'';});});
 const I=(i,j)=>clamp(j,0,NY-1)*NX+clamp(i,0,NX-1);
 // the thin light-grey lines are escarpments, not mountains: a W cell with
 // few W neighbours takes its neighbours' class
 const cnt=(i,j,c,r)=>{let n=0;for(let b=-r;b<=r;b++)for(let a=-r;a<=r;a++)if(cls[I(i+a,j+b)]===c)n++;return n;};
 const thin=[];for(let j=0;j<NY;j++)for(let i=0;i<NX;i++)if(cls[I(i,j)]==='W'&&cnt(i,j,'W',4)<46)thin.push(I(i,j));
 thin.forEach(k=>cls[k]='?');
 for(let it=0;it<12;it++){let left=0;const nx=cls.slice();
  for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const k=I(i,j);if(cls[k]!=='?')continue;const c={};
   for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const v=cls[I(i+a,j+b)];if(v!=='?'&&v!=='W')c[v]=(c[v]||0)+1;}
   let best='?',bn=0;for(const v in c)if(c[v]>bn){bn=c[v];best=v;}nx[k]=best;if(best==='?')left++;}
  for(let k=0;k<N;k++)cls[k]=nx[k];if(!left)break;}
 for(let k=0;k<N;k++)if(cls[k]==='?')cls[k]='F';
 // chamfer distance (metres) from the cells where pred() is true
 function dist(pred){const D=new Float32Array(N);for(let k=0;k<N;k++)D[k]=pred(cls[k])?0:1e9;const a=CELLM,b=CELLM*1.4142;
  for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const k=j*NX+i;let d=D[k];if(i>0)d=Math.min(d,D[k-1]+a);if(j>0){d=Math.min(d,D[k-NX]+a);if(i>0)d=Math.min(d,D[k-NX-1]+b);if(i<NX-1)d=Math.min(d,D[k-NX+1]+b);}D[k]=d;}
  for(let j=NY-1;j>=0;j--)for(let i=NX-1;i>=0;i--){const k=j*NX+i;let d=D[k];if(i<NX-1)d=Math.min(d,D[k+1]+a);if(j<NY-1){d=Math.min(d,D[k+NX]+a);if(i<NX-1)d=Math.min(d,D[k+NX+1]+b);if(i>0)d=Math.min(d,D[k+NX-1]+b);}D[k]=d;}
  return D;}
 const dLand=dist(c=>c==='L'),dWater=dist(c=>c!=='L'),dLow=dist(c=>c!=='G'&&c!=='W'),dHi=dist(c=>c!=='W');
 // the island: land cells not joined to the land along the map's south edge
 const main=new Uint8Array(N),st=[];for(let i=0;i<NX;i++){const k=I(i,NY-1);if(cls[k]!=='L'){main[k]=1;st.push(k);}}
 while(st.length){const k=st.pop(),i=k%NX,j=(k/NX)|0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(o=>{const a=i+o[0],b=j+o[1];if(a<0||b<0||a>=NX||b>=NY)return;const q=b*NX+a;if(!main[q]&&cls[q]!=='L'){main[q]=1;st.push(q);}});}
 // the height, the relief and the upland value per cell
 const H=new Float32Array(N),UP=new Float32Array(N),INC=new Float32Array(N);
 for(let k=0;k<N;k++){const c=cls[k];
  INC[k]=c==='B'?58:c==='G'?118+.62*dLow[k]:c==='W'?250+.62*dLow[k]+.35*dHi[k]:0;
  if(c!=='L'&&!main[k])INC[k]=24;                                   // the island is a knoll
  INC[k]=Math.min(INC[k],980);
  UP[k]=c==='B'?.40:c==='G'?.72:c==='W'?1:c==='F'?.05:0;
  H[k]=c==='L'?-(1.6+Math.min(46,.05*dWater[k])):3+.058*dLand[k];}
 // soften the relief: two box passes ~ a gaussian of 60 m
 function blur(A,r,passes){const T=new Float32Array(N);for(let p=0;p<passes;p++){
  for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){let s=0,n=0;for(let a=-r;a<=r;a++){s+=A[I(i+a,j)];n++;}T[j*NX+i]=s/n;}
  for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){let s=0,n=0;for(let b=-r;b<=r;b++){s+=T[I(i,j+b)];n++;}A[j*NX+i]=s/n;}}}
 blur(INC,1,2);blur(UP,2,2);
 const HH=new Float32Array(N);for(let k=0;k<N;k++)HH[k]=H[k]+(cls[k]==='L'?0:INC[k]);
 // the lake's edge stays where the map draws it: land cells never drop under +1.5 before the detail
 blur(HH,1,1);for(let k=0;k<N;k++){if(cls[k]!=='L')HH[k]=Math.max(HH[k],1.5+.02*dLand[k]);else HH[k]=Math.min(HH[k],-1.2);}
 const SD=new Float32Array(N);for(let k=0;k<N;k++)SD[k]=cls[k]==='L'?-dWater[k]+CELLM*.5:dLand[k]-CELLM*.5;   // signed distance to the shore, m
 const at=(A,x,z)=>{const u=clamp((x/MAPG.MS+MAPG.CX-MAPG.CS/2)/MAPG.CS,0,NX-1.001),v=clamp((z/MAPG.MS+MAPG.CY-MAPG.CS/2)/MAPG.CS,0,NY-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*NX+i;
  return A[k]*(1-fu)*(1-fv)+A[k+1]*fu*(1-fv)+A[k+NX]*(1-fu)*fv+A[k+NX+1]*fu*fv;};
 const clsAt=(x,z)=>{const i=clamp(Math.round((x/MAPG.MS+MAPG.CX-MAPG.CS/2)/MAPG.CS),0,NX-1),j=clamp(Math.round((z/MAPG.MS+MAPG.CY-MAPG.CS/2)/MAPG.CS),0,NY-1);return cls[j*NX+i];};
 return{cls,HH,UP,SD,INC,at,clsAt,dLand};})();

// ---------------------------------------------------------------- the sacred river
// Traced off the map's blue line (image px), source to mouth. The bed descends
// monotonically; the upper reach runs in a gorge along the cliff foot (the
// chasm), with two cascades, then the valley reach meanders to the dockyard.
const RIVPX=[[334,872],[358,867],[384,865],[410,874],[440,879],[470,875],[500,867],[522,860],[537,845],[544,815],[546,782],[552,752],[570,724],[598,706],[620,680],[630,642],[629,602],[635,560],[649,518],[667,478],[683,449],[695,431],[706,414]];
const RIV=(function(){const P=RIVPX.map(p=>px2w(p[0],p[1]));
 // resample every ~20 m with a gentle meander added across the line
 const Q=[];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/20));for(let k=0;k<n;k++){const t=k/n;Q.push([mix(a[0],b[0],t),mix(a[1],b[1],t)]);}}
 Q.push(P[P.length-1]);
 const S=[0];for(let i=1;i<Q.length;i++)S.push(S[i-1]+Math.hypot(Q[i][0]-Q[i-1][0],Q[i][1]-Q[i-1][1]));const LEN=S[S.length-1];
 const M=Q.map((q,i)=>{const a=Q[Math.max(0,i-1)],b=Q[Math.min(Q.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l;
  const s=S[i],amp=mix(6,34,smooth(.35,.7,s/LEN))*smooth(0,.06,s/LEN)*smooth(1,.95,s/LEN),w=amp*(Math.sin(s*.0105+.7)+.45*Math.sin(s*.027+2.1));
  return[q[0]+nx*w,q[1]+nz*w];});
 const gorgeK=s=>smooth(.50,.36,s/LEN);          // 1 in the chasm (the east-west reach under the cliffs), 0 in the vale
 const halfW=s=>mix(7,17,smooth(.2,1,s/LEN));
 // the bed: the terrain along the line less the gorge depth, never climbing, ending under the lake
 const bed=[];let prev=1e9;
 for(let i=0;i<M.length;i++){const s=S[i]/LEN,g=gorgeK(S[i]);let b=MAPG_H(M[i][0],M[i][1])-mix(3.2,34,g);
  b=Math.min(b,prev-.02);
  [[.16,9],[.29,7]].forEach(c=>{if(s>c[0]&&s-(S[i]-S[Math.max(0,i-1)])/LEN<=c[0])b-=c[1];});   // two cascades in the chasm
  if(s>.985)b=Math.min(b,-1.6);bed.push(b);prev=b;}
 // bounding box for the early out
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;M.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);});
 return{P:M,S,LEN,bed,gorgeK,halfW,box:[x0-260,z0-260,x1+260,z1+260],src:M[0]};})();
function MAPG_H(x,z){return MAP.at(MAP.HH,x,z);}
// nearest point on the river: {d, s, i, f}
function riverNear(x,z){const B=RIV.box;if(x<B[0]||x>B[2]||z<B[1]||z>B[3])return null;
 let bd=1e18,bi=0,bf=0;const P=RIV.P;
 for(let i=0;i<P.length-1;i+=4){const a=P[i],b=P[Math.min(P.length-1,i+4)];const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);const px=a[0]+dx*t-x,pz=a[1]+dz*t-z,d2=px*px+pz*pz;if(d2<bd){bd=d2;bi=i;}}
 // refine inside the best coarse span
 bd=1e18;const i0=Math.max(0,bi-4),i1=Math.min(P.length-2,bi+8);
 for(let i=i0;i<=i1;i++){const a=P[i],b=P[i+1];const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);const px=a[0]+dx*t-x,pz=a[1]+dz*t-z,d2=px*px+pz*pz;if(d2<bd){bd=d2;bi=i;bf=t;}}
 const s=mix(RIV.S[bi],RIV.S[bi+1],bf);return{d:Math.sqrt(bd),s,i:bi,f:bf,bed:mix(RIV.bed[bi],RIV.bed[bi+1],bf)};}
// ---------------------------------------------------------------- terrain
function terrainH(x,z){
 let h=MAP.at(MAP.HH,x,z);const up=MAP.at(MAP.UP,x,z),sd=MAP.at(MAP.SD,x,z);
 const n1=fbm(x*.0021+3,z*.0021-1,17,3)-.5,n2=fbm(x*.0068-2,z*.0068+5,29,2)-.5;
 // the relief's own texture: gentle swells on the vale, knolls on the uplands, ridged rock on the cliffs and the mountains
 const rid=1-Math.abs(fbm(x*.0034+1,z*.0034+7,41,3)*2-1);
 h+=n1*mix(5,16,smooth(.02,.4,up))*smooth(-10,60,sd)+n2*mix(1.2,6,smooth(.1,.5,up))*smooth(0,30,sd)+rid*rid*mix(0,90,smooth(.55,1,up));
 // the shore: a beach shelf, broken by fbm so it is not the grid's line
 const sh=smooth(-60,40,sd+30*(fbm(x*.006,z*.006,53,2)-.5));
 if(sd<80)h=mix(Math.min(h,-.8-Math.max(0,-sd)*.04),h,sh);
 // the river
 const r=riverNear(x,z);
 if(r){const g=RIV.gorgeK(r.s),w=RIV.halfW(r.s),t=Math.max(0,r.d-w),
  kf=mix(.06,.35,g),tf=mix(26,3,g),kw=mix(.45,3.2,g);
  const bank=r.bed+(r.d<w?-.4*(1-r.d/w):0)+t*kf+Math.max(0,t-tf)*kw;
  if(bank<h)h=bank;}
 return h;}
function slopeAt(x,z){const h=terrainH(x,z),e=3;return Math.hypot(terrainH(x+e,z)-h,terrainH(x,z+e)-h)/e;}
// ---------------------------------------------------------------- the climate fields
// Oceanic and Mediterranean at once: wet round the lake, in the chasm and on
// the green flanks east and west (the terrace country), sunny and dry on the
// brown uplands and a little drier on the open vale floor; the mountains
// wring their own mist out of the air; the chasm and the fountain fill with spray.
const SRC=RIV.src;
function riverD(x,z){const r=riverNear(x,z);return r?r:{d:1e9,s:0};}
function mistK(x,z){const r=riverD(x,z),up=MAP.at(MAP.UP,x,z);
 const gorge=smooth(260,25,r.d)*RIV.gorgeK(r.s),fount=smooth(620,60,Math.hypot(x-SRC[0],z-SRC[1]));
 const band=smooth(.5,.72,up)*smooth(1.0,.8,up)*smooth(.45,.62,fbm(x*.0021+4,z*.0021-6,88,2));
 return clamp(Math.max(gorge*.95,fount,band*.8),0,1);}
const FIELD_RAW={
 wet:(x,z)=>{const up=MAP.at(MAP.UP,x,z),sd=MAP.at(MAP.SD,x,z),r=riverD(x,z);
  let w=mix(.60,.33,smooth(.14,.42,up));                              // the uplands are Mediterranean
  w=mix(w,.52,smooth(.62,.9,up));                                      // the mountains wring out their own rain
  w+=.14*smooth(700,1500,Math.abs(x-250))*smooth(.2,.05,up);           // the green flanks east and west: oceanic
  w=Math.max(w,.86*smooth(420,0,sd),.96*smooth(130,12,r.d),.9*mistK(x,z));
  w+=.10*(fbm(x*.0024-9,z*.0024+3,91,2)-.5);
  return clamp(w,0,1);},
 salt:(x,z)=>0,
 upland:(x,z)=>clamp(MAP.at(MAP.UP,x,z),0,1),
 flow:(x,z)=>{const r=riverD(x,z);return clamp(smooth(95,8,r.d),0,1);},
 mist:mistK};
// ---------------------------------------------------------------- the field cache (18 m lattice; terrainH stays exact)
const FC=(function(){const N=400,SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,a={wet:new Float32Array(N*N),up:new Float32Array(N*N),mist:new Float32Array(N*N),flow:new Float32Array(N*N),sd:new Float32Array(N*N),slope:new Float32Array(N*N),h:new Float32Array(N*N)};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=TERR.X0+i/(N-1)*SX,z=TERR.Z0+j/(N-1)*SZ,k=j*N+i;
  a.wet[k]=FIELD_RAW.wet(x,z);a.up[k]=FIELD_RAW.upland(x,z);a.mist[k]=FIELD_RAW.mist(x,z);a.flow[k]=FIELD_RAW.flow(x,z);a.sd[k]=MAP.at(MAP.SD,x,z);a.slope[k]=slopeAt(x,z);a.h[k]=terrainH(x,z);}
 const at=(arr,x,z)=>{const u=clamp((x-TERR.X0)/SX*(N-1),0,N-1.001),v=clamp((z-TERR.Z0)/SZ*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,a,at};})();
const FIELD={wet:(x,z)=>FC.at(FC.a.wet,x,z),salt:(x,z)=>0,upland:(x,z)=>FC.at(FC.a.up,x,z),flow:(x,z)=>FC.at(FC.a.flow,x,z),mist:(x,z)=>FC.at(FC.a.mist,x,z)};
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: the promontory, the river from the mouth up to the fountain, the vale, both green flanks
const SPINE=[[-980,-420],[-300,-560],[620,-380],[420,200],[-360,650],[-190,1560],[-720,2020],[-1330,2000],[-2100,-60],[1700,700]];
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,
 mask:(x,z)=>{const h=terrainH(x,z);if(h<.15)return 0;const w=h<.6?(h-.15)/.45:1;return w*smooth(1.45,.8,FC.at(FC.a.slope,x,z));},   // nothing rooted under water or on a cliff
 obstacles:OBSTACLES,ticks:tick,seed:23,
 origin:SPINE,center:[0,0],fields:FIELD,err:reportErr});
BIO.setSun([-1200,950,-600]);
