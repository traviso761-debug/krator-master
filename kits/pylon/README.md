# kits/pylon: the Pylon kit

Pylon: Iziz's vassal arcology city on a savannah plateau, round the ruined Monolith; its post-Cataclysm buildings imitate the Ancients in white render and Iziz orange (built on the Iziz Vernacular contract).

The design is `PLAN.md`; what this kit shares with the Iziz Vernacular and Talia is `settlements/iziz/VASSAL-KITS.md`; the
governor's palace blueprint is `palace/BLUEPRINT.md`; the owner's reference pictures are in `refs/`.

```
cd kits/pylon && python3 build.py                     # dist/pylon.html: the kit sheet, with the Vernacular beside it
python3 verify.py dist/pylon.html --assert --views "Overview,Mixed street — eye level" --out shots
```

**How it builds.** The kit is written on the Vernacular's contract (`VERN.def`, the `vn*` helpers, the `v*` kit items;
`settlements/iziz/API.md`), so it is built on the Vernacular's own page with no copy of it: `build.py` runs the port
lint here, then `settlements/iziz/build.py --kit kits/pylon`, which merges `src/` into Iziz's one fragment order (a
fragment name that clashes stops the build), takes `targets/` and `kit.json`, and applies Iziz's build rules (a
`reseed(N)` per builder, no seed collisions, no shared-scope name clashes) to these fragments too. `verify.py` runs
`settlements/iziz/verify.py` on the page (its probe and invariants are Iziz's).

**Writing a building.** A named `function buildPyl*(G,o){reseed(9xxx+(o.v|0)); ...}` in a `src/7?p-pyl-*.js`
fragment, then `VERN.def({key:'pyl_*', ..., tags:{culture:'pylon', style, type, wealth, lit}, w, d, h, build})`.
Seeds 9001-9399 (dwellings 9001-9099). Walls through `vnBody` (a hollow body once the kit has an interior set),
openings through `vnWin` and `vnDoor`, so they match the Vernacular's sizes. Colours from `PYPAL` (`src/69p-pyl-mat.js`);
the orange is the Vernacular's own. Pylon's helpers are `pyn*` (`src/69q-pyl-helpers.js`). Add the key to a row in
`targets/kit/89z-rows.js` and, at its tier, to the mixed street.

## What is in it

| Row | Keys (the reference pictures in `refs/`) |
|---|---|
| Poor, salvage | `pyl_tank_house` (ancient 3), `pyl_ring_house` (pylon8), `pyl_pod_stack` (pylon7), `pyl_hex_cells` (honeycomb 2) |
| Middle, folk | `pyl_folk_house` (pylon), `pyl_folk_villa` (pylon 2) |
| Middle, neo-Ancient | `pyl_vault_house` (pylon (4), (7)), `pyl_terrace` (pylon (3), (2)), `pyl_block` (pylon 5, pylon3) |
| Rich, neo-Ancient | `pyl_neo_villa`, `pyl_hex_villa` (pylon (5), ancient massing) |
| Salvage and industry | `pyl_scrap_yard`, `pyl_breakers_floor`, `pyl_smelter`, `pyl_sorting_shed`, `pyl_workshop` (pylon3), `pyl_crawler_depot`, `pyl_tank_farm`, `pyl_cable_crane` (its cable runs `o.len` back and `o.rise` up from the mast: the placer sets the far end), `pyl_conveyor` (one segment, `o.len`) |
| Trade | `pyl_scrap_exchange` (pylon - market), `pyl_bazaar_lane` (pylon8; `o.len`) |
| Civic (lit) | `pyl_salvagers_guild` (ancient office), `pyl_assay_office` (the Emperor's tithe: a verdigris dome and the orb), `pyl_watch` (fortress), `pyl_cult_shrine` (pylon - temple), `pyl_school`, `pyl_clinic` |
| The Ancients (`src/77zp-pyl-ancients.js`) | six families, each in three states (`o.mode`: `intact`, `ruin`, `repaired`): `anc_pyl_fort` (fortress, at the Ancients' scale), `anc_pyl_slab` (the arch slab: the Monolith at a city block's scale), `anc_pyl_pods` (pylon6), `anc_pyl_vaults` (ancient apt), `anc_pyl_gems` (ancient massing), `anc_pyl_hoop` (honeycomb complex) |
| The temple | `pyl_temple` (ancient temple, ancient): the Ancients' temple, `repaired` by default |
| The Monolith | `anc_monolith`: kits/ancients' `buildMonolith`, read in place at decay `o.d` (default 1, the ruin); on the sheet at full scale, west of the rows (views "The Monolith", "The Monolith — the arch") |
| The mixed street, seven rows | each tier's Pylon buildings between Vernacular ones of the same tier (`vern_house_poor_*`, `vern_house_mid_*`, `vern_shops` and `vern_tavern`, `vern_house_rich_*`; then industry beside `vern_smithy`, `vern_salvage_yard` and `vern_warehouse`, trade beside `vern_market` and `vern_shops`, civic beside `vern_watch_house`, `vern_school` and `vern_hospital`) |

**The Ancients' states.** The families are Ancient Iziz Style families (`77z-iziz-style.js`: `izsFamily`, `izsPlace`), so
Iziz's wreck pass gives `ruin` (cut open, stripped). Its `rehab` (rusted, a flat scrap roof capping the broken top,
tarps) suits Iziz's drums and boxes but floats a disc over these forms (the owner, 2026-10-18), so Pylon takes `rehab`
as its own `repaired`, which keeps the white shell whole and lives round its foot (`pyaRepair`: shelters, stalls, a scaffold,
orange banners, lamp posts), which is the city's repaired side. Their culture tag is `ancients`, or
`ancients-reclaimed` when repaired. `kit.json` "external" reads `kits/ancients/src/89g-monolith.js` in place,
with the fragments it needs at load (`88-plymouth.js` for `plymQuadGeo`, and the four Arcube parts for `krShard`).

**The profiles** (`src/69q-pyl-helpers.js`): `pynTomb`, `pynStadium`, `pynPointed` (and the pointed hexagon), each a slab on
a face in render, concrete, glass, a dark opening or rust; `pynFrame(shape, ...)` for nested rims round a fill (`cs`
alternates their colours); `pynPorthole` and `pynPortCluster` (graded, packed by rejection); `pynCanopy`, `pynVault`,
`pynHexPod`, `pynTank`, `pynStepArch`; the folk tier's `pynBand`, `pynPanel`, `pynDiamond`, `pynDisc`, `pynStripes`,
`pynPier`, `pynScallop`, `pynColumn`. New kit items (`src/69p-pyl-mat.js`): `pyConc` (board-formed concrete in world
units), discs, rings, half-vaults, hex prisms, and glass and dark gable wedges.
