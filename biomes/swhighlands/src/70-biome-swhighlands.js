// ================================================================= SW HIGHLANDS — build / tagsOf / canopyH
// The biome's public surface (BIOME-API.md). The passes live in 55 (trees, fallen wood) and 60 (floor); this file orders them
// and reports. opt.box: [x0,z0,x1,z1] the window to fill (a tile built alone draws what the full build draws in it);
// opt.station: 'folds' (station 1, the default), 'treeline' (station 6) or 'pillars' (station 4, 57-biome-swhighlands-pillars.js);
// opt.sheet: [x, z, heading] lays the pillar rim's flora out in a row there after the station's own (a preview: SWHI.pillarsSheet); opt.bald: [x,z,r] the bald's middle and radius, where its pillar cap stands; opt.quality scales the cells' density.
SWHI.build=function(opt){opt=opt||{};const q=opt.quality==null?1:opt.quality,box=opt.box||[-2400,-2400,2400,2400];
 const out={quality:q,ms:{}},now=()=>performance.now();let t=now();
 if(opt.bald)SWHI.setBald(opt.bald[0],opt.bald[1],opt.bald[2]);
 out.station=opt.station||'folds';
 if(out.station==='treeline'){BIO.cur='swhighlands/trees';Object.assign(out,SWHI.buildTreeline(box,q));out.ms.trees=Math.round(now()-t);}   /* station 6 (56-biome-swhighlands-treeline.js) */
 else if(out.station==='pillars'){BIO.cur='swhighlands/trees';Object.assign(out,SWHI.buildPillars(box,q));out.ms.trees=Math.round(now()-t);}   /* station 4 */
 else{BIO.cur='swhighlands/trees';Object.assign(out,SWHI.buildTrees(box,q));out.ms.trees=Math.round(now()-t);t=now();
 BIO.cur='swhighlands/floor';out.floor=SWHI.buildFloor(box,q);out.ms.floor=Math.round(now()-t);}
 if(opt.sheet){t=now();BIO.cur='swhighlands/trees';out.sheet=SWHI.pillarsSheet(opt.sheet[0],opt.sheet[1],opt.sheet[2]);out.ms.sheet=Math.round(now()-t);}
 BIO.cur=null;BIO.range=null;BIO.owner=null;BIO.minRange=0;return out;};
SWHI.canopyH=function(x,z){return SWHI._canopyH?SWHI._canopyH(x,z):BIO.terrainH(x,z)+2;};
// the tags of whatever an inspector hit: a tree species by name or key, a small plant or a part by its item label
SWHI.tagsOf=function(nameOrLabel){const S=SWHI.SPECIES.find(s=>s.name===nameOrLabel||s.key===nameOrLabel);if(S)return{name:S.name,cls:'flora (tree)',tags:S.tags};
 const P=SWHI.PLANTS.find(p=>p.label===nameOrLabel||p.name===nameOrLabel);return P?{name:P.name,cls:'flora (understorey)',tags:P.tags}:null;};
BIO.kitEnd(SWHI);   // its exports run in its registry; the default kit is current again
