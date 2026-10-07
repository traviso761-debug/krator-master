// ================================================================= HOST — the land, the water, the layout, the fields, the binding (the cloud forest)
// The flank (45) cut: the ravines (the falls' gorges and plunge pools), the ridge and its saddle, the lee strip beyond it;
// the natives' trail as DATA; the water (the streams, the pools); the fields the kit reads (cached); BIO.init. Old ground:
// no lava in the record here (THRONE.ageAt: OLD).
const ageLabel=a=>a<1.5?Math.round(a*12)+' months':a<THRONE.OLD?Math.round(a)+' years':'no flow in the record';
_mark('stage');

// ---------------------------------------------------------------- the trail (data first)
// THE TRAIL: the natives' route up the flank through the elfin woods to the ridge's saddle, and over it to the lee. Its
// cairns are placed in 86. kind and owner are what the life layer reads (README.md: rules as data)
reseed(4741);
const TRAILS=(function(){const S=RIDGE.saddle,P=[],A=[-2350,-120],B=[S.x,RIDGE.zc(S.x)],C2=[S.x+60,2380];
 const leg=(a,b,amp,seed)=>{const n=Math.max(8,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/14));for(let k=P.length?1:0;k<=n;k++){const t=k/n,dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,w=amp*Math.sin(t*Math.PI)*(fbm(t*4,seed,4742,2)-.5)*2;P.push([mix(a[0],b[0],t)-dz/l*w,mix(a[1],b[1],t)+dx/l*w]);}};
 leg(A,B,160,1);leg(B,C2,30,2);
 return[{kind:'trail',owner:'the Throne\'s natives',width:1.0,name:'The cloud trail (up the flank, over the saddle)',pts:P}];})();
const PATHGRID=(function(){let a=1e9,b=1e9,c=-1e9,d=-1e9;TRAILS.forEach(T=>T.pts.forEach(p=>{a=Math.min(a,p[0]);b=Math.min(b,p[1]);c=Math.max(c,p[0]);d=Math.max(d,p[1]);}));
 const cs=1.5,x0=a-20,z0=b-20,NX=Math.ceil((c-a+40)/cs),NZ=Math.ceil((d-b+40)/cs),D=new Float32Array(NX*NZ).fill(99);
 const stamp=(P,w)=>{for(let i=1;i<P.length;i++){const p=P[i-1],q=P[i],L=Math.hypot(q[0]-p[0],q[1]-p[1]),n=Math.ceil(L/1.5);
  for(let s=0;s<=n;s++){const x=mix(p[0],q[0],s/n),z=mix(p[1],q[1],s/n),r=Math.ceil((w+5)/cs),ci=Math.round((x-x0)/cs),cj=Math.round((z-z0)/cs);
   for(let j=cj-r;j<=cj+r;j++)for(let ii=ci-r;ii<=ci+r;ii++){if(ii<0||j<0||ii>=NX||j>=NZ)continue;const dd=Math.hypot(x0+ii*cs-x,z0+j*cs-z)-w,k=j*NX+ii;if(dd<D[k])D[k]=dd;}}}};
 TRAILS.forEach(T=>stamp(T.pts,T.width));
 // 1.5 m cells, read bilinear: the trail is 1 m wide, so a coarser grid holds no negative distance inside it
 const at=(x,z)=>{const u=(x-x0)/cs,v=(z-z0)/cs,i=Math.floor(u),j=Math.floor(v);if(i<0||j<0||i>=NX-1||j>=NZ-1)return 99;const fu=u-i,fv=v-j,k=j*NX+i;
  return D[k]*(1-fu)*(1-fv)+D[k+1]*fu*(1-fv)+D[k+NX]*(1-fu)*fv+D[k+NX+1]*fu*fv;};
 return{at};})();

// ---------------------------------------------------------------- the land, cut
const ridged=(x,z,s)=>1-Math.abs(fbm(x,z,s,3)*2-1);
// the ridge: its rise over the flank at (x,z) (0 off it), and how far onto its lee (0 north of the crest .. 1 well beyond)
function ridgeAt(x,z){const dz=z-RIDGE.zc(x),Hr=ridgeCrest(x)-flankH(x,RIDGE.zc(x));
 const prof=dz<0?Math.pow(smooth(RIDGE.wN,0,-dz),1.6):Math.pow(smooth(RIDGE.wS,0,dz),.9);
 const crag=smooth(.55,1,prof)*7*ridged(x*.03,z*.03,4761);
 return{rise:Hr*prof+crag,lee:smooth(-10,120,dz),crest:smooth(.8,1,prof)};}
