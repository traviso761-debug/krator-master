// ================================================================= HOST — the ground model: THE FIRST BREATH (station 1)
// A station's ground as plain functions of (x, z) on its frame (45-host-stage.js): baseH (what the field bakes), STRATA (the rock), the
// route's places (SKYL, PORT, ROUTE), MODEL.fieldsAt (what the kit's fields read), MODEL.warmAt and pathAt (finer than the field's
// cache), MODEL.after (once the field is baked). The tubes under it are KCAVERN's (87-host-tube.js); this is the ground over them.
//   THE SLOPE     map 5.1's relief round the site (REGION, smoothed over its 2 km lattice): the Twins' south-west flank at ~4,200-4,400 m,
//                 old titanium-basalt flows in low lobes, frost-shattered (the sub-nival scree), solifluction lobes (KFROST) creeping
//                 down the steeper ground
//   THE COULEE    an obsidian coulee 1.3 km long and ~22 m thick come down from the NW Twin's flank north of the route: its steep glassy
//                 front and the talus of black blocks it sheds (PLAN.md section 3.1: "a frost-shattered black obsidian boulder field")
//   THE TUBES     tube A1's roof a faint swell along its line, broken at the skylight (KCAVERN's well: a collapse 17 m across);
//                 tube A2's mouth at the head of a collapsed lava trench 190 m long, its floor ramping down to the tube's
//   THE ROUTE     the sprint from the skylight's breakdown ramp to the trench's head (~3.5 km, east-north-east: PLAN.md section 3.1's
//                 bearing from (978, 1468) to (982, 1466)), a trodden line the cairns mark (60-biome-twins-ground.js)
const SITE_Y=REGION?REGION.y0:4240;
const nrm2=v=>{const l=Math.hypot(v[0],v[1]);return[v[0]/l,v[1]/l];};
// the skylight (the end of A1: it arrives from the south-west, tube_xanadu_nw_09's run from (966, 1479) to (978, 1468)) and the portal
// (A2 leaves east toward (994, 1467)); 3.5 km apart along the sprint's bearing, the site between them
const SPRINT=nrm2([4,-2]);
const SKYL={x:-1750*SPRINT[0],z:-1750*SPRINT[1],d:nrm2([12,-11]),r:13,rim:3,name:'The First Skylight Break (a collapse in tube A1\'s roof)'};
const PORT={x:1750*SPRINT[0],z:1750*SPRINT[1],d:nrm2([12,1]),r:15,rim:3,name:'The dive-ramp into the Horn-Underpass (tube A2\'s mouth in a collapsed lava trench)'};
// the tubes' bores (PLAN.md section 3.1: 12-22 m wide arched pyroducts; tubes.json's habitable branch 16 m): their floors run under the
// smoothed slope at a cover that thins toward the skylight (a thin roof is why it fell in)
const TUBE={w:18,h:13,ledge:{v:4,d:1.4}};
// the slope: the map's relief smoothed (the 2 km lattice creases), plus the flows' lobes and the shattered surface
const LOCAL=(x,z)=>SITE_Y+(REGION?REGION.smooth(x,z):0);
// ---------------------------------------------------------------- the coulee
const COUL=(function(){const a=nrm2([-.55,.835]),L=650,W=330,c=[250,-750];   // a: down the flow (south-south-west, toward the route)
 return{a,n:[-a[1],a[0]],L,W,c,T:22,front:[c[0]+a[0]*L,c[1]+a[1]*L],name:'An obsidian coulee (a thick glassy flow off the NW Twin\'s flank)'};})();
function coulAt(x,z,o){const dx=x-COUL.c[0],dz=z-COUL.c[1],u=dx*COUL.a[0]+dz*COUL.a[1],v=dx*COUL.n[0]+dz*COUL.n[1];
 const w=1+.12*(fb(u*.004+3,v*.004,2,WORLD+40)-.5)*2,e=Math.hypot(u/COUL.L,v/(COUL.W*w)),din=(1-e)*COUL.W;o.din=din;o.u=u;o.v=v;
 /* the flank: a steep front (35 m: a coulee's front stands at 35-45 degrees, its blocks spilling off it), then the top with arcuate
    pressure ridges (ogives) across the flow */
 const k=smooth(0,35,din),og=3.2*Math.pow(Math.abs(Math.sin(u*.045+.0009*v*v*.02+fb(v*.01,u*.01,2,WORLD+41)*1.5)),3);
 o.h=k*(COUL.T+og*smooth(40,120,din)+4*(fb(x*.02,z*.02,2,WORLD+42)-.5));
 o.face=din>-4&&din<40?smooth(0,14,din)*smooth(40,22,din):0;o.on=smooth(-2,25,din);o.apron=din<0?smooth(-90,0,din):0;return o;}
