// ================================================================= HOST — stage (the Catch, station 2: STAIR'S OASIS)
// WHERE (PLAN.md sections 6b and 10): px 834,1112 on the scale model (Stair's point, moved there 2026-10-23), ~1,000 m, in
// a hollow through the interior hills that dams the groundwater moving under the fans toward the floor, so it rises as
// springs (Turpan's arrangement). The biggest of the five oases, and the only one lived in (Stair: a couple of hundred
// people, a glorified campground; the settlement is its own build, not this kit). What is here:
//   THE SPRING     a pool in the hollow's floor, two seeps down its runnel to the south, the water dying into a salt crust
//   THE TUGAI      Euphrates poplars round the water, salt cedars at the fringe, reeds in it; the eastern desert kit's
//                  wadi palms and mesquite (read in place) on the wet ground; saltbush and brine lamps on the crust
//   THE CAMPGROUND trampled ground east of the pool, fire rings (the caravans pass through; the merchants live under
//                  the Hill), no buildings drawn
//   THE HILL       Stair's site (kits/ancients targets/hill: 111 garden terraces climbing ~560 m of slope): the slope east
//                  of the spring, rising from ~1,000 m to ~1,560 m in a kilometre, left EMPTY here (a site record)
//   THE PORTAL     the Ancients' tunnel's southern mouth at the Hill's foot (north-east), open, with the divers' camp on
//                  its apron and their spoil; the seal is a rubble plug deep inside, not drawn (the owner, 2026-10-26).
//                  A placeholder frame until the Stair build draws the portal from kits/ancients
// THE MAP (x east, z south, y up, real metres; R 3000): the west ridge (~1.4-1.7 km) on the west, the hollow's floor in
// the middle running north to south (the crossing's line), the Hill's slope and the east ridge behind it.
const TERR={R:3000};
const WIND=(function(){const w=[-.45,.9],l=Math.hypot(w[0],w[1]);return[w[0]/l,w[1]/l];})();   /* down the hollow, from the north */
const HILL={x0:250,x1:1350,rise:560};   /* the Hill's slope: x from its foot to its summit deck, and its rise */
const PORTAL={x:330,z:-760,face:Math.PI,w:11,h:9,name:'The tunnel\'s southern portal (the Ancients\' road from Arcbeam, sealed halfway since the Cataclysm)'};
// the land without the water's hollow: the trough falling south, the west ridge, the Hill's slope and the east ridge
function landH(x,z){let h=1000-.012*z+6*(nz(x,z,.002,3,61)-.5);
 const wr=smooth(-500,-2300,x+180*(nz(x,z,.0009,2,62)-.5)*2);h+=wr*(520+260*ridgeN(x,z,.0007,3,63))+wr*40*(nz(x,z,.006,2,64)-.5);
 const hk=smooth(HILL.x0,HILL.x1,x+90*(nz(x,z,.0012,2,65)-.5));h+=HILL.rise*hk+smooth(HILL.x1,2800,x)*(220+180*ridgeN(x,z,.0008,3,66));
 // the portal's apron: a level shelf cut into the Hill's foot, and the divers' spoil heaps north of it
 const pa=smooth(70,30,Math.hypot((x-PORTAL.x+25)*.8,z-PORTAL.z));h=mix(h,landAt0(PORTAL.x-20,PORTAL.z),pa);
 for(const S of SPOIL){const d=Math.hypot(x-S.x,z-S.z)/S.r;if(d<1)h+=S.h*(1-d*d);}
 return h;}
function landAt0(x,z){return 1000-.012*z+6*(nz(x,z,.002,3,61)-.5)+HILL.rise*smooth(HILL.x0,HILL.x1,x+90*(nz(x,z,.0012,2,65)-.5));}
const SPOIL=[{x:300,z:-830,r:14,h:3.2},{x:270,z:-850,r:10,h:2.4},{x:330,z:-870,r:12,h:2.8}];
// THE WATER: the spring's pool and two seeps down its runnel; the runnel's line dies into a crust in the south
const POOL=makePool({x:-140,z:80,r:42,land:landH,name:'Stair\'s spring (the biggest of the five oases)'});
const SEEP1=makePool({x:-70,z:430,r:15,land:(x,z)=>POOL.carve(landH(x,z),x,z),name:'A seep down the spring\'s runnel',deep:1});
const SEEP2=makePool({x:20,z:660,r:10,land:(x,z)=>SEEP1.carve(POOL.carve(landH(x,z),x,z),x,z),name:'A seep, the last before the crust',deep:.8});
const POOLS=[POOL,SEEP1,SEEP2];
const RUNNEL=[[POOL.x,POOL.z],[-110,250],[SEEP1.x,SEEP1.z],[-20,560],[SEEP2.x,SEEP2.z],[90,820],[150,1000]];
const runD=(x,z)=>polyD(RUNNEL,x,z);
const CRUST={x:170,z:1050,r:230};
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;let h=landH(x,z);
 h-=.7*smooth(9,2,runD(x,z))*smooth(POOL.r*1.2,POOL.r*1.8,POOL.d(x,z));
 for(const P of POOLS)h=P.carve(h,x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){for(const P of POOLS)if(P.contains(x,z))return P.lv;return -1e9;}
