// ================================================================= HOST — the ground model: CATCH-LOOKOUT SPRING (station 6)
// The ledge as plain functions of (x, z) on the frame: baseH, STRATA, the oasis (OASIS: 45a7-host-oasis.js on KTHERM), the travertine
// terraces (TERR_W), the scarp (LIP), the route, MODEL. Started from the Brazier's (stations/brazier/45b-host-model.js).
//   THE LEDGE     map 5.1's relief round the site (REGION, smoothed): a bench at ~3,690 m on the range's north-east flank, the Catch's fall
//                 beginning 5-6 km out (the map's drop: 200 m at 6 km, 800 at 8)
//   THE SCARP     a fault scarp across the bench east of the spring, 45 m of columned titanium basalt (KSTRATA's tibasalt beds on its face),
//                 its lip 380 m from the spring and wandering; the lower bench beyond; a breach where the scarp has fallen into a talus ramp
//                 (Route B's way down)
//   THE SPRING    the Lookout Spring (70 C, alkaline-chloride: PLAN.md section 3.2) and a second hot pool on the bench's inner fault, a line
//                 vent (KTHERM); its water stepping east down the bench in eight travertine basins (WATER.terraces: the caravans' soaking
//                 basins), the bench tilted gently toward the lip
//   THE ROUTE     Route B from the west (Oasis 4, the Brimstone-Tarn) past the pools to the lip, down the breach and on east-north-east over
//                 the lower bench toward Stair, cairned
const SITE_Y=REGION?REGION.y0:3690;
const nrm2=v=>{const l=Math.hypot(v[0],v[1]);return[v[0]/l,v[1]/l];};
const LOCAL=(x,z)=>SITE_Y+(REGION?REGION.smooth(x,z):0);
const EA=nrm2([.92,-.39]),EN=[-EA[1],EA[0]];   // EA: toward the Catch (east-north-east, toward Stair); EN across it (south-south-east)
const eu=(x,z)=>[x*EA[0]+z*EA[1],x*EN[0]+z*EN[1]],eAt=(a,p)=>[EA[0]*a+EN[0]*p,EA[1]*a+EN[1]*p];
// ---------------------------------------------------------------- the scarp: its lip (a along EA) as a function of p across; the breach
const LIP={at:p=>380+28*Math.sin(p*.0045+1.1)+12*Math.sin(p*.013),H:45,c:null,name:'The ledge\'s fault scarp (45 m of columned titanium basalt; the Catch beyond)'};
LIP.c=eAt(LIP.at(-60),-60);
const BREACH=(()=>{const p=210,a=LIP.at(p),q=eAt(a,p);return{x:q[0],z:q[1],p,a,w:46,name:'The breach (a talus ramp where the scarp has fallen: Route B\'s way down to the Catch)'};})();
function scarpAt(x,z){const q=eu(x,z),a=q[0],p=q[1],L=LIP.at(p),bw=smooth(BREACH.w*1.4,BREACH.w*.6,Math.abs(p-BREACH.p));
 /* the step: sheer over 14 m (a talus apron below it: KRELIEF's talus is the faces' feet on the strata pass), or a 150 m ramp in the breach */
 const run=mix(14,150,bw),d=-LIP.H*smooth(L-run*.2,L+run*.8,a);
 const talus=6*smooth(L+run*.8+40,L+run*.8,a)*smooth(L+run*.6,L+run*.85,a)*(1-bw);
 return d+talus;}
// ---------------------------------------------------------------- the oasis (OASIS_MODEL) and the terraces
const SPRING_C=eAt(-30,20),SPRING2=eAt(-150,-90);
const TER=(()=>{const A=eAt(-30+9,20),n=8,len=150,P=[];for(let t=0;t<=len;t+=10){const w=6*Math.sin(t*.03);P.push([A[0]+EA[0]*t+EN[0]*w,A[1]+EA[1]*t+EN[1]*w]);}
 return{line:P,n,len,w:9,riser:2.2,drop:.7,name:'The soaking basins (eight travertine terraces stepping down the bench: the caravans wash the alkali from their eyes here)'};})();
const OASIS=OASIS_MODEL({name:'Catch-Lookout Spring',c:[0,0],soil:0,air:17,
 fault:[eAt(-330,-50),eAt(-150,-20),eAt(-30,25),eAt(60,40)],faultT:26,faultReach:360,rillT:46,rillReach:40,
 springs:[{key:'lookout',name:'The Lookout Spring (70 C, alkaline-chloride: the oasis\'s source)',x:SPRING_C[0],z:SPRING_C[1],r:5,T:70,temp:.65,mineral:'sinter',milky:.25,apron:12},
  {key:'inner',name:'A hot pool on the bench\'s inner fault',x:SPRING2[0],z:SPRING2[1],r:3.5,T:62,temp:.5,mineral:'iron',apron:8}],
 geysers:[],mudpots:[],fumaroles:[],rills:[TER.line],
 box:[-640,-640,640,640]});
