// ================================================================= HOST — station placement entry ([G data])
function STATION_BUILD(q){
 return VEIL.placeAll({
  station:SKEY,
  quality:q,
  R:TERR.R-50,
  seed:9217,
  terrainH:DRAWN_H,
  waterH:waterH,
  space:SPACE,
  register:REGISTER
 });
}