/* THE CRAGS (the look pass, 2026-10-26): the interior hills' rock standing out of their steep faces, as KSTACKS buttes (the
   oxidised basalt set, STAGE.rockSets): on the west ridge and the east ridge behind the Hill, never on the Hill's own slope
   (Stair's site) or near the water */
const ROCK=(function(){const L=[],K=KSTACKS;
 const slopeAt=(x,z)=>Math.hypot(landH(x+6,z)-landH(x-6,z),landH(x,z+6)-landH(x,z-6))/12;
 const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<20;i++){const a=i/20*TAU;for(const k of [.3,.7,1.1])m=Math.min(m,landH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-2;};
 for(let k=0;k<300&&L.length<40;k++){const x=-2700+5400*KRAND.unit(KRAND.hash(2901,k)),z=-2700+5400*KRAND.unit(KRAND.hash(2901,k,1));
  if(Math.hypot(x,z)>TERR.R*.9||(x>-500&&x<HILL.x1+200)||slopeAt(x,z)<.32||L.some(B=>Math.hypot(B.x-x,B.z-z)<B.R+60))continue;
  const H=26+44*KRAND.unit(KRAND.hash(2901,k,2)),R=18+26*KRAND.unit(KRAND.hash(2901,k,3)),ry=KRAND.unit(KRAND.hash(2901,k,4))*TAU;
  const B=K.make({id:'crag'+k,kind:'butte',x,z,y0:footY(x,z,R*1.4),seed:2950+k,bed:[2.5,6],lobes:.32,weather:1,
   tiers:[{h:H*.65,r:R,e:1.5,ry},{h:H*.35,r:R*.68,e:1.3,ry:ry+.4,dx:rr0(k,5)*R*.2,dz:rr0(k,6)*R*.2}]});
  B.name='A crag of the interior hills (oxidised basalt)';L.push(B);}
 return L;})();
function rr0(k,j){return KRAND.unit(KRAND.hash(2901,k,j))-.5;}
const onRock=(x,z)=>!!KSTACKS.at(ROCK,x,z);
function groundAll(x,z){return Math.max(terrainH(x,z),KSTACKS.topAt(ROCK,x,z));}
const poolD=(x,z)=>Math.min(...POOLS.map(P=>P.d(x,z)-P.r));
// THE CAMPGROUND: trampled ground east of the pool, between the water and the Hill's foot
const CAMP={x:110,z:40,rx:150,rz:190};
const campK=(x,z)=>smooth(1,.6,Math.hypot((x-CAMP.x)/CAMP.rx,(z-CAMP.z)/CAMP.rz)*(1+.15*(nz(x,z,.01,2,67)-.5)));
const apronK=(x,z)=>smooth(60,25,Math.hypot(x-PORTAL.x+25,z-PORTAL.z));

// ---------------------------------------------------------------- the fields (FNAMES)
function fieldsAt(x,z,h,slope){const pd=poolD(x,z),rd=runD(x,z),cd=Math.hypot(x-CRUST.x,z-CRUST.z)/CRUST.r;
 const wet=clamp(Math.max(smooth(380,0,pd)*.98,smooth(60,3,rd)*.85*smooth(1.3,.6,cd),smooth(1.1,.4,cd)*.5)+.04,0,1);
 const rock=onRock(x,z)?1:clamp(smooth(.2,.45,slope)*.95+smooth(1250,1500,h)*.4*smooth(.2,.4,slope),0,1),trod=Math.max(campK(x,z),apronK(x,z)*.8);
 const crust=smooth(1,.45,cd)*(1-smooth(30,8,rd)*.5);
 const sand=clamp(smooth(.5,.62,nz(x,z,.003,2,68))*smooth(.3,.1,slope)*(1-trod)*smooth(60,220,pd)*.8,0,1);
 return{wet,flow:smooth(30,4,rd),upland:clamp((h-1000)/700,0,1),rock,slope,salt:crust*.6,sand,reg:clamp((1-sand)*(1-rock)*smooth(150,500,pd)*(1-crust)*.8,0,1),
  silt:0,yard:0,crust,bed:0,strand:0,dry:0,spring:smooth(80,0,pd),trod,algal:smooth(14,2,pd)*.6,soda:0,cold:0,canyon:0,rim:0,dune:1,oasis:0,abyss:0};}
