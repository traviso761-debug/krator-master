# core/engine: the building-kit engine

The engine the Scyvoi lineage of building kits runs on, moved here unchanged from `kits/scyvoi/src` on 2026-11-02
(MODULARITY-PLAN.md step 2). A kit keeps its own definitions (its `26k-kit.js`, its building fragments `4x`-`7x`, its sheet's
`89-rows.js`, its head) and reads the engine by path. `engine.py` names the files (`FILES`) and their paths, the way
`core/host/host.py` does for the host shell; the names keep their place in each kit's filename order.

| File | What |
|---|---|
| `10-core.js` | the error panel, the `h3` hash and noise, units and frames |
| `27-mat.js` | the materials (`MAT`), vertex-colour and library modes |
| `30-geo.js` | the geometry engine: every primitive merged into a bucket per material key, in world space |
| `36-def.js` | the registry and placement: `defBuilding`, the records, doors |
| `36o-open.js` | real doors and glass on `core/door` (2026-11-03): `svLeaf`, `svDoorway`, `svPane`, `svPanePoly`, `svRoom`, `svGlass`; the leaves' meshes and walk blocks (`svOpenFlush`, `svOpenWalk`) |
| `37-wk-rec.js` | every box a building draws read as `core/walk` floors and blocks (`KWALKBOX`): the walker stands on decks and treads and is stopped by walls (moved here 2026-11-09 from the identical copies in Islanders, Lizardmen and Eternian) |
| `36s-stair.js` | stairs a walker climbs (2026-11-03): `svStair` (an open timber flight, solid steps or a ladder, in the kit's materials), `svWell` (a slab less the stair's well), `svLanding`; each flight a `KWALK.strip` tagged `stair:<key>` |
| `90-scene.js` | the scene: renderer, the placeholder sky (`core/atmos/placeholder`), ground, the sheet's layout |
| `91f-furnish.js` | the furniture adapter onto `core/furnish` |
| `91i-interiors.js` | the interiors a kit opts into (below): cut-away units, `?interiors=1` / U planned and furnished rooms |
| `91n-night.js` | the night lights |
| `92-world.js` | builds the world and names the views |
| `93-anim.js` | the clock (`?t=` pins it), smoke, the export's material table |
| `99-host-take.js` | the page handed to `core/host` (`KHOST.take`): views, inspector words, controls, the probe's fields |
| `99-tail.html` | the page's tail |

