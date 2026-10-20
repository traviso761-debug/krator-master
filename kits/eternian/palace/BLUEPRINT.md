# The Sanctum of the True Heirs: a blueprint

The fifth palace blueprint, on the method of the others (`settlements/voth/palace/BLUEPRINT.md` holds the study of
Versailles, Topkapı, Heian, Bangkok, the Kuge-machi and Westminster; `settlements/iziz/palace/BLUEPRINT.md` adds the
Palatine). This one adds **the Forbidden City under the Qing**, and turns it on end.

The brief (the owner, 2026-10-20): the Eternal State's capital stands round a new Ancient arcology, about the volume
of Plymouth but taller: a tapering drum on a six-pointed podium; three large arches at the heads of three of its six
stairs, forming a triangle, and from each a ramp or staircase spiralling counterclockwise up to the next arch and its
balcony, thirty arches in all; smaller entrances at the heads of the other three stairs, each entrance with a
ceremonial meaning. It was built as a **live/work arcology** for a hundred thousand and has
been **retrofitted as a forbidden city**, now the inner sanctum of the True Heirs (`LORE.md` §6.19). Faces, both the
electronic (the Ancients' terminals) and the sculptural, onyx screens and Gothic windows feature heavily.

## What is here, and what is built

| File | What |
|---|---|
| this file | the study, the principles, the ladder by height, the gates' rites, the arches' program |
| `kits/ancients/targets/coil/` | **built** (2026-10-20): `dist/coil.html`, the arcology as the Ancients built it (west) and as the Heirs keep it (east) |
| `8aq0-coil-plan.js` | the host: the podium, the ridges and stairs, the six entrances, the three staircases and their arches and balconies, the crown, as records (`[G data]`, KRAND) |
| `8aq1-coil-sanctum.js` | this blueprint's program as deltas by id: what each gate and arch is, the onyx, the tracery, the heads, the faces, the wall and moat, the colossus (`[G data]`) |
| `test-coil.js` | the node test: determinism, ids, the volume against Plymouth's, thirty arches, the triangles, the flights' slopes, closed eyes |

Floor sheets (`floors/*.png` on `settlements/voth/palace/blueprint.py`) and a furniture manifest are the next step:
they wait on the owner's reading of the ladder below.

## The form (the owner's four pictures, 2026-10-20)

- **The podium**: a six-pointed star, filleted, 690 m point to point, in three stepped tiers (0, 20, 34, 48 m) that
  converge on the drum. The drum rises out of it through a concave skirt: the two are one mass.
- **The ridges**: each of the six points runs up as a ridge carrying a grand stair, 2 m at the foot to a landing at
  152 m before an entrance in the drum.
- **The entrances**: on the south, north-west and north-east points (a triangle), three **great arches**, 56 m wide and
  60 m to the crown, framing large plate glass; on the other three, **small entrances** 16 m wide.
- **The drum**: 208 m in radius at the podium, tapering to 80 m at 660 m; a rim and a lantern on top (the fourth
  picture's hollow drum). 45.3 Mm3 in all, Plymouth's 45.8 within 2%, at 2.5 times its height.
- **The staircases**: from each great arch a staircase spirals **counterclockwise** round the drum, a sixth of a turn a
  flight, up to the next arch and its balcony: nine flights and nine arches each, to about 560 m. Thirty arches in all,
  every one on one of the star's six axes, and at every landing level the three staircases' arches are a triangle
  again. Each arch is a deep bay: a prominent frame proud of the wall, a terrace inside, the glazing at the back, and a
  **balcony** in front where the flights land.

## What the Forbidden City adds to the study

The Forbidden City is the palace of a state run on paper by a small ruling caste of another origin: the Qing were
Manchus over a Han bureaucracy, as the Heirs are over the Eternians. What it teaches:

1. **A ladder of gates and courts, each smaller and more private than the last, on one axis.** Tiananmen, the Meridian
   Gate (where edicts were proclaimed), the Gate of Supreme Harmony, the three great halls on their terrace, the Gate of
   Heavenly Purity, the inner court. Here the axis is vertical: **height is rank.**
2. **The outer court is ceremony, and it is nearly empty.** The Hall of Supreme Harmony was used a few times a year;
   its court held ninety thousand for an enthronement and nobody the rest of the year. Emptiness is the display. The
   Heirs are about a thousand: their courts are kept almost empty, and the scale comes from that.
3. **The state was run from small rooms.** The Qing emperors moved out of the great halls into the Hall of Mental
   Cultivation; the real government was the Grand Council, a row of modest offices beside the Gate of Heavenly Purity.
4. **Behind the screen.** The dowager empresses governed "from behind the curtain": an audience addressed a screen with
   someone behind it. Here, a proxy in a white closed-eyed mask speaks for a Withdrawn Elder from behind onyx, or a
   bronze face on the wall answers.
5. **The caste kept its own rite.** The Palace of Earthly Tranquility held the Manchus' shamanic sacrifices, which the
   Han court did not share. Here, the Hall of the Call.
6. **The retired keep a palace of their own.** Qianlong built the Palace of Tranquil Longevity, a miniature of the whole
   sequence, for his retirement. Here, the Withdrawn's palace fills the top of the spiral.
7. **The ancestors are in the palace.** The Hall of Ancestral Worship stood inside the walls, beside the living.
8. **Gates have meanings.** The Meridian Gate for edicts and triumphs, the Gate of Divine Prowess at the back by which the
   palace women left, the side gates by rank. Each door is a rite.
9. **A wall, a moat and corner towers** closed it, and the Imperial Household Department, a bureaucracy of thousands,
   ran it: the household is a town under the court.

## The ladder in one table

| Height | What | The Qing analogue |
|---|---|---|
| 0 | the moat and the outer wall on the podium's lowest deck; at each point a pylon gate where the stair meets the moat | the moat and the wall |
| 0-34 | the podium: the Household Department (stores, kitchens, workshops, the bondservants' quarters) below; the Halls of Petition above, where the talking heads hang on the walls | the Imperial Household Department, the outer offices |
| 48 | the Outer Court: the podium's top terraces, paved, formal, empty | the courts of the three great halls |
| 2-152 | the six stairs, each a Spirit Way of heads on the parapets, a Face Stone down the middle (the south in gold) | the Imperial Way and its carved stone |
| 152 | **the three great halls in a triangle and the three small doors** (below) | the three great halls on their terrace; the Meridian Gate and the side gates |
| 152-560 | **the three staircases**, counterclockwise, the court's own streets: an Heir climbs from a great hall to the State, the lineages and the Withdrawn without passing a human door | the covered ways of the inner court |
| levels 1-3 | nine arches: **where the State is run**. The Gate of the Closed Eye, the Council of Wardens, the Hall of the Screen, Seals, the Hall of the Call, Abstinence, the Hall of Ancestors, Records, the Offices of the Valley and the Sea | the Gate of Heavenly Purity, the Grand Council, the Hall of Mental Cultivation, the Hall of Union, the Palace of Earthly Tranquility, the Hall of Ancestral Worship |
| levels 4-6 | nine arches: **the lineage courts** of the four metals | the Six Eastern and Six Western Palaces |
| levels 7-9 | nine arches: **the Palace of Tranquil Longevity**, the Withdrawn's: its gate, the Hall of the Withdrawn, their pavilions, the Sealed House (two arches blind behind pierced bronze), the Pavilion of the Last Light | the Palace of Tranquil Longevity; the house nobody names |
| 660 | the crown: the lantern kept lit, and the **colossus**, a titanium face with its eyes closed, 44 m, looking south over the capital | (none: the Heirs' own) |

## The six entrances and their rites

The three great halls of the Forbidden City stand in a line on one terrace; here they stand in a triangle at the heads
of three stairs, and each begins a staircase. The three small doors between them are each kept for one rite.

| Point | Entrance | Rite |
|---|---|---|
| south, on the axis | **The Hall of Supreme Accord** (great) | An Heir comes up the Imperial Way and in by it twice: at accession, and at withdrawal, to be carved. Edicts are read from its landing. Its staircase climbs first to the State |
| north-west | **The Hall of Middle Accord** (great) | Toward Farport. An Heir is robed and waits in it before a rite; the sea's tribute is received in it |
| north-east | **The Hall of Preserved Accord** (great) | The banquets, and the palace examination's last paper. Once a year the Heirs go out by it to plough the first furrow (the Qing emperor's ploughing at the Altar of Agriculture) |
| south-west | **The Gate of the Valley** (small) | The Restorers go out by it for the Valley and come back by it. Those who do not come back are veiled in the gallery |
| north | **The North Gate** (small) | The dead leave by it, and it opens for nothing else |
| south-east | **The Gate of Petitions** (small) | The human city's. The examination's graduates are named in it, and petitioners climb to it to address the faces |

## The retrofit: what the Heirs did to the Ancients' building

The building is **kept, not patched** (the owner): polished, its cyan alive where the Machine Talkers have woken a
circuit (a fifth of the balconies' runs), nothing replaced that could be kept.

- **Onyx in bronze tracery.** Nobody can make the Ancients' glass, so where a plate-glass wall was lost the Heirs filled
  the opening with bronze: mullions and transoms, two pointed lancets under the round head and an oculus between them
  (the Gothic window, arrived at by masons copying a machine civilization by hand), glazed in thin onyx that glows when
  the cyan behind it is lit. Every hall of the State is onyx; some lineage courts kept their glass.
- **The Sealed House** is blind behind a close grid of pierced bronze, and its heads are veiled.
- **Faces, sculptural.** A faceted head over every arch in its lineage's metal, heads at every jamb, an ancestor on a
  plinth in every hall, the gallery of heads in the Hall of Ancestors (stone for the human ancestors' row, veiled heads
  among the rest), a face in relief on every door, the Spirit Ways, the Face Stones, the pylons' heads, the ring of heads
  on the crown and the colossus. Closed eyes throughout: the city is mostly the dead.
- **Faces, electronic.** The Ancients' terminals flank every entrance and hang in the Halls of Petition, the Hall of the
  Screen and the Hall of the Call, framed in bronze. One in four or five answers deranged.
- **The sign** on banners at every entrance and on the podium: a gold face with its eyes closed on black, green
  highlights.
- **The forbidden city's edge**: the wall on the podium's lowest deck, six pavilions in its re-entrant corners with
  fish-scale metal roofs, and the moat round the star.

## Finishes by decor level (for the sheets to come)

- **Sumptuous (4):** the halls of the State and the Withdrawn: onyx and alabaster lights in bronze, the Ancients' white
  panel polished, cyan behind the stone, the gallery's metal heads; circuit-maze brocade hangings; no gilt beyond the
  heads and finials.
- **Rich (3):** the lineage courts: the same, their own metal on every face and rail; celadon tile where a floor is new.
- **Fine (2):** the Council, the Records, the offices: the Ancients' panel, bronze screens, paper in racks, the tube
  heads.
- **Plain (1):** the Household Department: lime, grey tile, a mask over every door.
- **Bare (0):** the stores and the sealed floors.

## Open points

- The arcology's name, the Ancients' and the Eternians' (the Coil is a working name), and the capital's site.
- Floor sheets for the arches' halls and the podium's departments, and the furniture manifest (the catalog has no
  Eternian set yet: `kits/eternian/PLAN.md` §9).
- `eternian` is not yet a culture in `core/tags` (the plan's P0): the Sanctum's records carry it and the audit counts
  them as unknown until it is registered.
- The owner's four reference pictures are not in `kits/eternian/refs/` (they were pasted into the conversation only).
