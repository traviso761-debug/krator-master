// ================================================================= HOST — stage
// the ground's detail and crack layers from the material library (materials.json groundDetail, groundCrack) when this page
// carries the kit's pack; otherwise the procedural ones, which are painted either way (the random stream is unchanged)
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('ebadlands',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
// The ideal-type host for the EASTERN BADLANDS: everything a world provides that a biome does not. Renderer,
// lights, haze, the terrain with terrainH(), the local water surface waterH() (a river that descends, sulphur
// pools and a tarn each at its own level), the climate fields the kit asks for, the water, the painted ground,
// the tick list, the error panel. A real world (openworld/little-demo) replaces this whole section with its own;
// the kit's fragments never read anything from it except through BIO.host.
//
// THE MAP (x east, z south, north is -z; origin at the map's centre, R 3400). One transect of the whole
// region compressed into 6.8 km, so every zone of the kit stands somewhere a camera can reach:
//   x < ESC(z)         THE BASIN, 150-230 m: painted badland mounds; in the north (z < -1200) the hot waste and,
//                      round VENTS (-2150,-2250), the sulphur flats and their pools; in the south the green badlands
//   x ~ ESC(z)         the ESCARPMENT, ~260 m of red cliff up to the plateau (it swings east in the north)
//   the plateau        470-540 m: sagebrush steppe and pinyon-juniper; THE CANYON cut 250 m into it (Zion)
//   z ~ zR(x)          THE RIVER, east to west: a V valley in the mountains, the canyon through the plateau,
//                      a braided wash across the basin
//   x > 1300           THE RANGE rising to the outer rim: ponderosa and aspen, spruce-fir, the treeline (~1350 m),
//                      tundra, and the ice and bare rock of the crest past 1650 m, where nothing grows
//   (2620,-1180)       the TARN in its cirque, in the spruce-fir
// The fields are the host's own (this is a showcase): cold from height (and the north is hotter), wet from the
// south and the range's orographic rain, plus the river; geo round the vents; barren on the crest.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd4c8b8);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00011);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xc4d2e6,0x6a5040,.6));
const sun=new THREE.DirectionalLight(0xfff2dc,1.55);sun.position.set(-1000,1150,-560);scene.add(sun);
const fill=new THREE.DirectionalLight(0xd8c0a8,.22);fill.position.set(900,300,900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:3400};
const VENTS={x:-2150,z:-2250,r:760};
const POOLS=[[-2230,-2310,46,2.4],[-2090,-2190,30,1.8],[-2350,-2150,24,1.6],[-1990,-2380,36,2.0],[-2280,-2470,22,1.4],[-2130,-2050,18,1.2]];   // x, z, r, depth
const TARN={x:2620,z:-1180,r:150};
// the escarpment's line: it wanders, and swings east in the north, so the hot basin is wider there
function ESC(z){return -820+520*smooth(-900,-2700,z)+120*Math.sin(z*.0016+1)+45*Math.sin(z*.0051);}
// the river's centreline and its channel: half-width of the floor, the outer edge of the walls in floor half-widths
function zR(x){return 260*Math.sin(x*.0006+.9)+110*Math.sin(x*.0017-.4)+40*Math.sin(x*.0052)+180;}
const BEDK=[[-3800,112],[-3400,120],[-1000,196],[-700,205],[1300,300],[2300,520],[3400,980],[3800,1150]];
function bedY(x){for(let i=0;i<BEDK.length-1;i++){const a=BEDK[i],b=BEDK[i+1];if(x<=b[0]){const t=clamp((x-a[0])/(b[0]-a[0]),0,1);return lerp(a[1],b[1],t*t*(3-2*t)*.5+t*.5);}}return BEDK[BEDK.length-1][1];}
function onPlateau(x,z){return smooth(ESC(z)-60,ESC(z)+60,x)*smooth(1600,1100,x);}
function Wc(x,z){const p=onPlateau(x,z);return mix(70+20*Math.sin(x*.004),95+30*Math.sin(x*.0021+1),p)*(1+.6*smooth(1400,2600,x));}
function uOut(x,z){const p=onPlateau(x,z);return mix(mix(1.7,4.2,smooth(1300,2400,x)),1.28,p);}
function wallK(u,uo){if(u>=uo)return 0;const b=1+.5*(uo-1);return .58*smooth(uo,b,u)+.42*smooth(b+.12*(uo-1),1,u);}
function basinH(x,z){return 150+60*smooth(-3400,-1000,x)+18*(fbm(x*.0007+3,z*.0007-1,17,3)-.5);}
function plateauH(x,z){return 470+70*smooth(-700,1400,x)+14*(fbm(x*.0009-5,z*.0009+2,19,3)-.5);}
function rangeX(x,z){return x+190*Math.sin(z*.0012+.4)+70*Math.sin(z*.0037);}
function rangeH(x,z){const xm=rangeX(x,z),m=smooth(950,3500,xm);if(m<=0)return 0;
 const ridge=1-Math.abs(2*fbm(x*.0011+7,z*.0011-3,23,3)-1);
 return 1480*Math.pow(m,1.15)+smooth(1700,2700,xm)*(ridge-.55)*300+35*(fbm(x*.006,z*.006,29,2)-.5)*m;}
// the badland mounds: rounded ridges and rills in the basin, banded by the strata shader
function badK(x,z){return smooth(.44,.58,fbm(x*.00095+9,z*.00095+4,61,2))*smooth(ESC(z)-40,ESC(z)-260,x)*(1-smooth(500,180,Math.hypot(x-VENTS.x,z-VENTS.z)-VENTS.r*.6));}
function moundH(x,z){const n=fbm(x*.0056,z*.0056,62,3),r=1-Math.abs(2*n-1),n2=fbm(x*.013+4,z*.013-2,64,2);return 68*Math.pow(r,1.5)+14*Math.pow(1-Math.abs(2*n2-1),2)*r+3*Math.sin(x*.11+7*fbm(x*.01,z*.01,63,2))*smooth(.3,.8,r);}
function poolD(x,z){let best=1e9,pi=-1;for(let i=0;i<POOLS.length;i++){const P=POOLS[i],dx=x-P[0],dz=z-P[1],a=Math.atan2(dz,dx),d=Math.hypot(dx,dz)*(1+.14*Math.sin(3*a+i)+.07*Math.sin(5*a+2*i))/P[2];if(d<best){best=d;pi=i;}}return[best,pi];}
function tarnD(x,z){const dx=x-TARN.x,dz=z-TARN.z,a=Math.atan2(dz,dx);return Math.hypot(dx,dz)*(1+.1*Math.sin(3*a+1)+.06*Math.sin(5*a))/TARN.r;}
// the land without the channel
function landH(x,z){const e=ESC(z),step=smooth(e-70,e+70,x);
 let h=mix(basinH(x,z),plateauH(x,z),step)+rangeH(x,z);
 // the escarpment's face: a band of steep red rock, benched
 h+=8*Math.sin(clamp((x-e+70)/140,0,1)*Math.PI*3)*smooth(0,.3,step)*smooth(1,.7,step);
 const bk=badK(x,z);if(bk>0)h+=bk*moundH(x,z);
 // the vents' flat: a shallow basin, crusted
 const dv=Math.hypot(x-VENTS.x,z-VENTS.z);if(dv<VENTS.r*1.3)h=mix(h,basinH(x,z)-18+3*(fbm(x*.01,z*.01,77,2)-.5),smooth(VENTS.r*1.25,VENTS.r*.7,dv));
 // the tarn's cirque: a bowl in the range
 const td=tarnD(x,z);if(td<4){const lev=TARN.base;h=mix(h,lev+Math.max(0,td-.85)*28+.0,smooth(3.6,1.6,td));if(td<1.05)h-=7*smooth(1.05,.3,td);}
 return h;}
TARN.base=(function(){const h0=TARN.x,z0=TARN.z;const e=ESC(z0);return mix(basinH(h0,z0),plateauH(h0,z0),smooth(e-70,e+70,h0))+rangeH(h0,z0)-25;})();
function floorC(x){return bedY(x);}
function WL(x){return floorC(x)-1.2;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){
 let h=landH(x,z);
 const dC=Math.abs(z-zR(x)),w=Wc(x,z),u=dC/w,uo=uOut(x,z),wall=wallK(u,uo);
 if(wall>0){const fl=floorC(x)+(fbm(x*.02,z*.02,88,2)-.5)*.8;h=mix(h,fl,wall)-2.6*smooth(16,5,dC)*smooth(.9,1,wall);}
 const pd=poolD(x,z);if(pd[0]<2.2){const P=POOLS[pd[1]];h-=P[3]*1.6*smooth(1.6,.5,pd[0]);}
 return h;}
// the canyon's wall as a field (1 the floor .. 0 beyond the walls)
function canyonAt(x,z){const dC=Math.abs(z-zR(x)),u=dC/Wc(x,z);return wallK(u,uOut(x,z));}
// the pools' and the tarn's levels
const POOLL=POOLS.map(P=>{let lo=1e9;for(let k=0;k<16;k++){const a=k/16*TAU;lo=Math.min(lo,landH(P[0]+Math.cos(a)*P[2]*1.15,P[1]+Math.sin(a)*P[2]*1.15));}return lo-.5;});
const TARNL=TARN.base+.8;
function waterH(x,z){const dC=Math.abs(z-zR(x));if(dC<Wc(x,z)*1.05)return WL(x);
 const pd=poolD(x,z);if(pd[0]<1.4)return POOLL[pd[1]];if(tarnD(x,z)<1.3)return TARNL;return -1e9;}

// ---------------------------------------------------------------- the climate fields (cached below; these are the definitions)
function fieldsAt(x,z,h,slope){const can=canyonAt(x,z),dC=Math.abs(z-zR(x)),wd=waterH(x,z);
 const pd=poolD(x,z)[0],td=tarnD(x,z),dv=Math.hypot(x-VENTS.x,z-VENTS.z);
 const geo=smooth(VENTS.r,VENTS.r*.55,dv*(1+.25*(fbm(x*.004,z*.004,131,2)-.5)))*smooth(.3,.5,fbm(x*.006+2,z*.006,132,2)+.25);
 const cold=clamp((h-140)/1480-.16*smooth(-600,-2800,z)+.05*(fbm(x*.002,z*.002,133,2)-.5),0,1);
 const near=Math.max(smooth(60,8,dC-Wc(x,z)*.2),smooth(2.2,1.05,td)*.9,smooth(2.4,1.1,pd)*.6);
 let wet=.08+.5*smooth(-1800,2400,z)+.22*smooth(500,1100,h)-.1*geo;
 wet=Math.max(wet,can*.92*(1-slope*.3),near*.95);
 const flow=Math.max(smooth(48,7,dC),smooth(2.1,1.05,td)*.8,smooth(2,1.05,pd)*.5)*(h-Math.max(wd,-1e8)<3.5?1:.4);
 const bad=badK(x,z),esc=smooth(.3,.62,slope)*smooth(ESC(z)+160,ESC(z)+20,x)*smooth(ESC(z)-200,ESC(z)-20,x);
 const barren=smooth(1620,1720,h);
 // the range is granite: its rock is crags in patches on its steepest ground, the forest takes the rest
 const crag=smooth(.56,.7,fbm(x*.005+5,z*.005-7,135,2)),hi=smooth(650,900,h),rock=clamp(Math.max(bad*.85,smooth(.32,.66,slope)*.92*(1-hi)+smooth(.9,1,slope)*crag*.9*hi,esc,barren*smooth(.6,.9,slope)),0,1);
 const plat=onPlateau(x,z),rim=can<.05&&dC<Wc(x,z)*uOut(x,z)*1.5?smooth(uOut(x,z)*.95,uOut(x,z)*1.05,dC/Wc(x,z))*plat:0;
 return{wet:clamp(wet,0,1),flow:clamp(flow,0,1),upland:clamp((h-400)/1300,0,1),canyon:can*smooth(12,40,landH(x,z)-floorC(x)),rim,
  rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold,geo,barren,
  // the painter's own fields: how much strata shows, the mud cracks, the vents' crust, snow
  strata:Math.max(smooth(.15,.6,bad)*.9,smooth(.35,.7,slope)*(1-smooth(620,760,h))),
  crack:Math.max(smooth(.2,.7,geo)*.7,smooth(.4,.1,wet)*smooth(.25,.05,cold)*(1-bad)*.6),
  snow:Math.max(barren,smooth(.88,1,cold)*smooth(.7,.35,slope)*smooth(.45,.6,fbm(x*.004,z*.004,134,2)))};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','strata','crack','snow'];
const FC=(function(){const N=420,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
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
const OBSTACLES=[];
// the LOD spine: the transect's showplaces
const SPINE=[[VENTS.x,VENTS.z],[-2500,-900],[-2600,1500],[-1700,2600],[-1200,zR(-1200)]];
for(let x=-600;x<=2900;x+=700)SPINE.push([x,zR(x)]);
SPINE.push([300,-900],[600,1500],[1700,-300],[2050,900],[TARN.x,TARN.z],[2900,-200],[3150,700]);
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 obstacles:OBSTACLES,ticks:tick,seed:13,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:400,mid:1000,far:2600,floor:[360,880]},
 windows:{water:[-TERR.R,-TERR.R,TERR.R,TERR.R]}});
BIO.setSun([-1000,1150,-560]);

// ---------------------------------------------------------------- the ground
// One mesh, painted by zone from the field cache. The badland mounds and the canyon walls carry the core's
// bedded-rock shader (35-core-strata) in the badlands' own palette: pink, cream, gold, grey and maroon beds.
const STRATA=BIO.strata({seed:5813,columnM:120,
 // every kind of bed is a badland colour (the shared column's sandstones are 2.5-11 m thick: with one palette for them
 // they would wash the mounds out in one tone): pink, cream, gold, grey, rust; maroon and grey shales; cream bleach
 palette:{sand:[0xc87868,0xe2d0b0,0xc8a050,0x9a8a8e,0xb06850,0xd8b0a0,0xcc8a62],shale:[0x7a3a3a,0x6a6670,0x8a4a48],bleach:[0xeee2c8,0xe8dcc0],
  mud:[0xa04a3a,0x8a3a34,0xb05a40],green:[0xb0a048,0x8a9a7a]}});
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx);
 const DES=K(0xc49a7e),DES2=K(0xa87660),VENT=[K(0xe0c840),K(0xe8e4d0),K(0xc07030),K(0xd8b030),K(0xa8c040)],
  BANDS=[K(0xc88a7a),K(0xe2d2b4),K(0xc8a060),K(0x8e8a90),K(0x8a4a44),K(0xd8a888),K(0xb0a8a0)],
  STEP=K(0x8e9278),STEP2=K(0x9a9a80),SLICK=K(0xb06a4a),GRASS=K(0x6a8a3a),GRASS2=K(0x7e9648),SOIL=K(0x8a6a4c),
  PINE=K(0x6e5e44),PINE2=K(0x7a8048),BOR=K(0x4a4434),MOSS=K(0x4e5a30),TUN=K(0x6a6844),TUN2=K(0x7a7462),
  GRAN=K(0x8a8680),GRAN2=K(0x6e6a68),SNOW=K(0xeef1f4),ICE=K(0xd8e4ee),GRAVEL=K(0xb8a890),SILT=K(0x8a8068),DAMP=K(0x4a4834);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),hh=FC.at(FC.a.h,wx,wz);
  const wet=FC.at(FC.a.wet,wx,wz),flow=FC.at(FC.a.flow,wx,wz),can=FC.at(FC.a.canyon,wx,wz),rock=FC.at(FC.a.rock,wx,wz),cold=FC.at(FC.a.cold,wx,wz),
   geo=FC.at(FC.a.geo,wx,wz),sl=FC.at(FC.a.slope,wx,wz),snow=FC.at(FC.a.snow,wx,wz),bar=FC.at(FC.a.barren,wx,wz),str=FC.at(FC.a.strata,wx,wz);
  const pav=fbm(x/80+5,y/80-2,.7,2);
  // the hot basin: pale cracked pink-tan
  c.copy(DES).lerp(DES2,clamp(.5+n*1.8,0,1));c.lerp(BANDS[5],smooth(.55,.7,pav)*.3);
  // the plateau and the steppe: sage grey-tan, red slickrock where it is bare
  t.copy(STEP).lerp(STEP2,clamp(.5+n*1.5,0,1));c.lerp(t,smooth(.08,.28,cold)*smooth(.55,.35,cold));
  c.lerp(SLICK,smooth(.08,.28,cold)*smooth(.6,.3,cold)*smooth(.5,.7,pav)*.5);
  // grass where it is wet and mild: the green valleys and the green badlands
  t.copy(GRASS).lerp(GRASS2,clamp(.5+n*1.6,0,1)).lerp(SOIL,smooth(.55,.75,pav)*.3);c.lerp(t,smooth(.3,.55,wet)*smooth(.6,.35,cold)*(1-smooth(.4,.8,str)*.55));
  // the badland beds: their colour by height (the strata shader adds the laminae)
  c.lerp(BANDS[Math.abs(Math.floor(hh/7+n*.6))%BANDS.length],smooth(.2,.6,str)*smooth(.6,.3,wet)*.7);
  // the vents: yellow, white and rust crust, green rims at the pools
  if(geo>0){const v=fbm(x/14+3,y/14-1,.9,2),k=Math.floor(clamp(v*1.4-.2,0,.999)*VENT.length);t.copy(VENT[k]).lerp(VENT[(k+1)%VENT.length],clamp(n2+.5,0,1)*.3);c.lerp(t,smooth(.1,.5,geo)*.9);}
  // the pine belt, the boreal forest, the tundra, the crest's granite, snow and ice
  t.copy(PINE).lerp(PINE2,clamp(.5+n*1.6,0,1));c.lerp(t,smooth(.3,.42,cold)*smooth(.68,.55,cold)*.8);
  t.copy(BOR).lerp(MOSS,clamp(.5+n*1.6,0,1));c.lerp(t,smooth(.55,.68,cold)*smooth(.93,.85,cold)*.85);
  t.copy(TUN).lerp(TUN2,clamp(.5+n*1.6,0,1));c.lerp(t,smooth(.84,.94,cold)*.85);
  t.copy(GRAN).lerp(GRAN2,clamp(.5+n*1.6,0,1));c.lerp(t,smooth(.35,.75,rock)*smooth(.45,.7,cold)*.85);
  t.copy(SNOW).lerp(ICE,clamp(.5+n*2,0,1)*bar);c.lerp(t,Math.max(snow*smooth(.8,.5,sl),bar*smooth(.95,.8,sl))*.95);
  // the canyon: gravel and silt on the floor, damp at the water; its walls are strata (aRock)
  t.copy(GRAVEL).lerp(SILT,smooth(.6,.9,wet));c.lerp(t,smooth(.5,.95,can)*smooth(.6,.3,cold)*.6);c.lerp(GRASS,smooth(.85,1,can)*smooth(.2,.6,flow)*.4);
  c.lerp(DAMP,smooth(.6,.95,flow)*.7);
  const k=1+n*.10+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*24;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_CRACK=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);
 g.strokeStyle='rgba(70,60,50,.6)';g.lineCap='round';
 const P=[];for(let i=0;i<18;i++)P.push([rng()*w,rng()*h]);
 for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j];if(Math.hypot(a[0]-b[0],a[1]-b[1])>w*.38)continue;if(rng()<.45)continue;
  g.lineWidth=rr(1.2,2.6);for(let k=-1;k<=1;k++)for(let m=-1;m<=1;m++){g.beginPath();g.moveTo(a[0]+k*w,a[1]+m*h);g.quadraticCurveTo((a[0]+b[0])/2+rr(-18,18)+k*w,(a[1]+b[1])/2+rr(-18,18)+m*h,b[0]+k*w,b[1]+m*h);g.stroke();}}});
