# The Iridescent Order's house at Ōpal-Phōrḍ: its second great house and house of studies, at the cataract's foot

A blueprint on the large-buildings method (`painting-to-3d-world`, `references/large-buildings.md` Part 1), on the generator the
Voth, Iziz, Longsong, Erewhon and Tempest blueprints share (`settlements/voth/palace/blueprint.py`), with Longsong's and the
House of the Tempest's Xanadu key maps and room programmes imported. The site and the town are `settlements/opal-ford/PLAN.md`
(sections 2b and 3, step OF1b); the Order is `settlements/iridescent/PLAN.md`.

**From the owner and the lore** (everything else here is *proposed*):
- The owner, 2026-11-16 and 17: the turquoise (teal) great monastery of Qiblai is **the Iridescent Order**; its head monastery,
  Rēnbō-Phāl, stands at the outlet of Lāiṭwāl's lake; its house in Lāiṭwāl is the Qiblai kit's `qb_monastery` in the Turquoise
  spoke's dress (`settlements/lightwall`).
- The owner, 2026-11-23: *"Opal phord will also contain the monastery HQ of the iridescent order, which we will need to
  design"*; asked, **"Both are big houses"** (Rēnbō-Phāl stays the head house; Ōpal-Phōrḍ holds the second great house), **"At
  the cataract"** (its own precinct at the fall's foot up the river from the town), **"~450, Qiblai Turquoise"**, **"Town first,
  then design"** (step OF1 kept the precinct clear: `OF.PRECINCT` in `targets/town/89zp-of-site.js`).

**The owner's forks, 2026-11-23** (asked before drawing; each changes whole floors):

| Fork | The owner's answer | What it set |
|---|---|---|
| What the house is for | **House of studies**: the Order's lowland seat and novitiate | the house of studies (sheets H1, H2): the novices' dormitories, refectory and kitchen, two lecture halls, the reading room, the college's colour library, the debate court; about 165 novices |
| How the precinct is laid out | **Kit block + stepped cells** | the kit's 52 m great monastery on the flats (sheets M1, M2, MR), its hall toward the river; 48 cells on four terraces down toward the gorge (sheet C) |
| Who heads it | **A prior under Rēnbō-Phāl** | the Prior in the block's back range; the Prismarch's Lodge kept for his visits on the way to Qiblai's councils |
| What crowns it | **Moonglass hall, gilt crown** | the Hall of the Bow under the kit's gilt crown; its third storey's back, the Gallery of the Bow, glazed in moonglass with a prism in each pane, facing the spray |

## What is here

| File | What |
|---|---|
| `floors/S0.png` | the precinct (480 x 545 m): the Gate of the Road, the Way of the Colours, the forecourt, the block, the Bow Terrace, the cell terraces, the house of studies, the outer ranges, the gardens, the orchard, the kora |
| `floors/M1.png`, `M2.png`, `MR.png` | the great monastery (the kit's block): ground, upper floor and the hall's gallery, the hall's third storey (the moonglass gallery) and the roofs |
| `floors/H1.png`, `H2.png` | the house of studies, ground and upper floor |
| `floors/C.png` | the cell terraces, drawn in place |
| `floors/G.png` | the outer ranges: the gate, the guest house and stable yard, the infirmary, the service court, the Prism Workshop |
| `floors/section.png` | across the river at the block's axis: the forecourt, the block, the Bow Terrace, the terraces' cuts, the gorge (heights x3) |
| `FURNITURE.md` | the manifest from the same data; the pieces the catalog lacks at the end |
| `iridescent_blueprint.py` | the rooms as data |

**Frame.** The site's u runs up the river toward the fall (right), v across it, v > 0 north-east away from the river (up),
metres: the town page's frame shifted, u = page z - 2860, v = page x - 300, so the precinct is `OF.PRECINCT` (u -280..160, v
-210..260). The fall stands at u 240, 80 m beyond the sheet's right edge from the cells; the river's north-east edge at about v
-255. The kit block's sheets are in its own frame (local u from the gate to the back range, v across), as the Tempest's: the block
stands with its gate north-east and its hall toward the river, site u = 50 + local v, site v = 26 - local u (the block's square
at site u 22..78, v -8..48).

## The plans studied, and what they teach

- **Sera Je and Drepung** (the Gelug colleges of Lhasa). A great monastery is a federation of colleges, each with its own
  assembly hall and kitchen; the novices debate in a walled, tree-shaded court every afternoon, clapping their points home.
  Lesson: **the school is its own house with its own hall, kitchen and court; the debate court is open and green.**
- **Tashilhunpo.** The tsuglagkhang (the great assembly hall) at the heart, the colleges and the residences round it, the
  monks' quarters climbing behind. Lesson: **the assembly is the one great room; everything else is cells and service.**
