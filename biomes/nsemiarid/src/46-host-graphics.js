// ================================================================= HOST — the graphics set, before the kit (the final rebuild, 2026-11-03, pair 9)
// BACKPORT.md section 1 (nhighlands' and ebadlands' lines): welded items, one mesh a chunk, the cross-fade, chunks off screen dropped. The
// kit's own floor sets no runtime range (its bands are densities), so the LOD switches change nothing on this page today; they are set so
// a pass that takes BIO.range gets them. Its own fragment, after the stage (45b), so an overlay that shadows the stage (biomes/scablands)
// takes it too. ?index=0 ?lodmerge=0 ?lodfade=0 ?lodcull=0; ?bodies=leaf draws the solid bodies (the bead chains, the striders, the sail
// columns, the maces, the horn pipes) with the old still leaf material (50-biome-nsemiarid-species.js, libMat)
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';
 BIO.host.bodyLeaf=q.get('bodies')==='leaf';}
