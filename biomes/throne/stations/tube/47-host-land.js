// ================================================================= HOST — the land, the fields, the binding (the lava tube)
// The ground the kit stands on is the tube's FLOOR (inside a tube) and the surface (everywhere else): terrainH answers
// whichever holds the point. The tube's walls and roof are drawn by 84 from the cross-section here (TUBEX). The fields the
// kit reads (cached at ~3 m: the tube is ~20 m wide), the mask (only the floors and the skylights' rims plant), BIO.init.
const FLOWS=THRONE.flowHistory({R:TERR.R+260,cell:16,baseH:surfH,flows:[],old:THRONE.OLD});
const ageLabel=a=>a<THRONE.OLD?Math.round(a)+' years':'no flow in the record';
_mark('stage');
// ---------------------------------------------------------------- the cross-section
// TUBEX(T,u,a): a point of the walls and roof at angle a (0 the right floor edge, PI/2 the roof's crown, PI the left): its
// lateral offset l and height v above the floor. Arched, a little wider at mid height, with FLOW LEDGES (a lip of ~1 m at two
// levels on both walls, where the lava once stood) and a rough skin
const LEDGES=[.26,.52];
function TUBEX(T,u,a){const W=T.W(u),H=T.H(u),c=Math.cos(a),s=Math.sin(a),v=H*Math.pow(s,.85);
 let l=W*c*(1+.16*s*(1-s)*2);
 const side=c<0?-1:1;let lip=0;for(const k of LEDGES){const hL=H*k*(1+.08*Math.sin(u*.013+k*9));lip+=Math.exp(-Math.pow((v-hL)/.38,2))*(1.0+.4*fbm(u*.03,k*7,161,2));}
 l-=side*lip*Math.min(1,Math.abs(c)*2.2);
 const j=1+.07*(fbm(u*.06,a*2.4+T.L,162,3)-.5)*2+.03*(fbm(u*.4,a*9,163,2)-.5)*2;
 return{l:l*j,v:v*(1+.04*(fbm(u*.05+3,a*3,164,2)-.5)),W,H};}
// the roof's height above the floor at lateral l (for the camera, and for what hangs from the roof)
const roofAt=(T,u,l)=>{const W=T.W(u),H=T.H(u),t=clamp(Math.abs(l)/W,0,1);return H*Math.pow(Math.max(0,1-t*t),.42);};
// ---------------------------------------------------------------- the floor
// old ropy lava, flat, a shallow fillet into the walls; under each skylight the BREAKDOWN PILE of the fallen roof; in the hot
// reach a channel down the middle where the lava stream runs
function pileAt(x,z){let h=0;for(const S of SKY){const d=Math.hypot(x-S.x,z-S.z);if(d<S.r*1.6)h=Math.max(h,(3.2+S.r*.18)*Math.pow(smooth(S.r*1.5,0,d),1.3)*(.8+.4*fbm(x*.08,z*.08,165,2)));}return h;}
const CHAN={hw:3.2,depth:1.4};
function floorRel(T,u,l,x,z){const W=T.W(u);let h=.25*(fbm(x*.15,z*.15,166,2)-.5)+.12*Math.sin(u*1.7+l*.4)*Math.sin(l*2.1)+.6*smooth(W*.72,W,Math.abs(l));
 if(T===TUBE){h+=pileAt(x,z);const hk=hotK(u);if(hk>0){const al=Math.abs(l+1.5*Math.sin(u*.03));h-=hk*CHAN.depth*smooth(CHAN.hw*1.3,CHAN.hw*.6,al);h+=hk*.6*Math.exp(-Math.pow((al-CHAN.hw*1.35)/.9,2));}}
 return h;}
// which tube holds (x,z), if any: {T,u,l}
function tubeAt(x,z){const a=TUBE.near(x,z);if(Math.abs(a.l)<=TUBE.W(a.u)&&a.u>=0&&a.u<=TUBE.L)return{T:TUBE,u:a.u,l:a.l};
 const b=SIDE.near(x,z);if(Math.abs(b.l)<=SIDE.W(b.u)&&b.u>3&&b.u<=SIDE.L)return{T:SIDE,u:b.u,l:b.l};return null;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){const t=tubeAt(x,z);if(t)return t.T.floor(t.u)+floorRel(t.T,t.u,t.l,x,z);return surfH(x,z);}
function waterH(x,z){return -1e9;}   // the lava stream is drawn by 86 (it is not water: nothing reads it as a shore)
// the lava stream's surface in the channel
const lavaY=u=>TUBE.floor(u)-CHAN.depth*.55;

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The world's and the Throne's (BIOME-API.md), the station's own: cave (a tube's floor, out of the light), skylight (the
// kit's: the floor under a skylight, in its light), hot (the hot reach), pile (a breakdown pile), rim (round a skylight's hole
// on the surface: the kit plants it as a gully, ferns and moss and a few trees leaning over the hole), humid (in the tube:
// the skylights' siphon trees want it). owned 1: the kit's open stages stand down
function fieldsAt(x,z,h,slope){const t=tubeAt(x,z);let cave=0,sky=0,hot=0,pile=0,rim=0;
 if(t){const W=t.T.W(t.u),inner=smooth(W,W-1.5,Math.abs(t.l));hot=t.T===TUBE?hotK(t.u):0;
  for(const S of SKY){const d=Math.hypot(x-S.x,z-S.z);sky=Math.max(sky,smooth(S.r*.95,S.r*.35,d));}
  pile=smooth(.6,2,pileAt(x,z));cave=inner*(1-hot)*(1-smooth(.35,.8,sky));sky*=inner*(1-hot);}
 else for(const S of SKY){const d=Math.hypot(x-S.x,z-S.z),R=skyR(S,Math.atan2(z-S.z,x-S.x));rim=Math.max(rim,smooth(R+.5,R+3,d)*smooth(R+20,R+9,d));}
 return{wet:t?.7:.3,flow:rim,upland:0,canyon:0,rim:0,rock:0,dune:0,oasis:0,slope,abyss:0,salt:0,cold:0,geo:0,
  barren:t?Math.max(hot,smooth(.5,.85,slope)):(1-rim),humid:t?.85:0,plume:.55,vent:0,acid:0,cinder:0,skylight:sky,ash:0,
  owned:1,kedge:0,knear:0,field:0,clear:0,coast:0,edge:0,city:0,path:0,cave,hot,pile,rimz:rim,intube:t?1:0};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','humid','plume','vent','acid','cinder','skylight','ash','owned','kedge','knear','field','clear','coast','edge','city','path','cave','hot','pile','rimz','intube'];
const FC=(function(){const N=900,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
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
// only the floors (not the hot reach, not a wall's foot) and the skylights' rims plant; exact, not the cached fields
let MASK=(x,z)=>{const t=tubeAt(x,z);if(t){if(t.T===TUBE&&hotK(t.u)>.2)return 0;return Math.abs(t.l)<t.T.W(t.u)-1.4?1:0;}
 for(const S of SKY){const d=Math.hypot(x-S.x,z-S.z),R=skyR(S,Math.atan2(z-S.z,x-S.x));if(d>R+1.5&&d<R+20)return 1;}return 0;};
// the LOD spine: down the tube, the passage, the skylights
const SPINE=[];for(let u=0;u<=TUBE.L;u+=100)SPINE.push(TUBE.P(u));for(let u=0;u<=SIDE.L;u+=60)SPINE.push(SIDE.P(u));SKY.forEach(S=>SPINE.push([S.x,S.z]));
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:51,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:260,mid:700,far:2400,floor:[230,560]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1]}});
BIO.setSun(SUN_POS);
