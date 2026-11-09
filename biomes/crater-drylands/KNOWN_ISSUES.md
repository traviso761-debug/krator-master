# Crater drylands — known issues

Read before changing this kit. Open items are `- [ ]`; `build.py` counts them.

## The final rebuild (pair 12, 2026-11-09; a cloud session: built and linted, NOT verified on a GPU)

Branch `claude/rebuild-crater-drylands-cloud`, from `claude/integration-b91c04` (b4edff31, the sky's `giant` from `SKY.legacy`, kept).
`PLAN-STATIONS.md`, "Core adoption (pair 12)", has the table. Station 1 only; every change in `src/` and `build.py`.

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
- [ ] **The N/S split and stations `south`, `edge`, `salt`.** S is station `south`, PLAN-LANDS's J7, after `biomes/savannarim` (J4-J6, not
      built) whose se-rim species it takes; the black mallee is still a proposal. The page keeps its name until `south` exists.
- [ ] **KFIRE (H3).** `core/biome/test-fire.js` proves KFIRE against this kit's `52` loaded in place; the move needs that test changed
      first (a core change: the test would take a frozen copy of `52`, or its golden grids).
- [ ] **Mounds, wadi, talus, polygon pans, tibasalt strata**: the row's kinds belong to the stations (`edge`, `salt`, `south`).
- [ ] **A core finding (korona's too):** `core/terrain/43-core-ground.js` reads the eye uniform three r128 leaves at 0 on a Lambert material;
      it should use `kEye` (KHOOK.EYE). This page redirects the name in its own header (`KG_EYE`, 84) until then.

**What the GPU verify should look at** (`verify.py dist/crater-drylands.html --assert --all-views`; nothing here ran on a GPU):
- the error panel and `KHOOK.checkPrograms` on the ground: its program is the hand-written hook plus KGROUND's layer, five KGROUND samplers
  beside the map, detail, two granites, carpet, fire map and the burn (for the live fire), plus the horizon: about 13 units, 14 with `?shadow=1`;
- the ground's look against `?kground=0` (the char's darkness and ash, the soil's warmth, the washes, the tiling at 60-300 m);
- the far trees on 'From afar' against `?diet=0` (their brightness: tune `IMP_GAIN` / `?impgain=`; a burnt far tree must still read black);
- the far field's colour at the map's edge and the horizon's shadows by the kopjes; the height fog's density (falloff 1/700);
- the dust: none at load in calm air, the storm on the air select; `?shadow=1` once for its cost;
- the attach audit: the limbs' collars should take nothing away; any floater it reports is this kit's (no other kit is on the page);
- the budgets: `showcase` (18.5M tris, 120 calls) was measured before the impostors and the far field.

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

- [ ] **The Koppen classes are an estimate** (BSh .6, BWh .25, Aw .15). The scale model's climate rasters were not
  read for this kit; take the two regions' real class shares (and their pressure and rain) from the scale model with
  `tools/scale-model/extract_region.py` before the kit goes into an open world.
- [ ] **Not slotted into an open world.** `openworld/little-demo` is the eastern desert. A world that takes this kit
  calls `CRATERDRY.fireHistory` over its region once (a 20 m grid) or binds an age field of its own.
- [x] **Catalog fruit (2026-10-06).** The frill-tree's fireseed (`generic_fruit_fireseed`: three seeds in every living
  pod near the camera, and spilled on the ash round a snag burst in the last year) and the parasol pine's cones
  (`generic_fruit_parasol_pine`: hanging under the branch-tip tufts and fallen under the crown) are drawn, placed by a
  hash of the tree so no other tree moved; the yucca and the Joshua tree take the shared roasted-stalk piece
  (`generic_fruit_yucca`, its flowers drawn as before). The probe checks it (`fruit tagged, catalogued and drawn`).
  Nectar (mallee, tree aloe, pincushion), the pillar's pith and the jade's leaves are named in the tags, not catalogued.
- [ ] **No fauna, no Scyvoi.** The owner's plan puts all fauna in one fauna kit (`biomes/README.md`); the Scyvoi's
  theropod mounts, fire-chasing birds and the beetles that breed in fresh char belong there. A Scyvoi camp on a kopje
  is a settlement, not part of a biome.

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

- [ ] **F arms a fire, not the walk.** The camera, loop, panel and probe are core/host's (`src/99-host-take.js` hands the
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