- **Paro Taktsang** (the Tiger's Nest) and the **Meteora**. Cells and chapels cut into a cliff beside a fall of water or a
  drop, reached by stairs that are themselves the pilgrimage. Lesson: **the way down to the water is the kora; the cells open
  off its landings.**
- **The plan of St Gall** (c. 820, the Benedictines' ideal). The church and cloister at the centre; outside them the novitiate
  and the infirmary as twin houses, the guest house and the pilgrims' hospice by the gate, the workshops, stores and the
  servants' quarters on the edge. Lesson: **the outer ranges by the gate keep the world out of the cloister: guests, the sick,
  the trades and the novices each have their own house.**
- **The Potala's Shöl.** The village of servants, printers and stores at the foot of the palace. Lesson: **the lay servants
  and the trades live at the edge, by the road.**

## The principles the blueprint applies

- The house faces the bow: the watcher has the sun behind him, so the Hall of the Bow, its gallery and the Bow Terrace face
  south-west from the north-east bank over the plunge pool, where the morning bow stands in the spray (the iridescent plan's
  "office said facing the falls while the bow stands in them").
- Depth is devotion: the road, the Way of the Colours between its eight chortens, the forecourt, the Gate of the White Light,
  the cloister, the Hall of the Bow, the Gallery of the Bow at the top and back (Sera, Tashilhunpo).
- The school is a second house (Sera, St Gall): the novices sleep, eat, study and debate in it and enter the great monastery
  for the offices.
- The kora is the stair (Taktsang): from the Bow Terrace down the Spray Stair past every terrace of cells to the pool's ledge,
  over the Bridge of the Spray and up to the chorten on the far lip, and back.
- The world stops at the gate (St Gall): the guest house, the infirmary, the service court and the Glaziers' workshop stand by
  the Gate of the Road; the lay servants live at the edge.

## Who lives where (*proposed*; the owner's ~450)

| Who | How many | Where |
|---|---|---|
| The Prior | 1 | the block's back range (M2) |
| The masters of the house (the Master of Colours, the chant-master, the sacristan, the porter) | about 8 | the block's back range and the front cells |
| The monks | about 100 | 49 cells in the block (M1, M2), 48 on the terraces (C) |
| The masters of the school, the Novice-master | 9 | over the college's library; by its gate (H1, H2) |
| The novices | about 165 | the college's three dormitories (H2), five years before their vows at Rēnbō-Phāl |
| Lay servants | 60, with their households in the houses at the edge and in the town | the Lay Servants' Houses (G) |
| Guests | up to 60, and the head house's monks going down to Qiblai (four cells in the block) | the guest house (G) |
| The Prismarch of the Turquoise spoke, on his visits | 1 and his attendants | the Prismarch's Lodge (S0) |
| Two Glaziers from Lāiṭwāl | 2 | the Prism Workshop (G), lodging in the guest rooms |

## The sheets in one table

| Sheet | What | Rooms |
|---|---|---|
| S0 | the precinct | 18 |
| M1, M2, MR | the great monastery (the kit block, Turquoise dress) | 26, 24, 19 |
| H1, H2 | the house of studies | 13, 10 |
| C | the cell terraces | 16 |
| G | the outer ranges | 19 |

## Finishes and the dress (*proposed*)

The block is `qb_monastery` in the Turquoise spoke's dress (QSPOKE 4, as the house in Lāiṭwāl), the gilt crown on the hall. The
house of studies and the outer ranges in the Xanadu kit's plain white and turquoise-trimmed ranges. The Gallery of the Bow is the
Glaziers' moonglass (the `kits/tungang` gz set: milky panes in turquoise lacquer frames), a crystal-opal prism in each pane; the
Court's Prism and the college's Prism Pillar the same crystal. The Way of the Colours' eight chortens and the eight colours of
the prayer flags; inside, the colour charts on silk and the white Chapel of the Unbroken Light.

## Lore

- **The house of studies** (*proposed*): the Iridescent Order schools its novices here, nearer Qiblai and Kirstabal than
  Rēnbō-Phāl, for five years (optics, the colours, the reading of the bow, the Song and the Decree), and sends them up the valley
  for their vows. Its novices debate in the afternoons, as at Sera.
- **The office** (*proposed*): at sunrise on the Bow Terrace in the dry months, in the Gallery of the Bow in the wet; the bow
  stands in the spray with the sun behind the watcher. The colours the prisms throw down the light well are read like the Beacon's
  lamp.
- **The Prismarch's Lodge**: the Prismarch of the Turquoise spoke stops here on his way down to Qiblai's councils.

## Assumptions and open points

- **The ground.** The town page's bank is level from the forecourt to the gorge's lip (the flats at about 11 m over the water at
  the block's axis, more toward the fall). The page grades the house's platforms into it (`OF.HOUSE` in
  `targets/town/89zp-of-site.js`, `ofH`): the Bow Terrace levelled at its middle's height, the four cell terraces 2.2 m apart
  below it, the pool's ledge 10 m below it and some 2.5 m over the water (3 m a terrace would put the ledge under the river).
  The forecourt is not levelled; the block stands on the kit's stance.
- **The block's heights** are the kit's (`qb_monastery`: the ranges two storeys, the hall three, the crown); the gallery's
  moonglass wall is the hall's third storey's back wall, above the back range's roof.
- **The kora's far side** (the Bridge of the Spray below the pool, the chorten on the south-west lip) is off the precinct and
  across the river: it goes on the page as a span and a chorten (no core/city instance).
- **The numbers** (110 monks, 165 novices, 60 lay servants, 60 guests) are proposed under the owner's ~450; the Order's record in
  `XAN_TUNE` (a settlement under Ōpal-Phōrḍ, `T.opalford`) waits for the sim session (`settlements/iridescent/PLAN.md` step I4).
- **The new pieces** (FURNITURE.md, NEW): the prism stand, the moonglass screen, the colour-chart rack, the lens-grinding wheel and
  the Order's banner, beside Longsong's and the Tempest's still owed.
- **Next (step OF1b continued):** the records: the precinct's ground cuts, the block (`qb_monastery`, Turquoise) and the ranges as
  hosts on the town page's core/city instance or a second instance over the precinct, the terraces' cells, the kora, the bridge;
  then the interiors from these sheets.
