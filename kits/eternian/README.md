# kits/eternian: the Eternian kit

The building kit of **the Eternal State**, the civilization of the north-western lowlands (`LORE.md` §6.19). Catalog and
core/tags culture **`eternian`** (registered 2026-10-20). The design is `PLAN.md`; the capital's arcology and the True
Heirs' Sanctum are `kits/ancients/targets/sanctum` and `palace/BLUEPRINT.md`.

```
cd kits/eternian && python3 build.py                 # dist/eternian.html, the kit sheet
python3 build.py --vendor-check                      # the engine against kits/scyvoi (and the sky against Iziz)
python3 verify.py dist/eternian.html --assert        # footprints, doors, tags (zero unknowns), furniture, tiers
```

## How it is built

Forked from the Scyvoi engine as `kits/islanders` was (`PLAN.md` §0): the engine fragments are vendored byte for byte
from `kits/scyvoi/src` (`10-core 27-mat 30-geo 36-def 90-scene 91f-furnish 91n-night 92-world 93-anim 99-host-take
99-tail`; the sky from `settlements/iziz`), and `build.py --vendor-check` reports drift. The shared modules are read in
place: `core/rand`, `core/materials/record`, `core/tags`, `core/furnish`, `core/walk`, `core/atmos`, `core/host`, and the
catalog's `eternian`, `generic`, `generic-goods`, `jobs` and `scrap` furniture as one bundle. What is the kit's own:
`26k-kit.js` (identity, library families, palette), `37-wk-rec.js` (walk records, from the Islanders kit), `40-et-kit.js`
(the toolkit), `44-et-roof.js` (the roofs), `50`-`53` (the dwellings and the court), `70-et-canal.js` (the canal street),
`89-rows.js` (the sheet's rows).

## Where it stands (P0, 2026-10-20)

- The scaffold, the toolkit's first pieces and the first building, **the canal house** (`et_canal_house`): two storeys of
  white lime on a dark plinth, a fluted bay with Deco steel glazing carried past the roof, shuttered windows under stepped
  heads, the household's mask over the door, the oculus in the stepped crown, a grey-tiled kitchen and a pattern-block
  yard. Furnished from the catalog's new Eternian pieces.
- The catalog culture file `kits/catalog/krator-master-furniture-eternian.js` (seven common-tier pieces) and the culture in
  `FURN_CULTURES` and `core/tags/52-core-tags-vocab.js`.
## P1 (2026-10-20)

- **The library:** `materials.json` maps every kit key to a library set (lime on white stucco, the block on cut stone,
  pale brick, dark stone, grey roof tile, celadon glaze, timber, painted shutters, flagstones, reed, pale adobe, iron,
  cast bronze, verdigris, gold) and the owner's Eternian sets (onyx, alabaster, the pierced screens, the circuit mazes, the
  face frieze, the sign): 26 keys, packed beside the page (`tex/`, `dist/eternian.tex.eternian*.js`).
- **Alternates:** a sheet's extra takes appear on different instances of the same building (the owner): `screen` has two
  takes, `maze` three; `src/38-et-alt.js` picks the take per placed instance by a hash of its seed, variant and place.
- **The profile helpers** (`src/41-et-profile.js`): the stepped pier bundle, the lancet and the lancet bundle, the
  tracery grid, the cast pattern block, the pierced screen, the maze band, the frieze, the banner; a test row of samples
  (`src/45-et-samples.js`).
