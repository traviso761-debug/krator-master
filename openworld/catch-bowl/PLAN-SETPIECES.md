# Setpieces: the Twins' two trails, their named stops, and the Catch's own (plan, 2026-11-24)

Item 4 of the owner's brief: *"Make setpieces for the individual Twins pathways through the two divergent trails
including individual ones for each named stop; pure procedural gen will not do this justice."* Everything is *proposed*
unless it quotes the owner or a settled plan.

The owner is right, and the reason is worth writing down: every stop on the Twins has a **job in the crossing** — a toll
is taken here, a tally falls due there, a caravan washes its eyes before the descent — and a seeded placement cannot
express a job. What the region can do procedurally is the *ground* and the *flora*; the stops have to be authored.

**Where they belong — settled 2026-11-24.** The owner's no-split rule brought the **`twins` polygon into this region**
(`PLAN.md` section 3), so **every setpiece in this file is this region's**: Route B's five stops, Route A's insides, the
Catch's own eight and the Rangers' last cairn. Only Route A's Vale portal (938,1496) and Strongbow (1001,1596) lie in
region 2's polygon, and the two ways end there marked `short`. The machinery (section 1) is still core, written once,
because region 2's own fixtures will want it. Nothing here can start before the `trail` kind of `PLAN.md` B3.

## 1. The machinery: fixtures in a streamed region (core, *proposed*)

`PLAN-TWINS-CROSSING.md` already uses the word: *"the Hall's cistern and the guides' torch brackets as fixtures"*. There
is no such thing yet. A region can draw a **village** (`core/hamlet`), a **laid village** (Gihon's), a **camp**
(`KWCAMPS`), a **bridge**, a **landform** and a **tube** — but it has no way to put one authored thing in one authored
place and have it stream with the tile it stands on.

Two fragments, on exactly the shape `48w-world-camps.js` and `88s-world-sites.js` set for the pitched camps a fortnight
ago (Stage 8 T26, the owner: *"there could be many options here. add as much flexibility as possible"*):

### `core/world/48f-world-fixtures.js` — `WFIX` `[G data]`

- **A FIXTURE record**: `{id, kind, name?, culture?, and where: at [x, z] | px [x, y] | site + near | way + s (metres
  along a laid way) | tube + s (metres along a tube, for Route A's insides), on? ('ground' | 'water' | 'cliff' |
  'tube'), look? (m searched round the point), R? (the disc it wants), face? (toward the way, a bearing, or a point),
  level?, seed?, when? (a calendar window, as `KWCAMPS.when`), and whatever its builder reads}`.
- **Builders are a registry**, never a closed list: `WFIX.builder(name, fn, {R, check})`, `fn(rec, ctx)` a plain
  function on records returning placed slots (`{id, key, kind, x, y, z, ry, w, d, h}`), with its own fields. `ctx`
  hands it the fixture's seed (`unit(i, salt)` on `core/rand`, never a draw count), the ground, the way's direction, a
  placer filed in `core/space`, and the kit's boxes exactly as `KWCAMPS` does.
- **`WFIX.plan(spec, world)`** writes the plan's `fixtures` (plan **version 3**, beside the hazards; a region with none
  is written as today, so every baked hash stands), **`WFIX.of(plan)`**, **`WFIX.check()`**.
- **A fixture outside the cut goes to `uncut`**, not to an error — the rule `KWCAMPS` set, and the one that lets region 2
  and this region share a spec file across a seam.

### `core/world/88f-world-fixtures.js` — `[web]`

- Draws each fixture near the camera, merged by material key, with the tile it stands on, and registers every piece in
  `core/tags` **before** it is drawn.
- **Seats it on the drawn mesh, not the analytic ground.** The skill's hardest-won rule: `KSTACKS` walls stand up to 12 m
  inside `footR`, and the world's ground cells bridge anything narrower than themselves. A bracket on a tube wall, a
  shrine against a cliff, a windlass over a portal: rays against the rendered surface, the distance recorded so a check
  can measure it.
