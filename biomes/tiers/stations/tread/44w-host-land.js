// ================================================================= HOST — STATION 4, THE GREAT TREAD: its land
// PLAN.md section 9: the cold stair at 5.1 px 1310,490, by the dry Chung-Gel (1311,498, 16 km south: the far field's). 4,637 m on the high
// steps' first tread, 0.90 atm, Dsc: 31 mm a year, +2 degC (15 / -11), extremes 25 / -21. The model's 2 km cells smear the stair into a slope
// (~26 m a km rising north-east); the station draws it as the kit draws every step (PLAN.md section 1, "the kit draws them as cliffs"):
//   THE TREAD        the model's surface flattened to a quarter of its rise about the site's height, so the tread lies nearly level between
//                    its risers (6 m a km), stony: desert pavement on the flats (KRELIEF.pavement), the steppe's thin grass in the hollows
//   THE NEXT STEP    a riser up the page's north-east (KRELIEF.scarp: 170 m over a 190 m run, three ledges, ravines, buttresses, a talus foot),
//                    its tread level behind the rim
//   THE GREAT TREAD  below a riser across the page's south-west (KRELIEF.scarp drop: 190 m down), the great tread's steppe at ~4,440 m
//                    under it and on to the far field
//   THE DRY GORGE    a wadi cut into the tread (KRELIEF.stepcut, a graben with stepped walls, its head a sapped bowl on the tread): 70 m
//                    deep where it notches the lower rim and hangs over the riser in a dry fall. The Chung-Gel's 300-480 m gorge is the far
//                    field's, 16 km south (KNOWN_ISSUES.md)
//   THE BUTTES       the risers' outliers (KSTACKS butte): three on the great tread standing off the lower riser, one on the tread off the next
//   THE CAMP         the herders' summer camp on the tread, their flocks on the steppe round it (86: core/camp's pitch; 87t: the flocks)
// Every stratum is the Grey Steps' (44r: tiers-grey, 3,950-8,200 m).
const STATION=(function(){
 const L0=4637;   /* the site's height (the model's cell): the tread's level */
 const base0=(x,z)=>MODEL.h(x,z);
 const flat=(x,z)=>{const g=base0(x,z);return L0+(g-L0)*.25+3*(fbm(x*.0016,z*.0016,4.4,3)-.5);};
 // THE RISERS: both rims run south-east across the page (the stair's strike: the model's rise is toward the north-east), each tread on the north-east
 const UP=[[-1440,-3440],[170,-1830],[1830,-60],[3420,1580]],LO=[[-3560,-1420],[-1990,250],[-320,1960],[1270,3620]];
 const RU=KRELIEF.scarp({pts:UP,side:-1,h:170,run:190,power:1.5,benches:{n:3,w:12},ravines:{n:3,w:[25,45],head:[60,140],depth:[20,50],power:1.6},
  buttresses:{sp:380,w:.3,amp:25},talus:{h:14,reach:110},rim:{lip:2,w:10},warp:{amp:40,scale:1/520},rough:.015,ends:800,seed:64101});
 const RL=KRELIEF.scarp({pts:LO,side:-1,drop:true,h:190,run:210,power:1.45,benches:{n:3,w:14},ravines:{n:3,w:[25,50],head:[60,160],depth:[20,55],power:1.6},
  buttresses:{sp:420,w:.3,amp:28},talus:{h:16,reach:120},rim:{lip:2,w:10},warp:{amp:45,scale:1/560},rough:.015,ends:800,seed:64102});
 const sideOf=(P,x,z)=>{const L=nearLine(P,x,z),i=L.i,a=P[i],b=P[i+1],ux=b[0]-a[0],uz=b[1]-a[1],l=Math.hypot(ux,uz),nx=-uz/l,nz=ux/l;return{d:L.d,s:Math.sign((x-a[0]-ux*L.u)*nx+(z-a[1]-uz*L.u)*nz)};};
 const g1=(x,z)=>KRELIEF.shape(RL,x,z,KRELIEF.shape(RU,x,z,flat(x,z)));
 // THE DRY GORGE: from a sapped head on the tread south-west to the lower rim, where it hangs over the riser
 const GL=[[760,-760],[420,-330],[60,40],[-330,380],[-760,760],[-1180,1110]];
 const GORGE=KRELIEF.stepcut({line:{pts:GL,w:28},depth:70,steps:4,tread:14,riser:2,rim:1.5,warp:{amp:9,scale:1/160},head:{at:'start',len:220,amph:.9,wall:.35},seed:64103});
 const GAT=(x,z)=>KRELIEF.at(GORGE,x,z);
 /* the page's edge: the stair eased back onto the model over the last ~550 m, so the far field (the model's cells) meets the page with no wall
    (the great tread stands ~200 m under the model at the south-west edge, the next step ~200 m over it at the north-east) */
 /* the gorge's floor: a dry wadi down it (KRELIEF.wadi: braided cobble bars between the channels, cut banks, no fan: it hangs over the riser) */
 const gCut=(x,z)=>KRELIEF.shape(GORGE,x,z,g1(x,z));
 const WADI=KRELIEF.wadi({pts:GL.slice(1),ground:gCut,w:9,bank:1.6,bankW:3,braids:2.5,pools:0,fan:false,seed:64105});
 function ground(x,z){const h=KRELIEF.shape(WADI,x,z,gCut(x,z)),e=smooth(1950,2500,Math.hypot(x,z));return e>0?mix(h,base0(x,z),e):h;}
 const ATu=(x,z)=>KRELIEF.at(RU,x,z),ATl=(x,z)=>KRELIEF.at(RL,x,z);
 const partK=a=>!a?0:a.part==='face'||a.part==='ravine'||a.part==='buttress'?1:a.part==='rim'?.5:a.part==='bench'?.4:0;
 const faceK=(x,z,sl)=>{const k=Math.max(partK(ATu(x,z)),partK(ATl(x,z)));const G=GAT(x,z),kg=G&&G.part==='riser'?1:0;return Math.max(k,kg)*Math.max(.6,smooth(.2,.45,sl));};
 const talusK=(x,z)=>{let t=0;for(const [W,A] of [[RU,ATu],[RL,ATl]]){const a=A(x,z);if(a&&a.part==='talus')t=Math.max(t,1-smooth(0,1,(a.d-W.run)/80));}
  const G=GAT(x,z);if(G&&(G.part==='floor'||G.part==='tread'))t=Math.max(t,G.part==='floor'?.9:.5);if(KRELIEF.at(WADI,x,z))t=1;
  if(ROCKS.length){const f=KSTACKS.foot(ROCKS,x,z);if(f)t=Math.max(t,smooth(30,4,f.d));}return t;};
 const PAVE=KRELIEF.pavement({h:ground,ground:base0,wadis:[],slope:[.04,.16],seed:64104});
 /* the tread's own band: on the station's tread (between the rims), and how far behind a rim */
 const treadK=(x,z)=>{const U=sideOf(UP,x,z),D=sideOf(LO,x,z);return (U.s>0?smooth(40,160,U.d):smooth(30,140,U.d))*(D.s<0?smooth(30,140,D.d):smooth(40,160,D.d));};
 const L=tiersLand({R:2600,ground,lakes:[],
  rockAt:(x,z,h,sl)=>Math.max(faceK(x,z,sl),smooth(.55,.85,sl)),
  strataK:(x,z,h,sl)=>Math.max(faceK(x,z,sl),smooth(.4,.75,sl)),
  talus:talusK,
  pave:(x,z)=>PAVE(x,z)*(1-smooth(.4,.9,talusK(x,z))),
  /* the rain: 31 mm on the tread (Dsc), a little more on the next step's face (the snow it holds in its lee); the hollows hold what falls */
  wet:(x,z)=>.08+.06*smooth(.55,.75,fbm(x*.003,z*.003,5.2,3)),
  ledge:(x,z)=>{const a=ATu(x,z),b=ATl(x,z);return (a&&a.part==='bench')||(b&&b.part==='bench')?1:0;},
  tread:treadK,
  strata:TIERS_STRATA({}),
  spine:[[0,0],[-450,-650],[-900,-200],[600,-200],[300,500],[-1000,1000],[-1600,1500],[1100,-900],[1300,400],[-300,-1500],[-2000,700],[-600,1900]]});
 Object.assign(L,{L0,RU,RL,UP,LO,GL,GORGE,GAT,WADI,base:base0,flat,sideOf,faceK,talusK,treadK,
  /* where the camp and the flocks may go: the tread's open ground, off the gorge and the risers, gentle */
  openK:(x,z)=>{const G=GAT(x,z);if(G)return 0;if(nearLine(GL,x,z).d<60)return 0;return treadK(x,z);}});return L;})();
