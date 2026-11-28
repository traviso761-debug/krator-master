// ================================================================= HOST — station flora & colonial silk placement trigger ([draw])
function STATION_BUILD(q){
 const silkBatch=SPIDERLAKE.createSilkBatch(scene);
 const out=SPIDERLAKE.build({
  station:SKEY,
  terrainH:DRAWN_H,
  waterH:waterH,
  space:SPACE,
  register:REGISTER,
  quality:q,
  seed:5813,
  R:TERR.R*0.92,
  silkBatch:silkBatch
 });
 SPIDERLAKE.SILK_MESHES=silkBatch.finalize();
 return out;
}
