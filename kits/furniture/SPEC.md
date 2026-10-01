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
| `kits/catalog/krator-master-furniture.js` | 122 `FURN({...})` pieces, harvested from six builds plus the 2026-10 interior set. **Start here.** |
| `settlements/yuni/src/63-furniture.js`, `53-assets.js` | Yuni's own `FURN` seed set (same shape as the catalog) |
| `settlements/yuni/src/61e-ancients-furniture.js` | Ancients furniture ported into Yuni |
| `settlements/screamers/src/70c-furniture.js` | a different shape: `FURN.bunk(x,y,z,rot,s)` built from kit items |

Standardise on the catalog's `FURN({...})` shape and port the Screamers pieces into it.

**The catalog now conforms to "The entry" and to the rules below.** All 122 pieces carry `type`, `setting`,
`rooms`, `anchor`, `clearance` and `materials`, build only through `F.*` (`F.shade`, `F.TAU`), and name every
colour as a palette key (`FPAL` in `kits/catalog/krator-asset-engine.js`). `kits/catalog/verify.py --assert`
checks every field, that each piece builds within its declared `w × d × h` centred on the origin, that its
anchor's geometry holds (below), and the style rules. Canonical material names are `CATALOG_MATERIALS` in
`kits/catalog/krator-asset-engine.js` until the core registry exists.

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
  clearance: { front: 0.8 },    // metres kept free for use (seating, doors, drawers): front back left right
  materials: ['timber'],        // canonical names from the material registry (core/README.md)
  build(F) { … }                // origin = footprint centre on the anchor plane, +z = front
});
```

Compared with the catalog as first harvested: `room` became `rooms` (an array),
and `type`, `setting`, `anchor`, `clearance` and `materials` are new. Each is
needed by interior placement or by the Blender export. The catalog has them all
now. Every piece is authored in the floor frame; `anchor` says where a placer
mounts it (`kits/catalog/README.md`, and `furnAnchorY()` in the engine).

### Frame, anchor and clearance

- **Frame.** Origin at the footprint centre on the anchor plane, `+z` the front, `-z` the back.
- **Anchor.** `floor`: stands on the floor. `wall`: stands at floor level with its back (local `z = -d/2`)
  flush to a wall; real geometry lies on that plane (or, for a leaning piece such as a ladder, touches it at
  the top) and nothing lies behind it. `ceiling`: hangs with its top (local `y = h`) at the ceiling, so the
  piece reaches `y = h`. `surface`: stands on a table, counter or shelf top, its lowest point at `y = 0`.
  `kits/catalog/verify.py` audits all four.
- **Clearance** is metres kept free beyond the footprint on each side named, in the piece's frame:
  `front` is local `+z`, `back` local `-z`, **`left` local `-x` and `right` local `+x`**. Left and right are
  as seen by someone standing in front of the piece and facing it (the viewer's left), which is the piece's
  own right-hand side. `kits/interiors` uses the same convention (`API.md`). `{}` means nothing needs
  keeping clear.

## Rules

- **Tagging.** Every piece has one `culture` and one `type`. `setting` separates
  indoor, outdoor and both.
- **No host globals.** A piece builds only through `F.*`, never `kput`, `BOX`,
  `FAMMAT` or `MAT` directly, and its helpers are `F.shade` and `F.TAU`, not the
  bare `shade` / `TAU`. The host supplies `F`, so the same piece works in
  a Voth-lineage build and an Ancients-lineage build.
- **Colour.** A piece names its colours as palette keys of its culture —
  `F.col('timberOak')`, `F.cols([...])`, `F.pick(['clothMadder', 'clothIndigo'])`,
  `F.shade('brass', 0.1)` — and the host owns the colours (`FPAL[culture]` in the
  catalog engine). No literal colours or literal colour arrays, matching Voth's
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
