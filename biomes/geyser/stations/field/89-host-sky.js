// ================================================================= HOST — Krator's sky at the station's place (core/atmos, SKY-PLAN.md section 9)
// ATMOS.skyBiome at the site (STATION_SITE.sky: {px, py} on the old canvas the sky reads, the air's pressure and humidity, cloud cover, fog), on the host
// clock (the page opens at 06:00; #hour=). No painted ridges: the far field is real ground (85).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:SITE.sky.px,py:SITE.sky.py},
 preset:{air:{pressure:SITE.sky.pressure,humidity:SITE.sky.humidity==null?.4:SITE.sky.humidity},clouds:{cover:SITE.sky.clouds==null?.3:SITE.sky.clouds},fogDensity:SITE.fog==null?.0002:SITE.fog}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;
SKY.modes({hours:{day:13,night:22},hooks:_onLight,set:m=>{LIGHT_MODE=m;}});
