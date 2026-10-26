# biomes/cut: known issues

What the first build (2026-10-26) left open, against `PLAN.md`. `- [ ]` open, `- [x]` closed.

## The warp

- [ ] **Straight ranks reach only the natives.** The hyperbamboo's sprays go in two ranks (180 degrees) where s > .5 and the
  rankgrass is ruled in rows; the read-in kits' phyllotaxis (nwlowlands' crowns) is theirs and unchanged. The plan's way is a
  `ranked` habit flag on their builders: an edit to `biomes/nwlowlands`, not this kit's.
- [ ] **Echoes are the hyperbamboo's only.** 2% of the culms where s > .6 have a faint additive copy at dusk; the read-in trees
  and the rankgrass have none (a copy of a read-in tree's span into an echo bucket is the way: 46's span already knows it).
- [ ] **Bites take a read-in crown's foliage, not its trunk.** Inside the bite's sphere the instanced leaves are removed and the
  limbs show through; trunks are left whole (a cut trunk would leave its crown floating). The plan's "the rings showing" on a
  bitten trunk and the bitten boulders (`36-core-carve.js` is listed for them) are not drawn.
- [ ] **The read-in kits draw from their own streams** (`BIO.fn.rng`, a sequential stream), not KRAND per cell: the warp's own
  draws are keyed by position, but which trees stand where is the read-in kit's and moves if its order changes.
- [ ] **nwlowlands' crops at the warp's fixed sizes** (`PLAN.md` section 7): not done (no crop is drawn on these stations).

## The ground and the water

- [ ] **The lower lake is drawn ~220 km2** against the 4.22 model's 497 km2: on the smooth floor a pit that large reaches the
  upper lake's shore (`41-cut-field.js`, PIT). The upper lake is ~2,050 km2 against 2,663.
- [ ] **The strata module has not landed** (`core/terrain/STRATA-PLAN.md`): the face's beds are `rock.cut.polished`'s own, level,
  not the Wall's real beds at their real dip.
- [ ] **The far ground is coarse** (200 x 70 vertices across the whole bowl, vertex-coloured by height): fine from the stations'
  views, plain from the air.
- [ ] **The day of PLAN.md section 6** (fog on the lakes at dawn, cloud on the walls by noon, a storm most afternoons, cold air
  pooling at night) is the weather selector's to show (`ATMOS.bindWeather`, mode 'clear' at load); nothing schedules it yet.
  The hyperbamboo's shade cooling its understorey is not modelled.

## People and places

- [ ] **Dilihan is not drawn** from the wall station: `settlements/dilihan` is not built. When it is, its plan switches to read
  this kit (C6) and the wall's "down the crater mouth" view can show it.
- [ ] **The measure melon has no catalog fruit** (`biomes/FRUIT.md`): it needs a `generic_fruit_measure_melon` in
  `kits/catalog/krator-master-furniture-generic-fruit.js` (three sizes and the stuck one). The harvest record says so.
- [ ] **LORE.md §6.2's wording** ("the bottom of the sphere", the orbital reading and the air column: `PLAN.md` section 11) is to be
  edited on `main`; the lore file is not this kit's.
- [ ] **The exchanges with the crater drylands and the northern highlands** (`PLAN.md` section 12, agreed 2026-10-26): eight
  species, two each way, for the final biome rebuild (the crater drylands' northern region only). Not built.
- [ ] **The gallery**: a new biome goes in it when it first reaches `main` (left to the session that merges it).

## The probe and the read-in kits

- [x] **Warped trees left their registered volumes behind** (20 empty paperbark volumes at the first verify): the warp now moves
  and widens each tree's volume with it (`CUT.warpKit`'s `adjust`, `88-host-build.js`), and drops the volume of a tree the kit
  registered but drew nothing of.
- [ ] **The face station leaves out nhighlands' burn snags** (`nhlDeny`): four far snags on the page's west corner were bare
  trunks the probe could not find in their volumes. The plan asks for the old mountain's normal forest, so nothing is lost; a
  station that wants a burn must look at why a far snag reads empty.

## Budgets

- [x] **The culms were 21M triangles held** at the first build (one dense mesh at every range): three LOD tiers (near 350 m in
  full, mid to 1,200 m with two rows an internode, far one row) and sprays thinning with distance bring station 1 to ~9.3M held,
  3-4M drawn. The budget is swbay's ceiling, 10.5M.
- [x] **The wall's melons were 186k fruit (33M triangles)**: the terrace field cut to 200 m across, a vine every 2.2 m, 1-3 fruit,
  a lighter sphere, fruit drawn within 260 m.
