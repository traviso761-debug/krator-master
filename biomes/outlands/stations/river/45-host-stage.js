// ================================================================= HOST — stage: STATION 2, THE RIVER (PLAN.md section 9)
// The S basin's one perennial river (SURVEY.md section 2: 47 m3/s, from 3,887 m to a lake at 705 m) where it comes down out of the wet
// valley (S2: 5.1 px 1641,676, Cfa 2,858 m, 1,318 mm, 11 °C (24 / -2)) to the lake (1654,701, 705 m) and the hot valley floor beyond it (S3:
// 1656,719, BSh 1,089 m, 486 mm, 21 °C (31 / 10; 40 / 2)). On the model those are 25-45 km apart; the page holds the river's LOWER COURSE
// at its true heights (1.45 km at the north edge down to the lake), with S2's wet slopes standing over it as the valley's walls (to ~2.8 km
// within 2.5 km of the river): about 4x steeper than the model's walls (KNOWN_ISSUES.md), the owner's one-page rule as on station 1.
// THE MAP (x east, z south; origin the valley's middle, R 3400):
//   THE WALLS    either side of the river, rising to 2.4-2.8 km in the north, 1.3-1.6 km in the south: Cfa, the MAST COLONIES' woodland
//                (deck caps, curtain weed on the seeps, cap-shrubs, comb masts on their seams); the decay layer's log crust on fallen masts
//   THE RIVER    from the north edge (1.45 km) to the lake (705 m) in a 60 m channel (WATER.flow, its falls where the bed steepens)
//   THE FIELDS   the Valley tribe's terraced fields on the benches either side of the lower river (0.75-1.25 km), 6 m treads, and their
//                village (mud-brick houses as records: the culture kit, kits/coyote, is later)
//   THE LAKE     the 705 m lake in the south-west (WATER.open), its shallows the RIVER COLONY's (pipe reeds, mire pads, glow bells)
//   THE FLOOR    the BSh floor south and east of the lake, 0.75-1.1 km, dry
// The Earth-like three (spring palm, withy willow, field weeds; PLAN.md section 4) are owed: they are read in place from the nearest kits'
// palm and willow builders when their turn comes (KNOWN_ISSUES.md); the fields stand without them.
const STAGE={key:'river',title:'the River',seed:5200,site:{px:1376,py:368}};
STAGE.hint='The Outlands, station 2: the River, the S basin\'s one perennial river coming down out of the wet valley (Cfa) to the 705 m lake and the hot valley floor (BSh). The flora is COLONIAL: the mast colonies hold the walls (deck caps, curtain weed on the seeps, cap-shrubs, comb masts standing in lines on their seams); the river colony holds the lake\'s shallows (pipe reeds, floating mire pads, glow bells lit at night). The Valley tribe\'s terraced fields and village stand on the benches by the lower river';
const SUN_POS2=[-700,1300,1000];sun.position.set(...SUN_POS2);sun.intensity=1.4;HEMI.intensity=.86;
scene.fog.density=.00011;HAZE.set(0xc6ccd0);scene.fog.color.copy(HAZE);
// ---------------------------------------------------------------- the land
const LAKE_L=705;
// the river's line (x at z) and its profile: graded, steepening in two reaches (the falls)
const rivX=z=>380+260*Math.sin(z*.0009+.6)+110*Math.sin(z*.0023+2.1)-260*smooth(500,1500,z);
const RIV_Z1=1250;   /* the river's mouth on the lake */
function rivG(z){const t=clamp((z+3600)/(RIV_Z1+3600),0,1);return LAKE_L+745*Math.pow(1-t,1.2);}
// the valley's walls: relief over the river by z, the floor's half-width, the walls' width
const relief=z=>mix(1300,520,smooth(-3400,1800,z));
const floorW=z=>mix(90,320,smooth(-2500,1200,z));
function valleyH(x,z){const d=Math.abs(x-rivX(z)),w=floorW(z),A=relief(z),side=x<rivX(z)?1:-1;
 const u=smooth(w,w+2300,d+120*(fbm(x*.0011,z*.0011,561,2)-.5));
 return rivG(z)+A*Math.pow(u,1.25)*(1+.08*side)+22*(fbm(x*.0013+5,z*.0013+1,563,3)-.5)*smooth(w*.6,w*1.4,d)+6*(fbm(x*.005,z*.005,565,2)-.5);}