- **Every ruin goes to `core/ruins`** (`KRUINS.watch(root, {name, ground})`), as CLAUDE.md requires: nothing floats, each
  wreck lies on its lowest points, seated by its rotated extents and never at a fixed height.
- Fixtures join "Go to" and the minimap's marks, so the owner can fly to each one and look at it.

### Why not just put them in a settlement page

Because they are not settlements. A toll house on a trail, a shrine at a crossroads, a cistern inside a lava tube and a
windlass over a bore's mouth each want **one** authored group in **one** place on **streamed** ground, with no census,
no lanes, no frontage and no city plan. Putting them through `core/hamlet` would make each a village of one building
(which is what the roads' inns do today, and it shows); putting them through a settlement page would give each its own
build, bake and verify for a hundred triangles.

## 2. Route B, the Steaming-Stone Dash

Outdoors over the col, a day between oases, for wagons and big herds that cannot pass the tubes' 3.5 m chokes. The
Brotherhood of the Two Horns guides it and takes the Split Tally. Each stop is a fixture set, not a village: the
Brotherhood keeps it, the caravans sleep in it, nobody farms.

| # | Stop | Px | Elev | Its job | The setpiece |
|---|---|---|---|---|---|
| 1 | **Sinter-Gate** (*Bāb al-Bukhār*) | 996,1504 | 3,777 m | Route B's south gate; the **gate half of the Split Tally (4 %)** falls due here | The **toll house** astride the trail: a gate you cannot go round, a tally board with the season's trains cut into it, the Brotherhood's two-horn sign, a weighbridge of sinter blocks. **Heated stone corrals** built on the sinter apron so the beasts do not freeze: low walls on warm ground, steam off the troughs at dawn. The sinter terraces themselves from `biomes/twins` read in place |
| 2 | **Mud-Kettle Hollow** | 1005,1489 | 4,327 m | the first night out of the gate | A **maar crater** with mud pots: a plank walk out over the mud on driven posts (the crust is a `KHAZ.crust` hazard), a bath house of stacked slabs where the caravaneers boil the alkali out of their clothes, wagon ruts worn a foot deep in the rim, and the bones of a wagon that went in |
| 3 | **the Brazier** (*Al-Miǧmarah*) | 1016,1479 | 4,680 m | the **mid-pass crossroads**, where **the guide's second half falls due**; the highest ground a caravan crosses | The **Shrine of the Split Horn**: a split horn of basalt, taller than a man, with the second tally cut into the two halves; coin, salt and horn offerings in the cleft; the guides' own graves in a row facing the col. The crossroads where Route A's Hall path comes up. Its station page is `biomes/twins`'s `brazier`, so the ground is already designed |
| 4 | **Brimstone-Tarn** | 1031,1473 | 4,418 m | water, and the Twins' sulfur (255) | A **sulfur tarn**, yellow-rimmed, with a drawing stage on stilts out to clean water, sulfur barrows and a stack of cut blocks waiting for a train going down, and a sign nobody obeys about drinking it |
| 5 | **Catch-Lookout Spring** | 1056,1462 | 3,690 m | where caravans **wash the alkali from their eyes** before the descent, and the first sight of the Catch | The **eye-wash basins**: a run of stone troughs fed by a spring pipe, a rag line, and the ragged heap of rags nobody takes down. The **lookout** itself: a cairn on the lip with the whole Catch below it and its 10-17 km walls behind — the region's best view and the one shot the gallery wants. Its station page is `catchlookout` |

Route B's trail between them is `ROADS` with the `trail` kind (*proposed:* 4 m wide, 18 % ruling grade,
`PLAN-TWINS-CROSSING.md` section 3). Measured, Lookout to Sinter-Gate is 152 km at a median 1.7 %, so the trail is not
the hard part; the col's cold and the winter closure are (`PLAN-HAZARDS.md`).

