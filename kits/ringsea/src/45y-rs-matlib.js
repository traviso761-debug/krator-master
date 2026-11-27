// ---------------------------------------------------------------- the material library (core/materials/PLAN.md)
// materials.json names, per RSMAT key, the library set; tools/textures/pack.py packs them into tex/ and build.py inlines
// them (45x-matlib-pack.js). KMAT.bindMat (core/materials/record/26-matlib-bind.js) swaps the maps in place before any
// vessel is built. Ring Sea's UVs are in tiles (rsUV: one UV unit is one procedural tile, 2 to 4 m by piece), so every
// key binds at a tile of 1 and materials.json's scale is in UV units: one procedural tile shows 1/scale set tiles, which
// keeps the feature count (16 strakes, 8 thatch courses, 8 hexes across). The painted grain and the per-vessel sails stay
// procedural. ?mat=proc binds nothing: the look before the library. [web]: three.js materials.
const RS_MATLIB_BOUND=KMAT.bindMat('ringsea',RSMAT,{alias:{woodI:'wood',paktong:'metal'},
 tile:{wood:1,woodI:1,cloth:1,thatch:1,tile:1,hex:1,chitin:1,ancient:1,bronze:1,hullpaint:1,
  metal:1,paktong:1,rope:1,tarwood:1,jade:1,brick:1,hide:1,bone:1,stone:1,glaze:1,silk:1}});