// the terraces' treads and levels (fixed before the bake: the levels from the bench's own ground at the head, each tread .7 m lower)
const TER_IX=(()=>{const L=[0];for(let i=1;i<TER.line.length;i++)L.push(L[i-1]+Math.hypot(TER.line[i][0]-TER.line[i-1][0],TER.line[i][1]-TER.line[i-1][1]));return L;})();
TER.total=TER_IX[TER_IX.length-1];
const terrProj=(x,z)=>{let best=null;for(let i=1;i<TER.line.length;i++){const a=TER.line[i-1],b=TER.line[i],ex=b[0]-a[0],ez=b[1]-a[1],l2=ex*ex+ez*ez,u=clamp(((x-a[0])*ex+(z-a[1])*ez)/l2,0,1),d=Math.hypot(x-a[0]-ex*u,z-a[1]-ez*u);
  if(!best||d<best.d)best={d,s:TER_IX[i-1]+u*Math.sqrt(l2)};}return best;};
// ---------------------------------------------------------------- the frost, the rock
const LSLOPE=(x,z)=>{const e=40;return Math.hypot(LOCAL(x+e,z)-LOCAL(x-e,z),LOCAL(x,z+e)-LOCAL(x,z-e))/(2*e);};
const FROST=KFROST.create({seed:KR.hash(WORLD,6,1,0xF205),ground:(x,z)=>LOCAL(x,z),lobes:{cell:30,h:1,where:(x,z)=>smooth(.06,.16,LSLOPE(x,z))*smooth(.6,.35,LSLOPE(x,z))}});
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,6,0x57A7),formations:[{recipe:'tibasalt'}],range:[2600,4400],
 dip:[EA[0],EA[1],.006],warp:[5,1.4],wash:{m:2},regolith:.4,dust:0x2c2a28});
// the bench before the terraces: the map, the flows' lobes, the shattered surface, the frost's lobes, a 2% tilt toward the lip near the oasis, the scarp
function preH(x,z){const g=LOCAL(x,z),q=eu(x,z),lobes=4*(1-Math.abs(fb(x*.0016+fb(z*.0005,x*.0005,2,WORLD+50)*2,z*.0016,2,WORLD+51)*2-1));
 const near=1-smooth(.75,1.1,Math.hypot((q[0]-40)/520,q[1]/460)),tilt=-.022*clamp(q[0]+200,0,600)*near;
 return g+lobes*(1-.6*near)+7*(fb(x*.0007,z*.0007,2,WORLD+52)-.5)+1*(vn(x*.06,z*.06,WORLD+53)-.5)*(1-.6*near)+FROST.h(x,z)+tilt+scarpAt(x,z);}
TER.y0=OASIS.relief(TER.line[0][0],TER.line[0][1],preH(TER.line[0][0],TER.line[0][1]))-.3;
TER.levels=[];for(let i=0;i<TER.n;i++)TER.levels.push(TER.y0-i*TER.drop);
TER.treads=(()=>{const n=TER.n,room=TER.total-(n-1)*TER.riser,tl=room/n,o=[];for(let i=0;i<n;i++){const s0=i*(tl+TER.riser);o.push({s0,s1:s0+tl,y:TER.levels[i],w:TER.w});}return o;})();
const TERR_W={wet:(x,z)=>{const q=terrProj(x,z);return q.d<TER.w/2+.8&&q.s<TER.total+1;}};
// the terraces' relief: each tread a basin (floor .8 m under its level), its dams of travertine standing a hand over the level at the sides and
// the downstream end, the riser's face between; outside the basins the bench eases back over 6 m
function terrRelief(x,z,g){const q=terrProj(x,z);if(q.d>TER.w/2+8||q.s>TER.total+8)return g;const T=TER.treads,hw=TER.w/2;
 let i=T.findIndex(t=>q.s<t.s1+TER.riser*.5);if(i<0)i=T.length-1;const t=T[i],lv=t.y;
 const inTread=q.s>=t.s0-.2&&q.s<=t.s1,rimY=lv+.25,floor=lv-.8*(1-Math.pow(clamp(q.d/hw,0,1),2));
 let y;if(q.d<hw&&inTread)y=floor;else if(q.d<hw+2.6&&q.s<=t.s1+.6)y=rimY;
 else if(q.d<hw+2.6){/* the riser: the dam's crest down to the next tread's floor */const nx=T[Math.min(i+1,T.length-1)];y=mix(rimY,nx.y-.3,smooth(t.s1+.6,nx.s0,q.s));}
 else y=mix(Math.max(rimY,g),g,smooth(hw+2.6,hw+9,q.d));
 return mix(y,g,smooth(TER.total,TER.total+8,q.s));}
