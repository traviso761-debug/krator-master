# core/furnish: one furniture glue

Every build that dresses its buildings with catalog furniture used to carry its own copy of the same glue: a
`FURNISH(...)` that turned a builder's local call into a placement record, counted missing keys, handed the piece to
the catalog's batch, ran the interiors hook, and fixed the batch's colours when it became meshes. Six near-copies, each
mixing the record pass with the three.js draw (GODOT-PLAN.md Phase 2 item 4). This module is that glue once, split the
way the port needs it:

| Fragment | Tag | What |
|---|---|---|
| `50-core-furnish.js` | [G data] | `KFURN.create(cfg)`: the registry and the **placement pass**. The record, missing keys, the catalog's recentring table, ids, jobs, the interiors hook (`R.interior`), the summary. No THREE, no DOM: it runs in node |
| `52-core-furnish-draw.js` | [draw] | the draw adapter's shared parts: a record into the catalog batch (`KFURN.drawRec`, with an optional detail level), `KFURN.useBatch`, and the two sRGB-to-linear colour steps (`KFURN.srgbHook` in the shader, `KFURN.linearColours` into a float attribute) |
| `scale/54-core-furnish-scale.js` | [G data] | **opt-in** (in a subfolder: Girder, Mav's Refuge and Highlands take every numbered file of this folder, so a fragment here would join their pages) per-culture scale (`KFURN.SCALE`: tungang and glazier 0.94, khaayken 1.15): `scaleOf`, `scaleRec` (sets `rec.s`), `scaleAdapter` / `adapterFor` (an interiors adapter whose pieces are s times the size: dims, tops, lights, the built object scaled about its placement point). A page takes it by listing it after `50`; no page that does not list it changes. Taken by the interiors sets sheet (2026-11-11). `node core/furnish/scale/test-furnish-scale.js` |
| `53-core-furnish-host.js` | [web] | `KFURN.flags(interiorsByDefault)`: `?furniture=0` and `?interiors=1` (or `=0` where they are on by default) |
| `test-furnish.js` | | the node test: a fixed list of calls against a stub catalog, checked field by field and by digest |
| `fingerprint.py`, `fingerprint.json` | | every furnished page's furniture fingerprint (below) |

## Who takes it

| Build | Glue | Its adapter keeps |
|---|---|---|
| Girder | `src/53-furnish.js` (`GFURN`) | seed = place in the list; 3-decimal rounding; walk-mode solids; piece lights into the night volume; decal merge |
| Mav's Refuge | `src/53-furnish.js` (`BRF`) | seed = a hash of the spot; `BRF_SHIFT` (the catalog's recentring, now `cfg.shift`); `o.lamp` lights; Lambert tint per family |
| Locus | `src/66-locus-furnish.js` (`LOCF`) | seed = frame seed and spot; `setting:'room'` deferred to the interiors; inspector entries; the interior-set item per variant |
| Highlands, Roketstad | `src/89y-hl-furnish.js` (`HLF`) | seed = place in the list; full detail outside; the murals' keep-clear boxes; world-placed town furniture |
| Post-Apoc | `src/91f-furnish.js` (`PAF`) | seed = building seed and place in its list; the matrix frame and `ax`/`az` anchors; colliders; lights as halos; dry runs (`frontOf`); a fresh batch per world |

The sixth copy in the plan's count, the catalog's own `F.furn` (`kits/catalog/krator-furniture-core.js`), builds
each piece into its building's group at once rather than batching it; it keeps its own code for now (its records
have the same shape).

Each build lists the three fragments the way it lists `core/lod` (its `build.py`; a `src/` copy of the same name
overrides, and an override goes in its `KNOWN_ISSUES.md`).

## The record

`{ id, key, variant, seed, lx, ly, lz, lry, x, y, z, ry, building, part?, setting, room, job, scale? }`

- `id`: `furn_00001`, in placement order (deterministic, as Yuni's fixture ids are). A dry run's records get none.
- `x y z ry`: the world transform; `ry` is three's rotation.y (the piece's front, +z, turns to (sin ry, cos ry)).
  `lx ly lz lry`: the same in the builder's frame, or null for a piece placed in world space.
- `building`: the building's key or id as the build names it; `part`: a sub-building (Locus); `room`: an interior room id.
- `job`: the catalog's (`FURN_JOBS`), or null.

This is the shape `core/tags` will register as class `furniture` (Phase 2 item 3) and the exporter will write.

## Scale (opt-in)

`cfg.scale` (a number, or `function(key, entry, o, ctx)` returning one; `o.scale` overrides it for one call) draws a piece that many
times its catalog size about its foot: a people larger than human furnishes its rooms with goods its own size (kits/yeti, the
Khaayken's 1.15x: its `src/91g-yt-furn.js` scales every piece but its own culture's and the Eternian loot). A scaled record carries
`scale`; a record at 1 carries no such field, so a build without `cfg.scale` writes the records it always did (`fingerprint.py`
reads `same`). `KFURN.drawRec` scales the piece's group about (x, y, z) before the batch takes it, and moves its lights with it;
the core/tags record's `size` is the drawn size. `test-furnish.js` checks it beside the digest, which it leaves unchanged.

## Tags

With `cfg.tags` (a `KTAGS.create` registry) every record the placement keeps (not a dry run, not one `onRecord`
defers) is also registered in core/tags as class `furniture`, before it is drawn (`KFURN.tag`; `core/tags/README.md`).
The furniture record itself is unchanged, so the fingerprint is too. All five builds pass it (2026-10-05).

## Seeds

A build's seed rule decides how each piece looks (its variant details, wear, colours), so the module does not pick
one: `cfg.seed` is the build's own. Five rules exist today. Moving a build onto `KRAND` would move its furniture; do
it in the build's reseeding event, not here.

## Proving a move changed nothing

The hash baseline (`tools/port_baseline.py`) changes whenever a page's text does, so it cannot prove a refactor of
shared code. `fingerprint.py` loads each furnished page, with the interiors off and on, and fingerprints what the
glue produced: the record count and a hash of every record's fields, the missing keys, the batch's triangles, and a
hash of the furniture meshes' vertex data.

```
python3 core/furnish/fingerprint.py            # compare with fingerprint.json (exit 1 on a difference)
python3 core/furnish/fingerprint.py girder     # one build
python3 core/furnish/fingerprint.py --write    # record the pages as they are (after a change you meant)
node core/furnish/test-furnish.js
```

`fingerprint.json` was written from the pages before the move (2026-10-05). Every build matched it after. Rewritten 2026-10-08
(the Zeijani branch): the catalog's beds, the interiors' measured host tops and stretched pennants, and the batch merging
painted panels per material; compared first with main's own pages, which matched it nowhere since main's catalog changes.

## The per-culture scale (2026-11-11)

The Tungangs stand 0.94 of a human and the Khaayken 1.15 (`kits/tungang/PLAN.md` 3.1, `kits/yeti/PLAN.md` "Scale"); their rooms are
cut to that measure, and the catalog draws every piece at a human's. `scale/54-core-furnish-scale.js` scales a piece where it is placed, from
one constant per culture: a piece in a room of a scaled culture takes the room's scale (the generic and scrap pieces a hold falls back on
are cut to its people too), a piece of a scaled culture elsewhere takes its own, everything else 1. Clearance is not scaled (the walker
and the door swings are the room's). A host that draws records rather than interiors calls `KFURN.scaleRec(rec, entry, roomCulture)`
in its `finish` and scales the piece by `rec.s` about its origin; `drawRec` does not yet pass a scale to the catalog batch (no furnished
build places Tungang or Khaayken pieces through the batch yet): add it there when the first one does.
