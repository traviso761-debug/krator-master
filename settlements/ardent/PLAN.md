# Ardent: Narrow-Cobbled Burgh of the Nine Clans, Clanthing & Silk-Trail Muster (`sn6y4sx8tr`, `px 830, 553`)

**Status:** Built & verified on Scale Model 5.1 (`2026-11-27`)  
**Canonical Pin:** `id: "sn6y4sx8tr"`, `name: "Ardent"`, `type: "city"`, `px: 830`, `py: 553`, `polity: "Free Clans"` (`8,000` on-screen / `27,200` Free Clans total across `FC1–FC4`)  
**5.1 World Frame (`origin 1191, 1569`, `2,000 m/px`):** `x = -722,000 m` (`722.0 km` W), `z = -2,032,000 m` (`2,032.0 km` N), ground **`+2,801.9 m`**, pressure **`1.127 atm`**, climate **`Cfa` (`2,055 mm/yr`)**

Grounded in [`LORE.md`](../../LORE.md) (§6.2–6.4, §11), [`PROPOSAL-ARDENT-JIMJAM.md`](../../core/simulation/PROPOSAL-ARDENT-JIMJAM.md), [`MERCENARIES-SCOPE.md`](../../core/region/MERCENARIES-SCOPE.md) (`MC-06`), [`BANDITS-PIRATES-BOUNTIES-SCOPE.md`](../../core/region/BANDITS-PIRATES-BOUNTIES-SCOPE.md) (`BF-04`), and [`kits/highlands`](../../kits/highlands/README.md) (`80–82`).

---

## 0. What the Build Is & Core Adoption

Ardent is the quaint, tightly packed upland burgh and moot-seat of the **Free Clans** — reformed Hajlandsk highland reivers (*Rajvrar*) whose nine chiefs swore the **Peace of the Nine Stones (*Najn-Stajn Fredet*)** around the Bronze Oath-Anvil above the town, outlawing home-raids under pain of outlawry and channeling their martial pride into **chartered foreign mercenary bands (*Fraj-Bantar*, `MC-06`)**. Every youth must "ride two seasons" abroad before speaking at the Clanthing or raising a family stone tower (*čip*). Commanding the healthy `+2,802 m` copper-and-tin bowl right above `Serai`, `Korona`, and `Silkhead`, Ardent's **Free-Company Tolbooth** hires out sworn caravan-guards along the **Silk Trail** (`Spider Lake -> Ham-Tsek -> Korona -> Silkhead -> Serai / Shell / Jimjam`) — and when harvests fail or employers default (`>14` days unpaid), those same bands invert their clan bronze-medallions ("turning the disc", *Brøkn-Čin* / `BF-04`) and turn highwaymen along the Silk Trail themselves.

