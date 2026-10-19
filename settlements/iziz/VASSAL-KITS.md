# Iziz's vassal cities: the shared contract for their kits

Two new kits build the architecture of Iziz's vassal cities: **Pylon** (`kits/pylon`, the arcology city round the
ruined Monolith; `kits/pylon/PLAN.md`) and **Talia** (`kits/talia`, the university and caravan city at the foot of the
eastern passes; `kits/talia/PLAN.md`). Both cities will also have Iziz Vernacular buildings standing among their own,
so this file holds what all three must agree on, and the governor's palace both cities share as a programme.

Owner's brief (2026-10-17): each city has its own architectural personality, but "Iziz Vernacular buildings should
not look wrong beside them", and the kits are "set up ahead of time not to clash with the structure of that kit".
Each city has a governor's palace "massed like the pic 'govpalace' but built in that city's style", with its interior
planned from the skill's palace notes (`painting-to-3d-world`, section 5h and `references/blueprints.md`).

## 1. One engine: the Vernacular's

Both kits are written on the Iziz Vernacular contract (`API.md`, "The Vernacular set"), not on a new engine:

- **Defs go through `VERN.def`**, with `tags.culture` set to `'pylon'` or `'talia'` (`VERN.def` already lets a def's
  own `culture` win over `'iziz-vernacular'`). Keys are prefixed `pyl_` and `tal_`. Then every placer that takes the
  Vernacular (`VERN.place`, `placeVern`, `placeNear`, Verge's IZV bundle, a `core/city` lot) places them too, and a
  mixed street is one list of keys.
- **Builders take the Vernacular's helpers** (`vn*`: frames, plinths, cornices, roofs, `vnWin`, `vnDoor`, `vnLamp`,
  stairs, verandas, yard props) and kit items (`v*`), and add their own on top, with their own prefixes (Pylon `py` /
  `pyn`, Talia `ta` / `tan`). Openings drawn with `vnWin` and `vnDoor` keep the same door and sill sizes in all three.
- **Seed blocks:** Pylon 9001-9399, Talia 9401-9799 (the Vernacular uses 7100-8079; the Ancients kit's 10100+ are
  taken). Named builders `buildPyl*` and `buildTal*`, each opening with `reseed(N+(o.v|0))`.
- **The bundle.** Verge already wraps the Vernacular and its Ancients core into one closure (`settlements/verge/
  build.py`, `IZV`). Lift that file list into one function both kits and Verge call (P0 in each plan), so a vassal city
  page is "IZV + one vassal kit" and nobody keeps a third copy of the list.

## 2. Rules so the three never clash

