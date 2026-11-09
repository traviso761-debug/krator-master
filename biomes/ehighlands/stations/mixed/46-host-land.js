// ================================================================= HOST — the land of station 5: the mixed belt (built 2026-11-09)
// The wet face above the cloud forest (PLAN-STATIONS.md section 3, "the mixed belt"): scale model 5.1 px 1079,755 (old canvas 807,425), on
// station 2's transect: 2,505 m, Cfa, ~4,000 mm a year still (5.1's face is far wetter than the 4.21 plan's ~940 mm), mean +15 C (warm
// month 25, cold 4), 1.17 atm: a cool temperate rainforest. The page (y over a datum of 2,000 m) climbs 2,350 to ~2,850 m in two benches
// with sag ponds, three ribs and the stream falling over each scarp's lip. The kit's species 10, the combed beech, everywhere; the last
// laurels and tree ferns at the bottom edge; the first firs in patches at the top. The cloud bank's top at the page's foot. Giant: 61.
const STAGE={id:'mixed',name:'The mixed belt of the eastern Inner Wall\'s wet face',R:2600,giantAz:61,groundN:520,datum:2000,
 site:{px:807,py:425},model:{px51:[1079,755],h:2505,rain:4000,cls:'Cfa',tm:15,tw:25,tc:4,atm:1.17},
 title:'Krator biome — the eastern highlands: the mixed belt',
 hint:'The eastern highlands, station 5: the cool rainforest of the wet face above the cloud forest (2.35-2.85 km, ~1.17 atm, ~4,000 mm a year). Combed beeches in tiers thrown out toward the giant, the last laurels and tree ferns below, the first firs above; a stream falling from bench to bench',
 climate:{wet:true},
 sky:{"air":{"pressure":1.17,"dustK":0.05,"dust":[0.82,0.85,0.88]},"clouds":{"cover":0.5},"fogDensity":0.0002,
  "ridges":[{"base":4.0,"amp":1.2,"cycles":30,"octaves":3,"seed":661,"win":[90,75,1.6],"floor":-1,"dist":25000,"haze":0.35,"rock":[0.3,0.36,0.32]},
   {"base":-0.3,"amp":0.2,"cycles":40,"octaves":2,"seed":662,"dist":60000,"haze":0.85,"rock":[0.48,0.54,0.6]}]},
 expect:{species:['beech','laurel','treefern'],mother:false,vigil:false,chemistry:false},
 fields:['forest','mixed','taiga'],ground:['moss','needles','turf'],hfog:{falloff:1/650,mist:.001},
 belt:{y0:-200,y1:260,windward:[-1,0],density:.0009,depth:70},
 far:{out:12000,col:{a:[42,60,34],b:[56,74,40],scree:[96,96,90],snow:[226,232,238],haze:[150,166,178]},cold:y=>clamp((y-1500)/2700,0,1)},
 poolName:'A sag pond',regH:1000,
 face:{y0:350,slope:.04,X0:-900,P:1800,rise:120,hw:110,ribs:[-1600,-200,1500],ribH:18,seed:671,wet:.66,streamW:3,
  streamName:"The stream (a headwater of the Na'ashǫ́'ii Buruuk)",pools:[[-1150,-1500,14],[-1100,1100,18],[680,-1000,12],[700,900,16]],
  /* the belts: the cloud forest's laurels and tree ferns at the bottom edge, beeches everywhere, firs in patches at the top */
  belts:(abs,c)=>{const n=fbm(c.x*.0016,c.z*.0016,673,2)-.5;
   return{forest:clamp(smooth(2480,2360,abs)+.6*n,0,1),mixed:1,taiga:clamp(-.35+.7*smooth(2600,2800,abs)+.6*n,0,1)};}}};

camera.far=30000;camera.updateProjectionMatrix();
const TERR={R:STAGE.R};
const GIANT_AZ=STAGE.giantAz,GX=Math.sin(GIANT_AZ*Math.PI/180),GZ=-Math.cos(GIANT_AZ*Math.PI/180);
const MOTHER=null,BOG=null,TARN=null,TARNL=null,GEO=null,TORS=[],GULLY=[],VENTS=[],FLOWERING=null;
const zF=x=>0,xg=(G,z)=>0;
/* the face's cold, one scale for the three upper stations (the kit's fir takes its form from it: upright under ~4.8 km, flagged to ~5 km,
   krummholz above): 0 below ~3.4 km */
const FACE_COLD=abs=>clamp(.6+(abs-4800)*.00044,0,1);
const WF=WALLFACE(Object.assign({R:STAGE.R,datum:STAGE.datum,coldAt:FACE_COLD},STAGE.face));
const terrainH=WF.terrainH,terrainH0=WF.terrainH0,waterH=WF.waterH,fieldsAt=WF.fieldsAt,POOLS=WF.POOLS,LAND_FLOWS=WF.FLOWS,SPTS=[],STREAMW=STAGE.face.streamW==null?3:STAGE.face.streamW;
const OBSTACLES=[];
const SPINE=[[0,0],[-1500,WF.zs(-1500)+200],[1400,WF.zs(1400)-200],[0,WF.zs(0)]];
STAGE.windows={water:[-TERR.R,-TERR.R,TERR.R,TERR.R]};
STAGE.farH=WF.farH;