const SPINE=[[POOL.x,POOL.z],[CAMP.x,CAMP.z],[SEEP1.x,SEEP1.z],[SEEP2.x,SEEP2.z],[CRUST.x,CRUST.z],[PORTAL.x-40,PORTAL.z],[(HILL.x0+HILL.x1)/2,0],[-1200,0],[-300,-900],[0,1600]];
const BOUND=bindStage({R:TERR.R,N:420,terrainH,waterH,fieldsAt,seed:29,spine:SPINE,rockAt:onRock,keep:(x,z)=>Math.max(campK(x,z)*.85,apronK(x,z))});
const FC=BOUND.FC,FIELD=BOUND.FIELD;

// ---------------------------------------------------------------- the camps: the caravans' fire rings and the divers'
[[60,-20],[150,90],[190,-60],[90,180],[230,60]].forEach((p,k)=>fireRing(p[0],p[1],'A caravan\'s fire ring (Stair\'s campground)',k));
[[PORTAL.x-40,PORTAL.z+10],[PORTAL.x-55,PORTAL.z-14]].forEach((p,k)=>fireRing(p[0],p[1],'The arcology divers\' fire ring (at the portal)',10+k));
SPOIL.forEach((S,k)=>REGISTER({name:'The divers\' spoil (rubble and dross out of the tunnel\'s southern half)',key:'camp.spoil',x:S.x,z:S.z,y:landAt0(S.x,S.z)-1,r:S.r,h:S.h+3}));
// THE PORTAL (a placeholder: the Stair build draws it from kits/ancients): a concrete frame in the Hill's foot, a dark mouth
const PORTAL_MESH=(function(){const g=new THREE.Group(),y=landAt0(PORTAL.x-20,PORTAL.z),W=PORTAL.w,H=PORTAL.h,mat=new THREE.MeshLambertMaterial({color:0xb8b0a2}),dark=new THREE.MeshBasicMaterial({color:0x080706});
 const box=(w,h,d,x,yy,z,m)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m||mat);b.position.set(x,yy,z);g.add(b);return b;};
 box(2,H+2,W+6,0,H/2,0);box(14,3,W+8,4,H+1.5,0);box(16,H+4,3,6,H/2,-(W/2+1.5));box(16,H+4,3,6,H/2,W/2+1.5);box(.4,H,W,-.6,H/2,0,dark);box(16,H,W,8,H/2,0,dark);
 g.children.splice(0,1);   /* no back wall in front of the mouth */
 g.position.set(PORTAL.x,y-.3,PORTAL.z);g.traverse(o=>{o.userData.host=true;o.userData.inspectLabel=PORTAL.name+' (placeholder)';});
 REGISTER({name:PORTAL.name,key:'site.portal.stair',x:PORTAL.x+6,z:PORTAL.z,y:y-1,r:14,h:14});scene.add(g);return g;})();
// STAIR'S SITE: a record, not a registered volume (nothing is drawn on the slope: the settlement is its own build)
BIO.record({name:'Stair: the Hill arcology\'s site (kits/ancients targets/hill; the settlement is its own build)',key:'site.stair',kind:'site',x:(HILL.x0+HILL.x1)/2,y:landAt0((HILL.x0+HILL.x1)/2,0),z:0,r:600,h:600});

