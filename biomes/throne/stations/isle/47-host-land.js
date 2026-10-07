// ================================================================= HOST — the land, the water, the layout, the fields, the binding (the isle)
// The dome (45) cut: the basin's hollow on the crown with its mounds and spring pits, the gullies and the creek, the
// lagoon; then the natives' trail and camp as DATA, the water (the sea, the springs, the streams, the lagoon), the
// fields the kit reads (cached), and BIO.init. No lava in the record here: the isle's ground is old (THRONE.ageAt: OLD).
const ageLabel=a=>a<1.5?Math.round(a*12)+' months':a<THRONE.OLD?Math.round(a)+' years':'no flow in the record';
_mark('stage');

// ---------------------------------------------------------------- the layout: the camp and the trail (data first)
// THE CAMP: the natives' resin-tappers' camp on the warm ground at the basin's west side (the grove); THE LANDING: their
// canoes drawn up on the west beach; THE TRAIL from the landing up through the woods to the camp, and on into the basin to
// the Great Geyser. kind and owner are what the life layer reads (README.md: rules as data)
const CAMP=(function(){const p=bxz(-150,-300);return{x:p[0],z:p[1],r:22,name:'The resin-tappers\' camp',culture:'throne-natives',owner:'the isle\'s natives'};})();
const LANDING=(function(){const a=2.75,d=isleR(a)*.985;return{a,x:DOME.cx+Math.cos(a)*d,z:DOME.cz+Math.sin(a)*d,name:'The landing (the natives\' canoes)'};})();
reseed(4741);
const TRAILS=(function(){const mk=(A,B,amp,seed,width,name)=>{const P=[],n=Math.max(8,Math.round(Math.hypot(B.x-A.x,B.z-A.z)/14));
  for(let k=0;k<=n;k++){const t=k/n,dx=B.x-A.x,dz=B.z-A.z,l=Math.hypot(dx,dz)||1,w=amp*Math.sin(t*Math.PI)*(fbm(t*4,seed,4742,2)-.5)*2;P.push([mix(A.x,B.x,t)-dz/l*w,mix(A.z,B.z,t)+dx/l*w]);}
  return{kind:'trail',owner:'the isle\'s natives',width,name,pts:P};};
 const G=GEYSERS[0];
 return[mk(LANDING,CAMP,90,1,1.2,'The trail from the landing to the camp'),mk(CAMP,{x:G.x-G.mound*1.1,z:G.z},25,2,1.0,'The path into the basin')];})();
const PATHGRID=(function(){const cs=3,x0=-2200,N=Math.ceil(4400/cs),d=new Float32Array(N*N).fill(99);
 const stamp=(P,w)=>{for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/1.5);
  for(let s=0;s<=n;s++){const x=mix(a[0],b[0],s/n),z=mix(a[1],b[1],s/n),r=Math.ceil((w+5)/cs),ci=Math.round((x-x0)/cs),cj=Math.round((z-x0)/cs);
   for(let j=cj-r;j<=cj+r;j++)for(let ii=ci-r;ii<=ci+r;ii++){if(ii<0||j<0||ii>=N||j>=N)continue;const dd=Math.hypot(x0+ii*cs-x,x0+j*cs-z)-w;const q=j*N+ii;if(dd<d[q])d[q]=dd;}}}};
 TRAILS.forEach(T=>stamp(T.pts,T.width));
 const at=(x,z)=>{const i=Math.round((x-x0)/cs),j=Math.round((z-x0)/cs);if(i<0||j<0||i>=N||j>=N)return 99;return d[j*N+i];};
 return{at};})();

// ---------------------------------------------------------------- the land, cut
// a gully's floor: distance to its line (the bed level falls with the dome); its depth fades in from its head
GULLIES.forEach(g=>{let a=1e9,b=1e9,c=-1e9,d=-1e9;g.pts.forEach(p=>{a=Math.min(a,p[0]);b=Math.min(b,p[1]);c=Math.max(c,p[0]);d=Math.max(d,p[1]);});const m=g.w*3.3;g.bb=[a-m,b-m,c+m,d+m];});
function gullyAt(x,z){let cut=0,bed=0,G=null;for(const g of GULLIES){if(x<g.bb[0]||z<g.bb[1]||x>g.bb[2]||z>g.bb[3])continue;const d=segD(x,z,g.pts);if(d>g.w*3.2)continue;
  const head=g.warm?1:smooth(0,5,Math.hypot(x-g.pts[0][0],z-g.pts[0][1])/40),c=g.d*head*smooth(g.w*3,g.w*.6,d);if(c>cut){cut=c;G=g;}bed=Math.max(bed,smooth(g.w*1.1,g.w*.5,d)*head);}
 return{cut,bed,G};}
