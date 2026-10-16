# Erewhon's citadel: the Sultan's Palace, the Pleasure Dome and the machinery of state

A blueprint on the method of the Voth, Iziz and Longsong ones (`settlements/voth/palace/BLUEPRINT.md` holds the
palace study). The brief (owner, 2026-10-16): the area enclosed by Erewhon's citadel wall, since that pulls in the
Pleasure Dome and the Vizier's palace. The Sultan's palace is a residence and a diplomatic building; the Pleasure Dome
is a Topkapı-style harem palace with feasting rooms, baths and every decadent pleasure gold can buy; the Vizier's
palace and the wealthy houses inside the wall hold the rest of the machinery of state; the military keeps most of its
staff in the garrison elsewhere in town.

Decisions taken with the owner: the buildings are **enlarged inside the existing wall** (the palace curtain 110 x
90 m, the Dome's precinct 105 x 110 with wings, the Vizier's palace 44 x 54, the houses about 36 x 36; the wall and
the 8 m garden grid stay); the Dome's household is **full Ottoman** (the Sultan's mother rules it, consorts, favourites,
concubines and their school, eunuch chamberlains, the princes in a gilded cage, a Golden Way to the Sultan); the three
houses are the **great officers' residences and bureaus** (the Treasurer, the Master of Mines and Mints, the Chancellor
of Seals and Provinces); envoys are **received in the palace and lodged in an envoys' house** inside the wall.

## What is here

| File | What |
|---|---|
| `floors/section.png` | south to north along the axis: gate, First Court, the Dome, the Golden Way, the palace |
| `floors/E0.png` | the citadel: the wall polygon, the courts, every building's footprint |
| `floors/E1.png`, `E2a.png`, `E2b.png` | the Sultan's Palace: ground, the second storey of the white base, the ochre block under the domes |
| `floors/E3.png`, `E4.png` | the Pleasure Dome: ground and upper |
| `floors/E5a.png`, `E5b.png` | the Grand Vizier's palace: the Divan and chancery; his house above |
| `floors/E6.png` | the officers' houses, the envoys' house, the barracks, the court temple, the kitchens |
| `FURNITURE.md` | the manifest on the Xanadu court set, the missing pieces at the end |
| `citadel_blueprint.py` | the rooms as data in the Erewhon page's world coordinates; runs on the Voth generator |

Frame: world x east, -z north, metres, as `targets/erewhon/87-er-layout.js` has them; the wall is `CIT_POLY`, the
buildings sit at the `CIT_SITES` targets, enlarged. A room on a sheet is therefore already placed in Erewhon.

## What the references teach here

Topkapı again, but the whole of it this time: four courts in a ladder (the public first court with the services,
the second with the Divan and the kitchens, the third with the audience chamber and the treasury, the fourth with
the kiosks and gardens), the harem as a palace of its own hung off the side of the second and third courts, entered
by one door past the eunuchs, with the Valide at its heart and the Golden Way as its spine. And the Palatine lesson
from Iziz: the great officers live where they work. Erewhon's citadel is the same ladder bent round its hill: the
gate and the First Court with the guard; the Avenue up the east side to the Second Court before the palace gate,
with the Treasurer's and the Chancellor's doors on it; the palace as the third court; the Dome as the harem beside
it, joined by the Golden Way.

## The principles the blueprint applies

1. **Residence and diplomacy, not government.** The Sultan's palace holds the audience, the gifts, the letters, the
   state dining and the Sultan's own rooms. The Divan sits in the Vizier's palace; the ledgers, the seals and the
   mines in the officers' houses. The Vizier climbs to the Room of the Vizier each morning.
2. **The Sultan is carried.** He weighs what four bearers can lift and no more, so the palace has the Ramp of the
   Sultan, a broad spiral for the litter, in place of a state stair; the litter house and the bearers' hall sit at its
   foot; the Harem Postern, the Golden Way and the Dome's north door are litter-wide; a hoist takes him from bath to
   bed; the Great Divan is a reinforced couch with its own steps; he is shown to the court from the Loggia of
   Appearances on a couch.
3. **The Dome is the harem.** One garden gate for the feasts' guests, one north door for the Sultan past the eunuchs'
   court; the Valide's court at the west heart with the consorts and the hospital beside it; the favourites above;
   the concubines' dormitories and school east by the baths; the princes' cage in the north-west corner behind
   gilt lattice; the great hall under the dome for the feasts, the musicians' box and the Sultan's lattice box in its
   gallery; the confectionery behind.
