// ================================================================= HOST — stage: the painted highlands' four stations (PLAN.md sections 2 and 7; 2026-11-11)
// The ideal-type host for one station: the renderer, the light, the land drawn from its site record (40: PAINTED_SITES), the station's strata stack
// (KSTRATA: `badland` under `danxia`, folded NNW-SSE; the same stack the ground's shader draws and the bloom's drifts read), the climate fields and
// the biome core's binding. Started from biomes/highrift's stage (the same shape of page). A station's folder sets STATION_KEY
// (stations/<name>/44z-host-site.js); the default page is station 1.
//   stripes  a hogback's dip slope in the west, its danxia scarp facing east, the breached fold's core below it: rounded banded badland hills cut by
//            rills, a dry wash (KRELIEF.wadi) down the strike valley, danxia fins standing out on the clay (KSTACKS, 86-host-stacks.js)
//   bloom    the playa flat in its syncline, gentle banded slopes round it, a hogback scarp to the west, a pigment pit (KRELIEF.pit)
//   canyon   the Painted Canyon across the page west to east: a floor with the melt stream, clay slopes to a bench at the contact, the danxia cliffs
//            stepped by their beds (KSTRATA's terrace) to the rims
//   cliff    the cliff town's wall rising south: tiers of clay slope, sandstone cliff and bench; the alcoves (KCARVE) at each contact (46-host-cliff.js)
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
const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'stripes',SITE=PAINTED_SITES[SKEY];
const STATION_REGION=SITE.name+' (the painted highlands, station '+SITE.n+'; ideal type)';

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT: 1.06-1.24 atm, dry (125-173 mm on the plateau): a deep sky and a hard sun on bare rock; the cliff town's wall is the wet, hazy edge
const scene=new THREE.Scene();const HAZE=new THREE.Color(SKEY==='cliff'?0xc8d0d8:0xd8dce2);scene.fog=new THREE.FogExp2(HAZE.getHex(),SKEY==='cliff'?.00012:.00008);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xcadcf0,0xb09a84,.74));
const sun=new THREE.DirectionalLight(0xffffff,1.3);sun.position.set(-900,1100,600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xe0e4f0,.18);fill.position.set(700,300,-900);scene.add(fill);

// ---------------------------------------------------------------- the rock: one stack for the station (KSTRATA; PLAN.md section 2)
const TERR={R:2600};
const SNOW_LINE=SITE.snow;
const NRM=[-PAINTED_STRIKE[1],PAINTED_STRIKE[0]];   /* across the strike, ENE: [.9239, -.3827] */
const across=(x,z)=>x*NRM[0]+z*NRM[1],along=(x,z)=>x*PAINTED_STRIKE[0]+z*PAINTED_STRIKE[1];
const STRATA_DATA=(function(){const S=SITE.strata,o={seed:4400+SITE.n,formations:S.formations,range:S.range,warp:S.warp||[3,1],wash:undefined};
 if(S.fold)o.fold={dir:PAINTED_STRIKE,wl:S.fold.wl,amp:S.fold.amp,sharp:S.fold.sharp,at:[NRM[0]*S.fold.crest,NRM[1]*S.fold.crest]};
 if(S.dip)o.dip=S.dip;return KSTRATA.create(o);})();
const STRATA_MID=(SITE.strata.range[0]+SITE.strata.range[1])/2;
/* the fold's lift of the beds at (x,z): + over an anticline (core: y - S.yy, the warp's few metres included) */
const foldD=(x,z)=>STRATA_MID-STRATA_DATA.yy(x,STRATA_MID,z);
/* the first contact (the badland's top) where the fold has put it */
const CONTACT0=SITE.strata.formations[0].top;
const contactAt=(x,z)=>CONTACT0+foldD(x,z);
const n2=(x,z,f,seed)=>fbm(x*f,z*f,seed,2)-.5;
const dflt=(v,d)=>v==null?d:v;
// THE ROUNDED CLAY HILLS (the Painted Hills' mounds): an elongated dome in each cell of a lattice, its centre, radii, strike and height KRAND-hashed by
// (station, cell), never by a stream of draws, merged by a soft maximum (k metres) so neighbours run together into ridges and saddles rather than
// standing as single bubbles; a ridged noise under them joins the ridges up. Rills cut down their flanks (rills)
function hills(x,z,cell,H,seed){let sum=0,mx=0;const i0=Math.floor(x/cell),j0=Math.floor(z/cell),k=H*.12;
 for(let j=j0-1;j<=j0+1;j++)for(let i=i0-1;i<=i0+1;i++){const kk=KRAND.hash(seed,i,j),u=q=>KRAND.unit(KRAND.hash(kk,q,0,seed));
  const cx=(i+.1+.8*u(1))*cell,cz=(j+.1+.8*u(2))*cell,a=u(5)*Math.PI,ca=Math.cos(a),sa=Math.sin(a),rx=cell*(.55+.6*u(3)),rz=cell*(.32+.3*u(6)),hh=H*(.3+.7*u(4));
  const dx=x-cx,dz=z-cz,p=(dx*ca+dz*sa)/rx,q=(-dx*sa+dz*ca)/rz,d2=p*p+q*q;
  const h=d2<1?hh*Math.pow(1-d2,1.25):0;mx=Math.max(mx,h);sum+=Math.exp((h-H)/k);}
 const soft=H+k*Math.log(Math.max(sum,1e-9));
 const ridge=1-Math.abs(2*fbm(x*.0045,z*.0045,seed%997,2)-1);
 return Math.max(mx,soft)*.85+H*.32*ridge*ridge;}
