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
(dwellings 9401-9499, trade 9501-9599). Walls through `vnBody` (a hollow body once the kit has an interior set), doors through `vnDoor`,
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
| Trade — civic (lit, gilt) | `tal_customs_house` (the Emperor's customs on the east road: a baroque front up an imperial stair, the weighing court with its beam balance between two vaulted bonded stores, the road gate), `tal_bourse` (the caravan exchange: a square hall in a Corinthian arcade under the great drum-dome; taliaint3 inside, P6), `tal_bath` (talia hall: the domed hall, two wings of small domes, the pool court in its colonnade) |
| Trade — the caravan road | `tal_caravanserai` (a two-storey gallery round a court, the gate under a jharokha, corner towers, camel bays off the back walk, crawler bays through the back wall), `tal_agora_stoa` (a Doric-and-Ionic stoa before a row of shops; `o.len`), `tal_warehouse` (four barrel vaults over the stores, a walled loading court) |
| Trade — the street | `tal_shop_arcade` (shops under an arcade on piers, two storeys of flats over), `tal_inn` (a merchants' inn round a galleried court, a carriage gate, the tap room), `tal_press` (printers and bookbinders: the screw press in an open bay, a drying loft of printed sheets on the roof) |
| University — the core (lit, gilt) | `tal_uni_hall` (talia (3): eleven bays, an ochre ground storey, cobalt oculi, the clock tower under a gilt onion), `tal_uni_cloister` (talia-cloisters: two storeys of galleries round a court, orange coffered walks, a ring-and-meander floor, the gate passage under an orange vault), `tal_uni_library` (taliaint: a rotunda of two arcaded storeys under a ribbed dome and a lantern, a Corinthian portico), `tal_uni_senate` (a baroque front, paired columns, the imperial stair, a cupola) |
| University — faculties and the rest | `tal_uni_faculty` (`o.v` 0, 1, 2: 5, 7 or 9 bays; a cupola from 7, domed end pavilions at 9), `tal_uni_anatomy` (a three-storey drum under a tile cone and a skylight lantern), `tal_uni_hospital` (the Innocenti's loggia: Corinthian columns, cobalt roundels, ranges round a court, the chapel dome), `tal_observatory` (a banded tower, a gallery, a verdigris dome with its slot open), `tal_uni_college` (`o.wealth` 'rich' or 'poor'; place a poor one with `o.lit` false: a court, the hall under a tile roof, the chapel dome, the gate tower) |
| The arts | `tal_odeon` (a half-round cavea under a low ribbed dome, an Ionic portico), `tal_academy` (a classical front of niches and windows, the studios under a sawtooth of north lights), `tal_theatre` (open air: twelve tiers, five aisles, an arcaded outer wall, the scaenae frons; it stands on its wall on flat ground), `tal_uni_gallery` (the Glyptothek: blind walls of statue niches, glass clerestories, an Ionic portico, a domed rotunda), `tal_glasshouse` (talia hall: a glass dome with gilt ribs on a drum of glazed arches, two glass wings, a pool) |
| Civic | `tal_temple` (talia fancy, talia-temple: a Byzantine cluster on a podium, the axial stair, the pointed portal with the Sun and the Giant on its leaves, the star rose, four towers under melon domes, the egg dome on a drum of cobalt windows, the apse; a landmark, about 38 m), `tal_chapel` (talia3 (2): a white egg dome and rib spire), `tal_council_house` (a Corinthian temple front on a podium), `tal_fountain` (a nymphaeum: three statue niches, an aedicule, gilt spouts, a basin), `tal_memorial_spire` (talia-memorial: gadrooned domes, a lotus ring, the lathe spire, a reflecting pool), `tal_sky_bridge` (talia11: `o.len` span, `o.deck` deck height (not `o.y`, the placer's base); `o.piers` false in a city, where its ends meet two buildings) |
| The city wall | `tal_wall` (one segment `o.len` long, default 12: round-topped merlons capped in orange), `tal_wall_tower` (w 8: walls butt it at x = +-4), `tal_east_gate` (talia ornament: the Gate of the Passes, lotus roofs over two drum towers, a cusped arch under a sunburst, the road 5 m clear along z; walls butt it at x = +-10). On the sheet laid with no gaps, as a wall is built |
| The mixed street, six rows | each tier's Talia buildings between Vernacular ones of the same tier (`vern_house_poor_*`, `vern_house_mid_*`, `vern_shops` and `vern_tavern`, `vern_market`, `vern_shops`, `vern_tavern` and `vern_warehouse` for the trade row, `vern_house_rich_*`); `vern_school`, `vern_watch_house` and `vern_hospital` for the civic row) |

**The helpers** (`src/69u-tal-helpers.js`): `tanArch` (round, pointed, cusped or flat; a fill of dark, glass, lit, blind,
marble or cobalt; a band of boxes in segments, `tanArcBand`, so the band keeps its width on any span; jambs, keystone,
sill, rail, reveal), `tanArcade`, `tanLoggia` (70t: a real recess to the springing, a dark head above), `tanColumn` (a
lathe with entasis; Doric, Ionic, Corinthian or plain capitals, gilt on the rich), `tanColonnade`, `tanBalustrade` and
`tanParapet` (instanced balusters), `tanEntablature` (architrave, frieze, dentils, cornice), `tanString`, `tanPilaster`,
`tanPediment`, `tanScrollGable`, `tanDome` (hemisphere, egg, melon with ribs, onion), `tanDrum`, `tanLantern`,
`tanDrumDome`, `tanKiosk` (the chhatri), `tanJharokha`, `tanJali`, `tanWallStair`, `tanImperialStair`, `tanMosaicRing`,
`tanMeander`, `tanRoundBox` (rounded vertical edges), `tanParapetWall`, `tanPot`, `tanTrail`, `tanVault` (a barrel vault with closed ends), `tanCourtGallery` (one storey of an
arcaded gallery round a court, each corner column once, a gate's bay kept clear), `tanShopFront` (an opening, a folded
door leaf, a counter of goods, an awning and a sign). P4 adds `tanArcRun` (boxes round a horizontal arc: a theatre's tiers,
a ring), `tanLotus` and `tanLotusRoof` (petals edged in gilt), `tanSunburst`, `tanCoffers` (a coffered soffit),
`tanStatue` and `tanNiche`, `tanSpandrel` (closes the face between an arch and a level line), `tanOculus` (a round
window in a ring band), and `tanDrum` takes `round` (the 24-sided drum) and the windows' size. Kit items (`src/69t-tal-mat.js`,
prefix `ta`): marble, gilt, tile, cobalt boxes; discs; ribs and rings; the column and baluster lathes; echinus and bell;
domes in tile, marble, plaster and gilt; egg and onion lathes; the tile cone and hip; pointed heads in the fill materials.

**Next** (PLAN.md section 8): P5 the governor's palace, P6 the catalog culture file and interiors (the library's well,
the trading floor, the anatomy theatre's tiers, the studios), P7 the Godot export check and the gallery.
