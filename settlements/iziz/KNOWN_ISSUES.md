# Known issues — Iziz

Open items are `- [ ]`; `build.py` prints them. Close one by ticking it and
saying what fixed it.

## Open, 2026-10-05

- [ ] (2026-10-16) **The trades round** (the owner: "give me an Iziz Vernacular version of every trades and industry-related
      building the Iziz Vernacular kit doesn't have yet. Build interiors for the Iziz residences and trade buildings, but skip
      civic buildings for now"). 21 new buildings (src/71a-71c, 73b, 73c), the 8 dwellings and 7 trade buildings made hollow,
      and every one furnished (API.md, "Interiors"). Left open:
      - Civic buildings (school, hospital, barracks, the guilds, the frontier set, the generator) stay solid, as asked. Their items in
        kits/interiors/sets/iziz.js are ready for when they are hollowed.
      - The city target has no interiors: no furniture bundle, `VERN.interiors` off, every building solid as before. Turn it on
        with the rebuild on core/city (about 3000 vernacular placements: furnish near the camera, as Girder and Verge do).
      - The stone manor's 5 m ground storey only takes a ladder (the planner's straight stair does not fit the rise); the townhouse's
        and the tavern's upper rooms see out only through the deco shutter strips (dark slots, not openings).
      - The planner puts a stair along the street wall when it can (its score likes the street door): the weaver's was steered by
        its doors; elsewhere a stair foot can show through a front window. The tailor's shop and workroom come side by side.
      - Loading doors drawn above a hoist (the provisioner, the mill) are openings the planner does not know; furniture may stand
        in front of them. The fungus house is built at ground level (only its earth bank reads as sunk) and entered at its -x end.
      - No animals in the byre or the pens; the boatyard's and the fish landing's water is at the plot's front edge for a city to
        lay (the dugout sits 0.4 m inside it). The tinker's dish is a flat disc (no concave item).
      - FURN_JOBS has no salvage or electrics job: the tinker is tagged carpentry, the salvage yard smithing.
      - Surfaces with no good texture (core/materials/PROMPTS-NEEDED.md, "Gaps with no prompt yet"): dyed cloth, still water,
        world-UV crag rock.