function rills(x,z,amp){const r=Math.abs(fbm(x*.045,z*.045,77,2)-.5),r2=Math.abs(fbm(x*.11+5,z*.11,78,2)-.5);return amp*(smooth(.07,0,r)+.5*smooth(.05,0,r2));}
// the danxia scarp facing east over the fold's core: the dip slope (the sandstone's top bed) west of the rim, a sheer cap of sandstone to the
// contact, a clay slope below it to the floor. u: across the strike; the rim wanders along the strike
function scarpH(x,z,dip,floor,sc){const u=across(x,z),v=along(x,z),us=sc.u+110*n2(v,0,.0012,61)+40*n2(v,0,.006,62)+90*smooth(.62,.8,fbm(v*.004,3,63,2));
 const d=u-us;if(d<=0)return dip;const C=contactAt(x,z),cap=Math.max(6,dip-C+4);
 const hc=dip-Math.min(cap,d*3.2)-Math.max(0,d-cap/3.2)*.78;return Math.max(floor,hc);}
const L=(function(){const S=SITE;
 if(SKEY==='stripes'){const V=S.valley,W=S.wash;
  const dip=(x,z)=>contactAt(x,z)+S.scarp.cap+6*n2(x,z,.003,11)-9*smooth(.55,.75,fbm(x*.006,z*.0025,12,2))*smooth(-200,-1200,across(x,z));   /* gullies down the dip */
  const floor0=(x,z)=>V.floor+10*n2(x,z,.0012,13)+.012*along(x,z);
  const valley=(x,z)=>{const hl=hills(x,z,V.cell,V.hills,4411);return floor0(x,z)+hl-rills(x,z,1.6)*smooth(2,10,hl);};
  /* the wash down the strike valley (KRELIEF.wadi), downstream to the south-south-east */
  const wpts=[];for(let v=3000;v>=-3000;v-=60){const u=W.u+90*Math.sin(v*.0021+.4)+30*Math.sin(v*.0067);wpts.push([NRM[0]*u+PAINTED_STRIKE[0]*v,NRM[1]*u+PAINTED_STRIKE[1]*v]);}
  const WADI=KRELIEF.wadi({pts:wpts,ground:floor0,w:W.w,bank:W.bank,bankW:14,seed:4412});
  function land(x,z){let h=scarpH(x,z,dip(x,z),valley(x,z),S.scarp);
   h=KRELIEF.shape(WADI,x,z,h);return h;}
  return{land,dip,valley,floor0,WADI,wpts,farBase:2870,spine:[[0,0],[NRM[0]*S.scarp.u,NRM[1]*S.scarp.u],[NRM[0]*W.u,NRM[1]*W.u],[-1600,600],[1500,-600]].concat(WADI.pools.filter(p=>Math.abs(p.x)<2400&&Math.abs(p.z)<2400).map(p=>[p.x,p.z]))};}   /* the melt pools: the export's box and the near detail */
 if(SKEY==='bloom'){const P=S.playa;
  const eD=(x,z)=>Math.hypot((x-P.x)/P.rx,(z-P.z)/P.rz)*(1+.08*n2(x,z,.0015,21));
  const dip=(x,z)=>contactAt(x,z)+S.scarp.cap+5*n2(x,z,.003,22);
  function slopes(x,z){const e=eD(x,z);let h=P.level+.25*n2(x,z,.01,23)-.4*smooth(.9,.2,e);
   h+=P.rise*P.rx*Math.max(0,e-1)*(1+.6*n2(x,z,.002,24))+38*smooth(1.05,1.9,e)*n2(x,z,.0018,25);
   h+=hills(x,z,170,34,4421)*smooth(1.15,1.6,e);
   h-=rills(x,z,1.2)*smooth(1.2,1.6,e);return h;}
  const PIT=KRELIEF.pit?KRELIEF.pit({c:[S.pit.x,S.pit.z],r:S.pit.r,depth:S.pit.depth,benches:2,ground:slopes,spoil:true,adits:0,seed:4423}):null;
  function land(x,z){let h=scarpH(x,z,dip(x,z),slopes(x,z),S.scarp);if(PIT)h=KRELIEF.shape(PIT,x,z,h);return h;}
  return{land,eD,PIT,farBase:3380,spine:[[P.x,P.z],[S.pit.x,S.pit.z],[NRM[0]*S.scarp.u,NRM[1]*S.scarp.u]].concat(S.circles.map(c=>[c[0],c[1]]))};}
 if(SKEY==='canyon'){const K=S.canyon;
  const cz=x=>.154*x+140*Math.sin(x*.0011+.6)+45*Math.sin(x*.0037+1.2);   /* the canyon's line, west to east, falling east */
  const fl=x=>K.floor-K.drop*x/2600;
  const rimH=(x,z)=>{const a=z-cz(x);return (a<0?K.rimN:K.rimS)+.022*Math.max(0,Math.abs(a)-700)+14*n2(x,z,.002,31)+4*n2(x,z,.01,32);};
  function land(x,z){const a=z-cz(x),aa=Math.abs(a),hw=K.floorW/2*(1+.25*n2(x,0,.003,33)),f=fl(x),top=rimH(x,z),C=contactAt(x,z);
   if(aa<K.w/2+2)return f-.35*smooth(K.w/2+2,K.w/2-1,aa);   /* the stream's bed */
   if(aa<=hw)return f+.8*smooth(hw*.4,hw,aa)+.5*n2(x,z,.03,34)*smooth(K.w/2+2,K.w/2+8,aa);
   // the clay slope from the floor to the contact (40 degrees), the bench at the contact, the danxia cliff stepped by its beds to the rim
   const d=aa-hw,slope=f+.84*d+rills(x,z,1.4)*smooth(4,30,d)*-1+2.5*n2(x,z,.02,35),benchW=K.benchW*(1+.4*n2(x,0,.004,36+(a>0?1:0)));
   if(slope<C)return slope;
   const d0=(C-f)/.84,db=d-d0;if(db<benchW)return C+.06*db+1.5*n2(x,z,.02,37);
   const cliff=C+.06*benchW+(db-benchW)*3.1;if(cliff<top)return STRATA_DATA.terrace(x,z,cliff,.75);
   return top;}
  return{land,cz,fl,rimH,farBase:3200,spine:[[0,cz(0)],[-1500,cz(-1500)],[1500,cz(1500)],[0,cz(0)-700],[0,cz(0)+700]]};}
 if(SKEY==='cliff'){const T=S.tiers,F=SITE.strata.formations;
  /* the contacts (each badland's top, each danxia's top) up the wall, bottom to top */
  const BOT=[],TOP=[];for(let i=0;i<F.length;i++){if(F[i].recipe==='danxia'){BOT.push(F[i-1].top);TOP.push(F[i].top);}}
  // the profile along z (south up the wall): the clay slope at ~32 degrees to the contact, the sandstone cliff (~74 degrees) to its tier's top, a
  // bench back from the lip, then the next clay slope; the rim plateau past the last tier. Each tier's lip wanders along x
  const zw=(x,i)=>T[i].z+70*n2(x,i,.0014,41+i)+25*n2(x,i,.007,51+i);
  function prof(x,z){let h=S.foot+.12*(z+2600);
   for(let i=0;i<T.length;i++){const z0=zw(x,i),C=BOT[i]+foldD(x,z)*0,top=Math.min(T[i].top,TOP[i]),cl=top-C,run=cl/3.4;
    /* the clay below this tier's cliff: from the last bench up to the contact */
    const zc=z0-run;if(z<zc){h=Math.min(Math.max(h,C-(zc-z)*.62),C);break;}
    if(z<z0){h=STRATA_DATA.terrace(x,z,C+(z-zc)*3.4,.6);break;}
    h=top+(z-z0)*.05;   /* the bench */
    if(i===T.length-1)h=top+Math.max(0,z-z0)*.03;}
   return h;}
  /* past the page's west edge the wall's foot falls to the canyon's mouth lake (516 m): the land blends to its bed over the last 1.5 km */
  const Lk=S.lake;function land(x,z){const h=prof(x,z)+3*n2(x,z,.01,43),d=Math.hypot(x-Lk.x,z-Lk.z);
   return d>Lk.r*1.35?h:mix(Lk.level-22+30*smooth(Lk.r*.7,Lk.r,d),h,smooth(Lk.r*1.0,Lk.r*1.35,d));}
  return{land,prof,zw,BOT,TOP,farBase:1500,spine:[[0,0],[0,-1800],[0,1200],[-1500,0],[1500,0]].concat(T.map((t,i)=>[0,zw(0,i)]))};}
 throw new Error('no station '+SKEY);})();
