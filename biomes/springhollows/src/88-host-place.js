// ================================================================= HOST — station placement entry ([G data])
function STATION_BUILD(q){
 return SPRINGHOLLOWS.placeAll({
  station:SKEY,
  quality:q,
  R:TERR.R-50,
  seed:7417,
  terrainH:DRAWN_H,
  waterH:waterH,
  space:SPACE,
  register:REGISTER,
  cavern:CAVERN
 });
}
