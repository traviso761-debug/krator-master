# kits/tungang: API

## For another world: the bundle

```python
import sys; sys.path.insert(0, os.path.join(ROOT, 'kits', 'tungang')); import tungang_bundle
js = tungang_bundle.bundle()              # tex=True: the library maps (about 11 MB of data URLs)
js = tungang_bundle.bundle(tex='lean')    # eight families (stone, turf, pole, wood, plate, rust, rope, cord): about 4.4 MB
js = tungang_bundle.bundle(tex=False)     # vertex colours only: about 200 KB
js = tungang_bundle.bundle(furniture=True)   # and the catalog's fellgang, generic and generic-goods pieces sealed in (+387 KB)
js, files = tungang_bundle.bundle(with_files=True)   # and the repo-relative files it read, for --list-sources
```

The text defines one global, **`TG`**, and needs only a global `THREE` (r128). The engine (`core/engine`), `core/rand`,
`core/materials/record` and the kit's fragments are sealed inside it, read in place at bundle time: a fix in the kit reaches
the world on its next build. Put it in the page's script after three.js and before the fragment that draws. A world that
loads it lists `kits/tungang/tungang_bundle.py` and the files it returns in its build's sources.

A draw from a world is **dry**: the world registers its records in `core/tags` first (as the stations do with `REGISTER`);
the kit adds nothing to any registry, places no furniture unless the bundle was made with `furniture=True` (then one
catalog batch per draw, flushed into its group), and draws
the plate doors shut into its buckets. Its errors go to `TG.errors` and the console, never to the world's error panel.

## TG.fg: the Fellgang set

### `TG.fg.draw(V, o)` -> meshes

The call that replaces riftrim's `FELLGANG.draw(V, o)`, with the same arguments. **Since round 2 (2026-11-11)** a building
draws one of its massing families and may fill less of its box than the stand-in did (65-100 % of w and d, 75-100 % of h;
never 0.5 m past it), centred on the record as before: the layout, the records and the seating are unchanged.

| | |
|---|---|
| `V.records` | `KHAMLET.village`'s records: `{key, x, z, ry, w, d, h, id, ...}`. A key the kit lacks is skipped and counted in `.missing` |
| `V.census`, `V.focus`, `V.id` | read for the meeting hall: its variant (`fowling`/`ranch`/an id with no `ice` -> `fowlers`; `ice`/`quarry`/an id with `ice` -> `icecut`) and its pegs (a peg a household: `max(6, round(pop / 5))`, the Fowlers' station's rope count) |
| `o.scene` | the group is added to it |
| `o.ground(x, z)` | the world's ground (default 0) |
| `o.seed` | the world seed: a building's look is `KRAND.hash(seed, index, salt) % 97` (default 7400) |
| `o.label` | the inspector's name for the meshes |
| `o.variant` | `'fowlers'` or `'icecut'`: overrides the meeting hall's variant |
| `o.state` | `'kept'` (default) or `'worn'`; a record's own `r.state` wins |
| `o.character` | `'stony'`, `'low'` or null: weights each building's massing family (default: `'low'` for an ice village, `'stony'` otherwise; null picks evenly). A record's own `r.character` wins |
| `o.pegs`, `o.lost` | the rope wall's pegs (default as above) and its empty pegs (default one, by the hall's seed) |

