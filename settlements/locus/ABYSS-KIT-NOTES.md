# Eastern Abyssal building kit (`abyss-kit.html`) — Oct 2026

The buildings of the **abyssal-desert** culture, who live on the salt marshes and river deltas at the edge of the eastern
abyss, beside the Geomancers' oil works and the ruins of the Ancients. A second kit sheet inside the Locus build:
target `abyss`, file `abyss-kit.html` (and `publish/abyss-building-kit.html`). Ten Locus assets sit on both sheets; 31
new assets (plus a helper demo) are on this one only. Open issues: `ABYSS-KIT-KNOWN-ISSUES.md`.

```
cd settlements/locus && python3 build.py                       # writes locus.html, locus-kit.html, locus-plants.html, abyss-kit.html
python3 verify.py abyss-kit.html --assert --out shots
python3 kitshots.py shots --sheet abyss-kit.html --dump         # writes sheet-items-abyss-kit.json
python3 kitshots.py shots --sheet abyss-kit.html abyss_temple:0:f abyss_temple:0:c abyss_temple:0:n
```

The first pass was built from the brief's written description of the eight reference images; the images themselves are
now in `refs/abyss/` and are compared with the kit under "The reference images" below (2026-10-01).

## Fragments

| fragment | seed | what |
|---|---|---|
| `65-abyss-00-core.js` | 650001 | `ABYSS.*` helpers, `KIT_ROWS.abyss`, the helper demo asset |
| `65-abyss-20-plants.js` | 652001 | 3 PLANTs (lily pads, potted herbs, creeper) |
| `65-abyss-30-housing.js` | 653001 | poor / middle / rich houses |
| `65-abyss-40-shops.js` | 654001 | eight shops |
| `65-abyss-50-civic.js` | 655001 | inn, tavern, caravanserai, library, school, amphitheatre |
| `65-abyss-60-temple.js` | 656001 | the Temple of the Altar |
| `65-abyss-70-palace.js` | 657001 | the Headman's palace and plaza |
| `65-abyss-80-military.js` | 658001 | the wall system, the citadel, the barracks |
| `65-abyss-90-farm.js` | 659001 | farmhouse, granary, windpump, warehouse |

Every fragment opens with `reseed(N)` and is one IIFE; the only new top-level names are `ABYSS` and the
`KIT_ROWS.abyss` entry. Builders use `F.rnd()/F.rr()/F.pick()` only.

## What is on the sheet

Rows in this order (`KIT_ROWS.abyss`). *old* = a Locus asset also on this sheet (one definition, two sheets).
Triangles are the most of any variant, measured on the sheet (instances whose origin falls in the footprint + merged
triangles), including placed furniture and plants.

