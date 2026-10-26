// ================================================================= HOST — stage (the Catch, station 1: THE SAND SEA)
// WHERE (PLAN.md section 10): the floor's core north of the interior hills, proposed px 800,1010 on the scale model, ~350 m,
// 18 mm of rain a year (4.22). A Taklamakan erg in small: LINEAR DUNES running with the wind (from the north-north-east,
// the dawn katabatics off the walls), three STAR DUNES where the winds cross, 110 to 160 m, a GRAVEL REG on the west
// (varnished black pavement), and in the south-east an OLD LAKE BED the dunes have stripped: its silt cut by the wind into
// YARDANGS (core/terrain KBASIN). A DEAD CHANNEL crosses from the north to the south-west, a river's course from a wetter
// century: its tugai poplars dead standing, a few still green where the water lingers, salt cedars on their sand cones
// (nebkhas) along it. A Stalker pair lies under the sand in a corridor a stage out from the channel (the kits/mechs bundle).
//
// THE MAP (x east, z south, y up, real metres above the sea; R 3300). The walls stand 60-260 km off on every side: the
// shared sky's ridges (89s-host-sky.js), from the survey's distances (PLAN.md section 1).
const TERR={R:3300};
const WIND=(function(){const w=[-.6,.8],l=Math.hypot(w[0],w[1]);return[w[0]/l,w[1]/l];})();   // toward the south-south-west
const ALONG=(x,z)=>x*WIND[0]+z*WIND[1],ACROSS=(x,z)=>-x*WIND[1]+z*WIND[0];
// THE DEAD CHANNEL: x of z, from the north edge to the south-west
const chanX=z=>-500+420*Math.sin(z*.00075+.4)+140*Math.sin(z*.0021+1.3)-.18*z;
const chanD=(x,z)=>Math.abs(x-chanX(z))*.96;
// where the water lingers along it (a seep under the old bed): the living tugai's two stretches
const SEEPS=[[chanX(-1400),-1400],[chanX(700),700]];
const seepK=(x,z)=>Math.max(...SEEPS.map(p=>smooth(420,90,Math.hypot(x-p[0],z-p[1]))));
// THE REG on the west, THE OLD LAKE BED in the south-east
const regK=(x,z)=>smooth(-1100,-1900,x+260*(nz(x,z,.0007,2,21)-.5)*2);
const BED={x:2100,z:1700,r:1500};
const bedK=(x,z)=>smooth(BED.r,BED.r*.55,Math.hypot((x-BED.x)*.9,(z-BED.z)*1.15)*(1+.12*(nz(x,z,.0015,2,23)-.5)));
// THE STAR DUNES: three, placed from core/rand in the sand's half of the map
const STARS=(function(){const S=[],C=[[700,-1300],[-250,350],[1150,-150]];
 C.forEach((c,k)=>{const h=KRAND.hash(4401,k),u=KRAND.unit(h),v=KRAND.unit(KRAND.hash(4401,k,1));
  S.push({x:c[0]+(u-.5)*300,z:c[1]+(v-.5)*300,H:110+50*KRAND.unit(KRAND.hash(4401,k,2)),r:640+120*u,arms:4+(h%2),a0:v*TAU,name:'A star dune'});});return S;})();
function starH(x,z){let m=0;for(const S of STARS){const dx=x-S.x,dz=z-S.z,d=Math.hypot(dx,dz)/S.r;if(d>=1.25)continue;
  const ang=Math.atan2(dz,dx);let arm=0;for(let k=0;k<S.arms;k++){const t=ang-S.a0-k*TAU/S.arms,dt=Math.atan2(Math.sin(t),Math.cos(t)),w=.11+.05*d;arm=Math.max(arm,Math.exp(-(dt*dt)/(w*w)));}
  const dome=Math.pow(Math.max(0,1-d),1.7),ridge=arm*Math.pow(Math.max(0,1-d/1.25),1.2)*.55;m=Math.max(m,S.H*Math.max(dome,ridge+dome*.6));}return m;}
