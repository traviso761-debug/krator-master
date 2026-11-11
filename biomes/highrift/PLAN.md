# highrift: the plan (written on scale model 5.1, 2026-11-03)

**High Rift** (`rmvhighrift100`): the eastern, propagating tip of the Great Rift, a graben staircase climbing east from the
Oidong Valley toward the Siphon Pits between the Outer Wall (south, 8-13 km) and the walls over the Stalker Gate (north). Its
theme is **a rift still opening, with hot water in it**: the floor steps up in fault benches, a median horst splits it into
two grabens, the opening is greatest at the east end where the ground is pulled apart into open fissures, and hot water
comes up wherever a fault gives it a way: sinter terraces, boiling mineral lakes, geysers. Five zones, five stations.

**The design is Gemini's** (the model's sculpt, `tools/scale-model/smodel/se_provinces.py` `build_high_rift_terrain`, its
docstring; the region's notes in `model/src/51-region-store.js`; Gemini's sound brief, `NEW-BIOMES-SOUND-DESIGN-BRIEF.md`,
not on any branch, quoted to this session by the coordinator, 2026-11-03). **This plan keeps Gemini's zone names, heights and
lakes**, places each station on the carved 5.1 ground, and adds what a biome kit needs: the rock, the water, the life, the
hazards, the sound, and the core it takes. The owner remembers the region as **"singing crystals"**: the Singing Gjár's
fissures and the crystal that lines them are a station of their own (5), and the singing is written as data for `core/audio`
(section 8).

