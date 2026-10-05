# Ys — known issues
build.py prints every unticked item on each build. Claude: when Travis asks for changes to this world,
remind him of this list first. Tick `[x]` and date an item when it is fixed.

## Deliberate drift in vendored fragments (`build.py --vendor-check` reports these as "adapted")
- `71-port-terrain.js` also calls `ysGroundTint` (the karst's colours) when the city defines it (Oct 5 2026).
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
- [ ] The karst stacks are a heightfield: no overhangs, undercut bases or sea notches (Krabi's towers have all three);
      `core/terrain`'s carve patches are the way to them. The crowns are domed now, painted jungle; the jungle itself (trees
      hanging off the walls) waits on the NW-bay biome.
- [x] (Oct 5 2026) **Every drowned host was Skyscraper A.** The chain is re-vendored and the hosts are A, D (the
      Monolith) and H (the Warden), D and H standing on the bed with pods on their faces; the awash blocks carry short
      Wardens and Monoliths. Still open: the Pierced Stack and the Bole (the alternates' helpers and kdefs in
      `8aj-alt-a-bole.js`, and their own cut and breach in place of `bodyGroup`'s), and the 4 land-quarter plots
      (`PLACE.slots`, kind `land host`) that wait on the mid-rise types.
- [ ] (Oct 5 2026) The land quarter's reclaimed Ancients are Warden and Monolith stumps (decay 3), not the apartments and
      offices DESIGN §5 names: those builders draw several variants in one call and need splitting first. The port's
      salvage dressing is not applied to any host (`portRepair` does not handle a rotated group).
- [ ] (Oct 5 2026) A `//` comment inside a one-line vendored function swallows the rest of the line (it cost the city a
      leaked transform this round). Mark Ys hooks in vendored fragments with `/* */` only.
- [ ] (Oct 5 2026) The Capsule Stalks' sockets are not used: pods take the centre stalk's smooth band only (one plate,
      so one pod). Growing into a socket needs `HYK.placeOn` to frame a pod on an off-axis core (a socket's position and
      normal are in `HOSTSPEC_STALKS.sockets(d)`; drop the ones above the cut).
- [ ] (Oct 5 2026) The Arcades' sandstone and the Bell Hall's travertine are the board-formed concrete map, tinted: the
      material library has neither (kits/ancients/KNOWN_ISSUES.md has the prompts).
- [ ] (Oct 5 2026) D and H have no `ysHostMembers` (no struts or legs to reach for): the bridge graph's runners will need
      their faces and ledges instead.
- [x] (Oct 5 2026) The spans are not placed. The bridge graph (`88-city-spans.js`) joins every pair of neighbouring
      drowned hosts pod to pod, and the Amphitriton to land through the Tides mole: 8 spans, NAV L1 35 cells, L2 31.
- [x] (Oct 5 2026) The bridge graph's gaps: no piers, no link to land but the Amphitriton chain, the Citadel's span and
      the lily pads and pontoons unplaced. Now: piers under every bridge over 55 m, a spanning tree that puts every
      node (host, walled mole, the Citadel, the Winds) on a foot path to the shore, two towers bridged straight to it.
- [ ] (Oct 5 2026) The bridge graph's remaining gaps: the ladder is unplaced (above); the spiral stairs are showcases
      down a few shafts' faces to a wet landing, not links of the network (a stair down a stack is the next one); the Wet
      Cells stay an island reached by water (DESIGN); a landmark's span lands on the Winds' stack top beside the temple
      and on the Citadel's bridge-head pad (the pad `NAV_EXTRA` names 'Citadel bridge head'; without it the record's
      estimate at the stack's edge is used); the pontoon's flights at each end stand on the mole's plate edge.
- [ ] (Oct 5 2026) The roads are ribbons 22–30 cm over the heightfield (its 10 m cells made the vertex paint read as a
      zig-zag): on a hollow between two grid lines the ribbon can float by that much; the canal streets under the water
      are still not drawn. The lanes' ribbons stop at the streets' edges; no kerbs, no crossings.
- [ ] (Oct 5 2026) The foreign quarter is 60 reserved plots and the chapterhouse's square, with their swap lists; none
      of the foreign sets is vendored, so the quarter reads empty. The caravanserai stands on its nearest block.
- [x] (Oct 5 2026) The moles were fill stamps with soft edges, no quay walls, and everything on them stood on the fill's
      own height (Travis: the military harbour z-fought at a distance). Now the fill lies 30 cm under the datum (inset
      7 m, sharp, under a walled mole), a plate at the datum less 12 cm covers the polygon, and a shell quay wall runs
      down to the bed round every edge of the big moles (the aprons keep their soft beach side, with the plate).
- [ ] (Oct 5 2026) The moles' quay walls are plain (coping, batter, the tide crust): no bollards, rings, stairs or
      ladders down to the water yet, and a mole's plate is one flat colour (the ground library's terrazzo is for it).
      The home-grown moles are organic and terraced now; the harbour moles (the military harbour, the headland, the
      Tides, the Library) are still rectangles. An upper terrace is lightly built (a few small houses) and its middle
      is bare; the flight between terraces has no landing at the top.
- [ ] (Oct 5 2026) The Citadel's cliff stair hugs the analytic karst wall; the heightfield's 10 m facets put the mesh wall
      up to a few metres off it, so the stair floats a little in places and its brackets root in air or stone by chance.
      Its walkway north lands on the home-grown mole's quay edge; the Winds' stack has no stair yet.
- [x] (Oct 5 2026) The Citadel stack carried the arena model under the Citadel's name. Now `hyk_citadel` is the
      new Archon's Citadel (74b: a swept ridge-backed mass with a honeycomb of oval windows, a great pointed arch over
      the audience hall, verdigris spires and dome, a crescent colonnade and a reflecting pool, the west bastion with the
      bridge door and the bridge-head pad) and the old model is `hyk_arena` (74b2) on the nearest land block with room
      for it, its ground levelled, ringed with the market's shops. The landmark stacks are fitted: the Citadel's an ellipse 56 × 84 m (its
      axis away from the bridge door, the Treasury on that side), the Winds' 54 × 57 m, both near flat on top.
