// ================================================================= HOST — station flora & geological placement trigger ([draw])
function STATION_BUILD(q){
 return CROOK.build({
  station:SKEY,
  terrainH:DRAWN_H,
  waterH:waterH,
  space:SPACE,
  register:REGISTER,
  quality:q,
  seed:5207,
  R:TERR.R*0.92
 });
}
