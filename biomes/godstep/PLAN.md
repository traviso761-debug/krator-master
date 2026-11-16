# godstep: the plan (rewritten on scale model 5.1, 2026-11-03; the owner's answers folded in the same day)

**Godstep valley**: the valley that steps down east-north-east from a flank vent at the foot of the Godthrone's north-east
shield, between the Godthrone, the southern highlands and the walls above the Bowl. Its theme is still **the god's stair**:
very fluid titanium lava ponded on a floor, spilled over the next lip and ponded again, so the valley comes down in four dark
steps, each ending in a flow front, cut by lava-tube rilles with no water in them. Every flow is old. The Talovolci farm the
rilles' spring-fed floors and the wet north wall, walk the tubes from step to step, and gather in the caves near their mouths.

Owner's brief (2026-10-26): Godstep valley's ideas were asked for; the lava staircase is the proposal, with black sand on its
cold-desert steps. The Godthrone's lava is titanium-rich (`biomes/godthrone/PLAN.md`). The references are in `refs/`.
The owner (2026-11-02): rewrite the plan on Gemini's scale model 5.1 before anything is built; the Hearths' third field is
Godstep's flank vent (`biomes/hearths/PLAN.md` section 5).

**Settled with the owner, 2026-11-03** (the answers to the rewrite's open questions): the plan follows **the step floors as
drawn** (~3,120 / 2,345 / 1,615 / 880 m); the closed lower valley ends in **a dry terminal salt playa** on step 4; **the rille
station stays on step 1**, where the model's tube is; **the north wall station is in** (the wet place: the forest, the falls,
the red soil); **Daridel's old site is the settlement plan's**; **the tubes are lava tubes**, natural or Ancient-era, with a deep
connection to the Godthrone's network and Pluton as lore, and the Talovolci use them **for transit between the steps and
for harvesting near the mouths, never deep into the mountain** (the owner, later the same day); **every flow is old**, none fresh and black; the **Talovolci names** are coined from the tongue (section 5a); and **core
proposals 1-3 are taken**, owed before the kit's D2 (section "Core adoption").

**Status: every station built, 2026-11-10** (a cloud session, `claude/godstep-finish-cloud`): station 1, the stair (`dist/godstep.html`,
GPU-verified 2026-11-09), and stations 2-5, the rille, the hearths, the redlands and the wall (`--station rille|hearths|redlands|wall`), each
in its own section "Station N, as built" at the end. Stations 2-5 pass `verify.py --assert` in software GL only: their GPU verify is owed. No change to `LORE.md` or the model is made here: lore sentences and
the Talovolci words are *proposed* wording.

## What changed on 5.1, and why the plan moved

`biomes/STATIONS-MAP-5.1.md` ("Needs work") flagged every Godstep station. Gemini sculpted the valley from this plan's own
section 4 (`tools/scale-model/smodel/volcanoes.py`, section 3): four ponded titanium-basalt steps along an ENE axis from the flank
vent (`DATA.vents[77]`), with two collapsed lava-tube rilles. What that did to the plan:

