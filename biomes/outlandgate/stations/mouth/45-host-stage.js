// ================================================================= HOST — stage: STATION 4, THE SPIDER LAKE THRESHOLD (PLAN.md section 7)
// THE SITE: the gap's mouth on map 5.1, where Hau-Gel enters Spider Lake: its mouth, px 1328,228 (the plan's pixel, 1331,230, lies 6 km up
// the river on the model's carved channel), Cfa, 1,929 mm (the gap's wettest), 21 °C (30 / 12), 1.35 atm.
// SPIDER LAKE'S LEVEL IS KEPT: +1,460.0 m (the model's water layer and biomes/spiderlake/PLAN.md, whose inflow "descends from the Outland
// pass (+1,480 m)" over "sedge-choked delta flats" and "steaming backwater coves"). The model carves the river's last cells to 1,396 m and
// leaves the gap's floor east of the lake's rim at 1,396-1,415 m, 45-64 m under the lake: a river cannot run up into a lake (KNOWN_ISSUES.md,
// for the map session). The page is an ideal type on the lake's own level: the river comes in from the east-south-east at 1,463.6 m and
// falls to the lake over a DELTA, splitting into three distributaries across flats a metre or two over the water, natural levees along them
// and backswamps between; warm springs come up at the hills' foot to the south (Spider Lake's hydrothermal seeps, its plan: 32-45 °C) into
// travertine-rimmed coves. The far field's gap floor is lifted to the lake's level for the same reason (STAGE.farLift).
// THE WOODS (Spider Lake's silk-forest is not built: the plan's fallback, PLAN.md section 4): the north-west lowlands' paperbark in the
// backswamps, poplars on the levees, ghost gums on the rises, read in place; reed beds on the delta's front and the coves. SILK IN THE
// WOODS: the gilded orb spiders' webs strung between neighbouring trees (the kit's own: a card hung between two trunks).
// THE PEOPLE (PLAN.md section 5: Spider Lake's people at the mouth): a silk landing on the delta's south bank: stilt houses, a jetty into the
// lake, reeling frames (plain records and boxes until their kit), and the god's road setting out from it up the gap.
// THE MAP (x east, z south; north is -z; the origin the 5.1 pixel, R 3400).
const STATION_PX=[1328,228];
const LV=1460.04;
// ---------------------------------------------------------------- the land
const shoreX=z=>-420+260*Math.sin(z*.0009+.4)+120*(fbm(z*.0014,1.7,6401,2)-.5);   /* the lake to the west of it */
const inLake=(x,z)=>x<shoreX(z);
// THE RIVER and its DISTRIBUTARIES: the trunk from the east edge to the split, three mouths fanning to the shore (KRELIEF.meander's bends)
const SPLIT=[1150,420];
const TRUNK=KRELIEF.meander([3700,1980],SPLIT,{amp:140,wave:1500,step:16,seed:6403});
const MOUTHS=[[shoreX(-760)-220,-760],[shoreX(-80)-220,-80],[shoreX(620)-220,620]].map((m,i)=>KRELIEF.meander(SPLIT,m,{amp:70,wave:700,step:12,seed:6405+2*i}));
const lineLen=P=>{const A=[0];for(let i=1;i<P.length;i++)A.push(A[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));return A;};
const CH=[{P:TRUNK,hw:40,y0:1463.6,y1:1461.0,name:'Hau-Gel (its last reach)'}].concat(MOUTHS.map((P,i)=>({P,hw:[26,30,22][i],y0:1461.0,y1:LV-.05,name:'Hau-Gel\'s '+['north','middle','south'][i]+' mouth (a distributary)'})));
CH.forEach(C=>{C.A=lineLen(C.P);C.L=C.A[C.A.length-1];C.line=STAGEKIT.line(C.P,40);C.lvl=s=>mix(C.y0,C.y1,clamp(s/C.L,0,1));});
function chanAt(x,z){let b=null;for(const C of CH){const n=C.line.near(x,z,C.hw+120);if(n.k<0)continue;const d=n.d-C.hw;if(b&&d>=b.e)continue;b={C,d:n.d,e:d,s:C.A[n.k]+n.t*(C.A[n.k+1]-C.A[n.k])};}return b;}
// THE WARM COVES: springs at the southern hills' foot, each a perched pool in its own sinter rim, its run draining to the backswamp
const COVES=[{x:300,z:2150,r:26},{x:-80,z:1750,r:20},{x:900,z:2500,r:30},{x:1700,z:2700,r:18}];
// the ground: the delta's flats a metre or two over the lake, rising east to ~1,475 m at the page's edge; the southern hills (to ~1,505 m in
// the south-east corner) and the low rim to the north (1,466-1,474 m, the model's 1,459-1,462 m rim and its hills); the lake's bed west
function base(x,z){const sx=shoreX(z),e=Math.max(0,x-sx);
 return LV+.9+e*.0034+22*smooth(1600,3400,z)*smooth(-600,2400,x)+14*smooth(-1900,-3300,z)+1.2*(fbm(x*.004,z*.004,6407,3)-.5);}
