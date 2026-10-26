# swbay: the highland kin, backfilled (plan, 2026-10-26)

The south-western highlands (`biomes/swhighlands/PLAN.md`) are the bay's fungoid lineage climbing out of the bay. Some
of that new flora belongs down here too (the owner, 2026-10-26): the same life at the bottom of its range, so the bay
and the highlands read as one country.

**Status: plan, awaiting the owner.** Waits on the highlands kit's species (its H3-H4): the bay **reads them in place by
key** from `biomes/swhighlands`, as `nwouterwall` reads `nhighlands`, and copies nothing.

## What comes down, and where

The bay's zones are `hyper` (the bay jungle), `rain` (the rainforest on the rise), `sav` (the parasol savannah on the
highlands' foot) and `shore` (`BIOME-API.md`, `SWBAY.zones`). References: `biomes/swhighlands/refs/`.

| Species | Ref | Zone | Role here |
|---|---|---|---|
| **Fishing bridge** | 13 | `rain`, `hyper` along the river | over the river below the cataracts: the set piece moves to where the bay's river is |
| **Stilt pod tree** | 02 | `rain`, the river's banks | on the slope's slips and the river's cut banks |
| **Weeping wisp** | 08 | `rain` | a few, glowing in the rainforest at night |
| **Bead cone** | 14 | `rain` | in the understorey with the crown ferns |
| **Shelf coral** | 07 | `sav` | on the savannah's lava boulders: the rock-eater on the volcano's rubble |
| **Bulb heath** | 09, 19 | `sav` | in clumps between the parasols, among the fairy rings |
| **Arrowheads**, **coral melon** | 20 | `sav` | the dry savannah's succulents |
| **Bearded triplets**, **glow tubes** | 20, 19 | `hyper` | the jungle floor's understorey and night lights |
| **Log crust** | 12, 19 | every zone with logs | on the mossed logs and driftwood, beside the bay's own brackets and mushrooms |
| **Blue-berry bract** | 19 | every bole | one more kind in the epiphyte set |
| **Drip cap** | 19 | the dress pass | on the ruined jetty and the Girder tower: the first species the dress pass grows on structures |

Not coming down: the lattice oak, the pillar cap, the whorl column, the bottle brush, the anemone tree and the alpine
species, which belong to the highlands' cooler ground. The bay's own cap-tree stays its canopy mushroom.

## The budget

The bay holds about **10.1M triangles** at `quality:1`, the agreed 10M (`KNOWN_ISSUES.md`). The backfill **replaces, it
does not add**: each new species takes its share of an existing species' instances in its zone (the fishing bridge one
of the river's set pieces; the stilt pod trees some of the rainforest's splay shrubs and bracket trees; the shelf coral
some lava boulders), and the scene is measured before and after (`verify.py --views`).

## Order of work

- **B0.** The owner approves; the highlands kit's species exist (`biomes/swhighlands` H3-H4).
- **B1.** The bay's build reads the highlands' fragments by name (its `build.py`); the zones take the new species by key.
- **B2.** The replacements, measured; the dress pass's drip cap.
- **B3.** `verify.py --assert`, the views measured, `PORT.md`, `PORT-BASELINE.json` rewritten for the bay's page (it moves
  on purpose), the gallery's bay files republished.
