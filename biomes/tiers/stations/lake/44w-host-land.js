// ================================================================= HOST — STATION 1, THE LAKE OF THE TIERS: its land
// PLAN.md sections 9 and 10a: the upper lake's north shore, centred on the drawn shore at 5.1 px 1262,513.4 (the pin, 1262,512, stands 4 km from the
// water). The page is the model's own surface (44v: MODEL.h through its 2 km cells): the ground falls from ~1,400 m in the north-east corner to the
// water at 1,150 m, which fills the page's south-west (a bay of the upper lake, 2,416 km2, its far shore 30 km south), and the east riser of the
// lake rises 3-6 km east (the far field: Cfa on its face, 1,286 mm). Csa at the lake (455 mm on the north shore, 20 degC, 1.36-1.39 atm). On it the
// station sets:
//   THE BLACK STEP     the basalt riser's foot drawn as a cliff (KRELIEF.scarp: 64 m over a 72 m run, two ledges, two gullies, a talus foot)
//                      across the page's north-east, its tread stepping back level behind the rim (the model's 2 km cells smear a riser into a
//                      slope: PLAN.md section 1, "the kit draws them as cliffs"); its beds the Black Step's flows (44r: tiers-black)
//   THE LAKE           a WATER.open over the ground's bed (89w), still: the model's bay deepened threefold under the level (the model's bed lies
//                      within 20 m of the level across the page), so the shallows grade into deep water within a few hundred metres
//   THE STEP MOSS      a seep at the riser's foot and the step moss's rimstone pools stepping down from it (WATER.terraces: PLAN.md section 4)
//   THE STACKS         basalt spires the riser left standing on the shore and in the shallows (KSTACKS: section 2's outliers)
//   THE VILLAGE        a fishing village on the shore (86: KHAMLET.village, every building pending until kits/coyote) and its terraced fields
//                      climbing toward the riser (the ground stepped into treads in the fields' outline; their crops as section 4 names them)
//   THE ROADS          the lake road along the shore, the stair road from the village up a gully of the Black Step onto its tread
// The far field (83) carries the model on 118 km: the lake south to its far shore, the east riser, the stair to the crown in the north-east.
const STATION=(function(){
 const LV=1150;   /* the upper lake's level (the model's wl: 1,149.7 m) */
 const base0=(x,z)=>MODEL.h(x,z);
 // THE BLACK STEP: the rim from the page's north-west edge to its east edge, the tread (the plateau) on its north-east (side -1)
 const RIM=[[-900,-2900],[300,-1900],[1300,-950],[2200,-250],[3000,350]];
 const W=KRELIEF.scarp({pts:RIM,side:-1,h:64,run:72,power:1.7,benches:{n:2,w:8},ravines:{n:2,w:[18,30],head:[40,90],depth:[14,30],power:1.6},
  buttresses:{sp:260,w:.28,amp:14},talus:{h:7,reach:55},rim:{lip:1.5,w:8},warp:{amp:26,scale:1/420},rough:.02,ends:500,seed:61201});
 /* behind the rim the step stands back level: the scarp's height eased out over 1.4 km, against the model's rise (~0.045), so the tread is flat */
 const sideOf=(x,z)=>{const L=nearLine(RIM,x,z),i=L.i,a=RIM[i],b=RIM[i+1],ux=b[0]-a[0],uz=b[1]-a[1],l=Math.hypot(ux,uz),nx=-uz/l,nz=ux/l;return{d:L.d,s:Math.sign((x-a[0]-ux*L.u)*nx+(z-a[1]-uz*L.u)*nz)};};
 const step=(x,z,g)=>{const y=KRELIEF.shape(W,x,z,g),S=sideOf(x,z);return S.s<0?g+(y-g)*(1-smooth(60,1400,S.d)):y;};
 // THE STEP MOSS'S SEEP: a spring at the riser's foot (where the basalt's base meets the soft beds: the seep line), its water stepping down the
 // slope south-west through rimstone pools (WATER.terraces), each tread a still pool held by a tufa dam the moss builds; the line ends in the
 // shore's reed bed. Treads from the base ground's own heights along the line (a pool 0.35 m under its tread's start)
 const SEEP=[[1430,-470],[1340,-370],[1250,-250],[1150,-140],[1060,-20],[990,90]];
 const g1=(x,z)=>step(x,z,base0(x,z));
 const STAIR=(function(){const L=[0];for(let i=1;i<SEEP.length;i++)L.push(L[i-1]+Math.hypot(SEEP[i][0]-SEEP[i-1][0],SEEP[i][1]-SEEP[i-1][1]));const tot=L[L.length-1];
  const at=s=>{let i=0;while(i<L.length-2&&L[i+1]<s)i++;const u=(s-L[i])/(L[i+1]-L[i]);return[SEEP[i][0]+(SEEP[i+1][0]-SEEP[i][0])*u,SEEP[i][1]+(SEEP[i+1][1]-SEEP[i][1])*u];};
  const n=14,rs=4,len=(tot-(n-1)*rs)/n,treads=[];let s=6;
  for(let k=0;k<n;k++){const s0=s,s1=Math.min(tot-2,s+len-2),p=at(s0),q=at(s1),y=Math.min(g1(p[0],p[1]),g1(q[0],q[1]))-.35;
   treads.push({s0,s1,y:k&&y>treads[k-1].y-.4?treads[k-1].y-.4:y,w:k<2?3.2:5.5});s=s1+rs;if(s>tot-6)break;}
  return{treads,at,tot};})();
 const TER=WATER.terraces({name:'The step moss\'s pools (rimstone, the seep down from the Black Step)',line:SEEP,treads:STAIR.treads,speed:.5,spread:1.6});
 /* the ground under the stair: each tread dug to its pool's floor (the level less 0.4 m) inside the line's ribbon, its dam a lip at the tread's
    downstream end; between treads the ground as it was (the riser's fall) */
 const stairCut=(x,z,g)=>{const A=TER.at?TER.at(x,z):null;if(!A||A.kind!=='tread')return g;const L=nearLine(SEEP,x,z),w=STAIR.treads[A.index].w*.5;
  return Math.min(g,mix(A.level-.4,g,smooth(w*.7,w+1.5,L.d)));};
 // THE LAKE: the model's bed deepened threefold under the level (the shoreline, the level's contour, does not move)
 const lakeDeep=(g)=>g<LV?LV-(LV-g)*3:g;
 // THE TERRACED FIELDS: the slope between the village and the riser's foot stepped into treads (2.4 m a riser), level in their outline
 const FIELDS=[[-950,-520],[-300,-1150],[420,-1050],[1050,-640],[1180,-330],[760,-120],[100,40],[-600,120]];
 const farmK=(x,z)=>{if(!inPoly(FIELDS,x,z))return 0;const L=nearLine(FIELDS.concat([FIELDS[0]]),x,z);return smooth(0,26,L.d)*(1-smooth(-.5,.2,TER.contains&&TER.contains(x,z)?1:-1));};
 const TS=2.4,terrace=(g,k)=>{if(k<=0)return g;const f=g/TS,i=Math.floor(f),fr=f-i;return mix(g,TS*(i+smooth(.78,1,fr)),k);};
 // THE ROADS: the lake road along the shore, 40-80 m above the water; the stair road from the village up the riser's first gully onto its tread
 const RV=W.ravines.slice().sort((a,b)=>Math.hypot(a.x-200,a.z+1700)-Math.hypot(b.x-200,b.z+1700))[0];
 const ROADS=[
  {name:'The lake road (along the north shore)',pts:[[-2800,820],[-2000,560],[-1300,360],[-500,240],[300,170],[1100,40],[1900,-60],[2800,-180]],w:4},
  {name:'The stair road (up the Black Step to its tread)',pts:[[-250,230],[-120,-300],[RV.x+RV.nx*240,RV.z+RV.nz*240],[RV.x+RV.nx*40,RV.z+RV.nz*40],[RV.x-RV.nx*120,RV.z-RV.nz*120],[RV.x-RV.nx*600+400,RV.z-RV.nz*600-300]],w:3}];
 const roadD=(x,z)=>{let d=1e9;for(const R of ROADS)d=Math.min(d,nearLine(R.pts,x,z).d/R.w);return d;};
 function ground(x,z){let h=g1(x,z);h=lakeDeep(h);h=terrace(h,farmK(x,z));h=stairCut(x,z,h);
  /* the roads' bed: a little worn into the slope, never a cut */
  const rd=roadD(x,z);if(rd<2)h-=.35*smooth(2,0,rd);return h;}
 const ATw=(x,z)=>KRELIEF.at(W,x,z);
 /* the scarp's bare rock: its face, its gullies' walls and its rim's lip; the ledges hold soil (the ledge heath's) */
 const faceK=(x,z,sl)=>{const a=ATw(x,z);if(!a)return 0;return a.part==='face'||a.part==='ravine'||a.part==='buttress'?smooth(.12,.35,sl):a.part==='rim'?.5*smooth(.15,.4,sl):a.part==='bench'?.35:0;};
 const PAVE=KRELIEF.pavement({h:ground,ground:base0,wadis:[],slope:[.05,.18],seed:61202});
 const SEEPK=(x,z)=>{const L=nearLine(SEEP,x,z);return smooth(26,4,L.d)*(L.t<.02?smooth(-30,0,-Math.hypot(x-SEEP[0][0],z-SEEP[0][1])+30):1);};
 /* station 1 needs the lake for its region and its water: one open surface (89w draws it), inside the ground's water test where the ground is under
    the level and the model's water cells stand within a cell (the far bay's outline) */
 const nearUpper=(x,z)=>{const C=MODEL.cell;for(const [dx,dz] of [[0,0],[C*.6,0],[-C*.6,0],[0,C*.6],[0,-C*.6]]){const w=MODEL.water(x+dx,z+dz);if(w!=null&&Math.abs(w-LV)<5)return true;}return false;};
 const L=tiersLand({R:2600,ground,
  lakes:[{name:'The Lake of the Tiers (the upper lake, 1,150 m)',kind:'lake',level:LV,open:true,inside:(x,z)=>nearUpper(x,z)&&ground(x,z)<LV+.5,area:2416e6}],
  rockAt:(x,z,h,sl)=>Math.max(faceK(x,z,sl),smooth(.6,.9,sl)),
  strataK:(x,z,h,sl)=>Math.max(faceK(x,z,sl),smooth(.45,.8,sl)),
  talus:(x,z)=>{const a=ATw(x,z);const t=a&&a.part==='talus'?1-smooth(0,1,(a.d-W.run)/55):0;if(!ROCKS.length)return t;const f=KSTACKS.foot(ROCKS,x,z);return Math.max(t,f?smooth(16,2,f.d):0);},
  pave:(x,z)=>PAVE(x,z)*.6*smooth(1.5,3,roadD(x,z)),
  /* the rain: 455 mm on the north shore, more toward the east riser (the rain line: Cfa on its face); the seep's line and the shore wetter */
  wet:(x,z)=>.42+.18*smooth(-1500,2600,x-z*.5),
  seep:SEEPK,
  ledge:(x,z)=>{const a=ATw(x,z);return a&&a.part==='bench'?1:0;},
  tread:(x,z)=>{const S=sideOf(x,z);return S.s<0?smooth(30,140,S.d):0;},
  farm:farmK,
  road:(x,z)=>smooth(1.6,.6,roadD(x,z)),
  strata:TIERS_STRATA({}),
  spine:[[0,0],[-1200,500],[-600,600],[-2000,1500],[300,-600],[900,-1100],[1500,-1300],[1300,-300],[1100,-20],[-300,250],[1900,-1800],[-1800,-800]]});
 Object.assign(L,{LV,W,RIM,RV,SEEP,TER,STAIR,FIELDS,ROADS,roadD,base:base0,sideOf,faceK,farmK});return L;})();