// THE LIBRARY GROUND LAYERS (materials.json ground.*, core/materials/PLAN.md "Eastern badlands"): eight surfaces blended
// per vertex by zone over the painted ground. A keep-0 layer multiplies the painted colour by its relief (popcorn clay on
// the badland mounds, Navajo cross-bedding under the strata on the walls); a keep-1 layer shows its own colour (the
// sulphur crust, the acid pools' travertine rims); the others mix the two. Without the pack (?mat=proc, or no tex/) the
// ground is exactly the painted one. GL: [library set, metres per tile, keep, weight(x,z,F)] with F the cached fields.
const GL=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;
 const P=n=>KMAT.packed('ebadlands','ground.'+n),hot=F=>smooth(.2,.02,F.cold),bed=F=>F.strata*(1-F.snow);
 const L=[['clay',F=>bed(F)*smooth(.8,.5,F.slope)],['sandstone',F=>bed(F)*smooth(.45,.8,F.slope)],
  ['sulphur',F=>smooth(.12,.5,F.geo)*(1-F.pool)],['travertine',F=>F.pool],
  ['playa',F=>hot(F)*smooth(.3,.12,F.wet)*(1-F.geo)*(1-bed(F))],['steppe',F=>smooth(.03,.2,F.cold)*smooth(.72,.5,F.cold)*smooth(.45,.22,F.wet)*(1-bed(F))],
  ['needles',F=>smooth(.25,.4,F.cold)*smooth(.92,.85,F.cold)*smooth(.15,.3,F.wet)*(1-F.rock)*(1-F.snow)],['tundra',F=>smooth(.84,.94,F.cold)*(1-F.snow)*(1-F.rock*.6)]];
 if(L.some(l=>!P(l[0])))return null;
 return L.map(l=>{const e=P(l[0]);return{name:l[0],w:l[1],tex:KMAT.textures(e,{aniso:8}).map,scale:e.scale[0],keep:e.tint,mean:e.mean};});})();
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xa8a29a});
MAT_GROUND.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};sh.uniforms.uCrack={value:hostGroundLib('groundCrack',TEX_CRACK)};
 let lay='';
 if(GL){GL.forEach((l,i)=>{sh.uniforms['uGL'+i]={value:l.tex};});
  // a custom sampler is not decoded from sRGB for us (as the strata note says): pow 2.2 by hand; a keep-0 layer is its
  // relief, normalised by the pack's mean brightness so the painted colour keeps its level
  lay='{vec3 _b=diffuseColor.rgb,_a=vec3(0.0);float _s=0.0;vec2 _p=vGWP.xz;'+GL.map((l,i)=>{const m=Math.pow(l.mean==null?.78:l.mean,2.2).toFixed(4),
    w='vGL'+(i<4?'0':'1')+'.'+'xyzw'[i%4];
   return 'if('+w+'>0.003){vec3 t=pow(texture2D(uGL'+i+',_p*'+(1/l.scale).toFixed(4)+').rgb,vec3(2.2));_a+='+w+'*mix(_b*t/'+m+',t,'+l.keep.toFixed(2)+');_s+='+w+';}';}).join('')+
   'diffuseColor.rgb=mix(_b,_a/max(_s,0.001),clamp(_s,0.0,1.0));vGLs=_s;}';}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aCrack;attribute float aRock;varying float vCrack;varying float vRock;'+
   (GL?'attribute vec4 aGL0,aGL1;varying vec4 vGL0,vGL1;':''))
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vCrack=aCrack;vRock=aRock;'+(GL?'vGL0=aGL0;vGL1=aGL1;':''));
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail,uCrack;varying vec3 vGWP;varying float vCrack;varying float vRock;'+
   (GL?'varying vec4 vGL0,vGL1;'+GL.map((l,i)=>'uniform sampler2D uGL'+i+';').join(''):''))
  .replace('#include <map_fragment>','#include <map_fragment>\n{float vGLs=0.0;vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;vec3 ck=texture2D(uCrack,vGWP.xz*0.14).rgb;'+
  'vec3 bc=strataColor(vSWP,vSWN);'+
  'diffuseColor.rgb=mix(diffuseColor.rgb,bc*(0.85+0.3*dt.r),vRock*0.88);'+lay+
  // the procedural grain and cracks give way where a library layer carries its own
  'diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85*(1.0-0.7*clamp(vGLs,0.0,1.0)))*mix(vec3(1.0),ck,vCrack*(1.0-clamp(vGLs,0.0,1.0)));}');};
