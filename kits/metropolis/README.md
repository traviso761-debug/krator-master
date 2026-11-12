# kits/metropolis

The test bed of the metropolis system (`biomes/ancientsvalley/PLAN-ANOMALIES.md` section 13). `PLAN.md` holds the sixteen designs. Two are built: **S1 the Spindle** (a curved tower)
and **M1 the Ledger** (a slab), each with a hero, a baked shell, an impostor, interiors and the `intact` and `gutted` states. **It stops here for the owner's eye** (`PLAN.md` section 10).

```
python3 tools/build.py kits/metropolis
node kits/metropolis/tests/test-metropolis.js                 # records, plans, facades, cages; each check with a negative
KRATOR_GL=gpu python3 kits/metropolis/verify.py kits/metropolis/dist/metropolis.html --assert --out kits/metropolis/spike
KRATOR_GL=gpu python3 tools/perf_views.py kits/metropolis/dist/metropolis.html --size 1280x800
```

Use `KRATOR_GL=gpu`: software GL loses the page's context (`KNOWN_ISSUES.md`). Pick a view from the select: the pairs stand the real building (west) beside its shell (east).

**To look around,** open `dist/metropolis.html?pitch=140` from a local server. The Tiers views are a city of the two families: fly (W A S D, Q E, Shift), F to walk. Walk in through a portal (a tower's skin stops a walker at the street) and its storey opens; the lift list, or `,` and `.`, rides the lift from storey to storey. Walls stop a walker, and the stairs in the core walk up a storey at a time.

| Fragment | Tag | What |
|---|---|---|
| `40-mp-records.js` | [G data] | the records: storeys and uses, massing, crown, core, ruin states |
| `41-mp-plans.js` | [G data] | `MP.storey(F, k)`: a storey on `AI`'s plates; flats; a pure function, so nothing exists until asked for |
| `42-mp-facade.js` | [G data] | the facade from the rooms: one source for the room's windows and the drawn glass |
| `43-mp-shell.js` | [G data] | `KSHELL.record`, cages, atlas packing; the prototype of `core/shell` |
| `44-mp-audit.js` | [G data] | `MP.audit`: shafts line up, every room reached, flats whole, glass only where rooms want it |
| `46b-mp-ancients.js` | [G data] | `MP.ANCIENTS`: the Ancients kit's buildings brought in (which builder, its name, measured footprint and heights, budget) |
| `46-mp-designs.js` | [G data] | `MP.DESIGNS`: the other fourteen as records (footprint, heights, storey height, the shape's numbers), apart from `MP.FAMILY` until each has plans |
| `50-53` | [draw] | the hero kit, the Spindle, the Ledger |
| `56-mp-interiors.js` | [draw] | a storey drawn on demand, furnished; at most three open (a ruin's only under its standing skin) |
| `54-mp-hero-designs.js` | [draw] | the massing kit `DK` (lathes, rings and slabs of storeys, tubes, lobbies with doors) and a builder for each of the fourteen |
| `46c-mp-planned.js` | [G data] | the designs with plans: their family records (storeys and uses, core, skin radius `envR`, ruins), `MP.planned()` |
| `55-mp-hero-ancients.js` | [draw] | `MP.heroAncient`: a kit builder run into a hero of its own, its instanced detail baked there |
| `59-mp-floors.js` | [draw] | `MP.floors`: storeys and a core for the buildings without plans, read off the drawn shape |
| `59b-mp-ruin-design.js` | [draw] | `MP.ruinDesign`: a design's hero cut to a ruin state of its record, with slabs, core and rubble |
| `44b-mp-sockets.js` | [G data] | `MP.skin`, `MP.sockets`: where every family and state can carry a plant, as records (`API.md`) |
| `59e-mp-overgrow.js` | [draw] | `MP.overgrow`, `MP.plant`, `MP.overgrowDress`: strands, roots, moss, soil and stand-ins drawn at the sockets; the planter adapter |
| `58-mp-cutaway.js` | [web] | the cut-away: X cuts the building in front of you at a storey's ceiling, `[` and `]` move it |
| `57-mp-debris.js` | [draw] | `MP.debris(F, state)`: a ruin's rubble (`KSTACKS` mounds, crushed shaft sections, the lamp's disc, slabs) and what stands free (a stump's fins, a skeleton's frame) |
| `60-mp-shell-host.js` | [web] | `KSHELL`'s bake and draw |
| `70-mp-stage.js` | [web] | what stands where in each view; impostors, one a frame |

## What the spike found

Measured 2026-11-02 on the **Intel Arc 140T**, 1280 x 800, `tools/perf_views.py` (`spike/perf.json`), minimum GPU time of the world pass. Pictures in `spike/`.

| View | Calls | Triangles | GPU ms |
|---|---|---|---|
| The Spindle's hero alone, 300 m | 7 | 74 k | 0.4 |
| Its shell alone, 300 m | 2 | 56 | 0.5 |
| Shell, 130 m (closer than it is meant for: the worst fragment cost) | 2 | 56 | 0.9 |
| Inside a flat (one storey open, its furniture) | 17 | 150 k | 1.1 |
| Blocks 220 m apart, street (3 heroes in range) | 66 | 50 k in frame | 1.3 |
| Blocks 220 m apart, from a roof | 66 | 50 k in frame | 1.8 |
| **Blocks 140 m apart (`?pitch=140`), street: 10 heroes, 109 shells** | 89 | 390 k | **2.9** |
| Blocks 140 m apart, from a roof | 87 | 380 k | 3.7 |
| Blocks 140 m apart, from the air | 63 | 10 k | 2.0 |

Budgets: hero 74k of 80k (Spindle), 36k of 45k (Ledger), 6 and 8 draw calls. Cages 56 and 10 triangles. All four shells and their hull maps bake in 0.15-0.4 s, all four impostors in 0.25-0.6 s.

**What works**

- **The polar heightfield.** A round tower on an octagonal cage of 56 triangles keeps its round silhouette, because the outline comes from the map. A box would have failed this tower outright: that is the main finding.
- **Triangles.** The shell costs about 1/1300 of the hero's triangles, and the same GPU time at 300 m. The hero's gain is vertices, as the plan expected: **a shell costs fragments, not vertices.** At 130 m it costs about twice the hero, so it must not be held closer than the 300 m switch.
- **Windows from rooms.** The facade pattern survives the bake: zones, hoops, blank vaults and ruin breaches all read the same at 300 m.
- **The same lighting.** A patched standard material means no drift between shell and hero as the sun moves.
- **The dither switch** reads as fine grain at the band; the eye check is the owner's.
- **Bake count follows families:** a page's load adds under a second for four bakes.

**What does not**

- **Thin parts** were the sawtooth at the skirt; the hull map from above (a column with nothing in it is air) tidied them, and they still show under 300 m.
- **Roofs** now work: a hull map from above makes them real surfaces. **Soffits** take their colour from a map from below; their shape is the side map's. They still break up under 200 m, inside the hero's range.
- **The map from below sees the wrong thing unless it is cut:** under a lamp, the lowest surface of a column is the shaft's windows far down, which showed as a mosaic on the soffit. The bake now discards everything below the neck (`soffit`, one height a tower: the Stalk's two saucers will need two).
- **The map from below cannot be a bound:** a tower is hollow, so the lowest surface of a column inside it is high up, and using it as a limit erased the walls.
- **Close up** the map is soft under 200 m, with horizontal streaks (`Shell-close-130-m.png`). Hold the switch at 300 m.
- **Shell to impostor** now fades: the impostor stands from 850 m and the shell dithers out in front of it to 1 km. Hero to shell dithers too.
- **Seen steeply from above, a tower is a shell to 3.2 km** (over 35 degrees down): an impostor is a card, and a tall thin tower's card seen from over it is a long leaning smear that overlapped its neighbours and doubled their lamps. An impostor now stands for exactly the towers that are neither hero nor shell.
- **A shell's hit is bisected back to the surface** (five halvings between the last point outside and the first inside), and a ray going down steps no further than the roof map's height above it. Stepping by the side map's gap, a horizontal distance, let a steep ray fall through a flared skirt and read its side lower down (spines round every base), and a roof's colour flipped between the roof map and the side map's top row as the camera moved. On a box, a roof is also where the roof map is flat for 1.5 m all round: past the Ledger's roof hall the long face's map extrudes the hall over the low roof, so the old test (air above, in the side map) read the side map there as dark bars.
- **A hull map is only right on real roofs.** It holds every sill and ledge as a true up-facing surface, and at first that showed as bright slits on every shell seen from above. Top and bottom maps now apply only where the side map shows an overhang of over 1.2 m (3.5 m at first, which drew the Ledger's hall, stepped 1.8 m, as one dark riser).
- **Heroes are the cost of a dense city:** ten of them take the street from 1.3 to 2.9 ms, and 390 k triangles. That is affordable on the Arc for these two; a heavier family counts. Street width is the budget lever, as section 13 says.

**The ruins** (2026-11-03): all seven states of the brief are built for both towers: intact, gutted, crown gone, broken, stump, skeleton, fallen (`MP.RUINS`,
the records' `ruins`). `MP.ruin(F, state)` turns a state into numbers (the cut, the tear's depth, the standing skin, a skeleton's bare frame, what stands above the cut);
`MP.tearAt` steps the torn edge by storeys and by 15-degree sectors (a Spindle) or 3 m bays (the Ledger, whose broken span drops to the arcade); `MP.debrisPlan` lays the
rubble as records, a Spindle's along a fin, the Ledger's onto itself and into the street.

- **A shell holds what stands about the axis, and no more.** A stump's fins standing free and a skeleton's columns and slab edges fan into broad sheets in a polar map (a
  blade off the axis interpolates to the core beside it). They are drawn with the rubble instead, real geometry at every distance; the hero and shell keep the skin and core.
- **The rubble is its own instanced object,** one mesh a material and state, at every ruin within 1 km (a coarse one to 3.2 km): it lies off the tower's axis, so it is in neither the shell nor the
  impostor. At `?pitch=140` the worst street draws 0.94 M triangles in 123 calls with 13 heroes and about 70 ruins' rubble in range (a 1.6 km range took it to 2.2 M); a fallen Spindle's rubble is 22 k.
- **Each state's shell is as tall as what stands,** and the five past gutted take a 0.5 m map and none from below (no lamp): the fourteen records pack one 2048 atlas.
- **The rubble is `core/terrain`'s `KRUBBLE`** (opt-in, 2026-11-03): a heap of discrete broken chunks on a dark bed (a butte's beds read as stepped slabs). Its surface is walked
  (`KRUBBLE.walkTris` into `KWALK`); past 1 km a coarse bed without chunks stands for it to 3.2 km. A ruin's doorway keeps its frame, open; a dark face inside it closes the
  hollow from afar and goes as the walker comes near, when the lobby opens.
- **Shell edges** (2026-11-03): a side map was read up to its slot's edge, where the filter blended in the atlas's empty gutter: at the foot that took the Spindle's radius from
  46 m to a third of it, so its skirt's outer metres went missing and its rim spiked, seen from above. Reads stay half a texel (at their mip) inside the slot. A descending ray
  steps no further than 5 cm over the ground, and the step's limit over a roof reads the sharp texel too. The roof map's heights are 0.1 + 0.9 y/H (0 empty).
- **Crisper shells:** the colour is read a quarter mip under the distance's level (up to 1.25 coarser on a face seen edge-on, which sparkled), the shape at it (three
  quarters, and the shape a level finer, aliased into a dither). Shells stand to 1.4 km (the impostor, 128 px a view, was soft at 1 km).
- **The seam at -180 degrees:** the bake's wrap passes cut theta at the same seam as the main pass, so a triangle across it was dropped in all three and a strip of the
  side map went unbaked above 100 m (a dark line down the shell). The wrap passes now cut at 0.
- **Black shells were a hidden pane:** a page that boots with `innerHeight` 0 set the trace's pixel size to Infinity. It is set every frame now.

The fallen Ledger keeps its arcade (the owner, 2026-11-03): its arches, piers and flares stand in the mound.

## The overgrowth: sockets, growth, wild looks (2026-11-09)

The owner: "I want the ruins themselves to be overgrown in places, like the middle sections of Girder but all over" (Midgar at the end of
FF7). The kit now says **where** every family and every state can carry a plant, as records, and draws **what it draws itself** there;
a biome grows its own species at the same places through a planter. `API.md` has the calls.

- **Sockets** (`44b-mp-sockets.js`, `[G data]`): `MP.sockets(F, look, seed)` reads the family's skin (`MP.skin`: the same radius, rectangle,
  arc and terrace numbers the builders draw from, as parts) and the state's tear, and gives plain records in the hero's frame: `floor`,
  `ledge`, `edge`, `top`, `wall`, `root` and `heap`, each with its outward normal, the size of plant it holds, the room it has and a unit hash a
  host filters by density with. Deterministic by KRAND from (family, state, seed, part, level, index). The node test proves every socket
  of every family and state on its skin and under the state's top. About 1,100 a Spindle crown, 500 a Ledger, 4,300 the Swell (87 k in all).