| Property | Specification |
|---|---|
| **Folder & Pages** | `settlements/ardent/` (`src/`, `build.py`, `verify.py`, `PORT.md`, `README.md`, `KNOWN_ISSUES.md`, `tests/test-ardent.js`) -> `dist/ardent.html` (+ `dist/ardent.tex.js` sidecars & `build-inputs.json`) |
| **Architectural Synthesis** | **Scottish Baronial × Caucasus (*Old Tbilisi & Svaneti/Tusheti*) × Carved Highland Rustic + Cast Bronze** (`kits/highlands` `rustic`, incl. `82-rus-baronial.js`; zero Republican or Painted-Men pieces; zero overlap with `kits/dzagh-vardzi`'s apricot tuff & quartz pyramids):<br>1. **Scottish Baronial:** Lime-harled (oatmeal, ochre, oxblood-falu) stone walls with dressed granite quoins, **crow-stepped (corbie-stepped) gables**, corbelled corner **pepperpot bartizans** under conical slate roofs, vaulted stone **pend** closes, and the **Free-Company Tolbooth** (`hl_rus_mercenary_bourse`) with its cast-bronze muster-bell spire.<br>2. **Caucasus (*Old Tbilisi & Svaneti/Tusheti*):** Intricately fret-sawn overhanging **Old Tbilisi wooden *aivani* balconies and verandas** jutting out over `3.5–7.4 m` cobbled wynds, battered stone **Svan *koshki* / Scottish peel-towers (*čipar*)** with machicolated crowns (`hl_rus_clan_koshki`, `hl_rus_tower_house`), vaulted street-level *marani* wine-and-scotch cellars (`hl_rus_marani_tavern`), and a **Georgian *darbazi* corbelled octagonal swallow-dome** crowning the Winter Law-Hall (`hl_rus_law_darbazi`).<br>3. **Walled Capital Fortifications & Cast Bronze:** Enclosed by a `570 × 570 m` circuit of battered Highland-Caucasus granite **curtain walls** (`hl_rus_burgh_wall`), machicolated Svaneti-Baronial **curtain watchtowers** (`hl_rus_wall_tower`), octagonal triple-bartizan **corner bastions** (`hl_rus_wall_bastion`), and **four twin-*koshki* gatehouses** (`hl_rus_burgh_gate`), plus an **Ardent Cast-Bronze & Verdigris** material tune (`copper:120 + tin:200`) across finials, bells, clan shields, and light mountain guns. |
| **Biomes & Resources** | `biomes/nhighlands` subalpine fir, birch, pine & heather read in place; `kits/resources` (`RES_ORE`: high-grade `copper_ore` & `tin_ore` nodes on the North Ore Hills worked by `hl_rus_mine` within `400 m`); `CROPS.forBiome('nhighlands')` (`frostoat`, `flax`, `woad`). |
| **Checks & Baseline** | Built through `tools/build.py` (`buildlib.through_tools_build`), `CORE_BIOME_MIN`, `harness.SURVEY`, opted into all checks `22–31` in `tools/checks_optin.json`, tested by `tests/test-ardent.js` (`tools/ktest.js`). |

### Core Adoption Table (Written Before the First Fragment per `README.md`)

| Module | Taken? | How Ardent Uses It (or Why Omitted) |
|---|---|---|
| `core/rand` (`KRAND`) | **Yes** | Every wynd lot, *koshki* tower, standing stone, ore node, mercenary camp, plant, and citizen seeded deterministically from `KRAND` hashes — never `Math.random`, draw-order counters, or `fract(sin())`. |
| `core/mask` (`KMASK.canvas`) | **Yes** | CPU-deterministic cobbled-wynd, plaza, burn-channel, Thing-Crag, and farm masks — never `getImageData`. |
| `core/drawn` (`KDRAWN.h`) | **Yes** | Registers the drawn terrain grid via `KDRAWN.add(KDRAWN.grid(...))` so camera presets and `SURVEY` eye/ground audits measure the actual drawn mesh. |
| `core/space` (`KSPACE`) & `core/city` (`KCITY`) | **Yes** | Full `KCITY` (`6 × 6` organic burgh grid, `half = 270 m`, street/alley subdivision, courtyard infill, 4 plazas, and `KCITY.grid.wall` curtain-wall circuit) + `KSPACE` exact-OBB non-overlap rules across `500+` structures; Rustic-only rule enforced (`branch === 'rustic'`). |
| `core/hamlet` (`KHAMLET`) | **Yes** | `KHAMLET` croft & resource steading records along the West valley floor (`frostoat`, `flax`, `woad`, sheep/cattle pens). |
| `core/camp` (`KCAMP`) | **Yes** | Pitches three sworn **Free-Company (`MC-06` *Brons-Togar*)** muster camps on the East Silk-Trail Green outside the East Gate, plus `[G data]` Silk-Trail contract/prosperity records modeling the legal escort vs. *Brøkn-Čin* (`BF-04`) bandit flip! |
| `core/tags` (`KTAGS`) | **Yes** | Every building, curtain wall, tower, gatehouse, standing stone of the Nine Clans, *koshki* keep, bridge, ore node, mercenary band, and citizen registered in `KTAGS` before drawing. |
| `core/furnish` + `kits/catalog` + `kits/interiors` | **Yes** | Indexed catalog furniture batch (`rustic`, `republican`, `iziz`, `generic`, `arms`) through `core/furnish` (`FURNISH`) at settlement detail (`0.5`). |
| `core/door` (`KDOOR`, `KGLASS`) & `core/walk` (`KWALK`) | **Yes** | Real shut hinged doors (`E` key via `90-core-door-host.js`), transparent window panes over dim room backs, and `KWALK` walkable cobbled wynds, squares, humpback bridges, and Thing-Crag stairways. |
| `core/water` (`WATER.flow`) | **Yes** | The rushing `Mēkam-āṟu` headwater burn (`Ardent Burn`) flowing past the North Curtain Wall, spanned by three `hl_rus_cobbled_bridge` humpback brigs. |
| `core/atmos` (`ATMOS.bindHost`) | **Yes** | Standard Krator skybox bound to `(830, 553)` (`+2,802 m`, `1.13 atm`) with Gas Giant & moons, highland mist/Rayleigh scatter, `#include <atmos_waves>`, and `ATMOS.skylight` PBR reflections. |
| `core/materials` (`KMAT`, `matlib_pack`) | **Yes** | Highlands PBR sidecar pack (`cobble` terrain-draped street/plaza ribbons with `polygonOffset`, `ashlarP`, `rubbleW`, `plaster`, `scale`, `shingle`, `logs`, `verdigris`, `wood`, `turf`) + **Ardent Cast-Bronze & Verdigris** material tune. |
| `core/biome` (`CORE_BIOME_MIN` + `biomes/nhighlands`) | **Yes** | Northern highlands firs (the Free Clans' emblem!), birches, pines, boulders, and heather placed outside the `KMASK` cobbled/walled footprint. |
| `core/host` (`KHOST`), `core/lod`, `core/clock`, `core/minimap`, `core/edits` | **Yes** | Shared camera (`depth: true`), toggleable Inspector (`I`), Polygon tool (`P`), walk mode, cut-away (`X`), minimap, `09-lod.js` + `97-lod-auto.js`, world clock (`lit:false` canon — hearth & foundry `vEmber` glow at night, zero electric light). |
| `core/ruins` (`KRUINS.watch`) | **Yes** | Loaded for `SURVEY` compliance. |
| `tools/harness.py` (`SURVEY`) | **Yes** | Shared Chromium launcher (`KRATOR_GPU_LANE=auto`), `SURVEY` checks, plus Ardent's own `hostChecks()` and `hostNegatives()`. |
| `core/world` (`WORLD.H`) | **No (baked 5.1 cut)** | Like `settlements/skywatch` and `settlements/dilihan`, bakes the exact Scale Model 5.1 regional elevation grid & 360° horizon at `(830, 553)` into `src/28-ar-model.js` (`build.py --bake-model`). |
| `core/coast` (`KCOAST`) | **No** | *Not applicable:* landlocked highland valley at `+2,801.9 m` (`150 km` south of Soda Lake `lbl=54`). |
| `core/engine` (`engine.py`) | **No** | *Not applicable:* composes `kits/highlands` (`VERN` / `HL` Vernacular contract) and `kits/resources` in place. |

---

## 1. Scale Model 5.1 Site & Five Walkable Zones (`px 830, 553`, `+2,801.9 m`)

At `(830, 553)`, the terrain slopes gently NW (`sl = 5.2%`) from a `+3,150..+3,490 m` granite-and-cassiterite SE ridge down toward the `+2,480 m` headwater glen of **`Mēkam-āṟu`** (`r024`). Within `16–25 km` lie rich `copper` (`120–130`), `tin` (`200`), `iron` (`180`), `emerald` (`170`), `stone` (`255`), and `wood` (`255`) lodes (`PROPOSAL-ARDENT-JIMJAM.md` §2.3 & §4.1), with **zero `coal`** (so bronze and crucible steel are smelted cleanly over highland birch/pine charcoal and upland peat).

| Zone | Local Frame `(x, z)` | Architectural & Functional Programme |
|---|---|---|
| **Zone I — The Compact High-Density Walled Narrow-Cobbled Capital (`KCITY`)** | `x ∈ [-250, +250] m`, `z ∈ [-250, +250] m` (`500 × 500 m = 250,000 m²` walled burgh, `500+` burgh buildings + `~84` wall/tower/bastion/gate pieces) | Enclosed by machicolated granite curtain walls (`hl_rus_burgh_wall`), Svaneti-Baronial watchtowers (`hl_rus_wall_tower`), octagonal triple-bartizan corner bastions (`hl_rus_wall_bastion`), and **four twin-*koshki* gatehouses** (`hl_rus_burgh_gate`: North Burn Gate, South Thing-Crag Gate, East Silk-Trail Gate, West Jimjam/Cut Gate). Inside, `KCITY` subdivides `8 × 8` organic wards plus deterministic courtyard closes into narrow `3.0–5.8 m` terrain-draped cobbled wynds, closes, and 5 paved squares (**Tolbooth Dueling Square**, **Silk-Bourse Square**, **Fir-Sign Stave Garth**, **Armourers Guild Court**, and **Capital Maltings Garth**) packed shoulder-to-shoulder with crow-stepped *aivani* houses (`hl_rus_wynd_house_a/b/c`, `hl_rus_close_row`), vaulted *pend* tenements, L-plan tower houses, *marani* cellar taverns, blade smithies, cooperages (`hl_rus_cooperage`), tartan dyeworks (`hl_rus_plaid_dyer`), juniper/sky-poppy apothecaries (`hl_rus_apothecary`), mount caravanserais (`hl_rus_caravan_stables`), Silk-Trail factor houses, and the **Capital Quadruple-Pagoda Scotch Distillery & Clanthing Spirit Customs Vault** (`hl_rus_capital_distillery`). |
| **Zone II — The Thing-Crag, Nine-Clan *Koshki* Crown & 3 Great Distilleries** | SE Citadel Spur `x ∈ [-130, +130] m`, `z ∈ [+258, +452] m` (`+24 m` above burgh) | Linked from the South Gate by the cobbled Citadel Ascent: the **Nine-Stones Thing-Stead & Bronze Oath-Anvil** (`hl_rus_thing_ring`), the ***Darbazi*-Domed Winter Law-Hall** (`hl_rus_law_darbazi`), **Dilihan's Envoy Lodge** (`hl_rus_envoy_lodge`), and a grand semicircular crown of **Nine Clan *Koshki* Peel-Towers**, **Three Chartered Clan-Seat Great Scotch & Highland Whiskey Distilleries** (`hl_rus_great_distillery`: Doig double-pagoda peat kilns, crow-stepped copper pot-still halls & Caucasus *marani* cask vaults at Clan Seats `#1` `Čin Hjartstajn`, `#3` `Čin Sjelk-Vač`, and `#5` `Čin Klip-Čip`), and **Six Flanking Clan Retinue Halls** (`18` clan structures). |
| **Zone III — The Silk-Trail Muster Green (`KCAMP`)** | East road bench `x ∈ [+276, +505] m`, `z ∈ [-135, +135] m` | Staging ground outside the East Silk-Trail Gate: artillery muster yard, Silk-Trail tollhouse, drovers' caravanserai stables (`hl_rus_caravan_stables`), inn, and **three pitched `KCAMP` Free-Company bands** (*Brons-Togar* tents, mule lines, wheeled cast-bronze field-guns, clan bronze-disc standards). |
| **Zone IV — Ardent Burn, 3 Humpback Brigs & North Foundry Suburb** | North glen `x ∈ [-245, +245] m`, `z ∈ [-440, -285] m` | `WATER.flow` mountain burn spanned by **three arched granite Humpback Brigs** (`hl_rus_cobbled_bridge`), feeding a `30+`-building industrial riverfront of **three Reverberatory Bronze Bell & Field-Gun Foundries** (`hl_rus_bronze_foundry`), non-sparking bronze-mortar **Saltpeter Powder Mills** (`hl_rus_saltpeter_mill`), bronze-hoop **Whisky Cooperages** (`hl_rus_cooperage`), watermills, charcoal clamps, tanneries, and riverside pot-still distilleries (`hl_rus_distillery`). |
| **Zone V — Copper & Tin Ore Hills (`RES_ORE`) & Valley Crofts** | North Ore Hills `z ∈ [-575, -455] m` & West Glen `x ∈ [-525, -288] m` | `8` `copper_ore` and `tin_ore` nodes (`kits/resources`) worked by `4` `hl_rus_mine` adits (`<= 400 m` nearest-node rule), plus `16` `frostoat`/flax/sheep/`koliba` cheese croft farmsteads outside the West Cut Gate. |

---

## 2. The Nine Clans, Polygon Scope (`FREE-CLANS-SCOPE.md`), Capital & Clan-Seat Distilleries & Silk-Trail Simulation

Full polygon-wide geography (`rmumc5ov15a8k`, `42,668 km²`, `27,200` single-counted souls across `FC1–FC4`) is specified in [`core/region/FREE-CLANS-SCOPE.md`](../../core/region/FREE-CLANS-SCOPE.md) and embedded as `[G data]` in `AR_LAYOUT.plan.polityScope`. Alongside the **Capital Quadruple-Pagoda Distillery** (`hl_rus_capital_distillery`, *Ardent Stør-Bränneriet* inside Zone I's Maltings Garth), every clan stone in `hl_rus_thing_ring`, every *koshki* keep & Clan-Seat Great Distillery in Zone II, and every free-company band in Zone III carries `[G data]` tags and simulation state:

1. **Čin Bjelsmidt** (*Bell-Smith*, `FC1` Ardent Bowl — Bronze Bell & Crossed Hammers): Foundry-masters, pot-still coppersmiths & mountain-gun casters.
2. **Čin Hjartstajn** ★ (*Hearth-Stone*, `FC1` Ardent Burgh — Crowned Fir & Stepped Gable): Keepers of the Burgh Peace & **1st Chartered Great Distillery (*Hjart-Bränneriet*: Ardent Hearth-Peat Single-Malt Scotch)**.
3. **Čin Torgo-Vulf** (*Market-Wolf*, `FC1` Malmdal `825,561` — Leaping Wolf & Balance): Silk-Trail brocade brokers (`pc_torgo_couture`), bronze-hoop whisky cooperages (`hl_rus_cooperage`), & clan tartan dyeworks (`hl_rus_plaid_dyer`).
4. **Čin Sjelk-Vač** ★ (*Silk-Watch*, `FC2` Österbänk `858,497` — Spindle & Crossed Lances): `Serai <-> Silkhead` caravan outriders & **2nd Chartered Great Distillery (*Öster-Bränneriet*: Caravan-Cask Gold Whiskey)**.
5. **Čin Kopardal** (*Copper-Dale*, `FC2` Koppardal `870,476` — Boar's Head & Verdigris Shield): North-scarp copper miners & timber-drovers.
6. **Čin Klip-Čip** ★ (*Cliff-Keep*, `FC3` Klippeport `744,596` & Kopparberg `798,554` — Peel-Tower & Pickaxe): Upper Cut Sill wardens, cassiterite tin miners & **3rd Chartered Great Distillery (*Klippe-Bränneriet*: Cut-Glen Smoked-Oak Highland Scotch)**.
7. **Čin Fajr-Vakt** (*Fire-Watch*, `FC3` Vaktberg `816,616` — Blazing Cresset & Stag Antlers): `+4,250 m` Screamer-rim beacon wardens.
8. **Čin Jern-Hors** (*Iron-Horse*, `FC4` Järnhold `860,562` — Rearing Charger & Bronze Gun-Wheel): Upland horse-drovers (`hl_rus_caravan_stables`) & gun-limber riders.
9. **Čin Rjet-Kling** (*Red-Blade*, `FC4` Salpetervik `866,526` — Curved *Čindžal* & Saltpeter Star): Powder-leachers (`hl_rus_saltpeter_mill`), duelists, & first to flip *Brøkn-Čin* reiver when Silk-Trail retainers lapse.

**Deterministic Escort-to-Bandit Rule (`AR_RULES.evaluateBandState`):** Pure `[G data]` function of `{ unpaidDays, silkCaravanIndex, harvestIndex }` (`x == null ? d : x`): when `unpaidDays <= 14` and `silkCaravanIndex >= 0.45`, a company holds `state: 'silk_guard'` (`MC-06`); when `unpaidDays > 14` or (`silkCaravanIndex < 0.30` and `harvestIndex < 0.40`), it deterministically flips to `state: 'broken_kin_reiver'` (`BF-04`, `discTurned: true`), verified by unit and negative tests in `tests/test-ardent.js` and `verify.py`!

---

## 3. Preset Views & Verification Gates (`verify.py --assert`)

| View | What It Must Show |
|---|---|
| `Overview` | Full panorama from across Ardent Burn: Humpback Brigs, Bronze Foundry & watermill on the bank, compact `500 × 500 m` walled burgh densely packed with crow-stepped & *aivani*-balconied cobbled wynds climbing the slope, Tolbooth bronze bell-spire, Quadruple-Pagoda Capital Maltings, and the Nine Clan *koshki* towers & Thing-Stead crowning the SE crag |
| `Walled gate and ramparts` | Twin-*koshki* North Burn Gatehouse, battered granite curtain walls, machicolated Svaneti-Baronial curtain watchtowers, and octagonal corner bastions |
| `High Wynd cobbles` | Eye-level inside a narrow (`3.0–5.8 m`) cobbled wynd: shoulder-to-shoulder lime-harled crow-stepped gables, corbelled pepperpot bartizans, overhanging Old Tbilisi fret-carved wooden *aivani* balconies, and vaulted *pend* close archways |
| `Capital scotch maltings` | The **Capital Quadruple-Pagoda Scotch Distillery & Clanthing Spirit Customs Vault** (`hl_rus_capital_distillery`), bronze-hoop cooperage, and surrounding narrow-cobbled Maltings Garth |
| `Tolbooth and dueling ring` | The Free-Company Tolbooth (`hl_rus_mercenary_bourse`), cobbled Dueling Ring, Silk-Factors' house, and dense surrounding wynds |
| `Thing-stead and koshki` | The Nine-Stones Thing-Stead & Bronze Oath-Anvil on the crag, the *Darbazi*-domed Winter Law-Hall, Dilihan's Envoy Lodge, and the rival Svaneti-style clan *koshki* peel-towers |
| `Clan-seat great distilleries` | Chartered Twin-Pagoda Clan-Seat Great Scotch Distilleries (`hl_rus_great_distillery`) beside their Clan *Koshki* Keeps on the Thing-Crag |
| `Bronze foundry and brig` | Humpback cobbled bridge over the rushing burn, Reverberatory Bronze Bell & Field-Gun Foundry (`vEmber` cupolas, cast bells & cannon barrels), Saltpeter Mill, and Copper/Tin mine adits on the opposite hill |
| `Silk-Trail camp` | Pitched `KCAMP` Free-Company *Brons-Togar* tents, mule lines, and bronze mountain guns outside the East Burgh Port |
| `Night` | Warm hearth light in narrow wynd windows and glowing `vEmber` bronze cupolas/smithies — zero electric lights anywhere (`lit:false` canon) |
