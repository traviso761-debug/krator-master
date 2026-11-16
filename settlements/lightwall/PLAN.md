# Lāiṭwāl, the Light Wall: a town of 5,000 in Opal Valley (proposal, 2026-11-16)

The owner, 2026-11-16: *"we can go ahead an plan a settlement of 5k in the Opal Valley using the new set that's half Glazier
and half normal-Xanadu buildings. we'd need to find a good site near a great opal lode and a steep mountain"*.

Everything here is *proposed* except the owner's words above and the name. **The name is the owner's: kept 2026-11-16.**
It is Xanadui in its English-in-Indic form, like *Ōpal-Bhālī* and *Gōlḍ-Mārch*: "the light wall", for the cliff of glowing
moonglass panes the Glaziers' fronts make at dusk (`kits/tungang/PLAN.md` 1.4).

Sources:
- `biomes/opalvalley/PLAN.md`: the valley, its terraces, its opal and how it is mined.
- `kits/tungang/PLAN.md` 1.4 and 3.4 on `claude/glazier-kit-50feb4` (729fac2cf): the Glaziers and their `gz-*` set.
- `kits/xanadu`: the Sultanate's buildings.
- `core/simulation/PROPOSAL-XANADU.md` and `core/region/data/xan-tune.js`: the province and the sim.
- The scale model 5.1: `tools/scale-model/model/data`, `h.png` and `wl.png` decoded over [-2,600, 27,000] m, `tm.png`, `p.png`.

## 1. The site

**px 1028,1653**, on the north shore of the middle terrace's great lake, under the valley's north wall.

