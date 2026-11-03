# godstep: the plan (rewritten on scale model 5.1, 2026-11-03; first draft 2026-10-26)

**Godstep valley**: the valley that steps down east-north-east from a flank vent at the foot of the Godthrone's north-east
shield, between the Godthrone, the southern highlands and the walls above the Bowl. Its theme is still **the god's stair**:
very fluid titanium lava ponded on a floor, spilled over the next lip and ponded again, so the valley comes down in four dark
steps, each ending in a flow front, cut by lava-tube rilles with no water in them. The Talovolci farm the rilles' sheltered
floors.

Owner's brief (2026-10-26): Godstep valley's ideas were asked for; the lava staircase is the proposal, with black sand on its
cold-desert steps. The Godthrone's lava is titanium-rich (`biomes/godthrone/PLAN.md`). The references are in `refs/`.
The owner (2026-11-02): rewrite the plan on Gemini's scale model 5.1 before anything is built; the Hearths' third field is
Godstep's flank vent (`biomes/hearths/PLAN.md` section 5).

**Status: plan, awaiting the owner.** Nothing built. No change to `LORE.md` or the model is made here: lore and map changes
are marked *proposed*.

## What changed on 5.1, and why the plan moved

`biomes/STATIONS-MAP-5.1.md` ("Needs work") flagged every Godstep station. Gemini sculpted the valley from this plan's own
section 4 (`tools/scale-model/smodel/volcanoes.py`, section 3): four ponded titanium-basalt steps along an ENE axis from the flank
vent (`DATA.vents[77]`), with two collapsed lava-tube rilles. What that did to the plan:

