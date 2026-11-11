# Backporting the new core modules and shaders to the existing biomes

The owner (2026-10-26): "come up with a plan for associating the new core modules and shaders to old biomes". The modules
written for the planned biomes (the hyperjungle lands, the SW highlands, the Godthrone, Godstep, the W outer wall, the
Outlands) and for the rebuild itself are general. Most existing biomes have a place where one of them reads better than the
kit's own copy, or where nothing was drawn before. This plan says which biome takes which, so each biome's turn in the final
rebuild (`HANDOFF-REBUILD.md`, "The job") takes its row along with the universal set. A row is a proposal: each biome's
session checks it against the kit's own plan and the scale model, and the owner judges the look at that biome's look pass.

Nothing here is built yet. The modules are on `claude/biome-rebuild`; each has an "Adopting it" section in its README.

## 1. The universal set: every rebuilt biome and station

Nhighlands is the worked example (`biomes/nhighlands`: `45-host-stage.js`, `55` impostors, `88-host-build.js`,
`89a-host-atmos.js`, `89w-host-water.js`; `PERF.md`).

| Group | Modules | Note |
|---|---|---|
| **Graphics** (`GRAPHIC-LOAD.md`) | `BIO.INDEX_ITEMS`; `BIO.LOD.merge`, `minTris`, `fade`, **`cull`**; heroes to ~800 m with **octahedral impostors** beyond (`34-core-impostor.js`, `BIO.impostorLook` measured against the near crowns: the bake is ~4x dark until the core fix in `HANDOFF-REBUILD.md`); a shortened far floor band | measured on the Intel GPU before and after; switches such as `?diet=0` for the owner |
| **Cards** | `tools/textures/check_cells.py` at zero faults: floor cards take the sheet's cell, crown clumps `BIO.geo.cells` | 284 faults in 31 builds on 2026-10-26 |
| **Shared parts** | `BIO.fung` for every fungoid part (TODO.md's list), `BIO.bamboo` for every bamboo | the kit's own copy goes |
| **Limb joints** | `BIO.flareJoin` (`31j-core-joint.js`) on every limb that leaves a trunk or another limb as a `BIO.tube` (the owner, 2026-11-03: future builds and rebuilds) | where a join shows: hero and mid trees, shrubs with visible forks; not far tiers, impostors, cards or grass; `core/biome/README.md`, "A limb's joint to its parent" |
| **Sky and air** | the shared sky (the giant lit along its rings, load at `viewHour`), height fog, rain cover (3 m margin), lightning, `bindWeather` | already in most kits; check each |
| **Water** | `margin`, `spray:'drop'`, `lipK`, `chute`, wet ground and puddles (`WATER.hollows`), W4 gradients | where the kit has water |
| **No breakers on still water** (the owner, 2026-11-02) | a lake or a sheltered arm drawn by `WATER.draw` takes `surf:false, breakers:false`: a shore grid's breakers drew white contour rings round every island and stripes along the banks. A sea keeps them | done: swlowlands (and its delta), nwlowlands. Owed at their turns: the Catch's lake station, the Cut, k-guilin, the Throne's glacier, xanadu |
| **Reflections** | `WATER.mirrorSwitch` on the kit's largest still, **off at page load** | where the kit has a large still; `core/water/README.md`, "The reflections switch" |
| **Sun shadows** | `KSHADOW.attach` (core/shadow), **toggleable and off by default** (the owner, 2026-11-03): the panel's `shadows` button or `?shadow=1`; off costs nothing (no shadow pass, no shadow variant) | every build and rebuild, where the lit materials keep one texture unit free for the map; `core/shadow/README.md`, "Off by default" |
| **Ground** | `KGROUND` (the core ground shader), `KHORIZON` shadows, `KFAR` far field | where the kit still paints its own ground |
| **Export** | the split by `lod.ranges`, per-instance labels, the hazards section | automatic once the page takes the merge |

## 2. The new modules, by biome

The columns are the new modules' groups: **terrain** (`KSTRATA` recipes; `KRELIEF`/`KSTACKS` kinds: wadi, talus, dome, tor,
pit, pavement, rille, colonnade, lava tube, pit chain, lava step, arch, water gap, mound), **ground shader** (`KGROUND` kinds:
`clast`, `sand`, `polygon`), **air** (fog belt, thin air, rain wall, acid rain, the air's load: dust, ash, alkali), **water ext**
(brine, pan, ice, seep dam, karst spring, bloodfalls, weed, clear and gin-clear looks, seasonal levels), **life** (seasons, `KFIRE`,
`BIO.leanTo`, `BIO.kin`, reach, fauna by land, 480 m trees), **hazards** (`KHAZ` kinds, taboo areas).

| Biome | Terrain | Ground shader | Air | Water ext | Life | Hazards |
|---|---|---|---|---|---|---|
| **abyssal-savannah** | strata on the bench's edge; talus under the cliffs; **mounds** | | dust in the dry season | seasonal pool levels | **seasons**, **KFIRE** burn mosaic, fauna by land | fire |
| **catch** (fan, lake, oasis) | strata on the 10-17 km walls; **wadi** on the fan; pavement | **sand** (the sand sea), **polygon** (the playa) | **dust and alkali storms**; thin air on the high walls | **brine and pan** (the salt lake) | reach for the few oases' plants | storms, alkali, the Stalkers' sand (already in `KHAZ`) |
| **crater-drylands** N and S | **mounds**, wadi, talus; `tibasalt` strata at the southern edge | polygon (dry pans) | dust | | **KFIRE** (the kit's FIRE moves onto it, H3), seasons, **reach** (the Cut's exchanges, N only; the hyperjungle plan's southern patch, S) | fire |
| **cut** (face, wall) | strata on the cut faces (the polished recipe) | | | | **BIO.bamboo** (hyperbamboo), kin and reach for its exchanges | |
| **eastabyss** | strata on the abyss walls | | a fog belt in the abyss's mist | | **BIO.kin source** (the hyperjungle plan's cousins), seasons | |
| **ebadlands** | **the strata showcase** (badland banding); wadi, talus, dome, tor, pavement | **clast**, polygon (desert pavement) | dust | | the crust on `BIO.fung` | |
| **ehighlands** | strata | | **fog belt** and **rain wall** on the rainy west face (station 2) | | **BIO.leanTo** (EHIGH.GIANT moves onto it, H4), kin, seasons | |
| **farside** (cloud, front, strand) | | sand on the strand | **fog belt** (the cloud station) | weed in the shallows | seasons | |
| **geyser** | strata in the sinter terraces | polygon on the sinter flats | | **brine** looks for the hot pools; karst-spring vents | | **vents and hot ground** (`KHAZ`) |
| **guilin** | *frozen as an Earth reference: no change* | | | | | |
| **hyperjungle** | (the lands plan) | | | seasonal lake level (várzea) | **all of H1-H10**: reach, kin, bamboo (howl bamboo), seasons, fauna by land, 480 m trees; KFIRE and mounds for the savannah rims | fire on the rims |
| **k-guilin** | strata (the tower limestone); arches and water gaps in the karst | | fog belt in the karst valleys | **karst springs**, clear-water look | **BIO.bamboo** (phoenix-tail: the owner's note) | |
| **korona** (5 stations) | strata (the tepui sandstone); talus (the source of the core's talus), tor, dome | **polygon** (the hoar table) | fog belt on the tepuis | ice on the hoar table's pools | reach for its ecotones, seasons | the punji pit (already) |
| **necanyons** | **strata** (the canyon recipe: a showcase); arches, talus, wadi, pavement | clast on the scree | | **seep dam**, karst springs at the seeps | | |
| **nhighlands** | strata on the crags | | fog belt on the crest band | ice on the tarn in frozen weather | **seasons** (deciduous drop) | |
| **nsemiarid** | wadi, pavement | **polygon** (the soda crust) | dust | **brine and pan** (the soda pans) | **seasons** (steppe colour), KFIRE (steppe fires) | fire |
| **nwbay** | strata on the sea cliffs | | fog belt (sea fog) | weed (kelp beds) | seasons | |
| **nwlowlands** | strata (the marl gorge, a ride-along) | | fog belt on the Inner Wall range | clear-water look | **BIO.bamboo** (sky bamboo), **seasons**, **reach and kin** (the flora exchanges) | |
| **nwouterwall** (taiga, yeti) | strata on the wall, talus | **polygon** (permafrost) | thin air on the crest | **ice** (the frozen lake) | seasons (snow) | |
| **oidong** | strata on the valley walls | | fog belt | (the terraces already) seasonal levels on the paddies | **kin** (the five species shared with xanadu), seasons | |
| **rift** | *re-planned as three stations (`biomes/rift/PLAN-STATIONS.md`, in progress)*: the savannah, the jungle, the cloud-forest highlands | | | | sky-island families by `BIO.kin` from riftrim's and the current upland plants | |
| **ringisles** | strata on the geode cliffs | sand on the beaches | fog belt (sea fog) | weed (seagrass), brine in the salt flats | seasons | |
| **scablands**, **dambasins** (overlays) | pavement; the dam basins' beds | polygon on the dried beds | | **seep dam** (the dam basins) | | |
| **sedesert** (and bowl, mantis, steppe) | strata (mesas), wadi, talus, pavement, dome | **sand** (dunes), clast, polygon (salt crust) | **dust storms** | **brine and pan** (the Bowl's salt lake) | seasons on the steppe | storms |
| **shighlands** | **strata** (the banded walls) | | fog belt, rain wall on the windward face | | kin, seasons | |
| **swbay** | | | fog belt | karst springs, clear-water look | **BIO.fung** (its fungoid lineage, in earnest, kin of the SW highlands'), seasons | |
| **swlowlands** | | | | **karst springs** (the clear springs), weed (comb weed), clear-water look | **seasons**, reach and kin (the flora exchanges) | |
| **throne** (10 stations) | `tibasalt` strata on the caldera; **pit chains and lava tubes** (the tube station), lava steps, rilles (kipuka) | **clast** (caldera walls), **sand** (black ash sand: the ash desert), polygon (the glacier) | **thin air** (caldera), **ash** load (ash desert), **acid rain** (vents) | **ice** (glacier), brine (vents' pools) | KFIRE, seasons and **mounds** (savanna station) | **lava and vents** (vents station: the hazard test bed) |
| **xanadu** | strata, arches | | fog belt | | kin (the species shared with oidong), seasons | |

## 3. How each biome takes its row

1. The biome's session reads its row, its own `PLAN.md` and `KNOWN_ISSUES.md`, and checks the row against the scale model
   (strata recipes and landform sites come from the ground, not from this table).
2. It writes the kit's `PLAN.md` "Core adoption" section with the universal set and its row, marking anything it drops and
   why, then builds.
3. Each new kind lands behind an opt-in switch or a query flag where the look changes (as `?diet=0` on nhighlands), so the owner
   can compare at the look pass.
4. **Verify once**, at the biome's turn (the owner: no exhaustive verifies of every build a core change reaches).
5. Textures a row needs and the library lacks go into `core/materials/PROMPTS-NEEDED.md` (the new modules already listed theirs:
   termite clay, etched metal and stone, the evaporites).

## 4. Order

The handoff's order holds: the Throne's vents (the hazards test bed), the NW outer wall, the rift (now three stations), then
every other biome. Where a row is large (the Throne, the hyperjungle, sedesert, ebadlands, necanyons) its terrain and air
columns are the look changes to judge first; seasons and kin can follow in a second pass without moving placement.

## 5. Core changes since this plan (reconciled 2026-10-27)

These landed on `claude/biome-rebuild` after sections 1 and 2 were written: SW highlands stations 1-6, the Godthrone, the
Rift as four stations, Span, the card audit, KLAVA and the core water pass. Each module's README has its "Adopting it" lines.
A biome's turn takes the universal additions, and its row in the table below joins its row in section 2.

**Universal additions** (every biome turn, with section 1):

| Change | What a turn does | Where |
|---|---|---|
| **Cards on their geometry** | `check_cells.py --fix` per build: each slot's `cell` (the plant's tight box), `base` (where it attaches: frond, ribbon, hang, rosette) and, for crown clumps, `stems` (each sprig's stem on the twig). Then `card_probe.py` before and after. The owner approved the proposals except xanadu's raceme (keep the old look) and `card.flower.bloom` (its proposal is wrong). Reviewed bases and stems: `core/materials/library/card-bases.json` | `core/biome/README.md` (cards), `HANDOFF-REBUILD.md` "its card cells" |
| **Hanging cards as one strand** (the project standard) | every beard moss, hanging growth, liana or curtain slot takes a `"base": "top"` and its ribbon `flow`, so the plant spans the strand once instead of square-cut bands. The flip of `BIO.geo.ribbon`'s default is parked for the all-builds rebuild | `core/biome/README.md`; the Rift is the worked case |
| **Snow that lies** | where a kit has snow, `snowCover` with lee drifts, and `snowOn` now reaches leaf cards | `core/atmos`; SW highlands station 6 (the treeline) |
| **The night sky's nebula** | nothing to do: it rides along with every page on the shared sky | `TODO.md` ride-alongs |
| **Span's build lessons** | LFS pointers first, `probePoints` flat, `userData.host` on merged meshes, the 35z fragment key, companion fragments over shared edits | `HANDOFF-REBUILD.md`, "Practical rules" |

**New kinds, by biome** (opt-in; each takes them at its turn where its ground has the feature):

| Module | What | Builds that take it |
|---|---|---|
| **A river's plume** (`core/water` ext/61, `tintFlow`; `core/water/README.md`, "A plume that moves") | a river's silt carried out from its mouths into clearer water on a current, with eddies and filaments, never an edge: a tint field (`WATER.open({tint})`) plus `tintFlow:{v}` | every kit where a river meets a lake or the sea: swlowlands' delta (done), eastabyss (its plume tint moves onto it), nwlowlands, hyperjungle, sedesert's Bowl, ringisles, swbay, nwbay |
| **Confluences** (`core/water` ext/55 and 55b) | one water surface over a river junction, its shore from the ground, one blended current, foam from the real bank; `WATER.join` for the tributary's line | every kit with joining rivers: swlowlands (the great gorge), nwlowlands, hyperjungle (the várzea), nhighlands, shighlands, xanadu (the sacred river), oidong, k-guilin, riftrim, wouterwall, godstep (its rilles' meeting) |
| **Tall falls** (`drawFall({plungeR, footK})`) | the splash sized to its pool, a tall curtain visible to its foot; the lip on the ground's edge, the pool carved at the toe | xanadu's cataract (station `descent`), k-guilin, nhighlands' falls, shighlands, riftrim's highland lakes, ringisles' high isle, the Throne's cloud forest |
| **KLAVA** (`core/terrain/46-core-lava.js`, `LAVA.md`) | Bingham lava flow on the KFIELD lattice: live overflow, or `KLAVA.bake` for frozen flows at build time (40 m cells; levees and channels sculpted from flow ages and edges, as the Godthrone does) | the Throne (vents, kipuka, tube and caldera stations), Godstep (its lava steps and flow fronts: the bake is its ground), the Godthrone (done), `crater-drylands` station `south`'s old flows |
| **`KSTACKS.contour`** (`37b`, opt-in) | a pillar's profile in and out, joints, a crown and a split | k-guilin's towers, necanyons' fins and benches, korona's tepuis, the Catch's wind-carved beds, riftrim's Ledge cliffs, paintedhighlands' hoodoos, the Outlands' stacks |
| **KCARVE cave mouths, `KSTACKS.weather`** | cave mouths cut in a face (face, cut, site, fold); weathered stack edges | k-guilin and nwbay (karst caves), necanyons, korona's trenches, riftrim, the Cut's faces |

**The station plans** (`biomes/*/PLAN-STATIONS.md`, both passes) take the same rows as their kit.
