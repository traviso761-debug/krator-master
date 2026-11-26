# Crater drylands — known issues

Read before changing this kit. Open items are `- [ ]`; `build.py` counts them.

## The final rebuild (pair 12, 2026-11-09; a cloud session: built and linted, NOT verified on a GPU)

Branch `claude/rebuild-crater-drylands-cloud`, from `claude/integration-b91c04` (b4edff31, the sky's `giant` from `SKY.legacy`, kept).
`PLAN-STATIONS.md`, "Core adoption (pair 12)", has the table, and "Stations 3 and 4, as built" the two new pages. Every change in `src/`,
`stations/` and `build.py`.

**What changed.**
- `build.py` on the universal set's lists: core/biome 31b (the leafset: `check_assembly`'s MISSING `BIO.leafOn`/`leafQ` gone), 31j, 32, 34,
  41, 44; core/terrain 43 KGROUND, 44 KFAR, 45 KHORIZON with their host halves; core/shadow; core/hazard; core/atmos's height fog, rain cover,
  lightning, particles, the wind's dust and the air's load; core/water ext 56 and 57; `khost.FULL` (the whole interface and its edit layer);
  `--station` (no station yet); LF writes; the pack from the shared `tools/textures/matlib_pack.py` (it keeps a card sheet's `cell`).
- **Trees (55):** `BIO.flareJoin` on the six limb tubes (the mallee's limbs, the pines' and the gums' branches, the aloe's and the Joshua's
  forks, the pincushion's arms; not the boles from the ground). **Octahedral impostors** for the far LIVING trees of the eight species over
  7 m (mallee, pillar, frill, parasol pine, ghost gum, tree aloe, Joshua, pincushion), baked from the hero nearest the middle drawn unburnt
  (its copy's age 20). A far tree the fire left bare or black keeps its charred pole and blob (the blob's own rule), so the mosaic still
  reads from afar; the small four keep their blobs. `?diet=0` is the old far tier. `regTree` registers nothing during the bake.
- **Ground (84):** the five library layers on KGROUND (hex tiling, distance scale, height blend) at the old weights, strengths and tints;
  the char's ash drifts and greying kept as a pass after the layers; the carpet's macro noise sampled once (`cdM1`, `cdM2`) for the granite
  patches and the char. `?kground=0` is the old hand-tiled mix. KGROUND's distance reads `kEye` (korona's redirect; see below).
- **87 (new):** KFAR, the floor to 12 km in red soil, straw, olive and a few dark burns (`?far=0`); KHORIZON on the ground and, after the
  bake, on the flora (`?hz=0`).
- **88:** the field contract (`BIO.env`), the impostors' look and bake (`IMP_GAIN` 2.4, `?impgain=`), the horizon, **KSHADOW off by default**
  (`?shadow=1`).
- **89a:** height fog (`?hfog=0`), the rain cover, the wind's dust off the fresh char and the washes (none off the granite or the seep), the
  air's load with a dust storm on the panel's air select (`?dust=0`, `?storm=1`).

**Species for readers.** None changed: `CRATERDRY.SPECIES`, `PLANTS`, keys and indices as they were; no tree moved (the flare draws no
random numbers, and a living far tree's blob drew none). `CRATERDRY.grow` and `make` unchanged (a reader's far tree is still a blob).
`CRATERDRY.IMPOSTOR_SPECIES` lists the species on impostors. `reach.py`: nothing reads this kit's fragments in place but core/biome's
`test-fire.js` (52, unchanged).

**Not done this turn, and why** (PLAN-STATIONS.md says more):
- [x] **The N/S split and station `south`** (2026-11-09; the owner: merge savannarim in, "black mallee is good"). `claude/hyperjungle-lands-cloud`
      (savannarim, not yet GPU-verified) is merged into this branch. Station 2 `south` is built (`--station south`, `dist/crater-drylands-s.html`;
      PLAN-STATIONS.md "Station 2, as built"); station 1 also writes `dist/crater-drylands-n.html`, and `dist/crater-drylands.html` stays as a
      copy of it until its readers (the gallery, `verify.py`, the baseline) point at `-n`. Savannarim reads this kit's `50` and `55` in place:
      this turn's changes there are optional switches (`BIO.host.seasons`, `BIO.host.treeScale`, the flare, the impostors, the spire's stalk).
