# Known issues

Open items start with `- [ ]` (build.py prints them after every build). The Port kit's own list is
`kits/port/KNOWN_ISSUES.md`; shared-fragment problems found from Hook are recorded here, not fixed in the kit
from a Hook task.

## The Ancient city (the owner's site plan: S1 the ground, S2 the records, 2026-11-24)

- [x] **M1's first layout is replaced.** The Sunk City and Scarp City thirds, the old axis as a spine and the crest at
      188 m are gone with it; S2 lays the site plan (`README.md`, "The Ancient city").
- [x] **The landforms sampled their own noise at every load.** Each of the nine wandering benches sampled its wander's
      steepest slope over 23k points (6.7 s in node for the nine); the records now state it (`wg_n`, written by
      `world/cut.py --landforms` through `core/world/landform_wg.js`) and `WLAND.check` samples it again (2026-11-24).
- [ ] **The plan costs about 0.8 s (node) at load.** 2,022 blocks over a 10 km square; its ground reads are memoized by
      point (13,144 reads, down from 17,046), each a full `WORLD.H` (about 40 us: the model's own relief noise). Baking
      the records at build time is the fix, but they are 1.07 MB as JSON (the blocks 747 KB): a compact columnar bake, or
      the blocks left out of the page (only the towers, heaps and freeway are drawn), first.
- [ ] **Heroes up close, massing beyond: no shell or impostor tier between.** 90d draws the ten standing towers nearest
      the camera (within 700 m) as the kit's heroes and 90c's massing stands for every other; the kit's shells
      (KSHELL) exist for the Spindle and the Ledger only (the other designs wait on the kit's shell review), so the
      middle distance is massing and a tower changes from a box to its hero at the switch (at the same height: the
      massing stands to the kit's own `MP.ruin` top).
- [ ] **The jungle costs about 23 s at load.** About 63,000 trees over the whole ruin and into the gap by the town (a 9.6 km square, the outer city at a
      fifth of the heart's density: 90e `HOOK_FLORA`); placing them is 9 s and baking 12 s. The plateau beyond the square
      has the painted ground only. Baking the placement (its records are deterministic) or growing the outer city's far
      trees as impostors only would cut it.
- [ ] **The flora's detail is static.** The kit's LOD is set at placement by the distance from a spine of eight points
      through the ruin (hero 180 m, mid 520 m, the far impostors beyond); away from the spine a close camera sees the
      mid and far trees. The undergrowth stands within 900 m of the centre only (over the square it cost 16 s).
- [ ] **A wild look draws its plain state up close.** The kit's overgrowth (`59e-mp-overgrow.js`, `MP.overgrowDress`) and
      flora dress (`59d`) need the biome core's leaf sets, which the Port page does not load; the massing's green tint is
      the jungle's only sign on the ruin until S4.
- [ ] **The design families' ruin heroes are clipped in the host.** `MP.ruinDesign` (kits/metropolis 59b) cuts a design's
      glass and floors but not its frame, so a crown, broken or stump hero stands at full height; the Ancient's Valley
      clips it at `MP.ruin`'s top in its host (`70-host-city.js`, `avClipHero`) and Hook does the same in 90d (by triangle
      and by panel, without the valley's floater pass). The cut belongs in the kit, once, for both.
- [ ] **A hero is built on the frame thread.** About 80 ms a new key (family and state) the first time, as many as
      fit in 40 ms of a frame (at least one). While the page is idle the keys of the towers within 1.8 km of the camera
      are built ahead (nearest first, 24 at most), so a flight into the downtown finds most of them; a first flight
      straight in before the page has idled still stutters. A worker cannot build them (three.js geometry).
- [ ] **The hunters' camp moved.** The sketch put it on the plateau's edge where, under placement B and the coastal
      plain on the low ground only, there is water; it stands on the nearest dry ground, the plateau's north foot.
- [ ] **The flora's texture count is shared by design.** The kits' library cards count on `window._texPending` as the
      material library does; the closure forwards it to the page's, and `check_assembly` lists the two writers as a clash.
- [x] **Two places were not laid** (fixed 2026-11-24): the Drowned Spire's village is 18 grown pods on the Spindle's
      surface, the deck camp its shacks on the deck (77m). Their people, and every place's, are in the simulation by
      neither yet.
- [ ] **The Spire's pods are drawn far as massing inside the Spire's.** A pod's record stands at its host's middle (as the
      town's pods do, 90b); near the camera it is grown on the surface, beyond it hidden in the Spire's massing.
- [ ] **The salt pans have no road.** Their ground is cut off from the streets by water; they are served from their quay.
- [ ] **Two places moved.** The mangrove stilt camp's point (C2) is in the open bay and the salt pans' ground (C6) too
      cramped for its houses: each stands at the roomiest dry ground within 1.5 km (937 m and 433 m off). The Islanders'
      row has no stilt houses for a camp standing in the water.
- [ ] **The settlers' and salvagers' rows are Hook's own.** 77m `SETTLERS` is core/hamlet's iziz row with lumber, way
      station, post and hunting works (on the Vernacular's pieces and the opt-in saw pit and shrine,
      `kits/iziz-vernacular/extra`); `SALVAGE` is the post-apoc kit's pieces. Both fold into core/hamlet with the kit's
      extra pieces at the next all-builds rebuild (TODO.md, "Ride along").
- [ ] **core/hamlet: a resource on the village point leaves its works no facing.** `KHAMLET.village` faces a works
      building from the point to the resource; with the two equal its box is zero and later houses overlap it. Hook puts a
      works village's resource 150 m out (77m `outward`); the guard belongs in core/hamlet 30 (a shared change: 56 pages;
      TODO.md, "Ride along").
- [ ] **The ruin stands in the town's reserve.** The plan leaves only the quarters (and 60 m) to the town; the build zone's
      reserve south of them is ruin now. A quarter the town grows into later (the site editor) takes its ground back on
      the next build: the ruin's blocks follow the quarters, not the other way round.
- [ ] **The roads are lattice roads.** A link runs on the Ancient city's street grid (its corners square); outside the
      city limits the grid is the same lattice. A road's own curve (KCITY's) is a later pass.
- [ ] **The plateau's own north coast is straight.** East of the wall the plateau's north foot runs straight for some
      4 km: the scale model's 2 km cells, not Hook's records (the mainland strip only raises the water before it).
      `core/coast` would curve it in the open world; on Hook's page it is the model's line.
- [ ] **Lightwall was not rebuilt with this 41l.** Its ground bake (`core/world/bake_ground.py`) had fallen behind its
      region: fixed 2026-11-24 (a stub `KHAMLET.xanaduRow`, the region's laid villages `src/47*-site-*.js`, the land
      chain from `40-world-smooth.js` with core/terrain's stacks), so `python3 tools/build.py settlements/lightwall` builds
      again. But its `verify.py --assert` fails `world-ground`: the region's new relief is rougher than the 16 m bake
      carries (max 39.6 m off `WORLD.H`, mean 0.56; the check asks under 3 and 0.5), and the page was behind several of
      its sources besides (core/water, the materials, its camera). Its committed page is left as it was: the grid's cell
      (or the check) is Lightwall's call. It takes none of the outlined benches, so it renders the same.
- [ ] **The Ancient grid is Hook's own, not lifted.** The owner's answer 6 has the grid lifted out of the valley
      (`AV.plan`'s lattice and ruin field) by Hook's phases; Hook's plan is still its own fragment, borrowing the
      valley's far ruin shares as numbers. Lifting both into one shared step is the owner's call on where it lives.
- [ ] **The design table is a copy.** The plan (77, `[G data]`) runs before the kit's closure (77g, which the heroes
      use) and stays free of the kit and its interiors, so `HOOK_RUIN_PLAN.DESIGNS` copies footprints, roofs and tips;
      `tests/test-hook-ruin.js` fails when the kit's records move. A baked plan (above) would take them from the kit.
- [x] **The three Ancient roads out of Hook are laid** (2026-11-24, 77m): each from where it comes ashore to the road net.
      Their causeways over the drowned flat (net51's first leg) are not drawn. Was: the south road is the plan's; net51's routes beyond the
      city limits (to Pylon, Torus, Spirladunon) are not yet joined to it.

## The ground on 5.1 (the port onto the integration line, 2026-11-24)

- [x] **`KLAND` retired.** The branch's lift of the old open world's land rule (`core/terrain/40-core-land.js`, from
      `openworld/little-demo`) predates core/world's rewrite; Hook now reads `core/world/41-world-fields.js` and
      `41l-world-landforms.js` in place over its own cut, as `settlements/pinnacle-rock` does. 41 is not patched.
- [x] **The cut is 5.1's** (`world/cut.py` on `tools/scale-model/model/data`, 500 m cells), no longer a saved 4.21 page.
- [x] **On 5.1 Hook's pin is a wet cell on a drowned flat** (6 m under the Ring Sea, -10 to +5 m for some 8 km, the
      plateau 1.5 km east), where the branch's search (the first sea due north of the pixel) finds a ripple. The owner
      chose a spit at the pin (2026-11-24), as the continental records describe it ("Hook peninsula", "Hook spit", a
      causeway at the head of every road out): `world/landforms.json`, three 41l benches at +5 m (the peninsula, the
      hook's shank, its barb). The frame is laid on the nearest straight real coast (sea a metre deep 300 m out, dry
      land 200, 400 and 600 m in, five stations within 250 m of their line): the peninsula's north shore, 631 m north of
      the pin, bearing -0.3 deg. `tests/test-hook-world.js` holds it.
- [ ] **The spit is Hook's own records until the scale model carries them.** The same three records are written up for
      the model's edit queue (the coordinator; the side-session notes, `hook-map-edit-spit-2026-11-24.md`). `cut.py`
      skips any id the model already has, so after the edit a recut takes them from the model and `landforms.json` goes.
      Until then the open world's regions (none holds Hook yet) would not show the spit.
- [ ] **41l's bench check reads a chain of benches as each other's toe** (`WLAND.check()` turns every bench off to read
      the natural ground, so a neighbour's fill shows as this bench's toe out of reach: `toeOut` on all three). Each
      bench is level inside and no face is over its batter; the chain's toe is checked on a ring outside it instead
      (`tests/test-hook-world.js`). Fixing the check (the others left on) is a core/world change, not made from Hook.
- [ ] **The Heights and the hill are the kit's stamps again.** On the spit at +5 m the model has no such relief, so
      `76-hook-ground.js` keeps both ramps (on 4.21 the model's slope made both unnecessary). They are the town's own
      ground (a ramp sets the height), not the map's.
- [x] **Marr in the districts** (the owner, 2026-11-24): `kits/marr`'s `VERN.def` records ride in the IZV closure with
      the Vernacular (`build.py` `izv_marr_bundle`), `marr` is a culture of the programme, and the Customs, the Heights,
      the Arsenal and the Stacks take shares of it (`site/hook-site.json`). Its civic pieces (the Navigators' Guild, the
      sea-temple, the aduana, the governor's palace) are not landmarks of Hook's: none of the plan's set pieces is Marr's.
- [x] **Marr's buildings wore Iziz's textures** (found in review, 2026-11-24). Marr's files followed Iziz's library bind
      (`88y-iziz-matlib.js`) in the IZV closure, so `69m` cloned already-bound materials and Marr's own pack bound nothing.
      They now load before it (`build.py` `izv_marr_bundle`, as Iziz's page orders them), and `verify.py` checks every
      family of `kits/marr/materials.json` on its own set (`hook-marr-materials`). A Marr key is now Marr's in
      `HOOK_PROG.cultureOfKey`, not Iziz's.
- [x] **A black band under the horizon** in the views that look inland over the lagoon. The Port kit's sky dome
      (`kits/port/src/90-scene.js`) took `pow(h, .55)` of a height it clamps to -0.05, undefined below the horizon in
      GLSL (black on the GPU); the kit's own sheets never saw it, their ground covers it. Fixed in the kit
      (`pow(max(h,0.),.55)`); the kit and the Dam Basins rebuilt.
- [x] **The grid's block and street are clamped** as the editor clamps them (`SITE.cleanGrid`): a hand-edited 0 in
      `site/hook-site.json` looped the host grid forever (`targets/hook/89z-rows.js`). The frame's origin stands on the
      shoreline found at its station, not on the fitted line (up to 250 m off it).

## The site and the Ancient town (P1)

- [x] **The site editor page** (`dist/hook-site.html`, 2026-10-19). Voth's editor (`settlements/voth/targets/voth-site`)
      is written against Voth's scene: its tools read `VIEW.surf/pick/ext/sprite/refreshTerrain/ovTex/ovCanvas/mmBase/
      labels/cantonList/causeways/causewayHit`, `TERR.h/delta/dab/sync/n`, `VOTH.SEA/landDist/RLAND/DISTRICTS/CWAY`,
      `HOSTUI.labels` and the DOM of its own `00-head.html`. `build.py` reads its model, tools and head in place (a
      site target, `SITE_TARGETS`) and `targets/hook-site/94-hook-site-adapter.js` gives every one of those on the Port
      kit's ground; `96-hook-site-model.js` adds the quarters' fields, the hosts and the grid to the saved file;
      `serve.py` takes `POST /save/hook-site`. README.md, "The site editor". What is left of it:
- [x] **The editor's ground strokes are applied by the build** (2026-11-24). `src/76b-hook-strokes.js` replays the saved
      strokes (`site/hook-site.json` `terrain`) with the editor's own arithmetic onto a delta grid and adds it to
      `PORT.natH`, so every stamp, pad and lot stands on the edited ground; the editor's page leaves them to its live grid
      (`HOOK_EDITOR`). `tests/test-hook-strokes.js` checks raise, lower and smooth and that the page's ground is the
      editor's to a millimetre. One difference: the editor's smooth reads the ground with the kit's stamps, the page's the
      natural ground under them. The site has no strokes yet.
- [ ] **The editor keeps Voth's page conventions where they do no harm.** Voth's panel strings that name Voth
      (the ferry and elephant-bug modes, causeways, "add Voth's current districts") are hidden, not removed: the
      tools (`55-site-tools.js`, read in place) still bind them. A quarter's label in the editor is its name only; the
      city plan's own drawing (`90b`, with the streets) is under `z`. The Port's own inspector panel and caption are
      hidden on the editor page; its view select and the segment-bounds button stand bottom-left, `core/lod`'s panel
      beside them.
- [x] **The ridge and the cliff were ramp stamps** on the kit's flat coast (a plateau with a straight back edge, a dark
      band 1.2 km behind the quays). Since 2026-10-19 the ground is the scale model's (README.md "The ground") and
      both stamps are dropped: the model's slope stands higher than either.
- [x] **The model has no cliff behind Hook**, and the plan no longer wants one (the owner, 2026-10-19): the site ends at
      a gentle hill, which the model's own slope gives (+139 m at the site's inland edge). `76-hook-ground.js` keeps a
      gentle hill stamp for a model that lacked it.
- [x] **Hook's pixel was 6.7 km from its waterfront.** The owner moved it to the shore (2026-10-19): px 537,593 in the
      model's settlements store and in `openworld/little-demo/source/settlements.json`; the shoreline is now 124 m
      seaward of the pixel. The cells north and west of the old pixel are still FLAGGED sea in the model while their
      ground lies above the sea's level (53 of the cut's 328 water cells): the model page draws them as sea, the 1:1
      rule does not; a model edit if that ever matters.
- [x] **A 10 % slope under the whole site** (the 4.21 cut). Gone on 5.1: the spit is level at +5 m, and the only slopes
      left are the Heights' and the hill's own ramps (the kit's stamps), where the pads and the lots' plinths still meet
      them (the items below).
- [x] **The Point is at the world's east end.** The kit's frame turned to put the sea north is a half turn (a
      rotation, never a mirror), so the kit's −x end (the Point, the Strand) lies at the world's east and the Stacks at
      the west. The owner keeps the run as it is (2026-10-19): Iziz's segments east, Voth's west; `PLAN.md` section 1
      reads its zones from east to west.

- [x] **The ghost tower at the Imperial quay** (the owner, 2026-10-19). A lattice of window panes, struts and tubes
      some 190 m tall stood at the quay's seaward edge, near the kit's origin, since P1. It was every host's
      instanced detail: the kit's `bodyGroup` (`54-mat-concrete.js`) calls `useGroupXF` on a sub-group whose matrix
      is local to the builder's group and then `endGroupXF`, which replaced the host's frame by the sub-group's and
      then cleared it, so every `kput` piece after that landed in local coordinates while the skin meshes, added to
      the groups, stood on the pads. `79-hook-ancient.js` now composes the frame from the world matrix while a host
      builds and falls back to the host's frame, never to none. (Ys places its hosts the same way: whether its
      struts stand where they should is a question for its owner.) On the way: the hosts' skin meshes carry
      `lodSkip` (a thin folded skin that `core/lod`'s clustering would thin at range), and the hosts' holes were
      lowered from the kit's full decay (a ruin holed a fifth, a repaired host a third, `HOLES`; Ys keeps 0.4), so
      a ruin stands as a building the town lives in; a wreck (the Stacks' toppled blocks) can take a higher value
      per record later.
- [ ] **A host's pad flattens the slope it stands on.** A host on the Heights' front slope (row 2 of the grid) is
      skipped for that reason; the named hosts on the ridge's foot stand on a flat pad cut into the slope. The Ancient
      stair and the funicular (P3) will dress the step.
- [ ] **A host's registered volume is shrunk to the kit's clearance.** The kit registers a tower with a generous
      radius (130 m); Hook shrinks it to the host's cap and then to the pad's half-width less `PORT.CLEAR` (8 m), so
      `port-clearance` passes. For the Bastion (podium 52 m on a 110 m pad) and the Bell Hall the inspector's volume
      is a few metres smaller than the building. A pad wider than `PORT.WMAX_NEW` is the kit's rule to relax.
- [ ] **The Bell Hall's constant is renamed at build time.** `kits/ancients/src/8ap-host-e-bellhall.js` declares
      `HBH`, and so does the Port's haven (`85-hb-3-haven.js`); `build.py` reads the kit's file in place and
      substitutes `HBLH` (`HOST_SUBST`), the one adaptation. The skyscraper helpers the hosts call (`skyPlinth`,
      `skyRooms`, `skyHoist`, `skyShards`...) and the glass-shard helper are lifted from `52-sky-abc.js` and
      `42-offices.js` by marker (`sky_helpers()`); a kit change that moves them past `function buildSkyA(` or
      `// INTERIORS.` breaks the lift loudly.
- [ ] **The funicular is not placed.** `kits/ancients/src/8ap-funicular.js` (Verge's) needs a route record (the
      ridge's foot to its top beside the Hook's axis) and the kit's funicular builder in the page; P3.
- [ ] **Seven grid hosts only.** The grid's probability (`site/hook-site.json` `grid.p`, 0.45 in the core) and the
      rules that keep a block free (near an avenue, on the Heights' front slope, over a Port footprint) leave 7
      drawn hosts beside the 8 named ones. The owner tunes `p`, `pEdge` and `weights` in the site file; P2 fills the
      other blocks with the cultures' lots.

## The landmarks (P3)

- [ ] **The landmarks are the kits' civic pieces on avenue lots, not the plan's set pieces.** Step 6 places a civic
      piece on an avenue near its marker, so each landmark is what its kit has: the Vernacular's governor's palace
      (the shared vassal programme's, not yet in Hook's dress of Ancient decks, radar domes and anchor gates), the
      Kautoan governor's *hall* (the palace court `ip-palace` is 102 x 122 m and fits no avenue lot), a Voth temple
      from the catalog for the Temple of the Sun (the pyramid's tiers on the heliport pad are `vothlift.py` work),
      the catalog's monastery chapel for the necropolis (the tombs in the tank farm are lifted from Voth's source
      library too), the post-apoc cages for the slave market (the compounds themselves are the Port's `chCourt`).
      Not placed at all: the Ordinator fortress's wall across the berth's apron and its breach (the wall records of
      `KCITY.site.wall` with Voth's lifted wall drawing), the toppled Vothic statues on the pier's head, the Izani
      legion camp on the heliport apron and the two war-walkers (`kits/mechs`), the gibbet stations as lamp posts,
      the painted-over diamonds. Each is a record with its own drawing to write.
- [ ] **The damage field marks lots; it dresses nothing yet.** A rubble lot is a dark heap over its footprint; a
      scorched lot keeps its building with a tag. The breach, the holed pen roof, the cut summit and the scorch and
      scaffold dressing are records still to draw. A field now has a falloff beyond its edge (`soft`, m; the editor's
      "falloff"; 2026-11-24), and the eastern harbour's takes 220 m: 52 rubble lots and 149 scorched at this seed, where
      the hard edge made 12 and none.
- [ ] **Pods on two hosts only, in the Tethyan quarter.** The Bell Hall and the Capsule Stalks take Hykkousoi pods
      through the Ys kit's `HYK.placeOn` on the kit's host spec; the pods record nothing on their host (Ys's
      `ysHostInhabit` is stubbed) and cut no way-in through its skin (no `ysWallHole`), so a pod stands against the
      face. The Stalks' tubes are all present (no `ysSocketTaken`), so a pod there may meet a tube. The other
      layers' additions (Islander stilt decks in a shell, Vernacular markets hung from the towers, Vothic townhouses
      into a shell) have no host mode in their kits.

## The town (P2)

- [ ] **The host-lot rule is a tag, not a building yet.** `PLAN.md` section 3 wants a lot on a ruin to draw the ruin,
      then its culture's addition on and into it (Ys pods on the face, markets hung from the towers, stilt decks in the
      shell). The hosts are filed as hard landmark footprints, so no lot stands ON one; a lot whose box stands within
      `HOOK_PROG.hostReach` (6 m) of a host's pad is marked `host: <the ruin's name>` in its record and in `core/tags`
      (22 of 1728 at this seed). The additions themselves need each kit's own host machinery (Ys's `hykAccrete`
      and `HYK.placeOn` take a host record with `rAt`; the Vernacular and the Islanders have no host mode): P3, with
      the landmarks.
- [ ] **The nautical salvage style is a tag too.** A poor lot takes it with chance 0.6, a middle lot 0.25
      (`HOOK_PROG.salvage`; 591 of 1728): the record and its tag carry `salvage: true`. Only the Islanders' poor
      houses read anything like it (their own scrap patching, on by the kit's rule); hull roofs, container walls and
      crane-cab towers on the other kits' pieces are builder variants the kits do not have. Named in PLAN.md section 3;
      the kits' work.
- [ ] **No civic buildings, no side streets.** Step 6 places nothing (`tune.civic` is empty: the landmarks are P3),
      and at this seed step 10 made no side streets (on the 5.1 spit the 170 ways are 3 avenues, 67 main streets and
      100 alleys; on 4.21, 51): the blocks are filled by the alleys and the infill. The Customs' and the Heights' lots stand on the alleys more than
      on streets; P3's landmarks and a side-street pass with the quarters' own spacing are the next step.
- [ ] **The quarters' mixes are the site file's, not the plan's totals.** PLAN.md section 3 gives the city's shares
      (hukoa 30 %, iziz 27 %...); on the 5.1 spit the lots are iziz 554, voth 378, hukoa 291, salvage 144, tethys 131,
      marr 123, kautoa 95 of 1,716 (iziz 34 %, hukoa 17 %), because the Customs and the Heights hold most of the
      buildable ground and the Point and the Strand little. The owner tunes the quarters' `cultures` in the site file (the editor saves them).
- [ ] **The kits' pieces stand on the slope with a plinth, not terraced.** Every lot takes the hillside stance
      (its floor at its highest corner, a stone footing down to the lowest: `stance: 'high'`, `maxDrop` 7). On the
      5.1 spit that matters only on the Heights' and the hill's ramps; a terrace per block (the streets stepped by
      `core/city`) is still the proper answer there.
- [x] **The town read pale** (the owner, 2026-10-19: "did all our textures and colours come through?"). The textures
      did (every kit's maps bound, sRGB, 512 px); the colours did not: a kit draws its detail as instanced meshes with
      a colour PER INSTANCE (the Islanders' patterned walls and thatch, the Vernacular's timber), and the flatten
      copied geometry and matrix but not the instance colour, so every tinted piece came out in its material's base
      white. `HOOK_DRAW.flatten` now bakes the instance colour into a vertex-colour attribute on every part and every
      canonical material reads vertex colours. **The isle demo's drawing (`settlements/isle-demo/src/60-isle-draw.js`
      `DRAW.flatten`) has the same omission**: its towns are pale for the same reason; one shared copy of the drawing
      would carry the fix. Two smaller causes on the way: the massing beyond the near radius was tinted in pale flat
      colours (now each key's own tones, read off its prototype) and the Port kit's warm haze was tuned for one run of
      coast (thinned on the town's page, `scene.fog.density`).
- [ ] **The far town is massing.** Beyond `HOOK_DRAW.nearR` (400 m) of the camera's target a lot is a body and a
      roof in its kit's tone; within it the piece is built once per key and variant by its kit's closure and drawn
      merged, one mesh per material (the kits make a fresh material per build, so materials are canonicalised by
      their properties: `HOOK_DRAW.material`). Since 2026-11-24 a material's base colour is not in its fingerprint: it
      goes into the parts' vertex colours, so pieces that differ only in colour share one draw call (the Heights view
      from 946 calls to 423, its near town from 659 meshes to 133; every preset is under the Port's 900). This is
      the isle demo's drawing rule (`settlements/isle-demo/src/60-isle-draw.js`) copied; one shared copy, in
      `core/city` beside `52-city-host-buildings.js`, is a follow-up for the city-layout module's owner.
- [ ] **The kits are sealed with stubs.** The Hykkousoi and the post-apoc closures stand in for the furniture and the
      interiors (`build.py shim_head`): no furniture is placed on the town page; the post-apoc set is built with the
      `generic` culture pack. `KPA.proto` rebuilds its whole site list per prototype (the kit's `build()` resets it),
      which is fine for one piece at a time.
- [ ] **Three bundle copies.** The Islanders and the Vernacular come through `settlements/isle-demo/bundles.py`
      (imported); the Voth catalog, the Hykkousoi and the post-apoc closures are Hook's own in `build.py`, on the
      same pattern as `settlements/voth/foreign.py`. One shared bundler under `tools/` is owed to three builds now.

## The layout against the plan (P0)

- [ ] **The grounded giant and the pier's buoys.** The plan wants `vsGiant` at decay 3 in the pier's slip; the pier's
      vessel hook (`81-pp-pier.js`, `portPlaceVessel(..., d)`) builds the vessel at the PIER's decay, 0. The layout
      therefore gives the pier `fleet:[null]` and places the giant itself as a free vessel at d=3 in the slip (x +72,
      bow out). With no vessel of its own the intact pier moors two buoys in the slip (local x 72, z 120 and 260):
      they stand inside the giant's hull, hidden by it. A layout option to pass a vessel's decay through the hook
      would remove the workaround (a kit change).
- [ ] **The eastern crane is the plan's "signal mast" only by its decay.** `cgCrane` at d=1 is the kit's ruined crane;
      no dressing yet says signal mast. P3 (the layers' landmarks).
- [ ] **Decays meet at the joints.** Neighbours of different decays (an intact quay beside a ruined crane, the
      intact Arsenal beside the ruined covered dock) each close their own side at their own decay; the kit's
      targets never mixed decays in one run, so the joints were not designed for it. Nothing wrong was seen in the
      P0 shots; read the joints again when the layers come.

## Shared helpers (the kit, not fixed from here)

- [x] **`PORT.natH` is a kit change, approved by the owner (2026-10-19)** (`kits/port/src/71-port-terrain.js`, two
      hunks: `portNatH` reads `PORT.natH` when a build sets it, else the kit's own coast as `portNatH0`; the nature
      scatter skips a tree under sea level). The Port's pages are rebuilt with it; a build that sets nothing is
      unchanged. `portShore` (the kit's wandering waterline) is still read by the scatter's land test
      and by nothing else that matters to Hook.

- [x] **Black decks, sheds and roofs: the kit's texture pack was Git LFS pointers.** In a fresh worktree
      `kits/port/tex/*.webp` are 130-byte LFS stubs until `git lfs pull --include="kits/port/tex/*"`;
      the pack then carries 199-byte data URLs that fail to decode, `_texPending` ends at 0 with no panel error, and
      every library-bound material (the intact paving, the white panels, concrete) samples an empty map: black. The
      kit's own `targets/harbour` page did the same here (2026-10-17). Pull the kit's `tex/` before building Hook;
      README.md says so. A verify check for pointer-sized pack entries would catch it earlier (a core/materials/record
      change: `KMAT.pack` could refuse an entry under 1 KB).
- [ ] **`hook-vessels-afloat` reads the kit's silted berths as shallow.** `slBerth` and `slPen` at d=1 silt their
      basins by design; the carrier and the pen's submarine report ground above their draft. The check is soft.
- [x] **The segment-boundary labels overlap** at this run's length (29 placed items; the kit's own issue). - 2026-10-20: fixed in the kit (`portBoundsDeclutter`, kits/port/src/92-camera.js; Hook builds it): 11 of the 29 labels show at the Overview, none overlapping.
