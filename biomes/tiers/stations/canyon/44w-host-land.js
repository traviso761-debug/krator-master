// ================================================================= HOST — STATION 2, COYOTE CANYON: its land
// PLAN.md section 9: the model's village pin, 5.1 px 1265,500 (1,603 m, 1.31 atm, BSh, 282 mm, 20 degC (28 / 11), extremes 37 / 3), the capital of the
// Coyote Kingdom (the owner, 2026-11-10). THE CANYON AS DRAWN (the survey of 2026-11-16, smodel.page): the site stands at the MOUTH of a canyon that
// climbs north-east into the riser (its floor 2,187 m 2.8 km up, 2,432 m at 5.6 km, 2,725 m at 8.5 km) between a north wall of 2,800-3,200 m and a
// south wall of 1,950-2,400 m; south-west the ground falls to a hollow at 950-1,300 m. On 2 km cells the canyon is a V four kilometres wide. The page:
//   THE PLATEAU     the model's surface with the canyon's six cells north-east of the site filled from their high neighbours (MODEL.h's cell filter,
//                   the Great Chasm's headwall's way), so the riser's shoulders stand at the drawn heights either side
//   THE BOX CANYON  cut back into it as a STAIR of nine treads (KRELIEF.stepcut, one graben a tread, each with its own floor: the canyon's floor
//                   climbs 11% where the model's climbs 16%, so it descends in treads with dry falls of ~39 m between them (each square across: a point takes its own tread's cut), the Tiers' rule in
//                   the canyon's own floor), its walls sheer and stepped (six ledges of ~20 m: the ledge houses' rows and the ledge heath's; the floor 440 m across), the last
//                   tread ending in the head's amphitheatre (stepcut's head: a bowl as wide as the cut). The walls rise from nothing at the
//                   mouth to ~850 m at the head
//   THE SPRING      at the head, under the king's house: its pool a still (core/water); the water runs down the stair as a chain of pools held
//                   by the step moss's tufa dams, each tread's pool joined to the next by a fall over the riser (WATER.terraces)
//   THE TERRACES    the floor's treads farmed, irrigated from the stream (the farm field: the treads' floors off the stream and the walls' feet)
//   THE ROAD        the stair road up the canyon's floor from the mouth to the head, cut stairs at each dry fall
// The seat's buildings are records (86: the spring hall over the spring, the runner bird's shrine at the road's foot, the rock-cut façades; the
// town's rows on the walls wait on the layout: KNOWN_ISSUES.md). The strata: the floor's treads in the Black Step's basalt (to 2,200 m), the walls
// rising through the Red Step's red beds to the White Step's pale sandstone at the head's rim (44r).
const STATION=(function(){
 /* THE PLATEAU: the canyon's cells (offsets from the site's cell) take the mean of their neighbours that stand 250 m and more over them */
 const CAN=new Set(['1,-1','2,-1','1,-2','2,-2','2,-3','3,-3']);
 const FILLED=new Map();   /* each filled cell's value, worked once */
 const fill=(i,j,h)=>{if(!CAN.has(i+','+j))return h;const k=i+','+j;if(FILLED.has(k))return FILLED.get(k);const v=fill0(i,j,h);FILLED.set(k,v);return v;};
 const fill0=(i,j,h)=>{let s=0,n=0;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){if(!a&&!b)continue;if(CAN.has((i+a)+','+(j+b)))continue;const v=MODEL.raw(i+a,j+b);if(v>h+250){s+=v;n++;}}return n?s/n:h;};
 const plateau=(x,z)=>MODEL.h(x,z,fill);
 // THE AXIS: the canyon's floor line, mouth to head (south-west to north-east), and its arc length
 const AX=[[-420,420],[150,-150],[700,-640],[1250,-1230],[1840,-1840]];
 const AL=[0];for(let i=1;i<AX.length;i++)AL.push(AL[i-1]+Math.hypot(AX[i][0]-AX[i-1][0],AX[i][1]-AX[i-1][1]));const LEN=AL[AL.length-1];
 const at=s=>{s=clamp(s,0,LEN);let i=0;while(i<AX.length-2&&AL[i+1]<s)i++;const u=(s-AL[i])/(AL[i+1]-AL[i]);return[AX[i][0]+(AX[i+1][0]-AX[i][0])*u,AX[i][1]+(AX[i+1][1]-AX[i][1])*u];};
 const sub=(s0,s1)=>{const P=[at(s0)];for(let i=1;i<AX.length-1;i++)if(AL[i]>s0&&AL[i]<s1)P.push(AX[i]);P.push(at(s1));return P;};
 // THE STAIR: nine treads; tread k from the mouth runs s in [k, k+1] x LEN/9, its floor rising 11% from 1,560 m at the mouth
 const NT=9,W=220,F0=1560,GR=.11,TL=LEN/NT;
 const TREADS=Array.from({length:NT},(_,k)=>({k,s0:k*TL,s1:(k+1)*TL,floor:Math.round(F0+GR*k*TL)}));
 const CUTS=TREADS.map((T,k)=>KRELIEF.stepcut({line:{pts:sub(Math.max(0,T.s0-(k?18:0)),T.s1),w:W},floor:T.floor,steps:6,tread:20,riser:2,rim:2,
  warp:{amp:22,scale:1/300},seed:61301+k,head:k===NT-1?{at:'end',len:300,amph:1,wall:0}:undefined}));
 /* each tread's reach: its line's box grown by the floor, the walls' steps (C.edge) and the warp; a point outside it is not that tread's */
 const BOX=CUTS.map(C=>{const P=C.line.pts,m=W+(C.edge||0)+40;return[Math.min(...P.map(p=>p[0]))-m,Math.min(...P.map(p=>p[1]))-m,Math.max(...P.map(p=>p[0]))+m,Math.max(...P.map(p=>p[1]))+m];});
 const inBox=(k,x,z)=>{const B=BOX[k];return x>=B[0]&&x<=B[2]&&z>=B[1]&&z<=B[3];};
 /* THE TREAD A POINT BELONGS TO: the stretch of the axis it projects onto (a graben's rounded end reaches ~240 m past its line, so the lower
    tread would eat into the upper one and the dry falls would stand mid-tread); each point takes that tread's cut alone, so every dry fall stands
    at a tread's boundary, square across the canyon */
 const kOf=(x,z)=>{const L=nearLine(AX,x,z);return clamp(Math.floor(L.t*LEN/TL),0,NT-1);};
 const cut=(x,z,g)=>{const k=kOf(x,z);return inBox(k,x,z)?KRELIEF.shape(CUTS[k],x,z,g):g;};
 /* the part of the cut at a point (the field cache asks it several times a point: the last answer is kept) */
 const _pa={x:NaN,z:NaN,a:null};
 const partAt=(x,z)=>{if(x===_pa.x&&z===_pa.z)return _pa.a;const g=plateau(x,z),k=kOf(x,z),best=inBox(k,x,z)?KRELIEF.at(CUTS[k],x,z,g):null;_pa.x=x;_pa.z=z;_pa.a=best;return best;};
 // THE STREAM'S POOLS (WATER.terraces): down the axis from the head, a pool on each tread a little under its floor, held by the step moss's dam at
 // its lower end; the line runs head to mouth (the levels descending)
 const SL=[...AX].reverse(),PL=LEN;   /* the stream line, head first: s' = LEN - s */
 /* a tread the cut does not form (at the mouth the model's ground stands under the tread's floor) carries no pool: the stream ends at the lowest
    formed tread's dam and sinks into the mouth's fan */
 const STAIR=(function(){const treads=[];for(let k=NT-1;k>=0;k--){const T=TREADS[k],a=PL-T.s1+(k===NT-1?60:6),b=PL-T.s0-(k?24:10);if(b-a<20)continue;
  const mid=at((T.s0+T.s1)/2);if(plateau(mid[0],mid[1])<T.floor+3)continue;treads.push({s0:a,s1:b,y:T.floor+.25,w:3.6});}
  const at2=s=>at(PL-s);return{treads,at:at2,tot:PL};})();
 const TER=WATER.terraces({name:'The spring\'s stream (the step moss\'s pools down the canyon\'s stair)',line:SL,treads:STAIR.treads,speed:.6,spread:1.4});
 /* the stream's bed dug into each tread: the pool's floor 0.35 m under its level inside the line's ribbon */
 const streamD=(x,z)=>nearLine(AX,x,z).d;
 const bed=(x,z,g)=>{const A=TER.at?TER.at(x,z):null;if(!A||A.kind!=='tread')return g;const w=STAIR.treads[A.index].w*.5,d=streamD(x,z);return Math.min(g,mix(A.level-.35,g,smooth(w*.7,w+1.2,d)));};
 // THE SPRING: at the head, in the bowl's floor, a pool under the king's house (86 sets the hall over it)
 const HEAD=at(LEN-70),SPRING={x:HEAD[0],z:HEAD[1],r:16,level:TREADS[NT-1].floor+.3};
 const springCut=(x,z,g)=>{const d=Math.hypot(x-SPRING.x,z-SPRING.z);return d>SPRING.r+4?g:Math.min(g,mix(SPRING.level-1.2,g,smooth(SPRING.r*.7,SPRING.r+4,d)));};
 // THE ROAD: up the floor beside the stream, from the mouth's foot to the head
 const ROADS=[{name:'The stair road (up the canyon\'s floor, cut stairs at each dry fall)',pts:AX.map(([x,z],i)=>[x+(i?38:0),z+(i?38:30)]),w:3}];
 const roadD=(x,z)=>{let d=1e9;for(const R of ROADS)d=Math.min(d,nearLine(R.pts,x,z).d/R.w);return d;};
 function ground(x,z){let h=cut(x,z,plateau(x,z));h=bed(x,z,h);h=springCut(x,z,h);h+=.4*(KRAND.fbm(x*.012,.5,z*.012,2,61309)-.5);
  const rd=roadD(x,z);if(rd<2)h-=.3*smooth(2,0,rd);return h;}
 /* where the cut has drawn: its risers bare rock, its treads ledges (soil: the heath's rows and the ledge houses'), its floor the farmed tread */
 const rockK=(x,z,sl)=>{const a=partAt(x,z);if(a&&(a.part==='riser'||a.part==='rim'))return Math.max(.85,smooth(.3,.6,sl));return smooth(.55,.85,sl);};
 const ledgeK=(x,z)=>{const a=partAt(x,z);return a&&a.part==='tread'?1:0;};
 const floorK=(x,z)=>{const a=partAt(x,z);return a&&a.part==='floor'?1:0;};
 const L=tiersLand({R:2600,ground,
  lakes:[{name:'The king\'s spring (the pool under the spring hall)',kind:'pool',level:SPRING.level,poly:Array.from({length:24},(_,k)=>[SPRING.x+Math.cos(k/24*TAU)*SPRING.r,SPRING.z+Math.sin(k/24*TAU)*SPRING.r])}],
  rockAt:(x,z,h,sl)=>rockK(x,z,sl),strataK:(x,z,h,sl)=>Math.max(rockK(x,z,sl),smooth(.4,.75,sl)),
  talus:(x,z)=>{const a=partAt(x,z);return a&&a.part==='floor'&&a.e!=null?smooth(45,4,a.e):0;},
  /* the rain: 282 mm on the floor (BSh), the stream's band wet */
  wet:(x,z)=>.3+.5*smooth(40,4,streamD(x,z))*floorK(x,z),
  seep:(x,z)=>smooth(18,3,streamD(x,z))*floorK(x,z)+smooth(SPRING.r+30,SPRING.r,Math.hypot(x-SPRING.x,z-SPRING.z)),
  ledge:ledgeK,
  /* THE IRRIGATED TERRACES: each tread's floor between the stream (25 m) and the walls' talus (40 m in), off the road */
  farm:(x,z)=>{const a=partAt(x,z);if(!a||a.part!=='floor')return 0;return smooth(22,40,streamD(x,z))*smooth(30,55,a.e==null?0:a.e)*smooth(1.5,3,roadD(x,z));},
  road:(x,z)=>smooth(1.6,.6,roadD(x,z)),
  /* the plateau's shoulders: the riser's treads either side, a step behind the canyon's rim */
  tread:(x,z)=>partAt(x,z)?0:smooth(F0+150,F0+420,plateau(x,z)),
  strata:TIERS_STRATA({}),
  spine:[[0,0],[-420,420],[150,-150],[700,-640],[1250,-1230],[1840,-1840],[-1200,1300],[1600,600],[-800,-1600],[2200,-700],[-2000,-200]]});
 Object.assign(L,{AX,LEN,at,TREADS,CUTS,partAt,plateau,TER,STAIR,SPRING,HEAD,ROADS,roadD,streamD,fill,CAN,W});return L;})();
