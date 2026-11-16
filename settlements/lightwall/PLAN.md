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
| **The Glaziers** (the eastern loj's main hold: the owner, 2026-11-16) | ~2,500 | **in the wall**: tiers of carved fronts from the bench's back (1,460 m) up the scarp's foot to ~2,600 m, facing south over the lake | the `gz-*` set: `gz-cell`, `gz-front`, `gz-house` poor to rich; `gz-stair`; `gz-adit` and `gz-vein-gallery` on the Great Potch Line; `gz-wheel-walk`; `gz-tea-hall`; `gz-register-room`; `gz-glass-shop`; `gz-monks-house`; `gz-dark-adit`; `gz-lotus-pond` |
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
  - **The Glaziers pay the Sultan's Fifth in opals** (the owner, 2026-11-16), counted at the assay house on the bench
    (`kits/tungang` 1.4: "the Sultan's Fifth paid in cut stones"). In the tune it is a road `share` of 0.2 on opal to the
    Treasury, like the Sultan's mines'.
- **The glass shop:** potch to **moonglass**, a new good; crystal opal to **lenses**, which the tune already has.
- **The lake:** fish, lotus root and seed, opal mussels and their pearls (`biomes/opalvalley` section 4, the opal mussel),
  and the ferries.
- **The bench terraces:** grain toward a quarter of the town's need; the rest bought down the valley with opal.
- **The roads:**
  - to Kirstabal and Strongbow (opal, moonglass, lenses and pearls down; grain, tea, sugar, dried fruit and iron up);
  - across the lake to the Sultan's mines;
  - over the north divide to Oidong's monks (pigment and seeing-mirrors out; tea and celadon in), by a high pass if the
    wall allows one: to check at 1:1.
- **The houses:** the Rare Devisers (main guild house at Theodiga, royally licensed in scrap and rare artifacts) and the
  Two Horns would want factors here (X2's merchant houses). The Golden Tears would not: their gold is in Lizard country.

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
| **L0** | The pin: a scale-model edit through the scale-model session's queue (a `defSetts` pin and its key), and the Great Potch Line as a lode record (`kits/resources/data/lodes.json` needs an `opal` family first) (**the pin done 2026-11-17**: `slaitwal0001`, model edit 5.1e12; the lode waits on the `opal` geology family) | the pin's ground is the bench; the lode's field is under the wall |
| **L1** | The town in `XAN_TUNE`: the settlement, its works, the field, the roads; the province's seat question settled (**done 2026-11-16**: `slaitwal0001` in `core/region/data/xan-tune.js`, the seat of P6; the Great Potch Line's adits on a field of veins, the glass shops' moonglass (a new good), the dugouts, the bench terraces; the Sultan's mines its works village over the lake by the ferry; the Fifth in opals from the assay house; opal and moonglass down by Kirstabal to Qiblai and Yuni's caravans; its grain up the same road. The id is the pin's, `slaitwal0001`) | `test-xan-economy.js`: fed, the Fifth, the field |
| **L2** | The bench town on `core/city` with the Xanadu kit (a target on Xanadu's page, as Qiblai is) | its city tests; the GPU verify |
| **L3** | The wall: the `gz-*` fronts and the hold's plan cut into a scarp on the page | the set's checks: walkable, no clipping, the voids inside the rock |
| **L4** | Interiors for both halves (**done 2026-11-16**: the bench's houses round the Stair Foot with the Xanadu kit's interiors, the carved homes walked from their fronts) | the interiors' checks: `ix-bench`, `ix-glazier` |
| **L5** | The site in the open world (**done 2026-11-16**: `slaitwal0001` in `openworld/SITES.json` (the pin's id, model edit 5.1e12), a site of `openworld/xanadu-oidong-highrift`: its square in the cut, three farming villages and a ranch on the shore's bench, the plan baked; the town's own page stays this one) | the region's verify: its new check, Lāiṭwāl on its bench under the wall, the lake at its feet |

## 7. Questions for the owner

1. ~~**The name.**~~ **Answered 2026-11-16: keep *Lāiṭwāl*, "the Light Wall".**
2. ~~**The Glaziers' hold.**~~ **Answered 2026-11-16: Lāiṭwāl is the eastern loj's main hold.** About 2,500 Glaziers live
   in the wall, where the Tungang plan (`kits/tungang/PLAN.md` 1.4.1) had proposed 300-500 at the upper riser. Still
   open, *proposed*: the upper hold at the riser (x ~1060) stays as the loj's old first hold, a small working outpost on
   the first terrace's tarns, where the crystal opal for the lenses is gathered.
3. ~~**The writ.**~~ **Answered 2026-11-16: the bench is the Sultan's, the wall the loj's.** The bench town is the Sultan's,
   under his factor; the wall governs itself as a loj (its steward, the show of hands, the count wall) and pays the Fifth in
   opals. The Stair Foot is the line between them.
4. ~~**The province's seat.**~~ **Answered 2026-11-16: Lāiṭwāl is the seat of Ōpal-Bhālī** (P6), not the Sultan's mines.
   The mines (`sjuarjbku0`) become one of its works villages across the lake. In `XAN_TUNE` (step L1) the province's
   tithe roads and its dues go to Lāiṭwāl.
5. ~~**The halves.**~~ **Answered 2026-11-16: half and half in people**, about 2,500 Glaziers and 2,500 Xanadui.
6. ~~**The footprint.**~~ **Answered 2026-11-16: compact, round the Stair Foot.** About 1.5-2 km of shore, the wall above it;
   the caravanserai and the monastery brought in to the town's west and east edges rather than the 16 km strip's ends.
7. ~~**This pass.**~~ **Answered 2026-11-16: L2 and L3, the town's own page.** The bench town on `core/city` with the Xanadu kit
   and the Glaziers' carved wall, on ground shaped from the scale model's numbers for the site. L0, L1 and L5 stay with the
   sites and sim sessions; L4 (interiors) follows.

8. ~~**The monastery.**~~ **The owner, 2026-11-16: "there will also be a monastery of the Teal great Qiblai monastery in
   Laitwal, the Iridescent Order".** Its house stands on the east spur (PLAN.md 3's "the monastery"): the Qiblai kit's great
   monastery in its teal spoke (`qb_monastery` v 4, the kit's `QSPOKE` 'Turquoise', `0x2a9a94`).

## 8. The page (L2, L3; 2026-11-16)

`settlements/lightwall`: a target on Xanadu's page, as Qiblai is (`settlements/xanadu/build.py --kit settlements/lightwall`),
`dist/lightwall.html`.

**The frame.** Metres; x east along the shore, z south toward the lake; the origin is the Stair Foot on the bench. Heights are
the model's less 1,330 m: the lake at -30 (1,300 m), the bench from the shore (-28) up to the wall's foot (+90, 1,420 m).

| Part | Where | What |
|---|---|---|
| The lake | z > 430 | still water at -30 (`core/water` on Xanadu's page), a shingle shore; the far shore and the Sultan's mines are far field |
| The bench | z 430 to -270, x -1,000 to 1,000 | the Xanadui town: the shore road, the quays and boatsheds, the lotus terraces; the bazaar avenue up from the quay to the Stair Foot; terrace streets along the contours; blocks between them filled by `core/city`'s frontage-courts (Xanadu kit houses poor to rich, shops, the teahouse, the warehouse) |
| The Stair Foot | x 0, z -270 | the bazaar where the Glaziers' main stair comes down: the assay house, the factor's house and the strongroom beside it |
| The wall | z < -280 | the Glaziers': four bands of fronts, each band's face 10.2 m high (one three-flight `gz-stair`), each set back 9 m from the band below; the main stair climbs them at the Stair Foot; beyond the fourth band the north wall rises to the far field (5,964 m) |
| The ends | x -900, x +900 | the caravanserai on the road down the valley (west), the Decree's monastery on its spur (east) |

**The wall, carved and drawn.** The central quarter (about 300 m either side of the main stair) is carved: each site stands in
its own block of rock (a KCAVERN mass) carved from its `gz-*` void plan, the cut-away opening every room. The outer wall is
drawn as fronts on whole rock (`TG.gz.draw` with `facade: true`: nothing behind the face): the same fronts, no rooms, which
keeps the page within its budget. Each band's face between the sites is a plain block of the same rock.

**The Glaziers' wall, by the numbers** (about 2,500 people): about 120 cells (poor, the bands' ends), 110 household fronts and
30 rich houses (mid-height at the centre), with the tea hall and the Register on the main stair, the monks' house, four glass
shops, the wheel walks along the ledges, adits on the Great Potch Line (the first band's foot) and at two higher contacts, vein
galleries, the dark adits in the oldest workings, lotus ponds stepped to the shore.

## 9. Core adoption (written 2026-11-16, before the first fragment)

| Module | Taken | For |
|---|---|---|
| Xanadu's page (`settlements/xanadu/build.py --kit`) | yes | the scene, the sky (`core/atmos`), the host (`core/host`), the doors and glass (`core/door`), `core/lod`, the Xanadu kit's buildings (`VERN.place`), `core/rand`, `core/tags`, `core/walk`, `core/water` |
| `core/city` and `core/space` | yes, sealed in one closure (`gen/69l-kcity-bundle.js`, as Qiblai's) | the bench town: its ways and blocks as records (the site steps), the blocks filled by `frontage-courts`, every lot in the city index |
| `kits/tungang` (`tungang_bundle.py`, `TG`) | yes, sealed (`gen/69t-tungang-bundle.js`) | the Glaziers' fronts and rooms: `TG.gz.carve` into the wall's cavern, `TG.gz.draw` the fronts, `facade` for the outer wall; the culture id `glazier` (opt-in `core/tags/glazier`) |
| `core/terrain` (`KCAVERN`, `host/39e`, `host/39h`) | yes | the wall's carved quarter: the sites' rock masses carved from their void plans, the floors to core/walk, the cut-away's rock cut |
| `core/rand` (`KRAND`) | yes | every seed: the bench's blocks (frontage-courts' cell streams), the wall's sites (a hash of the band, the slot and a salt) |
| `core/tags` (`KTAGS`) | yes | every site registered before it is drawn: the Xanadui houses through the page's registry, the Glazier sites with `culture: 'glazier'` |
| `core/water` | yes (Xanadu's page) | the lake |
| `core/world`, `core/region` | yes (L1, L5) | the open-world site in `openworld/xanadu-oidong-highrift` (its countryside on `KSITES`), the town in `XAN_TUNE` |
| `core/charactermodels` | not yet | its people |
| `kits/interiors` | yes, through the Xanadu kit's interiors (`89y-xa-interiors.js`, the `xanadu` set) | L4: the bench's houses within 260 m of the Stair Foot planned and furnished; the carved rooms furnished from the catalog by the Tungang kit's builders |

**Not taken, and why.** No new PRNG, noise, sky or camera: Xanadu's page and the modules above. The ground is the page's own
`terrainH` (a function of the site's numbers, written as records: the bench's profile, the wall's bands), never read back from
pixels; `core/mask` is not needed (the bench's blocks are polygons, the city raster is core/city's).
