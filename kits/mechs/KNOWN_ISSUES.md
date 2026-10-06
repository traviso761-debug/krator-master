# kits/mechs: known issues

`verify.py --assert` passes with nothing deferred (10 mechs, 11 variants, seeds 1..2), z-fighting included.

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
- [ ] **The sun banner sheet is not periodic.** `patterns/iziz/sun-banner` (generated) does not repeat exactly; banners
  show a window from the middle of one tile (no wrap), so a banner wider than 1.8 m or taller than 1.3 m would clamp.
- [ ] **Feathers have no texture.** They are flat triangles with no UVs; the library's `card.feather.*` would need
  UV'd quads.
- [ ] **Turning in place.** The gait has no turn: a host that spins a standing mech gets stance feet that rotate on
  the ground until the corrective steps put them back. The sheet's march turns on an arc instead.
- [ ] **No ground following beyond `ground(x, z)`.** Feet plant at the host's height; the body does not pitch to a
  slope, and a foot on a step is not checked against the swing arc.
- [ ] **Hover raycasts hit the bind pose.** three.js r128 raycasts a SkinnedMesh unskinned; the inspector is right
  for the body and approximate for legs and arms.
- [ ] **Tags are per mech, not per variant.** The Supply Train Castra carries no ballista but its entry's tags still
  say `weapon: ['ballista']`; its data (`dataOf('iz_castra', 1).weapon`) and its clip say what it does.
- [ ] **No exporter yet** (GODOT-PLAN.md rule 10). The data and the clips are data; the skin is rigid weights on a
  skeleton (Skeleton3D), the leg IK a two-bone solve (SkeletonIK3D or code), the banners a CPU flutter (a shader there).
- [ ] **The tools list only `src/`.** `tools/make_index.py` skips this kit's top-level files (as for
  `kits/motor-vehicles`); `INDEX.md` is hand-written and `PORT.md` keeps them under "Notes".

## Closed

- 2026-10-05: the texture gaps. The owner generated `metal.painted.chipped` (the livery: paint chipped to steel, which
  the shader shows as bare metal where the map is dark), `metal.joint.greasy` (joints and pistons), `hair.crest` (the
  crests) and `patterns/iziz/sun-banner` (the sun flags); batch `tools/textures/batches/chatgpt-2026-10g-mechs.json`.
- 2026-10-05: the Castra's ballista passed through its awning's valance; the turntable is on the roof now and the
  awning stops short of it.
