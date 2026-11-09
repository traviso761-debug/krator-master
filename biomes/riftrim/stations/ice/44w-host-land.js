// ================================================================= HOST — STATION 3, the cold lake (the S rim, the black rim)
// Scale model 5.1: the S rim's coldest lake, 688 km² at 4,477 m (px 706,1645, world 1412,3290 km), frozen most of the year; its shore ET,
// ~230 mm, -6.1 degC, 0.92 atm at the water; the trough's floor ~3.5 km below past the rim to the north. The page compresses it into 6 km:
//   middle     THE COLD LAKE, ice most of the year (WATER.ice: black ice cracked in big polygons, snow drifts), melting at its edge
//   round it   THE ALPINE: lantern lobelias standing over carpets of sun rosettes, cushion anemones and sailwort; rimroot in the hollows;
//              boulder fields in iris lichen; snowblood on the snow patches
//   south-east A GLACIER coming down off the high rim (to ~5.4 km on the page), its moraines damming the lake (the boulder fields)
//   north      THE RIM'S EDGE, the trough falling away into the far field
const STATION=(function(){const R=3000,LAKE=4477;
 const LC=[-300,200,1150];                                                  /* the lake: x, z, r */
 const glZ=x=>-200+220*Math.sin(x*.0007+.8),GLX=1100;                     /* the glacier's line (from the east), its snout's x */
 const ridge=(x,z,f,s)=>1-Math.abs(2*fbm(x*f,z*f,s,2)-1);
 const base=(x,z)=>{const d=blobD(x,z,LC[0],LC[1],LC[2],4);return LAKE+Math.max(0,d-1)*LC[2]*.09+smooth(800,3000,x)*720+smooth(1200,3000,z)*260
  +140*(ridge(x,z,.0013,51)-.5)*smooth(1,1.6,d)+12*(fbm(x*.012,z*.012,52,2)-.5)-smooth(-2000,-3200,z)*smooth(1.2,2.2,d)*700;};
 const iceK=(x,z)=>{const d=Math.abs(z-glZ(x)),w=240+120*smooth(GLX,3000,x);return smooth(w*1.05,w*.9,d)*smooth(GLX-40,GLX+80,x);};
 const moraineK=(x,z)=>{const d=Math.abs(z-glZ(x)),w=240+120*smooth(GLX,3000,x);return Math.max(smooth(.9,1.05,d/w)*smooth(1.4,1.12,d/w)*smooth(GLX-200,GLX+200,x),
  smooth(w*1.3,w*1.05,Math.hypot(x-GLX+60,(z-glZ(x))*.8))*smooth(w*.7,w*.95,Math.hypot(x-GLX+60,(z-glZ(x))*.8))*smooth(GLX+60,GLX-120,x));};
 function ground(x,z){let h=base(x,z);const d=blobD(x,z,LC[0],LC[1],LC[2],4);
  if(d<1.05)h=Math.min(h,LAKE-3-Math.min(45,(1.05-d)*LC[2]*.08));else if(d<1.25)h=mix(LAKE-1,h,smooth(1.05,1.25,d));
  const ik=iceK(x,z);if(ik>0)h=Math.max(h,mix(h,h+55*smooth(GLX,GLX+900,x),ik));
  h+=16*moraineK(x,z)*(.75+.5*fbm(x*.01,z*.01,53,2));
  return h;}
 const L=rimLand({R,ground,
  lakes:[{name:'The cold lake',kind:'frozen',level:LAKE,poly:discPolyL(LC[0],LC[1],LC[2]*1.3,48),area:688}],
  tm:(x,z,h)=>-6.1-6.5*(h-LAKE)/1000,
  wet:(x,z,h)=>.22+.1*fbm(x*.0016,z*.0016,139,2)+.15*iceK(x,z),
  ice:(x,z)=>iceK(x,z),
  barren:(x,z,h)=>smooth(5350,5500,h),
  rockAt:(x,z,h,sl)=>Math.max(smooth(.5,.8,sl),moraineK(x,z)*.75),
  talus:(x,z)=>moraineK(x,z),
  strataK:(x,z,h,sl)=>smooth(.55,.85,sl)*.6,
  snowAt:(x,z,h,sl)=>smooth(4700,4950,h)*smooth(.7,.35,sl)*smooth(.38,.55,fbm(x*.004,z*.004,134,2)),
  polyg:(x,z,F)=>smooth(.6,.7,F.cold)*smooth(.14,.05,F.slope)*(1-F.rock)*(1-F.ice),
  strata:BIO.strata({recipe:'rift-volcanic',seed:6803,range:[3800,5800],res:.5,private:true}),
  spine:[[LC[0]+LC[2]*1.15,LC[1]],[LC[0],LC[1]-LC[2]*1.2],[LC[0]-LC[2]*1.2,LC[1]+300],[LC[0]+200,LC[1]+LC[2]*1.2],[GLX+300,glZ(GLX+300)],[GLX-150,glZ(GLX-150)+300],[1800,1400],[-2200,-1800],[2400,-1600]]});
 Object.assign(L,{LC,LAKE,glZ,GLX,iceK,moraineK});return L;})();
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=STATION.RIVER_SPEC,FALLS=STATION.FALLS,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The cold lake (riftrim station 3)',title:'Krator biome — the rift rim: the cold lake',
 hint:'Station 3 of the rift rim, the black rim (the S rim): the 4,477 m lake frozen most of the year, lantern lobelias and cushion anemones on the alpine, a glacier and its moraines above it, the trough falling away to the north (scale model 5.1, px 706,1645)',
 region:{name:'The cold lake (station 3)',x:0,z:0,r:TERR.R},rim:'s',wind:[.9,.4],arcade:false,fruitMin:0,
 species:['lanternlobelia'],exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],   /* no bucket here to export: the one own tree (the lantern lobelia) is drawn as variants, and the borrowed trees' buckets are their vendors' registries, which the export does not read for this kit (checked 2026-11-03) */
