# Tethis — notes

The pelagic saucer arcology in the shallow sea (`targets/tethis` -> `dist/tethis.html`), built on clustered pylons
over a carbonate coral shoal in the fashion of Paolo __SOLERI_TETHIS_MD__* / *Babel IID* and Kiyonori Kikutake's *Marine
City*, and shown beside its modern condition as a **Hykkousoi** gill-folk settlement (`LORE.md` section 6.16) whose use
of every ring, tower and submerged pod follows directly from the Ancients' original Live / Work / Recreation blueprint
(`plan/BLUEPRINT.md`, `plan/AREAS.md`, `plan/FURNITURE.md`, `plan/sheets/N0..N7.png`).

- **Lattice and scale:** `1,448 × 956 m` hexagonal/axial marine lattice (`HEX = 390 m`, `OUTER_X = 645 m`), `-24.5 m`
  to `+218 m` vertical envelope, `346.6 ha` gross indoor floor + `19.4 ha` open rooftop orchards and lagoon parks,
  housing **36,017** in its intact Ancient state (at `45 m²` daylight-lit residential floor per person; Soleri `14 m`
  perimeter + radial light-court rule enforced in `8az0-tethis-plan.js` and `test-tethis.js`).
- **Platforms and satellites (`P0–P8`, `S0a–c`, `S3a`):** nine annular bevelled-hull saucers over sheltered central
  sea-wells (`P0` Civic Nexus & Inner Lagoon, `P1/P2` Residential & Marine Academy rings, `P3` Botanical & Conservatory
  Saucer, `P4` Stepped Diving-Lagoon Amphitheatre & Baths, `P5` West Harbour with its `36 m` ship-canal cut, `P6`
  Desalination & OTEC Works, `P7` Sea-Gate & Pharos, `P8` Smelter & Brine Refinery), plus three diagonal-strut &
  calyx-stalk satellite dishes (`S0a–c`) cantilevered off `P0` and `S3a` on its own pylon cluster below `P3`.
- **Towers (`T0`, `T4`, `T1a–T5`, `T6a–b`):** two Soleri/Moebius Mushroom Towers (`T0` to `+218 m`, `216 m`-wide cap
  with 24 warm/cyan radial soffit ribs and three mid-stem pods; `T4` to `+166 m` over `P4`), six Metabolist/Soleri
  radial plug-in capsule-drum residential and Pharos towers (`T1a, T1b, T2a, T2b, T3, T5`), and two segmented vapour
  condenser columns (`T6a, T6b`) crowned by T-beam cranes.
- **Submerged realm (`U0, U1, U4, U6`, `ST_*`) and shallow coral sea:** four annular underwater pressure rotundas at
  `-24.5 .. -7.5 m` linked by glazed subsea tubes (`-14 m`) over a sculpted carbonate-sand and coral-reef shoal
  (`TETHISWATER`, drawn by `core/water` + `core/atmos` with depth-ramped turquoise shallows and wave-heaving vessels).
- **Modern Hykkousoi condition (`d = 1`, ~6,420 souls):** upper rings and rainwater-harvesting gardens kept dry against
  gill-drying winds with grown nacre barnacle-pods and scallop balconies; dead electric lifts on `T0` replaced by a
  `3.5`-turn grown nacre helical conch-stair (`HYK_T0_helix`); fallen `B_6_1` spanned by an arched whalebone/nacre
  rib-bridge and `B_5_7s` fitted with a counterweighted rib-drawbridge; `U0, U1, U4` intentionally flooded as gill-only
  pearl sanctuaries and the drowned Gene-Scriptorium; `B_6_8` collapsed onto the seabed, isolating `P8` as a boat-worked
  Salvage Island watched by `core/ruins` (`KRUINS.watch`).

## Files

| File | Tag | What |
|---|---|---|
| `8az0-tethis-plan.js` | `[G data]` | pure layout records, analytical hull descriptor (`TETHIS.HULL` / `P.hull`), bathymetry (`seabedAt`), Live/Work/Rec/Civic zoning, Hykkousoi deltas, circulation graph (`reach`), and invariants (`RULES`) on `KRAND` |
| `8az1-tethis-water.js` | `[G data]` | world-space shallow-sea & coral-reef bathymetry, lagoon tint field, and `WATER.open` surface record (`TETHISWATER`) |
| `8az2-tethis-mats.js` | `[draw]` | ribbon-glazing & mushroom-soffit maps, Hykkousoi nacre materials, instanced capsule/nacre/coral/vessel items, fluted pylon & stepped saucer geometry builders |
| `8az3-tethis-towers.js` | `[draw]` | Mushroom Towers (`T0, T4`), plug-in Capsule-Drum Towers (`T1a–T5`), Condenser Columns (`T6a–b`), and the `T0` helical conch-stair |
| `8az4-tethis-draw.js` | `[draw]` | `buildTethis(scene, gx, gz, d, opts)` (`reseed(12600+d)`): `KTAGS.tethis` registration, `REGISTER` inspector volumes, `!opts?.noTerrain` reef/seabed/ROCK block, submerged rotundas, saucers, bridges, Hykkousoi accretions, and `P8`/`B_6_8` ruin |
| `89z-rows.js`, `91z-views.js` | `[draw]` | the two shallow-sea sites (`s = 1750`) and 14 preset views (including eye-level promenade, underwater rotundas, and night) |
| `90w-tethis-water.js` | `[draw]` | `ATMOS` + `WATER.draw` shallow coral sea, `WATER.rideOn` vessel heave, underwater camera/aqua-fog hook, and `KRUINS.watch` |
| `test-tethis.js` | test | `node kits/ancients/targets/tethis/test-tethis.js` (18 checks + `T.neg` negatives + `HULL` / `noTerrain` invariants + `AREAS.md` sync) |
| `plan/` | plan | `BLUEPRINT.md`, `AREAS.md`, `FURNITURE.md`, `tethis_blueprint.py`, and 8 PNG sheets (`sheets/N0..N7.png`) |

