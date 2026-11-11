# kits/extraplanar: known issues

`- [ ]` open, `- [x]` done. `build.py` lists the open ones.

- [ ] **No dormant pose.** A hunter has one behaviour: it hunts (idle, walk, the attack). A Stilter standing dead in a square until
  it wakes (as the valley's robots want a dormant pose too) is not built; the host leaves it idle.
- [ ] **The robots and the mutants do not take the silhouette set yet.** `API.md` "The far tier" is the contract; `kits/mechs`'
  `ancient` culture (`an_tripod` -> `tripod`, `an_shroud` -> `tallwalker`) and the mutants' kit would declare `silhouette: { set, h }`
  and draw `KratorExtraplanar.far` past their far distance. Until then only the hunters' cards exist (the demo page shows them
  behind the lanes).
- [ ] **The gaze is a rod the host flies.** `projectile('gaze')` is a 4 m glow rod; the valley flies it as it flies the robots'
  `beam` (`fire` event, speed 120). No hit test, no scorch: the host's.
- [ ] **A phenomenon's weather is baked where it is drawn.** The mist and the plume are `core/atmos` sprite sets parented to the
  group, so they drift with a wanderer, but their wind term reads the group's local position: a plume far from the origin leans a
  little differently from the page's chimneys. `ATMOS.glowAdd` is placed at the record's `at` (the glow registry is static), not
  where a wanderer has drifted.
- [ ] **No textures of their own.** The hunters are vertex colours under the mechs' detail maps when a host passes them
  (`useTextures`, the valley's mechs set); the demo passes none. A bone set (matte, scoured) would suit the Stilter and the
  drowned arch; ask the owner before adding a row to `core/materials/PROMPTS-NEEDED.md`.
- [ ] **`reset(group)` plants the feet at the group's height.** The mechs runtime's `reset` takes no ground function; on uneven
  ground build afresh or let the first `update(dt, { ground })` plant the feet (`verify.py` does the former).
- [x] The records' `tintAt` test looked a point 200 m from a solid whose `tintR` can reach 260 m: the test now looks 900 m off
  (2026-11-09).
