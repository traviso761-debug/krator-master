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
node kits/coyote/tests/test-wall.js                      # the Gate's long-wall planner on KCITY.site.wall
python3 tools/textures/pack.py kits/coyote               # after a change to materials.json
```

The page loads its texture pack beside it: serve `dist/` over HTTP, as `verify.py` does.

## How it is made

- **Core read in place** beside the engine's folders: `core/camp` (10, 11, 20, 30: the census, the pitch and `coyote-herder`), `core/space`, `core/hamlet` (10 to 36, `22-hamlet-coyote.js` among them), `core/water` (flow) and `core/city` (`10`, `15`, `25`, `33` in `19-kcity-site.js`): `build.py` `CORE_FILES`. Nothing under `core/city` is edited.
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
- **`src/34-cy-rows.js`** (`[G data]`): binds the kit's local names (`CY_ROW_VALLEY`, `CY_ROW_PEAK`, `CY_ROW_TIER`, `CY_CAMP_HERDER`, `CY_ROWS`) onto `core/hamlet/22-hamlet-coyote.js` (`coyote`, `coyote_peak`, `coyote_tier`) and `core/camp/11-camp-coyote.js` (`coyote-herder`, `KCAMP.coyoteProgram`), landed in core at C7. `tests/test-rows.js` and `core/hamlet/test-hamlet-coyote.js` hold them.
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
- **`src/62-cy-tiers.js`**: the Tierhounds (Lok-Hau), Masuleh's rule with ancient Indo-European touches: `cyLace` and
  `cyLacedRing` (timber lacing, the beam ends showing), `cyMegaron` (the porch between the antae and its two posts, the cross
  wall's ear door, the hall's round hearth and high seat, the smoke hole kerbed in the flat roof); the row pieces, one storey
  (3.2 m to the roof's top) and a band (6 m) each: `cy_ledge_poor`, `_mid`, `_rich` (a small megaron), `cy_stair_lane` (a
  flight to a landing flush with the row's roofs), `cy_terrace_wall` (the garden: its riser, the carved band, the channel; `o.w`
  its width); `cy_spring_hall` (the king's megaron on the podium over the spring), `cy_treasury` (the tholos), `cy_council`
  (a megaron with four posts and benches), `cy_rock_facade` (a Phrygian face: shrine or tomb).
- **`src/64-cy-lake.js`**: the lake towns: `cy_lake_house` (two storeys on its quay, the boat store below), `cy_fish_weir`,
  `cy_reed_boat`.
- **`src/66-cy-howl.js`**: Howl and the road: `cy_stage_house` (the walled court of stalls, the gatehouse with the rooms over the
  gate), `cy_runners_post` (the hut and the signal pole), `cy_larder`.
- **`src/68-cy-street.js`**: `cy_street_tier`, the stepped street: `KHAMLET.terrace` (core/hamlet's terraced village, Masuleh's
  rule: 36-hamlet-terrace.js) on the draft Tier row lays the ledge houses in rows up a test canyon wall, each row's roofs the
  lane of the row above, the gardens in the gaps, the stair lanes between, the council, shrine, larders and works below.
- **`src/60-cy-stones.js`**: the milestone (`cy_milestone`), the boundary stone (`cy_boundary_stone`, a name a face), the
  runner bird's shrine at a road's foot (`cy_runner_shrine`), the golden bird's cliff-ledge altar (`cy_phoenix_altar`, ash
  altar and sun pillar, never a feather), the road cairn (`cy_cairn`), the keep-out ring's turned-away `cy_shun_stone` and
  the scarp frieze `cy_carved_band`.
- **`src/35-cy-wall-plan.js`** (`[G data]`): `cyWallPlan`, the Gate's long-wall planner on `core/city`'s `KCITY.site.wall` and
  `wallSegs` (sealed in `19-kcity-site.js`, read in place): towers along the line, `cy_toll_gate` where a road crosses,
  `cy_water_gate` where a river crosses, `cy_postern`, and slumped older stretches (`v: 1`). `tests/test-wall.js` holds it.
- **`src/70-cy-gate.js`**, **`src/72-cy-gate-wall.js`**, **`src/91z-cy-world.js`**: the Gate after Hattusa and Derbent:
  `cy_wall_run` and `cy_wall_tower` (whole and slumped `v: 1` watched by `core/ruins`), `cy_postern`, `cy_toll_gate`
  (guardian coyote-head protomes, customs court, weighing floor and bronze balance scale, toll-keeper's room),
  `cy_water_gate` (corbelled culverts and bronze-shod grilles), `cy_citadel`, `cy_fodder_pit`, and `cy_gate_wall` closing a
  140 m test floor from scarp to scarp over a `core/water` river (`WATER.flow`).
- **`src/99-host-tz-cy.js`**: the probe's fields for `verify.py` (carvings, doors, the walk-reach audit, the Gate audit, the fingerprint).
- **Textures** from the library through `materials.json` and `tex/`; the brick is a stand-in until `brick.mud.coursed`
  arrives (`KNOWN_ISSUES.md`; `core/materials/PROMPTS-NEEDED.md` section 53).

## Status

**C1** to **C7** built and verified (`verify.py --assert`): Valley, Peak, Herders, Tierhounds, shrines and stones, the Gate
on `KCITY.site.wall`, `core/water` and `core/ruins`, and the culture rows landed in `core/hamlet/22-hamlet-coyote.js` and
`core/camp/11-camp-coyote.js`. C8 onward: `PLAN.md` section 9.