// a ravine at (x,z): the cut, how much is its floor (bed), the ravine
function ravAt(x,z){let cut=0,bed=0,V0=null;for(const V of RAVINES){const d=Math.abs(z-ravC(V,x));const dep=ravDepth(V,x);const wall=Math.max(4,dep*.22);if(d>V.w+wall*3)continue;
  let c=dep*smooth(V.w+wall,V.w,d)+2.5*smooth(V.w+wall*3,V.w+wall,d);
  // a plunge pool under each fall: a round pit two metres deep
  if(V.steps)for(const S of V.steps){const pd=Math.hypot(x-(S.x-9),z-ravC(V,S.x-9));if(pd<14)c+=2.2*smooth(13,4,pd);}
  if(c>cut){cut=c;V0=V;}bed=Math.max(bed,smooth(V.w*1.05,V.w*.6,d)*smooth(2450,2150,x));}
 return{cut,bed,V:V0};}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=flankH(x,z);const R=ridgeAt(x,z);h+=R.rise-22*smooth(0,320,z-RIDGE.zc(x)-RIDGE.wS);
 h-=ravAt(x,z).cut;
 const pd=PATHGRID.at(x,z);if(pd<1.5)h-=.12*smooth(1.5,-.4,pd);
 return h;}
// THE WATER: each ravine's stream on its floor; the plunge pools, each its own level
const POOLS=[];RAVINES.forEach(V=>(V.steps||[]).forEach((S,i)=>{const x=S.x-9,z=ravC(V,x);POOLS.push({x,z,r:11,key:V.key+'_pool'+i,name:'A plunge pool (under fall '+(i+1)+')'});}));
POOLS.forEach(P=>{let lo=1e9;for(let k=0;k<16;k++){const a=k/16*TAU;lo=Math.min(lo,terrainH0(P.x+Math.cos(a)*P.r*.95,P.z+Math.sin(a)*P.r*.95));}P.level=lo+.2;});
function waterH(x,z){const h=terrainH(x,z);
 for(const P of POOLS)if(Math.hypot(x-P.x,z-P.z)<P.r&&h<P.level)return P.level;
 for(const V of RAVINES){if(x>2150)continue;const d=Math.abs(z-ravC(V,x));if(d<V.w*.5)return h+.3;}
 return -1e9;}

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The world's and the Throne's (BIOME-API.md), and the cloud forest's: cforest (the elfin woods), cloud (how deep in the
// cloud: the lee's less), lee (beyond the ridge's crest: the drier heath), path
function fieldsAt(x,z,h,slope){const R=ridgeAt(x,z),rv=ravAt(x,z),pd=PATHGRID.at(x,z),path=smooth(1.5,-.5,pd);
 const rock=clamp(Math.max(smooth(.62,.9,slope),R.crest*smooth(.35,.6,slope)*.9),0,1),lee=R.lee;
 const floor=rv.bed*(1-smooth(.7,.9,slope));
 const cforest=(1-smooth(.12,.38,lee))*(1-floor*.85)*(1-rock*.85)*(1-path)*smooth(2550,2350,Math.hypot(x,z));
 return{wet:clamp(.9-.5*lee+.1*floor,0,1),flow:floor,upland:0,canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:.2,geo:0,barren:0,
  humid:1-.75*lee,plume:0,vent:0,acid:0,cinder:0,skylight:0,ash:0,owned:0,kedge:0,knear:0,field:0,clear:0,coast:0,edge:0,city:0,path,
  cforest,cloud:1-.5*lee,lee};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','humid','plume','vent','acid','cinder','skylight','ash','owned','kedge','knear','field','clear','coast','edge','city','path','cforest','cloud','lee'];
const FC=(function(){const N=480,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));_mark('fields');

// ---------------------------------------------------------------- the host binding
// THE MASK: nothing roots in the water or on the trail
const OBSTACLES=[];
const waterMask=(x,z)=>{const w=waterH(x,z);if(w>-1e8){const d=terrainH(x,z)-w;if(d<.7)return d<.15?0:(d-.15)/.55;}
 return smooth(-.2,.8,PATHGRID.at(x,z));};
let MASK=waterMask;
// the LOD spine: the trail, the falls, the saddle (the cloud hides what is farther: the LOD is short)
const SPINE=[];TRAILS.forEach(T=>{for(let i=0;i<T.pts.length;i+=8)SPINE.push(T.pts[i]);});
RAVINES.forEach(V=>(V.steps||[]).forEach(S=>SPINE.push([S.x,ravC(V,S.x)])));SPINE.push([RIDGE.saddle.x,RIDGE.zc(RIDGE.saddle.x)]);
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:45,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:190,mid:430,far:1500,floor:[180,420]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1]}});
BIO.setSun(SUN_POS);