- [ ] (2026-10-15; first pass 2026-10-19) **The palace citadel's interior:** the agreed programme is `settlements/iziz/palace/`
      (`BLUEPRINT.md`, the sheets in `floors/`, `FURNITURE.md`). The owner asked to start it (2026-10-19: "start building the
      Iziz palace according to the blueprints ... decorate extravagantly"), so it is built on its own page, `targets/palace`
      (`dist/iziz-palace.html`; README.md, API.md "The palace citadel"): every sheet laid (227 rooms on 27 storeys of seven
      buildings, every room reached), finished by decor level, furnished (about 6,400 pieces: the Iziz sets, Talia's in the envoys' rooms and the libraries, 47 new palace pieces; the court's paintings, book spines, glazes, carpets and finishes laid on), the
      Depot and the Core in the mesa, the Mech Gate. `verify.py --assert` passes (`palace`); `node palace/test-palace.js`
      passes. Left open:
      - **Not in the city yet.** The fragments are the target's, so no other page changed; when the city is rebuilt they move
        to `src/` and the city places `pal_citadel` on `HILL.palace` (the frame takes any hill and gate bearing: `IZPAL.frame`).
        The city's own palace-hill dressing (87-city-layout's court paint, the crag band) is not on this page.
      - **Not walkable.** The walk (F) stands on `terrainH` (the mesa), so the upper storeys, the Depot and the Core are seen,
        not walked; there is no walk graph through the rooms and stairs yet (SKILL.md 5j, "Interiors belong on the
        pedestrian graph"). No people.
      - **The barracks are laid** (2026-10-19, the owner: "barracks don't have rooms"): on the sheet's rects (I0 #4, #5), axis
        true, so they stand a little off the city's `izBarracks` (turned with the hill's bearing); the drill yards are bare.
      - **Z-fighting** (the owner's report, 2026-10-19): fixed for every pair of box instances the check found (API.md, "No two
        faces on one plane"). The check is not in `verify.py` yet: a page-side scan of every box instance's faces, about a
        minute under SwiftShader. Merged meshes (the furniture batch, the plants) are not scanned; the builder's own pieces
        outside the masses (78-transplant 'palace': the grand entrance, the windows' surrounds) are the city's and unchanged.
      - **The heights are assumed** (BLUEPRINT.md left them open; `78q` header): the mesa 40 m, the Depot at the city's level,
        the Core 12 m under it, three storeys of 14/3 m per tier. The third storey of the base tier repeats sheet I1 as the
        freedmen's lodgings with the Library of the Palace; the tower's stair is one shaft (u 22..28, v 6..13), not the
        sheets' two places; the Mech Gate is at the tunnel's end (u 112), past the sheet's (u 70..80).
      - **Two sheet rooms cannot fit**: the Great Door's 2 m sliver and the Imperial Guard of the Aula (u 22..24) lie between
        the hall and the rear mass's liner; the great door is drawn as a portal instead. The sheets' Stair of the Hall is
        2.9 m wide inside the flank's liner, as the flank is.
      - **Windows** are seen from inside as daylight panes on the liners at the builder's window positions, not as openings;
        the precinct buildings' too.
      - **The furniture's marble** draws in the catalog's `stone` detail family (rough rock): a `marble` family is a
        catalog-wide change (every build bundling the detail maps), not made here. The court's cloth, veneer and gilding take
        the court sets (brocade, velvet, marquetry, gold leaf: 95i's `courtFinish`, 2026-10-19). The five surfaces the palace had no set for (the coffers, the bronze leaves, the crater map, the legions fresco, the hangar deck) were delivered and wired on 2026-10-19 (`core/materials/PROMPTS-NEEDED.md`, "Delivered 2026-10-19, the Iziz palace").
      - **Heavy page**: about 4 M triangles with every room furnished (the furniture at half detail); furnishing takes ~5.5 s
        in SwiftShader. Nothing is furnished lazily yet (Girder and Verge furnish near the camera first).
      - No mechs stand in the bays or on the hall's lift (the Mechs kit, `KratorMechs`, could be bundled).
- [x] (2026-10-15) Iziz on core/host (ROADMAP.md section 10, step 3; core/host/README.md): the camera, the controls, the walk (F),
      the frame loop, the panel, the probe's frame, the inspector (I hover, a click: core/tags records, the full registry of
      91t-iziz-tags.js), marks (P, they replace the polygon tool) and the minimap (M) are core/host's; `src/92-camera.js` keeps only
      what the page calls (ui, uiButton, setView, Labels) and `src/99-start.js` is the take. FRAME_HOOKS run as before, f(dt, ms),
      before the camera. Proof: verify.py --assert unchanged on the vernacular sheet and the city; a scene census (every mesh's
      name, visibility and triangles, the camera to 4 decimals) at four views of each matches the old pages exactly (both are
      deterministic: two old runs match each other exactly too). The city's last-frame triangle count moves run to run on the old
      page as on the new (4.65 M to 4.74 M over three old runs). Not core/space (the biome's scatter takes its grid when the module
      is on the page, 2026-10-13 below) and no editor or cutaway yet (no catalog furniture, no interiors).
- [ ] (2026-10-15) TICKS still runs nowhere: 69-mat-salvage.js's fire flicker (a tick reading the Ancients camera's NIGHT) is not
      handed to core/host, as it was never run by the old camera either.
- [ ] (2026-10-05) Fauna sheets: `settlements/iziz/materials.json` (families fauna_wing, fauna_fur, fauna_hide, fauna_ray; all optional) and `fauna_pack()` in build.py
      write `HYPERJUNGLE.FAUNATEX` as a generated fragment `86-bio-57-fauna-pack.js` (city target only; nothing is written until a sheet exists). Today the sloth
      (`fur.sloth`) and strider (`hide.strider`) sheets are in; `wing.butterfly` and `skin.sky-ray` are in too (2026-10-06), and the darts are not textured by design
      (their wing and body share UVs). Not looked at in a real browser.
- [ ] (2026-10-05) Tree tints (biome 55-trees, hand-copied into targets/city/86-bio-55-...): roots now take the trunk's tint at their height above the ground (carried into the limb tint, since roots stay in the limb bucket: the floor reads the bark bucket as the bole's profile, and roots there shrank the floor dress by 30k triangles); limbs,
      boughs and twigs take the limb tint of the trunk's colour band where they leave it. The limbs still use the shared pale limb texture, not the species bark
      texture, so the texture on a limb differs from the trunk even when the colour matches. Not looked at.
- [ ] (2026-10-05) Headless `verify.py dist/iziz.html` ends in `WebGL: CONTEXT_LOST_WEBGL` and FAILED even on the committed page (checked against
      `git show HEAD:settlements/iziz/dist/iziz.html`): the error panel is clean and the counters print (814 draw calls). It is the software GL on the city, not a regression;
      the Iziz page has no headless pass at the moment.
      2026-10-13: since 2026-10-08 `verify.py` could not run at all: stage 0b moved its helpers block to `tools/harness.py`
      and took this verify's own `GL_ERR` / `GL_IGNORE` with it, so the console handler raised NameError, three.js was never
      served and the load timed out (900 s). Both are back in verify.py. With them, `verify.py dist/iziz.html --assert`
      PASSES headless (858 calls / 4.96 M tris at the opening view, error panel clean, no CONTEXT_LOST); left open until
      the other views (`Palace hill`, `Arena hill`) are run headless too.
- [x] (2026-10-05) `python3 build.py --vendor-bio` crashes in `bio_wrap` ("expected one 'const HYPERJUNGLE={};'") after opening the vendored file for writing, which
      empties it (restore with git). The 58 and 55 copies were patched by hand (they differ from upstream only in the wrapper line). `build.py --help` also runs a full
      build and rewrites the manifests.
      2026-10-08 (the vendor part fixed): the upstream was CRLF in this checkout and the wrap matched LF only; `bio_read` now
      reads both as LF and `--vendor-bio` wraps before opening the copy. Re-vendored: the hyperjungle's harvest data, its
      single-tree `make`/`grow`, the pandan keys, and its limbs and dead wood bound to the library's bark (`limb`, `wood`).
      `--help` still runs a full build.
- [x] (2026-10-05) 11 Iziz material sets were processed 2026-10-05 (stone.cut, stone.cut.b, plaster, brick, metal.corrugated, roof.tile, metal.iron, metal.bronze, metal.gold,
      patterns/iziz/mosaic-b, glass.frosted.b; PLAN.md) but Iziz has not adopted the library; its materials are still the procedural ones.
      **Adopted 2026-10-13** (the second material pilot, below): the vernacular, the Ancients MAT and the embassy were bound since 2026-10-06;
      now the city's own materials too (stone.cut.b on the painting's walls; see "The second material pilot and M5").

