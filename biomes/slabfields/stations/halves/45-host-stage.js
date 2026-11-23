// ================================================================= HOST — stage: the Slabfields' station 3, the Halves (PLAN.md sections 3.5, 5, 6 and 13; 2026-11-17)
// Station 2's stage (stations/leaner) with the Halves' land: the renderer, the light, the land from its site record (40h: SLAB_SITES.halves), the
// apron's blocks as KSTACKS records, the climate fields and the biome core's binding.
//   halves  THE HALVES (station 3): one slab cut by a NW-SE fault and pulled apart. The south-east half's north cliff and its torn west end across the
//           page's south-east (KRELIEF.slab along a rim that turns its corner), its apron spread north toward the patera with blocks on it; the north-west
//           half 9 km away across the water (the far field), its torn east end facing back; between them the patera (KRELIEF.stepcut: a wall of three
//           steps, 210 m) with its floor of old crusted lava, the warm pool and its springs on the south shore; on the bench south-west of the wall two
//           pits of the chain along the split fault (KRELIEF.stepcut), a seep at each one's floor
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
const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'foot',SITE=SLAB_SITES[SKEY];
const STATION_REGION=SITE.name+' (the Slabfields, station '+SITE.station+'; ideal type)';
const WORLD=KRAND.hash(1722,1376,517);   /* the page's world seed: the station's 5.1 px and the edit that made it */

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT: 1.06 atm, dry (173 mm), cold: the Anvil's sky
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd8dadc);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00008);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,30000);
scene.add(new THREE.HemisphereLight(0xcad8ec,0xa49c90,.74));
const sun=new THREE.DirectionalLight(0xffffff,1.3);sun.position.set(-900,1300,-700);scene.add(sun);
const fill=new THREE.DirectionalLight(0xe0e4f0,.18);fill.position.set(700,300,900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:2600};
const SNOW_LINE=SITE.snow;
const n2=(x,z,f,seed)=>fbm(x*f,z*f,seed,2)-.5;
const L=(function(){const S=SITE,PT=S.patera;
 if(SKEY!=='halves')throw new Error('no station '+SKEY+' on this stage (stations/halves)');
 // THE BENCH: the middle bench, 3,310 m under the page, rising 4 m a km toward the south-east (the model: 3,234 m by the north-west half, 3,435 m by
 // the south-east)
 const bench=(x,z)=>S.base+.0028*(x+z)+5*n2(x,z,.0011,61)+1.5*n2(x,z,.009,62);
 // THE HALVES (KRELIEF.slab, core/terrain 38d): each rim turns its corners, so the north cliff runs on into the torn end along the split
 const HV=S.halves.map((o,k)=>({o,W:KRELIEF.slab({pts:o.pts,side:1,h:o.h,run:o.run,dip:o.dip,seed:KRAND.hash(WORLD,1+k,51),
  spurs:{sp:420,spread:[.4,1.9],w:[.7,.97],out:[15,140],run:[.65,1.6],power:[1,1.9],dh:[-.08,.03],tip:[.02,.12]},gullies:{back:[15,110]},
  cones:{h:[30,110],reach:[110,280]},skirt:{h:o.talus.h/o.h,reach:o.talus.reach/o.run}})}));
 const slabbed=(x,z)=>{let y=bench(x,z);for(const H of HV)y=KRELIEF.shape(H.W,x,z,y);return y;};
 const SE=S.halves[0];
 // the south-east half's north rim and its foot (z at x), on the page's stretch of it
 const seRimZ=x=>x<1100?null:2200+150*smooth(1800,1100,x),seFootZ=x=>{const r=seRimZ(x);return r==null?null:r-SE.run;};
 // THE APRON: the south-east half's collapse spread north toward the patera, thickest at the cliff's foot; t 0 at the north toe to 1 at the foot
 const AP=SE.apron;
 function apronQ(x,z){const u=(x-AP.c[0])/AP.r[0],w=(z-AP.c[1])/AP.r[1];return{u,w,r:Math.hypot(u,w),t:clamp(.5+.5*w,0,1)};}
 function apronT(x,z){const q=apronQ(x,z);if(q.r>1.05)return 0;const edge=smooth(1.05,.9,q.r);if(edge<=0)return 0;
  let T=AP.foot*(.4+.6*q.t);
  const hum=fbm(x*.008,z*.008,71,3)-.45;T+=12*Math.max(-.3,hum)*2*(.35+.65*(1-q.t));
  T+=4*Math.sin(q.u*26)*smooth(.6,.9,q.t);T+=2*n2(x,z,.03,73);return Math.max(0,T*edge);}
 // THE PATERA: KRELIEF.stepcut (core/terrain 38c): a wall of three steps down to its floor
 const PC=PT.c,P=KRELIEF.stepcut({disc:{c:PC,r:PT.r},floor:PT.floor,steps:PT.wall.steps,tread:PT.wall.tread,riser:PT.wall.riser,rim:1.5,
  warp:{amp:PT.wall.warp,scale:1/420},seed:KRAND.hash(WORLD,2,52)});
 const pr=(x,z)=>Math.hypot(x-PC[0],z-PC[1]);
 const shoreR=(x,z)=>PT.shore+22*n2(x,z,.006,63)+8*n2(x,z,.03,64);
 // the floor: the old lava lake's crust, nearly level (6 m over 1.9 km), its pressure ridges a metre high; under the water the pool's bowl
 function floorY(x,z){const r=pr(x,z),rs=shoreR(x,z);
  if(r>=rs)return PT.level+(PT.floor-PT.level)*smooth(rs,PT.r-200,r)+.6*Math.max(0,fbm(x*.012,z*.012,67,2)-.5)*2+.25*n2(x,z,.05,65);
  const d=rs-r;return PT.level-Math.min(PT.level-PT.bed,.5+d*.03+d*d*.00002);}
 // THE PIT CHAIN: KRELIEF.stepcut discs on the bench, each floor flat at the bench less its depth
 const PITS=S.pits.map((p,i)=>{const fl=bench(p.c[0],p.c[1])-p.depth;return Object.assign({},p,{i,fl,R:KRELIEF.stepcut({disc:{c:p.c,r:p.r},floor:fl,steps:p.steps,tread:22,riser:4,rim:1,
  warp:{amp:p.r*.08,scale:1/90},seed:KRAND.hash(WORLD,60+i,53)})});});
 // THE SPRINGS: warm on the pool's south shore (each walked out from the shore to its height), and one cold seep at each pit's floor
 const SPR=S.springs,SPRINGS=[];for(let i=0;i<SPR.n+SPR.dead;i++){const h=k=>KRAND.hash(WORLD,50,i*8+k)/4294967296,dead=i>=SPR.n;
  const a=Math.PI/2+lerp(-.42,.42,(i%SPR.n+.15+.7*h(0))/SPR.n),want=dead?lerp(1.6,2.4,h(1)):lerp(.3,1.1,h(1)),slope=(PT.floor-PT.level)/(PT.r-200-PT.shore);
  const rr0=PT.shore+want/slope*.6,x=PC[0]+Math.cos(a)*rr0,z=PC[1]+Math.sin(a)*rr0;if(Math.abs(x)>TERR.R*1.05||Math.abs(z)>TERR.R*1.05)continue;
  SPRINGS.push({x,z,r:lerp(SPR.r[0],SPR.r[1],h(2)),dead,i,temp:lerp(SPR.temp[0],SPR.temp[1],h(3))});}
 PITS.forEach(p=>{const a=KRAND.hash(WORLD,70,p.i)/4294967296*TAU,d=Math.max(20,p.r-60-p.steps*26);SPRINGS.push({x:p.c[0]+Math.cos(a)*d*.7,z:p.c[1]+Math.sin(a)*d*.7,r:6,dead:false,i:100+p.i,temp:6,pit:p.i});});
 function springY(x,z,y){for(const q of SPRINGS){const d=Math.hypot(x-q.x,z-q.z);if(d>q.r*3.2)continue;
   const mound=(q.pit!=null?0:q.dead?.4:.7)*smooth(q.r*3.2,q.r*1.1,d),bowl=(q.dead?.6:1.0)*(1-Math.pow(Math.min(1,d/q.r),2));return y+mound-bowl*(d<q.r?1:0);}return y;}
 function land0(x,z){let y=slabbed(x,z);y+=apronT(x,z);
  for(const p of PITS)if(Math.hypot(x-p.c[0],z-p.c[1])<p.r+20)y=KRELIEF.shape(p.R,x,z,y);
  if(pr(x,z)<PT.r+30){y=KRELIEF.shape(P,x,z,y);const a=KRELIEF.at(P,x,z);if(a&&a.part==='floor')y=floorY(x,z);}
  return springY(x,z,y);}
 SPRINGS.forEach(q=>{let lo=1e9;for(let k=0;k<12;k++){const a=k/12*TAU;lo=Math.min(lo,land0(q.x+Math.cos(a)*q.r*1.05,q.z+Math.sin(a)*q.r*1.05));}q.y0=lo;q.level=q.dead?-1e9:lo-.15;});
 function springW(x,z){for(const q of SPRINGS){if(q.dead)continue;const d=Math.hypot(x-q.x,z-q.z);if(d<q.r*.95)return q.level;}return -1e9;}
 const land=land0;
 function water(x,z){const w=springW(x,z);if(w>-1e8&&w>land0(x,z))return w;
  const r=pr(x,z);if(r<shoreR(x,z)+60){const y0=land0(x,z);if(y0<PT.level)return PT.level;}return -1e9;}
 const nearRoad=()=>({d:1e9,i:-1});   /* no road: the Halves are off the corridor (PLAN.md section 12) */
 const spine=[[0,0],[-900,-900],[900,-1000],[0,-1100],[2200,800],[1700,1500],[-600,700]].concat(S.pits.map(p=>p.c),SPRINGS.map(q=>[q.x,q.z]));
 return{land,land0,water,bench,slabbed,HV,seRimZ,seFootZ,apronT,apronQ,P,PC,pr,shoreR,floorY,PITS,SPRINGS,nearRoad,farBase:S.base,spine,lakeLevel:PT.level,
  CRACKS:[],PONDS:[],RL:[]};})();