function land0(x,z){const sx=shoreX(z);
 if(x<sx){const w=sx-x;return LV+.4-1.2*smooth(0,30,w)-16*smooth(20,900,w)-1.5*(fbm(x*.003,z*.003,6409,2)-.5)*smooth(80,400,w);}   /* the bay's bed */
 let h=base(x,z);const C=chanAt(x,z);
 if(C){const lv=C.C.lvl(C.s),hw=C.C.hw;if(C.d<hw)h=Math.min(h,lv-2.4*(1-Math.pow(C.d/hw,2))-.2);
  else{const lev=lv+.7*smooth(hw+60,hw+8,C.d)*smooth(hw,hw+8,C.d);h=Math.max(Math.min(h,mix(lv+.35,h,smooth(hw,hw+90,C.d))),lev);}}   /* the levees */
 for(const V of COVES){const d=Math.hypot(x-V.x,z-V.z);if(d<V.r+30){const top=base(V.x,V.z)+.4;if(d<V.r)h=Math.min(h,top-.8-.6*(1-d/V.r));else if(d<V.r+3)h=Math.max(h,top+.25);else h=mix(Math.max(h,top+.25),h,smooth(V.r+3,V.r+30,d));}}
 return h;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=land0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){if(inLake(x,z))return LV;const C=chanAt(x,z);if(C&&C.d<C.C.hw+2)return C.C.lvl(C.s);for(const V of COVES)if(Math.hypot(x-V.x,z-V.z)<V.r+.5)return base(V.x,V.z)+.4;return -1e9;}
// THE LANDING: Spider Lake's people's silk landing on the delta's south bank, by the south mouth; its jetty out into the bay
const LAND=(function(){const M=MOUTHS[2],p=M[Math.floor(M.length*.7)];return{x:p[0]+40,z:p[1]+150,jx:shoreX(p[1]+150),jz:p[1]+150};})();
const ROAD=(function(){const P=[];for(let x=LAND.x;x<TERR.R+200;x+=30)P.push([x,LAND.z+260*smooth(LAND.x,LAND.x+1200,x)+60*Math.sin(x*.0021)+520*smooth(1800,3400,x)]);return{P,line:STAGEKIT.line(P,40)};})();
const roadD=(x,z)=>ROAD.line.near(x,z,40).d;
const inWorks=(x,z,pad)=>{pad=pad==null?0:pad;return(Math.abs(x-LAND.x)<70+pad&&Math.abs(z-LAND.z)<45+pad)||(x<LAND.x&&x>LAND.jx-120-pad&&Math.abs(z-LAND.jz)<5+pad)||roadD(x,z)<4+pad;};
// ---------------------------------------------------------------- the fields (cached on an 18 m lattice)
//   delta   the flats (1 within 1.5 km of the shore, low)    levee  a channel's levee     swamp  the backswamps between (low and wet)
//   cove    a warm cove's rim and run       rise  the hills (south, north)       shore  the bay's beach      road, works
function fieldsAt(x,z,h,slope){const C=chanAt(x,z),lake=inLake(x,z)?1:0,sx=shoreX(z),hh=h-LV;
 const levee=C&&!lake&&C.d>=C.C.hw?smooth(C.C.hw+70,C.C.hw+10,C.d):0,delta=lake?0:smooth(2.6,1.2,hh)*smooth(2400,1400,x-sx),
  swamp=delta*(1-levee)*smooth(1.4,.6,hh)*(C?smooth(C.C.hw+40,C.C.hw+140,C.d):1);
 let cove=0;for(const V of COVES){const d=Math.hypot(x-V.x,z-V.z);cove=Math.max(cove,smooth(V.r+60,V.r,d));}
 return{wet:clamp(.5+.3*delta+.3*levee,0,1),flow:C&&C.d<C.C.hw?1:0,upland:smooth(4,16,hh),rock:0,slope,dry:0,delta,levee,swamp,cove,rise:smooth(6,14,hh)*(1-lake),
  shore:lake?0:smooth(80,0,x-sx),bank:levee,road:smooth(10,3,roadD(x,z)),works:inWorks(x,z,4)?1:0};}
