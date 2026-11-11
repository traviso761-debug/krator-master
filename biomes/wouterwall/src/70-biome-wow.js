// ================================================================= WOW — build / canopyH
// The kit's public surface (BIOME-API.md). The layout is 46 (WOW.lay: the host's fields; the bench's bands, the climate, the zones).
// W1 (PLAN.md section 9): the kit's flora is the NW outer wall's, read in place (build.py slots its layout and its passes as 46n and
// 48a-48d; the host binds NWOW to this page's fields and maps each WOW zone to the nwouterwall zone that grows there: WOW.ZONES' nw).
// W3: the bench's two native species: the puya spike (50, 60: WOW.buildNatives) and the dust tower (46: WOW.dustTowers, KSTACKS mounds the
// host's site makes and draws).
// opt: {R, quality}
WOW.build=function(opt){opt=opt||{};const R=opt.R==null?(WOW.R==null?1600:WOW.R):opt.R,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q};if(!WOW.FIELDS){BIO.err('WOW.build: no layout (call WOW.lay first)');return out;}
 if(typeof NWOW==='undefined'||!NWOW.build){BIO.err('WOW.build: the NW outer wall\'s passes are not on the page (build.py reads them in place)');return out;}
 out.nw=NWOW.build({R,quality:q});
 BIO.cur='wouterwall/natives';out.natives=WOW.buildNatives(R,q);
 BIO.cur=null;return out;};
WOW.canopyH=function(x,z){return typeof NWOW!=='undefined'&&NWOW.canopyH?NWOW.canopyH(x,z):BIO.terrainH(x,z)+1;};
BIO.kitEnd(WOW);   // its exports run in its registry (50 opened it); the default kit is current again