- **Headless loads after `south` and the merge** (2026-11-09, software GL): all four pages clean. `south` passes all 37 checks and
  negatives (4,111 black mallees, all on the old flows; rust miombo 222, incense 489, rain roses 9; 31,906 trees of the base, none on a flow;
  attach audit .14%; the season and flush bound, the trees at .85); station 1 30, edge 34, salt 34, their fire mosaics unchanged. On the way:
  `84`'s flow knob was read before its declaration (every page threw at load: fixed), and one base tree stood on a flow (the mask now
  reaches zero by half a flow).
- Done on `south` (2026-11-09): **the Af gallery** in a north-western gully (the hyperjungle's trees at .3-.5 of their size, read in place,
  as savannarim's gallery forest; `?gallery=0`); **the tibasalt beds at the southern edge**: a 30 m lava step there (Godstep's first), its
  face a mesh of its own coloured vertex by vertex from KSTRATA's `tibasalt` recipe (`KSTRATA.at`: no texture unit; the core strata shade
  would take 3-5 and the ground reads 14 of the Arc's 16; `?step=0`); **the oak scrub** on the step's top (a kin of nhighlands' gnarled
  oak, 3-6 m, dusty, no moss: EXCHANGES.md's row; `?oak=0`). Headless (software GL): all 42 checks and negatives pass (18 gallery trees, all in
  the gully; 50,756 triangles of tibasalt face; 158 scrub oaks, all on the step's top; attach audit .10%).
- [ ] **Owed on `south`:** Godstep's red guyed stalk and lava pioneers (Godstep's kit is a plan: `biomes/godstep/PLAN.md`); S's fields and
      hazards from the scale model's S polygon (the stage is an ideal type, as N's); the copper flush's look (savannarim's miombo cards are
      painted stand-ins: its PROMPTS-NEEDED entry); the scrub oak does not resprout after a fire (nhighlands' builder knows no burn age).
- **The incense tree's and the rust miombo's crowns** (the owner, 2026-11-09: "incense tree looks like texture glitch"): savannarim's painted
  leaf card filled the square with five parallel leaves, flat panels of strips on the crown's crossed quads. Fixed at the source
  (`biomes/savannarim/src/56`, its `pinnate` painter: a cluster of seven leaves fanning from the centre; savannarim's KNOWN_ISSUES.md says so).
- [x] **KFIRE (H3), 2026-11-09 (the owner asked for the core test change):** `src/52` is an adapter onto core/biome's KFIRE, handing it
      the kit's own burnability (BIO fbm patch), edge warp and older fires (drawn as before, `old:0`), so the page keeps its fires. The
      original fragment is frozen as `core/biome/ref/craterdry-fire-52.js.txt`; `core/biome/test-fire.js` reads it as the reference and
      now proves the adapter gives its grids, lookups, shares and live fire bit for bit (33 pass). Moving to KFIRE's portable defaults
      (KRAND noise, hashed old fires: what Godot reproduces) would change the page once; not done.
- [ ] **Wadi and talus (KRELIEF's kinds), for the owner:** station 1 already has both as its own forms (the washes are wadis, sand floors
      between banks; each kopje has a talus apron), so the row's kinds are not taken: drawing them by KRELIEF would reshape station 1's ground
      and move every plant on it. Taking them is a look decision (the strata are done on `south`; the mounds on `edge`, the pans on `salt`).
- [x] **A core finding (korona's too):** `core/terrain/43-core-ground.js` read the eye uniform three r128 leaves at 0 on a Lambert material.
      Fixed in core on savannarim's branch (merged here 2026-11-09: the view matrix's eye); this page's own redirect (`KG_EYE`) is gone.

**CPU checks run here:** `tools/build.py` (syntax OK), `check_core_use`, `check_assembly`, `check_port`, `check_source`, `check_cells --ratchet`,
`check_vendor`: nothing new for this kit (`check_stale`'s four over the baseline are other builds', the same on the untouched branch tip);
`node core/biome/test-fire.js` passes. One headless load, software GL (`tools/harness.py smoke`, not the verify): the first caught the ground's
shader failing to compile (`KHOOK.EYE`'s `#ifndef` spliced mid-line: fixed); the second loads with a clean error panel, 50 calls, 18.8 M
triangles at the opening view (the budget's 18.5 M was measured before the far field: `showcase-triangle-budget` may want its number moved).

**Stations 3 and 4 (`edge`, `salt`), built this turn** (`python3 build.py --station edge|salt`; PLAN-STATIONS.md has what each draws).
`src/` reads the station through guarded `STATION` knobs (89's sky site, 84's older fires, 88's build call, 99's title, views and checks);
with no station they are not taken, and station 1 runs as before.
- `edge`: swbay's six fragments read in place (its species, trees, floor, dress, build, fauna: its registry closes in the fauna file) for
  `BIO.kin('swbay.thorn')` and `'swbay.baobab'` only (SWBAY.build is not called); core/biome 35 and 36 for swbay's fauna file; KSTACKS for
  the mounds. The bay's trees take no char (their builders know no burn age).
- `salt`: abyssal-savannah's four fragments read in place and built (`ABSAV.build`) under its own mask; its burn is this page's fire history
  (`ABSAV.burn` replaced on the page), its parkland band opened to the flat floor; core/biome 33, 35, 39 for its species; water ext 54/54b
  for the pans and the brine look.
- [ ] **Owed to swbay's turn:** its `leaflet` and `bloom` cards float on the umbrella thorn and the baobab (221 of 351 and 121 of 206 on
      `edge`, software GL: 7.3% of the page's cards; ringisles saw the same on these trees). `edge` marks the two free on its page only
      (`window._auditOwed`, korona's way; `?owed=0` audits them); the fix is `BIO.holdTo` in swbay's thorn and baobab builders.
- **Headless loads after the known-issues pass** (2026-11-09, software GL): all three pages clean, every check and negative passing
  (station 1 30, attach audit .14%; `edge` 34, .27%, 873 thorns, 57 baobabs and 19 flame-crowns, the season bound; `salt` 34, .05%, the
  trees at 1.2x); `KratorFauna` on each with 153 animals. On the way it caught the fauna bundle's missing group (above) and the edge's
  season fragment sorting after `99-tail.html` (outside the script: renamed `99-host-zseason.js`).
- **Headless loads of the stations** (software GL, `tools/harness.py`'s launcher; the page's own host checks and negatives run, not the
  verify): `salt` clean, every check and negative passes (34), the two kits on their own ground (77,113 and 9,739 sampled instances, 1 off),
  nothing on a pan, attach audit .24%; `edge` clean, every check and negative passes (34: 873 umbrella thorns and 57 baobabs as kin, 362
  mounds, none in a wash), attach audit .04% with swbay's two items owed (above); station 1 clean, every check and negative passes (30),
  attach audit .14%. On the way: the first loads of both stations failed the "sheer face" negative (their first kopjes too gentle to have
  one: made steeper), and the edge's audit then found **the sword spire's flowers floating** (123 there, 20 on station 1): its flower spike
  is a leaf-material item, which the audit counts as a card. The spike now has a stalk (a `rod` up its axis, inside it, as the yucca's
  spike has; no random number drawn, so nothing else moves).
- Done on the stations (2026-11-09): **seasons on `edge`** (the kit's grass takes core/biome's season through `BIO.host.seasons`, bound
  to the clock in `99-host-zseason.js`: straw and thinned in the dry, green in the wet; `?season=0`); **nwbay's flame-crown** at the
  waterhole (`BIO.kin('nwbay.flamecrown')`, nwbay's species, trees and variants read in place in their own registry, k-guilin's way; only
  the pack's bark3, fernleaf and bloom families); **the kiln's scrub at its largest on `salt`** (`BIO.host.treeScale` 1.2, applied in
  55's make after its draws); the salt floor's placement mask now keeps the core's water rule.
- [ ] **Owed on the stations**, each to another kit or to core: k-guilin's **banyan** (a cousin) and **silvergrass** (read in place) on
      `edge`: k-guilin exports no `make`/`grow` for its trees and no function for one floor plant (k-guilin's turn); nwbay's **cinder pine**
      on `salt` as the row's cousin ("upright and unsheared"): its builder always leans and shears to the lee, so the cousin needs a habit
      option in nwbay's B[10] (nwbay's turn); the **Steampits' geyser field** reaching into `salt` (the geyser kit's run-off and sinter
      apron: a station of its own size).
- [x] **The dry season drives the dust** (2026-11-09; a new core file, `core/atmos/fx/89-atmos-fx-dustseason.js`, opt-in, with
      `test-dustseason.js`): the season's share (a quarter in the wet, all at the height of the dry; core/clock's season at the page's day
      and hour) scales the air's local dust every frame and the dust's mask at each sprite re-bake; a storm is not scaled. On all three
      pages (`89a`, `?dustseason=0`). A new file rather than an option in `89-atmos-fx-airload.js`: that file reaches 34 pages, which would
      all need rebuilding.
      Headless (software GL): at the page's opening day the share is .61, the local dust 30 -> 18.2 mg/m3. Its first build read
      `window.ATMOS`, which core/atmos's top-level `const` is not: it never attached until it read `ATMOS` as the fx files do.
- **The KFIRE move on the pages** (headless, software GL): every page's fire mosaic is the one before the move, share for share
  (station 1 char 9.7%, bloom 12.8%, regrow 12.0%, mature 29.9%; edge and salt likewise), and the trees and kin counts unchanged.

**What the GPU verify should look at** (`verify.py dist/crater-drylands.html --assert --all-views`; nothing here ran on a GPU):
- the error panel and `KHOOK.checkPrograms` on the ground: its program is the hand-written hook plus KGROUND's layer, five KGROUND samplers
  beside the map, detail, two granites, carpet, fire map and the burn (for the live fire), plus the horizon: about 13 units, 14 with `?shadow=1`;
- the ground's look against `?kground=0` (the char's darkness and ash, the soil's warmth, the washes, the tiling at 60-300 m);
- the far trees on 'From afar' against `?diet=0` (their brightness: tune `IMP_GAIN` / `?impgain=`; a burnt far tree must still read black);
- the far field's colour at the map's edge and the horizon's shadows by the kopjes; the height fog's density (falloff 1/700);
- the dust: none at load in calm air, the storm on the air select; `?shadow=1` once for its cost;
- the attach audit: the limbs' collars should take nothing away; any floater it reports is this kit's (no other kit is on the page);
- the budgets: `showcase` (18.5M tris, 120 calls) was measured before the impostors and the far field.
- **the stations** (`verify.py dist/crater-drylands-edge.html --assert --all-views`, and `-salt`): their budgets are station 1's numbers;
  the edge's mounds (one mesh) and umbrella trees, the salt floor's pans (their crust's polygons and the brine after rain: the weather's
  rain) and brine pools, the two kits' boundary on the islands, the attach audit on swbay's and abyssal-savannah's own cards.

**The first GPU verify (2026-11-08, `--assert`, Arc and RTX).** Three fixes, each in this kit:
- The ground's fragment shader did not compile ("'#' : invalid character", "'ifndef' : syntax error"): 84 spliced `KHOOK.EYE` (which opens
  with `#ifndef KHOOK_EYE`) straight after `float cdM1,cdM2;` on the same line, and a preprocessor directive must start its own line.
  A `\n` goes before it now. The ground draws; `shader-errors` and `shader-programs` pass.
- `export-profile` failed on its hazards section (core/hazard needs `KTRAPS.cycle`): `build.py` now loads `core/biome/37-core-traps.js`.
- The attach audit read 81 of 189 sword-spire florets floating (1.23%): the spire was drawn on `vsway`, a leaf-kind card material, so it
  was no structure. It is a solid now (`M.spire`, vertex-coloured, no sway): 6 of 6545 float (0.09%).
- [ ] **Still failing: `instance-cap`**, `craterdry/bloom` 488,234 > 250,000 with no `capWhy`. The bloom's drifts are the kit's point,
      so the count is the owner's budget call: either a `cap`/`capWhy` on `BIO.def('bloom', ...)` (50) or a coarser drift cell (60).

## The region and the open world

- [x] **The Koppen classes** (2026-11-09): `CRATERDRY.KOPPEN` is the scale model's (4.23, `survey_biomes.py`; PLAN-STATIONS.md "The
  ground"): BSh .70, Aw .18, XS .04, BWh .04, Csa .03, XV .01 over both lands, and each land's own in `CRATERDRY.KOPPEN_LANDS` (the
  estimate was BSh .6, BWh .25, Aw .15). Only the probe's tag check reads it: no placement moved. The lands' pressure (N 1.72 atm at its
  median, S 1.54 on its BSh) and rain are in the same survey; the showcase's sky keeps 1.9 atm (the deep floor's). An open world still
  takes its region's fields from `tools/scale-model/extract_region.py` (the next item).
- [ ] **Not slotted into an open world.** `openworld/little-demo` is the eastern desert. A world that takes this kit
  calls `CRATERDRY.fireHistory` over its region once (a 20 m grid) or binds an age field of its own.
- [x] **Catalog fruit (2026-10-06).** The frill-tree's fireseed (`generic_fruit_fireseed`: three seeds in every living
  pod near the camera, and spilled on the ash round a snag burst in the last year) and the parasol pine's cones
  (`generic_fruit_parasol_pine`: hanging under the branch-tip tufts and fallen under the crown) are drawn, placed by a
  hash of the tree so no other tree moved; the yucca and the Joshua tree take the shared roasted-stalk piece
  (`generic_fruit_yucca`, its flowers drawn as before). The probe checks it (`fruit tagged, catalogued and drawn`).
  Nectar (mallee, tree aloe, pincushion), the pillar's pith and the jade's leaves are named in the tags, not catalogued.
- [x] **Fauna** (2026-11-09; sedesert's way): `kits/fauna`'s wild, ash, livestock, mounts and hyperjungle groups are on every page of this
  kit (`39-host-fauna.js`, no texture pack; 153 animals), for the editor's fauna mode: the palette lists this biome's animals first (the
  ash runner, the salamander, the burn-hawk, the hot-spring axolotl, the char beetle, the goat, the donkey, the Bactrian camel, the cinder
  crawler, the Scyvoi's mounts...), each put down is drawn, registered as a core/tags life record and idles and grazes on the host's clock
  (99-host-take.js, `CD_WORLD`). Nothing is placed at load: herds belong to a world. The farm group's crater animal is not bundled (80 KB
  for one). A Scyvoi camp on a kopje is a settlement, not part of a biome.
- [ ] **A kits/fauna finding:** `fauna_bundle.bundle(groups)` takes no group's dependencies: the wild group calls the hyperjungle group's
  `faHiMix` while it registers, so a bundle of `wild` without `hyperjungle` throws at load (it took this page down before `BIO.init`; caught
  by a headless load). The bundler should add a group's needs, or the helper move to `fauna-core.js` (kits/fauna's, not this turn's).
  `kits/fauna/BIOME-FAUNA-PLAN.md` still marks the burn-hawk and the axolotl unbuilt; both are in the hyperjungle group.

## The fire

- **The live fire** (89, `NOTES.md`): one fire at a time; lighting another replaces it. The burnt plants stay burnt
  only while the fire is lit ("Put it out" restores them): the trail is the shader reading the map, not a change to
  the world. A live fire does not feed back into the history (`CRATERDRY.FIRE.last`), so the ground it burns does not
  turn to bloom on a later visit, and a second fire can run through the first one's char.
- The flames are camera-facing quads (cylindrical: upright); seen from straight above they are thin. The smoke is
  sprites, not a volume. The fire's light is one point light at the head.
- Not yet lifted into `core/atmos` (`NOTES.md`, "The live fire").
- The fire model's grid is 20 m. A burn's edge is the cell edge warped by noise (sharp, not a staircase), but a
  plant within about 10 m of an edge may read the neighbour's age.
- No smoke rises from the static three-week-old burn yet (the live fire's smoke pool could seed it).

## Textures

- **The ground's library layers** (`ground.burn`, `ground.redsoil`; 84) are blended per vertex (12 m) by the burn's
  stage: char and ash on the fresh burns, fading through the bloom's first year; red soil, half mixed with the painted
  colour, under the bloom, the regrowth and the old scrub. A burn's edge is therefore soft over about 12 m on the ground,
  while the plants change at the 20 m fire grid's warped cell edge.
- **Anti-tiling** (2026-10-05, the owner: "the charred texture looks a bit samey"): each ground layer is sampled on its
  own tile and on a larger one turned 37 degrees, blended by a macro noise (the carpet map's B channel at ~58 and ~164 m),
  and the char varies at that scale: deeper black, grey-white ash drifts, less of the soil's warmth. The charred shrubs
  draw from four cells of `card.charred` (`twigs`..`twigs3`), not one.
- The library sets in use (`materials.json`, `tex/`, 2.3 MB): two grounds, 13 cards (the pine, prism-gum, sage and ember cards from
  earlier kits; the charred shrub, dry grass, flower spike, cup flower, fire lily, pillar frond, prism fern, jade and broom
  cards delivered for this kit), five barks (`bark.pine.scale`, `bark.pillar`, `bark.prismgum`, `bark.bark_bluegum`,
  `bark.char` for the dead and charred wood) and the granite. `?mat=proc` shows the procedural textures.
- Cards on a tuft, a bloom or a frond strip are one cell cut from the sheet of nine (50, `libCell`); the pillar's diagonal
  frond is turned onto the strip and the prism fern's onto a broad leaf quad (`G.leafquad`, library only). The flower
  spikes, cups and the lily are white or full colour cards: the drift's colour tints the petals and darkens the leaves.
- The living trunks' char band is the species' own bark darkened, not `bark.char` (that is the dead and charred wood).

## The showcase

- The showcase is a 5.2 km disc; the regions are 53,000 and 8,000 km². The kopjes, washes and the seep are the
  showcase's own.
- **Budget**: 17.9M triangles at q=1 (trees ~13.5M, floor ~4.4M; 17.0M before the frill-tree was rebuilt as a frill tree, 2026-10-06), ~35k trees, 40 draw calls (`99-host-take.js` BUDGET:
  18.5M, measured, not a target). The first build measured 30.1M: the LOD spine covered the whole map, so 50k of 51k trees
  were heroes. The spine is now the kopjes, three points on wash A, the seep and the recent burns' real centres (84 adds
  them after the fire model runs). `?q=0.5` builds at half density; `?nobake=1` measures without drawing.
- **The bloom's carpet is a ground-shader layer** (`84-host-ground.js`, `TEX_CARPET`): flower dots in the drift's colour
  and grass blades, weighted by burn age. The instanced flowers are on top of it. It is flat: close to the ground at a
  low angle the dots read as paint.

## The host (core/host, 2026-10-12)

- [x] **L arms a fire, F walks** (2026-11-09): the fire's key is L now (`keys.l`; no core/host key uses it), so F walks here as on
      every page. What follows is the old note.
- **F armed a fire, not the walk.** The camera, loop, panel and probe are core/host's (`src/99-host-take.js` hands the
      page to `KHOST.take`; no core/host file is overridden). The host's F walks; this kit hands F to the fire
      (`keys.f`, 89-host-fire.js's click-to-light), so this page has no walking (a build's keys win over the camera's;
      walking wants another key, or the fire another). An armed click lights a fire before the inspector
      or the polygon tool sees it (`click`). The fire's bar sits in the bar's `#ui` after the view select (it was first).

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-25: `water` is now in `EXPORT_PROFILE` (phase 4: the seep is a `WATER.still` in `89w-host-water.js`; its own MAT_WATER is gone). The fire (flames, smoke) and its `OWN sin-hash` are untouched.
## Open

- [ ] **The sky's landmarks (SKY-PLAN.md 4, layer 8; 2026-10-26).** The shared sky now draws the Throne's plume, the wildfire smoke at az 48 and the Ring Sea's silver line (preset.landmarks in 89-host-sky.js), where the notes above say they were not drawn. Built but not yet verified on the GPU page by page: that is folded into the biome rebuild's final rebuild and verify.

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. Kept from the dome: the Throne's cone far to the SSE and the
      kopjes (ridges); its plume, the wildfire smoke at az 48 and the Ring Sea's silver line are not drawn (no landmark
      layer in the sky yet: KNOWN_ISSUES). Draw calls at the default camera (verify.py --assert, GPU): 50 before, 47 after.

