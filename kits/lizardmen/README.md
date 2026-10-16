# kits/lizardmen: the Lizardmen kit

The Lizardmen of the Rift floor (catalog and core/tags culture `lizardmen`): the universally hostile reptilian people of the
deep Rift, who raid the Vale of Xanadu and build cyclopean reliquaries no one understands (LORE.md §6.17, §8). `DESIGN.md`
is the design agreed with the owner (2026-10-15) and what the owner's references decided (2026-10-16, its section 9): the
lore (the Coil, the Cataclysm as their phase inversion, pathogenic rebirth, the six castes on a 1.25 ratio), the look (ribs,
horns and tusks outside the skin, the squared spiral built and the round whorl carved, walls that lean wrong, triangular
caste-sized doors nested on the shared buildings, odd counts, the flaw in every band, silence made visible), the manifest.

```
cd kits/lizardmen && python3 build.py                      # dist/lizardmen.html (+ lizardmen.tex.*.js beside it)
python3 build.py --vendor-check                             # the engine against kits/islanders/src (must read OK)
python3 verify.py dist/lizardmen.html --assert              # invariants (headless Chromium, minutes under software GL)
python3 verify.py dist/lizardmen.html --cut --views "Bone hall - inside (cut-away)"
python3 ../../tools/textures/pack.py kits/lizardmen         # (from the repo root) after a change to materials.json
```

The page is a kit sheet: rows of every asset on flat placeholder ground, the standard Krator sky. Its tools: the view list,
**Inspector** (T), **Cut-away** (C: the near half of every building opens), **Night** (N), **Polygon** (P), **Walk** (F).
`?only=key,key` builds just those defs; `?t=` pins the clock; `?mat=proc` draws without the library maps.

## What is in it

| Row | Defs | Caste |
|---|---|---|
| Dwellings, by caste | `lz-warren` (the Tenders' cell-warren: seven earth cells in a whorl, horn-buttressed), `lz-makers` (the spiked carapace hut), `lz-longhouse` (the Drovers' rib house, eleven bays), `lz-lodge` (the warriors' tusk vault, two doors), `lz-tower` (the Interpreters' twisted tower, spiral eyes, a horn crown) | 1, 2, 3, 4+6, 5 |
| The nest hall | `lz-nest`: a Fermat spiral of grown chambers, hosts on basking slabs along the in-arm, seven clutch cradles at the centre, the out-arm | all |
| Trades and food | `lz-hall-bronze`, `lz-hall-reed`, `lz-hall-bone` (the butchery: carcasses on hooks sorted by part, hides on frames, bone bins), `lz-granary` (a brick podium with air channels), `lz-windmill` (a panemone, turning), `lz-farm` (placeholder crops, a frilled-lizard pen, the burden beast at the plough) | all, all, all, 3, 2, 3 |
| Military | `lz-barracks` (six empty suits in six sizes, racks of ge and ji), `lz-muster` (posts on a squared-spiral grid, no signal gear), `lz-lookout` (a hut on seven tall bone legs) | all, all, 4 |
| Specialists and stores | `lz-seer` (the model of the village, seer's hall included, lit spiral eyes), `lz-medicine`, `lz-warehouse` (the plunder, sorted along a spiral) | 5, 1, all |
| Monuments | `lz-stela-pair` (mirrored chirality), `lz-stela-turned` (turned, wrapped, facing a wall), `lz-obelisk` (thirteen twisted courses), `lz-circle` (a phyllotaxis spiral of 21 stones), `lz-ley` (the one straight thing), `lz-bells` (seven bells, no clappers) | all |
| The reliquary | `lz-reliquary`: the older order's scale on a three-stepped platform, nested bronze portals seven deep, the great stela, the repaired breach, the wings' candle-spires; inside, the antechamber with the relics, the footprints and the shut inner door | all |
| Beasts | `frilled` (the frilled lizard), `burden` (the burden beast), from `kits/fauna` | |

Every def declares the **caste** its doors are sized for (`caste: 1..6 | 'all'`; `verify.py` asserts it): a caste's own
building has a triangular door `lzDoorH(c)` = 1.15 x its height, a shared building a nested portal (`lzPortal`) from the
Bulwarks' 4.4 m down by 1/1.25 to a 1.2 m wicket. Every building with an interior opens in the cut-away and is furnished from
the catalog's `lizardmen_common_*` and `lizardmen_court_*` sets (basking slabs instead of beds, clutch cradles, scale-inlaid
chests) with the generic goods and the trade pieces, through core/furnish.

## How it is made

Forked from `kits/islanders` (2026-10-16): the engine fragments (`10 27 30 36 81 90 91 91f 91n 92 93 99`) are VENDORED
unchanged (`build.py --vendor-check`). The kit's identity and palette are `src/26k-kit.js` (with `LZ_CASTE`); the toolkit
`40-lz-kit.js` (the pointed arch, horns and ribs, the rib roof and the tusk vault, walls that lean, triangular openings and
nested portals, the leiwen, the spiral eye, glyph spirals, stelae, twisted courses, menhirs, the bell rack); the rooms
`42-lz-dress.js`; then one fragment per row (`50 52 54 55 56 58 60`) and the beasts (`56-sa-beasts.js`). See `API.md`.

**Textures.** The library's reed bundle and layers, reed mat, cane, black and crimson lacquer, iridescent chitin, bone,
ivory, horn, skull and ossuary, verdigris and cast bronze, flow-banded and polished basalt, large blocks for the cyclopean
masonry, ochre brick, eroded banco and rammed earth, two leathers, scale, cedar shingle, rope, gnarled wood and amazonite
for the jade (`materials.json`, 42 families with the furniture detail maps). The leiwen, the glyphs and the spiral eyes are
geometry: pattern sheets for them are a texture request (`DESIGN.md` section 8).
