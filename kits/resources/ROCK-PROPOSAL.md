# Rock types the geology does not carry yet (proposal, 2026-11-03)

**Status (2026-11-03): 1, 2, 3, 4, 5, 7 and 9 are built** (the owner: "do 1, 2, 5, 4, 3, 7, 9"), with the carbonate added
earlier the same day. 6 (surficial cover) and 8 (silica) are still proposals. What was built, what was deliberately left
out, and where the biome kits now disagree with the data are in "Built" and "Where the biomes must change", at the end.

`data/geology.json` has seven provinces (water, sedimentary, crystalline, volcanic, evaporite, rift, carbonate). The lore,
the strata recipes and the biome plans name many more rocks. This file lists the rocks they need that the bake has no
place for, says where each one is on the map, and gives a rule the bake could use (from its own inputs: heights, water,
rain, vents, the regions, the rivers). It also lists the resources each would unlock.

## What the current provinces get wrong (measured on the bake, 2026-11-03)

| | Cells | What it means |
|---|---|---|
| `crystalline` | 285,710 of 501,802 land cells (**57%**), half of them only because they are airless | a catch-all: "over 5,000 m, or over 1,000 m of relief in ~20 km, or airless". The crater walls, the Stalker Range (96% crystalline), the high plateaus and Korona's outer flank all fall in it, whatever their rock |
| `volcanic` on **Korona / NE** | 88% of the region | Korona is named in `VOLCANIC_REGIONS`, but its kit draws tepui quartzite and sandstone rings (`STRATA-PLAN.md` `tepui`). It is a volcano-tectonic corona with sedimentary tables |
| `volcanic` on **painted highlands** | 98% | the vents' reach covers it, but its rock is the `danxia` and `badland` sandstones and clays |
| **n semiarid** | 48% sedimentary, 24% crystalline, **0% volcanic** | the plan's rock is flood basalt 15-50 m a flow (`biomes/nsemiarid/PLAN.md` section 4). The bake has no plateau basalt: only vents and named volcanoes count as volcanic |

So the first proposal is a correction, not a new rock.

## Proposals, ranked

