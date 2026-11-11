# kits/yeti: known issues

- [x] (2026-11-03: registered with the shared culture rebuild, kits/yeti/PLAN.md section 11; `tags-vocabulary` passes once the
  page is rebuilt) **The culture is not in core/tags yet** (Y1). `khaayken` is not in `core/tags/52-core-tags-vocab.js`, so
  `verify.py --assert` fails `tags-vocabulary` on every record (`unknown culture:khaayken`) and passes everything else.
  Registering it changes the vocabulary every build takes, so every page that bundles core/tags must be rebuilt and
  `PORT-BASELINE.json` rewritten, with the items in `TODO.md`, "Ride along with the next all-builds rebuild". **Deferred to Y5**
  (the owner, 2026-10-25): it is registered together with the khaayken catalog culture file (`CATALOG_CULTURES` and
  `CULTURE_NAMES` in one change), so one all-builds rebuild covers both. Until then this one check fails by design.
- [ ] **No clean drift-snow texture.** The library's two snow sets are trodden (`ground.snow011`, bootprints and grit)
  and patchy (`ground.snow015`, grass through it). The ground and the winter banks use `ground.snow011` as a grey detail
  map at low contrast (`materials.json`, `tint.contrast` 0.35 to 0.4) under a white tint; the bootprints still show
  faintly. Delivered 2026-10-26: `ground.snow.drift` (the `snow` and `ground` families in `materials.json` now point at it; pre-wired, awaiting the all-builds rebuild to show).
- [ ] **The sheet's ground is a holed plane** (`src/90y-yt-ground.js`): the vendored 90-scene.js lays one flat plane at
  y = 0, and this kit's floors and entries are dug below it, so the plane is rebuilt with a hole for each def that
  declares `holes(o)`. The world pages (the capital, Leng) cut their ground on `core/terrain` instead; the def's holes are
  the outlines they will carve.
- [ ] **The furniture is generic** until the khaayken catalog culture file (Y5): chests, a tea set, a stew pot, baskets,
  fuel. The robes, the lamp and the platform are the kit's own drawing.
- [ ] **Joints where a run turns** are covered by a junction-sized dome at every corner of an L and at each door's lead;
  the runs overlap under it rather than mitre. A house's passage meets its tunnel through a portal face (`ytPortal`)
  whose two sections differ, so the passage's outer vault shows a little inside the tunnel's end.
- [ ] **Crowded domes are merged** (`ytNetLayout`, `42-yt-tunnel.js`): where a network junction falls closer to another
  dome than their radii, it is folded into that dome and its ways meet there (two houses' lead domes are never merged, so
  two of those can stand close with a short run between). The runs reach in to each dome's inner shell at their crown
  height, so a run's mouth stands a little into the dome's pit.
- [ ] **Cap sheets on the domes only**: the turf, snow and lining covers wear circular cap sheets mapped from the crown
  (`turfCap`, `snowCap`, `hideCap`; `YT_CAPS` in `26k-kit.js`); the drift banks and the passages' coats stay tiled (they
  are not domes), and the pycrete shells keep their block courses.
- [ ] **Passages stand into the rooms**: each passage's vault runs into its room until its closed end is in front of the
  wall up to the vault's crown (`ytRoomReach`), so the wall's stepped doorway cut never shows; a doorway reads as a short
  arch standing a hand's breadth to most of a metre into the room (the small domes most).
- [ ] **The walk layer is the kit's own reading of its shapes** (`40-yt-kit.js`, "the walk layer"): round floors as
  polygons, round walls as rings of small blocks (doorway gaps open), trench kerbs as floors to step onto, ramps as strips.
  `verify.py --assert` walks every building from its first target (`walk-reach`: a 0.25 m grid, a 0.6 m step up, a 0.45 m
  step-over, ground only where no floor is registered). The vaults and dome shells are not ceilings to the walker. The
  network folds a tunnel that leaves a dome within 0.9 rad of another onto a junction along it (their walls crossed).
