# Mungo

A trade village at the bottom of the Eastern Abyss, at the mouth of a small river on the east shore of one of the
salt lakes: a floating **reed village** offshore (the Reed Lake kit, twice the size of its own village, with the new
tavern **Reed's Local**), one long **pontoon bridge** to the shore, and a smaller **landward town** of the Eastern
Abyssal style: the bridgehead market and its shops, a straight main street to the headman's house, a caravanserai,
two inns, warehouses, the city watch, the fields on the river flats, and the **Geomancers' chapterhouse** among six
Yuni houses, electrified, with a park for their **dune buggies**. At the river's mouth a wide **reed marsh**, worked by the reed cutters. Highways run north and south off the map; the
forest round about gives lumber and fruit. `DESIGN.md` holds the brief and what each sentence became.

It is the first world on **`core/simulation`** (the shared life layer's data and stepper, written for it) and on the
**world clock** `core/clock`: the life layer is "a test of the new scheduling system".

```
python build.py                                   # dist/mungo.html (deterministic; build-manifest.json)
python build.py --list                            # where every fragment comes from (mungo, locus, core, virtual)
python verify.py dist/mungo.html --assert --views "Overview|The reed village|Reed's Local" --out shots
python verify.py dist/mungo.html --assert --hour 9 --eval "()=>_sim.audit()" --eval "()=>_life.census()"
```

No node on this machine: `build.py` prints "syntax NOT CHECKED"; the verifier's error panel is the check, and
`node core/simulation/test-sim.js` (23 checks) is the module's contract.

## How it is built (read before editing)

Mungo is a **fork of the Locus engine that shares rather than copies** (`build.py`'s header):

| Source | What | Where |
|---|---|---|
| `settlements/locus/src/` | the engine (palette, core, sky, kit, textures, structure, assets, inspector, path tool, camera loop pieces), the Locus and Eastern Abyssal kits, the Yuni base kit, the biome host, the furnish glue, the minimap and atmos bindings | read BY NAME; a file of the same name in `mungo/src/` overrides it; `LOCUS_SKIP` leaves out Locus's own world |
| `settlements/mungo/src/` | Mungo's world: `10-core` (constants, terrain, fields), `20-stage` (the horizon), `30-layout`, `40-ground`, `65r` (the reed village), `68-place`, `69b`/`69z` (the biome host and planting), `71g` (the Geomancers' grid), `72-lights`, `75-terrain`, `78b` (the world as SIM data), `80-camera` (views, the clock), `84-mungo-life` (the embodiment), `85-probe`; `src/reed/` (the glue run inside the reed kit) | here |
| `settlements/reedlake/src/` (below 90) + `core/materials/` | the Reed Lake kit, wrapped by `build.py` into `REEDKIT_MAKE(host)`, its own `<script>` before `BUILD()`: no global shared | generated (`01-reedkit.html`) |
| `kits/catalog`, `kits/interiors` | the furniture (`KratorFurniture`) and the interiors sets `locus abyss reedlake yuni` (`KratorInteriors`) | generated (`65z-furniture-bundle.js`) |
| `kits/motor-vehicles` | the dune buggy (`KratorVehicles`) | generated (`65y-vehicles-bundle.js`) |
| `core/lod rand mask clock sched furnish tags atmos minimap simulation` | level of detail, the generator, the placement mask, the world clock, the schedules, the furniture pass and its tags, the lake's waves, the plan panel, the simulation | `CORE_MODULES` |
| `core/biome` + `biomes/eastabyss/src` | the canonical eastern-abyss biome, under Locus's slot names (`69a*`, `69c*`) | `BIO_CANON` |
| `settlements/mungo/world/*.json` | the simulation's hand-edited data: activities, factions, orgs, relations, roles, events (and any place override) | generated (`78a-world-json.js`) |

**So a change to Locus's kit or engine, the Reed Lake kit, the catalog or the interiors changes Mungo on its next
build** (`tools/port_baseline.py` sees the hash move). That is the point: one copy of each kit.

## Dev tools

- **Inspector** (button, top left): hover anything: a building's place name, kit, culture and type; a person's role,
  organisation, faction, activity and where they are going; a boat, a buggy, a lizard and whose it is.
- **Mark polygon**: click corners for a ready-to-paste `[[x,y,z],...]`; click anywhere to print x, z and height.
- **Paths**: the street classes, the pontoon and reed decks, and the life layer's routes now (everyone; the fishing
  boats; caravans and riders; the watch; the work commutes; the buggies).
- **Life: census**: the world time, who is present, moving and indoors, boats and buggies out, visiting groups, the
  activities by count.
- **Time of day / Run time**: the world clock is held by default; Run time runs it at a 72-minute day. `#hour=9` and
  `#time=run` in the URL set it.
- **LOD** panel (bottom right, `l`): the shared level of detail (`core/lod`).
- **Map** (button, `m`): the plan (`core/minimap`): the ground, the streets, every footprint, the reed islands and the pontoon; click to look there.
- `window._api`, `_dbg`, `_sim` (audit, census, export, log, nav), `_life`, `_world`, `_reed`, `_place`, `_streets`,
  `_furniture`, `_grid` for a headless probe.
- The browser edit notes (`tools/edits/serve.py`, Alt+click) work on this page like any other.
