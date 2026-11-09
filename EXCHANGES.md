# Neighbour exchanges: species each biome vends to the next (2026-10-27)

The owner (2026-10-27): "for biomes that are close to each other but that have not exchanged anything, calc at least 1 species
they could vend to a neighbor and vice versa." Every pair of built kits whose polygons touch or lie within 15 km on the scale
model (4.23), plus the Catch with the Bowl (across its walls) and nhighlands with the NW outer wall (44 km, the boreal edge):
49 pairs, 98 directions. 32 directions already exist (built or planned, with file evidence); the rest get at least one proposal.
Stations are named where a kit's station is the one on the border (the NW outer wall's, sedesert's Bowl, main desert and steppe).

**How a turn takes it:** at each biome's rebuild turn (`HANDOFF-REBUILD.md`, "How step 3 runs"), its session reads every section
naming its kit, as vendor and as receiver. It wires the receiver's side of each proposal: read in place, or as a cousin by
`BIO.kin('<kit>.<key>', {...})` with the named change, at the zone or station given. It keeps the vendor's keys and indices
as they are. A pair whose vendor turns later is wired when the later of the two runs. Every row is a proposal: the session
checks it against the kit's plan and the ground, may swap it for a better fit from the same vendor, and says so in its report.
No kit calls `BIO.kin` or `reach` yet, so every cousin here is new work.

**The owner's rulings (2026-10-27), over every row below:**
- **Farside gives, never takes:** nothing goes from Farside to its neighbours (its rows out are dropped); Farside may take from them.
- **No nsemiarid ↔ nwlowlands pairing** (the tumbler and the rest dropped).
- **Lowland styles hold for everything that comes in, plants and fauna alike:** into nwlowlands, tall, lank and blue; into swlowlands,
  wide, branching and red. Every row into either is a cousin in that style; one read "in place" becomes a cousin.
- **shighlands has visible spiralage:** every species that comes into it is a cousin with a visible spiral (phyllotaxis, a twist in
  crown, fronds or trunk).
- **The crater drylands are two lands, N and S** (the owner, 2026-10-27; `biomes/crater-drylands/PLAN-STATIONS.md`): each pair names
  the land on its border. S also takes `biomes/hyperjungle/PLAN-LANDS.md` 5.3's swap (the se rim, Godstep).
- **No dragon tree to swlowlands.**
- **No swap needed for nwbay ↔ hyperjungle:** the existing ironbark stands; the cliff fig row is dropped.

**Corrections found on the way:**
- **swbay vends to nwbay, not the reverse.** nwbay is a fork of swbay, with eight species marked `source:'swbay'`. k-guilin still
  reads nwbay.
- **nwlowlands and swlowlands have no species exchange yet.** Their `PLAN-FLORA.md` files take from other kits; the two share only
  cloned engine code. Their proposals are in the west sections.
- **godthrone has no species** (`GODT.SPECIES=[]`). Its rows are keyless stand-ins from its `PLAN.md` section 5 (lichen crusts,
  snow algae), to be keyed when that kit gains them.

The sources are the two survey agents' files, kept as written below: the west group (sections 1) and the east and south group
(section 2). Each pair lists the existing exchanges each way, then a table: direction, vendor key, name, carried by, taken as,
where in the receiver, why it fits.

## Index: the sections naming each kit

