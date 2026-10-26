# godstep: the plan (draft, 2026-10-26)

**Godstep valley**: the valley that steps down from the Godthrone's north-east flank toward the crater's interior,
between the Godthrone, the southern highlands and the walls above the Bowl. Its theme is **the god's stair**: the
Godthrone's very fluid titanium lava flooded the valley again and again, each flow ponding on a floor and spilling over
the next lip, so the valley comes down in dark steps, each ending in a flow front, cut by lava-carved canyons with no
water in them. The Talovolci farm the canyons' sheltered floors.

Owner's brief (2026-10-26): Godstep valley's ideas were asked for; the lava staircase is the proposal, with black sand
on its cold-desert steps. The Godthrone's lava is titanium-rich (`biomes/godthrone/PLAN.md`). The references are in
`refs/`.

**Status: plan, awaiting the owner.** Nothing built.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/godstep/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `refs/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`) |
| Pages | stations: `dist/godstep.html` (station 1) and `-rille`, `-vent`, `-redlands` (section 7) |
| Core | the biome core (`CORE_BIOME`), `core/host`, `core/rand`, `core/mask`, `core/tags`, `core/terrain` (relief, carve, strata: `tibasalt` from `godthrone`), the shared sky |
| Read in place | `biomes/godthrone` (the rock, the vent glass); `biomes/shighlands` (its spiral flora where the valley is moist enough, the Talovolci's own country); the hyperjungle's savannah rim at the low end; nothing copied |
| Its own flora | the lava pioneers and the red guyed stalk (section 3) |
| Object | `GSTEP` (`build`, `dress`, `SPECIES`, `PLANTS`), on the `BIOME-API.md` contract |
| Out of scope | the Talovolci's villages (a settlement plan); the open world's ground where the valley lies inside `openworld/little-demo` (section 1) |

It is a new biome, so it goes in the gallery when it first reaches `main`.

## 1. The ground (scale model 4.22, surveyed 2026-10-26)

37,036 km² (px 585-738 by 714-824). Dsc 9,256 km², Dsb 7,416, BSk 5,868, Cfa 3,704, Csa 3,492, BWk 2,368, ET 2,004.
Median rain 173 mm.

| Band | km² | Air | Rain | Mean (warm/cold) | Class |
|---|---|---|---|---|---|
| 0-1 km | 2.0k | 1.50 atm | 1,160 mm | +20 °C (30/11) | Cfa, Csa |
| 1-2 km | 2.8k | 1.33 | 630 | +16 (27/5) | Cfa, Csa, BSk |
| 2-3 km | 10.1k | 1.17 | 250 | +11 (23/-2) | BSk, Dsb, Csa |
| 3-4 km | 14.5k | 1.03 | 125 | +6 (19/-7) | Dsc, Dsb, BSk |
| 4-5 km | 4.2k | 0.91 | 78 | +1 (14/-12) | Dsc, ET, BSk |
| 5-9 km | 3.2k | 0.80-0.55 | 0-30 | -7 to -27 | ET, EF, HF: the Godthrone's flank |

- **The steps**: the floor comes down in broad flats at about **2.7, 2.0, 1.3 and 0.6 km**, from the cold desert of the
  upper steps (BWk, BSk) to humid country at the low end, where the valley opens north-east toward the hyperjungle.
- **Its head** climbs the Godthrone's north-east flank to 8-9 km. No vent of its own on 4.22: the Godthrone's two are
  ~640 km off, and the Throne's small vents ~145 km north. The flows came from the Godthrone (250 km from its summit to the valley's head; the Moon's titanium flows run up
  to 1,200 km); a **flank vent near the head** is an optional 4.23 item (station 3).
- **Water**: dry valleys only on the upper steps: **Vali de Daridel** (from 5,051 m to a closed basin at 2,693 m by
  px 604,797), Vali Guaida (the white dry valley) into it. The upper steps drain into closed basins: lava-dammed.
- **People**: the Talovolci (35,780 km² of overlap; `LORE.md` §6.21). **Daridel** stood here on the upper step (px
  608,798) before it moved into the cloud forest. The Empire of Iziz's polygon overlaps 33,180 km².
