# Krator Ancients — known issues

`- [ ]` items are printed by `build.py` on every build. Close one by fixing it
and ticking it, not by deleting it.

## Found by the split (pre-existing in the single-file kit)

- [x] **Seed collision: Library and Campus.** FIXED (civic QA, 2026-09-29): `buildCampus` is `reseed(9810+d)`; the build.py exception is gone.
      Was: `buildLibrary` calls
      `reseed(d>0?9801:9800)` and `buildCampus` calls `reseed(9800+d)`, so the
      two share a PRNG stream: the campus's decay pattern is a copy of the
      library's. Fix by moving the campus to a free block (9810). Whitelisted in
      `build.py: SEED_COLLISION_EXCEPTIONS` so the build stays green; remove the
      entry with the fix. Not fixed in the split round because it changes output.
- [x] **Seed collision: Megastructure and Gate.** FIXED (civic QA): `buildArc` is `reseed(9820+d)`; exception gone.
      Was: `buildMega` uses `9995+d` and
      `buildArc` uses `9996+d`; they overlap at 9996. Same treatment — move the
      Gate to 9990 or push Mega down. Also whitelisted.
- [x] ~~Materials built inline instead of in `MAT`.~~ The bunker berm, House F's
      slope, the campus hill, the mega's root mound, the dam's spillway sheet and
      the kit's `slab` now use `MAT.mud/.turf/.rock/.spray/.slab`. They were flat
      untextured colour and washed out badly once the lighting had real roughness
      to work with. A few inline materials remain in ruin-only one-offs.
- [ ] **`build.py` cannot check syntax.** `node` is not installed on this
      machine, so `node --check` never runs. `build.py` says so instead of
      claiming "syntax OK". The only syntax check this project actually has is
      `verify.py` reading the on-screen error panel — always run it.

## The Flatiron

- [x] `src/66b-flatiron.js`: a wedge-plan tower -- rounded prow, broad transom,
      stepped setbacks, cells and glazing on every level, lit galleries every
      fourth setback, an entrance colonnade on the transom, and a crowned top.
      Sized from one rule: width grows 0.536 per unit of length, a 15-degree
      taper each side, which is what lets it sit exactly on an acute corner
      instead of overhanging both edges of it. Designed for the Screamers'
      Hexahedron and brought back here intact as a type in its own right.
- [ ] Decay 2 shortens it but does not topple it, unlike the other towers.

## The Hotel — what was overhanging what

- [x] ~~**The sky-lobby lens floated 59 m up over the pool deck.**~~ A 44 m
      glass dome placed at local `z = R*.3-R*.7+10 = -26`, which is 20 m clear
      of the inner edge of the top slab with nothing whatever under it. It
      survived because **both of this type's camera presets looked at the
      convex face**, and from the south the building is directly behind the
      lens, so it appears to sit on the roof. It now stands on a drum on the
      mid-radius of the highest surviving slab, sized to fit it.
- [x] ~~**Thirty-six ten-metre hedges hung in mid-air.**~~ The garden planters
      on every even terrace sat at `R-depth(f)-4`, four metres inboard of the
      inner edge of the very slab they stand on, the highest of them 50 m up.
- [x] ~~**Every back wall was detached from the terrace above it.**~~ The wall
      of storey f stood at `R-depth(f)+1` and the slab over it began at
      `R-depth(f)+1.9`, so each wall head finished 0.9 m short of what it was
      meant to carry — a continuous open slot, 165 m of arc, on thirteen
      storeys — and the 1 m of slab inboard of the wall was a lip over that
      slot. The three radii are now one chain (`wallR`, `deckR`): a wall stands
      on its own slab, the slab above laps 1.2 m over it, and the 3.1 m of
      terrace that leaves carries a parapet and the planters.
- [x] ~~**In the ruin a storey could survive with its support gone.**~~ `gone`
      was rolled independently per level, so 14 could stand on nothing with 13
      missing. One `cutTop` now takes everything above it.
- [x] ~~**The court elevation was thirteen storeys of blank brick.**~~ The
      convex face has a full curtain wall and the concave one had not one
      opening. 24 windows a storey.
- [ ] **The lens is now too small for the idea.** A sky lobby on a 165 m
      crescent wants a long pavilion following the arc, not a 14 m cupola; the
      top slab is only 12 m deep, which is all a 1.9 m setback per storey can
      ever leave, so a dome is the wrong form for the space available.
- [ ] The porte-cochère canopy is 40 x 24 m on four converging legs at r=14 —
      a 20 m cantilever. Deliberate-looking, but it is the next thing on this
      type that will not stand up.
- [ ] The two lift towers at the horns are blank cones with no openings and no
      top, and they read as cooling towers.
- [ ] The pool deck is a bare 130 m disc and the crescent sits at the back of
      it. It is the largest single surface in the type and carries one pool.

## Non-ground placement

- [x] `buildSkyE` and `buildSkyF` take `gy` (lift the whole tower), `noPlinth`
      (skip the ground plinth, apron and figures) and `hcut` (decay 1 cuts the
      body at that fraction of H instead of 0.8). `kput` adds all three
      components of `KOFF` and `bodyGroup` already routes instanced pieces
      through `useGroupXF`, so lifting both `KOFF` and the group moves merged
      meshes and instances together. `src/70b-perch.js` is the worked example:
      a fluted podium 90 m tall carrying a Skyscraper E with no plinth of its
      own, and a half-height ruined Skyscraper F on a lower shoulder.
- [ ] Only these two builders take the parameters. The other 31 still assume
      the ground, and several call `skyPlinth`/`apron` unconditionally.

## The Project (skyscraper A, decay 4) and the night state

- [x] ~~There is no variant of a tower a later people reoccupied WHOLE.~~
      `skyA` decay 4, sited by `ROWS.skyA.j` and gated by `ROWS.skyA.ds`, so no
      other builder is ever called with 4. Level 3's reduced hole density, the
      same shared `repairPass`, full height with its crown strut ring, and no
      cyan anywhere on it. 146 010 triangles of a 400 000 ceiling.
