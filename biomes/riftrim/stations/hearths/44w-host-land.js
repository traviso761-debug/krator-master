// ================================================================= HOST — STATION 7, THE HEARTH FIELD (the N rim's shelf; biomes/hearths/PLAN.md sections 5, 6, 11 item 1)
// Scale model 5.1: the showcase vent of the rim's Hearth field, px 525,1400 (world 1050,2800 km; old canvas 253,1070): 3,737 m, 1.00 atm, 753 mm, Dsc, mean +2 degC
// (warmest month +14, coldest -10, night low -17), wind 9.4 m/s; a shelf at 3.5-3.7 km running 60 km north to the rim's crest, the trough's edge 12 km SOUTH
// (the ground falling from 3.4 km to the Rift's floor at -1.6 km within 30 km), the N rim's lakes east and west. Set in winter. The page compresses it into 6 km:
//   centre     THE FISSURE LINE (WSW-ENE, the rim's strike): four vents along it, each a KTHERM point vent, and round each a DISC of hearth trees (biomes/hearths,
//              read in place: HEARTH.layout) 110-300 m across; the ember mat on the vents' aprons, coal moss and stokers at the edges, the dead stalks in rings
//              outside where the heat was. Three HOT POOLS (WATER.spring) on the three larger vents' aprons, sinter round them, sulphur on the lips
//   north-west THE FROZEN LAKE in the glass forest (the N rim's frost frills and bell firs: this kit's own species), 1 km across
//   south      the shelf's shoulder: the ground beginning its fall toward the trough, the Rift's haze and the far wall in the far field
// THE HEAT (core/terrain 47, KTHERM, slotted 44t by station.json so the land's fields read it): the vents over the country's soil (-4 degC: the winter's
// ground under the snow; the annual mean is +2),
// baked once on a 4 m lattice. The ground's paint (45: geo), the KGROUND layers (off the warm ground), the snow (89b: ATMOS.snowBare), the flora's keep-off
// (LAND.keep: the glass forest off ground over 1-6 degC) and the field's placement all read this one bake.
const HVENTS=[
 {id:'old-hearth',kind:'point',x:0,z:0,T:96,reach:300,decay:2.2,name:'The Old Hearth\'s vent',pool:{dx:16,dz:-7,r:8,temp:.95,mineral:'sinter'}},
 {id:'west-hearth',kind:'point',x:-820,z:210,T:94,reach:230,decay:2.2,name:'The west hearth\'s vent',pool:{dx:-12,dz:9,r:6,temp:.8,mineral:'sulfur'}},
 {id:'east-hearth',kind:'point',x:720,z:-170,T:92,reach:170,decay:2.2,name:'The east hearth\'s vent',pool:{dx:10,dz:8,r:10,temp:.62,mineral:'iron'}},
 {id:'young-hearth',kind:'point',x:1330,z:-360,T:90,reach:115,decay:2.2,name:'The young hearth\'s vent'},
 /* the fissure between them: a warm seam a few metres wide, snow-free, the stokers' road */
 {id:'fissure',kind:'line',pts:[[-1080,280],[-940,262],[-820,210],[-560,176],[-300,128],[0,0],[260,-30],[480,-118],[720,-170],[1010,-226],[1330,-360],[1560,-420]],T:15,reach:20,decay:2,name:'The fissure line'}];   /* kinked: a crack, not a road */
