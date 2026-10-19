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

**Settled 2026-10-18.** The owner's point (px 737,354, `staiytii0y`) was approximate, so the model's heights within
50 km of it were scanned for mesa candidates (a cell standing above its eight neighbours, ranked by its height over
the ring 8 km out) and canyon candidates (the extractor's `CANYON_MIN` rule). No cell met the canyon rule; six stood
proud, and one clears the forest: **px 755,351**, 37 km east-north-east, a knoll whose top is -305 m over a jungle
floor at -900 to -1,000 m (the scan: 541 m over the ring's median; the 4 km cells round it read -323, -335, -398,
-424 on the top, -746 to -1,010 north, -1,315 east), 11 km from the **K'etsaal Baatar** (the page's name; the repo's
namer is behind it), rain about 3,000 mm. The others were 170 m or less over their rings, under the canopy. The
point was moved to 755,351 and typed `town` (notes on the record). It is inside the Beast Riders' and hyperjungle
polygons; the Painted Men's polygon begins 10 km north, the Inner Wall behind it, Korona beyond; Mav's Refuge is
250 km south, Girder 375 km, the Hexahedron 400 km west. The knoll is a 10 km upland at the model's resolution: the
mesa itself stands on its top, and the 1:1 ground round it falls away as the cells say, steepest to the north and
east.

**The mesa clears the canopy** (settled 2026-10-18). The northern margin's forest is Girder's size (150-270 m; the
contradiction with Mav's 290-480 m stays in `LORE.md` §12 for the deep jungle). The mesa rises **about 250 m** from
the knoll's foot, the **pinnacles 40 to 90 m** more, so the lowest roost deck stands above the tallest crown and a
flyer can leave a perch and fall into clear air. The mesa top is about
1.2 by 0.8 km, long axis north-south, red sandstone in horizontal beds, the stacks standing in two groups: the
**North Fins**, a row of leaning fins along the northern rim over the gorge, and the **Garden**, a cluster of spires
and balanced rocks at the top's middle, with the town between and round them.

| Zone | Where | What |
|---|---|---|
| **The Roosts** | the North Fins and the tallest Garden spires | platforms ringed round each pinnacle at one or two heights, roost stalls along the outer edge (Girder's stall: posts, low partitions, lean-to shingle roof, perch beam), the keeper's shelter on each, rope and timber bridges fin to fin, a beast lift down the gorge face |
| **The Crown** | the open top between the two stack groups | the assembly hall (Girder's round tajug-roofed hall, larger), the speakers' stones, the market round it, the shrine of the Winged Ones in the lee of a balanced rock |
| **The town** | the slopes and benches among the Garden's stacks | houses poor to rich (round huts, joglo, longhouses from the catalog; the rich houses built against the stacks), the Wings' barracks (named by Wing), workshops, the tack and feed stores, cisterns cut in the rock |
| **The Stair** | the mesa's southern nose | the one walking way up: a stair cut in the beds with switchbacks and gates, a capstan lift beside it for loads |
| **The farms and ranches** | the jungle floor round the foot, inside a palisade | crop plots, paddies, orchards, gardens, the farm houses, a gate on the forest road; the **ranches** of the ground tribes: Threehorn and Hardshell paddocks, Staghorn beetle pens, Longcrawler sheds, the Raptor and Tiger tribes' kennels and runs, each with its tribe's lodge |
| **The gorge** | under the northern rim | a **dry gorge** (settled 2026-10-18), the rookery platforms looking out over it, the beast lift's foot |

## 2. The rock and the roosts

**The rock-stack generator** (new, `core/terrain`, engine-neutral records then a drawing): a stack is a stacked column
of beds, each bed an irregular disc with its own radius, lean and a chamfered edge, grouped as fins (long and thin,
in rows that share a strike) or spires (near-round, tapering, some capped by a wider block: the balanced rock). It
writes records keyed by stable ids (`{id, kind:'fin'|'spire', x, z, beds:[{y, rx, rz, ry, chamfer}]}`) that the roost
placer reads to find a platform's ring and the carve patches read for undercuts; the drawing is red sandstone beds
from the material library: `rock.sandstone.navajo` (delivered, cross-bedded) for the fins' sweeping faces, and the
owed `rock.sandstone.bedded.red` (`core/materials/PROMPTS-NEEDED.md` section 4) for the horizontal beds and the
balanced rocks, never a procedural stand-in. The test (`core/terrain/test-stacks.js`) proves the records are
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

1. **Settled (2026-10-18).** The site is the knoll at px 755,351 (section 1); the point was moved there.
2. **Settled (2026-10-18).** Girder's tree heights at the margin, a 250 m mesa with 40 to 90 m stacks.
3. **Settled (2026-10-18).** The old note's canyon is kept as a dry gorge under the northern rim.
4. **Settled (2026-10-18).** The Wingclaw are the roost town's own tribe, with Quetzal and Nightwing Wings posted;
   the Staghorn, Threehorn, Raptor, Hardshell, Tiger and Longcrawler tribes are all represented in the town and in
   the farms and ranches round it (section 1, the ranches; the mounts and stock through `kits/fauna` and the flyers'
   animals). The town's culture mix carries every tribe as a `core/city` zone property for the citizens to come.
5. **Settled (2026-10-18).** The owner asks for a sandstone set: the prompt is in `core/materials/PROMPTS-NEEDED.md`
   section 4 (`rock.sandstone.bedded.red`; `rock.sandstone.navajo`, delivered, is reused for the cross-bedded faces).

None open. The name in Tł'aai is the lore's question (`LORE.md` §12), not the build's.