## 3. Route A, the Dark-Tube Road

Four drained lava tubes and three open sprints, pack mules and yaks only, +8 to +16 °C inside. The tubes themselves are
**built** (`PLAN-TWINS-CROSSING.md` W3 landed 2026-11-16: `src/48k-world-tubes.js`, 244 km of Route A, the south feeder's
131, 10 portals, 17 skylights, 14 chokes of 3.5 m, drawn by `core/world` 42k/88k on `KCAVERN`). What they have no way to
hold is **the furniture of a road that people use**, which is what fixtures are for.

| Stop | Where | The setpiece |
|---|---|---|
| **The Vale's portal** | 938,1496 (A1's head) | The way in: a rubble ramp cut by hand, the Brotherhood's sign, a lamp niche with a century of soot, and the last daylight on the floor |
| **The First Skylight Break** | A1's end | Where the roof fell: a cone of rubble up to daylight, cave lichen round the hole's rim (the one thing that grows in the tubes), and the ladder nobody maintains |
| **The three Breaths** | Sprints 1-3 | Outside, in the wind, between tubes: obsidian boulder fields, a wind-break wall of stacked slabs on the upwind side of each, a bone pile where the mules stop. The sprints are the dangerous part of Route A and should **look** short and exposed |
| **The Hall of the Tally-Marks** | 1014,1464, inside A3 | The overnight camp and **Route A's pay point**. Its **cistern** (the plan's own word): a cut basin fed by the roof crack's drip, with the water's level marked in a thousand years of scratches; **the tally marks** themselves over every wall, each train that passed; the **guides' torch brackets** at an interval down the tube; sleeping ledges cut in the wall; the smoke stain on the roof. This is the single best setpiece on the crossing and it should be built first |
| **The roof crack** | the Hall | The reason the Hall is here: a crack to the surface, the drip, a shaft of light at noon on the basin |
| **The chokes** | 14 of them, 3.5 m | Each a squeeze: the rock polished shoulder-high by a thousand loads, loads cut from a pack that did not fit, a scratched measure on the wall |
| **The 18 m basalt arch** | 1038,1452 | Route A's north mouth, onto the fan 65 km south-west of Stair. An arch you can see from the floor, the trail switchbacking down out of it, and a last cairn. It stands inside **`the catch`** polygon, so arch and descent are one setpiece now |
| **The south feeder's gasp** | 1028,1506.5 | Where the Strongbow branch climbs onto Route B under the SE Twin: a hands-and-knees rise with cut steps, a rope anchor, and the point where a mule has to be unloaded and loaded again |
| **Strongbow's portal** | 1010,1517 | The feeder's lower end near Strongbow, with the Sultan's lift above and the Brotherhood's Strongbow guild house (300) behind |

## 4. The Catch's own setpieces (this region)

