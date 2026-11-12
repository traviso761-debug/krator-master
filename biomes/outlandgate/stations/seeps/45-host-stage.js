// ================================================================= HOST — stage: STATION 2, THE WEST BENCH: THE WARM SEEPS (PLAN.md section 7)
// THE SITE: the gap's west side on map 5.1, px 1416,312 (the plan's first skarn seep: its "West Bench" pixel, 1441,306, lies on the EAST
// flank, the river running at 1427 on that row; KNOWN_ISSUES.md): 2,016 m, 1.23 atm, Cfa, 1,020 mm, 17 °C (27 / 7). No bench on the model is
// flat: the west side rises ~5 % to the south-west here (36 m a km west, 33 m a km south), toward the Gate shoulder (1427,351) and the NE
// Outer Wall; the page is THAT SLOPE, on the model's own heights (the station's 44f, smoothed past its 2 km cells), ~480 m from its low
// north-east corner to its high south-west one. The river and the god's road run on the floor 30 km east; the long wall is 28 km south.
// THE SEEPS (PLAN.md section 2, the skarn alcoves; section 4, the West seeps): where the Arachnoids' basalt dikes cross the wall's skarn, warm
// water comes out of the slope. Each spring has cut an ALCOVE back into it (a horseshoe hollow, its back wall a 15-20 m scarp, open
// downslope) and built a RIMSTONE STAIR below it (core/water ext 53: WATER.terraces): travertine pools stepping down the slope on a raised
// apron of their own sinter, the warm water steaming over each lip. Three springs. THE DIKE RIBS: two basalt dikes stand proud of the slope
// as rows of fins (KSTACKS), down the fall line. THE CARAVANSERAI (PLAN.md section 5, "the Skarn-Seep Hanging Caravanserai", proposed):
// a walled court on a levelled pad below the middle spring, its cistern fed by the seep, where the caravans going up the gap rest before the
// wall; its track runs east down the slope toward the floor and the god's road. Plain records and boxes (86) until the culture kit.
// THE MAP (x east, z south; north is -z; the origin the 5.1 pixel, R 3400).
const STATION_PX=[1416,312];
// ---------------------------------------------------------------- the land: the model's slope, smoothed past its cells
const base=(x,z)=>(farModel(x-600,z)+farModel(x+600,z)+farModel(x,z-600)+farModel(x,z+600)+2*farModel(x,z))/6+3*(fbm(x*.004+3,z*.004-7,6201,3)-.5);
const UP=(function(){const gx=(base(400,0)-base(-400,0))/800,gz=(base(0,400)-base(0,-400))/800,l=Math.hypot(gx,gz);return[gx/l,gz/l,l];})();   /* uphill, and the grade */
const DOWN=[-UP[0],-UP[1]];
// THE SPRINGS and their alcoves: c, the alcove's radius r and depth D; the rimstone stair runs from the alcove's floor down the fall line
const SPRINGS=[{name:'the Upper Seep',x:-1700,z:-300,r:170,D:18,len:560,seed:6211},{name:'the Serai Seep',x:-200,z:1300,r:150,D:15,len:620,seed:6213},
 {name:'the Dike Seep',x:900,z:-1900,r:130,D:14,len:480,seed:6215}];
function alcoveCut(x,z){let D=0;for(const S of SPRINGS){const dx=x-S.x,dz=z-S.z,d=Math.hypot(dx,dz);if(d>S.r)continue;const along=dx*UP[0]+dz*UP[1],
  wallW=mix(S.r*.8,22,smooth(-.3*S.r,.3*S.r,along)),w=smooth(0,wallW,S.r-d);D=Math.max(D,S.D*w);}return D;}
