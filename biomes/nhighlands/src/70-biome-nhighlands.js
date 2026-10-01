// ================================================================= NORTHERN HIGHLANDS — build / dress / canopyH
// The biome's public surface (BIOME-API.md). The passes live in 55 (trees),
// 60 (floor) and 65 (dress); this file only orders them and reports.
NHL.build=function(opt){opt=opt||{};const R=opt.R||3300,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,trees:0,heroes:0,far:0};
 if(NHL.buildTrees){BIO.cur='nhighlands/trees';Object.assign(out,NHL.buildTrees(R,q));}
 if(NHL.buildFloor){BIO.cur='nhighlands/floor';Object.assign(out,NHL.buildFloor(R,q));}
 BIO.cur=null;BIO.range=null;BIO.owner=null;BIO.minRange=0;return out;};
// growth on a structure: opt {kind:'crag'} for rock, else a building ({y0,h,coldTop,ledges,soffits,walls})
NHL.dress=function(geos,opt){if(!NHL.dressGeos)return null;BIO.cur='nhighlands/dress';const st=NHL.dressGeos(geos,opt||{});BIO.cur=null;return st;};
NHL.canopyH=function(x,z){return NHL._canopyH?NHL._canopyH(x,z):BIO.terrainH(x,z)+10;};
// the tags of whatever an inspector hit: a tree species by name or key, an understorey plant by its item label
NHL.tagsOf=function(nameOrLabel){const S=NHL.SPECIES.find(s=>s.name===nameOrLabel||s.key===nameOrLabel);if(S)return{name:S.name,cls:'flora (tree)',tags:S.tags};
 const P=NHL.PLANTS.find(p=>p.label===nameOrLabel||p.name===nameOrLabel);return P?{name:P.name,cls:'flora (understorey)',tags:P.tags}:null;};