| Setpiece | Where | What it holds |
|---|---|---|
| **The arch's north mouth and the descent** | 1038,1452 | The other half of Route A's arch: the trail down the faulted basalt ledges onto the salt and sand, a cairn at each turn, and the first of the floor's dust |
| **The Theodiga bore's Stair mouth** | Stair, 1106,1442 | The owner kept the bore (2026-11-16): the portal open by the spring, a licence board nobody reads, a windlass over the first shaft, spoil heaps, fire rings, and **the divers' camp** — crates of alloy that came out of a dry ruin bright, not rusted, and a tally of who went in and did not come out. The seal is a rubble plug deep inside and is **not drawn** (settled 2026-10-26) |
| **The Godsgate** | the saddle, 1029,1300 (5,282 m) | The owner accepted the **surviving Ancient surface highway** and the **Bab al-Hawa shaft** (`ANCIENT-NETWORK.md` 8.1, answer 7). The setpiece: a stretch of the Ancients' 30 m way with its two guideways still down the middle, broken and drifted over, the caravans' own track wandering off it and back; the shaft's mouth at 1033,1258 fenced with slabs; and nothing alive. **No caravanserai** (question 4) |
| **The White Dragon Mounds** | the lake beds, round 1035,1392 | The wind-carved lake beds as a place, not a texture: yardang fields and castellated mesas (`KSTACKS`, `KSTRATA`'s `evaporite-strand`), and — because `biomes/catch/PLAN.md` says so — **the one shelter from a storm**: a slot between two mounds with a hundred caravans' fire scars in it, wall-stacked wind-breaks, and names cut in the soft silt |
| **The wandering lake's strandlines** | the terminal lake, 318 m | The old lake's benches stepping down, each a different decade's shore; a boat of some long-dead expedition a kilometre from any water; the four small pans (`basins.json`, 368-400 m) with their crusts |
| **The Rangers' last cairn** | far east on unmarked ground, beyond the Stalker Gate network's westernmost waystation | **There is no road** (the owner, 2026-11-24): *"There is no trail towards hub 01. People who go that way tend not to come back."* What there is, is where the foolhardy turned back — a cairn with other people's gear piled on it, a tally of names that stops, and a sightline east to **a tower that is not rock**. Reached only by someone who goes without a road. Nothing beyond it is drawn, and nothing names what the tower is: the rangers' reports call it an Ancient facility and **surmise** the rest |
| **A Stalker ambush, dressed** | seeded, a stage out from an oasis | Not an authored place — the Stalkers' positions are seeded from the traffic (`PLAN-HAZARDS.md` section 6) — but the **aftermath** is a fixture: a wagon on its side, a harpoon line still in the sand, a beast's bones picked clean by nothing, half-covered. Drawn where the simulation recorded a loss, which is the thing procedural generation genuinely does better |
| **Parabola's bore portal and mustering ground** | 970,1186 | The **north portal of the ruined Parabola-Stair bore** (the owner, 2026-11-24) where the Ancients' highway over the Godsgate also begins: the portal's mouth with Yuni's old workings round it (they stripped the northern half long ago), the guideways' stubs, and beside it where the Izani caravans form up — a mustering ground, a water board with the oases' states chalked on it, and the last green thing on the road north |
| **The arcology's road head** | 1016,1058 | The Iziz arcology the highway passes (Arcbeam until 2026-11-25; name TBD); **no tunnel** runs from it (P17). The highway's cutting and a caravanserai's halt, at a town of 10,000 |

## 5. The order, and the checks

1. **The `trail` kind** (`PLAN.md` B3) — nothing here works without it.
2. **`48f`/`88f`** (section 1), with the Hall of the Tally-Marks as the first fixture built, because it exercises every
   hard case at once: inside a tube, on a drawn surface, with water, lit, and at a distance along a tube rather than a
   point.
3. **Route B's five stops**, in region 2, with its trail.
4. **Route A's insides**, in region 2, on the tubes that already exist.
5. **The Catch's eight**, here.

Checks, each with a negative:

- **Every fixture where its record puts it**, within a metre, on the ground or on the surface it names; the negative
  moves it 50 m and must fail.
- **Nothing floats and nothing is buried**: `KRUINS.watch` on every wreck, and a ray down at each piece meets it.
- **Anything hung on rock is on the drawn mesh**, with the measured distance recorded (the skill's rule); the negative
  uses the analytic ground and must fail.
- **Inside a tube**: the floor under each fixture's feet and the rock over its head, as the tubes' own walk check does.
- **A walker reaches each stop** by its trail, and the stop's own hazard (the crust at Mud-Kettle, the cold at the
  Brazier) holds where it should.
- **Order-free**: the probe's three orders give one scene (`core/rand` by cell and salt, never a draw count).
- **A shot of each stop**, with the frame time, as the tubes' verify takes them. Nineteen stops, nineteen shots: this is
  what tells the owner whether procedural generation was really not doing them justice.