| | |
|---|---|
| Ground | a lakeshore bench at **1,330-1,460 m** (cells 1020-1036 by 1653-1654), the lake at its feet |
| The lake | the largest of the middle terrace's sinter lakes: water at **~1,270-1,310 m**, cells 1022-1034 by 1655-1661 (about 14 by 12 km) |
| The mountain | the valley's **north boundary fault**, a wall straight behind the bench. Up the 1,028 column: 1,651 m (y 1652), 1,968 (1651), 2,638 (1650), 4,265 (1649), 5,566 (1648). That is **4,200 m in 6 km, 35-40° on average**, the steepest ground in Opal Valley. It peaks at **5,964 m** at 1030,1648, and the summit ridge behind reaches **8,280 m** at 1032,1640 |
| Climate | mean **14-15 °C**, about **1,000 mm** of rain, `Cfb` (the middle terrace's: `biomes/opalvalley` station 3) |
| Air | ~1.35 atm on the bench |
| Neighbours | Opal Valley Mines (`sjuarjbku0`, the Sultan's factor, 850 people) on the lake's south side at 1038,1662, about 27 km across the water; the Glaziers' hold (proposed, `kits/tungang` 1.4) on the riser between the first and second terraces at x ~1060, about 70 km up the valley; Kirstabal (989,1600) and Strongbow down the valley and over the divide |

**The lode.** The north wall is the relay ramp's master fault, the boundary fault the valley plan's silica-rich fluids rise
along (`biomes/opalvalley/PLAN.md` section 2: "warm alkaline geothermal fluids rising along the three listric normal fault
scarps"). Where it cuts the dark basalt dikes at the wall's foot, the potch lines the miners follow open into **Rift Black
Opal**. This plan proposes it as **the Great Potch Line**: the richest lode in the valley, a field of short veins along
the wall's foot (section 4).

**The other sites the survey weighed** (bench cells under 250 m a km of slope, scored on a wall within 12 km, a fault
riser, water and warmth):

| Site | px | Ground | Why not first |
|---|---|---|---|
| **The Light Wall** (chosen) | 1028,1653 | 1,330-1,460 m, the lake at its feet | |
| The lower riser (Terrace II/III) | 1015,1657 | 1,270-1,590 m | the plan's potch lines are here, but the high ground nearby only reaches ~3,050 m and there is no lake on the bench |
| The upper riser (Terrace I/II) | 1060,1666 | 2,020-2,320 m, 10 °C | the Glaziers' own hold in their plan, above the Sultan's writ; the relief within 12 km is under 1,000 m |
| The north shore further east | 1035,1652 | 1,680 m | the same wall, but steeper ground and less bench |

## 2. Who lives there: 5,000 in two halves

| Half | People | Where | Buildings |
|---|---|---|---|
| **The Glaziers** (the eastern loj's main hold) | ~2,500 | **in the wall**: tiers of carved fronts from the bench's back (1,460 m) up the scarp's foot to ~2,600 m, facing south over the lake | the `gz-*` set: `gz-cell`, `gz-front`, `gz-house` poor to rich; `gz-stair`; `gz-adit` and `gz-vein-gallery` on the Great Potch Line; `gz-wheel-walk`; `gz-tea-hall`; `gz-register-room`; `gz-glass-shop`; `gz-monks-house`; `gz-dark-adit`; `gz-lotus-pond` |
| **The Xanadui** | ~2,500 | **on the bench and the shore**: the factors, jewellers and cutters, the Sultan's assay and garrison, the caravanserai, the boatmen and lotus growers, the Decree's monastery | the Xanadu kit's: houses poor to rich, the bazaar, the caravanserai, the assay house and its strongroom, a small fort, a monastery with its wheels, the quays, the lakeshore terraces |

The two halves meet at **the Stair Foot**, the bazaar where the Glaziers' main stair comes down to the bench. Opal and
moonglass come down it. Grain, tea, sugar, dried fruit and gilt go up.

This makes the town the place where "the Sultanate's writ thins out" (`biomes/opalvalley/PLAN.md`) meets the loj. The wall
is the Glaziers'; the bench is the Sultan's.

## 3. The layout

- **The wall (the Glaziers').** Read from the lake, the town is the wall. Fronts in four bands follow the potch lines up the
  scarp. The poor cells are low and to the ends; the rich houses with gilt and lattice bays are mid-height at the centre.
  The tea hall and the Register of the Veins sit at the centre of the wall, on the main stair. The adits are on the Great
  Potch Line at the wall's foot and at two higher contacts. The dark beds are in the oldest, worked-out adits. The lotus
  ponds are stepped down to the shore. At dusk the moonglass windows light: the reason for the name.
- **The bench (the Xanadui).** A strip about 16 km long and 2-4 km deep along the shore.
  - The Stair Foot bazaar sits at its centre.
  - The assay house, the strongroom and the Sultan's factor's house sit beside it, with the Fifth counted there.
  - Houses climb the bench's back toward the wall.
  - The caravanserai stands at the west end, on the road down the valley to Strongbow.
  - The monastery stands at the east end, on a spur.
  - The quays and boathouses line the shore, with the lake's ferries to the Sultan's mines and the lotus terraces.
- **The edges.** Lake villages on the shore and the islands, if the lake has any at 1:1, are left to a hamlet pass
  (`core/hamlet`) after the town is built.

## 4. The economy (for `XAN_TUNE`, after the owner's choices)

- **The Great Potch Line** as a **field of veins** (`XAN_TUNE.field`, X2): each vein 2-3 years of the adits' make, the
  field over 200 years (the owner's rule for every opal and gold lode, 2026-11-16).
  - Proposed: ~600 miners in shifts, about **300 kg of opal a year**, against the Sultan's mines' 180 kg with 850 people.
    The black opal is richer.
  - The Fifth is paid in cut stones at the assay house (`kits/tungang` 1.4: "the Sultan's Fifth paid in cut stones").
- **The glass shop:** potch to **moonglass**, a new good; crystal opal to **lenses**, which the tune already has.
- **The lake:** fish, lotus root and seed, opal mussels and their pearls (`biomes/opalvalley` section 4, the opal mussel),
  and the ferries.
- **The bench terraces:** grain toward a quarter of the town's need; the rest bought down the valley with opal.
- **The roads:**
  - to Kirstabal and Strongbow (opal, moonglass, lenses and pearls down; grain, tea, sugar, dried fruit and iron up);
  - across the lake to the Sultan's mines;
  - over the north divide to Oidong's monks (pigment and seeing-mirrors out; tea and celadon in), by a high pass if the
    wall allows one: to check at 1:1.
- **The houses:** the Rare Devisers and the Two Horns would want factors here (X2's merchant houses). The Golden Tears
  would not: their gold is in Lizard country.

## 5. Core adoption (to write in full before the first fragment)

- **The bench town on `core/city`**: the Xanadu kit's buildings on lots (`KCITY`), as Qiblai and Erewhon are built.
- **The wall on the cavern cut** (`core/terrain/host/39h-core-cavern-cut.js`, `KCAVERN`, taken into `kits/tungang` on the
  glazier branch) with the `gz-*` plans as its voids. `core/city/cavern` from Loj Twenny's branch if it is merged first.
- **The ground:** `core/world` (the open world's heightfield at 1:1, the site cut by `tools/scale-model/cut_site.py` into
  `openworld/xanadu-oidong-highrift`); `core/terrain` for the wall's face; `core/water` for the lake.
- **Interiors:** `kits/interiors` with the `gz-*` rooms and the Xanadu interiors.
- **Placement:** `core/rand` and `core/tags` (the `glazier` tag, opt-in).
- **The economy:** `core/region`'s valley host (the town in `XAN_TUNE`).
- **People:** the peoples in `core/charactermodels`: the Glaziers' turbans and sashed coats (`kits/tungang` 1.4).

## 6. Steps

| Step | What | Test |
|---|---|---|
| **L0** | The pin: a scale-model edit through the scale-model session's queue (a `defSetts` pin and its key), and the Great Potch Line as a lode record (`kits/resources/data/lodes.json` needs an `opal` family first) | the pin's ground is the bench; the lode's field is under the wall |
| **L1** | The town in `XAN_TUNE`: the settlement, its works, the field, the roads; the province's seat question settled | `test-xan-economy.js`: fed, the Fifth, the field |
| **L2** | The bench town on `core/city` with the Xanadu kit (a target on Xanadu's page, as Qiblai is) | its city tests; the GPU verify |
| **L3** | The wall: the `gz-*` fronts and the hold's plan cut into a scarp on the page | the set's checks: walkable, no clipping, the voids inside the rock |
| **L4** | Interiors for both halves | the interiors' checks |
| **L5** | The site in the open world | the region's verify |

## 7. Questions for the owner

1. ~~**The name.**~~ **Answered 2026-11-16: keep *Lāiṭwāl*, "the Light Wall".**
2. **The Glaziers' hold.** Is this town the eastern loj's main hold (with the upper hold at the riser left as its old
   first loj, or dropped), or a second hold beside it? The Tungang plan's figure was 300-500 Glaziers; this makes them
   ~2,500.
3. **The writ.** The bench is under 1,800 m, so inside the Sultan's writ by the valley plan. Is the town the Sultan's, with
   the Glaziers' wall governed by its own loj (the count wall), or something else?
4. **The province's seat.** `PROPOSAL-XANADU.md` makes the Sultan's mines the seat of Ōpal-Bhālī. Does the seat move to
   this town of 5,000?
5. **The halves.** Half and half in people as well as in buildings, or another split?