// ---------------------------------------------------------------- the tubes' lines
const A1={from:-900,to:16,pts:null};   // metres along SKYL.d from the skylight's centre (it ends in the breakdown ramp's rock)
const A2={from:-34,to:620,pts:null};   // metres along PORT.d from the mouth
const along=(P,x,z)=>{const dx=x-P.x,dz=z-P.z;return[dx*P.d[0]+dz*P.d[1],Math.abs(-dx*P.d[1]+dz*P.d[0])];};
// the trench: its floor ramps from the slope (190 m back) to the tube's floor (40 m back) and runs flat to the mouth; walls at ~65 degrees;
// the head wall over the mouth at s = 0 (the tube cuts through it: KCAVERN's well round the mouth draws that ground, 87)
const TRENCH={back:190,flat:40,half:9};
let PORT_FLOOR=null;   // the tube's floor at the mouth: set before the bake from the smoothed slope (the cover of A2 there: 7 m)
function trenchAt(x,z,g){const q=along(PORT,x,z),s=q[0],c=q[1];if(s<-TRENCH.back-30||s>40||c>TRENCH.half+60)return g;
 const yF=PORT_FLOOR,T=s<=0?mix(g,yF,smooth(-TRENCH.back,-TRENCH.flat,s)):yF+s*4.5;
 return Math.min(g,T+Math.max(0,c-TRENCH.half)*2.2+.6*smooth(TRENCH.half-3,TRENCH.half,c));}
// ---------------------------------------------------------------- the frost (KFROST): solifluction lobes on the scree slopes
const LSLOPE=(x,z)=>{const e=40;return Math.hypot(LOCAL(x+e,z)-LOCAL(x-e,z),LOCAL(x,z+e)-LOCAL(x,z-e))/(2*e);};
const FROST=KFROST.create({seed:KR.hash(WORLD,1,1,0xF205),ground:(x,z)=>LOCAL(x,z),lobes:{cell:30,h:1.3,where:(x,z)=>smooth(.08,.2,LSLOPE(x,z))*smooth(.6,.35,LSLOPE(x,z))}});
// the slope before the tubes: the map, the old flows' lobes (low, ropy, a few metres), the shattered surface, the frost's lobes, the coulee
const _c={};
function preH(x,z){const g=LOCAL(x,z),lobes=6*(1-Math.abs(fb(x*.0016+fb(z*.0005,x*.0005,2,WORLD+50)*2,z*.0016,2,WORLD+51)*2-1));
 const C=coulAt(x,z,_c);
 return g+lobes+9*(fb(x*.0007,z*.0007,2,WORLD+52)-.5)+1.4*(vn(x*.06,z*.06,WORLD+53)-.5)+FROST.h(x,z)+C.h;}
// tube A1's roof stands a little proud of the flows it fed: a swell 1.8 m over 30 m along its line (none where it runs deep)
function swell(x,z){let y=0;{const q=along(SKYL,x,z);if(q[0]>A1.from&&q[0]<A1.to)y+=1.8*smooth(24,6,q[1])*smooth(A1.from,A1.from+200,q[0]);}
 {const q=along(PORT,x,z);if(q[0]>0&&q[0]<A2.to)y+=1.5*smooth(24,6,q[1])*smooth(A2.to,A2.to-200,q[0]);}return y;}
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,1,0x57A7),formations:[{recipe:'tibasalt'}],range:[3700,5200],
 dip:[-SPRINT[0],-SPRINT[1],.006],warp:[5,1.4],wash:{m:2},regolith:.4,dust:0x2c2a28});
PORT_FLOOR=LOCAL(PORT.x,PORT.z)-TUBE.h-7-6;
function baseH(x,z){let g=preH(x,z)+swell(x,z);g=trenchAt(x,z,g);return REGION?REGION.blend(g,x,z,4400,9500,SITE_Y):g;}
// ---------------------------------------------------------------- the route (the sprint) and the warm breath
// ROUTE: from the breakdown ramp's top on the skylight's far side to the trench's head, a line that wanders round the boulders (fixed by
// KRAND: its bends are the cell's draws), its points every ~25 m; then down the trench to the mouth
const ROUTE=(function(){const a=[SKYL.x+SKYL.d[0]*(SKYL.r+6),SKYL.z+SKYL.d[1]*(SKYL.r+6)],b=[PORT.x-PORT.d[0]*(TRENCH.back+10),PORT.z-PORT.d[1]*(TRENCH.back+10)];
 const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/25),d=[(b[0]-a[0])/L,(b[1]-a[1])/L],nn=[-d[1],d[0]],P=[];
 for(let i=0;i<=n;i++){const t=i/n,w=Math.sin(t*Math.PI)*(70*(fb(t*3.1,.5,2,WORLD+60)-.5)*2+25*Math.sin(t*9.3));P.push([a[0]+d[0]*L*t+nn[0]*w,a[1]+d[1]*L*t+nn[1]*w]);}
 for(let s=-TRENCH.back+10;s<=-6;s+=20)P.push([PORT.x+PORT.d[0]*s,PORT.z+PORT.d[1]*s]);
 let len=0;for(let i=1;i<P.length;i++)len+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);
 return{pts:P,len,name:'The First Breath (Open Sprint 1): the sprint between the skylight and the Horn-Underpass, cairned'};})();
