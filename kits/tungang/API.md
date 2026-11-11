# kits/tungang: API

## For another world: the bundle

```python
import sys; sys.path.insert(0, os.path.join(ROOT, 'kits', 'tungang')); import tungang_bundle
js = tungang_bundle.bundle()              # tex=True: the library maps (about 11 MB of data URLs)
js = tungang_bundle.bundle(tex='lean')    # eight families (stone, turf, pole, wood, plate, rust, rope, cord): about 4.4 MB
js = tungang_bundle.bundle(tex=False)     # vertex colours only: about 170 KB
js, files = tungang_bundle.bundle(with_files=True)   # and the repo-relative files it read, for --list-sources
```

The text defines one global, **`TG`**, and needs only a global `THREE` (r128). The engine (`core/engine`), `core/rand`,
`core/materials/record` and the kit's fragments are sealed inside it, read in place at bundle time: a fix in the kit reaches
the world on its next build. Put it in the page's script after three.js and before the fragment that draws. A world that
loads it lists `kits/tungang/tungang_bundle.py` and the files it returns in its build's sources.

A draw from a world is **dry**: the world registers its records in `core/tags` first (as the stations do with `REGISTER`);
the kit adds nothing to any registry, places no furniture (the bundle's `FURNISH` is a stub: `KNOWN_ISSUES.md`), and draws
the plate doors shut into its buckets. Its errors go to `TG.errors` and the console, never to the world's error panel.

## TG.fg: the Fellgang set

### `TG.fg.draw(V, o)` -> meshes

The call that replaces riftrim's `FELLGANG.draw(V, o)`, with the same arguments:

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
| `.recs` | the drawn records: `{key, x, y, z, ry, bbox, id, low, top, fg}` (`fg` the builder's counts: the hall's `variant`, `pegs`, `coils`, `empty`, `slats`, `notches`; the longhouse's `byre` side; the ice house's `blocks`) |
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
stub of rock behind a wall piece (the sheet's; a station's terrain is the face). Keys: `fg-lantern-post`, `fg-wall-station`
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
| `TG.fg.check` | `box(recs, tol)`, `plinth(recs, ground)`, `rope(records, meshes, tol)`: the checks verify.py runs, each `{ok, ...}`, for a station's `--assert` |
| `TG.SCALE` | 0.94 (the Tungang and Glazier sets' openings; the Fellgangs are 1.0) |
| `TG.errors`, `TG.MAT`, `TG.DEFS`, `TG.KIT` | the bundle's errors, materials, defs and identity (bundle only) |

## Wildcat: the scrap pueblo (`TG.fg.pueblo`)

Wildcat's plans are `core/pueblo`'s (`core/pueblo/README.md`: room cells, storeys and terraces, plazas, kivas, ladders, the
stockade's ring, as plain records keyed by stable ids); the kit holds the specs and the dress (`src/44-fg-wc-plan.js`) and the
drawing (`src/46-fg-wc-draw.js`). The bundle seals `core/pueblo` and `core/space` in; `KPUEBLO` is a global, as `KRAND` is.

```js
const P = TG.fg.wildcat();                           /* the great house: KPUEBLO.house(TG.fg.wcSpec.GREAT), built once */
TG.fg.puebloRegister(P, KTAGS.page, {x, z, ry, ground: terrainH});        /* the house and every record in core/tags first */
TG.fg.pueblo(P, {scene, x, z, ry, ground: terrainH, label: 'Wildcat'});   /* then the dry draw */
TG.fg.wildcatHamlets().forEach((Q, i) => { /* the same two calls for each hamlet */ });
```

| | |
|---|---|
| `TG.fg.wildcat()`, `TG.fg.wildcatHamlets()` | the great house's plan (a D, 805 rooms up to five storeys, 1,145 people) and the two hamlets' (the ford's U, 60; the pens' L, 82) |
| `TG.fg.wcSpec` | the specs (`FG_WC`: `GREAT`, `HAMLETS`, `block(v)`), for a world that builds its own plan with `KPUEBLO.house` |
| `TG.fg.puebloRegister(P, T, o)` | registers in core/tags registry `T` the house (`fg-wc-greathouse`, or `fg-wc-hamlet` for a plan of 150 cells or fewer; `o.key` overrides) and, as its children, every room, kiva, plaza (`part`), ladder and piece of dress (`fixture`) and the stockade; returns `{house, count}` |
| `TG.fg.pueblo(P, o)` | the draw, dry, at `o.x, o.z, o.ry`: the floor at the highest ground under the plan's hull (a knoll's flattened top), each column's footing down to its own ground (`o.ground`), the stockade on `P.enclosure`'s ring (`o.stockade: false` leaves it out); `o.state` `'worn'`; `o.dress` a dress of your own. Returns the meshes with `.group`, `.recs` (the house's `fg` counts: cells, rooms, pop, faced, cars, vigas, doors, hatches, ladders, kivas, crest, trophies, deeds, slogans, shells; the stockade's stakes, panels), `.tris`, `.lights`, `.smokes`, `.plan`, `.dress` |
| `TG.fg.check.pueblo(P, recs)` | the plan's invariants (`KPUEBLO.check`: terraces, reach, no ground doors, no overlap, the kivas, unique ids) and the draw's counts: `{ok, bad, census, drawn}` |

**The dress** (`fgWcDress(P)`, records placed from the plan's ids by KRAND): aurochs skulls along the hero's parapets and
the horned crest over the hero's rooms; six trophy poles round the round room (a Labber's helmet, a Lizard's scale, skulls,
horns), war drums and braziers; **the Deeds** painted on three front-row faces of the east plaza (27 boasts, each with its
mark and whether it was made good); NO SKABS and the union's words man-high on the outer walls, a painted aurochs beside some;
glyptodont shells as cisterns on the terraces and in the plazas.

**The defs**: `fg-wc-greathouse`, `fg-wc-hamlet` (each draws `o.plan`, else its default), `fg-wc-block` (one block alone, the
sheet's row: `v` 0-4, the hero's crest on the even seeds), `fg-wc-round-room` (the great kiva, the Boast's stand, trophies),
`fg-wc-kiva`, `fg-wc-stockade` (`o.ring`: a plan's enclosure; alone, a 30 m run with its gate).

## On the sheet

`dist/tungang.html`: `?state=worn` (the worn state), `?only=fg-hut,fg-pens` (only those rows), `?t=4` (the clock pinned),
`?mat=proc` (vertex colours only). `window._fgSheet` holds the test grounds (`village`, `villageDraw`, `pad`, `ropes`,
`ropeDraw`, `wall`, `road`; Wildcat's `wildcat`, `wildcatReg`, `hamlets`, `hamletRegs`, `wildcatPens`), `window._wcChecks()`
Wildcat's page checks; `_api` is core/host's probe with the engine's fields (`footprints`, `tags`, `furniture`...).

## The core/hamlet row

`core/hamlet/fellgang/22-hamlet-fellgang.js` (opt-in; `core/hamlet/fellgang/README.md`): `KHAMLET.CULTURES.fellgang`,
`KHAMLET.FOCI` + `fowling`, `ice`, `KHAMLET.FOCUS_INFO`.
