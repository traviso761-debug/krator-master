# nwlowlands: species from the wall above (plan, 2026-10-26)

The north-western lowlands lie under the planned **W outer wall** (`biomes/wouterwall/PLAN.md`, the loess bench). The
bench takes a few of the lowlands' species (crag pine, needle cypress, candle birch, tussock and saltbush, its section
3), and gives a few back (the owner, 2026-10-26). What comes down must fit **this kit's theme: blue, tall and lanky**
(`NOTES.md`, "The brief": verticality, clean boles, crowns high on steep limbs, bark from white to blue-grey).

**Status: plan, awaiting the owner.** Waits on the W outer wall's species. The lowlands **read them in place by key**; a
**derived** species is the source kit's builder called with this kit's habit and palette (an option to its `treeAt`),
never a copy of its code.

## What comes down

| Species | From | Zone (`NWLOW.zones`) | What it is here |
|---|---|---|---|
| **Blue puya** (derived) | wouterwall's puya spike | `med` (the hills, with the grass trees and banksias) | a blue-grey rosette under a lanky flower spike 15-20 m tall, the tallest thing on the dry hills |
| **Blue larch** (derived) | the larch the wall reads from `nwouterwall` | `med` uplands, at the wall's foot | a clean-boled larch with blue-green needles, crown high on steep limbs, in stands like the spire cedar's |
| **Dust spire** (derived) | wouterwall's dust tower | `med`, the driest hills nearest the wall | slender blue-grey spires of cemented silt, 10-25 m, where the wall's dust reaches the foot |

## The budget

The kit holds about **9.6M triangles** (`KNOWN_ISSUES.md`). **The owner gave it 3M more for the newcomers (2026-10-26):
up to ~12.6M.** They are added within that, not traded for existing species. Measured before and after (`verify.py
--views`), and `KNOWN_ISSUES.md`'s budget line updated.

## Order of work

- **N0.** The owner approves; the W outer wall's species exist.
- **N1.** The build reads the wall kit's fragments by name; the derived habits as options on their builders.
- **N2.** The replacements, measured.
- **N3.** `verify.py --assert`, `PORT.md`, the baseline row rewritten for this page (it moves on purpose), the gallery's
  files republished.
