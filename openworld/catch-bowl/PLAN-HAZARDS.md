# The Catch, the Bowl, the Godsgate and the Stalker Range: the hazards (plan, revised 2026-11-24)

Item 2 of the owner's brief: *"Implement hazards (eg temperature, caustic storms, stalkers)"*, now over four provinces
(the owner: *"Include se outer wall and stalker range in the Sim as well"*).

> **Revised, second pass.** The first pass proposed a `thin` hazard kind and a `DUST_MODES` weather family. **Both
> already exist**, and better than proposed: `core/hazard`'s `VOCAB.ambientKinds` carries `thin-air`, `cold`, `hot`,
> `dust`, `ash` and **`caustic-dust` whose row says, in the module, "for the Catch's black storms off its dry soda
> lakes"**; and `core/atmos/fx/89-atmos-fx-airload.js` was written to the owner's 2026-10-26 word *"provide KHAZ's dust,
> ash, alkali and visibility fields from its dust weather, the Throne's ash and the Catch's black storms"*. The first
> pass read `core/atmos`'s weather **modes** and stopped; the storms live in its opt-in `fx/` layer. Sections 1 to 4 are
> rewritten. **Item 2 is mostly wiring two finished modules together, not building.**

Everything is *proposed* unless it quotes the owner or a settled plan. Read `core/hazard/README.md` (the record shape,
the kinds table, the ambient bridge) and `biomes/seouterwall/PLAN.md` section 2 (which designs five hazards in detail).

## 1. What is already in hand

### 1a. `core/hazard`: records, and an ambient bridge

