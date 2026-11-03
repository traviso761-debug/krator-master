# Rock types the geology does not carry yet (proposal, 2026-11-03)

**Status: a proposal for the owner. Nothing here is built** except the carbonate, which was added the same day
(`GEOLOGY.md`, "The carbonate"; `biomes/KARST-SITES-5.1.md`).

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
| 2 | **Plateau basalt** (flood basalt, a large igneous province), split from the volcanic arcs | n semiarid and the scablands, the Siphon Pits' basalt plateau, the Loom-Chasms' basalt terraces, Godstep's flood-lava steps | a province `basalt`: flat ground over 1,000 km² within the named lava regions (`nsemiarid`, `siphon pits`, `region 99`, `godstep valley`) and the shields' outer flanks past a vent's reach; `volcanic` kept for the vents and arcs | **native copper** in the amygdales (Keweenaw), zeolites, agate, columnar building stone and aggregate; the copper bytes move off the shields' flats | `nsemiarid`, `scablands` (`KSCOUR.strata`), `siphon-pits`, `godstep` |
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

A 5.1 rebake moves every node. That reaches the isle demo's economy (stocks proof, `test-sim.js`, the baseline), the
hamlets' mines, the ledger and Godot's golden field. So it is the owner's decision. It needs:
- the 5.1 page and its regions and settlements (the artifact's database; the 4.23 inputs are not in the repo);
- a frame decision: keep world metres on the old canvas (`x = (px - 272) x 2000`), or move to 5.1's frame;
- a note to each reader that its nodes move.
