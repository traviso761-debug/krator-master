# Known issues — Iziz

Open items are `- [ ]`; `build.py` prints them. Close one by ticking it and
saying what fixed it.

## Vernacular set (round 1)
- [ ] Windows on the battered stone ground storey (Stone manor) sit on the face at
      sill height, so the frame stands proud at the head and sinks at the sill
      because the wall recedes — needs a per-window tilt or a flat reveal block.
- [ ] `vnGableRoof` slabs meet at the ridge with a small V gap on steep pitches
      (stilt hut); the ridge cap hides it from most angles, not from directly above.
- [ ] Hip/pyramid roofs are solid wedges: under a market canopy or veranda the
      soffit is a flat plane, and the market's clerestory gap is not visible from
      inside.
- [ ] Thatch texture is a stripe field at eye level; wants a second frond layer
      and a ragged eave (extra ragged cone exists for silos only).
- [ ] Lit (electric) windows are a flat cream MeshBasic pane; there is no
      day/night yet, so they read as bright glazing by day. The city pass wires
      KratorSky and a window schedule.
- [ ] No poor/middle-class *reclaimed-Ancient* dwellings yet (the brief asks for a
      few more of those in the ancient-mix style) — that belongs to the Ancients
      port phase.
- [ ] School classroom wings' shed roofs slope away from the yard; reads fine but
      the drainage logic is backwards for a rain climate.
- [ ] `vnFrame` rails are boxes that cross at the corners; at the sill this doubles
      up with the plinth. Cosmetic.
- [ ] Figures are the kit's cylinder-and-ball scale figures; the life layer will
      replace them.

## City (round 3)
- [ ] Ancient quarter reaches ~84 of the 125 lattice cells the ½-area rule asks
      for (13 clusters): the primary network, the three hill precincts and the
      parks cut the plateau into polygons too narrow for more 2x2+ clusters.
      Remedy: a finer lattice (pitch 32) or clusters allowed to straddle a
      minor road. The reclaimed skyscraper quota (≥5 per hill) is met for the
      palace and arena hills only when the clusters land there; the temple hill
      has none this seed (`_api.city.quota` reports the shortfall).
- [x] The lattice tower at the city centre was a BUG, not a placement: the kit's
      sky builders open a body group with useGroupXF, which replaced the
      placer's transform and nulled it, so the tower rebuilt itself at the
      origin at full size. Fixed in 69c (useGroupXF/endGroupXF now a stack that
      composes); placeKit also stopped passing the centring through KOFF (which
      the kit adds in WORLD space after the transform) and shifts the group.
- [ ] Skyscrapers: 1x1 lots (four to a 2x2 block) on a designed square concrete
      plinth (`citySkyPlinth`); the kit's own round plaza is trimmed by
      `trimPlinths` with the shaft (upper half) as the core. Check the base of
      each type at eye level for slabs that survived the trim.
- [ ] `trimPlinths` drops low, wide kit geometry beyond the plot (plinths,
      plazas, aprons). It keys on "lower than the plinth line AND wider than
      8 m" so a genuinely low wide building part (the campus terraces, the fuel
      station's canopy) can be cut. Check the campus at eye level.
- [ ] Reclaimed Ancient buildings tagged unlit have their kit light items
      recoloured dead (`DEADLIGHT`) — but the kit's *merged-mesh* glass bands and
      the `repairPass` warm dots are untouched, so a dark reclaimed tower still
      has a few warm lamps. Acceptable ("new light, old building"), noted.
- [ ] Settler streets: ~120 segments at pitch 44 — the plateau minus hills,
      precincts and the wall band holds only ~200 lattice nodes. The infill pass
      (houses behind the frontages on footpaths) does the rest of the fabric;
      the city reads a little open from the air. Farms take what is left (24-28
      plots).
- [ ] Frontage houses on both sides of a 44 m settler block collide in the
      middle for the deeper types (rich 24 m); the walker steps 3.5 m and tries
      again, so the count is fine but the loop is wasteful (8k rejected tries).
- [ ] The escarpment paint (rock annulus + speckle) is a flat ring on a smooth
      slope: the terrain mesh at 4 m cells cannot show a 34 m-wide 40 m-tall
      S-curve as a cliff. Wants a rock lathe or displaced band per hill.
- [ ] Hill-top placement (`placeOnTop`) is a bearing sweep at a fixed radius
      with hand-picked radii per building (temple top r0 94: chapterhouse and
      alchemist at r 68, generator behind at r 74; arena: beast hunters r 72,
      generator r 74, needle r 72; palace: generator r 72 at gate+.78). A change
      of hill size or landmark scale needs those re-picked — the error panel
      says "no room on the X top" when one fails.
- [ ] The palace HALL (converted hangar) is faked as a hollow: tier 3 is built in
      four frustum parts round an 18x11x14 m void with columns, lamps and a great
      door; the void's back wall is the rear mass's front face. The great awning
      is one cloth slab on two stone poles. Not walkable yet (no collision).
