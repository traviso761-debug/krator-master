// ================================================================= HOST — station flora & bridge-web placement trigger ([draw])
function STATION_BUILD(q){
 const webBatch=ARACHNOIDS.createBridgeWebBatch(scene);
 const counts=ARACHNOIDS.build({
  station:SKEY,
  terrainH:DRAWN_H,
  waterH:waterH,
  space:SPACE,
  register:REGISTER,
  webBatch:webBatch,
  quality:q,
  seed:5907,
  R:TERR.R*0.92
 });
 ARACHNOIDS.WEB_MESHES=webBatch.finalize();
 return counts;
}
