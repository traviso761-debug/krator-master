// ================================================================= HOST — wind, ATMOS.fogBelt advection shroud, heightFog & rainCover ([web])
const AIR=(function(){
 const AQ=new URLSearchParams(location.search);
 const AON=k=>AQ.get(k)!=='0';
 const out={hfog:false,belt:false,raincover:false,spray:0};

 try{
  if(BIO.bindAtmosWind)BIO.bindAtmosWind({gain:SITE.hasSea?1.15:0.92});
 }catch(e){reportErr('wind: '+(e.stack||e));}

 if(ATMOS.U&&ATMOS.U.wind){
  const wx0=SITE.wind[0],wz0=SITE.wind[1];
  ATMOS.U.wind.value.set(wx0,wz0);
  tick(()=>{
   const k=MC_STATE.mode==='mist'?0.85:1.0;
   ATMOS.U.wind.value.set(wx0*k,wz0*k);
   if(ATMOS.U.fog){
    ATMOS.U.fog.value=Math.max(ATMOS.U.fog.value,MC_STATE.mode==='mist'?0.34:0.10);
   }
  });
 }

 if(AON('hfog')&&ATMOS.heightFog){
  try{
   const mistOpt=SITE.hasSea
    ?{density:0.0010,y:6,depth:16,noise:0.68}
    :(SKEY==='cloudslope'?{density:0.0013,y:18,depth:42,noise:0.74}:{density:0.0008,y:8,depth:18,noise:0.65});
   ATMOS.heightFog({falloff:SKEY==='cloudslope'?1/420:1/580,sun:0.35,sky:0.36,mist:mistOpt});
   out.hfog=true;

   /* Optional volumetric fogBelt raymarch (?belt=1); default coastal advection sea-fog runs analytically via heightFog mistOpt (< 13 samplers) */
   if(AQ.get('belt')==='1'&&ATMOS.fogBelt&&samplersOf(MAT_GROUND)+3<=12){
    const beltCfg=SKEY==='cloudslope'
     ?{y0:4,y1:68,density:0.0015,edge:12,windward:[-1,0]}
     :(SITE.hasSea
        ?{y0:2,y1:48,density:0.0011,edge:10,windward:[-1,-0.4]}
        :{y0:10,y1:54,density:0.0009,edge:12,windward:[-0.8,-0.4]});
    window._belt=ATMOS.fogBelt(Object.assign({
     extent:[-TERR.R*1.08,-TERR.R*1.08,TERR.R*1.08,TERR.R*1.08],
     res:64,
     steps:3
    },beltCfg));
    out.belt=true;
   }
   ATMOS.heightFogScene(scene);
  }catch(e){reportErr('heightFog/fogBelt: '+(e.stack||e));}
 }

 if(ATMOS.rainCover&&RAIN_FITS){
  try{out.raincover=!!ATMOS.rainCover({renderer:renderer});}catch(e){reportErr('rainCover: '+(e.stack||e));}
 }else if(ATMOS.rainCover){
  out.raincover='skipped: ground uses '+samplersOf(MAT_GROUND)+' of '+MAXT+' texture units';
 }

 /* Surf-spray & shell-cataract mist plumes */
 if(ATMOS.smoke&&ATMOS.PRESETS&&ATMOS.PRESETS.smoke&&ATMOS.PRESETS.smoke.spray){
  const sprayPts=SKEY==='skerry'
   ?[[-176,1.6,-86,'spray'],[12,1.4,-108,'spray'],[48,0.8,-8,'spray']]
   :SKEY==='kelpfront'
   ?[[-128,1.8,48,'spray'],[-44,1.2,-36,'spray'],[-42,1.2,52,'spray']]
   :SKEY==='cloudslope'
   ?[[-22,19.0,0,'spray'],[16,11.0,2,'spray'],[54,4.2,0,'spray']]
   :[[-8,6.5,22,'spray']];
  const sc=ATMOS.smoke(sprayPts,{n:28});
  if(sc)out.spray=sprayPts.length;
 }

 return out;
})();

const WEATHER=ATMOS.bindWeather({
 climate:{wet:true,snow:false},
 sun:sun,
 hemi:hemiLight,
 fog:scene.fog,
 grounds:SITE.hasSea?[]:[MAT_GROUND],
 mode:'clear'
});
