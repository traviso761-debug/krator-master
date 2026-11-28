// ================================================================= HOST — frost-smoke fogPool, katabatic, slopewind & snowcover ([G shader])
// Binds ATMOS wind, fx/katabatic, fx/slopewind (wired to KHAZ cold-pool temperature), heightFog mist (fogPool frost-smoke
// over boreal lakes), and fx/snowcover ramping southward without adding ground texture units!
const HOUR_FN=()=>{
 if(SWOW_STATE.mode==='dawn')return 6.35;
 return typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:10.5;
};

ATMOS.bindHost({
 THREE:THREE,scene:scene,camera:camera,renderer:renderer,ticks:TICKS,
 ground:(x,z)=>DRAWN_H(x,z),
 hour:HOUR_FN,
 seed:SITE.seed+31,
 viewH:()=>innerHeight
});
if(BIO.bindAtmosWind)BIO.bindAtmosWind({gain:SKEY==='trigemini'||SKEY==='breathvale'?1.35:0.95});

// 1. fx/katabatic: night/dawn density drainage roaring down the SW Outer Wall U-troughs
const KATABATIC=(typeof ATMOS.katabatic==='function')?ATMOS.katabatic({
 hour:HOUR_FN,
 down:SITE.wind,
 speed:SKEY==='trigemini'?2.25:SKEY==='breathvale'?2.40:1.45,
 daySpeed:0.65,
 calm:[SITE.wind[0]*0.45,SITE.wind[1]*0.45]
}):null;

// 2. fx/slopewind: local terrain drainage, gap winds & nocturnal cold-air pooling wired into KHAZ 'temperature'
const SLOPE_WIND=(function(){
 if(typeof ATMOS.slopeWind!=='function')return null;
 const gaps=SKEY==='trigemini'?[
  {id:'dalab-ne-arm',pts:[[280,-210],[60,-42]],w:190,max:14,dayMax:5,night:'down',day:'up'},
  {id:'copper-w-arm',pts:[[-290,-14],[-75,0]],w:185,max:13,dayMax:5,night:'down',day:'up'},
  {id:'rift-s-arm',pts:[[12,34],[26,285]],w:195,max:12,dayMax:6,night:'down',day:'up'}
 ]:[];
 const W=ATMOS.slopeWind({
  world:'swouterwall-'+SKEY,
  ground:rawTerrainH,
  box:[-TERR.R,-TERR.R,TERR.R,TERR.R],
  cell:34,
  katabatic:{max:SKEY==='breathvale'?11.0:SKEY==='trigemini'?9.5:4.5,from:18.5,to:8.5,ramp:1.5},
  anabatic:{max:2.4,from:9.5,to:16.5,ramp:1.5},
  pool:{reach:240,drop:SKEY==='boreallakes'?6.5:9.5,depth:32},
  gaps:gaps
 });
 W.attach(ATMOS,HOUR_FN);
 if(typeof KHAZ!=='undefined'&&typeof W.provide==='function'){
  W.provide(KHAZ,(x,y)=>SWOW_PHYS.transectAt(SITE.px[1],SITE.baseElevM+(y==null?0:y)).tcC,HOUR_FN);
 }
 return W;
})();

// 3. heightFog with fogPool dawn frost-smoke steaming off northern boreal paternoster lakes & Veil-mist bank
const AIR=(function(){
 const q=new URLSearchParams(location.search),out={hfog:false,frostSmoke:false,snowcover:false,spindrift:false};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){
  const mistCfg=SKEY==='boreallakes'
   ?{density:0.0115,y:15.2,depth:22,noise:0.62,dawn:[3.5,5.5,9.2,11.8],day:0.18,night:0.46}
   :SKEY==='morainetarn'
   ?{density:0.0048,y:8.2,depth:16,noise:0.55,dawn:[4.0,5.8,8.8,10.8],day:0.06,night:0.24}
   :{density:0.0018,y:4.5,depth:12,noise:0.50,dawn:[4.5,6.2,8.2,9.8],day:0.02,night:0.14};
  ATMOS.heightFog({
   falloff:SKEY==='boreallakes'?1/190:SKEY==='morainetarn'?1/280:1/420,
   sun:0.35,
   sky:0.42,
   mist:mistCfg
  });
  ATMOS.heightFogScene(scene);
  out.hfog=true;
  out.frostSmoke=SKEY==='boreallakes'||SKEY==='morainetarn';
 }

 // 4. fx/snowcover: snowline ramping down southward (0 extra texture units on MAT_GROUND!)
 if(q.get('snow')!=='0'&&typeof ATMOS.snowCover==='function'){
  ATMOS.snowCover({
   base:SITE.snowBase,
   line:SITE.snowLine,
   frozen:SKEY==='trigemini'||SKEY==='breathvale',
   depth:SKEY==='breathvale'?0.34:SKEY==='trigemini'?0.26:SKEY==='morainetarn'?0.10:0.0,
   lee:0.35
  });
  out.snowcover=true;
 }

 // Riffle spray & katabatic spindrift plumes
 if(ATMOS.smoke&&ATMOS.PRESETS&&ATMOS.PRESETS.smoke&&ATMOS.PRESETS.smoke.spray){
  const pts=SKEY==='boreallakes'
   ?[[-22,10.5,-8,'spray'],[-4,6.2,-1,'spray'],[14,1.2,8,'spray']]
   :SKEY==='morainetarn'
   ?[[-178,16.5,-2,'spray'],[-136,9.4,-8,'spray'],[-104,5.0,-6,'spray']]
   :SKEY==='trigemini'
   ?[[-48,3.2,-18,'spray'],[36,3.0,22,'spray'],[86,9.5,-68,'spray']]
   :[[-24,2.8,16,'spray'],[32,4.5,-18,'spray']];
  if(ATMOS.smoke(pts,{n:24}))out.spindrift=true;
 }

 return out;
})();

ATMOS.bindWeather({
 climate:{wet:SKEY==='boreallakes'||SKEY==='morainetarn',snow:true},
 sun:sun,
 hemi:hemiLight,
 grounds:[MAT_GROUND]
});