| group | key | name | variants | w x d x h | culture · types | tris | |
|---|---|---|---|---|---|---|---|
| Housing — poor | `stilt_poor` | Marsh stilt house | 3 | 11 x 10 x 8 | abyssal-desert · single-family dwelling | 2.5 k | old |
| | `abyss_house_poor` | Salvage shack | 3 (drum house · container shack · reed-and-sheet lean-to) | 10 x 10 x 7 | abyssal-desert · single-family dwelling | 2.1 k | |
| Housing — middle | `stilt_mid` | Pastel stilt house | 3 | 16 x 16 x 12 | abyssal-desert · single-family dwelling | 5.1 k | old |
| | `abyss_house_mid` | Abyssal family house | 3 (stacked containers · silo house · painted townhouse) | 14 x 14 x 12 | abyssal-desert · single-family dwelling | 5.4 k | |
| Housing — rich | `abyss_house_rich` | Abyssal great house | 3 (cone shell over terraces · sail-roofed compound with a dock · tin-mirror tower house) | 24 x 24 x 20 | abyssal-desert · single-family dwelling | 19.1 k | |
| Shops | `abyss_shop_weapons` | Weaponsmith | 2 (plank forge-shop · container smithy under a sail) | 13 x 12 x 8 | market/shop + industry | 3.2 k | |
| | `abyss_shop_armor` | Armourer | 2 (pastel shop with a shield wall · tin-clad shed) | 12 x 12 x 8 | market/shop + industry | 2.5 k | |
| | `abyss_shop_general` | General goods | 2 (container store with an awning · two-storey cabin under umbrellas) | 13 x 12 x 9 | market/shop | 6.1 k | |
| | `abyss_shop_food` | Cookshop and fish stall | 2 (stall under a sail with an oven · drum kitchen with tables) | 13 x 12 x 7 | market/shop + tavern/inn | 5.9 k | |
| | `abyss_shop_alchemy` | Alchemist | 2 (tank house · twin tanks on a gantry) | 12 x 12 x 11 | market/shop | 4.0 k | |
| | `abyss_shop_salvage` | Salvage dealer and tinker | 2 (scrap yard and container office · tank office and a hoist derrick) | 16 x 14 x 10 | market/shop + industry | 2.6 k | |
| | `abyss_shop_salt` | Salt and fish merchant | 2 (salt cones under a sail · reed salt-shed on a deck) | 14 x 12 x 7 | market/shop | 3.6 k | |
| | `abyss_shop_sailmaker` | Sail, canvas and rope maker | 2 (long shed under a swooping sail · canvas loft with drying lines) | 16 x 12 x 9 | market/shop + industry | 2.6 k | |
| Hospitality | `tent_pavilion` | Great pavilion tent | 3 | 18 x 14 x 7 | abyssal-desert · prop + tavern/inn | 1.9 k | old |
| | `abyss_inn` | Courtyard inn | 2 (stacked containers round a deck court · galleried pastel wings) | 24 x 23 x 15 | tavern/inn + multi-family dwelling | 15.7 k | |
| | `abyss_tavern` | Sail-platform tavern | 2 (one deck under twin sails · two decks under a great peaked sail) | 22 x 20 x 13 | tavern/inn | 12.1 k | |
| | `abyss_caravanserai` | Caravanserai | 1 | 56 x 58 x 17 | tavern/inn + market/shop | 14.5 k | |
| Civic | `abyss_library` | Library under the great cone | 1 | 42 x 40 x 30 | civic | 31.6 k | |
| | `abyss_school` | School of the six cones | 1 | 36 x 36 x 13 | civic | 13.8 k | |
| | `abyss_amphitheater` | Amphitheatre | 1 | 76 x 76 x 14 | civic | 10.1 k | |
| Temple | `abyss_temple` | Temple of the Altar | 1 | 76 x 78 x 30 | religious + civic | 33.7 k | |
| Palace and plaza | `abyss_palace` | The Headman's palace | 1 | 92 x 72 x 34 | civic + single-family dwelling | 51.9 k | |
| | `abyss_palace_plaza` | The Headman's plaza | 1 | 92 x 62 x 9 | civic + market/shop | 46.6 k | |
| Military | `abyss_fortress` | Citadel on the rubble mound | 1 | 72 x 72 x 28 | military + civic | 20.3 k | |
| | `abyss_barracks` | Barracks | 1 | 52 x 46 x 16 | military + multi-family dwelling | 9.5 k | |
| Walls | `abyss_wall_seg` | Wall segment (12 m) | 1 | 12 x 6 x 8 | military + infrastructure | 0.6 k | |
| | `abyss_wall_tower` | Wall tower (on a joint) | 1 | 8 x 8 x 15 | military + infrastructure | 0.7 k | |
| | `abyss_wall_gate` | Wall gate (2 segments) | 1 | 24 x 10 x 18 | military + infrastructure | 2.4 k | |
| | `abyss_wall_corner` | Wall corner tower | 1 | 10 x 10 x 17 | military + infrastructure | 0.7 k | |
| | `abyss_wall_run` | Wall run (demo of the joins) | 1 | 74 x 22 x 18 | infrastructure · tag demo | 5.8 k | |
| Farming and storage | `farm_saltrice` | Salt-rice farm | 2 | 48 x 38 x 9 | abyssal-desert · farm + dwelling | 54.6 k | old |
| | `abyss_farmhouse` | Marsh farmhouse | 2 (stilt house, pen and threshing deck · drum-and-reed farm with a granary basket) | 24 x 22 x 9 | farm + single-family dwelling | 6.7 k | |
| | `abyss_granary` | Silo granary | 1 | 28 x 24 x 16 | farm + infrastructure | 14.2 k | |
| | `abyss_windmill` | Windpump and water tank (ANIMATED) | 1 | 16 x 14 x 16 | farm + infrastructure | 2.8 k | |
| | `abyss_warehouse` | Salt-marsh warehouse | 2 (corrugated shed on piles · containers under a shared sail) | 36 x 22 x 12 | industry + market/shop | 4.9 k | |
| Industry (Geomancer) | `ind_pumpjack` | Pumpjack (ANIMATED) | 2 | 8 x 15 x 8 | geomancer · industry + infrastructure | 1.3 k | old |
| | `ind_oil_tank` | Oil storage tank | 3 | 24 x 27 x 13 | geomancer · industry + infrastructure | 3.6 k | old |
| | `prop_pipe_rack` | Pipe rack segment | 2 | 12 x 3 x 3.4 | geomancer · infrastructure + prop | 0.6 k | old |
| | `prop_drum_stack` | Drum stack | 3 | 5 x 4 | geomancer · industry + prop | 2.6 k | old |
| Street furniture and docks | `sunshade_poles` | Four-pole sun shade | 3 | 9 x 9 x 4.5 | abyssal-desert · prop | 1.0 k | old |
| | `infra_fishing_dock` | Fishing dock | 2 | 12 x 34 x 5 | abyssal-desert · infrastructure | 2.5 k | old |
| | `abyss_helpers_demo` | ABYSS helper demo | 1 | 64 x 36 x 16 | prop · tag demo | 13.7 k | |