// THE BUTTES: the risers' outliers, grey sandstone tables standing off the faces (KSTACKS butte; each foot under the lowest ground round it)
var ROCKS=[];
(function(){const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<16;i++){const a=i/16*TAU;m=Math.min(m,STATION.terrainH(x+Math.cos(a)*r,z+Math.sin(a)*r));}return m-2;};
 const B=[{x:-1900,z:1500,t:[[48,70,1.35,.6],[30,46,1.2,.6]],sd:1},{x:-2300,z:560,t:[[36,52,1.2,2.1],[22,30,1.1,2.1],[14,16,1,2.1]],sd:2},
  {x:-800,z:2150,t:[[58,62,1.5,.9]],sd:3},{x:1250,z:420,t:[[40,48,1.25,.7],[26,30,1.15,.7]],sd:4}];
 B.forEach(b=>{const r0=b.t[0][1]*b.t[0][2];ROCKS.push(KSTACKS.make({id:'tiers-butte-'+b.sd,kind:'butte',x:b.x,z:b.z,y0:footY(b.x,b.z,r0),seed:64110+b.sd,
  tiers:b.t.map(([h,r,e,ry])=>({h,r,e,ry})),bed:[2,5],weather:.6,shoulder:b.t.length>2?{h:10,back:6,bed:[1.5,3]}:null}));});
 ROCKS.forEach((S,i)=>{S.name=i<3?'A butte off the lower riser (the great tread\'s outlier, grey sandstone)':'A butte off the next step (an outlier on the tread)';});})();
