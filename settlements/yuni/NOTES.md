# Yuni — build notes

Four build targets come out of one source tree (`build.py`, fragments in `src/`):

| file | `window.YUNI_TARGET` | what it is |
|---|---|---|
| `yuni.html` | `world` | the valley, the butte, the Grand Vault, the wall and gates, the canal, the street network, the underground antechamber |
| `yuni-assets.html` | `sheet` | every registered ASSET, each variant, laid out in family rows on flat ground |
| `yuni-plants.html` | `flora` | every registered PLANT species, grouped by climate band |

`SHEET` is true for all three catalogue targets (flat ground, no town); `CATALOG` names which
catalogue, so `70-sheet.js` lays out buildings only on `sheet` and `71-catalog.js` handles the
other two. Catalogue targets shrink `CITY_EXT` to 300 m and the night-light volume with it.

## The three registries

All declared in `src/53-assets.js`, which is the contract subagents work against.

- `ASSET({key,name,family,districts,wealth,w,d,h,variants,build})` — a building.
- `FURN({key,name,culture,room,w,d,h,variants,build})` — interior furniture. `culture` is
  required and must be one of `FURN_CULTURES`: `ancient`, `ancients-salvage`, `yuni-court`,
  `yuni-common`, `yuni-poor`, `sahelian`, `order`, `nomad`. A `furniture-culture-tagged`
  invariant enforces it.
- `PLANT({key,name,climate,aridity,w,d,h,variants,build})` — a species. `climate` is one of
  `hypertropic`, `tropic`, `temperate`, `cold`; `aridity` one of `arid`, `semiarid`, `subhumid`,
  `humid`. A `plant-climate-tagged` invariant enforces both. Yuni's valley is temperate/semiarid.

All three share one build frame (`assetFrame`): origin at the footprint centre on the ground or
floor, `+z` is the FRONT. Build an instance anywhere with `buildAsset`, `buildFurn` or
`buildPlant`. The library and the school already build their furniture from the registry through
`buildFurn`, so the catalogue and the building cannot drift apart; everything else in the city
still draws its own, which is the obvious next tidy-up.

Seed vocabularies: `src/62-plants.js` (9 species), `src/63-furniture.js` (14 pieces, planner-
owned — agents add their own in their own fragments), plus the Order's 9 pieces in `59-civic.js`
and the Ancients' 12 in `61-ancients.js`.

## The Grand Vault, third design

The first was a Hotel Attraction gate, the second a Sagrada Familia portico; both were scrapped.
The third is modernist and it is one continuous poured thing, in the Ancients' white metal rather
than concrete. THE THROAT is eight concentric squircle arches (exponent 3.4: upright jambs, a
level-ish head, a big fillet in every corner) telescoping from a 92 m opening back to the 16 m
door, consecutive arches lofted into one surface so each frame is a swell in a single skin, each
swell carried by a smooth tube bead. THE CROWN is Niemeyer's Cathedral of Brasilia: hyperboloid
ribs on an ellipse in plan, wide at the foot, pinched at the waist, flaring at the head, with blue
Ancient glass and the Order's electric light in the bays. THE PASSAGE: the two ribs that would
stand square on the processional axis are omitted and the foot ring stops either side of the gap,
so a 67 degree opening runs clean from the forecourt through the crown into the throat and on to
the door, with nothing crossing the axis at any height.

## The Grand Vault, second design (superseded)

The first design was a Hotel Attraction gate: five polychrome archivolts, trencadis beads,
gilded leaves, a mosaic tympanum. It was replaced wholesale. The second design is Sagrada
Familia: six colossal LEANING pillars, three a side, each on its own splayed foot, cut as a
star section that twists as it rises and branches at the head into two limbs; a ruled web
between the limbs; a slanted stepped canopy carried on the limb heads and tied back into the
screen; four tilted buttresses on the flanks; the archivolt nest kept but rebuilt in one stone,
so the ornament is the STEP — each ring on a different plane with a different reveal — and the
outer curve carries stone prisms instead of tile scallops. Minimal colour throughout: warm
dressed stone, tarnished white Ancient metal, bare concrete. The only saturated thing on the
building is the Order's electric light.