// the basin: its floor, falling a little toward the outlet; a mound under each geyser; each spring a pit
function basinFloor(x,z){const t=((x-BASIN.x)*(OUTLET.x-BASIN.x)+(z-BASIN.z)*(OUTLET.z-BASIN.z))/Math.pow(Math.hypot(OUTLET.x-BASIN.x,OUTLET.z-BASIN.z),2);
 return domeH(BASIN.x,BASIN.z)-BASIN.depth-2.2*clamp(t,-1,1)+.5*(fbm(x*.03,z*.03,4551,2)-.5);}
// the runoff's terraces: below the Prismatic Spring the sinter steps down in low scalloped rims (0.35 m a step)
const TERR_STEP=.35;
function terraceAt(x,z,h){const d=segD(x,z,RUNOFF[0].pts),k=smooth(28,10,d)*smooth(POOLS[0].r*1.1,POOLS[0].r*1.6,Math.hypot(x-POOLS[0].x,z-POOLS[0].z));if(k<=0)return h;
 const q=(h+fbm(x*.08,z*.08,4552,2)*.4)/TERR_STEP,fl=Math.floor(q),fr=q-fl;return mix(h,(fl+smooth(.75,1,fr))*TERR_STEP,k);}
const ridged=(x,z,s)=>1-Math.abs(fbm(x,z,s,3)*2-1);
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=domeH(x,z);
 const e=basinE(x,z);if(e<1.35){const f=basinFloor(x,z);h=mix(h,Math.min(h,f),smooth(1.3,.92,e));
  if(e<1.05){for(const G of GEYSERS){const d=Math.hypot(x-G.x,z-G.z);if(d<G.mound*1.2)h+=G.mh*Math.pow(smooth(G.mound*1.15,0,d),1.4);}
   h=terraceAt(x,z,h);
   for(const P of POOLS){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r*1.6)h-=(1.2+P.r*.12)*smooth(P.r*1.15,P.r*.3,d)+.35*smooth(P.r*1.6,P.r*1.1,d);}
   {const d=Math.hypot(x-MUD.x,z-MUD.z);if(d<MUD.r*1.4)h-=.8*smooth(MUD.r*1.3,MUD.r*.7,d);}}}
 const g=gullyAt(x,z);h-=g.cut;
 // the lagoon: a shallow round bay, deepest (2 m) in its middle, its shores mud
 const dl=Math.hypot(x-LAGOON.x,z-LAGOON.z);if(dl<LAGOON.r*1.3)h=mix(h,Math.min(h,SEA-.3-1.7*smooth(LAGOON.r,LAGOON.r*.25,dl)+.4*(fbm(x*.02,z*.02,4553,2)-.5)),smooth(LAGOON.r*1.25,LAGOON.r*.85,dl));
 // the trail: a worn bed
 const pd=PATHGRID.at(x,z);if(pd<1.5)h-=.12*smooth(1.5,-.4,pd);
 return h;}
// THE WATER: the sea; the springs (each its own level, a little under its rim's lowest point); the streams and the creek
const POOLL=POOLS.map(P=>{let lo=1e9;for(let k=0;k<24;k++){const a=k/24*TAU;lo=Math.min(lo,terrainH0(P.x+Math.cos(a)*P.r*1.25,P.z+Math.sin(a)*P.r*1.25));}return lo-.25;});
function streamLevel(x,z){return terrainH0(x,z)+.35;}
function waterH(x,z){const h=terrainH(x,z);if(h<SEA+.25)return SEA;
 for(let i=0;i<POOLS.length;i++){const P=POOLS[i];if(Math.hypot(x-P.x,z-P.z)<P.r*1.3&&h<POOLL[i])return POOLL[i];}
 const g=gullyAt(x,z);if(g.bed>.55&&g.G)return Math.max(SEA,h+.35*smooth(.55,.9,g.bed));
 return -1e9;}

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The world's and the Throne's (BIOME-API.md), and the isle's: grove (the warm ground round the basin: wild spice), iwood
// (the isle's own forest), beach (the strip behind the sand: palms), coast (the same, for the floor), path, camp
function ventAt(x,z){let v=0;for(const S of STEAM){const d=Math.hypot(x-S.x,z-S.z);if(d<S.R*2.2)v=Math.max(v,S.s*Math.exp(-Math.pow(d/S.R,2)));}
 for(const G of GEYSERS){const d=Math.hypot(x-G.x,z-G.z);if(d<G.mound*2.4)v=Math.max(v,Math.exp(-Math.pow(d/(G.mound*.9),2)));}
 return clamp(v,0,1);}
