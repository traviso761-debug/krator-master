# Arcodiga: architectural & refurbishment blueprint

Modeled on Paolo Soleri's **Plate 18: Arcodiga** (*Arcology: The City in the Image of Man*, pp. 83-85), built at the sheet's drawn 1:10,000 proportions in `kits/ancients/targets/arcodiga` (`dist/arcodiga.html`) with full `[G data]` interior floor plates planned during construction so it can drop into any settlement in refurbished form.

```bash
python3 kits/ancients/targets/arcodiga/plan/arcodiga_blueprint.py   # regenerates sheets/*.png and AREAS.md
node kits/ancients/targets/arcodiga/test-arcodiga.js                 # 21 [G data] & interior invariants + negatives
```

## 1. Soleri's Form & Proportions (1:10,000 Drawn Scale)

Soleri's printed table lists a total canyon site relief of 750 m, while the 1:10,000 scale bar and Empire State Building comparison silhouette draw a **360 m arch dam** (rising to **432 m** at the upstream Vertical Take-Off Airport tower) set inside **640-710 m stratified canyon cliffs**:

| Organ | Dimensions | Role |
|---|---|---|
| **Arch Dam & Crest Promenade** | `1,460 m` chord curving upstream (`-260 m` crown rise), `360 m` crest (`376 m` parapet), `160 m -> 48 m` batter; **17 circular oculi** | Impounds the reservoir (`328 m` intact, `324 m` kept, `213 m` breached); top promenade & light-well courts |
| **Vertical Take-Off Airport** | `230 m` upstream in the reservoir (`z = -490 m`), `76 x 76 m` twin-elevator shaft to a `136 x 136 m` cantilevered flight deck at `432 m` | Air port, flight control bridge, causeway at `360 m` to the crest, deep junction to the Axial Spine |
| **Living-Working Ribs & Central Prows** | **4 faceted central prows** (`x = +-52, +-156`) and **16 radial Living-Working buttresses** (`W1..W8, E1..E8`) with recessed light wells | Cellular residential tiers, artisan workshops, skybridges and terrace gardens |
| **Axial City Spine** | `88 m` wide vaulted multi-deck tube (`y = 152..204 m`, `z = -452..+184 m`) | Continuous `Public · City Center · Commercial` concourse from the VTOL elevator cores through the dam into the Wing Hub |
| **Horizontal Stiffening Wing** | `2,040 m` straight span (`x = -1,020..+1,020 m` at `z = +210 m`), hyperbolic trumpet saddle flaring to `322 m` at both cliffs | Stiffens the arch; carries twin **Highways** (`y = 176 m`) into cliff tunnels, **Research Laboratories** (west), and **Learning Center** (east) |
| **Power House, Industries & Waterways** | `296 m` Power House (5 hydro tailrace chutes), flanking Automated Industries, Y-Waterways & **3 circular pumped-silt farm basins** | Hydroelectric generation, automated fabrication, and downstream silt-transfer agriculture |

## 2. Three States (`DECAYS = [0, 1, 3]`)

- **Intact (`d = 0`, west site `x = -2600`)**: Peak Ancient arcology (**~256,500 people**, `1,776 ha` floor), reservoir at `328 m`, all 5 hydro chutes discharging, cyan luminaire strips, all 6 interior organ groups furnished in `ancient`.
- **Refurbished Settlement Centerpiece (`d = 3`, origin `x = 0`)**: Impoundment maintained at `324 m` with active hydro power, open cliff-to-cliff highways, and irrigated silt basins. **~26,600 people** (`292 ha` active floor) inhabit the refurbished Stiffening Wing, Axial City Spine, Crest Promenade, VTOL Airport, Power House/Industries, 4 central prows, and 4 inner Living-Working ribs (`W1..W2, E1..E2`), while the **12 outer Living-Working ribs (`W3..W8, E3..E8`) are sealed behind heavy alloy bulkheads** as unfurnished `[rehab]` sockets for settlement expansion.
- **Ruined (`d = 1`, east site `x = +2600`)**: Overtopping **Notch breach** (`x = -265 m`, sill `212 m`) with a **211 m waterfall cascade** (`WATER.fall` on the battered face), **severed west Stiffening Wing span** (`x = -348..-182 m`), lowered reservoir (`213 m`), and mathematically ground-seated megablock debris verified by `core/ruins` (`KRUINS.watch`).

## 3. Interiors & Culture Socket API

Interiors are generated as `[G data]` floor plates (`8av1-arcodiga-interiors.js`, **60 architectural units, 73 storeys, 1,143 rooms**) on `kits/ancients-interiors` (`AI.barPlate`, `AI.hallPlate`, `AI.RECIPES`) and split by `8zz3-arcodiga-host.js` into 6 inspectable cut-away sub-sites per arcology:
- `arcodiga/<d>/wing` — Highway Transit Concourse, Customs/Dispatch, West Research Labs, Cultivar Greenhouse, East Learning Center & Convocation Hall
- `arcodiga/<d>/spine` — Public Market Vaults, Commercial Exchange Arcade, City Center Grand Assembly, Magistracy, Gallery & Wardrooms
- `arcodiga/<d>/crest` — Curved Promenade Galleries, Overlook Lounge, VTOL Transfer Hall, Hangar Bays & Flight Control Bridge
- `arcodiga/<d>/ribs` — Central Prow & Inner Rib Living-Working apartment/workshop bars and Neighbourhood Refectories
- `arcodiga/<d>/dormant` — Outer Rib Living-Working tiers (`rehab` unfurnished sockets in `d = 3`)
- `arcodiga/<d>/works` — Main Hydro Turbine Hall, Spillway Control Bridge, Switchgear/Mess, West & East Automated Industries & Store Hall

**Adopting in a settlement's culture:**
- URL parameter on this page: `?culture=republican` (or `iziz`, `eternian`, `xanadu`, `pylon`, `post-apoc`, `ancient`)
- Runtime API: `window._api.arcodigaSocket('republican', { unsealDormant: false })`
- Headless / settlement build: `ADG_INTERIORS.entry(KratorAncientsInteriors, { culture: '<settlement_culture>', area: '...' })`

## 4. Core Adoption

| Module | Taken | How |
|---|---|---|
| `core/rand` | yes | `ARCODIGA.u` hashes `(seed, salt, index, sub)` via `KRAND.hash`; deterministic across machines |
| `core/tags` | yes | Every organ, prow, rib, silt basin, building and room registered in `KTAGS` before drawing |
| `core/water`, `core/atmos` | yes | Reservoir, hydro tailrace falls, Y-waterways, silt cisterns, and 211 m breach cascade (`8av2`, `90w`) |
| `core/ruins` | yes | `KRUINS.watch` audits the `d = 1` ruin (0 floaters, 0 unseated wrecks) |
| `core/door`, `core/furnish` | yes | Operable partition door leaves (`anLeaf`) and catalog batch furnishing (`KFURN`) |
| `core/lod`, `core/materials` | yes | Shared Ancients LOD and packed material library (`ancients.tex.ancients.js`) |
