# kits/tungang: known issues and the running note

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
      the fells (`fg-shieling`, `fg-cairn`, `fg-stone-sign`); the Tungang (`tg`) and Glazier (`gz`) sets.