- **The trades** (the owner: the Islanders route, so the set of trade buildings is complete): `ET_TRADES`
  (`src/68-et-trades.js`) in the repo's shape (`tools/check_trades.py`): all 44 trades of the Voth census, each `keys`
  (the defs that carry it), a `gap` naming the def and phase that will, or `na` with the reason (the embassy tabled until
  Farport's page). `verify.py --assert` `voth-trades` and `tools/test_all.py` run the shared check; KNOWN_ISSUES.md lists
  the gaps; `node kits/eternian/tests/test-trades.js` checks each gap names its def and phase.

## P2 (2026-10-20)

- **The head generator** (`src/42-et-head.js`, [G data]): a faceted head from planes, its proportions (long, broad, aged,
  soft), eyes (closed, the dead, by default; open, the living) and headdress (stepped, fan, ring, none) a pure function
  of a KRAND seed; a mask mode (a face shell with a flat back); figures in four poses (standing, seated, holding a lintel,
  hands folded), never striding, never armed. Plain arrays of numbers: a Godot importer reads the same.
- **The statuary** (`src/43-et-statue.js`): `etHead`, `etFigure`, `etMask` draw from it in the metal of rank (gold,
  silver, bronze, gunmetal; stone for humans' ancestors; terracotta or lead at the canal town's doors; titanium for a
  colossus), each face seeded by a hash of where it stands, and noted on its building's record. The toolkit's stand-in
  mask is gone; the pier bundle's niches carry heads.
- **The sheet's statuary row:** fifty heads by rank (three open-eyed, three veiled), the figures in the four poses, the
  door masks. `verify.py --assert` `closed-eyes`: open-eyed faces under a tenth (3 of 64).
- **The Sanctum** (`kits/ancients/targets/sanctum`) reads the generator in place: twelve instanced variants, a head's
  variant a hash of its record id, the colossus its own; the ridges' face-stones are mask shells.

## P3 (2026-10-20)

- **Every tier of dwelling:** the poor (`et_reed_house`: silt and reed, a painted face over the door; `et_block_hut`:
  cast block and a reed lean-to; `et_canal_row`: three block houses, a flat on each floor, a shared stair and gallery),
  the middle (`et_canal_house`; `et_court_house`: a court behind pierced block, the household shrine with the family's
  heads; `et_corner_turret`: a shop and two flats, a verdigris-capped turret and a lantern), the rich
  (`et_merchant_house`: pale brick piers, lancet bundles, a celadon hip, a gilt face over a bronze door;
  `et_official_villa`: a walled compound, hall, register room, servants' quarters, a covered gallery of the family's
  heads, a reflecting basin: the census's household service) and the court over water (`et_heir_pavilion`: an octagon of
  bronze tracery and alabaster, a fish-scale ogee roof in gilt, bronze or gunmetal by variant; `et_heir_gallery`: a
  segment of covered walk with a head in a niche every bay).
- **The canal street** (`et_canal_street`): a canal (`et_canal`) sunk between quays of made ground, a pointed-arch bridge
  (`et_bridge`) with a bronze head on each keystone, verdigris lamps, and ten dwellings of every tier facing the water
  as nested records.
- **The roofs** (`src/44-et-roof.js`): gable, hip (with tile rolls and turned-up tips), pent and the octagonal ogee, the
  library sheets mapped in metres. New library families `scale` (`metal.scale`, tinted) and `gilt` (`roof.scale.gilt`).
- **The catalog's poor and court pieces** (`kits/catalog/krator-master-furniture-eternian.js`): the reed mat, the
  cast-block bench, the clay hearth, the clay mask board; the alabaster lamp, the bronze gallery bench, the ancestor
  niche, the canopy bed, the visor case.
- **The owner's furniture and wall sets** (delivered the same day; `core/materials/PROMPTS-archived.md`): the cast
  block in five relief takes, one per instance (`ET_ALTS.block`); the celadon barrel tile on the rich roofs; crackle
  glaze; woven reed for the mats; maze damask for the cloth; brass stringing for the court's lacquer.

## P4 (2026-10-20)

- **The State** (`src/60-et-state.js`): the ministry (the stepped pier bundle, figures in its niches, a civic door held up
  by two ancestors), the registry (a long hall of lancets, its vault, the clerks and registers), the examination hall (a
  hexagon of cells round a court under a hexagonal tower: the Sanctum's six-fold plan, the owner), the customs house (an
  oculus wall over its gate, the weighing hall).
- **The wall** (`src/61-et-defence.js`): the city gate (two gold colossi holding up its lintel), the wall segment, the
  wall tower (the frontier's taller and blind: v 1), the barracks outside the wall.
- **The machine layer** (`src/62-et-machine.js`): the Clock (a dial in gold and verdigris over a balcony where six
  ancestors parade; the parade is data on its record, `clock`, which `src/91c-et-clock.js` draws and runs), the tube
  station (hexagonal) and pipe, the talking head (a cell of the owner's terminal sheet in a stepped bronze surround, the
  petition stand; its record carries `voice`), the relic hall (a turbine casing for a gate, an apse of Ancient white).
- **The ancestors** (`src/63-et-faith.js`): the ancestor gallery (the city's temple: rows of heads by rank, the veiled
  among them), the street shrine, the house of the Withdrawn, the mask house, the Historians' chapter house.
- **The civic toolkit** (`src/46-et-civic-kit.js`): `etHex`, `etHexFaces`, `etCivicDoor`, `etTubeHead`, `etPipeRun`,
  `etFaceScreen`. Six catalog pieces (archive shelf, examination desk, capsule rack, mask bench, weighing scale, petition
  stand). Ten more census trades carried (eleven of 44; 30 gaps, by phase in KNOWN_ISSUES.md).

## P5 (2026-10-20)

- **The kept state** on two Ancient bodies, Plymouth and Arcoindian I (the owner's choice): `kits/ancients/targets/kept`
  (`dist/kept.html`), a pass over the bodies' materials, so the Ancients kit's builders are not forked: every glazed
  opening alabaster in a bronze tracery grid, the shell cleaned toward the Ancient white, cyan strips alive on a fifth of
  their runs, nothing patched. The target's `NOTES.md` has the detail.
- **A quality pass on both bodies** (the owner): Plymouth's see-through voids closed (its liner, its light court's walls
  over the channel), both buildings' exterior stairs rebuilt as two flights with landings onto the deck above,
  Arcoindian's towers kept under the vault.

## P6 (2026-10-20)

- **Every census trade** in `ET_TRADES` is carried (40 of 44; the palace and canton staffs are the Sanctum's, outside the
  kit; three na). The owner asked for the hexagon to make the set distinct: the kiln works and the tile works are
  hexagonal courts round their kilns; the market hall, the granary, the warehouse (round windows, arch-34), the healer,
  the tea house, the farmstead and Farport's lighthouse are hexagonal; the shop trades (bakehouse, weaver, brewhouse,
  smithy, shophouse) and the inn come in the street's rectangle (v 0) and the hexagon (v 1).
- **Hexagonal houses** at every tier (`src/54-et-dwell-hex.js`): the poor's hut, the common town's two-storey house,
  the rich man's villa in its walled garden.
- **Hydraulics and harbour** (`src/71-et-harbour.js`): the lock and its bronze gear, the stepped reservoir wall, the
  spillway face (its water runs: the record's `spill`, drawn by `src/91d-et-water.js`), the canal, ferry and fish
  landings, Farport's quay, dockyard and walled factory quarter.
- **`etTrade`** (`src/64-et-trade-kit.js`): one generator for a trade building in either plan, storeys, shop opening,
  roof by tier, chimney, furniture and the trade's own features.

Next: P7 (the interiors set, the furnished cut-away, the Godot export check). `PLAN.md` §11.
