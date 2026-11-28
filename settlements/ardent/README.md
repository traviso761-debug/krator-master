# Ardent (`settlements/ardent`)

**Ardent** (Scale Model 5.1 pin `id: "sn6y4sx8tr"`, pixel **`(830, 553)`**, datum **`+2,801.9 m` ASL**, atmospheric pressure **`1.127 atm`**, polity **`Free Clans`**, `8,000` on-screen / `27,200` Free Clans total) is the densely packed, **walled narrow-cobbled capital burgh**, **Clanthing** moot-seat of the **Nine Clans**, tin-bronze bell and field-gun foundry city, and western free-company muster bourse of the **Silk Trail**.

Once the dread native highland *Rajvrar* (reivers) who raided Jimjam, the Cut, and the dam basins, the Nine Clans swore the **Peace of the Nine Stones (*Najn-Stajn Fredet*)** at Ardent's Bronze Oath-Anvil: bound to burgh peace at home, they prize martial ability above all else, requiring two seasons of chartered foreign free-company service (*Rajt en Sjezon* / `MC-06`) before a youth may vote at the Thing or raise a family stone tower. When foreign employers default (`> 14` days in arrears) or Silk Trail traffic and highland harvests fail together, bands invert their cast-bronze clan discs ("turning the disc", *Brøkn-Čin* / `BF-04`) and turn to highway banditry along the Silk Trail.

Its full architectural, cultural, geological, and simulation specification lives in [`PLAN.md`](PLAN.md), and the complete `42,668 km²` (`FC1–FC4`) regional polygon scope lives in [`core/region/FREE-CLANS-SCOPE.md`](../../core/region/FREE-CLANS-SCOPE.md).

## Architectural Synthesis & Walkable Zones

