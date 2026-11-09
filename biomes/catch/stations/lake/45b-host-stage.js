// ================================================================= HOST — stage (the Catch, station 3: THE LAKE AND THE LAKE BEDS)
// WHERE (PLAN.md sections 3, 4, 7 and 10): the lowest point, px 763,1062 on the scale model (4.22: a terminal salt lake of
// 738 km2 at 318 m). The kit draws its north-western shore: the lake as shallow soda brine (the owner, 2026-10-26),
// pink at the margin where the brine is densest (salt-loving algae and archaea), teal over the deeper water, ochre in a
// bay where a dead channel's silt still comes in; the shore's crusts in bands as the brine dried back (algal mats at the
// water, soda crust, white efflorescence on the old bed, ochre salt polygons in a playa pan); the old lake's strandlines up
// the slope (core/terrain KBASIN: a lake from a wetter age, 362 m at its height). THE WIND-CARVED LAKE BEDS (the owner,
// 2026-10-23: not tuff): the old lake's silt above the crust cut by the wind into YARDANGS (KBASIN), and its harder beds
// left standing as CASTELLATED MESAS (core/terrain KSTACKS: Lop Nur's White Dragon Mounds), elongated with the wind.
// Two DEAD CHANNELS come down from the north with dead poplars and salt cedars on their nebkhas; saltbush and brine lamps
// on the crusts' margins. One of the three salt pans (4.22) is the playa in the south-west, dry (the owner).
// THE MAP (x east, z south, y up, real metres; R 3300): the lake south-east of a line from (3300,-300) to (-300,3000).
const TERR={R:3300};
const WIND=(function(){const w=[-.55,.83],l=Math.hypot(w[0],w[1]);return[w[0]/l,w[1]/l];})();
const LEVEL=318,SHORE_S=950;   /* the water's level; the shore where s = .6 x + .8 z passes this */
const sOf=(x,z)=>x*.6+z*.8+70*(nz(x,z,.0008,2,81)-.5)*2;
// the playa pan (dry): a flat in the south-west a few metres over the lake
const PAN={x:-1700,z:1100,r:650};
const panK=(x,z)=>smooth(1,.7,Math.hypot((x-PAN.x)/PAN.r,(z-PAN.z)/(PAN.r*.75))*(1+.1*(nz(x,z,.003,2,82)-.5)));
// THE DEAD CHANNELS: two courses from the north edge down to the shore
const CH=[z=>-900+260*Math.sin(z*.0011+.3)+.12*z,z=>1500+200*Math.sin(z*.0013+1.9)-.4*z];
const CH_Z1=[1300,-200];   /* where each reaches the shore */
const chD=(x,z)=>Math.min(...CH.map((f,i)=>z<CH_Z1[i]+150?Math.abs(x-f(z)):1e9));
// the land: the old lake's floor, a long slope down to the shore and a shallow shelf under the brine (2-3 m at most
// here); the pan's flat; the channels' beds
/* the shore band (the lowest 600 m up from the water) is steeper, ~1.7 degrees: there the recession's strandlines stand as
   benches a few tens of metres apart; above it the old floor flattens out */
function baseH(x,z){const s=sOf(x,z),u=Math.max(0,SHORE_S-s);let h=LEVEL+.009*u+.02*Math.min(u,600)+5*(nz(x,z,.0012,3,83)-.5)*smooth(100,500,u);
 if(s>SHORE_S)h=LEVEL+.4-clamp((s-SHORE_S)*.0035,0,2.8)+.4*(nz(x,z,.004,2,84)-.5);
 h=mix(h,LEVEL+2.2+.3*(nz(x,z,.01,2,85)-.5),panK(x,z));
 h-=2.2*smooth(22,3,chD(x,z));return h;}
// THE OLD LAKE (KBASIN): flood kind, 362 m at its height, its remnant today's lake; the recession's strandlines up the slope,
// silt on everything it covered, salt toward the water, the wind's yardangs in the dry silt
/* yardK: the wind-cut lake beds, the old floor north-west of the shore band; nearer the water the strandlines are left whole */
const yardK=(x,z)=>smooth(-150,-700,sOf(x,z)-SHORE_S+700);
const BASIN=KBASIN.create({seed:8101,wind:WIND,age:9000,recession:7000,strand:{a:.85,top:7,bottom:3},yardang:{h:14,len:340,gap:62},
 lakes:[{name:'the old lake (a wetter age, 362 m)',kind:'flood',level:362,remnant:LEVEL,member:(x,z)=>1}]});
