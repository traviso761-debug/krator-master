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
- **Textures asked for:** six prompts for the furniture and the common walls (`core/materials/PROMPTS-NEEDED.md` §8).

Next: P4 (the State: ministries, registry, examination hall, gate, wall, the Clock, the tube station, the relic hall, the
ancestor gallery, the talking head). `PLAN.md` §11.