// THE BLOCKS: blocks of the south-east half's basalt on its apron (KSTACKS buttes, as station 1's), from KRAND.hash(world, index, try), kept apart by
// KSPACE; the big ones on the distal (north) half; and the talus's fresh blocks under the north cliff
const BLOCKS=(function(){const B=SITE.blocks,AP=SITE.halves[0].apron,out=[],SPC=KSPACE.create({cell:80});
 for(let i=0;i<B.n;i++){const big=i<B.big;
  for(let k=0;k<40;k++){const h=j=>KRAND.hash(WORLD,1000+i,k*16+j)/4294967296;
   const t=big?lerp(.1,.55,h(0)):lerp(.05,.95,h(0)),u=lerp(-.85,.85,h(1)),x=AP.c[0]+u*AP.r[0]*Math.sqrt(1-Math.pow(2*t-1,2))*.9,z=AP.c[1]+(2*t-1)*AP.r[1]*.9;
   const r=big?lerp(B.bigR[0],B.bigR[1],h(2)):lerp(B.r[0],B.r[1],h(2)),H=big?lerp(B.bigH[0],B.bigH[1],h(3)):lerp(B.H[0],B.H[1],h(3));
   if(L.apronT(x,z)<15||Math.abs(x)>TERR.R*1.05-r||Math.abs(z)>TERR.R*1.05-r)continue;
   if(SPC.some(x,z,r+60,o=>Math.hypot(o.x-x,o.z-z)<o.r+r+15))continue;
   let y0=1e9;for(let a=0;a<12;a++){const an=a/12*TAU;y0=Math.min(y0,L.land(x+Math.cos(an)*r,z+Math.sin(an)*r));}
   const ry=h(4)*TAU,e=lerp(1,1.7,h(5)),split=h(6)<.55;
   const tiers=split?[{h:H*.62,r,e,ry},{h:H*.38,r:r*lerp(.55,.85,h(7)),e:e*lerp(.9,1.2,h(8)),ry:ry+lerp(-.4,.4,h(9)),dx:lerp(-.15,.15,h(10))*r,dz:lerp(-.15,.15,h(11))*r}]:[{h:H,r,e,ry}];
   let S=null;try{S=KSTACKS.make({kind:'butte',id:'block'+i,x,z,y0:y0-1.5,seed:KRAND.hash(WORLD,1100+i,7),tiers,bed:[H*.45,H*.75],lobes:.035,weather:0,
    columns:{w:[1.4,2.8],d:.4,ent:.4}});}catch(e){continue;}
   S.beds.forEach((b,k)=>{b.sq=lerp(6,11,KRAND.hash(WORLD,1300+i,k)/4294967296);b.ch*=.3;b.nt*=.3;});
   S.name=big?'A field-sized block of the south-east half\'s basalt ('+Math.round(r*2)+' m across, '+Math.round(H)+' m high)':'A block of the south-east half\'s basalt ('+Math.round(H)+' m)';
   S.big=big;S.r=r;out.push(S);SPC.insert(S,x,z,r);break;}}
 for(let x=1200;x<=2800;x+=400){const n=2+Math.floor(KRAND.hash(WORLD,1500,x)/4294967296*3);
  for(let k=0;k<n;k++){const h=j=>KRAND.hash(WORLD,1500+k,x*8+j)/4294967296;const bx=x+lerp(-180,180,h(0)),bz=L.seFootZ(bx)-lerp(30,SITE.halves[0].talus.reach*.75,h(1)),r=lerp(3,7,h(2)),H=lerp(3,8,h(3));
   if(Math.abs(bx)>TERR.R*1.05-r||Math.abs(bz)>TERR.R*1.05-r)continue;
   if(SPC.some(bx,bz,r+20,o=>Math.hypot(o.x-bx,o.z-bz)<o.r+r+4))continue;
   let y0=1e9;for(let a=0;a<8;a++){const an=a/8*TAU;y0=Math.min(y0,L.land(bx+Math.cos(an)*r,bz+Math.sin(an)*r));}
   let S=null;try{S=KSTACKS.make({kind:'butte',id:'talus'+x+'_'+k,x:bx,z:bz,y0:y0-1,seed:KRAND.hash(WORLD,1600+k,x),tiers:[{h:H,r,e:lerp(1,1.5,h(4)),ry:h(5)*TAU}],bed:[H,H],lobes:.03,weather:0});}catch(e){continue;}
   S.beds.forEach(b=>{b.sq=lerp(6,12,h(6));b.ch*=.25;b.nt*=.2;});
   S.name='A block fallen from the south-east half\'s face (fresh: no lichen on it)';S.big=false;S.talus=true;S.r=r;out.push(S);SPC.insert(S,bx,bz,r);}}
 return out;})();
