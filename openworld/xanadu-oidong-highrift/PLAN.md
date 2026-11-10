# Xanadu, Oidong and the High Rift: the plan

`openworld/PLAN-SITES.md` is the plan for every site. This file says what this region takes and what is left.

## Core adoption

| Module | Use here |
|---|---|
| `core/world` | the runtime, `KSITES` and `bake_sites.py` (the sites' plan), `88s` (its drawing) |
| `core/rand` | every seed: the flora by cell, the villages (`KHAMLET`'s seed from the world and the village's id) |
| `core/space` | the villages' boxes (`KHAMLET.village`) |
| `core/tags` | every village and building registered before it is drawn (build `xanadu-oidong-highrift:sites`) |
| `core/hamlet` | the villages (`KHAMLET.village`, the `xanadu` row) |
| `core/city` | its primitives only (`KCITY.prim`: the village's search for its ground and its frontage runs) |
| `core/biome` | the kits' trees and placement |
| `core/terrain` | the relief noise under `WORLD.H` |
| `core/atmos` | the sky and air |
| `core/water` | the rivers and lakes |
| `core/materials` | the kits' library packs, and the Xanadu building kit's (settlements/xanadu's pack, the village families) |
| `core/clock`, `core/shader` | the world's clock; the shader hooks |

Not taken, each with its reason:

| Module | Reason |
|---|---|
| `core/camp` | no bands here yet |
| `core/simulation` | the villages are not declared on the sim yet; the isle demo's hamlets are (`settlements/isle-demo` 47h), to be lifted with the economy |
| `core/mask` | nothing is placed from a mask |
| `core/host` | the world has its own camera and probe (`core/world` 90, 91) |

## What is left

1. **The other kits:**
   - the High Rift (the rift kit: no pass table as data);
   - the Godthrone's flank;
   - the rift rim (another session's kit; read it in place when it is settled);
   - the twins, Opal Valley and Godshearth, which have no kit.
2. **Bridges, then lay the links** between the towns. They cross carved river channels, and their fill would bury the
   rivers.
3. **Farmland and holdings** round the farming villages (busy-keller's `KHAMLET.farmland` and `farmHoldings`, sized from
   the towns' censuses with `KHAMLET.farmNeed`), and the hinterland survey lifted into core, so the villages are placed
   by the land's fitness rather than at given bearings.
4. **The towns:**
   - Erehwon is `settlements/xanadu`'s page;
   - Qiblai has none;
   - Longsong's monastery is its own page.

   A town on the world's ground waits on the town steps lifted out of `ISLE` (`PLAN-SITES.md` step 3).
5. **The villages on core/simulation.**
6. **The Xanadu kit's lake shore and its own pass table.** Both are in `KNOWN_ISSUES.md`.
