# biomes/korona: plan

The kit's design is `NOTES.md` (the corona country under the giant, the six stations, the life and the rule). This file holds what the
final rebuild did to it and what it left (`HANDOFF-REBUILD.md`, pair 9; `BACKPORT.md`).

## Core adoption (the final rebuild, pair 9, 2026-11-03)

Six pages, one kit: `dist/korona.html` (station 1, the tepui) and `--station hollow | basin | trench | gorge | hoar`. Every change below is in
`src/` (no station overrides the fragments named here, so all six take it), each look change behind a switch for the owner's look pass.

**The universal set (`BACKPORT.md` section 1):**

| Group | Taken | Where | Switch |
|---|---|---|---|
| Limb joints | `BIO.flareJoin` on the coin tree's limbs (the lace fan has no limbs: its fans ride its bole) | `55`, `31j` in `CORE_BIOME` | none (no draws moved) |
| Graphics | octahedral impostors for the far lace fans; the coin tree (2.5-6 m) keeps its blobs, under the 7 m the stand-ins start at | `55`, `34` | `?diet=0` |
| Cards | the 15 sheets the kit cuts by its own UVs (`cellUV`) marked `"sheet": "geometry"`: `check_cells` 0 faults, its baseline's 15 WHOLE SHEET rows gone | `materials.json` | none |
| Sky and air | height fog (R1) with a mist over the lowest water, the rain cover (R10), lightning with the weather, the wind on the foliage (R8), A2C (R7) | `89a`, `89z` | `?hfog=0` |
| Water | the stream's glint broken up (ext/56), the audit (57) and the shore's fields (60) on the page; no surf or breakers anywhere (every water here is still) | `89w`, `89z` | `?fields=0` |
| Reflections | `WATER.mirrorSwitch` on the station's lake, **off at load**: the basin's Tiers' lake and the trenches' salt lake (its two arms at one level) are their own mesh now; the other stations have no still over 400 m and take none | `89w`, `98z` | the panel's button, `?mirror=probe` / `live` |
| Shadows | `KSHADOW` on every page, **off by default** (the owner, 2026-11-03): `?shadow=1` turns it on | `89z` | `?shadow=1` |
| Ground | `KGROUND` for the floor's second to fourth layers (the base layer stays dithered as judged); `KFAR` past the map to 9 km from the station's own floor function; `KHORIZON` over the square and the far field, on the floor and, after the bake, every lit material | `47`, `85`, `89z` | `?kground=0`, `?far=0`, `?hz=0` |
| Export | rides with the merge | | |
| `KHOOK.warp` | not taken: no anomaly at Korona (the slot is empty until `core/anomaly`) | | |

**Korona's row (`BACKPORT.md` section 2 and 5):**

- **Strata (the tepui sandstone): taken.** `KSTRATA`'s `tepui` recipe on every wall (one stack a station, the beds' mean as the tint's
  pivot, half strength over the bodies' own banding): `47`, `?strata=0`. The 5.1 geology rebake agrees (`kits/resources/ROCK-PROPOSAL.md`:
  73% of the region is now `quartzite`, which the kit draws; checked against the rebake's table, 2026-11-03).
- **`KSTACKS.contour` and `KSTACKS.weather` (section 5): taken** on every body: joints down the tables' and buttes' walls with no
  profile change (their rims stay where the records put them: carvings, icefalls and wall plants read the records), profiles on the
  stacks and spires; two grains of weathering. `?contour=0`, `?weather=0`.
- **Talus, tor, dome: not taken.** The talus is the kit's own (`STAGE.talusH`, the source the core's talus was written from); no station
  has a tor or a dome on its survey.
- **Ground shader `polygon` (the hoar table): not taken.** The hoar table's pavement is a KSTACKS top (`MAT_TOP`), not the floor KGROUND
  hooks; a polygon layer there wants KGROUND on the top's material, a second hook. Owed to the hoar's next pass.
- **Fog belt on the tepuis: taken.** `ATMOS.fogBelt` on the highest body's windward (north-west) walls, a third of the way up to its top;
  the hoar table's on its lower wall only (the cloud sea it stands over); none in the dry lee gorge. `STAGE.belt` overrides; `?belt=0`.
- **Ice on the hoar table's pools: already** (the frozen tarn is a plate of ice, `pools[].ice`).
- **Reach for the ecotones, seasons: not taken.** The ecotones read their kits in place (nwlowlands, nhighlands, sedesert, ehighlands) as
  before; Korona's tropics have no season the plan names.
- **The punji pit: already** (`core/hazard`).
- **Cave mouths (KCARVE) in the trenches, and karst site 7: not taken.** `biomes/KARST-SITES-5.1.md` site 7 (the west trench rims:
  gypsum dolines, a salt-shore spring) says to place it "when Korona's stations have 5.1 px", and they have none yet (`STATIONS-MAP-5.1.md`:
  within 100 m and class unchanged, not re-surveyed). Owed to the trenches' re-survey.

**Fixed on the way:** the necanyons kit, read in place, hangs its seep curtains and ferns at a bed's outline, but KSTACKS draws the lip
at the cap's overhang (`footR x (1 - ch)`), which on a tepui's caps is 6-30 m in: station 1's attach audit failed at 1.7%. `89z` pulls each
in along its bed's radius to .35 m off the drawn lip (positions only; `?seat=0`). The necanyons page keeps its own placement (its caps' `ch`
is small); the fix in its `57` is owed to its next turn, since 9 build commands and 38 pages read it.

**Exchanges (`EXCHANGES.md`):**
- As vendor: `KORONA.plant(key, x, y, z, {lv, seed, id})` grows one `frosttank`, `butterwort`, `cobralily` or `greatsundew` with the kit's
  own builder for a reader (ebadlands' melt pools, nwouterwall's bog, nhighlands' seeps, the crater drylands' seeps). Nothing here calls it.
  `wallfern` and `bladderpool` are placed by the kit's passes against the wall and the pools, not one at a time: owed.
- As receiver: none taken this turn. The bristlecone (ebadlands, on the hoar table) wants ebadlands' species and trees read in place on a
  station that already reads ehighlands; the caribou moss (nwouterwall) and the ghost gum (crater drylands) wait on their vendors' turns;
  the sea buckthorn (nsemiarid) waits on the nsemiarid turn running beside this one.

**Species for readers:** no other build reads Korona's species (`tools/reach.py`). Keys and indices unchanged (`KORONA.SPECIES` 0 coin tree,
1 lace fan; `KORONA.PLANTS` as before). The coin tree's limbs are flared at the trunk; the far lace fans are impostors.

**For the owner's eye:** the tepui's beds (KSTRATA's tepui over the kit's own banding: two banding systems, the kit's per tier and the
recipe's per bed), the fog belt's height, the far field (the station's floor function carried 9 km with no tables on it), KGROUND's floor
against the dithered one (`?kground=0`), the shadows (`?shadow=1`).
