# Dilihan: the plan (draft 2026-10-18; Scale Model 5.1 site blueprint 2026-11-19)

Dilihan is the premier settlement of the Cut, the Izani veterans' colony that stayed loyal and became a state of its
own by distance. Its lore is `LORE.md` §6.2 (the Dilihan entry under "Settlements"), with the Cut's geography there,
Jimjam's side in §6.14, the Screamers' sack of Port Visas in §6.7 and the Hykkousoi road in §6.16. Its provincial
census and economy are surveyed in `core/simulation/PROPOSAL-IZIZ-EXCLAVES.md` (`D1`–`D4`) and locked into the theatre
table in `core/region/RING-SEA-SCOPE.md` (`Dilihan Province`, `32,000` total). It is the third vassal-city page after
Pylon and Talia and is written on their contract (`settlements/iziz/VASSAL-KITS.md`), with one difference: its own
style is not a new kit but the **Jimjam kit** already built (`settlements/jimjam`), standing as the old quarter inside
Vernacular districts.

Owner's brief (2026-10-18, **settled**): premiere settlement of the Cut; during the waxing years of the empire the Cut
was one of the regions settled by Izani ex-legionnaires; a core of Jimjam-style buildings (the old quarter) is
surrounded by districts in the Iziz Vernacular style taking up four times the area; a governor's palace similar to
Pylon's and Talia's but with Jimjamite flourish; the region was loyalist, but its remoteness has made it a de facto
independent state; Iziz maintains extensive diplomatic contact, increasing lately as relations with the Hykkousoi have
improved, allowing the Izani to cross their territory.

The owner, 2026-10-26 (`LORE.md` §6.2, **settled**): the independence has a date. Dilihan's lifeline to Iziz was
**Port Visas**, on the coast, until a Screamer raid all but destroyed it about 120 years ago; since then the colony has
governed itself, until the Hykkousoi reconciliation reopened the sea road. Dilihan is no longer the Empire's only
veterans' enclave: **Shell Province**, west of the Beast Riders, is held far more tightly through Port Goto; **Nusidi**
was ruined in the civil war.

Scale Model 5.1 upgrade (2026-11-19): the 2026-10-18 draft was written against Scale Model 4.21 (`1549 × 1393`, Dilihan
at `px 472, 333`). On Scale Model 5.1 (`1821 × 1723` at `2.0 km/px`), the NW expansion shifted every legacy coordinate
by `(+272, +330)` px, placing Dilihan (`solqo7hz7s`) at **`px 744, 663`**. Every settled 2026-10-18 and 2026-10-26
decision is preserved unchanged below; the ground, spherical Cut geometry, hydrology, climate, geology, crop basket,
hinterland hamlets and solstice arch parameters are surveyed directly off 5.1's `h.png`, `rivers.json`, `basins.json`,
`geology.json` and `net51.json`.

---

## 0. What the build is & Core adoption