// THE LINEAR DUNES: seif ridges along the wind, ~720 m apart, 30 to 70 m, their crests wandering
function linH(x,z){const al=ALONG(x,z),ac=ACROSS(x,z),ph=ac/720+.55*(nz(al,ac,.0005,2,31)-.5),u=ph-Math.floor(ph);
 const c=Math.pow(.5-.5*Math.cos(u*TAU),1.35),m=.45+.55*nz(al,ac,.0011,2,33);return 70*m*c;}
// the sand: off the reg and the bed, and kept off the dead channel's corridor (the river's ground)
const sandK=(x,z)=>(1-regK(x,z))*(1-bedK(x,z)*.85)*smooth(90,320,chanD(x,z));
const duneH=(x,z)=>{const k=sandK(x,z);return k<=0?0:k*Math.max(linH(x,z),starH(x,z))+k*1.4*(nz(x,z,.03,2,35)-.5);};
// THE NEBKHAS: sand cones under salt cedars, along the channel's corridor and in the corridors near water (core/rand)
const NEBKHAS=(function(){const N=[];for(let j=0;j<60;j++)for(let i=0;i<14;i++){const h=KRAND.hash(4402,i,j),u=KRAND.unit(h);
  const z=-3000+j*100+KRAND.unit(KRAND.hash(4402,i,j,1))*80,off=(i-6.5)*38+(KRAND.unit(KRAND.hash(4402,i,j,2))-.5)*30,x=chanX(z)+off;
  const d=Math.abs(off);if(d<30||d>300||Math.hypot(x,z)>TERR.R*.92)continue;const p=smooth(300,60,d)*.22+seepK(x,z)*.25;if(u>p)continue;
  N.push({x,z,r:6+9*KRAND.unit(KRAND.hash(4402,i,j,3)),h:2+4.5*KRAND.unit(KRAND.hash(4402,i,j,4))});}return N;})();
const NEB_SPACE=KSPACE.create({cell:40});NEBKHAS.forEach((N,k)=>NEB_SPACE.insert(N,N.x,N.z,N.r));
function nebH(x,z){let m=0;NEB_SPACE.some(x,z,0,N=>{const d=Math.hypot(x-N.x,z-N.z)/N.r;if(d<1){const v=N.h*Math.pow(1-d*d,1.3);if(v>m)m=v;}return false;});return m;}
// the land under the dunes: a floor at ~350 m falling gently to the south-east, the channel's shallow bed, the old lake's bowl
function baseH(x,z){let h=352-.003*x-.002*z+10*(nz(x,z,.0004,3,11)-.5);
 h-=3.2*smooth(26,4,chanD(x,z))+1.2*smooth(70,20,chanD(x,z));
 h-=14*bedK(x,z);return h;}
