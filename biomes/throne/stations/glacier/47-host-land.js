// ================================================================= HOST — the land, the fields, the binding (the glacier)
// No lava here (the flank under the ice is old). The bed: the flank's stepped profile, the spurs, the trough the ice has
// cut, the moraines, the lake's basin on the bench, the shelf, the caves' floors; the ice on it; the river's braids cut
// last. The fields the kit reads (cached), BIO.init.
const FLOWS=THRONE.flowHistory({R:TERR.R+260,cell:16,baseH:(x,z)=>PROF(uOf(x,z)),flows:[],old:THRONE.OLD});
const ageLabel=a=>a<THRONE.OLD?Math.round(a)+' years':'no flow in the record';
_mark('stage');
function spurAt(x,z,u,a){const A=SPUR.A(u);return A*(Math.exp(-Math.pow((a+GL.W(u)+SPUR.west)/170,2))+Math.exp(-Math.pow((a-GL.W(u)-SPUR.east)/190,2)));}
// the moraines: lateral (sharp crests just outside the ice, from the terminal arc up to the icefall) and terminal
function moraineAt(u,p,a){const W=GL.W(u),aa=Math.abs(a),tu=termU(p);
 const lat=(15+9*smooth(-300,1200,u))*Math.exp(-Math.pow((aa-W-38)/26,2))*smooth(1800,1300,u)*smooth(tu-10,tu+40,u);
 const term=TERM.h*Math.exp(-Math.pow((u-tu)/42,2))*(1-smooth(TERM.W0*1.5,TERM.W0*2.0,Math.abs(p-TERM.p0)))*(1-.92*Math.exp(-Math.pow((p-TERM.breach)/24,2)));
 return Math.max(lat,term);}
// the lake's basin: behind the terminal moraine, under the snout
const lakeK=(u,p,a)=>smooth(termU(p)+15,termU(p)+70,u)*smooth(GL.SNOUT+260,GL.SNOUT+60,u)*(1-smooth(GL.W(u)*.8,GL.W(u)*1.2,Math.abs(a)));
function bedH(x,z){const u=uOf(x,z),p=pOf(x,z),a=p-GL.pg(u),W=GL.W(u);
 let h=PROF(u)+22*(fbm(x*.0007,z*.0007,91,3)-.5)+6*(fbm(x*.003,z*.003,92,2)-.5)+spurAt(x,z,u,a);
 h-=GL.Dv(u)*(1-smooth(W*.85,W*1.55,Math.abs(a)))*smooth(TERM.u0-520,TERM.u0-60,u);
 h+=moraineAt(u,p,a)*(1+.25*(fbm(x*.02,z*.02,93,2)-.5));
 h-=9*lakeK(u,p,a);
 // the shelf: the slope eased into a broad step; the caves' floors levelled
 const ds=Math.hypot(x-SHELF.x,z-SHELF.z);if(ds<SHELF.r*1.4){const sh=PROF(SHELF.u)+.08*(u-SHELF.u)+4+3*(fbm(x*.01,z*.01,94,2)-.5);h=mix(h,sh,.75*smooth(SHELF.r*1.35,SHELF.r*.85,ds));}
 for(const C of CAVES){const d=Math.hypot(x-C.x,z-C.z);if(d<C.R*1.5)h=mix(h,C.floor==null?h:C.floor,smooth(C.R*1.4,C.R*1.0,d));}
 return h;}
// the ice: thickest down the middle, thinning to the margins; a cliff at the snout
function iceAt(x,z){const u=uOf(x,z);if(u<GL.SNOUT-2)return 0;const a=pOf(x,z)-GL.pg(u),W=GL.W(u),t=1-Math.pow(a/W,2);return t<=0?0:GL.T(u)*Math.pow(t,.62);}
CAVES.forEach(C=>{C.floor=null;C.floor=bedH(C.x,C.z);});
// THE RIVER: out through the breach and braiding down the flank (three channels apart below the moraine)
const BREACH_U=termU(TERM.breach);
const BRAIDS=[{o:u=>0,hw:9},{o:u=>34*Math.sin(u*.007+1),hw:6.5},{o:u=>-38*Math.sin(u*.0055+2),hw:7}];
const riverC=u=>TERM.breach+70*Math.sin(Math.max(0,BREACH_U-u)*.004),braidSp=u=>smooth(BREACH_U-100,BREACH_U-450,u);
// ITS LINE: the water's surface down the main channel, graded so it never climbs (the ground's bumps across the bench would
// have it run uphill: the owner's rule): at each step the lower of the ground there and the last surface less a fall
const RIV=(function(){const du=5,u0=BREACH_U,n=Math.ceil((u0+TERR.R*1.15)/du),t=new Float32Array(n+1);let prev=1e9;
 for(let i=0;i<=n;i++){const u=u0-i*du,c=upAt(u,riverC(u)),hc=bedH(c[0],c[1])-1.1;prev=Math.min(hc,prev-du*.004);t[i]=prev;}
 return u=>{const f=clamp((u0-u)/du,0,n-.001),i=Math.floor(f);return mix(t[i],t[i+1],f-i);};})();
// where (x,z) lies against the braids: d from the nearest active channel, its half-width, how much river is here
function riverAt(x,z){const u=uOf(x,z);if(u>BREACH_U+30)return{d:1e9,hw:1,k:0,e:0};const p=pOf(x,z),c=riverC(u),sp=braidSp(u);let d=1e9,hw=1;
 BRAIDS.forEach((B,i)=>{if(i&&sp<.05)return;const w=B.hw*(i?sp:1);if(w<.5)return;const di=Math.abs(p-(c+B.o(u)*(i?sp:1)))-w;if(di<d){d=di;hw=w;}});
 const e=smooth(BREACH_U+30,BREACH_U-5,u);return{d,hw,k:smooth(.6*hw,-.2*hw,d)*e,e};}
