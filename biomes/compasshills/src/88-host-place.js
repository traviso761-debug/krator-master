// ================================================================= HOST — station flora & geological placement trigger ([G data])
function STATION_BUILD(q){
 return COMPASS.build({
  station:SKEY,
  terrainH:DRAWN_H,
  waterH:waterH,
  space:SPACE,
  register:REGISTER,
  quality:q,
  seed:910220,
  R:TERR.R*0.92
 });
}