sky:{px:434,py:1315},atm:.92,cloud:.2,dust:false,   /* the sky's frame: the old canvas (5.1 px less 272,330) */
 fog:{falloff:1/1400,sun:.4,sky:.25},climate:{cold:true,dry:true},wet:false,snowLine:[4700,4950],snowBase:0,frozen:true,groundN:540,
 groundLayers:['black','lichen','iris','snowalgae','clad'],
 talusPalette:[0x3e3a3c,0x4e4846,0x5e5450,0x2e2c30,0x6a5a52],talusMatrix:0x46403e,
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dn=Math.max(0,-S0-z),de=Math.max(0,x-S0),ds=Math.max(0,z-S0);
  return g-dn*.7*smooth(0,6000,dn)*1.4+de*.18+ds*.12+180*(fbm(x*.0008,z*.0008,412,3)-.5)*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[0,1500,3200,4600,5300],farLabel:'The S rim and the trough past the map',
 kin:[
  {ref:'rift.groundsel',key:'groundsel',name:'Giant groundsel',cell:44,minR:2,accept:Z=>Z.alpine*.12*Z.gentle*smooth(.5,.7,Z.wet+.3)},
  {ref:'rift.pine',key:'pine',name:'Peak pine (krummholz)',cell:50,minR:2,scale:{H:.35,rb:.6,crownR:.55},accept:Z=>Z.alpine*.05*smooth(.78,.7,Z.cold)}],
 views:H=>{const {P,look,atTree,nearTree,gh}=H,S=STATION,LC=S.LC;
  return{
  'The cold lake':[LC[0]+LC[2]*1.35,gh(LC[0]+LC[2]*1.35,LC[1]+200,6),LC[1]+200,LC[0],S.LAKE+40,LC[1]-200],
  'A lantern lobelia over the barrens':atTree(nearTree('lanternlobelia',P.alpine[0],P.alpine[1]),9,2.4,1.4),
  'Lantern lobelias at dusk':atTree(nearTree('lanternlobelia',P.alpine[0],P.alpine[1]),40,1.0,4),
  'Sun rosettes and cushion anemones':look(P.alpine[0]-6,P.alpine[1]+5,1.4,P.alpine[0]+6,P.alpine[1]-4,0),
  'Iris lichen on the moraine':look(S.GLX-260,S.glZ(S.GLX-260)+330,3,S.GLX-120,S.glZ(S.GLX-120)+250,0),
  'The glacier':[S.GLX-500,gh(S.GLX-500,S.glZ(S.GLX-500)+420,40),S.glZ(S.GLX-500)+420,S.GLX+700,gh(S.GLX+700,S.glZ(S.GLX+700),20),S.glZ(S.GLX+700)],
  'The trough from the rim':look(-600,-2500,30,-600,-6000,-1800),
  'From afar':look(2800,2800,500,-300,0,100)};},
 probes:{ice(){const x=STATION.GLX+900;return[x,STATION.glZ(x)];}}};
