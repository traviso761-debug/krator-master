// ================================================================= HOST — atmosphere, Klint waterfall mist & humic fen fog ([G shader])
// Binds ATMOS wind gusts to BIO foliage, attaches 1.37-1.58 atm height fog, sampler-guarded rain cover, and waterfall/seep spray plumes.
ATMOS.bindHost({
 THREE:THREE,scene:scene,camera:camera,renderer:renderer,ticks:TICKS,
 ground:(x,z)=>DRAWN_H(x,z),
 hour:()=>{
  if(AF_STATE.mode==='dusk')return 18.85;
  return typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:11.0;
 },
 seed:8131,
 viewH:()=>innerHeight
});
if(BIO.bindAtmosWind)BIO.bindAtmosWind({gain:SKEY==='auger'?1.22:SKEY==='koski'?1.12:0.95});

if(ATMOS.U&&ATMOS.U.wind){
 const baseWx=SITE.wind[0],baseWz=SITE.wind[1];
 ATMOS.U.wind.value.set(baseWx,baseWz);
 tick(()=>{
  const k=AF_STATE.mode==='dusk'?0.76:1.0;
  ATMOS.U.wind.value.set(baseWx*k,baseWz*k);
  if(ATMOS.U.fog){
   ATMOS.U.fog.value=Math.max(ATMOS.U.fog.value,AF_STATE.mode==='dusk'?0.30:0.10);
  }
 });
}

const AIR=(function(){
 const q=new URLSearchParams(location.search),out={hfog:false,raincover:false,mist:false};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){
  ATMOS.heightFog({falloff:SKEY==='klint'?1/175:SKEY==='neva'?1/190:1/260,sun:0.34,sky:0.34});
  ATMOS.heightFogScene(scene);
  out.hfog=true;
 }
 if(ATMOS.rainCover&&RAIN_FITS){
  try{out.raincover=!!ATMOS.rainCover({renderer:renderer});}catch(e){reportErr('rain cover: '+e.stack);}
 }else if(ATMOS.rainCover){
  out.raincover='skipped: ground uses '+samplersOf(MAT_GROUND)+' of '+MAXT+' texture units';
 }

 if(ATMOS.smoke&&ATMOS.PRESETS&&ATMOS.PRESETS.smoke&&ATMOS.PRESETS.smoke.spray){
  const mistPts=SKEY==='klint'
   ?[[-8,1.5,0,'spray'],[6,1.2,-12,'spray'],[6,1.2,12,'spray'],[18,1.0,0,'spray']]
   :SKEY==='koski'
   ?[[-48,8.5,0,'spray'],[0,4.5,2,'spray'],[48,1.2,-2,'spray']]
   :SKEY==='seep'
   ?[[-16,20.5,0,'spray'],[18,11.2,2,'spray'],[48,3.6,0,'spray']]
   :[[-12,1.2,-8,'spray'],[42,0.9,8,'spray']];
  const mistCloud=ATMOS.smoke(mistPts,{n:28});
  if(mistCloud)out.mist=true;
 }

 return out;
})();

ATMOS.bindWeather({
 climate:{wet:true,snow:false},
 sun:sun,
 hemi:hemiLight,
 grounds:[MAT_GROUND]
});
