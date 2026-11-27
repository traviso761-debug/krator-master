# Smuggling, Contraband Regimes, Law, Magistrate Courts & Penal Labor Scope (`2026-11-24`)

> [!NOTE]
> **Status: `[LOCKED — RULINGS #108–110]` — Scope `#3`, Companion to [CONTINENTAL-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/CONTINENTAL-SCOPE.md), [CONVOY-LOGISTICS-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/CONVOY-LOGISTICS-SCOPE.md) (`#7`), [ESPIONAGE-DIPLOMACY-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/ESPIONAGE-DIPLOMACY-SCOPE.md) (`#2`), [NORTHERN-CARTELS-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/NORTHERN-CARTELS-SCOPE.md), [BANDITS-PIRATES-BOUNTIES-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/BANDITS-PIRATES-BOUNTIES-SCOPE.md), and [SETTLEMENT-MIGRATION-SCOPE.md](file:///home/antigravity/traviso761-debug/krator-master/core/region/SETTLEMENT-MIGRATION-SCOPE.md).**
> Extends `core/simulation/77-sim-6-crime.js` (`SIM.crime` & Thieves' Guilds), `core/region/47c-region-crime.js`, `77-sim-6-money.js` (`M1/M2` pricing & `treasury` conservation), and `77-sim-7-ledger.js` into a continent-wide **Customs, Smuggling, Judicial Sentencing, Prisoner-Convoy, and Physical Penal-Labor engine** across all `27` spheres.
> Pure `[G data]` contract: zero `THREE`, zero DOM, deterministic `KRAND.hash` rolls, numeric defaults `x == null ? d : x`, and append-only `lawEdits` deltas keyed by stable `id`.

---

## 1. Third Ria Trans-National Network: *The Black-Tally / Weeping-Lotus Syndicate* (`BT-01..BT-12`, `Ruling #108`)

Alongside `Sphere 27`'s two respectable neutral institutions — ***The Pioneers / Technicians*** (`PN-01..15`, `Ruling #102`) and ***The Court of the Amber Seal*** ("The Seal-Bank", `AS-01..12`, `Ruling #103`) — a **third, strictly covert Ria criminal brotherhood** pushes south down both continental pincers in their shadow:

### 1.1 Origins, Ethos & Signature Northern Contraband
- **Name & Dual Identity:** Known in Low- and High-Ria river cant as ***Kālō-Tālī* ("The Black-Tally")** and in southern Crater ports as ***The Weeping-Lotus Syndicate*** (*Wīpį-Lōtasi*). Forged by rogue river-smugglers in contested **`Weeping Valley` `(996, 156)`** (running Dynastic blockades behind the backs of Pioneer `PN-05` *Sap-Breakers*), corrupt tally-carvers expelled from **`Ria Sound` `(626, 140)`** lower inundation quays, and **`Battered Isle` `(435, 259)`** exile brokers.
- **Zero Overlap With Respectable Ria Cartels — Direct Parasitic Rivalry:**
  - *The Pioneers* and *The Seal-Bank* maintain spotless commercial credit (`0` narcotics/poisons). *The Black-Tally* preys directly on their prestige by carving **counterfeit fossil-`ria-amber` and `nephrite-jade` customs/escrow tallies (`forged_tally`)** — the one crime that causes the *Court of the Amber Seal* to post lethal **Tier 3–4 Continental Warrants**!
- **Five Signature Contraband Lines:**
  1. ***Weeping-Sap* (`weeping-sap` / *Lotus-Blight* Poison & Defoliant Vials):** Tapped covertly from un-dismantled bio-warfare sap-trees in `Weeping Valley` (`0` overlap with `Torus` *Tenders* per `Ruling #104` — purely a toxic Northern bio-hazard!). Acts both as an untraceable assassination/court poison and as a **covert sabotage agent** capable of spoiling `dalab-biogel-vat` batches or chinampa beds (`ESPIONAGE-DIPLOMACY-SCOPE.md` §3.3).
  2. ***Shroud-Venom* (`shroud-venom`):** Neurotoxic formic/mandible distillate bartered off `Shroudhills` *Khrōma-Mīra* Shroud-Ants (`CROOK-RIA-SCOPE.md` §3.2) — prized for paralytic blow-darts/bolts and surgical nerve-blocks.
  3. **Refined Narcotics & Forbidden Tinctures (`Ruling #71`):** Concentrates raw southern `opium` (`Xanadu`), `hashish` (`Dalab`), and `ghostpipe` (`Throne`/`Voth`) with Northern `weeping-lotus` alkaloids into high-potency compact bricks smuggled past Eternian Censorate, Iron Republic, and dry-zone (`Yeti`, `Guari`, `Order`) cordons.
  4. **Poached `Lodestone` `superconductors` & Unsealed Archaeotech:** Diverts off-ledger `Compass Hills` `superconductors` and `Ancient's Valley` `cybernetics` (`Tone` / `Span` corridors) to blacklisted buyers (`Voth` royal artificers, rogue warlords).
  5. **Forged *Amber-Seal* Bonded Transit Tallies & Diplomatic Seals (`forged_tally`):** Sold to smugglers and spies (`#2`) to bluff past `lienShare` customs gates.

### 1.2 Canonical `12`-Node *Black-Tally / Weeping-Lotus* Fencing Network (`BT-01` – `BT-12`)

| Node | Host Settlement & Coords `(px, py)` | Cover Venue & Pincer Leg | Primary Illicit Traffic & Local Underworld Link |
|---|---|---|---|
| **`BT-01`** | **`Weeping Valley` River-Blinds** `(996, 156)` | Sunken reed-blind stills outside `Weeping Fort` | Distills `weeping-sap` poison behind `PN-05` *Sap-Breakers*; runs night skiffs between W & E Ria |
| **`BT-02`** | **`Ria Sound` Lower-Quay Cellars** `(626, 140)` | Floodable *Prou-Torre* cellar beneath `+78 m` bluff | Carves `forged_tally` amber seals; loads smugglers' holds below `AS-01` Vault |
| **`BT-03`** | **`Silkhead` Back-Alley Tea-Loft** `(934, 424)` | Eastern Pincer gate behind `sl_caravanserai_silkhead` | Fences poached `spider-silk`, `superconductors` (`BF-04` *Red-Chalk Reivers*), & `spirits` north |
| **`BT-04`** | **`Port Koron` & `Shell` Swamp-Landing** `(912,532)/(902,659)` | Soda-Lake reed warehouse & `Port Goto` mangrove slip | Trades narcotics/bribes to `Shell` overseers **while selling forged free-papers to fleeing peons** (double-dealing!) |
| **`BT-05`** | **`Dilihan` Lower-Town & `Aidol` Cellar** `(744, 663)` | Wine-vault beneath `Aidol`/`Dilihan` customs road | Brokers stolen Republican `precision-tools` & `Cut` contraband past `BF-02` *Broken-Count* |
| **`BT-06`** | **`Talia` Foothill & `Iziz` Harbour Dens** `(1073,939)/(963,985)` | `Talia` mule-cellar (`BT-06a`) & `Iziz` canal-undercroft (`BT-06b`) | Runs bootleg `spirits` up into dry `Tiguantin` (`Ruling #71`) & fences `opium`/untaxed `opal` into `Iziz` |
| **`BT-07`** | **`Battered Isle` Exile Anchorage** `(435, 259)` | Western Pincer offshore smuggler cay (`+115 m`) | Repackages `shroud-venom`, `weeping-sap` & `ria-amber` onto false-manifest coasters (`PF-06`) |
| **`BT-08`** | **`Farport` Undertown & `Tone` Trail** `(248,585)/(398,740)` | Lower-harbour slipway + Western `Tone` corridor (`Ruling #53`) | Penetrates Eternia's `opium` & `Yusar` `cybernetics` cordon (`True Heir` desperate black-market buyers!) |
| **`BT-09`** | **`Slussport` Lock-Tavern & `Lipp`** `(576,693)/(691,619)` | Alpine lock-basin cellar | Smuggles *Ting*-embargoed Republican `firearms-locks`, `lenses` & `Footfall` `circuits` |
| **`BT-10`** | **`Port Mira` & `Noah's Regret`** `(865,895)/(896,866)` | Free-Port narcotic vault (`BT-10a`) & *Ruephus* hold (`BT-10b`) | Central Ring-Sea clearinghouse for `PF-01..05` pirate prizes, `ghostpipe`, `ranjrum` & `ancient-biogel` |
| **`BT-11`** | **`Drum` Under-Bourse & `Voth` Canal Vault** `(671,930)/(742,1018)` | Arena tunnel (`BT-11a`) & submerged Voth canal cellar (`BT-11b`) | Supplies *Tzintzun*'s covert `quartz`/`RE` buyers **AND** sells safe-passage to `BF-10` *The Inverted*! |
| **`BT-12`** | **`Span` *"Priests' Cut"* & `Blakhed`** `(554,1010)/(441,1400)` | Canyon undercroft (`BT-12a`) & Rim ice-cellar (`BT-12b`) | Clears `Ancient's Valley` / `Wheel` Cyberlich `ancient-biogel` & `Great Caravan` untaxed `opals`/`opium` |

---

## 2. Per-Polity Contraband & Monopoly Matrix Across the 27 Spheres (`Ruling #109`)

Every good in `SIM.economy` carries a per-polity legal status (`LEGAL`, `TAXED_TARIFF` [`5–20%`], `BONDED_TRANSIT` [sealed pass-through only], `STATE_MONOPOLY` [crown/cartel license required], `PROHIBITED_CONTRABAND` [seizure + fine/penal labor], or `CAPITAL_TREASON` [confiscation + Tier 4 warrant / high-security penal sentence]):

| Polity / Sphere | `TAXED_TARIFF` / `BONDED_TRANSIT` | `STATE_MONOPOLY` (Unlicensed = Seizure) | `PROHIBITED_CONTRABAND` (Seizure + Gaol / Penal Labor) | `CAPITAL_TREASON` (High-Security Penal / Condemned Queue) |
|---|---|---|---|---|
| **`Eternal State`** (`Sphere 12`) | Bulk `scrap` (`25%` `Veil` tithe), `marble`/`alabaster` (`Palewharf`), `oil` (`LC-07`) | **`kaolin` `fine-porcelain` kiln-moulds**, **`ria-amber` & `frost-coral`** (`Farport` `82%` state cut), `salt` & paper *feiqian* plates | Non-medical `opium`/`hashish`, `ghostpipe`, `weeping-sap`, unlicensed foreign goods inland of `Farport`/`Palewharf`/`Bastion`, *Black-Tally* `forged_tally` | **Unsealed `Ancient's Valley` `cybernetics` / `processor-cores` / `RC-6` taint**, **unregistered RF `comms-radios`** (`Lux` `HM-16` risk!), smuggling `porcelain` master-recipes abroad |
| **`Kingdom of Voth`** (`Sphere 4`) | Neutral `Ys`/`Hikau` imports, `Zey'danin` `coffee`/`spice` re-exports | **`Blïtrit` royal purple dye**, `silver` bullion export (`Exchequer` stamp), `LC-04` Geomancer `oil`, `Nazar`/`Wing` crown salvage | Unlicensed `firearms`, `ranjrum` outside navy rations, `weeping-sap`, `Vrivolci` boycott goods (`Ruling #41` covert to `Shim`) | **Order of Historians `books`, ciphers & `comms-radios` (`HM-19`)**, unauthorized `Nazar` delve / `ancient-biogel` theft, aiding `BF-10` *The Inverted* or slave-breakers |
| **`Empire of Iziz`** (`Spheres 1–3`) | Allied/neutral staples, `Talovolci` `ship-timber`, `Yuni` `kerosene` | Heavy **`Izani` war-walker parts (`kits/mechs`)**, `RC-2` shield-cores, `Fridon`/`Atton` deep-oil charters (`LC-05`), `opium` (`taxed_monopoly`) | Direct `Voth`-flag wartime cargo (`Ruling #69`), untaxed `Xanadu` `opal`s, `weeping-sap`, **`Aidol` "mis-manifested" Republican `precision-tools`** *(deliberately seized for Quiet-Copy!)* | Treasonous arms sales to `Voth` or rebel `Beast Riders`; in **`Shell` Province (`Ruling #78`)**: harboring/forging papers for runaway debt-peons (enforced as felony by planter courts!) |
| **`Iron Republic`** (`Sphere 14`) | Imported `coal`, `sulfur`, `saltpeter`, `fireclay` `crucibles`, `grain` | Guild-stamped export `firearms` & `clocks` (must clear `Lipp`, `Slussport`, or `Cascade` under end-user seal) | `ghostpipe`, `ranjrum`, `opium`, `weeping-sap`, **all chattel-slave / debt-peon indentures (`Ruling #78`)** | ***Ting Embargo Statute* (`PROPOSAL-IRON-REPUBLIC:285`):** unlicensed export of **`machine-tools`, rifled/rocket ordnance dies, escapement engines, optical grinders, or `Footfall` `circuits`** |
| **`Realm of Dalab`** (`Spheres 21–22`) | Great Caravan `gold`, `silk`, `cacao`, `copper`, `bronze` (`Nulab` gate); `hashish` & `tequila` **`LEGAL`** export! | **`ancient-biogel` (`Ruling #3` — strict Genepriest temple monopoly!)**, `4A` cryo-vat protocols, `The God` sub-core relics | `ghostpipe`, `ranjrum`, **`weeping-sap` (catastrophic biovat toxin!)**, unquarantined `Blade` Valley mutagens (`Ruling #76`) | Private hoarding/export of **`ancient-biogel`**, sabotaging a `dalab-biogel-vat` or `reformation-sanctum`, aiding `Vrivolci` raiders |
| **`Yuni Emirate & Geomancers`** (`Sphere 20`) | `Jabal`/`Dasri` `alkali`, `mounts`, `Xanadu` `tea`/`silk` | **`Starfish` carbide drill-bits**, **`fireclay` chemical-retort blueprints**, `Siphon Pits` `machine-wax` (`82%` share), `LC-01..09` concession `crude_oil` | **`alcohol` in `Yuni` Order wards (`Ruling #71`)**, bootleg `BF-06` *Glass-Eaters* `naphtha`/retorts, Pioneer `hydro-dynamo` industrial espionage | Stealing `Starfish` master dies from `Locus`/`Shell`, breaching `Grand Vault` Six Sealed Doors (`Yuni`), siphoning concession `oil`/`RE` off-royalty |
| **`Xanadu Sultanate`** (`Sphere 23`) | `Catch` `salt`, `alkali`, `Ring Sea` `pearls`; **`opium`, `cacao`, `wine` `LEGAL`** (*except dry monastic spokes*) | **Sultan's Fifth on raw `gold` (`Strongwall` -> `Gihon` Mint)**, **`Lāiṭwāl` `photonic-opals` & `moonglass` recipes** | Untaxed raw `gold` dust / uncut `opal`s bypassing `Gihon` / `Potch-Line` assessors, `weeping-sap`, Lizardman brass trophies (quarantine taboo) | Counterfeiting `Gihon` gold `qud` dies, betraying `Strongwall`/`Beacon` watch-codes |
| **`Order of Historians`** (`Sphere 24` & `HM-01..18`) | `paper`, `chalice-grass`, `quartz`, `tea`, `books` (`0` to `Voth`!) | `Longsong` movable-type `schematics` (`open_schematic`), `High Rift` piezo `quartz` oscillator crystals | **`alcohol` & slaughtered `meat` in `Longsong`/`Oidong` (`Rulings #64 & #71`)**, offensive `weapons`/munitions on Sanctuary road | **Exposing or stealing Chapterhouse `comms-radios` / Epoch Cipher Codebooks (`Ruling #89`)**, trafficking `RC-6` `apex_hazard` cores instead of sealing in `LS-008` |
| **Special Cultural & Physical Regimes** | — | `Kautoa`/`Ys` ceremonial `kava`; `Amber-Seal` `ria-amber` bond tallies (`Mā-Kōu` / `Ria Sound`) | **`alcohol: PROHIBITED` in `Yeti Kingdom` (`Qoold Lheek`/`Leng`) & `Tiguantin` (`Guari`) (`Ruling #71`)**; `electrics` inside `Beast Rider` canopy towns & oil rigs at `Girder` (`Ruling #30`) | **Ferrous `iron`/`steel` tools, tires, or weapons inside `Lodestone` (`1058, 224`) `85 mT` zone (`Rulings #102 & #106`)**; counterfeiting *Amber-Seal* `forged_tally` bonds |

---

## 3. Inspection Mechanics, Smuggling Craft & Embargo Price Curves (`Ruling #109`)

### 3.1 Deterministic Gate, Lock & Harbour Search Formula
Whenever a `SIM.convoy` (`#7`) or the player crosses a customs place (`customs_house`, `quarantine_lock`, `harbour_pier`, `lift_head`), `SIM.customsInspect` evaluates a pure deterministic hash `KRAND.hash(worldSeed, convoyId, gateId, day, 0x43555354)` against detection probability $P_{\text{detect}}$:

$$P_{\text{detect}} = \operatorname{clamp}\!\Big(B_{\text{gate}} \cdot (0.55 + 0.75 \cdot \text{orderliness}) \cdot S_{\text{scanner}} \cdot (1 - M_{\text{conceal}}) \cdot (1 - M_{\text{bribe}}),\; 0.02,\; 0.98\Big)$$

| Parameter | Concrete `[G data]` Values & World Mechanics |
|---|---|
| **Base Gate Vigilance ($B_{\text{gate}}$)** | Frontier toll-post `0.25` · Standard city/harbour customs (`Iziz`, `Talia`, `Almua`, `Jimjam`, `Gihon`) `0.45` · High-security quarantine/embargo lock (`Palewharf` `5.2 m` lock, `Farport`, `Lipp`, `Aidol`, `Nazawach`, `Nulab`) `0.70` · Apex Censorate/Ordinator cordon (`Veil`, *Saltwhite Gate*, `Voth` Sun-Precinct) `0.88`. *(Drops sharply when `region.orderliness` plunges after conquest, e.g. `Hook` at `0.32`!)* |
| **Scanner Tech ($S_{\text{scanner}}$)** | `1.0×` standard physical probe-iron & manifest weigh-scale · **`1.45×` at `Veil` / *Saltwhite Gate* / `Lux`** (Eternian residual RF & radiation/implant arches vs `cybernetics`/`Relics`/`comms-radios`) · **`1.35×` at `Lodestone`** (`85 mT` passive magnetic pull instantly betrays hidden iron!). |
| **Concealment Craft ($M_{\text{conceal}}$)** | • **Unconcealed crate:** `0.00`<br>• **Amphora / Salt-Cask / Spice Masking:** `0.25` (defeats casual visual/scent checks on `spirits`, `opium`, `weeping-sap`, `ancient-biogel`)<br>• **False-Bottom Wagon / `et_canal_barge` Bilge Hold:** `0.40` (costs `-20%` hull/wagon payload `cap`, crafted at smuggler boatyards/wheelwrights)<br>• **Lead- & Copper-Lined Faraday Coffer:** `0.45` (neutralizes Eternian RF/radiation arches against `cybernetics` & `RC-5` components)<br>• ***Black-Tally* `forged_tally` Seal (`BT-02`):** `0.65` at *Amber-Seal* `lienShare` ports (**unless** a Seal-Bank actuary runs a tally-grain audit `12%` chance -> instant Tier 3 fraud alarm!)<br>• **Accredited `diplomatic_pouch` (`Ruling #111`):** **`1.00` (`0%` routine gate search!)** — immune unless Counter-Intelligence triggers a Sovereign Pouch Seizure (`ESPIONAGE-DIPLOMACY-SCOPE.md` §1.3). |
| **Bribery & Lien Corruption ($M_{\text{bribe}}$)** | • Offering `10–25%` of contraband street value to ordinary gate clerks (`orderliness < 0.75`) yields `M_bribe = 0.40–0.65` (conserved `SIM.pay` into clerk household/corrupt purse).<br>• **Incorruptible Nodes (`M_bribe = 0.00`, Bribery = Additional Felony!):** `Veil` *True Heir* Sanctum Wardens, `Voth` Senior Ordinators, `Roketstad` Guild-Bonded *Ting* Inspectors, and `Longsong` Vowed Monks. |

### 3.2 Zero-Gate Bypass Corridors & Night Cove Landings
Smugglers can avoid $P_{\text{detect}}$ entirely (`0` gate roll) by taking high-hazard physical bypasses:
1. **Night Landings at `PF-01..06` Pirate Coves & Smuggler Beaches (`KCAMP.pirateCove`):** Fast `marr-xebec`s, `rumah-prahu`s, and `PF-03` gill-swimmers land cargo between `22:00–04:00` on unlit `KCOAST` coves (`15%` shoal/wrecker risk in fog without `PF-02` charts, `10%` Cove fence cut, `coastguard_berth` patrol sweep risk near major ports).
2. **Overland Shadow Trails (`[LOCKED]`):**
   - **Eastern Rim Shadow-Trail (`X = 532..544` -> `Span` `"priests' cut"`, `Ruling #53`):** Moves `Ancient's Valley` / `Wheel` Cyberlich `ancient-biogel` & `cybernetics` past `Saltwhite Gate` into `Span` (`BT-12a`).
   - **Western `Tone` Corridor (`Ruling #53`):** Smuggles `Yusar` implants & diagnostics into Eternia (`BT-08`).
   - **`Shumar -> Shim` Covert Track (`Ruling #41`):** Moves `Vrivolci` `saltpeter` & `tin` into southern Voth bypassing Royal Ordinator embargoes.
   - **High-Pass Bootleg `spirits` Trails (`Ruling #71`):** `Boatmurder`/`Veladiga`/`Jimjam` -> `Qoold Lheek` ice-tunnels, and `Talia` (`BT-06a`) -> `Tiguantin` puna trails.

### 3.3 Embargo & Prohibition Price-Multiplier Curve (`M2` Extension)
In `77-sim-6-money.js` (`M2`), black-market fences (`SIM.guildOf(s)` in `47c`, `BT-01..12` dens, and `BF-*`/`PF-*` HQs) clear restricted goods at `P_black = P_base * scarcity * legalityMult`:
- `TAXED_TARIFF` / `STATE_MONOPOLY` evasion: **`1.35× – 1.65×`** (smuggler pockets the tariff/monopoly spread).
- `PROHIBITED_CONTRABAND` (e.g. `spirits` in `Qoold Lheek` / `Tiguantin` / `Longsong`; `opium` in `Fulcrum` / `Roketstad`): **`2.10× – 2.90×`**.
- `CAPITAL_TREASON` / Active Wartime Embargo (`Voth` `quartz`/`RE`/`comms-radio` parts; `Eternia` `cybernetics`; `Dalab` black-market `ancient-biogel`; `Republic` `machine-tools` abroad): **`3.00× – 3.80×`** (fences pay the runner `75–82%` of `P_black` from conserved guild/syndicate accounts and retail discreetly to elite/covert buyers).

---

## 4. Crime Heat, Magistrate Courts, Prisoner Convoys & Penal Labor (`Ruling #110`)

### 4.1 From Urban `SIM.crime` & Customs Seizure to 4-Tier Magistrate Sentencing
Unifies `77-sim-6-crime.js` (`pickpocket`, `burglary`, `assault`), customs seizures (§3.1), espionage arrests (`#2`), and `SIM.bounty` (`BANDITS-PIRATES-BOUNTIES-SCOPE.md` §4) through each city's **Magistrate Court / Tribunal** (`place.kind = 'court'`):

```mermaid
stateDiagram-v2
  [*] --> WitnessedOrSeized: Crime Seen (77-sim-6-crime) OR Customs/Espionage Catch
  WitnessedOrSeized --> HiddenAtFence: Reaches Thieves' Guild / BT-* Safe-House First (crimeHeat Decays)
  WitnessedOrSeized --> WarrantIssued: Escapes Gate -> Per-Polity SIM.bounty Tier 1-4!
  WitnessedOrSeized --> MagistrateTrial: Arrested by Watch / Wardens / Ordinators / Manhunters
  MagistrateTrial --> Tier1_Fine: Tariff Evasion / Petty Theft -> Cargo Seized + Fine Paid -> Free
  MagistrateTrial --> Tier2_TownGaol: Brawl / Minor Contraband / Unpaid Fine -> 7-30d Local Brig
  MagistrateTrial --> Tier3_PenalConvoy: Major Smuggling / Debt-Default / Brigandage -> Marched to Penal Mine/Canal!
  MagistrateTrial --> Tier4_CondemnedOrHighPenal: Capital Treason -> NPC Executed; Player Commuted to High-Security Penal / Timed Escape Cell!
  Tier3_PenalConvoy --> PenalSiteWork: Works Off Quota (Ore/Stone/Silt) OR Bribe/Ransom OR Prison Break!
  Tier4_CondemnedOrHighPenal --> PenalSiteWork: Escapes Execution/Vat Queue or Commuted to Deep Pit
  PenalSiteWork --> FreeCitizen: Quota Completed / Amber-Seal Ransom / Letter-of-Marque Pardon
  PenalSiteWork --> FreeSoilAsylum: Breaks Out -> Crosses into Free-Soil Polity (Warrant Voided Locally!)
```

### 4.2 Ten Canonical Physical Penal Labor Sites Across Krator
Convicts sentenced to **Tier 3–4 Penal Servitude** do **not** vanish into abstract timers: they are loaded onto physical **`KCAMP` Prisoner Transport Convoys** (`cage_cart` overland wains or chained `penal_scow` canal barges, guarded by `6–16` state soldiers — **ambushable along the road** by allied `BF-*` gangs or the player!) and marched to concrete `SIM.site` works where their `WORK` hours produce real `stone`, `coal`, `salt`, `potash`, `gold`, or dredged canal depth:

| # | Polity | Physical Penal Labor Site & Coords `(px, py)` | Convict Labor Output (`SIM.recipe` / `KCONS`) | Local Regime, Hazard & Emergent Breakout Hook |
|---:|---|---|---|---|
| 1 | **`Eternal State`** | **`Wū-Xī` / `Black-Seam Colliery` `(416, 782)` & `Līng-Mā` Canal Dredging (`Shuāng-Zhá` `450.5, 782`)** | Mines `coal`/`fireclay` & dredges `KCANAL` silt-bars (`upkeep` on `8` Eternian canals) | Metered by Censorate iron tallies (`exact` ton-quota work-off); `BF-02` *Broken-Count* shelters northern escapees |
| 2 | **`Kingdom of Voth`** | **Crown Ashlar Quarries, `Nazar` Outer Rubble Cordon `(582, 1079)` & `Grüt-Gracht` Canal Scows** | Quarries `limestone`/ashlar, clears outer `Tier 2` `Nazar` rubble, & dredges `Voth–Torus` canal | **High stakes:** Tier 4 heretics/Order captives face a **`21`-day Sun-Pyramid Condemned Queue** unless rescued by **`BF-10` *The Inverted*** or `HM-19` cells! |
| 3 | **`Empire of Iziz`** | **`Fosa Imperial de Iziz` Dredge-Barges (`Port Tobin`–`Iziz`) & `Pylon` `(869, 1002)` Monolith Slag-Pits** | Dredges `60 t` ship-canal silt & breaks `Tier 1` Monolith `scrap` slag | Commutable mid-sentence by volunteering for **penal `Hook` pacification / sapper cohorts**! |
| 4 | **`Shell` Province** *(`Iziz` Exclave)* | **`Shell` Debt-Peonage Timber Swamps, Salt-Pans & `Steampits` Sulfur Cuts `(902, 659)`** | Fells `ship-timber`, boils `salt`, & cuts volcanic `sulfur` (`Ruling #78` transferable indentures!) | **#1 Breakout Hotspot:** **`BF-03` *Chain-Snappers*** maroons & `Vrivolci`/`Ardent` abolitionist raids (`MC-05`/`MC-06`) actively liberate peon camps toward `Mav's Refuge` & `Korona`! |
| 5 | **`Dilihan` Province** | **`-1,608 m` `Cut Salt Lake` (`D2`) Hypersaline `Potash`/`Halite` Pans & NE Skarn Adits `(744, 663)`** | Scrapes `potash`/`halite` (`2.03 atm` glaring salt-crust heat) & mines `tin`/`iron` skarn | High water/heat fatigue unless supplied with shade/water; `Aidol` smugglers work off fines here |
| 6 | **`Iron Republic`** | **`89 km` `Cascade <-> Drum` Collapsed Karst Bore Re-Excavation `(568, 841)`** | Drills & clears collapsed tunnel rock toward `Drum` (`Ruling #57`!) | **Rule-of-Law Distinction (`Ruling #78`):** Strictly fixed judicial term-sentences with credited hazard pay (`0` hereditary peonage, `0` whip-slavery; guild supervision) |
| 7 | **`Realm of Dalab`** | **`Kleibruk`/`Waitbruk` Clay & Lime Pits + Sunken `dalab-biogel-vat` Mash-Courts `(477, 1108)`** | Hauls `clay: 255` / `limestone` & turns heavy fermented starch mash (`inferior-biogel`) | Tier 4 sacrilege (`ancient-biogel` theft) places convicts in a **`14`-day Reformation Prep Ward** (threat of NPC `1B` Graft-Servitor conversion — **playable breakout window** for the player & companions!); fugitives flee to `BF-09` *Scalded Brotherhood* |
| 8 | **`Xanadu Sultanate`** | **`Strongwall` `(912, 1640)` Gold/Copper Adits & Lizard-March Rampart Corvée** | Mines `gold`/`copper` ore (for `Gihon` Mint) & repairs border watch-walls against Lizardman raids | Convicts who distinguish themselves repelling a Lizardman raid earn immediate Sultan's pardon! |
| 9 | **`Ria Dynasties`** | **`Kulūną` / `Hārta` Loess Canal Silt-Gangs & `Weeping Valley` Outer Sap-Dikes `(796,176)/(996,156)`** | Shovels heavy yellow loess silt & builds containment earthen dikes | *Black-Tally* (`BT-01`) river-skiffs routinely bribe guards to spirit high-value syndicate prisoners away |
| 10 | **`Zeijani` & Corsairs** | **Interior Volcanic Tuff-Cistern Cutters & Galley Oar-Benches `(840, 776)`** | Carves basalt/tuff water cisterns (`clay = 0` interior) & rows corsair hulls | Targeted at sea by **`PF-05` *Chain-Breaker* Privateers** (`Captain Sava`), who free galley-slaves at `Ys` / `Port Mira`! |

### 4.3 Playable Player Capture, Escape, Ransom & `Free-Soil` Asylum (`[LOCKED — Ruling #110]`)
Being arrested or overwhelmed by state guards **never** triggers a dead-end `Game Over` screen:
1. **Tier 4 Commutation & Countdown Window:** If the player or a companion is convicted of a `CAPITAL_TREASON` offense, the sentence is either commuted directly to **High-Security Penal Transport** (marching in a `cage_cart` convoy to the polity's penal mine/bore) or enters a **`14–30` sim-day Condemned / Prep Cell** (`Voth` Sun-Pyramid dungeon, `Dalab` Reformation ward, `Veil` Censorate keep), giving companions, hired `MC-*` rescue teams, allied `BF-*` outlaws, or the player's own lockpick/bribe skills a concrete physical rescue & stealth-breakout playspace!
2. **Four Clean Ways Out of Penal Servitude:**
   - **Work Off the Tally Quota:** Physically mine/dredge (`WORK` shifts accelerate quota completion) while recruiting fellow convict companions (`ex-smugglers`, `disgraced engineers`, `maroon fighters`)!
   - **Prison Break (`stealth` or `riot`):** Pick shackles (`iron-tools` improvised at the camp forge), bribe a turn-key, sabotage the barracks gate during a night shift or dust/rain squall, and bolt past ray-marched watchtowers (accruing a local Tier 2–3 fugitive `bounty`).
   - ***Amber-Seal* Ransom / Bail Escrow (`AS-01..12`):** For non-ideological crimes, a companion or factor at a neutral *Court of the Amber Seal* desk can wire conserved `Talents` to commute the remaining sentence into a bonded fine.
   - **Penal Pardon Charter:** Accept a high-hazard state suicide/redemption commission (e.g., clearing a `Tier 3` ruin vein, `Hook` sapper duty, or `Strongwall` raid defense) to wipe the polity's warrant clean.
3. **`Free-Soil` & Ideological Asylum (`SETTLEMENT-MIGRATION-SCOPE.md` `Ruling #98`):**
   - Because warrants are **strictly per-polity** (`BANDITS-PIRATES-BOUNTIES-SCOPE.md` §4.1), any escaped `Shell` debt-peon, `Voth` quarry/Ordinator fugitive, `Zeijani` slave, or political dissident who physically reaches a **`Free-Soil` jurisdiction** (`Iron Republic`, `Free Clans of Ardent`, `Mav's Refuge`, `Vrivolci` `Tallwalls`, `Longsong`/`Oidong` for non-violent politicals, or a **Player-Chartered `Free-Soil` Settlement**) is legally emancipated there — local watchmen block foreign `Manhunter` posses at the gate!
