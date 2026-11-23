# Copper Glacier: the plan

Copper Glacier (`rmvcopperglacier`, "copper glacier") is the alpine cryosphere of the southern Crook. Map 5.1 has it as 217,000 km²
between the Crook to the north and the W rift highland and the Tungang Union to the east (`biomes/STATIONS-MAP-5.1.md`, the new-kits
table). It is the one near-term kit in the Crook (the owner, 2026-11-01: `HANDOFF-REBUILD.md`, "Owner's decisions"). Started
2026-11-03 on `claude/biome-rebuild` and built to the rebuild's universal set from the start (`BACKPORT.md` section 1).

## 1. What the map and the lore say

- **The lore** is one region note (`tools/scale-model/model/src/51-region-store.js`, the `defRegs` entry; the same text in
  `smodel/nw_expansion.py`). It describes glaciers grinding through copper porphyry, with malachite and azurite veins tinting the
  banded ice verdigris-emerald. Meltwater feeds the turquoise **Copper Tarn** at +2,380 m. A glaciated pass runs ESE from the Crook
  to the Rift's north-west head. `tools/scale-model/README.md` adds banded malachite-azurite glaciers and periglacial troughs at
  +5,880-6,240 m.
- **Who lives there:** nobody is assigned (`STATIONS-MAP-5.1.md`: the new N and W are undecided). No settlement, no polity polygon.
  The nearest peoples are the Tungang Union and the Fellgangs to the east. The Tarn's outflow is the **Kopa-Tarn Warra** (the Crook
  River, river 9105, 980 km to the sea), named in the Tungang tongue.
- **The model** (5.1, `tools/scale-model/model/data/`, read 2026-11-03):
  - heights p5/p50/p95: 2,371 / 6,271 / 11,219 m;
  - classes: O (airless rim) 15,420 px, ET 12,425, EF 11,220, HF 6,590, HT 4,708, Dfb 2,085;
  - mean temperature: -32 / -8 / +10 °C;
  - rain: median 894 mm.
- **Trimmed to the Firebliss Range (2026-11-09, scale model 5.1 edit 3; the owner).** The region overlapped 57% of the Firebliss
  Range (`biomes/firebliss/PLAN.md`): its south edge ran at y 1345 across three of Firebliss's five volcanoes and two of its
  warm valleys. It now follows Firebliss's north edge (`tools/scale-model/edit_513.py`). Read again on the trimmed region and
  the rebaked resources: 37,747 cells (151,000 km²); heights p5/p50/p95 2,318 / 4,819 / 7,646 m; ET 13,972, EF 13,055, HT 4,332,
  HF 2,409, Dfb 2,137, Cfa 605; mean temperature -25 / -8 / +10 °C; rain median 1,067 mm; provinces crystalline 3,339 four-km
  cells, sedimentary 2,986, granite 2,621, rift 355; copper prospectivity up to 240, 371 cells over 120 (the eastern pass). The
  three stations stand where they were and their pages were rebuilt on the rebake; the numbers below are the 2026-11-03 reading.
- **The copper, read from the resource data, not invented** (`kits/resources/data/geology.json`, the 2026-11-03 rebake;
  `KRES.nodesIn` over the polygon):
  - The ground is crystalline (gneiss) 7,532 cells, sedimentary 2,825, granite 2,589, rift 355. No basalt, no volcanic and no
    ultramafic rock, so there is no nickel (0 everywhere) and no native copper.
  - Copper prospectivity is 50 on the gneiss and granite, 10 on the sediments, and up to **240 on the eastern pass's rift strip**,
    which is skarn (200) on the rift's edge.
  - 2,319 copper nodes lie inside the polygon: 355 high, 888 medium and 1,076 low grade.
  - Marble is at most 63 (1 high node), so the karst survey's ruling holds: **no soluble rock, ice caves only**
    (`biomes/KARST-SITES-5.1.md`).
  - **For the owner:** the lore's porphyry copper is not in the data. Copper is common but background on the gneiss, and rich only
    on the eastern pass. The kit follows the data: the verdigris stain and the copper flora are strong only where the prospectivity
    is high, and the tarn's turquoise is glacial flour, not copper.

## 2. The stations, on the 5.1 map

World km = 5.1 px x 2. The sky's site is the old canvas px, which is 5.1 px less (272, 330).

