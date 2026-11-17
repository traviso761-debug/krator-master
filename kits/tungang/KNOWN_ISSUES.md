# kits/tungang: known issues and the running note

## Done (2026-11-16, town-scale Fellgang pieces & host walk/doors/steps: `settlements/blakhed` step B2 & B6)

- **10 town-scale Fellgang buildings** (`src/58-fg-town.js`, `TG.fg.BOX` 14 -> 24 keys, seeds 9151-9160): `fg-doublehall` (both
  customs under one roof: rope wall + tally board), `fg-halting-house` (inn), `fg-markethall`, `fg-booth`, `fg-ropewalk` (44 m
  range), `fg-great-icehouse` (5-tier vaulted store), `fg-smithy`, `fg-tannery`, `fg-granary` (staddle piers) and `fg-fair-stand`.
- **4 road, Fair and Stairhead pieces** (`src/60-fg-road.js`, seeds 9161-9164): `fg-stair-hoist`, `fg-fair-hurdle`, `fg-cairn`
  (peace stone & fell cairn) and `fg-stone-sign`.
- **Host walk, operable doors and threshold steps** (`src/80-fg-host.js`, `tungang_bundle.py`): `TG.fg.draw` opt-in `o.walk`
  (`KWALK`/`KWALKBOX`), `o.doors` (`KDOOR`/`KDOORHOST` instanced plate leaves), `o.steps` (drystone threshold flights on slopes),
  `o.furnish === false` skip, and `'jobs'` added to `tungang_bundle.py` `FURN_CULTURES`.

## Done (2026-11-16, the Glazier set: `PLAN.md` sections 1.4, 3.4)

- **The owner's choices (2026-11-16):** build the Glaziers on the Fellgang foundation here, not on the Tungang set (which is on
  Loj Twenny's branch, `claude/loj-twenny-059a5e`, unmerged); the culture id `glazier` opt-in (`core/tags/glazier/`, no other
  page changes); the Glaziers' own pieces drawn in the kit for now (the catalog culture file owed, below); all of section 3.4
  and a sample hold.
- **13 defs** (`src/62-67`, keys `gz-*`, seeds 9401-9426): the homes poor to rich (`gz-cell`, `gz-front`, `gz-house`), the loj's
  rooms (`gz-tea-hall`, `gz-register-room`, `gz-monks-house`, `gz-wheel-walk`), the works and ways (`gz-glass-shop`, `gz-adit`,
  `gz-vein-gallery`, `gz-dark-adit`, `gz-lotus-pond`, `gz-stair`). Each a front plus a **void plan** (`TG.gz.plan`), the one
  source: the rock is carved from it, the builder draws from it, core/walk takes its floors. Three states: kept, worn, abandoned.
- **The rock on the sheet** (`src/91z-gz-sheet.js`): each Glazier row stands in a block of rock carved from its sites' plans
  (KCAVERN, `core/terrain/39-core-cavern.js`, drawn by `host/39e`); the cut-away opens it 2.2 m over every void's own floor
  (`core/terrain/host/39h-core-cavern-cut.js` and its test, **taken byte for byte from Loj Twenny's branch** (87fc4c117), so
  that merge is clean). A sample scarp hold (17 sites in two steps over a tarn) laid as a world lays one.
- **The host API** (`src/84-gz-host.js`): `TG.gz.draw`, `voids`, `carve`, `proto`, `dims`, `check`; the lamps as light records
  in core/cavelight's shape.
- **The Glaziers' pieces drawn in the kit** (`PLAN.md` section 4's `glazier_*`): the moonglass lantern, the pierced brass lantern,
  the click wheel, the tea board with celadon, the carpet and bolsters, the mask rack, the steward's seat, the Register's plaque,
  the tea urn, the glass bench; the timetable, banner, benches, box beds, stoves and Xanadu's tea copper, cushions, scroll rack,
  strongbox, butter lamps and prayer wheels from the catalog (`FURN_CULTURES` + `tungang`, `xanadu`).
- **Library families** (`materials.json`, `tex/`): whitewash, the scarp's hewn basalt, gilt, carpet, celadon, enamel, potch,
  carved timber, silk.

## Done (2026-11-11, the Fellgang set: `PLAN.md` section 3.3.1)

- The kit scaffold on `core/engine` (from `kits/lizardmen`'s build, verify and head): `build.py`, `verify.py` (on
  `tools/harness.py`), `materials.json` and `tex/` (20 library families, 9 furniture detail maps; no LFS pointer in the pack),
  `PORT.md`, `INDEX.md`, `README.md` (with the Core adoption section), `API.md`.
