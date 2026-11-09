# crater-drylands: more stations (plan, 2026-10-26)

The kit draws the kiln and bloom country: the hot steppe (BSh) of the crater floor in the volcano's rain shadow, with its
burn mosaic. The owner split the model's region into **crater drylands N** (`rmuqlfgh1u6d8`) and **S** (`rmuqlgonah5tp`)
to tell them apart. Each holds ground the kit does not draw. The page as built stays station 1. Stations follow the
Throne's and Korona's pattern (`stations/<name>/`, `python3 build.py --station <name>`).

**Status: built (2026-11-09): stations 2 (`south`, S's page), 3 (`edge`) and 4 (`salt`); the split into N and S settled by the owner
(2026-10-27) and made (`crater-drylands-n.html`, `crater-drylands-s.html`).** Was: plan; Station `south` is already planned in `biomes/hyperjungle/PLAN-LANDS.md` section
5.3 (the swap); this plan adds the ground under it and two stations in N.

## The formal split: two lands, N and S (the owner, 2026-10-27)

"We can formally split crater drylands into N and S for this rebuild." The kit stays **one folder and one engine**: one species
registry and one `build.py`, as the working rules ask, rather than a copied kit. Inside it the two polygons are **two lands**, each
with its own pages, stations, fields, exchanges and checks.

| | **Crater drylands N** (`rmuqlfgh1u6d8`) | **Crater drylands S** (`rmuqlgonah5tp`) |
|---|---|---|
| Ground | 54,672 km², the floor at -605 m median, 1.72 atm, +29 °C, BSh with an Aw belt and a salt floor | 8,408 km², a 2 km climb from -650 to 1,400 m, +22 °C median, BSh to a cool kiln, Af galleries |
| Pages | `dist/crater-drylands-n.html` (the page as built, renamed: station 1), `--station edge`, `--station salt` | `dist/crater-drylands-s.html` (`--station south`: the climb and PLAN-LANDS 5.3's swap) |
| Its own | the burn mosaic as built; the Aw savannah edge toward SW Bay; the salt floor by the Steampits | the cooler kiln's scrub (lower, greyer); the black mallee on old flows; Godstep's reach; the se rim's reach |
| Borders (within 15 km) | the Cut, hyperjungle, k-guilin, nhighlands, nwbay, swbay, the SW highlands, Korona | shighlands, swbay, the se savannah rim, the hyperjungle (7 km); Godstep at 21 km |
| Species | the kit's species as they are | the same keys where the plant is the same; S's own forms as cousins (`BIO.kin('crater-drylands.<key>', {...})`), named in S's species list |

Readers name the land: a page that reads the kit in place passes the land (`land: 'n'` or `'s'`) so it gets that land's
fields and forms. `EXCHANGES.md` assigns each pair to the land on the border. `crater-drylands-s` takes the scale model's S polygon
for its field and hazards, not the N page's ideal map.

The old page name, `dist/crater-drylands.html`, is kept as a copy of N until its readers (the gallery, any open-world page) point at
`-n`; then it retires.

## The ground (scale model 4.23, surveyed 2026-10-26: `tools/scale-model/survey_biomes.py`)

**N:** 54,672 km² (51,928 land). Heights p5 / median / p95: -1,170 / -605 / +94 m.

| Climate | km² | Height | Pressure | Rain | Mean (warm/cold) | Centre px | Drawn today? |
|---|---|---|---|---|---|---|---|
| BSh | 35.7k | ~-580 m | 1.72 | ~490 mm | +29 (36/21) | (491,377) | yes |
| **Aw** | **9.1k** | **~-750 m** | **1.76** | **~770 mm** | **+29 (37/21)** | **(437,457)** | **no** |
| BWh | 2.2k | ~-30 m | 1.61 | ~235 mm | +27 (36/17) | (592,302) | in part |
| Csa | 1.9k | ~-30 m | 1.61 | ~675 mm | +25 (35/16) | (361,524) | no (SW Bay's edge) |
| **XS** | **1.8k** | **~-1,290 m** | **1.88** | **~580 mm** | **+32 (37/27)** | **(483,366)** | **no** |
| **XV** | **0.8k** | **~-1,250 m** | **1.87** | **~880 mm** | **+32 (37/27)** | **(487,387)** | **no** |

**S:** 8,408 km² (7,412 land). Heights p5 / median / p95: -672 / +124 / +1,403 m: a climb of about 2 km.

| Climate | km² | Height | Pressure | Rain | Mean (warm/cold) | Centre px |
|---|---|---|---|---|---|---|
| BSh | 5.1k | ~290 m (-310 .. 1,110) | 1.54 | ~425 mm | +21 (28/15) | (572,667) |
| Aw | 1.2k | ~-180 m | 1.64 | ~770 mm | +24 (31/17) | (583,675) |
| XS | 0.5k | ~-650 m | 1.73 | ~530 mm | +27 (31/22) | (567,644) |
| Af | 0.2k | ~-440 m | 1.69 | ~2,300 mm | +27 (32/21) | (555,618) |
| XV | 0.1k | ~-670 m | 1.74 | ~860 mm | +26 (31/22) | (575,656) |

S by height: below 0 m, 3,120 km² (BSh 46%, Aw 25%, XS 16%); 0-1,000 m, 3,364 km² (BSh ~88%); 1,000-2,000 m, 868 km²
(BSh, then BSk, Csa and Csb at the top, +14 to +16 °C, ~330-360 mm). S is cooler than N by about 7 °C at its median.

## Station 2: the south (`--station south`, planned in PLAN-LANDS 5.3)

The swap and its black mallee are PLAN-LANDS's. The ground adds: **the climb** from a salt floor (XS, at (567,644)) to a
cool kiln at 1-1.5 km (+16 °C, the kiln's scrub lower and greyer), Af gully galleries on the north-western side
((555,618), ~2,300 mm: fed from SW Bay's air), and Csa and Csb oak scrub on the topmost slopes toward the southern
highlands. N's salt-floor species (station 4) read in place for the floor.

## Station 3: the savannah edge in N (`--station edge`)

**The Aw belt toward SW Bay** ((437,457), 9,140 km², ~770 mm, 1.76 atm): the kiln opens into grass. Taller grass than
the steppe, scattered umbrella trees (SW Bay's parasol savannah is the neighbour: its trees as kin, `BIO.kin`), the burn
mosaic hotter and more frequent (`KFIRE`: grass fires every year or two, against the kiln scrub's decades). The kiln's
bloom shrubs hold the rocky ground. Seasons on the clock (the dry season's straw, the wet season's flush). Termite-like
mounds (`KSTACKS` mound kind).

## Station 4: the salt floor in N (`--station salt`)

**The abyssal salt steppe and savannah by the Steampits** ((483,366) and (487,387), 2,568 km², -1,250 to -1,290 m,
1.88 atm, +32 °C): the drylands' lowest, densest, hottest ground. Salt steppe (XS) of succulent chenopod-like scrub on
crusted flats (`KGROUND` polygon kind; `core/water` brine and pan), with abyssal savannah (XV) islands where the ground is
fresher. The Steampits' geyser field is next door (geyser kit, read in place: a vent's run-off and sinter apron reach
in). The kiln's scrub at its largest in the dense air; dust in the dry season (`core/atmos` air load).

## Order

`south` first (PLAN-LANDS's order), then `edge`, then `salt`.

## Core adoption (pair 12, the final rebuild; 2026-11-09)

Station 1 (`dist/crater-drylands.html`) on the universal set (`BACKPORT.md` section 1) and what this turn takes of the kit's row (section 2).
Every look change has a switch, for the owner's look pass.

| Module | Taken | Where | Switch |
|---|---|---|---|
| core/biome 31b, 31j, 32, 34, 41, 44 | the leafset (`BIO.leafOn`/`leafQ`, which `BIO.cards` calls: `check_assembly`'s MISSING), `BIO.flareJoin` on the six limb tubes, the variant pools and kin, **octahedral impostors** for the far living trees (8 species over 7 m), the field contract (`BIO.env`), the stage as data | `build.py`, `55`, `88` | `?diet=0` (blobs) |
| KGROUND | the five library layers (red soil, char, wash sand, granite grit, seep soil), hex-tiled, distance-scaled, height-blended at the old weights and strengths; the char's ash drifts and greying kept | `84` | `?kground=0` |
| KFAR, KHORIZON | the crater floor to 12 km past the map; the horizon on the ground and on the flora | `87`, `88` | `?far=0`, `?hz=0` |
| KSHADOW | **off by default** (the owner, 2026-11-03) | `88` | `?shadow=1` |
| core/atmos | height fog, the rain cover, lightning; the wind's dust off the burnt plain and the washes; the air's load (KHAZ's dust and sight; a dust storm on the panel) | `89a` | `?hfog=0`, `?dust=0`, `?storm=1` |
| core/water ext | 56 (breakup), 57 (the audit) | `build.py` | |
| core/host | `khost.FULL` (the whole interface), `--station`, LF writes, the shared pack generator | `build.py` | |

**Not taken, and why:**
- **The N/S split and station `south`.** The split is settled, but S's page is station `south`, which is
  `biomes/hyperjungle/PLAN-LANDS.md`'s step J7: it takes the se rim's species (rust miombo, rain rose, incense) from `biomes/savannarim`,
  which is not built (J4-J6), and the black mallee is still a proposal (PLAN-LANDS question 7). Renaming the page to `-n` with no `-s`
  beside it would split nothing, so the page keeps its name until `south` is built. `edge` and `salt` (N's) are built this turn, ahead of
  `south` (below): the handoff builds each station at its kit's turn, and nothing they need waits on another kit.
- **KFIRE** (H3: the kit's fire onto `core/biome/38-core-fire.js`): `core/biome/test-fire.js` loads this kit's `52` in place as the
  reference KFIRE is proved against, bit for bit. Moving the kit onto KFIRE needs that test changed first (core's, not this turn's).
- **The reflections switch** (58) and **the water's fields** (60): the seep is 23 m across, drawn after the build; the kit's own seep
  field already gives the flora and the ground their wet ring.
- **Wet ground (R9)**: the climate is dry, and the ground's texture units go to KGROUND and the horizon.
- **Wadi, talus, tibasalt strata** (the row's other kinds): none on N's ground as built; the strata are S's. The mounds and the pans are
  on `edge` and `salt` (below).

## Stations 3 and 4, as built (pair 12, 2026-11-09)

Both are N's, built from the kit's own `src/` with a forked stage (`stations/<name>/45-host-stage.js`) and the station's own fragments;
`src/` reads a `STATION` object through guarded knobs (the sky's site, the count of older fires, the build call, the page's title, views
and checks), so station 1 builds and runs exactly as before. `python3 build.py --station edge` and `--station salt`.

**Station 3, the savannah edge** (`dist/crater-drylands-edge.html`; the sky at px 437, 457). The plain falls gently toward SW Bay, three
lower kopjes (the waterhole kopje with the seep at its foot), the plain's wet doubled (.22), and **grass fires every year or two**: twelve
recent fires (three weeks to four years) and four older ones, so the mosaic is finer and mostly bloom and regrowth. **SW Bay's umbrella
thorn and gate baobab as kin** (`BIO.kin('swbay.thorn')`, `'swbay.baobab'`; EXCHANGES.md "swbay → crater"): grown by swbay's builders
(its fragments read in place) with the kin's record, the thorn at .8 and the baobab at .65 of the bay's size, tagged Aw and BSh, by
hashed cell on the open grass. **Termite mounds** (`KSTACKS.mounds`, the H10 mound kind): fluted clay spires on a skirt, 2.5-7 m,
by 90 m cell on the open grass, in the plain's red soil, one merged mesh. **The season** on the clock: the grass straw and thinned in the
dry, green in the wet (core/biome's season on the kit's grass, `BIO.bindSeason`; `?season=0`). **nwbay's flame-crown** planted round the
waterhole (`BIO.kin('nwbay.flamecrown')`, nwbay read in place). `?mounds=0`, `?kin=0`. Not taken: k-guilin's banyan and silvergrass
(k-guilin exports no `make`/`grow` or floor-plant function yet), the grass taller than the steppe's (the kit's floor is station 1's).

**Station 4, the salt floor** (`dist/crater-drylands-salt.html`; px 485, 376). A flat floor (8 m swells), two low kopjes, **six salt
pans** in its lows (core/water ext 54, `WATER.pan`: crust cracked in polygons, the cracks and low cells flooding with brine after rain;
the ground flattened under each), **two brine pools** (`WATER.still` with the brine look: red-brown to turquoise to a salt rim), the
washes and the seep. **Two kits share the floor** under their own placement masks: the kit's scrub on the salt steppe (XS), and the
**abyssal savannah** (`biomes/abyssal-savannah`, read in place) on the fresher **XV islands** (a few metres proud of the floor) and on
the pans' rims, where its pan zone puts its pan saltbush and blue pan-grass. Its zone bands are opened to the flat floor
(`ABSAV.setZoneBands`) and its burn mosaic is this page's fire history, so one fire map runs over both. Few fires (four recent, five
older). **The kiln's scrub at its largest** in the dense air: the kit's trees a fifth bigger (`BIO.host.treeScale`). `?absav=0`. Not taken:
the Steampits' geyser field reaching in (the geyser kit's run-off and sinter apron), nwbay's cinder pine as the row's upright, unsheared
cousin (nwbay's builder has no such option), the dry season's dust (the air's load is on, with the storm on the panel, but no season
drives it).

## Station 2, as built (2026-11-09): the south, crater drylands S

`python3 build.py --station south` -> `dist/crater-drylands-s.html` (the sky at px 572, 667). One slice of S's 2 km climb on the 5.2 km
showcase: the plain rising ~260 m to the south, toward Godstep, with **old titanium-basalt flows** coming north out of the southern edge as
four lobed tongues a few metres proud (the painted ground basalt-dark on them, the Throne's black sand as a KGROUND layer: its pack, the one
family), four kopjes, the washes and the seep; the northern and eastern edges wetter (the se rim's air), the kiln's scrub lower in the cooler
air (`BIO.host.treeScale` .85), the fire mosaic over the whole patch (six recent fires, seven older), the season and the copper flush on the
clock. **The swap** (PLAN-LANDS.md 5.3), by hashed cell:
- **the base**: this kit everywhere but the old flows (its mask);
- **the black mallee** (`blackmallee`; the owner's yes): a kin of the prism mallee (`BIO.kin('craterdry.prismmallee')`), grown by its builder
  with violet-black to bronze iridescence and smoky bark, on the old flows only; it burns and resprouts as the mallee does, on black ground;
- **the se rim comes in** on the wet edges: savannarim's rust miombo and incense tree (`SAVRIM.builders`) on the open ground, its rain rose
  (its cousin of sedesert's rose) on the kopjes there. Savannarim's species, trees and se rim (`50`, `55`, `56`) are read in place, with the
  hyperjungle (its seven fragments: savannarim builds on its lands' geometry) and sedesert's species and trees (the rose's source), each in
  its own registry; the hyperjungle's helpers are the stage's globals (its `41` would clash with them).
Then (the same day): **the Af gallery** in a north-western gully (the hyperjungle's trees at .3-.5 of their size), **the lava step** along the
southern edge (Godstep's first, 30 m) with its face in KSTRATA's **tibasalt** beds (a mesh coloured from `KSTRATA.at`, no texture unit), and
**scrub oak** on the step's top (nhighlands' gnarled oak as a 3-6 m kin). `?black=0`, `?serim=0`, `?gallery=0`, `?oak=0`, `?step=0`,
`?season=0`. Not taken (KNOWN_ISSUES.md, "Owed on south"): Godstep's red guyed stalk and lava pioneers (Godstep's kit is a plan), S's fields
from the scale model's polygon.
