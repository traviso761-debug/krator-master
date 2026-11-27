// ================================================================= SHROUDHILLS — public BIOME-API build surface [G data]
// Orders the deterministic placement passes (54 host trees -> 55 Sister-Cups, Root-Hammocks, Drum-Galls/Shroud-Ants, Cloak-Tors)
// and closes BIO.kitEnd(SHROUDHILLS).
SHROUDHILLS.build = function(opt){
 opt = opt || {};
 var R = opt.R == null ? 1100 : opt.R;
 var q = opt.quality == null ? 1 : opt.quality;
 var out = { R: R, quality: q };

 BIO.cur = 'shroudhills/trees';
 Object.assign(out, SHROUDHILLS.buildTrees(R, q, opt));

 BIO.cur = 'shroudhills/epiphytes';
 Object.assign(out, SHROUDHILLS.buildSisterCups(q));
 Object.assign(out, SHROUDHILLS.buildRootHammocks(q));
 Object.assign(out, SHROUDHILLS.buildDrumGallsAndAnts(q));

 BIO.cur = 'shroudhills/floor';
 Object.assign(out, SHROUDHILLS.buildCloaksAndFloor(R, q));

 BIO.cur = null;
 return out;
};

SHROUDHILLS.dress = function(trees, opt){
 opt = opt || {};
 return { dressed: trees ? trees.length : 0 };
};

SHROUDHILLS.canopyH = function(x, z){
 var best = 0;
 var list = SHROUDHILLS.TREES || [];
 for (var i = 0; i < list.length; i++) {
  var T = list[i];
  if (Math.hypot(x - T.x, z - T.z) < T.crownR + 2) {
   best = Math.max(best, T.y0 + T.H);
  }
 }
 return best > 0 ? best : BIO.terrainH(x, z) + 1;
};

BIO.kitEnd(SHROUDHILLS);