function baseH(x,z){let g=terrRelief(x,z,OASIS.relief(x,z,preH(x,z)));return REGION?REGION.blend(g,x,z,4400,9500,SITE_Y):g;}
// ---------------------------------------------------------------- the lookout cairn, the route
const CAIRN=(()=>{const p=-60,a=LIP.at(p)-9,q=eAt(a,p);return{x:q[0],z:q[1],name:'The lookout cairn (on the scarp\'s lip: the Catch and the way to Stair spread below)'};})();
const nearCairn=(x,z)=>Math.hypot(x-CAIRN.x,z-CAIRN.z)<6;
const ROUTE=(function(){const W0=eAt(-4300,1300),legs=[W0,eAt(-260,120),eAt(-40,-40),eAt(BREACH.a-80,BREACH.p),eAt(BREACH.a+170,BREACH.p+10),eAt(4300,-1100)],P=[];
 for(let l=1;l<legs.length;l++){const a=legs[l-1],b=legs[l],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/25)),d=[(b[0]-a[0])/L,(b[1]-a[1])/L],nn=[-d[1],d[0]];
  for(let i=l===1?0:1;i<=n;i++){const t=i/n,w=L>600?Math.sin(t*Math.PI)*(55*(fb(t*3.1+l,.5,2,WORLD+60)-.5)*2+15*Math.sin(t*9.3)):0;P.push([a[0]+d[0]*L*t+nn[0]*w,a[1]+d[1]*L*t+nn[1]*w]);}}
 let len=0;for(let i=1;i<P.length;i++)len+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);
 return{pts:P,len,name:'Route B\'s descent (from Oasis 4 by the spring, down the breach, on toward Stair), cairned'};})();
const ROUTE_IX=(function(){const B=new Map(),P=ROUTE.pts,C=50;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];
 for(let gi=Math.floor((Math.min(a[0],b[0])-8)/C);gi<=Math.floor((Math.max(a[0],b[0])+8)/C);gi++)for(let gj=Math.floor((Math.min(a[1],b[1])-8)/C);gj<=Math.floor((Math.max(a[1],b[1])+8)/C);gj++){
  const k=gi+','+gj;if(!B.has(k))B.set(k,[]);B.get(k).push(i);}}return{B,C};})();
function routeDist(x,z){const L=ROUTE_IX.B.get(Math.floor(x/ROUTE_IX.C)+','+Math.floor(z/ROUTE_IX.C));if(!L)return 1e9;let best=1e9;const P=ROUTE.pts;
 for(const i of L){const a=P[i-1],b=P[i],ex=b[0]-a[0],ez=b[1]-a[1],t=clamp(((x-a[0])*ex+(z-a[1])*ez)/(ex*ex+ez*ez),0,1);
 best=Math.min(best,Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t));}return best;}
const MODEL={
 warmAt:(x,z)=>OASIS.warmAt(x,z),
 heatAt:(x,z)=>OASIS.heatAt(x,z),
 classAt:(x,z,o)=>{OASIS.classAt(x,z,o);const q=terrProj(x,z);if(q.s<TER.total+4){const k=smooth(TER.w/2+3,TER.w/2+.5,q.d);o.sinter=Math.max(o.sinter,k*.9);}return o;},
 pathAt(x,z){return smooth(3.2,1.1,routeDist(x,z));},
 fieldsAt(x,z,sl,hollow,o){o.face=smooth(.95,1.5,sl);const q=eu(x,z),L=LIP.at(q[1]);
  o.talus=smooth(L+40,L+12,q[0])*smooth(L+2,L+10,q[0])*(1-o.face);o.obsidian=.08;
  o.scree=clamp((.55+.45*smooth(.2,.6,sl))*(1-o.face),0,1);
  o.lichen=clamp(.6*smooth(.45,.12,sl)*smooth(.35,.75,vn(x*.01,z*.01,WORLD+61)),0,1);
  o.blocks=clamp(.1*smooth(.4,.75,vn(x*.004,z*.004,WORLD+62))*smooth(450,800,Math.hypot(x,z))*(1-o.face)+.8*o.talus,0,1);o.poly=0;return o;},
 after(){OASIS.after();ROUTE.top=Math.max(...ROUTE.pts.map(p=>terrainH(p[0],p[1])));ROUTE.bottom=Math.min(...ROUTE.pts.map(p=>terrainH(p[0],p[1])));CAIRN.y=terrainH(CAIRN.x,CAIRN.z);
  LIP.c=eAt(LIP.at(-60)-4,-60);LIP.y=terrainH(LIP.c[0],LIP.c[1]);{const b=eAt(LIP.at(-60)+60,-60);LIP.below=terrainH(b[0],b[1]);}}};
