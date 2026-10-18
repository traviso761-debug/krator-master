# Pinnacle Rock: the plan (draft, 2026-10-18)

Pinnacle Rock is a Beast Rider town on a red sandstone mesa that rises out of the hyperjungle at the northern edge of
the Riders' country. Its lore is `LORE.md` §6.6 (the Beast Riders; the town's own entry). Girder (`settlements/girder`)
and Mav's Refuge (`settlements/mavs-refuge`) are the two Beast Rider builds it draws on: Girder for the roost decks,
the terrace farms and the flyers, Mav's for the platforms-and-bridges contract and the council forms.

Owner's brief (2026-10-18): beast rider town; the map location is approximate, a nearby site that fits is to be found;
the town is on a red sandstone mesa that rises out of the jungle and is topped by multiple Garden of the Gods-style
rock stacks or pinnacles; the pinnacles have platforms built round them for flyer roosting; the body of the town is on
the mesa; farms surround the mesa.

## 0. What the build is

| | |
|---|---|
| Folder | `settlements/pinnacle-rock/` (`src/`, `targets/`, `build.py`, `verify.py`, `materials.json`, `site/`) |
| Pages | `dist/pinnacle-rock.html` (the town), `dist/pinnacle-rock-site.html` (the site editor, Voth's read in place) |
| The mesa and the pinnacles | the ground on `core/terrain`: the mesa as a relief stamp (`38-core-relief.js`), its walls and the stacks' undercuts as carve patches (`36-core-carve.js`, overhangs on a heightfield); the pinnacles themselves a **new rock-stack generator** (section 2), since no kit draws free-standing fins and spires: it goes in `core/terrain` (a `39`-style sibling of the cavern), not in this build, so the Throne's and the desert's hoodoo country can take it |
| The buildings | the Beast Rider building catalog (`kits/catalog/krator-master-buildings-beast-rider.js`, 13 keys: Mav's and Girder's houses, halls, stores, the keeper's shelter), read in place; the roost stalls and decks lifted by name from Girder's `55-arch.js` (roost dressing) on Girder's `PLATS` and `ROOSTS` record shapes (`settlements/girder/API.md`), the decks' timber ring re-footed on rock instead of a tower; new catalog entries only for what neither build has (section 2) |
| The flyers | Girder's `84-flyers*.js` (routes, animals, update, hooks), read in place; the roost perch records are the contract |
| Town | `core/city` steps 0-12 on the site layer; the `frontage-courts` strategy for the hall's court, `alleys` among the stacks; the lots take the catalog's `br_bldg_*` keys |
| Farms | `core/city` fields on the jungle floor round the mesa's foot, as Girder's `PLOTS` (crop, paddy, orchard, garden, pen), with Girder's palisade and gates round them |
| Biome | the hyperjungle kit (`biomes/hyperjungle`) for the forest and its floor; the trees cleared from the farm ring and kept off the mesa top (`feedback`: no trees on cliffs) |
| Core | `core/rand`, `core/mask`, `core/tags`, `core/space`, `core/lod`, `core/host`, the shared sky; `core/furnish` with the beast-rider interiors set (`kits/interiors/sets/beast-rider.js`) later |

Pinnacle Rock is a settlement and goes in the gallery when it first reaches `main` (`gallery/README.md`).

## 1. The site

The scale model has Pinnacle Rock at px 737,354 (`staiytii0y`, a village point), inside the Beast Riders' political
polygon at its northern edge and inside the hyperjungle biome polygon near its northern margin; the Painted Men's
polygon begins about 15 km north, the Inner Wall's northern highlands behind it, and Korona beyond. Mav's Refuge is
248 km south, Girder 375 km south, the Hexahedron 365 km west, Kautoa 122 km. **The point is approximate** (the owner):
the build's first job is to find, within about 50 km of it, a mesa the model can carry. `tools/scale-model/
extract_region.py` reports the mesa and canyon candidates of a region (its `CANYON_MIN` rule: a trough 120-150 m deep
one and two cells out); run it on a polygon round the point and pick the candidate whose top clears the forest.
If none does, the mesa is added to the model as a relief edit (`edit_heights.py`, the way the Yuni valley's ranges
were) and the settlement point moved onto it; either way the chosen point is written back to the model's
`settlements` collection and this section updated with it.

**The mesa must clear the canopy.** Hypertrees are 290-480 m at Mav's and 150-270 m at Girder (`LORE.md` §12 holds
the contradiction). The plan takes the northern margin's forest at Girder's size and gives the mesa **about 250 m of
wall** above the jungle floor, with the **pinnacles 40 to 90 m** more, so the lowest roost deck stands above the
tallest crown and a flyer can leave a perch and fall into clear air (section 5, question 2). The mesa top is about
1.2 by 0.8 km, long axis north-south, red sandstone in horizontal beds, the stacks standing in two groups: the
**North Fins**, a row of leaning fins along the northern rim over the gorge, and the **Garden**, a cluster of spires
and balanced rocks at the top's middle, with the town between and round them.

| Zone | Where | What |
|---|---|---|
| **The Roosts** | the North Fins and the tallest Garden spires | platforms ringed round each pinnacle at one or two heights, roost stalls along the outer edge (Girder's stall: posts, low partitions, lean-to shingle roof, perch beam), the keeper's shelter on each, rope and timber bridges fin to fin, a beast lift down the gorge face |
| **The Crown** | the open top between the two stack groups | the assembly hall (Girder's round tajug-roofed hall, larger), the speakers' stones, the market round it, the shrine of the Winged Ones in the lee of a balanced rock |
| **The town** | the slopes and benches among the Garden's stacks | houses poor to rich (round huts, joglo, longhouses from the catalog; the rich houses built against the stacks), the Wings' barracks (named by Wing), workshops, the tack and feed stores, cisterns cut in the rock |
| **The Stair** | the mesa's southern nose | the one walking way up: a stair cut in the beds with switchbacks and gates, a capstan lift beside it for loads |
| **The farms** | the jungle floor round the foot, inside a palisade | crop plots, paddies, orchards, gardens, pens, the farm houses, a gate on the forest road |
| **The gorge** | under the northern rim | the canyon of the old note: a river or a dry gorge (section 5, question 3), the rookery platforms looking out over it, the beast lift's foot |

## 2. The rock and the roosts

**The rock-stack generator** (new, `core/terrain`, engine-neutral records then a drawing): a stack is a stacked column
of beds, each bed an irregular disc with its own radius, lean and a chamfered edge, grouped as fins (long and thin,
in rows that share a strike) or spires (near-round, tapering, some capped by a wider block: the balanced rock). It
writes records keyed by stable ids (`{id, kind:'fin'|'spire', x, z, beds:[{y, rx, rz, ry, chamfer}]}`) that the roost
placer reads to find a platform's ring and the carve patches read for undercuts; the drawing is red sandstone beds
from the material library (section 5, question 4: the desert's red rock sets, if the library has them; else a
`PROMPTS-NEEDED.md` entry, not a procedural stand-in). The test (`core/terrain/test-stacks.js`) proves the records are
deterministic from `KRAND` and that every platform ring fits its stack's bed at that height.

**The roosts** keep Girder's record shapes so the flyers' code reads them unchanged: a `roostdeck` record per platform
with its `levels`, `heads` and `nav`, `ROOSTS` with perch points 1.4 m inside the outer edge, open stalls 9.2 m deep.
What changes is the carrier: the deck is a timber ring **bracketed into the stack's beds** (cantilever brackets let into
a bed's chamfer, a post ring where the bed below is wide enough), not a tower top; a stack carries one or two rings,
the lower one the stalls, the upper one the lookout. The ring's inner edge follows the stack's outline at that
height, so no two rings are alike. A **catalog entry** for the bracket set and the ring segment (`br_bldg_roost_ring`,
indexed batch) goes in the Beast Rider buildings file; the stall and the keeper's shelter are Girder's.

**Access** is the Riders' way: most traffic comes and goes by air; the Stair is for the farms, the market and
strangers; the beast lift (Mav's cage lift on a capstan) hangs down the gorge face for loads a flyer cannot carry.
The town is "un-assailable" the way Mav's gateway trees are: one stair, gated three times.

## 3. The order of work

- **P0. The site and the harness.** Find the mesa (section 1), write the point back, `build.py` reading the catalog,
  Girder's flyers and `core/terrain` in place, the port lint, `verify.py` on `tools/harness.py`. Done when a bare red
  mesa stands in the hyperjungle on the page and `--assert` passes.
- **P1. The rock.** The rock-stack generator and its test; the mesa's relief and carve; the North Fins and the Garden
  placed as records on the site layer; the Stair cut. Done when the stacks read as Garden of the Gods at eye level
  and from the air, with no tree on the top (the cliff rule's probe check).
- **P2. The roosts.** The bracketed rings, the stalls and keepers' shelters on them, the bridges, the lift; Girder's
  flyers landing and leaving on them. Done when a quetzal lands on a North Fin perch in the walk and the roost
  traffic runs.
- **P3. The town and the farms.** `core/city` steps 0-12 on the top; the hall, the market, the barracks, the shrine;
  the farm ring and palisade below. Done when the town fills the top, the city test is green and the views of section
  4 read.
- **P4. The life.** Riders and keepers (`core/charactermodels`, the beast-rider clothes), the Wings' banners (the
  claw, green), the night: fires on the Crown, lamps at the stall heads, the farms dark. Done when the night view reads.
- **P5. The record.** `README.md`, `KNOWN_ISSUES.md`, `PORT.md`, the gallery entry, the hash into `PORT-BASELINE.json`.

## 4. Views for the verify

| View | What it must show |
|---|---|
| Overview from the south-east, above the canopy | the red mesa out of the green, the two stack groups, the rings on the fins, the farm ring at the foot |
| The North Fins at roost height | the stalls along the ring, a flyer on a perch, the gorge below |
| The Crown at eye level | the hall and the speakers' stones between the stacks, the market |
| A town street | houses against the spires, a barracks with its Wing's banner |
| The Stair | the switchbacks and gates up the southern nose, the capstan lift |
| The farms from the gate | plots, paddies, the palisade, the mesa wall behind |
| Night | fires on the Crown, the stall lamps, the roosts' silhouettes |

## 5. Open questions for the owner

1. **The site.** Settle on a candidate from the model (section 1) or let the build add the mesa as a relief edit.
   Recommended: run the candidates first; add the relief only if nothing within 50 km clears the forest.
2. **The canopy.** The plan takes Girder's tree heights at the margin and a 250 m mesa with 40 to 90 m stacks.
   Recommended as written; the alternative is a lower mesa in a cleared country, which loses "rises out of the jungle".
3. **The gorge.** The old note's canyon: keep it under the northern rim (recommended: it gives the rookery platforms
   their view and the beast lift its drop; a dry gorge, no river to route on the model) or drop it.
4. **Which tribe.** The Wingclaw (giant archaeopteryx) as the roost town's own tribe, with Quetzal and Nightwing Wings
   posted there, is the recommendation (the northern march, `LORE.md` §6.6 proposed); or the Quetzal alone.
5. **Red sandstone.** Name the library set (`core/materials/PLAN.md`) or ask for one: a red sandstone in horizontal
   beds with cross-bedding, and a weathered bed-face variant for the undercuts.