- [x] ~~There is no day/night or scene-state toggle in this kit.~~ A VIEWS
      preset may now carry a **seventh element**; truthy means night.
      `setView` is the only route into a view that anything uses, so the select,
      the button list `verify.py` clicks and `--all-views` all get it free, with
      no second control to keep in sync. `n` toggles by hand. Night is four
      light changes, one sky uniform, the fog colour and three `.visible`
      flags — nothing is rebuilt, because the fire is baked geometry on unlit
      materials in its own InstancedMeshes (`FIREKIT`).
- [x] ~~A 50% scatter of lit windows reads as dither.~~ `fireTerritories` /
      `fireBurns` in `src/69-mat-salvage.js`: twenty seeded rectangles over
      (bay, storey), frayed at their edges by an fbm. Counted rather than
      asserted — `window._projectFire` reports **1 111 of 2 284 cells, 49%**,
      which `verify.py` prints in its counters line.
- [ ] **The fire does not light anything.** It is emissive cards and additive
      spill; there is no point light, so the fabric around a window is lit by
      the night hemisphere and not by the fire in it. One `PointLight` per
      territory would fix it and would cost a shader recompile for the whole
      scene, which is why it was not done. Same root cause as the kit-wide
      "lit windows cannot out-shine a sunlit wall" complaint, from the other end.
- [ ] **The fires do not flicker and never will without an animation hook.**
      Nothing in this kit animates.
- [x] ~~Projects D and H had builder code but no rows or presets.~~ Rows at
      `j=-1150` with `ds:[0,1,2,3,4]`; presets `Project D`/`Project H`, each with
      `at night` and `close`. Fire coverage (`window._projectFire`): A 1 111 of
      2 284 cells (49%), D 430 of 727 (59%), H 376 of 560 (67%). D and H burn
      hotter than the 50% the brief asked for.
- [ ] The Project's plinth can only come in to 110 because the 24 splayed
      struts land at r=98 (see below). It is still the loosest podium of the
      eight.

## Plinths — the skyscraper podium pass

Measured from what actually stands on each podium, then rendered to confirm the
column ring, the cornice ring, the apron and the moss/rubble/tree rings moved
with it. Everything inside `skyPlinth` derives from `R`, so all of that follows
one number; the risk was per-builder decor written OUTSIDE it, and there was
exactly one instance (see the Skyscraper G item).

| | was | now | what sets the floor |
|---|---|---|---|
| A | 120 | 110 | 24 splayed struts land at r=98 |
| B | 110 | 82 | twelve legs at r=70, columns 4.5 wide |
| C | 115 | 96 | three hyperboloid legs at r=62, ~24 wide at the foot |
| D | 110 | 48 | nothing but the shell: 34 at the superellipse corners |
| E | 105 | 48 | the lens is 68 across, its edge fins add 3 |
| F | 105 | 48 | widest tray 38.4 (registered volume 120 → 56) |
| G | 130 | 130 | genuinely full — see below |
| H | 110 | 56 | keep 43.5 at the corners, lowest setback ledge 45 |

- [x] ~~**Skyscraper G's podium bar floated.**~~ 240 m long at z=90, so its ends
      were at r=150 — 20 m outside a 130 m podium — with its underside at y=5,
      the podium's top. Both ends hung five metres clear of the apron. This is
      exactly the hardcoded per-builder podium decor that does NOT follow `R`.
      It starts at the ground now and rises through the podium.
- [ ] **Skyscraper G cannot shrink.** Its block stack's outer stilts stand at
      (115, 30) and the block corners reach r=127.6, so `skyPlinth`'s column
      ring at `R*.93` is already grazing them at R=130. Coming in means moving
      the stack, which is the building.
- [ ] **A, B and C are limited by their own legs, not by their podiums.** If
      the splay were allowed to come in — A's struts from 98, B's legs from 70,
      C's from 62 — those three podiums could halve like the other five did.
      That is a change to the buildings' stance and was not taken unasked.
- [ ] `figures()` at the foot of each tower is now placed at `-PR, PR*1.28`
      rather than at a hardcoded `-100, 130`, so the crowd follows the podium.
      Nothing else in the eight builders referenced a plinth radius.

## Budgets

Budgets are a target, not a gate (this is a showcase). `verify.py` reports an
exceeded ceiling as `OVER`; `--strict-budget` makes it fail.

- [x] ~~**Scene triangles over 6M again: 6 242 534.**~~ **5 346 054** — under the
      ceiling with 654 000 to spare, and nothing was deleted to get there. The
      Perch, the Flatiron and every other type are all still in the showcase;
      the saving is entirely the shared-geometry pass (leaf card, `moss` at
      detail 0, the plain `postW`). The showcase had been over budget because
      its foliage cost eighty triangles a blob, not because it had too much in
      it.
- [x] ~~Scene triangles over 6M.~~ 6 015 160 → **5 757 024**, under the ceiling.
      Theodiga moving to its own target accounts for most of it; the rest is
      dead geometry removed from Skyscraper F (see NOTES).
- [x] ~~Draw calls over 900.~~ Worst view **1129 → 615** (`Robotics factory`)
      across rounds 2–3, against a 900 ceiling; opening view 770 → 507. Every
      view measured is under. Got there by merging per-storey geometry in
      Skyscraper B/F, Apartments, Hotel, Lab, Skyscraper D and both Offices.
- [ ] **Further draw-call headroom, if it is ever wanted.** The builders that
      still emit the most meshes are `fac` (109) and `skyD/0` (30);
      `verify.py --assert` prints the per-type mesh counts, which is the list to
      work down. Note the ~50 kit InstancedMeshes are `frustumCulled = false`
      and always draw, so about 50 calls are a floor merging cannot reach.

## Dalab (`--target dalab`)

- [ ] **The great dome's size is a guess.** "Wider and taller than the Voth
      palace" needs that project's dimensions; built at DR=110 / DH=95 and
      rescalable by those two constants alone.
- [ ] Room fit-out inside the section is legible but small — beds and benches
      read as blocks at any distance. Wants a closer preset or larger fittings.
- [ ] Only the domes exist. Mounds, settlements, streets, embassies, the Halls
      of Reformation and the life layer are all still to do.

## Veladiga (`--target veladiga`)

- [x] ~~Piers read flatter than the sheets.~~ They are now swept from a five-point
      X section whose half-width follows the bay opening and whose projection
      peaks at the springing, so they splay toward the foot as the sheets draw.