// ---------------------------------------------------------------- the station's say: STAGE
const STAGE={
 key:'oasis',name:'The Catch: Stair\'s oasis',title:'Krator biome — the Catch: Stair\'s oasis',seed:29,hour:13,
 hint:'The Catch, station 2: Stair\'s spring in a hollow through the interior hills (~1,000 m): the pool and its seeps, Euphrates poplars, salt cedars and reeds, the eastern desert\'s palms and mesquite, the caravans\' campground, the Hill\'s empty slope (Stair\'s site) and the tunnel\'s southern portal with the divers\' camp',
 site:{px:834,py:1112},air:{pressure:1.43,humidity:.18},clouds:{cover:.05},fogDensity:0.00016,fogH:{y0:990,H:90,k:.8},siteH:1000,
 ridges:[
  {dist:220000,base:-1.81,amp:8.82,cycles:30,octaves:6,peaks:18,peakAmp:2.4,seed:51,rock:[0.41,0.36,0.32],hz:0.68},
  {dist:280000,base:1.4,amp:1.9,cycles:7,octaves:4,peaks:3,peakAmp:1.2,win:[318,22,1.6],floor:-1,seed:52,rock:[0.38,0.33,0.31],hz:0.64},
  {dist:60000,base:-1.96,amp:8.82,cycles:42,octaves:6,peaks:26,peakAmp:3,seed:53,rock:[0.48,0.40,0.33],snowH:3500,hz:0.48},
  {peaks:14,peakAmp:1.2,dist:12000,base:0.72,amp:3.7,cycles:34,octaves:5,seed:54,rock:[0.57,0.46,0.34],hz:0.28}],
 rockSets:{wall:'ground.rock',top:'ground.rock',wallLabel:'Oxidised basalt (a crag of the interior hills)',topLabel:'The weathered top of a crag',band:[0x9a6a50,0x8a5c44,0xa87a5c,0x7e5440],topCol:0x9a7458},
 spine:SPINE,nebkhas:[],expect:['poplar','tamarisk','reed','saltbush','palm'],
 bias:{poplar:(x,z)=>1.4*(1-smooth(.5,.9,FC.at(FC.a.trod,x,z)))},
 water:POOLS.map((P,k)=>({key:'pool'+k,kind:'still',rec:P.rec,name:P.name,look:{color:0x2a6a64,roughness:.08,metalness:.05,envMapIntensity:.45,renderOrder:1}})),
 sedQ:.9,sedMask:(x,z)=>smooth(360,80,poolD(x,z)),
 sedFields:{dune:()=>1,canyon:()=>0,rim:()=>0,abyss:()=>0,oasis:(x,z)=>smooth(300,30,poolD(x,z))},
 stalkers:[],exportBox:[POOL.x-150,POOL.z-150,POOL.x+150,POOL.z+150],
 registers:[{name:'The spring hollow through the interior hills (the groundwater dammed, rising as springs)',key:'landform.hollow',x:0,z:0,y:960,r:800,h:220},
  {name:'The salt crust where the runnel dies',key:'landform.crust',x:CRUST.x,z:CRUST.z,y:landAt0(CRUST.x,CRUST.z)-6,r:CRUST.r*.8,h:20}]};
{const K=h=>new THREE.Color(h),SOIL=K(0xa88a68),SOIL2=K(0x9a7c5c),SAND=K(0xd0a676),ROCKC=K(0x5e4a3c),ROCK2=K(0x74604e),WETC=K(0x5a4a38),TROD=K(0x8a7058),CR=K(0xe8e0d2),t=new THREE.Color();
 STAGE.paint=(F,c)=>{const n=nz(F.x,F.z,.02,2,71)-.5;c.copy(SOIL).lerp(SOIL2,clamp(.5+n*2,0,1));t.copy(ROCKC).lerp(ROCK2,clamp(.5+n*2.4,0,1));c.lerp(t,F.rock*.85);
  c.lerp(SAND,F.sand*.8);c.lerp(WETC,smooth(.55,.95,F.wet)*.75);c.lerp(TROD,F.trod*.6);c.lerp(CR,F.crust*.85);};
 STAGE.layers=[['ground.reg',F=>F.reg*(1-F.wet)],['ground.rock',F=>F.rock],['ground.gravel',F=>F.rock*(1-F.rock)*.8],['ground.dune',F=>F.sand],['ground.mud',F=>smooth(.6,.95,F.wet)*(1-F.crust)],
  ['ground.reedbed',F=>F.algal],['ground.crust',F=>F.crust],['ground.silt',F=>F.trod*.7]];
 STAGE.groundLabel='The spring hollow (gravel, blown sand, wet ground, trampled ground)';}
STAGE.views=function(gh,nearTree){const P=POOL,live=nearTree(0,P.x-60,P.z+40),tam=nearTree(1,P.x+80,P.z+200);
 const at=(T,d,a,h)=>T?[T.x+Math.cos(a)*d,gh(T.x+Math.cos(a)*d,T.z+Math.sin(a)*d)+h,T.z+Math.sin(a)*d,T.x,T.y0+T.H*.5,T.z]:null;
 return{
  'Stair\'s spring from the Hill\'s foot':[HILL.x0+80,gh(HILL.x0+80,P.z+60)+12,P.z+60,P.x,P.lv+2,P.z],
  'The pool and its reeds':viewAt(gh,P.x+48,P.z-40,9,P.x,P.z,0),
  'The caravans\' campground':viewAt(gh,CAMP.x+170,CAMP.z+170,6,CAMP.x,CAMP.z,1),
  'The tunnel\'s southern portal and the divers\' camp':viewAt(gh,PORTAL.x-110,PORTAL.z+60,5,PORTAL.x,PORTAL.z,5),
  'The Hill\'s slope (Stair\'s site, left empty)':viewAt(gh,-300,300,20,(HILL.x0+HILL.x1)/2,0,120),
  'Seeps and the salt crust':viewAt(gh,SEEP2.x+170,SEEP2.z+40,16,CRUST.x-40,CRUST.z,0),
  'From the west ridge':viewAt(gh,-1900,-200,8,0,200,0),
  'From afar':[-2800,1900,2600,200,1000,-200],
  'Tugai, a Euphrates poplar':at(live,22,2.2,2.5),
  'A salt cedar at the fringe':at(tam,12,.9,1.6)};};