- [ ] Biome: the hypertree pass is masked out to 130 m from the wall (cleared
      belt) but the FLOOR pass still plants cheap far-ring cards right up to
      the moat; and no `HYPERJUNGLE.dress()` runs on the ruins yet.
- [ ] Views: 'Settler streets — eye level' picks a poor house at runtime; some
      seeds land it inside a yard fence.
- [ ] Labels (src/93-labels.js, the standard package): one atlas mesh over REG,
      1280 cells max; a building with several REG volumes (the Salvagers' Guild)
      gets several labels; landmark() renames only the largest volume.
- [ ] `wreck()` vines now hang off the cut walls' side faces (thicker, fewer);
      where the cut removed a wall they still read as free-standing lines.

## Round 3c (Travis's second review)
- [x] Floating aprons/plinths on every Ancient-kit building: the kit asked
      terrainH() in its LOCAL frame and got the plateau height at the world
      origin (18 m). Kit builders now run inside `withFlatGround`; each kit plot
      is levelled with `cityFlat` and the terrain mesh is built last.
- [x] Shacks and patches at the world origin: `repairPass` ran after the group
      transform closed. It now runs inside it (placeKit and vqWrapKit).
- [x] Skyscraper textures: the UV hook re-tiled plain meshes as well as
      instances; now only instances are scaled (kit shells keep their 8 m tiles).
- [ ] Skyscraper podiums: towers stand on the city's square plinth; the kit's
      podium (everything up to its top) is cut and the shaft lowered onto the
      plinth. Skyscraper A's leaning legs still reach past its lot over the
      neighbours (they are tall, not podium) — The Project's legs straddle shacks.
- [ ] Re-vendored from kits/ancients on 2026-09-30 (all 35 kit fragments identical, including the Ancient
      Iziz Style module, 77z-iziz-style.js). The kit's later fixes change the city: smaller skyscraper plinths
      (Skyscraper E 105 -> 48 m), decay-3 towers no longer cut to stumps, the QA passes on 24 builders. The
      city now places 612 registered buildings (was 599) at 5.2 M tris. The page renders with a clean error
      panel; `verify.py --assert` was not run after the re-vendor.
- [ ] BIOME DRIFT (deliberate): targets/city/86-bio-* wrap the hyperjungle biome in closures so it cannot
      clobber the city's globals (`var BIO`, `BIO.setScene`). Upstream (biomes/hyperjungle) has since added
      fauna (58, `opt.fauna`); porting it means re-applying the closure wrap to the new fragments.
- [ ] The toppled Skyscraper B keeps its own podium (its fallen body was laid by
      the kit to rest on it) on a 60 m lot; the fall is checked against boulevards,
      plazas, parks, courts, water, rock, precincts and standing buildings.
- [ ] Painting footprints before the settler streets (so streets never cut
      through a building) halves the settler network; the vernacular fill
      dropped to ~110 frontage + ~150 infill buildings. Candidate fix: route the
      settler lattice round footprints instead of dropping blocked links.
- [ ] Scene triangles ~6 M (Skyscrapers A-C reclaimed are heavy: skyC ~1.1 M
      in total). Fine for the budget; a LOD/impostor pass for far towers would help.

## Round 3d (Travis's third review)
- [x] City fill: settler nodes that land on a building slide to free ground, and
      blocked links detour round it (dog-leg); ~125 settler streets again.
- [x] Offices, apartments and houses are split per type (`kitSection`) and placed
      one type per group: honeycomb B and Office C in rows of parallel slabs,
      Office B / Office A / Apartments A / C and Houses A-F in quads of 1-4.
- [x] Rehab canopies stand on the roof (poles find fabric under them).
- [x] Skyscraper D ruined/reclaimed skin is rust-streaked (`MAT.concRust`).
- [x] Repaired Skyscraper C = the Tripod market on a 2x2 lot: three awnings from
      the leg triangle out to masts (six-pointed star from above), stalls under.
- [x] Toppled Skyscraper F near (-11,-432) falls toward (-12.6,-398.5); its plinth
      is the slot's square, on the street grid. The slots its fall crosses stay
      empty. Toppled bodies are lowered with the stump and sink ~5 m into the
      ground at the far end (reads as impact; noted).
- [x] Bunkers face out, Salvagers' dome re-glazed and whole, palace windows
      recessed with surrounds and warm panes, terrace pyramids/cubes developed
      into pavilions and belvederes, transplant glazing opaque.
- [ ] The Project: a placeholder (kit Skyscraper A, orange) until the Ancients
      agent's model lands; swap `KITCAT` entry / `theProject()` when it does.
- [ ] Labels are screen-constant (170 px, landmarks 240 px): near the camera many
      overlap. A declutter pass (hide a label whose screen box overlaps a larger
      one) would help.

## Harness
- [ ] `verify.py` is the Ancients copy; its `--assert` budgets come from this
      repo's `91-probe.js` (3 M tris / 400 calls; the city raises them to 16 M /
      900 in `93-city-ui.js`) but the wording still says "showcase". Fine for now.
- [ ] `build.py` has a SCOPED exemption (`86-bio-*`) for the IIFE-scoped biome
      fragments; their column-0 names are not checked for collisions.
