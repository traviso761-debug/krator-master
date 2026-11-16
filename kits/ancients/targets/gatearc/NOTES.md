# gatearc: the Hall of Heroes and its stacks

The Kimrs' ancestral arcology at the Labyrinth's eastern mouth (`biomes/labyrinth/PLAN-GATE.md`), after Paolo Soleri's
Arcvillage II, with five rock stacks carved into gardens, works and mines and bridged to it. The owner named it on 2026-11-11:
the **Hall of Heroes**, a ruin where the Kimr bury their dead.

```
python build.py --target gatearc          # dist/gatearc.html: intact (west), the ruin (east)
node targets/gatearc/test-gatearc.js      # the plans in node: Soleri's numbers, the skin, the ruin, the necropolis, the stacks, the bridges
python verify.py dist/gatearc.html --assert
```

| Fragment | What |
|---|---|
| `8av0-gatearc-plan.js` | `[G data]` the Hall's plan (`GATEARC.plan`): columns, slabs, 2,149 skin cells, halls, piers, ribs, causeways, pond; `GATEARC.ruin` (deltas by id); `GATEARC.kimr` (niches, skull poles, biers, offerings) |
| `8av1-gatearc-draw.js` | `buildGatearc`: records in, geometry out, on the Arcube's skins (`MAT.ac*`); core/tags first |
| `8av2-gatestacks-plan.js` | `[G data]` the stacks on core/terrain's `KSTACKS`, their fittings on the rock's outline, the six bridges (stack ends embedded 14 m), the fall and pools; `GATESTACKS.ruin` |
| `8av3-gatestacks-draw.js` | `buildGatestacks`: the rock meshes, the fittings, the bridges, the sheet's water |

A world hosts both by setting `GATEARC.host` (`y`, `pond:false`, `stacks`, `sheet:false`) and `GATESTACKS.host` (`water:false`,
`ground`) before calling the builders into a holder and baking the kit (`biomes/labyrinth/src/89g-host-gate.js`). The fragments
live here, not in `src/`, so the kit's other pages do not change; the target takes core/rand, core/tags and `37-core-stacks.js`
(`build.py` `TAGS_TARGETS`, `TARGET_READS`).

Open: no interiors (the hollows are drawn as volumes with floors); the stacks' galleries are recesses, not voids (`KCARVE` waits
for the interiors pass); no rock library set (the rock is the kit's concrete map re-toned: the station uses the Labyrinth's
banded gneiss for its knobs); the Arcube's materials read near-black in a world host (`biomes/labyrinth/KNOWN_ISSUES.md`).
