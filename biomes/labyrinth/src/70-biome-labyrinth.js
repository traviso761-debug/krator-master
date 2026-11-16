// ================================================================= THE LABYRINTH — build / dress / canopyH
// The kit's public surface (BIOME-API.md). The passes live in 55 (the trees), 60 (the floor) and 65 (the growth on structures); this file
// only orders them and reports. opt: {R, quality, profile} where profile names one of LABY.PROFILES (55: parkland, tallsteppe, drysteppe,
// cold), the station's choice (its 44z SITE.flora)
LABY.build=function(opt){opt=opt||{};const R=opt.R==null?2400:opt.R,q=opt.quality==null?1:opt.quality,key=opt.profile||'parkland',P=LABY.PROFILES[key];
 if(!P){BIO.err('LABY.build: no profile '+key+' (LABY.PROFILES: '+Object.keys(LABY.PROFILES).join(', ')+')');return {R,quality:q};}
 LABY.R=R;LABY.profile=P;const out={R,quality:q,profile:key};
 Object.assign(out,LABY.buildTrees(R,q,P));
 out.floor=LABY.buildFloor(R,q,P);
 return out;};
LABY.dress=function(geos,opt){return LABY.dressGeos(geos,opt||{});};
LABY.canopyH=function(x,z){return LABY._canopyH?LABY._canopyH(x,z):BIO.terrainH(x,z)+1;};
BIO.kitEnd(LABY);   // its exports run in its registry; the default kit is current again