| # | Rock | Where on the map | Rule for the bake | Unlocks | Who asks for it |
|---|---|---|---|---|---|
| 1 | **Impactites**: megabreccia, impact melt sheet, suevite, pseudotachylite, shatter cones | the whole crater: the walls' slump terraces (n highlands, s highlands, e inner wall, the outer walls), the melt sheet under the crater floor | a province `impact` for the wall regions (the `crest` recipe's megabreccia), taking their cells from `crystalline`; a `melt` layer on the floor's oldest ground, deep under the basins | **Ni-Cu-PGE** (Sudbury's ores are in an impact melt sheet), impact diamonds, impact glass; building stone | the 5.1 wall work ("pseudotachylite fault mirrors", megaslump terraces: `tools/scale-model/README.md` 5.1), `godthrone/PLAN.md` section 3, swhighlands' `crest` recipe |
| 2 | **Plateau basalt** (flood basalt, a large igneous province), split from the volcanic arcs | n semiarid and the scablands, the Siphon Pits' basalt plateau, the Loom-Chasms' basalt terraces, Godstep's flood-lava steps | a province `basalt`: flat ground over 1,000 km² within the named lava regions (`nsemiarid`, `siphon pits`, `loom chasms` (was `region 99`), `godstep valley`) and the shields' outer flanks past a vent's reach; `volcanic` kept for the vents and arcs | **native copper** in the amygdales (Keweenaw), zeolites, agate, columnar building stone and aggregate; the copper bytes move off the shields' flats | `nsemiarid`, `scablands` (`KSCOUR.strata`), `siphon-pits`, `godstep` |
| 3 | **Tuff and ignimbrite** | the Throne's flanks (the Zeijani's tuff country, their cave villages), Lesser Throne, Xanadu's twin volcanoes | a layer `tuff`: within 2-4 x a large vent's reach, on its lee (the ash falls downwind) | **pozzolana**. With the new limestone (lime), that makes Roman concrete: lime and pozzolana are what Krator's builders would cement with. Also pumice and zeolite | the Zeijani (`kits/zeijani`, Dhelv, `DATA.tubes` `rock: tuff_and_basalt`), Throne's stations |
| 4 | **Ultramafic** rock (peridotite, serpentinite, an ophiolite) | where mantle reaches the surface: the White Gills' twins (their carbonate-brucite chimneys need serpentinite underneath: Lost City), the Arch (an exposed spreading ridge; north-west, low priority) | a province `ultramafic`: the named seats only (the Gills' twins; the Arch's axial graben) | **chromite, nickel** (and nickel laterite where it is wet), talc, magnesite, asbestos; the magnesium for dolomite and for the brucite crusts | `biomes/gills/PLAN.md`, `nw_expansion.py` (the Arch) |
| 5 | Split **crystalline** into granite, gneiss and quartzite | granite in the ranges (the Stalker Range, the walls' cores), gneiss on the deep-cut walls, quartzite on the high tables (Korona's tepuis, necanyons' caps) | over 5,000 m in a range is granite or gneiss by relief; a flat table over 3,000 m is quartzite or sedimentary (not shield); airless keeps its own bit (the mask already has it) | tin and tungsten on granite only (today tin is 180 on every crystalline cell); quartz sand for glass; better building stone | Korona (`tepui`), necanyons, every wall station |
| 6 | **Surficial cover**: loess, alluvium, dune sand, glacial till | loess: the Weavers' Cradle apron, Ostrukh's terraces, wouterwall (its loess sinkholes and terraced fields); dune sand: the Catch's erg; till: the moraines of the rim | a layer per cover, over the bedrock province: loess downwind of the deserts and the dry lake beds; alluvium where `clay` already marks floodplains; sand where the Catch's erg region lies; till below the glaciers' reach | farm soil (loess is the best on Earth), brick earth, glass sand; this is what a works stands on | `loom-chasms`, `siphon-pits`, `wouterwall`, `catch`; `core/hamlet`'s farms |
| 7 | **Contact aureoles**: marble, skarn, hornfels | round the plutons and volcanoes where they meet carbonate: Korona's marble (`LORE.md`, the Brick paragraph: "where volcanic heat would have cooked limestone"), the NE outer wall's skarns | where the limestone byte meets volcanic ground within 1-2 cells | **marble** (the white trim the brick cities import), skarn ores (tungsten, copper, iron, garnet) | `LORE.md` (the kiln city), `neouterwall` |
| 8 | **Silica rocks**: diatomite, chert, sinter, opal | diatomite in the old lake beds (n semiarid), chert bands in the carbonate, sinter and geyserite at the geysers, swhighlands' opal-shell limestone | a layer `silica`: the drained lake beds (the evaporite basins' floors below the halite), the geyser field's vents, the carbonate's chert share | flint and chert for tools, diatomaceous earth, **opal** (a gem: Krator's ammolite) | `nsemiarid`, `geyser`, `swhighlands` (`ringfold`) |
| 9 | **Vitrified ground** (made by the Ancients) | the seven blast basins in Ancient's Valley (5.1 Round 3: "a raised vitrified glass rim"), and other scorched ruin ground | a mask bit, or a layer, from the basins' list in the model (`build_425_master.py`); the ruin bit already marks ruin ground | glass slag (trinitite), salvage; a hazard tag | the 5.1 model, `swlowlands` |

**Recommended first:** 1 and 2, with 5 coming as part of 1. Together they relabel more than half the map's land correctly,
and they correct the one figure that misleads every reader: that 57% of the land is crystalline. 3 is cheap, and it makes
the new limestone useful for building (concrete). 4 and 7 are small and local.

## How to add them without moving the existing data

The carbonate pass (`geology.py --carbonate`) set the pattern. A new province takes its cells from an old one, and a new
layer is an added family in `rockFamilies`. Neither the node field (`field.families`) nor the ledger's basics read them,
so no node, placer, lode digest or ledger sum moves. That holds while a rule reads only what the bake already has.

The exception is **impactites, crystalline's split and basalt**. They change which ores sit where (copper, tin, iron,
rare earths), so they move nodes. They belong in a **full rebake**, and one is due anyway: `geology.json` is still the
4.23 bake on the old canvas (1549x1393). The model is 5.1 on 1821x1723, and its heights differ from 4.23's (the bake rings the Cut's salt
lake at -1,456 m; 5.1's ground there is at -1,900 m).

