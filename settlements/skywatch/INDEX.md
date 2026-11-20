# Skywatch — Fragment & View Index (`settlements/skywatch`)

## Local `src/` Fragments

| Fragment | Port Tag | Purpose |
|---|---|---|
| `src/00-head.html` | `[web]` | HTML5 shell, `#errs` banner, local/CDN `three.min.js` r128 loader |
| `src/28-sw-model.js` | `[G data]` | Generated Scale Model 5.1 bake (`--bake-model`) at `(776, 470)`: `+3,745.5 m` datum, `29×29` (`56×56 km`) regional grid, `360°` horizon profile, and geology layers (`copper=120, zinc=96, iron=60, saltpeter=83`) |
| `src/30-sw-ground.js` | `[G data]` | Catmull-Rom 5.1 ground sampler, 4 cosine-eased delta families (pads, road cuts, cistern basins, adit benches), and `KDRAWN.grid` near (`10 m`) + regional (`400 m`) registration |
| `src/32-sw-layout.js` | `[G data]` | Deterministic 5-tier layout on `KCITY`, `KHAMLET`, `KCAMP`, `KSPACE`, `KRAND`, and `RES_ORE` (`SW_LAYOUT.make()` / `SW_LAYOUT.plan`) |
| `src/34-sw-rules.js` | `[G data]` | Pure invariant checks (`pinCheck`, `tiersCheck`, `overlapsCheck`, `wallTowerJoins`, `cisternCheck`, `mootCheck`, `solsticeCheck`, `horizonCheck`, `skarnCheck`, `campsCheck`) and `KTAGS` registration (`SW_RULES.registerTags`) |
| `src/45-sw-stage.js` | `[web]` | WebGL renderer, scene, camera, lights, kit-socket preservation (`SW_ANC_SOCK`), `KMASK.canvas` road/plaza field, and `KDRAWN.grid`-exact near + `56×56 km` far terrain meshes |
| `src/82-sw-landmarks.js` | `[draw]` | Dual-kit socket dispatcher (`JJ` vs `VERN`/`HL`), bespoke Skywatch landmark builders (`sw_solstice_sanctuary`, `sw_horizon_ring`, `sw_beacon_tower`, `sw_step_cistern`, `sw_salvage_assay`, `sw_wind_furnace`, `sw_skarn_adit`, `sw_moot_*`), `KCAMP` convoy & `1.35×` Sasquatch lodge defs, and skarn ore outcrops |
| `src/89z-sw-sky.js` | `[web]` | `ATMOS.skyBiome` (`px: 776, py: 470, pressure: 1.002`) and `ATMOS.bindHost` |
| `src/89zp-sw-place.js` | `[draw]` | Places all `SW_LAYOUT.plan` records through `JJ.place` and `VERN.place`, sloped basalt plinths, `KRUINS.watch`, `WATER.still` / `WATER.drawStill` cisterns, `KWALK` strips/plazas/blocks, `biomes/nhighlands` timberline flora, and `KDOORHOST` |
| `src/99-sw-host.js` | `[web]` | 10 preset `VIEWS` (zero `'` or `:`), clock switching (`Solstice sightline`, `Night beacons`), cutaway (`hlfUnits`), `hostChecks`, `hostNegatives`, and `KHOST.take` |
| `src/99-tail.html` | `[web]` | Closing `</script></body></html>` shell |

## Preset Camera Views (`VIEWS`)

1. `Overview` — High SSW bird-eye view over the pass gate, walled town, WNW Observatory Crag, and northern horizon
2. `Observatory crag` — `+3,817 m` WNW basalt dome with *Raja's Eye* brass observatory, *Solstice Sanctuary*, *Horizon Ring*, and *Ephemeris Hall*
3. `Solstice sightline` — Eye-level sightline from the Sanctuary meridian alidade through the Winter Solstice sunset arch (`Az 242.17°`, `+1.67°`) at Winter Solstice sunset
4. `Pass gate and town` — South Pass Gatehouse, banded curtain walls, and terraced switchback streets
5. `Step cisterns` — Close view into the Upper Vaulted Rock-Cut Step-Cistern (`WATER.drawStill` basin below rim)
6. `Convoy caravanserai` — Leeward caravanserai courtyard, bonded halite vaults, Salvage Assay Yard, and `KCAMP` yak convoys
7. `Skarn brass works` — Copper-zinc skarn adits, malachite/ochre gossan benches, and katabatic wind-furnace chimneys
8. `The Silent Moot` — NE escarpment ring of 13 unworked basalt monoliths, barter plinths, truce gong, and `1.35×` Sasquatch camps
9. `NNE vista` — Panorama from the Horizon Ring terrace toward the NNE East Dam Breach and Sasquatch highlands
10. `Night beacons` — Nocturnal pass view (`01:06`) with lit signal-beacon pyres and observatory lamps
