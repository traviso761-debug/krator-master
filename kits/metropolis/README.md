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
**the Capsule Stalks** and **the Bell Hall**. Views `Ancient, <name>`, and `Ancients, all` (a grid 440 m apart).

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
shadows; the baked shells and the impostors draw their own light and take none. `?noshadow` turns them off.

## The Ledger's reception (2026-11-03)

The reception (the arcade's middle bay, both sides of the corridor) is laid out by `kits/ancients-interiors`' new **reception** recipe
(a counter facing the door, waiting groups, a notice board), opt-in until the next interiors update (`ab.bundle(reception=True)`;
`TODO.md`). Its furniture had been laid out at 28.6 degrees through the corridor: the kit turns a room's frame toward its first
door's point, so a door off the room's middle skews it. `mpFrameDoors` (`56`) hands the kit a squared door until the kit is fixed
(`TODO.md`). A storey on the street lifts its slab and furniture 3 cm, off the street plane it was fighting.

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

**Which shapes shell well** (from these two and the geometry; only the first two are measured):

| Shape | Expected | Why |
|---|---|---|
| Tapered round towers, cones, drums, domes | good, **measured** | star-shaped about the axis |
| Long slabs | good, **measured** | box mode, 10 triangles; the flares stand within its inset |
| Wedges, twisted slabs, lobes, octagons | should be good | still star-shaped; the twist's facets need testing |
| Disc and saucer towers | fair | the soffit shows from the street |
| Arches, courts, the Yoke, the Terrace, the Arcades | poor in one map | a surface behind a surface: two parts or real geometry |
| The Long Curve | poor in polar | not star-shaped from inside: box segments, or the arc's centre as the axis |

**Converting an older Ancient building** would take four things: a record with an envelope and a cage; a mesh with no ground plane or interior in the bake (the bake takes the outermost surface, so anything outside the tower spoils it); a choice of `polar` or `box`; and a mask for its glass, since the kit's materials do not say which are windows. A tower built from `kdef` kit pieces needs them gathered into a Group for the bake. A building with no room plan keeps a shell with fake rooms: enough at range, and the interiors are a separate job. Bake cost should be small; atlas space is 3 x 2048 px per four bakes here, about 67 MB of GPU memory with mips, with room to spare in it, made at load, so it does not count against the page cap.

**Page size:** 2.9 MB, plus a 2.6 MB texture pack beside it. The furniture's detail maps (`furniture_bundle.bundle(tex=True)`) are 1.4 MB of the page.