A 5.1 rebake moves nodes. That reaches the ledger, the hamlets' mine test and Godot's golden field (not the isle demo's
economy: it does not read the field yet; `REBAKE-PLAN.md` section 1). So it is the owner's decision. It needs:
- the 5.1 page and its regions and settlements (the artifact's database; the 4.23 inputs are not in the repo);
- a frame decision: keep world metres on the old canvas (`x = (px - 272) x 2000`), or move to 5.1's frame;
- a note to each reader that its nodes move.

## Built (2026-11-03)

*The cell counts below are the 4.23 bake's. The 5.1 rebake (`REBAKE-PLAN.md`) runs the same rules on the bigger canvas: `GEOLOGY.md` has its counts (carbonate 9,205; impact 35,322; basalt 37,497; granite 58,665; quartzite 21,689; ultramafic 8,169, the Arch now on the canvas). **Since R3 the ores are on these rocks and nickel and marble are node kinds** (the column "Not done" below is the state before it; `GEOLOGY.md` has what moved).*

`tools/scale-model/geology.py` `rocks()`, added to the 4.23 bake by `--rocks` (`GEOLOGY.md` has the rules and the command).
Only the province layer changed; every family layer, lode digest and placer is byte-identical, and the new layers are
**rock families** that neither the node field nor the ledger reads.

| # | Built as | Cells (4 km) | Not done, and why |
|---|---|---|---|
| 1 | province `impact` (the walls' crystalline); layers `impactite` (walls, benches, melt-sheet margin) and `nickel` (the margin, Sudbury) | 29,097 impact | **no nickel node kind**: adding one puts new nodes in every tile, which moves the ledger. `nickel` is a prospect until the owner adds the kind |
| 2 | province `basalt` (n semiarid, Siphon Pits, the Loom Chasms) | 36,433 | the copper bytes are **not moved** onto the basalt (native copper): copper is a node kind |
| 3 | layer `tuff` round every vent, longest downwind | 10,437 > 0 | no pozzolana node kind (the same reason) |
| 4 | province `ultramafic` (the Arch: off the 4.23 canvas, so 0 cells today); layer `ultramafic` for the White Gills' root | 334 > 0 (the root) | no surface ultramafic on the old canvas: the gills plan says the twins are dacite and basalt with the root *proposed* deep, so the root is a layer, not a province |
| 5 | provinces `granite` (pluton blocks in the rugged crystalline), `quartzite` (Korona's tables, the high flat shelves); the painted highlands back to sedimentary; `crystalline` is the gneiss basement | granite 40,570, quartzite 21,349; crystalline 285,710 to 194,157 (most of the rest is airless) | **tin is not moved off the gneiss onto the granite**: tin is a node kind |
| 7 | layers `marble` and `skarn` where the limestone meets granite or volcanic ground | marble 6,273, skarn 2,655 > 0 | no skarn ores (tungsten, copper, iron) moved, for the same reason |
| 9 | layer `glass`: the seven blast basins (melt floor, vitrified rim) | 92 > 0 | none |

**The ores wait for one decision.** Moving copper, tin and iron onto the new rocks, and adding nickel, pozzolana and
skarn ores as node kinds, changes which nodes exist. That reaches the ledger (`data/ledger.json`), the hamlets' mine test
and Godot's golden field. It belongs with the 5.1 rebake, as one change the owner approves: `REBAKE-PLAN.md`.

## Where the biomes must change

The data now says things some kits do not draw, and the other way round. Each row names a kit, what disagrees, and the
change. "Agrees" means the kit already draws what the data now says.

**1. Impact walls** (n highlands 31% impact, s highlands 70%, e inner wall 30%, w outer wall 42%, NW outer wall 72%; the
melt-sheet margin, `nickel` 220, runs along the inner foot of every wall)
- `nhighlands`, `nwouterwall`, `wouterwall`, `shighlands`, `ehighlands` (the e inner wall's kit): their crag and cliff
  faces draw generic or granite-like rock with no strata. They should take swhighlands' `megabreccia` recipe (the
  `crest` formation) where the province is `impact`: chaotic blocks of every rock in a darker matrix, pseudotachylite
  veins (black glassy seams), shatter cones on fresh faces. The 5.1 model's slump terraces and "fault mirrors" are
  already in the heights, so this is a strata and ground change, not a terrain one.
- `clifflung` (the S inner wall's face over the hyperjungle) and `swhighlands`' crest: **agree** (megabreccia is
  already the crest recipe). The Cliff Lungs' face should read as megabreccia between the lungs.
- **Settlements at a wall's foot now sit on the nickel ring**: Voth, Spirladunon, Torus, Pylon (the S inner wall), and
  the e savannah, se savannah and ne rims. No kit changes until there is a nickel node kind; when there is, those
  settlements' mines and the ledger change.

**2. Flood basalt** (n semiarid 72% basalt, its dam-lake beds 28% evaporite; Siphon Pits 100%; the Loom Chasms 99%)
- `nsemiarid`, `scablands`, `dambasins`: **agree** (their plans draw flood basalt, coulees and dry falls). `nsemiarid`'s
  plan already has its basement limestone under the basalt; nothing to change.
- `siphon-pits`, `loom-chasms`: **agree** (basalt plateau, columnar walls, maars).
- `godstep`: the valley's four ponded flood-lava steps are still `volcanic` (the head vent's reach covers them). Godstep's
  plan should treat the steps as basalt flows (it does in its 5.1 rewrite), so this is a data refinement for the rebake.

**3. Tuff aprons** (the Throne and Rift rims to ~195, the Godthrone and Godstep to 200, Oidong 191, hyperjungle N 161,
SW and NW bays to 177, the Catch 95, the Stalker Range 185)
- `throne`: **agrees** in kind (the Zeijani's tuff spires and cave villages) but should draw tuff, not basalt, on the
  stations downwind (south-east) of the vents: pale, soft, layered ash with fairy chimneys.
- `godthrone`, `godstep`, `riftrim` (the rim's vents), `oidong`: the downwind (south-east) flanks should show pale ash
  and ignimbrite benches in their strata, with the upwind flanks bare flows. None draws ash beds now except `rift`'s recipe.
- `nwbay`, `swbay`, `hyperjungle` (N): the tuff is the Throne's apron reaching them. This is a ground change only: ash
  soils under the jungle (fertile, dark) and an ash bed or two in a cut bank.

**4. Ultramafic**
- `gills` (`catch --station gills`): **agrees**. The root layer (to 117 at the White Gill) matches the plan's "ultramafic
  root *proposed* in the cones' deep plumbing". No surface change.
- The Arch (north-west, low priority): a kit there should draw serpentinite and peridotite (green-black, scaly, talc
  seams) when it is built.

**5. Granite, quartzite and the gneiss basement**
- `korona`: **agrees**. 73% of its region is now `quartzite` (the tepui tables it draws), not volcanic. Its kit already
  uses the `tepui` recipe. Its stations' far fields could stop drawing it as a volcanic province.
- `paintedhighlands`: **agrees**. It is now 98% sedimentary (its danxia and badland beds), not volcanic.
- Granite now covers part of: the Yuni Valley (42%), Oidong (33%), the crater drylands S (25%), e abyss (20%), the Catch
  (21%), ebadlands (17%), sw highlands (15%), the Bowl (14%), the Stalker Range (14%). These kits draw sandstone and
  badland strata (`canyon`, `badland`) or generic crags everywhere:
  - `ebadlands`, `sedesert` (the Bowl), `catch`, `crater-drylands`: where the province is granite, add **granite
    landforms** (tors, domes, boulder fields, grus) in place of bedded cliffs; a `granite` strata or ground set is owed
    (no recipe exists; `core/materials` may need a texture: add to `PROMPTS-NEEDED.md` if none fits).
  - `oidong`: its moss valley's crags and temple cliffs read well as granite (Huangshan's); the kit's crag rock should
    take a granite look in those blocks.
  - `swhighlands`: the granite blocks are on its crest side (the crest recipe is megabreccia there, so a pluton inside
    the wall is plausible). No station is affected yet.
- The high flat quartzite shelves (outside Korona, 1% of n highlands, the w rift highland): agree with the kits' tables.

**7. Marble and skarn** (a band where limestone meets granite or volcanic ground)
- `k-guilin` and `nwbay`: marble to 230 on the edge of the platform that touches the Throne's volcanic ground (NW bay is
  8% volcanic). The kits draw grey limestone towers everywhere. A **white marble band** at that contact (a quarry, the
  Hykkousoi's carved stone) is the change; the towers stay limestone.
- `swbay` (marble to 207), `sedesert`/the Bowl (126), `catch` (134), `ancientsvalley` (104): small contact bands. Kits
  need nothing until a station stands on one.
- **Lore agrees**: the marble the brick cities import ("Korona, where volcanic heat would have cooked limestone") now has
  sources. Korona's band is small (68); the larger ones are the NW and SW bays'. Worth telling the owner, because Jimjam's
  marble may come from the bays instead.

**9. The Ancients' glass**
- `ancientsvalley` (`PLAN-ANOMALIES.md`, the blast basins): **agrees**; the layer marks the seven basins and their rims.
  Its stations should draw the floors as melt glass (green-black, bubbled, crazed) with the rims brighter, if they do not.
- `swlowlands` and `nwlowlands` show `glass` 255 in their region masks only because their polygons overlap Ancient's
  Valley. Nothing to change in those kits.

**For every kit:** none reads `geology.json` at build time, so no page changes until a kit opts in. The change list above
is what each kit's look and strata should follow when it next rebuilds, as the biome rebuild's turns reach it.
