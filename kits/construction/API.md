# kits/construction API

```
KCONS.site({w, d, h, eaves?, plot?, bill?, palette?}) -> {group, set(f, onSite?), parts, f}
```
- `w`, `d`, `h`: the building's own box (metres), in the piece's frame (origin at its footprint's centre, +z its front).
- `eaves`: the scaffold's top (default 0.6 h). `plot`: the cleared ground's `[w, d]` (default the box and a metre round).
- `bill`: `{good: n}`, the goods to pile (one pile a good, in the bill's order, along the +x side); a good's pile kind is
  `KCONS.PILES[good]` (`logs`, `blocks`, `bundles`, else `crates`).
- `palette`: colours over `KCONS.PALETTE` (`earth`, `stake`, `string`, `pole`, `board`, `log`, `block`, `bundle`, `crate`).
- `set(f, onSite)`: `f` the work done (0..1): the scaffold shown while 0 < f < 1 and as high as the walls have risen,
  the plot and piles gone at 1; `onSite` `{good: share 0..1}` the materials still on site (default 1 - f).
- `parts`: `{plot, materials, scaffold, piles: {good: group}}`.

With core/city:
```
var C = KCITY.constructMesh(piece.parts);   // piece.parts: [{geo, mat}], a kit piece flattened
group.add(C.group); C.set(f);              // the first f of its triangles in build order
```
