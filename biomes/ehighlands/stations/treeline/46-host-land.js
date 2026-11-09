// ================================================================= HOST — the land of station 4: the treeline under the crest (built 2026-11-09)
// The windward face just under the crest (PLAN-STATIONS.md section 3, "under the crest"): scale model 5.1 px 1105,750 (old canvas 833,420),
// directly up the face from station 2; the model climbs 4,670 to 5,040 m over 6 km here: Dfc, ~250 mm a year, warm month 13 C falling
// to 11 (the treeline's 10 C near 5.1 km), 0.89 atm. The page (y over a datum of 4,500 m) rises 560 m to the crest's shoulder, rounding over
// it at the east edge where the dry side begins. Four rocky ribs run down the face, a gully between each pair; a stream off the crest's
// snow in the middle one; an avalanche chute keeps a meadow strip open; a tarn under the crest. The giant at azimuth 60.
const STAGE={id:'treeline',name:'The treeline under the eastern Inner Wall\'s crest',R:2600,giantAz:60,groundN:520,datum:4500,
 site:{px:833,py:420},model:{px51:[1105,750],h:4671,rain:267,cls:'Dfc',tm:0,tw:13,tc:-13,atm:.89},
 title:'Krator biome — the eastern highlands: the treeline',
 hint:'The eastern highlands, station 4: the treeline under the eastern Inner Wall\'s crest (4.56-5.12 km, ~0.88 atm). Combed firs thinning upward, flagged with their branches only on the giant side, then krummholz mats stretched toward the giant; ragbark in the gullies, an avalanche chute, the plateau\'s cushions and woolbacks coming over the crest',
 climate:{wet:true,cold:true},
 sky:{"air":{"pressure":0.88,"dustK":0.03,"dust":[0.8,0.83,0.88]},"clouds":{"cover":0.3},"fogDensity":0.00012,
  "ridges":[{"base":1.2,"amp":0.6,"cycles":34,"octaves":3,"seed":641,"win":[95,60,1.6],"floor":-1,"dist":20000,"haze":0.25,"rock":[0.4,0.42,0.46],"snow":[0.96,0.96,0.98],"snowH":600},
   {"base":-0.6,"amp":0.2,"cycles":40,"octaves":2,"seed":642,"dist":80000,"haze":0.85,"rock":[0.5,0.56,0.62]}]},
 expect:{species:['fir','ragbark','cushion','woolback'],mother:false,vigil:false,chemistry:false},
 fields:['taiga','mixed','forest'],ground:['needles','puna','turf'],hfog:{falloff:1/900,mist:.0006},
 far:{out:12000,col:{a:[44,62,46],b:[90,84,64],scree:[110,106,100],snow:[228,232,240],haze:[166,180,202]},cold:y=>clamp(.49+y*.00044,0,1)},
 poolName:'A treeline tarn',regH:900,
 /* the land (45f): 560 m over the page, the crest rounding over at x 2200; four ribs, the stream in the middle gully; a tarn under the crest */
 face:{y0:60,slope:.105,crest:2200,ribs:[-1700,-480,700,1900],ribH:24,seed:651,wet:.42,pools:[[1500,-1100,26]],streamW:2,streamName:'A stream off the crest\'s snow',
  /* the belts: firs to ~5 km, thinning and stunted above (their form is the kit's, from the cold); ragbark in the gullies at the treeline;
     the avalanche chute treeless (fell meadow); bare rock on the ribs */
  belts:(abs,c)=>{const chute=smooth(90,25,Math.abs(c.z+1100+60*Math.sin(c.x*.002)))*smooth(-2400,-1800,c.x);
   const g=c.gul*smooth(4700,4860,abs)*smooth(5120,5000,abs);
   return{taiga:clamp(smooth(5090,4930,abs)*(1-.8*c.rock)*(1-chute)*(1-.7*g),0,1),gully:g};}}};

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
