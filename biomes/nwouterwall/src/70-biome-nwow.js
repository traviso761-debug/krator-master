// ================================================================= NWOW — build / canopyH / pyc
// The kit's public surface (BIOME-API.md). The layout is 46 (NWOW.lay: the host's fields; NWOW.climate and pycrete's rule); the
// passes 55 (the trees) and 60 (the floor and the fields). This file only orders them and reports.
// opt: {R, quality, beds, pockets, tors}: the host's places for the Three Gifts (PLAN.md section 4)
NWOW.build=function(opt){opt=opt||{};const R=opt.R==null?(NWOW.R==null?2000:NWOW.R):opt.R,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,season:NWOW.season};if(!NWOW.FIELDS){BIO.err('NWOW.build: no layout (call NWOW.lay first)');return out;}
 BIO.cur='nwouterwall/trees';Object.assign(out,NWOW.buildTrees(R,q));
 BIO.cur='nwouterwall/floor';out.floor=NWOW.buildFloor(R,q,opt);
 BIO.cur=null;return out;};
NWOW.canopyH=function(x,z){return NWOW._canopyH?NWOW._canopyH(x,z):BIO.terrainH(x,z)+1;};
// pycrete's rule at a point (46: PLAN.md section 5): 'permanent' | 'seasonal' | 'none'. The culture kit (kits/yeti) reads it
NWOW.pyc=function(x,z){return NWOW.pycAt(x,z);};
BIO.kitEnd(NWOW);   // its exports run in its registry; the default kit is current again
