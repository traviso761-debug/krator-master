# Shroudhills Biome Kit — Plan (`biomes/shroudhills/`, Scale Model `5.1`)

**Shroudhills** (`id: "rmwetizlzivnz"`, renamed from `"Scoured hills"`, 2026-11-22; *Yonni-Zāg:* **`Shrūda-Khīltæ`**): the damp, mist-shrouded coastal-montane rainforest hill country (`53,852 km²` dry land + `6,332 km²` drowned coves) between `Yonni` (`346, 418`), `Battered Isle` (`435, 259`), and `Double Delta` / `Ria Sound` (`626, 140`). Homeland of the Twin-Born Spear-Queens of `Yonni` (`Sfīra-Kandētæ`, `kits/yonni/`), defined by **`80–85%` lush temperate-subtropical cloud rainforest** overloaded at `0.75 g` and `1.35–1.59 atm` with **`A + B + E + C` super-epiphyte architecture**—Paired *Sister-Cup* Cistern Sky-Ponds, Grafted "Second-Floor" Canopy Turf & Root-Hammocks, Lithophyte "Cloak-Tors" on storm-stripped granite crowns, and Chambered Myrmecophyte Drum-Galls tended by **cat-sized (`28–42 cm`) eusocial Shroud-Ant colonies** (*noted regional hazard: peaceful unless disturbed, implacable against territorial invaders*).

**Status: locked by owner (2026-11-22; `CROOK-RIA-DECISIONS.md` §2.5.6 & §2.7).** Ready for implementation.

---

## Core adoption (`README.md`, "CORE MODULES ARE NOT OPTIONAL")

