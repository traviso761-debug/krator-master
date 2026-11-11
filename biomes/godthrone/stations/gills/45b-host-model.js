// ================================================================= HOST — the ground model: THE SOUTH FLANK'S ICE BELT EDGE (stations 6 and 7: one frame)
// The bloodfalls (station 6, PLAN.md section 4 "The bloodfalls and the blood river") and the Red Gill (station 7, biomes/gills/PLAN.md
// sections 5 and 11 item 1) on one frame, as the summit's two pages share one: the origin on the Red Gill (map 5.1 px 862,1438, 5,441 m),
// x east, z south; the bloodfalls 11.3 km south-east (866,1442: 5,377 m). Each station's page draws its 9.6 km square of it; the other is
// in its far country. stations/blood reads this file in place (its station.json "reads").
//   THE GROUND    scale model 5.1's relief round the site (REGION: stations/gills/region.json) with the flank's detail on it: the EF belt
//                 at 5.3-6.2 km falling gently south, the Vale of Xanadu 3.7 km below to the south (the far country)
//   THE ICE BELT  the Godthrone's southern ice cap, cold-based, 40-90 m thick, over everything north of its margin; its southern edge an ice
//                 cliff (35-45 m) on a step of stacked flows, the margin running west-north-west across both squares just north of the falls
//   THE GILL      the Red Gill (Reḍ Gīl): one great radial crack running down the flank (north-south), 1.6 km long, 60 m across, 300 m deep,
//                 its walls stepped on the flows; the breath's heat has melted the ice back from it and its lips stand on bare rock, a
//                 few side cracks beside it; downwind (south-east) the breath meadow over red-stained ice (stations/gills/87-host-gills.js)
//   THE FALLS     the brine coming out at the margin's foot at the head of Qol Ḍrāi (the plan's px 585-595 by 1105-1112 on the old canvas):
//                 a red cascade down the ice cliff, rust terraces under it, a red pool, the blood river leaving south down its valley
//   QOL ḌRĀI      the blood river's valley ("the cold dry valley"), cut 40-90 m into the flows from the pool south out of the map
const SO={y0:5441,blood:[8000,8000]};
const LOCAL=(x,z)=>SO.y0+(REGION?(REGION.h(x+260,z)+REGION.h(x-260,z)+REGION.h(x,z+260)+REGION.h(x,z-260))*.25:-.04*z);   /* the model's relief, its 2 km facets softened */
function flankH(x,z){return LOCAL(x,z)+16*(fb(x*.0006,z*.0006,3,WORLD+90)-.5)+4*(1-Math.abs(fb(x*.003+fb(z*.001,x*.001,2,WORLD+91),z*.0012,2,WORLD+92)*2-1))+1*(vn(x*.03,z*.03,WORLD+93)-.5);}
// THE ICE MARGIN: z of the margin at x (the cliff's line), wandering; north of it the cap
const marginZ=x=>SO.blood[1]-560+(x-SO.blood[0])*.24+180*Math.sin(x*.00042+1.3)+60*Math.sin(x*.0019);
// THE GILL: a GILLS.layout record (biomes/gills): the Red form's radial crack drawn as a ring arc of a 60 km radius (straight to a few cm over 1.6
// km: GILLS.layout's radial geometry is still owed, BIOME-API.md), its numbers the plan's; three smaller side cracks, one closed (a pipe field)
const SG=(function(){const C=[-60000,0],Lr=GILLS.layout({centre:C,band:[59600,60500],arc:[-.03,.03],n:3,dead:1,seed:0x8E11,w:[10,24],d:[40,90],len:[300,700],form:'radial'});
 const big={id:'gill-red',form:'radial',c:C,r:60000,a0:-800/60000,a1:800/60000,w:60,d:300,alive:true,age:1.4};Lr.gills.unshift(big);
 /* the side cracks off to the east and the west of the great one, none crossing it */
 Lr.gills.slice(1).forEach((g,i)=>{const sh=[-420,380,-760,700][i]||0;g.r=60000+sh;});
 return{L:Lr,big,uOf:(x,z)=>z,vOf:(x,z)=>x};})();
