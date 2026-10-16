# Mungo — known issues

Open items are `- [ ]` lines; `build.py` prints them.

## core/host (2026-10-15)

- [x] (2026-10-15) Mungo on core/host (ROADMAP.md section 10, stage 3 step 5; `core/host/README.md`), with Locus's fragments it
      reads (45-kit, 53-assets, 66-locus-furnish, 86-inspect, 98-start: settlements/locus/KNOWN_ISSUES.md): `build.py` takes
      `khost.FULL` (origin core/host, core/edits, core/space); `src/80-camera.js` keeps a ctl shim, setView, VIEWS, the world
      clock MCLOCK and the page's frame (`camFrame`, `camDraw`); the census panel (84-mungo-life.js) sits under the paths select.
      Every REGISTER()ed site is a core/tags record (3,478, 0 unknown). The inspector, marks, pictures (629 catalog pieces), the
      editor (pieces placed live; the page's own moved or removed on reload) and the cutaway (every building) are new. Proof:
      `verify.py --assert` every invariant PASS as before (22), all 146 counters identical to the old page's, draw calls the same
      (435); the scene census (LOD flushed) at four views matches the old page within its own run-to-run noise (`biome:bark4`
      moves between runs of either page); the inspector, cutaway, editor (place, undo, deferred remove) checked headless.
- [ ] (2026-10-15) Keys: as Locus's (F the host's walk, G the pin, I the hover tip, P marks, B edits, X cuts; M the page's own
      minimap, 88b + 88c). Mungo has an economy (core/simulation SIM) but hands the host no `holds` yet: no stocks panel (O) and
      no contents in the inspector until `KHOST.simHolds(SIM, {idOf, containerOf})` is wired (Voth's 56e is the standard).

## The world

- [ ] The canonical eastern-abyss biome (`core/biome` + `biomes/eastabyss`, since 2026-10-05) has six species the old port lacked (seal-tree, cordaite, seed fern, araucaria, beard oak, water palm): about +3 M triangles headless (Locus 6.2 M -> 9.0 M, Mungo 6.0 M -> 7.8 M), and the triangle budget (`05-palette.js`, shared) went from 7 M to 10 M. The town trees are grown after the biome's passes (`EASTABYSS.make` / `grow`, 69z), so they no longer take a keep-clear entry the passes would avoid; the town is masked out of the passes anyway. If the frame rate on a weak GPU suffers, thin the new species in the kit or pass a lower `quality` in 69z.
- [x] The open lake shades with `core/atmos`'s wave field (`90-atmos-host.js`, 75-terrain `waterOpenAt`) but is not displaced: a swell would rise through the reed decks and jetties. The sky's light (`ATMOS.skylight`) is not taken: it lights MeshStandardMaterial only and this is a Lambert world. — 2026-10-13: the open lake is core/water's (`90w-lake.js`, Locus's, read by Mungo): displaced by a calm share of the wave field (at most ~6 cm, so the decks and jetties keep their waterlines), the sky's light given to the lake only. The river, the channels and the pools stay on 75-terrain's sheet (core/water's flow and still kinds, later phases); the life layer's boats ride the lake (`lakeHeave`).
- [ ] The lake and the sheet meet on the shoreline through a baked mask (`LAKE_MASK`, 8 m cells, linear across the line): both shaders split on the same texture, but the water is displaced a few centimetres and the sheet is not, so at a grazing angle the line can show as a hairline where a channel crosses the shore. Phase 2's shore field (core/water) replaces the mask.
- [ ] The sky panel's own clock controls drive the world clock now (`core/clock`): its hour slider moves the clock, its 0x/1x/60x/600x row sets the day's speed while time runs; Run time / Hold time is the button.
- [ ] The Reed Lake kit's materials (MeshStandard, the Ancients lineage) do not take Locus's night-light volume: lamplight does not fall on the reed walls (the kit's own fires do glow, and they light the volume for everything else). The reed village also lights a little differently from the land by day (Lambert vs standard).
- [ ] The reed kit brings ~190 draw calls of its own (one per kit item); the budget is Locus's 190 plus those (`65r`). Merging the reed kit's InstancedMeshes per material would halve it.
- [ ] Reed fringes stand across their edges instead of along them (`hnRLEaveFringe` and the island fringe in `settlements/reedlake/src/75-rl-helpers.js`): logged in the reed kit's KNOWN_ISSUES by the Reed's Local pass.
- [ ] `world/` places: none are hand-overridden yet; every place is derived from geometry in `78b`. tools/sim_scaffold.py (an editable `places-*.json` from the export) is not built.

## The life layer

- [ ] People are box figures with no walk cycle (Locus's level); the inspector names them.
- [ ] Indoor activities hide a person; there is no visible interior life even with `?interiors=1`.
- [ ] While the world clock is held (the default), schedules do not advance: people finish their trips and stay at their 10:00 places; events (caravans, riders, buggy trips) fire only while time runs. `Run time` or `#time=run`.
- [ ] Group members trail their leader on the route (`KSCHED.formation`-style offsets) but do not avoid other walkers: crowds overlap at a busy door. Locus's give-way steering was left out on purpose (PLAN.md 4.5: no runtime nudges a port cannot replay).
- [ ] The audit reports hourly capacity shortfalls (BUY, SOCIALIZE at peak hours): the overflow falls back (to SOCIALIZE) as designed, but a place's slots are not yet derived from its furniture (`SIM.slotsFromFurniture` exists; nothing feeds it the interiors' placements).
- [ ] No sim LOD tiers, no stockpiles: the catch, the timber and the fruit are delivered but not counted (PLAN.md Phase 5).

## Done

- [x] On every shared core module that applies (2026-10-05): the canonical biome, `furnish`, `tags`, `mask` (with its new transform layer), `atmos` (the lake's waves), `minimap`, as well as `lod rand clock sched simulation`. Not taken: `walk` (no walkable floors to register), `sockets` (the post-apoc banner packs), `terrain` (no overhangs), `materials/record` (the texture library: a graphics job of its own).
- [x] Reed's Local (rl_tavern) built in the Reed Lake kit and placed on its island, the pontoon starting at its landing.
- [x] The six landward shops include a building-materials shop: the Builders' yard, new in the Eastern Abyssal kit.
- [x] Every building type has an interiors item or a recorded skip: the new Reed Lake and Yuni sets (kits/interiors/sets/reedlake.js, yuni.js); the reed buildings are furnished by `65r`'s finisher with `?interiors=1`.
- [ ] **Takes the material library from the builds it assembles** (build.py, no materials.json): Locus's pack (47-texture.js),
      the eastabyss biome's and Reed Lake's vernacular rows (REEDKIT runs Reed Lake's 88y bind; without KMAT and its pack the reed
      kit would throw). The maps are in dist/mungo.tex.<key>.js beside the page (tools/textures/matlib_pack.py): the page is 2.9 MB.
      ?mat=proc shows the old look.