| Need | What exists |
|---|---|
| The floor's heat, the passes' cold | the **ambient** rows `hot` (burn, 45 to 70 °C) and `cold` (freeze, 0 to -40 °C), as *fields*, not placed shapes |
| **Thin air** over 408,000 km² of 6.5-15 km rock | the ambient row **`thin-air`** (suffocate, .6 atm "a person tires" to .06 atm "the blood boils"; the Godthrone's rim is .07) |
| The caustic alkali dust | the ambient row **`caustic-dust`** (corrode): `alkali` (.05 to .5 of the dust that is caustic salt) times `dust` (1 to 25 mg/m³), **named for the Catch's black storms**, which also choke on the `dust` row and blind through `sight` |
| What a storm does to cargo | the same row: *"it etches what lies open: a cargo system takes its corrode dose"* |
| How far one sees in it | **`KHAZ.sight`** (Chepil and Woodruff 1957: 2,000 mg/m³ ≈ 57 m, 12 ≈ 6 km), and **`KHAZ.seen`** / **`KHAZ.aim`** (Koschmieder) for a shot or a spotting in it |
| A storm that travels and passes | **`KHAZ.front`** (`22-core-hazard-env.js`) |
| A salt crust that breaks underfoot | **`KHAZ.crust`** and **`KHAZ.under`** |
| The cold that pools in the hollows at night | **`KHAZ.night`** with `shape.pool`, on `KHAZ.bindClock` and `KHAZ.bindWind` |
| The Stalkers | the kind **`hunter`**, with `trigger {by: near}`, `move`, `cycle` and `tell` |
| A bore's rockburst, inrush and seal | **`22-core-hazard-bore.js`** and **`-tunnel.js`** (for the Theodiga bore and the Bab al-Hawa shaft) |
| Navigation that avoids them | `KHAZ.zones` -> `KWALK.export().zones` -> Godot's travel and enter costs, with `avoid` |
| Everything summed at a point | **`KHAZ.here(x, y, z, t, T, {guard})`** -> `{records, ambient, doses, sight}`; `guard` is what a mask or a suit keeps out |
| The Godot twin | `core/hazard/GODOT.md` |

### 1b. `core/atmos/fx`: the fields that feed it

Every one of these is opt-in, listed by path, and already built:

| Fragment | What it gives |
|---|---|
| **`89-atmos-fx-airload.js`** (`ATMOS.airLoad`) | dust, ash and **caustic alkali** in mg/m³ at any point and time, and the page's fog driven by the same numbers "so a 57 m sight in `KHAZ.sight` is a 57 m wall on screen". It has a **storm** term by name — *the Catch's karaburan, a black storm* — carried from upwind over bare ground, `stormFloor` of it over anything else, thinning over `stormH` ("a wall a few hundred metres to a km high") |
| **`89-atmos-fx-dustseason.js`** (`ATMOS.dustSeason`) | `KCLOCK.season(...).dry` scales what the wind lifts, so the storms are the dry season's |
| **`89-atmos-fx-gale.js`** (`ATMOS.gale`) | **the God-Bore**: built 2026-11-10 *for `biomes/seouterwall`'s PLAN.md section 2.1*. Turns the page's base wind toward the gale by night and back by day, 80-130 km/h, and raises the gusts with it, so the foliage, smoke, rain, snow and cloth all follow |
| `89-atmos-fx-katabatic.js`, `-acid.js`, `-gustsheen.js`, `-airload.js` | Godshearth's night drainage, acid rain, the gust's sheen over crops, the air's load |

**So the whole chain exists**: `ATMOS.airLoad` -> `KHAZ.provide('dust'|'alkali'|'visibility', fn)` -> `KHAZ.ambient` ->
`KHAZ.here(...).doses` and `.sight` -> the walker, the NPCs, the cargo and the port's fog.

### 1c. The one thing missing: the binding in `core/world`

**No fragment of `core/world` mentions `KHAZ`** (pitfall P3). Hazards reach pages through `core/biome`'s station hosts
and `core/host`'s inspector, and a region page lists neither. Section 5 proposes the two fragments.

## 2. Temperature, air and the four provinces

All of it ambient: fields, not records, because every one varies with height and hour over hundreds of thousands of
square kilometres. The region provides `pressure` and `temperature` (from `core/atmos` by height and from the model's
`tm` raster), and `KHAZ` turns them into doses on the rows above.

| Province | `thin-air` | `cold` | `hot` | Notes |
|---|---|---|---|---|
| **the Bowl** (-1,284 to 4,347 m, +27 °C median) | none: 1.83 atm on the floor | nothing | **the hardest `hot` in the region**: the floor reaches +47 °C, into the row's 45-70 °C ramp | the lore's "hottest ground in the east". `biomes/sedesert` already draws the shimmer and the mirage |
| **the Catch** (-72 to 8,790 m, +4 °C median) | on its walls only | the passes, and `KHAZ.night` pools in the oases' hollows | the floor: +21 °C mean at the terminal lake, "a furnace" by day | both ends of the ramp in one province |
| **the SE outer wall** (3,086 to 11,707 m, **-21 °C median**) | **83 % of it is over 6,500 m**: thin-air from mild at the pass to lethal on the crest | **the dominant hazard**: summer afternoons +6 to +14 °C plunging to -10 to -22 °C before dawn (its plan, 2.2) | nothing | the Godsgate itself is the exception: 0.99-1.05 atm at 3,350-3,750 m, breathable and mild |
| **the Stalker Range** (1,895 to 15,041 m, **-22 °C median**, 3 % over 12,000 m) | **lethal over most of it** | lethal | nothing | Ranger HQ's valley at 1,982 m is the one place in the province where neither bites |

*Judgement:* with these two provinces in the cut, **`thin-air` stops being a flavour hazard and becomes the thing that
defines where the player may go**. It is the right mechanism for it: `KHAZ.zones` gives `avoid` to the navigation
layers, so an NPC, a caravan and Godot's pathfinder all refuse the 8 km ground without anyone drawing a wall.

## 3. The storms, the gales and the whiteouts

Five, and the first three are already designed in `biomes/seouterwall/PLAN.md` section 2.

### 3a. The Catch's black storms (the karaburan)

The owner, 2026-11-16: **the Catch floor closes in the spring's black dust storms**. Already on the simulation as a
window (`CATCH_TUNE`, year days 70-112, C5 done). On the ground, three layers:

1. **The season**: `ATMOS.dustSeason` on `KCLOCK.season(...).dry`, reading `CATCH_TUNE.calendar` so the page's clock and
   the books agree about which days are storm days.
2. **The standing load**: `ATMOS.airLoad`'s dust over the dry lake beds and the pans, with `alkali` at .05 outside the
   window and up to .5 inside — which is what burns the eyes and lungs of anyone on the floor in the season, and etches
   open cargo, even between storms.
3. **The storm**: `airLoad`'s **storm** term (its own word for it: the Catch's karaburan), set by the page, carried from
   upwind, `stormH` high; and, where the player should see one arrive and pass, a `KHAZ.front` with kind `acid` on top.
   `KHAZ.sight` then gives the 57 m wall, and `KHAZ.aim` gives what a shot through it is worth.

