// ================================================================= HOST — stage: the Rift battery's station 1, the Gossan Strand (PLAN.md sections 5, 6 and 12; 2026-11-11)
// The ideal-type host: the renderer, the light, the land drawn from its site record (40: GALV_SITES), the climate fields, the water's levels and the biome
// core's binding. Started from biomes/highrift's stage (the same shape of page). A station's folder sets STATION_KEY (none yet); the default is the strand:
//   the strand  metal-rich sulfide mud at the terminal sea's level, falling ~3 m from the hills' foot to the sea floor (the model's 16 km compressed to ~4)
//   the hills   the XV savannah's foot rising ~150 m along the north edge (the far field carries them on)
//   the mounds  relict sulfide mounds of the vent field, gossan-capped, acid springs at their feet
//   the Deep    the vent's crater, its floor 100 m under the sea, hot brine to the sea's level, a low rim
//   the streams three acid streams from the mounds' springs to the sea, a shallow channel; past pH 2.8 their iron terraces (GALV_PHYS.stream)
//   the sea     the eastern terminal sea at the season's level (GALV_PHYS.level: ?day=<0-364> on the URL; the site's day by default, the dry season's low)
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
const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'strand',SITE=GALV_SITES[SKEY];
const STATION_REGION=SITE.name+' (the Rift battery, station 1; ideal type)';
const PQ=new URLSearchParams(location.search);
// THE SEASON: the day of the year sets the sea's level (the falling shoreline) and the store jars' charge; the page's day is the site's unless ?day= says
const DAY=PQ.has('day')?((+PQ.get('day'))%365+365)%365:SITE.day;
const SEA_LEVEL=SITE.sea+GALV_PHYS.level(DAY);

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
{BIO.INDEX_ITEMS=PQ.get('index')!=='0';BIO.LOD.merge=PQ.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&PQ.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&PQ.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT: 2.21 atm, +36 degC, humid: a white-hot hazy sky, the sun softened by the thick air (the sky binding sets the rest, 89)
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd9d2c4);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00022);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,16000);
scene.add(new THREE.HemisphereLight(0xe6dccc,0x8a6a52,.8));
const sun=new THREE.DirectionalLight(0xfff4e4,1.25);sun.position.set(-900,1200,-400);scene.add(sun);
const fill=new THREE.DirectionalLight(0xe8e0d8,.16);fill.position.set(700,300,900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:2600};
const SNOW_LINE=[1e5,1e5];   /* no snow on the Rift's floor */
const n2=(x,z,f,seed)=>fbm(x*f,z*f,seed,2)-.5;
// a polyline's frame: the nearest point's arc length s, its signed offset a (+ to the right going downstream) and its distance d
function polyFrame(P){const seg=[];let S=0;for(let k=0;k+1<P.length;k++){const A=P[k],B=P[k+1],dx=B[0]-A[0],dz=B[1]-A[1],L=Math.hypot(dx,dz);seg.push({A,B,ux:dx/L,uz:dz/L,L,s0:S});S+=L;}
 const at=(x,z)=>{let best=null;for(const g of seg){const px=x-g.A[0],pz=z-g.A[1],t=clamp(px*g.ux+pz*g.uz,0,g.L),qx=px-g.ux*t,qz=pz-g.uz*t,d=Math.hypot(qx,qz);
   if(!best||d<best.d)best={d,s:g.s0+t,a:px*g.uz-pz*g.ux};}return best;};
 const point=s=>{s=clamp(s,0,S);for(const g of seg)if(s<=g.s0+g.L+1e-9){const t=s-g.s0;return[g.A[0]+g.ux*t,g.A[1]+g.uz*t];}const g=seg[seg.length-1];return[g.B[0],g.B[1]];};
 return{seg,L:S,at,point};}
