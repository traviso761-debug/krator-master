# Pinnacle Rock — handoff (2026-10-19)

For the next session on Pinnacle Rock. Read `CLAUDE.md`, then this, then `PLAN.md` (the settled plan and the order of
work), `README.md` (what the page is and its checks) and `KNOWN_ISSUES.md`.

## Where it stands

- **P0 and P1 are done and signed off** (the owner, 2026-10-19: "I think we're in business"). The page
  (`dist/pinnacle-rock.html`, `python3 build.py`, `python3 verify.py dist/pinnacle-rock.html --assert`) stands on the
  scale model's land (4.21, px 755,351; `region/`, `tools/world_data.py`) with the far land drawn to 60 km (the Inner
  Wall 48 km north). The rock: the mesa (250 m, 1.2 by 0.8 km), ten fins round the rim in groups, seven spurs, the
  Garden's mesa (55 m over the top) with sixteen pinnacles, the Heart (a third mesa 110 m over the Garden's, the three
  tallest pinnacles rising out of it), the shrine's balanced rock. Every mesa is weathered to the owner's reference
  (Merrick Butte, Monument Valley): flutes, gullies, a shoulder of thin ledges to a flat usable top, and a ~34 degree
  debris slope round every wall's foot with fallen blocks (`87-pr-talus.js`).
- **The layout is settled** (diagram: https://claude.ai/artifact/Dn8qzog9vCzCvcV9gxHpZH) and is data in
  `src/40-pr-layout.js` (`PR`, `[G data]`): the zones of the top, the Deep Root cavern's precinct, the palisade, the
  nine bands' pastures, camps and thorn hedges, the farms as contour cells, the fair ground, the road, the gate, the pond,
  the spring, the gorge. Nothing past the rock and the roosts is drawn yet: the cleared ground round the mesa is bare.
- **P2 is done** (2026-10-19, branch `claude/pinnacle-p2`; not yet signed off by the owner): the roosts as records
  (`src/43-pr-roosts.js`, `PRR.plan`, made before the kits build in `47b`) drawn by `89-host-roosts.js`: 25 rings, 113 stalls (Girder's frame, wedges round bends), shelters,
  climbs, four bridges, the beast lift and the capstan lift, the Stair with three gates attached bed by bed, the lift road
  cut along the debris slope to the north-west gate; Girder's flyers (each Wing's beasts in its own stalls) read in place
  on them (`flyers/`, sealed by `build.py` `flyers_fragment`): a quetzal sent in lands on an east fin's perch. Six new
  checks and eight negatives; `verify.py --assert` passes.
- **P3a is done** (2026-10-19, same branch; not yet seen by the owner): the town on the top on `core/city`
  (`src/54-pr-town.js` `PRT.plan`, run in `54b`, drawn by `89c`): the zone is the cap less the rim band, the rock on it,
  the heads, the precinct and the bands' grounds; the hall and markets, the shrine, the Wings' barracks, the toll house,
  the beast stage, and the module's builder for the rest (the quarters' draws, a civic list that carries every trade).
  The buildings are the Beast Riders kit's and its ports, bundled by `build.py` (`CAT`, `KCITY`) and instanced through
  the isle demo's `58-isle-protos.js`, read in place.
- **P3b is done** (same branch): the farms (`src/55-pr-farms.js` `PRF.plan`, run in `55b`, drawn by `89d`): six terraces
  of field cells measured out from the mesa's smoothed foot, orchards on the outer two, paddies by the spring, twelve
  farmhouses, the palisade (stakes, Girder's gatehouses and watch posts), the terrace way and the gates' tracks.
- **P3c is done** (same branch): the bands' grounds (`src/56-pr-camps.js` `PRC.plan`, run in `56b`, drawn by `89e`): the
  kit's `BR_CAMP` grounds pitched on the top and the floor, the hedges and fences cut by `BR_RUN`, the tracks to the
  palisade's gates. `CAT.proto(key, v, {span, seed})` builds a parametric piece (build.py).
- **P3d is done** (same branch): the Deep Root cavern (`src/57-pr-cavern.js` `PRD.plan` on KCAVERN, run in `57b`, drawn
  by `89f`, which also re-cuts the cap over the openings); the page takes `core/terrain/39-core-cavern.js` (CORE_TERRAIN).
- **P3e is done** (same branch): the ways up the Garden's mesa and the Heart (`PRR.plan` `o.ascents`, set in `47b`,
  drawn with the climbs in `89`), the Garden's great-houses (`src/58-pr-garden.js` `PRG.plan`, run in `58b`, drawn by
  `89g`). **All of P3 is done and awaits the owner's look**: P2 and P3 are on `claude/pinnacle-p2`, unmerged.
- **The owner's first look at P3** (same branch): the Deep Root's door in the Garden's mesa's wall (57 rewritten), the
  storerooms (58), the upper stall tiers and the climbs' starts (43), the full viewer, core/walk (89h), core/lod and
  core/water (89w) (build.py); the kit's cavern door (an open variant; its arch legs no longer cross the doorway).