const HSOIL=-4;
const THERM=KTHERM.create({soil:HSOIL,vents:HVENTS.map(v=>{const o=Object.assign({},v);delete o.pool;delete o.name;return o;}),detail:{amp:4,scale:.012,seed:7131},world:'riftrim-hearths'});
const THERM_BOX=[-1180,-560,1620,560],THERM_F=THERM.bake({box:THERM_BOX,cell:4});
const heatAt=(x,z)=>x>THERM_BOX[0]+4&&x<THERM_BOX[2]-4&&z>THERM_BOX[1]+4&&z<THERM_BOX[3]-4?KTHERM.fieldAt(THERM_F,x,z):HSOIL;
/* the disc's radius (the 25 degC contour) from the vent's record: share s = (T25 - soil)/(T - soil), q from the share's law */
const discR=v=>{const s=(25-HSOIL)/(v.T-HSOIL),e=Math.exp(-v.decay);return -Math.log(s*(1-e)+e)/v.decay*v.reach;};
const STATION=(function(){const R=3000,LC=[-1750,-1320,520];
 const base0=(x,z)=>3700-z*.035+34*(fbm(x*.0009,z*.0009,7141,3)-.5)+7*(fbm(x*.006,z*.006,7142,2)-.5)-smooth(1700,3000,z)*110;
 const LAKE=Math.round(base0(LC[0],LC[1])-16);
 const PITS=HVENTS.filter(v=>v.kind==='point');
 const POOLS=PITS.filter(v=>v.pool).map(v=>{const x=v.x+v.pool.dx,z=v.z+v.pool.dz;return Object.assign({x,z,vent:v.id,name:'The '+v.name.replace(/^The /,'').replace(/'s vent$/,'')+'\'s pool',level:+(base0(x,z)+.45).toFixed(2)},v.pool);});
 const fiss=HVENTS[4].pts;
 function ground(x,z){let h=base0(x,z);
  // the lake's basin in the glass forest
  {const d=blobD(x,z,LC[0],LC[1],LC[2],3);if(d<1.9){const inner=LAKE-Math.min(22,3+(1-d)*LC[2]*.06);h=d<1?Math.min(h,inner):mix(Math.min(h,LAKE-1.2+(d-1)*30),h,smooth(1,1.9,d));}}
  // the sinter apron built up round each vent (geyserite: a low shield), the vent's pit in it, the fissure a shallow crack between
  const t=heatAt(x,z);h+=1.1*smooth(55,85,t);
  for(const v of PITS){const d=Math.hypot(x-v.x,z-v.z);if(d<16)h-=2.4*smooth(9,2,d)-.5*smooth(4,9,d)*smooth(16,10,d);}
  {const n=nearLine(fiss,x,z);if(n.d<6)h-=.9*smooth(6,1,n.d);}
  // the pools in their hollows: the water's level a little over the ground's rim (they are drawn at the level, the bowl under it)
  for(const P of POOLS){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r*1.6)h=mix(Math.min(h,P.level-.25-1.6*Math.max(0,1-d*d/(P.r*P.r))),h,smooth(P.r*.95,P.r*1.6,d));}
  return h;}
 const L=rimLand({R,ground,
  lakes:[{name:'The frozen lake in the glass forest',kind:'frozen',level:LAKE,poly:discPolyL(LC[0],LC[1],LC[2]*1.2,48),inside:(x,z)=>blobD(x,z,LC[0],LC[1],LC[2],3)<1.02,area:.85}],
  pools:POOLS.map(P=>({x:P.x,z:P.z,r:P.r,level:P.level})),
  river:null,falls:[],
  tm:(x,z,h)=>2-6.5*(h-3737)/1000,
  wet:(x,z,h)=>.42+.1*fbm(x*.0016,z*.0016,7143,2),
  fog:(x,z,h)=>0,
  geo:(x,z,h)=>(heatAt(x,z)-HSOIL)/100,
  rockAt:(x,z,h,sl)=>smooth(.5,.8,sl),
  strataK:(x,z,h,sl)=>smooth(.5,.8,sl),
  snowAt:()=>0,   /* the winter's cover is the lying snow (89a, snowBase), not a barren field: the forest lives under it */
  strata:BIO.strata({recipe:'rift',seed:7144,range:[3000,4200],res:.5,private:true}),
  spine:[[0,0],[-150,95],[-820,210],[720,-170],[1330,-360],[-1500,-900],[-1750,-700],[200,2400],[0,-1500],[2200,600],[-2400,1200]]});
 Object.assign(L,{LC,LAKE,POOLS,PITS,fiss,base0});return L;})();
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=STATION.RIVER_SPEC,FALLS=STATION.FALLS,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}

