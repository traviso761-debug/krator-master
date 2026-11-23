# kits/tungang: API

## For another world: the bundle

```python
import sys; sys.path.insert(0, os.path.join(ROOT, 'kits', 'tungang')); import tungang_bundle
js = tungang_bundle.bundle()              # tex=True: the library maps (about 11 MB of data URLs)
js = tungang_bundle.bundle(tex='lean')    # eight families (stone, turf, pole, wood, plate, rust, rope, cord): about 4.4 MB
js = tungang_bundle.bundle(tex=False)     # vertex colours only: about 200 KB
js = tungang_bundle.bundle(furniture=True)   # and the catalog's fellgang, tungang, xanadu, generic, generic-goods and jobs pieces sealed in
js, files = tungang_bundle.bundle(with_files=True)   # and the repo-relative files it read, for --list-sources
js = tungang_bundle.bundle(tex='glazier', side=side)   # the Glazier set's families; with side={} the maps go into side['tungang']
                                                         # for a file beside the host page (matlib_pack.write_sidecar: Laitwal)
js = tungang_bundle.bundle(res=True)      # and the Resources kit's ore rule and node defs (kits/resources/src 42r, 42s, 44r,
                                          # 44t, read in place: about 40 KB) as TG.res: draw(nodes, o), source, rate, ORE
```

