# The Catch and the Bowl: the hazards (plan, 2026-11-24)

Item 2 of the owner's brief: *"Implement hazards (eg temperature, caustic storms, stalkers)"*. Everything here is
*proposed* unless it quotes the owner or a settled plan. Read `core/hazard/README.md` first: it has the record shape,
the kinds table and the functions.

## 1. What is already in hand, and the one thing that is missing

`core/hazard` is built and is a better fit than the brief assumes:

| Need | What `core/hazard` already has |
|---|---|
| The floor's heat, the passes' cold | the kinds `heat` and `cold`, with `dose`, `falloff`, `radiant` and `soak` |
| The caustic alkali dust | the kind **`acid`**, effect **`corrode`** |
| A storm that travels and passes | **`KHAZ.front`** (`22-core-hazard-env.js`): a hazard that runs a path with a head, a width and a speed |
| A salt crust that breaks underfoot | **`KHAZ.crust`** and **`KHAZ.under`**: intact until a load breaks it, then broken, with brine or `sink` beneath |
| The cold that pools in the hollows at night | **`KHAZ.night`** with `shape.pool`, on `KHAZ.bindClock` and `KHAZ.bindWind` |
| The Stalkers | the kind **`hunter`**, with `trigger {by: near}`, `move`, `cycle` and `tell` |
| Navigation that avoids them | `KHAZ.zones` -> `KWALK.export().zones` -> Godot's travel and enter costs |
| The Godot twin | `core/hazard/GODOT.md` (the Area3D, navigation and status mapping) |

**The missing piece is the binding.** No fragment of `core/world` mentions `KHAZ` (pitfall P3). Hazards reach pages today
through `core/biome`'s station hosts and `core/host`'s inspector, and a region page lists neither. Two new core
fragments are proposed in section 5, on the pattern `48w`/`88s` set for the pitched camps a fortnight ago.

Two smaller gaps:

- **No thin-air kind.** `VOCAB.hazardKinds` has `heat cold gas acid poison fall pit thorn grab drown sink slip crush
  hunter lava fire luck trap time mine`. The Catch's passes are 0.64-0.76 atm and the lore already answers them (the
  White Gills' **lung salt**, *Lãg Solṭ*, "cut against thin-air sickness on the pass"), so thin air is a mechanic the
  world is waiting for. *Proposed:* a kind **`thin`**, effect `suffocate`, added the way the tunnel fragment adds
  `rockburst`, `inrush` and `seal` (rows added to the vocabulary at first use), so no existing page changes.
- **No dust weather.** `core/atmos` has `A.MODES=['auto','clear','rain','storm','fog']` plus the opt-in `ASH_MODES` and
  `SNOW_MODES`. There is no dust. Section 4.

## 2. Temperature

Three hazards, each read from the ground rather than placed by hand, so the region's whole floor and every pass carry
them without a record per kilometre.

| Hazard | Kind | Where it lies | *Proposed* numbers |
|---|---|---|---|
| **The floor's furnace** | `heat` | the Bowl under -500 m and the Catch under 1,000 m, by `WORLD.at()`'s height, `salt` and `dune` | `danger` rising from .15 at the edge to **.55** on the Bowl floor (47 °C extreme at 1.83 atm, `PLAN-BOWL.md` section 1) and **.45** on the Catch's lake bed; `radiant` by the hour on the world clock, worst 12.00-16.00; `soak` so shade and night relieve it |
| **The passes' cold** | `cold` | over 3,500 m by height, worst over 4,500 m | `danger` .3 at 3,500 m to **.7** at 5,300 m (the north wall's saddle); on the clock, worst before dawn; a gale multiplier through `KHAZ.bindWind` |
| **Night cold in the hollows** | `cold`, `stateFn 'KHAZ.night'`, `shape.pool` | the oases' hollows, the terminal lake's pan, the Hall of the Tally-Marks | pools below the hollow's lip in still air after 22.00, gone by 09.00; the reason a caravan camps inside the corral wall |
| **Thin air** | **`thin`** (new), effect `suffocate` | over 3,000 m, by height | `danger` .1 at 3,000 m to **.5** at 5,300 m; relieved by lung salt (an item effect, not a hazard field); the Twins' col and the north wall are the only ground over 4,000 m a caravan crosses |

The Bowl's heat already has its look built (`biomes/sedesert` B3: the heat shimmer and the inferior mirage, by the hour,
gone at dawn and dusk). The region takes the shimmer from the kit rather than writing another.

## 3. The caustic storms

