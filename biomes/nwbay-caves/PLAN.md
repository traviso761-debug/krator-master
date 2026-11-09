# biomes/nwbay-caves: the bay's drowned caves (planned and built 2026-11-09)

The owner (2026-11-09): "a nw bay cave biome". `biomes/KARST-SITES-5.1.md` site 1, the Hykkousoi karst (rated A): in the
bay "the karst is drowned: Ys's stacks stand in the sea, so their lower passages are sumps", and "the nwbay page already draws a
tiankeng 84 m deep at the tsingy's NE edge and two cenotes 19-26 m deep in the bay jungle. KKARST would put a cave under each
one". This kit is the cave under **the NE cenote**: the first station. The SW cenote (1 km off) and the tiankeng (on the dry
slope, 86 m up) are later stations; Ys's stacks' sumps are Ys's (`settlements/ys`).

**Where it builds.** A biome kit of its own, as the Hearths' cave page is: `python3 build.py` (or `--station cenote`) writes
`dist/nwbay-caves-cenote.html` from `stations/cenote/` and the core. nwbay's page is not touched: its build has no stations,
its stage is 76 KB of surface, and a cave page draws no surface. Started from `biomes/hearths` (the nearest finished cave
kit): its `build.py`, `verify.py` and host shape.

## 1. The site (read off nwbay's page, 2026-11-09)

- **nwbay's frame**, metres, y up, sea level and the water table at **y = 0** (nwbay's water plane). The NE cenote is
  nwbay's `SINKS[1]`: centre **(757.5, -91)**, r 24, e 1.1, turned 1.2 rad, bell .32, its floor at **-9** under the water,
  its rim on the ground at **30.0** (`groundBase`). Scale model 5.1: the bay jungle at about 780,725 (Aw, 973 mm, +32 degC,
  1.8-1.9 atm).
- **The ground** over the cave is nwbay's own `groundBase`, sampled on a 16 m raster over the box (49 x 49, `[378, -200]` to
  `[1146, 568]`), stored in the site fragment as base64 (`SITE.groundB64`; decoded and checked against the page at six
  points, within 5 cm). It runs from 53 m inland (north-west) to 1.1 m at the shore (south-east, about 700 m from the
  cenote). If nwbay's ground changes, re-sample it (the snippet is in `KNOWN_ISSUES.md`).
- **Nearest things**: the stack at (793, 369), r 48, 460 m south; the shore 700 m south-east. Neither is in the cave.

## 2. The cave

**KKARST**, site 1's bay arguments (`branch`, level L - 25, sinks cell 150 p .5, gradient .006, chamber r 8-22 h 5-14,
thin 10, joints .35 at 45 m), with the table at the sea (**0**, nwbay's water plane, where site 1 wrote L + 1), the spring
at the box's lowest shore point (874, 552: a brackish resurgence at the waterline). Its world, **7643**, is the one of 400
tried whose sinks put one under the cenote (11 m off) and a chamber 29 m from it: chosen, not edited.

- **Everything is drowned**: every passage is a sump (all 92 at world 7643), the chambers flooded, their crowns
  under the sea. The only air is the cenote's shaft. The speleothems grew when the sea stood lower (the Ice Age story of the
  Yucatan's cenotes; here the bay's own lowstand, *proposed*): KSPELEO's `LIMESTONE` dress (stalactites, stalagmites,
  columns, straws, curtains, flowstone, rimstone), all under water now.
- **The cenote** replaces the sink KKARST put under it: a belled `KCAVERN.hall` (nwbay's radius and bell, its floor at -9)
  with a throat up to the ground at its rim (a `well` opening): the shaft nwbay draws from above, here from below. A
  descending tube joins its floor to the sink's passage. KKARST's own sink shaft and doline there are dropped from the crop.
- **The other sinks are choked**: their shafts stop 6 m under the ground (breakdown), with no doline, because nwbay's surface
  has no hole there. Their passages run on as the branchwork's heads.
- The KCAVERN lattice at 1 m (about 160 k triangles in the box, measured).

## 3. Light, water and air

- **Under water** (the camera below 0): a close blue-green haze (the scene's fog, switched by the eye's height), the
  cenote's daylight falling through the water as a shaft (core/atmos's cone and one spot), the diver's lamp (a spot on the
  camera; `?lamp=0`), the limestone pale where the lamp reaches. A halocline is *not* drawn (KNOWN_ISSUES).
- **In the shaft** (above 0): warm humid air, the water's surface (core/water's still `WATER.open` over the cenote, drawn
  from both sides), the jungle's light at the rim (a sky disc: no surface is drawn).
