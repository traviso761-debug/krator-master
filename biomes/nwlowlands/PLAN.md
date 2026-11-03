# biomes/nwlowlands: plan

## Core adoption (the final rebuild, pair 4, 2026-11-02)

The kit's turn in the all-biomes rebuild (`HANDOFF-REBUILD.md`, pair 4 with swlowlands; `BACKPORT.md` section 1, nwlowlands' row and section 5). nwlowlands
is a vendor: the Cut, Farside, Korona's basin and ringisles read its fragments in place. Every look change in `50`, `55` and `60` is on only where this kit's
own host asks (`NWLOW_LOOK`, set in `45-host-stage.js`; `NWLOW.treeK`, set by station 2), so those pages draw as before until their turns. `NWLOW.SPECIES` keeps its
23 keys and indices. **What readers do get, since it is no change to what is drawn:** `pad` is `free` and `bloom` is `onLeaf` to the attach audit (`50`).

Taken, each with its switch for the owner's look pass (`?x=0` turns it off):

| Item | Where | Switch |
|---|---|---|
| `BIO.INDEX_ITEMS`; `BIO.LOD.merge/minTris/fade/cull` | `45` | `?index=0`, `?lodmerge=0`, `?lodfade=0`, `?lodcull=0` |
| The far band's diet: heroes and culms to 900 m, floor's mid band 1000 m, far band 900 m, octahedral impostors past them, `BIO.impostorLook` gain 3.6 (nhighlands' measure) | `88` | `?diet=0`, `?impgain=`, `?impwrap=` |
| R8 wind, R7 alpha-to-coverage, R9 wet ground and puddles, R1 height fog with a dawn mist, R10 rain cover, lightning, wet weather | `89a` | `?wet=0`, `?hfog=0` |
| The fog belt on the Inner Wall (the row): 450-1150 m, windward the NW | `89a` | `?belt=0` |
| Seasons (H7): grass gold in the dry months, ginkgo, birch and poplar crowns thin; station 2's gums semi-deciduous | `50`, `99` | `?season=0` |
| Back-light on the broad crowns, R5 the grass's root in the ground's colour | `50`, `88` | `?backlit=0`, `?rootcol=0` |
| `BIO.bamboo.culm` for the sky culm (the belly lathe and the coil stay the kit's); `BIO.fung.bracket` for the bracket fungus | `50` | `?culm=0`, `?fung=0` |
| The shrub lobes' own skin (`shrub` on `leaf.understorey`; `KNOWN_ISSUES.md`) | `52`, `materials.json` | `?lobes=0` |
| KGROUND: six library layers on the masks below | `45`, `86` | `?kground=0` |
| KFAR (already), KHORIZON over the map and the range's far lattice | `83`, `88` | `?horizon=0` |
| **The marl gorge** (the row, `PLAN-FLORA.md`, `refs/01`): 26-40 m slot along the river, s 1350-2750, KSTRATA beds (`nwl-marl`) with ledges from the same record, `rock.marl.blue`, a 4 m ground strip, a turquoise ribbon (`proglacial` look: the row's clear-water look) | `45`, `86`, `87`, `89w` | `?marl=0` |
| The water's records before the build, `WATER.fields`, `BIO.env` | `86` | none |
| Natural ripples (ext/56), edge audit (ext/60), reflections switch (ext/58), off at load, on the lake | `89w`, `99` | the panel's button, `?mirror=` |
| Cousins (`EXCHANGES.md`): blue alder, blue laurel, blue ghost sycamore, pond cypress | `87k`, `build.py` NEIGH | `?kin=0` |
| Card fit: `check_cells.py --fix`, plus stems by hand on `needle`, `feather`, `ginkgo`, `blossom` (the tool can't see the kit's forEach of `BIO.def`) | `materials.json` | none |

### The ground: its documented masks

`GLW` in `86-host-fields.js` is the one table; each layer's weight comes from these and nothing else:

| Layer (slot) | Mask |
|---|---|
| rain floor (`ground.rainfloor`) | `FIELD.tropic` off the bayou, off the mud |
| lawn (`ground.lawn`) | the open tract: not tropic, dry, bayou or beach, by `FIELD.wet` |
| red soil (`groundDry`) | `FIELD.dry`, by a patch noise and `ENV.slope` |
| sand (`groundSand`) | the lake's beach, `seaIn`, off the steep |
| mud (`groundMud`) | within 24 m of the water's real edge (`WF.shore`), and the bayou |
| shingle (`groundGravel`) | the river's bars: the inside of a bend, within the river's reach (`WF.flow`), off the steep |
| marl (`rockMarl`, the gorge's strip only) | `gorgeCut` and `ENV.slope` |
| burn (`groundBurn`, station 2 only) | `KFIRE`'s age under 3 years |

The painted macro map still reads its own `seaIn` and `riverD`, since it is painted before the water's records exist. This turn doesn't address why the ground reads
"okay at best": the three-ground diagnosis hasn't run.

### Strata and scour feed placement

The gorge's ledges (ferns, moss, hanging moss) stand where `NW_MARL.hardnessAt` says a hard band stands proud, and talus lies at the walls' feet (`87-host-gorge.js`). Bars: shingle and
reeds on the same mask as the ground's shingle layer. No scour module: this ground has no scoured course.

### Wet ground and flora read the water's shore

`WATER.fields` over the lake and the river at 8 m. `FIELD.wet` takes `wetShare`, the kit's `shore` zone reads `FIELD.shoreM`, the host's mask stops at the real edge, and the rain's puddles mask reads it.
`hostChecks`: `WATER.edgeAudit` (no tree in the water, wet band on the edge) and `BIO.envCheck`, with a negative.

### Dropped, and why

- **Confluences and tall falls:** the river has no tributary or fall on this map.
- **KSTACKS.contour, KCARVE cave mouths:** no stack or scarp here. The gorge's undercut stays out: a heightfield can't hold one.
- **Blue puya, dust spire, blue larch (`PLAN-FLORA.md`):** its status is "awaiting the owner", and the first two wait on the W outer wall's species, which aren't built.
- **`goldroot`, `woolwillow`, `beardlichen`:** `EXCHANGES.md`'s rows put them on the Wall's own face, in `nwouterwall`, not in this kit.
- **Spray by drop:** the page has no falls.
- **Leafset (`31b`):** crowns take the card fit's `stems` (the owner's rule of 2026-10-27).
- **`WATER.breakup` by default:** taken on this page only; the flip of the default stays in `TODO.md`.