const ICE={T:(x,z)=>{const m=marginZ(x),d=m-z;if(d<=0)return 0;
  /* the breath's heat keeps the gill's lips bare to ~450 m, the ice back by ~1 km */
  const bare=smooth(1050,450,Math.hypot(x*.85,Math.max(0,Math.abs(z)-650)));
  /* the cliff: the full thickness 6 m in from the margin (an ice cliff, near vertical), the cap thickening northward */
  return (38+Math.min(48,d*.012))*smooth(0,6,d)*(1-bare)*(1+.12*(fb(x*.002,z*.002,2,WORLD+94)-.5));},
 cliff:38};
// QOL ḌRĀI: from the pool under the falls south out of the map, its bed graded (never climbing), 40-90 m into the flows
const FALL=(function(){const x=SO.blood[0]+40,z=marginZ(SO.blood[0]+40)+2;return{x,z,top:0,foot:0,name:'The bloodfalls (Qol Ḍrāi\'s head): brine out of the ice, rusting as it falls'};})();
const QOL=(function(){const pts=KRELIEF.meander([FALL.x,FALL.z+70],[FALL.x+1600,FALL.z+9000],{amp:240,wave:1700,seed:KR.hash(WORLD,61,0,0x0D1)});
 return{pts};})();
const _qd=[];{let s=0;for(let i=0;i<QOL.pts.length;i++){if(i)s+=Math.hypot(QOL.pts[i][0]-QOL.pts[i-1][0],QOL.pts[i][1]-QOL.pts[i-1][1]);_qd.push(s);}}
function qolAt(x,z,o){let best=1e9,bi=0,bt=0;const P=QOL.pts;for(let i=1;i<P.length;i++){const ax=P[i-1][0],az=P[i-1][1],bx=P[i][0],bz=P[i][1],dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz,t=clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1),
  ex=ax+dx*t-x,ez=az+dz*t-z,d=ex*ex+ez*ez;if(d<best){best=d;bi=i;bt=t;}}
 o.d=Math.sqrt(best);o.s=_qd[bi-1]+(_qd[bi]-_qd[bi-1])*bt;return o;}
const QOLBED=(function(){const N=QOL.pts.length,B=[];let prev=1e9;for(let i=0;i<N;i++){const p=QOL.pts[i],g=flankH(p[0],p[1]),D=mix(40,90,smooth(0,3500,_qd[i]));let b=g-D;if(i===0)b=g-34;b=Math.min(b,prev-.05);B.push(b);prev=b;}
 return s=>{let i=1;while(i<_qd.length-1&&_qd[i]<s)i++;const t=clamp((s-_qd[i-1])/Math.max(1e-6,_qd[i]-_qd[i-1]),0,1);return B[i-1]+(B[i]-B[i-1])*t;};})();
const QW=s=>mix(22,60,smooth(0,4000,s));   /* the floor's half-width */
function preH(x,z){let h=flankH(x,z);
 /* the step under the ice margin: the cap stands on a ledge of flows 12 m over the outwash */
 const m=marginZ(x);h+=12*smooth(m+60,m-20,z);
 /* the gill and its side cracks (GILLS.gillAt: the record's own carve), stepped on the flows */
 const g=GILLS.gillAt(SG.L,x,z);if(g){const st=Math.round(g.g.d*g.k/9)*9;h-=mix(g.g.d*g.k,st,.35)*(1+.04*(vn(x*.05,z*.05,WORLD+95)-.5));}
 /* the blood river's valley */
 const q=qolAt(x,z,{});if(q.s>0||q.d<200){const bed=QOLBED(q.s),w=QW(q.s),t=Math.max(0,q.d-w),bank=bed+Math.min(t,10)*.3+Math.max(0,t-10)*.95;if(bank<h)h=bank;
  /* the pool under the falls: a bowl at the valley's head */
  const dp=Math.hypot(x-FALL.x,z-(FALL.z+40));if(dp<70)h=Math.min(h,bed-1.6*smooth(70,10,dp));}
 return h;}