/* the same lake with no yardangs (KBASIN draws its strands from the seed and the lake alone, so the two agree line for line) */
const BASIN_S=KBASIN.create({seed:8101,wind:WIND,age:9000,recession:7000,strand:{a:.85,top:7,bottom:3},yardang:{h:0,len:340,gap:62},
 lakes:[{name:'the old lake (a wetter age, 362 m)',kind:'flood',level:362,remnant:LEVEL,member:(x,z)=>1}]});
// THE CASTELLATED MESAS: the old lake's harder beds left standing in the north-west, elongated with the wind (KSTACKS)
const ROCK=(function(){const L=[],K=KSTACKS,ry=Math.atan2(WIND[1],WIND[0]);
 const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<24;i++){const a=i/24*TAU;for(const k of [.4,.8,1.2])m=Math.min(m,baseH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-2;};
 for(let k=0;k<26&&L.length<11;k++){const u=KRAND.unit(KRAND.hash(8102,k)),v=KRAND.unit(KRAND.hash(8102,k,1)),x=-2300+1700*u,z=-2400+1600*v;
  if(Math.hypot(x,z)>TERR.R*.88||L.some(B=>Math.hypot(B.x-x,B.z-z)<B.R+90))continue;
  const H=26+40*KRAND.unit(KRAND.hash(8102,k,2)),R=30+50*KRAND.unit(KRAND.hash(8102,k,3)),big=R>55;
  const B=K.make({id:'mound'+k,kind:big?'mesa':'butte',x,z,y0:footY(x,z,R*1.6),seed:8200+k,bed:[1.2,3.2],lobes:.28,weather:1,
   tiers:[{h:H*.62,r:R,e:2.4,ry},{h:H*.38,r:R*.72,e:2.2,ry:ry+.05,dx:WIND[0]*R*.15,dz:WIND[1]*R*.15}]});
  B.name=big?'A castellated mesa of old lake beds (the White Dragon Mounds: the wind took the rest)':'A butte of old lake beds, wind-cut';L.push(B);}
 return L;})();
const onRock=(x,z)=>!!KSTACKS.at(ROCK,x,z);
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const b=baseH(x,z),yk=yardK(x,z);let h=b>LEVEL-.2?(yk>0?mix(BASIN_S.land(x,z,b),BASIN.land(x,z,b),yk):BASIN_S.land(x,z,b)):b;_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function groundAll(x,z){const t=KSTACKS.topAt(ROCK,x,z);return Math.max(terrainH(x,z),t);}
function waterH(x,z){return sOf(x,z)>SHORE_S-60&&terrainH(x,z)<LEVEL?LEVEL:-1e9;}
const shoreD=(x,z)=>(sOf(x,z)-SHORE_S);   /* + into the water, - up the shore (m, about) */

// ---------------------------------------------------------------- the fields (FNAMES)
const BS={};
function fieldsAt(x,z,h,slope){const b=BASIN.sample(x,z,baseH(x,z),BS),sd=shoreD(x,z),cd=chD(x,z),pk=panK(x,z);
 const wet=clamp(Math.max(smooth(-60,10,sd)*.96,smooth(-450,-40,sd)*.45,smooth(200,15,cd)*.42,pk*.25),0,1)+.03;
 const algal=smooth(-60,-8,sd)*smooth(25,0,sd)*(1-pk);
 const soda=smooth(-650,-200,sd)*smooth(-20,-90,sd)*(1-pk)*(.7+.3*nz(x,z,.004,2,86));
 const ochre=pk*.95+smooth(.62,.75,nz(x,z,.0018,2,87))*smooth(-900,-300,sd)*smooth(-60,-200,sd)*.7;
 const crust=clamp(smooth(.5,.9,b.salt)*.85*(1-soda)*(1-ochre)*(1-algal),0,1);
 const rock=onRock(x,z)?1:clamp(smooth(.45,.8,slope),0,1);
 return{wet:clamp(wet,0,1),flow:smooth(160,12,cd),upland:0,rock,slope,salt:ochre,sand:clamp(smooth(150,30,cd)*.5*smooth(-200,-500,sd),0,1),
  reg:0,silt:b.silt*(1-soda)*(1-ochre),yard:b.yard*yardK(x,z),crust,bed:b.bed,strand:b.strand,dry:b.dry/1000,spring:0,trod:0,algal,soda,cold:0,
  canyon:0,rim:0,dune:1,oasis:0,abyss:0};}