## The highway spine

Each gate's out-of-town run starts at the outermost lattice node on its own spoke, and that
spoke can have gaps in it (a park, the market, the talus), which used to leave a highway hanging
off the end of a broken chain. `spine(g)` in `30-layout.js` now stitches gate → outNode → every
surviving spoke node into one unbroken radial chain classed as the highway before the run is
laid. A `highways-reach-their-gates` invariant walks highway/road edges only and proves each run
is continuous from its gate to the map edge.

## Verification

`./run.sh NAME target.html --assert` runs Playwright headless under SwiftShader and checks the
error panel, the geometric invariants and the budgets. All four targets are currently clean:
world 60 draw calls / 1.99 M tris, sheet 107 / 1.55 M, furniture 52 / 86 k, plants 14 / 56 k,
against a budget of 170 draw calls and 4.2 M triangles.

## The inner-city plot schedule and placement pass

The Ancients were here first, so their works stand inside the wall as SUPERBLOCKS and Yuni's
radial grid is laid around them: the ring streets run on, the spokes stop at a superblock and
resume on the far side.

Ring streets are now 72 / 128 / 184 / 236 / 288 / 312 (ring 236 exists only in the northern
half, and 312 is a service lane 8 m inside the wall). The band **184 to 288 is the Ancient
belt**, 104 m deep — the depth of the academic quadrangle, and exactly three comb-wall slabs
with 13 m courts between them. Inside the belt the spoke granularity drops from 7.5 to 15
degrees, because a 7.5 degree bay out there is 31 m and nothing the Ancients built fits in 31 m.

`PLOTS` in `30-layout.js` is the schedule: each plot is an arc `{r0,r1,a0,a1}`, packed round the
circle by `PACK`, which steps over the gate boulevards and the processional way rather than
straddling them. `68-place.js` turns each arc into world coordinates and builds it, with three
arrangements: a single building; a **radial bank** (the three comb-wall slabs stacked across the
belt's depth); and a **facing pair** (two comb blocks turned broadside, fronting each other
across a 12 m lane). It then fills every remaining ring band as two rows of Yuni's own fabric
packed shoulder to shoulder along the inner and outer frontages, each building oriented to the
best street within 55 m and rejected if it would clash with anything already standing.

Two invariants guard it: `plot-schedule-built` (every scheduled plot produced a building) and
`inner-city-placement-sane` (nothing overlaps, almost nothing sits on a street centre line).

## The alignment rule, and the outer districts

A radial grid has only four right answers for a building's yaw at any point: face the hub, face
the wall, or run along the ring either way. `gridRy()` picks whichever agrees best with the street
the door should look at, then tries the next best if that yaw clashes, and refuses the building
only when all four clash. Clearance is a separating-axis test on the real oriented rectangles, not
a circle test — a circle test is rotation-blind, which is exactly wrong once things are aligned.
Building it exposed two real bugs: the plot packer computed arc as `w/r` when a rectangle on a
curve needs `2*atan((w/2)/rIn)`, and two packing runs sharing a radial band could not see each
other. `PACK` now steps over every plot already scheduled in an overlapping band, and refuses a
plot it cannot fit before `endDeg` rather than wrapping round the circle.

The outer districts are packed the same way, ring by ring, with the district's own wealth choosing
the mix of trades and `maskFree()` keeping houses off the streets, out of the parks and the market
circle and the caravanserai yard, and off the farm belt. Clock 6 round through 9 to 12 is built;
12 round to 6 is not.

## Deep buildings and the parks

Two holes in the placement logic kept nine of the kit's buildings out of the city entirely, and the
only way to find them was to compare PLACED against ASSETS. Both packers choose a building by
`f.d <= allow`, where allow is half the ring band's usable depth: 18 to 20 m inside the wall, 17
outside. The family compound is 26 m deep, the painted terrace apartments 22, the Hall of Records 40.
None of the three could ever be chosen anywhere, and because the failure was a filter and not an
error, nothing said so. `packDeep()` sweeps every band 34 m or wider before the two rows run,
placing the deep works on the band's mid-radius with a generous gap after each — they are landmarks,
not fabric — and the rows then pack around whatever stands, because the clearance test sees them
like anything else.