## Vernacular set (round 1)
- [x] Windows on the battered stone ground storey (Stone manor) sit on the face at
      sill height, so the frame stands proud at the head and sinks at the sill
      because the wall recedes — needs a per-window tilt or a flat reveal block.
      **Round 4:** each window stands in a flat stone reveal block, vertical and flush with the face at the sill, its back buried where the face recedes.
- [x] `vnGableRoof` slabs meet at the ridge with a small V gap on steep pitches
      (stilt hut); the ridge cap hides it from most angles, not from directly above.
      **Round 4:** a slab-material bar turned to a diamond fills the V under the cap.
- [x] Hip/pyramid roofs are solid wedges: under a market canopy or veranda the
      soffit is a flat plane, and the market's clerestory gap is not visible from
      inside.
      **Round 4:** the market canopy's lower tier is now an open double-sided skirt (`vSkirtT`), so the clerestory and the upper roof show from under it. Other hips stay solid; their soffits are only seen under the market.
- [x] Thatch texture is a stripe field at eye level; wants a second frond layer
      and a ragged eave (extra ragged cone exists for silos only).
      **Round 4:** thatched gables and hips get a second, darker frond layer and a ragged fringe of tilted bundles along the eaves (`vnThatchDress`, `vnThatchFringe`).
- [x] Lit (electric) windows are a flat cream MeshBasic pane; there is no
      day/night yet, so they read as bright glazing by day. The city pass wires
      KratorSky and a window schedule.
      **Round 4:** the city's sky tick runs a window schedule: panes and bulbs are dim glass by day and glow from dusk, following the hour slider. The Ancients' MAT.dot lights dim by day.