var ROCKS=[];
STATION.ROCK.push(...ROCKS);
/* THE FLASH FLOOD (44g: TIERS_FLOOD): a storm on the treads drains into the canyon and runs from the head's bowl down the stream's line to the
   mouth, over each dry fall; ~90 m across, 2.2 m at the crest, its front 5 m/s (the mouth ~11 minutes after the head), a storm every 40 minutes (the page's 3x: ~16), so each wave clears the channel before the next (89f draws it; 88 registers its segments) */
/* the line from the king's spring in the head's bowl (the axis's tip stands on the rim, 600 m over it) to the mouth */
const FLOOD_LINE=(function(){const S=STATION,cut=S.LEN-70,pts=[S.HEAD];for(let i=S.AX.length-1;i>=0;i--){if(nearLine(S.AX,S.AX[i][0],S.AX[i][1]).t*S.LEN<cut-10)pts.push(S.AX[i]);}return pts;})();
STATION.FLOODS=[TIERS_FLOOD({id:'tiers-canyon-flood',name:'The canyon\'s flash flood',line:FLOOD_LINE,floor:(x,z)=>STATION.terrainH(x,z),w:45,depth:2.2,seg:120,front:5,period:2400,
 tell:{sign:'a roar from the head, the stream turning brown, flood wrack in the cottonwoods and drift lines on the walls',colour:'#7a5a3a'}})];
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=null,FALLS=[],SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'Coyote Canyon (tiers station 2)',title:'Krator biome — the Tiers: Coyote Canyon',build_id:'tiers-canyon',
 hint:'Station 2 of the Tiers: Coyote Canyon, the capital of the Coyote Kingdom (scale model 5.1 px 1265,500; 1,560-2,900 m, 1.31 atm, BSh): a box canyon cut back into the riser as a stair of nine treads, the king\'s spring at its head, the step moss\'s pools down the stair, irrigated terraces on its floor, the ledge heath striping its walls (the seat\'s buildings as records until kits/coyote and the layout)',
 region:{name:'Coyote Canyon (station 2)',x:0,z:0,r:TERR.R},sky:{px:SITE.sky[0],py:SITE.sky[1]},atm:atmAt(SITE.h),cloud:.15,
 fog:{falloff:1/900,sun:.3,sky:.3},climate:{},wet:false,groundN:560,
 /* THE HOUR THE PAGE OPENS: 11:00, when the sun (59 degrees, azimuth 30: core/atmos's sky at the site) runs nearly down the canyon's axis and lights
    its floor; at the shared 14:00 it crosses the north-west wall and the whole floor is in its shade (src/84-host-horizon.js, hzSky below). The opening day's
    eclipse at this longitude is 09:00-10:00 */
 hour:11,
 hzSky:.45,   /* the head's bowl in its own shade: the horizon shade's sky term eased (src/84-host-horizon.js) */
 groundLayers:['meadow','steppe','terrace','lichen'],
 plants:['tiergrass','heath','moss','lichen','boulder','tlip','tiersage','collaredagave','whorlferula','terracesumac','miststepfern','tufarosette','beddinghouseleek','saffroniris','stepastragalus','pagodarhubarb','treadbistort'],
 modelTol:45,
 /* the station's sculpts, out of the model check: the canyon (its filled cells and the cut) */
 sculpt:(x,z)=>!!STATION.partAt(x,z)||STATION.CAN.has(Math.round(x/MODEL.cell)+','+Math.round(z/MODEL.cell)),
 farLabel:'The Tiers past the map: the riser\'s shoulders, the great tread above, the lake south-west (the scale model 5.1)',
 /* the neighbours' trees, read in place: the eastern badlands' Fremont cottonwood by the stream on the floor, its juniper and pinyon on the shoulders */
 kin:[{ref:'ebadlands.cottonwood',key:'cottonwood',name:'Fremont cottonwood (the eastern badlands\', read in place)',cell:50,minR:7,accept:Z=>Z.seep*.5*(1-Z.cliff)*smooth(.6,.35,Z.slope)},
  {ref:'ebadlands.juniper',key:'juniper',name:'Utah juniper (the eastern badlands\', read in place)',cell:30,minR:4,accept:Z=>(Z.tread*.2+Z.dry*.05)*(1-Z.cliff)*smooth(.6,.35,Z.slope)},
  {ref:'ebadlands.pinyon',key:'pinyon',name:'Pinyon pine (the eastern badlands\', read in place)',cell:40,minR:4,accept:Z=>Z.tread*.12*(1-Z.cliff)*smooth(.6,.35,Z.slope)},
  /* the flora pass (2026-11-16; PLAN.md section 4, "Read in place"): the rose weeper by the stream's water, the yucca on the walls' dry benches, the
     ponderosa with the whorl pines on the north rim's cool flank */
  {ref:'ebadlands.weeper',key:'weeper',name:'Rose weeper (the eastern badlands\', read in place)',cell:36,minR:5,accept:Z=>Z.seep*.28*(1-Z.cliff)*smooth(.6,.35,Z.slope)},
  {ref:'ebadlands.yucca',key:'yucca',name:'Chaparral yucca (the eastern badlands\', read in place)',cell:16,minR:2,accept:Z=>(Z.dry*.05+Z.ledge*.06*Z.temperate)*(1-Z.cliff)},
  {ref:'ebadlands.ponderosa',key:'ponderosa',name:'Ponderosa pine (the eastern badlands\', read in place)',cell:46,minR:6,accept:Z=>Z.cool*.16*Z.gentle*(1-Z.cliff)}],
 exportBox:null,exportProfile:['registry','items','buckets','materials','textures','terrain','stage','atmos','hazards','water'],
 prebuild:()=>typeof SEAT!=='undefined'?SEAT.build():null,
 build:()=>{const wTex=BIO.canvasTex(2,2,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);});
  for(const k in BIO.kits){const D=BIO.kits[k]&&BIO.kits[k].defs;for(const d in D){const mt=D[d]&&D[d].mat;
   if(mt&&!mt.map&&!mt.emissiveMap&&mt.userData&&mt.userData.bio){mt.map=wTex;mt.color.setRGB(1,1,1);mt.needsUpdate=true;}}}
  return null;},
 hazards:()=>{const out=[],S=STATION;
  /* along the stair: the rims' falls (both walls), rockfall under the walls (crush), the dry falls' wet tufa (slip); the flash flood's segments
     (drown on a cycle, the current's pull) at the end */
  S.TREADS.forEach((T,k)=>{const s=(T.s0+T.s1)/2,p=S.at(s),q=S.at(s+20),ux=(q[0]-p[0])/20,uz=(q[1]-p[1])/20,nx=-uz,nz=ux,e=S.W+6*20+14;
   if(Math.abs(p[0])>2400||Math.abs(p[1])>2400)return;
   const depth=S.plateau(p[0],p[1])-T.floor;if(depth>25)for(const sd of [-1,1]){out.push({name:'The canyon\'s rim (a fall of '+Math.round(depth)+' m)',kind:'fall',x:p[0]+nx*sd*e,z:p[1]+nz*sd*e,r:Math.min(150,(T.s1-T.s0)*.4),h:20,danger:.9,tell:{sign:'the shoulder\'s edge: a sheer stepped wall'}});
    out.push({name:'Rockfall under the canyon\'s wall',kind:'crush',x:p[0]+nx*sd*(S.W-20),z:p[1]+nz*sd*(S.W-20),r:40,h:25,danger:.45,tell:{sign:'fresh blocks on the floor\'s edge, scars on the risers'}});}
   if(k)out.push({name:'The dry fall (a riser of the canyon\'s stair; wet tufa)',kind:'slip',x:S.at(T.s0)[0],z:S.at(T.s0)[1],r:30,h:40,danger:.3,tell:{sign:'green-slick lime curtains over the riser'}});});
  S.FLOODS.forEach(F=>out.push(...F.records));
  return out;},
 hazardMin:8,
 views:H=>{const {look,atRec,nearRec}=H,S=STATION,A=S.at,Hd=S.HEAD;
  const V={
  'Up the canyon from its mouth':look(-700,700,4,A(S.LEN*.55)[0],A(S.LEN*.55)[1],60),
  'The stair of the floor':look(A(S.LEN*.3)[0]+30,A(S.LEN*.3)[1]+30,3,A(S.LEN*.5)[0],A(S.LEN*.5)[1],8),
  'The head and the king spring':look(A(S.LEN-300)[0]+25,A(S.LEN-300)[1]+25,8,Hd[0],Hd[1],70),
  'Down from the north rim':look(A(S.LEN*.6)[0]-330,A(S.LEN*.6)[1]-330,3,A(S.LEN*.35)[0],A(S.LEN*.35)[1],-40),
  'The walls and their ledges':look(A(S.LEN*.7)[0]+60,A(S.LEN*.7)[1]+60,2,A(S.LEN*.7)[0]-260,A(S.LEN*.7)[1]-160,120),
  'From afar':look(-2900,2900,900,1000,-1000,0)};
  /* the whorl pines on the south-looking ledges (the nearest to the canyon's middle) */
  const P=nearRec&&nearRec('whorlpine',600,-600);if(P)V['Whorl pines on the cool ledges']=atRec(P,P.r*3+10,2.5,6);
  return V;},
 probes:{}};