- **Growth** (`59e-mp-overgrow.js`, `[draw]`): `MP.overgrow(hero, F, state, o)` draws creeper strands as real tubes down the wall from sills,
  torn edges and rims (forking, thinning, leaved), roots down the plinth, moss and soil in the vertex colours round each wet socket (blotches
  from floors and tops, drips under sills, a damp band at the foot), rubble soil on the open floors, and the kit's own stand-in bushes and
  small trees. Because it is geometry and vertex colour on the hero, **the shells and impostors bake it**: a wild Spindle's shell shows the
  strands and the moss at 130 m. `MP.plant(F, state, at, o)` hands each kept socket to a host's planter in the world frame.
- **Wild looks**: a look is a state or `state.wild`; `MP.look` splits it and every reader of a state takes one, so `MP.hero('spindle',
  'crown.wild')`, `KSHELL.record(F, 'crown.wild')` and `MP.debris(F, 'crown.wild')` work. On this page the wild heroes are planted with the
  lowland kits' trees and floor plants (`59d`) on their tops, floors, heaps and feet; the test bed stands every family in three states beside
  their wild looks (`Wild, <family>`), the Spindle and the Ledger beside their baked wild shells, and two wild looks in the tiers' city. The
  shells now pack as many 2048 atlases as they need (two).
