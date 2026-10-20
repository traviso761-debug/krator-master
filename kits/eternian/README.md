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
(the toolkit), `50-et-dwell.js` (the dwellings), `89-rows.js` (the sheet's rows).

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

Next: P2 (the head generator), P3 (the dwellings of every tier and the canal street). `PLAN.md` §11.
