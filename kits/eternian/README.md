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
- No library textures yet: the kit draws in vertex colours until P1's `materials.json` and the delivered sets
  (`core/materials/PROMPTS-NEEDED.md` §8).

Next: P1 (materials and the profile helpers: the pier bundle, the lancet bundle, the tracery grid, the pattern block),
P2 (the head generator), P3 (the dwellings of every tier and the canal street). `PLAN.md` §11.