The six Parc Guell pieces failed differently: they had no path at all. Their family is `park`,
`famWeights()` has no `park` key, and park ground is mask code 3, which every fabric pass refuses on
sight. They get their own pass now (section 3b), the only one in the fragment that deliberately
ignores the mask, since inside a park polygon the reserved ground is the point. Clearance is still
real — the oriented-box test, the tree sites from fragment 60, and the street test. Each park takes
its signature piece in the middle (Serpent Park the bench terrace, the Park of the Hundred Columns
the hypostyle hall, the Lizard Stair Garden its stair), with two gate lodges at the edge, a fountain
roundel to one side and, in the two larger parks, the viaduct along a flank. The viaduct clears
trees on its narrow side only, because it is an arcade on legs and the planting runs underneath it;
at its full 30 m span it could never have stood in a planted park. Fragment 60 was changed to match:
the middle 46 percent of a park's radius is left unplanted, because flora runs eight fragments before
placement and a tree dropped there can never be taken out again — it simply refuses the building.

## The box tests: nothing in the road, nothing through a tree

Both of the fill's clearance questions used to be asked of a POINT, and a point cannot see what
was actually wrong with the town. The packer asked `onStreet(x, z, a small margin)` about a
building's centre and then set down a thirty-metre box whose corners lay out in the carriageway:
399 buildings had a box over a street edge, forty of them by more than two and a half metres, and
a market hall stood six metres into its own boulevard. The tree test had the same blindness, and
was only asked by the outer district pass at all, so avenue cypresses grew up inside the merchant
palaces on the processional way and inside the Library.

The real rectangle is now asked both questions — `boxStreetPen()` returns how far the box reaches
past the nearest carriageway edge, `treeClearBox()` pulls each nearby trunk into the box's own
frame and clamps it — and both are asked INSIDE `gridRy()`, alongside the neighbour test, so the
nudge table gets a chance to find the metre that fixes it rather than the building being thrown
away after the fact. Half a metre of overlap is allowed, because the painted street edge is soft
and a doorstep wants to meet it. The count fell from 399 to four, and those four are scheduled
landmarks hemmed into their bands — the Library, the Archive, the Chapter house and one Ancient
comb slab, each about a metre over, which reads as a doorstep on the ring. Trees inside buildings
fell from 31 to none.

Two things follow from that. Both tests are backed by a uniform grid built once — 64 m buckets for
the street edges, 24 m for the ten thousand tree sites — because walking all 1,309 edges and every
tree per candidate is what made the fill minutes of wall clock. And the scheduled plots may now
slide a few metres in or out along their own radius (`radialSetback`) to get out of the ring street,
keeping their arc and their facing, because a schedule that cannot move at all puts a wall across a
road. The market halls hunt round the circle the same way instead of sitting on fixed cross axes —
two of them had been refused outright by the box test and had simply vanished from the market.

The slums got one concession: where a district's own chaos is above 0.3, a house that no grid axis
will fit may take a FREE yaw, facing the nearest street give or take a few degrees. Holding mud
compounds in the Thatch to the same four yaws as the Emir's palace was never right. Those buildings
are tagged `free` so the alignment invariant counts them apart rather than being quietly loosened.

## The districts, the farms and the summit

The outer pass now walks the whole ring (clock 6 round through 9 to 12 and on through 3 back to
6). `districtAt()` carries the gradient — prosperous 6:30-10, market 10-12, then progressively
poorer to the Thatch at 6 — and supplies both the mix of trades and a `crowd` factor, so the
poorer the ground the tighter the houses stand. The caravanserai sits on its reserved yard and the
great market circle outside the Caravan Gate has four halls on its cross axes and four concentric
rings of stalls and tents. One farm plot in five takes a farmstead: a compound with its granary,
well and stock pen set behind it. The summit carries the starport ruin plus three ruined dishes
and a ruined radar mast at hand-picked coordinates.

Budget was raised to 190 draw calls / 7.0 M triangles / 460 k instances to take all of it; the
world sits at 116 / 4.53 M / 110 k.

## Two lighting systems

