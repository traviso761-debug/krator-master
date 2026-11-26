# Arcodiga — notes

Paolo Soleri's **Plate 18: Arcodiga** dam arcology, built in `kits/ancients/targets/arcodiga` (`dist/arcodiga.html`) with `[G data]` interiors planned across all 5 Soleri organs so the refurbished state (`d = 3`, placed at `x = 0`) serves directly as a settlement centerpiece. Full design, proportions and socket API are in `plan/BLUEPRINT.md` and `plan/AREAS.md`.

## Files

| File | Tag | What |
|---|---|---|
| `8av0-arcodiga-plan.js` | `[G data]` | Parametric arch dam, stiffening wing saddle, VTOL tower, axial spine, 4 prows, 16 ribs, powerhouse, silt basins, circulation graph (`reach`), `refurb` bulkheads, `ruin` deltas |
| `8av1-arcodiga-interiors.js` | `[G data]` | 60 units / 73 storeys / 1,143 rooms on `kits/ancients-interiors` (`wing`, `spine`, `crest`, `ribs`, `dormant`, `works`), audited across 6 cultures |
| `8av2-arcodiga-water.js` | `[G data]` | `core/water` records (reservoirs, hydro chutes, Y-waterways, silt cisterns, 211 m breach cascade) and `ADG_WATER.ground` |
| `8av2b-arcodiga-parts.js` | `[draw]` | Canyon cliffs with highway portals, reservoir/valley beds, 3 circular silt basins, Stiffening Wing, VTOL Airport, Axial Spine, Powerhouse & Industries |
| `8av3-arcodiga-draw.js` | `[draw]` | `buildArcodiga` (`reseed(12700+d)`): `KTAGS` registration, arch dam, Notch breach, light tunnels, 17 oculi, 4 prows, active vs bulkheaded dormant ribs, seated debris |
| `8zz3-arcodiga-host.js` | `[draw]` | Splits interiors into 6 organ sub-sites per decay, furnishes refurbished active organs while keeping `dormant` as a `rehab` socket, exposes `_api.arcodigaSocket(culture)` |
| `90w-arcodiga-water.js` | `[draw]` | Binds `core/atmos` skylight/waves to `WATER` meshes and watches the `d = 1` ruin with `KRUINS.watch` |
| `89z-rows.js`, `91z-views.js` | `[G data]` | Three states (`d = 0` west, `d = 3` origin, `d = 1` east) and 14 exterior + cut-away camera presets |
| `test-arcodiga.js` | `[G data]` | `node kits/ancients/targets/arcodiga/test-arcodiga.js` (24 checks + negatives on `tools/ktest.js`) |
| `plan/` | docs | `arcodiga_blueprint.py`, `BLUEPRINT.md`, `AREAS.md`, `sheets/*.png` |

## Host & Open-World Integration (`ARCODIGA.HULL` & `opts.noTerrain`)

- **Terrain PRNG Insulation**: `buildArcodiga(scene, gx, gz, d, opts)` runs synthetic cliff/valley generation (`adgLand`) inside its own isolated `reseed(12790 + d)` sub-block and resets `reseed(12700 + d)` unconditionally before drawing the megastructure. Passing `{ noTerrain: true }` (and optional `ground: (wx, wz) => y` / `noWater: true`) suppresses `meshMerged(ROCK, ...)` and all demo cliff/valley geometry without shifting a single `rng()` draw of the megastructure.
- **Hull Descriptor (`ARCODIGA.HULL` / `buildArcodiga.hull` / `G_ARCH.userData.hull`)**: Exposes `span` (`1460`), `wingSpan` (`2040`), `H` (`360`), `vtolH` (`432`), `zUp(x)`, `toe(x)` / `toeZ(x)`, `zDs(x, y)`, `nDs(x)`, `thAt(y)`, `rAt(y)`, `vtol.rAt(y)`, `waterline(d)` and `tailraceQuay` so water, tideline and dock fragments snap directly to the concrete faces without magic numbers.

## Build & Verify

```bash
python3 tools/build.py kits/ancients --target arcodiga
node kits/ancients/targets/arcodiga/test-arcodiga.js
python3 kits/ancients/verify.py kits/ancients/dist/arcodiga.html --assert --out kits/ancients/shots-arcodiga
```