| | 4.22/4.23 (the old plan) | 5.1 (this plan) |
|---|---|---|
| The head | a cinder cone high on the Godthrone's flank at 4,973 m, ET, 47 mm, -3 °C | a **pit crater** at the valley's head: floor 2,700 m, rim 2,810-2,850 m, sunk into the top step's plain (3,000-3,050 m); Dsc, 110 mm, +12 °C (25/-1), night low -12, 1.14 atm |
| The steps | broad flats "at about 2.7, 2.0, 1.3 and 0.6 km", described, not drawn | drawn: floors at **~3,120, ~2,345, ~1,615 and ~880 m** (flat ground's median), each front a lobate ~700 m fall over 12-14 km (section 1) |
| The country | arctic-dry head, cold desert above, humid Cfa (1,160 mm) at the low end opening to the hyperjungle | **cold-dry above, hot-dry below**: 78-160 mm on steps 1-2, 125-270 mm on steps 3-4; the low end is a hot closed basin with a salt playa (BSk, +22 °C, summer highs to 44 °C), not a wet one. The only wet ground is the **north wall** (Cfa/Csa, 800-1,100 mm) |
| Water | Vali de Daridel and Vali Guaida into a lava-dammed basin at 2,693 m | the same wadis under their frozen 5.1 names, **Guli Cistal** and **Guli Grin**; the step-1 basin no longer closes on the model; the **lower valley is closed** below a ~1,986 m spill; **Rrivar Cistal** rises on the north wall and leaves north for the Ring Sea |
| Tubes | "lava tubes and pit chains" in general | **`tube_god_07`**, the Godstep and Pluton master tubes (265 km; 48 m wide, 28 m high, 55 m down), collapsed into the rille from the vent; and **`tube_god_n_12`**'s West Godstep Rim Cross-Conduit coming down the Godthrone into the same vent pit |
| Flows | "how old the youngest is" open | all old (the owner, 2026-11-03): weathered skins, soil in the joints, laterite at the low end |

So: the head is no longer arctic (the flora and hazards there change with it); the low end is no longer humid (the redlands
become relict laterite over a salt playa, as Western Australia's breakaways stand over their salt lakes); the wet forest moves
to the north wall, a station of its own; the rille has a real route; and the vent station is the Hearths' station, built once
(section 7).

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/godstep/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `refs/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`) |
| Pages | `dist/godstep.html` (station 1, the stair), `--station rille` -> `dist/godstep-rille.html`, `--station hearths` -> `dist/godstep-hearths.html` (the head: the Hearths' station, section 7), `--station redlands` -> `dist/godstep-redlands.html`, `--station wall` -> `dist/godstep-wall.html` (the north wall) |
| Core | the biome core, `core/host`, `core/rand`, `core/tags`, `core/space`, `core/terrain` (`KLAVA`, `KSTRATA` `tibasalt-ponded`, `KRELIEF.scarp`, `KSTACKS`, `KCAVERN`, `KTHERM`), `core/water` (with the fields and the mirror switch), `core/atmos`, `core/hazard`; the section "Core adoption" |
| Read in place | `biomes/godthrone` (the rock's recipe, the crusts and endoliths, the far mass); `biomes/hearths` (the hearth life at the head, by its plan: section 7); `biomes/geyser` (its `puna` field recipe at the vent, as the Hearths read it); `biomes/shighlands` (the spiral flora on the north wall); `biomes/sedesert` (the hot steppe's shrubs on steps 3-4); `kits/fauna`; `kits/crops` (the Talovolci's fields); `kits/resources` (what the caves yield, section 5); nothing copied |
| Its own flora | the lava pioneers and the red guyed stalk (section 3) |
| Object | `GSTEP` (`build`, `dress`, `SPECIES`, `PLANTS`), on the `BIOME-API.md` contract |
| Out of scope | the Talovolci's villages and **Daridel's old site** (the settlement plan's: the kit publishes sites as data); Arcbeam (the arcology just off the NE corner); the Godthrone's tube network beyond the mouths; the open world's ground in `openworld/little-demo` (a re-cut after 5.1 is frozen, section 1) |

It is a new biome, so it goes in the gallery when it first reaches `main`.

## Core adoption (written before the first fragment, 2026-11-03)

Start from `biomes/godthrone` (the same rock, `KLAVA.bake` worked at its station 2, the far Godthrone) and the newest full
adoption among the rebuilt kits (`biomes/swhighlands`, `biomes/ebadlands`). The modules every station takes, and for each it
does not, why:

| Module | Takes | For |
|---|---|---|
| `core/biome` | `10-core-head`, `20-core-kit` (`BIO.INDEX_ITEMS`, LOD merge/fade/cull), `30-core-foliage` (ground tint, A2C, back-light, the one wind), `31b-core-leafset`, `32-core-variants`, `33-core-fungoid` (`BIO.fung`: crusts, cushions, the stalk's cups, the cave fungi), `34-core-impostor` (far stalks, shrubs and the north wall's forest), `35-core-anim` (the wind; the **`breath` mode** at the head only, for the hearth fans, driven by `HEARTH.work`), `40-core-place`, **`41-core-env`** (the field contract: `BIO.env` with `ground`, `water: WATER.fieldFns(F)`, `therm` at the head, `temp` from the model's climate elsewhere; the kit's own `rock`, `salt` (the playa) and `wet` (the springs' seep)), `42`/`43-core-export(-host)`, `44-core-stage` | every species on the core's builders and items; one field table that placement, the ground and the hazards all read |
| `core/rand` | `KRAND` | every field and placement cell (`KRAND.hash(world, ix, iz, salt)`), every eruption's roughness; no sin hash, no stream |
| `core/tags` | `50`, `52`, `53` | every item set, instance, flow lobe, pit, cave and volume a record |
| `core/space` | `KSPACE` | the keep-clear between stalks, shrubs and trees; the nearest-pit and nearest-spring index the hazards and fields read |
| `core/terrain` | `30-core-field` + brush; **`46-core-lava` (`KLAVA.bake`)**; `35-core-strata` + host shade (**`tibasalt-ponded`**, already in core for this kit: thick flows with `fx.columns`; `tibasalt` for the thin flank flows; its `laterite` kind for the redlands and the north wall's cliffs); **`38-core-relief`** (**`scarp`** for each flow front: a lobate polyline with `benches`, the trap stair; `pit` for the pit chains and the vent pit; `talus`; `meander` until the rille kind exists); **`37-core-stacks`** (mesa/butte with `columns` for the fronts' tiers and the kipukas; **`chimney`** form `pipe` for hornitos over the tube); `37b-core-stacks-contour` (the colonnades' joints, if they read better: stations 1-2 only); `36-core-carve` (the colonnade overhang, tube mouths); `39-core-cavern` (`KCAVERN` `tube`: `tube_god_07`'s runs between skylights in the valley, the Talovolci's road from step to step, walked at station 2; the cross-conduit's mouth at the head, to its first bend only); `40-core-basin` (the salt playa); `42-core-frost` (step 1's winter ground, station 2); `43-core-ground` (`KGROUND`, **at most five layers a station**: ebadlands' lesson, the 16-unit limit); `44-core-farfield` + draw, `45-core-horizon` + shade; **`47-core-therm` (`KTHERM`)** at the head | the ground, the flows and their ages, the fronts, the rilles and tubes, the rock, the far country |
| `core/water` | `20`, `21`, `22`, `50`, `51` (the springs' streams on the rille floor and the north wall, the north wall's falls, the crater lake, the playa's sheet water after a storm); `geyser/52` (`WATER.spring`: the warm spring at the head, as the Hearths take it); **`ext/60` (`WATER.fields`, `WATER.fieldAt`)** for wet ground and the flora's clearance; `ext/57` (the audit); **`ext/58`'s mirror switch** (`WATER.mirrorSwitch`, off at load: the crater lake and a wet playa, so nothing is built until asked); **`ext/61` (the plume, `tintFlow`)** only at the head: the warm spring's iron-red silt swirling into the crater lake (opt-in) | every water surface and the land side of its edge |
| `core/atmos` | the core, presets, export, waves, skylight, `bindHost`, the shared sky (`skyBiome`, the eclipse seasons for `HEARTH.work`), `bindWeather`, snow cover (step 1's winter; at the head its mask from `KTHERM`'s `snowMask`), height fog (the north wall), `3-particles` (steam at the head, salt dust on the playa) | the sky, the light, the weather, the steam and dust |
| `core/hazard` | `KHAZ` | the vent's heat and gas, thin roofs over the tube and the pits' edges, the caves' dark, the playa's flash floods and crust, the low end's heat, step 1's cold |
| `core/clock` | `KCLOCK` | the hour and season (the head's hearth fans, step 1's snow, the low end's heat of the day, the north wall's wet season) |
| `core/host` | `FULL` (camera, loop, clock, panel, probe, inspector, marks, pictures, minimap, editor) | the page shell; the probe checks section 9's invariants |
| `core/materials` | `record` (`KMAT`) and the pack (`materials.json`, `tools/textures/pack.py biomes/godstep`); the head reads `biomes/hearths`' pack as a second pack | every library set (section 8) |
| `core/export` | `07`, `09` | the krator-world container; the hazards section |

Not taken: `core/mask` (nothing is placed from a canvas), `core/city`, `core/hamlet`, `core/camp`, `core/simulation`,
`core/furnish` (no settlement: the Talovolci's villages, fields and gathering caves are sites published as data, section 5),
`core/lod` (the biome core's runtime LOD covers it), `33b-core-bamboo`, `36-core-walker`, `37-core-traps`, `38-core-fire` (every
flow is old: nothing burns), `39-core-lean` (the guyed stalk is held up, not bent: its guy-roots are geometry), `41-core-scour`
(no megaflood crossed the valley), the season beyond snow, heat, the wet season and `HEARTH.work`.

`tools/check_core_use.py` runs on every station before it is called done; `tools/check_port.py` before every build.

### Owed in core (taken by the owner, 2026-11-03; each written in core before the kit's D2)

Each is small, `[G data]`, node-tested, with a Godot twin where the module has one; each is listed in `HANDOFF-REBUILD.md`,
"Still to write (core)".

1. **`KLAVA` beds into `KSTRATA`** (`core/terrain/46-core-lava.js` and `35-core-strata.js`): `KLAVA.bake` returns the ground each
   eruption added and which eruption froze on top (`dh`, `age`), but a cliff cut through baked flows draws `KSTRATA`'s own random
   beds. A bridge, `KLAVA.column(bake, x, z)` -> the frozen flows' thicknesses bottom up, and a `KSTRATA` option to take a column
   as its beds, lets a front's or a rille's wall show the same flows the plain was built from. Godthrone station 2 reads it too.
2. **A rille over a tube** (`core/terrain/38-core-relief.js`, with `39-core-cavern.js`): `KRELIEF` kind `rille`, keyed to a
   `KCAVERN` tube record: where the tube's roof fell the trench is cut (a U profile, an overhang parameter for the colonnade's
   fan, talus at the foot); where the roof stands, the pit chain and skylights are placed from the roof's thickness. The Throne's
   tube station (`tube_hot_05`) and a possible Rift tube station (`tube_rift_08`) are the same problem.
3. **Inflation** (`core/terrain/38-core-relief.js`): `KRELIEF` kind `tumulus`, the ponded flows' **tumuli and pressure ridges**
   (lobes that swelled under their crust, with the axial crack and its slabs), placed along `KLAVA.bake`'s lobes. `KLAVA` does not
   inflate; the plains are not built without it.

Nothing else is new: `KTHERM`, `KLAVA`, `KSTACKS` `chimney`, `KRELIEF.scarp`, `WATER.fieldAt`, the field contract, the
`breath` mode, the mirror switch and the plume are all in core now.

## 1. The ground (scale model 5.1, surveyed 2026-11-03)

Surveyed from `tools/scale-model/model/data` through `smodel/page.py` (5.1 canvas, 1821x1723, 2 km a pixel; the old plan's px
are converted with `legacy_px`, +272, +330). The polygon is the same: **37,036 km²**, 5.1 px 857-1010 by 1044-1154 (old
585-738 by 714-824), no open water on the water layer. Height p5/median/p95 **1,008 / 2,839 / 4,367 m**; rain p5/median/p95
**94 / 235 / 1,443 mm** (4.22: median 173); median mean temperature **+10 °C**.

Classes: BSk 10,484 km², Dsb 7,324, ET 4,804 (the Godthrone's foot and the north arm), Cfa 3,608 and Csa 3,292 (the north
wall), Dsc 1,800, **WH 1,744** (a "highland lake" class with no water under it: left over, section 1, "On the model"), Dfb 996,
Dfc 720, EF 676 and HT 264 (the Godthrone's flank inside the polygon), BWk 564, Csb 404, Dsa 248.

### The steps

The sculpt runs along an axis from the vent at 5.1 px 892.8,1145.2, bearing ENE (-0.28 rad). The model's step levels (2,700,
2,000, 1,300 and 600 m) are offsets: the sculpt adds a tilt of 1.8 m/km falling downstream and a cross-valley bowl, so the floors
as drawn stand 300-400 m above them. **The kit follows the ground as drawn** (the owner, 2026-11-03). Figures are for the
valley's core (over 14 km inside the polygon, where the sculpt is at full weight); "flat" is under half a degree.

| Step | Nominal | Floor as drawn (flat median) | Core km² (flat) | Air | Rain | Mean (warm/cold), night low | Class | Front below it |
|---|---|---|---|---|---|---|---|---|
| **1, the head step** (*Virstostepos*) | 2,700 | **3,000-3,250 (3,121)** | 9,432 (4,316) | 1.08 atm | 94-220, median 157 | +7 (20/-6), -15 | BSk, Dsb, Dsc, ET at the Godthrone's foot | front 1: ~3,150 -> ~2,450 over ~12 km; centre line ~px 911,1129 to 902,1101 |
| **2** (*Secondostepos*) | 2,000 | **2,250-2,450 (2,345)** | 7,100 (1,916) | 1.19 | 78-110 on the floor (173 with the north wall) | +11 (23/-2), -11 | Dsb, BWk and BSk on the floor; Cfa, Csa on the north wall | front 2: ~2,400 -> ~1,650; ~px 937,1122 to 929,1093 |
| **3** (*Đirdostepos*) | 1,300 | **1,550-1,670 (1,613)** | 4,480 (1,052) | 1.30 | 125 on the floor (204 with the wall) | +15 (28/+3), -6 | BSk; Cfa on the wall | front 3: ~1,600 -> ~880; ~px 964,1114 to 956,1085 |
| **4, the low end** (*Vourđostepos*) | 600 | **830-1,030 (881)** | 3,584 (592) | 1.43 | 188-267 | +22 (35/+9), 0; summer highs to 44 | BSk, Csa | none: a closed basin with its salt playa (below) |

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
(25/-1), night low -12, 1.14 atm. The plain round it is colder: +9 (22/-4), night low -15. It no longer erupts; its warmth
is what the Hearths live on.

It is the **head of the master tube**: `tube_god_07` leaves it ENE, and `tube_god_n_12`'s **West Godstep Rim Cross-Conduit**
(habitable, 26 m wide) comes into it from the south-west, from the **Ilmenite Pillar Vault** (5.1 px 858,1182) on the
Godthrone's north shield. Two tube mouths in one pit wall.

### The tubes and the rilles

- **`tube_god_07`**, "Godstep & Pluton Titanium-Basalt Master Tubes": rock `tibasalt`, state `collapsed_rille`, 48 m wide, 28 m
  high, its roof 55 m down, 265 km with its branch. In the valley its path runs 893,1145 -> 910,1134 -> 928,1122 -> 947,1110 ->
  966,1098 (5.1 px), along the polygon's south-east side; its branch, the **Pluton Sealed Sub-Shield Tube** (habitable), runs on
  the Godthrone to the Pluton galleries (px 743,1328, 9,650 m). The record names its culture "ancients"; the owner (2026-11-03):
  **lava tubes, natural or Ancient-era**, and the connection on to Pluton is deep, far back, lore (section 5).
- **The rilles as drawn**: rille 1 follows the tube from the vent, 140-230 m deep and ~5 km across on the model, its floor
  ~2,850-2,930 m in a plain of 3,000-3,050; rille 2 runs parallel ~14 km to the north-west from ~15 km down, ~150 m deep.
  Both read clearly on step 1, and **the rille station stays there** (the owner, 2026-11-03). Below front 1 the tube runs on the
  polygon's edge, where the sculpt fades, so the rille is not on the model there; the kit draws the tube's path there as a roofed
  tube with a few pits, not a trench, and asks no change of the model.
- Neighbouring tubes (the Godthrone's, not this kit's): `tube_god_nw_11` (to the Span wall), `_se_13` and `_ssw_14`.

### Water

| River (5.1 name, `frozen_river_names.json`) | Old name | Kind | Length | From -> to | Note |
|---|---|---|---|---|---|
| **Guli Cistal** (`r453`, "crystal wadi") | Vali de Daridel | dry wadi | 35 km | 3,962 m -> 3,129 m on step 1 (px 867,1143 -> 875,1129) | its record says it ends in a closed basin at 2,693 m: the 4.22 figure; the ground there is 3,130-3,160 m and drains (below) |
| **Guli Grin** (`r845`, "green wadi") | Vali Guaida | dry wadi | 41 km | 5,294 m on the Godthrone -> Guli Cistal at 3,070 m | |
| **Guli Blaca** (`r747`, "black wadi") | Vali Mos | wadi, 7.9 m³/s when it runs | 34 km | 2,433 m -> 1,094 m (px 929,1067 -> 933,1053) | off the north wall, northward |
| **Rrivar Cistal** (`r025`, "crystal river") | Rrivar Salta | perennial river | 126 km | rises at 2,268 m on the north wall (px 939,1069) -> the Ring Sea (px 926.8,1013) | 152 m³/s at its mouth; 9 of its 28 points in the polygon |

The model's names here are Izani (the Empire's maps); the Talovolci's own words for the valley are section 5a's.

- **The lower valley is closed.** Filled from step 4's floor, the valley holds water up to a spill at about **1,986 m**: an
  ~8,100 km² depression, ~1,100 m deep at step 4, taking steps 3 and 4 and the foot of front 2. With 125-270 mm of rain and a
  +22 °C mean, it ends in **a dry terminal salt playa** on step 4's floor (the owner, 2026-11-03): a white pan that holds sheet
  water for days after a storm, its salt from everything the basin has ever drained. Steps 1 and 2 hold no closed hollow at the
  model's 2 km cell.
- **No standing water** anywhere on the water layer. The two salt lakes outside the south-east corner (-1,225 and -1,085 m)
  are the crater floor's.

### People, polities and neighbours

- **The Talovolci** (`LORE.md` §6.21): their polygon covers 35,780 km² of the valley; the **Empire of Iziz**'s 33,180 km².
  **Daridel's old site** (old px 608,798, 5.1 px 880,1128) is on step 1's plain at 3,148 m (BSk, 94 mm, +8 °C); §6.21's "it
  stood on dry steppe in godstep valley" still holds. The site is the settlement plan's, not a station's.
- **Arcbeam** (5.1 px 1016,1058, 2,119 m, Cfa 847 mm), one of the Ancients' arcologies (`LORE.md` line 132), stands just off the
  NE corner; Gemini's sculpt protects it.
- **Neighbours** (within 16 km of the edge): the Godthrone (2,992 km², median 7,176 m; overlap 1,688), the Bowl (4,124 km²,
  2,115 m), the e inner wall (2,676 km², 2,559 m), the southern highlands (2,280 km², 3,762 m), the sedesert (1,976 km², 1,995
  m), the se savannah rim (1,876 km², 3,731 m); the hyperjungle S barely touches (308 km², 255 m), so the old plan's "opens
  toward the hyperjungle" is gone.
- **The open world**: `openworld/little-demo` covers **24,584 km²** of the valley, unchanged. Its ground there is the
  sedesert's, eastabyss' and hyperjungle's kits; this kit takes it over when built, after the 5.1 re-cut of the little demo
  (`STATIONS-MAP-5.1.md`, "Regions needing a re-cut").

### On the model: notes for Gemini (not changed here, and nothing the kit waits on)

1. **The step levels**: the docstring's 2,700/2,000/1,300/600 m are the offsets; the floors as drawn are ~3,120/2,345/1,615/880.
   The owner keeps the floors as drawn; only the docstring could say so.
2. **Guli Cistal's `to.basin_m` 2,693** is stale: the ground at its mouth is 3,130-3,160 m and no closed hollow is there.
3. **1,744 km² of WH** ("highland lake") on steps 3-4 and the low end with no water on the water layer: left over from an
   earlier pass. The owner's answer is a dry salt playa, so the class there would be BSk/BWh when the climate is next run.
   **Done in scale model 5.1 edit 2** (`tools/scale-model/edit_512.py`, 2026-11-10): the 437 dry WH cells (1,748 km²) took
   the class of the dry land most like them: BSk 383, Csb 35, Csa 11, Dsb 8.
4. **The tube on the polygon's edge** below front 1: kept as it is (the rille station stays on step 1).

## 2. The rock

**Titanium basalt** (`biomes/godthrone/PLAN.md` section 3): black with an ilmenite sheen. On the steps it is **ponded**: thick
flows that cooled slowly into **colonnades**, tall regular columns under a hackly, fanned upper tier (`refs/02`, `refs/03`), in
every front and rille wall: core's `tibasalt-ponded` recipe (flows 8-40 m, thin bead and rubble partings, `fx.columns`). The
thin flank flows above the head are plain `tibasalt`.

- **Every flow is old** (the owner, 2026-11-03). No fresh black glass anywhere: the plains wear a **weathered skin**, dark
  brown-black where the ilmenite holds, orange rinds where the glass has gone to palagonite, the joints filled with wind-blown
  soil and crust, the pressure plates' edges rounded. The ilmenite sheen shows on broken faces only: a new rockfall at a
  front, a rille wall's fresh scar. `KLAVA.bake`'s eruptions give the flows' order and shape, not their freshness: the youngest
  plain is old too.
- **Weathering by the climate.** The whole valley is below the Godthrone's 8,500 m dry-cold line, so every bead parting is
  **palagonite** (ochre, soft, recessed). The palagonite partings are aquitards: they carry the Godthrone's snowmelt under the
  plain and let it out as **springs in the rille walls** (station 2) and in the north wall's cliffs (station 5).
- **Laterite.** Step 4 is hot steppe now, too dry to make laterite, so its red breakaways are **relict**: the flows' oldest
  surface, weathered when the country was wetter and left standing as hardpan cliffs over pale kaolinite slopes, as Western
  Australia's breakaways are in 200-300 mm country (`refs/05`). On the north wall, with ~1,000 mm, red soil is **still forming**
  under forest and the laterite there is living. `tibasalt-ponded`'s `laterite` kind, altered by height at the low end (the
  recipe's `alter` `below`) and laid on the north wall's cliffs, does both; the red soil is a `KGROUND` layer.
- **Aura geodes** (the owner, 2026-11-09; `biomes/CRYSTAL-CAVES-5.1.md` site 3, "Aura and bismuth"). The ponded flows' vesicular tops
  hold geodes, and here their quartz took a film from the titanium rock: **aura**, teal, blue and violet with a little gold
  (`KGEODE.MINERALS.aura`). Placed as the scablands' coulee places its geodes (`biomes/scablands/src/87g-host-geodes.js`):
  `KGEODE.scatter` in a band under each flow top (`tibasalt-ponded`'s flow tops) on every front and rille wall, the talus under
  them, with this valley's palette (*proposed*: aura .6, quartz .3, amethyst .1), drawn by `KGEODE.draw` with its `update` on the
  page's tick. Core adoption: `core/terrain/39-core-cavern.js`, `39f-core-geode.js`, `host/39g-core-geode-draw.js`.

## 3. The flora

| Species | Ref | Where | What it is |
|---|---|---|---|
| **Red guyed stalk** (*Redostalcos*) | 01 | the rille floors under the springs (station 2), irrigated; wild along the north wall's streams (station 5) | tall thin stems held against the wind by guy-roots, red cup-crowns; the Talovolci farm them for red fibre. On 5.1 only the springs and the north wall make the ground wet enough |
| **Lava pioneers** | | the barest old flows on steps 1-2, the fronts' benches | crusts, cushions and glass-loving lichens in the cracks; the Godthrone's orange endolith band (its section 5) in the glass. On 5.1 the head is 15 °C warmer than the old plan's and the flows are old, so the cushions are fuller and the crusts greener: a cold steppe's pioneers on weathered rock, not an arctic desert's on fresh glass |

Read in place:

- **The Godthrone's crusts and endoliths** on the shield above the head and the north arm's ET.
- **The Hearths' life** at the head only (section 7): `biomes/hearths` by its plan.
- **The sedesert's hot-steppe shrubs** on steps 3-4 (BSk at +15 to +22 °C), and its salt-tolerant ones round the playa's edge.
- **The southern highlands' spiral species** on the north wall (Cfa/Csa, ~1,000 mm): its forest, with the mirror-handed tree at
  the shighlands' rate; sparser along its streams onto step 3.
- **Moss on the old cones in black sand** (`refs/08`): on step 2's floor, where the cold desert is (BWk, 78-110 mm), as bright
  moss skins on the north faces only.
- **The cave fungi** at the tubes' mouths (`BIO.fung`; `kits/crops`' dark-grown crops where the Talovolci tend them, section 5).

## 4. Landforms (`core/terrain`)

- **Flow fronts and the trap stair** (`KRELIEF.scarp` with benches, along lobate polylines from the baked flows' edges;
  `KSTACKS` mesa tiers with `columns`; the walls' beds from the bake: owed item 1): each step ends in a stair of flow-front
  benches, 20-80 m each, ~700 m in all; **frozen lava falls** where a flow poured over a lip, old and weathered.
- **The ponded floors** (`KLAVA.bake`, 40 m cells, eruptions from the vent and from breakouts along the tube): smooth dark plains
  of overlapping lobes, each cell carrying the eruption that froze on top (the flow-age field the flora reads: older lobes more
  soil, more crust), crossed by **tumuli and pressure ridges** (owed item 3).
- **The rilles** (the `rille` kind over `tube_god_07`: owed item 2): 1-2 km wide at the kit's scale, the model's 140-230 m deep,
  colonnaded walls with an overhanging fan (`refs/02`), talus, springs at the palagonite partings (`refs/03`).
- **Pit chains, skylights and the tube's mouths** (the same kind; `KCAVERN` `tube`): where the roof still stands, beyond the
  rille's end and between its collapsed stretches; at station 2 one skylight and its mouth walked into the tube as far as the
  gathered caves go (section 5), then dark.
- **Hornitos** (`KSTACKS` `chimney`, form `pipe`): rootless spatter chimneys over the tube where it ran full, a few metres high,
  weathered and crusted.
- **Kipukas** (`KSTACKS` mesa/butte, older ground): islands of older flow the newer ones went round, with older soil and flora,
  the Talovolci's village sites.
- **Black sand** (`KGROUND` `ground.sand.black`; dunes from the field): on step 2's cold-desert floor, with old moss-skinned cones
  standing out of it (`refs/08`, Mælifell).
- **The salt playa** (`40-core-basin`; `KGROUND` `ground.salt` over `ground.playa.red` tinted pale): step 4's terminal pan, its
  polygon-cracked crust, salt-rimmed shoreline steps of its wetter past on the slopes round it, sheet water after a storm (the
  mirror switch); small kit-scale ponds behind lobes on steps 1-2 (below the model's 2 km cell).
- **The vent pit** (station 3): a pit crater 300-350 m deep, its walls stacked `tibasalt`, red oxidised scoria on the upper
  wall, a spring-fed moss lawn and stream on the floor (`refs/04`), the two tube mouths; the older crater beside it with its lake
  and the Talovolci's walled fields (`refs/06`, Corvo) at the kit's scale.
- **Relict laterite breakaways** (station 4): red hardpan cliffs 10-30 m high over pale gullied slopes, mesas of laterite cap,
  the playa below.
- **The north wall** (station 5): the valley's side as a stack of flows under forest, red soil, living laterite in its cliffs,
  the springs at its partings, and **falls through the flows** (`refs/09`, Háifoss): Guli Blaca and the streams under Rrivar
  Cistal's head falling off the wall's benches in the wet season, threads in the dry. Elsewhere the fronts carry **dry falls**,
  polished lips over plunge-pool hollows that run only in a storm.

The fields and seeds are deterministic from the terrain (`KRAND` by cell), as every kit's.

## 5. The people's side

*Proposed* wording throughout; the substance is the owner's (2026-11-03).

- **The Talovolci** (`LORE.md` §6.21): their villages stand on the kipukas and at the rilles' heads; their fields are on the
  rille floors under the springs, where the red stalk grows, and on the north wall's red soil; the fronts are **the god's
  stair**, *Godostera*, climbed in procession from the low end to the vent pit, **on the surface**, step by step (a
  *Spirladunon* could climb one front); the vent pit, *Viropitos*, and its warm spring are a sacred place, a *nemetos*, and the
  hearth trees round it are *Harđotreoi*.
- **The tubes** (the owner, 2026-11-03): **lava tubes**, natural or Ancient-era. **The Talovolci use them for transit between
  the steps**: `tube_god_07` runs down the valley from the pit under the flows, so where its roof stands it passes under the
  fronts, and a walk down the tube from one skylight to the next is the sheltered, level-graded way from one step to the one
  below, out of the winter wind on step 1 and the sun on steps 3-4. The fronts' stairs are the procession's way and the open way;
  the tubes are the everyday way, with loads. Along them they **gather in the caves near the mouths**: cave fungi and the
  dark-grown crops they tend there, bat and bird guano for the fields, the tubes' mineral crusts (gypsum, the iron and sulphur
  salts on the walls), ice kept in the cold caves of step 1 into summer, water from the drips. **They do not go deep into the
  mountain**: not up the cross-conduit into the Godthrone, not on toward Pluton. The kit draws the valley's tube runs between
  skylights, the mouths and the gathered caves, publishes them as sites and routes, and stops at the pit.
- **The deep tube** (lore, *proposed* for `LORE.md` §6.21 and the Godthrone's lines): "Far back in the Godstep tubes a way runs
  on under the Godthrone into its network of tubes, and at last to Pluton; the Talovolci walk the tubes from step to step, but
  know the deep way is there and do not take it."
  Who made or used the deep way (the record's "ancients") is left to the lore.
- **The Empire of Iziz's road**, if it crossed, crossed the steps, not the rilles. Its names for the valley's wadis are the
  model's (section 1, Water).
- The kit publishes the sites (villages, fields, gathering caves, the procession's path, the pit's *nemetos*) as plain data; the
  buildings, and **Daridel's old site**, are the settlement plan's.

### 5a. The Talovolci's words (coined 2026-11-03, *proposed*)

Coined by the tongue's rules (`lore/tongues-of-krator.html`, the Talovolci tab), as the Cliff Lungs plan coined its words
(`biomes/clifflung/PLAN.md` section 10): English roots run through the Gaulish changes (nouns take *-os* one, *-oi* many, *-a* for
some; *f* > *v*; *w* > *u*; the old *gh* > *x*; *th* > *đ*, the tau gallicum; *sh*, *j*, *ch* > *s*, *g*, *c*; the article
dropped), compounded the Gaulish way (the first word's *-os* cut to *-o-*; *ver-* over, great; *-dunon* a fort; *-magos* a field),
with the model's own words and prefixes (`tools/scale-model/smodel/river_names.py`: *Uxo-* upper, *Ande-* lower, *Marios*
great, *Touto-* north, *Dubnos* the deep chasm, *Viros* fire, *Nemetos* the sacred grove, *Magos* the plain). The model's map
names in the valley are Izani and stay so; these are what the Talovolci say. Working names in the kit's tables stay English.

| Talovolci | Gloss | How it is built |
|---|---|---|
| **Godostepos** | Godstep valley: "the god's step" | English *god* > *godos* + *step* > *stepos*, the first word cut to *godo-* |
| **stepos** (pl. *stepoi*) | a step of the valley: a ponded floor | English *step* with *-os* |
| **Godostera** | the god's stair: the four steps and their fronts together, the way of the procession | *godo-* + *stair* > *stera* (with *-a*, as *uatera*, water, and the Cliff Lungs' *ladra*) |
| **Virstostepos** | step 1, the head step (the first step the god took, at the pit) | *first* > *virstos* (*f* > *v*) + *stepos* |
| **Secondostepos** | step 2, the black-sand step | *second* > *secondos* + *stepos* |
| **Đirdostepos** | step 3 | *third* > *đirdos* (*th* > *đ*) + *stepos* |
| **Vourđostepos** | step 4, the low end over the salt | *fourth* > *vourđos* (*f* > *v*, *th* > *đ*) + *stepos*. The steps are counted from the pit down, as the god walked; the procession climbs them in reverse |
| **lipos** (pl. *lipoi*) | a front: a step's lip and its stair of benches | English *lip* with *-os*; *Virstolipos*, the first front |
| **Viropitos** | the vent pit: the fire-pit | the model's *Viros* (fire) + *pit* > *pitos* |
| **Harđotreos** (pl. *Harđotreoi*) | a hearth tree | *hearth* > *harđos* (*th* > *đ*) + *tree* > *treos*: "hearth-tree"; the Hearths' plan's "stair's hearth" is *Godosteroharđos* in full, said *Harđos* at the pit |
| **Dedoharđoi** | the rings of dead stalks round the hearth trees: where the heat was | *dead* > *dedos* + *harđoi*: "dead hearths" |
| **tubos** (pl. *tuboi*) | a lava tube | English *tube* with *-os* |
| **Tubodubnos** | the rille: the fallen tube's canyon | *tubo-* + the model's *Dubnos* (the deep chasm): "tube-chasm" |
| **cavos** (pl. *cavoi*) | a cave, the gathered caves at a tube's mouth | English *cave* with *-os* |
| **mouđos** (pl. *mouđoi*) | a tube's mouth or skylight | the Cliff Lungs' word (*mouth*: *th* > *đ*), used the same way; *Tubomouđos*, a tube-mouth |
| **Tuboroda** | the tube road: the walk down the tube from step to step | *tubo-* + *road* > *roda* (with *-a*, as *stera*) |
| **Andetubos** | the deep tube, the far way under the Godthrone to Pluton | the model's *Ande-* (lower) + *tubos*: "the lower tube", the one not taken |
| **Saltomagos** | the salt playa on step 4 | *salt* > *saltos* + the model's *-magos* (a plain, a field): "salt-plain" |
| **Toutouallos** | the north wall | the model's *Touto-* (north) + *wall* > *uallos* (*w* > *u*): "north-wall" |
| **vallos** (pl. *valloi*) | a fall of water: the north wall's falls | English *fall* > *vallos* (*f* > *v*); one letter from *uallos*, a wall, and the Talovolci make the pun |
| **Redostalcos** (pl. *Redostalcoi*) | the red guyed stalk | *red* > *redos* + *stalk* > *stalcos* (*k* written *c*) |
| **nemetos** | a sacred place: the vent pit's spring and lawn | the model's own word, as the Cliff Lungs use it |

## 6. Hazards (`core/hazard`)

The old head was arctic; now the valley runs from a cold winter at the top to a hot summer at the bottom:

- **Step 1**: winter nights to -15 °C, snow lying (cold month -6); spring meltwater flash floods down Guli Grin and Guli
  Cistal off the Godthrone.
- **The head**: the vent's heat and gas over its hot ground (`KTHERM`), the warm spring (by the Hearths' and geyser kit's
  ramps), thin ground at the pit's edge.
- **The tubes and pits**: thin roofs, skylights' edges, falls into pits, the dark past the gathered caves.
- **Steps 3-4**: heat (warm month +35 °C, highs to 44), the playa's flash floods and thin crust over mud after a storm, salt dust.
- **The north wall**: wet-season spates in the falls' gullies, slick laterite.

## 7. Stations

Each station's numbers are 5.1's at its site.

1. **The stair** (`dist/godstep.html`; front 1 at ~5.1 px 906,1115: the lip at ~3,150 m over step 2's floor at ~2,450 m;
   1.09-1.18 atm; 94-157 mm; Dsb/BSk; +9 to +12 °C (22-25/-4 to -1), night low -11 to -15). The camera stands on the head
   step's lip: the trap stair falling away in benches with colonnade tiers and an old frozen lava fall, step 2's dark floor 700 m
   below with black sand dunes and moss-skinned cones on it, a small playa behind a lobe on the step above, tumuli on the plain,
   the Godthrone's mass to the south-west and the north arm to the north, the procession's cairned path down the benches. Set in
   late winter: snow on the upper benches, none below. *Changed*: Daridel's old site, ~60 km off on the plain behind, is no
   longer in this station (the settlement plan's).
2. **The rille** (`--station rille`; along `tube_god_07` ~20-30 km below the vent, ~5.1 px 902,1140: the plain at
   3,000-3,050 m, the rille floor at ~2,850-2,930 m; 1.10 atm; 110-125 mm; Dsc/Dfc; +9 °C (22/-4), night low -15). A
   colonnaded rille wall with its overhanging fan of columns, a spring at a palagonite parting feeding a stream and the
   Talovolci's red stalk fields on the floor, a pit chain and hornitos on the plain above where the tube is still roofed, and one
   skylight walked down into the tube (48 m wide, 28 m high: `KCAVERN`) through the **gathered caves**: fungus beds, guano scraped
   from the ledges, gypsum crusts cut back, an ice cave kept from the winter, baskets and a ladder; then the tube going on
   downhill, a worn path and cairned turnings marking the Talovolci's way to the next skylight and, under front 1, to step 2
   (section 5). *Changed*: the route is the model's tube; the floor is wet only below the springs; the station stands on step 1,
   where the rille is on the model (the owner, 2026-11-03).
3. **The head: the stair's hearth** (`--station hearths`, `dist/godstep-hearths.html`; vent 77, px 892.8,1145.2: the pit floor
   at 2,700 m, 1.14 atm, 110 mm, Dsc, +12 °C (25/-1), night low -12). **One station, not two**: the old plan's optional `-vent`
   page and the Hearths' fifth station are this page. Godstep owns the ground and the page (the pit crater, its scoria wall,
   the two tube mouths, the warm spring and moss lawn, the older crater with its lake and walled fields, the procession's way
   down into the pit, the Godthrone above); the hearth life is `biomes/hearths` read in place, as its plan says (its sections 5,
   11 and 13: `HEARTH` data fragments, `KTHERM` from the vent record, the geyser kit's `puna` recipe for the field, the `breath`
   fold on `HEARTH.work`, the station's `99-host-take.js` and `station.json` in `biomes/godstep/stations/hearths/`). One disc of
   broad-fanned hearth trees round the spring; set on a winter night, the one season the engine earns, with a noon preset of the
   field shut and silver. The cross-conduit's mouth is drawn to its first bend: the deep way is not this kit's. *Changed*: the
   old head was a cinder cone at 4,973 m in arctic desert; on 5.1 it is a sheltered pit 300 m below a cold steppe, the warmest
   ground on step 1, and no longer erupting.
4. **The redlands** (`--station redlands`; step 4's floor at ~5.1 px 975,1085: ~880-1,030 m, 1.41-1.43 atm, 188-267 mm, BSk,
   +22 to +23 °C (35-36/+9-10), night low 0, summer highs to 44). Relict laterite breakaways over pale gullied slopes, and below
   them **the salt playa**: a white pan with its cracked crust and old shorelines, sheet water after a storm (the mirror switch),
   front 3's black stair standing 700 m above to the west, the sedesert's shrubs, heat shimmer and salt dust. *Changed*: the old
   redlands was Cfa (1,160 mm), the forest closing in toward the hyperjungle; on 5.1 the low end is a hot closed basin, so the
   laterite is old and the forest has moved to the north wall (station 5).
5. **The north wall** (`--station wall`; Rrivar Cistal's head at ~5.1 px 939,1069: 2,268 m, 1.21 atm, 957 mm, Csa, +12 °C
   (23/+1); Cfa, ~990 mm, at px 930,1070). The valley's one wet side (the owner, 2026-11-03: "the wet place, with the forest,
   the falls and the red soil"): forest of the southern highlands' spiral species on red soil, living laterite in the cliffs,
   the springs of Rrivar Cistal at the flows' partings, Guli Blaca's falls dropping off the wall's benches through banded flows
   (`refs/09`), wild red stalk along the streams and Talovolci terraces on the red soil, the steps' dry country below to the
   south and the stair beyond. Set in the wet season, with a dry-season preset of threads on the falls.

## 8. Textures

Everything this plan needs is in the library: `ground.lava.aa`, `ground.lava.crust`, `ground.sand.black`, `ground.scoria`
(tinted red for the pit), `ground.cinder`, `ground.playa.red` (tinted pale), `ground.salt`, `ground.pavement.desert`,
`ground.moss*`, `rock.basalt.titanium`, `rock.basalt.*`, `rock.columnar`, **`rock.palagonite`**, **`rock.laterite`**,
**`card.guyedstalk`** (the last three delivered since the old plan; `core/materials/PROMPTS-NEEDED.md` section 23's list is met).
`ground.redsoil` for the north wall. The head reads `biomes/hearths`' own sets from its pack. The old flows' weathered skin is
`ground.lava.crust` and `rock.basalt.oxidised`, judged in the demo kit before wiring. Nothing owed; a gap found in D1 goes in
`PROMPTS-NEEDED.md` with its prompt.

## 9. Verify (what `verify.py --assert` and the probe check)

- Every station's ground at its site within 50 m of 5.1's height (the steps' floors, the pit's floor at 2,700 m).
- The fronts' benches step down monotonically along the axis; no flow-front bench overhangs the next; the walls' beds match the
  bake's flows (owed item 1).
- The rille follows `tube_god_07`'s path within its width; every pit and skylight stands over the tube; the walked tube section
  agrees with the `KCAVERN` records; the published tube route's skylights match the pits on the plain.
- Flora: nothing on bare flow but pioneers; no stalk outside a spring's wet field (`WATER.fieldAt`); no tree on a front's face
  (the no-trees-on-cliffs rule, by slope and rock); nothing but salt crust and its edge plants on the playa.
- `BIO.envCheck` over the probe's points; the mirror switch off at load (tri counts unchanged); `KTHERM`'s snow mask at the head.
- Under 5 M triangles and 60 draws a view on the integrated GPU, measured as the Godthrone's `PERF.md` measures.

## 10. Order of work

- **D0.** Settled (2026-11-03). The model notes go to Gemini whenever the model is next touched; none blocks the kit.
- **C.** The three owed core items (section "Core adoption"), in core, node-tested, before D2.
- **D1.** The kit on the biome core: fields (step, flow age from `KLAVA.bake`, rille, kipuka, sand, wet, salt), zones, station
  1's ground and stair.
- **D2.** The landforms: fronts (`KRELIEF.scarp`, beds from the bake), tumuli, rilles and tube (`rille`, `KCAVERN`), pits,
  hornitos, colonnades (`tibasalt-ponded`), the salt playa, dunes.
- **D3.** The flora; the sedesert's, the southern highlands' and the Godthrone's species read in place.
- **D4.** Stations 2, 4 and 5; then 3 with the Hearths (after `biomes/hearths`' data fragments exist).
- **D5.** `verify.py --assert`, `PORT.md`, the index tools, `tools/check_core_use.py`, the gallery; the little demo's re-cut.

## 11. Still open

- **The Talovolci words** (section 5a) and the lore sentences (section 5) are *proposed*: the owner's yes before they go into
  `LORE.md` and the tongue sheet.
- Whether the Hearths' plan should name its Godstep station's trees by section 5a's *Harđotreoi* (the Hearths' plan asks for the
  Talovolci's word: this is the offer).

## Station 1, as built (2026-11-09)

`python3 build.py` -> `dist/godstep.html`; station 1 is `src/` itself (`src/station.json`), started from `biomes/godthrone`'s host
(`NOTES.md`). What it draws, on the page's frame at 5.1 px 903,1116 (DOWN the valley's ENE axis):

- **The trap stair** on core's `KRELIEF.stair`: the head step's floor at ~3,140 m and step 2's at ~2,425 m (each within 35 m of the
  model's flat floors on the same axis, checked), one lobate front ~3 km in run falling ~720 m in ~18 benches, each flow a steep
  colonnade riser over its bench (`riser` .1), the old frozen lava falls (`tongues`) where flows poured over the lip. The floors tilt
  1.8 m/km downstream; the rock is the stair's own flows (one `KSTRATA` formation a flow, `src/35g-godstep-strata.js`: tibasalt-ponded
  with its bead partings already palagonite) dipping with them.
- **The plains' flows** baked at build time (`KLAVA.bakeLayers`, `src/bake-flows.js` -> `src/flows.json`): two lobes on the head step,
  two breakouts on step 2's floor; **~1,100 tumuli and pressure ridges** on them (`KRELIEF.tumuli`, filed in `KSPACE`).
- **Step 2's floor**: black sand in transverse dunes across the down-valley wind, three old scoria cones with moss skins on their
  north faces (refs/08).
- **A playa behind a lobe** on the head step, its meltwater pond iced (`WATER.still`).
- **The procession's way** (*Godostera*), cairned every ~110 m down the nearest frozen fall.
- **The lava pioneers** (section 3: cushions and crusts on `BIO.fung`), the talus under every riser with whole fallen columns, the
  plains' stones; late winter's snow on the upper benches and the head step's hollows, none below ~2,850 m.
- **The far country** from the model (`src/region.json`), the Godthrone's mass to the south-west.

Checks (`verify.py --assert`, section 9): the floors against 5.1, the stair stepping down monotonically, the front's rock (ponded
flows, palagonite partings, no fresh bead), the pioneers off the faces, the sand and the pan and the moss on the cones, snow above
and none below, the air on the lip (1.08 atm), `BIO.envCheck`, the tumuli, the items resting on the ground, each with a broken input
that must fail. Not yet: the GPU's measures, `--all-views`, and the adoption items `KNOWN_ISSUES.md` lists.

## Stations 2-5: how they are made (2026-11-10)

Each is `stations/<name>/` over `src/` (`build.py --station <name>`): its `station.json` ("out", "region" from
`biomes/godthrone/tools/region.py <name> <px> <py> --kit biomes/godstep`, "tex" (its families only), "reads" (the core pieces and the
neighbours' fragments it takes by path), "packs" (a neighbour's pack narrowed to the families it needs), "water"), its own `44a` (STN), `45b`
(the ground model), `98-host-<name>.js` (records, views, checks with their negatives) and what else it needs; src's `98-host-stair.js` is
dropped for every station. The shared hooks (`src/`): `STN.kground` (at most three layers with a map: **every ground at 15 texture units or
fewer**; station 1 dropped its lichen-crust layer to get there), `STN.pack`, `STN.fields`, `STN.env`, `STN.exportBox`, `STN.budget`,
`MODEL.coreFields`, `GROUND_HOLE` (a KCAVERN well's hole in the ground), `GSTEP.PASSES` and `GSTEP.stalks` (the red guyed stalk, `src/51`).
Every station takes core/rand, core/tags, core/mask (its site polygons as a KMASK raster, read through `KMASK.distance`), KSHADOW off at
load, `KGROUND` relief and core/water.

## Station 2, as built (2026-11-10)

`python3 build.py --station rille` -> `dist/godstep-rille.html`, on the frame at 5.1 px 902,1140, the tube's line laid on `tube_god_07`'s
mapped path (893,1145 -> 910,1134), DOWN its ENE bearing.
- **The rille** on core's `KRELIEF.rille`: ~1 km rim to rim, ~118 m deep in the head step's plain at ~2,990 m (5.1's own relief), its floor
  2,871-2,877 m; its walls the ponded flows' colonnades stepping back at each flow's top (one `godstep-ponded` stack, its tops the rille's
  `tops`) over a broad apron of fallen columns, a rounded head wall where the roof still stands.
- **A spring** at a palagonite parting in the north-west wall, its stream (`WATER.flow`) down the talus and the floor, sinking into the head
  wall's talus; the Talovolci's red stalk fields either side of it (polygons on core/mask), the stalks only where the stream's own wet field
  (`WATER.fields`) reaches.
- **Past the head wall** `tube_god_07` roofed under the plain (`KRELIEF.tube`: its crown 55 m down), a chain of pits and skylights, one
  fresh collapse (`KRELIEF.tubeRille`), hornitos over it (`KSTACKS` chimneys, form pipe).
- **One skylight walked down** into the tube (`KCAVERN`: the 48 x 28 m bore, the shaft, a breakdown ramp and a ladder), the gathered caves
  off it (fungus beds, the ice cave, guano ledges, gypsum crusts, baskets, lamps), cairned turnings down the tube road (Tuboroda). Early
  summer. The ground's layers: the fields' tilled soil, moss, lichen crust (15 units).

## Station 3, as built (2026-11-10)

`python3 build.py --station hearths` -> `dist/godstep-hearths.html`, on the frame at vent 77 (5.1 px 892.8,1145.2), DOWN the valley's axis.
One station, not two: the Hearths' fifth station is this page (`biomes/hearths/PLAN.md` section 11, item 5).
- **The pit** (Viropitos): `KRELIEF.scarp` along a closed lobate ring, a ~130 m wall of stacked thin flows in benches with buttresses and
  ravines over its talus apron, red oxidised scoria on the upper wall (`35h`: `godstep-scoria`), the dish rising to the plain at
  3,000-3,050 m and 5.1's own relief past the map (the Godthrone to the S and SW).
- **The heat**: `KTHERM` (core/terrain 47), one point vent on the floor over the winter soil, the warm spring beside it; one disc of hearth
  trees (Harđotreoi) round it from `HEARTH.layout` (`biomes/hearths` read in place), the ember mat, coal moss, stokers and the rings of dead
  stalks; the fans' breath mode driven by `HEARTH.work` (open flat at night, folded silver by day), the fumaroles' steam
  (`ATMOS.smokeGroups`); the snow kept off ground over 0 C by KTHERM's snow mask, through the paint (snow cover's own unit would pass 15).
- **The spring's stream** (the nemetos's lawn of moss on its banks) across the floor ENE into `tube_god_07`'s mouth; **the two tube mouths**
  in the wall's foot, `tube_god_07` leaving ENE and the West Godstep Rim Cross-Conduit coming in from the SW, each a `KCAVERN` tube to its
  first bend, opening into the air at a cut where its roof fell.
- **The older crater** on the plain to the NE (`KRELIEF.volcano`'s crater), its lake and the Talovolci's walled fields (polygons on core/mask,
  their dry-stone walls items); **the procession's way** over the lip and down a ravine's fan to the spring. A winter night first; a noon
  view with the field shut and silver. The ground's layers: snow, scoria, the moss lawn (15 units).

## Station 4, as built (2026-11-10)

`python3 build.py --station redlands` -> `dist/godstep-redlands.html`, on the frame at 5.1 px 975,1085 (the model's 900 m; DOWN the ENE axis).
- **The floor** is the model's own, a plane falling ~2 m/km east and ~8 m/km south, within 2 m of 5.1.
- **Front 3** on core's `KRELIEF.stair` at the kit's scale (as station 1 compresses front 1): step 3's plain at ~1,613 m falling 713 m in 20
  benches of ponded flows to the floor, its old frozen falls; past the map that plain runs on west until 5.1's own country stands higher.
- **The relict laterite breakaways** (`KRELIEF.scarp`): a ~22 m hardpan cliff over pale gullied kaolin, three mesas of the same cap cut off
  on the slopes (`KSTACKS`); the rock the laterite profile (`godstep-hardpan` over `godstep-kaolin`, `35r`) dipping with the floor, the
  stair's own flows taking over west of its toe (KSTRATA's lateral stack).
- **The salt playa** (Saltomagos): a polygon on core/mask, dead flat with a polygon-cracked crust (KGROUND's `polygon` kind), its old
  lake's strandlines on the slopes round it (`KBASIN`); a storm's sheet water in its lowest part (`WATER.still`), its reflections the mirror
  switch's, off at load.
- **The sedesert's shrubs** read in place on the steppe, salt-tolerant ones (saltbush, grass) in a ring round the pan and none on it; the kit's
  pioneers and stones on the stair's basalt. A hot steppe's haze and pale dust. The ground's layers: salt, desert pavement, the pale playa
  silt (15 units).

## Station 5, as built (2026-11-10)

`python3 build.py --station wall` -> `dist/godstep-wall.html`, on the frame at 5.1 px 939,1069 (Rrivar Cistal's head); DOWN faces the
valley (SSE), ALONG the wall's strike (ENE).
- **The wall**: a stair of ponded flows on core's `KRELIEF.stair` (chosen over `scarp`: its benches are the flows' own tops, which the
  strata and the springs read), the plateau at ~2,402 m falling ~235 m in 9-11 benches to the foot at ~2,170 m, each riser a colonnade; the
  model's 22 km ramp compressed into the stair, each floor checked against the model's own floors up and down the axis (within 10 m).
- **The rock**: `godstep-wall` (`35w`), tibasalt-ponded with its palagonite partings and the living laterite laid between the flows.
- **The water**: the springs of Rrivar Cistal's head at a palagonite parting near 2,268 m and a higher thread; Guli Blaca off the plateau,
  falling off bench after bench (refs/09); each a `WATER.flow` on a carved bed, its 21 falls (14-33 m) `WATER.fallsOf`'s slope breaks.
- **The forest**: the southern highlands' spiral species read in place (`biomes/shighlands`, by `BIO.kin`), the mirror-handed tree at the
  kit's rate, on living red soil, no tree on a face; wild red stalk along the water; the Talovolci's terraces (core/mask) at the foot with
  their dry-stone walls and stalk rows; the cairned way up beside the falls. The wet season, its fog. The ground's layers: red soil, the
  forest's litter, grass (15 units).

## Fauna (proposed 2026-11-11, awaiting the owner)

Drawn by `kits/fauna` and tagged by biome (`biomes/README.md`, "A fauna kit"); placed by `FAUNALANDS` (`kits/fauna/fauna-lands.js`).
The brief (`kits/fauna/BIOME-FAUNA-PLAN.md`): two grazers, a predator, a flyer and a water creature, with **at least one animal
found nowhere else**. **New** = to be built in the kit; *shared* = an existing key that also gets this biome's tag, because its
range plausibly runs across the border. Nothing here is built.

| Role | Animal | Status | Where | Why it is here |
|---|---|---|---|---|
| water | **playa shrimp** | **new, unique** | the salt playa on step 4, in the days of sheet water after a storm | a tadpole shrimp (*Triops*), forearm-long in the dense, warm air at the low end. Its eggs lie dormant in the salt for years; a storm fills the pan and within a day the sheet water is thick with them, then they are gone. The valley's only open water belongs to them. Drawn as a short-lived swarm on a storm flag (`core/atmos` weather) |
| grazer | *argali*, *chamois* | shared (shighlands) | the north wall and the north arm (Cfa/Csa, the wet country) | the north wall's forest is the southern highlands' |
| grazer | *desert-oryx*, *salt-beetle* | shared (sedesert) | steps 3-4 and the playa's edge (BSk, +15 to +22 °C) | steps 3-4 already read the sedesert's hot-steppe shrubs |
| predator | *mountain-lion* | shared (shighlands) | the north wall and the fronts | |
| predator | *coyote* | shared (sedesert) | steps 2-4 | |
| flyer | *mountain-condor* | shared (shighlands) | over the fronts' updrafts | |
| flyer | *giant-bat* | shared (hyperjungle; drawn wild) | the tube mouths | section 5's guano: the colonies roost just inside the mouths where the Talovolci harvest |
| head (the Hearths) | fin-mouse, fin-owl, hearth-stalker; *cinder-crawler*, *cavern-leaper* | the Hearths' plan (the first three not built yet) | the vent pit and the tube mouths at step 1 | `biomes/hearths/PLAN.md`; read in place, not this kit's |
| domestic | *goat*, *sheep* | shared | the Talovolci's rille farms | |
