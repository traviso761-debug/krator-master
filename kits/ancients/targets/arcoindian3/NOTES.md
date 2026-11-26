# Arcoindian III — Target Notes & Core Adoption

Target `arcoindian3` (`python3 kits/ancients/build.py --target arcoindian3` -> `kits/ancients/dist/arcoindian3.html`), seed block `12400`.

## Reference Images & Acceptance Frames (`VISUAL-BAR.md`)

- **References** (`targets/arcoindian3/reference/`):
  1. `ref1-vault-terraces.jpg` — Monumental warm sand-travertine barrel-vaulted crown with deep dark-glazed arch, tall narrow round-headed flank arcades, six stepped semicircular-arched terraces with nested post-and-lintel pavilions, and cascading exterior flank stairs.
  2. `ref2-fluted-towers.jpg` — Clustered cylindrical drums wrapped in vertical organic ribs flaring into chalice rims, curved glass & hanging-garden cutaways, circular rooftop woodland crowns, and sweeping flared-ribbed parabolic arch skybridges.
  3. `ref3-terracotta-oculus-pools.jpg` — Sun-baked rose-terracotta concrete courts pierced by stacked giant circular moon-gate oculi over ground arches, cantilevered slabs with circular soffit skylights, glowing alcove sconces, trailing vines, and paired emerald-jade mosaic plunge & reflecting pools.
- **Two Acceptance Frames** (`91z-views.js`):
  1. **Ground/Court Frame**: `'The emerald pool court'` — eye-level inside East Oculus Sanctuary Court 3 looking across the paired emerald mosaic basins toward the stacked circular moon-gates, cantilevered skylight slab, and glowing sconces.
  2. **Vista Frame**: `'Arcoindian III'` — three-quarter canyon vista across the gorge river framing the sheer sandstone cliff niche, central barrel-vaulted spine, clustered fluted towers, arch skybridges, and river quay.

## Core Adoption (`README.md`, "CORE MODULES ARE NOT OPTIONAL")

| Module | Taken | Reason / Binding |
|---|---|---|
| `core/rand` (`KRAND`) | Yes | All `[G data]` plan variations, ruin wrecks, and dress records hashed by `(seed, salt, a, b)` (`TAGS_TARGETS`) |
| `core/tags` (`KTAGS`) | Yes | Every building, structural part, interior Work/Live/Recreation unit, flora, prop, boat, and citizen registered in `KTAGS.arcoindian3` before drawing |
| `core/water` (`WATER`) | Yes | Gorge river (`still` + `flow`), 24 emerald-jade mosaic court pools (`still`), cliffside artesian springs, water-gate cascade, and the ruin's 238 m breached west cascade (`fall`) via `8au2` + `90w` |
| `core/atmos` (`ATMOS`) | Yes | `ATMOS.init`, shared wave field, and `ATMOS.skylight` bound for water reflections (`90w`, matching `targets/theodiga`) |
| `core/ruins` (`KRUINS`) | Yes | `KRUINS.watch` monitors the `d = 1` ruined site (`90w`): zero floating pieces, all fallen fluted drums and arch ribs seated on `ARCO3.groundY` |
| `core/lod`, `core/door`, `core/materials`, `core/shader` | Yes | Inherited through the shared `kits/ancients` pipeline |
| `core/host`, `core/terrain`, `core/world`, `core/biome` | Kit-level | Uses `kits/ancients`'s shared showcase host (`90-scene`, `91-probe`, `92-camera`), cliff showcase rock, and `VEG.tree` hand-off until sited on the open-world map |
| `core/city`, `core/simulation` | Blueprinted | Single-complex cliff arcology; full Work/Live/Recreation interior program and Modern Condition guide live in `ARCO3.plan` / `ARCO3.modernGuide` (`plan/BLUEPRINT.md`) ready for a modern inhabited target like `theodiga-today` |

## Files

| File | Tag | Role |
|---|---|---|
| `8au0-arcoindian3-plan.js` | `[G data]` | Site functions, structural plan, 92 Work/Live/Recreation/Civic interior units, circulation graph, ruin deltas, and modern-condition classifier |
| `8au1-arcoindian3-draw.js` | `[draw]` | Procedural stone/travertine/terracotta/fluted-rib/emerald-mosaic maps, `KTAGS` & `REGISTER`, merged 3D geometry, visible interiors, and seated ruin wrecks |
| `8au2-arcoindian3-water.js` | `[G data]` | `core/water` records in world space + `A3WATER.ground` for `KRUINS` |
| `89z-rows.js` | `[G data]` | Intact (`-1550`) and Ruined (`+1550`) canyon sites |
| `90w-arcoindian3-water.js` | `[draw]` | `ATMOS` + `WATER.draw*` + `KRUINS.watch` |
| `91z-views.js` | `[G data]` | 14 derived camera presets (both acceptance frames, 3 reference close-ups, interior loggia, night, and 3 ruin/sanctuary views) |
| `plan/` | Docs/PNG | `arcoindian3_plan.py`, `BLUEPRINT.md`, `AREAS.md`, and `sheets/*.png` |
| `../../tests/test-arcoindian3.js` | `[G data]` | 13 assertions + negative checks on `tools/ktest.js` |
