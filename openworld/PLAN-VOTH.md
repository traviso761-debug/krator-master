# Voth into the open world: scope

A scope for the owner (2026-11-11), not a plan in force. Voth is the city plan on core/city (`settlements/voth`, page
`dist/voth-city.html`, ~53,000 people). The owner says its lake is vital to its architecture, that it needs a river to
attach its own river to, and that the world map may need surgery to place it.

## 1. What Voth's page has (the ground the city is built on)

**The frame** is 10,800 m square (±5,400), with x east, z south (north is -z) and the origin mid-bay
(`settlements/voth/src/10-core.js:74`). The build zone is about 4.8 x 4.3 km.

**The water** is analytic, at level 0 everywhere (`10-core.js:87-117`): a smooth union of circles and capsules with
~±116 m of noise on the shore.

| Part | Size and place |
|---|---|
| Bay | the south lobe, r 980 m at (-180, 900); an east side and a west arm |
| Narrows | (-90, 240) to (150, -640), r 560 m |
| Lake | the main body r 1,880 m at (260, -2,900), with south, west and east reaches; deepest point -52.7 m |
| Strait | leaves the frame north-north-east at (1,020, -6,000) |
| Total | about 22 km² of water (bay 4.7, lake 17.7); seven islets; a shelf 1.2-5 m deep for the first 70 m off every shore (the chinampas need it); the shore runs 20.4 km |

**The river** (`10-core.js:119-150`) comes in from the east-south-east, ~18° north of west. It runs 5.3 km to its mouth
at (880, 1,160) in the bay's south-east corner. It is 80-170 m wide, at the lake's level the whole way, on a flat
floodplain 260-1,160 m wide. On it stand:
- two bridges, with decks 11.5 m up for the barges;
- the north-bank docks and the river port;
- the River Gate;
- warehouses on both banks;
- the owner's banked avenue.

**What depends on the water:**
- **The cantons stand in it.** Palace and Temple are in the bay and Fortress in the narrows. Eight rim cantons are placed
  by arc length along the shore trace.
- **The mainland city** lies on the east shore: the harbour, the piers, three gates, and the wall from the lake shore to
  the river.
- The monastery is on the west shore and the lighthouse at (468, -1,010).
- **The land:** a 2 m shelf at the shore, 22 m at 700 m inland, about 60 m by 1.7 km. Behind it, hills up to 86 m and 17
  ridges of 170-300 m.

**So the layout is keyed to this shore.** Any other shoreline moves every rim canton, pier, bridge and chinampa, and
changes core/city's placement hash (`ff007aab`).

## 2. What the scale model has there

**The pin** is Voth, `s3n66733vo`, at **px 742,1018** (`model/src/60-settlements.js:182`). It is **in open water** in the
**Bay of Voth**, an arm of the Ring Sea carved by `features.py`:

| | The model | The page |
|---|---|---|
| Water level | -1,500 m (the Ring Sea) | 0 (sea level: the page's strait runs out to the open water) |
| Water extent | ~298 cells, ~1,190 km², about 40 x 30 km | about 6 x 9 km (3 x 4.5 px) |
| Shape | south basin, a neck ~16 km wide, open north to the Ring Sea; a peninsula east; a 2 px slot south | bay, narrows, lake, strait north: the same kind |
| Depth | ~60 m (bed median -1,539 m) | up to 53 m; a 70 m shelf at every shore |
| Shores | **cliffs**: +367 m at the median, +716 m at p90, within one cell | a 2 m shelf rising gently |
| River | **none enters the bay** | an 80-170 m river into the south-east corner |
| Climate | Aw, Af, Am (east shore ~1,500 mm, 29 °C); ~1.6 atm | the swbay kit's gardens |

**Rivers near the pin** (`model/data/rivers.json`):
- **The Turm (r029)**, 131.9 m³/s, flows west-north-west at about the page river's bearing. It ends 52-92 km off, in the
  eastern inlet past the peninsula, as do the Vindos (r023), the brayt (r131: Daridel), the Tors (r072: Torus) and the
  Silvr (r263).
- The Flint (r115) passes the bay's west side going north.

No open-world region holds the pin yet (`openworld/SITES.json`).

**The verdict:** the model's bay has the page's topology but is about 12 times the area, walled by cliffs where the page
has a shelf, and has no river. The 2 km cells can carry neither the page's shelf nor its river. Taking the world's
ground as it is would wreck the layout, so **the world must take Voth's ground**, after surgery that makes the map
agree with it.

## 3. The proposal: two layers

### Layer 1: map surgery on the scale model (edit_513, the edit_512 pattern)

An in-place edit in a box of about px 725-800 x 995-1040, with:
- a dry run and a report;
- a refusal to run twice;
- every raster unchanged outside the box;
- no new pits and pins kept;
- climate re-lapsed, paint relit, `basins` and `outlets` records, a test section;
- the settlement record moved separately (`SETT_MOVED`) if the pin moves.

What it makes:
1. **The bay at the page's scale** (question 1). The page's water footprint is laid on the model with the pin as the
   frame's origin and the page's north as north: the bay, the narrows and the lake, with the strait running
   north-north-east to open water. The rest of today's bay becomes land.
2. **A lowland shelf where the city stands.** On the east shore (the harbour, the wall from lake to river) and the west
   shore (the monastery), the model's cliffs come down to a shore a few metres over the water, rising ~60 m by 2 km. The
   cliffs and ridges stay beyond, as the page's backdrop.
3. **The river** (question 2). Its valley runs from the east-south-east into the bay's south-east corner at the page's
   mouth. The best candidate is **re-routing the Turm (r029)** through a gap in the peninsula, since it already flows
   the right way. The river stays at sea level for the page's last 5 km (no fall).
4. **Landform and water records** for what is below a cell: the narrows and the strait if they are under 2 km, the seven
   islets, and the shelf. These are `DATA.landforms` as edit_512 wrote them, plus a water kind.

### Layer 2: Voth's ground handed to the world (core/world towns)

core/world already has the path. `buildTowns` reads `WORLD_DATA.towns`:
- a frame (x, z, turn);
- a footprint R and a blend band;
- a grid of heights;
- `onWater` (the town's 0 set on the world's water level).

Inside R the land is the town's; beyond it, it eases back to the world (`41-world-fields.js:277-316`). **No region bakes
a towns.json yet**, so this is its first use. Voth's page itself is not touched: the bake reads its `terrainH` plus the
site editor's deltas, as a script, and the layout stays byte-identical. What is new:

| Piece | Where | Size |
|---|---|---|
| A **towns bake** from a settlement page: the page's `terrainH` + `TERR` deltas over ±5.4 km at 10 m (an Int16 grid, ~2.3 MB), its 0 at -1,500 m, R ~4.8 km, a band of ~1-2 km to the surgery's shelf | `core/world/bake_towns.py` (on the `bake_sites.py` pattern) | medium |
| **Water inside a town:** the page's water polygon (the bay, narrows, lake, strait, the islets cut out) as the town's water mask, so the world draws Voth's shoreline at 1:1. Today the world's water comes only from the model's wet cells (`lakeWater`) | core/world 41 and 83w | medium |
| **The river inside a town:** the page's `RIVER` polyline in world coordinates as a named river, so `riverWater` serves it, joined to the re-routed Turm upstream beyond the frame | core/world 41 | small-medium |
| **Stamping landforms** (also owed for Erewhon's islands and Pinnacle's mesa) | core/world | small-medium |
| **A region** `openworld/voth`: a cut of 30 km round the pin, perhaps with Torus (774,1007) as a second site; the kits swbay (Voth's gardens' species), the hyperjungle or savanna kits for the Af/Am/Aw land, shighlands for the scarp | `openworld/voth` | medium |
| **Checks:** the world's shoreline within a few metres of the page's shore trace; the river continuous from the Turm to the mouth; one water body; no flora in the footprint; the same view on the page and in the world, side by side | the region's `verify.py` | small |

**Later, not in this scope:** drawing the city itself in the world (core/city's records, LOD, the sim), and core/city
taking its ground from the world (the isle-demo route, `openworld/PLAN-SITES.md` §6 step 3).

## 4. Order

| Step | What | Waits on |
|---|---|---|
| V0 | The owner's answers (section 6) | — |
| V1 | edit_513: the bay, the shelf, the river, the records; the model page rebuilt; tests | V0 |
| V2 | core/world: the towns bake, water and river inside a town, the landform stamp (a region fragment first if 41's reach, 8 builds, should wait for the all-builds rebuild) | V0 |
| V3 | `openworld/voth`: cut, kits, sites, the resources census | V1 |
| V4 | Voth's ground in the region; the checks; GPU verify; the side-by-side view | V2, V3 |

V1 and V2 can run in parallel.

**V2 built (2026-11-11, branch `claude/voth-v2-towns`):**
- `core/world/bake_towns.py voth` writes `openworld/towns/voth`: Voth's ground at 10 m with the site's edits, its water mask, river and shore
  trace. The page's code is run read only.
- `core/world/41t-world-town-water.js` takes the town's water, river and body into the world. It wraps 41's calls rather than changing 41,
  so 41's eight builds are untouched; folding it into 41 is parked in `TODO.md`.
- `core/world/41l-world-landforms.js` stamps the landform records; `extract_region.py` carries them into region.json.
- Tests: `node core/world/test-town-water.js` (a made-up region); `python3 core/world/town_view.py voth` (a scratch region round the pin).
  On the scratch region the world's shoreline lies within 6.1 m of the page's trace (2.2 m on average) at 695 trace points, the river
  is wet at all 82 stations, and the town's water is one body with the model's. The footprint is R 5.3 km, not the ~4.8 km first
  scoped: the lake's north shore reaches 4.9 km from the pin, and a 4.8 km footprint left the page's shallows in the band.
- **On V1's map** (edit_513, cebf8c100, cut from its checkout without merging: `town_view.py voth --reach-km 30 --model <its model/data>`):
  - the town joins the Turm by its id (r029, 'Turm Rivrh'): the model's Turm is cut 6.6 km east of the town and led in, one river of
    1,238 points with no gap, never climbing, never under its ground;
  - 41l stamps edit_513's records: the seven islets (each within 1 m of its crest), and the strait outside the town (116 stations under
    the water, the coarse cells closed to its 680 m at all 192 bank points); the page water, the narrows, the shelf and the river lie
    inside the town, which draws them from Voth's own ground;
  - the town's water is the Ring Sea's body, joined through the strait.
- **Towns without a tile** (2026-11-12): `98-world-start.js` checks and drops only towns with a tile, and `88-world-towns.js` draws
  only those, so a town whose ground the world draws itself (`drawn: false`) is kept on every page. The four open-world builds were
  rebuilt for it (no region had a town without a tile, so they behave as before).
- **What V3/V4 still need:**
  - the 'SW Bay' overlay has no ground palette or style in 41, so the world's ground there is the desert's terracotta;
  - inside the band the land eases from the town's ground to the model's; where the model is coarse, the side-by-side shows the seam.

## 5. Risks

- **Voth's page belongs to the city-layout work** (core/city and Voth's fragments 15 and 30-35; CLAUDE.md). This scope
  only reads them: the towns bake runs the page's `terrainH` in node and changes no Voth file.
- **The model's coarse bay and the page's shore will disagree at 2 km.** The blend band and the water mask carry the
  difference; the side-by-side check shows it.
- **Voth's own ground is at sea level 0 and the page's air is 1.6 atm.** The world puts its 0 at -1,500 m. The sky and
  the pressure already agree (the world reads the model's pressure).
- **The live map database is still on the old canvas** (`tools/scale-model/README.md:594-597`).
- **Other edits in the same box:** none known. Torus and Daridel are on rivers that a Turm re-route would not cross.

## 6. The owner's answers (2026-11-11)

1. **The bay is shrunk to the page's water system** (bay, narrows, lake, strait to the Ring Sea). Most of today's
   ~1,190 km² becomes land.
2. **The Turm is re-routed** into the bay's south-east corner through a gap in the peninsula, to carry Voth's river.
3. **The whole bay's rim is softened** to low shores and hills, not only the city's shelves. Layer 1, item 2 becomes:
   the whole rim comes down, and the page's ridges (170-300 m) and the scarp beyond the frame stay as the backdrop.

Still assumed (question 4): Voth's own ground is handed to the world (Layer 2), and Voth is not rebuilt on the world's
ground.

The questions as asked:

1. **The bay:** shrink it to the page's water system (bay, narrows, lake, strait to the Ring Sea), so most of today's
   ~1,190 km² becomes land? Or keep the big bay and set Voth in its south corner, the page's "lake" being the bay itself?
2. **The river:** re-route the **Turm** (131.9 m³/s, already flowing west-north-west) into the bay's south-east corner,
   or make a new river?
3. **The cliffs:** keep the model's 350-700 m cliffs beyond the city as its backdrop, lowering only the city's shelves?
   Or soften the whole bay's rim?
4. **The 1:1 ground:** hand Voth's own ground to the world (this scope), or plan now for Voth to be rebuilt on the world's
   ground later?