4. **The machinery of state in houses.** The Vizier's palace: Divan Hall, petitions and the tax farmers, the long
   clerks' hall of the chancery, the archive; above, his study and his family. The Treasurer's house: the hall of
   ledgers, the strongroom, the tax farmers' room. The Master of Mines: the assay room, the bureau, the mint's
   counting room. The Chancellor: the seals, the provincial clerks, the archive. Each with the family upstairs.
5. **The guard is a gate company.** The barracks by the citadel gate holds the company that keeps the gate, the
   palace doors and the Dome's walls; the army's staff is in the garrison in town, as the owner has it.
6. **Gold where the Sultan looks.** Sumptuous in the audience, the Sultan's rooms, the Dome's hall, the Valide's
   court and the cage; rich in the officers' houses and the envoys' house; the citadel's kitchens, stables and the
   guard plain.

## The floors in one table

| Sheet | Where | What it holds |
|---|---|---|
| E0 | the citadel | gate, First Court, barracks, the Master of Mines' house, the Avenue, Second Court, the Dome's precinct, the Golden Way, the palace, the Vizier's palace and pool garden, the envoys' house, the court temple, the kitchens, the Treasurer's and Chancellor's houses, the gardens |
| E1 | palace, ground | gate iwan, forecourt and long pool, guards, the harem postern, kitchens, litter house, servants, guard hall, chancery of letters, treasury of gifts, Hall of Audience, Hall of Gifts, Room of the Vizier, the Ramp, state dining hall, the steward, the curtain walk |
| E2a | palace, second storey | the day room, the Great Bedchamber, the bath, the Sultan's dining room, wardrobe, the cooks', bearers' and servants' dormitories, the guest apartments of state, the treasury of gifts above |
| E2b | the ochre block | roof terrace, Loggia of Appearances, Gallery of Gifts, Kiosk of the Domes, the Ramp's head |
| E3 | the Dome, ground | garden gate, chahar bagh and pool, the Hall of Feasts, musicians, kitchens and confectionery, hospital, consorts, the Valide's court and apartments, the cage, the baths, concubines' dormitories, school, eunuchs' court and dormitory, the north door, the harem treasury |
| E4 | the Dome, upper | the hall's gallery and boxes, the favourites, the Valide's upper rooms, the cage above, the baths' rest rooms, the Mistress of the Harem, the roof kiosks |
| E5a | Vizier's palace, ground | pool garden, loggia, Divan Hall, petitions and the tax farmers, the chancery's clerks' hall, archive |
| E5b | Vizier's palace, upper | upper loggia, the Vizier's study and reception, family apartments, the archive's upper room |
| E6 | the rest | the three officers' houses (assay, mint, ledgers, strongroom, seals, clerks), the envoys' house, the barracks, the court temple, the kitchens, ice house and stables |

## Finishes

The kit's own: the Sultan's palace in whitewash on a dressed plinth with the ochre block above, jharokhas with jali,
the maroon band with gold roundels, gilt roofs and the twin turquoise domes; the Dome in whitewash with the gold
frieze band, the mosaic drum and the great turquoise dome, gold oculus bosses on the baths; the Vizier's palace in the
Eram and Majorelle manner (tile spandrels, cobalt walls, turquoise arches, lemon shutters). Inside: gold on
everything the Sultan touches (the court set), lacquer, jade, saffron lanterns; rosewood and celadon in the bureaus;
jali and gilt lattice through the harem; electric light everywhere (civic and rich).

## Assumptions and open points

- The enlarged footprints keep inside `CIT_POLY` and off the other sites, but the build will re-square them to the 8 m
  grid and may nudge them as it nudged the Vizier's palace and the Dome before; the Vizier's palace could not grow to
  the 60 x 70 first proposed because the north-west wall cuts close to it.
- The citadel gate is drawn on the south wall facing the plaza; the build picks the gate's wall from the plaza's
  position, so it may sit a few metres along the wall from where E0 shows it.
- The Sultan has sons in the cage but no named heir; the Valide is assumed living. The envoys' house is new; the
  Grand Baths stay outside the wall as the build has them.
- Numbers assumed: the Sultan's own household about 80 (bearers, cooks, body servants, guards), the Dome about 200
  (the Valide's court, four consorts, favourites, sixty concubines, forty eunuchs, the kitchens), the Vizier's palace
  about 60 clerks, each officer's house 20 to 30, the gate company 80.
