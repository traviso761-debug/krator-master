/* ============================== kits/construction: THE LIBRARY'S MAPS FOR THE SITE (2026-11-09) ============================== */
/* [web] Opt-in: one table of MeshStandardMaterials (KCONS.PALETTE's keys) with the material library's maps bound, shared by
   every site a host draws (KCONS.site({..., mats: T})). A host that does not call it keeps the plain palette colours, and a
   host that does not load this fragment pays nothing (the isle demo reads 10-cons-site.js alone).
     KCONS.libMats(pack?, opt?) -> {key: material}   pack: the KMAT pack the host registered from kits/construction/tex
                     (tools/textures/matlib_pack.fragment(kits/construction, 'construction')), default 'construction';
                     opt.palette: colours over KCONS.PALETTE for the keys the pack has no family for. Each key bound to a
                     family (its own, or KCONS.LIB_ALIAS's) takes the set's colour, normal and roughness maps through
                     core/materials' KMAT.bindMat (a metre a UV unit: 10-cons-site.js gives every box and pole world-unit
                     UVs), and its colour goes white (the families keep the sets' own colours: materials.json, tint keep 1).
                     Without KMAT, in ?mat=proc, or a key without a family: the palette's colour on a standard material.
                     T._bound is {key: library set} for the keys bound.
     KCONS.LIB_ALIAS  a key drawn with another key's family (stake -> crate, log -> pole, string -> rope) */
KCONS.LIB_ALIAS = { stake: 'crate', log: 'pole', string: 'rope' };
KCONS.libMats = function (pack, opt) {
  'use strict';
  pack = pack || 'construction'; opt = opt || {};
  var pal = Object.assign({}, KCONS.PALETTE, opt.palette || {}), T = {}, tile = {};
  Object.keys(pal).forEach(function (k) { T[k] = new THREE.MeshStandardMaterial({ color: pal[k], roughness: 0.95, metalness: 0 }); T[k].name = 'cons.' + k; tile[k] = 1; });
  T.canvas.side = THREE.DoubleSide; T.sand.side = THREE.DoubleSide;   /* the tarp is thin; the heap is an open cone */
  var bound = (typeof KMAT !== 'undefined' && KMAT.bindMat) ? KMAT.bindMat(pack, T, { tile: tile, alias: KCONS.LIB_ALIAS }) : {};
  Object.keys(bound).forEach(function (k) { T[k].color.setHex(0xffffff); });
  Object.defineProperty(T, '_bound', { value: bound, enumerable: false });
  return T;
};
