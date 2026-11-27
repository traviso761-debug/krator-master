# Stonebow — Architectural & Settlement Centerpiece Blueprint (`BLUEPRINT.md`)

## 1. Scale Model `5.1` Canyon Site: Chīng-Mā Porphyry Shut-In

- **Coordinates:** `5.1 px (1196, 179)` (`2,000 m/px`, Neo-Ozarks / upper Ria Valley border)
- **River:** Perennial karst-fed river `9109` (*Chīng-Mā* / Clear-Mirror River, `~330 m³/s`) at `1,215 m` ASL (`y = 0`), with a `33.4 m` upstream porphyry cataract at `z = -568 m`
- **Canyon Relief:** `420 m` inner highway gorge rim (`1,635 m` ASL) rising into bilateral `1,938 / 1,960 m` purple-red rhyolite porphyry & Ria Valley cherty dolomite shoulders (`723 m` total gorge relief)
- **Ancient Network Tie-In:** Carries the twin viaducts of the **Outland Gate Highway** (`route: outland` at `1192, 180` in `openworld/net51-gemini.json`) straight across the shut-in into the Ria Valley

## 2. Generated Architectural Sheets

- [`sheets/site-plan.png`](sheets/site-plan.png) — Full `1.52 × 1.52 km` canyon site plan (twin highways, hairpin U-loops, 4 twin-shaft pylons, 4 splayed wings with circular amphitheater bowls, 9 spine light wells + twin bronze Rosette Oculi, and sealed bulkhead lines)
- [`sheets/sections.png`](sheets/sections.png) — True `1:1` longitudinal section (`z = 0`) and midspan cross-section (`x = 0`) showing the eye-shaped central canyon void, suspended Tourist Center, City Center arch, X-braced Living-Working Bow, and Cultural Center Skylight Crown
- [`sheets/interiors.png`](sheets/interiors.png) — Room-by-room floorplate layouts across all 7 zones (`crown`, `bow`, `city`, `tourist`, `pylons`, `vaults-w`, `vaults-e`)

## 3. Hosting Stonebow as an Arcology Settlement Centerpiece

Stonebow is built from day one so a Ria Valley, Eternian, or frontier settlement can adopt `(0, 0)` (`buildStonebowRefurb`) directly:

1. **Inhabited Core (`~18,500` people):** `refurb/crown`, `refurb/bow`, `refurb/city`, `refurb/tourist`, and `refurb/pylons` have continuous structural floor decks, hollow exterior shells, whole interior partitions with interactive `core/door` leaves, rooftop crop beds & greenhouses (`RF.crops`), tension stabilizer cables, and a salvage-braced truss across the old bay-4 breach.
2. **Sealed Delving Ruins:** `refurb/vaults-w` (Automated Industries) and `refurb/vaults-e` (Factories, Utilities & Cliff Mechanical Roots) are physically isolated behind `stonebow.bulkhead.w` and `stonebow.bulkhead.e` (`STONEBOW.reach` verified in `test-stonebow.js`), retaining broken concrete partitions, rubble, and empty room sockets for expeditions or dungeon delving.
3. **One-Call Culture Socket:** Call `window._api.stonebow.socketRefurb(culture, opts)` (e.g. `"post-apoc"`, `"generic"`, or `"ancient"`) to re-furnish all 5 kept zones on the fly while leaving the delving vaults untouched.
