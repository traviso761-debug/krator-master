// ================================================================= HOST — the gills' steam, hazards and breath tick, once core/atmos is bound
// 87-host-gills.js's stationBuild runs in 88 (before the bake, before core/atmos's fragments); what needs ATMOS (the steam groups) and the breath's
// tick is GILLS_DRAW.late, called here (after 89a binds the atmosphere). The Red ladder reads this file too.
if(GILLS_DRAW.late){try{GILLS_DRAW.late();}catch(e){reportErr('gills (late): '+e.stack);}}