The one piece of terrain that answers it is the **yardang fields** (`biomes/catch/PLAN.md` section 7: "shelter for a
caravan in a storm, and nowhere to live"), which is why they are a setpiece (`PLAN-SETPIECES.md` section 4).

### 3b. The Bowl's own storms

Ochre, not white: a playa of red clay and halite, not soda. The same `airLoad` machinery, a different palette, `alkali`
near zero and a lower danger — hot and blinding, not caustic.

### 3c. The God-Bore and the Salt-Draught (the SE outer wall)

Its plan's section 2.1 is a two-way barometric engine between the Bowl at 1.83 atm and the Catch at 1.35-1.55 atm, with
the Godthrone shedding hyper-chilled air down its eastern flank:

- **By afternoon, the anabatic *Salt-Draught***: 45-75 km/h upslope, carrying the Catch's stinging alkali dust and the
  Bowl's ochre salt-haze up to the 4,500 m benches. So the SE outer wall gets the Catch's `caustic-dust` **without
  having a soda lake** — the dust is advected. `airLoad` carries dust from upwind already (`fetch`), which is exactly
  this.
- **By night, the katabatic *God-Bore***: 80-130 km/h down every couloir, funnelling through the Godsgate "like a jet
  engine", from two hours after sunset until after dawn. `ATMOS.gale` is built for it. As a hazard it is **`cold` times
  wind**: in ~1.0 atm at -15 °C, convective hypothermia unless sheltered behind a wind-baffle or inside a cirque tarn
  hollow. `KHAZ.bindWind` is how the `cold` row learns about it.

This pair is the reason Bāb al-Hawa sells nights rather than water (`PLAN-SIM.md` section 2a).

### 3d. The rime-ice whiteouts

Its plan's 2.3: moist air off the Bowl's lake-effect plumes forced up the northern listric scarps meets freezing air off
the crest and condenses instantly. **Visibility 80 km to under 12 m in minutes**, and 30-80 cm horizontal rime-ice
feathers (*anemousite*) on every cairn, boulder and harness. On the sim it is a **closure with a warning**
(`PLAN-SIM.md` 2c); on the ground it is a `visibility` field provided straight to `KHAZ.provide` — the README's own case:
*"a page that knows its fog or smoke outright provides `visibility` (m)"*.

### 3e. Rockfall

Its plan's 2.4: crossing 0 °C twice a day, the megabreccia pries loose blocks from fist-sized to 20 tons; the
4,200-5,400 m slopes are felsenmeer and scree aprons (`KRELIEF.talus`), and steep couloirs discharge **noon** rockfalls
as the sun melts the ice cement. A `crush` record with a **cycle** whose `on` is at midday and whose `warn` is the
clatter — the one hazard here that is a placed shape rather than a field, because a chute is a place.

## 4. What the region must *provide*, and nothing more

The whole of sections 2 and 3 reduces to a short list of `KHAZ.provide` calls the region makes once, plus two placed
kinds. That is the actual work of item 2:

| Field | From | For |
|---|---|---|
| `pressure` | `core/atmos` by height | `thin-air` over four provinces |
| `temperature` | the model's `tm` raster, plus height, hour and `KHAZ.night` | `cold`, `hot` |
| `dust`, `alkali` | `ATMOS.airLoad` + `ATMOS.dustSeason` | `dust`, `caustic-dust`, and the cargo's corrode dose |
| `visibility` | the whiteout and the storm wall | `KHAZ.sight`, `KHAZ.seen`, `KHAZ.aim` |
| *the wind* | `ATMOS.gale`, through `KHAZ.bindWind` | the God-Bore's bite on `cold`, and `KHAZ.night` |
| *the clock* | the world's `core/clock`, through `KHAZ.bindClock` | every cycle, and the night pools |

Placed, not provided: **`crust`** (the salt pans), **`crush`** (the rockfall chutes), **`hunter`** (the Stalkers),
`fall` and `heat` (the Twins' traps, region 2's), and the bore hazards at the two Ancient shafts.

**Nothing new is proposed for `core/hazard` or `core/atmos`.** The first pass's `thin` kind and `DUST_MODES` family are
both withdrawn.

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
- **Makes the `KHAZ.provide` calls of section 4**, which is the larger half of the job and the one no page does yet:
  `pressure` and `temperature` from the world's own fields, `dust`, `alkali` and `visibility` from `ATMOS.airLoad` and
  `ATMOS.dustSeason` where the region lists them. A region that lists no `fx` fragment provides nothing and the ambient
  hits are simply absent, which is `KHAZ`'s own documented behaviour.
- Binds `KHAZ.bindClock` to the world's clock (`core/clock`) and `KHAZ.bindWind` to `ATMOS`'s wind (`ATMOS.gale`'s, where
  the region takes it), which `KHAZ.night`, the fronts and the God-Bore's bite on `cold` all need and which no page has
  done yet.
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
- **They are not on the Bowl.** The Stalkers are the Catch's, the Stalker Range's and now the **SE outer wall's eastern
  half**: its plan's section 2.5 has pairs and triads using the high snow-chutes and dry wadis of the eastern wall
  (`Loua Waita Guli`, `Waita Guli`, `Wādī al-Zulāl`) to transit between Hub 01, the Catch and the Godsgate. (Its text
  says "the collapsed northern half of the Arcbeam-Stair tunnel"; there is no such tunnel — `PLAN.md` question M.) The
  Bowl's predator is the Bowl mantis (owed to `kits/fauna`) and its danger is bandits.
- **The whiteout is their weapon, and the maths for it is already written.** Its plan, 2.5: *"in the whiteout rime-fog,
  a white-hulled Harpooner crouching motionless among white quartz-breccia boulders is virtually invisible until its
  pneumatic harpoon hisses."* That is `KHAZ.aim` exactly — Koschmieder's contrast at distance, judged by the worst sight
  at the shooter, the line's middle or the target. A Stalker ambush in a 57 m whiteout and the same ambush in clear air
  are two different fights **without a line of special-case code**, because the sight field already drives both.
- **Where they come from is now on the map.** `PLAN-SIM.md` section 4b makes Hub 01 a source with a hidden, capped
  pressure number that sets how many triads are abroad. The hazard records are seeded from it, weighted by distance from
  Hub 01 and by the leg's traffic — so clearing triads genuinely lowers the danger, and the province is a loop rather
  than a backdrop.

## 7. The guides' traps, and the rest of the register

`PLAN-TWINS-CROSSING.md` section 4 already lists the Twins' traps as `core/hazard` records: the frozen box vales F1
(968,1442) and F2 (1068,1528) as `cold` and `fall`, the decoy lava pools L1 (992,1465) and L2 (1035,1493) as `heat` and
`gas`, and the Red Cistern and the Iron Shroud as station pages whose records the region places. **All four traps are
inside the `twins` polygon, and the owner's no-split rule brought that polygon here** (`PLAN.md` section 3), so they are
**this region's** and they land in B5 with everything else. The binding is still core, because region 2's own hazards
will want it.

The Twins' own air belongs with them: the col at 4,680 m is 0.6 atm or below, so `thin-air` bites on Route B where it
does not inside Route A's tubes (+8 to +16 °C and full pressure), which is the mechanical reason the tube road exists.

This region's own register, beyond sections 2, 3 and 6:

| Hazard | Kind | Where |
|---|---|---|
| The salt crust over brine | `crust` + `under: sink` | the four small pans (`basins.json`: levels 368-400 m) and the terminal lake's margin; a pack beast's load breaks it |
| The soda lake's brine | `acid` + `sink` | the lake itself: alkaline enough to burn, soft enough to swallow a beast |
| The yardang fields | **no hazard: shelter** | the one terrain that answers the storm; it must therefore be drawn well (`PLAN-SETPIECES.md`) |
| A dry well | *not a hazard record* | it is the simulation's: `CATCH_TUNE` runs Arfwai's well down to 30 % in late summer (C5, done) |
| **Stair's two bore mouths** | `22-core-hazard-bore.js` presets: `rockburst`, `inrush`, `seal` | the **Theodiga** bore south under the Twins (438 km, kept 2026-11-16) and the **Parabola** bore north under the SE outer wall (ruined, the owner 2026-11-24). Both are the divers' prospects; the fragment exists and is opt-in |
| The Hub 01 road | `hunter`, danger 1 | 44 km of Ancient tunnel east, the one way in; nobody who has taken it has come back. A hazard that is a warning, not a fight |
| The Bāb al-Hawa shaft | `22-core-hazard-bore.js`: `crush`, `inrush`, `seal` | 1,400 m into the rock, plugged 180 m down, still drafting +16 °C air. The divers winch into it. (What it is a shaft *to* is `PLAN.md` question M: there is no Arcbeam-Stair tunnel) |
| The felsenmeer and scree aprons | `slip` | the SE outer wall's 4,200-5,400 m benches: ground that clatters and shifts underfoot (its plan, 2.4) |
| The noon rockfall chutes | `crush` on a cycle | the same province's steep couloirs, discharging as the sun melts the ice cement (section 3e) |
| The Stalker Range above 8,000 m | `thin-air` + `cold`, ambient, with `nav.avoid` | 47 % of 255,000 km²: drawn ground nobody may stand on. The hazard, not a missing mesh, is what keeps them out |
| The Tharn massif's ring walls | the same | 0.40-0.44 atm, `Class O` in the kit's own term; outside this cut but on its horizon |

## 8. Checks (each with a negative, as the house rule asks)

- **The ambient fields** (`KHAZ.here(...).ambient`, worst first): `hot` biting on the Bowl floor and nothing at Ranger
  HQ; `cold` biting on the SE outer wall's crest at 04.00 and nothing at Mantis; `thin-air` k over .8 at 12,000 m in the
  Stalker Range, mild at the Godsgate's 3,620 m saddle (0.99-1.05 atm) and absent on the Catch floor. Negatives: each
  read at the opposite place. With no field provided, **no ambient hits and no `ambient` key in the export** (the
  module's own test does this, so the region's check mirrors it).
- **`KHAZ.sight`**: clean air over the Catch floor gives hundreds of km; the storm's wall gives about 57 m; the SE outer
  wall's whiteout gives under 12 m. `KHAZ.aim` at 100 m through the wall keeps nothing and at 20 m keeps about a
  quarter. Negative: the same calls outside the window.
- **`nav.avoid`** on the ground over 8,000 m: `KWALK.export().zones` lists it, and a route asked across the Stalker
  Range refuses. Negative: the same route through the Godsgate succeeds.
- **The night pool**: cold at 03.00 inside the hollow's lip and nothing at 14.00, nothing in a gale (`KHAZ.bindWind`).
- **The crust**: a 60 kg load holds, a beast's load breaks it, and it stays broken (`KHAZ.load`, `heal: null`); the
  brine below reads `held` while it holds. Negative: the same on gravel reg.
- **The storm**: inside its window `ATMOS.airLoad`'s storm term raises the dust, `KHAZ.sight` falls to the wall's range,
  the ways it covers are closed to `KTRAVEL`, open cargo takes a corrode dose, and a shot of it shows the wall the sight
  range promises; outside the window the floor is clear. Negative: the same day a year on.
- **The God-Bore**: `ATMOS.gale` turns the base wind after dusk and back by dawn; `cold`'s dose on the Godsgate's floor
  is worse at 02.00 than at 14.00 by the wind's factor; a walker behind a wind-baffle takes less. Negative: the same at
  noon, and the same with the gale fragment not listed (the page must draw as it drew).
- **The Stalkers**: a triad's record is in the registry, is **not** on the minimap overlay, and the inspector does not
  name it before it moves; `KHAZ.at` gives danger 1 inside and 0 a stage away. Negative: the overlay with `hunter`
  allowed must fail the check.
- **No NaN, no order dependence**: the probe's three orders give one hazard set (`core/rand`, not a draw count).