- [x] ~~The city-centre wheel reads as a cluster of blocks.~~ Removed from
      Veladiga at the user's direction and rebuilt at its own scale as the
      Cultural centre in the kit and repaired targets (`src/67-cultural.js`).
- [x] ~~The park downstream is a flat plane.~~ Seven terraces and a tailrace
      channel, both driven off one parameterisation of z (see NOTES round 10).
- [x] ~~The span did not contain the water.~~ 129-219 m of open canyon at each
      abutment; arc radius 760 to 1000 at A=1.0 rad closes it against rock at
      759-841 m.
- [x] ~~Floating polygons at the crest.~~ The highway band sat 16 m above the
      deck and the promenade blocks stood 34 m clear of the downstream face. The
      deck is now a real corbelled cantilever out to ~96 m and carries both.
- [x] ~~The floor plates spanned the breach as full-width shelves.~~ Each level
      now keeps only a ragged, drooping stub off each edge, sized in metres
      (2.5-16 m) rather than as a fraction of the tear width, with whole levels
      missing where the plate went clean.
- [ ] The breach tear is driven by `fbm` on a fixed axis, so the rip widens with
      height but does not undercut -- a real failure would scallop back under
      the crest on both sides of the notch.
- [ ] The scour plume downstream is a Gaussian widening with distance. It reads,
      but it does not braid or deposit a bar, and it ignores the terrace steps
      it cuts through.

## Hexahedron (`--target hexahedron`)

- [x] ~~The two pyramids are turned 60 deg, not 120.~~ Superseded: the two
      plans now share a base vertex with each base lying along the other's leg,
      verified numerically (collinear to a dot product of 1.000000, closest
      distinct tips 482 m apart).
- [x] ~~The apex is a sharp point.~~ It is a ridge, with the cultural centre
      running along it as elevation 3 draws.
- [x] ~~The upper apex cantilevers past the ground works with nothing under it.~~
      Not a defect: the supports cluster on the computed centre of mass, and
      in-world the structure is reinforced with long-lost carbon nanomaterials,
      so the imbalance is intended and held.
- [x] ~~Both pyramids were open shells.~~ Great soffit under the upper city,
      deck over the lower city, floor to the lower truncation, and the summit
      closes to a point. Both new faces are dressed rather than left blank.
- [ ] `RUINS` greens the ground under `+r.s` in every target except hexahedron,
      while the intact site is built at `-r.s`. The greening lands on the empty
      mirror position. Fixed only in `targets/hexahedron/89z-rows.js`.
- [x] ~~Windows were inserted into the balconies.~~ They sit on the terrace wall
      below each tread now, three storeys to a 20 m riser.
- [ ] The terrace cells are still boxes on a ring, clustered by one fbm with
      streets cut through, sky bridges out to pods, and gardens on the
      promenade levels. The sheets' bridges span BETWEEN faces across open air;
      these only cantilever outward.
- [ ] No interiors behind the promenade bands, and the cultural centre at the
      summit is a single block rather than the hall the sections draw.
- [ ] The imported hypertree is one species (Ironbark) and one specimen. Mav's
      Refuge has four, and its lower crown hangs off structural branches that
      were not imported, so this one's crown is grown rather than ported.
- [x] ~~Shafts did not reach the soffit.~~ They run to the waist inside the
      closed lower shell, so the connection cannot depend on a continuous
      inverse agreeing with a stepped surface. Capitals and footings added.
- [ ] The collapsed flank tears the soffit above it, but the mass does not sag
      or tilt toward the hole -- the survivors are drawn as though nothing
      moved. In-world the nanomaterial spine holds, so this may be correct.
- [ ] Camera presets hard-code targets, so any preset aimed at a computed
      feature (the shaft bundle, the shear face, the crater) goes stale when the
      computation changes. Three have needed re-aiming so far.

## The Span (`--target canyon`)

- [ ] The three fallen payloads are small against the canyon floor and could use
      heavier debris fields and more broken-open interiors.
- [ ] Payload sway in the rusted variant is a fixed tilt, not a hang angle
      derived from the cable — fine at these angles, wrong if a cable ever
      snaps on one side only.

## Rehabilitated (decay 3, folded into `--target kit`)

- [x] ~~**Folding decay 3 into the kit does not fit.**~~ Folded on 2026-09-28
      by the user's choice to accept the overage: `DECAYS=[0,1,2,3]` in
      `targets/kit/89z-rows.js`, and the `repaired` target is retired. Measured
      with the fold, the stump fix below and Projects D and H: **8 362 742**
      scene triangles against the 6 000 000 ceiling (110 type/decay pairs, 185
      registered volumes, 152 795 instances); `--assert` reports it as OVER,
      which is expected. Every other invariant passes; worst draw calls
      measured so far 886 of 900 (Rehabilitated D).
- [x] ~~**Every type at decay 3 is a STUMP.**~~ The standing test is `d!==2` in
      `bodyGroup` and in Skyscrapers A, B, C and G, so only a toppled tower is
      cut. A rehabilitated tower now stands at full height, dressed by the same
      `repairPass`.
- [ ] **The row presets had to be pulled in.** With a building at x=0 in every
      row, a row shot deeper than the row spacing stood inside the next row's
      rehabilitated building. `ROWV` now caps the distance 90 m short of the
      next row, so nine row shots (skyscrapers A, B, D, E, G, H, Megastructure,
      Starport, Lab) are tighter than they were designed. They frame the
      intact, rehabilitated and ruined sites; the toppled one sits off frame.
- [ ] *Starport part DONE (civic QA: tents and water butts on its pads at decay 3).*
      The repaired pass dresses **every** type identically. A police station and
      a cathedral-scale laboratory get the same vocabulary of lean-tos and water
      butts; some types would read better with their own accretion (a factory
      wants scrap yards, a starport wants tents on the aprons).
- [ ] Patches sample the wall faces, not the actual holes, so a patch can land
      on intact fabric. Reads fine — people board over cracks too — but a true
      hole-aware patch would need `holeFn` to record where it punched.

## Vashtir, the recursive spire (`--target spire`)

- [x] ~~Open child bases.~~ Capped, swept from the same `rOf()` as the shell
      because the rim is a star, not a circle.