**Status: plan (2026-11-03) and a first pass of all five stations, built in the cloud on `claude/highrift-cloud`: software-GL `--assert` OK on each; the GPU pass is the coordinator's (`KNOWN_ISSUES.md`).** Every name coined here is *proposed*; nothing
in `LORE.md` or the model is changed. Look decisions for the owner are in section 11.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/highrift/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`, `INDEX.md`) |
| Pages | `dist/highrift.html` (station 1, the Caldron and the Opaline Cataract), `--station mirror`, `--station wedge`, `--station coulee`, `--station gjar` -> `dist/highrift-<name>.html` |
| Object | `HRIFT` (`SITES`, `SPECIES`, `PLANTS`, `SOUND`, `build`, `plantOfItem`), on the `BIOME-API.md` contract |
| Read in place | `biomes/hearths` (the heat-eaters on every vent's ground: stations 1, 2, 4, 5); `biomes/oidong` (the high country's cushions, snow lotus and sky poppies, `OIDONG.buildHigh`: stations 3 and 5); nothing copied |
| Its own flora | the opal cane, the bead cap, the verdigris wort, the steam heath, the rift larch (section 5) |
| Out of scope | the people's camps and holds (published as sites, section 7); the fauna (`kits/fauna`); Lake Cinnabar's own page (section 4, owed); the open world's cut of the region |

It is a new biome, so it goes in the gallery when it first reaches `main` (not published from this branch).

## 1. The ground (scale model 5.1, surveyed 2026-11-03)

Surveyed from `tools/scale-model/model/data` through `smodel/page.py` (5.1 canvas, 1821x1723, 2 km a pixel). Gemini's sculpt
is written in old-canvas px (1549x1393); **5.1 px = old + (272, 330)**. World metres (the geology's frame, `kits/resources/GEOLOGY.md`):
`x = 5.1 px x 2000`, `z = 5.1 py x 2000`.

**The polygon**: 21 points, **85,800 km²** (the brief's 86,000), 5.1 px 1294-1626 by 1610-1704. Height p5/median/p95
**2,869 / 4,033 / 11,465 m** (the p95 is the Outer Wall inside the polygon's south edge). Rain p5/median/p95 **0 / 220 / 439 mm**
(the 0 is the airless wall). Classes (km²): ET 18,536, **O 16,432** (the Outer Wall), Dsc 10,672, Dsb 8,292, HF 6,308, Dfb 5,236,
EF 4,604, Cfb 4,356, HT 4,172, Csb 3,420, Dwc 2,260, **WH 856** (the three lakes), Dfc 652, BSk 4. So the habitable rift is a
trough 40-70 km wide inside a polygon a third of which is wall.

**The cross-sections** (old-canvas rows, every 20 km west to east): along the north graben (old y 1305) the floor holds
**2,866-3,114 m** from old x 1130 to 1220, with the wall at 10-13 km to its west and 7.6 km where it pinches east of Cinnabar;
across the middle (old y 1329) the horst stands at **3,760-4,225 m** from old x 1130 to 1220; along the south graben (old y 1353)
**3,013-3,348 m** from old x 1110 to 1200, then the Outer Wall (5-11 km). North-south at old x 1160: the north wall (9.4 km),
the Mirror Graben (2,867-3,031), the horst (3,808-4,123), the Coulee (3,153-3,173), the Outer Wall (8-12.8 km), each step 6-8 km
across on the model.

### The five zones, as carved

| Zone (Gemini's name) | Old px band | Model heights | What the sculpt does |
|---|---|---|---|
| **1. The Opaline Sinter Staircase**, with **the Caldron Pool** | x 1022-1115 | 2,110-2,750 m in five arcuate rimstone steps of ~128 m; the Caldron **2,580 m** (`WH`) at old 1082,1331 | opens west into the Oidong Valley |
| **2. The North Mirror Graben**, with **Lake Verdigris** and **Lake Cinnabar** | x 1115-1255, y ~1305 | floor 2,860 -> 3,180 m east; Verdigris **2,880 m** at old 1158,1305.5, Cinnabar **3,120 m** at old 1220,1304.5 | the graben's walls are "hematitic fault-mirrors" (the docstring) |
| **3. The Dorsal Wedge** | x 1108-1255, y ~1329 | crest 3,850-4,250 m (3,980 + 180 sin + 95 noise) | a median whaleback horst between the two grabens |
| **4. The South Fire-and-Ice Coulee** | x 1115-1255, y ~1353 | floor 3,040 -> 3,430 m east | the south graben, under the Outer Wall |
| **5. The Singing Gjár** | x 1250-1354 | plateau 3,520 -> 4,260 m east; eight fissures 310 m deep | eight en-echelon NNE-SSW tension fissures at old x 1258, 1271, 1284, 1297, 1309, 1321, 1333, 1344 (y 1286-1348), joining the Siphon Pits |

### The stations: placed on the carved ground

Each page is a **5.2 km ideal type** (R 2,600 m, as Oidong's), under three model pixels, so it takes the model's numbers,
not its pixels. Pressure is 1.6 atm x e^(-h/8 km), as every plan.

| Station | 5.1 px (old) | World (m) | Ground | Climate (mean, warm/cold month, night low) | What is there on the model |
|---|---|---|---|---|---|
| **1. The Caldron** (`dist/highrift.html`) | **1358,1661** (1086,1331) | 2,716,000, 3,322,000 | the pool **2,580 m**; the cataract's lip **2,863 m**; the first sinter steps below the outlet 2,525 -> 2,479 m | WH/Cfb, 361-439 mm, +7..+10 (20/-6), 1.11-1.16 atm | **Verdigris Beck** (`r_hr_verdigris`, tungang tongue, frozen name) holds its bed at 2,863 m through a pinch where an Outer Wall spur closes the graben, then drops **283 m** at 5.1 px 1361 -> 1354 into the Caldron (points 58-60): **the Opaline Cataract**. **Brant-Fell Gill** (`r_hr_jokulhlaup`) comes into the same pool from the south-east (2,617 -> 2,580 m, points 36-40). The beck leaves south-west down the staircase (2,525 -> 2,297 m at Oidong's edge). Vent 88 (`geyser`) is on the staircase 32 km west (5.1 px 1340,1662) |
| **2. The Mirror** (`--station mirror`) | **1430,1630** (1158,1300) | 2,860,000, 3,260,000 | Lake Verdigris **2,880 m**; the shore 2,880-2,900; the north wall to 3,360 within 6 km and 6.7 km within 14 | Dfb (WH on the lake), 439 mm, **+12 (25/-1)**, highs +35, night -12, 1.12 atm: **the mildest ground in the region** | vent 89 (`geyser`, floor 2,864 m) at 5.1 px 1432,1636: **in the lake**, 8 km south of the page's centre: a sublacustrine vent, the lake's boiling patch. The beck enters from the east (2,970 -> 2,890, point 37-38) |
| **3. The Dorsal Wedge** (`--station wedge`) | **1457,1660** (1185,1330) | 2,914,000, 3,320,000 | the crest **4,163-4,236 m** within 6 km; 3,913 within 14 km: a broad whaleback | **ET**, 220 mm, 0 (13/-13), 0.95 atm | the views: 1,200 m down north to the Mirror Graben (3,010 m), 950 m down south to the Coulee (3,240 m) |
| **4. The Coulee** (`--station coulee`) | **1452,1684** (1180,1354) | 2,904,000, 3,368,000 | the floor **3,217-3,511 m** within 6 km; the Outer Wall to 6.1 km within 14 and to 10.2 km at the Gill's head | **Dwc**, 345 mm, +9 (23/-3), highs +34, night -15, 1.07 atm | **Brant-Fell Gill** runs west through the page (bed 3,250 at 5.1 px 1455, 3,236 at 1451); its head is a glacier outburst gorge off the Outer Wall at 5.1 px 1504,1684 (10,212 m -> 3,564 m in 30 km). Vent 90 (`geyser`, floor 3,247 m) at 5.1 px 1454,1684: **4 km east of the centre, on the page's edge** |
| **5. The Singing Gjár** (`--station gjar`) | **1572,1643** (1300,1313) | 3,144,000, 3,286,000 | the plateau **3,640-3,953 m** within 6 km | Dsb/ET, 220 mm, +2 (15/-11), highs +26, night -21, 1.01 atm | fissure 4 (old x 1297: 5.1 x ~1569 at this row) runs through the page NNE-SSW; vent 91 (`geyser`, floor 3,896 m) at 5.1 px 1574,1642, 4.5 km ENE; **Verdigris Beck rises here** (5.1 px 1568,1640, 3,628 m): the region's one river is born in the fissures |

**The gjár at page scale.** The model's fissures are 2-7 km wide (1.1-3.4 px) and 310 m deep, 24-26 km apart: at 2 km a cell
they are the fissures' envelopes. The page draws **one master gjá** through the centre, ~310 m deep and 300-600 m wide at the
lip (its walls stepped where blocks have dropped), and on the plateau beside it **a swarm of narrow en-echelon tension
fissures**, 1-40 m wide and 2-60 m deep, as Iceland's Þingvellir is: the fissures that sing (section 8).

### On the model: notes for Gemini (nothing the kit waits on)

- `tools/scale-model/README.md` Part III says High Rift is **135,048 km²** stepping down from an **8,500 m** wall into benches at
  **+1,400-2,800 m**; the sculpt and the polygon say 85,800 km² and 2,110-4,260 m. The code is followed here.
- The sound brief gives the staircase as "+2,250 -> +3,100 -> +4,150 m": the three levels are the Caldron's steps, the grabens
  and the horst, and agree with the code.
- Verdigris Beck's bed runs level at 2,863 m from 5.1 px 1395 to 1361 over ground classed `O`/`HF`/`EF` (the Outer Wall's toe):
  the trough is pinched between Lake Verdigris and the Caldron, so the beck flows through a gorge the heights do not cut. The
  page draws the gorge's mouth at the cataract's lip; the model's 34 km gorge is owed to the model.
- Both rivers have no `to` (`REBAKE-PLAN.md`, R0): Verdigris Beck ends in Oidong's lakes, Brant-Fell Gill in the Caldron.
- Vents 88-91 are `geyser` vents with floors under or near the lakes; vent 88's floor (3,189 m) is 600 m over the staircase's
  ground at its px. The kit draws each as a geyser on its station's ground.

## 2. The rock (the rebaked geology, `kits/resources/data/geology.json`, 4 km cells)

5,400 cells: crystalline 2,282 (the Outer Wall and the north wall: the gneiss basement), sedimentary 2,026 (the rift fill on
the floors and the horst), **granite 744** (the staircase's west end, 33% of Oidong next door), volcanic 282 (the Singing Gjár
and the vents), water 57, basalt 7, quartzite 2. No impact province, no carbonate (limestone mean 5.8: the rift fill's thin
lake limestones), no ultramafic. The layers: iron everywhere (mean 131; 180 on the Coulee), **copper 210, gold 140, silver 150,
sulfur 164 and tuff 112 at the gjár** (an epithermal field: the hydrothermal veins of a rift's hot water), saltpeter (139), a
little marble and skarn at the granite's contacts.

| Where | Rock (what the kit draws) | `KSTRATA` | Ground (`KGROUND` layers, five at most a station) |
|---|---|---|---|
| The grabens' walls, the horst's flanks | **the rift fill**: basement gneiss at the foot of the big scarps, fan conglomerates, red beds, lake beds, a volcanic suite | **`rift`** (the suite exists: `rift-basement`, `rift-fan`, `rift-redbeds`, `rift-lake`, `rift-volcanic`), dipping away from each graben's axis (the tilted blocks of a rift: dip ~6° toward the master fault) | `rock.badland.bedded` on the bedded cuts, `rock.wet.dark` where spray reaches |
| **The fault mirrors** (station 2) | slickensided fault planes polished by the fault's slip and coated in **specular hematite**: steel-grey to black with a mirror sheen and red-brown hematite stains, grooved down the dip | the fault plane is a `KRELIEF.scarp` face; the bedded rock behind it is `rift` | **owed**: `rock.hematite.mirror` (no library set: prompt in `PROMPTS-NEEDED.md` section 39, numbered 32 before 2026-11-08; the set is in the library since the owner's 2026-11-03 batch); until it comes the face draws `rock.basalt.oxidised` at a low roughness |
| The sinter (stations 1, 2, 5's vent) | **opaline silica sinter** (amorphous opal-A, the geyser's own deposit): grey-white rimstone terraces, beaded geyserite at the vents, bands of thermophile mats on the run-off; old sinter goes chalky and cracks | none (sinter is drawn, not bedded) | `ground.sinter`, `stone.geyserite`, `ground.mat.thermal`, `ground.travertine.white` for the cooled, older terraces |
| **The acid ground** (stations 2's lake shore, the vents) | acid-sulfate alteration: bleached white clays, yellow sulfur, iron-red gossan, copper-blue and green crusts (chalcanthite, brochantite) round Verdigris; red at Cinnabar | `rift`'s volcanic suite carries `altered` and `copper` beds | `ground.travertine.acid`, `ground.sulphur`, `rock.gossan`, `rock.malachite`, `rock.turquoise.vein` |
| **The coulee** (station 4) | an old blocky andesite-dacite **coulée**: thick short lava lobes with steep flow fronts and ogive ridges, frost-shattered, its top a block field; the Gill's outburst floods cut through it | `rift-volcanic` on the gorge's walls | `ground.lava.aa` (the block-field top, weathered), `rock.basalt.flowbanded`, `ground.wadi.cobble` (the flood bed), `ice.aufeis` (the Gill's winter ice) |
| **The gjár** (station 5) | the plateau's welded tuff and basalt over the rift fill, pulled apart; the fissure walls are lined with **epithermal vein silica**: chalcedony and opal crusts, **bladed quartz** (lattice-bladed silica after calcite, a classic of the boiling zone), amethyst druse in the vugs, and sulfur where steam still rises | `rift-volcanic` | `rock.tuff`, `rock.basalt.vesicular`, `rock.quartz.vein`, `stone.geode.druze` (the vugs), `ground.sulphur` at the vent |
| The Outer Wall and the north wall (far field only) | gneiss and granite, glaciers on the high wall | none at the far field's range | KFAR colours |

## 3. Water

| Water | Where | What the kit draws |
|---|---|---|
| **The Caldron Pool** (2,580 m) | station 1 | a hot pool 3-4 km across on the model; on the page a **WATER.still** ~600 m across in a sinter bowl, turquoise at depth through milk-white over the sinter shelves, steaming; **no surf, no breakers** (still water); the **mirror switch** on it, off at load |
| **The Opaline Cataract** | station 1 | Verdigris Beck's 283 m fall in tiers over sinter: **WATER.fall** curtains on four tiers (the brief's "180 m multi-tiered", the tallest ~60 m) with sinter-rimmed pools between them (**WATER.terraces**, ext/53), the plunge pool's spray `spray:'drop'`, `drawFall({plungeR, footK})` |
| **Brant-Fell Gill's plume** | station 1 | the Gill brings grey glacial flour into the turquoise pool: **`tintFlow`** (ext/61, the plume that moves), the BACKPORT row's "a river meeting a lake" |
| **The staircase** | station 1 | below the outlet, the beck spills over rimstone terraces: **WATER.terraces** (the pools on each step, the rims of sinter) |
| **Lake Verdigris** (2,880 m) | station 2 | an acid lake, **turquoise-green** (copper sulfate in acid water, as Kawah Ijen's turquoise or Dallol's greens), milky near the boiling patch; `surf:false, breakers:false`; the mirror switch, off at load. **The boiling patch** over vent 89: steam and an upwelling disc (KTHERM's field over the water) |
| **Lake Cinnabar** (3,120 m) | owed | a red lake (iron and mercury sulfides, red algae): a sixth page or a second view of station 2 when the owner wants it |
| **The geysers** (vents 88-91) | stations 1, 2 (on the shore), 4 and 5 | **`WATER.geyser`** (`core/water/geyser/52`) on a sinter cone, its cycle on the host clock |
| **Brant-Fell Gill** | station 4 | a braided outburst channel in the coulee: a **WATER.flow** low in a wide cobble bed (most of the year), the bed's scour by `KSCOUR` (`41-core-scour.js`, the megaflood's channel: the Gill is named for its jökulhlaups) owed after the first pass, aufeis in winter (owed) |
| **The fissure water** | station 5 | Verdigris Beck's source: meltwater and warm seepage pooling in the master gjá's floor, **gin-clear** (Silfra's water) over the dropped blocks: a **WATER.still** in the gjá's bottom, then the beck's first trickle out of it (WATER.flow) |

Rain: 220-439 mm. The weather is `cold` everywhere; the grabens are not dry (their hot water is groundwater rising on the
faults, fed from the Outer Wall's glaciers), the horst and the gjár are semi-arid tundra.

## 4. The stations

1. **The Caldron and the Opaline Cataract** (`dist/highrift.html`; 5.1 px 1358,1661; 2,580 m). The pool in its sinter bowl;
   the cataract coming down from the pinch's gorge mouth in four tiers on the north-east side; the Gill coming in from the
   south-east with its grey plume; the outlet on the south-west spilling over the first rimstone steps; a geyser on the
   steps (vent 88's kind, brought onto the page: the station is an ideal type of zone 1); steam over everything. **Flora:**
   the heat-eaters on the hot ground round the geyser and the pool's vents (HEARTH: ember mat 60-95 °C, coal moss, hearth
   trees 25-60 °C, read in place), the opal cane in the warm run-off, the bead cap on the sinter, the steam heath on the warm
   margins, tussock (`card.ichu`) on the cold ground. **Hazards:** boiling water and thin sinter crust (`KHAZ` `hot-ground`),
   the geyser's eruption, the cataract's spray icing the steps in winter. **Look:** white, turquoise and steam; orange and
   green mat bands on the run-off; the wall's spur dark over it.
2. **The Mirror** (`--station mirror`; 5.1 px 1430,1630; 2,880 m). Lake Verdigris's north shore under the **fault mirror**: the
   graben's master fault, a polished plane of hematite 150-300 m high with the bedded rift fill above it, running the length of
   the page, its foot in talus. The turquoise acid lake, its boiling patch steaming 1-2 km out, a geyser on the shore's sinter
   apron, acid-altered white and yellow ground round the hot springs. **The mildest place in the region** (Dfb, +12 °C,
   439 mm): **rift larch** parkland on the fans under the fault (the one tree stand in the region), meadows of tussock and
   verdigris wort, the heat-eaters on the vent grounds. **Hazards:** the acid water and the acid springs (`acid`), hot ground,
   rockfall under the mirror. **Look:** the mirror catching the sun as a sheet of steel; turquoise water; larch gold in autumn.
3. **The Dorsal Wedge** (`--station wedge`; 5.1 px 1457,1660; 4,200 m). The horst's crest: a broad whaleback of tilted rift-fill
   beds, frost-shattered, with tors where a hard bed caps it, patterned ground in the hollows, a tarn. Both grabens lie below,
   1-1.2 km down: the steam of Lake Verdigris to the north and the Coulee's block field to the south, the Outer Wall's glaciers
   beyond. **Flora:** the cold desert, read in place from Oidong (`OIDONG.buildHigh`: cushions, the snow lotus among the stones,
   sky poppies at the tarn), tussock in the lee. **Hazards:** cold, wind, the edges. **Look:** a high bare stage in thin
   (0.95 atm) light, the rift's two floors either side.
4. **The Coulee** (`--station coulee`; 5.1 px 1452,1684; 3,240 m). Fire and ice: the old coulée's lobes and flow fronts, a
   block field on top, cut by Brant-Fell Gill's outburst channel (a scoured cobble bed 300-600 m wide with a braided stream in
   it, boulder bars, scour holes, aufeis); a geyser on a sinter cone where the channel meets the warm ground (vent 90, at the
   page's east edge); the Outer Wall rising south to the glaciers that feed the Gill. **Flora:** steam heath and the
   heat-eaters at the vent, tussock and cushions on the lobes, nothing in the flood bed but the opal cane where warm water
   seeps out of the coulee's foot. **Hazards:** the outburst flood (`flood`: the Gill's bed is the danger zone), hot ground at
   the vent, the block field's ankle-breakers. **Look:** black-brown lava, grey cobble, white ice, steam.
5. **The Singing Gjár** (`--station gjar`; 5.1 px 1572,1643; 3,700 m). The plateau pulled apart: the master gjá through the
   centre, its walls stepped, dropped blocks in its floor, **gin-clear water** in its bottom where Verdigris Beck rises; the
   swarm of narrow en-echelon fissures across the plateau beside it, each lined with **crystal**: chalcedony and opal crusts,
   bladed quartz in combs standing out of the walls, amethyst vugs; a geyser and steaming ground at the swarm's north-east end
   (vent 91), sulfur on its sinter. **Flora:** cushions and the snow lotus on the plateau (Oidong's, in place), the
   heat-eaters at the vent, moss and opal cane in the fissures' warm, still air. **Hazards:** the fissures (`fall`), hot ground
   at the vent. **Sound:** the singing (section 8). **Look:** a grey-brown plateau with black slots in it, and in the slots,
   white and violet crystal.

## 5. The flora

**The rule** (the rift rim's and the Hearths' trends, `biomes/hearths/PLAN.md` section "The trends it extends"): native life
clusters on geology's energy, and where Earth life fails native life is the whole flora. High Rift is high (2.6-4.2 km) and
cold, but its faults leak heat and water: so **every hot spring is a native island**, and the Earth life the Ancients brought
holds only the mild Mirror Graben. Each own species answers one thing the rift gives: **silica** (the sinter's dissolved
opal: armour), **copper** (the acid ground's metals: pigment and poison), **steam** (the warm margins: water from the air).

| Key | Name (*proposed*) | Where | How it is built | Lineage |
|---|---|---|---|---|
| `opalcane` | **Opal cane** | the warm run-off (30-70 °C), the fissures' warm air | clumps of hollow jointed canes 1-2.5 m, their skin a skeleton of opal silica drawn from the water: grey-white, translucent at the nodes, a pearl sheen; the dead canes stand white for years | native; a reed-form answer to silica-rich hot water (the sinter's diatoms writ large) |
| `beadcap` | **Bead cap** | on the sinter at 25-50 °C, in rings round the vents | small fungoid knobs 5-30 cm, each capped with a bead of geyserite it grows itself: they read as the sinter's own beading until you see the stalks (`BIO.fung`) | native, the Hearths' kin (heat-eater) |
| `verdwort` | **Verdigris wort** | acid, copper-rich ground (station 2's shore, the gjár's vent) | low rosettes of thick blue-green leaves crusted with copper salts, a copper accumulator (Earth's *Haumaniastrum* is the model); a single blue-white flower spike | native |
| `steamheath` | **Steam heath** | the warm margins (10-25 °C ground) and the spray zone | a dense low heath, its twigs hung with condensed droplets, combing the steam (`card.steamcomb`) | native |
| `riftlarch` | **Rift larch** | the Mirror Graben's fans (Dfb, the one tree stand; **off by default until nhighlands holds its crowns**, `KNOWN_ISSUES.md`) | an Earth larch gone wild at 2.9 km, short and flag-crowned, gold in autumn (`card.larch`, `bark.larch`) | Earth, brought by the Ancients (the only tree in the region) |
| (read in place) | **HEARTH**: the hearth tree, ember mat, coal moss, stoker, tallow bead | every vent's ground, by `KTHERM`'s temperature | `biomes/hearths`' own builders, `rim` dress | native, the Hearths' |
| (read in place) | **OIDONG** high country: cushions, the snow lotus, sky poppies | the horst, the gjár plateau, the coulee's lobes | `OIDONG.buildHigh` | Oidong's |
| (card) | tussock | the cold ground everywhere | `card.ichu` / `card.stipa` | the shared grass |

**Not taken:** the Rift's own species (`biomes/rift`): the Rift proper is 500 km west and 3-4 km lower; its cloud forest has no
ground here. Siphon Pits' woolly siphon and siphon felt (`biomes/siphon-pits/PLAN.md` section 4) belong to the maar floors east;
**the gjár's vent is where they would meet** (an exchange for when Siphon Pits is built, section 6).

## 6. Exchanges with the neighbouring kits

| Neighbour | Direction | What |
|---|---|---|
| **Oidong** (`biomes/oidong`, west) | reads | `OIDONG.buildHigh` (cushions, snow lotus, sky poppies) on stations 3 and 5, in place (station.json `kin`). The staircase opens into Oidong's lakes: Oidong's valley floor is the far field west of station 1 |
| **The Hearths** (`biomes/hearths`) | reads | `HEARTH.layout` on every vent's ground, `rim` dress (High Rift's vents are on 1.0-1.16 atm ground, between Oidong's cold rim and the Rift rim) |
| **Siphon Pits** (east, not built) | vends, later | the opal cane and the bead cap to its pit floors' hot ground; it would vend its woolly siphon to the gjár's vent |
| **Stalker Gate**, **Mid Basin** (north, not planned) | none yet | the north wall is the far field |
| **kits/crops** | none | nothing is farmed in the region (section 7) |
| **kits/resources** | publishes | the nodes the geology gives (copper, gold, silver, sulfur, iron) are the resource kit's; the kit marks the gjár's veins and the acid ground as sites |
| **kits/fauna** | for the fauna kit | the Siphon Pits plan's woolly ghaunt-ox would summer on the Mirror's meadows and the flenser-hound hunt the gjár's edges: candidates, not placed |

## 7. People

No settlement is on the model's list inside the polygon. The rivers' names are in **the tungang tongue** (Verdigris Beck,
Brant-Fell Gill): the High Rift was **the lost east** of the Tungangs' Rift line (`LORE.md` §6.1, `biomes/riftrim/PLAN.md`
section 6), where the crews were wiped out in the tunnel wars and the Fellgangs fled up onto the fells. *Proposed* (the
owner's call): the region is **Fellgang summer country**, walked but not held: cairns on the horst, a ruined shieling on the
Mirror's fans, a bathing pool walled at the Caldron's warm edge, **the gjár as a place they go to hear the singing and leave
offerings in the vugs**. Published as sites (data) for the settlement plan; nothing is built.

## 8. Sound (for `core/audio`: written as data, not yet heard)

**There is no `core/audio` yet** (checked 2026-11-03: no `core/audio/` folder, no WebAudio in core). The kit therefore writes
each station's sound as **records** (`HRIFT.SOUND`, `[G data]`, positions in page metres), which the page exports, so a core
module (and Godot's AudioStreamPlayer3D) can play them when it exists. Gemini's brief is followed; the singing is worked
from physics so it can be tuned:

| Source | Station | Record (what `core/audio` would play) |
|---|---|---|
| The Opaline Cataract | 1 | broadband roar (pink noise, 200-4,000 Hz), 4 tiers as separate emitters; heavy spray hiss; a 12-20 Hz ground tremor at the plunge |
| Spray on hot rock | 1, 4 | sizzle bursts (high-passed noise, 3-8 kHz) where the spray field meets ground over 60 °C |
| The boiling pools and Lake Verdigris's patch | 1, 2 | simmer (granular bubbling, 80-600 Hz), spits and steam bursts at random 2-15 s |
| The geysers | 1, 2, 4, 5 | a surge and roar through the eruption (the cycle is `WATER.geyser`'s), then dripping |
| The sinter terraces' water | 1 | trickle and lap (bandpassed noise 1-3 kHz), one emitter a terrace |
| **The master gjá** | 5 | **infrasound and drone**: a 310 m slot closed at one end has a fundamental of c / 4L ≈ 0.26 Hz (c ≈ 325 m/s at -10 °C): felt, not heard, as the "ground tremor"; its audible modes are the wind's edge tone across the lip |
| **The singing fissures** | 5 | **the organ pipes**: narrow tension cracks and their pockets 1.4-2.7 m deep resonate at **30-60 Hz** (c / 4L), each crack its own pitch; a resonant band-pass (Q 8-20) on wind noise, gain on the wind's speed across the crack (the crack's bearing against the wind) |
| **The singing crystals** | 5 | the bladed quartz combs and chalcedony plates stand in the wind: each blade sheds vortices at **f ≈ 0.2 v / d** (Strouhal) for a blade d thick in a wind v, so a 1-5 cm blade in a 10-15 m/s wind sings at **40-300 Hz**, the thinner ones higher; a bank of narrow band-passes on the wind, shimmering as the gusts move |

**The geology holds this up.** Open tension fissures over a boiling hydrothermal system fill with epithermal vein silica:
chalcedony, opal, and lattice-bladed quartz (silica replacing bladed calcite that grew where the water boiled), with amethyst
in the vugs. The bake puts copper, gold, silver and sulfur at the gjár (section 2): an epithermal field, which is exactly where
that silica grows. Erosion and the rift's opening have exposed the vein walls to the wind. So the singing crystals are the
fissures' own vein linings, and they sing in the wind.

## 9. Hazards (`core/hazard`, `KHAZ`)

| Kind | Where |
|---|---|
| `hot-ground` | every vent's disc (KTHERM over 45 °C), the sinter crust over the pools, the boiling patch |
| `scald` (water) | the Caldron's hot shelves, the terraces' pools near the vent, Lake Verdigris's patch |
| `acid` | Lake Verdigris and the acid springs on station 2 |
| `fall` | the cataract's lip, the fault mirror's foot (rockfall), the gjá and the fissures |
| `flood` | Brant-Fell Gill's bed (the outburst) |
| cold | the horst and the gjár (ET, nights to -21 °C) |

## 10. Core adoption (written before the first fragment, 2026-11-03)

Start from **`biomes/oidong`** (pair 6, the newest neighbour on the full universal set: its stage, its station machinery with
`base` and `kin`, its passes station for the cold ground, its hearths station for `KTHERM` and the heat-eaters) and the
geysers and terraces of core/water. The modules every station takes, and for each it does not, why:

| Module | Takes | For |
|---|---|---|
| `core/biome` | `10`, `20` (`BIO.INDEX_ITEMS`, LOD merge/fade/cull), `30`, `31b`, **`31j` (`BIO.flareJoin`: the rift larch's limbs)**, `32`, `33` (`BIO.fung`: the bead cap, the Hearths' parts), `34` (impostors: the larch on station 2), `35` (wind; the Hearths' `breath`), `37` (the clock, `KTRAPS.cycle`, as Oidong), `39` (the Hearths' lean), `40`, **`41` (the field contract)**, `42`/`43`, `44` | every species on the core's builders |
| `core/rand`, `core/tags`, `core/space` | `KRAND`, `50`/`52`/`53`, `KSPACE` | every placement cell; every record |
| `core/terrain` | `35` + shade (**`KSTRATA` `rift`** on the graben walls, the horst, the coulee's gorge and the gjá's walls), **`43` (`KGROUND`)**, **`44` + draw (`KFAR`)**, **`45` + shade (`KHORIZON`)**, **`47` (`KTHERM`)** on every vent; `41` (`KSCOUR`) for the Gill's bed (station 4) is **owed**: the first pass carves the channel, its bars and its stream bed in the stage, without KSCOUR's potholes, dry falls and current ripples | the ground, the rock, the far country, the heat |
| `core/water` | `20`, `21`, `22`, `50`, `51`; ext `53`/`53b` (**the terraces**), `56`, `57` (audit), **`58` (`WATER.mirrorSwitch`, off at load)**, `60` (fields), **`61` (the plume, `tintFlow`: the Gill's flour in the Caldron)**; **`geyser/52`, `52b`** (`WATER.geyser`) | every water surface; **still water `surf:false, breakers:false`** (the foam fix) |
| `core/atmos` | the core, presets, particles (steam), export, waves, skylight, `bindHost`, the shared sky (`skyBiome`), `bindWeather`, height fog, rain cover, lightning, snow cover | the sky, the light, the steam |
| `core/hazard` | `KHAZ` (`20`, `21` flow) | section 9 |
| `core/shadow` | **`KSHADOW`, attached but off at load** (the owner, 2026-11-03): `?shadow=1` turns it on | the sun's shadows when asked |
| `core/host` | `FULL` + polytool | the page shell, the probe |
| `core/materials` | `record` and the pack (`materials.json`, `tools/textures/pack.py biomes/highrift`) | every library set (section 2) |
| `core/export` | `07`, `09` | the krator-world container |

**Not taken, and why:** `KHOOK.warp` (an empty slot for a future `core/anomaly`, not built: nothing to warp here);
`KKARST`/`KCAVERN` (**no caves**: `KARST-SITES-5.1.md` has no High Rift site, the region has no carbonate, and the gjár are
open fissures, drawn as ground); `KLAVA` (the coulee is old and its lobes are drawn as relief, not flowed: a bake is owed if
the owner wants its fronts from a flow, section 11); `KSTACKS` (no pillars: the horst's tors are small and drawn as stones);
`core/mask`, `core/city`, `core/hamlet`, `core/camp`, `core/simulation`, `core/furnish` (no settlement); `33b` (no bamboo);
`38-core-fire` (nothing burns: tundra and sinter); `core/audio` (does not exist: section 8).

`tools/check_core_use.py` runs on every station before it is called done; `tools/check_port.py` before every build.

## 11. For the owner's eye (look decisions taken in the first pass)

1. **Station 1 is an ideal type of zone 1**: the Caldron, the cataract and the first staircase steps with a geyser on them in one
   5 km page, though on the model vent 88 is 32 km west of the pool. Alternatively the staircase and its geyser could be a
   sixth page.
2. **The cataract is four tiers totalling ~180 m** (Gemini's brief), not the model's 283 m drop over 8 km.
3. **Lake Verdigris is turquoise-green acid water**; Lake Cinnabar (red) is owed as a sixth page or a view.
4. **The fault mirror is steel-grey hematite** with red-brown stains. Its texture (`rock.hematite.mirror`) is owed: the page
   draws oxidised basalt at a low roughness until it comes.
5. **The gjá is drawn at Þingvellir's character, not the model's width**: one 310 m-deep master gjá a few hundred metres wide,
   plus metre-scale singing fissures.
6. **The rift larch is the region's only tree** (an Earth larch, the Ancients'); everywhere else is native or bare.
7. **The singing is data only** (section 8) until `core/audio` exists: is a small core audio module wanted, or should it wait for
   the Godot port?
8. **KSHADOW is attached but off at load** on every page (`?shadow=1`), as the owner decided.
