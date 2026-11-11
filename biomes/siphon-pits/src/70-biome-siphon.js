// ================================================================= SIPHON PITS — build (BIOME-API.md)
// The kit's public surface. Each station orders its own passes (88-host-heat.js: STATION_BUILD): the pit's groves, felt and galls (SIPHON.buildPit), the
// cold ground's small life (SIPHON.buildCold), the terraces' crops, willow and sedge (SIPHON.buildTerraces). The woolly siphon is the Throne's siphon as a
// kin, grown by the Throne's builder (read in place). No fauna drawn here: the Ghaunt-Ox, the Flenser-Hound and the Pipe-Borer are kits/fauna's records.
SIPHON.build=function(opt){opt=opt||{};const R=opt.R==null?2450:opt.R,q=opt.quality==null?1:opt.quality,k=opt.station||'pitfloor',out={R,quality:q,station:k};
 BIO.cur='siphon/'+(k==='pitfloor'?'pit':k==='terraces'?'terraces':'cold');
 if(k==='pitfloor')Object.assign(out,SIPHON.buildPit(R,q,opt));
 else if(k==='terraces')Object.assign(out,SIPHON.buildTerraces(R,q,opt));
 else Object.assign(out,SIPHON.buildCold(R,q,opt));
 BIO.cur=null;return out;};
SIPHON.canopyH=function(x,z){return 1;};
// THE TREE RULE as a pure check (verify.py reads it; the negatives feed it broken lists): trees on a station never exceed its cap (0 where none may stand)
SIPHON.treeRule=function(station,trees){const cap=SIPHON.TREECAP[station];if(cap==null)return{ok:true,detail:'no cap on '+station};
 const n=(trees||[]).length;return{ok:n<=cap&&(cap===0||n>0),detail:n+' trees, cap '+cap+(cap===0?' (none may stand)':'')};};
BIO.kitEnd(SIPHON);   // its exports run in its registry; the default kit is current again
