// ================================================================= RING SEA ISLES — build / canopyH
// The kit's public surface (BIOME-API.md). The zones and the trees are 55 (the borrowed ones grown by their own kits),
// the floor 60, the gardens 62; this file only orders them and reports. No fauna here: the fauna kit places the animals
// (kits/fauna; the showcase's host does, 89f-host-fauna.js).
RINGISLES.build=function(opt){opt=opt||{};const R=opt.R||2000,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q};
 RINGISLES.clearTrees();
 // the gardens first: their trees claim their ground, and the wild keeps out of their plots (the 'garden' field)
 if(opt.plots&&opt.plots.length){BIO.cur='ringisles/gardens';out.gardens=RINGISLES.buildGardens(opt.plots,q);}
 if(RINGISLES.buildTrees){BIO.cur='ringisles/trees';Object.assign(out,RINGISLES.buildTrees(R,q));}
 if(RINGISLES.buildDressing){BIO.cur='ringisles/dressing';out.dressing=RINGISLES.buildDressing(q);}
 if(RINGISLES.buildFloor){BIO.cur='ringisles/floor';Object.assign(out,RINGISLES.buildFloor(R,q));}
 BIO.cur=null;return out;};
RINGISLES.canopyH=function(x,z){return RINGISLES._canopyH?RINGISLES._canopyH(x,z):3;};
// every species the kit places, its own and the borrowed ones, with the tags it places them by (the borrowed: their own
// kit's tags with this kit's Koppen classes and zone)
RINGISLES.allSpecies=function(){const L=RINGISLES.SPECIES.map(S=>({key:S.key,name:S.name,kit:'ringisles',tags:S.tags}));
 RINGISLES.BORROW.forEach(Bo=>{const api=RINGISLES.kitOf(Bo),S=api&&api.SPECIES?api.SPECIES.find(s=>s.key===Bo.src):null;
  const t=Object.assign({},S?S.tags:{},{koppen:Bo.koppen,zone:Bo.zone,src:Bo.kit+':'+Bo.src});if(!t.origin)t.origin=S&&S.alien?'krator':'earth';
  if(!t.harvest)t.harvest=(api&&api.HARVEST&&api.HARVEST[Bo.src])||{wood:'none',edible:[],medicinal:false,notes:'',fruit:null};
  if(t.abyssal==null)t.abyssal=false;L.push({key:Bo.key,name:S?S.name:Bo.key,kit:Bo.kit,borrowed:true,present:!!S,tags:t});});
 return L;};
// a plain string so the host's inspector can name a borrowed tree's kit
RINGISLES.describeKey=function(key){const S=RINGISLES.byKey[key];if(S)return S.name;const Bo=RINGISLES.borrowOf[key];return Bo?Bo.key+' (the '+Bo.kit+' kit\'s '+Bo.src+')':key;};
// the functions the passes call a million times run in no registry (they put nothing): BIO.kitEnd leaves them unwrapped
['zones','classAt','burnAge','burnState','blocked','hadd','kitOf','leafCol','libCol','describeKey','plantOfItem','canopyH','_canopyH','means'].forEach(k=>{if(typeof RINGISLES[k]==='function')RINGISLES[k]._kit='-';});
BIO.kitEnd(RINGISLES);   // its exports run in its registry; the default kit is current again
