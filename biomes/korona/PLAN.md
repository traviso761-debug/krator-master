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

---

## Scale-Model 5.1 Geological Reconciliation & Showcase Station #7 (`2026-11-13`)

### 1. Corona Plume-Tectonic Lithology & Resource Hygiene (`tepui` + `obsidian-pancake` + `contact-marble`)
- **Summit Hoar-Tables vs. Deep Ring-Fault Trenches (`GEOLOGY-SANITY-CHECK.md` §3):** Korona is an active Venusian-type mantle-plume corona whose concentric ring horsts uplift ancient pre-impact **`tepui`** orthoquartzite and indurated arkose tables (`+1,500 to +4,100 m`), while active magmatic/hydrothermal degassing is strictly confined to the deep concentric ring-fault trenches (`-1,000 to -2,600 m`, `1.75–2.10 atm`).
  - **Purge Summit `sulfur = 60`:** High quartzite hoar-table summits carry **zero fumarolic sulfur** (`sulfur = 0` on upland tables); native sulfur, geyserite sinter (`geyser` station `corona`, `1123, 517`), and acid-sulfate springs occur **only** along deep ring-fault trench floors.
  - **5 Trench Viscous Pancake Domes (`obsidian-pancake`):** Five flat-topped Venusian-type silicic rhyolite/dacite pancake domes extrude along the eastern and southern ring-fault floor intersections (anchored at **`5.1 px (1179, 578)`**), bound to `KSTRATA` **`obsidian-pancake`** (`core/terrain/35-core-strata.js` — `2–6 m` flow-banded glassy obsidian carapace ledges with iridescent `irid: 1` sheen over frothy grey pumice and basal perlite breccia).
  - **Trench-Wall Skarn & Evaporite Contacts:** Where plume ring-dikes cut buried intracrater carbonate lenses on lower trench walls (`KARST-SITES-5.1.md` Site #7), walls expose **`contact-marble`** skarn ribs above **`evaporite-strand`** endorheic salt-lake shorelines.

### 2. Showcase Station #7 — `Korona Silkhead Gorge & Hoar-Table Rim`
- **Canonical `5.1` Coordinates:** **`(1096, 526)`** (primary Silkhead Gorge overhang & `+3,620 m` hoar-table rim plunging toward the `-1,180 m` wet ring-trench) paired with **`(1179, 578)`** (viscous trench-floor pancake dome view).
- **Elevation & Atmosphere:** **`+3,620 m`** summit rim (`0.99 atm`, `Dsc` / `Cwb` hoar-table mist & frost-tank pavement) dropping `4,800 m` across sheer tiered walls into the **`-1,180 m`** ring-fault trench (`1.86 atm`, `XA` / `Af` carnivorous-pitcher rainforest and steaming ring-fault vents).
- **`KSTRATA` Binding:** **`tepui`** (pink-to-cream cross-bedded orthoquartzite cliff tiers with recessed dark siltstone/shale contour-carving ledges on the upper `3,000 m` wall) + **`contact-marble`** (recrystallized blue-white marble & epidote skarn selvages along the lower ring-fault dike contact) + **`obsidian-pancake`** (vitreous black flow-banded rhyolite dome carapace steaming on the trench floor at `1179, 578`).
- **Camera Framing (`5.0 × 5.0 km` vertical relief cut):** Vertigo overhang camera tucked under a carved `KCARVE` lip at `+3,580 m` looking ESE along the curved corona ring-scarp: Hum whistle-script contour carvings (`culture: tepui`) etched into a continuous `tepui` bedding recess in the foreground, woven wild-silk basket spans and braided liana rope-ladders bridging a `180 m` gorge cleft, `ATMOS.fogBelt` cloud cascades spilling off the table lip, and `4.7 km` below in dense golden `1.86 atm` haze, a circular `obsidian-pancake` dome steaming beside black pitcher pools.
- **Hydrology & Trade Tie-In:** Windward (`3,500–4,000 mm/yr`) cloud-water and frost-tank snowmelt plunge off the `tepui` rim as `600 m` free-falling mist-veils (`WATER.fall`) into endorheic trench lakes; winter-adapted hoar-table tribes and Hum-speaking cliff clans hoist rare trench-floor carnivore reagents, lichen stone-dyes, and knapped trench `obsidian-pancake` blades up silk-winch stations to trade with the **Painted Men** (`LORE.md §6.5`) and **Serai** caravans.

### 3. Station 7 as built (`stations/silkhead`, `dist/korona-silkhead.html`; 2026-11-16)

`python3 build.py --station silkhead`. On station 1's host and `47` unchanged (no `src/` fragment moved: the six other pages are as before);
the station's own `45` (the stage), `89-host-sky`, `89x-host-silkhead` (the lip, the veils, the spans, the dome's glass and steam, the
hazards) and `99-host-take` (views, inspector, checks).