- [x] (Oct 5 2026) The new Citadel's verdigris was sea-green vertex colour on shell: its spires and dome are the `hkVerd`
      pair now, the library's `metal.bronze.verdigris` (riveted panels: the rivets read at the spires' scale, a
      plain-patina variant would suit them better). The gold is still a warm hex on nacre.
- [ ] (Oct 5 2026) The Citadel's oval windows have bone-tube surrounds and a pane, not `hykWin`'s lip (the lip instance
      per window was a third of the budget); a window near a wing's ridge can show a sliver of the back face through
      its reveal. The Arena's pod room is still named the tribune.
- [ ] (Oct 5 2026) The library on Ys, first pass: the terrain keeps its procedural map (the karst limestone tiled over
      the flat read as vertical stripes: a wall set; a ground needs a slope-and-karst blend); the jungle canopy set is processed but unused (a slope-and-karst blend
      of limestone and canopy wants a two-map hook); the seaweed weave (`cloth.seaweed`) is unused (the awnings are the
      Iziz vernacular's `MAT.cloth`, not a hyk material); the Ancient towers' concrete (`MAT.white`, `MAT.rust`) keeps the
      procedural panel maps (no prompt for them yet); the sandstone and travertine repeat 1:1 over the towers' own UVs
      (a tile is a bay, about 20 m, so the ashlar's blocks read 3 m). The karst dressing is quads with no wind, no
      lighting trick for the cards' backs, and the vines hang 2.6 m off the analytic wall (the mesh wall can be a few
      metres off it). The kit sheet and the mock take the same pack (their pages grew 4 MB).
- [x] (Oct 5 2026) The restand plinths are gone from every host (`YS_CUT.noPlinth` always: Travis; the Facet's apron
      overrode a street). The hosts' record caps still measure the old podium, so a host reserves more ground than it
      covers. The Conocylinder takes no stair (its body skin runs down to the strut ring where the record says core),
      and the bone ladder (11 m, water to the L1 datum) still has no place: every host's deck at that height is its ring.
- [x] (Oct 5 2026) The city stood at 11.85 M of a 12 M budget with its densities cut to fit. The budget is 30 M for now
      (Travis) and the city's span two-thirds; the densities are back and the city is 8.5 M.
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

- [ ] (Oct 5 2026) Rust: the Ancients in the water are rust-stained by tint only (`MAT.concreteR`); the vendored
      Arcades' sandstone and Bell Hall's travertine keep their colours (vendored byte for byte). A library set of
      board-formed concrete with rust streaks and a salt line (`concrete.rust.streaked`) and a heavy rust
      (`metal.rust.heavy`) would make them read as the ocean's; Travis offered one.
- [ ] (Oct 5 2026) The harbour piers face straight out from their mole's edge; none is angled for the tide, and the
      shore run's piers keep their old spacing. The round warehouse's cart doors face wherever the mole's frame
      points, not the quay.
- [ ] (Oct 5 2026) The river's pool sheets are flat ribbons 1.8 widths wide at each pool's lip height: on a bend the
      ribbon's edge can show past the bank, and the sheet does not fall at the lip (no cascade). The sea sheet takes
      over below the datum. The band's half-sunk hosts are all Arcades this seed (the low pool picks per cell).
- [ ] (Oct 5 2026) The new hosts' blemishes: the bridge graph's pods ignore a type's bearings (`fits` consults
      `avoid(yl,h)` only: on K a pod can land on the porch arch, on the Attraction beside a great spire; `avoid` wants
      the bearing); the tideline crust on C and the Stack is a ring round the axis, not round each leg or piloti; Sky J
      is not a host (its plates reach far past the glazing). The Library's and the office's rust passes are left out.
