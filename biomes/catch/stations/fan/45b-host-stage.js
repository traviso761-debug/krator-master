// ================================================================= HOST — stage (the Catch, station 4: THE NORTH FAN AND THE WALLS)
// WHERE (PLAN.md sections 4, 5 and 10): the way in. The crossing comes down from the 6.2 km notch on the Bowl's side (px
// 726,896) by a gorge, and the gorge spills a GRAVEL FAN tens of kilometres long onto the floor; this page is the fan's
// lower reach and its toe, proposed px 738,944, ~1,400 m. The mountain front stands on the north (the inner wall's foot),
// the gorge's mouth cut into it; BRAIDED DRY CHANNELS spread down the fan from the mouth, the water of the walls' snowmelt
// sinking into the gravel; at the fan's toe it surfaces again as THE FIRST OASIS, Kolli ("the cold one", PLAN.md section
// 8): a seep, a cold little pool, reeds, a few poplars and salt cedars. Nothing else grows on the fan but a dune shrub in a
// sand pocket. The walls close on the north and the west, snow on their shoulders, bare rock above the air; the Godthrone's
// mass north-west.
// THE MAP (x east, z south, y up, real metres; R 3300): the fan's apex at the gorge mouth (APEX), its toe in the south.
const TERR={R:3300};
const WIND=(function(){const w=[.15,1],l=Math.hypot(w[0],w[1]);return[w[0]/l,w[1]/l];})();   /* the katabatic down the fan */
const APEX={x:-400,z:-2650,h:1880};
const FRONT_Z=x=>-2550+180*Math.sin(x*.0011+.7)+90*(nz(x,0,.003,2,91)-.5)*2;   /* the mountain front's foot */
const fanR=(x,z)=>Math.hypot(x-APEX.x,(z-APEX.z)*.9);
const fanA=(x,z)=>Math.atan2(x-APEX.x,z-APEX.z);   /* the radial direction from the apex */
// THE GORGE: from the apex north, cut into the front
const gorgeD=(x,z)=>Math.abs(x-(APEX.x+60*Math.sin(z*.004)))+Math.max(0,z-APEX.z)*.7;
// the fan: a cone falling from the apex (concave: steep near the mouth, flattening toward the toe), braided channels along
// its radii; the mountain front rising steeply behind it; the gorge's walls either side of the mouth
function fanH(x,z){const r=fanR(x,z);let h=APEX.h-420*(1-Math.exp(-r/1400))-.06*r;
 const a=fanA(x,z),br=ridgeN(a*40+nz(x,z,.002,2,92)*3,r*.004,1,2,93);h-=3*smooth(.72,.95,br)*smooth(200,900,r);
 h+=2.5*(nz(x,z,.006,2,94)-.5);return h;}
function landH(x,z){let h=fanH(x,z);const fz=FRONT_Z(x),up=smooth(fz+40,fz-500,z);
 const mtn=h+up*(1500*smooth(fz,fz-2600,z)+200*ridgeN(x,z,.0012,3,95)+120*(nz(x,z,.004,3,96)-.5));
 const g=smooth(90,30,gorgeD(x,z))*smooth(APEX.z+100,APEX.z-200,z);h=mix(mtn,h+(APEX.z-z)*.08,g);return h;}
// KOLLI, the first oasis, at the fan's toe: a seep's pool and its runnel, the water from under the gravel
const SEEP={x:350,z:2050};
const POOL=makePool({x:SEEP.x,z:SEEP.z,r:20,land:landH,name:'Kolli, "the cold one" (the first oasis: snowmelt seeping out at the fan\'s toe)',deep:1.2,
 gradient:{centre:0x285e66,rim:0x6a8a70,power:1.3}});
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=POOL.carve(landH(x,z),x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){return POOL.contains(x,z)?POOL.lv:-1e9;}
const ROCK=[],groundAll=terrainH;
const poolD=(x,z)=>POOL.d(x,z)-POOL.r;
// a few sand pockets in the lee of the fan's bars (blown down the fan)
const sandK=(x,z)=>smooth(.62,.75,nz(x,z,.0025,2,97))*smooth(800,2200,fanR(x,z));

// ---------------------------------------------------------------- the fields (FNAMES)
function fieldsAt(x,z,h,slope){const r=fanR(x,z),fz=FRONT_Z(x),pd=poolD(x,z),a=fanA(x,z);
 const br=ridgeN(a*40+nz(x,z,.002,2,92)*3,r*.004,1,2,93);
 const mtn=smooth(fz+20,fz-200,z),rock=clamp(Math.max(mtn*(.5+.5*smooth(.2,.5,slope)),smooth(.5,.8,slope)),0,1);
 const wet=clamp(Math.max(smooth(260,0,pd)*.97,smooth(.8,.95,br)*smooth(1000,2500,r)*.15)+.03,0,1);
 const sand=sandK(x,z)*(1-rock)*(1-smooth(80,10,pd));
 return{wet,flow:smooth(.78,.95,br)*smooth(200,800,r),upland:clamp((h-1300)/1200,0,1),rock,slope,salt:0,sand,reg:clamp((1-rock)*(1-sand)*(1-smooth(60,5,pd)),0,1),
  silt:0,yard:0,crust:smooth(120,40,pd)*smooth(10,40,pd)*.35,bed:0,strand:0,dry:0,spring:smooth(40,0,pd),trod:smooth(30,14,Math.hypot(x-SEEP.x+40,z-SEEP.z+30))*.8,
  algal:smooth(10,1,pd)*.5,soda:0,cold:clamp((h-1400)/2000,0,1),canyon:0,rim:0,dune:1,oasis:0,abyss:0};}
