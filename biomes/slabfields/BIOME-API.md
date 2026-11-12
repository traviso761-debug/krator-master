# biomes/slabfields: the kit's surface

The Slabfields (`rmvmidbasin101`; `PLAN.md`). A biome kit on the shared biome core, built as stations (highrift's shape of page).
Station 1, **the Anvil's Foot**, is `dist/slabfields.html` (`python3 build.py`).

## Globals

| Name | Fragment | What |
|---|---|---|
| `SLAB_SITES` | `src/40-biome-slab-sites.js` [G data] | each station's numbers on scale model 5.1 after edit 3: `px`, `world`, `sky`, `base`, `atm`, the climate, and its landforms' records (`slab`, `apron`, `blocks`, `seeps`, `brook`, `gas`) |
| `SLAB_STRATA` | `src/41-biome-slab-strata.js` [G data] | the flood basalt as a KSTRATA recipe (`slab-floodbasalt`: flows, flow tops, red boles, maar tuffs; columns) |
| `SLAB` | `src/50`-`70` | the kit: `SPECIES`, `PAL`, `HARVEST`, `plantOfItem(item)`, `buildApron(R, q, o)`, `build(opt)` |

## `SLAB.buildApron(R, q, o)`

The apron's life on a station's ground: void fern in the blocks' shade, seep reed on the spring line, bench bunchgrass on the dry ground,
block lichen on the blocks' tops (`o.blocks`: `[{x, z, y, r}]`) and the rubble. Every cell seeded from `KRAND.cell(seed, ix, iz)`.
`o.keep(x, z)` 0 where the host keeps the ground bare. Reads the fields `wet`, `rock`, `slope`, `cold`, `shade`, `apron` (`BIO.field`); a host
gives `shade` and `apron` (the stage borrows the contract's `canyon` and `rim` slots for them). Returns `{ferns, reeds, grass, lichen}`.

## What the stage gives a station (`src/45-host-stage.js`)

- `L` (the land): `land(x, z)` without the blocks, `water(x, z)`, `bench`, `rimZ(x)` (the cliff's rim), `footZ(x)`, `toeZ(x)` (the apron's
  toe, `null` past its flanks), `apronT(x, z)` (the apron's thickness, m), `apronQ`, `W` (the `KRELIEF.scarp` record), `SEEPS`, `brookL`.
- `BLOCKS`: the apron's blocks, `KSTACKS` butte records with `name`, `big`, `r`.
- `terrainH(x, z)`: the land with the blocks' tops; `landH(x, z)`: without them (the ground mesh's).

## The page's API (`window._api`, core/host)

`hostChecks()` (the life placed; reed wet and fern shaded; nothing drowned; **the Anvil matches the model**: its crest within 150 m of
edit 513's 5,356 m and a cliff of over 1.6 km in under 900 m; the blocks placed and apart; the water drawn; the cameras above ground) and
`hostNegatives()`; `site()`, `biome()`, `at(x, z)`, `exportBox` (the spring line).