function landH(x,z){return L.land(x,z);}
function floor0(x){return L.farBase;}
// THE CLIFF SITES (46-host-cliff.js) fold KCARVE's recess into the ground; CARVE_FOLD is the identity until then
let CARVE_FOLD=null;
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;let h=L.land(x,z);if(CARVE_FOLD)h=CARVE_FOLD(h,x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the water the stage knows analytically: the canyon's melt stream, the wash's pools after the melt (none drawn on a dry page), the playa's melt sheet
let WATER_AT=null;
function waterH(x,z){return WATER_AT?WATER_AT(x,z):-1e9;}

// ---------------------------------------------------------------- the climate fields (the field contract's units: core/biome/README.md)
//   cold    0..1 by height over the station's own snow line
//   wet     the water's margins, the wash's floor, the playa (melt), the seeps; the rest dry (125-173 mm on the plateau; 862 mm on the cliff wall)
//   rock    the steeps: the scarps, the canyon's cliffs, the fins
//   bare    the badland clay exposed (the rounded hills and every slope over ~15 degrees): the beds show, almost nothing grows (PLAN.md section 4, `bare`)
//   flow    a wash's or the canyon's floor (the bloom's drifts and the flood)
//   flat    the playa (station 2)
//   rim     a scarp's or the canyon's lip
function fieldsAt(x,z,h,slope){
 let flow=0,flat=0,rim=0,canyon=0,wet0=SKEY==='cliff'?.42:.12;
 if(SKEY==='stripes'){const a=KRELIEF.at(L.WADI,x,z,L.floor0(x,z));if(a&&(a.part==='floor'||a.part==='bar'||a.part==='pool'))flow=1;else if(a&&a.part==='bank')flow=.5;
  const us=across(x,z)-SITE.scarp.u;rim=smooth(-120,-20,us)*smooth(60,0,us);}
 if(SKEY==='bloom'){const e=L.eD(x,z);flat=smooth(1.04,.96,e);rim=smooth(.95,1.15,e)*smooth(1.6,1.2,e);}
 if(SKEY==='canyon'){const a=Math.abs(z-L.cz(x));canyon=smooth(900,600,a);flow=smooth(SITE.canyon.floorW*.6,SITE.canyon.floorW*.3,a);rim=smooth(520,640,a)*smooth(900,700,a);}
 const rock=clamp(smooth(.55,.85,slope),0,1);
 const bare=clamp(Math.max(smooth(.26,.42,slope),SKEY==='stripes'?smooth(2860,2890,h)*smooth(.06,.14,slope):0)*(1-flow)*(1-flat),0,1);
 const wet=clamp(wet0+.55*flow+.4*flat+.1*rim-.15*rock+.05*n2(x,z,.002,131),0,1);
 return{wet,flow,upland:1,canyon,rim,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:clamp(.35+(h-SITE.snow[0])/1600+(SITE.temp.cold<-2?.15:0),0,1),geo:0,barren:0,fog:0,mist:0,flat,bare};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','flat','bare'];
const FC=(function(){const N=400,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=L.land((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const Lc={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==Lc.x||z!==Lc.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);Lc.x=x;Lc.z=z;Lc.k=j*N+i;Lc.fu=u-i;Lc.fv=v-j;}
  const k=Lc.k,fu=Lc.fu,fv=Lc.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));

// ---------------------------------------------------------------- the host binding
// nothing roots in the water, on a fin (86) or in a cliff site kept bare (46: KMASK)
let KEEP_BARE=null;   /* (x,z) -> 0 where the cliff sites, the pit and the stone circles keep the ground bare (46-host-cliff.js) */
let ON_STACK=null;    /* (x,z) -> true inside a fin's footprint (86-host-stacks.js) */
function rootMask(x,z){const d=terrainH(x,z)-waterH(x,z);if(d<.15)return 0;if(ON_STACK&&ON_STACK(x,z))return 0;const k=KEEP_BARE?KEEP_BARE(x,z):1;if(k<=0)return 0;return (d<.7?(d-.15)/.55:1)*k;}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=[];
BIO.init({tags:'paintedhighlands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:200+SITE.n,origin:L.spine,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:560,far:2400,floor:[180,440]},
 windows:{water:WBOX}});
BIO.setSun([-900,1100,600]);
