# Kimr kit: known issues

- [ ] **No textures yet.** The house draws on vertex colours: the library sets `biomes/labyrinth/KIMR.md` section 4 names are not packed
  (no `materials.json`), and the new ones (`hide.pachyderm`, `shell.glyptodont`, `earth.dung.stack`, the `patterns/kimr/*` sheets) are
  owed: `core/materials/PROMPTS-archived.md`: delivered 2026-11-12, in the library, not wired yet.
- [ ] **The culture `kimr` is added to the page's core/tags vocabulary at load** (`src/89-rows.js`), not in
  `core/tags/52-core-tags-vocab.js`: that file reaches every build, so the entry rides along with the next all-builds rebuild
  (`TODO.md`). Drop the two lines then.
- [ ] **The rock is the kit's, not core/pueblo's**: `KPUEBLO` has no platform field yet (`core/pueblo/README.md`). `kmSite` draws a
  rectangular rock under the blocks' box; a platform in core/pueblo would follow the hull and carry the ledge's reach (the long ladders
  are the kit's records, outside the plan's reach graph).
- [ ] **core/pueblo is taken at the Wildcat branch's commit e070a9ecd** (`claude/wildcat-pueblo-122a57`): that branch's worktree has
  newer, uncommitted work on it (`40-pueblo-rooms.js` and changes to 10-30). Merge that branch's later commits when they land.
- [ ] **Every roof has a hatch** (core/pueblo gives each column one): a real pueblo's roofs have fewer. A kit-side thinning would break
  the plan's reach graph; ask the core/pueblo owner.
- [ ] **In the sealed bundle (`KMK`) the hides hang still**: the engine's clock (`core/engine/93-anim.js`) is the kit page's own, so
  no host ticks `ANIMU.uTime`; and the bundle renames the flutter's `uWind` to `uSvWind` (core/atmos's cloud shading declares a
  `vec2 uWind` in every scene material: `kit_bundle.py` SUBST). A host that wants the flutter needs an `ANIMU` tick in the API.
- [ ] **No walker**: the terraces and ladders are not `core/walk` strips yet.
