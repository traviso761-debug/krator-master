# kits/construction API

```
KCONS.site({w, d, h, eaves?, plot?, bill?, palette?, mats?}) -> {group, set(f, onSite?), parts, f, eaves}
```
- `w`, `d`, `h`: the building's own box (metres), in the piece's frame (origin at its footprint's centre, +z its front).
- `eaves`: the scaffold's top (default 0.6 h). `plot`: the cleared ground's `[w, d]` (default the box and a metre round).
- `bill`: `{good: n}`, the goods to pile (one pile a good, in the bill's order, along the +x side, its near end half a metre
  past the scaffold); a good's pile kind is `KCONS.PILES[good]` (`logs`, `planks`, `blocks`, `bricks`, `heap` (sand, lime, clay, shells), `slabs` (nacre, tiles, slate), `bundles`,
  `coils`, else `crates` under a tarp).
- `palette`: colours over `KCONS.PALETTE` (`earth`, `stake`, `string`, `pole`, `board`, `log`, `block`, `bundle`, `crate`,
  `brick`, `sand`, `rope`, `canvas`): each site makes its own Lambert materials from them.
- `mats`: a material table of the same keys, shared by every site (wins over `palette`): `KCONS.libMats()`.
- `set(f, onSite)`: `f` the work done (0..1): the scaffold shown while 0 < f < 1 and as high as the walls have risen, the
  ladder's rails as long as the scaffold is high (the rungs above them hidden), the plot and piles gone at 1; `onSite`
  `{good: share 0..1}` the materials still on site (default 1 - f). Returns the site.
- `parts`: `{plot, materials, scaffold, piles: {good: group}, ladder}`. Every mesh is named and carries `userData.cons` (its
  palette key) and `userData.consPart` (`plot`, `pile`, `scaffold`, `ladder`); a pile group carries `userData.good` and `kind`.
- World-unit UVs: one UV unit is a metre on every box, pole, bundle, heap and coil.

```
KCONS.libMats(pack = 'construction', {palette}?) -> {key: MeshStandardMaterial}     (src/20-cons-lib.js, opt-in)
KCONS.LIB_ALIAS = {stake: 'crate', log: 'pole', string: 'rope'}
```
The page must carry core/materials/record (`KMAT`, `KMAT.bindMat`) and the kit's pack
(`tools/textures/matlib_pack.fragment(kits/construction, 'construction')`). Each key with a family (its own or its alias)
takes the set's maps and goes white; the rest keep the palette's colour. `T._bound` lists the keys bound. In `?mat=proc` nothing is bound.

With core/city:
```
var C = KCITY.constructMesh(piece.parts);   // piece.parts: [{geo, mat}], a kit piece flattened (isleFlatten)
group.add(C.group); C.set(f);              // the first f of its triangles in build order
```
A stage's f off the piece's own order: `KCITY.constructKeys(parts).all` (sorted keys; below 1 the footing, below 2 the walls,
then the roof): the sheet's `stageF` (`src/80-cons-sheet.js`).

The sheet's `window._api` (verify.py): `rows()`, `cells()`, `floats(tol)`, `zfight()`, `determinism()`, `tags()`, `lib()`,
`errors()`, and the probe's fields (core/host 95).