- [ ] No poor/middle-class *reclaimed-Ancient* dwellings yet (the brief asks for a
      few more of those in the ancient-mix style) — that belongs to the Ancients
      port phase.
- [x] School classroom wings' shed roofs slope away from the yard; reads fine but
      the drainage logic is backwards for a rain climate.
      **Round 4:** the wing roofs are high on the outer wall and drain toward the yard, onto the veranda roofs.
- [x] `vnFrame` rails are boxes that cross at the corners; at the sill this doubles
      up with the plinth. Cosmetic.
      **Round 4:** the end-face rails butt between the long-face rails, and a frame standing on a plinth has no sill rail.
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
      **Round 4, partial:** a second pass on the same lattice, offset by half a pitch, takes the polygons the first wasted. It clears every first-pass cluster, so none moved, and its clusters (`extra`) are assigned after the first pass (reseeded). It gained only 4 cells (83 of 121 now). The rest needs clusters allowed to straddle a minor road, which would cut the links.
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
- [x] Reclaimed Ancient buildings tagged unlit have their kit light items
      recoloured dead (`DEADLIGHT`) — but the kit's *merged-mesh* glass bands and
      the `repairPass` warm dots are untouched, so a dark reclaimed tower still
      has a few warm lamps. Acceptable ("new light, old building"), noted.
      **Round 4:** placeKit also swaps the merged light meshes (strip, dot, bulb, pane) to a dead material and the glass to unlit glass on an unlit reclaimed building.
- [ ] Settler streets: ~120 segments at pitch 44 — the plateau minus hills,
      precincts and the wall band holds only ~200 lattice nodes. The infill pass
      (houses behind the frontages on footpaths) does the rest of the fabric;
      the city reads a little open from the air. Farms take what is left (24-28
      plots).
- [ ] Frontage houses on both sides of a 44 m settler block collide in the
      middle for the deeper types (rich 24 m); the walker steps 3.5 m and tries
      again, so the count is fine but the loop is wasteful (8k rejected tries).
- [x] The escarpment paint (rock annulus + speckle) is a flat ring on a smooth
      slope: the terrain mesh at 4 m cells cannot show a 34 m-wide 40 m-tall
      S-curve as a cliff. Wants a rock lathe or displaced band per hill.
      **Round 4:** a crag band per hill: a ring surface laid on the face in 2 m cells, pushed in and out by two noise octaves into buttresses, with strata texture along the contours, cut at the ramp.
- [x] Hill-top placement (`placeOnTop`) is a bearing sweep at a fixed radius
      with hand-picked radii per building (temple top r0 94: chapterhouse and
      alchemist at r 68, generator behind at r 74; arena: beast hunters r 72,
      generator r 74, needle r 72; palace: generator r 72 at gate+.78). A change
      of hill size or landmark scale needs those re-picked — the error panel
      says "no room on the X top" when one fails.
      **Round 4:** `placeOnTop` takes the radius as a first choice and sweeps r-8, r+5, r-16 and r-24 before it reports no room.
- [ ] The palace HALL (converted hangar) is faked as a hollow: tier 3 is built in
      four frustum parts round an 18x11x14 m void with columns, lamps and a great
      door; the void's back wall is the rear mass's front face. The great awning
      is one cloth slab on two stone poles. Not walkable yet (no collision).
- [x] Biome: the hypertree pass is masked out to 130 m from the wall (cleared
      belt) but the FLOOR pass still plants cheap far-ring cards right up to
      the moat; and no `HYPERJUNGLE.dress()` runs on the ruins yet.
      **Round 4:** the floor thins to 30% in the cleared belt (rising to full jungle by 130 m out), and `HYPERJUNGLE.dressGeos` dresses every ruined Ancient building (moss, ledge plants, soffit roots, wall curtains).
- [x] Views: 'Settler streets — eye level' picks a poor house at runtime; some
      seeds land it inside a yard fence.
      **Round 4:** the view walks the poor houses from the 37th percentile to the first whose camera spot is on a street and clear of every plot.
