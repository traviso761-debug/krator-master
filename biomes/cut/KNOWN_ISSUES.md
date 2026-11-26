# biomes/cut: known issues

What the first build (2026-10-26) left open, against `PLAN.md`. `- [ ]` open, `- [x]` closed.

## The final rebuild (pair 10, 2026-11-04; `PLAN.md`, "Core adoption (pair 10)")

- [ ] **Verified in software GL only** (a cloud session, no GPU): `verify.py --assert` on each page with two or three views (the numbers are in
  `HANDOFF-REBUILD.md`'s pair-10 paragraph). Owed on the GPU: `--assert --all-views` on the three pages, and the look pass below.
- [ ] **The owner's eye** (each behind its switch, so both can be compared):
  - the face as **megabreccia sawn and polished** (the bake's `impact` province) against the first build's level beds (`?strata=0`);
  - the dawn **mist on the lake** and the **cloud band on the walls** (height fog; the weather selector and the hour slider show them);
  - the **creek's water and its plume** into the lake (`?plume=0`);
  - the far bowl on **KFAR** (`?kfar=0` the old skirt) and the walls' shadow across the floor at a low sun (KHORIZON, `?horizon=0`);
  - the ground's layers on **KGROUND** (`?kground=0` the old mix);
  - **the bend** (KWARP, `?bend=1`, off at load): whether the field should be felt at all, and how strongly (`STAGE.bendA`, .45 m);
  - the **rowans** of exchange 5 (few: the four past the face's lip, in the plan's ring, with the stuck fruit; a station on the upper walls' gullies would
    show it properly) and the **great trumpets** in the wall's ravine (no organ-pipe ranks at s .2).
- [x] **The sun's shadows (KSHADOW) are attached off**: the owner wants them toggleable and off by default, and core/shadow has no off-at-load switch
  yet, so the page attaches them only on `?shadow=1`. When core gains the switch, move onto it. Their cost on these pages is not timed (no GPU).
  **Closed 2026-11-08:** `89zz-host-shadow.js` attaches always on core/shadow's own switch (the Throne's way): off at load, core's panel button or
  `?shadow=1` turns it on, `?shadow=0` none of it. Their cost is still not timed.
- [ ] **KHORIZON darkens the face's ground** (the broken crest past the lip: a pixel 39 -> 16 in the start view, software GL) when the ground's material
  takes it, while the bake reads sky .93 and the sun unblocked there (a node replay of the face's bake) and station 1's and the wall's grounds shade
  normally. The face is the cold station (snow cover's hook on its ground), the likeliest difference. Until it is diagnosed on the GPU the face keeps
  its ground out of the horizon (`STAGE.horizon:'scene'`; the flora and the rock take it); `?horizon=all` puts it back, `?horizon=ground` alone.
- [ ] **Exchanges 1 and 2** (the tree aloe and the parasol pine, read in place from the crater drylands): wait for the crater drylands' turn (pair 12)
  and its shared sky; the wall station's `station.json` gains its kit then.
- [x] **The face's polished grain** is `rock.megabreccia.polished` (delivered 2026-11-10: a sawn and polished slab, normalised to its mean), in place
  of `rock.megabreccia`'s weathered face. Two clasts carry a hairline crack the prompt ruled out; too small to redo for. The grain is
  read through the core hex-cell dither (`BIO.DITHER`'s `kdither`, `31-core-dither.js` now in `CORE_BIOME`), so the 3 m tile no longer
  repeats in rows across the face from afar (the owner, 2026-11-10).

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
- [x] **The strata module has not landed** (`core/terrain/STRATA-PLAN.md`): the face's beds were `rock.cut.polished`'s own, level. It has: since
  pair 10 the face is KSTRATA's megabreccia (the bake's `impact` province at the lip), `?strata=0` the old beds.
- [ ] **The far ground is coarse** (200 x 70 vertices across the whole bowl, vertex-coloured by height): fine from the stations'
  views, plain from the air. Pair 10 moved it onto KFAR (37k vertices, 250 m cells near the page growing 4.5% a line); still vertex colour only,
  and no planet's curvature (the sky's ridges, cast from the same bowl, have none either).
- [ ] **The day of PLAN.md section 6** (fog on the lakes at dawn, cloud on the walls by noon, a storm most afternoons, cold air
  pooling at night) is the weather selector's to show (`ATMOS.bindWeather`, mode 'clear' at load); nothing schedules it yet.
  The hyperbamboo's shade cooling its understorey is not modelled. Since pair 10 the height fog draws the dawn mist on the lake and the floor's
  hollows and a cloud band on the walls (with the hour), but nothing schedules the afternoon storms.

## People and places

- [ ] **Dilihan is not drawn** from the wall station: `settlements/dilihan` is not built. When it is, its plan switches to read
  this kit (C6) and the wall's "down the crater mouth" view can show it.
- [ ] **The measure melon has no catalog fruit** (`biomes/FRUIT.md`): it needs a `generic_fruit_measure_melon` in
  `kits/catalog/krator-master-furniture-generic-fruit.js` (three sizes and the stuck one). The harvest record says so.
- [ ] **LORE.md §6.2's wording** ("the bottom of the sphere", the orbital reading and the air column: `PLAN.md` section 11) is to be
  edited on `main`; the lore file is not this kit's.
- [ ] **The exchanges with the crater drylands and the northern highlands** (`PLAN.md` section 12, agreed 2026-10-26): eight
  species, two each way, for the final biome rebuild (the crater drylands' northern region only). 7 and 8 are built on nhighlands (pair 7), 5 and 6
  here (pair 10: the rowan on the face with its stuck fruit, the great trumpet in the wall's ravine); 1 to 4 wait for the crater drylands (pair 12).
- [ ] **The gallery**: a new biome goes in it when it first reaches `main` (left to the session that merges it).

## The probe and the read-in kits

- [x] **Warped trees left their registered volumes behind** (20 empty paperbark volumes at the first verify): the warp now moves
  and widens each tree's volume with it (`CUT.warpKit`'s `adjust`, `88-host-build.js`), and drops the volume of a tree the kit
  registered but drew nothing of.
- [ ] **The face station leaves out nhighlands' burn snags** (`nhlDeny`): four far snags on the page's west corner were bare
  trunks the probe could not find in their volumes. The plan asks for the old mountain's normal forest, so nothing is lost; a
  station that wants a burn must look at why a far snag reads empty.

## Budgets

- [x] **The hyperbamboo's sprays switched LOD apart from their culms** (the core guard's one LOD key per tree: 43%, 57% in the handoff's audit):
  each spray tier now switches at its culm tier's distances (pair 10).
- [x] **The creek's bed was dry** (carved in the ground, no water drawn): a `WATER.flow` since pair 10, with its plume into the lake and no read-in
  tree in it.

- [x] **The culms were 21M triangles held** at the first build (one dense mesh at every range): three LOD tiers (near 350 m in
  full, mid to 1,200 m with two rows an internode, far one row) and sprays thinning with distance bring station 1 to ~9.3M held,
  3-4M drawn. The budget is swbay's ceiling, 10.5M.
- [x] **The wall's melons were 186k fruit (33M triangles)**: the terrace field cut to 200 m across, a vine every 2.2 m, 1-3 fruit,
  a lighter sphere, fruit drawn within 260 m.