// THE OLD LAKE (core/terrain KBASIN): a lake from a wetter age, 352 m at its height, gone now; its silt cut into yardangs
const BASIN=KBASIN.create({seed:4403,wind:WIND,age:9000,recession:6000,strand:{a:.4},yardang:{h:22,len:420,gap:75},
 lakes:[{name:'the old lake (a wetter age)',kind:'flood',level:349,remnant:300,member:(x,z)=>smooth(.05,.35,bedK(x,z))}]});
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;let h=baseH(x,z);if(bedK(x,z)>0)h=BASIN.land(x,z,h);h+=duneH(x,z)+nebH(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
const groundAll=terrainH;
function waterH(x,z){return -1e9;}
const ROCK=[];

// ---------------------------------------------------------------- the fields (FNAMES, 45-host-scene.js)
const BS={};
function fieldsAt(x,z,h,slope){const b=BASIN.sample(x,z,baseH(x,z),BS),dh=duneH(x,z),cd=chanD(x,z),sk=sandK(x,z),nb=nebH(x,z);
 const sand=clamp(sk*(.3+.7*smooth(1.5,10,dh))+smooth(.3,1.5,nb),0,1);
 // the water table: dry everywhere but the channel's corridor (~.4: the dead), higher at the two seeps (the living)
 const wet=clamp(.04+.4*smooth(240,25,cd)+.22*seepK(x,z)*smooth(320,40,cd),0,1);
 return{wet,flow:smooth(160,15,cd),upland:0,rock:0,slope,salt:b.salt*.7,sand,reg:clamp(regK(x,z)*(1-sand)+.45*(1-sand)*(1-b.bed),0,1),
  silt:b.silt*(1-sand),yard:b.yard,crust:clamp(smooth(.3,.7,b.salt)*.8*(1-sand),0,1),bed:b.bed,strand:b.strand,dry:b.dry/1000,
  spring:0,trod:0,algal:0,soda:0,cold:0,canyon:0,rim:0,dune:1,oasis:0,abyss:0};}
// the LOD spine: the views' places
const SPINE=[[0,0],...STARS.map(S=>[S.x+S.r*.5,S.z+S.r*.6]),[chanX(-1400),-1400],[chanX(-400),-400],[chanX(700),700],[chanX(1700),1700],[-2100,-300],[BED.x-500,BED.z-500],[BED.x-900,BED.z-100]];
const BOUND=bindStage({R:TERR.R,N:440,terrainH,waterH,fieldsAt,seed:23,spine:SPINE});
const FC=BOUND.FC,FIELD=BOUND.FIELD;
for(const N of NEBKHAS)N.y=terrainH(N.x,N.z);

// ---------------------------------------------------------------- the station's say: STAGE (88, 89s, 89w, 99 read it)
// the Stalkers' corridor: between two linear dunes ~500 m east of the channel at z ~ -200
const STALK_C=(function(){let best=null,bh=1e9;for(let k=0;k<40;k++){const z=-500+k*15,x=chanX(z)+460+((k*37)%60);const h=duneH(x,z);if(h<bh){bh=h;best=[x,z];}}return best;})();
const STAGE={
 key:'sand',name:'The Catch: the sand sea',title:'Krator biome — the Catch: the sand sea',seed:23,
 hint:'The Catch, station 1: the sand sea on the sealed basin\'s floor (~350 m, 18 mm of rain): linear and star dunes, the gravel reg, yardangs on an old lake bed, a dead channel with its tugai dead standing, salt cedars on their sand cones, and something under the sand',
 site:{px:800,py:1010},air:{pressure:1.56,humidity:.12},clouds:{cover:.04},fogDensity:0.00016,fogH:{y0:335,H:70,k:.85},siteH:350,   /* the haze thick enough that each dune ridge back is paler than the one before it (the owner, 2026-10-26: depth between near and far dunes) */
 // the walls on every horizon (PLAN.md section 1): far crests 12-17 km, bare above the air, the Godthrone's mass north-west;
 // the inner walls 3-6 km nearer, their snowfields; the interior hills low in the south
 ridges:[
  {dist:240000,base:-1.81,amp:8.82,cycles:30,octaves:6,peaks:18,peakAmp:2.4,seed:41,rock:[.46,.38,.32],hz:0.7},
  {dist:300000,base:3.6,amp:1.2,cycles:7,octaves:4,peaks:3,peakAmp:.6,win:[305,24,1.6],floor:-1,seed:42,rock:[.33,.29,.27],hz:0.66},   /* the Godthrone's mass, north-west */
  {dist:70000,base:-1.96,amp:8.82,cycles:42,octaves:6,peaks:26,peakAmp:3,seed:43,rock:[.5,.4,.32],snowH:4300,hz:0.5},
  {peaks:14,peakAmp:1.2,dist:22000,base:.1,amp:1.3,cycles:34,octaves:5,win:[185,70,1.5],floor:-1,seed:44,rock:[.62,.48,.34],hz:0.3}],
 spine:SPINE,nebkhas:NEBKHAS,bias:{},expect:['poplar','tamarisk','broom'],hour:15.5,
 water:[],                                    /* the sand sea has none: the channel's water is underground */
 sedQ:0,                                      /* no sedesert flora: no oasis here */
 stalkers:[{kind:'st_harpooner',x:STALK_C[0]+28,z:STALK_C[1]-40,bury:.38,yaw:2.4},{kind:'st_blade',x:STALK_C[0]-6,z:STALK_C[1]+12,bury:.45,yaw:.6}],
 registers:[
  ...STARS.map(S=>({name:'A star dune ('+Math.round(S.H)+' m: the winds cross here)',key:'landform.dune.star',x:S.x,z:S.z,y:baseH(S.x,S.z),r:S.r*.8,h:S.H})),
  {name:'The gravel reg (desert pavement, varnished black)',key:'landform.reg',x:-2500,z:0,y:330,r:700,h:60},
  {name:'The old lake bed, its silt cut into yardangs by the wind',key:'landform.yardang',x:BED.x-300,z:BED.z-300,y:300,r:900,h:80},
  {name:'The dead channel (a river\'s course from a wetter century)',key:'landform.channel',x:chanX(0),z:0,y:320,r:400,h:60}],
};
// THE GROUND (45c-host-ground.js): the painted colour by field, and the library's layers over it
{const K=h=>new THREE.Color(h),SAND=K(0xd4a872),SAND2=K(0xc89860),REG=K(0x5e4c3e),REG2=K(0x7a6450),SILT=K(0xcfc1a0),CRUST=K(0xeae4d8),BEDC=K(0xb8a888),t=new THREE.Color();
 STAGE.paint=(F,c)=>{const n=nz(F.x,F.z,.02,2,51)-.5;c.copy(SAND).lerp(SAND2,clamp(.5+n*2,0,1));
  t.copy(REG).lerp(REG2,clamp(.5+n*2.4,0,1));c.lerp(t,smooth(.2,.7,F.reg)*(1-F.sand));
  c.lerp(BEDC,F.flow*(1-F.sand)*.6);c.lerp(SILT,smooth(.1,.5,F.silt)*(1-F.sand)*.9);c.lerp(CRUST,smooth(.2,.7,F.crust)*.8);};
 STAGE.layers=[['ground.dune',F=>F.sand],['ground.reg',F=>F.reg*(1-F.sand)],['ground.silt',F=>F.silt*(1-F.crust)*(1-F.sand)],
  ['ground.crust',F=>F.crust*(1-F.sand)],['ground.gravel',F=>F.flow*(1-F.sand)*(1-F.reg)*.8]];
 STAGE.groundLabel='The sand sea (dune sand, gravel reg, old lake silt)';}
// THE PRESET VIEWS (99 frames them once the kit has built: a tree view finds its nearest tree)
STAGE.views=function(gh,nearTree){const S0=STARS[0],S1=STARS[1],cz=STALK_C;
 const live=nearTree(0,SEEPS[0][0],SEEPS[0][1],T=>!T.dead),dead=nearTree(0,chanX(-300),-300,T=>!!T.dead),neb=nearTree(1,chanX(700)+80,700);
 const at=(T,d,a,h)=>T?[T.x+Math.cos(a)*d,gh(T.x+Math.cos(a)*d,T.z+Math.sin(a)*d)+h,T.z+Math.sin(a)*d,T.x,T.y0+T.H*.5,T.z]:null;
 const V={
  'The sand sea from a star dune':[S0.x+S0.r*.05,gh(S0.x+S0.r*.05,S0.z+S0.r*.05)+4,S0.z+S0.r*.05,S0.x-1800,330,S0.z+1800],
  'The linear dunes (with the wind)':viewAt(gh,S1.x-900,S1.z-1300,30,S1.x+200,S1.z+400,10),
  'A star dune\'s arms':viewAt(gh,S1.x+S1.r*1.4,S1.z+S1.r*.9,25,S1.x,S1.z,S1.H*.6),
  'The gravel reg':viewAt(gh,-2300,250,2.2,-1500,-500,1),
  'Yardangs on the old lake bed':viewAt(gh,BED.x-1100,BED.z-900,18,BED.x-200,BED.z-100,2),
  'Something under the sand':viewAt(gh,cz[0]-4,cz[1]+22,2.2,cz[0]+14,cz[1]-14,.6),
  'From afar':[-3000,700,2600,400,350,-600]};
 if(live)V['Tugai at a seep (Euphrates poplars)']=at(live,26,1.1,3);
 if(dead)V['The dead channel, its poplars dead standing']=at(dead,34,2.6,4);
 if(neb)V['Salt cedars on their sand cones (nebkhas)']=at(neb,24,.4,3);
 return V;};