The Order's electric runs from the Vault and lights the INNER CITY inside the wall and the MARKET
DISTRICT with its great circle and caravanserai — the two places the Order and the Emir between
them can justify the cable. The fitting is the Vault forecourt's own arc standard: a slim white
Ancient-metal pole, a bowl, a bare glowing globe. Everywhere else burns oil on a timber post with
a brass cap. The wall-walk is the seam: electric on the town side of the parapet, oil on the field
side, which you can see from outside at night. Windows inside the served area are flipped to the
cool tint in place rather than threaded through every asset's build. At night the city therefore
reads as a cool-white core and a cool-white market with a warm ring between and around them,
which is the social map.

## The eastern transition

The family mix on the poor side is not fixed: it ramps with the district's own wealth, so the
quarter meeting the market at 12 o'clock is mostly middle-class houses and mud and thatch only
takes over as the clock comes round toward 6. Without that ramp the market ended and the slums
began on a single street. The lattice reaches further in toward the butte now (the talus block
was cut from 545 m to 430 m and the in-between lane rings survive at lower chaos), and the
district pass refuses any house with no street within 55 m, so nothing stands stranded on open
ground the way the far side of the Thatch did.

## The life layer

`84-life.js` — 84, not 90, because a population must register with PATHVIZ *before* `87-pathviz.js` builds its
dropdown; at 90 the layers existed and never appeared. Four parts. THE PLACES: every building the placement pass
set down is classified into a category by its family and its plot name, and carries the door points `buildAsset`
collected, so nobody walks to a coordinate — they walk to a door on a building that is actually standing there.
THE ROUTE: A* over NAV, with the underground and the wall-walk barred unless the traveller's business takes them
there (academics and monks may go down into the Vault; nobody else may), requests queued and five served a frame,
then a final `leg` off the street to the nearest door within 70 m. THE DAY: each kind has a schedule keyed on the
hour. THE BODIES: four instanced meshes — bodies, heads, carts, draught animals — rewritten each frame for whoever
is within 520 m of the camera; nothing is in the scene graph per person.

Kinds: ramblers (market, civic, park, shop, home), factory workers at the Foundry 6-18, academics who live in the
good houses and work at the Reliquary, the Vault, the Geomancers' Guild, the hospital or the Library of Yuni,
saffron-robed monks who keep to the Order's buildings, the Vault and the Library and go home to the corn-cob
apartments at night, and market merchants. Carts and ox-trains run between the market, the warehouses, the shops,
the Foundry, the fuel station, the Vault depot and the caravanserai. Agents are seeded at plausible places rather
than all on their doorsteps, so the city is alive from the first frame instead of walking itself to work for ten
minutes.

Two bugs in one line were worth the whole round. `any()` is a FALLBACK CHAIN, not a union, and it was being used
as a union: because `lab` was non-empty, every academic in the city walked to the Reliquary and to nowhere else.
`pool()` takes the real union. And the last-leg check sat below the no-path check in `step()`, so an agent crossing
the final few metres to a doorstep looked path-less and was sent to ask for a new destination instead of arriving.
Academics went 0 → 15 corridors, merchants 46 → 72, carts 20 → 57.

## Reading the routes

Each population accumulates the graph edges it has actually travelled, and that accumulated set — not the handful
of paths in flight at any instant — is what the devtool draws. Six layers: `Life: pedestrians` (cyan),
`market merchants` (yellow), `factory workers` (red), `academics` (violet), `monks of the Order` (saffron) and
`carts and caravans` (green), each selectable on its own beside the four street-network layers.

They are drawn as RIBBONS rather than lines. WebGL ignores `LineBasicMaterial.linewidth` on every desktop driver,
so a corridor was a one-pixel line and simply could not be read against a city this dense from any sane viewing
height. Each corridor is now a flat quad about 2.8 m wide laid on the ground, overrun at both ends by its own half
width so dogleg corners close up, with depth testing off — the layers read as an overlay map painted over the town.
Open the panel, pick a population, and the goods network or the Order's circuit stands out on its own.

Caravans are the one thing still not working: nine are spawned and drawn as four-beast carts with a caravanserai
bias, but they register no corridors at all, on the same code path the carts run happily. Left as decoration.