- [x] ~~Proportion is broader than the reference.~~ **This was my misreading**,
      not a defect: the reference is itself about as wide as it is tall. What it
      actually needed was translucency, now supplied by the parasol fans.
- [ ] Radial symmetry is visible if you orbit directly overhead (44 kerb blocks,
      6 causeways and 6 stairs make a regular rosette). Not visible from any
      preset.
- [ ] Intact contrast is low — white on white at distance, and nothing in this
      kit casts shadows, so all form comes from facet normals.

## From the brief (the detail pass, not yet started)

- [x] ~~Materials are first-pass canvases.~~ Done in round 4: panel seams and
      fasteners with per-sheet roughness breakup, rust keyed to the bottom of
      each tile (= under every ledge), verdigris split into its own copper
      material, board-formed concrete with tie holes and damp stains, brick in
      common bond, and a fresnel rim on the glass. See NOTES.md for the three
      traps (sRGB on data maps, metalness with no envMap, clone() dropping
      onBeforeCompile).
- [ ] *Civic, round 2: hood-and-sill mouldings on the Government's arched windows (`civHoodGeo`) and a flared cornice on each tier. No general `moulding()` helper yet.*
      No Gaudí bone-work yet: window mouldings, finials, bulb tops, bone-rib
      buttresses, and the `moulding(profile, path)` sweep helper they need.
