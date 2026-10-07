# kits/desert-nomads: the Desert Nomads kit

The camel nomads of the eastern high desert and the eastern abyss: the Eastern Nomads of the catalog (culture `nomad`; Shade's
people, the dune raiders, the caravaneers who water at Verge and Yuni). Split from the Scyvoi kit on 2026-10-07 to the owner's
style guide (the `desertnomad` reference folder):

- **Outside, austere:** brown hair cloth or white canvas, with simple patterns in ONE contrasting colour, in bands like the
  Yemeni tower houses' (rows of triangles, lozenges, small pointed arches, steps, chevrons): white on brown, dark brown on white.
  The bands are geometry (`dkBand`), crisp at any distance. The brass horns on the masts are the Eastern Nomads' sign.
- **Inside, Moroccan and Arabian, more muted than the Scyvoi:** majlis mattresses along the walls, the coffee hearth by the door,
  tea trays, hookahs, pierced brass lanterns, the sadu weave, studded chests, mashrabiya screens (the catalog's `nomad_*` pieces).
- **Beasts:** camels to ride, fight from and pack; a horse now and then; a cart now and then (no chariots); goats, sheep and cattle
  in the desert. In the abyss: riding and pack lizards, now and then a camel, goats, sheep and emus. No vardo, no Baelu.

```
cd kits/desert-nomads && python3 build.py                   # dist/desert-nomads.html
python3 build.py --vendor-check                             # the engine against kits/scyvoi/src (must read OK)
python3 verify.py dist/desert-nomads.html --assert          # invariants (headless Chromium, about a minute)
python3 verify.py dist/desert-nomads.html --cut --views "Sheikh's tent - inside (cut-away)"
python3 ../../tools/textures/pack.py kits/desert-nomads     # (from the repo root) after a change to materials.json
```

The page is a kit sheet like the Scyvoi kit's, with the same tools: **Inspector** (T), **Cut-away** (C), **Night** (N),
**Polygon** (P), **Walk** (F); `?only=key,key`, `?t=`, `?mat=proc`, `?furniture=0`.

## What is in it

| Row | Defs | Class |
|---|---|---|
| Small tents | `tent-bayt-small` (black goat hair, a sadu valance, the qata), `tent-khaima-small` (from the Scyvoi kit: brown, white triangles), `tent-hide-wedge` (from the Scyvoi kit: white stitching, ibex horns), `tent-square-small` (a small white caidal tent), `tent-tuareg` (ochre goatskins over carved arches, mat walls) | building, dwelling-single |
| Large tents | `tent-bayt-great` (majlis, qata, household, the coffee hearth), `tent-pavilion` (from the Scyvoi kit: white, dark arch bands), `tent-caidal` (white, lozenge bands, alcoves behind screens), `tent-square-great` (brown hair cloth, white bands), `tent-khaima-twin` (from the Scyvoi kit) | building, dwelling-multi |
| Sheikh, seer and trades | `tent-sheikh` (a nine-pole black tent, its majlis open to the front; an awning to the white guest pavilion; standards with the horns: civic + dwelling, rich), `tent-seer` (the counterpart of a shaman: a white tent sewn with stars, sand, stars and smoke), `tent-hookah` (an open-sided canopy: tavern), `tent-smithy`, `tent-hidemaker`, `tent-supply` (all three from the Scyvoi kit) | building |
| Camels, horses and carts | `camel-riding` (the shadad saddle, sadu cloth, long tassels), `camel-war` (kilim cloth, lance, hide shield), `camel-pack` (bags and a rolled tent), `horse-riding`, `cart-camel` (two wheels between shafts), `camel-litter` (the hawdaj: the counterpart of the Scyvoi ger cart) | life, prop |
| Herds and tethering (desert) | `goat-zariba`, `sheep-fold` (dry stone), `cattle-zariba`, `goat`, `sheep`, `cattle`, `tether-hobble`, `tether-stone`, `tether-line` (a camel line) | feature, life, furniture |
| The eastern abyss | `lizard-riding`, `lizard-pack`, `emu-pen` (a fence of bundled reeds), `emu` | life, feature |

## How it is made

Forked from `kits/scyvoi`: the engine fragments are the Scyvoi kit's, VENDORED unchanged (`build.py --vendor-check`); the kit's
identity and look are `src/26k-kit.js` (`KIT`, the library families, `KIT_FALLBACK`, the palette). Its own shapes are in
`40d-dk-desert.js`, its interiors' helpers in `41-tk-dress.js`, the defs in `42`-`59`. Every animal is the fauna kit's
(`KratorFauna`: dromedary, horse, sheep, cattle, goat, riding and pack lizards, marsh emu); the tack is fitted to its anchors.

**Textures.** The library's black goat hair, tent canvas, hides, woods and the star kilim are in use. Three sheets are owed by the
owner (`core/materials/PROMPTS-nomads.md`): the brown hair cloth (`hair`), the sadu band (`patSadu`) and the muted lining
(`patLining`). They are wired as optional families and draw as stand-ins until they come (`KIT_FALLBACK`): the hair cloth as
tinted canvas, the sadu and the lining as the star kilim, which is brighter than the muted look wants.

See `API.md` for the fragments and `KNOWN_ISSUES.md` for what is open.
