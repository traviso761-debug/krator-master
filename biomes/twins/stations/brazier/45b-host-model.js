// ================================================================= HOST — the ground model: THE BRAZIER (station 2)
// The col as plain functions of (x, z) on the frame (45-host-stage.js): baseH, STRATA, the oasis (OASIS: 45a7-host-oasis.js on KTHERM), the
// route, MODEL (what 45c's fields read). Started from station 1's (stations/pyroduct/45b-host-model.js): the same rock, the same frost.
//   THE COL      map 5.1's relief round the site (REGION, smoothed): the inter-Twin saddle at ~4,680 m, almost flat for 6 km, old flows in
//                low lobes, frost-shattered, solifluction lobes (KFROST) on the steeper ground
//   THE FISSURE  a fault-fissure NW-SE across the col (the line from Fissure Vent NW to Fissure Vent SE: PLAN.md section 3's map), its north-
//                east side stepped up 16 m in a basalt scarp (a notch where Route B crosses by the shrine); the springs rise at its foot, its
//                heat a line vent (KTHERM)
//   THE OASIS    a shallow hollow 800 x 500 m along the fissure (the warm ground slumped and altered), the pools in sinter mounds, the
//                geysers' mounds under their cones, the mud pots in pits, the rills cut down the runoff toward the south-west
//   THE ROUTE    Route B from Oasis 2 (south-west: 1005, 1489) through the oasis by the shrine and on toward Oasis 4 (east-north-east: 1031,
//                1473), cairned
const SITE_Y=REGION?REGION.y0:4680;
const nrm2=v=>{const l=Math.hypot(v[0],v[1]);return[v[0]/l,v[1]/l];};
const LOCAL=(x,z)=>SITE_Y+(REGION?REGION.smooth(x,z):0);
// the fissure: from Fissure Vent NW toward Fissure Vent SE (PLAN.md section 3: (1007, 1472) to (1024, 1485)), through the oasis
const FA=nrm2([17,13]),FN=[-FA[1],FA[0]];   // FN: across it, toward the south-west (the runoff's way)
const fAt=(s,a)=>[FA[0]*s+FN[0]*a,FA[1]*s+FN[1]*a];
const FISS={pts:(()=>{const P=[];for(let s=-900;s<=900;s+=30)P.push(fAt(s,6*Math.sin(s*.011)+3*Math.sin(s*.031)));return P;})(),name:'The fissure (a fault the springs rise along)'};
const uv=(x,z)=>[x*FA[0]+z*FA[1],x*FN[0]+z*FN[1]];   // along the fissure, across it (+ south-west)
// ---------------------------------------------------------------- the oasis (OASIS_MODEL: the heat, the relief, the classes)
const SPR=(key,name,s,a,r,T,o)=>{const p=fAt(s,a);return Object.assign({key,name,x:p[0],z:p[1],r,T,temp:clamp((T-30)/60,.15,1),mineral:'sinter',milky:0,boil:0},o||{});};
const rill=(s,a,len,seed)=>{const p0=fAt(s,a),P=[p0];for(let t=12;t<=len;t+=12){const w=9*(fb(t*.01,seed,2,WORLD+90)-.5)*2;P.push([p0[0]+FN[0]*t+FA[0]*w,p0[1]+FN[1]*t+FA[1]*w]);}return P;};
const OASIS=OASIS_MODEL({name:'The Brazier',c:[0,0],soil:-7,air:14,
 fault:FISS.pts.filter(p=>Math.abs(uv(p[0],p[1])[0])<170),faultT:34,faultReach:600,rillT:44,rillReach:30,
 springs:[SPR('eye','The Brazier\'s Eye (the oasis\'s great pool)',-120,14,8,86,{boil:0,apron:16}),
  SPR('kettle','The Kettle (a hot pool on the fissure)',40,18,5,72,{apron:11}),
  SPR('rust','The Rust Pool (iron-stained)',215,10,4,58,{mineral:'iron',apron:9}),
  SPR('soak','The soaking pool (the caravans\' bath: warm, ice at its outer edge)',-30,120,6.5,40,{temp:.2,milky:.35,apron:8,lip:.5,depth:1.1,reach:45})],
 geysers:[(()=>{const p=fAt(-25,-10);return{key:'hornspout',name:'The Horn-Spout (a geyser cone: a 3 m column every twenty minutes)',x:p[0],z:p[1],H:3,style:'cone',period:1200,cone:2.4};})(),
  (()=>{const p=fAt(150,-6);return{key:'chatter',name:'The Chatterer (a spouter: it never stops)',x:p[0],z:p[1],H:1.6,style:'spouter',period:90,cone:1.5};})()],
 mudpots:[[290,30,2.6],[310,46,3.4],[330,24,2.1]].map((q,i)=>{const p=fAt(q[0],q[1]);return{key:'mud'+i,x:p[0],z:p[1],r:q[2],T:78};}),
 fumaroles:[[-330,-4],[360,-8],[-250,-14]].map(q=>{const p=fAt(q[0],q[1]);return{x:p[0],z:p[1],T:96,reach:50,name:'A fumarole on the fissure (steam, H2S and SO2)'};}),
 rills:[rill(-120,14+9,190,1),rill(40,18+6,150,2),rill(215,10+5,120,3),rill(-25,-10+4,170,4)],
 box:[-640,-640,640,640]});
