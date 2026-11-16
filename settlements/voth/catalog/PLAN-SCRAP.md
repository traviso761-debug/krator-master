# Scrap Voth: the plan

The owner, 2026-11-12: "a 'scrap Voth' along similar principles [to scrap Xanadu]: the dark elven/Dunmer character
shines through with scrap carefully integrated." Scrap Xanadu (`kits/xanadu/PLAN-SCRAP.md`, branch `claude/scrap-xanadu`)
set the principles: the Ancients' panels, glazing, girders, cable and bronze are dressed and placed, never patched on,
and the culture's own body stays in charge.

## 1. Where Voth meets the Ancients' scrap

Voth itself stands on an open bay with no great ruin, but the Kingdom rules, or ruled, cities built in Ancient ones
(LORE 6.2 and 6.12). These are the set's places:
- **Hook**, Voth's port for over a century and a half: a canton of Vothic townhouses and a necropolis in the fuel-tank
  farm, the slave market in the container compounds, an Ordinator fortress over the submarine pens.
- **Drum**, a Vinvolk city round a broken arcology: Voth's governor's palace, citadel and wealthy district beside the
  Ancient town and the scrap rampart.
- **Torus**, and Wing in ruins. Also any Vothic quarter, garrison or necropolis that a conquest set beside a ruin.

## 2. How the Dunmer body keeps the upper hand

The Vothic body stays as it is: battered basalt and ashen stone, Velothi pylons with capped tops, small domes, Hlaalu
flat roofs, parapets and copper hip roofs, Redoran shells, Aztec stepped platforms. Gold and porphyry purple are for the
civic, and every gate carries the diamond. Scrap takes over only where Voth already had a piece of the same form:

| Vothic piece | Taken from the hull |
|---|---|
| Velothi dome on a drum | an Ancient tank head, its seams ribbed with blackened girders, a bronze finial |
| Redoran chitin shell roof | curved hull plates of copper skin, overlapping like a carapace, girder ribs across |
| Hlaalu green copper hip roof | verdigris hull panels in courses, bronze seam strips down the slopes |
| Voth's flying buttresses between tiers | girders, blackened, from a pylon to the wall |
| the capped pylon | the same pylon, its cap a bronze cone from Ancient pipe ends |
| ashlar facing | white Ancient panels, weathered to the ashen family, in courses on the upper storeys only |
| slit windows | the Ancients' glass in bronze frames, amber where lit |
| bridges and rails | cable between girder posts under a bronze rail |
| the diamond on the gate | a bronze-framed diamond cut from a panel |
| a tower or a tomb | a whole tank: the necropolis in Hook's fuel-tank farm, a cornerclub, a smithy |

Colours stay ashen and low-saturated, as the brief says: the panels are greyed white, the copper an olive verdigris,
the girders blackened, the bronze dull. Only the civic gold and purple are bright.

## 3. Questions for the owner (the defaults built)

1. **Where it lives.** *Default built:* a registry of its own in Voth's building catalog,
   `settlements/voth/catalog/registry/voth-scrap.js` (source `voth-scrap`). It is shown on the catalog page
   (`index.html?src=voth-scrap`). It is **not** in the city build's kit list (`build.py` `VENDOR`), so core/city does not
   place these buildings in Voth's lots, and `voth-city.html` does not change. Hook, Drum or Torus takes the registry when
   it is built. The other choice is a new culture in `kits/catalog`.
2. **Culture id.** *Default:* the catalog culture stays `voth`; keys are `voth_scrap_*` and the source `voth-scrap` marks
   them. The other choice is a culture of its own (`voth-scrap`) in `FURN_CULTURES`, which would touch core/catalog.
3. **Building types.** *Default built:* poor, middle and rich houses, a shop, a tavern, a warehouse, a tomb (Hook's
   necropolis), a shrine of the Sun, a watchtower and a canton gate. The owner added the slave market and an arena (2026-11-12). Still asked: an Ordinator citadel, a temple pyramid.

## 4. The set (built)

| Key | Variants |
|---|---|
| `voth_scrap_house_poor` | tank hovel; carapace hovel; row of panel-fronted cells |
| `voth_scrap_house` | Velothi tower-house under a tank-head dome; Hlaalu block under a copper hull roof; canal house on girder piles |
| `voth_scrap_manor` | Redoran carapace hall with a tank tower; Velothi domed manor with girder buttresses |
| `voth_scrap_shop` | trader with a propped panel awning; smithy in a tank |
| `voth_scrap_tavern` | cornerclub in two stacked tanks |
| `voth_scrap_warehouse` | canal store with a girder hoist |
| `voth_scrap_tomb` | fuel-tank family tomb; panel-faced pylon tomb |
| `voth_scrap_shrine` | stepped Sun shrine with a reclaimed dish for the sun; wayside pylon shrine |
| `voth_scrap_watch` | Ordinator watchtower; canton gate |
| `voth_scrap_market` | the slave market in the container compounds (Hook): containers ranged round a square, pens barred inward, the auction block under a purple canopy, a gate under the gold diamond; a lane of container pens to a block under a hull-plate shell |
| `voth_scrap_arena` | a round arena: sand floor, a podium wall faced in panels with barred pit gates, stone tiers, a basalt drum with a porphyry band, girder masts carrying shade sails on cable, a royal box under a tank-head dome; a fighting pit ringed by container stands under a girder gantry and its cage |

## 5. Core adoption

| Need | Taken from | How |
|---|---|---|
| the engine | `core/catalog` (the asset engine, `F` API, `mat()`), read in place by the catalog page | every building is an `ASSET` with a `build(F)` |
| variation | the engine's seeded stream per entry and variant (`F.rnd`, `F.pick`, `F.rr`), as every catalog registry | no own PRNG |
| walk records | the registries' `walkRec` contract (`catalog/README.md`, "Walk records") | every stair and ladder goes through the kit's helper |
| LOD | `catalog/lod.js`, automatic from part size | big masses as big primitives, detail on top |
| textures | the material library (`core/materials/library`) through `catalog/materials.json` and `tools/textures/pack.py`, applied by core/catalog's detail maps (`krator-furniture-detail.js`, `KF_API.detailize`: triplanar, grey detail under the buildings' own colours) | surfaces named by texture family (`vsStone/stone`: `stone.cut`; `vsBasalt`: `rock.basalt.vesicular`; `vsMud`: `earth.adobe`; `vsPanel`: `metal.enamel.scoured`; `vsVerd`: `metal.bronze.verdigris`; `vsSteel`: `metal.iron.pitted`; `vsBronze`: `metal.bronze.cast`; `vsWood`: `wood.weathered_brown_planks`; `vsCloth`: `cloth.canvas`). The owner, 2026-11-12: "these look very lightly textured, can we wire in textures?" On the catalog page `layout.js` builds scrap entries unmerged and detailizes them; `lod.js` and the city build are untouched |
| tags | the `ASSET` record's culture, family, districts, wealth | core/city reads them when a city takes the registry |
| check | `catalog/shoot.py --audit --src voth-scrap` (sizes, triangles per LOD level, errors) and its sheets | looked at, two rounds |

No core module is copied. The registry has its own small kit inside its IIFE, as every Voth registry does (the brief: no
top-level declarations other than `ASSET` calls).
