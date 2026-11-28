// ================================================================= HOST — shared Krator sky at (px - 272, py - 330) & cloudShadeScene ([web])
// Surveyed Scale-Model 5.1 pixels shifted by (-272, -330):
//   skerry:     (312, 392) -> ( 40,  62), 1.59 atm     kelpfront:  (298, 476) -> ( 26, 146), 1.58 atm
//   browsewood: (356, 424) -> ( 84,  94), 1.56 atm     cloudslope: (438, 386) -> (166,  56), 1.22 atm (+2,150 m)
const SKY_DAY0=(function(){
 const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash);
 const d=m?+decodeURIComponent(m[1]):0;
 return isFinite(d)?d:0;
})();

const skyHostClock=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;

const SKY_CLOCK={
 get hour(){const c=skyHostClock();return c?c.hour:ATMOS.SKY.viewHour;},
 get day(){const c=skyHostClock();return SKY_DAY0+(c?(c.day==null?0:c.day):0);},
 get t(){const c=skyHostClock();return c?c.t:0;}
};

const SKY=ATMOS.sky(ATMOS.skyPreset('standard',{
 site:{px:SITE.sky[0],py:SITE.sky[1]},
 air:{pressure:SITE.atm,humidity:SKEY==='cloudslope'?0.92:0.96},
 clouds:{cover:SKEY==='cloudslope'?0.72:(SKEY==='browsewood'?0.58:0.52)},
 fogDensity:SKEY==='cloudslope'?0.00030:(SKEY==='browsewood'?0.00023:0.00019)
}),{
 renderer:renderer,
 camera:camera,
 scene:scene,
 sun:sun,
 hemi:hemiLight,
 clock:SKY_CLOCK,
 fog:true,
 weather:function(){
  const W=ATMOS.W;
  const mistAdd=MC_STATE.mode==='mist'?0.32:0.0;
  const rain=W&&W.rain!=null?W.rain:0;
  const fog=Math.min(1,(W&&W.fog!=null?W.fog:0)+mistAdd);
  return{
   cover:Math.min(1,rain*0.35+fog*0.35),
   grey:Math.max(rain,fog*0.68),
   fog:fog
  };
 }
});

const SKY_FILL=fill.intensity;
function skyView(dt){
 SKY.update(dt);
 const L=SKY.look;
 fill.intensity=SKY_FILL*Math.min(1,L.sunI/2);
 BIO.setSun(SKY.state.sunDir);
}
tick(skyView);

ATMOS.cloudShadeScene(scene,{biome:0.42,host:0.65,leave:/^biofauna|^mc-walker/});
