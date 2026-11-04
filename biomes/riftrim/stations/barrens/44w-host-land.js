// ================================================================= HOST — STATION 6, the black barrens (the S rim, the black rim)
// Scale model 5.1: a high plateau of the S rim at px 521,1567 (world 1042,3134 km): 4,774 m, ET, 173 mm (the rim's driest high ground), -4 degC
// (9/-17), 0.88 atm; 4.2 km down to the Rift's floor within 20 km, the trough's edge beside it (east). The page compresses it into 6 km:
//   west and middle  THE PLATEAU: sun rosettes all facing one way, cushion anemones, rimroot in the hollows, prism heath (rust-magenta),
//                    reindeer lichen, boulder fields in iris lichen, snow patches red and violet with snowblood; lantern lobelias standing over it
//   north-west       A SLOPE OF SAILWORT swinging in the wind, a low rise off the plateau
//   east             THE TROUGH'S EDGE: the plateau breaking off in cliffs and falling away, the Rift's floor in the far field
const STATION=(function(){const R=3000,PL=4774,EDGE=2000;
 const ex=z=>EDGE+180*Math.sin(z*.0011+.4)+70*Math.sin(z*.0039);
 const ridge=(x,z,f,s)=>1-Math.abs(2*fbm(x*f,z*f,s,2)-1);
 function ground(x,z){let h=PL+30*(fbm(x*.0016,z*.0016,81,2)-.5)+18*(ridge(x,z,.004,82)-.5)+6*(fbm(x*.02,z*.02,83,2)-.5);
  h+=smooth(-400,-2600,z)*smooth(400,-2400,x)*260;                         /* the sailwort's rise in the north-west */
  h-=30*smooth(.55,.7,fbm(x*.0025,z*.0025,84,2));                          /* the hollows (snow lies in them; rimroot shelters there) */
  const e=x-ex(z);if(e>-60)h-=smooth(-60,700,e)*1300+Math.max(0,e-700)*.9;   /* the edge: the plateau breaking off into the trough */
  return h;}
 const L=rimLand({R,ground,
  tm:(x,z,h)=>-4-6.5*(h-PL)/1000,
  wet:(x,z,h)=>.12+.08*fbm(x*.0016,z*.0016,139,2)+.2*smooth(.55,.7,fbm(x*.0025,z*.0025,84,2)),
  rockAt:(x,z,h,sl)=>Math.max(smooth(.45,.78,sl),smooth(.56,.66,fbm(x*.003+4,z*.003,85,2))*.85),
  strataK:(x,z,h,sl)=>smooth(.5,.85,sl),
  snowAt:(x,z,h,sl)=>smooth(.6,.72,fbm(x*.0025,z*.0025,84,2))*smooth(.5,.2,sl)+smooth(5000,5100,h)*.4,
  polyg:(x,z,F)=>smooth(.62,.7,F.cold)*smooth(.12,.04,F.slope)*(1-F.rock)*(1-F.snow),
  strata:BIO.strata({recipe:'rift',seed:6806,range:[1500,5200],res:.5,private:true}),
  spine:[[-200,0],[-1200,-900],[-1500,-1900],[-900,900],[500,-400],[ex(0)-250,0],[ex(-1200)-200,-1200],[ex(1300)-200,1300],[-2400,1600],[600,2200]]});
 Object.assign(L,{PL,ex,EDGE});return L;})();
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=STATION.RIVER_SPEC,FALLS=STATION.FALLS,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The black barrens (riftrim station 6)',title:'Krator biome — the rift rim: the black barrens',
 hint:'Station 6 of the rift rim, the black rim (the S rim): a plateau at 4.8 km, sun rosettes all facing the sun, a slope of sailwort in the wind, iris lichen on the boulders, snowblood on the snow, a lantern lobelia standing over it at dusk, the trough falling away at the edge (scale model 5.1, px 521,1567)',
 region:{name:'The black barrens (station 6)',x:0,z:0,r:TERR.R},rim:'s',wind:[.8,.6],arcade:false,fruitMin:0,
 species:['lanternlobelia'],exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],   /* no bucket here to export: the one own tree (the lantern lobelia) is drawn as variants, and the borrowed trees' buckets are their vendors' registries, which the export does not read for this kit (checked 2026-11-03) */
sky:{px:249,py:1237},atm:.88,cloud:.15,dust:false,   /* the sky's frame: the old canvas (5.1 px less 272,330) */
 fog:{falloff:1/1800,sun:.45,sky:.2},climate:{cold:true,dry:true},wet:false,snowLine:[4900,5150],snowBase:0,frozen:true,groundN:540,
 groundLayers:['black','lichen','iris','snowalgae','clad'],
 talusPalette:[0x3e3a3c,0x4e4846,0x5e5450,0x2e2c30,0x6a5a52],talusMatrix:0x46403e,
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),de=Math.max(0,x-S0),dw=Math.max(0,-S0-x);
  return g-de*.55*smooth(0,7000,de)*1.2+dw*.06+150*(fbm(x*.0008,z*.0008,412,3)-.5)*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[-1500,800,2600,4500,5200],farLabel:'The S rim and the Rift\'s trough past the map',
 kin:[{ref:'rift.groundsel',key:'groundsel',name:'Giant groundsel',cell:50,minR:2,accept:Z=>Z.alpine*.08*Z.gentle*smooth(.25,.4,Z.wet)}],
 views:H=>{const {P,look,atTree,nearTree,gh}=H,S=STATION;
  return{
  'The black barrens':look(-600,600,2.2,600,-400,1),
  'Sun rosettes all facing the sun':look(P.alpine[0]-5,P.alpine[1]+4,1.3,P.alpine[0]+5,P.alpine[1]-4,0),
  'A slope of sailwort':look(-1400,-1300,3,-1700,-1800,8),
  'A lantern lobelia at dusk':atTree(nearTree('lanternlobelia',0,0),10,2.8,1.4),
  'Iris lichen on the boulders':look(P.rock[0]-8,P.rock[1]+6,1.5,P.rock[0],P.rock[1],.5),
  'The trough\'s edge':[S.ex(0)-300,gh(S.ex(0)-300,0,6),0,S.ex(0)+4000,S.PL-3200,400],
  'From afar':look(-2800,2800,400,800,-400,0)};},
 probes:{ice:null}};
