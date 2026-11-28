# `core/simulation` — Liturgical Cycles, Observances, Pilgrimages & The Great Pilgrim's Market

Status: **Implemented & Verified (`2026-11-27`)** — `77-sim-6-season.js` (`cycles`), `77-sim-6d-decrees.js` (`SIM.observance`), `77-sim-6p-pilgrims.js` (`SIM.pilgrimage`, `SIM.pilgrimMarket`), and `test-pilgrims.js` (`6/6` suites green, `0.00` `SIM.ledger` residual across goods & money at both `presented` and `abstract` levels).

## 1. Design Contract

1. **100% Opt-In & Zero Baseline Drift:** Worlds that do not register `cycles`, `SIM.observance`, `SIM.pilgrimage`, or `SIM.pilgrimMarket` execute byte-identically (`test-sim.js`, `test-season.js`, `test-outlaws.js`, and Voth's stocks baseline untouched).
2. **Zero `ksim.gd` Changes:** `ksim.gd` consumes baked `task.legs`; all schedule switches, taboos, escorted cohorts, and sacred circuits resolve to standard `SIM` motion tasks.
3. **Strict Ledger Closure (`77-sim-7-ledger.js`):** Every meal eaten, souvenir/almanac/prayer-wheel carried home or abroad, rare Pilgrim-Market reagent/tech/artifact bought, and offering paid (`Talents`, `quds`, `shells`) closes `opening + made + imported - consumed - spoiled - exported = closing` and `opening + minted - burned + in - out = closing` with `0.00` residual at **both** `presented` and `abstract` settlement levels.

---

## 2. Module Breakdown

### 2.1 `77-sim-6-season.js` — Drifting, Lunar & Sub-Daily `cycles`
`SIM.calendar({ year, latitude, windows, cycles })` now accepts `cycles: { name: { periodD | periodM, phase0?, spanD | spanM } | { test(minute, S) } }`:
- Evaluates non-annual and sub-daily cycles directly into `S.windows[name] = true` alongside fixed `yearDay` `windows`.
- Automatically drives existing `SIM.recipe` (`season` / `seasonRate`), `SIM.trade` `C5` (`closed: [{ legs, window }]` — holding carriers during `double-dark` and releasing them together when the window closes), and `SIM.onSeason(now, before, minute)`.

### 2.2 `77-sim-6d-decrees.js` — Liturgical Observances (`SIM.observance`)
```js
SIM.observance({
  id: 'jj.double-dark',
  window: 'double-dark',                      // window/cycle name or array of names
  settlement: 'jimjam',                       // optional scope (settlement, district, faction, org)
  forbidActs: ['CRAFT','SMITH','WEAVE','KEEP_SHOP','SELL','TRIAL'],
  closeKinds: ['jj_kiln','jj_glassworks','jj_court','jj_market_a','jj_market_b'],
  openKinds:  ['jj_temple_thirteen','jj_temple_week','jj_sibyl_court','jj_giant_ghat'], // 24h vigil override
  holdRecipes: 'observance: double-dark',     // calls SIM.recipeHold on scoped producers -> smoke=0
  roleSched:  'double_dark',                  // overridden per role by role.when[window]
  banners:    'double_dark',                  // socket banner key for 3D embodiment
  lamps:      0.15,                           // exterior oil-lamp dim factor
  priority:   100
});
```
- Wraps `SIM.isOpen`, `SIM.schedOf`, and `SIM.desire` cleanly; on window transitions (`SIM.onSeason`), syncs `SIM.recipeHold`, calls `SIM.placesChanged()`, and invalidates `a.wake` staggered by `SIM.lagOf(a)` so `SIM.WAKE` never stalls.

### 2.3 `77-sim-6p-pilgrims.js` — Unified Dual-LOD Pilgrimages (`SIM.pilgrimage`)
Supports **internal intra-region circuits** (`fromSettlement`, e.g. Xanadu's `Erehwon -> Qiblai` *kora*, `Theodiga`, `Phēr -> Grēṭ-Āil` launches, `Veḷḷai-kal -> Jimjam`) and **cross-regional astrological floods** (`fromPort`, e.g. Jimjam's `Serai`, `Hykkousoi` mariners, escorted `Eternal State` cohorts, `Dilihan`/`Ardent`, and `Inner Crater`/`Dalab–Shim`/`Yuni` scholars):
- **Presence & Diplomatic Modulation:** Reads `SIM.R.presence[faction + '@' + to]` (`EXPELLED`/`NONE` -> `0`, `PERSECUTED` -> `0` unless `covert`) and `SIM.stance(hostFaction, streamFaction)` (`hostile` -> `0` unless `covert`).
- **Escorted Regulated Cohorts (`governance: { mode: 'escorted_cohort', wardenRole, cohortSize, maxCohorts, lodgeOnly, forbidKinds }`):** Models the Eternal State's Six-Ministries pilgrim wards—headed by a `wardenRole` minder, restricted to `lodgeOnly` hostels, and blocked via `SIM.welcome` from entering `forbidKinds` (such as uncounted or heretical shrines).
- **Tiered Lodging & `core/camp` Overflow:** Fills `lodgePrefer` -> `hostelKinds` -> dynamically opens `overflowCamps` (`transient: true` places), exposing `SIM.pilgrimCampTents(placeId)` so `core/camp` pitches striped Maidan pavilions during peak floods and strikes them back to `0` once pilgrims depart.
- **Internal Away-Tracking:** `SIM.awayPilgrims(settlement)` tracks residents currently away on internal pilgrimage.

### 2.4 `77-sim-6p-pilgrims.js` — The Great Pilgrim's Market (`SIM.pilgrimMarket`)
During major pilgrim floods (`(!M.floodOnly || ws.flood) && totalPilgrims >= minPilgrims`), a seasonal **Great Pilgrim's Market** opens at `place` offering rare and far-flung **reagents, tech, and artifacts**:
- **Causally Stocked by Arriving Streams (`pools[streamId]`):** Stalls and lots (`cat: 'reagent' | 'tech' | 'artifact'`, optional `covert: true`) spawn *only* from streams whose pilgrims actually reached the city during that flood epoch (`M.seededStreams`). If war, bandit blockades, or expulsion cut off `hykkousoi` or `scholars` (`Yuni`/`Dalab`/`Talia`), their Tethyan flooded-lab bio-vials, Dalabite pressure-gel, and Yuni Vault energy cells disappear from the market automatically (`ROADMAP.md` §17 & §36).
- **Purchasing (`SIM.pilgrimMarketBuy(marketId, lotId, qty, buyer)`):** Settles `Talents` / local currency via `SIM.pay` or `SIM.exchange` (splitting `treasuryTax` to `hostAcct` and net proceeds to the stream's persistent `pilgrim:<pilgId>:<streamId>` account), grants `item` to `buyer.actor` (`SIM.give`), and lands `good` into the host warehouse (`SIM.economyBook('imported', ...)`), preserving `0.00` `SIM.ledger` residual.

---

## 3. Cross-Polity Expansion Matrix

| Polity / Shrine Seat | Active Cycles / Windows | Observances & Pilgrim Streams | Pilgrim's Market Signature Lots |
|---|---|---|---|
| **Jimjam (`st5e01l76v`, `50k` capital)** | `91 d` *Double Dark*, `365th` *Day Outside*, `Day 350` *Solstice*, `434 d` *Concordance*, sub-daily moon transits | Double-Dark kiln/court/barge freeze; `Serai`, `Hykkousoi`, escorted `Eternal State`, `Dilihan`/`Ardent`/`White-Pass Yeti`, & `Inner Crater`/`Dalab–Shim`/`Yuni`/`Yonni`/`Rian` scholars | Tethyan `HM-17` bio-reagents, grown `Ys` nacre, Dalab pressure-gel, Yuni Vault cells, `Yonni` (`Arkerum`) giant-snail nacre/chitin, `Rian` lodestones & sap-essences, Khaayken `qiviut`/`goldroot`, Boatmurder dam relics, covert `Tẽ-tè` star-codices |
| **Xanadu (`Qiblai`, `Theodiga`, `Grēṭ-Āil`)** | Decree feasts, monsoon shoulder fairs, `Phēr` launch days | Prayer-wheel *kora* priority; internal Vale/Scarp streams (`Erehwon`, `Kirstabal`, `Phēr`) | High-Rift crystal resonators, Oidong History-Monk ink/scrolls, Godshearth machine-wax & sulfur |
| **Order of Historians (`Singing Gjár`)** | Harmonic fissure windows | Archive silence hours; `Longsong` & `Caldron House` internal circuits | Annotated pre-Cataclysm copies, Breath-Pipe ring tallies |
| **Voth / Dalab / Hykkousoi / Lizardmen** | Solar triumphs; Reformation sessions; spring-tide syzygies; relic-sinkings | Arena draws & conquered-ward curfews; High-Mound silence; Amphitriton truce | Chichani ancestral votives; Dalab biogel; pelagic abyssal pearls; Rift cavernamber & salvage |