// THE NEBKHAS along the channels (as station 1's)
const NEBKHAS=(function(){const N=[];CH.forEach((f,c)=>{for(let j=0;j<40;j++){const z=-3000+j*((CH_Z1[c]+3000)/40),h=KRAND.hash(8103,c,j);if(KRAND.unit(h)>.45)continue;
  const off=(KRAND.unit(KRAND.hash(8103,c,j,1))-.5)*220,x=f(z)+off;if(Math.abs(off)<25||Math.hypot(x,z)>TERR.R*.9)continue;{const f=KSTACKS.foot(ROCK,x,z);if(f&&f.d<20)continue;}
  N.push({x,z,r:5+8*KRAND.unit(KRAND.hash(8103,c,j,2)),h:1.8+3.5*KRAND.unit(KRAND.hash(8103,c,j,3))});}});return N;})();
const NEB_SPACE=KSPACE.create({cell:40});NEBKHAS.forEach(N=>NEB_SPACE.insert(N,N.x,N.z,N.r));
{const t0=terrainH;terrainH=function(x,z){let m=0;NEB_SPACE.some(x,z,0,N=>{const d=Math.hypot(x-N.x,z-N.z)/N.r;if(d<1){const v=N.h*Math.pow(1-d*d,1.3);if(v>m)m=v;}return false;});return t0(x,z)+m;};}
const SPINE=[[0,0],[600,700],[-200,1200],[1400,300],[-1500,-1500],[-900,-900],[PAN.x,PAN.z],[CH[0](-800),-800],[CH[1](-1400),-1400],[2000,-600],[300,2000]];
const BOUND=bindStage({R:TERR.R,N:440,terrainH:(x,z)=>terrainH(x,z),waterH,fieldsAt,seed:31,spine:SPINE,rockAt:(x,z)=>onRock(x,z)});
const FC=BOUND.FC,FIELD=BOUND.FIELD;

// ---------------------------------------------------------------- the lake on core/water: one open surface, the true bed, a tint field
const LAKE_BOX=[-1400,-1600,TERR.R*1.1,TERR.R*1.1];
const LAKE_TINT={box:LAKE_BOX,cell:16,at:(x,z)=>{const sd=shoreD(x,z);if(sd<-30)return null;
 const bay=smooth(.62,.8,nz(x,z,.0009,2,88))*smooth(900,200,chD(x,z)+150);
 const dep=LEVEL-terrainH(x,z),pink=smooth(.9,.15,dep),c=bay>.3?0xa87a3e:pink>.5?0xb85872:0x2e7a78;return{c,a:clamp(Math.max(pink,bay*.85,.45),0,1)};}};
