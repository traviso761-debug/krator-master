// TARGET: north-shore — the village laid out by core/hamlet and placed on the 1:1 ground (src/89zac-ad-village.js)
reseed(34151);
const AD_V=adVillage(AD_SITE.village);
const AD_WAYS=AD_V.ways||[];
const AD_PAVED=[];
window._adSite={pads:AD_PADS.length,places:AD_PLACE.length,village:AD_SITE.village,error:AD_V.error||(AD_V.v&&AD_V.v.error)||null,
 census:AD_V.v&&AD_V.v.census?{pop:AD_V.v.census.pop,households:AD_V.v.census.households,workers:AD_V.v.census.workers}:null,records:AD_V.v&&AD_V.v.records?AD_V.v.records.length:0};