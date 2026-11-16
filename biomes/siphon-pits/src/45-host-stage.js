// ================================================================= HOST — stage: the Siphon Pits' four stations (PLAN.md sections 3, 6 and 7)
// The ideal-type host for one station of Region 98: the renderer, the light, the land drawn from its site record (40: SIPHON_SITES) on core/terrain's
// landforms (KRELIEF.wadi, terraces, scarp, stepcut, columns; KFROST) and baked once to a KFIELD (the ground as data, with a fine inset over the
// Arete's knife-edge), the climate fields, the analytic water and the biome core's binding. Started from biomes/highrift's stage (PLAN.md section 6).
//   terraces  the graben's floor, the braided meltwater on its cobble bed, the loess terraces up both sides
//   scarp     the Ostrukh Wall with its ravine and scree fan, the caravan road's switchbacks cut into them, frost polygons and lobes
//   pitfloor  the maar's flat floor ringed by three sheer risers, the sink's floor round its rim, the vent's cone, the mud pots
//   arete     the plateau between two 420 m pits, their rims meeting 6 m apart at the centre
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}
const SKEY=STATION_KEY,SITE=SIPHON_SITES[SKEY];
const STATION_REGION=SITE.title+' (Siphon Pits, station '+SITE.zone+'; ideal type)';

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT: 0.94-1.22 atm; the sky (89) drives the sun, the hemisphere and the fog from here on
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd8dee6);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00009);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,16000);
scene.add(new THREE.HemisphereLight(0xcadcf0,0xa8a49c,.74));
const sun=new THREE.DirectionalLight(0xffffff,1.3);sun.position.set(-1000,1100,-500);scene.add(sun);
const fill=new THREE.DirectionalLight(0xe0e4f0,.18);fill.position.set(700,300,900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:2600};
const SNOW_LINE=SITE.snow;
const n2=(x,z,f,seed)=>KRAND.fbm(x*f,.5,z*f,2,seed)-.5;
const dflt=(v,d)=>v==null?d:v;
// a polyline's frame: nearest point (s along, a across: + to the right going downstream), sampled once
function lineFrame(P){const S=[0];for(let i=1;i<P.length;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const Lt=S[S.length-1];
 return{P,S,L:Lt,at(x,z){let best=1e18,o={s:0,a:0,d:1e9};for(let i=0;i+1<P.length;i++){const A=P[i],B=P[i+1],dx=B[0]-A[0],dz=B[1]-A[1],l=Math.hypot(dx,dz)||1,ux=dx/l,uz=dz/l,
   px=x-A[0],pz=z-A[1],t=clamp(px*ux+pz*uz,0,l),qx=px-ux*t,qz=pz-uz*t,d=qx*qx+qz*qz;if(d<best){best=d;o.s=S[i]+t;o.a=px*uz-pz*ux;o.d=Math.sqrt(d);}}return o;},
  pt(s){s=clamp(s,0,Lt);let i=0;while(i<S.length-2&&S[i+1]<s)i++;const t=(s-S[i])/((S[i+1]-S[i])||1);return[lerp(P[i][0],P[i+1][0],t),lerp(P[i][1],P[i+1][1],t)];}};}
const L=(function(){const S=SITE;
 if(SKEY==='terraces'){const C=S.chan,T=S.terr,B=S.base;
  const zc=x=>C.z0+C.amp*Math.sin(x*C.wave+.6)+30*Math.sin(x*.004+1.7);
  function ground0(x,z){const dz=z-zc(x);return B-.0032*x+10*n2(x,z,.0012,11)+3*n2(x,z,.01,12)
   +S.sides.south[0]*smooth(S.sides.south[1],S.sides.south[2],dz)*(.85+.3*KRAND.fbm(x*.0009,.3,0,2,13))+S.sides.north[0]*smooth(S.sides.north[1],S.sides.north[2],-dz);}
  const pts=[];for(let x=-2950;x<=2950;x+=25)pts.push([x,zc(x)]);
  const WADI=KRELIEF.wadi({pts,ground:ground0,w:C.w,bank:C.bank,bankW:14,braids:1.6,barH:[.35,.85],pools:0,fan:false,seed:9801});
  const TER=KRELIEF.terraces({rise:T.rise,riser:T.riser,base:B,wobble:.12,fill:.5,bund:.3,field:T.field,band:[B+T.band[0],B+T.band[1]],bandFade:6,seed:9802});
  const floorAt=x=>{const i=clamp(Math.round((x+2950)/25),0,WADI.pts.length-1);return WADI.pts[i].y;};
  // the braids: three channels weaving across the cobble floor, each its own phase (KRAND by braid), the water 0.45 m over the floor
  const BR=[];for(let k=0;k<C.braids;k++){const ph=KRAND.unit(KRAND.hash(9803,k))*TAU,f=.0021+.0012*KRAND.unit(KRAND.hash(9803,k,1));
   BR.push({k,q:x=>(k-(C.braids-1)/2)*.52*C.w+.32*C.w*Math.sin(x*f+ph),w:C.braidW*(k===1?1.2:.85)});}
  const level=x=>floorAt(x)+.45;
  let off=0;
  function land0(x,z){let g=ground0(x,z);g=KRELIEF.shape(WADI,x,z,g);if(Math.abs(z-zc(x))>C.w+40)g=KRELIEF.shape(TER,x,z,g);return g;}
  off=B-land0(0,0)+0;   /* the station's point is its record's height (the terraces' quantising moves it by a tread at most) */
  function land(x,z){return land0(x,z)+off;}
  function water(x,z){const q=z-zc(x);if(Math.abs(q)>C.w+20)return -1e9;for(const b of BR)if(Math.abs(q-b.q(x))<b.w/2)return level(x)+off;return -1e9;}
  return{land,water,zc,WADI,TER,BR,level:x=>level(x)+off,floorAt:x=>floorAt(x)+off,off,farBase:B-30,
   spine:[[0,zc(0)],[-1600,zc(-1600)],[1600,zc(1600)],[0,800],[0,-900]].concat(S.farms.map(f=>[f[0],f[1]]))};}
 if(SKEY==='scarp'){const W=S.wall,u=W.dir,nrm=[-u[1],u[0]];   /* n points east: the plateau's side */
  const sh=W.shift||0,rim=[[W.rim*nrm[0]+u[0]*(sh-3200),W.rim*nrm[1]+u[1]*(sh-3200)],[W.rim*nrm[0]+u[0]*(sh+3200),W.rim*nrm[1]+u[1]*(sh+3200)]];   /* shift: the line moved along itself so its one ravine comes to the station */
  const SC=KRELIEF.scarp({pts:rim,side:1,h:W.h,run:W.run,power:1.35,benches:{n:W.benches,w:W.run*.05},ravines:{n:1,w:[S.ravine.w,S.ravine.w],head:[S.ravine.head,S.ravine.head],depth:[S.ravine.depth,S.ravine.depth],power:1.4,fan:S.ravine.fan},
   buttresses:{sp:380,w:.3,amp:60},talus:{h:W.h*.07,reach:W.run*.32},rough:.014,warp:{amp:40,scale:1/700},seed:9811});
  const COL=KRELIEF.columns({w:1.8,jitter:.28,angle:.4,seed:9812});
  const ground0=(x,z)=>W.floor+.04*(-(x*nrm[0]+z*nrm[1]))+14*n2(x,z,.0014,21)+3*n2(x,z,.012,22);
  function base(x,z){const g=ground0(x,z);return KRELIEF.shape(SC,x,z,g);}
  // across the wall: d metres from the rim toward the floor (west), so the plateau is d < 0 and the lowland past the foot d > run
  const dRim=(x,z)=>W.rim-(x*nrm[0]+z*nrm[1]);
  const RV=SC.ravines[0]||{x:0,z:0,nx:-nrm[0],nz:-nrm[1]},FAN=[RV.x+RV.nx*W.run,RV.z+RV.nz*W.run];
  const FROST=KFROST.create({seed:9813,ground:base,
   polygons:{cell:S.frost.cell,trough:.32,rim:.07,width:.15,where:(x,z)=>{const d=dRim(x,z);return Math.max(smooth(-60,-220,d),smooth(W.run+120,W.run+360,d));}},
   lobes:{cell:S.frost.lobes,h:1.1,where:(x,z)=>smooth(S.ravine.fan.r*1.1,S.ravine.fan.r*.5,Math.hypot(x-FAN[0],z-FAN[1]))*smooth(W.run*.45,W.run*.8,dRim(x,z))}});
  const TA=(t,a)=>[t*nrm[0]+a*u[0],t*nrm[1]+a*u[1]],RS=S.road,RP=[TA(RS.start[0],RS.start[1]),TA(RS.fan[0],RS.fan[1])];
  for(let i=0;i<=RS.legs;i++)RP.push(TA(RS.t0+i*(RS.t1-RS.t0)/RS.legs,(i%2?1:-1)*RS.amp));
  RP.push(TA(RS.top[0],RS.top[1]),TA(RS.end[0],RS.end[1]));
  const ROAD=lineFrame(RP);   /* the caravan road: up the fan, switchbacks on the ravine's scree floor (a pack track: KNOWN_ISSUES.md), over the rim */
  // the road's grade: the ground along its line, smoothed (it climbs from the foot to the rim)
  const RY=[];for(let s=0;s<=ROAD.L;s+=5){const p=ROAD.pt(s);RY.push(base(p[0],p[1]));}
  for(let k=0;k<6;k++)for(let i=1;i<RY.length-1;i++)RY[i]=(RY[i-1]+RY[i]*2+RY[i+1])/4;
  const roadY=s=>{const f=clamp(s/5,0,RY.length-1.001),i=Math.floor(f);return lerp(RY[i],RY[i+1],f-i);};
  let off=0;
  function land0(x,z){let g=base(x,z);const d=dRim(x,z);
   g+=FROST.h(x,z);
   if(d<0)g+=COL.relief(x,z,.25,.06)*smooth(0,-40,d);   /* the columns' tops on the plateau: the jointing in relief */
   const q=ROAD.at(x,z);if(q.d<14){const y=roadY(q.s);g=mix(y-.15,g,smooth(3.5,13,q.d));}
   return g;}
  off=S.base-land0(0,0);
  function land(x,z){return land0(x,z)+off;}
  return{land,water:()=>-1e9,SC,COL,FROST,ROAD,roadY:s=>roadY(s)+off,u,nrm,off,dRim,FAN,RV,farBase:W.floor+off,
   spine:[[0,0],[-1400,800],[1400,-600],[-600,1600],[600,-1600]].concat(RP.filter((p,i)=>i%3===0)),TA,RP};}
 if(SKEY==='pitfloor'){const M=S.maar,FL=S.base,RIM=S.rim;
  const PIT=KRELIEF.stepcut({disc:{c:[0,0],r:M.r},floor:FL,steps:M.steps,tread:M.tread,riser:M.riser,warp:{amp:M.warp,scale:1/420},seed:9821});
  const edgeR=M.r-PIT.edge;   /* the floor's own radius (the wall's foot, less the warp) */
  function sink(x,z){const r=Math.hypot(x,z);return RIM+10*smooth(M.r,2600,r)+14*n2(x,z,.0016,31)+3*n2(x,z,.012,32)+1500*smooth(2800,9000,r)+300*smooth(6000,14000,r)*n2(x,z,.0004,33);}
  function land(x,z){let g=sink(x,z);g=KRELIEF.shape(PIT,x,z,g);const r=Math.hypot(x,z);
   if(r<M.r){const w=smooth(edgeR+10,edgeR-120,r);
    g+=w*(1.4*n2(x,z,.006,34)+.4*n2(x,z,.05,35));
    g=Math.max(g,FL+32*Math.pow(smooth(edgeR-110,edgeR+30,r),1.4)*(.7+.6*KRAND.fbm(x*.01,.2,z*.01,2,36)));   /* the talus under the walls */
    const G=S.geyser,dg=Math.hypot(x-G.x,z-G.z);g+=6*smooth(55,5,dg)-1.5*smooth(5,0,dg);   /* the vent's sinter cone */
    for(const m of S.mud){const d=Math.hypot(x-m[0],z-m[1]);if(d<m[2]*1.5)g=mix(FL-.6,g,smooth(m[2]*.7,m[2]*1.5,d));}}
   return g;}
  function water(x,z){for(const m of S.mud)if(Math.hypot(x-m[0],z-m[1])<m[2]*.92)return FL-.15;return -1e9;}
  return{land,water,PIT,edgeR,sink,farBase:RIM,spine:[[0,0],[-700,-700],[700,700],[-700,700],[700,-700],[S.geyser.x,S.geyser.z],[S.camp.x,S.camp.z]]};}
 if(SKEY==='arete'){const P=S.pits.map((p,i)=>KRELIEF.stepcut({ell:{c:p.c,rx:p.rx,rz:p.rz,ry:0},floor:S.floor,steps:2,tread:22,riser:3,seed:9831+i}));
  function plateau(x,z){return S.base+16*n2(x,z,.0012,41)+4*n2(x,z,.009,42)+.7*n2(x,z,.12,43)+400*smooth(3000,9000,Math.abs(x))*n2(x,z,.0003,44);}
  function land(x,z){let g=plateau(x,z);for(const R of P)g=KRELIEF.shape(R,x,z,g);
   /* the pits' floors: breccia and ash in hummocks, a vent's warm ground in each */
   if(g<S.floor+2)g+=2.5*n2(x,z,.008,45)+.6*n2(x,z,.06,46);return g;}
  const crestZ=x=>{let lo=-60,hi=60;for(let k=0;k<26;k++){const m=(lo+hi)/2;KRELIEF.shape(P[0],x,m,0)<0?lo=m:hi=m;}return lo;};   /* the north pit's edge at x */
  return{land,water:()=>-1e9,P,plateau,farBase:S.floor,crestN:crestZ,
   crestW:x=>{const e=(R,z)=>KRELIEF.at(R,x,z)?1:0;let a=0,b=0;for(let z=0;z>-80&&!e(P[0],z);z-=.25)a=z;for(let z=0;z<80&&!e(P[1],z);z+=.25)b=z;return b-a;},
   spine:[[0,0],[-500,0],[500,0],[0,-1250],[0,1250],[-1500,0],[1500,0]]};}
 throw new Error('no station '+SKEY);})();
// THE GROUND AS DATA (core/terrain KFIELD): the land baked once on an 8 m lattice over the page's square (the Arete's knife-edge in a 0.5 m inset);
// the page, its fields and the export read the field. Past the square the far field reads the land itself (landH)
const FIELD_BOX=TERR.R*1.1;
const KF=(function(){const t0=performance.now(),S=FIELD_BOX;
 const F=KFIELD.bake(L.land,[-S,-S,S,S],8,{name:'siphon-'+SKEY,insets:SKEY==='arete'?[{box:[-900,-56,900,56],step:.5,name:'the knife-edge'}]:[]});
 window._field={ms:Math.round(performance.now()-t0),nx:F.nx,nz:F.nz,step:F.step,insets:(F.insets||[]).length};return F;})();
function landH(x,z){return L.land(x,z);}
function floor0(x){return L.farBase;}
function terrainH(x,z){return Math.abs(x)<=FIELD_BOX&&Math.abs(z)<=FIELD_BOX?KF.h(x,z):L.land(x,z);}
function waterH(x,z){return L.water(x,z);}

// ---------------------------------------------------------------- the climate fields (the field contract's units: core/biome/README.md)
//   cold    0..1 by height over the station's own snow line and its mean
//   wet     the braids' margins (station 1), the deck's damp floor (station 3); the rest dry
//   rock    the steeps: the walls, the risers, the knife-edge's flanks, the ravine
//   flat    level ground (the polygons' and the fields' ground)
//   deck    1 under the amber deck (station 3), 0 above it
//   geo     the vents' heat share, 0..1 (88-host-heat.js fills HEAT_AT from KTHERM)
function fieldsAt(x,z,h,slope){
 const w=waterH(x,z),wd=w>-1e8?0:1;let near=0;
 for(let k=0;k<8&&wd;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*25,z+Math.sin(a)*25)>-1e8){near=Math.max(near,.8);break;}}
 for(let k=0;k<8&&wd&&near<.8;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*70,z+Math.sin(a)*70)>-1e8){near=Math.max(near,.45);break;}}
 const rock=clamp(Math.max(smooth(.5,.82,slope),smooth(.35,.6,slope)*.45),0,1);
 const deck=SKEY==='pitfloor'?smooth(SITE.fog.top+20,SITE.fog.top-30,h):0;
 const wet=clamp(.16+.6*near+.45*deck+(SKEY==='terraces'?.12:0)-.2*rock+.06*n2(x,z,.002,131),0,1);
 return{wet,flow:0,upland:1,canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:clamp(.5+(h-SITE.snow[0])/1400+(SITE.temp.mean<3?.25:0),0,1),geo:0,barren:0,fog:deck,mist:0,flat:1-smooth(.06,.2,slope),deck};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','flat','deck'];
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
/* the ground's true slope at a point, from the field (FC's 14 m cells soften a 6 m knife-edge to nothing) */
const SLOPE_AT=(x,z)=>{const nn=KF.normal(x,z);return clamp(1-nn[1],0,1);};
let HEAT_AT=(x,z)=>SITE.soil;
FIELD.geo=(x,z)=>clamp((HEAT_AT(x,z)-SITE.soil)/60,0,1);

// ---------------------------------------------------------------- the air as fields (core/hazard's ambient bridge): the station's record, by height
// pressure by the model's air law from the station's own record (1.6 x e^(-h/8000) atm at the point's height); temperature by the model's lapse (6.5 per km)
// from the record's mean at its base. KHAZ.ambient's thin-air and cold rows read these, so the page's hazards read the corrected numbers
const AIR_LAW={p0:1.6,H:8000,lapse:.0065};
const AIR_P=(x,y,z)=>AIR_LAW.p0*Math.exp(-y/AIR_LAW.H);
const AIR_T=(x,y,z)=>SITE.temp.mean-AIR_LAW.lapse*(y-SITE.base);
/* given to KHAZ in 88 (core/hazard needs core/tags' vocabulary, loaded at 50) */

// ---------------------------------------------------------------- the host binding
function rootMask(x,z){const d=terrainH(x,z)-waterH(x,z);if(d<.15)return 0;return d<.7?(d-.15)/.55:1;}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=[];
BIO.init({tags:'siphon-pits',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:9800+SITE.zone,origin:L.spine,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:560,far:2400,floor:[180,440]},
 windows:{water:WBOX}});
BIO.setSun([-1000,1100,-500]);
