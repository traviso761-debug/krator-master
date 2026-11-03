// ================================================================= THE RIFT RIM — build / biome / canopyH
// The kit's public surface (BIOME-API.md). Three biomes on one kit (PLAN.md section 3): RRIM.biome('n' | 's' | 'w') picks the rim the
// next build places (its species' weights, its floor's planter, its heath's palette); the passes live in 55 (trees) and 60 (floor).
// RRIM.WINTER closes the bell firs' bells (the winter seed); RRIM.AUTUMN turns the lobe larches; RRIM.WIND [x, z] the prevailing wind the
// sailwort turns edge-on to. No fauna here: the plan sends it to kits/fauna (section 8).
RRIM.rim='n';
RRIM.biome=function(r){if(!RRIM.RIMS[r]){BIO.err('RRIM.biome: a rim is n, s or w, not '+r);return RRIM.rim;}RRIM.rim=r;return r;};
RRIM.build=function(opt){opt=opt||{};if(opt.rim)RRIM.biome(opt.rim);const R=opt.R==null?3000:opt.R,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,rim:RRIM.rim,trees:0,heroes:0,far:0};
 if(RRIM.buildTrees){BIO.cur='riftrim/trees';Object.assign(out,RRIM.buildTrees(R,q));}
 if(RRIM.buildFloor){BIO.cur='riftrim/floor';Object.assign(out,RRIM.buildFloor(R,q));}
 BIO.cur=null;return out;};
RRIM.canopyH=function(x,z){return RRIM._canopyH?RRIM._canopyH(x,z):4;};
BIO.kitEnd(RRIM);   // its exports run in its registry; the default kit is current again
