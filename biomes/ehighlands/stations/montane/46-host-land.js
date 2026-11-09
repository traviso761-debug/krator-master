// ================================================================= HOST — the land of station 6: the montane belt (built 2026-11-09)
// The wet face between the rainforest and the treeline (PLAN-STATIONS.md section 3, "the montane belt"): scale model 5.1 px 1076,747 (old
// canvas 804,417): 3,236 m, Dfb, ~2,070 mm a year, mean +9 C (warm month 21, cold -4), 1.07 atm. The page (y over a datum of 3,000 m)
// climbs 3,100 to ~3,600 m over one scarp, three ribs and their gullies, a stream. Stands of the combed fir and the combed beech in a
// patchwork, the firs gaining with height; their floors (needles, moss and ferns). The giant at azimuth 61.
const STAGE={id:'montane',name:'The montane belt of the eastern Inner Wall\'s wet face',R:2600,giantAz:61,groundN:520,datum:3000,
 site:{px:804,py:417},model:{px51:[1076,747],h:3236,rain:2071,cls:'Dfb',tm:9,tw:21,tc:-4,atm:1.07},
 title:'Krator biome — the eastern highlands: the montane belt',
 hint:'The eastern highlands, station 6: the montane forest of the wet face (3.1-3.6 km, ~1.07 atm, ~2,000 mm a year). Combed firs and combed beeches in stands, the firs gaining with height; ribs, gullies and a stream down the face; everything grows toward the giant',
 climate:{wet:true,cold:true},
 sky:{"air":{"pressure":1.07,"dustK":0.04,"dust":[0.8,0.84,0.88]},"clouds":{"cover":0.4},"fogDensity":0.00016,
  "ridges":[{"base":3.0,"amp":1.0,"cycles":32,"octaves":3,"seed":681,"win":[90,70,1.6],"floor":-1,"dist":25000,"haze":0.3,"rock":[0.34,0.38,0.38],"snow":[0.96,0.96,0.98],"snowH":1600},
   {"base":-0.5,"amp":0.2,"cycles":40,"octaves":2,"seed":682,"dist":70000,"haze":0.85,"rock":[0.5,0.55,0.6]}]},
 expect:{species:['fir','beech'],mother:false,vigil:false,chemistry:false},
 fields:['taiga','mixed','forest'],ground:['needles','moss','turf'],hfog:{falloff:1/800,mist:.0008},
 far:{out:12000,col:{a:[34,52,40],b:[50,66,42],scree:[100,100,96],snow:[226,232,238],haze:[158,172,190]},cold:y=>clamp(.6+(y+3000-4800)*.00044,0,1)},
 poolName:'A sag pond',regH:1000,
 face:{y0:100,slope:.07,X0:200,P:2400,rise:110,hw:110,ribs:[-1300,250,1700],ribH:22,seed:691,wet:.55,streamW:3,streamName:'A stream down the face',
  pools:[[-120,-900,14],[-90,1200,12]],
  /* the belts: fir stands and beech stands in patches, the firs gaining with height (the fir and beech passes each take a few in the
     other's stands) */
  belts:(abs,c)=>{const t=clamp(.3+.55*smooth(3150,3550,abs)+.6*(fbm(c.x*.0014,c.z*.0014,693,2)-.5),0,1)*(1-.7*c.rock);return{taiga:t,mixed:1-t};}}};

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
/* the export profile's box (verify.py reads STAGE.exportBox; 2026-11-08): the main page's [900,1200,1200,1500] holds no trunk here (buckets empty),
   so the densest 300 m cell of the belt's trees, found after the build */
STAGE.exportBox=()=>{const C={};let b=null,bn=0;for(const T of EHIGH.TREES){if(T.lv<1)continue;const k=Math.floor(T.x/300)+','+Math.floor(T.z/300);C[k]=(C[k]||0)+1;if(C[k]>bn){bn=C[k];b=k;}}
 if(!b)return null;const p=b.split(',').map(Number);return[p[0]*300,p[1]*300,p[0]*300+300,p[1]*300+300];};
