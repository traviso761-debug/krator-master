# Qiblai, the city: the build plan (Q7)

The city of Qiblai on its ground: the holy city of the Decree, a mandala of nested walled squares round the Rainbow Temple,
built from the Qiblai kit (`kits/qiblai`) and the Xanadu kit on `core/city`'s nested-squares site. This is phase Q7 of
`kits/qiblai/PLAN.md` (section 7), written out step by step. The design is that plan's sections 2b and 3; this file
says how it is built, in what order, and how each step is proved. Written 2026-11-11, for the owner to approve.

## 0. Where things stand

| Piece | State | Where |
|---|---|---|
| The design | settled 2026-11-11 (the owner's answers, the faith, the Prismarchy, the colours, the Rainbow Temple) | `kits/qiblai/PLAN.md` sections 2-3 |
| The buildings | Q0-Q6 done: 43 defs, three mixed streets, three furnished interiors, the Xanadui script; GPU-verified | `kits/qiblai` on `refs/heads/claude/zealous-allen-0cd44d` |
| The site | the nested-squares generator `KCITY.squares` (rings, blocks, avenues, the kora and its chortens, walls and gates, terraces built up, monasteries by spoke, gate markets), its test and README; no build takes it yet | `core/city/35-city-squares.js` on `refs/heads/claude/nostalgic-cray-50aac5` (482e9570d) |
| The ground | 5.1 px 922,1595, at the cataracts of Nahr ash-Shalālāt, ~1 km from the bank; flat (37 m over the square), ~-1,900 m, Af, ~30 °C | `kits/qiblai/PLAN.md` section 1; the open world's `openworld/xanadu-oidong-highrift` |
| The open-world site | the move landed on the open-world branch; no Qiblai site cut yet | `claude/openworld-sites-24defd` (SITES.json, `cut_site.py`, KSITES) |

**Before Q7a:** the two branches above meet (the kit and the site module), on main or on one branch; the owner decides
which (nothing here pushes or merges without the owner's word). The kits/interiors clearance fix (`claude/agitated-meitner-15ed1a`)
and `qiblai` in core/tags' vocabulary (`TODO.md`, the ride-along) are not prerequisites: the kit works round both.

## Progress (2026-11-11)

- **Q7a** done in part: the Temple Mountain compound (`qb_temple_mountain`), the monastery astride its avenue
  (`qb_monastery_half`), the half gate market (`qb_gate_market_half`), walls and kora arcades by length (`o.len`). Not yet:
  the terrace stair (`qb_terrace_stair`; the avenues climb by the ground's slope), QBK (the city is a target on Xanadu's page,
  so it needs no bundle; the open world will).
- **Q7b-Q7d** built as a first city (`README.md`): the site laid, the walls, gates and towers, the kora, the monasteries on
  their spokes, the gate markets, the rings filled (2,253 lots, a third of the lay houses Xanadu's), the ghat way
  and the ghats, the caravanserai, the temple estates' fields, the Vale of Xanadu flora as a stand-in; GPU-verified. Open:
  the people by ring (`KNOWN_ISSUES.md`), the Af flora, the river's cataracts and the open world's ground.
- **The density fades from the centre** (the owner, 2026-11-11: "a 4-way symmetrical pattern of squares with mostly gardens
  on the edge and some gardens placed like enclosed courtyards in the more built up area"). A lay block's use is set by its
  ring r and its step t along the side from the avenue, so the pattern is the same under both mirrors and both diagonals
  (`QC_GARDEN`, `QC_COURT` in `targets/city/89zq-qc-site.js`):

  | ring (r) | whole gardens (t) | courtyard blocks (t) | built (t) |
  |---|---|---|---|
  | 4, rich | | 1, 2, 3, 4 | 0 |
  | 5, middle | 3 | 1, 2, 4, 5 | 0 |
  | 6, poor | 2, 3, 4, 5, 6 | 1 | 0 |
  | 7, poor, at the wall | 2, 3, 4, 5, 6 (7: a meditation garden) | 1 | 0 |

  84 garden blocks and 72 courtyard blocks ("more gardens", the owner, 2026-11-11: the lay rings ~6,350 against the plan's
  6,000). A courtyard block keeps its frontage round a square cleared of houses (48 m in the rich ring, 54 m in the middle,
  56 m at the wall) with a chahar-bagh in it; every garden faces the centre.
- **The four meditation gardens** (the owner, 2026-11-11: "a unique meditation garden in each corner, featuring the colors
  of the two closest monasteries"; "pick flora tastefully by color"): `qb_meditation_garden` (kits/qiblai) in each corner
  block, in the colours of the two monasteries whose sides of the wall meet there: NE the Stone Garden (crimson, gold), SE
  the Lotus Water (gold, turquoise), SW the Walking Circle (turquoise, violet), NW the Grove of Cells (violet, crimson).
  Their plants are picked by colour (`targets/city/90p-qc-flora.js`) from the Rift, the Rift Rim, Oidong, today's Vale of
  Xanadu and Opal Valley (its fire-opal breaker crown for the crimson trees, its prism fern and opal pads), sealed with
  today's core/biome in `gen/69r-flora-bundle.js` (Xanadu's page runs an older biome core those kits cannot load on),
  and the gold from the page's own Vale (the ginkgo): 182 plants, no gaps (2026-11-12; notes in `KNOWN_ISSUES.md`).
- **The walk-in rooms, on demand** (the owner, 2026-11-15): the sanctum of the Rainbow Temple (new: the Station as it was, whole,
  a gilt shrine on its dais, the eight pillars in the eight colours), the council chamber of the Prismarchy, a great monastery's
  assembly hall and a hostel's dormitory, each inside its own building at its storey's size, built and furnished when the camera
  comes (`targets/city/90t-qc-interiors.js`); floors, ceilings, walls, columns, gilt and furniture all textured from the library
  (`qMarble`, `qPlank`, `qLacq`, `qGilt`, `qRug`; the furniture's detail maps). The fancier surfaces are owed (PROMPTS-NEEDED 43).
- **Every lot building's interior** (the owner, 2026-11-15: "work on wiring in kit interiors to all buildings"): the ground storey
  of all 976 lot buildings that hold a room (28 types: the Qiblai kit's houses, trades, guilds, colleges, hostels, granaries and the
  Xanadu kit's houses; the 490 shrines, wheel houses and the great rooms' own lot left out), planned by kits/interiors, drawn with
  the kit's textured floorboards, lacquer and wash, furnished from the catalog, built per type and cloned onto each lot as the
  camera comes (`targets/city/90u-qc-lot-interiors.js`). Every storey (the owner, 2026-11-16: "Yes, upper storeys"): up to four
  storeys a building, a stair (a ladder in the smallest houses) between each pair, each upper floor a plank slab with its stair's well
  over a lacquered ceiling; all 31 types in ~4.5 s, 446 furniture meshes, all textured.
- **The clergy ring in eight sectors** (the owner, 2026-11-15: "clearly defined areas of each color, and red is not
  over-represented"): its colleges and granaries take the colour of the monastery whose spoke their block stands on.
- **Q7e-Q7g** not started.

## 1. What the city build is

**A settlement build, `settlements/qiblai`,** with its own `build.py` on Verge's pattern (`settlements/verge/build.py`):
the page seals what it draws through into closures instead of building inside another settlement's page.

- **QBK**, the kits sealed for a world page: `kits/qiblai/kit_bundle.py`, a new file on the Xanadu kit's
  (`kits/xanadu/kit_bundle.py`, `XAK`): the Ancients core, the Vernacular helpers, the Xanadu vocabulary and builders, and
  the Qiblai kit's `src/` (the generated Xanadui script with it), in one closure. `QBK.proto(key, v)`, `QBK.dims()`,
  `QBK.bind(KMAT)` as XAK's, so a mixed street's `xa_*` and `qb_*` keys come from one bundle.
- **KCITY**, core/city sealed as Verge seals it (`CITY_JS`), with `35-city-squares.js` added to the list.
- **The core modules** a settlement takes (README.md, "Core modules are not optional"; `tools/check_core_use.py`):
  core/rand and core/tags (every lot and every piece registered before it is drawn), core/host (camera, probe,
  inspector, minimap), core/terrain and core/mask (the ground and the placement raster), core/water (the river and its
  cataracts, the ghats' water, the temple estates' channels), core/atmos (the sky), core/lod, core/export (the city
  section for Godot), and the site's biome kit for the flora (the region's Af lowland biome at that cell: confirm with the
  open world's biome map before Q7b).
- **Its `PLAN.md` "Core adoption" section** is section 6 below; `check_core_use.py settlements/qiblai` passes before the
  build is called done.

## 2. The phases

Each phase ends built (`python3 tools/build.py settlements/qiblai`), checked (`verify.py --assert` on the GPU, through the
harness lanes; `check_core_use`, `test_all.py --no-build`), seen (one screenshot per meaningful change, at eye level) and
committed.

### Q7a. The kit's city pieces (in `kits/qiblai`)

What the site asks of the kit that the sheet did not:

| Piece | Why | Done when |
|---|---|---|
| **The Temple Mountain compound** `qb_temple_mountain` | ring 0 is one landmark lot, ~312 m square (3 x 3 blocks less the streets): the great temple at the centre, its four flights on the four avenues; the Hall of the Decree, the treasury and the great wheel house round it; the court paved, the kora's inner path, chortens | one def placing the four by `xnSub`, its lot exactly the site's `landmark` record |
| **The axial monastery** | an axial spoke block is halved by its 24 m avenue into two ~36 m strips; the 52 m monastery does not fit one. Proposed: the avenue runs through the monastery as its processional way, the gate tower spanning it, the cell ranges on both halves, the assembly hall on the far side of the court beyond the avenue's end (`qb_monastery` `o.split`) | the four axial spokes (n, e, s, w) drawn split, the four diagonal ones whole; each on its own block |
| **The gate market's half** | the gate markets stand either side of the avenue on ring 2's axial blocks (~36 m strips) | a 34 m-wide dress of `qb_gate_market` (`o.half`), mirrored across the avenue |
| **Walls by length** | the site's wall runs are of any length between towers | `qb_wall` takes `o.len` and tiles its parapet and loops to it; the corner and curtain towers as now |
| **The terrace edge** | each ring stands on a platform 2-6 m above the one outside it, built up | `qb_terrace_edge` (`o.len`, `o.h`): an ashlar retaining face with the twig band, and `qb_terrace_stair` where an avenue or a ring street crosses a step |
| **The kora's arcades by length** | the kora is a ring street; its arcades run between crossings | `qb_kora_arcade` `o.len`; a chorten at every crossing (the site's `crossings` records) |
| **QBK** | the bundle above | `node`-free check: the bundle parses, `QBK.dims()` lists every `qb_*` and `xa_*` def |

**Proof.** The kit sheet gains a row for each new piece; `verify.py --assert` passes (the overlap audit, the interiors,
the textures).

### Q7b. The page and the ground

- `settlements/qiblai/build.py`, `src/` (the page shell on core/host), `verify.py` on the shared harness.
- **The ground:** the open world's heightfield and the river's line at the site, cut by the open-world tools
  (`cut_site.py`; the open-world session owns them) into a ground record the page reads. Then `KCITY.squares.ground(S, h)`
  terraces it, **fill only** (`KCITY.squares.fill`): the rings' platforms on made ground.
- **The river:** Nahr ash-Shalālāt's stretch with its cataracts as core/water flow (the falls as steps in the bed), ~1 km
  east of the east gate.
- **Proof:** the page loads clean; the terraces read at eye level from the outer wall; `KCITY.squares`' own checks hold
  on this ground (built up, never cut; every block on its ring's level).

### Q7c. The site laid

- `KCITY.squares.plan({id:'qiblai', h})` with Qiblai's numbers (the defaults are Qiblai's), then `KCITY.create` with
  `KCITY.squares.steps(S)`: the rings, the avenues, the ring streets and the kora, the cross streets, the walls with
  their gates and towers, the terraces, the landmark lot.
- **Drawn** from the records: streets as core/city's ribbons; the walls from `S.walls` (`qb_wall` runs by length,
  `qb_wall_corner`, `qb_wall_gate`: `o.v 0` on the outer wall, `1` on the inner rings); the terrace edges and stairs; a
  chorten on every kora crossing.
- **The Temple Mountain** on the landmark lot: `qb_temple_mountain`.
- **Proof** (verify invariants): no street through a wall except the four avenues at their gates; every wall run closed
  between its towers; the great temple's flights on the avenues' axes.

### Q7d. The rings filled

Each block's `use` decides what fills it; the lay blocks are filled by `frontage-courts` (`KCITY.squares.infill`).

| Ring | Fill | Keys |
|---|---|---|
| **1, the clergy** | the eight great monasteries on their spoke blocks, **each on its spoke's bearing** (the site's `monasteries` records: spoke 0-7 clockwise from north, `colour = spoke`, the kit's `QSPOKE` order); the other blocks: the grammarians' colleges, the temple granaries, gardens (the Prismarchy works from the Hall of the Decree: the owner, 2026-11-11) | `qb_monastery` (`o.v = spoke`, split on the axial four), `qb_college`, `qb_granary` |
| **2, the kora** | the kora's arcades along the ring street with a chorten at every crossing; wheel houses at its corners and gates; the four gate markets on the axial blocks; the pilgrims' hostels; the guild halls; shops on the kora's outer face | `qb_kora_arcade`, `qb_kora_corner`, `qb_wheel_house`, `qb_chorten`, `qb_gate_market` (`o.half`), `qb_hostel`, `qb_guild_*`, `qb_shop_row` |
| **3-5, the lay folk** | row houses on party walls in runs (`o.ends`), the corner houses at block corners, courtyard houses for the rich; the trades and the baths by the census; wayside shrines at street corners; **a third of the houses Xanadu's** (the Sultanate's merchants and officials; the owner, 2026-11-11: 33 %, spread through the lay rings) | `qb_row_*`, `qb_corner_house`, `qb_court_house`, the trades, `qb_bath`, `qb_shrine`, `xa_*` |
| **Outside the wall** | the ghats at the cataracts; the ghat way from the east gate, a pilgrims' road lined with chortens and wayside shrines (the owner, 2026-11-11); the caravanserai on the Erewhon road; the temple estates' gardens | `qb_ghats`, `qb_caravanserai` |

- **Wealth** by ring: rich nearest the kora, poor at the outer wall (the city rises toward the Temple Mountain).
- **The trades** by the census: `tools/trades_census.json` scaled to ~12,000, each trade to a Qiblai key or a Xanadu key
  (a `QB_TRADES` table on `XA_TRADES`'s pattern, checked by `tools/check_trades.py`).
- **Density** to the people, not to the blocks: `KCITY.squares`' test fills every lay block (~5,000 houses); Qiblai's
  ~6,000 lay folk want ~1,200-1,500 houses. The rest of the lay blocks is gardens, the temple estates' yards, open courts
  and the dyers' and tanners' works at the wall (`frontage-courts`' `gaps`, `pools`).
- **Proof** (verify invariants): no two lots overlap (core/city's index), none on a street, wall or tower, each at its
  ring's level and none fronting its wall; **each monastery's bearing from the great temple within 10° of its spoke's**
  (so each banner of the Rainbow Temple faces its own); the people per ring within 15 % of `kits/qiblai/PLAN.md` section
  3's table; every census trade carried or marked `na` with a reason.

### Q7e. Life and light

- The city's people from core/charactermodels' peoples (the Xanadui), the pilgrims walking the kora three times with
  eyes lowered, the monks, the market. Electric light only on rich and civic (the contract).
- The great wheels turn (the drums' Song turns with them); the Rainbow Temple's banners move in the wind.
- **Proof:** the eye-level views below; the frame rate on the arc lane at the opening view.

### Q7f. The open world

- **The site in the open world** (`openworld/xanadu-oidong-highrift`): Qiblai's entry in `SITES.json`, cut and baked
  (KSITES) by the open-world tools, the city's records placed by the same plan (one source: the settlement page and the
  region read the same `KCITY.squares` plan and the same seed).
- **The ring of villages re-planned** as the temple estates on core/hamlet (~30,000 people in 100+ villages *est.*,
  `kits/qiblai/PLAN.md` section 8): farms, hives and dairies (the sacraments are honey and milk), the salt coming in.
- The open world is the open-world session's; this phase hands it the plan's records and the bundle.

### Q7g. Godot, the gallery

- core/export's city section (`KCITY.registerExport`) and the kit's protos for the Godot import.
- The gallery: the city page joins it when the build reaches main (the gallery rule: a brand new settlement).

## 3. The views (`verify.py --views`, one screenshot each, at eye level unless named)

1. **From the south gate up the avenue** to the Rainbow Temple: the rings stepping up, the gate towers in line.
2. **The kora** at a crossing: the arcades, the chorten, pilgrims.
3. **A lay street** in ring 4: row houses on party walls, a Xanadu house among them.
4. **A monastery's court** (one per colour across the runs; the opening view rotates them).
5. **The ghats** at the cataracts, from the water.
6. **Overview** from above the south-east: the nested squares of colour (white lay rings, the kora's saffron and white, the
   eight monasteries' colours, the gold of the Temple Mountain).

## 4. The budgets

- **The page cap** (`tools/build.py`): the city is ~1,500-2,500 buildings. Every piece is built once per key, variant and
  seed slot and instanced (core/city's host draws lots this way; core/lod's levels for the far rings).
- **Triangles** at the opening view under the showcase's cap on the arc lane; the interiors only on demand (a monastery's
  hall, the Hall of the Decree, a hostel), not city-wide.

## 5. The owner's answers (2026-11-11)

1. **The branches:** the kit (`claude/zealous-allen-0cd44d`) and the site module (`claude/nostalgic-cray-50aac5`) merge to
   main first; Q7 builds on main.
2. **The axial monasteries** are split by their avenue (Q7a's `o.split`): the avenue is the monastery's processional way.
3. **The Xanadu share** of the lay quarters is **33 %**, spread through them (no merchants' quarter).
4. **The Prismarchy works from the Hall of the Decree** (ring 0): no office building of its own in ring 1.
5. **The ghat way** is a pilgrims' road from the east gate to the ghats, lined with chortens and wayside shrines.
6. **The terrace steps:** the site module's default (6, 4, 2, 2, 2, 2 m from the centre out), to be judged built ("only one
   way to see if it works").

## 6. Core adoption

| Module | Taken for | How |
|---|---|---|
| core/rand | every stream (core/city's `rand: 'krand'`; the kit's builders reseed per def) | read in place |
| core/tags | every lot and piece registered before it is drawn; culture `qiblai` (vocabulary: `TODO.md`) | read in place |
| core/city | the site (`35-city-squares.js`), the instance, the infill, the export | sealed as Verge seals it |
| core/space | core/city's index | with core/city |
| core/host | camera, probe, inspector, minimap, walk | read in place |
| core/terrain, core/mask | the ground and the terraces (fill only); placement on the mask, never `getImageData` | read in place |
| core/water | the river, its cataracts, the ghats' water | read in place |
| core/atmos | the sky, the skylight | read in place |
| core/lod | the far rings | read in place |
| core/export | the city section for Godot | read in place |
| the biome kit | the region's flora at the site | read in place (which kit: confirm at Q7b) |
