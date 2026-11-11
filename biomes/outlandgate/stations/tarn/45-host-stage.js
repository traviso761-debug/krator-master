// ================================================================= HOST — stage: STATION 3, THE UPPER GATE TARN (PLAN.md section 7)
// THE SITE: the gap's south end on map 5.1: the tarn's north shore at its outlet, px 1538,472 (the plan's pixel, 1544,474, is the tarn's
// middle: all water on a page this size). The tarn: 56 cells, its level 1,521.46 m (the model's water layer), class WH; its shores take
// 1,300-1,600 mm (Cfa), 22 °C (29 / 15). Hau-Gel comes in from the south (1544,480, off the page) and leaves north at 1538,471.
// THE LAND, an ideal type on the model's numbers: the tarn fills the page's south half, deep (the model's bed lies 100-200 m under its
// level: here 45 m within 700 m of the shore); its north shore climbs ~170 m over 1.7 km to the bench the model gives at 1,690-1,720 m, in
// THREE FLOOD TERRACES (PLAN.md section 2: the outburst floods' scour), rising ~8 m a km eastward. Through the bench the tarn's OUTLET
// COULEE runs north: a flood-cut trench (the scablands' kind) 420 m across its floor, its walls up to 150 m of bare rock, Hau-Gel falling
// 16 m through it in rapids over GIANT CURRENT RIPPLES (the floods' bedforms: PLAN.md section 8, amendment 3, kit work: 3 m high, 110 m
// apart, their crests across the flow). ERRATICS, boulders the floods carried, lie on the terraces and the coulee's floor (KSTACKS). The
// model carves the river's cells to 1,448 m, under the tarn's own level (KNOWN_ISSUES.md): the page keeps the tarn's level and grades the
// river down from it. THE GOD'S ROAD (PLAN.md section 5) comes up the coulee's east rim and turns east along the shore toward the inflow,
// past the trickster's shrine at the outlet, cairns every ~450 m (plain records and stones until kits/coyote).
// THE MAP (x east, z south; north is -z; the origin the 5.1 pixel, R 3400).
const STATION_PX=[1538,472];
const LEVEL=1521.46;
// ---------------------------------------------------------------- the land
const shoreZ=x=>260+180*Math.sin(x*.0011+.7)+90*(fbm(x*.0016,3.1,6301,2)-.5)-140*smooth(500,0,Math.abs(x));   /* the outlet a bay */
const stair=t=>t-.75*Math.sin(2*Math.PI*3*t)/(2*Math.PI*3);   /* three flood terraces: flat treads, steep risers */
function bench(x,z){const t=clamp((shoreZ(x)-z)/1700,0,1);return LEVEL+2+168*stair(t)+7.5*x/1000*t+2.5*(fbm(x*.004,z*.004,6303,3)-.5);}
// the outlet coulee: its centre line from the outlet bay north (KRELIEF.meander's bends), the river wandering on its floor
const COUL=KRELIEF.meander([0,shoreZ(0)+80],[-420,-3950],{amp:120,wave:2600,step:20,seed:6305});
const CL=STAGEKIT.line(COUL,60),CA=[0];for(let i=1;i<COUL.length;i++)CA.push(CA[i-1]+Math.hypot(COUL[i][0]-COUL[i-1][0],COUL[i][1]-COUL[i-1][1]));const CLEN=CA[CA.length-1];
const RIVP=COUL.map((p,i)=>{if(i===0||i===COUL.length-1)return p.slice();const a=COUL[Math.max(0,i-1)],b=COUL[Math.min(COUL.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,
 o=70*Math.sin(CA[i]*.0024+.3)*smooth(0,300,CA[i]);return[p[0]-dz/l*o,p[1]+dx/l*o];});
const RL=STAGEKIT.line(RIVP,60),RA=[0];for(let i=1;i<RIVP.length;i++)RA.push(RA[i-1]+Math.hypot(RIVP[i][0]-RIVP[i-1][0],RIVP[i][1]-RIVP[i-1][1]));const RLEN=RA[RA.length-1];
const FLOOR_HW=210,WALL_W=70,RIV_HW=34;
const rivLvl=s=>LEVEL-16*Math.pow(clamp(s/RLEN,0,1),1.15);
const coulAt=(x,z)=>{const n=CL.near(x,z,FLOOR_HW+WALL_W+40);return n.k<0?null:{d:n.d,s:CA[n.k]+n.t*(CA[n.k+1]-CA[n.k])};};
const rivAt=(x,z)=>{const n=RL.near(x,z,140);return n.k<0?null:{d:n.d,s:RA[n.k]+n.t*(RA[n.k+1]-RA[n.k])};};
const inLake=(x,z)=>z>shoreZ(x)-10;
function land0(x,z){const sz=shoreZ(x);
 if(z>sz){const w=z-sz;return LEVEL+1.2-48*smooth(0,700,w)-2*smooth(0,40,w)-6*(fbm(x*.003,z*.003,6307,2)-.5)*smooth(60,400,w);}   /* the beach, then the deep */
 let h=bench(x,z);const C=coulAt(x,z);if(!C)return h;
 const R=rivAt(x,z),lv=rivLvl(R?R.s:C.s),rip=3*Math.pow(.5+.5*Math.sin(C.s*2*Math.PI/110+1.3*(fbm(x*.01,z*.01,6309,2)-.5)),1.6),
  fl=lv+2.2+rip*smooth(40,90,R?R.d:1e9)*smooth(0,250,C.s);
 const floor=R&&R.d<RIV_HW+18?(R.d<RIV_HW?lv-3*(1-Math.pow(R.d/RIV_HW,2)):mix(lv+.5,fl,smooth(RIV_HW,RIV_HW+18,R.d))):fl;
 return C.d<FLOOR_HW?Math.min(h,floor):Math.min(h,mix(floor,h,Math.pow(smooth(FLOOR_HW,FLOOR_HW+WALL_W,C.d),.7)));}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=land0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){if(inLake(x,z))return LEVEL;const R=rivAt(x,z);return R&&R.d<RIV_HW+2?rivLvl(R.s):-1e9;}
// THE ERRATICS: boulders the floods carried, on the terraces and the coulee's floor (KSTACKS 'balanced': a block on a narrower foot)
const ERRATICS=(function(){const out=[],cell=420,N=Math.ceil(TERR.R/cell);
 for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(6311,i,j),u=k=>KRAND.unit(KRAND.hash(h,k,1)),x=(i+u(1))*cell,z=(j+u(2))*cell;
  if(Math.abs(x)>TERR.R-80||Math.abs(z)>TERR.R-80||inLake(x,z)||u(3)>.62)continue;const R=rivAt(x,z);if(R&&R.d<RIV_HW+20)continue;
  const C=coulAt(x,z);if(C&&C.d>FLOOR_HW-10&&C.d<FLOOR_HW+WALL_W+10)continue;
  const y0=Math.min(land0(x-4,z),land0(x+4,z),land0(x,z-4),land0(x,z+4))-.8;
  out.push(KSTACKS.make({id:'erratic'+i+':'+j,kind:'balanced',x,z,y0,seed:(h%99991)+1,H:3+7*u(4),r:2.4+3*u(5),ry:u(6)*6.28,lean:.06,taper:.2,crown:.95,
   name:'An erratic (a block the outburst floods carried here from the Outlands)'}));}return out;})();
