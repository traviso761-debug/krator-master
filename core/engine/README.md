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
| `90-scene.js` | the scene: renderer, the placeholder sky (`core/atmos/placeholder`), ground, the sheet's layout |
| `91f-furnish.js` | the furniture adapter onto `core/furnish` |
| `91n-night.js` | the night lights |
| `92-world.js` | builds the world and names the views |
| `93-anim.js` | the clock (`?t=` pins it), smoke, the export's material table |
| `99-host-take.js` | the page handed to `core/host` (`KHOST.take`): views, inspector words, controls, the probe's fields |
| `99-tail.html` | the page's tail |

**Taken by:** kits scyvoi, ash-nomads, desert-nomads, eternian, islanders, lizardmen, yeti, resources. `settlements/isle-demo`
bundles it with the Islanders kit (`bundles.py` `isk_files`). Not yet: `kits/zeijani` and `settlements/noahs-regret` run
their own forks of it (most files differ); porting them is a later step.

**A kit's `src/` copy of an engine file wins** for that kit (`--vendor-check` reports it as a shadow). Record why in the kit's
`KNOWN_ISSUES.md`; the aim is none. Yeti keeps its own `10-core.js`.

**Changing it.** Every kit above draws through it. Rebuild them all and run `python3 core/engine/fingerprint.py`, which
compares what each page draws (the registry's records and every mesh's vertex data and material key) with
`fingerprint.json`: a refactor must leave every page's fingerprint the same.
