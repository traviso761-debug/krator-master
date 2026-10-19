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
| The buildings | the **Beast Riders kit** (`kits/beast-riders`: the one origin for Beast Rider buildings, owner 2026-10-19): its mounts' buildings, the ports of Girder's and Mav's, and (in progress, 2026-10-19) the sedentary trades and larger houses, the rock-cut pieces and rooms, and the tent set with its pens and trainer structures (`BR_CAMP`: a band's camp by tribe), read in place; formerly the catalog's beast-rider buildings file (13 keys), the roost stalls and decks lifted by name from Girder's `55-arch.js` (roost dressing) on Girder's `PLATS` and `ROOSTS` record shapes (`settlements/girder/API.md`), the decks' timber ring re-footed on rock instead of a tower; new catalog entries only for what neither build has (section 2) |
| The flyers | Girder's `84-flyers*.js` (routes, animals, update, hooks), read in place; the roost perch records are the contract |
| Town | `core/city` steps 0-12 on the site layer; the `frontage-courts` strategy for the hall's court, `alleys` among the stacks; the lots take the catalog's `br_bldg_*` keys |
| Farms | `core/city` fields on the jungle floor round the mesa's foot, as Girder's `PLOTS` (crop, paddy, orchard, garden, pen), with Girder's palisade and gates round them |
| Biome | the hyperjungle kit (`biomes/hyperjungle`) for the forest and its floor; the trees cleared from the farm ring and kept off the mesa top (`feedback`: no trees on cliffs); the mesa's walls, top and stacks take the **necanyons** kit (`biomes/necanyons/PLAN.md`: hanging gardens, stack figs, the first carnivores), once it is built |
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
polygons; the Painted Men's polygon begins 44 km north, the Inner Wall behind it, Korona beyond; Mav's Refuge is
250 km south, Girder 375 km, the Hexahedron 400 km west. The knoll is a 10 km upland at the model's resolution: the
mesa itself stands on its top, and the 1:1 ground round it falls away as the cells say.

**Checked against the model (4.21, 2026-10-19), and the page takes its land.** The knoll is a ridge about 6 km wide and
10 km long running north-south (its top -325 m at px 753-755, 349-351), standing 500 to 1,000 m over the jungle floor:
the mesa's long axis follows it and the 4.4 km page lies on its top. The ground falls **steepest east and south** (860 m
within 8 km east; 1,100 m within 12 km south, most of it beyond 4 km), gentler north and west; within the page the
model's crown runs ~20 m higher west and north-west and falls 40-80 m to the south and south-east corners (2.5% across
the farm ring: the contour terraces take it). The **K'etsaal Baatar** runs west 11 km due south (from px 787,366 to
743,362), the **Inner Wall** rises north and north-east to 2,100 m at 32 km and 2,800-3,100 m at 48 km; the site is in
the Hyperjungle overlay 8 km inside its edge, Korona's 48 km off. The page's floor is the model's land at 1:1 (the open
world's fields over a cut round the site, `region/`; README.md), with the dry gorge cut finer than the model's cells;
the far land to 60 km is drawn from the same cut.

**The mesa clears the canopy** (settled 2026-10-18). The northern margin's forest is Girder's size (150-270 m; the
contradiction with Mav's 290-480 m stays in `LORE.md` §12 for the deep jungle). The mesa rises **about 250 m** from
the knoll's foot, the **fins round the rim 40 to 90 m** more and the **Garden's pinnacles 130 to 250 m** over the Garden's mesa (owner,
2026-10-19: larger pinnacles rising out of a smaller, lower mesa in the middle), so the lowest roost deck stands above the tallest crown and a
flyer can leave a perch and fall into clear air. The mesa top is about
1.2 by 0.8 km, long axis north-south, red sandstone in horizontal beds. The stacks are the **fins**, spread round the
rim in groups of one to three, each group on its own strike (owner, 2026-10-19: not one row), and the **Garden**, a
cluster of spires and balanced rocks at the top's middle, with the town between and round them.

**The layout is settled (owner, 2026-10-19)** on the diagram at https://claude.ai/artifact/Dn8qzog9vCzCvcV9gxHpZH
(two plans, a section, the cavern's section). Ten fins: two over the gorge on the north (the Wingclaw's, the beast lift
between them), three on the east (the Quetzal's), two on the west (the Nightwing's), single lookouts at the north-east,
south-west and south-east; each Wing's barracks and its band's camp ground by its own fins. The Crown in the north
middle, the Deep Root precinct north-west of it, the Garden in the middle with the house quarter west and the trades
east of it, the strangers' quarter south by the Stair head. On the floor: the farms inside the palisade south and west
as six contour terraces cut into field cells (no parcel overlaps another; orchards on the two outer terraces, paddies
by the south spring, twelve farmhouses in field cells); the six non-flyer bands' pastures outside it, each band's
pasture and camp inside its own thorn hedge (grazers west, Raptor and Tiger east); the gorge holds only the lift's foot.
**Every tribe has a ground** (owner, 2026-10-19): the Dragonfly, Spider and Mammoth tribes (the rest of `LORE.md` 6.6's
list) have a camp and a smaller pasture each on the floor, inside their hedges: the Mammoth's paddock and byre south,
west of the forest road; the Spider's fenced grove of standing trees and silk house at the forest's edge north-east,
away from the grazers; the Dragonfly's netted breeding pond and net-house south-east of the gate (flyers whose beasts
live by water, not on the fins, so they camp on the floor). Nine grounds on the top, nine on the floor.