- **The open world**: `openworld/little-demo` covers **24,584 km²** of the valley. Its ground there comes from the
  sedesert, eastabyss and hyperjungle kits today; this kit takes that ground over when it is built (a refresh of the
  little demo's source and kit weights).
- **Neighbours**: the Godthrone (south-west), the southern highlands, the Bowl, the eastern highlands (the model's `e
  inner wall`), the south-eastern savannah rim, the hyperjungle.

## 2. The rock

**Titanium basalt** (`tibasalt`, `biomes/godthrone/PLAN.md` section 3): black with an ilmenite sheen, the flows thin on
the slopes and **thick where they ponded** on each step. Thick ponded flows cool slowly into **colonnades**: tall
regular columns under a hackly, fanned upper tier (`refs/02`, `refs/03`), seen in every canyon wall. On the dry upper
steps the flows stay black with **orange rinds** where the glass weathers to palagonite. At the wet low end the basalt
rots to **deep red laterite** that stands in breakaway cliffs (`refs/05`).

## 3. The flora

| Species | Ref | Where | What it is |
|---|---|---|---|
| **Red guyed stalk** | 01 | the canyons' wet floors | tall thin stems held up against the wind by guy-roots, red cup-crowns; the Talovolci farm them for red fibre, as the painting shows |
| **Lava pioneers** | | the fresh flows | crusts, cushions and glass-loving lichens in the cracks; the orange endolith band of the Godthrone (its section 5) in the glass |

Read in place: the southern highlands' spiral species where the moister air comes up the valley; the Godthrone's crusts
on the upper flank; the hyperjungle's savannah rim at the low end.

## 4. Landforms (`core/terrain`)

- **Flow fronts**: each step ends in a **lobate flow front** tens of metres high, the god's step; **frozen lava falls**
  where a flow poured over the next lip.
- **Mare floors**: each step's floor a smooth dark plain of ponded flows, crossed by low ridges and pressure plates.
- **Sinuous rilles**: lava-carved canyons meandering down the steps, 1-3 km wide and a few hundred metres deep, their walls
  colonnaded (the Moon's Hadley Rille, with no water in it); **lava tubes** and **pit chains** along the tube-fed flows.
- **Kipukas**: islands of older ground the flows went round, with older soil and older flora.
- **Lava-dammed basins**: closed basins behind the flow fronts on the upper steps, playas in the cold desert
  (Vali de Daridel's at 2,693 m).
- **Black sand**: dunes of ilmenite and basalt sand on the cold-desert steps, as on Iceland's black sand plains.
- **The flank vent** (if added): a cinder cone at the valley's head, its crater **red with oxidised scoria**, a
  spring-fed moss lawn and stream in its floor (`refs/04`).
- **Laterite breakaways** at the low end: red cliffs and gullied red slopes under a forest edge (`refs/05`).

The fields and seeds are deterministic from the terrain (`KRAND` by cell), as every kit's.

## 5. The people's side

- **The Talovolci** (`LORE.md` §6.21): *proposed* here, their villages stand on the kipukas and at the rilles' heads,
  their fields on the rilles' floors where the soil and the shelter are, and the red stalk is their fibre and their
  madder's rival; the flow fronts are the god's stair, climbed in procession toward the Godthrone (their *Spirladunon*
  could climb one). Daridel's old site on the upper step is a place they remember.
- The Empire of Iziz's road, if it crossed, crossed here.

## 6. Stations

1. **The steps** (`dist/godstep.html`, the upper steps, ~2.7 km): a flow front and a frozen lava fall, a dark ponded floor,
   a lava-dammed playa, black sand dunes, the Godthrone's mass up the valley; Daridel's old site.
2. **The rille** (`-rille`, ~2 km): a colonnaded rille wall with its overhanging fan of columns, the Talovolci's red
   stalk fields and a spring on its floor, a pit chain above.
3. **The flank vent** (`-vent`, optional, the valley's head, ~4-5 km): the red cinder crater with its spring and moss
   lawn (the vent on the model in 4.23 if the owner wants it).
4. **The redlands** (`-redlands`, the low end, ~0.6-1 km, Cfa): laterite breakaways, red gullies, the forest closing in
   toward the hyperjungle.

## 7. Textures

In the library: `ground.lava.aa`, `ground.lava.crust`, `ground.sand.black`, `ground.scoria`, `ground.cinder`,
`rock.basalt.*`, `rock.columnar`. To source or generate (generic ids; the prompts in `core/materials/PROMPTS-NEEDED.md`
in D0): a **colonnade** wall (regular columns under a fanned hackly tier), **palagonite** (shared with `godthrone`),
**laterite** (red, gullied, iron-crusted), **red scoria** (oxidised), the red stalk's card.

## 8. Order of work

- **D0.** The owner approves the plan; the flank vent (or not) on the model; the texture prompts; the station sites.
- **D1.** The kit on the biome core: fields (step, flow age, rille, kipuka, sand), zones, station 1's ground.
- **D2.** The landforms: flow fronts, lava falls, rilles, colonnades (`tibasalt` with a ponded-flow variant), tubes,
  pits, basins, dunes.
- **D3.** The flora; the southern highlands' and the savannah rim's species read in place.
- **D4.** Stations 2-4.
- **D5.** `verify.py --assert`, `PORT.md`, the index tools, `tools/check_core_use.py`, the gallery; the little demo's
  refresh.

## 9. Open questions

- The flank vent: on the model or not.
- How old the youngest flow is (a fresh black one is a story; all old ones make the inverted-relief look more likely).
- The Talovolci's names for the steps.
