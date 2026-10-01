# settlements/locus — API

The builders' helpers are listed in `LOCUS-KIT-NOTES.md` (the `LOCUS.*` helpers, `64-locus-core.js`) and
`ABYSS-KIT-NOTES.md` (the `ABYSS.*` helpers, `65-abyss-00-core.js`). This page holds what both kits share.

## Furniture

Everything a kit building (`64-locus-*`, `65-abyss-*`) puts in or around itself that is not its structure or an
outbuilding is **furniture**: a master-catalog piece (`kits/catalog`), placed as data on the building and built by the
catalog's own code. Nothing in the two kits draws furniture any more, and the kits register no `FURN` of their own
(the 27 abyss pieces of the old `65-abyss-10-furniture.js` live in the catalog,
`kits/catalog/krator-master-furniture-eastabyss.js`, with the same keys).

The build carries two GENERATED fragments as one virtual file, `65z-furniture-bundle.js` (never in `src/`;
`build.py` `virtual_bodies()`): `kits/catalog/furniture_bundle.py` `bundle(['eastabyss', 'nomad', 'reedlake',
'generic', 'scrap', 'jobs'], harvested=True)` (scrap for `pa_drum`, the standing oil drum; `jobs` for the catalog's work
items, `kits/catalog/krator-master-furniture-jobs.js`: the lying oil drums, the farm's sheaf racks, winnowing tub and mat,
salt heap and tubs, the warehouse's bales, the dock's net frames and fish tray) (the single global `KratorFurniture`; the harvested registry carries the Yuni pieces,
`yuni_<culture>_<name>`) and `kits/interiors/kit_bundle.py` `bundle(['locus', 'abyss'])` (`KratorInteriors`,
`ROOM`, `furnishRoom` and the two interior sets). The glue is `src/66-locus-furnish.js`.

```js
FURNISH(key, lx, ly, lz, lry, { v, seed, setting, lamp })   // inside a builder, in its LOCAL frame -> the record
furnishAt(F, key, lx, ly, lz, lry, o)                       // the same, in frame F (helpers that hold F)
ABYSS.furn(F, key, lx, lz, yaw, { ly, variant, seed, setting })   // the Abyss kit's spelling (65-abyss-00-core.js)
ABYSS.lantern(F, x,y,z, lit, amp)  LOCUS.lantern(F, x,y,z, amp, rad)  // the hung oil lantern: abyss_hanging_lantern
```

- **The origin** is the catalog piece's footprint centre on the floor (`ly` up from the ground). `ABYSS.furn` takes the
  origin the kit drew its own pieces at and corrects the few the harvest re-centred (`ABYSS.SHIFT`).
- **The record** `{ key, variant, seed, lx, ly, lz, lry, x, y, z, ry, building, part, setting }` goes on the frame
  (`F.furniture`) and on the building's record: `buildAsset(...).furniture` (the world's `PLACED`, the sheet's
  `SHEET_ITEMS` builds). `part` names a sub-asset (`ABYSS.sub` / `LOCUS.sub`) the piece was placed from. Every record is
  also in `LOCF.placed` (`window._locf`).
- **setting**: `'outdoor'` (default), `'indoor'` (inside, where the interior set plans no room: the library's reading
  crescents), `'room'` (in an OPEN room the interior set plans: a stall under a sail, the tavern deck, the open tent):
  such a piece is placed only while the interiors do not furnish that building, so `?interiors=1` never doubles it.
  Furniture that stood inside an ENCLOSED planned room was deleted (the interiors furnish it). The tents' polychrome rugs
  (`eastabyss_tent_rug`) are the hall's floor covering: `'indoor'`, so they stay under the interiors' pieces.
- **Lights**: a piece's lights (catalog `F.lamp`, kept as data) become this engine's night lamps (`nlLampAdd`);
  `lamp: [amp, radius]` overrides them (the lanterns keep the amp and radius they had).
- **Batch**: `KratorFurniture.batch()` at detail `0.5`, flushed ONCE into the scene when the kit emits its instances
  (`emitBuckets`, 75-terrain.js); the merged meshes take the night-glow hook. `window._furniture` =
  `{ placed, deferred, missing, meshes, tris, interiors, noItem }`.
- **The inspector** labels every placed piece (`kind: 'furniture'`, `furniture · catalog · culture: ... · key ...`).
- **`?interiors=1`**: after a TOP-LEVEL building is placed (`buildAsset` with nothing on the frame stack), its interior
  set item — `<key>` for variant 0, `<key>#<variant>` for any other, NEVER the base item for a variant > 0 (its rooms are
  measured on variant 0's body) — when it has no `skip`, is planned and furnished there through
  `KratorInteriors.sets.furnish(item, x, z, ry, KratorInteriors.runtimeAdapter(KratorFurniture, batch), { baseY, prefix })`;
  the summary is `buildAsset(...).interior = { item, rooms, pieces, residence }` and `LOCF.buildings`. A top-level
  building that gets no interior is counted in `LOCF.unfurnished` by why (`LOCF.why(key, v)`): `skip` (its item says so,
  or the key's base item skips it as a whole: a jetty, a prop), `noItem` (a variant > 0 of a key whose base item plans
  rooms, with no `#n` item of its own: a gap in the set; the total is
  `window._furniture.noItem`, 0 on all three pages), `none` (a key with no item). `LOCF.item(key, v)` /
  `LOCF.itemOf(key, v)` look the item up the same way. Every multi-variant kit building has its `#n` items
  (`kits/interiors/sets/locus.js`, `abyss.js`) or a `skip`. Off by default.
- **`?furniture=0`** builds no furniture; the records are still kept.
- A key the catalog lacks is counted in `LOCF.missing` (`window._furniture.missing`), never thrown.
- `ABYSS.burn(F, n)` / `LOCUS.burn(F, n)`: where inline drawing that drew colours from `F.rnd()` became a catalog piece,
  the builder drops the same count, so its later random choices (the structure) do not shift.
