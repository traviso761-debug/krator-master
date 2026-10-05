# Ys — known issues
build.py prints every unticked item on each build. Claude: when Travis asks for changes to this world,
remind him of this list first. Tick `[x]` and date an item when it is fixed.

## Deliberate drift in vendored fragments (`build.py --vendor-check` reports these as "adapted")
- `54-mat-concrete.js` (from `kits/ancients/src`, Oct 5 2026): `bodyGroup` passes `ysCutY(d)` to a standing body, so
  every tower that builds through it (D, E, F, H) is cut at a storey when the city names a height. One line.
- `71-port-terrain.js` (from `settlements/port/src`): `portNatH` delegates to `YS_NAT` when the city target
  defines it, and the port's nature scatter is skipped in that case (the biome plants the ground). Two lines.
- `52-sky-abc.js` (from `kits/ancients/src`): `ysCutY(d)` is the `y1` of a ruined (decay 1) body when
  `YS_CUT` is set, so a drowned host is cut at a datum instead of at the kit's own ruin height; `ysPodiumR`
  shrinks `skyPlinth` to `YS_CUT.podium` (apron and plinth decor dropped); `ysWallHole` adds the way-in pods'
  holes to the body's hole predicate (skin, lining, window cells and lobe bands all share it) on A, B and C.
  Three helpers at the top and seven one-line edits; the kit's intact and toppled paths are untouched.
- `92-camera.js` (from `settlements/iziz/src`): the Ys standard pack: a seventh preset element is the hour,
  `n` toggles noon/night, the camera and walker stay above the sea, the inspector names ground and sea, and
  the Compass toggle. Back-port the compass to the standard pack once Ys is on `main`.

## Open
- [ ] Phase 0 terrain is the port's tensor grid sized for a coast along x: 10 m cells only within ~900 m of the
      origin, 90 m cells beyond. Phase 3 replaces it with the Ys terrain mesh (regular cells over the 3.2 km map,
      a far-country mesh for the volcano and the Inner Wall).
- [ ] No nature scatter on the natural ground until the NW-bay biome is bound (phase 3).
- [ ] The foreign quarter's buildings (Iziz, Republic, Voth, the chapterhouse) will carry no ROOM records until
      their own kits register them (DESIGN §7).
- [ ] The Ancients hosts get door marks only at their accreted landings (DESIGN §7).
- [ ] The ground painter is the port's (red soil in patches, dry grass): re-key it to the bay's lush ground and
      the karst when the NW-bay biome is bound (phase 3).
- [ ] The nacre material fades underwater only through its own hook (`hkNacreHook` calls `portUWsh` first);
      any new shell material with an `onBeforeCompile` must do the same or it will glow under the sea.
- [ ] The sea plane shows moiré at the mockup's low grazing presets (the port's sea at a 10 m tensor cell);
      revisit with the Ys terrain mesh in phase 3.
- [ ] `ysHostMembers` mirrors the kit's strut and leg constants for Skyscrapers A and B (positions, counts,
      which are gone when ruined). Re-read `kits/ancients/src/52-sky-abc.js` whenever the kit is re-vendored,
      and add C, D–K as hosts of those kinds are placed.
      *Re-read Oct 5 2026* at the re-vendor (the RESTAND: A's strut feet at r 60, B's legs raked from r 42 to the lobe
      tips); the caps came in to 66 (A) and 56 (B).
- [x] (Oct 1 2026) The rich pod's door lamp floated beside the lip: a pearl on nothing. Lamps take a `bracket` anchor
      on the shell now, and the accreted pod's lamp sits on its own surface beside the door.
- [x] (Oct 1 2026) The drips under an accreted pod did not meet the shell (an approximate underside). They are read
      off the superellipsoid itself and bedded .22 m into it.
- [ ] A strut's shaft is modelled as a capsule (r 2.75) though the kit draws a 5.5 x 4 beam: a runner rooted on a
      shaft lands up to .65 m proud of or inside the beam's corners. Heads are boxes and land exactly.