- [x] Labels (src/93-labels.js, the standard package): one atlas mesh over REG,
      1280 cells max; a building with several REG volumes (the Salvagers' Guild)
      gets several labels; landmark() renames only the largest volume.
      **Round 4:** volumes that overlap and share a name before " — " keep one label (the landmark, else the largest).
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
- [x] Skyscraper podiums: towers stand on the city's square plinth; the kit's
      podium (everything up to its top) is cut and the shaft lowered onto the
      plinth. Skyscraper A's leaning legs still reach past its lot over the
      neighbours (they are tall, not podium) — The Project's legs straddle shacks.
      **Round 4:** Skyscraper A is fitted by its whole shaft (`meas.shaft`, legs included): the legs may reach the middle of the street, never a neighbour's lot. The Project keeps its core fit (it is a placeholder).
- [x] Re-vendored from kits/ancients on 2026-09-30 (all 35 kit fragments identical, including the Ancient
      Iziz Style module, 77z-iziz-style.js). The kit's later fixes change the city: smaller skyscraper plinths
      (Skyscraper E 105 -> 48 m), decay-3 towers no longer cut to stumps, the QA passes on 24 builders. The
      city now places 612 registered buildings (was 599) at 5.2 M tris. The page renders with a clean error
      panel; `verify.py --assert` was not run after the re-vendor.
      **Round 4:** `verify.py --assert` now passes on the round-4 build (see NOTES round 4).
- [x] BIOME DRIFT (deliberate): targets/city/86-bio-* wrap the hyperjungle biome in closures so it cannot
      clobber the city's globals (`var BIO`, `BIO.setScene`). Upstream (biomes/hyperjungle) has since added
      fauna (58, `opt.fauna`); porting it means re-applying the closure wrap to the new fragments.
      2026-10-01: the wrap is now code, `bio_wrap()` in build.py. `build.py --vendor-bio` rewrites every
      86-bio-* copy from upstream through it, and `--vendor-check` compares bio_wrap(upstream) with the copy
      ("all 11 biome fragments match"), so the wrap is no longer reported as drift. Re-vendored: the biome now
      has the upstream six species (mahogany, kapok), the belt understorey and epiphyte gardens, the
      animation core (86-bio-35) and the fauna (86-bio-58). 90b runs `HYPERJUNGLE.buildFauna(2000,1800,q)`
      against the TREE mask (the jungle outside the wall; nothing spawns in the streets); `CITY.FAUNA:false`
      leaves it out. verify --assert passes: Overview 858 calls / 6.52 M tris, Palace hill 700 / 6.23 M
      (budget 900 / 16 M; it was 684 calls before, so the calls budget is now nearly spent).
      2026-10-01 (merging main): the biome core moved to `core/biome/` and now carries the closure wrap
      itself, so `bio_wrap()` copies the core verbatim from there and still wraps the kit fragments;
      re-vendored, `--vendor-check` matches all 11.
- [x] World-UV materials all drew at one K: `vWorldUV` (69b) and its copy `izsWorldUV` (77z) were closures whose
      source, three.js's program key, is the same for every K. 2026-10-01: one shared `vWorldUV` in
      core/materials/opt/69a-world-uv.js (per-K program, survives kbake's clone), opted in through `CORE_OPT_FILES`;
      both local copies removed (77z re-vendored from kits/ancients). Stone and the Ancient panels now tile at their
      own, coarser K.
- [ ] The toppled Skyscraper B keeps its own podium (its fallen body was laid by
      the kit to rest on it) on a 60 m lot; the fall is checked against boulevards,
      plazas, parks, courts, water, rock, precincts and standing buildings.
- [x] Painting footprints before the settler streets (so streets never cut
      through a building) halves the settler network; the vernacular fill
      dropped to ~110 frontage + ~150 infill buildings. Candidate fix: route the
      settler lattice round footprints instead of dropping blocked links.
      **Round 4:** the fix landed in round 3d (settler nodes slide off buildings, blocked links detour); this item was left open by mistake.
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
- [x] Labels are screen-constant (170 px, landmarks 240 px): near the camera many
      overlap. A declutter pass (hide a label whose screen box overlaps a larger
      one) would help.
      **Round 4:** a declutter pass every 6th frame hides a label whose screen box overlaps a higher-priority one (landmarks first, then nearest first).

## Harness
- [x] **Fixed: on the city (`window.CITY`) `verify.py` names them `city-triangle-budget` / `city-draw-calls`.** `verify.py` is the Ancients copy; its `--assert` budgets come from this
      repo's `91-probe.js` (3 M tris / 400 calls; the city raises them to 16 M /
      900 in `93-city-ui.js`) but the wording still says "showcase". Fine for now.
- [ ] `build.py` has a SCOPED exemption (`86-bio-*`) for the IIFE-scoped biome
      fragments; their column-0 names are not checked for collisions.

## Round 4 (Travis's fourth review)
- [x] The wall, gates, towers, bunkers and spaceport moved out √1.2 (20% more enclosed area). The core keeps the
      round-3 line (`coreR`), so no cluster, park or deliberate tower moved.
- [x] Farm belt: belt road plus radial lanes; 38 of 50 usable blocks farmed (76%), as runs; the rest built by the
      hill rules.
- [x] Toppled F breaks in two near (-6.8,-375.7) (kit `TOPPLE_BREAK`); the PRNG stream is restored after it.
- [x] Tripod market on the Skyscraper C near (-23.4,288.4): repaired in a ruined quarter. Both markets roughly
      quadrupled (about 46 stalls each, was about 12) and are tagged as life-layer market destinations.
- [x] Palace grand entrance on the base tier.
- [x] The destroyed Tyrell block read as see-through: kit `wreckRefine` splits long triangles before the cut.
- [ ] The belt is thin (30-45 m deep): one row of plots per block in most places. A pomerium lane along the
      wall's inside was left out to keep the blocks deep enough to farm.
- [ ] The F break's second piece is kinked by a fixed 0.3 rad toward the point's side; its far end is not checked
      against what it lands on (the first piece's fall was).
- [ ] Tripod canopies sit on the 1.55 m skyscraper plinth (the whole lot); a canopy is not checked against the
      kit's leg geometry above 4 m, only the leg feet.
- [ ] Scene: 7.1 M triangles, 684 draw calls at the worst view (budget 16 M / 900); the jungle dress on the ruins
      adds about 0.5 M. 2026-10-01 (biome re-vendor with fauna): 858 calls / 6.52 M at the Overview, 42 calls
      under the budget. The next draw-call cost here needs a cut elsewhere (or `CITY.FAUNA:false`).

## Round 5 (the atmosphere module, core/atmos)
- [ ] The URL hash (`#hour=…&weather=…`) works when the page is served as a file or from the host. Inside a claude.ai
      artifact only a bare `#token` reaches the page, so use the hour slider and the weather selector there.
- [ ] Ivy and cisterns find walls and flat roofs with the box index only (box-geometry instances). Merged meshes
      (transplant shells, kit lathes) are not indexed, so a transplant gets ivy only where it has box walls.
- [ ] Floodlights (3) and the temple brazier light are real PointLights: every lit material pays for them. Keep any
      more lights to cones and glow.
- [ ] The weather's `apply` multiplies the sun after the sky tick has set it, so the order of FRAME_HOOKS matters. The
      atmosphere fragment must stay after 90a.
- [ ] Sprite sizes now count the pixel ratio (`pixelRatio` in `ATMOS.init`). Before, on a screen with a ratio of 1.5 or
      more, every glow, smoke puff, firefly and fog sprite drew at 2/3 of its size. The harness runs at ratio 1, so its
      shots are unchanged, but on a HiDPI screen the sprites are now 1.5x what they were. Check by eye there.
- [ ] Moths circle only the `ATMOS.lamp` heads (the gate-road and thoroughfare lamps, 70). The kit's own lamps (the
      224 `cityGlows`) have no moths.


## Catalog verify pass (2026-10): nothing synced back
kits/catalog recentred `iziz_banner` (the pole was the origin, so the banner reached 0.92 m to one side) and raised
the declared sizes of `iziz_palm`, `iziz_broadleaf`, `iziz_lily_pad` and `iziz_reed`. Nothing here was changed to
match. Iziz has no FURN or PLANT registry, so there is no declaration to correct. The catalog banner, an 11.5 m
pole with a crossarm, is a rewrite and has no counterpart here. The closest are `vnBannerPole()` and
`vpBannerPole()`, which are called 19 times in world coordinates with the pole as the origin. Recentring them would
mean offsetting every call to keep the city where it is, and would gain nothing. The catalog copy is the centred one.

## Open after merging main (2026-10-01): not addressed
- [x] Ancients vendor drift from main. Main's Ancients work (towers restand, Hanging City, shared-code pass, Hexahedron
      polish) changed `kits/ancients/src`, so `--vendor-check` here reports 28 drifted fragments: 10-core, 32-surfaces,
      34-kitdefs, 36-decor, 38-helpers2, 50-registry, 69-mat-salvage, 77z-iziz-style and the kit-type fragments
      (40-factory-extras through 89-lab). The same shared fragments drift in Highlands (10-core, 32-surfaces,
      34-kitdefs, 36-decor, 38-helpers2, 50-registry, 69-mat-salvage) and Jimjam (10-core through 50-registry);
      Xanadu and Reed Lake vendor from Highlands and will follow. Re-vendor the chain together
      (Ancients -> Iziz -> Highlands -> Xanadu / Reed Lake, and Jimjam), rebuild, `--assert` and look: the changes
      alter geometry and looks. Its own session.
      — 2026-10-06: re-vendored verbatim from `kits/ancients/src` down the chain (Iziz 28, Highlands 7, Dalab 8 incl.
      54-mat-concrete, Jimjam 6; Xanadu and Reed Lake their 7 Ancients fragments from Highlands). Every copy was the same
      stale snapshot, no local edits. Brings the `tick()` frame hook, `apron(...,mat)`, `MAT.darkSurf` tubes and the
      `bodyGroup` fix (decay 3 stands full height). `--vendor-check`: Iziz 35, Highlands 13, Dalab 13 identical.