STATION.ROCK.push(...ROCKS);
/* THE GORGE'S FLASH FLOOD (44g: TIERS_FLOOD): a storm on the next step drains into the dry gorge and runs from its sapped head to the hanging lip
   and over it; the floor's width, 3 m at the crest, its front 4 m/s (the lip ~11 minutes after the head) (89f draws it; 88 registers its segments) */
/* the line from 80 m into the sapped head (its tip is the bowl's wall) to the hanging lip */
const GORGE_LINE=(function(){const G=STATION.GL,a=G[0],b=G[1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);return[[a[0]+(b[0]-a[0])*80/l,a[1]+(b[1]-a[1])*80/l],...G.slice(1)];})();
STATION.FLOODS=[TIERS_FLOOD({id:'tiers-gorge-flood',name:'The dry gorge\'s flash flood',line:GORGE_LINE,floor:(x,z)=>STATION.terrainH(x,z),w:22,depth:3,seg:80,front:4,period:2400,
 tell:{sign:'a roar up the gorge under a storm on the next step, drift lines of grey mud on the walls, the cobbles freshly sorted',colour:'#6a5a4a'}})];
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=null,FALLS=[],SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The Great Tread (tiers station 4)',title:'Krator biome — the Tiers: the Great Tread',build_id:'tiers-tread',
 hint:'Station 4 of the Tiers: the cold stair (scale model 5.1 px 1310,490; 4,637 m, 0.90 atm, Dsc, 31 mm, +2 degC): the high steps\' first tread between its risers, the next step above it and the great tread below, buttes standing off the faces, a dry gorge cut into the tread, a herders\' summer camp and its flocks (stand-ins until kits/coyote); the crown\'s ice on the skyline',
 region:{name:'The Great Tread (station 4)',x:0,z:0,r:TERR.R},sky:{px:SITE.sky[0],py:SITE.sky[1]},atm:atmAt(4637),cloud:.12,
 fog:{falloff:1/1400,sun:.25,sky:.25},climate:{},wet:false,groundN:780,
 groundLayers:['steppe','pave','lichen','gravel'],
 plants:['tiergrass','pagoda','cushion','lichen','boulder','stone','tlip','beddinghouseleek','stepastragalus','pagodarhubarb','treadbistort'],
 modelTol:40,
 /* THE HOUR: 16:30, the sun low in the north-west: the risers' faces (they look south-west) lit along their strike, the tread's stones long-shadowed */
 hour:16.5,
 hzSky:.45,   /* the dry gorge's floor in its own shade: the horizon shade's sky term eased (src/84-host-horizon.js) */
 /* the station's sculpts, out of the model check: the stair itself (the flattened tread, both risers, the gorge): everything off the site's own ground */
 sculpt:(x,z)=>Math.abs(STATION.terrainH(x,z)-STATION.base(x,z))>30,
 farLabel:'The Tiers past the map: the great tread south-west to the White Step\'s rim, the Grey Steps up to the crown\'s ice, the Chung-Gel\'s gorge (the scale model 5.1)',
 /* the neighbours' trees, read in place (station.json): the eastern badlands' Utah juniper on the risers' feet and benches (the talus holds what
    rain there is) and the bristlecone on the high rock (PLAN.md section 4, "Read in place": the great tread and the high steps) */
 kin:[{ref:'ebadlands.juniper',key:'juniper',name:'Utah juniper (the eastern badlands\', read in place)',cell:70,minR:5,accept:Z=>(Z.talus*.25+Z.ledge*.14)*(1-Z.cliff)},
  {ref:'ebadlands.bristlecone',key:'bristlecone',name:'Bristlecone pine (the eastern badlands\', read in place)',cell:60,minR:6,accept:Z=>(Z.ledge*.3+Z.talus*.06)*(1-Z.cliff)}],
 /* no buckets in the profile: the tread's middle grows no tree (the junipers keep to the talus and the ledges) */
 exportBox:null,exportProfile:['registry','items','materials','textures','terrain','stage','atmos','hazards'],
 prebuild:()=>typeof CAMP!=='undefined'&&CAMP.build?CAMP.build():null,
 build:()=>typeof CAMP!=='undefined'&&CAMP.flocks?CAMP.flocks():null,   /* the flocks after the kit's plants, on BIO's clock */
 hazards:()=>{const out=[];
  /* rockfall under both faces (crush) and the fall off both rims (fall): every 400 m along each rim on the page */
  for(const [P,W,nm] of [[STATION.UP,STATION.RU,'the next step'],[STATION.LO,STATION.RL,'the lower riser']]){const Ls=[0];for(let i=1;i<P.length;i++)Ls.push(Ls[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
   for(let s=200;s<Ls[Ls.length-1];s+=400){let i=0;while(i<Ls.length-2&&Ls[i+1]<s)i++;const u=(s-Ls[i])/(Ls[i+1]-Ls[i]),x=P[i][0]+(P[i+1][0]-P[i][0])*u,z=P[i][1]+(P[i+1][1]-P[i][1])*u;
    if(Math.abs(x)>2400||Math.abs(z)>2400)continue;const ux=(P[i+1][0]-P[i][0])/(Ls[i+1]-Ls[i]),uz=(P[i+1][1]-P[i][1])/(Ls[i+1]-Ls[i]),nx=uz,nz=-ux;   /* toward the foot (south-west) */
    out.push({name:'Rockfall under '+nm,kind:'crush',x:x-nx*(W.run+30),z:z-nz*(W.run+30),r:60,h:24,danger:.45,tell:{sign:'fresh grey blocks on the talus, pale scars on the face'}});
    out.push({name:'The edge of '+nm+' (a '+W.h+' m drop)',kind:'fall',x,z,r:30,h:14,danger:.6,tell:{sign:'the rim\'s lip and the open air past it'}});}}
  /* the gorge's dry fall where it hangs over the lower riser (fall) and its stepped walls (fall) */
  {const e=STATION.GL[STATION.GL.length-1];out.push({name:'The dry gorge\'s hanging lip (a dry fall over the lower riser)',kind:'fall',x:e[0],z:e[1],r:40,h:16,danger:.65,tell:{sign:'the gorge\'s floor ending in air'}});
   const m=STATION.GL[2];out.push({name:'The dry gorge\'s stepped walls',kind:'fall',x:m[0],z:m[1],r:200,h:20,danger:.4,tell:{sign:'ledges of grey rock dropping in steps to a cobble floor'}});}
  /* the cold: frost every night of the year, -21 degC in the worst of winter (cold), and the tread's dust storms (exposure) */
  out.push({name:'The tread\'s night frost (-11 degC the coldest month\'s mean)',kind:'cold',x:0,z:0,r:2400,h:40,danger:.35,tell:{sign:'rime on the stones at dawn, a herder\'s fire'}});
  STATION.FLOODS.forEach(F=>out.push(...F.records));   /* the gorge's flash flood (drown on a cycle, the current's pull) */
  return out;},
 hazardMin:6,
 views:H=>{const {look,atRec,nearRec}=H,G=STATION.GL;
  const V={
  'The tread and the next step':look(-700,-300,2,900,-1400,70),
  'The great tread from the rim':look(-1600,560,25,-2600,1500,0),
  'The lower riser from the great tread':look(-2300,1900,3,-1300,900,90),
  'The dry gorge':look(G[3][0]+70,G[3][1]-55,4,G[1][0],G[1][1],-30),
  'The hanging lip of the gorge':look(G[5][0]-260,G[5][1]+220,8,G[5][0],G[5][1],-40),
  'The butte off the next step':look(700,900,3,1250,420,30),
  'The summer camp':look(-200,-420,9,-450,-650,1),
  'From afar':look(-2900,2900,700,0,-300,100)};
  return V;},
 /* THE CAMP'S CHECKS: the band pitched whole on the tread (no tent short, no two boxes within the gap, every box on good ground), every record
    registered in core/tags and pending (kits/coyote) before it is drawn, and the flocks out on the steppe and off the camp */
 checks:add=>{add('the summer camp pitched whole on the tread',CAMP_CHK.pitch(CAMP.C,CAMP.ok));add('the camp is records first, registered and pending',CAMP_CHK.reg(CAMP.records,REG));
  add('the flocks graze the steppe off the camp',CAMP_CHK.flocks(CAMP.flocksList,CAMP.records));},
 negatives:add=>{const C=CAMP.C;if(!C)return;const r0=C.records[0],twin=Object.assign({},r0,{id:'test:twin',x:r0.x+.5});
  add('two tents pitched on one spot',CAMP_CHK.pitch(Object.assign({},C,{records:C.records.concat([twin])}),CAMP.ok));
  add('a camp record never registered',CAMP_CHK.reg(CAMP.records.concat([{id:'test:unregistered'}]),REG));
  add('a flock in the camp',CAMP_CHK.flocks(CAMP.flocksList.concat([{name:'test',n:5,x:r0.x,z:r0.z}]),CAMP.records));},
 probes:{}};
/* the camp's checks: plain functions of the records (verify.py --assert reads them; each with a fault in LAND.negatives) */
const CAMP_CHK={
 pitch(C,ok){if(!C)return{ok:false,detail:'no camp'};const k=KCAMP.check(C,{ok}),short=(C.short||[]).length;
  return{ok:!k.overlaps&&!k.offGround&&!short,detail:C.records.length+' records, '+k.overlaps+' overlaps, '+k.offGround+' off the ground, '+short+' short'};},
 reg(R,reg){if(!R.length)return{ok:false,detail:'no camp records'};const ids=new Set(reg.filter(r=>r.pending).map(r=>r.id)),miss=R.filter(r=>!ids.has(r.id));
  return{ok:!miss.length,detail:R.length+' records, '+miss.length+' not registered pending'+(miss.length?' ('+miss[0].id+')':'')};},
 flocks(F,R){if(!F.length)return{ok:false,detail:'no flocks'};let worst=1e9,bad=0;for(const f of F){let d=1e9;for(const r of R)d=Math.min(d,Math.hypot(r.x-f.x,r.z-f.z));worst=Math.min(worst,d);if(d<40)bad++;}
  return{ok:!bad,detail:F.length+' flocks, '+F.reduce((s,f)=>s+f.n,0)+' beasts, the nearest '+Math.round(worst)+' m from a tent or fold'};}};