- [ ] *Civic builders DONE (`civRooms()`, qa/civic.md; round 2 added the Hospital podium's ward bays); other groups open.*
      Interiors are floor slabs only — no corridor light strips, touchpad
      panels, conduit bundles or machinery silhouettes behind the openings.
- [x] ~~Decay is uniform rings.~~ Round 5: `rubbleRing` now banks rubble against
      the wall it fell from (same signature, so all 33 types improved at once);
      `upFaces`/`ledgePoints` sample a structure's own flat surfaces so moss
      lands only where something faces the sky and vines and water-staining come
      off real ledges. Applied to the Laboratory, Hotel and Apartments A.
- [ ] *Civic builders DONE (`civWin()`/`civShardAt()`, qa/civic.md); other groups' `kput` sites open.*
      **Glass shards in ruined window openings** — the one decay sub-item still
      outstanding. Unlike the rest it cannot be done in a shared helper: the
      windows are `kput` directly at ~15 call sites, so it needs either a
      `deadWindow()` wrapper threaded through them or shards baked into the
      `winD`/`winBigD`/`winSmD` geometry itself.
- [x] ~~No ground contact.~~ `terrainH(x,z)` exists (returns 0) and everything
      meeting the ground asks it. `apron()` lays a graded skirt; it is inside
      `skyPlinth`, so all eight skyscrapers have one, plus the Laboratory and
      Starport. **Remaining types still meet the ground on a hard line** — the
      call is one line each where it is wanted. *Civic types done (qa/civic.md):
      aprons on Offices A, Library, Government and the Gate's feet; the rest stand
      on berms, a hill, discs or plinths.*
- [ ] *Civic parts DONE (qa/civic.md): data-centre hatches and ducts, the Gate crest lattice, legged robot chassis (round 1); Campus wings bend (round 2). Open: Mega warts, Skyscraper B's crown (other groups).*
      Campus wings should bend (UFM); the data-centre fin row needs hatches and
      ducts; the Gate deck needs an organic lattice; Megastructure "Unnamed"
      wants irregular Beksiński warts; the robot chassis are placeholders;
      Skyscraper B's crown is undersized.
- [x] ~~Theodiga wants light tunnels, an irregular fin mosaic and a rougher
      canyon.~~ All three done. The canyon now carries bedding planes, vertical
      gullies and a talus of fallen blocks; the fin cells cluster into patches
      and bands instead of scattering by coin-flip; and the light tunnels are
      punched clean through the downstream face with collars, open shafts and a
      recessed glow. `buildDam` is shared source in `src/77-dam.js`, so this
      lands in any future kit that places the dam again.
- [x] ~~Vegetation is lollipop trees.~~ `VEG.tree(x,y,z,species,h)` is the hand-off
      point, with a cheap default; `trees()` and every planting call go through
      it, so the flora pass is one assignment.
- [ ] `dist/ancients-lib.js` (builders + kit, no scene) does not exist yet, and
      the builders still take `(scene, gx, gz, d)` rather than the
      `(parent, {x,z,yaw,decay,seed,terrainH})` contract in the brief.
- [x] ~~**Darco is the only near-black type in the kit.**~~ Repalletted. The
      four skin/deck materials were near-black (`0x100e0c`), about a thirteenth
      of the kit's own concrete; they are now roughly half of it on the same
      warm grey (`0x625a52` intact, `0x786e64` ruined). Still the darkest type
      by a wide margin, still dark enough for the ember openings to read
      against, but the same stone as everything else. It also made the
      cellular skin far more legible at distance than the charcoal did.
      `MAT.darcoVoid` stays at `0x030405` — recesses should still be black.
- [x] ~~**The Forest Arcology's planted rings are hexagonal, not circular.**~~
      Resolved by splitting the type rather than changing it. The hexagonal one
      is now the **Forest Tower**; the circular-torus reading is the **Forest
      Ring**, its own type on a barrel. A hexagonal plan is correct for the
      Tower — the six columns ARE the hexagon's corners.
- [x] ~~Canopy blobs are coarse at eye height.~~ `lumpy()` displaces each
      crown and scrub geometry ONCE at kdef time by an fbm of its own vertex
      position, with the underside pulled in harder than the top. Two crowns
      and two scrubs, picked per plant. Costs nothing per instance (an
      Icosahedron is non-indexed, so coincident vertices displace together and
      the shell stays closed) and the forest stopped reading as a bag of
      marbles.
- [ ] **The Forest Tower is within 7 000 triangles of its 700 000 ceiling**
      (693 652 ruined / 691 542 intact). The tower took ~95 000 and the budget
      for it came off the bole geometry (24 triangles to 10, open-ended: both
      caps were buried) and the plinth groves, which are 90% under the building
      where nobody can see them. There is no easy headroom left: the next
      addition to this type has to be paid for by a matching cut, and the
      obvious remaining candidate is `figH`, a 48-triangle sphere for a head.
- [ ] **The Forest Tower's shear reveals a flat back wall.** The dark
      `MAT.guts` lining and its floor plates give the bite depth and a proper
      cross-section read, but the lining is one smooth surface — no cell walls,
      no partitions, no fallen slabs hanging. Compare the Veladiga breach,
      which has the same problem solved only slightly better.

## Forest Ring (`--target ring`)

Built by an agent over several rounds; transcribed here because it was told not
to edit this file. Verified independently at each round. Final: **660 058
intact / 672 852 ruined** of 700 000, worst **42** draw calls over 22 views, all
six invariants PASS, error panel clean, 32 registered volumes. `dist/forest.html`
re-verified byte-identical afterwards (693 652 tris, 47 180 instances), which
confirms this type's cheap-geometry helpers (`frArcGeo`, `frDoorGeo`) are local
and did not touch shared `arcShape` / `arcWindowGeo`.

- [ ] **The wheel hides the barrel's belly.** A 1440 m half-torus at the
      barrel's own mid-height is wider than the 808 m hub, so from any normal
      three-quarter view the bulge is occluded and the barrel reads as a tapered
      drum. Only `'The barrel'`, from just above the deck, shows the full
      profile. Inherent to the instruction, not a defect — but the type's two
      ideas cannot both be seen at once from the ground.
- [ ] **The cutaway floors do not read as a building section.** Twelve plates at
      8 m centres exist in the crown's wedge and the fix history behind them is
      sound (the inner shell had to be punched by the same predicate; the plates
      had to be pale concrete, not void-black; each needed a dark soffit). But
      the crown is a SHALLOW STEPPED MASS — it steps up as it steps in — so
      there is never 96 m of solid material at any one radius to cut through,
      and what shows is three or four ledges in the slot wall, not a stack.
      A real section needs deep fabric, which this form does not have.
      I re-aimed `'The section'` myself: it looked 38 degrees DOWN into the
      wedge, which shows the slot's floor and rubble and none of its side faces.
      It now runs nearly level along the slot at mid-stack height.
- [ ] **Nothing connects.** The four bridges land on the rim but there is no
      stair, ramp or gate down into the town's street, and the barrel-end
      landing is a balcony on a blank wall. The eight radial stairs in the crown
      have no landings or handrails. 236 houses on the rim are still effectively
      unreachable — the bridges made this better-looking, not solved.
- [ ] **The under-truss is decorative** — a sagging line of boxes with
      verticals; the deck would not stand on it. Spokes are single straight
      boxes whose roll `beam` leaves to `setFromUnitVectors`, so a
      near-horizontal strut's cross-section is arbitrarily oriented.
- [ ] **The half-torus has no interior**, and the ruin's cut face is a plain
      half-disc — the cutaway treatment given to the crown and shoulder stops at
      the wheel.
- [ ] **The wheel's wood is open woodland, not forest** — 450 m² a plant against
      the crown's 170, because the annulus at crown density would be 200k
      triangles alone. The town is one building type in two even rows on one
      circular street: no squares, side lanes, or corner treatment.
- [ ] **A stepped crown cannot be seen into below 36 degrees of depression**, so
      the three-torus idea reads properly only from the air. The two inner
      toruses carry 24 m of planting against torus 0's 36.
- [ ] **The arches and doors are visibly faceted from directly underneath** — 8
      and 5 curve segments instead of 24 and 12. This bought 81k triangles to
      pay for the wheel (445 arches, ~680 doorways). Worth knowing the lever
      exists; worth knowing it shows.
- [ ] **ring/1 is at 96% of budget** — ~27k of headroom. Anything further wants
      something taken out first.
- [ ] The ruined shell thins toward the foot: `holeFn` has no height term
      without a `cut`. A `holeFn` limitation that will recur in any type eroding
      a tall shell. The breach is a single wedge that widens inward but never
      undercuts — as logged against Veladiga. Decay 2 unsupported.
- [ ] **Canopy coarse at eye level on BOTH forest types.** `frCrown` and
      `foCrown` are each a displaced 80-triangle icosahedron. Raising the
      displacement frequency fixed the "green boulder" read, but at 10 m they
      are still faceted lumps. **This wants a different tree, not a different
      amplitude, and it should be fixed once in shared code rather than twice.**

### Worth keeping
`scratchpad/ringagent/jscheck.py` — compiles the built script with Chromium's
`new Function()`, which parses without executing. A real syntax check in ~3
seconds instead of a 7-minute verify round. This is the closest thing the kit
has to the `node --check` it cannot run, and the single most useful tool any
agent has added to this repo. It belongs in the repo proper, not a scratchpad.

## Arcbeam (`--target arcbeam`)

The canyon bridge-city. Transcribed from the builder's hand-back; it was told
not to edit this file. Verified independently: 644 102 intact / 646 314 ruined
of 700 000, worst 45 draw calls over 16 views, all six invariants PASS, error
panel clean, 31 registered volumes.

**Measured against the sheet rather than asserted:** raycast at mid-beam height
at three z stations gives a clear span of 939 / 961 / 974 m, mean 961, against
the sheet's 960. The first cut measured 874–908 because the canyon wall's relief
eats 25–45 m off each face — the nominal rock line is now set 33 m back so the
OPENING is 960, not the centreline spacing. Section 96 x 270 m = 1 : 2.81,
which satisfies "thinner than it is tall".

- [ ] **Neither "Section across" nor the collapsed bay is a section, and
      neither can be.** At mid-beam height everything outside the gorge is rock,
      so a true transverse section has nowhere to stand; and the beam is a box —
      two skins with an inner skin 17 m behind each and 30 m of void between —
      so there is nowhere more than ~17 m of solid to cut. You get a torn hole
      with floor plates hanging in it. **This is the third type in a row where a
      cutaway was attempted and could not read** (Forest Tower's shear, Forest
      Ring's crown wedge, now this). The pattern is clear: a section needs deep
      solid fabric, and none of these forms has any. Stop attempting cutaways on
      thin-skinned types; model a real interior or leave the opening dark.
- [ ] **The dropped span reads as a fairly intact white box** on the gorge
      floor. `holeFn` at d=1 eats the faces less than intended at that grid
      resolution, so its new interior plates are barely visible. It needs the
      shell broken open at one end, not merely perforated.
- [ ] **"Both" is a poor shot and three attempts did not fix it.** Two 1 200 m
      cities cannot be framed at 50 deg from closer than ~3 500 m, where
      `FogExp2` at 0.00022 leaves transmittance 0.55. Legible but washed out,
      with both outer ends cropped. This is a general problem with the
      two-site showcase convention at this scale, not an Arcbeam bug.
- [ ] **The rockfall scar is the weakest ruin feature** — smoother than the
      bedded wall around it, and the buried section it was meant to lay open is
      mostly hidden behind the portal frame. It is a rockfall beside the
      landing, not a cutaway of the buried city.
- [ ] Canyon walls are soft at close range (13 m grid columns; gullies are the
      finest feature that survives). Roof decks are under-furnished — 1 200 x
      82 m of pale paving per beam. The industrial yards are the same layout
      four times, mirrored, which is obvious from the plan view.
- [ ] **Vegetation is the kit default** and reads as toys close up; hedges are
      flat green boxes. The agent deliberately stayed off `foCrown`/`foBole`
      because they belong to another builder. **That restraint is correct per
      fragment but wrong for the kit** — see the shared-tree item below.
- [ ] **Both decays sit at 92% of ceiling.** The biggest single line item is
      moss: `MAT.moss` on `IcosahedronGeometry(1,1)` is 80 triangles a blob, and
      the ruin's moss and tree counts were already cut by a third to fit.
- [ ] `figures()` places people at y=0 on a gorge floor at y=14–26, so the two
      ground-level crowds are knee-deep in it. Never visible from a preset.

## Plymouth (`--target plymouth`)

The residential mountain. Verified independently: 476 402 intact / 454 346
ruined of 700 000, worst 44 draw calls over 16 views, all six invariants PASS,
error panel clean, 23 registered volumes, 103 517 baked instances — the densest
type in the kit and the one furthest UNDER budget, because the dwelling detail
is 2-triangle panes on `MAT.dot` rather than boxes.

Measured, not estimated: 3 390 bays x 5 storeys = 16 950 cells on the outer
risers over 21 702 m of perimeter, giving 65 678 window/door panes, 7 303
balconies, 4 391 washing lines, 693 arcade arches, 188 stair runs.

- [ ] **The silhouette is more regular than a hill should be.** Four independent
      setback rates give real asymmetry numerically (summit centre offset ~25 m;
      crown 199 x 100 on a 732 x 524 base), but at distance it still reads as a
      stepped cone. A hill wants a spur or a saddle and there is none.
- [ ] **The light court does not read from overhead** — nothing in this kit
      casts shadows, so a 185 m shaft is just a bright patch from the zenith.
      The `Plan` preset is tilted 17 deg off vertical to get some depth into it,
      which is a dodge, not a fix. **This is a kit-wide consequence of having no
      shadows and will defeat any deep vertical void in any type.**
- [ ] **Everything is bright.** Decks are three material steps darker than the
      walls and still come back near-white under a 1.7-intensity sun. Lit
      windows cannot out-shine a sunlit wall, so this type's intended warm glow
      only works in the covered street and the court. Same root cause as the
      kit-wide "intact contrast is low" item.
- [ ] **The assembly hall is thin** — a drum, a dome, a colonnade and a portal,
      and it is the only civic object in a settlement of 17 000 homes.
- [ ] **The ruin is "intact with patches" above the slump.** Below level 6
      nothing has gone but fabric; a mountain abandoned for millennia would have
      lost far more terraces, parapets and maisonettes.
- [ ] Crown's near end is sparse and the mast has no guys; terrace clutter is
      seven item types on a weighted roll, so at 16 000 bays the eye starts
      seeing the same water butt; chamfer correspondence between levels is
      approximate (decks lerp between two octagons at equal arc length, which
      skews slightly at the corners — invisible at every preset).

### Bugs this type found in SHARED kit code — still unfixed
- [x] ~~**`stripRing()` aims each strip radially**~~ — FIXED in `src/36-decor.js`. It was true that a ring of light strips
      renders as a starburst of spokes pointing at the viewer rather than a line
      following the ring. Plymouth worked around it with a local tangential
      `lring()`; **the shared `stripRing` still has the bug** and every other
      type using it has the same starburst. The Forest Tower hit this too and
      carries its own `TAN()`/`lring()` for the same reason. Fix it once.
- [ ] **`stainsFromLedge()` is unusable on a rectangular plan** — it orients
      each streak radially, laying 22 m decals flat across the terraces. Only
      correct on a circular plan. **Half-fixed:** it and `ledgePoints`/
      `vinesFromLedge` now take an optional `(cx,cz)` so the radius and the
      streak direction are measured from the plan's OWN centre rather than from
      the builder's origin. That was a second, hidden instance of the same bug:
      the Hotel's crescent is struck from a point 63 m behind its origin, so
      the two directions are 43 degrees apart at the horns, the sampler ranked
      the two ENDS of the building as its outermost points, and every vine and
      every water stain hung off them instead of off the long face. Still
      radial, so still wrong on a rectangle; every existing caller passes
      nothing and is unchanged.
- [ ] **`holeFn`'s `u` is multiplied by ~7 internally.** Fed a `u` normalised
      over a 2.3 km perimeter it ate 330 m rectangles out of whole terraces.
      Callers must feed it arc length / ~216, which is documented nowhere.


## Launch (`--target launch`)

The city that meant to leave. Verified independently: 417 072 intact / 473 360
ruined of 700 000, worst **55** draw calls over 18 views (the highest of the
four new types, still far under 900), all six invariants PASS, error panel
clean, 45 registered volumes.

The ruin is one quaternion: the whole vehicle group tilted 0.082 rad about a
pivot at the throat, so the shroud tip swings 62 m off axis, the skirt rim goes
20 m down and 10 m THROUGH its own apron, and the collar, clamps, mast and gash
all follow from that single rotation rather than being modelled separately.

- [ ] **Everything facing down is brown.** The hemisphere light's ground colour
      is 0x6a3a2a and nothing casts shadows, so collar soffits and the plug
      ceiling read warm brown. Dropping `lxBell`'s metalness from 1 to 0.5 put
      the diffuse back and helped — a fully metallic soffit with no envMap is
      flat brown — but this is mitigation, not a fix, and it affects **every
      type with a large soffit**, not just this one.
- [ ] **Six-fold symmetry is exact** — six trenches, masts, towers and umbilical
      bearings. From directly overhead it is a perfect rosette; only the three
      spheres and two ramps break it.
- [ ] Scoop back walls are single surfaces with no thickness — blast walls from
      the ground, thin dark sails from overhead. The payload frame inside the
      broken shroud is a smooth lathe. The fallen mast head and downed service
      tower are chains of jittered beams: wreckage at distance, a scribble up
      close. Trench slag, apron debris and crater rubble share one hue band with
      no concrete/metal distinction.
- [ ] **The six flame-trench volumes are the thinnest in the registry** (27
      probe samples each) because the trench geometry is inside one merged mesh
      and only its `kput` coping contributes points. They pass, but they are the
      closest thing in the kit to a false negative on
      `registered-volumes-non-empty`.
- [ ] "Look down off the top terrace at the pad" is **geometrically
      unachievable** and was dropped: from 8 m above a 20 m deck the deck fills
      the downward view before the parapet does, and raising the camera enough
      to clear it stops it being a view from the terrace.


## Arcoindian I (`--target arcoindian`)

The cliff-topography arcology. Verified independently: 314 236 intact / 309 590
ruined of 700 000 — the lightest of the new types by a wide margin — worst 69
draw calls over 16 views, all six invariants PASS, error panel clean, 56
registered volumes.

**Measured against the sheet, not asserted:** height 220-450 m exactly (lowest
terrace deck 230, tallest tower top 450); surface covered 101 498 m2 = 10.15 ha
against the sheet's 10.5, 3% under, integrated on a 4 m lattice.

**THE SAGITTAL SECTION WORKS** — and it is the only cutaway in this kit that
does. Five types tried and four failed, for the reason logged against each: a
section needs deep solid fabric and a shell has none. A city excavated into a
massif has nothing but. Three things made it, two of them failures first:
reveals (17 m, four-sided, off the same rectangle list as the holes — without
them 900 m of rock read as card); a stair shaft crossing the levels (four
unrelated windows in a cliff is not a section); and FORCING the cut — the
chamber walk stopped wherever `rr(56,104)` put it, so the intact variant showed
one chamber on the plane and the ruin two. The section was luck until levels
reaching the cut plane were made to land on it.

- [ ] **The massif reads as a rectangular loaf from the hero view** — flat
      plateau, straight vertical cut, no spur or re-entrant along 1 900 m of
      escarpment. The single biggest remaining weakness.
- [ ] **The vault light-well collars read as objects stuck to the ceiling.**
      Four attempts (flared bell, small flare, flush rim with a bright bore).
      Root cause is not fixable in this type: an unshadowed sun plus the
      hemisphere's warm ground colour lights anything hanging under a roof. The
      POOLS on the deck carry the idea instead and do work — a radial-falloff
      additive disc. Flat pale discs read as paper dropped on the deck.
- [ ] Plateau is thin (a haul road, spoil, scrub over 1 700 x 1 300 m); the roof
      fall is angular now but still too uniform; pod stacks are acceptable, not
      good; trees are the kit default.
- [ ] **A `roofY()`/shell disagreement nearly shipped**: `roofY()` returned the
      smooth Bezier while the built vault adds up to 23 m of noise, so three
      light shafts hung ~15 m below the ceiling with `--assert` green. Now both
      call one `roofN()`. Another entry for the placement-error list.


## Arcoindian II (`--target arcoindian2`)

The half-cave. Verified independently: 328 222 intact / 337 000 ruined of
700 000 — **48% of budget unused** — worst 47 draw calls over 17 views, all six
invariants PASS, error panel clean, 65 registered volumes.

**Measured against the sheet, not asserted:** height 280-340 m from two
constants (SILL=340 is the cave floor, so the city stands 340 m over the water;
CROWN-SILL=280 is the hollow's own height). Surface 85 536 m2 = 8.55 ha against
the sheet's 8.6, integrated on a 4 m lattice. The quay and shaft landing (4.8 ha)
were deliberately EXCLUDED — 3.9 ha of dock at the bottom of a 430 m drop is not
what the sheet means by covered surface, and folding it in would have flattered
the figure by half.

**The sagittal section works and is the best thing in the type** — a master
joint cutting rock, plateau, reservoir, three galleries, a passage, a light
well, a 340 m access shaft AND the lens, whose cut face is itself lens-shaped
with the bands stacked in it. Levels CANNOT miss the plane because they are
horizontal planes rather than an RNG walk — that is the fix Arcoindian I had to
find the hard way, applied from the start.

- [ ] **A plan view of this city is geometrically impossible.** The lip is at
      (y 564, z +64) and the lens's middle at (y 480, z -200): the steepest
      sight line clearing the brow from outside is **17.6 degrees of
      depression**, and from inside the hollow the ceiling is only ~113 m over
      the deck, capping it near 25. Five camera positions were tried. The
      sheet's fourth drawing is approximated, not built — this is inherent to
      an overhang, not a fixable preset.
- [ ] **The cliff face reads as smeared mud at close range** — six noise terms,
      brown blotches at 100 m. The worst material read in the type.
- [ ] The lens's flanks are blank over ~150 m; the access shaft is a blank pale
      column except where the joint lays it open; the gardens are a hedge row
      rather than the fan the source comment claims; the sun court floor and the
      roof-fall scar are coarse (the scar is a stepped quarry terrace, not a
      rockfall); the rim plateau is still thin over 1 900 x 1 100 m.
- [ ] **The ruin is "intact with an overgrowth pass" at distance.** The vault
      bite, deck block field, dropped bridge span and snapped water shaft all
      read close up, but the hero ruin is not obviously 5 000 years older.
- [ ] `RIVZ`, `inLens` and `NLU/NLV` are dead locals in the source.
- [ ] **360 000 triangles of headroom per decay.** Spend them on the flanks, the
      cliff-face relief and the plateau, in that order.

### What reading the shots caught that --assert did not
A 3 m slot punched clean across 900 m of the joint plane (`lth` returns 0
outside the lens, so the test was true at every z) that looked exactly like a
texture band and survived two screenshot rounds and one wrong fix — settled only
by raycasting the face and watching the ray exit the far side of the massif.
A river buried under its own bed. A reservoir built inside out as a cone, and
then capped by its own plateau. A stalk cut flat at its centre so it poked out
at the back and left a 23 m gap at the front. Water shafts buried 18 m. Light
well collars reading as flying saucers — **and the rim was never what you were
looking at**: the lining is a mid-brown and the hemisphere lights it happily
through 90 m of rock; void-black for the first 55 m of bore fixed it.


## Cutaways — the sixth attempt, and this one reads

- [x] ~~Skyscraper A's ruined and toppled variants showed a dark hollow, not a
      section.~~ Both halves of the lesson the other five types paid for were
      broken in `buildSkyA` at once: **the inner shell had no `hole` argument
      at all**, so it stood intact behind every tear in the outer skin and hid
      the floors; and **the floor plates were 0x2a2c30 against a 0x2a2622
      lining** — dark on dark, the exact failure logged against the Forest
      Ring. The inner lathe now takes the SAME predicate as the outer at a grid
      fine enough to line up with it (80x56, was 64x40), and each plate is pale
      concrete with its own dark soffit 1.5 m under it. `Toppled A` now shows a
      stack of floor/ceiling/void in the open top of the stump.
- [ ] This works here because a 420 m cone has 80 m of diameter to cut through.
      It does not contradict the standing rule from Arcbeam — a thin-skinned
      form still has nothing to section.
- [ ] Only Skyscraper A was done. The other seven towers all still have an
      unpunched `MAT.guts` inner lathe and dark floor plates, and will all read
      the same way. It is the same two-line change in each.

## Cross-cutting, and now overdue

- [x] ~~**A dead window is a fixed pale grey, not a dark one.**~~ `cell` is
      `MeshBasicMaterial`, which is right for a window that is on and wrong for
      one that is off: an unlit material ignores the scene, so a `DEAD`
      instance colour renders at about 60/255 whatever the light is doing. In
      daylight that passes for a dark opening and nobody had ever looked at it
      in the dark. Put the scene into night and every dead window on the tower
      became a panel BRIGHTER than the wall around it. `cellD` (the same box on
      `MAT.winDead`) is the fix, used by The Project. **`cell`, `strip`, `dot`
      and every other `MAT.dot`/`MAT.strip` item in all 33 types still has
      this**, and it will show the moment anything else is looked at at night.

- [x] ~~**One shared tree.**~~ DONE — `leafCard` in `src/34-kitdefs.js`. Three types had independently hit the same wall:
      `foCrown` (Forest Tower), `frCrown` (Forest Ring) and the kit default
      (Arcbeam) are all coarse at eye level, and Arcbeam duplicated the problem
      rather than reuse a neighbour's item because per-fragment ownership said
      not to. A single good tree in shared code — not a displaced icosahedron —
      fixes all three at once and stops the fourth type repeating it.
- [x] ~~**A cheap 80-triangle moss/foliage blob is the top budget line in two
      types.**~~ Fixed by the same change. **THE NUMBERS**, measured before and
      after, heaviest decay of each type:
      forest 693 652 -> 531 232 · ring 672 852 -> 550 668 ·
      arcbeam 646 314 -> 491 668 · launch 482 550 -> 444 142 ·
      plymouth 476 402 -> 449 262 · darco 275 732 -> 258 300.
      **About 522 000 triangles across six types, and the foliage looks better
      rather than worse.** Every budget crisis went with it: ring was at 96% of
      ceiling and is now 79%, forest was at 99% and is now 76%, arcbeam 92% to
      70%. The lesson worth keeping: the canopy was never short of triangles, it
      was spending them on the wrong thing — geometry cannot make a leaf edge,
      and an alpha channel can.
- [x] ~~**`jscheck.py` belongs in the repo.**~~ Installed at `./jscheck.py` and
      documented in README as a required step between `build.py` and
      `verify.py`. It hands `build.py`'s own `.syntax-<target>.js` to headless
      Chromium's `new Function()`, which parses and compiles without executing:
      measured at **5.2 s on the 9 993-line launch build** against a ~7 minute
      verify round. Three agents relied on it from a scratchpad that would have
      been deleted with the session.
- [ ] **`beam(name,a,b,w,dp)` — `w` is the beam's DEPTH, not its width.**
      Verified in source: it emits `kput(name, mid, q, [w, L, dp])` where `q` is
      `setFromUnitVectors(+Y, axis)`. For a HORIZONTAL beam that shortest-arc
      rotation carries local X onto the vertical, so `w` sets how deep the beam
      is and `dp` how wide. The launch agent had it backwards for most of its
      build and shipped 175 m access bridges 9 m tall and 4.6 m wide — a camera
      placed on one was inside a box. Checked the Forest Tower: its beams are
      all near-square (5.2/5.6, 4.4/5.0, 3.0/3.4), so nothing there is visibly
      wrong, but any caller using a deliberately flat section has it flipped.
      Rename the parameters or document them.
- [x] ~~**`build.py` wrote the wrong script block to `.syntax-<target>.js`.**~~
      It used `rsplit('<script>', 1)`, which assumes the bundle is the LAST
      script in the document. For the `kit` target it is not, so the file
      written was a 22 KB tail that does not parse alone, and `jscheck.py`
      reported a SyntaxError on a build whose error panel was clean and whose
      invariants all passed. Now takes the largest script block. A false
      positive on the project's only real syntax check is worse than no check —
      it sends you hunting a bug that is not there.
- [ ] **`build.py`'s reseed scan does not skip comments.** Writing a rejected
      `reseed(NNNN+d)` call literally in a header comment creates a phantom
      seed collision that fails the build for every target. Paraphrase seeds in
      prose, or teach the scanner to strip comments.
- [ ] **No invariant can see a placement error.** Between them the four agents
      shipped, and caught only by reading a render: furniture buried inside the
      mass with its roofs poking through; tank spheres pushed to a merge list
      after that list was merged, so only their fittings drew; a trench cut 3 m
      wider than the trench, leaking the green ground plane along six lips; a
      hexagonal berm toe against a circular apron skirt, leaking a 60 m annulus
      of green on three bearings; a crater with no floor. `--assert` was green
      through every one. **Reading the shots is not optional and never has
      been.**