const raw0=(x,z)=>base(x,z)-alcoveCut(x,z);
// each stair's line (from the alcove's floor down the fall line, wandering a little) and its treads: a tread 26-60 m, its level the lowest
// raw ground over it plus .5 (the rims stand on their own sinter), a riser of 1.4 m between treads (the fall over a lip)
const STAIRS=SPRINGS.map(S=>{const P=[];let x=S.x,z=S.z;for(let s=0;s<=S.len;s+=5){P.push([x,z]);const a=.35*(fbm(s*.004,0,S.seed,2)-.5)*2;
  const c=Math.cos(a),sn=Math.sin(a);x+=5*(DOWN[0]*c-DOWN[1]*sn);z+=5*(DOWN[0]*sn+DOWN[1]*c);}
 const A=[0];for(let i=1;i<P.length;i++)A.push(A[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const L=A[A.length-1];
 const at=s=>{let i=0;while(i<P.length-2&&A[i+1]<s)i++;const t=clamp((s-A[i])/((A[i+1]-A[i])||1),0,1);return[P[i][0]+(P[i+1][0]-P[i][0])*t,P[i][1]+(P[i+1][1]-P[i][1])*t];};
 const T=[];let s=0,k=0;while(s<L-20){const len=26+34*KRAND.unit(KRAND.hash(S.seed,k,1));const s1=Math.min(L,s+len);let lo=1e9;for(let u=s;u<=s1;u+=4){const p=at(u);for(const o of[-12,0,12])lo=Math.min(lo,raw0(p[0]-DOWN[1]*o,p[1]+DOWN[0]*o));}
  const w=k===0?40:18+10*KRAND.unit(KRAND.hash(S.seed,k,2));   /* wider than the ground's 15.6 m cells, or its triangles bridge the pool */T.push({s0:s,s1,y:lo+.5,w});s=s1+1.4;k++;}
 for(let i=1;i<T.length;i++)if(T[i].y>T[i-1].y-.3)T[i].y=T[i-1].y-.3;   /* every tread below the one above it */
 return{S,P,A,L,at,T,line:STAGEKIT.line(P,40)};});
// the stair at a point: the nearest stair, its tread (or riser) and the distance from its line
const _st={};
function stairAt(x,z){let b=null;for(const St of STAIRS){const n=St.line.near(x,z,80);if(n.k<0)continue;if(b&&n.d>=b.d)continue;const s=St.A[n.k]+n.t*(St.A[n.k+1]-St.A[n.k]);
  let tr=null,ri=null;for(let i=0;i<St.T.length;i++){const T=St.T[i];if(s>=T.s0&&s<=T.s1){tr=T;break;}if(i+1<St.T.length&&s>T.s1&&s<St.T[i+1].s0){ri=[T,St.T[i+1],(s-T.s1)/1.4];break;}}
  if(!tr&&!ri)continue;b={St,d:n.d,s,tr,ri};}return b;}
function stairLevel(A){return A.tr?A.tr.y:mix(A.ri[0].y,A.ri[1].y,A.ri[2]);}
function stairW(A){return A.tr?A.tr.w:Math.min(A.ri[0].w,A.ri[1].w);}
// THE DIKES: two basalt dikes down the fall line, standing proud as rows of fins (KSTACKS: 84b draws them)
const DIKES=[{name:'the Upper Dike',x:-700,z:-1700,seed:6221},{name:'the Serai Dike',x:1900,z:1500,seed:6223}];
const FINS=(function(){const out=[],ry=Math.atan2(DOWN[1],DOWN[0]);
 DIKES.forEach((D,di)=>{for(let k=-50;k<=50;k++){const h=KRAND.hash(D.seed,k,1),u=KRAND.unit(h);if(u<.32)continue;const s=k*36+12*(KRAND.unit(KRAND.hash(D.seed,k,2))-.5),
   off=10*(fbm(s*.003,di,D.seed,2)-.5),x=D.x+DOWN[0]*s-DOWN[1]*off,z=D.z+DOWN[1]*s+DOWN[0]*off;if(Math.abs(x)>TERR.R-60||Math.abs(z)>TERR.R-60)continue;
   const y0=Math.min(raw0(x-6,z),raw0(x+6,z),raw0(x,z-6),raw0(x,z+6))-1.2;
   out.push(KSTACKS.make({id:'dike'+di+':'+k,kind:'fin',x,z,y0,seed:(h%99991)+1,H:5+13*KRAND.unit(KRAND.hash(D.seed,k,3)),r:4.5+3*KRAND.unit(KRAND.hash(D.seed,k,4)),e:4.5,ry,lean:.05,taper:.4,crown:.6,
    name:'A rib of '+D.name+' (an Arachnoid basalt dike standing proud of the slope)'}));}});return out;})();
const finFoot=(x,z)=>{const F=KSTACKS.foot(FINS,x,z);return F?F.d:1e9;};
// THE CARAVANSERAI: a court of 72 m on a levelled pad below the Serai Seep; its gate east, its track east down the slope
const SERAI=(function(){const St=STAIRS[1],e=St.at(St.L),x=e[0]+DOWN[0]*240,z=e[1]+DOWN[1]*240;return{x,z,hw:36,pad:raw0(x,z)};})();
const TRACK=(function(){const P=[];let x=SERAI.x+SERAI.hw+14,z=SERAI.z;for(let k=0;k<200&&x<TERR.R+200;k++){P.push([x,z]);x+=24;z+=24*(-.18+.25*(fbm(x*.002,z*.002,6231,2)-.5));}return{P,line:STAGEKIT.line(P,40)};})();
const roadD=(x,z)=>TRACK.line.near(x,z,40).d;
function terrainRaw(x,z){let h=raw0(x,z);
 const m=Math.max(Math.abs(x-SERAI.x),Math.abs(z-SERAI.z)),pw=1-smooth(SERAI.hw+14,SERAI.hw+50,m);if(pw>0)h=mix(h,SERAI.pad,pw);
 return h;}
// the stair's own ground: the pool's bed inside its width, the rim at its edge, the sinter apron falling away over ~25 m (max with the land)
function landAt(x,z){const h=terrainRaw(x,z),A=stairAt(x,z);if(!A||A.d>stairW(A)/2+40)return h;const y=stairLevel(A),hw=stairW(A)/2;
 if(A.d<hw)return y-.5;if(A.d<hw+1.5)return Math.max(h,y+.12);return Math.max(h,y+.12-(A.d-hw-1.5)*.12);}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=landAt(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){const A=stairAt(x,z);if(!A||A.d>=stairW(A)/2)return -1e9;return stairLevel(A);}
const inWorks=(x,z,pad)=>{pad=pad==null?0:pad;return Math.max(Math.abs(x-SERAI.x),Math.abs(z-SERAI.z))<SERAI.hw+6+pad||roadD(x,z)<4+pad;};
// ---------------------------------------------------------------- the fields (cached on an 18 m lattice)
//   seep    the warm wet ground round a stair and its alcove      sinter  the stair's apron (travertine)      alcove  inside an alcove
//   hi      the upper slope (0 at 2,000 m, 1 by 2,260 m: Cfb)      dike    near a rib's foot      road, works
function fieldsAt(x,z,h,slope){const A=stairAt(x,z),sd=A?A.d-stairW(A)/2:1e9;let al=0;for(const S of SPRINGS){const d=Math.hypot(x-S.x,z-S.z);al=Math.max(al,smooth(S.r,S.r*.6,d));}
 const sinter=sd<30?smooth(28,0,sd):0,seep=Math.max(sd<120?smooth(110,10,sd):0,al*.8),fd=finFoot(x,z);
 return{wet:clamp(.45+.4*seep,0,1),flow:A&&sd<0?1:0,upland:clamp((h-1900)/400,0,1),rock:fd<4?1:0,slope,dry:0,seep,sinter,alcove:al,hi:smooth(2000,2260,h),dike:fd<20?smooth(20,2,fd):0,
  road:smooth(10,3,roadD(x,z)),works:inWorks(x,z,4)?1:0};}
const FNAMES=['wet','flow','upland','rock','slope','dry','seep','sinter','alcove','hi','dike','road','works'];
const {FC,FIELD}=STAGEKIT.fields(FNAMES,fieldsAt,terrainH);
FIELD.sinterX=(x,z)=>{const A=stairAt(x,z);if(!A)return 0;const sd=A.d-stairW(A)/2;return sd<30?smooth(28,0,sd):0;};
// ---------------------------------------------------------------- the host binding
const SPINE=[];SPRINGS.forEach(S=>SPINE.push([S.x,S.z]));STAIRS.forEach(St=>{for(let s=0;s<=St.L;s+=150)SPINE.push(St.at(s));});SPINE.push([SERAI.x,SERAI.z]);
for(let x=-2800;x<=2800;x+=1400)for(const z of[-2400,0,2400])SPINE.push([x,z]);
function rootMask(x,z){if(inWorks(x,z,3)||finFoot(x,z)<2.5)return 0;const w=waterH(x,z);if(w>-1e8)return 0;const A=stairAt(x,z);if(A&&A.d<stairW(A)/2+1.6)return 0;return 1;}
BIO.init({tags:'outlandgate',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:[],ticks:tick,seed:6200,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,capThrow:false,
 lod:{hero:240,mid:600,far:2600,floor:[180,460]},windows:{}});
{const Q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS);
// ---------------------------------------------------------------- THE STAGE
const LIN=h=>new THREE.Color(h);
const STAGE={key:'seeps',px:STATION_PX,seed:200,title:'the West Bench: the warm seeps',site:{px:1416-272,py:312-330},
 hint:'The Outland Gate, station 2: the gap\'s west side at 2 km (5.1 px 1416,312; Cfa, 1.23 atm, 1,020 mm), a 5 % slope rising south-west toward the Gate shoulder and the NE Outer Wall. Warm water comes out of the skarn where the Arachnoids\' basalt dikes cross it: three springs have cut alcoves back into the slope and built rimstone stairs of travertine below them, steaming over each lip; two dikes stand proud as rows of black fins. The proposed caravanserai sits on a levelled pad below the middle seep, its track running east down to the floor. Iron birch and banner larch on the slope, wind spruce at its top, brook willows along the seeps, tree ferns in the alcoves',
 sky:{"air":{"pressure":1.23,"humidity":0.6}},
 atmos:{climate:{wet:true,cold:false}},
 down:[-10,-15],wind:{speed:2.0,daySpeed:1.0},   /* the gap's axis on this row: the river from 1431,315 to 1421,300 (PLAN.md section 1) */
 heat:{mean:17,amp:6,peakH:15,y0:2016},
 edgeH:base,
 paint(x,z,h,c,f){const se=f('seep'),si=f('sinter'),al=f('alcove'),hi=f('hi'),dk=f('dike'),rd=f('road'),n=fbm(x*.01,z*.01,6241,2);
  c.setHex(0x6e7a46).lerp(LIN(0x7a7a58),hi*.55).lerp(LIN(0x5e6e3e),smooth(.4,.7,n)*.4);
  c.lerp(LIN(0x4a6a3a),se*.35).lerp(LIN(0x3e5a34),al*.5);
  c.lerp(LIN(0xd8ceb4),si*.85);if(si>.4)c.lerp(LIN(0xc8823a),smooth(.75,.95,si)*.35*smooth(.45,.65,n));   /* the thermal mats' orange in the warmest runs */
  c.lerp(LIN(0x3a3634),dk*.6).lerp(LIN(0x9a8462),rd*.75);if(f('works')>.5&&rd<.3)c.lerp(LIN(0xa89878),.6);},
 layers:[{fam:'ground.grass',name:'meadow',amt:.45},{fam:'ground.travertine',name:'travertine',amt:.7},{fam:'ground.moss',name:'alcove moss',amt:.55}],
 gl(x,z){const si=FC.at(FC.a.sinter,x,z),al=FC.at(FC.a.alcove,x,z)*(1-si),m=(1-si)*(1-al)*(1-FC.at(FC.a.road,x,z));return[m,si,al];},
 rocks:FINS,rockName:{fin:'An Arachnoid basalt dike\'s rib (KSTACKS fins)'},
 probes:SPRINGS.map(S=>[S.x+DOWN[0]*S.r*.3,1,S.z+DOWN[1]*S.r*.3]),
 landmarks:SPRINGS.map(S=>({name:'An alcove and its spring: '+S.name+' (warm water out of the skarn, PLAN.md section 2)',kind:'landform',x:S.x,z:S.z,y:base(S.x,S.z)-S.D-2,r:S.r,h:S.D+8}))
  .concat(STAIRS.map(St=>{const m=St.at(St.L/2);return{name:'A rimstone stair: '+St.S.name+'\'s travertine terraces ('+St.T.length+' pools)',kind:'landform',x:m[0],z:m[1],y:terrainH(m[0],m[1])-3,r:St.L/2,h:St.T[0].y-St.T[St.T.length-1].y+6};})),
 water:{terraces:STAIRS.map(St=>({name:St.S.name+'\'s rimstone stair (warm water, travertine)',line:St.P,treads:St.T.map(T=>({s0:T.s0,s1:T.s1,y:T.y,w:T.w})),riser:1.4,col:0x7ab0a4}))},
 inWorks,worksAt:[SERAI.x,SERAI.z],worksNeed:['caravanserai','cistern','gatehouse'],
 works(W){const S=SERAI,y=S.pad-1.2,hw=S.hw,H=6.5,T=1.6;
  W.box('stone',S.x,y,S.z-hw,2*hw,H,T);W.box('stone',S.x,y,S.z+hw,2*hw,H,T);W.box('stone',S.x-hw,y,S.z,T,H,2*hw);
  W.box('stone',S.x+hw,y,S.z-hw*.58,T,H,hw*.84);W.box('stone',S.x+hw,y,S.z+hw*.58,T,H,hw*.84);
  for(const sx of[-1,1])for(const sz of[-1,1])W.box('stone',S.x+sx*hw,y,S.z+sz*hw,8,9.5,8);
  W.box('stone',S.x+hw,y,S.z-9,7,10,5);W.box('stone',S.x+hw,y,S.z+9,7,10,5);W.box('stone',S.x+hw,y+7,S.z,7,3,13);W.box('dark',S.x+hw+.2,y,S.z,3.4,7.2,8);
  for(const side of[-1,1]){W.box('wood',S.x,y,S.z+side*(hw-5),2*hw-14,4,8);W.box('wood',S.x-hw+5,y,S.z+side*hw*.35,8,4,hw*.62);}   /* the arcades: rooms along the walls */
  W.box('dark',S.x-6,y+.6,S.z,16,1.4,12);W.box('sinter',S.x-6,y+.6,S.z,17.5,1.1,13.5);   /* the cistern, fed by the seep, rimmed in its own sinter */
  W.rec({name:'The Skarn-Seep caravanserai (proposed, PLAN.md section 5: the caravans rest here before the wall)',kind:'structure',x:S.x,z:S.z,y,r:hw*1.45,h:11});
  W.rec({name:'The caravanserai\'s gatehouse',kind:'structure',x:S.x+hw,z:S.z,y,r:10,h:11});
  W.rec({name:'The caravanserai\'s cistern (fed by the Serai Seep)',kind:'structure',x:S.x-6,z:S.z,y,r:10,h:3});
  for(let k=0;k<TRACK.P.length;k+=12){const p=TRACK.P[k];W.tag({name:'The caravan track (from the caravanserai down to the floor and the god\'s road)',kind:'road',key:'track:'+k,x:p[0],z:p[1],y:terrainH(p[0],p[1]),r:6,h:2});}
  return{serai:1};},
 banners:(function(){const S=SERAI,y=S.pad-1.2;return[[S.x+S.hw,S.z,y+10],[S.x-S.hw,S.z-S.hw,y+9.5],[S.x+S.hw,S.z+S.hw,y+9.5]];})(),
 bannerName:'A caravanserai\'s banner (it streams downwind: the gap\'s wind)',
 hazards(H){
  STAIRS.forEach((St,i)=>{for(let s=0;s<=St.L;s+=20){const p=St.at(s);H.add({kind:'slip',key:'slip.sinter:'+i+':'+s,name:'Wet travertine on '+St.S.name+'\'s stair (slip)',x:p[0],y:terrainH(p[0],p[1])-1.5,z:p[1],r:16,h:4,shape:{type:'cyl',r:16,h:4}});}});
  SPRINGS.forEach((S,i)=>{for(let a=-1.1;a<=1.1;a+=.275){const ca=Math.cos(a),sa=Math.sin(a),dx=UP[0]*ca-UP[1]*sa,dz=UP[0]*sa+UP[1]*ca,x=S.x+dx*(S.r-6),z=S.z+dz*(S.r-6);
   H.add({kind:'fall',key:'fall.alcove:'+i+':'+a.toFixed(2),name:'The back wall of '+S.name+'\'s alcove (a '+S.D+' m scarp: fall)',x,y:terrainH(x,z)-S.D,z,r:9,h:S.D+3,shape:{type:'cyl',r:9,h:S.D+3}});}});},
 fauna:{land:'outlandgate.bench',rec:{biome:'outlandgate',land:'bench',include:['ridge-ibex','chamois','crag-eagle','steam-newt','goat'],
   exclude:['plain-grazer','nurser','fog-drinker','pan-digger','burrower','carrion-hexapod','rock-grazer','outland-stalker','ostrich','runner-bird'],density:{grazer:.35,predator:.04,flyer:.08},maxGroup:10},
  ok:(x,z,people)=>!inWorks(x,z,people?-2:2)&&waterH(x,z)<-1e8&&finFoot(x,z)>3&&!(stairAt(x,z)&&stairAt(x,z).d<stairW(stairAt(x,z))/2+2),
  people(){const S=SERAI,o=[];for(let k=0;k<10;k++){const a=-.9+1.8*KRAND.unit(KRAND.hash(6251,k,1)),d=S.hw+22+40*KRAND.unit(KRAND.hash(6251,k,2)),x=S.x+Math.cos(a)*d,z=S.z+Math.sin(a)*d;
    if(roadD(x,z)<9)continue;o.push({key:k%3?'bactrian-camel':'donkey',name:k%3?'Bactrian camel':'Donkey',x,z,ry:a+1.6,mode:'graze',why:'a caravan\'s, resting at the caravanserai'});}return o;},
  badAt:[SERAI.x,SERAI.z,'inside the caravanserai\'s court']},
 build:{},budgetTypes:{'ogate/seeps':'pass'},wetAt:(function(){const T=STAIRS[0].T[1],p=STAIRS[0].at((T.s0+T.s1)/2);return p;})(),
 views(){const K=STAGEKIT,g=K.gh,S1=SPRINGS[0],S2=SPRINGS[1],St=STAIRS[1],m=St.at(St.L*.45),e=St.at(St.L*.15),F=FINS[Math.floor(FINS.length*.3)],
   L=K.nearTree('bannerlarch',-2400,2400),B=K.nearTree('ironbirch',0,-500),Fe=K.nearTree('seepfern',S1.x,S1.z),W=K.nearTree('brookwillow',m[0],m[1]);
  const out={
   'Up the bench to the alcoves':K.look(1200,-1200,24,-1400,600,40),
   'The Upper Seep\'s alcove':(()=>{const cx=S1.x+DOWN[0]*(S1.r+90),cz=S1.z+DOWN[1]*(S1.r+90);return[cx,g(cx,cz,8),cz,S1.x,base(S1.x,S1.z)-S1.D+4,S1.z];})(),
   'A rimstone stair':(()=>{const cx=m[0]-DOWN[1]*30+DOWN[0]*40,cz=m[1]+DOWN[0]*30+DOWN[1]*40;return[cx,g(cx,cz,6),cz,m[0],terrainH(m[0],m[1])+.5,m[1]];})(),
   'The stair from its spring':(()=>{const cx=S2.x+UP[0]*20,cz=S2.z+UP[1]*20;return[cx,g(cx,cz,22),cz,e[0],terrainH(e[0],e[1]),e[1]];})(),
   'The caravanserai':K.look(SERAI.x+150,SERAI.z-110,26,SERAI.x,SERAI.z,4),
   'The caravanserai\'s gate':K.look(SERAI.x+SERAI.hw+70,SERAI.z+24,3,SERAI.x+SERAI.hw,SERAI.z,5),
   'A dike rib':[F.x-DOWN[1]*40,g(F.x-DOWN[1]*40,F.z+DOWN[0]*40,3),F.z+DOWN[0]*40,F.x,F.y0+(F.top-F.y0)*.6,F.z],
   'Across the gap to the east wall':K.look(2600,-600,30,30000,-2000,4500),
   'Down the gap toward Spider Lake':K.look(2000,2400,40,-6000,-30000,400),
   'Banner larch on the upper slope':K.atTree(L,30,2.4,3,L.H*.5),
   'Iron birch':K.atTree(B,18,.6,2,B.H*.5),
   'Tree ferns in an alcove':K.atTree(Fe,12,2.1,2,Fe.H*.5),
   'Brook willows on a seep':K.atTree(W,16,1.2,2,W.H*.5)};
  return out;},
 checks(add){add('the stairs step down (every tread below the one above it)',SEEPCHK.steps(STAIRS));
  add('the sinter slips, the meadow does not (core/hazard)',SEEPCHK.slip(SEEPCHK.pts()));
  add('the woods by their ground (tree ferns in the alcoves, brook willows on the seeps, spruce up high)',SEEPCHK.woods(OGATE.TREES||[]));},
 negatives(add){add('a stair that climbs',SEEPCHK.steps([{S:{name:'test'},T:[{y:10},{y:11}]}]));
  add('the meadow called sinter',SEEPCHK.slip([{x:2800,z:-2800,y:terrainH(2800,-2800)+1,slip:true}]));
  add('a tree fern on the dry slope',SEEPCHK.woods([{key:'seepfern',x:3000,z:3000},{key:'brookwillow',x:SPRINGS[0].x,z:SPRINGS[0].z},{key:'windspruce',x:3000,z:-3000}]));},
};
const SEEPCHK={
 steps(L){const bad=L.filter(St=>St.T.some((T,i)=>i&&T.y>St.T[i-1].y-.05));return{ok:!bad.length,detail:bad.length?bad.length+' stairs with a tread above the one before (first '+bad[0].S.name+')':L.map(St=>St.T.length).join(' + ')+' treads, every one below the one above it'};},
 pts(){const P=[];STAIRS.forEach(St=>{for(let s=30;s<St.L;s+=80){const p=St.at(s);P.push({x:p[0],z:p[1],y:terrainH(p[0],p[1])+.6,slip:true});}});
  for(const q of [[2800,-2800],[-2800,2800],[2400,2000],[-2600,-2600]])P.push({x:q[0],z:q[1],y:terrainH(q[0],q[1])+1,slip:false});return P;},
 slip(P){const bad=P.filter(p=>p.slip!==KHAZ.at(p.x,p.z,0,p.y).some(e=>e.kind==='slip'));
  return{ok:P.length>0&&!bad.length,detail:bad.length?bad.length+' points wrong (first '+(bad[0].slip?'on the sinter and no slip':'on the meadow and slipping')+')':P.filter(p=>p.slip).length+' points on the stairs slip, '+P.filter(p=>!p.slip).length+' on the meadow do not'};},
 woods(T){const f=T.filter(t=>t.key==='seepfern'),bf=f.filter(t=>!(FIELD.alcove(t.x,t.z)>.25||FIELD.seep(t.x,t.z)>.5)),w=T.filter(t=>t.key==='brookwillow'),bw=w.filter(t=>!(FIELD.seep(t.x,t.z)>.25)),
   s=T.filter(t=>t.key==='windspruce'),bs=s.filter(t=>!(FIELD.hi(t.x,t.z)>.3));
  return{ok:f.length>0&&w.length>0&&s.length>0&&!bf.length&&!bw.length&&!bs.length,detail:(bf.length?bf.length+' tree ferns off the alcoves and seeps; ':'')+(bw.length?bw.length+' brook willows off the seeps; ':'')+(bs.length?bs.length+' wind spruce low on the slope; ':'')+
   f.length+' tree ferns, '+w.length+' brook willows, '+s.length+' wind spruce, each on its ground'};},
};