All new assets: culture `abyssal-desert`, `kit:'abyss'`. Counted: **31 new keys, all present; none missing.**
Not on this sheet, by the brief: `ind_refinery`, `ind_generator_house`, `trade_fuel_station`, `civic_geomancer_chapterhouse`,
`locus_warehouse`, and the whole Yuni base kit (55–59), and none of them was used as a style reference.

Budget on the sheet (`verify.py abyss-kit.html --assert`): 76 items, **103 draw calls, 716 k triangles, 21.6 k instances** (2026-10-01; 102 / 691 k / 20.9 k at the first pass);
error panel clean. Largest single asset: the (old) salt-rice farm, 55 k; largest new: the palace, 52 k.

## The style, as built

Ground floors on bark-grey **piles and plank decks** over milky shallow water (a `saltWater` patch on the sheet), rails and
straight stairs. **Salvage used with pride:** shipping containers (corrugated, in `abContainer` colours, corner posts,
lock bars), horizontal drums, vertical tanks and domed silos made into rooms with cut windows, portholes, tarp awnings,
ring balconies and outside ladders; rust and painted sheet; cables, dishes and whip antennas kept to a few thin rods.
**Shade first:** sails swoop between masts (orange with a red-on-orange patterned band), canvas strips over room fronts,
umbrellas strung on wires. **Bright paint** on townhouses and shops (yellow, teal, pink) beside the existing pastels,
with iron balconies and painted mural panels. **Cone shells** (thatch, shingle or tin-mirror) over terraces: the rich
house, the library, the school, the temple's corner towers, the palace towers. **Swoop-and-horn roofs** (saddled thatch
ridges sweeping into horns with gilded tips) are kept for the sacred and the noble: the temple, the palace, the citadel's
keep, the barracks halls, the caravanserai gate and the wall gate. **Tin-mirror** cladding (a patchwork of flattened
cans, foil, bottle bottoms and mirror shards) marks wealth and sanctity; **red lacquer** with teal and gold bands is the
plinth and post colour of sacred and palace buildings. No parabolic arches, toron, banco or Musgum shells.

**Lighting:** poor and middle houses and shops hang **unlit** oil lanterns (`ABYSS.lantern(...,false)`, dark glass, no
light) — their windows still light on the evening schedule like every house in the engine. Inn, tavern and caravanserai
(public houses), and the rich, civic, sacred and palace buildings burn **lit** warm lanterns. The temple's crystal ring
glows blue (`glowmat` in `abCrystal`, with a warm night lamp for the fire bowl it rings). Nothing is electric.

## Palette (`05-palette.js`, the ABYSS block)

