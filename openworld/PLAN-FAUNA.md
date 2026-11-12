# Fauna in the open world: animals, their behaviour, and game as a resource

Asked by the owner on 2026-11-11: "pick a region with well-implemented fauna and get animal behaviour and resources wired
into the open world there". The owner chose **Pinnacle** (`openworld/pinnacle`) on 2026-11-11, after the survey below.
This plan was written on `claude/openworld-fauna`, cut from `claude/openworld-sites-24defd` at 642fd4328. It is handed to
the session that is growing `openworld/pinnacle` into a corridor region (`claude/busy-kare-20b379`).

The work goes into `core/world`, so every region can take it. Pinnacle is the first region to take it. The region names
its lands and bands in its own config; nothing in core names Pinnacle.

## 1. The survey (why Pinnacle)

**What the open world has today.**
- `core/world` draws no animals: no fragment mentions fauna.
- `kits/fauna` has more than 125 animals. Each carries data a world can act on:
  - tags: `biomes`, `habitat`, `locomotion`, `diet`, `feeding`, `activity` and `temperament`;
  - in `data`: `schedule` (24 hourly activities: GRAZE, REST, HUNT, WORK...), `fleeDistance`, `aggression`,
    `speed.walk` and `speed.run`, `mass`, `herd` and `sizeRange`;
  - `yields` (meat kg, hide count and `hideM2`, horn kg...);
  - `life` (maturity, lifespan, litter, gestation).

**`kits/fauna/fauna-lands.js` (`FAUNALANDS`, [G data]) already places animals by cell.**
- It takes a biome's wild animals by role (grazer, predator, flyer, water) and lays groups on a cell grid.
- Every number is `KRAND.hash(world, cell x, cell z, index, salt)`, so a cell's groups depend on nothing else.
- It registers each group (`herd`) and each animal in core/tags before anything is drawn.
- It has three lands: `hyperjungle.pure`, `hyperjungle.savage` and `hyperjungle.north`. In `savage`, the Riders' beasts
  are wild at 1.2 to 1.4 times their ridden size.
- Only the hyperjungle's savage and north stations use it, and it has no behaviour, only a fixed pose per animal.

**Wild species per biome tag** (domestic animals left out):

| Biome tag | Grazer | Predator | Flyer | Water |
|---|---|---|---|---|
| hyperjungle | 14 | 8 | 9 | 2 (plus 9 rider beasts wild in `savage`) |
| sedesert | 11 | 3 | 2 | 0 |
| swbay | 4 | 4 | 8 | 8 |
| ringsea | 3 | 2 | 2 | 10 |
| eastabyss (the NE rim borrows it) | 5 | 2 | 2 | 1 |
| xanadu | 3 | 2 | 1 | 5 |
| oidong | none tagged | | | |

