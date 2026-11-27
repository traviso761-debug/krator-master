# shighlands: the upper stations (plan, 2026-10-23)

The kit draws the spiral cloud forest and the paramo above it: the temperate parts of the `s highlands` polygon. The
owner (2026-10-23): the polygon is mostly arctic only by the way it is drawn, but **the higher parts may need fleshing
out**. Two stations carry the spiral theme up the wall. The page as built stays station 1.

**Status (2026-11-09):** re-surveyed on map 5.1 (below); stations 2 and 3 built on the owner's go (2026-11-09: "do it now; then let's do station 2 + 3 plus the prompts").

## The ground (surveyed 2026-10-23)

| Band | km² | Air | Rain | Mean (warm/cold) | Climate |
|---|---|---|---|---|---|
| Under 2 km | 12.6k | 1.37 atm | ~890 mm | +18 (28/9) | Cfa, Csb, Cfb (the kit) |
| 2-3.5 km | 18.5k | 1.12 | ~550 mm | +10 (23/-3) | Dsb 46%, Dfb (the kit's paramo) |
| **3.5-5 km** | **26k** | 0.93 | ~530 mm | 0 (13/-13) | Dsc 49%, Dfc 24%, ET 13% |
| **5-9 km** | **29k** | 0.76 | ~280 mm | -9 (4/-22) | ET 79%, EF 18% |

## Station 2: the spiral conifers (3.5-5 km)

A subalpine forest where the conifers grow in spirals too: trunks twisted like rope (the Bristlecone's and the wind-twisted
pines' grain, taken to a rule), whorled branches climbing in a helix, cones in strict spirals made large and showy;
snowbeds lingering in the shade; the same handedness as the cloud forest, with the rare mirror tree.

## Station 3: the spiral fellfield and the ice (5-7 km)

Fellfield and glacier: cushion plants that grow as spiral domes, sorted-stone circles laid as spirals by frost (a ground
pattern, not a plant), coiled lichen rosettes, snail-shell rosettes in the scree, an icefall whose crevasses curve; the
Whorl Stone's theme carried onto a summit tor.

## Order

H0 sites from the model, prompts; H1 station 2; H2 station 3; verified and baselined; `kits/crops` `shighlands` gains a
`subalpine` zone.

## The re-survey on map 5.1 (Round 3, 68b6aa22b; 2026-11-09)

`python3 biomes/shighlands/survey/survey51.py` reads the 5.1 grids (`tools/scale-model/model/data/`) and the `s highlands`
polygon (`openworld/isle-demo/source/regions.json`, old canvas + (272, 330)). Pressure is 1.6 atm x e^(-h/8 km).

| Band | km² | Rain | Mean (warm/cold) | Classes |
|---|---|---|---|---|
| under 2 km | 26.3k | 486 mm | +18 (28/7) | Csa 29%, BSk 19, Cfa 18, BSh 14 |
| 2-3.5 km | 66.6k | 565 | +10 (22/-3) | Dsb 37, Cfa 19, BSk 11, Csa 10 |
| **3.5-5 km** | **50.5k** | 439 | +2 (15/-11) | Dsc 37, Dsb 23, ET 22, Dfc 9 |
| **5-9 km** | **33.9k** | 376 | -9 (4/-22) | ET 48, Dfc 35, EF 7 |

**Station 1 no longer matches its site.** At its old px (486,697; 5.1 px 758,1027) the ground is now 550 m, Af: the
hyperjungle's floor under Round 3's southern Inner Wall scarp. That scarp is one face about 3 km tall: from ~400 m at its foot
to a 3.5-3.9 km ET rim within 6 km (two model pixels), the Cfb band (the cloud forest) on the face between ~1.3 and ~2.4 km.
No 1.4 km rim over a cloud deck is left anywhere in the polygon (the search for Cfb/Cwb ground at 1.3-1.75 km with a drop below
850 m to the north finds only mid-face points, ~50 px east, with the face climbing on to 3 km behind them). The page's stage
(a rim at ~1.4 km, the paramo at 1.4-1.6 km) is therefore an ideal type 5.1 does not have: on 5.1 the cloud forest is a band on
the face and the paramo-like ground (ET, ~1.0 atm) is the rim's plateau at 3.5 km, which is where station 2 stands.
**Re-staged 2026-11-09 on the owner's word, option (b)** (KNOWN_ISSUES.md, "Station 1 re-staged on the 3 km face"). The options were: either (a) station 1 keeps its
ideal type and its sky site (old px 486,697) as a known divergence, or (b) its stage is rebuilt as a band of the 3 km face
(the deck at ~1.1 km below, the face rising past the map's south edge) and the paramo moves up to the rim. KNOWN_ISSUES.md
carries it.

**Station 2's site:** 5.1 px 762,1059 (old 490,729), 3,786 m, Dsc, 439 mm, +4 °C (17/-9), 1.00 atm; 30 km relief 3.4-4.8 km
(ET on the higher ground round it, Dsb below): the plateau just behind the scarp's rim, 64 km south of station 1's old site.
**Station 3's site:** 5.1 px 816,1058 (old 544,728), 5,208 m, ET, 957 mm, -5 °C (8/-18), 0.83 atm, rising east to 6.4 km
within 20 km (6,420 m at px 829,1058). The nearest EF is 66 km south-east (7.1 km, px 832,1081): the station's ice is a small
summit ice field and its icefall in a cirque (at ~6.2 km the warm month is near 0 °C), not the ice cap.

## Built (2026-11-09)

Both are `--station` pages on src/'s host (`stations/<name>/`, nhighlands' convention): each keeps the stage's contract (TERR,
CLOUD_Y, RAV, TOR, TARN, BOGS, the fields) so 84, 85, 89zw and 89zx run on them, and brings its own species, floor, sky site,
atmosphere and take. `python3 build.py --station conifers` -> `dist/shighlands-conifers.html`; `--station fellfield` ->
`dist/shighlands-fellfield.html`. What each draws, and what is owed: `stations/<name>/station.json` and KNOWN_ISSUES.md,
"Stations 2 and 3".

---

## Shumar: the western dry-plateau stations (plan, 2026-11-17)

Owner's brief (2026-11-17): scope **Shumar** (`LORE.md` §6.23; scale model 5.1 polygon `rmw5s3ktxgv0d`, 8,353 px = 33,412 km²,
centroid `5.1 px 742.5, 1174.6`) as stations of `biomes/shighlands`, and read them in place to dress `kits/shumari` (`kits/shumari/PLAN.md`).
Stations 1 to 3 cover the wet northern cloud-forest scarp (`Cfb`/`ET`), the subalpine conifer rim (`Dsc`) and the 5.2 km cirque ice (`ET`).
They do not yet draw the southern highlands' dry western rain-shadow bench (`Dsb`/`BSk`/`Dsc`), where Shumar sits between the SW lowlands
escarpment (Tallhouse at the foot, `px 683,1184`, 1,001 m), Greenstep (`Vrivolci`) to the south-west and Godthrone's dark ramp to the south-east.

