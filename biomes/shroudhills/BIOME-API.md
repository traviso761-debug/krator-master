# Shroudhills (`biomes/shroudhills`) — Biome Kit API

`window.SHROUDHILLS` (`globalThis.SHROUDHILLS`, `id: 'shroudhills'`, Scale Model `5.1` region `rmwetizlzivnz`, *Yonni-Zāg:* **`Shrūda-Khīltæ`**) implements the `BIOME-API` contract on `core/biome`.

## 1. Engine-Neutral Data & Solvers (`src/20-shroudhills-defs.js`, `[G data]`)

Runs standalone in Node (`node biomes/shroudhills/tests/test-shroudhills.js`) with `core/rand` and `core/space`; zero `THREE` or DOM dependencies.

| Symbol | Description |
|---|---|
| `SHROUDHILLS.PLANET` | Planetary mist-forest constants (`g: 7.4`, `gRatio: 0.754`, `epiphyteLoadMult: 3.4`, `o2Fraction: 0.2095`). |
| `SHROUDHILLS.SITES` | Surveyed Scale Model `5.1` station records (`cove` at `(497, 302)` `+50 m` `1.59 atm`, `canopy` at `(531, 252)` `+686 m` `1.47 atm`, `cloaktor` at `(505, 302)` `+1,284 m` `1.36 atm`). |
| `SHROUDHILLS.ZONES` | Four elevation/lithology bands: `shroud_cove`, `canopy_sea`, `cloak_tor`, `mist_divide`. |
| `SHROUDHILLS.zoneWeights(elevM, graniteK, coastK)` | Normalized ecological zone shares `[0..1]` summing to `1.0`. |
| `SHROUDHILLS.SPECIES`, `SHROUDHILLS.byKey` | Nine canonical botanical species records carrying `HV` harvest, `gather` (`amber`, `peat-fibre`, `reed-wax`, `saltpeter`, `smudge-resin`, `crimson-dye`, `mucilage`, `fiddlehead`), and `KTAGS` `hazard` metadata. |
| `SHROUDHILLS.sisterCupSpec(seed)` | Deterministic `KRAND` solver for Paired *Sister-Cup* Cistern Sky-Ponds (`1.8–3.2 m` twin diameter, `90–320 L` rainwater capacity). |
| `SHROUDHILLS.catenarySpan(a, b, opt)` | Computes `0.75 g` catenary points, widths, and `~50 cm` suspended peat turf thickness between bough anchors `a` and `b`. |
| `SHROUDHILLS.pairHammocks(anchors, space, opt)` | Deterministic `KSPACE` neighbor-bridging solver pairing adjacent canopy crowns (`6–16 m` apart) into non-self-looping Grafted Root-Hammock spans. |
| `SHROUDHILLS.antColonySpec(seed, atm)` | Computes chambered Myrmecophyte Drum-Gall dimensions (`1.3–2.6 m`), `saltpeter` yield, and cat-sized *Khrōma-Mīra* Shroud-Ant worker (`28–34 cm`) & soldier (`38–42 cm`) sizes scaled by `pO₂`. |
| `SHROUDHILLS.antResponse(distM, opt)` | Evaluates the 3-state Shroud-Ant hazard response (`'peaceful'`, `'drum-rattle'` at `6 Hz`, `'phalanx'`). |

## 2. Kit Builders & Host Contract (`src/30`, `54`, `55`, `70`)

Expects `BIO.init({ tags: 'shroudhills', fields, ... })` with host fields `elevASL`, `coast`, `ravine`, `granite`, `tor`, `cobble`, `path`, `ironstone`, `moss` (each `(x, z) => number`).

| Call / Property | Description |
|---|---|
| `SHROUDHILLS.build({ R, quality })` | Runs deterministic `KRAND` passes (`shroudhills/trees`, `shroudhills/epiphytes`, `shroudhills/floor`) and populates placement tables. |
| `SHROUDHILLS.canopyH(x, z)` | Returns local canopy top height in metres (`terrainH + 1` outside crowns). |
| `SHROUDHILLS.speciesOfItem(itemName)` | Resolves an instanced `BIO.def` item name back to its canonical `SHROUDHILLS.SPECIES` record for the inspector. |
| `SHROUDHILLS.SISTER_CUPS`, `SHROUDHILLS.SKY_PONDS` | Placed Paired *Sister-Cup* records and dual elevated 10-gon `WATER.still` rainwater lens specs consumed by `89w-host-water.js` (`WATER.drawPools`). |
| `SHROUDHILLS.HAMMOCKS` | Placed `KSPACE` catenary Grafted Root-Hammock & `50 cm` Canopy Turf spans. |
| `SHROUDHILLS.COLONIES`, `SHROUDHILLS.ANTS` | Placed Myrmecophyte Drum-Galls and posed/marching `30–42 cm` *Khrōma-Mīra* Shroud-Ant instances. |
