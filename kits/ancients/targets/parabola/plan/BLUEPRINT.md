# Parabola: the blueprint

The owner's choice (2026-11-11), design A of `openworld/ANCIENT-NETWORK.md` section 8.11 (branch `claude/ancient-network-9cc3e7`):
**a terraced paraboloid dish, a city that was a solar furnace**, on the Bowl's south-west rim near the Godsgate (scale model 5.1
px 970,1186; 1 716 m, 15 degC mean, 314 mm of rain). The model is `../8av0-parabola-plan.js` (the plan, [G data]) and
`../8av1-parabola-draw.js`; this folder is its blueprint, drawn from the same records, so a sheet cannot drift from the page.
Facts marked *proposed* wait on the owner (`../NOTES.md`, "Open questions").

| File | What |
|---|---|
| `sheets/plan.png` | the dish in plan: the terraces' lips (farmed, mirror-clad), the basin, the rim and shell, the piers with their heights, the mast and the receiver, the hall and the viaduct |
| `sheets/section.png` | north-south through the axis: the true paraboloid and the stepped face inside it, the shell, the south pier, the mast, the receiver at the focus, the basin, the hall, the viaduct; light down the axis reflected to the focus |
| `sheets/ruin.png` | the ruin in plan: the windward quarter down, the slumped terraces and their fan, the fallen mirrors and the scree, the sand, the orchard, the rain lake, the post and the caravanserai |
| `AREAS.md` | terrace by terrace: level, front, tread, slope, use, floor, people |
| `parabola_plan.py` | the generator (runs the plan in node, draws with PIL): `python3 parabola_plan.py` |

## The form

| | |
|---|---|
| the dish | a paraboloid 1 800 m across the rim and 320 m deep (focal length 633 m). Its axis leans 30 degrees north, to the noon sun (Krator's settlements lie near 40 S), so it faces out over the Bowl with its back to the rim's hill |
| what the tilt does | a level plane cuts a tilted paraboloid in a circle about one point, so the dish's lowest point is 731 m from the vertex toward the north lip, only 10 m under the lip; the back rim stands 910 m over it (980 m over the ground) and the focus 801 m up |
| the terraces | 41 level terraces, each a 6-storey riser (21.9 m) of homes behind a glazed front and a tread on its roof. Each follows a level contour: full rings at the bottom would be, but already the first meets the north rim, so all 41 are arcs opening north, a horseshoe amphitheatre facing the Bowl. The lip of every tread is on the true paraboloid; the stepped face lies inside it. Treads are 107 m wide at the bottom and 10 m at the top of the back |
| the basin | the level plaza at the lowest point, out to the first riser, closed on the north by the rim's parapet (10 m) |
| the mirrors | 13 933 panels: a bank on every lip, each panel tangent to the paraboloid where it stands, so light coming down the axis reflects to the focus (the node test checks every panel: the worst passes 0.23 m from the focus of a 38 m receiver). Treads steeper than 58 degrees (the top of the back, 8 terraces) carry two more rows on posts up to the true surface and are not farmed |
| the shell | white seamed panels 55 m behind the inner face, 24 bays by 12 rings, on 24 ribs from a boss under the vertex to the rim; the ribs swell in a slow wave and where a pier carries them, with a bronze band at each landing |
| the piers | three Cyclopean piers, courses of great stones each turned and set in a little, each head branching in four arms up to its rib: the south pier under the back, 545 m, 130 m across at the foot; the north-east and north-west piers, 191 m. The dish's mass stands inside their triangle |
| the mast and the receiver | three 713 m legs from the treads (one from the second terrace by the basin, two from the eighteenth up the back) to a 76 m sphere of blue glass in a bronze frame at the focus, on a bronze seat. Each leg carried a stair, a landing every 24 m |
| the terminus hall | a vault 320 m long, 64 m wide and 30 m high under the basin, its floor 34 m over the ground; it opens through the north lip onto a viaduct, 420 m of it drawn, carrying two tracks of the Rift line (station 13) and the Godsgate way from the Bowl |

## The population

The homes are the lit depth behind each glazed front (16 m: one side only, so no deeper; the whole tread where it is narrower),
6 storeys, 80% of it homes at 45 m2 gross a person: **666 ha of homes' floor and 118 500 people**, against the design's 120 000.
The deep fabric under the terraces (between the stepped face and the shell) is services, stores, the hall and the structure: it is
not counted and not drawn. **187 ha of farmed treads** feed a part of them: at the Pile's yields, perhaps a fifth.

## The ruin

The plan with `PARABOLA.ruin`'s deltas, every one by a hash of a record's id:

- **84% of the mirrors fallen** (11 764): most lie broken on the tread below their lip; those near the rim's ends and off the
  slumped terraces went over into the scree outside and the fan;
- **the windward quarter** (the west, *proposed*): 69 of the shell's 288 panels down (the boss's ring kept), its ribs broken a
  quarter to half way up, and the upper terraces of that quarter (101 segments, above the nineteenth terrace) slumped into a fan of
  shell plates, slabs and glass below; behind the standing terraces the dark broken fabric shows;
- **the receiver** cracked (a gash and a third of its panes gone) and leaning 14 degrees in its seat, 7 m down; **the stairs gone**
  from the legs but for their lowest flights, one tie fallen;
- **the lower decks drifted** with sand: the ends of terraces 1-5 at the north lip, the hall's north half, the viaduct by the portal;
- **the inner terraces wild orchard**: 4 332 trees on the standing farmed treads, a fifth of them left as meadow;
- **the rain lake**: the basin flooded 6 m deep, held by the 10 m north parapet. 314 mm on the dish's 250 ha is about 0.8 million m3 a
  year; the lake holds about as much and loses perhaps a fifth of that to the dry wind, so it overflows in wet years (*proposed*:
  its level is the old drain into the hall, cracked at 6 m);
- *proposed*: **the Izani customs post** at the portal (a barrier and a customs house on the platform) and **the caravanserai** in the
  hall's south half (fourteen stalls round a court, beasts, traders), where the Izani road from Mantis ends.