- The 14 village buildings, keyed and boxed as riftrim's stand-ins (`TG.fg.BOX`), each within 0.5 m of its box in both states;
  the stand-ins' frame (the floor at the highest corner, the plinth to the lowest, a stepped footing on a slope); the meeting
  hall's `fowlers` and `icecut` variants; the longhouse's byre down-slope; the ice house's blocks in the cut-away.
- The road and wall pieces: `fg-fixed-line` (from the rope record), `fg-lantern-post`, `fg-wall-station`, `fg-nest-ledge`,
  `fg-burial-ledge`, `fg-halt` (keyed so for the Travellers, the owner 2026-11-11, not `fg-carry-hut`) and the optional
  `fg-wagon` (built).
- The host API (`TG.fg.draw`, `ropes`, `pieces`, `proto`, `dims`, `check`) and the sealed bundle (`tungang_bundle.py`, `TG`),
  proven in plain node (`tests/test-bundle.js`) and on the sheet.
- The `fellgang` row with the `fowling` and `ice` focuses in core/hamlet, opt-in (`core/hamlet/fellgang/`), with its test
  in `core/hamlet/test-hamlet.js` (the same digest as the borrowed `ranch` and `quarry`; negatives).

## Done (2026-11-11, round 2: the owner's "work on open issues; and make this kit look a bit less samey")

- **Variety in size and massing** (`src/42-fg-mass.js`): the stand-in box is an upper bound (65-100 % of w and d,
  75-100 % of h, never 0.5 m past); three to five massing families per house-like key (gabled, blackhouse, burstabaer,
  bow-sided, Welsh, croft with outshots, beehive cells; plate lean-to, buried container, cab porch, fir porch); roof form,
  pitch, wall height, chimney, door offset, windows and turf by seed; a village's character ('stony', 'low') from its
  focus. Sheds, pens, the ice house, the cairn house and the egg store vary in fill.
- **Walls block a walker** (`src/37-wk-rec.js`, core/walk and core/walk/box; round walls as arcs of blocks).
- **Furniture in a world's draw**: `tungang_bundle.bundle(furniture=True)` (+387 KB without textures).
- **The catalog pieces** of `PLAN.md` section 4: `fellgang_common_ice_sledge` (placed by the sledge shed), `_poor_egg_basket`
  (the egg store, the nest gear), `_common_wall_peg_rack` (the rope house), `_common_rope_wall`, `_common_tally_board`,
  `_court_deeds_wall`, `_court_horn_helmet_stand`, `_common_shell_shield_rack`, in `kits/catalog/krator-master-furniture-fellgang.js`.
- **`fg-ice-tools`**: saws, pike poles and tongs on an A-frame rack, for the Ice-cutters' stacks (`TG.fg.pieces`).
- **Triangles**: slogans and marks as quads, lighter hearths, coils, eggs, racks and courses; per-def budgets checked
  (`triangle-budget`). The sheet's Fowlers' village draws about 109k (was 160k), the riftrim Fowlers' spec 112k.


## Open

- [ ] **The daub sheet is owed** (`patterns/fellgang/daub`, `core/materials/PROMPTS-NEEDED.md` section 43): the slogans are
      block letters and the family marks six simple signs, all geometry in `'plain'` vertex colour (`40-fg-kit.js` `fgText`,
      `fgMark`). When the sheet comes, the marks (the wheel, the aurochs, handprints, tallies, the red X) go on as decals; the
      slogans' words stay the kit's own letters.
- [ ] **The all-builds rebuild for the catalog** (agreed with the coordinating session and the Tungang furniture session,
      2026-11-11): `kits/catalog/krator-master-furniture-fellgang.js` gained eight pieces and reaches 36 builds
      (`python3 tools/reach.py`). Only `kits/catalog` and `kits/interiors` were rebuilt and verified here (and their
      PORT-BASELINE rows rewritten); `kits/interiors/dist/interiors-core.js` changed with them, so `kits/ancients-interiors`
      is among the stale. The other builds and their baseline rows are left: the one big rebuild happens once, after this
      branch and `claude/tungang-furniture-4a00dd` both merge, by whoever merges second.
- [ ] **The state switch reloads the page** (`99-sheet-fg.js`): rebuilding the world in place makes the engine's geometry
      disposal log a WebGL "delete: object does not belong to this context" error per mesh (254 on the sheet). Not a quick
      fix (core/engine's `buildWorld` disposes geometry two renderers share, the skylight's capture among them): left.
- [ ] **Round walls are arcs of blocks** for the walker (`wkRing`): a walker meets the cairn house's and the egg store's
      walls as small boxes, not their curve; the beehive cells and blackhouse corners likewise.
