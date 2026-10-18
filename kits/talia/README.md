# kits/talia: the Talia kit

Talia: Iziz's vassal university and caravan city at the foot of the eastern passes, founded by the Talei; Greek and
Byzantine forms with baroque, neoclassical and Indian dress on the civic and the rich, white with Iziz orange accents
(built on the Iziz Vernacular contract).

The design is `PLAN.md`; what this kit shares with the Iziz Vernacular and Pylon is `settlements/iziz/VASSAL-KITS.md`;
the governor's palace blueprint is `palace/`; the owner's reference pictures are in `refs/`.

```
cd kits/talia && python3 build.py                     # dist/talia.html: the kit sheet, with the Vernacular beside it
python3 verify.py dist/talia.html --assert --views "Overview,Mixed street — middle — eye level" --out shots
```

**How it builds.** The kit is written on the Vernacular's contract (`VERN.def`, the `vn*` helpers, the `v*` kit items;
`settlements/iziz/API.md`), so it is built on the Vernacular's own page with no copy of it: `build.py` runs the port
lint here, then `settlements/iziz/build.py --kit kits/talia`, which merges `src/` into Iziz's one fragment order (a
fragment name that clashes stops the build), takes `targets/` and `kit.json`, and applies Iziz's build rules (a
`reseed(N)` per builder, no seed collisions, no shared-scope name clashes) to these fragments too. `verify.py` runs
`settlements/iziz/verify.py` on the page (its probe and invariants are Iziz's).

**Writing a building.** A named `function buildTal*(G,o){reseed(94xx+(o.v|0)); ...}` in a `src/7?t-tal-*.js`
fragment, then `VERN.def({key:'tal_*', ..., tags:TA_TAG(style, wealth, type, lit), w, d, h, build})`. Seeds 9401-9799
(dwellings 9401-9499). Walls through `vnBody` (a hollow body once the kit has an interior set), doors through `vnDoor`,
so they match the Vernacular's sizes; windows are arches (`tanArch`). Colours from `TAPAL` (`src/69t-tal-mat.js`); the
orange is the Vernacular's own; gilt (`TAPAL.gilt`, the `taGilt*` items) only on rich and civic work. Talia's helpers
are `tan*` (`src/69u-tal-helpers.js`). Add the key to a row in `targets/kit/89z-rows.js` and, at its tier, to the
mixed street.

## What is in it

| Row | Keys (the reference pictures in `refs/`) |
|---|---|
| Poor, whitewash | `tal_cube_house` (talia2), `tal_lane_row` (talia2, talia5: `o.len` houses), `tal_hill_stack` (talia2, talia fancy: three tiers on a white retaining mass; on a slope the site's terrain carries it) |
| Middle | `tal_loggia_house` (talia), `tal_dome_house`, `tal_tenement` (talia14: the orange quarter, the bridge to the Vernacular), `tal_arcade_block` (talia13) |
| Rich (lit, gilt) | `tal_palazzo` (talia (2): the imperial stair), `tal_jharokha_house` (talia3), `tal_peristyle_villa` |
| The mixed street, four rows | each tier's Talia buildings between Vernacular ones of the same tier (`vern_house_poor_*`, `vern_house_mid_*`, `vern_shops` and `vern_tavern`, `vern_house_rich_*`) |

**The helpers** (`src/69u-tal-helpers.js`): `tanArch` (round, pointed, cusped or flat; a fill of dark, glass, lit, blind,
marble or cobalt; a band of boxes in segments, `tanArcBand`, so the band keeps its width on any span; jambs, keystone,
sill, rail, reveal), `tanArcade`, `tanLoggia` (70t: a real recess to the springing, a dark head above), `tanColumn` (a
lathe with entasis; Doric, Ionic, Corinthian or plain capitals, gilt on the rich), `tanColonnade`, `tanBalustrade` and
`tanParapet` (instanced balusters), `tanEntablature` (architrave, frieze, dentils, cornice), `tanString`, `tanPilaster`,
`tanPediment`, `tanScrollGable`, `tanDome` (hemisphere, egg, melon with ribs, onion), `tanDrum`, `tanLantern`,
`tanDrumDome`, `tanKiosk` (the chhatri), `tanJharokha`, `tanJali`, `tanWallStair`, `tanImperialStair`, `tanMosaicRing`,
`tanMeander`, `tanRoundBox` (rounded vertical edges), `tanParapetWall`, `tanPot`, `tanTrail`. Kit items (`src/69t-tal-mat.js`,
prefix `ta`): marble, gilt, tile, cobalt boxes; discs; ribs and rings; the column and baluster lathes; echinus and bell;
domes in tile, marble, plaster and gilt; egg and onion lathes; the tile cone and hip; pointed heads in the fill materials.

**Next** (PLAN.md section 8): P3 trade and the caravan buildings, P4 the University, the civic set, the temple, the
memorials and the east gate, P5 the governor's palace, P6 the catalog culture file and interiors.
