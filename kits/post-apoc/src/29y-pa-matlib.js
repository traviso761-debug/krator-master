// ---------------------------------------------------------------- the material library (core/materials/PLAN.md)
// materials.json names, per MAT key, the library set; tools/textures/pack.py packs them into tex/ and build.py inlines
// them (29x-matlib-pack.js). KMAT.bindMat (core/materials/record/26-matlib-bind.js) swaps the maps in place before any
// building is made, at TILE[key] metres per UV unit (20-tex.js), so each set shows at its own size. A bound key drops its
// procedural bump map (the set's normal map replaces it). The rusty metals (corr, corrH, cont, sheet, iron), steel, bottle and chain stay
// procedural. ?mat=proc binds nothing: the look before the library. [web]: three.js materials.
const PA_MATLIB_BOUND=KMAT.bindMat('postapoc',MAT,{tile:TILE});
for(const k in PA_MATLIB_BOUND){MAT[k].bumpMap=null;MAT[k].bumpScale=1;}