- [ ] **check_assembly baseline entry.** `core/city/33-city-strategies.js` (taken whole, for `KCITY.prim`) calls
      `KCITY.stance` in a strategy core/hamlet never runs; the page does not load `15-city-ground.js` (it needs the city core
      before it). Recorded as one key in `tools/check_assembly_baseline.json`.
- [ ] **The Godot export** of the sheet (`core/export`) is not wired: `PLAN.md` phase T10. `core/lod` is not taken.
- [ ] **Gallery.** The kit is a new build: it goes into the Krator Worlds gallery when it first reaches `main`.
- [ ] **Not yet built** from `PLAN.md` 3.3: the bands (`fg-war-camp`, `fg-raid-cache`); Wildcat's scrap pueblo (`fg-wc-*`) is the
      wildcat-pueblo session's (the owner, 2026-11-11: a pueblo builder and ONE Chaco-sized great house for 1-2k people at most, maybe one or two small hamlets), not this branch's;
      the fells (`fg-shieling`); the Tungang (`tg`) set is on Loj Twenny's branch.
- [ ] **The Glazier catalog culture file is owed** (`kits/catalog/krator-master-furniture-glazier.js`, `PLAN.md` section 4): the
      twelve `glazier_*` pieces are drawn in the kit (`gzLantern`, `gzBrass`, `gzClick`, `gzTeaBoard`, `gzCarpet`, `gzMaskRack`,
      `gzSeat`, `gzPlaque`, `gzUrn`, `gzGlassBench`, the timetable's gilt frame), not placed through core/furnish; a culture file
      is a catalog change that reaches every furnished build, best ridden with the all-builds rebuild. The catalog's Tungang and
      Xanadu pieces in the Glaziers' rooms are at 1.0, not the Tungangs' 0.94.
- [ ] **The culture id `glazier` is opt-in** (`core/tags/glazier/52g-tags-glazier.js`): fold it into
      `core/tags/52-core-tags-vocab.js` with the next all-builds rebuild (`TODO.md`), then delete the folder and drop it from
      `build.py`.
- [ ] **The Glaziers' rock has no texture**: KCAVERN's rock is drawn in vertex colour (its occlusion), one basalt-rose tint; the
      Zeijani kit's triplanar rock shader (`kits/zeijani/src/40-zj-cave.js`) is a fork, not core. The library's `hewn` family
      (`rock.basalt.flowbanded`) dresses the builders' floors and plinths only. Owed with a core rock material for carved pages.
      The rock costs about 315k triangles on the sheet (the 13 rows' blocks and the scarp, cell 0.5 m).
- [ ] **The cholet band and the moonglass are owed textures** (`core/materials/PROMPTS-NEEDED.md`: `patterns/glazier/cholet-front`,
      `glass.moonglass`): the bands are geometry (lozenges in vertex colour) and the panes KGLASS's frosted kind until they come.
- [ ] **The Glaziers in their script and in the sim**: the plaques' numbers are Latin digits (the Register would be in Xanadu's
      syllabary, the Book in its old letters); `core/region/data/xan-tune.js` (on the sites branch) has no Glazier site yet:
      `PLAN.md` section 1.4.1 says what a later step needs.
- [ ] **The Tungang set merges here later**: Loj Twenny's `TG.tg` (its lamp code, `TG.tg.plan`, `KCITY.cavern` wall sites) and
      `TG.gz` keep the same void-plan shape, but the lamp code is written twice (`TG.tg.LAMP`, `TG.gz.LAMP`): make it one `TG.LAMP`
      when the branches meet. The Glaziers' scarp is laid by hand on the sheet; a world lays it on core/city's cavern setting
      (`KCITY.cavern`, on Loj Twenny's branch) once that is merged.
- [ ] **No opal valley flora on the scarp**: `biomes/opalvalley` (on the sites branch) has only its plan here; the sample hold
      stands on bare ground by a plain tarn plane.
- [ ] **The cut-away shows the stairs' rock as pale wedges**: KCAVERN's rock cut opens each void 2.2 m over its OWN floor, and a
      stair void's floor is its foot, so the rock over a steep stair's upper half stands as a sloped wedge in the dollhouse view
      (`core/terrain/host/39h`'s rule, seen on the scarp from above). A per-vertex floor along the flight would fix it in core.
- [ ] **The sheet's rows run past the engine's ground** (z -880 at the last Glazier row; `GROUND_SIZE` 1600): `91z-gz-sheet.js`
      carries a ground block on under them.