- [ ] **The frost rule's air temperatures are assumed**: +14 C under a lined crown, +3 C at the base (the cold trap's
  stratification), -19 C outside (`ytFrost`, `40-yt-kit.js`). The winter drift bank is held to the springing because a
  thicker coat over the base would thaw the shell's inner face there (the rule, PLAN.md section 4).
- [ ] **The ground's cut edge is stepped** where a trench's open end meets the ground (the entry steps): the refill grid's
  cells are 12 cm (`YT_GROUND_CELL`), and there the edge is not under a wall top.
- [ ] **The night glow is uniform**: every pycrete shell takes the same faint warm light at night (`91y-yt-night.js`),
  the unheated stores and tunnels too; a per-building glow (only where a lamp burns) needs the shell's own material or a
  vertex weight.
- [ ] **The winter street is a sheet row**, not a town: its houses sit in two straight rows on one tunnel line. The
  capital's page lays a real town on core/city.

## Deliberate drift from the vendored engine

- **`src/10-core.js` on core/rand.** The Scyvoi engine's `10-core.js` writes its own mulberry32 stream, a `Math.sin`
  hash and a value noise, which `tools/check_core_use.py` counts against a new build. This kit's copy keeps the engine's
  API (`reseed`, `rng`, `rr`, `pick`, `h3`, `vnoise`, `fbm`) and draws it from `KRAND`: the stream is the same mulberry32
  (`KRAND.stream`), the hash and noise are KRAND's portable ones. It is the one engine file this kit keeps in `src/`
  (it shadows `core/engine/10-core.js`). The fix belongs upstream in `core/engine/10-core.js` (every kit on the engine:
  Scyvoi, Islanders, Lizardmen, Eternian, the nomads, Resources), each a "moving rubble" change with its own screenshot set (GODOT-PLAN.md section 7).

## Doors, glass and the reachability audit (core/door, 2026-11-03)

The audit: every unlocked door opened, `KWALK.reach` (core/walk defaults: 0.4 m cells, a 0.45 m step, the ground walkable) flooded from each top-level building's door() records and front, bounded to its box grown 3 m; a floor counts as the building's by its walk tag. "Big" is an unreached floor of 2 m2 or more lying 1 m or more under the building's top.
- [x] The balagan's porch door: `verify.py` `walk-reach` now walks with every unlocked door open (it failed with the door shut).
- [ ] The reach audit with core/walk's defaults leaves 331 of 876 floors unreached (68 big): the winter street's sunken tunnels
      at -1.2 m, the fort's walk, the cold traps' dropped floors. The kit's own `walk-reach` (a 0.6 m step, its own targets) passes:
      the difference is the step and the ground rule, not a missing stair.
- [x] **The stairs pass (2026-11-03; `tools/walk_audit/reach_audit.py`, core/walk's reach as fixed that day): 541 reached, 287
      unreached (46 big) before; 640, 198 (28 big) after, the climbs left out (`reach_dump.js --summary`).** The winter fort's fighting walk gets a flight of solid pycrete blocks
      along the back wall's inner face (core/engine `svStair`), arriving beside the walk: the walk all round is reached in both
      seasons (the fort 4/152/12 -> 80/76/6, reached/unreached/big-standable). The domes' sleeping platform (about 1 m over the floor) had one 0.47 m step: two
      steps of a third of the rise now (`yt_dome` 33/9/1 -> 41/4/0, the travel dome, the family cluster's centre). The raised
      cache's ladder is climbed now that core/walk/box spaces a steep ladder's rungs 0.4 m apart (0/1/1 -> 1/0/0). No footprint grew.
- [ ] Left (28 big): the satellite domes' dropped floors (-0.6 m) off the clusters' side passages: the passage reaches the shell,
      but a low block stands in the satellite's doorway that the kit's own walk-reach steps over (it allows a 0.45 m step-over) and
      core/walk's reach does not; the isolated tunnel sections on the sheet (-1.2 m, no ramp: in a street they meet the houses);
      the watch tower, whose doorway is plugged by its slab door (a box, not a core/door leaf) and whose floor, a cylinder, is not
      registered; the 0.12 m pads under the fort's walk boxes, which read as their own floors (the walk itself is reached).