| | 4.22/4.23 (the old plan) | 5.1 (this plan) |
|---|---|---|
| The head | a cinder cone high on the Godthrone's flank at 4,973 m, ET, 47 mm, -3 °C | a **pit crater** at the valley's head: floor 2,700 m, rim 2,810-2,850 m, sunk into the top step's plain (3,000-3,050 m); Dsc, 110 mm, +12 °C (25/-1), night low -12, 1.14 atm |
| The steps | broad flats "at about 2.7, 2.0, 1.3 and 0.6 km", described, not drawn | drawn: floors at **~3,120, ~2,345, ~1,615 and ~880 m** (flat ground's median), each front a lobate ~700 m fall over 12-14 km (section 1) |
| The country | arctic-dry head, cold desert above, humid Cfa (1,160 mm) at the low end opening to the hyperjungle | **cold-dry above, hot-dry below**: 78-160 mm on steps 1-2, 125-270 mm on steps 3-4; the low end is a hot closed basin (BSk, +22 °C, summer highs to 44 °C), not a wet one. The only wet ground is the **north wall** (Cfa/Csa, 800-1,100 mm) |
| Water | Vali de Daridel and Vali Guaida into a lava-dammed basin at 2,693 m | the same wadis under their frozen 5.1 names, **Guli Cistal** and **Guli Grin**; the step-1 basin no longer closes on the model; the **lower valley is closed** below a ~1,986 m spill; **Rrivar Cistal** rises on the north wall and leaves north for the Ring Sea |
| Tubes | "lava tubes and pit chains" in general | **`tube_god_07`**, the Godstep and Pluton master tubes (265 km; 48 m wide, 28 m high, 55 m down), collapsed into the rille from the vent; and **`tube_god_n_12`**'s West Godstep Rim Cross-Conduit (habitable) coming down the Godthrone into the same vent pit |

So: the head is no longer arctic (the flora and hazards there change with it); the low end is no longer humid (the redlands
become relict laterite in a hot steppe, as Western Australia's breakaways are); the rille has a real route; and the vent station
is now the Hearths' station, built once (section 7).

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/godstep/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `refs/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`) |
| Pages | `dist/godstep.html` (station 1, the stair), `--station rille` -> `dist/godstep-rille.html`, `--station hearths` -> `dist/godstep-hearths.html` (the head: the Hearths' station, section 7), `--station redlands` -> `dist/godstep-redlands.html`; optional `--station wall` -> `dist/godstep-wall.html` (the north wall) |
| Core | the biome core, `core/host`, `core/rand`, `core/tags`, `core/space`, `core/terrain` (`KLAVA`, `KSTRATA` `tibasalt-ponded`, `KRELIEF.scarp`, `KSTACKS`, `KCAVERN`, `KTHERM`), `core/water` (with the fields and the mirror switch), `core/atmos`, `core/hazard`; the section "Core adoption" |
| Read in place | `biomes/godthrone` (the rock's recipe, the crusts and endoliths, the far mass); `biomes/hearths` (the hearth life at the head, by its plan: section 7); `biomes/geyser` (its `puna` field recipe at the vent, as the Hearths read it); `biomes/shighlands` (the spiral flora on the north wall); `biomes/sedesert` (the hot steppe's shrubs on steps 3-4); `kits/fauna`; `kits/crops` (the Talovolci's fields); nothing copied |
| Its own flora | the lava pioneers and the red guyed stalk (section 3) |
| Object | `GSTEP` (`build`, `dress`, `SPECIES`, `PLANTS`), on the `BIOME-API.md` contract |
| Out of scope | the Talovolci's villages (a settlement plan: the kit publishes sites as data); Arcbeam (the arcology just off the NE corner); the open world's ground in `openworld/little-demo` (a re-cut after 5.1 is frozen, section 1) |

It is a new biome, so it goes in the gallery when it first reaches `main`.

## Core adoption (written before the first fragment, 2026-11-03)

Start from `biomes/godthrone` (the same rock, `KLAVA.bake` worked at its station 2, the far Godthrone) and the newest full
adoption among the rebuilt kits (`biomes/swhighlands`, `biomes/ebadlands`). The modules every station takes, and for each it
does not, why:

| Module | Takes | For |
|---|---|---|
| `core/biome` | `10-core-head`, `20-core-kit` (`BIO.INDEX_ITEMS`, LOD merge/fade/cull), `30-core-foliage` (ground tint, A2C, back-light, the one wind), `31b-core-leafset`, `32-core-variants`, `33-core-fungoid` (`BIO.fung`: crusts, cushions, the stalk's cups), `34-core-impostor` (far stalks and shrubs), `35-core-anim` (the wind; the **`breath` mode** at the head only, for the hearth fans, driven by `HEARTH.work`), `40-core-place`, **`41-core-env`** (the field contract: `BIO.env` with `ground`, `water: WATER.fieldFns(F)`, `therm` at the head, `temp` from the model's climate elsewhere; the kit's own `rock`, `salt` (the playa) and `wet` (the springs' seep)), `42`/`43-core-export(-host)`, `44-core-stage` | every species on the core's builders and items; one field table that placement, the ground and the hazards all read |
| `core/rand` | `KRAND` | every field and placement cell (`KRAND.hash(world, ix, iz, salt)`), every eruption's roughness; no sin hash, no stream |
| `core/tags` | `50`, `52`, `53` | every item set, instance, flow lobe, pit and volume a record |
| `core/space` | `KSPACE` | the keep-clear between stalks and shrubs; the nearest-pit and nearest-spring index the hazards and fields read |
| `core/terrain` | `30-core-field` + brush; **`46-core-lava` (`KLAVA.bake`)**; `35-core-strata` + host shade (**`tibasalt-ponded`**, already in core for this kit: thick flows with `fx.columns`; `tibasalt` for the thin flank flows; its `laterite` kind for the redlands); **`38-core-relief`** (**`scarp`** for each flow front: a lobate polyline with `benches`, the trap stair; `pit` for the pit chains and the vent pit; `talus`; `meander` for the rilles' path); **`37-core-stacks`** (mesa/butte with `columns` for the fronts' tiers and the kipukas; **`chimney`** form `pipe` for hornitos over the tube); `37b-core-stacks-contour` (the colonnades' joints, if they read better: stations 1-2 only); `36-core-carve` (the colonnade overhang, tube mouths); `39-core-cavern` (`KCAVERN` `tube`: the walked stretch of `tube_god_07` at station 2 and the cross-conduit's mouth at the head); `40-core-basin` (the playas); `42-core-frost` (step 1's winter ground, station 2); `43-core-ground` (`KGROUND`, **at most five layers a station**: ebadlands' lesson, the 16-unit limit); `44-core-farfield` + draw, `45-core-horizon` + shade; **`47-core-therm` (`KTHERM`)** at the head | the ground, the flows and their ages, the fronts, the rilles and tubes, the rock, the far country |
| `core/water` | `20`, `21`, `22`, `50`, `51` (the springs' streams on the rille floor and the north wall, the crater lake, the playa's sheet water); `geyser/52` (`WATER.spring`: the warm spring at the head, as the Hearths take it); **`ext/60` (`WATER.fields`, `WATER.fieldAt`)** for wet ground and the flora's clearance; `ext/57` (the audit); **`ext/58`'s mirror switch** (`WATER.mirrorSwitch`, off at load: the crater lake and a wet playa, so nothing is built until asked); **`ext/61` (the plume, `tintFlow`)** only if the crater lake is kept: the warm spring's iron-red silt swirling into it (opt-in, the head only) | every water surface and the land side of its edge |
| `core/atmos` | the core, presets, export, waves, skylight, `bindHost`, the shared sky (`skyBiome`, the eclipse seasons for `HEARTH.work`), `bindWeather`, snow cover (step 1's winter; at the head its mask from `KTHERM`'s `snowMask`), height fog, `3-particles` (steam at the head, dust on the playa) | the sky, the light, the weather, the steam and dust |
| `core/hazard` | `KHAZ` | the vent's heat and gas, thin roofs over the tube and the pits' edges, the playa's flash floods, the low end's heat, step 1's cold |
| `core/clock` | `KCLOCK` | the hour and season (the head's hearth fans, step 1's snow, the low end's heat of the day) |
| `core/host` | `FULL` (camera, loop, clock, panel, probe, inspector, marks, pictures, minimap, editor) | the page shell; the probe checks section 9's invariants |
| `core/materials` | `record` (`KMAT`) and the pack (`materials.json`, `tools/textures/pack.py biomes/godstep`); the head reads `biomes/hearths`' pack as a second pack | every library set (section 8) |
| `core/export` | `07`, `09` | the krator-world container; the hazards section |

Not taken: `core/mask` (nothing is placed from a canvas), `core/city`, `core/hamlet`, `core/camp`, `core/simulation`,
`core/furnish` (no settlement: the Talovolci's villages and fields are sites published as data, section 5), `core/lod` (the biome
core's runtime LOD covers it), `33b-core-bamboo`, `36-core-walker`, `37-core-traps`, `38-core-fire` (no flow is young enough to
burn: section 10), `39-core-lean` (the guyed stalk is held up, not bent: its guy-roots are geometry), `41-core-scour` (no
megaflood crossed the valley), the season beyond snow, heat and `HEARTH.work`.

`tools/check_core_use.py` runs on every station before it is called done; `tools/check_port.py` before every build.

### New in core (each small, each a proposal)

1. **`KLAVA` beds into `KSTRATA`**: `KLAVA.bake` returns the ground each eruption added and which eruption froze on top
   (`dh`, `age`), but a cliff cut through baked flows draws `KSTRATA`'s own random beds. A bridge (`KLAVA.column(bake, x, z)`
   -> the frozen flows' thicknesses, bottom up) lets a front's or rille's wall show the same flows the plain was built from.
   Godthrone station 2 would read it too.
2. **A rille over a tube**: `KRELIEF` kind `rille` (or `meander` with a U profile and an overhang parameter), keyed to a
   `KCAVERN` tube record, so where the tube's roof fell the trench is cut, and where the roof stands the pit chain and
   skylights are placed from the roof's thickness. Today a kit would line them up by hand. The Throne's tube station
   (`tube_hot_05`) and a possible Rift tube station (`tube_rift_08`) are the same problem.
3. **Inflation**: the ponded flows' **tumuli and pressure ridges** (lobes that swelled under their crust). `KLAVA` does not
   inflate; a small `KRELIEF` kind `tumulus` would. Optional: the plains read without it.

Nothing else is new: `KTHERM`, `KLAVA`, `KSTACKS` `chimney`, `KRELIEF.scarp`, `WATER.fieldAt`, the field contract, the
`breath` mode, the mirror switch and the plume are all in core now.

## 1. The ground (scale model 5.1, surveyed 2026-11-03)

Surveyed from `tools/scale-model/model/data` through `smodel/page.py` (5.1 canvas, 1821x1723, 2 km a pixel; the old plan's px
are converted with `legacy_px`, +272, +330). The polygon is the same: **37,036 km²**, 5.1 px 857-1010 by 1044-1154 (old
585-738 by 714-824), no open water on the water layer. Height p5/median/p95 **1,008 / 2,839 / 4,367 m**; rain p5/median/p95
**94 / 235 / 1,443 mm** (4.22: median 173); median mean temperature **+10 °C**.

Classes: BSk 10,484 km², Dsb 7,324, ET 4,804 (the Godthrone's foot and the north arm), Cfa 3,608 and Csa 3,292 (the north
wall), Dsc 1,800, **WH 1,744** (a "highland lake" class with no water under it: section 1, "On the model"), Dfb 996, Dfc 720,
EF 676 and HT 264 (the Godthrone's flank inside the polygon), BWk 564, Csb 404, Dsa 248.

### The steps

The sculpt runs along an axis from the vent at 5.1 px 892.8,1145.2, bearing ENE (-0.28 rad). The model's step levels (2,700,
2,000, 1,300 and 600 m) are offsets: the sculpt adds a tilt of 1.8 m/km falling downstream and a cross-valley bowl, so the floors
as drawn stand 300-400 m above them. This plan follows the ground as drawn. Figures are for the valley's core (over 14 km inside
the polygon, where the sculpt is at full weight); "flat" is under half a degree.

| Step | Nominal | Floor as drawn (flat median) | Core km² (flat) | Air | Rain | Mean (warm/cold), night low | Class | Front below it |
|---|---|---|---|---|---|---|---|---|
| **1, the head step** | 2,700 | **3,000-3,250 (3,121)** | 9,432 (4,316) | 1.08 atm | 94-220, median 157 | +7 (20/-6), -15 | BSk, Dsb, Dsc, ET at the Godthrone's foot | front 1: ~3,150 -> ~2,450 over ~12 km; centre line ~px 911,1129 to 902,1101 |
| **2** | 2,000 | **2,250-2,450 (2,345)** | 7,100 (1,916) | 1.19 | 78-110 on the floor (173 with the north wall) | +11 (23/-2), -11 | Dsb, BWk and BSk on the floor; Cfa, Csa on the north wall | front 2: ~2,400 -> ~1,650; ~px 937,1122 to 929,1093 |
| **3** | 1,300 | **1,550-1,670 (1,613)** | 4,480 (1,052) | 1.30 | 125 on the floor (204 with the wall) | +15 (28/+3), -6 | BSk; Cfa on the wall; WH (dry) | front 3: ~1,600 -> ~880; ~px 964,1114 to 956,1085 |
| **4, the low end** | 600 | **830-1,030 (881)** | 3,584 (592) | 1.43 | 188-267 | +22 (35/+9), 0; summer highs to 44 | BSk, Csa; WH (dry) | none: a closed basin (below) |

- **The fronts** are lobate in plan (the sculpt's lobes swing them 6-9 km either way) and fall ~700 m each over the model's
  12-14 km ramp, up to 5° on the model. At the kit's scale that ramp is the **trap stair**: a staircase of flow-front benches,
  each a flow tens of metres thick, as the Faroes' and the Deccan's flood basalts stand (`refs/07`).
- **The north arm** (px 883-947 by 1044-1063): high ground rising north from step 1 to 3.8-3.9 km (ET, up to 1,400 mm on its
  crest: the wettest ground in the polygon), the wall the Bowl lies beyond.
- **The north wall** (px ~925-960 by 1060-1085): the valley's north side above steps 2-3, Cfa and Csa at 2,100-2,600 m,
  800-1,100 mm, +11-12 °C (22-24/+0-1). The only wet country in the valley; Rrivar Cistal rises on it.
- **The Godthrone's foot**: south-west of step 1 the ground climbs the shield at once (4.7 km 10 km from the vent, ET; the
  Godthrone's 25 km rim is 250 km off).

### The head: the vent pit

`DATA.vents[77]`: 5.1 px 892.8,1145.2 (old 620.8,815.2), floor 2,700 m, peak 2,850 m, radius 1.8 km. Drawn as a pit about 6.4
km across, its floor at 2,700 m, its inner wall rising to a rim at 2,810-2,850 m (highest to the WNW), then the step-1 plain
at 3,000-3,050 m round it: **a pit crater, 300-350 m deep in the plain**, not a cone. On the floor: Dsc, 110 mm, +12 °C
(25/-1), night low -12, 1.14 atm. The plain round it is colder: +9 (22/-4), night low -15.

It is the **head of the master tube**: `tube_god_07` leaves it ENE, and `tube_god_n_12`'s **West Godstep Rim Cross-Conduit**
(habitable, 26 m wide) comes into it from the south-west, from the **Ilmenite Pillar Vault** (5.1 px 858,1182) on the
Godthrone's north shield. Two tube mouths in one pit wall.

### The tubes and the rilles

- **`tube_god_07`**, "Godstep & Pluton Titanium-Basalt Master Tubes": rock `tibasalt`, state `collapsed_rille`, 48 m wide, 28 m
  high, its roof 55 m down, 265 km with its branch; culture "ancients" on the record (section 10). In the valley its path runs
  893,1145 -> 910,1134 -> 928,1122 -> 947,1110 -> 966,1098 (5.1 px), along the polygon's south-east side; its branch, the
  **Pluton Sealed Sub-Shield Tube** (habitable), runs separately on the Godthrone to the Pluton galleries (px 743,1328, 9,650 m).
- **The rilles as drawn**: rille 1 follows the tube from the vent, 140-230 m deep and ~5 km across on the model, its floor
  ~2,850-2,930 m in a plain of 3,000-3,050; rille 2 runs parallel ~14 km to the north-west from ~15 km down, ~150 m deep.
  Both read clearly on step 1. **Below front 1 the tube runs on the polygon's edge**, where the sculpt fades, so on the model
  the rille is lost in the valley's south-east wall there. The kit cuts it along the tube's path at 1:1 regardless.
- Neighbouring tubes (the Godthrone's, not this kit's): `tube_god_nw_11` (to the Span wall), `_se_13` and `_ssw_14`.

### Water

| River (5.1 name, `frozen_river_names.json`) | Old name | Kind | Length | From -> to | Note |
|---|---|---|---|---|---|
| **Guli Cistal** (`r453`, "crystal wadi") | Vali de Daridel | dry wadi | 35 km | 3,962 m -> 3,129 m on step 1 (px 867,1143 -> 875,1129) | its record says it ends in a closed basin at 2,693 m: the 4.22 figure; the ground there is 3,130-3,160 m and drains (below) |
| **Guli Grin** (`r845`, "green wadi") | Vali Guaida | dry wadi | 41 km | 5,294 m on the Godthrone -> Guli Cistal at 3,070 m | |
| **Guli Blaca** (`r747`, "black wadi") | Vali Mos | wadi, 7.9 m³/s when it runs | 34 km | 2,433 m -> 1,094 m (px 929,1067 -> 933,1053) | off the north wall, northward |
| **Rrivar Cistal** (`r025`, "crystal river") | Rrivar Salta | perennial river | 126 km | rises at 2,268 m on the north wall (px 939,1069) -> the Ring Sea (px 926.8,1013) | 152 m³/s at its mouth; 9 of its 28 points in the polygon |

- **The lower valley is closed.** Filled from step 4's floor, the valley holds water up to a spill at about **1,986 m**: an
  ~8,100 km² depression, ~1,100 m deep at step 4, taking steps 3 and 4 and the foot of front 2. With 125-270 mm of rain and a
  +22 °C mean, it is a **terminal playa**, not a lake. Steps 1 and 2 hold no closed hollow at the model's 2 km cell.
- **No standing water** anywhere on the water layer. The two salt lakes outside the south-east corner (-1,225 and -1,085 m)
  are the crater floor's.

### People, polities and neighbours

- **The Talovolci** (`LORE.md` §6.21): their polygon covers 35,780 km² of the valley; the **Empire of Iziz**'s 33,180 km².
  **Daridel's old site** (old px 608,798, 5.1 px 880,1128) is on step 1's plain at **3,148 m**: BSk, 94 mm, +8 °C (21/-5),
  night low -15. §6.21's "it stood on dry steppe in godstep valley" still holds.
- **Arcbeam** (5.1 px 1016,1058, 2,119 m, Cfa 847 mm), one of the Ancients' arcologies (`LORE.md` line 132), stands just off the
  NE corner; Gemini's sculpt protects it.
- **Neighbours** (within 16 km of the edge): the Godthrone (2,992 km², median 7,176 m; overlap 1,688), the Bowl (4,124 km²,
  2,115 m), the e inner wall (2,676 km², 2,559 m), the southern highlands (2,280 km², 3,762 m), the sedesert (1,976 km², 1,995
  m), the se savannah rim (1,876 km², 3,731 m); the hyperjungle S barely touches (308 km², 255 m), so the old plan's "opens
  toward the hyperjungle" is gone.
- **The open world**: `openworld/little-demo` covers **24,584 km²** of the valley, unchanged. Its ground there is the
  sedesert's, eastabyss' and hyperjungle's kits; this kit takes it over when built, after the 5.1 re-cut of the little demo
  (`STATIONS-MAP-5.1.md`, "Regions needing a re-cut").

### On the model: things for Gemini or the owner (not changed here)

1. **The step levels**: the docstring's 2,700/2,000/1,300/600 m are the offsets; the floors as drawn are ~3,120/2,345/1,615/880.
   Only the vent pit is pinned at 2,700. This plan follows the drawn floors (open question 1).
2. **Guli Cistal's `to.basin_m` 2,693** is stale: the ground at its mouth is 3,130-3,160 m and no closed hollow is there.
3. **1,744 km² of WH** ("highland lake") on steps 3-4 and the low end with no water on the water layer. Either a terminal lake
   was meant in the closed lower valley, or the class is left over (open question 2).
4. **The tube on the polygon's edge**: below front 1, `tube_god_07` runs where the sculpt's weight fades, so the rille is not on
   the model there. A move of the tube's path ~10 km into the valley, or a wider sculpt weight along it, would put it on the
   ground (open question 3).

## 2. The rock

**Titanium basalt** (`biomes/godthrone/PLAN.md` section 3): black with an ilmenite sheen. On the steps it is **ponded**: thick
flows that cooled slowly into **colonnades**, tall regular columns under a hackly, fanned upper tier (`refs/02`, `refs/03`), in
every front and rille wall: core's `tibasalt-ponded` recipe (flows 8-40 m, thin bead and rubble partings, `fx.columns`). The
thin flank flows above the head are plain `tibasalt`.

- **Weathering, by the new climate.** The old plan's "fresh black above, palagonite below" was a dry-cold line at altitude; on
  5.1 the whole valley is below the Godthrone's 8,500 m line, so every bead parting is **palagonite** (ochre, soft, recessed),
  and on the dry steps 1-2 the flows stay black with **orange rinds** where the glass weathers. The palagonite partings are
  aquitards: they carry the Godthrone's snowmelt under the plain and let it out as **springs in the rille walls** (station 2).
- **Laterite at the low end, relict.** Step 4 is hot steppe now, too dry to make laterite, so the red breakaways are **old**:
  the flows' oldest surface, weathered when the country was wetter and left standing as hardpan cliffs over pale kaolinite
  slopes, as Western Australia's breakaways are in 200-300 mm country (`refs/05`). On the north wall, with ~1,000 mm, red soil is
  still forming under forest. `tibasalt-ponded`'s `laterite` kind, altered by height at the low end (the recipe's `alter`
  `below`), is enough for the breakaways; the north wall's red soil is a `KGROUND` layer.

## 3. The flora

| Species | Ref | Where | What it is |
|---|---|---|---|
| **Red guyed stalk** | 01 | the rille floors under the springs (station 2), irrigated; wild along the north wall's streams | tall thin stems held against the wind by guy-roots, red cup-crowns; the Talovolci farm them for red fibre. Was "the canyons' wet floors": on 5.1 only the springs make them wet |
| **Lava pioneers** | | the younger flows on steps 1-2, the fronts' benches | crusts, cushions and glass-loving lichens in the cracks; the Godthrone's orange endolith band (its section 5) in the glass. On 5.1 the head is 15 °C warmer than the old plan's, so the cushions are fuller and the crusts greener: a cold steppe's pioneers, not an arctic desert's |

Read in place:

- **The Godthrone's crusts and endoliths** on the shield above the head and the north arm's ET.
- **The Hearths' life** at the head only (section 7): `biomes/hearths` by its plan.
- **The sedesert's hot-steppe shrubs** on steps 3-4 (BSk at +15 to +22 °C): the old plan's "savannah rim" is no longer the low
  end's neighbour.
- **The southern highlands' spiral species** on the north wall (Cfa/Csa, ~1,000 mm) and, sparser, along its streams onto step 3.
- **Moss on the old cones in black sand** (`refs/08`): kept on step 2's floor, where the cold desert is (BWk, 78-110 mm), as
  bright moss skins on the north faces only.

## 4. Landforms (`core/terrain`)

- **Flow fronts and the trap stair** (`KRELIEF.scarp` with benches, along lobate polylines from the baked flows' edges;
  `KSTACKS` mesa tiers with `columns`): each step ends in a stair of flow-front benches, 20-80 m each, ~700 m in all; **frozen
  lava falls** where a flow poured over a lip.
- **The ponded floors** (`KLAVA.bake`, 40 m cells, eruptions from the vent and from breakouts along the tube): smooth dark
  plains of overlapping lobes, each cell carrying the eruption that froze on top (the flow-age field the flora reads), crossed
  by low ridges and pressure plates (inflation: proposal 3).
- **The rilles** (`KRELIEF.meander` along `tube_god_07`'s path, or the proposed `rille`): 1-2 km wide at the kit's scale, the
  model's 140-230 m deep, colonnaded walls with an overhanging fan (`refs/02`), talus, springs at the palagonite partings
  (`refs/03`).
- **Pit chains and skylights** (`KRELIEF` `pit`; `KCAVERN` `tube`): where the tube's roof still stands, beyond the rille's end
  and between its collapsed stretches; one skylight walked into the tube at station 2.
- **Hornitos** (`KSTACKS` `chimney`, form `pipe`): rootless spatter chimneys over the tube where it ran full, a few metres high.
- **Kipukas** (`KSTACKS` mesa/butte, older ground): islands of older flow the newer ones went round, with older soil and flora,
  the Talovolci's village sites.
- **Black sand** (`KGROUND` `ground.sand.black`; dunes from the field): on step 2's cold-desert floor, with old moss-skinned cones
  standing out of it (`refs/08`, Mælifell).
- **Playas** (`KRELIEF`/`40-core-basin`): the terminal playa on step 4's floor; small kit-scale ponds behind lobes on steps 1-2
  (below the model's 2 km cell, so not in conflict with it).
- **The vent pit** (station 3): a pit crater 300-350 m deep, its walls stacked `tibasalt`, red oxidised scoria on the upper
  wall, a spring-fed moss lawn and stream on the floor (`refs/04`), the two tube mouths; the older crater beside it with its lake
  and the Talovolci's walled fields (`refs/06`, Corvo) at the kit's scale.
- **Relict laterite breakaways** (station 4): red hardpan cliffs 10-30 m high over pale gullied slopes, mesas of laterite cap.
- **Falls**: no perennial stream crosses a front on 5.1. The old `refs/09` (Háifoss) moves to the north wall, where Guli Blaca
  and the streams under Rrivar Cistal's head fall off the wall in the wet season (station 5); elsewhere the fronts carry **dry
  falls**, polished lips over plunge-pool hollows that run only in a storm.

The fields and seeds are deterministic from the terrain (`KRAND` by cell), as every kit's.

## 5. The people's side

- **The Talovolci** (`LORE.md` §6.21). *Proposed*: their villages stand on the kipukas and at the rilles' heads; their fields
  on the rille floors under the springs, where the red stalk grows, the north wall's streams their other farmland; the fronts
  are **the god's stair**, climbed in procession from the low end to the vent pit (a *Spirladunon* could climb one front); the
  vent pit and its warm spring are a sacred place (the Hearths' plan leaves them a word for the hearth trees). **Daridel's old
  site** on step 1 is a place they remember, with its wadi, Guli Cistal, beside it.
- **The tube** (*proposed*): the cross-conduit from the Ilmenite Pillar Vault is a way up the Godthrone under its shield; the
  master tube's record names its culture "ancients". Who walks them is open (question 6).
- **The Empire of Iziz's road**, if it crossed, crossed the steps, not the rilles.
- The kit publishes the sites (villages, fields, the procession's path, the pit's shrine) as plain data; the buildings are a
  settlement plan's.

## 6. Hazards (`core/hazard`)

The old head was arctic; now the valley runs from a cold winter at the top to a hot summer at the bottom:

- **Step 1**: winter nights to -15 °C, snow lying (cold month -6); spring meltwater flash floods down Guli Grin and Guli
  Cistal off the Godthrone.
- **The head**: the vent's heat and gas over its hot ground (`KTHERM`), the warm spring (by the Hearths' and geyser kit's
  ramps), thin ground at the pit's edge.
- **The tube and pits**: thin roofs, skylights' edges, falls into pits.
- **Steps 3-4**: heat (warm month +35 °C, highs to 44), the playa's flash floods after a storm, dust.

## 7. Stations

Each station's numbers are 5.1's at its site.

1. **The stair** (`dist/godstep.html`; front 1 at ~5.1 px 906,1115: the lip at ~3,150 m over step 2's floor at ~2,450 m;
   1.09-1.18 atm; 94-157 mm; Dsb/BSk; +9 to +12 °C (22-25/-4 to -1), night low -11 to -15). The camera stands on the head
   step's lip: the trap stair falling away in benches with colonnade tiers and a frozen lava fall, step 2's dark floor 700 m
   below with black sand dunes and moss-skinned cones on it, a small playa behind a lobe on the step above, the Godthrone's
   mass to the south-west and the north arm to the north. Set in late winter: snow on the upper benches, none below.
   *Changed*: the old station 1 stood on "~2.7 km" with Daridel's site in view; on 5.1 Daridel's old site is ~60 km off, on
   the plain behind (question 5).
2. **The rille** (`--station rille`; along `tube_god_07` ~20-30 km below the vent, ~5.1 px 902,1140: the plain at
   3,000-3,050 m, the rille floor at ~2,850-2,930 m; 1.10 atm; 110-125 mm; Dsc/Dfc; +9 °C (22/-4), night low -15). A
   colonnaded rille wall with its overhanging fan of columns, a spring at a palagonite parting feeding a stream and the
   Talovolci's red stalk fields on the floor, a pit chain and hornitos on the plain above where the tube is still roofed, and
   one skylight walked down into the tube (48 m wide, 28 m high: `KCAVERN`). *Changed*: the route is the model's tube, not
   a placed one; the floor is wet only below the springs; the station stands on step 1 because only there is the rille on the
   model (question 3).
3. **The head: the stair's hearth** (`--station hearths`, `dist/godstep-hearths.html`; vent 77, px 892.8,1145.2: the pit floor
   at 2,700 m, 1.14 atm, 110 mm, Dsc, +12 °C (25/-1), night low -12). **One station, not two**: the old plan's optional `-vent`
   page and the Hearths' fifth station are this page. Godstep owns the ground and the page (the pit crater, its scoria wall,
   the two tube mouths, the warm spring and moss lawn, the older crater with its lake and walled fields, the Godthrone above);
   the hearth life is `biomes/hearths` read in place, as its plan says (its sections 5, 11 and 13: `HEARTH` data fragments,
   `KTHERM` from the vent record, the geyser kit's `puna` recipe for the field, the `breath` fold on `HEARTH.work`, the
   station's `99-host-take.js` and `station.json` in `biomes/godstep/stations/hearths/`). One disc of broad-fanned hearth trees
   round the spring; set on a winter night, the one season the engine earns, with a noon preset of the field shut and silver.
   *Changed*: the old head was a cinder cone at 4,973 m in arctic desert; on 5.1 it is a sheltered pit 300 m below a cold
   steppe, the warmest ground on step 1.
4. **The redlands** (`--station redlands`; step 4's floor at ~5.1 px 975,1085: ~880-1,030 m, 1.41-1.43 atm, 188-267 mm, BSk,
   +22 to +23 °C (35-36/+9-10), night low 0, summer highs to 44). Relict laterite breakaways over pale gullied slopes, front 3's
   black stair standing 700 m above to the west, the terminal playa's white edge, the sedesert's shrubs, heat shimmer. *Changed*:
   the old redlands was Cfa (1,160 mm), the forest closing in toward the hyperjungle; on 5.1 the low end is a hot closed basin,
   so the laterite is old and the forest is gone (the north wall keeps it: station 5).
5. **The north wall** (optional, `--station wall`; Rrivar Cistal's head at ~5.1 px 939,1069: 2,268 m, 1.21 atm, 957 mm, Csa,
   +12 °C (23/+1); Cfa, ~990 mm, at px 930,1070). The valley's one wet side: forest of the southern highlands' spiral species on
   red soil, the springs of Rrivar Cistal, Guli Blaca's wet-season falls off the wall through banded flows (`refs/09`), the
   steps' dry country below to the south. New on 5.1 (question 4).

## 8. Textures

Everything this plan needs is in the library: `ground.lava.aa`, `ground.lava.crust`, `ground.sand.black`, `ground.scoria`
(tinted red for the pit), `ground.cinder`, `ground.playa.red` (tinted pale), `ground.salt`, `ground.pavement.desert`,
`ground.moss*`, `rock.basalt.titanium`, `rock.basalt.*`, `rock.columnar`, **`rock.palagonite`**, **`rock.laterite`**,
**`card.guyedstalk`** (the last three delivered since the old plan; `core/materials/PROMPTS-NEEDED.md` section 23's list is met).
`ground.redsoil` for the north wall. The head reads `biomes/hearths`' own sets from its pack. Nothing owed; a gap found in D1
goes in `PROMPTS-NEEDED.md` with its prompt.

## 9. Verify (what `verify.py --assert` and the probe check)

- Every station's ground at its site within 50 m of 5.1's height (the steps' floors, the pit's floor at 2,700 m).
- The fronts' benches step down monotonically along the axis; no flow-front bench overhangs the next.
- The rille follows `tube_god_07`'s path within its width; every pit and skylight stands over the tube; the walked tube
  section agrees with `KCAVERN.bore`/records.
- Flora: nothing on fresh flow but pioneers; no stalk outside a spring's wet field (`WATER.fieldAt`); no tree on a front's
  face (the no-trees-on-cliffs rule, by slope and rock).
- `BIO.envCheck` over the probe's points; the mirror switch off at load (tri counts unchanged); `KTHERM`'s snow mask at the head.
- Under 5 M triangles and 60 draws a view on the integrated GPU, measured as the Godthrone's `PERF.md` measures.

## 10. Order of work

- **D0.** The owner answers section 11; the station sites; the model questions go to Gemini (none is needed before D1: the plan
  follows the ground as drawn).
- **D1.** The kit on the biome core: fields (step, flow age from `KLAVA.bake`, rille, kipuka, sand, wet, salt), zones, station
  1's ground and stair.
- **D2.** The landforms: fronts (`KRELIEF.scarp`), rilles and tube (`KCAVERN`), pits, hornitos, colonnades (`tibasalt-ponded`),
  playas, dunes; core proposals 1-2 if the owner takes them.
- **D3.** The flora; the sedesert's, the southern highlands' and the Godthrone's species read in place.
- **D4.** Stations 2 and 4; then 3 with the Hearths (after `biomes/hearths`' data fragments exist); 5 if wanted.
- **D5.** `verify.py --assert`, `PORT.md`, the index tools, `tools/check_core_use.py`, the gallery; the little demo's re-cut.

## 11. Open questions for the owner

1. **The step heights**: follow the floors as drawn (~3,120 / 2,345 / 1,615 / 880 m; recommended), or ask Gemini to bring
   them to the nominal 2,700 / 2,000 / 1,300 / 600 m?
2. **The closed lower valley**: a dry terminal playa on step 4 (as the rain says; recommended), or a terminal lake, which
   the stray WH class hints at? A lake would need Gemini's water layer.
3. **The rille below front 1**: keep the rille station on step 1 where the model has it (recommended), or have Gemini move
   `tube_god_07` ~10 km into the valley so the rille runs down all four steps on the model?
4. **The north wall station**: wanted? It is the one wet place and keeps the forest, the falls and the red soil the old
   redlands had.
5. **Daridel's old site**: a marker on station 1's far plain, a small station of its own, or the settlement plan's?
6. **The tubes' people**: `tube_god_07`'s record says "ancients"; the cross-conduit is "habitable". Are the tubes the Ancients'
   works, used by the Talovolci, and does the procession go on up the cross-conduit?
7. **How young the youngest flow is** (a fresh black flow is a story; all old ones suit the relict laterite and the moss).
8. **The Talovolci's names** for the steps, the stair, the pit and the hearth trees.
9. **Core proposals 1-3** (`KLAVA` beds into `KSTRATA`, a rille over a tube, inflation): take them, or build without?