`abSailOrange #E07B39`, `abSailRed #B8402E`, `abBrightYellow #F2C230`, `abBrightTeal #2FA59A`, `abBrightPink #E26D8E`,
`abRustA #8A4A2B`, `abRustB #A5602F`, `abContainer [#3F6E8C #A23A2A #C9A33A #5D7D4A #7C7F80]` (alias `ABCONTC`),
`abTarpBlue #2E6FB7`, `abTin #C9CDD2`, `abLacquer #9A2C26`, `abGild #D4A537`, `abCrystal #5BC8E6`, `abSalt #E9E4D6`,
`abRubble #9C8E7C`, `abUmbrella` (six pastels, `umbrellas.jpg`), `abCream` + `abCreamCap` (the silo granary's render).
`ABYSS.C` mirrors them; `ABYSS.bright(F)`, `ABYSS.rust(F)`, `ABYSS.cont(F)` pick one.

## Materials (new families; `05-palette.js` FAMMAT + `47-texture.js`)

- `corrugate` — ribbed sheet, a rib every ~8 cm along u, laps every 0.9 m, patchy weathering. Grey, tinted per instance.
- `tinmirror` — a COLOUR texture: jittered tiles of flattened cans (mostly grey, some gold foil, teal and red), dark seams,
  bottle bottoms with bright rims, a few hard mirror-shard edges; tinted `abTin`. It is the one **Phong** family:
  `FAMMAT.tinmirror.phong = { shininess:70, specular:0x8a9096 }`, read by the new `kitMaterial(fm, opts)` in `45-kit.js`
  (Lambert for every other family, as before). No env map, no reflection render target: a glint, not a mirror.
- `rubble` — rough fieldstone (Voronoi stones, own tone each, pale mortar).
- `pattern` — the sail band: a strip of triangles between two zigzags. COLOUR texture whose ground is white and whose
  motif is `abSailRed/abSailOrange` per channel, so a band tinted `abSailOrange` shows red on orange and any other tint
  shows its own colour with a darker motif. Its UVs are set by `ABYSS.sail` (along the edge, across the band).

## The helpers (`ABYSS.*`, all `(F, ...)` in the asset's local frame)

| helper | signature and options |
|---|---|
| `grid` | `(F, fam, P, col, opt)` — P[i][j] local points → a smooth-shaded merged surface. `opt.uv`, `opt.hint` (vector or fn(p)), `opt.under` (a back face colour, offset `opt.off`), `opt.wrap` (closed ring). The base of sails, cone shells and swoop roofs. |
| `sail` | `(F, pts, col, opt)` — 3–6 corners; `swoop` (edge dip, tips curve up, 0.6), `sag` / `peak` (centre), `band` colour + `bandW` (patterned border), `under`, `n`, `fam`. Both faces. |
| `lantern` | `(F, x,y,z, lit, amp)` — oil lantern: the catalog's `abyss_hanging_lantern` through FURNISH; `lit=false` dark glass and no light. |
| `mast` | `(F, x,z,h, opt)` — `guys`, `guyR`, `lantern:'lit'|'unlit'`, `prop` (propeller-lantern) + `lit`, `finial`, `flag`, `r`, `col`. Returns h. |
| `coneShell` | `(F, x,z, r,h, opt)` — `fam` thatch/tile/tinmirror, `col`, `y0`, `k` profile (1.25), `arch:{w,h}` (on the side `face`, default +z), `archCol`, `thick`, `inCol`, `ring` (false = none), `finial`, `seg`. Inner skin, base rim and arch reveals drawn; the arch is cut by columns that end at its edge. Returns `{top, archH}`. |
| `vessel` | `(F, kind, x,y,z, opt)` — kind `tank`/`drum`/`silo`/`container`; `r`, `h`, `len`, `yaw`, `col`, `fam`, `win:[[a or u, y, side]]`, `port`, `glass`, `door` (angle / 'end' / 'side'), `doorAt`, `doorEnd`, `balcony`, `ladder`, `awning`, `hatch`, `capCol`. Returns `{top}` (drum also `axisY`). |
| `swoopRoof` | `(F, x,z, w,d, h, opt)` — ridge along local x; `y0` eave line, `horn` length, `tip` colour (false), `over`, `eaveLift`, `saddle`, `yaw`, `fam`, `col`, `gable` colour (false = open), `gableFam`, `ridgeCol`, `fins` (n carved spines along the ridge, leaning to the horns) + `finCol`. Returns `{ridge}`. |
| `tinClad` | `(F, spec, col)` — `spec.box=[cx,y0,cz,w,h,d]` + `spec.faces` 'fblr', or `spec.lathe=[x,z,prof]`; plates 0.03 m outside. |
| `trim` | `(F, x,y,z, nx,nz, w,h, door)` — salvaged mismatched strips and studs round a w x h opening; **y = the opening's bottom** (a window's centre − h/2, a door's `ly`); `door` drops the sill strip. |
| `cables` | `(F, a, b, sag, n)` — n thin sagging cables, 5 rods each. |
| `antenna` | `(F, x,y,z, kind, opt)` — 'mast' (`h`), 'dish' (`r`, `face`, `col`), 'lattice' (`h`). |
| `lattice` | `(F, x,z, w,h, opt)` — square tapering lattice tower; `y0`, `top` (head width fraction), `col`. |
| `altar` | `(F, x,z, size,h, opt)` — stepped square altar, `steps` (4), stairs mid-side ×4, salt top with a tin-mirror (or `border` colour) edge, lacquer `band`s; places `abyss_fire_bowl` and `abyss_crystal_ring` (variant lit unless `lit:false`). Returns `{top, topSize}`. |
| `furn` / `plant` | `(F, key, lx,lz, yaw, opt)` — place a CATALOG furniture piece (FURNISH, `API.md`) / a PLANT at local (lx, `opt.ly`, lz); `variant`, `seed`, `setting`. |
| `burn` | `(F, n)` — drop n numbers from the builder's stream (inline drawing replaced by a catalog piece keeps the stream stable). |
| `sub` | `(F, key, lx,lz, yaw, opt)` — build another ASSET inside this one (`ly`, `variant`); used by the wall run and the citadel. |
| `part` | `(F, name, lx,ly,lz, r,h, label)` — register a named part with the inspector (the altar). |
| `platform` | `(F, x0,x1,z0,z1, H, opt)` — piles every `span` (2.6) m, bearers, deck, edge beam; `pile`, `plank`, `r`, `brace`. |
| `railRect` | `(F, x0,x1,z0,z1, y, gaps, col)` — rails round a deck, `gaps=[[side,from,to]]`. |
| `flight` | `(F, x,z, dx,dz, y0,y1, w, col)` — a stair between two heights (LOCUS.stair always starts on the ground). |
| `corrRoof` | `(F, cx,y,cz, w,d, rise, col, yaw)` — mono-pitch corrugated sheet. |
| `water` | `(F, x,z, w,d)` — milky shallow water under a building on the sheet. |
| `sign` | `(F, x,y,z, nx,nz, w,h, pict, col)` — shop board, pictographs blade shield sack fish flask gear salt sail bed cup book. |
| `mural`, `balcony`, `billboard` | facade pieces: a `paintcol` panel; an iron balcony (`w`, depth `dp`); a salvaged billboard on legs. |

## Furniture and plants

**Oct 2026 (catalog pass):** the furniture is the master catalog's now. The 27 FURN pieces below, and eight pieces the
buildings drew inline (hung lanterns, propeller-lantern masts, the salvage dealer's sorted scrap, the sailmaker's
stitching frame, the alchemist's counter crystal, the plaza's lacquered standards, the farmhouse's granary basket, the
windpump's trough), live in `kits/catalog/krator-master-furniture-eastabyss.js` (same keys, culture `eastabyss`);
`65-abyss-10-furniture.js` is gone. `ABYSS.furn`, `ABYSS.lantern` and `ABYSS.mast { prop }` place them through
`FURNISH` (`src/66-locus-furnish.js`; `API.md` "Furniture"). The list below is kept as the record of what the kit made:

FURN (culture `abyssal-desert`, `room`, `place` indoor/outdoor/both; FURN_CULTURES gains `'abyssal-desert'`):
`abyss_bench` (2), `abyss_table_stools` (2), `abyss_lantern_post` (unlit/lit), `abyss_brazier` (cold/burning),
`abyss_fire_bowl` (cold/burning), `abyss_crystal_ring` (dark/glowing), `abyss_lantern_string` (unlit/lit, 12 m between
its masts), `abyss_umbrella_canopy` (10 x 10 bay; umbrellas / + lit lanterns), `abyss_counter` (planks on drums / bar in a
cut tank), `abyss_rack_spears`, `abyss_forge`, `abyss_armor_stand` (2), `abyss_shield_wall`, `abyss_shelf_jars`
(clay / glass), `abyss_crates` (3), `abyss_hanging_goods`, `abyss_clay_oven`, `abyss_smoking_rack` (2), `abyss_baskets`,
`abyss_salt_cone` (2), `abyss_canvas_bolts`, `abyss_bookshelf`, `abyss_reading_table`, `abyss_water_butt`, `abyss_well`,
`abyss_planter` (cut tin / clay jar), `abyss_beast_shade`. Buildings place them; none is modelled inside a build.
There is no furniture sheet for them; they are labelled where they stand (and the inspector reads them).

PLANT (`65-abyss-20-plants.js`, hypertropic · humid · abyssal, with the new optional `use` field — the README's
edibility/harvestability tag, shown by the inspector): `abyss_lily_pads` (wet, riparian yes; edible roots and seeds),
`abyss_herbs` (potted, mild; edible, medicinal), `abyss_creeper` (mild, riparian both; ornamental). The Locus plants
(`salt_rice_stand`, `salt_reed`) are placed by the farmhouse.

## The temple and the `sim` fields

`abyss_temple`: a 66 m precinct. The altar (`ABYSS.altar`, 14 x 14 m, 3.6 m, four steps, a stair mid-side on all four
sides, salt top with a tin-mirror border, fire bowl + crystal ring) is registered as its own inspector **part**
("The Altar"). Court of salt stone with inlaid squares (lacquer, teal, gold), a square ambulatory under swoop-and-horn
thatch on lacquered posts (the roofs stop short of the corners), tin-mirror cone towers at the corners, and the great
gate on +z (lacquered pylons with banded plinth and claw buttresses, the tallest swoop-and-horn roof in the kit, ridge
≈ 24 m). Nothing stands on the gate–altar axis (checked from the gate at eye level).

`sim` is **data only** (nothing reads it yet): `{ activity, capacity, focus }`, focus = a local [x,y,z].
Activities used: `REST` (houses, inn, caravanserai), `TRADE` (shops), `DRINK` (tavern), `LEARN` (library, school),
`PERFORM` (amphitheatre), `WORSHIP` (temple: capacity 200, focus [0, 3.6, 0] = the altar's top centre), `GOVERN`
(palace focus [0,5.4,-6] = the hall; plaza), `GARRISON` (citadel, barracks, wall pieces), `FARM` (farmhouse, windpump),
`STORE` (granary, warehouse). Documented in `53-assets.js`.

## Palace ↔ plaza

`ABYSS.PALACE_PLAZA_OFFSET = [0, 67]`: place `abyss_palace_plaza` at local (0, +67) in the palace's frame, same yaw
(palace d 72/2 + plaza d 62/2). The footprints touch; the palace's 16 m front stair ends at z = +30.8, leaving a 5 m
apron before the plaza's back edge, where the plaza's back bench row is broken for it. The ruler is called **"the
Headman"** until the brief names the title.

## The wall system

Segment `abyss_wall_seg`: **L = 12 m** (local x −6..+6), **H = 8 m**, 3 m thick, +z = the outside. Rubble to 4.5 m,
salvaged plate above with merlons, a walkway at **6.4 m** on the inside with a rail. **Join rule:** nothing passes
x = ±6, so segments with centres 12 m apart on the same line and yaw meet face to face, no gap, no overlap.
Tower `abyss_wall_tower` (r 3.4) sits **centred on a joint**, doors at walkway height on ±x, on the walkway's line (z −1):
**give it the same yaw as its segments** or its doors face out. Gate `abyss_wall_gate` is exactly **N = 2 segments** (24 m)
long: place it as two segments; a 6 m wide, 6 m high cart gate under a swoop roof. Its towers rise full height only on
their outer half (z 0..3.5); the walkway runs on behind them as a 2.5 m railed gallery over the gate's lintel, with a door
into each tower. Corner `abyss_wall_corner` (r 4.2) is **centred on the corner point** where the two runs'
axes meet; the next run starts at that point (its first segment's centre 6 m from it), doors on −x and −z (turn it so
they face the two runs). `ABYSS.WALL = { L, H, T, walk, gateSegments }`. `abyss_wall_run` (tag demo) calls the builders
through `ABYSS.sub` — segment, tower, segment, gate, segment, corner, segment (the last turned along −z) — and the
citadel builds its whole circuit (front: segment + gate + segment; other sides four segments; corner towers; joint
towers mid-side) the same way on a 4 m rubble mound (70 m at the foot, 58.8 m on top).

## The windpump (animated)

`abyss_windmill`: a 12 m lattice tower, gearbox head, static rim rings and hub, tail vane; the **18 blades and the pump
rod** are registered with `LOCUS.anim(F, 'windpump', { hub, R0, R1, n, bw, col, fam, speed, phase, yaw, rod:{x,z,y0,len,amp} })`
and moved by the new `windpump` kind in `76-locus-anim.js` (pooled InstancedMeshes, one matrix per part per frame, no
geometry per frame). Speed 1.6–2.4 rad/s; the rod rises and falls once a turn. `_locusAnim.sampleKind('windpump')`
reads its phase (checked: 4.35 → 4.85 rad over 1.5 s).

## Framework changes (all backward compatible; the Locus sheet and world are unchanged)

- `10-core.js`: `KIT` recognises `'abyss'`; `CITY_EXT` 760 on the abyss sheet (it is deeper than Locus's).
- `45-kit.js`: `NLV_EXT` 780 on the abyss sheet; `kitMaterial(fm, o)` makes Phong for a family with `phong`, else Lambert.
- `53-assets.js`: `kit` may be a string or an array → `assetInKit(A,k)`; `kitGroup:{ kit:'row' }` overrides `group`
  on one sheet → `assetGroup(A,k)` (**chosen over `abyssGroup`**: one generic field for any number of sheets);
  `KIT_ROWS[kit]` orders a sheet's rows; `BUILDING_TYPES` gains `'military'`; `FURN_CULTURES` gains `'abyssal-desert'`;
  `PLANT` takes an optional `use`; the `sim` field is documented.
- `70-sheet.js`: uses `assetInKit` / `assetGroup` / `KIT_ROWS`; the abyss ground is `#c9c2a8` (salt crust).
- `76-locus-anim.js`: the `windpump` kind; `_locusAnim.sampleKind(kind)`.
- `05-palette.js`, `47-texture.js`: the ABYSS block and the four families.
- `64-locus-*.js`: the ten shared assets gain `kit:['locus','abyss']` and `kitGroup:{ abyss:... }`; nothing else.
- `build.py`: target `abyss` → `abyss-kit.html`, `publish/abyss-building-kit.html`.
- `kitshots.py`: `--sheet FILE` (default `locus-kit.html`); dumps to `sheet-items-<sheet>.json` (gitignored).

## Verification (2026-10-01 pass: review fixes and the reference images)

- `python3 build.py`: clean (it rebuilds all four targets; `abyss-kit.html` is the kit's).
- `verify.py abyss-kit.html --assert`: error panel clean, 76 unique items, 103 calls / 716 k tris / 21.6 k instances.
- Looked at (one `kitshots.py` batch): warehouse, tower house, stacked-container house, inn court, wall run, citadel,
  palace (back), alchemist, granary, temple.
- Running `verify.py` in this container: Playwright 1.63 wants `chromium_headless_shell-1243`, but `/opt/pw-browsers`
  holds 1194; point `PLAYWRIGHT_BROWSERS_PATH` at a scratch folder holding
  `chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell` → a symlink to
  `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` (plus empty `INSTALLATION_COMPLETE`).
  The page loads three.js from the CDN; with no network, copy an r128 `three.min.js` next to the HTML (gitignored here)
  and `verify.py` serves it.

## Verification (first pass)

- `python3 build.py`: clean.
- `verify.py abyss-kit.html --assert`: error panel clean, 76 unique items, 102 calls / 691 k tris / 20.9 k instances.
- `verify.py locus-kit.html --assert --baseline` (baseline from the commit before the kit): 31 items in the same 7 rows,
  85 calls, 252,924 triangles, 7,989 instances — identical; only `_sheet.assets` grew (61 → 93).
- `verify.py locus.html`: 163 calls, 6,767,337 triangles — identical to before. (`--assert` on `locus.html` crashes on
  `A.GATES` in the Yuni-inherited invariants, before and after this pass; see known issues.)
- Looked at: every new asset and variant front (`f`) and eye level (`c`); plan views of the temple, amphitheatre, wall
  run and plaza; interiors / close views of the inn court, tavern decks, caravanserai gate and rooms, library terraces,
  school court, amphitheatre seats, temple gate axis and altar top, palace hall front and loggia; night views of the
  temple, palace, tavern, inn, a poor house and the tower house.

## The reference images (`refs/abyss/`, compared 2026-10-01)

| image | what it shows | the kit | changed this pass |
|---|---|---|---|
| `recycled_house_closeup.jpg` | Two tapering towers clad in flattened cans, foil and mirror tiles, with gold-painted panel bands, rows of bottle-cap studs along every seam, and odd salvaged windows (white sashes, gilt frames) set proud of the wall. The right tower stands on a rough fieldstone drum; the left ends in a crown of thin rods tied with looped wire. A studded tin pavilion with pierced panels in front. | The tin-mirror tower house (rich, variant c): tapering tin tower on a rubble base, trim-framed windows, a lantern top. The `tinmirror` texture reads as smooth grey at any distance; no gold bands, no studs; the windows were buried in the wall. | Windows in proud salvaged casings (tin, plaster or yellow), a gold sheet band and four rows of studs, a crown of 14 thin rods with a wire ring and loops round the lantern gallery. The texture is unchanged (known issue). |
| `umbrellas.jpg` | A steep street of brightly painted two- and three-storey houses (yellow, orange, pink, teal) with iron balconies and murals; overhead, hundreds of open umbrellas in pastel pink, lilac, sky blue, mint and lemon hang close together on sagging wires the length of the street. | Painted townhouse (bright lime-wash, balconies, mural) matches; `abyss_umbrella_canopy` had saturated kit brights (orange, red, teal) in a sparse grid on taut wires. | The canopy's wires sag, it hangs six umbrellas per wire, closer and lower, mostly in the picture's pastels (`PAL.abUmbrella`). Still a 10 m bay, not a street run. |
| `wq.jpg` | A concept sheet: tall pale-grey thatched cones (fine vertical straw lines) opening in great parabolic arches over terraced floors spilling with planting, a pool court, lesser cones and a domed rotunda round it, paths through jungle. | Library under the great cone, the rich cone house and the school match the form (arched cone over terraces, lesser cones, pool court). The library's thatch was mid-brown. | The library's cone is pale silvery grey (`0xC9C1AC`). Its terraces are still bare. |
| `2285020…jpg` | A desert salvage house: a rusty tank with a ring balcony on top of a yellow corrugated cabin, a green horizontal drum cut open as a shop front under an awning, a red tin-roofed shed, elbowed pipes, a ladder, an AC box, a billboard and a timber power pole with wires. | Drum houses, tank rooms with ring balconies and ladders, container cabins, billboards and cables are all in the kit. No big pipes, no power poles. | An elbowed salvage pipe off the alchemist's tank house down to a sump. |
| `46f83d9…jpg` | A floating timber deck town: great orange sails with red patterned bands swooping between masts, propeller-lanterns hovering, round decks with blue crystals, stairs and rails, pale trees. | The sail-platform tavern, palace loggias and the temple's crystal ring follow it closely (sail colours, bands, propeller-lanterns). | Nothing. |
| `679e20b…jpg` (豹族 Leopard) | A clan hall: an enormous swept saddle roof of dark, mossy thatch rising into twin horns with gilded tips, stepped eave tiers with carved ribs and spines along the ridges, a red lacquered plinth with a banded frieze, claw-like carved spurs at the front and a side stair with rope rails. Palette: browns, dark red, gold, teal. | Swoop-and-horn roofs over red lacquer with teal and gold bands (temple gate, palace, keep, barracks), claw buttresses on the temple gate. The thatch is clean and lighter; no tiers or spines. | `swoopRoof` gains `fins` (carved spines leaning out toward the horns); used on the palace (11) and the temple gate (7). The caption names a clan, not a ruler: the title stays "the Headman". |
| `9512944…jpg` | A cluster of cream-rendered domed silos with grey bands, portholes and hatches, blue tarps on poles between them, small red and blue sheds, a tall lattice mast with dishes and a camera, on red desert. | The silo granary (domed silos, portholes, blue tarps, a lattice mast with dishes). Its silos were bare grey sheet; the tarps' back corners floated. | Silos in cream render with pale domes (`PAL.abCream`), poles under the tarps' back corners, the catwalk moved off the silos' insides. |
| `e9a047f…jpg` | A stacked-container house on a plank deck over water: a pale blue container shack at the bottom, a yellow one on it, a rust-red one cantilevered on top, a grey-green corrugated box beside, a red tin-roofed shop front with a sign, rails and balconies, antennas, dishes, cables to poles, a billboard. | The stacked-containers family house and the container inn match it closely. | The house's second-floor containers no longer overlap; its outside stair lands on the balcony. |

