# Bè-tõ-pò (*Bare-Stone Port*): the plan (`settlements/battered-port/`, locked design 2026-11-23)

**`Bè-tõ-pò`** (*"Bare-Stone Port"* / *The Unmasked Haven*; `Farport` dock-creole: **`ɓè-cTõ-pò`**; Fulcrum censorate black-book name: *Bè-dò-tõ*, *"The Unsealed Rock"*): a **`~5,000`-resident (`1,020`-household) offshore stronghold of Unpainted Eternian Exiles and maritime smugglers** perched on the **`+85 to +138 m` worn crescentic crater rim** above **`(435, 259)` (`+115 m` canonical bench)** on **`Battered Isle`** (`rmwetgzft4x9d`, `CROOK-RIA-DECISIONS.md` §2.1).

Built like a Koxinga-era Formosa / Barataria maritime sanctuary just beyond the reach of the **Eternal State** (`LORE.md` §6.19) and the **Western (`Lower Ria`) Dynasty** (`CROOK-RIA-DECISIONS.md` §2.4), `Bè-tõ-pò` is the **nerve center and clearinghouse of the Tsunami Coast & Lower Ria Smuggler Ring**. Its architecture, defenses, and survival against `35–55 m` megatsunamis grow directly out of the owner's foundational geomorphology for Battered Isle (**"a very, very, very worn extinct cinder cone"**, `biomes/batteredisle/PLAN.md`):
1. **Upper Crescentic Crater-Rim Town & Volcanic-Plug Citadel (`+85 to +138 m` on `core/city`):** Terraced safely above the `+65 m` megatsunami scour apron along the horseshoe rim of a deeply eroded parasitic scoria-and-palagonite cone, anchored at its highest point (`+138 m`) on an **exhumed columnar olivine-basalt volcanic neck**. Its buildings read `kits/eternian` (`ET.def`) in place over **dark red-black oxidized scoria and basalt plinths**, adapted via an exile dress pass (`48-bp-exile-dress.js`): **every household ancestor-mask lintel is chiselled blank or left empty** (*"No Mask Above the Door, No Chalk Upon the Cheek"*), flanked by salvaged driftwood sea-galleries, coal-heated bathhouses, `nickel = 180` + `coal = 201` marine-steel smithies, and the Seamount-Watch tsunami gong-tower.
2. **Flooded Breached-Crater Lagoon & Subterranean Palagonite Sea-Cave Harbor (`-28 to +45 m`):** Directly beneath the `+115 m` bluff, where the worn cone's leeward flank breached into the sound, the **drowned extinct crater bowl (`820 m` across, `-28 m` deep)** forms a landlocked circular harbor invisible from open sea behind **twin exhumed radial feeder-dike reef-jaws** (`110 m` throat spanned by a counterweighted nickel-steel chain-boom). Cut into the soft consolidated **yellow-tan palagonite tuff** at the cliff's base (`core/terrain` `KCARVE` + `KCAVERN` + `KSPELEO`) are vaulted subterranean boat-caves, a `640 m` rock-cut escape sea-tunnel to a western bolt-hole cove, and **four counterweighted twin-chain boat & cargo cliff-lifts** that hoist `18 m` smuggling luggers and contraband silk vaults above **`+78 m` in 90 seconds** whenever `Steaming Seamounts` eruption tremors strike!

Status: **Build-ready specification** aligned with `CROOK-RIA-DECISIONS.md`, `biomes/batteredisle/PLAN.md`, `kits/eternian/PLAN.md`, `core/city/README.md`, and `settlements/isle-demo/PLAN.md`. Zero edits to `tools/scale-model/`, `core/`, or `kits/`.

---

## Core adoption

Written first per `README.md` ("CORE MODULES ARE NOT OPTIONAL") and verified against `tools/check_core_use.py` (`settlements` taking `core/simulation` **must** take `core/city`, `core/rand`, `core/tags`) and `tools/checks_optin.json` (items 22–31):

### Modules & kits taken

