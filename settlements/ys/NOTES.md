# Ys — notes, round by round

## Phase 0 (Oct 2026): the harness and the empty world
The folder on the Ancients-lineage contract (PLAN.md §0): `build.py` from Iziz (targets discovered the port's
way, vendoring recorded in `VENDOR.json` with the adapted set, the union seed check over every upstream, node's
syntax check), `verify.py` from the port (`--hour`, `--marks`, the hidden `#viewbtns` list drives the camera, a
`VERIFY_CHROME` override), `jscheck.py`, `run.sh`.

Vendored byte-identical: the Ancients core (`10 12 30 32 34 36 38 50 54 69 99`, `core/materials` through the
resolver), the port core/kit/edges/dress (`70 72 73 74`), the Iziz vernacular materials and helpers (`69b 69c`,
needed by the ported Voth Embassy and the chapterhouse later), the Krator sky (`81`) and the labels (`93`).
Adapted: `71-port-terrain` (two lines), `92-camera` (the Ys pack with the compass). New: `00-head` (a clean shell
with the polygon tool's DOM and the compass canvas), `60-ys-registries` (MARKS, ROOMS, SPOTS, HOSTS, BERTHS,
FERRY_STOPS, WET_DOORS, NAV_EXTRA and the `HYK.def` registry, declared before any pass exists), `91-ys-probe`
(the six Ancients invariants with the port's merged-mesh sampling, the tag audit, the coast check, the door and
residence-spot checks that will bite from phase 1).

`targets/city`: `84-city-geo` (CITY constants, the bay shoreline as a polyline from the south-middle edge to
the NE corner, `ysShoreDist`, `YS_NAT`: beach, hinterland rising ~18 m per km, seabed to −30 m), `89z-rows`
(TITLE, an empty port layout), `90-ys-scene` (renderer, named lights, `KratorSky` with the clock `YSCLOCK` and
`setHour`, night hooks for the sea and the fire kit, the port's stamp → terrain → builders → `kbake` order),
`91z-views` (five presets, the night one at 22.2 h), `93-ys-ui` (hour slider, `_api.city`).

Tooling in this container: `pip install playwright==1.56.0 pillow`; the pre-installed Chromium 1194 matches.

### Verified (Oct 1 2026)
`verify.py dist/ys.html --assert` on the empty world: error panel clean, 8 draw calls, 126 k triangles
(all terrain and sea), all ten invariants pass (the six Ancients ones, the coast as designed: bay head +3.5 m,
SE corner -29.6 m, NW corner +43 m; tags, doors and residence spots trivially), `_api.setCompass(true)` lights
the button and the gizmo, `--marks` writes an empty list. A run of five views takes about a minute here.
What the shots said: the bay bites north-west as drawn; the sea's glitter and fresnel read; night has stars;
the rose and the ground gizmo agree with the geometry (looking NW puts N at upper right). Fixed from them:
a preset without an hour had inherited the previous preset's night (now: no hour means the default day); the
bake invariant failed on a world with nothing to bake; the first opening camera stood too low to see the bay.