function landH(x,z){return L.land(x,z);}
function floor0(x){return L.farBase;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;let h=L.land(x,z);const b=KSTACKS.topAt(BLOCKS,x,z);if(b>h)h=b;_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){return L.water(x,z);}

// ---------------------------------------------------------------- the climate fields (the field contract's units: core/biome/README.md)
//   cold    by height over the station's own snow line (the crests take it)
//   wet     the pool's shore and the springs; the pits' floors; the blocks' shade; the rest dry (173 mm)
//   rock    the steeps: the cliffs, the patera's and the pits' walls, the talus, the blocks; the apron's rubble half rock
//   canyon  THE SHADE: the north and the lee of a block (the kit reads it as `shade`)
//   rim     THE APRON: the share of the apron's rubble under a point (0 off it)
//   geo     the warm springs (their mounds and the ground round them)
//   flat    the floor and the bench (the Siphon Pits' cold ground reads it)
function nearBlock(x,z){let best=null,bd=1e9;for(const S of BLOCKS){const d=Math.hypot(x-S.x,z-S.z)-S.r;if(d<bd){bd=d;best=S;}}return{S:best,d:bd};}
function nearSpring(x,z){let bd=1e9,b=null;for(const q of L.SPRINGS){const d=Math.hypot(x-q.x,z-q.z)-q.r;if(d<bd){bd=d;b=q;}}return{q:b,d:bd};}
function fieldsAt(x,z,h,slope){
 const w=waterH(x,z),wd=w>-1e8?0:1;let near=0;
 for(let k=0;k<8&&wd;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*25,z+Math.sin(a)*25)>-1e8){near=Math.max(near,.85);break;}}
 for(let k=0;k<8&&wd&&near<.8;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*80,z+Math.sin(a)*80)>-1e8){near=Math.max(near,.45);break;}}
 const nb=nearBlock(x,z),shade=nb.S?smooth(nb.S.r*.9,0,nb.d)*(.55+.45*smooth(-.2,.6,(nb.S.z-z)/(nb.S.r+1))):0;
 const ap=smooth(0,20,L.apronT(x,z)),ns=nearSpring(x,z),geo=ns.q&&!ns.q.dead?smooth(30,0,ns.d):ns.q?.3*smooth(15,0,ns.d):0;
 const rock=clamp(Math.max(smooth(.5,.82,slope),smooth(.35,.6,slope)*.45,ap*.42),0,1);
 const wet=clamp(.12+.65*near+.35*shade+.05*ap-.15*rock+.05*n2(x,z,.002,131),0,1);
 return{wet,flow:0,upland:1,canyon:shade,rim:ap,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:clamp(.5+(h-SITE.snow[0])/1400,0,1),geo,barren:0,fog:0,mist:0,flat:1-smooth(.12,.3,slope)};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','flat'];
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
FIELD.shade=FIELD.canyon;FIELD.apron=FIELD.rim;   /* the kit's own names for the two it borrows */
// the ground's warmth: the springs' water (14-22 degC; the pits' seeps cold) at their pools, falling to the air's mean by 30 m (KTHERM not taken: KNOWN_ISSUES.md)
let HEAT_AT=(x,z)=>{const ns=nearSpring(x,z);return ns.q&&!ns.q.dead?mix(SITE.temp.mean,ns.q.temp,smooth(30,0,ns.d)):SITE.temp.mean;};

// ---------------------------------------------------------------- the host binding
// nothing roots in the water or on a block's wall; a block's top is ground (lichen grows there)
function rootMask(x,z){const d=terrainH(x,z)-waterH(x,z);if(d<.15)return 0;return d<.7?(d-.15)/.55:1;}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=BLOCKS.map(S=>({x:S.x,z:S.z,r:S.r+1}));
BIO.init({tags:'slabfields',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:5130+SITE.station,origin:L.spine,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:560,far:2400,floor:[180,440]},
 windows:{water:WBOX}});
BIO.setSun([-900,1300,-700]);