| | |
|---|---|
| Folder | `settlements/dilihan/` (`src/`, `targets/`, `build.py`, `verify.py`, `materials.json`, `site/`, `palace/`) |
| Pages | `dist/dilihan.html` (the city on Scale Model 5.1 ground), `dist/dilihan-site.html` (the site editor, Voth's read in place) |
| Map pin (5.1) | **`px 744, 663`** (`solqo7hz7s`, type `city`; 4.21 legacy `px 472, 333` + `272, 330`), southern bench of `"the cut"` (`rmuqljqcvdimg`) |
| Population | **`16,000`** metropolitan seat (`12,000` inside the walled *colonia* + Vernacular districts + lower road town, plus `~4,000–5,200` on the contiguous *hanḍu* veteran allotment grid = `16,000–17,200` `D1` total inside `Dilihan Province`'s locked `32,000`; §1.6, §6 Q3) |
| The old quarter | the **Jimjam kit** (`settlements/jimjam/src`, the `JJ.def` registry: 39 buildings, houses in three tiers, shops, inn, tavern, caravanserai, library, school, amphitheater, temple, palace, fortress, barracks, wall pieces, farms), read in place, never copied; its kit page stays as it is |
| The districts | the Iziz Vernacular and its Ancients core as the shared **IZV bundle** (`VASSAL-KITS.md` §1: the one file list Verge, Pylon and Talia call) |
| The palace | the vassal cities' programme (`VASSAL-KITS.md` §3) drawn on the shared generator (`settlements/voth/palace/blueprint.py`) as `settlements/dilihan/palace/`, built in Jimjam's materials (§2) |
| Town | `core/city` (`KCITY`) steps 0–12 on the site layer: the old quarter on the `frontage-courts` strategy inside its wall, the districts on `alleys` and main streets, as Verge's two levels are; under-construction infill lots via `kits/construction` (`KCONS`) + `KCITY.constructMesh` |
| Biome | `biomes/cut` (`CUT`, built 2026-10-30 on the owner's eigenweapon brief: wraps `nwlowlands` + `nhighlands` in place, adds the four warped Cut natives `hyperbamboo`, `rankgrass`, `measuremelon`, `circlelichen`, `CUT.bowl`, `rock.cut.polished` and `contact-marble`), with `biomes/nhighlands` + `biomes/nwlowlands` read directly as the fallback named in §5 Q1 |
| Hinterland | `core/hamlet` (`KHAMLET.village`, `KHAMLET.CULTURES.iziz`) for the *hanḍu* veteran allotment villages, tin/iron skarn adits and salt-pan works on the Cut floor (§1.6) |

Dilihan is a settlement and goes in the gallery when it first reaches `main` (`gallery/README.md`).

### Core adoption (`README.md`, "CORE MODULES ARE NOT OPTIONAL"; checked by `tools/check_core_use.py`)

| Module | Fragments / Path | Role in `settlements/dilihan` |
|---|---|---|
| `core/rand` | `core/rand/08-core-rand.js` (`KRAND`) | Cell-hashed deterministic PRNG (`world, cell, index, salt`) for lot culture draws, allotment trees, stone wear and citizen dress; never `Math.random` or `Math.sin` |
| `core/mask` | `core/mask/09-core-mask.js` (`KMASK.canvas`) | Zone, wall-precinct, Cut-lip, road-corridor and moisture masks without `getImageData` |
| `core/tags` | `core/tags/` (`KTAGS`) | Every placed building, wall segment, allotment farm, tree, lode prop and citizen registered before drawing (`culture: 'jimjam' \| 'iziz-vernacular'`, `district`, `trade`) |
| `core/space` | `core/space/` (`KSPACE`) | Shared spatial hash / occupancy grid across `KCITY`, `KHAMLET`, road clearings and `CUT` flora |
| `core/world` | `core/world/` (`WORLD.H`, `WORLD.Hland`, `WORLD.landHook`, `ROADS`, `KSITES`) | Scale Model 5.1 ground extracted around `(744, 663)` via `tools/scale-model/extract_region.py`, roads from `net51.json`, spherical Cut wall/bench `landHook` (§1.2), camera and ground probe |
| `core/terrain` | `core/terrain/` (`KSTRATA`, `KRELIEF`, `KCARVE`) | Sliced `contact-marble` and `megabreccia` rock faces on the eastern/western Cut walls (`rock.cut.polished`), road cuts and tunnel portals on the SE and N highways |
| `core/coast` & `core/water` | `core/coast/` (`KCOAST`), `core/water/` (`KWATER`, `farbed`) | Brine shore profiles (`evaporite` / `salt` pan margin) on the SE arm of the Cut Salt Lake `8 km` north (`-1,608 m`), plus any pass stream / cistern aqueduct channel |
| `core/atmos` | `core/atmos/sky/` (`ATMOS`) | Shared sky dome, dense-air (`1.79 atm`) horizon haze, and solstice ephemeris (`ATMOS.siteAt(472, 333)` = `-31.50° S`; see legacy pixel-frame warning in §2.2) |
| `core/city` | `core/city/` (`KCITY` steps 0–12, `54-city-host-construct.js`) | Plain-record streets, walled *colonia* `frontage-courts` blocks, `1:4` Vernacular `alleys` + main-street blocks, slope/frontage checks, delta-by-id edits (`core/edits`) |
| `kits/construction` | `kits/construction/` (`KCONS`) | Active scaffolded building plots on expansion lots in the outer Vernacular districts and reopened southern envoy quarter |
| `settlements/jimjam` | `settlements/jimjam/src/` (`JJ.def`, `JJ.place`) | Read in place (never copied) for all 39 *colonia* building types and rural *hanḍu* farmsteads/granaries/windmills |
| `kits/iziz-vernacular` | `kits/iziz-vernacular/` + `kits/ancients/` (`IZV` bundle) | Shared `VASSAL-KITS.md` §1 bundle for the `4×` Vernacular districts, guard tower/barracks and lower-town customs post |
| `kits/crops` & `kits/resources` | `kits/crops/src/`, `kits/resources/src/` (`CROPS`, `KRES`) | Deterministic local crop picks (`CROPS.at` / `CROPS.forBiome('cut')`) and resource-node adits/pans (`tin`, `iron`, `potash`, `halite`, `marble`) |
| `core/hamlet` | `core/hamlet/` (`KHAMLET`, `21-hamlet-iziz.js`) | Surrounding *hanḍu* veteran farming allotments, skarn mining camps and lake-margin salt works (`<= 500` people each) |
| `core/furnish` & `core/catalog` | `core/furnish/` (`KFURN`), `core/catalog/`, `kits/catalog/iziz` | Indexed batch (`KF.batch({indexed:true})`) furnishing for palace, civic halls and sample houses using the Iziz catalog set (§5 Q4) |
| `core/charactermodels` | `core/charactermodels/` | Izani veteran-descendant citizens, Jimjam merchants, Free Clans bronzesmiths from Ardent, and Hykkousoi envoys at the lower-town legation |
| `core/lod`, `core/host`, `core/export` | `core/lod/`, `core/host/`, `core/export/` | Range-tier LOD, inspector/polygon/hover tools, and Godot scene/record export (`[G data]`) |
| `tools/harness.py` & `tools/build_sources.py` | `tools/harness.py`, `tools/build_sources.py` | `report()` before first write in `build.py`; Chromium `smoke`, `walk`, `1:4` culture-area assert, cornice-height assert and solstice-arch eval in `verify.py` |

---

## 1. The site on Scale Model 5.1 (`px 744, 663`, `solqo7hz7s`)

### 1.1 Coordinates, polygons and 5.1 neighbour table

On Scale Model 5.1 (`tools/scale-model/model/data/60-settlements.js`), Dilihan is `{"id": "solqo7hz7s", "name": "Dilihan", "type": "city", "px": 744, "py": 663}` (shifted `(+272, +330)` px from 4.21's `472, 333`).

- **Coordinate frames (`2,000 m/px`):**
  - *Site-local world frame* (origin at `px 744, 663`, `+x` east, `+z` south): **`(0, 0) m`**.
  - *Cut-bowl frame* (`biomes/cut/src/41-cut-field.js` centre shifted to 5.1 `px 732, 632`): **`x = +24,000 m`, `z = +62,000 m`** (`r = 66.48 km` from the bowl's geometric centre, bearing **`158.84°` SSE**, `1.52 km` inside `CUT.lipR(158.84°) = 68.00 km`).
  - *Planetary 5.1 centre frame* (origin `910.5, 861.5`): **`x = -333,000 m`, `z = -397,000 m`**, planetary latitude **`-31.50° S`**.
- **Containing 5.1 polygons (`60-regions.js`):**
  - Biome **`"the cut"`** (`rmuqljqcvdimg`): bbox `px 697..772 × 588..671` (`150 × 166 km`), centroid `(732.8, 632.8)`, radius `67.5–90.1 km` (mean `80.8 km`), area **`19,052 km²`** (`15,960 km²` dry, `3,092 km²` wet). Contains `(744, 663)`.
  - Geographic **`"The Cut"`** (`rmuc9lq4xalmn`): bbox `px 699..774 × 594..670` (`150 × 152 km`), centroid `(734.6, 632.8)`, mean radius `77.7 km`, area **`18,120 km²`**. Contains `(744, 663)`. Just `20 km` south (`py >= 673`), the ground enters biome **`"k-guilin"`** (`rm8b96c87a98d`, the Hykkousoi karst towers) and geographic **`"Inner Crater"`**.
  - Political **`"Dilihan Province"`** (`rmvlqd5ix7mfn`): bbox `px 701..816 × 589..724` (`230 × 270 km`), area **`33,800 km²`** (`25,976 km²` dry, `7,824 km²` wet). Note: `10,128 km²` of its eastern tail (`px 769..816`, including ruined `Port Visas` at `800, 712`) currently overlaps `Screamer Country` (`rmuca1tm8hito`) and is queued for boundary trim in `RING-SEA-SCOPE.md` §6.2.

| Neighbour / Landmark | ID | 5.1 `(px, py)` | Straight dist | Bearing | Elev (`h.png`) | Polity / Role in Dilihan's life |
|---|---|---|---|---|---|---|
| **Cut Salt Lake (SE sump)** | `basin:33` | `(748.6, 652.5)` | `22.9 km` (`8.0 km` to shore at `744,659`) | `23.7°` NNE (`0°` N to shore) | `-1,608 m` | Endorheic brine sump below Dilihan's north slope; `D2` potash/salt pans |
| **Cut Salt Lake (main bowl)** | `basin:5` | `(728.6, 632.4)` | `68.5 km` (`27.8 km` to shore at `737,651`) | `333.3°` NNW | `-1,456 m` | Main `2,663 km²` salt lake on the Cut floor |
| **Baelu** | `sq11baelub5` | `(725, 706)` | `94.0 km` | `203.8°` SSW | `-1,096 m` | Frontier fort above the League's karst margin |
| **Limnaia** | `sti7vwepda` | `(736, 712)` | `99.3 km` | `189.3°` S | `-1,392 m` | Hykkousoi League (`Trigon`) frontier village on the south karst road |
| **Lipp** | `s8fkrfok8y` | `(691, 619)` | `137.8 km` | `309.7°` NW | `+3,565 m` | Iron Republic highland village (`Dsb`); Republican goods taxed, seized & quietly copied (`Aidol` watch at `712, 628`) |
| **Hexahedron** | `spmfhg8a3e` | `(817, 670)` | `146.7 km` | `95.5°` E | `-1,243 m` | Screamer arcology (`166 km` on 4.21; `146.7 km` on 5.1) across the eastern salt depression |
| **Port Visas** | `szn5aae96p` | `(800, 712)` | `148.8 km` (`152 km` road) | `131.2°` SE | `-1,458 m` | Dilihan's former Ring Sea lifeline, sacked by Screamers ~120 yrs ago (`~1,000` holdouts on `izani.dilihan-portvisas`) |
| **Trigon** | `smc9wif24a` | `(722, 740)` | `160.2 km` | `195.9°` SSW | `-1,264 m` | Hykkousoi League arcology on a navigable karst sound; reopened diplomatic/sea outlet |
| **Ys** | `siauw28o8v` | `(788, 741)` | `179.1 km` | `150.6°` SSE | `-1,452 m` | Hykkousoi League hegemon (`175 km` on 4.21) |
| **Tethis** | `sbrpoyrmbq` | `(733, 775)` | `225.1 km` | `185.6°` S | `-1,274 m` | Hykkousoi port down the Ring Sea sound |
| **Jimjam** | `st5e01l76v` | `(745, 546)` | **`234.0 km`** (`246 km` road) | **`0.5°` N** | `+486 m` | Mother-culture of the *colonia*'s masons (`226 km` at `474, 220` on 4.21); terminus of `izani.north.dilihan` |
| **Roketstad** | `s28hf1s9ab` | `(632, 716)` | `247.8 km` | `244.7°` WSW | `+2,980 m` | Iron Republic capital (`273 km` on 4.21) |
| **Ardent** | `sn6y4sx8tr` | `(830, 553)` | `279.3 km` | `38.0°` NE | `+2,802 m` | Free Clans highland seat; allied bronzesmiths trading bronze down the Cut |
| **Shell** | `s8kenhm9vi` | `(902, 659)` | `316.1 km` | `88.5°` E | `-1,240 m` | Sister Izani veterans' province (`Port Goto`), held tightly by sea |
| **Hook** | `sm3ft5vrof` | `(809, 923)` | `536.0 km` | `166.0°` SSE | `-1,503 m` | Iziz's northern Ring Sea port reached via Trigon/Ys since the thaw |
| **Iziz** | `sxxrgmrk8c` | `(963, 985)` | **`778.8 km`** (`1,262 km` hwy) | `145.8°` SE | `-1,428 m` | Imperial capital; confirms Dilihan's elected governor by letter (1–2 years in transit) |

### 1.2 Quantitative 5.1 `h.png` survey vs. the spherical eigenweapon Cut

**The Cut is a sphere's lower half** (settled 2026-10-18; `biomes/cut/PLAN.md` §§1–3): in the Cataclysm an Ancient
orbital eigenweapon deleted a spherical volume of rock and air where it grazed the `4–6 km` Inner Wall. Where the
sphere intersected the high E–W mountain ridge, it left towering, concave, mirror-smooth rock walls (`+4,936 m` on the
west face at `px 699, 632`, `r = 66 km`; `+6,400 m` on the NE horn at `px 764, 616`, `r = 72 km`; `+6,100 m` on the SW
wall at `px 706, 658`, `r = 72 km`). Where the pre-Cataclysm mountain flanks already dropped toward the NW lowlands
(`+500..+800 m` on the north) and the Inner Crater (`-900..-1,450 m` on the south), the sphere exited into open air
(`h_post = min(h_pre_mountain, z_sphere)`), creating the Cut's northern and southern mouths.

Inspecting 5.1's `h.png` (`911 × 862` height cells, `4.0 km/cell`) across the Cut (`px 695..785`, `py 588..680`) and
around `(744, 663)` reveals two exact facts that govern the site build:

1. **Analytical sphere vs. 5.1 `h.png` & `CUT.bowl.h`:**
   - A sphere of radius **`R_sphere = 434.9 km`** centred in orbit at `(px 732, py 632, z_center = +433.4 km)` with
     nadir `z_bot = -1,502 m` fits 5.1's `1,205` E/W wall pixels (`r <= 68 km`, bearings `50°–105°` and `245°–310°`) in
     least squares (`z_sphere(r) = z_c - sqrt(R_sphere² - r²)`: `-1,502 m` at `r = 0`, `-92 m` at `r = 35 km`,
     `+729 m` at `r = 44 km`, `+3,612 m` at `r = 66.5 km`, `+4,499 m` at `r = 72 km`; matching the west-lip fit
     `R_sphere = 339 km` at `+4,936 m` and `biomes/cut`'s canonical `R_sphere = 510 km`, `z_c = +508.5 km`).
   - During Scale Model 4.22's erosion/basin bake (`biomes/cut/PLAN.md` §3), `~500–600 m` of flat basin fill was laid
     over the floor (`r <= 44 km`, flattening `h.png` to `-1,456..-1,608 m` across `px 716..752, py 616..658`) and gully
     noise roughened the E/W walls (`RMSE = 1,008 m` against the pure sphere).
   - `biomes/cut/src/41-cut-field.js` (`CUT.bowl.h`) already models the directional lip (`CUT.lipR(158.84°) = 68.00 km`,
     `CUT.lipH(158.84°) = -890.5 m`): at Dilihan (`x = +24 km, z = +62 km`), `CUT.bowl.h` evaluates to **`-936.8 m`**,
     within **`+48.2 m`** of 5.1 `h.png`'s **`-888.6 m`**, and the eigenweapon flora-warp strength `s` at `(744, 663)` is
     **`0.0035`** (just inside the lip — normal crops and trees thrive on the bench while `circlelichen` and
     `hyperbamboo` appear downslope toward the lake).
2. **Local elevation and aspect at `(744, 663)` on 5.1 `h.png`:**
   - At **`px 744, 663`**, `h.png` is **`-888.6 m`** (dry), with local gradient `(gx = +0.0014, gy = +0.1012)` — a
     **`10.1%` (`5.8°`) slope descending DUE NORTH (`downhill = 0.8°`)** into the Cut bowl, **not** south!
   - **N–S cross-section along `px = 744` (`2 km/px`):**
     - `py = 588` (`150 km` N, north mouth): `+732 m` -> descends into the Cut bowl (`-124 m` at `py = 608`, `-1,231 m`
       at `py = 616`, `-1,456 m` main salt lake at `py = 620..640`, `-1,472 m` dry flat at `py = 644`, `-1,819 m` wet
       bed under the `-1,608 m` SE brine sump at `py = 654..659`, only **`8.0 km` north of Dilihan**).
     - `py = 660` (`6 km` N): `-1,446 m` (dry shoreline apron) -> `py = 661` (`4 km` N): `-1,283 m` -> `py = 662`
       (`2 km` N): `-1,089 m` -> **`py = 663` (Dilihan pin): `-888.6 m`** -> `py = 664` (`2 km` S): `-684 m` ->
       `py = 666` (`6 km` S): `-325 m` -> `py = 668` (`10 km` S): `-82 m` -> **`py = 670..672` (`14–18 km` S):
       `+45.9 m` / `+45.4 m` southern divide sill**!
     - South of `py = 672`, the ground finally drops down the Hykkousoi karst flank into the Inner Crater / Ring Sea:
       `-224 m` at `py = 678`, `-578 m` at `py = 690`, `-983 m` at `py = 704`, `-1,305 m` at `py = 712` (`Limnaia`
       belt), `-1,503 m` Ring Sea level at `py = 714`.
   - **E–W cross-section across `(744, 663)` (`py = 663`):**
     - West Cut wall (`px = 704`, `80 km` W): **`+5,274 m`** -> `px = 712` (`64 km` W): `+4,675 m` -> `px = 720`
       (`48 km` W): `+3,328 m` -> `px = 728` (`32 km` W): `+1,551 m` -> `px = 736` (`16 km` W): `+187 m` ->
       `px = 740` (`8 km` W): `-478 m` -> `px = 742` (`4 km` W): `-761 m` -> **`px = 744` (Dilihan): `-888.6 m`** ->
       `px = 746` (`4 km` E): `-881 m` -> `px = 750` (`12 km` E): `-773 m` -> rises over an eastern shoulder **`+154 m`
       at `px = 758` (`28 km` E)** (while `30–50 km` NE at `py = 632..648` the sliced east Cut wall towers to
       `+2,700..+4,680 m`) before plunging into the Screamer-March Salt Depression (`-1,500..-2,190 m` at `px = 772..786`).

**Ground integration (`WORLD.landHook` on `core/world`):**
So that Dilihan's settled layout works seamlessly on 5.1 ground without fighting a raw `10.1%` uniform tilt (where
`KCITY` rejects house lots above `slope > 0.12`), `settlements/dilihan/src/20-dilihan-ground.js` registers a
deterministic `WORLD.landHook(x, z, h0)` over the site extract (`30 × 30 km` around `744, 663`):
1. **Cut wall & rim polish (`r_cut < CUT.lipR(b)`):** blends steeper upper slopes (`|∇h0| > 0.22`) toward the smooth
   spherical eigenweapon surface `CUT.bowl.h(x + 24000, z + 62000)` and tags bare rock (`KSTRATA` `contact-marble` /
   `rock.cut.polished`) where the sphere sliced the wall clean.
2. **The *Ḍeḷḷu* bench & *colonia* spur (`r_site <= 2,400 m`):** shapes a projecting flat-topped bedrock spur/bench out
   of the `-888.6 m` contour (`h_colonia = -892 m` across the `500 × 500 m` walled *colonia* nose, `slope <= 0.03`, with
   a crisp `18–28 m` marble-and-granite scarp above the **`-925 m` lower-town pass road shelf**), stepping gently up to
   **`-878 m`** at the Governor's Palace join and **`-885..-845 m`** (`slope <= 0.07`) across the `1.0 km²` terraced
   Vernacular districts behind it, so the *colonia* commands both the Cut highway descending north toward Jimjam and the
   twin pass roads climbing south/southeast over the `+45 m` karst/tunnel sill toward Limnaia/Trigon and Port Visas.

### 1.3 Hydrology: 5.1's endorheic Cut Salt Lake vs. the settled pass stream

On Scale Model 5.1 (`basins.json` and `rivers.json`), the Cut is currently baked as a **closed endorheic basin**
(`spill_m = -383 m`), **not** an open south-draining valley:

- **`Cut Salt Lake` (`3,152 km²` total water surface):** two linked hypersaline sumps in `basins.json`:
  - `basin:5` at `px (728.6, 632.4)` (`68.5 km` NNW): **`2,663 km²`**, surface **`-1,456 m`**, climate `XS`, `surplus = 0`.
  - `basin:33` at `px (748.6, 652.5)` (`22.9 km` NNE, with its southern shoreline `water_comp #144` reaching **`px 744, 659` — just `8.0 km` north of Dilihan**): **`497 km²`** (`~768 km²` wet mask cells), surface **`-1,608 m`**, `spill_m = -1,456 m`, climate `XA`.
- **Named rivers in/near the Cut (`rivers.json`):**
  - **`Rrivar airon`** (`r865`, perennial river, `Q = 68.1 m³/s`, `51 km`): rises on the NE Cut wall `(752.6, 608.4, +2,531 m)` and mouths into the northern Cut floor `(730.6, 604.4, -101 m)`, `110.5 km` N of Dilihan.
  - **`Tāmarai-āṟu`** (`r038`, perennial river, `Q = 115.5 m³/s`, `73 km`): drains the outer north lip `(742.6, 588.4, +885 m)` **northward** to Jimjam's basin `(740.6, 554.3, +471 m)`.
  - **`Serin Gulusu`** (`r577`, wadi, `Q = 2.4 m³/s`, `35 km`, `74.0 km` SSW at `724.6, 694.5`) and **`Filem Gulusu`** (`r765`, wadi, `Q = 3.0 m³/s`, `12 km`, `95.3 km` SSW at `720.6, 704.5`): drain the southern karst flank south of the `+45 m` sill into the League's sound (`-1,501 m` near Limnaia/Baelu).
- **Why 5.1 does not drain south:** an E–W saddle scan (`px 720..795, py 652..740`) shows that along Dilihan's meridian
  (`px 744`) the ground rises from `-1,608 m` (`py = 659`) to **`+45.9 m` (`py = 670`)**; even farther east (`px 760..765`)
  the lowest dry divide between the Cut and the Screamer-March Salt Depression (`water_comp #160`, `4,176 km²` at
  `-1,500..-1,758 m`, `basin:74`) is `-383 m`, and the southern divide above Limnaia (`py = 706..710`) stays dry until
  `py = 712`.
- **Freshwater stream on the site page (§5 Q3 & §6 Q1):** Dilihan itself has `1,522 mm/yr` monsoon rain (`water = 255`
  in `geology.json`) and steep `+1,000..+4,600 m` West-Wall catchments immediately upslope. Until/unless the owner orders
  a Scale Model breach of the southern sill (§6 Q1), the site page carves a **local perennial spring/ravine stream**
  (Phēr's pattern, `settlements/pher/PLAN.md` §3) fed from the West-Wall contact-marble springs (`px 740, 664`), running
  beside the lower-town pass road, feeding the Jimjam marble aqueduct/cisterns and the *hanḍu* irrigation channels on the
  bench apron before dropping north toward the Cut basin.

### 1.4 Dense-air climate & `CROPS` agricultural basket

| Parameter | At `(744, 663)` (`h = -888.6 m`) | Cut Floor (`-1,456..-1,608 m`) | Cut Walls (`+500..+3,800 m`) | Cut High Rim (`+4,500..+6,400 m`) |
|---|---|---|---|---|
| **Air pressure** `1.6·exp(-h/8000)` | **`1.788 atm`** (`CROPS.ATM` `'dense'`) | **`1.919–1.956 atm`** (`'dense'`) | `1.50 -> 1.00 atm` (`'standard'`) | `0.91 -> 0.72 atm` (`'thin'` > `+5,545 m`) |
| **Köppen class** | **`Am`** (tropical monsoon) | `XS` / `XA` (hypersaline/arid pan) | `Cwa` / `Cwb` -> `Dsb` | `ET` (alpine / sub-airless lip) |
| **Temperatures (`tm` / `tw` / `tc`)** | **`30.0 °C`** (`36.0 °C` / `23.0 °C`) | `31–33 °C` (`38 °C` / `24 °C`) | `14–24 °C` | `< 4 °C` |
| **Annual precipitation (`p.png`)** | **`1,522 mm/yr`** (`c = 0.65`) | `220–450 mm/yr` (rain-shadow floor) | `650–1,200 mm/yr` | `250–500 mm/yr` |

Querying `kits/crops` (`CROPS.forBiome('cut')` = `169` total crops across `lake`, `floor`, `walls`, `lip`; `CROPS.at` at
Dilihan's bench `{warmth:'tropic', atm:'dense', arid:'humid'}` = `55` rainfed crops; `{warmth:'hot', atm:'dense', arid:'wet', wet:true}` = `9` extreme-heat paddy crops; mid-wall terrace `{warmth:'subtropic', atm:'standard', arid:'subhumid'}` = `60` crops):

- **Bench & *hanḍu* irrigated allotments (`D1`, `-850..-1,150 m`, `Am` `1.79 atm`):**
  - *Staples:* **`rice`** (`rain`/paddy), **`bamboo-rice`** (`rain`, Cut native), **`taro`**, **`sweet-potato`**, **`shade-manioc`**, **`ashroot`**, **`plantain`** / **`banana`**, **`breadfruit`**.
  - *Oil, pulse & produce:* **`avocado`**, **`coconut`**, **`greens`**, **`fiddlehead`**, **`frillpod`**, **`hyperbamboo`** shoots (`rain`, warped Cut native), **`measuremelon`** (`rain`, geometrically segmented Cut native prized by Jimjam day-keepers), **`mango`**, **`guava`**, **`citron`**, **`pomegranate`** and **`fig`** on slightly higher terraces (`-400..+400 m`).
  - *Flavour, drink & industrial:* **`sugar-cane`**, **`clove`**, **`coffee`**, **`cacao`**, **`tobacco`**, **`alecap`** & **`pale-fungi`** (`dark-beds` in brick undercrofts), **`cotton`**, **`ramie`**, **`rope-banana`**, **`pandan`**, **`indigo`**, **`annatto`**.
- **Mid-wall veteran terraces (`+200..+1,500 m`, `1.33–1.56 atm`):** **`emmer`** wheat and **`helix-bean`** (for traditional legionary bread & pulse rations), **`whorl-olive`**, **`almond`**, **`apricot`**, **`canyon-grape`**, **`saffron`**, **`mulberry`**, **`flax`**, **`woad`**.
- **Cut salt-pan fringe (`D2`, `-1,450..-1,608 m`, `salt: true`):** **`ashmillet`**, **`sandpan-fonio`**, **`tepary-bean`**, **`glasswort`**, **`tidewort`**, **`wadi-date`**, **`carob`**, **`tamarisk-manna`**, **`sisal`**, **`rankgrass`** thatch, **`saxaul`** fuel.
- **Dyes & cloth (`CROPS.palette('cut', {grow:true})`):** all 7 colour families (`red`, `orange` incl. wild `circlelichen`, `yellow`, `blue`, `purple`, `brown`, `black`), `canPlaid: true`.

### 1.5 Geology & mineral lodes (`kits/resources/data/geology.json` & `lodes.json`)

`lodes.json` has `0` hand-authored point lodes within `150 km`; all yields come directly from 5.1's baked `4 km`
`geology.json` layers, which make Dilihan one of the richest polymetallic + chemical junctions on the map (explaining
both its bronze/tin trade with Ardent and why it copies Republican manufactures from Lipp):

| Resource / Rock | On pin `(744,663)` | Max <= `15 km` | Good `>=100` (`<=30 km`) | Rich `>=170` (`<=30 km`) | Provincial peak (`D1`–`D4`) & economic use |
|---|---|---|---|---|---|
| **Rock province** | **`granite`** | `granite` 36%, `cryst.` 36%, `sed.` 18%, `evap.` 10% | `sed.` 944, `cryst.` 816, `granite` 480, `evap.` 224 km² | — | Eigenweapon sliced right through a granite pluton intruding carbonate/sedimentary wall rock -> **`skarn`** & **`contact-marble`** |
| **`stone` / `wood` / `water`** | **`255 / 255 / 255`** | `255 / 255 / 255` | `2,240 / 1,808 / 2,336 km²` | `1,936 / 1,504 / 1,824 km²` | Unlimited structural stone, monsoon timber & spring water on the bench |
| **`tin`** | **`200` (rich)** | **`200`** @ `(748,660)` | `480 km²` | **`480 km²`** | Granite-greisen cassiterite right under Dilihan & `Aidol` (`200`); paired with `copper` (`170`) + Ardent trade for Cut bronze |
| **`iron` & `skarn`** | **`120`** / `0` | **`255` / `200`** @ `(748,658)` (`13 km` NE) | `2,048` / `144 km²` | **`848` / `144 km²`** | Magnetite skarn (`255`) `13 km` NE & `Kotgeta` (`180`); feeds Dilihan's foundries and Quiet-Copy machine shops |
| **`potash` / `halite` / `gypsum`** | `0 / 0 / 0` | **`214 / 75 / 196`** @ `(744,660)` (`6 km` N) | `128 / 32 / 80 km²` (`608 / 272 / 336 km²` `<=90 km`) | `48 / 16 / 32 km²` (`272 / 128 / 176 km²` `<=90 km`) | **`#1` evaporite province on the 5.1 map** (`potash = 254`, `gypsum = 251`, `halite = 250`, `alabaster = 201` on Cut Salt Lake shore `D2`) |
| **`marble` & `limestone`** | **`106` / `118`** | `106` / `118` (`alabaster` `157`) | `160` / `416 km²` | `0 km²` (`limestone` `230` at `Guach-Roda`/`Port Visas`) | Contact-metamorphosed white marble (`contact-marble`) for the *colonia*'s Jimjam podiums, sun-temple portal and palace |
| **`copper` & `zinc`** | `50` / `0` | **`170` / `136`** @ `(748,658)` | `128` / `128 km²` | `96` / `0 km²` | Local bronze & brass alloying beside the tin greisens |
| **`rare-earth`, `gold`, `silver`** | **`160 / 110 / 110`** | `160 / 110 / 110` | `1,296 / 1,296 / 1,296 km²` | `0 km²` | Steady bullion & instrument-glass earths from the sliced granite batholith; **`emerald = 130`** (`656 km²` `<=30 km`) |
| **`clay`** | `0` (granite pin) | **`230`** @ `(740,658)` (`13 km` NW) | `256 km²` | **`256 km²`** (`255` at `738,656`) | Alluvial lake-apron brickearth `12 km` NW — fires every red-and-yellow brick of the *colonia* and Governor's Palace |
| **`coal` & `sulfur`** | **`0` / `0`** | `50` / **`0`** | `64` / **`0 km²`** | `0` / **`0 km²`** | `coal = 136` at `(734,654)` (`27 km` NW) and **rich `coal = 211`** at `Kolkrika` `(798,700)` (`D4` SE corridor); **`sulfur = 0`** across the entire Cut (`90 km` radius) — imported via Trigon/Hook once the sea road reopened |

### 1.6 Pass roads, provincial census (`32,000`) & *hanḍu* hinterland (`core/hamlet`)

Three engineered corridors in `openworld/network-proposal/net51.json` converge on Dilihan's bench (`744, 663–664`):
1. **North Cut Highway to Jimjam (`izani.north.dilihan`, `246 km`, `67 km` of tunnels, `22` viaducts):** descends off
   Dilihan's north gate (`744,664` -> `738,654` `-1,380 m` along the western skirt of the `-1,608 m` salt sump -> `742,644`
   `-1,410 m` -> climbs the north Cut lip via viaducts and `67 km` of rock-cut galleries through `740,614` `+1,210 m` and
   `Kotgeta` `737,604` -> `Jimjam` `745,546`; `kept` across the southern 57% in Dilihan Province, `decayed`/`lapsed`
   nearer the frontier, with pack spurs NE to `Ardent` `830,553` and NW past `Aidol` `712,628` toward `Lipp` `691,619`).
2. **SE Highway to ruined Port Visas (`izani.dilihan-portvisas`, `152 km`, `28 km` of tunnels, `100% kept`):** bores
   southeast out of Dilihan through the `+11 m` divide (`748,668` -> `752,672` `h = +11 m`, `5` tunnel segments = `28 km`)
   down into the karst/sedimentary trough (`768,686` `-1,386 m` -> `Guach-Roda` `780,706` -> `Kolkrika` colliery `798,700`
   -> ruined **`Port Visas`** `800,712`, where `~1,000` holdouts guard the shattered quays against Screamer forays and
   salvage pre-raid harbour gear). Also meets the decayed overland Imperial trunk (`izani.north.iziz`, `1,262 km`, `96 km`
   tunnels, approaching from `812,664` -> `758,664` `+70 m` -> `744,664`).
3. **Reopened Southern Karst Road to the Hykkousoi League (`99 km` to `Limnaia`, `160 km` to `Trigon`):** climbs `14 km`
   south over the `+45 m` karst saddle (`744,670–672`), passes through the `k-guilin` tower-karst gate into League
   `Limnaia` (`736,712`), and reaches navigable Ring Sea water at **`Trigon`** (`722,740`) and **`Ys`** (`788,741`) —
   carrying Dilihan's potash, tin/bronze and copied manufactures out to `Hook` and `Porta Marr` in exchange for imperial
   letters, sulfur/reagents and machine tools.

**Reconciling the city and provincial headcounts (`PROPOSAL-IZIZ-EXCLAVES.md` §3.1/§4.1 & `RING-SEA-SCOPE.md` §3.1):**
`RING-SEA-SCOPE.md` locks **`Dilihan Province` at `32,000`** (`12` settlements) with the `D1` seat cell listed at
`17.2k` (`PROPOSAL-IZIZ-EXCLAVES.md` splits `D1 = 18,100` into `12,000` walled/urban city + `6,100` bench hamlets). On
the site page (`30 × 30 km` extract), **`16,000`** is the continuous Dilihan metropolitan settlement (`12,000` in the
*colonia*, Vernacular districts, palace precinct and lower road town + `4,000` across the contiguous *hanḍu* veteran
allotment grid and brick/skarn works inside the site frame; see §6 Q3):

| Sub-region (`PROPOSAL-IZIZ-EXCLAVES.md`) | Settlements & 5.1 Pins | Pop | Site-page / `core/hamlet` representation |
|---|---|---|---|
| **`D1` Dilihan Bench & *Hanḍu* Grid** | **Dilihan** `(744, 663)` (`12,000` urban + `4,000–5,200` *hanḍu* belt = **`16,000–17,200`**) | `17,200–18,100` | Built in full on `dist/dilihan.html`: urban zones on `KCITY` + 8 surrounding *hanḍu* veteran allotment hamlets (`KHAMLET.village`, `JJ` farmsteads/granaries/windmill + `IZV` cottages), NW clay brickyards `(740,658)` and NE tin/iron skarn adit `(748,659)` |
| **`D2` Cut Basin Evaporite Floor** | **Cut Salt Works** `(744, 659)` / `(736, 650)` (`2,500`) + 3 brine-pan hamlets | `4,600` | Southernmost potash/salt-pan hamlet at `(744, 659)` (`8 km` N, `-1,608 m` shore) falls **inside** a `30 km` site extract (`KHAMLET` `salt` village) |
| **`D3` North Cut & Republic Watch** | **Kotgeta** `(737, 604)` (`2,200`), **Aidol** `(712, 628)` (`1,800`, customhouse taxing/seizing Lipp goods) + 3 hamlets | `5,300` | Off-page regional sim nodes (`SIM.trade` / `net51` north gate & Republic-watch toll/seizure post feeding Dilihan's Quiet-Copy workshops) |
| **`D4` SE Pass & Ruined Coast** | **Guach-Roda** `(780, 706)` (`1,600`), **Port Visas** `(800, 712)` (`1,000` holdouts), **Kolkrika** `(798, 700)` (`700`, `coal=211`) + 1 hamlet | `4,000` | Off-page SE tunnel-mouth & ruined-port nodes (`izani.dilihan-portvisas` coal & salvage lifeline) |

### 1.7 Five urban & rural zones at `(744, 663)` (`1:4` *colonia*-to-Vernacular geometry)

| Zone | Where on the `(744, 663)` bench | Area / Elev | What stands there |
|---|---|---|---|
| **1. The old quarter (*colonia*)** | Projecting northern/western bedrock nose of the `-892 m` bench, inside the first brick-and-marble circuit wall | **`0.25 km²`** (`~500 × 500 m`), `-894..-886 m` (`jimjam: 1.0`) | Jimjam-style core (`frontage-courts`): raised marble **forum**, re-aimed **`jj_temple_sun`** on the west-facing rim of the nose (§2.2), middle & rich veterans' courtyard houses, first **barracks** & **fortress** (`JJ`), **library**, **school**, **amphitheater** carved into the `18 m` NW bench scarp, gated circuit wall |
| **2. The governor's precinct** | Upper SE edge of the *colonia* wall where old quarter meets the Vernacular districts | `70 × 56 m` palace grounds (`~0.04 km²` w/ forecourt), `-878 m` (`iziz-vernacular: 1.0` surround) | **`govpalace`** in Jimjam brick/marble + gold onion dome + Iziz orange banners/gate/reveals (§2.3); `IZV` guard tower & barracks outside the gate; rich & civic **Izani quarter** (Veterans' Council hall, Quiet-Copy guild assay house) |
| **3. The districts** | Wrapping the *colonia* on east, south and west across stepped bench tiers | **`1.00 km²`** (`4.0×` the *colonia*), `-888..-845 m` (`iziz-vernacular: 0.9`, `jimjam: 0.1`) | `IZV` housing poor to rich (`alleys` + main streets), bronze/tin foundries, Quiet-Copy workshops, warehouses, market, **muster ground** on the flat eastern terrace, north **caravanserai** (`JJ` + `10%` Jimjam merchant houses) at the Jimjam highway gate, `KCONS` scaffolded lots |
| **4. The lower town** | Foot of the bench scarp (`30–35 m` below the *colonia* nose) on the fork of the N Cut & S/SE pass roads | `~0.18 km²`, `-928..-915 m` | Pass-road inns and pack stables, **customs & assay post**, the newly built **Hykkousoi League envoys' house** (walled compound with cistern court since the thaw), stone bridge/ford over the West-Wall spring stream |
| **5. The country (*Ḍeḷḷu-Hanḍu*)** | Bench apron (`-940..-1,250 m`) north toward the lake shore & terraced southern pass approach | Surrounding `30 × 30 km` world extract | Orthogonal **grid of *hanḍu* veteran allotments** (`JJ` farms, granaries, windmill + `CROPS` rice/emmer/measuremelon/olive plots), brickkilns on the NW clay bed, skarn adit on the NE granite contact, SE tunnel portal (`izani.dilihan-portvisas`), and the `D2` potash/salt-pan edge `8 km` north |

**Four to one (settled 2026-10-18).** The old quarter is **one** unit of area (`~0.25 km²`); the Vernacular districts
are **four** (`~1.00 km²`). The site editor draws the old circuit wall first and sizes the three surrounding Vernacular
district polygons to `4:1`; `verify.py --assert` sums built lot areas by `KTAGS` culture tag (`jimjam` inside the
*colonia* vs. `iziz-vernacular` + `jimjam` merchant lots in the districts) and asserts the ratio stays within a fifth
(`3.2:1` to `4.8:1`).

---

## 2. Jimjam beside the Vernacular, the Solstice Arch & the Palace

### 2.1 Boundary, cornice and material rules (`VASSAL-KITS.md`)

The Jimjam kit was not written on the Vernacular contract: its materials are canvas-procedural (`60-jj-mat.js`), its
registry is `JJ.def` and not `VERN.def`, and its sheet turns every building to face north (`ry = π`) for the solstice
light. So the two never share an unmediated street; they share a **boundary**, the old wall, and the contract is
enforced at it:

- **Lots are one or the other.** A `core/city` zone carries the culture mix (old quarter `jimjam` `1.0`; the Izani
  quarter `iziz-vernacular` `1.0`; the districts `iziz-vernacular` `0.9`, `jimjam` `0.1` for the Jimjam merchants' houses
  near the north caravanserai). The lot filler draws the culture via `KRAND`, then the type from that registry: a Jimjam
  lot calls `JJ.place`, a Vernacular lot the `IZV` placer, through one host adapter (`src/45-dilihan-lots.js`).
- **Cornice lines meet (`<= 0.5 m`).** Where a Jimjam row faces a Vernacular row across the wall street, the P2 check
  reads both registries' eaves/parapet heights and reports any mismatch over `0.5 m` per `VASSAL-KITS.md` §1; a mismatch
  is resolved via `o.scale` on the Jimjam placement record, **never** an edit to `settlements/jimjam/src`.
- **Materials.** Left as-is in P0–P2 (Jimjam procedural, Vernacular on the library). P3 maps the Jimjam materials used
  on this page onto `KMAT` records backed by the library's red/yellow brick and `contact-marble` sets where available;
  any missing textures go to `PROMPTS-NEEDED.md`.

### 2.2 Re-aiming `jj_temple_sun` for Dilihan's 5.1 horizon & `-31.50° S` latitude

In `settlements/jimjam/src/74-jj-sacred.js`, `jj_temple_sun` (`62 × 72 m` footprint, `6.0 m` marble podium, `6.0 m`
sanctuary floor, observer eye `+13.7 m` above ground) has its open solstice portal (`4.0 m` wide × `7.0 m` high, crown
`+19.0 m`) on its local **`+z` front** (`az = 180°` when `ry = 0`; `ry = π` faces north on the kit sheet). To frame the
summer-solstice sunset (`day = 350`, `dayCount = 91` from `ATMOS.SKY.startDay = 259`), its world rotation is
`ry = π - az_sun * (π / 180)`.

> **Important `core/atmos` 5.1 coordinate note:** `core/atmos/sky/89-atmos-e-skymodel.js` still defines
> `ATMOS.SKY.frame.refPx = [446, 690]` on the legacy 4.x canvas (`Voth = -40.0° S`). Passing raw 5.1 `(744, 663)` to
> `ATMOS.siteAt(744, 663)` without subtracting the 5.1 shift `(+272, +330)` would compute a false latitude of
> **`-39.36° S`** (`2.08°` azimuth error — wide enough to clip the `2.0 m` half-width portal jamb!). Until `ATMOS`
> updates `refPx` to 5.1 `(718, 1020)`, Dilihan passes **`{latitude: -31.50, subGiantLon: 56.27}`** (matching
> `ATMOS.siteAt(744 - 272, 663 - 330)` = `ATMOS.siteAt(472, 333)`).

Raycasting 5.1 `h.png` from the temple sanctuary eye (`-888.6 + 13.7 = -874.9 m` at `744, 663`) across the western Cut
wall (`az = 236°..264°`) shows that the SW Cut rim (`px 730.5, 669.0`, `d = 29.5 km`, `h = +985.8 m`) stands at a
**terrain horizon angle of `+3.61°`** along `az = 245°–246°` (rising to `+5.29°` due west at `az = 260°`, `+4,402 m`).
Aiming the arch for **`sunAlt = +4.00°`** (`0.39°` clear above the `+3.61°` SW Cut ridge, well under the portal crown's
`~11.5°` vertical ceiling from the sanctuary centre) gives the exact placement parameters:

| Case / Reference | Latitude | Target `sunAlt` | Day-350 Hour | Sun Azimuth `az` | Temple `ry` (`π - az`) | Notes |
|---|---|---|---|---|---|---|
| **Dilihan 5.1 terrain sunset (target)** | **`-31.50° S`** | **`+4.00°`** (clears `+3.61°` SW Cut rim at `29.5 km`) | **`18.6572`** (`18:39:26`) | **`245.39°`** | **`-1.1412 rad` (`-65.39°`)** | Sun disc sits squarely inside the `4 × 7 m` portal above the SW Cut lip; verified by `verify.py` solstice eval |
| Dilihan flat-horizon reference | `-31.50° S` | `0.00°` | `19.0050` (`19:00:18`) | `242.73°` | `-1.0948 rad` (`-62.73°`) | Blocked by `+3.48°` SW ridge on 5.1 terrain |
| Jimjam 5.1 (`745, 546` / leg. `473, 216`) | `-28.71° S` | `0.00°` / `+3.00°` | `18.896` / `18.644` | `243.55°` / `245.33°` | `-1.1091` / `-1.1402 rad` | `234 km` (`2.79°` lat) north of Dilihan |
| *Bug trap: raw `ATMOS.siteAt(744, 663)`* | *`-39.36° S` (wrong)* | *`+4.00°`* | *`18.9655`* | *`243.31°`* | *`-1.1050 rad` (`-63.31°`)* | *Off by `2.08°` — do not pass unshifted 5.1 px to `ATMOS.siteAt`* |

### 2.3 The Governor's Palace (`VASSAL-KITS.md` §3, settled)

The palace uses the `govpalace` massing (`VASSAL-KITS.md` §3.1) and floors (§3.3), taking the forks of §3.4 as Pylon and
Talia took them (**kin-only household**, **council pavilion inside** for the Veterans' Council, **guard pavilion inside**
the palace and **Vernacular guard tower + barracks outside**, walled grounds **`70 × 56 m`**). Dilihan builds it in
Jimjam's vocabulary:

- **Terrace:** a Jimjam `contact-marble` podium with its axial stair;
- **Hall block:** banded brick (red with yellow header courses) with marble string courses and surrounds, two storeys of
  brick arcades, oriels on the upper gallery, the loggia's columns on Jimjam's patterned shafts;
- **Great dome:** a gold onion dome on a drum of marble-framed windows, the lantern serving as the Cut signal room
  (sightlines north down the Cut highway and south toward the pass gate);
- **Seven pavilions:** chhatri pavilions — ribbed slate domes with lanterns on the two large (council & audience),
  terracotta domes on the small; the kitchen pavilion a round brick kitchen under a vented dome with a clustered Tudor
  stack;
- **Outside stair & accents:** a straight marble flight on a brick stringer wall; **Iziz orange restricted to the
  banners, the gate and the window/arch reveals**, so the palace reads Jimjamite first and Izani second;
- **Interiors:** furnished on the Iziz catalog set (`KFURN`, indexed batch) with Jimjam's sunray inlay on the great hall
  floor and brick vaults in the undercroft.

Its floor sheets (`settlements/dilihan/palace/`) are generated on `settlements/voth/palace/blueprint.py` after review of
§6, one sheet per floor, with a furniture manifest keyed to `kits/catalog/iziz`.

---

## 3. The order of work

- **P0. The harness & 5.1 ground extract.** `extract_region.py` cut around `(744, 663)` (`30 × 30 km`); `build.py`
  calling `build_sources.report()` and reading `core/world`, `biomes/cut` (plus `nhighlands`/`nwlowlands`), the Jimjam
  kit (`settlements/jimjam/src`), the `IZV` bundle and `core/city` in place; `WORLD.landHook` shaping the `-892 m`
  *colonia* spur and sliced Cut walls; port lint clean; `verify.py` on `tools/harness.py`. Done when `jj_temple_sun`
  and an `IZV` house stand on the `(744, 663)` bench and `--assert` passes.
- **P1. The site.** The road approaches (`izani.north.dilihan`, `izani.dilihan-portvisas`, south League road), the
  West-Wall spring stream and `-1,608 m` north salt-lake margin (`KCOAST`), and the site editor saving
  `site/dilihan-site.json`: the `500 × 500 m` old wall, the `4:1` Vernacular district zones, the `70 × 56 m` palace
  precinct, the lower-town shelf. Done when `KCITY` steps 0–5 run cleanly with zero steep-lot overlaps.
- **P2. The two towns & hinterland.** `KCITY` steps 6–12; the `JJ` / `IZV` lot adapter; the `<= 0.5 m` cornice check at
  the wall street; `jj_temple_sun` re-aimed to `ry = -1.1412 rad` (`az = 245.39°`, `sunAlt = +4.00°` at `-31.50° S`);
  `KCONS` scaffolded lots; 8 *hanḍu* veteran allotment hamlets + NW brickworks + NE skarn adit + N salt-pan edge on
  `core/hamlet` and `CROPS`. Done when the `1:4` culture-area assert, cornice assert, solstice eval and city test pass.
- **P3. The palace and the landmarks.** Palace floor sheets (`blueprint.py`), then the `govpalace` build; the raised
  marble forum, sun temple precinct, slope-cut amphitheater, north Jimjam caravanserai, fortress, lower-town customs
  post and Hykkousoi envoys' house; Jimjam brick and `contact-marble` mapped onto `KMAT` library sets (`PROMPTS-NEEDED.md`
  for gaps). Done when all views in §4 read cleanly.
- **P4. The life.** Citizens on `core/charactermodels` (Izani veteran-house citizens speaking northern Izani with
  Jamṭōkku loans, Jimjam merchants and almanac-keepers, Free Clans bronzesmiths from Ardent, Hykkousoi envoys and clerks
  at the lower-town legation), legionary/militia muster on the eastern ground, night lighting (electric light on rich,
  civic and palace domes only; oil/lamp-cap lanterns in the old quarter and alleys). Done when the night view reads.
- **P5. The record.** `INDEX.md`, `README.md`, `KNOWN_ISSUES.md`, `PORT.md`, gallery entry, `python3 tools/test_all.py`
  and `PORT-BASELINE.json` hash update.

---

## 4. Views for `verify.py`

| View | What it must show |
|---|---|
| **1. Overview from above the Cut** | the `500 × 500 m` brick *colonia* on the `-892 m` bench nose inside its wall, the `4×` Vernacular districts terraced behind it, the gold onion dome at the join, the sliced eastern/western Cut walls and the `-1,608 m` salt-lake gleam `8 km` north |
| **2. The forum at eye level** | Jimjam's raised marble plaza, `jj_temple_sun` on the western lip, the veterans' courtyard houses |
| **3. Summer-solstice sunset through the arch** | day `350`, hour `18.66` (`-31.50° S`): the setting sun at `+4.0°` altitude framed cleanly through `jj_temple_sun`'s portal just above the `+3.61°` SW Cut rim (`verify.py --assert` ray/ephemeris check) |
| **4. The wall street** | Jimjam red-and-yellow brick on one side, Vernacular white render and Iziz orange on the other, cornices level within `0.5 m` |
| **5. The palace from the forecourt** | the `contact-marble` podium, two-storey banded brick arcades, patterned-shaft loggia, gold onion dome w/ signal lantern, chhatris, Iziz orange banners/reveals, Vernacular guard tower outside |
| **6. The north caravanserai** | the Jimjam highway gate (`izani.north.dilihan`), Jimjam merchant houses (`10%` mix) among the Vernacular, pack trains |
| **7. The lower town & *hanḍu* apron** | the pass-road fork, customs post, the walled Hykkousoi envoys' house, spring stream bridge, and the orthogonal *hanḍu* veteran farm plots with Jimjam granaries/windmill |
| **8. Night** | the palace onion dome and sun temple lit, electric glow on rich/civic Vernacular, warm oil lamps inside the brick *colonia* |

---

## 5. Settled owner decisions (2026-10-18 & 2026-10-26 — preserved in full)

1. **Settled (2026-10-18; updated 2026-10-30).** Originally: a Cut kit was to come later, with `nhighlands` and
   `nwlowlands` read in place and the build drawing the bowl's ground. `biomes/cut` (`CUT`) has since been built
   (2026-10-30) on that exact contract — reading `nwlowlands` + `nhighlands` in place and adding `CUT.bowl`,
   `rock.cut.polished`, `contact-marble` and the four warped Cut natives (`hyperbamboo`, `rankgrass`, `measuremelon`,
   `circlelichen`) — so Dilihan can take `biomes/cut` directly in place (§0, §6 Q2).
2. **Settled (2026-10-18).** The governor is chosen by the veterans' council and confirmed by Iziz by letter (1–2 years
   in transit), with the Izani title (*sid'kiñ*). The city speaks archaic northern Izani with a light dusting of
   Jamṭōkku loans (brick/kiln terms, calendar Count, land/dry measures; contracts dated by Jimjam's reckoning; P4).
3. **Settled (2026-10-18).** The Cut is effectively a pass through the northern highlands, formed in the Cataclysm by an
   Ancient eigenweapon whose detonation deleted a perfectly spherical volume of matter (§1.2). A freshwater stream down
   the bowl to the League's coast was the 4.21 plan's assumption (to be taken as a scale-model river edit later); see
   §1.3 and §6 Q1 for how Scale Model 5.1's endorheic Cut Salt Lake (`-1,456` / `-1,608 m`) interacts with it.
4. **Settled (2026-10-18).** The old quarter takes the Iziz catalog furniture set (`kits/catalog/iziz`) until a Jimjam
   furniture set exists; the Jimjam set is its own job, after this build's P3.
5. **Settled (2026-10-18).** A Jimjam name read through an Izani accent: Jamṭōkku **Ḍeḷḷu-Hanḍu**, "**Dell-Hand**", the
   plots in the dell. Jamṭōkku counts things with measure words (`LORE.md` §6.14), and *hanḍu*, "hand", is its measure
   word for a plot of land, the breadth a man's hand spans on the day-keepers' field tally; *ḍeḷḷu* is English *dell*,
   the bowl the Jimjam saw from their lake. So the name is what Jimjam's masons and almanac-sellers called the colony:
   the hands of land in the dell, the veterans' allotments. An Izani ear flattens the retroflex *ḍ* and dark *ḷ* to
   plain *d* and *l*, hears the doubled *ḷḷ* as a higher vowel (*e* > *i*), drops the Jimjam *-u* endings and the second
   *d* of *-nḍu*, and the colony's Izani wrote **Dilihan**, keeping the *h* their own speech no longer sounds because
   the Jimjam say it. `lore/tongues-of-krator.html` is to take the pair (the Jimjam and the Izani tabs).
6. **Settled (2026-10-26, `LORE.md` §§6.2, 6.7, 6.14).** **Port Visas** (`800, 712`) was Dilihan's sea lifeline until a
   Screamer raid sacked it ~120 years ago, making Dilihan self-governing by isolation until the recent Hykkousoi thaw
   reopened envoy and caravan transit via Limnaia/Trigon/Ys; Republican goods from **Lipp** (`691, 619`) are taxed,
   seized at customs and quietly copied; Free Clans **Ardent** (`830, 553`) is an ally sending bronze down the Cut.

---

## 6. Scale Model 5.1 reconciliation questions for the owner

1. **5.1's endorheic Cut Salt Lake & north-facing bench vs. a south-draining pass river (§1.2, §1.3):**
   On Scale Model 5.1, the Cut holds a closed **`3,152 km²` Cut Salt Lake** (`-1,456 m` main bowl; `-1,608 m` SE sump
   whose shore reaches `px 744, 659`, `8 km` north of Dilihan), while `px 744, 663` (`-888.6 m`) slopes **`10.1%`
   northward** toward that lake and a **`+45.4 m` divide sill** (`py = 670–672`, `14–18 km` south) separates the Cut
   from the south-draining Hykkousoi karst (`Limnaia` `-1,392 m`). Meanwhile, `PROPOSAL-IZIZ-EXCLAVES.md` (`D2`) leans
   heavily on that 5.1 salt lake (`#1` potash/halite/gypsum deposit on the planet, `4,600` people).
   - **(Recommended) Keep 5.1's endorheic Cut Salt Lake (`D2` potash/salt works intact) + local West-Wall spring stream:**
     `WORLD.landHook` shapes a projecting flat-topped bedrock spur at `(744, 663)` (`-892 m`) that commands *both* the
     northward descent to the Cut floor/Jimjam highway and the southern pass road climbing over the `+45 m` karst gate
     to Limnaia/Trigon (plus the `28 km`-tunnel SE highway to Port Visas), with a perennial freshwater contact-marble
     spring stream along the lower-town road. No scale-model hydrology rebake needed.
   - **Alternative (Scale Model 5.2 trench edit):** cut a `-1,460 -> -1,503 m` gorge through the `95 km` southern sill
     (`py 660..712`) so the entire Cut drains fresh south into Trigon's sound — matching the 4.21 note literally, at the
     cost of draining `Cut Salt Lake` and removing `D2`'s potash/evaporite industry.
2. **Direct adoption of `biomes/cut` (`CUT`):** since `biomes/cut` is now built and verified on 5.1 coordinates (with
   `CUT.PX0` shifted to `732, 632`), confirm `settlements/dilihan` takes `biomes/cut` directly (which already wraps
   `nwlowlands` + `nhighlands` in place and adds `rock.cut.polished`, `contact-marble` and the four Cut natives).
3. **Urban vs. *hanḍu* allotment split inside the locked `32,000` province (`RING-SEA-SCOPE.md`):** confirm **`16,000`**
   as the on-page `D1` metropolitan total (`12,000` inside the *colonia*, `4×` Vernacular districts and lower town +
   `4,000` across the 8 contiguous *hanḍu* veteran allotment hamlets, with the remaining `1,200` of `D1`'s `17,200` on
   outer bench hamlets).