- [ ] The kit's towers have no stairs between their floor plates (`kits/ancients/KNOWN_ISSUES.md`, "Found by
      Ys"): from a way-in pod only its own plate is reachable on foot. Grow Hykkousoi stairs inside the hosts
      in phase 3, or re-vendor the kit once it has stairs.
- [ ] A way-in hole is cut on the lathe's quad grid (A: 2.2 m columns, 0.5 m rows at the mock's cut), so its
      edge is ragged by up to half a quad; the pod's fillet (reach 1.35 R) hides it from outside, but from
      inside the host the lining's hole (nu 80) is coarser than the pod's back and shows a notch or two.
- [ ] In the mock the L1 datum on Skyscraper A falls on its base cone, which has no plates: the L1 pods there
      are dwellings with landings only, not ways in. The city places way-in pods on plates only.
- [ ] The accreted pods' room polygons are circles of 12 sides; a bed against the wall can still clip the
      shell by a few centimetres where the lathe noise pulls the wall inward. The interior pass should read the
      wall from the pod's `inner` surface rather than the nominal radius.
- [x] (Oct 1 2026) `hykPad` inside a builder: its geometry went through the frame but its deck record did not, and
      `HYK.placeOn`'s `o.landing` converted to world first, so a grown pod's landing stood at twice its coordinates
      (agents B, C, D). It draws in the current frame and records world now; `hykBridge` and the pontoon likewise.
