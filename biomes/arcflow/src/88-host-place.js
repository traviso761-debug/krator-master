// ================================================================= HOST — station placement entry ([G data])
function STATION_BUILD(q){
 return ARCFLOW.placeAll({
  station:SKEY,
  quality:q,
  R:TERR.R-50,
  seed:8117,
  terrainH:DRAWN_H,
  waterH:waterH,
  space:SPACE,
  register:REGISTER
 });
}