const FNAMES=['wet','flow','upland','rock','slope','dry','delta','levee','swamp','cove','rise','shore','bank','road','works'];
const {FC,FIELD}=STAGEKIT.fields(FNAMES,fieldsAt,terrainH);
FIELD.bankX=(x,z)=>{const C=chanAt(x,z);return C&&!inLake(x,z)&&C.d>=C.C.hw-2?smooth(C.C.hw+70,C.C.hw,C.d):0;};
// THE SPIDERS' GROUND: the gilded orb spiders hold the delta's woods in patches (a 420 m lattice, where the levees' and the swamp's trees
// stand thick): their webs are strung only there (60), and each patch is a `hunter` hazard (87), registered before anything is drawn
const WEBZONES=(function(){const out=[],cell=420,N=Math.ceil(TERR.R/cell);
 for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(6411,i,j),u=k=>KRAND.unit(KRAND.hash(h,k,1)),x=(i+u(1))*cell,z=(j+u(2))*cell;
  if(Math.abs(x)>TERR.R-150||Math.abs(z)>TERR.R-150||inLake(x,z)||inWorks(x,z,60))continue;const w=Math.max(FIELD.swamp(x,z),FIELD.levee(x,z),FIELD.rise(x,z)*.7);if(u(3)>smooth(.15,.5,w)*.85)continue;
  out.push({x,z,y:terrainH(x,z),r:120+80*u(4)});}return out;})();