- [x] (Oct 1 2026) Doors blocked by the building's own skin (Travis: the barracks). 90 of 210 doors on the kit sheet
      showed a wall through their lip: the base fillets, skirts and second skins were never holed. Every HYK building
      now clears its own geometry out of each door's passage when it is done (`hykCutDoorways`, 62); 206 doors are
      clear. Of the four a ray still meets: the Treasury's swung-open seal leaf, the quay's edge and the Amphitriton's
      shrine-niche step are by design; the hanging tavern's store door faces along the host and the host's skin
      stands in its passage (agent C's layout: turn the door, or move the store pod off the face).
- [x] (Oct 1 2026) The Amphitriton's vault let the rain in (Travis): the petals part where they taper and the spire
      is an open lathe. A webbing shell under the petal edges, holed at the L2 doors, and a crown disc close it.
- [ ] `hykLatheAt` reads the bare profile, so on a lobed, fluted or ringed lathe its point is off the skin (up to the
      lobe amplitude: 0.85 m on the Citadel's wall) and a lip floats or sinks. Agents A, E and G each wrote a corrected
      copy (`hykHouseLatheAt`, `hykTideAt`, the `hykMil…` radius); the Citadel uses `hykTideAt`. Fix it in 61 and
      retire the copies (the callers that scale its result themselves must stop).
- [ ] `hykStairSpiral` takes the host's world centre and `rAt`, so inside a builder it must be called with the frame
      stood down (70's `hykHouseWorld`); give it the frame treatment `hykPad` got.
- [ ] The kit sheet's generated `— front` and `— eye level` presets for a landmark (the Amphitriton, the Citadel, the
      Inn) stand in or behind the neighbouring rows; judge those from the row preset or a `--cam`.
- [ ] The merge look-round was at row and host scale (every row, every host from both sides, the Citadel close);
      the agents' own close looks (eye level, inside) died with them and were not redone piece by piece.
- [ ] The Citadel: its bridge head at the west waits for the span to the Amphitriton (P3); its terraces are 1.6 m
      steps with flights on two bearings only (no seat steps); the towers have no way in; the Treasury's place in
      the precinct is the city's to choose. The gate hole is cut on the wall's quad grid and its inside edge is ragged.
- [ ] The dyer's cloth hangs as flat panels on a rail; from a distance the door's lip through them reads as a sign.
- [ ] The view select does not follow a preset chosen by the harness or by `_api.setView` (cosmetic; the port
      behaves the same).
- [ ] The furniture set's bowls, basins and the hearth have no inner skin (drawn before `F.lathe` took `flip`): a
      `dark` fill a finger under the rim stands in for the hollow. Re-draw each as two lathes, the inner one flipped.
- [ ] The kit sheet draws variant 0 of every furniture piece, so the shell stool's barnacle variant is never seen.
- [ ] The weed (cloth) material carries the weed map's green cast: coral cloth goes to mud. A neutral cloth map would
      let `F.pick('coral')` read true on cushions and slings.
- [ ] The karst stacks are a heightfield: no overhangs or undercut bases, and the "knobbed top" is a noisy plateau.
- [ ] (Oct 5 2026) **Every drowned host is Skyscraper A** (`88-city-place.js`, `YS_HOST_TYPES`). The rest of Travis's
      list (D, E, G, H, K, the Pierced Stack, the Bole) and the mid-rise types need the Ancients chain re-vendored first:
      eleven of Ys's vendored fragments have drifted from upstream, and upstream's towers call helpers Ys's
      `52-sky-abc.js` predates. Until then the 3 awash host blocks and 4 land-quarter plots are slots (`PLACE.slots`,
      kinds `low host` and `land host`) that draw nothing. Re-vendoring changes the kit sheet's and the mock's hosts too
      (and `ysHostMembers` must be re-read).
- [ ] (Oct 5 2026) The spans are not placed: the bridge graph (PLAN.md P3 step 3: which blocks link at L1, which towers
      at L2, the drawbridge to the Amphitriton, the Citadel's span) is the next pass. The kit audit names the eight span
      defs apart; NAV's L1 and L2 layers are empty until it lands.
- [ ] (Oct 5 2026) The foreign quarter is 60 reserved plots and the chapterhouse's square, with their swap lists; none
      of the foreign sets is vendored, so the quarter reads empty. The caravanserai stands on its nearest block.
- [ ] (Oct 5 2026) The moles (home-grown blocks, the Tides and the Library, the headland, the military harbour, the quay
      aprons) are fill stamps with soft edges: no quay walls yet, the terrain's slope shows on the water sides.
- [ ] (Oct 5 2026) The Citadel stack carries the arena model (`hyk_citadel`) under the Citadel's name and the Treasury in
      its precinct; the fortress Travis asked for is still to design (see his note below).
- [ ] (Oct 5 2026) The city stands at 11.85 M of the 12 M triangle budget with the densities cut to fit (NOTES.md,
      phase 3): the bridges and the biome need room. Either a coarser host (the Conocylinder is 70 k at decay 1) or a
      distance cut-off in the preview; Godot is the showroom, so do not tune the look to the budget.
- [ ] (Oct 5 2026) `shoreAt` (84b) chooses the water side from ±9 m and flips on a flat beach (the fishing docks); the
      shore run decides it from ±40 m itself. Fix it at the source before anything else squares itself to a loop.
- [ ] (Oct 5 2026) The Urchin pod (`hyk_pod_rich_1`) placed without a way puts its store in its door swing; the city
      only ever places it as a way in (the sheet's case).
- [ ] (Travis, Oct 2 2026) **The Archon's Citadel reads as an arena, not a citadel** (`74b-hyk-citadel.js`, the
      terraced arena-fortress on its stack). Keep the model as the city's arena with small tweaks (its name, a games
      floor, the tiers as they are) and build the Citadel proper as a fortress when the city is placed.
- [ ] (Travis, Oct 2 2026) **Walkways and pads round a host must clear its exterior geometry.** On the Scallop Stack
      (Skyscraper B) the sheet's walkway ring runs through the stack's lobes: its radius comes from the host's capsule
      radius, not from its outermost skin at that height. Take the clearance from the host's real silhouette
      (`ysHostMembers`, `hostEdge`) at the walkway's level, with the same margin the runners keep.
- [ ] (Travis, Oct 2 2026) **Host choice: prefer towers with little exterior geometry.** Not Skyscrapers B, F, I or J,
      and none of the new arcology types except the Pierced Stack and the Bole: lobes, fins and struts fight every pod,
      pad and runner. The P3 host list follows this (PLAN.md P3).