Each record's def is placed at `x, z, ry` (the record's frame: the door on +z rotated by `ry`, as `KHAMLET.village` faces
its records to their lanes), **seated as the stand-ins were**: the corners and centre of its box are measured on
`o.ground`; the floor goes at the highest, the drystone plinth down to the lowest less 0.5 m (`FELLGANG.draw`'s `R.y` and
`R.lo`), and the builder reads the ground under any local point (a stepped footing, the longhouse's byre down-slope).

It returns the meshes (one per material key, as `FELLGANG.draw` returned its three), each with `userData.host` and
`userData.inspectLabel`, the first with `userData.probePoints` (one a building). The array also carries:

| | |
|---|---|
| `.group` | the `THREE.Group` holding them |
| `.recs` | the drawn records: `{key, x, y, z, ry, bbox, id, low, top, fg}` (`fg` the builder's counts: the massing `family`, the hall's `variant`, `pegs`, `coils`, `empty`, `slats`, `notches`; the longhouse's `byre` side; the ice house's `blocks`) |
| `.missing` | `{key: count}` of keys the kit lacks |
| `.tris` | the triangles drawn |
| `.lights` | the fires and lanterns `{x, y, z, r, g, b, big}`: a world's night pool can take them |
| `.smokes` | the smoke sources `{x, y, z, r}` |

**The riftrim stations' change** (one line each in `89b`): load the bundle, then

```js
TG.fg.draw(V, {scene, ground: terrainH, seed: 8312, label: 'The Fowlers (a Fellgang village)'});      /* was FELLGANG.draw */
TG.fg.ropes(FOWL.ropes, {scene, label: 'The families\' ropes and ladders'});                          /* was the ribbon in 89b */
TG.fg.pieces(ICE.lamps.map(l => ({key: 'fg-lantern-post', x: l.x, z: l.z, y: l.y, id: l.id})), {scene}); /* the ice road's posts */
```

`FELLGANG.lanes` stays the station's. With `core/hamlet/fellgang/22-hamlet-fellgang.js` in the station's build, its
`KHAMLET.village` takes `culture: 'fellgang'` and `focus: 'fowling'` (or `'ice'`) in place of `FELLGANG.ROW` and `ranch`
(or `quarry`): the village is the same (the focus name enters no seed; `core/hamlet/test-hamlet.js` proves the digests equal).

### `TG.fg.ropes(list, o)` -> meshes

The Fowlers' rope records, as the station makes them: `{id, pts: [[x, y, z]...] (world, up the fall line), y0, top,
family}`. Each is drawn as `fg-fixed-line` with its foot at `pts[0]`: Ancient cable for the first 30 m of arc, bark cordage
above, an iron peg every 25 m with the family's mark, a ladder up the first 18 m, the mark on a staked plate at the foot.
`o`: `{scene, label}`. `.recs[i].fg` holds `pegs`, `rungs`, `arc`, `family`.

### `TG.fg.pieces(list, o)` -> meshes

Road and wall pieces: `{key, x, z, ry?, y?, v?, family?, face?, id?}`; `y` defaults to `o.ground(x, z)`; `face: true` draws a
stub of rock behind a wall piece (the sheet's; a station's terrain is the face). Keys: `fg-lantern-post`, `fg-ice-tools` (by the Ice-cutters' stacks), `fg-wall-station`
(v even: the lift cage; odd: the plate shelter), `fg-nest-ledge`, `fg-burial-ledge` (`family`: the mark and the rope's
colour), `fg-halt`, `fg-wagon` (+z its back: the door and steps).

### `TG.fg.proto(key, o)` -> meshes

One def alone at the origin (y 0, front +z), dry, into a group of its own; `o`: `{v, state, variant}`. For instancing, and
for measuring (verify.py checks the worn state this way).

### Data

| | |
|---|---|
| `TG.fg.BOX` | the 14 keys' boxes `{w, d, h, form, what}` (the contract) |
| `TG.fg.dims(key)` | `{w, d, h}` or null: the stand-ins' `FELLGANG.dims`, for `KHAMLET.village`'s `dims` |
| `TG.fg.ROW` | `KHAMLET.CULTURES.fellgang` when the page has core/hamlet's opt-in row, else null |
| `TG.fg.check` | `box(recs, tol, fill)` (never tol past, filling fill: {w .65, d .65, h .75}), `plinth(recs, ground)`, `rope(records, meshes, tol)`: the checks verify.py runs, each `{ok, ...}`, for a station's `--assert` |
| `TG.SCALE` | 0.94 (the Tungang and Glazier sets' openings; the Fellgangs are 1.0) |
| `TG.errors`, `TG.MAT`, `TG.DEFS`, `TG.KIT` | the bundle's errors, materials, defs and identity (bundle only) |

## On the sheet

`dist/tungang.html`: `?state=worn` (the worn state), `?only=fg-hut,fg-pens` (only those rows), `?t=4` (the clock pinned),
`?mat=proc` (vertex colours only). `window._fgSheet` holds the test grounds (`village`, `villageDraw`, `pad`, `ropes`,
`ropeDraw`, `wall`, `road`); `_api` is core/host's probe with the engine's fields (`footprints`, `tags`, `furniture`...).

## The core/hamlet row

`core/hamlet/fellgang/22-hamlet-fellgang.js` (opt-in; `core/hamlet/fellgang/README.md`): `KHAMLET.CULTURES.fellgang`,
`KHAMLET.FOCI` + `fowling`, `ice`, `KHAMLET.FOCUS_INFO`.

## TG.tg: the Tungang set (src/44-tg-kit.js, 82-tg-host.js)

| Call | What |
|---|---|
| `TG.tg.draw(sites, o)` | draw a plan's sites (KCITY.cavern's records `{id, key, x, y, z, ry, state, num, loj, span, h}`: x, y, z the foot of the front) after the world has carved the rock and registered the sites; `o {scene, seed, state, label}`. Dry. Returns the meshes with `.group`, `.recs`, `.missing`, `.tris`, `.lights` (light records), `.furniture` (pieces placed), `.missingFurn` |
| `TG.tg.plan(key, o)` / `TG.tg.planOf(site)` | a def's void plan: `[{id, kind: 'room', x, z, w, d, y, h}]` or a stair `{kind: 'stair', a, b, w, h}`, in the front-foot frame |
| `TG.tg.BOX`, `TG.tg.dims(key)` | each def's box behind its front, its tier and its door's lamp code |
| `TG.tg.LAMP`, `TG.tg.PAL`, `TG.tg.SCALE` | the lamp code (colour, KCAVELIGHT kind, range, intensity), the palette (PLAN.md 1.5.1), 0.94 |
| `TG.tg.proto(key, o)` | one def alone at the origin |
| `TG.tg.check.box(recs)`, `.plans()`, `.lamps(out)` | the checks verify.py runs |

A world that loads the bundle with the Tungang pieces passes `cultures` (see `tungang_bundle.bundle`) including `tungang`.