const LAND={name:'The Hearth field (riftrim station 7)',title:'Krator biome — the rift rim: the Hearth field',
 hint:'Station 7 of the rift rim, the Hearths\' showcase on the N rim\'s shelf (3,737 m, Dsc, scale model 5.1 px 525,1400): four discs of hearth trees on a fissure line of vents, black fans that open flat to the night sky and fold into silver spindles by day, the ember mat on the vents\' aprons, hot pools, coal moss and stokers, rings of dead stalks where the heat was; the glass forest and a frozen lake beyond, the trough to the south. Winter. Opens at dusk: the fans open as the sun goes (#hour=12 for noon, the field shut and silver)',
 region:{name:'The Hearth field (station 7)',x:0,z:0,r:TERR.R},rim:'n',wind:[.7,-.7],arcade:false,fruitMin:0,hour:16.9,
 species:['frostfrill','bellfir'],exportBox:[-150,-150,150,150],exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],   /* the Old Hearth's disc and its boiling pool; no bucket: the hearths are items of their own registry and the glass forest is variants (the ice station's reason) */
 
 sky:{px:253,py:1070},atm:1.0,cloud:.08,dust:false,   /* the sky's frame: the old canvas (5.1 px less 272,330); a clear winter evening: the engine's weather */
 fog:{falloff:1/1300,sun:.35,sky:.3},climate:{cold:true,dry:false},wet:false,snowLine:[3300,3450],snowBase:.82,frozen:true,groundN:560,
 groundLayers:['needles','tundra','lenswort','lichen'],   /* four, not five: the snow's bare mask (89b, ATMOS.snowBare) is a texture unit of the ground's (15 is ANGLE's link limit on the Arc) */
 lakeLook:{deep:[0x2a4a5a,0x1a3440],shallow:0x8ab0c0},
 /* the glass forest keeps off the warm ground (the hearths' discs and their dead rings are theirs): none over 6 degC, thinning from 1; and the shelf along the
    fissure is open, wind-scoured fell under the snow (the vents' country): the forest stands back 450-1000 m from the line, round the lake and up the rim */
 geoAt:(x,z)=>(heatAt(x,z)-HSOIL)/100,   /* the painter's heat at full resolution (45; the field cache's 16 m cells drew the sinter apron as a square) */
 keep:(x,z)=>(1-smooth(1,6,heatAt(x,z)))*Math.max(smooth(450,1000,nearLine(STATION.fiss,x,z).d),smooth(2.4,1.3,blobD(x,z,STATION.LC[0],STATION.LC[1],STATION.LC[2],3))),
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dn=Math.max(0,-S0-z),ds=Math.max(0,z-S0);
  return g+dn*.06-ds*.02-smooth(7000,17000,ds)*4700+180*(fbm(x*.0008,z*.0008,7145,3)-.5)*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[-1200,1500,2600,3100,3350],   /* winter: snow on everything over 3.35 km past the map, the trough's shoulders below it bare */farLabel:'The N rim\'s shelf, its crest to the north and the trough past the map',
 views:H=>{const {P,look,atTree,nearTree,gh}=H,S=STATION,V=HVENTS[0],V2=HVENTS[1],LC=S.LC,P0=S.POOLS[0];
  const F=()=>(window._field&&window._field.trees)||[],nearH=(x,z,r)=>{let b=null,bd=1e9;for(const T of F()){const d=Math.abs(Math.hypot(T.x-x,T.z-z)-(r||0));if(d<bd){bd=d;b=T;}}return b;};
  return{
  'The Hearth field at dusk':()=>{const a=2.6,r=discR(V)+26,x=V.x+Math.cos(a)*r,z=V.z+Math.sin(a)*r;return[x,gh(x,z,1.7),z,V.x+30,gh(V.x+30,V.z-20,5),V.z-20];},
  'A hearth tree':()=>{const T=nearH(V.x+60,V.z+50,0)||{x:V.x+60,z:V.z+50,H:6};return[T.x+7,gh(T.x+7,T.z+5,2),T.z+5,T.x,gh(T.x,T.z,T.H*.85),T.z];},
  'The ember mat and the boiling pool':[P0.x-14,gh(P0.x-14,P0.z+18,3),P0.z+18,P0.x,P0.level,P0.z],
  'Dead stalks round the west hearth':()=>{const r=discR(V2)*1.35,x=V2.x+r*.3,z=V2.z+r;return[x,gh(x,z,2.2),z,V2.x,gh(V2.x,V2.z,3),V2.z];},
  'The fissure line from the air':[-1400,gh(-1400,700,260),700,700,gh(700,-170,0),-170],
  'The glass forest by the frozen lake':[LC[0]+LC[2]*1.05,S.LAKE+14,LC[1]+260,LC[0],S.LAKE+30,LC[1]-200],
  'South to the trough':[300,gh(300,2500,30),2500,600,gh(600,2950,-600),9000],
  'From afar':look(2700,2500,420,0,0,0)};},
 probes:{bed(){const P=STATION.POOLS[0];return[P.x,terrainH(P.x,P.z)+.1,P.z];},ice:null}};
