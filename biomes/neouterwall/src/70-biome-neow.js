// ================================================================= NEOW — build / canopyH
// The kit's public surface (BIOME-API.md). The layout is 46 (NEOW.lay: the host's fields; the climate, the springs' heat bands, the
// zones). Station 1 (PLAN.md section 7): the conifers and the floor are the NW outer wall's, read in place (build.py slots its layout and
// its passes as 46n and 48a-48d; the host binds NWOW to this page's fields and maps each NEOW zone to the nwouterwall zone that grows
// there: NEOW.ZONES' nw); the cauldron's own (50: the steam tree fern, the warm-shore reed) after them, keeping clear of their trees.
// opt: {R, quality}
NEOW.build=function(opt){opt=opt||{};const R=opt.R==null?(NEOW.R==null?1600:NEOW.R):opt.R,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q};if(!NEOW.FIELDS){BIO.err('NEOW.build: no layout (call NEOW.lay first)');return out;}
 if(typeof NWOW==='undefined'||!NWOW.build){BIO.err('NEOW.build: the NW outer wall\'s passes are not on the page (build.py reads them in place)');return out;}
 out.nw=NWOW.build({R,quality:q});
 BIO.cur='neouterwall/trees';out.ferns=NEOW.buildTrees(R,q);
 BIO.cur='neouterwall/floor';out.floor=NEOW.buildFloor(R,q);
 BIO.cur=null;return out;};
NEOW.canopyH=function(x,z){const a=typeof NWOW!=='undefined'&&NWOW.canopyH?NWOW.canopyH(x,z):BIO.terrainH(x,z)+1,b=NEOW._canopyH?NEOW._canopyH(x,z):0;return Math.max(a,b);};
BIO.kitEnd(NEOW);   // its exports run in its registry; the default kit is current again
