// ================================================================= HOST — station placement entry ([G data])
function STATION_BUILD(q){
 return RICOCHET.placeAll({
  station:SKEY,
  quality:q,
  R:TERR.R-50,
  seed:9117,
  terrainH:DRAWN_H,
  waterH:waterH,
  space:SPACE,
  register:REGISTER
 });
}
