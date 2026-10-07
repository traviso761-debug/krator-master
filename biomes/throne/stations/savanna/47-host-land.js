// ================================================================= HOST — the land, the water, the fields, the binding (the savanna)
// The flank (45) cut: the fan raised a little and laid with gravel, its braided channels, the kopjes, the dongas; the dry
// season's pools in the channels; the fields the kit reads (cached); BIO.init. Old ground: no lava in the record here.
const ageLabel=a=>a<1.5?Math.round(a*12)+' months':a<THRONE.OLD?Math.round(a)+' years':'no flow in the record';
_mark('stage');
const ridged=(x,z,s)=>1-Math.abs(fbm(x,z,s,3)*2-1);
// a channel at (x,z): the deepest cut there, and how much of a channel floor it is
function chanAt(x,z){let cut=0,bed=0,C0=null;for(const C of CHANNELS){const d=Math.abs(x-C.x(z));if(d>C.w*2.2)continue;const c=C.d*smooth(C.w*1.6,C.w*.7,d);if(c>cut){cut=c;C0=C;}bed=Math.max(bed,smooth(C.w,C.w*.5,d));}
 return{cut,bed,C:C0};}
function kopjeAt(x,z){let h=0,k=0;for(const K of KOPJES){const d=Math.hypot(x-K.x,z-K.z);if(d>K.r*1.4)continue;const p=smooth(K.r*1.3,0,d);h=Math.max(h,K.h*Math.pow(p,1.4)*(.75+.5*ridged(x*.08,z*.08,4771)));k=Math.max(k,smooth(K.r*1.15,K.r*.6,d));}return{h,k};}
function dongaAt(x,z){let cut=0,bed=0;for(const D of DONGAS){const d=Math.abs(x-D.cx(z)),dep=D.d*smooth(-2600,-1800,z);if(d>D.w*3)continue;cut=Math.max(cut,dep*smooth(D.w*2.6,D.w*.8,d));bed=Math.max(bed,smooth(D.w,D.w*.5,d)*smooth(-2600,-1800,z));}return{cut,bed};}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=flankH(x,z);const f=fanIn(x,z);
 // the fan: laid up a little over the flank (a lahar's deposit), bars and swales on it, the channels cut into it
 h+=f*(1.4+.8*(fbm(x*.02,z*.02,4772,2)-.5));h-=f*chanAt(x,z).cut;
 h+=kopjeAt(x,z).h;h-=dongaAt(x,z).cut;
 for(const P of POOLS){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r*1.4)h-=1.1*smooth(P.r*1.3,P.r*.3,d);}
 return h;}
// THE POOLS: the dry season's water left in the channels' deeper reaches (each its own level)
const POOLS=(function(){reseed(4532);const o=[];for(let k=0;k<200&&o.length<16;k++){const C=pick(CHANNELS),z=rr(-2300,2300),x=C.x(z);if(fanIn(x,z)<.8)continue;if(o.some(p=>Math.hypot(p.x-x,p.z-z)<160))continue;o.push({x,z,r:rr(5,12),key:'pool'+o.length,name:'A dry-season pool in a channel'});}return o;})();
POOLS.forEach(P=>{let lo=1e9;for(let k=0;k<16;k++){const a=k/16*TAU;lo=Math.min(lo,terrainH0(P.x+Math.cos(a)*P.r*1.1,P.z+Math.sin(a)*P.r*1.1));}P.level=lo-.15;});
function waterH(x,z){for(const P of POOLS){if(Math.hypot(x-P.x,z-P.z)<P.r*1.25&&terrainH(x,z)<P.level)return P.level;}return -1e9;}

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The world's and the Throne's (BIOME-API.md), and the savanna's: savanna (the tall grass), capwood (the gill-parasol
// woods), braid (the fan: its bars and channel margins), burn (the fresh fire scar), bar (gravel bare of grass)
function fieldsAt(x,z,h,slope){const f=fanIn(x,z),ch=chanAt(x,z),kp=kopjeAt(x,z),dg=dongaAt(x,z);
 const rock=clamp(Math.max(kp.k*smooth(.3,.6,slope),smooth(.6,.9,slope)),0,1);
 const woods=smooth(.56,.66,fbm(x*.0016+7,z*.0016-3,4781,3))*(1-f)*(1-kp.k);
 const burn=burnAt(x,z)*(1-f)*(1-kp.k*.6);
 const bar=f*clamp(ch.bed+smooth(.55,.75,fbm(x*.03,z*.03,4782,2))*.6,0,1);
 const braid=f*(1-ch.bed*.85),sav=(1-f)*(1-woods)*(1-rock*.8)*(1-dg.bed*.6);
 return{wet:clamp(.3+.4*ch.bed*f+.3*dg.bed,0,1),flow:dg.bed,upland:0,canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:0,geo:0,barren:0,
  humid:.3,plume:0,vent:0,acid:0,cinder:0,skylight:0,ash:0,owned:0,kedge:0,knear:0,field:0,clear:0,coast:0,edge:0,city:0,path:0,
  savanna:sav,capwood:woods,braid,burn,bar,fan:f,kopje:kp.k};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','humid','plume','vent','acid','cinder','skylight','ash','owned','kedge','knear','field','clear','coast','edge','city','path','savanna','capwood','braid','burn','bar','fan','kopje'];
const FC=(function(){const N=520,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
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
const OBSTACLES=[];
const waterMask=(x,z)=>{const w=waterH(x,z);if(w>-1e8){const d=terrainH(x,z)-w;if(d<.7)return d<.15?0:(d-.15)/.55;}return 1;};
let MASK=waterMask;
// the LOD spine: the fan's middle, the woods, the burn, the kopjes, the pools
const SPINE=[[FAN.cx(-1200),-1200],[FAN.cx(0),0],[FAN.cx(1200),1200],[BURN.x,BURN.z],[-900,-300],[-1500,600],[600,-1200]];
KOPJES.forEach(K=>SPINE.push([K.x,K.z]));POOLS.slice(0,6).forEach(P=>SPINE.push([P.x,P.z]));
// and where the cameras stand in the grass (the tall grass is thick only near the spine)
SPINE.push([-900,500],[-860,-100],[200,2250],[-500,1500],[FAN.cx(-300)-FAN.W(-300)*1.3,-50]);
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:46,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:240,mid:560,far:2400,floor:[230,560]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1]}});
BIO.setSun(SUN_POS);