The owner, 2026-11-16: **the Catch floor closes in the spring's black dust storms**. `CATCH_TUNE` already carries the
season as data (year days **70-112**, through the valley host's `losses` and `siteSeasons`: C5 is done). What is missing
is the storm on the ground. Three layers, each doing one job:

1. **The season.** Already on the simulation. The caravans wait it out at Stair and Kolli; the region needs no new data,
   only to read `CATCH_TUNE.calendar` so a page's clock and the simulation agree about which days are storm days.
2. **The standing hazard.** A region-wide `acid` zone over the dry lake beds and the pans (the alkali's source: Owens
   Lake is the model, `biomes/catch/PLAN.md` section 6a), `danger` **.1** outside the window and **.6** inside, falloff
   `smooth` off the pans' edges, `tell` the white haze. This is what burns the eyes and lungs of anyone on the floor in
   the season even between storms.
3. **The storm itself, as a front.** `KHAZ.front` with kind `acid`: a path across the floor from the north-west
   (the prevailing wind off the Godthrone), a head, a width of tens of kilometres and a speed; `danger` **.85** in the
   head, falling behind it; it blinds, it scours and it fills tracks (the plan's "no tracks that last"). A caravan
   caught in the open loses beasts; one that reaches a yardang field shelters (`biomes/catch/PLAN.md` section 7:
   "shelter for a caravan in a storm, and nowhere to live"), which is the one piece of terrain that answers a hazard.

**The Bowl's own storms** are ochre, not white: its floor is a playa of red clay and halite, not soda. Same machinery,
a different palette and a lower danger (**.4** in the head: hot and blinding, not caustic).

## 4. The dust weather family (core, `core/atmos`)

*Proposed:* `A.DUST_MODES = ['dusthaze', 'duststorm']`, offered only to a host that asks (`o.dust`), exactly as
`ASH_MODES` and `SNOW_MODES` are. It rides the ash machinery (`A.PRESETS.ash` -> `A.PRESETS.dust`: `stormFog`,
`ashfall`, the wind preset), so `weatherTarget` and `weatherStep` gain two cases and nothing else changes. The palette
comes from the overlay: the Catch's alkali white-grey, the Bowl's ochre. `core/world/45-world-host.js`'s
`HOST.weather()` asks for it where a region's kits are dry and salt (`WORLD.at().salt`), and `?weather=duststorm` opens
a page in it for a shot and a check.

`core/atmos`'s ground dust (`89-atmos-3d-dust.js`) is already taken by `biomes/catch` for the dust off bare dry ground.
That is the still-day haze and the dust devil; the storm is the mode above. Both, not one.

## 5. The core binding (*proposed*)

Two fragments, on the shape `48w-world-camps.js` and `88s-world-sites.js` set for `KWCAMPS`:

### `core/world/48h-world-hazards.js` — `WHAZ` `[G data]`

A region's hazards planned into the baked site plan, as plain functions on records: no THREE, no DOM, no `Math.random`,
so node, the page and Godot give the same hazards.

- **A hazard spec** (`SITE_SPEC.hazards`), each entry one of four kinds of placement:
  - **`field`**: a zone whose danger is a registered function of `WORLD.at()` (`WHAZ.field(name, fn)`), evaluated on a
    grid the bake writes and the page reads — the floor's heat, the passes' cold, the thin air, the standing alkali.
    This is the one that matters: it is how a 247,000 km² region carries temperature without a record per cell.
  - **`at`** / **`px`** / **`site`**: a record at a point, in the region's frame or on the 5.1 canvas, or near a site —
    a crust on a named pan, the Red Cistern, a decoy lava pool.
  - **`front`**: a path, a head, a width, a speed and a window — the storms.
  - **`way`**: a hazard that lies along a laid way and shuts it in a window, which is what `KTRAVEL` and the simulation
    read when a leg closes.
- **`WHAZ.plan(spec, world)`** -> the plan's `hazards` (plan **version 3**; a region with none is written as version 1
  or 2 exactly as today, so every baked hash stands), **`WHAZ.of(plan)`**, **`WHAZ.at(x, z, t)`** and
  **`WHAZ.check()`** (every record on the ground, every field's grid continuous, every front's path on the land).
- **Seasons** reuse `KWCAMPS.calendar` and `KWCAMPS.when`, so a region has one calendar for its camps and its hazards.

### `core/world/88h-world-hazards.js` — `[web]`

- Registers each planned hazard in `core/tags` **before it is drawn** (the house rule), through `KHAZ.make` so an
  unknown kind, shape or falloff fails loudly.
- Binds `KHAZ.bindClock` to the world's clock (`core/clock`) and `KHAZ.bindWind` to `ATMOS`'s wind, which `KHAZ.night`
  and the fronts both need and which no page has done yet.
- Draws the tells: the haze, the storm's wall, the crust's hollow sheen, the pool's shimmer — and nothing at all for the
  Stalkers (section 6).
- Adds the hazard line to the region's inspector. `core/host`'s `93-host-inspect.js` has `KHOST.hazardNote`, but a region
  page uses `core/world/90-world-camera.js`'s own inspector, so `88h` adds `KTAGS.hazardAt` to its `describe`, the way
  the biome pages do.
- Puts the zones on the minimap as a `MAP_LAYERS` overlay, beside the resources' layers.

### What reads it

- **The walker**: `KWALK.zone` and `KHAZ.state`, so the probe can prove a hazard harms where it should and not where it
  should not.
- **`KTRAVEL`**: a leg's edge gains the hazards along it, so a caravan's path round a closed leg is the simulation's own.
- **`KWCAMPS`**: a camp is pitched out of a hazard's zone (`KSITES.groundOk` gains the test), which is why the oases'
  halts sit above the night pool and outside the pans.
- **`core/export`**: the `hazards` section already exists, so the Godot twin comes free.

## 6. The Stalkers

The owner, 2026-10-23: quiet robotic killers that stalk the sands, hunt down straggling caravaneers or lie in wait under
the sand, and work in pairs or triads; about human size; two variants, the harpooner and the blade; a wise caravan
carries explosives or exotic Ancient weapons, a foolish one flees. Their source is Hub 01's mad AI and **in the world no
one knows it**.

As hazards, they are unlike every other hazard here, and the design has to respect it:

- **A Stalker is a `hunter` hazard with no tell.** `tell` is empty: no colour, no sound, no sign. The plan's rule is
  "quiet means no tracks that last, no light, little sound: a Stalker is seen when it moves, and it moves at the end."
  A hazard overlay that draws them would give away the one thing the design is built on. **The minimap overlay of
  section 5 must exclude `hunter`**, and the inspector must not name one until it has moved.
- **A triad is one record with three bodies.** `shape: {type: 'poly'}` along a caravan's line, a stage out from an
  oasis, `trigger: {by: 'near'}`, `cycle` with a long `warn` of nothing and a short `on`. The harpooner furthest out,
  the blades near: that is the record's own layout, not three independent hazards, because the behaviour is the ambush.
- **Where they lie** is not hand-placed. *Proposed:* a `field` placement (section 5) seeded by `core/rand` from (world,
  cell, index, salt) over the floor's dune and reg cells, **weighted by distance from an oasis** (a stage out, the plan's
  word) and **by the simulation's own traffic** on that leg, so the danger is where the caravans are. Never from a draw
  count, never from `Math.sin`.