// ---------------------------------------------------------------- the shrine (the Shrine of the Split Horn: 87 draws it)
const SHRINE=(()=>{const p=fAt(30,-70);return{x:p[0],z:p[1],face:Math.atan2(FN[1],FN[0]),name:'The Shrine of the Split Horn (where the guide\'s second coin falls due: PLAN.md section 4.1)'};})();
const nearShrine=(x,z)=>Math.hypot(x-SHRINE.x,z-SHRINE.z)<9;
// ---------------------------------------------------------------- the frost (KFROST): solifluction lobes where the col steepens
const LSLOPE=(x,z)=>{const e=40;return Math.hypot(LOCAL(x+e,z)-LOCAL(x-e,z),LOCAL(x,z+e)-LOCAL(x,z-e))/(2*e);};
const FROST=KFROST.create({seed:KR.hash(WORLD,2,1,0xF205),ground:(x,z)=>LOCAL(x,z),lobes:{cell:30,h:1.1,where:(x,z)=>smooth(.06,.16,LSLOPE(x,z))*smooth(.6,.35,LSLOPE(x,z))}});
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,2,0x57A7),formations:[{recipe:'tibasalt'}],range:[3700,5400],
 dip:[-FA[0],-FA[1],.004],warp:[5,1.4],wash:{m:2},regolith:.4,dust:0x2c2a28});
// the col: the map, the old flows' lobes, the shattered surface, the frost's lobes; the fissure's scarp; the oasis's hollow and its relief
function preH(x,z){const g=LOCAL(x,z),lobes=5*(1-Math.abs(fb(x*.0016+fb(z*.0005,x*.0005,2,WORLD+50)*2,z*.0016,2,WORLD+51)*2-1));
 const q=uv(x,z),fx=q[1]-(6*Math.sin(q[0]*.011)+3*Math.sin(q[0]*.031)),scarp=16*smooth(-22,-28,fx)*smooth(1300,900,Math.abs(q[0]))*(1-smooth(75,35,Math.abs(q[0]-25)));   /* the fault scarp: 16 m of basalt, its foot 25 m north-east of the vents, a notch where Route B crosses by the shrine */
 const hollow=-3*smooth(1,.55,Math.hypot(q[0]/470,(q[1]-40)/270));
 return g+lobes+8*(fb(x*.0007,z*.0007,2,WORLD+52)-.5)+1.2*(vn(x*.06,z*.06,WORLD+53)-.5)*(1-smooth(.8,.5,Math.hypot(q[0]/470,(q[1]-40)/270))*.6)+FROST.h(x,z)+scarp+hollow;}
