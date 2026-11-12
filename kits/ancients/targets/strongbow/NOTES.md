# Strongbow — notes

Strongbow is the Ancients' **cliff arcology**: a city hung down a cliff face. Its site is **the scarp between the Oidong Valley
and Xanadu**, on the cliff the valley's cataract falls from, and the face looks west over Xanadu.

- **Site:** scale model 5.1 px **1001,1596**, 3 km north of the cataract by which the valley's river leaves (the owner, 2026-11-11:
  "strongbow needs to be right on the xanadu-oidong border - the same cliff the cataract is on - so that it offers a real
  advantage to anyone using its elevator").
  - Its top is on the lip, at about 1,400 m, where the valley road from Longsong ends.
  - The scarp falls about 3,100 m west to the Xanadu floor over some 20 km, steepest at px 994-996.
  - The page's 900 m face and its bay stand for that steepest stretch. Below it the scarp goes on falling, and the town at the foot
    (`settlements/strongbow/PLAN.md`) stands where the face meets it.
- **When it moved:** all on 2026-11-11.
  - 1026,1594, then the valley's east end (1298,1647), under the High Rift's escarpment. This target was designed for that place.
  - Then the valley's west end (1013,1585): "strongbow should be at the other end of the valley, by qiblai".
  - Then the scarp (1001,1596).
  - On `claude/cool-tereshkova-d594e8`: the scale model is `aaed590fe`, `openworld/SITES.json` (`sfgtxw10kr`) is `7cff97d0c`, and
    the region is `317dba7b4`. Read the site's terrain there.
- **The network:** it was the Rift line's station 11, the end of the line, reached from the uplands to the south. **The line is
  abandoned** (the owner, 2026-11-11): no upkeep, the way broken near Strongbow, and the terminus hall is a ruin the town builds over
  (`openworld/ANCIENT-NETWORK.md` 8.16, `a65355184` on the network branch).
- **The roads and the elevator:** the valley road from Longsong ends at the top. Xanadu's girder lifts carry the way down to the foot
  (`settlements/strongbow/PLAN.md` section 5).
- **Facing:** the page's frame faces south (+z), with Krator's noon sun in the north behind the face. The site faces west, so the
  open world turns the frame. The heliostats are aimed from the frame's sun vector (`HELIO.sun`), which the placement must turn with
  it.
- **The references:** the owner's two pictures (2026-11-11), with two more for inspiration:
  1. a tall, slender wedge tower set into a canyon wall and held by fans of cable stays, with a mid-height deck and a spire with a
     cable-stayed mast;
  2. segmented towers clinging down a red-rock face, with rotor-armed outriggers, landing pads and glazed galleries cut into the rock;
  3. (inspiration) concrete towers with saucer decks, bridges between them and glazed pavilions;
  4. (inspiration) the white Xanadu house on the rocks, which went to the scrap Xanadu set.
- **Marking:** facts not given by the owner are marked *proposed*.

## The owner's answers (2026-11-11)

1. **Scale**: an 800 m hull for about 40,000 people as built. A second, smaller hull hangs lower down, and vertebral towers rise beside them.
2. **Ruin**: still standing, on half its stays.
   - One side's fans of stays have snapped, and the hull leans a few degrees off the face.
   - The lower hull has fallen and lies broken in the scree.
   - Most of the glazing is gone and the mast is bent.
   - Some of the vertebral towers have broken off.
3. **Who lives in it now**: the Sultanate below and the Order above.
   - Below: a Xanadui town, a caravan terminus and a garrison, in the lowest decks and at the foot.
   - Above: the Order of History Monks keeps a sealed house in the upper hull and at the lip.
4. **The cliff**: a showcase cliff with a cut bay.
   - The kit page draws its own escarpment and plateau as a stand-in.
   - The Ancients' works in the rock belong to the kit: the bay quarried into the face that the hull sits in, the galleries cut into
     the face, and the anchor sockets.
   - The plan takes the cliff's height and the floor's height as options, so the open world can pass its own scarp.