- **The night, and merged** (owner, 2026-10-19: "add night mode alone, then merge to main-origin and update gallery; full
  sim to come later"): the hour slider and N, necanyons' night fragment read in place (`89n`), the fires and lamps on
  core/atmos (`89y`), the water's clock on the host's ticks (it had been fed milliseconds); necanyons brought onto the
  whole viewer, core/water (its creek and rain pools), core/atmos's export and core/biome's stage. Merged to main and
  listed in the gallery.

## What to do next

1. **P2 follow-ups, if the owner asks** (KNOWN_ISSUES.md): a notch in the rock mesh so the Stair's flights are cut into
   the face; plants kept off the rings (plan the roosts before the necanyons kit builds); the roosts on a nav graph with
   a walker (with P3's people); a Godot builder for the roost records.
2. **P3 follow-ups the owner may ask for** (P3 is done: the town, the farms, the bands' grounds, the Deep Root, the Garden): the Deep Root cavern (KCAVERN with a KSTACKS hole, BR_ROCK dressing; the ring of twelve
   stones with nothing built inside), the farms as contour cells with twelve farmhouses, the camps (`BR_CAMP`, hedges
   and fences from `BR_RUN`), the mounts (the Longcrawler is rideable; the jungle staghorn is the staghorn's
   jungle-coloured variant), ways up to the Garden's mesa and the Heart.
3. Then `PLAN.md` P4 (the life, the night) and P5 (the record, the gallery entry: take Pinnacle Rock out of `UNLISTED`).

## Things that will bite

- **The flyers are Girder's code, read in place** (`flyers/README.md`). `build.py` lifts sections of Girder's `84a` and
  `84c` by their section comments and closes the closure Girder's `84` opens (its `84d` is not taken). A change to
  `settlements/girder/src/84*.js` reaches this page: rebuild and verify both. The roost records keep Girder's shapes
  (`ROOSTS`, `BRIDGES`) for this; change `43-pr-roosts.js`'s stall frame and the flyers' touchdown moves with it.
- **The Stair and the climbs hang on the rock AS DRAWN** (owner, 2026-10-19, after four rounds: "proceed carefully"):
  the rock mesh's wall rings are capped at 160 segments, so the drawn mesa face stands up to 12 m inside KSTACKS' outline.
  `PRR.wallR` reads the wall from `KSTACKS.mesh` itself, and the checks measure the drawn rock with rays (`ROCKRAY` in
  `99-host-take.js`: `inRock` casts from the point outward and reads the first wall's facing). Judge attachment by
  those rays, never by `KSTACKS.topAt`/`reach` alone.
- **The roost plan reads the rock** (`KSTACKS.topAt`, the rings fitted at each height from the rock's own middle):
  a change to the fins, the Garden or KSTACKS moves the rings and the stalls. The checks (`HCHK.decks`, `stalls`,
  `bridges`, `lifts`, `stair`, `climbs`, `flyers`) say what moved.

- **The rock is shared code.** KSTACKS is `core/terrain/37-core-stacks.js` (`node core/terrain/test-stacks.js`); the
  land comes from `biomes/necanyons/src/46` and `47`, read in place, which take this page's `LAND` hooks (`45-host-stage.js`).
  A change to any of them: rebuild and verify **both** necanyons and Pinnacle Rock, and rewrite only their baseline
  entries.
- **The Heart's gullies are seed-chosen** (`PR.HEART_MESA.seed` 2709) to miss its three pinnacles' feet. A change to
  KSTACKS' weathering can move a gully; the stage then reports which pinnacle lost its footing. Re-fit offline with a
  short node script (make the bodies with KSTACKS, sample each foot against the top by a pad), not by rebuilding the
  page per seed.
- **`necanyons.footD` is capped** at `footMax` (Pinnacle passes the debris slope's width + 10 m; 60 by default).
- **The debris slope's ground is necanyons' talus texture** (reads ochre from the floor; the blocks carry the red):
  `KNOWN_ISSUES.md`. A tint hook or a red talus set is a follow-up if the owner asks.
- **Index tools rewrite every build** (`tools/audit_port.py`, `tools/make_index.py`): keep only your builds' files
  and revert the rest. Tag new fragments in `PORT.md` by hand when the audit guesses wrong (it calls `87-pr-talus.js`
  `[G data]`; it draws: `[draw]`).
- **Git LFS**: built pages are LFS. After merging main, `git add --renormalize` the dist folders you rebuilt if Git warns
  of "files that should have been pointers". In a checkout without every build's textures, the hash baseline reports
  other builds' pages as changed: they are not; do not rewrite their entries.
- **The town reads three other builds in place**: `settlements/isle-demo/bundles.py` (`kcity_bundle`, `safe`, `body`),
  its `src/58-isle-protos.js`, and `kits/beast-riders` (its `src/`, `towns.py`, `tex/`; the catalog's core, runtime and
  detail module). A change to any of them reaches this page: rebuild and verify it. `towns.py` needs Girder's and Mav's
  Refuge's `tex/` pulled from LFS (`git lfs pull --include="settlements/mavs-refuge/tex/**,settlements/girder/tex/**"`).
- **`verify.py --shots` on the 12 MB beast-riders page** times out in this container's software GL; its checks pass.

## Owner's decisions to keep (2026-10-19)

The Deep Root cavern north-west of the top; the fins spread round the rim in groups, never one row; the flyer bands
(Quetzal, Wingclaw, Nightwing) camp on the mesa only; every band's pasture and camp inside its own thorn hedge; farms
that do not overlap; Dragonfly, Spider and Mammoth camps with smaller pastures on the floor; a usable flat top with
rough 30-45 degree slopes at the edges, not a mesa weathered all over.