| Module / Kit | Fragments / Path | What `settlements/battered-port` takes it for |
|---|---|---|
| **`core/city`** | `10-city-core.js`, `12-city-index.js`, `15-city-ground.js`, `20-city-plan.js`, `25-city-site.js`, `31-city-steps-b.js`, `32-city-steps-c.js`, `33-city-strategies.js`, `40-city-kcity.js`, `50-city-host-streets.js`, `52-city-host-buildings.js`, `54-city-host-construct.js` (`KCITY`) | Lays out the entire `~5,000`-pop settlement (`rand: 'krand'`, `index: {order: 'insertion'}`, `TUNE.exact = true`, `TUNE.stance = 'door'` on terraced crater-rim benches): **Instance A (`rim`)** runs `alleys` + `frontage-courts` across `6` upper bluff wards (`+85..+138 m`, ~`910` buildings); **Instance B (`cove`)** lays out the breached-crater quay, sea-cave vaults, and careening ledges (`+3..+24 m`, ~`75` harbour/works records) |
| **`core/simulation`** | `core/simulation/` (`SIM`, partitioned settlement key `'battered_port'`, `SCHEMA.md` 3-level runtime) | Runs the `5,000` citizens (`1,020` households), full 44-trade Voth census mapping, on-island `coal = 201` + `nickel = 180` + `wood = 255` works, warehousing, and **4 multi-polity `SIM.trade` / contraband sea-lines** (`Farport`, `Yonni`, `Crookshore`, `Ria Sound` / `Double Delta`) |
| **`core/world`** & **`core/coast`** | `core/world/` (`WORLD.H`, `44c-world-coast.js`) + `core/coast/30-core-coast.js` (`KCOAST`) | Streams 1:1 scale-model island ground around `(435, 259)` / `(441, 258)`, binding `KCOAST` cliff, dike-stack, and sheltered crater-lagoon profiles |
| **`core/terrain`** | `30-core-field.js`, `35-core-strata.js` + `host/35-core-strata-shade.js` (`KSTRATA`), `36-core-carve.js` (`KCARVE`), `37-core-stacks.js` (`KSTACKS`), `38-core-relief.js` (`KRELIEF`), `39-core-cavern.js`, `39b-core-speleo.js`, `39b2-core-speleo-cleft.js`, `39d-core-cavern-floor.js`, `host/39e-core-cavern-draw.js`, `host/39h-core-cavern-cut.js` (`KCAVERN`, `KSPELEO`), `43-core-ground.js` (`KGROUND`), `44-core-farfield.js`, `45-core-horizon.js` | Shapes the eroded scoria/palagonite crater rim, exhumed `+138 m` olivine-basalt Citadel plug, radial feeder-dike harbor jaws (`KSTACKS`), rock-cut cliff-hoist slots, **flooded palagonite sea-cave vault & `640 m` bolt-hole tunnel** (`KCARVE` + `KCAVERN.cutLayer` + `KSPELEO`), and `16 km` `KFAR` island silhouette |
| **`core/rand`**, **`core/mask`**, **`core/space`**, **`core/tags`**, **`core/drawn`** | `KRAND`, `KMASK`, `KSPACE`, `KTAGS`, `KDRAWN` | Deterministic cell-seeded placement (`0` `Math.random`, `0` `getImageData`), unified lot/tree/cave occupancy, pre-draw `KTAGS` registration (`culture: 'eternian'`, `subculture: 'exile-unpainted'`), and `KDRAWN` eye-clearance |
| **`core/water`** & **`core/atmos`** | `WATER.open`, `WATER.still` (palagonite cisterns), `WATER.flow` (basal tuff spring leats) + `ATMOS` (`1.58–1.60 atm` sky at `+166, -72`) | Calm `-28 m` drowned-crater lagoon vs. breaking outer-dike surf (`WATER.mirrorSwitch` off at load), tsunami drawdown/hoist simulation toggle, coal-forge smoke & sea-mist |
| **`core/door`**, **`core/walk`**, **`core/shadow`**, **`core/host`**, **`core/export`** | `KDOOR`, `KGLASS`, `KWALK`, `KSHADOW` (off at load), `KHOST.take`, `EXPORT` | Transparent `KGLASS` windows & interactive `KDOOR` leaves (including sea-cave boom-gates!), walkable zig-zag cliff stairs & upper terraces, stocks/contents inspector, and M6 `krator-city` + `sim` export |
| **`core/charactermodels`** | `data/peoples.json` (`eternian` base with **exile unpainted override** + `Farport` creole + visiting `yonni` / `hueru-kuran` crews) | Populates streets and quays with **bare-faced Eternian exiles** (zero white rank-paint, washed/dyed indigo & charcoal sea-coats over stripped ministry tunics), `Farport`-creole riggers, and visiting Spear-Queen / Whale-Clan factors |
| **`kits/eternian`** | Read in place (`ET.def`, `ET_TRADES`, `etDims`, `core/engine`, `core/furnish`, `kits/catalog/krator-master-furniture-eternian.js`) | Supplies all `41` active Eternian building defs, modified non-destructively at runtime by **`src/48-bp-exile-dress.js`** (dark scoria plinths, chiselled/blank door-mask niches, driftwood sea-galleries, zero Heirs' closed-eyed gold colossi!) |
| **`kits/ringsea`** & **`kits/port`** | Read in place (`kits/ringsea/src/` + `kits/port/src/` crane/winch segments) | Smuggler fleet (`bpBlockadeLugger`, `bpDeltaSkiff`, `arkScoutTri`, `hkWhaler`, visiting `Yonni` trade-galley) + counterweighted cliff-hoist gantries and dike-throat chain-boom |
| **`kits/interiors`** & **`kits/construction`** | `kits/interiors/sets/eternian.js` + `kits/construction/` (`KCONS` + `KCITY.constructMesh`) | Furnished cut-aways (Counting-Court, Free Press, Sea-Cave Vault) and active building sites on expanding exile terrace lots |
| **`biomes/batteredisle`**, **`kits/crops`**, **`kits/resources`** | Read in place (`BATTER`, `CROPS.BIOMES.batteredisle`, `kits/resources` `coal`, `nickel`/`iron` nodes) | Surrounds the town with wind-sheared `batteredlaurel` & `ironkneepodocarp` woods, basal tuff springs, wrack-manured cinder-terraces, `coal = 201` colliery adits, and `nickel = 180` garnierite pits |

---

## 1. Identity, linguistics & surveyed site reconciliation (`(435, 259)`, `+115 m`)

### 1.1 Naming & linguistic architecture (`lore/tongues-of-krator.html` + `CROOK-RIA-DECISIONS.md` §1.2)

Derived strictly from the canonical Eternian `Mã-wè` sound-laws (`bare → bè`, `stone → tõ`, `door → dò`, `port → pò`, `hall → hò`, `free → fi`, `nine → nã`) and the `Farport` Three-Way Maritime Creole (`b → ɓ` bilabial implosive, `t → c` dental click, `k → q` palatal click):

| Referent | Eternian Exile (`Mã-wè`) | `Farport` Dock-Creole | English / Chart Gloss & Meaning |
|---|---|---|---|
| **The Port & Settlement** | **`Bè-tõ-pò`** | **`ɓè-cTõ-pò`** | **Bare-Stone Port** (*lit.* `bare-stone-port`: simultaneously the **stripped cinder-cone rock**, the **chiselled-bare door lintels** with no ancestor mask, and the **unpainted faces** of its citizens) |
| **The Ruling Syndicate** | **`Bè-dò Hò`** (*Nã-ka Hò*) | **`ɓè-ɗò Hò`** | **The Council of Bare Lintels** (*Nine-Hull Court*): the nine factor-captains who adjudicate shares, safe-conducts, and hoist priority |
| **Flooded Crater Lagoon** | **`Kò-pò`** (*"Coal-Pot / Kettle"*) | **`qÒ-pò`** | **The Kettle**: the landlocked `-28 m` drowned crater bowl behind the twin feeder-dike jaws |
| **Subterranean Sea-Vault** | **`Da-wò-hò`** | **`ɗa-wò-hò`** | **Dark-Water Vault**: the palagonite sea-cave & `640 m` escape tunnel beneath the western bluff |
| **Volcanic-Plug Citadel** | **`Bè-tõ-hè`** | **`ɓè-cTõ-hè`** | **Bare-Stone Head**: the exhumed `+138 m` columnar olivine-basalt neck crowning the crescentic rim |
| **Fulcrum Censorate Term** | *Bè-dò-tõ* *(Paper speech)* | — | *"The Unsealed Rock"*: official euphemism in Ministry of Customs ledgers, which forbid writing a rebel town's own name |

### 1.2 Exact `5.1` site survey & cinder-cone harbor geometry

Directly surveyed on `tools/scale-model/model/data/` (`1821 × 1723`, `2 km/px`) and `kits/resources/data/geology.json`:
- **Canonical World Pin `(435, 259)` & Adjacent `+115 m` Bluff (`441–442, 258–259`):**
  - `60-settlements.js` currently holds **`0` existing `defSets` pins** inside `rmwetgzft4x9d` (nearest mainland pin is **`Yonni`** at `346, 418`, `364.4 km` SSW; **`Farport`** is `751.7 km` SSW at `248, 585`; **`Fulcrum`** is `725.9 km` S at `409, 621`; **`Ria Sound`** is `450.1 km` ENE at `626, 140`).
  - On the `2 km` height grid, `(435, 259)` sits on the WSW landing bench (`+10.6 m`, `-63.0 m` offshore drop-off, `Am`, `1,804 mm/yr`, `+28 °C`, `1.60 atm`, `ultramafic = 255`, `nickel = 180`, `wood = 255`), climbing eastward within `6–12 km` onto the **`+109.6 to +128.1 m` bluff at `(441–442, 258–259)`** (`1.58 atm`, matching the island's **`p50 = +115.4 m`** median!).
  - Meanwhile, on the `2 km` island raster's leeward SSE flank (`472, 259`, exact elevation **`+114.5 m` ≈ `+115 m`**), the main cone's `14 km`-wide breached embayment opens onto `coal = 185–201` collar seams (`474, 263` to `494, 250`).
- **How `settlements/battered-port` Reconciles Both (`isle-demo` Valapo Precedent, Zero Scale-Model Edits Here):**
  - The settlement anchors its `4.8 × 4.8 km` (`±2,400 m`) `KCITY` site window on the **`+115 m` bluff bench overlooking `(435, 259)`**, sculpted as a **deeply worn parasitic scoria-and-palagonite crater ring** on the main cone's sheltered SSW/lee-wrapped shoulder (with `coal = 201` colliery tramways / coaster barges feeding in `38 km` from the SE collar coves, or ready to snap cleanly if a future scale-model pass places the pin at `472, 259`, `+114.5 m`).
  - **Local `4.8 × 4.8 km` Hypsometry:**
    - **Exhumed Volcanic Neck (*Bare-Stone Head*):** `+125 to +138 m` solid columnar olivine-basalt crag on the NW rim shoulder (`0°` tsunami risk; commands `255°` WSW sightlines toward `Steaming Seamounts` and `180°–95°` across the sound).
    - **Crescentic Crater-Rim Terraces (Upper Town):** `+85 to +125 m` horseshoe bench (`1.9 km` arc length, `350–650 m` wide, slopes `4%–16%`) over consolidated palagonite tuff and oxidized red-black scoria, watered by **four perennial `+92 m` tuff-contact springs** (`85 L/s` combined).
    - **Flooded Breached-Crater Bowl (*The Kettle*):** `820 m`-diameter circular lagoon (`-28 m` central depth, `0 m` mean sea level) opening SSE into a sheltered lee sound through a **`110 m`-wide throat** between two **exhumed `38 m`-tall radial basaltic feeder-dike jaws** (`East Jaw` & `West Jaw`) that baffle `85%` of ocean swell and completely hide moored masts from sea-level patrol craft!
    - **Subterranean Palagonite Sea-Cave & Western Bolt-Hole (`0 to +42 m`):** A natural wave-enlarged `140 × 55 m` vaulted sea-cave (`+18 m` crown height) carved into the soft yellow-tan palagonite tuff under the NW lagoon cliff, extended by exile miners into a **`640 m`-long, `9 m`-wide flooded smugglers' tunnel** exiting behind radial-dike sea-stacks on the `(435, 259)` western shore!

---

## 2. Geopolitics, the Unpainted Syndicate & the Four-Corridor Smuggler Web

### 2.1 Strategic invulnerability: why neither Fulcrum nor Heartland can crush `Bè-tõ-pò`
1. **Immune to the Eternal State's Land Armies:** Between Fulcrum (`409, 621`) and `Battered Isle` stand **`136 km` of fortified `Y = 515` `Yonni` Spear-Queen borderlines** (`CROOK-RIA-DECISIONS.md` §2.5.6), **`53,852 km²` of Shroud-Ant-patrolled `Shroudhills` cloud-forest** (which has devoured every Eternian military road-cutting column, `biomes/shroudhills/PLAN.md` §3), and `17–132 km` of open tidal strait.
2. **Lethal to State-Monopoly Revenue Fleets:** The Eternal State's Ministry of Rites & Customs builds heavy, slab-sided canal-and-coastal junks designed for lowland rivers and `Farport`'s dredged roadstead. Around `Battered Isle`, **uncharted submerged radial feeder-dikes** (`batteredisle:dikereef`), `17 km` strait fog-banks, sudden `Steaming Seamounts` surges, and allied **`Yonni` twin-sister war-galley wolfpacks** turn any slow state blockade squadron into driftwood.
3. **Too Useful to Burn:** Secretly, corrupt prefects in `Farport`, patrician river-houses in `Lower Ria`, and `Yonni`'s *Field-Queens* all profit too richly from `Bè-tõ-pò`'s contraband, rustproof nickel-steel, and untaxed gossamer silk to want the Kettle sealed.

### 2.2 Internal governance: **The Council of Bare Lintels (*Bè-dò Hò*)**
- **Origin (~190 years before game start):** Founded by **Captain Sèu-kõ ("Salt-Scar")** — a disgraced `Farport` hydrographer sentenced to the withdrawal houses for copying forbidden Latin sea-charts — together with mutinous canal-artisans, porcelain-kiln masters, and `Farport` click-creole pilots who rode out a Tier-2 Seamount tsunami behind the Kettle's dike jaws.
- **The Unmasked Civic Orthodoxy (Inverting `LORE.md` §6.19):**
  1. **No Chalk Upon the Cheek:** Wearing the Eternal State's white face-paint or black censorate merit/demerit stripes inside the port gates carries an immediate dunking in the Kettle; citizens go bare-skinned, sun-weathered, and sea-salted.
  2. **No Mask Above the Door:** Every `kits/eternian` house keeps the ancestral stone lintel-niche above its door, **deliberately chiselled flat or left empty** — signifying that no dead Heir or ministry register owns the household within. Only when a captain dies at sea is a piece of **unworked driftwood or vesicular black scoria** set in the niche.
  3. **Open Letters:** The True Heirs' "forbidden Latin letters", Eternian `sã-ma` sound-marks, `Matok` trader-script, and `Proto-Ria` amber-syllabary are carved side-by-side on shop-boards and printed openly in the **Free Block-Press (`bp_free_press`)**.
- **The Nine Seats (*Nã-ka Hò*):** No monarch and no examined mandarinate. Nine elected syndicate seats meet beneath the open-eyed wooden ship-figureheads of the **Unmasked Counting-Court**:
  - **4 Sea-Factor Houses** (*South-Run* for `Farport`; *Mist-Run* for `Yonni`/`Shroudhills`; *Whale-Run* for `Crookshore`/`Drownlands`; *Reed-Run* for `Double Delta`/`Lower Ria`);
  - **2 Island Guild-Masters** (the *Crucible-Master* of the Nickel-Steel & Coke Works, and the *Hoist-Master* of the Four Cliff-Lifts & Shipyards);
  - **1 Underground Ferry Warden** (*"The Wash-Face Seat"*, managing defector extraction & counter-espionage against Sanctum *Stalker* assassins);
  - **1 Creole Pilots' Speaker** (representing the `~1,400` `Farport`-creole, `cFlīt-qBōn`-kin, and `Hueru-Kuran` mariners of the Cove & Rim);
  - **1 Free-Press & Cipher Clerk** (keeping neutral bills of lading, shares, and tsunami-watch tables).

### 2.3 The Four-Corridor Smuggler Web (`SIM.trade` & Contraband Matrix)

| Corridor & Distance from `(435, 259)` | Vessels & Seamanship | Outbound from `Bè-tõ-pò` | Inbound to `Bè-tõ-pò` (for Re-Export & Local Use) |
|---|---|---|---|
| **1. `Farport` (`248, 585`, `752 km` SSW) & `Farside` / `Eternal State` Coast** | Fast 2-masted black-sailed **Blockade-Luggers** (`18–24 m`, collapsible masts, hauled onto cliff-hoists) making nocturnal moonless runs into `Farside` kelp-coves & bribing `Farport` Dejima-wall guards | Untaxed `Spider Lake` gossamer-silk, `Ria` amber, `Crook` emerald-nephrite, `cFlīt-qBōn` Paktong, and **subversive uncensored block-books & charts** in `sã-ma` | **Hunted Eternian defectors** (persecuted scholars, porcelain/glass masters, Restorer-tainted clerks), stolen state-monopoly **`alabaster`**, **`celadon`**, woken **`circuit-glass` / pneumatic-tube valves**, lowlander **rice grain**, and censorate intelligence |
| **2. `Yonni` Spear-Queen Coves (`346, 418`, `364 km` SSW) & `Shroudhills` (`17–35 km` ESE)** | Short overnight runs across the `17 km` fog-strait by **Cove Coasters** + visiting **`Yonni` Twin-Sister Trade-Galleys** moored under truce in the Kettle | `Battered Isle` **coked `coal = 201`** & **`nickel = 180` rustproof nickel-steel spearheads, dyad buckler-bosses, and `YC1` rain-canopy bronze-nickel rivets** | `Shroudhills` **`saltpeter = 200`** (drum-gall nitrate for alchemical flares, aqua-fortis assaying & black-powder bombs), **`tin = 200`**, `amber = 120`, smoked venison/grain, and **prize cargoes** captured by `Yonni` raiders along `220+ km` of Eternian `Farside` shipping lanes! |
| **3. `Kōpa-Hueru` (`75, 679`, `1,106 km` SW), `Kāskēdi-Kuran` (`1,010 km`) & `Drownlands`** | Deep-sea **Topsail Schooner-Luggers** & visiting **`Hueru-Kuran` `hkWhaler` catamarans** / **`cFlīt-qBōn` `arkScoutTri` trimarans** riding the outer sound | Eternian glazed ceramics, `Ria` polychrome wares, iron/nickel-steel wire-saw blades, woven sail-hemp, and `plugcrest` tea bricks | Contraband **wire-sawn `emerald-nephrite` (`jade = 200`)** plaques, smokeless **`whale-oil`** (lighthouse & sea-cave lamp fuel!), **`ambergris`**, `cFlīt-qBōn` **`Paktong` (`Cu-Ni-Zn`) ingots**, `frost-coral`, and `Crookwash` **tin-bronze & alpine fruit-brandy** |
| **4. `Double Delta` (`332 km` NE), `Ria Sound` (`626, 140`, `450 km` ENE) & `Lower Ria` to `Silkhead`** | **Shallow-Draft Leeboard Delta-Skiffs** (`0.65 m` draft, dark reed-camouflaged sails) slipping through `Double Delta`'s tsunami-flushed sponge-and-reed distributaries at night — **bypassing `Ria Sound`'s glazed-brick customs water-gates & `Uktena` toll-barges!** | Untaxed Eternian `celadon` & `alabaster`, `Crook` nephrite jade, rustproof nickel-steel ship-fittings, and `Shroudhills` `saltpeter` | Untaxed **`Spider Lake` gossamer-silk bales** (`SL1–SL4` `kits/spider-lake/`), **`ria-amber`** (`304` delta nodes), refined **`bitumen = 118`**, `Lodestone` **`Superconductors`** (`1058, 224` via underground river-factors), and **Lower-Ria surplus `wheat`/`rice` grain** feeding half the island! |

---

## 3. Two-Tier Tsunami-Proof Port Architecture & `core/city` Layout

### 3.1 Exile architectural grammar (`kits/eternian` + `src/48-bp-exile-dress.js`)

Rather than forking `kits/eternian`, `settlements/battered-port` reads `ET.def` in place and applies a deterministic, seed-stable **Exile Dress & Plinth Adapter (`48-bp-exile-dress.js`)** over placed records:
1. **Scoria-and-Basalt Plinths (`stance = 'door'`):** Every building's lower footing (`drop` up to `6.5 m` on terraced crater slopes) swaps lowland silt-block for **dark red-black vesicular oxidized scoria and columnar feeder-dike basalt masonry** mortared with salt-water-proof **yellow palagonite hydraulic lime** (`clay = 255`).
2. **"No Mask Above the Door" (`etMask` Suppression / Chiselled Blank):** Where `kits/eternian` places `et_mask` or closed-eyed ancestor heads on residential and shop lintels, `48-bp-exile-dress.js` substitutes a **recessed chiselled-blank basalt plaque** (`75%`), a **salvaged ship's name-board / driftwood knee** (`20%`), or an **open-eyed painted wooden figurehead** (`5%` on factor-houses) — breaking the Eternal State's `closed-eyes` orthodoxy by design!
3. **Driftwood & Ship-Timber Sea-Galleries:** Cantilevered salt-silvered `ironkneepodocarp` and tsunami-driftwood verandas, tarred rope-railings, copper-nickel storm-shutters, and coal-brazier chimneys cling to the crater-facing facades so families can watch ship-hoists in the Kettle `100 m` below.
4. **Zero Heirs' Gold:** Gold leaf and glowing cyan Ancient circuit-strips are completely absent (`0` Heirs live here); roofs wear **weathered slate-grey tile**, **salt-fired olive-celadon glaze** (made in local coal kilns), and **verdigris cupronickel sheet** on syndicate towers.

### 3.2 Seven Districts across Two Vertical Tiers (`~5,000` Pop, `1,020` Households)

| # | District ID & Name | Tier & Elev | `core/city` Strategy | Pop & Households | Architectural Character & Key Landmarks |
|---|---|---|---|---|---|
| **D1** | **`plug_citadel`** (*Bare-Stone Head / `Bè-tõ-hè`*) | Upper Plug (`+122..+138 m`) |Step 1–6 Landmarks + `frontage-courts` | `320` (`65` hh) | Exhumed columnar basalt neck: **Unmasked Counting-Court** (`et_ministry` exile-dressed), **Free Block-Press & Chart-House** (`et_printer` + `et_registry`), **Seamount-Watch Beacon & Tsunami Gong-Frame** (`et_lighthouse` + bronze gong rig), Signal Semaphore |
| **D2** | **`factor_rim`** (*Nine-Hull Terrace*) | Inner Rim (`+108..+124 m`) | `frontage-courts` (`wealth: 0.75–0.95`) | `780` (`155` hh) | Overlooks the Kettle cliff-edge: **Four Corridor Factor-Compounds** (`et_official_villa` / `et_merchant_house` w/ contraband strongrooms & hoist-head winches), **Hoist-Master's Guildhall**, **Coal-Heated Rim Bathhouse** (`bp_coal_bath`), **Truce Envoy Guest-Court** (`Yonni` & `Crook` factors) |
| **D3** | **`crucible_terrace`** (*Coke & Nickel-Forge Ward*) | NE Downwind Rim (`+96..+116 m`) | `alleys` (`HARD` works lots) | `860` (`175` hh) | Placed strictly downwind of prevailing WSW winds: **Nickel-Steel Crucible Foundries**, **Coke & Pozzolan Kiln-Courts** (`et_kiln`, `et_tile_works`), **Chain- & Anchor-Smithies** (`et_smithy` forging cliff-lift chains), Assay & Saltpeter Lab |
| **D4** | **`creole_steps`** (*Wash-Face & Riggers' Steps*) | Central & West Rim (`+88..+112 m`) | `alleys` (`stance: 'door'`, stepped lanes) | `1,840` (`375` hh) | Dense stepped shophouse-and-alley neighborhoods (`et_canal_house`, `et_court_house`, `et_corner_turret`, `et_dwell_hex` on dry basalt-flagged stepped streets fed by **palagonite spring rills**): sail-lofts (`et_weaver`), ropewalks, cooperages, tea- & brandy-taverns (`et_tea_house`, `et_inn`), **Wash-Face Defector Hospice** (`et_healer` + `et_mask_house` repurposed as identity-forging workshop!) |
| **D5** | **`spring_gardens`** (*Tuff-Spring & Wrack Terraces*) | Outer Leeward Rim (`+85..+105 m`) | `KCITY` fields + `core/hamlet` edge lots | `680` (`140` hh) | Walled scoria-block agricultural terraces (`et_terraces`, `et_farmstead`, `et_goat_fold`, `et_granary`) irrigated by the four `+92 m` palagonite springs and fertilized with hoisted `soundkelp` wrack; misty upper tea-gardens (`et_tea_garden`) & dark tuff mushroom cellars (`et_mushroom_cellar`) |
| **D6** | **`kettle_harbor`** (*The Kettle & Cliff-Hoist Quays*) | Lower Crater Bowl (`0..+32 m`) | **Instance B** (`cove` site steps) | `340` (`75` hh, duty watches; evacuates up in `90 s`!) | `820 m` drowned-crater lagoon: **Four Counterweighted Twin-Chain Boat & Cargo Cliff-Hoists** (`+4 m` cradle pits to `+88 m` rim heads), **Dike-Jaw Chain-Boom Winch-Towers** (`et_wall_tower` on East/West feeder dikes), careening & pitch-paying ledges (`et_dock`, `et_quay`), fish & kelp landings (`et_fish_landing`) |
| **D7** | **`dark_water_vault`** (*Subterranean Palagonite Sea-Cave & Coal Slip*) | Subterranean (`0..+18 m` under `+115 m` bluff) | `KCAVERN` / `KSPELEO` cut-lots | `180` (`35` hh, vault guards & tunnelers) | `140 × 55 m` flooded palagonite cavern + **`640 m` Western Bolt-Hole Sea-Tunnel**: hidden wet-berths for `6` blockade-luggers, rock-cut **Contraband Silk & Alabaster Dry-Vaults** at `+22..+38 m` accessed by interior hoist-shafts, and coal-barge unloading wharf |

### 3.3 Engineering highlight: The Four `90-Second` Tsunami Cliff-Hoists & Warning Chain
1. **Two-Source Early Warning (`CROOK-RIA-DECISIONS.md` §1.5):**
   - *Near-Field `Steaming Seamounts` (`533–561 km` WSW, `48–72 min` wave travel):* Felt seismic P-waves and distant Surtseyan thunder alert the **Seamount-Watch Beacon (`D1`)** `50 minutes` before arrival.
   - *Far-Field `Farside Tsunami Shields` (`3.5–6.3 hr` silent Ghost Tsunamis, `0` felt quake):* Inside the `640 m` western bolt-hole tunnel sits an exile-built **`Hueru-Kuran`-inspired Drawdown Float-Well** coupled to a `cFlīt-qBōn` bronze-jar hydrophone — when pre-wave ocean withdrawal drops sound water `-2 m`, a counterweight trips the **Great Nickel-Bronze Rim Gong** `22–28 minutes` before the bore hits!
2. **Counterweighted Twin-Chain Boat & Cargo Cliff-Lifts (`bp_cliff_hoist`, `0 → +88 m`):**
   - Recessed into four vertical quarry-slots cut along natural radial basaltic dike walls dropping from `D2` (`+88 m`) to `D6` (`+2 m`).
   - Each hoist pairs a **`22 × 6.5 m` ironkneepodocarp boat-cradle** (suspended on rustproof `nickel = 180` steel link-chains over `3.2 m` bronze-bushed sheaves from `kits/port`) with a **vertical scoria-and-springwater counterweight shaft**: opening a `+92 m` palagonite spring-cistern sluice floods a `45-ton` iron-bound ballast tank inside the cliff shaft, hoisting an entire `18 m` loaded blockade-lugger (or `12` contraband silk/grain crates + `30` dockhands) **`86 m` vertically in `90 seconds` flat** — while permanent rock-cut zig-zag *via ferrata* stairs clear remaining cove crews to `+85 m` in `< 6 minutes`!

---

## 4. Complete Voth 44-Trade Census Mapping & `SIM` Economy

### 4.1 `BP_TRADES`: 100% Voth Census Alignment (`tools/check_trades.py` contract)

Inherits `ET_TRADES` (`kits/eternian/src/68-et-trades.js`, **42 of 44 active**, **2 `na`** — notably activating `envoys and embassy staff` at the Syndicate's Truce Envoy Guest-Court). Workforce + dependents across all 42 active trades sum to **`5,000` residents (`1,020` households)**:

| # | Voth Census Trade | `ET.def` / `bp_*` Keys | District | Workers (HH) | Exile / Smuggler Role on `Battered Isle` |
|---|---|---|---|---|---|
| 1 | `bakers` | `et_bakehouse` | `D4` | `38` (`18`) | Sweet-potato/wheat sea-hardtack & coal-steamed buns |
| 2 | `butchers` | `et_butcher` | `D4, D6` | `28` (`14`) | Salted cliff-goat, `soundseal`, & pickled sea-stores |
| 3 | `weavers and dyers` | `et_weaver` | `D4` | `54` (`26`) | Black tan-bark lugger sails & re-baled `Spider Lake` silk |
| 4 | `brewers` | `et_brewhouse` | `D4` | `32` (`15`) | Taro/berry sea-rum, `alecap` cave-stout & spiced `Crook` grog |
| 5 | `tanners` | `et_tannery` | `D3` | `24` (`12`) | Waterproof `soundseal` & goat-hide storm oilskins |
| 6 | `shipwrights and boatbuilders` | `et_dock` | `D2, D6` | `95` (`42`) | Perched `+88 m` lugger-ways & Kettle `ironkneepodocarp` careening |
| 7 | `innkeepers and grooms` | `et_inn` | `D2, D4` | `46` (`20`) | Shore-hostels for blockade crews & pack-goat handlers |
| 8 | `town guard` | `et_gate` | `D1, D4` | `64` (`28`) | Rim Watch keeping censorate spies & press-gangs out |
| 9 | `coast guard` | `et_quay` | `D6, D7` | `78` (`32`) | Dike-Jaw Chain-Boom gunners & `Dark-Water` tunnel sentries |
| 10 | `temple priests and servants` | `et_ancestor_gallery` | `D1` | `16` (`8`) | **Hall of Lost Ships** (open-eyed wooden figureheads, zero Heirs!) |
| 11 | `shrine keepers` | `et_shrine_niche` | `D4, D6` | `12` (`6`) | Harbour storm-lanterns & driftwood memorial niches |
| 12 | `shopkeepers and assistants` | `et_shophouse` | `D4` | `110` (`52`) | Ship-chandlers, chart-sellers, contraband retail stalls |
| 13 | `smiths and craftsmen` | `et_smithy` | `D3` | `125` (`56`) | **Nickel-Steel & Cupronickel** blades, hoist-chains, spear-sockets |
| 14 | `innkeepers and servers` | `et_tea_house` | `D2, D4` | `58` (`26`) | `plugcrest` leaf-infusion houses & factor deal-parlours |
| 15 | `porters and warehousemen` | `et_warehouse` | `D2, D7` | `135` (`58`) | Contraband silk/alabaster cave-vaults & rim strongrooms |
| 16 | `industrial workers` | `et_kiln`, `et_tile_works`, `et_porcelain`, `et_paper_mill`, `et_kelp_kiln` | `D3` | `165` (`72`) | `coal = 201` coke ovens, palagonite hydraulic lime, "Unsealed Celadon", rag/hemp chart-paper & kelp-potash |
| 17 | `power-house stokers and engineers` | `et_tube_station`, `bp_cliff_hoist` | `D2, D6` | `52` (`24`) | **Four `90s` Cliff-Hoist sluice/winch engineers** & court message-tubes |
| 18 | `household service` | `et_official_villa` | `D2` | `60` (`22`) | Stewards, bodyguards & cooks of the Nine Factor-Houses |
| 19 | `soldiers` | `et_barracks` | `D1, D7` | `120` (`48`) | Syndicate boarding-marines & bluff artillery crews |
| 20 | `teachers and scholars` | `et_examination_hall` | `D1` | `28` (`14`) | **Multi-Tongue Navigation, Hydrography & Cipher Academy** |
| 21 | `guild officers and clerks` | `et_registry` | `D1, D2` | `48` (`22`) | **Council of Bare Lintels** share-clerks & lading-book keepers |
| 22 | `customs officers and clerks` | `et_customs_house` | `D2, D6` | `42` (`19`) | Syndicate `8%` Safe-Conduct & Prize-Court assayers |
| 23 | `healers and nurses` | `et_healer` | `D4` | `34` (`16`) | Sea-surgeons, pressure-sickness & scurvy hospice |
| 24 | `priests and undertakers` | `et_mask_house` | `D4` | `18` (`9`) | **Wash-Face Identity Forgers** (erasing State brands) & sea-burials |
| 25 | `lighthouse keepers` | `et_lighthouse` | `D1` | `18` (`8`) | **Seamount-Watch Beacon, Drawdown Float-Well & Tsunami Gong** watch |
| 26 | `dockers and stevedores` | `et_quay` | `D6, D7` | `145` (`62`) | Kettle cradle-riggers & nocturnal sea-cave cargo gangs |
| 27 | `river bargemen and quay hands` | `et_canal_landing` | `D6, D7` | `85` (`36`) | **`Double Delta` shallow-draft leeboard skiff crews** & tunnel boatmen |
| 28 | `fishers` | `et_fish_landing` | `D6` | `115` (`50`) | Strait herring/squid netters, `dikechiton` & `soundkelp` harvesters |
| 29 | `market traders` | `et_market_hall` | `D2, D4` | `72` (`34`) | Hexagonal Prize-Bazaar auctioneers & bullion changers |
| 30 | `farmhands and ploughmen` | `et_farmstead`, `et_terraces`, `et_wrack_heap` | `D5` | `160` (`68`) | Wrack-manured scoria-terrace `sweet-potato`, `yam` & `hemp` growers |
| 31 | `chinampa growers` | `et_paddy` | `D5` | `44` (`20`) | Basal palagonite spring-fed `taro` & `tuffcress` wet-beds |
| 32 | `orchardmen` | `et_tea_garden` | `D5` | `36` (`16`) | Misty upper-rim `tea` bushes & `covepandan` fiber groves |
| 33 | `miners` | `et_mine` | `D3` *(+SE)* | `110` (`46`) | Upturned `coal = 201` seam colliers & `nickel = 180` garnierite diggers |
| 34 | `quarrymen and masons` | `et_quarry`, `et_lime_kiln` | `D3` | `52` (`23`) | Scoria/basalt plinth masons, tuff-tunnelers &lintel-chisellers |
| 35 | `granary keepers and millers` | `et_granary` | `D5` | `28` (`13`) | Tsunami-proof `+105 m` vaulted basalt grain & hardtack stores |
| 36 | `beetle herders` | — | — | `na` | No giant beetles in NW Krator |
| 37 | `dairymen` | `et_goat_fold` | `D5` | `30` (`14`) | Feral-derived `Farside` crag-goat cheese & milk folds |
| 38 | `swineherds and duck keepers` | `et_stock_pens` | `D5` | `26` (`12`) | Yard pigs, cove ducks & salt-pork curing sheds |
| 39 | `mushroom growers` | `et_mushroom_cellar` | `D5, D7` | `22` (`10`) | Dark mined-out palagonite tuff `alecap` & `pale-fungi` vaults |
| 40 | `envoys and embassy staff` | `et_official_villa` *(v1)* | `D2` | `24` (`10`) | **Truce Envoy Guest-Court** (`Yonni`, `Hueru-Kuran`, `cFlīt-qBōn`, `Ria`) |
| 41 | `ferrymen` | `et_ferry_landing` | `D6` | `32` (`14`) | SE `coal = 201` colliery coaster-shuttle & strait pilot-cutters |
| 42 | `elephant bug handlers` | — | — | `na` | No elephant bugs in NW Krator |
| 43 | `monks and lay brothers` | `et_historians_house`, `et_printer` | `D1` | `24` (`11`) | Exiled Order of Historians & **Free Block-Press** (`sã-ma`/Latin) |
| 44 | `palace and canton staffs` | `et_ministry` | `D1` | `30` (`14`) | **Unmasked Counting-Court** arbiters, signalers & cipher stewards |

*(Active workers: `2,535` + `2,465` elders, children, and sea-rotation mariners across `1,020` households = **`5,000` residents**.)*

### 4.2 Annual `SIM` Mass-Balance & Workshop Closure (`5,000` Citizens, `Ruling #1`)

- **Potable Water (`100%` On-Island):** Four `+92 m` basal palagonite tuff-contact springs (`85 L/s` = `7,340 m³/day`) feed vaulted basalt rim-cisterns (`WATER.still`) and stepped street rills (`WATER.flow`), immune to saltwater tsunami contamination.
- **Food Balance (`800 t/yr` staple equivalent at `160 kg/person/yr`):**
  - *On-Island Siege-Proof Floor (`460 t/yr`, `57.5%`):* `240 t` wrack-manured cinder-terrace `sweet-potato`, `yam`, `taro`, and `greens` (`D5`); `150 t` Kettle/strait fish, squid, `dikechiton`, and `soundseal`; `45 t` crag-goat dairy/meat & `stackpetrel` eggs; `25 t` palagonite cellar `alecap` & `pale-fungi`.
  - *Smuggled Staple Imports (`340 t/yr`, `42.5%`):* `220 t` `Lower Ria` wheat/rice via nocturnal `Double Delta` skiffs + `120 t` lowland rice/beans back-hauled from `Farside` coves and `Shroudhills` barter.
- **Industrial & Contraband Ledger (`SIM.stocks('battered_port')`):**
  - **Coking Coal (`coal = 201`):** `1,400 t/yr` mined from the upturned SE vent-collar → `650 t` local crucible steel, hydraulic pozzolan-lime, celadon/brick kilns & rim bathhouses; **`750 t` exported** to `Yonni` Spear-Queen forges and `Farport` night-coasters.
  - **Corrosion-Proof Nickel-Steel & Cupronickel (`nickel = 180` + `iron = 40` + prize scrap):** `180 t/yr` smelted in `D3` → `55 t` local cliff-hoist chains, chain-boom links, and hull bolts; **`125 t` exported** as prized rustproof spear-sockets, cutlasses, wire-saws, and marine fittings.
  - **Contraband Clearinghouse:** Clears `38 t/yr` untaxed `Spider Lake` gossamer-silk, `ria-amber`, and `Lodestone` `Superconductors` SW, against `45 t/yr` `Crook` `emerald-nephrite`, `whale-oil`, `cFlīt-qBōn` `Paktong`, stolen Eternian `alabaster`/`celadon`, and uncensored block-books NE/SSW (`8%–15%` Syndicate brokerage).

---

## 5. Quests, Factions & Playable Hooks (`core/city` & `KDOOR` / `SIM` Ready)

1. **"The Unmasked Ledger" (Sanctum Counter-Espionage vs. Defector Ferry):** A *Wardens*-faction Sanctum *Blade-Stalker* (`eternian` `heir_stalker` in `peoples.json`) has infiltrated `Bè-tõ-pò` disguised as a `Farport` porcelain defector to steal the *Wash-Face Seat*'s cipher book naming sympathetic customs mandarins inside `Farport` (`248, 585`) and `Lux` (`495, 645`). Players inspect chiselled lintel marks, `KDOOR`-locked strongrooms in `D2`, and the Free Block-Press type-trays before the assassin escapes out the `640 m` `Dark-Water` bolt-hole tunnel.
2. **"Ninety Seconds to Bare-Stone" (Live Tsunami Hoist Emergency):** Distant `38 Hz` `Steaming Seamounts` thunder triggers the Rim Gong (`52-minute` countdown). Four vessels in the Kettle—a `Yonni` Twin-Envoy galley, a `Spider Lake` silk skiff, a battered lugger packed with `Farside` defectors, and a rival factor's prize-ship—compete for the **four Cliff-Hoist cradles** when a sabotaged spring-sluice jams Hoist #3!
3. **"The Ghost-Silk Bypass" (`Double Delta` → `Ria Sound` Run):** Pilot a `0.65 m`-draft leeboard delta-skiff from the Kettle into `Double Delta`'s mist-shrouded sponge channels by night, evading the Western Dynasty's gilded 5-headed *Uktena* patrol-barges (`riaWestPalaceBarge`) off `Ria Sound` (`626, 140`) to meet an `Arcflow` *Veche* factor carrying `Spider Lake` silk and `Lodestone` `Superconductors`.
4. **"Mirror-Lance Charter" (`Yonni` Spear-Queen Treaty):** Broker the annual `coal = 201` & nickel-steel spearhead pact in the Truce Envoy Court (`D2`) between the Crucible-Master and a `Yonni` *Field-Queen* dyad (`Sfīra-Kandē`) demanding an embargo on navigational charts sold to `Lower Ria`.

---

## 6. Numbered `src/` Architecture, `[G data]` Schemas & Phased Rollout

### 6.1 Fragment Map (`settlements/battered-port/src/`)

| Fragment | `PORT.md` Tag | Responsibility |
|---|---|---|
| `00-head.html` / `99-tail.html` | `[web]` | Self-contained HTML shell |
| `10..39` *(from `core/` & `kits/`)* | `[G data]` / `[web]` | `KRAND`, `KMASK`, `KSPACE`, `KTAGS`, `KDRAWN`, `KCITY` (`10..54`), `KCOAST`, `KSTRATA`, `KCARVE`, `KSTACKS`, `KRELIEF`, `KCAVERN`, `KSPELEO`, `KGROUND`, `KFAR`, `KHORIZON`, `KDOOR`, `KGLASS`, `KWALK`, `KSHADOW`, `WATER`, `ATMOS`, `SIM`, `ET.def` (`kits/eternian`), `kits/ringsea`, `kits/port`, `BATTER` (`biomes/batteredisle`), `CROPS`, `kits/resources` |
| `40-bp-cinder-site.js` | **`[G data]`** | `BP_SITE`: `(435, 259)` / `+115 m` local `4.8 × 4.8 km` worn parasitic cinder-cone heightfield, `+138 m` volcanic plug, `820 m` breached Kettle lagoon, `110 m` feeder-dike jaws, `640 m` palagonite bolt-hole cavern/tunnel (`KCAVERN` + `KSPELEO`), and `4` `+92 m` spring lines |
| `42-bp-tune.js` | **`[G data]`** | `KCITY` `TUNE` & `BP_TRADES` (`42/44` active), district polygons (`D1–D7`), `stance: 'door'` scoria-terrace footing rules, and tsunami-trimline predicate (`rules.groundOk` barring dwellings below `+85 m`) |
| `45-bp-city-steps.js` | **`[G data]`** | Runs **KCITY Instance A (`rim`)** (`+85..+138 m`, ~`910` lots) and **Instance B (`cove`)** (`+2..+32 m` quays + `Dark-Water` sea-cave vaults, ~`75` lots), stamping footprints into `KSPACE` |
| `48-bp-exile-dress.js` | **`[G data]` / `[web]`** | Non-destructive Exile Adapter over `ET.def` records: dark red-black scoria/basalt plinths, **chiselled-blank / driftwood lintels (`0` closed-eyed household masks, `0` Heirs' gold colossi)**, cantilevered `ironkneepodocarp` sea-galleries |
| `55-bp-hoists-fleet.js` | `[G partial]` | **Four `90s` Counterweighted Twin-Chain Boat & Cargo Cliff-Hoists (`bp_cliff_hoist`)**, `110 m` Dike-Jaw Nickel-Steel Chain-Boom, Seamount-Watch Tsunami Gong-Frame, and `kits/ringsea` smuggler fleet (`bpBlockadeLugger`, `bpDeltaSkiff`, `Yonni` galley, `arkScoutTri`) |
| `60-bp-sim.js` | **`[G data]`** | Partitioned `SIM.settlement({id: 'battered_port', pop: 5000})`, `1,020` households, `coal = 201` / `nickel = 180` / `wood = 255` production chains, and the **4 Smuggler Ring carrier routes** |
| `70-bp-chars.js` | `[web]` | `core/charactermodels` crowd bindings: unpainted `eternian` exiles, `Farport`-creole dockhands, visiting `yonni` dyads & `hueru-kuran` traders |
| `85-bp-world-scene.js` | `[web]` | Assembles `KSTRATA`, `KGROUND` (`<= 5` layers), `KCAVERN.cutLayer` (sea-cave & bolt-hole entrances), `BATTER` surrounding flora, `WATER.open`/`still`/`flow`, `ATMOS` (`1.58 atm` sky & forge smoke) |
| `99-bp-host-take.js` | `[web]` | `KHOST.take`, `[Normal Port] / [Hoist Drill — 90s Lift] / [Tsunami Surge]` interactive toggle, stocks/contents inspector, compliant preset views |

### 6.2 `KCITY` Dual-Instance, Exile-Dress & `SIM` Route Schemas (`[G data]`, Godot-ready)

```js
/* 1. Dual KCITY instances sharing KSPACE on the worn cinder-cone rim & breached Kettle (45-bp-city-steps.js) */
const rimCity = KCITY.create({
  name: 'battered_rim',
  seed: 435259,
  rand: 'krand',
  index: { order: 'insertion' },
  kit: { dims: BP.dims },
  ground: BP_SITE.ground,
  site: BP_SITE.rimSite,           /* D1..D5 horseshoe bench +85..+138 m */
  tune: Object.assign({}, BP_TUNE, { exact: true, stance: 'door', stanceOpt: { maxDrop: 6.5, cut: 4.5 } }),
  rules: {
    groundOk: function (bo, lot) {
      /* Hard tsunami-safety rule: zero residential/granary/civic footprints below +85.0 m! */
      return BP_SITE.minCornerElev(bo) >= 85.0 && KCITY.reliefOk({ maxRelief: 6.5, dry: true })(bo, lot);
    }
  },
  tags: 'battered-port'
});

/* 2. Non-destructive Exile Dress delta record keyed by stable lot id (48-bp-exile-dress.js, [G data]) */
/* Exported in krator-city deltas so web Three.js and Godot 4.7.2 apply identical lintel & plinth swaps */
function bpExileDressRecord(lot, cellRng) {
  const roll = cellRng.float();
  return {
    lotId: lot.id,
    plinthMat: lot.district === 'D1' ? 'basalt.columnar' : 'scoria.oxidized_dark',
    mortarMat: 'tuff.palagonite_lime',
    doorMaskMode: roll < 0.75 ? 'chiselled_blank' : (roll < 0.95 ? 'driftwood_board' : 'open_eyed_figurehead'),
    seaGallery: lot.rimFacing === true && lot.h >= 7.0,
    forbidGold: true,
    forbidCyanStrip: true
  };
}

/* 3. Four Smuggler Ring SIM.trade sea-corridors (60-bp-sim.js, [G data]) */
const BP_SMUGGLER_ROUTES = [
  { id: 'ring:farport_night',   vessel: 'bpBlockadeLugger', distKm:  752, contraband: true,
    out: ['spider_silk', 'ria_amber', 'jade', 'paktong', 'uncensored_books'],
    inn: ['defectors_mail', 'alabaster', 'celadon', 'circuit_glass', 'rice'] },
  { id: 'ring:yonni_strait',    vessel: 'yonniTradeGalley', distKm:  364, contraband: false,
    out: ['coke_coal', 'nickel_steel_arms', 'marine_rivets'],
    inn: ['saltpeter', 'tin', 'amber', 'farside_prize_goods'] },
  { id: 'ring:crook_whalerun',  vessel: 'hkWhaler',         distKm: 1010, contraband: true,
    out: ['glazed_wares', 'nickel_wiresaws', 'sail_hemp', 'tea'],
    inn: ['jade', 'whale_oil', 'ambergris', 'paktong', 'crook_brandy'] },
  { id: 'ring:delta_silkbypass',vessel: 'bpDeltaSkiff',     distKm:  450, contraband: true,
    out: ['celadon', 'alabaster', 'jade', 'nickel_fittings', 'saltpeter'],
    inn: ['spider_silk', 'ria_amber', 'bitumen', 'superconductors', 'wheat'] }
];
```

---

## 7. `build.py` / `verify.py` Contracts, M6 Export Profile & Rollout (`BP0–BP6`)

### 7.1 `build.py` & `verify.py` (`tools/harness.py` — no pasted launcher)

```python
#!/usr/bin/env python3
"""Build settlements/battered-port -> dist/battered-port.html."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib, build_sources, catalog as kcat
from textures import matlib_pack

buildlib.through_tools_build(__file__)   # emits build-inputs.json & enforces LFS refusal
# Reads core/city, core/simulation, core/terrain (incl. KCAVERN/KSPELEO/KCARVE),
# kits/eternian, kits/ringsea, kits/port, and biomes/batteredisle in place;
# calls build_sources.report() before writing UTF-8 LF HTML.
```

```python
#!/usr/bin/env python3
"""Verify settlements/battered-port via shared tools/harness.py."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness

if __name__ == '__main__':
    harness.main(
        pages={'main': 'dist/battered-port.html'},
        default_page='main',
        checks=harness.SURVEY + ['voth-trades', 'exile-unmasked', 'rim-tsunami-floor', 'hoist-clearance', 'sim-stocks'],
    )
```

### 7.2 Phased Rollout (`BP0–BP6`), M6 Export & Hard `--assert` Invariants
- **`BP0`:** Land `PLAN.md`; register `"settlements/battered-port"` in `tools/checks_optin.json` (`recorded`, `samplers`, `drawn-ground`, `names`) and `PLACED` in `tools/check_core_use.py` when wired to `biomes/batteredisle`.
- **`BP1`:** Implement `[G data]` site & city layout (`40-bp-cinder-site.js`, `42-bp-tune.js`, `45-bp-city-steps.js`) and pass `node settlements/battered-port/tests/test-bp-city.js` (`~985` lots placed in `< 2.5 s`, `0` overlaps, `0` lots on streets, golden placement hash).
- **`BP2`:** Wire `kits/eternian` in place + `48-bp-exile-dress.js` (`voth-trades` check passing `42/44` active, `2 na`; `KDOOR` leaves and `KGLASS` panes active on all closed bodies).
- **`BP3`:** Build the drowned Kettle harbor, `KCAVERN.cutLayer` `Dark-Water` sea-cave & `640 m` bolt-hole tunnel, `110 m` Dike-Jaw Chain-Boom, and the **Four `90s` Cliff-Hoists** + `kits/ringsea` smuggler fleet (`55-bp-hoists-fleet.js`).
- **`BP4`:** Integrate `biomes/batteredisle` (`BATTER`) flora & tuff springs, `60-bp-sim.js` `5,000`-pop economy & 4 contraband sea-lines (`node tests/test-bp-sim.js` 30-day positive food/water/coke stocks proof), and `70-bp-chars.js` unpainted exile & creole crowds.
- **`BP5–BP6`:** Satisfy the M6 `EXPORT.check` profile (`terrain`, `city` [both `rim` & `cove` `KCITY` plans + `exileDress` deltas], `records`, `fixtures`, `interiors`, `furniture`, `sim`, `materials`, `textures`, `atmos`, `stage`), Godot `4.7.2` headless import test, and `python3 tools/test_all.py`.
- **Hard `verify.py --assert` Invariants (`T.ok` + `T.neg`):**
  1. **Tsunami-Safe Upper Town (`rim-tsunami-floor`):** `100%` of residential, civic, academy, and granary lots (`D1–D5`) stand at **`y >= +85.0 m`** (`T.neg`: `0` dwellings below `+82 m`); only harbour/vault works (`D6–D7`) occupy `0..+38 m`.
  2. **Unmasked Exile Orthodoxy (`exile-unmasked`):** Asserts **`0` Heirs' gold colossi**, **`0` cyan active host strips**, **`0` white-painted NPC faces**, and **`0` closed-eyed ancestor door-masks** on residential/shop lintels (`T.neg` inverting `kits/eternian`'s `closed-eyes` orthodoxy!), while `100%` of doors carry `chiselled_blank`, `driftwood_board`, or `open_eyed_figurehead` records (`T.ok`).
  3. **Breached-Crater Cavern & `90s` Hoist Clearance (`hoist-clearance`):** All `4` `bp_cliff_hoist` vertical shafts run unobstructed from `+2 m` Kettle water to `+88 m` `D2` rim winches; `Dark-Water` sea-cave & `640 m` bolt-hole tunnel maintain `>= 6.5 m` mast/headroom clearance (`KCAVERN.cutLayer` & `KDRAWN` positive eye clearance, `0` rock-cut z-fighting).
  4. **Voth Census & `SIM` Closure (`voth-trades` + `sim-stocks`):** `check_trades.py` passes (`42` carried, `0` gaps, `2` `na`); `SIM.stocks('battered_port')` sustains `5,000` citizens over `30` simulated days with active imports/exports on all `4` smuggler corridors, `< 15` active shader samplers, `KSHADOW` off at load, and compliant preset view names (`overview`, `kettle-lagoon-jaws`, `cliff-hoist-gantry`, `dark-water-sea-cave`, `bare-stone-citadel`, `unmasked-stepped-street`, `crucible-forge-terrace`, `bolt-hole-tunnel`).

---

## 8. Cliff-Hoist Mechanics, Smuggler Fleet, Crowd Overrides & M6 Export Schemas

### 8.1 Mechanical Cliff-Hoist & Smuggler Hull Registry (`src/55-bp-hoists-fleet.js`)

| Asset / Vessel Key | Base Kit Read in Place | Dimensions & Rig | Mechanical / Gameplay Specification |
|---|---|---|---|
| **`bp_cliff_hoist`** *(×4: Hoists #1–#4)* | `kits/port` gantry sheaves + `ET` scoria/basalt pier towers | `22 × 6.5 m` cradle, `86 m` vertical travel (`+2 → +88 m`) | Twin `nickel = 180` steel chains over `3.2 m` bronze sheaves, driven by a `45 t` palagonite spring-water counterweight tank inside a rock-cut radial-dike slot (`90 s` full lift under `[Hoist Drill]`) |
| **`bp_dike_boom`** | `kits/port` capstan + `ET` `et_wall_tower` *(×2)* | `110 m` span across East/West Feeder-Dike Jaws | Heavy forged cupronickel/steel chain floated on tarred `ironkneepodocarp` balks; drops to `-9 m` for friendly hulls, winches taut at `+0.5 m` in `45 s` to snap enemy keels |
| **`bpBlockadeLugger`** | `kits/ringsea` (`87-rs-voth-dhow` / `89b-rs-islander-lanong` hull & rig parts) | `19.5 × 4.8 m`, `1.6 m` draft, twin dipping-lug black tan-bark sails | Hinged tabernacle masts fold flat in `60 s` to enter the `Dark-Water` sea-cave (`+6.5 m` crown) or ride `bp_cliff_hoist` cradles up to `+88 m`! |
| **`bpDeltaSkiff`** | `kits/ringsea` (`80-rs-iziz-lighter` / `85-rs-voth-barge` shallow hull) | `13.0 × 3.6 m`, **`0.65 m` draft**, twin pivoting leeboards & mottled reed-mat sail | Skims over `Double Delta` tsunami shoals and reed-beds to bypass `Ria Sound`'s glazed-brick customs water-gates (`626, 140`) |
| **`yonniTradeGalley`** *(visiting)* | `kits/ringsea` (`65-rs-hyk-galley` dressed w/ `Yonni` round bronze shields) | `26.0 × 5.4 m`, single bank + lateen | Moored at the Truce Berth in the Kettle offloading `Shroudhills` `saltpeter = 200`, `tin = 200`, and `Farside` raid prizes |
| **`arkScoutTri` & `hkWhaler`** *(visiting)* | `kits/ringsea` (`89f-rs-ark-trimaran`, `89h-rs-hk-whaler`) | Read directly in place | `cFlīt-qBōn` & `Hueru-Kuran` outer-corridor traders anchored just inside the Kettle jaws |

### 8.2 Unpainted Exile & `Farport` Creole Crowd Presets (`src/70-bp-chars.js` on `core/charactermodels`)

Reads `core/charactermodels/data/peoples.json` in place (zero edits to `core/charactermodels/`), overriding surface tint & headgear rules per citizen cohort:
1. **Unpainted Eternian Exiles (`62%` of `5,000`):** Draws `eternian` ancestry/body morphs (`skin: ['#ebd3be', '#d8b496', '#c09674']` natural sun-tanned skin — **white rank-paint and black censorate face-stripes strictly disabled**), wearing stripped/redyed indigo, charcoal, and sea-russet `eternian_*_prefect_robe` / work-tunics paired with oilskin sea-coats and bare heads or straw/tarred-canvas hats (zero Heirs' metallic skin, zero hologram halos!).
2. **`Farport` Three-Way Maritime Creole Riggers & Pilots (`28%`):** Mixed `eternian` + coastal `Hayrant`/`Hueru-Kuran` morphs (`CROOK-RIA-DECISIONS.md` §1.2.3) in sleeveless hemp/seal-hide rigger vests, carrying coiled hoist-lines, nephrite tide-charms, and boat-hooks.
3. **Truce Quarter Factors & Mariners (`10%`):** Visiting tall, broad-shouldered **`Yonni` Spear-Queen twin-sister envoys** (paired identical morph seeds!), **`Hueru-Kuran`** whale-oil merchants, and **`cFlīt-qBōn`** free-divers inspecting the Kettle's submerged chain-boom swivels.

### 8.3 `site/battered-site.json`, `materials.json` & M6 `EXPORT.check` Profile

```json
{
  "settlement": "battered_port",
  "name": "Bè-tõ-pò (Bare-Stone Port)",
  "pinPx": [435, 259],
  "rimBenchElevM": 115.0,
  "plugSummitElevM": 138.0,
  "kettleRadiusM": 410.0,
  "kettleDepthM": -28.0,
  "jawWidthM": 110.0,
  "boltHoleLengthM": 640.0,
  "districts": [
    { "id": "D1", "key": "plug_citadel",     "tier": "rim",  "elevBand": [122, 138], "strategy": "frontage-courts" },
    { "id": "D2", "key": "factor_rim",       "tier": "rim",  "elevBand": [108, 124], "strategy": "frontage-courts" },
    { "id": "D3", "key": "crucible_terrace", "tier": "rim",  "elevBand": [ 96, 116], "strategy": "alleys" },
    { "id": "D4", "key": "creole_steps",     "tier": "rim",  "elevBand": [ 88, 112], "strategy": "alleys" },
    { "id": "D5", "key": "spring_gardens",   "tier": "rim",  "elevBand": [ 85, 105], "strategy": "fields" },
    { "id": "D6", "key": "kettle_harbor",    "tier": "cove", "elevBand": [  2,  32], "strategy": "harbor" },
    { "id": "D7", "key": "dark_water_vault", "tier": "cave", "elevBand": [  2,  24], "strategy": "cavern-lots" }
  ]
}
```

```json
{
  "slots": {
    "plinth_scoria":  "rock.volcanic.scoria",
    "plinth_basalt":  "rock.basalt",
    "mortar_tuff":    "rock.tuff",
    "wall_lime":      "stucco.white",
    "roof_grey":      "roof.tile",
    "roof_celadon":   "tile.glazed",
    "metal_cuproni":  "metal.verdigris",
    "metal_nickel":   "metal.iron",
    "wood_drift":     "wood.gnarled",
    "ground_scoria":  "ground.volcanic_ash",
    "ground_cobble":  "ground.gravel019",
    "strata_coal":    "rock.coal"
  }
}
```
*(Active shader sampler budget: `KGROUND` `4` + `KSTRATA` `2` + `ATMOS` `3` + `KHORIZON` `1` + `KSHADOW` `1` on demand = **`11` samplers**, strictly `< 15`.)*

```js
/* Required M6 canonical export profile (checked by verify.py --assert before Godot 4.7.2 import) */
const BP_EXPORT_PROFILE = [
  'terrain',     /* krator-field 1:1 cinder-cone + Kettle bathymetry + KCAVERN sea-cave & bolt-hole cuts */
  'city',        /* both KCITY instances ('battered_rim', 'battered_cove') + bpExileDressRecord deltas */
  'records',     /* all ~985 placed ET.def buildings, 4 cliff-hoists, dike chain-boom, and smuggler vessels */
  'fixtures',    /* KDOOR interactive leaves, KGLASS panes, storm-lanterns, chiselled/driftwood lintels */
  'interiors',   /* kits/interiors/sets/eternian.js rooms for Counting-Court, Free Press & Factor Villas */
  'furniture',   /* catalog placements (indexed KF.batch({indexed:true})) */
  'sim',         /* 5,000 citizens, 1,020 households, stocks('battered_port'), and 4 smuggler sea-routes */
  'materials',   /* deduplicated kits/eternian + biomes/batteredisle library sets (< 15 active samplers) */
  'textures',
  'atmos',
  'stage'
];
```
- **Godot `4.7.2` Twin Parity (`godot/tests/export/battered_port_test.gd`):** Because `BP_SITE`, `KCITY` (`rand: 'krand'`), `bpExileDressRecord`, and `60-bp-sim.js` keep `100%` of layout, lintel/plinth deltas, hoist trajectories, and smuggler ledgers in engine-neutral `[G data]` records keyed by stable ids, Godot `4.7.2` reconstructs the exact crescentic crater-rim port, unmasked lintels, sea-cave cuts, and `90-second` cliff-hoists without divergence.