function baseH(x,z){let g=OASIS.relief(x,z,preH(x,z));return REGION?REGION.blend(g,x,z,4400,9500,SITE_Y):g;}
// ---------------------------------------------------------------- Route B through the oasis
// from the square's south-west (toward Oasis 2) past the shrine and on east-north-east (toward Oasis 4); its points every ~25 m, wandering
const ROUTE=(function(){const legs=[[-3900,3500],[SHRINE.x-40,SHRINE.z+60],[SHRINE.x+50,SHRINE.z-20],[4300,-1700]],P=[];
 for(let l=1;l<legs.length;l++){const a=legs[l-1],b=legs[l],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/25)),d=[(b[0]-a[0])/L,(b[1]-a[1])/L],nn=[-d[1],d[0]];
  for(let i=l===1?0:1;i<=n;i++){const t=i/n,w=L>400?Math.sin(t*Math.PI)*(60*(fb(t*3.1+l,.5,2,WORLD+60)-.5)*2+18*Math.sin(t*9.3)):0;P.push([a[0]+d[0]*L*t+nn[0]*w,a[1]+d[1]*L*t+nn[1]*w]);}}
 let len=0;for(let i=1;i<P.length;i++)len+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);
 return{pts:P,len,name:'Route B, the Steaming-Stone Dash (from Oasis 2, the Mud-Kettle Hollow, on to Oasis 4, the Brimstone-Tarn), cairned'};})();
const ROUTE_IX=(function(){const B=new Map(),P=ROUTE.pts,C=50;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];
 for(let gi=Math.floor((Math.min(a[0],b[0])-8)/C);gi<=Math.floor((Math.max(a[0],b[0])+8)/C);gi++)for(let gj=Math.floor((Math.min(a[1],b[1])-8)/C);gj<=Math.floor((Math.max(a[1],b[1])+8)/C);gj++){
  const k=gi+','+gj;if(!B.has(k))B.set(k,[]);B.get(k).push(i);}}return{B,C};})();
function routeDist(x,z){const L=ROUTE_IX.B.get(Math.floor(x/ROUTE_IX.C)+','+Math.floor(z/ROUTE_IX.C));if(!L)return 1e9;let best=1e9;const P=ROUTE.pts;
 for(const i of L){const a=P[i-1],b=P[i],ex=b[0]-a[0],ez=b[1]-a[1],t=clamp(((x-a[0])*ex+(z-a[1])*ez)/(ex*ex+ez*ez),0,1);
 best=Math.min(best,Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t));}return best;}
const MODEL={
 warmAt:(x,z)=>OASIS.warmAt(x,z),
 heatAt:(x,z)=>OASIS.heatAt(x,z),
 classAt:(x,z,o)=>OASIS.classAt(x,z,o),
 pathAt(x,z){return smooth(3.2,1.1,routeDist(x,z));},
 fieldsAt(x,z,sl,hollow,o){o.face=smooth(.95,1.5,sl);o.talus=0;o.obsidian=.04;
  o.scree=clamp((.55+.45*smooth(.2,.6,sl))*(1-o.face),0,1);
  o.lichen=clamp(.6*smooth(.45,.12,sl)*smooth(.35,.75,vn(x*.01,z*.01,WORLD+61)),0,1);
  /* the col's loose blocks: the frost-shattered flow tops, patchy, none in the oasis */
  o.blocks=clamp(.1*smooth(.4,.75,vn(x*.004,z*.004,WORLD+62))*smooth(500,900,Math.hypot(x,z))*(1-o.face),0,1);o.poly=0;return o;},
 after(){OASIS.after();ROUTE.top=Math.max(...ROUTE.pts.map(p=>terrainH(p[0],p[1])));ROUTE.bottom=Math.min(...ROUTE.pts.map(p=>terrainH(p[0],p[1])));SHRINE.y=terrainH(SHRINE.x,SHRINE.z);}};