| Zone | Where | What |
|---|---|---|
| **The Roosts** | the fins round the rim and the four tallest Garden spires | platforms ringed round each pinnacle at one or two heights, roost stalls along the outer edge (Girder's stall: posts, low partitions, lean-to shingle roof, perch beam), the keeper's shelter on each, rope and timber bridges between the fins of one group, a beast lift down the gorge face |
| **The Crown** | the open top between the two stack groups | the assembly hall (Girder's round tajug-roofed hall, larger), the speakers' stones, the market round it, the shrine of the Winged Ones in the lee of a balanced rock |
| **The Garden's mesa** | the middle of the top | a smaller, lower mesa (owner, 2026-10-19): about 450 m across, 55 m over the main top, its walls weathered like the mesa's, with the Garden's **sixteen pinnacles** rising out of it (130-250 m over it, the tallest at the centre, 16-28 m across the foot; a few balanced rocks and a fin at its edge). The Garden's great-houses stand on it among the pinnacles; P3 gives it its ways up (stairs and a ramp cut in its walls) |
| **The town** | the slopes and benches among the Garden's stacks | the **sedentary** Beast Rider style (owner, 2026-10-19): houses poor to rich (round huts, joglo, longhouses, and the kit's larger houses: clan great-houses, chiefs' compounds, rock-backed longhouse blocks where land is tight), every trade a Rider town has in its pre-electric form (`kits/beast-riders`, the trades after the Isle demo's census), the Wings' barracks (named by Wing), the tack and feed stores; **rock-cut** rooms, facades, shrines and cisterns in the stacks and the mesa's walls (the carved-tree rooms of Mav's Refuge re-cut in sandstone) |
| **The Deep Root cavern** | the top's north-west, between the Crown and the house quarter | one of the Riders' holiest sites (owner, 2026-10-19), where all five nature shrines are honoured under the Deep Root: a ring of twelve standing stones (nothing built inside), a processional way from the Crown, a court sunk 8 m into the beds with a stair, a carved face (the twelve tribes' beasts under the claw) round the door, the passage of the tribes (a niche per tribe), and a hall about 44 by 26 m and 15 m high: reliefs, the five shrines' lamp niches, ledges of offerings, an altar stone left standing, and a stack fig over a light well whose roots hang 12 m into a rain pool. `KCAVERN` (`core/terrain/39-core-cavern.js`): trench, stair, hall, monolith, fixtures, a `door` and a `well` opening; `KSTACKS.mesh` needs a list of holes for the well |
| **The upper camp grounds** | the mesa top's open margins, away from the Crown | a designated ground for a band of **each tribe** (the Quetzal, Wingclaw, Nightwing, Raptor, Staghorn, Threehorn, Hardshell, Tiger, Longcrawler; the Dragonfly, Spider and Mammoth camp on the floor only), pitched in the kit's **tent set** (hide domes, barrel pavilions for the band's chief and council, the band's trade tents, its pens and trainer structures), each ground under its tribe's banner; the **flyers' bands camp only here** (owner, 2026-10-19), by their Wing's fins, their grounds the larger (about nine tents); the other six tribes' grounds about five tents |
| **The Stair** | the mesa's southern nose | the one walking way up: a stair cut in the beds with switchbacks and gates, a capstan lift beside it for loads |
| **The farms** | the jungle floor round the foot, inside a palisade | crop plots (fonio on the sand terraces, `biomes/necanyons`), paddies, orchards (stack figs, ember plums), gardens, and **some farmhouses** in the kit's sedentary style; a gate on the forest road |
| **The lower camp grounds and pastures** | the floor round the foot, beyond and among the farms (most of the camps are here) | **many pastures** where the bands keep their mounts, each a band's: Threehorn and Hardshell paddocks, Staghorn beetle pens, Longcrawler sheds, the Raptor and Tiger tribes' kennels and runs, and smaller ones for the Mammoth (a paddock), the Spider (a fenced grove) and the Dragonfly (a netted breeding pond), the great beasts' byres; each band's **camp** beside its pasture, the two inside the band's own **thorn hedge** (owner, 2026-10-19) in the tent set (its dwellings, its trades, its training ring, breaking pen and hitching lines), under its tribe's banner. A band comes and goes: the grounds are designated, the tents are moved (owner, 2026-10-19) |
| **The gorge** | under the northern rim | a **dry gorge** (settled 2026-10-18), the north fins' roosts looking out over it, the beast lift's foot and its loading yard; no camps |

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

**Status (2026-10-19): P0 and P1 are done** (README.md): the page stands on the model's land with the far land to the
Inner Wall; the mesa, the ten fins round the rim, the Garden, the shrine's rock and seven spurs as KSTACKS records from
the settled plan; `verify.py --assert` passes. The Stair (listed under P1) moves to P2 with the lifts and the rock-cut
stair pieces (`kits/beast-riders`).

- **P0. The site and the harness.** Find the mesa (section 1), write the point back, `build.py` reading the catalog,
  Girder's flyers and `core/terrain` in place, the port lint, `verify.py` on `tools/harness.py`. Done when a bare red
  mesa stands in the hyperjungle on the page and `--assert` passes.
- **P1. The rock.** The rock-stack generator and its test; the mesa's relief and carve; the fins and the Garden
  placed as records on the site layer; the Stair cut. Done when the stacks read as Garden of the Gods at eye level
  and from the air, with no tree on the top (the cliff rule's probe check).
- **P2. The roosts.** The bracketed rings, the stalls and keepers' shelters on them, the bridges, the lift; Girder's
  flyers landing and leaving on them. Done when a quetzal lands on an east fin perch in the walk and the roost
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
| Overview from the south-east, above the canopy | the red mesa out of the green, the fins round the rim and the Garden, the rings on the fins, the farm ring at the foot |
| The north fins at roost height | the stalls along the ring, a flyer on a perch, the gorge below |
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