| Kit | Pairs |
|---|---|
| catch | catch ↔ godthrone; catch ↔ sedesert (the Bowl and main) |
| crater-drylands | crater drylands N ↔ cut; crater drylands N ↔ k-guilin; crater drylands N ↔ nhighlands; crater drylands N ↔ nwbay; crater drylands N and S ↔ swbay (both border SW Bay); crater drylands N ↔ swhighlands; crater drylands N and S ↔ hyperjungle (N touches it; S lies 7 km off and takes PLAN-LANDS 5.3's swap); crater drylands S ↔ shighlands; crater drylands N ↔ korona |
| cut | crater drylands N ↔ cut; cut ↔ nhighlands |
| eastabyss | eastabyss ↔ ebadlands; eastabyss ↔ sedesert (main) |
| ebadlands | eastabyss ↔ ebadlands; ebadlands ↔ korona; ebadlands ↔ sedesert (the Bowl and main) |
| ehighlands | ehighlands ↔ sedesert (the Bowl, main, steppe) |
| farside | farside ↔ nwouterwall (bordering station: **yeti**; Farside takes only); farside ↔ nwlowlands (Farside takes only) |
| geyser | geyser ↔ hyperjungle |
| godthrone | catch ↔ godthrone; godthrone ↔ shighlands; godthrone ↔ xanadu |
| hyperjungle | crater drylands N and S ↔ hyperjungle (N touches it; S lies 7 km off and takes PLAN-LANDS 5.3's swap); geyser ↔ hyperjungle; hyperjungle ↔ ringisles; hyperjungle ↔ nwbay |
| k-guilin | crater drylands N ↔ k-guilin; k-guilin ↔ nwbay; k-guilin ↔ nhighlands |
| korona | ebadlands ↔ korona; korona ↔ nhighlands; korona ↔ nsemiarid; korona ↔ nwouterwall; crater drylands N ↔ korona; korona ↔ sedesert (main) |
| nhighlands | crater drylands N ↔ nhighlands; cut ↔ nhighlands; nhighlands ↔ nsemiarid; nhighlands ↔ nwlowlands; nhighlands ↔ nwouterwall (added by the coordinator; the polygons are 44 km apart, on the boreal edge); nhighlands ↔ swhighlands; nhighlands ↔ swlowlands; k-guilin ↔ nhighlands; korona ↔ nhighlands |
| nsemiarid | nhighlands ↔ nsemiarid; nsemiarid ↔ nwlowlands (skipped: the owner, 2026-10-27); nsemiarid ↔ nwouterwall (bordering station: **taiga**, nearest of the two; the plan's crossing station is the planned **wallfoot**); korona ↔ nsemiarid |
| nwbay | crater drylands N ↔ nwbay; k-guilin ↔ nwbay; nwbay ↔ swbay; hyperjungle ↔ nwbay |
| nwlowlands | nhighlands ↔ nwlowlands; nsemiarid ↔ nwlowlands (skipped: the owner, 2026-10-27); nwlowlands ↔ nwouterwall (bordering station: **taiga** of the two; station 1 is nearer still); nwlowlands ↔ swlowlands; farside ↔ nwlowlands (Farside takes only) |
| nwouterwall | farside ↔ nwouterwall (bordering station: **yeti**; Farside takes only); nhighlands ↔ nwouterwall (added by the coordinator; the polygons are 44 km apart, on the boreal edge); nsemiarid ↔ nwouterwall (bordering station: **taiga**, nearest of the two; the plan's crossing station is the planned **wallfoot**); nwlowlands ↔ nwouterwall (bordering station: **taiga** of the two; station 1 is nearer still); korona ↔ nwouterwall |
| oidong | oidong ↔ xanadu |
| rift | rift ↔ xanadu |
| ringisles | hyperjungle ↔ ringisles; ringisles ↔ throne |
| sedesert | eastabyss ↔ sedesert (main); ebadlands ↔ sedesert (the Bowl and main); ehighlands ↔ sedesert (the Bowl, main, steppe); korona ↔ sedesert (main); catch ↔ sedesert (the Bowl and main) |
| shighlands | crater drylands S ↔ shighlands; godthrone ↔ shighlands; shighlands ↔ swbay; shighlands ↔ swlowlands |
| swbay | crater drylands N and S ↔ swbay (both border SW Bay); nwbay ↔ swbay; swbay ↔ swhighlands; swbay ↔ swlowlands; shighlands ↔ swbay; swbay ↔ throne |
| swhighlands | crater drylands N ↔ swhighlands; nhighlands ↔ swhighlands; swbay ↔ swhighlands; swhighlands ↔ swlowlands |
| swlowlands | nhighlands ↔ swlowlands; nwlowlands ↔ swlowlands; swhighlands ↔ swlowlands; swbay ↔ swlowlands; shighlands ↔ swlowlands |
| throne | ringisles ↔ throne; swbay ↔ throne |
| xanadu | oidong ↔ xanadu; rift ↔ xanadu; godthrone ↔ xanadu |

## 1. The west group

The worktree is `krator-biome-rebuild` (`claude/biome-rebuild`). Every key below is in the vendor's `src/` (the `SPECIES` table, or
`PLANTS` where marked "plant"). **Exists (built)** means a page reads the other kit today. **Exists (plan)** means a plan or
ecotone proposal names it and nothing is wired yet. "Read in place" is the vendor's builder as it is. A "cousin" is
`BIO.kin('<kit>.<key>', {...})` with the named change.

Climate figures are from `survey_biomes.py` on the 4.23 model.

**Two notes on the brief's list of known exchanges:**
- No **nwlowlands ↔ swlowlands** species exchange exists. Both `PLAN-FLORA.md` files are about other kits: nwlowlands takes
  from `wouterwall` and `nwouterwall`; swlowlands from `swhighlands` and `wouterwall`. The two kits share only an engine:
  nwlowlands is a clone of swlowlands' code (`nwlowlands/NOTES.md`).
- **swbay does not read nwbay.** The real direction is the other way: nwbay is a fork of swbay
  (`nwbay/src/50-biome-nwbay-species.js`).

**The NW outer wall's stations.** Station 1 is Leng's forest-steppe at px 220,216 (4.6 km). Station 2, `-taiga`, is at
px 218,190 (5.07 km, 0.85 atm, Dsc, 188 mm). Station 3, `-yeti`, is at px 138,176 (5.5-5.8 km, 0.80 atm). Station 4,
`-wallfoot`, is planned at 3.2-3.6 km (Csa/BSk) above nsemiarid.

Distance in px from each station to each neighbour's polygon:

| | Farside | nwlowlands | nsemiarid | nhighlands |
|---|---|---|---|---|
| steppe (station 1) | 74 | **42** | 69 | **98** |
| taiga (station 2) | 95 | 65 | **63** | 121 |
| yeti (station 3) | **67** | 111 | 135 | 178 |

So between taiga and yeti, Farside borders **yeti**, while nsemiarid, nwlowlands and nhighlands border **taiga**. Station 1
is nearer still to nwlowlands and nhighlands, so the rows name it where the plan puts a species there.

---

### crater drylands N ↔ cut

- **crater-drylands → cut: exists (plan).** `cut/PLAN.md` section 12 has exchanges 1 and 2: the tree aloe (`treealoe`) and
  the parasol pine (`parasolpine`). `cut/KNOWN_ISSUES.md:39` says they are not built yet.
- **cut → crater-drylands: exists (plan).** Section 12 has exchanges 3 and 4: rankgrass (`rankgrass`) and the measure melon
  (`measuremelon`), into the northern region only. Not built: "The crater drylands' two (3, 4) are still to do".
- No proposals needed.

### crater drylands N ↔ k-guilin

- **Existing exchanges: none either way.** `k-guilin/PLAN.md:25` and `NOTES.md:13` only say the two touch, on k-guilin's
  north-west upland edge toward the Scyvoi's drylands, around px 410.
- **Shared ground:** k-guilin is Aw at -990 m (925 mm, +31 °C), with XS and BSh patches at (441,390). The crater drylands
  are BSh and Aw at -580 to -750 m.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| crater → k-guilin | `ghostgum` | Ghost gum | water (seed down the washes), birds | cousin: denser, greener crown; bark kept white | `bank` and `plain` on the upland edge toward the drylands | a riparian (`'yes'`) survivor tagged Aw; k-guilin's edge is Aw |
| crater → k-guilin | `treealoe` | Tree aloe | birds, wind | read in place | `crown` and `ledge` (sunny karst tops) on the north-west edge | an arid rock plant; karst tops drain dry, as aloes on limestone do |
| k-guilin → crater | `banyan` | Banyan | birds (figs) | cousin: smaller (8-14 m), few aerial roots, dusty leaf | `seep` (the oases), the Aw belt (station 3 `edge`) | tagged tropic with Aw; a fig follows water in a dry country |
| k-guilin → crater | `silvergrass` (plant) | Chinese silvergrass | wind | read in place | `bloom` and `regrow` on the Aw edge (station 3) | *Miscanthus* is the first colonist of burns; fits the crater's fire mosaic |

### crater drylands N ↔ nhighlands

- **Existing exchanges: none.** `nhighlands/PLAN-STATIONS.md:26` only says that "crater-drylands has a fire model to read"
  (a model, not a species).
- **Shared ground:** nhighlands' low end is Csa at about 1.9 km (+16 °C, 690 mm), planned as station 3, the Mediterranean
  foothills. The crater's north rim is BWh and Csa at about -30 m.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| crater → nhighlands | `yucca` | Chaparral yucca | wind, animals | read in place | station 3: the chaparral on the sunny (north-facing) slopes | *Hesperoyucca* is a Californian chaparral plant, and station 3 is that chaparral |
| crater → nhighlands | `parasolpine` | Parasol pine | birds (seed caches) | cousin: shorter (10-18 m), denser crown, cold-hardy | station 3: the oak savanna's dry knolls | a fire survivor on a fire-kept slope |
| nhighlands → crater | `gnarloak` | Gnarled oak | animals (acorns) | cousin: a scrub oak (3-6 m), resprouting after fire, small hard leaves | `kop` (rock) on the northern rim toward the highlands | the old-wood oak of the boulder fields, dried to the drylands' scrub oak |
| nhighlands → crater | `brookwillow` | Brook willow | water (streams off the wall), wind | cousin: grey, narrow leaves, 3-6 m | `seep` and `wash` on the northern rim | desert oases carry willows; the streams come off the highlands |

### crater drylands N ↔ nwbay

- **Existing exchanges: none.** `nwbay/NOTES.md` borrows only from swbay, swlowlands, eastabyss and xanadu.
- **Shared ground:** nwbay has BSh at (444,444): 6.9% of it, at -984 m and 596 mm. The crater is BSh too, at a similar
  depth and air.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| crater → nwbay | `pincushion` | Pincushion tree | wind, birds | read in place | `ridge` with the dragon trees and umbrella thorns | tagged BSh and BWh; nwbay's ridge is its own BSh |
| crater → nwbay | `prismmallee` | Prism mallee | resprouts; seed on the wind | read in place | `cinder` (the lava fields) | a resprouter tagged BSh, BWh and Aw; it holds on hot, dry rock |
| nwbay → crater | `flamecrown` | Flame-crown | people (nwbay's farm and street tree) | read in place | `seep` and the farms of the Aw belt (station 3 `edge`) | a planted shade tree goes wherever the farms do |
| nwbay → crater | `cinderpine` | Cinder pine | wind (seed) | cousin: upright and unsheared (no salt wind inland), the black bark kept | `kop` on the basalt by the Steampits (station 4 `salt`) | a lava pine on the crater's own volcanic ground |

### crater drylands N and S ↔ swbay (both border SW Bay)

- **swbay → crater: exists (plan).** `crater-drylands/PLAN-STATIONS.md:47`: station 3's umbrella trees are "SW Bay's
  parasol savannah ... its trees as kin, `BIO.kin`". No species is named yet. Its savannah's species are `puzzle`,
  `thorn`, `baobab`, `dragon` and `parasol`.
- **crater → swbay: none.**

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| crater → swbay | `treealoe` | Tree aloe | wind, birds | read in place | `sav`, on the lava boulder outcrops | an Aw/BSh rock succulent; the savannah is Aw (957 mm) on rubble |
| crater → swbay | `ghostgum` | Ghost gum | water | read in place | `sav`, along the river's banks | riparian, Aw-tagged; the gallery tree of a savannah's watercourses |

### crater drylands N ↔ swhighlands

- **Existing exchanges: none.** `swhighlands/PLAN.md:98` only names the crater drylands as a neighbour.
- **Shared ground:** swhighlands' dry east scarp and its fan deltas are station 5, `-coast`, in the rain shadow
  (~400 mm). Its low Csa is at about 1.8 km (+15 °C).

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| crater → swhighlands | `swordspire` | Sword spire | wind | cousin: frost-hardy, glaucous blue-grey, a shorter spike | station 5: the scarp's ledges and the fans | a BSh/BWh seeder; the scarp is the highlands' driest ground |
| crater → swhighlands | `yucca` | Chaparral yucca | animals | read in place | station 5 and the Csa ridges' dry crests | ~400 mm and Csa suit a chaparral rosette |
| swhighlands → crater | `starcaudex` | Star-fruit caudex | animals (star fruit) | read in place | `kop` (rock) toward the scarp | tagged DRY; a water-storing caudex on ledges, as the crater's rock is |
| swhighlands → crater | `coralmelon` | Coral melon | animals and people (the melons) | read in place | `bloom` and `regrow` on the rocky ground under the scarp | tagged DRY; edible, so it travels with people |

### cut ↔ nhighlands

- **cut → nhighlands: exists (built).** `nhighlands/build.py:96-105` reads the Cut's `41`, `50`, `55`, `57` and `70`, and
  `87-host-cut.js` draws them. These are exchanges 7 and 8: circle lichen (`circlelichen`) and ring reeds (`ringreed`).
- **nhighlands → cut: exists.** It is built for the lip: `cut/INDEX.md:13` reads nhighlands' `50`, `55`, `60` and `70`
  (slots `48e`-`48h`). Exchanges 5 and 6 (`rowan`, `greattrumpet`) are planned in `cut/PLAN.md` section 12.
- No proposals needed.

### farside ↔ nwouterwall (bordering station: **yeti**; Farside takes only)

- **Existing exchanges: none.** Neither kit names the other.
- **Shared ground:** Farside's upper belt nearest the yeti station is Dfc at 4.3-5.3 km (1,540 mm) and ET at 5.4-6.6 km
  (1,145 mm), centred at (92,134) to (94,145). That is wetter than the yeti valley (0.80 atm). Farside's own flora is a
  sea-spray coast (Af, setting `coast`), so its plants find almost no niche on the wall.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| nwouterwall (from **yeti**) → farside | `woolwillow` (plant) | Woolly willow | wind (catkin down), water | cousin: larger, greener leaves, less felt (wetter air) | Farside's Dfc/ET belt above the fog belt, on stream banks. No station covers it yet; station 4, the fog belt at Yith, is Cfa | a tundra willow climbs every wet cold slope |
| nwouterwall (from **yeti**) → farside | `deerlichen` (plant) | Caribou moss | wind (fragments), caribou | read in place | the same belt, on the open ET ground | reindeer lichen needs only cold, open ground |

### k-guilin ↔ nwbay

- **nwbay → k-guilin: exists (built).** `k-guilin/build.py:73-81` reads nwbay's `50`, `55` and `56` in place in its own
  registry. The owner chose this on 2026-10-26.
- **k-guilin → nwbay: none.**

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| k-guilin → nwbay | `bamboo` | Phoenix-tail bamboo | water (rhizome pieces in floods), people | read in place | `rain` and `low`, on the travertine river's banks | tagged riparian `'both'`; the river runs from k-guilin into the bay |
| k-guilin → nwbay | `pomelo` | Pomelo | people (fruit) | read in place | `low`: the farm terraces and villages | a cultivated tropical fruit (tagged with Aw); it follows the farmers |

### nhighlands ↔ nsemiarid

- **nhighlands → nsemiarid: exists (plan).** `nsemiarid/PLAN.md:203`: the highland spurs over 2.5 km read `nhighlands` in
  place. `PLAN-STATIONS.md:42-53` says nsemiarid takes kin of nhighlands' station-2 trees. Its drift lantern is also of
  nhighlands' bell-bulb line.
- **nsemiarid → nhighlands: none.**

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| nsemiarid → nhighlands | `apple` | Wild apple | animals (fruit), people | read in place | station 2 (Dsb/Csb): the meadow edges and the moist draws | tagged with Csb and Dsb; *Malus sieversii* is the Tian Shan's montane fruit forest |
| nsemiarid → nhighlands | `samara` | Kite ash | wind (half-metre samaras) | read in place | `riparian` and `montane` on the dry-summer side | tagged with Dfb and Csb, riparian `'both'`; wind-carried uphill |

### nhighlands ↔ nwlowlands

**Status (nwlowlands' side, 2026-11-02):** `greyalder` and `foglaurel` built as `bluealder` and `bluelaurel` (`biomes/nwlowlands/src/87k-host-kin.js`); `NHL.make` and `NHL.grow` added for them, additive. The two rows into nhighlands wait for its turn (pair 7).

- **Existing exchanges: none.** nhighlands' `BRIEF.md` uses nwlowlands only as a style reference and for the far view.
  `nwlowlands/PLAN-STATIONS.md:42` gives its Dsb corner to nhighlands or nsemiarid. The Cut reads both kits, but not each
  other's.
- **Shared ground:** nwlowlands' upper Cfa is at about 0.9-1.7 km (1,506 mm). nhighlands' temperate band is Cfa at about
  2.2 km (2,243 mm).

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| nwlowlands → nhighlands | `glowwillow` | Glow-willow | wind (willow fluff) | cousin: smaller (10-16 m), a dimmer glow, a narrower crown | `riparian` in the temperate band | riparian; a willow climbs the streams |
| nwlowlands → nhighlands | `towerash` | Tower ash | wind | cousin: shorter (50-70 m), a darker crown | `temperate`, the wet ravines | nwlowlands' `gully` tree; nhighlands' giants run to similar heights |
| nhighlands → nwlowlands | `greyalder` | Grey alder | water (seed downstream) | cousin in the lowland theme: tall, lank, blue (bark and crown blue-grey) | `rip` | a riparian alder carried down the rivers off the wall |
| nhighlands → nwlowlands | `foglaurel` | Fog laurel | birds | cousin in the lowland theme: tall, lank, blue (bark and crown blue-grey); a clean bole | `sub` and `gully` | the laurisilva of the misty mid band reaches the lowland's moist Cfa |

### nhighlands ↔ nwouterwall (added by the coordinator; the polygons are 44 km apart, on the boreal edge)

- **nhighlands → nwouterwall: exists (plan).** `nwouterwall/PLAN.md:28` reads `biomes/nhighlands` in place for "the frost
  rowan and wall bilberry" at the edge of station 1's forest-steppe. `nwouterwall/build.py` does not read it yet. Those are
  `rowan` and the floor plant "Heath and bilberry", which has a label but no key.
- **nwouterwall → nhighlands: none.**

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| nwouterwall (from **taiga**) → nhighlands | `cottongrass` (plant) | Cottongrass | wind (the cotton) | read in place | the alpine's tarns and wet hollows (`alpine`; station 4, Dsc/ET) | *Eriophorum* belongs to cold wet hollows; nhighlands' Dsc and ET hold tarns |
| nwouterwall (from **taiga**) → nhighlands | `stonepine` | Stone pine | birds (nut caches) | cousin: the creeping mat form, greener and denser (wetter air) | `alpine`, above the wind spruce's krummholz | *Pinus pumila* mats above the tree line, and nhighlands' treeline lacks a pine mat |

### nhighlands ↔ swhighlands

- **nhighlands → swhighlands: exists (plan, conditional).** `swhighlands/PLAN.md:24` and line 225: the crest's fellfield is
  read from "riftrim or nhighlands". The kit was also forked from nhighlands' build, but that is engine, not species.
- **swhighlands → nhighlands: none.**

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| swhighlands → nhighlands | `whorlcolumn` | Whorl column | spores on the wind | cousin: smaller and sparser, darker, a few to a stand | `boreal` and `alpine` at the polygon's southern edge | swhighlands' treeline tree (4.3 km); nhighlands' treeline is the same Dsc |
| swhighlands → nhighlands | `pillarcap` | Pillar cap | spores on the wind | cousin: a smaller cap, muted violet | the Dsb/Csb balds and crests (station 2) | a lone crest cap; it gives the open Dsb ground an alien accent beside the trumpets |

### nhighlands ↔ swlowlands

- **swlowlands → nhighlands: exists (plan).** `nhighlands/PLAN-STATIONS.md:32`: station 3 reads "`biomes/swlowlands`'
  sprawl oaks and cork grove" in place (`sprawloak`, `corkoak`).
- **nhighlands → swlowlands: none.**

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| nhighlands → swlowlands | `mossmaple` | Moss maple | wind (samaras) | cousin in the lowland theme: wide, branching, red (red-brown bark, red flush) | `sub` and `rip` | a temperate riparian maple on the lowland's Cfa |
| nhighlands → swlowlands | `gnarloak` | Gnarled oak | animals (acorns) | cousin in the lowland theme: wide, branching, red | `med`: the upland boulder ground with the tier cedars | already gnarled and wide; Csa uplands hold oaks |

### nsemiarid ↔ nwlowlands (skipped: the owner, 2026-10-27)

- **Existing exchanges: none.** `nsemiarid/PLAN.md` section 8 gives nwlowlands only the overlays' fields (`rock`, `bed`,
  `silt`), not species.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|

### nsemiarid ↔ nwouterwall (bordering station: **taiga**, nearest of the two; the plan's crossing station is the planned **wallfoot**)

- **nsemiarid → nwouterwall: exists (proposal).** `nwouterwall/ECOTONES.md`, "nsemiarid into nwouterwall": `apple`,
  `apricot`, `walnut`, `foxtail`, wormwood, tulip, `poplar` and `samara`. They go to the **wallfoot** (station 4,
  planned) and station 1's lowest swells (apple to ~4.0 km, foxtail to ~4.4 km). None reaches the taiga (5.07 km).
  Station 4 reads nsemiarid in place (`PLAN.md` section 7).
- **nwouterwall → nsemiarid: exists (proposal).** The same file, "nwouterwall into nsemiarid":
  - `furlarch` and `stonepine` come from the **taiga** and station 1, and go to nsemiarid's Dfb ground (~2.8-3.0 km).
  - `furflower`, `ivanchai` and `sweetroot` come from station 1's steppe. `goldroot` comes from the **yeti** cliffs.
- **Shared records** are proposed for silverthorn and buckthorn, and for plumegrass and drill grass.
- No new proposals needed. To build it, mark each row with its station as above.

### nwbay ↔ swbay

- **swbay → nwbay: exists (built).** nwbay is a fork of swbay. Eight species carry `source:'swbay'`: `prismgum`, `baobab`,
  `fancrown`, `ironbark`, `treefern`, `splay`, `dragon` and `thorn` (`nwbay/src/50-biome-nwbay-species.js:104-125`).
- **nwbay → swbay: none.** `swbay/build.py:109` cites nwbay only for its falls code.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| nwbay → swbay | `cinderpine` | Cinder pine | wind | read in place | the lava boulders and headlands of `sav` and `shore` | swbay has a volcano and lava rubble; the pine is nwbay's lava and headland tree |
| nwbay → swbay | `flamecrown` | Flame-crown | people | read in place | `shore` and the river's lower banks, by the jetty | the bays' shared farm and street tree; both bays are Aw/Af |

### nwlowlands ↔ nwouterwall (bordering station: **taiga** of the two; station 1 is nearer still)

- **nwlowlands → nwouterwall: exists (proposal).** `nwouterwall/ECOTONES.md`, "nwlowlands up the Wall": `cragpine` goes to
  the face's ledges and the wall foot's lip, and `birch` (candle birch) to the wall foot's west gullies. Glow-willow
  (`glowwillow`) and the dwarf rhododendron go to station 1 and the **taiga** larch woods' damp floor. Tussock goes to the
  wall foot.
- **nwouterwall → nwlowlands: exists (proposal and plan).**
  - `goldroot` comes from the **yeti** cliffs and station 1 and goes down to the face's upper ledges.
  - `woolwillow` (from the **taiga**) is the willow ladder, and `beardlichen` comes from the **taiga** larch.
  - `nwlowlands/PLAN-FLORA.md` derives a **blue larch** from "the larch the wall reads from `nwouterwall`", that is
    `furlarch` (**taiga** and station 1), for the `med` uplands.
- No new proposals needed.

### nwlowlands ↔ swlowlands

**Status (nwlowlands' side, 2026-11-02):** `sycamore` and `cypress` wired as `bluesycamore` and `pondcypress` (`biomes/nwlowlands/src/87k-host-kin.js`); they grow once swlowlands' `make` and `grow` are merged.

- **Existing exchanges: none** (see the note at the top). It is one engine, cloned; no species pass between them.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| nwlowlands → swlowlands | `banksia` | Candle banksia | fire and wind (serotinous cones), birds | cousin in the lowland theme: wide, branching, red (the candles red) | `med`, with the ember manzanita and the pompom cycads | the same Csa chaparral on both sides |
| nwlowlands → swlowlands | `paperbark` | Pale paperbark | water | cousin in the lowland theme: wide, branching, red, red-flaked bark | `swamp` margins | a swamp *Melaleuca* fits the bayou's edge |
| swlowlands → nwlowlands | `sycamore` | Ghost sycamore | water | cousin in the lowland theme: tall, lank, blue (bark and crown blue-grey) | `rip` | white bark fits nwlowlands' white-to-blue-grey theme |
| swlowlands → nwlowlands | `cypress` | Knee-cypress | water | cousin in the lowland theme: tall, lank, blue (bark and crown blue-grey), as the pond cypress | `shore` and its wet low ground | a swamp conifer for nwlowlands' lake shore |

### swbay ↔ swhighlands

- **swbay → swhighlands: exists.**
  - Plan: `swhighlands/PLAN.md:24` reads swbay in place for `captree`, `brackettree` and `coral`.
  - Built in source as kin: `pillarcap` is "the bay's cap-tree's cold kin" (`swhighlands/src/50-biome-swhighlands-species.js:10`).
- **swhighlands → swbay: exists (plan).** `swbay/PLAN-FLORA.md` takes `fishingbridge`, `stiltpod`, `weepingwisp`, `beadcone`,
  `shelfcoral`, `coralmelon` and others, by key.
- No proposals needed.

### swhighlands ↔ swlowlands

- **swlowlands → swhighlands: exists (plan).** `swhighlands/PLAN.md` section 3: the sprawl oak (as the derived sprawl cap),
  `cedar`, `madrone` and `manzanita`.
- **swhighlands → swlowlands: exists (plan).** `swlowlands/PLAN-FLORA.md`: `fishingbridge`, a red lattice sprawl derived
  from `latticeoak`, `coralmelon`, and bead coral.
- No proposals needed.

### farside ↔ nwlowlands (Farside takes only)

- **nwlowlands → farside: exists (built).** `farside/build.py:96-98` reads nwlowlands' `50`, `55`, `60` and `70` in place;
  it is the native forest at the front and in the fog belt.
- **farside → nwlowlands: none in nwlowlands' own kit.** The sea weeds hang on nwlowlands' trees only on Farside's pages
  (`farside/NOTES.md:12`).
- **The fit:** Farside's plants need sea spray, and nwlowlands' shore is a freshwater lake. Only Farside's cloud-forest
  plant fits.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|

### swbay ↔ swlowlands

- **Existing exchanges: none.** The lantern mangrove went from swlowlands to nwbay (`nwbay/NOTES.md:87`), not to swbay.
- **Shared ground:** swbay's Csa at (383,612), -58 m and 580 mm, meets swlowlands' Csa and Aw coast.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| swbay → swlowlands | `puzzle` | Umbrella monkey puzzle | animals (big seeds) | cousin in the lowland theme: wide, branching, red, flat-topped | `med` and `sub`, at the warm end | the savannah's umbrella tree in a red, wide habit |
| swlowlands → swbay | `mangrove` | Lantern mangrove | water (floating propagules along the coast) | cousin: recoloured to the bay's hue, as nwbay did | `shore` and the delta's shallows | swbay's shore has no mangrove; the coast is continuous |
| swlowlands → swbay | `coastoak` | Coast oak | animals (acorns) | read in place | `sav`'s Csa edge | swbay holds 10k km² of Csa, swlowlands' own class |

### k-guilin ↔ nhighlands

- **Existing exchanges: none.**
- **Shared ground:** k-guilin is hot lowland (Aw at -990 m), although its species are tagged Cfa and Cwa. nhighlands' lowest
  band is Cfa at 1.4-2.7 km (+15 °C, 2,243 mm). That is a big climb, so mostly cousins.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| k-guilin → nhighlands | `camphor` | Camphor | birds (drupes) | cousin: cold-hardy, smaller (12-20 m), darker leaf | `temperate` (Cfa), the lowest band | tagged temperate, humid, Cfa; an evergreen laurel of the warm-temperate band |
| k-guilin → nhighlands | `yunnanpine` | Yunnan pine | wind | read in place | station 2: the dry Csb slopes | tagged with Cwb and subhumid; a montane pine fits a dry-summer montane station |
| nhighlands → k-guilin | `greyalder` | Grey alder | water (down the rivers) | cousin: a subtropical alder, glossier leaves, taller | `bank` and `shore` | riparian; alders reach subtropical banks (as *Alnus cremastogyne*) |
| nhighlands → k-guilin | `foglaurel` | Fog laurel | birds | cousin: heat-tolerant, smaller (6-12 m) | `crown` and `ledge` (the misty karst tops) | the laurisilva of misty rock suits the karst crowns |

---

**Totals: 24 pairs** (23 from the list, plus nhighlands ↔ nwouterwall), 48 directions.

- **20 directions already exist.** 6 are built: cut → nhighlands, nhighlands → cut (the lip), nwbay → k-guilin,
  swbay → nwbay, nwlowlands → farside, and swbay → swhighlands (the pillar cap as kin, in source). 14 are planned or
  proposed.
- **28 directions are missing,** with **55 proposals** in all: two per direction, except one for farside → nwouterwall.
- **Weakest fits:** farside → nwouterwall and farside → nwlowlands. Farside's flora needs sea spray, so the proposals there
  are the nearest plausible.


## 2. The east and south group

All paths are under `biomes/` in `C:/Users/travi/Documents/krator-biome-rebuild`. The climate figures come from
`tools/scale-model/survey_biomes.py` (the godthrone, s highlands, xanadu, the catch, Korona / NE, e abysss, e badlands,
sedesert, the bowl and e inner wall polygons) and from the kits' own border notes.

**How to read the tables.**
- **Read in place** means the receiver's page loads the vendor's builder as it is.
- **Cousin** means a `BIO.kin` relative with the change named. No kit calls `BIO.kin` or a `reach` yet (a grep of every
  `src/` and `stations/` finds none; it is core gap H1 in `hyperjungle/PLAN-LANDS.md`), so every cousin below is new work.
- **Station rule** (the coordinator): sedesert's pairs are given per station. *main* is the kit's own red desert (station 1).
  *Bowl* is `stations/bowl`, the polygon `the bowl`, whose own species are in `stations/bowl/66-biome-sedesert-halo.js`.
  *steppe* is `stations/steppe`.

**Count.** 25 pairs, so 50 directions.
- **12 directions already exist.**
- **2 are planned but not built**: godthrone→xanadu (the riverweed) and nsemiarid→korona (the east-bed station).
- **The other 36 directions, plus nsemiarid→korona, get 43 proposals**, counting the sedesert stations separately. 41 of them use a real vendor key. 2 are
  godthrone stand-ins without a key, because `GODT.SPECIES` is empty.
- **Weak, flagged:** catch→godthrone (not across the shared border), steppe→ehighlands (marginal), and the two godthrone
  stand-ins. ehighlands→steppe has no plausible species.

---

### catch ↔ godthrone

**Existing exchanges.**
- **godthrone→catch: none.** The Catch's walls are "the Godthrone's volcanic rock" (`catch/PLAN.md:173`), but no species
  crosses.
- **catch→godthrone: none.** `godthrone/src/50-biome-godthrone-species.js` has `GODT.SPECIES=[]`, and the godthrone side
  never names the Catch except in code (`catch(e)`).

**The ground.** The shared walls are 8.9-10.2 km on the Godthrone's side (`catch/PLAN.md:41`): HF, with no rain. The
Godthrone's lowest band is ET, 5,212 km² at about 6,070 m, 125 mm, mean -12 °C. The Catch's flora lives on groundwater
on a floor at 400-1,000 m (BWk, 16 mm). **Neither side has a plant that lives on the wall between them.**

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| godthrone→catch | *no key yet* (planned in `godthrone/PLAN.md` §5) | black and orange lichen crusts | wind (spores) | cousin, when GODT builds it | the lee of boulders on the Catch's high walls, in its ET band (30,572 km², 5,135 m) | the only life the Godthrone plans below the dry-cold line; the Catch's ET band is the one piece of its ground as cold as the Godthrone's foot. **Stand-in: there is no species in the source.** |
| catch→godthrone | `brinelamp` | Brine lamp | birds (the waders on brine) | cousin: a dwarf, ground-hugging rosette whose crystal crust is thicker | the shore of the Godthrone's closed saline lake (6,419 m, ET/EF; PLAN.md §1) | **a stretch:** this lake is not on the shared border. Brine and salt are the only thing the two kits share. Nothing from the Catch's floor survives at 9 km |

### crater drylands N and S ↔ hyperjungle (N touches it; S lies 7 km off and takes PLAN-LANDS 5.3's swap)

**Existing exchanges.**
- **hyperjungle→crater-drylands: yes, a cousin.** The `prismmallee` is "a much smaller relative of the hyperjungle's
  prism gum" (`crater-drylands/NOTES.md:30,46`; `src/50-biome-craterdry-species.js:11`).
- **crater-drylands→hyperjungle: none.** `hyperjungle/PLAN-LANDS.md` §5.3 sends the prism mallee and the frill-tree out
  of the patch, but to the se savannah rim (`biomes/abyssal-savannah` station `serim`; built as `biomes/savannarim`), not to the hyperjungle kit.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| crater-drylands→hyperjungle | `irisfern` | Prism fern | wind (spores) | cousin: larger fronds in the 1.9 atm air, a deeper green with the iridescence kept | `hyperjungle N`'s drier XA edge where it meets the XV/Aw savannah (1,035 mm) | the drylands' one subhumid plant, so it suits the wettest ground of its own kit; the prism iridescence echoes the prism gum it descends from |

### crater drylands S ↔ shighlands

**Existing exchanges: none either way.** `crater-drylands/NOTES.md:7` names the southern highlands only as a boundary,
and `shighlands/BIOME-API.md:3` names crater-drylands only as a code pattern.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| crater-drylands→shighlands | `protea` | Crater protea | birds (sugarbirds at the flowers) | cousin: smaller, leathery leaves, frost-hardy; with visible spiralage (shighlands' rule: a spiral phyllotaxis or twist in its crown, fronds or trunk) | shighlands' Csb/Cfb lower slopes, 1-2.4 km (Csb 3,428 km², about 500 mm) | proteas are montane fynbos shrubs, so the fire-adapted drylands plant goes up into the winter-rain belt |
| shighlands→crater-drylands | `albuca` | Corkscrew albuca | wind and water (seed down the slopes) | cousin: smaller, flowers after a burn | the drylands' rocky slopes and kopjes at the highlands' foot, inside the fire mosaic | the highlands' semiarid bulb; bulbs resprout after fire, as the drylands' own fire lily does |

### eastabyss ↔ ebadlands

**Existing exchanges: none either way.** The only hit is `eastabyss/src/50-biome-eastabyss-species.js:144`, which names
ebadlands' `HV()` helper: code, not a species.

**The ground.** The badlands' low south-west (BSh at 950 m, Aw at -895 m, around px 950,769) runs down to the abyss rim
(BSh at -180 m, BWh).

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| eastabyss→ebadlands | `araucaria` | Rope araucaria | animals (seed cones cached) | cousin: shorter, sparser ropes, no abyssal habit | ebadlands' low BSh/Csa canyons over the abyss rim (950-1,600 m) | the abyss's one temperate-semiarid species, so it can climb out into the badlands' lowest band |
| ebadlands→eastabyss | `cottonwood` | Fremont cottonwood | water (seed fluff down the rivers into the abyss) | cousin: taller, a buttressed bole in the 1.9 atm air | the abyss's riverbanks in the BSh/Aw margin (-1,200 to -100 m) | a riparian tree whose seed travels on water; the badlands' rivers drain into the abyss |

**Done (2026-11-02, ebadlands' turn, pair 5).** eastabyss→ebadlands `araucaria`: a cousin (`ropearaucaria`, x.7 tall, sparser), read in place on
station 1, the hot waste (`biomes/ebadlands/src/87-host-kin.js`): the slot canyon cut into the first step and the gullies' floors near its foot.
ebadlands→eastabyss `cottonwood` was taken at eastabyss's turn (`abysscottonwood`).

### eastabyss ↔ sedesert (main)

**Existing exchanges: none either way.** sedesert's core is the eastern abyss kit's core (`sedesert/BIOME-API.md:11`),
and eastabyss's fauna walkers are a copy of sedesert's (`eastabyss/src/75-biome-eastabyss-fauna.js:25`). Both are code,
not species.

**The ground.** sedesert's band below -1,000 m covers 16,268 km² (BWh, BSh, Aw, XW 10%): abyssal air on desert ground.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| eastabyss→sedesert (main) | `jade` | Jade shrub | wind and animals | read in place | sedesert's floors below -1,000 m (the XW/BWh basins) | it is tagged tropic, arid and abyssal: the same air and dryness as those floors |
| sedesert (main)→eastabyss | `bottle` | Bottle tree | people (water stores) and animals | cousin: the Bowl's dense-air habit (`PLAN-BOWL.md` §4: "swollen to baobab size") | the abyss's XS salt steppe and BSh rim (-1,700 to -200 m) | arid and tropic; the habit the kit already plans for abyssal air |

### ebadlands ↔ korona

**Existing exchanges: none either way.** `korona/NOTES.md:163` records the border (one plateau at about 4,620 m,
gradual), and the gorge station draws hoodoo landforms only (`korona/stations/gorge/45-host-stage.js:77`).

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| ebadlands→korona | `bristlecone` | Bristlecone pine | birds (nutcracker caches) | read in place | Korona's east plateau at 4.6 km, the hoar table country (Dsc/BWk, about 62 mm) | the same plateau and the same cold, dry, high ground where bristlecones live |
| korona→ebadlands | `frosttank` | Frost tank | water (snowmelt) and birds | read in place | the melt pools of ebadlands' ET/Dfc high band (5.1-5.9 km) | Korona's ET/Dsc ice-table trap, already tagged for exactly this ground |

**Waiting on Korona's turn (pair 9)** for both rows: Korona is the later vendor and reader (ebadlands' turn, 2026-11-02, left them).
**Status (pair 9, 2026-11-03, Korona's side):** the vendor's half of `frosttank` is ready: `KORONA.plant('frosttank', x, y, z, {lv, seed, id})`
(`biomes/korona/src/57-biome-korona-carnivores.js`) grows one with the kit's own builder and registers its trap; a reader takes Korona's `50` and
`57` in place. The same call takes `butterwort`, `cobralily` and `greatsundew` (the nwouterwall, nhighlands and crater-drylands rows); `wallfern` and
`bladderpool` are placed by the kit's passes against walls and pools and are owed. **Not taken (receiver):** the bristlecone on the hoar table (it
wants ebadlands' 50 and 55 read in place on a station that already reads ehighlands: the hoar's next pass); the caribou moss, the ghost gum and the
sea buckthorn wait on their vendors' turns (nwouterwall, crater-drylands; nsemiarid runs beside this turn). `biomes/korona/PLAN.md`, "Core adoption".

### ebadlands ↔ sedesert (the Bowl and main)

**Existing exchanges: none either way.**
- ebadlands vendors sedesert's strata shader and sky (`ebadlands/BIOME-API.md:125,132`): code, not species.
- sedesert's "badlands" are its own hoodoos (`sedesert/src/60-biome-sedesert-floor.js:166`).
- The Bowl's neighbours are named in `PLAN-BOWL.md:54`: the eastern badlands on the east, where the Bowl's Aw/Cfa east
  side meets the badlands' low BSh/Aw corner.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| Bowl→ebadlands | `tamarisk` (Bowl) | Tamarisk | water and wind (fine seed on the floods) | read in place (the Bowl's builder) | ebadlands' low BSh washes and river bars (950-1,500 m) | tamarisk is the classic invader of Colorado Plateau rivers |
| ebadlands→Bowl | `cottonwood` | Fremont cottonwood | water | cousin: dense-air habit, a squat, broad crown | the Bowl's `delta` levees on its east side | gallery trees on the delta's distributaries, beside the Bowl's tamarisk |
| main→ebadlands | `mesquite` | Mesquite | animals (pods eaten, seed dropped) | read in place | ebadlands' lowest BSh washes, the badlands' edge | a semiarid riparian shrub; the river lines run across the border |
| ebadlands→main | `juniper` | Utah juniper | birds (berries) | cousin: lower and broader in the thicker air, with a redder bark | sedesert's mesa tops and the BSk uplands (1.4-2.9 km) | the desert's mesas are badlands ground; juniper is the mesa tree |

**ebadlands' turn (2026-11-02, pair 5).** Wired but **not read** yet: main→ebadlands `mesquite` (`biomes/ebadlands/src/87-host-kin.js` grows it on station 1's wadis once `stations/waste/station.json`
reads sedesert again: sedesert's builder jitters the mesquite's crowns up to ~2.8 m off their limbs, and the attach audit failed station 1 at 9.5%; sedesert's
next turn holds them, BIO.holdTo). **Owed:** Bowl→ebadlands `tamarisk` (the Bowl's tamarisk builder is
private to `biomes/sedesert/stations/bowl/66-biome-sedesert-halo.js`: the Bowl's next turn exports it, then ebadlands grows it on the wadis'
bars); ebadlands→main `juniper` and ebadlands→Bowl `cottonwood` (sedesert's pages, its next turn: `build.py` NEIGH and `87-host-kin.js` read
ebadlands' species and trees in place; neither ebadlands species key nor index changed). No ebadlands species key or index changed.

### ehighlands ↔ sedesert (the Bowl, main, steppe)

**Existing exchanges: none either way.** ehighlands names sedesert only for code (`ehighlands/BIOME-API.md:4`,
`src/55-biome-ehigh-trees.js:222`). The giant-puya idea is already covered on the ehighlands side by its own `vigil`
(`ehighlands/NOTES.md:30`), so the puya is not proposed.

**The ground.**
- The e inner wall's dry side is BSk at 2.4-4.2 km (around px 861,524) with BWk below it (2.1-3.0 km); the stepped
  cold desert is in `ehighlands/PLAN-STATIONS.md:41`.
- The Bowl's `rimwall` is over 1,500 m (BSk 2,315 m, BWk 1,967 m).
- The steppe sits at about 670 m near px 800,690, at the Wall's foot.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| main→ehighlands | `agave` | Mountain agave | bats (pollination) and wind | cousin: smaller, blue-grey, frost-hardened | the dry side's BSk steppe, 2.5-4.5 km | the kit's agave of the rimwall already grows on the cold desert's edge |
| Bowl→ehighlands | `saxaul` (Bowl) | Saxaul | wind (winged fruit) | cousin: a shorter, denser shrub for the cold | the cold desert (BWk) below the dry side's steppe | *Haloxylon* is a cold-desert tree on Earth (Gobi, Turan); the Bowl gives it its first place on Krator |
| ehighlands→Bowl | `thorn` | Thorn cushion | wind and animals | cousin: looser and less woolly in the warmer, denser air | the Bowl's `rimwall` (over 1,500 m, BSk/BWk) | the tragacanth belt is Iran's cold desert-steppe; the rimwall is the Bowl's only cold ground |
| ehighlands→main | `tola` | Tola | wind | cousin: taller and greener, with a resinous scent | sedesert's BSk/BWk uplands (1.4-2.9 km) | a resinous dry shrub of the puna's arid edge, at the border's height |
| ehighlands→steppe | *(none plausible)* | | | | | the steppe is 670 m and hot (BSh); every ehighlands species is cold plateau. The wet-face belt that will reach the Wall's foot has no species yet (`PLAN-STATIONS.md` §3: "own species: the kit has none for this belt") |
| steppe→ehighlands | `myrrh` (steppe) | Myrrh | people (resin traders) | cousin: low and cushion-like | the Wall's lowest dry foot (BWh 2,073-2,588 m) | **marginal:** *Commiphora* reaches about 2 km in the Horn of Africa. Offered as the nearest one |

### geyser ↔ hyperjungle

**Existing exchanges.**
- **hyperjungle→geyser: yes, read in place.** `geyser/build.py:9,64-70` reads the hyperjungle's species, trees, fauna,
  floor, dress and build; also `geyser/NOTES.md:96`.
- **geyser→hyperjungle: none.** The hyperjungle never names the geyser kit.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| geyser→hyperjungle | `pandan` | Stilt pandan | water (floating fruit down the basin's outflow) | read in place | hyperjungle S's river and lake banks, and the lake station's várzea edge (`PLAN-LANDS.md` §6) | the same hypertropic humid air; a stilt-rooted shore tree suits flood-pulse ground |

### godthrone ↔ shighlands

**Existing exchanges: none either way.** `godthrone/PLAN.md:71` lists the southern highlands as a neighbour, with no
species.

**The ground.** shighlands' top is ET at 5.5 km (26,372 km², 329 mm) and EF at 6.9 km. The Godthrone's lowest band is ET
at about 6.1 km.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| shighlands→godthrone | `lichen` | Rosette lichen | wind (spores) | read in place | the lee of boulders in the Godthrone's ET band (5.4-6.6 km); the "crusts" of PLAN.md §5 | a crust from the same ET ground; it can stand in for the Godthrone's own planned crust |
| godthrone→shighlands | *no key yet* (planned in PLAN.md §5) | snow algae on old ice | wind and meltwater | cousin, when GODT builds it | shighlands' EF snowfields (6.6-7.3 km) | the Godthrone's one planned life on ice. **Stand-in: there is no species in the source** |

### hyperjungle ↔ ringisles

**Existing exchanges.**
- **hyperjungle→ringisles: yes, read in place.** The understorey palm and the screwpine: `ringisles/build.py:99-105`,
  `hyperjungle/src/60-biome-hyperjungle-floor.js:375`, `hyperjungle/BIOME-API.md:112`.
- **ringisles→hyperjungle: none.**

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| ringisles→hyperjungle | `breadfruit` | Breadfruit | people (Ring Sea traders; it grows from cuttings) | read in place | clearings and gardens round hyperjungle S's ports (Port Tobin, Fort Vaklu) | an Af/Am crop tree; the hyperjungle's air is hotter but just as wet, and people carry it |

### korona ↔ nhighlands

**Existing exchanges.**
- **nhighlands→korona: yes, read in place.** The trench station reads nhighlands (`korona/stations/trench/station.json`);
  the crest ecotone is crag pine, beard lichen and the trumpets (`korona/NOTES.md:26,302`; `BIOME-API.md:10,43`).
- **korona→nhighlands: none.** The only hit is a pattern note (`nhighlands/PLAN-STATIONS.md:6`).

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| korona→nhighlands | `cobralily` | Cobra lily | water (seed on the seeps) | cousin: a cold-seep form, smaller, a duller green | nhighlands' stream seeps and boggy hollows under the conifers | *Darlingtonia* is a plant of cold conifer-mountain seeps; Korona's poor-soil rule holds on wet rock |

### korona ↔ nsemiarid

**Existing exchanges.**
- **nsemiarid→korona: planned only.** The planned nsemiarid station 3 is "the east bed inside Korona"
  (`nsemiarid/PLAN.md:132,157-158,264`): ground and salt, with no species named.
- **korona→nsemiarid: none.**

**The ground.** The east lobe's lake shore: gradual, 590-860 m (`korona/NOTES.md:162`).

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| nsemiarid→korona | `buckthorn` | Sea buckthorn | birds (berries) | read in place | the east lobe's lake shore on Korona's side (about 830 m) | a temperate, semiarid, salt-tolerant shore shrub; the same shore runs on both sides |
| korona→nsemiarid | `bladderpool` | Sucking pool | birds (fragments on their feet) | cousin: a small pond bladderwort bed, danger 0, with no sucking | fresh pools and reed margins on nsemiarid's lake shore | bladderworts grow in steppe pools on Earth; Korona's version is scaled down for richer ground |

### korona ↔ nwouterwall

**Existing exchanges: none either way.** nwouterwall names Korona only for method (stations, dithering, the mask form:
`nwouterwall/ECOTONES.md:83`, `PLAN.md:26,214`).

**The ground.** The border is the rim at about 5,100 m on both sides (`korona/NOTES.md:165`, "NW boreal": "nothing grows").

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| korona→nwouterwall | `butterwort` | Butterworts | wind (dust-fine seed) | read in place | the taiga station's bog and melt-pool margins | *Pinguicula vulgaris* is a boreal bog plant; Korona's version is tagged polar, humid, ET/Dsc |
| nwouterwall→korona | `deerlichen` | Caribou moss | wind (fragments) | read in place | the hoar table's pavement and Korona's north rim below 5 km | a polar semiarid lichen for frost-shattered rock; the hoar table already reads cold kits in place |

### oidong ↔ xanadu

**Existing exchanges.**
- **xanadu→oidong: yes, five shared species.** The cloud pine, the cushion tree, the haze blossom, the lotus trumpet and
  the wisteria, "carried over the pass and paled", tagged `shared:'xanadu'` (`oidong/NOTES.md:26`,
  `BIOME-API.md:57-61`).
- **oidong→xanadu: none.** `xanadu/NOTES.md:92` shares reference pictures with Oidong, not species.

**The ground.** Xanadu's Cfb belt covers 3,808 km² at 2.2 km (1,302 mm); its Csb belt is at 1.8 km.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| oidong→xanadu | `cherry` | Cherry blossom | people (the History Monks and pilgrims, back over the pass) | cousin: a deeper colour (Oidong paled Xanadu's trees, so Xanadu deepens Oidong's) | Xanadu's Cfb/Csb gardens and terraces, 1.5-2.6 km | a cool-temperate garden tree; the mirror of the five trees that went the other way |
| oidong→xanadu | `tea` | Mist tea | people | read in place | Xanadu's wet Cfb face | a humid cool-temperate shrub in cloud; tea is the kind of thing monks carry |

**Status (pair 6, 2026-11-03, oidong's side):** the vendor's half is ready. `cherry` (species 2) is reachable by `OIDONG.make(2, x, y, z)` and
`OIDONG.grow(T, lv)` (and `BIO.kitBuilder('oidong', 'cherry')`), its key and index unchanged; its limbs now take `BIO.flareJoin` and its blossom is unchanged.
`tea` is a floor plant (`OIDONG.PLANTS.tea`, item `teabush`), drawn by the floor's `tea()` helper inside `60-biome-oidong-floor.js`: a reader takes the
item (`BIO.def('teabush', ...)` in `50`) and places it itself; there is no one-plant API for floor plants. The receiver's half (xanadu's page) is the
xanadu session's. **The five shared species** are separate copies in each kit; oidong's changed this turn (keys and indices kept): limb joints on all
five, the wisteria's racemes held to their limbs (card cell kept), the far tier on octahedral impostors.

**Taken (pair 6, 2026-11-03):** both rows, in xanadu's station `cloud` (`stations/cloud/station.json` reads oidong's 50 and 55): the tea in place,
the cherry as `BIO.kin('oidong.cherry')` keyed `cloudcherry`, a deeper rose. The five shared species keep their keys and indices in both kits.

### rift ↔ xanadu

**Existing exchanges: both directions. No proposal needed.**
- **rift→xanadu.** "Eight from the Rift ridge, altered" (`xanadu/KNOWN_ISSUES.md:91`; `NOTES.md:52,112`: the cloud
  tree-fern, the lantern tree and others); the Vale's floor takes the Rift's lowland flora in place
  (`xanadu/PLAN-STATIONS.md:60`).
- **xanadu→rift.** "The feral three" (`mawtrumpet`, `thornwhip`, `bladepear`), from Xanadu's lotus trumpet, serpent
  stalk and prickly pear (`rift/src/50-biome-rift-species.js:190-191`, `55-biome-rift-trees.js:460-508`,
  `PLAN-STATIONS.md:110-129`).

### ringisles ↔ throne

**Existing exchanges.**
- **throne→ringisles: yes, read in place.** The lehua, tree fern, arch palm, palm frill, mangrove, coconut and star aloe
  (`ringisles/build.py:16,85,167`).
- **ringisles→throne: none.** The only hit is a water-gap note (`throne/KNOWN_ISSUES.md:211`).

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| ringisles→throne | `strandpandan` | Strand pandanus | sea (floating fruit) | read in place | the Throne's coasts: the isle station and the windward shore's beaches | a strand tree whose fruit drifts; the Throne has the coconut and the mangrove but no pandanus |

### shighlands ↔ swbay

**Existing exchanges: none either way.** `shighlands/NOTES.md:6` names SW Bay as a steep neighbour, and nothing more.

**The ground.** shighlands' foot is Cfa at 750-2,000 m (2,667 mm) and Cwa (4,000 mm); swbay is hypertropic to tropic.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| swbay→shighlands | `cherry` | Ash cherry | birds (fruit) | cousin: smaller, with a later flush; with visible spiralage (shighlands' rule: a spiral phyllotaxis or twist in its crown, fronds or trunk) | shighlands' Cfa/Cfb foot, 1-2 km | the bay's one "mild" species, already suited to cooler ground |
| shighlands→swbay | `ginger` | Spiral ginger | water (rhizome pieces down the streams) | cousin: larger in the dense air, a looser spiral | swbay's wet understorey at the foot of the highlands' scarp | a montane humid herb; streams carry it down to wetter, warmer ground |

### shighlands ↔ swlowlands

**Existing exchanges: none either way.** `shighlands/NOTES.md:6` names the SW lowlands as a neighbour, and nothing more.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| swlowlands→shighlands | `madrone` | Flayed madrone | birds (berries) | cousin; with visible spiralage (shighlands' rule: a spiral phyllotaxis or twist in its crown, fronds or trunk); the flayed bark kept | shighlands' Csb/Csa slopes, 1-2.9 km | a temperate subhumid tree of summer-dry slopes; *Arbutus* climbs into montane Csb |
| shighlands→swlowlands | `crozier` | Crozier tree fern | wind (spores) | cousin in the lowland theme: wide, branching, red; the fronds keep their spiral | swlowlands' humid ravines (the eyed beech and magnolia woods) | a montane humid fern; its spores travel far, down into wet temperate forest |

### crater drylands N ↔ korona

**Existing exchanges: none either way.** `korona/NOTES.md:127,164` records the border (south-west, about 197 m, dry,
gradual) and the Bitir Gulusu wadi that runs to the drylands. `crater-drylands/PLAN-STATIONS.md:6` names Korona only for
its pattern.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| crater-drylands→korona | `ghostgum` | Ghost gum | water (seed down the wadi) | read in place | Korona's south-west lee along the Bitir Gulusu wadi | ghost gums line dry creek beds; the wadi joins the two kits |
| korona→crater-drylands | `greatsundew` | Great sundew | wind (fine seed) | cousin: a knee-high sundew that resprouts after a burn, danger 0 | the drylands' seeps (`reed` ground) in the fire mosaic | Australian sundews resprout after fire on poor, wet sand; this is Korona's rule on the drylands' wet ground |

### hyperjungle ↔ nwbay

**Existing exchanges.**
- **hyperjungle→nwbay: yes, as cousins.** The `ironbark` is "the hyperjungle's, scaled to the ceiling"
  (`nwbay/src/50-biome-nwbay-species.js:112`, `55-biome-nwbay-trees.js:224`); the prism-gum and ironbark leaf textures
  are the hyperjungle's (`50-...:203,208`). nwbay's own builders.
- **nwbay→hyperjungle: none.**

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|

### korona ↔ sedesert (main)

**Existing exchanges.**
- **sedesert→korona: yes, read in place.** The gorge and trench stations read the sedesert kit
  (`korona/stations/gorge/station.json`, `trench/station.json`; `korona/src/88-host-build.js:26`; `NOTES.md:300-301`).
- **korona→sedesert: none.** sedesert never names Korona.

**The ground.** The border is Korona's longest (11.7%): a steep scarp from Korona at 2,077 m (78 mm) to the desert at
430 m (156 mm).

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| korona→sedesert (main) | `wallfern` | Staghorn ferns | wind (spores) | cousin: a small, leathery fern of seep lines, like the hanging gardens of desert canyons | sedesert's canyon seep lines under the scarp and the pond's wall | Korona's ferns are "under every seep line"; desert canyons have the same hanging gardens |

### godthrone ↔ xanadu

**Existing exchanges.**
- **godthrone→xanadu: planned only.** The blood river's red riverweed: "Its lower course is the Xanadu and rift kits'
  ground; they draw the weed" (`godthrone/PLAN.md:179,242`). Xanadu has no riverweed in its source, and GODT has no key.
- **xanadu→godthrone: none.**

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| xanadu→godthrone | `frostwillow` | Frost willow | wind (seed fluff up the valley) and water | cousin: a prostrate dwarf willow, ankle-high, with the iridescent leaf kept | the banks of the blood river below the bloodfalls, the head of Qol Ḍrāi in the Godthrone's ET band (5.3-5.7 km) | arctic willows are the last woody plants on Earth's tundra; it is Xanadu's coldest tree, and the blood river joins the two kits |
| godthrone→xanadu (to complete the plan) | *no key yet* | red riverweed | water | for Xanadu to draw in its rapids, as PLAN.md says | the blood river's rapids and pools through the Vale's dry Csb/Csa country | already planned; it only needs the species written |

**Pair 6 (2026-11-03):** xanadu→godthrone is written: the frost willow's prostrate cousin `dwarfwillow` grows in xanadu's station `ranges`
(ET) and is exported as `XANADU.builders` for the Godthrone's next turn to read in place. The red riverweed stays owed: the blood river (Reḍ
Riwā) is on no xanadu page yet; the station that draws it writes the species.

### swbay ↔ throne

**Existing exchanges.**
- **swbay→throne: yes, by note.** "Cap-trees (SW Bay)" cross in at the shoulders (`throne/NOTES.md:151`); the Throne's
  cap-tree woodland is its own `gillparasol` (`throne/stations/savanna/45-host-stage.js:3,12`). swbay's cap-tree is
  `captree`.
- **throne→swbay: none.**

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| throne→swbay | `mangrove` | Hyper-mangrove | sea (floating propagules) | read in place | swbay's tidal shore and its creek mouths | sea-drifted propagules; swbay's shore has reeds but no mangrove |

### catch ↔ sedesert (the Bowl and main)

**Existing exchanges.**
- **sedesert (main)→catch: yes, read in place.** The wadi palm and the mesquite at the oases, with the reeds and sedges
  (`catch/build.py:17,92-95`, `src/88-host-build.js:10-15`, `PLAN.md:140,331`).
- **Bowl→catch: none read.** Both have a `brinelamp`, a saltbush and a tamarisk, but each kit has its own builder
  (`catch/src/50-biome-catch-species.js:4-12`; Bowl `stations/bowl/66-biome-sedesert-halo.js`). These are parallel
  species, not an exchange.
- **catch→sedesert: none.**

**The ground.** The only way between the two is the Catch's 6.2 km notch on the Bowl's side (`catch/PLAN.md:36,150`),
which the caravans use.

| direction | vendor key | name | carried by | taken as | where in receiver | why it fits |
|---|---|---|---|---|---|---|
| catch→Bowl | `poplar` | Euphrates poplar | people (caravans plant poplar cuttings at wells) and water | cousin: a broader, taller tugai tree in the 1.8 atm air | the Bowl's `delta` levees, with its tamarisk | tugai forest (poplar with tamarisk) is the Bowl's delta habitat on Earth too |
| catch→Bowl | `broom` | Dune shrub (sand juzgun) | people (fruit in fodder) and wind | read in place | the Bowl's `reg` sand sheets and dune fields | *Calligonum* is a sand-desert shrub; the Bowl's reg has dunes and no broom |
| Bowl→catch | `saxaul` (Bowl) | Saxaul | people (firewood that seeds) and wind | read in place, sparser | the Catch's BWk floor round the oases and channels | saxaul with tugai is the Taklamakan's pairing, and the Catch is that desert |
| (note) | `brinelamp` | Brine lamp | | one builder, read by the other | | the two kits draw the same Krator species twice; one should read the other's builder |

**sedesert's turn (pair 3, 2026-10-27).** The brine lamp's one builder is the Bowl's, now its own fragment
(`biomes/sedesert/stations/bowl/65-biome-sedesert-brinelamp.js`: `SEDESERT.BRINELAMP.put(x, y, z, lv, st)`, the library's
`card.brinelamp` from the 'bowl' pack's `brinelamp` slot, the crystals' emissive glitter). It needs only the sedesert kit's 50 and 60,
which the Catch already reads; the Catch's turn lists the fragment and the pack slot and puts its stands through it in place of its
own `brinelamp0..3` (`biomes/sedesert/KNOWN_ISSUES.md`). The rest of this pair (poplar, broom, saxaul) is the Catch's turn too.

**sedesert as receiver, the same turn.** Taken: eastabyss's `jade` (main), read in place, swapped from "floors below -1,000 m" (the main page
has none) to the Abyss floor under the cataract (-650 to -720 m, the kit's own abyssal ground; `src/87-host-kin.js`). Left for the vendors'
turns (later pairs): ebadlands' `juniper` (main) and `cottonwood` (Bowl), ehighlands' `tola` (main) and `thorn` (Bowl), Korona's
`wallfern` (main), the Catch's `poplar` and `broom` (Bowl). No sedesert species key or index changed: `bottle` (3) and `mesquite` (6),
`palm` (7) and the Bowl's `saxaul`, `tamarisk`, `brinelamp` as they were.