- **Fixed on the way:** `MP.ruinDesign` cut a design's triangles out of the index but kept every vertex, so a stump's bounding box (and the
  impostor's card framed from it) still stood at the whole tower's height (an Organ stump read 240 m against its record's 47). The kept
  triangles are compacted into a new geometry (`MP.compact`) and the hero's triangle count is recounted from its meshes (`MP.countTris`).
  Also a `children.forEach(c => G.add(c))` that skipped every other child (THREE's `add` removes it from its parent mid-loop).

## The other fourteen, close up (2026-11-03)

Every design in `PLAN.md` section 4 now has an intact hero (`46` records, `54` builders): views `Design, <name>`, and `Designs, all sixteen` (a 4 by 4 grid, 300 m apart).
Each is under its `PLAN.md` budget. They have no plans, shells or impostors yet: those wait on the shell review (`HANDOFF-SHELL.md`). The owner tossed two as dull
the same day: the Gantry is now **the Organ** (five bronze pipes in an arc) and the Sand Block **the Spiral** (an adobe cone wound by a ramp). The Organ's transit tube
was dropped: no stubs until a tube network joins buildings.

**Every building has walkable entrances.** Its ground storey is a lobby (`DK.lobbyRing` round a ring, `DK.lobbySlab` on a rectangle): a storefront with doors at given
angles or faces, a floor and a ceiling. The doors are the Spindle's sliding leaves (`MP.doorLeaves`), and the lobby's outline goes with the hero (`userData.walk`), so
`towerBlocks` (`56`) blocks it every 0.5 m except across each door. A shape with no lobby that still meets the ground (the Long Curve's arc ends) records its outline with
`DK.walkLine`. The Spiral's ramp doorways are portals into the slope (`DK.portal`: an adobe frame standing proud, bronze leaves set back in the reveal).

**The cut-away** (`58`): X, or the panel's button, cuts the building under the middle of the screen (else the nearest real one) at a storey's ceiling with a clipping
plane on copies of its materials, drawn both sides so the walls show their thickness; on the Spindle and the Ledger the storey under the cut opens with its ceiling hidden.
`[` and `]` move the cut a storey. The fourteen cut at a storey's height and show their walls until they have plans.

## The Ancients kit's buildings (2026-11-03)

The owner asked for the bunker, Sky A, the honeycomb blocks and the laboratories from `kits/ancients`, and the low and mid rises that
round them out. Thirteen of the kit's builders are read in place (`build.py`, `ANC_RUNTIME` and `ANC_BUILDERS`, as `settlements/span`
does) and each is run once, intact, into a hero of its own (`55`): **the Redoubt** (the bunker), **Skyscraper A** (420 m), **the
Honeycomb Block** and **the Apartments** (A, B the honeycomb wall, C), **the Reliquary** and **the Star Laboratory**, then **the
Offices** (the flared ring and the lobed tower), **the Crown Library**, **the Watch** (police), **the Cloisters**, **the Houses**,
**the Capsule Stalks** and **the Bell Hall**; then the kit's industry, eight more, and four new industrial buildings of this kit's (below,
"The last of the Ancients' plans, and industry"). Views `Ancient, <name>`, and `Ancients, all` (a grid 440 m apart).

- **Nothing is redrawn:** the records (`46b`) say which builder runs, and the numbers the stage needs, measured off the drawn hero.
- **Names the kit shares with this page are renamed at build time** (`SUBST`): its error panel, ground, ticks and `onerror` give way to
  the page's, which have the same signatures, and its registry becomes `ANC_REG`/`ANC_REGISTER`. Its fire flicker reads
  `window.NIGHT`. `check_assembly` reads no clash.
- **The kit bakes its instanced detail once a page** (`kbake`); here every hero empties the kit's lists, runs its builder and bakes
  into its own group, so a hero can be cloned like any other.
- **Its texture pack** is a second sidecar, `dist/metropolis.tex.ancients.js` (4.9 MB).
- **The quality pass** (the owner: floating or distorted pieces, room for a working plan). A 1.75 m marker at every building's front,
  and a test that splits each hero into its connected pieces and flags any above the ground that touches nothing (`MP.ancientFloaters`).
  The Honeycomb Block's storeys were 2.3 m and its pilotis under 2 m: scaled 1.5 (3.4 m storeys); the Houses, which the owner wanted
  bigger, 1.5 too (each now about 24 m across, its door about 3.5 m). The rest read at scale (the Reliquary's storeys 4.4 m, the
  Cloisters' 4 m, the Apartments' about 3). One piece floated, the Crown Library's glass finial (55 to 65 m up over the crown's open
  top, on nothing): every hero now drops a baked instance that touches nothing within half a metre. The kit's standing figures are not
  baked (they would scale into giants; the metropolis's people come with its own crowds).

## Shadows (2026-11-03)

The sun casts (`core/shadow`, written for this, the owner's choice of a core module over a local one): one box that follows the view,
90 m round a walker and up to 600 m from high up, on a 4096 map. The heroes, the open storeys and the near rubble cast and take
shadows; the baked shells and the impostors draw their own light and take none. **Off by default** (the owner, 2026-11-03: toggleable and
off in every build; `core/shadow` from `claude/biome-rebuild`): the panel's `shadows` button or `?shadow=1` turns them on, and the page's own
wiring (what casts, what takes) stands either way; `?noshadow` leaves the box out altogether.

## The Ledger's reception (2026-11-03)

The reception (the arcade's middle bay, both sides of the corridor) is laid out by `kits/ancients-interiors`' new **reception** recipe
(a counter facing the door, waiting groups, a notice board), in the kit's core since 2026-11-08 (opt-in before). Its furniture had
been laid out at 28.6 degrees through the corridor: the kit turned a room's frame toward its first door's point, so a door off the
room's middle skewed it; since 2026-11-08 the kit's frame faces the door wall's normal (`AI.furnishPlan`), and the squared door this
build handed it (`mpFrameDoors`) is gone. A storey on the street lifts its slab and furniture 3 cm, off the street plane it was fighting.

The plaza's walk floor reaches 1.2 km round the eye (it was the whole 16 km ground: 2.3 s each time a view changed) and follows it.

## Storeys, cores and entrances for the buildings without plans (2026-11-03)

The owner asked for a rational inside for the fourteen designs and the thirteen Ancients buildings before their room plans: **a floor plate
at every storey and a stair and lift core** (`59`, `MP.floors`, run on each hero as it is built). It reads the hero's own drawn geometry, so it
fits any shape: on a 1 m grid a cell is inside a storey when a flood from outside cannot reach it through the walls cut at two heights in the
storey (a window's opening at one does not let it in) and something of the building covers it above (an open court or a terrace is not
inside). The plate is those cells a cell off the walls, merged into rectangles; the core is a 6 m (else 4 m) square inside every storey nearest
the plan's middle, with a door on each storey. The kit's instanced roof plates and wall panels count (their boxes, under 30 m2 in plan).
Records can say: `floors: false` (a hall: the Crown Library, the Bell Hall), `floorsY0` (the Cupola's transit hall), `floorsMaxY` (the
Terrarium's forest), `roof` (the Watch's drum, which the kit left open-topped, gets a roof at 12.6 m), `roofAccess` (a head-house on the core).

**The Terrace's terraces** are worked roofs: each upper ring opens on the terrace below by four glazed doors on the diagonals, each terrace a
paved walk with a raised planter along its parapet, the roof park a paved ring round its lawn, reached by the core's head-house.

**Entrances for the Ancients' buildings** (`55`, `MP.ancientEntrances`, a record's `entry`): `arch` puts a door (bronze frame, two glass leaves
that part for a walker) in the kit's own arches that open outward (a partition's arch is passed over), at most four spread round; `auto`
finds from each side, in lanes 60 m apart on a long building, the wall a walker meets (past columns, and on a podium the wall that stands on
it, swept along the podium's edge); `core` (the Honeycomb Block on its pilotis, Skyscraper A on its colonnade) leaves the core's ground door as
the entrance; `open` the Cloisters' walks. A door 0.3 to 3 m over the ground before it takes steps; higher, the kit's ramp reaches it (the
Redoubt). The Honeycomb Block's roof units (`plateW`) stood 2 m over its roof: a record's `seat` lowers named kit pieces onto what is below.

**The Spindle's flats' baths** were strips 0.55 to 1.05 m wide on the 30-degree sectors: there the hall is now an L (a 1.06 m entry on the
corridor, a passage along the outer rooms, still opening on every room) and the bath takes the corridor corner behind it, 1.2 to 2 m wide at
its narrow end (to 1.8 to 3.6 m at its far one) and 3.4 to 6.6 m deep; every bath takes a bath or shower, a toilet and a basin, and the
one-bedroom flats' kitchens keep the width a hearth needs.

## Full plans and ruins for the designs, in batches of three (owner, 2026-11-03)

A design given plans gets a family record beside the Spindle's and the Ledger's (`46c`, `design: true`): its storeys and their uses, a core
(stairs and lifts round the axis, or an atrium ringed by galleries with its towers standing in it), its skin's radius at a height (`envR`,
which the round plans and the interior's walls read instead of the Spindle's lathe), its facade's bays and its seven ruin states. Its storeys
open on demand like the Spindle's (walk in, the lift, the cut-away), furnished and audited (`MP.audit`; `tests/test-metropolis.js` runs it on
every planned design). `MP.families()` stays the shelled families (spindle, ledger); `MP.planned()` adds the designs. Its ruins are its own
hero cut by `MP.ruinDesign` (`59b`) at `MP.ruin`'s torn line, with floor slabs under the tear, a stump's core, a skeleton's bare piers and
slabs, and the rubble of a debris plan scaled to it (`40`, the design branch: a tall one falls along its `fall` line with drum sections in
the mound; a squat one falls in on itself). Views: `Ruins, <name>`, the seven states in a row.

**Batch 1:** the Telescope (45 storeys: lobby, market, clinics, offices, records, school, 204 one-bedroom flats, hydroponics, an observation
storey under the cap; its 48 bays a turn give a flat four windows, too few for two bedrooms), the Cupola (the transit hall with a concourse
at each portal; three gallery storeys round the atrium, its four stair and lift towers standing in it, the hall's ceiling open over the
middle), the Spiral (lobby, market, clinic, school, records, plant and tanks up the cone round a core of one stair and one lift).

**Batch 2:** the plans a design carries itself (`plan` on its record, from `MP.planLib`: `rings` for bands outside in, `lobe` for a ring about a
lobe's own centre). The Terrace (10 storeys, 802 rooms): its tiers are bands, rooms at the windows, a corridor, on the wide tiers windowless
stores and stacks with passages to a second corridor, and a 4.5 m service band on the court where the four shafts stand at one radius on every
tier (`core.bays`: a shaft stands in a core bay, not in a middle core); the court a hole in the slab; doors and paved walks on its terraces. The
Stalk (99 rooms): its saucers' glazed bands now hold real storeys (the hotel's two of 3 m, the observatory's one hall of 5 m); the hotel in
bands, bedrooms at the windows, a restaurant and lounge ring, the lift lobby round the core; its saucers fall as discs. The Swell (50 storeys,
2004 rooms): the middle is the core and a concourse ring; each lobe a ring of rooms about its own centre over the arc clear of the middle and
of the other lobes (at mid-height the lobes meet: the floor there is left open), its corridor opening on the concourse, its rooms setting their
own windows; its hero draws each lobe's facade and balconies only where they are outside, and the middle's drum only in the valleys. A ruin's
slabs are now its storeys' own outlines, cut cell by cell.

**Batch 3:** the rect designs, on `MP.planLib.rectRings` (rooms round all four sides in bands outside in, their doors on the corridor, the north
and south rooms taking the corners; inside, a core zone with a core bay for each shaft, or a court; each storey's rectangle turned and moved to
the design's at its height; the rooms set their own windows on the skin and the court). The Reed (54 storeys, 1310 rooms): rooms 7 m deep round a
slot of core turning with the slab, its stair and lift on the axis so they stand in the slot at every turn. The Wedge (47 storeys, 1174 rooms):
a band of 6 to 10 m as the storey allows, the core zone with four shafts where every storey's zone overlaps as it leans, the sky lobby 3 m in.
The Arcades (4 storeys, 268 rooms): street rooms behind the arcade's glass and the relief wall, court rooms on the pool, the shafts in the court's
band facing the corridor. A ruin's floors now tear in patches (noise over the plan), the facade along its line; a rect design's rubble holds
storey-thick slabs, not drum sections.

**Batch 4:** the designs of several parts, on `MP.planLib.parts` (one storey of several plates: their rooms and walls together, each plate's slab
its own, the storey's inside any plate's, and the walk's floor every plate's). `rings` takes a plate's own centre and ids, an arc of a ring (a
curved bar, its ends the skin), a fixed sector grid (so shafts' bays line up storey to storey on an arc whose length changes), a turned band (a
gate centred on its door), its rooms' own windows, and gates (a sector that is a way through; a street gate seeds the audit's reach, for a hall
with no shaft); `strip` is a straight run of floor with glass rails. The Organ (59 storeys, 3476 rooms): each pipe a ring of rooms round its own
stair and lift, from a lobby at its foot to 6 m under its cap, a pipe dropping out where it ends; the storeys the bands cross are plant floors,
and the bands are now a collar round each pipe and a beam between (they ran as a solid slab through the rooms). The Pods (12 storeys, 559
rooms): a lobby at each stalk's foot, the stair and lift up the stalk, nine storeys in each sphere (the three in the glass belt windowed, plant
and stacks in the white shell; the wide ones with a middle ring of meeting rooms and stores, passages between its corridors); the storey at the
tube's floor crosses it by a bridge between gates in the two pods; the dome a market hall, stalls round its glass, its street door the way in.
The Long Curve (9 storeys, 477 rooms): one plate along the arc as far as the runs that reach over the storey, rooms on both faces, a corridor
between, two cores of a stair and a lift in the tall run and a stair in the first and last low run; the lobby's doors open on gates. A design's
rubble can now come from several towers (`towers` on its record: each pipe, each pod and the dome, the curve's runs), each heaped where it
stood along its own fall line, one the cut passes over standing whole; the Pods' bridge keeps its floor in its ruins, its rings round it.
The lift takes the nearest shaft that serves both storeys; a record may give its own hit test (`hitIn`) and entry point (`entryAt`).

**Batch 5:** the last two designs; every design now has plans and ruins. The Yoke (41 storeys, 3039 rooms): each leg a lobby and storeys of
rooms round its own stair and lift up to the junction (89.7 m, a whole storey under the legs' tops); the body's storeys from there, offices at
the skin onto a hall 8.4 m wide in which the legs' stairs and lifts rise as walled islands (core bays with no slab of their own), a ring of
meeting rooms and stores, a corridor, plant and stacks at the heart. The hero changed to fit: the body's soffit is one solid bowl from the arch
to the junction, open where the legs pass up through it (its glass began 14 m lower, over hollow floors), and the leg rooms that face the bowl
lose their windows and become stores. The Terrarium (9 storeys, 292 rooms): a service stalk at the middle from a lobby between the legs' feet
(the legs' inclined tubes carry nothing the plans can walk), a plant storey in the sphere's white foot, five storeys in its glass belt (the
hero's belt now steps with them), and the forest, a park storey with no ceiling (`st.open`), its trees kept clear of the stair's head; the four
pavilions at the legs' feet are ticket halls on the plaza. `roundBands` lays a round plate of any size: rooms at the skin, middle rings of
windowless rooms with passages, the core.

**The Ancients kit's buildings, batch 1** (the Redoubt, Skyscraper A, the Honeycomb Block): plans on a grid (`46d`, `MP.gridPlan`), since
the kit's shapes are drawn, not recorded. `MP.floors` (59) keeps the cells it reads off the hero (each storey's inside, the ground storey's, the
core square); the first hero built makes the building's family from them (`MP.ancientFamily`: a ground storey and one at each level, what each
is for from `MP.ANCIENT_USES`, the core square's stair and lift). A storey's cells are banded by their depth from the skin: rooms 6 m deep at the
skin, a corridor 2 m, then inner rooms (windowless kinds) and corridors in turn; a plate 6 m deep or less is one hall. Every corridor is joined
to the one the core opens on (a way carved through the rooms where they are cut off), the core's south door gets a way to the nearest
corridor, and a part of the storey cut off from the core's (Sky A's office ring round its atrium, the Redoubt's ring round its keep) gets a
bridge over the gap, 40 m at most, with its own slab and glass rails. Rooms are cut along their corridor 6 m apart; walls run on the cells'
edges between rooms and corridors, straightened (Douglas-Peucker, 0.5 m) once the doors are placed; the skin is the hero's. On the ground every
room on the skin opens on the street. The ruins are a design's (the hero cut at the tear, its own plates in pieces of 8 m so the tear cuts
them, the rubble of one tower); the cutter now tests the kit's nested and scaled meshes in the hero's frame, and cuts unindexed ones (Sky A's
crown stood whole over its ruins). The Redoubt 196 rooms, Sky A 1874 (105 storeys), the Honeycomb Block 501 (lodging: bedrooms at the skin,
baths and stores inside); audited under `verify.py --assert` (hostChecks), the planner on synthetic plates in node.

**The Ancients kit's buildings, batch 2** (the Apartments, the Reliquary, the Star Laboratory). A building of several parts now has several cores
(`MP.floors`, 59): the storeys' cells taken together, by connected parts; in each, the square inside the most storeys in a row (its shaft rises
from the ground to the run's top, its square made floor on the storeys under the run); the part with the longest run has the first core, another
part one of its own if it has floor on one of the three lowest storeys (the Apartments' blocks, the Star Laboratory's wings), and a part with none
(Sky A's office ring) is bridged. Every core has a door in the middle of each face, and the plans open each bay through the doors on its own faces
(the stair's half the north, south and west; the lift's the north, south and east): a core never cuts its storey in two. The planner bands each
part of a storey by its own depth (a thin block beside a deep one gets its own corridor), folds a pocket corridor into the room round it, lets a
bridge land on a core's bay where the shaft stands alone on its square, and ends by putting a door through any wall between what is reached and
what is not, then moves every room's doors onto its own outline for the furnisher. The Apartments 776 rooms (six cores), the Reliquary 521 (`labs`:
workshops and offices at the skin, stores and meeting rooms inside), the Star Laboratory 124 (seven cores, one to a wing).

**The Ancients kit's buildings, batch 3** (the Offices, the Crown Library, the Watch). A part of the plan also gets a core of its own when it
stands more than 40 m (a bridge's reach) from every part with one (the Offices' ring on its pilotis: its shaft rises from the ground under it); a
core left alone on its square at the top of its run (its part's floor drawn back round it) gets a short bridge, 15 m at most, from its nearest
face to the floor. A hall (`floors: false`, the Crown Library) is planned on its ground storey's cells alone (`MP.floors` reads them and draws no
plate); `MP.ANCIENT_GROUND` says what a ground storey is for where it is not a lobby (the Library's: `reading`). The owner found the reading
floor cut into the grid's cells an unwalkable mess: a storey whose use is a hall (`MP.ANCIENT_HALL`) is now one room to each part of it, its outline
the floor's, laid by `MP.stackLayout` as a reading hall (the Ancients' archives in rows 4.5 m apart along its long side, a cross of aisles, a
2 m walk round the walls, desks in a reading circle at the middle; 248 pieces, 236 k triangles), and a hall on a plinth stands at its lowest
door's sill (the Library's 1.83 m). The Offices 575 rooms (three cores), the Watch 155; every planned Ancients building passes the audit.

**Curved floors and open issues** (the owner, 2026-11-03: fix the curved plans and the other open issues). A grid plan's round or lobed part
(its outline never under 0.55 of its farthest reach from its middle, filling under 0.9 of its box: the Watch's drum, the Reliquary's flower,
Sky A's office ring) is cut by angle about its middle: each band's rooms are wedges about 6 m wide at the band's middle, their partitions straight
rays, and the part keeps two rings of rooms, deeper being one open floor round the core. A design's tear (`MP.tearAtXZ`) takes its noise round a
circle, so it no longer jumps where the angle wraps. A grid plan's bridge of 8 m or less crosses a wall: the hero's small pieces in its path go
(`MP.ancientDoorways`). The Terrace's court band holds meeting rooms and stores windowed on the court; the Spiral's portals stand where its ramp
passes each storey's floor. The core search in `MP.floors` works in each part's own box (a building of many parts was 1.5 s a hero).
Then: a shaft may turn (`yaw` on its record: its walls, steps, walk strips and landing laid square and turned about its middle), and the Long
Curve's shafts stand square to the arc; the Spiral's ramp is walked (strips along its tread, `G.userData.strips`, whole or gutted); a ruin's
slabs take an outline at 48 points at most, cells about 6 m round and 8 m deep (the Swell's crown was 161 k triangles, now 66 k; the Organ's 168
k, now 99 k); Sky A's widest storeys are about 65 to 125 k triangles furnished (they were 720 k before its ring was cut by angle).

**The Terrarium's way in and its forest** (the owner, 2026-11-03: a real entrance and a way to the forest deck; plants vended from the
southwestern and northwestern lowlands, the whole one orderly and at least one ruin overgrown; modular, as little biome code as possible). The
lobby between the legs' feet is 8 m round (its ring plan 7.2), the main doors under a canopy on two piers with a paved walk out past the sphere,
and the core comes up on the deck in a glazed kiosk with a bronze roof, open to the walk. The plants: `build.py` reads in place only each kit's
species, its trees and its last fragment (`FLORA_KITS`: `48a-flora-*` the southwest's four, the floor among them for its floor plants; `48b-flora-*`
the northwest's three); none of their passes runs, no dress, no library pack. A design's record may say what it plants (`flora(state)`: records
`{ref, x, y, z, scale, seed}`, `ref` the kit's own name, `'swlowlands.magnolia'` a tree, `'swlowlands:fern'` a floor plant); `MP.flora` (`59d`)
vends each through the kit's own API (`SWLOW.treeAt`, `SWLOW.plantAt`, else core/biome's `BIO.kitBuilder`), bakes them into a group of the
hero's with only those two kits in the bake, and takes back the registry entries they added; `MP.floraDress` adds the group after the ruin is
cut, so the plants stand whole on a ruin. The Terrarium whole and gutted is three rings of trees under the dome (magnolia and tree fern,
jacaranda and banksia, pompom, grass tree and skirt palm) with beds of floor plants between and four clear walks from the kiosk (112 plants,
about 58 k triangles); its ruins are overgrown: the deck, while it stands (the crown, the skeleton), thick with trees and floor plants anyhow, and
the ground round the legs taken back (the crown 160 plants, about 70 k; a ruin without its deck 70). Without the two kits on the page the
record's own stand-in cones are drawn.

**The last of the Ancients' plans, and industry** (the owner, 2026-11-03: the ruins need industry; the kit's data center, robot factory,
factory and fuel tanks in all their versions, then a third new one of each). The Cloisters (a college: schoolrooms, lodging, its stacks), the
Houses and the Capsule Stalks (lodging) and the Bell Hall (one hall) have plans. Eight industrial builders come in from the kit, read in place
(`ANC_BUILDERS`): **the Vault** and **the Perforated Stacks** (data centers), **the Assembler** and **the Rig** (robot factories), **the Foundry**
and **the Pilotis Works** (factories), **the Well** and **the Tank Yard** (fuel). The four new ones are drawn on this page in the kit's own manner
and with its alternates' helpers (`46e-mp-industry.js`, registered like the kit's in `46b`, so they take the same floors, plans and ruins):
**the Cooling Towers** (a four-storey server hall, four hyperboloid towers on leg rings, pipe bridges), **the Gantry Hall** (a sawtooth assembly
hall glazed on its north lights, an office block, a yard under five portal gantries), **the Furnace Stacks** (three halls stepping down, five
banded stacks, a conveyor over an open ore bunker) and **the Spheres** (a domed pump hall, six spherical tanks on leg rings). An industrial floor
is not cut into rooms (the Vault's 400 m plate made 11,230 of them, 14 s a plan): every storey of an industrial building is a machine hall
(`MP.ANCIENT_HALL`: `servers`, `works`), one room to each part of the floor, the core's bays opening into the hall each face stands in, the
parts joined by the family's bridges, a core standing alone mid-air bridged to the nearest hall within 15 m, a sliver under 25 m2 dropped and a
part under 200 m2 no shaft, bridge or street reaches made a ledge (walked, not worked, as the room plan's thin parts are corridors). `MP.machineLayout`
lays a hall: runs of ten server racks back to back with a stand at the head (the data centers), or bays of a machine and its workstation, every
fifth a store of cargo pods (the rest), in runs nearest the core first, 240 pieces a storey shared by hall size (the Vault's floor about 125 k
triangles). A part's storeys above its core's run (the Rig's deck on its legs, 20 m over the block's roof) get a core of their own when they hold
200 m2 of floor (`MP.floors`). All twenty-five Ancients buildings' plans pass the audit. Views `Inside the Vault, a server floor` and
`Inside the Gantry Hall, the floor`.

**Open issues, 2026-11-04.** Shadows are off by default (above). A record's `open` boxes stay one tall space (the Gantry Hall's assembly hall;
the Furnace Stacks' halls are `floors: false`). A short bridge's doorway now splits a big triangle in its path (to about half a square metre
near the opening) and drops a kit piece under 4 m reaching in: 374 of the 377 doorways are clear. A ruin's cut instances are taken out of
the count rather than hidden at zero scale, and its slab cells go in runs: every design's ruins are within budget.

**The yards' pieces** (the owner, 2026-11-10: the Ancient's Valley's industrial district, its Yards station; `46f-mp-yards.js` records,
`57y-mp-yards-draw.js` drawing). What stands between the industrial halls, as plain records first (`MP.yards`, [G data]: numbers in, records
out, every figure fixed or a KRAND position hash, the ruin by `o.damage`): `tankFarm` (a bund and its tanks in rows: upright cylinders with
cone, floating or domed roofs, and a share of spheres on leg rings after the owner's refinery reference; whole, holed, burnt, collapsed or
gone), `pipeRack` (bents along a polyline carrying one or two tiers of pipes; `o.skip` leaves a bent out where a street or a track runs, so
the pipes span it; runs of bents down sag the pipes to the ground), `dishArray`, `chimney` (tapered, banded, broken at a height by damage),
`conveyor` (an enclosed gallery on trestles, `o.skip` for the trestles, a section down), `slagHeap` and `slagH` (heaps the host adds to its
ground), `spill` (dead ground and pools), `turntable` (the pit, its bridge and a fan of roundhouse stalls), `gantry` (a loading gantry over
tracks), `railYard` (sidings fanning off a line's path at a spacing, each turnout longer than the last, buffer stops, the yard's outline)
and `inside`. `MP.yardsDraw(records, {kt: KTRANSIT})` draws them into one builder (the transit kit's, handed in: its library families rust,
steel, concrete, corrugated, white, paint) by family and chunk, so a district of them is a few calls a chunk. The kit's own sheet does not
show them yet; the valley's Yards station is where they stand (`biomes/ancientsvalley/stations/yards/`).

**The farm belt: Soleri's planned developments** (the owner, 2026-11-04 and 2026-11-10; `biomes/ancientsvalley/PLAN.md` section 12, 2b, for the
valley's Terraces station). Eight families, each a design with plans on this kit's machinery, so nothing downstream changed: `46f-mp-farm.js`
([G data]) holds their records (`MP.DESIGNS` for the shape, `MP.FAMILY` with `design: true, farm: true` for the storeys, core, `envR` and the
seven ruin states; `MP.FARM_KEYS`; `MP.aqueductJoin`), `54f-mp-hero-farm.js` ([draw]) their builders on `DK` (added to `MP.DESIGN_BUILD`), and
`70f-mp-stage-farm.js` ([web]) shows them on this page. `MP.hero(key, state)` draws them, `MP.ruinDesign` cuts their ruins, `MP.debrisPlan` heaps
them, `MP.storey` plans them and `MP.audit` checks them; a box shell (`F.shell`, the valley's middle tier for every design) and an impostor are
baked from their heroes.

| Key | Name | What | Storeys | Intact tris |
|---|---|---|---|---|
| `pod` | the Growing Pod | a hexagonal plinth (pumps and tanks, louvred, two doors) and a faceted hexagonal glass dome over the growing floor and a mezzanine of beds, a lantern | plant, 2 hydroponics | about 2 k |
| `vault` | the Vault House | a glazed barrel vault ribbed every 8 m on an elongated hexagonal plinth, glazed ends, a gallery of beds | plant, 2 hydroponics (rect rings) | about 3 k |
| `stack` | the Growing Stack | five glazed tiers stepping back up a slope (its +z downhill), each roof the next tier's planted terrace, a blank retaining wall into the hill | plant, 4 hydroponics (rect rings) | about 2.6 k |
| `hall` | the Hub Hall | a drum of two storeys under a ribbed shell dome with an oculus, a parabolic apse arch over its doors | hall, offices, records | about 8 k |
| `market` | the Market | a glass drum of stalls under a folded concrete umbrella of twelve petals, a lantern | 2 market | about 5 k |
| `watertower` | the Water Tower | a pump drum, a fluted shaft holding the stair and the lift, a tank bowl with a gallery, a cap | plant, 3 tanks | about 2 k |
| `aqueduct` | the Aqueduct | a module of three arches (66 m), half piers at its ends so modules laid end to end meet in one pier, a dry trough | none | about 400 |
| `pumphouse` | the Pump House | an octagonal drum (a pump hall and a switch floor), an eight-sided roof, a standpipe, a sluice channel | 2 plant | about 1.3 k |

Each is far under its budget (12 to 18 k). The greenhouses' glass is `glassClear` (the beds show through it), so a gutted pod or vault keeps its
ribs and mullions and loses its panes. **A wall is drawn in bands of 4 m or less** (`MP.FARM_FIX`'s quads and lathes): the ruin cut keeps a
triangle only when all of it stands under the torn line, and the first cut of the aqueduct, whose piers were single 23 m quads, left a broken
module as heaps on the ground. The skeleton state keeps a design's piers (instanced panels) and its slabs, not its merged ribs: a pod's or a
vault's skeleton is its plinth with its beds and slabs open to the sky (the notes say so).

**On this page** (views `Farm, <name>: hero, shell, impostor`, intact and gutted, in a showroom 5 km south of the tiers; `Farm ruins, <name>`, the
seven states in a row; `Farm, all eight`; `Farm, an aqueduct of ten modules`, laid on a curve of 4 degrees a joint). The farm's shells pack an atlas
of their own and its impostors a set and a kit of their own (`mpfarm`, baked apart from the towers'). Its checks join the page's through
`MP.EXTRA_CHECKS` and `MP.EXTRA_NEGATIVES` (`99-host-take.js`): the audit, every state built under budget with no NaN and no floating piece (a mesh's
connected pieces by shared corners, flooded from the ground), the ruins lower than the intact and cut rather than erased, a shell and an impostor
baked, the pod's dome on its plinth, the aqueduct's modules meeting end to end; each with a negative. `node tests/test-metropolis.js` audits the
eight, their ruins, rubble and box shell records, the joint and its arches. **Checked 2026-11-10 on the Arc 140T** (`verify.py --assert`, the
last of four runs): every check and negative passes, the 16 farm impostors bake. The runs before it found the lantern caps of the gutted pod and
market and the hall's canopy standing on nothing once their glass went (posts added), the vault's stump record as tall as its broken one, and the
ruin cut erasing single tall quads (the banding above). A whole or gutted hero must have no loose piece; a ruin past gutted is counted, not
failed: its loose remnants are the kit's cut (59b) as every design's are (a skeleton's piers between its slabs), from 0 (the pump house) to 216
(the stack's tiers), `KNOWN_ISSUES.md`.

**Which shapes shell well** (from these two and the geometry; only the first two are measured):

| Shape | Expected | Why |
|---|---|---|
| Tapered round towers, cones, drums, domes | good, **measured** | star-shaped about the axis |
| Long slabs | good, **measured** | box mode, 10 triangles; the flares stand within its inset |
| Wedges, twisted slabs, lobes, octagons | should be good | still star-shaped; the twist's facets need testing |
| Disc and saucer towers | fair | the soffit shows from the street |
| Arches, courts, the Yoke, the Terrace, the Arcades | poor in one map | a surface behind a surface: two parts or real geometry |
| A skeleton ruin (a bare frame in front of its floors) | **none** | a surface behind a surface: a heightfield bakes the core standing through the slabs (the owner saw it, 2026-11-03); a skeleton is a hero to the hero's range, then its impostor (`MP.NOSHELL`, 70) |
| The Long Curve | poor in polar | not star-shaped from inside: box segments, or the arc's centre as the axis |

**Converting an older Ancient building** would take four things: a record with an envelope and a cage; a mesh with no ground plane or interior in the bake (the bake takes the outermost surface, so anything outside the tower spoils it); a choice of `polar` or `box`; and a mask for its glass, since the kit's materials do not say which are windows. A tower built from `kdef` kit pieces needs them gathered into a Group for the bake. A building with no room plan keeps a shell with fake rooms: enough at range, and the interiors are a separate job. Bake cost should be small; atlas space is 3 x 2048 px per four bakes here, about 67 MB of GPU memory with mips, with room to spare in it, made at load, so it does not count against the page cap.

**Page size:** 2.9 MB, plus a 2.6 MB texture pack beside it. The furniture's detail maps (`furniture_bundle.bundle(tex=True)`) are 1.4 MB of the page.
