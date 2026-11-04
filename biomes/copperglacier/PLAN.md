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
| strata | `KSTRATA` (35) | **no** | the walls are gneiss and granite, foliated, not bedded; the skarn is a band, drawn as the ground's malachite and gossan layers on the copper field |
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
