# kits/coyote: the Coyote kit

The settlement and culture kit of the Coyote Men: the four tribes of the Outlands (Valley, Peak, Sunrise, Sunset) and the
Kingdom of the Tiers (the Tierhounds). Catalog and `core/tags` culture `coyote` (registered at the next all-builds rebuild:
`TODO.md`). **Read `PLAN.md` first**: the look (section 2: the Valley after Catalhoyuk, the Peak's alcoves, the herders'
tipis, the Tierhounds' Masuleh terraces with ancient Indo-European touches, the Gate after Hattusa and Derbent), the core
adoption (section 4), the pending records it resolves (section 5) and the phases (section 9).

## Build and verify

```
python3 tools/build.py kits/coyote                       # dist/coyote.html (+ dist/coyote.tex.*.js, the library pack beside it)
python3 kits/coyote/verify.py kits/coyote/dist/coyote.html --assert       # KRATOR_GL=gpu for a GPU lane
node kits/coyote/tests/test-contour.js                   # the contour script
node kits/coyote/tests/test-rows.js                      # the draft Coyote row on core/hamlet's platform village
python3 tools/textures/pack.py kits/coyote               # after a change to materials.json
```

The page loads its texture pack beside it: serve `dist/` over HTTP, as `verify.py` does.

## How it is made

- **Core read in place** beside the engine's folders: `core/camp` (10, 20, 30: the census and the pitch), `core/space`, `core/hamlet` (10 to 34) and `core/city/33-city-strategies.js`
  (`KCITY.prim`, which core/hamlet reads): `build.py` `CORE_FILES`. Nothing under `core/city` is edited.
- **The engine** is `core/engine`, read by path (`engine.py`): `defBuilding`, the buckets by material key, doors and glass
  (`36o-open.js`), ladders (`36s-stair.js`), the walk records. `build.py` started from `kits/tents/build.py` with the
  new-build template's top lines (`tools/new_build/`).
- **`src/26k-kit.js`**: the kit's identity, its library families, the palette, `CY` (the stature: human, the owner
  2026-11-16; doors 2.0 m clear for the ears; the ladders' lean) and `CY_TRIBES` (each tribe's Hum name and gloss: a
  record carries its tribe as `tags.style`).
- **`src/32-cy-contour.js`** (`[G data]`): `cyContour(text)`, the contour script. A Hum text becomes a line that rises and
  falls by its syllables' tones (the onset sets the pitch, a snap consonant cuts a spike, the vowel's mark is the tone, a
  sentence ends in the howl). The same text always gives the same line; `tests/test-contour.js` holds it.
- **`src/40-cy-kit.js`**: the toolkit: `cyWall` (a socle, the brick body in its render, the plaster inside, openings that
  may overlap), `cyRing`, `cyRoof` (beams, reed mat, the earth slab with its hatch), `cyLadder`, the **ear door**
  (`cyEarHoles`, `cyEarDoor`: a doorway whose head steps up in two notches), the hearth, oven, platforms and bins, and
  `cyCarve` (the contour line raised on a face, one row or a word a row).
- **`src/34-cy-rows.js`** (`[G data]`): the Valley's and the Peak's rows for `core/hamlet` (`CY_ROW_VALLEY`, `CY_ROW_PEAK`) and the herders' camp row for `core/camp` (`CY_CAMP_HERDER`, registered as `coyote-herder`), a DRAFT kept in the kit until C7
  moves it to `core/hamlet/22-hamlet-coyote.js`: the houses, the works, and the platform fields (the cell, the store, the
  shrine room and council room as kivas sunk in the yard, two storeys). `tests/test-rows.js` lays it.
- **`src/50-cy-valley.js`**: the Valley's Catalhoyuk rooms on one builder (`cyMainRoom`, `cyHouse`): `cy_room` (entered through
  the roof, the ladder beside the hearth and oven, platforms north and east, bins west), `cy_house_poor`, `cy_house_mid` (two
  stores, the roof oven and screen), `cy_house_head` (the painted room: the running-bird frieze and the horn pillars; a loom
  room), the village's cells `cy_cell` and `cy_cell_store` (5.4 m square, flush roofs, an ear door when an upper room opens
  onto its terrace), and the sunk `cy_shrine_room` and `cy_hall`.
- **`src/52-cy-works.js`**: the Valley's works: granary, threshing floor, mill, goat pen, court, bronze smithy, potter's kiln,
  dye yard, oil press, weavers' house.
- **`src/56-cy-village.js`**: `cy_village_valley`, Catalhoyuk on its tell: `KHAMLET.platform` (core/hamlet) lays the rooms on the
  tell's grid, the sunk rooms in the yard, the ladders and the works at the foot; the fragment draws its records (the tell as
  an earth skirt and a top cut round the sunk rooms) and decides nothing about where a room goes.
- **`src/54-cy-peak.js`**: the Peak (Kam-Hau): dry-stone `cy_stone_hut` and `cy_stone_house` (the stone ear door: a slab lintel
  with two ear stones), the corbelled `cy_stone_store`, the alcove room `cy_cliff_house`, the sunk `cy_round_room` (cribbed
  roof, bench ring, fire pit and deflector), the stone `cy_fold`; the mine: `cy_adit`, `cy_ore_bench` (emerald schist),
  `cy_sorting_shed`, `cy_tappers_camp` (turquoise), `cy_wash`; and `cy_village_peak`, thirty people on a ledge under an
  overhang, laid by `KHAMLET.platform`'s alcove mode on the draft Peak row, in a stand-in cliff of tuff (`cyMound`).
- **`src/58-cy-herders.js`**: the herders (Tong-Hau, Si-Hau): the kit's own tipi (`cy_tipi_s`, `_m`, `_l`: the pole cone, the
  hide cover with the band's colour, its Hum name as a contour line round it and the runner bird at the back, smoke flaps, the
  dew lining, a hide door flap; roles family, sleep, chief, council, shrine; v 1 the winter tipi on its stone base), the ostrich
  pen, the feather and saddle racks, the egg cache, the winter base; the summer and winter camps of a Sunrise band of about
  fifty pitched by `core/camp` (`KCAMP.census`, `KCAMP.pitch`, horseshoe) on the draft row `coyote-herder` (34-cy-rows.js).
- **`src/60-cy-stones.js`**: the milestone (`cy_milestone`), the boundary stone (`cy_boundary_stone`, a name a face) and the
  runner bird's shrine at a road's foot (`cy_runner_shrine`).
- **`src/99-host-tz-cy.js`**: the probe's fields for `verify.py` (carvings, doors, the walk-reach audit, the fingerprint).
- **Textures** from the library through `materials.json` and `tex/`; the brick is a stand-in until `brick.mud.coursed`
  arrives (`KNOWN_ISSUES.md`; `core/materials/PROMPTS-NEEDED.md` section 53).

## Status

**C1** (the scaffold, the toolkit, the contour script, two Valley houses and the milestone) and **C2** (the Valley: four houses,
the village's cells and sunk rooms, ten works, the shrine and the boundary stone, the village on its tell on `core/hamlet`):
**C3** (the Peak: huts, store, the alcove room and round room, the fold, the mine's five works, the alcove village) and
**C4** (the herders: the tipi, the pens and racks, two camps on `core/camp`): built and verified (`verify.py --assert`). C5 onward:
`PLAN.md` section 9.
