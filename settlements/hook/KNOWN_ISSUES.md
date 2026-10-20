# Known issues

Open items start with `- [ ]` (build.py prints them after every build). The Port kit's own list is
`settlements/port/KNOWN_ISSUES.md`; shared-fragment problems found from Hook are recorded here, not fixed in the kit
from a Hook task.

## The site and the Ancient town (P1)

- [x] **The site editor page** (`dist/hook-site.html`, 2026-10-19). Voth's editor (`settlements/voth/targets/voth-site`)
      is written against Voth's scene: its tools read `VIEW.surf/pick/ext/sprite/refreshTerrain/ovTex/ovCanvas/mmBase/
      labels/cantonList/causeways/causewayHit`, `TERR.h/delta/dab/sync/n`, `VOTH.SEA/landDist/RLAND/DISTRICTS/CWAY`,
      `HOSTUI.labels` and the DOM of its own `00-head.html`. `build.py` reads its model, tools and head in place (a
      site target, `SITE_TARGETS`) and `targets/hook-site/94-hook-site-adapter.js` gives every one of those on the Port
      kit's ground; `96-hook-site-model.js` adds the quarters' fields, the hosts and the grid to the saved file;
      `serve.py` takes `POST /save/hook-site`. README.md, "The site editor". What is left of it:
- [ ] **The editor's ground strokes are not applied by the build.** The brushes (`R`/`L`/`M`) edit the editor's
      `TERR` delta grid, the Port's terrain chunks follow and the strokes are saved in `site/hook-site.json` `terrain`,
      but `build.py` and `90a-hook-city.js` read `terrainH` only: `dist/hook.html` stands on the model's ground ("The ground" in README.md) without them. A
      layout stamp made from the strokes (the kit's `ramp`/`flat` stamps, or a `core/terrain` carve) is the next
      step; until then a ground edit is a note to the owner, not a change to the page.
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
- [ ] **A 10 % slope under the whole site.** Every land block's flat stamp and every host pad cuts a bank into the
      slope (a 110 m block: an 11 m bank at its back); the kit's soft rings blend them. The waterfront reads well
      (the P0 run's verify passes); the town behind will want its streets terraced by `core/city` (P2) rather than
      pads cut one by one.
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
      scaffold dressing are records still to draw. At this seed the field (0.8 over the whole eastern harbour) makes
      every lot in it rubble and none scorched; a painted gradient (the editor's fields) would grade it.
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
      and at this seed step 10 made no side streets (the 51 ways are 3 avenues, 5 main streets and 43 alleys): the
      blocks are filled by the alleys and the infill. The Customs' and the Heights' lots stand on the alleys more than
      on streets; P3's landmarks and a side-street pass with the quarters' own spacing are the next step.
- [ ] **The quarters' mixes are the site file's, not the plan's totals.** PLAN.md section 3 gives the city's shares
      (hukoa 30 %, iziz 27 %...); at this seed the lots are iziz 258, voth 159, hukoa 130, salvage 58, tethys 39,
      kautoa 27 of 671, because the Customs and the Heights hold most of the buildable ground and the Point and the
      Strand little. The owner tunes the quarters' `cultures` in the site file (the editor saves them).
- [ ] **The kits' pieces stand on the slope with a plinth, not terraced.** Every lot takes the hillside stance
      (its floor at its highest corner, a stone footing down to the lowest: `stance: 'high'`, `maxDrop` 7); a
      terrace per block (the plan's streets stepped by `core/city`) is the 10 % slope's proper answer (the P1 item
      above).
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
      their properties: `HOOK_DRAW.material`). The Port's showcase budget (900 draw calls) is met at most presets;
      a preset on the Heights looking over the whole core may still run over (a soft OVER in the verify). This is
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

- [x] **`PORT.natH` is a kit change, approved by the owner (2026-10-19)** (`settlements/port/src/71-port-terrain.js`, two
      hunks: `portNatH` reads `PORT.natH` when a build sets it, else the kit's own coast as `portNatH0`; the nature
      scatter skips a tree under sea level). The Port's pages are rebuilt with it; a build that sets nothing is
      unchanged. `portShore` (the kit's wandering waterline) is still read by the scatter's land test
      and by nothing else that matters to Hook.

- [x] **Black decks, sheds and roofs: the kit's texture pack was Git LFS pointers.** In a fresh worktree
      `settlements/port/tex/*.webp` are 130-byte LFS stubs until `git lfs pull --include="settlements/port/tex/*"`;
      the pack then carries 199-byte data URLs that fail to decode, `_texPending` ends at 0 with no panel error, and
      every library-bound material (the intact paving, the white panels, concrete) samples an empty map: black. The
      kit's own `targets/harbour` page did the same here (2026-10-17). Pull the kit's `tex/` before building Hook;
      README.md says so. A verify check for pointer-sized pack entries would catch it earlier (a core/materials/record
      change: `KMAT.pack` could refuse an entry under 1 KB).
- [ ] **`hook-vessels-afloat` reads the kit's silted berths as shallow.** `slBerth` and `slPen` at d=1 silt their
      basins by design; the carrier and the pen's submarine report ground above their draft. The check is soft.
- [ ] **The segment-boundary labels overlap** at this run's length (29 placed items; the kit's own issue).
