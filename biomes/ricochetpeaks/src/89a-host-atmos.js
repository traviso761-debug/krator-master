// ================================================================= HOST — crater inversion fogPool, katabatic/slopewind, snowBare & fumarole steam ([G shader])
// Binds ATMOS wind gusts, katabatic night drainage, slopeWind gap venturi & cold-air pool, heightFog crater inversion mist (fogPool),
// ATMOS.snowBare melting snow cleanly around East Hearth vents & Erebus chimneys, snowCover, weather, and fumarole steam plumes.
ATMOS.bindHost({
 THREE:THREE,scene:scene,camera:camera,renderer:renderer,ticks:TICKS,
 ground:(x,z)=>DRAWN_H(x,z),
 hour:()=>{
  if(RP_STATE.mode==='dusk')return 18.75;
  return typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:11.2;
 },
 seed:9131,
 viewH:()=>innerHeight
});
if(BIO.bindAtmosWind)BIO.bindAtmosWind({gain:SKEY==='notch'?1.45:SKEY==='highbowl'?1.18:0.92});

// Katabatic nighttime crater-wall drainage & daytime anabatic valley breeze (fx/89-atmos-fx-katabatic.js)
const KATABATIC=(typeof ATMOS.katabatic==='function')?ATMOS.katabatic({
 hour:()=>RP_STATE.mode==='dusk'?19.8:(typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:11.2),
 down:[SITE.wind[0],SITE.wind[1]],
 speed:SKEY==='notch'?2.35:1.55,
 daySpeed:0.78,
 calm:[SITE.wind[0]*0.45,SITE.wind[1]*0.45]
}):null;

// Topographic slopeWind + Skippers Notch gap venturi + crater cold-air pool (fx/89-atmos-fx-slopewind.js)
const SLOPE_WIND=(typeof ATMOS.slopeWind==='function')?(function(){
 const box=[-TERR.R*0.95,-TERR.R*0.95,TERR.R*0.95,TERR.R*0.95];
 const gaps=SKEY==='notch'?[{id:'skippers-notch',pts:[[-190,0],[190,0]],w:180,max:13.5,dayMax:7.5,night:'down',day:'up'}]:[];
 const sw=ATMOS.slopeWind({
  ground:rawTerrainH,
  box:box,
  cell:32,
  world:'ricochetpeaks-'+SKEY,
  katabatic:{max:SKEY==='highbowl'?6.0:4.5,from:19,to:8,ramp:1.5},
  anabatic:{max:2.6,from:9.5,to:17,ramp:1.5},
  pool:{reach:260,drop:11.5,depth:38},
  gaps:gaps
 });
 sw.attach(ATMOS);
 if(typeof KHAZ!=='undefined'&&KHAZ.provide){
  sw.provide(KHAZ,(x,y,z)=>SITE.soilTempC+FIELD.heat(x,z));
 }
 return sw;
})():null;

// Hydrothermal snowBare mask (fx/89-atmos-fx-snowcover.js): melts snow cleanly around East Hearth vents & Erebus chimney mouths!
const SNOW_BARE_MASK=(function(){
 if(typeof ATMOS.snowBare!=='function')return null;
 if(!(SITE.vents&&SITE.vents.length))return null;
 const mask=RICOCHET_PHYS.snowBareMask([-TERR.R*1.05,-TERR.R*1.05,TERR.R*1.05,TERR.R*1.05],8,SITE);
 ATMOS.snowBare(mask);
 return mask;
})();

const AIR=(function(){
 const q=new URLSearchParams(location.search),out={hfog:false,snow:false,steam:false};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){
  // Crater-basin inversion mist (fogPool) trapped in the lowest cup of each ricochet bowl!
  const poolLvl=SKEY==='notch'?6.0:(SKEY==='ringlake'?8.5:(SKEY==='vents'?7.5:(SKEY==='glasssheet'?6.5:5.5)));
  ATMOS.heightFog({
   falloff:SKEY==='highbowl'?1/320:1/250,
   sun:0.36,
   sky:0.36,
   mist:{y:poolLvl,depth:26,density:SKEY==='vents'?0.0022:0.0014,noise:0.55}
  });
  ATMOS.heightFogScene(scene);
  out.hfog=true;
 }

 if(q.get('snow')!=='0'&&ATMOS.snowCover){
  ATMOS.snowCover({
   base:SKEY==='highbowl'?0.68:(SKEY==='vents'?0.46:0.12),
   depth:RP_STATE.snowDepth,
   line:[SITE.snowLineY,SITE.snowLineY+68.0],
   frozen:SKEY==='highbowl',
   lee:0.42
  });
  out.snow=true;
 }

 // Steaming fumarole plumes on East Hearth (6 vents), Old Rim Erebus ice-chimneys (5 towers), and snowmelt spray
 if(ATMOS.smokeGroups&&SITE.vents&&SITE.vents.length){
  const G={};
  for(let i=0;i<SITE.vents.length;i++){
   const v=SITE.vents[i];
   const ch=(SITE.chimneys&&SITE.chimneys[i])?SITE.chimneys[i]:null;
   const emitY=ch?(rawTerrainH(ch.x,ch.z)+ch.H+0.35):(Math.max(rawTerrainH(v.x,v.z),waterH(v.x,v.z))+0.45);
   const emitters=[[v.x,emitY,v.z,'steam']];
   if(!ch){
    for(let k=0;k<3;k++){
     const a=(k/3)*TAU+i*0.5,rad=v.r*0.55;
     emitters.push([v.x+Math.cos(a)*rad,emitY+0.2,v.z+Math.sin(a)*rad,'steam']);
    }
   }
   G['vent_'+i]={emitters:emitters,n:SKEY==='vents'?20:16,k:0.82};
  }
  try{
   ATMOS.smokeGroups(G);
   out.steam=true;
  }catch(e){reportErr('steam: '+e.stack);}
 }else if(ATMOS.smoke&&ATMOS.PRESETS&&ATMOS.PRESETS.smoke&&ATMOS.PRESETS.smoke.spray){
  const mistPts=SKEY==='ringlake'
   ?[[-228,3.0,-122,'spray'],[0,3.2,-96,'spray']]
   :SKEY==='glasssheet'
   ?[[54,1.2,14,'spray'],[-36,5.2,-22,'spray']]
   :[[-96,5.0,0,'spray'],[96,-8.5,0,'spray']];
  if(ATMOS.smoke(mistPts,{n:20}))out.steam=true;
 }

 return out;
})();

ATMOS.bindWeather({
 climate:{cold:true,snow:true},
 sun:sun,
 hemi:hemiLight,
 grounds:[MAT_GROUND]
});