const rockFoot=(x,z)=>{const F=KSTACKS.foot(ERRATICS,x,z);return F?F.d:1e9;};
// THE GOD'S ROAD: up the coulee's east rim from the north edge, then east along the shore's first terrace
const ROAD=(function(){const P=[];for(let k=COUL.length-1;k>=0;k-=4){const p=COUL[k];if(p[1]>shoreZ(p[0])-420)break;
  const a=COUL[Math.max(0,k-1)],b=COUL[Math.min(COUL.length-1,k+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,o=FLOOR_HW+WALL_W+60;P.push([p[0]-dz/l*o*Math.sign(-dz||1),p[1]+dx/l*o*Math.sign(-dz||1)]);}
 const last=P[P.length-1];for(let x=last[0]+40;x<TERR.R+200;x+=40)P.push([x,shoreZ(x)-300+25*Math.sin(x*.003)]);return{P,line:STAGEKIT.line(P,40)};})();
const roadD=(x,z)=>ROAD.line.near(x,z,40).d;
const SHRINE=(function(){const p=ROAD.P[Math.floor(ROAD.P.length*.42)];return{x:p[0]+14,z:p[1]+10};})();
const inWorks=(x,z,pad)=>{pad=pad==null?0:pad;return roadD(x,z)<5+pad||Math.hypot(x-SHRINE.x,z-SHRINE.z)<9+pad;};
// ---------------------------------------------------------------- the fields (cached on an 18 m lattice)
//   shore   the tarn's beach and its first 120 m        coulee  the coulee's floor (1) to its walls (0)      ripple  a ripple's crest
//   bank    the river's banks in the coulee             tread   a flood terrace's flat (1) or a riser (0)      road, works, rock
function fieldsAt(x,z,h,slope){const sz=shoreZ(x),C=coulAt(x,z),R=rivAt(x,z),lake=inLake(x,z)?1:0,t=clamp((sz-z)/1700,0,1);
 const shore=lake?0:smooth(160,0,sz-z),coulee=C&&!lake?smooth(FLOOR_HW+10,FLOOR_HW-30,C.d):0,bank=R&&!lake?smooth(RIV_HW+60,RIV_HW,R.d):0;
 const rip=coulee*(C?smooth(.55,.85,.5+.5*Math.sin(C.s*2*Math.PI/110)):0)*(1-bank),tread=coulee>.5||lake?0:smooth(.35,.12,slope);
 return{wet:clamp(.4+.4*shore+.4*bank+.2*coulee,0,1),flow:R&&R.d<RIV_HW?1:0,upland:t,rock:smooth(.35,.6,slope)*(1-lake)+(rockFoot(x,z)<3?1:0),slope,dry:0,
  shore,coulee,ripple:rip,bank,tread,road:smooth(10,3,roadD(x,z)),works:inWorks(x,z,4)?1:0};}
const FNAMES=['wet','flow','upland','rock','slope','dry','shore','coulee','ripple','bank','tread','road','works'];
const {FC,FIELD}=STAGEKIT.fields(FNAMES,fieldsAt,terrainH);
FIELD.bankX=(x,z)=>{const R=rivAt(x,z);return R&&!inLake(x,z)?smooth(RIV_HW+60,RIV_HW,R.d):0;};
// ---------------------------------------------------------------- the host binding
const SPINE=[];for(let k=0;k<RIVP.length;k+=20)SPINE.push(RIVP[k]);for(let x=-3000;x<=3000;x+=500)SPINE.push([x,shoreZ(x)-60]);
for(let k=0;k<ROAD.P.length;k+=10)SPINE.push(ROAD.P[k]);for(let x=-2800;x<=2800;x+=1400)for(const z of[-2400,-800])SPINE.push([x,z]);
function rootMask(x,z){if(inWorks(x,z,3)||rockFoot(x,z)<2)return 0;const h=terrainH(x,z),d=h-waterH(x,z);return d<.15?0:d<.7?(d-.15)/.55:1;}
BIO.init({tags:'outlandgate',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:[],ticks:tick,seed:6300,origin:SPINE,center:[0,-600],fields:FIELD,register:REGISTER,err:reportErr,capThrow:false,
 lod:{hero:240,mid:600,far:2600,floor:[180,460]},windows:{}});
{const Q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS);
// ---------------------------------------------------------------- THE STAGE
const LIN=h=>new THREE.Color(h);
const STAGE={key:'tarn',px:STATION_PX,seed:300,title:'the Upper Gate Tarn',site:{px:1538-272,py:472-330},
 hint:'The Outland Gate, station 3: the gap\'s south end (5.1 px 1538,472; Cfa shores, 1.33 atm), the Upper Gate Tarn at 1,521 m and its outlet. The north shore climbs 170 m in three flood terraces to the bench; through the bench the outlet coulee runs north, a flood-cut trench 420 m across with walls of bare rock, Hau-Gel falling 16 m through it in rapids over giant current ripples. Erratics the outburst floods carried lie on the terraces and the coulee floor. The Outlands\' fungoid natives come in here (young colonies on the wet shores: deck-cap masts, cap-shrubs, lantern pods, read in place from the Outlands kit) among the crater side\'s cottonwoods, oaks and maples. The god\'s road comes up the coulee\'s rim past the trickster\'s shrine and turns east along the shore; on the skyline to the south-east the Nursery Bench\'s 2.2 km scarp',
 sky:{"air":{"pressure":1.33,"humidity":0.66}},
 atmos:{climate:{wet:true,cold:false}},
 down:[-6,-12],wind:{speed:1.8,daySpeed:.9},   /* the gap's axis here: the river from 1544,480 to 1538,468 */
 heat:{mean:22,amp:6,peakH:15,y0:LEVEL},
 flood:{name:'The outburst flood (the N Outlands\' lake breaking through: the tarn and its coulee brimming)',box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],y:LEVEL-20,h:34,level:LEVEL-.4,depth:12},
 edgeH:(x,z)=>inLake(x,z)?LEVEL-30:bench(x,z),
 farWater:(x,z)=>{const G=OG_FAR,u=Math.round(x/G.cell+G.r),v=Math.round(z/G.cell+G.r);if(u<0||v<0||u>=G.h.length||v>=G.h.length)return null;
  return (z>TERR.R*1.1&&Math.abs(x)<26000&&z<16000)?LEVEL:null;},   /* the tarn's far reaches south and east (the model's 56 cells) */
 paint(x,z,h,c,f){const sh=f('shore'),co=f('coulee'),ri=f('ripple'),bk=f('bank'),rk=f('rock'),rd=f('road'),n=fbm(x*.01,z*.01,6341,2);
  c.setHex(0x6e7a46).lerp(LIN(0x5e6e3e),smooth(.4,.7,n)*.4).lerp(LIN(0x7a7a5a),rk*.7);
  c.lerp(LIN(0x9a9084),co*.8).lerp(LIN(0xaaa294),ri*.35).lerp(LIN(0x5e5440),bk*.5).lerp(LIN(0x9a9084),sh*smooth(60,0,shoreZ(x)-z)*.7);
  if(h<LEVEL-.2&&inLake(x,z))c.lerp(LIN(0x4a4a3c),.85);if(h<waterH(x,z)-.2&&!inLake(x,z))c.lerp(LIN(0x4a4a3c),.85);c.lerp(LIN(0x9a8462),rd*.75);},
 layers:[{fam:'ground.grass',name:'meadow',amt:.45},{fam:'ground.shingle',name:'flood gravel',amt:.65},{fam:'ground.mud',name:'bank mud',amt:.55}],
 gl(x,z){const co=Math.max(FC.at(FC.a.coulee,x,z),FC.at(FC.a.shore,x,z)*smooth(60,0,shoreZ(x)-z)),bk=FC.at(FC.a.bank,x,z)*(1-co*.5),m=(1-co)*(1-bk)*(1-FC.at(FC.a.road,x,z));return[m,co,bk];},
 rocks:ERRATICS,rockName:{balanced:'An erratic (a block the outburst floods carried here: KSTACKS)'},
 probes:[[RIVP[40][0],-1.5,RIVP[40][1]],[0,1,shoreZ(0)+300]],
 landmarks:[{name:'The Upper Gate Tarn (56 cells of the model, its level 1,521.46 m; deep)',kind:'water',x:0,z:shoreZ(0)+1800,y:LEVEL-50,r:2600,h:52},
  {name:'The outlet coulee (a flood-cut trench: the outburst floods\' scour, its walls bare rock)',kind:'landform',x:COUL[Math.floor(COUL.length/2)][0],z:COUL[Math.floor(COUL.length/2)][1],y:rivLvl(RLEN/2)-4,r:CLEN/2,h:170},
  {name:'Giant current ripples on the coulee\'s floor (the floods\' bedforms, 3 m high, 110 m apart)',kind:'landform',x:COUL[Math.floor(COUL.length*.6)][0],z:COUL[Math.floor(COUL.length*.6)][1],y:rivLvl(RLEN*.6)-2,r:300,h:10},
  {name:'Hau-Gel, leaving the tarn (rapids down the coulee)',kind:'water',x:RIVP[60][0],z:RIVP[60][1],y:rivLvl(RA[60])-5,r:RIV_HW*2,h:10}],
 water:{lakes:[{name:'The Upper Gate Tarn',level:LEVEL,box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],seed:[0,shoreZ(0)+1500],land:(x,z)=>!inLake(x,z),shallow:0x6a8a84,deep:0x22404a,label:'The Upper Gate Tarn (1,521 m)'}],
  flows:(function(){const pts=RIVP.map((p,i)=>[p[0],p[1],rivLvl(RA[i])]).filter(p=>!inLake(p[0],p[1]-RIV_HW));
   return[{name:'Hau-Gel (the outlet: rapids down the coulee)',pts,width:pts.map(()=>RIV_HW*2*.86),speed:2.2,shallow:0x7a8a74,deep:0x3e5450}];})()},
 inWorks,worksAt:[SHRINE.x,SHRINE.z],worksNeed:['shrine','cairn','god\'s road'],
 works(W){const y=W.gmin(SHRINE.x,SHRINE.z,4)-.8;W.box('stone',SHRINE.x,y,SHRINE.z,5,4.2,5);W.box('dark',SHRINE.x,y+4.2,SHRINE.z,6,.6,6);W.box('wood',SHRINE.x+6,y,SHRINE.z,.5,7.5,.5);
  W.box('wood',SHRINE.x+6.6,y+7.3,SHRINE.z,1.8,.5,.4);W.box('wood',SHRINE.x+7.3,y+7.5,SHRINE.z,.3,1.1,.3);
  W.rec({name:'The trickster\'s shrine at the outlet (the runner bird\'s: the god\'s road passes it)',kind:'structure',x:SHRINE.x,z:SHRINE.z,y,r:9,h:10});
  let n=0;for(let k=6;k<ROAD.P.length;k+=11){const p=ROAD.P[k],x=p[0]+7,z=p[1]+3,y0=W.gmin(x,z,2)-.4;W.box('stone',x,y0,z,2.2,1.1,2.2);W.box('stone',x,y0+1.1,z,1.6,1,1.6,.4);W.box('stone',x,y0+2.1,z,1,.9,1,.9);
   W.rec({name:'A cairn on the god\'s road (Coyote contour carvings on its stones)',kind:'structure',key:'cairn:'+k,x,z,y:y0,r:2,h:3.2});n++;}
  for(let k=0;k<ROAD.P.length;k+=10){const p=ROAD.P[k];W.rec({name:'The god\'s road (the Sleeping City to Trickster\'s House: past the tarn)',kind:'road',key:'godsroad:'+k,x:p[0],z:p[1],y:terrainH(p[0],p[1]),r:6,h:2});}
  return{cairns:n};},
 hazards(H){for(let s=0;s<RLEN;s+=400){const k0=RA.findIndex(a=>a>=s),k1=RA.findIndex(a=>a>=s+400),i0=Math.max(0,k0),i1=k1<0?RIVP.length-1:k1;if(i1-i0<2)continue;
   const m=RIVP[Math.floor((i0+i1)/2)];if(inLake(m[0],m[1]))continue;const L=[],Rt=[];
   for(let i=i0;i<=i1;i++){const a=RIVP[Math.max(0,i-1)],b=RIVP[Math.min(RIVP.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;
    L.push([RIVP[i][0]-dz/l*RIV_HW-m[0],RIVP[i][1]+dx/l*RIV_HW-m[1]]);Rt.push([RIVP[i][0]+dz/l*RIV_HW-m[0],RIVP[i][1]-dx/l*RIV_HW-m[1]]);}
   H.add({kind:'drown',key:'drown.river:'+s,name:'Hau-Gel in the coulee (rapids: drowning)',x:m[0],y:rivLvl(s)-4,z:m[1],r:260,h:7,shape:{type:'poly',pts:L.concat(Rt.reverse()),h:7}});}
  H.add({kind:'drown',key:'drown.tarn',name:'The Upper Gate Tarn (deep and cold below its warm skin: drowning)',x:0,y:LEVEL-50,z:TERR.R*.55,r:TERR.R*1.6,h:51,
   shape:{type:'poly',pts:(function(){const p=[];for(let x=-TERR.R*1.1;x<=TERR.R*1.1;x+=100)p.push([x,shoreZ(x)+6-TERR.R*.55]);p.push([TERR.R*1.1,TERR.R*.6],[-TERR.R*1.1,TERR.R*.6]);return p;})(),h:51}});
  for(let k=0;k<COUL.length;k+=15){const p=COUL[k],a=COUL[Math.max(0,k-1)],b=COUL[Math.min(COUL.length-1,k+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;if(p[1]>shoreZ(p[0])-300)continue;
   for(const sd of[-1,1]){const fx=p[0]-dz/l*sd*(FLOOR_HW+8),fz=p[1]+dx/l*sd*(FLOOR_HW+8),rx=p[0]-dz/l*sd*(FLOOR_HW+WALL_W+4),rz=p[1]+dx/l*sd*(FLOOR_HW+WALL_W+4);
    H.add({kind:'crush',key:'crush.coulee:'+k+':'+sd,name:'Rockfall off the coulee\'s wall (crush)',x:fx,y:terrainH(fx,fz)-1,z:fz,r:16,h:12,shape:{type:'cyl',r:16,h:12}});
    H.add({kind:'fall',key:'fall.coulee:'+k+':'+sd,name:'The coulee\'s rim (a cliff of bare rock: fall)',x:rx,y:terrainH(rx,rz)-4,z:rz,r:10,h:8,shape:{type:'cyl',r:10,h:8}});}}},
 wetPts(){const P=[];for(let s=300;s<RLEN-100;s+=500){const R=RIVP[RA.findIndex(a=>a>=s)];if(inLake(R[0],R[1]))continue;P.push({x:R[0],z:R[1],y:rivLvl(s)-1,wet:true});}
  for(const x of[-2000,0,2000])P.push({x,z:shoreZ(x)+600,y:LEVEL-2,wet:true});
  for(const q of [[2200,-1500],[-2400,-1200],[1500,-2600],[-1500,shoreZ(-1500)-500]])if(waterH(q[0],q[1])<-1e8)P.push({x:q[0],z:q[1],y:terrainH(q[0],q[1])+1,wet:false});return P;},
 fauna:{land:'outlandgate.tarn',rec:{biome:'outlandgate',land:'tarn',include:['lake-diver','marsh-harrier','giant-river-otter'],exclude:['runner-bird'],density:{grazer:.4,predator:.07,flyer:.07,water:.12},maxGroup:12},
  ok:(x,z,people)=>!inWorks(x,z,people?-6:2)&&waterH(x,z)<-1e8&&rockFoot(x,z)>3&&FIELD.slope(x,z)<.45,
  water:(x,z)=>inLake(x,z)&&terrainH(x,z)<LEVEL-2,
  people(){const o=[];for(let k=3;k<ROAD.P.length;k+=13){const p=ROAD.P[k],s=KRAND.unit(KRAND.hash(6351,k,1)),x=p[0]+(s<.5?-1:1)*(8+4*s),z=p[1]+3;
    o.push({key:'runner-bird',name:'Runner bird',x,z,ry:s*6.28,mode:s<.5?'walk':'idle',why:'the trickster\'s form, on the god\'s road'});}return o;},
  badAt:[SHRINE.x,SHRINE.z,'in the trickster\'s shrine']},
 build:{},budgetTypes:{'ogate/stragglers':'pass'},wetAt:[0,shoreZ(0)+900],
 views(){const K=STAGEKIT,g=K.gh,m=COUL[Math.floor(COUL.length*.55)],o=RIVP[25],E=ERRATICS[Math.floor(ERRATICS.length/2)],C=K.nearTree('gatecottonwood',m[0],m[1]),
   Co=(OGATE.COLONIES||[])[0]||{x:800,z:shoreZ(800)-80};
  return{
   'The tarn from the north bench':K.look(900,-1700,30,600,shoreZ(600)+1600,-10),
   'The outlet':K.look(o[0]+260,o[1]-120,22,0,shoreZ(0)+200,0),
   'Down the outlet coulee':K.look(COUL[30][0],COUL[30][1],60,COUL[COUL.length-20][0],COUL[COUL.length-20][1],10),
   'Giant current ripples':K.look(m[0]+90,m[1]+50,70,m[0]-40,m[1]-80,0),
   'The coulee\'s wall':(()=>{const p=COUL[Math.floor(COUL.length*.7)];return K.look(p[0]+60,p[1],8,p[0]+FLOOR_HW+WALL_W,p[1],60);})(),
   'An erratic':[E.x+18,g(E.x+18,E.z+10,2),E.z+10,E.x,E.y0+(E.top-E.y0)*.5,E.z],
   'The flood terraces':K.look(-2600,shoreZ(-2600)-60,12,-2200,shoreZ(-2200)-1500,90),
   'The trickster\'s shrine at the outlet':K.look(SHRINE.x+16,SHRINE.z+12,2.2,SHRINE.x+3,SHRINE.z,3),
   'The god\'s road and its cairns':(()=>{const p=ROAD.P[Math.floor(ROAD.P.length*.7)];return K.look(p[0]-60,p[1]-30,6,p[0]+120,p[1]+20,2);})(),
   'A young fungoid colony on the shore':K.look(Co.x+16,Co.z+10,3,Co.x,Co.z,3),
   'Cottonwoods in the coulee':K.atTree(C,26,2.4,3,C.H*.5),
   'South-east to the Nursery Bench\'s scarp':K.look(2400,shoreZ(2400)-80,30,40000,90000,2200)};},
 checks(add){add('the outlet graded down the coulee (every step level or down)',TARNCHK.graded(RIVP.map((p,i)=>rivLvl(RA[i]))));
  add('the Outlands\' stragglers on the wet ground (young colonies on the shore and the coulee\'s floor)',TARNCHK.stragglers(OGATE.COLONIES||[]));
  add('the erratics on the terraces and the coulee floor, none in the water',TARNCHK.erratics(ERRATICS));},
 negatives(add){add('a river that climbs',TARNCHK.graded([1520,1521,1519]));
  add('a colony on the dry bench',TARNCHK.stragglers([{x:-2600,z:-3000,key:'test'}]));
  add('an erratic in the tarn',TARNCHK.erratics([{x:0,z:shoreZ(0)+900,name:'test'}]));},
};
const TARNCHK={
 graded(L){let up=0;for(let i=1;i<L.length;i++)if(L[i]>L[i-1]+.001)up++;return{ok:L.length>2&&!up,detail:up?up+' steps that climb':L.length+' points of the outlet, every step level or down (16 m through the coulee)'};},
 stragglers(C){const bad=C.filter(c=>!(FIELD.shore(c.x,c.z)>.2||FIELD.coulee(c.x,c.z)>.3||FIELD.bank(c.x,c.z)>.2));
  return{ok:C.length>0&&!bad.length,detail:bad.length?bad.length+' colonies on the dry bench (first at '+bad[0].x.toFixed(0)+', '+bad[0].z.toFixed(0)+')':C.length+' young colonies, each on the shore, the coulee\'s floor or a bank'};},
 erratics(E){const bad=E.filter(e=>waterH(e.x,e.z)>-1e8);return{ok:E.length>0&&!bad.length,detail:bad.length?bad.length+' erratics in the water':E.length+' erratics, none in the water'};},
};