| Rule | Vernacular today | Pylon and Talia |
|---|---|---|
| Ground and front | origin at the plot centre on the ground, +z the front, nothing outside `w x d` | the same; stairs, awnings and canopies inside the plot |
| Plinth | `Y0` 0.35-0.6 m | the same for houses; civic plinths up to 1.5 m, their stairs inside the plot |
| Storeys | 3.0-3.4 m (middle), 4.0-4.6 m ground storey (rich) | houses 3.0-3.6 m; civic ground storey 4.5-6 m. Cornice lines fall within 0.5 m of the Vernacular's where the two share a street |
| Footprints | poor 8-10 m, middle 10-15 m, rich 23-28 m, civic 22-44 m | the same classes, so a lot drawn for one takes the other |
| Height bands | poor 5-8 m, middle 8-11 m, rich 16 m, civic 12-24 m | the same bands; only named landmarks (the Monolith, temples, the University's tower) go above them |
| Party walls | none: every Vernacular house is detached with a yard | every type is finished on four faces; row types take `o.ends` to close a run, so a Vernacular house can stand at either end |
| Lighting | electric light only on rich and civic (`vLit()`) | the same canon |
| Wealth tags | `poor`, `middle`, `rich`, `civic` | the same, plus `style` (each plan lists its styles) |

**Colour: one orange.** Iziz orange (`VPAL.orange`, `0xe07a2a`, and `VPAL.trim`) is the accent of all three: Pylon's
paint and Talia's trim draw from the same list, so a Vernacular fascia, a Pylon niche lining and a Talian arch band
are the same hue. The whites are never pure (Pylon `#EEEBE5`, Talia `#F4F1EA`) and sit one value step above the
Vernacular's sand plaster, so a Vernacular house beside them reads as warmer, not dirtier.

**Material bridges.** Each kit has a tier that shares the Vernacular's materials, so the transition is gradual:
Pylon's salvage tier is corrugate, Ancient panel and timber (`vCorr`, `vPanelB`, `vWood`), the Vernacular's own poor
materials; Talia's dense "orange quarter" takes terracotta hip roofs with short eaves and timber shutters, the nearest
Talian form to a Vernacular gable. Verdigris copper (`vCopperB`) is the rich and civic roof metal in all three.

**Where the Vernacular stands.** In both cities, the Izani are the governing class and the garrison: the Vernacular
gathers in an Izani quarter by the governor's palace and the barracks (rich and civic types), and scatters elsewhere
as single houses, taverns and workshops. A `core/city` zone carries a culture mix (each plan proposes one); the lot
filler draws a culture per lot from it before it draws a type.

**The mixed-street check.** Each kit sheet has a row that alternates the kit's types with Vernacular types at every
wealth tier, with an eye-level view; `verify.py --assert` checks it for overlaps like any row. Judge it at eye level
before calling a tier finished.

## 3. The governor's palace (both cities)

### 3.1 Massing, from the owner's picture

`govpalace.jpg` (the owner's folder `OneDrive/Pictures/krator/orange`) is a woven bamboo palace. Its plan is kept and
its material is not:

- a **raised terrace** (about 1.2 m) carrying everything;
- a **central hall block**, about 36 x 24 m, two storeys, both arcaded: an open loggia on the ground storey and a
  railed gallery above, under a broad low roof;
- a **great drum and dome** rising out of the middle of the block, with a small lantern;
- a **ring of seven round pavilions**: two large (about 14 m across, two storeys) at the front corners, two medium
  (about 11 m) at the rear corners, three small (about 8 m) on the flanks and the back, each an arcaded drum with a
  ribbed dome and a lantern, joined to the block at its edge;
- a **steep straight outside stair** up a flank to the upper gallery, and a low broad flight at the front;
- inside a walled forecourt with a gate: grounds about 70 x 56 m (the Vernacular palace is 42 x 36).

Each plan says how its city builds this (Pylon: white render and concrete, parabolic arcades, hex-lattice domes;
Talia: marble arcades, orange-tiled ribbed domes, chhatri pavilions, an imperial stair).

### 3.2 What the palace is for

A vassal city's governor is the Emperor's man in someone else's city: the Izani *sid'kiñ* (the Legion cant's word for
an Izani governor, LORE §6.3), a Roman provincial governor in his *praetorium*. The local power has its own seat
(Pylon's Salvagers' Guild, Talia's council and University) and comes to the palace to be received. So the palace has
four domains, not three:

1. **Ceremony:** the vestibule and the audience hall under the dome.
2. **Government:** the governor's chancery, the tribute office and the archive (Pylon's salvage tithe and assay;
   Talia's caravan customs).
3. **The city's door:** the council pavilion, where the city's own magistrates meet the governor without going
   deeper than the second threshold.
4. **Residence:** the governor's household, behind and above.

The principles from the four palaces already blueprinted (`settlements/voth/palace`, `settlements/iziz/palace`,
`settlements/longsong`, `settlements/xanadu/citadel`), and where each lands here:

- **Depth is rank.** Gate, forecourt (petitioners, the guard), front stair and loggia, vestibule with two guard rooms,
  audience hall, the governor's cabinet behind the dais, the private stair. A local magistrate stops at the council
  pavilion; an Izani officer reaches the hall; only the household passes the cabinet.
- **The ruler works in small rooms.** The audience hall is for show; the governor works in a cabinet of about 6 x 5 m
  behind the dais, with a secretary's room on one side and the private stair on the other.
- **Ceremony, government and residence touch at few doors.** The government side opens off the vestibule, not off
  the hall; the residence opens off the cabinet and the back court only.
- **Two routes, not one.** The outside stair to the upper gallery is the petitioners' and clerks' route to the
  chancery's upper floor: they never cross the hall. The front flight is ceremony's.
- **Service runs parallel and hidden.** A service court behind the block with a cart gate; the kitchen in the small
  rear pavilion (a round kitchen under a vented dome, as at Glastonbury and Fontevraud); a back stair from the
  kitchen to the upper floor.
- **Deep plans breathe through courts.** The block is 24 m deep: two light courts of about 5 x 5 m either side of the
  dome's drum light the hall's aisles and the rooms behind the loggias.
- **The great officers live where they work.** The garrison commander above the guard pavilion; the steward above
  the kitchen; the chief secretary above the chancery.
- **Religion is in-house.** A small household shrine of the orb and sun (the Izani signs, LORE §6.2) in a flank
  pavilion off the hall.
- **Bulk is bureaucracy and stores.** The terrace is hollow: the undercroft holds the archive, the tribute vault, the
  wine and food stores and the guard's armoury.
- **There is always a hidden way out.** Pylon: an Ancient service passage under the terrace towards the Monolith.
  Talia: a postern from the undercroft through the garden wall.
- **The palace talks to Iziz.** The dome's lantern is the signal room (the heliograph and, where the Empire still
  can, an Ancient set): a vassal governor's first duty is the Emperor's post.

### 3.3 The programme by floor (draft, for the owner's forks)

Decor levels as in the other blueprints: 0 bare, 1 plain, 2 fine, 3 rich, 4 sumptuous.

| Floor | Room | About | Decor | Note |
|---|---|---|---|---|
| Undercroft | archive | 12 x 8 | 1 | rolls, tribute registers, the census |
| | tribute vault | 8 x 6 | 0 | Pylon: assayed Ancient parts; Talia: customs silver and bonds |
| | stores, wine, cistern | 2 x 10 x 8 | 0 | under the service court |
| | armoury and guard cells | 10 x 6 | 0 | under the guard pavilion |
| | the hidden way | | 0 | from the cabinet's private stair |
| Ground | gate, guard lodge | | 1 | in the forecourt wall |
| | front loggia | 36 x 4 | 2 | the arcade; petitioners wait here |
| | vestibule and two guard rooms | 10 x 8, 2 x 5 x 4 | 3 | the second threshold |
| | **audience hall** under the dome | 14 across, two storeys | 4 | dais on the axis, galleries round it on the upper floor |
| | the governor's cabinet, secretary | 6 x 5, 5 x 4 | 3 | behind the dais |
| | chancery (front-right large pavilion and wing) | 14 across + 10 x 8 | 2 | clerks, tribute office, the seal |
| | **council pavilion** (front-left large pavilion) | 14 across | 3 | the city's magistrates; its own door from the forecourt and one door to the vestibule |
| | household shrine (flank pavilion) | 8 across | 3 | |
| | guard pavilion (flank pavilion) | 8 across | 1 | the duty guard, by the outside stair's foot |
| | kitchen (rear small pavilion), service court | 8 across | 1 | round kitchen; cart gate |
| | dining hall (rear of the block) | 12 x 8 | 3 | for receiving, between hall and kitchen |
| Upper | upper gallery (the outside stair's landing) | | 2 | the clerks' and petitioners' route |
| | chancery upper: records, chief secretary's lodging | | 2 | |
| | galleries round the hall's dome | | 3 | the hall seen from above |
| | **residence** (rear block and the two rear pavilions) | | 3-4 | the governor's suite (antechamber, bedchamber, bath, wardrobe), the spouse's suite, children and tutor, a loggia over the garden |
| | garrison commander (above the guard pavilion) | | 2 | |
| | steward (above the kitchen) | | 1 | the back stair arrives here |
| | guest suite for an Izani envoy (above the council pavilion) | | 3 | |
| Lantern | signal room | | 1 | heliograph, the Ancient set; a ladder from the galleries |

### 3.4 The forks (settled 2026-10-17: the owner took every recommendation)

The blueprint method asks these before drawing (`references/blueprints.md`, step 4). The first answer of each is the
one taken:

1. **The household:** the governor's kin only (recommended: an appointed official with spouse and children), or a
   fuller court.
2. **The city's door:** the council pavilion inside the palace (recommended: it keeps the city's magistrates at the
   second threshold, which is the politics of a vassal city), or the city's own council house elsewhere only.
3. **The garrison:** a guard pavilion in the palace and the barracks outside it (recommended: the Vernacular's
   `vern_guard_tower` near the palace), or a garrison in the grounds.
4. **Grounds:** about 70 x 56 m (recommended), or larger with a garden.

The floors are drawn on the shared generator (`settlements/voth/palace/blueprint.py`) as one sheet per
floor per city (`kits/pylon/palace/`, `kits/talia/palace/`), with a furniture manifest keyed to each culture's
catalog file.