5. **The composition** (later the same day, on the first build's shots): "my read was the arcology had a sort of sail-shaped
   prominence up top, and comes down in one intermittently sloping column of drums and terraces". So the two Spines beside the bay
   are gone. The hull is now **the sail**, on the upper half of the face. **One Spine** of drums and terraces comes down from the sail's
   keel to the foot, plumb in places and stepping out from the rock in others.
6. **The population**: about 29,300 as built, kept ("Keep ~29,000"), rather than growing the sail back to 40,000.
7. **The tower** (on the first reference picture): "instead of a sail, give it a tower and landing pad like so". The sail is now a
   slender wedge tower standing free in the bay, from the crown down to the Nock. A landing pad sits on the Nock's deck before the
   tower's prow. The tower is narrower than the sail, which brings the count to about 25,800.
8. **Centred, and standing over the lip** ("that sail seems like it's off center? i want that wedge to stick up past the cliff for at
   least 15 stories"). The bay was cut for the sail and left the tower adrift in it, so it is narrowed to 190 m, closing on the tower.
   The tower now rises 60 m (16.4 storeys) above the lip, and the ramp climbs to its crown. That gives about 26,700 people.
9. **The lobby** ("the bottom portion should be more elaborate and have an actual lobby"). The terminus box became **the foot**: a
   glazed lobby round the Spine's foot, the terminus hall's vault, two wings, a back block and a plaza. In the ruin, the fallen lower
   hull crushed the hall's west half. What Xanadu made of the foot today is `settlements/strongbow/PLAN.md`.

## The plan

The plan's records are the model (`8aw0-strongbow-plan.js`, [G data]). The drawing (`8aw1-strongbow-parts.js`, `8aw2-strongbow-draw.js`) decides nothing.

**The frame.** Coordinates are local:
- `x` runs east along the face, `y` is up, and `z` points south, out of the rock.
- The valley floor is at `y` 0, and the face line is at `z` 0.

| | |
|---|---|
| The cliff | A face 900 m high (`LIP`), battered back a little with height, banded with strata. A scree apron runs 140 m out at its foot. Above it is the plateau. *Showcase only*: the open world's scarp takes its place |
| The bay | A notch the Ancients quarried into the face, 190 m wide (closing on the tower) and 90 m deep, from the lip to the floor. The tower stands in it and the Spine comes down it. The face beside it carries the stays' sockets |
| **The tower** (the Bow) | The main hull, a slender wedge in plan, after the owner's first reference. It stands free in the bay, its flat back 40 m off the back wall. Its two flanks, a little convex, meet in a sharp prow pointing south. It rises 60 m (16.4 storeys) above the lip and runs down through the Nock's deck to 498 m: from its crown at 960 m, 462 m and 126 storeys of 25.6/7 m. At the crown it is 110 m wide and 170 m deep, tapering to 82 m and 150 m at the Nock, so the prow runs nearly plumb. A glazed band and a shallow glazed dish close its foot over the Spine's head. Glazed storeys on the flanks, a white fin up the prow, and verdigris-teal fins that curl out at the crown and at the Nock. *Proposed*: the name is the hull and its stays, a bow and its strings |
| The crown | The deck at the lip: the hull's top cantilevered 30 m past the prow, with a glazed pad (a pool) and a pavilion. From the crown's back rises **the mast**, a raked blade 170 m tall, whose fan of stays carries **the arc ramp** that loops from the plateau out over the bay onto the crown |
| **The Nock** | The deck at mid-height (520 m), where the arrow is nocked. It spans the bay and runs 120 m into the rock on each side; its front is a shallow arc out to 96 m past the tower's prow. **The landing pad** (the owner's reference) is a glazed disc 60 m across on the deck, before the prow, in a white rim with a ring and a cross of light strips. Two glazed pads sit on the wings, and five storeys of decks are under it |
| The stays | **The string**: a fan on each side from the tower's upper flanks down to the Nock's wing tips. **The anchors**: three fans on each side, at 840, 740 and 620 m, from the sail's flank to sockets in the face beside the bay, all above the Nock. **The mast's**: a one-sided fan carrying the arc ramp, and three backstays to the plateau |
| The lower hull | *Proposed name*: the Quiver. A smaller wedge hung on the face just west of the bay, under the Nock's west wing, 150 to 400 m up and 100 m wide, with its own fan of stays to the rock above it |
| **The Spine** | One column of glazed drums (36 m in radius, about 26 m tall) on 6 m necks, from under the Nock's deck (497 m) to the terminus roof at the foot (36 m). It comes down in seven runs: plumb runs alternate with runs that step out from the rock, each drum set out from the one above, so its foot stands 130 m further out than its head. The upper runs are in the bay, held to its walls by struts; the lower ones stand before it. **A terrace at every turn** (six), wider than the drums (60 to 70 m), each a dish with a glazed pavilion ring and a garden round it. **Two rotor outriggers** on the second and fourth terraces: an 80 m arm with a 52 m three-bladed rotor, *proposed* as wind turbines on the escarpment's down-slope wind. The lifts from the terminus to the sail run inside it |
| The galleries | Curved glazed fronts on the face beside the Spine, below the Nock: three rows a side, each five storeys high and 150 m long (east of the bay, and west beyond the lower hull) |
| The pads | A circular landing pad on the plateau at the lip, east of the crown, with an Ancient craft standing on it. A second pad cantilevered from the Spine's fifth terrace |
| The rim gallery | A long bar on the plateau along the lip west of the bay: 600 m long, 36 m wide and 28 m tall. Its roof carries the way to the arc ramp |
| The heliostats | The face looks south, and Krator's noon sun stands in the north (the settlements lie near 40 S), so the face is in shade all day. Banks of mirrors on posts along the lip either side of the crown each turn to throw the sun down onto the hull. Each mirror's normal bisects the direction to the sun and the direction to the hull's middle (a node test) |
| **The foot** | The owner (2026-11-11): "the bottom portion should be more elaborate and have an actual lobby". The podium where the Spine lands, in and before the bay's mouth: **the lobby**, a glazed rotunda 120 m across and 36 m tall round the Spine's foot (the Spine's first drum stands on its roof), with a white core holding the Spine's lifts, a great stair winding two and a half turns round the core, three galleries on its wall and the cornice; **the terminus hall**, the Rift line's station 11, a barrel vault 268 m long and 70 m wide on the west, with three platforms, its west mouth where the line came in; **the west wing** (offices) and **the east wing** (works), six storeys each; **the back block** in the bay's mouth; **the plaza**, a raised forecourt off the lobby's south side, with two pools and steps, where the valley road ends |
| People | About 28,000 as built (`STRONGBOW.plan().stats`: the tower 12,700, the Spine 6,500, the Nock 2,500, the lower hull 2,500, the rim gallery 1,500, the foot 1,200, the galleries 900). They live in the tower's flanks (the lit band behind the glazing), the Spine's drums and terraces, the Nock's decks, the foot's wings, the galleries, the lower hull and the rim gallery. The owner kept about 29,000 for the sail (2026-11-11) |

**The ruin**, as deltas by id (`STRONGBOW.ruin`):
- **The east stays have snapped.** That is all three east anchor fans and the whole east string fan, half of the string and anchors. The string
  held the Nock's east wing, which fell, so none of it is left standing (2026-11-12; before, half the string stood and ended in the air).
  A few cables hang limp from the tower.
- **The arc ramp lands on the crown.** Its end runs 6 m onto the deck, 0.6 m under it, through a gate in the crown's parapet
  (2026-11-12; before, it stopped about 9 m short of the deck's west flank).
- **The tower leans off the face.** It has swung about its hinge at the crown's back, 3.5 degrees out and 2 degrees west, so its
  foot stands about 25 m out from where it was. The gap behind it opens toward the foot.
- **The Nock is broken.** Its east wing has fallen to the scree. The deck stays on the rock, and the tower leans through its cracked
  centre; the Order uses that centre as its balloon field.
- **The lower hull has fallen.** It lies in three broken pieces on the terminus hall's west half, which it crushed: the vault there is
  white shards on rubble.
- **The foot**: most of the lobby's glazing is gone (by a hash of each pane), its galleries are broken in places, and the
  great stair has lost some treads. The east wing's two top storeys are burned. The plaza's pools are dry.
- **Most of the glazing is gone**, by a hash of each panel's id. The skin is broken in places.
- **The mast is bent.** Its upper 40% is kinked over to the south-east.
- **The Spine is broken at its head.** As the tower leaned it tore off the Spine's top run and first terrace. Those drums lie on the
  floor east and west of the foot. The rest of the Spine stands, but its rotors are stripped to their hubs. The gap under the keel
  parts the town below from the Order's house above.
- **Most of the heliostat mirrors have fallen or turned askew.**
- **Who lives there now** (the owner, 2026-11-11):
  - *A Xanadui town at the foot*, on the scree and the floor before the bay. *Proposed*: a han (caravanserai) where the road ends,
    a garrison tower, and the terminus hall as the market. Its people live in the Spine's lower drums, where its lamps are lit.
  - *The Order's sealed house* in the tower's upper storeys and on the crown, with saffron banners and the arc ramp's gate shut. Its
    only way in is the arc ramp from the plateau.
  - The town's buildings are placeholder masses until the scrap Xanadu set (Xanadui buildings of reclaimed materials, in a session
    of its own) can furnish them.

## Core adoption

| Module | Taken | How, or why not |
|---|---|---|
| `core/rand` (`KRAND`) | yes | Every choice in the plan and the ruin is `KRAND.hash` of the plan's seed, a salt and a record's own indices, never a count of draws. The drawing's scree and trees keep the kit's `reseed()` stream, as every builder does |
| `core/tags` (`KTAGS`) | yes | Through `TAGS_TARGETS` in `build.py`. Registered before anything is drawn: the arcology as a building, with its tower, decks, landing pad, drums, terraces, lifts, galleries, pads, terminus and mast as parts; the stays and heliostats as fixtures; the town's houses as buildings |
| `core/terrain` | yes, its rubble | The ruin's debris is `KRUBBLE` heaps (`core/terrain/37c-core-rubble.js`, read in place through `TARGET_READS`, as the Ancient's Valley's ruined towers take it): lumpy mounds at the talus angle with knolls, loose blocks and a cover of broken chunks, one where each thing fell (`RU.heaps`). The heaps cover the terminus hall's crushed half, each fallen drum, the Nock's fallen east wing and the Spine's broken head. The page's ground is the flat showcase plain; the cliff and plateau are the target's own stand-in mesh, and the plan takes `o.lip` and `o.floor` so the open world passes its own scarp |
| `core/water` | no | The valley's water belongs to the open world. The kit page shows the valley floor only |
| `core/space`, `core/mask` | no | Nothing is placed by search or by a raster: every record's place is a function of the frame |
| `core/atmos` sky, `core/host` | no | The kit page's sky, camera, probe and inspector are the kit's, shared by every target. The builder moves the kit's sun to the north-east for this page, as it would stand on a morning here |
| `core/materials` | yes, the kit's | The kit's bound families: `MAT.white` for the shell, the Arccube's dwelling, deck, frame and shade maps, and the Hill's bedded rock map with vertex-coloured strata. **Owed**: the verdigris fins are an untextured standard material, and a layered-rock set for the strata (`core/materials/PROMPTS-NEEDED.md`) |
| `core/city`, `core/simulation` | no | A single complex. The town's life layer waits for the open world |

## Files

| File | What |
|---|---|
| `8aw0-strongbow-plan.js` | The plan, [G data]: the frame, the tower's slices, the landing pad, the crown, the mast and ramp, the Nock, the stays, the lower hull, the Spine, the galleries, the pads, the rim gallery, the heliostats, the terminus, the stats, the ruin's deltas and the town. KRAND only, with stable ids |
| `8aw1-strongbow-parts.js` | The drawing's parts, hashed and with no rng(): the cliff with its strata, the bay, the tower, the crown, the mast and ramp, the Nock, the stays |
| `8aw2-strongbow-draw.js` | The builder. core/tags come first (`KTAGS.strongbow`), then the parts, the Spine, the lower hull, the plateau, the foot, the town and the ruin's pieces |
| `8aw3-strongbow-foot.js` | The foot's drawing, hashed and with no rng(): the wings, the lobby (its transparent glazing, mullions, galleries, core, stair), the terminus hall, the plaza; the foot's ruin |
| `test-strongbow.js` | `node kits/ancients/targets/strongbow/test-strongbow.js` |
| `89z-rows.js`, `91z-views.js` | The two sites on one cliff (intact to the west, the ruin to the east) and the views |

## Weaknesses

- The cliff is a stand-in: one battered face with value-noise wobble and vertex-coloured strata on the Hill's bedded-rock map. It has no ledges, gullies or overhangs.
- The tower's flanks are lofted storey bands with the Arccube's dwelling map. They have no balconies or recessed decks, and the teal fins carry no art-nouveau curls beyond their outward swell at the crown and the Nock.
- The stays are straight boxes with no sag. The sockets are plain blocks.
- The town is placeholder boxes, waiting for the scrap Xanadu set.
- The lower hull's pieces lie whole on the hall's heap; the fallen drums are shards of wall in theirs. The heaps are KRUBBLE's general
  debris, not sorted by what fell (no glass, no twisted girders).

Build: `python3 tools/build.py kits/ancients --target strongbow`. Plan seed 1647 (KRAND); the builder's own stream is reseed(9040 + d).