- **Hazards** (core/hazard): KKARST's `drown` over every sump and flooded chamber, **for air-breathers only**
  (`tags.breathers: 'air'`): the Hykkousoi breathe water, and the sumps are their roads (site 1, "Who uses it"). The fall
  into the cenote from its rim. No heat, no gas (an open, sea-fed cave).

## 4. Core adoption (written before the first fragment)

| Module | Takes | For |
|---|---|---|
| `core/terrain` | `39-core-cavern` (KCAVERN), `39b-core-speleo` (KSPELEO), `39c-core-karst` (KKARST), `43-core-ground` (KGROUND), **`39d-core-cavern-floor`** and **`host/39e-core-cavern-draw`** (new: lifted from the Hearths' cave page, below) | the network, its voids and chunks, the limestone dress, the rock's layers, the floor under the eye, the chunks drawn |
| `core/rand` | `KRAND` | every seed |
| `core/tags` | `50`, `52`, `53` | every chamber, sump, the cenote and every hazard a record |
| `core/space` | `KSPACE` (through `core/host`) | the probe's broad phase |
| `core/hazard` | `20-core-hazard`, `37-core-traps` | drown (air-breathers), the fall |
| `core/biome` | `10`, `20`, `30`, `31b`, `40`, `42`, `43`, `44` | `BIO.init` (the host binding, records, the export); no flora (a drowned cave) |
| `core/atmos` | the core, presets, the cones (`2-lights`), particles, export, waves, `bindHost` | the cenote's shaft of light, the motes in the water; no sky, no weather |
| `core/water` | `20`, `21`, `22`, `50`, `51` | the cenote's surface (`WATER.open`), still |
| `core/host` | `FULL` | the page shell |
| `core/materials` | `record` (`KMAT`), `biomes/nwbay-caves/materials.json` packed | `rock.limestone.karst` (the walls), `rock.wet.dark` (the wet band at the waterline), `stone.travertine` (the flowstone and the calcite) |
| `core/shadow` | `KSHADOW`, off by default (`?shadow=1`) | as every kit |
| `core/export` | `07`, `09` | the krator-world container |

Not taken: `core/mask`, `core/city`, `core/hamlet`, `core/camp`, `core/simulation`, `core/furnish` (no settlement: Ys builds its
own caves, the Hykkousoi's roads are the sumps' records), `KTHERM` (no heat), `38-core-relief` (the page draws no surface).

**The lift into core** (both cave kits draw the same way; `README.md`, "Core modules are not optional"):
- `core/terrain/39d-core-cavern-floor.js` (`[G data]`): `KCAVERN.floorFn(C, {from, to, step, fallback})`, the lowest open
  point under a column read off the cavern's `sdf` (cached on a 1 m lattice), and `KCAVERN.openAt`; node-tested with negatives.
- `core/terrain/host/39e-core-cavern-draw.js` (`[web]`): `KCAVERN.drawRock(C, {THREE, material, tile, attrs, weight})`, the
  chunks merged into one mesh per tile with the page's per-vertex weights (the KGROUND layers' masks), and the ground's
  triangles inside an opening kept or dropped. The Hearths' `84-host-rock.js` moves onto it.

## 5. Checks (each with a negative)

- The cenote opens where nwbay's is: its centre within 1 m of (757.5, -91), its rim at nwbay's ground (30 +- .5).
- **The cave meets the surface only at the cenote**: over the box, no void within 1 m under the ground outside the cenote's
  rim.
- **Drowned**: every passage and chamber under the table is water, and every one has a `drown` record for air-breathers.
- The speleothems hang from a roof or stand on a floor (KSPELEO's records against the cavern's `sdf`).
- The views' eyes in the open (in water or air, not rock).

## 6. Order of work

1. The core lift (`39d`, `host/39e-core-cavern-draw`), its test; the Hearths' page onto it (byte-for-byte the same look).
2. The station: site and ground, the network and the cenote (`[G data]`), the rock, the dress, the water and the light, the
   views and the checks.
3. `check_core_use`, `test_all --no-build`, `verify.py --assert --all-views` (deferred: the owner, 2026-11-09), the baseline.

**Built (2026-11-09).** As planned: the cenote 0.00 m off nwbay's, the ground at its rim 30.1 (nwbay 30.0); 92 sumps and 5 flooded
chambers, 97 drowning records for air-breathers; 374 speleothems (stalactites, straws, curtains, columns, flowstone, rimstone, stalagmites);
~184 k rock triangles in 73 tiles; the cave meets the surface nowhere but the cenote (9,169 points checked).