Ardent synthesizes **Highland Carved Rustic** (`kits/highlands` `rustic`), **Scottish Baronial**, and **Georgian / Highland Caucasus** architecture (`kits/highlands/src/82-rus-baronial.js`, `26` `[G data]` pieces, explicitly distinct from `kits/dzagh-vardzi`'s Armenian tuff *ablaq* and Dagestani flat-roof pyramids):

1. **Zone I — Compact, High-Density Walled Narrow-Cobbled Capital on `KCITY` (`500 × 500 m = 250,000 m²` Fortified Circuit, `600+` Burgh Structures & Wall Spans):**
   - Enclosed by battered Highland-Caucasus granite **curtain walls** (`hl_rus_burgh_wall`), machicolated Svaneti-Baronial **curtain watchtowers** (`hl_rus_wall_tower`), octagonal triple-bartizan **corner bastions** (`hl_rus_wall_bastion`), and **four twin-*koshki* gatehouses** (`hl_rus_burgh_gate`: North Burn Gate, South Thing-Crag Gate, East Silk-Trail Gate, West Jimjam/Cut Gate), with every wall span verified to socket `0.55–0.60 m` into its adjacent masonry nodes (`0` air gaps).
   - Inside, `KCITY` subdivides `8 × 8` tight organic wards plus courtyard closes into quaint **`3.0–5.8 m` terrain-draped `MAT.cobble` wynds, closes, and five cobbled squares** (**Tolbooth & First-Blood Dueling Square**, **Silk-Bourse Square**, **Fir-Sign Stave Garth**, **Bell-Smiths & Armourers Guild Court**, and **Capital Maltings & Excise Garth**) packed shoulder-to-shoulder with crow-stepped harled *aivani* houses (`hl_rus_wynd_house_a`, `hl_rus_wynd_house_b`, tall narrow `hl_rus_wynd_house_c`, twin-gabled `hl_rus_close_row`), vaulted *pend* tenements (`hl_rus_pend_tenement`), L-plan tower houses (`hl_rus_tower_house`), *marani* cellar taverns (`hl_rus_marani_tavern`), *kindzhal* & buckler armourers (`hl_rus_wynd_armourer`), Silk-Trail brocade factors (`hl_rus_silk_factor`), bronze-hoop whisky cooperages (`hl_rus_cooperage`), clan tartan dyeworks (`hl_rus_plaid_dyer`), juniper & sky-poppy apothecaries (`hl_rus_apothecary`), highland mount caravanserai stables (`hl_rus_caravan_stables`), the **Free-Company Tolbooth** (`hl_rus_mercenary_bourse`), and the **Capital Quadruple-Pagoda Scotch Distillery & Clanthing Spirit Customs Vault** (`hl_rus_capital_distillery`).
2. **Zone II — Upper Thing-Crag Citadel, Nine-Clan *Koshki* Crown & Three Clan-Seat Great Scotch Distilleries (`+2,828 m` SE Spur):**
   - Linked from the South Gate by the cobbled Citadel Ascent: the **Nine-Stones Thing-Stead & Cast-Bronze Oath-Anvil** (`hl_rus_thing_ring`), the **Darbazi Winter Law-Hall** (`hl_rus_law_darbazi`), the **Dilihan Veterans' Envoy Lodge** (`hl_rus_envoy_lodge`), Law-Speaker's Feast Hall (`hl_rus_hall`), all **Nine Clans' battered Svaneti-style *Koshki* Peel-Towers**, **Three Chartered Clan-Seat Great Scotch & Highland Whiskey Distilleries** (`hl_rus_great_distillery` at Clan Seats `#1` `Čin Hjartstajn`, `#3` `Čin Sjelk-Vač`, and `#5` `Čin Klip-Čip`: Doig double-pagoda peat kilns, crow-stepped copper pot-still halls, and Caucasus *marani* cask vaults), and six Clan Retinue Houses.
3. **Zone III — East Silk-Trail Muster Green (`KCAMP`):**
   - Silk-Trail tollhouse (`hl_rus_tollhouse`), artillery muster yard (`hl_rus_muster`), mount-drover caravanserai stables (`hl_rus_caravan_stables`), caravan inn (`hl_rus_inn`), and **three pitched `KCAMP` Free-Company *Brons-Togar* camps** (`MC-06`) with wheeled cast-bronze mountain field-guns and clan bronze-disc standards (`AR_RULES.evaluateBandState`).
4. **Zone IV — Ardent Burn (`Mēkam-āṟu` Headwater), 3 Humpback Brigs & North Foundry Suburb:**
   - Monotonically flowing mountain burn (`WATER.flow` / `WATER.drawFlow`) spanned by **three Humpback Cobbled Brigs** (`hl_rus_cobbled_bridge`), feeding a `30+`-building industrial riverfront of **three Reverberatory Bronze Bell & Field-Gun Foundries** (`hl_rus_bronze_foundry`), non-sparking bronze-mortar **Saltpeter Powder Mills** (`hl_rus_saltpeter_mill`), bronze-hoop **Whisky Cooperages** (`hl_rus_cooperage`), watermills, pot-still distilleries, charcoal clamps, and tanneries.
5. **Zone V — North Copper & Cassiterite Tin Ore Hills (`RES_ORE`) & West Frostoat Crofts:**
   - `8` visible malachite `copper_ore` (`120`) and cassiterite `tin_ore` (`200`) `RES_ORE` nodes within `<= 400 m` of `4` mine adits (`hl_rus_mine` + `resSource`), and `16` west-glen frostoat, flax, sheep, and *koliba* cheese crofts.

## Commands

```bash
# 1. Node [G data] test suite (terrain, 5x KCITY walled capital, wall sockets, cobble wynds, Nine Clans, bronze ore & MC-06/BF-04)
node settlements/ardent/tests/test-ardent.js

# 2. Build dist/ardent.html + dist/ardent.tex.js + build-inputs.json
python3 tools/build.py settlements/ardent

# 3. Refresh Scale Model 5.1 elevation & horizon bake (src/28-ar-model.js)
python3 settlements/ardent/build.py --bake-model

# 4. Headless WebGL verification & preset screenshots
python3 verify.py dist/ardent.html --assert --views "Overview,Walled gate and ramparts,Tolbooth and dueling ring"

# 5. Full 365-day Free Clans polygon economy simulation (autarky deficits, R1-R4 neighbour trade & BF-04 embargo raids)
FC_PRINT_REPORT=1 node core/region/tests/test-fc-economy.js
```
