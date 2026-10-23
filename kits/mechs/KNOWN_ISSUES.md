# kits/mechs: known issues

`verify.py --assert` passes with nothing deferred (11 mechs, 12 builds with the Castra's two variants, seeds 1..2), z-fighting included.

## Open

- [ ] **Scale against the lore.** LORE.md calls the Empire's surviving walkers "~9 m bipeds" in "ghost-white panel"
  (and `settlements/iziz/src/74-vern-guilds.js` draws one in the Forgemaster's Hall). These ten were asked for at
  about three times a man (4.4 to 6.2 m) in steel with orange livery. Read them as the legions' line walkers, the
  great Ancient walker as something else; or settle it in LORE.md.
- [ ] **Residual z-fighting.** `KratorMechs.audit` still finds 0 to 32 triangles per mech (coplanar, overlapping,
  differently coloured), most inside other parts or a few millimetres square; the invariant fails above 40. Run
  `verify.py --eval "()=>KratorMechs.audit('iz_rota')"` to list them by bone. The usual causes, avoided in new parts:
  a joint drum as wide as its limb (MP.joint now stands 16 mm proud), two plates of one height side by side, a trim
  stripe flush with the plate it lies on, a stack of boxes meeting edge to edge with an overlap.
- [x] **The sun banner sheet is not periodic.** Fixed 2026-10-14: the owner's periodic redo of `patterns/iziz/sun-banner`
  repeats exactly (two periods each way, 2 x 1.8 m a sheet), and the runtime tiles it, so a banner of any size takes it.
- [ ] **Feathers have no texture.** They are flat triangles with no UVs; the library's `card.feather.*` would need
  UV'd quads.
- [ ] **Turning in place.** The gait has no turn: a host that spins a standing mech gets stance feet that rotate on
  the ground until the corrective steps put them back. The sheet's march turns on an arc instead.
- [ ] **No ground following beyond `ground(x, z)`.** Feet plant at the host's height; the body does not pitch to a
  slope, and a foot on a step is not checked against the swing arc.
- [ ] **Hover raycasts hit the bind pose.** three.js r128 raycasts a SkinnedMesh unskinned; the inspector is right
  for the body and approximate for legs and arms.
- [ ] **No exporter yet** (GODOT-PLAN.md rule 10). The data and the clips are data; the skin is rigid weights on a
  skeleton (Skeleton3D), the leg IK a two-bone solve (SkeletonIK3D or code), the banners a CPU flutter (a shader there).
- [x] 2026-10-20: stale entry, nothing to fix: **The tools list only `src/`.** (2026-10-20, batch 8: left open; `make_index.py` has no notion of a kit's top-level fragments and regenerating the INDEX files touches every build's INDEX.md, which other sessions have open.) `tools/make_index.py` skips this kit's top-level files (as for
  `kits/motor-vehicles`); `INDEX.md` is hand-written and `PORT.md` keeps them under "Notes".

## Closed

- 2026-10-20: tags per variant. An entry may declare `variantTags: [{}, { weapon: [...] }]`, keys replacing the mech's `tags` for that variant (`KratorMechs.tagsOf(key, v)`, `userData.tags`, and `list()[i].variantTags`). The Castra's Supply Train carries `weapon: []` (the Road Camp keeps its ballista), and `verify.py` accepts an empty weapon list only where the variant's `data.weapon` reads 'none'.
- 2026-10-05: the texture gaps. The owner generated `metal.painted.chipped` (the livery: paint chipped to steel, which
  the shader shows as bare metal where the map is dark), `metal.joint.greasy` (joints and pistons), `hair.crest` (the
  crests) and `patterns/iziz/sun-banner` (the sun flags); batch `tools/textures/batches/chatgpt-2026-10g-mechs.json`.
- 2026-10-05: the Castra's ballista passed through its awning's valance; the turntable is on the roof now and the
  awning stops short of it.
