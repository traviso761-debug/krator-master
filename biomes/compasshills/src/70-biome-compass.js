// ================================================================= COMPASS HILLS — BIOME-API closure ([G data])
// Closes BIO.kit('compasshills') and exposes COMPASS.canopyH for world/host consumers.
COMPASS.canopyH=function(x,z){
 const m=typeof COMPASS_PHYS!=='undefined'?COMPASS_PHYS.fieldAt(x,z,'foundry'):null;
 return (m&&m.bMagMt>35)?4.5:12.5;
};
BIO.kitEnd(COMPASS);