- [x] (2026-10-13) The Ancients re-vendor session (TODO.md item 3). `--vendor-check` before: all 35 Ancients fragments
      identical (the 2026-10-06 re-vendor holds; `kits/ancients/src` changed since only in files Iziz does not vendor), and
      BIOME DRIFT in 86-bio-10-core-head, 20-core-kit, 30-core-foliage, 40-core-place. Read: each copy was simply behind
      `core/biome` (no local edit): the host's `field`/`placeH` (2026-10-08), core/tags records (`tags`, 2026-10-12), the
      shared iridescent bark (`BIO.iridBarkMat`), `standAt`'s `x == null ? d : x` defaults, and `scatter`/`clearOf`/
      `clearOf3` reading a `KSPACE` grid when core/space is on the page. All are opt-in or answer the same: Iziz passes no
      `field`, `placeH` or `tags`, never passes 0 to `standAt`, and does not load core/space. Re-vendored with
      `build.py --vendor-bio`; only the city page changes. `verify.py dist/iziz.html --assert` before and after: identical
      (858 calls, 4,957,502 tris, every counter the same but the biome's build time); the opening view looks the same
      (73 px differ, the LOD streaming count 393 vs 392 at the shot). `--vendor-check`: 35 identical, 11 biome match.
- [ ] (2026-10-06) The vernacular takes the material library (materials.json; src/88y-iziz-matlib.js binds it onto MAT through core/materials/record/26-matlib-bind.js): wood, woodV, stone, plaster, thatch, shingle and the awning cloth; the ground (dirt) stays procedural. Tint means are estimates from the painters; judged at eye level on the vernacular sheet. The Ancient MAT is bound too (but rust; see below); the port embassy and the city's own materials are not bound yet. The one console shader error the vernacular sheet reports is the same before and after.
- [ ] **The shared Ancients MAT takes library sets** (`KMAT.bindMat` with `KMAT.ANCIENT_TILES`; materials.json), except `rust`,
      which stays procedural: the library rusts smear into stripes on the stretched beam and tank UVs. ?mat=proc shows the old look.
      2026-10-13: `rust` (and 77z's scrap and rustified panels) takes `metal.rust.fine` (family cityRust, through IZIZ_MATALIAS), the
      isotropic rust PROMPTS-ready.md asked for: it has no plate or streak direction, so a stretched UV leaves no stripes.
- [ ] **The Voth embassy takes the material library** (2026-10-06): vpTile (roof.tile), vpBanco (earth.banco), vpMosaic (patterns/dalab/mosaic).
      vpBanner stays procedural (banner-hung is plain cloth: the device would go). ?mat=proc shows the old look.

## The second material pilot and M5 (2026-10-13; ROADMAP.md stages 2d and 2e)

`verify.py dist/iziz.html --assert` before and after: the same six asserts with the same numbers (766 volumes, 7,288,255
scene triangles, 858 calls, 760 registered volumes, 122,908 baked instances); only the LOD streaming count at the South
gate shot moved (4.83 M to 4.81 M managed triangles). The city page grew from 21.0 to 24.6 MB (the four new families'
maps, base64); it was already over the gallery's 16 MB a file.

- [ ] **The city's own materials take the library** (src/88y-iziz-matlib.js, materials.json families `city*`): the painting's
      walls, towers, gates and palace (izWall, izWallDark, izCap, izSand) `stone.cut.b` at their 4 m world-UV tile (contrast 2:
      at 1.0 the courses vanished at the South gate's distance); izRock `rock.rock_face`; the hills' escarpments (90a's izEsc)
      `rock.sandstone`; MAT.rust, 77z's scrap and the rustified panels `metal.rust.fine` (tinted to the procedural rust's mean,
      #7b6353); the Ancient Iziz style's planks, sand panels and concrete skins and 79's izConcOrange the existing wood, white
      and concrete families. Means measured from the maps they replace (TEX.stone 0.691, TEX.concrete 0.703, TEX.rust 0.402;
      the strata set by eye at 0.62).
      Looked at: the opening view reads the same; at the South gate the towers and wall read with a finer, slightly flatter
      grain than the procedural noise (the courses show); close at the palace's grand entrance a wall that drew flat now
      shows its ashlar. An escarpment close (the palace hill's, verify --cam 365,38,-120,305,36,-130) reads as layered rock
      where it read as a board grid, a little greyer and cooler than the procedural tan (first packed at contrast 1.3 and
      the concrete's mean it read near white; now mean 0.62, normal scale 0.6). `?mat=proc`
      shows the old look. Verge leaves the `city*` families out of its copy of the pack (its build.py), so its page is unchanged.
- [x] **Two surfaces had no good library texture.** Fixed 2026-10-14 with the owner's sets: `metal.bronze.cast` on the
      heroic statues (`cityBronze`: MAT.bronze, bronzeDark) and the embassy's gilt and brass (`cityBrass`: vpGilt, vpBrass),
      `concrete.rust.streaked` on MAT.concRust (`cityConcRust`), bound through IZIZ_MATALIAS (88y). Verge leaves them out.
- [ ] The painted ground stays the 4 m painted canvas at eye level: the library has the street sets (`ground.road.ruts`,
      `paving.*`), but Iziz's ground shader has no detail layer to take them (a ground-layer hook weighted by the road mask,
      core/export's `EXPORT.groundLayers`, is the shape). Not a texture gap.
- [ ] A world-UV material (vWorldUV, core/materials/opt/69a-world-uv.js) replaces three's uv transform, so a bound map's
      `repeat` never applies to it: an instance tiles at 1/K m whatever materials.json's `scale` says, a plain mesh at its
      own UVs. The `city*` families take scale = 1/K so the two agree; the 2026-10-06 families (stone at 2 m with K 0.25,
      wood at 2 x 1.7 m with K 0.5) do not, and the export records what the page draws (`worldUV: {K}`, repeat 1).
- [ ] **M5: Iziz exports through core/export** (core/export/README.md, "Iziz"; targets/city/94-city-export.js): a district's
      kit and biome instances, plain meshes, materials (each with its hook), library maps by reference, ground, stage,
      atmosphere and records in the `KRATOR_EXPORT` shape: buildings (with their lot's yaw and size), doors, windows and
      lamps as children of their buildings (src/69f-iziz-fixtures.js notes them as the vernacular helpers draw them), the kit's
      item sets, the furniture slots. `godot/data/world-iziz` (box -120, 292 to 120, 532) and `godot/tests/export/iziz_test.gd`
      prove it. Open: the Ancients kit's openings and lamps are not fixtures (the kit draws them merged, through no helper);
      the hyperjungle's sets in the city carry no records (its BIO.init takes no `tags`: giving it the page's registry would
      put the flora first and renumber every building id); no building has an interior, so `interiors` is empty; the box
      holds no REG furniture, so `furniture` reads empty there (it fills where a plaza, statue, fountain or drain stands);
      records with hook `glass` draw as the plain library surface in Godot (lib/glass is not wired into library.gdshader).
