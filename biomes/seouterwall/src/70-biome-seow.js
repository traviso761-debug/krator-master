// ================================================================= SEOW — build / canopyH
// The kit's public surface (BIOME-API.md). The layout is 46 (SEOW.lay: the host's fields; the cordillera's tiers, the climate, the wind
// and the zones). Station 1 (PLAN.md section 7.1): the kit's flora is the NW outer wall's, read in place (build.py slots its layout and
// its passes as 46n and 48a-48d; the host binds NWOW to this page's fields and maps each SEOW zone to the nwouterwall zone that grows
// there: SEOW.ZONES' nw). The plan's own borrowings (the puya, the snow lotus, the cushion domes) are a later turn (PLAN.md 7.3).
// opt: {R, quality}
SEOW.build=function(opt){opt=opt||{};const R=opt.R==null?(SEOW.R==null?2000:SEOW.R):opt.R,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q};if(!SEOW.FIELDS){BIO.err('SEOW.build: no layout (call SEOW.lay first)');return out;}
 if(typeof NWOW==='undefined'||!NWOW.build){BIO.err('SEOW.build: the NW outer wall\'s passes are not on the page (build.py reads them in place)');return out;}
 out.nw=NWOW.build({R,quality:q});
 BIO.cur=null;return out;};
SEOW.canopyH=function(x,z){return typeof NWOW!=='undefined'&&NWOW.canopyH?NWOW.canopyH(x,z):BIO.terrainH(x,z)+1;};
