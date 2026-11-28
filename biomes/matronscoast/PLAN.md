# matronscoast: the plan — Matron's Coast / The Snail Coast (proposal & build-ready design, 2026-11-27)

**Matron's Coast / The Snail Coast** (Scale Model `5.1` biome polygon **`Matron's Coast`**, id **`rmwvqchv37nh0`**, px `261–517 × 304–488`; *Yonni-Zāg:* **`Kandē-Sākhil`** "Queens' Shore", Eternian sailors' name: **Snail Coast**): the **`62,964 km²` dry-land** (`+ 6,032 km²` drowned skerry sea and channels) hyper-wet north-western ocean coast wedged between **`Farside` / `Farport`** (`biomes/farside`) on the south-southwest, **`Shroudhills`** (`biomes/shroudhills`) and **`Battered Isle`** (`biomes/batteredisle`) on the north-east, and the **`NW Outer Wall`** (`Yeti` high country and `White Pass`) inland.

Situated inside the western half of the **Twin-Born Spear-Queens' (`Yonni`, `346, 418`, `kits/yonni/`)** coastal realm (`r27yonnishr`), Matron's Coast receives **`3,357–4,000 mm/yr` of warm ocean rain** (`p50 = 4,000 mm/yr`) and relentless onshore advection fog across a **drowned `16`-island skerry archipelago** (`edit_535_veiled_mountains.py`) rising from hot-humid `Af`/`Cfa` coastal flats (`< +1,800 m`, `1.43–1.60 atm`, `0.30–0.33 atm O₂`) to cool **`Cfb`/`Dfb` temperate cloud-rainforest** higher up the slopes. It shares coastal storm-wrack and sea-lime physics with neighbouring **`Farside`** and buttressed, epiphyte-laden *kohekohe*-and-podocarp rainforest with neighbouring **`Shroudhills`** — **but its entire landscape, forest structure, soil chemistry, and coastal masonry are shaped by the ecological dominance of giant terrestrial snails, armoured skerry molluscs, and arboreal gastropods**.

Status: **Build-ready biome plan** aligned with `edit_535_veiled_mountains.py`, `edit_536_wind_climate.py`, [biomes/farside/PLAN.md](../farside/PLAN.md), [biomes/shroudhills/PLAN.md](../shroudhills/PLAN.md), and [kits/yonni/PLAN.md](../../kits/yonni/PLAN.md).

---

## 0. What the kit is

| | |
|---|---|
| **Folder** | `biomes/matronscoast/` (`src/`, `stations/`, `tests/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `PORT.md`, `INDEX.md`, `NOTES.md`, `KNOWN_ISSUES.md`) |
| **Scale-Model Polygon** | **`rmwvqchv37nh0`** (*Matron's Coast*, `kind: "biome"`): **`62,964 km²` dry land** (`15,741` `2 km` cells) + **`6,032 km²` skerry channels & coastal sea** (`1,508` cells, `16` skerry islands carved in `edit_535`), BBox `X = 261..517, Y = 304..488` |
| **Pages (`4` Stations)** | `dist/matronscoast.html` (**Station 1 `skerry`**: *Drowned Skerry Sound, Coquina Shell-Middens & Skerry Megachitons* at px `312, 392`), `--station browsewood` (*The Browse-Line Snail Cathedral & Mucus Silver-Highways* at px `356, 424` near `Yonni`), `--station kelpfront` (*The Southern Kelp-Grazing Line* toward `Farside` at px `298, 476`), and `--station cloudslope` (*Upper `Cfb` Cloud-Rainforest, Lantern-Snails & White-Pass Cataract* at px `438, 386`, `+2,150 m`) |
| **Objects** | **`SNAIL_PHYS`** (`[G data]` in `src/15-snail-phys.js`: pure mollusc density, `2.2 m` radula browse-skirt height, mucus-trail routing & slip wetness, coquina shell-midden calcium accumulation, `Farside` kelp-suppression balance, and `Shroudhills` ant-exclusion mucus barrier; tested by `tests/test-snail-phys.js` on `tools/ktest.js`) and **`MATRON`** (`BIO.kit('matronscoast')`) |
| **Read in place (`BIO.kin`)** | **`biomes/shroudhills`** (buttressed `shroud_kohekohe` mahogany, `shroud_amber_kauri` podocarp, and `shroud_sister_cups` cistern epiphytes — **excluding** `shroud_drum_gall` & Shroud-Ants on snail-glazed lowland trunks); **`biomes/farside`** (`stormwrack`, `wineweed`, `spraycoral` lime crusts on outer skerries, and grazed `landkelp` stubs on `--station kelpfront`); **`biomes/nwlowlands`** & **`biomes/nwouterwall`** (subtropical foothills & high inland `Dfb`/`Dfc` conifers); **`kits/fauna`** (`KratorFauna` giant gastropod & chiton records) |
| **Out of scope** | Permanent **`Yonni`** Spear-Queen round `sealime`-and-cobble towers (`Yonni` citadel at `346, 418`, `Arkerum`, `whitelake`; built from `kits/yonni/`) — published here as clean `core/tags` `site:yonni-*` plinth reserves and optional `?works=0` shell-lime burning heaps (`class: 'furniture'`) |

---

## 1. Core adoption (`README.md`, "CORE MODULES ARE NOT OPTIONAL")

| Module | Fragments / Path | What `biomes/matronscoast` takes it for |
|---|---|---|
| **`core/biome`** | `buildlib.CORE_BIOME_MIN` (`10`, `20`, `30`, `31b`, `34`, `40`) + `31j-core-joint.js`, `32-core-variants.js`, `33-core-fungoid.js`, `35-core-anim.js`, `36-core-walker.js`, `39-core-lean.js`, `41-core-env.js`, `42-core-export.js`, `43-core-export-host.js`, `44-core-stage.js` | `BIO.kit('matronscoast')`; `31j` `BIO.flareJoin` on browse-pruned buttresses & silica-thorn trunk collars; `32` `BIO.kin` reading `shroudhills`, `farside`, `nwlowlands`, `nwouterwall`; **`33` `BIO.fung` & `BIO.attach`** for spiralled coquina concretions, arboreal Lantern-Snail clusters, and pearl-fruit lures; `34` impostors; `36` slow sinusoidal pedal-wave glide for giant crawling gastropods |
| **`core/drawn`** | `core/drawn/10-core-drawn.js` (`KDRAWN`) | Registers skerry islands, cemented shell-midden benches, sunken mucus-trail troughs, and cloud-forest slopes for `SURVEY` eye-clearance checks (item 28) |
| **`core/rand`** | `core/rand/08-core-rand.js` (`KRAND`) | Order-free `KRAND.cell` / `KRAND.hash` seeding for spiral shell chirality (`98%` dextral, `2%` sacred *Lone-Born* sinistral "Queen-Shells"!), slime-highway networks, and plant stands |
| **`core/tags`** | `50/52/53-core-tags*.js` (`KTAGS`) | Pre-draw registration of all flora, giant mollusc herds, shell-midden `sealime` deposits, `KHAZ` slime-slip & radula/harpoon zones, and `site:yonni-*` reserves |
| **`core/space`** | `core/space/20-core-space.js` (`KSPACE`) | Spatial occupancy keeping shell-midden banks, slime-highways, skerry channels, and buttressed trunks non-overlapping |
| **`core/coast`** | `core/coast/30-core-coast.js` (`KCOAST`) | Natural `rock`, `shingle`, and coquina `sand` profiles across the drowned skerry islands and channels (`5–40 m` deep) |
| **`core/terrain`** | `35-core-strata.js` + `host/35-core-strata-shade.js` (`KSTRATA`), `37-core-stacks.js` (`KSTACKS`), `38-core-relief.js` (`KRELIEF`), `43-core-ground.js` (`KGROUND`), `44-core-farfield.js` + `host/44-core-farfield-draw.js` (`KFAR`), `45-core-horizon.js` + `host/45-core-horizon-shade.js` (`KHORIZON`) | `KSTRATA` coastal `granite`/ironstone capped by white-buff biogenic **coquina shell-limestone**; `KSTACKS` wave-notched skerry islets & cemented conch-mounds; `KGROUND` (`<= 4` layers: wet leaf-mould, crushed nacre-shell sand, mossy granite, iridescent mucus-trail ribbon); `KFAR` + `KHORIZON` |
| **`core/water`** | `20`, `21`, `22`, `50`, `51`, `ext/56..60`, `farbed/53-core-water-farbed.js` | `WATER.open` across the `16`-island skerry channels (heavy breakers on outer skerries, calm jade sound water inside); `WATER.flow` for coastal rain-cataracts ending at the first skerry channel (`edit_535`); `WATER.still` for shell-dammed lime pools & *Sister-Cup* sky-ponds |
| **`core/atmos`** | `0-core`, `0p-presets`, `3-particles`, `4-weather`, `8-export`, `9-host`, `a-waves`, `b-skylight`, `sky/e,f,g,j`, `host/c,e,h,i,j`, `fx/raincover` | Shared Krator sky (`1.43–1.60 atm`), persistent warm coastal `fogBelt` & height fog (`Shroudhills` continuity), sea-spray plumes, `fx/raincover`, `cloudShadeScene` wet sheen |
| **`core/hazard`** | `20/21-core-hazard*.js` (`KHAZ`) | `snail:mucusslip` (`slip` on steep opalescent slime-highways), `snail:harpoon` (`poison` ambush zones in hollow shell-middens where carnivorous *Conus*-like land harpoon-snails hunt), and `snail:surf` (outer skerry surge) |
| **`core/materials`**, **`core/shadow`**, **`core/host`**, **`core/export`** | `KMAT` (`< 15` samplers), `KSHADOW` (off at load), `khost.FULL`, `07`/`09` | Thin-film iridescent specular hook on nacre shells & dried mucus highways (`KHOOK`), standard host chrome & `krator-world` export |
| **`kits/crops`**, **`kits/fauna`**, **`kits/resources`** | Read in place (`[G data]`) | `CROPS.BIOMES.matronscoast` (tyrian/murex-purple snail dye, pearl-lime, taro/yam protected in thorn-hedges); `7` mollusc & snail-eating fauna species; `sealime` / `iron` / `tin` / `amber` prospectivity |

**Not taken:** `core/mask` (`0` `getImageData`), `core/city` / `core/hamlet` / `core/engine` (buildings belong to `kits/yonni` and `kits/eternian`).

---

## 2. Measured Ground (`Scale Model 5.1`, after `edit_535` & `edit_536`)

| Metric | Surveyed Value on `rmwvqchv37nh0` | Ecological Meaning |
|---|---|---|
| **Area & Coastline** | **`62,964 km²` dry land** (`15,741` px) + **`6,032 km²` water** (`1,508` px); **`16` drowned skerry islands** (`5–40 m` channels) | Sheltered, calcium-rich intertidal channels (`edit_535`) ideal for amphibious megamolluscs and shell-midden accumulation |
| **Elevation (`min / p25 / p50 / p75 / p95 / max`)** | **`+1.2 / +130.8 / +926.2 / +2,965.9 / +5,448.7 / +9,235.9 m`** | Broad `< +1,800 m` humid coastal plain & foothills rising steeply to cool cloud-forest slopes (`+1,800–+3,200 m`) and the inner `White Pass` / `NW Outer Wall` divide |
| **Pressure & Oxygen (`0.75 g`)** | **`1.60–1.38 atm`** (`pO₂ ≈ 0.33–0.29 atm`) across `75%` of the biome | **`25%` lower shell weight** + **`+50%` O₂ partial pressure** + `96–100%` humidity removes Earth's size ceiling on pulmonate land-snails |
| **Rainfall & Temps** | Rain `p25 / p50 / p95` = **`3,357 / 4,000 / 4,000 mm/yr`** (`edit_536` sample med `3,462 mm`); `tm = +21 °C` (`tw +26 / tc +16 °C` on plain; `< +22 °C` above `~1,800 m`) | **`Af` (`45.3%`)** & **`Cfa` (`27.2%`)** warm rainforest below `+1,800 m`, stepping into **`Cfb` (`4.0%`) / `Dfb` (`7.8%`) / `Dfc` (`5.5%`)** cool montane rainforest up the slopes |

---

## 3. Why This Coast Is the *Snail Coast* — Five Landscape-Scale Ecological Signatures

### 3.1 How Giant Molluscs Hold the Borders Against Both `Farside` and `Shroudhills`
1. **Stopping `Farside`'s Terrestrial Kelp Invasion (`SW` border, `y ~ 482`, Station 3 `kelpfront`):**
   - Just south in `biomes/farside`, hull-borne alien `landkelp` overran the coast because native terrestrial herbivores were slow to recognize it (until Eternians loosed goats). At `Matron's Coast`, **`landkelp` hits a living wall of radulae**: giant **Matron's Tower-Snails** and **Skerry Chitons** evolved on storm-cast marine wrack (`stormwrack`, `wineweed`) and rasp every `landkelp` holdfast and lime-stipe down to bare rock! Conversely, `Farside`'s heavy Eternian goat herds and lime-kiln burning stop giant snails from spreading south past Farport's frontier.
2. **Stopping `Shroudhills`'s Cat-Sized Shroud-Ants (`NE` border, `x ~ 469`):**
   - `Matron's Coast` shares `Shroudhills`'s lush *kohekohe*, amber-kauri, and paired *Sister-Cup* sky-ponds (`BIO.kin`), **but lacks `Shroudhills`'s eusocial Shroud-Ants below `+1,400 m`**. Why? Every major trunk and rock trail on `Matron's Coast` is coated in viscoelastic, saponin-bitter **gastropod pedal mucus**, which clogs insect spiracles and dissolves pheromone trails — making `Matron's Coast` safe for `Yonni` coastal villages and shell-burners without needing constant *myrtle-smudge*!

### 3.2 Five Visible Ecological Impacts on the 3D World (`SNAIL_PHYS`)
1. **The `2.2 m` "Snail Browse-Line" & Armed Trunk Collars:**
   - Herds of `18–35 kg` **Matron's Tower-Snails** (`0.7–1.1 m` spiral shells) browse soft saplings and low leaves cleanly up to **`2.2 m`**, turning mature groves into **open, vaulted cathedrals under high leafy canopies** — except where native plants evolved **anti-radula armour**: downward-pointing **glassy silica spine-skirts (`radulathorn`)**, bitter milky-alkaloid ferns (`bitterfern`), and **calcified stone-bark buttresses**.
2. **Mutualist "Pearl-Bribe" Dispersal (`nacretree` & `slimeorchid`):**
   - Rather than fight the snails, endemic **Nacre-Fig / Pearl-Plum trees** (`nacretree`) dangle clusters of chalky, calcium-loaded white fruits on trunk cauliflory cords at `1.0–1.8 m`: giant snails gorge on the calcium for shell growth and pass the intact seeds kilometres away inside nutrient-rich mucus pellets!
3. **Iridescent Mucus "Silver-Highways" (`slimeTrail`) & Radula Rock-Grooves:**
   - Multi-generational snail migrations carve smooth **`50–90 cm`-wide U-grooves** across soft coastal sandstone, limestone, and fallen nurse-logs, glazed in a glistening, silver-violet **dried mucin film** (`KGROUND` layer + `KHOOK` thin-film fresnel). Rainwater runs down these hydrophobic trails into **mucus-sealed vernal pools**.
4. **Biogenic Coquina "Conch-Middens", Rimstone Terraces & `Yonni` `sealime`:**
   - Where giant snails gather in calcium-rich hollows to aestivate or die, millions of empty `0.8 m` spiral shells fuse under `4,000 mm/yr` carbonate-rich rain into **`2–6 m`-high white-and-nacre coquina shell-banks (`conchmidden`)** and shell-dammed emerald pools — directly supplying `Yonni` Spear-Queen builders (`kits/yonni`) with their signature **crushed-shell hydraulic `sealime` plaster, `f_nacre` mother-of-pearl, and *Murex*-like royal purple/crimson hypobranchial dye (`CROPS`)**! Rare **`2%` left-handed (sinistral) "Queen-Shells"** are sacred regalia of `Yonni`'s Lone-Born Seers.
5. **Vertical Canopy Zonation (`Lantern-Snails` & `Cloud-Slugs`):**
   - Above the `2.2 m` ground-snail browse line, jewel-banded **Painted Lantern-Snails** (`12–22 cm`, jade, saffron, and carmine spiral shells) hang like porcelain lanterns under *Sister-Cup* leaves (`BIO.attach`), grazing epiphytic algae without harming host leaves.

---

## 4. Zones & Stations (`4` proposed pages)

| # | Station (`dist/`) | `5.1` Pixel | Elev & Climate | Scene Composition & Signature Mollusc Impact |
|---|---|---|---|---|
| **1** | **`skerry`** *(default `matronscoast.html`)* | **`312, 392`** (drowned skerry archipelago) | `0–+85 m`, `1.59 atm`, `Af` (`4,000 mm`) | **Skerry Sound & Coquina Conch-Middens:** Two granite-and-coquina skerry islands across a `22 m`-deep jade sound (`WATER.open` breakers seaward, calm sound leeward). `1.1 m` **Skerry Megachitons** & giant surf-limpets along wave-rasped intertidal visors, `4 m`-high **cemented spiral Conch-Midden banks** overgrown with calciphile *Matron's Slipper* orchids, and a `site:yonni-sealime-kiln` reserve |
| **2** | **`browsewood`** (`matronscoast-browsewood.html`) | **`356, 424`** (mainland coastal forest by `Yonni`) | `+140–+420 m`, `1.56 atm`, `Af`/`Cfa` | **The Snail Cathedral & Silver-Highways:** Buttressed *kohekohe* and *Pearl-Plum* (`nacretree`) rainforest trimmed to a razor-sharp **`2.2 m` browse-skirt** above glistening **opalescent Mucus Highways**; grazing **`0.9 m` Matron's Tower-Snails** (`36-core-walker`), silica-spined `radulathorn` thickets, and *Sister-Cup* sky-ponds (`WATER.still`) overhead |
| **3** | **`kelpfront`** (`matronscoast-kelpfront.html`) | **`298, 476`** (southern border with `Farside`) | `+15–+190 m`, `1.58 atm`, `Af` | **The Kelp-Grazing Front:** Where `Farside`'s marine invasion meets the Snail Coast! Storm-cast `stormwrack` and stubby, half-rasped `landkelp` holdfasts (`biomes/farside` read in place) actively grazed back by dense littoral herds of **Tower-Snails** and **Armoured Wrack-Slugs**, proving visually why `Farside`'s kelp woods stop here |
| **4** | **`cloudslope`** (`matronscoast-cloudslope.html`) | **`438, 386`** (upper montane slope toward `White Pass`) | `+1,950–+2,650 m`, `1.22 atm`, `Cfb`/`Dfb` | **Upper `Cfb` Cloud-Rainforest & Shell Cataract:** Cooler mist-drenched podocarp & tree-fern gorge (`edit_535`'s upslope temperate rainforest!) where a river cascades over shell-cemented tufa steps; cold-adapted woolly-periostracum **Shag-Shell Mountain Snails** and jewel-toned **Canopy Lantern-Snails** |

---

## 5. Native Flora (`10` endemic species + `shroudhills` & `farside` `BIO.kin`) & `KratorFauna` (`7` species)

### 5.1 Native / Snail-Coevolved Flora (`MATRON.SPECIES`)
1. `nacretree` (**Pearl-Plum / Nacre-Fig**, `18–32 m`): Trunk-cauliflorous rainforest tree dangling white calcium-rich fruit balls at `1.2–1.8 m` for giant snail seed-dispersal (`HV`: timber, edible sweet pulp, shell-lime ash).
2. `radulathorn` (**Glass-Collar Palm**, `8–16 m`): Rings its lower `2.5 m` trunk in translucent, razor-hard biogenic opal/silica spines (`opaline` glint) that turn away giant snail radulae; safe canopy refuge above (`HV`: thatch fronds, silica-tinder).
3. `conchorchid` (**Matron's Twin-Slipper Orchid**, `0.5–1.2 m`): Calciphile magenta-and-ivory twin-pouch orchid growing exclusively on cemented **coquina conch-middens** (`HV`: medicinal soothing salve).
4. `bitterfern` (**Alkaloid Shield-Fern**, `0.9–1.8 m`): Unpalatable saponin-laced dark blue-green floor fern forming striking un-grazed islands alongside bare snail highways (`HV`: ant- & leech-repellent wash `reagent`).
5. `scrapelichen` (**Radula-Stripe Rock Crust**, ground/cliff mat): Fast-regenerating teal-and-gold epilithic algae/lichen etched with parallel zigzag grazing tracks (`BIO.fung`).
6. `slimecup` (**Mucus-Trap Pitcher**, `0.4–0.9 m`): Low calcareous pitcher growing beside slime-highways, fermenting snail mucus into a sweet lure for flies (`HV`: wound-glue mucilage `M`).
7. `shellreed` (**Coquina Sedge**, `1.0–2.0 m`): Sharp-edged calcareous marsh sedge around shell-dammed pools (`HV`: basketry & `sealime` temper).
8. `velvetkelp_stub` (**Rasped Kelp Holdfast**, `0.3–1.1 m`, `BIO.kin` `farside`): Scarred, snail-cropped `landkelp` stumps along Station 3 (`HV`: potash/iodine `reagent`).
9. `cloudpodocarp` (**Skerry Mist-Yew**, `22–38 m`, `Z4` `Cfb` slope): Salt- and mist-tolerant montane conifer hung with Painted Lantern-Snails (`HV`: rot-proof boat timber & bow-staves).
10. `murexwort` (**Purple-Spore Liverwort**, wet skerry rocks): Fixative moss boiled with snail hypobranchial glands to set `Yonni` royal Tyrian-purple cloth dye (`CROPS.canPlaid('matronscoast')` passes!).

### 5.2 Giant Molluscs & Predator Guild (`kits/fauna` / `src/24-snail-fauna.js`)
1. **`matron_towersnail`** (*Achatina matrona*, **`0.70–1.10 m` shell**, `25 kg`): Banded mahogany, cream, and iridescent-lip giant herbivorous pulmonate (`edible: true`, `tameable: true` as slow garden-clearing stock, yields `nacre`, `sealime` shell, & `royal-purple` dye!).
2. **`skerry_megachiton`** (*Cryptochiton skerryensis*, **`0.85–1.25 m`**): Eight-plated iron-mineralized (`magnetite`-toothed radula!) intertidal grazer clinging to tsunami-washed outer skerries.
3. **`velvet_keelslug`** (**`0.55–0.90 m`**): Shell-less emerald-and-gold forest floor decomposer leaving broad silver mucus trails.
4. **`harpoon_conesnail`** (*Terraconusrox*, **`0.35–0.50 m`**): Ambush carnivorous land-snail lurking in conch-middens with a venomous chitinous radular harpoon (`KHAZ` `snail:harpoon`, `reagent` neuro-analgesic!).
5. **`lantern_treesnail`** (**`0.12–0.22 m`**, canopy clusters): Vivid porcelain-banded arboreal algae-grazer.
6. **`shagshell_snail`** (**`0.40–0.65 m`**, `Z4` `Cfb`/`Dfb` slopes): Cold-resistant montane snail with a furry, moss-camouflaged periostracum coat.
7. **`anvil_thrush` / `crusher_stork`** (**`1.1 m` wading bird**): Drops medium snails onto granite "anvil stones" surrounded by shattered shell rings!

---

## 6. Order of work & Open questions

- **Order:** `M1` scaffold + `SNAIL_PHYS` (`tests/test-snail.js`) + `materials.json` (`nacre`, `coquina`, `mucus` sheen); `M2` skerry coast & coquina shell-middens (`skerry`); `M3` `2.2 m` browse-line cathedral, mucus highways & animated `matron_towersnail` (`browsewood`); `M4` `kelpfront` (`farside` read in place) & `cloudslope` (`shroudhills` read in place); `M5` `verify.py --assert` across all 4 stations (`< 15` samplers, `water-mouths`, `leaf-stems`).
- **Open questions for the owner:**
  1. **Yonni / Arkerum snail husbandry:** Do the Spear-Queens of `Yonni` (`346, 418`) and coastal towns like `Arkerum` actively **ranch or tabu-protect the largest *Matron's Tower-Snails*** (harvesting empty shells for `sealime` mortar, nacre shields, and Tyrian-purple dye, and revering rare `2%` left-handed *Queen-Shells* as Seer trumpets)?
  2. **The `Farside` border (`kelpfront`):** Do you like the ecological explanation that **giant grazing snails keep `Farside`'s invasive `landkelp` from spreading north**, while `Farside`'s Eternian goat herds and lime-kilns keep the giant snails to the north?