const ST=SITE.strand,HL=SITE.hills,DP=SITE.deep;
const MOUNDS=SITE.mounds.map((m,i)=>({i,x:m[0],z:m[1],r:m[2],h:m[3]}));
// the strand's own height: a straight fall from the hills' foot to the sea floor, a hand of relief (the cracked mud, old beach lines)
function strandY(x,z){return lerp(ST.y0,ST.y1,(z-ST.z0)/(ST.z1-ST.z0))+.12*n2(x,z,.004,11)+.05*n2(x,z,.03,12)+.06*Math.sin(z*.021+n2(x,z,.002,13)*6)*smooth(-600,400,z);}
// THE STREAMS: each a polyline frame, its spring's acid and the terraces' band from GALV_PHYS (the band starts where the pH crosses 2.8)
const STREAMS=SITE.streams.map((S,i)=>{const F=polyFrame(S.pts),sT=GALV_PHYS.streamAtPH(S,2.8);
 const bed0=s=>{const p=F.point(s);return strandY(p[0],p[1])-.45;};
 // the terraces: treads of ~20 m stepping down 0.12-0.2 m from sT to the dry season's shore (the wet season drowns the lowest)
 const T=[];{let s=Math.min(sT,F.L);let y=bed0(s)+.3;const W=8.5;
  while(s+20<F.L){const s1=s+18+4*Math.abs(Math.sin(s*.37+i));const yy=Math.min(y,bed0(s1)+.32);if(yy<SITE.sea-GALV_PHYS.SEA.amp+.1)break;T.push({s0:s,s1,y:yy,w:W});y=yy-.12-.06*Math.abs(Math.sin(s*.13+i*2));s=s1+2.5;}}
 const tread=s=>{for(const t of T)if(s>=t.s0-1.25&&s<=t.s1+1.25)return t;return null;};
 return Object.assign({},S,{i,F,sT,T,tread,bed0,w:6+2*i%3});});
function land(x,z){
 let h=strandY(x,z);
 // the hills north: the XV savannah's foot, rising ~150 m over 1.25 km, gullies down to each stream's head
 {const u=ST.z0-z;if(u>-80){const k=smooth(-80,1250,u);h+=HL.h*Math.pow(k,1.35)+18*n2(x,z,.0018,21)*k+5*n2(x,z,.009,22)*k;}}
 // the mounds: gossan-capped domes, their flanks steep, a flat cap, a moat of spring water at the foot
 for(const M of MOUNDS){const d=Math.hypot(x-M.x,z-M.z)/(M.r*(1+.18*n2(x,z,.012,30+M.i)));if(d<1.6){const dome=M.h*Math.pow(clamp(1-d*d,0,1),.55),cap=Math.min(dome,M.h*.86+.4*n2(x,z,.05,40+M.i));
   h+=cap+.8*smooth(1.6,1.05,d)*smooth(.95,1.05,d)-0.35*smooth(1.25,1.05,d)*smooth(.98,1.08,d);}}
 // THE DEEP: the crater, its floor 100 m under the sea; a rim of mud and mound rubble 3.5 m over the strand
 {const d=Math.hypot(x-DP.x,z-DP.z)/(DP.r*(1+.06*n2(x,z,.003,51)));
  if(d<1){const u=Math.pow(d,1.6);h=mix(DP.floor+8*n2(x,z,.01,52),SEA_LEVEL-1.5,smooth(.0,1,u))-24*smooth(.94,.72,d)*smooth(.25,.7,d);if(d>.9)h=mix(h,strandY(x,z)+DP.rim,smooth(.9,1,d));}
  else h+=DP.rim*smooth(1.45,1.0,d)*(1+.25*n2(x,z,.02,53));}
 // the streams' channels: a shallow cut in the mud, wider and deeper in the hills; the terraces' treads and their low rims
 for(const S of STREAMS){const q=S.F.at(x,z);if(q.d>40||q.s<=0&&q.d>8)continue;const hw=S.w/2,bed=S.bed0(q.s);
  const t=S.tread(q.s);if(t){const rim=t.y+.18;h=mix(Math.min(h,rim+.05*n2(x,z,.2,60)),h,smooth(t.w/2+3,t.w/2+12,q.d));if(q.d<t.w/2)h=t.y-.55;continue;}
  h=mix(Math.min(h,bed),h,smooth(hw,hw+8+4*smooth(ST.z0,ST.z0-600,z),q.d));}
 return h;}
// WATER LEVELS (the CPU twin of 89w): the sea at the season's level, the Deep's brine at the sea's, the streams a hand over their beds, the terraces' treads
function water(x,z){const h=land(x,z);
 {const d=Math.hypot(x-DP.x,z-DP.z);if(d<DP.r*.96)return SEA_LEVEL;}
 if(h<SEA_LEVEL&&z>ST.z0+600)return SEA_LEVEL;
 for(const S of STREAMS){const q=S.F.at(x,z);if(q.d>S.w)continue;const t=S.tread(q.s);if(t&&q.d<t.w/2)return t.y;if(!t&&q.d<S.w/2-.5){const y=S.bed0(q.s)+.3;if(y>SEA_LEVEL)return y;}}
 return -1e9;}
const L={land,water,STREAMS,MOUNDS,strandY,farBase:SITE.sea,
 spine:[[0,0],[DP.x,DP.z],[-1500,-300],[1200,-200],[0,-1500],[-800,900],[800,1300]].concat(MOUNDS.map(m=>[m.x,m.z]))};
