# Erewhon's citadel: the palaces as built, against the references (2026-11-09)

The brief (`refs/citadel/STYLE.md`): everything in the citadel but the two Pleasure Domes, Moorish and Mughal, psychedelic in
its own way. What is built (`kits/xanadu/src/78l-xa-moorish-data.js`, `78m-xa-moorish.js`, `78n-xa-citadel.js`; the rooms in
`kits/interiors/sets/xanadu-citadel.js`; the sites in `targets/erewhon/87-er-layout.js` CIT_SITES), what each view shows and how
it compares with the five references. Screenshots at deviceScaleFactor 2 (2560 x 1600, Chromium with SwiftShader, no GPU),
`?interiors=1` so the rooms are furnished, the page's panels hidden: `views/` next to this file. The textures are the library
stand-ins for the sets owed in `core/materials/PROMPTS-NEEDED.md` section 41 (`../KNOWN_ISSUES.md`), so the patterns are
the right kind in the wrong hand: judge the geometry and the colour plan, not the motifs.

## The buildings

| Def | Blueprint | Rooms | What it is |
|---|---|---|---|
| `xa_cit_palace` | E1, E2a, E2b | 46 | the Sultan's palace: the gate iwan, the forecourt and its long pool, two ranges of two storeys, the palace block (the Hall of Gifts, the Hall of Audience, the Room of the Vizier, the state dining hall), the Sultan's floor (day room, Great Bedchamber, bath, dining room), the roof terrace and the red sandstone block under the twin turquoise domes; the Ramp of the Sultan, two laps round a 16 m square, from the Hall of Gifts to the bath and on to the roof |
| `xa_cit_vizier` | E5a, E5b | 13 | the Grand Vizier's palace: the pool garden, the tiled loggia, the Divan under a star ceiling, the Hall of Petitions, the clerks' hall in a haft-rangi vault, the archive; his study, reception and family above; Majorelle cobalt outside |
| `xa_cit_treasurer`, `xa_cit_chancellor`, `xa_cit_mines` | E6 | 13 each | the great officers' houses: Moorish dars round a fountain court with porticoes of paired columns, the bureau below (the Hall of Ledgers, of Seals, the assay room), the family above |
| `xa_cit_envoys` | E6 | 13 | the envoys' house: three suites round its court |
| `xa_cit_barracks` | E6 | 13 | the gate company's house round a parade court, plain |
| `xa_cit_temple` | E6 | 5 | the court temple: the great iwan, the prayer hall under a star ceiling and a turquoise dome, the drum circuit, the priests' rooms, the vestry |
| `xa_cit_kitchens` | E6 | 3 | the citadel kitchens, the ice house, the stables, plain |

All hollow and walkable: 132 rooms, every floor reached from the doors (`tools/ix_reach_audit.js` on Erewhon with
`?interiors=1`: 133 floors of the nine, 0 unreached; the sets sheet `verify.py --sets --assert --query set=xanadu-citadel`: every
room reached and furnished, the residences pass). 160 doors (arched; a leaf in core/door wherever the door is not an
opening, unlocked), 621 windows (arched, clear glass, a jali card in front of it in the state rooms), 19 flights and ramp
runs, 33 star ceilings, 20 painted or tiled vaults, about 2,000 muqarnas cells.

## The views (Erewhon's presets)

**The combined rebuild (2026-11-10)** shot the four again with `?interiors=1` at deviceScaleFactor 2, saved beside the first ones in
`views/rebuild-2026-11-10/`. What changed: the rooms are furnished now. Before the rebuild, Erewhon's interiors pass held every
placement inside the citadel wall (no rooms, no furniture); it now leaves the citadel's own buildings and both Pleasure Domes to
their builders and items, which is how the citadel sessions shot them. The Hall of Audience and the Divan show the catalog's xanadu
court pieces (tables, chairs, a carpet, the dais furniture) where the first shots had one table. The architecture is unchanged.
The gate iwan's preset had to move then: with the palace 2 m north and the Pleasure Dome pinned against its lot, the Dome's
terrace stood 0.3 m before the iwan's face and 18 m above its threshold, and no shot of the hood could be framed.

**The Golden Way built (2026-11-10, later the same day; `views/golden-way-2026-11-10/`).** The owner chose the Golden Way as a
descending court (`PLEASURE-DOME.md`, "The Golden Way"): the Dome's North Door moved 4 m in to its north face, and the slot
between the palace's curtain and the Dome's face became the Way, with a gate court open to the sky before the iwan. The preset
"Citadel — the gate iwan" stands in that court again, 4 m before the iwan's face at eye height, looking up: the muqarnas hood is
framed whole, its six tiers in turquoise tile and gilt, the gold ring round the pointed opening, the pishtaq's tile borders and
the gilt band over it, the roundel at the top of the frame. Against 04 the shortfalls are those listed below (larger, rounder
cells; no radiating star at the crown; the stand-in tile). A new preset, "Citadel — the Golden Way", looks down the Way's lower
flights from the turn.