// the ground cut to it: the channel's bed under the water, the banks rising gently from just above it (a trench through a bump)
function riverCut(x,z,h){const R=riverAt(x,z);if(R.e<=0||R.d>400)return h;const s=RIV(uOf(x,z)),t=R.d<0?s-.45-.9*smooth(0,-.7*R.hw,R.d):s-.45+.9*smooth(0,7,R.d)+.1*Math.max(0,R.d-7);return mix(h,Math.min(h,t),R.e);}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH1(x,z){return bedH(x,z)+iceAt(x,z);}
function terrainH0(x,z){return riverCut(x,z,terrainH1(x,z));}
// the lake stands just under the breach's lip
const LAKE=(function(){return{level:RIV(BREACH_U)+.05,name:'The proglacial lake (milky with rock flour; ice calving into it)'};})();
const lakeAt=(x,z)=>{const u=uOf(x,z),p=pOf(x,z);return lakeK(u,p,p-GL.pg(u));};
function waterH(x,z){if(lakeAt(x,z)>.2)return LAKE.level;const r=riverAt(x,z);if(r.d<0&&r.e>.5)return RIV(uOf(x,z));return -1e9;}

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The world's and the Throne's (BIOME-API.md), and the station's own: ice (the glacier), lake, river, shelf, warm (round
// the fumaroles and in the caves: the warm living spots), cave; and the kit's: cbelt (the cold belt's woods), tundra (the
// moraines and the bare ground between: lichen, moss, a little grass), snow (how much lies: the kit dusts its trees by it).
// owned is 1 everywhere: the kit's open stages (its shoulder and plume woods) stand down, its cold passes plant instead
function warmAt(x,z){let w=0;for(const F of FUMS)w=Math.max(w,F.s*Math.exp(-Math.pow(Math.hypot(x-F.x,z-F.z)/40,2)));for(const C of CAVES)w=Math.max(w,smooth(C.R*1.1,C.R*.7,Math.hypot(x-C.x,z-C.z)));return clamp(w,0,1);}
function fieldsAt(x,z,h,slope){const u=uOf(x,z),p=pOf(x,z),a=p-GL.pg(u),ice=smooth(.3,3,iceAt(x,z)),lake=smooth(.15,.35,lakeAt(x,z)),R=riverAt(x,z),warm=warmAt(x,z);
 let cave=0;for(const C of CAVES)cave=Math.max(cave,smooth(C.R*1.05,C.R*.85,Math.hypot(x-C.x,z-C.z)));
 const ds=Math.hypot(x-SHELF.x,z-SHELF.z),shelf=smooth(SHELF.r*1.2,SHELF.r*.9,ds),mor=smooth(3,10,moraineAt(u,p,a));
 const steep=smooth(.6,.85,slope),rock=clamp(Math.max(steep,mor*.6,smooth(.4,.6,slope)*smooth(30,90,spurAt(x,z,u,a))),0,1);
 const n=fbm(x*.004,z*.004,95,2),cb=smooth(-1100,-1500,u)*(1-R.k)*(1-steep)*(1-lake);
 const snow=clamp(Math.max(ice*smooth(1250,1550,u),(1-ice)*(.82-.5*steep-.35*mor+.25*(n-.5))*(1-cb*.45)*(1-warm*.95)*(1-R.k))-lake,0,1);
 const tundra=(1-ice)*(1-lake)*(1-cb)*(1-R.k)*(1-steep*.8)*(1-shelf*.6)*smooth(1500,1100,u)*(.35+.65*mor);
 return{wet:.5,flow:0,upland:1,canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:1,geo:warm,barren:Math.max(ice,lake,R.k,cave),humid:0,plume:0,
  vent:0,acid:0,cinder:0,skylight:0,ash:0,owned:1,kedge:0,knear:0,field:0,clear:0,coast:0,edge:0,city:0,path:0,
  ice,lake,river:R.k,shelf,warm,cave,cbelt:cb,tundra,snow,moraine:mor,
  rivbank:R.e*smooth(150,14,R.d)*smooth(-2,8,R.d)*(1-ice),bar:R.e*smooth(18,3,R.d)};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','humid','plume','vent','acid','cinder','skylight','ash','owned','kedge','knear','field','clear','coast','edge','city','path','ice','lake','river','shelf','warm','cave','cbelt','tundra','snow','moraine','rivbank','bar'];
const FC=(function(){const N=600,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
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
// nothing roots on the ice, in the caves (the host plants their warm floors), or on an ice tower's foot
let MASK=(x,z)=>{if(iceAt(x,z)>.3)return 0;for(const C of CAVES)if(Math.hypot(x-C.x,z-C.z)<C.R*1.15)return 0;for(const T of TOWERS)if(Math.hypot(x-T.x,z-T.z)<T.r*1.3)return 0;return waterMask(x,z);};
// the LOD spine: down the glacier, the snout and the lake, the shelf, the river, the cold belt
const SPINE=[];for(let u=-2300;u<=2300;u+=600)SPINE.push(upAt(u,GL.pg(u)));
SPINE.push([SHELF.x,SHELF.z]);CAVES.forEach(C=>SPINE.push([C.x,C.z]));SPINE.push(upAt(GL.SNOUT-120,GL.pg(GL.SNOUT)));
for(let u=BREACH_U-200;u>-2500;u-=500)SPINE.push(upAt(u,riverC(u)));
SPINE.push(upAt(-1800,riverC(-1800)-260),upAt(-2100,riverC(-2100)+300),upAt(-1600,riverC(-1600)+420));
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:49,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:260,mid:700,far:2400,floor:[230,560]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1]}});
BIO.setSun(SUN_POS);