// THE STACKS: basalt spires and a fin the riser left on the shore and in the shallows of the bay (KSTACKS.cluster; each foot under the lowest ground)
var ROCKS=[];
ROCKS=KSTACKS.cluster({id:'tiers-shore-stacks',seed:61211,c:[-1700,1350],rad:650,n:5,H:[14,42],r:[5,11],gap:60,kinds:{spire:.6,fin:.25,balanced:.15},taper:[.3,.55],lean:[0,.08],e:[1,1.5],
 crown:[.5,1],plates:[2,5],platesShare:.6,ground:(x,z)=>{let m=1e9;for(let i=0;i<12;i++){const a=i/12*TAU;m=Math.min(m,STATION.terrainH(x+Math.cos(a)*9,z+Math.sin(a)*9));}return m-1.5;},
 accept:(x,z,r)=>Math.hypot(x,z)<2600-r-60&&STATION.terrainH(x,z)>STATION.LV-14&&STATION.roadD(x,z)>r/3+8});
ROCKS.forEach(B=>{B.name=B.kind==='fin'?'A basalt fin (the Black Step\'s, standing in the bay)':B.kind==='balanced'?'A balanced basalt stack':'A basalt spire (the Black Step\'s outlier)';});
STATION.ROCK.push(...ROCKS);
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=null,FALLS=[],SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The Lake of the Tiers (tiers station 1)',title:'Krator biome — the Tiers: the Lake of the Tiers',build_id:'tiers',
 hint:'Station 1 of the Tiers: the upper lake\'s north shore (scale model 5.1 px 1262,513.4; 1,150-1,400 m, 1.36-1.39 atm, Csa), the placid lake to the south, the Black Step\'s basalt riser behind, a Coyote fishing village (stand-ins until kits/coyote) and its terraced fields; everything that grows here grows in tiers',
 region:{name:'The Lake of the Tiers (station 1)',x:0,z:0,r:TERR.R},sky:{px:SITE.sky[0],py:SITE.sky[1]},atm:atmAt(1180),cloud:.22,
 fog:{falloff:1/700,sun:.3,sky:.3},climate:{},wet:false,groundN:780,
 groundLayers:['meadow','steppe','terrace','lichen'],
 plants:['tiergrass','heath','reed','pad','moss','lichen','boulder'],
 modelTol:40,
 /* the station's sculpts, out of the model check: the Black Step and its tread (within 1.6 km behind the rim, 250 m before it), the lake's bed
    (deepened), the fields' treads */
 sculpt:(x,z)=>{const S=STATION.sideOf(x,z);return (S.s<0&&S.d<1600)||(S.s>0&&S.d<250)||STATION.base(x,z)<STATION.LV+2||STATION.farmK(x,z)>0;},
 farLabel:'The Tiers past the map: the upper lake south, the east riser, the stair to the crown (the scale model 5.1)',
 /* the neighbours' trees, read in place (station.json): the eastern badlands' Fremont cottonwood where the seep's water reaches the shore, and its
    Utah juniper and pinyon on the Black Step's dry tread (PLAN.md section 4, "Read in place": the canyon floors with water, the riser feet) */
 kin:[{ref:'ebadlands.cottonwood',key:'cottonwood',name:'Fremont cottonwood (the eastern badlands\', read in place)',cell:60,minR:7,accept:Z=>Z.seep*.6+Z.wetShore*.05},
  {ref:'ebadlands.juniper',key:'juniper',name:'Utah juniper (the eastern badlands\', read in place)',cell:34,minR:4,accept:Z=>Z.tread*.22+Z.dry*.03},
  {ref:'ebadlands.pinyon',key:'pinyon',name:'Pinyon pine (the eastern badlands\', read in place)',cell:44,minR:4,accept:Z=>Z.tread*.15}],
 exportBox:null,exportProfile:['registry','items','buckets','materials','textures','terrain','stage','atmos','hazards','water'],
 prebuild:()=>typeof VILLAGE!=='undefined'?VILLAGE.build():null,
 hazards:()=>{const out=[],W=STATION.W,R=STATION.RIM;
  /* rockfall under the Black Step's face (crush), the fall off its rim (fall): every 300 m along the rim, the foot run+20 m out */
  {const L=[0];for(let i=1;i<R.length;i++)L.push(L[i-1]+Math.hypot(R[i][0]-R[i-1][0],R[i][1]-R[i-1][1]));
   for(let s=150;s<L[L.length-1];s+=300){let i=0;while(i<L.length-2&&L[i+1]<s)i++;const u=(s-L[i])/(L[i+1]-L[i]),x=R[i][0]+(R[i+1][0]-R[i][0])*u,z=R[i][1]+(R[i+1][1]-R[i][1])*u;
    if(Math.abs(x)>2400||Math.abs(z)>2400)continue;const ux=(R[i+1][0]-R[i][0])/(L[i+1]-L[i]),uz=(R[i+1][1]-R[i][1])/(L[i+1]-L[i]),nx=uz,nz=-ux;   /* toward the floor (side -1) */
    out.push({name:'Rockfall under the Black Step',kind:'crush',x:x-nx*(W.run+20),z:z-nz*(W.run+20),r:45,h:20,danger:.45,tell:{sign:'fresh basalt blocks on the talus, pale scars on the face'}});
    out.push({name:'The Black Step\'s edge (a 60 m drop)',kind:'fall',x,z,r:25,h:12,danger:.6,tell:{sign:'the rim\'s lip and the open air past it'}});}}
  /* the lake's drop-off off the village's shore (drown): where the shallows end */
  for(const p of [[-1300,820],[-700,760],[-2100,1000]]){const y=STATION.LV;out.push({name:'The lake\'s drop-off (the shallows end in deep water)',kind:'drown',x:p[0],z:p[1]+260,y:y-12,r:120,h:14,danger:.4,tell:{sign:'the water darkening past the reeds'}});}
  /* the step moss's tufa (slip) */
  {const S=STATION.SEEP,m=S[Math.floor(S.length/2)];out.push({name:'Wet tufa on the step moss\'s dams (slippery)',kind:'slip',x:m[0],z:m[1],r:260,h:6,danger:.25,tell:{sign:'green-slick lime rims and running water'}});}
  return out;},
 hazardMin:6,
 views:H=>{const {look,gh,solidH,atRec,nearRec}=H,RV=STATION.RV,S=STATION.SEEP;
  const V={
  'The lake from the north shore':look(-900,520,3,-2600,2600,-40),
  'The Black Step over the fields':look(-200,250,6,900,-1250,30),
  'The Black Step from its foot':look(616,-1246,2,906,-1536,24),
  'The village on the shore':look(-900,620,9,-250,250,3),
  'The step moss pools':look(S[5][0]+10,S[5][1]+30,12,S[2][0],S[2][1],0),
  'Reeds and stair lilies in the bay':look(-1150,730,3,-1500,1100,-4),
  'The stacks in the bay':look(-900,900,4,-1700,1350,10),
  'From the rim of the Black Step':look(RV.x-RV.nx*160+260,RV.z-RV.nz*160-120,4,-1500,1800,-60),
  'The stair road up the gully':look(RV.x+RV.nx*320,RV.z+RV.nz*320,3,RV.x,RV.z,20),
  'From afar':look(2900,-2900,700,-600,800,0)};
  const T=nearRec&&nearRec('shelfoak',-600,450);if(T)V['A shelf oak on the shore']=atRec(T,T.r*2.4+8,2.3,2);
  const P=nearRec&&nearRec('steppalm',-900,650);if(P)V['Step palms at the water']=atRec(P,P.r*2.6+6,2.6,2);
  return V;},
 probes:{}};