// the lake's basin in the south-west: a bowl under the level
const LAKE={x:-1350,z:2350,rx:2100,rz:1300};
const lakeD=(x,z)=>Math.hypot((x-LAKE.x)/LAKE.rx,(z-LAKE.z)/LAKE.rz)+.08*(fbm(x*.002,z*.002,567,2)-.5);
function land0(x,z){let h=valleyH(x,z);const ld=lakeD(x,z);
 /* the floor round the lake: the BSh valley floor at 0.72-1.1 km, rising south-east */
 const floorH=LAKE_L+18+.06*Math.max(0,x-LAKE.x)+.05*Math.max(0,z-LAKE.z)+10*(fbm(x*.003,z*.003,569,2)-.5);
 const fl=smooth(-400,900,z);h=mix(h,Math.min(h,floorH+Math.max(0,h-floorH)*.35),fl);
 if(ld<1.25)h=mix(h,LAKE_L-16*smooth(1,.35,ld)-.8,smooth(1.25,.95,ld));
 return h;}
// THE CHANNEL: 60 m of floor round the river line, the bed 2.5 m under the floor's grade, cut into the valley floor
function chanCut(x,z,h){const d=Math.abs(x-rivX(z));if(d>45||z>RIV_Z1+150)return h;const g=rivG(Math.min(z,RIV_Z1))-2.6;return mix(h,Math.min(h,g),smooth(45,22,d));}
// THE FIELDS: terraced benches on the walls' feet either side of the lower river (0.75-1.25 km), treads of 6 m rise
const FIELDZ=(x,z)=>{const d=Math.abs(x-rivX(z));return smooth(-1500,-900,z)*smooth(1350,900,z)*smooth(60,140,d)*smooth(900,600,d)*(.6+.4*fbm(x*.002,z*.002,571,2));};
function terrace(h,k){if(k<.05)return h;const s=6,q=Math.floor(h/s)*s,f=(h-q)/s,t=q+s*smooth(.78,1,f);return mix(h,t,k);}
function land1(x,z){let h=land0(x,z);const fk=FIELDZ(x,z);if(fk>.05&&h>LAKE_L+3)h=terrace(h,smooth(.2,.6,fk));return chanCut(x,z,h);}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=land1(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the river's water: 1.6 m over its bed, graded; the lake's at its level
const rivW=z=>rivG(Math.min(z,RIV_Z1))-1.0;
function waterH(x,z){if(z<RIV_Z1+150&&Math.abs(x-rivX(z))<24)return Math.max(rivW(z),z>RIV_Z1-200?LAKE_L:-1e9);
 if(lakeD(x,z)<1.3&&terrainH(x,z)<LAKE_L)return LAKE_L;return -1e9;}
const POOLS=[];
// THE VILLAGE: the Valley tribe's mud-brick houses on a bench above the east bank (records, plain meshes)
const VILLAGE={x:rivX(-200)+420,z:-200,r:110};
// the decay layer's dead wood: fallen masts on the walls' middle heights; the fields and the village kept clear
// ---------------------------------------------------------------- the fields
const SPINE=[];for(let z=-3000;z<=1400;z+=600)SPINE.push([rivX(z),z],[rivX(z)-900,z],[rivX(z)+900,z]);SPINE.push([LAKE.x,LAKE.z-900],[LAKE.x+900,LAKE.z-600],[VILLAGE.x,VILLAGE.z]);
const NEAR=STAGEKIT.nearField(SPINE,90,260);
function fieldsAt(x,z,h,slope){const d=Math.abs(x-rivX(z)),ld=lakeD(x,z),lakeEdge=ld<1.3?smooth(4,0,Math.abs(h-LAKE_L))*smooth(1.3,1,ld):0,riv=z<RIV_Z1+150?smooth(70,30,d):0;
 const wall=smooth(floorW(z),floorW(z)+300,d)*smooth(800,-200,z),field=FIELDZ(x,z)*(h>LAKE_L+3?1:0),seep=clamp(smooth(.35,.6,slope)*.4*fbm(x*.01,z*.01,573,2)*2*wall+riv*.5,0,1);
 const wet=clamp(.35+.4*wall+.4*riv+.5*lakeEdge,0,1),inV=Math.hypot(x-VILLAGE.x,z-VILLAGE.z)<VILLAGE.r?1:0;
 return{near:NEAR(x,z),wet,flow:riv,upland:clamp((h-700)/2000,0,1),rock:clamp(smooth(.6,.9,slope),0,1),slope,seep,mast:wall,shore:Math.max(lakeEdge,riv*.6),field,village:inV,
  deadwood:wall*smooth(1100,1600,h)*smooth(2600,2000,h),
  /* the mast colony on the walls and down onto the wet floor by the river (not the BSh floor round the lake); the river colony on the lake's
     margin and along the lower river: the two meet on the river's banks, where the comb masts stand in lines */
  z_mast:clamp((1-field)*(1-inV)*smooth(LAKE_L+12,LAKE_L+45,h)*(.65+.35*wall)*(1-smooth(300,1100,z)*(1-wall)),0,1),
  z_river:clamp(Math.max(smooth(1.35,1.05,ld)*smooth(LAKE_L+8,LAKE_L+1,h),riv*smooth(1500,700,h)),0,1)};}
const FNAMES=['near','wet','flow','upland','rock','slope','seep','mast','shore','field','village','deadwood','z_mast','z_river'];
const {FC,FIELD}=STAGEKIT.fields(FNAMES,fieldsAt,terrainH);
// ---------------------------------------------------------------- the host binding
function rootMask(x,z){const h=terrainH(x,z),d=h-waterH(x,z);let w=d<.15?0:d<.7?(d-.15)/.55:1;if(w>0&&(FIELDZ(x,z)>.15&&h>LAKE_L+3||Math.hypot(x-VILLAGE.x,z-VILLAGE.z)<VILLAGE.r))return 0;return w;}
BIO.init({tags:'outlands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:[],ticks:tick,seed:5200,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,capThrow:false,
 lod:{hero:240,mid:600,far:2600,floor:[180,460]},windows:{}});
{const Q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS2);
// ---------------------------------------------------------------- the fields and the village as records; the houses as plain meshes
const PLOTS=[];
function riverBuild(){
 // the plots: one record a 60 m cell of the field zone, its crop from the Valley tribe's package (PLAN.md section 8, kits/crops' records)
 const CROPS=['millet','sorghum','barley','chickpea','lentil','flax'];
 for(let j=-30;j<=30;j++)for(let i=-30;i<=30;i++){const x=i*60+30,z=j*60+30,k=FIELDZ(x,z),h=terrainH(x,z);if(k<.35||h<LAKE_L+3)continue;
  const crop=CROPS[KRAND.hash(5281,i,j)%CROPS.length];PLOTS.push({x,z,crop});BIO.record({kind:'field',key:'plot:'+i+'_'+j,name:'A terraced field ('+crop+'; the Valley tribe)',x,z,r:30,h:4,crop});}
 const g=new THREE.Group(),wall=new THREE.MeshLambertMaterial({color:0xb08a68}),roof=new THREE.MeshLambertMaterial({color:0x8a6a4e});let n=0;
 for(let k=0;k<14;k++){const a=KRAND.unit(KRAND.hash(5283,k,1))*TAU,d=VILLAGE.r*.85*Math.sqrt(KRAND.unit(KRAND.hash(5283,k,2))),x=VILLAGE.x+Math.cos(a)*d,z=VILLAGE.z+Math.sin(a)*d;
  const w=5+3*KRAND.unit(KRAND.hash(5283,k,3)),l=6+4*KRAND.unit(KRAND.hash(5283,k,4)),ry=KRAND.unit(KRAND.hash(5283,k,5))*TAU,y=Math.min(terrainH(x-w/2,z),terrainH(x+w/2,z),terrainH(x,z-l/2),terrainH(x,z+l/2));
  const b=new THREE.Mesh(new THREE.BoxGeometry(w,3.2,l),wall);b.position.set(x,y+1.4,z);b.rotation.y=ry;g.add(b);
  const r=new THREE.Mesh(new THREE.BoxGeometry(w+.4,.35,l+.4),roof);r.position.set(x,y+3.1,z);r.rotation.y=ry;g.add(r);n++;
  REGISTER({name:'A mud-brick house (the Valley tribe; the culture kit, later)',kind:'structure',x,z,y:y-1,r:Math.max(w,l)*.6,h:5});}
 g.traverse(o=>{if(o.isMesh){o.userData.host=true;o.userData.inspectLabel='The Valley tribe\'s village';}});scene.add(g);
 REGISTER({name:'The Valley tribe\'s village',kind:'settlement',x:VILLAGE.x,z:VILLAGE.z,y:terrainH(VILLAGE.x,VILLAGE.z)-6,r:VILLAGE.r*1.3,h:14});
 return{plots:PLOTS.length,houses:n};}
// ---------------------------------------------------------------- the stage record
const T_={loam:new THREE.Color(0x4a4434),moss:new THREE.Color(0x4e6244),green:new THREE.Color(0x5a7a42),gold:new THREE.Color(0xb09a52),brown:new THREE.Color(0x7a5e3e),
 floor:new THREE.Color(0xa88a62),floor2:new THREE.Color(0x8e7454),mud:new THREE.Color(0x5e5240),rock:new THREE.Color(0x7a6a5e),gravel:new THREE.Color(0x8e8070)};
const RIVER_PTS=(function(){const P=[];for(let z=-3700;z<=RIV_Z1+120;z+=30)P.push([rivX(z),Math.max(rivW(z),LAKE_L+.05),z]);return P;})();
Object.assign(STAGE,{
 types:['mast','river'],unlike:[['mast','river']],share:{mast:1,river:1.5},
 tint:{mast:0x3e5a46,river:0x6a7a3a},tintK:.16,
 paint(x,z,H,c,f){const p1=fbm(x*.012+5,z*.012-2,.7,2),p2=fbm(x*.03-3,z*.03+8,.9,2),m=f('mast'),fl=f('field'),sh=f('shore'),rk=f('rock'),fw=f('flow');
  c.copy(T_.floor).lerp(T_.floor2,smooth(.4,.7,p1)*.5);
  c.lerp(T_.loam,m*.7);c.lerp(T_.moss,m*smooth(.45,.7,p2)*.55);
  if(fl>.2){const strip=(Math.floor((x*.6+z*.8)/14)+Math.floor(H/6))%3;c.lerp(strip===0?T_.green:strip===1?T_.gold:T_.brown,smooth(.2,.5,fl)*.75);}
  c.lerp(T_.mud,sh*.6);c.lerp(T_.gravel,fw*.6);c.lerp(T_.rock,rk*.5);},
 layers:[{fam:'ground.grass',name:'wet loam and moss',amt:.45,gain:1.15},{fam:'ground.mud',name:'the lake\'s mud',amt:.55,gain:1.15},{fam:'ground.gravel',name:'the floor\'s gravel',amt:.4,gain:1.2}],
 gl(x,z){const m=smooth(.2,.6,FC.at(FC.a.mast,x,z)),s=smooth(.2,.7,Math.max(FC.at(FC.a.shore,x,z),FC.at(FC.a.flow,x,z)))*(1-m);return[m,s,(1-m)*(1-s)*(1-FC.at(FC.a.field,x,z))];},
 landmarks:[{name:'The river (47 m3/s, the S basin\'s one perennial river)',x:rivX(-1200),z:-1200,y:rivG(-1200)-10,r:120,h:40},
  {name:'The 705 m lake',x:LAKE.x,z:LAKE.z,y:LAKE_L-20,r:900,h:30}],
 probes:[[rivX(-1200),-1.5,-1200],[LAKE.x,-4,LAKE.z]],
 far:{h:(x,z)=>{const R=3400,cx=clamp(x,-R,R),cz=clamp(z,-R,R),b=valleyH(cx,cz),dx=Math.hypot(x-cx,z-cz);return z>2500?LAKE_L+20+.04*dx:b+.25*dx*smooth(-800,-3400,z);},
  col(x,z,y,q){const L=a=>a.map(v=>Math.pow(v/255,2.2)),G=L([74,92,70]),F=L([160,136,100]),HZ=L([198,204,208]),w=smooth(900,1500,y);
   const c=[F[0]+(G[0]-F[0])*w,F[1]+(G[1]-F[1])*w,F[2]+(G[2]-F[2])*w],t=.55*smooth(3500,10000,q.r);return[c[0]+(HZ[0]-c[0])*t,c[1]+(HZ[1]-c[1])*t,c[2]+(HZ[2]-c[2])*t];}},
 sky:{"air":{"pressure":1.3,"humidity":0.55},"clouds":{"cover":0.4,"cumulus":0.7,"cirrus":0.4},"fogDensity":0.00018,
  "ridges":[{"base":2.8,"amp":0.8,"cycles":18,"octaves":2,"seed":59,"win":[0,140,2.2],"floor":-0.2,"dist":40000,"haze":0.05,"forestH":0.2,"rock":[0.5,0.5,0.46]},
   {"base":0.6,"amp":1.0,"cycles":36,"octaves":3,"peaks":20,"peakAmp":0.8,"seed":60,"win":[[270,90,2.5],[90,90,2.5]],"floor":-0.3,"dist":20000,"haze":0.12,"forestH":0.3,"rock":[0.48,0.46,0.42]}],"landmarks":[]},
 atmos:{climate:{wet:true,cold:false},fog:{falloff:1/700,sun:.3,sky:.35}},
 water:{lakes:[{name:'The 705 m lake',label:'The 705 m lake (the river colony\'s shallows)',level:LAKE_L,box:[-3740,700,1400,3740],seed:[LAKE.x,LAKE.z],cell:6,band:40,
   land:(x,z)=>lakeD(x,z)>1.3,shallow:0x5a7a68,deep:0x234a50}],
  flows:[{name:'The river',pts:RIVER_PTS,width:RIVER_PTS.map(p=>34+10*smooth(-1000,1200,p[2])),speed:1.6,shallow:0x6a8070,deep:0x2e4a48,step:8,across:4,margin:1.6}]},
 build:{decay:true,quality:.55},decayForms:['logcrust'],
 structures:riverBuild,
 views(){const K=STAGEKIT,D=K.near('deckcap',rivX(-1800)-700,-1800),C=K.near('curtain',rivX(-1500)-300,-1500),W=K.near('combmast',rivX(-1500)+700,-1500),
   Pr=K.near('pipereed',rivX(RIV_Z1),RIV_Z1+200),Mp=K.near('mirepad',LAKE.x+600,LAKE.z-700),Gb=K.near('glowbell',LAKE.x+800,LAKE.z-800),Lg=K.near('logcrust',rivX(-2000)-800,-2000),Cs=K.near('capshrub',rivX(-1000)+600,-1000);
  return{
   'The valley from the walls':K.look(rivX(-2600)-1100,-2900,60,rivX(0),600,0),
   'The river coming down':[rivX(-1600)+70,K.gh(rivX(-1600)+70,-1600,25),-1600,rivX(-900),rivG(-900),-900],
   'The terraced fields':K.look(rivX(400)+330,600,40,rivX(-300)+250,-300,0),
   'The Valley tribe\'s village':K.look(VILLAGE.x+260,VILLAGE.z+180,40,VILLAGE.x,VILLAGE.z,3),
   'The river\'s mouth on the lake':K.look(rivX(RIV_Z1)+300,RIV_Z1-250,35,rivX(RIV_Z1)-200,RIV_Z1+400,0),
   'The 705 m lake':K.look(LAKE.x+1800,LAKE.z-1300,80,LAKE.x,LAKE.z,0),
   'Deck caps on the walls':K.at(D,24,2.6,3,(D.H==null?8:D.H)*.6),
   'Curtain weed on a seep':K.at(C,8,1.9,1.5,1.5),
   'A line of comb masts on a seam':K.at(W,30,.8,4,6),
   'Cap-shrubs':K.at(Cs,6,2.1,1.6,.5),
   'Pipe reeds in the shallows':[Pr.x+12,LAKE_L+2.2,Pr.z+8,Pr.x,LAKE_L+1.2,Pr.z],
   'Mire pads afloat':[Mp.x+10,LAKE_L+3,Mp.z+10,Mp.x,LAKE_L,Mp.z],
   'Glow bells on the shore':K.at(Gb,5,1.2,1.4,.4),
   'Log crust on a fallen mast':K.at(Lg,8,1.6,2,.4),
  };},
 checks(add){add('the fields and the village kept clear of the colonies',RVCHK.clear(OUTL.INST));add('the river graded (it never climbs)',RVCHK.graded(RIVER_PTS));},
 negatives(add){add('a deck cap in a field',RVCHK.clear([{key:'deckcap',x:PLOTS[0]?PLOTS[0].x:0,z:PLOTS[0]?PLOTS[0].z:0}]));add('a river that climbs',RVCHK.graded([[0,700,0],[0,710,30],[0,700,60]]));},
});
const RVCHK={
 clear(I){const bad=I.filter(f=>FIELDZ(f.x,f.z)>.35&&terrainH(f.x,f.z)>LAKE_L+3||Math.hypot(f.x-VILLAGE.x,f.z-VILLAGE.z)<VILLAGE.r-1);
  return{ok:!bad.length&&PLOTS.length>0,detail:bad.length?bad.length+' forms in the fields or the village (first '+bad[0].key+')':PLOTS.length+' field plots and the village, no colony form in them'};},
 graded(P){let up=0;for(let i=1;i<P.length;i++)if(P[i][1]>P[i-1][1]+.01)up++;return{ok:up===0,detail:up?up+' steps that climb':P.length+' points, every step level or down'};}};