| Module | Takes it for |
|---|---|
| `core/biome` | `window.SHROUDHILLS` on the `BIOME-API.md` contract (`BIO.init({tags:'shroudhills'})`): host trees, cistern-epiphytes, root-hammock spans, drum-galls, lithophyte cloaks, ant-patrol instancing, `34` impostors, `31j` `BIO.flareJoin` on bough-forks & root-bridges |
| `core/rand` (`KRAND`) | all candidate draws (`KRAND.cell(seed, ix, iz)`) and per-organism / per-colony seeds (`KRAND.hash`); zero sequential draw drift, zero `Math.sin` hashes |
| `core/tags` (`KTAGS`) | every botanical species, `HV` harvest/gather record (`amber`, `saltpeter`, `myrtle-smudge`, `timber`), `hazard:shroud-ant-territory` radius zones, and `Yonni` watch-tower site reserves registered before drawing |
| `core/space` (`KSPACE`) | obstacle & crown-spacing index (`KSPACE`), plus tree-to-tree neighbor queries for deterministic **Root-Hammock (`B`)** catenary spans between adjacent canopy crowns |
| `core/terrain` | `43` `KGROUND` hex-tiled & height-blended library ground layers (ironstone ravine mud, leaf-mould, mossy granite, salt-cobble), `35` `KSTRATA` (`granite` tors & `sedimentary` ironstone/coal ravine walls), `44` `KFAR` & `45` `KHORIZON` to `14 km` |
| `core/water` | `WATER.open` on Station 1's sheltered ocean cove (calm inner-cove surf share), `WATER.flow` on ironstone ravine torrents, and `WATER.still` on elevated **Paired *Sister-Cup* Cistern Sky-Pond (`A`)** water lenses |
| `core/atmos` (`ATMOS`) | shared sky (`ATMOS.sky` at each station's `5.1` pixel), `ATMOS.fogBelt` persistent sea-mist shroud, height fog, `ATMOS.GLSL_WIND` swaying root-hammocks & dripping epiphyte curtains, rain occlusion |
| `core/shadow` (`KSHADOW`) | off at page load (owner rule, 2026-11-03); attached on panel toggle or `?shadow=1` |
| `core/materials` | 100% genuine library material sets packed via `materials.json` and `tools/textures/pack.py` into `biomes/shroudhills/tex/` (`0` untextured lit meshes) |
| `core/host` & `core/clock` | camera, render loop, inspector, probe, polygon tool (`KHOST.take`) |
| `core/export` | `krator-world` scene/biome export |

Not taken: `core/mask` (station fields are analytical functions, zero `getImageData`), `core/city` / `core/hamlet` / `core/simulation` (settlement massing belongs to `Yonni` / `kits/yonni`; Station 3 reserves a tagged `YC1` watch-drum plinth).

---

## 0. What the Kit Is & Why the Region Was Renamed

| Field | Value |
|---|---|
| **Folder** | `biomes/shroudhills/` (`src/`, `stations/canopy/`, `stations/cloaktor/`, `materials.json`, `tex/`, `build.py`, `verify.py`) |
| **Scale-Model Polygon** | **`Shroudhills`** (`id: "rmwetizlzivnz"`, renamed from `"Scoured hills"` in `51-region-store.js`; *Yonni-Zāg:* **`Shrūda-Khīltæ`**) |
| **Global Object** | `window.SHROUDHILLS` (`id: 'shroudhills'`) |
| **Pages / Stations** | 3 stations: `cove` (default `dist/shroudhills.html`), `canopy` (`dist/shroudhills-canopy.html`), `cloaktor` (`dist/shroudhills-cloaktor.html`) |
| **Polity & Culture** | Homeland of the **Twin-Born Spear-Queens of `Yonni`** (`Sfīra-Kandētæ`, `kits/yonni/`); buffer & ambush forest between `Yonni` (`346, 418`) and `Lower Ria` (`Ria Sound` `626, 140`) / `Eternal State` (`Y = 515`) |

**Why `"Scoured hills"` became `Shroudhills`:** On `5.1`, `81.1%` (`43,677 km²`) of `rmwetizlzivnz` is prime wet timberland (`1,647–3,560 mm/yr` rain, `Cfa` `50.2%` + `Am` `21.9%`). Early sailors glimpsing the **wind-washed white granite ridge-caps (`35%` crystalline/granite tors)** poking through relentless sea-fog called them "scoured", when in reality everything below the summit tors is drowned in a **perpetual mist-shroud and multi-storey hanging epiphyte curtains** (*Shroudhills*).

---

## 1. The Ground (`5.1` Survey, `1821 × 1723`, `2 km/px`)

| Metric | Surveyed Value on Scale Model `5.1` |
|---|---|
| **Canvas Bounds** | `X = 469..666`, `Y = 203..337` |
| **Area** | **`53,852 km²` dry land** + **`6,332 km²` drowned coastal coves & sounds** (`15,046` total cells) |
| **Elevation (`p5 / p25 / p50 / p75 / p95`)** | **`+37 m / +567 m / +1,331 m / +2,658 m / +5,211 m`** (coastal coves to high inner cordillera divide) |
| **Barometric Pressure & Oxygen (`g = 7.4 m/s²`)** | **`1.59 atm` (`0.33 atm O₂`)** on the coves (`+50 m`), **`1.47 atm` (`0.31 atm O₂`)** in mid-ravines (`+686 m`), **`1.35 atm` (`0.28 atm O₂`)** on median ridges (`+1,331 m`) |
| **Rainfall (`p10 / p50 / p90 / max`)** | **`1,302 / 1,647 / 2,055 / 4,000 mm/yr`** + daily onshore advection fog off the `NWern Ocean` |
| **Köppen Classes** | **`Cfa` `50.2%`**, **`Am` `21.9%`**, `Dfc` `7.8%`, `ET` `6.5%` (high SE spine) |
| **Bedrock & `geology.json` Lodes** | **`Sedimentary` `65%`**, **`Crystalline` `26%`**, **`Granite` `9%`**. Rich in **`iron = 180` (`2,157` nodes)**, **`coal = 219` (`1,148`)**, **`tin = 200` (`457` + placers)**, **`gold/silver = 110` (`332/339`)**, **`amber = 120` (`297`)**, **`oil = 158` (`276`)**, and **`saltpeter = 200` (`61`)** |

**Distinction from Neighboring Wet Biomes:**
- Not `biomes/farside` (`SW`): zero terrestrialized marine kelp, spray-coral, or sea-anemones.
- Not `biomes/crook` (`SSW`): zero coastal lithistid or canopy sponges, zero skarn porcelain-ferns.
- Not `biomes/doubledelta` (`NE`): steep ironstone-and-granite hill country (`+50–2,600 m`), **100% vascular/botanical super-epiphytes & giant eusocial canopy-ant symbiosis**.

---

## 2. Physical & Ecological Engine (`0.75 g` + Hyperoxic `0.31 atm O₂` Mist Physics)

Two planetary constants drive `Shroudhills` into a plausible biological extreme without breaking Earthlike botanical logic:

1. **Structural Canopy Overloading (`g = 7.4 m/s²` = `0.75 g` + Year-Round Fog Drip):**
   - Horizontal bough bending moments per kilogram of wet water/peat are **`25%` lower** than on Earth, while `1,650–3,500 mm/yr` rain and `1.47 atm` advection mist eliminate dry-season desiccation in the treetops.
   - Buttressed laurel, *kohekohe*-mahogany, and podocarp crowns therefore support **3–4× the epiphytic mass** of Earth's Olympic or Valdivian cloud forests—turning the `15–28 m` canopy stratum into a continuous, water-holding **second ground**.
2. **Physiological Ceiling for Cat-Sized Eusocial Canopy Ants (`pO₂ ≈ 0.28–0.33 atm` = `+35% to +57%` over Earth Sea Level):**
   - Insect tracheal diffusion scales directly with ambient oxygen partial pressure (`pO₂`), while exoskeleton leg-buckling stress drops by `25%` at `0.75 g`.
   - Combined with year-round carbohydrate exudates from canopy nectaries and insulated `1.5–2.8 m` myrmecophyte **Drum-Galls**, eusocial canopy ants (*Formica shrouda*, *Yonni-Zāg:* **`Khrōma-Mīra`**) reach **housecat proportions (`28–34 cm` workers, `38–44 cm` heavy-mandibled soldiers, `2.0–4.2 kg`)**.

---

## 3. The Four Locked Twists (`A + B + E + C`) & The Shroud-Ant Hazard Contract

### Twist `A` — Giant Cistern "Sky-Ponds" & Paired *Sister-Cups* (`Syncalyx gemina`)
- **Form:** Carriage-sized (`1.6–3.4 m` diameter) spiral rosette tank-epiphytes anchored in primary bough-forks, holding **`90–320 L` of tannin-amber rainwater** (`WATER.still` miniature specular water disks perched in the canopy!).
- **Twin-Budding Biology (*"Sister-Cups"*):** Reproduces vegetatively by splitting its apical meristem into **two symmetrical, lip-fused mirror-rosettes** sharing an overflow weir—revered by the `90%`-twin Spear-Queens of `Yonni` as sacred emblems of the *Field-Queen* and *Hearth-Queen*.
- **Dynamics:** Hosts miniature aerial marshes (golden bladderwort, canopy reed-frogs, damselflies); senescent outer leaves tip under heavy squalls, releasing silver ribbon-drips down into the ravine mist.

### Twist `B` — Grafted "Second-Floor" Canopy Turf & Tensioned Root-Hammocks (`Metrosideros pontifex`)
- **Form:** Hemi-epiphytic *rata*/myrtle climbers germinate high on host boughs and cast horizontal aerial roots across `6–14 m` crown gaps (`KSPACE` nearest-crown pairing). Where roots touch, they **inosculate (self-graft)** into living suspension cables that trap falling leaves, moss, and bark into **`40–75 cm`-thick suspended peat "sky-lawns"** `15–24 m` above the ground.
- **Visual Read:** Looking up from the dark, muddy ironstone ravine floor (`< 8%` direct sky light), shafts of golden sun pierce gaps between lush, flower-studded green catenary hammocks bridging tree to tree; from an elevated ridge or scout walkway, the canopy reads as an undulating **elevated meadow** of crimson epiphytic orchids and berry-heaths.

### Twist `C` — Chambered Myrmecophyte "Drum-Galls" & Cat-Sized Shroud-Ants (`Myrmecodia tympanum` + *Khrōma-Mīra*)
- **The Plant-Ant Symbiosis (`saltpeter = 200` Mineral Tie-In):**
  - Ribbed, woody-skinned epiphytic tubers (`1.2–2.8 m` across, russet-mahogany & lichen-grey) clasp major trunks beneath the canopy turf. Their interiors are honeycombed into smooth **brood vaults**, **refuse-compost chambers**, and thin-walled, dry **acoustic resonance domes** with slit-shaped ostioles.
  - Colony refuse (shed chitin, prey husks, frass) mineralizes inside damp basal chambers and drips down hollow trunk-grooves into rock overhangs, precipitating the region's **`saltpeter = 200` (`61` lode nodes)** nitrate crusts harvested by `Yonni` alchemists.
- **The Noted Regional Hazard — Cat-Sized Shroud-Ants (*Khrōma-Mīra*):**
  1. **Peaceful Default:** Columns of glossy bronze-black, cat-sized workers (`30 cm`) march calmly along overhead **Root-Hammocks (`B`)** drinking nectar from **Sister-Cups (`A`)** and pruning competing vines that would shade their host tree. Travellers walking quietly on bare stone trails below—or `Yonni` Spear-Queen dyads anointed with aromatic *myrtle-smudge* resin—are completely ignored.
  2. **The Acoustic Warning (`Drum-Rattle`):** Any axe-blow to a host tree, fire-smoke, or unanointed boot stepping onto an active root-hammock triggers an immediate colony alert: **`80–200` heavy-headed soldiers (`40 cm`) brace inside the dry resonance chambers and strike their serrated mandibles in synchronized `6 Hz` bursts**, turning the `2 m` tuber into a bass slit-drum audible `500 m` across the glen!
  3. **Implacable Territorial Defense:** If intruders do not retreat within seconds of the drum-rattle, the colony surges down trunk-buttresses and across canopy bridges in an **unbreakable territorial phalanx**—spraying blistering formic-terpene mist and shearing leather, timber shields, and pack-straps until the trespasser is driven completely past the colony's pheromone border. Foreign **Eternian** and **Lower-Ria** armies attempting to clear military roads through `Shroudhills` have repeatedly been routed without seeing a single `Yonni` spear!

### Twist `E` — Lithophyte "Cloak-Tors" on Storm-Stripped Granite Crowns
- **Form:** Above `+1,100 m` (and on windward coastal promontories), `2,000–3,500 mm/yr` squalls strip loose soil off `Shroudhills`'s **`35%` granite and crystalline tors**, leaving bold white-and-grey stone domes rising cleanly above the ant-patrolled canopy sea.
- **Ecology & Human Refuge:** Unable to support host trees or Shroud-Ant Drum-Galls, the bare granite drums are wrapped in **tight, jewel-toned lithophytic cloaks**—scarlet & saffron rock-bromeliads, silver-velvet cushion-orchids, and glistening sundew/butterwort ribbons catching wind-funnelled sea-midges. Because the Shroud-Ants never nest on treeless granite tors, **`Yonni`'s Spear-Queens build their `YC1/YC2` round stone rain-canopy watch-towers (`kits/yonni/`) directly on these Cloak-Tors**, linked by marked granite ridge-paths!

---

## 4. Zones (`SHROUDHILLS.zones`)

| Zone Key | Elevation & `P_atm` | Where | Signature Look |
|---|---|---|---|
| `shroud_cove` | `0 – +250 m` (`1.60–1.55 atm`, `Am`) | Drowned coastal coves, black-cobble mouths & resin-conifer bluffs | Buttressed *kohekohe* & resin-kauri leaning over calm green cove water; **Sister-Cup (`A`)** sky-ponds dripping amber rain; `amber = 120` resin curtains |
| `canopy_sea` | `+200 – +1,150 m` (`1.56–1.39 atm`, `Cfa/Am`) | Core wet hillslopes & ironstone/coal ravines (`coal = 219`, `iron = 180`) | Two-storey forest: dark fern-and-ironstone ravine floor below, sunlit **Root-Hammock sky-turf (`B`)** + **Drum-Galls (`C`)** & Shroud-Ant highways `18 m` overhead |
| `cloak_tor` | `+950 – +2,200 m` (`1.41–1.21 atm`, `Cfa/Cfb`) | Wind-washed `granite` & `crystalline` ridge-crowns above the canopy | Bare pale granite domes draped in scarlet/saffron **Lithophyte Cloaks (`E`)**, mist-banners, and `Yonni` smudge-cairns / watch-drum plinths |
| `mist_divide` | `+2,200 – +5,200 m` (`1.21–0.83 atm`, `Dfc/ET`) | High SE cordillera spine (seen on `KFAR` horizon) | Stunted mossy cloud-krummholz giving way to wet slate/granite snowfields |

---

## 5. Species & Registered Items (`BIO` Census & `KTAGS`)

| ID | Common Name | Guild / Twist | Height / Size | Harvest / Tag (`HV` / `KTAGS`) | Visual & Mesh Notes |
|---|---|---|---|---|---|
| `shroud_kohekohe` | **Buttressed Shroud-Mahogany** | Host canopy tree | `24–36 m` | `harvest.wood: 'hardwood'` | Fluted plank-buttresses, wide horizontal bough-forks built with `BIO.flareJoin` (`31j`) to seat Sister-Cups and Drum-Galls |
| `shroud_amber_kauri` | **Weeping Amber-Podocarp** | Host emergent conifer | `30–44 m` | `harvest.wood: 'timber'`, `gather: 'amber'` | Columnar silver-bronze trunk with golden resin stalactites (`amber = 120` tie-in) |
| `shroud_rata_bridge` | **Bridge-Rata & Sky-Turf Span** | Twist `B` (`canopy_sea`) | `6–15 m` span, `0.6 m` turf | `gather: 'peat-fibre'` | Procedural catenary grafted root-lattice between neighbor trees (`KSPACE`), topped with mossy peat cushion & crimson sky-orchids |
| `shroud_sister_cups` | **Paired *Sister-Cup* Cistern** | Twist `A` (`cove` & `canopy_sea`) | `1.8–3.2 m` twin rosette | `gather: 'reed-wax'` | Mirror-paired spiral olive-crimson tank leaves holding dual `WATER.still` amber water lenses |
| `shroud_drum_gall` | **Myrmecophyte Drum-Gall** | Twist `C` (`canopy_sea` hazard) | `1.3–2.6 m` trunk tuber | `gather: 'saltpeter'`, `hazard: 'shroud-ants'` | Ribbed mahogany-ochre chambered gall clasping host bole with slit-ostioles, basal white nitrate crust, and `3–7` posed/animated `35 cm` bronze-black **Shroud-Ant** sentries on its rim & adjacent root-hammock |
| `shroud_myrtle_smudge` | **calming Smudge-Myrtle** | Understorey trail shrub | `1.5–3.0 m` | `gather: 'smudge-resin'` | Aromatic silver-green shrub planted by `Yonni` scouts along safe stone paths to pacify nearby ant colonies |
| `shroud_cloak_bromeliad` | **Scarlet & Saffron Tor-Cloak** | Twist `E` (`cloak_tor`) | `0.8–2.4 m` mat | `gather: 'crimson-dye'` | Tight lithophytic rosette tapestry hugging steep `granite` `KSTRATA` faces |
| `shroud_dew_strand` | **Silver Mist-Sundew Curtain** | Twist `E` (`cloak_tor`) | `0.6–1.8 m` | `gather: 'mucilage'` | Glistening pearl-tipped carnivorous threads fluttering in ridge-squalls (`ATMOS.GLSL_WIND`) |
| `shroud_tree_fern` | **Ironstone Ravine Tree-Fern** | Ravine understorey | `3.5–7.5 m` | `gather: 'fiddlehead'` | Dark scaly trunk & wide emerald-bronze crown thriving in `8%`-light ravine bottoms |

---

## 6. Stations (`build.py` & `stations/`)

1. **Default Station — `cove` (`dist/shroudhills.html`, `5.1 px (497, 302)`, `+50 m`, `Am` `2,698 mm/yr`, `1.59 atm`):**
   - **Scene:** Sheltered NW coastal cove facing `Battered Isle`, where ironstone-and-granite bluffs drop into calm emerald-green ocean water (`WATER.open` + gravel stream `WATER.flow`). Towering *Shroud-Mahogany* and *Weeping Amber-Podocarps* lean out over the tide line, their boughs weighed down with **Paired *Sister-Cup* Cisterns (`A`)** glinting with trapped rainwater and golden amber resin-veils, while a `Yonni` smudge-cairn marks the landing path up into the mist.
2. **Station 2 — `--station canopy` (`dist/shroudhills-canopy.html`, `5.1 px (531, 252)`, `+686 m`, `Cfa` `1,710 mm/yr`, `1.47 atm`):**
   - **Scene:** The signature interior hazard glen of `Shroudhills`. A steep, shadowy ironstone & `coal`-seam ravine threaded by a mossy boulder stream below, roofed `18–22 m` overhead by an unbroken **Grafted Root-Hammock & Canopy-Turf network (`B`)**. Massive **Myrmecophyte Drum-Galls (`C`)** clasp the central buttress trunks with **cat-sized bronze-black Shroud-Ant sentries (*Khrōma-Mīra*)** patrolling the overhead root-bridges (`KTAGS` `hazard:shroud-ants` zones vs. the safe `smudge-myrtle`-lined granite footpath below). Includes elevated camera views both under the root-vault and up on the sunlit "second-floor" sky-turf!
3. **Station 3 — `--station cloaktor` (`dist/shroudhills-cloaktor.html`, `5.1 px (505, 302)`, `+1,284 m`, `Cfa` `3,561 mm/yr`, `1.36 atm`):**
   - **Scene:** Storm-washed `granite` **Cloak-Tor (`E`)** rising cleanly above the billowing `ATMOS.fogBelt` and the surrounding ant-guarded canopy ocean. Sheer pale granite ribs (`KSTRATA`) are wrapped in vivid scarlet, saffron, and silver-velvet lithophyte cloaks and wind-streaming dew-strands, with a tagged `Yonni` Spear-Queen watch-tower site reserve (`kits/yonni` `YC1` plinth & smudge-brazier) commanding a `14 km` `KFAR` panorama toward the sea and `Ria Sound`.

---

## 7. Planned Numbered `src/` Architecture & Verification Gates

- `materials.json` + `tex/` — Packed via `tools/textures/pack.py` (bark, moss-peat, wet granite, ironstone mud, bromeliad/tank foliage, chitin-bronze ant carapace, amber-resin; `0` untextured meshes).
- `src/20-shroudhills-defs.js` — `[G data]` zone rules, `Sister-Cup`, `Root-Hammock`, `Drum-Gall`, and `Shroud-Ant` territory parameters (`KRAND` seeded).
- `src/30-shroudhills-mats.js` — Library material bindings, `ATMOS.GLSL_WIND` hooks, chitin iridescence & wet-sheen roughness.
- `src/50-shroudhills-trees.js` — `shroud_kohekohe`, `shroud_amber_kauri`, `shroud_tree_fern` with `BIO.flareJoin` forks & `34` impostors.
- `src/55-shroudhills-epiphytes.js` — Paired *Sister-Cup* cisterns (`WATER.still` inner disks), `KSPACE` neighbor-bridging *Root-Hammock* sky-turf spans, *Cloak-Tor* lithophyte tapestries, and *Drum-Galls* with posed/swaying cat-sized *Khrōma-Mīra* ant sentries & `KTAGS` hazard volumes.
- `src/45-host-stage.js` (plus `stations/canopy/45-host-stage.js`, `stations/cloaktor/45-host-stage.js`), `47-host-land.js`, `88-host-scene.js`, `89s-host-sky.js`, `89t-host-weather.js`, `89w-host-water.js`.
- **Verification:** `build.py` (`report()` via `tools/build_sources.py`), `verify.py --assert` across all 3 stations (`0` console errors, `0` untextured meshes, `0` cell faults, `check_port`, `check_core_use`, `check_budgets`, `check_stale` all `0`).