function fieldsAt(x,z,h,slope){const e=basinE(x,z),dn=dnOf(x,z),ck=cliffK(x,z),g=gullyAt(x,z),pd=PATHGRID.at(x,z),dl=Math.hypot(x-LAGOON.x,z-LAGOON.z);
 let acid=0;for(const P of POOLS)acid=Math.max(acid,smooth(P.r*2.4,P.r*1.15,Math.hypot(x-P.x,z-P.z)));acid=Math.max(acid,smooth(MUD.r*1.6,MUD.r*.9,Math.hypot(x-MUD.x,z-MUD.z)));
 const vent=ventAt(x,z),sinter=smooth(1.04,.9,e),ab=h-SEA;
 // the sand: the foreshore (below 2.2 m) everywhere but the cliffs and the lagoon's mud; nothing roots on it (the wrack is the host's)
 const sand=smooth(2.6,1.6,ab)*smooth(-.5,.2,ab)*(1-ck)*(1-smooth(LAGOON.r*1.35,LAGOON.r*1.05,dl));
 const beach=smooth(1.6,2.6,ab)*smooth(7,4.5,ab)*(1-ck*.9)*(1-smooth(LAGOON.r*1.5,LAGOON.r*1.15,dl));
 // the mangal: the lagoon's shallows and mud flats (the kit's shallows pass stands the hyper-mangroves in it); the wrack:
 // the high-water line on the sand
 const lag=smooth(LAGOON.r*1.3,LAGOON.r*.95,dl),mangal=lag*smooth(-2.1,-1.5,ab)*smooth(.9,.3,ab);
 const wrack=smooth(.35,.7,ab)*smooth(1.5,1.1,ab)*(1-ck)*(1-lag);
 const path=smooth(1.5,-.5,pd),camp=smooth(CAMP.r*1.2,CAMP.r*.8,Math.hypot(x-CAMP.x,z-CAMP.z));
 const warmCreek=g.G&&g.G.warm?smooth(45,15,segD(x,z,g.G.pts)):0;
 const grove=Math.max(smooth(1.02,1.18,e)*smooth(1.95,1.5,e),warmCreek*.8)*(1-sinter)*(1-path)*(1-camp)*(1-beach)*(1-sand);
 const rock=clamp(Math.max(smooth(.62,.9,slope),ck*smooth(.938,.95,dn)*smooth(.97,.96,dn)+ck*smooth(.25,.5,slope)*smooth(.9,.95,dn)),0,1);
 const iwood=(1-grove)*(1-sinter)*(1-beach)*(1-sand)*(1-path)*(1-camp)*(1-g.bed*.85)*smooth(.6,3,ab)*(1-rock*.8);
 return{wet:clamp(.78+.2*g.bed,0,1),flow:g.bed,upland:0,canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:0,geo:0,
  barren:Math.max(sinter*(1-acid*.75)*(1-smooth(.3,.6,vent)*.7),sand,camp),humid:1,plume:0,vent,acid:acid*(1-sand),cinder:0,skylight:0,ash:0,
  owned:0,kedge:0,knear:0,field:0,clear:0,coast:beach,edge:0,city:0,path,grove,iwood,beach,sand,sinter,camp,mangal,wrack};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','humid','plume','vent','acid','cinder','skylight','ash','owned','kedge','knear','field','clear','coast','edge','city','path','grove','iwood','beach','sand','sinter','camp','mangal','wrack'];
const FC=(function(){const N=520,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  // out at sea there is nothing to read: skip the field maths
  if(a.h[k]<SEA-3){a.slope[k]=0;continue;}
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));_mark('fields');

// ---------------------------------------------------------------- the host binding
// THE MASK: nothing roots in the water or on the trail (the hyper-mangroves are the host's: they stand in the lagoon, 86)
const OBSTACLES=[];
const waterMask=(x,z)=>{const w=waterH(x,z);if(w>-1e8){const d=terrainH(x,z)-w;if(d<.7)return d<.15?0:(d-.15)/.55;}
 return smooth(-.2,.8,PATHGRID.at(x,z));};
let MASK=waterMask;
// the LOD spine: the basin, the camp, the landing, the lagoon, the trail
const SPINE=[[BASIN.x,BASIN.z],[CAMP.x,CAMP.z],[LANDING.x,LANDING.z],[LAGOON.x,LAGOON.z],[GEYSERS[0].x,GEYSERS[0].z],[POOLS[0].x,POOLS[0].z]];
TRAILS.forEach(T=>{for(let i=0;i<T.pts.length;i+=10)SPINE.push(T.pts[i]);});
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:44,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:280,mid:760,far:2400,floor:[250,620]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1]}});
BIO.setSun(SUN_POS);
