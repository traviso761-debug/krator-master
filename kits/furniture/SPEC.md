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
| `kits/catalog/krator-furniture-kit.js` | the furniture kit `FK`: parametric role builders driven by a culture style sheet, and `FK.set()` |
| `kits/catalog/krator-master-furniture-<culture>.js` | the interiors-phase sets, one file per culture (731 pieces over 15 cultures plus the two generic poor sets); read `kits/catalog/README.md` "Furniture by culture" |
| `kits/catalog/krator-master-furniture-generic-goods.js`, `-generic-fruit.js` | 86 `generic` goods: containers, food, drink, supplies and biome fruit, sized to sit on the furniture; `kits/catalog/README.md` "Generic goods and biome fruit" |
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
                                // altar fountain statue planter rug screen banner art …
  tier: 'common',               // poor | common | court; wealth: [0.3, 0.75] follows (FURN_TIERS)
  setting: 'outdoor',           // 'indoor' | 'outdoor' | 'both'
  rooms: ['street', 'yard'],    // room kinds it belongs in (see interiors SPEC)
  w: 3.4, d: 1.0, h: 1.2,       // footprint and height in metres; variantDims if variants differ
  variants: 2, variantNames: ['plain', 'backed'],
  anchor: 'floor',              // floor | wall | ceiling | surface (on a table/shelf)
  clearance: { front: 0.8 },    // metres kept free for use (seating, doors, drawers): front back left right
  surface: false,               // optional: no flat top (a jar, a vat, a basket), so no piece is set on it
                                //   (tables, counters, shelves, desks and storage are surface hosts otherwise)
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

### Tiers, the generic sets and the kit (2026-10)

- **Tier.** `tier` and `wealth: [lo, hi]` say which rooms a piece suits (`FURN_TIERS` in the
  engine: poor 0–0.35, common 0.3–0.75, court 0.7–1). `FURN()` derives them when an entry leaves
  them out: `yuni-court` is court, `yuni-poor`, `generic` and `scrap` are poor, the rest common.
- **Poor is generic.** The poor tier is two culture-neutral sets, `generic` (plain wood) and
  `scrap` (post-apoc salvage); every culture's poor buildings fall back to them
  (`kits/interiors` `IX.CULTURE_FAMILY`). The common tier uses a culture's regional materials
  (bamboo, reed, hyper-mahogany, celadon, a little gold ...), the court tier is bespoke and
  culture-specific, with tapestries (`banner`) and wall art (`art`).
- **The kit.** A culture's standard roles are built by `FK.set()` from a style sheet of palette
  keys (`krator-furniture-kit.js`, header). A kit piece is still a `FURN` entry with every field
  above, built only through `F.*`; the kit ships with the registry, not the host, so a host that
  supplies `F` runs kit pieces unchanged. Bespoke pieces are plain `FURN()` calls.
- **Painted panels.** `F.decal(lx, ly, lz, w, h, ry, key, paint, family)` is a plane with a canvas texture
  painted once per key; the kit's hangings paint the culture's emblem with the socket packs' `SYMBOLS`
  (`core/sockets/38-symbols.js`, vendored as `kits/catalog/krator-symbols.js`). A paint function uses CSS
  colours from palette keys (`F.css(F.col(key))`) and its own seeded stream (`FK.paintRng`).
- **Palettes.** A culture file registers its palette with `FURN_CULTURE(key, { palette })`
  between `/* PALETTE */` and `/* END PALETTE */`: the one place a literal colour may appear.
  `verify.py` asserts no literal anywhere else, kit included.
- **Materials by culture** (the user's brief): generic wood and generic scrap for the poor;
  nacre and mother-of-pearl for Hykkousoi (palette only, not built yet); hyper-mahogany for Iziz
  and the Beast Riders; bamboo for Republicans, Rustic Highlanders and the north-western cultures
  still to be defined; reed for Reed Lake and the East Abyss; a little gold for middle-class
  Xanadu. The canonical names are in `CATALOG_MATERIALS`.

## Rules

- **Tagging.** Every piece has one `culture`, one `type` and one `tier`. `setting` separates
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

The catalog already has the shape this kit was going to take: one file per culture
(`kits/catalog/krator-master-furniture-<culture>.js`), a shared kit, a sheet and a verifier.
When the kit moves here, those files move with it:

```
kits/furniture/
  src/            one file per culture (today kits/catalog/krator-master-furniture-<culture>.js)
  kit.js          the role builders (today kits/catalog/krator-furniture-kit.js)
  host/           adapters exposing F for each engine lineage
  build.py        builds dist/furniture.html, the catalogue sheet
  verify.py       headless audit of declared sizes and tags
```
