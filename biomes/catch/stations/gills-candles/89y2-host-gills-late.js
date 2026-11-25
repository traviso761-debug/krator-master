// ================================================================= HOST — the gills' steam, hazards and breath tick, once core/atmos is bound
// 87-host-gills.js's stationBuild runs in 88 (before the bake, before core/atmos's fragments); what needs ATMOS (the steam and candle-haze groups)
// and the breath's tick is GILLS_DRAW.late, called here, after 89a binds the atmosphere. Keyed 89y2 so it sorts after 89y-host-storm.js.
if(typeof GILLS_DRAW!=='undefined'&&GILLS_DRAW.late){try{GILLS_DRAW.late();}catch(e){reportErr('gills (late): '+e.stack);}}