| Station | Page | 5.1 px | Old px | Height | Air | Class | Mean (warm/cold) | Rain | What |
|---|---|---|---|---|---|---|---|---|---|
| 1 **Copper Tarn** | `dist/copperglacier.html` | 148,1148 (the tarn); the ice from the east, 160-170,1148-1152 | -124,818 | 2,380 m (tarn); ice 3.7-4.3 km on the model's east slope | 1.19 atm | WH tarn; EF and ET round it | +9 (19/0) at the tarn, -2 to 0 on the ice | 1,500-1,800 mm | a valley glacier from the east calving into the Copper Tarn: the icefall, crevasses, moraines with verdigris boulders, the turquoise tarn and its outlet north (the Kopa-Tarn Warra's head), ice caves at the snout, frost coral and cushions on the moraines |
| 2 **The copper pass** | `dist/copperglacier-pass.html` | 320,1248 (the skarn); the trough 326-332,1236-1244 | 48,918 | the floor 2.6-2.8 km under 5-7 km walls | 1.15 atm (floor) | ET | +5 (18/-8) | 1,900 mm | the glaciated pass ESE toward the Rift: a hanging glacier from the south wall into the trough, the skarn wall stained with malachite and gossan, the copper nodes the data places, the copper flowers on the copper ground |
| 3 **The high icefield** | `dist/copperglacier-icefield.html` | 213,1225 | -59,895 | 6,500 m | 0.71 atm | HT | -20 (-9/-31) | 1,330 mm | the plateau ice: nunataks of gneiss, ice cliffs at its edge with ice caves, crevasse fields, wind-carved sastrugi, snow algae on the summer firn, almost no life |
| 11 **The azurite tarn** (Gemini 5.1 showcase; section 7) | `dist/copperglacier-azurite.html` | 148,1148 (the tarn's middle on the model; an ideal type, section 7.3) | -124,818 | 2,380 m (the tarn); the collar's crest 2,430-2,520 m, the walls to ~3.3 km | 1.19 atm | WH tarn; ET, EF | +9 (19/0) | 1,800 mm | the tarn in its secondary crater's ejecta collar (KSTRATA `secondary-ejecta`), the glacier calving into it under walls of contact marble (`contact-marble`) seamed with malachite and azurite, the outlet's braids through the western breach over green-pebbled bars |

Each page is a 5.2 km square (R 2600) built around the site, as the other station kits are. The model's slopes set the land:
station 1's ice comes from the east and falls 1.4 km to the tarn over about 8 km, so the page shows the lower tongue and the
icefall; station 2's trough runs ESE between walls that rise 2-4 km within 10 km; station 3 is gentle ice.

## 3. Life (Krator's native trends)

Krator's flora takes Earth's forms at about 1.5 times the scale, with a few alien notes: iridescence (the Rift's rule), coral and
anemone shapes, glow at night, and the native lineages of the cold (the Throne's gill-coral trees in the snow; its ice caves' mat,
brain caps and lamp caps: `biomes/throne/stations/glacier`; `LORE.md` section 8). Copper Glacier is cold, wet and young ground, so
its life is the cold belt's and the metal ground's.

| Species | Kind | Where | Note |
|---|---|---|---|
| **Frost coral** (`frostcoral`) | the one woody plant: a branching coral of stiff fleshy limbs, 1.5-4.5 m, ice-blue to verdigris, the tips iridescent | moraines and the tarn's shore under ~3.2 km; never on the ice | Krator's cold lineage, a cousin of the Throne's gill-corals; limbs on `BIO.tube` with `BIO.flareJoin` |
| **Verdigris cushion** (`cushion`) | a hard dome of tiny leaves, 0.2-1 m | moraine gravel, tundra, the pass floor | a metallophyte: it takes the copper up, so it greens to verdigris where the prospectivity is high |
| **Copper flower** (`copperflower`) | a spike of mauve-violet flowers on a basal rosette (Earth's copper flowers, *Haumaniastrum*, *Ocimum centraliafricanum*) | only on copper ground: prospectivity over ~120, the skarn, gossan and malachite scree | the prospector's plant: it marks the ore |
| **Rock lichen** (`lichen`) | plates and rosettes, orange, sulphur and a pale iridescent grey | boulders and the rock faces | |
| **Moss and sedge** (`mossmat`, `sedge`) | mats and tufts | the wet ground: the tarn's margin, the outwash, seeps | |
| **Snow algae** | a ground layer (watermelon snow): rose-pink on the summer firn | the old snow and firn, never the bare ice | `ground.snow.algae` |
| **Ice worms** (fauna) | the glacier's own animal: dark threads that rise to the surface at dusk and glow faintly blue-green (Krator's glow) | the bare ice and firn of stations 1 and 3 | points, as the Throne's steam is; no other fauna: the fauna kit owns animals |

No tree passes 7 m, so the kit draws no octahedral impostors (`34-core-impostor.js`: trees under 7 m have no stand-in).

## 4. Core adoption

The rule (`README.md`, "CORE MODULES ARE NOT OPTIONAL"): the modules the kit takes, and a line for each it does not.

| Need | Module | Taken | How |
|---|---|---|---|
| randomness | `core/rand` (`KRAND`) | yes | new placement by `KRAND.cell` / `KRAND.hash` per cell and index (never a running stream); the seracs, bergs and crevasses through `KGLACIER` |
| the glacier | `core/terrain/44g-core-glacier.js`, `host/44h-core-glacier-draw.js` (`KGLACIER`, lifted from the Throne 2026-11-03) | yes | the ice, the trough, the moraines, the lake basin; seracs, bergs, crevasses, the ice caves' shells |
| relief | `core/terrain/38-core-relief.js` (`KRELIEF`) | yes | station 3's nunataks (`KRELIEF.range`, joined); the valley walls are the stage's own profile, from the model's slopes |
| frozen ground | `core/terrain/42-core-frost.js` (`KFROST`) | yes | sorted circles on the moraine flats below the coral line (stations 1, 2), drawn by KGROUND's `polygon` kind on the same mask |
| ground | `KGROUND` (43), `KHORIZON` (45), `KFAR` (44) | yes | the ground's library layers on documented masks; KGROUND's relief (`bump .075, cavity .8, mesh 1`, `KGROUND.cavityMesh` on the ground) on every station and `tri` on the pass's steep near flanks (2026-11-03, the ground workstream; `?relief=0`, `?tri=0`); the shadows of the walls; the far field to 14 km |
| strata | `KSTRATA` (35, host/35 shade) | **station 11 only** | stations 1-3: the walls are gneiss and granite, foliated, not bedded; the skarn is a band, drawn as the ground's malachite and gossan layers on the copper field. Station 11 (section 7.3): `secondary-ejecta` with a lateral change to `contact-marble`, on its steep faces, with KGROUND's bed relief (`station.json` `"strata": true` adds it to the build) |
| speleothems, karst, caverns | `KKARST`, `KSPELEO`, `KCAVERN` | **no** | no soluble rock (section 1): the caves are ice caves (`KGLACIER.drawer`'s shells) |
| flora | `core/biome` (10, 20, 30, 31j, 34, 35, 40, 41, 42, 43, 44) | yes | `BIO.flareJoin` on every frost-coral limb; `BIO.INDEX_ITEMS`, `BIO.LOD.merge`/`fade`/`cull`; `BIO.env` and `envCheck` |
| impostors | `34-core-impostor.js` | listed, not used | no tree passes 7 m (section 3) |
| space | `core/space` (`KSPACE`) | yes | through the biome core's keep-clear |
| tags | `core/tags` | yes | every placed thing registered before it is drawn (`BIO.init({tags})`) |
| sky, air, weather | `core/atmos` (`bindHost`, `skyBiome`, height fog, rain cover, lightning, snow cover, `bindWeather`) | yes | the standard sky at each station's site; snow that lies |
| water | `core/water` (`WATER.open` for the tarn, `WATER.flow` for the outlet and the meltwater streams, ext 56, 57, 58, 60, 61) | yes | the tarn takes `surf:false, breakers:false` (still water); `WATER.mirrorSwitch` on the tarn, **off at page load**; the meltwater stream's plume into the tarn (`tintFlow`, ext/61); the wet band and the flora on `WATER.fieldAt` / `edgeAudit` |
| shadows | `core/shadow` (`KSHADOW`) | yes, measured | +20-56% a frame on the Arc (station 1): off at page load, `?shadow=1` on (`KNOWN_ISSUES.md`) |
| shader hooks | `core/shader` (`KHOOK`, `KHOOK.warp`) | yes | through `khost.resolve`; `KHOOK.warp` is the empty slot, nothing to install here |
| host, camera, probe, inspector, polygon tool | `core/host` (`KHOST`) | yes | `khost.FULL` and the polygon tool |
| hazards | `core/hazard` (`KHAZ`) | yes | every crevasse (`fall`) and the calving ice cliff (`crush`); the thin air on station 3 is not registered (`KNOWN_ISSUES.md`) |
| export | `core/export` | yes | `BIO.export`, the profile with water and terrain |
| materials | `core/materials` | yes | `materials.json` and `tools/textures/pack.py` |
| resources | `kits/resources` (`KRES`), read in place | yes | the copper nodes, their grades and the prospectivity field come from `geology.json` |
| city, hamlet, simulation | `core/city`, `core/hamlet`, `core/simulation` | no | nobody lives here (section 1) |

## 5. Textures

From the library:
- `ice.glacier` and `ice.clear` (the ice and the seracs);
- `ice.debris` (the dirty snout and the medial moraine);
- `ground.snow011` and `ground.snow.algae` (the firn);
- `ground.gravel042` (the outwash and the moraine);
- `ground.lichen.crust`;
- `rock.granite.tor` (station 1's granite walls);
- `rock.malachite` and `rock.gossan` (the skarn and the copper ground);
- `card.lichen`, `card.moss`, `card.grass.dry` (the sedge), `card.flowerspike` (the copper flower).

**Delivered 2026-11-03** (the owner, from this kit's prompts; library 8e181de19):
- `rock.gneiss.banded`: the walls where the data cell is gneiss or the rift's edge (stations 2, 3), and the moraine boulders on every station. Station 1's cell is granite, so its walls keep `rock.granite.tor`.
- `ice.glacier.verdigris`: the bare ice on the copper ground (KGROUND's `verdigris ice` layer, on the copper field).

## 6. For the owner's eye

- The copper is the data's, not the lore's (section 1). If the owner wants the porphyry of the lore, the rebake gives the Crook a
  porphyry province.
- The shadows' cost on each page (KNOWN_ISSUES.md).
- Every station's look: the tarn's turquoise, the verdigris stain's strength, the frost coral's shape.

---

## 7. Scale-Model 5.1 IOCG Skarn & Secondary-Crater Reconciliation + Showcase Station #11 (`2026-11-13`)

### 7.1 IOCG / Hydrothermal Cu-Skarn & Radial Secondary Crater (`0%` Subduction Porphyry)
- **Why the Crook Carries Copper Without Subduction (`GEOLOGY-SANITY-CHECK.md` §2):** Krator has no plate-subduction arcs, so classical calc-alkaline copper-porphyry provinces do not form here. Instead, Copper Glacier's rich verdigris mineralization arises from **Iron-Oxide-Copper-Gold (IOCG) & hydrothermal contact-skarn veins** (`chalcopyrite → malachite / azurite / chrysocolla + magnetite gossan`) where western Rift-shoulder mafic intrusions cut carbonate-bearing basement lenses (**`contact-marble`**, peaking around the glacial copper skarn ridge at `5.1 px 320, 1248`).
- **Copper Tarn as a Glaciated Radial Secondary Impact Crater (`5.1 px 148, 1148` / `147, 1143`):** The circular cirque cradling **Copper Tarn** (`+2,380–2,385 m`) is an ancient **radial secondary impact crater** excavated by a primary Krator megablock into the western outer-slope basement, preserving an upturned, frost-shattered **`secondary-ejecta`** boulder-breccia collar (`core/terrain/35-core-strata.js`) breached on its western lip by **`9105` (*Kopa-Tarn Warra*)**.

### 7.2 Showcase Station #11 — `Copper Glacier Azurite Tarn & Verdigris Outwash`
- **Canonical `5.1` Coordinates:** **`(148, 1148)`** (**Copper Tarn** cirque floor & glacier snout at **`+2,380–2,385 m`**, `1.20 atm`, `ET` / `EF` alpine glacial basin; paired up-glacier with the high Cu-skarn nunatak rib at **`(320, 1248)`**).
- **`KSTRATA` Binding:** **`secondary-ejecta`** (`3–9 m` chaotic angular megablock breccia, dark impact-melt matrix, and radial hummocky ejecta rim framing the tarn's circular collar) + **`contact-marble`** (`4–8 m` recrystallized white-and-blue marble with dark magnetite-epidote skarn selvages and bright green/blue malachite-azurite oxidation seams exposed at the glacier's plucked headwall) + `rift-basement` banded gneiss moraine boulders.
- **Camera Framing (`5.2 × 5.2 km` glacial-collar cut):** Low moraine-crest camera at `+19 m` above the western `secondary-ejecta` breach looking ENE across the vivid milky-turquoise/azurite waters of **Copper Tarn** (`WATER.open` copper-flour tint): a `45 m` calving glacier snout streaked with `ice.glacier.verdigris` copper-sulfate bands and medial gossan moraines plunging into the tarn, `contact-marble` malachite-stained headwall cliffs gleaming beneath hanging seracs, braided green-pebble outwash bars feeding **`9105` (*Kopa-Tarn Warra*)** in the foreground, and `frost coral` cushions + copper-tolerant metallophyte spikes (`card.flowerspike`) colonizing the damp skarn gravel.
- **Hydrology & Trade Tie-In:** Glacial abrasion grinds malachite, azurite, and native-copper nuggets off the `contact-marble` skarn wall directly into Copper Tarn and concentrates placer native copper and chrysocolla gravel bars down `9105` (*Kopa-Tarn Warra*); seasonal **Fellgang** and **Dalab** prospectors pan native-copper float on the outwash braidplain and pack high-grade azurite pigment and malachite smelting ore south toward the **Ledge** road and **Firebliss** passes.

### 7.3 Station 11 as built (2026-11-16): `dist/copperglacier-azurite.html`

`python3 build.py --station azurite` (`stations/azurite/`: `station.json` with `"strata": true`, which adds KSTRATA and its shader to the
build, and the station's `44z-host-site.js`). Verified on SwiftShader only (KNOWN_ISSUES.md: the GPU verify is owed).

- **An ideal type, not a 1:1 cut.** On the model the Copper Tarn is a round basin about 30 km across (px 138-154, 1134-1162; the bed
  2,364-2,374 m under the 2,380 m level), its outlet 9105 leaving the north-west lip at px 142,1136 for the west, the ice on the east
  shore 16 km from the middle (station 1). A 5.2 km page cannot hold the spec's framing at that size, so the page draws the crater
  small: the tarn 2.2 km across (centre -350,140 on the page), the collar's crest at 1.38 km, the glacier from the ENE (the model's
  ice is east), the breach and outlet WSW (the model's is north-west, then west). The level, the air, the climate and the sky are the
  model's at 148,1148. For the owner: KNOWN_ISSUES.md.
- **The land** is the shared stage with the station's own terms (`SITE.land`, new hooks in `src/45`, no-ops for stations 1-3): the
  bowl 18 m under the level (deeper in the glacier's trough), the collar's inner scarp (a beach, then steep) to a hummocky crest
  50-140 m over the water, the ejecta's apron outside; the glacier's gap through the collar; the breach's sill 1.6 m over the level;
  the outwash plain past it, falling west at 0.45%.
- **The beds** (`SITE.strata`, `src/84`): one KSTRATA stack, `secondary-ejecta` with a lateral change to `contact-marble` 1.0-1.35 km
  up the ice from the crater's middle, so the collar is breccia, melt and megaclast beds and the walls over the snout are marble with
  its epidote, garnet and magnetite selvages, the two tonguing into each other at the change; drawn on the steep faces
  (`strataColor`), their relief through KGROUND's `relief.strata`; KGROUND's `clast` kind on the collar's gentle ground.
- **The copper is the spec's** (the resource data has the cell as water): the seams on the marble walls (the kit's `rock.malachite`
  layer, turned azure where the azurite field says: the library has no azurite set), the talus under them, and the green pebbles on
  the outwash's bars (the copper field over .35: copper flowers, verdigris cushions, malachite stones).
- **The glacier** on KGLACIER as on the other stations: the snout 160 m into the tarn, its cliff about 45 m over the water, the icefall,
  crevasses, bergs, ice caves at both margins, a medial moraine (the debris field), the ice worms.
- **The water** on core/water: the tarn (`WATER.open`, bounded by the collar: `SITE.tarn.at`), milky azure, still (no surf, no
  breakers), the meltwater stream's plume; the Kopa-Tarn Warra's head as three `WATER.flow` threads (`path` streams from the tarn, new
  in `src/45`: level while inside the collar, then graded down, never climbing), the main thread 16 m wide, two braids parting and
  meeting it again over the plain.
- **The flora** is the kit's (`src/60`, unchanged): frost coral, verdigris cushions, copper flowers on the spec's copper, moss and sedge on
  the braids' banks, lichen, boulders (the banded gneiss the ice brought down). The page takes 60% of the kit's counts (`SITE.q`) and fewer
  corals (`coralK`), the crater's open ground being far wider than station 1's; nothing roots within 10 m of the ice (`SITE.rootClear`).
  About 7.6 M scene triangles (budget 16 M), 25 draw calls from the breach.
- **Views**: From the western breach (the spec's framing: 19 m over the breach's crest, looking ENE across the tarn to the snout), The
  marble walls over the snout, The braided outwash, The ejecta collar, and the kit's own (the snout, the icefall, an ice cave, ...).
- **Checks** (`SITE.checks`, each with a negative): the beds are the spec's recipes (secondary-ejecta on the collar, contact-marble on
  the walls); the collar holds the tarn (no tarn water outside the crest but the outlet's channel); the outlet leaves the tarn at its
  level and never climbs.
- **Not drawn:** the Fellgang and Dalab prospectors panning the float (no people: the kit has no settlement); the IOCG's magnetite gossan
  and the native-copper nuggets as objects (the bars' copper is a ground layer and stones).

