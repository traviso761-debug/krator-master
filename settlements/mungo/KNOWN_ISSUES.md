# Mungo — known issues

Open items are `- [ ]` lines; `build.py` prints them.

## The world

- [ ] The canonical eastern-abyss biome (`core/biome` + `biomes/eastabyss`, since 2026-10-05) has six species the old port lacked (seal-tree, cordaite, seed fern, araucaria, beard oak, water palm): about +3 M triangles headless (Locus 6.2 M -> 9.0 M, Mungo 6.0 M -> 7.8 M), and the triangle budget (`05-palette.js`, shared) went from 7 M to 10 M. The town trees are grown after the biome's passes (`EASTABYSS.make` / `grow`, 69z), so they no longer take a keep-clear entry the passes would avoid; the town is masked out of the passes anyway. If the frame rate on a weak GPU suffers, thin the new species in the kit or pass a lower `quality` in 69z.
- [ ] The open lake shades with `core/atmos`'s wave field (`90-atmos-host.js`, 75-terrain `waterOpenAt`) but is not displaced: a swell would rise through the reed decks and jetties. The sky's light (`ATMOS.skylight`) is not taken: it lights MeshStandardMaterial only and this is a Lambert world.
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
