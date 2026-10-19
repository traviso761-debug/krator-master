# core/ports: a building marked where it is drawn

The Voth-lineage towns (Girder, Mav's Refuge) draw every building into town-wide buckets on their own kit
(`45-kit.js`: `BUCKET` for the instanced shapes, `MBK` for the merged triangles) and a town-wide catalog furniture
batch, so nothing in them is a building by itself. Their builders are functions of a site (a tower slot, a house lot, a
platform's sector): each town calls them through `PORT(kind, id, frame, fn)`, and this module notes what each call
added. The town draws exactly as before: nothing here draws, moves or copies, and no random number is drawn.

The marks are what the Beast Riders kit (`kits/beast-riders`) takes a building by: it seals the town's engine and its
builders into a closure, runs them as the town does (so every random number and furniture seed falls as in the town),
keeps the marked buildings it shows and moves each to the origin of its local frame. They are also what its check
measures a building in the town by (`window._ports` on the town's page).

```
var T = KPORT.create(acc)        // acc: { bucket(), mbk(), merged(), shape(name), placed(), hooks? }
T.mark(kind, id, frame, fn)      // fn()'s result; the mark { kind, id, frame, s, e } on T.marks
T.find({kind, id})               // the marks (a building drawn in several passes has several)
T.take(def)                      // the bucket records and merged triangles the marks added (before the kit is emitted)
T.box(def)                       // { min, max, inst, tris }: the fabric's box in def's local frame
T.furn(def)                      // the furniture records in that frame: { key, variant, lx, ly, lz, lry }
```

**The frame** `{ x, y, z, ry }` is the building's local frame: the origin is the centre of its footprint on its floor,
and `ry` turns its front (+z) to `(sin ry, cos ry)`, the catalog's `rotation.y` (kits/catalog: a piece's front is +z).
A builder in a FRM frame (55-arch.js: front `(fx, fz)`) has `ry = atan2(fx, fz)`.

**A clip** `def.clip { hx, hz }` keeps only what stands within `|x| <= hx` (and `|z| <= hz`) of the frame: an instance
by its origin, a merged triangle by its centroid. Girder's palisade rings the whole town in one pass; the kit takes a
stretch of it round a watch post or a gate this way.

Taken by `settlements/girder` and `settlements/mavs-refuge` (their `build.py` read the folder; `44-core-ports.js` sorts
before `45-kit.js`, which defines `PORT`), and through them by `kits/beast-riders`. Tag: `[draw]` (it reads three.js to
measure). After a change: rebuild the two towns and the kit, and run the kit's `verify.py --assert`, whose in-town check
reads this module on both sides.