**The regions compared.**
- **Pinnacle** grows the savage hyperjungle and the NE rim (`abyssal-savannah`, with the eastern abyss's species). It has
  the richest fauna, and the `savage` land is already written. Nine Beast Rider bands camp round the rock (`plan/sites.json`:
  census, mounts, pasture). The sim session for Pinnacle Rock S4-S7 wants meat and kills per band.
- **iziz-cluster** grows the same kits, but its Beast Riders live in towns. It takes this work afterwards almost for free.
- **isle-demo** has a broad set but few animals per biome. `biomes/ringisles` places them with an order-dependent rng.
- **xanadu-oidong-highrift** and **oidong-highrift**: Xanadu has few animals, and Oidong has none.

**What the bands need.** `core/simulation/PROPOSAL-LONGSONG-PINNACLE.md` section 7:
- about 110 floor mounts eat meat, about 2.7 kg a day each after the low-gravity payoff: about 107 t a year;
- their meat comes from both the wild hunt and kept herds;
- a band of 50 with 30 mounts needs about 15 t a year, about 70 large kills.

On the sim's branch (`claude/sim-s4-s7-fdaeba`):
- `core/camp/60-camp-world.js` gives a band SITE `{cap: {good: amount when whole}, regrow (days)}`, and the hunt's take is
  bounded by what the site holds.
- `core/camp/50-camp-beasts.js` `KCAMP.meatPlan` splits a band's meat need into hunt and herd shares.

This plan feeds those two: §5.

## 2. Core adoption

| Module | Taken for |
|---|---|
| `core/rand` (`KRAND`) | every draw: placement, the day's waypoints, the hunt calendar, its outcome. Seeds from `KRAND.child` (not seed + k: `reference-krand-seed-xor`) |
| `core/world` | `WORLD.H`, `WORLD.water`, `WORLD.at` (slope, rock, flow, wet), `WORLD.inside`, `WORLD.kitW` (the overlay weight that picks the land); the flora's 512 m tile, its queue and floating origin; `ROADS`; `KSITES` (the camps and their hedges); `WRES` |
| `kits/fauna` | `KratorFauna` (`build`, `animate`, `entry`, `lifeOf`), `FAUNALANDS` (`pool`, `plan`, `register`, `roleOf`, `groupOf`). The draw goes through `fauna-lands-host.js` where it fits |
| `core/tags` (`KTAGS`) | every herd and animal is registered before it is drawn (`FAUNALANDS.register`). The inspector reads the record |
| `core/space` (`KSPACE`) | the hunt's prey search and the flight's neighbour test: no new spatial hash |
| `core/clock` (`KCLOCK`) | the world minute that every pose is a function of |
| `core/camp` | the bands (`plan/sites.json` camps: census, mounts, hedge, pasture); the SITE and `meatPlan` shapes it reads (§5) |
| `core/simulation` | the season (`77-sim-6-season.js`, on `claude/cool-tereshkova-d594e8`), read when present (§4.5) |
| `core/walk`, `core/host` | the walker's position is the threat (§4.4); the inspector and the probe as the region has them |
| `core/lod` | **not taken** for the animals: it manages static and instanced meshes in a finished scene, and herds move every frame. The mid level (§6) is an instanced proxy per species, drawn with the flora's distance rule. Its vertex clustering makes the proxy if it is exposed as a function; if not, ask before writing one |
| `core/biome`, `core/mask` | **not taken**: the world places its flora without the biome core's scatter, the roles come from `FAUNALANDS`, and nothing reads a canvas |

**Not touched:**
- `core/world/41-world-fields.js`: it reaches 8 builds. Everything here reads the fields it already gives.
- `core/city`.
- other sessions' kits, except one additive edit to `kits/fauna/fauna-lands.js` (§3.1). `claude/fauna-meshy` has
  unpushed work on `kits/fauna`, so that edit stays inside `fauna-lands.js`.

## 3. Animals in the world (the placement) [G data]

**New fragment: `core/world/49f-world-fauna.js` (`WFAUNA`).** It is plain data: no THREE, no DOM, no `Math.random`, no
trig in anything a record or the sim reads.

### 3.1 Lands

- A region names its lands in its own config, `src/47f-world-fauna.js` (`WORLD_FAUNA`):

      { world: seed, cell: 512,
        lands: [{kit: 'hyperjungle', land: 'hyperjungle.savage'}, {kit: 'abyssal-savannah', land: 'eastabyss.rim'}],
        density: {...overrides}, bands: 'sites' }

- `kits/fauna/fauna-lands.js` gains one land, `eastabyss.rim`: the eastern abyss's wild animals on the savannah rim.
- The three keys the savage land names but the kit does not register get aliases, so a plan stops listing them as
  missing:
  - `longcrawler` becomes `draught-millipede`;
  - `wingclaw` becomes `giant-archaeopteryx`;
  - `nightwing` becomes `giant-bat`.
- Both edits are additive, and `kits/fauna/tests/test-lands.js` grows a check for each.

### 3.2 By cell, order-free

- The cell is the flora's tile, 512 m, so a tile owns exactly its cells. `FAUNALANDS.plan` is called with the tile's box.
- The land densities are per 400 m cell, so they are scaled by (512/400)² once, in the config.
- A cell's land is drawn from `WORLD.kitW` at its centre, weighted by a hash. Where two kits blend over a few km, their
  animals mix the way their trees do.
- A tile built alone, after its neighbours, or in reverse order gives the same records, bit for bit. This is the same
  test the flora passes in `91-world-probe.js` `seeding()`.

### 3.3 Where an animal may stand (`where(role, x, z, key)`)

| Who | Where |
|---|---|
| ground animals | on land (`WORLD.water < H - 0.3`), inside the polygon; slope under the species' limit (0.45 for walkers; 0.9 for climbers, with `climbs` in `locomotion`); `rock` under 0.5, so none on the cliffs |
| everyone | not inside a camp's hedge, and not on a road (`KSITES`, `ROADS`) |
| water animals | in water deeper than their own height |
| flyers | 30 to 120 m over the ground, as `FAUNALANDS` sets them |

A member that fails is dropped, never moved, as in `FAUNALANDS.plan`.

### 3.4 A herd's record

The `FAUNALANDS` group, plus:

| Field | What |
|---|---|
| `home` | its centre |
| `range` | its home-range radius in metres |
| `drink` | `[x, z]` of the nearest water within reach, or `null`, found on a fixed ring of samples round the home |
| `bed` | its resting point |
| `sched` | its 24 hourly activities (§4.1) |
| `alarm` | §4.4 |

The home range is set from mass and diet:
- grazers: 250 x (mass/100)^0.5 m, clamped to 200 to 3,000;
- predators: three times that;
- flyers: five times that.

Everything is registered in core/tags before the draw.

## 4. Behaviour [G data]

Every pose is a **pure function of the herd's record, the world minute and the alarm state**:

    WFAUNA.pose(herd, minute, out) -> per member {x, y, z, hx, hz (a heading vector, no angle), mode, speed}

- The same minute gives the same pose in the page, in node and in Godot.
- Scrubbing the clock just works.
- `mode` is the kit's animation mode (`graze`, `walk`, `run`, `rest`, `idle`, `fly`, `swim`, `climb`).

### 4.1 The day

- An animal's hours come from `data.schedule`.
- An animal without one gets them from its `activity` tag:
  - diurnal: grazes 6 to 18 and rests at night;
  - nocturnal: the reverse;
  - crepuscular: active round 5 to 8 and 17 to 20;
  - cathemeral: in bouts.
- HUNT hours belong to predators (§4.3), and REST hours are spent at `bed`.

### 4.2 Grazing ranges and water trips

- In its GRAZE hours, a herd's centre walks a chain of waypoints inside its range.
- Each waypoint is `KRAND.hash(world, herd, day, slot)`. Between waypoints the centre moves at walk speed with a smoothstep
  ease, and members keep their offsets from the record, loosened by a slow per-member wobble.
- Grazers make one or two water trips a day, at dawn and at dusk when `drink` is set: they walk there, stand 20 world
  minutes and walk back.
- A herd with no water in reach makes no trips. The probe counts these herds and reports them.

### 4.3 Predators hunting prey

- Each day, a hash decides whether a predator group hunts in its HUNT hours. The odds come from its kit `aggression` and
  its days since the last kill.
- **The prey.** The predator takes the nearest prey herd in its range. It searches with `KSPACE` over the herds of its own
  tile and the 8 round it, so the choice is still order-free. The prey's mass must be 0.05 to 1.5 times the pack's total
  mass.
- **The hunt** has three steps:
  - a stalk to 60 m at walk speed;
  - a chase at run speed, while the prey herd flees (§4.4, the predator as the threat);
  - an outcome hashed from the predator's aggression against the prey's temperament.
- **A kill** marks one prey member dead for the rest of that day, and leaves a carcass the predators rest beside.
- The herd is whole again the next day. The visual layer keeps a steady state: the populations live in the resource layer
  (§5), not in the kills.
- A hunt is a record `{id, day, predator, prey, t0, t1, kill: member | null}`, so the sim and the probe can read the
  day's kills.

### 4.4 Flight from the camera or the player

- The threat is the walker's position when walking, else the camera's point on the ground when it is under 150 m above
  it. Hunting predators are threats too.
- `WFAUNA.alarm(herd, minute, threats)` is the one stateful step, and it is still data. The state `{since, from: [x, z]}`
  is set when a threat comes inside the herd's `fleeDistance` and cleared after a calm time.
- The pose adds a flight offset away from `from`, at run speed, easing out over the calm time.
- **By temperament:**
  - skittish and wary animals flee as a herd, the whole herd when one member is alarmed;
  - docile animals ignore the threat;
  - defensive animals face it and stand;
  - aggressive animals with `aggression` of at least 0.5 charge inside half their distance and stop short. They do no
    damage: that waits on a combat layer.
- Given the same threat sequence, the same alarms result. A test replays one.

### 4.5 Seasons

- No fauna entry carries seasonal data today. The hyperjungle is wet all year.
- Where `core/simulation`'s season is on the page, a dry season pulls `range` toward `drink` by its dryness. Elsewhere
  nothing changes.
- Seasonal data per species is a kit gap for the owner: §9.

## 5. Resources [G data]

### 5.1 Game

- `WFAUNA.game(x, z, r)` returns the wild animals within a disc as a resource:

      {head: {key: n}, biomass_kg, offtake: {meat_kg_yr, hides_yr, hideM2_yr, horn_kg_yr},
       mounts: {key: n}  (wild rideable or tameable stock: the Riders' beasts to catch and break),
       regrow_d}

- It reads expected values, not a sample. These are the land's groups per cell, times the mean group size, times the
  share of the disc where `where()` passes on a 500 m lattice. So it is cheap, smooth and the same at any zoom.
- **The offtake** is a sustainable yield from each species' `life`:
  - `r_max` comes from litter, maturity and lifespan (the formula and its sanity bounds go in the test);
  - the yearly offtake is head x `r_max`/2 (a logistic stock at half its capacity) x the species' `yields`.
- `regrow_d` is the days a stock hunted down to half takes to grow back whole.

### 5.2 WRES

`WRES` (`49r-world-resources.js`) gets two layers and a census section.
- **game**: biomass per km², read from `WFAUNA.game` on the map's 2 km pixels.
- **pasture**: grazing ground, 0 to 1, by kit:
  - savannah 1, jungle floor 0.25 (browse);
  - times flat, times not water, times rain-fed.
- **The census section:** head and offtake per species and per role over the region.
- **The edit to `49r` is a hook only:** `WRES.extend({layers, census})`. The fauna stays in `49f`, so a region without
  fauna is unchanged. `89r` lists the new layers like any other, and the minimap takes them through `MAP_LAYERS`.

### 5.3 The bands' hunting (Pinnacle)

`WFAUNA.bands(sites)` gives, for each camp in `plan/sites.json`:

    {camp, range_m, game: WFAUNA.game(camp, range), need: {meat_kg_yr from the census's mounts and people},
     hunt_share, short_kg_yr}

- `range_m` is 15 km for a ground band and 45 km for a flyer band, three times as the camp plan says, because they hunt
  from the air.
- Bands whose ranges overlap share the offtake by need.
- `need` comes from `KCAMP.meatPlan` and `PR_TUNE.beasts` when the sim's branch is in. Until then it uses the proposal's
  figures: about 2.7 kg a day per meat-eating mount, plus the people's meat share.
- The sim reads it as its SITE: `{cap: {meat, hides} = the site's offtake for one regrow period, regrow}`, through
  `WFAUNA.siteCap(x, z, r)`. The exact shape is agreed with `sim-s4-s7` before it is fixed.
- Any band whose share falls short is reported, never padded. The kept herd covers the rest (`meatFrom`).

## 6. The drawing [web]

**New fragment: `core/world/89f-world-fauna.js`.**

- Records come by tile from the flora's tile queue, nearest first, with a tile-cost budget each frame.
- **Levels by distance**, as the flora's:
  - **hero**, under 300 m: `KratorFauna.build`, animated each frame by `KratorFauna.animate(g, t, mode)` on the pose's
    mode. Capped at the nearest 60 animals; groups are built once and kept in a pool by species.
  - **mid**, 300 m to 1.5 km: one `InstancedMesh` per species, the animal built once in its idle pose, merged and
    simplified. Each instance is moved to its pose every few frames, and is not animated.
  - **far**, beyond 1.5 km: not drawn. Herds show only on the minimap's game layer.
- A floating origin, as the flora uses.
- Every mesh carries `probeSkip` and the record's id, for the inspector.
- **The page takes the bundle** through `fauna_bundle.bundle(groups)`, with only the groups the region's lands use:
  - `hyperjungle`, `riders`, `flyers`, `crawlers`, `voth`;
  - `abyss` and `wild` for the rim;
  - no Meshy models.
- The species source is about 0.8 MB, against the page's 5.6 MB of 16 MB.
- **A "fauna" toggle**, plus `?fauna=0` to leave it out.

## 7. Checks

**`core/world/test-world-fauna.js`** (node, on the real kit through the `test-lands.js` vm loader). Every check has a
negative it must reject:

| Check | Negative |
|---|---|
| order-free: a tile alone, after its neighbours and in reverse, gives identical records; the hunts' prey choice too | a tile seeded by `Math.random` |
| on the ground: no ground animal in water, on slope over its limit or on rock over 0.5; water animals in water; flyers over the ground | an animal put in a river; one on a cliff |
| inside the polygon, outside hedges and roads | an animal in a camp |
| pose purity and continuity: the same minute gives the same pose; no member moves faster than its run speed between two minutes | a pose with a jump |
| flight: a threat inside `fleeDistance` makes a skittish herd's distance grow; a docile one's does not | a threat ignored |
| hunts: only predators kill, only prey in range, at most one kill per hunt, never below zero | a grazer that kills |
| counts per range plausible: grazer density per km² inside a band round Damuth's rule (about 100 x mass^-0.75, x0.1 to x10); every role present where the land has species; the bands' offtake against their need reported | density x100 |

**The region's `verify.py --assert`** (Pinnacle):
- the same checks on the streamed tiles in the browser;
- the drawn counts per level, and the hero cap held;
- no NaN, and the probe's existing checks still pass.

**Then:**
- a GPU verify: `KRATOR_GL=gpu`, through `tools/harness.py lock --lane auto`;
- `python tools/check_core_use.py` and `python tools/test_all.py --no-build`;
- `node kits/fauna/tests/test-lands.js`;
- rebuild every page that takes `core/world` (`tools/reach.py core/world/49r-world-resources.js`);
- `port_baseline.py` for the pages changed on purpose.

Tag `49f` [G data] and `89f` [web] in each region's `PORT.md`.

## 8. Order

| Step | What | Proof |
|---|---|---|
| F0 | `eastabyss.rim` and the three aliases in `fauna-lands.js` | `test-lands.js` |
| F1 | `49f` placement by tile; Pinnacle's `47f` config | node test: order-free, ground |
| F2 | `89f` drawing: hero and mid levels, the toggle | verify: drawn counts; one GPU shot |
| F3 | behaviour: the day, ranges, water trips | node: purity, continuity |
| F4 | flight and hunts | node: flight, hunts |
| F5 | `WFAUNA.game`, the `WRES` hook, the game and pasture layers, `WFAUNA.bands` and `siteCap` | node: plausible counts; panel shot |
| F6 | `verify.py` probe, GPU `--assert`, `check_core_use`, `test_all --no-build`, the baseline | all green |

## 9. Questions for the owner

1. **Density.**
   - The savage land at its kit density gives about 1.1 grazer groups per 512 m tile, with mammoths and threehorns in
     groups of up to 10.
   - Real megafauna densities are far lower: Damuth puts a 9 t browser at about 0.1 per km².
   - Should the world run at the kit's playable density and the resource layer at the realistic one? That is the plan's
     default: the visual layer is a steady state, and the economy reads `game()`.
2. **Charging animals.** Aggressive animals charge and stop short, and nothing is hurt until there is a combat layer. Is
   that right?
3. **Seasons.** The kit has no seasonal behaviour per species. Should one be added to the fauna entries (`data.season`:
   range, breeding and migration)?
4. **The bands' own beasts.** Mounts in the pens and raptors in the kennels are not drawn. Should the camp draw its census's
   mounts, as a later step on `core/camp`?