| The spec | As built |
|---|---|
| `(1096, 526)`, rim `+3,620 m`, trench `-1,180 m` | the spec's heights, not today's model's (the model has the table at 1,430-1,570 m there: `KNOWN_ISSUES.md`, the map change queued). y 0 is -1,180 m, the rim y 4,800. The model's setting kept: the trench east and south of the table |
| sheer tiered walls, 4,800 m | three KSTACKS bodies of five tiers (the table, a spur running out ESE, the Silkhead tower beside it): benches at +270, +1,670 and +3,020 m, 70-140 m wide; the summit wall 560-600 m; the spur's 40 m cap over a 30 m ledge (the bedding recess) at +3,580 m |
| vertigo camera under a carved `KCARVE` lip at `+3,580 m` | a KCARVE alcove through the ledge at the spur's tip (`core/terrain/36-core-carve.js`, read by path through `station.json`): its hood the cap's rock run out over the ledge, its mouth on the ledge's edge, meshed on the walls' strata; the view "Vertigo (under the lip at +3580 m)" stands 0.6 m in from the drop and looks ESE down at the dome, the ledge's edge across the foot of the frame |
| Hum contour carvings in a continuous bedding recess | `STAGE.carvings` on the spur's cap above the ledge, beside the lip (`47`'s carvings, `culture: korona-tepui`) |
| silk basket spans and liana rope-ladders over a 180 m cleft | Silkhead Gorge between the spur and the Silkhead, 170-180 m rim to rim at its narrows, joined by the col 600 m under the rims: two wild-silk basket spans, a liana ladder bridge, a liana ladder hung 600 m down the Silkhead's face to the col (`core/biome/45-core-span.js`, KSPAN catenaries between the drawn rims); a silk-winch on the spur's north flank by its tip lowering its line to the bench |
| `ATMOS.fogBelt` cloud cascades off the lip | the fog belt from +2,470 m to the rim on the faces turned to the trench's wet air (ESE) (`STAGE.belt`, `89a`); spray at each veil's foot. No drawn cloud spilling over the lip: core/atmos has none (`KNOWN_ISSUES.md`) |
| 600 m mist-veils (`WATER.fall`) into endorheic trench lakes | four `WATER.fall` curtains stacked down the Silkhead's north face (600 m free fall from its rim, then 1,350, 1,400 and 1,450 m), each fitted to its bench (`fit: true`), the last into the trench lake (a `WATER.still` with no outlet) |
| `tepui` + `contact-marble` + `obsidian-pancake` | one KSTRATA stack (`STAGE.strata`): contact-marble from the walls' foot to 550 m over the floor (the skarn on the ring-fault dike contact), the tepui's quartzite above, a lateral stack of obsidian-pancake east of x 20 (the dome) |
| an obsidian-pancake dome steaming beside black pitcher pools, 4.7 km below | a KSTACKS `dome` 1.3 km across and 150 m high on the trench floor (steep-sided and flat-topped, k 5), its rock darkened to the glass; steam over four fissures and two ring-fault vents (`core/atmos/fx/89-atmos-fx-plumes.js`; heat and gas on `core/hazard`); black pitcher pools on its apron (trap pads, the bladder pool's trap) |
| `XA`/`Af` pitcher rainforest; `Dsc`/`Cwb` frost-tank pavement | the hyperjungle and the kit's man-eaters on the trench floor (warm by height: 1 on the floor, .08 at the rim); the eastern highlands' cushions and the frost tanks and butterworts round the rain pools on the summit; no dangerous trap and no vent above the col (the summit's sulfur 0) |

Not as the spec says: the dome is the station's own and small (the model's dome 4, 16 km at 1179,578, is 196 km away, and the nearest, dome 2,
95 km: scale model 5.1 edit 8 on main, `DATA.domes`; not on this branch's model yet); the main frame holds the lip, the carvings, the veils, the Silkhead's face and the trench, but not
the spans (from inside the cleft the col hides the drop; the spans have their own view). `KNOWN_ISSUES.md` lists the rest.
