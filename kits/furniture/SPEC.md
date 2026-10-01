# kits/furniture/ — spec (scaffolding only)

Nothing is built here yet. This file fixes the contract, so furniture made
before the kit exists can be written in a form that will fit it.

## Goal

One furniture kit that any settlement can pull pieces from without reaching
into another settlement's code. This follows the repo README: tag by culture and
type, and count outdoor fixtures (fountains, statues, benches) as furniture.

## Where the pieces are now

| Source | Format |
|---|---|
| `kits/catalog/krator-master-furniture.js` | 84 `FURN({...})` pieces, harvested from six builds. **Start here.** |
| `settlements/yuni/src/63-furniture.js`, `53-assets.js` | Yuni's own `FURN` seed set (same shape as the catalog) |
| `settlements/yuni/src/61e-ancients-furniture.js` | Ancients furniture ported into Yuni |
| `settlements/screamers/src/70c-furniture.js` | a different shape: `FURN.bunk(x,y,z,rot,s)` built from kit items |

Standardise on the catalog's `FURN({...})` shape and port the Screamers pieces into it.

## The entry

```js
FURN({
  key: 'voth_bench',            // unique, <culture>_<name>
  name: 'Street Bench',
  culture: 'voth',              // one culture from the list below
  type: 'bench',                // table chair bench bed storage shelf lamp stove
                                // altar fountain statue planter rug screen …
  setting: 'outdoor',           // 'indoor' | 'outdoor' | 'both'
  rooms: ['street', 'yard'],    // room kinds it belongs in (see interiors SPEC)
  w: 3.4, d: 1.0, h: 1.2,       // footprint and height in metres; variantDims if variants differ
  variants: 2, variantNames: ['plain', 'backed'],
  anchor: 'floor',              // floor | wall | ceiling | surface (on a table/shelf)
  clearance: { front: 0.8 },    // metres kept free for use (seating, doors, drawers)
  materials: ['timber'],        // canonical names from the material registry (core/README.md)
  build(F) { … }                // origin = footprint centre on the anchor plane, +z = front
});
```

Differences from the catalog as it stands: `room` becomes `rooms` (an array),
and `type`, `setting`, `anchor`, `clearance` and `materials` are new. Each is
needed by interior placement or by the Blender export.

## Rules

- **Tagging.** Every piece has one `culture` and one `type`. `setting` separates
  indoor, outdoor and both.
- **No host globals.** A piece builds only through `F.*`, never `kput`, `BOX`,
  `FAMMAT` or `MAT` directly. The host supplies `F`, so the same piece works in
  a Voth-lineage build and an Ancients-lineage build.
- **Colour.** A piece takes colours from the host palette through `F.pick(...)`
  or named palette keys. No literal colour arrays, matching Voth's
  `05-palette.js` rule.
- **Deterministic.** Randomness only through `F.rr`/`F.pick` (seeded per
  instance), so a placed piece looks the same on every load.
- **Declared size is true.** `inspector.js`'s audit must pass: the built geometry
  fits `w × d × h`.

## Layout when it is built

```
kits/furniture/
  src/            one file per culture: 10-voth.js, 20-beast-rider.js, …
  host/           adapters exposing F for each engine lineage
  build.py        builds dist/furniture.html, the catalogue sheet
  verify.py       headless audit of declared sizes and tags
```
