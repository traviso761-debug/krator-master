# Voth building catalog — builder brief

You are adding new building types to the Voth building catalog. Voth is a
Venice/Vivec-like Dunmer city on an enclosed brackish volcanic bay (think
Morrowind: Vivec, Balmora, Mournhold, Tamriel Rebuilt's Velothi towns). The
catalog is a set of registry files, each a list of `ASSET({...})` calls, drawn
by a small Three.js engine. Every building is a procedural `build(F)` function.

## Read first (in this order)

1. `voth/Claude outputs/krator-asset-engine.js` — lines 1–30 (the conventions)
   and `makeFrame()` (the whole `F` API). Everything you may call is on `F`,
   plus the global `shade(hex, amt)` and `TAU`.
2. `voth/Claude outputs/krator-master-buildings-voth.js` — the first-generation
   Voth registry (13 entries). Its header's house rules are binding. Read at
   least the townhouse, the tavern and the guild hall in full: that is the
   quality bar and the idiom (local helper closures for windows, shutters,
   doors, chimneys; every elevation detailed).
3. `voth/src/05-palette.js` — the city's palette. Take your colours from
   `PAL.stone.common` / `.poor` / `.marble` / `.basalt` / `.jade` / `.lapis` /
   `.porphyry`, `PAL.roof`, `PAL.dome`, `PAL.banner`, `PAL.sail`. Copy the
   hex values into your build's local `const` arrays (the registry files
   cannot see `PAL`). Stay in this ashen, low-saturation family.
4. `voth/catalog/lod.js` header — how LOD is made from your geometry.

## Reference images

`voth/catalog/inspo/` — view them with the Read tool:

| file | what to take from it |
|---|---|
| 13a8df8d-image.png | Mournhold-style garden quarter: battered drum towers, blue-tiled conical/domed roofs with trim bands, spires, curving parapet walks, bridges |
| 953bf9ba-image.jpg | Hlaalu hill town (Balmora-like): stacked boxy stone storeys, green copper hip roofs with wide eaves, pagoda tower, stairs and bridges |
| f1af3c26-image.jpg | Hlaalu harbour town: flat-roofed blocks with parapets, a dome, stairs down to quays |
| 216cd10e / 2048c042 | Old Ebonheart (TR): tall square towers with vertical slit windows, domed halls, arcaded sea wall, colosseum drum |
| 0781ba2e-image.jpg | Velothi/Temple: tall battered stepped tower with inset stair, dome, pylons with capped tops |
| b01e7622-image.png | Tamriel Rebuilt Velothi fort on water: squat battered masses, pylon piers with small cap roofs, bridge on piers, big ribbed dome |
| 105d55d3-image.png | Vivec-like cantons at night: terraced battered masses, grand stair axes, arched gates, domes, lit openings |
| 4aea0221 / d77779a2 | Mournhold/Almalexia: quilted domes over drums with window bands, tiled mosaic walls, calligraphy bands, statues on plinths, arched entries |
| e6db2a97-image.jpg | Vivec Ministry of Truth: pointed-arch buttressed pylons, plazas with statues |
| 62367eb3-image.jpg | Velothi town in a valley: boxy flat-roofed houses with small towers, canals |
| 2d41bba1-image.jpg | ESO Hlaalu (Narsis): tall towers with flared tiled eaves, pagoda caps, pointed windows, mushroom trees |
| 30d2f3f8 / 7479e62c | Morrowind concept art: Ghostgate domes, Vivec cantons with flat roofs and sunken lanes |
| d94a71fb-image.jpg | Mournhold/Balmora sprawl: green-roofed Hlaalu houses, ring walls, a canal island shrine |

Voth's own vocabulary (already in the city): **Hlaalu** — stacked flat-roofed
blocks, cornices, parapets, timber balconies and canopies, green/terracotta
low hip roofs; **Velothi** — battered (tapering) stone towers and masses,
small domes and cone caps, pylons; **domed** — a block carrying a hemisphere;
**hovel** — crude box with a lean-to.

## Hard requirements

* **Flat-roofed residential and shop buildings use the upper floor.** The top
  storey (or roof level) is visibly lived in or used for storage: a roof
  room / loft with its own door and windows, stairs or a ladder up to it,
  a parapet, and **an upper awning or canopy is common** (cloth on timber
  poles, a pergola, a shade sail) — shading a roof terrace, a loft door, a
  balcony, or storage (crates, jars, drying racks, rolled rugs, a water
  cistern). Not every variant, but most.
* **Every elevation is detailed** — the catalog is orbited and walked around.
  Doors are real (surround, leaf, threshold, step); windows have reveals or
  sills; big blank walls get courses, pilasters, buttresses or openings.
* **Things sit on the ground and touch what they rest on.** Nothing floats;
  nothing intersects visibly. Roofs cover their walls. Stairs reach both ends.
* **Declared size = measured size.** `w/d/h` (and `variantDims` per variant)
  must match what you build within ~5%. `shoot.py --audit` checks it.
* **LOD is automatic** from part size (see `lod.js`): lay the big masses as
  big primitives, then detail on top. Never build a wall out of many small
  bricks. Nothing to write per building.
* **Roofs**: `F.hipRoof` for any roof that is not square (it has a ridge); `F.pyrRoof` only on square plans. `F.beam` slabs are rotation-safe, so sloped canopies and lean-tos can be beams.
* **Scale**: metres. A storey is ~3–3.5 m, a door ~2.2–2.8 m, a person 1.7 m.
* **Variation**: variants should differ in plan, massing and silhouette, not
  just colour. Use `F.variant` for the designed variant, `F.rnd()/F.rr()/
  F.pick()/F.chance()` for seed jitter, and `F.wealth` (0..1) where useful.
* **No top-level declarations** in a registry file other than `ASSET(...)`
  calls (files are concatenated into one global scope). Helpers go inside
  `build`, or inside an IIFE: `(function(){ ...helpers...; ASSET({...}); })();`
  — an IIFE shared by all entries in your file is the recommended pattern.
* Every entry: `culture: 'voth'`, `source: '<your file stem>'`,
  key prefix `voth_` (e.g. `voth_shop_smithy`), sensible `family`
  (`housing`, `shop`, `tavern`, `civic`, `industrial`, `military`, `rural`,
  `religious`), `districts` and `wealth` range, and a one-line `blurb`
  describing it.
* Colour families: pass `'wood'`, `'stone'`, `'metal'`, `'glass'`, `'glow'`,
  `'cloth'` as the family arg — only `metal`, `glass` and `glow` change the
  material; the rest are labels (keep using them, they document intent).

## Tools

```
cd voth/catalog
python3 shoot.py --audit --src <your file stem>     # errors, sizes, tris per LOD level
python3 shoot.py --src <your file stem>             # 2x2 sheet per variant -> shots/
python3 shoot.py voth_shop_smithy --v 1 --lod       # one variant + L0|L1|L2 strip
```

Then **look at every sheet with the Read tool.** Invariants cannot see a roof
floating half a metre above its walls or an awning pole standing in a doorway;
only the shots can. Do at least two look-and-fix rounds per entry. The first
render of anything is never right.

A syntax error in your file shows as a `CONSOLE ... SyntaxError` line and your
entries silently vanish from the audit — check the entry count.

## Hand-back

Reply with: the keys you added (and variants each), one line per variant on
what distinguishes it, the final `--audit` output for your file, anything you
could not get right, and the names of the shot files that best show your work.
Do not edit any file outside the ones you were assigned. Do not commit.
