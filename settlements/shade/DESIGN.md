# Shade: design

From Gemini's design page ("Locus: Shade", Sept 2026) and its four terrain drafts,
reconciled with the repo's rules. Where this departs from Gemini, the reason is given.

## The place

- **Faction**: Eastern Nomads. **Biome**: the eastern high desert (`biomes/sedesert`:
  red desert, Socotran flora, mesas and hoodoos). **Population**: ~1,000 residents
  plus up to 60 visiting caravaneers.
- **The basin**: a sunken floor at 10 m, 214 × 160 m, in a plateau at 59-66 m.
  Wile E. Coyote country: the walls are 49-56 m of banded red sandstone.
- **The falls**: the upper stream crosses the plateau from the west and drops 46 m
  over a sheer lip into a turquoise travertine plunge pool, 14 m across and 3.8 m deep.
- **The lower stream** runs from the pool east across the floor and out through the
  canyon mouth into a slot canyon 30-48 m wide that runs on east past the edge of the map.
- **The switchback**: six legs and five hairpins up the north slope, 430 m at an 11.8%
  grade, from the floor to the plateau and the gatehouse. It is the only way up.

Departures from the drafts:
- The Cappadocian fairy chimneys were dropped (they read as cartoon cones in this basin): the
  cliff dwellings take their share, and the basin's own walls were made sheer for them.
- The switchback is on the **north** slope, not the east wall: the east side is the
  canyon mouth, and a 15% trail rising 50 m needs about 330 m of length and a slope
  ~64 m deep to fold into. The east wall has neither.
- The sheer carved face is the **south** wall (x −60..0), which faces north into the
  sun (the Krator sky's sun is fixed WNW). Gemini had the dwellings on the north wall,
  which would leave the carved facades in permanent shadow.
- The plateau never dips below 59 m, and every water surface is set from its own bed
  (the drafts' streams were buried or perched on dykes wherever the noise moved).

## The architecture (the next pass)

A hybrid, from the design page:

| Family | Where | Share |
|---|---|---|
| **Petra-style carved facades**: classical columns and deep rooms cut into the sheer red sandstone | the south face (dwellings), the west lip beside the falls (the Shrine of the Deep Aquifer) | ~25% |
| **Cliff dwellings** (Mesa Verde): rubble-stone and plaster rooms built against the sheer walls, stepping down to the floor, round and square towers | all round the rim (west, north, south and east walls); towers for the gatehouse and the canyon watch | ~25% |
| **Pueblo blocks**: stepped adobe, flat roofs, projecting viga beams, ladder access | the pueblo quarter and round the Khan | ~35% |
| **Haircloth tents** (Bedouin black tents) | the tent grounds | ~15% |

Points of interest:
- **The Shrine of the Deep Aquifer**: carved into the lip behind the pool, home of the priests.
- **The Khan** (caravanserai): an open trading court on the floor, stepped adobe quarters
  round it, camel lines.
- **The switchback gatehouse**: a hollowed spire at the head of the trail.

## The life layer

The design page's behaviour loops, rewritten as data (`84-host-life.js`): jobs ask for
activities by the hour, places offer them, and nothing is a coordinate.

- **Farmers** farm the irrigated terraces (dawn, afternoon), rest at midday, socialise in the evening.
- **Shopkeepers** trade at the market and the Khan; **artisans** craft at home.
- **The high priest and acolytes** (the Wardens of the Deep Aquifer) worship at the shrine at
  dawn and dusk; the priest trades at noon.
- **Water carriers** fetch from the pool shore and the ford; **herders** take the flocks up to
  the plateau grazing; **guards** (day and night shifts) hold the canyon watch and the gatehouse.
- **The raider convoy** (Dune raiders, 12 riders on camels, every 3-6 days): enters by the
  canyon, waters at the ford, trades and rests at the Khan, leaves up the switchback onto
  the plateau. Every leg is resolved to a place by activity and routed by A* on the ground.

## Not carried over

The design page's **Godot manifest** (`res://assets/...glb`): nothing in Krator uses Godot or
model files; every asset is generated in code. Its `[cite: 2]` references were leftovers.