// the rock: titanium basalt with the summit's ash between its flows (downwind: src/35t-godthrone-strata.js), under the dry-cold line, so its
// bead and ash beds are palagonite; the gill's walls cut it
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,6,0x57A7),formations:[{recipe:'tibasalt-ash'}],range:[4600,6600],
 dip:[0,1,.02],warp:[4,1.2],wash:{m:2},regolith:.4,dust:0x4a3328});
// THE GROUND DRAWN: the rock's ground and the ice on it (the ice surface IS the ground where the cap stands: one mesh), its cliff at the margin
function iceSurf(x,z){const T=ICE.T(x,z);return T;}
function baseRaw(x,z){const r=preH(x,z),T=iceSurf(x,z);return r+T;}
/* past both squares (the gill's and the falls') the scale model's relief: the Vale 3.7 km down to the south */
function baseH(x,z){const g=baseRaw(x,z);return REGION?REGION.blend(g,x,z,13600,19000,SO.y0):g;}
const VENT={x:1e6,z:1e6,r:0,h:0,throat:0,crater:0,cd:0,base:0,top:0,lavaY:0,name:'(no vent on this station)'};
// THE MODEL'S FIELDS: the ice (bare on its cliff, its crevasses and the stained meadow; firn and snow on the cap), the rust (the falls' seep, the
// terraces, the stained ice downwind of the gill), the palagonite in the hollows, the faces (the gill's walls, the valley's)
const MODEL={fieldsAt(x,z,sl,hollow,o){const T=ICE.T(x,z),g=GILLS.gillAt(SG.L,x,z),q=qolAt(x,z,{}),m=marginZ(x),dm=m-z;
  o.face=g&&g.k>.05?smooth(.55,.9,sl):q.d<QW(q.s)+90&&sl>.7?smooth(.7,1.1,sl):0;
  o.talus=q.d<QW(q.s)+60&&q.d>QW(q.s)*.8?.6:g&&g.k<.4?.4:0;o.rampart=0;o.vent=0;o.glass=0;o.orange=0;o.halo=0;
  const onIce=T>1;
  /* the ice: firn and snow on the cap, bare blue ice on the cliff and the steep, and where the brine stains it */
  o.ice=onIce?clamp(.35+.65*smooth(.4,.9,sl),0,1):0;o.snow=onIce?clamp(.85-.8*smooth(.3,.8,sl),0,1)*smooth(0,120,dm):clamp(.5*hollow*smooth(.4,.1,sl),0,.5);
  /* the rust: the falls' face and its fan, the terraces and the pool's shore (the seep), the river's banks; downwind of the gill the
     breath's mist stains the ice and the ground rust-brown (the meadow: 87-host-gills.js draws its life) */
  const df=Math.hypot(x-FALL.x,z-FALL.z),fall=smooth(220,30,df)*(z>m-60?1:smooth(m-200,m-60,z)),bank=q.s<6000?smooth(QW(q.s)+30,QW(q.s)*.6,q.d)*mix(.85,.35,smooth(0,4000,q.s)):0;
  const wx=x-0,wz=z-0,down=(wx*.6+wz*.8),side=Math.abs(-wx*.8+wz*.6),meadow=smooth(200,700,down)*smooth(2600,900,down)*smooth(1400,500,side)*(STN.key==='gills'||Math.hypot(x,z)<4000?1:0);
  o.rust=clamp(Math.max(fall,bank,.7*meadow),0,1);
  /* the snow and the ice lose to the stain where it is strong */
  if(o.rust>.3){o.snow*=1-o.rust;}
  o.palag=onIce?0:clamp(.6*hollow*smooth(.8,.3,sl),0,.6);
  o.crust=onIce?0:clamp(smooth(.7,.3,sl)*smooth(.4,.7,vn(x*.02,z*.02,WORLD+96))*(1-o.rust)*.6,0,.6);
  o.tuff=0;
  return o;},
 farColor(x,z,h,sl,c,K){const T=ICE.T(x,z);if(T>1)return K.mixC(c,K.L([222,230,238]),.85);   /* the cap */
  return K.mixC(c,K.L([92,70,58]),.35*smooth(5200,3000,h));},
 after(){FALL.top=terrainH(FALL.x,FALL.z-14);FALL.foot=QOLBED(0)+.4;}};
var PORTAL=null;