// ---------------------------------------------------------------- the host binding
const SPINE=[];CH.forEach(C=>{for(let k=0;k<C.P.length;k+=25)SPINE.push(C.P[k]);});COVES.forEach(V=>SPINE.push([V.x,V.z]));SPINE.push([LAND.x,LAND.z]);
for(let z=-2800;z<=2800;z+=700)SPINE.push([shoreX(z)+80,z]);for(const x of[1400,2800])for(const z of[-2400,0,2400])SPINE.push([x,z]);
function rootMask(x,z){if(inWorks(x,z,3))return 0;const h=terrainH(x,z),d=h-waterH(x,z);return d<.15?0:d<.7?(d-.15)/.55:1;}
BIO.init({tags:'outlandgate',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:[],ticks:tick,seed:6400,origin:SPINE,center:[600,0],fields:FIELD,register:REGISTER,err:reportErr,capThrow:false,
 lod:{hero:240,mid:600,far:2600,floor:[180,460]},windows:{}});
{const Q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS);
// ---------------------------------------------------------------- THE STAGE
const LIN=h=>new THREE.Color(h);
const reachPolys=C=>{const out=[];for(let s=0;s<C.L;s+=300){const i0=C.A.findIndex(a=>a>=s),i1x=C.A.findIndex(a=>a>=s+300),i1=i1x<0?C.P.length-1:i1x;if(i1-i0<2)continue;
  const m=C.P[Math.floor((i0+i1)/2)],L=[],R=[];for(let i=i0;i<=i1;i++){const a=C.P[Math.max(0,i-1)],b=C.P[Math.min(C.P.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;
   L.push([C.P[i][0]-dz/l*C.hw-m[0],C.P[i][1]+dx/l*C.hw-m[1]]);R.push([C.P[i][0]+dz/l*C.hw-m[0],C.P[i][1]-dx/l*C.hw-m[1]]);}out.push({m,s,pts:L.concat(R.reverse())});}return out;};
const STAGE={key:'mouth',px:STATION_PX,seed:400,title:'the Spider Lake Threshold',site:{px:1328-272,py:228-330},
 hint:'The Outland Gate, station 4: the gap\'s mouth (5.1 px 1328,228; Cfa, 1.35 atm, 1,929 mm: the gap\'s wettest), where Hau-Gel enters Spider Lake at its level of 1,460 m. The river comes in from the east-south-east and falls to the lake over a delta: three mouths across flats a metre or two over the water, levees along them and paperbark swamp between; warm springs rise at the southern hills\' foot into travertine-rimmed coves. Poplars on the levees, ghost gums on the rises (read in place from the north-west lowlands), reed beds on the delta\'s front, and silk in the woods: the gilded orb spiders\' webs strung between the trees. Spider Lake\'s people keep a silk landing on the south bank, its jetty out into the bay, and the god\'s road sets out from it up the gap',
 sky:{"air":{"pressure":1.35,"humidity":0.75},"clouds":{"cover":0.55,"cumulus":0.8,"cirrus":0.3}},
 atmos:{climate:{wet:true,cold:false}},
 down:[-6000,-3600],wind:{speed:1.6,daySpeed:1.2},   /* the gap's axis at its mouth: the river from 1331,230 to 1328,228, into the lake */
 heat:{mean:21,amp:6,peakH:15,y0:LV},
 edgeH:(x,z)=>inLake(x,z)?LV-20:base(x,z),
 farWater:(x,z)=>x<-1500&&farModel(x,z)<LV+1?LV:null,
 farLift:(x,z,m)=>x>-1500?Math.max(m,LV+3+.0004*Math.max(0,x)):m,   /* the model's gap floor lies under the lake: lifted to it (KNOWN_ISSUES.md) */
 paint(x,z,h,c,f){const dl=f('delta'),lv=f('levee'),sw=f('swamp'),cv=f('cove'),ri=f('rise'),sh=f('shore'),rd=f('road'),n=fbm(x*.01,z*.01,6441,2);
  c.setHex(0x5e7a3e).lerp(LIN(0x4e6a36),smooth(.4,.7,n)*.4).lerp(LIN(0x6a7448),ri*.5);
  c.lerp(LIN(0x5a6a3a),dl*.4).lerp(LIN(0x3e5232),sw*.55).lerp(LIN(0x6a6448),lv*.35).lerp(LIN(0x9a907a),sh*.6);
  c.lerp(LIN(0xd8ceb4),smooth(.55,.9,cv)*.8);if(cv>.5)c.lerp(LIN(0xb87a3a),smooth(.8,.97,cv)*.35*smooth(.4,.6,n));
  if(h<waterH(x,z)-.2)c.lerp(LIN(0x4a4a3c),.85);c.lerp(LIN(0x9a8462),rd*.75);},
 layers:[{fam:'ground.grass',name:'meadow',amt:.45},{fam:'ground.reedbed',name:'reed bed',amt:.6},{fam:'ground.mud',name:'bank mud',amt:.55}],
 gl(x,z){const sw=Math.max(FC.at(FC.a.swamp,x,z),FC.at(FC.a.shore,x,z)*.8),lv=FC.at(FC.a.levee,x,z)*(1-sw),m=(1-sw)*(1-lv)*(1-FC.at(FC.a.road,x,z));return[m,sw,lv];},
 probes:[[CH[0].P[60][0],-1.5,CH[0].P[60][1]],[COVES[0].x,-.4,COVES[0].z]],
 landmarks:[{name:'Spider Lake (its eastern bay; the lake\'s level 1,460 m)',kind:'water',x:shoreX(0)-1600,z:0,y:LV-20,r:2200,h:22},
  {name:'Hau-Gel\'s delta (three mouths into Spider Lake)',kind:'landform',x:SPLIT[0]-700,z:SPLIT[1]-100,y:LV-3,r:1300,h:6}]
  .concat(COVES.map((V,i)=>({name:'A warm cove (Spider Lake\'s hydrothermal seeps: 32-45 °C, travertine-rimmed)',kind:'water',x:V.x,z:V.z,y:base(V.x,V.z)-2,r:V.r+4,h:4}))),
 water:{lakes:[{name:'Spider Lake',level:LV,box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],seed:[shoreX(0)-1500,0],land:(x,z)=>!inLake(x,z),shallow:0x6a8a7a,deep:0x26443e,label:'Spider Lake (its eastern bay, 1,460 m)'}],
  flows:CH.map(C=>{const pts=C.P.map((p,i)=>[p[0],p[1],C.lvl(C.A[i])]).filter(p=>!inLake(p[0]+C.hw,p[1]));return{name:C.name,pts,width:pts.map(()=>C.hw*2*.86),speed:1.1,shallow:0x6e8a6a,deep:0x3a5446};}),
  pools:COVES.map((V,i)=>({x:V.x,z:V.z,r:V.r,l:base(V.x,V.z)+.4,name:'A warm cove'})),poolCol:0x5a9a90,poolLabel:'A warm cove (32-45 °C: steaming in the cool mornings)'},
 inWorks,worksAt:[LAND.x,LAND.z],worksNeed:['landing','jetty','reeling'],worksLabel:'Spider Lake\'s people\'s silk landing (plain records until their kit)',
 works(W){const L=LAND,y=W.gmin(L.x,L.z,30)-.3;
  for(let k=0;k<5;k++){const x=L.x-40+k*20,z=L.z+(k%2?14:-14),yy=W.gmin(x,z,5)-.2;for(const sx of[-1,1])for(const sz of[-1,1])W.box('wood',x+sx*3.6,yy,z+sz*2.6,.35,2.4,.35);
   W.box('wood',x,yy+2.4,z,8.2,.4,6.2);W.box('wood',x,yy+2.8,z,7.6,2.6,5.6);W.box('cloth',x,yy+5.4,z,8.8,.5,6.8);
   W.rec({name:'A stilt house of the silk landing (Spider Lake\'s people)',kind:'structure',key:'house:'+k,x,z,y:yy,r:6,h:6.2});}
  for(let k=0;k<3;k++){const x=L.x+10+k*14,z=L.z-30,yy=W.gmin(x,z,4)-.2;W.box('wood',x-3,yy,z,.3,4.2,.3);W.box('wood',x+3,yy,z,.3,4.2,.3);W.box('wood',x,yy+4,z,6.6,.3,.3);W.box('silk',x,yy+.6,z,5.8,3.3,.05);
   W.rec({name:'A reeling frame (the silk wound off the gilded orb spiders\' frames: Spider Lake\'s people)',kind:'structure',key:'reel:'+k,x,z,y:yy,r:4,h:4.5});}
  const jl=L.x-L.jx+90;for(let k=0;k<jl;k+=8){const x=L.x-k,yy=Math.min(W.gmin(x,L.jz,2),LV-1.5);W.box('wood',x,yy,L.jz-2,.35,LV+1.2-yy,.35);W.box('wood',x,yy,L.jz+2,.35,LV+1.2-yy,.35);}
  W.box('wood',L.x-jl/2,LV+1.1,L.jz,jl,.3,4.4);
  W.rec({name:'The landing\'s jetty (out into Spider Lake\'s eastern bay)',kind:'structure',x:L.x-jl/2,z:L.jz,y:LV-2,r:jl/2,h:4});
  W.rec({name:'The silk landing (Spider Lake\'s people at the gap\'s mouth: PLAN.md section 5)',kind:'settlement',x:L.x,z:L.z,y,r:80,h:8});
  for(let k=0;k<ROAD.P.length;k+=12){const p=ROAD.P[k];W.tag({name:'The god\'s road (setting out from Spider Lake up the gap)',kind:'road',key:'godsroad:'+k,x:p[0],z:p[1],y:terrainH(p[0],p[1]),r:6,h:2});}
  return{landing:1};},
 banners:[[LAND.jx-60,LAND.jz,LV+1.4],[LAND.x+30,LAND.z,terrainH(LAND.x+30,LAND.z)]],bannerCol:0xe8d8a0,bannerName:'A silk pennant of Spider Lake\'s people (it streams downwind)',
 hazards(H){CH.forEach((C,ci)=>reachPolys(C).forEach(R=>{if(inLake(R.m[0],R.m[1]))return;H.add({kind:'drown',key:'drown.ch'+ci+':'+R.s,name:C.name+' (drowning)',x:R.m[0],y:C.lvl(R.s)-4,z:R.m[1],r:240,h:6,shape:{type:'poly',pts:R.pts,h:6}});}));
  H.add({kind:'drown',key:'drown.lake',name:'Spider Lake (deep beyond the delta\'s front: drowning)',x:-TERR.R*.6,y:LV-20,z:0,r:TERR.R*1.6,h:21,
   shape:{type:'poly',pts:(function(){const p=[];for(let z=-TERR.R*1.1;z<=TERR.R*1.1;z+=100)p.push([shoreX(z)-2+TERR.R*.6,z]);p.push([-TERR.R*.6,TERR.R*1.1],[-TERR.R*.6,-TERR.R*1.1]);return p;})(),h:21}});
  COVES.forEach((V,i)=>H.add({kind:'heat',key:'heat.cove:'+i,name:'A warm cove (32-45 °C)',danger:.25,dose:.2,x:V.x,y:base(V.x,V.z)-2,z:V.z,r:V.r,h:3,shape:{type:'cyl',r:V.r,h:3}}));
  WEBZONES.forEach((W,i)=>H.add({kind:'hunter',key:'hunter.webs:'+i,name:'The gilded orb spiders\' ground (their webs in the trees: hunter)',x:W.x,y:W.y-2,z:W.z,r:W.r,h:24,shape:{type:'cyl',r:W.r,h:24}}));},
 wetPts(){const P=[];CH.forEach(C=>{for(let s=150;s<C.L-60;s+=400){const i=C.A.findIndex(a=>a>=s),p=C.P[i];if(!inLake(p[0],p[1]))P.push({x:p[0],z:p[1],y:C.lvl(s)-1,wet:true});}});
  for(const z of[-1500,0,1500])P.push({x:shoreX(z)-800,z,y:LV-2,wet:true});
  for(const q of [[2600,-2600],[2200,2900],[1800,-1200],[600,2600]])if(waterH(q[0],q[1])<-1e8)P.push({x:q[0],z:q[1],y:terrainH(q[0],q[1])+1,wet:false});return P;},
 fauna:{land:'outlandgate.mouth',rec:{biome:'spiderlake',land:'mouth',include:['marsh-deer','marsh-harrier','lake-diver','giant-river-otter','silk-weaver'],density:{grazer:.35,predator:.08,flyer:.1,water:.15},maxGroup:10},
  ok:(x,z)=>!inWorks(x,z,2)&&waterH(x,z)<-1e8,water:(x,z)=>inLake(x,z)&&terrainH(x,z)<LV-2,people(){return[];},
  badAt:[LAND.x-20,LAND.z+14,'in a stilt house of the landing']},
 build:{webZones:WEBZONES},budgetTypes:{'ogate/silk':'pass'},wetAt:[shoreX(0)-600,0],
 views(){const K=STAGEKIT,g=K.gh,M=MOUTHS[1],mm=M[Math.floor(M.length*.85)],V=COVES[0],Wb=(OGATE.WEBS||[])[0],P=K.nearTree('swamppaperbark',300,800),Gw=K.nearTree('leveepoplar',SPLIT[0],SPLIT[1]),Gg=K.nearTree('ghostgum',2400,-2200);
  return{
   'The delta from the southern hills':K.look(1900,2900,30,200,0,0),
   'Hau-Gel into Spider Lake':K.look(mm[0]+180,mm[1]-60,10,mm[0]-400,mm[1],0),
   'Spider Lake\'s eastern bay':K.look(shoreX(-1200)+60,-1200,8,-30000,-2000,0),
   'The split: three mouths':K.look(SPLIT[0]+260,SPLIT[1]-200,40,SPLIT[0]-700,SPLIT[1],0),
   'A warm cove':K.look(V.x+V.r+28,V.z-18,3,V.x,V.z,0),
   'Silk in the woods':Wb?[Wb.x+Wb.nx*14,Math.max(g(Wb.x+Wb.nx*14,Wb.z+Wb.nz*14,2),Wb.y-1),Wb.z+Wb.nz*14,Wb.x,Wb.y,Wb.z]:K.look(400,600,4,300,500,4),
   'Paperbark swamp':K.atTree(P,22,2.4,2.5,P.H*.4),
   'Poplars on a levee':K.atTree(Gw,20,1.6,2.5,Gw.H*.45),
   'Ghost gums on the rise':K.atTree(Gg,40,.8,3,Gg.H*.4),
   'The silk landing':K.look(LAND.x+90,LAND.z+70,14,LAND.x,LAND.z,3),
   'The jetty into the bay':K.look(LAND.jx-40,LAND.jz+60,6,LAND.jx+40,LAND.jz,1),
   'Up the gap from its mouth':K.look(-300,shoreX(0)>-300?300:0,30,40000,30000,600)};},
 checks(add){add('the river graded to the lake (every channel level or down, its mouth at the lake\'s level)',MOUTHCHK.graded(CH));
  add('silk in the woods (every web between two trees)',MOUTHCHK.webs(OGATE.WEBS||[]));
  add('the warm coves above the lake, rimmed',MOUTHCHK.coves(COVES));},
 negatives(add){add('a channel that climbs',MOUTHCHK.graded([{name:'test',P:[[0,0],[10,0]],A:[0,10],L:10,lvl:s=>LV+s,y1:LV}]));
  add('a web hung in the open',MOUTHCHK.webs([{x:2600,z:-2600,y:terrainH(2600,-2600)+5,a:{x:2600,z:-2600},b:{x:2620,z:-2600},d:20,test:true}]));
  add('a cove under the lake',MOUTHCHK.coves([{x:shoreX(0)-500,z:0,r:10}]));},
};
const MOUTHCHK={
 graded(L){const bad=L.filter(C=>{for(let s=10;s<=C.L;s+=10)if(C.lvl(s)>C.lvl(s-10)+.001)return true;return Math.abs(C.lvl(C.L)-C.y1)>.01;}),end=L.filter(C=>Math.abs(C.y1-LV)<.2).length;
  return{ok:!bad.length&&end>0,detail:bad.length?bad.length+' channels that climb (first '+bad[0].name+')':L.length+' channels, every step level or down; '+end+' mouths at the lake\'s level'};},
 webs(L){const T=OGATE.TREES||[],near=(p)=>T.some(t=>Math.hypot(t.x-p.x,t.z-p.z)<1.5);const bad=L.filter(w=>w.test||!near(w.a)||!near(w.b));
  return{ok:L.length>0&&!bad.length,detail:bad.length?bad.length+' webs not strung between two trees':L.length+' webs, each strung between two trees'};},
 coves(L){const bad=L.filter(V=>inLake(V.x,V.z)||!(base(V.x,V.z)+.4>LV+.3));return{ok:L.length>0&&!bad.length,detail:bad.length?bad.length+' coves in or under the lake':L.length+' warm coves, each perched over the lake in its sinter rim'};},
};