**Doors and glass** (`36o-open.js`; the owner, 2026-11-03: "remove all dark voids and make all windows, doors and portals actual
doors or windows that have transparency"). A builder draws a doorway with `svLeaf` / `svDoorway` and a window with `svPane` /
`svPanePoly` in its local frame, as it calls `door()` and `box()`. A leaf is a `KDOOR` record (`core/door`) with a stable id (the
def's key, its placement ordinal among that key's, `d` and its index: `baelu.0.d2`), drawn as an instance of one InstancedMesh
per material key, posed by `KDOORHOST` as it swings; a door on a solid body (nothing behind it) is `locked`. A pane is one of
`KGLASS`'s kinds as a material key (`paneClear`, `paneLit`, `paneSmoked`, `paneFrosted`, `paneSt<hex>`), with the `room` card
behind it where the body is solid. `buildWorld` (90-scene.js) clears `KDOOR` and calls `svOpenFlush(WORLD)` after the buckets;
where the page has `core/walk` that registers each door's blocks (`KDOOR.walk`) and clears the doorways of the wall boxes the
walk records read (`svOpenWalk`: on a registry of the unlocked doors only, so a locked door's solid mass keeps its block).
99-host-take.js ticks `KDOORHOST` on the frame, gives E (`toggleNear`) and the tip, hides a cut tent's leaves with its near
half, and adds `openings()`, `doorExport()` and `doorState()` to the probe. Every kit on the engine loads `core/door` (its
build.py `CORE_DIRS`); Zeijani's fork reads `36o-open.js` by path. A bundle without `core/door` (the isle demo's `ISK`, built
dry) gets the leaves drawn shut into the buckets and the engine's lamp glass for panes.

**Taken by:** kits scyvoi, ash-nomads, desert-nomads, eternian, islanders, lizardmen, yeti, resources. `settlements/isle-demo`
bundles it with the Islanders kit (`bundles.py` `isk_files`). Not yet: `kits/zeijani` and `settlements/noahs-regret` run
their own forks of it (most files differ); porting them is a later step.

**Controls and walk** (TODO.md, Viewers; 2026-11-09). The engine carries no camera: `99-host-take.js` hands `core/host` the
page with its controls named by id from the one key map (`core/host/92k-host-keys.js`, `KHOST.standard`): Cut-away (X; C
before), Door (E), Night (N), Shadows, and Interiors (U) on a kit with interiors; ? lists them. `engine.py` has what every kit
on it takes: `HOST` (beside `khost.SHELL`: the polygon tool and the key map) and `CORE_DIRS` (with `core/walk` and
`core/walk/box`, so `37-wk-rec.js` registers every building's floors and walls and the host's walker (F) stands on them). A
page built without the key map gets the same words and keys from a fallback in `99-host-take.js`. Tents and round bodies drawn
from cylinders and cones register nothing (KWALKBOX reads boxes): the walker walks through a tent's cloth.

**Interiors** (TODO.md, Viewers: "done once in `core/engine` through `kits/interiors` and `core/furnish`"; 2026-11-09). A kit
whose buildings have an interior set (`kits/interiors/sets/<name>.js`, keyed by its `defBuilding` keys; `<key>#<v>` for a
variant) opts in from its `build.py`:

```python
CORE_HOST = khost.SHELL + kengine.HOST + kengine.INTERIORS_HOST          # the host's cut-away (99-host-cutaway.js)
VIRTUAL = {..., kengine.INTERIORS_FRAGMENT}; BUNDLE_GLOBALS = (...) + kengine.INTERIORS_GLOBALS
def virtual_bodies(): return dict({...}, **kengine.interiors(['eternian']))   # kits/interiors' core + the sets + KIT_INTERIORS
```

Then (`91i-interiors.js`): every placed building with an item is a unit of the host's cut-away: X opens the one nearest the
view at its ground storey, [ ] change storey (its levels read from the item's data, nothing planned), and the engine's own
near-half cut opens with it. `?interiors=1` (U reloads with it) plans every such building into rooms and furnishes them from
the master catalog through `core/furnish`'s `R.interior` in a batch of their own, each room a `part` and each piece
`furniture` in core/tags before it is drawn, the rooms' floors, walls and stairs in `KWALK` (`IX.walk`); the kit's own pieces
standing inside a planned body are left out (`_api.interiors().replaced`), so a room is furnished once. `_api.interiors()`
reports it. Off by default: a page without `?interiors=1` draws what it drew. Why not `kits/interiors`' `55-cutaway.js`: it
drops the walls of shells the interiors kit draws itself (50-shell, 51-building); an engine kit draws its own walls, so the
host's clipping cut (Voth's, Ys's, Noah's Regret's) is the one that opens them, and it is the same X and [ ] on every page.
**Wired:** Eternian (the only engine kit with a set). The other sets belong to kits on other engines (Highlands, Iziz, Talia,
Pylon, Reed Lake, Yuni, Locus, the Eastern Abyssal, the Beast Riders on the catalog; Zeijani and Noah's Regret on their forks).

**A kit's `src/` copy of an engine file wins** for that kit (`--vendor-check` reports it as a shadow). Record why in the kit's
`KNOWN_ISSUES.md`; the aim is none. Yeti keeps its own `10-core.js`.

**Changing it.** Every kit above draws through it. Rebuild them all and run `python3 core/engine/fingerprint.py`, which
compares what each page draws (the registry's records and every mesh's vertex data and material key) with
`fingerprint.json`: a refactor must leave every page's fingerprint the same.