### The Shumar ground on map 5.1 (`rmw5s3ktxgv0d`)

Sampled across all 8,353 pixels of `Shumar` (`tools/scale-model/model/data/`):

| Sub-zone | Share | Elevation | Air | Rain (median, p5-p95) | Temp mean (warm / cold; winter night) | Köppen |
|---|---|---|---|---|---|---|
| NW rim escarpment (`< 2,850 m`) | ~15% | 1,001-2,850 m | 1.12-1.41 atm | 510 mm (424-878) | +12 (+21 / +3; -3) | Cfa, Csb, Csa |
| **Mid-plateau & snowmelt gorges** (`2,850-3,650 m`) | **~66%** | median **3,301 m** | **1.06 atm** | **408 mm** (376-455) | **+6 °C** (+18 / -5; **-12 °C**) | **Dsb 56%**, Dfb 21%, Dsc 11%, BSk |
| **SE Ordeal ramp** (`3,650-4,797 m`) | **~19%** | 3,910-4,442 m (p99) | **0.92-0.98 atm** | **392 mm** (204-424) | **+1 °C** (+14 / -12; **-19 to -23 °C**) | Dfc 32%, Dsc, **ET** |

Earth analogues: the **Kars-Ardahan-Erzurum / Lake Van Armenian Highland** (`Dsb`/`Dsc`, ~420 mm/yr, dark basalt ashlar gorges like Kars and Ani),
**interior Dagestan** (Khunzakh's cliff-rimmed tableland), and **Bamyan / Pamir-Alay** (dry sage-and-bunchgrass plateau cut by snowmelt poplar-and-apricot canyons).
Air pressure on the bench is **1.06 atm** (Earth sea-level density): cold winter wind and summer drought, not hypoxia, govern life and fire.
Bedrock (`kits/resources/data/geology.json`): 88.7% sedimentary + limestone (mean 37.1) interbedded with columnar/vesicular basalt and 3.7% dark
impactite (mean 106.5); 0 Ancient-ruin cells; 16 perennial snowmelt canyon rivers (`rivers.json`: `r007 Bētun-Nārun` 604.8 m³/s, `r011 Dubnosriba`
422.8 m³/s, `r285 Nazāru-Nārun` 134.5 m³/s, `r286 Mīṣu-Nārun` 115.3 m³/s, `r304 Ṣōrun-Nārun` 95.9 m³/s, `r287 Qappu-Nārun` 68.9 m³/s).

### The spiral rule holds

Every plant on both stations carries `tags.spiral` (`whorl`, `twist`, `coil`, `shell`) and turns right-handed (`SHIGH.HAND = +1`), with
`1 / MIRROR_EVERY` (320) mirror-handed trees (`NOTES.md`, "One hand") — the botanical counterpart of the Shumari regimental mausolea's
right-handed spiral-fluted stone domes (`kits/shumari/PLAN.md` §2). No trees on cliff faces (`1 - cliff`).

### Station 4: `--station shumar` — the basalt gorge and dry plateau (3.1-3.35 km, Dsb)

- **Site:** `5.1 px 737,1201` (old `465,871`), **3,308 m, Dsb, 424 mm/yr, +7 °C (+20 / -6; summer high +27, winter night -13 °C), 1.06 atm**,
  on `r287 Qappu-Nārun` ("Crest-Keep River", 68.9 m³/s) just above its confluence with `r007 Bētun-Nārun` ("Hearth-House River", 604.8 m³/s,
  3,069 m at `px 731,1193`); 30 km relief 2,919-3,852 m. Also the natural plateau-rim site for Shumar's capital.
- **Stage (`stations/shumar/44s-host-land.js`, `89zw-host-water.js`):** No cloud deck (`CLOUD_Y` unset, as stations 2 and 3). A wind-swept
  ochre-olive `Dsb` loess-and-limestone bench at ~3,310 m split by a **240 m stepped canyon** whose walls alternate dark polygonal basalt risers
  and pale iron-stained limestone ledges (the natural *ablaq* quarry of the Shumari), dropping over colluvial gravel shelves and seep lines to
  `Qappu-Nārun` (`WATER.flow` with breakup `ext/56` and shore fields `ext/60`, trees kept out of the channel).
- **Species and floor (`stations/shumar/62-biome-shigh-shumar.js`):**
  - *Reused from `src/` and `conifers`:* scattered rimrock **rope pine** (`ropepine`, `twist`, `Dsb`/`Dsc`) and **coil juniper** (`coiljuniper`,
    `coil`) along the canyon lip; dry **swirl tussocks** + `card.ichu` bunchgrass sward on the bench; **spiral aloe**, **corkscrew albuca** and
    **corkscrew cereus** on sunny basalt ledges; **fiddlehead fern** (`coil`) on shaded canyon seep shelves.
  - *Three new dry-country species appended to `SHIGH.SPECIES`:*
    1. **Helix poplar** (`helixpoplar`, `twist`, riparian `Dsb`/`BSk`): tall fastigiate canyon-floor gallery tree (14-26 m, Kars/Bamyan poplar habit),
       pale grey-white furrowed bark wound in a gentle right-handed twist, ascending branches spiralling round the bole, golden-olive summer leaf
       turning bright gold by `?day=` (`harvest.wood`: straight canyon rafters and fuel).
    2. **Twist-apricot** (`whorlapricot`, `twist`, bench-edge & terrace `Dsb`/`Csb`): low gnarled stone-fruit tree (4-8 m) on sheltered canyon
       shelves, dark reddish twisted trunk, blossom/leaf clusters set in five-ranked whorls, wild ancestor of Shumar's `kits/crops` `apricot`
       (`harvest.edible`: `['apricots', 'sweet kernels']`, catalog fruit tag when wired).
    3. **Whorl-wormwood** (`spiralsage`, `whorl`, floor shrub `Dsb`/`BSk`/`Dsc`): knee-high silvery-grey aromatic steppe subshrub across the dry
       bench between the `ichu` hummocks (`card.sage` geometry-cut sprigs wound at the golden angle; `harvest.medicinal`: true, fuel tinder).
- **Acceptance views** (no apostrophes or colons): `The basalt gorge` (vista along `Qappu-Nārun` from the rimrock pines) and
  `Canyon floor by the poplars` (ground-level gravel bar, wet bank, helix poplars and twist-apricots under the dark basalt riser).

### Station 5: `--station ordeal` — the Ordeal ramp (4.3-4.5 km, ET / Dsc)

- **Site:** `5.1 px 782,1194` (old `510,864`), **4,426 m, ET (on the Dsc/Dfc seam at `px 778,1199`, 4,338 m), 235-329 mm/yr, -2 °C (+11 / -15;
  winter night -23 °C), 0.92 atm**; 30 km relief **3,392-9,548 m** — the bleak SE wind-scoured ramp climbing out of Shumar directly under
  Godthrone's 9.5 km dark titanium-basalt wall, where `-ko` initiates walk **the Ordeal (`Urudīru`)** (`LORE.md` §6.23).
- **Stage (`stations/ordeal/44s-host-land.js`):** Tilted freeze-thaw pavement of dark basalt and impactite slabs rising south-east toward
  Godthrone's silhouette (`89-host-sky.js` landmark), incised by a dry seasonal snowmelt gulch, lee snowbeds (`89-atmos-fx-snowcover.js`),
  frost-sorted stone spirals (`fellfield` pattern), and empty `core/tags` site records (`role: 'ordeal-way'`) where cairns and the Ordeal gate stand.
- **Species and floor (`stations/ordeal/62-biome-shigh-ordeal.js`):**
  - *Reused:* prostrate wind-combed **coil juniper** (`coiljuniper`, `coil`) in sheltered rock lees, **spiral cushion domes**, **snail rosettes**
    and **coiled crustose lichens** from `fellfield`, plus sparse `card.ichu` tufts.
  - *One new high-steppe plant:* **Thorn-whorl cushion** (`thornwhorl`, `whorl`, `ET`/`Dsc`/`BSk`): spiny hemispherical tragacanth/*Astragalus*
    cushion of the Armenian and Zagros high plateaus, armed with pale straw-ivory thorns radiating in Fibonacci spirals and small crimson-violet
    calyxes in the crown (`harvest.fuel`: resinous winter hearth fuel).
- **Acceptance views:** `Up the Ordeal ramp to Godthrone` (vista) and `Thorn whorls and sorted spirals` (ground-level).

### Core adoption and textures (Stations 4 and 5)

- **Core:** **Zero new core modules.** Both stations run on `biomes/shighlands/build.py` as it stands (`CORE_BIOME`, `KGROUND`, `KFAR`,
  `KHORIZON`, `KSHADOW`, `khost.FULL`, `ATMOS.skyBiome` + height fog + snowcover fx, and `CORE_WATER` `WATER.flow` + `ext/56,60` for `Qappu-Nārun`).
- **Library textures reused (`station.json` `"families"`, `"own": true`):** `rock.basalt.polygonal`, `rock.limestone.ironstained`,
  `ground.steppe`, `ground.puna`, `ground.gravel019`, `ground.fellfield.fines`, `bark.juniper`, `bark.rope`, `bark.silver` / `bark.alder.lichen`
  (helix poplar), `bark.gnarled` / `wood.gnarled` (twist-apricot), `needle.pine`, `needle.juniper`, `card.sage`, `card.ichu`,
  `card.rosette.snail`, `surface.cushion`.
- **Optional texture prompt** (`core/materials/PROMPTS-NEEDED.md` §59): `card.apricot.whorl` (blossom-and-leaf sprig sheet for `whorlapricot`;
  stand-in: `card.broadleaf` / `card.sage` tinted) if a dedicated stone-fruit blossom card is wanted.
- **Crops & plateau census (`kits/crops`, `core/simulation/PROPOSAL-SHUMAR.md`, `settlements/shumar/BUILD-OUT.md`):** `shighlands` gains `shumar` and `ordeal` zone records (`warmth`/`pressure`/`aridity` matching 3,300 m `Dsb` rainfed + canyon-irrigated:
  `emmer`, `dustmillet`, `frostoat`, `dust-lentil`, `helix-bean`, `frostroot`, `snowpotato`, `apricot`, `canyon-grape`, `stonepine`, `juniper`, `ichu`, `wallhemp`, `flax`,
  `woad`, `cave-madder`, `larch-bark`, `birch-tar`).

### Order

H3 `stations/shumar` (`--station shumar`, built & verified, read in place by `kits/shumari`'s `93b-bio-` band); H4 `stations/ordeal` (`--station ordeal`,
built & verified); H5 `kits/crops` `shighlands` `shumar`/`ordeal` zones + `node kits/crops/tests/test-crops.js` (`SM-Sim-1`).


