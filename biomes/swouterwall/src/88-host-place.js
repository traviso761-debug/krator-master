// ================================================================= HOST — station placement entry ([G data])
function STATION_BUILD(q){
 const kOn=new URLSearchParams(location.search).get('kin')!=='0';
 return SWOW.placeAll({
  station:SKEY,
  quality:q,
  R:TERR.R-50,
  seed:SITE.seed,
  kin:kOn,
  terrainH:DRAWN_H,
  waterH:waterH,
  space:SPACE,
  register:REGISTER
 });
}
