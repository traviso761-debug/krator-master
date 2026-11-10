// ================================================================= SEOW — build / canopyH
// The kit's public surface (BIOME-API.md). The layout is 46 (SEOW.lay: the host's fields; the cordillera's tiers, the climate, the wind
// and the zones). Station 1 (PLAN.md section 7.1): the kit's flora is the NW outer wall's, read in place (build.py slots its layout and
// its passes as 46n and 48a-48d; the host binds NWOW to this page's fields and maps each SEOW zone to the nwouterwall zone that grows
// there: SEOW.ZONES' nw). The kit's own plants are 50 and 60 (the puya, the red guyed stalks, the sky and gold poppies, goldroot).
// opt: {R, quality}
SEOW.build=function(opt){opt=opt||{};const R=opt.R==null?(SEOW.R==null?2000:SEOW.R):opt.R,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q};if(!SEOW.FIELDS){BIO.err('SEOW.build: no layout (call SEOW.lay first)');return out;}
 if(typeof NWOW==='undefined'||!NWOW.build){BIO.err('SEOW.build: the NW outer wall\'s passes are not on the page (build.py reads them in place)');return out;}
 // THE GOD-BORE KEEPS THE UPRIGHT TREES TO THE LEE (PLAN.md section 2.1): the NW outer wall's passes scatter a few larch and stone pine on
 // their tundra and steppe; here those are the wind-scoured krummholz, moraine, col and puna, so the upright trees' passes (sp 0, 1)
 // accept only this kit's larch zone. The passes are the read-in-place kit's data: their acceptance is wrapped, not edited
 if(!NWOW._seowLee){NWOW._seowLee=true;NWOW.PASSES.forEach(P=>{if(P.sp>1)return;const A0=P.accept;P.accept=(x,z,Z)=>SEOW.zoneAt&&SEOW.zoneAt(x,z)!=='larch'?0:A0(x,z,Z);});}
 out.nw=NWOW.build({R,quality:q});
 // the kit's own plants (50, 60: the puya, the guyed stalks, the poppies, goldroot), in its own registry and bucket
 BIO.cur='seouterwall/floor';out.floor=SEOW.buildFloor(R,q);
 BIO.cur=null;return out;};
SEOW.canopyH=function(x,z){return typeof NWOW!=='undefined'&&NWOW.canopyH?NWOW.canopyH(x,z):BIO.terrainH(x,z)+1;};
