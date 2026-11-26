# The Pile: a rough floor plan

The owner's brief (2026-10-27), for the Rift's ruined arcology in place of the Arccube: **a pile of blocks stacked on
each other with generous spaces in between, gardens on the upper surfaces, about 150 000 people at its height,
tapering to the top, so that with a few choice lift shafts and stairways destroyed or blocked about 20% of the mass is
cut off from the ground with plenty of garden and farming space.** The model is `../8at0-arcpile-plan.js` (the plan,
[G data]) and `../8at1-arcpile-draw.js`; this folder is its plan, drawn from the same records.

| File | What |
|---|---|
| `sheets/tiers.png` | the ten tiers and the capstone in plan: blocks (base tan, crown green), cores, stairs; each tier's floor, people, gardens |
| `sheets/section.png` | across the pile on its east-west axis: the tiers, the neck, the great cores, both grand stairs |
| `sheets/cut.png` | the cut: the pile as built and with the six links gone; the island in green |
| `AREAS.md` | tier by tier: blocks, floor, people, roof gardens |
| `arcpile_plan.py` | the generator (runs the plan in node, draws with PIL) |

## The form

| | |
|---|---|
| blocks | 99 slabs, 28 m deep and 10 storeys (36.6 m) tall, 150-290 m long, lit from both long sides |
| tiers | 10, alternating direction, each block carried crosswise at two or more rows of the tier below |
| capstone | a terraced ziggurat on tier 10's roofs (owner, 2026-10-27, after a stepped building with glass bands under heavy sloping fascias): five terraces of three storeys, 240 m square stepping in to 100 m, each a band of glass set back under a fascia that slopes up to a planted deck; a glass pavilion on the summit. Four atria cut down through it and out of its underside over the gaps between the blocks below, a quarter of its footprint (owner, 2026-10-27): homes on their walls, the sky let down to the courts under it. 33.7 ha of floor, 4 900 people |
| taper | 940 m square at the ground narrowing upward; 435 m to the pavilion's roof |
| space | rows 112 m apart, so the gaps between blocks are 44-84 m: a quarter of each tier is block |
| gardens | every roof nothing covers, and the capstone's decks: 85 ha in all, 19 ha on the crown |
| cores | 32 shafts, each built only where it joins things: it stands on the ground or inside a block, ends at the roof of the highest block it passes through, and joins two or more of the ground and the blocks. 4 great cores (ground to the crown's roofs), 18 base cores (from the ground at a crossing of tiers 1 and 2, up to 6 tiers), 10 crown cores (at crossings of crown blocks, from the floor of the lowest to the roof of the highest) |
| stairs | two grand stairs up slots in the east and west faces, to the crown's gate block, a storey over its sealed plinth |

## The neck and the cut

The base is tiers 1-6, the crown tiers 7-10 and the capstone. Tier 7's lowest storey is a sealed plinth (tanks and structure), so no
stair passes from a base block into a crown block where they cross; no base core rises past the neck and no crown core goes below it. The only ways between the ground and the crown are **the four great cores and the two grand stairs**. The node
test (`../test-arcpile.js`) checks the circulation graph: as built every block reaches the ground; cut the six links
and exactly the crown, **21.4% of the floor**, is an island; cut any three and it is still reachable.

## The population

The same rule as the Lozenge's low case (`targets/lozenge/plan/BLUEPRINT.md`): a home needs a window, and here every
storey has two, so all the floor counts: 65% of it dwellings, 45 m2 gross a person.

| | floor | people | roof gardens |
|---|---|---|---|
| the Pile | 1 064 ha | **153 700** | 85 ha |
| the crown (tiers 7-10 and the capstone) | 228 ha | **32 900** | 19 ha |
| of it the capstone | 34 ha | 4 900 | 4 ha |
| the base (tiers 1-6) | 836 ha | 120 800 | 66 ha |

**The island can feed far fewer than it can house.** 19 ha of roof fields is 5.8 m2 for each of the crown's 32 900 at
the city's height. Worked hard (beds, fish tanks, the lamp-lit farms of the Lozenge's deep floors) a hectare feeds
perhaps 100-200 people, so the crown cut off is a refuge for **about 2 000-4 000**, in a fabric built for ten times
that: most of the crown's rooms empty, stores, workshops. The base below has 66 ha of roofs gone back to scrub and trees.

## The ruin (`ARCPILE.ruin`, deltas by id)

Two great cores fell at the neck and two were walled up by the crown's people; the west grand stair's last flights are
down, a parapet of salvage across its gate; a third of the base cores lost their tops. The owner's ruin (2026-10-27):

- **One corner wholly down**, the other three quarters intact. The corner is cut on the diagonal, x + z > 275 m (a
  quarter of the footprint), so the capstone stands clear of it. Every block mostly inside it is gone (15), every
  block the line crosses is torn off at it (23: a broken face, floor slabs sticking out of the break), anything left
  with nothing under it fell too, and the east grand stair and the cores in the corner went with it. What fell lies
  in the corner as torn slabs of stacked floors and rubble.
- **Two crash-throughs** in the base: a block whose supports failed at one end, hinged on the other and dropped a
  tier, its far end through the roof and floors of the block it fell onto (a crater with hanging slabs and rubble).
- **Real farms** on the crown's roofs and the capstone's decks: plots of ridged crops, orchards, polytunnels, rice
  paddies, fallow ground, sheds and water tanks, and people working them (832 plots).
- **Rope bridges** between neighbouring crown roofs (6), plank decks sagging between hand ropes.
- **The Rift's flora** overgrows the base's roofs and the bare surfaces when the Pile is placed in the settlement, so
  the model leaves them as ground: `AP_SITE[1].roofs` hands every standing roof to the placer, `overgrow` or `farmed`. The Tungangs and the Loj Nahn are the later task; the ceiling for
the crown's people is the refuge figure above.

## The study

- **The Interlace** (Singapore): six-storey blocks stacked in a hexagonal weave, the roofs of the lower ones the
  gardens of the upper ones. Here the weave is orthogonal and the blocks are longer and deeper.
- **Atlantis The Royal** (Dubai): blocks shifted and cantilevered off each other, a bridge of blocks between towers.
  The Pile's row ends cantilever up to 50 m past the tier under them.
- **Mesoamerican and Mesopotamian stepped temples**: grand outside stairs up the faces; here they are the only open
  way to the crown. The ziggurat is also the capstone's figure.
- **The owner's stepped building** (glass bands set back under heavy sloping fascias, grass on the decks): the
  capstone's terraces.
- **The tower-and-block drawings** in the owner's references: free-standing shafts carrying the blocks; the cores here
  stand in the courts and pass through the blocks they serve.