## Host, Water, Tideline & Dock Integration

- **`buildTethis(scene, gx, gz, d, opts)`:** passes `{ noTerrain: true, noVessels?: true, ground?: (wx, wz) => y }` when mounted onto an open-world or settlement water body. Synthetic reef rock (`ROCK` via `meshMerged(ROCK, MAT.rock, G)`), feathered carbonate seabed (`bedMesh`), and coral/kelp scatter use dedicated `KRAND.child(...)` streams and are gated behind `!(opts && opts.noTerrain)`, so disabling the demo shoal shifts zero PRNG draws on the megastructure.
- **`TETHIS.HULL` / `P.hull` / `G.userData.hull` (`8az0-tethis-plan.js`):** shared directly with `addSaucer` and `buildTethis` so concrete faces and queries cannot drift:
  - `span` (`1448`), `spanX` (`1448`), `spanZ` (`956`), `H` (`218`), `y0` (`-24.5`), `y1` (`218`), `bounds`
  - `toe(x, side)`: outer concrete fascia `z(x)` envelope across the hexagonal lattice (`side >= 0` north `+z`, `side < 0` south `-z`, `0` outside span)
  - `rAt(y, th)` / `plinthRAt(y, th)`: central Nexus axis concrete face `r(y, th)` from `U0` (`-20.5 m`) through the `74 m` lagoon dock & cardinal slips (`y = 0`), `P0` saucer, and `T0` Mushroom Spire (`+218 m`)
  - `saucerRAt(id, y, th)`, `wellRAt(id, y, th)`, `soffitY(id, r)`: exact outer wall/bullnose, inner lagoon-well, and parabolic dish heights for `P0..P8`, `S0a..S3a` (returning `0` across `P5`'s `36 m` ship canal at `th = PI`)
  - `pylonRAt(pyOrId, y, th)`: exact fluted pylon shaft, bell-footing, and `+7.5 m` wave-collar radius at height `y`
  - `tideline(d)` and `docks(d)`: exact `y = 0` concrete rings/piers and berthing faces (`[x, z, nx, nz, length, width, deckY]`)

Build: `python3 tools/build.py kits/ancients --target tethis` (takes `core/rand`, `core/tags`, `core/ruins`, `core/atmos`, `core/water`). Seed `12600`.

Measured (`verify.py dist/tethis.html --assert`):
- **Scene geometry:** `tethis/0` `443,108 / 700,000` tris (`8,659` instances, `15` merged meshes); `tethis/1` `429,140 / 700,000` tris (`6,881` instances, `17` merged meshes); showcase total `872,248 / 6,000,000` tris, `15,540` baked instances, `54` registered inspector volumes, `32–56 / 900` draw calls.
- **Acceptance frames (`VISUAL-BAR.md` §1):**
  - Ground / promenade level: `Grand Promenade at eye level`
  - Skyline vista: `Tethis in the shallow sea` (intact) and `Hykkousoi Tethis and the conch helix` (modern)

## Known limitations

- Interiors are architectural blueprint plates and catalog manifests (`plan/BLUEPRINT.md`, `plan/FURNITURE.md`, `plan/sheets/N1..N6.png`) plus exterior ribbon/viewport depth and emissive lighting rather than walkable `kits/interiors` partition meshes inside the curved annular shells.
- Vessels (`nvBoatAnc`, `nvBoatHyk`) and Hykkousoi rim pods (`nvNacrePod`, `nvScallop`) are compact instanced kit meshes scaled for arcology vistas rather than full-rigged `kits/ringsea` or `settlements/ys` host meshes.
- Underwater preset views override `92-camera.js`'s `y >= 2` dry-land clamp via `TICKS` in `90w-tethis-water.js` and apply underwater exponential aqua fog; crossing `y = 0` manually snaps past `[-0.45, +0.45] m` so the near plane never straddles a wave crest.