### The Hall of Audience (`views/Citadel_-_the_Hall_of_Audience.jpg`) against 01 (Akbar's gilt ceiling)

Follows: the Mughal state room's plan of the rule. A star-polygon ceiling of eight points modelled in relief (the star hangs
lowest, the darts and the outer kites step up to the field), its panels framed in raised red-brown ribs as in 01, a gilt field
round it and a gold boss; the walls red sandstone to the dado, the field above pietra dura, a gold band under the ceiling; a
cusped (multifoil) Mughal arch over the door to the state dining hall; white marble underfoot; the catalog's court furniture.

Not yet: 01's panels are gold on lapis and white-ground floral; the stand-ins are a teal lattice (the field) and an
opus-sectile tile (the darts), so the ceiling reads as tile, not paint and gilding, until `mughal-gilt-ceiling` and
`pietra-dura` arrive. 01's ceiling is a vault rising to the star; ours is flat with the star hung under it. The room has no
dais and no Great Divan (not in the catalog); no jharokha balcony over it from the day room.

### The gate iwan (`views/Citadel_-_the_gate_iwan.jpg`) against 04 (the turquoise muqarnas portal)

Follows: the iwan as 04 frames it: a pishtaq in tile panels and borders, a pointed opening with a gold ring, and a muqarnas
hood modelled in tiers of cells (six tiers, staggered, alternate tiers in gilt, each cell a niche facing the middle of the
opening), standing on the springing over the tiled recess; the jali star window over the door is in the recess.

Not yet: 04's cells are small faceted pieces, each its own tile panel, rising to a radiating star at the crown; ours are
larger rounded hoods, fewer, and the crown has a boss, not a star. The stand-in tile (zellige-lotus-teal, haft's arabesque
for the frame) is busier and less turquoise than 04's. The view is from the six-metre gap between the gate and the Pleasure
Dome's wall, so it looks almost straight up into the hood.

### The Divan (`views/Citadel_-_the_Divan.jpg`) against 01 and 05

Follows: the council hall in the state manner: the same star ceiling over a long room (two stars along it), red sandstone
dado, the pietra-dura field, jali windows with cusped heads down the outer wall, the catalog's table, benches and seats for
the council.

Not yet: as the Audience, the textures. The windows' reveals show the house's cobalt outer wall (the wall's core) at the jamb;
a reveal lining in sandstone is owed.

### The Treasurer's court (`views/Citadel_-_the_Treasurers_court.jpg`) against 03 (the Moroccan court)

Follows: the closest of the four. Horseshoe arches carried on slender paired marble columns with gilt capitals and stucco
imposts, the arcades' heads in a band; a fountain on the axis in an octagonal turquoise basin with a marble bowl, the rill
running from it to the door; zellige star paving framed and crossed by marble walks; a zellige dado round the court with the
ochre yeseria field above it, as 03; green-tiled eaves over the court; arched windows with jali on the upper storey; the
Hall of Ledgers' door a cusped arch.

Not yet: 03's arches are deeply carved stucco (the stand-in plaster is flat and its colour is the kilim band's brown on the
arch faces); 03's spandrels and the band over the arches are carved, ours are flat skins; the walls above the dado are plain
ochre where 03 carries carving everywhere (the yeseria set will carry it). No calligraphy band.

## What the rest of the citadel does and does not do yet

- The Peacock Room's banded vaults (02) are in the private rooms (the Great Bedchamber, the state dining hall, the gallery,
  the guest suites, the Vizier's study): pointed barrels with gilt ribs. Their stand-in (a brown kilim band) is the weakest of
  the stand-ins: the rainbow is the texture, owed as `peacock-band`.
- The Isfahan arcade (05) is the loggia of the Vizier's garden and the chancery: haft-rangi barrels with sandstone ribs, a
  sandstone dado. 05's vault is a run of domical bays, not one barrel.
- The Golden Way (2026-11-10, `kits/xanadu/src/78o-xa-golden-way.js`): the court that descends 18 m from the Dome's North Door
  to the gate iwan and the Harem Postern, in the slot between the two buildings; the narrowing to black, white and gold (rule 5)
  is now a passage: by height, the palace's red sandstone under white marble and cusped arches at its foot, black and white
  marble under pointed arches in the middle, the Dome's bands, paving, runners and voussoirs above (`PLEASURE-DOME.md`,
  "The Golden Way").
- Patterned light (rule 4): the jali cards are cut, but nothing casts their pattern (no projected light in this renderer);
  the lamps in niches are not placed.
- The exteriors keep the kit's looks brought into the style: the palace's red sandstone curtain and towers, its gate iwan, the
  white marble base on a sandstone plinth, the red sandstone upper block under the maroon frieze with gold roundels, the twin
  turquoise domes, chhatris; the Vizier's cobalt house with a tiled pishtaq over its loggia; the dars whitewashed or ochre on
  zellige with carved portals; the temple in white marble under a turquoise dome with four white minarets.
