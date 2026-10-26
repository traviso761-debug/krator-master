# swlowlands: species from the highlands above (plan, 2026-10-26)

The south-western lowlands border two planned highland kits: the **SW highlands** (`biomes/swhighlands/PLAN.md`, native
fungoid life) on the east and the **W outer wall** (`biomes/wouterwall/PLAN.md`, the loess bench) on the west. Each
neighbour gives the lowlands a few species and takes a few back (the owner, 2026-10-26). What comes down must fit **this
kit's theme: red, wide and branching** (`NOTES.md`, "The brief": trees that make you small by being wide; red bark).

**Status: plan, awaiting the owner.** Waits on the highland kits' species. The lowlands **read them in place by key**;
a **derived** species is the source kit's builder called with this kit's habit and palette (an option to its `treeAt`),
never a copy of its code.

## What comes down

| Species | From | Zone (`SWLOW.zones`) | What it is here |
|---|---|---|---|
| **Fishing bridge** | swhighlands, as it is | `swamp`, `rip` (the bayou's channels) | the meat-eating tree rooted on both banks of a channel, its red crowns at either end, its arch hung with sticky vines over the water: wide and red already |
| **Red lattice sprawl** (derived) | swhighlands' lattice oak | `sub` | the lattice oak's braided-cord trunk on a sprawl oak's habit: long limbs resting on the ground and rising again, the cords lacquer-red, cup-pads along the limbs |
| **Coral melon** | swhighlands | `med` (the hills) | red coral arms branching wide, carrying green melons |
| **Bead coral** | swhighlands | `sub`, `med` floor | magenta branching arms beaded white |
| **Candelabra puya** (derived) | wouterwall's puya spike | `med` (the hills, with the agaves and yuccas) | a multi-headed puya: the rosette branches into several heads, each throwing a red-flowered spike, wide rather than tall |
| **Red dust reef** (derived) | wouterwall's dust tower | `med`, the driest hills | low, wide, branching reefs of red-cemented silt, the dust towers' lowland kin where the wall's dust reaches the foot |

Two more of the kit's own, for the edge under the highlands (references in `refs/`):

| Species | From | Zone | What it is here |
|---|---|---|---|
| **Spring cypress** (derived) | the kit's own cypress | `rip`, at the clear springs where the SW highlands' karst rivers come out | the Montezuma cypress (the Tule tree's kind): a bole many metres wide, fluted and buttressed, red-brown, roots sprawling over the bank and into gin-clear blue water, the crown low and wide (`refs/01`-`03`) |
| **Ribbon-root tree** (derived) | the kit's swamp builder | `swamp` | the Caribbean swamp bloodwood's habit: plank roots running far out over the mud in red-brown ribbons that snake and fold back on themselves (`refs/04`) |

What goes up: the sprawl oak (as the derived sprawl cap), the tier cedar, the flayed madrone and the ember manzanita to
the SW highlands; the tier cedar and the ember manzanita to the W outer wall (their plans, section 3).

## The budget

The kit holds about **11.6M triangles against a 12M ceiling** (`KNOWN_ISSUES.md`). **The owner raised the ceiling by 3M
for the newcomers (2026-10-26): 15M.** They are added within that, not traded for existing species; where one reads
better replacing (the fishing bridge for a few of the swamp's knee-cypresses by the channels), it may. Measured before and
after (`verify.py --views`), and `KNOWN_ISSUES.md`'s budget line updated to the new ceiling.

## Order of work

- **L0.** The owner approves; the highland kits' species exist.
- **L1.** The build reads the highland kits' fragments by name; the derived habits as options on their builders.
- **L2.** The replacements, measured.
- **L3.** `verify.py --assert`, `PORT.md`, the baseline row rewritten for this page (it moves on purpose), the gallery's
  files republished.