function landH(x,z){return L.land(x,z);}
function floor0(x){return L.farBase;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=L.land(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){return L.water(x,z);}
// THE ACID (GALV_PHYS.stream on each stream; the mounds' springs and their oxidising ring): the pH the ground's water has at a point, 6.5 where none
// the strand itself is oxidising sulfide mud: its pores run at pH ~3.6 where the sea never lies long, rising to ~5.6 where the brine floods it (buffered)
// and to 6.5 on the hills (the savannah's soil, past the ore)
function PH_AT(x,z){const hill=smooth(ST.z0+40,ST.z0-160,z),fd=FLOOD_T(terrainH(x,z)-SITE.sea);let pH=mix(mix(3.6,5.6,smooth(40,160,fd)),6.5,hill);
 for(const S of STREAMS){const q=S.F.at(x,z);if(q.d<S.w*2.5){const p=GALV_PHYS.stream(Object.assign({},S,{s:q.s})).pH;pH=Math.min(pH,mix(p,6.5,smooth(S.w*.5,S.w*2.5,q.d)));}}
 for(const M of MOUNDS){const d=Math.hypot(x-M.x,z-M.z);if(d<M.r*3)pH=Math.min(pH,mix(2.1,6.5,smooth(M.r*.9,M.r*3,d)));}
 {const d=Math.hypot(x-DP.x,z-DP.z);if(d<DP.r*1.4)pH=Math.min(pH,mix(4.2,6.5,smooth(DP.r,DP.r*1.4,d)));}   /* the Deep's brine: acid-ish, metal-laden */
 return pH;}
// how many days a year a height lies under the sea (the flood line the life keeps above: GALV_PHYS.store)
/* floodDays depends on the height alone: a table at 1 cm over the swing (GALV_PHYS.floodDays, 365 steps, once) */
const FLOOD_T=(function(){const A=GALV_PHYS.SEA.amp,t=[];for(let k=0;k<=Math.round(A*200);k++)t.push(GALV_PHYS.floodDays(-A+k/100));return y=>y<=-A?365:y>=A?0:t[Math.round((y+A)*100)];})();
const FLOOD_AT=(x,z)=>FLOOD_T(terrainH(x,z)-SITE.sea);

// ---------------------------------------------------------------- the climate fields (the field contract's units: core/biome/README.md)
//   wet    the water's margins and the strand's damp low half; the hills dry
//   rock   the steeps: the mounds' flanks, the Deep's inner wall
//   salt   the strand below the year's highest water (the sea's salt crust)
//   acid   0..1 from the pH (PH_AT): 1 at pH 2, 0 from pH 5
//   flood  0..1: the share of the year the ground lies under the sea
function fieldsAt(x,z,h,slope){
 const w=waterH(x,z),wd=w>-1e8?0:1;let near=0;
 for(let k=0;k<8&&wd;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*20,z+Math.sin(a)*20)>-1e8){near=.8;break;}}
 const rock=clamp(Math.max(smooth(.45,.8,slope),smooth(.3,.55,slope)*.45),0,1),hill=smooth(ST.z0,ST.z0-400,z);
 const fl=FLOOD_T(h-SITE.sea)/365,low=smooth(SITE.sea+.9,SITE.sea-.2,h);
 const wet=clamp(.25+.55*near+.3*low-.35*hill-.2*rock+.05*n2(x,z,.002,131),0,1);
 return{wet,flow:0,upland:hill,canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:1,salt:clamp(low*(1-hill),0,1),cold:0,geo:0,barren:clamp(1-hill,0,1),fog:0,mist:0,flat:1-rock,
  acid:clamp((5-PH_AT(x,z))/3,0,1),flood:fl};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','flat','acid','flood'];
const FC=(function(){const N=360,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
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
/* the heat: 48-host-therm.js sets HEAT_AT from KTHERM's bake (the Deep's brine); until then the soil's */
let HEAT_AT=(x,z)=>SITE.soil;
FIELD.geo=(x,z)=>clamp((HEAT_AT(x,z)-SITE.soil)/30,0,1);

// ---------------------------------------------------------------- the host binding
// nothing roots in the water (the masts and reefs are placed in it on purpose, by the kit's own pass with root:false)
function rootMask(x,z){const d=terrainH(x,z)-waterH(x,z);if(d<.08)return 0;return d<.4?(d-.08)/.32:1;}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=[];
BIO.init({tags:'galvanic',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:4401,origin:L.spine,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:560,far:2400,floor:[160,420]},
 windows:{water:WBOX}});
BIO.setSun([-900,1200,-400]);