`TG.res.draw(nodes, {scene, label, seed})` places each `{id, kind, grade, x, z, y?, ry?, v?}` as `node-<kind>-<grade>` (dry, one
group; `.recs`, `.missing`, `.tris`); `TG.res.source(works, nodes)` is the kit's nearest-node rule (`kits/resources/API.md`). The
node fragments' keys this kit lacks (`earth`, `sand`; `stoneD`, `woodD` in the palette) map onto its own. Laitwal draws the Great
Potch Line's opal with it (`settlements/lightwall/targets/town/90o-lw-opal.js`). Without `res` the bundle is byte for byte as before.

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
| `o.pegs`, `o.slats`, `o.lost` | the rope wall's pegs, the tally board's slats and the empty pegs (defaults as above; a record's own `r.pegs` / `r.slats` wins) |
| `o.walk`, `o.doors`, `o.steps`, `o.furnish` | `o.walk`: record floors, walls and ladders into global `KWALK` / `KWALKBOX`; `o.doors`: register operable `KDOOR` plate doors into global `KDOOR` / `KDOORHOST` and flush their `InstancedMesh`es into the draw group; `o.steps`: build drystone threshold steps and `KWALK` strips where a door stands above sloped ground; `o.furnish === false`: skip catalog furniture for distant draws |

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

Road, Traveller camp and wall pieces: `{key, x, z, ry?, y?, v?, family?, face?, id?}`; `y` defaults to `o.ground(x, z)`; `face: true` draws a
stub of rock behind a wall piece (the sheet's; a station's terrain is the face). Keys: `fg-lantern-post`, `fg-ice-tools` (by the Ice-cutters' stacks), `fg-wall-station`
(v even: the lift cage; odd: the plate shelter), `fg-nest-ledge`, `fg-burial-ledge` (`family`: the mark and the rope's
colour), `fg-halt`, `fg-wagon` (spoked bow-top/ledge vardo with winter runner-skis; +z its back Dutch door and steps), `fg-bender` (Irish Traveller / Romani arched bender tent, +z entrance), `fg-camp-hearth` (stone-kerbed campfire, iron tripod trammel & cauldron kettle, stools and churns), `fg-tinsmith` (tinsmith/coppersmith canvas pitch and clothesline, +z front), `fg-cairn` (v 0: the standing peace stone; v >= 1: a fell cairn), `fg-truce-post` (Market truce and hospitality boundary stone; even v carries a lit peat brazier), `fg-stone-sign`, `fg-fair-hurdle`, `fg-stair-hoist` (+z overhanging the pitch).

### `TG.fg.proto(key, o)` -> meshes

One def alone at the origin (y 0, front +z), dry, into a group of its own; `o`: `{v, state, variant}`. For instancing, and
for measuring (verify.py checks the worn state this way).

### Data

| | |
|---|---|
| `TG.fg.BOX` | the 25 keys' boxes `{w, d, h, form, what}` (the 14 village stand-in keys + 11 town-scale keys) |
| `TG.fg.dims(key)` | `{w, d, h}` or null: the stand-ins' `FELLGANG.dims`, for `KHAMLET.village`'s `dims` |
| `TG.fg.ROW` | `KHAMLET.CULTURES.fellgang` when the page has core/hamlet's opt-in row, else null |
| `TG.fg.check` | `box(recs, tol, fill)` (never tol past, filling fill: {w .65, d .65, h .75}), `plinth(recs, ground)`, `rope(records, meshes, tol)`: the checks verify.py runs, each `{ok, ...}`, for a station's `--assert` |
| `TG.SCALE` | 0.94 (the Tungang and Glazier sets' openings; the Fellgangs are 1.0) |
| `TG.errors`, `TG.MAT`, `TG.DEFS`, `TG.KIT` | the bundle's errors, materials, defs and identity (bundle only) |

## TG.gz: the Glazier set

The Glaziers of Opal Valley (`PLAN.md` sections 1.4, 3.4; culture id `glazier`, opt-in in `core/tags/glazier/`): their hold is
CUT into a fault scarp. Each def is **a front plus a void plan** (`kits/zeijani/PLAN.md` 6.3): the front (tiers of battered
whitewashed wall, cusped arches, moonglass, cholet bands, gilt) is drawn by the builder; the rooms are voids in the rock, and
**the void plan is the one source**: the world's cavern is carved from it, the builder draws its floors, linings and furniture
from it, core/walk takes its floors from it.

**The frame.** The origin is the foot of the def's FRONT on the rock face (z 0 is the face); the front stands out toward +z by
its `out`; the rooms run into the rock at -z. A site `{key, x, y, z, ry}` puts that origin at (x, y, z) with the front turned
by ry. Openings, bunks and furniture are at the Tungangs' 0.94 (`TG.SCALE`: doorways 1.95 m, rooms 2.45 m to the springing).

### Laying a hold

```js
const C = KCAVERN.create({ground, cell: .5, chunk: 16, seed, walk: KWALK, minRock: .6});
/* the world's scarp: its own masses or terrain */
TG.gz.carve(C, sites);                 /* every site's void plan into the cavern: C.room / C.stair, C.opening (kind 'door') at the face */
C.build();                             /* the cavern writes the rooms' floors to core/walk */
sites.forEach(register);               /* core/tags first, as a world does (culture 'glazier', the def's types) */
const D = TG.gz.draw(sites, {scene, seed: 9410, label: 'The Glaziers\' hold'});
D.lights;                              /* light records, core/cavelight's shape: a world's KCAVELIGHT can light them */
```

A world that carves with its own tool reads `TG.gz.voids(sites)` instead: the same primitives in the world frame
(`{prim: 'room', id, owner, poly, y, h, ceil, rise, r, finish, door?}` or `{prim: 'stair', id, owner, a, b, w, h}`).

### `TG.gz.draw(sites, o)` -> meshes

| | |
|---|---|
| `sites` | `[{key, x, y, z, ry, v?, state?, id?}]`; a key the kit lacks is skipped and counted in `.missing` |
| `o.scene`, `o.label` | the group is added to the scene; the inspector's name |
| `o.seed` | a site's look (`v`) when it has none: `KRAND.hash(seed, index, salt) % 97` (default 9400) |
| `o.state` | `'kept'` (default), `'worn'` or `'abandoned'`; a site's own `state` wins |
| `o.walk` | true: the fronts' floors, steps and doorways go to core/walk (`KWALK`) as the draw makes them (the page's walker reaches a carved home's rooms from its front: Lightwall's `ix-glazier`); the curtains, lamps and leaves never block. Default false (a dry draw) |
| site `facade` | true: the front alone, on whole rock: nothing behind the face (z < -0.35) is drawn, no room lights, no furniture (Lightwall's outer wall) |

Returns the meshes (one per material key) with `.group`, `.recs` (`{key, x, y, z, ry, bbox, id, site, fg}`; `fg` the builder's
counts: `plaques` and `register` (the Register), `wheels`, `benches`, `countLamps`, `countWall`, `timetable`, `plaque` (an
adit's number), `flights`, `basins`, `beds`), `.missing`, `.tris`, `.smokes` and **`.lights`**: every lamp the builders hung,
`{id, x, y, z, kind ('lamp-red' | 'lamp-amber' | 'lamp-green' | 'lamp-white' | 'glowcap' | 'wax' | 'moonglass'), colour, range,
intensity, owner, on}`. A worn draw dims them; an abandoned one lights none. The draw is dry, as `TG.fg.draw`.

### The defs

| Key | Tier | Box w x d x h (out) | What |
|---|---|---|---|
| `gz-cell` | poor | 8.4 x 7 x 4.4 (1.3) | one tier and a door; a carved room (hewn or plastered by seed), a store niche |
| `gz-front` | middle | 9.6 x 12 x 8 (2.6) | two tiers; the hearth room, the sleeping room, the store; a steep stair up to the upper room behind tier two |
| `gz-house` | rich | 14.6 x 16.6 x 15.6 (4) | three or four tiers (by seed), gilt, the lattice bay, the eight-spoked wheel; reception, kitchen, store, the family rooms, the shrine (and the top room) |
| `gz-stair` | common | 7.6 x 3.8 x 11.6 (3.4) | two or three switchback flights (6.8 or 10.2 m): masonry, then timber on iron brackets; white hooded lamps at the landings |
| `gz-wheel-walk` | common | 12.4 x 4.2 x 4.2 (3) | 8 to 12 click wheels in a rock-cut niche row along the ledge, under a carved eave |
| `gz-tea-hall` | civic | 16.6 x 21 x 13 (4) | the loj's meeting hall (12 x 10.4 m, polished, vaulted); three tiers of front, the guest gallery |
| `gz-register-room` | civic | 9.4 x 11.6 x 5.4 (1.8) | the Register of the Veins (24 to 47 veins, one plaque each, and the hold's own on the front), the Fifth's strongroom |
| `gz-glass-shop` | common | 10.4 x 12 x 5.8 (3.4) | the moonglass workshop and its store |
| `gz-monks-house` | civic | 10.4 x 13.4 x 6.4 (3) | the reading room, the pigment mill, a cell |
| `gz-adit` | common | 8.6 x 18 x 5 (6) | an adit's mouth and its working to the face (11.7 m in) |
| `gz-vein-gallery` | common | 8 x 17 x 3.6 (1) | a gallery on a potch line: in, a turn, on, the face |
| `gz-dark-adit` | poor | 7 x 15 x 3.4 (1) | an old adit and its bed chamber |
| `gz-lotus-pond` | common | 12.4 x 10.8 x 1.8 (9.6) | three basins stepping down from the face to the tarn; a sluice from the rock |

### Data and checks

| | |
|---|---|
| `TG.gz.BOX` | each key's box `{w, d, h, out, tier, what}`: the def's drawn box lies in x within +-w/2, z within [out - d, out], y within [0, h] |
| `TG.gz.plan(key, o)` | the def's void plan for `o` (`{v}`): `{voids, byId, ...}`, each void `{id, kind: 'room', x, z, w, d, y, h, ceil, rise, finish, use, doors, pass?}` or `{id, kind: 'stair', a, b, w, h}`, in the def's frame |
| `TG.gz.voids(sites, o)`, `TG.gz.carve(C, sites, o)` | the plans in the world frame; carved into a KCAVERN |
| `TG.gz.proto(key, o)` | one def alone at the origin (dry); `.lights` as `draw`'s |
| `TG.gz.dims(key)` | `{w, d, h, out}` |
| `TG.gz.LAMP` | the lamp code's colours and their KCAVELIGHT kinds, ranges and intensities (the Tungang set's, with `moon`: the moonglass lantern) |
| `TG.gz.check` | `box(recs, tol, fill)` (fill {w .6, d .45, h .6}), `plans(minRock)` (rooms marked `join`, a working's stretches, are exempt), `lights(draw)`, `carved(C, sites)`: the checks verify.py and `tests/test-bundle.js` run |
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

**Barricade** (`PLAN.md` 1.3.2): `TG.fg.barricade()` is its plan (core/pueblo's `bar`: 620 rooms, 1,027 people, a gate and a
culvert under its rooms), `TG.fg.bcSpec` its spec and kiva table (`FG_BC`). The same two calls draw it
(`TG.fg.puebloRegister`, `TG.fg.pueblo`): a plan of shape `bar` takes the key `fg-bc-greathouse` and Barricade's dress
(`fgBcDress`: the wrecks, the gate's and the culvert's gear, the lookouts, the pickets, its slogans), registered as fixtures.
A world places it across a gorge whose floor is flat under its hull, carves the plaza 0.35 m under the house's paving and the
kivas' pits (`fgWcCarve` on the sheet shows how), and brings the river through the culvert (`core/water`).

**Inside** (`PLAN.md` 1.3.5): every room is drawn hollow and every plan comes furnished (`P.furniture`, core/pueblo's records:
`KPUEBLO.furnish` by the table `FG_WC_FURN`, `KPUEBLO.furnishKivas` by `FG_WC_KIVA` or Barricade's). `TG.fg.puebloRegister`
registers each piece as its room's child. `TG.fg.pueblo` builds them through the catalog's batch in 40 m chunks (`.furniture`:
`{pieces, missing, chunks}`) when the page or the bundle carries the catalog (`tungang_bundle.bundle(furniture=True)`); a
world calls `TG.fg.chunksTick(camera)` each frame to show the chunks near the camera only. **The storey section**:
`TG.fg.section(level)` clips every house drawn by `TG.fg.pueblo` at a storey (1 the ground floor), at `'kiva'` (the plaza's
level: the kivas open), or `null` (whole); each house's materials are its own clones, so nothing else on the page is cut.

**The defs**: `fg-wc-greathouse`, `fg-wc-hamlet`, `fg-bc-greathouse` (each draws `o.plan`, else its default), `fg-wc-block` (one block alone, the
sheet's row: `v` 0-4, the hero's crest on the even seeds), `fg-wc-round-room` (the great kiva, the Boast's stand, trophies),
`fg-wc-kiva`, `fg-wc-stockade` (`o.ring`: a plan's enclosure; alone, a 30 m run with its gate).

## On the sheet

`dist/tungang.html`: `?state=worn` or `?state=abandoned` (the Glaziers' third state; the Fellgangs draw it worn), `?only=fg-hut,fg-pens` (only those rows), `?t=4` (the clock pinned),
`?mat=proc` (vertex colours only). `window._fgSheet` holds the test grounds (`village`, `villageDraw`, `pad`, `ropes`,
`ropeDraw`, `wall`, `road`); `window._gzSheet` the Glaziers' rock (`rows`, `scarp`, `draw`, `cavern`, `rock`, `prims`); C (the
cut-away) opens the Glaziers' rock 2.2 m over every void's own floor (`core/terrain/host/39h`); `_api` is core/host's probe with the engine's fields (`footprints`, `tags`, `furniture`...).
`ropeDraw`, `wall`, `road`; Wildcat's `wildcat`, `wildcatReg`, `hamlets`, `hamletRegs`, `wildcatPens`; `barricade`,
`barricadeReg`), `window._wcChecks()` the pueblos' page checks, `window._wcSection(level)` the section (K steps it; a view's
seventh entry `{section}` sets it); `_api` is core/host's probe with the engine's fields (`footprints`, `tags`, `furniture`...).

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
