# Cascade Kit API (`kits/cascade/API.md`)

`kits/cascade` separates its pure `[G data]` planning (`src/40-av-records.js` .. `src/44-av-site.js`, zero `THREE` or DOM dependencies) from its Three.js builders (`src/50-av-kit.js` .. `src/56-av-interiors.js`) so any host settlement or `openworld/<region>` build can read the fragments in place and place a refurbished (or intact/ruined) Cascade arcology as its centerpiece.

## 1. `[G data]` Planning & Settlement Hand-Over (`40`–`44`)

### `AV.plan(opts) -> P`
Builds a deterministic arcology record:
- `opts.state`: `'refurbished'` (default) | `'intact'` | `'ruined'`
- `opts.culture`: `'republican'` (default for `'refurbished'`) | `'ancient'`
- `opts.seed`: integer world seed (default `19690`)

Returns `{ id, name, state, culture, seed, dim, footprint, apses, portals, towers, bridges, collarStruts, crownTiers, lantern, decks, ancientRelics, hydroHall, republican, debris }`:
- `P.footprint`: 8-vertex counter-clockwise `[x, z]` chamfered-square polygon (`12.16 ha`, `372 × 372 m`).
- `P.apses`: 8 radial stepped amphitheater apses (`aqueduct: true` and `aqueductNotch` on South Apse `k === 2` when `state === 'refurbished'`).
- `P.towers`: 12 cylindrical skyscraper column-towers (`4` inner with lift/stair shafts and superconducting/spliced power trunks, `8` outer).
- `P.decks`: 14 deck definitions (`L0..L13`, `0.4 .. 201.6 m`), each tagged with `categories` (`'work' | 'civic' | 'living' | 'rec'`).
- `P.ancientRelics`: present across all 3 states (`primeDynamo` `'online' | 'shattered' | 'failed-stabilized'`, `statorCradle`, `coolantRing`, `4` `busTrunks`, `6` `capacitors`, and `hallProps` catalog fixtures).
- `P.hydroHall`: present when `state === 'refurbished'` (`replacesRelic: 'av.relic.prime_dynamo'`, `aqueduct`, `3` `cataracts`, `4` `wheels`, `4` `gearTowers`, `5` `lineShafts` routed clear of the Ancient dynamo, `2` `penstocks`, `4` `dynamos` spliced into `P.ancientRelics.busTrunks`, `2` `tripHammers`, `2` `cupolas`, `bridgeCrane`, `salvageHoist`); `null` on `intact` and `ruined`.

### `AV.storey(P, deckIdx, AI) -> StoreyRecord`
Generates the complete room polygon, doorway, corridor, and furniture-recipe layout for deck `0..13`. `AI` is optional (`KratorAncientsInteriors`; when passed, attaches hall recipes dressed via `AV.DRESS[P.culture]`).

### `AV.settlementSlots(P, AI) -> SlotsSummary`
Aggregates the arcology's interior rooms into `core/simulation` / `core/city` settlement capacity records without touching Three.js:
- `households` (~`550+`), `capacityPopulation` (~`4,400+`), `jobs` by trade (`foundry`, `machinist`, `engineer`, `smith`, `miller`, `weaver`, `clerk`, `cook`, `merchant`, `healer`, `guard`, `farmer`), `categories`, and `rooms`.

### `AV.portals(P, opts) -> Array<PortalRecord>`
Returns `9` connection portals in complex-local or world-offset coordinates: `5` ground street gates, `3` lower tailrace canal portals (`E`, `S`, `W` at `y = -0.8 m`), and `1` elevated headrace aqueduct portal (`av.portal.aqueduct.south` at `y = 31.8 m, z = 186.0 m`).

### `AV.applyEdits(P, editsLog) -> { applied, skipped }`
Applies `krator-edits` delta records (`remove`, `move`, `set`) keyed by stable record id across `P.apses`, `P.portals`, `P.towers`, `P.hydroHall.*`, `P.republican`, and `P.debris`.

### `AV.sitePlan(seed)` / `AV.groundH(x, z)` / `AV.waterH(x, z)`
- `AV.CANAL_LINES`: polylines for `aqueduct` (elevated `y = 32.3 -> 31.8 m`), `south` (lower tailrace spillway), `eastStem`, `eastNorth`, `eastSouth`, `westStem`, `westNorth`, `westSouth`.
- `AV.sitePlan(seed)`: deterministic crop selections from `CROPS.forBiome('nhighlands')`, curved stone-curbed garden beds across the Twin Circular Gardens (`x = ±265 m, r = 106 m`), `3` `sluices` (`East`/`West` tailrace barge locks + `South` aqueduct headgate tower), `4` moored cargo `barges` (`ore`, `timber`, `ingots`, `grain`), and highland tree sockets.

### `AV.audit(P, AI) -> AuditReport`
Runs structural, clearance, `P.hydroHall` hydraulic-drop & machinery count, South Headrace Aqueduct room-clearance, polygon-area, door-width, debris-placement, and 4-category (`living`, `work`, `rec`, `civic`) room minimums checks. Returns `{ ok, fails, rooms, categories }`.

---

## 2. `[draw]` Three.js Builders (`50`–`56`)

### `AV.buildHero(P, { x, y, z }) -> THREE.Group`
Registers `P` and its structural & `P.hydroHall` sub-volumes in `TAGS` (`KTAGS`) and `REGISTER`, builds the merged outward-wound 220 m arcology mesh with `userData.cap = true` on solid structural buckets for `99-host-section.js` hatching, and attaches `TICKS`-animated overshot waterwheels, bevel crown gears, belt-pulley line-shafts, dynamo rotors, and reciprocating cam trip-hammers (`userData.decor = true`).

### `AV.buildSite(seed) -> THREE.Group`
Draws the `4 m` inner canal/garden terrain grid + 4 non-overlapping outer border grids (registered in `KDRAWN.grid`), the arched Southern Elevated Headrace Aqueduct Viaduct, the 3 Sluice-Gate & Barge Lock Houses, 4 moored cargo barges, the Twin Circular Gardens, and `biomes/nhighlands` trees.

### `AV.ensureRecords(siteKey)` / `AV.openDeck(siteKey, deckIdx)` / `AV.openSectionDecks(siteKey)`
- `AV.ensureRecords(siteKey)`: camera-independent pass registering all 14 decks' rooms and furniture records in `KTAGS` and `KFURN`.
- `AV.openDeck(siteKey, deckIdx, hideCeiling)`: spawns partition walls, doorways, lift/stair cores, and indexed `KratorFurniture` batches for a single deck cut-away and syncs `KWALK`.
- `AV.openSectionDecks(siteKey)`: opens the 8-deck representative vertical stack (`L0, L1, L2, L4, L5, L7, L11, L12`) for live cross-section slicing (`C` / `Shift+C`).