const SPINE=[[SEEP.x,SEEP.z],[SEEP.x-300,SEEP.z-200],[0,1200],[-300,0],[-400,-1200],[APEX.x,APEX.z+300],[1500,400],[-1700,600],[200,-2000]];
const BOUND=bindStage({R:TERR.R,N:420,terrainH,waterH,fieldsAt,seed:37,spine:SPINE,keep:(x,z)=>smooth(30,14,Math.hypot(x-SEEP.x+40,z-SEEP.z+30))});
const FC=BOUND.FC,FIELD=BOUND.FIELD;
fireRing(SEEP.x-40,SEEP.z-30,'A caravan\'s fire ring at Kolli (the first night down from the notch)',0);

const STAGE={
 key:'fan',name:'The Catch: the north fan and the walls',title:'Krator biome — the Catch: the north fan and the walls',seed:37,hour:13,
 hint:'The Catch, station 4: the way in, the gravel fan under the 6.2 km notch (~1,400 m at its toe): braided dry channels down from the gorge\'s mouth, the mountain front, the walls\' snowfields and the bare crests above the air, the Godthrone north-west, and Kolli, the first oasis, a cold seep at the fan\'s toe',
 site:{px:738,py:944},air:{pressure:1.38,humidity:.15},clouds:{cover:.06},fogDensity:.00008,siteH:1400,
 // the walls are close here: the notch's shoulders 40 km north, the inner wall's flank on the west
 ridges:[
  {dist:120000,base:2.3,amp:4.3,cycles:9,octaves:5,peaks:8,peakAmp:2,seed:71,rock:[0.39,0.34,0.32],haze:0.018},
  {dist:200000,base:2.2,amp:2.8,cycles:6,octaves:4,peaks:3,peakAmp:1.6,win:[300,30,1.4],floor:-1,seed:72,rock:[0.37,0.32,0.31],haze:0.015},
  {dist:35000,base:2.5,amp:7.2,cycles:12,octaves:5,peaks:10,peakAmp:1.6,win:[330,95,.8],floor:.4,seed:73,rock:[0.46,0.39,0.34],snowH:3000,haze:0.042},
  {dist:9000,base:0.23,amp:2.5,cycles:14,octaves:4,win:[150,90,1.2],floor:-.2,seed:74,rock:[0.63,0.52,0.41],haze:0.12}],
 spine:SPINE,nebkhas:[],expect:['poplar','tamarisk','reed','broom'],
 bias:{poplar:(x,z)=>smooth(300,60,poolD(x,z))*2,tamarisk:(x,z)=>smooth(320,40,poolD(x,z))*1.5},
 water:[{key:'kolli',kind:'still',rec:POOL.rec,name:POOL.name,look:{color:0x2a6a70,roughness:.06,metalness:.05,envMapIntensity:.5,renderOrder:1}}],
 sedQ:0,stalkers:[],exportBox:[SEEP.x-150,SEEP.z-150,SEEP.x+150,SEEP.z+150],
 registers:[{name:'The north fan (gravel spilled from the gorge, braided dry channels)',key:'landform.fan',x:-200,z:0,y:1300,r:1200,h:400},
  {name:'The gorge\'s mouth (the crossing\'s way down from the 6.2 km notch)',key:'landform.gorge',x:APEX.x,z:APEX.z,y:APEX.h-60,r:220,h:400}]};
{const K=h=>new THREE.Color(h),GR=K(0x5e5044),GR2=K(0x6e5e4e),CHN=K(0xa89884),ROCKC=K(0x5a4e46),ROCK2=K(0x6e6056),SAND=K(0xc8a070),WETC=K(0x4e4434),t=new THREE.Color();
 STAGE.paint=(F,c)=>{const n=nz(F.x,F.z,.02,2,98)-.5;c.copy(GR).lerp(GR2,clamp(.5+n*2,0,1));c.lerp(CHN,F.flow*.9);t.copy(ROCKC).lerp(ROCK2,clamp(.5+n*2.4,0,1));c.lerp(t,F.rock*.9);
  c.lerp(SAND,F.sand*.8);c.lerp(WETC,smooth(.55,.95,F.wet)*.75);};
 STAGE.layers=[['ground.gravel',F=>F.reg*(1-F.flow)+F.rock*.4],['ground.reg',F=>F.flow*.8],['ground.silt',F=>F.rock*.6],['ground.dune',F=>F.sand],
  ['ground.mud',F=>smooth(.6,.95,F.wet)],['ground.reedbed',F=>F.algal],['ground.crust',F=>F.crust]];
 STAGE.groundLabel='The north fan (gravel and braided channels)';}
STAGE.views=function(gh,nearTree){const P=POOL,pop=nearTree(0,P.x,P.z);
 const at=(T,d,a,h)=>T?[T.x+Math.cos(a)*d,gh(T.x+Math.cos(a)*d,T.z+Math.sin(a)*d)+h,T.z+Math.sin(a)*d,T.x,T.y0+T.H*.5,T.z]:null;
 return{
  'Kolli, the first oasis':viewAt(gh,P.x-60,P.z+70,4,P.x,P.z,1),
  'Up the fan to the gorge\'s mouth':viewAt(gh,-300,800,6,APEX.x,APEX.z,60),
  'The braided channels':viewAt(gh,-900,-300,25,-300,600,0),
  'The walls on the north':viewAt(gh,200,1500,8,-200,-3200,400),
  'The gorge\'s mouth':viewAt(gh,APEX.x+250,APEX.z+600,10,APEX.x,APEX.z-100,40),
  'From the mountain front':viewAt(gh,900,-2700,30,200,1500,0),
  'From afar':[2800,1900,2900,-300,1500,-500],
  'A poplar at the seep':at(pop,18,2.6,2)};};
