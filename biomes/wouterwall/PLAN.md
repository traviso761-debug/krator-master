# wouterwall: the plan (draft 2026-10-26; build plan 2026-11-09)

The **western Outer Wall** (`rmvk92x5vcz46`, "w outer wall"): the high bench on the Outer Wall's inner flank, a crescent
about 1,250 km long from below Farside round to Dalab, under the airless crest. Cold, and dry in summer on its lower half.
Its theme is **a wall coming apart**:
- the crater's rim slumping inward in county-sized terraces;
- rock avalanches running out from the crest;
- the dust the wall sheds, blown down onto the bench as loess deep enough to farm and to live in.

Owner's brief (2026-10-26): the landforms of the proposal, agreed "on all counts": the loess tablelands, the slump
terraces, the long-runout rock avalanches (sturzstroms) and the edge. The references are in `refs/`.

**Status: plan, awaiting the owner.** Nothing built. The owner put station 1 next after the SW highlands' turn
(`HANDOFF-REBUILD.md`, 2026-10-27), but kits come after the rebuild's frozen integration pass. The 2026-11-09 pass
re-read every number from map 5.1, which now carves this plan's landforms, and wrote the hazards and the core table.

| | |
|---|---|
| Folder | `biomes/wouterwall/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `refs/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`) |
| Pages | `dist/wouterwall.html` (station 1), `-slumps`, `-sturzstrom`, `-edge` (section 7) |
| Object | `WOW` (`build`, `dress`, `SPECIES`, `PLANTS`), on the `BIOME-API.md` contract |
| Read in place | `biomes/nwouterwall` (the larch, the feather-grass steppe, the tundra and the fellfield: the same wall further north); `biomes/nwlowlands` and `biomes/swlowlands` (a few species each: section 4); `biomes/godthrone` above the airless line; nothing copied |
| Its own flora | two native species (section 4); the rest read in place |
| Out of scope | the Hayrant's villages and cave houses, Mirabilis and Shelf (settlement plans; the kit leaves the loess cut for them); the Rift line's portals (`openworld/ANCIENT-ROADS.md`, `kits/ancients`); the lowland at the foot (an ecotone with the lowland kits and Ancient's Valley) |

It is a new biome, so it goes in the gallery when it first reaches `main`.

## 1. What the map carves (map 5.1)

Read from the model on 2026-11-09 (`smodel.page` at `gemini/scale-model-5.1-r3`). The region store holds the polygon in
**5.1 px** already: the draft's 4.22 bounds (px 8-308 by 278-880) plus (272, 330) give the store's. No shift is needed. The
carving is `smodel/tier1_biomes.py` section 3 (`_sculpt_w_outer_wall`), written in old px; its points below are shifted.

- **Size:** 28,726 cells of 2 km, **114,904 km²**, px x 281-578, y 608-1209 (the draft had 117,148 km²).
- **Heights:** p5/p25/p50/p75/p95 = 3,371 / 4,067 / **4,583** / 5,066 / 5,890 m; 1,750 to 7,537 m. Median slope 2.3°, p90 5.4°.
- **The shape.** The bench rises from about 3.1-3.7 km at its lowland edge to 6-7.4 km at the polygon's west edge. Past it
  the **airless rim** (class O) stands at 8.4-9.8 km (at y=872: 7,075 m at x 288, 7,940 m at x 280, 9,348 m at x 256).
  At the lowland edge the bench ends in a **2-2.2 km escarpment**: at y=872, 3,477 m at x 360 to 1,314 m at x 368
  (16 km).
- **What Gemini carved** (`tier1_biomes.py` section 3, following this plan's section 5):
  - **Three slump benches**, back-tilted toward the wall in 50-90 km segments: the outer at ~3,850-4,350 m, the middle at
    ~4,400-4,950 m, the upper at ~5,000-5,550 m. Their front risers are 260, 310 and 340 m, their sag troughs 175-230 m
    deep, with an 85 m double crest (*sackung*) on each front.
  - **Eight sag-pond trench lakes** along the head-scarp troughs, all class WH:

    | 5.1 px | Level | km² |
    |---|---|---|
    | 328,685 | 4,947 m | 68 |
    | 320,752 | 4,709 m | 52 |
    | **318,818** | **4,430 m** | 84 |
    | 326,888 | 4,734 m | 92 |
    | 332,958 | 4,571 m | 68 |
    | 350,1025 | 4,343 m | 76 |
    | 380,1086 | 4,451 m | 68 |
    | 418,1134 | 4,895 m | 52 |

  - **Five sturzstrom lobes**, running out 36-42 km east from a headwall scar, 28-33 km wide, 240-285 m thick, grooved and
    hummocky, with a distal rim. The scars are at px 318,666 (6,411 m; the lobe's toe 5,711 m), 306,778 (4,994 m), **310,872**
    (4,906 m: "station 3, fresh and old"), 324,984 (5,195 m) and 364,1078 (5,069 m). The code makes no lobe-dammed lakes; those
    are the kit's (`KRELIEF.runout`'s `lake`).
  - **The loess** below u_wall 0.34 (above ~2,850-3,250 m): *yuan* tables ±75-85 m, and **box canyons 185 m deep** along every
    wadi and stream that crosses the edge.
  So the draft's open question, "the slump benches on the model or in the kit", is answered: they are on the model. The kit
  adds the 1:1 detail on the model's benches.
- **Water.** 33 river and wadi records cross the bench. The draft's names (Okbruk, Sneikbruk, Painguli...) were replaced on 5.1.
  The largest:

  | River | Id, tongue | m³/s | Over the bench | To |
  |---|---|---|---|---|
  | **Waywater Ironblack** | r274, Yusar | 86.4 | px 340,1015 (4,293 m) to 368,1008 (2,580 m) | the Dariba at px 412,1009 (Ancient's Valley) |
  | West Sun Bruk | r391, Dalab | 41.8 | 362,1031 to 368,1031 | the Ironblack at 408,1009 |
  | Waywater Stonered | r152, Yusar | 30.6 | 352,987 to 358,983 | a lake at 17 m (px 404,953) |
  | Tōng-Mā | r164, Eternian | 28.7 | 336,863 to 348,853 | a lake at 46 m (px 380,823) |
  | Fols Riba | r183, Dalab | 25.0 | 400,1105 to 414,1085 | a lake at -9 m (px 444,1057) |
  | Yūt-Mā | r227, Eternian | 18.8 | 332,715 (4,006 m) to 360,729 (1,963 m), past Mirabilis | a lake at 46 m (px 386,743) |

  The rest are wadis of 7-10 m³/s: Cutdry Windlow, Sēk-Kū, Fūng-Kū, Geit Guli, Payar Kuri and others (`river-names-5.1.md`).
  The names follow the polities below: Eternian in the north, the Yusar's in Ancient's Valley, Dalab's in the south.
- **Regions over it:**
  - the **Eternal State** (`rmvg89rejmqat`), 49,608 km²: the north half;
  - the **Realm of Dalab** (`rmw5ruqmv60t3`), 27,604 km²: the south;
  - **ancient's valley** (geographic), 6,988 km², and the political Ancient's Valley, 488 km²: the middle edge;
  - the **Tungang Union** (`rmvlr7qce1rwc`), 5,804 km²: the southern end.

  The draft's "Giant Country 7,116 km²" is not on 5.1.
- **Settlements inside:**
  - **Mirabilis** (village, px 350,726): 3,125 m, Csa, 627 mm, +12 °C (23/0).
  - **Shelf** (arcology, px 461,1161): 3,760 m, Dsb, 533 mm, +3 °C (16/-10). It is in `ANCIENT-ROADS.md`'s list of
    arcologies, and lies 98 km south of Dalab (px 464,1112, 606 m, below the edge).
- **Neighbours:**
  - the NW outer wall and the Yeti Valley to the north (old px 53-225 by 75-261 = 5.1 px 325-497 by 405-591);
  - Farside at the north end (Farport, px 294,588);
  - the NW and SW lowlands and Ancient's Valley below the edge;
  - the airless crest above.

## 2. Geology and landforms

**The rock.** The Outer Wall's core is **the crater's patchwork rock**: no beds, blocks of every rock at every angle in a grey
matrix flecked with impact glass. It is `KSTRATA`'s `megabreccia` recipe, a 3D cellular field of tilted blocks
(`35-core-strata.js`, shared with `godthrone`). The slump scarps and the sturzstrom scars lay it open, so each scarp is a
quilt.

Over it on the lower bench lies **loess**: pale buff silt, massive, standing in vertical walls, with buried soils as faint
darker bands. In the Eternal State's country the youngest metre or two holds the Ancients' traces: an overlay's business,
not this kit's. It is `KSTRATA`'s `loess` recipe (written for this kit: loess 3-14 m with `paleosol` and `calcrete`
partings), **draped** on the ground it fell on with `KSTRATA.vary` and `KSTRATA.drape`.

*Proposed* loess thickness: 100-200 m on the lower bench (enough for Gemini's 185 m box canyons to stay in loess), thinning
to nothing at the outer slump bench (~4 km). Above it the bench is megabreccia under talus, solifluction lobes and
patterned ground.

Where the silt comes from: glacial flour from the crest's ice, and dust shed by the airless rim. The cold katabatic wind that
drains off the wall every night carries it down the bench.

**Landforms and the core that draws each** (`core/terrain/38c-core-landforms.js`, `LANDFORMS.md`, "The unbuilt plans' pieces"):

| Landform | Where | Core |
|---|---|---|
| **Loess tablelands**: *yuan* (flat tables, sheer rims), *liang* (long ridges), *mao* (knolls) | the lower bench, 3.2-4.2 km | `KRELIEF.gully` with `tops: 'yuan'`, `'liang'` or `'mao'`; parts `floor`, `head`, `wall`, `rim` |
| **Sheer gullies** 100-200 m deep with amphitheatre (box-canyon) heads | the lower bench; the edge | `KRELIEF.gully` (two orders); `rec.heads` gives each head's spring and fall |
| **Earth pillars** (loess columns capped by a boulder; taller than Earth's at 0.75 g) | gully floors | `KSTACKS` on the gully's `floor` |
| **Loess sinkholes and natural bridges** (piping: pseudokarst) | the yuan's rims | `KRELIEF` `doline` kind (`KARST-SITES-5.1.md`); bridges as `KSTACKS` arches |
| **Terraced fields** contouring the knolls | the lower bench | `KRELIEF.terraces` (treads, risers, bunds; `level:i,j` field ids) |
| **Slump terraces**: back-tilted blocks, uphill-facing (antithetic) scarps, sag ponds, *sackung* trench, toe | the three benches, 3.8-5.6 km | `KRELIEF.slump` along the model's bench line; parts `trench`, `head`, `anti`, `block`, `front`, `pond`, `toe` |
| **Landslip pinnacles** below a broken front (the Storr), a cliff of spires on a block's front edge (Seceda) | the slump fronts | `KSTACKS` on the slump's `front` part |
| **Trench lakes** | the model's eight lakes | `KRELIEF.waters` (the slump's ponds) and `WATER.open` |
| **Sturzstrom fields**: hummocky lobes, grooves, megablocks, a distal rim, a dammed lake; one fresh | the five lobes, 4.6-5.9 km | `KRELIEF.runout` (`fresh: false` softens the old); megablocks as `KSTACKS` bodies; `KSTRATA` `megabreccia` on the blocks |
| **Headwall scars** | above each lobe | the model's scar; `KSTACKS.contour` and `weather` on the face |
| **Box canyons at the edge**, a fall at each head; hanging dry valleys | the escarpment | `KRELIEF.gully` heads; `core/water` tall falls (`plungeR`, `footK`) and confluences (ext/55) |
| **The spring line** at the foot of the loess | the edge | `WATER.spring` at the gully heads |
| **Patterned ground, solifluction, rock glaciers** | over ~5 km | `KFROST` (42), as `nwouterwall` takes it; `KGROUND` `polygon` |
| **Cave-house fronts** cut into gully walls | station 1 | `KCARVE` cave mouths (`36-core-carve.js`) |

The fields and seeds are deterministic from the terrain (`KRAND` by cell), as every kit's.

## 3. Air and climate

**Air** (Copper Glacier's figures, 1.19 atm at 2,380 m and 0.71 atm at 6,500 m): 1.00 atm at 3.75 km, 0.88 at 4.75 km, 0.78 at
5.75 km, 0.69 at 6.75 km. Thin air begins to matter over about 5.5 km.

| Band | km² | Air | Rain | Mean (warm/cold) | Classes |
|---|---|---|---|---|---|
| under 3 km | 1,124 | 1.15 | ~680 mm | +10 to +13 | Dsb, Csa, Csb, Cfa |
| 3-3.5 km | 7,776 | 1.07 | 601 mm | +7.9 (20/-4) | **Dsb 72%**, Csb 14%, Csa 7% |
| 3.5-4 km | 17,288 | 1.00 | 532 mm | +5.3 (18/-8) | **Dsb 68%**, Dfb 26% |
| 4-4.5 km | 26,900 | 0.94 | 457 mm | +2.0 (15/-11) | Dsc 35%, Dfb 30%, Dfc 24% |
| 4.5-5 km | 30,676 | 0.88 | 362 mm | -1.2 (12/-14) | **Dfc 64%**, Dsc 29% |
| 5-5.5 km | 18,800 | 0.83 | 264 mm | -4.3 (9/-17) | ET 60%, Dfc 38% |
| 5.5-6 km | 7,888 | 0.78 | 226 mm | -7.2 (6/-20) | ET 94% |
| 6-7 km | 4,276 | 0.69-0.73 | 91-149 mm | -10 to -12 | ET, EF |
| over 7 km | 140 | 0.63 | 26 mm | -15 | EF, HF |

Over the whole polygon: Dfc 33,864 km², ET 24,448, Dsb 19,932, Dsc 19,468, Dfb 13,060, Csb 1,340, Csa 888, EF 692.

- **A correction to the draft:** the bench is **summer-dry only on its lower half**. Dsb and Dsc (39,400 km², 34%) hold the
  loess and the outer benches. From about 4.5 km up the model gives **Dfc** (no dry season) and then tundra. The draft's
  "Dsc 54k, Dsb 33k" was 4.22's.
- **Wetter than the NW outer wall:** 360-530 mm on the bench, against about 220 mm in the NW outer wall's forest-steppe (its
  4.21 survey). So the larch closes into woods in the shaded gullies.
- **Winter snow; summer dust** on the dry lower bench. *Proposed*: a katabatic wind off the crest every clear night, strongest in
  winter (the shared amendment: section 8).
- Krator stands near 40°S, so the **shaded slopes face south**. The model's wind is from the north-west.

## 4. Life

### Flora

Mostly the NW outer wall's, read in place by key (`biomes/nwouterwall/PLAN.md` section 3):
- `plumegrass` (feather-grass steppe) on the sunny (north-facing) loess;
- `furlarch` on the shaded slopes and in the gullies, with `seathorn` (silverthorn) in the gullies;
- `stonepine` on the upper bench and as mats above the tree line;
- `snowbirch` and `woolwillow` (shrub tundra), then `cushion`, `snowball` and `edelweiss` in the fellfield;
- `furflower` after the melt.

**Two native species of its own:**

| Species | Ref | Where | What it is |
|---|---|---|---|
| **Dust tower** | 01 | the loess tablelands | colonies that trap the wind-blown dust and cement it into towers 5-30 m tall, black with orange spiral bosses and orange-tipped stalks: the plateau's own builders, living on what the wind brings |
| **Puya spike** | 02 | the dry bench at 4-5 km (Dsc) | a giant rosette of grey spears under a flower spike 8-12 m tall that blooms once in a century; spiral like the southern highlands' rosettes, but the dry high Andes' habit |

**From the lowlands below** (the owner, 2026-10-26). The bench stands over two lowland kits, so it takes a few of each, read
in place by key from `biomes/nwlowlands` and `biomes/swlowlands` (keys confirmed at build). Together they split the bench:
**blue-grey in the north** (over the NW lowlands, the Eternal State's side) and **red in the south** (over the SW lowlands,
Dalab's side).

| Species | From | Where | What it is here |
|---|---|---|---|
| **Crag pine** | nwlowlands (its uplands' pine) | the north half's edge and lower bench | a bare pole with flat pads at the top, blue-green plated bark |
| **Needle cypress** | nwlowlands | the north half's gullies | a narrow blue-grey flame |
| **Candle birch** | nwlowlands | stands in the north half's shaded gullies, with the larch | white bark, black chevrons |
| **Tussock**, **saltbush** | nwlowlands' hills floor | the north half's dry loess | grey-green tussock and silver saltbush between the feather grass |
| **Tier cedar** | swlowlands (its uplands' cedar) | forests on the south half's lower bench (Dsb, Csb) | level tiers of flat pads, as the Atlas cedar on its mountains |
| **Ember manzanita** | swlowlands | the south half's sunny (north-facing) slopes | red, glossy, char-streaked scrub |

The other way, the bench gives each lowland kit species in that kit's own theme: `biomes/nwlowlands/PLAN-FLORA.md` (blue,
tall, lanky) and `biomes/swlowlands/PLAN-FLORA.md` (red, wide, branching). `HANDOFF-REBUILD.md` notes those exchanges wait
on this kit.

**Zones** (*proposed*, each a mask on the kit's fields): `loess-sun`, `loess-shade`, `gully`, `terrace`, `slump-back`,
`scarp`, `pond-shore`, `runout`, `fellfield`, `edge`.

### Fauna (for `kits/fauna`)

*Proposed*:
- wild sheep and ibex on the scarps and the runouts' blocks;
- marmots and pikas in the talus and the hummocks;
- a lammergeier-like bone-breaker on the slump fronts;
- a snow-leopard-like cat, with its range as a `KHAZ` `hunter` record;
- waterfowl on the trench lakes in summer;
- the NW outer wall's caribou on the upper bench in winter.

The fauna kit owns them all.

### Crops

`kits/crops` has a `nwouterwall` entry but **no `wouterwall` entry**. **A proposal (2026-11-09)**, from what the kit itself
answers: `CROPS.at` run in node over each band's climate (section 3's table; `kits/crops/src/*`, loaded as
`tests/test-crops.js` loads them), with iron and copper nodes in reach. The bands are **assumed** (the kit names bands, not
numbers): warmth by the warmest month (polar under 10 °C, cool 10-20, temperate 20-26); aridity by rain (arid under 250 mm,
semiarid 250-500, subhumid 500-900); atm `standard` (0.83-1.07 atm on the bench; `thin` only over ~5.5 km).

**The entry it needs** (*proposed*, in `10-crop-core.js`):
`wouterwall: {atm: 1, zones: {terrace: {warmth: [2, 2], arid: [2, 2]}, bench: {warmth: [1, 1], arid: [1, 2]},
upper: {warmth: [1, 1], arid: [1, 1]}, fell: {warmth: [0, 0], arid: [1, 1]}, edge: {warmth: [3, 3], arid: [2, 2]}}}`
- `terrace`: the loess at 3-3.5 km (601 mm, +7.9 °C (20/-4), Dsb); `bench`: 3.5-4.5 km (457-532 mm, 15-18/-8 to -11, Dsb,
  Dsc, Dfb); `upper`: 4.5-5 km (362 mm, 12/-14, Dfc); `fell`: 5-5.5 km (264 mm, 9/-17, ET; 0.83 atm, still standard);
  `edge`: the foot of the edge under 3 km (680 mm, Csa, Csb).

**What grows** (by bucket; crops that are clearly other cultures' own are left out):

| Bucket | Rain-fed | Irrigated (the spring line, the terraces) |
|---|---|---|
| grain | emmer, frostoat (terraces); bistort (bench up to the fell) | frostoat (bench) |
| pulse | helix bean (terraces, lower bench) | helix bean (mid bench) |
| tuber | murnong (terraces); frostroot, sweetroot, snow potato (bench to fell) | |
| nut | pinyon, acorn, wingnut (terraces); stonepine (bench, upper) | |
| fruit | apricot, crabapple, cherry, canyon grape (terraces); apricot (mid bench) | crabapple, cherry (mid bench) |
| berry | serviceberry, sunthorn, rowan, bilberry, silverthorn; crowberry (bench up) | cloudberry, rowan, bilberry (upper) |
| greens, herb | greens, monk's sage (terraces); mountain sorrel, goldroot, snow lotus (bench) | |
| spice | juniper, umbel seed, saffron (terraces) | |
| fibre | flax, cairn nettle (terraces, lower bench) | flax (mid bench) |
| weaving, thatch | willow, woolly willow; ichu thatch (bench up) | |
| beverage | ivan-chai, rattlepod | |
| dye | woad, broom, lichen; larch bark (red-brown), birch tar (black) on the bench | alder bark (red) |
| edge foot only | pomegranate, fig, olive (whorl olive), cotton, carob, sweet potato | rice, tea |

So the **terraces** take a cool, summer-dry package rain-fed at 601 mm (emmer, frostoat, flax, apricot, pinyon), more
with the spring line's water; over ~3.5 km the Thule package of the NW outer wall's entry takes over (sweetroot, snow
potato, frostroot, goldroot, bistort, stonepine nuts), as the draft said; the fell grows tubers, bistort, crowberry
and stonepine rain-fed, and little else. The model's upper bench is Dfc, not Ds (section 9): it is wetter in summer than the theme, which the
list reflects.
- **Dyes:** woad (blue), broom (yellow), larch bark (red-brown), birch tar (black) and lichen rain-fed on the bench, iron
  red (`falu-red`, `hill-terracotta`) and copper teal (`verdigris`) where `kits/resources` places the nodes: the Hayrant can
  make a plaid (`CROPS.canPlaid`).
- **Native records to add** (*proposed*, `home: ['wouterwall']`): none needed for food; the dust tower and the puya are
  not crops. The puya's century spike as a seasonal fibre or a thatch is a lore choice.

## 5. People

- **The Hayrant** (the Eternal State's Outer Wall subjects). `LORE.md` §6.19 gives the State five or six dialects. The
  **Outer Wall** dialect came to sound like Ainu (the owner, 2026-10-23); the name *Hayrant* is *proposed* there.
  - *Proposed* here: they live in **cave houses cut into the loess**, as China's *yaodong*: vaulted rooms dug into a gully
    wall, or sunk round a courtyard pit.
  - They farm the terraces and keep the spring line.
  - Where the loess thins over rock, they build **dug-in cellars and houses with dry-stone fronts and turf roofs**, half
    buried in the slope in clusters (`refs/07`).
  - **Mirabilis** (px 350,726) is the first to place. It is a settlement plan's work. The Hayrant's farming hamlets are
    `core/hamlet` records (`KHAMLET.village`, farming), placed by that plan, not by this kit.
- **Dalab** (§6.1) holds the south. Its road over the Outer Wall runs partly through Ancient tunnels under the airless crest,
  to Ledge on the rift rim (§4, the Rift line; `biomes/riftrim/PLAN.md`). The Rift line's portals stand in "the Outer Wall's
  northern foothills (~3.5 km)". **Shelf** (px 461,1161, 3,760 m, an arcology 98 km south of Dalab) fits that and the draft's
  "~110 km south of Dalab". Whether Shelf is the portal is the owner's call.
- **The Tungangs** (the Tungang Union's 5,804 km² at the southern end): the Ancients' tunnel crews gone feral, who keep the
  Line and bargain with Dalab. Their Fellgang branch lives on the fells.
- **Ancient's Valley** below the middle edge. Its station 0, the Overlook, is built (`biomes/ancientsvalley/PLAN.md`). Its
  rivers carry the Yusar's names (Waywater, Cutdry).
- **The Yeti Kingdom** (*Khaay Qantïr*, §6.19 and `biomes/nwouterwall/PLAN.md`) is just north, over Farside. Its raiders
  may cross the north end.
- **NPC camps:** herders' summer camps on the upper bench, and Dalab's road stations (`core/camp`).
- **Player outposts:** no spot is picked. This kit offers hints only, for the open world's player-settlement registry: the
  spring line, the yuan's tops, the trench lakes' shores. Nothing is drawn for them.

## 6. Dangers

| Danger | Where | `KHAZ` |
|---|---|---|
| **Rockfall and fresh avalanche** | under the headwall scars and the slump fronts | `crush` near the scars' talus; `fall` on the faces |
| **Loess collapse**: gully walls calve, pipes open underfoot | the yuan's rims, the gully walls | `pit` at the sinkholes; `fall` at the rims |
| **Cliffs** | the escarpment, the box canyons, the slump scarps | `fall` |
| **Flash floods** in the box canyons in the melt | the edge's canyons | `drown` and `crush`, timed: the shared **gorge flood** amendment |
| **Cold** | everywhere; the coldest month -4 to -23 °C | `KHAZ.provide('temperature')`; `cold` records for cold-air pools in the trenches |
| **Thin air** | over ~5.5 km (0.78 atm and under) | `KHAZ.provide('pressure')` |
| **The night wind** off the crest | the whole bench, clear nights | `cold` and the dust load: the shared **katabatic wind** amendment |
| **Dust storms** in summer | the lower bench | the page's weather provides `dust`; the walker reads visibility |
| **Ice and wet loess** | the trench lakes in winter; the loess and solifluction in the thaw | `slip`; `sink` on thawing ground; `drown` in the icy lakes |
| **A predator's range** | the scarps | `hunter` (`hunter: {fauna: [...]}`) |

The signs:
- fresh pale rock and dust at a scar;
- cracks back from a rim;
- a rising roar in a canyon;
- frost smoke in a trench at dusk;
- a brown wall on the horizon.

## 7. Stations

World km = 5.1 px × 2. Each page is the usual 5.2 km square.

| Station | 5.1 px | Ground | What it shows |
|---|---|---|---|
| **1 The loess tablelands** (`wouterwall.html`) | **352,716** | a yuan at 3,664 m, flat to 128 m over 6 km; Dsb, 518 mm, +7 (20/-6); Yūt-Mā's gully beside it; Mirabilis 20 km south at 3,125 m | a yuan cut by a deep gully, terraced fields contouring the knolls, earth pillars in the gully, dust towers on the flat, cave-house fronts in a gully wall, larch in the shaded gullies, feather grass on the sunny slopes |
| **2 The slump terraces** (`-slumps`) | **318,818** | the trench lake at 4,430 m, 84 km²; Dfc round it, 361 mm, +1 (14/-12) | an uphill-facing scarp in patchwork rock, the trench lake under it, the next block's back tilted toward the wall, landslip pinnacles below a broken front, puya spikes on the dry slopes |
| **3 The sturzstrom** (`-sturzstrom`) | **320,871** | the flagship lobe at 4.9-5.0 km under its scar (310,872); Dfc, 282 mm, -2 (11/-15); the wall rises to 7,075 m 64 km west, the airless rim beyond | a hummocky grooved lobe, a fresh lobe beside an old one, megablocks, a small lake dammed behind the rim (the kit's), fellfield; the airless crest over all |
| **4 The edge** (`-edge`, the ecotone) | **360,1010** | Waywater Ironblack's box canyon at 3,448 m, 3,116-3,829 m within 6 km; Dsb, 596 mm, +5 (18/-8); the river leaves the bench at 2,580 m | a box canyon with its spring-fed fall, the spring line, the lowlands and Ancient's Valley 2 km below |

**Station 1 comes first.** The owner named it (`HANDOFF-REBUILD.md`). It takes all four of the new core pieces at once
(`gully`, `terraces`, `KSTRATA.vary`/`drape`, `KCARVE` mouths), and it is the only station with people's work in it.

Alternatives:
- **station 3 higher:** the northern lobe (px 327,667) lies at 5,852 m (ET) under a scar at 6,411 m. That is nearer the draft's
  "~6 km", but further from the trench lakes.
- **station 4 in the Eternal State:** Tōng-Mā's head (px 348,853, 3,283 m, Csb).

## 8. Core adoption

The table of `README.md` "CORE MODULES ARE NOT OPTIONAL", for this kit:

| Need | Module | How |
|---|---|---|
| randomness | `core/rand` (`KRAND`) | every placement seeded by (world, cell, index, salt) |
| placement mask | `core/mask` (`KMASK.canvas`) | the zones; never `getImageData` |
| tags, space | `core/tags`, `core/space` (`KSPACE`) | every record before it is drawn |
| the rock | `KSTRATA` (35): `megabreccia`, `loess`; `KSTRATA.vary` and `drape` (35c) | the wall's core; the loess mantle draped on the bench |
| landforms | `KRELIEF` (38) and `38c`: `gully` (`yuan`, `liang`, `mao`), `terraces`, `slump`, `runout`, `KRELIEF.waters`; `doline` for the pipes | section 2; list `38c` after `38-core-relief.js` and put the records in `KRELIEF.apply` |
| stacks | `KSTACKS`, `KSTACKS.contour`, `KSTACKS.weather`, `37c` rubble | pinnacles, earth pillars, megablocks, scar faces, canyon fins |
| caves | `KCARVE` cave mouths (36) | cave-house fronts, loess pipes' mouths |
| frost | `KFROST` (42) | patterned ground, solifluction, rock glaciers over ~5 km |
| ground | `KGROUND` (43): `polygon`, `clast` | the ground shader; rubble on the runouts |
| horizon, far | `KHORIZON` (45), `KFAR` (44) | the crest and the airless rim; the lowlands below the edge |
| snow | `snowCover`, lee drifts | winter; the trenches' drifts |
| water | `core/water`: `WATER.open` (`surf:false, breakers:false`), `flow`, `spring`, tall falls (`plungeR`, `footK`), confluences (ext/55), ice | the trench lakes, the canyons' streams, the spring line |
| flora | `core/biome`, the universal set (`BACKPORT.md` section 1), `check_cells.py --fix` | section 4 |
| season | `core/clock`, `core/biome` season | larch gold, the melt, the steppe's colour |
| sky, weather | `core/atmos` | the shared sky, thin air, dust, snow |
| hazards | `core/hazard` (`KHAZ`) | section 6 |
| camps, hamlets | `core/camp`, `core/hamlet` | herders' camps; the Hayrant's hamlets by the settlement plan |
| fauna, crops, resources | `kits/fauna`, `kits/crops` (a new `wouterwall` entry), `kits/resources` | read the geology at build |
| shadows | `core/shadow` | off at load |
| host, export, materials | as every kit | `materials.json`, `tools/textures/pack.py` |

**Core amendments needed:**
1. **A baked offset texture for varied strata.** `KSTRATA.vary` is CPU-only: "the shaders still draw the flat column". Without
   the bake, the loess's soil bands on a gully wall must be painted on the CPU or will not follow the drape. The Slabfields needs it
   too. This is the one new core item.
2. **Katabatic and cold-air wind**: already listed by other plans; cite it.
3. **The gorge flood** (a timed `drown`/`crush` in a channel): already listed; cite it.
4. **The player-settlement registry** (open world): hints only.

## 9. For the owner

- **The fresh sturzstrom:** where it fell and when (a story site). Gemini marks the lobe at px 310,872.
- **Shelf:** is it the Rift line's portal on the Dalab side?
- **The Hayrant's cave houses**, and the Eternal State's hand on the bench.
- **Station 3:** the flagship lobe at 4.9 km, or the northern lobe at 5.9 km?
- **The upper bench is Dfc, not Ds.** Keep the model's classes, or ask Gemini for a drier upper bench to match the theme?
- **The crops** (section 4, a proposal from `CROPS.at`, 2026-11-09): accept the `wouterwall` entry and its five zones
  (`terrace`, `bench`, `upper`, `fell`, `edge`), and the band thresholds it assumes (the kit's bands have no numbers yet:
  they belong in `kits/crops/PLAN.md` section 2)?
- **The river names** changed on 5.1 (Waywater Ironblack and the rest). Are the draft's English-gloss names (Okbruk, the
  -guli series) retired?

## 10. Textures

In the library: `ground.steppe`, `ground.tundra`, `ground.turf.polygon`, `card.grass.dry`, and the nwouterwall's sets once
delivered.

To source or generate (generic ids; the prompts go into `core/materials/PROMPTS-NEEDED.md` at W0):
- **loess**: a buff silt wall, vertical, with root casts and faint soil bands;
- **terraced loess field** ground;
- **megabreccia** (shared with `godthrone`);
- **sturzstrom rubble**: angular mixed blocks;
- the dust tower's bossed surface;
- the puya's spear card.

## 11. Order of work

- **W0.** The owner approves the plan; the station sites; the texture prompts.
- **W1.** The kit on the biome core: fields (loess depth, aspect, slump blocks, runout lobes, spring line), zones, station 1's
  ground on `KSTRATA.vary`/`drape` and `KRELIEF.gully`/`terraces`.
- **W2.** The slumps and the runouts on the model's benches and lobes; the trench lakes.
- **W3.** The two native species; the nwouterwall's and the lowlands' flora read in place; the crops entry.
- **W4.** Stations 2-4.
- **W5.** `verify.py --assert`, `PORT.md`, the index tools, `tools/check_core_use.py`, the gallery.

## Sources

- the owner's brief, 2026-10-26, and `HANDOFF-REBUILD.md` (station 1's turn, the landform pieces);
- the model at `gemini/scale-model-5.1-r3`, read with `smodel.page` (2026-11-09): heights, water, `p`, `tm`, `tw`, `tc`, `c`;
- `tools/scale-model/model/src/51-region-store.js`, `60-settlements.js`, `model/data/rivers.json`, `river-names-5.1.md`;
- `smodel/tier1_biomes.py` section 3 (the slumps, the lakes, the lobes, the loess, the box canyons);
- `core/README.md`, "The unbuilt plans' pieces (2026-11-03)"; `core/terrain/LANDFORMS.md`; `35-core-strata.js` (`loess`, `megabreccia`);
  `35c-core-strata-vary.js`; `core/hazard/README.md`; `BACKPORT.md`; `biomes/KARST-SITES-5.1.md`;
- `LORE.md` §4 (the Rift line), §6.1 (Dalab, Ledge, the Tungangs), §6.19 (the Eternal State, its dialects, the Yeti Kingdom);
- `openworld/ANCIENT-ROADS.md`; `biomes/nwouterwall/PLAN.md`; `biomes/ancientsvalley/PLAN.md`; `kits/crops/src/10-crop-core.js`,
  `40-crop-query.js`, `API.md`, `PLAN.md`; `CROPS.at` run in node over section 3's bands (2026-11-09).
