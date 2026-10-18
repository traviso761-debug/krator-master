# Zey'danin: the plan (draft, 2026-10-18)

Zey'danin is the gateway to the Throne and a melting-pot city whose architecture tells its history: five layers,
each renovating the last in its own style. Its lore is `LORE.md` §6.12 (the Zey'danin entry), with the Zeijani in
§6.17 and `kits/zeijani/PLAN.md`, the Islanders in §6.17, the Hykkousoi in §6.16 and Voth in §6.12. Hook
(`settlements/hook/PLAN.md`) is the model for a layered city on `core/city`: this plan takes its layer mechanism and
adds the one thing Hook does not have, **renovation**: one culture's work on another culture's building.

Owner's brief (2026-10-18): gateway to the Throne, another melting-pot city; originally a Zeijani settlement, still
with an old quarter of Zeijani buildings carved into a small rock stack; most of the city Western Islander, as the
capital of a Throne-based Islander kingdom before it became part of the Izani Empire; an Iziz governor's palace with
some surrounding buildings in the Iziz Vernacular style; after the civil war an Islander kingdom proclaimed again with
Hykkousoi support from Ys, so a small Hykkousoi quarter, with barnacles built over and expanding the living space of
the Zeijani rock stack; about 30 years ago the Vothic kingdom invaded: took over the former governor's palace and
renovated it in the Vothic style, constructed many barracks and military buildings, greatly expanded the harbour,
brought Chichani settlers, proselytized among the Zeijani and Andaru with middling success, established Ranj
plantations that have struggled, some switching to coffee or sugar. The city should tell the story of its layered
history through architecture, with visible renovations in one style on buildings in a different style, layered in
order of arrival and dominance.

## 0. What the build is

| | |
|---|---|
| Folder | `settlements/zeydanin/` (`src/`, `targets/`, `build.py`, `verify.py`, `materials.json`, `site/`) |
| Pages | `dist/zeydanin.html` (the city), `dist/zeydanin-site.html` (the site editor, Voth's read in place) |
| Kits, read in place | `kits/zeijani` (the carved style, `ZEI` defs; the rock stack through `core/terrain/39-core-cavern.js` for its carved rooms), `kits/islanders` (the West set), the Iziz Vernacular and the Ancients core as the `IZV` bundle (`settlements/iziz/VASSAL-KITS.md` §1), `settlements/ys` (the Hykkousoi kit: `HYK.placeOn` grown-on builders, with the rock stack as a host), `settlements/voth/catalog` (the Vothic layer's lots, as `core/city` builds Voth) with `settlements/voth/src` lifted by name for the landmarks (`vothlift.py`), `kits/ringsea` and `kits/islanders`' boats for the harbour |
| The palace | the vassal cities' programme (`VASSAL-KITS.md` §3) in the Vernacular's materials, **renovated Vothic** (section 3): the first and biggest renovation on the page |
| Town | `core/city` steps 0-12 on the site layer with Hook's layer tags, plus the renovation records (section 2) |
| Ground and biome | the Throne kit (`biomes/throne`) for the volcano's flank and the kīpuka forest; the planned **spice-frontier station at Zey'danin** (`biomes/throne/NOTES.md`, the stations) is this page's country: the plantations' ground, the Ranj tree (`50-biome-throne-species.js`, `spice`), the Ring Isles kit's `crop-coffee` and `crop-sugarcane` stands for the planters who switched; the shore and shallows from the Ring Isles kit |
| Core | `core/rand`, `core/mask`, `core/tags`, `core/space`, `core/lod`, `core/host`, `core/walk` (the carved quarter), the shared sky; `core/furnish` with each culture's catalog set |

Zey'danin is a settlement and goes in the gallery when it first reaches `main` (`gallery/README.md`).

## 1. The site

The scale model has Zey'danin at px 523,530 (`s5x27pj6hn`, a village point: the owner's brief makes it a city, and the
type is to be changed on the model), inside the Ring Sea and Throne/Volcano polygons on the mountain's south-western
coast. Temora, the Kingdom's spice port, is 80 km south-west; Hook 135 km south-east across the strait; Almua 161 km
west; Dhelv, the Zeijani capital, 191 km north-east up the mountain; Nereus 128 km. The volcano rises behind the city
to the north-east; the lahar fans and the old flows run down to the shore; the kīpuka forest stands on the older
ground. The site is a bay with a **small rock stack** on its shore, a tuff knoll the Zeijani hollowed, the Islander
town on the flat behind it, the rise behind that for the Izani and now the Vothic precinct, and the plantations on the
flows inland.

| Zone | Layer order | What |
|---|---|---|
| **The Stack** (the old quarter) | Zeijani, then Hykkousoi pods on it | the Zeijani rock stack: rounded rooms and galleries carved in cream tuff, hewn on the poor levels and polished on the rich, their doors and the walk map through the stone; Hykkousoi barnacle pods grown on its seaward face and over its top, doubling its rooms; a Vothic sun painted on its gate (section 3) |
| **The Islander town** | Islander, Vothic renovation on a share | long houses on piles under horned roofs, the kingdom's hall of stacked horned roofs (the Islanders' seat, now the Vothic governor's "assembly"), the carved posts, the dockyards; scrap on the poor |
| **The Izani rise** | Izani, then Vothic | the governor's palace renovated Vothic; the Vernacular houses round it, a few renovated purple, most as they were; the Izani quarter's old gate with the sun chiselled off |
| **The Hykkousoi quarter** | Hykkousoi | grown nacre and bronze on the Stack's seaward side and the mole below it: the sea shrine, the pilots' houses, the League's trade house, kept apart by Voth and watched |
| **The Vothic works** | Vothic | the Ordinator citadel on the rise's flank, the harbour fort, barracks blocks, the garrison's drill ground, the Temple of the Sun on the shore (new-built, not a renovation), the Chichani settlers' canton of townhouses on the town's landward edge |
| **The harbour** | Islander, greatly expanded by Voth | the Islander dockyard and beach landing, then Voth's stone quays, the pens for the chitin biremes, the spice warehouses, the customs; the Hykkousoi mole |
| **The plantations** | Vothic | Ranj plantations on the flows (the Shim registry's planter's manor, slave lines and overseer's post, `settlements/shim/PLAN.md` §1, once they exist), most struggling: thin rows of Ranj trees with dead stands, two converted to coffee under shade bananas and one to sugar; the old Zeijani shrines in the kīpuka between them, still visited |

## 2. Layers and renovations

**The layers** are Hook's mechanism: every building carries `culture` and `layer` in `core/tags`, a `core/city`
zone carries the lot mix, and the lot filler draws a culture then a type from that culture's registry through one
adapter. The order of arrival is the order of the list below, and dominance is read in the shares.

| Layer | Kit | Where | Share of lots |
|---|---|---|---|
| `zeijani` | `kits/zeijani`, the carved style only (no constructed or wooden defs: those are Dhelv's country) | the Stack | 10% |
| `islander` | `kits/islanders` West set, `scrap` on the poor | the town, the dockyard | 45% |
| `iziz` | `IZV`; the palace | the rise | 8% |
| `hykkousoi` | `settlements/ys` grown-on builders on the Stack and the mole | the Hykkousoi quarter | 5% |
| `voth` | the Voth building catalog's registries; `vothlift.py` for the citadel's walls, the Temple's tiers, the harbour fort | the works, the harbour, the settlers' canton, the plantations | 32% |

**Renovation** is the new piece: a record on a lot, `renovations: [{culture, kind, when}]`, kept as deltas by id
(`core/city`'s rule), applied after the building is placed by a **dress pass per culture** that reads the building's
`core/tags` record (its parts: roof, walls, doors, finials, plinth) and reworks named parts in the renovating
culture's materials and forms, never the structure. Three renovating cultures, each with its own vocabulary:

- **Vothic on anything** (the dominant pass, 30 years old): purple render over a wall, gold leaf on a crest, a Vothic
  tiered finial on a horned ridge, a diamond on a door or gate, a purple awning, a shrine niche of the Sun cut into a
  wall; on a civic building, a tier or a buttress added in the Voth catalog's forms. The palace is this pass at its
  largest (section 3). The pass leaves the host's form legible: the horns stay under the gold.
- **Hykkousoi on the Stack**: not a dress but a growth: `HYK.placeOn` pods on a host record the Stack exposes (the Ys
  kit wants a host with pad records, `hykPad`; the cavern module writes them for the Stack's ledges), with their
  doors cut through to the carved rooms behind (a `core/walk` edge each).
- **Islander on the Zeijani** (the oldest, and faint): carved posts and a horned porch at the Stack's doors, the
  moon disc on its gate; and **Izani on the Islander**: the kingdom's hall given a Vernacular portico and an orange
  cornice when the Empire made it the governor's assembly, both still there under the Vothic paint.

The renovations are generated by rule from the layer order (a building of layer *i* in a zone a later layer *j*
dominates takes a renovation of *j* with a probability the zone sets; civic buildings always), and the site editor
can pin one by id. `verify.py --assert` checks that no lot carries a renovation by a culture that arrived before its
own, and that the Stack carries exactly three cultures' marks.

**Wealth and tags** keep the contract of `VASSAL-KITS.md` §2 for the lots the Vernacular and the Voth catalog share
(the rise), and Hook's rule that any layer's poor and middle may take scrap patching.

## 3. The palace, renovated Vothic

The Izani built it on the vassal programme (`VASSAL-KITS.md` §3.1-3.4, the forks taken as Pylon's): the terrace, the
hall block, the great dome, the seven pavilions, the outside stair, in the Vernacular's orange ashlar and copper.
Voth's thirty years renovated it (the Voth palace's own vocabulary, `settlements/voth/palace`): the dome re-skinned in
gold over the copper, with a Vothic lantern; **flying buttresses between the tiers** added between the hall block's
upper gallery and the two large pavilions, carrying a new gallery; purple render over the arcades' reveals, the
orange showing where it flakes; a black-and-porphyry trim line at the cornice; the forecourt's gate rebuilt with the
diamond; an Ordinator guardhouse in the guard pavilion; the household shrine of the orb and sun stripped and refitted
as a Sun shrine; the council pavilion, once the Islander king's door, kept for the Islander elders Voth still receives.
The floor programme is the vassal one, so the sheets are the shared generator's with a renovation column (what Voth
changed in each room: the decor level up by one, a Sun image where the orb was), and the furniture manifest keys to
the Voth catalog file over the Iziz one.

## 4. The order of work

- **P0. The harness and the layers.** `build.py` reading five kits and `core/city` in place (Hook's adapter lifted
  into a shared place if Hook's P0 has not done it already); the Throne kit's station ground; `verify.py` on
  `tools/harness.py`. Done when one building of each layer stands on the shore and `--assert` passes.
- **P1. The site.** The bay, the Stack, the flat, the rise, the flows; the site editor saving
  `site/zeydanin-site.json` with the zones, the lot mixes and the layer order. Done when steps 0-5 run.
- **P2. The Stack.** The carved quarter on the cavern module with its walk map, the Islander marks at its doors, the
  Hykkousoi pods grown on its host records. Done when the walk map is connected through stone and pod and the three
  cultures' marks read.
- **P3. The town and the renovation pass.** Steps 6-12 on every zone; the three dress passes; the harbour's two
  generations. Done when the renovation rule's checks are green and a renovated horned house reads as "Vothic on
  Islander" at eye level.
- **P4. The palace and the works.** The palace sheets with the renovation column, then the building; the citadel,
  the fort, the Temple, the barracks, the settlers' canton; the plantations with their failing rows and the two
  conversions. Done when the views of section 5 read.
- **P5. The life.** Citizens by share (Islanders 40%, Chichani 25%, Zeijani 12%, Izani-descended 10%, Andarū 8%,
  Hykkousoi 5%), the garrison, the planters; the night: Vothic electric light on the civic and the fort, oil lamps
  elsewhere, the Stack's windows lit from within. Done when the night view reads.
- **P6. The record.** `README.md`, `KNOWN_ISSUES.md`, `PORT.md`, the gallery entry, the hash into `PORT-BASELINE.json`;
  the Throne's notes corrected to the lore (`biomes/throne/NOTES.md`).

## 5. Views for the verify

| View | What it must show |
|---|---|
| Overview from the sea | the Stack with its pods, the horned roofs behind, the gold dome on the rise, the citadel, the quays, the volcano above all |
| The Stack at eye level | carved doors with Islander posts, a Hykkousoi pod grown over a gallery, the Sun painted on the gate |
| An Islander street | horned houses, one renovated purple with a gold crest, the carved posts |
| The palace from the forecourt | orange ashlar under purple render, the gold dome, the flying buttresses, the diamond gate |
| The harbour | the Islander dockyard beside Voth's stone quays and the bireme pens, the Hykkousoi mole |
| A plantation | dead Ranj rows, a coffee garden under bananas, the overseer's post, a Zeijani shrine in the kīpuka |
| Night | the fort and the Temple lit, the Stack's windows, the Hykkousoi quarter dark |

## 6. Open questions for the owner

1. **The Islander kingdom.** Its name, its hall, and whether a king or claimant still lives in the city under Voth
   (recommended: a king in name, received at the council pavilion, which gives the page a politics).
2. **The Hykkousoi quarter now.** Tolerated under watch (recommended: the League is Iziz's ally and Voth's rival, but
   the pilots are needed) or shut.
3. **The renovation rule's reach.** Vothic marks on the civic always and on a third of the Islander town's houses
   (recommended), or heavier.
4. **The plantations.** The Shim registry's plantation entries are reused (recommended; they do not exist yet, so Shim's
   P3 or this build's P4 writes them, whichever comes first) or Zey'danin's are Voth catalog entries of their own.
5. **The spice.** Temora stays the spice port and Zey'danin the mountain gate (recommended), or Zey'danin's new
   harbour has taken the trade.
6. **The model.** Change the point's type from village to city, and name the river or stream off the mountain.