// the route's segments bucketed on a 50 m grid (each segment in every cell its box, grown 8 m, touches): a query reads one cell
const ROUTE_IX=(function(){const B=new Map(),P=ROUTE.pts,C=50;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];
 for(let gi=Math.floor((Math.min(a[0],b[0])-8)/C);gi<=Math.floor((Math.max(a[0],b[0])+8)/C);gi++)for(let gj=Math.floor((Math.min(a[1],b[1])-8)/C);gj<=Math.floor((Math.max(a[1],b[1])+8)/C);gj++){
  const k=gi+','+gj;if(!B.has(k))B.set(k,[]);B.get(k).push(i);}}return{B,C};})();
function routeDist(x,z){const L=ROUTE_IX.B.get(Math.floor(x/ROUTE_IX.C)+','+Math.floor(z/ROUTE_IX.C));if(!L)return 1e9;let best=1e9;const P=ROUTE.pts;
 for(const i of L){const a=P[i-1],b=P[i],ex=b[0]-a[0],ez=b[1]-a[1],t=clamp(((x-a[0])*ex+(z-a[1])*ez)/(ex*ex+ez*ez),0,1);
 best=Math.min(best,Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t));}return best;}
const _fc={};
const MODEL={
 // the warm breath (PLAN.md section 5.2: +12 to +16 C air venting out of the skylights; a 5-15 m collar of fumarole-ferns and cushions on
 // the basalt round it, snow-free in the black scree); the portal's mouth breathes the same
 warmAt(x,z){const ds=Math.hypot(x-SKYL.x,z-SKYL.z)-(SKYL.r+SKYL.rim),q=along(PORT,x,z),dp=Math.hypot(Math.max(0,q[0]-0),Math.max(0,q[1]-TRENCH.half))+Math.max(0,-q[0]-50)*1.0;
  return Math.max(smooth(16,3,ds)*(ds>-SKYL.rim?1:0),smooth(22,4,dp)*(q[0]>-60?1:0)*.85);},
 pathAt(x,z){return smooth(3.4,1.2,routeDist(x,z));},
 fieldsAt(x,z,sl,hollow,o){const C=coulAt(x,z,_fc);
  o.face=Math.max(smooth(.95,1.5,sl),C.face*smooth(.5,.9,sl));
  o.talus=C.apron*(1-o.face);
  o.obsidian=clamp(Math.max(C.on*.9,C.apron,.45*Math.exp(-Math.max(0,-C.din)/500)),0,1);
  o.scree=clamp((.55+.45*smooth(.2,.6,sl))*(1-o.face),0,1);
  o.lichen=clamp(.6*smooth(.45,.12,sl)*smooth(.35,.75,vn(x*.01,z*.01,WORLD+61))*(1-C.on),0,1);
  /* the boulder field the sprint crosses: a band ~500 m either side of the sprint's line, patchy (the frost-shattered flow tops), the
     obsidian coulee's blocks heaviest by its front */
  {const dl=Math.abs(-x*SPRINT[1]+z*SPRINT[0]),al=Math.abs(x*SPRINT[0]+z*SPRINT[1]);o.blocks=clamp(smooth(650,250,dl)*smooth(2300,1700,al)*(.45+.75*smooth(.3,.7,vn(x*.006,z*.006,WORLD+62)))*(1-o.face),0,1);}
  o.poly=0;return o;},
 after(){SKYL.y=terrainH(SKYL.x,SKYL.z);PORT.y=terrainH(PORT.x+PORT.d[0]*12,PORT.z+PORT.d[1]*12);PORT.floor=PORT_FLOOR;
  ROUTE.top=Math.max(...ROUTE.pts.map(p=>terrainH(p[0],p[1])));ROUTE.bottom=Math.min(...ROUTE.pts.slice(0,-9).map(p=>terrainH(p[0],p[1])));}};