- **They are drawn from `kits/mechs`** (culture `stalker`, `st_harpooner` and `st_blade`) — and **they cannot yet be
  drawn buried** (pitfall P12, `kits/mechs/KNOWN_ISSUES.md`): no buried or dormant pose, no line on the harpoon. Those
  two are the real work of item 2's third clause and belong in `kits/mechs`, not here. `PLAN-RAIDS.md` step R3.
- **They are not on the Bowl.** The Stalkers are the Catch's and the Stalker Peaks' (`biomes/catch/PLAN.md` section 6c).
  The Bowl's predator is the Bowl mantis (owed to `kits/fauna`) and its danger is bandits.

## 7. The guides' traps, and the rest of the register

`PLAN-TWINS-CROSSING.md` section 4 already lists the Twins' traps as `core/hazard` records: the frozen box vales F1
(968,1442) and F2 (1068,1528) as `cold` and `fall`, the decoy lava pools L1 (992,1465) and L2 (1035,1493) as `heat` and
`gas`, and the Red Cistern and the Iron Shroud as station pages whose records the region places. They are **region 2's**
by the seam (`PLAN.md` section 3) and they need the same binding, which is why the binding is core and not this
region's.

This region's own register, beyond sections 2, 3 and 6:

| Hazard | Kind | Where |
|---|---|---|
| The salt crust over brine | `crust` + `under: sink` | the four small pans (`basins.json`: levels 368-400 m) and the terminal lake's margin; a pack beast's load breaks it |
| The soda lake's brine | `acid` + `sink` | the lake itself: alkaline enough to burn, soft enough to swallow a beast |
| The yardang fields | **no hazard: shelter** | the one terrain that answers the storm; it must therefore be drawn well (`PLAN-SETPIECES.md`) |
| A dry well | *not a hazard record* | it is the simulation's: `CATCH_TUNE` runs Arfwai's well down to 30 % in late summer (C5, done) |
| The Theodiga bore's Stair mouth | `22-core-hazard-bore.js` presets: `rockburst`, `inrush`, `seal` | the divers' prospect; the fragment exists and is opt-in |
| The Hub 01 road | `hunter`, danger 1 | 44 km of Ancient tunnel east, the one way in; nobody who has taken it has come back. A hazard that is a warning, not a fight |

## 8. Checks (each with a negative, as the house rule asks)

- **The fields**: the floor's heat over .4 at the terminal lake and under .2 at Kolli; the cold over .5 at the north
  wall's saddle and under .2 at Stair; the thin air over .3 at the Twins' col. Negatives: the same reads at the
  opposite place.
- **The night pool**: cold at 03.00 inside the hollow's lip and nothing at 14.00, nothing in a gale (`KHAZ.bindWind`).
- **The crust**: a 60 kg load holds, a beast's load breaks it, and it stays broken (`KHAZ.load`, `heal: null`); the
  brine below reads `held` while it holds. Negative: the same on gravel reg.
- **The storm**: inside its window the front crosses the floor, the ways it covers are closed to `KTRAVEL`, and a shot in
  `?weather=duststorm` shows it; outside the window the floor is clear. Negative: the same day a year on.
- **The Stalkers**: a triad's record is in the registry, is **not** on the minimap overlay, and the inspector does not
  name it before it moves; `KHAZ.at` gives danger 1 inside and 0 a stage away. Negative: the overlay with `hunter`
  allowed must fail the check.
- **No NaN, no order dependence**: the probe's three orders give one hazard set (`core/rand`, not a draw count).
