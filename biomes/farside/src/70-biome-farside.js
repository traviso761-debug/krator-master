// ================================================================= FARSIDE — build / dress / canopyH
// The biome's public surface (BIOME-API.md). The passes live in 55 (the stands: the land kelp, the dead at the front),
// 60 (the floor) and 65 (the dressing on trees); this file only orders them and reports.
FARSIDE.build=function(opt){opt=opt||{};const R=(opt.R==null?1500:opt.R),q=opt.quality==null?1:opt.quality;
 const out={R,quality:q};
 BIO.cur='farside/stands';Object.assign(out,FARSIDE.buildStands(R,q,opt));
 BIO.cur='farside/floor';Object.assign(out,FARSIDE.buildFloor(R,q));
 // the dead at the front wear the sea's weed (their own snags; the native forest is dressed by the host after it grows)
 BIO.cur='farside/dress';out.dressDead=FARSIDE.dressTrees(FARSIDE.STANDS.filter(T=>T.key==='snag'),{salt:'dead',quality:q});
 BIO.cur=null;return out;};
FARSIDE.dress=function(trees,opt){BIO.cur='farside/dress';const r=FARSIDE.dressTrees(trees,opt||{});BIO.cur=null;return r;};
FARSIDE.canopyH=function(x,z){return FARSIDE._canopyH?FARSIDE._canopyH(x,z):10;};
BIO.kitEnd(FARSIDE);   // its exports run in its registry; the default kit is current again