const STAGE={
 key:'lake',name:'The Catch: the lake and the lake beds',title:'Krator biome — the Catch: the lake and the lake beds',seed:31,hour:16,
 hint:'The Catch, station 3: the terminal soda lake at the basin\'s lowest point (318 m): pink, teal and ochre brine, algal mats, soda crust, white efflorescence and a playa of ochre salt polygons, the old lake\'s strandlines, yardangs and castellated mesas of wind-cut lake beds, dead channels with their dead poplars, saltbush and brine lamps',
 site:{px:763,py:1062},air:{pressure:1.57,humidity:.2},clouds:{cover:.04},fogDensity:0.00015,fogH:{y0:316,H:45,k:.8},siteH:318,
 ridges:[
  {dist:200000,base:-1.81,amp:8.82,cycles:30,octaves:6,peaks:18,peakAmp:2.4,seed:61,rock:[0.41,0.36,0.32],hz:0.68},
  {dist:260000,base:1.7,amp:2.2,cycles:7,octaves:4,peaks:3,peakAmp:1.2,win:[322,24,1.6],floor:-1,seed:62,rock:[0.38,0.33,0.31],hz:0.64},
  {dist:60000,base:-1.96,amp:8.82,cycles:42,octaves:6,peaks:26,peakAmp:3,seed:63,rock:[0.48,0.40,0.33],snowH:4200,hz:0.48},
  {peaks:14,peakAmp:1.2,dist:18000,base:0.27,amp:2.8,cycles:34,octaves:5,win:[140,80,1.4],floor:-1,seed:64,rock:[0.67,0.53,0.39],hz:0.28}],
 spine:SPINE,nebkhas:NEBKHAS,expect:['saltbush','brinelamp','poplar','tamarisk'],
 bias:{broom:.5,salt:.3,reed:(x,z)=>smooth(260,60,chD(x,z)),poplar:(x,z)=>smooth(-250,-450,shoreD(x,z))},
 water:[{key:'lake',kind:'open',name:'The terminal lake (soda brine: the Catch\'s one great salt field)',
  open:{name:'The terminal lake',level:LEVEL,swell:[[.03,30,240,0,.03]],field:.06,bounds:LAKE_BOX,bed:(x,z)=>terrainH(x,z),bedBox:LAKE_BOX,bedCell:10,
   shore:{seeds:[[2800,2800]]},tint:LAKE_TINT},
  look:{renderOrder:1,roughness:.3,metalness:.02,envMapIntensity:.14,surf:false,breakers:false,ramp:[.2,3],shallow:0x6a9a92,deep:0x235e5c}}],
 sedQ:0,stalkers:[],exportBox:[-1200,-1200,-900,-900],
 registers:[{name:'The playa (a dry salt pan: ochre salt polygons ringed with white)',key:'landform.playa',x:PAN.x,z:PAN.z,y:LEVEL-2,r:PAN.r*.8,h:12},
  {name:'The yardang field (the old lake\'s silt, cut by the wind into ridges)',key:'landform.yardang',x:-600,z:-1200,y:LEVEL+20,r:700,h:60},
  {name:'The old lake\'s strandlines (each a pause in its fall)',key:'landform.strand',x:300,z:-300,y:LEVEL,r:600,h:50}]};
{const K=h=>new THREE.Color(h),SILT=K(0xa48e6c),SILT2=K(0x957f5e),CR=K(0xeee9de),SODA=K(0xe6cdb4),OCH=K(0xc89a58),ALG=K(0x6a8a7c),STR=K(0x6e5c44),SAND=K(0xcca476),t=new THREE.Color();
 STAGE.paint=(F,c)=>{const n=nz(F.x,F.z,.02,2,89)-.5;c.copy(SILT).lerp(SILT2,clamp(.5+n*2,0,1));c.lerp(STR,F.strand*.55);
  c.lerp(SAND,F.sand*.7);c.lerp(CR,F.crust*.85);c.lerp(SODA,F.soda*.9);c.lerp(OCH,F.salt*.85);c.lerp(ALG,F.algal*.9);};
 STAGE.layers=[['ground.silt',F=>F.silt*(1-F.crust)*(1-F.strand*.6)*.75],['ground.crust',F=>F.crust],['ground.soda',F=>F.soda],['ground.ochre',F=>F.salt],
  ['ground.algal',F=>F.algal],['ground.dune',F=>F.sand*.8],['ground.mud',F=>F.flow*.5*(1-F.sand)]];
 STAGE.groundLabel='The old lake\'s floor (silt, salt and soda crusts, algal mats)';}
STAGE.views=function(gh,nearTree){const dead=nearTree(0,CH[0](-600),-600,T=>!!T.dead),M=ROCK.slice().sort((a,b)=>b.top-a.top)[0];
 const at=(T,d,a,h)=>T?[T.x+Math.cos(a)*d,gh(T.x+Math.cos(a)*d,T.z+Math.sin(a)*d)+h,T.z+Math.sin(a)*d,T.x,T.y0+T.H*.5,T.z]:null;
 const sh=[400,-300+0];const sx=(SHORE_S-.8*600)/.6;
 const V={
  'The soda lake':[sx-250,gh(sx-250,600)+14,600,sx+900,LEVEL,1300],
  'Pink shallows and algal mats':viewAt(gh,sx-40,600,2.2,sx+60,640,0),
  'Soda crust':viewAt(gh,sx-420,520,2,sx-250,640,0),
  'The playa (ochre salt polygons)':viewAt(gh,PAN.x+500,PAN.z-300,3,PAN.x,PAN.z,0),
  'Yardangs':viewAt(gh,-200,-700,5,-800,-1300,2),
  'The castellated mesas (the White Dragon Mounds)':M?viewAt(gh,M.x+M.R*1.6,M.z+M.R*1.3,4,M.x,M.z,(M.top-M.y0)*.5):null,
  'The strandlines':viewAt(gh,1050,250,6,350,-450,4),
  'From afar':[-3000,800,-2600,800,320,900]};
 if(dead)V['A dead channel, its poplars dead standing']=at(dead,30,2.4,3);
 return V;};
