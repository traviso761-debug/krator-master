# The Kimr kit: the plan (2026-11-11)

The culture kit `biomes/labyrinth/KIMR.md` said was due "when the pueblo station starts": the owner asked for an example house on the
pueblo builder on 2026-11-11, so it starts now with that one def. The design rules are `KIMR.md`; the culture `LORE.md` 6.24.

## Core adoption (written first, as `CLAUDE.md` asks)

Started from `kits/tungang`'s build (Wildcat's scrap pueblo, on core/engine and core/pueblo: the nearest finished build).

| Need | Module | How |
|---|---|---|
| the building engine (geometry buckets, defs, records, the sheet) | `core/engine` | read in place (`engine.py`) |
| pueblo plans (room cells, terraces, doors, hatches, ladders, the reach graph, the census) | `core/pueblo` (`KPUEBLO`) | read in place; `KM_HOUSE.spec` is a spec, `kmSite` adds the rock and the dress as records |
| randomness | `core/rand` (`KRAND`) | every draw `KRAND.hash(world, a, b, salt)` (`kmU`) |
| neighbours, overlaps | `core/space` | through core/pueblo |
| records | `core/tags` | `place` registers the house; `kmRegister` its rooms, ladders, rock, round room, pen and crest as children, before the draw |
| materials | `core/materials/record` | the families named in `SV_LIB`; no pack yet (vertex colours: the sets are owed, below) |
| host shell, sky | `core/host`, `core/atmos/placeholder` | as every kit on the engine |
| doors | `core/door` | the engine's `36o-open.js` needs it; the T-doors are openings under hide screens, not leaves (no door in a Kimr pueblo shuts) |
| furniture | `core/furnish` | the engine's pass (generic bundle); the house places no catalog pieces yet |
| walk | `core/walk` | not yet: the ladders and terraces want a walker's strips (next) |
| city, hamlet | `core/city`, `core/hamlet` | no: a Kimr village is a few houses on knobs; `core/hamlet`'s defended platform (biomes/labyrinth/PLAN.md section 7, amendment 4) places them when the station does |

`tools/check_core_use.py` passes (2026-11-11).

## Next

1. **The textures** (`core/materials/PROMPTS-NEEDED.md` section 41, and the library sets `KIMR.md` section 4 names): `materials.json`,
   `tools/textures/pack.py kits/kimr`, the sheet on library maps.
2. **A platform in core/pueblo**: the rock is this kit's record because `KPUEBLO` has no platform (its README expects one). When the
   owner of `core/pueblo` adds it, the rock moves there and `kmSite` keeps only the dress.
3. **The great house** (`greidhaws`: LORE.md 6.24): a D or a rect of several hundred people on a mesa bench, its lesser houses on the
   knobs round it.
4. **The masks, the dolls, the regalia** as catalog pieces (`kits/catalog` culture `kimr`), the round room's interior, the Mask House.
5. **core/walk** on the terraces and ladders; the ladders pulled up at night.
6. **The Labyrinth's village station**: the houses on the knobs above the gate (`biomes/labyrinth/PLAN.md` section 5).
