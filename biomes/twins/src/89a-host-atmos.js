// ================================================================= HOST — the atmosphere (core/atmos), bound
// core/atmos's one-time init on this page's frame ticks, ground and camera (ATMOS.bindHost), so the plumes and the weather can take the
// page. The hour is the shared sky's clock.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>SKY.clock.hour,seed:WORLD,viewH:()=>innerHeight});
// the wind: the ferns stir in core/atmos's wind and its gusts (PLAN.md section 3.1: 85 km/h crosswinds on the sprint); cut-outs by
// alpha-to-coverage where the canvas has MSAA
BIO.bindAtmosWind();BIO.setA2C(renderer);
// THE WEATHER (ATMOS.bindWeather): a cold range (climate.cold: snowfall and the blizzard, the whiteout the guides wait for: PLAN.md section
// 4.2), snow lying while it snows (fx/snowcover). It starts clear
ATMOS.bindWeather({climate:{cold:true},sun,hemi,grounds:GROUND?[GROUND.material]:[]});
// THE AIR and the cold (core/hazard's ambient bridge): the sky's pressure by height; the temperature (PLAN.md sections 1.2 and 6: the
// pyroduct's scree -4 C mean at 4,240 m, the col -3 to -8, the summit glacier -18; a lapse of 6.5 C a km), the day's swing +-3.5 C with the
// sun (the scree stays below freezing at noon: PLAN.md section 6's -4 C is the mean); a station's own (STATION_TEMP: +13 C inside the warm tubes, an oasis's warm ground) where it says so
if(ATMOS.provideAir)ATMOS.provideAir(SKY.preset||SKY.P||{air:{pressure:1.6,thin:{y0:0,scale:8000}}});
else KHAZ.provide('pressure',(x,y,z)=>AIR.at(y));
const tempMean=y=>-4-6.5*(y-4240)/1000+(STN.tempBias||0);   /* STN.tempBias: a station's own departure from the range's lapse (the Catch's warm updraught at station 6: PLAN.md section 6's +2 C) */
KHAZ.provide('temperature',(x,y,z)=>{const own=typeof STATION_TEMP==='function'?STATION_TEMP(x,y,z):null;if(own!=null)return own;
 const s=SKY.state&&SKY.state.sunDir,e=s?(s.y==null?s[1]:s.y):0;return tempMean(y)+3.5*clamp(e*2.2,-1,1);});