const GROUND=(function(){const N=560,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),ck=new Float32Array(nx*nx),rk=new Float32Array(nx*nx);
 const g0=GL?new Float32Array(nx*nx*4):null,g1=GL?new Float32Array(nx*nx*4):null,F={};
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  ck[k]=FC.at(FC.a.crack,x,z);rk[k]=FC.at(FC.a.strata,x,z)*(1-FC.at(FC.a.snow,x,z));
  if(GL){FNAMES.forEach(n=>F[n]=FC.at(FC.a[n],x,z));F.pool=smooth(2.6,1.15,poolD(x,z)[0]);
   let s=0;const w=GL.map(l=>{const v=clamp(l.w(F),0,1);s+=v;return v;}),k1=s>1?1/s:1;
   for(let q=0;q<4;q++){g0[k*4+q]=w[q]*k1;g1[k*4+q]=w[q+4]*k1;}}}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aCrack',new THREE.BufferAttribute(ck,1));g.setAttribute('aRock',new THREE.BufferAttribute(rk,1));
 if(GL){g.setAttribute('aGL0',new THREE.BufferAttribute(g0,4));g.setAttribute('aGL1',new THREE.BufferAttribute(g1,4));}
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The eastern badlands';scene.add(m);return m;})();

// ---------------------------------------------------------------- the water
// One vertex-coloured ripple material for every sheet: the river (green-teal, white in the range's rapids),
// the sulphur pools (acid green, yellow, turquoise, each its own), the tarn (deep blue-green).
const MAT_WATER=new THREE.ShaderMaterial({fog:true,vertexColors:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(-1000,1150,-560).normalize()},uSky:{value:new THREE.Color(0xdfe6ec)}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying vec3 vCol;',
  'void main(){vCol=color;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vCol;',
  'void main(){',
  ' float dcam=length(cameraPosition-vWP);float rk=1.0-smoothstep(120.0,420.0,dcam);',
  ' vec3 n=normalize(vec3(rk*(0.035*sin(vWP.x*0.31+uT*1.1)+0.02*sin(vWP.z*0.53-uT*0.7+vWP.x*0.11)),1.0,rk*(0.035*cos(vWP.z*0.27+uT*0.9)+0.02*sin(vWP.x*0.47+uT*1.3))));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(clamp(1.0-max(dot(n,V),0.0),0.0,1.0),3.0);',
  ' vec3 col=mix(vCol,uSky,0.10+fr*0.62);',
  ' vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),140.0)*0.8*vec3(1.0,0.97,0.9);',
  ' gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
MAT_WATER.uniforms.fogColor.value=scene.fog.color;MAT_WATER.uniforms.fogDensity.value=scene.fog.density;
TICKS.push(dt=>{MAT_WATER.uniforms.uT.value+=dt;});
const RIVER_C=[new THREE.Color().setHSL(.47,.45,.5),new THREE.Color().setHSL(.47,.55,.32),new THREE.Color().setHSL(.5,.5,.2)],FOAM=new THREE.Color(0xeaf2f0);
const POOL_C=[0x9ad030,0xd8c830,0x30c0b0,0x6ac860,0xe0b028,0x48b8c8].map(h=>new THREE.Color(h));
function waterSheet(pos,col,idx,label){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel=label;m.renderOrder=1;scene.add(m);return m;}
(function(){
 // the river: 10 m steps along x, 9 vertices across (half-width 12 m), wound to face UP
 const pos=[],col=[],c=new THREE.Color(),NW=8,HW=12,rows=[];
 for(let x=-TERR.R*1.1;x<=TERR.R*1.1;x+=10){const zr=zR(x),row=[],y=WL(x),rap=smooth(1500,2300,x)*smooth(.45,.65,fbm(x*.05,zr*.05,606,2));
  for(let k=0;k<=NW;k++){const z=zr+(k/NW-.5)*2*HW,e=Math.abs(k/NW-.5)*2;c.copy(RIVER_C[1]).lerp(RIVER_C[0],e*.8).lerp(FOAM,rap*.8);c.convertSRGBToLinear();row.push(pos.length/3);pos.push(x,y,z);col.push(c.r,c.g,c.b);}rows.push(row);}
 const idx=[];for(let r=0;r<rows.length-1;r++)for(let k=0;k<NW;k++){const a=rows[r][k],b=rows[r][k+1],cc=rows[r+1][k],dd=rows[r+1][k+1];idx.push(a,dd,cc,a,b,dd);}
 waterSheet(pos,col,idx,'The river');
 // the pools and the tarn: fans at their levels
 const fan=(X,Z,R,L,ca,cb,label)=>{const pos=[X,L,Z],col=[],c0=ca.clone().convertSRGBToLinear(),c1=cb.clone().convertSRGBToLinear(),PN=36,idx=[];col.push(c0.r,c0.g,c0.b);
  for(let k=0;k<=PN;k++){const a=k/PN*TAU;pos.push(X+Math.cos(a)*R,L,Z+Math.sin(a)*R);col.push(c1.r,c1.g,c1.b);}for(let k=0;k<PN;k++)idx.push(0,k+2,k+1);waterSheet(pos,col,idx,label);};
 POOLS.forEach((P,i)=>{fan(P[0],P[1],P[2]*1.35,POOLL[i],POOL_C[i%POOL_C.length],POOL_C[i%POOL_C.length].clone().lerp(new THREE.Color(0xf0f0d0),.35),'A sulphur pool');});
 fan(TARN.x,TARN.z,TARN.r*1.3,TARNL,new THREE.Color(0x1e4a5a),new THREE.Color(0x4a8a8a),'The tarn');
 REGISTER({name:'The sulphur flats',x:VENTS.x,z:VENTS.z,y:basinH(VENTS.x,VENTS.z)-30,r:VENTS.r,h:120});
 REGISTER({name:'The tarn',x:TARN.x,z:TARN.z,y:TARNL-10,r:TARN.r*1.6,h:60});})();
